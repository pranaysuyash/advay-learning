import { describe, it, expect } from 'vitest';
import {
  initializeGame,
  getCurrentLevel,
  getRandomPose,
  updatePose,
  checkPoseMatch,
  scorePose,
  startGame,
  resetLevel,
  nextLevel,
  calculateScore,
  getPoseInfo,
  POSES,
  LEVELS,
} from '../mirrorDuelLogic';

describe('mirrorDuelLogic', () => {
  describe('initializeGame', () => {
    it('should initialize game with level 1', () => {
      const state = initializeGame(1);
      expect(state.level).toBe(1);
      expect(state.score).toBe(0);
    });
  });

  describe('LEVELS', () => {
    it('should have 5 levels', () => {
      expect(LEVELS).toHaveLength(5);
    });

    it('should have target scores for each level', () => {
      LEVELS.forEach(level => {
        expect(level.targetScore).toBeGreaterThan(0);
      });
    });
  });

  describe('POSES', () => {
    it('should have pose IDs', () => {
      POSES.forEach(pose => {
        expect(pose.id).toBeTruthy();
        expect(pose.emoji).toBeTruthy();
      });
    });
  });

  describe('getRandomPose', () => {
    it('should return a valid pose for level', () => {
      const level = getCurrentLevel(1);
      const pose = getRandomPose(level);
      expect(level.poses).toContain(pose.id);
    });
  });

  describe('updatePose', () => {
    it('should set a new target pose', () => {
      let state = initializeGame(1);
      state = updatePose(state);
      expect(state.targetPose).toBeTruthy();
      expect(state.round).toBe(1);
    });
  });

  describe('checkPoseMatch', () => {
    it('should return true for matching poses', () => {
      const pose1 = POSES[0];
      const pose2 = POSES[0];
      expect(checkPoseMatch(pose1, pose2)).toBe(true);
    });

    it('should return false for different poses', () => {
      const pose1 = POSES[0];
      const pose2 = POSES[1];
      expect(checkPoseMatch(pose1, pose2)).toBe(false);
    });
  });

  describe('scorePose', () => {
    it('should increase score on match', () => {
      let state = initializeGame(1);
      state = scorePose(state, true);
      expect(state.score).toBe(1);
    });

    it('should decrease score on mismatch', () => {
      let state = initializeGame(1);
      state = scorePose(state, false);
      expect(state.score).toBe(0);
    });
  });

  describe('startGame', () => {
    it('should start game and set initial pose', () => {
      const state = initializeGame(1);
      const newState = startGame(state);
      expect(newState.isPlaying).toBe(true);
      expect(newState.targetPose).toBeTruthy();
    });
  });

  describe('resetLevel', () => {
    it('should reset to initial state', () => {
      let state = initializeGame(1);
      state = scorePose(state, true);
      state = scorePose(state, true);
      const resetState = resetLevel(state);
      expect(resetState.score).toBe(0);
    });
  });

  describe('nextLevel', () => {
    it('should advance to next level', () => {
      const state = initializeGame(1);
      const newState = nextLevel(state);
      expect(newState.level).toBe(2);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score with base value', () => {
      const score = calculateScore(5, 10000, 1);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('getPoseInfo', () => {
    it('should return info for valid pose', () => {
      const info = getPoseInfo('arms_up');
      expect(info.name).toBe('Arms Up');
      expect(info.emoji).toBe('🙌');
    });

    it('should return unknown for invalid pose', () => {
      const info = getPoseInfo('invalid');
      expect(info.name).toBe('Unknown');
    });
  });
});
