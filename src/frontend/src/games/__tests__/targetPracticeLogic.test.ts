import { describe, expect, it } from 'vitest';

import {
  Point,
  TargetPoint,
  clamp01,
  distanceBetweenPoints,
  isPointInCircle,
  pickRandomPoint,
  pickSpacedPoints,
} from '../targetPracticeLogic';

describe('clamp01', () => {
  it('returns 0 for negative values', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(-100)).toBe(0);
  });

  it('returns 1 for values greater than 1', () => {
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(100)).toBe(1);
  });

  it('returns value for in-range values', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(0.75)).toBe(0.75);
  });

  it('handles edge cases', () => {
    expect(clamp01(0.001)).toBe(0.001);
    expect(clamp01(0.999)).toBe(0.999);
  });
});

describe('distanceBetweenPoints', () => {
  it('calculates horizontal distance', () => {
    const dist = distanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 0 });
    expect(dist).toBe(3);
  });

  it('calculates vertical distance', () => {
    const dist = distanceBetweenPoints({ x: 0, y: 0 }, { x: 0, y: 4 });
    expect(dist).toBe(4);
  });

  it('calculates diagonal distance (3-4-5 triangle)', () => {
    const dist = distanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 });
    expect(dist).toBe(5);
  });

  it('calculates diagonal distance (5-12-13 triangle)', () => {
    const dist = distanceBetweenPoints({ x: 0, y: 0 }, { x: 5, y: 12 });
    expect(dist).toBe(13);
  });

  it('returns 0 for same point', () => {
    const dist = distanceBetweenPoints({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 });
    expect(dist).toBe(0);
  });

  it('handles normalized coordinates', () => {
    const dist = distanceBetweenPoints({ x: 0, y: 0 }, { x: 1, y: 1 });
    expect(dist).toBeCloseTo(1.414, 3);
  });
});

describe('isPointInCircle', () => {
  const center: Point = { x: 0.5, y: 0.5 };

  it('returns true for point at center', () => {
    expect(isPointInCircle(center, center, 0.1)).toBe(true);
  });

  it('returns true for point within radius', () => {
    expect(isPointInCircle({ x: 0.55, y: 0.5 }, center, 0.1)).toBe(true);
    expect(isPointInCircle({ x: 0.5, y: 0.45 }, center, 0.1)).toBe(true);
  });

  it('returns false for point outside radius', () => {
    expect(isPointInCircle({ x: 0.7, y: 0.5 }, center, 0.1)).toBe(false);
    expect(isPointInCircle({ x: 0.5, y: 0.8 }, center, 0.1)).toBe(false);
  });

  it('returns true for point exactly on edge', () => {
    expect(isPointInCircle({ x: 0.6, y: 0.5 }, center, 0.1)).toBe(true);
  });

  it('returns false for zero or negative radius', () => {
    expect(isPointInCircle(center, center, 0)).toBe(false);
    expect(isPointInCircle(center, center, -0.1)).toBe(false);
  });

  it('handles large radius', () => {
    expect(isPointInCircle({ x: 0, y: 0 }, center, 1)).toBe(true);
  });
});

describe('pickRandomPoint', () => {
  it('returns point with valid coordinates', () => {
    const point = pickRandomPoint(0.5, 0.5, 0.1);
    expect(point.x).toBeGreaterThanOrEqual(0);
    expect(point.x).toBeLessThanOrEqual(1);
    expect(point.y).toBeGreaterThanOrEqual(0);
    expect(point.y).toBeLessThanOrEqual(1);
  });

  it('respects margin parameter', () => {
    const margin = 0.2;
    const point = pickRandomPoint(0.5, 0.5, margin);
    expect(point.x).toBeGreaterThanOrEqual(margin);
    expect(point.x).toBeLessThanOrEqual(1 - margin);
    expect(point.y).toBeGreaterThanOrEqual(margin);
    expect(point.y).toBeLessThanOrEqual(1 - margin);
  });

  it('clamps margin to valid range', () => {
    const point1 = pickRandomPoint(0.5, 0.5, 0.5); // Too large
    expect(point1.x).toBeGreaterThanOrEqual(0.05); // Should use max 0.45
    expect(point1.x).toBeLessThanOrEqual(0.95);

    const point2 = pickRandomPoint(0.5, 0.5, 0); // Too small
    expect(point2.x).toBeGreaterThanOrEqual(0.05); // Should use min 0.05
  });

  it('uses provided random values', () => {
    const point = pickRandomPoint(0.25, 0.75, 0.1);
    // With margin 0.1, span is 0.8
    // x = 0.1 + 0.25 * 0.8 = 0.3
    expect(point.x).toBeCloseTo(0.3, 5);
    expect(point.y).toBeCloseTo(0.7, 5);
  });
});

describe('pickSpacedPoints', () => {
  it('returns empty array for zero count', () => {
    const points = pickSpacedPoints(0, 0.2, 0.1);
    expect(points).toHaveLength(0);
  });

  it('returns empty array for negative count', () => {
    const points = pickSpacedPoints(-1, 0.2, 0.1);
    expect(points).toHaveLength(0);
  });

  it('generates specified number of points', () => {
    const points = pickSpacedPoints(3, 0.2, 0.1);
    expect(points).toHaveLength(3);
  });

  it('assigns sequential IDs', () => {
    const points = pickSpacedPoints(5, 0.1, 0.1);
    expect(points[0].id).toBe(0);
    expect(points[1].id).toBe(1);
    expect(points[2].id).toBe(2);
    expect(points[3].id).toBe(3);
    expect(points[4].id).toBe(4);
  });

  it('returns points with valid coordinates', () => {
    const points = pickSpacedPoints(5, 0.2, 0.1);
    for (const point of points) {
      expect(point.position.x).toBeGreaterThanOrEqual(0);
      expect(point.position.x).toBeLessThanOrEqual(1);
      expect(point.position.y).toBeGreaterThanOrEqual(0);
      expect(point.position.y).toBeLessThanOrEqual(1);
    }
  });

  it('enforces minimum distance between points when possible', () => {
    // Use deterministic random to ensure reproducibility
    const sequence = [0.1, 0.1, 0.9, 0.9, 0.5, 0.5];
    let index = 0;
    const random = () => {
      const value = sequence[index % sequence.length];
      index += 1;
      return value;
    };

    const points = pickSpacedPoints(3, 0.3, 0.1, random);
    expect(points).toHaveLength(3);

    // Check distances between consecutive points
    const d01 = distanceBetweenPoints(points[0].position, points[1].position);
    const d12 = distanceBetweenPoints(points[1].position, points[2].position);
    expect(d01).toBeGreaterThanOrEqual(0.3);
    expect(d12).toBeGreaterThanOrEqual(0.3);
  });

  it('uses fallback when spacing is impossible', () => {
    // Request many points in small space - should still return points
    const points = pickSpacedPoints(10, 0.5, 0.1);
    expect(points).toHaveLength(10);
  });

  it('respects margin parameter', () => {
    const margin = 0.2;
    const points = pickSpacedPoints(5, 0.1, margin);

    for (const point of points) {
      expect(point.position.x).toBeGreaterThanOrEqual(margin);
      expect(point.position.x).toBeLessThanOrEqual(1 - margin);
      expect(point.position.y).toBeGreaterThanOrEqual(margin);
      expect(point.position.y).toBeLessThanOrEqual(1 - margin);
    }
  });
});

describe('integration scenarios', () => {
  it('can generate and check hits for multiple targets', () => {
    const targets = pickSpacedPoints(3, 0.2, 0.1);
    expect(targets).toHaveLength(3);

    // First target should be hittable
    const hit = isPointInCircle(targets[0].position, targets[0].position, 0.08);
    expect(hit).toBe(true);
  });

  it('can calculate distances between all generated targets', () => {
    const targets = pickSpacedPoints(4, 0.15, 0.1);

    const distances: number[] = [];
    for (let i = 0; i < targets.length - 1; i++) {
      distances.push(distanceBetweenPoints(targets[i].position, targets[i + 1].position));
    }

    expect(distances).toHaveLength(3);
    for (const dist of distances) {
      expect(dist).toBeGreaterThan(0);
    }
  });
});

describe('edge cases', () => {
  it('handles single point request', () => {
    const points = pickSpacedPoints(1, 0.2, 0.1);
    expect(points).toHaveLength(1);
    expect(points[0].id).toBe(0);
  });

  it('handles very large count request', () => {
    const points = pickSpacedPoints(100, 0.05, 0.05);
    expect(points).toHaveLength(100);
  });

  it('handles very small min distance', () => {
    const points = pickSpacedPoints(5, 0.01, 0.1);
    expect(points).toHaveLength(5);
  });

  it('handles zero margin', () => {
    const margin = 0;
    const points = pickSpacedPoints(3, 0.2, margin);
    expect(points).toHaveLength(3);
  });

  it('handles large margin', () => {
    const margin = 0.4;
    const points = pickSpacedPoints(2, 0.1, margin);
    expect(points).toHaveLength(2);
  });

  it('handles extreme coordinate values', () => {
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(1);
    expect(clamp01(NaN)).toBeNaN; // NaN is not clamped
  });
});

describe('type definitions', () => {
  it('Point interface is correctly implemented', () => {
    const point: Point = {
      x: 0.5,
      y: 0.5,
    };

    expect(typeof point.x).toBe('number');
    expect(typeof point.y).toBe('number');
  });

  it('TargetPoint interface is correctly implemented', () => {
    const target: TargetPoint = {
      id: 5,
      position: { x: 0.5, y: 0.5 },
    };

    expect(typeof target.id).toBe('number');
    expect(typeof target.position).toBe('object');
    expect(typeof target.position.x).toBe('number');
    expect(typeof target.position.y).toBe('number');
  });

  it('all generated targets have valid structure', () => {
    const targets = pickSpacedPoints(10, 0.1, 0.1);

    for (const target of targets) {
      expect(typeof target.id).toBe('number');
      expect(typeof target.position).toBe('object');
      expect(typeof target.position.x).toBe('number');
      expect(typeof target.position.y).toBe('number');
      expect(target.position.x).toBeGreaterThanOrEqual(0);
      expect(target.position.x).toBeLessThanOrEqual(1);
      expect(target.position.y).toBeGreaterThanOrEqual(0);
      expect(target.position.y).toBeLessThanOrEqual(1);
    }
  });
});
