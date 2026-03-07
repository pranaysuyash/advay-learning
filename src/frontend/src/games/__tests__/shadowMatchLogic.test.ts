import { describe, expect, it } from 'vitest';

import {
  createShadowMatchRound,
  isShadowMatchCorrect,
} from '../shadowMatchLogic';

describe('createShadowMatchRound', () => {
  it('returns three options and includes the target', () => {
    const round = createShadowMatchRound([], () => 0);

    expect(round.options).toHaveLength(3);
    expect(round.options.map((entry) => entry.id)).toContain(round.target.id);
  });

  it('prefers unused target ids when possible', () => {
    const first = createShadowMatchRound([], () => 0);
    const second = createShadowMatchRound([first.target.id], () => 0);

    expect(second.target.id).not.toBe(first.target.id);
  });
});

describe('isShadowMatchCorrect', () => {
  it('matches selected option id with target id', () => {
    const round = createShadowMatchRound([], () => 0);

    expect(isShadowMatchCorrect(round, round.target.id)).toBe(true);
    expect(isShadowMatchCorrect(round, 'unknown-id')).toBe(false);
  });
});
