/**
 * Magic E Game Logic
 *
 * Learn the silent e pattern (short vs long vowel sounds).
 * Educational focus: phonics, vowel patterns, silent e rule.
 */

export interface MagicEWord {
  shortForm: string;
  longForm: string;
  vowel: string;
  meaning: string;
  emoji: string;
}

export interface MagicERound {
  targetPair: MagicEWord;
  currentWord: 'short' | 'long';
  options: string[];
  correctAnswer: string;
}

export interface MagicEGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  pairsLearned: Set<string>;
  completed: boolean;
}

export const MAGIC_E_PAIRS: MagicEWord[] = [
  // A pairs
  { shortForm: 'cap', longForm: 'cape', vowel: 'a', meaning: 'A cover or headwear', emoji: '🧢' },
  { shortForm: 'tap', longForm: 'tape', vowel: 'a', meaning: 'Sticky strip', emoji: '📼' },
  { shortForm: 'can', longForm: 'cane', vowel: 'a', meaning: 'Walking stick', emoji: '🦯' },
  { shortForm: 'man', longForm: 'mane', vowel: 'a', meaning: 'Lion\'s hair', emoji: '🦁' },
  { shortForm: 'mad', longForm: 'made', vowel: 'a', meaning: 'Created', emoji: '✨' },
  { shortForm: 'rat', longForm: 'rate', vowel: 'a', meaning: 'Speed or grade', emoji: '⭐' },
  { shortForm: 'hat', longForm: 'hate', vowel: 'a', meaning: 'Dislike strongly', emoji: '😠' },
  { shortForm: 'mat', longForm: 'mate', vowel: 'a', meaning: 'Friend or partner', emoji: '👫' },
  { shortForm: 'pan', longForm: 'pane', vowel: 'a', meaning: 'Window glass', emoji: '🪟' },
  { shortForm: 'van', longForm: 'vane', vowel: 'a', meaning: 'Weather indicator', emoji: '🌪️' },
  
  // E pairs
  { shortForm: 'pet', longForm: 'Pete', vowel: 'e', meaning: 'A name', emoji: '👦' },
  { shortForm: 'met', longForm: 'mete', vowel: 'e', meaning: 'To distribute', emoji: '📏' },
  { shortForm: 'bed', longForm: 'bede', vowel: 'e', meaning: 'A prayer', emoji: '🙏' },
  { shortForm: 'red', longForm: 'rede', vowel: 'e', meaning: 'Advice or counsel', emoji: '💭' },
  { shortForm: 'ten', longForm: 'tene', vowel: 'e', meaning: 'A filmy substance', emoji: '🕸️' },
  
  // I pairs
  { shortForm: 'bit', longForm: 'bite', vowel: 'i', meaning: 'To chew', emoji: '🦷' },
  { shortForm: 'kit', longForm: 'kite', vowel: 'i', meaning: 'Flying toy', emoji: '🪁' },
  { shortForm: 'pin', longForm: 'pine', vowel: 'i', meaning: 'Evergreen tree', emoji: '🌲' },
  { shortForm: 'win', longForm: 'wine', vowel: 'i', meaning: 'Grape drink', emoji: '🍷' },
  { shortForm: 'fin', longForm: 'fine', vowel: 'i', meaning: 'Very good', emoji: '👌' },
  { shortForm: 'hid', longForm: 'hide', vowel: 'i', meaning: 'To conceal', emoji: '🙈' },
  { shortForm: 'rid', longForm: 'ride', vowel: 'i', meaning: 'To travel', emoji: '🚗' },
  { shortForm: 'sit', longForm: 'site', vowel: 'i', meaning: 'Location', emoji: '📍' },
  { shortForm: 'cut', longForm: 'cute', vowel: 'u', meaning: 'Adorable', emoji: '😍' },
  
  // O pairs
  { shortForm: 'hop', longForm: 'hope', vowel: 'o', meaning: 'To wish', emoji: '🌟' },
  { shortForm: 'mop', longForm: 'mope', vowel: 'o', meaning: 'To be sad', emoji: '😔' },
  { shortForm: 'cop', longForm: 'cope', vowel: 'o', meaning: 'To manage', emoji: '💪' },
  { shortForm: 'not', longForm: 'note', vowel: 'o', meaning: 'A message', emoji: '📝' },
  { shortForm: 'rod', longForm: 'rode', vowel: 'o', meaning: 'Past tense of ride', emoji: '🐎' },
  { shortForm: 'cod', longForm: 'code', vowel: 'o', meaning: 'Secret language', emoji: '💻' },
  { shortForm: 'con', longForm: 'cone', vowel: 'o', meaning: 'Ice cream holder', emoji: '🍦' },
  { shortForm: 'don', longForm: 'done', vowel: 'o', meaning: 'Finished', emoji: '✅' },
  
  // U pairs
  { shortForm: 'tub', longForm: 'tube', vowel: 'u', meaning: 'Cylindrical pipe', emoji: '🧪' },
  { shortForm: 'cub', longForm: 'cube', vowel: 'u', meaning: '3D square', emoji: '🎲' },
  { shortForm: 'hug', longForm: 'huge', vowel: 'u', meaning: 'Very big', emoji: '🐋' },
  { shortForm: 'rub', longForm: 'rube', vowel: 'u', meaning: 'To scrape or polish', emoji: '🧽' },
  { shortForm: 'tun', longForm: 'tune', vowel: 'u', meaning: 'Musical melody', emoji: '🎵' },
  { shortForm: 'us', longForm: 'use', vowel: 'u', meaning: 'To make use of something', emoji: '🛠️' },
  { shortForm: 'dun', longForm: 'dune', vowel: 'u', meaning: 'Sand hill', emoji: '🏜️' },
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  optionCount: number;
  vowelFilter?: string[];
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    optionCount: 3,
    vowelFilter: ['a', 'i'], // Most common
  },
  medium: {
    optionCount: 4,
    vowelFilter: ['a', 'e', 'i', 'o'], // Most vowels
  },
  hard: {
    optionCount: 4,
    // All pairs including all vowels
  },
};

export function generateRound(
  difficulty: Difficulty,
  usedPairs: Set<string> = new Set()
): MagicERound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter by vowel if specified
  let availablePairs = config.vowelFilter
    ? MAGIC_E_PAIRS.filter(p => config.vowelFilter!.includes(p.vowel))
    : [...MAGIC_E_PAIRS];
  
  // Filter out used pairs
  availablePairs = availablePairs.filter(p => !usedPairs.has(p.longForm));
  
  // If all used, reset
  const pairPool = availablePairs.length > 0 
    ? availablePairs 
    : config.vowelFilter
      ? MAGIC_E_PAIRS.filter(p => config.vowelFilter!.includes(p.vowel))
      : MAGIC_E_PAIRS;
  
  // Select random pair
  const targetPair = pairPool[Math.floor(Math.random() * pairPool.length)];
  
  // Randomly choose which form to show (short or long)
  const currentWord: 'short' | 'long' = Math.random() > 0.5 ? 'short' : 'long';
  const correctAnswer = currentWord === 'short' ? targetPair.longForm : targetPair.shortForm;
  
  // Generate options
  const options = [correctAnswer];
  
  // Add distractors
  const otherPairs = pairPool.filter(p => p.longForm !== targetPair.longForm);
  const shuffled = [...otherPairs].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < config.optionCount - 1 && i < shuffled.length; i++) {
    const distractor = currentWord === 'short' 
      ? shuffled[i].longForm 
      : shuffled[i].shortForm;
    if (!options.includes(distractor)) {
      options.push(distractor);
    }
  }
  
  // Shuffle options
  options.sort(() => Math.random() - 0.5);
  
  return {
    targetPair,
    currentWord,
    options,
    correctAnswer,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 10): MagicEGameState {
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
  gameState: MagicEGameState,
  isCorrect: boolean,
  longForm: string
): MagicEGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 20;
  const streakBonus = Math.min(newStreak * 3, 25);
  const points = isCorrect ? basePoints + streakBonus : 0;
  
  const newPairsLearned = new Set(gameState.pairsLearned);
  if (isCorrect) {
    newPairsLearned.add(longForm);
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

export function calculateAccuracy(gameState: MagicEGameState): number {
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
      return { label: 'Easy (A, I)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (A, E, I, O)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (All vowels)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}

export function getMagicERule(): string {
  return 'Magic E makes the vowel say its name! The E is silent but powerful!';
}

export function speakWordPair(pair: MagicEWord): void {
  if ('speechSynthesis' in window) {
    // Speak short form
    const shortUtterance = new SpeechSynthesisUtterance(pair.shortForm);
    shortUtterance.rate = 0.7;
    shortUtterance.pitch = 1.0;
    
    // Speak long form
    const longUtterance = new SpeechSynthesisUtterance(pair.longForm);
    longUtterance.rate = 0.7;
    longUtterance.pitch = 1.2;
    
    // Chain them
    shortUtterance.onend = () => {
      setTimeout(() => {
        window.speechSynthesis.speak(longUtterance);
      }, 500);
    };
    
    window.speechSynthesis.speak(shortUtterance);
  }
}
