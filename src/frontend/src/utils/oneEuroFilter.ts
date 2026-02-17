/**
 * One-Euro Filter — adaptive low-pass filter for noisy real-time signals
 *
 * Smooths slow movements heavily (eliminates jitter) while preserving
 * fast movements (low latency). Ideal for cursor/landmark positions.
 *
 * Reference: Géry Casiez et al., "1€ Filter", CHI 2012
 * https://gery.casiez.net/1euro/
 *
 * @ticket TCK-20260215-001
 */

import type { Point } from '../types/tracking';

export interface OneEuroFilterOptions {
  /** Minimum cutoff frequency in Hz. Lower = more smoothing. Default: 1.0 */
  minCutoff?: number;
  /** Speed coefficient. Higher = less lag during fast movements. Default: 0.007 */
  beta?: number;
  /** Cutoff frequency for derivative filter in Hz. Default: 1.0 */
  dCutoff?: number;
}

const DEFAULTS: Required<OneEuroFilterOptions> = {
  minCutoff: 1.0,
  beta: 0.007,
  dCutoff: 1.0,
};

/**
 * Low-pass filter with configurable cutoff frequency.
 * Uses exponential smoothing: y[n] = α * x[n] + (1 - α) * y[n-1]
 */
class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  filter(value: number, alpha: number): number {
    if (this.s === null) {
      this.s = value;
    } else {
      this.s = alpha * value + (1 - alpha) * this.s;
    }
    this.y = value;
    return this.s;
  }

  lastValue(): number {
    return this.y ?? 0;
  }

  reset(): void {
    this.y = null;
    this.s = null;
  }
}

/**
 * Compute smoothing factor α from cutoff frequency and sample rate.
 * α = 1 / (1 + τ / T) where τ = 1 / (2π * fc) and T = 1 / rate
 */
function smoothingFactor(rate: number, cutoff: number): number {
  const tau = 1.0 / (2.0 * Math.PI * cutoff);
  const te = 1.0 / rate;
  return 1.0 / (1.0 + tau / te);
}

/**
 * One-Euro filter for a single scalar value.
 */
export class OneEuroScalarFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private lastTime: number | null = null;

  constructor(options: OneEuroFilterOptions = {}) {
    const opts = { ...DEFAULTS, ...options };
    this.minCutoff = opts.minCutoff;
    this.beta = opts.beta;
    this.dCutoff = opts.dCutoff;
  }

  /**
   * Filter a value at the given timestamp.
   * @param value - Raw input value
   * @param timestamp - Timestamp in seconds
   * @returns Filtered value
   */
  filter(value: number, timestamp: number): number {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      this.dxFilter.filter(0, smoothingFactor(1, this.dCutoff));
      return this.xFilter.filter(value, 1.0);
    }

    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Guard against zero/negative dt
    const rate = dt > 0 ? 1.0 / dt : 60;

    // Estimate derivative (speed)
    const dAlpha = smoothingFactor(rate, this.dCutoff);
    const prevValue = this.xFilter.lastValue();
    const dx = dt > 0 ? (value - prevValue) / dt : 0;
    const edx = this.dxFilter.filter(dx, dAlpha);

    // Adaptive cutoff: faster movement → higher cutoff → less smoothing
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const alpha = smoothingFactor(rate, cutoff);

    return this.xFilter.filter(value, alpha);
  }

  reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }
}

/**
 * One-Euro filter for 2D points (x, y).
 * Uses independent filters for each axis.
 */
export class OneEuroPointFilter {
  private xFilter: OneEuroScalarFilter;
  private yFilter: OneEuroScalarFilter;

  constructor(options: OneEuroFilterOptions = {}) {
    this.xFilter = new OneEuroScalarFilter(options);
    this.yFilter = new OneEuroScalarFilter(options);
  }

  /**
   * Filter a point at the given timestamp.
   * @param point - Raw input point (normalized 0-1)
   * @param timestamp - Timestamp in seconds
   * @returns Filtered point
   */
  filter(point: Point, timestamp: number): Point {
    return {
      x: this.xFilter.filter(point.x, timestamp),
      y: this.yFilter.filter(point.y, timestamp),
    };
  }

  reset(): void {
    this.xFilter.reset();
    this.yFilter.reset();
  }
}
