# Color Mixing Game Specification

**Game ID:** `color-mixing`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-8 years
**CV Requirements:** None

---

## Overview

Color Mixing is an educational science game where children learn about color theory by mixing primary colors together. Players select two colors and identify what new color they create when mixed.

### Tagline
"Mix two colors and choose the new color! 🎨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Colors** - Two color buttons shown at top (Color 1, Color 2)
2. **Observe Mixing** - Watch as two colors combine visually
3. **Choose Answer** - Select the correct mixed color from 3 options
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - 8 rounds per session

### Controls

| Action | Input |
|--------|-------|
| Select Color 1 | Click/tap color button |
| Select Color 2 | Click/tap color button |
| Choose mixed color | Click/tap answer button |
| Start game | Click "Start Mixing" button |
| Finish | Click "Finish" button |

---

## Difficulty Levels

### Single Difficulty

| Property | Value |
|----------|-------|
| Levels | 1 (fixed) |
| Rounds per session | 8 |
| Options per round | 3 (Orange, Green, Purple) |

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 2, 15);
totalPoints = basePoints + streakBonus;
```

### Score Examples

| Streak | Bonus | Total |
|--------|-------|-------|
| 0 | 0 | 10 |
| 1 | 2 | 12 |
| 2 | 4 | 14 |
| 3 | 6 | 16 |
| 4 | 8 | 18 |
| 5 | 10 | 20 |
| 7+ | 15 | 25 |

### Max per Round

25 points (10 base + 15 bonus)

### Penalties

- Wrong answer: Streak resets to 0

---

## Color Theory

### Base Colors (Primary)

| Color | Name | Hex | Emoji |
|-------|------|-----|-------|
| red | Red | #EF4444 | 🔴 |
| yellow | Yellow | #FACC15 | 🟡 |
| blue | Blue | #3B82F6 | 🔵 |

### Secondary Colors (Mix Results)

| Mix | Result Name | Result Hex | Result Emoji |
|-----|-------------|------------|--------------|
| Red + Yellow | Orange | #FB923C | 🟠 |
| Yellow + Blue | Green | #22C55E | 🟢 |
| Red + Blue | Purple | #A855F7 | 🟣 |

---

## Round Generation

### Algorithm

```typescript
recipe = random(COLOR_MIX_RECIPES);  // 3 options
options = shuffle(['Orange', 'Green', 'Purple']);
return { recipe, options };
```

### Recipe Structure

```typescript
{
  id: string;           // 'orange', 'green', 'purple'
  left: BaseColorId;    // 'red', 'yellow', or 'blue'
  right: BaseColorId;   // 'red', 'yellow', or 'blue'
  resultName: string;   // 'Orange', 'Green', or 'Purple'
  resultHex: string;    // Mixed color hex
  resultEmoji: string;  // 🟠, 🟢, or 🟣
}
```

---

## Visual Design

### UI Elements

- **Color Selection:** Two 3×2 grids of color buttons
- **Mixing Display:** "🔴 + 🟡 = ?" format
- **Options Grid:** 3 buttons with color names
- **Round Counter:** "Round X / 8"
- **Streak Indicator:** Fire emoji 🔥 with count
- **Feedback Bar:** Shows result message

### Button Styling

| Element | Style |
|---------|-------|
| Color buttons | 3×2 grid, rounded, colored BG |
| Selected state | Dark border (#1F2937) |
| Unselected state | Light border (#F2CC8F) |
| Answer buttons | Rounded, cream BG |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select answer | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Rounds per session | 8 | Total rounds in game |
| Base points | 10 | Points per correct answer |
| Streak bonus per | 2 | Points added per streak level |
| Max streak bonus | 15 | Cap on streak bonus |

---

## Data Structures

### Base Color

```typescript
interface BaseColor {
  id: BaseColorId;      // 'red' | 'yellow' | 'blue'
  name: string;         // 'Red', 'Yellow', 'Blue'
  hex: string;          // Color hex code
  emoji: string;        // 🔴, 🟡, or 🔵
}
```

### Color Mix Recipe

```typescript
interface ColorMixRecipe {
  id: string;           // 'orange', 'green', 'purple'
  left: BaseColorId;    // First primary color
  right: BaseColorId;   // Second primary color
  resultName: string;   // Mixed color name
  resultHex: string;    // Mixed color hex
  resultEmoji: string;  // Mixed color emoji
}
```

### Color Mix Round

```typescript
interface ColorMixRound {
  recipe: ColorMixRecipe;   // The mixing recipe
  options: string[];        // ['Orange', 'Green', 'Purple'] shuffled
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `ColorMixing.tsx` | 278 | Main component with game loop |
| `colorMixingLogic.ts` | 78 | Game logic and utilities |
| `colorMixingLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`ColorMixing.tsx`): UI, state, game loop, events
- **Logic** (`colorMixingLogic.ts`): Pure functions for rounds, validation
- **Tests** (`colorMixingLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Color Theory**
   - Primary color identification
   - Secondary color understanding
   - Color mixing relationships

2. **Scientific Thinking**
   - Prediction and experimentation
   - Observation skills
   - Cause and effect

3. **Visual Literacy**
   - Color recognition
   - Color naming
   - Visual discrimination

4. **Early Science**
   - Understanding how things combine
   - Experimentation mindset
   - Observation of change

5. **Vocabulary**
   - Color names
   - Descriptive words
   - Action verbs (mix, combine)

---

## Comparison with Similar Games

| Feature | ColorMixing | ShapePop | PatternPlay |
|---------|-------------|----------|-------------|
| Domain | Science/Art | Shapes | Patterns |
| Age Range | 4-8 | 3-6 | 4-8 |
| Complexity | Medium | Low | Medium |
| Rounds | 8 | 5 | 5 |
| Vibe | Chill | Chill | Chill |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
