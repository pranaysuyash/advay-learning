/**
 * Connect The Dots Game Logic
 *
 * Core logic for generating dots, hit detection, scoring,
 * and level progression for the connect-the-dots game.
 */

export interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DifficultyConfig {
  minDots: number;
  maxDots: number;
  timeLimit: number;
  radius: number;
}

export interface GameState {
  dots: Dot[];
  currentDotIndex: number;
  score: number;
  level: number;
  timeLeft: number;
  streak: number;
}

export const GAME_CONFIG = {
  MAX_LEVEL: 5,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  DOT_GENERATION_PADDING: 100,
  MIN_DOT_DISTANCE: 80,
} as const;

export const DIFFICULTY_CONFIG: Record<'easy' | 'medium' | 'hard', DifficultyConfig> = {
  easy: { minDots: 5, maxDots: 8, timeLimit: 90, radius: 35 },
  medium: { minDots: 7, maxDots: 12, timeLimit: 75, radius: 30 },
  hard: { minDots: 10, maxDots: 15, timeLimit: 60, radius: 25 },
};

/**
 * Calculate dot count for level and difficulty
 */
export function getDotCount(level: number, difficulty: keyof typeof DIFFICULTY_CONFIG): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  const baseDots = config.minDots + Math.floor((level - 1) * 1.5);
  return Math.min(baseDots, config.maxDots);
}

/**
 * Check if point is within hit radius of dot
 */
export function isHit(cursorX: number, cursorY: number, dotX: number, dotY: number, radius: number): boolean {
  const distance = Math.hypot(cursorX - dotX, cursorY - dotY);
  return distance <= radius;
}

/**
 * Generate a random position within canvas bounds
 */
export function generatePosition(random: () => number = Math.random): Point {
  const x = GAME_CONFIG.DOT_GENERATION_PADDING + random() * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.DOT_GENERATION_PADDING * 2);
  const y = GAME_CONFIG.DOT_GENERATION_PADDING + random() * (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.DOT_GENERATION_PADDING * 2);
  return { x, y };
}

/**
 * Check if position is too close to existing dots
 */
export function isTooClose(position: Point, dots: Dot[], minDistance: number = GAME_CONFIG.MIN_DOT_DISTANCE): boolean {
  return dots.some(dot => {
    const distance = Math.hypot(position.x - dot.x, position.y - dot.y);
    return distance < minDistance;
  });
}

/**
 * Generate dots for a level with overlap prevention
 */
export function generateDots(
  level: number,
  difficulty: keyof typeof DIFFICULTY_CONFIG,
  random: () => number = Math.random
): Dot[] {
  const numDots = getDotCount(level, difficulty);
  const dots: Dot[] = [];

  for (let i = 0; i < numDots; i++) {
    let attempts = 0;
    let position: Point;

    do {
      position = generatePosition(random);
      attempts++;
    } while (attempts < 50 && isTooClose(position, dots));

    dots.push({
      id: i,
      x: position.x,
      y: position.y,
      connected: false,
      number: i + 1,
    });
  }

  return dots;
}

/**
 * Calculate score with streak bonus
 */
export function calculateScore(streak: number): number {
  const basePoints = 10;
  const streakBonus = Math.min(streak * 2, 15);
  return basePoints + streakBonus;
}

/**
 * Calculate time bonus for level completion
 */
export function calculateTimeBonus(timeLeft: number): number {
  return timeLeft * 10;
}

/**
 * Check if all dots are connected
 */
export function isLevelComplete(dots: Dot[]): boolean {
  return dots.length > 0 && dots.every(dot => dot.connected);
}

/**
 * Mark a dot as connected
 */
export function connectDot(dots: Dot[], dotId: number): Dot[] {
  return dots.map(dot =>
    dot.id === dotId ? { ...dot, connected: true } : dot
  );
}

/**
 * Get the next dot that needs to be connected
 */
export function getCurrentDot(dots: Dot[]): Dot | null {
  return dots.find(dot => !dot.connected) || null;
}

/**
 * Check if game is complete (all 5 levels finished)
 */
export function isGameComplete(level: number, dots: Dot[]): boolean {
  return level >= GAME_CONFIG.MAX_LEVEL && isLevelComplete(dots);
}

/**
 * Calculate total score for a completed level
 */
export function calculateLevelScore(
  dotsConnected: number,
  streak: number,
  timeLeft: number
): number {
  const baseScore = dotsConnected * calculateScore(streak);
  const timeBonus = calculateTimeBonus(timeLeft);
  return baseScore + timeBonus;
}

/**
 * Get initial game state
 */
export function getInitialState(): GameState {
  return {
    dots: [],
    currentDotIndex: 0,
    score: 0,
    level: 1,
    timeLeft: DIFFICULTY_CONFIG.easy.timeLimit,
    streak: 0,
  };
}

/**
 * Advance to next level
 */
export function advanceLevel(currentState: GameState): GameState {
  const newLevel = Math.min(currentState.level + 1, GAME_CONFIG.MAX_LEVEL);
  return {
    ...currentState,
    level: newLevel,
    dots: [],
    currentDotIndex: 0,
    timeLeft: DIFFICULTY_CONFIG.easy.timeLimit,
  };
}

/**
 * Reset game state
 */
export function resetGame(): GameState {
  return getInitialState();
}

/**
 * Update game state when a dot is successfully connected
 */
export function handleDotConnected(
  state: GameState,
  dotId: number
): GameState {
  const newStreak = state.streak + 1;
  const newDots = connectDot(state.dots, dotId);
  const points = calculateScore(newStreak);

  return {
    ...state,
    dots: newDots,
    score: state.score + points,
    streak: newStreak,
  };
}

/**
 * Get difficulty settings for display
 */
export function getDifficultyDisplay(difficulty: keyof typeof DIFFICULTY_CONFIG): {
  name: string;
  description: string;
  emoji: string;
} {
  const displays = {
    easy: { name: 'Easy', description: '5-8 dots, 90 seconds', emoji: '🌱' },
    medium: { name: 'Medium', description: '7-12 dots, 75 seconds', emoji: '🌿' },
    hard: { name: 'Hard', description: '10-15 dots, 60 seconds', emoji: '🌳' },
  };
  return displays[difficulty];
}
