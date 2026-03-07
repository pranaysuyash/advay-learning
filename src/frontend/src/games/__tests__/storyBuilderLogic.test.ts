import { describe, expect, it } from 'vitest';

import {
  createStoryBuilderRound,
  evaluateStoryWordPick,
} from '../storyBuilderLogic';

describe('createStoryBuilderRound', () => {
  it('returns options as a permutation of ordered words', () => {
    const round = createStoryBuilderRound([], () => 0);

    expect(round.options).toHaveLength(round.orderedWords.length);
    expect(round.options.slice().sort()).toEqual(round.orderedWords.slice().sort());
  });
});

describe('evaluateStoryWordPick', () => {
  it('accepts correct sequence and marks complete at end', () => {
    const round = {
      id: 'manual-1',
      prompt: 'Build sentence',
      orderedWords: ['We', 'read', 'books'],
      options: ['books', 'read', 'We'],
    };

    expect(evaluateStoryWordPick(round, [], 'We')).toEqual({ ok: true, completed: false });
    expect(evaluateStoryWordPick(round, ['We'], 'read')).toEqual({ ok: true, completed: false });
    expect(evaluateStoryWordPick(round, ['We', 'read'], 'books')).toEqual({ ok: true, completed: true });
  });

  it('rejects wrong order and duplicate picks', () => {
    const round = {
      id: 'manual-2',
      prompt: 'Build sentence',
      orderedWords: ['We', 'read', 'books'],
      options: ['books', 'read', 'We'],
    };

    expect(evaluateStoryWordPick(round, [], 'books').ok).toBe(false);
    expect(evaluateStoryWordPick(round, ['We'], 'We').ok).toBe(false);
  });
});
