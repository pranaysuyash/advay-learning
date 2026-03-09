/**
 * Obstacle Course Logic Tests
 * Tests for pose movement obstacle game
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createObstacleSequence,
  createObstacleCourseRoundState,
  getCurrentObstacle,
  matchesObstacleAction,
  advanceObstacleCourseState,
  completeCurrentObstacle,
  OBSTACLE_COURSE_CONFIG,
  type ObstacleDefinition,
  type ObstacleCourseRoundState,
} from '../obstacleCourseLogic';

// Mock type for MovementSignal
type MovementSignal = {
  type: string;
  confidence: number;
};

describe('obstacleCourseLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should have defined constants', () => {
      expect(OBSTACLE_COURSE_CONFIG.BASE_SEQUENCE_LENGTH).toBe(3);
      expect(OBSTACLE_COURSE_CONFIG.MAX_SEQUENCE_LENGTH).toBe(6);
      expect(OBSTACLE_COURSE_CONFIG.ROUND_DURATION_MS).toBe(45000);
      expect(OBSTACLE_COURSE_CONFIG.BASE_OBSTACLE_WINDOW_MS).toBe(5200);
      expect(OBSTACLE_COURSE_CONFIG.MIN_OBSTACLE_WINDOW_MS).toBe(2800);
      expect(OBSTACLE_COURSE_CONFIG.POINTS_PER_SUCCESS).toBe(25);
      expect(OBSTACLE_COURSE_CONFIG.CONFIDENCE_BONUS_SCALE).toBe(15);
      expect(OBSTACLE_COURSE_CONFIG.STREAK_BONUS).toBe(10);
      expect(OBSTACLE_COURSE_CONFIG.PERFECT_ROUND_BONUS).toBe(60);
    });
  });

  describe('createObstacleSequence', () => {
    it('should create sequence for level 1', () => {
      const sequence = createObstacleSequence(1);

      expect(sequence).toHaveLength(3);
    });

    it('should create sequence for level 2', () => {
      const sequence = createObstacleSequence(2);

      expect(sequence).toHaveLength(4);
    });

    it('should create sequence for level 3', () => {
      const sequence = createObstacleSequence(3);

      expect(sequence).toHaveLength(5);
    });

    it('should cap at max sequence length', () => {
      const sequence = createObstacleSequence(10);

      expect(sequence).toHaveLength(6);
    });

    it('should create obstacles with IDs', () => {
      const sequence = createObstacleSequence(1);

      sequence.forEach(obstacle => {
        expect(obstacle.id).toBeDefined();
        expect(typeof obstacle.id).toBe('string');
      });
    });

    it('should create obstacles with time limits', () => {
      const sequence = createObstacleSequence(1);

      sequence.forEach(obstacle => {
        expect(obstacle.timeLimitMs).toBeDefined();
        expect(obstacle.timeLimitMs).toBeGreaterThan(0);
      });
    });

    it('should create obstacles with required properties', () => {
      const sequence = createObstacleSequence(1);

      sequence.forEach(obstacle => {
        expect(obstacle.action).toBeDefined();
        expect(obstacle.label).toBeDefined();
        expect(obstacle.instruction).toBeDefined();
        expect(obstacle.icon).toBeDefined();
        expect(obstacle.lane).toBeGreaterThanOrEqual(0);
        expect(obstacle.color).toBeDefined();
      });
    });

    it('should decrease time window with higher levels', () => {
      const level1 = createObstacleSequence(1);
      const level5 = createObstacleSequence(5);

      expect(level1[0].timeLimitMs).toBeGreaterThan(level5[0].timeLimitMs);
    });

    it('should not go below minimum time window', () => {
      const highLevel = createObstacleSequence(20);

      highLevel.forEach(obstacle => {
        expect(obstacle.timeLimitMs).toBeGreaterThanOrEqual(2800);
      });
    });

    it('should cycle through action types across levels', () => {
      const level1 = createObstacleSequence(1);
      const level2 = createObstacleSequence(2);
      const level3 = createObstacleSequence(3);
      const level4 = createObstacleSequence(4);

      // Each level starts at a different offset
      expect(level1[0].action).not.toBe(level2[0].action);
    });
  });

  describe('createObstacleCourseRoundState', () => {
    it('should create initial state', () => {
      const state = createObstacleCourseRoundState(1);

      expect(state.level).toBe(1);
      expect(state.score).toBe(0);
      expect(state.streak).toBe(0);
      expect(state.bestStreak).toBe(0);
      expect(state.currentIndex).toBe(0);
      expect(state.completedObstacles).toBe(0);
      expect(state.missedObstacles).toBe(0);
      expect(state.status).toBe('playing');
    });

    it('should create obstacle sequence', () => {
      const state = createObstacleCourseRoundState(1);

      expect(state.sequence).toHaveLength(3);
    });

    it('should accept carried score', () => {
      const state = createObstacleCourseRoundState(1, Date.now(), 100);

      expect(state.score).toBe(100);
    });

    it('should accept best streak', () => {
      const state = createObstacleCourseRoundState(1, Date.now(), 0, 5);

      expect(state.bestStreak).toBe(5);
    });

    it('should set initial time remaining', () => {
      const state = createObstacleCourseRoundState(1);

      expect(state.timeRemainingMs).toBe(45000);
    });
  });

  describe('getCurrentObstacle', () => {
    it('should return first obstacle initially', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      expect(obstacle).toBeDefined();
      expect(obstacle?.id).toContain('obstacle-');
    });

    it('should return null when sequence complete', () => {
      const state = createObstacleCourseRoundState(1);
      state.currentIndex = 10;

      const obstacle = getCurrentObstacle(state);

      expect(obstacle).toBeNull();
    });

    it('should return obstacle at current index', () => {
      const state = createObstacleCourseRoundState(1);
      state.currentIndex = 1;

      const obstacle = getCurrentObstacle(state);

      expect(obstacle).toBeDefined();
      expect(obstacle?.id).toContain('obstacle-');
    });
  });

  describe('matchesObstacleAction', () => {
    it('should return false for null movement', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      expect(matchesObstacleAction(obstacle, null)).toBe(false);
    });

    it('should return true when action matches', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0.8 };

      expect(matchesObstacleAction(obstacle, movement)).toBe(true);
    });

    it('should return false when action does not match', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: 'wrong-action', confidence: 0.8 };

      expect(matchesObstacleAction(obstacle, movement)).toBe(false);
    });
  });

  describe('advanceObstacleCourseState', () => {
    it('should not modify completed state', () => {
      const state = createObstacleCourseRoundState(1);
      state.status = 'complete';

      const updated = advanceObstacleCourseState(state);

      expect(updated.status).toBe('complete');
    });

    it('should update time remaining', () => {
      const now = Date.now();
      const state = createObstacleCourseRoundState(1, now - 1000);

      const updated = advanceObstacleCourseState(state, now);

      expect(updated.timeRemainingMs).toBe(44000);
    });

    it('should not advance before time window expires', () => {
      const now = Date.now();
      const state = createObstacleCourseRoundState(1, now);

      const updated = advanceObstacleCourseState(state, now + 1000);

      expect(updated.currentIndex).toBe(0);
    });

    it('should advance obstacle after time window', () => {
      const now = Date.now();
      const state = createObstacleCourseRoundState(1, now);

      const updated = advanceObstacleCourseState(state, now + 6000);

      expect(updated.currentIndex).toBe(1);
    });

    it('should increment missed obstacles when timeout', () => {
      const now = Date.now();
      const state = createObstacleCourseRoundState(1, now);

      const updated = advanceObstacleCourseState(state, now + 6000);

      expect(updated.missedObstacles).toBe(1);
    });

    it('should reset streak when missed', () => {
      const state = createObstacleCourseRoundState(1);
      state.streak = 5;

      const now = Date.now();
      const updated = advanceObstacleCourseState(state, now + 6000);

      expect(updated.streak).toBe(0);
    });

    it('should mark complete when all obstacles done', () => {
      const now = Date.now();
      const state = createObstacleCourseRoundState(1);
      state.currentIndex = 2;

      const updated = advanceObstacleCourseState(state, now + 6000);

      expect(updated.status).toBe('complete');
    });

    it('should mark complete when time expires', () => {
      const now = Date.now();
      const state = createObstacleCourseRoundState(1, now);

      const updated = advanceObstacleCourseState(state, now + 46000);

      expect(updated.status).toBe('complete');
    });
  });

  describe('completeCurrentObstacle', () => {
    it('should not advance if action does not match', () => {
      const state = createObstacleCourseRoundState(1);
      const movement: MovementSignal = { type: 'wrong-action', confidence: 0.8 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.currentIndex).toBe(0);
    });

    it('should advance to next obstacle', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0.8 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.currentIndex).toBe(1);
    });

    it('should add base score points', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.score).toBe(25);
    });

    it('should add confidence bonus', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 1.0 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.score).toBe(40); // 25 + 15 (confidence)
    });

    it('should increment streak', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0.8 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.streak).toBe(1);
    });

    it('should update best streak', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0.8 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.bestStreak).toBe(1);
    });

    it('should increment completed obstacles', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0.8 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.completedObstacles).toBe(1);
    });

    it('should mark complete when all obstacles done', () => {
      const state = createObstacleCourseRoundState(1);
      state.currentIndex = 2;
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0.8 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.status).toBe('complete');
    });
  });

  describe('Scoring', () => {
    it('should calculate base score correctly', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.score).toBe(25);
    });

    it('should calculate max score (base + full confidence)', () => {
      const state = createObstacleCourseRoundState(1);
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 1.0 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.score).toBe(40);
    });

    it('should add streak bonus', () => {
      const state = createObstacleCourseRoundState(1);
      state.streak = 5;
      const obstacle = getCurrentObstacle(state);

      if (!obstacle) {
        throw new Error('No obstacle');
      }

      const movement: MovementSignal = { type: obstacle.action, confidence: 0 };

      const updated = completeCurrentObstacle(state, movement);

      expect(updated.score).toBe(35); // 25 + 10 (streak)
    });
  });

  describe('Type Definitions', () => {
    it('should have correct ObstacleDefinition structure', () => {
      const obstacle: ObstacleDefinition = {
        id: 'test-1',
        action: 'duck',
        label: 'Duck',
        instruction: 'Duck under',
        icon: 'duck',
        lane: 1,
        color: '#F59E0B',
        timeLimitMs: 5000,
      };

      expect(obstacle.id).toBeDefined();
      expect(obstacle.action).toBeDefined();
      expect(obstacle.label).toBeDefined();
      expect(obstacle.instruction).toBeDefined();
      expect(obstacle.icon).toBeDefined();
      expect(obstacle.lane).toBeDefined();
      expect(obstacle.color).toBeDefined();
      expect(obstacle.timeLimitMs).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high level', () => {
      const sequence = createObstacleSequence(100);

      expect(sequence.length).toBeLessThanOrEqual(6);
    });
  });

  describe('Integration Scenarios', () => {
    it('should complete full level 1 round successfully', () => {
      const state = createObstacleCourseRoundState(1);
      let currentState = state;

      while (currentState.status === 'playing' && currentState.currentIndex < currentState.sequence.length) {
        const current = getCurrentObstacle(currentState);
        if (!current) break;

        const movement: MovementSignal = { type: current.action, confidence: 0.8 };
        currentState = completeCurrentObstacle(currentState, movement);
      }

      expect(currentState.status).toBe('complete');
    });
  });
});
