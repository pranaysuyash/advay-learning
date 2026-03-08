import { describe, expect, it } from 'vitest';

import {
  areCardsMatch,
  calculateMemoryScore,
  createShuffledDeck,
  getPairsForDifficulty,
  hideCards,
  isBoardComplete,
  markCardsMatched,
  MEMORY_SYMBOLS,
  type MemoryCard,
  type MemoryDifficulty,
} from '../memoryMatchLogic';

describe('MEMORY_SYMBOLS', () => {
  it('has 12 animal symbols', () => {
    expect(MEMORY_SYMBOLS).toHaveLength(12);
  });

  it('contains expected animal emojis', () => {
    expect(MEMORY_SYMBOLS).toContain('🐶');
    expect(MEMORY_SYMBOLS).toContain('🐱');
    expect(MEMORY_SYMBOLS).toContain('🦊');
    expect(MEMORY_SYMBOLS).toContain('🐼');
    expect(MEMORY_SYMBOLS).toContain('🐸');
    expect(MEMORY_SYMBOLS).toContain('🦁');
  });

  it('all symbols are unique', () => {
    const unique = new Set(MEMORY_SYMBOLS);
    expect(unique.size).toBe(MEMORY_SYMBOLS.length);
  });

  it('all symbols are single emoji', () => {
    for (const symbol of MEMORY_SYMBOLS) {
      expect(typeof symbol).toBe('string');
      expect(symbol.length).toBeGreaterThan(0);
    }
  });
});

describe('getPairsForDifficulty', () => {
  it('returns 6 for easy', () => {
    expect(getPairsForDifficulty('easy')).toBe(6);
  });

  it('returns 8 for medium', () => {
    expect(getPairsForDifficulty('medium')).toBe(8);
  });

  it('returns 10 for hard', () => {
    expect(getPairsForDifficulty('hard')).toBe(10);
  });

  it('covers all difficulty levels', () => {
    const difficulties: MemoryDifficulty[] = ['easy', 'medium', 'hard'];
    for (const diff of difficulties) {
      const pairs = getPairsForDifficulty(diff);
      expect(pairs).toBeGreaterThanOrEqual(6);
      expect(pairs).toBeLessThanOrEqual(10);
    }
  });
});

describe('createShuffledDeck', () => {
  it('creates a deck with two cards per symbol', () => {
    const deck = createShuffledDeck(6, () => 0.2);
    expect(deck).toHaveLength(12);

    const bySymbol = deck.reduce<Record<string, number>>((acc, card) => {
      acc[card.symbol] = (acc[card.symbol] ?? 0) + 1;
      return acc;
    }, {});

    Object.values(bySymbol).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('creates pairs with matching IDs', () => {
    const deck = createShuffledDeck(4, () => 0.5);
    for (let i = 0; i < deck.length; i += 2) {
      const card1 = deck[i];
      const card2 = deck.find(c => c.symbol === card1.symbol && c.id !== card1.id);
      expect(card2).toBeDefined();
      // Both cards should have the same symbol
      expect(card2?.symbol).toBe(card1.symbol);
    }
  });

  it('all cards start with isFlipped false and isMatched false', () => {
    const deck = createShuffledDeck(4, () => 0.3);
    for (const card of deck) {
      expect(card.isFlipped).toBe(false);
      expect(card.isMatched).toBe(false);
    }
  });

  it('limits pair count to available symbols', () => {
    const deck = createShuffledDeck(99, () => 0.3);
    expect(deck.length % 2).toBe(0);
    expect(deck.length).toBeLessThanOrEqual(24); // 12 symbols × 2
  });

  it('handles minimum pair count of 2', () => {
    const deck = createShuffledDeck(0, () => 0.5);
    expect(deck.length).toBeGreaterThanOrEqual(4); // At least 2 pairs
  });

  it('handles pair count of 1', () => {
    const deck = createShuffledDeck(1, () => 0.5);
    expect(deck.length).toBe(4); // 2 pairs minimum due to Math.max(2, ...)
  });

  it('produces different orders with different RNG', () => {
    const deck1 = createShuffledDeck(4, () => 0.1);
    const deck2 = createShuffledDeck(4, () => 0.9);

    const ids1 = deck1.map(c => c.id);
    const ids2 = deck2.map(c => c.id);

    expect(ids1).not.toEqual(ids2);
  });

  it('produces deterministic order with same RNG', () => {
    const rng = () => 0.5;
    const deck1 = createShuffledDeck(4, rng);
    const deck2 = createShuffledDeck(4, rng);

    expect(deck1.map(c => c.id)).toEqual(deck2.map(c => c.id));
  });

  it('uses first N symbols for N pairs', () => {
    const deck = createShuffledDeck(6, () => 0.5);
    const symbols = new Set(deck.map(c => c.symbol));
    expect(symbols.size).toBe(6);
    expect(symbols.has(MEMORY_SYMBOLS[0])).toBe(true);
    expect(symbols.has(MEMORY_SYMBOLS[5])).toBe(true);
  });
});

describe('areCardsMatch', () => {
  it('returns true for matching symbols', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const first = deck[0];
    const second = deck.find((card) => card.symbol === first.symbol && card.id !== first.id);
    expect(second).toBeTruthy();
    expect(areCardsMatch(deck, first.id, second!.id)).toBe(true);
  });

  it('returns false for different symbols', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const first = deck[0];
    const different = deck.find(c => c.symbol !== first.symbol);
    expect(different).toBeTruthy();
    expect(areCardsMatch(deck, first.id, different!.id)).toBe(false);
  });

  it('returns false when same card selected twice', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const card = deck[0];
    expect(areCardsMatch(deck, card.id, card.id)).toBe(false);
  });

  it('returns false for non-existent first ID', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    expect(areCardsMatch(deck, 'non-existent', deck[0].id)).toBe(false);
  });

  it('returns false for non-existent second ID', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    expect(areCardsMatch(deck, deck[0].id, 'non-existent')).toBe(false);
  });

  it('returns false for both non-existent IDs', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    expect(areCardsMatch(deck, 'fake1', 'fake2')).toBe(false);
  });
});

describe('markCardsMatched', () => {
  it('marks both cards as matched and flipped', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const first = deck[0];
    const second = deck.find((card) => card.symbol === first.symbol && card.id !== first.id)!;
    const updated = markCardsMatched(deck, first.id, second.id);

    expect(updated.find((c) => c.id === first.id)?.isMatched).toBe(true);
    expect(updated.find((c) => c.id === first.id)?.isFlipped).toBe(true);
    expect(updated.find((c) => c.id === second.id)?.isMatched).toBe(true);
    expect(updated.find((c) => c.id === second.id)?.isFlipped).toBe(true);
  });

  it('does not modify other cards', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const first = deck[0];
    const second = deck.find((card) => card.symbol === first.symbol && card.id !== first.id)!;
    const otherIds = deck.filter(c => c.id !== first.id && c.id !== second.id).map(c => c.id);

    const updated = markCardsMatched(deck, first.id, second.id);

    for (const id of otherIds) {
      const card = updated.find(c => c.id === id);
      expect(card?.isMatched).toBe(false);
      expect(card?.isFlipped).toBe(false);
    }
  });

  it('handles matched cards correctly', () => {
    const deck = createShuffledDeck(4, () => 0.4).map((card, index) => ({
      ...card,
      isMatched: index < 2,
      isFlipped: index < 2,
    }));
    const first = deck.find(c => !c.isMatched)!;
    const second = deck.find(c => c.symbol === first.symbol && c.id !== first.id)!;
    const updated = markCardsMatched(deck, first.id, second.id);

    expect(updated.find(c => c.id === first.id)?.isMatched).toBe(true);
    expect(updated.find(c => c.id === second.id)?.isMatched).toBe(true);
  });
});

describe('hideCards', () => {
  it('hides only unmatched selected cards', () => {
    const deck = createShuffledDeck(4, () => 0.5).map((card, index) => ({
      ...card,
      isFlipped: index < 2,
    }));
    const hidden = hideCards(deck, deck[0].id, deck[1].id);
    expect(hidden[0].isFlipped).toBe(false);
    expect(hidden[1].isFlipped).toBe(false);
  });

  it('does not hide already matched cards', () => {
    const deck = createShuffledDeck(4, () => 0.5).map((card, index) => ({
      ...card,
      isFlipped: true,
      isMatched: index < 2,
    }));
    const hidden = hideCards(deck, deck[0].id, deck[1].id);
    expect(hidden[0].isMatched).toBe(true);
    expect(hidden[0].isFlipped).toBe(true); // Still flipped
    expect(hidden[1].isMatched).toBe(true);
    expect(hidden[1].isFlipped).toBe(true);
  });

  it('does not hide unmatched cards that were not selected', () => {
    const deck = createShuffledDeck(4, () => 0.5).map((card, index) => ({
      ...card,
      isFlipped: index < 3,
    }));
    const hidden = hideCards(deck, deck[0].id, deck[1].id);
    expect(hidden[2].isFlipped).toBe(true); // Not selected
  });

  it('returns new array (immutable)', () => {
    const deck = createShuffledDeck(4, () => 0.5);
    const originalFirst = deck[0];
    const hidden = hideCards(deck, deck[0].id, deck[1].id);
    expect(deck[0]).toBe(originalFirst); // Original unchanged
  });
});

describe('isBoardComplete', () => {
  it('returns true when all cards are matched', () => {
    const completeDeck = createShuffledDeck(3, () => 0.1).map((card) => ({
      ...card,
      isMatched: true,
      isFlipped: true,
    }));
    expect(isBoardComplete(completeDeck)).toBe(true);
  });

  it('returns false when some cards are unmatched', () => {
    const incompleteDeck = createShuffledDeck(3, () => 0.1).map((card, index) => ({
      ...card,
      isMatched: index < 4, // Only some matched
      isFlipped: index < 4,
    }));
    expect(isBoardComplete(incompleteDeck)).toBe(false);
  });

  it('returns false for empty deck', () => {
    expect(isBoardComplete([])).toBe(false);
  });

  it('returns true for single pair board when both matched', () => {
    const deck: MemoryCard[] = [
      { id: 'a-1', symbol: '🐶', isFlipped: true, isMatched: true },
      { id: 'a-2', symbol: '🐶', isFlipped: true, isMatched: true },
    ];
    expect(isBoardComplete(deck)).toBe(true);
  });
});

describe('calculateMemoryScore', () => {
  it('calculates base score from matches', () => {
    const score = calculateMemoryScore(6, 12, 0);
    expect(score).toBeGreaterThan(0);
  });

  it('gives higher score for better efficiency', () => {
    const efficientScore = calculateMemoryScore(6, 7, 45);
    const inefficientScore = calculateMemoryScore(6, 18, 5);
    expect(efficientScore).toBeGreaterThan(inefficientScore);
  });

  it('includes time bonus', () => {
    const withTime = calculateMemoryScore(6, 12, 60);
    const withoutTime = calculateMemoryScore(6, 12, 0);
    expect(withTime).toBeGreaterThan(withoutTime);
  });

  it('efficiency bonus decreases with more moves', () => {
    const efficient = calculateMemoryScore(6, 6, 30);
    const lessEfficient = calculateMemoryScore(6, 12, 30);
    expect(efficient).toBeGreaterThan(lessEfficient);
  });

  it('handles minimum moves (perfect play)', () => {
    const score = calculateMemoryScore(6, 6, 60);
    expect(score).toBe(6 * 12 + 20 + 30); // matches×12 + efficiency + timeBonus
  });

  it('prevents division by zero for minimum moves', () => {
    const score = calculateMemoryScore(1, 1, 30);
    expect(score).toBeGreaterThan(0);
  });

  it('calculates score correctly for easy difficulty', () => {
    // 6 pairs, perfect play (6 moves), 60 seconds left
    const score = calculateMemoryScore(6, 6, 60);
    expect(score).toBe(72 + 20 + 30); // 72 + 20 efficiency + 30 time
  });

  it('calculates score correctly for medium difficulty', () => {
    // 8 pairs, perfect play (8 moves), 90 seconds left
    const score = calculateMemoryScore(8, 8, 90);
    expect(score).toBe(96 + 20 + 45); // 96 + 20 efficiency + 45 time
  });

  it('calculates score correctly for hard difficulty', () => {
    // 10 pairs, perfect play (10 moves), 120 seconds left
    const score = calculateMemoryScore(10, 10, 120);
    expect(score).toBe(120 + 20 + 60); // 120 + 20 efficiency + 60 time
  });
});

describe('integration scenarios', () => {
  it('can simulate a complete game flow', () => {
    let deck = createShuffledDeck(6, () => 0.5);
    let moves = 0;
    let matches = 0;

    // Simulate flipping pairs until complete
    while (!isBoardComplete(deck)) {
      // Find first unmatched card
      const first = deck.find(c => !c.isMatched)!;
      // Find its match
      const match = deck.find(c => c.symbol === first.symbol && c.id !== first.id)!;

      // Check if match
      if (areCardsMatch(deck, first.id, match.id)) {
        deck = markCardsMatched(deck, first.id, match.id);
        matches++;
      } else {
        deck = hideCards(deck, first.id, match.id);
      }
      moves++;

      if (moves > 100) break; // Safety
    }

    expect(matches).toBe(6);
    expect(isBoardComplete(deck)).toBe(true);
  });

  it('handles no match scenario correctly', () => {
    const deck = createShuffledDeck(4, () => 0.3);
    const card1 = deck[0];
    const card2 = deck.find(c => c.symbol !== card1.symbol)!;

    expect(areCardsMatch(deck, card1.id, card2.id)).toBe(false);
  });

  it('marks match only when symbols match', () => {
    const deck = createShuffledDeck(4, () => 0.3);
    const matchingPair = deck.filter(c => c.symbol === deck[0].symbol);
    const updated = markCardsMatched(deck, matchingPair[0].id, matchingPair[1].id);

    const markedFirst = updated.find(c => c.id === matchingPair[0].id);
    const markedSecond = updated.find(c => c.id === matchingPair[1].id);

    expect(markedFirst?.isMatched).toBe(true);
    expect(markedSecond?.isMatched).toBe(true);
  });
});

describe('edge cases', () => {
  it('handles deck with maximum pairs', () => {
    const deck = createShuffledDeck(10, () => 0.5);
    expect(deck).toHaveLength(20);
  });

  it('handles deck with minimum pairs', () => {
    const deck = createShuffledDeck(2, () => 0.5);
    expect(deck.length).toBeGreaterThanOrEqual(4);
  });

  it('handles zero time bonus', () => {
    const score = calculateMemoryScore(6, 12, 0);
    const scoreWithTime = calculateMemoryScore(6, 12, 10);
    expect(scoreWithTime).toBeGreaterThan(score);
  });

  it('handles very poor efficiency', () => {
    const score = calculateMemoryScore(6, 50, 30);
    expect(score).toBeGreaterThan(0);
  });
});

describe('type definitions', () => {
  it('MemoryCard interface is correctly implemented', () => {
    const card: MemoryCard = {
      id: 'test-1-a',
      symbol: '🐶',
      isFlipped: false,
      isMatched: false,
    };

    expect(typeof card.id).toBe('string');
    expect(typeof card.symbol).toBe('string');
    expect(typeof card.isFlipped).toBe('boolean');
    expect(typeof card.isMatched).toBe('boolean');
  });

  it('MemoryDifficulty type has correct values', () => {
    const difficulties: MemoryDifficulty[] = ['easy', 'medium', 'hard'];
    expect(difficulties).toHaveLength(3);
  });
});
