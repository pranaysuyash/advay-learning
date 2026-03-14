import { afterEach, describe, expect, it, vi } from 'vitest';
import { Vector3 } from 'three';
import { createTower } from '../utils/generateTower';
import { JengaGameState } from './GameState';

describe('JengaGameState', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts non-classic modes without an active roll target', () => {
    const state = new JengaGameState(createTower(), 'diceSingle', 1);

    expect(state.hasActiveTarget).toBe(false);
    expect(state.targetNumbers).toEqual([]);
    expect(state.diceFaces).toEqual([]);
  });

  it('rolls a single die for single-dice mode', () => {
    const state = new JengaGameState(createTower(), 'diceSingle', 1);
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    state.generateNewTarget();

    expect(state.diceFaces).toEqual([3]);
    expect(state.diceValue).toBe(3);
    expect(state.targetNumbers).toEqual([3]);
    expect(state.hasActiveTarget).toBe(true);
  });

  it('rolls two dice and uses their sum for double-dice mode', () => {
    const state = new JengaGameState(createTower(), 'diceDouble', 1);
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0)
      .mockReturnValueOnce(0.99);
    state.generateNewTarget();

    expect(state.diceFaces).toHaveLength(2);
    expect(state.diceFaces.every((face) => face >= 1 && face <= 6)).toBe(true);
    expect(state.diceValue).toBe(state.diceFaces[0] + state.diceFaces[1]);
    expect(state.targetNumbers).toEqual([state.diceValue]);
    expect(state.mathProblem?.answer).toBe(state.diceValue);
  });

  it('builds math targets from valid operations and concatenation', () => {
    const state = new JengaGameState(createTower(), 'math', 1);
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.4);
    state.generateNewTarget();

    expect(state.diceFaces).toEqual([2, 3]);
    expect(state.targetNumbers).toEqual([1, 5, 6, 23, 32]);
  });

  it('does not reroll while a grab is already in progress', () => {
    const state = new JengaGameState(createTower(), 'diceSingle', 1);
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    state.generateNewTarget();
    const originalTargets = state.targetNumbers;
    const targetBlock = state.getValidTargets()[0];

    expect(targetBlock).toBeDefined();
    expect(state.grabBlock(targetBlock)).toBe(true);

    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    state.generateNewTarget();

    expect(state.targetNumbers).toEqual(originalTargets);
  });

  it('reset clears roll state for non-classic modes', () => {
    const state = new JengaGameState(createTower(), 'diceSingle', 1);
    vi.spyOn(Math, 'random').mockReturnValue(0.4);
    state.generateNewTarget();
    state.reset();

    expect(state.phase).toBe('select');
    expect(state.targetNumbers).toEqual([]);
    expect(state.diceFaces).toEqual([]);
    expect(state.hasActiveTarget).toBe(false);
  });

  it('cancelGrab restores the grabbed block transform and returns to select', () => {
    const state = new JengaGameState(createTower(), 'classic', 1);
    const target = state.getValidTargets()[0];

    expect(state.grabBlock(target)).toBe(true);
    const start = target.position.clone();
    target.setPosition(start.clone().add(new Vector3(1, 0, 0)));
    state.cancelGrab();

    expect(state.phase).toBe('select');
    expect(target.state).toBe('inTower');
    expect(target.position.distanceTo(start)).toBeLessThan(0.001);
  });

  it('awards score and streak on successful placement', () => {
    const state = new JengaGameState(createTower(), 'classic', 1);
    const target = state.getValidTargets()[0];

    expect(state.grabBlock(target)).toBe(true);
    state.startExtract();
    expect(state.completeExtract()).toBe(true);
    expect(state.placeOnTop()).toBe(true);

    const stats = state.getStats();
    expect(stats.score).toBeGreaterThan(0);
    expect(stats.streak).toBe(1);
  });
});
