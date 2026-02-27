/**
 * Beginning Sounds game logic — identify the sound words start with.
 *
 * "What sound does BALL start with?" → B, D, P options
 * Audio feedback: "Buh... BALL!"
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Beginning Sounds P1
 */

export interface WordItem {
  word: string;
  emoji: string;
  firstSound: string;
  firstLetter: string;
  difficulty: 1 | 2 | 3;
}

export interface SoundOption {
  letter: string;
  sound: string;
  isCorrect: boolean;
}

export interface BeginningSoundsRound {
  targetWord: WordItem;
  options: SoundOption[];
}

export interface LevelConfig {
  level: number;
  roundCount: number;
  timePerRound: number;
  optionCount: number;
  passThreshold: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, roundCount: 6, timePerRound: 20, optionCount: 3, passThreshold: 4 },
  { level: 2, roundCount: 8, timePerRound: 15, optionCount: 4, passThreshold: 6 },
  { level: 3, roundCount: 10, timePerRound: 12, optionCount: 4, passThreshold: 8 },
];

// Word bank organized by difficulty and starting sound
const WORD_BANK: WordItem[] = [
  // Easy - Common words, clear sounds (Level 1)
  { word: 'Apple', emoji: '🍎', firstSound: 'ah', firstLetter: 'A', difficulty: 1 },
  { word: 'Ball', emoji: '🏐', firstSound: 'buh', firstLetter: 'B', difficulty: 1 },
  { word: 'Cat', emoji: '🐱', firstSound: 'kuh', firstLetter: 'C', difficulty: 1 },
  { word: 'Dog', emoji: '🐕', firstSound: 'duh', firstLetter: 'D', difficulty: 1 },
  { word: 'Elephant', emoji: '🐘', firstSound: 'eh', firstLetter: 'E', difficulty: 1 },
  { word: 'Fish', emoji: '🐟', firstSound: 'fuh', firstLetter: 'F', difficulty: 1 },
  { word: 'Goat', emoji: '🐐', firstSound: 'guh', firstLetter: 'G', difficulty: 1 },
  { word: 'Hat', emoji: '🎩', firstSound: 'huh', firstLetter: 'H', difficulty: 1 },
  { word: 'Ice cream', emoji: '🍦', firstSound: 'ih', firstLetter: 'I', difficulty: 1 },
  { word: 'Jam', emoji: '🫙', firstSound: 'juh', firstLetter: 'J', difficulty: 1 },
  { word: 'Kite', emoji: '🪁', firstSound: 'kuh', firstLetter: 'K', difficulty: 1 },
  { word: 'Lion', emoji: '🦁', firstSound: 'luh', firstLetter: 'L', difficulty: 1 },
  { word: 'Moon', emoji: '🌙', firstSound: 'muh', firstLetter: 'M', difficulty: 1 },
  { word: 'Nest', emoji: '🪺', firstSound: 'nuh', firstLetter: 'N', difficulty: 1 },
  { word: 'Octopus', emoji: '🐙', firstSound: 'oh', firstLetter: 'O', difficulty: 1 },
  { word: 'Pig', emoji: '🐷', firstSound: 'puh', firstLetter: 'P', difficulty: 1 },
  { word: 'Rain', emoji: '🌧️', firstSound: 'ruh', firstLetter: 'R', difficulty: 1 },
  { word: 'Sun', emoji: '☀️', firstSound: 'suh', firstLetter: 'S', difficulty: 1 },
  { word: 'Tree', emoji: '🌳', firstSound: 'tuh', firstLetter: 'T', difficulty: 1 },
  { word: 'Umbrella', emoji: '☂️', firstSound: 'uh', firstLetter: 'U', difficulty: 1 },

  // Medium - More complex or similar sounds (Level 2)
  { word: 'Van', emoji: '🚐', firstSound: 'vuh', firstLetter: 'V', difficulty: 2 },
  { word: 'Water', emoji: '💧', firstSound: 'wuh', firstLetter: 'W', difficulty: 2 },
  { word: 'Box', emoji: '📦', firstSound: 'ks', firstLetter: 'X', difficulty: 2 },
  { word: 'Zoo', emoji: '🦓', firstSound: 'zuh', firstLetter: 'Z', difficulty: 2 },
  { word: 'Queen', emoji: '👑', firstSound: 'kwuh', firstLetter: 'Q', difficulty: 2 },
  { word: 'Yellow', emoji: '🟡', firstSound: 'yuh', firstLetter: 'Y', difficulty: 2 },
  { word: 'Bus', emoji: '🚌', firstSound: 'buh', firstLetter: 'B', difficulty: 2 },
  { word: 'Bed', emoji: '🛏️', firstSound: 'buh', firstLetter: 'B', difficulty: 2 },
  { word: 'Cup', emoji: '🥤', firstSound: 'kuh', firstLetter: 'C', difficulty: 2 },
  { word: 'Duck', emoji: '🦆', firstSound: 'duh', firstLetter: 'D', difficulty: 2 },
  { word: 'Flag', emoji: '🏴', firstSound: 'fluh', firstLetter: 'F', difficulty: 2 },
  { word: 'Grapes', emoji: '🍇', firstSound: 'gruh', firstLetter: 'G', difficulty: 2 },

  // Hard - Blends and tricky sounds (Level 3)
  { word: 'Spider', emoji: '🕷️', firstSound: 'suh', firstLetter: 'S', difficulty: 3 },
  { word: 'Star', emoji: '⭐', firstSound: 'stuh', firstLetter: 'S', difficulty: 3 },
  { word: 'Clock', emoji: '🕐', firstSound: 'kluh', firstLetter: 'C', difficulty: 3 },
  { word: 'Snow', emoji: '❄️', firstSound: 'snuh', firstLetter: 'S', difficulty: 3 },
  { word: 'Plant', emoji: '🌱', firstSound: 'pluh', firstLetter: 'P', difficulty: 3 },
  { word: 'Truck', emoji: '🚚', firstSound: 'truh', firstLetter: 'T', difficulty: 3 },
  { word: 'Flower', emoji: '🌸', firstSound: 'fluh', firstLetter: 'F', difficulty: 3 },
  { word: 'Glass', emoji: '🥃', firstSound: 'gluh', firstLetter: 'G', difficulty: 3 },
];

const ALL_SOUNDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const SOUND_MAP: Record<string, string> = {
  A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fuh', G: 'guh', H: 'huh',
  I: 'ih', J: 'juh', K: 'kuh', L: 'luh', M: 'muh', N: 'nuh', O: 'oh', P: 'puh',
  Q: 'kwuh', R: 'ruh', S: 'suh', T: 'tuh', U: 'uh', V: 'vuh', W: 'wuh', X: 'ks',
  Y: 'yuh', Z: 'zuh',
};

export function getWordsForLevel(level: number): WordItem[] {
  return WORD_BANK.filter((w) => w.difficulty <= level);
}

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function buildBeginningSoundsRound(
  level: number,
  usedWords: string[] = [],
  random: () => number = Math.random,
): BeginningSoundsRound {
  const levelCfg = getLevelConfig(level);
  const levelWords = getWordsForLevel(levelCfg.level);

  if (levelWords.length === 0) {
    throw new Error(`No words configured for level ${levelCfg.level}`);
  }

  const availableWords = levelWords.filter((w) => !usedWords.includes(w.word));
  // When all words have been used, restart from the full pool (no infinite recursion)
  const candidateWords = availableWords.length > 0 ? availableWords : levelWords;

  const shuffled = [...candidateWords].sort(() => random() - 0.5);
  const targetWord = shuffled[0];

  // Get incorrect options (different first letters)
  const incorrectLetters = ALL_SOUNDS
    .filter((l) => l !== targetWord.firstLetter)
    .sort(() => random() - 0.5)
    .slice(0, levelCfg.optionCount - 1);

  const options: SoundOption[] = [
    { letter: targetWord.firstLetter, sound: SOUND_MAP[targetWord.firstLetter], isCorrect: true },
    ...incorrectLetters.map((letter) => ({
      letter,
      sound: SOUND_MAP[letter],
      isCorrect: false,
    })),
  ];

  const shuffledOptions = options.sort(() => random() - 0.5);

  return { targetWord, options: shuffledOptions };
}

export function checkAnswer(selectedLetter: string, correctLetter: string): boolean {
  return selectedLetter.toUpperCase() === correctLetter.toUpperCase();
}

export function calculateScore(correct: boolean, timeUsed: number, timeLimit: number): number {
  if (!correct) return 0;
  const baseScore = 20;
  const timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 5));
  return Math.min(25, baseScore + timeBonus);
}
