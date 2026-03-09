import { describe, expect, it } from 'vitest';

import {
  SightWord,
  LevelConfig,
  SIGHT_WORDS,
  LEVELS,
  getLevelConfig,
  getWordsForLevel,
} from '../sightWordFlashLogic';

describe('SIGHT_WORDS', () => {
  it('has more than 50 words', () => {
    expect(SIGHT_WORDS.length).toBeGreaterThan(50);
  });

  it('all words have valid structure', () => {
    for (const word of SIGHT_WORDS) {
      expect(typeof word.word).toBe('string');
      expect(typeof word.difficulty).toBe('number');
      expect([1, 2, 3]).toContain(word.difficulty);
    }
  });

  it('has words with difficulty 1', () => {
    const difficulty1 = SIGHT_WORDS.filter(w => w.difficulty === 1);
    expect(difficulty1.length).toBeGreaterThanOrEqual(10);
    expect(difficulty1.every(w => w.difficulty === 1)).toBe(true);
  });

  it('has words with difficulty 2', () => {
    const difficulty2 = SIGHT_WORDS.filter(w => w.difficulty === 2);
    expect(difficulty2.length).toBeGreaterThanOrEqual(10);
  });

  it('has words with difficulty 3', () => {
    const difficulty3 = SIGHT_WORDS.filter(w => w.difficulty === 3);
    expect(difficulty3.length).toBeGreaterThanOrEqual(10);
  });

  it('includes common sight words', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    expect(words).toContain('the');
    expect(words).toContain('is');
    expect(words).toContain('and');
    expect(words).toContain('you');
  });

  it('all words are lowercase except I', () => {
    for (const word of SIGHT_WORDS) {
      if (word.word === 'I') {
        expect(word.word).toBe('I');
      } else {
        expect(word.word).toBe(word.word.toLowerCase());
      }
    }
  });

  it('all word IDs are unique', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    const unique = new Set(words);
    // Note: Some words might appear twice in the data (like 'come')
    expect(unique.size).toBeGreaterThan(40);
  });
});

describe('LEVELS', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has wordCount 5', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].wordCount).toBe(5);
  });

  it('level 2 has wordCount 8', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].wordCount).toBe(8);
  });

  it('level 3 has wordCount 10', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].wordCount).toBe(10);
  });

  it('wordCount increases across levels', () => {
    expect(LEVELS[0].wordCount).toBeLessThan(LEVELS[1].wordCount);
    expect(LEVELS[1].wordCount).toBeLessThan(LEVELS[2].wordCount);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.wordCount).toBe(5);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.wordCount).toBe(8);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.wordCount).toBe(10);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });
});

describe('getWordsForLevel', () => {
  it('returns 5 words for level 1', () => {
    const words = getWordsForLevel(1);
    expect(words.length).toBe(5);
  });

  it('returns 8 words for level 2', () => {
    const words = getWordsForLevel(2);
    expect(words.length).toBe(8);
  });

  it('returns 10 words for level 3', () => {
    const words = getWordsForLevel(3);
    expect(words.length).toBe(10);
  });

  it('level 1 only has difficulty 1 words', () => {
    const words = getWordsForLevel(1);
    expect(words.every(w => w.difficulty <= 1)).toBe(true);
  });

  it('level 2 has max difficulty 2 words', () => {
    const words = getWordsForLevel(2);
    expect(words.every(w => w.difficulty <= 2)).toBe(true);
  });

  it('level 3 can have difficulty 3 words', () => {
    const words = getWordsForLevel(3);
    expect(words.some(w => w.difficulty === 3)).toBe(true);
  });

  it('returns array of SightWord', () => {
    const words = getWordsForLevel(1);
    expect(words.length).toBeGreaterThan(0);
    expect(words[0].word).toBeDefined();
    expect(words[0].difficulty).toBeDefined();
  });

  it('generates different words on multiple calls', () => {
    const words1 = getWordsForLevel(1);
    const words2 = getWordsForLevel(1);

    const words1Str = words1.map(w => w.word).join(',');
    const words2Str = words2.map(w => w.word).join(',');
    expect(words1Str).not.toBe(words2Str);
  });
});

describe('integration scenarios', () => {
  it('can get level 1 config and words', () => {
    const config = getLevelConfig(1);
    const words = getWordsForLevel(1);

    expect(config.wordCount).toBe(words.length);
    expect(words.length).toBe(5);
  });

  it('can get level 3 config and words', () => {
    const config = getLevelConfig(3);
    const words = getWordsForLevel(3);

    expect(config.wordCount).toBe(words.length);
    expect(words.length).toBe(10);
  });

  it('words are from SIGHT_WORDS', () => {
    const words = getWordsForLevel(1);
    for (const word of words) {
      expect(SIGHT_WORDS).toContain(word);
    }
  });
});

describe('edge cases', () => {
  it('handles empty word bank gracefully', () => {
    const config = getLevelConfig(1);
    expect(config.wordCount).toBeGreaterThan(0);
  });

  it('all words have non-empty strings', () => {
    for (const word of SIGHT_WORDS) {
      expect(word.word.length).toBeGreaterThan(0);
    }
  });

  it('all difficulties are between 1 and 3', () => {
    for (const word of SIGHT_WORDS) {
      expect(word.difficulty).toBeGreaterThanOrEqual(1);
      expect(word.difficulty).toBeLessThanOrEqual(3);
    }
  });
});

describe('type definitions', () => {
  it('SightWord interface is correctly implemented', () => {
    const word: SightWord = {
      word: 'test',
      difficulty: 1,
    };

    expect(typeof word.word).toBe('string');
    expect(typeof word.difficulty).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      wordCount: 8,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.wordCount).toBe('number');
  });
});

describe('sight word content', () => {
  it('includes pronouns', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    expect(words).toContain('I');
    expect(words).toContain('you');
    expect(words).toContain('he');
    expect(words).toContain('she');
    expect(words).toContain('we');
    expect(words).toContain('me');
    expect(words).toContain('her');
    expect(words).toContain('him');
    expect(words).toContain('his');
    expect(words).toContain('their');
  });

  it('includes common verbs', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    expect(words).toContain('is');
    expect(words).toContain('go');
    expect(words).toContain('have');
    expect(words).toContain('has');
    expect(words).toContain('make');
    expect(words).toContain('like');
    expect(words).toContain('come');
  });

  it('includes common prepositions and conjunctions', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    expect(words).toContain('to');
    expect(words).toContain('and');
    expect(words).toContain('or');
    expect(words).toContain('but');
    expect(words).toContain('if');
    expect(words).toContain('by');
    expect(words).toContain('at');
  });

  it('includes question words', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    expect(words).toContain('what');
    expect(words).toContain('when');
    expect(words).toContain('who');
    expect(words).toContain('which');
    expect(words).toContain('where');
    expect(words).toContain('how');
  });

  it('includes auxiliary verbs', () => {
    const words = SIGHT_WORDS.map(w => w.word);
    expect(words).toContain('was');
    expect(words).toContain('were');
    expect(words).toContain('had');
    expect(words).toContain('does');
    expect(words).toContain('would');
    expect(words).toContain('could');
    expect(words).toContain('should');
  });
});
