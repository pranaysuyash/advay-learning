# Shape Sequence Game Specification

**Game ID:** `shape-sequence`
**Age Range:** 4-8
**CV Required:** Hand (pinch)
**Vibe:** Active

---

## Overview

Shape Sequence is a memory game where children remember and repeat a sequence of shapes. The game shows a sequence of shapes at the top, and players must pinch them in the correct order. Wrong order resets the sequence.

---

## Core Mechanics

### Input Method

| Method | Description |
|--------|-------------|
| Primary | Hand tracking with index finger cursor |
| Selection | Pinch gesture (thumb + index finger) |
| Hit Radius | 0.15 (normalized) |

### Game Loop

1. **Sequence Display:** Shows sequence (e.g., "◯ △ ☆") at top left
2. **First Target:** One shape glows with fuchsia border
3. **Pinch:** Player pinches the correct shape
4. **Next Shape:** Next shape in sequence glows
5. **Complete:** All shapes pinched → level complete
6. **Wrong Order:** Sequence resets to start

---

## Levels & Progression

| Level | Sequence Length | Description |
|-------|----------------|-------------|
| 1 | 2 shapes | Introduction |
| 2 | 3 shapes | Easy |
| 3 | 4 shapes | Medium |
| 4 | 5 shapes | Challenging |
| 5 | 6 shapes | Hard |
| 6 | 6 shapes | Expert |

### Level Completion

```typescript
levelBonus = 30 + timeLeft × 2;
streakBonus = Math.min(streak × 2, 15);
totalBonus = levelBonus + streakBonus;
```

---

## Scoring System

### Per Shape

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = basePoints + streakBonus;
```

### Level Completion

```typescript
levelBonus = 30 + timeLeft × 2;
```

### Score Examples

| Event | Points |
|-------|--------|
| Correct shape | 10-25 (with streak) |
| Level complete | 30+ (with time bonus) |
| Wrong order | 0, streak resets |

---

## Shapes

| Shape | Symbol | Color |
|-------|--------|-------|
| Circle | ◯ | Blue (#3B82F6) |
| Square | □ | Blue (#3B82F6) |
| Triangle | △ | Blue (#3B82F6) |
| Diamond | ◇ | Blue (#3B82F6) |
| Star | ☆ | Blue (#3B82F6) |
| Sparkle | ✦ | Blue (#3B82F6) |

### Target Highlighting

- **Expected shape:** Fuchsia (#D946EF) border, scaled 1.1×
- **Other shapes:** Blue (#3B82F6) border
- **Sequence display:** Fuchsia at top left

---

## Visual Design

### UI Elements

- **Sequence Display:** Top left, shows order to pinch
- **Shape Grid:** 4 shapes positioned with 0.25 min distance
- **Feedback Bar:** Top center, shows instructions
- **Streak Display:** Top right, fire emoji + count
- **Timer:** 60 seconds per level

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Blue-50 (#F0F9FF) |
| Shapes (default) | Blue (#3B82F6) |
| Expected shape | Fuchsia (#D946EF) |
| Cursor | Blue circle with icon |
| Streak milestone | Orange to red gradient |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Correct shape | playPop() | 'success' |
| Wrong shape | playError() | 'error' |
| Sequence complete | playCelebration() | 'celebration' |
| Level complete | playCelebration() + TTS | 'celebration' |
| Streak milestone | playCelebration() | 'celebration' |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Start | "Pinch the shapes in the shown order!" |
| Next shape | "Great! Next shape!" |
| Wrong order | "Oops! Start again from the first shape!" |
| Level complete | "Level {N} complete! Amazing!" |
| All complete | "You finished all levels! You're a shape expert!" |

---

## Game Constants

```typescript
const SHAPES = ['◯', '□', '△', '◇', '☆', '✦'];
const TARGET_COUNT = 4;
const HIT_RADIUS = 0.15;
const MAX_LEVEL = 6;
const BASE_POINTS = 10;
const STREAK_BONUS_PER = 2;
const MAX_STREAK_BONUS = 15;
const LEVEL_TIME_LIMIT = 60;
const LEVEL_BONUS_BASE = 30;
const LEVEL_BONUS_TIME_MULTIPLIER = 2;
```

---

## Round Generation

```typescript
function createSequenceRound(level: number) {
  const targetCount = 4;
  const points = pickSpacedPoints(targetCount, 0.25, 0.16);
  const orderLength = Math.min(2 + level, targetCount);

  return {
    targets: points mapped to shapes,
    order: shuffled IDs.slice(0, orderLength)
  };
}
```

### Sequence Length by Level

| Level | Sequence Length |
|-------|----------------|
| 1 | 2 |
| 2 | 3 |
| 3 | 4 |
| 4 | 5 |
| 5+ | 6 (max) |

---

## Collision Detection

Uses `findHitTarget()` utility:

```typescript
hit = findHitTarget(tip, activeTargets, HIT_RADIUS);
```

- Hit radius: 0.15 (normalized coordinates)
- Direct pinch required (no dwell)

---

## Streak System

### Streak Building

- Correct shape: streak + 1
- Wrong shape: streak resets to 0, sequence resets

### Milestone

- Every 5 consecutive correct shapes
- Shows "🔥 {streak} Streak!" overlay
- Duration: 1500ms

---

## Educational Value

### Skills Developed

1. **Memory** - Remembering shape sequences
2. **Sequencing** - Understanding order and patterns
3. **Visual Attention** - Focusing on target shapes
4. **Hand-Eye Coordination** - Pinching accuracy
5. **Pattern Recognition** - Identifying shapes
6. **Impulse Control** - Waiting for correct shape

---

## Accessibility

- **Visual cues:** Fuchsia border highlights expected shape
- **Audio feedback:** TTS announcements for events
- **Forgiving:** Wrong order resets (no game over)
- **No time pressure:** "Take your time!" message
- **Large targets:** 7rem (112px) shape buttons
