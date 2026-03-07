export interface SameDifferentItem {
  id: string;
  label: string;
  emoji: string;
}

export interface SameAndDifferentRound {
  left: SameDifferentItem;
  right: SameDifferentItem;
  answer: 'same' | 'different';
}

const ITEM_BANK: SameDifferentItem[] = [
  { id: 'cat', label: 'Cat', emoji: 'cat' },
  { id: 'dog', label: 'Dog', emoji: 'dog' },
  { id: 'ball', label: 'Ball', emoji: 'ball' },
  { id: 'car', label: 'Car', emoji: 'car' },
  { id: 'tree', label: 'Tree', emoji: 'tree' },
  { id: 'fish', label: 'Fish', emoji: 'fish' },
];

export function createSameAndDifferentRound(
  rng: () => number = Math.random,
): SameAndDifferentRound {
  const sameRound = rng() > 0.5;
  const left = ITEM_BANK[Math.floor(rng() * ITEM_BANK.length)];

  if (sameRound) {
    return { left, right: left, answer: 'same' };
  }

  const alternatives = ITEM_BANK.filter((entry) => entry.id !== left.id);
  const right = alternatives[Math.floor(rng() * alternatives.length)];
  return { left, right, answer: 'different' };
}

export function isSameAndDifferentCorrect(
  round: SameAndDifferentRound,
  selectedAnswer: 'same' | 'different',
): boolean {
  return round.answer === selectedAnswer;
}
