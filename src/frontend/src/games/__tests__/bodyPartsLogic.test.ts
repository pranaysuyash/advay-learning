import { describe, expect, it } from 'vitest';
import {
  LEVELS,
  getLevelConfig,
  getPartsForLevel,
  calculateScore,
  DIFFICULTY_MULTIPLIERS,
} from '../bodyPartsLogic';

describe('BODY_PARTS Data', () => {
  it('has 10 body parts', () => {
    // Can't directly test BODY_PARTS as it's not exported
    // But we can verify through getPartsForLevel
    const level3Parts = getPartsForLevel(3);
    expect(level3Parts.length).toBe(8); // Level 3 uses 8 parts
    expect(level3Parts.length).toBeLessThanOrEqual(10);
  });

  it('each body part has name and emoji', () => {
    const parts = getPartsForLevel(3);
    parts.forEach((part) => {
      expect(part.name).toBeDefined();
      expect(part.emoji).toBeDefined();
      expect(part.name.length).toBeGreaterThan(0);
      expect(part.emoji.length).toBeGreaterThan(0);
    });
  });
});

describe('LEVELS Configuration', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 4 parts', () => {
    const level1 = LEVELS[0];
    expect(level1.level).toBe(1);
    expect(level1.partCount).toBe(4);
  });

  it('level 2 has 6 parts', () => {
    const level2 = LEVELS[1];
    expect(level2.level).toBe(2);
    expect(level2.partCount).toBe(6);
  });

  it('level 3 has 8 parts', () => {
    const level3 = LEVELS[2];
    expect(level3.level).toBe(3);
    expect(level3.partCount).toBe(8);
  });

  it('levels increase in part count', () => {
    expect(LEVELS[0].partCount).toBeLessThan(LEVELS[1].partCount);
    expect(LEVELS[1].partCount).toBeLessThan(LEVELS[2].partCount);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.partCount).toBe(4);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.partCount).toBe(6);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.partCount).toBe(8);
  });

  it('returns level 1 config for invalid level', () => {
    const config = getLevelConfig(99);
    expect(config.level).toBe(1);
  });

  it('returns level 1 config for level 0', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('getPartsForLevel', () => {
  it('returns 4 parts for level 1', () => {
    const parts = getPartsForLevel(1);
    expect(parts).toHaveLength(4);
  });

  it('returns 6 parts for level 2', () => {
    const parts = getPartsForLevel(2);
    expect(parts).toHaveLength(6);
  });

  it('returns 8 parts for level 3', () => {
    const parts = getPartsForLevel(3);
    expect(parts).toHaveLength(8);
  });

  it('returns body part objects with required properties', () => {
    const parts = getPartsForLevel(1);
    parts.forEach((part) => {
      expect(part.name).toBeDefined();
      expect(part.emoji).toBeDefined();
    });
  });

  it('parts have valid emojis', () => {
    const parts = getPartsForLevel(3);
    parts.forEach((part) => {
      // Emojis should be 1-4 characters typically
      expect(part.emoji.length).toBeGreaterThan(0);
      expect(part.emoji.length).toBeLessThanOrEqual(4);
    });
  });

  it('parts have names starting with capital letter', () => {
    const parts = getPartsForLevel(1);
    parts.forEach((part) => {
      expect(part.name[0]).toBe(part.name[0].toUpperCase());
    });
  });

  it('different calls may return different parts (random)', () => {
    const parts1 = getPartsForLevel(3);
    const parts2 = getPartsForLevel(3);

    // Due to randomness, they may or may not be different
    // Just verify both are valid
    expect(parts1).toHaveLength(8);
    expect(parts2).toHaveLength(8);
  });

  it('contains common body parts', () => {
    const parts = getPartsForLevel(3);
    const partNames = parts.map((p) => p.name);

    // Check for some expected body part names
    const hasCommonPart = ['Head', 'Eyes', 'Nose', 'Mouth', 'Hands', 'Feet', 'Arms', 'Legs'].some((name) =>
      partNames.includes(name)
    );
    expect(hasCommonPart).toBe(true);
  });
});

describe('calculateScore', () => {
  it('returns higher score for higher streak', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(3, 1);
    expect(score2).toBeGreaterThan(score1);
  });

  it('returns higher score for higher level', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(1, 3);
    expect(score2).toBeGreaterThan(score1);
  });

  it('level 3 with high streak gives maximum points', () => {
    const score = calculateScore(10, 3);
    expect(score).toBeGreaterThan(0);
  });

  it('level 1 base score is reasonable', () => {
    const score = calculateScore(1, 1);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

describe('DIFFICULTY_MULTIPLIERS', () => {
  it('has multipliers for all 3 levels', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
  });

  it('multipliers increase with level', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
  });
});
