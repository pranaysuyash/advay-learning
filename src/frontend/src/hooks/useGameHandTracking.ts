/**
 * useGameHandTracking hook - High-level game hand tracking manager
 *
 * Provides a unified interface for games to use hand tracking with
 * automatic initialization, error handling, and consistent configuration.
 *
 * This is the recommended hook for all games that need hand tracking.
 *
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 *
 * @example
 * ```tsx
 * const {
 *   isReady,
 *   cursor,
 *   pinch,
 *   startTracking,
 *   stopTracking,
 *   resetTracking
 * } = useGameHandTracking({
 *   gameName: 'ShapePop',
 *   targetFps: 30,
 *   smoothing: { minCutoff: 1.0, beta: 0.0 }
 * });
 *
 * useEffect(() => {
 *   if (isPlaying) startTracking();
 *   return () => stopTracking();
 * }, [isPlaying, startTracking, stopTracking]);
 * ```
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import Webcam from 'react-webcam';

import { useHandTracking } from './useHandTracking';
import { useHandTrackingRuntime } from './useHandTrackingRuntime';
import type { HandTrackingRuntimeMeta } from './useHandTrackingRuntime';
import { useVisionWorkerRuntime } from './useVisionWorkerRuntime';
import { useGameLoop } from './useGameLoop';
import type {
  UseHandTrackingOptions,
  TrackedHandFrame,
  PinchOptions,
  OneEuroFilterOptions,
} from '../types/tracking';
import { createDefaultPinchState } from '../utils/pinchDetection';
import type { VisionWorkerTransferMode } from '../workers/vision.protocol';

const env = (import.meta as any).env ?? {};
const VISION_WORKER_ENABLED_BY_ENV =
  String(env.VITE_VISION_WORKER_ENABLED ?? 'true').toLowerCase() !== 'false';
const VISION_WORKER_FORCE_MAIN_THREAD =
  String(env.VITE_VISION_WORKER_FORCE_MAIN_THREAD ?? 'false').toLowerCase() ===
  'true';

export type GameHandTrackingRuntimeMode = 'main-thread' | 'worker';

interface WorkerRuntimeConfig {
  enabled: boolean;
  targetFps?: number;
  transferMode?: VisionWorkerTransferMode;
}

export interface UseGameHandTrackingOptions {
  /** Name of the game for logging/debugging */
  gameName: string;
  /** Hand tracking configuration */
  handTracking?: UseHandTrackingOptions;
  /** Pinch detection configuration */
  pinch?: PinchOptions;
  /** Target FPS for hand tracking */
  targetFps?: number;
  /** One-Euro filter options for smoothing */
  smoothing?: OneEuroFilterOptions | false;
  /** Whether to reset pinch state when no hands detected */
  resetPinchOnNoHand?: boolean;
  /** Callback for hand tracking errors */
  onError?: (error: Error) => void;
  /** Callback when hand tracking is ready */
  onReady?: () => void;
  /** Callback when hand tracking stops */
  onStopped?: () => void;
  /** External webcam ref. If omitted, hook creates one. */
  webcamRef?: RefObject<Webcam | null>;
  /** Optional controlled running mode for migration from low-level hooks. */
  isRunning?: boolean;
  /** Optional runtime frame callback for migration from low-level hooks. */
  onFrame?: (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => void;
  /** Optional callback when no video frame is available. */
  onNoVideoFrame?: () => void;
  /** Runtime execution mode. Defaults to worker when supported and enabled. */
  runtimeMode?: GameHandTrackingRuntimeMode;
  /** Worker runtime config used when runtimeMode='worker'. */
  workerConfig?: WorkerRuntimeConfig;
  /** Called when runtime falls back from worker mode to main thread. */
  onRuntimeFallback?: (reason: string) => void;
}

export interface UseGameHandTrackingReturn {
  /** Whether hand tracking is ready and running */
  isReady: boolean;
  /** Current cursor position (normalized 0-1) */
  cursor: { x: number; y: number } | null;
  /** Current pinch state */
  pinch: {
    isPinching: boolean;
    distance: number;
    transition: 'start' | 'continue' | 'release' | 'none';
  };
  /** Start hand tracking */
  startTracking: () => Promise<void>;
  /** Stop hand tracking */
  stopTracking: () => void;
  /** Reset hand tracking state */
  resetTracking: () => void;
  /** Force reinitialize hand tracking */
  reinitialize: () => Promise<void>;
  /** Current FPS */
  fps: number;
  /** Average FPS */
  averageFps: number;
  /** Error state */
  error: Error | null;
  /** Loading state */
  isLoading: boolean;
  /** Webcam ref to bind in page components */
  webcamRef: RefObject<Webcam | null>;
}

export function resolveHandTrackingRuntimeMode(params: {
  requestedMode?: GameHandTrackingRuntimeMode;
  workerConfig?: WorkerRuntimeConfig;
  workerSupported: boolean;
}): GameHandTrackingRuntimeMode {
  if (VISION_WORKER_FORCE_MAIN_THREAD) return 'main-thread';
  if (params.requestedMode === 'main-thread') return 'main-thread';
  if (!VISION_WORKER_ENABLED_BY_ENV) return 'main-thread';
  if (params.workerConfig && !params.workerConfig.enabled) return 'main-thread';
  if (!params.workerSupported) return 'main-thread';
  return params.requestedMode ?? 'worker';
}

/**
 * High-level hand tracking hook for games
 *
 * Manages the complete hand tracking lifecycle:
 * - MediaPipe initialization with fallback
 * - Runtime management with game loop
 * - Pinch detection and smoothing
 * - Error handling and recovery
 */
export function useGameHandTracking(
  options: UseGameHandTrackingOptions,
): UseGameHandTrackingReturn {
  const {
    gameName,
    handTracking = {},
    pinch = {},
    targetFps = 30,
    smoothing = { minCutoff: 1.0, beta: 0.0 },
    resetPinchOnNoHand = true,
    onError,
    onReady,
    onStopped,
    webcamRef: externalWebcamRef,
    isRunning,
    onFrame,
    onNoVideoFrame,
    runtimeMode,
    workerConfig,
    onRuntimeFallback,
  } = options;

  const internalWebcamRef = useRef<Webcam>(null);
  const webcamRef = externalWebcamRef ?? internalWebcamRef;
  const [isTracking, setIsTracking] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [pinchState, setPinchState] = useState(() =>
    createDefaultPinchState(pinch),
  );
  const [fps, setFps] = useState(0);
  const [averageFps, setAverageFps] = useState(0);
  const [runtimeFallbackReason, setRuntimeFallbackReason] = useState<
    string | null
  >(null);
  const workerRequestedByOptions =
    runtimeMode !== 'main-thread' &&
    (workerConfig?.enabled ?? true) &&
    VISION_WORKER_ENABLED_BY_ENV &&
    !VISION_WORKER_FORCE_MAIN_THREAD;

  // Track pinch state for transitions
  const previousPinchRef = useRef(pinchState);
  const pinchStateRef = useRef(pinchState);

  // Hand tracking hooks
  const {
    landmarker,
    isLoading: isModelLoading,
    error: handTrackingError,
    isReady: isHandTrackingReady,
    initialize: initializeHandTracking,
    reset: resetHandTracking,
  } = useHandTracking({
    numHands: 1,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
    ...handTracking,
  });

  const {
    isReady: isWorkerReady,
    error: workerError,
    isLoading: isWorkerLoading,
    supportsWorkerRuntime,
  } = useVisionWorkerRuntime({
    isRunning: (isRunning ?? isTracking) && runtimeFallbackReason === null,
    webcamRef,
    targetFps,
    handTracking: {
      numHands: handTracking.numHands ?? 1,
      minDetectionConfidence: handTracking.minDetectionConfidence ?? 0.3,
      minHandPresenceConfidence: handTracking.minHandPresenceConfidence ?? 0.3,
      minTrackingConfidence: handTracking.minTrackingConfidence ?? 0.3,
      delegate: handTracking.delegate ?? 'GPU',
      enableFallback: handTracking.enableFallback ?? true,
    },
    pinchOptions: pinch,
    resetPinchOnNoHand,
    workerConfig: {
      enabled:
        workerRequestedByOptions &&
        runtimeFallbackReason === null,
      targetFps: workerConfig?.targetFps,
      transferMode: workerConfig?.transferMode ?? 'bitmap',
    },
    onFrame: useCallback(
      (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => {
        if (frame.indexTip) {
          setCursor(frame.indexTip);
        } else {
          setCursor(null);
        }

        const currentPinch = frame.pinch.state;
        setPinchState((prevState) => ({
          ...prevState,
          isPinching: currentPinch.isPinching,
          distance: currentPinch.distance,
        }));

        previousPinchRef.current = currentPinch;
        pinchStateRef.current = currentPinch;
        onFrame?.(frame, meta);
      },
      [onFrame],
    ),
    onNoVideoFrame: useCallback(() => {
      setCursor(null);
      if (resetPinchOnNoHand) {
        const defaultState = createDefaultPinchState(pinch);
        setPinchState(defaultState);
        previousPinchRef.current = defaultState;
        pinchStateRef.current = defaultState;
      }
      onNoVideoFrame?.();
    }, [onNoVideoFrame, pinch, resetPinchOnNoHand]),
    onError: useCallback(
      (error: unknown) => {
        onError?.(error as Error);
      },
      [onError],
    ),
    onRuntimeFallback: useCallback(
      (reason: string) => {
        setRuntimeFallbackReason(reason);
        onRuntimeFallback?.(reason);
      },
      [onRuntimeFallback],
    ),
  });

  const activeRuntimeMode = resolveHandTrackingRuntimeMode({
    requestedMode: runtimeMode,
    workerConfig,
    workerSupported: supportsWorkerRuntime && runtimeFallbackReason === null,
  });
  const runtimeEnabled =
    activeRuntimeMode === 'worker'
      ? (isRunning ?? isTracking) && isWorkerReady
      : (isRunning ?? isTracking) && isHandTrackingReady;

  // Game loop for consistent timing
  useGameLoop({
    isRunning: runtimeEnabled,
    targetFps,
    onFrame: useCallback((_deltaTime, currentFps) => {
      setFps(currentFps);
      setAverageFps(currentFps); // Simplified for now, could implement proper averaging
    }, []),
  });

  // Hand tracking runtime
  useHandTrackingRuntime({
    isRunning: runtimeEnabled,
    handLandmarker: activeRuntimeMode === 'main-thread' ? landmarker : null,
    webcamRef,
    targetFps,
    pinchOptions: pinch,
    resetPinchOnNoHand,
    smoothing,
    onFrame: useCallback(
      (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => {
        // Update cursor position
        if (frame.indexTip) {
          setCursor(frame.indexTip);
        } else {
          setCursor(null);
        }

        // Update pinch state with transition detection
        const currentPinch = frame.pinch.state;
        setPinchState((prevState) => ({
          ...prevState,
          isPinching: currentPinch.isPinching,
          distance: currentPinch.distance,
        }));

        previousPinchRef.current = currentPinch;
        pinchStateRef.current = currentPinch;
        onFrame?.(frame, meta);
      },
      [activeRuntimeMode, onFrame, pinch, resetPinchOnNoHand, smoothing],
    ),
    onNoVideoFrame: useCallback(() => {
      setCursor(null);
      if (resetPinchOnNoHand) {
        const defaultState = createDefaultPinchState(pinch);
        setPinchState(defaultState);
        previousPinchRef.current = defaultState;
        pinchStateRef.current = defaultState;
      }
      onNoVideoFrame?.();
    }, [onNoVideoFrame, pinch, resetPinchOnNoHand]),
    onError: useCallback(
      (error: unknown) => {
        console.error(`[${gameName}] Hand tracking error:`, error);
        onError?.(error as Error);
      },
      [activeRuntimeMode, gameName, onError],
    ),
  });

  // Start tracking
  const startTracking = useCallback(async () => {
    if (isTracking) return;

    try {
      setIsTracking(true);

      // Initialize hand tracking if not ready
      if (
        activeRuntimeMode === 'main-thread' &&
        !isHandTrackingReady &&
        !isModelLoading
      ) {
        await initializeHandTracking();
      }

      onReady?.();
    } catch (error) {
      console.error(`[${gameName}] Failed to start tracking:`, error);
      onError?.(error as Error);
      setIsTracking(false);
    }
  }, [
    isTracking,
    isHandTrackingReady,
    isModelLoading,
    activeRuntimeMode,
    initializeHandTracking,
    gameName,
    onReady,
    onError,
  ]);

  useEffect(() => {
    if (!isRunning) return;
    if (activeRuntimeMode !== 'main-thread') return;
    if (isHandTrackingReady || isModelLoading) return;
    void initializeHandTracking();
  }, [
    activeRuntimeMode,
    initializeHandTracking,
    isHandTrackingReady,
    isModelLoading,
    isRunning,
  ]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    setIsTracking(false);
    setCursor(null);
    const defaultState = createDefaultPinchState(pinch);
    setPinchState(defaultState);
    previousPinchRef.current = defaultState;
    pinchStateRef.current = defaultState;

    onStopped?.();
  }, [isTracking, pinch, onStopped]);

  // Reset tracking
  const resetTracking = useCallback(() => {
    stopTracking();
    if (activeRuntimeMode === 'main-thread') {
      resetHandTracking();
    }
    // Clear any pending state
    setCursor(null);
    const defaultState = createDefaultPinchState(pinch);
    setPinchState(defaultState);
    previousPinchRef.current = defaultState;
    pinchStateRef.current = defaultState;
  }, [activeRuntimeMode, stopTracking, resetHandTracking, pinch]);

  // Reinitialize hand tracking
  const reinitialize = useCallback(async () => {
    if (activeRuntimeMode !== 'main-thread') return;
    resetHandTracking();
    if (isTracking) {
      await initializeHandTracking();
    }
  }, [activeRuntimeMode, resetHandTracking, isTracking, initializeHandTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isReady:
      (isRunning ?? isTracking) &&
      (activeRuntimeMode === 'worker'
        ? isWorkerReady && !isWorkerLoading && !workerError
        : isHandTrackingReady && !isModelLoading && !handTrackingError),
    cursor,
    pinch: {
      isPinching: pinchState.isPinching,
      distance: pinchState.distance,
      transition: pinchStateRef.current.isPinching
        ? previousPinchRef.current.isPinching
          ? 'continue'
          : 'start'
        : previousPinchRef.current.isPinching
          ? 'release'
          : 'none',
    },
    startTracking,
    stopTracking,
    resetTracking,
    reinitialize,
    fps,
    averageFps,
    error: activeRuntimeMode === 'worker' ? workerError : handTrackingError,
    isLoading: activeRuntimeMode === 'worker' ? isWorkerLoading : isModelLoading,
    webcamRef,
  };
}

export default useGameHandTracking;
