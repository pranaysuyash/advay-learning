export function getLaneFromNormalizedX(x: number, laneCount: number = 3): number {
  if (laneCount <= 1) return 0;

  const clamped = Math.min(1, Math.max(0, x));
  const lane = Math.floor(clamped * laneCount);
  return Math.min(laneCount - 1, lane);
}

export function pickNextLane(
  currentLane: number,
  laneCount: number = 3,
  randomValue: number = Math.random(),
): number {
  if (laneCount <= 1) return 0;

  const normalized = Math.min(0.999999, Math.max(0, randomValue));
  const base = Math.floor(normalized * laneCount);
  if (base !== currentLane) return base;

  return (base + 1) % laneCount;
}
