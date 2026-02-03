/**
 * useHandTracking hook - Centralized hand tracking with auto-fallback
 * 
 * Provides consistent MediaPipe HandLandmarker initialization across all games
 * with automatic GPU→CPU fallback and error handling.
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
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type {
  UseHandTrackingOptions,
  UseHandTrackingReturn,
} from '../types/tracking';

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
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track initialization attempts to prevent duplicate calls
  const isInitializingRef = useRef(false);
  
  useEffect(() => {
    // Reset mounted state on remount (React Strict Mode)
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      // Reset initializing flag on unmount so remount can reinitialize
      isInitializingRef.current = false;
    };
  }, []);
  
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
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
      );
      
      // Determine delegates to try
      const delegatesToTry: Array<'GPU' | 'CPU'> = opts.enableFallback
        ? opts.delegate === 'GPU'
          ? ['GPU', 'CPU']
          : ['CPU', 'GPU']
        : [opts.delegate];
      
      let lastError: Error | null = null;
      let loadedLandmarker: HandLandmarker | null = null;
      
      for (const delegate of delegatesToTry) {
        try {
          if (IS_DEV) {
            console.log(`[useHandTracking] Trying ${delegate} delegate...`);
          }
          
          const lm = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate,
            },
            runningMode: 'VIDEO',
            numHands: opts.numHands,
            minHandDetectionConfidence: opts.minDetectionConfidence,
            minHandPresenceConfidence: opts.minHandPresenceConfidence,
            minTrackingConfidence: opts.minTrackingConfidence,
          });
          
          loadedLandmarker = lm;
          if (IS_DEV) {
            console.log(`[useHandTracking] Successfully loaded with ${delegate}`);
          }
          break;
        } catch (e) {
          lastError = e as Error;
          console.warn(`[useHandTracking] Failed with ${delegate}:`, e);
        }
      }
      
      if (!isMountedRef.current) {
        // Component unmounted during initialization, clean up
        loadedLandmarker?.close();
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
    landmarker?.close();
    setLandmarker(null);
    setError(null);
    setIsLoading(false);
    isInitializingRef.current = false;
  }, [landmarker]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (landmarker) {
        if (IS_DEV) {
          console.log('[useHandTracking] Cleaning up landmarker');
        }
        landmarker.close();
      }
    };
  }, [landmarker]);
  
  return {
    landmarker,
    isLoading,
    error,
    isReady: landmarker !== null && !isLoading && error === null,
    initialize,
    reset,
  };
}

export default useHandTracking;
