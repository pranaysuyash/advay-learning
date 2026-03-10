/**
 * Math Jumpers game logic — pure functions for the number line platformer.
 *
 * Kids solve math problems by jumping their character to the correct answer.
 * "What is 2 + 3?" → Jump to tile "5"!
 *
 * @see docs/GAME_IDEAS_CATALOG.md - Math Jumpers (Number Line Platformer)
 */

export type Operation = 'add' | 'subtract' | 'multiply';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MathProblem {
  id: string;
  operandA: number;
  operandB: number;
  operation: Operation;
  correctAnswer: number;
  answers: number[]; // Multiple choice options (including correct)
  display: string; // e.g., "2 + 3 = ?"
}

export interface Platform {
  id: number;
  x: number; // 0-1 normalized position
  y: number; // 0-1 normalized position (height)
  number: number;
  width: number;
  height: number;
}

export interface Player {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized (current height)
  targetX: number | null; // Where player is moving to
  isJumping: boolean;
  onPlatform: number | null; // Platform ID player is on
}

export interface GameState {
  status: 'idle' | 'playing' | 'correct' | 'wrong' | 'complete';
  score: number;
  streak: number;
  level: number;
  problem: MathProblem | null;
  platforms: Platform[];
  player: Player;
  timeLeft: number;
  problemsSolved: number;
  totalProblems: number;
}

export interface GameConfig {
  difficulty: Difficulty;
  totalProblems: number;
  timePerProblem: number;
  platformCount: number; // Number of answer platforms to show
}

export const DEFAULT_CONFIG: GameConfig = {
  difficulty: 'easy',
  totalProblems: 5,
  timePerProblem: 15,
  platformCount: 3,
};

// Level configurations
export const LEVEL_CONFIGS: Record<Difficulty, GameConfig> = {
  easy: {
    difficulty: 'easy',
    totalProblems: 5,
    timePerProblem: 20,
    platformCount: 3,
  },
  medium: {
    difficulty: 'medium',
    totalProblems: 7,
    timePerProblem: 15,
    platformCount: 4,
  },
  hard: {
    difficulty: 'hard',
    totalProblems: 10,
    timePerProblem: 12,
    platformCount: 5,
  },
};

/**
 * Generate a random math problem based on difficulty.
 */
export function generateProblem(difficulty: Difficulty): MathProblem {
  const id = `prob-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
  let operation: Operation;
  let operandA: number;
  let operandB: number;
  let correctAnswer: number;
  
  switch (difficulty) {
    case 'easy':
      operation = Math.random() > 0.3 ? 'add' : 'subtract';
      if (operation === 'add') {
        operandA = Math.floor(Math.random() * 6) + 1; // 1-6
        operandB = Math.floor(Math.random() * 5) + 1; // 1-5
        correctAnswer = operandA + operandB;
      } else {
        operandA = Math.floor(Math.random() * 8) + 3; // 3-10
        operandB = Math.floor(Math.random() * (operandA - 1)) + 1; // 1 to operandA-1
        correctAnswer = operandA - operandB;
      }
      break;
      
    case 'medium':
      operation = ['add', 'subtract', 'multiply'][Math.floor(Math.random() * 3)] as Operation;
      if (operation === 'add') {
        operandA = Math.floor(Math.random() * 10) + 5; // 5-14
        operandB = Math.floor(Math.random() * 10) + 1; // 1-10
        correctAnswer = operandA + operandB;
      } else if (operation === 'subtract') {
        operandA = Math.floor(Math.random() * 10) + 10; // 10-19
        operandB = Math.floor(Math.random() * 9) + 1; // 1-9
        correctAnswer = operandA - operandB;
      } else {
        operandA = Math.floor(Math.random() * 5) + 2; // 2-6
        operandB = Math.floor(Math.random() * 4) + 2; // 2-5
        correctAnswer = operandA * operandB;
      }
      break;
      
    case 'hard':
      operation = ['add', 'subtract', 'multiply'][Math.floor(Math.random() * 3)] as Operation;
      if (operation === 'add') {
        operandA = Math.floor(Math.random() * 20) + 10; // 10-29
        operandB = Math.floor(Math.random() * 20) + 5; // 5-24
        correctAnswer = operandA + operandB;
      } else if (operation === 'subtract') {
        operandA = Math.floor(Math.random() * 30) + 20; // 20-49
        operandB = Math.floor(Math.random() * 19) + 1; // 1-19
        correctAnswer = operandA - operandB;
      } else {
        operandA = Math.floor(Math.random() * 8) + 3; // 3-10
        operandB = Math.floor(Math.random() * 8) + 3; // 3-10
        correctAnswer = operandA * operandB;
      }
      break;
  }
  
  const opSymbol = operation === 'add' ? '+' : operation === 'subtract' ? '-' : '×';
  const display = `${operandA} ${opSymbol} ${operandB} = ?`;
  
  // Generate answer options
  const answers = generateAnswerOptions(correctAnswer, difficulty);
  
  return {
    id,
    operandA,
    operandB,
    operation,
    correctAnswer,
    answers,
    display,
  };
}

/**
 * Generate multiple choice answer options including the correct answer.
 */
export function generateAnswerOptions(correctAnswer: number, difficulty: Difficulty): number[] {
  const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const options = new Set<number>([correctAnswer]);
  
  // Generate distractors
  while (options.size < count) {
    let offset: number;
    if (difficulty === 'easy') {
      offset = Math.floor(Math.random() * 6) - 3; // -3 to +3
    } else if (difficulty === 'medium') {
      offset = Math.floor(Math.random() * 10) - 5; // -5 to +5
    } else {
      offset = Math.floor(Math.random() * 16) - 8; // -8 to +8
    }
    
    const distractor = correctAnswer + offset;
    if (distractor > 0 && distractor !== correctAnswer) {
      options.add(distractor);
    }
  }
  
  return Array.from(options).sort(() => Math.random() - 0.5);
}

/**
 * Create platforms for the current problem's answer options.
 */
export function createPlatforms(answers: number[]): Platform[] {
  const count = answers.length;
  const platforms: Platform[] = [];
  
  // Distribute platforms evenly across the width
  const spacing = 0.8 / (count + 1);
  
  for (let i = 0; i < count; i++) {
    platforms.push({
      id: i,
      x: 0.1 + spacing * (i + 1),
      y: 0.6, // Fixed height for all platforms
      number: answers[i],
      width: 0.12,
      height: 0.08,
    });
  }
  
  return platforms;
}

/**
 * Create initial game state.
 */
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    status: 'idle',
    score: 0,
    streak: 0,
    level: 1,
    problem: null,
    platforms: [],
    player: {
      x: 0.5,
      y: 0.3,
      targetX: null,
      isJumping: false,
      onPlatform: null,
    },
    timeLeft: config.timePerProblem,
    problemsSolved: 0,
    totalProblems: config.totalProblems,
  };
}

/**
 * Start a new game with the first problem.
 */
export function startGame(state: GameState, difficulty: Difficulty): GameState {
  const problem = generateProblem(difficulty);
  const platforms = createPlatforms(problem.answers);
  const config = LEVEL_CONFIGS[difficulty];
  
  return {
    ...state,
    status: 'playing',
    score: 0,
    streak: 0,
    level: 1,
    problem,
    platforms,
    player: {
      x: 0.5,
      y: 0.3,
      targetX: null,
      isJumping: false,
      onPlatform: null,
    },
    timeLeft: config.timePerProblem,
    problemsSolved: 0,
    totalProblems: config.totalProblems,
  };
}

/**
 * Move player toward a target platform.
 */
export function movePlayerToPlatform(state: GameState, platformId: number): GameState {
  const platform = state.platforms.find((p) => p.id === platformId);
  if (!platform || state.status !== 'playing') return state;
  
  return {
    ...state,
    player: {
      ...state.player,
      targetX: platform.x,
      isJumping: true,
      onPlatform: null,
    },
  };
}

/**
 * Update player position (called each frame).
 */
export function updatePlayerPosition(state: GameState, deltaTime: number): GameState {
  const player = state.player;
  if (!player.isJumping || player.targetX === null) return state;
  
  const targetX = player.targetX; // Narrowed to non-null
  const speed = 2.5; // Units per second
  const dx = targetX - player.x;
  
  // Move toward target
  const direction = dx > 0 ? 1 : -1;
  const moveAmount = speed * deltaTime;
  const newX = direction > 0 
    ? Math.min(player.x + moveAmount, targetX)
    : Math.max(player.x - moveAmount, targetX);
  
  // Check if arrived at target after this move
  const remainingDistance = Math.abs(targetX - newX);
  if (remainingDistance < 0.01) {
    // Arrived at destination
    const landedPlatform = state.platforms.find(
      (p) => Math.abs(p.x - targetX) < 0.05
    );
    
    return {
      ...state,
      player: {
        ...player,
        x: targetX,
        y: landedPlatform ? landedPlatform.y - 0.05 : 0.3,
        targetX: null,
        isJumping: false,
        onPlatform: landedPlatform?.id ?? null,
      },
    };
  }
  
  // Jump arc - y position based on progress
  const totalDistance = Math.abs(targetX - 0.5);
  const progress = totalDistance > 0 ? 1 - remainingDistance / totalDistance : 0;
  const jumpHeight = 0.3;
  const newY = 0.3 - Math.sin(Math.max(0, progress) * Math.PI) * jumpHeight;
  
  return {
    ...state,
    player: {
      ...player,
      x: newX,
      y: newY,
    },
  };
}

/**
 * Check if player landed on correct answer.
 */
export function checkAnswer(state: GameState): { state: GameState; isCorrect: boolean } {
  if (!state.problem || state.player.onPlatform === null) {
    return { state, isCorrect: false };
  }
  
  const platform = state.platforms.find((p) => p.id === state.player.onPlatform);
  if (!platform) return { state, isCorrect: false };
  
  const isCorrect = platform.number === state.problem.correctAnswer;
  
  if (isCorrect) {
    const newStreak = state.streak + 1;
    const streakBonus = Math.min(newStreak * 10, 50);
    const timeBonus = Math.floor(state.timeLeft * 2);
    const points = 100 + streakBonus + timeBonus;
    
    return {
      state: {
        ...state,
        status: 'correct',
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
        status: 'wrong',
        streak: 0,
      },
      isCorrect: false,
    };
  }
}

/**
 * Advance to the next problem or complete the game.
 */
export function nextProblem(state: GameState, difficulty: Difficulty): GameState {
  if (state.problemsSolved >= state.totalProblems) {
    return {
      ...state,
      status: 'complete',
    };
  }
  
  const problem = generateProblem(difficulty);
  const platforms = createPlatforms(problem.answers);
  const config = LEVEL_CONFIGS[difficulty];
  
  return {
    ...state,
    status: 'playing',
    problem,
    platforms,
    player: {
      x: 0.5,
      y: 0.3,
      targetX: null,
      isJumping: false,
      onPlatform: null,
    },
    timeLeft: config.timePerProblem,
  };
}

/**
 * Update game timer (called each second).
 */
export function updateTimer(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  
  const newTimeLeft = state.timeLeft - 1;
  
  if (newTimeLeft <= 0) {
    return {
      ...state,
      status: 'wrong',
      streak: 0,
      timeLeft: 0,
    };
  }
  
  return {
    ...state,
    timeLeft: newTimeLeft,
  };
}

/**
 * Get feedback message based on streak.
 */
export function getFeedbackMessage(streak: number): { message: string; emoji: string } {
  if (streak >= 5) return { message: 'Unstoppable!', emoji: '🔥' };
  if (streak >= 3) return { message: 'Amazing streak!', emoji: '⚡' };
  if (streak >= 2) return { message: 'Keep it up!', emoji: '⭐' };
  return { message: 'Great job!', emoji: '🎉' };
}

/**
 * Calculate final score with bonuses.
 */
export function calculateFinalScore(state: GameState): {
  baseScore: number;
  accuracyBonus: number;
  streakBonus: number;
  total: number;
} {
  const accuracy = state.problemsSolved / state.totalProblems;
  const accuracyBonus = Math.round(accuracy * 200);
  const streakBonus = Math.min(state.streak * 20, 100);
  
  return {
    baseScore: state.score,
    accuracyBonus,
    streakBonus,
    total: state.score + accuracyBonus + streakBonus,
  };
}

/**
 * Get operation symbol for display.
 */
export function getOperationSymbol(operation: Operation): string {
  switch (operation) {
    case 'add': return '+';
    case 'subtract': return '-';
    case 'multiply': return '×';
    default: return '+';
  }
}
