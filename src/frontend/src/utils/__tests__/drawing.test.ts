import { describe, it, expect } from 'vitest';
import {
  smoothPoints,
  buildSegments,
  drawSegments,
  distance,
  shouldAddPoint,
  addBreakPoint,
} from '../drawing';

describe('drawing utilities', () => {
  describe('smoothPoints', () => {
    it('returns empty array for empty input', () => {
      expect(smoothPoints([])).toEqual([]);
    });
    
    it('returns same points for small arrays', () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
      expect(smoothPoints(points)).toEqual(points);
    });
    
    it('smooths points with Chaikin\'s corner cutting algorithm', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
      ];
      const smoothed = smoothPoints(points, 1);

      // Chaikin's algorithm produces more points (corners are cut)
      // Original: 5 points → After 1 iteration: more than 5 points
      expect(smoothed.length).toBeGreaterThan(points.length);

      // First point should be preserved
      expect(smoothed[0].x).toBe(0);
      expect(smoothed[0].y).toBe(0);

      // Last point should be preserved
      expect(smoothed[smoothed.length - 1].x).toBe(4);
      expect(smoothed[smoothed.length - 1].y).toBe(4);

      // Points should be on the line y=x (original was diagonal)
      smoothed.forEach(p => {
        expect(p.y).toBeCloseTo(p.x, 5);
      });
    });
  });
  
  describe('buildSegments', () => {
    it('returns single segment for continuous points', () => {
      const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }];
      const segments = buildSegments(points);
      
      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual(points);
    });
    
    it('splits on NaN break points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: NaN, y: NaN },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ];
      const segments = buildSegments(points);
      
      expect(segments).toHaveLength(2);
      expect(segments[0]).toHaveLength(2);
      expect(segments[1]).toHaveLength(2);
    });
    
    it('handles multiple break points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: NaN, y: NaN },
        { x: 1, y: 1 },
        { x: NaN, y: NaN },
        { x: 2, y: 2 },
      ];
      const segments = buildSegments(points);
      
      expect(segments).toHaveLength(3);
    });
  });

  describe('drawSegments', () => {
    it('applies smoothing for longer segments', () => {
      const calls: Array<[string, ...Array<number | string>]> = [];
      const ctx: any = {
        save: () => {},
        restore: () => {},
        beginPath: () => calls.push(['beginPath']),
        moveTo: (x: number, y: number) => calls.push(['moveTo', x, y]),
        lineTo: (x: number, y: number) => calls.push(['lineTo', x, y]),
        quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => calls.push(['quadraticCurveTo', cpx, cpy, x, y]),
        stroke: () => calls.push(['stroke']),
        strokeStyle: '',
        lineWidth: 0,
        lineCap: '',
        lineJoin: '',
        shadowColor: '',
        shadowBlur: 0,
      };

      const segment = [
        { x: 0, y: 0 },
        { x: 0.1, y: 0 },
        { x: 0.9, y: 0 }, // outlier spike that smoothing should dampen
        { x: 0.2, y: 0 },
        { x: 0.3, y: 0 },
      ];

      drawSegments(ctx, [segment], 100, 100, { color: '#fff', lineWidth: 10 });

      // Collect all x coordinates from lineTo and quadraticCurveTo calls
      const xValues: number[] = [];
      calls.forEach(([name, ...args]) => {
        if (name === 'lineTo') {
          xValues.push(args[0] as number);
        } else if (name === 'quadraticCurveTo') {
          // quadraticCurveTo(cpx, cpy, x, y) - extract both control point and end point x
          xValues.push(args[0] as number); // control point x
          xValues.push(args[2] as number); // end point x
        }
      });

      // Without smoothing we'd expect a value at x=90 (from the 0.9 outlier)
      // With Chaikin's smoothing, the extreme spike should be reduced or eliminated
      // Check that 90 is NOT in the x values (smoothing worked)
      expect(xValues).not.toContain(90);

      // The smoothing should produce intermediate values, not just the original points
      // We should have more x values than the original 5 points due to smoothing
      expect(xValues.length).toBeGreaterThan(5);

      // The smoothing should produce intermediate values, not just the original points
      // We should have more x values than the original 5 points due to smoothing
      expect(xValues.length).toBeGreaterThan(5);

      // All values should be non-negative
      xValues.forEach(x => {
        expect(x).toBeGreaterThanOrEqual(0);
      });
    });
  });
  
  describe('distance', () => {
    it('calculates Euclidean distance', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      
      expect(distance(a, b)).toBe(5);
    });
    
    it('returns 0 for same point', () => {
      const a = { x: 1, y: 1 };
      expect(distance(a, a)).toBe(0);
    });
  });
  
  describe('shouldAddPoint', () => {
    it('returns true for null last point', () => {
      expect(shouldAddPoint(null, { x: 0, y: 0 })).toBe(true);
    });
    
    it('returns true for undefined last point', () => {
      expect(shouldAddPoint(undefined, { x: 0, y: 0 })).toBe(true);
    });
    
    it('returns true if distance exceeds threshold', () => {
      const last = { x: 0, y: 0 };
      const next = { x: 0.1, y: 0 };
      
      expect(shouldAddPoint(last, next, 0.05)).toBe(true);
    });
    
    it('returns false if distance below threshold', () => {
      const last = { x: 0, y: 0 };
      const next = { x: 0.001, y: 0 };
      
      expect(shouldAddPoint(last, next, 0.01)).toBe(false);
    });
  });
  
  describe('addBreakPoint', () => {
    it('adds NaN point to array', () => {
      const points = [{ x: 0, y: 0 }];
      addBreakPoint(points);
      
      expect(points).toHaveLength(2);
      expect(isNaN(points[1].x)).toBe(true);
      expect(isNaN(points[1].y)).toBe(true);
    });
  });
});
