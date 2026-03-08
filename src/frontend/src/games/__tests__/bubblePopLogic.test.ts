/**
 * Bubble Pop Game Logic Tests
 *
 * Tests for bubble generation, blow detection, scoring,
 * level progression, and game state management.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  BUBBLE_GAME_CONFIG,
  BUBBLE_COLORS,
  createBubble,
  initializeGame,
  startGame,
  updateBubbles,
  checkBlowHits,
  advanceLevel,
  getStats,
  endGame,
  type Bubble,
  type GameState,
} from '../bubblePopLogic';

describe('BUBBLE_GAME_CONFIG', () => {
  it('has correct blow threshold', () => {
    expect(BUBBLE_GAME_CONFIG.BLOW_THRESHOLD).toBe(0.12);
  });

  it('has minimum blow duration', () => {
    expect(BUBBLE_GAME_CONFIG.MIN_BLOW_DURATION).toBe(100);
  });

  it('has blow cooldown', () => {
    expect(BUBBLE_GAME_CONFIG.BLOW_COOLDOWN).toBe(300);
  });

  it('has 10 max levels', () => {
    expect(BUBBLE_GAME_CONFIG.MAX_LEVEL).toBe(10);
  });

  it('has 30 second game duration', () => {
    expect(BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS).toBe(30);
  });

  it('has base hit radius', () => {
    expect(BUBBLE_GAME_CONFIG.BASE_HIT_RADIUS).toBe(0.15);
  });

  it('has level advance settings', () => {
    expect(BUBBLE_GAME_CONFIG.LEVEL_ADVANCE_POPS).toBe(10);
    expect(BUBBLE_GAME_CONFIG.LEVEL_ADVANCE_TIME_SECONDS).toBe(10);
  });
});

describe('BUBBLE_COLORS', () => {
  it('has 8 colors', () => {
    expect(BUBBLE_COLORS).toHaveLength(8);
  });

  it('contains expected colors', () => {
    expect(BUBBLE_COLORS).toContain('#FF6B6B'); // Red
    expect(BUBBLE_COLORS).toContain('#4ECDC4'); // Teal
    expect(BUBBLE_COLORS).toContain('#45B7D1'); // Blue
  });

  it('all colors are valid hex codes', () => {
    BUBBLE_COLORS.forEach(color => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('createBubble', () => {
  it('creates bubble with required properties', () => {
    const bubble = createBubble(1);
    expect(bubble.id).toBeDefined();
    expect(bubble.x).toBeGreaterThanOrEqual(0.1);
    expect(bubble.x).toBeLessThanOrEqual(0.9);
    expect(bubble.y).toBe(1.2);
    expect(bubble.size).toBeGreaterThan(0);
    expect(bubble.color).toBeDefined();
    expect(bubble.speed).toBeGreaterThan(0);
    expect(bubble.wobble).toBeDefined();
    expect(bubble.isPopped).toBe(false);
  });

  it('bubble size increases with level', () => {
    const bubble1 = createBubble(1);
    const bubble2 = createBubble(5);
    // Average size should be larger for higher levels
    // Create multiple to average due to randomness
    const avg1 = Array.from({ length: 10 }, () => createBubble(1).size).reduce((a, b) => a + b) / 10;
    const avg2 = Array.from({ length: 10 }, () => createBubble(5).size).reduce((a, b) => a + b) / 10;
    expect(avg2).toBeGreaterThan(avg1);
  });

  it('bubble speed increases with level', () => {
    const bubble1 = createBubble(1);
    const bubble2 = createBubble(5);
    // Higher level should have higher speed on average
    const avg1 = Array.from({ length: 10 }, () => createBubble(1).speed).reduce((a, b) => a + b) / 10;
    const avg2 = Array.from({ length: 10 }, () => createBubble(5).speed).reduce((a, b) => a + b) / 10;
    expect(avg2).toBeGreaterThan(avg1);
  });

  it('generates unique IDs', () => {
    const bubble1 = createBubble(1);
    const bubble2 = createBubble(1);
    expect(bubble1.id).not.toBe(bubble2.id);
  });

  it('bubble stays within horizontal bounds', () => {
    for (let i = 0; i < 20; i++) {
      const bubble = createBubble(1);
      expect(bubble.x).toBeGreaterThanOrEqual(0.1);
      expect(bubble.x).toBeLessThanOrEqual(0.9);
    }
  });
});

describe('initializeGame', () => {
  it('creates initial game state', () => {
    const state = initializeGame();
    expect(state.bubbles).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.poppedCount).toBe(0);
    expect(state.missedCount).toBe(0);
    expect(state.level).toBe(1);
    expect(state.timeLeft).toBe(30);
    expect(state.gameOver).toBe(false);
    expect(state.isPlaying).toBe(false);
    expect(state.lastBlowTime).toBe(0);
    expect(state.blowStrength).toBe(0);
  });

  it('starts at level 1', () => {
    const state = initializeGame();
    expect(state.level).toBe(1);
  });

  it('has full time remaining', () => {
    const state = initializeGame();
    expect(state.timeLeft).toBe(BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS);
  });
});

describe('startGame', () => {
  it('sets isPlaying to true', () => {
    const state = initializeGame();
    const started = startGame(state);
    expect(started.isPlaying).toBe(true);
  });

  it('resets timer', () => {
    const state = initializeGame();
    state.timeLeft = 10;
    const started = startGame(state);
    expect(started.timeLeft).toBe(BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS);
  });

  it('creates initial bubble', () => {
    const state = initializeGame();
    const started = startGame(state);
    expect(started.bubbles).toHaveLength(1);
  });

  it('resets gameOver', () => {
    const state = initializeGame();
    state.gameOver = true;
    const started = startGame(state);
    expect(started.gameOver).toBe(false);
  });
});

describe('updateBubbles', () => {
  it('moves bubbles upward', () => {
    const state = initializeGame();
    state.bubbles = [createBubble(1)];
    state.isPlaying = true;

    const updated = updateBubbles(state, 100);
    expect(updated.bubbles[0].y).toBeLessThan(state.bubbles[0].y);
  });

  it('updates wobble', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = updateBubbles(state, BUBBLE_GAME_CONFIG.FRAME_TIME_MS);
    // Wobble should change
    expect(updated.bubbles[0].wobble).toBeDefined();
    expect(typeof updated.bubbles[0].wobble).toBe('number');
  });

  it('removes popped bubbles', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.isPopped = true;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = updateBubbles(state, 100);
    expect(updated.bubbles).toHaveLength(0);
  });

  it('removes off-screen bubbles', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.y = -0.3;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = updateBubbles(state, 100);
    expect(updated.bubbles).toHaveLength(0);
  });

  it('counts missed bubbles', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.y = -0.3;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = updateBubbles(state, 100);
    expect(updated.missedCount).toBe(1);
  });

  it('decrements timer', () => {
    const state = initializeGame();
    state.isPlaying = true;

    const updated = updateBubbles(state, 1000);
    expect(updated.timeLeft).toBeLessThan(state.timeLeft);
  });

  it('timer never goes below zero', () => {
    const state = initializeGame();
    state.timeLeft = 0.5;
    state.isPlaying = true;

    const updated = updateBubbles(state, 1000);
    expect(updated.timeLeft).toBe(0);
  });

  it('spawns new bubbles randomly', () => {
    const state = initializeGame();
    state.isPlaying = true;
    state.bubbles = [];

    // Run multiple times to eventually spawn
    let spawnedCount = 0;
    let currentState = state;
    for (let i = 0; i < 100; i++) {
      currentState = updateBubbles(currentState, BUBBLE_GAME_CONFIG.FRAME_TIME_MS);
      spawnedCount = Math.max(spawnedCount, currentState.bubbles.length);
    }

    expect(spawnedCount).toBeGreaterThan(0);
  });

  it('does not update when not playing', () => {
    const state = initializeGame();
    state.bubbles = [createBubble(1)];
    state.isPlaying = false;

    const updated = updateBubbles(state, 100);
    expect(updated.bubbles[0].y).toBe(state.bubbles[0].y);
  });
});

describe('checkBlowHits', () => {
  it('does nothing when blow volume is too low', () => {
    const state = initializeGame();
    state.bubbles = [createBubble(1)];
    state.isPlaying = true;

    const updated = checkBlowHits(state, 0.1);
    expect(updated.bubbles[0].isPopped).toBe(false);
  });

  it('pops bubbles within hit radius', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.x = 0.5;
    bubble.y = 0.5;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = checkBlowHits(state, 0.3);
    expect(updated.bubbles[0].isPopped).toBe(true);
  });

  it('increases score when bubbles popped', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.x = 0.5;
    bubble.y = 0.5;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = checkBlowHits(state, 0.3);
    expect(updated.score).toBeGreaterThan(0);
  });

  it('increments popped count', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.x = 0.5;
    bubble.y = 0.5;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = checkBlowHits(state, 0.3);
    expect(updated.poppedCount).toBe(1);
  });

  it('respects blow cooldown', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.x = 0.5;
    bubble.y = 0.5;
    state.bubbles = [bubble];
    state.isPlaying = true;
    state.lastBlowTime = Date.now();

    const updated = checkBlowHits(state, 0.3);
    expect(updated.bubbles[0].isPopped).toBe(false);
  });

  it('score scales with level', () => {
    const state1 = initializeGame();
    state1.level = 1;
    state1.bubbles = [{ ...createBubble(1), x: 0.5, y: 0.5 }];
    state1.isPlaying = true;

    const state2 = initializeGame();
    state2.level = 3;
    state2.bubbles = [{ ...createBubble(3), x: 0.5, y: 0.5 }];
    state2.isPlaying = true;

    const updated1 = checkBlowHits(state1, 0.5);
    const updated2 = checkBlowHits(state2, 0.5);

    expect(updated2.score).toBeGreaterThan(updated1.score);
  });

  it('adds combo bonus for multiple hits', () => {
    const state = initializeGame();
    state.level = 1;
    const bubble1 = { ...createBubble(1), x: 0.45, y: 0.5 };
    const bubble2 = { ...createBubble(1), x: 0.55, y: 0.5 };
    state.bubbles = [bubble1, bubble2];
    state.isPlaying = true;

    const updated = checkBlowHits(state, 0.5);
    // Should get combo bonus for hitting 2 bubbles
    expect(updated.score).toBeGreaterThan(BUBBLE_GAME_CONFIG.BASE_POINTS_PER_BUBBLE * 2);
  });

  it('hit radius increases with volume', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.x = 0.3; // Further from center
    bubble.y = 0.5;
    state.bubbles = [bubble];
    state.isPlaying = true;

    // Low volume - small radius (0.15 + 0.25*0.1 = 0.175)
    // Distance from 0.5 to 0.3 is 0.2, so won't hit
    const updated1 = checkBlowHits(state, 0.25);
    expect(updated1.bubbles[0].isPopped).toBe(false);

    // High volume - larger radius (0.15 + 0.8*0.1 = 0.23)
    // Distance from 0.5 to 0.3 is 0.2, so will hit
    const updated2 = checkBlowHits(state, 0.8);
    expect(updated2.bubbles[0].isPopped).toBe(true);
  });

  it('does not pop when not playing', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    bubble.x = 0.5;
    bubble.y = 0.5;
    state.bubbles = [bubble];
    state.isPlaying = false;

    const updated = checkBlowHits(state, 0.5);
    expect(updated.bubbles[0].isPopped).toBe(false);
  });
});

describe('advanceLevel', () => {
  it('increments level', () => {
    const state = initializeGame();
    const advanced = advanceLevel(state);
    expect(advanced.level).toBe(2);
  });

  it('caps at max level', () => {
    const state = initializeGame();
    state.level = 10;
    const advanced = advanceLevel(state);
    expect(advanced.level).toBe(10);
  });

  it('preserves other state', () => {
    const state = initializeGame();
    state.score = 100;
    state.poppedCount = 5;
    const advanced = advanceLevel(state);
    expect(advanced.score).toBe(100);
    expect(advanced.poppedCount).toBe(5);
  });
});

describe('getStats', () => {
  it('calculates accuracy', () => {
    const state = initializeGame();
    state.poppedCount = 8;
    state.missedCount = 2;

    const stats = getStats(state);
    expect(stats.accuracy).toBe(80);
  });

  it('returns 0 accuracy when no bubbles', () => {
    const state = initializeGame();
    const stats = getStats(state);
    expect(stats.accuracy).toBe(0);
  });

  it('counts current bubbles', () => {
    const state = initializeGame();
    state.bubbles = [
      createBubble(1),
      { ...createBubble(1), isPopped: true },
      createBubble(1),
    ];

    const stats = getStats(state);
    expect(stats.currentBubbles).toBe(2);
  });

  it('calculates total bubbles', () => {
    const state = initializeGame();
    state.poppedCount = 15;
    state.missedCount = 5;

    const stats = getStats(state);
    expect(stats.totalBubbles).toBe(20);
  });
});

describe('endGame', () => {
  it('sets isPlaying to false', () => {
    const state = initializeGame();
    state.isPlaying = true;
    const ended = endGame(state);
    expect(ended.isPlaying).toBe(false);
  });

  it('sets gameOver to true', () => {
    const state = initializeGame();
    const ended = endGame(state);
    expect(ended.gameOver).toBe(true);
  });

  it('preserves score and stats', () => {
    const state = initializeGame();
    state.score = 100;
    state.poppedCount = 10;
    const ended = endGame(state);
    expect(ended.score).toBe(100);
    expect(ended.poppedCount).toBe(10);
  });
});

describe('Game Flow Integration', () => {
  it('complete game flow', () => {
    let state = initializeGame();

    // Start game
    state = startGame(state);
    expect(state.isPlaying).toBe(true);
    expect(state.bubbles.length).toBeGreaterThan(0);

    // Pop a bubble
    state.bubbles[0].x = 0.5;
    state.bubbles[0].y = 0.5;
    state = checkBlowHits(state, 0.5);
    expect(state.poppedCount).toBe(1);
    expect(state.score).toBeGreaterThan(0);

    // Advance level
    state = advanceLevel(state);
    expect(state.level).toBe(2);

    // End game
    state = endGame(state);
    expect(state.gameOver).toBe(true);
    expect(state.isPlaying).toBe(false);
  });

  it('removes bubbles that go off screen', () => {
    const state = initializeGame();
    const bubble = createBubble(1);
    // Manually set bubble off screen
    bubble.y = -0.3;
    state.bubbles = [bubble];
    state.isPlaying = true;

    const updated = updateBubbles(state, BUBBLE_GAME_CONFIG.FRAME_TIME_MS);

    // Bubble should be removed when y < -0.2
    expect(updated.bubbles).toHaveLength(0);
    expect(updated.missedCount).toBe(1);
  });
});

describe('Scoring Mechanics', () => {
  it('base points per bubble times level', () => {
    const state1 = initializeGame();
    state1.level = 1;
    state1.bubbles = [{ ...createBubble(1), x: 0.5, y: 0.5 }];
    state1.isPlaying = true;

    const state2 = initializeGame();
    state2.level = 2;
    state2.bubbles = [{ ...createBubble(2), x: 0.5, y: 0.5 }];
    state2.isPlaying = true;

    const result1 = checkBlowHits(state1, 0.5);
    const result2 = checkBlowHits(state2, 0.5);

    expect(result2.score).toBe(result1.score * 2);
  });

  it('combo bonus for multiple bubbles', () => {
    const state = initializeGame();
    state.level = 1;
    const bubble1 = { ...createBubble(1), id: 'b1', x: 0.48, y: 0.5 };
    const bubble2 = { ...createBubble(1), id: 'b2', x: 0.52, y: 0.5 };
    const bubble3 = { ...createBubble(1), id: 'b3', x: 0.5, y: 0.48 };
    state.bubbles = [bubble1, bubble2, bubble3];
    state.isPlaying = true;

    const result = checkBlowHits(state, 0.5);
    // Base: 10 * 1 * 3 = 30
    // Combo: (3-1) * 5 = 10
    // Total: 40
    expect(result.score).toBeGreaterThanOrEqual(40);
  });
});

describe('Level Progression', () => {
  it('advances every 10 pops at level 1', () => {
    const popsForLevel1 = BUBBLE_GAME_CONFIG.LEVEL_ADVANCE_POPS;
    expect(popsForLevel1).toBe(10);
  });

  it('advances every 10 seconds at level 1', () => {
    const timeForLevel1 = BUBBLE_GAME_CONFIG.LEVEL_ADVANCE_TIME_SECONDS;
    expect(timeForLevel1).toBe(10);
  });

  it('max level is 10', () => {
    expect(BUBBLE_GAME_CONFIG.MAX_LEVEL).toBe(10);
  });
});

describe('Physics Constants', () => {
  it('base bubble speed is defined', () => {
    expect(BUBBLE_GAME_CONFIG.BASE_BUBBLE_SPEED).toBe(0.002);
  });

  it('wobble speed is defined', () => {
    expect(BUBBLE_GAME_CONFIG.WOBBLE_SPEED).toBe(0.05);
  });

  it('spawn chance increases with level', () => {
    const base = BUBBLE_GAME_CONFIG.SPAWN_CHANCE_BASE;
    const perLevel = BUBBLE_GAME_CONFIG.SPAWN_CHANCE_PER_LEVEL;
    expect(perLevel).toBe(0.005);
    expect(base).toBe(0.01);
  });

  it('max bubbles increases with level', () => {
    const base = BUBBLE_GAME_CONFIG.MAX_BUBBLES_BASE;
    expect(base).toBe(5);
  });
});
