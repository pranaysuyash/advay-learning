/**
 * Logic Box Push Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState, startLevel, movePlayer, checkWin,
  submitLevel, resetLevel, LEVELS,
} from '../logicBoxPushLogic';

describe('Logic Box Push Logic', () => {
  it('creates initial state', () => {
    const state = createInitialState();
    expect(state.status).toBe('menu');
  });

  it('starts level', () => {
    const state = startLevel(createInitialState(), 'tutorial');
    expect(state.status).toBe('playing');
    expect(state.grid.length).toBeGreaterThan(0);
    expect(state.playerPos.x).toBe(1);
    expect(state.playerPos.y).toBe(1);
  });

  it('moves player', () => {
    let state = startLevel(createInitialState(), 'tutorial');
    state = movePlayer(state, 'right');
    expect(state.playerPos.x).toBe(2);
    expect(state.moves).toBe(1);
  });

  it('pushes box', () => {
    let state = startLevel(createInitialState(), 'tutorial');
    state = movePlayer(state, 'down');
    expect(state.pushes).toBe(1);
    expect(state.grid[2][1]).toBe('empty');
  });

  it('does not move into wall', () => {
    let state = startLevel(createInitialState(), 'tutorial');
    state = movePlayer(state, 'up');
    expect(state.playerPos.y).toBe(1);
    expect(state.moves).toBe(0);
  });

  it('checks win condition', () => {
    let state = startLevel(createInitialState(), 'tutorial');
    expect(checkWin(state)).toBe(false);
  });

  it('resets level', () => {
    let state = startLevel(createInitialState(), 'tutorial');
    state = movePlayer(state, 'right');
    state = resetLevel(state);
    expect(state.playerPos.x).toBe(1);
    expect(state.moves).toBe(0);
  });

  it('has multiple levels', () => {
    expect(LEVELS.length).toBeGreaterThan(1);
    expect(LEVELS[0].id).toBe('tutorial');
  });
});
