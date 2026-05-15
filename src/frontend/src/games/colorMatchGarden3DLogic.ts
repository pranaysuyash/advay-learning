/**
 * Color Match Garden 3D Game Logic
 *
 * Match colorful 3D flowers in the garden.
 * Educational value: Color recognition, matching, visual discrimination
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const COLOR_MATCH_GARDEN_3D_CONFIG = {
  // Flower settings
  FLOWER_COUNT: 8,
  FLOWER_SIZE: 0.5,
  MATCH_RADIUS: 0.7,

  // Colors
  COLORS: [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#8b5cf6' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Cyan', hex: '#06b6d4' },
  ],

  // Scoring
  POINTS_PER_MATCH: 20,
  STREAK_MULTIPLIER: 1.2,

  // Game settings
  GAME_DURATION_SECONDS: 60,
  MATCHES_PER_ROUND: 5,

  // 3D space
  GARDEN_SIZE: 8,
  FLOWER_HEIGHT: 0.3,
} as const;

// Types
export interface Flower3D {
  id: string;
  color: typeof COLOR_MATCH_GARDEN_3D_CONFIG.COLORS[number];
  position: { x: number; y: number; z: number };
  matched: boolean;
  swayOffset: number;
}

export interface GameState {
  flowers: Flower3D[];
  targetColor: typeof COLOR_MATCH_GARDEN_3D_CONFIG.COLORS[number] | null;
  score: number;
  matches: number;
  streak: number;
  timeLeft: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
}

export interface MatchResult {
  success: boolean;
  isCorrect: boolean;
  points: number;
  feedback: string;
}

// Generate unique ID
function generateId(): string {
  return `cmg3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create a flower in 3D garden
function createFlower3D(index: number): Flower3D {
  const color = COLOR_MATCH_GARDEN_3D_CONFIG.COLORS[index % COLOR_MATCH_GARDEN_3D_CONFIG.COLORS.length];
  const angle = (index / COLOR_MATCH_GARDEN_3D_CONFIG.FLOWER_COUNT) * Math.PI * 2;
  const radius = 2 + Math.random() * 2;

  return {
    id: generateId(),
    color,
    position: {
      x: Math.cos(angle) * radius,
      y: COLOR_MATCH_GARDEN_3D_CONFIG.FLOWER_HEIGHT,
      z: Math.sin(angle) * radius,
    },
    matched: false,
    swayOffset: Math.random() * Math.PI * 2,
  };
}

// Generate garden with flowers
export function generateGarden(): Flower3D[] {
  const flowers: Flower3D[] = [];
  for (let i = 0; i < COLOR_MATCH_GARDEN_3D_CONFIG.FLOWER_COUNT; i++) {
    flowers.push(createFlower3D(i));
  }
  return flowers;
}

// Pick a random target color
export function pickTargetColor(flowers: Flower3D[]): typeof COLOR_MATCH_GARDEN_3D_CONFIG.COLORS[number] {
  const unmatched = flowers.filter((f) => !f.matched);
  if (unmatched.length === 0) {
    return COLOR_MATCH_GARDEN_3D_CONFIG.COLORS[0];
  }
  const randomFlower = unmatched[Math.floor(Math.random() * unmatched.length)];
  return randomFlower.color;
}

// Initialize game
export function initializeGame(): GameState {
  return {
    flowers: [],
    targetColor: null,
    score: 0,
    matches: 0,
    streak: 0,
    timeLeft: COLOR_MATCH_GARDEN_3D_CONFIG.GAME_DURATION_SECONDS,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Match the flowers!',
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  const flowers = generateGarden();
  const targetColor = pickTargetColor(flowers);

  return {
    ...initializeGame(),
    flowers,
    targetColor,
    isPlaying: true,
    feedback: `Find ${targetColor.name} flowers!`,
  };
}

// Update flowers (call each frame)
export function updateFlowers(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;

  const updatedFlowers = state.flowers.map((flower) => ({
    ...flower,
    position: {
      ...flower.position,
      x: flower.position.x + Math.sin(Date.now() * 0.001 + flower.swayOffset) * 0.001,
    },
  }));

  return {
    ...state,
    flowers: updatedFlowers,
    timeLeft: Math.max(0, state.timeLeft - deltaTime / 1000),
    gameOver: state.timeLeft <= 0,
  };
}

// Check if player matched a flower
export function checkMatch(
  state: GameState,
  handX: number,
  handY: number,
): { result: MatchResult; newState: GameState } {
  if (!state.isPlaying || !state.targetColor) {
    return {
      result: { success: false, isCorrect: false, points: 0, feedback: 'Not playing' },
      newState: state,
    };
  }

  // Convert to 3D space
  const cursorX = (handX - 0.5) * 10;
  const cursorY = (handY - 0.5) * -6;

  // Find closest unmatched flower
  let closestFlower: Flower3D | null = null;
  let closestDistance = Infinity;

  for (const flower of state.flowers) {
    if (flower.matched) continue;

    const dx = cursorX - flower.position.x;
    const dy = cursorY - flower.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < COLOR_MATCH_GARDEN_3D_CONFIG.MATCH_RADIUS && distance < closestDistance) {
      closestDistance = distance;
      closestFlower = flower;
    }
  }

  if (!closestFlower) {
    return {
      result: { success: false, isCorrect: false, points: 0, feedback: 'No flower nearby' },
      newState: state,
    };
  }

  // Check if color matches target
  const isCorrect = closestFlower.color.name === state.targetColor.name;

  if (!isCorrect) {
    return {
      result: {
        success: false,
        isCorrect: false,
        points: 0,
        feedback: `That's ${closestFlower.color.name}, find ${state.targetColor.name}!`,
      },
      newState: {
        ...state,
        streak: 0,
        feedback: `That's ${closestFlower.color.name}, find ${state.targetColor.name}!`,
      },
    };
  }

  // Correct match!
  const newMatches = state.matches + 1;
  const isRoundComplete = newMatches >= COLOR_MATCH_GARDEN_3D_CONFIG.MATCHES_PER_ROUND;
  const points = Math.floor(
    COLOR_MATCH_GARDEN_3D_CONFIG.POINTS_PER_MATCH * Math.pow(COLOR_MATCH_GARDEN_3D_CONFIG.STREAK_MULTIPLIER, state.streak)
  );

  // Mark flower as matched
  const updatedFlowers = state.flowers.map((f) =>
    f.id === closestFlower!.id ? { ...f, matched: true } : f
  );

  // Pick new target
  const newTargetColor = pickTargetColor(updatedFlowers);

  return {
    result: {
      success: true,
      isCorrect: true,
      points,
      feedback: isRoundComplete ? 'Garden complete! You win!' : `Great! Now find ${newTargetColor.name}!`,
    },
    newState: {
      ...state,
      flowers: updatedFlowers,
      score: state.score + points,
      matches: newMatches,
      streak: state.streak + 1,
      targetColor: newTargetColor,
      isPlaying: !isRoundComplete,
      gameWon: isRoundComplete,
      feedback: isRoundComplete ? 'Garden complete! You win!' : `Great! Now find ${newTargetColor.name}!`,
    },
  };
}

// Get remaining matches
export function getRemainingMatches(state: GameState): number {
  return COLOR_MATCH_GARDEN_3D_CONFIG.MATCHES_PER_ROUND - state.matches;
}

// Get progress
export function getProgress(state: GameState): number {
  return (state.matches / COLOR_MATCH_GARDEN_3D_CONFIG.MATCHES_PER_ROUND) * 100;
}
