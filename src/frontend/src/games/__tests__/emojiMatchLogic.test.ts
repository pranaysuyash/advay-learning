import { describe, expect, it } from 'vitest';

import { EMOTIONS, buildRound } from '../emojiMatchLogic';

function seededRandom() {
  let seed = 42;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

describe('EMOTIONS', () => {
  it('has 8 entries', () => {
    expect(EMOTIONS).toHaveLength(8);
  });

  it('each entry has name, emoji, and color', () => {
    for (const e of EMOTIONS) {
      expect(typeof e.name).toBe('string');
      expect(typeof e.emoji).toBe('string');
      expect(typeof e.color).toBe('string');
    }
  });
});

describe('buildRound', () => {
  it('returns correct number of targets matching optionCount', () => {
    const { targets } = buildRound(5, seededRandom());
    expect(targets).toHaveLength(5);
  });

  it('correctId is within valid range', () => {
    const { targets, correctId } = buildRound(4, seededRandom());
    expect(correctId).toBeGreaterThanOrEqual(0);
    expect(correctId).toBeLessThan(targets.length);
  });

  it('each target has id, position, name, emoji, and color', () => {
    const { targets } = buildRound(4, seededRandom());
    for (const t of targets) {
      expect(typeof t.id).toBe('number');
      expect(t.position).toHaveProperty('x');
      expect(t.position).toHaveProperty('y');
      expect(typeof t.name).toBe('string');
      expect(typeof t.emoji).toBe('string');
      expect(typeof t.color).toBe('string');
    }
  });

  it('targets have unique ids', () => {
    const { targets } = buildRound(6, seededRandom());
    const ids = targets.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('works with custom random function', () => {
    const a = buildRound(4, seededRandom());
    const b = buildRound(4, seededRandom());
    expect(a.targets.map((t) => t.name)).toEqual(
      b.targets.map((t) => t.name),
    );
    expect(a.correctId).toBe(b.correctId);
  });

  it('default optionCount is 4', () => {
    const { targets } = buildRound(undefined, seededRandom());
    expect(targets).toHaveLength(4);
  });
});
