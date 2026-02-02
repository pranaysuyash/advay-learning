/**
 * useGameLoop hook - Centralized game loop with FPS limiting
 *
 * Manages requestAnimationFrame loops with consistent timing,
 * FPS limiting via frame skipping, and automatic cleanup.
 *
 * Uses CONTROLLED mode: parent owns isRunning state. The hook follows
 * the prop and exposes requestStart/requestStop for signaling intent.
 *
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 *
 * @example
 * ```tsx
 * const [gameRunning, setGameRunning] = useState(false);
 * const { fps, requestStart, requestStop } = useGameLoop({
 *   onFrame: (deltaTime, fps) => {
 *     // deltaTime is in milliseconds
 *   },
 *   isRunning: gameRunning,
 *   onRunningChange: setGameRunning, // Parent controls state
 *   targetFps: 30,
 * });
 * ```
 */

import { useRef, useEffect, useCallback } from 'react';
import type { UseGameLoopOptions, UseGameLoopReturn } from '../types/tracking';

const DEFAULT_TARGET_FPS = 30;
const FPS_HISTORY_SIZE = 10;
const FPS_UPDATE_INTERVAL_MS = 1000;

/**
 * Hook for managing a game loop with consistent timing (CONTROLLED mode)
 *
 * The parent component owns isRunning state. This hook follows the prop
 * and calls onRunningChange when start/stop is requested internally.
 *
 * @param options - Configuration options
 * @returns Game loop state and controls
 */
export function useGameLoop(options: UseGameLoopOptions): UseGameLoopReturn {
  const {
    onFrame,
    isRunning,
    targetFps = DEFAULT_TARGET_FPS,
    onRunningChange,
  } = options;

  // Refs for stable callback access (avoids loop recreation)
  const onFrameRef = useRef(onFrame);
  const onRunningChangeRef = useRef(onRunningChange);
  const targetFpsRef = useRef(targetFps);

  // Loop timing refs
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  // FPS tracking refs
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const currentFpsRef = useRef<number>(0);
  const averageFpsRef = useRef<number>(0);

  // Keep refs in sync with latest values
  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    onRunningChangeRef.current = onRunningChange;
  }, [onRunningChange]);

  useEffect(() => {
    targetFpsRef.current = targetFps;
  }, [targetFps]);

  /**
   * Request to start the loop (signals parent via onRunningChange)
   */
  const requestStart = useCallback(() => {
    if (onRunningChangeRef.current) {
      onRunningChangeRef.current(true);
    }
  }, []);

  /**
   * Request to stop the loop (signals parent via onRunningChange)
   */
  const requestStop = useCallback(() => {
    if (onRunningChangeRef.current) {
      onRunningChangeRef.current(false);
    }
  }, []);

  /**
   * Core loop effect - runs when isRunning changes
   * Uses accumulator pattern for stable FPS limiting without setTimeout
   */
  useEffect(() => {
    if (!isRunning) {
      // Cleanup when stopped
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    // Reset timing state on start
    lastFrameTimeRef.current = 0;
    accumulatorRef.current = 0;
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = 0;
    fpsHistoryRef.current = [];
    currentFpsRef.current = 0;
    averageFpsRef.current = 0;

    /**
     * The game loop - always runs via rAF, skips work when not enough time passed
     */
    const loop = (currentTime: number): void => {
      // Initialize timing on first frame
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = currentTime;
        lastFpsUpdateRef.current = currentTime;
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      // Accumulator pattern: stable FPS limiting without setTimeout
      const frameInterval = 1000 / targetFpsRef.current;
      accumulatorRef.current += deltaTime;

      // Only execute frame when enough time has accumulated
      if (accumulatorRef.current >= frameInterval) {
        // Consume the interval (handles catch-up if we fell behind)
        const executedDeltaTime = accumulatorRef.current;
        accumulatorRef.current = accumulatorRef.current % frameInterval;

        // Track frame for FPS calculation
        frameCountRef.current++;

        // Update FPS metrics once per second
        if (currentTime - lastFpsUpdateRef.current >= FPS_UPDATE_INTERVAL_MS) {
          const measuredFps = frameCountRef.current;
          currentFpsRef.current = measuredFps;

          // Update moving average
          fpsHistoryRef.current.push(measuredFps);
          if (fpsHistoryRef.current.length > FPS_HISTORY_SIZE) {
            fpsHistoryRef.current.shift();
          }
          averageFpsRef.current = Math.round(
            fpsHistoryRef.current.reduce((a, b) => a + b, 0) /
              fpsHistoryRef.current.length,
          );

          frameCountRef.current = 0;
          lastFpsUpdateRef.current = currentTime;
        }

        // Call the frame callback with actual delta and current FPS
        onFrameRef.current(executedDeltaTime, currentFpsRef.current);
      }

      // Always schedule next rAF (frame skipping, not timer juggling)
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    // Cleanup on unmount or when isRunning becomes false
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    fps: currentFpsRef.current,
    averageFps: averageFpsRef.current,
    isRunning,
    requestStart,
    requestStop,
  };
}

export default useGameLoop;
