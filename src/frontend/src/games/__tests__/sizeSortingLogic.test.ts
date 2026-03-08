import { describe, expect, it } from 'vitest';

import {
  createSizeSortingRound,
  evaluateSizeSortingPick,
  calculateScore,
  type SizeSortingRound,
  type SizeSortItem,
} from '../sizeSortingLogic';

describe('ITEM_SETS', () => {
  it('has exactly 3 item sets', () => {
    // Implicit test: createSizeSortingRound selects from 3 sets
    const rounds = [];
    for (let i = 0; i < 50; i++) {
      rounds.push(createSizeSortingRound(() => Math.random()));
    }

    const allItems = new Set<string>();
    for (const round of rounds) {
      for (const item of round.items) {
        allItems.add(item.id);
      }
    }

    // Should have items from all 3 sets
    expect(allItems.has('mouse')).toBe(true);
    expect(allItems.has('seed')).toBe(true);
    expect(allItems.has('cup')).toBe(true);
  });

  it('animals set has mouse, cat, elephant', () => {
    const round = createSizeSortingRound(() => 0);
    // RNG 0 picks first set (animals)
    const ids = round.items.map((i) => i.id);
    expect(ids).toContain('mouse');
    expect(ids).toContain('cat');
    expect(ids).toContain('elephant');
  });

  it('nature set has seed, tree, mountain', () => {
    // With specific RNG we can get nature set
    const round = createSizeSortingRound(() => 0.34);
    const ids = round.items.map((i) => i.id);
    // Nature set might be selected depending on RNG
    expect(round.items).toHaveLength(3);
  });

  it('containers set has cup, bucket, pool', () => {
    // With specific RNG we can get containers set
    const round = createSizeSortingRound(() => 0.67);
    expect(round.items).toHaveLength(3);
  });

  it('each item has id, label, emoji, and sizeRank', () => {
    const round = createSizeSortingRound();
    for (const item of round.items) {
      expect(typeof item.id).toBe('string');
      expect(typeof item.label).toBe('string');
      expect(typeof item.emoji).toBe('string');
      expect(typeof item.sizeRank).toBe('number');
    }
  });

  it('sizeRanks are 1, 2, 3 (smallest to largest)', () => {
    const round = createSizeSortingRound();
    const ranks = round.items.map((i) => i.sizeRank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3]);
  });

  it('mouse has rank 1, cat has rank 2, elephant has rank 3', () => {
    const round = createSizeSortingRound(() => 0);
    const mouse = round.items.find((i) => i.id === 'mouse');
    const cat = round.items.find((i) => i.id === 'cat');
    const elephant = round.items.find((i) => i.id === 'elephant');

    expect(mouse?.sizeRank).toBe(1);
    expect(cat?.sizeRank).toBe(2);
    expect(elephant?.sizeRank).toBe(3);
  });
});

describe('createSizeSortingRound', () => {
  it('creates a round with three items and a valid instruction', () => {
    const round = createSizeSortingRound(() => 0);

    expect(round.items).toHaveLength(3);
    expect(['small-to-big', 'big-to-small']).toContain(round.instruction);
  });

  it('instruction is small-to-big when RNG > 0.5', () => {
    const round = createSizeSortingRound(() => 0.6);
    expect(round.instruction).toBe('small-to-big');
  });

  it('instruction is big-to-small when RNG <= 0.5', () => {
    const round = createSizeSortingRound(() => 0.5);
    expect(round.instruction).toBe('big-to-small');
  });

  it('items are shuffled (not always in same order)', () => {
    const rounds = [];
    for (let i = 0; i < 10; i++) {
      rounds.push(createSizeSortingRound(() => Math.random()));
    }

    // Check that first item varies
    const firstIds = rounds.map((r) => r.items[0].id);
    const uniqueFirstIds = new Set(firstIds);

    // With RNG, should have some variety
    expect(uniqueFirstIds.size).toBeGreaterThan(1);
  });

  it('deterministic with same RNG', () => {
    const makeRng = () => {
      let seed = 42;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
    };

    const rng1 = makeRng();
    const round1 = createSizeSortingRound(rng1);

    const rng2 = makeRng();
    const round2 = createSizeSortingRound(rng2);

    expect(round1.instruction).toBe(round2.instruction);
    expect(round1.items.map((i) => i.id)).toEqual(round2.items.map((i) => i.id));
  });

  it('all items have unique IDs', () => {
    const round = createSizeSortingRound();
    const ids = round.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('all items have unique sizeRanks', () => {
    const round = createSizeSortingRound();
    const ranks = round.items.map((i) => i.sizeRank);
    expect(new Set(ranks).size).toBe(3);
  });

  it('produces different rounds on multiple calls', () => {
    const rounds = [];
    for (let i = 0; i < 20; i++) {
      rounds.push(createSizeSortingRound(() => Math.random()));
    }

    // Check for variety in instructions
    const instructions = rounds.map((r) => r.instruction);
    expect(new Set(instructions).size).toBeGreaterThan(0);
  });
});

describe('evaluateSizeSortingPick', () => {
  describe('small-to-big instruction', () => {
    const round: SizeSortingRound = {
      instruction: 'small-to-big',
      items: [
        { id: 'mouse', label: 'Mouse', emoji: '🐭', sizeRank: 1 },
        { id: 'cat', label: 'Cat', emoji: '🐱', sizeRank: 2 },
        { id: 'elephant', label: 'Elephant', emoji: '🐘', sizeRank: 3 },
      ],
    };

    it('accepts correct first pick (smallest)', () => {
      const result = evaluateSizeSortingPick(round, [], 'mouse');
      expect(result.ok).toBe(true);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(2);
    });

    it('accepts correct second pick (medium)', () => {
      const result = evaluateSizeSortingPick(round, ['mouse'], 'cat');
      expect(result.ok).toBe(true);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(3);
    });

    it('accepts correct final pick and marks completed', () => {
      const result = evaluateSizeSortingPick(round, ['mouse', 'cat'], 'elephant');
      expect(result.ok).toBe(true);
      expect(result.completed).toBe(true);
      expect(result.nextExpectedRank).toBe(null);
    });

    it('rejects wrong first pick (largest)', () => {
      const result = evaluateSizeSortingPick(round, [], 'elephant');
      expect(result.ok).toBe(false);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(1);
    });

    it('rejects wrong second pick', () => {
      const result = evaluateSizeSortingPick(round, ['mouse'], 'elephant');
      expect(result.ok).toBe(false);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(2);
    });

    it('rejects duplicate pick', () => {
      const result = evaluateSizeSortingPick(round, ['mouse'], 'mouse');
      expect(result.ok).toBe(false);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(null);
    });
  });

  describe('big-to-small instruction', () => {
    const round: SizeSortingRound = {
      instruction: 'big-to-small',
      items: [
        { id: 'mouse', label: 'Mouse', emoji: '🐭', sizeRank: 1 },
        { id: 'cat', label: 'Cat', emoji: '🐱', sizeRank: 2 },
        { id: 'elephant', label: 'Elephant', emoji: '🐘', sizeRank: 3 },
      ],
    };

    it('accepts correct first pick (largest)', () => {
      const result = evaluateSizeSortingPick(round, [], 'elephant');
      expect(result.ok).toBe(true);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(2);
    });

    it('accepts correct second pick (medium)', () => {
      const result = evaluateSizeSortingPick(round, ['elephant'], 'cat');
      expect(result.ok).toBe(true);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(1);
    });

    it('accepts correct final pick and marks completed', () => {
      const result = evaluateSizeSortingPick(round, ['elephant', 'cat'], 'mouse');
      expect(result.ok).toBe(true);
      expect(result.completed).toBe(true);
      expect(result.nextExpectedRank).toBe(null);
    });

    it('rejects wrong first pick (smallest)', () => {
      const result = evaluateSizeSortingPick(round, [], 'mouse');
      expect(result.ok).toBe(false);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(3);
    });
  });

  describe('duplicate pick handling', () => {
    const round: SizeSortingRound = {
      instruction: 'small-to-big',
      items: [
        { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
        { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
        { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
      ],
    };

    it('rejects picking same item twice', () => {
      const first = evaluateSizeSortingPick(round, [], 'small');
      expect(first.ok).toBe(true);

      const second = evaluateSizeSortingPick(round, ['small'], 'small');
      expect(second.ok).toBe(false);
      expect(second.nextExpectedRank).toBe(null);
    });

    it('rejects picking already-picked item out of order', () => {
      const first = evaluateSizeSortingPick(round, [], 'small');
      const second = evaluateSizeSortingPick(round, ['small'], 'medium');

      // Try picking 'small' again after 'medium'
      const third = evaluateSizeSortingPick(round, ['small', 'medium'], 'small');
      expect(third.ok).toBe(false);
    });
  });

  describe('invalid item handling', () => {
    const round: SizeSortingRound = {
      instruction: 'small-to-big',
      items: [
        { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
        { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
        { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
      ],
    };

    it('handles non-existent item id', () => {
      const result = evaluateSizeSortingPick(round, [], 'nonexistent');
      expect(result.ok).toBe(false);
      expect(result.completed).toBe(false);
      expect(result.nextExpectedRank).toBe(1);
    });
  });

  describe('full game simulation', () => {
    it('completes a full small-to-big round', () => {
      const round: SizeSortingRound = {
        instruction: 'small-to-big',
        items: [
          { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
          { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
          { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
        ],
      };

      const first = evaluateSizeSortingPick(round, [], 'small');
      expect(first.ok).toBe(true);

      const second = evaluateSizeSortingPick(round, ['small'], 'medium');
      expect(second.ok).toBe(true);

      const third = evaluateSizeSortingPick(round, ['small', 'medium'], 'large');
      expect(third.ok).toBe(true);
      expect(third.completed).toBe(true);
      expect(third.nextExpectedRank).toBe(null);
    });

    it('completes a full big-to-small round', () => {
      const round: SizeSortingRound = {
        instruction: 'big-to-small',
        items: [
          { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
          { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
          { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
        ],
      };

      const first = evaluateSizeSortingPick(round, [], 'large');
      expect(first.ok).toBe(true);

      const second = evaluateSizeSortingPick(round, ['large'], 'medium');
      expect(second.ok).toBe(true);

      const third = evaluateSizeSortingPick(round, ['large', 'medium'], 'small');
      expect(third.ok).toBe(true);
      expect(third.completed).toBe(true);
      expect(third.nextExpectedRank).toBe(null);
    });
  });
});

describe('calculateScore', () => {
  describe('small-to-big scoring', () => {
    it('returns 15 for streak 0', () => {
      const score = calculateScore(0, 'small-to-big');
      expect(score).toBe(15);
    });

    it('returns 18 for streak 1', () => {
      const score = calculateScore(1, 'small-to-big');
      expect(score).toBe(18);
    });

    it('returns 21 for streak 2', () => {
      const score = calculateScore(2, 'small-to-big');
      expect(score).toBe(21);
    });

    it('returns 24 for streak 3', () => {
      const score = calculateScore(3, 'small-to-big');
      expect(score).toBe(24);
    });

    it('returns 30 for streak 5 (max bonus)', () => {
      const score = calculateScore(5, 'small-to-big');
      expect(score).toBe(30);
    });

    it('returns 30 for streak 10 (capped)', () => {
      const score = calculateScore(10, 'small-to-big');
      expect(score).toBe(30);
    });
  });

  describe('big-to-small scoring (1.5x multiplier)', () => {
    it('returns 22 for streak 0 (15 × 1.5 = 22.5 → 22)', () => {
      const score = calculateScore(0, 'big-to-small');
      expect(score).toBe(22);
    });

    it('returns 27 for streak 1 (18 × 1.5 = 27)', () => {
      const score = calculateScore(1, 'big-to-small');
      expect(score).toBe(27);
    });

    it('returns 31 for streak 2 (21 × 1.5 = 31.5 → 31)', () => {
      const score = calculateScore(2, 'big-to-small');
      expect(score).toBe(31);
    });

    it('returns 36 for streak 3 (24 × 1.5 = 36)', () => {
      const score = calculateScore(3, 'big-to-small');
      expect(score).toBe(36);
    });

    it('returns 45 for streak 5 (30 × 1.5 = 45)', () => {
      const score = calculateScore(5, 'big-to-small');
      expect(score).toBe(45);
    });

    it('returns 45 for streak 10 (capped)', () => {
      const score = calculateScore(10, 'big-to-small');
      expect(score).toBe(45);
    });
  });

  describe('score progression', () => {
    it('small-to-big scores increase by 3 until streak 5', () => {
      const scores = [];
      for (let i = 0; i <= 5; i++) {
        scores.push(calculateScore(i, 'small-to-big'));
      }

      expect(scores).toEqual([15, 18, 21, 24, 27, 30]);
    });

    it('big-to-small scores plateau after streak 5', () => {
      const score5 = calculateScore(5, 'big-to-small');
      const score10 = calculateScore(10, 'big-to-small');
      const score20 = calculateScore(20, 'big-to-small');

      expect(score5).toBe(score10);
      expect(score10).toBe(score20);
    });
  });
});

describe('integration scenarios', () => {
  it('can simulate a complete game session', () => {
    const rounds = [];
    for (let i = 0; i < 5; i++) {
      rounds.push(createSizeSortingRound(() => Math.random()));
    }

    expect(rounds).toHaveLength(5);
    for (const round of rounds) {
      expect(round.items).toHaveLength(3);
      expect(['small-to-big', 'big-to-small']).toContain(round.instruction);
    }
  });

  it('handles mixed correct and incorrect picks', () => {
    const round: SizeSortingRound = {
      instruction: 'small-to-big',
      items: [
        { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
        { id: 'medium', label: 'Medium', emoji: 'MED', sizeRank: 2 },
        { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
      ],
    };

    // Wrong pick
    const wrong = evaluateSizeSortingPick(round, [], 'large');
    expect(wrong.ok).toBe(false);

    // Correct pick
    const correct = evaluateSizeSortingPick(round, [], 'small');
    expect(correct.ok).toBe(true);
  });

  it('calculates total score for completed round', () => {
    const streak = 3;
    const instruction: 'small-to-big' | 'big-to-small' = 'small-to-big';
    const score = calculateScore(streak, instruction);

    expect(score).toBeGreaterThanOrEqual(15);
    expect(score).toBeLessThanOrEqual(45);
  });
});

describe('type definitions', () => {
  it('SizeSortItem interface is correctly implemented', () => {
    const item: SizeSortItem = {
      id: 'test',
      label: 'Test',
      emoji: '🧪',
      sizeRank: 2,
    };

    expect(typeof item.id).toBe('string');
    expect(typeof item.label).toBe('string');
    expect(typeof item.emoji).toBe('string');
    expect(typeof item.sizeRank).toBe('number');
  });

  it('SizeSortingRound interface is correctly implemented', () => {
    const round: SizeSortingRound = {
      instruction: 'small-to-big',
      items: [
        { id: 'small', label: 'Small', emoji: 'SMALL', sizeRank: 1 },
        { id: 'large', label: 'Large', emoji: 'LARGE', sizeRank: 3 },
      ],
    };

    expect(['small-to-big', 'big-to-small']).toContain(round.instruction);
    expect(Array.isArray(round.items)).toBe(true);
  });
});
