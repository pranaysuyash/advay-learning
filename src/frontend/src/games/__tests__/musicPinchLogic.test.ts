import { describe, expect, it } from 'vitest';

import { getLaneFromNormalizedX, pickNextLane } from '../musicPinchLogic';

describe('musicPinchLogic', () => {
  it('maps normalized x to lane indices', () => {
    expect(getLaneFromNormalizedX(0)).toBe(0);
    expect(getLaneFromNormalizedX(0.2)).toBe(0);
    expect(getLaneFromNormalizedX(0.5)).toBe(1);
    expect(getLaneFromNormalizedX(0.99)).toBe(2);
    expect(getLaneFromNormalizedX(1)).toBe(2);
  });

  it('clamps out-of-range values', () => {
    expect(getLaneFromNormalizedX(-2)).toBe(0);
    expect(getLaneFromNormalizedX(8)).toBe(2);
  });

  it('picks a different lane when random matches current', () => {
    expect(pickNextLane(1, 3, 0.34)).toBe(2);
  });

  it('uses random lane when different from current', () => {
    expect(pickNextLane(0, 3, 0.7)).toBe(2);
  });
});
