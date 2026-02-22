/**
 * Phonics Sound Match game logic — pure functions for the phonics game.
 *
 * Pip says a letter sound, kids pinch the correct letter from floating options.
 * This module handles phoneme data, round building, and position placement.
 *
 * @see docs/plans/NEXT_3_GAMES_PLAN.md
 */

import { pickSpacedPoints } from './targetPracticeLogic';

export interface Phoneme {
  letter: string;
  sound: string;
  ttsText: string;
  exampleWord: string;
  exampleEmoji: string;
  level: 1 | 2 | 3;
}

export interface PhonicsTarget {
  id: number;
  phoneme: Phoneme;
  x: number;
  y: number;
  isCorrect: boolean;
}

export interface PhonicsRound {
  targetPhoneme: Phoneme;
  targets: PhonicsTarget[];
}

export interface PhonicsLevelConfig {
  level: number;
  optionCount: number;
  roundCount: number;
  timePerRound: number;
  passThreshold: number;
}

export const LEVELS: PhonicsLevelConfig[] = [
  { level: 1, optionCount: 3, roundCount: 8, timePerRound: 20, passThreshold: 5 },
  { level: 2, optionCount: 4, roundCount: 8, timePerRound: 15, passThreshold: 6 },
  { level: 3, optionCount: 4, roundCount: 8, timePerRound: 15, passThreshold: 6 },
];

// ---------------------------------------------------------------------------
// Phoneme data — 28 total (15 consonants + 5 vowels + 8 blends)
// ---------------------------------------------------------------------------

const CONSONANTS: Phoneme[] = [
  { letter: 'B', sound: 'buh', ttsText: 'Buh! Like in Ball!', exampleWord: 'Ball', exampleEmoji: '🏐', level: 1 },
  { letter: 'C', sound: 'kuh', ttsText: 'Kuh! Like in Cat!', exampleWord: 'Cat', exampleEmoji: '🐱', level: 1 },
  { letter: 'D', sound: 'duh', ttsText: 'Duh! Like in Dog!', exampleWord: 'Dog', exampleEmoji: '🐕', level: 1 },
  { letter: 'F', sound: 'fuh', ttsText: 'Fuh! Like in Fish!', exampleWord: 'Fish', exampleEmoji: '🐟', level: 1 },
  { letter: 'G', sound: 'guh', ttsText: 'Guh! Like in Goat!', exampleWord: 'Goat', exampleEmoji: '🐐', level: 1 },
  { letter: 'H', sound: 'huh', ttsText: 'Huh! Like in Hat!', exampleWord: 'Hat', exampleEmoji: '🎩', level: 1 },
  { letter: 'J', sound: 'juh', ttsText: 'Juh! Like in Jam!', exampleWord: 'Jam', exampleEmoji: '🫙', level: 1 },
  { letter: 'K', sound: 'kuh', ttsText: 'Kuh! Like in Kite!', exampleWord: 'Kite', exampleEmoji: '🪁', level: 1 },
  { letter: 'L', sound: 'luh', ttsText: 'Luh! Like in Lion!', exampleWord: 'Lion', exampleEmoji: '🦁', level: 1 },
  { letter: 'M', sound: 'muh', ttsText: 'Muh! Like in Moon!', exampleWord: 'Moon', exampleEmoji: '🌙', level: 1 },
  { letter: 'N', sound: 'nuh', ttsText: 'Nuh! Like in Nest!', exampleWord: 'Nest', exampleEmoji: '🪺', level: 1 },
  { letter: 'P', sound: 'puh', ttsText: 'Puh! Like in Pig!', exampleWord: 'Pig', exampleEmoji: '🐷', level: 1 },
  { letter: 'R', sound: 'ruh', ttsText: 'Ruh! Like in Rain!', exampleWord: 'Rain', exampleEmoji: '🌧️', level: 1 },
  { letter: 'S', sound: 'sss', ttsText: 'Sss! Like in Sun!', exampleWord: 'Sun', exampleEmoji: '☀️', level: 1 },
  { letter: 'T', sound: 'tuh', ttsText: 'Tuh! Like in Tree!', exampleWord: 'Tree', exampleEmoji: '🌳', level: 1 },
];

const VOWELS: Phoneme[] = [
  { letter: 'A', sound: 'ah', ttsText: 'Ah! Like in Apple!', exampleWord: 'Apple', exampleEmoji: '🍎', level: 2 },
  { letter: 'E', sound: 'eh', ttsText: 'Eh! Like in Egg!', exampleWord: 'Egg', exampleEmoji: '🥚', level: 2 },
  { letter: 'I', sound: 'ih', ttsText: 'Ih! Like in Igloo!', exampleWord: 'Igloo', exampleEmoji: '🏠', level: 2 },
  { letter: 'O', sound: 'oh', ttsText: 'Oh! Like in Octopus!', exampleWord: 'Octopus', exampleEmoji: '🐙', level: 2 },
  { letter: 'U', sound: 'uh', ttsText: 'Uh! Like in Umbrella!', exampleWord: 'Umbrella', exampleEmoji: '☂️', level: 2 },
];

const BLENDS: Phoneme[] = [
  { letter: 'BL', sound: 'bluh', ttsText: 'Bluh! Like in Block!', exampleWord: 'Block', exampleEmoji: '🧱', level: 3 },
  { letter: 'BR', sound: 'bruh', ttsText: 'Bruh! Like in Brush!', exampleWord: 'Brush', exampleEmoji: '🖌️', level: 3 },
  { letter: 'CL', sound: 'cluh', ttsText: 'Cluh! Like in Clock!', exampleWord: 'Clock', exampleEmoji: '🕐', level: 3 },
  { letter: 'CR', sound: 'cruh', ttsText: 'Cruh! Like in Crab!', exampleWord: 'Crab', exampleEmoji: '🦀', level: 3 },
  { letter: 'DR', sound: 'druh', ttsText: 'Druh! Like in Drum!', exampleWord: 'Drum', exampleEmoji: '🥁', level: 3 },
  { letter: 'FL', sound: 'fluh', ttsText: 'Fluh! Like in Flag!', exampleWord: 'Flag', exampleEmoji: '🏴', level: 3 },
  { letter: 'FR', sound: 'fruh', ttsText: 'Fruh! Like in Frog!', exampleWord: 'Frog', exampleEmoji: '🐸', level: 3 },
  { letter: 'GR', sound: 'gruh', ttsText: 'Gruh! Like in Grape!', exampleWord: 'Grape', exampleEmoji: '🍇', level: 3 },
];

export const PHONEMES: Phoneme[] = [...CONSONANTS, ...VOWELS, ...BLENDS];

/** Get phonemes for a specific level. */
export function getPhonemesForLevel(level: number): Phoneme[] {
  return PHONEMES.filter((p) => p.level === level);
}

/**
 * Build a round: pick a target phoneme + distractors, place at spaced positions.
 *
 * @param level       - which level (1, 2, or 3)
 * @param usedLetters - recently used letters to avoid repeating
 * @param random      - random function (injectable for tests)
 */
export function buildPhonicsRound(
  level: number,
  usedLetters: string[] = [],
  random: () => number = Math.random,
): PhonicsRound {
  const levelCfg = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const pool = getPhonemesForLevel(level);

  if (pool.length === 0) {
    throw new Error(`No phonemes for level ${level}`);
  }

  // Pick target, preferring unused letters
  const unused = pool.filter((p) => !usedLetters.includes(p.letter));
  const targetPool = unused.length > 0 ? unused : pool;
  const shuffledTarget = [...targetPool].sort(() => random() - 0.5);
  const targetPhoneme = shuffledTarget[0];

  // Pick distractors (different letter from target)
  const distractorPool = pool.filter(
    (p) => p.letter !== targetPhoneme.letter,
  );
  const shuffledDistractors = [...distractorPool].sort(() => random() - 0.5);
  const distractors = shuffledDistractors.slice(
    0,
    levelCfg.optionCount - 1,
  );

  // Combine target + distractors and shuffle
  const allPhonemes = [targetPhoneme, ...distractors];
  const shuffled = [...allPhonemes].sort(() => random() - 0.5);

  // Place at spaced positions
  const positions = pickSpacedPoints(
    shuffled.length,
    0.22,
    0.16,
    random,
  );

  const targets: PhonicsTarget[] = shuffled.map((phoneme, index) => ({
    id: index,
    phoneme,
    x: positions[index].position.x,
    y: positions[index].position.y,
    isCorrect: phoneme.letter === targetPhoneme.letter,
  }));

  return { targetPhoneme, targets };
}
