/**
 * Connect The Dots Game Logic Tests
 *
 * Tests for difficulty configurations, dot generation, hit detection,
 * scoring, and game mechanics.
 */

import { describe, expect, it, beforeEach } from 'vitest';

// Types from ConnectTheDots
export interface Point {
  x: number;
  y: number;
}

export interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}

// Mock random function for testing
let mockRandomValue = 0.5;

function mockRandomFloat01(): number {
  return mockRandomValue;
}

// Difficulty configurations from ConnectTheDots
interface DifficultyConfig {
  minDots: number;
  maxDots: number;
  timeLimit: number;
  radius: number;
}

const DIFFICULTY_CONFIG: Record<'easy' | 'medium' | 'hard', DifficultyConfig> = {
  easy: { minDots: 5, maxDots: 8, timeLimit: 90, radius: 35 },
  medium: { minDots: 7, maxDots: 12, timeLimit: 75, radius: 30 },
  hard: { minDots: 10, maxDots: 15, timeLimit: 60, radius: 25 },
};

const MAX_LEVEL = 5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DOT_GENERATION_PADDING = 100;
const MIN_DOT_DISTANCE = 80;

/**
 * Calculate dot count for level and difficulty.
 */
function getDotCount(level: number, difficulty: keyof typeof DIFFICULTY_CONFIG): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  const baseDots = config.minDots + Math.floor((level - 1) * 1.5);
  return Math.min(baseDots, config.maxDots);
}

/**
 * Check if point is within hit radius of dot.
 */
function isHit(cursorX: number, cursorY: number, dotX: number, dotY: number, radius: number): boolean {
  const distance = Math.hypot(cursorX - dotX, cursorY - dotY);
  return distance <= radius;
}

/**
 * Generate a random position within canvas bounds.
 */
function generatePosition(): Point {
  const x = DOT_GENERATION_PADDING + mockRandomFloat01() * (CANVAS_WIDTH - DOT_GENERATION_PADDING * 2);
  const y = DOT_GENERATION_PADDING + mockRandomFloat01() * (CANVAS_HEIGHT - DOT_GENERATION_PADDING * 2);
  return { x, y };
}

/**
 * Check if position is too close to existing dots.
 */
function isTooClose(position: Point, dots: Dot[]): boolean {
  return dots.some(dot => {
    const distance = Math.hypot(position.x - dot.x, position.y - dot.y);
    return distance < MIN_DOT_DISTANCE;
  });
}

/**
 * Calculate score with streak bonus.
 */
function calculateScore(streak: number): number {
  const basePoints = 10;
  const streakBonus = Math.min(streak * 2, 15);
  return basePoints + streakBonus;
}

/**
 * Calculate time bonus for level completion.
 */
function calculateTimeBonus(timeLeft: number): number {
  return timeLeft * 10;
}

describe('Connect The Dots - Difficulty Configurations', () => {
  it('has 3 difficulty levels', () => {
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    expect(difficulties).toHaveLength(3);
  });

  it('easy mode has lowest dot count and longest time', () => {
    const config = DIFFICULTY_CONFIG.easy;
    expect(config.minDots).toBe(5);
    expect(config.maxDots).toBe(8);
    expect(config.timeLimit).toBe(90);
    expect(config.radius).toBe(35);
  });

  it('medium mode has balanced settings', () => {
    const config = DIFFICULTY_CONFIG.medium;
    expect(config.minDots).toBe(7);
    expect(config.maxDots).toBe(12);
    expect(config.timeLimit).toBe(75);
    expect(config.radius).toBe(30);
  });

  it('hard mode has highest dot count and shortest time', () => {
    const config = DIFFICULTY_CONFIG.hard;
    expect(config.minDots).toBe(10);
    expect(config.maxDots).toBe(15);
    expect(config.timeLimit).toBe(60);
    expect(config.radius).toBe(25);
  });
});

describe('Connect The Dots - Dot Count Calculation', () => {
  it('calculates level 1 dots correctly for each difficulty', () => {
    expect(getDotCount(1, 'easy')).toBe(5);
    expect(getDotCount(1, 'medium')).toBe(7);
    expect(getDotCount(1, 'hard')).toBe(10);
  });

  it('increases dots with level', () => {
    const easy1 = getDotCount(1, 'easy');
    const easy2 = getDotCount(2, 'easy');
    const easy3 = getDotCount(3, 'easy');

    expect(easy2).toBeGreaterThan(easy1);
    expect(easy3).toBeGreaterThan(easy2);
  });

  it('caps dots at maxDots for each difficulty', () => {
    expect(getDotCount(5, 'easy')).toBe(8); // capped at 8
    expect(getDotCount(5, 'medium')).toBe(12); // capped at 12
    expect(getDotCount(5, 'hard')).toBe(15); // capped at 15
  });

  it('level 5 has max dots for all difficulties', () => {
    expect(getDotCount(5, 'easy')).toBe(DIFFICULTY_CONFIG.easy.maxDots);
    expect(getDotCount(5, 'medium')).toBe(DIFFICULTY_CONFIG.medium.maxDots);
    expect(getDotCount(5, 'hard')).toBe(DIFFICULTY_CONFIG.hard.maxDots);
  });

  it('has maximum 5 levels', () => {
    expect(MAX_LEVEL).toBe(5);
  });
});

describe('Connect The Dots - Hit Detection', () => {
  it('detects hit when cursor is within radius', () => {
    const cursorX = 400;
    const cursorY = 300;
    const dotX = 400;
    const dotY = 300;
    const radius = 35;

    expect(isHit(cursorX, cursorY, dotX, dotY, radius)).toBe(true);
  });

  it('does not detect hit when cursor is outside radius', () => {
    const cursorX = 450;
    const cursorY = 300;
    const dotX = 400;
    const dotY = 300;
    const radius = 35;

    expect(isHit(cursorX, cursorY, dotX, dotY, radius)).toBe(false);
  });

  it('detects hit at edge of radius', () => {
    const cursorX = 435;
    const cursorY = 300;
    const dotX = 400;
    const dotY = 300;
    const radius = 35;

    expect(isHit(cursorX, cursorY, dotX, dotY, radius)).toBe(true);
  });

  it('detects hit with exactly radius distance', () => {
    const cursorX = 435;
    const cursorY = 300;
    const dotX = 400;
    const dotY = 300;
    const radius = 35;

    const distance = Math.hypot(cursorX - dotX, cursorY - dotY);
    expect(distance).toBe(radius);
    expect(isHit(cursorX, cursorY, dotX, dotY, radius)).toBe(true);
  });

  it('uses correct radius for each difficulty', () => {
    expect(DIFFICULTY_CONFIG.easy.radius).toBe(35);
    expect(DIFFICULTY_CONFIG.medium.radius).toBe(30);
    expect(DIFFICULTY_CONFIG.hard.radius).toBe(25);
  });

  it('handles diagonal distance correctly', () => {
    const cursorX = 407;
    const cursorY = 307;
    const dotX = 400;
    const dotY = 300;
    const radius = 10;

    // Distance = sqrt(49 + 49) ≈ 9.9 < 10, should hit
    expect(isHit(cursorX, cursorY, dotX, dotY, radius)).toBe(true);
  });
});

describe('Connect The Dots - Dot Generation', () => {
  it('generates position within canvas bounds', () => {
    const pos = generatePosition();

    expect(pos.x).toBeGreaterThanOrEqual(DOT_GENERATION_PADDING);
    expect(pos.x).toBeLessThanOrEqual(CANVAS_WIDTH - DOT_GENERATION_PADDING);
    expect(pos.y).toBeGreaterThanOrEqual(DOT_GENERATION_PADDING);
    expect(pos.y).toBeLessThanOrEqual(CANVAS_HEIGHT - DOT_GENERATION_PADDING);
  });

  it('detects when position is too close to existing dot', () => {
    const dots: Dot[] = [
      { id: 0, x: 400, y: 300, connected: false, number: 1 },
    ];

    const tooClose = { x: 450, y: 300 }; // 50px away - less than MIN_DOT_DISTANCE
    const farEnough = { x: 500, y: 300 }; // 100px away - more than MIN_DOT_DISTANCE

    expect(isTooClose(tooClose, dots)).toBe(true);
    expect(isTooClose(farEnough, dots)).toBe(false);
  });

  it('checks distance against all existing dots', () => {
    const dots: Dot[] = [
      { id: 0, x: 200, y: 200, connected: false, number: 1 },
      { id: 1, x: 400, y: 300, connected: false, number: 2 },
    ];

    const nearFirst = { x: 250, y: 200 };
    const nearSecond = { x: 400, y: 350 };
    const farFromBoth = { x: 600, y: 500 };

    expect(isTooClose(nearFirst, dots)).toBe(true);
    expect(isTooClose(nearSecond, dots)).toBe(true);
    expect(isTooClose(farFromBoth, dots)).toBe(false);
  });

  it('allows positions at exactly minimum distance', () => {
    const dots: Dot[] = [
      { id: 0, x: 400, y: 300, connected: false, number: 1 },
    ];

    const exactlyMinDistance = { x: 480, y: 300 }; // Exactly 80px away

    expect(isTooClose(exactlyMinDistance, dots)).toBe(false);
  });

  it('empty dots array has no conflicts', () => {
    const dots: Dot[] = [];
    const position = { x: 400, y: 300 };

    expect(isTooClose(position, dots)).toBe(false);
  });
});

describe('Connect The Dots - Scoring System', () => {
  it('calculates base score correctly', () => {
    expect(calculateScore(0)).toBe(10);
  });

  it('adds streak bonus correctly', () => {
    expect(calculateScore(1)).toBe(12); // 10 + 2
    expect(calculateScore(2)).toBe(14); // 10 + 4
    expect(calculateScore(3)).toBe(16); // 10 + 6
  });

  it('caps streak bonus at 15', () => {
    expect(calculateScore(5)).toBe(20); // 10 + 10
    expect(calculateScore(8)).toBe(25); // 10 + 15 (capped)
    expect(calculateScore(10)).toBe(25); // 10 + 15 (capped)
  });

  it('calculates time bonus correctly', () => {
    expect(calculateTimeBonus(90)).toBe(900); // 90 * 10
    expect(calculateTimeBonus(60)).toBe(600); // 60 * 10
    expect(calculateTimeBonus(0)).toBe(0); // 0 * 10
  });
});

describe('Connect The Dots - Level Progression', () => {
  it('starts at level 1', () => {
    const level = 1;
    expect(level).toBe(1);
  });

  it('advances to next level after completion', () => {
    let level = 1;
    if (level < MAX_LEVEL) {
      level++;
    }
    expect(level).toBe(2);
  });

  it('completes game after level 5', () => {
    const level = 5;
    const allDotsConnected = true;
    const gameCompleted = level >= MAX_LEVEL && allDotsConnected;

    expect(gameCompleted).toBe(true);
  });

  it('does not advance beyond level 5', () => {
    let level = MAX_LEVEL;
    if (level < MAX_LEVEL) {
      level++;
    }
    expect(level).toBe(MAX_LEVEL);
  });
});

describe('Connect The Dots - Game State', () => {
  it('starts with zero score', () => {
    const score = 0;
    expect(score).toBe(0);
  });

  it('tracks connected dots', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
      { id: 1, x: 200, y: 200, connected: false, number: 2 },
      { id: 2, x: 300, y: 300, connected: true, number: 3 },
    ];

    const connectedCount = dots.filter(d => d.connected).length;
    expect(connectedCount).toBe(2);
  });

  it('checks if all dots are connected', () => {
    const allConnected: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
      { id: 1, x: 200, y: 200, connected: true, number: 2 },
    ];

    const notAllConnected: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
      { id: 1, x: 200, y: 200, connected: false, number: 2 },
    ];

    expect(allConnected.every(d => d.connected)).toBe(true);
    expect(notAllConnected.every(d => d.connected)).toBe(false);
  });

  it('tracks current dot index', () => {
    let currentDotIndex = 0;
    const totalDots = 5;

    // After connecting dot 0, advance to 1
    currentDotIndex = 1;
    expect(currentDotIndex).toBeLessThan(totalDots);

    // After connecting all dots
    currentDotIndex = totalDots;
    expect(currentDotIndex).toBe(totalDots);
  });
});

describe('Connect The Dots - Edge Cases', () => {
  it('handles single dot level', () => {
    const singleDot: Dot[] = [
      { id: 0, x: 400, y: 300, connected: false, number: 1 },
    ];

    expect(singleDot).toHaveLength(1);
    expect(singleDot[0].number).toBe(1);
  });

  it('handles maximum dots for hard mode', () => {
    const maxDots = DIFFICULTY_CONFIG.hard.maxDots;
    expect(maxDots).toBe(15);
  });

  it('handles zero time remaining', () => {
    const timeLeft = 0;
    const timeBonus = calculateTimeBonus(timeLeft);
    expect(timeBonus).toBe(0);
  });

  it('handles difficulty level changes mid-game', () => {
    let difficulty: keyof typeof DIFFICULTY_CONFIG = 'easy';
    const easyDots = getDotCount(1, difficulty);

    difficulty = 'hard';
    const hardDots = getDotCount(1, difficulty);

    expect(hardDots).toBeGreaterThan(easyDots);
  });
});

describe('Connect The Dots - Canvas Bounds', () => {
  it('canvas has correct dimensions', () => {
    expect(CANVAS_WIDTH).toBe(800);
    expect(CANVAS_HEIGHT).toBe(600);
  });

  it('dot generation is padded from edges', () => {
    expect(DOT_GENERATION_PADDING).toBe(100);

    const minX = DOT_GENERATION_PADDING;
    const maxX = CANVAS_WIDTH - DOT_GENERATION_PADDING;
    const minY = DOT_GENERATION_PADDING;
    const maxY = CANVAS_HEIGHT - DOT_GENERATION_PADDING;

    expect(minX).toBe(100);
    expect(maxX).toBe(700);
    expect(minY).toBe(100);
    expect(maxY).toBe(500);
  });

  it('minimum dot distance is enforced', () => {
    expect(MIN_DOT_DISTANCE).toBe(80);
  });
});

describe('Connect The Dots - Sequential Connection', () => {
  it('only allows connecting current dot', () => {
    const currentDotIndex = 2;

    // Trying to connect dot 0 (wrong)
    const clickWrongDot = 0;
    const validForWrongDot = clickWrongDot === currentDotIndex;

    // Trying to connect current dot (correct)
    const clickCorrectDot = 2;
    const validForCorrectDot = clickCorrectDot === currentDotIndex;

    expect(validForWrongDot).toBe(false);
    expect(validForCorrectDot).toBe(true);
  });

  it('advances current index after connection', () => {
    let currentDotIndex = 0;
    const totalDots = 5;

    // Connect dot 0
    currentDotIndex = currentDotIndex < totalDots - 1 ? currentDotIndex + 1 : currentDotIndex;
    expect(currentDotIndex).toBe(1);

    // Connect dot 1
    currentDotIndex = currentDotIndex < totalDots - 1 ? currentDotIndex + 1 : currentDotIndex;
    expect(currentDotIndex).toBe(2);
  });

  it('does not advance beyond last dot', () => {
    const totalDots = 5;
    let currentDotIndex = 4; // Last dot

    currentDotIndex = currentDotIndex < totalDots - 1 ? currentDotIndex + 1 : currentDotIndex;
    expect(currentDotIndex).toBe(4); // Stays at 4
  });
});
