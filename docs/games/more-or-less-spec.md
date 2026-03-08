# More or Less Game Specification

**Game ID:** `more-or-less`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-8 years
**CV Requirements:** None

---

## Overview

More or Less is an educational math game where children compare quantities and identify which group has more or less items.

### Tagline
"Which has MORE? Which has LESS? 🔢"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Two Groups** - Left and right groups of items
2. **Read Question** - "Which has MORE?" or "Which has LESS?"
3. **Compare Counts** - Count items in each group
4. **Select Answer** - Tap left or right group
5. **Get Feedback** - Instant feedback on correctness
6. **Continue** - Next round

### Controls

| Action | Input |
|--------|-------|
| Select group | Click/tap left or right side |
| Start game | Click "Start" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Min Count | Max Count | Description |
|-------|-----------|-----------|-------------|
| 1 | 1 | 5 | Simple quantities |
| 2 | 3 | 8 | Medium range |
| 3 | 5 | 12 | Larger quantities |

---

## Question Generation

### Question Structure

```typescript
interface CompareQuestion {
  left: QuantityGroup;   // Emoji and count
  right: QuantityGroup;  // Emoji and count
  question: 'more' | 'less';  // What to find
}

interface QuantityGroup {
  emoji: string;   // Visual item (e.g., 🍎)
  count: number;   // Number of items
}
```

### Generation Rules

```typescript
// 1. Select random emoji from 10 options
emoji = EMOJIS[random(0, 9)];

// 2. Generate left count (in range for level)
leftCount = random(minCount, maxCount);

// 3. Generate right count (different from left)
rightCount = random(minCount, maxCount);
while (rightCount === leftCount) {
  rightCount = random(minCount, maxCount);
}

// 4. Randomly choose question type
question = random() > 0.5 ? 'more' : 'less';
```

---

## Emojis

### 10 Item Types

| Emoji | Item |
|-------|------|
| 🍎 | Apple |
| 🍊 | Orange |
| 🍋 | Lemon |
| 🍇 | Grapes |
| 🍓 | Strawberry |
| ⭐ | Star |
| 🎈 | Balloon |
| 🦋 | Butterfly |
| 🌸 | Flower |
| 🐱 | Cat |

---

## Answer Logic

### Correct Answer

```typescript
if (question === 'more') {
  correctSide = left.count > right.count ? 'left' : 'right';
} else { // question === 'less'
  correctSide = left.count < right.count ? 'left' : 'right';
}
```

### Examples

| Left | Right | Question | Correct |
|------|-------|----------|---------|
| 3 | 5 | more | Right |
| 3 | 5 | less | Left |
| 7 | 2 | more | Left |
| 7 | 2 | less | Right |

---

## Scoring System

### Score Formula

```typescript
basePoints = 10;
streakBonus = Math.min(streak × 3, 15);
subTotal = basePoints + streakBonus;
multiplier = DIFFICULTY_MULTIPLIERS[level];
totalPoints = Math.floor(subTotal × multiplier);
```

### Score Examples

| Streak | Level 1 (1×) | Level 2 (1.5×) | Level 3 (2×) |
|--------|--------------|-----------------|---------------|
| 0 | 10 | 15 | 20 |
| 1 | 13 | 19 | 26 |
| 2 | 16 | 24 | 32 |
| 5+ | 25 | 37 | 50 |

### Max per Round

50 points (Level 3 with streak 5+)

---

## Visual Design

### UI Elements

- **Question Banner:** "Which has MORE?" or "Which has LESS?"
- **Two Groups:** Left and right displays
- **Items:** Emoji repeated based on count
- **Selection Areas:** Tapable left/right regions
- **Feedback:** Correct/wrong indicators

### Group Visual

| Element | Style |
|---------|-------|
| Items | Emoji repeated in grid/cluster |
| Arrangement | Scattered or grid |
| Count Display | Shown or hidden |
| Background | Distinct areas |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select side | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Levels | 3 | Progressive difficulty |
| Emoji types | 10 | Various items |
| Min count (L1) | 1 | Simple counting |
| Max count (L3) | 12 | Larger quantities |
| Difficulty multipliers | 1×, 1.5×, 2× | By level |

---

## Data Structures

### Quantity Group

```typescript
interface QuantityGroup {
  emoji: string;
  count: number;
}
```

### Compare Question

```typescript
interface CompareQuestion {
  left: QuantityGroup;
  right: QuantityGroup;
  question: 'more' | 'less';
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  minCount: number;
  maxCount: number;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `MoreOrLess.tsx` | ~ | Main component with game loop |
| `moreOrLessLogic.ts` | 69 | Question generation, scoring |
| `moreOrLessLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`MoreOrLess.tsx`): UI, state, game loop, events
- **Logic** (`moreOrLessLogic.ts`): 69 lines - Question generation, validation, scoring
- **Tests** (`moreOrLessLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Counting Skills**
   - One-to-one correspondence
   - Number sequence
   - Counting groups

2. **Comparison Skills**
   - Greater than / less than
   - Quantities comparison
   - Number relationships

3. **Visual Discrimination**
   - Group comparison
   - Size differentiation
   - Visual estimation

4. **Math Vocabulary**
   - "More" concept
   - "Less" concept
   - Comparative language

5. **Critical Thinking**
   - Analyzing quantities
   - Making comparisons
   - Decision making

---

## Math Concepts Taught

1. **Comparison** - More vs less
2. **Counting** - Number of items
3. **Inequality** - Greater than, less than
4. **Number Sense** - Quantity understanding
5. **Reasoning** - Logical comparison

---

## Comparison with Similar Games

| Feature | MoreOrLess | CountingObjects | BubbleCount |
|---------|-----------|-----------------|-------------|
| Domain | Comparison | Counting | Counting |
| Age Range | 3-8 | 3-6 | 3-6 |
| Groups | 2 | 1 | 2-4 |
| Question | More/Less | How many | Which has X |
| Answer | Select side | Type number | Select group |
| Difficulty | 3 levels | 3 levels | 3 levels |
| Scoring | Streak + multiplier | Streak + multiplier | Time bonus |
| Test Coverage | ~ tests | 60 tests | 52 tests |
| Vibe | Chill | Chill | Chill |

---

## Example Gameplay

### Example 1

```
Question: "Which has MORE?"

Left:  🍎🍎🍎  (3)
Right: 🍎🍎🍎🍎🍎 (5)

Answer: Right (5 > 3)
```

### Example 2

```
Question: "Which has LESS?"

Left:  ⭐⭐⭐⭐⭐⭐⭐ (7)
Right: ⭐⭐⭐⭐ (4)

Answer: Right (4 < 7)
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
