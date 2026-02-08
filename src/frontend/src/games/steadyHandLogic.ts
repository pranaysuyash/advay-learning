export interface HoldProgressOptions {
  current: number;
  isInside: boolean;
  deltaTimeMs: number;
  holdDurationMs?: number;
  decayDurationMs?: number;
}

export function updateHoldProgress(options: HoldProgressOptions): number {
  const {
    current,
    isInside,
    deltaTimeMs,
    holdDurationMs = 2500,
    decayDurationMs = 1400,
  } = options;

  if (deltaTimeMs <= 0) return current;

  const step = isInside
    ? deltaTimeMs / holdDurationMs
    : -(deltaTimeMs / decayDurationMs);

  const next = current + step;
  return Math.min(1, Math.max(0, next));
}

export function pickTargetPoint(randomA: number, randomB: number, margin: number = 0.2) {
  const clampedMargin = Math.min(0.45, Math.max(0.05, margin));
  const span = 1 - clampedMargin * 2;

  return {
    x: clampedMargin + Math.min(1, Math.max(0, randomA)) * span,
    y: clampedMargin + Math.min(1, Math.max(0, randomB)) * span,
  };
}
