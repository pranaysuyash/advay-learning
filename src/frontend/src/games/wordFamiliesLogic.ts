/**
 * Word Families Game Logic
 *
 * Drag-and-drop word building game where children match words to word families.
 * Educational focus: phonological awareness, word patterns, reading fluency.
 */

export interface WordFamily {
  family: string;      // -at, -an, -ig, etc.
  words: FamilyWord[];
  emoji: string;
}

export interface FamilyWord {
  word: string;
  emoji: string;
  hint: string;
}

export interface WordFamiliesRound {
  targetFamily: WordFamily;
  options: FamilyWord[];
  correctWords: string[];
}

export interface WordFamiliesGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  wordsFound: Set<string>;
  completed: boolean;
}

export const WORD_FAMILIES: WordFamily[] = [
  {
    family: '-at',
    emoji: '🐱',
    words: [
      { word: 'cat', emoji: '🐱', hint: 'A furry pet' },
      { word: 'bat', emoji: '🦇', hint: 'A flying animal' },
      { word: 'hat', emoji: '🎩', hint: 'You wear it' },
      { word: 'mat', emoji: '🧘', hint: 'On the floor' },
      { word: 'rat', emoji: '🐀', hint: 'A small rodent' },
    ],
  },
  {
    family: '-an',
    emoji: '🥫',
    words: [
      { word: 'can', emoji: '🥫', hint: 'Holds food' },
      { word: 'fan', emoji: '🌀', hint: 'Keeps you cool' },
      { word: 'man', emoji: '👨', hint: 'A person' },
      { word: 'pan', emoji: '🍳', hint: 'For cooking' },
      { word: 'van', emoji: '🚐', hint: 'A vehicle' },
    ],
  },
  {
    family: '-ig',
    emoji: '🐷',
    words: [
      { word: 'big', emoji: '🐘', hint: 'Not small' },
      { word: 'pig', emoji: '🐷', hint: 'Oink oink!' },
      { word: 'dig', emoji: '⛏️', hint: 'In the dirt' },
      { word: 'fig', emoji: '🍈', hint: 'A fruit' },
      { word: 'wig', emoji: '👩‍🦰', hint: 'Fake hair' },
    ],
  },
  {
    family: '-op',
    emoji: '🏆',
    words: [
      { word: 'top', emoji: '🏆', hint: 'Number one' },
      { word: 'hop', emoji: '🐰', hint: 'Like a bunny' },
      { word: 'pop', emoji: '🎈', hint: 'Goes bang!' },
      { word: 'mop', emoji: '🧹', hint: 'Cleans floors' },
      { word: 'cop', emoji: '👮', hint: 'Police officer' },
    ],
  },
  {
    family: '-ug',
    emoji: '🐛',
    words: [
      { word: 'bug', emoji: '🐛', hint: 'A tiny insect' },
      { word: 'hug', emoji: '🤗', hint: 'Show love' },
      { word: 'mug', emoji: '☕', hint: 'Drink from it' },
      { word: 'rug', emoji: '🧶', hint: 'On the floor' },
      { word: 'jug', emoji: '🏺', hint: 'Holds liquid' },
    ],
  },
  {
    family: '-et',
    emoji: '🐕',
    words: [
      { word: 'pet', emoji: '🐕', hint: 'An animal friend' },
      { word: 'net', emoji: '🕸️', hint: 'Catches things' },
      { word: 'jet', emoji: '✈️', hint: 'Flies fast' },
      { word: 'wet', emoji: '💧', hint: 'Not dry' },
      { word: 'get', emoji: '🎁', hint: 'To receive' },
    ],
  },
  {
    family: '-en',
    emoji: '🐔',
    words: [
      { word: 'hen', emoji: '🐔', hint: 'A chicken' },
      { word: 'pen', emoji: '🖊️', hint: 'For writing' },
      { word: 'ten', emoji: '🔟', hint: 'The number' },
      { word: 'men', emoji: '👥', hint: 'Plural man' },
      { word: 'den', emoji: '🦁', hint: 'A cave' },
    ],
  },
  {
    family: '-it',
    emoji: '💡',
    words: [
      { word: 'sit', emoji: '🪑', hint: 'Take a seat' },
      { word: 'hit', emoji: '👊', hint: 'To strike' },
      { word: 'lit', emoji: '💡', hint: 'On fire' },
      { word: 'bit', emoji: '🤏', hint: 'A small piece' },
      { word: 'kit', emoji: '🎒', hint: 'A set of tools' },
    ],
  },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  familiesPerRound: number;
  wordsPerFamily: number;
  distractors: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    familiesPerRound: 2,
    wordsPerFamily: 3,
    distractors: 2,
  },
  medium: {
    familiesPerRound: 3,
    wordsPerFamily: 4,
    distractors: 3,
  },
  hard: {
    familiesPerRound: 4,
    wordsPerFamily: 5,
    distractors: 4,
  },
};

export function generateRound(difficulty: Difficulty): WordFamiliesRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Select random family
  const targetFamily = WORD_FAMILIES[Math.floor(Math.random() * WORD_FAMILIES.length)];
  
  // Get words from target family
  const targetWords = [...targetFamily.words]
    .sort(() => Math.random() - 0.5)
    .slice(0, config.wordsPerFamily);
  
  // Get distractors from other families
  const otherFamilies = WORD_FAMILIES.filter(f => f.family !== targetFamily.family);
  const distractors: FamilyWord[] = [];
  
  while (distractors.length < config.distractors && otherFamilies.length > 0) {
    const randomFamily = otherFamilies[Math.floor(Math.random() * otherFamilies.length)];
    const randomWord = randomFamily.words[Math.floor(Math.random() * randomFamily.words.length)];
    if (!distractors.find(d => d.word === randomWord.word)) {
      distractors.push(randomWord);
    }
  }
  
  // Combine and shuffle options
  const options = [...targetWords, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    targetFamily,
    options,
    correctWords: targetWords.map(w => w.word),
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 8): WordFamiliesGameState {
  return {
    currentRound: 0,
    totalRounds,
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    wordsFound: new Set(),
    completed: false,
  };
}

export function checkAnswer(word: string, correctWords: string[]): boolean {
  return correctWords.includes(word.toLowerCase());
}

export function processAnswer(
  gameState: WordFamiliesGameState,
  word: string,
  isCorrect: boolean,
  family: string
): WordFamiliesGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const points = isCorrect ? 15 + Math.min(gameState.streak * 2, 20) : 0;
  
  const newWordsFound = new Set(gameState.wordsFound);
  if (isCorrect) {
    newWordsFound.add(`${family}:${word.toLowerCase()}`);
  }
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    wordsFound: newWordsFound,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function calculateAccuracy(gameState: WordFamiliesGameState): number {
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
