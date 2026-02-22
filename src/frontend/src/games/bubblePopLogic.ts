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
    bubbles: [createBubble(state.level)],
  };
}

// Update bubbles (call every frame)
export function updateBubbles(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;
  
  const updatedBubbles = state.bubbles
    .map(bubble => ({
      ...bubble,
      y: bubble.y - bubble.speed * (deltaTime / 16),
      wobble: bubble.wobble + 0.05,
    }))
    .filter(bubble => !bubble.isPopped && bubble.y > -0.2);
  
  // Count missed bubbles
  const missed = state.bubbles.filter(
    b => !b.isPopped && b.y <= -0.2
  ).length;
  
  // Spawn new bubbles based on level
  const spawnChance = 0.01 + (state.level * 0.005);
  if (Math.random() < spawnChance && updatedBubbles.length < 5 + state.level) {
    updatedBubbles.push(createBubble(state.level));
  }
  
  return {
    ...state,
    bubbles: updatedBubbles,
    missedCount: state.missedCount + missed,
  };
}

// Check if blow hits any bubbles
export function checkBlowHits(
  state: GameState,
  blowVolume: number,
  blowX: number = 0.5  // Center by default
): GameState {
  if (!state.isPlaying || blowVolume < 0.2) return state;
  
  const now = Date.now();
  if (now - state.lastBlowTime < 300) return state;  // Cooldown
  
  const hitRadius = 0.15 + (blowVolume * 0.1);
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
    return {
      ...state,
      bubbles: updatedBubbles,
      score: state.score + (hitCount * 10 * state.level),
      poppedCount: state.poppedCount + hitCount,
      lastBlowTime: now,
      blowStrength: blowVolume,
    };
  }
  
  return { ...state, blowStrength: blowVolume };
}

// Advance level
export function advanceLevel(state: GameState): GameState {
  const newLevel = Math.min(10, state.level + 1);
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
  };
}
