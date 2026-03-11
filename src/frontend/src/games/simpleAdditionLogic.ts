/**
 * Simple Addition Game Logic
 * 
 * Kids solve addition problems with visual representations.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AdditionProblem {
  num1: number;
  num2: number;
  sum: number;
  options: number[];
  visualType: string;
}

export interface GameState {
  status: 'idle' | 'playing' | 'wrong' | 'complete';
  difficulty: Difficulty;
  currentProblem: AdditionProblem | null;
  problemsSolved: number;
  totalProblems: number;
  score: number;
  streak: number;
  timeLeft: number;
  startTime: number;
}

const VISUAL_TYPES = ['apple', 'star', 'block', 'ball', 'candy'];

export function getDifficultyName(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'Easy (Sum to 5)';
    case 'medium': return 'Medium (Sum to 10)';
    case 'hard': return 'Hard (Sum to 20)';
    default: return difficulty;
  }
}

export function getVisualEmoji(type: string): string {
  switch (type) {
    case 'apple': return '🍎';
    case 'star': return '⭐';
    case 'block': return '🧱';
    case 'ball': return '⚽';
    case 'candy': return '🍬';
    default: return '🍎';
  }
}

export function createInitialState(): GameState {
  return {
    status: 'idle',
    difficulty: 'easy',
    currentProblem: null,
    problemsSolved: 0,
    totalProblems: 5,
    score: 0,
    streak: 0,
    timeLeft: 30,
    startTime: 0,
  };
}

export function generateProblem(difficulty: Difficulty): AdditionProblem {
  let maxSum = 5;
  if (difficulty === 'medium') maxSum = 10;
  if (difficulty === 'hard') maxSum = 20;

  const sum = Math.floor(Math.random() * (maxSum - 1)) + 2; // 2 to maxSum
  const num1 = Math.floor(Math.random() * (sum - 1)) + 1; // 1 to sum-1
  const num2 = sum - num1;

  const visualType = VISUAL_TYPES[Math.floor(Math.random() * VISUAL_TYPES.length)];

  // Generate 4 unique options
  const optionsSet = new Set<number>([sum]);
  while (optionsSet.size < 4) {
    const distractor = Math.floor(Math.random() * (maxSum + 2)) + 1;
    optionsSet.add(distractor);
  }

  const options = Array.from(optionsSet).sort((a, b) => a - b);

  return { num1, num2, sum, options, visualType };
}

export function startGame(state: GameState, difficulty: Difficulty): GameState {
  return {
    ...state,
    status: 'playing',
    difficulty,
    currentProblem: generateProblem(difficulty),
    problemsSolved: 0,
    score: 0,
    streak: 0,
    timeLeft: difficulty === 'hard' ? 45 : 30,
    startTime: Date.now(),
  };
}

export function checkAnswer(state: GameState, answer: number): { state: GameState; isCorrect: boolean } {
  if (!state.currentProblem) return { state, isCorrect: false };

  const isCorrect = answer === state.currentProblem.sum;

  if (isCorrect) {
    const newStreak = state.streak + 1;
    const points = 10 * newStreak;
    return {
      state: {
        ...state,
        score: state.score + points,
        streak: newStreak,
        problemsSolved: state.problemsSolved + 1,
      },
      isCorrect: true,
    };
  } else {
    return {
      state: {
        ...state,
        streak: 0,
      },
      isCorrect: false,
    };
  }
}

export function nextProblem(state: GameState): GameState {
  if (state.problemsSolved >= state.totalProblems) {
    return { ...state, status: 'complete' };
  }
  return {
    ...state,
    status: 'playing',
    currentProblem: generateProblem(state.difficulty),
    timeLeft: state.difficulty === 'hard' ? 45 : 30,
  };
}

export function updateTimer(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  const newTimeLeft = state.timeLeft - 1;
  if (newTimeLeft <= 0) {
    return { ...state, status: 'wrong', timeLeft: 0 };
  }

  return { ...state, timeLeft: newTimeLeft };
}

export function calculateFinalScore(state: GameState): { total: number; baseScore: number; accuracyBonus: number; streakBonus: number } {
  const baseScore = state.score;
  const accuracyBonus = 20; // Simplified
  const streakBonus = state.streak * 5;

  return {
    total: baseScore + accuracyBonus + streakBonus,
    baseScore,
    accuracyBonus,
    streakBonus,
  };
}

export function getFeedbackMessage(streak: number): { message: string; emoji: string } {
  if (streak >= 5) return { message: 'Incredible!', emoji: '🌟' };
  if (streak >= 3) return { message: 'Awesome!', emoji: '🚀' };
  return { message: 'Correct!', emoji: '✅' };
}
