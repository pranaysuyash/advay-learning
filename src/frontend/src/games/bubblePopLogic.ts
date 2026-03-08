/**
 * Bubble Pop Game Logic
 * 
 * A voice/blow-activated game where players blow into the microphone
 * to pop bubbles floating on screen.
 * 
 * Educational value:
 * - Cause and effect
 * - Breath control
 * - Color recognition
 * - Counting
 */

// Game configuration constants - centralized for easy tuning
export const BUBBLE_GAME_CONFIG = {
  // Blow detection settings
  BLOW_THRESHOLD: 0.12,
  MIN_BLOW_DURATION: 100,
  BLOW_COOLDOWN: 300,
  
  // Scoring
  BASE_POINTS_PER_BUBBLE: 10,
  COMBO_BONUS_PER_EXTRA_BUBBLE: 5,
  ACCURACY_BONUS: 50,
  
  // Level progression
  LEVEL_ADVANCE_POPS: 10,
  LEVEL_ADVANCE_TIME_SECONDS: 10,
  MAX_LEVEL: 10,
  
  // Physics
  BASE_BUBBLE_SPEED: 0.002,
  SPEED_VARIANCE: 0.003,
  WOBBLE_SPEED: 0.05,
  SPAWN_CHANCE_BASE: 0.01,
  SPAWN_CHANCE_PER_LEVEL: 0.005,
  MAX_BUBBLES_BASE: 5,
  
  // Timing
  GAME_DURATION_SECONDS: 30,
  FRAME_TIME_MS: 16,
  
  // Hit detection
  BASE_HIT_RADIUS: 0.15,
  VOLUME_HIT_RADIUS_MULTIPLIER: 0.1,
  MIN_HIT_VOLUME: 0.2,
} as const;

export interface Bubble {
  id: string;
  x: number;        // 0-1 normalized
  y: number;        // 0-1 normalized
  size: number;     // pixels
  color: string;
  speed: number;    // upward movement speed
  wobble: number;   // horizontal sway
  isPopped: boolean;
}

export interface GameState {
  bubbles: Bubble[];
  score: number;
  poppedCount: number;
  missedCount: number;
  level: number;
  timeLeft: number;
  gameOver: boolean;
  isPlaying: boolean;
  lastBlowTime: number;
  blowStrength: number;  // 0-1 from microphone
}

// Bubble colors
export const BUBBLE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
];

// Generate a new bubble
export function createBubble(level: number): Bubble {
  const id = Math.random().toString(36).substr(2, 9);
  const size = 30 + Math.random() * 40 + (level * 5);
  const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
  
  return {
    id,
    x: 0.1 + Math.random() * 0.8,  // Keep away from edges
    y: 1.2,  // Start below screen
    size,
    color,
    speed: 0.002 + Math.random() * 0.003 + (level * 0.001),
    wobble: Math.random() * Math.PI * 2,
    isPopped: false,
  };
}

// Initialize game state
export function initializeGame(): GameState {
  return {
    bubbles: [],
    score: 0,
    poppedCount: 0,
    missedCount: 0,
    level: 1,
    timeLeft: BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS,
    gameOver: false,
    isPlaying: false,
    lastBlowTime: 0,
    blowStrength: 0,
  };
}

// Start game
export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    timeLeft: BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS,
    gameOver: false,
    bubbles: [createBubble(state.level)],
  };
}

// Update bubbles (call every frame)
export function updateBubbles(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;
  
  const {
    FRAME_TIME_MS,
    SPAWN_CHANCE_BASE,
    SPAWN_CHANCE_PER_LEVEL,
    MAX_BUBBLES_BASE,
  } = BUBBLE_GAME_CONFIG;
  
  const updatedBubbles = state.bubbles
    .map(bubble => ({
      ...bubble,
      y: bubble.y - bubble.speed * (deltaTime / FRAME_TIME_MS),
      wobble: bubble.wobble + BUBBLE_GAME_CONFIG.WOBBLE_SPEED,
    }))
    .filter(bubble => !bubble.isPopped && bubble.y > -0.2);
  
  // Count missed bubbles
  const missed = state.bubbles.filter(
    b => !b.isPopped && b.y <= -0.2
  ).length;
  const removedBubbleCount = state.bubbles.length - updatedBubbles.length;
  
  // Spawn new bubbles based on level
  const spawnChance = SPAWN_CHANCE_BASE + (state.level * SPAWN_CHANCE_PER_LEVEL);
  const maxBubbles = MAX_BUBBLES_BASE + state.level;
  if (removedBubbleCount === 0 && updatedBubbles.length === 0) {
    updatedBubbles.push(createBubble(state.level));
  } else if (removedBubbleCount === 0 && Math.random() < spawnChance && updatedBubbles.length < maxBubbles) {
    updatedBubbles.push(createBubble(state.level));
  }
  
  return {
    ...state,
    bubbles: updatedBubbles,
    missedCount: state.missedCount + missed,
    timeLeft: Math.max(0, state.timeLeft - deltaTime / 1000),
  };
}

// Check if blow hits any bubbles
export function checkBlowHits(
  state: GameState,
  blowVolume: number,
  blowX: number = 0.5  // Center by default
): GameState {
  const {
    MIN_HIT_VOLUME,
    BLOW_COOLDOWN,
    BASE_HIT_RADIUS,
    VOLUME_HIT_RADIUS_MULTIPLIER,
    BASE_POINTS_PER_BUBBLE,
    COMBO_BONUS_PER_EXTRA_BUBBLE,
  } = BUBBLE_GAME_CONFIG;
  
  if (!state.isPlaying || blowVolume < MIN_HIT_VOLUME) return state;
  
  const now = Date.now();
  if (now - state.lastBlowTime < BLOW_COOLDOWN) return state;
  
  // Hit radius scales with blow volume - louder = bigger area
  const hitRadius = BASE_HIT_RADIUS + (blowVolume * VOLUME_HIT_RADIUS_MULTIPLIER);
  let hitCount = 0;
  
  const updatedBubbles = state.bubbles.map(bubble => {
    if (bubble.isPopped) return bubble;
    
    // Calculate distance from blow center to bubble
    const dx = bubble.x - blowX;
    const dy = bubble.y - 0.5;  // Blow from center height
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < hitRadius) {
      hitCount++;
      return { ...bubble, isPopped: true };
    }
    return bubble;
  });
  
  if (hitCount > 0) {
    // Base score + combo bonus for multiple bubbles
    const baseScore = hitCount * BASE_POINTS_PER_BUBBLE * state.level;
    const comboBonus = Math.max(0, (hitCount - 1) * COMBO_BONUS_PER_EXTRA_BUBBLE);
    
    return {
      ...state,
      bubbles: updatedBubbles,
      score: state.score + baseScore + comboBonus,
      poppedCount: state.poppedCount + hitCount,
      lastBlowTime: now,
      blowStrength: blowVolume,
    };
  }
  
  return { ...state, blowStrength: blowVolume };
}

// Advance level
export function advanceLevel(state: GameState): GameState {
  const newLevel = Math.min(BUBBLE_GAME_CONFIG.MAX_LEVEL, state.level + 1);
  return {
    ...state,
    level: newLevel,
  };
}

// Get game stats
export function getStats(state: GameState) {
  return {
    accuracy: state.poppedCount + state.missedCount > 0
      ? Math.round((state.poppedCount / (state.poppedCount + state.missedCount)) * 100)
      : 0,
    totalBubbles: state.poppedCount + state.missedCount,
    currentBubbles: state.bubbles.filter(b => !b.isPopped).length,
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
