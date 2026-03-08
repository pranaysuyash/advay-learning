# Fraction Pizza Game Specification

**Game ID:** `fraction-pizza`
**World:** Learning
**Vibe:** Chill
**Age Range:** 5-10 years
**CV Requirements:** None

---

## Overview

Fraction Pizza is an educational math game where children learn about fractions through pizza slices. Players see a fraction representation and must select the correct fraction from multiple options.

### Tagline
"Learn fractions with pizza! 🍕"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Fraction** - "What fraction is this?"
2. **View Pizza** - Visual pizza with slices
3. **Select Answer** - Choose correct fraction from options
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - Next round

### Controls

| Action | Input |
|--------|-------|
| Select fraction | Click/tap fraction button |
| Start game | Click "Start" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Max Denominator | Description |
|-------|-----------------|-------------|
| 1 | 2 | Halves only (1/2) |
| 2 | 4 | Up to quarters (1/2, 1/4, 3/4) |
| 3 | 8 | Up to eighths (1/2, 1/4, 3/4, 1/8, etc.) |

---

## Fractions

### Fraction Structure

```typescript
interface Fraction {
  numerator: number;      // Top number (1 to denominator-1)
  denominator: number;   // Bottom number (2 to 8)
}
```

### Generation Rules

```typescript
// Level 1 (max denominator: 2)
// - Denominator: 2
// - Numerator: 1
// - Results: 1/2

// Level 2 (max denominator: 4)
// - Denominator: 2 to 4
// - Numerator: 1 to denominator-1
// - Results: 1/2, 1/3, 2/3, 1/4, 2/4, 3/4

// Level 3 (max denominator: 8)
// - Denominator: 2 to 8
// - Numerator: 1 to denominator-1
// - Results: Various fractions up to 7/8
```

---

## Option Generation

### Algorithm

```typescript
options = [correct];

while (options.length < 4) {
  denom = random(2, 8);
  num = random(1, denom);

  // Check for duplicate value (within 0.01)
  val2 = num / denom;
  isDuplicate = options.some(opt => |opt.value - val2| < 0.01);

  // Check for too similar to correct (within 0.05)
  val1 = correct.numerator / correct.denominator;
  isTooSimilar = |val1 - val2| < 0.05;

  if (!isDuplicate && !isTooSimilar) {
    options.push({ numerator: num, denominator: denom });
  }
}

// Shuffle and format as "num/denom"
return shuffle(options).map(f => `${f.numerator}/${f.denominator}`);
```

### Option Properties

- **Count:** 4 options per round
- **Format:** "numerator/denominator" (e.g., "1/2")
- **Includes:** Always includes correct answer
- **Unique:** No duplicate values
- **Distinct:** Options are distinct from correct answer (>5% difference)

---

## Visual Design

### UI Elements

- **Question:** "What fraction is this?"
- **Pizza Display:** Circle divided into slices
- **Slices Colored:** Different colors for numerator vs denominator
- **Options Grid:** 4 fraction buttons
- **Feedback:** Correct/wrong indicators

### Pizza Visual

| Element | Style |
|---------|-------|
| Shape | Circle |
| Slices | Evenly divided |
| Numerator | Highlighted/filled |
| Denominator | Outlined/empty |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select fraction | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Levels | 3 | Progressive difficulty |
| Options per round | 4 | Multiple choice |
| Max denominator (L1) | 2 | Simple fractions |
| Max denominator (L2) | 4 | Medium fractions |
| Max denominator (L3) | 8 | Complex fractions |
| Value similarity threshold | 0.05 | Minimum difference between options |
| Duplicate threshold | 0.01 | For detecting equivalent fractions |

---

## Data Structures

### Fraction

```typescript
interface Fraction {
  numerator: number;
  denominator: number;
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  maxDenominator: number;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `FractionPizza.tsx` | ~ | Main component with game loop |
| `fractionPizzaLogic.ts` | 56 | Fraction generation, options |
| `fractionPizzaLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`FractionPizza.tsx`): UI, state, game loop, events
- **Logic** (`fractionPizzaLogic.ts`): 56 lines - Fraction generation, validation, options
- **Tests** (`fractionPizzaLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Fraction Understanding**
   - Numerator/denominator concepts
   - Part-whole relationship
   - Visual representation

2. **Math Skills**
   - Number sense
   - Division concepts
   - Fraction comparison

3. **Visual Learning**
   - Seeing fractions as shapes
   - Pizza slice visualization
   - Area models

4. **Number Recognition**
   - Fraction notation
   - Reading "a over b"
   - Symbol understanding

5. **Critical Thinking**
   - Comparing options
   - Selecting correct representation
   - Reasoning about parts

---

## Fraction Concepts Taught

1. **Denominator** - Total number of parts
2. **Numerator** - Number of selected parts
3. **Part-Whole** - Relationship of parts to whole
4. **Equivalent Fractions** - Different representations of same value
5. **Fraction Comparison** - Greater than, less than

---

## Comparison with Similar Games

| Feature | FractionPizza | MathMonsters | MathSmash |
|---------|---------------|--------------|------------|
| Domain | Fractions | Arithmetic | Operations |
| Age Range | 5-10 | 5-10 | 6-12 |
| Visual | Pizza slices | Monsters | Expression |
| Input | Select fraction | Type answer | Smash operator |
| Difficulty | 3 levels | 3 levels | 3 levels |
| Test Coverage | ~ tests | 52 tests | ~ tests |
| Vibe | Chill | Active | Active |

---

## Example Gameplay

### Level 1 Example

```
Question: "What fraction is this?"

Pizza Display:  ◐  (half filled)
              /  \
             |  🧀 |

Options:
[1/2]  [1/3]  [2/3]  [1/4]

Answer: 1/2
```

### Level 3 Example

```
Question: "What fraction is this?"

Pizza Display:  ◕  (5 of 8 slices filled)

Options:
[3/8]  [5/8]  [1/2]  [3/4]

Answer: 5/8
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
