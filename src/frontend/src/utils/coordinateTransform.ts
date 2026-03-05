/**
 * Coordinate transformation utilities for hand tracking
 *
 * Converts between normalized landmarks (0-1) and canvas pixels
 * accounting for devicePixelRatio and CSS transforms.
 *
 * @see docs/features/specs/001-hand-tracking-basics.md#coordinate-transform
 * @ticket TCK-20260228-001
 */

export interface ScreenCoordinate {
  x: number;
  y: number;
}

/**
 * Convert normalized point (0-1) to canvas pixel coordinates
 *
 * Accounts for:
 * - devicePixelRatio (high-DPI displays)
 * - CSS transforms on canvas container
 * - responsive canvas sizing
 *
 * @param canvas - The HTMLCanvasElement being drawn to
 * @param normalizedPoint - Point in normalized [0,1] space from MediaPipe
 * @returns Point in actual canvas pixel coordinates
 *
 * @example
 * ```tsx
 * const canvas = canvasRef.current;
 * const landmark = { x: 0.5, y: 0.3 }; // from MediaPipe
 * const pixel = getCanvasCoordinates(canvas, landmark);
 * ctx.beginPath();
 * ctx.arc(pixel.x, pixel.y, 10, 0, Math.PI * 2);
 * ctx.stroke();
 * ```
 */
export function getCanvasCoordinates(
  canvas: HTMLCanvasElement | null,
  normalizedPoint: { x: number; y: number },
): { x: number; y: number } | null {
  // Null guard - prevents game crashes during component mount
  if (!canvas) {
    return null;
  }

  // Get CSS pixel dimensions (accounts for transforms, responsive sizing)
  const rect = canvas.getBoundingClientRect();

  // Get actual device pixel ratio (for high-DPI displays)
  const dpr = window.devicePixelRatio || 1;

  // Clamp normalized coordinates to valid range [0, 1] - prevents off-screen rendering bugs
  const clampedX = Math.max(0, Math.min(1, normalizedPoint.x));
  const clampedY = Math.max(0, Math.min(1, normalizedPoint.y));

  // Convert normalized [0,1] to actual canvas pixels
  return {
    x: clampedX * rect.width * dpr,
    y: clampedY * rect.height * dpr,
  };
}

/**
 * Convert canvas pixel coordinates back to normalized [0,1] space
 *
 * Useful for: hit-testing, comparing against normalized landmarks
 *
 * @param canvas - The HTMLCanvasElement
 * @param pixelPoint - Point in canvas pixel coordinates
 * @returns Point in normalized [0,1] space
 */
export function getNormalizedCoordinates(
  canvas: HTMLCanvasElement | null,
  pixelPoint: { x: number; y: number },
): { x: number; y: number } | null {
  if (!canvas) {
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  return {
    x: pixelPoint.x / (rect.width * dpr),
    y: pixelPoint.y / (rect.height * dpr),
  };
}

/**
 * Check if a point is within a circular hit area
 *
 * @param point - Point to test (in same coordinate space as center/radius)
 * @param center - Center of hit circle
 * @param radius - Radius of hit circle (in same units as point/center)
 * @returns True if point is within circle
 */
export function isPointInCircle(
  point: { x: number; y: number },
  center: { x: number; y: number },
  radius: number,
): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

export interface CoverMapOptions {
  mirrored?: boolean;
  clamp?: boolean;
}

export function mapNormalizedPointToCover(
  point: { x: number; y: number },
  source: { width: number; height: number },
  target: { width: number; height: number },
  options: CoverMapOptions = {},
): { x: number; y: number } {
  const srcW = Math.max(1, source.width);
  const srcH = Math.max(1, source.height);
  const dstW = Math.max(1, target.width);
  const dstH = Math.max(1, target.height);

  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;

  let nx = point.x;
  let ny = point.y;

  if (srcAspect > dstAspect) {
    const scale = dstAspect / srcAspect;
    const pad = (1 - scale) / 2;
    nx = pad + nx * scale;
  } else {
    const scale = srcAspect / dstAspect;
    const pad = (1 - scale) / 2;
    ny = pad + ny * scale;
  }

  if (options.mirrored) {
    nx = 1 - nx;
  }

  if (options.clamp) {
    nx = Math.max(0, Math.min(1, nx));
    ny = Math.max(0, Math.min(1, ny));
  }

  return { x: nx, y: ny };
}

export function isWithinTarget(
  point: { x: number; y: number },
  target: { x: number; y: number },
  radius: number,
): boolean {
  return isPointInCircle(point, target, radius);
}

export class KalmanFilter {
  private q: number;
  private r: number;
  private x: number;
  private y: number;
  private p: number;
  private py: number;
  private initialized: boolean;
  private initializedY: boolean;

  constructor(processNoise = 0.01, measurementNoise = 0.1) {
    this.q = processNoise;
    this.r = measurementNoise;
    this.x = 0;
    this.y = 0;
    this.p = 1;
    this.py = 1;
    this.initialized = false;
    this.initializedY = false;
  }

  reset(value?: number) {
    if (typeof value === 'number') {
      this.x = value;
      this.initialized = true;
    } else {
      this.initialized = false;
      this.x = 0;
      this.initializedY = false;
      this.y = 0;
    }
    this.p = 1;
    this.py = 1;
  }

  filter(measurement: number): number {
    if (!this.initialized) {
      this.x = measurement;
      this.initialized = true;
      return this.x;
    }

    this.p += this.q;
    const k = this.p / (this.p + this.r);
    this.x = this.x + k * (measurement - this.x);
    this.p = (1 - k) * this.p;
    return this.x;
  }

  update(measurement: number): number;
  update(measurement: { x: number; y: number }): { x: number; y: number };
  update(
    measurement: number | { x: number; y: number },
  ): number | { x: number; y: number } {
    if (typeof measurement === 'number') {
      return this.filter(measurement);
    }

    const x = this.filter(measurement.x);

    if (!this.initializedY) {
      this.y = measurement.y;
      this.initializedY = true;
    } else {
      this.py += this.q;
      const ky = this.py / (this.py + this.r);
      this.y = this.y + ky * (measurement.y - this.y);
      this.py = (1 - ky) * this.py;
    }

    return { x, y: this.y };
  }
}
