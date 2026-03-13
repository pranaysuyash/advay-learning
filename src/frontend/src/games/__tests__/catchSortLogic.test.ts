/**
 * Catch & Sort Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState, startChallenge, spawnObject, updateObjects,
  catchObject, updateTimer, submitChallenge, CHALLENGES, OBJECTS,
} from '../catchSortLogic';

describe('Catch & Sort Logic', () => {
  it('creates initial state', () => {
    const state = createInitialState();
    expect(state.status).toBe('menu');
    expect(state.objects).toEqual([]);
  });

  it('starts challenge', () => {
    const state = startChallenge(createInitialState(), 'fruits-only');
    expect(state.status).toBe('playing');
    expect(state.bins.length).toBe(1);
    expect(state.timeLeft).toBe(30);
  });

  it('spawns object', () => {
    let state = startChallenge(createInitialState(), 'fruits-only');
    state = spawnObject(state);
    expect(state.objects.length).toBe(1);
  });

  it('updates objects position', () => {
    let state = startChallenge(createInitialState(), 'fruits-only');
    state = spawnObject(state);
    const initialY = state.objects[0].y;
    state = updateObjects(state);
    expect(state.objects[0].y).toBeGreaterThan(initialY);
  });

  it('catches object correctly', () => {
    let state = startChallenge(createInitialState(), 'fruits-only');
    state = spawnObject(state);
    const objId = state.objects[0].id;
    const binId = state.bins[0].id;
    state = catchObject(state, objId, binId);
    expect(state.score).toBe(10);
    expect(state.caught).toBe(1);
  });

  it('penalizes wrong catch', () => {
    let state = startChallenge(createInitialState(), 'fruits-veggies');
    state = spawnObject(state);
    const objId = state.objects[0].id;
    const wrongBinId = state.bins.find((b) => b.type !== state.objects[0].type)?.id || '';
    if (wrongBinId) {
      state.score = 10; // Set initial score
      state = catchObject(state, objId, wrongBinId);
      expect(state.score).toBe(5); // 10 - 5 = 5
    }
  });

  it('updates timer', () => {
    let state = startChallenge(createInitialState(), 'fruits-only');
    state = updateTimer(state);
    expect(state.timeLeft).toBe(29);
  });

  it('submits challenge', () => {
    let state = startChallenge(createInitialState(), 'fruits-only');
    state.score = 15;
    state = submitChallenge(state);
    expect(state.status).toBe('success');
  });

  it('has challenges', () => {
    expect(CHALLENGES.length).toBeGreaterThan(0);
  });

  it('has object types', () => {
    expect(OBJECTS.fruit.length).toBeGreaterThan(0);
    expect(OBJECTS.vegetable.length).toBeGreaterThan(0);
  });
});
