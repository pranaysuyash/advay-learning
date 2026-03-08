# Number Tap Trail Game Specification

**Game ID:** `number-tap-trail`
**World:** Arcade
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** Hand tracking (pinch detection)

---

## Overview

Number Tap Trail is an educational game where children find and pinch numbers in sequential order (1, 2, 3, etc.). The game teaches number recognition and sequencing through hand-tracking interaction.

### Tagline
"Find and pinch the numbers in order! 1, 2, 3... 🔢✋"

---

## Game Mechanics

### Core Gameplay Loop

1. **Start Game** - Press "Start Number Trail" button
2. **Numbers Appear** - Numbers 1 to N displayed randomly on screen
3. **Find Number 1** - Child moves hand to position cursor
4. **Pinch to Select** - Child pinches when cursor is over target number
5. **Continue Sequence** - Find and pinch 2, then 3, etc.
6. **Score Points** - Base points + streak bonus for each correct pinch
7. **Level Complete** - After clearing all numbers in sequence
8. **Next Level** - Advances with more numbers (up to level 6)
9. **Game Complete** - After finishing all 6 levels

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Move hand (index finger tip tracked) |
| Select number | Pinch when cursor is over target |
| Restart | Click "Restart" button |
| Home | Click "Home" button |

---

## Levels

### Level Configuration

```typescript
interface LevelConfig {
  level: number;
  targetCount: number; // 4 + level
}
```

### Six Levels

| Level | Target Count | Numbers | Description |
|-------|--------------|---------|-------------|
| 1 | 5 | 1-5 | Introduction |
| 2 | 6 | 1-6 | Building basics |
| 3 | 7 | 1-7 | Growing challenge |
| 4 | 8 | 1-8 | Medium difficulty |
| 5 | 9 | 1-9 | Advanced |
| 6 | 10 | 1-10 | Maximum challenge |

### Target Count Formula

```typescript
targetCount = Math.min(4 + level, 10);
```

---

## Game Elements

### TrailTarget Interface

```typescript
interface TrailTarget {
  id: number;           // Sequential ID (0-based)
  value: number;        // Display value (1-based: 1, 2, 3...)
  position: Point;      // Normalized coordinates (0-1)
  cleared: boolean;     // Whether pinched
}
```

### Target Positioning

- Uses `pickSpacedPoints()` utility
- **Padding:** 0.2 (from edges)
- **Spacing:** 0.14 (minimum distance between targets)
- **Distribution:** Random but evenly spaced

### Hit Detection

- **Hit Radius:** 0.1 (10% of screen dimension)
- Uses `findHitTarget()` from `hitTarget.ts`
- Uses `isPointInCircle()` from `targetPracticeLogic.ts`

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10; // per correct number
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
timeBonus = timeLeft × 2; // Remaining seconds × 2
levelBonus = 35; // on level completion
totalScore = sum of all basePoints + streakBonus + levelBonus + timeBonus
```

### Score Examples

| Streak | Base | Bonus | Total per Number |
|--------|------|-------|------------------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

### Level Completion Bonus

- **Base level bonus:** 35 points
- **Time bonus:** timeLeft × 2 (up to ~180 points with 90s timer)

---

## Streak System

### Visual Display

- Streak badge in top-right corner
- Fire emoji with count
- Shows "Take your time!" when streak is 0

### Streak Milestone

- Every 5 consecutive correct pinches
- Shows "🔥 {streak} Streak! 🔥" overlay
- Plays celebration haptic
- Displays for 3 seconds (STREAK_MILESTONE_DURATION_MS)

### Streak Reset

- Resets to 0 when wrong number is pinched
- Visual feedback via error sound and haptic

---

## Game Flow

### Game States

| State | Description |
|-------|-------------|
| `menu` | Show start screen |
| `playing` | Active gameplay |
| `levelComplete` | Between levels (1.8s celebration) |
| `gameComplete` | All 6 levels finished |

### Timer

- **Initial time:** 90 seconds
- **Decrements:** Every 1 second
- **Game over:** At 0 seconds (not currently enforced)

---

## Interaction Rules

### Correct Pinch

1. Cursor is over target number
2. Pinch detected
3. Target matches expected number in sequence
4. **Result:** Target cleared, streak increases, score awarded

### Incorrect Pinch

1. Cursor is over target number
2. Pinch detected
3. Target is NOT the expected number
4. **Result:** Error feedback, streak reset to 0

### Missed Pinch

1. Pinch detected
2. No target in hit radius
3. **Result:** "Move closer to the number and pinch again"

---

## Visual Design

### Target Display

- **Size:** 5.5rem × 5.5rem (88px × 88px)
- **Shape:** Circle
- **Border:** 6px
- **Font:** 3xl (text-3xl)
- **Shadow:** 4px shadow with E5B86E

### Target States

| State | Border | Background | Text | Scale |
|-------|--------|------------|------|-------|
| Active | Blue (#3B82F6) | White | Blue | 100% |
| Cleared | Emerald-200 | Emerald-100 | Emerald-500 | 110% |
| Hover | Blue | White | Blue | 105% |

### Feedback Bar

- **Position:** Top center
- **Background:** White/95 with backdrop blur
- **Border:** 3px border (F2CC8F)
- **Shadow:** 4px shadow
- **Min width:** 300px

### Next Number Indicator

- **Position:** Top left
- **Shows:** "Next: [number in circle]"
- **Circle:** Emerald-100 background, green text

### Cursor

- **Component:** CursorEmbodiment
- **Size:** 84 pixels
- **Icon:** Point (finger)
- **Color:** Blue

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playPop() | None |
| Correct pinch | playPop() | 'success' |
| Wrong pinch | playError() | 'error' |
| Missed target | playError() | None |
| Level complete | playFanfare() | None |
| Streak milestone | None | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Pinch the numbers in order from one to ten!" |
| Level start | "Find the numbers in order. Start with one!" |
| Correct pinch | "Great! Now find [next number]!" |
| Wrong pinch | "That is [wrong number]. Look for [correct number]!" |
| Level complete | "Level complete! Great counting!" |
| All complete | "Amazing! You completed all levels!" |

---

## Progress Tracking

### Integration with useGameDrops

```typescript
await onGameComplete(finalScore);
triggerEasterEgg('egg-golden-number');
```

### Easter Egg

- **ID:** `egg-golden-number`
- **Trigger:** Complete all 6 levels
- **Effect:** Triggers item drop system

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| gameCompleted | boolean | Whether all levels finished |
| score | number | Total accumulated score |
| level | number | Current level (1-6) |
| timeLeft | number | Remaining seconds (starts at 90) |
| targets | TrailTarget[] | Numbers on screen |
| expectedIndex | number | Index of next target to pinch |
| cursor | Point \| null | Current finger tip position |
| feedback | string | Current feedback message |
| streak | number | Current consecutive correct pinches |

---

## Technical Implementation

### Dependencies

```typescript
// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Hit detection
import { findHitTarget } from '../games/hitTarget';
import type { CircularTarget } from '../games/hitTarget';

// Target positioning
import { pickSpacedPoints } from '../games/targetPracticeLogic';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';

// Audio & TTS
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// UI components
import { GameContainer } from '../components/GameContainer';
import { CursorEmbodiment } from '../components/game/CursorEmbodiment';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
```

### Key Constants

```typescript
const HIT_RADIUS = 0.1; // Hit radius (normalized)
const MAX_LEVEL = 6; // Maximum level
const TIME_LIMIT = 90; // Starting time in seconds
const STREAK_MILESTONE_INTERVAL = 5; // Streak milestone frequency
```

---

## Accessibility Features

### Visual Cues
- Large number targets (88px circles)
- Clear "Next: X" indicator
- Visual streak display
- Color-coded feedback (blue for active, green for cleared)

### Audio Cues
- Sound effects for correct/wrong pinches
- TTS voice announcements
- Voice instructions available

### Motor Assistance
- Large hit radius (10% of screen)
- Visual guidance with "Next" indicator
- No time pressure (timer doesn't end game)
- Can restart anytime

---

## Test Coverage

### Test Suite: `numberTapTrailLogic.test.ts`

**Tests covering:**
- Target creation (3 tests)
- Level progression (3 tests)
- Hit detection (3 tests)
- Scoring calculations (4 tests)
- Streak system (3 tests)
- Expected index tracking (2 tests)
- Edge cases (3 tests)

---

## Comparison with Similar Games

| Feature | NumberTapTrail | LetterCatcher | ShapePop |
|---------|----------------|---------------|----------|
| CV Required | Hand (pinch) | None (mouse) | Hand (pinch) |
| Core Mechanic | Pinch in sequence | Move to catch | Pinch in ring |
| Educational Focus | Number sequencing | Letter recognition | Shape/number |
| Progression | 6 levels (5-10 nums) | 3 levels | 3 difficulty |
| Targets | Numbers 1-10 | Letters A-Z | 3 collectibles |
| Time Limit | 90s (not enforced) | None | None |
| Streak System | Yes | Yes | Yes |
| Age Range | 3-6 | 3-6 | 3-8 |
| Vibe | Chill | Active | Active |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
