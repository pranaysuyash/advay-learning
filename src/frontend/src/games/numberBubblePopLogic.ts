/**
 * Number Bubble Pop game logic — pop bubbles with correct numbers.
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';
import { shuffle } from '../utils/random';

export interface Bubble {
  id: number;
  number: number;
  x: number;
  y: number;
}

export interface LevelConfig {
  level: number;
  numberRange: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, numberRange: 5 },
  { level: 2, numberRange: 10 },
  { level: 3, numberRange: 20 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateBubbles(count: number, target: number, numberRange: number = LEVELS[0].numberRange): Bubble[] {
  const bubbles: Bubble[] = [];
  const safeRange = Math.max(2, Math.floor(numberRange));
  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < count - 1 && wrongAnswers.size < safeRange - 1) {
    const n = Math.floor(Math.random() * safeRange) + 1;
    if (n !== target) wrongAnswers.add(n);
  }
  if (wrongAnswers.size < count - 1) {
    for (let n = 1; n <= safeRange && wrongAnswers.size < count - 1; n++) {
      if (n !== target) {
        wrongAnswers.add(n);
      }
    }
  }
  const allNumbers = [target, ...Array.from(wrongAnswers)];
  while (allNumbers.length < count) {
    allNumbers.push(Math.floor(Math.random() * safeRange) + 1);
  }
  const shuffledNumbers = shuffle(allNumbers);
  for (let i = 0; i < count; i++) {
    bubbles.push({
      id: i,
      number: shuffledNumbers[i],
      x: Math.random() * 280 + 20,
      y: Math.random() * 200 + 50,
    });
  }
  return bubbles;
}

// Difficulty multipliers (preserved for backward compatibility)
export const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-5 range
  2: 1.5,  // 1-10 range
  3: 2,    // 1-20 range
};

/**
 * Calculate score based on streak and level
 * Base: 15 points + streak bonus (max 15) = 30 max base
 * Multiplied by difficulty (level 1: 1×, level 2: 1.5×, level 3: 2×)
 * Max per pop: 60 points (level 3, streak 5+)
 *
 * @deprecated Use `calculateScore` from `utils/scoring.ts` with `ScorePresets.high` directly
 */
export const calculateScore = (streak: number, level: number): number =>
  _calculateScore(streak, level, ScorePresets.high);
