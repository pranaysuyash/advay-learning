/**
 * Shape Safari 3D Game Logic
 *
 * Find 3D shapes in the safari environment.
 * Educational value: Shape recognition, 3D spatial awareness, visual search
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const SHAPE_SAFARI_3D_CONFIG = {
  // Shape types
  SHAPE_TYPES: ['cube', 'sphere', 'cylinder', 'cone', 'pyramid'] as const,

  // Game settings
  SHAPES_PER_LEVEL: 6,
  TARGETS_PER_LEVEL: 3,
  GAME_DURATION_SECONDS: 90,

  // Scoring
  POINTS_PER_CORRECT: 15,
  STREAK_MULTIPLIER: 1.2,

  // 3D space
  SPAWN_RADIUS: 8,
  SPAWN_HEIGHT_MIN: -2,
  SPAWN_HEIGHT_MAX: 3,
  DETECTION_RADIUS: 1,

  // Animation
  ROTATION_SPEED: 0.015,
  FLOAT_SPEED: 0.003,
} as const;

// Types
export type ShapeType = typeof SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES[number];

export interface ShapeAnimal3D {
  id: string;
  type: ShapeType;
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  found: boolean;
  floatOffset: number;
}

export interface GameState {
  shapes: ShapeAnimal3D[];
  targetType: ShapeType | null;
  foundCount: number;
  targetsFound: number;
  score: number;
  level: number;
  streak: number;
  timeLeft: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
}

export interface FindResult {
  success: boolean;
  isCorrect: boolean;
  points: number;
  feedback: string;
}

// Colors for shapes
const SHAPE_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#8b5cf6', // Purple
  '#f97316', // Orange
];

// Generate unique ID
function generateId(): string {
  return `ss3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a shape in 3D space
function createShapeAnimal(index: number, forcedType?: ShapeType): ShapeAnimal3D {
  const angle = (index / SHAPE_SAFARI_3D_CONFIG.SHAPES_PER_LEVEL) * Math.PI * 2;
  const radius = 2 + Math.random() * (SHAPE_SAFARI_3D_CONFIG.SPAWN_RADIUS - 2);
  const type = forcedType || SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES[
    Math.floor(Math.random() * SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES.length)
  ];

  return {
    id: generateId(),
    type,
    color: SHAPE_COLORS[index % SHAPE_COLORS.length],
    position: {
      x: Math.cos(angle) * radius,
      y: SHAPE_SAFARI_3D_CONFIG.SPAWN_HEIGHT_MIN +
        Math.random() * (SHAPE_SAFARI_3D_CONFIG.SPAWN_HEIGHT_MAX - SHAPE_SAFARI_3D_CONFIG.SPAWN_HEIGHT_MIN),
      z: Math.sin(angle) * radius,
    },
    rotation: {
      x: Math.random() * Math.PI,
      y: Math.random() * Math.PI,
      z: Math.random() * Math.PI,
    },
    found: false,
    floatOffset: Math.random() * Math.PI * 2,
  };
}

// Generate safari level with shapes
export function generateLevel(level: number): ShapeAnimal3D[] {
  const shapes: ShapeAnimal3D[] = [];

  // Ensure we have enough shapes
  for (let i = 0; i < SHAPE_SAFARI_3D_CONFIG.SHAPES_PER_LEVEL; i++) {
    shapes.push(createShapeAnimal(i));
  }

  // Ensure at least TARGETS_PER_LEVEL of the target type exist
  const targetType = SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES[
    (level - 1) % SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES.length
  ];

  // Replace some shapes with target type if needed
  const targetCount = shapes.filter((s) => s.type === targetType).length;
  if (targetCount < SHAPE_SAFARI_3D_CONFIG.TARGETS_PER_LEVEL) {
    for (let i = 0; i < SHAPE_SAFARI_3D_CONFIG.TARGETS_PER_LEVEL - targetCount; i++) {
      const index = Math.floor(Math.random() * shapes.length);
      shapes[index] = createShapeAnimal(index, targetType);
    }
  }

  return shapes;
}

// Pick target type for level
export function getTargetType(level: number): ShapeType {
  return SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES[
    (level - 1) % SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES.length
  ];
}

// Initialize game
export function initializeGame(): GameState {
  return {
    shapes: [],
    targetType: null,
    foundCount: 0,
    targetsFound: 0,
    score: 0,
    level: 1,
    streak: 0,
    timeLeft: SHAPE_SAFARI_3D_CONFIG.GAME_DURATION_SECONDS,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Find the shapes!',
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  const level = 1;
  const shapes = generateLevel(level);
  const targetType = getTargetType(level);

  return {
    ...initializeGame(),
    shapes,
    targetType,
    isPlaying: true,
    feedback: `Find all the ${targetType}s!`,
  };
}

// Start next level
export function nextLevel(state: GameState): GameState {
  const newLevel = state.level + 1;
  const shapes = generateLevel(newLevel);
  const targetType = getTargetType(newLevel);

  return {
    ...state,
    level: newLevel,
    shapes,
    targetType,
    foundCount: 0,
    targetsFound: 0,
    feedback: `Find all the ${targetType}s!`,
  };
}

// Update shapes (call each frame)
export function updateShapes(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;

  const updatedShapes = state.shapes.map((shape) => {
    if (shape.found) return shape;

    return {
      ...shape,
      rotation: {
        x: shape.rotation.x + SHAPE_SAFARI_3D_CONFIG.ROTATION_SPEED,
        y: shape.rotation.y + SHAPE_SAFARI_3D_CONFIG.ROTATION_SPEED * 0.7,
        z: shape.rotation.z,
      },
      position: {
        ...shape.position,
        y: shape.position.y + Math.sin(Date.now() * 0.001 + shape.floatOffset) * 0.002,
      },
    };
  });

  return {
    ...state,
    shapes: updatedShapes,
    timeLeft: Math.max(0, state.timeLeft - deltaTime / 1000),
    gameOver: state.timeLeft <= 0,
  };
}

// Check if player found a shape
export function checkShapeFind(
  state: GameState,
  handX: number,
  handY: number,
): { result: FindResult; newState: GameState } {
  if (!state.isPlaying || !state.targetType) {
    return {
      result: { success: false, isCorrect: false, points: 0, feedback: 'Not playing' },
      newState: state,
    };
  }

  // Convert to 3D space
  const cursorX = (handX - 0.5) * 12;
  const cursorY = (handY - 0.5) * -6;

  // Find closest unfound shape
  let closestShape: ShapeAnimal3D | null = null;
  let closestDistance = Infinity;

  for (const shape of state.shapes) {
    if (shape.found) continue;

    const dx = cursorX - shape.position.x;
    const dy = cursorY - shape.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < SHAPE_SAFARI_3D_CONFIG.DETECTION_RADIUS && distance < closestDistance) {
      closestDistance = distance;
      closestShape = shape;
    }
  }

  if (!closestShape) {
    return {
      result: { success: false, isCorrect: false, points: 0, feedback: 'No shape nearby' },
      newState: state,
    };
  }

  // Check if correct type
  const isCorrect = closestShape.type === state.targetType;

  if (!isCorrect) {
    return {
      result: {
        success: false,
        isCorrect: false,
        points: 0,
        feedback: `That's a ${closestShape.type}, find ${state.targetType}s!`,
      },
      newState: {
        ...state,
        streak: 0,
        feedback: `That's a ${closestShape.type}, find ${state.targetType}s!`,
      },
    };
  }

  // Correct shape found!
  const newTargetsFound = state.targetsFound + 1;
  const points = Math.floor(
    SHAPE_SAFARI_3D_CONFIG.POINTS_PER_CORRECT * Math.pow(SHAPE_SAFARI_3D_CONFIG.STREAK_MULTIPLIER, state.streak)
  );

  // Check if level complete
  const levelComplete = newTargetsFound >= SHAPE_SAFARI_3D_CONFIG.TARGETS_PER_LEVEL;
  const gameWon = levelComplete && state.level >= SHAPE_SAFARI_3D_CONFIG.SHAPE_TYPES.length;

  return {
    result: {
      success: true,
      isCorrect: true,
      points,
      feedback: gameWon ? 'Safari complete! You win!' : levelComplete ? 'Level complete!' : `Found ${newTargetsFound}/${SHAPE_SAFARI_3D_CONFIG.TARGETS_PER_LEVEL}!`,
    },
    newState: {
      ...state,
      shapes: state.shapes.map((s) =>
        s.id === closestShape!.id ? { ...s, found: true } : s
      ),
      score: state.score + points,
      targetsFound: newTargetsFound,
      foundCount: state.foundCount + 1,
      streak: state.streak + 1,
      isPlaying: !gameWon && !levelComplete,
      gameWon,
      feedback: gameWon ? 'Safari complete! You win!' : levelComplete ? 'Level complete!' : `Found ${newTargetsFound}/${SHAPE_SAFARI_3D_CONFIG.TARGETS_PER_LEVEL}!`,
    },
  };
}

// Get remaining targets
export function getRemainingTargets(state: GameState): number {
  if (!state.targetType) return 0;
  return state.shapes.filter((s: ShapeAnimal3D) => s.type === state.targetType && !s.found).length;
}

// Get progress
export function getProgress(state: GameState): number {
  return (state.targetsFound / SHAPE_SAFARI_3D_CONFIG.TARGETS_PER_LEVEL) * 100;
}
