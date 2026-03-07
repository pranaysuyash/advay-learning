import { describe, expect, it } from 'vitest';

import {
  createReadingAlongRound,
  isReadingAlongAnswerCorrect,
} from '../readingAlongLogic';

describe('createReadingAlongRound', () => {
  it('includes target word in options', () => {
    const round = createReadingAlongRound([], () => 0);

    expect(round.options).toHaveLength(3);
    expect(round.options).toContain(round.sentence.targetWord);
  });

  it('prefers unused sentence ids when available', () => {
    const first = createReadingAlongRound([], () => 0);
    const second = createReadingAlongRound([first.sentence.id], () => 0);

    expect(second.sentence.id).not.toBe(first.sentence.id);
  });
});

describe('isReadingAlongAnswerCorrect', () => {
  it('checks selected word against round target', () => {
    const round = createReadingAlongRound([], () => 0);

    expect(isReadingAlongAnswerCorrect(round, round.sentence.targetWord)).toBe(true);
    expect(isReadingAlongAnswerCorrect(round, 'wrong-word')).toBe(false);
  });
});
