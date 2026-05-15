/**
 * Spelling Bee Game Logic
 *
 * Letter-by-letter spelling game with progressive difficulty.
 * Educational focus: spelling accuracy, phonics, word recognition.
 */

export interface SpellingWord {
  word: string;
  hint: string;
  emoji: string;
  difficulty: number;
}

export interface SpellingRound {
  targetWord: SpellingWord;
  availableLetters: string[];
  currentAttempt: string[];
}

export interface SpellingBeeGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  hintsUsed: number;
  completed: boolean;
}

export const SPELLING_WORDS: SpellingWord[] = [
  // Level 1: Simple 3-letter words
  { word: 'cat', hint: 'A furry pet that meows', emoji: '🐱', difficulty: 1 },
  { word: 'dog', hint: 'A loyal pet that barks', emoji: '🐕', difficulty: 1 },
  { word: 'sun', hint: 'It shines in the sky', emoji: '☀️', difficulty: 1 },
  { word: 'hat', hint: 'You wear it on your head', emoji: '🎩', difficulty: 1 },
  { word: 'bed', hint: 'You sleep in it', emoji: '🛏️', difficulty: 1 },
  { word: 'cup', hint: 'You drink from it', emoji: '☕', difficulty: 1 },
  { word: 'box', hint: 'A container for things', emoji: '📦', difficulty: 1 },
  { word: 'car', hint: 'It has wheels', emoji: '🚗', difficulty: 1 },
  
  // Level 2: 4-letter words
  { word: 'fish', hint: 'It swims in water', emoji: '🐟', difficulty: 2 },
  { word: 'bird', hint: 'It flies in the sky', emoji: '🐦', difficulty: 2 },
  { word: 'tree', hint: 'It has leaves', emoji: '🌳', difficulty: 2 },
  { word: 'book', hint: 'You read it', emoji: '📚', difficulty: 2 },
  { word: 'ball', hint: 'You throw and catch it', emoji: '⚽', difficulty: 2 },
  { word: 'cake', hint: 'Sweet birthday treat', emoji: '🎂', difficulty: 2 },
  { word: 'milk', hint: 'Comes from cows', emoji: '🥛', difficulty: 2 },
  { word: 'hand', hint: 'You have two of these', emoji: '✋', difficulty: 2 },
  
  // Level 3: 5-letter words
  { word: 'apple', hint: 'A red or green fruit', emoji: '🍎', difficulty: 3 },
  { word: 'happy', hint: 'Feeling joy', emoji: '😊', difficulty: 3 },
  { word: 'water', hint: 'We drink it', emoji: '💧', difficulty: 3 },
  { word: 'house', hint: 'Where you live', emoji: '🏠', difficulty: 3 },
  { word: 'train', hint: 'Runs on tracks', emoji: '🚂', difficulty: 3 },
  { word: 'pizza', hint: 'Cheesy Italian food', emoji: '🍕', difficulty: 3 },
  { word: 'beach', hint: 'Sand and waves', emoji: '🏖️', difficulty: 3 },
  { word: 'cloud', hint: 'Floats in the sky', emoji: '☁️', difficulty: 3 },
  
  // Level 4: Challenging words
  { word: 'banana', hint: 'A long yellow fruit', emoji: '🍌', difficulty: 4 },
  { word: 'purple', hint: 'A royal color', emoji: '🟣', difficulty: 4 },
  { word: 'orange', hint: 'A fruit and color', emoji: '🍊', difficulty: 4 },
  { word: 'school', hint: 'Where you learn', emoji: '🏫', difficulty: 4 },
  { word: 'friend', hint: 'Someone you like', emoji: '👫', difficulty: 4 },
  { word: 'summer', hint: 'Hot sunny season', emoji: '☀️', difficulty: 4 },
  { word: 'winter', hint: 'Cold snowy season', emoji: '❄️', difficulty: 4 },
  { word: 'flower', hint: 'Beautiful plant', emoji: '🌸', difficulty: 4 },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  maxWordDifficulty: number;
  letterPoolMultiplier: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    maxWordDifficulty: 2,
    letterPoolMultiplier: 1.5,
  },
  medium: {
    maxWordDifficulty: 3,
    letterPoolMultiplier: 1.3,
  },
  hard: {
    maxWordDifficulty: 4,
    letterPoolMultiplier: 1.1,
  },
};

export function generateRound(difficulty: Difficulty, usedWords: Set<string> = new Set()): SpellingRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter words by difficulty and exclude used words
  const availableWords = SPELLING_WORDS.filter(
    w => w.difficulty <= config.maxWordDifficulty && !usedWords.has(w.word)
  );
  
  // If all words used, reset pool
  const wordPool = availableWords.length > 0 ? availableWords : SPELLING_WORDS.filter(
    w => w.difficulty <= config.maxWordDifficulty
  );
  
  const targetWord = wordPool[Math.floor(Math.random() * wordPool.length)];
  
  // Create letter pool with word letters plus distractors
  const wordLetters = targetWord.word.toUpperCase().split('');
  const distractorCount = Math.ceil(wordLetters.length * config.letterPoolMultiplier) - wordLetters.length;
  
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const distractors: string[] = [];
  
  while (distractors.length < distractorCount) {
    const letter = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!wordLetters.includes(letter) && !distractors.includes(letter)) {
      distractors.push(letter);
    }
  }
  
  const availableLetters = [...wordLetters, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    targetWord,
    availableLetters,
    currentAttempt: [],
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 8): SpellingBeeGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    completed: false,
  };
}

export function checkAnswer(attempt: string[], targetWord: string): boolean {
  return attempt.join('').toLowerCase() === targetWord.toLowerCase();
}

export function processAnswer(
  gameState: SpellingBeeGameState,
  isCorrect: boolean,
  hintsUsed: number
): SpellingBeeGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const points = isCorrect ? 20 + Math.min(gameState.streak * 3, 20) - hintsUsed * 5 : 0;
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + Math.max(0, points),
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    hintsUsed: gameState.hintsUsed + hintsUsed,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: SpellingBeeGameState): number {
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
