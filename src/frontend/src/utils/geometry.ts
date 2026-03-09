/**
 * Geometry utilities for pose and hand tracking
 *
 * Provides angle calculation functions for body joint analysis
 * used in pose detection games like YogaAnimals.
 */

/**
 * A 2D point with x and y coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Calculate the angle between three points.
 *
 * Given three points a, b, and c, calculates the angle at point b
 * formed by the segments ba and bc.
 *
 * @param a - First point (one endpoint of the angle)
 * @param b - Second point (vertex of the angle)
 * @param c - Third point (other endpoint of the angle)
 * @returns Angle in degrees [0, 180]
 *
 * @example
 * ```ts
 * // Calculate right angle
 * const angle = calculateAngle(
 *   { x: 0, y: 0 },
 *   { x: 1, y: 0 },
 *   { x: 1, y: 1 }
 * );
 * // angle = 90
 * ```
 *
 * @example
 * ```ts
 * // Calculate arm angle (shoulder → elbow → wrist)
 * const armAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
 * ```
 */
export function calculateAngle(
  a: Point,
  b: Point,
  c: Point,
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}

/**
 * Calculate the distance between two points.
 *
 * @param a - First point
 * @param b - Second point
 * @returns Euclidean distance between the points
 */
export function calculateDistance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the midpoint between two points.
 *
 * @param a - First point
 * @param b - Second point
 * @returns Midpoint between a and b
 */
export function calculateMidpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

/**
 * Check if three points are collinear (form a straight line).
 *
 * @param a - First point
 * @param b - Second point
 * @param c - Third point
 * @param tolerance - Maximum allowed deviation from 180° (default: 1°)
 * @returns True if points are approximately collinear
 */
export function areCollinear(
  a: Point,
  b: Point,
  c: Point,
  tolerance = 1,
): boolean {
  const angle = calculateAngle(a, b, c);
  return angle >= 180 - tolerance;
}

// =============================================================================
// ADDITIONAL GEOMETRY UTILITIES (Consolidated from game logic files)
// See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-001
// =============================================================================

/**
 * Clamp a value to the range [0, 1].
 *
 * @param value - The value to clamp
 * @returns Value clamped between 0 and 1
 *
 * @example
 * ```ts
 * clamp01(1.5)  // returns 1
 * clamp01(-0.5) // returns 0
 * clamp01(0.5)  // returns 0.5
 * ```
 */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Clamp a value to a specified range.
 *
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Value clamped between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Check if a point is inside a circle.
 *
 * @param point - The point to check
 * @param center - Circle center
 * @param radius - Circle radius
 * @returns True if point is within or on the circle
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return calculateDistance(point, center) <= radius;
}

/**
 * Calculate the distance from a point to a line segment.
 *
 * @param px - Point x coordinate
 * @param py - Point y coordinate
 * @param x1 - Line segment start x
 * @param y1 - Line segment start y
 * @param x2 - Line segment end x
 * @param y2 - Line segment end y
 * @returns Distance from point to closest point on segment
 */
export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number;
  let yy: number;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is near a path (polyline).
 *
 * @param point - The point to check (normalized coordinates)
 * @param path - Array of points defining the path (normalized coordinates)
 * @param tolerance - Maximum distance to consider "near" (in pixels)
 * @param canvasWidth - Canvas width for denormalization
 * @param canvasHeight - Canvas height for denormalization
 * @returns True if point is within tolerance of any segment
 */
export function isPointNearPath(
  point: Point,
  path: Point[],
  tolerance: number,
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  if (path.length < 2) return false;

  const px = point.x * canvasWidth;
  const py = point.y * canvasHeight;

  for (let i = 0; i < path.length - 1; i++) {
    const x1 = path[i].x * canvasWidth;
    const y1 = path[i].y * canvasHeight;
    const x2 = path[i + 1].x * canvasWidth;
    const y2 = path[i + 1].y * canvasHeight;

    const dist = distanceToSegment(px, py, x1, y1, x2, y2);
    if (dist < tolerance) {
      return true;
    }
  }
  return false;
}

/**
 * Pick a random point within a margin area.
 *
 * @param randomA - Random value for x [0-1]
 * @param randomB - Random value for y [0-1]
 * @param margin - Margin from edges (0-0.5)
 * @returns Point within the margin-bounded area
 */
export function pickRandomPointInMargin(
  randomA: number,
  randomB: number,
  margin: number,
): Point {
  const clampedMargin = Math.min(0.45, Math.max(0.05, margin));
  const span = 1 - clampedMargin * 2;
  return {
    x: clampedMargin + clamp01(randomA) * span,
    y: clampedMargin + clamp01(randomB) * span,
  };
}
