/**
 * Color Sort game logic — sort colors into correct buckets.
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';
import { shuffle } from '../utils/random';

export interface ColorItem {
  name: string;
  hex: string;
}

export interface LevelConfig {
  level: number;
  colorCount: number;
}

const COLORS: ColorItem[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Brown', hex: '#92400E' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, colorCount: 3 },
  { level: 2, colorCount: 4 },
  { level: 3, colorCount: 6 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

// Difficulty multipliers for scoring (preserved for backward compatibility)
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
};

/**
 * Calculate score based on streak and level
 * Base: 10 points + streak bonus (max 15) = 25 max base
 * Multiplied by difficulty (level 1: 1×, level 2: 1.5×, level 3: 2×)
 * Max per sort: 50 points (level 3, streak 5+)
 *
 * @deprecated Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.standard` directly
 */
export const calculateScore = (streak: number, level: number): number =>
  _calculateScore(streak, level, ScorePresets.standard);

export function generateItems(level: number): { items: ColorItem[]; targets: ColorItem[] } {
  const config = getLevelConfig(level);
  const shuffled = shuffle(COLORS);
  const targets = shuffled.slice(0, config.colorCount);
  const items: ColorItem[] = [];
  targets.forEach(t => {
    items.push(t, t, t);
  });
  return { items: shuffle(items), targets };
}
