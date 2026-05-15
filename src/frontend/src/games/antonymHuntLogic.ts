/**
 * Antonym Hunt Game Logic
 *
 * Find the opposite word - similar to Opposites Attract but with hunting/adventure theme.
 * Educational focus: antonyms, vocabulary, word relationships.
 */

export interface AntonymPair {
  word: string;
  antonym: string;
  wordEmoji: string;
  antonymEmoji: string;
  category: string;
}

export interface AntonymRound {
  targetWord: AntonymPair;
  options: string[];
  correctAnswer: string;
}

export interface AntonymHuntGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  pairsFound: Set<string>;
  completed: boolean;
}

export const ANTONYM_PAIRS: AntonymPair[] = [
  // Size
  { word: 'big', antonym: 'small', wordEmoji: '🐘', antonymEmoji: '🐜', category: 'Size' },
  { word: 'tall', antonym: 'short', wordEmoji: '🦒', antonymEmoji: '🐹', category: 'Size' },
  { word: 'wide', antonym: 'narrow', wordEmoji: '🛣️', antonymEmoji: '🔍', category: 'Size' },
  { word: 'huge', antonym: 'tiny', wordEmoji: '🐋', antonymEmoji: '🦠', category: 'Size' },
  { word: 'long', antonym: 'short', wordEmoji: '🐍', antonymEmoji: '🐁', category: 'Size' },
  
  // Temperature
  { word: 'hot', antonym: 'cold', wordEmoji: '🔥', antonymEmoji: '❄️', category: 'Temperature' },
  { word: 'warm', antonym: 'cool', wordEmoji: '☀️', antonymEmoji: '🌬️', category: 'Temperature' },
  
  // Speed
  { word: 'fast', antonym: 'slow', wordEmoji: '⚡', antonymEmoji: '🐢', category: 'Speed' },
  { word: 'quick', antonym: 'slow', wordEmoji: '🏃', antonymEmoji: '🚶', category: 'Speed' },
  { word: 'hurry', antonym: 'wait', wordEmoji: '⏰', antonymEmoji: '🛑', category: 'Speed' },
  
  // Emotions
  { word: 'happy', antonym: 'sad', wordEmoji: '😊', antonymEmoji: '😢', category: 'Emotions' },
  { word: 'joy', antonym: 'grief', wordEmoji: '🎉', antonymEmoji: '😭', category: 'Emotions' },
  { word: 'love', antonym: 'hate', wordEmoji: '❤️', antonymEmoji: '💔', category: 'Emotions' },
  { word: 'calm', antonym: 'angry', wordEmoji: '😌', antonymEmoji: '😠', category: 'Emotions' },
  { word: 'brave', antonym: 'scared', wordEmoji: '🦸', antonymEmoji: '😨', category: 'Emotions' },
  
  // Direction
  { word: 'up', antonym: 'down', wordEmoji: '⬆️', antonymEmoji: '⬇️', category: 'Direction' },
  { word: 'left', antonym: 'right', wordEmoji: '⬅️', antonymEmoji: '➡️', category: 'Direction' },
  { word: 'front', antonym: 'back', wordEmoji: '🚪', antonymEmoji: '🔙', category: 'Direction' },
  { word: 'north', antonym: 'south', wordEmoji: '⬆️', antonymEmoji: '⬇️', category: 'Direction' },
  { word: 'east', antonym: 'west', wordEmoji: '➡️', antonymEmoji: '⬅️', category: 'Direction' },
  
  // State
  { word: 'open', antonym: 'closed', wordEmoji: '📖', antonymEmoji: '📕', category: 'State' },
  { word: 'awake', antonym: 'asleep', wordEmoji: '👀', antonymEmoji: '😴', category: 'State' },
  { word: 'alive', antonym: 'dead', wordEmoji: '❤️', antonymEmoji: '💀', category: 'State' },
  { word: 'full', antonym: 'empty', wordEmoji: '🥤', antonymEmoji: '🫙', category: 'State' },
  { word: 'dirty', antonym: 'clean', wordEmoji: '😷', antonymEmoji: '✨', category: 'State' },
  { word: 'wet', antonym: 'dry', wordEmoji: '💧', antonymEmoji: '🏜️', category: 'State' },
  
  // Time
  { word: 'day', antonym: 'night', wordEmoji: '☀️', antonymEmoji: '🌙', category: 'Time' },
  { word: 'morning', antonym: 'evening', wordEmoji: '🌅', antonymEmoji: '🌆', category: 'Time' },
  { word: 'early', antonym: 'late', wordEmoji: '🌅', antonymEmoji: '🌆', category: 'Time' },
  { word: 'now', antonym: 'later', wordEmoji: '⏰', antonymEmoji: '⏳', category: 'Time' },
  { word: 'young', antonym: 'old', wordEmoji: '👶', antonymEmoji: '👴', category: 'Time' },
  
  // Quality
  { word: 'easy', antonym: 'hard', wordEmoji: '✅', antonymEmoji: '⛰️', category: 'Quality' },
  { word: 'good', antonym: 'bad', wordEmoji: '👍', antonymEmoji: '👎', category: 'Quality' },
  { word: 'beautiful', antonym: 'ugly', wordEmoji: '💎', antonymEmoji: '🤢', category: 'Quality' },
  { word: 'rich', antonym: 'poor', wordEmoji: '💰', antonymEmoji: '💸', category: 'Quality' },
  { word: 'smart', antonym: 'dumb', wordEmoji: '🧠', antonymEmoji: '🤯', category: 'Quality' },
  
  // Action
  { word: 'push', antonym: 'pull', wordEmoji: '🙌', antonymEmoji: '🤲', category: 'Action' },
  { word: 'start', antonym: 'stop', wordEmoji: '▶️', antonymEmoji: '⏹️', category: 'Action' },
  { word: 'win', antonym: 'lose', wordEmoji: '🏆', antonymEmoji: '😔', category: 'Action' },
  { word: 'give', antonym: 'take', wordEmoji: '🎁', antonymEmoji: '🤲', category: 'Action' },
  { word: 'build', antonym: 'destroy', wordEmoji: '🏗️', antonymEmoji: '🏚️', category: 'Action' },
  
  // Others
  { word: 'loud', antonym: 'quiet', wordEmoji: '🔊', antonymEmoji: '🔇', category: 'Sound' },
  { word: 'near', antonym: 'far', wordEmoji: '📍', antonymEmoji: '🌎', category: 'Distance' },
  { word: 'new', antonym: 'old', wordEmoji: '🆕', antonymEmoji: '📜', category: 'Age' },
  { word: 'inside', antonym: 'outside', wordEmoji: '🏠', antonymEmoji: '🌳', category: 'Location' },
  { word: 'together', antonym: 'apart', wordEmoji: '👫', antonymEmoji: '🚶‍♂️', category: 'Togetherness' },
  { word: 'add', antonym: 'subtract', wordEmoji: '➕', antonymEmoji: '➖', category: 'Math' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  categoryRestriction?: boolean;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
  },
  medium: {
    optionCount: 4,
  },
  hard: {
    optionCount: 6,
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedPairs: Set<string> = new Set()
): AntonymRound {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Filter out used pairs
  const availablePairs = ANTONYM_PAIRS.filter(
    p => !usedPairs.has(p.word)
  );

  // If all pairs used, reset pool
  const pairPool = availablePairs.length > 0
    ? availablePairs
    : ANTONYM_PAIRS;

  // Select random pair
  const targetWord = pairPool[Math.floor(Math.random() * pairPool.length)];

  // Generate options including correct antonym
  const options = [targetWord.antonym];

  // Add distractors from other pairs
  const otherPairs = pairPool.filter(p => p.word !== targetWord.word);
  const shuffled = [...otherPairs].sort(() => Math.random() - 0.5);

  for (let i = 0; i < config.optionCount - 1 && i < shuffled.length; i++) {
    // Mix between antonyms and words for more challenge
    const distractor = Math.random() > 0.5 ? shuffled[i].antonym : shuffled[i].word;
    if (!options.includes(distractor)) {
      options.push(distractor);
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return {
    targetWord,
    options,
    correctAnswer: targetWord.antonym,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): AntonymHuntGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    pairsFound: new Set(),
    completed: false,
  };
}

export function checkAnswer(selectedWord: string, correctWord: string): boolean {
  return selectedWord.toLowerCase() === correctWord.toLowerCase();
}

export function processAnswer(
  gameState: AntonymHuntGameState,
  isCorrect: boolean,
  word: string
): AntonymHuntGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 15;
  const streakBonus = Math.min(newStreak * 2, 20);
  const points = isCorrect ? basePoints + streakBonus : 0;

  const newPairsFound = new Set(gameState.pairsFound);
  if (isCorrect) {
    newPairsFound.add(word);
  }

  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    pairsFound: newPairsFound,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: AntonymHuntGameState): number {
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

export function getHuntProgress(found: number, total: number): string {
  const percent = Math.round((found / total) * 100);
  if (percent === 100) return '🏆 Hunt Master!';
  if (percent >= 75) return '🔥 Expert Hunter!';
  if (percent >= 50) return '⚡ Skilled Hunter!';
  if (percent >= 25) return '🔍 Learning to Hunt!';
  return '🎯 Beginner Hunter!';
}
