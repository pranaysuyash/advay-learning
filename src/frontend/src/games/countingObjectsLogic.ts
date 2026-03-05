/**
 * Counting Objects game logic — count items in a scene.
 *
 * "How many apples do you see?"
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Counting Objects P2
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';
import { shuffle } from '../utils/random';

export interface CountItem {
  emoji: string;
  name: string;
}

export interface CountingScene {
  items: { emoji: string; count: number }[];
  targetItem: string;
  answer: number;
}

export interface LevelConfig {
  level: number;
  minCount: number;
  maxCount: number;
  itemTypes: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, minCount: 1, maxCount: 5, itemTypes: 2 },
  { level: 2, minCount: 3, maxCount: 8, itemTypes: 3 },
  { level: 3, minCount: 5, maxCount: 10, itemTypes: 4 },
];

const ITEMS: CountItem[] = [
  { emoji: '🍎', name: 'apples' },
  { emoji: '🍊', name: 'oranges' },
  { emoji: '🍋', name: 'lemons' },
  { emoji: '🍇', name: 'grapes' },
  { emoji: '🍓', name: 'strawberries' },
  { emoji: '🌸', name: 'flowers' },
  { emoji: '🦋', name: 'butterflies' },
  { emoji: '🐞', name: 'ladybugs' },
  { emoji: '⭐', name: 'stars' },
  { emoji: '🎈', name: 'balloons' },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function generateCountingScene(level: number): CountingScene {
  const config = getLevelConfig(level);
  const shuffled = shuffle(ITEMS);
  const selected = shuffled.slice(0, config.itemTypes);

  const items: { emoji: string; count: number }[] = selected.map((item) => ({
    emoji: item.emoji,
    count: Math.floor(Math.random() * (config.maxCount - config.minCount + 1)) + config.minCount,
  }));

  const targetIdx = Math.floor(Math.random() * items.length);
  const targetItem = selected[targetIdx].name;

  return { items, targetItem, answer: items[targetIdx].count };
}

// Difficulty multipliers (preserved for backward compatibility)
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-5 count
  2: 1.5,  // 3-8 count
  3: 2,    // 5-10 count
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
