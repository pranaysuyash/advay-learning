# Size Sorting Game Specification

**Game ID:** `size-sorting`
**World:** Discovery
**Vibe:** Chill
**Age Range:** 3-6 years
**CV Requirements:** None

---

## Overview

Size Sorting is an early math concepts game where children order objects by size. Players see three objects and must tap them in order from smallest to biggest or biggest to smallest.

### Tagline
"Sort from small to big! Order the objects! 📏"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Instruction** - "Small to Big" or "Big to Small"
2. **Scan Objects** - Three objects shown with emojis
3. **Tap in Order** - Select objects in correct size order
4. **Get Feedback** - Instant feedback on each tap
5. **Complete Round** - Celebration when all three ordered
6. **Continue** - Continue until session ends

### Controls

| Action | Input |
|--------|-------|
| Select object | Click/tap object |
| Start game | Click "Start Sorting" button |
| Next round | Automatic after completion |

---

## Difficulty Levels

### Two Instructions

| Instruction | Difficulty Multiplier | Description |
|-------------|----------------------|-------------|
| Small to Big | 1× | Natural order (easier) |
| Big to Small | 1.5× | Reverse order (harder) |

### Object Sets

| Set | Objects | Size Ranks |
|-----|---------|------------|
| Animals | Mouse 🐭, Cat 🐱, Elephant 🐘 | 1, 2, 3 |
| Nature | Seed 🌱, Tree 🌳, Mountain ⛰️ | 1, 2, 3 |
| Containers | Cup 🥤, Bucket 🪣, Pool 🏊 | 1, 2, 3 |

---

## Scoring System

### Score Formula

```typescript
baseScore = 15;
streakBonus = Math.min(streak × 3, 15);
multiplier = instruction === 'big-to-small' ? 1.5 : 1;
totalPoints = Math.floor((baseScore + streakBonus) × multiplier);
```

### Score Examples

| Streak | Small→Big | Big→Small |
|--------|-----------|-----------|
| 0 | 15 | 23 |
| 1 | 18 | 27 |
| 2 | 21 | 32 |
| 3 | 24 | 36 |
| 5+ | 30 | 45 |

### Max per Round

45 points (big-to-small with streak 5+)

### Penalties

- Wrong pick: Feedback only, streak continues
- Duplicate pick: Rejected with feedback

---

## Round Generation

### Algorithm

```typescript
// 1. Pick random item set
baseSet = ITEM_SETS[random(0, ITEM_SETS.length - 1)];

// 2. Pick random instruction
instruction = random() > 0.5 ? 'small-to-big' : 'big-to-small';

// 3. Shuffle items for display
shuffledItems = shuffle(baseSet);

return {
  instruction,
  items: shuffledItems,
};
```

### Item Structure

```typescript
interface SizeSortItem {
  id: string;        // 'mouse', 'cat', etc.
  label: string;     // 'Mouse', 'Cat', etc.
  emoji: string;     // 🐭, 🐱, 🐘
  sizeRank: number;  // 1 (smallest) to 3 (largest)
}
```

---

## Pick Evaluation

### Validation Logic

```typescript
function evaluateSizeSortingPick(
  round: SizeSortingRound,
  alreadyPickedIds: string[],
  pickedId: string
): SizeSortingPickResult {
  // Reject duplicate picks
  if (alreadyPickedIds.includes(pickedId)) {
    return { ok: false, completed: false, nextExpectedRank: null };
  }

  // Determine expected order based on instruction
  targetRanks = round.items
    .map(i => i.sizeRank)
    .sort((a, b) => instruction === 'small-to-big' ? a - b : b - a);

  nextExpectedRank = targetRanks[alreadyPickedIds.length];
  picked = round.items.find(i => i.id === pickedId);

  // Check if pick matches expected rank
  if (!picked || picked.sizeRank !== nextExpectedRank) {
    return { ok: false, completed: false, nextExpectedRank };
  }

  // Valid pick
  completed = (alreadyPickedIds.length + 1) === round.items.length;
  followUpRank = completed ? null : targetRanks[alreadyPickedIds.length + 1];

  return {
    ok: true,
    completed,
    nextExpectedRank: followUpRank,
  };
}
```

### Pick Result

```typescript
interface SizeSortingPickResult {
  ok: boolean;              // Was the pick correct?
  completed: boolean;       // Is the round complete?
  nextExpectedRank: number | null;  // Expected size rank for next pick
}
```

---

## Visual Design

### UI Elements

- **Instruction Banner**: "Small to Big" or "Big to Small"
- **Object Display**: Three circular emoji buttons
- **Progress Indicator**: 0/3, 1/3, 2/3, 3/3
- **Feedback**: Visual flash for correct/incorrect picks

### Color Scheme

| Element | Colors |
|---------|--------|
| Background | Discovery cream |
| Correct pick | Green glow |
| Wrong pick | Red glow |
| Completed | Celebration animation |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Correct pick | playPop() | 'success' |
| Wrong pick | playError() | 'error' |
| Complete round | playCelebration() | 'celebration' |
| Streak milestone | playCelebration() | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Items per round | 3 | Fixed at 3 items |
| Item sets | 3 | Animals, Nature, Containers |
| Base score | 15 | Points per correct round |
| Streak bonus per | 3 | Points per streak level |
| Max streak bonus | 15 | Cap on streak bonus |
| Easy multiplier | 1× | Small to big |
| Hard multiplier | 1.5× | Big to small |

---

## Data Structures

### Size Sort Item

```typescript
interface SizeSortItem {
  id: string;        // Unique identifier
  label: string;     // Display label
  emoji: string;     // Emoji representation
  sizeRank: number;  // 1 = smallest, 3 = largest
}
```

### Size Sorting Round

```typescript
interface SizeSortingRound {
  instruction: 'small-to-big' | 'big-to-small';
  items: SizeSortItem[];  // Always 3 items, shuffled
}
```

### Size Sorting Pick Result

```typescript
interface SizeSortingPickResult {
  ok: boolean;              // Pick was correct
  completed: boolean;       // Round is complete
  nextExpectedRank: number | null;  // Next expected size rank
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `SizeSorting.tsx` | ~ | Main component with game loop |
| `sizeSortingLogic.ts` | 107 | Round generation, evaluation, scoring |
| `sizeSortingLogic.test.ts` | ~ | Unit tests (target: 30+) |

### Architecture

- **Component** (`SizeSorting.tsx`): UI, state, game loop, events
- **Logic** (`sizeSortingLogic.ts`): Pure functions for rounds, validation, scoring
- **Tests** (`sizeSortingLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Size Concepts**
   - Relative size understanding
   - Size comparison
   - Size vocabulary (small, big, medium)

2. **Seriation**
   - Ordering objects
   - Sequencing skills
   - Logical progression

3. **Visual Discrimination**
   - Size differences
   - Object recognition
   - Visual comparison

4. **Following Directions**
   - Instruction comprehension
   - Order following
   - Task completion

5. **Early Math**
   - Comparison concepts
   - Ordering skills
   - Pattern recognition

---

## Comparison with Similar Games

| Feature | SizeSorting | PatternPlay | NumberTapTrail |
|---------|-------------|-------------|----------------|
| Domain | Size/Order | Patterns | Numbers |
| Age Range | 3-6 | 4-8 | 3-5 |
| CV Required | No | No | No |
| Rounds | Continuous | 5 | 10 |
| Concepts | Size | Patterns | Counting |

---

## Easter Eggs

| Achievement | Condition | Egg |
|-------------|-----------|-----|
| Size Expert | Complete 10 rounds without errors | egg-size-expert |
| Speed Sorter | Complete round in under 5 seconds | egg-speed-sorter |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
