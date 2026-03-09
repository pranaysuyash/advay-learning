import { describe, expect, it } from 'vitest';

import {
  RhythmPattern,
  LevelConfig,
  LEVELS,
  getLevelConfig,
  createPattern,
  checkPattern,
} from '../rhythmTapLogic';

describe('LEVELS', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has patternLength 3 and bpm 120', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].patternLength).toBe(3);
    expect(LEVELS[0].bpm).toBe(120);
  });

  it('level 2 has patternLength 4 and bpm 140', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].patternLength).toBe(4);
    expect(LEVELS[1].bpm).toBe(140);
  });

  it('level 3 has patternLength 5 and bpm 160', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].patternLength).toBe(5);
    expect(LEVELS[2].bpm).toBe(160);
  });

  it('patternLength increases across levels', () => {
    expect(LEVELS[0].patternLength).toBeLessThan(LEVELS[1].patternLength);
    expect(LEVELS[1].patternLength).toBeLessThan(LEVELS[2].patternLength);
  });

  it('bpm increases across levels', () => {
    expect(LEVELS[0].bpm).toBeLessThan(LEVELS[1].bpm);
    expect(LEVELS[1].bpm).toBeLessThan(LEVELS[2].bpm);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.patternLength).toBe(3);
    expect(config.bpm).toBe(120);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.patternLength).toBe(4);
    expect(config.bpm).toBe(140);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.patternLength).toBe(5);
    expect(config.bpm).toBe(160);
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

describe('createPattern', () => {
  it('creates pattern with correct length for level 1', () => {
    const pattern = createPattern(1);
    expect(pattern.notes).toHaveLength(3);
    expect(pattern.bpm).toBe(120);
  });

  it('creates pattern with correct length for level 2', () => {
    const pattern = createPattern(2);
    expect(pattern.notes).toHaveLength(4);
    expect(pattern.bpm).toBe(140);
  });

  it('creates pattern with correct length for level 3', () => {
    const pattern = createPattern(3);
    expect(pattern.notes).toHaveLength(5);
    expect(pattern.bpm).toBe(160);
  });

  it('all notes are 0 or 1', () => {
    const pattern = createPattern(1);
    expect(pattern.notes.every(n => n === 0 || n === 1)).toBe(true);
  });

  it('generates different patterns on multiple calls', () => {
    const pattern1 = createPattern(1);
    const pattern2 = createPattern(1);

    // While they could be the same by chance, over many calls they should vary
    const patterns = [];
    for (let i = 0; i < 20; i++) {
      patterns.push(createPattern(1));
    }

    const unique = new Set(patterns.map(p => p.notes.join(',')));
    expect(unique.size).toBeGreaterThan(1);
  });

  it('returns RhythmPattern with valid structure', () => {
    const pattern = createPattern(1);
    expect(typeof pattern.notes).toBe('object');
    expect(typeof pattern.bpm).toBe('number');
    expect(Array.isArray(pattern.notes)).toBe(true);
  });
});

describe('checkPattern', () => {
  it('returns true for matching patterns', () => {
    const pattern: RhythmPattern = { notes: [1, 0, 1], bpm: 120 };
    expect(checkPattern([1, 0, 1], pattern.notes)).toBe(true);
  });

  it('returns false for different length patterns', () => {
    const pattern: RhythmPattern = { notes: [1, 0, 1], bpm: 120 };
    expect(checkPattern([1, 0], pattern.notes)).toBe(false);
    expect(checkPattern([1, 0, 1, 0], pattern.notes)).toBe(false);
  });

  it('returns false for wrong notes', () => {
    const pattern: RhythmPattern = { notes: [1, 0, 1], bpm: 120 };
    expect(checkPattern([1, 1, 1], pattern.notes)).toBe(false);
    expect(checkPattern([0, 0, 0], pattern.notes)).toBe(false);
    expect(checkPattern([1, 0, 0], pattern.notes)).toBe(false);
  });

  it('handles empty pattern', () => {
    const pattern: RhythmPattern = { notes: [], bpm: 120 };
    expect(checkPattern([], pattern.notes)).toBe(true);
    expect(checkPattern([1], pattern.notes)).toBe(false);
  });

  it('handles all zeros pattern', () => {
    const pattern: RhythmPattern = { notes: [0, 0, 0], bpm: 120 };
    expect(checkPattern([0, 0, 0], pattern.notes)).toBe(true);
    expect(checkPattern([0, 0, 1], pattern.notes)).toBe(false);
  });

  it('handles all ones pattern', () => {
    const pattern: RhythmPattern = { notes: [1, 1, 1], bpm: 120 };
    expect(checkPattern([1, 1, 1], pattern.notes)).toBe(true);
    expect(checkPattern([1, 1, 0], pattern.notes)).toBe(false);
  });

  it('is case-sensitive for array values', () => {
    const pattern: RhythmPattern = { notes: [1, 0, 1], bpm: 120 };
    expect(checkPattern([1, 0, 1], pattern.notes)).toBe(true);
  });
});

describe('integration scenarios', () => {
  it('can create and validate pattern for level 1', () => {
    const pattern = createPattern(1);
    expect(pattern.notes).toHaveLength(3);
    expect(checkPattern(pattern.notes, pattern.notes)).toBe(true);
  });

  it('can create and validate pattern for level 3', () => {
    const pattern = createPattern(3);
    expect(pattern.notes).toHaveLength(5);
    expect(checkPattern(pattern.notes, pattern.notes)).toBe(true);
  });

  it('can detect wrong user input', () => {
    const pattern = createPattern(1);
    const wrongInput = pattern.notes.map(n => n === 1 ? 0 : 1);
    expect(checkPattern(wrongInput, pattern.notes)).toBe(false);
  });

  it('can handle partial input', () => {
    const pattern: RhythmPattern = { notes: [1, 0, 1], bpm: 120 };
    expect(checkPattern([1], pattern.notes)).toBe(false);
    expect(checkPattern([1, 0], pattern.notes)).toBe(false);
  });
});

describe('edge cases', () => {
  it('handles single note pattern', () => {
    const pattern: RhythmPattern = { notes: [1], bpm: 120 };
    expect(checkPattern([1], pattern.notes)).toBe(true);
    expect(checkPattern([0], pattern.notes)).toBe(false);
  });

  it('handles long pattern', () => {
    const longPattern = Array.from({ length: 20 }, () => Math.random() > 0.5 ? 1 : 0);
    expect(checkPattern(longPattern, longPattern)).toBe(true);
    const wrongPattern = [...longPattern];
    wrongPattern[0] = wrongPattern[0] === 1 ? 0 : 1;
    expect(checkPattern(wrongPattern, longPattern)).toBe(false);
  });
});

describe('type definitions', () => {
  it('RhythmPattern interface is correctly implemented', () => {
    const pattern: RhythmPattern = {
      notes: [1, 0, 1],
      bpm: 120,
    };

    expect(Array.isArray(pattern.notes)).toBe(true);
    expect(typeof pattern.bpm).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      patternLength: 4,
      bpm: 140,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.patternLength).toBe('number');
    expect(typeof config.bpm).toBe('number');
  });
});

describe('progression design', () => {
  it('pattern length increases by 1 each level', () => {
    expect(LEVELS[1].patternLength - LEVELS[0].patternLength).toBe(1);
    expect(LEVELS[2].patternLength - LEVELS[1].patternLength).toBe(1);
  });

  it('bpm increases by 20 each level', () => {
    expect(LEVELS[1].bpm - LEVELS[0].bpm).toBe(20);
    expect(LEVELS[2].bpm - LEVELS[1].bpm).toBe(20);
  });

  it('difficulty scales appropriately', () => {
    // Level 1: 3 notes at 120bpm
    // Level 2: 4 notes at 140bpm
    // Level 3: 5 notes at 160bpm
    expect(LEVELS[0].patternLength * LEVELS[0].bpm).toBe(360);
    expect(LEVELS[1].patternLength * LEVELS[1].bpm).toBe(560);
    expect(LEVELS[2].patternLength * LEVELS[2].bpm).toBe(800);
  });
});
