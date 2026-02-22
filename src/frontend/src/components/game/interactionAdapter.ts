import type { Point } from '../../types/tracking';

export interface InteractionAdapterOptions {
  minHitRadius?: number;
  adaptiveBonus?: number;
}

export function getAdaptiveHitRadius(
  missCount: number,
  baseRadius: number,
  options: InteractionAdapterOptions = {},
): number {
  const minHitRadius = options.minHitRadius ?? baseRadius;
  const adaptiveBonus = options.adaptiveBonus ?? 0.06;
  const radius = missCount >= 3 ? baseRadius + adaptiveBonus : baseRadius;
  return Math.max(minHitRadius, radius);
}

export function toPercentPosition(point: Point): { left: string; top: string } {
  return {
    left: `${point.x * 100}%`,
    top: `${point.y * 100}%`,
  };
}
