/**
 * Animal Sounds game logic — match animal to sound.
 */

import { calculateScore as _calculateScore, ScorePresets } from '../utils/scoring';
import { shuffle } from '../utils/random';

export interface Animal {
  name: string;
  emoji: string;
  sound: string;
}

export interface LevelConfig {
  level: number;
  animalCount: number;
}

const ANIMALS: Animal[] = [
  { name: 'Dog', emoji: '🐕', sound: 'Woof woof!' },
  { name: 'Cat', emoji: '🐱', sound: 'Meow!' },
  { name: 'Cow', emoji: '🐄', sound: 'Moo!' },
  { name: 'Pig', emoji: '🐷', sound: 'Oink oink!' },
  { name: 'Bird', emoji: '🐦', sound: 'Chirp chirp!' },
  { name: 'Rooster', emoji: '🐓', sound: 'Cock-a-doodle-doo!' },
  { name: 'Sheep', emoji: '🐑', sound: 'Baa baa!' },
  { name: 'Horse', emoji: '🐴', sound: 'Neigh!' },
  { name: 'Lion', emoji: '🦁', sound: 'Roar!' },
  { name: 'Elephant', emoji: '🐘', sound: 'Trumpet!' },
  { name: 'Monkey', emoji: '🐵', sound: 'Ooh ooh ah ah!' },
  { name: 'Frog', emoji: '🐸', sound: 'Ribbit ribbit!' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, animalCount: 3 },
  { level: 2, animalCount: 4 },
  { level: 3, animalCount: 6 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function getAnimalsForLevel(level: number): Animal[] {
  const config = getLevelConfig(level);
  const shuffled = shuffle(ANIMALS);
  return shuffled.slice(0, config.animalCount);
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
