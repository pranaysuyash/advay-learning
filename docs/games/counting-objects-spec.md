# Counting Objects Game Specification

**Game ID:** `counting-objects`
**World:** Learning
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** None

---

## Overview

Counting Objects is an early math game where children count items displayed on screen. Players see a collection of objects and must select the correct number from multiple options.

### Tagline
"How many do you see? Count them all! 🔢"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Scene** - Collection of objects displayed
2. **Read Question** - "How many [item] do you see?"
3. **Count Objects** - Count the target items
4. **Select Answer** - Choose correct number from options
5. **Get Feedback** - Instant feedback on correctness
6. **Continue** - 5 rounds per session

### Controls

| Action | Input |
|--------|-------|
| Select number | Click/tap number button |
| Start game | Click "Start Counting" button |
| Next round | Automatic after feedback |

---

## Difficulty Levels

### 3 Levels

| Level | Min Count | Max Count | Item Types | Description |
|-------|-----------|-----------|------------|-------------|
| 1 | 1 | 5 | 2 types | Simple counting |
| 2 | 3 | 8 | 3 types | More items |
| 3 | 5 | 10 | 4 types | Challenging counts |

### Difficulty Multipliers

- Level 1 (1-5 count): 1× multiplier
- Level 2 (3-8 count): 1.5× multiplier
- Level 3 (5-10 count): 2× multiplier

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

| Streak | Level 1 | Level 2 | Level 3 |
|--------|---------|---------|---------|
| 0 | 10 | 15 | 20 |
| 1 | 13 | 19 | 26 |
| 2 | 16 | 24 | 32 |
| 5+ | 25 | 37 | 50 |

### Max per Round

50 points (Level 3 with streak 5+)

---

## Countable Items

### 10 Item Types

| Emoji | Name |
|-------|------|
| 🍎 | Apples |
| 🍊 | Oranges |
| 🍋 | Lemons |
| 🍇 | Grapes |
| 🍓 | Strawberries |
| 🌸 | Flowers |
| 🦋 | Butterflies |
| 🐞 | Ladybugs |
| ⭐ | Stars |
| 🎈 | Balloons |

---

## Scene Generation

### Algorithm

```typescript
// 1. Get level config
config = getLevelConfig(level);

// 2. Select item types
shuffled = shuffle(ITEMS);
selected = shuffled.slice(0, config.itemTypes);

// 3. Generate counts for each type
items = selected.map(item => ({
  emoji: item.emoji,
  count: random(config.minCount, config.maxCount),
}));

// 4. Select target item
targetIndex = random(0, items.length - 1);
targetItem = selected[targetIndex].name;
answer = items[targetIndex].count;

return { items, targetItem, answer };
```

### Example Scene

```
Question: "How many apples do you see?"

Scene:
🍎🍎🍎  🍊🍊  🍋
(count: 3) (count: 2) (count: 1)

Options: [2] [3] [4] [5]
Answer: 3
```

---

## Visual Design

### UI Elements

- **Question Banner:** "How many [item] do you see?"
- **Scene Display:** Objects arranged randomly
- **Options Grid:** 4 number buttons
- **Round Counter:** "Round X / 5"
- **Streak Indicator:** Fire emoji 🔥 with count
- **Feedback Bar:** Shows result message

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Learning cream |
| Question text | Large, readable |
| Correct hit | Green glow |
| Wrong hit | Red glow |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select answer | playClick() | None |
| Correct | playPop() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |
| Count milestone | playSuccess() | 'success' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Rounds per session | 5 | Total rounds in game |
| Base points | 10 | Points per correct answer |
| Streak bonus per | 3 | Points per streak level |
| Max streak bonus | 15 | Cap on streak bonus |
| Options per round | 4 | Number of answer choices |
| Item types available | 10 | Total countable items |

---

## Data Structures

### Count Item

```typescript
interface CountItem {
  emoji: string;  // Visual representation
  name: string;   // Display name (plural)
}
```

### Counting Scene

```typescript
interface CountingScene {
  items: { emoji: string; count: number }[];  // Objects with counts
  targetItem: string;                         // Name of item to count
  answer: number;                             // Correct count
}
```

### Level Config

```typescript
interface LevelConfig {
  level: number;      // 1, 2, or 3
  minCount: number;   // Minimum items per type
  maxCount: number;   // Maximum items per type
  itemTypes: number;  // Number of different items
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `CountingObjects.tsx` | ~ | Main component with game loop |
| `countingObjectsLogic.ts` | 86 | Scene generation, scoring |
| `countingObjectsLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`CountingObjects.tsx`): UI, state, game loop, events
- **Logic** (`countingObjectsLogic.ts`): Scene generation, validation, scoring
- **Tests** (`countingObjectsLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Counting Skills**
   - One-to-one correspondence
   - Number sequence
   - Cardinality principle

2. **Number Recognition**
   - Digit identification
   - Number-quantity matching
   - Numerical symbols

3. **Visual Discrimination**
   - Object type recognition
   - Focus on target items
   - Filtering distractions

4. **Early Math**
   - Quantity understanding
   - Number sense
   - Comparison skills

5. **Language Development**
   - Item names
   - Question comprehension
   - Number vocabulary

---

## Counting Principles Taught

1. **One-to-One** - Each object counted once
2. **Stable Order** - Count in consistent order
3. **Cardinality** - Last number is total count
4. **Abstraction** - Same count regardless of arrangement
5. **Order Irrelevance** - Count left-right, right-left, etc.

---

## Comparison with Similar Games

| Feature | CountingObjects | NumberTapTrail | BubbleCount |
|---------|-----------------|----------------|-------------|
| Domain | Counting | Numbers | Counting |
| Age Range | 3-6 | 3-5 | 3-6 |
| Objects | Emojis | Tap targets | Bubbles |
| Difficulty | 3 levels | 1 level | 1 level |
| Multiplier | Yes | No | No |

---

## Easter Eggs

| Achievement | Condition | Egg |
|-------------|-----------|-----|
| Counting Star | Complete with 100% accuracy | egg-counting-star |
| Speed Counter | Complete round in under 5 seconds | egg-speed-counter |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
