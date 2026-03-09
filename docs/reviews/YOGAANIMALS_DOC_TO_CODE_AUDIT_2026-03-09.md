# Yoga Animals - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `yoga-animals`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `YogaAnimals.tsx` (~600 lines)
- Tests: `src/frontend/src/games/__tests__/yogaAnimalsLogic.test.ts` (48 tests)
- Shared Logic: `src/frontend/src/utils/geometry.ts` (calculateAngle)
- Spec: `docs/games/yoga-animals-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Yoga Animals is a full-body pose game where children mimic animal poses using camera-based pose detection. The implementation includes 6 animal poses with angle-based joint matching and a 2-second hold duration.

### Test Coverage
- **48 tests** (excellent)
- **48 tests passing** (100% pass rate)
- Tests cover: angle calculation, match scoring, hold duration, animal pose configurations, scoring, round progression, match threshold, Easter egg, streak milestones, edge cases, integration scenarios

---

## Implementation Quality Assessment

### Strengths
1. **6 animal poses** - Lion, Cat, Tree, Dog, Frog, Bird with unique joint angles
2. **Angle-based matching** - Uses shared `calculateAngle` from utils/geometry.ts
3. **2-second hold** - Achievable pose hold duration for children
4. **70% match threshold** - Forgiving for young children while ensuring accuracy
5. **Multi-joint detection** - Arms, legs, and torso angle tracking
6. **Easter egg** - 10-second continuous hold triggers special event

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `YogaAnimals.tsx` | ~600 | Component with embedded logic |
| `utils/geometry.ts` | Shared | calculateAngle function |
| `yogaAnimalsLogic.test.ts` | ~620 | Unit tests with extracted algorithms |

---

## Test Results

### Passing Tests (48/48) ✅

**Angle Calculation (5 tests)**
- Calculates 180 degrees for a straight line (collinear points)
- Calculates 90 degrees for a right angle
- Calculates acute angles correctly
- Calculates obtuse angles correctly
- Handles reflex angles (angle > 180)

**Match Scoring (6 tests)**
- Scores 100 for perfect match
- Penalizes 1 point per degree of deviation
- Averages scores across all targets
- Returns 0 when no targets defined
- Scores single target correctly
- Clamps score minimum to 0 (no negative scores)

**Hold Duration (4 tests)**
- Has a 2-second hold duration
- Increments hold time by 50ms per frame
- Calculates hold progress percentage correctly
- Resets hold time on pose mismatch

**Animal Pose Configurations (8 tests)**
- Lion: Arms 45°, Torso 0°
- Cat: Torso 30°
- Tree: Left leg 90°, Right leg 0°, Torso 0°
- Dog: Arms 90°, Torso -20°
- Frog: Legs 20°, Torso -45°
- Bird: Arms 170°, Torso 0°
- All 6 poses are defined
- Each pose has at least one target angle

**Scoring (4 tests)**
- Calculates base points correctly (100)
- Adds streak bonus correctly
- Caps streak bonus at maximum (50)
- Streak bonus formula is linear with cap

**Round Progression (2 tests)**
- Increments pose index on completion
- Cycles through all 6 poses

**Match Threshold (3 tests)**
- Requires match score above 70%
- Does not count pose match at threshold boundary (70)
- Holds timer only when match score sufficient

**Easter Egg (2 tests)**
- Triggers after 10 second continuous hold
- Continuous hold resets on pose mismatch

**Streak Milestones (2 tests)**
- Shows milestone every 5 streaks
- Does not show milestone at non-multiples of 5

**Edge Cases (4 tests)**
- Match score is clamped to valid range
- Handles missing detected angles as 0
- Angle calculation handles identical points
- Poses are correctly ordered

**Integration Scenarios (8 tests)**
- Completes Lion pose with exact angles
- Completes Cat pose with exact angle
- Completes Tree pose with exact angles
- Completes Dog pose with exact angles
- Completes Frog pose with exact angles
- Completes Bird pose with exact angles
- Requires full hold time for completion
- Completes after exact hold duration

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | ~600 (component) |
| Exports | Embedded (no separate logic module) |
| Test coverage | 48 tests |
| Test pass rate | 100% |
| Animal poses | 6 |
| Hold duration | 2000ms |

---

## 6 Animal Poses

| Pose | Left Arm | Right Arm | Left Leg | Right Leg | Torso |
|------|----------|-----------|----------|-----------|-------|
| Lion 🦁 | 45° | 45° | - | - | 0° |
| Cat 🐱 | - | - | - | - | 30° |
| Tree 🌳 | - | - | 90° | 0° | 0° |
| Dog 🐕 | 90° | 90° | - | - | -20° |
| Frog 🐸 | - | - | 20° | 20° | -45° |
| Bird 🐦 | 170° | 170° | - | - | 0° |

---

## Key Constants

```typescript
const HOLD_DURATION = 2000;              // 2 seconds
const FRAME_INCREMENT = 50;              // 50ms per frame
const MATCH_THRESHOLD = 70;              // 70% required
const BASE_POINTS = 100;                 // Base score per pose
const STREAK_BONUS_MULTIPLIER = 10;      // +10 per streak
const MAX_STREAK_BONUS = 50;             // Max +50 bonus
const STREAK_MILESTONE_INTERVAL = 5;     // Celebrate every 5
const CONTINUOUS_HOLD_THRESHOLD = 10000; // 10 seconds for Easter egg
```

---

## Match Scoring Algorithm

```typescript
function calculateMatchScore(detectedAngles: DetectedAngles, targetPose: AnimalPose): number {
  let totalScore = 0;
  let targetCount = 0;

  // For each target angle in pose
  for (const [joint, targetAngle] of Object.entries(targetPose.targets)) {
    const detected = detectedAngles[joint] || 0;
    const diff = Math.abs(detected - targetAngle);
    totalScore += Math.max(0, 100 - diff);
    targetCount++;
  }

  return targetCount > 0 ? totalScore / targetCount : 0;
}
```

### Scoring Formula

```
jointScore = max(0, 100 - |detectedAngle - targetAngle|)
matchScore = average(jointScores)
```

### Example (Lion Pose)

| Joint | Target | Detected | Difference | Score |
|-------|--------|----------|------------|-------|
| Left Arm | 45° | 48° | 3° | 97 |
| Right Arm | 45° | 42° | 3° | 97 |
| Torso | 0° | 5° | 5° | 95 |
| **Average** | - | - | - | **96.33** |

---

## Angle Calculation

### Shared Utility (utils/geometry.ts)

```typescript
function calculateAngle(a: Point, b: Point, c: Point): number {
  // Calculate angle at point b formed by segments ab and bc
  // Returns degrees (0-180)
}
```

### Angle Examples

| Points | Angle |
|--------|-------|
| (0,0), (1,0), (2,0) | 180° (straight line) |
| (0,0), (1,0), (1,1) | 90° (right angle) |
| (0,1), (0,0), (1,0) | 90° (right angle) |

---

## Scoring System

### Score Formula

```typescript
streakBonus = Math.min(streak × 10, 50);
totalPoints = BASE_POINTS + streakBonus;
```

### Score Progression

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 100 |
| 1 | 10 | 110 |
| 2 | 20 | 120 |
| 3 | 30 | 130 |
| 4 | 40 | 140 |
| 5+ | 50 | 150 (capped) |

### Max Score per Pose

150 points (100 base + 50 bonus)

---

## Hold Progress

```typescript
function getHoldProgress(holdTime: number): number {
  return Math.min((holdTime / HOLD_DURATION) * 100, 100);
}
```

| Hold Time | Progress |
|-----------|----------|
| 0ms | 0% |
| 500ms | 25% |
| 1000ms | 50% |
| 1500ms | 75% |
| 2000ms | 100% (complete) |

---

## Match Threshold

```typescript
function poseMatches(matchScore: number): boolean {
  return matchScore > MATCH_THRESHOLD;  // > 70, not >= 70
}
```

| Match Score | Matches? |
|-------------|----------|
| 69 | ❌ |
| 70 | ❌ |
| 71 | ✅ |
| 100 | ✅ |

---

## Easter Egg

### Master Yogi Achievement

| Property | Value |
|----------|-------|
| Name | "Master Yogi" |
| Trigger | 10,000ms continuous hold (10 seconds) |
| Detection | Must maintain >70% match throughout |
| Effect | Special celebration + achievement unlock |

---

## Streak Milestones

```typescript
function shouldShowMilestone(streak: number): boolean {
  return streak > 0 && streak % STREAK_MILESTONE_INTERVAL === 0;
}
```

| Streak | Milestone |
|--------|-----------|
| 5 | ✨ |
| 10 | 🌟 |
| 15 | 🏆 |

---

## Visual Design

### Photo Overlay

- **Background:** Target animal photo
- **Opacity:** 50% for player visibility
- **Position:** Centered on screen

### Skeleton Overlay

- **Joints:** Colored circles
- **Bones:** Lines connecting joints
- **Match Quality:**
  - Green: >80% match
  - Yellow: 70-80% match
  - Red: <70% match

### Progress Ring

- **Shape:** Circular progress around character
- **Color:** Fuchsia filling
- **Completion:** Full ring + burst animation

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Pose match detected | playHover() | None |
| Pose match lost | None | None |
| Pose complete | playSuccess() | 'success' |
| Streak milestone | playCelebration() | 'celebration' |
| Easter egg triggered | Special sound | 'celebration' |

---

## Game Flow

1. **Show Target:** Display animal pose photo
2. **Detect Match:** Check if user pose matches (>70%)
3. **Start Hold:** Begin 50ms/frame increment when matched
4. **Complete:** When holdTime >= 2000ms
5. **Next Pose:** Advance to next animal pose
6. **Cycle:** After 6 poses, loop back to start

---

## Comparison with Similar Games

| Feature | YogaAnimals | FollowTheLeader | MirrorDraw |
|---------|-------------|-----------------|------------|
| CV Required | Pose (full body) | Pose (movement) | Hand (draw) |
| Core Mechanic | Hold pose | Follow movement | Mirror symmetry |
| Hold Duration | 2 seconds | N/A | None |
| Educational Focus | Body awareness | Gross motor | Symmetry |
| Poses/Movements | 6 | 6 | 20 |
| Age Range | 4-10 | 4-10 | 4-10 |

---

## Educational Value

### Skills Developed

1. **Body Awareness** - Understanding body position, joint angles, spatial relationships
2. **Gross Motor Skills** - Large muscle movements, balance, coordination
3. **Visual-Spatial Processing** - Mapping visual model to own body
4. **Focus and Patience** - Sustained pose holding, attention maintenance
5. **Imitation Skills** - Observing and replicating movements
6. **Proprioception** - Internal sense of body position

---

## Conclusion

Yoga Animals is **functionally correct** with excellent test coverage (48 tests). The implementation provides comprehensive pose-based gameplay with 6 engaging animal poses. The 70% match threshold and 2-second hold duration are age-appropriate for young children, while the shared `calculateAngle` utility maintains consistency across pose-based games.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (48/48)
**Documentation:** COMPLETE ✅
