import { describe, it, expect } from 'vitest';
import {
  smoothPoints,
  buildSegments,
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
