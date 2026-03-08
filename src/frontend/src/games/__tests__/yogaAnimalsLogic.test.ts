/**
 * Yoga Animals Game Logic Tests
 *
 * Tests for angle calculation, match scoring, pose configurations,
 * hold duration, and game mechanics.
 */

import { describe, expect, it } from 'vitest';
import { calculateAngle, type Point } from '../../utils/geometry';

// Types for Yoga Animals logic
type Landmark = Point & { z?: number };

interface AnimalPose {
  name: string;
  targets: {
    leftArmAngle?: number;
    rightArmAngle?: number;
    leftLegAngle?: number;
    rightLegAngle?: number;
    torsoAngle?: number;
  };
}

// Constants from YogaAnimals.tsx
const HOLD_DURATION = 2000;
const FRAME_INCREMENT = 50;
const MATCH_THRESHOLD = 70;
const BASE_POINTS = 100;
const STREAK_BONUS_MULTIPLIER = 10;
const MAX_STREAK_BONUS = 50;
const STREAK_MILESTONE_INTERVAL = 5;
const CONTINUOUS_HOLD_THRESHOLD = 10000;

// Animal pose configurations from YogaAnimals.tsx
const ANIMAL_POSES: AnimalPose[] = [
  {
    name: 'Lion',
    targets: { leftArmAngle: 45, rightArmAngle: 45, torsoAngle: 0 },
  },
  {
    name: 'Cat',
    targets: { torsoAngle: 30 },
  },
  {
    name: 'Tree',
    targets: { leftLegAngle: 90, rightLegAngle: 0, torsoAngle: 0 },
  },
  {
    name: 'Dog',
    targets: { leftArmAngle: 90, rightArmAngle: 90, torsoAngle: -20 },
  },
  {
    name: 'Frog',
    targets: { leftLegAngle: 20, rightLegAngle: 20, torsoAngle: -45 },
  },
  {
    name: 'Bird',
    targets: { leftArmAngle: 170, rightArmAngle: 170, torsoAngle: 0 },
  },
];

/**
 * Calculate match score for a pose.
 */
function calculateMatchScore(detectedAngles: {
  leftArmAngle?: number;
  rightArmAngle?: number;
  leftLegAngle?: number;
  rightLegAngle?: number;
  torsoAngle?: number;
}, targetPose: AnimalPose): number {
  let totalScore = 0;
  let targetCount = 0;

  if (targetPose.targets.leftArmAngle !== undefined) {
    const diff = Math.abs(
      (detectedAngles.leftArmAngle || 0) - targetPose.targets.leftArmAngle,
    );
    totalScore += Math.max(0, 100 - diff);
    targetCount++;
  }
  if (targetPose.targets.rightArmAngle !== undefined) {
    const diff = Math.abs(
      (detectedAngles.rightArmAngle || 0) - targetPose.targets.rightArmAngle,
    );
    totalScore += Math.max(0, 100 - diff);
    targetCount++;
  }
  if (targetPose.targets.leftLegAngle !== undefined) {
    const diff = Math.abs(
      (detectedAngles.leftLegAngle || 0) - targetPose.targets.leftLegAngle,
    );
    totalScore += Math.max(0, 100 - diff);
    targetCount++;
  }
  if (targetPose.targets.rightLegAngle !== undefined) {
    const diff = Math.abs(
      (detectedAngles.rightLegAngle || 0) - targetPose.targets.rightLegAngle,
    );
    totalScore += Math.max(0, 100 - diff);
    targetCount++;
  }
  if (targetPose.targets.torsoAngle !== undefined) {
    const diff = Math.abs(
      (detectedAngles.torsoAngle || 0) - targetPose.targets.torsoAngle,
    );
    totalScore += Math.max(0, 100 - diff);
    targetCount++;
  }

  return targetCount > 0 ? totalScore / targetCount : 0;
}

/**
 * Calculate total points for completing a pose.
 */
function calculatePoints(streak: number): number {
  const streakBonus = Math.min(streak * STREAK_BONUS_MULTIPLIER, MAX_STREAK_BONUS);
  return BASE_POINTS + streakBonus;
}

/**
 * Check if pose match is sufficient to count.
 */
function poseMatches(matchScore: number): boolean {
  return matchScore > MATCH_THRESHOLD;
}

/**
 * Check if continuous hold Easter egg should trigger.
 */
function shouldTriggerEasterEgg(continuousHold: number): boolean {
  return continuousHold >= CONTINUOUS_HOLD_THRESHOLD;
}

/**
 * Check if streak milestone should show.
 */
function shouldShowMilestone(streak: number): boolean {
  return streak > 0 && streak % STREAK_MILESTONE_INTERVAL === 0;
}

/**
 * Get hold progress percentage.
 */
function getHoldProgress(holdTime: number): number {
  return Math.min((holdTime / HOLD_DURATION) * 100, 100);
}

describe('Yoga Animals - Angle Calculation', () => {
  it('calculates 180 degrees for a straight line (collinear points)', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 2, y: 0 };

    expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5);
  });

  it('calculates 90 degrees for a right angle', () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 1, y: 1 };

    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5);
  });

  it('calculates acute angles correctly', () => {
    // Points form a triangle with angle at b
    const a: Point = { x: 0, y: 1 };
    const b: Point = { x: 0, y: 0 };
    const c: Point = { x: 1, y: 0 };

    // This creates a right angle (90°)
    expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5);
  });

  it('calculates obtuse angles correctly', () => {
    const a: Point = { x: 0, y: 1 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 2, y: -0.5 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBeGreaterThan(90);
    expect(angle).toBeLessThan(180);
  });

  it('handles reflex angles (angle > 180)', () => {
    // When angle calculation would exceed 180, it returns 360 - angle
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 1, y: 0 };
    const c: Point = { x: 0, y: -1 };

    const angle = calculateAngle(a, b, c);
    expect(angle).toBeLessThanOrEqual(180);
  });
});

describe('Yoga Animals - Match Scoring', () => {
  it('scores 100 for perfect match', () => {
    const detected = {
      leftArmAngle: 45,
      rightArmAngle: 45,
      torsoAngle: 0,
    };
    const target = ANIMAL_POSES[0]; // Lion

    const score = calculateMatchScore(detected, target);
    expect(score).toBe(100);
  });

  it('penalizes 1 point per degree of deviation', () => {
    const detected = {
      leftArmAngle: 50, // 5 degrees off
      rightArmAngle: 45, // exact
      torsoAngle: 5, // 5 degrees off
    };
    const target = ANIMAL_POSES[0];

    const score = calculateMatchScore(detected, target);
    // (95 + 100 + 95) / 3 = 290 / 3 = 96.67
    expect(score).toBeCloseTo(96.67, 1);
  });

  it('averages scores across all targets', () => {
    const detected = {
      leftArmAngle: 40, // 5 off
      rightArmAngle: 50, // 5 off
      torsoAngle: 5, // 5 off
    };
    const target = ANIMAL_POSES[0];

    const score = calculateMatchScore(detected, target);
    expect(score).toBeCloseTo(95, 1); // (95 + 95 + 95) / 3
  });

  it('returns 0 when no targets defined', () => {
    const detected = {};
    const target: AnimalPose = { name: 'Empty', targets: {} };

    const score = calculateMatchScore(detected, target);
    expect(score).toBe(0);
  });

  it('scores single target correctly', () => {
    const detected = { torsoAngle: 30 };
    const target = ANIMAL_POSES[1]; // Cat

    const score = calculateMatchScore(detected, target);
    expect(score).toBe(100); // Perfect match
  });

  it('clamps score minimum to 0 (no negative scores)', () => {
    const detected = {
      leftArmAngle: 150, // 105 degrees off!
      rightArmAngle: 45,
      torsoAngle: 0,
    };
    const target = ANIMAL_POSES[0];

    const score = calculateMatchScore(detected, target);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe('Yoga Animals - Hold Duration', () => {
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
    const matchScore = 50; // Below threshold

    if (!poseMatches(matchScore)) {
      holdTime = 0;
    }

    expect(holdTime).toBe(0);
  });
});

describe('Yoga Animals - Animal Pose Configurations', () => {
  it('Lion: Arms 45°, Torso 0°', () => {
    const pose = ANIMAL_POSES[0];
    expect(pose.name).toBe('Lion');
    expect(pose.targets.leftArmAngle).toBe(45);
    expect(pose.targets.rightArmAngle).toBe(45);
    expect(pose.targets.torsoAngle).toBe(0);
  });

  it('Cat: Torso 30°', () => {
    const pose = ANIMAL_POSES[1];
    expect(pose.name).toBe('Cat');
    expect(pose.targets.torsoAngle).toBe(30);
  });

  it('Tree: Left leg 90°, Right leg 0°, Torso 0°', () => {
    const pose = ANIMAL_POSES[2];
    expect(pose.name).toBe('Tree');
    expect(pose.targets.leftLegAngle).toBe(90);
    expect(pose.targets.rightLegAngle).toBe(0);
    expect(pose.targets.torsoAngle).toBe(0);
  });

  it('Dog: Arms 90°, Torso -20°', () => {
    const pose = ANIMAL_POSES[3];
    expect(pose.name).toBe('Dog');
    expect(pose.targets.leftArmAngle).toBe(90);
    expect(pose.targets.rightArmAngle).toBe(90);
    expect(pose.targets.torsoAngle).toBe(-20);
  });

  it('Frog: Legs 20°, Torso -45°', () => {
    const pose = ANIMAL_POSES[4];
    expect(pose.name).toBe('Frog');
    expect(pose.targets.leftLegAngle).toBe(20);
    expect(pose.targets.rightLegAngle).toBe(20);
    expect(pose.targets.torsoAngle).toBe(-45);
  });

  it('Bird: Arms 170°, Torso 0°', () => {
    const pose = ANIMAL_POSES[5];
    expect(pose.name).toBe('Bird');
    expect(pose.targets.leftArmAngle).toBe(170);
    expect(pose.targets.rightArmAngle).toBe(170);
    expect(pose.targets.torsoAngle).toBe(0);
  });

  it('all 6 poses are defined', () => {
    expect(ANIMAL_POSES).toHaveLength(6);
  });

  it('each pose has at least one target angle', () => {
    for (const pose of ANIMAL_POSES) {
      const targetCount = Object.keys(pose.targets).length;
      expect(targetCount).toBeGreaterThan(0);
    }
  });
});

describe('Yoga Animals - Scoring', () => {
  it('calculates base points correctly', () => {
    expect(BASE_POINTS).toBe(100);
    expect(calculatePoints(0)).toBe(100);
  });

  it('adds streak bonus correctly', () => {
    expect(calculatePoints(1)).toBe(110); // 100 + 10
    expect(calculatePoints(2)).toBe(120); // 100 + 20
    expect(calculatePoints(5)).toBe(150); // 100 + 50 (capped)
  });

  it('caps streak bonus at maximum', () => {
    expect(calculatePoints(5)).toBe(150);
    expect(calculatePoints(10)).toBe(150);
    expect(calculatePoints(100)).toBe(150);
  });

  it('streak bonus formula is linear with cap', () => {
    const bonus1 = Math.min(1 * 10, 50);
    const bonus2 = Math.min(2 * 10, 50);
    const bonus5 = Math.min(5 * 10, 50);

    expect(bonus1).toBe(10);
    expect(bonus2).toBe(20);
    expect(bonus5).toBe(50); // Capped
  });
});

describe('Yoga Animals - Round Progression', () => {
  it('increments pose index on completion', () => {
    let currentIndex = 0;
    currentIndex = (currentIndex + 1) % ANIMAL_POSES.length;
    expect(currentIndex).toBe(1);

    currentIndex = (currentIndex + 1) % ANIMAL_POSES.length;
    expect(currentIndex).toBe(2);

    // Wrap around
    currentIndex = (currentIndex + 4) % ANIMAL_POSES.length;
    expect(currentIndex).toBe(0);
  });

  it('cycles through all 6 poses', () => {
    const poses: string[] = [];
    let index = 0;

    for (let i = 0; i < 12; i++) {
      poses.push(ANIMAL_POSES[index].name);
      index = (index + 1) % ANIMAL_POSES.length;
    }

    expect(poses).toEqual([
      'Lion', 'Cat', 'Tree', 'Dog', 'Frog', 'Bird',
      'Lion', 'Cat', 'Tree', 'Dog', 'Frog', 'Bird',
    ]);
  });
});

describe('Yoga Animals - Match Threshold', () => {
  it('requires match score above 70%', () => {
    expect(MATCH_THRESHOLD).toBe(70);
  });

  it('does not count pose match at threshold boundary', () => {
    expect(poseMatches(70)).toBe(false);
    expect(poseMatches(71)).toBe(true);
  });

  it('holds timer only when match score sufficient', () => {
    let holdTime = 0;
    const goodMatch = 75;
    const badMatch = 65;

    // Good match increments
    for (let i = 0; i < 10; i++) {
      if (poseMatches(goodMatch)) {
        holdTime += FRAME_INCREMENT;
      }
    }
    expect(holdTime).toBe(500); // 10 frames × 50ms

    // Bad match resets
    const previousTime = holdTime;
    if (!poseMatches(badMatch)) {
      holdTime = 0;
    }
    expect(holdTime).toBe(0);
  });
});

describe('Yoga Animals - Easter Egg', () => {
  it('triggers after 10 second continuous hold', () => {
    expect(CONTINUOUS_HOLD_THRESHOLD).toBe(10000); // 10 seconds
    expect(shouldTriggerEasterEgg(10000)).toBe(true);
    expect(shouldTriggerEasterEgg(9999)).toBe(false);
  });

  it('continuous hold resets on pose mismatch', () => {
    let continuousHold = 5000;
    const matchScore = 65; // Below threshold

    if (!poseMatches(matchScore)) {
      continuousHold = 0;
    }

    expect(continuousHold).toBe(0);
  });
});

describe('Yoga Animals - Streak Milestones', () => {
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

describe('Yoga Animals - Edge Cases', () => {
  it('match score is clamped to valid range', () => {
    const minScore = calculateMatchScore(
      { leftArmAngle: 0, rightArmAngle: 0, torsoAngle: 0 },
      ANIMAL_POSES[0],
    );
    const maxScore = calculateMatchScore(
      { leftArmAngle: 45, rightArmAngle: 45, torsoAngle: 0 },
      ANIMAL_POSES[0],
    );

    expect(minScore).toBeGreaterThanOrEqual(0);
    expect(maxScore).toBeLessThanOrEqual(100);
  });

  it('handles missing detected angles as 0', () => {
    const detected = {}; // All undefined (treated as 0 via || 0)
    const target = ANIMAL_POSES[0]; // Lion: arms=45, torso=0

    const score = calculateMatchScore(detected, target);
    // leftArm: |0-45|=45°, score=55
    // rightArm: |0-45|=45°, score=55
    // torso: |0-0|=0°, score=100
    // average: (55+55+100)/3 = 70
    expect(score).toBe(70);
  });

  it('angle calculation handles identical points', () => {
    const a: Point = { x: 0.5, y: 0.5 };
    const b: Point = { x: 0.5, y: 0.5 };
    const c: Point = { x: 0.5, y: 0.5 };

    const angle = calculateAngle(a, b, c);
    // When all points are the same, angle calculation should still work
    expect(angle).not.toBeNaN();
    expect(angle).toBeGreaterThanOrEqual(0);
  });

  it('poses are correctly ordered', () => {
    const poseNames = ANIMAL_POSES.map((p) => p.name);
    expect(poseNames).toEqual(['Lion', 'Cat', 'Tree', 'Dog', 'Frog', 'Bird']);
  });
});

describe('Yoga Animals - Integration Scenarios', () => {
  it('completes Lion pose with exact angles', () => {
    const detected = {
      leftArmAngle: 45,
      rightArmAngle: 45,
      torsoAngle: 0,
    };
    const target = ANIMAL_POSES[0];

    const matchScore = calculateMatchScore(detected, target);
    expect(matchScore).toBe(100);
    expect(poseMatches(matchScore)).toBe(true);
  });

  it('completes Cat pose with exact angle', () => {
    const detected = { torsoAngle: 30 };
    const target = ANIMAL_POSES[1];

    const matchScore = calculateMatchScore(detected, target);
    expect(matchScore).toBe(100);
    expect(poseMatches(matchScore)).toBe(true);
  });

  it('completes Tree pose with exact angles', () => {
    const detected = {
      leftLegAngle: 90,
      rightLegAngle: 0,
      torsoAngle: 0,
    };
    const target = ANIMAL_POSES[2];

    const matchScore = calculateMatchScore(detected, target);
    expect(matchScore).toBe(100);
    expect(poseMatches(matchScore)).toBe(true);
  });

  it('completes Dog pose with exact angles', () => {
    const detected = {
      leftArmAngle: 90,
      rightArmAngle: 90,
      torsoAngle: -20,
    };
    const target = ANIMAL_POSES[3];

    const matchScore = calculateMatchScore(detected, target);
    expect(matchScore).toBe(100);
    expect(poseMatches(matchScore)).toBe(true);
  });

  it('completes Frog pose with exact angles', () => {
    const detected = {
      leftLegAngle: 20,
      rightLegAngle: 20,
      torsoAngle: -45,
    };
    const target = ANIMAL_POSES[4];

    const matchScore = calculateMatchScore(detected, target);
    expect(matchScore).toBe(100);
    expect(poseMatches(matchScore)).toBe(true);
  });

  it('completes Bird pose with exact angles', () => {
    const detected = {
      leftArmAngle: 170,
      rightArmAngle: 170,
      torsoAngle: 0,
    };
    const target = ANIMAL_POSES[5];

    const matchScore = calculateMatchScore(detected, target);
    expect(matchScore).toBe(100);
    expect(poseMatches(matchScore)).toBe(true);
  });

  it('requires full hold time for completion', () => {
    let holdTime = 0;
    const framesNeeded = HOLD_DURATION / FRAME_INCREMENT; // 40 frames

    for (let i = 0; i < framesNeeded - 1; i++) {
      holdTime += FRAME_INCREMENT;
    }

    expect(holdTime).toBe(1950); // One frame short
    expect(holdTime < HOLD_DURATION).toBe(true);
  });

  it('completes after exact hold duration', () => {
    let holdTime = 0;
    const framesNeeded = HOLD_DURATION / FRAME_INCREMENT; // 40 frames

    for (let i = 0; i < framesNeeded; i++) {
      holdTime += FRAME_INCREMENT;
    }

    expect(holdTime).toBeGreaterThanOrEqual(HOLD_DURATION);
  });
});
