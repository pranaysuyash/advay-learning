# Yoga Animals Game Specification

**Game ID:** `yoga-animals`
**World:** Body Zone
**Vibe:** Chill
**Age Range:** 3-8 years
**CV Requirements:** Pose detection

---

## Overview

Yoga Animals is a calm body movement game where children mimic animal poses using their body. The game uses pose detection to measure body joint angles and verifies the child is holding the correct pose. Each completed pose earns points with streak bonuses.

### Tagline
"Become a tree, a lion, a flamingo — hold the pose! 🦁🌳"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Player presses "Start Yoga!" button
2. **Pose Displayed** - Animal icon + instruction + demonstration
3. **Player Mimics** - Child copies the animal pose
4. **Angle Detection** - Camera measures body joint angles
5. **Match Verification** - Compares detected angles to target angles
6. **Hold Steady** - Child must hold pose for 2 seconds
7. **Score Points** - Base points + streak bonus
8. **Next Pose** - New animal from the 6-pose pool
9. **Repeat** - Infinite rounds

### Controls

| Action | Input |
|--------|-------|
| Mimic pose | Full body movement |
| Hold pose | Maintain position for 2 seconds |
| Skip | Press "Skip Pose" button |
| Stop game | Press "Stop Playing" button |

---

## Animal Poses

### Pose Configuration

Each pose defines target angles for body joints:

```typescript
interface AnimalPose {
  name: string;
  icon: React.ReactNode;
  description: string;
  instruction: string;
  targets: {
    leftArmAngle?: number;
    rightArmAngle?: number;
    leftLegAngle?: number;
    rightLegAngle?: number;
    torsoAngle?: number;
  };
}
```

### Six Animal Poses

| # | Animal | Instruction | Target Angles | Difficulty |
|---|--------|-------------|---------------|------------|
| 1 | Lion | Put hands up like claws, open mouth wide | Arms: 45°, Torso: 0° | Easy |
| 2 | Cat | Get on all fours, arch back | Torso: 30° | Easy |
| 3 | Tree | Stand on one leg, arms stretched up | Left leg: 90°, Right leg: 0°, Torso: 0° | Medium |
| 4 | Dog | Crouch down, arms out like paws | Arms: 90°, Torso: -20° | Medium |
| 5 | Frog | Squat down, hands on ground | Legs: 20°, Torso: -45° | Hard |
| 6 | Bird | Stand with arms out wide | Arms: 170°, Torso: 0° | Medium |

### Pose Descriptions

#### Lion
- **Icon:** Bug (emerald green)
- **Description:** "Be a fierce lion!"
- **Instruction:** "Put your hands up like claws and open your mouth wide!"
- **Targets:**
  - Left arm: 45° (elbow bent at 45°)
  - Right arm: 45°
  - Torso: 0° (upright)

#### Cat
- **Icon:** Cat (amber)
- **Description:** "Stretch like a cat!"
- **Instruction:** "Get on all fours and arch your back up like a stretching cat!"
- **Targets:**
  - Torso: 30° (slight arch)

#### Tree
- **Icon:** Tree (emerald)
- **Description:** "Stand tall like a tree!"
- **Instruction:** "Stand on one leg, with arms stretched up like branches!"
- **Targets:**
  - Left leg: 90° (lifted)
  - Right leg: 0° (planted)
  - Torso: 0° (upright)

#### Dog
- **Icon:** Dog (custom)
- **Description:** "Be a happy dog!"
- **Instruction:** "Crouch down and stick your arms out like paws!"
- **Targets:**
  - Left arm: 90°
  - Right arm: 90°
  - Torso: -20° (leaning forward)

#### Frog
- **Icon:** Kenney frog (animated)
- **Description:** "Jump like a frog!"
- **Instruction:** "Squat down with hands on the ground, then jump up!"
- **Targets:**
  - Left leg: 20°
  - Right leg: 20°
  - Torso: -45° (leaning forward significantly)

#### Bird
- **Icon:** Bird
- **Description:** "Fly like a bird!"
- **Instruction:** "Stand with arms out wide like wings and flap!"
- **Targets:**
  - Left arm: 170° (arms straight out)
  - Right arm: 170°
  - Torso: 0° (upright)

---

## Angle Calculation Algorithm

### Function

**Location:** `src/frontend/src/utils/geometry.ts`

```typescript
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  // Calculate angle at point b between segments ba and bc
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle; // Returns angle in degrees [0, 180]
}
```

### Usage Examples

```typescript
// Left arm angle (shoulder → elbow → wrist)
const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);

// Right leg angle (hip → knee → ankle)
const rightLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

// Torso angle (shoulder midpoint → hip midpoint → left hip)
const shoulderMid = {
  x: (leftShoulder.x + rightShoulder.x) / 2,
  y: (leftShoulder.y + rightShoulder.y) / 2,
};
const torsoAngle = calculateAngle(leftShoulder, shoulderMid, leftHip) - 90;
```

**Note:** The `calculateAngle` function is exported from `src/frontend/src/utils/geometry.ts` and can be reused by other games needing angle-based pose detection.

---

## Match Scoring System

### Scoring Algorithm

```typescript
let totalScore = 0;
let targetCount = 0;

// For each target angle defined in the pose:
if (currentPose.targets.leftArmAngle !== undefined) {
  const diff = Math.abs(leftArmAngle - currentPose.targets.leftArmAngle);
  totalScore += Math.max(0, 100 - diff); // 1° = 1 point penalty
  targetCount++;
}
// ... repeat for rightArmAngle, leftLegAngle, rightLegAngle, torsoAngle

const matchScore = targetCount > 0 ? totalScore / targetCount : 0;
```

### Scoring Examples

| Detected Angle | Target Angle | Score | Penalty |
|----------------|-------------|-------|---------|
| 45° | 45° | 100 | 0 |
| 50° | 45° | 95 | 5 |
| 40° | 45° | 95 | 5 |
| 35° | 45° | 85 | 15 |
| 30° | 45° | 75 | 25 |

### Match Threshold

**Required:** matchScore > 70

- Only when above 70% does the hold timer start incrementing
- Below 70%, hold time resets to 0
- At exactly 70%, still doesn't count (strictly greater than)

---

## Hold Duration

### Hold Mechanics

| Parameter | Value |
|-----------|-------|
| HOLD_DURATION | 2000ms (2 seconds) |
| Frame increment | 50ms per frame @ ~20 fps |
| Detection rate | ~20 fps |
| Frames needed | ~40 consecutive matches |

### Hold Progress

```
if (matchScore > 70) {
  holdTime += 50ms;  // Add per frame
  if (holdTime >= 2000ms) {
    // Success! Complete pose
  }
} else {
  holdTime = 0;  // Reset on mismatch
}
```

---

## Scoring System

### Points Calculation

```typescript
basePoints = 100;
streakBonus = Math.min(streak × 10, 50);
totalPoints = basePoints + streakBonus;
```

### Streak Progression

| Streak | Bonus | Total |
|--------|-------|-------|
| 1 | 10 | 110 |
| 2 | 20 | 120 |
| 3 | 30 | 130 |
| 4 | 40 | 140 |
| 5+ | 50 | 150 |

### Total Score

```
totalScore = Σ (all completed pose points)
```

---

## Visual Design

### Progress Bars

#### Pose Match Bar
- **Color:** Green (#10B981) if >70%, Blue (#3B82F6) if ≤70%
- **Width:** Represents matchProgress (0-100%)
- **Purpose:** Shows how well pose matches target angles

#### Hold Progress Bar
- **Color:** Amber (#F59E0B)
- **Width:** Represents (holdTime / 2000ms) × 100%
- **Purpose:** Shows progress toward 2-second hold

### Match Status Badge

| Match % | Badge | Background | Text Color |
|---------|-------|------------|------------|
| >70 | "Perfect Match!" | Green/emerald-400 | White |
| ≤70 | "XX% Matched" | Black/40% | White |

### Animal Icons

| Animal | Icon Type | Size | Color |
|--------|----------|------|-------|
| Lion | Bug (Lucide) | 4rem (w-16 h-16) | Emerald-500 |
| Cat | Cat (Lucide) | 4rem | Amber-500 |
| Tree | TreeDeciduous (Lucide) | 4rem | Emerald-600 |
| Dog | Dog (Lucide) | 4rem | Custom |
| Frog | Kenney animated | Large | N/A |
| Bird | Bird (Lucide) | 4rem | Custom |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playPop() | None |
| Pose complete | playFanfare() | 'success' |
| Milestone (5, 10, 15...) | playFanfare() | 'celebration' |
| Skip pose | playPop() | None |
| Stop game | playPop() | None |

---

## Accessibility Features

### Visual Cues
- Large animal icons (5rem × 5rem)
- Kenney character demonstration (frog animation)
- Color-coded progress bars
- Percentage displays
- Reduced motion support via useReducedMotion hook

### Clear Instructions
- Step-by-step "How to Play" guide with icons
- Lightbulb-highlighted instructions for each pose
- Icon-based instructions for pre-readers

### Skip Button
- Allows skipping difficult poses
- Resets hold time to 0
- No penalty for skipping

### Wellness Timer
- Integrated WellnessTimer component
- Helps manage screen time
- Promotes healthy play habits

---

## Easter Egg

| Property | Value |
|----------|-------|
| ID | `egg-spirit-animal` |
| Name | "Spirit Animal" |
| Trigger | Hold pose for 10 continuous seconds |
| Effect | Triggers item drop system |

**Implementation:**
```typescript
if (matchScore > 70) {
  continuousHoldRef.current += 50;
  if (continuousHoldRef.current >= 10000) { // 10 seconds
    triggerEasterEgg('egg-spirit-animal');
    continuousHoldRef.current = 0;
  }
}
```

---

## Progress Tracking

### Integration with progressQueue

```typescript
await progressQueue.add({
  profileId: currentProfile.id,
  gameId: 'yoga-animals',
  score: finalScore,
  completed: true,
  metadata: {
    posesCompleted: currentPoseIndex,
    holdTime,
  },
});
```

### Data Tracked

| Field | Type | Description |
|-------|------|-------------|
| profileId | string | User's profile ID |
| gameId | string | 'yoga-animals' |
| score | number | Total score |
| completed | boolean | Always true on stop |
| metadata.posesCompleted | number | Number of poses completed |
| metadata.holdTime | number | Final hold time |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| score | number | Total accumulated score |
| streak | number | Current consecutive successes |
| currentPoseIndex | number | Index into ANIMAL_POSES (0-5) |
| matchProgress | number | Current pose match score (0-100) |
| holdTime | number | Current hold time in milliseconds |
| showCelebration | boolean | Celebration overlay visibility |
| cameraReady | boolean | Whether camera is initialized |
| showStreakMilestone | boolean | Streak milestone overlay visibility |

---

## Technical Implementation

### Dependencies

```typescript
// Pose detection
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';

// Progress tracking
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';

// Audio
import { useAudio } from '../utils/hooks/useAudio';

// Geometry utilities (angle calculation)
import { calculateAngle } from '../utils/geometry';

// UI
import { motion, AnimatePresence } from 'framer-motion';
import { KenneyEnemy } from '../components/characters/KenneyCharacter';
import { WellnessTimer } from '../components/WellnessTimer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';

// Error handling
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
```

### Key Constants

```typescript
// Timing
const HOLD_DURATION = 2000;  // 2 seconds in milliseconds
const FRAME_INCREMENT = 50;   // Hold time added per frame
const MATCH_THRESHOLD = 70;   // Minimum match score to count
const CONTINUOUS_HOLD_THRESHOLD = 10000; // 10 seconds for easter egg

// Scoring
const BASE_POINTS = 100;
const STREAK_BONUS_MULTIPLIER = 10;
const MAX_STREAK_BONUS = 50;

// Milestone
const STREAK_MILESTONE_INTERVAL = 5;  // Every 5 streaks

// Easter egg
const EASTER_EGG_HOLD_TIME = 10000; // 10 seconds
```

### Pose Landmarks Used

| Index | Body Part | Used For |
|-------|-----------|----------|
| 11 | Left Shoulder | Arm angle, torso angle |
| 12 | Right Shoulder | Arm angle, torso angle |
| 13 | Left Elbow | Arm angle |
| 14 | Right Elbow | Arm angle |
| 15 | Left Wrist | Arm angle |
| 16 | Right Wrist | Arm angle |
| 23 | Left Hip | Leg angle, torso angle |
| 24 | Right Hip | Leg angle, torso angle |
| 25 | Left Knee | Leg angle |
| 26 | Right Knee | Leg angle |
| 27 | Left Ankle | Leg angle |
| 28 | Right Ankle | Leg angle |

---

## Test Coverage

### Test Suite: `yogaAnimalsLogic.test.ts`

**48 tests covering:**
- Angle calculation algorithm (5 tests)
- Match scoring calculations (6 tests)
- Hold duration mechanics (4 tests)
- Animal pose configurations (12 tests)
- Streak bonuses (3 tests)
- Round progression (2 tests)
- Easter egg conditions (2 tests)
- Edge cases (4 tests)

**All tests passing ✅**

---

## End Behavior

### Manual Ending Only

YogaAnimals has no automatic ending:
- Player can complete infinite poses
- Poses cycle through 6-pose array
- Score accumulates continuously
- Player stops via "Stop Playing" button

### Stop Behavior

| Action | Effect |
|--------|--------|
| Stop Playing button | Saves progress via progressQueue, Sets isPlaying=false |

---

## Ticket References

| Ticket | Description | Status |
|--------|-------------|--------|
| GQ-002 | Game subscription hooks | ✅ Implemented |
| GQ-003 | Game progress tracking | ✅ Implemented |
| GQ-004 | Quality/UX standards | ✅ Implemented |
| GQ-005 | Accessibility features | ✅ Implemented |
| GQ-007 | Engagement features | ✅ Implemented (streak system) |

---

## Comparison with Similar Games

| Feature | YogaAnimals | SimonSays | FreezeDance |
|---------|-------------|-----------|-------------|
| CV Required | Pose only | Pose + Hand (combo) | Pose + Hand (combo) |
| Core Mechanic | Mimic animal poses | Mimic actions | Hold still |
| Scoring | Points + streak | Points + streak | Stability % |
| Game Modes | 1 | 2 | 2 |
| Poses/Actions | 6 animal poses | 6 actions | Dance/freeze |
| Hold Duration | 2 seconds | 2 seconds | 3.5 seconds |
| Age Range | 3-8 | 3-8 | 3-8 |
| Vibe | Chill | Active | Active |

---

## Future Enhancements

### Potential Additions
- **Difficulty levels** - Adjust angle tolerances
- **More animal poses** - Expand beyond 6
- **Pose sequences** - Flow from one pose to another
- **Breathing exercises** - Incorporate mindfulness
- **Custom poses** - Create your own poses
- **Multiplayer mode** - Two players competing

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
