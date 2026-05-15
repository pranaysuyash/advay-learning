/**
 * Sentence Builder Game Logic
 *
 * Arrange words into sentences.
 * Educational focus: grammar, sentence structure, reading comprehension.
 */

export interface WordCard {
  word: string;
  type: 'article' | 'noun' | 'verb' | 'adjective' | 'preposition' | 'adverb';
  emoji?: string;
}

export interface SentenceTemplate {
  template: string;
  words: WordCard[];
  hint: string;
  emoji: string;
}

export interface SentenceRound {
  template: SentenceTemplate;
  scrambledWords: WordCard[];
  correctOrder: number[];
}

export interface SentenceBuilderGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  hintsUsed: number;
  completed: boolean;
}

// Simple sentence templates for kids
export const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  {
    template: 'ARTICLE ADJECTIVE NOUN VERB',
    words: [
      { word: 'The', type: 'article' },
      { word: 'big', type: 'adjective', emoji: '🐘' },
      { word: 'dog', type: 'noun', emoji: '🐕' },
      { word: 'runs', type: 'verb', emoji: '🏃' },
    ],
    hint: 'A big dog running',
    emoji: '🐕',
  },
  {
    template: 'ARTICLE NOUN VERB ADVERB',
    words: [
      { word: 'The', type: 'article' },
      { word: 'cat', type: 'noun', emoji: '🐱' },
      { word: 'sleeps', type: 'verb', emoji: '😴' },
      { word: 'softly', type: 'adverb' },
    ],
    hint: 'A sleeping cat',
    emoji: '🐱',
  },
  {
    template: 'ARTICLE ADJECTIVE NOUN VERB',
    words: [
      { word: 'A', type: 'article' },
      { word: 'happy', type: 'adjective', emoji: '😊' },
      { word: 'bird', type: 'noun', emoji: '🐦' },
      { word: 'sings', type: 'verb', emoji: '🎵' },
    ],
    hint: 'A happy singing bird',
    emoji: '🐦',
  },
  {
    template: 'ARTICLE NOUN VERB PREPOSITION ARTICLE NOUN',
    words: [
      { word: 'The', type: 'article' },
      { word: 'ball', type: 'noun', emoji: '⚽' },
      { word: 'is', type: 'verb' },
      { word: 'under', type: 'preposition', emoji: '⬇️' },
      { word: 'the', type: 'article' },
      { word: 'table', type: 'noun', emoji: '🪑' },
    ],
    hint: 'Ball under the table',
    emoji: '⚽',
  },
  {
    template: 'ARTICLE ADJECTIVE NOUN VERB',
    words: [
      { word: 'The', type: 'article' },
      { word: 'red', type: 'adjective', emoji: '🔴' },
      { word: 'apple', type: 'noun', emoji: '🍎' },
      { word: 'falls', type: 'verb', emoji: '🍂' },
    ],
    hint: 'A red apple falling',
    emoji: '🍎',
  },
  {
    template: 'ARTICLE NOUN VERB ADJECTIVE',
    words: [
      { word: 'My', type: 'article' },
      { word: 'mom', type: 'noun', emoji: '👩' },
      { word: 'is', type: 'verb' },
      { word: 'kind', type: 'adjective', emoji: '❤️' },
    ],
    hint: 'A kind mom',
    emoji: '👩',
  },
  {
    template: 'ARTICLE NOUN VERB PREPOSITION ARTICLE NOUN',
    words: [
      { word: 'The', type: 'article' },
      { word: 'sun', type: 'noun', emoji: '☀️' },
      { word: 'shines', type: 'verb', emoji: '✨' },
      { word: 'in', type: 'preposition' },
      { word: 'the', type: 'article' },
      { word: 'sky', type: 'noun', emoji: '🌤️' },
    ],
    hint: 'Sun in the sky',
    emoji: '☀️',
  },
  {
    template: 'ARTICLE ADJECTIVE NOUN VERB ADVERB',
    words: [
      { word: 'A', type: 'article' },
      { word: 'small', type: 'adjective', emoji: '🐜' },
      { word: 'fish', type: 'noun', emoji: '🐟' },
      { word: 'swims', type: 'verb', emoji: '🏊' },
      { word: 'fast', type: 'adverb', emoji: '⚡' },
    ],
    hint: 'A small fish swimming fast',
    emoji: '🐟',
  },
  {
    template: 'ARTICLE NOUN VERB PREPOSITION ARTICLE NOUN',
    words: [
      { word: 'The', type: 'article' },
      { word: 'car', type: 'noun', emoji: '🚗' },
      { word: 'drives', type: 'verb', emoji: '🚗' },
      { word: 'on', type: 'preposition' },
      { word: 'the', type: 'article' },
      { word: 'road', type: 'noun', emoji: '🛣️' },
    ],
    hint: 'Car on the road',
    emoji: '🚗',
  },
  {
    template: 'ARTICLE ADJECTIVE NOUN VERB',
    words: [
      { word: 'A', type: 'article' },
      { word: 'pretty', type: 'adjective', emoji: '🌸' },
      { word: 'flower', type: 'noun', emoji: '🌺' },
      { word: 'grows', type: 'verb', emoji: '🌱' },
    ],
    hint: 'A pretty flower growing',
    emoji: '🌸',
  },
  {
    template: 'ARTICLE NOUN VERB ADJECTIVE',
    words: [
      { word: 'The', type: 'article' },
      { word: 'pizza', type: 'noun', emoji: '🍕' },
      { word: 'is', type: 'verb' },
      { word: 'hot', type: 'adjective', emoji: '🔥' },
    ],
    hint: 'Hot pizza',
    emoji: '🍕',
  },
  {
    template: 'ARTICLE NOUN VERB PREPOSITION ARTICLE NOUN',
    words: [
      { word: 'A', type: 'article' },
      { word: 'bee', type: 'noun', emoji: '🐝' },
      { word: 'lands', type: 'verb', emoji: '🛬' },
      { word: 'on', type: 'preposition' },
      { word: 'a', type: 'article' },
      { word: 'rose', type: 'noun', emoji: '🌹' },
    ],
    hint: 'Bee on a rose',
    emoji: '🐝',
  },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  sentenceCount: number;
  maxWords: number;
  hintPenalty: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    sentenceCount: 4,
    maxWords: 4,
    hintPenalty: 2,
  },
  medium: {
    sentenceCount: 6,
    maxWords: 5,
    hintPenalty: 3,
  },
  hard: {
    sentenceCount: 8,
    maxWords: 6,
    hintPenalty: 5,
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedSentences: Set<number> = new Set()
): SentenceRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter templates by word count and usage
  const availableTemplates = SENTENCE_TEMPLATES
    .map((t, index) => ({ template: t, index }))
    .filter(({ template }) => template.words.length <= config.maxWords)
    .filter(({ index }) => !usedSentences.has(index));
  
  // If all used, reset
  const templates = availableTemplates.length > 0
    ? availableTemplates
    : SENTENCE_TEMPLATES
        .map((t, index) => ({ template: t, index }))
        .filter(({ template }) => template.words.length <= config.maxWords);
  
  const { template: selectedTemplate } = templates[Math.floor(Math.random() * templates.length)];
  
  // Create correct order (identity for now - actual order is template order)
  const correctOrder = selectedTemplate.words.map((_, i) => i);
  
  // Scramble words
  const scrambledWords = [...selectedTemplate.words].sort(() => Math.random() - 0.5);
  
  return {
    template: selectedTemplate,
    scrambledWords,
    correctOrder,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 6): SentenceBuilderGameState {
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

export function checkAnswer(
  userOrder: number[],
  correctOrder: number[]
): boolean {
  if (userOrder.length !== correctOrder.length) return false;
  return userOrder.every((val, index) => val === correctOrder[index]);
}

export function processAnswer(
  gameState: SentenceBuilderGameState,
  isCorrect: boolean,
  hintsUsed: number
): SentenceBuilderGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 25;
  const streakBonus = Math.min(newStreak * 4, 30);
  const hintPenalty = hintsUsed * DIFFICULTY_CONFIGS.easy.hintPenalty;
  const points = isCorrect ? Math.max(0, basePoints + streakBonus - hintPenalty) : 0;
  
  return {
    ...gameState,
    currentRound: gameState.currentRound + 1,
    score: gameState.score + points,
    streak: newStreak,
    maxStreak: Math.max(gameState.maxStreak, newStreak),
    correctAnswers: isCorrect ? gameState.correctAnswers + 1 : gameState.correctAnswers,
    hintsUsed: gameState.hintsUsed + hintsUsed,
    completed: gameState.currentRound + 1 >= gameState.totalRounds,
  };
}

export function getHint(
  scrambledWords: WordCard[],
  correctOrder: number[],
  revealedCount: number
): { index: number; word: WordCard } | null {
  if (revealedCount >= correctOrder.length) return null;

  const scrambledIndex = scrambledWords.findIndex(
    (_, i) => correctOrder.indexOf(i) === revealedCount
  );
  
  return scrambledIndex !== -1 
    ? { index: scrambledIndex, word: scrambledWords[scrambledIndex] }
    : null;
}

export function calculateAccuracy(gameState: SentenceBuilderGameState): number {
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
      return { label: 'Easy (4 words)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (5 words)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (6 words)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}
