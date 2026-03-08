# Color Match Garden Game Specification

**Game ID:** `color-match-garden`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-8 years
**CV Requirements:** Hand tracking (pinch detection)

---

## Overview

Color Match Garden is a color recognition game where children find and pinch flowers that match a requested color. The game uses computer vision hand tracking to detect when a child pinches the correct flower.

### Tagline
"Find the flower with the matching color! 🌺🌻🌷"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Prompt** - A color name is shown (e.g., "Find Red")
2. **Locate Flower** - Three flowers are displayed with different colors
3. **Pinch Correct Flower** - Child pinches the matching flower
4. **Score Points** - Earn points with streak bonuses
5. **New Round** - Three new flowers appear
6. **Repeat** - Continue for 60 seconds

### Controls

| Action | Input |
|--------|-------|
| Select flower | Pinch (index + thumb) on flower |
| Start game | Click "Start Game!" button |
| Home | Click "Home" button |

---

## Flower Types

### Six Flower Colors

| Name | Color | Emoji | Asset ID |
|------|-------|-------|----------|
| Red | #ef4444 | 🌺 | brush-red |
| Blue | #3b82f6 | 🪻 | brush-blue |
| Green | #22c55e | 🌿 | brush-green |
| Yellow | #eab308 | 🌻 | brush-yellow |
| Pink | #ec4899 | 🌸 | brush-red |
| Purple | #8b5cf6 | 🌷 | brush-blue |

### Data Structure

```typescript
interface GardenTarget {
  id: number;           // Unique identifier (0-2 for round)
  name: string;         // Color name ("Red", "Blue", etc.)
  color: string;        // Hex color code
  emoji: string;        // Flower emoji
  assetId: string;      // Asset reference
  position: Point;      // Normalized position {x, y}
}
```

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| TARGET_RADIUS | 0.1 | Hit detection radius (normalized) |
| GAME_DURATION_SECONDS | 60 | Total game time |
| BASE_POINTS_PER_MATCH | 12 | Base score per correct match |
| MAX_STREAK_BONUS | 18 | Maximum streak bonus per match |
| STREAK_BONUS_MULTIPLIER | 2 | Points per streak level |
| STREAK_MILESTONE | 6 | Celebration interval (every 6) |
| TARGETS_PER_ROUND | 3 | Flowers displayed each round |
| MIN_TARGET_SPACING | 0.25 | Minimum distance between targets |
| TARGET_MARGIN | 0.15 | Margin from screen edges |

---

## Scoring System

### Score Calculation

```typescript
basePoints = BASE_POINTS_PER_MATCH;  // 12
streakBonus = Math.min(MAX_STREAK_BONUS, streak × STREAK_BONUS_MULTIPLIER);
finalScore = basePoints + streakBonus;
```

### Score Examples

| Streak | Score | Breakdown |
|--------|-------|-----------|
| 0 | 12 | 12 + 0 |
| 1 | 14 | 12 + 2 |
| 2 | 16 | 12 + 4 |
| 3 | 18 | 12 + 6 |
| 5 | 22 | 12 + 10 |
| 9 | 30 | 12 + 18 (max) |
| 10+ | 30 | 12 + 18 (capped) |

### Level Display

```typescript
level = Math.max(1, Math.floor(score / 100) + 1);
```

| Score | Level |
|-------|-------|
| 0-99 | 1 |
| 100-199 | 2 |
| 200-299 | 3 |
| 300-399 | 4 |

---

## Round Generation

### buildRoundTargets Algorithm

1. **Shuffle** all 6 flowers using Fisher-Yates shuffle
2. **Pick** first 3 flowers from shuffled list
3. **Generate** 3 spaced positions with minimum distance
4. **Assign** sequential IDs (0, 1, 2)
5. **Select** random prompt ID (0-2) as target to find

### Spacing Algorithm

- Uses `pickSpacedPoints(count, minDistance, margin, random)`
- Ensures 0.25 minimum distance between flowers
- Keeps flowers 0.15 away from edges
- Falls back to placement if 300 attempts fail

---

## Pinch Detection

### Hit Detection

```typescript
distance = √((point.x - target.x)² + (point.y - target.y)²)
isHit = distance <= TARGET_RADIUS  // 0.1
```

### Pinch Transition

Only detects on pinch **start** transition:
- Requires `frame.pinch.transition === 'start'`
- Prevents multiple detections per pinch

---

## Visual Design

### UI Elements

- **Prompt Display:** Top-left, shows "Find [Color]"
- **Feedback:** Top-center banner with instructions
- **Timer:** Top-right, changes color when low (red < 10s, orange < 20s)
- **Streak HUD:** Top-right, 5 hearts (kenney platformer assets)
- **Flower Targets:** Circular buttons with emoji, color border, asset image
- **Cursor:** Cyan hand cursor (84px)

### Flower Rendering

- 112px × 112px circles
- White background with color border (3px)
- Asset image in center (opacity 0.9)
- Large emoji overlay
- Name label below flower

### Background

- Sunny garden background
- White/cream gradient overlay
- Backdrop blur effect

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playPop() | None |
| Correct match | playPop() | 'success' |
| Wrong match | playError() | 'error' |
| Streak milestone (6) | playSuccess() + playFanfare() | None |
| Celebration | playCelebration() | None |

---

## TTS Messages

| Situation | Message |
|-----------|---------|
| Start game | "Find the [color] flower!" |
| Correct match | "Yes! [color]! Great job!" |
| Wrong match | "Try again! Find the [color] flower!" |
| Streak milestone | "Amazing streak! Six in a row!" |
| Instructions | "Find the flower with the matching color. Pinch the flower to collect it!" |

---

## Feedback Messages

| Situation | Message |
|-----------|---------|
| Initial | "Pinch the flower with the asked color." |
| Correct | "Yes! [color] flower collected." |
| Miss | "Try pinching directly on a flower." |
| Wrong | "That was [wrong]. Find [expected]." |

---

## Streak System

### Streak Milestones

Every 6 correct matches triggers:
- Celebration overlay shows
- "Blooming brilliance!" message
- Fanfare sound
- TTS announcement
- 1.8 second display

### Streak HUD

5 hearts showing current streak (mod 6):
- 0-4 streak: Shows hearts equal to streak
- 5+ streak: Shows all 5 hearts
- Resets on wrong match

---

## Game State

### State Structure

```typescript
interface ColorMatchGardenState {
  isPlaying: boolean;
  score: number;
  timeLeft: number;
  targets: GardenTarget[];
  promptId: number;
  cursor: Point | null;
  feedback: string;
  showCelebration: boolean;
}
```

### States

| State | Description |
|-------|-------------|
| Menu | Show instructions and start button |
| Playing | Active game with 3 flowers displayed |
| Celebration | Overlay showing (1.8s) |

---

## Game Constants

```typescript
const TARGET_RADIUS = 0.1;
const GAME_DURATION_SECONDS = 60;
const BASE_POINTS_PER_MATCH = 12;
const MAX_STREAK_BONUS = 18;
const STREAK_BONUS_MULTIPLIER = 2;
const STREAK_MILESTONE = 6;
const TARGETS_PER_ROUND = 3;
const MIN_TARGET_SPACING = 0.25;
const TARGET_MARGIN = 0.15;
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `ColorMatchGarden.tsx` | 534 | Main component with game loop |
| `colorMatchGardenLogic.ts` | 190 | Game logic and utilities |
| `colorMatchGardenLogic.test.ts` | 350+ | Unit tests (68 tests) |

### Architecture

- **Component** (`ColorMatchGarden.tsx`): UI, hand tracking, game loop, state management
- **Logic** (`colorMatchGardenLogic.ts`): Pure functions for targets, scoring, matching
- **Tests** (`colorMatchGardenLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Color Recognition**
   - Identifying 6 colors
   - Matching colors to names
   - Color-word association

2. **Visual Scanning**
   - Finding targets among distractors
   - Visual attention
   - Spatial awareness

3. **Fine Motor Skills**
   - Pinch gesture precision
   - Hand-eye coordination
   - Controlled movements

4. **Listening Skills**
   - Following color instructions
   - Processing verbal prompts
   - Response to audio cues

5. **Counting & Math**
   - Score tracking
   - Understanding streaks
   - Progression awareness

---

## Comparison with Similar Games

| Feature | ColorMatchGarden | ColorMatch | ShapePop |
|---------|------------------|------------|----------|
| CV Required | Hand (pinch) | Pose (pointing) | Hand (pinch) |
| Educational Focus | Colors | Colors | Shapes |
| Age Range | 3-8 | 3-8 | 3-8 |
| Targets per Round | 3 | 6 | 1-3 |
| Game Duration | 60s | 60s | 45s |
| Streak System | Yes | Yes | Yes |
| Scoring | Base + streak | Base + streak | Base × level + streak |
| Vibe | Chill | Active | Chill |

---

## Test Coverage

### Test Suite: `colorMatchGardenLogic.test.ts`

**68 tests covering:**

*FLOWERS Array (5 tests)*
- Has 6 flower types
- All expected flowers present
- Required properties validation
- Red and Blue flower details

*GAME_CONFIG (6 tests)*
- All configuration constants

*isPointInTarget (6 tests)*
- Center hit detection
- Within radius detection
- Edge detection
- Outside radius rejection
- Default radius usage
- Diagonal distance handling

*isCorrectMatch (3 tests)*
- ID matching
- ID difference
- Copy comparison

*calculateScore (6 tests)*
- Zero streak scoring
- Streak bonus calculation
- Maximum bonus capping
- Streak cap point
- Negative streak handling
- Linear progression

*isStreakMilestone (6 tests)*
- Zero streak handling
- Milestone detection (6, 12, 18)
- Between milestone handling

*pickSpacedPoints (7 tests)*
- Point count generation
- Sequential ID assignment
- Bounds validation
- Margin respect
- Empty handling
- High density fallback

*buildRoundTargets (9 tests)*
- Target count
- Valid prompt ID
- Required properties
- Sequential IDs
- Valid prompt reference
- Random variation
- Deterministic behavior
- Position bounds

*getPromptTarget (3 tests)*
- Correct target retrieval
- Out of range handling
- Empty array handling

*getMatchFeedback (4 tests)*
- Positive feedback
- Corrective feedback
- Expected name inclusion
- Both names in negative feedback

*getFlowersByName (3 tests)*
- Unknown name handling
- Name matching
- All flower names

*getFlowerByAssetId (4 tests)*
- Unknown asset handling
- Asset ID lookup
- Shared asset handling
- All asset IDs

*Scoring Mechanics (4 tests)*
- Base points
- Streak bonus per level
- Maximum bonus
- Maximum score per match

*Level Display (3 tests)*
- Level 1 range
- Level 2 range
- Formula verification

**All tests passing ✅**

---

## Progress Tracking

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('color-match-garden');

// On timer completion
await onGameComplete();
```

### useStreakTracking Integration

```typescript
const { streak, incrementStreak, resetStreak } = useStreakTracking();

// On correct match
const nextStreak = incrementStreak();

// On wrong match
resetStreak();
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
