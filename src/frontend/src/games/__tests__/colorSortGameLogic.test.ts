/**
 * Color Sort Game - Game Logic Tests
 *
 * Tests for sorting colors into correct buckets.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  LEVELS,
  getLevelConfig,
  calculateScore,
  generateItems,
  DIFFICULTY_MULTIPLIERS,
  type ColorItem,
  type LevelConfig,
} from '../colorSortGameLogic';

// Mock the shuffle function to get deterministic results for testing
vi.mock('../utils/random', () => ({
  shuffle: vi.fn(<T>(arr: T[]): T[] => {
    // Return a reversed array for deterministic testing
    return [...arr].reverse();
  }),
}));

describe('Color Sort Game - Game Logic', () => {
  describe('Constants', () => {
    it('should have 3 levels', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('should have level 1 with 3 colors', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[0].colorCount).toBe(3);
    });

    it('should have level 2 with 4 colors', () => {
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[1].colorCount).toBe(4);
    });

    it('should have level 3 with 6 colors', () => {
      expect(LEVELS[2].level).toBe(3);
      expect(LEVELS[2].colorCount).toBe(6);
    });
  });

  describe('DIFFICULTY_MULTIPLIERS', () => {
    it('should have multiplier for level 1', () => {
      expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
    });

    it('should have multiplier for level 2', () => {
      expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
    });

    it('should have multiplier for level 3', () => {
      expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
    });
  });

  describe('getLevelConfig', () => {
    it('should return level 1 config', () => {
      const config = getLevelConfig(1);
      expect(config.level).toBe(1);
      expect(config.colorCount).toBe(3);
    });

    it('should return level 2 config', () => {
      const config = getLevelConfig(2);
      expect(config.level).toBe(2);
      expect(config.colorCount).toBe(4);
    });

    it('should return level 3 config', () => {
      const config = getLevelConfig(3);
      expect(config.level).toBe(3);
      expect(config.colorCount).toBe(6);
    });

    it('should fallback to level 1 for invalid level', () => {
      const config = getLevelConfig(999);
      expect(config.level).toBe(1);
      expect(config.colorCount).toBe(3);
    });

    it('should fallback to level 1 for level 0', () => {
      const config = getLevelConfig(0);
      expect(config.level).toBe(1);
    });

    it('should fallback to level 1 for negative level', () => {
      const config = getLevelConfig(-1);
      expect(config.level).toBe(1);
    });
  });

  describe('calculateScore', () => {
    it('should calculate base score with no streak', () => {
      expect(calculateScore(0, 1)).toBe(10);
    });

    it('should add streak bonus', () => {
      expect(calculateScore(1, 1)).toBeGreaterThan(10);
      expect(calculateScore(2, 1)).toBeGreaterThan(calculateScore(1, 1));
    });

    it('should apply level 1 multiplier (1x)', () => {
      const baseScore = calculateScore(0, 1);
      expect(baseScore).toBe(10);
    });

    it('should apply level 2 multiplier (1.5x)', () => {
      const score = calculateScore(0, 2);
      expect(score).toBe(15); // 10 * 1.5 = 15
    });

    it('should apply level 3 multiplier (2x)', () => {
      const score = calculateScore(0, 3);
      expect(score).toBe(20); // 10 * 2 = 20
    });

    it('should cap streak bonus', () => {
      // Max streak bonus is 15, so max base is 25
      const score1 = calculateScore(5, 1);
      const score2 = calculateScore(10, 1);
      expect(score2).toBeLessThanOrEqual(25);
    });

    it('should calculate max score for level 3 with max streak', () => {
      const score = calculateScore(10, 3);
      expect(score).toBe(50); // Math.floor((10 + 15) * 2) = 50
    });

    it('should handle zero streak', () => {
      expect(calculateScore(0, 1)).toBe(10);
      expect(calculateScore(0, 2)).toBe(15);
      expect(calculateScore(0, 3)).toBe(20);
    });

    it('should handle high streak values', () => {
      const score1 = calculateScore(100, 1);
      const score2 = calculateScore(5, 1);
      // Should be capped at max streak bonus
      expect(score1).toBe(score2);
    });
  });

  describe('generateItems', () => {
    it('should generate items for level 1', () => {
      const { items, targets } = generateItems(1);
      expect(targets).toHaveLength(3);
      expect(items).toHaveLength(9); // 3 targets * 3 each
    });

    it('should generate items for level 2', () => {
      const { items, targets } = generateItems(2);
      expect(targets).toHaveLength(4);
      expect(items).toHaveLength(12); // 4 targets * 3 each
    });

    it('should generate items for level 3', () => {
      const { items, targets } = generateItems(3);
      expect(targets).toHaveLength(6);
      expect(items).toHaveLength(18); // 6 targets * 3 each
    });

    it('should return correct number of items per target', () => {
      const { items, targets } = generateItems(1);
      targets.forEach(target => {
        const count = items.filter(i => i.name === target.name).length;
        expect(count).toBe(3);
      });
    });

    it('should return unique targets', () => {
      const { targets } = generateItems(1);
      const uniqueTargets = new Set(targets.map(t => t.name));
      expect(uniqueTargets.size).toBe(3);
    });

    it('should return items as ColorItem type', () => {
      const { items } = generateItems(1);
      items.forEach(item => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('hex');
        expect(typeof item.name).toBe('string');
        expect(typeof item.hex).toBe('string');
      });
    });

    it('should return targets as ColorItem type', () => {
      const { targets } = generateItems(1);
      targets.forEach(target => {
        expect(target).toHaveProperty('name');
        expect(target).toHaveProperty('hex');
      });
    });

    it('should return valid hex codes', () => {
      const { items } = generateItems(1);
      const hexRegex = /^#[0-9A-F]{6}$/i;
      items.forEach(item => {
        expect(hexRegex.test(item.hex)).toBe(true);
      });
    });
  });

  describe('Level Progression', () => {
    it('should increase color count across levels', () => {
      expect(LEVELS[0].colorCount).toBeLessThan(LEVELS[1].colorCount);
      expect(LEVELS[1].colorCount).toBeLessThan(LEVELS[2].colorCount);
    });

    it('should increase difficulty multipliers across levels', () => {
      expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
      expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
    });

    it('should have consistent level numbers', () => {
      LEVELS.forEach((level, index) => {
        expect(level.level).toBe(index + 1);
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete game flow for level 1', () => {
      const config = getLevelConfig(1);
      const { items, targets } = generateItems(1);

      expect(config.colorCount).toBe(3);
      expect(targets.length).toBe(3);
      expect(items.length).toBe(9);

      // Simulate sorting with streak
      let totalScore = 0;
      for (let i = 0; i < items.length; i++) {
        totalScore += calculateScore(i, 1);
      }
      expect(totalScore).toBeGreaterThan(0);
    });

    it('should handle complete game flow for level 2', () => {
      const config = getLevelConfig(2);
      const { items, targets } = generateItems(2);

      expect(config.colorCount).toBe(4);
      expect(targets.length).toBe(4);
      expect(items.length).toBe(12);
    });

    it('should handle complete game flow for level 3', () => {
      const config = getLevelConfig(3);
      const { items, targets } = generateItems(3);

      expect(config.colorCount).toBe(6);
      expect(targets.length).toBe(6);
      expect(items.length).toBe(18);
    });

    it('should score higher on level 3 than level 1 for same streak', () => {
      const score1 = calculateScore(3, 1);
      const score3 = calculateScore(3, 3);
      expect(score3).toBeGreaterThan(score1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high streak values', () => {
      const score = calculateScore(1000, 1);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(25); // Capped at max for level 1
    });

    it('should handle zero level (fallback to level 1)', () => {
      const score = calculateScore(0, 0);
      expect(score).toBe(10); // Level 1 base score
    });

    it('should handle negative level (fallback to level 1)', () => {
      const score = calculateScore(0, -1);
      expect(score).toBe(10); // Level 1 base score
    });

    it('should handle very high level (uses default config)', () => {
      const config = getLevelConfig(999);
      expect(config.level).toBe(1);
    });

    it('should handle negative streak', () => {
      const score = calculateScore(-1, 1);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Type Safety', () => {
    it('should maintain ColorItem type', () => {
      const color: ColorItem = {
        name: 'TestColor',
        hex: '#FFFFFF',
      };
      expect(typeof color.name).toBe('string');
      expect(typeof color.hex).toBe('string');
    });

    it('should maintain LevelConfig type', () => {
      const config: LevelConfig = {
        level: 1,
        colorCount: 3,
      };
      expect(typeof config.level).toBe('number');
      expect(typeof config.colorCount).toBe('number');
    });

    it('should return correct types from functions', () => {
      const config = getLevelConfig(1) as LevelConfig;
      expect(typeof config.level).toBe('number');

      const { items, targets } = generateItems(1);
      expect(Array.isArray(items)).toBe(true);
      expect(Array.isArray(targets)).toBe(true);
    });
  });

  describe('Scoring Mechanics', () => {
    it('should increase score with streak on level 1', () => {
      const s0 = calculateScore(0, 1);
      const s1 = calculateScore(1, 1);
      const s2 = calculateScore(2, 1);
      const s3 = calculateScore(3, 1);

      expect(s0).toBeLessThan(s1);
      expect(s1).toBeLessThan(s2);
      expect(s2).toBeLessThan(s3);
    });

    it('should increase score with streak on level 2', () => {
      const s0 = calculateScore(0, 2);
      const s1 = calculateScore(1, 2);
      const s2 = calculateScore(2, 2);

      expect(s0).toBeLessThan(s1);
      expect(s1).toBeLessThan(s2);
    });

    it('should increase score with streak on level 3', () => {
      const s0 = calculateScore(0, 3);
      const s1 = calculateScore(1, 3);
      const s2 = calculateScore(2, 3);

      expect(s0).toBeLessThan(s1);
      expect(s1).toBeLessThan(s2);
    });

    it('should have correct max scores per level', () => {
      const maxL1 = calculateScore(10, 1); // Math.floor((10 + 15) * 1) = 25
      const maxL2 = calculateScore(10, 2); // Math.floor((10 + 15) * 1.5) = 37
      const maxL3 = calculateScore(10, 3); // Math.floor((10 + 15) * 2) = 50

      expect(maxL1).toBe(25);
      expect(maxL2).toBe(37);
      expect(maxL3).toBe(50);
    });

    it('should have correct min scores per level', () => {
      const minL1 = calculateScore(0, 1); // Math.floor((10 + 0) * 1) = 10
      const minL2 = calculateScore(0, 2); // Math.floor((10 + 0) * 1.5) = 15
      const minL3 = calculateScore(0, 3); // Math.floor((10 + 0) * 2) = 20

      expect(minL1).toBe(10);
      expect(minL2).toBe(15);
      expect(minL3).toBe(20);
    });

    it('should return integer scores (Math.floor applied)', () => {
      // Scores are floored, so no decimals
      const score1 = calculateScore(1, 2); // (10 + 3) * 1.5 = 19.5 -> 19
      const score2 = calculateScore(2, 2); // (10 + 6) * 1.5 = 24 -> 24
      expect(Number.isInteger(score1)).toBe(true);
      expect(Number.isInteger(score2)).toBe(true);
    });
  });
});
