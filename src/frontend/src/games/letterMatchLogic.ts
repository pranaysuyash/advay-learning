/**
 * Letter Match Game Logic
 *
 * Uppercase/lowercase matching game.
 * Educational focus: letter recognition, uppercase/lowercase correspondence.
 */

export interface LetterPair {
  uppercase: string;
  lowercase: string;
  emoji: string;
  word: string;
}

export interface LetterMatchRound {
  targetLetter: LetterPair;
  options: LetterOption[];
  matchType: 'uppercase' | 'lowercase';
}

export interface LetterOption {
  letter: string;
  isCorrect: boolean;
  emoji?: string;
}

export interface LetterMatchGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  completed: boolean;
}

export const LETTER_PAIRS: LetterPair[] = [
  { uppercase: 'A', lowercase: 'a', emoji: '🍎', word: 'apple' },
  { uppercase: 'B', lowercase: 'b', emoji: '🐻', word: 'bear' },
  { uppercase: 'C', lowercase: 'c', emoji: '🐱', word: 'cat' },
  { uppercase: 'D', lowercase: 'd', emoji: '🐕', word: 'dog' },
  { uppercase: 'E', lowercase: 'e', emoji: '🥚', word: 'egg' },
  { uppercase: 'F', lowercase: 'f', emoji: '🐟', word: 'fish' },
  { uppercase: 'G', lowercase: 'g', emoji: '🍇', word: 'grape' },
  { uppercase: 'H', lowercase: 'h', emoji: '🏠', word: 'house' },
  { uppercase: 'I', lowercase: 'i', emoji: '🍦', word: 'ice cream' },
  { uppercase: 'J', lowercase: 'j', emoji: '🤹', word: 'juggle' },
  { uppercase: 'K', lowercase: 'k', emoji: '🔑', word: 'key' },
  { uppercase: 'L', lowercase: 'l', emoji: '🦁', word: 'lion' },
  { uppercase: 'M', lowercase: 'm', emoji: '🐒', word: 'monkey' },
  { uppercase: 'N', lowercase: 'n', emoji: '🔢', word: 'nine' },
  { uppercase: 'O', lowercase: 'o', emoji: '🍊', word: 'orange' },
  { uppercase: 'P', lowercase: 'p', emoji: '🍕', word: 'pizza' },
  { uppercase: 'Q', lowercase: 'q', emoji: '👸', word: 'queen' },
  { uppercase: 'R', lowercase: 'r', emoji: '🌈', word: 'rainbow' },
  { uppercase: 'S', lowercase: 's', emoji: '☀️', word: 'sun' },
  { uppercase: 'T', lowercase: 't', emoji: '🌳', word: 'tree' },
  { uppercase: 'U', lowercase: 'u', emoji: '☂️', word: 'umbrella' },
  { uppercase: 'V', lowercase: 'v', emoji: '🎻', word: 'violin' },
  { uppercase: 'W', lowercase: 'w', emoji: '🌊', word: 'wave' },
  { uppercase: 'X', lowercase: 'x', emoji: '📦', word: 'box' },
  { uppercase: 'Y', lowercase: 'y', emoji: '🧶', word: 'yarn' },
  { uppercase: 'Z', lowercase: 'z', emoji: '🦓', word: 'zebra' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  useSimilarLetters: boolean;
  letterPool: LetterPair[];
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    useSimilarLetters: false,
    letterPool: LETTER_PAIRS.slice(0, 10), // A-J
  },
  medium: {
    optionCount: 4,
    useSimilarLetters: true,
    letterPool: LETTER_PAIRS.slice(0, 20), // A-T
  },
  hard: {
    optionCount: 6,
    useSimilarLetters: true,
    letterPool: LETTER_PAIRS, // A-Z
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedLetters: Set<string> = new Set()
): LetterMatchRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter out used letters
  const availableLetters = config.letterPool.filter(
    pair => !usedLetters.has(pair.uppercase)
  );
  
  // If all letters used, reset pool
  const letterPool = availableLetters.length > 0 
    ? availableLetters 
    : config.letterPool;
  
  // Select random target letter
  const targetLetter = letterPool[Math.floor(Math.random() * letterPool.length)];
  
  // Randomly choose match type (uppercase -> lowercase or vice versa)
  const matchType: 'uppercase' | 'lowercase' = Math.random() > 0.5 ? 'uppercase' : 'lowercase';
  
  // Generate options
  const options: LetterOption[] = [];
  
  // Add correct answer
  const correctLetter = matchType === 'uppercase' 
    ? targetLetter.lowercase 
    : targetLetter.uppercase;
  options.push({ 
    letter: correctLetter, 
    isCorrect: true,
    emoji: targetLetter.emoji 
  });
  
  // Add distractors
  const otherLetters = config.letterPool.filter(
    pair => pair.uppercase !== targetLetter.uppercase
  );
  
  const shuffled = [...otherLetters].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < config.optionCount - 1 && i < shuffled.length; i++) {
    const distractorLetter = matchType === 'uppercase'
      ? shuffled[i].lowercase
      : shuffled[i].uppercase;
    options.push({
      letter: distractorLetter,
      isCorrect: false,
      emoji: shuffled[i].emoji,
    });
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    targetLetter,
    options,
    matchType,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): LetterMatchGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    completed: false,
  };
}

export function checkAnswer(selectedLetter: string, correctLetter: string): boolean {
  return selectedLetter.toLowerCase() === correctLetter.toLowerCase();
}

export function processAnswer(
  gameState: LetterMatchGameState,
  isCorrect: boolean,
  _letter: string
): LetterMatchGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 15;
  const streakBonus = Math.min(newStreak * 2, 20);
  const points = isCorrect ? basePoints + streakBonus : 0;
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: LetterMatchGameState): number {
  if (gameState.currentRound === 0) return 0;
  return Math.round((gameState.correctAnswers / gameState.currentRound) * 100);
}

export function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

export function getDifficultyDisplay(difficulty: Difficulty): { label: string; color: string } {
  switch (difficulty) {
    case 'easy':
      return { label: 'Easy (A-J)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (A-T)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (A-Z)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}

export function getMatchInstruction(matchType: 'uppercase' | 'lowercase'): string {
  return matchType === 'uppercase'
    ? 'Find the lowercase letter!'
    : 'Find the uppercase letter!';
}
