export interface SizeSortItem {
  id: string;
  label: string;
  emoji: string;
  sizeRank: number;
}

export interface SizeSortingRound {
  instruction: 'small-to-big' | 'big-to-small';
  items: SizeSortItem[];
}

export interface SizeSortingPickResult {
  ok: boolean;
  completed: boolean;
  nextExpectedRank: number | null;
}

const ITEM_SETS: SizeSortItem[][] = [
  [
    { id: 'mouse', label: 'Mouse', emoji: '🐭', sizeRank: 1 },
    { id: 'cat', label: 'Cat', emoji: '🐱', sizeRank: 2 },
    { id: 'elephant', label: 'Elephant', emoji: '🐘', sizeRank: 3 },
  ],
  [
    { id: 'seed', label: 'Seed', emoji: '🌱', sizeRank: 1 },
    { id: 'tree', label: 'Tree', emoji: '🌳', sizeRank: 2 },
    { id: 'mountain', label: 'Mountain', emoji: '⛰️', sizeRank: 3 },
  ],
  [
    { id: 'cup', label: 'Cup', emoji: '🥤', sizeRank: 1 },
    { id: 'bucket', label: 'Bucket', emoji: '🪣', sizeRank: 2 },
    { id: 'pool', label: 'Pool', emoji: '🏊', sizeRank: 3 },
  ],
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createSizeSortingRound(rng: () => number = Math.random): SizeSortingRound {
  const baseSet = ITEM_SETS[Math.floor(rng() * ITEM_SETS.length)];
  const instruction: SizeSortingRound['instruction'] = rng() > 0.5 ? 'small-to-big' : 'big-to-small';
  return {
    instruction,
    items: shuffle(baseSet, rng),
  };
}

export function evaluateSizeSortingPick(
  round: SizeSortingRound,
  alreadyPickedIds: string[],
  pickedId: string,
): SizeSortingPickResult {
  if (alreadyPickedIds.includes(pickedId)) {
    return { ok: false, completed: false, nextExpectedRank: null };
  }

  const targetRanks = [...round.items]
    .map((item) => item.sizeRank)
    .sort((a, b) =>
      round.instruction === 'small-to-big' ? a - b : b - a,
    );
  const nextExpectedRank = targetRanks[alreadyPickedIds.length] ?? null;
  const picked = round.items.find((item) => item.id === pickedId);

  if (!picked || nextExpectedRank === null || picked.sizeRank !== nextExpectedRank) {
    return { ok: false, completed: false, nextExpectedRank };
  }

  const completed = alreadyPickedIds.length + 1 === round.items.length;
  const followUpExpected = completed ? null : targetRanks[alreadyPickedIds.length + 1];

  return {
    ok: true,
    completed,
    nextExpectedRank: followUpExpected,
  };
}

// Difficulty multipliers (big-to-small is harder for kids)
const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  'small-to-big': 1,
  'big-to-small': 1.5,
};

/**
 * Calculate score based on streak and instruction type
 * Base: 15 points + streak bonus (max 15) = 30 max base
 * Multiplied by difficulty (small-to-big: 1×, big-to-small: 1.5×)
 * Max per round: 45 points (big-to-small, streak 5+)
 */
export function calculateScore(
  streak: number,
  instruction: 'small-to-big' | 'big-to-small'
): number {
  const baseScore = 15;
  const streakBonus = Math.min(streak * 3, 15);
  const multiplier = DIFFICULTY_MULTIPLIERS[instruction] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
