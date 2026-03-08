# Connect The Dots Game Specification

**Game ID:** `connect-the-dots`
**World:** Arcade
**Vibe:** Chill
**Age Range:** 4-8 years
**CV Requirements:** Hand tracking (pinch detection) - optional, mouse/touch also supported

---

## Overview

Connect The Dots is an educational puzzle game where children connect numbered dots in sequential order (1, 2, 3, etc.) to reveal a picture. The game teaches number sequencing and fine motor skills through hand-tracking or mouse/touch interaction.

### Tagline
"Connect the dots in order! 1, 2, 3... 🔢✋"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Difficulty** - Choose Easy, Medium, or Hard
2. **Start Game** - Press "Start Game" button
3. **Dots Appear** - Numbered dots displayed randomly on canvas
4. **Connect Dot 1** - Move to first dot and click/pinch
5. **Continue Sequence** - Connect to 2, then 3, etc.
6. **Draw Lines** - Lines connect between dots as you progress
7. **Score Points** - Base points + streak bonus for each dot
8. **Level Complete** - After connecting all dots
9. **Next Level** - Advances with more dots (up to level 5)
10. **Game Complete** - After finishing all 5 levels

### Controls

| Action | Hand Mode | Mouse Mode |
|--------|-----------|------------|
| Move cursor | Move hand (index finger tip tracked) | Move mouse |
| Connect dot | Pinch when cursor is over target | Click dot |
| Toggle mode | Click "Hand Mode/Mouse Mode" button | Same |
| Restart | Click "Reset" button | Click "Reset" button |
| Home | Click "Home" button | Click "Home" button |

---

## Difficulty Levels

### Difficulty Configuration

```typescript
interface DifficultyConfig {
  minDots: number;      // Minimum dots at level 1
  maxDots: number;      // Maximum dots at high levels
  timeLimit: number;    // Seconds per level
  radius: number;       // Hit radius in pixels
}
```

### Three Difficulties

| Difficulty | Min Dots | Max Dots | Time Limit | Hit Radius |
|------------|----------|----------|------------|------------|
| Easy | 5 | 8 | 90s | 35px |
| Medium | 7 | 12 | 75s | 30px |
| Hard | 10 | 15 | 60s | 25px |

### Level Progression

```typescript
baseDots = minDots + Math.floor((level - 1) * 1.5);
numDots = Math.min(baseDots, maxDots);
```

### Dot Count by Level and Difficulty

| Level | Easy | Medium | Hard |
|-------|------|--------|------|
| 1 | 5 | 7 | 10 |
| 2 | 6 | 8 | 11 |
| 3 | 7 | 9 | 12 |
| 4 | 8 | 11 | 13 |
| 5 | 8 | 12 | 15 |

---

## Game Elements

### Dot Interface

```typescript
interface Dot {
  id: number;           // Sequential ID (0-based)
  x: number;            // Canvas X coordinate
  y: number;            // Canvas Y coordinate
  connected: boolean;   // Whether connected
  number: number;       // Display number (1-based: 1, 2, 3...)
}
```

### Dot Positioning

- **Canvas Size:** 800 × 600 pixels
- **Generation Area:** 100-700 (X), 100-500 (Y) - padded from edges
- **Min Distance:** 80px between any two dots
- **Algorithm:** Rejection sampling (max 50 attempts per dot)

### Hit Detection

```typescript
distance = Math.hypot(cursorX - dotX, cursorY - dotY);
hit = distance <= difficultyRadius;
```

### Sequential Connection

- Must connect dots in order: 1, 2, 3, etc.
- Clicking wrong dot does nothing
- Current dot highlighted larger (20px vs 15px radius)

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10; // per connected dot
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
timeBonus = timeLeft × 10; // on level completion
totalScore = sum of all (basePoints + streakBonus) + timeBonus;
```

### Score Examples

| Streak | Base | Bonus | Total per Dot |
|--------|------|-------|---------------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

### Level Completion Bonus

- **Formula:** timeLeft × 10
- **Maximum:** 90 × 10 = 900 points (Easy level 1 with 0 dots connected)

---

## Streak System

### Visual Display

- Kenney Heart HUD in bottom-left corner
- Shows up to 5 hearts (each represents 2 streak)
- Heart count: `Math.floor(streak / 2)`
- Streak multiplier display: "x{streak}"

### Streak Milestone

- Every 2 consecutive correct connections
- Shows "🔥 {streak} Streak! 🔥" overlay
- Triggered via `useStreakTracking` hook

### Streak Reset

- The game doesn't explicitly reset streak
- Wrong clicks are ignored (no penalty)

---

## Game Flow

### Game States

| State | Description |
|-------|-------------|
| `menu` | Show difficulty selection, start button |
| `playing` | Active gameplay |
| `levelComplete` | Celebration overlay (2.5s) |
| `gameComplete` | All 5 levels finished |

### Timer

- **Decrements:** Every 1 second
- **Format:** Displays "Time {timeLeft}s"
- **Game Over:** Time reaches 0 (but game doesn't enforce)

---

## Visual Design

### Canvas

- **Size:** 800 × 600 pixels
- **Background:** Semi-transparent white with weather background (windy)
- **Border:** None (full container)

### Dot Appearance

| State | Fill | Radius | Stroke |
|-------|------|--------|--------|
| Current (target) | Blue (#3B82F6) | 20px | Black 2px |
| Pending | Blue (#3B82F6) | 15px | Black 2px |
| Connected | Emerald (#10B981) | 15px | Black 2px |

### Connecting Lines

- **Color:** Slate-300 (#CBD5E1)
- **Width:** 3px
- **Drawn between:** Connected adjacent dots (n to n+1)

### Game Colors

```typescript
const GAME_COLORS = {
  path: '#CBD5E1',        // slate-300
  dotConnected: '#10B981', // emerald-500
  dotPending: '#3B82F6',   // blue-500
  dotStroke: '#000000',    // black
  dotLabel: '#FFFFFF',     // white
  cursorIdle: '#F59E0B',   // amber-500
  cursorPinch: '#E85D04',  // pip-orange
} as const;
```

### UI Elements

- **Next Dot Indicator:** Top-left, shows "#N"
- **Relaxed Message:** Top-center, "Take your time!"
- **Score Popup:** Center screen, animated +points
- **Streak Milestone:** Top-third, animated fire overlay

### Cursor

- **Component:** GameCursor
- **Size:** 84 pixels
- **Color:** Amber (#F59E0B)
- **Coordinate Space:** Normalized (0-1)

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playPop() | None |
| Dot connected | playPop() | 'success' |
| Level complete | playCelebration() | 'celebration' |
| All complete | playCelebration() | 'celebration' |
| Streak milestone | None | Via hook |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Connect the dots in order! Pinch each number!" |
| Every 3 dots connected | "{N} dots connected! Keep going!" |
| Last dot connected | "Great job! You connected all the dots!" |
| Menu instructions | "Connect the dots in order. Start with number one. Pinch each dot to connect it. Complete the picture!" |

---

## Progress Tracking

### Integration with useGameDrops

```typescript
await onGameComplete(finalScore);
triggerEasterEgg('egg-star-connector');
```

### Easter Egg

- **ID:** `egg-star-connector`
- **Trigger:** Complete all 5 levels
- **Effect:** Triggers item drop system

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| gameCompleted | boolean | Whether all levels finished |
| score | number | Total accumulated score |
| streak | number | Current consecutive connections |
| level | number | Current level (1-5) |
| timeLeft | number | Remaining seconds |
| dots | Dot[] | All dots on canvas |
| currentDotIndex | number | Index of next dot to connect |
| difficulty | 'easy' \| 'medium' \| 'hard' | Selected difficulty |
| isHandTrackingEnabled | boolean | Hand tracking toggle |

---

## Technical Implementation

### Dependencies

```typescript
// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';
import { useStreakTracking } from '../hooks/useStreakTracking';

// Audio & TTS
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// UI components
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import { GameCursor } from '../components/game/GameCursor';
import { Mascot } from '../components/Mascot';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
```

### Key Constants

```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DOT_GENERATION_PADDING = 100; // from edges
const MIN_DOT_DISTANCE = 80; // between dots
const MAX_PLACEMENT_ATTEMPTS = 50; // per dot
const CELEBRATION_DURATION = 2500; // ms
```

---

## Accessibility Features

### Visual Cues
- Large numbered dots (15-20px radius)
- Current dot highlighted larger
- Clear "Next Dot" indicator
- Number labels on all dots
- Visual lines showing progress

### Audio Cues
- TTS voice instructions
- Sound effects for connections
- Voice feedback every 3 dots

### Motor Assistance
- Variable hit radius by difficulty (25-35px)
- No penalty for wrong clicks
- Relaxed timer (60-90s)
- "Take your time!" message
- Can play with mouse or hand tracking

---

## Test Coverage

### Test Suite: `connectTheDotsLogic.test.ts`

**Tests covering:**
- Difficulty configurations (3 tests)
- Dot count calculation (5 tests)
- Dot generation (5 tests)
- Hit detection (6 tests)
- Scoring calculations (4 tests)
- Level progression (3 tests)
- Game state (4 tests)
- Edge cases (4 tests)

---

## Comparison with Similar Games

| Feature | ConnectTheDots | NumberTapTrail | MazeRunner |
|---------|---------------|----------------|------------|
| CV Required | Hand (pinch) - optional | Hand (pinch) | None |
| Core Mechanic | Connect sequential dots | Pinch numbers in order | Navigate maze |
| Educational Focus | Number sequencing | Number recognition | Path planning |
| Progression | 5 levels × 3 difficulty | 6 fixed levels | 3 fixed levels |
| Interaction | Canvas drawing | Direct pinch | Keyboard/touch |
| Visual Output | Lines form picture | Numbers disappear | Character moves |
| Time Limit | 60-90s per level | 90s total | None |
| Streak System | Yes | Yes | Yes |
| Age Range | 4-8 | 3-6 | 5-10 |
| Vibe | Chill | Chill | Chill |

---

## Educational Value

### Skills Developed

1. **Number Recognition**
   - Numbers 1-15 (depending on level)
   - Sequential understanding
   - Visual identification

2. **Sequencing**
   - Order: 1, 2, 3...
   - Following patterns
   - Forward thinking

3. **Fine Motor Skills**
   - Pointing accuracy
   - Pinch gesture or click
   - Hand-eye coordination

4. **Patience**
   - Taking time to connect
   - No pressure for speed
   - Completing the full picture

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
