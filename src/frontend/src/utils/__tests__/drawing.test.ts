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
    
    it('smooths points with moving average', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 },
      ];
      const smoothed = smoothPoints(points, 3);
      
      // Middle points should be averaged
      expect(smoothed[2].x).toBeCloseTo(2, 1);
      expect(smoothed.length).toBe(points.length);
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

      const lineTos = calls.filter(([name]) => name === 'lineTo');
      const xValues = lineTos.map(([, x]) => x as number);

      // Without smoothing we'd expect a lineTo at x=90. With smoothing that spike should be reduced.
      expect(xValues).not.toContain(90);

      // The smoothed center point (avg of 0.1, 0.9, 0.2) => 0.4, so x ~= 40 should exist.
      const hasNear40 = xValues.some((x) => Math.abs(x - 40) < 0.0001);
      expect(hasNear40).toBe(true);
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
