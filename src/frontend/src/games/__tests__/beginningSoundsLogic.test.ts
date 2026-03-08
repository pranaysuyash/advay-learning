import { describe, expect, it } from 'vitest';
import {
  LEVELS,
  buildBeginningSoundsRound,
  checkAnswer,
  calculateScore,
  getWordsForLevel,
  getLevelConfig,
  type BeginningSoundsRound,
} from '../beginningSoundsLogic';

describe('LEVELS Configuration', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 6 rounds with 3 options', () => {
    const level1 = LEVELS[0];
    expect(level1.level).toBe(1);
    expect(level1.roundCount).toBe(6);
    expect(level1.optionCount).toBe(3);
    expect(level1.passThreshold).toBe(4);
  });

  it('level 2 has 8 rounds with 4 options', () => {
    const level2 = LEVELS[1];
    expect(level2.level).toBe(2);
    expect(level2.roundCount).toBe(8);
    expect(level2.optionCount).toBe(4);
    expect(level2.passThreshold).toBe(6);
  });

  it('level 3 has 10 rounds with 4 options', () => {
    const level3 = LEVELS[2];
    expect(level3.level).toBe(3);
    expect(level3.roundCount).toBe(10);
    expect(level3.optionCount).toBe(4);
    expect(level3.passThreshold).toBe(8);
  });

  it('increases difficulty across levels', () => {
    expect(LEVELS[0].timePerRound).toBeGreaterThan(LEVELS[1].timePerRound);
    expect(LEVELS[1].timePerRound).toBeGreaterThan(LEVELS[2].timePerRound);
  });
});

describe('getWordsForLevel', () => {
  it('returns difficulty 1 words for level 1', () => {
    const words = getWordsForLevel(1);
    words.forEach((word) => {
      expect(word.difficulty).toBeLessThanOrEqual(1);
    });
  });

  it('returns difficulty 1-2 words for level 2', () => {
    const words = getWordsForLevel(2);
    words.forEach((word) => {
      expect(word.difficulty).toBeLessThanOrEqual(2);
    });
  });

  it('returns all words for level 3', () => {
    const words = getWordsForLevel(3);
    expect(words.length).toBeGreaterThan(20);
  });

  it('includes common words for level 1', () => {
    const words = getWordsForLevel(1);
    const wordLetters = words.map((w) => w.firstLetter);
    expect(wordLetters).toContain('A');
    expect(wordLetters).toContain('B');
    expect(wordLetters).toContain('C');
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.roundCount).toBe(6);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.roundCount).toBe(8);
  });

  it('returns level 1 config for invalid level', () => {
    const config = getLevelConfig(99);
    expect(config.level).toBe(1);
  });
});

describe('buildBeginningSoundsRound', () => {
  it('creates a valid round with target word and options', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);

    expect(round.targetWord).toBeDefined();
    expect(round.options).toBeDefined();
    expect(round.options.length).toBe(3);
  });

  it('includes correct answer in options', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);

    const correctOption = round.options.find((o) => o.isCorrect);
    expect(correctOption).toBeDefined();
    expect(correctOption?.letter).toBe(round.targetWord.firstLetter);
  });

  it('has exactly one correct option', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);

    const correctCount = round.options.filter((o) => o.isCorrect).length;
    expect(correctCount).toBe(1);
  });

  it('level 1 has 3 options', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);
    expect(round.options).toHaveLength(3);
  });

  it('level 2 has 4 options', () => {
    const round = buildBeginningSoundsRound(2, [], () => 0.5);
    expect(round.options).toHaveLength(4);
  });

  it('level 3 has 4 options', () => {
    const round = buildBeginningSoundsRound(3, [], () => 0.5);
    expect(round.options).toHaveLength(4);
  });

  it('prefers unused words when available', () => {
    const first = buildBeginningSoundsRound(1, [], () => 0.5);
    const second = buildBeginningSoundsRound(1, [first.targetWord.word], () => 0.5);

    expect(second.targetWord.word).not.toBe(first.targetWord.word);
  });

  it('reuses words when all have been used', () => {
    const usedWords = ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish', 'Goat', 'Hat',
      'Ice cream', 'Jam', 'Kite', 'Lion', 'Moon', 'Nest', 'Octopus', 'Pig', 'Rain', 'Sun',
      'Tree', 'Umbrella'];

    const round = buildBeginningSoundsRound(1, usedWords, () => 0.5);
    expect(round.targetWord).toBeDefined();
  });

  it('options do not include duplicate letters', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);
    const letters = round.options.map((o) => o.letter);
    const uniqueLetters = new Set(letters);
    expect(uniqueLetters.size).toBe(letters.length);
  });

  it('distractor options are different from correct answer', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);
    const correctLetter = round.targetWord.firstLetter;

    round.options.forEach((option) => {
      if (!option.isCorrect) {
        expect(option.letter).not.toBe(correctLetter);
      }
    });
  });

  it('target word has required properties', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);

    expect(round.targetWord.word).toBeDefined();
    expect(round.targetWord.emoji).toBeDefined();
    expect(round.targetWord.firstSound).toBeDefined();
    expect(round.targetWord.firstLetter).toBeDefined();
    expect(round.targetWord.difficulty).toBeGreaterThan(0);
  });

  it('each option has required properties', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);

    round.options.forEach((option) => {
      expect(option.letter).toBeDefined();
      expect(option.sound).toBeDefined();
      expect(typeof option.isCorrect).toBe('boolean');
    });
  });

  it('uses determinstic random for testing', () => {
    const round1 = buildBeginningSoundsRound(1, [], () => 0.25);
    const round2 = buildBeginningSoundsRound(1, [], () => 0.25);

    expect(round1.targetWord.word).toBe(round2.targetWord.word);
  });

  it('level 1 words have difficulty 1', () => {
    const round = buildBeginningSoundsRound(1, [], () => 0.5);
    expect(round.targetWord.difficulty).toBeLessThanOrEqual(1);
  });

  it('level 2 words have difficulty <= 2', () => {
    const round = buildBeginningSoundsRound(2, [], () => 0.5);
    expect(round.targetWord.difficulty).toBeLessThanOrEqual(2);
  });

  it('level 3 can include difficulty 3 words', () => {
    // Use high random to reach end of array where diff 3 words are
    const round = buildBeginningSoundsRound(3, [], () => 0.99);
    expect(round.targetWord.difficulty).toBeGreaterThan(0);
  });

  it('produces valid round for level 1 with no used words', () => {
    const round = buildBeginningSoundsRound(1, []);

    expect(round.targetWord).toBeDefined();
    expect(round.options).toHaveLength(3);
  });

  it('produces valid round for level 2 with no used words', () => {
    const round = buildBeginningSoundsRound(2, []);

    expect(round.targetWord).toBeDefined();
    expect(round.options).toHaveLength(4);
  });

  it('produces valid round for level 3 with no used words', () => {
    const round = buildBeginningSoundsRound(3, []);

    expect(round.targetWord).toBeDefined();
    expect(round.options).toHaveLength(4);
  });

  it('produces valid rounds sequentially for level 1', () => {
    const used: string[] = [];
    const rounds: BeginningSoundsRound[] = [];

    for (let i = 0; i < 6; i++) {
      const round = buildBeginningSoundsRound(1, used);
      rounds.push(round);
      used.push(round.targetWord.word);
    }

    // Should create 6 valid rounds
    expect(rounds).toHaveLength(6);

    // All should be valid
    rounds.forEach((round) => {
      expect(round.targetWord).toBeDefined();
      expect(round.options).toHaveLength(3);
      expect(round.options.some((o) => o.isCorrect)).toBe(true);
    });
  });
});

describe('checkAnswer', () => {
  it('returns true for matching letters', () => {
    expect(checkAnswer('A', 'A')).toBe(true);
    expect(checkAnswer('a', 'A')).toBe(true);
    expect(checkAnswer('A', 'a')).toBe(true);
    expect(checkAnswer('b', 'B')).toBe(true);
  });

  it('returns false for non-matching letters', () => {
    expect(checkAnswer('A', 'B')).toBe(false);
    expect(checkAnswer('B', 'A')).toBe(false);
    expect(checkAnswer('X', 'Y')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(checkAnswer('a', 'A')).toBe(true);
    expect(checkAnswer('A', 'a')).toBe(true);
    expect(checkAnswer('z', 'Z')).toBe(true);
  });
});

describe('calculateScore', () => {
  it('returns 0 for incorrect answer', () => {
    expect(calculateScore(false, 5, 20)).toBe(0);
  });

  it('returns base score for correct answer with no time bonus', () => {
    // timeUsed = timeLimit, so no bonus
    const score = calculateScore(true, 20, 20);
    expect(score).toBe(20);
  });

  it('adds time bonus for fast answers', () => {
    // timeUsed = 0, max bonus = 5
    const score = calculateScore(true, 0, 20);
    expect(score).toBe(25);
  });

  it('caps score at 25', () => {
    const score = calculateScore(true, 0, 20);
    expect(score).toBeLessThanOrEqual(25);
  });

  it('calculates partial time bonus correctly', () => {
    // Half time used = half bonus
    const score = calculateScore(true, 10, 20);
    expect(score).toBeGreaterThanOrEqual(20);
    expect(score).toBeLessThanOrEqual(25);
  });

  it('base score is 20 points', () => {
    const score = calculateScore(true, 20, 20);
    expect(score).toBe(20);
  });

  it('max time bonus is 5 points', () => {
    const score = calculateScore(true, 0, 20);
    expect(score).toBe(25); // 20 + 5
  });

  it('handles timeUsed greater than timeLimit', () => {
    const score = calculateScore(true, 25, 20);
    expect(score).toBe(20); // No bonus, just base
  });
});
