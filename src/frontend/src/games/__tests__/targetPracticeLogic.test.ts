import { describe, expect, it } from 'vitest';

import {
  clamp01,
  distanceBetweenPoints,
  isPointInCircle,
  pickRandomPoint,
  pickSpacedPoints,
} from '../targetPracticeLogic';

describe('targetPracticeLogic', () => {
  it('clamps values to 0..1', () => {
    expect(clamp01(-4)).toBe(0);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(9)).toBe(1);
  });

  it('computes euclidean distance', () => {
    expect(distanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('checks circle hit correctly', () => {
    const center = { x: 0.5, y: 0.5 };
    expect(isPointInCircle({ x: 0.5, y: 0.5 }, center, 0.1)).toBe(true);
    expect(isPointInCircle({ x: 0.7, y: 0.5 }, center, 0.1)).toBe(false);
  });

  it('picks points inside margins', () => {
    const point = pickRandomPoint(0.5, 0.25, 0.2);
    expect(point.x).toBeGreaterThanOrEqual(0.2);
    expect(point.x).toBeLessThanOrEqual(0.8);
    expect(point.y).toBeGreaterThanOrEqual(0.2);
    expect(point.y).toBeLessThanOrEqual(0.8);
  });

  it('generates spaced points', () => {
    const sequence = [0.1, 0.1, 0.8, 0.8, 0.2, 0.8, 0.8, 0.2];
    let index = 0;
    const random = () => {
      const value = sequence[index % sequence.length];
      index += 1;
      return value;
    };

    const points = pickSpacedPoints(3, 0.2, 0.1, random);
    expect(points).toHaveLength(3);

    const d01 = distanceBetweenPoints(points[0].position, points[1].position);
    const d12 = distanceBetweenPoints(points[1].position, points[2].position);
    expect(d01).toBeGreaterThanOrEqual(0.2);
    expect(d12).toBeGreaterThanOrEqual(0.2);
  });
});
