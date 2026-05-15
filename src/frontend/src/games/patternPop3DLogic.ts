/**
 * Pattern Pop 3D Game Logic
 *
 * Pattern matching game in 3D space - watch the sequence, then pop bubbles in order.
 * Educational value: Memory, pattern recognition, sequencing
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const PATTERN_POP_3D_CONFIG = {
  // Pattern settings
  INITIAL_PATTERN_LENGTH: 3,
  MAX_PATTERN_LENGTH: 7,
  PATTERN_DISPLAY_SPEED: 800,
  PATTERN_PAUSE_BETWEEN: 400,

  // Bubble settings
  BUBBLE_COUNT: 9,
  BUBBLE_SPACING: 2,
  BUBBLE_RADIUS: 3,

  // Scoring
  POINTS_PER_CORRECT: 25,
  STREAK_BONUS: 10,
  PERFECT_BONUS: 50,

  // Game settings
  MAX_LEVELS: 5,
  TIME_PER_TURN: 10000,

  // 3D space
  GRID_SIZE: 3,
  SPACING: 2,
} as const;

// Colors for bubbles
export const PATTERN_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Purple
  '#FFB347', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
] as const;

// Types
export interface PatternBubble3D {
  id: number;
  position: { x: number; y: number; z: number };
  color: string;
  isHighlighted: boolean;
  isPopped: boolean;
}

export interface Pattern {
  sequence: number[];
  level: number;
}

export interface GameState {
  bubbles: PatternBubble3D[];
  pattern: Pattern;
  playerSequence: number[];
  score: number;
  level: number;
  streak: number;
  isPlaying: boolean;
  isShowingPattern: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
}

export interface TurnResult {
  success: boolean;
  isPatternComplete: boolean;
  points: number;
  feedback: string;
}



// Create 3x3 grid of bubbles
export function createBubbleGrid(): PatternBubble3D[] {
  const bubbles: PatternBubble3D[] = [];
  const gridSize = PATTERN_POP_3D_CONFIG.GRID_SIZE;
  const spacing = PATTERN_POP_3D_CONFIG.SPACING;

  for (let i = 0; i < PATTERN_POP_3D_CONFIG.BUBBLE_COUNT; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    bubbles.push({
      id: i,
      position: {
        x: (col - 1) * spacing,
        y: (1 - row) * spacing * 0.7,
        z: 0,
      },
      color: PATTERN_COLORS[i % PATTERN_COLORS.length],
      isHighlighted: false,
      isPopped: false,
    });
  }

  return bubbles;
}

// Generate pattern for a level
export function generatePattern(level: number): Pattern {
  const length = Math.min(
    PATTERN_POP_3D_CONFIG.INITIAL_PATTERN_LENGTH + level - 1,
    PATTERN_POP_3D_CONFIG.MAX_PATTERN_LENGTH
  );

  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    sequence.push(Math.floor(Math.random() * PATTERN_POP_3D_CONFIG.BUBBLE_COUNT));
  }

  return { sequence, level };
}

// Initialize game
export function initializeGame(): GameState {
  return {
    bubbles: createBubbleGrid(),
    pattern: { sequence: [], level: 1 },
    playerSequence: [],
    score: 0,
    level: 1,
    streak: 0,
    isPlaying: false,
    isShowingPattern: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Watch the pattern...',
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  const newPattern = generatePattern(1);
  return {
    ...initializeGame(),
    pattern: newPattern,
    isPlaying: true,
    isShowingPattern: true,
    feedback: 'Watch the pattern...',
  };
}

// Start new level
export function startLevel(state: GameState, level: number): GameState {
  const newPattern = generatePattern(level);
  return {
    ...state,
    pattern: newPattern,
    playerSequence: [],
    level,
    isShowingPattern: true,
    gameOver: false,
    bubbles: createBubbleGrid(),
    feedback: 'Watch the pattern...',
  };
}

// Check if bubble is clicked in correct sequence
export function checkBubbleClick(
  state: GameState,
  bubbleId: number
): { result: TurnResult; newState: GameState } {
  if (!state.isPlaying || state.isShowingPattern || state.gameOver) {
    return {
      result: { success: false, isPatternComplete: false, points: 0, feedback: 'Not playing' },
      newState: state,
    };
  }

  const expectedId = state.pattern.sequence[state.playerSequence.length];

  if (bubbleId !== expectedId) {
    // Wrong bubble!
    return {
      result: {
        success: false,
        isPatternComplete: false,
        points: 0,
        feedback: 'Wrong! Start over.',
      },
      newState: {
        ...state,
        playerSequence: [],
        streak: 0,
        feedback: 'Wrong! Start over.',
      },
    };
  }

  // Correct bubble
  const newPlayerSequence = [...state.playerSequence, bubbleId];
  const isPatternComplete = newPlayerSequence.length === state.pattern.sequence.length;

  if (isPatternComplete) {
    // Level complete!
    const points = PATTERN_POP_3D_CONFIG.POINTS_PER_CORRECT * state.pattern.sequence.length +
      (state.streak > 0 ? PATTERN_POP_3D_CONFIG.STREAK_BONUS : 0);
    const newStreak = state.streak + 1;

    // Check if game won
    const gameWon = state.level >= PATTERN_POP_3D_CONFIG.MAX_LEVELS;

    return {
      result: {
        success: true,
        isPatternComplete: true,
        points,
        feedback: gameWon ? 'Perfect! You win!' : 'Perfect! Next level!',
      },
      newState: {
        ...state,
        playerSequence: newPlayerSequence,
        score: state.score + points,
        streak: newStreak,
        isPlaying: !gameWon,
        gameWon,
        bubbles: state.bubbles.map((b) =>
          b.id === bubbleId ? { ...b, isPopped: true } : b
        ),
        feedback: gameWon ? 'Perfect! You win!' : 'Perfect! Next level!',
      },
    };
  }

  // Continue pattern
  return {
    result: {
      success: true,
      isPatternComplete: false,
      points: PATTERN_POP_3D_CONFIG.POINTS_PER_CORRECT,
      feedback: 'Good! Keep going...',
    },
    newState: {
      ...state,
      playerSequence: newPlayerSequence,
      score: state.score + PATTERN_POP_3D_CONFIG.POINTS_PER_CORRECT,
      bubbles: state.bubbles.map((b) =>
        b.id === bubbleId ? { ...b, isPopped: true } : b
      ),
      feedback: 'Good! Keep going...',
    },
  };
}

// Highlight bubble during pattern display
export function highlightBubble(state: GameState, bubbleId: number): GameState {
  return {
    ...state,
    bubbles: state.bubbles.map((b) => ({
      ...b,
      isHighlighted: b.id === bubbleId,
    })),
  };
}

// Clear all highlights
export function clearHighlights(state: GameState): GameState {
  return {
    ...state,
    bubbles: state.bubbles.map((b) => ({ ...b, isHighlighted: false })),
  };
}

// End showing pattern phase
export function finishShowingPattern(state: GameState): GameState {
  return {
    ...state,
    isShowingPattern: false,
    bubbles: state.bubbles.map((b) => ({ ...b, isHighlighted: false, isPopped: false })),
    playerSequence: [],
    feedback: 'Your turn! Pop the bubbles in order.',
  };
}

// Get current pattern position
export function getCurrentPatternPosition(state: GameState): number {
  return state.playerSequence.length;
}

// Check if bubble is at pattern position (for hint)
export function isBubbleAtPatternPosition(
  state: GameState,
  bubbleId: number
): boolean {
  const nextPosition = state.playerSequence.length;
  return state.pattern.sequence[nextPosition] === bubbleId;
}
