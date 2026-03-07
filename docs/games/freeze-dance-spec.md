# Freeze Dance Game Specification

**Game ID:** `freeze-dance`
**World:** Body Zone
**Vibe:** Active
**Age Range:** 3-8 years
**CV Requirements:** Pose detection (primary), Hand tracking (combo mode only)

---

## Overview

Freeze Dance is an active movement game where children dance freely when music plays, then freeze in place when the music stops. The game uses pose detection to measure how still the child holds during freeze phases. Combo mode adds finger counting challenges for an extra layer of difficulty.

### Tagline
"Dance when the music plays, FREEZE when it stops! 💃❄️"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Mode** - Choose Classic or Combo mode
2. **Start Game** - Player presses "Start Dancing!" button
3. **Dance Phase** (10-13 seconds) - Child dances and moves freely
4. **Freeze Phase** (3.5 seconds) - Child must hold perfectly still
5. **Finger Challenge** (6 seconds, combo only) - Show specific number of fingers
6. **Scoring** - Stability score (0-100) added to total
7. **Repeat** - New round begins
8. **End Game** - Player stops anytime via "End Game" button

### Controls

| Action | Input |
|--------|-------|
| Dance | Full body movement |
| Freeze | Hold body completely still |
| Finger challenge | Show specific number of fingers (0-5) |
| Pause | End Game button |

---

## Game Modes

### Classic Mode

| Feature | Value |
|---------|-------|
| CV Required | Pose only |
| Gameplay | Dance → Freeze → Score |
| Finger Challenges | No |
| Difficulty | Easier, focus on body control |

### Combo Mode

| Feature | Value |
|---------|-------|
| CV Required | Pose + Hand tracking |
| Gameplay | Dance → Freeze → Finger Challenge → Score |
| Finger Challenges | Yes (rounds 3+) |
| Difficulty | Harder, requires body control + counting |

---

## Three-Phase System

### Phase 1: Dancing (10-13 seconds)

**Visual Indicators:**
- Skeleton color: Green (#10B981)
- Phase icon: Music note
- Message: "DANCE!"
- Voice: "Dance dance dance!"

**Behavior:**
- Pose tracking active
- Movement encouraged
- Stability not tracked
- Child can move freely

### Phase 2: Freezing (3.5 seconds)

**Visual Indicators:**
- Skeleton color: Red (#EF4444)
- Phase icon: Snowflake
- Message: "FREEZE!"
- Voice: "Freeze!" or "Freeze! Show me X fingers!"
- Stability bar displayed (100% → decreases with movement)

**Behavior:**
- Pose tracking active
- Movement measured against previous frame
- Stability score calculated
- Stability displayed as percentage

**Stability Formula:**
```typescript
keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
totalMovement = Σ distance(current[keyPoint], previous[keyPoint]);
stabilityScore = max(0, 100 - totalMovement × 500);
```

### Phase 3: Finger Challenge (6 seconds, Combo Mode only)

**Visual Indicators:**
- Skeleton: Red (from freeze phase)
- Hand overlay: Purple
- Phase icon: Hand
- Message: "SHOW X!"
- Voice: "Freeze! Show me X fingers!"

**Trigger Conditions (all must be true):**
- Game mode: 'combo'
- Round number: > 2
- Freeze stability: > 60%

**Behavior:**
- Hand tracking activates
- Target fingers: Random 0-5
- Child must show exact number
- Visual feedback on match

---

## Scoring System

### Stability Score

| Stability | Points | Grade |
|-----------|--------|-------|
| 81-100% | 81-100 | Perfect freeze |
| 51-80% | 51-80 | Good freeze |
| 0-50% | 0-50 | Needs practice |

### Total Score

```
totalScore = Σ (all round stability scores)
```

### Streak System

| Streak | Effect |
|--------|--------|
| 1+ | Streak counter displayed |
| 5, 10, 15... | Milestone celebration overlay |
| Failure | Streak resets to 0 |

---

## Pose Detection

### Pose Landmarks

| Index | Body Part | Purpose |
|-------|-----------|---------|
| 11, 12 | Shoulders | Upper body stability |
| 13, 14 | Elbows | Arm movement |
| 15, 16 | Wrists | Arm extension |
| 23, 24 | Hips | Core stability |
| 25, 26 | Knees | Lower body stability |
| 27, 28 | Ankles | Leg movement |

### Skeleton Connections

```
Shoulders (11) ───────────── (12)
    │                            │
Elbows (13) ────────── Wrists (15, 16)
    │
Hips (23, 24)
    │     │
Knees (25, 26)
    │     │
Ankles (27, 28)
```

### Skeleton Colors

| Phase | Color | Hex |
|-------|-------|-----|
| Dancing | Emerald green | #10B981 |
| Freezing | Red | #EF4444 |

---

## Finger Counting

### Algorithm Overview

The `countExtendedFingersFromLandmarks()` function counts extended fingers from MediaPipe hand landmarks (0-5).

### Four Fingers (Index, Middle, Ring, Pinky)

Each finger is extended if either condition is true:

1. **Upright check:** `tip.y < pip.y` (tip above PIP joint)
2. **Distance check:** `distance(tip, wrist) > distance(pip, wrist) + 0.07`

### Thumb Detection

Thumb uses multiple heuristics (2 out of 3 must pass):

1. **Extended from palm:** `distance(tip, palmCenter) > distance(mcp, palmCenter) × 0.8`
2. **Spread:** `distance(tip, indexMcp) > 0.15`
3. **Not tucked:** `distance(tip, indexTip) > 0.08`

**Quick fold check:** If `distance(tip, ip) < 0.03`, thumb is folded immediately.

### Finger Challenge Display

| Condition | Visual |
|-----------|--------|
| Wrong count | Amber (#F59E0B) bar |
| Correct count | Emerald (#10B981) bar + "✓ Perfect! Hold it!" |
| No hand detected | 0 / X displayed |

---

## Visual Design

### Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Background | Discovery cream | Custom |
| Dancing phase | Blue | #3B82F6 |
| Freeze phase | Red | #EF4444 |
| Finger challenge | Purple | Default |
| Success | Emerald | #10B981 |
| Warning | Amber | #F59E0B |
| Border | Gold | #F2CC8F |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Phase indicator | 5xl | Black |
| Round number | Base | Bold, uppercase |
| Score | xl | Black |
| Stability % | Base | Bold |

### Layout

```
┌─────────────────────────────────────────────────────┐
│ ← Back    Freeze Dance    SCORE: 150   Take time!   │
├─────────────────────────────────────────────────────┤
│                                                     │
│                     🎵 DANCE!                       │
│                   Round 5                           │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │                                           │     │
│  │          [Skeleton Display]               │     │
│  │       (green when dancing)                │     │
│  │       (red when frozen)                   │     │
│  │                                           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  ┌───────────────────────────────────────────┐     │
│  │ Hold still!                        85%     │     │
│  │ ████████████████████░░░░                 │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│              🔥 5 Streak                           │
│                                                     │
│                    [End Game]                      │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility Features

### Voice Instructions (TTS)

| Event | Voice Prompt |
|-------|--------------|
| Game start | "Let's play Freeze Dance! Dance when I say dance, and freeze when I say freeze!" |
| Dance phase | "Dance dance dance!" |
| Freeze command | "Freeze!" |
| Finger challenge | "Freeze! Show me X fingers!" |
| Great freeze | "Great freeze! You held so still!" |
| Perfect + fingers | "Amazing! You froze perfectly and showed the right fingers!" |
| Good try | "Good try! Hold even stiller next time!" |
| Moved too much | "You moved! Try to hold super still next time!" |

### Haptic Feedback

| Event | Pattern |
|-------|---------|
| Round success | 'success' |
| Streak milestone | 'celebration' |
| Movement failure | 'error' |
| Finger match | 'success' |

### Visual Accessibility
- Large phase text (5xl font)
- High contrast skeleton colors
- Color-coded stability bar
- Animated celebrations
- "Take your time!" relaxed messaging
- Clear mode selection buttons

---

## Audio & Sound Effects

| Event | Sound |
|-------|-------|
| Mode select | playPop() |
| Game start | playPop() |
| Round success | playCelebration() |
| Finger match | playSuccess() |
| End game | playPop() |

---

## Timing Configuration

### Toddler-Friendly Adjustments (2026-02-23)

| Phase | Original | Current | Change |
|-------|----------|---------|--------|
| Dance | 8-12s | 10-13s | +25% longer |
| Freeze | 3s | 3.5s | +17% longer |
| Finger challenge | 5s | 6s | +20% longer |

**Code:**
```typescript
const danceDuration = 10000 + Math.random() * 3000; // 10-13s
const freezeDuration = 3500; // 3.5s
const fingerChallengeDuration = 6000; // 6s
```

---

## Easter Egg

| Property | Value |
|----------|-------|
| ID | `egg-ice-sculpture` |
| Name | "Ice Sculpture" |
| Trigger | 5 consecutive perfect freezes (stability > 80) |
| Drop | Triggers item drop system |
| Voice | "Amazing! You froze perfectly and showed the right fingers!" |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| score | number | Total accumulated score |
| round | number | Current round (starts at 1) |
| gamePhase | 'dancing' \| 'freezing' \| 'fingerChallenge' | Current phase |
| gameMode | 'classic' \| 'combo' | Selected game mode |
| isFrozen | boolean | Whether currently in freeze phase |
| stabilityScore | number | Current stillness (0-100) |
| targetFingers | number | Finger challenge target (0-5) |
| detectedFingers | number | Currently detected fingers |
| fingerChallengeComplete | boolean | Whether challenge was passed |
| perfectFreezeStreak | number | Consecutive >80 rounds |
| streak | number | Current streak count (from hook) |

---

## Technical Implementation

### Dependencies

```typescript
// Pose detection
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';

// Finger counting
import { countExtendedFingersFromLandmarks } from '../games/fingerCounting';

// Game hooks
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';

// Audio & Voice
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// UI
import { motion, AnimatePresence } from 'framer-motion';
```

### Key Constants

```typescript
// Pose key points for stability tracking
const KEY_POINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

// Timing
const DANCE_DURATION_MIN = 10000; // 10 seconds
const DANCE_DURATION_MAX = 13000; // 13 seconds
const FREEZE_DURATION = 3500;     // 3.5 seconds
const FINGER_CHALLENGE_DURATION = 6000; // 6 seconds

// Thresholds
const FINGER_CHALLENGE_STABILITY_THRESHOLD = 60; // Need >60% to trigger
const FINGER_CHALLENGE_ROUND_THRESHOLD = 2;     // Need round > 2
const PERFECT_FREEZE_THRESHOLD = 80;            // Need >80% for perfect streak
const PERFECT_STREAK_EGG_THRESHOLD = 5;         // 5 perfect freezes for easter egg
```

---

## End Behavior

### No Hard Ending

FreezeDance has no fixed ending:
- Player can complete infinite rounds
- Score accumulates continuously
- Player controls when to stop

### Stop Behavior

| Action | Effect |
|--------|--------|
| End Game button | Triggers onGameComplete(), Sets isPlaying=false |

---

## Ticket References

| Ticket | Description | Status |
|--------|-------------|--------|
| GQ-002 | Game subscription hooks | ✅ Implemented |
| GQ-003 | Game progress tracking | ✅ Implemented |
| GQ-004 | Quality/UX standards | ✅ Implemented |
| GQ-005 | Accessibility features | ✅ Implemented |
| GQ-007 | Engagement features | ✅ Implemented (streak system) |
| TCK-20260223-005 | Toddler-friendly enhancements | ✅ Implemented |

---

## Test Coverage

### Test Suite: `freezeDanceLogic.test.ts`

**39 tests covering:**
- Stability scoring algorithm (5 tests)
- Phase timing configuration (4 tests)
- Finger challenge triggering (6 tests)
- Perfect freeze detection (3 tests)
- Easter egg conditions (3 tests)
- Round completion logic (4 tests)
- Streak milestones (2 tests)
- Game mode differences (3 tests)
- Edge cases (7 tests)
- Integration scenarios (3 tests)

**All tests passing ✅**

---

## Future Enhancements

### Potential Additions
- **Adaptive difficulty** - Adjust thresholds based on performance
- **Multiplayer mode** - Multiple children freezing together
- **Statue challenge** - Hold specific silly poses
- **Visual countdown** - 3-2-1 before freeze
- **Animated character** - On-screen dancer to follow
- **Music selection** - Choose different songs
- **Photo capture** - Take picture during freeze pose
- **Dance move suggestions** - Show moves to try during dance phase

---

## Differences from Similar Games

| Feature | FreezeDance | MusicalStatues | YogaAnimals |
|---------|-------------|----------------|-------------|
| CV Required | Pose + Hand (combo) | Pose | Pose |
| Core Mechanic | Hold still + fingers | Hold still | Mimic poses |
| Scoring | Stability % | Pass/fail | Accuracy % |
| Game Modes | 2 | 1 | 1 |
| Finger Challenges | Yes (combo) | No | No |
| Age Range | 3-8 | 4-8 | 4-8 |
| Vibe | Active party game | Classic game | Calm learning |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
**Enhanced:** 2026-02-23 (toddler-friendly timing)
