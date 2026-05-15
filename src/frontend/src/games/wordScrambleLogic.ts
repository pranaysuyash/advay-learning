/**
 * Word Scramble Game Logic
 *
 * Unscramble letters to form words.
 * Educational focus: spelling, letter recognition, word patterns.
 */

export interface ScrambleWord {
  word: string;
  hint: string;
  emoji: string;
  difficulty: number;
  category: string;
}

export interface ScrambleRound {
  targetWord: ScrambleWord;
  scrambledLetters: string[];
}

export interface WordScrambleGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  hintsRevealed: number;
  completed: boolean;
}

export const SCRAMBLE_WORDS: ScrambleWord[] = [
  // Animals
  { word: 'cat', hint: 'Meow! A furry pet', emoji: '🐱', difficulty: 1, category: 'Animals' },
  { word: 'dog', hint: 'Woof! A loyal friend', emoji: '🐕', difficulty: 1, category: 'Animals' },
  { word: 'bird', hint: 'Tweet! It flies', emoji: '🐦', difficulty: 2, category: 'Animals' },
  { word: 'fish', hint: 'Swims in water', emoji: '🐟', difficulty: 2, category: 'Animals' },
  { word: 'lion', hint: 'King of the jungle', emoji: '🦁', difficulty: 2, category: 'Animals' },
  { word: 'tiger', hint: 'Striped big cat', emoji: '🐅', difficulty: 3, category: 'Animals' },
  { word: 'monkey', hint: 'Swings from trees', emoji: '🐒', difficulty: 3, category: 'Animals' },
  { word: 'elephant', hint: 'Has a trunk', emoji: '🐘', difficulty: 4, category: 'Animals' },
  
  // Food
  { word: 'apple', hint: 'Red or green fruit', emoji: '🍎', difficulty: 1, category: 'Food' },
  { word: 'bread', hint: 'Baked food', emoji: '🍞', difficulty: 2, category: 'Food' },
  { word: 'pizza', hint: 'Cheesy Italian food', emoji: '🍕', difficulty: 3, category: 'Food' },
  { word: 'banana', hint: 'Long yellow fruit', emoji: '🍌', difficulty: 3, category: 'Food' },
  { word: 'chocolate', hint: 'Sweet brown treat', emoji: '🍫', difficulty: 4, category: 'Food' },
  
  // Nature
  { word: 'sun', hint: 'Shines in the sky', emoji: '☀️', difficulty: 1, category: 'Nature' },
  { word: 'tree', hint: 'Has leaves and branches', emoji: '🌳', difficulty: 2, category: 'Nature' },
  { word: 'flower', hint: 'Beautiful plant', emoji: '🌸', difficulty: 2, category: 'Nature' },
  { word: 'rainbow', hint: 'Colors in the sky', emoji: '🌈', difficulty: 3, category: 'Nature' },
  { word: 'cloud', hint: 'Floats in the sky', emoji: '☁️', difficulty: 2, category: 'Nature' },
  
  // Objects
  { word: 'book', hint: 'You read it', emoji: '📚', difficulty: 2, category: 'Objects' },
  { word: 'chair', hint: 'You sit on it', emoji: '🪑', difficulty: 2, category: 'Objects' },
  { word: 'table', hint: 'Put things on it', emoji: '🪑', difficulty: 2, category: 'Objects' },
  { word: 'clock', hint: 'Tells the time', emoji: '🕐', difficulty: 2, category: 'Objects' },
  { word: 'computer', hint: 'For work and games', emoji: '💻', difficulty: 4, category: 'Objects' },
  
  // Places
  { word: 'home', hint: 'Where you live', emoji: '🏠', difficulty: 2, category: 'Places' },
  { word: 'school', hint: 'Where you learn', emoji: '🏫', difficulty: 2, category: 'Places' },
  { word: 'beach', hint: 'Sand and waves', emoji: '🏖️', difficulty: 2, category: 'Places' },
  { word: 'park', hint: 'Play outdoors here', emoji: '🌳', difficulty: 1, category: 'Places' },
  
  // Feelings
  { word: 'happy', hint: 'Feeling joy', emoji: '😊', difficulty: 2, category: 'Feelings' },
  { word: 'sad', hint: 'Feeling down', emoji: '😢', difficulty: 1, category: 'Feelings' },
  { word: 'excited', hint: 'Very enthusiastic', emoji: '🤩', difficulty: 3, category: 'Feelings' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  maxWordDifficulty: number;
  hintPenalty: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxWordDifficulty: 2,
    hintPenalty: 2,
  },
  medium: {
    maxWordDifficulty: 3,
    hintPenalty: 3,
  },
  hard: {
    maxWordDifficulty: 4,
    hintPenalty: 5,
  },
};

function scrambleWord(word: string): string[] {
  const letters = word.toUpperCase().split('');
  let scrambled = [...letters];
  
  // Keep scrambling until it's different from original
  let attempts = 0;
  do {
    scrambled = scrambled.sort(() => Math.random() - 0.5);
    attempts++;
  } while (scrambled.join('') === letters.join('') && attempts < 10);
  
  return scrambled;
}

export function generateRound(
  difficulty: Difficulty,
  usedWords: Set<string> = new Set()
): ScrambleRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter words by difficulty
  const availableWords = SCRAMBLE_WORDS.filter(
    w => w.difficulty <= config.maxWordDifficulty && !usedWords.has(w.word)
  );
  
  // If all words used, reset pool
  const wordPool = availableWords.length > 0 
    ? availableWords 
    : SCRAMBLE_WORDS.filter(w => w.difficulty <= config.maxWordDifficulty);
  
  const targetWord = wordPool[Math.floor(Math.random() * wordPool.length)];
  const scrambledLetters = scrambleWord(targetWord.word);
  
  return {
    targetWord,
    scrambledLetters,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 8): WordScrambleGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    hintsRevealed: 0,
    completed: false,
  };
}

export function checkAnswer(attempt: string[], targetWord: string): boolean {
  return attempt.join('').toLowerCase() === targetWord.toLowerCase();
}

export function processAnswer(
  gameState: WordScrambleGameState,
  isCorrect: boolean,
  hintsUsed: number
): WordScrambleGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 20;
  const streakBonus = Math.min(newStreak * 3, 15);
  const hintPenalty = hintsUsed * 3;
  const points = isCorrect ? Math.max(0, basePoints + streakBonus - hintPenalty) : 0;
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    hintsRevealed: gameState.hintsRevealed + hintsUsed,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function revealHint(
  _scrambledLetters: string[],
  targetWord: string,
  currentAttempt: string[]
): { hintIndex: number; hintLetter: string } | null {
  const target = targetWord.toUpperCase().split('');
  
  // Find first unrevealed position
  for (let i = 0; i < target.length; i++) {
    if (!currentAttempt[i]) {
      return { hintIndex: i, hintLetter: target[i] };
    }
  }
  
  return null;
}

export function calculateAccuracy(gameState: WordScrambleGameState): number {
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
      return { label: 'Easy', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}
