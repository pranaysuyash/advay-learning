import { describe, expect, it } from 'vitest';

import {
  createLetterSoundMatchRound,
  isLetterSoundMatchCorrect,
} from '../letterSoundMatchLogic';

describe('createLetterSoundMatchRound', () => {
  it('returns options including target sound', () => {
    const round = createLetterSoundMatchRound([], () => 0);

    expect(round.options).toHaveLength(3);
    expect(round.options).toContain(round.target.sound);
  });

  it('prefers unused letters when possible', () => {
    const first = createLetterSoundMatchRound([], () => 0);
    const second = createLetterSoundMatchRound([first.target.letter], () => 0);

    expect(second.target.letter).not.toBe(first.target.letter);
  });
});

describe('isLetterSoundMatchCorrect', () => {
  it('checks selected sound against target', () => {
    const round = createLetterSoundMatchRound([], () => 0);

    expect(isLetterSoundMatchCorrect(round, round.target.sound)).toBe(true);
    expect(isLetterSoundMatchCorrect(round, 'zzz')).toBe(false);
  });
});
