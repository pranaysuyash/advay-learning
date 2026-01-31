/**
 * useGameLoop hook - Centralized game loop with FPS limiting
 * 
 * Manages requestAnimationFrame loops with consistent timing,
 * FPS limiting, and automatic cleanup.
 * 
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 * 
 * @example
 * ```tsx
 * const { fps, isRunning, start, stop } = useGameLoop({
 *   onFrame: (deltaTime, fps) => {
 *     // Update game state
 *   },
 *   isRunning: gameStarted,
 *   targetFps: 30,
 * });
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseGameLoopOptions, UseGameLoopReturn } from '../types/tracking';

const DEFAULT_TARGET_FPS = 30;
const FPS_HISTORY_SIZE = 10;

/**
 * Hook for managing a game loop with consistent timing
 * 
 * @param options - Configuration options
 * @returns Game loop state and controls
 */
export function useGameLoop(options: UseGameLoopOptions): UseGameLoopReturn {
  const { onFrame, isRunning: initialRunning, targetFps = DEFAULT_TARGET_FPS } = options;
  
  const [isRunning, setIsRunning] = useState(initialRunning);
  const [fps, setFps] = useState(0);
  const [averageFps, setAverageFps] = useState(0);
  
  // Refs for loop state
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const fpsHistoryRef = useRef<number[]>([]);
  const isRunningRef = useRef(isRunning);
  
  // Keep refs in sync with state
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  
  // Update running state when prop changes
  useEffect(() => {
    setIsRunning(initialRunning);
  }, [initialRunning]);
  
  /**
   * Calculate average FPS from history
   */
  const updateAverageFps = useCallback((currentFps: number) => {
    fpsHistoryRef.current.push(currentFps);
    if (fpsHistoryRef.current.length > FPS_HISTORY_SIZE) {
      fpsHistoryRef.current.shift();
    }
    const avg = fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length;
    setAverageFps(Math.round(avg));
  }, []);
  
  /**
   * The game loop
   */
  const loop = useCallback((currentTime: number) => {
    if (!isRunningRef.current) return;
    
    // Calculate delta time
    const deltaTime = lastTimeRef.current > 0 
      ? currentTime - lastTimeRef.current 
      : 0;
    
    lastTimeRef.current = currentTime;
    frameCountRef.current++;
    
    // Update FPS every second
    if (currentTime - lastFpsUpdateRef.current >= 1000) {
      const currentFps = frameCountRef.current;
      setFps(currentFps);
      updateAverageFps(currentFps);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = currentTime;
    }
    
    // Call the frame callback
    onFrame(deltaTime, fps);
    
    // Schedule next frame with FPS limiting
    if (isRunningRef.current) {
      const frameInterval = 1000 / targetFps;
      const nextFrameTime = lastTimeRef.current + frameInterval;
      const delay = Math.max(0, nextFrameTime - performance.now());
      
      if (delay > 0) {
        // Use setTimeout for precise timing when limiting FPS
        setTimeout(() => {
          if (isRunningRef.current) {
            rafIdRef.current = requestAnimationFrame(loop);
          }
        }, delay);
      } else {
        rafIdRef.current = requestAnimationFrame(loop);
      }
    }
  }, [onFrame, fps, targetFps, updateAverageFps]);
  
  /**
   * Start the game loop
   */
  const start = useCallback(() => {
    if (isRunningRef.current) return;
    
    console.log('[useGameLoop] Starting loop');
    setIsRunning(true);
    isRunningRef.current = true;
    lastTimeRef.current = 0;
    frameCountRef.current = 0;
    lastFpsUpdateRef.current = performance.now();
    fpsHistoryRef.current = [];
    
    rafIdRef.current = requestAnimationFrame(loop);
  }, [loop]);
  
  /**
   * Stop the game loop
   */
  const stop = useCallback(() => {
    console.log('[useGameLoop] Stopping loop');
    setIsRunning(false);
    isRunningRef.current = false;
    
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    lastTimeRef.current = 0;
    frameCountRef.current = 0;
  }, []);
  
  // Auto-start/stop based on isRunning prop
  useEffect(() => {
    if (isRunning && !rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(loop);
    } else if (!isRunning && rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isRunning, loop]);
  
  return {
    fps,
    averageFps,
    isRunning,
    start,
    stop,
  };
}

export default useGameLoop;
