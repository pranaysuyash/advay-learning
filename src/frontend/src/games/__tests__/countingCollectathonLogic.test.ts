/**
 * Counting Collect-a-thon Game Logic Tests
 *
 * Tests for game state management, scoring, round progression,
 * and collision detection.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  startGame,
  updatePlayerPosition,
  spawnItem,
  updateItems,
  checkCollisions,
  updateTimer,
  advanceRound,
  calculateFinalScore,
  getItemEmoji,
  getCollectFeedback,
  DEFAULT_CONFIG,
  type GameState,
  type ItemType,
} from '../countingCollectathonLogic';

describe('CountingCollectathon Logic - Initial State', () => {
  it('should create initial state with correct defaults', () => {
    const state = createInitialState();

    expect(state.status).toBe('READY');
    expect(state.currentRound).toBe(1);
    expect(state.totalRounds).toBe(5);
    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.collected).toBe(0);
    expect(state.items).toHaveLength(0);
  });

  it('should have correct target for first round (age band B)', () => {
    const state = createInitialState({ ...DEFAULT_CONFIG, ageBand: 'B' });

    expect(state.targetCount).toBe(3);
    expect(state.targetType).toBe('star');
  });

  it('should have correct target for first round (age band A)', () => {
    const state = createInitialState({ ...DEFAULT_CONFIG, ageBand: 'A' });

    expect(state.targetCount).toBe(2);
    expect(state.targetType).toBe('star');
  });
});

describe('CountingCollectathon Logic - Game Start', () => {
  it('should transition from READY to PLAYING on startGame', () => {
    const initialState = createInitialState();
    const state = startGame(initialState, DEFAULT_CONFIG);

    expect(state.status).toBe('PLAYING');
    expect(state.timeRemaining).toBeGreaterThan(0);
  });

  it('should reset score and streak on game start', () => {
    const initialState = createInitialState();
    initialState.score = 100;
    initialState.streak = 5;

    const state = startGame(initialState, DEFAULT_CONFIG);

    expect(state.score).toBe(0);
    expect(state.streak).toBe(0);
  });
});

describe('CountingCollectathon Logic - Player Movement', () => {
  it('should update player X position based on hand position', () => {
    const state = createInitialState();
    state.status = 'PLAYING';

    const newState = updatePlayerPosition(state, 400, DEFAULT_CONFIG);

    expect(newState.playerX).toBe(400 - DEFAULT_CONFIG.playerWidth / 2);
  });

  it('should clamp player position to canvas bounds', () => {
    const state = createInitialState();
    state.status = 'PLAYING';

    const leftState = updatePlayerPosition(state, -100, DEFAULT_CONFIG);
    expect(leftState.playerX).toBe(0);

    const rightState = updatePlayerPosition(state, 1000, DEFAULT_CONFIG);
    expect(rightState.playerX).toBe(DEFAULT_CONFIG.canvasWidth - DEFAULT_CONFIG.playerWidth);
  });

  it('should not update player position when game is not PLAYING', () => {
    const state = createInitialState();
    state.status = 'READY';
    state.playerX = 100;

    const newState = updatePlayerPosition(state, 400, DEFAULT_CONFIG);

    expect(newState.playerX).toBe(100);
  });

  it('should reject NaN input and preserve last valid position', () => {
    const state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;

    const newState = updatePlayerPosition(state, NaN, DEFAULT_CONFIG);

    expect(newState.playerX).toBe(100); // Unchanged
  });

  it('should reject Infinity input and preserve last valid position', () => {
    const state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;

    const newState = updatePlayerPosition(state, Infinity, DEFAULT_CONFIG);

    expect(newState.playerX).toBe(100); // Unchanged
  });

  it('should reject -Infinity input and preserve last valid position', () => {
    const state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;

    const newState = updatePlayerPosition(state, -Infinity, DEFAULT_CONFIG);

    expect(newState.playerX).toBe(100); // Unchanged
  });
});

describe('CountingCollectathon Logic - Item Spawning', () => {
  it('should spawn an item when spawnItem is called', () => {
    const state = createInitialState();
    state.status = 'PLAYING';

    const newState = spawnItem(state, DEFAULT_CONFIG);

    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].active).toBe(true);
  });

  it('should not spawn items when game is not PLAYING', () => {
    const state = createInitialState();
    state.status = 'READY';

    const newState = spawnItem(state, DEFAULT_CONFIG);

    expect(newState.items).toHaveLength(0);
  });

  it('should not exceed max items on screen', () => {
    const state = createInitialState();
    state.status = 'PLAYING';

    let currentState = state;
    for (let i = 0; i < 20; i++) {
      currentState = spawnItem(currentState, DEFAULT_CONFIG);
    }

    expect(currentState.items.length).toBeLessThanOrEqual(DEFAULT_CONFIG.maxItemsOnScreen);
  });

  it('should assign sequential IDs to spawned items', () => {
    let state = createInitialState();
    state.status = 'PLAYING';

    state = spawnItem(state, DEFAULT_CONFIG);
    state = spawnItem(state, DEFAULT_CONFIG);
    state = spawnItem(state, DEFAULT_CONFIG);

    expect(state.items[0].id).toBe(0);
    expect(state.items[1].id).toBe(1);
    expect(state.items[2].id).toBe(2);
    expect(state.nextItemId).toBe(3);
  });

  it('should reset item ID counter on new game', () => {
    let state = createInitialState();
    state.status = 'PLAYING';

    // Spawn some items in first game
    state = spawnItem(state, DEFAULT_CONFIG);
    state = spawnItem(state, DEFAULT_CONFIG);
    expect(state.nextItemId).toBe(2);

    // Start new game
    state = startGame(state, DEFAULT_CONFIG);
    state.status = 'PLAYING';

    // First item in new game should have ID 0
    state = spawnItem(state, DEFAULT_CONFIG);
    expect(state.items[0].id).toBe(0);
    expect(state.nextItemId).toBe(1);
  });
});

describe('CountingCollectathon Logic - Item Updates', () => {
  it('should update item positions based on velocity', () => {
    let state = createInitialState();
    state.status = 'PLAYING';
    state = spawnItem(state, DEFAULT_CONFIG);

    const newState = updateItems(state, DEFAULT_CONFIG, 1 / 60);

    expect(newState.items[0].y).toBeGreaterThan(-DEFAULT_CONFIG.itemHeight);
  });

  it('should remove items that fall below canvas', () => {
    let state = createInitialState();
    state.status = 'PLAYING';
    state = spawnItem(state, DEFAULT_CONFIG);
    state.items[0].y = DEFAULT_CONFIG.canvasHeight + 100;

    const newState = updateItems(state, DEFAULT_CONFIG, 1);

    expect(newState.items).toHaveLength(0);
  });
});

describe('CountingCollectathon Logic - Collision Detection', () => {
  it('should detect collision when item overlaps player', () => {
    let state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;
    state.playerY = DEFAULT_CONFIG.groundY - DEFAULT_CONFIG.playerHeight;
    state = spawnItem(state, DEFAULT_CONFIG);

    state.items[0].x = 120;
    state.items[0].y = state.playerY + 10;

    const { state: newState, collected, correct } = checkCollisions(state, DEFAULT_CONFIG);

    expect(collected).toBe(true);
    expect(newState.items[0].active).toBe(false);
  });

  it('should increment collected count on correct item', () => {
    let state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;
    state.playerY = DEFAULT_CONFIG.groundY - DEFAULT_CONFIG.playerHeight;
    state.targetType = 'star';
    state = spawnItem(state, DEFAULT_CONFIG);

    state.items[0].type = 'star';
    state.items[0].x = 120;
    state.items[0].y = state.playerY + 10;

    const { state: newState } = checkCollisions(state, DEFAULT_CONFIG);

    expect(newState.collected).toBe(1);
    expect(newState.streak).toBe(1);
    expect(newState.score).toBeGreaterThan(0);
  });

  it('should reset streak on wrong item', () => {
    let state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;
    state.playerY = DEFAULT_CONFIG.groundY - DEFAULT_CONFIG.playerHeight;
    state.streak = 5;
    state.targetType = 'star';
    state = spawnItem(state, DEFAULT_CONFIG);

    state.items[0].type = 'coin';
    state.items[0].x = 120;
    state.items[0].y = state.playerY + 10;

    const { state: newState } = checkCollisions(state, DEFAULT_CONFIG);

    expect(newState.streak).toBe(0);
  });

  it('should complete round when target reached', () => {
    let state = createInitialState();
    state.status = 'PLAYING';
    state.playerX = 100;
    state.playerY = DEFAULT_CONFIG.groundY - DEFAULT_CONFIG.playerHeight;
    state.targetCount = 1;
    state.collected = 0;
    state = spawnItem(state, DEFAULT_CONFIG);

    state.items[0].type = state.targetType;
    state.items[0].x = 120;
    state.items[0].y = state.playerY + 10;

    const { state: newState } = checkCollisions(state, DEFAULT_CONFIG);

    expect(newState.status).toBe('ROUND_COMPLETE');
  });
});

describe('CountingCollectathon Logic - Timer', () => {
  it('should decrement timer', () => {
    const state = createInitialState();
    state.status = 'PLAYING';
    state.timeRemaining = 30;

    const newState = updateTimer(state, 1);

    expect(newState.timeRemaining).toBe(29);
  });

  it('should not go below zero', () => {
    const state = createInitialState();
    state.status = 'PLAYING';
    state.timeRemaining = 0.5;

    const newState = updateTimer(state, 1);

    expect(newState.timeRemaining).toBe(0);
  });

  it('should end game when timer reaches zero', () => {
    const state = createInitialState();
    state.status = 'PLAYING';
    state.timeRemaining = 0.5;

    const newState = updateTimer(state, 1);

    expect(newState.status).toBe('GAME_COMPLETE');
  });
});

describe('CountingCollectathon Logic - Round Progression', () => {
  it('should advance to next round', () => {
    let state = createInitialState();
    state.status = 'ROUND_COMPLETE';
    state.currentRound = 1;

    const newState = advanceRound(state, DEFAULT_CONFIG);

    expect(newState.currentRound).toBe(2);
    expect(newState.status).toBe('PLAYING');
    expect(newState.collected).toBe(0);
  });

  it('should complete game after final round', () => {
    let state = createInitialState();
    state.status = 'ROUND_COMPLETE';
    state.currentRound = 5;
    state.totalRounds = 5;

    const newState = advanceRound(state, DEFAULT_CONFIG);

    expect(newState.status).toBe('GAME_COMPLETE');
  });
});

describe('CountingCollectathon Logic - Scoring', () => {
  it('should calculate final score with time and round bonus', () => {
    const state: GameState = {
      status: 'GAME_COMPLETE',
      currentRound: 5,
      totalRounds: 5,
      score: 100,
      streak: 3,
      timeRemaining: 20,
      collected: 10,
      targetCount: 10,
      targetType: 'star' as ItemType,
      items: [],
      playerX: 0,
      playerY: 0,
      nextItemId: 0,
      rounds: [],
    };

    const finalScore = calculateFinalScore(state);

    expect(finalScore).toBe(100 + 20 * 2 + 5 * 50);
  });
});

describe('CountingCollectathon Logic - Helpers', () => {
  it('should return correct emoji for each item type', () => {
    expect(getItemEmoji('star')).toBe('⭐');
    expect(getItemEmoji('coin')).toBe('🪙');
    expect(getItemEmoji('gem')).toBe('💎');
  });

  it('should return correct feedback messages', () => {
    const feedback1 = getCollectFeedback(true, 1);
    expect(feedback1.message).toBe('Good!');
    expect(feedback1.emoji).toBe('✨');

    const feedback2 = getCollectFeedback(true, 5);
    expect(feedback2.message).toBe('Amazing!');
    expect(feedback2.emoji).toBe('🎉');

    const feedback3 = getCollectFeedback(false, 0);
    expect(feedback3.message).toBe('Oops!');
    expect(feedback3.emoji).toBe('😕');
  });
});
