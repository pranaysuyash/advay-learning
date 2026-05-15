/**
 * Bubble Pop 3D Game Logic Tests
 *
 * Tests for bubble popping with hand tracking in 3D space.
 *
 * @ticket TCK-20250411-001
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  BUBBLE_POP_3D_CONFIG,
  IRIDESCENT_COLORS,
  createBubble3D,
  initializeGame,
  startGame,
  updateBubbles,
  checkPop,
  advanceLevel,
  getDepthScale,
  getStats,
  type GameState,
} from '../bubblePop3DLogic';

describe('BUBBLE_POP_3D_CONFIG', () => {
  it('has correct bubble size limits', () => {
    expect(BUBBLE_POP_3D_CONFIG.MIN_BUBBLE_SIZE).toBe(0.3);
    expect(BUBBLE_POP_3D_CONFIG.MAX_BUBBLE_SIZE).toBe(0.6);
  });

  it('has correct spawn interval', () => {
    expect(BUBBLE_POP_3D_CONFIG.SPAWN_INTERVAL).toBe(2000);
  });

  it('has correct lives', () => {
    expect(BUBBLE_POP_3D_CONFIG.INITIAL_LIVES).toBe(3);
  });

  it('has correct scoring', () => {
    expect(BUBBLE_POP_3D_CONFIG.POINTS_PER_BUBBLE).toBe(10);
    expect(BUBBLE_POP_3D_CONFIG.PERFECT_POP_BONUS).toBe(5);
  });

  it('has correct level count', () => {
    expect(BUBBLE_POP_3D_CONFIG.MAX_LEVEL).toBe(3);
  });
});

describe('IRIDESCENT_COLORS', () => {
  it('has 5 color sets', () => {
    expect(IRIDESCENT_COLORS).toHaveLength(5);
  });

  it('each color has primary, secondary, and accent', () => {
    IRIDESCENT_COLORS.forEach(color => {
      expect(color.primary).toBeDefined();
      expect(color.secondary).toBeDefined();
      expect(color.accent).toBeDefined();
    });
  });
});

describe('createBubble3D', () => {
  it('creates bubble with correct properties', () => {
    const bubble = createBubble3D(1);
    expect(bubble.id).toBeDefined();
    expect(bubble.color).toBeDefined();
    expect(bubble.size).toBeGreaterThanOrEqual(BUBBLE_POP_3D_CONFIG.MIN_BUBBLE_SIZE);
    expect(bubble.position.x).toBeDefined();
    expect(bubble.position.y).toBeLessThan(0);
  });

  it('bubble speed increases with level', () => {
    const bubble1 = createBubble3D(1);
    const bubble3 = createBubble3D(3);
    expect(bubble3.speed).toBeGreaterThan(bubble1.speed);
  });
});

describe('initializeGame', () => {
  it('creates correct initial state', () => {
    const state = initializeGame();
    expect(state.bubbles).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.level).toBe(1);
    expect(state.bubblesPopped).toBe(0);
    expect(state.isPlaying).toBe(false);
  });
});

describe('startGame', () => {
  it('starts game correctly', () => {
    const state = initializeGame();
    const started = startGame(state);
    expect(started.isPlaying).toBe(true);
    expect(started.bubbles.length).toBeGreaterThan(0);
  });
});

describe('updateBubbles', () => {
  it('moves bubbles up', () => {
    const state = startGame(initializeGame());
    const initialY = state.bubbles[0].position.y;
    const updated = updateBubbles(state, 16);
    expect(updated.bubbles[0].position.y).toBeGreaterThan(initialY);
  });

  it('removes bubbles that float too high', () => {
    const state = startGame(initializeGame());
    state.bubbles[0].position.y = 4.5;
    const updated = updateBubbles(state, 16);
    expect(updated.bubbles.length).toBeLessThan(state.bubbles.length);
    expect(updated.lives).toBeLessThan(state.lives);
  });
});

describe('checkPop', () => {
  it('pops bubble when hand hits it', () => {
    const state = startGame(initializeGame());
    const bubble = state.bubbles[0];
    // Calculate hand position for bubble
    const handX = (bubble.position.x / 12) + 0.5;
    const handY = (bubble.position.y / -8) + 0.5;

    const { result, newState } = checkPop(state, handX, handY);

    expect(result.success).toBe(true);
    expect(result.bubbleId).toBeTruthy();
    expect(result.points).toBeGreaterThan(0);
    expect(newState.bubblesPopped).toBe(1);
  });

  it('awards perfect pop bonus', () => {
    const state = startGame(initializeGame());
    const bubble = state.bubbles[0];
    // Direct hit (center)
    const handX = (bubble.position.x / 12) + 0.5;
    const handY = (bubble.position.y / -8) + 0.5;

    const { result } = checkPop(state, handX, handY);
    expect(result.isPerfect).toBe(true);
    expect(result.points).toBe(15); // 10 + 5
  });

  it('does not pop when hand misses', () => {
    const state = startGame(initializeGame());
    const { result } = checkPop(state, 0, 0);
    expect(result.success).toBe(false);
  });
});

describe('advanceLevel', () => {
  it('advances to next level', () => {
    const state = startGame(initializeGame());
    const advanced = advanceLevel(state);
    expect(advanced.level).toBe(2);
  });

  it('wins game at max level', () => {
    const state = startGame(initializeGame());
    state.level = BUBBLE_POP_3D_CONFIG.MAX_LEVEL;
    const advanced = advanceLevel(state);
    expect(advanced.gameWon).toBe(true);
    expect(advanced.isPlaying).toBe(false);
  });
});

describe('getDepthScale', () => {
  it('returns scale based on depth', () => {
    const close = getDepthScale(3);
    const far = getDepthScale(-3);
    expect(close).toBeGreaterThan(far);
  });
});

describe('getStats', () => {
  it('returns game stats', () => {
    const state = startGame(initializeGame());
    const stats = getStats(state);
    expect(stats.accuracy).toBe(0);
    expect(stats.bubblesRemaining).toBeGreaterThan(0);
  });
});
