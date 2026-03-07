# Simon Says Game Specification

**Game ID:** `simon-says`
**World:** Body Zone
**Vibe:** Active
**Age Range:** 3-8 years
**CV Requirements:** Pose detection (primary), Hand tracking (combo mode only)

---

## Overview

Simon Says is a classic body movement game where children mimic poses shown on screen. The game uses pose detection to verify the child is performing the correct action. Combo mode adds finger counting challenges for an extra layer of difficulty.

### Tagline
"Touch your head, wave, arms up — but only if Simon says! 🧠👆"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Mode** - Choose Classic or Combo mode
2. **Start Game** - Player presses "Start Playing!" button
3. **Action Displayed** - Icon + instruction + Kenney character demonstration
4. **Player Mimics** - Child performs the shown action
5. **Pose Detection** - Camera verifies the pose
6. **Hold Steady** - Child must hold pose for 2 seconds
7. **Score Points** - Base points + streak bonus
8. **Next Action** - New action from the 6-action pool
9. **Repeat** - Infinite rounds

### Controls

| Action | Input |
|--------|-------|
| Mimic pose | Full body movement |
| Hold pose | Maintain position for 2 seconds |
| Skip | Press "Skip Pose" button |
| Stop game | Press "Stop Playing" button |

---

## Game Modes

### Classic Mode

| Feature | Value |
|---------|-------|
| CV Required | Pose only |
| Gameplay | Mimic pose → Hold 2s → Score |
| Finger Challenges | No |
| Difficulty | Easier, focus on body awareness |

### Combo Mode

| Feature | Value |
|---------|-------|
| CV Required | Pose + Hand tracking |
| Gameplay | Mimic pose + Show fingers → Hold 2s → Score |
| Finger Challenges | Yes (every action) |
| Finger Target | Random 1-5 |
| Difficulty | Harder, requires body + finger coordination |

---

## Body Actions

### Action List

| # | Name | Icon | Instruction | Landmark ID |
|---|------|------|-------------|-------------|
| 1 | Touch Head | Head outline | "Touch your head with both hands!" | 'head' |
| 2 | Wave | Sun rays | "Wave hello with one hand!" | 'wave' |
| 3 | Arms Up | Up arrows | "Put both arms up in the air!" | 'armsUp' |
| 4 | Hands On Hips | Hips outline | "Put your hands on your hips!" | 'handsOnHips' |
| 5 | T-Rex Arms | Bent arms | "Bend both elbows like T-Rex!" | 'tRex' |
| 6 | Touch Shoulders | Shoulders | "Touch both shoulders with your hands!" | 'shoulders' |

### Pose Detection Algorithms

#### Touch Head
**Condition:** Either wrist is above y=0.3 AND within 0.2 of nose horizontally

```typescript
const nose = landmarks[0];
const leftWrist = landmarks[15];
const rightWrist = landmarks[16];

matchScore = (
  (leftWrist.y < 0.3 && Math.abs(leftWrist.x - nose.x) < 0.2) ||
  (rightWrist.y < 0.3 && Math.abs(rightWrist.x - nose.x) < 0.2)
) ? 100 : 0;
```

#### Arms Up
**Condition:** Both wrists are at least 0.1 above their respective shoulders

```typescript
const leftShoulder = landmarks[11];
const rightShoulder = landmarks[12];
const leftWrist = landmarks[15];
const rightWrist = landmarks[16];

matchScore = (
  leftWrist.y < leftShoulder.y - 0.1 &&
  rightWrist.y < rightShoulder.y - 0.1
) ? 100 : 0;
```

#### Hands On Hips
**Condition:** Both wrists are between y=0.4 and y=0.6

```typescript
const leftWrist = landmarks[15];
const rightWrist = landmarks[16];

matchScore = (
  leftWrist.y > 0.4 && leftWrist.y < 0.6 &&
  rightWrist.y > 0.4 && rightWrist.y < 0.6
) ? 100 : 0;
```

#### Touch Shoulders
**Condition:** Both wrists are within 0.15 of their respective shoulders (x and y)

```typescript
const leftShoulder = landmarks[11];
const rightShoulder = landmarks[12];
const leftWrist = landmarks[15];
const rightWrist = landmarks[16];

matchScore = (
  Math.abs(leftWrist.x - leftShoulder.x) < 0.15 &&
  Math.abs(leftWrist.y - leftShoulder.y) < 0.15 &&
  Math.abs(rightWrist.x - rightShoulder.x) < 0.15 &&
  Math.abs(rightWrist.y - rightShoulder.y) < 0.15
) ? 100 : 0;
```

#### Wave
**Status:** ⚠️ Not implemented (returns match score of 0)

**Recommended Algorithm:**
- Track wrist positions over 10-20 frames
- Detect alternating left-right motion pattern
- Check for periodic wrist movement in x direction

#### T-Rex Arms
**Status:** ⚠️ Not implemented (returns match score of 0)

**Recommended Algorithm:**
- Check elbows are bent (angle < 90 degrees)
- Check wrists are above shoulders but below head level
- Check upper arms are roughly vertical

---

## Scoring System

### Points Calculation

```typescript
basePoints = 15;
streakBonus = min(streak × 3, 15);
totalPoints = basePoints + streakBonus;
```

### Streak Progression

| Streak | Bonus | Total |
|--------|-------|-------|
| 1 | 3 | 18 |
| 2 | 6 | 21 |
| 3 | 9 | 24 |
| 4 | 12 | 27 |
| 5+ | 15 | 30 |

### Total Score

```
totalScore = Σ (all completed action points)
```

---

## Hold Duration

### Hold Mechanics

| Parameter | Value |
|-----------|-------|
| HOLD_DURATION | 2000ms (2 seconds) |
| Frame increment | 50ms |
| Detection rate | ~20 fps |
| Frames needed | ~40 consecutive matches |

### Hold Progress

```
if (poseMatches && fingerMatches) {
  holdTime += 50ms;  // Add per frame
  if (holdTime >= 2000ms) {
    // Success! Complete action
  }
} else {
  holdTime = 0;  // Reset on mismatch
}
```

---

## Visual Design

### Kenney Character Animations

| Action | Animation | Rationale |
|--------|-----------|-----------|
| Arms Up | 'climb' | Arms reaching upward |
| Touch Head | 'duck' | Crouching motion |
| Wave | 'walk' | Arm swinging motion |
| Hands On Hips | 'idle' | Standing pose |
| T-Rex Arms | 'hit' | Bent arm action |
| Touch Shoulders | 'jump' | Arms raised motion |

### Progress Bars

#### Pose Accuracy Bar
- **Color:** Green (#10B981) if >70%, Blue (#3B82F6) if ≤70%
- **Width:** Represents matchProgress (0-100%)
- **Threshold:** 70% required to count as pose match

#### Hold Steady Bar
- **Color:** Amber (#F59E0B)
- **Width:** Represents (holdTime / 2000ms) × 100%
- **Purpose:** Shows progress toward completing the pose

#### Fingers Required Bar (Combo Mode)
- **Color:** Purple (#A855F7)
- **Width:** Represents (detectedFingers / targetFingers) × 100%
- **Target:** Random 1-5 fingers

### Heart HUD

```
┌─────────────────────────────────┐
│ ❤️❤️❤️🖤🖤  x5                 │
└─────────────────────────────────┘
```

- 5 hearts total
- Each heart fills at 2-streak intervals
- Visual: `/assets/kenney/platformer/hud/hud_heart.png`
- Empty: `/assets/kenney/platformer/hud/hud_heart_empty.png`

---

## Accessibility Features

### Visual Cues
- Large action icons (112×112px)
- Kenney character demonstrating each pose
- Color-coded progress bars
- Percentage displays
- Round counter

### Clear Instructions
- Step-by-step "How to Play" guide with icons
- Text instructions for each action
- Mode selection with visual differences

### Skip Button
- Allows skipping difficult poses
- Resets hold time to 0
- Generates new finger target in combo mode
- No penalty for skipping

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Mode select | playPop() | None |
| Game start | playPop() | None |
| Pose complete | playFanfare() | 'success' |
| Milestone (5, 10, 15... streak) | playFanfare() | 'celebration' |
| Skip pose | playPop() | None |
| Stop game | playPop() | None |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| score | number | Total accumulated score |
| streak | number | Current consecutive successes |
| round | number | Current round (starts at 1) |
| gameMode | 'classic' \| 'combo' | Selected game mode |
| currentActionIndex | number | Index into BODY_ACTIONS (0-5) |
| matchProgress | number | Current pose match score (0-100) |
| holdTime | number | Current hold time in milliseconds |
| targetFingers | number \| null | Finger challenge target (combo only) |
| detectedFingers | number | Currently detected fingers (combo only) |
| showCelebration | boolean | Celebration overlay visibility |
| showStreakMilestone | boolean | Streak milestone overlay visibility |

---

## Easter Egg

| Property | Value |
|----------|-------|
| ID | `egg-simon-master` |
| Name | "Simon Master" |
| Trigger | Complete 10 rounds (round >= 10) |
| Effect | Triggers item drop system |
| Possible drops | Creature: Lion (10%), Owl (5% at 85+ score), Tool: Wand (1% at 95+ score) |

---

## End Behavior

### No Hard Ending

SimonSays has no fixed ending:
- Player can complete infinite rounds
- Actions cycle continuously through 6-action array
- Score accumulates continuously

### Stop Behavior

| Action | Effect |
|--------|--------|
| Stop Playing button | Triggers onGameComplete(), Sets isPlaying=false |

---

## Technical Implementation

### Dependencies

```typescript
// Pose detection
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// Hand tracking (combo mode)
import { useGameHandTracking } from '../hooks/useGameHandTracking';

// Finger counting
import { countExtendedFingersFromLandmarks } from '../games/fingerCounting';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';

// Audio
import { useAudio } from '../utils/hooks/useAudio';

// UI
import { motion, AnimatePresence } from 'framer-motion';
import { KenneyCharacter } from '../components/characters/KenneyCharacter';
```

### Key Constants

```typescript
// Timing
const HOLD_DURATION = 2000;  // 2 seconds in milliseconds
const FRAME_INCREMENT = 50;   // Hold time added per frame
const MATCH_THRESHOLD = 70;   // Minimum match score to count

// Scoring
const BASE_POINTS = 15;
const STREAK_BONUS_MULTIPLIER = 3;
const MAX_STREAK_BONUS = 15;

// Finger targets (combo mode)
const MIN_FINGERS = 1;
const MAX_FINGERS = 5;

// Milestone
const STREAK_MILESTONE_INTERVAL = 5;  // Every 5 streaks

// Easter egg
const EASTER_EGG_ROUND = 10;
```

### Pose Landmarks Used

| Index | Body Part | Used For |
|-------|-----------|----------|
| 0 | Nose | Touch Head detection |
| 11 | Left Shoulder | Arms Up, Touch Shoulders |
| 12 | Right Shoulder | Arms Up, Touch Shoulders |
| 15 | Left Wrist | All pose detections |
| 16 | Right Wrist | All pose detections |

---

## Test Coverage

### Test Suite: `simonSaysLogic.test.ts`

**45 tests covering:**
- Scoring calculations (4 tests)
- Hold duration mechanics (4 tests)
- Streak bonuses (3 tests)
- Pose detection thresholds (5 tests)
- Body action detection algorithms (6 tests)
- Round progression (2 tests)
- Easter egg conditions (2 tests)
- Game mode differences (3 tests)
- Edge cases (3 tests)
- Integration scenarios (4 tests)
- Additional scenarios (9 tests)

**All tests passing ✅**

---

## Future Enhancements

### High Priority
- **Implement Wave detection** - Use motion history to detect waving pattern
- **Implement T-Rex detection** - Check elbow angle and wrist position

### Medium Priority
- **Add more actions** - Expand beyond 6 actions
- **Difficulty levels** - Adjust hold time or match threshold
- **Action sequencing** - Multi-action combinations
- **Voice commands** - "Simon says..." audio prompts

### Low Priority
- **Multiplayer mode** - Two players competing
- **Custom action creator** - Design your own poses
- **Photo capture** - Save fun poses

---

## Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| Wave not detected | Medium | Finger challenge still works in combo mode |
| T-Rex not detected | Medium | Finger challenge still works in combo mode |

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

| Feature | SimonSays | FreezeDance | YogaAnimals |
|---------|-----------|-------------|-------------|
| CV Required | Pose + Hand (combo) | Pose + Hand (combo) | Pose |
| Core Mechanic | Mimic specific poses | Hold still | Mimic yoga poses |
| Scoring | Points + streak | Stability % | Accuracy % |
| Game Modes | 2 | 2 | 1 |
| Actions | 6 specific actions | Dance/freeze | Yoga poses |
| Hold Duration | 2 seconds | 3.5 seconds | Varies |
| Age Range | 3-8 | 3-8 | 4-8 |
| Character demo | Kenney animated | Skeleton overlay | Static pose reference |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
**Known Issues:** Wave and T-Rex pose detection not implemented
