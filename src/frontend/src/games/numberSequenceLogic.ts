import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';

export interface NumberSequenceLevel {
  level: number;
  minStart: number;
  maxStart: number;
  step: number;
  length: number;
}

export interface NumberSequenceRound {
  sequence: number[];
  missingIndex: number;
  answer: number;
  options: number[];
}

export const NUMBER_SEQUENCE_LEVELS: NumberSequenceLevel[] = [
  { level: 1, minStart: 1, maxStart: 8, step: 1, length: 5 },
  { level: 2, minStart: 2, maxStart: 16, step: 2, length: 5 },
  { level: 3, minStart: 5, maxStart: 30, step: 5, length: 5 },
];

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function createNumberSequenceRound(
  level: number,
  rng: () => number = Math.random,
): NumberSequenceRound {
  const cfg = NUMBER_SEQUENCE_LEVELS.find((entry) => entry.level === level) ?? NUMBER_SEQUENCE_LEVELS[0];
  const startRange = cfg.maxStart - cfg.minStart + 1;
  const start = cfg.minStart + Math.floor(rng() * startRange);
  const sequence = Array.from({ length: cfg.length }, (_, i) => start + i * cfg.step);

  // Keep first and last visible to make the pattern legible for younger kids.
  const missingIndex = 1 + Math.floor(rng() * (sequence.length - 2));
  const answer = sequence[missingIndex];

  const distractors = [answer - cfg.step, answer + cfg.step, answer + cfg.step * 2].filter((n) => n > 0);
  const options = shuffle(Array.from(new Set([answer, ...distractors])), rng).slice(0, 4);

  return {
    sequence,
    missingIndex,
    answer,
    options,
  };
}

// Difficulty multipliers (preserved for backward compatibility)
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // Step 1, simple sequence
  2: 1.5,  // Step 2, counting by 2s
  3: 2,    // Step 5, counting by 5s
};

/**
 * Calculate score based on streak and level
 * Base: 10 points + streak bonus (max 15) = 25 max base
 * Multiplied by difficulty (level 1: 1×, level 2: 1.5×, level 3: 2×)
 * Max per answer: 50 points (level 3, streak 5+)
 *
 * @deprecated Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.standard` directly
 */
export const calculateScore = (streak: number, level: number): number =>
  _calculateScore(streak, level, ScorePresets.standard);
