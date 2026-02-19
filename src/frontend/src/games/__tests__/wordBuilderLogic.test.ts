import { describe, expect, it } from 'vitest';

import {
  WORD_LISTS,
  createLetterTargets,
  pickWordForLevel,
} from '../wordBuilderLogic';

function seededRandom() {
  let seed = 42;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

describe('pickWordForLevel', () => {
  it('returns a word from the level-1 list', () => {
    const word = pickWordForLevel(1, seededRandom());
    expect(WORD_LISTS[0]).toContain(word);
  });

  it('returns a word from the level-2 list', () => {
    const word = pickWordForLevel(2, seededRandom());
    expect(WORD_LISTS[1]).toContain(word);
  });

  it('returns a word from the level-3 list', () => {
    const word = pickWordForLevel(3, seededRandom());
    expect(WORD_LISTS[2]).toContain(word);
  });

  it('clamps to the last list for level > 3', () => {
    const word = pickWordForLevel(10, seededRandom());
    expect(WORD_LISTS[WORD_LISTS.length - 1]).toContain(word);
  });

  it('uses the provided random function deterministically', () => {
    const a = pickWordForLevel(1, seededRandom());
    const b = pickWordForLevel(1, seededRandom());
    expect(a).toBe(b);
  });
});

describe('createLetterTargets', () => {
  it('returns correct number of targets', () => {
    const targets = createLetterTargets('CAT', 3, seededRandom());
    expect(targets).toHaveLength(3 + 3);
  });

  it('marks correct letters with isCorrect=true and sequential orderIndex', () => {
    const targets = createLetterTargets('DOG', 2, seededRandom());
    const correct = targets.filter((t) => t.isCorrect);
    expect(correct).toHaveLength(3);
    expect(correct.map((t) => t.letter)).toEqual(['D', 'O', 'G']);
    expect(correct.map((t) => t.orderIndex)).toEqual([0, 1, 2]);
  });

  it('marks distractors with isCorrect=false and orderIndex=-1', () => {
    const targets = createLetterTargets('CAT', 2, seededRandom());
    const distractors = targets.filter((t) => !t.isCorrect);
    expect(distractors).toHaveLength(2);
    for (const d of distractors) {
      expect(d.orderIndex).toBe(-1);
    }
  });

  it('distractor letters are not in the word', () => {
    const word = 'SUN';
    const targets = createLetterTargets(word, 4, seededRandom());
    const wordLetters = new Set(word.split(''));
    const distractors = targets.filter((t) => !t.isCorrect);
    for (const d of distractors) {
      expect(wordLetters.has(d.letter)).toBe(false);
    }
  });

  it('all targets have a position with x and y', () => {
    const targets = createLetterTargets('HAT', 2, seededRandom());
    for (const t of targets) {
      expect(t.position).toHaveProperty('x');
      expect(t.position).toHaveProperty('y');
      expect(typeof t.position.x).toBe('number');
      expect(typeof t.position.y).toBe('number');
    }
  });
});
