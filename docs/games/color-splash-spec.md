# Color Splash Game Specification

**Game ID:** `color-splash`
**World:** Learning
**Vibe:** Active
**Age Range:** 3-8 years
**CV Requirements:** None

---

## Overview

Color Splash is a color recognition game where children splash objects of a target color. Players see colorful objects on screen and must tap only the objects matching the target color.

### Tagline
"Splash all the [color] objects! 💦"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Target** - "Splash all the [color] objects!"
2. **Find Objects** - Identify objects of target color
3. **Tap to Splash** - Tap/click target color objects
4. **Get Feedback** - Correct +20 points, Wrong -5 points
5. **Complete** - All target color objects splashed
6. **Next Level** - More objects, more colors

### Controls

| Action | Input |
|--------|-------|
| Splash object | Click/tap object |
| Start game | Click "Start" button |
| Next level | Automatic after completion |

---

## Difficulty Levels

### 4 Levels

| Level | Objects | Colors | Time | Description |
|-------|---------|--------|------|-------------|
| 1 | 6 | 2 | 30s | Simple splash |
| 2 | 9 | 3 | 45s | More objects |
| 3 | 12 | 3 | 60s | Complex scene |
| 4 | 15 | 4 | 75s | Maximum challenge |

---

## Scoring System

### Score Formula

```typescript
if (correctColor) {
  score = +20;
} else {
  score = -5;
}
```

### Completion Bonus

When all target color objects are splashed, the level is complete (regardless of wrong splashes).

---

## Colors

### 6 Color Options

| Color | Name | Hex | Emoji |
|-------|------|-----|-------|
| Red | red | #EF4444 | 🍎 |
| Blue | blue | #3B82F6 | 🟦 |
| Green | green | #22C55E | 🌿 |
| Yellow | yellow | #EAB308 | ⭐ |
| Purple | purple | #A855F7 | 🍇 |
| Orange | orange | #F97316 | 🍊 |

---

## Object Generation

### Object Properties

```typescript
interface ColorObject {
  id: number;
  color: ColorName;
  emoji: string;
  x: number;
  y: number;
  size: number;
  splashed: boolean;
}
```

### Generation Algorithm

```typescript
// 1. Shuffle colors and select level.colorCount
selectedColors = shuffle(COLORS).slice(0, level.colorCount);
targetColor = selectedColors[0];

// 2. Generate positions with minimum distance
positions = generatePositions(objectCount, 10, 14);

// 3. Create objects
for (i = 0; i < objectCount; i++) {
  color = selectedColors[i % selectedColors.length];
  objects.push({
    id: i,
    color: selectedColor,
    emoji: COLORS[color].emoji,
    x: positions[i].x,
    y: positions[i].y,
    size: 60,
    splashed: false,
  });
}
```

### Position Generation

- **Margin:** 10% from edges
- **Minimum Distance:** 14 units between objects
- **Max Attempts:** 100 tries per object

---

## Splash Mechanics

### Splash Function

```typescript
function splashObject(objects, objectId, targetColor) {
  obj = objects.find(o => o.id === objectId);

  if (!obj || obj.splashed) {
    return { correct: false, scoreDelta: 0, allSplashed: false, isTarget: false };
  }

  isTarget = (obj.color === targetColor);

  if (isTarget) {
    remaining = objects.filter(o => !o.splashed && o.color === targetColor);
    allSplashed = (remaining.length === 1);
    return { correct: true, scoreDelta: +20, allSplashed, isTarget: true };
  }

  return { correct: false, scoreDelta: -5, allSplashed: false, isTarget: false };
}
```

### State Update

```typescript
function updateSplashed(objects, objectId) {
  return objects.map(o =>
    o.id === objectId ? { ...o, splashed: true } : o
  );
}
```

---

## Visual Design

### UI Elements

- **Target Banner:** "Splash all the [color] objects!"
- **Color Objects:** Colored circles with emojis
- **Score Display:** Current score
- **Timer:** Countdown display
- **Splash Effect:** Water splash animation
- **Progress:** Objects remaining to splash

### Object Visual

| State | Appearance |
|-------|------------|
| Normal | Colored circle with emoji |
| Splashed | Faded, ripples, or disappears |
| Target | Highlighted (optional) |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Splash correct | playPop() | 'success' |
| Splash wrong | playError() | 'error' |
| Level complete | playCelebration() | 'celebration' |
| All splashed | playSuccess() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Objects per level | 6-15 | By difficulty |
| Colors per level | 2-4 | By difficulty |
| Time limit | 30-75s | By difficulty |
| Correct score | +20 | Points per target splash |
| Wrong score | -5 | Penalty per wrong splash |
| Object size | 60px | Fixed size |
| Position margin | 10% | From edges |
| Min distance | 14 units | Between objects |

---

## Data Structures

### Color Name

```typescript
type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
```

### Color Object

```typescript
interface ColorObject {
  id: number;
  color: ColorName;
  emoji: string;
  x: number;
  y: number;
  size: number;
  splashed: boolean;
}
```

### Level

```typescript
interface Level {
  id: number;
  objectCount: number;
  colorCount: number;
  timeLimit: number;
}
```

### Splash Result

```typescript
interface SplashResult {
  correct: boolean;
  scoreDelta: number;
  allSplashed: boolean;
  isTarget: boolean;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `ColorSplash.tsx` | ~ | Main component with game loop |
| `colorSplashLogic.ts` | 139 | Object generation, splash detection |
| `colorSplashLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`ColorSplash.tsx`): UI, state, game loop, events
- **Logic** (`colorSplashLogic.ts`): Object generation, splash logic, scoring
- **Tests** (`colorSplashLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Color Recognition**
   - Color identification
   - Color naming
   - Color discrimination

2. **Visual Discrimination**
   - Finding target items
   - Ignoring distractors
   - Visual scanning

3. **Attention & Focus**
   - Sustained attention
   - Target focus
   - Selective attention

4. **Early Math**
   - Counting remaining
   - Score tracking
   - Quantity concepts

5. **Decision Making**
   - Correct vs wrong choices
   - Consequence understanding
   - Strategic thinking

---

## Color Concepts Taught

1. **Primary Colors** - Red, Blue, Yellow
2. **Secondary Colors** - Green, Orange, Purple
3. **Color Names** - Vocabulary building
4. **Color Matching** - Visual discrimination
5. **Color Categories** - Grouping by color

---

## Comparison with Similar Games

| Feature | ColorSplash | ColorMatchGarden | ColorSort |
|---------|-------------|------------------|-----------|
| Domain | Colors | Colors | Colors |
| Age Range | 3-8 | 3-6 | 4-8 |
| Core Mechanic | Splash target color | Match color pairs | Sort by color |
| Input | Tap/click | Drag or click | Drag |
| Difficulty | 4 levels | 3 levels | 3 levels |
| Colors | 6 | 6 | 6 |
| Objects | Scatter | Grid | Bins |
| Scoring | +20/-5 | Points | Accuracy |
| Test Coverage | ~ tests | ~ tests | ~ tests |
| Vibe | Active | Chill | Chill |

---

## Example Gameplay

### Level 1 Example

```
Target: "Splash all the RED objects!"

[🍎]  [🟦]  [🍎]
  ↑     ↑      ↑
 RED  BLUE   RED

[🟦]  [🍎]  [🟦]
 BLUE  RED   BLUE

Tap only the RED objects (🍎)!
```

### Level 4 Example

```
Target: "Splash all the BLUE objects!

Multiple colors (4): RED, BLUE, GREEN, YELLOW
15 objects scattered
Find and splash all BLUE objects!
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
