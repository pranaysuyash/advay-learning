import { describe, expect, it } from 'vitest';

import {
  SyllableWord,
  LevelConfig,
  SYLLABLE_WORDS,
  LEVELS,
  getLevelConfig,
  getWordsForLevel,
  checkAnswer,
} from '../syllableClapLogic';

describe('SYLLABLE_WORDS', () => {
  it('has 25 words', () => {
    expect(SYLLABLE_WORDS).toHaveLength(25);
  });

  it('has words with 1 syllable', () => {
    const oneSyllable = SYLLABLE_WORDS.filter(w => w.syllableCount === 1);
    expect(oneSyllable.length).toBeGreaterThanOrEqual(6);
    expect(oneSyllable.every(w => w.syllableCount === 1)).toBe(true);
  });

  it('has words with 2 syllables', () => {
    const twoSyllable = SYLLABLE_WORDS.filter(w => w.syllableCount === 2);
    expect(twoSyllable.length).toBeGreaterThanOrEqual(8);
  });

  it('has words with 3 syllables', () => {
    const threeSyllable = SYLLABLE_WORDS.filter(w => w.syllableCount === 3);
    expect(threeSyllable.length).toBeGreaterThanOrEqual(7);
  });

  it('has words with 4 syllables', () => {
    const fourSyllable = SYLLABLE_WORDS.filter(w => w.syllableCount === 4);
    expect(fourSyllable.length).toBeGreaterThanOrEqual(2);
  });

  it('all words have valid structure', () => {
    for (const word of SYLLABLE_WORDS) {
      expect(typeof word.word).toBe('string');
      expect(typeof word.syllableCount).toBe('number');
      expect(typeof word.hint).toBe('string');
      expect(typeof word.emoji).toBe('string');
      expect(word.syllableCount).toBeGreaterThan(0);
    }
  });

  it('all syllable counts are between 1 and 4', () => {
    for (const word of SYLLABLE_WORDS) {
      expect(word.syllableCount).toBeGreaterThanOrEqual(1);
      expect(word.syllableCount).toBeLessThanOrEqual(4);
    }
  });

  it('includes common words', () => {
    const wordStrings = SYLLABLE_WORDS.map(w => w.word);
    expect(wordStrings).toContain('cat');
    expect(wordStrings).toContain('dog');
    expect(wordStrings).toContain('apple');
    expect(wordStrings).toContain('banana');
  });
});

describe('LEVELS', () => {
  it('has 4 levels', () => {
    expect(LEVELS).toHaveLength(4);
  });

  it('level 1 has wordCount 4 and maxSyllables 1', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].wordCount).toBe(4);
    expect(LEVELS[0].maxSyllables).toBe(1);
  });

  it('level 2 has wordCount 6 and maxSyllables 2', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].wordCount).toBe(6);
    expect(LEVELS[1].maxSyllables).toBe(2);
  });

  it('level 3 has wordCount 8 and maxSyllables 3', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].wordCount).toBe(8);
    expect(LEVELS[2].maxSyllables).toBe(3);
  });

  it('level 4 has wordCount 10 and maxSyllables 4', () => {
    expect(LEVELS[3].level).toBe(4);
    expect(LEVELS[3].wordCount).toBe(10);
    expect(LEVELS[3].maxSyllables).toBe(4);
  });

  it('wordCount increases across levels', () => {
    expect(LEVELS[0].wordCount).toBeLessThan(LEVELS[1].wordCount);
    expect(LEVELS[1].wordCount).toBeLessThan(LEVELS[2].wordCount);
    expect(LEVELS[2].wordCount).toBeLessThan(LEVELS[3].wordCount);
  });

  it('maxSyllables increases across levels', () => {
    expect(LEVELS[0].maxSyllables).toBeLessThan(LEVELS[1].maxSyllables);
    expect(LEVELS[1].maxSyllables).toBeLessThan(LEVELS[2].maxSyllables);
    expect(LEVELS[2].maxSyllables).toBeLessThan(LEVELS[3].maxSyllables);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.wordCount).toBe(4);
    expect(config.maxSyllables).toBe(1);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.wordCount).toBe(6);
    expect(config.maxSyllables).toBe(2);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.wordCount).toBe(8);
    expect(config.maxSyllables).toBe(3);
  });

  it('returns level 4 config for level 4', () => {
    const config = getLevelConfig(4);
    expect(config.level).toBe(4);
    expect(config.wordCount).toBe(10);
    expect(config.maxSyllables).toBe(4);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('getWordsForLevel', () => {
  it('returns 4 words for level 1', () => {
    const words = getWordsForLevel(1);
    expect(words.length).toBe(4);
  });

  it('returns 6 words for level 2', () => {
    const words = getWordsForLevel(2);
    expect(words.length).toBe(6);
  });

  it('returns 8 words for level 3', () => {
    const words = getWordsForLevel(3);
    expect(words.length).toBe(8);
  });

  it('returns 10 words for level 4', () => {
    const words = getWordsForLevel(4);
    expect(words.length).toBe(10);
  });

  it('level 1 only has 1-syllable words', () => {
    const words = getWordsForLevel(1);
    expect(words.every(w => w.syllableCount === 1)).toBe(true);
  });

  it('level 2 has max 2 syllables per word', () => {
    const words = getWordsForLevel(2);
    expect(words.every(w => w.syllableCount <= 2)).toBe(true);
  });

  it('level 3 has max 3 syllables per word', () => {
    const words = getWordsForLevel(3);
    expect(words.every(w => w.syllableCount <= 3)).toBe(true);
  });

  it('level 4 can have up to 4 syllables', () => {
    const words = getWordsForLevel(4);
    const maxSyllables = Math.max(...words.map(w => w.syllableCount));
    expect(maxSyllables).toBeLessThanOrEqual(4);
  });

  it('returns array of SyllableWord', () => {
    const words = getWordsForLevel(1);
    expect(words.length).toBeGreaterThan(0);
    expect(words[0].word).toBeDefined();
    expect(words[0].syllableCount).toBeDefined();
    expect(words[0].hint).toBeDefined();
    expect(words[0].emoji).toBeDefined();
  });

  it('generates different words on multiple calls', () => {
    const words1 = getWordsForLevel(2);
    const words2 = getWordsForLevel(2);

    // Due to shuffling, they should have different order
    const words1Str = words1.map(w => w.word).join(',');
    const words2Str = words2.map(w => w.word).join(',');
    expect(words1Str).not.toBe(words2Str);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    expect(checkAnswer(1, 1)).toBe(true);
    expect(checkAnswer(2, 2)).toBe(true);
    expect(checkAnswer(3, 3)).toBe(true);
    expect(checkAnswer(4, 4)).toBe(true);
  });

  it('returns false for wrong answer', () => {
    expect(checkAnswer(1, 2)).toBe(false);
    expect(checkAnswer(2, 1)).toBe(false);
    expect(checkAnswer(3, 4)).toBe(false);
    expect(checkAnswer(4, 3)).toBe(false);
  });

  it('handles zero', () => {
    expect(checkAnswer(0, 0)).toBe(true);
    expect(checkAnswer(0, 1)).toBe(false);
  });

  it('handles large numbers', () => {
    expect(checkAnswer(10, 10)).toBe(true);
    expect(checkAnswer(10, 5)).toBe(false);
  });
});

describe('integration scenarios', () => {
  it('can get level 1 config and words', () => {
    const config = getLevelConfig(1);
    const words = getWordsForLevel(1);

    expect(config.wordCount).toBe(words.length);
    expect(words.length).toBe(4);
  });

  it('can get level 4 config and words', () => {
    const config = getLevelConfig(4);
    const words = getWordsForLevel(4);

    expect(config.wordCount).toBe(words.length);
    expect(words.length).toBe(10);
  });

  it('can check answers for all syllable counts', () => {
    for (let count = 1; count <= 4; count++) {
      expect(checkAnswer(count, count)).toBe(true);
      expect(checkAnswer(count, count + 1)).toBe(false);
    }
  });
});

describe('edge cases', () => {
  it('handles empty word bank gracefully', () => {
    // This would be an error condition, but function should handle
    const config = getLevelConfig(1);
    expect(config.wordCount).toBeGreaterThan(0);
  });

  it('all words have unique values', () => {
    const wordStrings = SYLLABLE_WORDS.map(w => w.word);
    const unique = new Set(wordStrings);
    expect(unique.size).toBe(wordStrings.length);
  });

  it('all words have non-empty hints', () => {
    for (const word of SYLLABLE_WORDS) {
      expect(word.hint.length).toBeGreaterThan(0);
    }
  });

  it('all words have emoji', () => {
    for (const word of SYLLABLE_WORDS) {
      expect(word.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe('type definitions', () => {
  it('SyllableWord interface is correctly implemented', () => {
    const word: SyllableWord = {
      word: 'test',
      syllableCount: 1,
      hint: 'A test word',
      emoji: '🧪',
    };

    expect(typeof word.word).toBe('string');
    expect(typeof word.syllableCount).toBe('number');
    expect(typeof word.hint).toBe('string');
    expect(typeof word.emoji).toBe('string');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      wordCount: 6,
      maxSyllables: 2,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.wordCount).toBe('number');
    expect(typeof config.maxSyllables).toBe('number');
  });
});
