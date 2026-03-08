import { describe, expect, it } from 'vitest';

import {
  BubbleGroup,
  LevelConfig,
  LEVELS,
  getLevelConfig,
  createGame,
  checkAnswer,
  generateQuestion,
  calculateScore,
} from '../bubbleCountLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 2 groups with count range 1-3', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].groupCount).toBe(2);
    expect(LEVELS[0].minCount).toBe(1);
    expect(LEVELS[0].maxCount).toBe(3);
  });

  it('level 2 has 3 groups with count range 1-5', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].groupCount).toBe(3);
    expect(LEVELS[1].minCount).toBe(1);
    expect(LEVELS[1].maxCount).toBe(5);
  });

  it('level 3 has 4 groups with count range 2-8', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].groupCount).toBe(4);
    expect(LEVELS[2].minCount).toBe(2);
    expect(LEVELS[2].maxCount).toBe(8);
  });

  it('group count increases across levels', () => {
    expect(LEVELS[0].groupCount).toBeLessThan(LEVELS[1].groupCount);
    expect(LEVELS[1].groupCount).toBeLessThan(LEVELS[2].groupCount);
  });

  it('max count increases across levels', () => {
    expect(LEVELS[0].maxCount).toBeLessThan(LEVELS[1].maxCount);
    expect(LEVELS[1].maxCount).toBeLessThan(LEVELS[2].maxCount);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.groupCount).toBe(2);
    expect(config.minCount).toBe(1);
    expect(config.maxCount).toBe(3);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.groupCount).toBe(3);
    expect(config.minCount).toBe(1);
    expect(config.maxCount).toBe(5);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.groupCount).toBe(4);
    expect(config.minCount).toBe(2);
    expect(config.maxCount).toBe(8);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('createGame', () => {
  it('returns groups and config', () => {
    const game = createGame(1);

    expect(game).toHaveProperty('groups');
    expect(game).toHaveProperty('config');
  });

  it('creates correct number of groups for level 1', () => {
    const game = createGame(1);
    expect(game.groups).toHaveLength(2);
  });

  it('creates correct number of groups for level 2', () => {
    const game = createGame(2);
    expect(game.groups).toHaveLength(3);
  });

  it('creates correct number of groups for level 3', () => {
    const game = createGame(3);
    expect(game.groups).toHaveLength(4);
  });

  it('each group has valid properties', () => {
    const game = createGame(1);

    for (const group of game.groups) {
      expect(typeof group.id).toBe('number');
      expect(typeof group.x).toBe('number');
      expect(typeof group.y).toBe('number');
      expect(typeof group.count).toBe('number');
      expect(typeof group.radius).toBe('number');
    }
  });

  it('groups have sequential ids starting from 0', () => {
    const game = createGame(2);

    for (let i = 0; i < game.groups.length; i++) {
      expect(game.groups[i].id).toBe(i);
    }
  });

  it('groups have counts within level range for level 1', () => {
    const game = createGame(1);

    for (const group of game.groups) {
      expect(group.count).toBeGreaterThanOrEqual(1);
      expect(group.count).toBeLessThanOrEqual(3);
    }
  });

  it('groups have counts within level range for level 2', () => {
    const game = createGame(2);

    for (const group of game.groups) {
      expect(group.count).toBeGreaterThanOrEqual(1);
      expect(group.count).toBeLessThanOrEqual(5);
    }
  });

  it('groups have counts within level range for level 3', () => {
    const game = createGame(3);

    for (const group of game.groups) {
      expect(group.count).toBeGreaterThanOrEqual(2);
      expect(group.count).toBeLessThanOrEqual(8);
    }
  });

  it('groups have valid x positions', () => {
    const game = createGame(1);

    for (const group of game.groups) {
      expect(group.x).toBeGreaterThanOrEqual(0);
      expect(group.x).toBeLessThanOrEqual(100);
    }
  });

  it('groups have valid y positions', () => {
    const game = createGame(1);

    for (const group of game.groups) {
      expect(group.y).toBeGreaterThanOrEqual(0);
      expect(group.y).toBeLessThanOrEqual(100);
    }
  });

  it('groups have positive radius', () => {
    const game = createGame(1);

    for (const group of game.groups) {
      expect(group.radius).toBeGreaterThan(0);
    }
  });

  it('radius scales with count', () => {
    const game = createGame(3);
    const groupsByCount = game.groups.slice().sort((a, b) => a.count - b.count);

    // Higher count should have larger radius
    expect(groupsByCount[groupsByCount.length - 1].radius)
      .toBeGreaterThanOrEqual(groupsByCount[0].radius);
  });

  it('config matches level config', () => {
    const game = createGame(2);
    const directConfig = getLevelConfig(2);

    expect(game.config.level).toBe(directConfig.level);
    expect(game.config.groupCount).toBe(directConfig.groupCount);
    expect(game.config.minCount).toBe(directConfig.minCount);
    expect(game.config.maxCount).toBe(directConfig.maxCount);
  });
});

describe('checkAnswer', () => {
  it('returns true when selected group count matches target', () => {
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 3, radius: 21 },
      { id: 1, x: 75, y: 30, count: 5, radius: 25 },
    ];
    const result = checkAnswer(0, groups, 3);
    expect(result).toBe(true);
  });

  it('returns false when selected group count does not match target', () => {
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 3, radius: 21 },
      { id: 1, x: 75, y: 30, count: 5, radius: 25 },
    ];
    const result = checkAnswer(0, groups, 5);
    expect(result).toBe(false);
  });

  it('returns false when group id not found', () => {
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 3, radius: 21 },
    ];
    const result = checkAnswer(99, groups, 3);
    expect(result).toBe(false);
  });

  it('works with any valid group id', () => {
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 3, radius: 21 },
      { id: 1, x: 75, y: 30, count: 5, radius: 25 },
      { id: 2, x: 25, y: 65, count: 2, radius: 19 },
    ];
    expect(checkAnswer(1, groups, 5)).toBe(true);
    expect(checkAnswer(2, groups, 2)).toBe(true);
  });

  it('handles zero target count', () => {
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 0, radius: 15 },
    ];
    const result = checkAnswer(0, groups, 0);
    expect(result).toBe(true);
  });
});

describe('generateQuestion', () => {
  it('returns a valid count from groups', () => {
    const config: LevelConfig = { level: 1, groupCount: 2, minCount: 1, maxCount: 3 };
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 2, radius: 19 },
      { id: 1, x: 75, y: 30, count: 3, radius: 21 },
    ];

    const targetCount = generateQuestion(config, groups);
    expect(typeof targetCount).toBe('number');
    expect([2, 3]).toContain(targetCount);
  });

  it('returns count within config range', () => {
    const config: LevelConfig = { level: 2, groupCount: 3, minCount: 2, maxCount: 5 };
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 2, radius: 19 },
      { id: 1, x: 75, y: 30, count: 4, radius: 23 },
      { id: 2, x: 25, y: 65, count: 6, radius: 27 },
    ];

    for (let i = 0; i < 10; i++) {
      const targetCount = generateQuestion(config, groups);
      expect(targetCount).toBeGreaterThanOrEqual(config.minCount);
      expect(targetCount).toBeLessThanOrEqual(config.maxCount);
    }
  });

  it('can generate different questions', () => {
    const config: LevelConfig = { level: 1, groupCount: 2, minCount: 1, maxCount: 3 };
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 1, radius: 17 },
      { id: 1, x: 75, y: 30, count: 3, radius: 21 },
    ];

    const results = new Set<number>();
    for (let i = 0; i < 20; i++) {
      results.add(generateQuestion(config, groups));
    }

    // Should get both 1 and 3 at some point
    expect(results.size).toBeGreaterThan(1);
  });

  it('handles single valid group', () => {
    const config: LevelConfig = { level: 1, groupCount: 2, minCount: 1, maxCount: 3 };
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 2, radius: 19 },
      { id: 1, x: 75, y: 30, count: 5, radius: 25 }, // Outside maxCount
    ];

    const targetCount = generateQuestion(config, groups);
    expect(targetCount).toBe(2); // Only valid count
  });

  it('filters counts outside config range', () => {
    const config: LevelConfig = { level: 1, groupCount: 2, minCount: 2, maxCount: 3 };
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 1, radius: 17 }, // Below minCount
      { id: 1, x: 75, y: 30, count: 5, radius: 25 }, // Above maxCount
      { id: 2, x: 25, y: 65, count: 2, radius: 19 }, // Valid
      { id: 3, x: 75, y: 65, count: 3, radius: 21 }, // Valid
    ];

    const targetCount = generateQuestion(config, groups);
    expect([2, 3]).toContain(targetCount);
    expect(targetCount).not.toBe(1);
    expect(targetCount).not.toBe(5);
  });
});

describe('calculateScore', () => {
  it('returns 100 for correct answer with no time left', () => {
    const score = calculateScore(true, 0);
    expect(score).toBe(100);
  });

  it('adds time bonus for correct answer', () => {
    const score = calculateScore(true, 5);
    expect(score).toBe(125); // 100 + 5×5
  });

  it('adds correct time bonus', () => {
    expect(calculateScore(true, 2)).toBe(110); // 100 + 2×5
    expect(calculateScore(true, 8)).toBe(140); // 100 + 8×5
    expect(calculateScore(true, 10)).toBe(150); // 100 + 10×5
  });

  it('returns 0 for incorrect answer', () => {
    const score = calculateScore(false, 10);
    expect(score).toBe(0);
  });

  it('returns 0 for incorrect answer regardless of time left', () => {
    expect(calculateScore(false, 0)).toBe(0);
    expect(calculateScore(false, 5)).toBe(0);
    expect(calculateScore(false, 10)).toBe(0);
  });

  it('handles large time values', () => {
    const score = calculateScore(true, 100);
    expect(score).toBe(600); // 100 + 100×5
  });

  it('handles negative time left', () => {
    // Negative time shouldn't happen in practice but test edge case
    const score = calculateScore(true, -5);
    expect(score).toBe(75); // 100 + (-5)×5
  });
});

describe('integration scenarios', () => {
  it('can simulate a complete game round', () => {
    const game = createGame(1);
    const targetCount = generateQuestion(game.config, game.groups);

    // Find a group that matches
    const correctGroup = game.groups.find(g => g.count === targetCount);
    expect(correctGroup).toBeDefined();

    if (correctGroup) {
      const isCorrect = checkAnswer(correctGroup.id, game.groups, targetCount);
      expect(isCorrect).toBe(true);
    }
  });

  it('can simulate multiple rounds', () => {
    for (let round = 0; round < 5; round++) {
      const game = createGame(2);
      const targetCount = generateQuestion(game.config, game.groups);
      const hasMatchingGroup = game.groups.some(g => g.count === targetCount);
      expect(hasMatchingGroup).toBe(true);
    }
  });

  it('can calculate total score for session', () => {
    let totalScore = 0;
    const timeLefts = [10, 8, 5, 3, 0]; // Various times

    for (const timeLeft of timeLefts) {
      totalScore += calculateScore(true, timeLeft);
    }

    expect(totalScore).toBe(630); // (150 + 140 + 125 + 115 + 100)
  });

  it('handles wrong answer scenario', () => {
    const game = createGame(1);
    const wrongTarget = 99; // Impossible count

    const isCorrect = checkAnswer(0, game.groups, wrongTarget);
    expect(isCorrect).toBe(false);
  });
});

describe('edge cases', () => {
  it('handles empty groups array', () => {
    const result = checkAnswer(0, [], 1);
    expect(result).toBe(false);
  });

  it('handles level 3 with maximum counts', () => {
    const game = createGame(3);

    for (const group of game.groups) {
      expect(group.count).toBeLessThanOrEqual(8);
    }
  });

  it('handles all groups with same count', () => {
    const config: LevelConfig = { level: 1, groupCount: 2, minCount: 1, maxCount: 3 };
    const groups: BubbleGroup[] = [
      { id: 0, x: 25, y: 30, count: 3, radius: 21 },
      { id: 1, x: 75, y: 30, count: 3, radius: 21 },
    ];

    const targetCount = generateQuestion(config, groups);
    expect(targetCount).toBe(3); // Only option
  });
});

describe('type definitions', () => {
  it('BubbleGroup interface is correctly implemented', () => {
    const group: BubbleGroup = {
      id: 1,
      x: 50,
      y: 50,
      count: 5,
      radius: 25,
    };

    expect(typeof group.id).toBe('number');
    expect(typeof group.x).toBe('number');
    expect(typeof group.y).toBe('number');
    expect(typeof group.count).toBe('number');
    expect(typeof group.radius).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 1,
      groupCount: 2,
      minCount: 1,
      maxCount: 3,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.groupCount).toBe('number');
    expect(typeof config.minCount).toBe('number');
    expect(typeof config.maxCount).toBe('number');
  });
});
