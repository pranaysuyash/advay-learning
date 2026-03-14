/**
 * useHandTracking hook - Centralized hand tracking with auto-fallback
 *
 * Provides consistent MediaPipe HandLandmarker initialization across all games
 * with automatic GPU→CPU fallback and error handling.
 *
 * NOW USES VisionService as the source of truth for MediaPipe initialization.
 * This ensures consistent CDN URLs, model caching, and provider management.
 *
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 *
 * @example
 * ```tsx
 * const { landmarker, isLoading, isReady, initialize } = useHandTracking({
 *   numHands: 2,
 *   minDetectionConfidence: 0.3,
 *   enableFallback: true,
 * });
 *
 * useEffect(() => {
 *   if (isPlaying) initialize();
 * }, [isPlaying, initialize]);
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { visionService, type HandLandmarkerConfig } from '../services/ai/vision';
import type {
  UseHandTrackingOptions,
  UseHandTrackingReturn,
} from '../types/tracking';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

const IS_DEV = Boolean((import.meta as any)?.env?.DEV);

const DEFAULT_OPTIONS: Required<UseHandTrackingOptions> = {
  numHands: 2,
  minDetectionConfidence: 0.3,
  minHandPresenceConfidence: 0.3,
  minTrackingConfidence: 0.3,
  delegate: 'GPU',
  enableFallback: true,
};

/**
 * Hook for managing MediaPipe HandLandmarker
 *
 * Uses VisionService as the source of truth for initialization,
 * ensuring consistent CDN URLs and model caching across the app.
 *
 * @param options - Configuration options
 * @returns HandLandmarker instance and state
 */
export function useHandTracking(
  options: UseHandTrackingOptions = {}
): UseHandTrackingReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeDelegate, setActiveDelegate] = useState<'GPU' | 'CPU' | null>(null);

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track initialization attempts to prevent duplicate calls
  const isInitializingRef = useRef(false);
  // Track current delegate for fallback logic
  const currentDelegateRef = useRef(opts.delegate);
  const preferredDelegateRef = useRef<'GPU' | 'CPU'>(opts.delegate);

  useEffect(() => {
    // Reset mounted state on remount (React Strict Mode)
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Reset initializing flag on unmount so remount can reinitialize
      isInitializingRef.current = false;
    };
  }, []);

  useEffect(() => {
    preferredDelegateRef.current = opts.delegate;
    currentDelegateRef.current = opts.delegate;
  }, [opts.delegate]);

  /**
   * Initialize the hand landmarker
   * Tries preferred delegate first, then falls back if enabled
   */
  const initialize = useCallback(async () => {
    // Prevent duplicate initialization
    if (isInitializingRef.current || landmarker) return;
    isInitializingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      // Determine delegates to try
      const delegatesToTry: Array<'GPU' | 'CPU'> = opts.enableFallback
        ? preferredDelegateRef.current === 'GPU'
          ? ['GPU', 'CPU']
          : ['CPU', 'GPU']
        : [preferredDelegateRef.current];

      let lastError: Error | null = null;
      let loadedLandmarker: HandLandmarker | null = null;

      for (const delegate of delegatesToTry) {
        try {
          if (IS_DEV) {
            console.log(`[useHandTracking] Trying ${delegate} delegate...`);
          }

          // Reset service landmarker if switching delegates
          if (currentDelegateRef.current !== delegate) {
            visionService.resetHandLandmarker();
          }
          currentDelegateRef.current = delegate;

          const config: HandLandmarkerConfig = {
            numHands: opts.numHands,
            minDetectionConfidence: opts.minDetectionConfidence,
            minHandPresenceConfidence: opts.minHandPresenceConfidence,
            minTrackingConfidence: opts.minTrackingConfidence,
            delegate,
          };

          const lm = await visionService.getHandLandmarker(config);

          if (lm) {
            loadedLandmarker = lm;
            preferredDelegateRef.current = delegate;
            setActiveDelegate(delegate);
            if (IS_DEV) {
              console.log(`[useHandTracking] Successfully loaded with ${delegate}`);
            }
            break;
          } else {
            throw new Error(`VisionService returned null for ${delegate}`);
          }
        } catch (e) {
          lastError = e as Error;
          console.warn(`[useHandTracking] Failed with ${delegate}:`, e);
        }
      }

      if (!isMountedRef.current) {
        // Component unmounted during initialization, clean up
        if (loadedLandmarker) {
          visionService.resetHandLandmarker();
        }
        return;
      }

      if (loadedLandmarker) {
        setLandmarker(loadedLandmarker);
        setError(null);
      } else {
        throw lastError || new Error('Failed to initialize hand tracking with any delegate');
      }
    } catch (e) {
      console.error('[useHandTracking] Initialization failed:', e);
      if (isMountedRef.current) {
        setError(e as Error);
        setLandmarker(null);
        setActiveDelegate(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      isInitializingRef.current = false;
    }
  }, [
    landmarker,
    opts.delegate,
    opts.enableFallback,
    opts.minDetectionConfidence,
    opts.minHandPresenceConfidence,
    opts.minTrackingConfidence,
    opts.numHands,
  ]);

  /**
   * Reset the hook state
   * Useful for error recovery
   */
  const reset = useCallback(() => {
    // Only reset the service landmarker if we're the one using it
    if (landmarker) {
      visionService.resetHandLandmarker();
    }
    setLandmarker(null);
    setError(null);
    setIsLoading(false);
    setActiveDelegate(null);
    isInitializingRef.current = false;
    currentDelegateRef.current = preferredDelegateRef.current;
  }, [landmarker, opts.delegate]);

  // Cleanup on unmount - VisionService is a singleton, so we only reset landmarker
  // if this specific hook was the one that initialized it or if we are truly shutting down.
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // We don't automatically reset visionService here because other games might use it
      // but we do ensure our local state is clear.
    };
  }, []);

  return {
    landmarker,
    isLoading,
    error,
    isReady: landmarker !== null && !isLoading && error === null,
    activeDelegate,
    initialize,
    reset,
  };
}

export default useHandTracking;
