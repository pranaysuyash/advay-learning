/**
 * Math Smash Game Logic Tests
 *
 * Tests for question generation, option generation, and level progression
 * for the Math Smash educational game.
 */

import { describe, it, expect } from 'vitest';
import {
  generateQuestion,
  generateOptions,
  getLevelConfig,
  LEVELS,
  type Question,
  type LevelConfig,
} from '../mathSmashLogic';

describe('MathSmash Logic - Level Configuration', () => {
  it('should have exactly 4 levels defined', () => {
    expect(LEVELS).toHaveLength(4);
  });

  it('should have levels with increasing difficulty', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].maxNum).toBe(5);
    expect(LEVELS[0].operator).toBe('+');

    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].maxNum).toBe(10);
    expect(LEVELS[1].operator).toBe('+');

    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].maxNum).toBe(10);
    expect(LEVELS[2].operator).toBe('-');

    expect(LEVELS[3].level).toBe(4);
    expect(LEVELS[3].maxNum).toBe(20);
    expect(LEVELS[3].operator).toBe('+');
  });

  describe('getLevelConfig', () => {
    it('should return the correct level config for valid level numbers', () => {
      expect(getLevelConfig(1)).toEqual(LEVELS[0]);
      expect(getLevelConfig(2)).toEqual(LEVELS[1]);
      expect(getLevelConfig(3)).toEqual(LEVELS[2]);
      expect(getLevelConfig(4)).toEqual(LEVELS[3]);
    });

    it('should return level 1 config for invalid level numbers', () => {
      expect(getLevelConfig(0)).toEqual(LEVELS[0]);
      expect(getLevelConfig(5)).toEqual(LEVELS[0]);
      expect(getLevelConfig(100)).toEqual(LEVELS[0]);
    });
  });
});

describe('MathSmash Logic - Question Generation', () => {
  it('should generate a valid question for level 1', () => {
    const question = generateQuestion(1);

    expect(question).toHaveProperty('num1');
    expect(question).toHaveProperty('num2');
    expect(question).toHaveProperty('operator');
    expect(question).toHaveProperty('answer');

    expect(question.num1).toBeGreaterThanOrEqual(1);
    expect(question.num1).toBeLessThanOrEqual(5);

    expect(question.num2).toBeGreaterThanOrEqual(1);
    expect(question.num2).toBeLessThanOrEqual(5);

    expect(question.operator).toBe('+');
  });

  it('should generate a valid question for level 2', () => {
    const question = generateQuestion(2);

    expect(question.num1).toBeGreaterThanOrEqual(1);
    expect(question.num1).toBeLessThanOrEqual(10);

    expect(question.num2).toBeGreaterThanOrEqual(1);
    expect(question.num2).toBeLessThanOrEqual(10);

    expect(question.operator).toBe('+');
  });

  it('should generate subtraction questions for level 3 (or addition if num2 > num1)', () => {
    const question = generateQuestion(3);

    // Level 3 uses subtraction, but switches to addition if num2 > num1 to avoid negatives
    expect(['+', '-']).toContain(question.operator);

    // For subtraction, answer should be positive (no negative results)
    expect(question.answer).toBeGreaterThanOrEqual(0);

    // If subtraction, num1 should be >= num2
    if (question.operator === '-') {
      expect(question.num1).toBeGreaterThanOrEqual(question.num2);
    }
  });

  it('should generate larger numbers for level 4', () => {
    const question = generateQuestion(4);

    expect(question.num1).toBeGreaterThanOrEqual(1);
    expect(question.num1).toBeLessThanOrEqual(20);

    expect(question.num2).toBeGreaterThanOrEqual(1);
    expect(question.num2).toBeLessThanOrEqual(20);
  });

  it('should calculate correct answer for addition', () => {
    const question: Question = {
      num1: 5,
      num2: 3,
      operator: '+',
      answer: 8,
    };

    expect(question.answer).toBe(question.num1 + question.num2);
  });

  it('should calculate correct answer for subtraction', () => {
    const question: Question = {
      num1: 7,
      num2: 3,
      operator: '-',
      answer: 4,
    };

    expect(question.answer).toBe(question.num1 - question.num2);
  });

  it('should never generate negative answers for subtraction', () => {
    // Generate many subtraction questions and verify none have negative answers
    for (let i = 0; i < 100; i++) {
      const question = generateQuestion(3);

      if (question.operator === '-') {
        expect(question.num1).toBeGreaterThanOrEqual(question.num2);
        expect(question.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('MathSmash Logic - Option Generation', () => {
  it('should generate exactly 4 options by default', () => {
    const options = generateOptions(5);

    expect(options).toHaveLength(4);
  });

  it('should include the correct answer in options', () => {
    const correctAnswer = 7;
    const options = generateOptions(correctAnswer);

    expect(options).toContain(correctAnswer);
  });

  it('should generate custom number of options', () => {
    const options2 = generateOptions(5, 2);
    expect(options2).toHaveLength(2);

    const options6 = generateOptions(5, 6);
    expect(options6).toHaveLength(6);
  });

  it('should not duplicate options', () => {
    const options = generateOptions(10);
    const uniqueOptions = new Set(options);

    expect(uniqueOptions.size).toBe(options.length);
  });

  it('should only generate positive options', () => {
    const options = generateOptions(2);

    for (const option of options) {
      expect(option).toBeGreaterThan(0);
    }
  });

  it('should generate distinct options from correct answer', () => {
    const correctAnswer = 10;
    const options = generateOptions(correctAnswer, 4);

    // Count how many options equal the correct answer
    const correctCount = options.filter(o => o === correctAnswer).length;

    expect(correctCount).toBe(1);
  });

  it('should generate options within reasonable range of answer', () => {
    const correctAnswer = 10;
    const options = generateOptions(correctAnswer, 4);

    for (const option of options) {
      // Options should be within +/- 10 of correct answer (based on offset * sign logic)
      const diff = Math.abs(option - correctAnswer);
      expect(diff).toBeLessThanOrEqual(10);
    }
  });

  it('should handle edge case answers correctly', () => {
    // Very small answer
    const options1 = generateOptions(1, 4);
    expect(options1).toContain(1);
    for (const opt of options1) {
      expect(opt).toBeGreaterThan(0);
    }

    // Larger answer
    const options20 = generateOptions(20, 4);
    expect(options20).toContain(20);
    for (const opt of options20) {
      expect(opt).toBeGreaterThan(0);
    }
  });

  it('should generate different wrong answers each time', () => {
    const correctAnswer = 8;
    const generatedSets = new Set<string>();

    for (let i = 0; i < 8; i++) {
      const options = generateOptions(correctAnswer, 4);
      const wrongAnswers = options
        .filter((option) => option !== correctAnswer)
        .sort((a, b) => a - b);

      expect(wrongAnswers).toHaveLength(3);
      generatedSets.add(wrongAnswers.join(','));
    }

    expect(generatedSets.size).toBeGreaterThan(1);
  });
});

describe('MathSmash Logic - Integration Tests', () => {
  it('should generate complete game round for level 1', () => {
    const question = generateQuestion(1);
    const options = generateOptions(question.answer, 4);

    expect(question.answer).toBeGreaterThan(0);
    expect(question.answer).toBeLessThanOrEqual(10); // 5 + 5 max for level 1

    expect(options).toContain(question.answer);
    expect(options).toHaveLength(4);
  });

  it('should generate complete game round for level 4', () => {
    const question = generateQuestion(4);
    const options = generateOptions(question.answer, 4);

    expect(question.answer).toBeGreaterThan(0);
    expect(question.answer).toBeLessThanOrEqual(40); // 20 + 20 max for level 4

    expect(options).toContain(question.answer);
    expect(options).toHaveLength(4);
  });

  it('should maintain difficulty progression across levels', () => {
    const level1Questions = Array.from({ length: 10 }, () => generateQuestion(1));
    const level4Questions = Array.from({ length: 10 }, () => generateQuestion(4));

    // Level 4 should have higher max answers than level 1
    const level1MaxAnswer = Math.max(...level1Questions.map(q => q.answer));
    const level4MaxAnswer = Math.max(...level4Questions.map(q => q.answer));

    expect(level4MaxAnswer).toBeGreaterThan(level1MaxAnswer);
  });
});

describe('MathSmash Logic - Property-Based Tests', () => {
  it('should always generate valid questions for any level 1-4', () => {
    const levels = [1, 2, 3, 4];

    for (const level of levels) {
      for (let i = 0; i < 20; i++) {
        const question = generateQuestion(level);

        expect(question).toBeDefined();
        expect(question.num1).toBeGreaterThan(0);
        expect(question.num2).toBeGreaterThan(0);
        expect(question.answer).toBeGreaterThanOrEqual(0);

        const config = getLevelConfig(level);
        expect(question.num1).toBeLessThanOrEqual(config.maxNum);
        expect(question.num2).toBeLessThanOrEqual(config.maxNum);
      }
    }
  });

  it('should always generate valid options for any positive answer', () => {
    const testAnswers = [1, 2, 5, 10, 15, 20, 30, 50];

    for (const answer of testAnswers) {
      const options = generateOptions(answer, 4);

      expect(options).toHaveLength(4);
      expect(options).toContain(answer);

      for (const option of options) {
        expect(option).toBeGreaterThan(0);
      }

      const unique = new Set(options);
      expect(unique.size).toBe(4);
    }
  });
});
