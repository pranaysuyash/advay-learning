import { describe, expect, it } from 'vitest';

import {
  COMPOUND_WORDS,
  generateRound,
  initializeGame,
  checkAnswer,
  processAnswer,
  calculateAccuracy,
  getStarRating,
} from '../compoundWordsLogic';

describe('COMPOUND_WORDS', () => {
  it('has compound words', () => {
    expect(COMPOUND_WORDS.length).toBeGreaterThan(0);
  });

  it('each word has two parts', () => {
    for (const word of COMPOUND_WORDS) {
      expect(word.firstPart).toBeDefined();
      expect(word.secondPart).toBeDefined();
      expect(word.fullWord).toBeDefined();
    }
  });
});

describe('Compound Words Logic', () => {
  it('generates rounds', () => {
    const round = generateRound('easy');
    expect(round.targetWord).toBeDefined();
    expect(round.firstParts).toBeDefined();
    expect(round.secondParts).toBeDefined();
  });

  it('checks answers correctly', () => {
    const word = COMPOUND_WORDS[0];
    expect(checkAnswer(word.firstPart, word.secondPart, word)).toBe(true);
    expect(checkAnswer('wrong', word.secondPart, word)).toBe(false);
  });

  it('calculates accuracy', () => {
    const game = initializeGame('easy');
    expect(calculateAccuracy(game)).toBe(0);
  });
});
