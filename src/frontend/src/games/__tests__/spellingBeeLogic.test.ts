import { describe, expect, it } from 'vitest';

import {
  SPELLING_WORDS,
  generateRound,
  initializeGame,
  checkAnswer,
  processAnswer,
  calculateAccuracy,
  getStarRating,
} from '../spellingBeeLogic';

describe('SPELLING_WORDS', () => {
  it('has spelling words', () => {
    expect(SPELLING_WORDS.length).toBeGreaterThan(0);
  });

  it('each word has required properties', () => {
    for (const word of SPELLING_WORDS) {
      expect(word.word).toBeDefined();
      expect(word.hint).toBeDefined();
      expect(word.emoji).toBeDefined();
      expect(word.difficulty).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Spelling Bee Logic', () => {
  it('generates rounds for all difficulties', () => {
    ['easy', 'medium', 'hard'].forEach(diff => {
      const round = generateRound(diff as any);
      expect(round.targetWord).toBeDefined();
      expect(round.availableLetters).toBeDefined();
      expect(round.currentAttempt).toEqual([]);
    });
  });

  it('initializes game correctly', () => {
    const game = initializeGame('easy', 10);
    expect(game.currentRound).toBe(0);
    expect(game.totalRounds).toBe(10);
    expect(game.score).toBe(0);
  });

  it('checks answers correctly', () => {
    expect(checkAnswer(['c', 'a', 't'], 'cat')).toBe(true);
    expect(checkAnswer(['d', 'o', 'g'], 'cat')).toBe(false);
  });

  it('calculates accuracy', () => {
    let game = initializeGame('easy', 2);
    game = processAnswer(game, true, 0);
    game = processAnswer(game, false, 0);
    expect(calculateAccuracy(game)).toBe(50);
  });

  it('returns correct star ratings', () => {
    expect(getStarRating(95)).toBe(3);
    expect(getStarRating(75)).toBe(2);
    expect(getStarRating(55)).toBe(1);
    expect(getStarRating(45)).toBe(0);
  });
});
