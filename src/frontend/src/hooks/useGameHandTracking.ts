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

import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

import { useHandTracking } from './useHandTracking';
import { useHandTrackingRuntime } from './useHandTrackingRuntime';
import { useGameLoop } from './useGameLoop';
import type {
  UseHandTrackingOptions,
  TrackedHandFrame,
  PinchOptions,
  OneEuroFilterOptions,
} from '../types/tracking';
import { createDefaultPinchState } from '../utils/pinchDetection';

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
  } = options;

  const webcamRef = useRef<Webcam>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [pinchState, setPinchState] = useState(() =>
    createDefaultPinchState(pinch),
  );
  const [fps, setFps] = useState(0);
  const [averageFps, setAverageFps] = useState(0);

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

  // Game loop for consistent timing
  useGameLoop({
    isRunning: isTracking && isHandTrackingReady,
    targetFps,
    onFrame: useCallback((_deltaTime, currentFps) => {
      setFps(currentFps);
      setAverageFps(currentFps); // Simplified for now, could implement proper averaging
    }, []),
  });

  // Hand tracking runtime
  const { } = useHandTrackingRuntime({
    isRunning: isTracking && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps,
    pinchOptions: pinch,
    resetPinchOnNoHand,
    smoothing,
    onFrame: useCallback(
      (frame: TrackedHandFrame) => {
        // Update cursor position
        if (frame.indexTip) {
          setCursor(frame.indexTip);
        } else {
          setCursor(null);
        }

        // Update pinch state with transition detection
        const currentPinch = frame.pinch.state;
        const previousPinch = previousPinchRef.current;

        if (!previousPinch.isPinching && currentPinch.isPinching) {
        } else if (previousPinch.isPinching && currentPinch.isPinching) {
        } else if (previousPinch.isPinching && !currentPinch.isPinching) {
        }

        setPinchState((prevState) => ({
          ...prevState,
          isPinching: currentPinch.isPinching,
          distance: currentPinch.distance,
        }));

        previousPinchRef.current = currentPinch;
        pinchStateRef.current = currentPinch;
      },
      [pinch, resetPinchOnNoHand, smoothing],
    ),
    onNoVideoFrame: useCallback(() => {
      setCursor(null);
      if (resetPinchOnNoHand) {
        const defaultState = createDefaultPinchState(pinch);
        setPinchState(defaultState);
        previousPinchRef.current = defaultState;
        pinchStateRef.current = defaultState;
      }
    }, [pinch, resetPinchOnNoHand]),
    onError: useCallback(
      (error: unknown) => {
        console.error(`[${gameName}] Hand tracking error:`, error);
        onError?.(error as Error);
      },
      [gameName, onError],
    ),
  });

  // Start tracking
  const startTracking = useCallback(async () => {
    if (isTracking) return;

    try {
      setIsTracking(true);

      // Initialize hand tracking if not ready
      if (!isHandTrackingReady && !isModelLoading) {
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
    initializeHandTracking,
    gameName,
    onReady,
    onError,
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
    resetHandTracking();
    // Clear any pending state
    setCursor(null);
    const defaultState = createDefaultPinchState(pinch);
    setPinchState(defaultState);
    previousPinchRef.current = defaultState;
    pinchStateRef.current = defaultState;
  }, [stopTracking, resetHandTracking, pinch]);

  // Reinitialize hand tracking
  const reinitialize = useCallback(async () => {
    resetHandTracking();
    if (isTracking) {
      await initializeHandTracking();
    }
  }, [resetHandTracking, isTracking, initializeHandTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isReady:
      isTracking &&
      isHandTrackingReady &&
      !isModelLoading &&
      !handTrackingError,
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
    error: handTrackingError,
    isLoading: isModelLoading,
  };
}

export default useGameHandTracking;
