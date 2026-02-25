export type MemoryDifficulty = 'easy' | 'medium' | 'hard';

export interface MemoryCard {
  id: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MEMORY_SYMBOLS = [
  '🐶',
  '🐱',
  '🦊',
  '🐼',
  '🐸',
  '🦁',
  '🐵',
  '🐧',
  '🐢',
  '🐰',
  '🦋',
  '🐙',
] as const;

export function getPairsForDifficulty(difficulty: MemoryDifficulty): number {
  if (difficulty === 'easy') return 6;
  if (difficulty === 'medium') return 8;
  return 10;
}

export function createShuffledDeck(
  pairCount: number,
  random: () => number = Math.random,
): MemoryCard[] {
  const safePairCount = Math.max(2, Math.min(pairCount, MEMORY_SYMBOLS.length));
  const selectedSymbols = MEMORY_SYMBOLS.slice(0, safePairCount);

  const deck = selectedSymbols.flatMap((symbol, index) => [
    {
      id: `${symbol}-${index}-a`,
      symbol,
      isFlipped: false,
      isMatched: false,
    },
    {
      id: `${symbol}-${index}-b`,
      symbol,
      isFlipped: false,
      isMatched: false,
    },
  ]);

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  return deck;
}

export function areCardsMatch(
  deck: MemoryCard[],
  firstId: string,
  secondId: string,
): boolean {
  if (firstId === secondId) return false;
  const first = deck.find((card) => card.id === firstId);
  const second = deck.find((card) => card.id === secondId);
  if (!first || !second) return false;
  return first.symbol === second.symbol;
}

export function markCardsMatched(
  deck: MemoryCard[],
  firstId: string,
  secondId: string,
): MemoryCard[] {
  return deck.map((card) => {
    if (card.id !== firstId && card.id !== secondId) return card;
    return {
      ...card,
      isFlipped: true,
      isMatched: true,
    };
  });
}

export function hideCards(
  deck: MemoryCard[],
  firstId: string,
  secondId: string,
): MemoryCard[] {
  return deck.map((card) => {
    if (card.id !== firstId && card.id !== secondId) return card;
    if (card.isMatched) return card;
    return {
      ...card,
      isFlipped: false,
    };
  });
}

export function isBoardComplete(deck: MemoryCard[]): boolean {
  return deck.length > 0 && deck.every((card) => card.isMatched);
}

export function calculateMemoryScore(matches: number, moves: number, secondsLeft: number): number {
  const safeMoves = Math.max(moves, 1);
  const efficiency = Math.round((matches * 20) / safeMoves);
  const timeBonus = Math.max(0, Math.floor(secondsLeft / 2));
  return matches * 12 + efficiency + timeBonus;
}
