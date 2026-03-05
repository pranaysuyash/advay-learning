/**
 * Shared constants for game logic and UI.
 * Centralizes magic numbers used across multiple game components.
 *
 * @example
 * ```ts
 * import {
 *   STREAK_MILESTONE_INTERVAL,
 *   STREAK_MILESTONE_DURATION_MS,
 *   DEFAULT_GAME_DURATION_MS,
 * } from '../games/constants';
 *
 * // Check for milestone
 * if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
 *   showMilestone();
 *   setTimeout(hideMilestone, STREAK_MILESTONE_DURATION_MS);
 * }
 * ```
 */

/**
 * Streak milestone settings.
 *
 * Streak milestones celebrate every N consecutive correct answers
 * with visual feedback (emoji pop, animation, sound).
 */

/**
 * Number of consecutive correct answers between milestone celebrations.
 * Default: every 5 correct answers shows a milestone.
 */
export const STREAK_MILESTONE_INTERVAL = 5;

/**
 * Duration in milliseconds to show the milestone celebration UI.
 * Default: 1.2 seconds
 */
export const STREAK_MILESTONE_DURATION_MS = 1200;

/**
 * Default game duration in milliseconds (5 minutes).
 * Used for timed games and session limits.
 */
export const DEFAULT_GAME_DURATION_MS = 5 * 60 * 1000;

/**
 * Standard difficulty levels.
 */
export const DifficultyLevel = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
} as const;

/**
 * Type alias for difficulty level.
 */
export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

/**
 * Animation durations in milliseconds for game UI feedback.
 */
export const AnimationDuration = {
  /** Quick feedback animations (button press, correct answer flash) */
  QUICK: 150,

  /** Standard transitions (panel slide, modal fade) */
  NORMAL: 300,

  /** Slow animations (tutorial highlights, item appearance) */
  SLOW: 500,

  /** Extended animations (celebration sequences, level transitions) */
  EXTENDED: 1000,
} as const;

/**
 * Common touch interaction constraints.
 */
export const TouchConstraints = {
  /** Maximum time (ms) for a tap to register (prevents accidental long-press) */
  MAX_TAP_DURATION_MS: 300,

  /** Maximum movement (px) for a tap to register (prevents drag misfires) */
  MAX_TAP_MOVEMENT_PX: 10,

  /** Minimum time (ms) between rapid taps (prevents accidental double-taps) */
  TAP_DEBOUNCE_MS: 200,
} as const;

/**
 * Score thresholds for star ratings.
 */
export const StarThresholds = {
  /** Minimum score for 1 star (40%) */
  ONE_STAR: 40,

  /** Minimum score for 2 stars (70%) */
  TWO_STARS: 70,

  /** Minimum score for 3 stars (90%) */
  THREE_STARS: 90,
} as const;

/**
 * Get star rating from percentage score.
 *
 * @param percentage - Score percentage (0-100)
 * @returns Number of stars (0-3)
 *
 * @example
 * ```ts
 * getStarRating(45);  // => 1
 * getStarRating(75);  // => 2
 * getStarRating(95);  // => 3
 * getStarRating(30);  // => 0
 * ```
 */
export function getStarRating(percentage: number): 0 | 1 | 2 | 3 {
  if (percentage >= StarThresholds.THREE_STARS) return 3;
  if (percentage >= StarThresholds.TWO_STARS) return 2;
  if (percentage >= StarThresholds.ONE_STAR) return 1;
  return 0;
}
