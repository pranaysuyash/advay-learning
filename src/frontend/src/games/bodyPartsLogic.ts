/**
 * Body Parts game logic — point to named body part.
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';
import { shuffle } from '../utils/random';

export interface BodyPart {
  name: string;
  emoji: string;
}

export interface LevelConfig {
  level: number;
  partCount: number;
}

const BODY_PARTS: BodyPart[] = [
  { name: 'Head', emoji: '🗣️' },
  { name: 'Eyes', emoji: '👀' },
  { name: 'Nose', emoji: '👃' },
  { name: 'Mouth', emoji: '👄' },
  { name: 'Ears', emoji: '👂' },
  { name: 'Hands', emoji: '👐' },
  { name: 'Fingers', emoji: '🫵' },
  { name: 'Feet', emoji: '🦶' },
  { name: 'Arms', emoji: '💪' },
  { name: 'Legs', emoji: '🦵' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, partCount: 4 },
  { level: 2, partCount: 6 },
  { level: 3, partCount: 8 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function getPartsForLevel(level: number): BodyPart[] {
  const config = getLevelConfig(level);
  const shuffled = shuffle(BODY_PARTS);
  return shuffled.slice(0, config.partCount);
}

// Difficulty multipliers for scoring (preserved for backward compatibility)
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
};

/**
 * Calculate score based on streak and level
 * Base: 15 points + streak bonus (max 15) = 30 max base
 * Multiplied by difficulty (level 1: 1×, level 2: 1.5×, level 3: 2×)
 * Max per answer: 60 points (level 3, streak 5+)
 *
 * @deprecated Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.high` directly
 */
export const calculateScore = (streak: number, level: number): number =>
  _calculateScore(streak, level, ScorePresets.high);
