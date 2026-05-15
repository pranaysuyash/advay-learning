/**
 * Counting Collectathon 3D Game Logic
 *
 * Collect numbers in 3D space in the correct order.
 * Educational value: Number recognition, counting, sequencing
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const COUNTING_COLLECTATHON_3D_CONFIG = {
  // Number settings
  MIN_NUMBER: 1,
  MAX_NUMBER: 10,
  NUMBER_SIZE: 0.6,
  COLLECT_RADIUS: 0.8,

  // Scoring
  POINTS_PER_CORRECT: 15,
  STREAK_BONUS: 5,
  COMPLETION_BONUS: 50,

  // 3D space
  SPAWN_RADIUS_MIN: 3,
  SPAWN_RADIUS_MAX: 6,
  SPAWN_HEIGHT_MIN: -1,
  SPAWN_HEIGHT_MAX: 2,

  // Animation
  FLOAT_SPEED: 0.005,
  ROTATION_SPEED: 0.02,
} as const;

// Types
export interface Number3D {
  id: string;
  value: number;
  position: { x: number; y: number; z: number };
  collected: boolean;
  floatOffset: number;
  rotation: number;
}

export interface GameState {
  numbers: Number3D[];
  currentTarget: number;
  score: number;
  level: number;
  streak: number;
  collectedCount: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
}

export interface CollectResult {
  success: boolean;
  correct: boolean;
  points: number;
  feedback: string;
}

// Generate unique ID
function generateId(): string {
  return `cc3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a number in 3D space
function createNumber3D(value: number, index: number): Number3D {
  const angle = (index / COUNTING_COLLECTATHON_3D_CONFIG.MAX_NUMBER) * Math.PI * 2;
  const radius = COUNTING_COLLECTATHON_3D_CONFIG.SPAWN_RADIUS_MIN +
    Math.random() * (COUNTING_COLLECTATHON_3D_CONFIG.SPAWN_RADIUS_MAX - COUNTING_COLLECTATHON_3D_CONFIG.SPAWN_RADIUS_MIN);

  return {
    id: generateId(),
    value,
    position: {
      x: Math.cos(angle) * radius,
      y: COUNTING_COLLECTATHON_3D_CONFIG.SPAWN_HEIGHT_MIN +
        Math.random() * (COUNTING_COLLECTATHON_3D_CONFIG.SPAWN_HEIGHT_MAX - COUNTING_COLLECTATHON_3D_CONFIG.SPAWN_HEIGHT_MIN),
      z: Math.sin(angle) * radius,
    },
    collected: false,
    floatOffset: Math.random() * Math.PI * 2,
    rotation: 0,
  };
}

// Generate numbers 1-10 scattered in 3D space
export function generateNumbers(): Number3D[] {
  const numbers: Number3D[] = [];
  for (let i = COUNTING_COLLECTATHON_3D_CONFIG.MIN_NUMBER; i <= COUNTING_COLLECTATHON_3D_CONFIG.MAX_NUMBER; i++) {
    numbers.push(createNumber3D(i, i - 1));
  }
  return numbers;
}

// Initialize game
export function initializeGame(): GameState {
  return {
    numbers: [],
    currentTarget: 1,
    score: 0,
    level: 1,
    streak: 0,
    collectedCount: 0,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Collect numbers in order!',
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  return {
    ...initializeGame(),
    numbers: generateNumbers(),
    isPlaying: true,
    currentTarget: 1,
    feedback: 'Find number 1!',
  };
}

// Update numbers (call each frame)
export function updateNumbers(state: GameState, _deltaTime: number): GameState {
  if (!state.isPlaying) return state;

  const updatedNumbers = state.numbers.map((num) => {
    if (num.collected) return num;

    return {
      ...num,
      position: {
        ...num.position,
        y: num.position.y + Math.sin(Date.now() * 0.001 + num.floatOffset) * 0.002,
      },
      rotation: num.rotation + COUNTING_COLLECTATHON_3D_CONFIG.ROTATION_SPEED,
    };
  });

  return {
    ...state,
    numbers: updatedNumbers,
  };
}

// Check if player collected a number
export function checkCollection(
  state: GameState,
  handX: number, // Normalized 0-1
  handY: number, // Normalized 0-1
): { result: CollectResult; newState: GameState } {
  if (!state.isPlaying) {
    return {
      result: { success: false, correct: false, points: 0, feedback: 'Not playing' },
      newState: state,
    };
  }

  // Convert to 3D space
  const cursorX = (handX - 0.5) * 12;
  const cursorY = (handY - 0.5) * -6;

  // Find closest uncollected number
  let closestNum: Number3D | null = null;
  let closestDistance = Infinity;

  for (const num of state.numbers) {
    if (num.collected) continue;

    const dx = cursorX - num.position.x;
    const dy = cursorY - num.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < COUNTING_COLLECTATHON_3D_CONFIG.COLLECT_RADIUS && distance < closestDistance) {
      closestDistance = distance;
      closestNum = num;
    }
  }

  if (!closestNum) {
    return {
      result: { success: false, correct: false, points: 0, feedback: 'No number nearby' },
      newState: state,
    };
  }

  // Check if correct number
  const isCorrect = closestNum.value === state.currentTarget;

  if (!isCorrect) {
    return {
      result: {
        success: false,
        correct: false,
        points: 0,
        feedback: `Oops! You need number ${state.currentTarget}`,
      },
      newState: {
        ...state,
        streak: 0,
        feedback: `Oops! You need number ${state.currentTarget}`,
      },
    };
  }

  // Correct number collected!
  const newCollectedCount = state.collectedCount + 1;
  const isComplete = newCollectedCount >= COUNTING_COLLECTATHON_3D_CONFIG.MAX_NUMBER;
  const streakBonus = state.streak * COUNTING_COLLECTATHON_3D_CONFIG.STREAK_BONUS;
  const points = COUNTING_COLLECTATHON_3D_CONFIG.POINTS_PER_CORRECT + streakBonus +
    (isComplete ? COUNTING_COLLECTATHON_3D_CONFIG.COMPLETION_BONUS : 0);

  return {
    result: {
      success: true,
      correct: true,
      points,
      feedback: isComplete ? 'Amazing! You collected all numbers!' : `Great! Now find ${state.currentTarget + 1}!`,
    },
    newState: {
      ...state,
      numbers: state.numbers.map((n) =>
        n.id === closestNum!.id ? { ...n, collected: true } : n
      ),
      score: state.score + points,
      currentTarget: state.currentTarget + 1,
      collectedCount: newCollectedCount,
      streak: state.streak + 1,
      isPlaying: !isComplete,
      gameWon: isComplete,
      feedback: isComplete ? 'Amazing! You collected all numbers!' : `Great! Now find ${state.currentTarget + 1}!`,
    },
  };
}

// Get remaining numbers
export function getRemainingNumbers(state: GameState): Number3D[] {
  return state.numbers.filter((n) => !n.collected);
}

// Get next target number
export function getTargetNumber(state: GameState): number {
  return state.currentTarget;
}

// Get progress percentage
export function getProgress(state: GameState): number {
  return (state.collectedCount / COUNTING_COLLECTATHON_3D_CONFIG.MAX_NUMBER) * 100;
}
