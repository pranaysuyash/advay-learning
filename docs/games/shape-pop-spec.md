# Shape Pop Game Specification

**Game ID:** `shape-pop`
**World:** Arcade
**Vibe:** Active
**Age Range:** 3-8 years
**CV Requirements:** Hand tracking (pinch detection)

---

## Overview

Shape Pop is an arcade-style hand-tracking game where children pop collectibles (gems, coins, stars) by pinching while their finger cursor is inside the target ring. The game features difficulty levels, streak bonuses, and a combo scoring system.

### Tagline
"Pop gems, coins, and stars! Build streaks for bonus points! 💎⭐🪙"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Difficulty** - Player chooses Easy, Medium, or Hard
2. **Target Appears** - Random collectible appears at random position
3. **Position Hand** - Child moves hand until finger cursor is inside ring
4. **Pinch to Pop** - Child pinches to collect the item
5. **Score Points** - Base points + combo bonus + streak bonus
6. **Streak Builds** - Consecutive hits increase streak counter
7. **Miss Resets** - Pinching outside the ring resets streak to 0
8. **New Target** - Different collectible appears at new position
9. **Milestone** - Every 120 points triggers celebration

### Controls

| Action | Input |
|--------|-------|
| Move cursor | Move hand (index finger tip tracked) |
| Pop collectible | Pinch while cursor inside target ring |
| Change difficulty | Select Easy/Medium/Hard from menu |
| Return home | Press Home button |

---

## Collectibles

### Collectible Types

| ID | Name | Points | Asset |
|----|------|--------|-------|
| gem | Gem | 15 | gem_blue.png |
| coin | Coin | 10 | coin_gold.png |
| star | Star | 20 | star.png |

### Collectible Selection

Randomly selected from the 3 types when spawning new target.

---

## Difficulty Levels

### Level Configuration

```typescript
interface DifficultyConfig {
  targetSize: number;    // Size of target in pixels
  popRadius: number;     // Hit radius as fraction (0-1)
  cursorSize: number;    // Size of finger cursor
}
```

| Difficulty | Target Size | Pop Radius | Cursor Size | Description |
|------------|-------------|------------|-------------|-------------|
| Easy | 180px | 0.20 (20%) | 100px | Big targets, more forgiving |
| Medium | 144px | 0.16 (16%) | 84px | Standard play |
| Hard | 120px | 0.12 (12%) | 72px | Small targets, requires precision |

---

## Scoring System

### Score Calculation

```typescript
const comboBonus = Math.min(streak * 2, 10);  // +2 per streak, max +10
const streakBonus = streak >= 5 ? 25 : 0;      // +25 at 5x streak
const totalPoints = basePoints + comboBonus + streakBonus;
```

### Score Examples

| Collectible | Streak | Combo Bonus | Streak Bonus | Total |
|-------------|--------|-------------|-------------|-------|
| Coin (10) | 0 | 0 | 0 | 10 |
| Coin (10) | 1 | 2 | 0 | 12 |
| Coin (10) | 3 | 6 | 0 | 16 |
| Coin (10) | 5 | 10 | 25 | 45 |
| Star (20) | 5 | 10 | 25 | 55 |

### Streak Progression

| Streak | Combo Bonus | Total (Coin) | Total (Star) |
|--------|-------------|--------------|--------------|
| 0 | 0 | 10 | 20 |
| 1 | 2 | 12 | 22 |
| 2 | 4 | 14 | 24 |
| 3 | 6 | 16 | 26 |
| 4 | 8 | 18 | 28 |
| 5 | 10 | 45 | 55 |
| 6+ | 10 | 45 | 55 |

---

## Streak System

### Visual Display

- 5 hearts displayed in top-right corner
- Hearts fill from left to right as streak increases
- Empty hearts shown for remaining streak capacity
- Hearts reset to empty when streak is lost

### Heart Assets

- Full heart: `/assets/kenney/platformer/hud/hud_heart.png`
- Empty heart: `/assets/kenney/platformer/hud/hud_heart_empty.png`

### Feedback Messages

| Streak | Feedback | TTS Voice |
|--------|----------|------------|
| 0-2 | "[Name] popped! +[X] pts" | "[Name] popped! Great hit!" |
| 3-4 | "✨ [X]x streak! [Name] +[X] pts" | "Nice streak! [Name] popped! [X] in a row!" |
| 5+ | "🔥 [X]x STREAK! [Name] +[X] pts!" | "[X] in a row! [Name] popped! Incredible!" |
| Miss (streak ≥3) | "💥 Streak lost! Try again!" | "Oops! Streak lost! Try again!" |
| Miss (streak <3) | "Close! Move into the ring, then pinch." | "Pinch when you are inside the target!" |

---

## Hit Detection

### Hit Test Algorithm

Uses shared utility from `targetPracticeLogic.ts`:

```typescript
function isPointInCircle(
  point: Point,
  center: Point,
  radius: number
): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}
```

### Target Spawn

Random position within game area:
- Uses `pickRandomPoint(minX, maxX, padding)` utility
- Default: `pickRandomPoint(0.4, 0.55, 0.18)`
- Ensures targets spawn in accessible area

---

## Easter Egg

| Property | Value |
|----------|-------|
| ID | `egg-diamond-pop` |
| Trigger | 20 pops within 30 seconds |
| Effect | Triggers item drop system |
| Window | 30 seconds (sliding window) |

---

## Milestones

### Celebration Trigger

Every 120 points triggers celebration overlay:
- Shows "Awesome popping!" message
- Plays celebration sound and haptic
- Displays for 3 seconds
- Game continues after celebration

---

## Visual Design

### Target Display

- **Background:** Fuchsia ring with glow effect
- **Ring Color:** #D946EF (fuchsia)
- **Glow:** `box-shadow-[0_0_30px_rgba(217,70,239,0.3)]`
- **Animation:** Bounce animation (2s duration)
- **Backdrop:** Gradient from white/40 via transparent to fuchsia-100/40

### Cursor

- **Color:** #3B82F6 (blue)
- **Icon:** 👆 (hand emoji)
- **Size:** Varies by difficulty (100px / 84px / 72px)
- **High contrast:** Enabled for visibility

### Feedback Bar

- **Position:** Top center of game area
- **Style:** White/95 backdrop-blur with rounded border
- **Border:** 3px solid #F2CC8F
- **Shadow:** `box-shadow-[0_4px_0_#E5B86E]`

### Menu Design

- **Background:** White with 3D border
- **Collectibles Preview:** Shows all 3 types with point values
- **Difficulty Buttons:** Grid layout with emoji icons
- **TTS Support:** Voice instructions when enabled

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playPop() | None |
| Hit target | playPop() | 'success' |
| Miss target | playError() | 'error' |
| Milestone (120 pts) | playCelebration() | 'celebration' |
| Easter egg trigger | None | None (item drop only) |

---

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| score | number | Total accumulated score |
| targetCenter | Point | Normalized position of target |
| targetCollectible | Collectible | Current collectible type |
| cursor | Point \| null | Current finger tip position |
| feedback | string | Current feedback message |
| streak | number | Current consecutive hits |
| difficulty | 'easy' \| 'medium' \| 'hard' | Selected difficulty |
| showMenu | boolean | Menu visibility |

---

## Progress Tracking

### Integration with progressQueue

```typescript
await progressQueue.add({
  profileId: currentProfile.id,
  gameId: 'shape-pop',
  score: finalScore,
  completed: true,
  metadata: {
    difficulty: difficulty,
    streak: finalStreak,
  },
});
```

---

## Technical Implementation

### Dependencies

```typescript
// Hand tracking
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Game logic (shared utilities)
import { isPointInCircle, pickRandomPoint } from '../games/targetPracticeLogic';

// Game hooks
import { useGameDrops } from '../hooks/useGameDrops';

// Audio & TTS
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

// UI components
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
```

### Key Constants

```typescript
// Difficulty configurations
const GAME_CONFIG = {
  easy: { targetSize: 180, popRadius: 0.20, cursorSize: 100 },
  medium: { targetSize: 144, popRadius: 0.16, cursorSize: 84 },
  hard: { targetSize: 120, popRadius: 0.12, cursorSize: 72 },
};

// Easter egg
const POP_WINDOW_MS = 30000; // 30 seconds
const POP_THRESHOLD = 20;    // Number of pops

// Milestone
const MILESTONE_SCORE = 120; // Points between celebrations
```

---

## Accessibility Features

### Visual Cues
- Large target rings (varies by difficulty)
- High contrast cursor
- Color-coded feedback
- Visual streak display with hearts

### Audio Cues
- Sound effects for hits and misses
- TTS voice announcements
- Voice instructions available

### Motor Assistance
- Three difficulty levels for different skill levels
- Large hit area in Easy mode
- Visual feedback ring

---

## Test Coverage

### Test Suite: `shapePopLogic.test.ts`

**Tests covering:**
- Difficulty configurations (3 tests)
- Collectible types and points (3 tests)
- Score calculation algorithm (4 tests)
- Combo bonus scaling (3 tests)
- Streak bonus threshold (2 tests)
- Hit detection (3 tests)
- Miss behavior (2 tests)
- Easter egg conditions (2 tests)
- Edge cases (3 tests)

---

## Comparison with Similar Games

| Feature | ShapePop | SteadyHandLab | FruitNinjaAir |
|---------|----------|---------------|--------------|
| CV Required | Hand (pinch) | Hand (steady) | Hand (swipe) |
| Core Mechanic | Pinch in ring | Hold steady | Slice flying objects |
| Scoring | Points + streak | Stability % | Slice count |
| Difficulty | 3 levels | 3 levels | N/A |
| Collectibles | 3 types | None | Fruits |
| Streak System | Yes (5 shown) | Yes | Yes |
| Easter Egg | 20 pops/30s | 10s hold | N/A |
| Age Range | 3-8 | 3-8 | 3-8 |
| Vibe | Active | Chill | Active |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0 (isNew: true)
