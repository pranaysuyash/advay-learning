// Keep in sync with FingerNumberShow DIFFICULTY_LEVELS order.
export function getMaxHandsForDifficultyIndex(difficultyIndex: number): number {
  // "Duo Mode" (kid + parent(s)) supports up to 4 hands.
  if (difficultyIndex === 3) return 4;
  // Default to 2 hands for better stability/latency.
  return 2;
}

