# Color By Number Game Specification

**Game ID:** `color-by-number`
**World:** Creative
**Vibe:** Chill
**Age Range:** 4-10 years
**CV Requirements:** None

---

## Overview

Color By Number is a creative coloring game where children match numbered colors to numbered regions on templates. The game teaches number recognition and color matching.

### Tagline
"Match and Color! 🎨"

---

## Game Mechanics

### Core Gameplay Loop

1. **Select Template** - Choose a picture (butterfly, fish, rocket)
2. **Select Color** - Pick a numbered color
3. **Paint Region** - Tap matching numbered region
4. **Get Feedback** - Correct paints region, wrong deducts points
5. **Complete Picture** - Finish all regions

### Controls

| Action | Input |
|--------|-------|
| Select color | Tap color palette button |
| Paint region | Tap numbered region |
| Next template | Auto after completion |

---

## Color Palette

### 4 Colors

| Number | Label | Color |
|--------|-------|-------|
| 1 | Sky Blue | #60A5FA |
| 2 | Sun Yellow | #FACC15 |
| 3 | Leaf Green | #4ADE80 |
| 4 | Berry Pink | #F472B6 |

### Color Palette Entry

```typescript
interface ColorPaletteEntry {
  number: number;
  label: string;
  color: string;
}
```

---

## Templates

### 3 Templates

#### Butterfly Garden (8 regions)
| Region ID | Label | Number |
|-----------|-------|--------|
| wing-top-left | Top Left Wing | 1 |
| wing-top-right | Top Right Wing | 1 |
| wing-bottom-left | Bottom Left Wing | 4 |
| wing-bottom-right | Bottom Right Wing | 4 |
| body | Butterfly Body | 3 |
| flower-left | Left Flower | 2 |
| flower-right | Right Flower | 2 |
| leaf | Leaf | 3 |

#### Happy Fish (8 regions)
| Region ID | Label | Number |
|-----------|-------|--------|
| body | Fish Body | 1 |
| tail | Fish Tail | 4 |
| fin-top | Top Fin | 2 |
| fin-bottom | Bottom Fin | 2 |
| eye | Fish Eye | 3 |
| bubble-1 | Bubble One | 1 |
| bubble-2 | Bubble Two | 1 |
| seaweed | Seaweed | 3 |

#### Rocket Trip (8 regions)
| Region ID | Label | Number |
|-----------|-------|--------|
| rocket-body | Rocket Body | 1 |
| window | Window | 2 |
| nose | Rocket Nose | 4 |
| left-fin | Left Fin | 3 |
| right-fin | Right Fin | 3 |
| flame-top | Flame Top | 2 |
| flame-bottom | Flame Bottom | 4 |
| star | Star | 2 |

---

## Game State

### State Structure

```typescript
interface ColorByNumberState {
  selectedNumber: number | null;
  regions: ColorRegion[];
  score: number;
  mistakes: number;
  moves: number;
  streak: number;
  maxStreak: number;
  completed: boolean;
}
```

---

## Paint Results

### Result Types

| Result | Description | Score Change |
|--------|-------------|--------------|
| correct | Right color selected | +10 to +15 |
| wrong-number | Wrong color | -2 |
| no-color-selected | No color picked | 0 |
| already-painted | Region already done | 0 |
| missing-region | Invalid region ID | 0 |

---

## Scoring System

### Base Scoring

```typescript
baseScore = 10
streakBonus = min(streak, 5)
moveScore = baseScore + streakBonus
```

### Completion Bonus

```typescript
completionBonus = 20 (when last region painted)
```

### Wrong Answer Penalty

```typescript
wrongPenalty = -2
streak = 0 (reset)
```

### Score Examples

| Streak | Base | Bonus | Total |
|--------|------|-------|-------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 1 | 11 |
| 3 | 10 | 3 | 13 |
| 5+ | 10 | 5 (capped) | 15 |
| Complete | - | - | +20 bonus |

---

## Star Rating

### Stars by Mistakes

| Mistakes | Stars |
|----------|-------|
| 0-1 | ⭐⭐⭐ (3 stars) |
| 2-3 | ⭐⭐ (2 stars) |
| 4+ | ⭐ (1 star) |
| Incomplete | ☆ (0 stars) |

---

## Helper Functions

### Completion Percentage

```typescript
function getCompletionPercent(state: ColorByNumberState): number
return (paintedRegions / totalRegions) × 100
```

### Remaining Count

```typescript
function getRemainingCountByNumber(
  state: ColorByNumberState,
  number: number
): number
// Returns unpainted regions with given number
```

### Suggested Number

```typescript
function getSuggestedNumber(state: ColorByNumberState): number | null
// Returns number with most remaining unpainted regions
```

---

## Level Summary

### Summary Structure

```typescript
interface LevelSummary {
  score: number;
  mistakes: number;
  completionPercent: number;
  stars: number;
}
```

---

## Visual Design

### UI Elements

- **Template Display:** Outline picture with numbered regions
- **Color Palette:** 4 color buttons with numbers
- **Selected Indicator:** Highlighted color
- **Score Display:** Current score
- **Progress Bar:** Completion percentage
- **Star Rating:** 0-3 stars

### Region States

| State | Appearance |
|-------|------------|
| Unpainted | White with number outline |
| Painted | Filled with color |
| Selected | Highlighted border |
| Wrong painted | Shake animation |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Select color | playClick() | None |
| Correct paint | playSuccess() | 'light' |
| Wrong paint | playError() | 'error' |
| Complete picture | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Colors | 4 | Numbered palette |
| Templates | 3 | Butterfly, Fish, Rocket |
| Base score | 10 | Per correct paint |
| Max streak bonus | 5 | Capped |
| Completion bonus | 20 | One-time |
| Wrong penalty | -2 | Per mistake |

---

## Data Structures

### Color Region

```typescript
interface ColorRegion {
  id: string;
  label: string;
  number: number;
  painted: boolean;
}
```

### Template

```typescript
interface ColorByNumberTemplate {
  id: string;
  name: string;
  regions: ColorRegion[];
}
```

### Paint Result

```typescript
type PaintResult =
  | 'correct'
  | 'wrong-number'
  | 'no-color-selected'
  | 'already-painted'
  | 'missing-region';
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `ColorByNumber.tsx` | ~ | Main component with painting UI |
| `colorByNumberLogic.ts` | 223 | State, painting, scoring, templates |
| `colorByNumberLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`ColorByNumber.tsx`): Template rendering, touch handling
- **Logic** (`colorByNumberLogic.ts`): 223 lines - State management, painting, scoring
- **Tests** (`colorByNumberLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Number Recognition**
   - Identifying numbers 1-4
   - Number matching
   - Visual discrimination

2. **Color Matching**
   - Color-number association
   - Color recognition
   - Following directions

3. **Fine Motor Skills**
   - Precision tapping
   - Hand-eye coordination
   - Touch accuracy

4. **Completion Skills**
   - Task persistence
   - Attention to detail
   - Following through

---

## Cognitive Concepts Taught

1. **Number Symbols** - Digit recognition
2. **Matching** - Number to color
3. **Regions** - Spatial areas
4. **Planning** - Efficient color selection
5. **Completion** - Finishing tasks

---

## Comparison with Similar Games

| Feature | ColorByNumber | ColorByNumber | ColorMatchGarden |
|---------|---------------|---------------|-----------------|
| Domain | Number+Color | Coloring | Color Matching |
| Age Range | 4-10 | 4-10 | 3-8 |
| Input | Tap region | Tap | Drag/tap |
| Colors | 4 numbered | Variable | Color matching |
| Templates | 3 | Many | 1 per level |
| Test Coverage | 8 tests | ~ tests | ~ tests |
| Vibe | Chill | Chill | Chill |

---

## Example Gameplay

### Butterfly Template

```
1. Select Color #2 (Yellow)
2. Tap "flower-left" region (#2) → Correct! (+11)
3. Tap "flower-right" region (#2) → Correct! (+12)
4. Select Color #3 (Green)
5. Tap "body" region (#3) → Correct! (+13)
6. Tap "leaf" region (#3) → Correct! (+14)
...
8. All regions complete → +20 bonus!

Final Score: ~100+ (depending on streak)
Mistakes: 0-1
Stars: ⭐⭐⭐
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
