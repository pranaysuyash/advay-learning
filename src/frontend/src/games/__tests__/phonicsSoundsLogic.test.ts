import { describe, expect, it } from 'vitest';

import {
  LEVELS,
  PHONEMES,
  buildPhonicsRound,
  getPhonemesForLevel,
} from '../phonicsSoundsLogic';

function seededRandom() {
  let seed = 42;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

describe('PHONEMES', () => {
  it('has 28 total phonemes (15 + 5 + 8)', () => {
    expect(PHONEMES).toHaveLength(28);
  });

  it('has 15 level-1 consonants', () => {
    expect(PHONEMES.filter((p) => p.level === 1)).toHaveLength(15);
  });

  it('has 5 level-2 vowels', () => {
    expect(PHONEMES.filter((p) => p.level === 2)).toHaveLength(5);
  });

  it('has 8 level-3 blends', () => {
    expect(PHONEMES.filter((p) => p.level === 3)).toHaveLength(8);
  });

  it('all phonemes have valid fields', () => {
    for (const p of PHONEMES) {
      expect(p.letter.length).toBeGreaterThan(0);
      expect(p.sound.length).toBeGreaterThan(0);
      expect(p.ttsText.length).toBeGreaterThan(0);
      expect(p.exampleWord.length).toBeGreaterThan(0);
      expect(p.exampleEmoji.length).toBeGreaterThan(0);
      expect([1, 2, 3]).toContain(p.level);
    }
  });

  it('ttsText is short (under 30 chars)', () => {
    for (const p of PHONEMES) {
      expect(p.ttsText.length).toBeLessThanOrEqual(30);
    }
  });
});

describe('LEVELS', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('each level has valid config', () => {
    for (const l of LEVELS) {
      expect(l.optionCount).toBeGreaterThanOrEqual(3);
      expect(l.roundCount).toBeGreaterThan(0);
      expect(l.timePerRound).toBeGreaterThan(0);
      expect(l.passThreshold).toBeGreaterThan(0);
      expect(l.passThreshold).toBeLessThanOrEqual(l.roundCount);
    }
  });
});

describe('getPhonemesForLevel', () => {
  it('returns correct phonemes for each level', () => {
    expect(getPhonemesForLevel(1)).toHaveLength(15);
    expect(getPhonemesForLevel(2)).toHaveLength(5);
    expect(getPhonemesForLevel(3)).toHaveLength(8);
  });

  it('returns empty for invalid level', () => {
    expect(getPhonemesForLevel(99)).toHaveLength(0);
  });

  it('all returned phonemes match requested level', () => {
    for (const p of getPhonemesForLevel(2)) {
      expect(p.level).toBe(2);
    }
  });
});

describe('buildPhonicsRound', () => {
  it('returns correct number of targets for level 1 (3 options)', () => {
    const round = buildPhonicsRound(1, [], seededRandom());
    expect(round.targets).toHaveLength(3);
  });

  it('returns correct number of targets for level 2 (4 options)', () => {
    const round = buildPhonicsRound(2, [], seededRandom());
    expect(round.targets).toHaveLength(4);
  });

  it('returns correct number of targets for level 3 (4 options)', () => {
    const round = buildPhonicsRound(3, [], seededRandom());
    expect(round.targets).toHaveLength(4);
  });

  it('has exactly one correct target', () => {
    const round = buildPhonicsRound(1, [], seededRandom());
    const correct = round.targets.filter((t) => t.isCorrect);
    expect(correct).toHaveLength(1);
  });

  it('correct target matches targetPhoneme', () => {
    const round = buildPhonicsRound(1, [], seededRandom());
    const correct = round.targets.find((t) => t.isCorrect)!;
    expect(correct.phoneme.letter).toBe(round.targetPhoneme.letter);
  });

  it('all targets are from the requested level', () => {
    const round = buildPhonicsRound(2, [], seededRandom());
    for (const t of round.targets) {
      expect(t.phoneme.level).toBe(2);
    }
  });

  it('targets have unique ids', () => {
    const round = buildPhonicsRound(1, [], seededRandom());
    const ids = round.targets.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('targets have positions within safe zone', () => {
    const round = buildPhonicsRound(1, [], seededRandom());
    for (const t of round.targets) {
      expect(t.x).toBeGreaterThanOrEqual(0.05);
      expect(t.x).toBeLessThanOrEqual(0.95);
      expect(t.y).toBeGreaterThanOrEqual(0.05);
      expect(t.y).toBeLessThanOrEqual(0.95);
    }
  });

  it('avoids recently used letters when possible', () => {
    // Use all but one letter — should pick the remaining one
    const level1 = getPhonemesForLevel(1);
    const allButOne = level1.slice(1).map((p) => p.letter);
    const round = buildPhonicsRound(1, allButOne, seededRandom());
    expect(round.targetPhoneme.letter).toBe(level1[0].letter);
  });

  it('falls back gracefully when all letters used', () => {
    const level1 = getPhonemesForLevel(1);
    const allLetters = level1.map((p) => p.letter);
    // Should not throw, just pick from full pool
    const round = buildPhonicsRound(1, allLetters, seededRandom());
    expect(round.targets.length).toBeGreaterThan(0);
  });

  it('is deterministic with seeded random', () => {
    const a = buildPhonicsRound(1, [], seededRandom());
    const b = buildPhonicsRound(1, [], seededRandom());
    expect(a.targetPhoneme.letter).toBe(b.targetPhoneme.letter);
  });

  it('distractors have different letters from target', () => {
    const round = buildPhonicsRound(1, [], seededRandom());
    const targetLetter = round.targetPhoneme.letter;
    const distractors = round.targets.filter((t) => !t.isCorrect);
    for (const d of distractors) {
      expect(d.phoneme.letter).not.toBe(targetLetter);
    }
  });
});
