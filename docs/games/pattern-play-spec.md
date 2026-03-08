# Pattern Play Game Specification

**Game ID:** `pattern-play`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-8 years
**CV Requirements:** None

---

## Overview

Pattern Play is a visual pattern recognition game where children complete sequences of shapes and colors. The game develops critical thinking skills through pattern analysis and prediction.

### Tagline
"Complete the pattern! 🔮✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Pattern** - 3-7 items shown in sequence with "?" at end
2. **Analyze Pattern** - Determine the shape and color pattern
3. **Choose Answer** - Select correct completion from 4 options
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - 5 rounds per session

### Controls

| Action | Input |
|--------|-------|
| Select answer | Click/tap shape button |
| Select level | Click level button |
| Start game | Click "Start!" button |
| Play again | Click "Play Again" button |
| Back to menu | Click "Finish" button |

---

## Difficulty Levels

### 3 Difficulty Settings

| Level | Pattern Length | Items Shown | Description |
|-------|----------------|-------------|-------------|
| 1 | 4 | 3 | Simple 4-item patterns |
| 2 | 6 | 5 | Medium 6-item patterns |
| 3 | 8 | 7 | Complex 8-item patterns |

### Pattern Properties

| Property | Values |
|----------|--------|
| Shapes | 6: ●, ■, ▲, ★, ♦, ♥ |
| Colors | 5: red, blue, green, purple, orange |
| Combinations | 30 unique (6 × 5) |

---

## Scoring System

### Score Formula

```typescript
basePoints = 15;
streakBonus = Math.min(streak × 3, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 15 |
| 1 | 3 | 18 |
| 2 | 6 | 21 |
| 3 | 9 | 24 |
| 4 | 12 | 27 |
| 5+ | 15 | 30 |

### Max per Round

30 points (15 base + 15 bonus)

---

## Streak System

### Streak Progression

Every correct answer increments streak. Wrong answer resets to 0.

### Visual Feedback

- Kenney heart HUD fills (5 hearts max)
- Heart fills every 2 streak points
- Milestone every 5 streak points

### Milestone Display

- "🔥 X Streak! 🔥" overlay
- Yellow/orange/pink gradient background
- 1.2 second display duration
- Haptic celebration

---

## Pattern Generation

### Algorithm

```typescript
for (let i = 0; i < patternLength; i++) {
  pattern.push({
    shape: random(SHAPES),
    color: random(COLORS)
  });
}
answer = pattern[pattern.length - 1];
shown = pattern.slice(0, -1);
```

### Options Generation

```typescript
options = [answer];
while (options.length < count) {
  option = { shape: random(SHAPES), color: random(COLORS) };
  if (!options.some(o => o.shape === option.shape && o.color === option.color)) {
    options.push(option);
  }
}
return shuffle(options);
```

---

## Visual Design

### UI Elements

- **Pattern Display:** Horizontal row of shape/color boxes
- **Options Grid:** 4 buttons with possible answers
- **Streak HUD:** Pink-themed heart display
- **Score Popup:** Animated +points indicator
- **Feedback Text:** Shows result message

### Color Mapping

| Color | Tailwind Class |
|-------|---------------|
| red | bg-red-500 |
| blue | bg-blue-500 |
| green | bg-green-500 |
| purple | bg-purple-500 |
| orange | bg-orange-500 |

### Box Styling

| Element | Style |
|---------|-------|
| Pattern boxes | 48×48px rounded, colored BG |
| Option buttons | 64×64px rounded, colored BG |
| Question mark box | Gray BG, "?" symbol |
| Active level | Pink-500 BG, white text |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select answer | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |
| Milestone | None | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Rounds per session | 5 | Total rounds in game |
| Options count | 4 | Multiple choice options |
| Base points | 15 | Points per correct answer |
| Streak bonus per | 3 | Points added per streak level |
| Max streak bonus | 15 | Cap on streak bonus |
| Milestone interval | 5 | Streak points per milestone |

---

## Data Structures

### Pattern Item

```typescript
interface PatternItem {
  shape: string;  // One of: ●, ■, ▲, ★, ♦, ♥
  color: string;  // One of: red, blue, green, purple, orange
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;        // Level identifier (1-3)
  patternLength: number; // Total items in pattern
}
```

### Pattern Result

```typescript
interface PatternResult {
  shown: PatternItem[];  // All items except last
  answer: PatternItem;   // The final item
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `PatternPlay.tsx` | 211 | Main component with game loop |
| `patternPlayLogic.ts` | 54 | Game logic and utilities |
| `patternPlayLogic.test.ts` | 337 | Unit tests (46 tests) |

### Architecture

- **Component** (`PatternPlay.tsx`): UI, state, game loop, events, animations
- **Logic** (`patternPlayLogic.ts`): Pure functions for patterns, options, levels
- **Tests** (`patternPlayLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Pattern Recognition**
   - Visual pattern identification
   - Sequence completion
   - Rule discovery

2. **Critical Thinking**
   - Analytical reasoning
   - Prediction skills
   - Logical deduction

3. **Visual Discrimination**
   - Shape recognition
   - Color identification
   - Combinatorial thinking

4. **Attention & Focus**
   - Pattern scanning
   - Detail observation
   - Concentration skills

5. **Early Math Foundations**
   - Sequencing concepts
   - Patterning skills
   - Algebraic thinking readiness

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Pattern Play',
  score,
  level: currentLevel,
  isPlaying: true,
  metaData: { correct, round }
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('pattern-play');

// On game completion
await onGameComplete(correct);
```

---

## Comparison with Similar Games

| Feature | PatternPlay | NumberSequence | ShapePop |
|---------|-------------|----------------|----------|
| Pattern Type | Visual (shape+color) | Numerical | Visual only |
| Complexity | Dual dimension | Single dimension | Single dimension |
| Age Range | 4-8 | 5-10 | 3-6 |
| Options | 4 choices | 4 choices | 3 choices |
| Vibe | Chill | Chill | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
