import { describe, expect, it } from 'vitest';

import {
  QuantityGroup,
  CompareQuestion,
  LevelConfig,
  LEVELS,
  DIFFICULTY_MULTIPLIERS,
  getLevelConfig,
  generateQuestion,
  calculateScore,
} from '../moreOrLessLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has minCount 1 and maxCount 5', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].minCount).toBe(1);
    expect(LEVELS[0].maxCount).toBe(5);
  });

  it('level 2 has minCount 3 and maxCount 8', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].minCount).toBe(3);
    expect(LEVELS[1].maxCount).toBe(8);
  });

  it('level 3 has minCount 5 and maxCount 12', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].minCount).toBe(5);
    expect(LEVELS[2].maxCount).toBe(12);
  });

  it('minCount increases across levels', () => {
    expect(LEVELS[0].minCount).toBeLessThan(LEVELS[1].minCount);
    expect(LEVELS[1].minCount).toBeLessThan(LEVELS[2].minCount);
  });

  it('maxCount increases across levels', () => {
    expect(LEVELS[0].maxCount).toBeLessThan(LEVELS[1].maxCount);
    expect(LEVELS[1].maxCount).toBeLessThan(LEVELS[2].maxCount);
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
    expect(config.maxCount).toBe(12);
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

describe('generateQuestion', () => {
  it('returns a valid question', () => {
    const question = generateQuestion(1);

    expect(question).toHaveProperty('left');
    expect(question).toHaveProperty('right');
    expect(question).toHaveProperty('question');
  });

  it('left group has valid properties', () => {
    const question = generateQuestion(1);

    expect(typeof question.left.emoji).toBe('string');
    expect(typeof question.left.count).toBe('number');
  });

  it('right group has valid properties', () => {
    const question = generateQuestion(1);

    expect(typeof question.right.emoji).toBe('string');
    expect(typeof question.right.count).toBe('number');
  });

  it('left and right use same emoji', () => {
    const question = generateQuestion(1);

    expect(question.left.emoji).toBe(question.right.emoji);
  });

  it('left count is within level range', () => {
    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(1);
      expect(question.left.count).toBeGreaterThanOrEqual(1);
      expect(question.left.count).toBeLessThanOrEqual(5);
    }
  });

  it('right count is within level range', () => {
    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(1);
      expect(question.right.count).toBeGreaterThanOrEqual(1);
      expect(question.right.count).toBeLessThanOrEqual(5);
    }
  });

  it('left and right counts are different', () => {
    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(1);
      expect(question.left.count).not.toBe(question.right.count);
    }
  });

  it('question is either "more" or "less"', () => {
    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(1);
      expect(['more', 'less']).toContain(question.question);
    }
  });

  it('level 1 generates counts from 1 to 5', () => {
    const counts = new Set<number>();

    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(1);
      counts.add(question.left.count);
      counts.add(question.right.count);
    }

    for (const count of counts) {
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it('level 2 generates counts from 3 to 8', () => {
    const counts = new Set<number>();

    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(2);
      counts.add(question.left.count);
      counts.add(question.right.count);
    }

    for (const count of counts) {
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(8);
    }
  });

  it('level 3 generates counts from 5 to 12', () => {
    const counts = new Set<number>();

    for (let i = 0; i < 20; i++) {
      const question = generateQuestion(3);
      counts.add(question.left.count);
      counts.add(question.right.count);
    }

    for (const count of counts) {
      expect(count).toBeGreaterThanOrEqual(5);
      expect(count).toBeLessThanOrEqual(12);
    }
  });

  it('generates different questions on multiple calls', () => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const question = generateQuestion(2);
      questions.push(`${question.left.count}-${question.right.count}-${question.question}`);
    }

    const uniqueQuestions = new Set(questions);
    expect(uniqueQuestions.size).toBeGreaterThan(1);
  });

  it('emoji is a valid emoji string', () => {
    const question = generateQuestion(1);

    expect(question.left.emoji.length).toBeGreaterThan(0);
    expect(typeof question.left.emoji).toBe('string');
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
    expect(score).toBe(20); // 10 base, no streak, 2× multiplier
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
    expect(score1).toBe(19); // (10 + 3) × 1.5 = 19
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
  it('can determine correct answer for "more" question', () => {
    const question: CompareQuestion = {
      left: { emoji: '🍎', count: 3 },
      right: { emoji: '🍎', count: 5 },
      question: 'more',
    };

    const correctSide = question.left.count > question.right.count ? 'left' : 'right';
    expect(correctSide).toBe('right');
  });

  it('can determine correct answer for "less" question', () => {
    const question: CompareQuestion = {
      left: { emoji: '🍎', count: 7 },
      right: { emoji: '🍎', count: 4 },
      question: 'less',
    };

    const correctSide = question.left.count < question.right.count ? 'left' : 'right';
    expect(correctSide).toBe('right');
  });

  it('can simulate a complete game round for level 1', () => {
    const question = generateQuestion(1);

    expect(question.left.count).toBeGreaterThanOrEqual(1);
    expect(question.left.count).toBeLessThanOrEqual(5);
    expect(question.right.count).toBeGreaterThanOrEqual(1);
    expect(question.right.count).toBeLessThanOrEqual(5);
    expect(question.left.count).not.toBe(question.right.count);
  });

  it('can simulate a complete game round for level 2', () => {
    const question = generateQuestion(2);

    expect(question.left.count).toBeGreaterThanOrEqual(3);
    expect(question.left.count).toBeLessThanOrEqual(8);
    expect(question.right.count).toBeGreaterThanOrEqual(3);
    expect(question.right.count).toBeLessThanOrEqual(8);
    expect(question.left.count).not.toBe(question.right.count);
  });

  it('can simulate a complete game round for level 3', () => {
    const question = generateQuestion(3);

    expect(question.left.count).toBeGreaterThanOrEqual(5);
    expect(question.left.count).toBeLessThanOrEqual(12);
    expect(question.right.count).toBeGreaterThanOrEqual(5);
    expect(question.right.count).toBeLessThanOrEqual(12);
    expect(question.left.count).not.toBe(question.right.count);
  });

  it('can calculate total score for session', () => {
    let totalScore = 0;
    const streaks = [0, 1, 2, 3, 1];
    const level = 2;

    for (const streak of streaks) {
      totalScore += calculateScore(streak, level);
    }

    expect(totalScore).toBeGreaterThan(0);
  });
});

describe('edge cases', () => {
  it('handles minimum difference (counts differ by 1)', () => {
    // This is possible with the generation logic
    const questions = [];
    for (let i = 0; i < 50; i++) {
      questions.push(generateQuestion(1));
    }

    // Find a question with difference of 1
    const closeQuestion = questions.find(
      q => Math.abs(q.left.count - q.right.count) === 1
    );

    expect(closeQuestion).toBeDefined();
  });

  it('handles maximum difference for level 1', () => {
    // Max difference for level 1 is 4 (5-1)
    const questions = [];
    for (let i = 0; i < 50; i++) {
      questions.push(generateQuestion(1));
    }

    const maxDiff = Math.max(
      ...questions.map(q => Math.abs(q.left.count - q.right.count))
    );
    expect(maxDiff).toBeLessThanOrEqual(4);
  });

  it('handles maximum difference for level 3', () => {
    // Max difference for level 3 is 7 (12-5)
    const questions = [];
    for (let i = 0; i < 50; i++) {
      questions.push(generateQuestion(3));
    }

    const maxDiff = Math.max(
      ...questions.map(q => Math.abs(q.left.count - q.right.count))
    );
    expect(maxDiff).toBeLessThanOrEqual(7);
  });

  it('handles both question types', () => {
    const questions = [];
    for (let i = 0; i < 20; i++) {
      questions.push(generateQuestion(1));
    }

    const hasMore = questions.some(q => q.question === 'more');
    const hasLess = questions.some(q => q.question === 'less');

    expect(hasMore).toBe(true);
    expect(hasLess).toBe(true);
  });
});

describe('type definitions', () => {
  it('QuantityGroup interface is correctly implemented', () => {
    const group: QuantityGroup = {
      emoji: '🍎',
      count: 3,
    };

    expect(typeof group.emoji).toBe('string');
    expect(typeof group.count).toBe('number');
  });

  it('CompareQuestion interface is correctly implemented', () => {
    const question: CompareQuestion = {
      left: { emoji: '🍎', count: 3 },
      right: { emoji: '🍎', count: 5 },
      question: 'more',
    };

    expect(typeof question.left).toBe('object');
    expect(typeof question.right).toBe('object');
    expect(['more', 'less']).toContain(question.question);
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      minCount: 3,
      maxCount: 8,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.minCount).toBe('number');
    expect(typeof config.maxCount).toBe('number');
  });
});

describe('question validation', () => {
  it('all counts are positive integers', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 10; i++) {
        const question = generateQuestion(level);
        expect(question.left.count).toBeGreaterThan(0);
        expect(question.right.count).toBeGreaterThan(0);
        expect(Number.isInteger(question.left.count)).toBe(true);
        expect(Number.isInteger(question.right.count)).toBe(true);
      }
    }
  });

  it('emoji is consistent across both groups', () => {
    for (let i = 0; i < 10; i++) {
      const question = generateQuestion(2);
      expect(question.left.emoji).toBe(question.right.emoji);
    }
  });

  it('counts are never equal', () => {
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 20; i++) {
        const question = generateQuestion(level);
        expect(question.left.count).not.toBe(question.right.count);
      }
    }
  });
});

describe('level progression', () => {
  it('level 1 has simplest range', () => {
    const config = getLevelConfig(1);
    expect(config.maxCount - config.minCount).toBe(4); // 5 - 1 = 4
  });

  it('level 2 has medium range', () => {
    const config = getLevelConfig(2);
    expect(config.maxCount - config.minCount).toBe(5); // 8 - 3 = 5
  });

  it('level 3 has widest range', () => {
    const config = getLevelConfig(3);
    expect(config.maxCount - config.minCount).toBe(7); // 12 - 5 = 7
  });
});
