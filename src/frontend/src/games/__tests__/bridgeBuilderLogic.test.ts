/**
 * Bridge Builder Logic Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialState, startChallenge, addSegment, removeSegment,
  calculateBridgeStrength, checkBridge, submitChallenge, clearBridge,
  CHALLENGES, SEGMENT_TYPES,
} from '../bridgeBuilderLogic';

describe('Bridge Builder Logic', () => {
  it('creates initial state', () => {
    const state = createInitialState();
    expect(state.status).toBe('menu');
    expect(state.segments).toEqual([]);
  });

  it('starts challenge', () => {
    const state = startChallenge(createInitialState(), 'small-creek');
    expect(state.status).toBe('playing');
    expect(state.segments).toEqual([]);
  });

  it('adds segment', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    state = addSegment(state, 50, 50, 'plank');
    expect(state.segments).toHaveLength(1);
    expect(state.segments[0].type).toBe('plank');
  });

  it('removes segment', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    state = addSegment(state, 50, 50, 'plank');
    const id = state.segments[0].id;
    state = addSegment(state, 60, 50, 'rope');
    state = removeSegment(state, id);
    expect(state.segments).toHaveLength(1);
  });

  it('calculates strength', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    state = addSegment(state, 50, 50, 'plank'); // strength 2
    state = addSegment(state, 60, 50, 'support'); // strength 3
    expect(calculateBridgeStrength(state)).toBe(5);
  });

  it('checks bridge too weak', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    state = addSegment(state, 50, 50, 'rope'); // strength 1
    const check = checkBridge(state);
    expect(check.valid).toBe(false);
  });

  it('checks bridge valid', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    state = addSegment(state, 50, 50, 'plank');
    state = addSegment(state, 60, 50, 'plank');
    const check = checkBridge(state);
    expect(check.valid).toBe(true);
  });

  it('submits valid bridge', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    for (let i = 0; i < 3; i++) state = addSegment(state, 50 + i * 10, 50, 'plank');
    state = submitChallenge(state);
    expect(state.status).toBe('success');
    expect(state.score).toBeGreaterThan(0);
  });

  it('clears bridge', () => {
    let state = startChallenge(createInitialState(), 'small-creek');
    state = addSegment(state, 50, 50, 'plank');
    state = clearBridge(state);
    expect(state.segments).toHaveLength(0);
  });

  it('has segment types', () => {
    expect(SEGMENT_TYPES.plank.strength).toBe(2);
    expect(SEGMENT_TYPES.rope.strength).toBe(1);
    expect(SEGMENT_TYPES.support.strength).toBe(3);
  });

  it('has challenges', () => {
    expect(CHALLENGES.length).toBeGreaterThan(0);
    expect(CHALLENGES[0].gapWidth).toBeGreaterThan(0);
  });
});
