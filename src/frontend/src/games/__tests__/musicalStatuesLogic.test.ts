/**
 * Musical Statues Logic Tests
 * Tests for freeze dance game with pose detection
 */

import { describe, it, expect } from 'vitest';
import {
  initializeGame,
  calculatePoseDifference,
  detectMovement,
  updateGameState,
  shouldAdvanceLevel,
  advanceLevel,
  getFeedbackMessage,
  calculateFinalStats,
  getLevelDisplayName,
  type GameState,
  type MovementResult,
} from '../musicalStatuesLogic';

describe('musicalStatuesLogic', () => {
  describe('Level Configuration', () => {
    it('should have 4 music duration levels', () => {
      const state = initializeGame(1);
      expect(state.timeUntilFreeze).toBe(8000);
    });

    it('should have progressive music durations', () => {
      const level1 = initializeGame(1);
      const level2 = initializeGame(2);
      const level3 = initializeGame(3);
      const level4 = initializeGame(4);

      expect(level2.timeUntilFreeze).toBeGreaterThan(level1.timeUntilFreeze);
      expect(level3.timeUntilFreeze).toBeGreaterThan(level2.timeUntilFreeze);
      expect(level4.timeUntilFreeze).toBeGreaterThan(level3.timeUntilFreeze);
    });

    it('should have progressive freeze durations', () => {
      const level1 = initializeGame(1);
      const level2 = initializeGame(2);
      const level3 = initializeGame(3);

      expect(level1.freezeDuration).toBe(3000);
      expect(level2.freezeDuration).toBe(4000);
      expect(level3.freezeDuration).toBe(5000);
    });

    it('should cap at max level for durations', () => {
      const level5 = initializeGame(5);
      const level4 = initializeGame(4);

      expect(level5.timeUntilFreeze).toBe(level4.timeUntilFreeze);
      expect(level5.freezeDuration).toBe(level4.freezeDuration);
    });

    it('should have more total rounds at higher levels', () => {
      const level1 = initializeGame(1);
      const level2 = initializeGame(2);
      const level3 = initializeGame(3);

      expect(level1.totalRounds).toBe(5); // 4 + 1
      expect(level2.totalRounds).toBe(6); // 4 + 2
      expect(level3.totalRounds).toBe(7); // 4 + 3
    });
  });

  describe('Game Initialization', () => {
    it('should initialize with default level 1', () => {
      const state = initializeGame();
      expect(state.level).toBe(1);
    });

    it('should initialize with specified level', () => {
      const state = initializeGame(3);
      expect(state.level).toBe(3);
    });

    it('should start with music playing', () => {
      const state = initializeGame();
      expect(state.isMusicPlaying).toBe(true);
      expect(state.isFrozen).toBe(false);
    });

    it('should start with zero score and combo', () => {
      const state = initializeGame();
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
    });

    it('should start with dance feedback', () => {
      const state = initializeGame();
      expect(state.feedback).toBe('Dance! 🎵');
    });

    it('should start with game active', () => {
      const state = initializeGame();
      expect(state.gameActive).toBe(true);
    });

    it('should start on round 1', () => {
      const state = initializeGame();
      expect(state.round).toBe(1);
    });

    it('should have no completed rounds initially', () => {
      const state = initializeGame();
      expect(state.roundsCompleted).toBe(0);
    });
  });

  describe('Pose Difference Calculation', () => {
    it('should return 0 for null poses', () => {
      const result = calculatePoseDifference(null, null);
      expect(result).toBe(0);
    });

    it('should return 0 for empty poses', () => {
      const result = calculatePoseDifference([], []);
      expect(result).toBe(0);
    });

    it('should calculate distance between two poses', () => {
      // Create poses with at least 12 landmarks for key indices
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Move right shoulder (index 11)
      pose2[11] = { x: 0.6, y: 0.5, z: 0.5 };

      const result = calculatePoseDifference(pose1, pose2);
      expect(result).toBeCloseTo(0.1 / 12, 4); // 0.1 movement averaged over 12 landmarks
    });

    it('should use 12 key landmarks', () => {
      const pose1 = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      pose2[11] = { x: 0.6, y: 0.5, z: 0.5 }; // Move right shoulder
      pose2[12] = { x: 0.4, y: 0.5, z: 0.5 }; // Move left shoulder

      const result = calculatePoseDifference(pose1, pose2);
      expect(result).toBeCloseTo(0.1 / 12 * 2, 2); // Average of 2 movements over 12 landmarks
    });

    it('should average movement across landmarks', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Move 2 landmarks each by 0.6 for total of 1.2
      pose2[11] = { x: 0.6, y: 0.5, z: 0.5 }; // 0.1 distance
      pose2[12] = { x: 0.4, y: 0.5, z: 0.5 }; // 0.1 distance

      const result = calculatePoseDifference(pose1, pose2);
      expect(result).toBeCloseTo(0.2 / 12, 2);
    });

    it('should handle missing landmarks gracefully', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      pose2[11] = null; // Missing landmark

      const result = calculatePoseDifference(pose1, pose2);
      // Should average over 11 landmarks instead of 12
      expect(result).toBe(0);
    });

    it('should calculate 3D distance', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Move one landmark in 3D
      pose2[11] = { x: 0.6, y: 0.6, z: 0.6 };

      const result = calculatePoseDifference(pose1, pose2);
      // Distance: sqrt(0.1^2 + 0.1^2 + 0.1^2) = sqrt(0.03) ≈ 0.173
      expect(result).toBeCloseTo(0.173205 / 12, 4);
    });
  });

  describe('Movement Detection', () => {
    const mockPose = Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

    it('should return not moving for null previous pose', () => {
      const result = detectMovement(mockPose, null, 0.05);
      expect(result.isMoving).toBe(false);
      expect(result.movementAmount).toBe(0);
      expect(result.confidence).toBe(0);
    });

    it('should return not moving for empty previous pose', () => {
      const result = detectMovement(mockPose, [], 0.05);
      expect(result.isMoving).toBe(false);
    });

    it('should detect movement above threshold', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Move shoulder significantly to trigger movement
      // Need > 0.05 * 12 = 0.6 total movement
      pose2[11] = { x: 1.5, y: 0.5, z: 0.5 }; // 1.0 movement

      const result = detectMovement(pose2, pose1, 0.05);
      expect(result.isMoving).toBe(true);
      expect(result.movementAmount).toBeCloseTo(1.0 / 12, 2);
    });

    it('should not detect movement below threshold', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Tiny movement
      pose2[11] = { x: 0.501, y: 0.5, z: 0.5 };

      const result = detectMovement(pose2, pose1, 0.05);
      expect(result.isMoving).toBe(false);
    });

    it('should calculate confidence based on movement', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Move shoulder to create confidence
      pose2[11] = { x: 0.6, y: 0.5, z: 0.5 };
      const threshold = 0.05;

      const result = detectMovement(pose2, pose1, threshold);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should cap confidence at 1', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));

      // Very large movement
      pose2[11] = { x: 2, y: 0.5, z: 0.5 };
      const threshold = 0.01;

      const result = detectMovement(pose2, pose1, threshold);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Game State Updates', () => {
    it('should count down time until freeze', () => {
      const state = initializeGame(1);
      const updated = updateGameState(state, 1000, null);

      expect(updated.timeUntilFreeze).toBe(7000);
    });

    it('should trigger freeze when timer reaches zero', () => {
      const state = initializeGame(1);
      state.timeUntilFreeze = 1;

      const updated = updateGameState(state, 1, null);

      expect(updated.isFrozen).toBe(true);
      expect(updated.isMusicPlaying).toBe(false);
    });

    it('should set freeze feedback when music stops', () => {
      const state = initializeGame(1);
      state.timeUntilFreeze = 1;

      const updated = updateGameState(state, 1, null);

      expect(updated.feedback).toBe('FREEZE! 🗿');
    });

    it('should detect movement during freeze', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 3000;

      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      pose2[11] = { x: 1.5, y: 0.5, z: 0.5 }; // Move shoulder significantly

      const withSnapshot = { ...state, lastPoseSnapshot: pose1 };
      const updated = updateGameState(withSnapshot, 100, pose2);

      expect(updated.moveDuringFreeze).toBe(true);
      expect(updated.combo).toBe(0);
    });

    it('should count down freeze duration', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 3000;

      const updated = updateGameState(state, 1000, null);

      expect(updated.freezeDuration).toBe(2000);
    });

    it('should not score points if moved during freeze', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = true;

      const updated = updateGameState(state, 1, null);

      expect(updated.score).toBe(0);
      expect(updated.roundsCompleted).toBe(0);
    });

    it('should award points for successful freeze', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;

      const updated = updateGameState(state, 1, null);

      expect(updated.score).toBe(100); // Base score
      expect(updated.roundsCompleted).toBe(1);
    });

    it('should increment combo on successful freeze', () => {
      const state = initializeGame(1);
      state.combo = 2;
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;

      const updated = updateGameState(state, 1, null);

      expect(updated.combo).toBe(3);
    });

    it('should calculate score with combo bonus', () => {
      const state = initializeGame(1);
      state.combo = 3;
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;

      const updated = updateGameState(state, 1, null);

      // Base: 100 + (3 * 50) = 250
      expect(updated.score).toBe(250);
    });

    it('should start next round after successful freeze', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;
      state.roundsCompleted = 0;
      state.totalRounds = 5;

      const updated = updateGameState(state, 1, null);

      expect(updated.round).toBe(2);
      expect(updated.isMusicPlaying).toBe(true);
    });

    it('should end game when all rounds completed', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;
      state.roundsCompleted = 4;
      state.totalRounds = 5;

      const updated = updateGameState(state, 1, null);

      expect(updated.gameActive).toBe(false);
      expect(updated.feedback).toBe('Game Complete! 🎵');
    });

    it('should not end game if rounds remain', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;
      state.roundsCompleted = 3;
      state.totalRounds = 5;

      const updated = updateGameState(state, 1, null);

      expect(updated.gameActive).toBe(true);
    });
  });

  describe('Level Advancement', () => {
    it('should advance level when requested', () => {
      const state = advanceLevel(initializeGame(1));
      expect(state.level).toBe(2);
    });

    it('should reset score on level advance', () => {
      const currentState = initializeGame(1);
      currentState.score = 500;

      const newState = advanceLevel(currentState);
      expect(newState.score).toBe(0);
    });

    it('should return false for shouldAdvanceLevel mid-game', () => {
      const state = initializeGame(1);
      expect(shouldAdvanceLevel(state)).toBe(false);
    });

    it('should return false when game complete', () => {
      const state = initializeGame(1);
      state.roundsCompleted = 5;
      state.totalRounds = 5;
      state.gameActive = false;

      expect(shouldAdvanceLevel(state)).toBe(false);
    });
  });

  describe('Feedback Messages', () => {
    it('should show dance message during music', () => {
      const state = initializeGame(1);
      expect(getFeedbackMessage(state)).toContain('Dance');
    });

    it('should show countdown when music about to stop', () => {
      const state = initializeGame(1);
      state.timeUntilFreeze = 2500; // 2-3 seconds

      const feedback = getFeedbackMessage(state);
      expect(feedback).toContain('freeze');
    });

    it('should show freeze countdown during freeze', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 2000;

      const feedback = getFeedbackMessage(state);
      expect(feedback).toContain('2');
    });

    it('should show movement message when moved', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.moveDuringFreeze = true;

      const feedback = getFeedbackMessage(state);
      expect(feedback).toContain('moved');
    });

    it('should return custom feedback otherwise', () => {
      const state = initializeGame(1);
      state.isMusicPlaying = false;
      state.isFrozen = false;
      state.feedback = 'Custom message';

      expect(getFeedbackMessage(state)).toBe('Custom message');
    });
  });

  describe('Level Display Names', () => {
    it('should return Easy for level 1', () => {
      expect(getLevelDisplayName(1)).toBe('Easy');
    });

    it('should return Medium for level 2', () => {
      expect(getLevelDisplayName(2)).toBe('Medium');
    });

    it('should return Hard for level 3', () => {
      expect(getLevelDisplayName(3)).toBe('Hard');
    });

    it('should return Level N for higher levels', () => {
      expect(getLevelDisplayName(4)).toBe('Level 4');
      expect(getLevelDisplayName(5)).toBe('Level 5');
    });
  });

  describe('Final Stats Calculation', () => {
    it('should calculate success rate', () => {
      const state = initializeGame(1);
      state.score = 500;
      state.roundsCompleted = 4;
      state.totalRounds = 5;
      state.combo = 3;

      const stats = calculateFinalStats(state);
      expect(stats.successRate).toBe(80);
    });

    it('should include max combo', () => {
      const state = initializeGame(1);
      state.combo = 5;

      const stats = calculateFinalStats(state);
      expect(stats.maxCombo).toBe(5);
    });

    it('should return all relevant stats', () => {
      const state = initializeGame(2);
      state.score = 750;
      state.roundsCompleted = 5;

      const stats = calculateFinalStats(state);
      expect(stats.score).toBe(750);
      expect(stats.level).toBe(2);
      expect(stats.roundsCompleted).toBe(5);
      expect(stats.totalRounds).toBe(6);
    });

    it('should handle zero completed rounds', () => {
      const state = initializeGame(1);
      state.roundsCompleted = 0;

      const stats = calculateFinalStats(state);
      expect(stats.successRate).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative delta time', () => {
      const state = initializeGame(1);
      const updated = updateGameState(state, -100, null);

      expect(updated.timeUntilFreeze).toBeGreaterThanOrEqual(state.timeUntilFreeze);
    });

    it('should handle very large delta time', () => {
      const state = initializeGame(1);
      const updated = updateGameState(state, 100000, null);

      expect(updated.timeUntilFreeze).toBe(0);
      expect(updated.isFrozen).toBe(true);
    });

    it('should handle zero movement threshold', () => {
      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      pose2[11] = { x: 0.5001, y: 0.5, z: 0.5 };

      const result = detectMovement(pose2, pose1, 0);
      expect(result.isMoving).toBe(true);
    });

    it('should handle undefined pose gracefully', () => {
      const state = initializeGame(1);
      const updated = updateGameState(state, 1000, undefined);

      expect(updated).toBeDefined();
    });
  });

  describe('Type Definitions', () => {
    it('should have correct GameState structure', () => {
      const state: GameState = {
        score: 0,
        level: 1,
        round: 1,
        gameActive: true,
        isMusicPlaying: true,
        timeUntilFreeze: 8000,
        freezeDuration: 3000,
        isFrozen: false,
        moveDuringFreeze: false,
        lastPoseSnapshot: null,
        movementThreshold: 0.05,
        roundsCompleted: 0,
        totalRounds: 5,
        feedback: 'Dance! 🎵',
        combo: 0,
      };

      expect(state.score).toBeDefined();
    });

    it('should have correct MovementResult structure', () => {
      const result: MovementResult = {
        isMoving: false,
        movementAmount: 0,
        confidence: 0,
      };

      expect(result.isMoving).toBeDefined();
    });
  });

  describe('Scoring System', () => {
    it('should award base 100 points per successful freeze', () => {
      const state = initializeGame(1);
      state.combo = 0;
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;

      const updated = updateGameState(state, 1, null);
      expect(updated.score).toBe(100);
    });

    it('should award 50 bonus points per combo level', () => {
      const state = initializeGame(1);
      state.combo = 2; // 2 combo = 100 bonus
      state.isMusicPlaying = false;
      state.isFrozen = true;
      state.freezeDuration = 1;
      state.moveDuringFreeze = false;

      const updated = updateGameState(state, 1, null);
      expect(updated.score).toBe(200); // 100 base + 100 combo
    });

    it('should reset combo on movement', () => {
      const state = initializeGame(1);
      state.combo = 5;
      state.isMusicPlaying = false;
      state.isFrozen = true;

      const pose1 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      const pose2 = Array(29).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0.5 }));
      pose2[11] = { x: 1.5, y: 0.5, z: 0.5 }; // Move shoulder significantly

      const withSnapshot = { ...state, lastPoseSnapshot: pose1 };
      const updated = updateGameState(withSnapshot, 100, pose2);

      expect(updated.combo).toBe(0);
    });
  });
});
