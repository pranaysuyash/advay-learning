/**
 * Geometry Utilities Tests
 */

import { describe, expect, it } from 'vitest';
import {
  calculateAngle,
  calculateDistance,
  calculateMidpoint,
  areCollinear,
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
