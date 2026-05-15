/**
 * Cutting Practice 3D Game Logic
 *
 * Practice cutting/slicing in 3D space with physics objects.
 * Educational value: Fine motor control, precision, timing
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const CUTTING_PRACTICE_3D_CONFIG = {
  // Fruit settings
  FRUIT_TYPES: ['apple', 'banana', 'orange', 'watermelon', 'kiwi'] as const,
  FRUIT_SIZE: 0.4,
  LAUNCH_HEIGHT_MIN: 2,
  LAUNCH_HEIGHT_MAX: 4,
  LAUNCH_FORCE: 6,

  // Scoring
  POINTS_PER_SLICE: 10,
  PERFECT_SLICE_BONUS: 5,
  COMBO_MULTIPLIER: 1.5,

  // Game settings
  INITIAL_LIVES: 3,
  TARGET_SLICES: 20,
  GAME_DURATION: 60,

  // Slice detection
  SLICE_RADIUS: 0.6,
  MIN_SLICE_VELOCITY: 0.1,

  // Physics
  GRAVITY: -9.8,
  ROTATION_SPEED: 0.1,
} as const;

// Types
export type FruitType = typeof CUTTING_PRACTICE_3D_CONFIG.FRUIT_TYPES[number];

export interface Fruit3D {
  id: string;
  type: FruitType;
  color: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  sliced: boolean;
  spawnedAt: number;
}

export interface SliceTrail {
  points: { x: number; y: number; z: number }[];
  active: boolean;
}

export interface GameState {
  fruits: Fruit3D[];
  score: number;
  lives: number;
  slices: number;
  combo: number;
  lastSliceTime: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
  sliceTrail: SliceTrail;
}

export interface SliceResult {
  success: boolean;
  sliced: boolean;
  points: number;
  isPerfect: boolean;
  fruitId: string | null;
}

// Fruit colors
const FRUIT_COLORS: Record<FruitType, string> = {
  apple: '#ef4444',
  banana: '#eab308',
  orange: '#f97316',
  watermelon: '#22c55e',
  kiwi: '#84cc16',
};

// Generate unique ID
function generateId(): string {
  return `cp3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Launch a fruit
export function launchFruit(type?: FruitType): Fruit3D {
  const fruitType = type || CUTTING_PRACTICE_3D_CONFIG.FRUIT_TYPES[
    Math.floor(Math.random() * CUTTING_PRACTICE_3D_CONFIG.FRUIT_TYPES.length)
  ];

  return {
    id: generateId(),
    type: fruitType,
    color: FRUIT_COLORS[fruitType],
    position: {
      x: (Math.random() - 0.5) * 4,
      y: CUTTING_PRACTICE_3D_CONFIG.LAUNCH_HEIGHT_MIN +
        Math.random() * (CUTTING_PRACTICE_3D_CONFIG.LAUNCH_HEIGHT_MAX - CUTTING_PRACTICE_3D_CONFIG.LAUNCH_HEIGHT_MIN),
      z: 0,
    },
    velocity: {
      x: (Math.random() - 0.5) * 2,
      y: CUTTING_PRACTICE_3D_CONFIG.LAUNCH_FORCE + Math.random() * 2,
      z: 0,
    },
    rotation: {
      x: Math.random() * Math.PI,
      y: Math.random() * Math.PI,
      z: Math.random() * Math.PI,
    },
    sliced: false,
    spawnedAt: Date.now(),
  };
}

// Initialize game
export function initializeGame(): GameState {
  return {
    fruits: [],
    score: 0,
    lives: CUTTING_PRACTICE_3D_CONFIG.INITIAL_LIVES,
    slices: 0,
    combo: 0,
    lastSliceTime: 0,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Slice the fruits!',
    sliceTrail: { points: [], active: false },
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  return {
    ...initializeGame(),
    isPlaying: true,
    fruits: [launchFruit()],
  };
}

// Update fruits (call each frame)
export function updateFruits(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;

  const dt = deltaTime / 1000;
  const updatedFruits: Fruit3D[] = [];
  let missedFruits = 0;

  for (const fruit of state.fruits) {
    if (fruit.sliced) continue;

    // Apply physics
    const newY = fruit.position.y + fruit.velocity.y * dt;
    const newVelocityY = fruit.velocity.y + CUTTING_PRACTICE_3D_CONFIG.GRAVITY * dt;

    // Check if fruit fell
    if (newY < -4) {
      missedFruits++;
      continue;
    }

    updatedFruits.push({
      ...fruit,
      position: {
        x: fruit.position.x + fruit.velocity.x * dt,
        y: newY,
        z: fruit.position.z + fruit.velocity.z * dt,
      },
      velocity: {
        ...fruit.velocity,
        y: newVelocityY,
      },
      rotation: {
        x: fruit.rotation.x + CUTTING_PRACTICE_3D_CONFIG.ROTATION_SPEED,
        y: fruit.rotation.y + CUTTING_PRACTICE_3D_CONFIG.ROTATION_SPEED * 0.7,
        z: fruit.rotation.z + CUTTING_PRACTICE_3D_CONFIG.ROTATION_SPEED * 0.5,
      },
    });
  }

  // Spawn new fruits periodically
  if (Math.random() < 0.02 && updatedFruits.length < 5) {
    updatedFruits.push(launchFruit());
  }

  const newLives = Math.max(0, state.lives - missedFruits);
  const gameOver = newLives <= 0;
  const gameWon = state.slices >= CUTTING_PRACTICE_3D_CONFIG.TARGET_SLICES;

  return {
    ...state,
    fruits: updatedFruits,
    lives: newLives,
    gameOver,
    gameWon: gameWon && !gameOver,
    isPlaying: !gameOver && !gameWon,
  };
}

// Check for slice
export function checkSlice(
  state: GameState,
  handX: number,
  handY: number,
  isMoving: boolean,
): { result: SliceResult; newState: GameState } {
  if (!state.isPlaying) {
    return {
      result: { success: false, sliced: false, points: 0, isPerfect: false, fruitId: null },
      newState: state,
    };
  }

  // Convert to 3D space
  const cursorX = (handX - 0.5) * 10;
  const cursorY = (handY - 0.5) * -6;

  // Find closest fruit
  let closestFruit: Fruit3D | null = null;
  let closestDistance = Infinity;

  for (const fruit of state.fruits) {
    if (fruit.sliced) continue;

    const dx = cursorX - fruit.position.x;
    const dy = cursorY - fruit.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < CUTTING_PRACTICE_3D_CONFIG.SLICE_RADIUS && distance < closestDistance) {
      closestDistance = distance;
      closestFruit = fruit;
    }
  }

  if (!closestFruit || !isMoving) {
    return {
      result: { success: false, sliced: false, points: 0, isPerfect: false, fruitId: null },
      newState: state,
    };
  }

  // Calculate slice quality
  const isPerfect = closestDistance < CUTTING_PRACTICE_3D_CONFIG.SLICE_RADIUS * 0.3;

  // Update combo
  const now = Date.now();
  let combo = 1;
  if (now - state.lastSliceTime < 1000) {
    combo = state.combo + 1;
  }

  const basePoints = CUTTING_PRACTICE_3D_CONFIG.POINTS_PER_SLICE;
  const bonus = isPerfect ? CUTTING_PRACTICE_3D_CONFIG.PERFECT_SLICE_BONUS : 0;
  const comboBonus = combo > 1 ? Math.floor(basePoints * (combo - 1) * 0.2) : 0;
  const points = basePoints + bonus + comboBonus;

  return {
    result: {
      success: true,
      sliced: true,
      points,
      isPerfect,
      fruitId: closestFruit.id,
    },
    newState: {
      ...state,
      fruits: state.fruits.map((f) =>
        f.id === closestFruit!.id ? { ...f, sliced: true } : f
      ),
      score: state.score + points,
      slices: state.slices + 1,
      combo,
      lastSliceTime: now,
      feedback: isPerfect ? 'Perfect slice!' : combo > 2 ? `${combo}x Combo!` : 'Nice!',
    },
  };
}

// Update slice trail
export function updateSliceTrail(
  state: GameState,
  handX: number,
  handY: number,
  isActive: boolean,
): GameState {
  const cursorX = (handX - 0.5) * 10;
  const cursorY = (handY - 0.5) * -6;

  let newPoints = [...state.sliceTrail.points];

  if (isActive) {
    newPoints.push({ x: cursorX, y: cursorY, z: 0 });
    // Keep last 10 points
    if (newPoints.length > 10) {
      newPoints = newPoints.slice(-10);
    }
  } else {
    newPoints = [];
  }

  return {
    ...state,
    sliceTrail: {
      points: newPoints,
      active: isActive,
    },
  };
}

// Get progress
export function getProgress(state: GameState): number {
  return (state.slices / CUTTING_PRACTICE_3D_CONFIG.TARGET_SLICES) * 100;
}
