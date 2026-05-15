import { describe, expect, it } from 'vitest';

import {
  LETTER_PAIRS,
  generateRound,
  initializeGame,
  checkAnswer,
  processAnswer,
  calculateAccuracy,
  getStarRating,
  getMatchInstruction,
} from '../letterMatchLogic';

describe('LETTER_PAIRS', () => {
  it('has 26 letter pairs', () => {
    expect(LETTER_PAIRS).toHaveLength(26);
  });

  it('each pair has uppercase and lowercase', () => {
    for (const pair of LETTER_PAIRS) {
      expect(pair.uppercase).toMatch(/^[A-Z]$/);
      expect(pair.lowercase).toMatch(/^[a-z]$/);
      expect(pair.uppercase.toLowerCase()).toBe(pair.lowercase);
    }
  });
});

describe('Letter Match Logic', () => {
  it('generates rounds for all difficulties', () => {
    ['easy', 'medium', 'hard'].forEach(diff => {
      const round = generateRound(diff as any);
      expect(round.targetLetter).toBeDefined();
      expect(round.options).toBeDefined();
      expect(['uppercase', 'lowercase']).toContain(round.matchType);
    });
  });

  it('checks answers correctly', () => {
    expect(checkAnswer('A', 'a')).toBe(true);
    expect(checkAnswer('b', 'B')).toBe(true);
    expect(checkAnswer('C', 'D')).toBe(false);
  });

  it('returns correct match instruction', () => {
    expect(getMatchInstruction('uppercase')).toContain('lowercase');
    expect(getMatchInstruction('lowercase')).toContain('uppercase');
  });

  it('calculates star ratings correctly', () => {
    expect(getStarRating(90)).toBe(3);
    expect(getStarRating(70)).toBe(2);
    expect(getStarRating(50)).toBe(1);
    expect(getStarRating(30)).toBe(0);
  });
});
