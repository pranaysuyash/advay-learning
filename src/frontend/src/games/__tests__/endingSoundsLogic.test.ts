import { describe, expect, it } from 'vitest';

import {
  createEndingSoundsRound,
  isEndingSoundCorrect,
} from '../endingSoundsLogic';

describe('createEndingSoundsRound', () => {
  it('returns a 4-option round with correct ending included', () => {
    const round = createEndingSoundsRound([], () => 0);

    expect(round.options).toHaveLength(4);
    expect(round.options).toContain(round.target.endingLetter);
  });

  it('avoids already used words when possible', () => {
    const first = createEndingSoundsRound([], () => 0);
    const second = createEndingSoundsRound([first.target.word], () => 0);

    expect(second.target.word).not.toBe(first.target.word);
  });
});

describe('isEndingSoundCorrect', () => {
  it('matches selected ending letter against target', () => {
    const round = createEndingSoundsRound([], () => 0);

    expect(isEndingSoundCorrect(round, round.target.endingLetter)).toBe(true);
    expect(isEndingSoundCorrect(round, 'Z')).toBe(round.target.endingLetter === 'Z');
  });
});
