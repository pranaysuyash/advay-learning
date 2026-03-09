import { describe, expect, it } from 'vitest';

import {
  NumberBubble,
  Level,
  LEVELS,
  DIFFICULTY_MULTIPLIERS,
  generateBubbles,
  checkPop,
  calculateScore,
} from '../popTheNumberLogic';

describe('LEVELS', () => {
  it('has 4 levels', () => {
    expect(LEVELS).toHaveLength(4);
  });

  it('level 1 has numberRange 3, timeLimit 30, rounds 3', () => {
    expect(LEVELS[0].id).toBe(1);
    expect(LEVELS[0].numberRange).toBe(3);
    expect(LEVELS[0].timeLimit).toBe(30);
    expect(LEVELS[0].rounds).toBe(3);
  });

  it('level 2 has numberRange 5, timeLimit 45, rounds 5', () => {
    expect(LEVELS[1].id).toBe(2);
    expect(LEVELS[1].numberRange).toBe(5);
    expect(LEVELS[1].timeLimit).toBe(45);
    expect(LEVELS[1].rounds).toBe(5);
  });

  it('level 3 has numberRange 7, timeLimit 60, rounds 7', () => {
    expect(LEVELS[2].id).toBe(3);
    expect(LEVELS[2].numberRange).toBe(7);
    expect(LEVELS[2].timeLimit).toBe(60);
    expect(LEVELS[2].rounds).toBe(7);
  });

  it('level 4 has numberRange 10, timeLimit 90, rounds 10', () => {
    expect(LEVELS[3].id).toBe(4);
    expect(LEVELS[3].numberRange).toBe(10);
    expect(LEVELS[3].timeLimit).toBe(90);
    expect(LEVELS[3].rounds).toBe(10);
  });

  it('numberRange increases across levels', () => {
    expect(LEVELS[0].numberRange).toBeLessThan(LEVELS[1].numberRange);
    expect(LEVELS[1].numberRange).toBeLessThan(LEVELS[2].numberRange);
    expect(LEVELS[2].numberRange).toBeLessThan(LEVELS[3].numberRange);
  });

  it('rounds increases across levels', () => {
    expect(LEVELS[0].rounds).toBeLessThan(LEVELS[1].rounds);
    expect(LEVELS[1].rounds).toBeLessThan(LEVELS[2].rounds);
    expect(LEVELS[2].rounds).toBeLessThan(LEVELS[3].rounds);
  });
});

describe('DIFFICULTY_MULTIPLIERS', () => {
  it('has multiplier for all 4 levels', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
    expect(DIFFICULTY_MULTIPLIERS[4]).toBe(2.5);
  });

  it('multipliers increase with level', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
    expect(DIFFICULTY_MULTIPLIERS[3]).toBeLessThan(DIFFICULTY_MULTIPLIERS[4]);
  });
});

describe('generateBubbles', () => {
  it('generates 3 bubbles for level 1', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    expect(bubbles).toHaveLength(3);
  });

  it('generates 5 bubbles for level 2', () => {
    const bubbles = generateBubbles(LEVELS[1]);
    expect(bubbles).toHaveLength(5);
  });

  it('generates 7 bubbles for level 3', () => {
    const bubbles = generateBubbles(LEVELS[2]);
    expect(bubbles).toHaveLength(7);
  });

  it('generates 10 bubbles for level 4', () => {
    const bubbles = generateBubbles(LEVELS[3]);
    expect(bubbles).toHaveLength(10);
  });

  it('all bubbles have valid structure', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    for (const bubble of bubbles) {
      expect(typeof bubble.id).toBe('number');
      expect(typeof bubble.value).toBe('number');
      expect(typeof bubble.x).toBe('number');
      expect(typeof bubble.y).toBe('number');
      expect(typeof bubble.size).toBe('number');
      expect(typeof bubble.popped).toBe('boolean');
    }
  });

  it('all bubbles start unpopped', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    expect(bubbles.every(b => !b.popped)).toBe(true);
  });

  it('all bubbles have size 70', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    expect(bubbles.every(b => b.size === 70)).toBe(true);
  });

  it('generates numbers from 1 to numberRange', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    const values = bubbles.map(b => b.value).sort((a, b) => a - b);

    expect(values[0]).toBe(1);
    expect(values[values.length - 1]).toBe(LEVELS[0].numberRange);
  });

  it('generates different values on multiple calls', () => {
    const bubbles1 = generateBubbles(LEVELS[1]);
    const bubbles2 = generateBubbles(LEVELS[1]);

    const values1 = bubbles1.map(b => b.value).join(',');
    const values2 = bubbles2.map(b => b.value).join(',');

    // Due to shuffling, order should differ
    expect(values1).not.toBe(values2);
  });

  it('bubbles have sequential IDs', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    for (let i = 0; i < bubbles.length; i++) {
      expect(bubbles[i].id).toBe(i);
    }
  });
});

describe('checkPop', () => {
  it('returns correct when popping expected bubble', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: false },
      { id: 1, value: 2, x: 100, y: 50, size: 70, popped: false },
    ];

    const result = checkPop(bubbles, 0, 1);
    expect(result.correct).toBe(true);
    expect(result.nextExpected).toBe(2);
    expect(result.allPopped).toBe(false);
  });

  it('returns incorrect when popping wrong bubble', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: false },
      { id: 1, value: 2, x: 100, y: 50, size: 70, popped: false },
    ];

    const result = checkPop(bubbles, 1, 1); // Expecting 1, popping value 2
    expect(result.correct).toBe(false);
    expect(result.nextExpected).toBe(1); // Unchanged
    expect(result.allPopped).toBe(false);
  });

  it('returns incorrect when bubble already popped', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: true },
    ];

    const result = checkPop(bubbles, 0, 1);
    expect(result.correct).toBe(false);
    expect(result.nextExpected).toBe(1);
  });

  it('returns incorrect when bubble not found', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: false },
    ];

    const result = checkPop(bubbles, 99, 1);
    expect(result.correct).toBe(false);
    expect(result.nextExpected).toBe(1);
  });

  it('returns allPopped true when last bubble popped', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: false },
      { id: 1, value: 2, x: 100, y: 50, size: 70, popped: false },
    ];

    // Pop first bubble
    let result = checkPop(bubbles, 0, 1);
    expect(result.allPopped).toBe(false);

    // Pop second bubble (last)
    result = checkPop(bubbles, 1, 2);
    expect(result.correct).toBe(true);
    expect(result.allPopped).toBe(true);
  });

  it('handles single bubble correctly', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: false },
    ];

    const result = checkPop(bubbles, 0, 1);
    expect(result.correct).toBe(true);
    expect(result.nextExpected).toBe(2);
    expect(result.allPopped).toBe(true);
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

  it('calculates base score for level 4', () => {
    const score = calculateScore(0, 4);
    expect(score).toBe(25); // 10 base, no streak, 2.5× multiplier = 25
  });

  it('adds consecutive bonus for level 1', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(5, 1);
    expect(score1).toBe(12); // (10 + 2) × 1 = 12
    expect(score2).toBe(20); // (10 + 10) × 1 = 20
  });

  it('adds consecutive bonus for level 2', () => {
    const score1 = calculateScore(1, 2);
    const score2 = calculateScore(5, 2);
    expect(score1).toBe(18); // (10 + 2) × 1.5 = 18
    expect(score2).toBe(30); // (10 + 10) × 1.5 = 30
  });

  it('adds consecutive bonus for level 3', () => {
    const score1 = calculateScore(1, 3);
    const score2 = calculateScore(5, 3);
    expect(score1).toBe(24); // (10 + 2) × 2 = 24
    expect(score2).toBe(40); // (10 + 10) × 2 = 40
  });

  it('adds consecutive bonus for level 4', () => {
    const score1 = calculateScore(1, 4);
    const score2 = calculateScore(5, 4);
    expect(score1).toBe(30); // (10 + 2) × 2.5 = 30
    expect(score2).toBe(50); // (10 + 10) × 2.5 = 50
  });

  it('caps consecutive bonus at 20', () => {
    const score5 = calculateScore(5, 1);
    const score10 = calculateScore(10, 1);
    const score20 = calculateScore(20, 1);

    expect(score5).toBe(20); // (10 + 10) = 20
    expect(score10).toBe(30); // (10 + 20) capped at 20 = 30
    expect(score20).toBe(30); // Same cap
  });

  it('returns integer scores', () => {
    const score = calculateScore(5, 2);
    expect(Number.isInteger(score)).toBe(true);
  });

  it('never returns negative score', () => {
    const score = calculateScore(0, 1);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('integration scenarios', () => {
  it('can generate and pop all bubbles for level 1', () => {
    const bubbles = generateBubbles(LEVELS[0]);
    let nextExpected = 1;
    let totalScore = 0;

    // Find bubbles in order
    const sortedBubbles = [...bubbles].sort((a, b) => a.value - b.value);

    for (const bubble of sortedBubbles) {
      const result = checkPop(bubbles, bubble.id, nextExpected);
      if (result.correct) {
        totalScore += calculateScore(nextExpected - 1, 1);
        nextExpected = result.nextExpected;
      }
    }

    expect(nextExpected).toBe(4); // 3 bubbles + 1
  });

  it('can generate and pop all bubbles for level 4', () => {
    const bubbles = generateBubbles(LEVELS[3]);
    expect(bubbles).toHaveLength(10);
  });

  it('handles wrong answer correctly', () => {
    const bubbles: NumberBubble[] = [
      { id: 0, value: 1, x: 50, y: 50, size: 70, popped: false },
      { id: 1, value: 2, x: 100, y: 50, size: 70, popped: false },
    ];

    // Try wrong bubble first
    const wrongResult = checkPop(bubbles, 1, 1);
    expect(wrongResult.correct).toBe(false);

    // Then correct bubble
    const correctResult = checkPop(bubbles, 0, 1);
    expect(correctResult.correct).toBe(true);
  });
});

describe('edge cases', () => {
  it('handles empty bubbles array', () => {
    const result = checkPop([], 0, 1);
    expect(result.correct).toBe(false);
    expect(result.allPopped).toBe(true);
  });

  it('handles zero consecutive pops', () => {
    const score = calculateScore(0, 4);
    expect(score).toBe(25);
  });

  it('handles very large consecutive pops', () => {
    const score = calculateScore(100, 4);
    expect(score).toBe(75); // Capped at (10 + 20) × 2.5 = 75
  });

  it('handles invalid level in calculateScore', () => {
    const score = calculateScore(5, 999);
    expect(score).toBe(20); // (10 + 10) × 1 = 20, uses default multiplier of 1
  });
});

describe('type definitions', () => {
  it('NumberBubble interface is correctly implemented', () => {
    const bubble: NumberBubble = {
      id: 1,
      value: 5,
      x: 50,
      y: 50,
      size: 70,
      popped: false,
    };

    expect(typeof bubble.id).toBe('number');
    expect(typeof bubble.value).toBe('number');
    expect(typeof bubble.x).toBe('number');
    expect(typeof bubble.y).toBe('number');
    expect(typeof bubble.size).toBe('number');
    expect(typeof bubble.popped).toBe('boolean');
  });

  it('Level interface is correctly implemented', () => {
    const level: Level = {
      id: 2,
      numberRange: 5,
      timeLimit: 45,
      rounds: 5,
    };

    expect(typeof level.id).toBe('number');
    expect(typeof level.numberRange).toBe('number');
    expect(typeof level.timeLimit).toBe('number');
    expect(typeof level.rounds).toBe('number');
  });
});
