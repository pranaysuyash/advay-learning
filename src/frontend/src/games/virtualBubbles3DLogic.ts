/**
 * Virtual Bubbles 3D Game Logic
 *
 * 3D version of bubble popping with depth and hand tracking.
 * Educational value: Hand-eye coordination, timing, reaction speed
 *
 * @ticket TCK-20250411-001
 */

// Game configuration constants
export const VIRTUAL_BUBBLES_3D_CONFIG = {
  // Bubble settings
  MIN_BUBBLE_SIZE: 0.2,
  MAX_BUBBLE_SIZE: 0.5,
  BUBBLE_FLOAT_SPEED_MIN: 0.005,
  BUBBLE_FLOAT_SPEED_MAX: 0.015,
  BUBBLE_SPAWN_RATE: 1500, // ms
  MAX_BUBBLES: 15,

  // Game settings
  GAME_DURATION_SECONDS: 60,
  POINTS_PER_BUBBLE: 10,
  COMBO_WINDOW_MS: 1000,
  COMBO_BONUS_MULTIPLIER: 0.5,

  // 3D space bounds
  SPAWN_X_MIN: -4,
  SPAWN_X_MAX: 4,
  SPAWN_Y_MIN: -3,
  SPAWN_Y_MAX: -4, // Spawn below view
  SPAWN_Z_MIN: -2,
  SPAWN_Z_MAX: 2,

  // Pop detection
  POP_RADIUS_3D: 0.8,
} as const;

// Bubble colors for 3D iridescent effect
export const BUBBLE_COLORS = [
  { base: '#ff6b6b', highlight: '#ffaaaa' }, // Red
  { base: '#4ecdc4', highlight: '#a8e6cf' }, // Teal
  { base: '#45b7d1', highlight: '#87ceeb' }, // Blue
  { base: '#96ceb4', highlight: '#c8e6c9' }, // Green
  { base: '#ffeaa7', highlight: '#fff9c4' }, // Yellow
  { base: '#dda0dd', highlight: '#e1bee7' }, // Purple
  { base: '#98d8c8', highlight: '#b2dfdb' }, // Mint
  { base: '#f7dc6f', highlight: '#fff59d' }, // Gold
  { base: '#bb8fce', highlight: '#d1c4e9' }, // Lavender
  { base: '#85c1e9', highlight: '#bbdefb' }, // Sky
] as const;

// Types
export interface Bubble3D {
  id: string;
  position: { x: number; y: number; z: number };
  size: number;
  color: typeof BUBBLE_COLORS[number];
  speed: number;
  wobbleOffset: number;
  rotation: { x: number; y: number; z: number };
  createdAt: number;
}

export interface GameState {
  bubbles: Bubble3D[];
  score: number;
  poppedCount: number;
  timeLeft: number;
  isPlaying: boolean;
  gameOver: boolean;
  combo: number;
  lastPopTime: number;
  level: number;
}

export interface PopResult {
  success: boolean;
  points: number;
  comboBonus: number;
  bubbleId: string | null;
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a new 3D bubble
export function createBubble3D(_canvasWidth?: number, _canvasHeight?: number): Bubble3D {
  const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];

  return {
    id: generateId(),
    position: {
      x: (Math.random() - 0.5) * 8,
      y: -4 - Math.random() * 2,
      z: (Math.random() - 0.5) * 4,
    },
    size: Math.random() * (VIRTUAL_BUBBLES_3D_CONFIG.MAX_BUBBLE_SIZE - VIRTUAL_BUBBLES_3D_CONFIG.MIN_BUBBLE_SIZE) +
      VIRTUAL_BUBBLES_3D_CONFIG.MIN_BUBBLE_SIZE,
    color,
    speed: Math.random() * (VIRTUAL_BUBBLES_3D_CONFIG.BUBBLE_FLOAT_SPEED_MAX - VIRTUAL_BUBBLES_3D_CONFIG.BUBBLE_FLOAT_SPEED_MIN) +
      VIRTUAL_BUBBLES_3D_CONFIG.BUBBLE_FLOAT_SPEED_MIN,
    wobbleOffset: Math.random() * Math.PI * 2,
    rotation: {
      x: Math.random() * Math.PI,
      y: Math.random() * Math.PI,
      z: Math.random() * Math.PI,
    },
    createdAt: Date.now(),
  };
}

// Initialize game state
export function initializeGame(): GameState {
  return {
    bubbles: [],
    score: 0,
    poppedCount: 0,
    timeLeft: VIRTUAL_BUBBLES_3D_CONFIG.GAME_DURATION_SECONDS,
    isPlaying: false,
    gameOver: false,
    combo: 0,
    lastPopTime: 0,
    level: 1,
  };
}

// Start game
export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    gameOver: false,
    bubbles: [createBubble3D()],
    timeLeft: VIRTUAL_BUBBLES_3D_CONFIG.GAME_DURATION_SECONDS,
    score: 0,
    poppedCount: 0,
    combo: 0,
    lastPopTime: 0,
  };
}

// Update bubbles (call each frame)
export function updateBubbles(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying || state.gameOver) return state;

  const updatedBubbles = state.bubbles
    .map((bubble) => ({
      ...bubble,
      position: {
        ...bubble.position,
        y: bubble.position.y + bubble.speed * (deltaTime / 16),
        x: bubble.position.x + Math.sin(Date.now() * 0.001 + bubble.wobbleOffset) * 0.002,
        z: bubble.position.z + Math.cos(Date.now() * 0.0007 + bubble.wobbleOffset) * 0.002,
      },
      rotation: {
        x: bubble.rotation.x + 0.005,
        y: bubble.rotation.y + 0.003,
        z: bubble.rotation.z + 0.001,
      },
    }))
    .filter((bubble) => bubble.position.y < 6); // Remove if too high

  // Spawn new bubbles
  const shouldSpawn = updatedBubbles.length < VIRTUAL_BUBBLES_3D_CONFIG.MAX_BUBBLES &&
    Math.random() < 0.02;

  if (shouldSpawn) {
    updatedBubbles.push(createBubble3D());
  }

  return {
    ...state,
    bubbles: updatedBubbles,
    timeLeft: Math.max(0, state.timeLeft - deltaTime / 1000),
  };
}

// Check if cursor/hand position can pop a bubble in 3D
export function checkBubblePop(
  state: GameState,
  handX: number, // Normalized 0-1
  handY: number, // Normalized 0-1
  handZ?: number, // Optional depth
): { result: PopResult; newState: GameState } {
  if (!state.isPlaying || state.gameOver) {
    return {
      result: { success: false, points: 0, comboBonus: 0, bubbleId: null },
      newState: state,
    };
  }

  // Convert normalized hand position to 3D space
  const cursor3DX = (handX - 0.5) * 10;
  const cursor3DY = (handY - 0.5) * -6; // Invert Y
  const cursor3DZ = handZ ? (handZ - 0.5) * 4 : 0;

  const now = Date.now();
  let closestBubble: Bubble3D | null = null;
  let closestDistance = Infinity;

  // Find closest bubble within pop radius
  for (const bubble of state.bubbles) {
    const dx = cursor3DX - bubble.position.x;
    const dy = cursor3DY - bubble.position.y;
    const dz = cursor3DZ - bubble.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < VIRTUAL_BUBBLES_3D_CONFIG.POP_RADIUS_3D && distance < closestDistance) {
      closestDistance = distance;
      closestBubble = bubble;
    }
  }

  if (!closestBubble) {
    return {
      result: { success: false, points: 0, comboBonus: 0, bubbleId: null },
      newState: state,
    };
  }

  // Calculate combo
  let combo = 1;
  let comboBonus = 0;
  if (now - state.lastPopTime < VIRTUAL_BUBBLES_3D_CONFIG.COMBO_WINDOW_MS) {
    combo = state.combo + 1;
    comboBonus = Math.floor((combo - 1) * VIRTUAL_BUBBLES_3D_CONFIG.POINTS_PER_BUBBLE *
      VIRTUAL_BUBBLES_3D_CONFIG.COMBO_BONUS_MULTIPLIER);
  }

  const points = VIRTUAL_BUBBLES_3D_CONFIG.POINTS_PER_BUBBLE + comboBonus;

  return {
    result: {
      success: true,
      points,
      comboBonus,
      bubbleId: closestBubble.id,
    },
    newState: {
      ...state,
      bubbles: state.bubbles.filter((b) => b.id !== closestBubble!.id),
      score: state.score + points,
      poppedCount: state.poppedCount + 1,
      combo,
      lastPopTime: now,
    },
  };
}

// End game
export function endGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: false,
    gameOver: true,
  };
}

// Get game stats
export function getGameStats(state: GameState) {
  return {
    accuracy: state.poppedCount > 0 ? 100 : 0,
    totalBubbles: state.poppedCount,
    currentBubbles: state.bubbles.length,
    maxCombo: state.combo,
  };
}

// Calculate depth-based scale for 3D effect
export function getBubbleScale(z: number): number {
  // Closer bubbles (higher Z) appear larger
  const normalizedZ = (z + 2) / 4; // Normalize to 0-1
  return 0.7 + normalizedZ * 0.6;
}

// Get bubble opacity based on depth
export function getBubbleOpacity(z: number): number {
  // Further bubbles are slightly more transparent
  const normalizedZ = (z + 2) / 4;
  return 0.6 + normalizedZ * 0.4;
}
