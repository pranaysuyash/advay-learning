import { describe, expect, it } from 'vitest';

import {
  WordFamily,
  FamilyWord,
  WordFamiliesRound,
  WordFamiliesGameState,
  WORD_FAMILIES,
  generateRound,
  initializeGame,
  checkAnswer,
  processAnswer,
  calculateAccuracy,
  getStarRating,
  getDifficultyDisplay,
} from '../wordFamiliesLogic';

describe('WORD_FAMILIES', () => {
  it('has 8 word families', () => {
    expect(WORD_FAMILIES).toHaveLength(8);
  });

  it('each family has a valid family suffix', () => {
    for (const family of WORD_FAMILIES) {
      expect(family.family).toMatch(/^-[a-z]{2}$/);
    }
  });

  it('each family has at least 3 words', () => {
    for (const family of WORD_FAMILIES) {
      expect(family.words.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('each word has required properties', () => {
    for (const family of WORD_FAMILIES) {
      for (const word of family.words) {
        expect(word.word).toBeDefined();
        expect(word.emoji).toBeDefined();
        expect(word.hint).toBeDefined();
        expect(typeof word.word).toBe('string');
        expect(typeof word.emoji).toBe('string');
        expect(typeof word.hint).toBe('string');
      }
    }
  });

  it('words end with their family suffix', () => {
    for (const family of WORD_FAMILIES) {
      const suffix = family.family.slice(1); // Remove dash
      for (const word of family.words) {
        expect(word.word.endsWith(suffix)).toBe(true);
      }
    }
  });

  it('includes common word families', () => {
    const familyNames = WORD_FAMILIES.map(f => f.family);
    expect(familyNames).toContain('-at');
    expect(familyNames).toContain('-an');
    expect(familyNames).toContain('-ig');
    expect(familyNames).toContain('-op');
  });
});

describe('generateRound', () => {
  it('generates a round for easy difficulty', () => {
    const round = generateRound('easy');
    expect(round.targetFamily).toBeDefined();
    expect(round.options).toBeDefined();
    expect(round.correctWords).toBeDefined();
  });

  it('generates a round for medium difficulty', () => {
    const round = generateRound('medium');
    expect(round.targetFamily).toBeDefined();
    expect(round.options).toBeDefined();
    expect(round.correctWords).toBeDefined();
  });

  it('generates a round for hard difficulty', () => {
    const round = generateRound('hard');
    expect(round.targetFamily).toBeDefined();
    expect(round.options).toBeDefined();
    expect(round.correctWords).toBeDefined();
  });

  it('correct words are in options', () => {
    const round = generateRound('medium');
    for (const correctWord of round.correctWords) {
      const found = round.options.find(o => o.word === correctWord);
      expect(found).toBeDefined();
    }
  });

  it('options include distractors', () => {
    const round = generateRound('medium');
    expect(round.options.length).toBeGreaterThan(round.correctWords.length);
  });
});

describe('initializeGame', () => {
  it('initializes easy game correctly', () => {
    const game = initializeGame('easy', 8);
    expect(game.currentRound).toBe(0);
    expect(game.totalRounds).toBe(8);
    expect(game.score).toBe(0);
    expect(game.streak).toBe(0);
    expect(game.completed).toBe(false);
  });

  it('initializes medium game correctly', () => {
    const game = initializeGame('medium', 10);
    expect(game.totalRounds).toBe(10);
    expect(game.currentRound).toBe(0);
  });

  it('initializes hard game correctly', () => {
    const game = initializeGame('hard', 12);
    expect(game.totalRounds).toBe(12);
    expect(game.currentRound).toBe(0);
  });

  it('wordsFound is empty set', () => {
    const game = initializeGame('easy');
    expect(game.wordsFound.size).toBe(0);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct word', () => {
    expect(checkAnswer('cat', ['cat', 'bat', 'hat'])).toBe(true);
    expect(checkAnswer('dog', ['cat', 'dog', 'log'])).toBe(true);
  });

  it('returns false for incorrect word', () => {
    expect(checkAnswer('sun', ['cat', 'bat', 'hat'])).toBe(false);
    expect(checkAnswer('tree', ['cat', 'dog', 'log'])).toBe(false);
  });

  it('is case insensitive', () => {
    expect(checkAnswer('CAT', ['cat', 'bat', 'hat'])).toBe(true);
    expect(checkAnswer('Cat', ['cat', 'bat', 'hat'])).toBe(true);
  });

  it('handles empty word list', () => {
    expect(checkAnswer('cat', [])).toBe(false);
  });
});

describe('processAnswer', () => {
  it('increments score on correct answer', () => {
    const game = initializeGame('easy');
    const result = processAnswer(game, 'cat', true, '-at');
    expect(result.score).toBeGreaterThan(0);
    expect(result.correctAnswers).toBe(1);
  });

  it('does not increment score on wrong answer', () => {
    const game = initializeGame('easy');
    const result = processAnswer(game, 'cat', false, '-at');
    expect(result.score).toBe(0);
    expect(result.correctAnswers).toBe(0);
  });

  it('builds streak on correct answers', () => {
    let game = initializeGame('easy');
    game = processAnswer(game, 'cat', true, '-at');
    expect(game.streak).toBe(1);
    game = processAnswer(game, 'bat', true, '-at');
    expect(game.streak).toBe(2);
  });

  it('resets streak on wrong answer', () => {
    let game = initializeGame('easy');
    game = processAnswer(game, 'cat', true, '-at');
    game = processAnswer(game, 'bat', true, '-at');
    game = processAnswer(game, 'sun', false, '-at');
    expect(game.streak).toBe(0);
  });

  it('marks game completed when all rounds done', () => {
    let game = initializeGame('easy', 2);
    game = processAnswer(game, 'cat', true, '-at');
    game = processAnswer(game, 'bat', true, '-at');
    expect(game.completed).toBe(true);
  });

  it('adds word to wordsFound on correct answer', () => {
    let game = initializeGame('easy');
    game = processAnswer(game, 'cat', true, '-at');
    expect(game.wordsFound.has('-at:cat')).toBe(true);
  });
});

describe('calculateAccuracy', () => {
  it('returns 0 when no rounds played', () => {
    const game = initializeGame('easy');
    expect(calculateAccuracy(game)).toBe(0);
  });

  it('calculates 100% accuracy', () => {
    let game = initializeGame('easy', 2);
    game = processAnswer(game, 'cat', true, '-at');
    game = processAnswer(game, 'bat', true, '-at');
    expect(calculateAccuracy(game)).toBe(100);
  });

  it('calculates 50% accuracy', () => {
    let game = initializeGame('easy', 2);
    game = processAnswer(game, 'cat', true, '-at');
    game = processAnswer(game, 'sun', false, '-at');
    expect(calculateAccuracy(game)).toBe(50);
  });

  it('calculates 0% accuracy', () => {
    let game = initializeGame('easy', 2);
    game = processAnswer(game, 'sun', false, '-at');
    game = processAnswer(game, 'dog', false, '-at');
    expect(calculateAccuracy(game)).toBe(0);
  });
});

describe('getStarRating', () => {
  it('returns 3 stars for 90%+', () => {
    expect(getStarRating(90)).toBe(3);
    expect(getStarRating(100)).toBe(3);
  });

  it('returns 2 stars for 70-89%', () => {
    expect(getStarRating(70)).toBe(2);
    expect(getStarRating(85)).toBe(2);
  });

  it('returns 1 star for 50-69%', () => {
    expect(getStarRating(50)).toBe(1);
    expect(getStarRating(65)).toBe(1);
  });

  it('returns 0 stars below 50%', () => {
    expect(getStarRating(49)).toBe(0);
    expect(getStarRating(0)).toBe(0);
  });
});

describe('getDifficultyDisplay', () => {
  it('returns correct labels', () => {
    expect(getDifficultyDisplay('easy').label).toBe('Easy');
    expect(getDifficultyDisplay('medium').label).toBe('Medium');
    expect(getDifficultyDisplay('hard').label).toBe('Hard');
  });

  it('returns correct colors', () => {
    expect(getDifficultyDisplay('easy').color).toBe('text-green-500');
    expect(getDifficultyDisplay('medium').color).toBe('text-yellow-500');
    expect(getDifficultyDisplay('hard').color).toBe('text-red-500');
  });
});

describe('type definitions', () => {
  it('WordFamily interface is valid', () => {
    const family: WordFamily = {
      family: '-at',
      emoji: '🐱',
      words: [
        { word: 'cat', emoji: '🐱', hint: 'A furry pet' },
      ],
    };
    expect(family.family).toBe('-at');
    expect(family.words).toHaveLength(1);
  });

  it('FamilyWord interface is valid', () => {
    const word: FamilyWord = {
      word: 'cat',
      emoji: '🐱',
      hint: 'A furry pet',
    };
    expect(word.word).toBe('cat');
  });
});
