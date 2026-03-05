/**
 * Shared scoring utilities for games.
 * Provides consistent scoring calculation across all game types.
 *
 * @example
 * ```ts
 * import { calculateScore, ScorePresets } from './utils/scoring';
 *
 * // Standard game (10 base points)
 * const points = calculateScore(3, 2, ScorePresets.standard);
 * // => (10 + 9) × 1.5 = 28
 *
 * // High-value game (15 base points)
 * const points = calculateScore(5, 3, ScorePresets.high);
 * // => (15 + 15) × 2 = 60
 * ```
 */

/**
 * Difficulty multipliers for scoring.
 * - Level 1: 1× (base/easy)
 * - Level 2: 1.5× (intermediate)
 * - Level 3: 2× (advanced/hard)
 */
export const DIFFICULTY_MULTIPLIERS: Readonly<Record<number, number>> = {
  1: 1,
  2: 1.5,
  3: 2,
} as const;

/**
 * Default scoring configuration.
 */
export interface ScoreConfig {
  /** Base points awarded per correct answer */
  baseScore: number;
  /** Points added per streak step (default: 3) */
  streakMultiplier?: number;
  /** Maximum streak bonus cap (default: 15) */
  maxStreakBonus?: number;
}

/**
 * Calculate score based on streak and difficulty level.
 *
 * Formula: `(baseScore + min(streak × streakMultiplier, maxStreakBonus)) × difficultyMultiplier`
 *
 * @param streak - Current answer streak count
 * @param level - Difficulty level (1-3)
 * @param config - Scoring configuration (defaults to baseScore=10)
 * @returns Calculated score as integer
 *
 * @example
 * ```ts
 * // Default game (10 base points)
 * calculateScore(3, 2); // => 28
 *
 * // Custom base score
 * calculateScore(5, 3, { baseScore: 15 }); // => 60
 *
 * // Full custom config
 * calculateScore(4, 2, { baseScore: 20, streakMultiplier: 5, maxStreakBonus: 25 });
 * ```
 */
export function calculateScore(
  streak: number,
  level: number,
  config: ScoreConfig = { baseScore: 10 },
): number {
  const streakMultiplier = config.streakMultiplier ?? 3;
  const maxStreakBonus = config.maxStreakBonus ?? 15;
  const streakBonus = Math.min(streak * streakMultiplier, maxStreakBonus);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((config.baseScore + streakBonus) * multiplier);
}

/**
 * Create a score calculator function with predefined configuration.
 * Useful for games that need a consistent scorer with specific settings.
 *
 * @param config - Scoring configuration to bake into the calculator
 * @returns A function that calculates scores using the provided config
 *
 * @example
 * ```ts
 * // In animalSoundsLogic.ts
 * export const calculateScore = createScoreCalculator({ baseScore: 15 });
 *
 * // Usage in game
 * const points = calculateScore(streak, level);
 * ```
 */
export function createScoreCalculator(config: ScoreConfig) {
  return (streak: number, level: number) => calculateScore(streak, level, config);
}

/**
 * Score presets for common game types.
 */
export const ScorePresets = {
  /** Standard games (10 base points) - counting, matching, etc. */
  standard: { baseScore: 10 } as const,

  /** High-engagement games (15 base points) - sounds, identification, etc. */
  high: { baseScore: 15 } as const,

  /** Premium games (20 base points) - complex cognitive tasks */
  premium: { baseScore: 20 } as const,
} as const;
