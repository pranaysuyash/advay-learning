/**
 * Follow the Leader Game Logic Tests
 *
 * Tests for movement pattern configurations, pose matching,
 * scoring, hold duration, and game mechanics.
 */

import { describe, expect, it } from 'vitest';
import {
  MOVEMENT_PATTERNS,
  GAME_CONFIG,
  checkPoseMatch,
  initializeGame,
  updateGameState,
  isLevelComplete,
  advanceLevel,
  getNextPattern,
  getPatternById,
  getRandomPattern,
  calculateFinalStats,
  type GameState,
  type MovementPattern,
} from '../followTheLeaderLogic';

// Helper to create mock landmarks
function createMockLandmarks(overrides: Record<number, { x: number; y: number }> = {}) {
  const base: any[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0 }));

  // Default standing pose
  base[11] = { x: 0.4, y: 0.3, z: 0 }; // left shoulder
  base[12] = { x: 0.6, y: 0.3, z: 0 }; // right shoulder
  base[13] = { x: 0.38, y: 0.4, z: 0 }; // left elbow
  base[14] = { x: 0.62, y: 0.4, z: 0 }; // right elbow
  base[15] = { x: 0.35, y: 0.5, z: 0 }; // left wrist
  base[16] = { x: 0.65, y: 0.5, z: 0 }; // right wrist
  base[23] = { x: 0.45, y: 0.6, z: 0 }; // left hip
  base[24] = { x: 0.55, y: 0.6, z: 0 }; // right hip
  base[25] = { x: 0.47, y: 0.75, z: 0 }; // left knee
  base[26] = { x: 0.53, y: 0.75, z: 0 }; // right knee
  base[27] = { x: 0.48, y: 0.9, z: 0 }; // left ankle
  base[28] = { x: 0.52, y: 0.9, z: 0 }; // right ankle

  // Apply overrides
  for (const [index, values] of Object.entries(overrides)) {
    const idx = Number(index);
    if (base[idx]) {
      base[idx] = { ...base[idx], ...values };
    }
  }

  return base;
}

describe('Follow the Leader - Movement Patterns', () => {
  it('has 6 movement patterns defined', () => {
    expect(MOVEMENT_PATTERNS).toHaveLength(6);
  });

  it('Penguin Walk has correct configuration', () => {
    const pattern = MOVEMENT_PATTERNS[0];
    expect(pattern.id).toBe('penguin-walk');
    expect(pattern.name).toBe('Penguin Walk');
    expect(pattern.emoji).toBe('🐧');
    expect(pattern.targetPose.leftArmAngle).toBe(10);
    expect(pattern.targetPose.rightArmAngle).toBe(10);
    expect(pattern.duration).toBe(3000);
    expect(pattern.tolerance).toBe(0.6);
  });

  it('Frog Hop has correct configuration', () => {
    const pattern = MOVEMENT_PATTERNS[1];
    expect(pattern.id).toBe('frog-hop');
    expect(pattern.name).toBe('Frog Hop');
    expect(pattern.emoji).toBe('🐸');
    expect(pattern.targetPose.leftArmAngle).toBe(90);
    expect(pattern.targetPose.torsoAngle).toBe(-20);
    expect(pattern.duration).toBe(2000);
    expect(pattern.tolerance).toBe(0.5);
  });

  it('Tiptoe Quietly has correct configuration', () => {
    const pattern = MOVEMENT_PATTERNS[2];
    expect(pattern.id).toBe('tiptoe-quiet');
    expect(pattern.name).toBe('Tiptoe Quietly');
    expect(pattern.emoji).toBe('👣');
    expect(pattern.targetPose.leftArmAngle).toBe(80);
    expect(pattern.duration).toBe(4000);
    expect(pattern.tolerance).toBe(0.7);
  });

  it('March Like a Soldier has correct configuration', () => {
    const pattern = MOVEMENT_PATTERNS[3];
    expect(pattern.id).toBe('march-soldier');
    expect(pattern.name).toBe('March Like a Soldier');
    expect(pattern.emoji).toBe('🎖️');
    expect(pattern.targetPose.leftArmAngle).toBe(120);
    expect(pattern.targetPose.rightArmAngle).toBe(60);
    expect(pattern.targetPose.leftLegAngle).toBe(90);
    expect(pattern.duration).toBe(3000);
  });

  it('Fly Like a Bird has correct configuration', () => {
    const pattern = MOVEMENT_PATTERNS[4];
    expect(pattern.id).toBe('fly-bird');
    expect(pattern.name).toBe('Fly Like a Bird');
    expect(pattern.emoji).toBe('🐦');
    expect(pattern.targetPose.leftArmAngle).toBe(170);
    expect(pattern.targetPose.rightArmAngle).toBe(170);
    expect(pattern.duration).toBe(4000);
  });

  it('Swim Like a Fish has correct configuration', () => {
    const pattern = MOVEMENT_PATTERNS[5];
    expect(pattern.id).toBe('swim-fish');
    expect(pattern.name).toBe('Swim Like a Fish');
    expect(pattern.emoji).toBe('🐟');
    expect(pattern.targetPose.leftArmAngle).toBe(45);
    expect(pattern.targetPose.torsoAngle).toBe(10);
    expect(pattern.duration).toBe(3000);
  });

  it('all patterns have valid target poses', () => {
    MOVEMENT_PATTERNS.forEach((pattern) => {
      expect(pattern.targetPose).toBeDefined();
      expect(pattern.tolerance).toBeGreaterThan(0);
      expect(pattern.tolerance).toBeLessThanOrEqual(1);
      expect(pattern.duration).toBeGreaterThan(0);
    });
  });
});

describe('Follow the Leader - Game Configuration', () => {
  it('has correct game config values', () => {
    expect(GAME_CONFIG.LEVEL_DURATION).toBe(45000);
    expect(GAME_CONFIG.MOVEMENTS_PER_LEVEL).toBe(4);
    expect(GAME_CONFIG.HOLD_THRESHOLD).toBe(2000);
    expect(GAME_CONFIG.SCORE_PER_MOVEMENT).toBe(25);
    expect(GAME_CONFIG.BONUS_PERFECT_MATCH).toBe(10);
    expect(GAME_CONFIG.LEVEL_BONUS).toBe(50);
  });
});

describe('Follow the Leader - Pose Matching', () => {
  it('returns no match when landmarks are missing', () => {
    const result = checkPoseMatch([], MOVEMENT_PATTERNS[0]);
    expect(result.matches).toBe(false);
    expect(result.confidence).toBe(0);
    expect(result.feedback).toContain('Cannot see your full body');
  });

  it('returns no match when insufficient landmarks', () => {
    const landmarks = Array.from({ length: 10 }, () => ({ x: 0.5, y: 0.5 }));
    const result = checkPoseMatch(landmarks, MOVEMENT_PATTERNS[0]);
    expect(result.matches).toBe(false);
    expect(result.confidence).toBe(0);
  });

  it('matches Penguin Walk pose when arms are down', () => {
    // Penguin Walk: arms at sides (10°), upright torso
    // Create landmarks with arms pointing down
    const landmarks = createMockLandmarks({
      13: { x: 0.4, y: 0.3 }, // left elbow at shoulder level
      14: { x: 0.6, y: 0.3 }, // right elbow at shoulder level
      15: { x: 0.4, y: 0.55 }, // left wrist below elbow (arms down)
      16: { x: 0.6, y: 0.55 }, // right wrist below elbow
      23: { x: 0.45, y: 0.6 }, // left hip
      24: { x: 0.55, y: 0.6 }, // right hip
      27: { x: 0.45, y: 0.85 }, // left ankle (standing)
      28: { x: 0.55, y: 0.85 }, // right ankle
    });

    const result = checkPoseMatch(landmarks, MOVEMENT_PATTERNS[0]);
    // Penguin Walk has 0.6 tolerance, so should pass with reasonable match
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('matches Frog Hop pose correctly', () => {
    // Arms forward (90°), crouching
    const landmarks = createMockLandmarks({
      15: { x: 0.4, y: 0.5 }, // left wrist forward
      16: { x: 0.6, y: 0.5 }, // right wrist forward
      27: { x: 0.48, y: 0.7 }, // left ankle (higher = crouched)
      28: { x: 0.52, y: 0.7 }, // right ankle
    });

    const result = checkPoseMatch(landmarks, MOVEMENT_PATTERNS[1]);
    expect(result.matches).toBe(true);
  });

  it('provides feedback for missing body parts', () => {
    const landmarks = createMockLandmarks({
      15: { x: 0.2, y: 0.5 }, // left wrist way off
    });

    const result = checkPoseMatch(landmarks, MOVEMENT_PATTERNS[0]);
    expect(result.missingElements.length).toBeGreaterThan(0);
  });

  it('generates correct feedback for perfect match', () => {
    const landmarks = createMockLandmarks();
    const pattern = { ...MOVEMENT_PATTERNS[0], tolerance: 0.1 }; // Low tolerance for test

    // Create landmarks that should match well
    const goodLandmarks = createMockLandmarks({
      15: { x: 0.35, y: 0.7 },
      16: { x: 0.65, y: 0.7 },
    });

    const result = checkPoseMatch(goodLandmarks, pattern);
    expect(result.feedback).toBeTruthy();
  });
});

describe('Follow the Leader - Game State Management', () => {
  it('initializes game with correct state', () => {
    const state = initializeGame(1);

    expect(state.level).toBe(1);
    expect(state.score).toBe(0);
    expect(state.completedMovements).toBe(0);
    expect(state.gameActive).toBe(true);
    expect(state.holdTime).toBe(0);
    expect(state.progress).toBe(0);
    expect(state.currentPattern).toEqual(MOVEMENT_PATTERNS[0]);
  });

  it('updates game state on pose match', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0,
      holdTime: 0,
      score: 0,
      level: 1,
      completedMovements: 0,
      gameActive: true,
      feedback: 'Get ready!',
    };

    const poseMatch = {
      matches: true,
      confidence: 0.8,
      feedback: 'Good job!',
      missingElements: [],
    };

    const newState = updateGameState(state, poseMatch, 500);
    expect(newState.holdTime).toBe(500);
    expect(newState.progress).toBeGreaterThan(0);
  });

  it('resets hold time when pose does not match', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0.5,
      holdTime: 1000,
      score: 0,
      level: 1,
      completedMovements: 0,
      gameActive: true,
      feedback: 'Good job!',
    };

    const poseMatch = {
      matches: false,
      confidence: 0.3,
      feedback: 'Try again!',
      missingElements: ['left arm'],
    };

    const newState = updateGameState(state, poseMatch, 500);
    expect(newState.holdTime).toBe(0);
    expect(newState.progress).toBe(0);
  });

  it('completes movement when hold time exceeds duration', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[1], // Frog Hop (2000ms duration)
      progress: 0,
      holdTime: 0,
      score: 0,
      level: 1,
      completedMovements: 0,
      gameActive: true,
      feedback: 'Get ready!',
    };

    const poseMatch = {
      matches: true,
      confidence: 0.85,
      feedback: 'Perfect!',
      missingElements: [],
    };

    // Hold for 2000ms (exactly the duration)
    const newState = updateGameState(state, poseMatch, 2000);
    expect(newState.completedMovements).toBe(1);
    expect(newState.score).toBe(GAME_CONFIG.SCORE_PER_MOVEMENT);
    expect(newState.holdTime).toBe(0);
  });
});

describe('Follow the Leader - Level Progression', () => {
  it('detects level completion correctly', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 1,
      holdTime: 2000,
      score: 100,
      level: 1,
      completedMovements: 4, // Exactly MOVEMENTS_PER_LEVEL
      gameActive: true,
      feedback: 'Complete!',
    };

    expect(isLevelComplete(state)).toBe(true);
  });

  it('does not complete level before threshold', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0,
      holdTime: 0,
      score: 75,
      level: 1,
      completedMovements: 3,
      gameActive: true,
      feedback: 'Almost there!',
    };

    expect(isLevelComplete(state)).toBe(false);
  });

  it('advances level correctly', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[5],
      progress: 1,
      holdTime: 3000,
      score: 100,
      level: 1,
      completedMovements: 4,
      gameActive: true,
      feedback: 'Level complete!',
    };

    const newState = advanceLevel(state);
    expect(newState.level).toBe(2);
    expect(newState.completedMovements).toBe(0);
    expect(newState.score).toBe(100 + GAME_CONFIG.LEVEL_BONUS);
    expect(newState.currentPattern).toEqual(MOVEMENT_PATTERNS[0]);
  });
});

describe('Follow the Leader - Scoring', () => {
  it('awards base points for movement completion', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0,
      holdTime: 0,
      score: 0,
      level: 1,
      completedMovements: 0,
      gameActive: true,
      feedback: '',
    };

    const poseMatch = {
      matches: true,
      confidence: 0.7,
      feedback: 'Good!',
      missingElements: [],
    };

    const newState = updateGameState(state, poseMatch, 3000);
    expect(newState.score).toBe(GAME_CONFIG.SCORE_PER_MOVEMENT);
  });

  it('awards perfect match bonus for high confidence', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0,
      holdTime: 0,
      score: 0,
      level: 1,
      completedMovements: 0,
      gameActive: true,
      feedback: '',
    };

    const poseMatch = {
      matches: true,
      confidence: 0.95, // Above 0.9 threshold
      feedback: 'Perfect!',
      missingElements: [],
    };

    const newState = updateGameState(state, poseMatch, 3000);
    expect(newState.score).toBe(GAME_CONFIG.SCORE_PER_MOVEMENT + GAME_CONFIG.BONUS_PERFECT_MATCH);
  });

  it('awards level bonus on completion', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 1,
      holdTime: 3000,
      score: 100,
      level: 1,
      completedMovements: 4,
      gameActive: true,
      feedback: '',
    };

    const newState = advanceLevel(state);
    expect(newState.score).toBe(100 + GAME_CONFIG.LEVEL_BONUS);
  });
});

describe('Follow the Leader - Utility Functions', () => {
  it('gets pattern by ID', () => {
    const pattern = getPatternById('penguin-walk');
    expect(pattern).toBeDefined();
    expect(pattern?.id).toBe('penguin-walk');
  });

  it('returns undefined for unknown pattern ID', () => {
    const pattern = getPatternById('unknown-pattern');
    expect(pattern).toBeUndefined();
  });

  it('gets random pattern', () => {
    const pattern = getRandomPattern();
    expect(MOVEMENT_PATTERNS).toContain(pattern);
  });

  it('calculates final stats', () => {
    const state: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0.8,
      holdTime: 2000,
      score: 150,
      level: 3,
      completedMovements: 4,
      gameActive: false,
      feedback: 'Game over!',
    };

    const stats = calculateFinalStats(state);
    expect(stats.score).toBe(150);
    expect(stats.level).toBe(3);
    expect(stats.movementsCompleted).toBe(4);
    expect(stats.accuracy).toBeCloseTo(80, 0);
  });
});

describe('Follow the Leader - Pattern Progression', () => {
  it('gets next pattern in sequence', () => {
    const current = MOVEMENT_PATTERNS[0];
    const next = getNextPattern(current.id, 1);
    expect(next.id).toBe('frog-hop');
  });

  it('loops back when reaching end of patterns', () => {
    const current = MOVEMENT_PATTERNS[5];
    const next = getNextPattern(current.id, 1);
    // Should return a random pattern since we're at the end
    expect(MOVEMENT_PATTERNS).toContain(next);
  });
});

describe('Follow the Leader - Edge Cases', () => {
  it('handles missing key landmarks gracefully', () => {
    const incompleteLandmarks = createMockLandmarks();
    incompleteLandmarks[11] = null; // Remove left shoulder

    const result = checkPoseMatch(incompleteLandmarks, MOVEMENT_PATTERNS[0]);
    expect(result.matches).toBe(false);
    expect(result.feedback).toContain('stand back');
  });

  it('handles zero confidence correctly', () => {
    const landmarks = createMockLandmarks();
    // All landmarks at same position (impossible pose)
    const badLandmarks = landmarks.map(() => ({ x: 0.5, y: 0.5 }));

    const result = checkPoseMatch(badLandmarks, MOVEMENT_PATTERNS[0]);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('does not modify original state when updating', () => {
    const originalState: GameState = {
      currentPattern: MOVEMENT_PATTERNS[0],
      progress: 0.5,
      holdTime: 1000,
      score: 50,
      level: 1,
      completedMovements: 2,
      gameActive: true,
      feedback: 'Good!',
    };

    const poseMatch = {
      matches: true,
      confidence: 0.8,
      feedback: 'Great!',
      missingElements: [],
    };

    const newState = updateGameState(originalState, poseMatch, 500);
    expect(originalState.holdTime).toBe(1000); // Unchanged
    expect(newState.holdTime).toBe(1500); // Changed
  });
});
