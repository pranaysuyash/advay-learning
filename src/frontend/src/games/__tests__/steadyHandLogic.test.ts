import { describe, expect, it } from 'vitest';

import { pickTargetPoint, updateHoldProgress } from '../steadyHandLogic';

describe('steadyHandLogic', () => {
  it('increases progress while inside target', () => {
    const next = updateHoldProgress({
      current: 0.2,
      isInside: true,
      deltaTimeMs: 500,
      holdDurationMs: 2000,
    });

    expect(next).toBeCloseTo(0.45, 5);
  });

  it('decays progress while outside target', () => {
    const next = updateHoldProgress({
      current: 0.8,
      isInside: false,
      deltaTimeMs: 700,
      decayDurationMs: 1400,
    });

    expect(next).toBeCloseTo(0.3, 5);
  });

  it('clamps progress between 0 and 1', () => {
    expect(
      updateHoldProgress({ current: 0.95, isInside: true, deltaTimeMs: 500 }),
    ).toBe(1);
    expect(
      updateHoldProgress({ current: 0.05, isInside: false, deltaTimeMs: 500 }),
    ).toBe(0);
  });

  it('picks a target point within margins', () => {
    const point = pickTargetPoint(0.5, 0.25, 0.2);

    expect(point.x).toBeGreaterThanOrEqual(0.2);
    expect(point.x).toBeLessThanOrEqual(0.8);
    expect(point.y).toBeGreaterThanOrEqual(0.2);
    expect(point.y).toBeLessThanOrEqual(0.8);
  });
});
