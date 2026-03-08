# Follow the Leader Game Specification

**Game ID:** `follow-the-leader`
**World:** Body Zone
**Vibe:** Active
**Age Range:** 3-8 years
**CV Requirements:** Pose detection

---

## Overview

Follow the Leader is an active body movement game where children mirror movement patterns demonstrated by a guide character. The game uses pose detection to measure body joint angles and verifies the child is matching the movement. Each completed movement earns points with streak bonuses.

### Tagline
"Mirror the movements! Walk, hop, march like the leader! 🎭"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Player presses "Start Following!" button
2. **Guide Shown** - Animal movement displayed with emoji and instruction (3-5 second preview)
3. **Player Mimics** - Child copies the movement pattern
4. **Pose Detection** - Camera measures body joint angles and positions
5. **Match Verification** - Compares detected pose to target pose with tolerance
6. **Hold Steady** - Child must hold pose for required duration (2-4 seconds per movement)
7. **Score Points** - Base points + accuracy bonus
8. **Next Movement** - New movement from the 6-movement pool
9. **Level Complete** - After 4 movements, advance to next level

### Controls

| Action | Input |
|--------|-------|
| Mimic movement | Full body movement |
| Hold pose | Maintain position for 2-4 seconds |
| Return to menu | Press "Back to Menu" button |
| Stop game | Press home button |

---

## Movement Patterns

### Pattern Configuration

Each movement defines target angles for body joints:

```typescript
interface MovementPattern {
  id: string;
  name: string;
  instruction: string;
  emoji: string;
  targetPose: {
    leftArmAngle?: number;
    rightArmAngle?: number;
    leftLegAngle?: number;
    rightLegAngle?: number;
    torsoAngle?: number;
    bodyHeight?: number; // Normalized height (0-1)
  };
  tolerance: number; // 0-1, higher = more lenient
  duration: number; // Hold duration in milliseconds
}
```

### Six Movement Patterns

| # | Movement | Instruction | Target Angles | Duration | Tolerance |
|---|----------|-------------|---------------|----------|-----------|
| 1 | Penguin Walk | Walk like a penguin! Keep arms stiff by sides | Arms: 10°, Torso: 5°, Height: 0.5 | 3s | 0.6 |
| 2 | Frog Hop | Hop like a frog! Crouch with hands on ground | Arms: 90°, Legs: 30°, Torso: -20°, Height: 0.3 | 2s | 0.5 |
| 3 | Tiptoe Quietly | Tiptoe quietly! Walk softly on toes | Arms: 80°, Torso: 5°, Height: 0.6 | 4s | 0.7 |
| 4 | March Like a Soldier | March like a soldier! Swing arms and lift knees | L-Arm: 120°, R-Arm: 60°, L-Leg: 90°, Height: 0.6 | 3s | 0.5 |
| 5 | Fly Like a Bird | Fly like a bird! Flap wings up and down | Arms: 170°, Torso: 0°, Height: 0.6 | 4s | 0.6 |
| 6 | Swim Like a Fish | Swim like a fish! Make swimming motions | Arms: 45°, Torso: 10°, Height: 0.5 | 3s | 0.7 |

### Movement Descriptions

#### Penguin Walk 🐧
- **Target Pose:**
  - Left arm: 10° (straight down)
  - Right arm: 10°
  - Torso: 5° (upright)
  - Body height: 0.5 (standing)
- **Duration:** 3000ms (3 seconds)
- **Tolerance:** 0.6 (60% confidence threshold)

#### Frog Hop 🐸
- **Target Pose:**
  - Left arm: 90° (forward/down)
  - Right arm: 90°
  - Left leg: 30° (bent)
  - Right leg: 30°
  - Torso: -20° (leaning forward)
  - Body height: 0.3 (crouching)
- **Duration:** 2000ms (2 seconds)
- **Tolerance:** 0.5 (50% confidence threshold)

#### Tiptoe Quietly 👣
- **Target Pose:**
  - Left arm: 80° (out for balance)
  - Right arm: 80°
  - Torso: 5° (upright)
  - Body height: 0.6 (on toes)
- **Duration:** 4000ms (4 seconds)
- **Tolerance:** 0.7 (70% confidence threshold)

#### March Like a Soldier 🎖️
- **Target Pose:**
  - Left arm: 120° (forward)
  - Right arm: 60° (back)
  - Left leg: 90° (lifted)
  - Torso: 0° (upright)
  - Body height: 0.6 (standing on one leg)
- **Duration:** 3000ms (3 seconds)
- **Tolerance:** 0.5 (50% confidence threshold)

#### Fly Like a Bird 🐦
- **Target Pose:**
  - Left arm: 170° (up high)
  - Right arm: 170°
  - Torso: 0° (upright)
  - Body height: 0.6
- **Duration:** 4000ms (4 seconds)
- **Tolerance:** 0.6 (60% confidence threshold)

#### Swim Like a Fish 🐟
- **Target Pose:**
  - Left arm: 45° (swimming motion)
  - Right arm: 45°
  - Torso: 10° (slight body movement)
  - Body height: 0.5
- **Duration:** 3000ms (3 seconds)
- **Tolerance:** 0.7 (70% confidence threshold)

---

## Pose Detection Algorithm

### Angle Calculation

Uses the shared `calculateAngle` function from `utils/geometry.ts`:

```typescript
function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}
```

### Body Landmarks Used

| Index | Body Part | Used For |
|-------|-----------|----------|
| 11 | Left Shoulder | Arm angle calculation |
| 12 | Right Shoulder | Arm angle calculation |
| 13 | Left Elbow | Arm angle calculation |
| 14 | Right Elbow | Arm angle calculation |
| 15 | Left Wrist | Arm angle calculation |
| 16 | Right Wrist | Arm angle calculation |
| 23 | Left Hip | Leg angle, torso angle, height |
| 24 | Right Hip | Leg angle, torso angle, height |
| 25 | Left Knee | Leg angle calculation |
| 26 | Right Knee | Leg angle calculation |
| 27 | Left Ankle | Leg angle, height calculation |
| 28 | Right Ankle | Leg angle, height calculation |

---

## Match Scoring System

### Confidence Calculation

```typescript
// For each body part checked:
const angleDiff = Math.abs(detectedAngle - targetAngle);
const angleScore = Math.max(0, 1 - angleDiff / 180);
scores.push(angleScore);

// Overall confidence:
const confidence = scores.reduce((a, b) => a + b, 0) / scores.length;
```

### Match Threshold

**Required:** confidence >= pattern.tolerance (varies by pattern, 0.5-0.7)

- Only when above threshold does hold time increment
- Below threshold, hold time resets to 0

### Scoring Examples

| Confidence | Score | Bonus |
|------------|-------|-------|
| >90% | 25 + 10 = 35 | Perfect match bonus |
| ≥ tolerance | 25 | Base score |
| Below tolerance | 0 | No progress |

---

## Game Progression

### Level Structure

| Property | Value |
|----------|-------|
| Movements per level | 4 |
| Level duration | 45 seconds (soft limit) |
| Patterns available | 6 total |

### Scoring

```typescript
basePoints = 25; // per movement
perfectMatchBonus = 10; // when confidence > 90%
levelBonus = 50; // upon completing level
```

### Progress Calculation

```typescript
progress = Math.min(1, holdTime / currentPattern.duration);
```

---

## Hold Duration

| Movement | Duration |
|----------|----------|
| Penguin Walk | 3000ms (3s) |
| Frog Hop | 2000ms (2s) |
| Tiptoe Quietly | 4000ms (4s) |
| March Like a Soldier | 3000ms (3s) |
| Fly Like a Bird | 4000ms (4s) |
| Swim Like a Fish | 3000ms (3s) |

---

## Visual Design

### Progress Bar

- **Location:** Top center of canvas
- **Width:** 80% of canvas width
- **Colors:**
  - Red (#EF4444) when progress < 50%
  - Amber (#F59E0B) when progress 50-80%
  - Green (#10B981) when progress > 80%

### Guide Display

- **Emoji:** Large emoji (scaled to canvas size)
- **Movement Name:** Displayed below emoji
- **Canvas Background:** Gradient from warm orange (#FFE5B4) to peach (#FFDAB9)

### Feedback Text

| Confidence | Feedback |
|------------|----------|
| >80% | "Perfect! You're doing great!" |
| ≥ tolerance | "Good job! Keep it up!" |
| < tolerance | "Try to adjust your [missing parts]" |
| Other | "Almost there! Keep trying!" |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Match starts | playPop() | 'success' |
| Match breaks | None | 'error' |
| Movement complete | playCelebration() | 'celebration' |
| Streak milestone (5) | None | 'celebration' |
| Level complete | playCelebration() | 'celebration' |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| currentPattern | MovementPattern \| null | Current movement to mimic |
| progress | number | Current hold progress (0-1) |
| holdTime | number | Current hold time in milliseconds |
| score | number | Total accumulated score |
| level | number | Current level |
| completedMovements | number | Number of movements completed in level |
| gameActive | boolean | Whether game is active |
| feedback | string | Current feedback message |

---

## Technical Implementation

### Dependencies

```typescript
// Pose detection
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// Game logic
import {
  MOVEMENT_PATTERNS,
  initializeGame,
  checkPoseMatch,
  updateGameState,
  isLevelComplete,
  advanceLevel,
  calculateFinalStats,
} from '../games/followTheLeaderLogic';

// Geometry utilities (shared)
import { calculateAngle } from '../utils/geometry';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';

// Audio & haptics
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
```

### Key Constants

```typescript
// Timing
const LEVEL_DURATION = 45000; // 45 seconds per level
const MOVEMENTS_PER_LEVEL = 4;
const HOLD_THRESHOLD = 2000; // Minimum time to hold pose (ms)

// Scoring
const SCORE_PER_MOVEMENT = 25;
const BONUS_PERFECT_MATCH = 10;
const LEVEL_BONUS = 50;
```

---

## Test Coverage

### Test Suite: `followTheLeaderLogic.test.ts`

**Tests covering:**
- Movement pattern configurations (6 tests)
- Pose matching algorithm (8 tests)
- Confidence scoring (4 tests)
- Hold duration mechanics (3 tests)
- Level progression (3 tests)
- Game state updates (4 tests)
- Edge cases (3 tests)

---

## Progress Tracking

### Integration with progressQueue

```typescript
await progressQueue.add({
  profileId: currentProfile.id,
  gameId: 'follow-the-leader',
  score: finalScore,
  completed: true,
  metadata: {
    movementsCompleted: gameState.completedMovements,
    level: gameState.level,
  },
});
```

---

## Accessibility Features

### Visual Cues
- Large emoji icons for pre-readers
- Color-coded progress bars
- Clear text feedback
- Guide overlay with instructions

### Auditory Cues
- Sound feedback on match
- Celebration sounds on completion

### Physical Guidance
- Step-by-step instructions for each movement
- Specific body part feedback when not matching

---

## Easter Eggs

| Property | Value |
|----------|-------|
| Streak milestone | Every 5 consecutive movements |
| Effect | Shows "🔥 {streak} Streak! 🔥" overlay with celebration haptic |

---

## Comparison with Similar Games

| Feature | FollowTheLeader | SimonSays | YogaAnimals |
|---------|-----------------|-----------|-------------|
| CV Required | Pose only | Pose + Hand (combo) | Pose only |
| Core Mechanic | Mimic movement patterns | Mimic specific actions | Hold animal poses |
| Movements/Poses | 6 animal movements | 6 body actions | 6 animal poses |
| Hold Duration | 2-4 seconds (varies) | 2 seconds | 2 seconds |
| Scoring | Points + accuracy bonus | Points + streak | Points + streak |
| Level System | Yes (4 movements/level) | No | No |
| Age Range | 3-8 | 3-8 | 3-8 |
| Vibe | Active | Active | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
