import { describe, expect, it } from 'vitest';
import {
  getDeterministicCoreDrop,
  maybeGetDeterministicBonusDrop,
  type DropEntry,
} from '../collectibles';

describe('collectibles deterministic rewards', () => {
  const table: DropEntry[] = [
    { itemId: 'shape-circle', chance: 0.5 },
    { itemId: 'shape-star', chance: 0.2, minScore: 90 },
    { itemId: 'color-red', chance: 0.3 },
  ];

  it('always returns a core reward when drop table is not empty', () => {
    const reward = getDeterministicCoreDrop(table, {
      gameId: 'shape-pop',
      completionCount: 1,
    });

    expect(reward).toBeTruthy();
    expect(table.map((entry) => entry.itemId)).toContain(reward);
  });

  it('returns stable core reward for identical deterministic input', () => {
    const input = { gameId: 'shape-pop', completionCount: 7, score: 42 };
    const first = getDeterministicCoreDrop(table, input);
    const second = getDeterministicCoreDrop(table, input);

    expect(first).toBe(second);
  });

  it('does not grant bonus reward by default', () => {
    const bonus = maybeGetDeterministicBonusDrop(
      table,
      { gameId: 'shape-pop', completionCount: 3, score: 100 },
      8
    );

    expect(bonus).toBeNull();
  });
});
