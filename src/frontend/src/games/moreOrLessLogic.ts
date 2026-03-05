/**
 * More or Less game logic — compare quantities.
 *
 * Which group has MORE? Which group has LESS?
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';

export interface QuantityGroup {
  emoji: string;
  count: number;
}

export interface CompareQuestion {
  left: QuantityGroup;
  right: QuantityGroup;
  question: 'more' | 'less';
}

export interface LevelConfig {
  level: number;
  minCount: number;
  maxCount: number;
}

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '⭐', '🎈', '🦋', '🌸', '🐱'];

export const LEVELS: LevelConfig[] = [
  { level: 1, minCount: 1, maxCount: 5 },
  { level: 2, minCount: 3, maxCount: 8 },
  { level: 3, minCount: 5, maxCount: 12 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function generateQuestion(level: number): CompareQuestion {
  const config = getLevelConfig(level);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  const leftCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;
  let rightCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;
  while (rightCount === leftCount) rightCount = Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount;
  const question: 'more' | 'less' = Math.random() > 0.5 ? 'more' : 'less';
  return {
    left: { emoji, count: leftCount },
    right: { emoji, count: rightCount },
    question,
  };
}

// Difficulty multipliers (preserved for backward compatibility)
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-5 count range
  2: 1.5,  // 3-8 count range
  3: 2,    // 5-12 count range
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
