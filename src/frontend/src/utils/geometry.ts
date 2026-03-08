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
