/**
 * Compound Words Game Logic
 *
 * Match word parts to form compound words.
 * Educational focus: vocabulary building, word formation, reading comprehension.
 */

export interface WordPart {
  part: string;
  emoji: string;
  type: 'first' | 'second';
}

export interface CompoundWord {
  firstPart: string;
  secondPart: string;
  fullWord: string;
  emoji: string;
  hint: string;
}

export interface CompoundRound {
  targetWord: CompoundWord;
  firstParts: WordPart[];
  secondParts: WordPart[];
}

export interface CompoundWordsGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  completed: boolean;
}

export const COMPOUND_WORDS: CompoundWord[] = [
  { firstPart: 'sun', secondPart: 'flower', fullWord: 'sunflower', emoji: '🌻', hint: 'A tall yellow flower' },
  { firstPart: 'rain', secondPart: 'bow', fullWord: 'rainbow', emoji: '🌈', hint: 'Colors in the sky after rain' },
  { firstPart: 'butter', secondPart: 'fly', fullWord: 'butterfly', emoji: '🦋', hint: 'A colorful flying insect' },
  { firstPart: 'snow', secondPart: 'man', fullWord: 'snowman', emoji: '⛄', hint: 'Made of snow in winter' },
  { firstPart: 'cup', secondPart: 'cake', fullWord: 'cupcake', emoji: '🧁', hint: 'A small sweet cake' },
  { firstPart: 'tooth', secondPart: 'brush', fullWord: 'toothbrush', emoji: '🪥', hint: 'For cleaning teeth' },
  { firstPart: 'star', secondPart: 'fish', fullWord: 'starfish', emoji: '⭐', hint: 'A sea animal with arms' },
  { firstPart: 'base', secondPart: 'ball', fullWord: 'baseball', emoji: '⚾', hint: 'A sport with bat and ball' },
  { firstPart: 'foot', secondPart: 'ball', fullWord: 'football', emoji: '🏈', hint: 'A popular sport' },
  { firstPart: 'basket', secondPart: 'ball', fullWord: 'basketball', emoji: '🏀', hint: 'Played with hoops' },
  { firstPart: 'water', secondPart: 'melon', fullWord: 'watermelon', emoji: '🍉', hint: 'A big green summer fruit' },
  { firstPart: 'pine', secondPart: 'apple', fullWord: 'pineapple', emoji: '🍍', hint: 'A spiky tropical fruit' },
  { firstPart: 'blue', secondPart: 'berry', fullWord: 'blueberry', emoji: '🫐', hint: 'Small blue fruit' },
  { firstPart: 'straw', secondPart: 'berry', fullWord: 'strawberry', emoji: '🍓', hint: 'Red heart-shaped fruit' },
  { firstPart: 'black', secondPart: 'berry', fullWord: 'blackberry', emoji: '🫐', hint: 'Dark purple berry' },
  { firstPart: 'rasp', secondPart: 'berry', fullWord: 'raspberry', emoji: '🍇', hint: 'Red bumpy berry' },
  { firstPart: 'cran', secondPart: 'berry', fullWord: 'cranberry', emoji: '🫐', hint: 'Sour red berry' },
  { firstPart: 'fire', secondPart: 'man', fullWord: 'fireman', emoji: '🧑‍🚒', hint: 'Fights fires' },
  { firstPart: 'police', secondPart: 'man', fullWord: 'policeman', emoji: '👮', hint: 'Keeps us safe' },
  { firstPart: 'mail', secondPart: 'man', fullWord: 'mailman', emoji: '📬', hint: 'Delivers letters' },
  { firstPart: 'super', secondPart: 'man', fullWord: 'superman', emoji: '🦸', hint: 'A superhero' },
  { firstPart: 'bat', secondPart: 'man', fullWord: 'batman', emoji: '🦇', hint: 'A masked hero' },
  { firstPart: 'spider', secondPart: 'man', fullWord: 'spiderman', emoji: '🕷️', hint: 'Web-slinging hero' },
  { firstPart: 'ice', secondPart: 'cream', fullWord: 'ice cream', emoji: '🍨', hint: 'Cold sweet treat' },
  { firstPart: 'cup', secondPart: 'cake', fullWord: 'cupcake', emoji: '🧁', hint: 'Small frosted cake' },
  { firstPart: 'pan', secondPart: 'cake', fullWord: 'pancake', emoji: '🥞', hint: 'Flat breakfast food' },
  { firstPart: 'birth', secondPart: 'day', fullWord: 'birthday', emoji: '🎂', hint: 'Day you were born' },
  { firstPart: 'to', secondPart: 'day', fullWord: 'today', emoji: '📅', hint: 'This day' },
  { firstPart: 'yes', secondPart: 'terday', fullWord: 'yesterday', emoji: '📅', hint: 'The day before' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionsPerPart: number;
  wordPool: CompoundWord[];
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionsPerPart: 3,
    wordPool: COMPOUND_WORDS.slice(0, 10), // Simple compounds
  },
  medium: {
    optionsPerPart: 4,
    wordPool: COMPOUND_WORDS.slice(0, 20), // More variety
  },
  hard: {
    optionsPerPart: 5,
    wordPool: COMPOUND_WORDS, // All compounds
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedWords: Set<string> = new Set()
): CompoundRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter out used words
  const availableWords = config.wordPool.filter(
    w => !usedWords.has(w.fullWord)
  );
  
  // If all words used, reset pool
  const wordPool = availableWords.length > 0 
    ? availableWords 
    : config.wordPool;
  
  // Select target word
  const targetWord = wordPool[Math.floor(Math.random() * wordPool.length)];
  
  // Get distractors from pool
  const otherWords = config.wordPool.filter(w => w.fullWord !== targetWord.fullWord);
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
  
  // Create first part options (include correct)
  const firstParts: WordPart[] = [{
    part: targetWord.firstPart,
    emoji: targetWord.emoji,
    type: 'first'
  }];
  
  // Add distractor first parts
  for (let i = 0; i < config.optionsPerPart - 1 && i < shuffled.length; i++) {
    if (!firstParts.find(p => p.part === shuffled[i].firstPart)) {
      firstParts.push({
        part: shuffled[i].firstPart,
        emoji: shuffled[i].emoji,
        type: 'first'
      });
    }
  }
  
  // Create second part options (include correct)
  const secondParts: WordPart[] = [{
    part: targetWord.secondPart,
    emoji: targetWord.emoji,
    type: 'second'
  }];
  
  // Add distractor second parts
  const shuffledAgain = [...shuffled].sort(() => Math.random() - 0.5);
  for (let i = 0; i < config.optionsPerPart - 1 && i < shuffledAgain.length; i++) {
    if (!secondParts.find(p => p.part === shuffledAgain[i].secondPart)) {
      secondParts.push({
        part: shuffledAgain[i].secondPart,
        emoji: shuffledAgain[i].emoji,
        type: 'second'
      });
    }
  }
  
  // Shuffle both arrays
  firstParts.sort(() => Math.random() - 0.5);
  secondParts.sort(() => Math.random() - 0.5);
  
  return {
    targetWord,
    firstParts,
    secondParts,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 8): CompoundWordsGameState {
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

export function checkAnswer(
  firstPart: string,
  secondPart: string,
  targetWord: CompoundWord
): boolean {
  return firstPart.toLowerCase() === targetWord.firstPart.toLowerCase() &&
         secondPart.toLowerCase() === targetWord.secondPart.toLowerCase();
}

export function processAnswer(
  gameState: CompoundWordsGameState,
  isCorrect: boolean
): CompoundWordsGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 20;
  const streakBonus = Math.min(newStreak * 3, 25);
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

export function calculateAccuracy(gameState: CompoundWordsGameState): number {
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
