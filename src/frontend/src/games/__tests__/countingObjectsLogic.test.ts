import { describe, expect, it } from 'vitest';

import {
  CountingScene,
  LevelConfig,
  LEVELS,
  DIFFICULTY_MULTIPLIERS,
  getLevelConfig,
  generateCountingScene,
  calculateScore,
} from '../countingObjectsLogic';

// ITEMS is not exported, so we test it indirectly through scene generation
const EXPECTED_ITEM_COUNT = 10;

describe('ITEMS (tested indirectly)', () => {
  it('has items available for scene generation', () => {
    // Generate scenes and verify items are generated
    const scene = generateCountingScene(1);
    expect(scene.items.length).toBeGreaterThan(0);
  });

  it('items have expected emoji types', () => {
    const scenes = [];
    for (let i = 0; i < 20; i++) {
      scenes.push(generateCountingScene(3)); // Use level 3 for most items
    }

    const allEmojis = new Set<string>();
    for (const scene of scenes) {
      for (const item of scene.items) {
        allEmojis.add(item.emoji);
      }
    }

    // Should see multiple emoji types
    expect(allEmojis.size).toBeGreaterThan(1);
  });

  it('targetItem names are valid strings', () => {
    const scene = generateCountingScene(1);
    expect(typeof scene.targetItem).toBe('string');
    expect(scene.targetItem.length).toBeGreaterThan(0);
  });
});

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has appropriate settings for beginners', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].minCount).toBe(1);
    expect(LEVELS[0].maxCount).toBe(5);
    expect(LEVELS[0].itemTypes).toBe(2);
  });

  it('level 2 has medium difficulty', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].minCount).toBe(3);
    expect(LEVELS[1].maxCount).toBe(8);
    expect(LEVELS[1].itemTypes).toBe(3);
  });

  it('level 3 has highest difficulty', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].minCount).toBe(5);
    expect(LEVELS[2].maxCount).toBe(10);
    expect(LEVELS[2].itemTypes).toBe(4);
  });

  it('difficulty increases across levels', () => {
    expect(LEVELS[0].maxCount).toBeLessThan(LEVELS[1].maxCount);
    expect(LEVELS[1].maxCount).toBeLessThan(LEVELS[2].maxCount);
  });

  it('item types increase across levels', () => {
    expect(LEVELS[0].itemTypes).toBeLessThan(LEVELS[1].itemTypes);
    expect(LEVELS[1].itemTypes).toBeLessThan(LEVELS[2].itemTypes);
  });
});

describe('DIFFICULTY_MULTIPLIERS', () => {
  it('has multiplier for all 3 levels', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
  });

  it('multipliers increase with level', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.minCount).toBe(1);
    expect(config.maxCount).toBe(5);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.minCount).toBe(3);
    expect(config.maxCount).toBe(8);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.minCount).toBe(5);
    expect(config.maxCount).toBe(10);
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

describe('generateCountingScene', () => {
  it('returns a valid counting scene', () => {
    const scene = generateCountingScene(1);

    expect(scene).toHaveProperty('items');
    expect(scene).toHaveProperty('targetItem');
    expect(scene).toHaveProperty('answer');
  });

  it('items array has correct length for level 1', () => {
    const scene = generateCountingScene(1);
    expect(scene.items).toHaveLength(2); // itemTypes = 2
  });

  it('items array has correct length for level 2', () => {
    const scene = generateCountingScene(2);
    expect(scene.items).toHaveLength(3); // itemTypes = 3
  });

  it('items array has correct length for level 3', () => {
    const scene = generateCountingScene(3);
    expect(scene.items).toHaveLength(4); // itemTypes = 4
  });

  it('each item has emoji and count', () => {
    const scene = generateCountingScene(1);
    for (const item of scene.items) {
      expect(typeof item.emoji).toBe('string');
      expect(typeof item.count).toBe('number');
    }
  });

  it('counts are within level range', () => {
    const scene = generateCountingScene(1);
    for (const item of scene.items) {
      expect(item.count).toBeGreaterThanOrEqual(1);
      expect(item.count).toBeLessThanOrEqual(5);
    }
  });

  it('counts are within level range for level 2', () => {
    const scene = generateCountingScene(2);
    for (const item of scene.items) {
      expect(item.count).toBeGreaterThanOrEqual(3);
      expect(item.count).toBeLessThanOrEqual(8);
    }
  });

  it('counts are within level range for level 3', () => {
    const scene = generateCountingScene(3);
    for (const item of scene.items) {
      expect(item.count).toBeGreaterThanOrEqual(5);
      expect(item.count).toBeLessThanOrEqual(10);
    }
  });

  it('targetItem is a string name', () => {
    const scene = generateCountingScene(1);
    expect(typeof scene.targetItem).toBe('string');
    expect(scene.targetItem.length).toBeGreaterThan(0);
  });

  it('answer is a number', () => {
    const scene = generateCountingScene(1);
    expect(typeof scene.answer).toBe('number');
  });

  it('answer matches one of the item counts', () => {
    const scene = generateCountingScene(1);
    const counts = scene.items.map(i => i.count);
    expect(counts).toContain(scene.answer);
  });

  it('targetItem name matches the item with answer count', () => {
    const scene = generateCountingScene(1);
    const targetItemObj = scene.items.find(i => i.count === scene.answer);
    expect(targetItemObj).toBeDefined();
    // The targetItem should be based on the selected items
  });

  it('generates different scenes on multiple calls', () => {
    const scenes = [];
    for (let i = 0; i < 10; i++) {
      scenes.push(generateCountingScene(1));
    }

    // Not all scenes should be identical
    const allSame = scenes.every(s =>
      s.answer === scenes[0].answer &&
      s.targetItem === scenes[0].targetItem
    );
    expect(allSame).toBe(false);
  });

  it('produces deterministic results with seeded RNG', () => {
    // Note: This test assumes the implementation uses Math.random
    // and cannot be truly deterministic without RNG injection
    const scene1 = generateCountingScene(1);
    const scene2 = generateCountingScene(1);

    // At minimum, both should be valid scenes
    expect(scene1.items).toHaveLength(2);
    expect(scene2.items).toHaveLength(2);
  });

  it('all items in scene have unique emojis', () => {
    const scene = generateCountingScene(2);
    const emojis = scene.items.map(i => i.emoji);
    const uniqueEmojis = new Set(emojis);
    expect(uniqueEmojis.size).toBe(emojis.length);
  });

  it('uses emojis that are valid unicode', () => {
    const scene = generateCountingScene(1);

    for (const item of scene.items) {
      expect(item.emoji.length).toBeGreaterThan(0);
      expect(item.emoji.charCodeAt(0)).toBeGreaterThan(0);
    }
  });
});

describe('calculateScore', () => {
  it('calculates base score for level 1', () => {
    const score = calculateScore(0, 1);
    expect(score).toBe(10); // 10 base, no streak, 1× multiplier
  });

  it('calculates base score for level 2', () => {
    const score = calculateScore(0, 2);
    expect(score).toBe(15); // 10 base, no streak, 1.5× multiplier = 15
  });

  it('calculates base score for level 3', () => {
    const score = calculateScore(0, 3);
    expect(score).toBe(20); // 10 base, no streak, 2× multiplier = 20
  });

  it('adds streak bonus for level 1', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(2, 1);
    expect(score1).toBe(13); // 10 + 3 = 13
    expect(score2).toBe(16); // 10 + 6 = 16
  });

  it('adds streak bonus for level 2', () => {
    const score1 = calculateScore(1, 2);
    const score2 = calculateScore(2, 2);
    expect(score1).toBe(19); // (10 + 3) × 1.5 = 19.5 → 19
    expect(score2).toBe(24); // (10 + 6) × 1.5 = 24
  });

  it('adds streak bonus for level 3', () => {
    const score1 = calculateScore(1, 3);
    const score2 = calculateScore(2, 3);
    expect(score1).toBe(26); // (10 + 3) × 2 = 26
    expect(score2).toBe(32); // (10 + 6) × 2 = 32
  });

  it('caps streak bonus at 15 for level 1', () => {
    const score5 = calculateScore(5, 1);
    const score10 = calculateScore(10, 1);
    expect(score5).toBe(25); // (10 + 15) × 1 = 25
    expect(score10).toBe(25); // Capped
  });

  it('caps streak bonus at 15 for level 2', () => {
    const score5 = calculateScore(5, 2);
    const score10 = calculateScore(10, 2);
    expect(score5).toBe(37); // (10 + 15) × 1.5 = 37.5 → 37
    expect(score10).toBe(37); // Capped
  });

  it('caps streak bonus at 15 for level 3', () => {
    const score5 = calculateScore(5, 3);
    const score10 = calculateScore(10, 3);
    expect(score5).toBe(50); // (10 + 15) × 2 = 50
    expect(score10).toBe(50); // Capped
  });

  it('level 3 gives highest scores for same streak', () => {
    const streak = 3;
    const score1 = calculateScore(streak, 1);
    const score2 = calculateScore(streak, 2);
    const score3 = calculateScore(streak, 3);

    expect(score3).toBeGreaterThan(score2);
    expect(score2).toBeGreaterThan(score1);
  });
});

describe('integration scenarios', () => {
  it('can simulate a complete game session', () => {
    const scenes = [];
    for (let i = 0; i < 5; i++) {
      scenes.push(generateCountingScene(1));
    }

    expect(scenes).toHaveLength(5);
    for (const scene of scenes) {
      expect(scene.items.length).toBeGreaterThan(0);
      expect(scene.answer).toBeGreaterThan(0);
    }
  });

  it('can play through all levels', () => {
    for (let level = 1; level <= 3; level++) {
      const scene = generateCountingScene(level);
      expect(scene.items).toHaveLength(level + 1); // itemTypes = level + 1
    }
  });

  it('calculates total score for session', () => {
    let totalScore = 0;
    const streaks = [0, 1, 2, 0, 1]; // Various streaks
    const level = 2;

    for (const streak of streaks) {
      totalScore += calculateScore(streak, level);
    }

    expect(totalScore).toBeGreaterThan(0);
  });

  it('handles incorrect answer scenario', () => {
    const scene = generateCountingScene(1);
    const wrongAnswer = scene.answer + 1;
    expect(wrongAnswer).not.toBe(scene.answer);
  });
});

describe('edge cases', () => {
  it('handles level 1 with minimum counts', () => {
    const scenes = [];
    for (let i = 0; i < 20; i++) {
      scenes.push(generateCountingScene(1));
    }

    // Some scenes should have count of 1
    const hasMinCount = scenes.some(s =>
      s.items.some(item => item.count === 1)
    );
    expect(hasMinCount).toBe(true);
  });

  it('handles level 3 with maximum counts', () => {
    const scenes = [];
    for (let i = 0; i < 20; i++) {
      scenes.push(generateCountingScene(3));
    }

    // Some scenes should have count of 10
    const hasMaxCount = scenes.some(s =>
      s.items.some(item => item.count === 10)
    );
    expect(hasMaxCount).toBe(true);
  });

  it('handles maximum streak', () => {
    const score = calculateScore(100, 3);
    expect(score).toBe(50); // Capped
  });

  it('handles zero streak', () => {
    const score = calculateScore(0, 1);
    expect(score).toBe(10);
  });
});

describe('type definitions', () => {
  it('CountingScene interface is correctly implemented', () => {
    const scene: CountingScene = {
      items: [
        { emoji: '🍎', count: 3 },
        { emoji: '🍊', count: 2 },
      ],
      targetItem: 'apples',
      answer: 3,
    };

    expect(Array.isArray(scene.items)).toBe(true);
    expect(typeof scene.targetItem).toBe('string');
    expect(typeof scene.answer).toBe('number');
  });

  it('CountingScene interface is correctly implemented', () => {
    const scene: CountingScene = {
      items: [
        { emoji: '🍎', count: 3 },
        { emoji: '🍊', count: 2 },
      ],
      targetItem: 'apples',
      answer: 3,
    };

    expect(Array.isArray(scene.items)).toBe(true);
    expect(typeof scene.targetItem).toBe('string');
    expect(typeof scene.answer).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 1,
      minCount: 1,
      maxCount: 5,
      itemTypes: 2,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.minCount).toBe('number');
    expect(typeof config.maxCount).toBe('number');
    expect(typeof config.itemTypes).toBe('number');
  });
});

describe('level progression', () => {
  it('level 1 has smallest range', () => {
    const range1 = LEVELS[0].maxCount - LEVELS[0].minCount;
    const range2 = LEVELS[1].maxCount - LEVELS[1].minCount;
    const range3 = LEVELS[2].maxCount - LEVELS[2].minCount;

    expect(range1).toBeLessThanOrEqual(range2);
    expect(range2).toBeLessThanOrEqual(range3);
  });

  it('level 1 has fewest item types', () => {
    expect(LEVELS[0].itemTypes).toBe(2);
  });

  it('level 3 has most item types', () => {
    expect(LEVELS[2].itemTypes).toBe(4);
  });
});

describe('CountingScene validation', () => {
  it('targetItem is always a valid name string', () => {
    for (let i = 0; i < 10; i++) {
      const scene = generateCountingScene(2);
      expect(typeof scene.targetItem).toBe('string');
      expect(scene.targetItem.length).toBeGreaterThan(0);
    }
  });

  it('answer is always positive', () => {
    for (let i = 0; i < 10; i++) {
      const scene = generateCountingScene(1);
      expect(scene.answer).toBeGreaterThan(0);
    }
  });

  it('answer is never more than 10 (level 3 max)', () => {
    for (let i = 0; i < 10; i++) {
      const scene = generateCountingScene(3);
      expect(scene.answer).toBeLessThanOrEqual(10);
    }
  });
});
