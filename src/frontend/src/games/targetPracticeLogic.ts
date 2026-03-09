/**
 * Target Practice Game Logic
 *
 * NOTE: This file now delegates to centralized geometry utilities.
 * See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-001
 *
 * For new code, import directly from '../utils/geometry' instead.
 * INTENTIONAL_EXPORT_REMOVAL: clamp01
 */

import type { Point } from '../types/tracking';
import {
  calculateDistance,
  isPointInCircle as _isPointInCircle,
  pickRandomPointInMargin,
} from '../utils/geometry';

/**
 * @deprecated Use calculateDistance from '../utils/geometry' instead
 */
export function distanceBetweenPoints(a: Point, b: Point): number {
  return calculateDistance(a, b);
}

/**
 * @deprecated Use isPointInCircle from '../utils/geometry' instead
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  if (radius <= 0) return false;
  return _isPointInCircle(point, center, radius);
}

/**
 * @deprecated Use pickRandomPointInMargin from '../utils/geometry' instead
 */
export function pickRandomPoint(randomA: number, randomB: number, margin: number = 0.15): Point {
  return pickRandomPointInMargin(randomA, randomB, margin);
}

export interface TargetPoint {
  id: number;
  position: Point;
}

export function pickSpacedPoints(
  count: number,
  minDistance: number,
  margin: number,
  random: () => number = Math.random,
): TargetPoint[] {
  if (count <= 0) return [];

  const targets: TargetPoint[] = [];
  const maxAttempts = 300;

  for (let id = 0; id < count; id++) {
    let accepted: Point | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = pickRandomPointInMargin(random(), random(), margin);
      const isFarEnough = targets.every(
        (target) => calculateDistance(target.position, candidate) >= minDistance,
      );

      if (isFarEnough) {
        accepted = candidate;
        break;
      }
    }

    if (!accepted) {
      // Fallback: place anyway to avoid deadlocks at high densities.
      accepted = pickRandomPointInMargin(random(), random(), margin);
    }

    targets.push({ id, position: accepted });
  }

  return targets;
}
