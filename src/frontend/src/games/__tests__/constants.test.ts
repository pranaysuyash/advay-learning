/**
 * Shared Game Constants Tests
 *
 * Tests for shared constants and utility functions used across games.
 */

import { describe, it, expect } from 'vitest';
import {
  STREAK_MILESTONE_INTERVAL,
  STREAK_MILESTONE_DURATION_MS,
  DEFAULT_GAME_DURATION_MS,
  DifficultyLevel,
  AnimationDuration,
  TouchConstraints,
  StarThresholds,
  getStarRating,
  type DifficultyLevel as DifficultyLevelType,
} from '../constants';

describe('Streak Milestone Constants', () => {
  it('should have milestone interval of 5', () => {
    expect(STREAK_MILESTONE_INTERVAL).toBe(5);
  });

  it('should have milestone duration of 1200ms', () => {
    expect(STREAK_MILESTONE_DURATION_MS).toBe(1200);
  });
});

describe('Default Game Duration', () => {
  it('should be 5 minutes in milliseconds', () => {
    expect(DEFAULT_GAME_DURATION_MS).toBe(5 * 60 * 1000);
    expect(DEFAULT_GAME_DURATION_MS).toBe(300000);
  });
});

describe('Difficulty Level', () => {
  it('should have EASY level of 1', () => {
    expect(DifficultyLevel.EASY).toBe(1);
  });

  it('should have MEDIUM level of 2', () => {
    expect(DifficultyLevel.MEDIUM).toBe(2);
  });

  it('should have HARD level of 3', () => {
    expect(DifficultyLevel.HARD).toBe(3);
  });

  it('should accept valid difficulty levels', () => {
    const levels: DifficultyLevelType[] = [1, 2, 3];
    levels.forEach(level => {
      expect([1, 2, 3]).toContain(level);
    });
  });
});

describe('Animation Duration', () => {
  it('should have QUICK duration of 150ms', () => {
    expect(AnimationDuration.QUICK).toBe(150);
  });

  it('should have NORMAL duration of 300ms', () => {
    expect(AnimationDuration.NORMAL).toBe(300);
  });

  it('should have SLOW duration of 500ms', () => {
    expect(AnimationDuration.SLOW).toBe(500);
  });

  it('should have EXTENDED duration of 1000ms', () => {
    expect(AnimationDuration.EXTENDED).toBe(1000);
  });

  it('should have increasing durations', () => {
    expect(AnimationDuration.QUICK).toBeLessThan(AnimationDuration.NORMAL);
    expect(AnimationDuration.NORMAL).toBeLessThan(AnimationDuration.SLOW);
    expect(AnimationDuration.SLOW).toBeLessThan(AnimationDuration.EXTENDED);
  });
});

describe('Touch Constraints', () => {
  it('should have MAX_TAP_DURATION_MS of 300', () => {
    expect(TouchConstraints.MAX_TAP_DURATION_MS).toBe(300);
  });

  it('should have MAX_TAP_MOVEMENT_PX of 10', () => {
    expect(TouchConstraints.MAX_TAP_MOVEMENT_PX).toBe(10);
  });

  it('should have TAP_DEBOUNCE_MS of 200', () => {
    expect(TouchConstraints.TAP_DEBOUNCE_MS).toBe(200);
  });
});

describe('Star Thresholds', () => {
  it('should have ONE_STAR threshold of 40', () => {
    expect(StarThresholds.ONE_STAR).toBe(40);
  });

  it('should have TWO_STARS threshold of 70', () => {
    expect(StarThresholds.TWO_STARS).toBe(70);
  });

  it('should have THREE_STARS threshold of 90', () => {
    expect(StarThresholds.THREE_STARS).toBe(90);
  });

  it('should have increasing thresholds', () => {
    expect(StarThresholds.ONE_STAR).toBeLessThan(StarThresholds.TWO_STARS);
    expect(StarThresholds.TWO_STARS).toBeLessThan(StarThresholds.THREE_STARS);
  });
});

describe('getStarRating', () => {
  it('should return 3 stars for 90+ percentage', () => {
    expect(getStarRating(90)).toBe(3);
    expect(getStarRating(95)).toBe(3);
    expect(getStarRating(100)).toBe(3);
  });

  it('should return 2 stars for 70-89 percentage', () => {
    expect(getStarRating(70)).toBe(2);
    expect(getStarRating(80)).toBe(2);
    expect(getStarRating(89)).toBe(2);
  });

  it('should return 1 star for 40-69 percentage', () => {
    expect(getStarRating(40)).toBe(1);
    expect(getStarRating(55)).toBe(1);
    expect(getStarRating(69)).toBe(1);
  });

  it('should return 0 stars for less than 40 percentage', () => {
    expect(getStarRating(0)).toBe(0);
    expect(getStarRating(20)).toBe(0);
    expect(getStarRating(39)).toBe(0);
  });

  it('should handle edge cases at boundaries', () => {
    expect(getStarRating(39.9)).toBe(0);
    expect(getStarRating(40)).toBe(1);
    expect(getStarRating(69.9)).toBe(1);
    expect(getStarRating(70)).toBe(2);
    expect(getStarRating(89.9)).toBe(2);
    expect(getStarRating(90)).toBe(3);
  });

  it('should handle negative input', () => {
    expect(getStarRating(-10)).toBe(0);
  });

  it('should handle input above 100', () => {
    expect(getStarRating(150)).toBe(3);
  });

  it('should return correct union type', () => {
    const rating: 0 | 1 | 2 | 3 = getStarRating(50);
    expect([0, 1, 2, 3]).toContain(rating);
  });
});
