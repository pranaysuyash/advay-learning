import { describe, expect, it } from 'vitest';

import {
  NUMBER_SEQUENCE_LEVELS,
  createNumberSequenceRound,
} from '../numberSequenceLogic';

describe('createNumberSequenceRound', () => {
  it('builds a deterministic arithmetic sequence for a level', () => {
    const round = createNumberSequenceRound(2, () => 0);

    expect(round.sequence).toEqual([2, 4, 6, 8, 10]);
    expect(round.missingIndex).toBe(1);
    expect(round.answer).toBe(4);
    expect(round.options).toContain(4);
  });

  it('falls back to level 1 for unknown level input', () => {
    const fallbackRound = createNumberSequenceRound(999, () => 0);
    const levelOne = NUMBER_SEQUENCE_LEVELS[0];

    expect(fallbackRound.sequence[0]).toBe(levelOne.minStart);
    expect(fallbackRound.sequence[1] - fallbackRound.sequence[0]).toBe(levelOne.step);
  });
});
