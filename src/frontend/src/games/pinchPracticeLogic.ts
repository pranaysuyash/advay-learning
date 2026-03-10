/**
 * Pinch Practice game logic — pure functions for fine motor skill exercises.
 *
 * Kids practice precise pinch gestures: grab, hold, move, and drop objects.
 * Builds finger dexterity and hand-eye coordination.
 *
 * @see docs/GAME_IDEAS_CATALOG.md - Pinch Practice
 */

export type ExerciseType = 'hold' | 'drag' | 'sort' | 'target';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
}

export interface PinchTarget {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  label?: string;
  held: boolean;
  holdProgress: number; // 0-100 for hold exercises
}

export interface DropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label: string;
  acceptedColors: string[];
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  instructions: string;
  targets: PinchTarget[];
  dropZones?: DropZone[];
  timeLimit: number;
  completed: boolean;
}

export interface GameState {
  status: 'idle' | 'playing' | 'exercise-complete' | 'complete';
  score: number;
  streak: number;
  difficulty: Difficulty;
  currentExerciseIndex: number;
  exercises: Exercise[];
  heldTargetId: string | null;
  pinchStartTime: number | null;
  timeLeft: number;
  totalExercises: number;
  exercisesCompleted: number;
}

export interface GameConfig {
  difficulty: Difficulty;
  exercisesPerGame: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  difficulty: 'easy',
  exercisesPerGame: 5,
};

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<Difficulty, { targetRadius: number; timeMultiplier: number; holdTime: number }> = {
  easy: {
    targetRadius: 0.08,
    timeMultiplier: 1.5,
    holdTime: 2000, // 2 seconds
  },
  medium: {
    targetRadius: 0.06,
    timeMultiplier: 1.2,
    holdTime: 3000, // 3 seconds
  },
  hard: {
    targetRadius: 0.04,
    timeMultiplier: 1.0,
    holdTime: 4000, // 4 seconds
  },
};

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

/**
 * Generate a hold exercise - pinch and hold target for X seconds.
 */
function generateHoldExercise(index: number, difficulty: Difficulty): Exercise {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const color = COLORS[index % COLORS.length];
  
  return {
    id: `hold-${index}`,
    type: 'hold',
    instructions: `Pinch and hold the circle for ${config.holdTime / 1000} seconds!`,
    targets: [{
      id: 'target-0',
      x: 0.5,
      y: 0.5,
      radius: config.targetRadius,
      color,
      label: 'HOLD',
      held: false,
      holdProgress: 0,
    }],
    timeLimit: Math.floor(10 * config.timeMultiplier),
    completed: false,
  };
}

/**
 * Generate a drag exercise - pinch and drag target to destination.
 */
function generateDragExercise(index: number, difficulty: Difficulty): Exercise {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const color = COLORS[index % COLORS.length];
  
  return {
    id: `drag-${index}`,
    type: 'drag',
    instructions: 'Pinch the ball and drag it to the glowing zone!',
    targets: [{
      id: 'target-0',
      x: 0.2,
      y: 0.5,
      radius: config.targetRadius,
      color,
      held: false,
      holdProgress: 0,
    }],
    dropZones: [{
      id: 'zone-0',
      x: 0.8,
      y: 0.5,
      width: config.targetRadius * 2.5,
      height: config.targetRadius * 2.5,
      color: `${color}40`, // Transparent version
      label: 'DROP HERE',
      acceptedColors: [color],
    }],
    timeLimit: Math.floor(15 * config.timeMultiplier),
    completed: false,
  };
}

/**
 * Generate a sort exercise - sort colored balls into matching zones.
 */
function generateSortExercise(index: number, difficulty: Difficulty): Exercise {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const numTargets = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  
  const targets: PinchTarget[] = [];
  const dropZones: DropZone[] = [];
  
  for (let i = 0; i < numTargets; i++) {
    const color = COLORS[i % COLORS.length];
    
    targets.push({
      id: `target-${i}`,
      x: 0.2 + (i * 0.15),
      y: 0.3,
      radius: config.targetRadius * 0.8,
      color,
      held: false,
      holdProgress: 0,
    });
    
    dropZones.push({
      id: `zone-${i}`,
      x: 0.2 + (i * 0.2),
      y: 0.7,
      width: config.targetRadius * 3,
      height: config.targetRadius * 2,
      color: `${color}30`,
      label: color,
      acceptedColors: [color],
    });
  }
  
  return {
    id: `sort-${index}`,
    type: 'sort',
    instructions: 'Sort each ball into the matching colored zone!',
    targets,
    dropZones,
    timeLimit: Math.floor(20 * config.timeMultiplier),
    completed: false,
  };
}

/**
 * Generate a target exercise - pinch small targets quickly.
 */
function generateTargetExercise(index: number, difficulty: Difficulty): Exercise {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const numTargets = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  
  const targets: PinchTarget[] = [];
  
  for (let i = 0; i < numTargets; i++) {
    const angle = (i / numTargets) * Math.PI * 2;
    const radius = 0.25;
    
    targets.push({
      id: `target-${i}`,
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
      radius: config.targetRadius * 0.7,
      color: COLORS[i % COLORS.length],
      label: `${i + 1}`,
      held: false,
      holdProgress: 0,
    });
  }
  
  return {
    id: `target-${index}`,
    type: 'target',
    instructions: `Pinch all ${numTargets} targets in order!`,
    targets,
    timeLimit: Math.floor(15 * config.timeMultiplier),
    completed: false,
  };
}

/**
 * Generate exercises for a game session.
 */
export function generateExercises(count: number, difficulty: Difficulty): Exercise[] {
  const exercises: Exercise[] = [];
  const types: ExerciseType[] = ['hold', 'drag', 'sort', 'target'];
  
  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    
    switch (type) {
      case 'hold':
        exercises.push(generateHoldExercise(i, difficulty));
        break;
      case 'drag':
        exercises.push(generateDragExercise(i, difficulty));
        break;
      case 'sort':
        exercises.push(generateSortExercise(i, difficulty));
        break;
      case 'target':
        exercises.push(generateTargetExercise(i, difficulty));
        break;
    }
  }
  
  return exercises;
}

/**
 * Create initial game state.
 */
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    status: 'idle',
    score: 0,
    streak: 0,
    difficulty: config.difficulty,
    currentExerciseIndex: 0,
    exercises: [],
    heldTargetId: null,
    pinchStartTime: null,
    timeLeft: 0,
    totalExercises: config.exercisesPerGame,
    exercisesCompleted: 0,
  };
}

/**
 * Start a new game.
 */
export function startGame(state: GameState, difficulty: Difficulty): GameState {
  const exercises = generateExercises(state.totalExercises, difficulty);
  
  return {
    ...state,
    status: 'playing',
    score: 0,
    streak: 0,
    difficulty,
    currentExerciseIndex: 0,
    exercises,
    heldTargetId: null,
    pinchStartTime: null,
    timeLeft: exercises[0]?.timeLimit ?? 10,
    exercisesCompleted: 0,
  };
}

/**
 * Calculate distance between two points.
 */
export function distance(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Check if cursor is over a target.
 */
export function isOverTarget(cursor: Position, target: PinchTarget): boolean {
  return distance(cursor, { x: target.x, y: target.y }) <= target.radius;
}

/**
 * Check if cursor is over a drop zone.
 */
export function isOverDropZone(cursor: Position, zone: DropZone): boolean {
  const halfWidth = zone.width / 2;
  const halfHeight = zone.height / 2;
  
  return (
    cursor.x >= zone.x - halfWidth &&
    cursor.x <= zone.x + halfWidth &&
    cursor.y >= zone.y - halfHeight &&
    cursor.y <= zone.y + halfHeight
  );
}

/**
 * Handle pinch start - try to grab a target.
 */
export function handlePinchStart(
  state: GameState,
  cursor: Position,
  timestamp: number
): GameState {
  if (state.status !== 'playing') return state;
  
  const exercise = state.exercises[state.currentExerciseIndex];
  if (!exercise) return state;
  
  // Find target under cursor
  for (const target of exercise.targets) {
    if (!target.held && isOverTarget(cursor, target)) {
      return {
        ...state,
        heldTargetId: target.id,
        pinchStartTime: timestamp,
      };
    }
  }
  
  return state;
}

/**
 * Handle pinch hold - update held target position or hold progress.
 */
export function handlePinchHold(
  state: GameState,
  cursor: Position,
  timestamp: number
): GameState {
  if (state.status !== 'playing' || !state.heldTargetId) return state;
  
  const exercise = state.exercises[state.currentExerciseIndex];
  if (!exercise) return state;
  
  const targetIndex = exercise.targets.findIndex((t) => t.id === state.heldTargetId);
  if (targetIndex === -1) return state;
  
  const target = exercise.targets[targetIndex];
  const config = DIFFICULTY_CONFIGS[state.difficulty];
  
  // Update target position to follow cursor (for drag exercises)
  if (exercise.type === 'drag' || exercise.type === 'sort') {
    const updatedTargets = [...exercise.targets];
    updatedTargets[targetIndex] = {
      ...target,
      x: cursor.x,
      y: cursor.y,
      held: true,
    };
    
    const updatedExercises = [...state.exercises];
    updatedExercises[state.currentExerciseIndex] = {
      ...exercise,
      targets: updatedTargets,
    };
    
    return {
      ...state,
      exercises: updatedExercises,
    };
  }
  
  // Update hold progress (for hold exercises)
  if (exercise.type === 'hold' && state.pinchStartTime) {
    const holdDuration = timestamp - state.pinchStartTime;
    const progress = Math.min(100, (holdDuration / config.holdTime) * 100);
    
    const updatedTargets = [...exercise.targets];
    updatedTargets[targetIndex] = {
      ...target,
      held: true,
      holdProgress: progress,
    };
    
    const updatedExercises = [...state.exercises];
    updatedExercises[state.currentExerciseIndex] = {
      ...exercise,
      targets: updatedTargets,
    };
    
    return {
      ...state,
      exercises: updatedExercises,
    };
  }
  
  return state;
}

/**
 * Handle pinch release - check for completion.
 */
export function handlePinchRelease(
  state: GameState,
  cursor: Position,
  timestamp: number
): { state: GameState; exerciseComplete: boolean } {
  if (state.status !== 'playing' || !state.heldTargetId) {
    return { state, exerciseComplete: false };
  }
  
  const exercise = state.exercises[state.currentExerciseIndex];
  if (!exercise) return { state, exerciseComplete: false };
  
  const target = exercise.targets.find((t) => t.id === state.heldTargetId);
  if (!target) return { state, exerciseComplete: false };
  
  const config = DIFFICULTY_CONFIGS[state.difficulty];
  
  // Check exercise completion criteria
  let completed = false;
  
  switch (exercise.type) {
    case 'hold': {
      // Check if held long enough
      const holdDuration = timestamp - (state.pinchStartTime ?? timestamp);
      completed = holdDuration >= config.holdTime;
      break;
    }
    
    case 'drag': {
      // Check if dropped in correct zone
      const zone = exercise.dropZones?.[0];
      if (zone && isOverDropZone(cursor, zone)) {
        completed = true;
      }
      break;
    }
    
    case 'sort': {
      // Check if dropped in matching color zone
      const zone = exercise.dropZones?.find((z) => isOverDropZone(cursor, z));
      if (zone && zone.acceptedColors.includes(target.color)) {
        completed = true;
      }
      break;
    }
    
    case 'target': {
      // Mark this target as collected
      completed = true;
      break;
    }
  }
  
  // Release the target
  const updatedTargets = exercise.targets.map((t) =>
    t.id === state.heldTargetId
      ? { ...t, held: false, holdProgress: 0 }
      : t
  );
  
  const updatedExercises = [...state.exercises];
  updatedExercises[state.currentExerciseIndex] = {
    ...exercise,
    targets: updatedTargets,
  };
  
  const newState = {
    ...state,
    exercises: updatedExercises,
    heldTargetId: null,
    pinchStartTime: null,
  };
  
  return { state: newState, exerciseComplete: completed };
}

/**
 * Complete current exercise and move to next.
 */
export function completeExercise(state: GameState): GameState {
  const newStreak = state.streak + 1;
  const streakBonus = Math.min(newStreak * 20, 100);
  const timeBonus = state.timeLeft * 5;
  const points = 100 + streakBonus + timeBonus;
  
  const updatedExercises = [...state.exercises];
  updatedExercises[state.currentExerciseIndex] = {
    ...updatedExercises[state.currentExerciseIndex],
    completed: true,
  };
  
  const newExercisesCompleted = state.exercisesCompleted + 1;
  
  // Check if game complete
  if (newExercisesCompleted >= state.totalExercises) {
    return {
      ...state,
      status: 'complete',
      score: state.score + points,
      streak: newStreak,
      exercises: updatedExercises,
      exercisesCompleted: newExercisesCompleted,
    };
  }
  
  // Move to next exercise
  const nextIndex = state.currentExerciseIndex + 1;
  const nextExercise = state.exercises[nextIndex];
  
  return {
    ...state,
    status: 'exercise-complete',
    score: state.score + points,
    streak: newStreak,
    currentExerciseIndex: nextIndex,
    exercises: updatedExercises,
    heldTargetId: null,
    pinchStartTime: null,
    timeLeft: nextExercise?.timeLimit ?? 10,
    exercisesCompleted: newExercisesCompleted,
  };
}

/**
 * Advance to next exercise after completion delay.
 */
export function nextExercise(state: GameState): GameState {
  if (state.status !== 'exercise-complete') return state;
  
  return {
    ...state,
    status: 'playing',
  };
}

/**
 * Update game timer.
 */
export function updateTimer(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  
  const newTimeLeft = state.timeLeft - 1;
  
  if (newTimeLeft <= 0) {
    // Time's up - reset streak but continue
    return {
      ...state,
      timeLeft: 0,
      streak: 0,
      heldTargetId: null,
      pinchStartTime: null,
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
  if (streak >= 5) return { message: 'Pinch Master!', emoji: '🔥' };
  if (streak >= 3) return { message: 'Great control!', emoji: '✨' };
  if (streak >= 2) return { message: 'Nice pinching!', emoji: '👍' };
  return { message: 'Good job!', emoji: '🎯' };
}

/**
 * Calculate final score.
 */
export function calculateFinalScore(state: GameState): {
  baseScore: number;
  accuracyBonus: number;
  streakBonus: number;
  total: number;
} {
  const accuracy = state.exercisesCompleted / state.totalExercises;
  const accuracyBonus = Math.round(accuracy * 200);
  const streakBonus = Math.min(state.streak * 15, 75);
  
  return {
    baseScore: state.score,
    accuracyBonus,
    streakBonus,
    total: state.score + accuracyBonus + streakBonus,
  };
}

/**
 * Get exercise type display name.
 */
export function getExerciseTypeName(type: ExerciseType): string {
  switch (type) {
    case 'hold': return 'Hold';
    case 'drag': return 'Drag & Drop';
    case 'sort': return 'Color Sort';
    case 'target': return 'Target Practice';
    default: return 'Exercise';
  }
}
