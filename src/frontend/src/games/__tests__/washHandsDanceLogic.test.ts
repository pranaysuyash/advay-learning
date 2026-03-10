/**
 * Wash Hands Dance - Game Logic Tests
 *
 * Tests for the handwashing step-following game.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  WASH_STEPS,
  createInitialState,
  getStepById,
  getTotalSteps,
  calculateStars,
  calculateScore,
  type WashStep,
  type GameState,
} from '../washHandsDanceLogic';

describe('Wash Hands Dance - Game Logic', () => {
  describe('Constants', () => {
    it('should have 5 wash steps', () => {
      expect(WASH_STEPS).toHaveLength(5);
    });

    it('should have steps with sequential IDs', () => {
      WASH_STEPS.forEach((step, index) => {
        expect(step.id).toBe(index);
      });
    });

    it('should have required step properties', () => {
      WASH_STEPS.forEach(step => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('name');
        expect(step).toHaveProperty('emoji');
        expect(step).toHaveProperty('instruction');
        expect(step).toHaveProperty('hint');
      });
    });

    it('should have Wet Hands as first step', () => {
      expect(WASH_STEPS[0].name).toBe('Wet Hands');
      expect(WASH_STEPS[0].emoji).toBe('🚿');
    });

    it('should have Soap Time as second step', () => {
      expect(WASH_STEPS[1].name).toBe('Soap Time');
      expect(WASH_STEPS[1].emoji).toBe('🧼');
    });

    it('should have Scrub Scrub as third step', () => {
      expect(WASH_STEPS[2].name).toBe('Scrub Scrub');
      expect(WASH_STEPS[2].emoji).toBe('🧽');
    });

    it('should have Rinse Clean as fourth step', () => {
      expect(WASH_STEPS[3].name).toBe('Rinse Clean');
      expect(WASH_STEPS[3].emoji).toBe('💧');
    });

    it('should have Dry Off as last step', () => {
      expect(WASH_STEPS[4].name).toBe('Dry Off');
      expect(WASH_STEPS[4].emoji).toBe('✋');
    });
  });

  describe('createInitialState', () => {
    it('should create initial game state', () => {
      const state = createInitialState();
      expect(state.currentStep).toBe(0);
      expect(state.score).toBe(0);
      expect(state.stars).toBe(0);
      expect(state.isComplete).toBe(false);
      expect(state.isPlaying).toBe(false);
    });

    it('should create independent state instances', () => {
      const state1 = createInitialState();
      const state2 = createInitialState();
      state1.score = 100;
      expect(state2.score).toBe(0);
    });

    it('should have correct GameState type', () => {
      const state: GameState = createInitialState();
      expect(typeof state.currentStep).toBe('number');
      expect(typeof state.score).toBe('number');
      expect(typeof state.stars).toBe('number');
      expect(typeof state.isComplete).toBe('boolean');
      expect(typeof state.isPlaying).toBe('boolean');
    });
  });

  describe('getStepById', () => {
    it('should return Wet Hands step for id 0', () => {
      const step = getStepById(0);
      expect(step).toBeDefined();
      expect(step?.name).toBe('Wet Hands');
    });

    it('should return Soap Time step for id 1', () => {
      const step = getStepById(1);
      expect(step).toBeDefined();
      expect(step?.name).toBe('Soap Time');
    });

    it('should return Scrub Scrub step for id 2', () => {
      const step = getStepById(2);
      expect(step).toBeDefined();
      expect(step?.name).toBe('Scrub Scrub');
    });

    it('should return Rinse Clean step for id 3', () => {
      const step = getStepById(3);
      expect(step).toBeDefined();
      expect(step?.name).toBe('Rinse Clean');
    });

    it('should return Dry Off step for id 4', () => {
      const step = getStepById(4);
      expect(step).toBeDefined();
      expect(step?.name).toBe('Dry Off');
    });

    it('should return undefined for invalid id', () => {
      expect(getStepById(-1)).toBeUndefined();
      expect(getStepById(5)).toBeUndefined();
      expect(getStepById(999)).toBeUndefined();
    });

    it('should return step with correct structure', () => {
      const step = getStepById(0) as WashStep;
      expect(typeof step.id).toBe('number');
      expect(typeof step.name).toBe('string');
      expect(typeof step.emoji).toBe('string');
      expect(typeof step.instruction).toBe('string');
      expect(typeof step.hint).toBe('string');
    });
  });

  describe('getTotalSteps', () => {
    it('should return 5 for total steps', () => {
      expect(getTotalSteps()).toBe(5);
    });

    it('should match WASH_STEPS length', () => {
      expect(getTotalSteps()).toBe(WASH_STEPS.length);
    });
  });

  describe('calculateStars', () => {
    it('should return 5 stars for perfect performance (avg 1 attempt)', () => {
      expect(calculateStars([1, 1, 1, 1, 1])).toBe(5);
      expect(calculateStars([1])).toBe(5);
    });

    it('should return 4 stars for avg 2 attempts', () => {
      expect(calculateStars([2, 2])).toBe(4);
      expect(calculateStars([1, 2, 3])).toBe(4); // avg = 2
    });

    it('should return 3 stars for avg 3 attempts', () => {
      expect(calculateStars([3, 3])).toBe(3);
      expect(calculateStars([2, 3, 4])).toBe(3); // avg = 3
    });

    it('should return 2 stars for avg 5 attempts', () => {
      expect(calculateStars([5, 5])).toBe(2);
      expect(calculateStars([4, 5, 6])).toBe(2); // avg = 5
    });

    it('should return 1 star for avg > 5 attempts', () => {
      expect(calculateStars([6, 6])).toBe(1);
      expect(calculateStars([10, 10, 10])).toBe(1);
    });

    it('should handle single attempt', () => {
      expect(calculateStars([1])).toBe(5);
      expect(calculateStars([2])).toBe(4);
      expect(calculateStars([3])).toBe(3);
      expect(calculateStars([5])).toBe(2);
      expect(calculateStars([6])).toBe(1);
    });

    it('should handle empty array', () => {
      // Empty array results in NaN average, which fails comparisons and returns 1
      expect(calculateStars([])).toBe(1);
    });

    it('should handle mixed performance', () => {
      // (1+1+5+1+1)/5 = 1.8, which is <= 2, so returns 4 stars
      expect(calculateStars([1, 1, 5, 1, 1])).toBe(4);
    });

    it('should handle many steps with varying attempts', () => {
      const attempts = [1, 2, 1, 3, 1, 2, 1];
      // avg = 11/7 ≈ 1.57 <= 2 -> 4 stars
      expect(calculateStars(attempts)).toBe(4);
    });
  });

  describe('calculateScore', () => {
    it('should return 100 for first attempt', () => {
      expect(calculateScore(0, 1)).toBe(100);
    });

    it('should apply 20 point penalty per additional attempt', () => {
      expect(calculateScore(1, 2)).toBe(80);
      expect(calculateScore(2, 3)).toBe(60);
      expect(calculateScore(3, 4)).toBe(40);
    });

    it('should never return less than 10 points', () => {
      expect(calculateScore(0, 10)).toBe(10);
      expect(calculateScore(0, 100)).toBe(10);
    });

    it('should cap at minimum 10 points even for many attempts', () => {
      expect(calculateScore(0, 5)).toBe(20);
      expect(calculateScore(0, 6)).toBe(10);
      expect(calculateScore(0, 7)).toBe(10);
    });

    it('should handle step parameter (unused but preserved)', () => {
      const score1 = calculateScore(1, 1);
      const score2 = calculateScore(2, 1);
      const score3 = calculateScore(3, 1);
      // Step doesn't affect score in current implementation
      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
    });

    it('should handle zero attempts (edge case)', () => {
      expect(calculateScore(0, 0)).toBe(100); // No penalty
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete game flow', () => {
      const state = createInitialState();
      expect(state.currentStep).toBe(0);
      expect(state.isComplete).toBe(false);

      // Simulate completing all steps
      const attempts = [1, 2, 1, 3, 1];
      const stars = calculateStars(attempts);
      expect(stars).toBe(4);

      const totalScore = attempts.reduce((sum, att, idx) => sum + calculateScore(idx, att), 0);
      expect(totalScore).toBeGreaterThan(0);
    });

    it('should handle getting steps in sequence', () => {
      for (let i = 0; i < getTotalSteps(); i++) {
        const step = getStepById(i);
        expect(step).toBeDefined();
        expect(step?.id).toBe(i);
      }
    });

    it('should handle perfect game', () => {
      const attempts = [1, 1, 1, 1, 1];
      expect(calculateStars(attempts)).toBe(5);
      const totalScore = attempts.reduce((sum, _, idx) => sum + calculateScore(idx, 1), 0);
      expect(totalScore).toBe(500); // 5 steps * 100 points
    });

    it('should handle struggling game', () => {
      const attempts = [5, 6, 4, 7, 5];
      expect(calculateStars(attempts)).toBe(1);
      // Step 0, 5 attempts: base 100 - (5-1)*20 = 20 -> Math.max(10, 20) = 20
      // Step 1, 6 attempts: base 100 - (6-1)*20 = 0 -> Math.max(10, 0) = 10
      // Step 2, 4 attempts: base 100 - (4-1)*20 = 40 -> Math.max(10, 40) = 40
      // Step 3, 7 attempts: base 100 - (7-1)*20 = -20 -> Math.max(10, -20) = 10
      // Step 4, 5 attempts: base 100 - (5-1)*20 = 20 -> Math.max(10, 20) = 20
      const totalScore = attempts.reduce((sum, att, idx) => sum + calculateScore(idx, att), 0);
      expect(totalScore).toBe(100); // 20 + 10 + 40 + 10 + 20
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative step id', () => {
      expect(getStepById(-1)).toBeUndefined();
    });

    it('should handle very large step id', () => {
      expect(getStepById(9999)).toBeUndefined();
    });

    it('should handle very large attempt counts', () => {
      expect(calculateScore(0, 1000)).toBe(10);
    });

    it('should handle fractional attempts (rounded internally)', () => {
      // (1.5 - 1) * 20 = 10, 100 - 10 = 90, not 80
      // Function doesn't round, just uses the value directly
      expect(calculateScore(0, 1.5)).toBe(90); // (1.5 - 1) * 20 = 10 penalty
    });

    it('should handle single step game', () => {
      const attempts = [1];
      expect(calculateStars(attempts)).toBe(5);
      expect(calculateScore(0, 1)).toBe(100);
    });
  });

  describe('Type Safety', () => {
    it('should maintain WashStep type structure', () => {
      const step: WashStep = {
        id: 0,
        name: 'Test Step',
        emoji: '🧪',
        instruction: 'Test instruction',
        hint: 'Test hint',
      };
      expect(typeof step.id).toBe('number');
      expect(typeof step.name).toBe('string');
      expect(typeof step.emoji).toBe('string');
      expect(typeof step.instruction).toBe('string');
      expect(typeof step.hint).toBe('string');
    });

    it('should maintain GameState type structure', () => {
      const state: GameState = {
        currentStep: 2,
        score: 150,
        stars: 3,
        isComplete: false,
        isPlaying: true,
      };
      expect(typeof state.currentStep).toBe('number');
      expect(typeof state.score).toBe('number');
      expect(typeof state.stars).toBe('number');
      expect(typeof state.isComplete).toBe('boolean');
      expect(typeof state.isPlaying).toBe('boolean');
    });
  });
});
