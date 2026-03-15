import { describe, it, expect } from 'vitest';
import { 
  initGameState, 
  updateGameState, 
  checkCollision, 
  INITIAL_CONFIG 
} from '../midlineViolatorLogic';

describe('MidlineViolator Logic', () => {
  it('should initialize with default state', () => {
    const state = initGameState();
    expect(state.score).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.targets).toHaveLength(0);
  });

  describe('checkCollision', () => {
    const target = {
      id: 'test',
      x: 0.8, // Right side
      y: 0.5,
      radius: 0.1,
      targetHand: 'Left' as const, // Must use Left hand for Right side
      isHit: false,
      spawnTime: 0,
      type: 'gem' as const
    };

    it('detects a correct hit: Left hand on Right side target', () => {
      const landmark = { x: 0.81, y: 0.51 };
      const result = checkCollision(landmark, target, true);
      expect(result.hit).toBe(true);
      expect(result.correctHand).toBe(true);
    });

    it('detects an incorrect hit: Right hand on Right side target', () => {
      const landmark = { x: 0.81, y: 0.51 };
      const result = checkCollision(landmark, target, false);
      expect(result.hit).toBe(true);
      expect(result.correctHand).toBe(false);
    });

    it('detects no hit: Point far from target', () => {
      const landmark = { x: 0.2, y: 0.2 };
      const result = checkCollision(landmark, target, true);
      expect(result.hit).toBe(false);
    });
  });

  describe('updateGameState', () => {
    it('should spawn targets over time', () => {
      let state = initGameState();
      state.isPlaying = true;
      
      // Update with no landmarks
      state = updateGameState(state, 1000, 16, null); // Time 1000
      state = updateGameState(state, 4000, 16, null); // Time 4000 (exceeds 3000ms spawn interval)
      
      expect(state.targets.length).toBeGreaterThan(0);
    });

    it('should end game when time runs out', () => {
      let state = initGameState();
      state.isPlaying = true;
      state.timeLeft = 0.1;
      
      state = updateGameState(state, 100, 200, null);
      
      expect(state.isGameOver).toBe(true);
      expect(state.isPlaying).toBe(false);
    });
  });
});
