# Number Tracing Game Specification

**Game ID:** `number-tracing`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** None

---

## Overview

Number Tracing is an educational game where children learn to write numbers by tracing guide points on screen. The game provides visual templates for digits 0-9 and measures tracing accuracy.

### Tagline
"Trace the Numbers! 🔢"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Number** - Display a large digit with guide points
2. **Trace Path** - Follow the dotted guide points
3. **Get Feedback** - Instant accuracy feedback
4. **See Score** - Based on coverage minus hints
5. **Next Number** - Continue to next digit

### Controls

| Action | Input |
|--------|-------|
| Trace | Drag finger/mouse |
| Use hint | Tap hint button |
| Next number | Automatic or tap |

---

## Number Templates

### 10 Digits (0-9)

Each digit has a set of guide points showing the tracing path:

| Digit | Name | Points |
|-------|------|--------|
| 0 | Zero | 7 points (oval) |
| 1 | One | 3 points (vertical line) |
| 2 | Two | 6 points (curve + base) |
| 3 | Three | 5 points (two curves) |
| 4 | Four | 4 points (L + vertical) |
| 5 | Five | 6 points (top + curve) |
| 6 | Six | 7 points (curve + loop) |
| 7 | Seven | 3 points (top + diagonal) |
| 8 | Eight | 9 points (two loops) |
| 9 | Nine | 7 points (loop + tail) |

### Guide Point Format

```typescript
interface TracePoint {
  x: number;  // 0-1 normalized (horizontal position)
  y: number;  // 0-1 normalized (vertical position)
}
```

---

## Accuracy Calculation

### Coverage Algorithm

```typescript
function calculateTraceCoverage(
  strokePoints: TracePoint[],
  templatePoints: TracePoint[],
  tolerance = 0.12
): number

// For each template point:
//   Check if any stroke point is within tolerance distance
//   Count as "covered" if yes

// Coverage = (covered points / total template points) × 100
```

### Default Tolerance

- **0.12** (12% of canvas size)
- Approximately 48 pixels on a 400px canvas
- Forgiving for young children

---

## Scoring System

### Score Formula

```typescript
baseScore = max(0, accuracy)
hintPenalty = min(hintsUsed × 5, 25)
finalScore = max(0, baseScore - hintPenalty)
```

### Score Examples

| Accuracy | Hints | Score |
|----------|-------|-------|
| 100% | 0 | 100 |
| 100% | 1 | 95 |
| 100% | 3 | 85 |
| 100% | 5+ | 75 (capped) |
| 80% | 0 | 80 |
| 80% | 2 | 70 |
| 60% | 1 | 55 |

### Max Hint Penalty

25 points (5 hints max penalty)

---

## Number Progression

### Sequence

```typescript
function nextDigit(current: number): number

// 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 0 → ...
```

### Progression Rules

- Always increments by 1
- Wraps from 9 back to 0
- Negative numbers go to 0
- Numbers > 9 wrap to 0

---

## Visual Design

### UI Elements

- **Number Display:** Large outlined digit
- **Guide Points:** Small dots showing path
- **Stroke Trail:** User's traced path
- **Accuracy Meter:** Visual progress bar
- **Hint Button:** Shows next point
- **Score Display:** Current score

### Number Rendering

| Element | Style |
|---------|-------|
| Number outline | Thick gray line |
| Guide points | Small dots |
| User stroke | Glowing color |
| Covered points | Highlight |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start tracing | playWhoosh() | None |
| Complete point | playDing() | 'light' |
| Complete number | playSuccess() | 'success' |
| Use hint | playHint() | None |
| Perfect score | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Digits | 10 | 0-9 |
| Tolerance | 0.12 | Distance threshold |
| Max hint penalty | 25 | 5 hints × 5 points |
| Progression | Sequential | 0-9 looping |

---

## Data Structures

### Trace Point

```typescript
interface TracePoint {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
}
```

### Number Template

```typescript
interface NumberTemplate {
  digit: number;
  name: string;
  guidePoints: TracePoint[];
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `NumberTracing.tsx` | ~ | Main component with tracing UI |
| `numberTracingLogic.ts` | 61 | Templates, coverage, scoring |
| `numberTracingLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`NumberTracing.tsx`): Canvas, touch handling, feedback
- **Logic** (`numberTracingLogic.ts`): 61 lines - Templates, distance calculation, scoring
- **Tests** (`numberTracingLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Number Recognition**
   - Digit identification
   - Number shapes
   - Visual discrimination

2. **Fine Motor Skills**
   - Hand-eye coordination
   - Precision tracing
   - Muscle memory

3. **Writing Skills**
   - Proper stroke order
   - Number formation
   - Pencil grip equivalent

4. **Spatial Awareness**
   - Following paths
   - Understanding curves
   - Directional movement

---

## Cognitive Concepts Taught

1. **Number Forms** - Digit shapes
2. **Stroke Order** - Writing sequence
3. **Spatial Relations** - 2D path following
4. **Precision** - Accuracy improvement
5. **Sequencing** - 0-9 order

---

## Comparison with Similar Games

| Feature | NumberTracing | LetterTracing | FingerCounting |
|---------|---------------|---------------|----------------|
| Domain | Numbers | Letters | Counting |
| Age Range | 3-6 | 3-6 | 2-5 |
| Templates | 10 digits | 26 letters | 10 hand signs |
| Input | Trace | Trace | Tap |
| Scoring | Coverage | Coverage | Count accuracy |
| Test Coverage | 7 tests | ~ tests | ~ tests |
| Vibe | Chill | Chill | Chill |

---

## Example Gameplay

### Tracing Number 3

```
Guide Points (5):
  (0.3, 0.25) ← Start here
  (0.7, 0.25) ← Top curve
  (0.55, 0.5) ← Middle
  (0.7, 0.75) ← Bottom curve
  (0.3, 0.75) ← End

User traces:
  ✓ Covers all points within tolerance
  ✓ 100% accuracy
  ✓ Score: 100 (no hints)
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
