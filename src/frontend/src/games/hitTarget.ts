import type { Point } from '../types/tracking';
import { isPointInCircle } from './targetPracticeLogic';

export interface CircularTarget {
  position: Point;
}

export function findHitTarget<T extends CircularTarget>(
  point: Point,
  targets: T[],
  radius: number,
): T | null {
  if (radius <= 0) return null;

  for (const target of targets) {
    if (isPointInCircle(point, target.position, radius)) {
      return target;
    }
  }

  return null;
}
