# Target Practice Game Specification

**Game ID:** `target-practice`
**World:** Active
**Vibe:** Energetic
**Age Range:** 4-10 years
**CV Requirements:** None

---

## Overview

Target Practice is an active game where children hit targets that appear on screen. The game generates well-spaced targets and detects hits based on point-in-circle collision.

### Tagline
"Hit the Targets! 🎯"

---

## Game Mechanics

### Core Gameplay Loop

1. **Targets Appear** - Random positions on screen
2. **Aim and Hit** - Touch/click target to score
3. **Get Feedback** - Visual + audio feedback
4. **Targets Change** - New targets appear
5. **Track Score** - Count hits

### Controls

| Action | Input |
|--------|-------|
| Hit target | Tap/click target |
| Start game | Tap start button |

---

## Target Generation

### Point Spacing Algorithm

```typescript
function pickSpacedPoints(
  count: number,
  minDistance: number,
  margin: number,
  random: () => number = Math.random
): TargetPoint[]
```

### Algorithm Steps

1. Generate candidate point within margin
2. Check distance from all existing targets
3. Accept if far enough (> minDistance)
4. Retry up to 300 times
5. Fallback: place anyway if max attempts reached

### Spacing Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Default margin | 0.15 | 15% padding from edges |
| Min distance | Configurable | Per difficulty |
| Max attempts | 300 | Prevent infinite loops |

---

## Hit Detection

### Point-in-Circle Test

```typescript
function isPointInCircle(
  point: Point,
  center: Point,
  radius: number
): boolean

// Returns true if distance(point, center) <= radius
```

### Distance Formula

```typescript
function distanceBetweenPoints(a: Point, b: Point): number
dx = a.x - b.x
dy = a.y - b.y
return sqrt(dx² + dy²)
```

---

## Coordinate System

### Normalized Coordinates

- **Range:** 0.0 to 1.0
- **Origin:** Top-left (0, 0)
- **X-axis:** Left to right
- **Y-axis:** Top to bottom

### Clamping

```typescript
function clamp01(value: number): number
// Returns value clamped to [0, 1] range
```

### Margin Safety

- **Default margin:** 0.15 (15%)
- **Effective canvas:** 70% × 70%
- **Prevents edge clipping**

---

## Target Properties

### Target Point Structure

```typescript
interface TargetPoint {
  id: number;
  position: Point;
}

interface Point {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
}
```

---

## Difficulty Levels

### Target Count & Spacing

| Level | Target Count | Min Distance |
|-------|--------------|--------------|
| Easy | 3 | 0.25 |
| Medium | 5 | 0.20 |
| Hard | 8 | 0.15 |

### Target Size

| Level | Radius | Description |
|-------|--------|-------------|
| Easy | 0.08 | Large (easy to hit) |
| Medium | 0.06 | Medium |
| Hard | 0.04 | Small (precision needed) |

---

## Scoring System

### Points per Hit

| Difficulty | Points |
|------------|--------|
| Easy | 10 |
| Medium | 15 |
| Hard | 20 |

### Combo Bonus

- 3 consecutive hits: +5 bonus
- 5 consecutive hits: +10 bonus
- 10 consecutive hits: +25 bonus

---

## Visual Design

### UI Elements

- **Target Display:** Circular targets
- **Hit Marker:** Visual feedback on hit
- **Score Display:** Current score
- **Timer:** Countdown (if timed)
- **Combo Counter:** Consecutive hits

### Target Rendering

| Element | Style |
|---------|-------|
| Target | Concentric circles |
| Hit effect | Explosion/star animation |
| Miss effect | X marker or ripple |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Hit target | playHit() | 'light' |
| Miss | playMiss() | None |
| Combo | playCombo() | 'medium' |
| Game over | playGameOver() | 'heavy' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Coordinate range | 0-1 | Normalized |
| Default margin | 0.15 | Edge padding |
| Max placement attempts | 300 | Per target |
| Fallback enabled | Yes | Prevent deadlock |

---

## Data Structures

### Point

```typescript
interface Point {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
}
```

### Target Point

```typescript
interface TargetPoint {
  id: number;
  position: Point;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `TargetPractice.tsx` | ~ | Main component with game loop |
| `targetPracticeLogic.ts` | 69 | Point generation, hit detection |
| `targetPracticeLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`TargetPractice.tsx`): Game loop, rendering, input
- **Logic** (`targetPracticeLogic.ts`): 69 lines - Point generation, collision detection
- **Tests** (`targetPracticeLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Hand-Eye Coordination**
   - Visual targeting
   - Precision movement
   - Reaction time

2. **Spatial Awareness**
   - Understanding position
   - Distance estimation
   - 2D navigation

3. **Focus & Attention**
   - Target identification
   - Sustained attention
   - Quick reactions

4. **Motor Skills**
   - Pointing accuracy
   - Touch precision
   - Arm movement

---

## Cognitive Concepts Taught

1. **Position** - 2D coordinates
2. **Distance** - Spatial separation
3. **Targeting** - Aim and accuracy
4. **Timing** - Quick reactions
5. **Patterns** - Target distribution

---

## Comparison with Similar Games

| Feature | TargetPractice | HitTarget | NumberBubblePop |
|---------|----------------|-----------|-----------------|
| Domain | Targeting | Targeting | Math + Targeting |
| Age Range | 4-10 | 4-10 | 5-10 |
| Targets | Points | Bubbles | Numbered bubbles |
| Input | Tap/click | Tap/click | Tap/click |
| Scoring | Points + combo | Points | Math scoring |
| Test Coverage | 5 tests | ~ tests | ~ tests |
| Vibe | Energetic | Active | Active |

---

## Example Gameplay

### Easy Level

```
Targets appear:
  🎯 at (0.2, 0.3) - Hit! (+10)
  🎯 at (0.7, 0.5) - Hit! (+10)
  🎯 at (0.5, 0.8) - Hit! (+10)

Score: 30
All targets cleared!
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
