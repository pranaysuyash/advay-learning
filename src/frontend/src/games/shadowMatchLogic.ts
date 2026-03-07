export interface ShadowMatchPair {
  id: string;
  objectName: string;
  objectEmoji: string;
}

export interface ShadowMatchRound {
  target: ShadowMatchPair;
  options: ShadowMatchPair[];
}

const SHADOW_PAIRS: ShadowMatchPair[] = [
  { id: 'cat', objectName: 'Cat', objectEmoji: '🐱' },
  { id: 'car', objectName: 'Car', objectEmoji: '🚗' },
  { id: 'tree', objectName: 'Tree', objectEmoji: '🌳' },
  { id: 'house', objectName: 'House', objectEmoji: '🏠' },
  { id: 'fish', objectName: 'Fish', objectEmoji: '🐟' },
  { id: 'star', objectName: 'Star', objectEmoji: '⭐' },
  { id: 'ball', objectName: 'Ball', objectEmoji: '⚽' },
  { id: 'boat', objectName: 'Boat', objectEmoji: '⛵' },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createShadowMatchRound(
  usedTargetIds: string[] = [],
  rng: () => number = Math.random,
): ShadowMatchRound {
  const unused = SHADOW_PAIRS.filter((entry) => !usedTargetIds.includes(entry.id));
  const source = unused.length > 0 ? unused : SHADOW_PAIRS;
  const target = source[Math.floor(rng() * source.length)];

  const distractors = shuffle(
    SHADOW_PAIRS.filter((entry) => entry.id !== target.id),
    rng,
  ).slice(0, 2);

  return {
    target,
    options: shuffle([target, ...distractors], rng),
  };
}

export function isShadowMatchCorrect(
  round: ShadowMatchRound,
  selectedId: string,
): boolean {
  return round.target.id === selectedId;
}
