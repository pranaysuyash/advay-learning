import { describe, expect, it } from 'vitest';

import {
  createSameAndDifferentRound,
  isSameAndDifferentCorrect,
} from '../sameAndDifferentLogic';

describe('createSameAndDifferentRound', () => {
  it('can generate a same round deterministically', () => {
    const round = createSameAndDifferentRound(() => 0.9);

    expect(round.answer).toBe('same');
    expect(round.left.id).toBe(round.right.id);
  });

  it('can generate a different round deterministically', () => {
    const round = createSameAndDifferentRound(() => 0.1);

    expect(round.answer).toBe('different');
    expect(round.left.id).not.toBe(round.right.id);
  });
});

describe('isSameAndDifferentCorrect', () => {
  it('matches selected answer to round answer', () => {
    const sameRound = createSameAndDifferentRound(() => 0.9);
    const diffRound = createSameAndDifferentRound(() => 0.1);

    expect(isSameAndDifferentCorrect(sameRound, 'same')).toBe(true);
    expect(isSameAndDifferentCorrect(diffRound, 'same')).toBe(false);
  });
});
