# Fruit Ninja Air Game Specification

**Game ID:** `fruit-ninja-air`
**World:** Arcade
**Vibe:** Active
**Age Range:** 3-8 years
**CV Requirements:** None (uses pointer/touch input)

---

## Overview

Fruit Ninja Air is an arcade-style slicing game where children swipe their finger (or hand) across the screen to slice flying fruits. The game features multiple levels with increasing difficulty, fruit physics with gravity and rotation, and a streak bonus system.

### Tagline
"Swipe to slice the fruits! 🔪🍉"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Level** - Player chooses Level 1, 2, or 3
2. **Start Game** - Press "Start Slicing!" button
3. **Fruits Spawn** - Fruits appear from bottom and fly upward
4. **Player Swipes** - Child swipes finger across screen to slice
5. **Slice Detection** - Swipe path intersects fruit → sliced
6. **Score Points** - Base points + streak bonus
7. **Streak Builds** - Consecutive slices increase streak counter
8. **Level Complete** - After slicing required number of fruits
9. **Complete Screen** - Shows final score and stats

### Controls

| Action | Input |
|--------|-------|
| Slice fruits | Swipe finger/mouse across canvas |
| Select level | Click level button before game |
| Restart | Click "Play Again" button |
| Finish | Click "Finish" button |
| Return home | Click home icon |

---

## Levels

### Level Configuration

```typescript
interface LevelConfig {
  level: number;
  fruitsToSlice: number; // Target number of fruits to slice
  spawnRate: number;     // Milliseconds between spawns
  timeLimit: number;     // Seconds (soft limit, not enforced)
}
```

| Level | Fruits to Slice | Spawn Rate | Time Limit |
|-------|----------------|------------|------------|
| 1 | 10 | 1500ms (1.5s) | 30s |
| 2 | 15 | 1200ms (1.2s) | 35s |
| 3 | 20 | 900ms (0.9s) | 40s |

---

## Fruits

### Fruit Types

10 fruit emojis are randomly selected:

| Emoji | Name |
|-------|------|
| 🍎 | Apple |
| 🍊 | Tangerine |
| 🍋 | Lemon |
| 🍉 | Watermelon |
| 🍇 | Grape |
| 🍓 | Strawberry |
| 🍑 | Peach |
| 🥝 | Persimmon |
| 🍍 | Melon |
| 🥭 | Mango |

### Fruit Properties

```typescript
interface Fruit {
  id: number;           // Unique identifier
  x: number;            // X position (pixels)
  y: number;            // Y position (pixels)
  vx: number;           // X velocity (pixels/frame)
  vy: number;           // Y velocity (pixels/frame)
  rotation: number;    // Current rotation angle (radians)
  rotationSpeed: number; // Rotation speed (radians/frame)
  emoji: string;        // Fruit emoji
  sliced: boolean;      // Whether fruit has been sliced
}
```

### Physics

- **Gravity:** 0.15 pixels/frame² (accelerates downward)
- **Initial Velocity:**
  - Y: Random upward (4 to 7 pixels/frame)
  - X: Random horizontal (-2 to +2 pixels/frame)
- **Rotation Speed:** Random (-0.1 to +0.1 radians/frame)
- **Spawn Position:** Random X (50 to canvasWidth-50), Y = -50 (above canvas)

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10 × fruitsSliced; // 10 points per fruit
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Fruits Sliced | Streak | Base | Bonus | Total |
|---------------|--------|------|-------|-------|
| 1 | 1 | 10 | 2 | 12 |
| 2 | 2 | 20 | 4 | 24 |
| 3 | 3 | 30 | 6 | 36 |
| 4 | 4 | 40 | 8 | 48 |
| 5 | 5 | 50 | 10 | 60 |
| 6 | 7 | 60 | 14 | 74 |
| 8+ | 8+ | 80+ | 15 | 95+ |

---

## Slice Detection

### Algorithm

The game tracks the swipe path as a series of points:

```typescript
// Store last 10 points from pointer movement
slicePath = [{ x1, y1 }, { x2, y2 }, ...];

// Check each fruit against swipe path
for (const fruit of fruits) {
  for (const point of slicePath) {
    const distance = Math.sqrt(
      Math.pow(point.x - fruit.x, 2) +
      Math.pow(point.y - fruit.y, 2)
    );
    if (distance < 40) {
      // Sliced!
      isSliced = true;
      break;
    }
  }
}
```

### Hit Radius

- **Distance threshold:** 40 pixels
- Measured from fruit center to any point on swipe path
- If distance < 40 pixels, fruit is sliced

---

## Streak System

### Streak Display

- Shown as "🔥 {streak}" when streak > 0
- Displayed in orange badge in game UI
- Resets to 0 when game restarts

### Streak Milestone

- Every 5 consecutive slices triggers milestone
- Shows "🔥 {streak} Streak! 🔥" overlay
- Plays celebration haptic

### Bonus Progression

| Streak | Bonus | Total (1 fruit) |
|--------|-------|------------------|
| 1 | 2 | 12 |
| 2 | 4 | 14 |
| 3 | 6 | 16 |
| 4 | 8 | 18 |
| 5 | 10 | 20 |
| 6 | 12 | 22 |
| 7 | 14 | 24 |
| 8+ | 15 | 25 (capped) |

---

## Game Flow

### Game States

| State | Description |
|-------|-------------|
| `start` | Show start screen with instructions |
| `playing` | Active gameplay - spawning and slicing |
| `complete` | Level complete - show results |

### Level Completion

- Trigger: `slicedCount >= levelConfig.fruitsToSlice`
- On complete:
  - Game state changes to `complete`
  - Celebration sound plays
  - Final score displayed
  - "Fruit Master!" message shown

---

## Visual Design

### Canvas

- **Size:** 400×500 pixels
- **Background:** Gradient from sky blue (#87CEEB) to grass green (#228B22)
- **Border:** Rounded with green border
- **Cursor:** Crosshair cursor for precision

### Fruit Display

- **Render:** Canvas emoji text (40px serif font)
- **Animation:** Rotates as it flies
- **Slice:** Removed from canvas when sliced

### Score Popup

- **Appearance:** Green text (+points)
- **Animation:** Floats up and fades out
- **Duration:** 0.7 seconds
- **Position:** At last point of swipe

### Level Buttons

- **Selected:** Green with shadow, white text
- **Unselected:** White with green border, slate text
- **Hover:** Border changes to green

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playClick() | None |
| Fruit sliced | playPop() | 'success' |
| Level complete | playCelebration() | None |
| Streak milestone | None | 'celebration' |

---

## Progress Tracking

### Integration with progressQueue

```typescript
await progressQueue.add({
  profileId: currentProfile.id,
  gameId: 'fruit-ninja-air',
  score: Math.round(score / 10),
  completed: true,
  metadata: {
    sliced: slicedCount,
    target: levelConfig.fruitsToSlice,
  },
});
```

**Note:** Score is divided by 10 for progress tracking (different from display score).

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| currentLevel | number | Currently selected level (1-3) |
| fruits | Fruit[] | Array of flying fruits |
| slicedCount | number | Number of fruits sliced in current level |
| score | number | Total accumulated score |
| gameState | 'start' | 'playing' | 'complete' | Current game phase |

---

## Technical Implementation

### Dependencies

```typescript
// Game logic
import {
  LEVELS,
  spawnFruit,
  updateFruits,
  checkSlice,
  type Fruit,
  type LevelConfig,
} from '../games/fruitNinjaAirLogic';

// Game hooks
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';

// Audio & haptics
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';

// UI components
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
```

### Key Constants

```typescript
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const SLICE_DISTANCE = 40; // pixels - hit radius
const SLICE_PATH_LENGTH = 10; // number of points to track
const GRAVITY = 0.15; // pixels/frame²
const MAX_FRUITS = 8; // Maximum fruits on screen
```

---

## Accessibility Features

### Visual Cues
- Large fruit emojis for visibility
- Clear score and progress displays
- Visual streak indicator
- Level buttons with clear selection state

### Motor Assistance
- Three difficulty levels for different skill levels
- Large hit radius (40px) for easier slicing
- Swipe works with any pointing device (mouse, touch, hand)

---

## Test Coverage

### Test Suite: `fruitNinjaAirLogic.test.ts`

**Tests covering:**
- Level configurations (4 tests)
- Fruit spawning (4 tests)
- Physics update (3 tests)
- Slice detection (4 tests)
- Scoring calculations (4 tests)
- Streak bonus system (3 tests)
| Level progression (3 tests)
| Edge cases (5 tests)

---

## Comparison with Similar Games

| Feature | FruitNinjaAir | ShapePop | SteadyHandLab |
|---------|--------------|----------|---------------|
| CV Required | None (pointer) | Hand (pinch) | Hand (steady) |
| Core Mechanic | Swipe to slice | Pinch in ring | Hold steady |
| Input Type | Pointer/touch | Hand tracking | Hand tracking |
| Levels | 3 (10/15/20 fruits) | 3 (target size) | 3 (hold duration) |
| Scoring | Points + streak | Points + streak | Stability % |
| Fruits | 10 types | 3 collectibles | None |
| Physics | Gravity + rotation | None | None |
| Age Range | 3-8 | 3-8 | 3-8 |
| Vibe | Active | Active | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
