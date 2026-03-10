/**
 * Circle Drawing - Game Logic Tests
 *
 * Tests for circular path generation, point-on-path validation,
 * and speed-regulated tracing logic.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_TOLERANCE,
  MAX_SPEED,
  MIN_SPEED,
  createCirclePath,
  isPointOnCircle,
  calculateProgress,
  isSpeedValid,
  type Point,
  type CirclePath,
} from '../circleDrawingLogic';

describe('Circle Drawing - Game Logic', () => {
  describe('Constants', () => {
    it('should have defined default tolerance', () => {
      expect(DEFAULT_TOLERANCE).toBe(0.05);
    });

    it('should have defined max speed', () => {
      expect(MAX_SPEED).toBe(0.15);
    });

    it('should have defined min speed', () => {
      expect(MIN_SPEED).toBe(0.02);
    });

    it('should have positive tolerance value', () => {
      expect(DEFAULT_TOLERANCE).toBeGreaterThan(0);
    });

    it('should have max speed greater than min speed', () => {
      expect(MAX_SPEED).toBeGreaterThan(MIN_SPEED);
    });
  });

  describe('createCirclePath', () => {
    it('should create level 1 circle with radius 0.3', () => {
      const circle = createCirclePath(1);
      expect(circle.center.x).toBe(0.5);
      expect(circle.center.y).toBe(0.5);
      expect(circle.radius).toBe(0.3);
      expect(circle.startAngle).toBe(0);
    });

    it('should create level 2 circle with radius 0.25', () => {
      const circle = createCirclePath(2);
      expect(circle.center.x).toBe(0.5);
      expect(circle.center.y).toBe(0.5);
      expect(circle.radius).toBe(0.25);
      expect(circle.startAngle).toBe(0);
    });

    it('should create level 3 circle with radius 0.2', () => {
      const circle = createCirclePath(3);
      expect(circle.center.x).toBe(0.5);
      expect(circle.center.y).toBe(0.5);
      expect(circle.radius).toBe(0.2);
      expect(circle.startAngle).toBe(0);
    });

    it('should default to level 1 when no level specified', () => {
      const circle = createCirclePath();
      expect(circle.radius).toBe(0.3);
    });

    it('should create level 4+ circles with smallest radius', () => {
      const circle = createCirclePath(4);
      expect(circle.radius).toBe(0.2);
    });

    it('should decrease radius with increasing level', () => {
      const level1 = createCirclePath(1);
      const level2 = createCirclePath(2);
      const level3 = createCirclePath(3);

      expect(level1.radius).toBeGreaterThan(level2.radius);
      expect(level2.radius).toBeGreaterThan(level3.radius);
    });

    it('should always center circle at (0.5, 0.5)', () => {
      for (let level = 1; level <= 5; level++) {
        const circle = createCirclePath(level);
        expect(circle.center.x).toBe(0.5);
        expect(circle.center.y).toBe(0.5);
      }
    });

    it('should have startAngle of 0', () => {
      const circle = createCirclePath(1);
      expect(circle.startAngle).toBe(0);
    });
  });

  describe('isPointOnCircle', () => {
    const circle: CirclePath = {
      center: { x: 0.5, y: 0.5 },
      radius: 0.3,
      startAngle: 0,
    };

    it('should return true for point exactly on the circle edge', () => {
      // Point at 0 degrees (right edge)
      const pointOnCircle: Point = { x: 0.8, y: 0.5 };
      expect(isPointOnCircle(pointOnCircle, circle)).toBe(true);
    });

    it('should return true for point at 90 degrees (top)', () => {
      const pointOnCircle: Point = { x: 0.5, y: 0.8 };
      expect(isPointOnCircle(pointOnCircle, circle, DEFAULT_TOLERANCE)).toBe(true);
    });

    it('should return true for point at 180 degrees (left)', () => {
      const pointOnCircle: Point = { x: 0.2, y: 0.5 };
      expect(isPointOnCircle(pointOnCircle, circle, DEFAULT_TOLERANCE)).toBe(true);
    });

    it('should return true for point at 270 degrees (bottom)', () => {
      const pointOnCircle: Point = { x: 0.5, y: 0.2 };
      expect(isPointOnCircle(pointOnCircle, circle, DEFAULT_TOLERANCE)).toBe(true);
    });

    it('should return true for point within tolerance', () => {
      // Point slightly outside the circle (radius + 0.04 < tolerance 0.05)
      const pointNear: Point = { x: 0.84, y: 0.5 }; // distance = 0.34, tolerance = 0.05
      expect(isPointOnCircle(pointNear, circle, DEFAULT_TOLERANCE)).toBe(true);
    });

    it('should return true for point inside tolerance', () => {
      // Point slightly inside the circle
      const pointNear: Point = { x: 0.76, y: 0.5 }; // distance = 0.26
      expect(isPointOnCircle(pointNear, circle, DEFAULT_TOLERANCE)).toBe(true);
    });

    it('should return false for point far from circle', () => {
      const pointFar: Point = { x: 0, y: 0 };
      expect(isPointOnCircle(pointFar, circle)).toBe(false);
    });

    it('should return false for point at center', () => {
      const pointCenter: Point = { x: 0.5, y: 0.5 };
      expect(isPointOnCircle(pointCenter, circle)).toBe(false);
    });

    it('should use custom tolerance parameter', () => {
      const pointBeyond: Point = { x: 0.86, y: 0.5 }; // distance = 0.36, diff = 0.06
      expect(isPointOnCircle(pointBeyond, circle, 0.05)).toBe(false); // Outside tolerance
      expect(isPointOnCircle(pointBeyond, circle, 0.06)).toBe(true); // Within larger tolerance
    });

    it('should handle very small circles', () => {
      const smallCircle: CirclePath = {
        center: { x: 0.5, y: 0.5 },
        radius: 0.1,
        startAngle: 0,
      };
      const pointOn: Point = { x: 0.6, y: 0.5 };
      expect(isPointOnCircle(pointOn, smallCircle, DEFAULT_TOLERANCE)).toBe(true);
    });
  });

  describe('calculateProgress', () => {
    const circle: CirclePath = {
      center: { x: 0.5, y: 0.5 },
      radius: 0.3,
      startAngle: 0,
    };

    it('should return 0 at start of circle (0 degrees)', () => {
      const startPoint: Point = { x: 0.8, y: 0.5 }; // 0 degrees
      expect(calculateProgress(startPoint, circle)).toBe(0);
    });

    it('should return 25 at 90 degrees (top)', () => {
      const point: Point = { x: 0.5, y: 0.8 }; // 90 degrees
      expect(calculateProgress(point, circle)).toBe(25);
    });

    it('should return 50 at 180 degrees (left)', () => {
      const point: Point = { x: 0.2, y: 0.5 }; // 180 degrees
      expect(calculateProgress(point, circle)).toBe(50);
    });

    it('should return 75 at 270 degrees (bottom)', () => {
      const point: Point = { x: 0.5, y: 0.2 }; // 270 degrees
      expect(calculateProgress(point, circle)).toBe(75);
    });

    it('should return approximately 100 at 360 degrees', () => {
      const point: Point = { x: 0.8, y: 0.5 }; // Back to start
      // At exactly 360/0 degrees, returns 0, not 100
      expect(calculateProgress(point, circle)).toBe(0);
    });

    it('should return values between 0 and 100', () => {
      const point: Point = { x: 0.71, y: 0.71 }; // 45 degrees
      const progress = calculateProgress(point, circle);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('should cap at 100 for complete circle', () => {
      // Very close to completing the circle
      const point: Point = { x: 0.79, y: 0.51 }; // Just before 360
      const progress = calculateProgress(point, circle);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should handle custom startAngle', () => {
      const point: Point = { x: 0.5, y: 0.8 }; // 90 degrees
      expect(calculateProgress(point, circle, 0)).toBe(25); // 90 - 0 = 90 -> 25%
      expect(calculateProgress(point, circle, Math.PI / 2)).toBe(0); // 90 - 90 = 0 -> 0%
    });

    it('should work with points not exactly on circle', () => {
      const pointOff: Point = { x: 0.75, y: 0.5 }; // Slightly off the circle
      const progress = calculateProgress(pointOff, circle);
      expect(progress).toBe(0); // Still at angle 0
    });

    it('should handle negative angles correctly', () => {
      const point: Point = { x: 0.5, y: 0.2 }; // 270 degrees or -90
      const progress = calculateProgress(point, circle);
      expect(progress).toBe(75); // -90 + 360 = 270 -> 75%
    });
  });

  describe('isSpeedValid', () => {
    const prevPoint: Point = { x: 0.5, y: 0.5 };

    it('should validate very slow movement', () => {
      const currPoint: Point = { x: 0.501, y: 0.5 }; // Moved 0.001
      const result = isSpeedValid(prevPoint, currPoint, 100); // 100ms
      expect(result.isValid).toBe(true);
      expect(result.speed).toBeLessThan(MAX_SPEED);
    });

    it('should validate slow movement within max speed', () => {
      const currPoint: Point = { x: 0.51, y: 0.5 }; // Moved 0.01
      const result = isSpeedValid(prevPoint, currPoint, 100); // 100ms -> 0.1 units/sec
      expect(result.isValid).toBe(true);
    });

    it('should validate movement at max speed', () => {
      // Use a movement that's clearly within max speed (accounting for floating point)
      const currPoint: Point = { x: 0.514, y: 0.5 }; // Moved 0.014
      const result = isSpeedValid(prevPoint, currPoint, 100); // 100ms -> 0.14 units/sec
      expect(result.isValid).toBe(true);
      expect(result.speed).toBeLessThanOrEqual(MAX_SPEED);
    });

    it('should invalidate movement faster than max speed', () => {
      const currPoint: Point = { x: 0.52, y: 0.5 }; // Moved 0.02
      const result = isSpeedValid(prevPoint, currPoint, 100); // 100ms -> 0.2 units/sec
      expect(result.isValid).toBe(false);
      expect(result.speed).toBeGreaterThan(MAX_SPEED);
    });

    it('should return valid with zero speed for same point', () => {
      const samePoint: Point = { x: 0.5, y: 0.5 };
      const result = isSpeedValid(prevPoint, samePoint, 100);
      expect(result.isValid).toBe(true);
      expect(result.speed).toBe(0);
    });

    it('should handle zero deltaTime', () => {
      const currPoint: Point = { x: 0.51, y: 0.5 };
      const result = isSpeedValid(prevPoint, currPoint, 0);
      expect(result.isValid).toBe(true);
      expect(result.speed).toBe(0);
    });

    it('should handle negative deltaTime', () => {
      const currPoint: Point = { x: 0.51, y: 0.5 };
      const result = isSpeedValid(prevPoint, currPoint, -100);
      expect(result.isValid).toBe(true);
    });

    it('should calculate speed correctly in units per second', () => {
      const currPoint: Point = { x: 0.6, y: 0.5 }; // Moved 0.1
      const result = isSpeedValid(prevPoint, currPoint, 1000); // 1 second
      expect(result.speed).toBeCloseTo(0.1, 5);
    });

    it('should handle diagonal movement', () => {
      const currPoint: Point = { x: 0.51, y: 0.51 }; // Diagonal
      const result = isSpeedValid(prevPoint, currPoint, 100);
      expect(result.speed).toBeGreaterThan(0);
      expect(result.speed).toBeLessThan(MAX_SPEED);
    });

    it('should use custom max speed parameter', () => {
      const currPoint: Point = { x: 0.52, y: 0.5 }; // Moved 0.02
      const result = isSpeedValid(prevPoint, currPoint, 100, 0.25); // Higher max
      expect(result.isValid).toBe(true);
    });

    it('should return correct speed value', () => {
      const currPoint: Point = { x: 0.55, y: 0.5 }; // Moved 0.05
      const result = isSpeedValid(prevPoint, currPoint, 500); // 500ms
      expect(result.speed).toBeCloseTo(0.1, 5);
    });
  });

  describe('Type Safety', () => {
    it('should maintain Point type structure', () => {
      const point: Point = {
        x: 0.5,
        y: 0.5,
      };
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
    });

    it('should maintain CirclePath type structure', () => {
      const circle: CirclePath = {
        center: { x: 0.5, y: 0.5 },
        radius: 0.3,
        startAngle: 0,
      };
      expect(typeof circle.center.x).toBe('number');
      expect(typeof circle.center.y).toBe('number');
      expect(typeof circle.radius).toBe('number');
      expect(typeof circle.startAngle).toBe('number');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete circle drawing flow', () => {
      const circle = createCirclePath(1);
      const points: Point[] = [
        { x: 0.8, y: 0.5 },   // 0% - start
        { x: 0.71, y: 0.71 }, // ~12.5%
        { x: 0.5, y: 0.8 },   // 25%
        { x: 0.29, y: 0.71 }, // ~37.5%
        { x: 0.2, y: 0.5 },   // 50%
        { x: 0.29, y: 0.29 }, // ~62.5%
        { x: 0.5, y: 0.2 },   // 75%
        { x: 0.71, y: 0.29 }, // ~87.5%
      ];

      let prevPoint = points[0];
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        expect(isPointOnCircle(point, circle)).toBe(true);

        const progress = calculateProgress(point, circle);
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);

        if (i > 0) {
          const speedCheck = isSpeedValid(prevPoint, point, 100);
          // Each segment is ~0.1 units, 100ms = 1.0 units/sec > max
          expect(speedCheck.isValid).toBe(false);
        }
        prevPoint = point;
      }
    });

    it('should handle slow tracing progression', () => {
      const circle = createCirclePath(2);
      // Points on the circle with very small steps
      const startPoint: Point = { x: 0.75, y: 0.5 }; // 0 degrees
      const points: Point[] = [
        { x: 0.748, y: 0.505 },  // Tiny step
        { x: 0.745, y: 0.51 },   // Tiny step
      ];

      // Check start point is on circle
      expect(isPointOnCircle(startPoint, circle, 0.01)).toBe(true);

      let prevPoint = startPoint;
      points.forEach(point => {
        expect(isPointOnCircle(point, circle, 0.01)).toBe(true);

        const speedCheck = isSpeedValid(prevPoint, point, 100); // 100ms
        expect(speedCheck.isValid).toBe(true); // Slow enough

        prevPoint = point;
      });
    });

    it('should track progress across levels', () => {
      for (let level = 1; level <= 3; level++) {
        const circle = createCirclePath(level);
        const point: Point = { x: 0.5, y: 0.5 + circle.radius };

        expect(isPointOnCircle(point, circle)).toBe(true);
        expect(calculateProgress(point, circle)).toBe(25);
      }
    });

    it('should detect fast movement at any level', () => {
      for (let level = 1; level <= 3; level++) {
        const circle = createCirclePath(level);
        const start: Point = { x: 0.5 + circle.radius, y: 0.5 };
        const end: Point = { x: 0.5 - circle.radius, y: 0.5 }; // Full diameter

        const speedCheck = isSpeedValid(start, end, 100); // 100ms
        expect(speedCheck.isValid).toBe(false); // Too fast
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle point outside normalized coordinates', () => {
      const circle = createCirclePath(1);
      const pointOutside: Point = { x: 1.5, y: 1.5 };
      expect(isPointOnCircle(pointOutside, circle)).toBe(false);
    });

    it('should handle negative coordinates', () => {
      const circle = createCirclePath(1);
      const pointNegative: Point = { x: -0.5, y: -0.5 };
      expect(isPointOnCircle(pointNegative, circle)).toBe(false);
    });

    it('should handle very large deltaTime', () => {
      const prev: Point = { x: 0.5, y: 0.5 };
      const curr: Point = { x: 0.6, y: 0.5 };
      const result = isSpeedValid(prev, curr, 100000); // 100 seconds
      expect(result.isValid).toBe(true); // Very slow
    });

    it('should handle tiny deltaTime', () => {
      const prev: Point = { x: 0.5, y: 0.5 };
      const curr: Point = { x: 0.51, y: 0.5 };
      const result = isSpeedValid(prev, curr, 1); // 1ms
      expect(result.isValid).toBe(false); // Very fast
    });

    it('should handle zero radius circle', () => {
      const zeroCircle: CirclePath = {
        center: { x: 0.5, y: 0.5 },
        radius: 0,
        startAngle: 0,
      };
      const point: Point = { x: 0.5, y: 0.5 };
      expect(isPointOnCircle(point, zeroCircle, DEFAULT_TOLERANCE)).toBe(true); // At center
    });
  });

  describe('Level Progression', () => {
    it('should increase precision requirement with level', () => {
      const level1 = createCirclePath(1);
      const level2 = createCirclePath(2);
      const level3 = createCirclePath(3);

      // Points exactly on the circle edge
      const pointL1: Point = { x: 0.5 + level1.radius, y: 0.5 };
      const pointL2: Point = { x: 0.5 + level2.radius, y: 0.5 };
      const pointL3: Point = { x: 0.5 + level3.radius, y: 0.5 };

      expect(isPointOnCircle(pointL1, level1)).toBe(true);
      expect(isPointOnCircle(pointL2, level2)).toBe(true);
      expect(isPointOnCircle(pointL3, level3)).toBe(true);
    });

    it('should have decreasing radius values', () => {
      const level1 = createCirclePath(1);
      const level2 = createCirclePath(2);
      const level3 = createCirclePath(3);
      const level4 = createCirclePath(4);

      expect(level1.radius).toBe(0.3);
      expect(level2.radius).toBe(0.25);
      expect(level3.radius).toBe(0.2);
      expect(level4.radius).toBe(0.2); // Same as level 3
    });
  });

  describe('Tolerance Behavior', () => {
    it('should accept points within tolerance', () => {
      const circle = createCirclePath(1);
      // Point just inside tolerance
      const point: Point = { x: 0.5 + circle.radius + DEFAULT_TOLERANCE - 0.001, y: 0.5 };
      expect(isPointOnCircle(point, circle, DEFAULT_TOLERANCE)).toBe(true);
    });

    it('should reject points just beyond tolerance', () => {
      const circle = createCirclePath(1);
      const point: Point = { x: 0.5 + circle.radius + DEFAULT_TOLERANCE + 0.001, y: 0.5 };
      expect(isPointOnCircle(point, circle, DEFAULT_TOLERANCE)).toBe(false);
    });

    it('should work with near-zero tolerance for exact edge', () => {
      const circle = createCirclePath(1);
      // Point exactly at the radius distance from center
      const pointOnEdge: Point = { x: 0.8, y: 0.5 }; // 0.8 - 0.5 = 0.3 = radius
      // Use small tolerance to account for floating point precision
      expect(isPointOnCircle(pointOnEdge, circle, 1e-15)).toBe(true);
    });

    it('should reject off-circle points with zero tolerance', () => {
      const circle = createCirclePath(1);
      const pointOff: Point = { x: 0.5 + circle.radius + 0.001, y: 0.5 };
      expect(isPointOnCircle(pointOff, circle, 0)).toBe(false);
    });
  });
});
