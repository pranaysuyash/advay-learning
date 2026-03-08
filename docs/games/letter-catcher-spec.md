# Letter Catcher Game Specification

**Game ID:** `letter-catcher`
**World:** Arcade
**Vibe:** Active
**Age Range:** 3-6 years
**CV Requirements:** None (uses mouse/touch input)

---

## Overview

Letter Catcher is an educational arcade game where children catch falling letters by moving a bucket with their mouse or finger. The game teaches letter recognition through active gameplay - catching specific target letters while avoiding others.

### Tagline
"Catch the falling letters in your bucket! 🪣🔤"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Level** - Choose Level 1, 2, or 3
2. **See Target** - Game shows target letter to catch
3. **Start Game** - Press "Start!" button
4. **Letters Fall** - Letters spawn from top and fall down
5. **Move Bucket** - Child moves mouse/finger to position bucket
6. **Catch Letters** - Bucket catches letters it touches
7. **Score Points** - +10 for target letter, -10 for wrong letter
8. **Build Streak** - Consecutive correct catches increase streak
9. **Game Complete** - After catching 5 target letters

### Controls

| Action | Input |
|--------|-------|
| Move bucket | Move mouse/finger over game area |
| Catch letters | Bucket position (automatic on contact) |
| Select level | Click level button before game |
| Start game | Click "Start!" button |
| Play again | Click "Play Again" button |
| Finish | Click "Finish" button |
| Return home | Click home icon |

---

## Levels

### Level Configuration

```typescript
interface LevelConfig {
  level: number;
  speed: number;      // Fall speed (pixels per 50ms tick)
  spawnRate: number;  // Milliseconds between spawns
}
```

### Three Levels

| Level | Speed | Spawn Rate | Description |
|-------|-------|------------|-------------|
| 1 | 1 px/tick | 2000ms (2s) | Slowest, easiest |
| 2 | 1.5 px/tick | 1500ms (1.5s) | Medium speed |
| 3 | 2 px/tick | 1200ms (1.2s) | Fastest, most challenging |

---

## Letters

### Letter Set

All 26 uppercase letters (A-Z) randomly selected:
```
ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

### Spawn Position

- **X position:** Random 20-320 pixels (within game width)
- **Y position:** Starts at 0 (top of game area)

### Fall Speed

Determined by current level (1, 1.5, or 2 pixels per 50ms tick)

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10; // per correct catch
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
penalty = -10; // for wrong letter
totalPoints = basePoints + streakBonus; OR score + penalty
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

### Penalties

- Catching wrong letter: -10 points (score can't go below 0)
- Resets streak to 0

---

## Streak System

### Visual Display

- Streak badge in top-right corner
- Orange background with fire emoji
- Shows current streak count

### Streak Milestone

- Every 5 consecutive correct catches
- Shows "🔥 {streak} STREAK! 🔥" overlay
- Plays celebration haptic

### Streak Progression

| Streak | Badge | Bonus |
|--------|-------|-------|
| 1-4 | Show number | 2-8 points |
| 5 | Milestone + haptic | 10 points |
| 8+ | Capped at 15 bonus | 15 points |

---

## Catch Detection

### Algorithm

```typescript
// Check if letter is in catch position
function checkCatch(letter: FallingLetter, bucketX: number): boolean {
  return letter.y > 250 && Math.abs(letter.x - bucketX) < 50;
}
```

### Catch Conditions

- **Y position:** Must be > 250 pixels (near bottom)
- **X position:** Within 50 pixels of bucket center
- Bucket X constrained to 20-330 pixels

### Game Area

- **Width:** 320 pixels
- **Height:** 256 pixels
- **Bucket range:** 20-330 pixels (with margin)

---

## Game Flow

### Game States

| State | Description |
|-------|-------------|
| `start` | Show start screen with target letter |
| `playing` | Active gameplay - letters falling |
| `complete` | Game complete - show results |

### Level Completion

- Trigger: `caught >= 5`
- On complete:
  - Game state changes to `complete`
  - Final score displayed
  - Best streak shown
  - "Play Again" and "Finish" buttons appear

---

## Visual Design

### Game Area

- **Size:** 320×256 pixels
- **Background:** Light slate (bg-slate-100)
- **Border:** Rounded corners
- **Cursor:** Crosshair for precision

### Target Letter Display

- **Position:** Top-left corner
- **Style:** White badge with amber text
- **Format:** "Catch: {letter}"

### Bucket

- **Emoji:** 🪣 (bucket)
- **Position:** Bottom center
- **Cursor indicator:** 👆 (finger pointer)

### Falling Letters

- **Font size:** 3xl (text-3xl)
- **Font weight:** Bold
- **Color:** Default text color

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playClick() | None |
| Correct catch | playSuccess() | 'success' |
| Wrong catch | playError() | 'error' |
| Letter missed | playError() | None |
| Streak milestone | None | 'celebration' |

---

## Progress Tracking

### Integration with useGameSessionProgress

```typescript
useGameSessionProgress({
  gameName: 'Letter Catcher',
  score,
  level: currentLevel,
  isPlaying: true,
  metaData: { caught, missed },
});
```

### Integration with useGameDrops

```typescript
await onGameComplete(caught);
```

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| currentLevel | number | Currently selected level (1-3) |
| letters | FallingLetter[] | Array of falling letters |
| targetLetter | string | Letter to catch (A-Z) |
| bucketX | number | Bucket X position (20-330) |
| score | number | Total accumulated score |
| caught | number | Number of target letters caught |
| missed | number | Number of letters that fell off screen |
| gameState | 'start' \| 'playing' \| 'complete' | Current game phase |
| streak | number | Current consecutive correct catches |

---

## Technical Implementation

### Dependencies

```typescript
// Game logic
import {
  LEVELS,
  spawnLetter,
  updatePositions,
  checkCatch,
  type FallingLetter,
  type LevelConfig,
} from '../games/letterCatcherLogic';

// Game hooks
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameDrops } from '../hooks/useGameDrops';

// Audio & haptics
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';

// UI components
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
```

### Key Constants

```typescript
const CATCH_Y_THRESHOLD = 250; // Y position to trigger catch
const CATCH_X_RADIUS = 50;     // X distance for catch
const BUCKET_MIN_X = 20;       // Minimum bucket position
const BUCKET_MAX_X = 330;      // Maximum bucket position
const LETTERS_TO_COMPLETE = 5; // Target letters to catch
const GAME_UPDATE_RATE = 50;   // Milliseconds per tick
const GAME_HEIGHT = 300;       // Height before letter is "missed"
```

---

## Accessibility Features

### Visual Cues
- Large letter display (3xl font)
- Clear target letter indicator
- Visual streak badge
- Score popup animations

### Motor Assistance
- Three difficulty levels for different skill levels
- Large catch area (50px radius)
- Mouse/touch input (no precision required)

### Audio Cues
- Sound effects for correct/wrong catches
- Distinct success/error sounds

---

## Test Coverage

### Test Suite: `letterCatcherLogic.test.ts`

**Tests covering:**
- Level configurations (3-4 tests)
- Letter spawning (3 tests)
- Position updates (2 tests)
- Catch detection (4 tests)
- Scoring calculations (3 tests)
- Streak bonus system (2 tests)
- Level progression (2 tests)
- Edge cases (3 tests)

---

## Comparison with Similar Games

| Feature | LetterCatcher | ShapePop | MathSmash |
|---------|--------------|----------|-----------|
| CV Required | None (mouse) | Hand (pinch) | Hand (pinch) |
| Core Mechanic | Move to catch | Pinch to pop | Smash to answer |
| Educational Focus | Letter recognition | Shape/number recognition | Math operations |
| Input Type | Pointer/touch | Hand tracking | Hand tracking |
| Levels | 3 (speed/spawn) | 3 (target size) | 3 (difficulty) |
| Scoring | Points + streak | Points + streak | Points + accuracy |
| Penalty | -10 for wrong | Streak reset | Streak reset |
| Age Range | 3-6 | 3-8 | 5-8 |
| Vibe | Active | Active | Active |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
