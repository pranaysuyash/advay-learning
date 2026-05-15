/**
 * Connect The Dots Game Logic Tests
 *
 * Tests for the standalone connectTheDotsLogic module.
 */

import { describe, expect, it } from 'vitest';

import {
  calculateLevelScore,
  calculateScore,
  calculateTimeBonus,
  connectDot,
  DIFFICULTY_CONFIG,
  GAME_CONFIG,
  generateDots,
  generatePosition,
  getCurrentDot,
  getDifficultyDisplay,
  getDotCount,
  getInitialState,
  handleDotConnected,
  isGameComplete,
  isHit,
  isLevelComplete,
  isTooClose,
  resetGame,
  type Dot,
} from '../connectTheDotsLogic';

describe('GAME_CONFIG', () => {
  it('has correct canvas dimensions', () => {
    expect(GAME_CONFIG.CANVAS_WIDTH).toBe(800);
    expect(GAME_CONFIG.CANVAS_HEIGHT).toBe(600);
  });

  it('has correct padding', () => {
    expect(GAME_CONFIG.DOT_GENERATION_PADDING).toBe(100);
  });

  it('has correct minimum dot distance', () => {
    expect(GAME_CONFIG.MIN_DOT_DISTANCE).toBe(80);
  });

  it('has max level of 5', () => {
    expect(GAME_CONFIG.MAX_LEVEL).toBe(5);
  });
});

describe('DIFFICULTY_CONFIG', () => {
  it('has 3 difficulty levels', () => {
    expect(Object.keys(DIFFICULTY_CONFIG)).toHaveLength(3);
    expect(DIFFICULTY_CONFIG.easy).toBeDefined();
    expect(DIFFICULTY_CONFIG.medium).toBeDefined();
    expect(DIFFICULTY_CONFIG.hard).toBeDefined();
  });

  it('easy has lowest dot count and longest time', () => {
    expect(DIFFICULTY_CONFIG.easy.minDots).toBe(5);
    expect(DIFFICULTY_CONFIG.easy.maxDots).toBe(8);
    expect(DIFFICULTY_CONFIG.easy.timeLimit).toBe(90);
    expect(DIFFICULTY_CONFIG.easy.radius).toBe(35);
  });

  it('hard has highest dot count and shortest time', () => {
    expect(DIFFICULTY_CONFIG.hard.minDots).toBe(10);
    expect(DIFFICULTY_CONFIG.hard.maxDots).toBe(15);
    expect(DIFFICULTY_CONFIG.hard.timeLimit).toBe(60);
    expect(DIFFICULTY_CONFIG.hard.radius).toBe(25);
  });
});

describe('getDotCount', () => {
  it('calculates level 1 dots correctly', () => {
    expect(getDotCount(1, 'easy')).toBe(5);
    expect(getDotCount(1, 'medium')).toBe(7);
    expect(getDotCount(1, 'hard')).toBe(10);
  });

  it('increases dots with level', () => {
    expect(getDotCount(2, 'easy')).toBeGreaterThan(getDotCount(1, 'easy'));
    expect(getDotCount(3, 'easy')).toBeGreaterThan(getDotCount(2, 'easy'));
  });

  it('caps dots at maxDots', () => {
    expect(getDotCount(10, 'easy')).toBe(DIFFICULTY_CONFIG.easy.maxDots);
    expect(getDotCount(10, 'hard')).toBe(DIFFICULTY_CONFIG.hard.maxDots);
  });
});

describe('isHit', () => {
  it('detects hit when cursor is on dot', () => {
    expect(isHit(100, 100, 100, 100, 35)).toBe(true);
  });

  it('detects hit when cursor is within radius', () => {
    expect(isHit(120, 100, 100, 100, 35)).toBe(true);
    expect(isHit(100, 130, 100, 100, 35)).toBe(true);
  });

  it('does not detect hit when cursor is outside radius', () => {
    expect(isHit(200, 100, 100, 100, 35)).toBe(false);
  });

  it('detects hit at exactly radius distance', () => {
    expect(isHit(135, 100, 100, 100, 35)).toBe(true);
  });
});

describe('generatePosition', () => {
  it('generates position within canvas bounds', () => {
    const pos = generatePosition();
    expect(pos.x).toBeGreaterThanOrEqual(GAME_CONFIG.DOT_GENERATION_PADDING);
    expect(pos.x).toBeLessThanOrEqual(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.DOT_GENERATION_PADDING);
    expect(pos.y).toBeGreaterThanOrEqual(GAME_CONFIG.DOT_GENERATION_PADDING);
    expect(pos.y).toBeLessThanOrEqual(GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.DOT_GENERATION_PADDING);
  });

  it('uses provided random function', () => {
    const pos = generatePosition(() => 0.5);
    const expectedX = GAME_CONFIG.DOT_GENERATION_PADDING + 0.5 * (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.DOT_GENERATION_PADDING * 2);
    expect(pos.x).toBe(expectedX);
  });
});

describe('isTooClose', () => {
  it('returns true when position is too close', () => {
    const dots: Dot[] = [{ id: 0, x: 100, y: 100, connected: false, number: 1 }];
    expect(isTooClose({ x: 120, y: 100 }, dots)).toBe(true);
  });

  it('returns false when position is far enough', () => {
    const dots: Dot[] = [{ id: 0, x: 100, y: 100, connected: false, number: 1 }];
    expect(isTooClose({ x: 200, y: 100 }, dots)).toBe(false);
  });

  it('returns false for empty dots array', () => {
    expect(isTooClose({ x: 100, y: 100 }, [])).toBe(false);
  });

  it('checks distance against all dots', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: false, number: 1 },
      { id: 1, x: 300, y: 300, connected: false, number: 2 },
    ];
    expect(isTooClose({ x: 320, y: 300 }, dots)).toBe(true);
    expect(isTooClose({ x: 200, y: 200 }, dots)).toBe(false);
  });
});

describe('generateDots', () => {
  it('generates correct number of dots', () => {
    const dots = generateDots(1, 'easy', () => 0.5);
    expect(dots.length).toBe(getDotCount(1, 'easy'));
  });

  it('assigns sequential numbers', () => {
    const dots = generateDots(1, 'easy', () => 0.5);
    dots.forEach((dot, index) => {
      expect(dot.number).toBe(index + 1);
    });
  });

  it('all dots start unconnected', () => {
    const dots = generateDots(1, 'easy', () => 0.5);
    expect(dots.every(d => !d.connected)).toBe(true);
  });

  it('generates unique IDs', () => {
    const dots = generateDots(1, 'easy', () => 0.5);
    const ids = new Set(dots.map(d => d.id));
    expect(ids.size).toBe(dots.length);
  });
});

describe('calculateScore', () => {
  it('calculates base score correctly', () => {
    expect(calculateScore(0)).toBe(10);
  });

  it('adds streak bonus', () => {
    expect(calculateScore(1)).toBe(12);
    expect(calculateScore(5)).toBe(20);
  });

  it('caps streak bonus at 15', () => {
    expect(calculateScore(8)).toBe(25);
    expect(calculateScore(10)).toBe(25);
  });
});

describe('calculateTimeBonus', () => {
  it('calculates correctly', () => {
    expect(calculateTimeBonus(90)).toBe(900);
    expect(calculateTimeBonus(60)).toBe(600);
    expect(calculateTimeBonus(0)).toBe(0);
  });
});

describe('isLevelComplete', () => {
  it('returns true when all dots connected', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
      { id: 1, x: 200, y: 200, connected: true, number: 2 },
    ];
    expect(isLevelComplete(dots)).toBe(true);
  });

  it('returns false when some dots unconnected', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
      { id: 1, x: 200, y: 200, connected: false, number: 2 },
    ];
    expect(isLevelComplete(dots)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(isLevelComplete([])).toBe(false);
  });
});

describe('connectDot', () => {
  it('marks specified dot as connected', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: false, number: 1 },
      { id: 1, x: 200, y: 200, connected: false, number: 2 },
    ];
    const updated = connectDot(dots, 0);
    expect(updated[0].connected).toBe(true);
    expect(updated[1].connected).toBe(false);
  });

  it('does not modify other dots', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: false, number: 1 },
      { id: 1, x: 200, y: 200, connected: false, number: 2 },
    ];
    const updated = connectDot(dots, 0);
    expect(updated[1]).toEqual(dots[1]);
  });

  it('returns new array (immutable)', () => {
    const dots: Dot[] = [{ id: 0, x: 100, y: 100, connected: false, number: 1 }];
    const updated = connectDot(dots, 0);
    expect(updated).not.toBe(dots);
  });
});

describe('getCurrentDot', () => {
  it('returns first unconnected dot', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
      { id: 1, x: 200, y: 200, connected: false, number: 2 },
    ];
    expect(getCurrentDot(dots)?.id).toBe(1);
  });

  it('returns null when all connected', () => {
    const dots: Dot[] = [
      { id: 0, x: 100, y: 100, connected: true, number: 1 },
    ];
    expect(getCurrentDot(dots)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(getCurrentDot([])).toBeNull();
  });
});

describe('isGameComplete', () => {
  it('returns true at max level with all dots connected', () => {
    const dots: Dot[] = [{ id: 0, x: 100, y: 100, connected: true, number: 1 }];
    expect(isGameComplete(5, dots)).toBe(true);
  });

  it('returns false when not at max level', () => {
    const dots: Dot[] = [{ id: 0, x: 100, y: 100, connected: true, number: 1 }];
    expect(isGameComplete(3, dots)).toBe(false);
  });

  it('returns false when dots not connected', () => {
    const dots: Dot[] = [{ id: 0, x: 100, y: 100, connected: false, number: 1 }];
    expect(isGameComplete(5, dots)).toBe(false);
  });
});

describe('calculateLevelScore', () => {
  it('calculates base score with streak', () => {
    const score = calculateLevelScore(5, 2, 60);
    const expectedBase = 5 * calculateScore(2);
    expect(score).toBe(expectedBase + 600);
  });

  it('includes time bonus', () => {
    const score30 = calculateLevelScore(5, 0, 30);
    const score60 = calculateLevelScore(5, 0, 60);
    expect(score60).toBeGreaterThan(score30);
  });
});

describe('getInitialState', () => {
  it('returns initial game state', () => {
    const state = getInitialState();
    expect(state.dots).toEqual([]);
    expect(state.currentDotIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.streak).toBe(0);
  });
});

describe('handleDotConnected', () => {
  it('connects dot and updates score', () => {
    const state = {
      ...getInitialState(),
      dots: [
        { id: 0, x: 100, y: 100, connected: false, number: 1 },
        { id: 1, x: 200, y: 200, connected: false, number: 2 },
      ],
    };
    const updated = handleDotConnected(state, 0);
    expect(updated.dots[0].connected).toBe(true);
    expect(updated.score).toBeGreaterThan(0);
    expect(updated.streak).toBe(1);
  });
});

describe('resetGame', () => {
  it('returns fresh initial state', () => {
    const state = { ...getInitialState(), score: 100 };
    const reset = resetGame();
    expect(reset.score).toBe(0);
  });
});

describe('getDifficultyDisplay', () => {
  it('returns display info for easy', () => {
    const display = getDifficultyDisplay('easy');
    expect(display.name).toBe('Easy');
    expect(display.emoji).toBe('🌱');
  });

  it('returns display info for hard', () => {
    const display = getDifficultyDisplay('hard');
    expect(display.name).toBe('Hard');
    expect(display.emoji).toBe('🌳');
  });
});
