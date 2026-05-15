/**
 * Virtual Bubbles 3D Game Logic Tests
 *
 * Tests for 3D bubble generation, popping, scoring, and game state management.
 *
 * @ticket TCK-20250411-001
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  VIRTUAL_BUBBLES_3D_CONFIG,
  BUBBLE_COLORS,
  createBubble3D,
  initializeGame,
  startGame,
  updateBubbles,
  checkBubblePop,
  endGame,
  getGameStats,
  getBubbleScale,
  getBubbleOpacity,
  type GameState,
} from '../virtualBubbles3DLogic';

describe('VIRTUAL_BUBBLES_3D_CONFIG', () => {
  it('has correct bubble count limits', () => {
    expect(VIRTUAL_BUBBLES_3D_CONFIG.MIN_BUBBLE_SIZE).toBe(0.2);
    expect(VIRTUAL_BUBBLES_3D_CONFIG.MAX_BUBBLE_SIZE).toBe(0.5);
  });

  it('has correct spawn rate', () => {
    expect(VIRTUAL_BUBBLES_3D_CONFIG.BUBBLE_SPAWN_RATE).toBe(1500);
  });

  it('has correct game duration', () => {
    expect(VIRTUAL_BUBBLES_3D_CONFIG.GAME_DURATION_SECONDS).toBe(60);
  });

  it('has correct scoring values', () => {
    expect(VIRTUAL_BUBBLES_3D_CONFIG.POINTS_PER_BUBBLE).toBe(10);
    expect(VIRTUAL_BUBBLES_3D_CONFIG.COMBO_WINDOW_MS).toBe(1000);
  });
});

describe('BUBBLE_COLORS', () => {
  it('has 10 colors', () => {
    expect(BUBBLE_COLORS).toHaveLength(10);
  });

  it('contains expected colors', () => {
    const bases = BUBBLE_COLORS.map((c) => c.base);
    expect(bases).toContain('#ff6b6b'); // Red
    expect(bases).toContain('#4ecdc4'); // Teal
    expect(bases).toContain('#45b7d1'); // Blue
  });

  it('all colors are valid hex codes', () => {
    BUBBLE_COLORS.forEach(color => {
      expect(color.base).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color.highlight).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('createBubble3D', () => {
  it('creates bubble with required properties', () => {
    const bubble = createBubble3D();
    expect(bubble.id).toBeDefined();
    expect(bubble.position.x).toBeDefined();
    expect(bubble.position.y).toBeDefined();
    expect(bubble.position.z).toBeDefined();
    expect(bubble.size).toBeGreaterThanOrEqual(VIRTUAL_BUBBLES_3D_CONFIG.MIN_BUBBLE_SIZE);
    expect(bubble.size).toBeLessThanOrEqual(VIRTUAL_BUBBLES_3D_CONFIG.MAX_BUBBLE_SIZE);
    expect(bubble.color).toBeDefined();
    expect(bubble.speed).toBeGreaterThan(0);
    expect(bubble.wobbleOffset).toBeDefined();
  });

  it('generates unique IDs', () => {
    const bubble1 = createBubble3D();
    const bubble2 = createBubble3D();
    expect(bubble1.id).not.toBe(bubble2.id);
  });
});

describe('initializeGame', () => {
  it('creates initial game state', () => {
    const state = initializeGame();
    expect(state.bubbles).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.poppedCount).toBe(0);
    expect(state.timeLeft).toBe(60);
    expect(state.isPlaying).toBe(false);
    expect(state.gameOver).toBe(false);
    expect(state.combo).toBe(0);
    expect(state.level).toBe(1);
  });
});

describe('startGame', () => {
  it('starts the game', () => {
    const state = initializeGame();
    const started = startGame(state);
    expect(started.isPlaying).toBe(true);
    expect(started.gameOver).toBe(false);
    expect(started.score).toBe(0);
    expect(started.poppedCount).toBe(0);
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

  it('decreases time', () => {
    const state = startGame(initializeGame());
    const updated = updateBubbles(state, 1000);
    expect(updated.timeLeft).toBeLessThan(60);
  });

  it('does not update when not playing', () => {
    const state = initializeGame();
    const updated = updateBubbles(state, 16);
    expect(updated.bubbles).toEqual([]);
  });
});

describe('checkBubblePop', () => {
  it('pops bubble when hand is close', () => {
    const state = startGame(initializeGame());
    const bubble = state.bubbles[0];
    bubble.position.z = 0;
    // Position hand directly on bubble
    const handX = (bubble.position.x / 10) + 0.5;
    const handY = (bubble.position.y / -6) + 0.5;

    const { result, newState } = checkBubblePop(state, handX, handY);

    expect(result.success).toBe(true);
    expect(result.points).toBeGreaterThan(0);
    expect(newState.bubbles.length).toBeLessThan(state.bubbles.length);
  });

  it('does not pop when hand is far', () => {
    const state = startGame(initializeGame());
    const { result, newState } = checkBubblePop(state, 0.5, 0.5);
    expect(result.success).toBe(false);
    expect(newState.bubbles.length).toBe(state.bubbles.length);
  });

  it('awards combo bonus', () => {
    const state = startGame(initializeGame());
    state.bubbles = [createBubble3D(), createBubble3D()];
    state.bubbles[0].position = { x: -2, y: 0, z: 0 };
    state.bubbles[1].position = { x: 2, y: 0, z: 0 };

    // Pop first bubble
    const handX1 = (state.bubbles[0].position.x / 10) + 0.5;
    const handY1 = (state.bubbles[0].position.y / -6) + 0.5;
    const { result: result1, newState: state1 } = checkBubblePop(state, handX1, handY1);
    expect(result1.success).toBe(true);

    // Pop second bubble quickly
    state1.bubbles = [state.bubbles[1]];
    const handX2 = (state1.bubbles[0].position.x / 10) + 0.5;
    const handY2 = (state1.bubbles[0].position.y / -6) + 0.5;
    const { result: result2, newState: state2 } = checkBubblePop(state1, handX2, handY2);

    expect(result2.success).toBe(true);
    expect(result2.comboBonus).toBeGreaterThan(0);
  });
});

describe('endGame', () => {
  it('ends the game', () => {
    const state = startGame(initializeGame());
    const ended = endGame(state);
    expect(ended.isPlaying).toBe(false);
    expect(ended.gameOver).toBe(true);
  });
});

describe('getGameStats', () => {
  it('returns correct stats', () => {
    const state = startGame(initializeGame());
    const stats = getGameStats(state);
    expect(stats.accuracy).toBe(0);
    expect(stats.currentBubbles).toBeGreaterThan(0);
  });
});

describe('getBubbleScale', () => {
  it('returns larger scale for closer bubbles', () => {
    const closeScale = getBubbleScale(2);
    const farScale = getBubbleScale(-2);
    expect(closeScale).toBeGreaterThan(farScale);
  });
});

describe('getBubbleOpacity', () => {
  it('returns higher opacity for closer bubbles', () => {
    const closeOpacity = getBubbleOpacity(2);
    const farOpacity = getBubbleOpacity(-2);
    expect(closeOpacity).toBeGreaterThan(farOpacity);
  });
});
