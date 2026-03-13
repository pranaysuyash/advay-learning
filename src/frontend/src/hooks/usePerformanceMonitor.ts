/**
 * usePerformanceMonitor Hook
 * 
 * React hook for tracking performance in 3D games.
 * Tracks FPS, memory usage, frame drops, and reports to analytics on unmount.
 * 
 * Usage:
 * ```typescript
 * function My3DGame() {
 *   const { metrics, isLowFps, reset } = usePerformanceMonitor('My3DGame', {
 *     reportToAnalytics: true,
 *     fpsThreshold: 30,
 *   });
 *   
 *   // Access metrics for display
 *   console.log(`Current FPS: ${metrics.currentFps}`);
 *   
 *   return <Canvas>...</Canvas>;
 * }
 * ```
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  PerformanceMonitor, 
  PerformanceMetrics,
  FpsCounter,
} from '@/utils/performance';
import { logEvent } from '@/analytics';

export interface UsePerformanceMonitorOptions {
  /** Whether to report metrics to analytics on unmount */
  reportToAnalytics?: boolean;
  /** FPS threshold for warnings */
  fpsThreshold?: number;
  /** Log interval in ms (0 to disable) */
  logIntervalMs?: number;
  /** Callback when metrics update */
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  /** Callback when FPS drops below threshold */
  onLowFps?: (fps: number, threshold: number) => void;
  /** Whether to start monitoring immediately */
  autoStart?: boolean;
}

export interface UsePerformanceMonitorReturn {
  /** Current performance metrics */
  metrics: PerformanceMetrics;
  /** Whether current FPS is below threshold */
  isLowFps: boolean;
  /** Whether FPS is in warning range (threshold to threshold + 10) */
  isWarningFps: boolean;
  /** Start monitoring (if not auto-started) */
  start: () => void;
  /** Stop monitoring and get final metrics */
  stop: () => PerformanceMetrics;
  /** Reset all metrics */
  reset: () => void;
  /** Get current FPS */
  getCurrentFps: () => number;
  /** Performance monitor instance (for advanced use) */
  monitor: PerformanceMonitor | null;
}

/**
 * Default metrics for initial state
 */
const getDefaultMetrics = (gameName: string): PerformanceMetrics => ({
  gameName,
  startTime: performance.now(),
  averageFps: 60,
  minFps: 60,
  maxFps: 60,
  currentFps: 60,
  frameDrops: 0,
  slowFrames: 0,
  totalFrames: 0,
  devicePixelRatio: window.devicePixelRatio,
  screenResolution: `${window.innerWidth}x${window.innerHeight}`,
  wasHidden: false,
});

/**
 * Hook for monitoring 3D game performance
 */
export function usePerformanceMonitor(
  gameName: string,
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn {
  const {
    reportToAnalytics = true,
    fpsThreshold = 30,
    logIntervalMs = 0,
    onMetricsUpdate,
    onLowFps,
    autoStart = true,
  } = options;
  
  // Use refs for mutable values that shouldn't trigger re-renders
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const logIntervalRef = useRef<number | null>(null);
  const lastLogTimeRef = useRef<number>(0);
  const lowFpsCallbackRef = useRef(onLowFps);
  const metricsCallbackRef = useRef(onMetricsUpdate);
  
  // Keep callbacks up to date
  useEffect(() => {
    lowFpsCallbackRef.current = onLowFps;
    metricsCallbackRef.current = onMetricsUpdate;
  }, [onLowFps, onMetricsUpdate]);
  
  // State for metrics (throttled updates)
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() => getDefaultMetrics(gameName));
  const [isLowFps, setIsLowFps] = useState(false);
  const [isWarningFps, setIsWarningFps] = useState(false);
  
  // Initialize monitor
  useEffect(() => {
    // Create monitor with callback
    monitorRef.current = new PerformanceMonitor(gameName, (updatedMetrics) => {
      // Throttle state updates to every ~250ms to avoid React overhead
      const now = performance.now();
      if (now - lastLogTimeRef.current > 250) {
        setMetrics(updatedMetrics);
        setIsLowFps(updatedMetrics.currentFps < fpsThreshold);
        setIsWarningFps(
          updatedMetrics.currentFps >= fpsThreshold && 
          updatedMetrics.currentFps < fpsThreshold + 10
        );
        lastLogTimeRef.current = now;
        
        // Call user callback
        if (metricsCallbackRef.current) {
          metricsCallbackRef.current(updatedMetrics);
        }
        
        // Check for low FPS
        if (updatedMetrics.currentFps < fpsThreshold && lowFpsCallbackRef.current) {
          lowFpsCallbackRef.current(updatedMetrics.currentFps, fpsThreshold);
        }
      }
    });
    
    // Auto-start if enabled
    if (autoStart) {
      monitorRef.current.start();
    }
    
    // Cleanup on unmount
    return () => {
      if (monitorRef.current) {
        const finalMetrics = monitorRef.current.stop();
        
        // Report to analytics
        if (reportToAnalytics) {
          logEvent('performance_session_end', {
            gameName: finalMetrics.gameName,
            averageFps: finalMetrics.averageFps,
            minFps: finalMetrics.minFps,
            maxFps: finalMetrics.maxFps,
            frameDrops: finalMetrics.frameDrops,
            slowFrames: finalMetrics.slowFrames,
            totalFrames: finalMetrics.totalFrames,
            durationMs: finalMetrics.endTime && finalMetrics.startTime 
              ? finalMetrics.endTime - finalMetrics.startTime 
              : 0,
            memoryUsageMB: finalMetrics.memoryUsageMB,
            devicePixelRatio: finalMetrics.devicePixelRatio,
            screenResolution: finalMetrics.screenResolution,
            wasHidden: finalMetrics.wasHidden,
          });
        }
        
        monitorRef.current.dispose();
        monitorRef.current = null;
      }
      
      // Clear log interval
      if (logIntervalRef.current) {
        window.clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
    };
  }, [gameName, reportToAnalytics, fpsThreshold, autoStart]);
  
  // Set up periodic logging
  useEffect(() => {
    if (logIntervalMs > 0 && monitorRef.current) {
      logIntervalRef.current = window.setInterval(() => {
        const currentMetrics = monitorRef.current?.getMetrics();
        if (currentMetrics) {
          console.log(`[Performance:${gameName}]`, {
            fps: currentMetrics.currentFps,
            avg: currentMetrics.averageFps,
            drops: currentMetrics.frameDrops,
            memory: currentMetrics.memoryUsageMB?.toFixed(1) + 'MB',
          });
        }
      }, logIntervalMs);
      
      return () => {
        if (logIntervalRef.current) {
          window.clearInterval(logIntervalRef.current);
          logIntervalRef.current = null;
        }
      };
    }
  }, [logIntervalMs, gameName]);
  
  // Manual control callbacks
  const start = useCallback(() => {
    monitorRef.current?.start();
  }, []);
  
  const stop = useCallback(() => {
    const finalMetrics = monitorRef.current?.stop();
    return finalMetrics || getDefaultMetrics(gameName);
  }, [gameName]);
  
  const reset = useCallback(() => {
    monitorRef.current?.reset();
    setMetrics(getDefaultMetrics(gameName));
    setIsLowFps(false);
    setIsWarningFps(false);
  }, [gameName]);
  
  const getCurrentFps = useCallback(() => {
    return monitorRef.current?.getCurrentFps() || 60;
  }, []);
  
  return {
    metrics,
    isLowFps,
    isWarningFps,
    start,
    stop,
    reset,
    getCurrentFps,
    monitor: monitorRef.current,
  };
}

/**
 * Hook for simple FPS tracking (lightweight alternative)
 */
export function useFpsCounter(_gameName: string, targetFps: number = 60): {
  fps: number;
  isLow: boolean;
} {
  const [fps, setFps] = useState(60);
  const [isLow, setIsLow] = useState(false);
  const counterRef = useRef(new FpsCounter());
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef(0);
  
  useEffect(() => {
    const counter = counterRef.current;
    
    const loop = () => {
      const currentFps = counter.recordFrame();
      const now = performance.now();
      
      // Update state every 500ms
      if (now - lastUpdateRef.current > 500) {
        setFps(Math.round(currentFps));
        setIsLow(currentFps < targetFps);
        lastUpdateRef.current = now;
      }
      
      rafRef.current = requestAnimationFrame(loop);
    };
    
    rafRef.current = requestAnimationFrame(loop);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetFps]);
  
  return { fps, isLow };
}

export default usePerformanceMonitor;
