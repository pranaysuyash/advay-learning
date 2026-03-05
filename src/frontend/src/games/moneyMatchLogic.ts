/**
 * Money Match game logic — count money and make change.
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';

export interface Coin {
  value: number;
  name: string;
  emoji: string;
}

export interface LevelConfig {
  level: number;
  maxAmount: number;
}

export const COINS: Coin[] = [
  { value: 1, name: 'Penny', emoji: '🪙' },
  { value: 5, name: 'Nickel', emoji: '🪙' },
  { value: 10, name: 'Dime', emoji: '🪙' },
  { value: 25, name: 'Quarter', emoji: '🪙' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, maxAmount: 10 },
  { level: 2, maxAmount: 50 },
  { level: 3, maxAmount: 100 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function generateAmount(level: number): number {
  const config = getLevelConfig(level);
  return Math.floor(Math.random() * config.maxAmount) + 1;
}

export function getCoinsForAmount(amount: number): Coin[] {
  let remaining = amount;
  const coins: Coin[] = [];
  const sorted = [...COINS].sort((a, b) => b.value - a.value);
  for (const coin of sorted) {
    while (remaining >= coin.value) {
      coins.push(coin);
      remaining -= coin.value;
    }
  }
  return coins;
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
 * Max per round: 60 points (level 3, streak 5+)
 *
 * @deprecated Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.high` directly
 */
export const calculateScore = (streak: number, level: number): number =>
  _calculateScore(streak, level, ScorePresets.high);
