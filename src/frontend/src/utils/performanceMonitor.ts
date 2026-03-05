import { useCallback, useRef, useEffect } from 'react';

export interface PerformanceMetrics {
  fps: number;
  avgFps: number;
  droppedFrames: number;
}

export interface PerformanceMonitorConfig {
  sampleInterval?: number;
  warningThreshold?: number;
  onWarning?: (metrics: PerformanceMetrics) => void;
}

const DEFAULT_SAMPLE_INTERVAL = 1000;
const DEFAULT_WARNING_THRESHOLD = 20;

export function usePerformanceMonitor(config: PerformanceMonitorConfig = {}) {
  const {
    sampleInterval = DEFAULT_SAMPLE_INTERVAL,
    warningThreshold = DEFAULT_WARNING_THRESHOLD,
    onWarning,
  } = config;

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);
  const samplesRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const recordFrame = useCallback(() => {
    const now = performance.now();
    if (lastTimeRef.current > 0) {
      const delta = now - lastTimeRef.current;
      frameTimesRef.current.push(delta);

      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }

      if (delta > 33.33) {
        droppedFramesRef.current++;
      }
    }
    lastTimeRef.current = now;
  }, []);

  const getMetrics = useCallback((): PerformanceMetrics => {
    const frames = frameTimesRef.current;
    if (frames.length === 0) {
      return { fps: 60, avgFps: 60, droppedFrames: 0 };
    }

    const avgFrameTime = frames.reduce((a, b) => a + b, 0) / frames.length;
    const fps = Math.round(1000 / avgFrameTime);
    const avgFps = samplesRef.current.length > 0
      ? Math.round(samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length)
      : fps;

    return {
      fps,
      avgFps,
      droppedFrames: droppedFramesRef.current,
    };
  }, []);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const metrics = getMetrics();
      samplesRef.current.push(metrics.fps);
      if (samplesRef.current.length > 60) {
        samplesRef.current.shift();
      }

      if (metrics.fps < warningThreshold && onWarning) {
        onWarning(metrics);
      }
    }, sampleInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getMetrics, sampleInterval, warningThreshold, onWarning]);

  return {
    recordFrame,
    getMetrics,
  };
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private frameTimes: number[] = [];
  private lastTime = 0;
  private running = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.frameTimes.push(delta);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = Math.round(1000 / avgFrameTime);
    const droppedFrames = this.frameTimes.filter(t => t > 33.33).length;

    const metrics: PerformanceMetrics = { fps, avgFps: fps, droppedFrames };

    this.listeners.forEach(cb => cb(metrics));

    requestAnimationFrame(this.tick);
  };

  getMetrics(): PerformanceMetrics {
    if (this.frameTimes.length === 0) {
      return { fps: 60, avgFps: 60, droppedFrames: 0 };
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const fps = Math.round(1000 / avgFrameTime);

    return {
      fps,
      avgFps: fps,
      droppedFrames: this.frameTimes.filter(t => t > 33.33).length,
    };
  }
}
