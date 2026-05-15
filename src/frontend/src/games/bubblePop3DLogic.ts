/**
 * Bubble Pop 3D Game Logic
 *
 * 3D version of bubble popping game with hand tracking.
 * Pop iridescent bubbles before they float away!
 *
 * @ticket TCK-20250411-001
 */

// Game configuration constants
export const BUBBLE_POP_3D_CONFIG = {
  // Bubble settings
  MIN_BUBBLE_SIZE: 0.3,
  MAX_BUBBLE_SIZE: 0.6,
  BUBBLE_FLOAT_SPEED: 0.008,
  SPAWN_INTERVAL: 2000,
  MAX_BUBBLES: 10,

  // Game settings
  INITIAL_LIVES: 3,
  POINTS_PER_BUBBLE: 10,
  PERFECT_POP_BONUS: 5,

  // 3D space
  SPAWN_BOUNDS: {
    x: 5,
    y: -3,
    z: 3,
  },
  POP_RADIUS: 0.6,

  // Levels
  MAX_LEVEL: 3,
  BUBBLES_PER_LEVEL: 10,
} as const;

// Bubble colors with iridescent effect
export const IRIDESCENT_COLORS = [
  { primary: '#60a5fa', secondary: '#a78bfa', accent: '#34d399' }, // Blue-Purple-Green
  { primary: '#f472b6', secondary: '#fb923c', accent: '#fbbf24' }, // Pink-Orange-Yellow
  { primary: '#34d399', secondary: '#60a5fa', accent: '#f472b6' }, // Green-Blue-Pink
  { primary: '#a78bfa', secondary: '#f472b6', accent: '#fb923c' }, // Purple-Pink-Orange
  { primary: '#fbbf24', secondary: '#34d399', accent: '#60a5fa' }, // Yellow-Green-Blue
] as const;

// Types
export interface Bubble3D {
  id: string;
  position: { x: number; y: number; z: number };
  size: number;
  color: typeof IRIDESCENT_COLORS[number];
  speed: number;
  createdAt: number;
  popped: boolean;
}

export interface GameState {
  bubbles: Bubble3D[];
  score: number;
  lives: number;
  level: number;
  bubblesPopped: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  lastSpawnTime: number;
}

export interface PopResult {
  success: boolean;
  points: number;
  isPerfect: boolean;
  bubbleId: string | null;
}

// Generate unique ID
function generateId(): string {
  return `bp3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new 3D bubble
export function createBubble3D(level: number): Bubble3D {
  const color = IRIDESCENT_COLORS[Math.floor(Math.random() * IRIDESCENT_COLORS.length)];
  const bounds = BUBBLE_POP_3D_CONFIG.SPAWN_BOUNDS;

  return {
    id: generateId(),
    position: {
      x: (Math.random() - 0.5) * bounds.x * 2,
      y: bounds.y - Math.random(),
      z: (Math.random() - 0.5) * bounds.z * 2,
    },
    size: Math.random() * (BUBBLE_POP_3D_CONFIG.MAX_BUBBLE_SIZE - BUBBLE_POP_3D_CONFIG.MIN_BUBBLE_SIZE) +
      BUBBLE_POP_3D_CONFIG.MIN_BUBBLE_SIZE,
    color,
    speed: BUBBLE_POP_3D_CONFIG.BUBBLE_FLOAT_SPEED * (1 + level * 0.2),
    createdAt: Date.now(),
    popped: false,
  };
}

// Initialize game state
export function initializeGame(): GameState {
  return {
    bubbles: [],
    score: 0,
    lives: BUBBLE_POP_3D_CONFIG.INITIAL_LIVES,
    level: 1,
    bubblesPopped: 0,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    lastSpawnTime: 0,
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  const now = Date.now();
  return {
    ...initializeGame(),
    isPlaying: true,
    bubbles: [createBubble3D(1)],
    lastSpawnTime: now,
  };
}

// Update bubbles - call each frame
export function updateBubbles(
  state: GameState,
  deltaTime: number,
  now: number = Date.now(),
): GameState {
  if (!state.isPlaying || state.gameOver || state.gameWon) return state;

  // Move bubbles up
  const updatedBubbles = state.bubbles
    .map((bubble) => ({
      ...bubble,
      position: {
        ...bubble.position,
        y: bubble.position.y + bubble.speed * (deltaTime / 16),
      },
    }))
    .filter((bubble) => {
      // Remove if floated too high (missed)
      if (bubble.position.y > 4 && !bubble.popped) {
        return false;
      }
      return true;
    });

  // Count missed bubbles
  const missedCount = state.bubbles.length - updatedBubbles.length;
  let newLives = state.lives - missedCount;

  // Spawn new bubbles
  let bubblesToSpawn = [] as Bubble3D[];
  if (now - state.lastSpawnTime > BUBBLE_POP_3D_CONFIG.SPAWN_INTERVAL) {
    if (updatedBubbles.length < BUBBLE_POP_3D_CONFIG.MAX_BUBBLES) {
      bubblesToSpawn.push(createBubble3D(state.level));
    }
  }

  // Check game over
  const gameOver = newLives <= 0;

  // Check win condition
  const bubblesPopped = state.bubblesPopped;
  const gameWon = bubblesPopped >= BUBBLE_POP_3D_CONFIG.BUBBLES_PER_LEVEL * BUBBLE_POP_3D_CONFIG.MAX_LEVEL;

  return {
    ...state,
    bubbles: [...updatedBubbles, ...bubblesToSpawn],
    lives: Math.max(0, newLives),
    gameOver,
    gameWon,
    lastSpawnTime: bubblesToSpawn.length > 0 ? now : state.lastSpawnTime,
  };
}

// Check for bubble pop with 3D hand position
export function checkPop(
  state: GameState,
  handX: number, // Normalized 0-1
  handY: number, // Normalized 0-1
): { result: PopResult; newState: GameState } {
  if (!state.isPlaying || state.gameOver) {
    return {
      result: { success: false, points: 0, isPerfect: false, bubbleId: null },
      newState: state,
    };
  }

  // Convert to 3D space
  const cursorX = (handX - 0.5) * 12;
  const cursorY = (handY - 0.5) * -8;

  let closestBubble: Bubble3D | null = null;
  let closestDistance = Infinity;

  // Find closest bubble
  for (const bubble of state.bubbles) {
    if (bubble.popped) continue;

    const dx = cursorX - bubble.position.x;
    const dy = cursorY - bubble.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < BUBBLE_POP_3D_CONFIG.POP_RADIUS && distance < closestDistance) {
      closestDistance = distance;
      closestBubble = bubble;
    }
  }

  if (!closestBubble) {
    return {
      result: { success: false, points: 0, isPerfect: false, bubbleId: null },
      newState: state,
    };
  }

  // Calculate perfect pop (center hit)
  const isPerfect = closestDistance < BUBBLE_POP_3D_CONFIG.POP_RADIUS * 0.4;
  const points = BUBBLE_POP_3D_CONFIG.POINTS_PER_BUBBLE + (isPerfect ? BUBBLE_POP_3D_CONFIG.PERFECT_POP_BONUS : 0);

  return {
    result: {
      success: true,
      points,
      isPerfect,
      bubbleId: closestBubble.id,
    },
    newState: {
      ...state,
      bubbles: state.bubbles.filter((b) => b.id !== closestBubble!.id),
      score: state.score + points,
      bubblesPopped: state.bubblesPopped + 1,
    },
  };
}

// Advance to next level
export function advanceLevel(state: GameState): GameState {
  if (state.level >= BUBBLE_POP_3D_CONFIG.MAX_LEVEL) {
    return { ...state, gameWon: true, isPlaying: false };
  }

  return {
    ...state,
    level: state.level + 1,
    bubbles: [],
    lastSpawnTime: 0,
  };
}

// Get bubble depth scale for visual effect
export function getDepthScale(z: number): number {
  // Map z from -3 to 3 to scale 0.7 to 1.3
  const normalized = (z + 3) / 6;
  return 0.7 + normalized * 0.6;
}

// Get stats
export function getStats(state: GameState) {
  return {
    accuracy: state.bubblesPopped > 0 ? 100 : 0,
    bubblesRemaining: BUBBLE_POP_3D_CONFIG.BUBBLES_PER_LEVEL * BUBBLE_POP_3D_CONFIG.MAX_LEVEL - state.bubblesPopped,
    currentBubbles: state.bubbles.length,
    perfectPops: 0, // Track separately if needed
  };
}
