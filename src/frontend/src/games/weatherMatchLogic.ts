/**
 * Weather Match game logic — match weather to clothing.
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';
import { shuffle } from '../utils/random';

export interface Weather {
  name: string;
  emoji: string;
  icon: string;
}

export interface Clothing {
  name: string;
  emoji: string;
}

export interface LevelConfig {
  level: number;
  pairCount: number;
}

const WEATHER: Weather[] = [
  { name: 'Sunny', emoji: '☀️', icon: 'sun' },
  { name: 'Rainy', emoji: '🌧️', icon: 'cloud-rain' },
  { name: 'Snowy', emoji: '❄️', icon: 'snowflake' },
  { name: 'Windy', emoji: '💨', icon: 'wind' },
  { name: 'Cloudy', emoji: '☁️', icon: 'cloud' },
  { name: 'Stormy', emoji: '⛈️', icon: 'cloud-lightning' },
];

const CLOTHING: Record<string, Clothing[]> = {
  Sunny: [{ name: 'Sunglasses', emoji: '🕶️' }, { name: 'Hat', emoji: '🧢' }],
  Rainy: [{ name: 'Raincoat', emoji: '🧥' }, { name: 'Umbrella', emoji: '☂️' }],
  Snowy: [{ name: 'Coat', emoji: '🧥' }, { name: 'Scarf', emoji: '🧣' }],
  Windy: [{ name: 'Jacket', emoji: '🧥' }],
  Cloudy: [{ name: 'Light Jacket', emoji: '🧥' }],
  Stormy: [{ name: 'Raincoat', emoji: '🧥' }],
};

export const LEVELS: LevelConfig[] = [
  { level: 1, pairCount: 2 },
  { level: 2, pairCount: 3 },
  { level: 3, pairCount: 4 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateGame(level: number) {
  const config = getLevelConfig(level);
  const shuffled = shuffle(WEATHER);
  const selected = shuffled.slice(0, config.pairCount);
  const pairs = selected.map(w => ({
    weather: w,
    clothing: CLOTHING[w.name][Math.floor(Math.random() * CLOTHING[w.name].length)],
  }));
  return pairs;
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
 * Max per match: 60 points (level 3, streak 5+)
 *
 * @deprecated Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.high` directly
 */
export const calculateScore = (streak: number, level: number): number =>
  _calculateScore(streak, level, ScorePresets.high);
