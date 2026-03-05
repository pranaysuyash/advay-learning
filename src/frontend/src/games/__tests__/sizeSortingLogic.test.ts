import { describe, expect, it } from 'vitest';

import {
  createSizeSortingRound,
  evaluateSizeSortingPick,
} from '../sizeSortingLogic';

describe('createSizeSortingRound', () => {
  it('creates a round with three items and a valid instruction', () => {
    const round = createSizeSortingRound(() => 0);

    expect(round.items).toHaveLength(3);
    expect(['small-to-big', 'big-to-small']).toContain(round.instruction);
  });
});

describe('evaluateSizeSortingPick', () => {
  it('accepts correct order picks and marks completion on final pick', () => {
    const round = {
      instruction: 'small-to-big' as const,
      items: [
        { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
        { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
        { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
      ],
    };

    const first = evaluateSizeSortingPick(round, [], 'small');
    const second = evaluateSizeSortingPick(round, ['small'], 'medium');
    const third = evaluateSizeSortingPick(round, ['small', 'medium'], 'large');

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third).toEqual({ ok: true, completed: true, nextExpectedRank: null });
  });

  it('rejects wrong next pick and duplicate picks', () => {
    const round = {
      instruction: 'small-to-big' as const,
      items: [
        { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
        { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
        { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
      ],
    };

    expect(evaluateSizeSortingPick(round, [], 'large').ok).toBe(false);
    expect(evaluateSizeSortingPick(round, ['small'], 'small').ok).toBe(false);
  });
});
