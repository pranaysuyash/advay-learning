/**
 * usePerformanceMonitor Hook
 * 
 * Tracks FPS, memory usage, and frame drops for 3D games.
 * Only active in development mode to avoid production overhead.
 * 
 * @example
 * const { fps, isPerformant } = usePerformanceMonitor('DigitalJenga3D');
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  frameDrops: number;
  memoryUsed?: number;
  isPerformant: boolean;
}

export interface UsePerformanceMonitorReturn extends PerformanceMetrics {
  /** Reset all metrics */
  reset: () => void;
  /** Log current metrics to console */
  log: () => void;
}

export interface UsePerformanceMonitorOptions {
  targetFps?: number;
  warnThreshold?: number;
}

export function usePerformanceMonitor(
  gameName: string,
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn {
  const { warnThreshold = 30 } = options;
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const frameDropsRef = useRef(0);
  const isActiveRef = useRef(true);
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    averageFps: 0,
    minFps: 60,
    maxFps: 0,
    frameDrops: 0,
    isPerformant: true,
  });

  // Calculate and update metrics
  const updateMetrics = useCallback(() => {
    if (!isActiveRef.current) return;
    
    frameCountRef.current++;
    const currentTime = performance.now();
    const delta = currentTime - lastTimeRef.current;
    
    // Update every second
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      
      fpsHistoryRef.current.push(fps);
      // Keep last 60 seconds of history
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }
      
      // Calculate stats
      const averageFps = Math.round(
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length
      );
      const minFps = Math.min(...fpsHistoryRef.current);
      const maxFps = Math.max(...fpsHistoryRef.current);
      
      // Count frame drops
      if (fps < warnThreshold) {
        frameDropsRef.current++;
      }
      
      // Get memory if available
      const memoryUsed = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
      
      const isPerformant = averageFps >= warnThreshold;
      
      setMetrics({
        fps,
        averageFps,
        minFps,
        maxFps,
        frameDrops: frameDropsRef.current,
        memoryUsed: memoryUsed ? Math.round(memoryUsed / 1024 / 1024) : undefined,
        isPerformant,
      });
      
      // Warn in console if performance is poor
      if (!isPerformant && import.meta.env.DEV) {
        console.warn(`[Performance] ${gameName} running slowly: ${fps} FPS (avg: ${averageFps})`);
      }
      
      // Reset for next second
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
    
    requestAnimationFrame(updateMetrics);
  }, [gameName, warnThreshold]);

  // Start monitoring
  useEffect(() => {
    isActiveRef.current = true;
    const rafId = requestAnimationFrame(updateMetrics);
    
    return () => {
      isActiveRef.current = false;
      cancelAnimationFrame(rafId);
      
      // Log final metrics on unmount
      if (import.meta.env.DEV && fpsHistoryRef.current.length > 0) {
        console.log(`[Performance] ${gameName} session ended:`, {
          averageFps: Math.round(fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length),
          minFps: Math.min(...fpsHistoryRef.current),
          maxFps: Math.max(...fpsHistoryRef.current),
          frameDrops: frameDropsRef.current,
        });
      }
    };
  }, [updateMetrics, gameName]);

  const reset = useCallback(() => {
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
    fpsHistoryRef.current = [];
    frameDropsRef.current = 0;
    setMetrics({
      fps: 0,
      averageFps: 0,
      minFps: 60,
      maxFps: 0,
      frameDrops: 0,
      isPerformant: true,
    });
  }, []);

  const log = useCallback(() => {
    console.log(`[Performance] ${gameName} current metrics:`, metrics);
  }, [metrics, gameName]);

  return {
    ...metrics,
    reset,
    log,
  };
}

export function useFpsCounter(_gameName: string, targetFps: number = 60): {
  fps: number;
  isLow: boolean;
} {
  const [fps, setFps] = useState(60);
  const [isLow, setIsLow] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      frameCountRef.current += 1;
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      if (delta >= 500) {
        const currentFps = (frameCountRef.current * 1000) / delta;
        setFps(Math.round(currentFps));
        setIsLow(currentFps < targetFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetFps]);

  return { fps, isLow };
}

export default usePerformanceMonitor;
