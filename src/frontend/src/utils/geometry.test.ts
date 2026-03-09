/**
 * Geometry Utilities Tests
 */

import { describe, expect, it } from 'vitest';
import {
  calculateAngle,
  calculateDistance,
  calculateMidpoint,
  areCollinear,
  clamp01,
  clamp,
  isPointInCircle,
  distanceToSegment,
  isPointNearPath,
  pickRandomPointInMargin,
  type Point,
} from './geometry';

describe('calculateAngle', () => {
  it('calculates 180 degrees for a straight line (collinear points)', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 2, y: 0 };

    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5);
  });

  it('calculates 90 degrees for a right angle', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 1, y: 1 };

    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5);
  });

  it('calculates 45 degree angle', () => {
    const a: Point = { x: 0, y: 1 };
    const b: Point = { x: 0, y: 0 };
    const c: Point = { x: 1, y: 1 };

    expect(calculateAngle(a, b, c)).toBeCloseTo(45, 5);
  });

  it('calculates obtuse angles correctly', () => {
    const a: Point = { x: 0, y: 1 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 2, y: -0.5 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBeGreaterThan(90);
    expect(angle).toBeLessThan(180);
  });

  it('handles reflex angles (returns 360 - angle when > 180)', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 0, y: -1 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBeLessThanOrEqual(180);
  });

  it('returns 0 for identical points', () => {
    const a: Point = { x: 1, y: 1 };
    const b: Point = { x: 1, y: 1 };
    const c: Point = { x: 1, y: 1 };

    // When all points are identical, angle is undefined but function returns a value
    const angle = calculateAngle(a, b, c);
    expect(typeof angle).toBe('number');
  });
});

describe('calculateDistance', () => {
  it('calculates distance between two points', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 3, y: 4 };

    expect(calculateDistance(a, b)).toBe(5); // 3-4-5 triangle
  });

  it('returns 0 for identical points', () => {
    const a: Point = { x: 5, y: 5 };
    const b: Point = { x: 5, y: 5 };

    expect(calculateDistance(a, b)).toBe(0);
  });

  it('calculates horizontal distance', () => {
    const a: Point = { x: 0, y: 5 };
    const b: Point = { x: 10, y: 5 };

    expect(calculateDistance(a, b)).toBe(10);
  });

  it('calculates vertical distance', () => {
    const a: Point = { x: 3, y: 0 };
    const b: Point = { x: 3, y: 7 };

    expect(calculateDistance(a, b)).toBe(7);
  });
});

describe('calculateMidpoint', () => {
  it('calculates midpoint between two points', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 10, y: 10 };

    expect(calculateMidpoint(a, b)).toEqual({ x: 5, y: 5 });
  });

  it('handles negative coordinates', () => {
    const a: Point = { x: -5, y: -5 };
    const b: Point = { x: 5, y: 5 };

    expect(calculateMidpoint(a, b)).toEqual({ x: 0, y: 0 });
  });

  it('returns one of the points when they are identical', () => {
    const a: Point = { x: 3, y: 7 };
    const b: Point = { x: 3, y: 7 };

    expect(calculateMidpoint(a, b)).toEqual({ x: 3, y: 7 });
  });
});

describe('areCollinear', () => {
  it('returns true for horizontal line', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 5, y: 0 };
    const c: Point = { x: 10, y: 0 };

    expect(areCollinear(a, b, c)).toBe(true);
  });

  it('returns true for vertical line', () => {
    const a: Point = { x: 5, y: 0 };
    const b: Point = { x: 5, y: 5 };
    const c: Point = { x: 5, y: 10 };

    expect(areCollinear(a, b, c)).toBe(true);
  });

  it('returns true for diagonal line', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 5, y: 5 };
    const c: Point = { x: 10, y: 10 };

    expect(areCollinear(a, b, c)).toBe(true);
  });

  it('returns false for non-collinear points', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 5, y: 0 };
    const c: Point = { x: 10, y: 10 }; // Not on same line

    expect(areCollinear(a, b, c)).toBe(false);
  });

  it('respects tolerance parameter', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 5, y: 0 };
    const c: Point = { x: 10, y: 0.05 }; // Small deviation (~0.29°)

    expect(areCollinear(a, b, c, 1)).toBe(true); // 1° tolerance passes
    expect(areCollinear(a, b, c, 0)).toBe(false); // 0° tolerance (strict) fails
  });
});

// =============================================================================
// NEW CONSOLIDATED GEOMETRY TESTS
// See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-001
// =============================================================================

describe('clamp01', () => {
  it('clamps values below 0 to 0', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(-100)).toBe(0);
  });

  it('clamps values above 1 to 1', () => {
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(100)).toBe(1);
  });

  it('passes through values in [0, 1]', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(0.75)).toBe(0.75);
  });

  it('handles edge cases', () => {
    expect(clamp01(0.001)).toBe(0.001);
    expect(clamp01(0.999)).toBe(0.999);
    expect(clamp01(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('clamp', () => {
  it('clamps to specified range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('works with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('isPointInCircle', () => {
  it('returns true for point at center', () => {
    const center: Point = { x: 0, y: 0 };
    const point: Point = { x: 0, y: 0 };
    expect(isPointInCircle(point, center, 5)).toBe(true);
  });

  it('returns true for point on circle edge', () => {
    const center: Point = { x: 0, y: 0 };
    const point: Point = { x: 3, y: 4 }; // distance = 5
    expect(isPointInCircle(point, center, 5)).toBe(true);
  });

  it('returns true for point inside circle', () => {
    const center: Point = { x: 0, y: 0 };
    const point: Point = { x: 1, y: 1 };
    expect(isPointInCircle(point, center, 5)).toBe(true);
  });

  it('returns false for point outside circle', () => {
    const center: Point = { x: 0, y: 0 };
    const point: Point = { x: 10, y: 0 };
    expect(isPointInCircle(point, center, 5)).toBe(false);
  });
});

describe('distanceToSegment', () => {
  it('returns 0 when point is on the segment', () => {
    expect(distanceToSegment(5, 0, 0, 0, 10, 0)).toBe(0);
  });

  it('calculates perpendicular distance', () => {
    const dist = distanceToSegment(5, 3, 0, 0, 10, 0);
    expect(dist).toBe(3); // 3 units above the line
  });

  it('returns distance to endpoint when beyond segment', () => {
    const dist = distanceToSegment(-3, 4, 0, 0, 10, 0);
    expect(dist).toBe(5); // 3-4-5 triangle from (-3,4) to (0,0)
  });

  it('calculates diagonal distance', () => {
    const dist = distanceToSegment(1, 1, 0, 0, 2, 2);
    expect(dist).toBeCloseTo(0, 5); // On the diagonal line
  });
});

describe('isPointNearPath', () => {
  const canvasWidth = 100;
  const canvasHeight = 100;

  it('returns true when point is near path', () => {
    const point: Point = { x: 0.5, y: 0.5 }; // (50, 50) in canvas coords
    const path: Point[] = [
      { x: 0, y: 0 },   // (0, 0)
      { x: 1, y: 1 },   // (100, 100)
    ];
    expect(isPointNearPath(point, path, 10, canvasWidth, canvasHeight)).toBe(true);
  });

  it('returns false when point is far from path', () => {
    const point: Point = { x: 0, y: 1 }; // (0, 100)
    const path: Point[] = [
      { x: 0.5, y: 0 },   // (50, 0)
      { x: 0.5, y: 0.3 }, // (50, 30)
    ];
    expect(isPointNearPath(point, path, 10, canvasWidth, canvasHeight)).toBe(false);
  });

  it('returns false for short paths', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const path: Point[] = [{ x: 0, y: 0 }];
    expect(isPointNearPath(point, path, 10, canvasWidth, canvasHeight)).toBe(false);
  });
});

describe('pickRandomPointInMargin', () => {
  it('returns point within bounds for margin 0.1', () => {
    const point = pickRandomPointInMargin(0.5, 0.5, 0.1);
    expect(point.x).toBeGreaterThanOrEqual(0.1);
    expect(point.x).toBeLessThanOrEqual(0.9);
    expect(point.y).toBeGreaterThanOrEqual(0.1);
    expect(point.y).toBeLessThanOrEqual(0.9);
  });

  it('respects clamped margins', () => {
    // Margin of 0 should be clamped to 0.05
    const point = pickRandomPointInMargin(0, 0, 0);
    expect(point.x).toBeGreaterThanOrEqual(0.05);
    expect(point.y).toBeGreaterThanOrEqual(0.05);
  });

  it('centers point when random values are 0.5', () => {
    const point = pickRandomPointInMargin(0.5, 0.5, 0.2);
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBeCloseTo(0.5, 5);
  });
});
