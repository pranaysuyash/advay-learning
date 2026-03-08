# Odd One Out Game Specification

**Game ID:** `odd-one-out`
**World:** Learning
**Vibe:** Chill
**Age Range:** 4-10 years
**CV Requirements:** None

---

## Overview

Odd One Out is an educational categorization game where children identify which item doesn't belong in a group. Players see 4 items where 3 share a category and 1 is different.

### Tagline
"Which one doesn't belong? 🤔"

---

## Game Mechanics

### Core Gameplay Loop

1. **See 4 Items** - Displayed in grid
2. **Identify Category** - Figure out what 3 have in common
3. **Find Odd One** - Select the different item
4. **Get Feedback** - Instant feedback
5. **Continue** - Next round

### Controls

| Action | Input |
|--------|-------|
| Select item | Click/tap item |
| Start game | Click "Start" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Rounds | Time/Round | Pass Threshold | Description |
|-------|--------|------------|----------------|-------------|
| 1 | 6 | 25s | 4/6 | Simple categories |
| 2 | 8 | 20s | 6/8 | Medium categories |
| 3 | 10 | 15s | 8/10 | Complex categories |

---

## Categories

### 8 Category Banks

| Category | Items | Count |
|----------|-------|-------|
| fruits | Apple, Banana, Orange, Grapes, Watermelon, Strawberry, Pineapple, Mango | 8 |
| animals | Dog, Cat, Bird, Fish, Rabbit, Elephant, Lion, Monkey | 8 |
| colors | Red, Blue, Green, Yellow, Purple, Orange | 6 |
| shapes | Circle, Square, Triangle, Star, Heart, Diamond | 6 |
| vehicles | Car, Bus, Train, Airplane, Boat, Bicycle | 6 |
| food | Pizza, Burger, Ice Cream, Cake, Cookie, Bread | 6 |
| clothing | Shirt, Pants, Dress, Hat, Shoes, Socks | 6 |
| nature | Sun, Moon, Star, Cloud, Rain, Tree | 6 |

### Item Properties

```typescript
interface OddItem {
  name: string;      // Display name
  emoji: string;     // Visual emoji
  category: string; // Category for grouping
}
```

---

## Round Generation

### Algorithm

```typescript
function buildOddOneOutRound(level, usedCategories, random = Math.random) {
  // Select category not recently used
  availableCategories = CATEGORY_NAMES.filter(c => !usedCategories.includes(c));
  category = randomSelection(availableCategories);

  // Get 3 items from category
  items = CATEGORY_BANKS[category];
  shuffled = shuffle(items);
  sameItems = shuffled.slice(0, 3);

  // Get 1 item from different category
  differentCategories = CATEGORY_NAMES.filter(c => c !== category);
  oddCategory = randomSelection(differentCategories);
  oddPool = CATEGORY_BANKS[oddCategory];
  oddItem = randomSelection(oddPool);

  // Combine and shuffle
  allItems = shuffle([...sameItems, oddItem]);

  return { items: allItems, oddItem, category };
}
```

### Level Category Selection

```typescript
// Level 1: fruits, animals, colors (3 categories)
getCategoriesForLevel(1) => ['fruits', 'animals', 'colors']

// Level 2: fruits, animals, colors, shapes, vehicles (5 categories)
getCategoriesForLevel(2) => ['fruits', 'animals', 'colors', 'shapes', 'vehicles']

// Level 3: All 8 categories
getCategoriesForLevel(3) => CATEGORY_NAMES
```

---

## Answer Checking

### Algorithm

```typescript
function checkAnswer(selectedItem, oddItem): boolean {
  return selectedItem.name === oddItem.name;
}
```

---

## Scoring System

### Score Formula

```typescript
if (!correct) return 0;

baseScore = 20;
timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 5));
return Math.min(25, baseScore + timeBonus);
```

### Score Examples

| Time Used | Time Left | Score |
|----------|-----------|-------|
| 25s (0 left) | 0s | 20 |
| 20s (5 left) | 5s | 21 |
| 15s (10 left) | 10s | 22 |
| 10s (15 left) | 15s | 23 |
| 5s (20 left) | 20s | 24 |
| 0s (25 left) | 25s | 25 (capped) |

### Max per Round

25 points (base 20 + max time bonus 5)

---

## Visual Design

### UI Elements

- **Question:** "Which one doesn't belong?"
- **Items Grid:** 2×2 grid of items
- **Timer:** Countdown per round
- **Score Display:** Current score
- **Round Counter:** "Round X / Y"

### Item Display

| Element | Style |
|---------|-------|
| Items | Large emoji + name |
| Grid | 2×2 arrangement |
| Selection | Highlight on tap |
| Correct | Green glow |
| Wrong | Red shake |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select item | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Round complete | playSuccess() | None |
| Game complete | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Levels | 3 | Progressive difficulty |
| Items per round | 4 | Fixed |
| Same category items | 3 | Always |
| Odd category items | 1 | Always |
| Time limits | 25s/20s/15s | By level |
| Pass thresholds | 4/6, 6/8, 8/10 | By level |

---

## Data Structures

### Odd Item

```typescript
interface OddItem {
  name: string;
  emoji: string;
  category: string;
}
```

### Round Data

```typescript
interface OddOneOutRound {
  items: OddItem[];    // 4 items (shuffled)
  oddItem: OddItem;   // The one that's different
  category: string;    // The common category (for the 3)
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;
  roundCount: number;
  timePerRound: number;
  passThreshold: number;
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `OddOneOut.tsx` | ~ | Main component with game loop |
| `oddOneOutLogic.ts` | 180 | Category banks, round generation |
| `oddOneOutLogic.test.ts` | 550 | Unit tests (62 tests, 100% passing) |

### Architecture

- **Component** (`OddOneOut.tsx`): UI, state, game loop, timer
- **Logic** (`oddOneOutLogic.ts`): 180 lines - Category banks, round generation, scoring
- **Tests** (`oddOneOutLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Categorization**
   - Grouping items
   - Finding similarities
   - Pattern recognition

2. **Critical Thinking**
   - Analysis and deduction
   - Rule identification
   - Problem solving

3. **Visual Discrimination**
   - Item comparison
   - Feature identification
   - Attention to detail

4. **Language Development**
   - Category vocabulary
   - Item names
   - Descriptive words

5. **Memory**
   - Category knowledge
   - Item associations
   - Recall skills

---

## Cognitive Concepts Taught

1. **Classification** - Grouping by properties
2. **Differentiation** - Finding differences
3. **Attributes** - Color, shape, function
4. **Categories** - Natural groupings
5. **Odd One Out** - Logic puzzle concept

---

## Comparison with Similar Games

| Feature | OddOneOut | SameAndDifferent | ShadowMatch |
|---------|-----------|------------------|-------------|
| Domain | Categorization | Comparison | Matching |
| Age Range | 4-10 | 3-8 | 4-10 |
| Items per round | 4 | 2 | Variable |
| Question | Which different? | Same or different? | Find shadow |
| Input | Tap item | Tap button | Tap/touch |
| Difficulty | 3 levels | 1 level | 3 levels |
| Categories | 9 | N/A | 12+ |
| Test Coverage | ~ tests | ~ tests | ~ tests |
| Vibe | Chill | Chill | Chill |

---

## Example Gameplay

### Example 1

```
Question: "Which one doesn't belong?"

┌─────┬─────┐
│ 🍎  │ 🐱  │
│Apple│ Cat │
├─────┼─────┤
│ 🍊  │ 🍇  │
│Orange│Grapes│
└─────┴─────┘

Answer: 🐱 (Cat - not a fruit)
```

### Example 2

```
Question: "Which one doesn't belong?"

┌─────┬─────┐
│ 🔴  │ 🔵  │
│Red  │Blue │
├─────┼─────┤
│ 🟢  │ ⭐  │
│Green│Star │
└─────┴─────┘

Answer: ⭐ (Star - not a color)
```

---

## Category Progression

### By Level

**Level 1 (Simple)**
- fruits: Apple, Banana, Orange, Grapes...
- animals: Dog, Cat, Bird, Fish...
- colors: Red, Blue, Green, Yellow...

**Level 2 (Medium)**
- shapes: Circle, Square, Triangle, Star...
- vehicles: Car, Bus, Train, Airplane...
- (includes all Level 1 categories)

**Level 3 (Challenging)**
- food: Pizza, Burger, Ice Cream...
- clothing: Shirt, Pants, Dress, Hat...
- nature: Sun, Moon, Star, Cloud...
- (all 9 categories available)

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
