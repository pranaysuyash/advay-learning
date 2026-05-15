/**
 * Opposites Attract Game Logic
 *
 * Match antonyms (opposites) to learn vocabulary.
 * Educational focus: antonyms, vocabulary expansion, word relationships.
 */

export interface OppositePair {
  word: string;
  opposite: string;
  wordEmoji: string;
  oppositeEmoji: string;
  hint: string;
}

export interface OppositesRound {
  targetWord: OppositePair;
  options: string[];
  correctAnswer: string;
}

export interface OppositesAttractGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  pairsLearned: Set<string>;
  completed: boolean;
}

export const OPPOSITE_PAIRS: OppositePair[] = [
  { word: 'big', opposite: 'small', wordEmoji: '🐘', oppositeEmoji: '🐜', hint: 'Size opposites' },
  { word: 'hot', opposite: 'cold', wordEmoji: '🔥', oppositeEmoji: '❄️', hint: 'Temperature opposites' },
  { word: 'fast', opposite: 'slow', wordEmoji: '⚡', oppositeEmoji: '🐢', hint: 'Speed opposites' },
  { word: 'happy', opposite: 'sad', wordEmoji: '😊', oppositeEmoji: '😢', hint: 'Feeling opposites' },
  { word: 'up', opposite: 'down', wordEmoji: '⬆️', oppositeEmoji: '⬇️', hint: 'Direction opposites' },
  { word: 'open', opposite: 'closed', wordEmoji: '🚪', oppositeEmoji: '🔒', hint: 'State opposites' },
  { word: 'day', opposite: 'night', wordEmoji: '☀️', oppositeEmoji: '🌙', hint: 'Time opposites' },
  { word: 'tall', opposite: 'short', wordEmoji: '🦒', oppositeEmoji: '🐹', hint: 'Height opposites' },
  { word: 'loud', opposite: 'quiet', wordEmoji: '🔊', oppositeEmoji: '🔇', hint: 'Volume opposites' },
  { word: 'clean', opposite: 'dirty', wordEmoji: '🧼', oppositeEmoji: '😷', hint: 'Cleanliness opposites' },
  { word: 'old', opposite: 'young', wordEmoji: '👴', oppositeEmoji: '👶', hint: 'Age opposites' },
  { word: 'heavy', opposite: 'light', wordEmoji: '🏋️', oppositeEmoji: '🪶', hint: 'Weight opposites' },
  { word: 'full', opposite: 'empty', wordEmoji: '🥤', oppositeEmoji: '🫙', hint: 'Fill level opposites' },
  { word: 'early', opposite: 'late', wordEmoji: '🌅', oppositeEmoji: '🌆', hint: 'Time opposites' },
  { word: 'rich', opposite: 'poor', wordEmoji: '💰', oppositeEmoji: '💸', hint: 'Wealth opposites' },
  { word: 'easy', opposite: 'hard', wordEmoji: '✅', oppositeEmoji: '⛰️', hint: 'Difficulty opposites' },
  { word: 'near', opposite: 'far', wordEmoji: '📍', oppositeEmoji: '🌎', hint: 'Distance opposites' },
  { word: 'strong', opposite: 'weak', wordEmoji: '💪', oppositeEmoji: '🥀', hint: 'Strength opposites' },
  { word: 'wet', opposite: 'dry', wordEmoji: '💧', oppositeEmoji: '🏜️', hint: 'Moisture opposites' },
  { word: 'new', opposite: 'old', wordEmoji: '🆕', oppositeEmoji: '📜', hint: 'Age opposites' },
  { word: 'good', opposite: 'bad', wordEmoji: '👍', oppositeEmoji: '👎', hint: 'Quality opposites' },
  { word: 'high', opposite: 'low', wordEmoji: '🏔️', oppositeEmoji: '🏝️', hint: 'Elevation opposites' },
  { word: 'wide', opposite: 'narrow', wordEmoji: '🛣️', oppositeEmoji: '🔍', hint: 'Width opposites' },
  { word: 'start', opposite: 'finish', wordEmoji: '🏁', oppositeEmoji: '🏆', hint: 'Beginning/end opposites' },
  { word: 'push', opposite: 'pull', wordEmoji: '🙌', oppositeEmoji: '🤲', hint: 'Action opposites' },
  { word: 'inside', opposite: 'outside', wordEmoji: '🏠', oppositeEmoji: '🌳', hint: 'Location opposites' },
  { word: 'win', opposite: 'lose', wordEmoji: '🏅', oppositeEmoji: '😔', hint: 'Outcome opposites' },
  { word: 'add', opposite: 'subtract', wordEmoji: '➕', oppositeEmoji: '➖', hint: 'Math opposites' },
  { word: 'multiply', opposite: 'divide', wordEmoji: '✖️', oppositeEmoji: '➗', hint: 'Math opposites' },
  { word: 'awake', opposite: 'asleep', wordEmoji: '👀', oppositeEmoji: '😴', hint: 'Consciousness opposites' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  wordPool: OppositePair[];
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    wordPool: OPPOSITE_PAIRS.slice(0, 15), // Simple, common opposites
  },
  medium: {
    optionCount: 4,
    wordPool: OPPOSITE_PAIRS.slice(0, 25), // More variety
  },
  hard: {
    optionCount: 6,
    wordPool: OPPOSITE_PAIRS, // All pairs including challenging ones
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedPairs: Set<string> = new Set()
): OppositesRound {
  const config = DIFFICULTY_CONFIGS[difficulty];

  // Filter out used pairs
  const availablePairs = config.wordPool.filter(
    p => !usedPairs.has(p.word)
  );

  // If all pairs used, reset pool
  const pairPool = availablePairs.length > 0
    ? availablePairs
    : config.wordPool;

  // Select random pair
  const targetWord = pairPool[Math.floor(Math.random() * pairPool.length)];

  // Generate options including correct opposite
  const options = [targetWord.opposite];

  // Add distractors from other pairs
  const otherPairs = pairPool.filter(p => p.word !== targetWord.word);
  const shuffled = [...otherPairs].sort(() => Math.random() - 0.5);

  for (let i = 0; i < config.optionCount - 1 && i < shuffled.length; i++) {
    // Mix between opposites and words for more challenge
    const distractor = Math.random() > 0.5 ? shuffled[i].opposite : shuffled[i].word;
    if (!options.includes(distractor)) {
      options.push(distractor);
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return {
    targetWord,
    options,
    correctAnswer: targetWord.opposite,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): OppositesAttractGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    pairsLearned: new Set(),
    completed: false,
  };
}

export function checkAnswer(selectedWord: string, correctWord: string): boolean {
  return selectedWord.toLowerCase() === correctWord.toLowerCase();
}

export function processAnswer(
  gameState: OppositesAttractGameState,
  isCorrect: boolean,
  word: string
): OppositesAttractGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 15;
  const streakBonus = Math.min(newStreak * 2, 20);
  const points = isCorrect ? basePoints + streakBonus : 0;

  const newPairsLearned = new Set(gameState.pairsLearned);
  if (isCorrect) {
    newPairsLearned.add(word);
  }

  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    pairsLearned: newPairsLearned,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: OppositesAttractGameState): number {
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
