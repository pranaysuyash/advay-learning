/**
 * Performance Utilities for 3D Games
 * 
 * Lightweight performance monitoring that doesn't affect gameplay.
 * Includes FPS counter, memory tracker, frame drop detector, and performance logger.
 */

export interface PerformanceMetrics {
  /** Game identifier */
  gameName: string;
  /** Session start timestamp */
  startTime: number;
  /** Session end timestamp */
  endTime?: number;
  /** Average FPS over the session */
  averageFps: number;
  /** Minimum FPS recorded */
  minFps: number;
  /** Maximum FPS recorded */
  maxFps: number;
  /** Current FPS (last calculated) */
  currentFps: number;
  /** Number of frame drops detected */
  frameDrops: number;
  /** Number of slow frames (>33ms, <30 FPS) */
  slowFrames: number;
  /** Total frames rendered */
  totalFrames: number;
  /** Memory usage in MB (if available) */
  memoryUsageMB?: number;
  /** Peak memory usage in MB (if available) */
  peakMemoryUsageMB?: number;
  /** Load time in ms (time to first frame) */
  loadTimeMs?: number;
  /** Device pixel ratio */
  devicePixelRatio: number;
  /** Screen resolution */
  screenResolution: string;
  /** Whether the tab was hidden during session */
  wasHidden: boolean;
}

export interface FrameData {
  timestamp: number;
  deltaTime: number;
  fps: number;
  isSlowFrame: boolean;
}

/**
 * FPS Counter Class
 * Tracks frames per second with smoothing
 */
export class FpsCounter {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private readonly maxSamples: number;
  private currentFps: number = 60;
  private minFps: number = 60;
  private maxFps: number = 60;
  private totalFrames: number = 0;
  
  constructor(maxSamples: number = 60) {
    this.maxSamples = maxSamples;
  }
  
  /**
   * Record a frame and calculate FPS
   */
  recordFrame(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    // Calculate instant FPS
    const instantFps = delta > 0 ? 1000 / delta : 60;
    
    // Add to samples
    this.frames.push(instantFps);
    this.totalFrames++;
    
    // Keep only recent samples
    if (this.frames.length > this.maxSamples) {
      this.frames.shift();
    }
    
    // Calculate smoothed FPS (average of recent frames)
    this.currentFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    
    // Update min/max
    if (this.currentFps < this.minFps) {
      this.minFps = this.currentFps;
    }
    if (this.currentFps > this.maxFps && this.totalFrames > 10) {
      this.maxFps = this.currentFps;
    }
    
    return this.currentFps;
  }
  
  getCurrentFps(): number {
    return Math.round(this.currentFps);
  }
  
  getAverageFps(): number {
    return Math.round(this.currentFps);
  }
  
  getMinFps(): number {
    return Math.round(this.minFps);
  }
  
  getMaxFps(): number {
    return Math.round(this.maxFps);
  }
  
  getTotalFrames(): number {
    return this.totalFrames;
  }
  
  reset(): void {
    this.frames = [];
    this.lastTime = performance.now();
    this.currentFps = 60;
    this.minFps = 60;
    this.maxFps = 60;
    this.totalFrames = 0;
  }
}

/**
 * Memory Tracker Class
 * Tracks memory usage if the Performance Memory API is available
 */
export class MemoryTracker {
  private peakMemoryMB: number = 0;
  private samples: number[] = [];
  private readonly maxSamples: number;
  
  constructor(maxSamples: number = 30) {
    this.maxSamples = maxSamples;
  }
  
  /**
   * Check if memory API is available
   */
  isAvailable(): boolean {
    return 'memory' in performance && 
           performance.memory !== undefined &&
           'usedJSHeapSize' in (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
  }
  
  /**
   * Get current memory usage in MB
   */
  getCurrentMemoryMB(): number | undefined {
    if (!this.isAvailable()) return undefined;
    
    const memory = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    
    // Track peak
    if (usedMB > this.peakMemoryMB) {
      this.peakMemoryMB = usedMB;
    }
    
    // Add to samples
    this.samples.push(usedMB);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
    
    return usedMB;
  }
  
  /**
   * Get average memory usage
   */
  getAverageMemoryMB(): number | undefined {
    if (this.samples.length === 0) return undefined;
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
  }
  
  /**
   * Get peak memory usage
   */
  getPeakMemoryMB(): number {
    return this.peakMemoryMB;
  }
  
  reset(): void {
    this.peakMemoryMB = 0;
    this.samples = [];
  }
}

/**
 * Frame Drop Detector Class
 * Detects dropped frames and slow frames
 */
export class FrameDropDetector {
  private frameDrops: number = 0;
  private slowFrames: number = 0;
  private lastFrameTime: number = performance.now();
  private readonly targetFrameTime: number; // Target frame time in ms
  private readonly slowFrameThreshold: number; // Threshold for slow frame in ms
  
  constructor(targetFps: number = 60) {
    this.targetFrameTime = 1000 / targetFps;
    // A frame taking > 33ms is < 30 FPS
    this.slowFrameThreshold = 33.33;
  }
  
  /**
   * Check if a frame drop or slow frame occurred
   */
  checkFrame(): { isDrop: boolean; isSlow: boolean; deltaTime: number } {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    
    // Detect frame drop (frame took > 2x target time)
    const isDrop = deltaTime > this.targetFrameTime * 2;
    if (isDrop) {
      this.frameDrops++;
    }
    
    // Detect slow frame (< 30 FPS equivalent)
    const isSlow = deltaTime > this.slowFrameThreshold;
    if (isSlow) {
      this.slowFrames++;
    }
    
    return { isDrop, isSlow, deltaTime };
  }
  
  getFrameDrops(): number {
    return this.frameDrops;
  }
  
  getSlowFrames(): number {
    return this.slowFrames;
  }
  
  reset(): void {
    this.frameDrops = 0;
    this.slowFrames = 0;
    this.lastFrameTime = performance.now();
  }
}

/**
 * Performance Logger Class
 * Logs performance metrics with throttling to avoid console spam
 */
export class PerformanceLogger {
  private gameName: string;
  private logThrottleMs: number;
  private lastLogTime: number = 0;
  private slowFrameWarnings: number = 0;
  private readonly maxWarnings: number = 10;
  
  constructor(gameName: string, logThrottleMs: number = 5000) {
    this.gameName = gameName;
    this.logThrottleMs = logThrottleMs;
  }
  
  /**
   * Log a performance metric (throttled)
   */
  log(metric: string, value: number | string, force: boolean = false): void {
    const now = performance.now();
    
    if (force || now - this.lastLogTime > this.logThrottleMs) {
      console.log(`[Performance:${this.gameName}] ${metric}: ${value}`);
      this.lastLogTime = now;
    }
  }
  
  /**
   * Log FPS warning if below threshold
   */
  logFpsWarning(fps: number, threshold: number = 30): void {
    if (fps < threshold && this.slowFrameWarnings < this.maxWarnings) {
      console.warn(`[Performance:${this.gameName}] Low FPS detected: ${fps.toFixed(1)} (threshold: ${threshold})`);
      this.slowFrameWarnings++;
      
      if (this.slowFrameWarnings === this.maxWarnings) {
        console.warn(`[Performance:${this.gameName}] FPS warning limit reached, suppressing further warnings`);
      }
    }
  }
  
  /**
   * Log a slow frame
   */
  logSlowFrame(deltaTime: number): void {
    if (this.slowFrameWarnings < this.maxWarnings) {
      console.warn(`[Performance:${this.gameName}] Slow frame: ${deltaTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Log session summary
   */
  logSummary(metrics: PerformanceMetrics): void {
    console.log(`[Performance:${this.gameName}] Session Summary:`, {
      duration: metrics.endTime && metrics.startTime 
        ? `${((metrics.endTime - metrics.startTime) / 1000).toFixed(1)}s`
        : 'N/A',
      averageFps: metrics.averageFps,
      minFps: metrics.minFps,
      maxFps: metrics.maxFps,
      frameDrops: metrics.frameDrops,
      slowFrames: metrics.slowFrames,
      totalFrames: metrics.totalFrames,
      memoryUsage: metrics.memoryUsageMB ? `${metrics.memoryUsageMB.toFixed(1)}MB` : 'N/A',
    });
  }
  
  reset(): void {
    this.slowFrameWarnings = 0;
    this.lastLogTime = 0;
  }
}

/**
 * Comprehensive Performance Monitor
 * Combines FPS, memory, and frame drop tracking
 */
export class PerformanceMonitor {
  gameName: string;
  private fpsCounter: FpsCounter;
  private memoryTracker: MemoryTracker;
  private frameDropDetector: FrameDropDetector;
  private logger: PerformanceLogger;
  private isRunning: boolean = false;
  private rafId: number | null = null;
  private startTime: number = 0;
  private loadTimeMs?: number;
  private wasHidden: boolean = false;
  private onMetricsCallback?: (metrics: PerformanceMetrics) => void;
  
  constructor(gameName: string, onMetrics?: (metrics: PerformanceMetrics) => void) {
    this.gameName = gameName;
    this.fpsCounter = new FpsCounter();
    this.memoryTracker = new MemoryTracker();
    this.frameDropDetector = new FrameDropDetector();
    this.logger = new PerformanceLogger(gameName);
    this.onMetricsCallback = onMetrics;
    
    // Track visibility changes
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }
  
  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = performance.now();
    this.loadTimeMs = this.startTime - performance.timing?.navigationStart;
    
    this.logger.log('Session started', new Date().toISOString(), true);
    
    // Start monitoring loop
    this.monitorLoop();
  }
  
  /**
   * Stop performance monitoring
   */
  stop(): PerformanceMetrics {
    this.isRunning = false;
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    const metrics = this.getMetrics();
    this.logger.logSummary(metrics);
    
    // Clean up
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    return metrics;
  }
  
  /**
   * Get current metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    return {
      gameName: this.gameName,
      startTime: this.startTime,
      endTime: this.isRunning ? undefined : performance.now(),
      averageFps: this.fpsCounter.getAverageFps(),
      minFps: this.fpsCounter.getMinFps(),
      maxFps: this.fpsCounter.getMaxFps(),
      currentFps: this.fpsCounter.getCurrentFps(),
      frameDrops: this.frameDropDetector.getFrameDrops(),
      slowFrames: this.frameDropDetector.getSlowFrames(),
      totalFrames: this.fpsCounter.getTotalFrames(),
      memoryUsageMB: this.memoryTracker.getCurrentMemoryMB(),
      peakMemoryUsageMB: this.memoryTracker.getPeakMemoryMB(),
      loadTimeMs: this.loadTimeMs,
      devicePixelRatio: window.devicePixelRatio,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      wasHidden: this.wasHidden,
    };
  }
  
  /**
   * Get current FPS
   */
  getCurrentFps(): number {
    return this.fpsCounter.getCurrentFps();
  }
  
  /**
   * Check if FPS is below threshold
   */
  isLowFps(threshold: number = 30): boolean {
    return this.fpsCounter.getCurrentFps() < threshold;
  }
  
  private monitorLoop(): void {
    if (!this.isRunning) return;
    
    // Record frame
    const fps = this.fpsCounter.recordFrame();
    
    // Check for frame drops
    const { isSlow, deltaTime } = this.frameDropDetector.checkFrame();
    
    // Track memory
    this.memoryTracker.getCurrentMemoryMB();
    
    // Log warnings
    if (isSlow) {
      this.logger.logSlowFrame(deltaTime);
    }
    this.logger.logFpsWarning(fps);
    
    // Call metrics callback
    if (this.onMetricsCallback) {
      this.onMetricsCallback(this.getMetrics());
    }
    
    // Schedule next frame
    this.rafId = requestAnimationFrame(() => this.monitorLoop());
  }
  
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.wasHidden = true;
    }
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.fpsCounter.reset();
    this.memoryTracker.reset();
    this.frameDropDetector.reset();
    this.logger.reset();
    this.startTime = performance.now();
    this.wasHidden = false;
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

// Singleton instance for app-wide performance tracking
let globalMonitor: PerformanceMonitor | null = null;

/**
 * Get or create global performance monitor
 */
export function getGlobalPerformanceMonitor(gameName?: string): PerformanceMonitor {
  if (!globalMonitor && gameName) {
    globalMonitor = new PerformanceMonitor(gameName);
  } else if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor('global');
  }
  return globalMonitor;
}

/**
 * Dispose global performance monitor
 */
export function disposeGlobalPerformanceMonitor(): void {
  if (globalMonitor) {
    globalMonitor.dispose();
    globalMonitor = null;
  }
}

export default PerformanceMonitor;
