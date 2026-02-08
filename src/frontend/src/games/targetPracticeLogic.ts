import type { Point } from '../types/tracking';

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function distanceBetweenPoints(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  if (radius <= 0) return false;
  return distanceBetweenPoints(point, center) <= radius;
}

export function pickRandomPoint(randomA: number, randomB: number, margin: number = 0.15): Point {
  const clampedMargin = Math.min(0.45, Math.max(0.05, margin));
  const span = 1 - clampedMargin * 2;

  return {
    x: clampedMargin + clamp01(randomA) * span,
    y: clampedMargin + clamp01(randomB) * span,
  };
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
      const candidate = pickRandomPoint(random(), random(), margin);
      const isFarEnough = targets.every(
        (target) => distanceBetweenPoints(target.position, candidate) >= minDistance,
      );

      if (isFarEnough) {
        accepted = candidate;
        break;
      }
    }

    if (!accepted) {
      // Fallback: place anyway to avoid deadlocks at high densities.
      accepted = pickRandomPoint(random(), random(), margin);
    }

    targets.push({ id, position: accepted });
  }

  return targets;
}
