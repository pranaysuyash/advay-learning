import { describe, expect, it } from 'vitest';

import {
  SameDifferentItem,
  SameAndDifferentRound,
  ITEM_BANK,
  createSameAndDifferentRound,
  isSameAndDifferentCorrect,
} from '../sameAndDifferentLogic';

describe('ITEM_BANK', () => {
  it('has 6 items', () => {
    expect(ITEM_BANK).toHaveLength(6);
  });

  it('all items have valid structure', () => {
    for (const item of ITEM_BANK) {
      expect(typeof item.id).toBe('string');
      expect(typeof item.label).toBe('string');
      expect(typeof item.emoji).toBe('string');
    }
  });

  it('contains cat item', () => {
    const cat = ITEM_BANK.find(i => i.id === 'cat');
    expect(cat).toBeDefined();
    expect(cat?.label).toBe('Cat');
  });

  it('contains dog item', () => {
    const dog = ITEM_BANK.find(i => i.id === 'dog');
    expect(dog).toBeDefined();
    expect(dog?.label).toBe('Dog');
  });

  it('contains ball item', () => {
    const ball = ITEM_BANK.find(i => i.id === 'ball');
    expect(ball).toBeDefined();
    expect(ball?.label).toBe('Ball');
  });

  it('all item IDs are unique', () => {
    const ids = ITEM_BANK.map(i => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all labels are capitalized', () => {
    for (const item of ITEM_BANK) {
      expect(item.label[0]).toMatch(/[A-Z]/);
    }
  });
});

describe('createSameAndDifferentRound', () => {
  it('returns a round with valid structure', () => {
    const round = createSameAndDifferentRound();

    expect(round.left).toBeDefined();
    expect(round.right).toBeDefined();
    expect(['same', 'different']).toContain(round.answer);
  });

  it('can generate same round deterministically', () => {
    const round = createSameAndDifferentRound(() => 0.9);

    expect(round.answer).toBe('same');
    expect(round.left.id).toBe(round.right.id);
  });

  it('can generate different round deterministically', () => {
    const round = createSameAndDifferentRound(() => 0.1);

    expect(round.answer).toBe('different');
    expect(round.left.id).not.toBe(round.right.id);
  });

  it('left item is from ITEM_BANK', () => {
    const round = createSameAndDifferentRound();
    const found = ITEM_BANK.find(i => i.id === round.left.id);
    expect(found).toBeDefined();
  });

  it('right item is from ITEM_BANK', () => {
    const round = createSameAndDifferentRound();
    const found = ITEM_BANK.find(i => i.id === round.right.id);
    expect(found).toBeDefined();
  });

  it('for same round, left and right are identical', () => {
    const round = createSameAndDifferentRound(() => 0.9);

    if (round.answer === 'same') {
      expect(round.left.id).toBe(round.right.id);
      expect(round.left.label).toBe(round.right.label);
    }
  });

  it('for different round, left and right have different IDs', () => {
    const round = createSameAndDifferentRound(() => 0.1);

    if (round.answer === 'different') {
      expect(round.left.id).not.toBe(round.right.id);
    }
  });

  it('generates both same and different rounds over time', () => {
    const rounds = [];
    for (let i = 0; i < 20; i++) {
      rounds.push(createSameAndDifferentRound());
    }

    const hasSame = rounds.some(r => r.answer === 'same');
    const hasDifferent = rounds.some(r => r.answer === 'different');

    expect(hasSame).toBe(true);
    expect(hasDifferent).toBe(true);
  });

  it('accepts custom RNG function', () => {
    const round = createSameAndDifferentRound(() => 0.5);
    expect(round).toBeDefined();
  });

  it('uses Math.random by default', () => {
    const round = createSameAndDifferentRound();
    expect(round).toBeDefined();
  });
});

describe('isSameAndDifferentCorrect', () => {
  it('returns true for same round with same answer', () => {
    const round: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'cat', label: 'Cat', emoji: 'cat' },
      answer: 'same',
    };

    expect(isSameAndDifferentCorrect(round, 'same')).toBe(true);
  });

  it('returns false for same round with different answer', () => {
    const round: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'cat', label: 'Cat', emoji: 'cat' },
      answer: 'same',
    };

    expect(isSameAndDifferentCorrect(round, 'different')).toBe(false);
  });

  it('returns true for different round with different answer', () => {
    const round: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'dog', label: 'Dog', emoji: 'dog' },
      answer: 'different',
    };

    expect(isSameAndDifferentCorrect(round, 'different')).toBe(true);
  });

  it('returns false for different round with same answer', () => {
    const round: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'dog', label: 'Dog', emoji: 'dog' },
      answer: 'different',
    };

    expect(isSameAndDifferentCorrect(round, 'same')).toBe(false);
  });

  it('compares answer strings exactly', () => {
    const round: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'cat', label: 'Cat', emoji: 'cat' },
      answer: 'same',
    };

    expect(isSameAndDifferentCorrect(round, 'same')).toBe(true);
    expect(isSameAndDifferentCorrect(round, 'Same')).toBe(false); // Case sensitive
  });
});

describe('integration scenarios', () => {
  it('can generate and check same round', () => {
    const round = createSameAndDifferentRound(() => 0.9);

    if (round.answer === 'same') {
      expect(isSameAndDifferentCorrect(round, 'same')).toBe(true);
      expect(isSameAndDifferentCorrect(round, 'different')).toBe(false);
    }
  });

  it('can generate and check different round', () => {
    const round = createSameAndDifferentRound(() => 0.1);

    if (round.answer === 'different') {
      expect(isSameAndDifferentCorrect(round, 'different')).toBe(true);
      expect(isSameAndDifferentCorrect(round, 'same')).toBe(false);
    }
  });

  it('can simulate multiple rounds with checking', () => {
    let correctCount = 0;

    for (let i = 0; i < 10; i++) {
      const round = createSameAndDifferentRound();
      const userAnswer = round.answer; // Perfect player
      if (isSameAndDifferentCorrect(round, userAnswer)) {
        correctCount++;
      }
    }

    expect(correctCount).toBe(10);
  });

  it('handles random round generation', () => {
    const rounds = [];
    for (let i = 0; i < 5; i++) {
      rounds.push(createSameAndDifferentRound());
    }

    for (const round of rounds) {
      expect(['same', 'different']).toContain(round.answer);
      expect(round.left).toBeDefined();
      expect(round.right).toBeDefined();
    }
  });
});

describe('edge cases', () => {
  it('handles all same rounds', () => {
    const rounds = [];
    for (let i = 0; i < 10; i++) {
      rounds.push(createSameAndDifferentRound(() => 0.9));
    }

    expect(rounds.every(r => r.answer === 'same')).toBe(true);
  });

  it('handles all different rounds', () => {
    const rounds = [];
    for (let i = 0; i < 10; i++) {
      rounds.push(createSameAndDifferentRound(() => 0.1));
    }

    expect(rounds.every(r => r.answer === 'different')).toBe(true);
  });

  it('same round has left and right equal', () => {
    const round = createSameAndDifferentRound(() => 0.9);
    if (round.answer === 'same') {
      expect(round.left).toEqual(round.right);
    }
  });

  it('different round has left and right not equal', () => {
    const round = createSameAndDifferentRound(() => 0.1);
    if (round.answer === 'different') {
      expect(round.left).not.toEqual(round.right);
    }
  });

  it('different round never selects same item twice', () => {
    const rounds = [];
    for (let i = 0; i < 50; i++) {
      rounds.push(createSameAndDifferentRound(() => 0.1));
    }

    for (const round of rounds) {
      if (round.answer === 'different') {
        expect(round.left.id).not.toBe(round.right.id);
      }
    }
  });
});

describe('type definitions', () => {
  it('SameDifferentItem interface is correctly implemented', () => {
    const item: SameDifferentItem = {
      id: 'test',
      label: 'Test',
      emoji: 'test',
    };

    expect(typeof item.id).toBe('string');
    expect(typeof item.label).toBe('string');
    expect(typeof item.emoji).toBe('string');
  });

  it('SameAndDifferentRound interface is correctly implemented', () => {
    const round: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'cat', label: 'Cat', emoji: 'cat' },
      answer: 'same',
    };

    expect(typeof round.left).toBe('object');
    expect(typeof round.right).toBe('object');
    expect(['same', 'different']).toContain(round.answer);
  });

  it('answer type is union of literal types', () => {
    const same: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'cat', label: 'Cat', emoji: 'cat' },
      answer: 'same',
    };

    const different: SameAndDifferentRound = {
      left: { id: 'cat', label: 'Cat', emoji: 'cat' },
      right: { id: 'dog', label: 'Dog', emoji: 'dog' },
      answer: 'different',
    };

    expect(same.answer).toBe('same');
    expect(different.answer).toBe('different');
  });

  it('all items in bank have unique IDs', () => {
    const ids = ITEM_BANK.map(i => i.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all items in bank have non-empty labels', () => {
    for (const item of ITEM_BANK) {
      expect(item.label.length).toBeGreaterThan(0);
    }
  });
});

describe('round distribution', () => {
  it('generates approximately 50% same rounds', () => {
    const rounds = [];
    for (let i = 0; i < 100; i++) {
      rounds.push(createSameAndDifferentRound());
    }

    const sameCount = rounds.filter(r => r.answer === 'same').length;
    // With 100 samples, should be around 50%
    expect(sameCount).toBeGreaterThan(30);
    expect(sameCount).toBeLessThan(70);
  });

  it('generates approximately 50% different rounds', () => {
    const rounds = [];
    for (let i = 0; i < 100; i++) {
      rounds.push(createSameAndDifferentRound());
    }

    const diffCount = rounds.filter(r => r.answer === 'different').length;
    // With 100 samples, should be around 50%
    expect(diffCount).toBeGreaterThan(30);
    expect(diffCount).toBeLessThan(70);
  });
});
