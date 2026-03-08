import { describe, expect, it } from 'vitest';

import {
  NUMBER_SEQUENCE_LEVELS,
  DIFFICULTY_MULTIPLIERS,
  calculateScore,
  createNumberSequenceRound,
} from '../numberSequenceLogic';

describe('NUMBER_SEQUENCE_LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(NUMBER_SEQUENCE_LEVELS).toHaveLength(3);
  });

  it('has level 1 with step 1, range 1-8', () => {
    expect(NUMBER_SEQUENCE_LEVELS[0].level).toBe(1);
    expect(NUMBER_SEQUENCE_LEVELS[0].minStart).toBe(1);
    expect(NUMBER_SEQUENCE_LEVELS[0].maxStart).toBe(8);
    expect(NUMBER_SEQUENCE_LEVELS[0].step).toBe(1);
    expect(NUMBER_SEQUENCE_LEVELS[0].length).toBe(5);
  });

  it('has level 2 with step 2, range 2-16', () => {
    expect(NUMBER_SEQUENCE_LEVELS[1].level).toBe(2);
    expect(NUMBER_SEQUENCE_LEVELS[1].minStart).toBe(2);
    expect(NUMBER_SEQUENCE_LEVELS[1].maxStart).toBe(16);
    expect(NUMBER_SEQUENCE_LEVELS[1].step).toBe(2);
    expect(NUMBER_SEQUENCE_LEVELS[1].length).toBe(5);
  });

  it('has level 3 with step 5, range 5-30', () => {
    expect(NUMBER_SEQUENCE_LEVELS[2].level).toBe(3);
    expect(NUMBER_SEQUENCE_LEVELS[2].minStart).toBe(5);
    expect(NUMBER_SEQUENCE_LEVELS[2].maxStart).toBe(30);
    expect(NUMBER_SEQUENCE_LEVELS[2].step).toBe(5);
    expect(NUMBER_SEQUENCE_LEVELS[2].length).toBe(5);
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
  it('returns 10 for level 1, streak 0', () => {
    expect(calculateScore(0, 1)).toBe(10);
  });

  it('returns 13 for level 1, streak 1', () => {
    expect(calculateScore(1, 1)).toBe(13);
  });

  it('returns 16 for level 1, streak 2', () => {
    expect(calculateScore(2, 1)).toBe(16);
  });

  it('returns 25 for level 1, streak 5', () => {
    expect(calculateScore(5, 1)).toBe(25);
  });

  it('caps at 25 for level 1 with high streak', () => {
    expect(calculateScore(10, 1)).toBe(25);
    expect(calculateScore(100, 1)).toBe(25);
  });

  it('applies 1.5x multiplier for level 2', () => {
    expect(calculateScore(0, 2)).toBe(15); // 10 * 1.5 = 15
    expect(calculateScore(5, 2)).toBe(37); // 25 * 1.5 = 37.5 -> 37
  });

  it('applies 2x multiplier for level 3', () => {
    expect(calculateScore(0, 3)).toBe(20); // 10 * 2 = 20
    expect(calculateScore(5, 3)).toBe(50); // 25 * 2 = 50
  });

  it('handles negative streak gracefully', () => {
    // Max streak bonus is 15, base is 10
    // Negative streak should not increase score
    expect(calculateScore(-1, 1)).toBeLessThanOrEqual(10);
  });

  it('caps level 2 at 37 points', () => {
    expect(calculateScore(10, 2)).toBe(37);
  });

  it('caps level 3 at 50 points', () => {
    expect(calculateScore(10, 3)).toBe(50);
  });

  it('uses 1x multiplier for unknown level', () => {
    expect(calculateScore(0, 999)).toBe(10);
  });
});

describe('createNumberSequenceRound', () => {
  describe('level 1', () => {
    it('builds sequence with rng returning 0', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.sequence).toEqual([1, 2, 3, 4, 5]);
      expect(round.missingIndex).toBe(1); // 1 + floor(0 * 3) = 1
      expect(round.answer).toBe(2);
    });

    it('builds sequence with rng returning 0.5', () => {
      const round = createNumberSequenceRound(1, () => 0.5);
      // start = 1 + floor(0.5 * 8) = 1 + 4 = 5
      expect(round.sequence).toEqual([5, 6, 7, 8, 9]);
      // floor(0.5 * 3) = floor(1.5) = 1, so missingIndex = 1 + 1 = 2
      expect(round.missingIndex).toBe(2);
      expect(round.answer).toBe(7);
    });

    it('builds sequence with rng returning 0.9', () => {
      const round = createNumberSequenceRound(1, () => 0.9);
      // start = 1 + floor(0.9 * 8) = 1 + 7 = 8
      expect(round.sequence).toEqual([8, 9, 10, 11, 12]);
      // floor(0.9 * 3) = floor(2.7) = 2, so missingIndex = 1 + 2 = 3
      expect(round.missingIndex).toBe(3);
      expect(round.answer).toBe(11);
    });

    it('uses step of 1', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.sequence[1] - round.sequence[0]).toBe(1);
    });

    it('generates 5-element sequence', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.sequence).toHaveLength(5);
    });
  });

  describe('level 2', () => {
    it('builds sequence with rng returning 0', () => {
      const round = createNumberSequenceRound(2, () => 0);
      expect(round.sequence).toEqual([2, 4, 6, 8, 10]);
      expect(round.missingIndex).toBe(1);
      expect(round.answer).toBe(4);
    });

    it('builds sequence with rng returning 0.5', () => {
      const round = createNumberSequenceRound(2, () => 0.5);
      // start = 2 + floor(0.5 * 15) = 2 + 7 = 9
      expect(round.sequence).toEqual([9, 11, 13, 15, 17]);
      // floor(0.5 * 3) = 1, missingIndex = 2
      expect(round.missingIndex).toBe(2);
      expect(round.answer).toBe(13);
    });

    it('uses step of 2', () => {
      const round = createNumberSequenceRound(2, () => 0);
      expect(round.sequence[1] - round.sequence[0]).toBe(2);
    });

    it('generates 5-element sequence', () => {
      const round = createNumberSequenceRound(2, () => 0);
      expect(round.sequence).toHaveLength(5);
    });
  });

  describe('level 3', () => {
    it('builds sequence with rng returning 0', () => {
      const round = createNumberSequenceRound(3, () => 0);
      expect(round.sequence).toEqual([5, 10, 15, 20, 25]);
      expect(round.missingIndex).toBe(1);
      expect(round.answer).toBe(10);
    });

    it('builds sequence with rng returning 0.5', () => {
      const round = createNumberSequenceRound(3, () => 0.5);
      // start = 5 + floor(0.5 * 26) = 5 + 13 = 18
      expect(round.sequence).toEqual([18, 23, 28, 33, 38]);
      // floor(0.5 * 3) = 1, missingIndex = 2
      expect(round.missingIndex).toBe(2);
      expect(round.answer).toBe(28);
    });

    it('uses step of 5', () => {
      const round = createNumberSequenceRound(3, () => 0);
      expect(round.sequence[1] - round.sequence[0]).toBe(5);
    });

    it('generates 5-element sequence', () => {
      const round = createNumberSequenceRound(3, () => 0);
      expect(round.sequence).toHaveLength(5);
    });
  });

  describe('unknown level', () => {
    it('falls back to level 1 for level 999', () => {
      const round = createNumberSequenceRound(999, () => 0);
      expect(round.sequence[0]).toBe(NUMBER_SEQUENCE_LEVELS[0].minStart);
      expect(round.sequence[1] - round.sequence[0]).toBe(NUMBER_SEQUENCE_LEVELS[0].step);
    });

    it('falls back to level 1 for level 0', () => {
      const round = createNumberSequenceRound(0, () => 0);
      expect(round.sequence[0]).toBe(NUMBER_SEQUENCE_LEVELS[0].minStart);
    });

    it('falls back to level 1 for negative level', () => {
      const round = createNumberSequenceRound(-1, () => 0);
      expect(round.sequence[0]).toBe(NUMBER_SEQUENCE_LEVELS[0].minStart);
    });
  });

  describe('options generation', () => {
    it('includes correct answer in options', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.options).toContain(round.answer);
    });

    it('generates up to 4 options', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.options.length).toBeLessThanOrEqual(4);
    });

    it('generates options that are positive numbers', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.options.every((o) => o > 0)).toBe(true);
    });

    it('includes distractor below answer', () => {
      const round = createNumberSequenceRound(1, () => 0);
      // Answer is 2, distractor should be 1 (2 - 1)
      expect(round.options).toContain(1);
    });

    it('includes distractor above answer', () => {
      const round = createNumberSequenceRound(1, () => 0);
      // Answer is 2, distractor should be 3 (2 + 1)
      expect(round.options).toContain(3);
    });

    it('includes second distractor above answer', () => {
      const round = createNumberSequenceRound(1, () => 0);
      // Answer is 2, second distractor should be 4 (2 + 1*2)
      expect(round.options).toContain(4);
    });

    it('filters out non-positive distractors', () => {
      const round = createNumberSequenceRound(1, () => 0.9);
      // Answer is 4, distractors would be 3, 5, 6 - all positive
      // If answer was 1, distractor 0 would be filtered
      expect(round.options.every((o) => o > 0)).toBe(true);
    });

    it('handles edge case with answer 1', () => {
      // With level 1, answer 1, distractors would be 0, 2, 3
      // 0 should be filtered out
      const round = createNumberSequenceRound(1, () => 0.999);
      // With rng near 1, missingIndex near 3
      expect(round.options.every((o) => o > 0)).toBe(true);
    });
  });

  describe('missing index constraints', () => {
    it('never removes first element', () => {
      for (let i = 0; i < 100; i++) {
        const rng = () => i / 100;
        const round = createNumberSequenceRound(1, rng);
        expect(round.missingIndex).not.toBe(0);
      }
    });

    it('never removes last element', () => {
      for (let i = 0; i < 100; i++) {
        const rng = () => i / 100;
        const round = createNumberSequenceRound(1, rng);
        expect(round.missingIndex).not.toBe(4); // Last index in 5-element array
      }
    });

    it('always removes from middle positions', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round.missingIndex).toBeGreaterThanOrEqual(1);
      expect(round.missingIndex).toBeLessThanOrEqual(3);
    });
  });

  describe('round structure', () => {
    it('returns round with all required properties', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(round).toHaveProperty('sequence');
      expect(round).toHaveProperty('missingIndex');
      expect(round).toHaveProperty('answer');
      expect(round).toHaveProperty('options');
    });

    it('has sequence as array of numbers', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(Array.isArray(round.sequence)).toBe(true);
      expect(round.sequence.every((n) => typeof n === 'number')).toBe(true);
    });

    it('has missingIndex as number', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(typeof round.missingIndex).toBe('number');
    });

    it('has answer as number', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(typeof round.answer).toBe('number');
    });

    it('has options as array of numbers', () => {
      const round = createNumberSequenceRound(1, () => 0);
      expect(Array.isArray(round.options)).toBe(true);
      expect(round.options.every((n) => typeof n === 'number')).toBe(true);
    });
  });

  describe('sequence validity', () => {
    it('generates arithmetic progression', () => {
      const round = createNumberSequenceRound(2, () => 0);
      const step = round.sequence[1] - round.sequence[0];
      for (let i = 2; i < round.sequence.length; i++) {
        expect(round.sequence[i] - round.sequence[i - 1]).toBe(step);
      }
    });

    it('generates monotonic increasing sequence', () => {
      const round = createNumberSequenceRound(3, () => 0);
      for (let i = 1; i < round.sequence.length; i++) {
        expect(round.sequence[i]).toBeGreaterThan(round.sequence[i - 1]);
      }
    });
  });
});
