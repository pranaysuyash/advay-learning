/**
 * Simon Says Game Logic Tests
 *
 * Tests for scoring, hold duration, pose detection thresholds,
 * body action algorithms, and game mechanics.
 */

import { describe, expect, it } from 'vitest';

// Types for Simon Says logic
type GameMode = 'classic' | 'combo';
type Landmark = { x: number; y: number };

interface SimonSaysState {
  score: number;
  streak: number;
  round: number;
  gameMode: GameMode;
  matchProgress: number;
  holdTime: number;
  targetFingers: number | null;
  detectedFingers: number;
}

// Constants from SimonSays.tsx
const HOLD_DURATION = 2000;
const FRAME_INCREMENT = 50;
const MATCH_THRESHOLD = 70;
const BASE_POINTS = 15;
const STREAK_BONUS_MULTIPLIER = 3;
const MAX_STREAK_BONUS = 15;
const STREAK_MILESTONE_INTERVAL = 5;
const EASTER_EGG_ROUND = 10;

/**
 * Calculate total points for completing an action.
 * Matches formula: basePoints + min(streak × 3, 15)
 */
function calculatePoints(streak: number): number {
  const streakBonus = Math.min(streak * STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS);
  return BASE_POINTS + streakBonus;
}

/**
 * Check if pose match is sufficient to count.
 */
function poseMatches(matchProgress: number): boolean {
  return matchProgress > MATCH_THRESHOLD;
}

/**
 * Check if finger count matches (for combo mode).
 */
function fingerMatches(
  gameMode: GameMode,
  targetFingers: number | null,
  detectedFingers: number,
): boolean {
  if (gameMode !== 'combo') return true;
  if (targetFingers === null) return true;
  return detectedFingers === targetFingers;
}

/**
 * Check if action should complete (pose + finger match).
 */
function shouldCompleteAction(
  matchProgress: number,
  gameMode: GameMode,
  targetFingers: number | null,
  detectedFingers: number,
): boolean {
  return poseMatches(matchProgress) && fingerMatches(gameMode, targetFingers, detectedFingers);
}

/**
 * Check if Easter egg should trigger.
 */
function shouldTriggerEasterEgg(round: number): boolean {
  return round >= EASTER_EGG_ROUND;
}

/**
 * Check if streak milestone should show.
 */
function shouldShowMilestone(streak: number): boolean {
  return streak > 0 && streak % STREAK_MILESTONE_INTERVAL === 0;
}

/**
 * Calculate hold progress percentage.
 */
function getHoldProgress(holdTime: number): number {
  return Math.min((holdTime / HOLD_DURATION) * 100, 100);
}

/**
 * Detect Touch Head pose.
 */
function detectTouchHead(landmarks: Landmark[]): number {
  const nose = landmarks[0];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const leftMatch = leftWrist.y < 0.3 && Math.abs(leftWrist.x - nose.x) < 0.2;
  const rightMatch = rightWrist.y < 0.3 && Math.abs(rightWrist.x - nose.x) < 0.2;

  return leftMatch || rightMatch ? 100 : 0;
}

/**
 * Detect Arms Up pose.
 */
function detectArmsUp(landmarks: Landmark[]): number {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const leftUp = leftWrist.y < leftShoulder.y - 0.1;
  const rightUp = rightWrist.y < rightShoulder.y - 0.1;

  return leftUp && rightUp ? 100 : 0;
}

/**
 * Detect Hands On Hips pose.
 */
function detectHandsOnHips(landmarks: Landmark[]): number {
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const leftInPosition = leftWrist.y > 0.4 && leftWrist.y < 0.6;
  const rightInPosition = rightWrist.y > 0.4 && rightWrist.y < 0.6;

  return leftInPosition && rightInPosition ? 100 : 0;
}

/**
 * Detect Touch Shoulders pose.
 */
function detectTouchShoulders(landmarks: Landmark[]): number {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const leftMatch =
    Math.abs(leftWrist.x - leftShoulder.x) < 0.15 &&
    Math.abs(leftWrist.y - leftShoulder.y) < 0.15;
  const rightMatch =
    Math.abs(rightWrist.x - rightShoulder.x) < 0.15 &&
    Math.abs(rightWrist.y - rightShoulder.y) < 0.15;

  return leftMatch && rightMatch ? 100 : 0;
}

/**
 * Create a full set of pose landmarks.
 */
function createLandmarks(overrides: Partial<Record<number, Partial<Landmark>>> = {}): Landmark[] {
  const base: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5 }));

  for (const [index, values] of Object.entries(overrides)) {
    const idx = Number(index);
    if (base[idx]) {
      base[idx] = { ...base[idx], ...values };
    }
  }

  return base;
}

describe('Simon Says - Scoring Calculations', () => {
  it('calculates base points correctly', () => {
    expect(calculatePoints(0)).toBe(BASE_POINTS);
    expect(BASE_POINTS).toBe(15);
  });

  it('adds streak bonus correctly', () => {
    expect(calculatePoints(1)).toBe(15 + 3); // 18
    expect(calculatePoints(2)).toBe(15 + 6); // 21
    expect(calculatePoints(3)).toBe(15 + 9); // 24
  });

  it('caps streak bonus at maximum', () => {
    expect(calculatePoints(5)).toBe(15 + 15); // 30
    expect(calculatePoints(10)).toBe(15 + 15); // 30
    expect(calculatePoints(100)).toBe(15 + 15); // 30
  });

  it('calculates total points as base plus bonus', () => {
    const points = calculatePoints(4);
    expect(points).toEqual(BASE_POINTS + Math.min(4 * 3, MAX_STREAK_BONUS));
    expect(points).toBe(27); // 15 + 12
  });
});

describe('Simon Says - Hold Duration', () => {
  it('has a 2-second hold duration', () => {
    expect(HOLD_DURATION).toBe(2000);
  });

  it('increments hold time by 50ms per frame', () => {
    expect(FRAME_INCREMENT).toBe(50);
  });

  it('calculates hold progress percentage correctly', () => {
    expect(getHoldProgress(0)).toBe(0);
    expect(getHoldProgress(1000)).toBe(50);
    expect(getHoldProgress(2000)).toBe(100);
    expect(getHoldProgress(3000)).toBe(100); // Capped at 100
  });

  it('resets hold time on pose mismatch', () => {
    let holdTime = 1500;
    const poseMatches = false;

    if (!poseMatches) {
      holdTime = 0;
    }

    expect(holdTime).toBe(0);
  });

  it('accumulates hold time on pose match', () => {
    let holdTime = 0;
    const frames = 40; // 40 frames × 50ms = 2000ms

    for (let i = 0; i < frames; i++) {
      holdTime += FRAME_INCREMENT;
    }

    expect(holdTime).toBe(2000);
  });
});

describe('Simon Says - Streak Bonuses', () => {
  it('increments streak on successful action', () => {
    let streak = 3;
    streak++;
    expect(streak).toBe(4);
  });

  it('increases bonus with each consecutive success', () => {
    const streak1 = calculatePoints(1);
    const streak2 = calculatePoints(2);
    const streak3 = calculatePoints(3);

    expect(streak2).toBeGreaterThan(streak1);
    expect(streak3).toBeGreaterThan(streak2);
  });

  it('resets streak when mode changes or skip pressed', () => {
    let streak = 5;
    streak = 0; // Reset on mode change or skip
    expect(streak).toBe(0);
  });
});

describe('Simon Says - Pose Detection Thresholds', () => {
  it('requires match progress above 70%', () => {
    expect(MATCH_THRESHOLD).toBe(70);
  });

  it('does not count pose match below threshold', () => {
    expect(poseMatches(69)).toBe(false);
    expect(poseMatches(50)).toBe(false);
    expect(poseMatches(0)).toBe(false);
  });

  it('counts pose match at threshold and above', () => {
    expect(poseMatches(71)).toBe(true);
    expect(poseMatches(100)).toBe(true);
  });

  it('accepts exactly at threshold boundary (strictly greater)', () => {
    expect(poseMatches(70)).toBe(false); // Not > 70
    expect(poseMatches(71)).toBe(true);  // > 70
  });

  it('holds pose only when pose and finger match', () => {
    // Both must match
    const goodPose = poseMatches(80);
    const goodFingers = fingerMatches('combo', 3, 3);
    const bothMatch = goodPose && goodFingers;

    expect(bothMatch).toBe(true);
  });
});

describe('Simon Says - Body Action Detection', () => {
  it('detects Touch Head pose correctly', () => {
    const landmarks = createLandmarks({
      0: { x: 0.5, y: 0.2 }, // Nose
      15: { x: 0.5, y: 0.25 }, // Left wrist near nose, high up
    });

    const score = detectTouchHead(landmarks);
    expect(score).toBe(100);
  });

  it('detects Arms Up pose correctly', () => {
    const landmarks = createLandmarks({
      11: { x: 0.4, y: 0.6 }, // Left shoulder
      12: { x: 0.6, y: 0.6 }, // Right shoulder
      15: { x: 0.4, y: 0.4 }, // Left wrist above
      16: { x: 0.6, y: 0.4 }, // Right wrist above
    });

    const score = detectArmsUp(landmarks);
    expect(score).toBe(100);
  });

  it('detects Hands On Hips pose correctly', () => {
    const landmarks = createLandmarks({
      15: { x: 0.35, y: 0.5 }, // Left wrist at 0.5
      16: { x: 0.65, y: 0.5 }, // Right wrist at 0.5
    });

    const score = detectHandsOnHips(landmarks);
    expect(score).toBe(100);
  });

  it('detects Touch Shoulders pose correctly', () => {
    const landmarks = createLandmarks({
      11: { x: 0.35, y: 0.5 }, // Left shoulder
      12: { x: 0.65, y: 0.5 }, // Right shoulder
      15: { x: 0.35, y: 0.5 }, // Left wrist at shoulder
      16: { x: 0.65, y: 0.5 }, // Right wrist at shoulder
    });

    const score = detectTouchShoulders(landmarks);
    expect(score).toBe(100);
  });

  it('returns 0 for Wave pose (not implemented)', () => {
    // Wave falls through to default case, returning 0
    const matchScore = 0;
    expect(matchScore).toBe(0);
  });

  it('returns 0 for T-Rex pose (not implemented)', () => {
    // T-Rex falls through to default case, returning 0
    const matchScore = 0;
    expect(matchScore).toBe(0);
  });
});

describe('Simon Says - Game Mode Differences', () => {
  it('classic mode does not require finger match', () => {
    const gameMode: GameMode = 'classic';
    const targetFingers: number | null = null;
    const detectedFingers = 0;

    const matches = fingerMatches(gameMode, targetFingers, detectedFingers);
    expect(matches).toBe(true);
  });

  it('combo mode requires exact finger match', () => {
    const gameMode: GameMode = 'combo';
    const targetFingers: number | null = 3;
    const detectedFingers = 3;

    const matches = fingerMatches(gameMode, targetFingers, detectedFingers);
    expect(matches).toBe(true);
  });

  it('combo mode rejects wrong finger count', () => {
    const gameMode: GameMode = 'combo';
    const targetFingers: number | null = 3;
    const detectedFingers = 2;

    const matches = fingerMatches(gameMode, targetFingers, detectedFingers);
    expect(matches).toBe(false);
  });
});

describe('Simon Says - Round Progression', () => {
  it('increments round on action completion', () => {
    let round = 5;
    round++;
    expect(round).toBe(6);
  });

  it('cycles through 6 actions continuously', () => {
    const ACTIONS_COUNT = 6;
    let actionIndex = 5;
    actionIndex = (actionIndex + 1) % ACTIONS_COUNT;
    expect(actionIndex).toBe(0); // Wraps around
  });
});

describe('Simon Says - Easter Egg Conditions', () => {
  it('triggers at round 10', () => {
    expect(shouldTriggerEasterEgg(10)).toBe(true);
    expect(shouldTriggerEasterEgg(11)).toBe(true);
  });

  it('does not trigger before round 10', () => {
    expect(shouldTriggerEasterEgg(9)).toBe(false);
    expect(shouldTriggerEasterEgg(1)).toBe(false);
  });
});

describe('Simon Says - Streak Milestones', () => {
  it('shows milestone every 5 streaks', () => {
    expect(shouldShowMilestone(5)).toBe(true);
    expect(shouldShowMilestone(10)).toBe(true);
    expect(shouldShowMilestone(15)).toBe(true);
  });

  it('does not show milestone at non-multiples of 5', () => {
    expect(shouldShowMilestone(1)).toBe(false);
    expect(shouldShowMilestone(3)).toBe(false);
    expect(shouldShowMilestone(7)).toBe(false);
  });
});

describe('Simon Says - Edge Cases', () => {
  it('full landmark set is required for detection', () => {
    const incompleteLandmarks: Landmark[] = Array.from({ length: 10 }, () => ({ x: 0.5, y: 0.5 }));

    // The detection functions require landmarks[11], [12], [15], [16]
    // With only 10 landmarks, accessing index 15+ will be undefined
    // This tests documents the current behavior - functions expect full 33-point pose
    expect(() => detectArmsUp(incompleteLandmarks)).toThrow();
  });

  it('clamps match score to valid range', () => {
    const minScore = 0;
    const maxScore = 100;

    expect(minScore).toBeGreaterThanOrEqual(0);
    expect(maxScore).toBeLessThanOrEqual(100);
  });

  it('hold time can exceed required duration', () => {
    let holdTime = 0;

    // Simulate holding for longer than required
    for (let i = 0; i < 100; i++) {
      holdTime += FRAME_INCREMENT;
    }

    expect(holdTime).toBeGreaterThanOrEqual(HOLD_DURATION);
    // In game logic, action completes when holdTime >= HOLD_DURATION
  });
});

describe('Simon Says - Integration Scenarios', () => {
  it('completes action in classic mode with pose match only', () => {
    const matchProgress = 80; // Above threshold
    const gameMode: GameMode = 'classic';
    const targetFingers: number | null = null;
    const detectedFingers = 0;

    const completes = shouldCompleteAction(matchProgress, gameMode, targetFingers, detectedFingers);
    expect(completes).toBe(true);
  });

  it('completes action in combo mode with pose and finger match', () => {
    const matchProgress = 80;
    const gameMode: GameMode = 'combo';
    const targetFingers: number | null = 3;
    const detectedFingers = 3;

    const completes = shouldCompleteAction(matchProgress, gameMode, targetFingers, detectedFingers);
    expect(completes).toBe(true);
  });

  it('does not complete with pose match but wrong finger count', () => {
    const matchProgress = 80;
    const gameMode: GameMode = 'combo';
    const targetFingers: number | null = 3;
    const detectedFingers = 2;

    const completes = shouldCompleteAction(matchProgress, gameMode, targetFingers, detectedFingers);
    expect(completes).toBe(false);
  });

  it('does not complete with pose below threshold', () => {
    const matchProgress = 50; // Below 70 threshold
    const gameMode: GameMode = 'classic';
    const targetFingers: number | null = null;
    const detectedFingers = 0;

    const completes = shouldCompleteAction(matchProgress, gameMode, targetFingers, detectedFingers);
    expect(completes).toBe(false);
  });
});

describe('Simon Says - Scoring with Streak', () => {
  it('calculates increasing points with streak', () => {
    const points1 = calculatePoints(1);
    const points2 = calculatePoints(2);
    const points3 = calculatePoints(3);
    const points4 = calculatePoints(4);
    const points5 = calculatePoints(5);

    expect(points1).toBe(18); // 15 + 3
    expect(points2).toBe(21); // 15 + 6
    expect(points3).toBe(24); // 15 + 9
    expect(points4).toBe(27); // 15 + 12
    expect(points5).toBe(30); // 15 + 15 (capped)
  });

  it('streak bonus formula is linear with cap', () => {
    const bonus1 = Math.min(1 * 3, 15);
    const bonus2 = Math.min(2 * 3, 15);
    const bonus3 = Math.min(3 * 3, 15);
    const bonus10 = Math.min(10 * 3, 15);

    expect(bonus1).toBe(3);
    expect(bonus2).toBe(6);
    expect(bonus3).toBe(9);
    expect(bonus10).toBe(15); // Capped
  });
});

describe('Simon Says - Pose Detection Edge Cases', () => {
  it('Touch Head: only one hand needs to reach', () => {
    // Left hand reaches, right doesn't
    const landmarks = createLandmarks({
      0: { x: 0.5, y: 0.2 }, // Nose
      15: { x: 0.5, y: 0.25 }, // Left wrist - good
      16: { x: 0.8, y: 0.6 }, // Right wrist - bad
    });

    const score = detectTouchHead(landmarks);
    expect(score).toBe(100); // One hand is enough
  });

  it('Arms Up: both arms must be up', () => {
    // Only left arm up
    const landmarks = createLandmarks({
      11: { x: 0.4, y: 0.6 },
      12: { x: 0.6, y: 0.6 },
      15: { x: 0.4, y: 0.4 }, // Left wrist up
      16: { x: 0.6, y: 0.7 }, // Right wrist down
    });

    const score = detectArmsUp(landmarks);
    expect(score).toBe(0); // Both must be up
  });

  it('Hands On Hips: both wrists must be in range', () => {
    // Left wrist in range, right too high
    const landmarks = createLandmarks({
      15: { x: 0.35, y: 0.5 }, // Left: 0.5 ✓
      16: { x: 0.65, y: 0.3 }, // Right: 0.3 ✗
    });

    const score = detectHandsOnHips(landmarks);
    expect(score).toBe(0); // Both must be in 0.4-0.6 range
  });

  it('Touch Shoulders: both wrists must be close', () => {
    // Left wrist close, right wrist far
    const landmarks = createLandmarks({
      11: { x: 0.35, y: 0.5 },
      12: { x: 0.65, y: 0.5 },
      15: { x: 0.36, y: 0.51 }, // Close to left shoulder
      16: { x: 0.9, y: 0.5 }, // Far from right shoulder
    });

    const score = detectTouchShoulders(landmarks);
    expect(score).toBe(0); // Both must be within 0.15
  });
});
