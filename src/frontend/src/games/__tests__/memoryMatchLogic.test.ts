import { describe, expect, it } from 'vitest';

import {
  areCardsMatch,
  calculateMemoryScore,
  createShuffledDeck,
  getPairsForDifficulty,
  hideCards,
  isBoardComplete,
  markCardsMatched,
} from '../memoryMatchLogic';

describe('getPairsForDifficulty', () => {
  it('returns pair counts by difficulty', () => {
    expect(getPairsForDifficulty('easy')).toBe(6);
    expect(getPairsForDifficulty('medium')).toBe(8);
    expect(getPairsForDifficulty('hard')).toBe(10);
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

  it('limits pair count to available symbols', () => {
    const deck = createShuffledDeck(99, () => 0.3);
    expect(deck.length % 2).toBe(0);
    expect(deck.length).toBeLessThanOrEqual(24);
  });
});

describe('match helpers', () => {
  it('detects matching pair by card ids', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const first = deck[0];
    const second = deck.find((card) => card.symbol === first.symbol && card.id !== first.id);
    expect(second).toBeTruthy();
    expect(areCardsMatch(deck, first.id, second!.id)).toBe(true);
  });

  it('marks matched cards as matched and flipped', () => {
    const deck = createShuffledDeck(4, () => 0.4);
    const first = deck[0];
    const second = deck.find((card) => card.symbol === first.symbol && card.id !== first.id)!;
    const updated = markCardsMatched(deck, first.id, second.id);
    expect(updated.find((c) => c.id === first.id)?.isMatched).toBe(true);
    expect(updated.find((c) => c.id === first.id)?.isFlipped).toBe(true);
    expect(updated.find((c) => c.id === second.id)?.isMatched).toBe(true);
  });

  it('hides only unmatched selected cards', () => {
    const deck = createShuffledDeck(4, () => 0.5).map((card, index) => ({
      ...card,
      isFlipped: index < 2,
    }));
    const hidden = hideCards(deck, deck[0].id, deck[1].id);
    expect(hidden[0].isFlipped).toBe(false);
    expect(hidden[1].isFlipped).toBe(false);
  });
});

describe('completion and score', () => {
  it('returns true when all cards are matched', () => {
    const completeDeck = createShuffledDeck(3, () => 0.1).map((card) => ({
      ...card,
      isMatched: true,
      isFlipped: true,
    }));
    expect(isBoardComplete(completeDeck)).toBe(true);
  });

  it('calculates higher score for better efficiency and time left', () => {
    const efficientScore = calculateMemoryScore(6, 7, 45);
    const inefficientScore = calculateMemoryScore(6, 18, 5);
    expect(efficientScore).toBeGreaterThan(inefficientScore);
  });
});
