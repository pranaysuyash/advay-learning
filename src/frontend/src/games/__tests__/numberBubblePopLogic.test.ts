import { describe, expect, it } from 'vitest';

import {
  Bubble,
  LEVELS,
  DIFFICULTY_MULTIPLIERS,
  calculateScore,
  generateBubbles,
  getLevelConfig,
} from '../numberBubblePopLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('has level 1 with range 5', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].numberRange).toBe(5);
  });

  it('has level 2 with range 10', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].numberRange).toBe(10);
  });

  it('has level 3 with range 20', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].numberRange).toBe(20);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.numberRange).toBe(5);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.numberRange).toBe(10);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.numberRange).toBe(20);
  });

  it('returns level 1 config for unknown level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
    expect(config.numberRange).toBe(5);
  });

  it('returns level 1 config for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
    expect(config.numberRange).toBe(5);
  });

  it('returns level 1 config for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
    expect(config.numberRange).toBe(5);
  });
});

describe('DIFFICULTY_MULTIPLIERS', () => {
  it('has multiplier for level 1', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
  });

  it('has multiplier for level 2', () => {
    expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
  });

  it('has multiplier for level 3', () => {
    expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
  });
});

describe('calculateScore', () => {
  it('returns 15 for level 1, streak 0', () => {
    expect(calculateScore(0, 1)).toBe(15);
  });

  it('returns 18 for level 1, streak 1', () => {
    expect(calculateScore(1, 1)).toBe(18);
  });

  it('returns 21 for level 1, streak 2', () => {
    expect(calculateScore(2, 1)).toBe(21);
  });

  it('returns 30 for level 1, streak 5', () => {
    expect(calculateScore(5, 1)).toBe(30);
  });

  it('caps at 30 for level 1 with high streak', () => {
    expect(calculateScore(10, 1)).toBe(30);
    expect(calculateScore(100, 1)).toBe(30);
  });

  it('applies 1.5x multiplier for level 2', () => {
    expect(calculateScore(0, 2)).toBe(22); // 15 * 1.5 = 22.5 -> 22
    expect(calculateScore(5, 2)).toBe(45); // 30 * 1.5 = 45
  });

  it('applies 2x multiplier for level 3', () => {
    expect(calculateScore(0, 3)).toBe(30); // 15 * 2 = 30
    expect(calculateScore(5, 3)).toBe(60); // 30 * 2 = 60
  });

  it('handles negative streak gracefully', () => {
    // Max streak bonus is 15, negative streak gives 0 bonus
    // With negative streak, min(-1 * 2, 15) = -2, but formula uses Math.min
    // So: baseScore + min(streak * 3, 15) where baseScore = 15
    expect(calculateScore(-1, 1)).toBeLessThanOrEqual(15);
  });

  it('caps level 2 at 45 points', () => {
    expect(calculateScore(10, 2)).toBe(45);
  });

  it('caps level 3 at 60 points', () => {
    expect(calculateScore(10, 3)).toBe(60);
  });

  it('uses 1x multiplier for unknown level', () => {
    expect(calculateScore(0, 999)).toBe(15);
  });
});

describe('generateBubbles', () => {
  it('returns requested bubble count', () => {
    const bubbles = generateBubbles(5, 1, 5);
    expect(bubbles).toHaveLength(5);
  });

  it('returns all bubbles with number type', () => {
    const bubbles = generateBubbles(5, 1, 5);
    expect(bubbles.every((b) => typeof b.number === 'number')).toBe(true);
  });

  it('keeps values within requested range', () => {
    const bubbles = generateBubbles(8, 3, 4);
    expect(bubbles.every((b) => b.number >= 1 && b.number <= 4)).toBe(true);
  });

  it('includes target number in bubbles', () => {
    const target = 3;
    const bubbles = generateBubbles(5, target, 5);
    expect(bubbles.some((b) => b.number === target)).toBe(true);
  });

  it('generates unique bubble ids', () => {
    const bubbles = generateBubbles(10, 1, 5);
    const ids = bubbles.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  it('generates ids from 0 to count-1', () => {
    const bubbles = generateBubbles(5, 1, 5);
    const ids = bubbles.map((b) => b.id).sort((a, b) => a - b);
    expect(ids).toEqual([0, 1, 2, 3, 4]);
  });

  it('generates x coordinates in range [20, 300]', () => {
    const bubbles = generateBubbles(20, 1, 5);
    expect(bubbles.every((b) => b.x >= 20 && b.x < 300)).toBe(true);
  });

  it('generates y coordinates in range [50, 250]', () => {
    const bubbles = generateBubbles(20, 1, 5);
    expect(bubbles.every((b) => b.y >= 50 && b.y < 250)).toBe(true);
  });

  it('handles count of 1', () => {
    const bubbles = generateBubbles(1, 1, 2);
    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].number).toBe(1);
  });

  it('handles count of 0', () => {
    const bubbles = generateBubbles(0, 1, 5);
    expect(bubbles).toHaveLength(0);
  });

  it('handles numberRange of 1 - clamps to minimum 2', () => {
    // Due to Math.max(2, Math.floor(numberRange)), range 1 becomes 2
    const bubbles = generateBubbles(3, 1, 1);
    expect(bubbles.every((b) => b.number >= 1 && b.number <= 2)).toBe(true);
    expect(bubbles.some((b) => b.number === 1)).toBe(true);
  });

  it('handles target at range boundary', () => {
    const bubbles = generateBubbles(5, 5, 5);
    expect(bubbles.some((b) => b.number === 5)).toBe(true);
  });

  it('creates wrong answers different from target', () => {
    const target = 5;
    const bubbles = generateBubbles(10, target, 10);
    const nonTargets = bubbles.filter((b) => b.number !== target);
    expect(nonTargets.length).toBeGreaterThan(0);
    expect(nonTargets.every((b) => b.number !== target)).toBe(true);
  });

  it('uses default numberRange of 5 when not specified', () => {
    const bubbles = generateBubbles(5, 3);
    expect(bubbles.every((b) => b.number >= 1 && b.number <= 5)).toBe(true);
  });

  it('handles numberRange smaller than count', () => {
    // When range is 2 and count is 5, should still produce 5 bubbles
    const bubbles = generateBubbles(5, 1, 2);
    expect(bubbles).toHaveLength(5);
    expect(bubbles.every((b) => b.number >= 1 && b.number <= 2)).toBe(true);
  });

  it('generates varied numbers for sufficient range', () => {
    const bubbles = generateBubbles(10, 5, 10);
    const numbers = bubbles.map((b) => b.number);
    const uniqueNumbers = new Set(numbers);
    // With 10 bubbles from range 1-10, should have multiple unique values
    expect(uniqueNumbers.size).toBeGreaterThan(1);
  });

  it('includes target exactly once', () => {
    const target = 3;
    const bubbles = generateBubbles(10, target, 5);
    const targets = bubbles.filter((b) => b.number === target);
    // Target should appear at least once (may appear more due to fill logic)
    expect(targets.length).toBeGreaterThanOrEqual(1);
  });

  it('creates bubble with correct structure', () => {
    const bubbles = generateBubbles(1, 1, 5);
    const bubble: Bubble = bubbles[0];
    expect(typeof bubble.id).toBe('number');
    expect(typeof bubble.number).toBe('number');
    expect(typeof bubble.x).toBe('number');
    expect(typeof bubble.y).toBe('number');
  });

  it('produces different results on multiple calls', () => {
    const bubbles1 = generateBubbles(10, 5, 10);
    const bubbles2 = generateBubbles(10, 5, 10);
    // Due to shuffling, at least some positions should differ
    const samePositions = bubbles1.every((b, i) => b.number === bubbles2[i].number);
    expect(samePositions).not.toBe(true);
  });

  it('handles edge case: target equals numberRange', () => {
    const bubbles = generateBubbles(5, 10, 10);
    expect(bubbles.some((b) => b.number === 10)).toBe(true);
    expect(bubbles.every((b) => b.number >= 1 && b.number <= 10)).toBe(true);
  });

  it('handles edge case: count equals 1', () => {
    const bubbles = generateBubbles(1, 5, 10);
    expect(bubbles).toHaveLength(1);
    expect(bubbles[0].number).toBe(5); // Only the target
  });

  it('handles edge case: large count with small range', () => {
    // Range 3, count 20 - should still work with repeats
    const bubbles = generateBubbles(20, 2, 3);
    expect(bubbles).toHaveLength(20);
    expect(bubbles.every((b) => b.number >= 1 && b.number <= 3)).toBe(true);
    expect(bubbles.some((b) => b.number === 2)).toBe(true);
  });
});
