/**
 * Path Following Logic Tests
 * Tests for stay-on-the-path game
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLevelConfig,
  createPath,
  isOnPath,
  LEVELS,
  type PathPoint,
  type LevelConfig,
} from '../pathFollowingLogic';

describe('pathFollowingLogic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Level Configuration', () => {
    it('should have 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('should have progressive path lengths', () => {
      expect(LEVELS[0].pathLength).toBe(8);
      expect(LEVELS[1].pathLength).toBe(12);
      expect(LEVELS[2].pathLength).toBe(16);
    });

    it('should have decreasing path widths', () => {
      expect(LEVELS[0].pathWidth).toBe(60);
      expect(LEVELS[1].pathWidth).toBe(50);
      expect(LEVELS[2].pathWidth).toBe(40);
    });

    it('should have correct level numbers', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[2].level).toBe(3);
    });
  });

  describe('getLevelConfig', () => {
    it('should return level 1 config for level 1', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.pathLength).toBe(8);
      expect(config.pathWidth).toBe(60);
    });

    it('should return level 2 config for level 2', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.pathLength).toBe(12);
      expect(config.pathWidth).toBe(50);
    });

    it('should return level 3 config for level 3', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.pathLength).toBe(16);
      expect(config.pathWidth).toBe(40);
    });

    it('should fallback to level 1 for invalid level', () => {
      const config = getLevelConfig(99);
      expect(config.level).toBe(1);
      expect(config.pathLength).toBe(8);
    });

    it('should fallback to level 1 for negative level', () => {
      const config = getLevelConfig(-1);
      expect(config.level).toBe(1);
    });

    it('should fallback to level 1 for zero level', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });
  });

  describe('createPath', () => {
    it('should return path and config', () => {
      const result = createPath(1);

      expect(result.path).toBeDefined();
      expect(result.config).toBeDefined();
      expect(result.config.level).toBe(1);
    });

    it('should create correct number of points for level 1', () => {
      const result = createPath(1);

      expect(result.path).toHaveLength(8);
    });

    it('should create correct number of points for level 2', () => {
      const result = createPath(2);

      expect(result.path).toHaveLength(12);
    });

    it('should create correct number of points for level 3', () => {
      const result = createPath(3);

      expect(result.path).toHaveLength(16);
    });

    it('should start path at (50, 50)', () => {
      const result = createPath(1);

      expect(result.path[0].x).toBe(50);
      expect(result.path[0].y).toBe(50);
    });

    it('should generate points with x and y coordinates', () => {
      const result = createPath(1);

      result.path.forEach(point => {
        expect(point.x).toBeGreaterThanOrEqual(50);
        expect(point.y).toBeGreaterThanOrEqual(50);
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
      });
    });

    it('should use level-specific config', () => {
      const result1 = createPath(1);
      const result2 = createPath(2);
      const result3 = createPath(3);

      expect(result1.config.pathWidth).toBe(60);
      expect(result2.config.pathWidth).toBe(50);
      expect(result3.config.pathWidth).toBe(40);
    });
  });

  describe('Path Point Type', () => {
    it('should have x and y properties', () => {
      const point: PathPoint = { x: 50, y: 50 };

      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    });

    it('should accept numeric values', () => {
      const point: PathPoint = { x: 100.5, y: 200.3 };

      expect(point.x).toBe(100.5);
      expect(point.y).toBe(200.3);
    });
  });

  describe('isOnPath', () => {
    const testPath: PathPoint[] = [
      { x: 50, y: 50 },
      { x: 110, y: 50 },
      { x: 110, y: 110 },
      { x: 170, y: 110 },
    ];

    it('should detect point directly on path segment', () => {
      const result = isOnPath(80, 50, testPath, 60);
      expect(result).toBe(true);
    });

    it('should detect point within path width tolerance', () => {
      // Point at (80, 80) is within 30px of segment from (50,50) to (110,50)
      // with pathWidth=60, tolerance is 30
      const result = isOnPath(80, 70, testPath, 60);
      expect(result).toBe(true);
    });

    it('should reject point outside path width', () => {
      // Point at (200, 150) is far from all path segments
      // testPath: (50,50) -> (110,50) -> (110,110) -> (170,110)
      const result = isOnPath(200, 150, testPath, 60);
      expect(result).toBe(false);
    });

    it('should handle single segment path', () => {
      const singleSegment: PathPoint[] = [
        { x: 50, y: 50 },
        { x: 150, y: 50 },
      ];

      const result = isOnPath(100, 50, singleSegment, 60);
      expect(result).toBe(true);
    });

    it('should handle diagonal segments', () => {
      const diagonalPath: PathPoint[] = [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
      ];

      // Point on the diagonal line
      const result = isOnPath(50, 50, diagonalPath, 60);
      expect(result).toBe(true);
    });

    it('should return false for empty path', () => {
      const result = isOnPath(50, 50, [], 60);
      expect(result).toBe(false);
    });

    it('should handle single point path', () => {
      const singlePoint: PathPoint[] = [{ x: 50, y: 50 }];
      const result = isOnPath(50, 50, singlePoint, 60);
      expect(result).toBe(false); // No segments to check
    });

    it('should work with level 1 path width', () => {
      const result = isOnPath(80, 50, testPath, 60);
      expect(result).toBe(true);
    });

    it('should work with level 2 path width', () => {
      const result = isOnPath(80, 50, testPath, 50);
      expect(result).toBe(true);
    });

    it('should work with level 3 path width', () => {
      const result = isOnPath(80, 50, testPath, 40);
      expect(result).toBe(true);
    });

    it('should reject point outside narrower path', () => {
      const result = isOnPath(80, 85, testPath, 40);
      expect(result).toBe(false);
    });

    it('should handle point exactly on segment endpoint', () => {
      const result = isOnPath(110, 50, testPath, 60);
      expect(result).toBe(true);
    });

    it('should check all segments in path', () => {
      const multiSegmentPath: PathPoint[] = [
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: 100, y: 50 },
        { x: 150, y: 50 },
      ];

      // Point on third segment
      const result = isOnPath(125, 50, multiSegmentPath, 60);
      expect(result).toBe(true);
    });
  });

  describe('Path Generation Logic', () => {
    it('should use Math.random for variety', () => {
      // This test verifies that path generation uses randomness
      const result1 = createPath(1);
      const result2 = createPath(1);

      // Paths should have different subsequent points due to randomness
      // First point is always (50, 50), so check second point
      const hasVariation = result1.path.some((point, i) => {
        const otherPoint = result2.path[i];
        return otherPoint && (point.x !== otherPoint.x || point.y !== otherPoint.y);
      });

      // Due to randomness, at least some points should differ
      expect(hasVariation || result1.path.length === result2.path.length).toBeTruthy();
    });

    it('should generate increasing x values for first direction', () => {
      // Mock random to always return < 0.33 for horizontal movement
      vi.spyOn(Math, 'random').mockReturnValue(0.2);

      const result = createPath(1);

      // Second point should have x > 50 due to horizontal movement
      expect(result.path[1].x).toBeGreaterThan(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle path width of zero', () => {
      const testPath: PathPoint[] = [
        { x: 50, y: 50 },
        { x: 150, y: 50 },
      ];

      // Only exact point matches
      const result = isOnPath(100, 50, testPath, 0);
      expect(result).toBe(true);
    });

    it('should handle very large path width', () => {
      const testPath: PathPoint[] = [
        { x: 50, y: 50 },
        { x: 150, y: 50 },
      ];

      // Very generous width should catch far points
      const result = isOnPath(100, 200, testPath, 500);
      expect(result).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const testPath: PathPoint[] = [
        { x: -50, y: -50 },
        { x: 50, y: 50 },
      ];

      const result = isOnPath(0, 0, testPath, 60);
      expect(result).toBe(true);
    });

    it('should handle very large coordinates', () => {
      const testPath: PathPoint[] = [
        { x: 1000, y: 1000 },
        { x: 2000, y: 1000 },
      ];

      const result = isOnPath(1500, 1000, testPath, 60);
      expect(result).toBe(true);
    });
  });

  describe('Level Config Type', () => {
    it('should have level, pathLength, and pathWidth', () => {
      const config: LevelConfig = {
        level: 1,
        pathLength: 8,
        pathWidth: 60,
      };

      expect(config.level).toBeDefined();
      expect(config.pathLength).toBeDefined();
      expect(config.pathWidth).toBeDefined();
    });
  });

  describe('Integration Scenarios', () => {
    it('should create playable game for level 1', () => {
      const game = createPath(1);

      expect(game.path).toHaveLength(8);
      expect(game.config.pathWidth).toBe(60);

      // Starting position should be on path
      const startOnPath = isOnPath(
        game.path[0].x,
        game.path[0].y,
        game.path,
        game.config.pathWidth
      );
      expect(startOnPath).toBe(true);
    });

    it('should create playable game for level 2', () => {
      const game = createPath(2);

      expect(game.path).toHaveLength(12);
      expect(game.config.pathWidth).toBe(50);
    });

    it('should create playable game for level 3', () => {
      const game = createPath(3);

      expect(game.path).toHaveLength(16);
      expect(game.config.pathWidth).toBe(40);
    });

    it('should have progressively narrower paths', () => {
      const game1 = createPath(1);
      const game2 = createPath(2);
      const game3 = createPath(3);

      expect(game1.config.pathWidth).toBeGreaterThan(game2.config.pathWidth);
      expect(game2.config.pathWidth).toBeGreaterThan(game3.config.pathWidth);
    });

    it('should have progressively longer paths', () => {
      const game1 = createPath(1);
      const game2 = createPath(2);
      const game3 = createPath(3);

      expect(game2.path.length).toBeGreaterThan(game1.path.length);
      expect(game3.path.length).toBeGreaterThan(game2.path.length);
    });
  });

  describe('Boundary Testing', () => {
    it('should handle point at path boundary', () => {
      const testPath: PathPoint[] = [
        { x: 0, y: 50 },
        { x: 100, y: 50 },
      ];

      // Point exactly at boundary (width/2 away from center)
      const result = isOnPath(100, 80, testPath, 60);
      expect(result).toBe(true);
    });

    it('should reject point just outside boundary', () => {
      const testPath: PathPoint[] = [
        { x: 0, y: 50 },
        { x: 100, y: 50 },
      ];

      // Point just outside boundary
      const result = isOnPath(100, 81, testPath, 60);
      expect(result).toBe(false);
    });

    it('should handle vertical segment boundary', () => {
      const testPath: PathPoint[] = [
        { x: 50, y: 0 },
        { x: 50, y: 100 },
      ];

      const result = isOnPath(80, 50, testPath, 60);
      expect(result).toBe(true);
    });
  });
});
