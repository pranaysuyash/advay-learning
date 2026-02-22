import { describe, expect, it } from 'vitest';

import {
  RHYME_FAMILIES,
  generateRound,
  checkAnswer,
  initializeGame,
  processAnswer,
  calculateAccuracy,
  getStarRating,
  getPerformanceFeedback,
  getDifficultyDisplay,
} from '../rhymeTimeLogic';

describe('RHYME_FAMILIES', () => {
  it('has 10 rhyme families', () => {
    expect(RHYME_FAMILIES).toHaveLength(10);
  });

  it('each family has family name, exampleSentence, and words', () => {
    for (const family of RHYME_FAMILIES) {
      expect(typeof family.family).toBe('string');
      expect(typeof family.exampleSentence).toBe('string');
      expect(Array.isArray(family.words)).toBe(true);
      expect(family.words.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('each word has word and emoji', () => {
    for (const family of RHYME_FAMILIES) {
      for (const word of family.words) {
        expect(typeof word.word).toBe('string');
        expect(typeof word.emoji).toBe('string');
      }
    }
  });

  it('has expected endings', () => {
    const families = RHYME_FAMILIES.map(f => f.family);
    expect(families).toContain('-at');
    expect(families).toContain('-an');
    expect(families).toContain('-ig');
    expect(families).toContain('-op');
    expect(families).toContain('-ug');
  });
});

describe('generateRound', () => {
  it('returns a valid round', () => {
    const round = generateRound('easy', new Set());
    
    expect(round).toHaveProperty('targetFamily');
    expect(round).toHaveProperty('targetWord');
    expect(round).toHaveProperty('options');
    expect(round).toHaveProperty('correctAnswer');
  });

  it('target word is in options', () => {
    const round = generateRound('easy', new Set());
    const targetInOptions = round.options.some(o => o.word.word === round.targetWord.word);
    expect(targetInOptions).toBe(true);
  });

  it('all options have required properties', () => {
    const round = generateRound('easy', new Set());
    
    for (const option of round.options) {
      expect(option).toHaveProperty('word');
      expect(option).toHaveProperty('isCorrect');
      expect(option).toHaveProperty('family');
      expect(typeof option.isCorrect).toBe('boolean');
    }
  });

  it('has exactly one target', () => {
    const round = generateRound('medium', new Set());
    const targets = round.options.filter(o => o.isCorrect);
    expect(targets).toHaveLength(1);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    const round = generateRound('easy', new Set());
    const result = checkAnswer(round.correctAnswer, round.correctAnswer);
    expect(result).toBe(true);
  });

  it('returns false for incorrect answer', () => {
    const round = generateRound('easy', new Set());
    const wrongOption = round.options.find(o => !o.isCorrect)!;
    const result = checkAnswer(wrongOption.word.word, round.correctAnswer);
    expect(result).toBe(false);
  });

  it('is case sensitive', () => {
    const round = generateRound('easy', new Set());
    const result = checkAnswer('Cat', round.correctAnswer);
    // Should fail if case doesn't match
    expect(result).toBe(round.correctAnswer === 'Cat');
  });
});

describe('initializeGame', () => {
  it('returns initial game state', () => {
    const state = initializeGame('easy', 5);
    
    expect(state).toHaveProperty('currentRound', 0);
    expect(state).toHaveProperty('totalRounds', 5);
    expect(state).toHaveProperty('score', 0);
    expect(state).toHaveProperty('streak', 0);
    expect(state).toHaveProperty('maxStreak', 0);
    expect(state).toHaveProperty('answers');
    expect(state).toHaveProperty('completed', false);
    expect(state).toHaveProperty('difficulty');
  });

  it('default rounds is 10', () => {
    const state = initializeGame('easy');
    expect(state.totalRounds).toBe(10);
  });
});

describe('processAnswer', () => {
  it('increments current round', () => {
    const state = initializeGame('easy', 5);
    const round = generateRound('easy', new Set());
    
    const newState = processAnswer(state, round, true);
    expect(newState.currentRound).toBe(1);
  });

  it('increments streak on correct answer', () => {
    const state = initializeGame('easy', 5);
    const round = generateRound('easy', new Set());
    
    const newState = processAnswer(state, round, true);
    expect(newState.streak).toBe(1);
    
    const round2 = generateRound('easy', new Set());
    const newState2 = processAnswer(newState, round2, true);
    expect(newState2.streak).toBe(2);
  });

  it('resets streak on incorrect answer', () => {
    const state = initializeGame('easy', 5);
    state.streak = 3;
    const round = generateRound('easy', new Set());
    
    const newState = processAnswer(state, round, false);
    expect(newState.streak).toBe(0);
  });

  it('records answer in history', () => {
    const state = initializeGame('easy', 5);
    const round = generateRound('easy', new Set());
    
    const newState = processAnswer(state, round, true);
    expect(newState.answers).toHaveLength(1);
    expect(newState.answers[0]).toHaveProperty('correct', true);
    expect(newState.answers[0]).toHaveProperty('word');
  });

  it('marks completed after final round', () => {
    const state = initializeGame('easy', 2);
    state.currentRound = 1;
    const round = generateRound('easy', new Set());
    
    const newState = processAnswer(state, round, true);
    expect(newState.completed).toBe(true);
  });
});

describe('calculateAccuracy', () => {
  it('returns 0 for no answers', () => {
    const state = initializeGame('easy', 5);
    const accuracy = calculateAccuracy(state);
    expect(accuracy).toBe(0);
  });

  it('calculates based on correct answers', () => {
    const state = initializeGame('easy', 5);
    state.answers = [
      { correct: true, word: 'cat', timestamp: Date.now() },
      { correct: true, word: 'hat', timestamp: Date.now() },
      { correct: false, word: 'dog', timestamp: Date.now() },
    ];
    
    const accuracy = calculateAccuracy(state);
    expect(accuracy).toBe(67); // 2/3 rounded
  });

  it('returns 100 for all correct', () => {
    const state = initializeGame('easy', 5);
    state.answers = [
      { correct: true, word: 'cat', timestamp: Date.now() },
      { correct: true, word: 'hat', timestamp: Date.now() },
    ];
    
    const accuracy = calculateAccuracy(state);
    expect(accuracy).toBe(100);
  });
});

describe('getStarRating', () => {
  it('returns 3 stars for perfect accuracy', () => {
    const stars = getStarRating(100);
    expect(stars).toBe(3);
  });

  it('returns 2 stars for good accuracy', () => {
    const stars = getStarRating(70);
    expect(stars).toBe(2);
  });

  it('returns 1 star for passing accuracy', () => {
    const stars = getStarRating(50);
    expect(stars).toBe(1);
  });

  it('returns 0 stars for low accuracy', () => {
    const stars = getStarRating(30);
    expect(stars).toBe(0);
  });
});

describe('getPerformanceFeedback', () => {
  it('returns positive feedback for good performance', () => {
    const feedback = getPerformanceFeedback(100);
    expect(typeof feedback.message).toBe('string');
    expect(typeof feedback.emoji).toBe('string');
    expect(feedback.message.length).toBeGreaterThan(0);
  });

  it('returns encouraging feedback for poor performance', () => {
    const feedback = getPerformanceFeedback(30);
    expect(typeof feedback.message).toBe('string');
    expect(typeof feedback.emoji).toBe('string');
  });

  it('varies feedback based on score', () => {
    const perfect = getPerformanceFeedback(100);
    const poor = getPerformanceFeedback(40);
    
    expect(perfect.message).not.toBe(poor.message);
    expect(perfect.emoji).not.toBe(poor.emoji);
  });
});

describe('getDifficultyDisplay', () => {
  it('returns display info for easy', () => {
    const display = getDifficultyDisplay('easy');
    expect(display).toHaveProperty('label');
    expect(display).toHaveProperty('color');
  });

  it('returns display info for medium', () => {
    const display = getDifficultyDisplay('medium');
    expect(display).toHaveProperty('label');
    expect(display).toHaveProperty('color');
  });

  it('returns display info for hard', () => {
    const display = getDifficultyDisplay('hard');
    expect(display).toHaveProperty('label');
    expect(display).toHaveProperty('color');
  });

  it('returns different colors for different difficulties', () => {
    const easy = getDifficultyDisplay('easy');
    const medium = getDifficultyDisplay('medium');
    const hard = getDifficultyDisplay('hard');
    
    expect(easy.color).not.toBe(medium.color);
    expect(medium.color).not.toBe(hard.color);
  });
});
