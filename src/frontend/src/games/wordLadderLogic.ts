/**
 * Word Ladder Game Logic
 *
 * Change one letter at a time to form new words.
 * Educational focus: phonics, spelling patterns, word families.
 */

export interface LadderWord {
  word: string;
  emoji: string;
  hint: string;
}

export interface LadderStep {
  fromWord: string;
  toWord: string;
  changePosition: number;
  changeLetter: string;
}

export interface WordLadderRound {
  startWord: LadderWord;
  endWord: LadderWord;
  path: LadderStep[];
  currentStep: number;
  options: string[];
}

export interface WordLadderGameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  hintsUsed: number;
  completed: boolean;
}

// Word ladder chains - each chain is a valid word ladder
export const WORD_LADDERS: LadderWord[][] = [
  // Easy chains (3 letters)
  [
    { word: 'cat', emoji: '🐱', hint: 'A furry pet' },
    { word: 'bat', emoji: '🦇', hint: 'A flying animal' },
    { word: 'bet', emoji: '🎰', hint: 'To gamble' },
    { word: 'bed', emoji: '🛏️', hint: 'You sleep here' },
  ],
  [
    { word: 'dog', emoji: '🐕', hint: 'A loyal pet' },
    { word: 'dig', emoji: '⛏️', hint: 'To make a hole' },
    { word: 'big', emoji: '🐘', hint: 'Not small' },
    { word: 'bag', emoji: '🛍️', hint: 'Carry things in it' },
  ],
  [
    { word: 'sun', emoji: '☀️', hint: 'Shines in sky' },
    { word: 'fun', emoji: '🎉', hint: 'Enjoyable' },
    { word: 'fan', emoji: '🌀', hint: 'Keeps you cool' },
    { word: 'man', emoji: '👨', hint: 'An adult male' },
  ],
  // Medium chains
  [
    { word: 'hat', emoji: '🎩', hint: 'On your head' },
    { word: 'hot', emoji: '🔥', hint: 'Very warm' },
    { word: 'hop', emoji: '🐰', hint: 'Like a bunny' },
    { word: 'mop', emoji: '🧹', hint: 'Cleans floors' },
    { word: 'map', emoji: '🗺️', hint: 'Shows directions' },
  ],
  [
    { word: 'cup', emoji: '☕', hint: 'Drink from it' },
    { word: 'cap', emoji: '🧢', hint: 'Wear on head' },
    { word: 'cat', emoji: '🐱', hint: 'Meows' },
    { word: 'cut', emoji: '✂️', hint: 'Divide with scissors' },
    { word: 'nut', emoji: '🥜', hint: 'Grows on trees' },
  ],
  [
    { word: 'pen', emoji: '🖊️', hint: 'For writing' },
    { word: 'pan', emoji: '🍳', hint: 'For cooking' },
    { word: 'pin', emoji: '📌', hint: 'Holds papers' },
    { word: 'pit', emoji: '🕳️', hint: 'A hole' },
    { word: 'sit', emoji: '🪑', hint: 'Take a seat' },
  ],
  // Hard chains (longer)
  [
    { word: 'ball', emoji: '⚽', hint: 'Round toy' },
    { word: 'call', emoji: '📞', hint: 'Ring someone' },
    { word: 'tall', emoji: '📏', hint: 'Not short' },
    { word: 'talk', emoji: '💬', hint: 'Speak' },
    { word: 'walk', emoji: '🚶', hint: 'Move on feet' },
  ],
  [
    { word: 'cold', emoji: '🥶', hint: 'Not hot' },
    { word: 'cord', emoji: '🔌', hint: 'Connects devices' },
    { word: 'card', emoji: '💳', hint: 'For payments' },
    { word: 'care', emoji: '❤️', hint: 'Look after' },
    { word: 'cure', emoji: '💊', hint: 'Make better' },
  ],
  [
    { word: 'light', emoji: '💡', hint: 'Illuminates' },
    { word: 'night', emoji: '🌙', hint: 'After sunset' },
    { word: 'knight', emoji: '🏰', hint: 'Medieval warrior' },
    { word: 'knit', emoji: '🧶', hint: 'Make with yarn' },
  ],
];

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  chainLengths: number[];
  optionCount: number;
}

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    chainLengths: [3, 4],
    optionCount: 3,
  },
  medium: {
    chainLengths: [4, 5],
    optionCount: 4,
  },
  hard: {
    chainLengths: [5, 6],
    optionCount: 4,
  },
};

function findChangedLetter(from: string, to: string): { position: number; letter: string } | null {
  if (from.length !== to.length) return null;
  
  let changedPosition = -1;
  let changedLetter = '';
  
  for (let i = 0; i < from.length; i++) {
    if (from[i].toLowerCase() !== to[i].toLowerCase()) {
      if (changedPosition !== -1) return null; // More than one change
      changedPosition = i;
      changedLetter = to[i];
    }
  }
  
  return changedPosition !== -1 ? { position: changedPosition, letter: changedLetter } : null;
}

function generateOptions(targetWord: string, allWords: string[], count: number): string[] {
  const options = [targetWord];
  const shuffled = allWords
    .filter(w => w !== targetWord && w.length === targetWord.length)
    .sort(() => Math.random() - 0.5);
  
  for (const word of shuffled) {
    if (options.length >= count) break;
    // Only add words that differ by one letter
    const change = findChangedLetter(targetWord, word);
    if (change) {
      options.push(word);
    }
  }
  
  // If we don't have enough, add random words
  while (options.length < count) {
    const randomWord = shuffled[Math.floor(Math.random() * shuffled.length)];
    if (!options.includes(randomWord)) {
      options.push(randomWord);
    }
  }
  
  return options.sort(() => Math.random() - 0.5);
}

export function generateRound(
  difficulty: Difficulty,
  usedLadders: Set<number> = new Set()
): WordLadderRound {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Filter available ladders
  const availableLadders = WORD_LADDERS
    .map((ladder, index) => ({ ladder, index }))
    .filter(({ ladder }) => config.chainLengths.includes(ladder.length))
    .filter(({ index }) => !usedLadders.has(index));
  
  // If all used, reset
  const ladders = availableLadders.length > 0 
    ? availableLadders 
    : WORD_LADDERS
        .map((ladder, index) => ({ ladder, index }))
        .filter(({ ladder }) => config.chainLengths.includes(ladder.length));
  
  const { ladder: selectedLadder } = ladders[Math.floor(Math.random() * ladders.length)];
  
  // Build steps
  const path: LadderStep[] = [];
  for (let i = 0; i < selectedLadder.length - 1; i++) {
    const change = findChangedLetter(selectedLadder[i].word, selectedLadder[i + 1].word);
    if (change) {
      path.push({
        fromWord: selectedLadder[i].word,
        toWord: selectedLadder[i + 1].word,
        changePosition: change.position,
        changeLetter: change.letter,
      });
    }
  }
  
  // Get all words for option generation
  const allWords = WORD_LADDERS.flatMap(l => l.map(w => w.word));
  const options = generateOptions(selectedLadder[1].word, allWords, config.optionCount);
  
  return {
    startWord: selectedLadder[0],
    endWord: selectedLadder[selectedLadder.length - 1],
    path,
    currentStep: 0,
    options,
  };
}

export function initializeGame(_difficulty: Difficulty, totalRounds: number = 5): WordLadderGameState {
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

export function checkAnswer(selectedWord: string, targetWord: string): boolean {
  return selectedWord.toLowerCase() === targetWord.toLowerCase();
}

export function processAnswer(
  gameState: WordLadderGameState,
  isCorrect: boolean,
  hintsUsed: number
): WordLadderGameState {
  const newStreak = isCorrect ? gameState.streak + 1 : 0;
  const basePoints = 25;
  const streakBonus = Math.min(newStreak * 4, 30);
  const hintPenalty = hintsUsed * 5;
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

export function calculateAccuracy(gameState: WordLadderGameState): number {
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
      return { label: 'Easy (3-4 steps)', color: 'text-green-500' };
    case 'medium':
      return { label: 'Medium (4-5 steps)', color: 'text-yellow-500' };
    case 'hard':
      return { label: 'Hard (5-6 steps)', color: 'text-red-500' };
    default:
      return { label: 'Unknown', color: 'text-gray-500' };
  }
}
