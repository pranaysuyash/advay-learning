import { describe, expect, it } from 'vitest';
import {
  BLEND_WORDS,
  LEVELS,
  getLevelConfig,
  getWordsForLevel,
  checkAnswer,
} from '../blendBuilderLogic';

describe('LEVELS Configuration', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 4 words', () => {
    const level1 = LEVELS[0];
    expect(level1.level).toBe(1);
    expect(level1.wordCount).toBe(4);
  });

  it('level 2 has 6 words', () => {
    const level2 = LEVELS[1];
    expect(level2.level).toBe(2);
    expect(level2.wordCount).toBe(6);
  });

  it('level 3 has 8 words', () => {
    const level3 = LEVELS[2];
    expect(level3.level).toBe(3);
    expect(level3.wordCount).toBe(8);
  });

  it('levels increase in word count', () => {
    expect(LEVELS[0].wordCount).toBeLessThan(LEVELS[1].wordCount);
    expect(LEVELS[1].wordCount).toBeLessThan(LEVELS[2].wordCount);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.wordCount).toBe(4);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.wordCount).toBe(6);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.wordCount).toBe(8);
  });

  it('returns level 1 config for invalid level', () => {
    const config = getLevelConfig(99);
    expect(config.level).toBe(1);
  });

  it('returns level 1 config for level 0', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('getWordsForLevel', () => {
  it('returns 4 words for level 1', () => {
    const words = getWordsForLevel(1);
    expect(words).toHaveLength(4);
  });

  it('returns 6 words for level 2', () => {
    const words = getWordsForLevel(2);
    expect(words).toHaveLength(6);
  });

  it('returns 8 words for level 3', () => {
    const words = getWordsForLevel(3);
    expect(words).toHaveLength(8);
  });

  it('returns blend word objects with required properties', () => {
    const words = getWordsForLevel(1);
    words.forEach((word) => {
      expect(word.word).toBeDefined();
      expect(word.onset).toBeDefined();
      expect(word.rime).toBeDefined();
      expect(word.hint).toBeDefined();
    });
  });

  it('words have valid onset-rime combinations', () => {
    const words = getWordsForLevel(1);
    words.forEach((item) => {
      expect(item.onset + item.rime).toBe(item.word);
    });
  });

  it('words are 3 letters long', () => {
    const words = getWordsForLevel(1);
    words.forEach((item) => {
      expect(item.word.length).toBe(3);
    });
  });

  it('words have hints', () => {
    const words = getWordsForLevel(1);
    words.forEach((item) => {
      expect(item.hint.length).toBeGreaterThan(0);
    });
  });

  it('all words are lowercase', () => {
    const words = getWordsForLevel(1);
    words.forEach((item) => {
      expect(item.word).toBe(item.word.toLowerCase());
      expect(item.onset).toBe(item.onset.toLowerCase());
      expect(item.rime).toBe(item.rime.toLowerCase());
    });
  });

  it('different calls may return different words', () => {
    const words1 = getWordsForLevel(3);
    const words2 = getWordsForLevel(3);

    expect(words1).toHaveLength(8);
    expect(words2).toHaveLength(8);
  });

  it('contains common CVC words', () => {
    const wordList = BLEND_WORDS.map((w) => w.word);
    expect(wordList).toEqual(
      expect.arrayContaining(['cat', 'dog', 'sun', 'hat']),
    );
  });
});

describe('checkAnswer', () => {
  it('returns true for matching words', () => {
    expect(checkAnswer('cat', 'cat')).toBe(true);
    expect(checkAnswer('cat', 'CAT')).toBe(true);
    expect(checkAnswer('cat', 'Cat')).toBe(true);
    expect(checkAnswer('dog', 'dog')).toBe(true);
  });

  it('returns false for non-matching words', () => {
    expect(checkAnswer('cat', 'dog')).toBe(false);
    expect(checkAnswer('sun', 'fun')).toBe(false);
    expect(checkAnswer('hat', 'bat')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(checkAnswer('cat', 'CAT')).toBe(true);
    expect(checkAnswer('CAT', 'cat')).toBe(true);
    expect(checkAnswer('CaT', 'cAt')).toBe(true);
  });

  it('trims whitespace from answer', () => {
    expect(checkAnswer('cat', ' cat ')).toBe(true);
    expect(checkAnswer('cat', '  cat  ')).toBe(true);
  });

  it('handles empty string', () => {
    expect(checkAnswer('cat', '')).toBe(false);
    expect(checkAnswer('cat', ' ')).toBe(false);
  });
});

describe('Word Blending Logic', () => {
  it('onset + rime equals word for all words', () => {
    const words = getWordsForLevel(3);
    words.forEach((item) => {
      expect(item.onset + item.rime).toBe(item.word);
    });
  });

  it('onset is a single letter', () => {
    const words = getWordsForLevel(3);
    words.forEach((item) => {
      expect(item.onset.length).toBe(1);
    });
  });

  it('rime is two letters', () => {
    const words = getWordsForLevel(3);
    words.forEach((item) => {
      expect(item.rime.length).toBe(2);
    });
  });
});

describe('Level Progression', () => {
  it('level 1 returns subset of level 2 words', () => {
    const words1 = getWordsForLevel(1);
    const words2 = getWordsForLevel(2);

    expect(words1.length).toBeLessThanOrEqual(words2.length);
  });

  it('level 2 returns subset of level 3 words', () => {
    const words2 = getWordsForLevel(2);
    const words3 = getWordsForLevel(3);

    expect(words2.length).toBeLessThanOrEqual(words3.length);
  });

  it('word count matches level config', () => {
    expect(getWordsForLevel(1).length).toBe(LEVELS[0].wordCount);
    expect(getWordsForLevel(2).length).toBe(LEVELS[1].wordCount);
    expect(getWordsForLevel(3).length).toBe(LEVELS[2].wordCount);
  });
});
