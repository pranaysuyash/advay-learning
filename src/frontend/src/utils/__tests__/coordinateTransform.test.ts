import { describe, expect, it } from 'vitest';

import { mapNormalizedPointToCover } from '../coordinateTransform';

describe('mapNormalizedPointToCover', () => {
  it('keeps centered points centered when aspect ratios match', () => {
    const point = mapNormalizedPointToCover(
      { x: 0.5, y: 0.5 },
      { width: 200, height: 100 },
      { width: 400, height: 200 },
      { mirrored: false },
    );
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBeCloseTo(0.5, 5);
  });

  it('clamps points when cover scaling crops the video', () => {
    const point = mapNormalizedPointToCover(
      { x: 0.5, y: 0 },
      { width: 100, height: 200 },
      { width: 300, height: 200 },
      { mirrored: false },
    );
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBe(0);
  });

  it('mirrors x coordinates by default', () => {
    const point = mapNormalizedPointToCover(
      { x: 0.1, y: 0.5 },
      { width: 200, height: 100 },
      { width: 400, height: 200 },
    );
    expect(point.x).toBeCloseTo(0.9, 5);
  });
});
