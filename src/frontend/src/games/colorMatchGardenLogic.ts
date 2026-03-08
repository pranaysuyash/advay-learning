/**
 * Color Match Garden Game Logic
 *
 * Logic for building flower targets, checking matches,
 * and calculating scores in the Color Match Garden game.
 */

import type { Point } from '../types/tracking';

/**
 * A flower target displayed in the garden
 */
export interface GardenTarget {
  id: number;
  name: string;
  color: string;
  emoji: string;
  assetId: string;
  position: Point;
}

/**
 * Result of building a new round
 */
export interface RoundResult {
  targets: GardenTarget[];
  promptId: number;
}

/**
 * Available flower types in the garden
 */
export const FLOWERS: Array<{
  name: string;
  color: string;
  emoji: string;
  assetId: string;
}> = [
  { name: 'Red', color: '#ef4444', emoji: '🌺', assetId: 'brush-red' },
  { name: 'Blue', color: '#3b82f6', emoji: '🪻', assetId: 'brush-blue' },
  { name: 'Green', color: '#22c55e', emoji: '🌿', assetId: 'brush-green' },
  { name: 'Yellow', color: '#eab308', emoji: '🌻', assetId: 'brush-yellow' },
  { name: 'Pink', color: '#ec4899', emoji: '🌸', assetId: 'brush-red' },
  { name: 'Purple', color: '#8b5cf6', emoji: '🌷', assetId: 'brush-blue' },
];

/**
 * Game configuration constants
 */
export const GAME_CONFIG = {
  /** Hit radius for detecting pinch on target (normalized 0-1) */
  TARGET_RADIUS: 0.1,
  /** Total game time in seconds */
  GAME_DURATION_SECONDS: 60,
  /** Base points awarded per correct match */
  BASE_POINTS_PER_MATCH: 12,
  /** Maximum streak bonus per match */
  MAX_STREAK_BONUS: 18,
  /** Streak bonus multiplier per streak level */
  STREAK_BONUS_MULTIPLIER: 2,
  /** Streak milestone for celebration (every N correct matches) */
  STREAK_MILESTONE: 6,
} as const;

/**
 * Distance between two points
 */
function distanceBetweenPoints(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a point is within the hit radius of a target
 */
export function isPointInTarget(
  point: Point,
  target: GardenTarget,
  radius: number = GAME_CONFIG.TARGET_RADIUS,
): boolean {
  return distanceBetweenPoints(point, target.position) <= radius;
}

/**
 * Check if the selected target matches the expected (prompt) target
 */
export function isCorrectMatch(
  selectedTarget: GardenTarget,
  expectedTarget: GardenTarget,
): boolean {
  return selectedTarget.id === expectedTarget.id;
}

/**
 * Calculate score for a correct match based on streak
 *
 * @param streak - Current streak count
 * @returns Points earned for this match
 *
 * @example
 * calculateScore(0)  // 12 (base only)
 * calculateScore(3)  // 18 (12 + 3*2)
 * calculateScore(9)  // 30 (12 + 18 max bonus)
 */
export function calculateScore(streak: number): number {
  const basePoints = GAME_CONFIG.BASE_POINTS_PER_MATCH;
  // Use Math.max(0, streak) to ensure negative streak doesn't reduce score
  const effectiveStreak = Math.max(0, streak);
  const streakBonus = Math.min(
    GAME_CONFIG.MAX_STREAK_BONUS,
    effectiveStreak * GAME_CONFIG.STREAK_BONUS_MULTIPLIER,
  );
  return basePoints + streakBonus;
}

/**
 * Check if a streak milestone should trigger celebration
 *
 * @param streak - Current streak count
 * @returns true if celebration should trigger
 */
export function isStreakMilestone(streak: number): boolean {
  return streak > 0 && streak % GAME_CONFIG.STREAK_MILESTONE === 0;
}

/**
 * Generate spaced points for target positioning
 *
 * @param count - Number of points to generate
 * @param minDistance - Minimum distance between points
 * @param margin - Margin from edges
 * @param random - Random number generator (0-1)
 * @returns Array of positioned targets with IDs
 */
export function pickSpacedPoints(
  count: number,
  minDistance: number,
  margin: number,
  random: () => number,
): Array<{ id: number; position: Point }> {
  if (count <= 0) return [];

  const targets: Array<{ id: number; position: Point }> = [];
  const maxAttempts = 300;

  function clamp01(value: number): number {
    return Math.min(1, Math.max(0, value));
  }

  function pickRandomPoint(randomA: number, randomB: number, pointMargin: number): Point {
    const clampedMargin = Math.min(0.45, Math.max(0.05, pointMargin));
    const span = 1 - clampedMargin * 2;
    return {
      x: clampedMargin + clamp01(randomA) * span,
      y: clampedMargin + clamp01(randomB) * span,
    };
  }

  for (let id = 0; id < count; id++) {
    let accepted: Point | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = pickRandomPoint(random(), random(), margin);
      const isFarEnough = targets.every(
        (target) => distanceBetweenPoints(target.position, candidate) >= minDistance,
      );

      if (isFarEnough) {
        accepted = candidate;
        break;
      }
    }

    // Fallback: place anyway to avoid deadlocks at high densities
    if (!accepted) {
      accepted = pickRandomPoint(random(), random(), margin);
    }

    targets.push({ id, position: accepted });
  }

  return targets;
}

/**
 * Build a new round with random flower targets
 *
 * @param random - Optional random number generator (defaults to Math.random)
 * @returns Round targets and the index of the target to find
 *
 * @example
 * const round = buildRoundTargets(() => 0.5); // Deterministic for testing
 * // round.targets has 3 flowers
 * // round.promptId is which flower the child should find
 */
export function buildRoundTargets(
  random: () => number = Math.random,
): RoundResult {
  // Shuffle flowers using Fisher-Yates
  const shuffled = [...FLOWERS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Pick 3 flowers
  const picked = shuffled.slice(0, 3).map((flower, index) => ({
    ...flower,
    id: index,
  }));

  // Generate spaced positions
  const points = pickSpacedPoints(3, 0.25, 0.15, random);

  const targets: GardenTarget[] = picked.map((flower, index) => ({
    ...flower,
    position: points[index]?.position ?? { x: 0.5, y: 0.5 },
  }));

  const promptId = Math.floor(random() * targets.length);

  return { targets, promptId };
}

/**
 * Get the target flower the child should find
 */
export function getPromptTarget(
  targets: GardenTarget[],
  promptId: number,
): GardenTarget | undefined {
  return targets[promptId];
}

/**
 * Get feedback message for a match result
 */
export function getMatchFeedback(
  hitTarget: GardenTarget,
  expectedTarget: GardenTarget,
  isCorrect: boolean,
): string {
  if (isCorrect) {
    return `Yes! ${expectedTarget.name} flower collected.`;
  }
  return `That was ${hitTarget.name}. Find ${expectedTarget.name}.`;
}

/**
 * Get all flowers with a specific name (useful for finding duplicates)
 */
export function getFlowersByName(name: string): typeof FLOWERS {
  return FLOWERS.filter((f) => f.name === name);
}

/**
 * Get flower by asset ID
 */
export function getFlowerByAssetId(assetId: string): (typeof FLOWERS)[number] | undefined {
  return FLOWERS.find((f) => f.assetId === assetId);
}
