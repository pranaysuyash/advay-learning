# Size Sorting - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `size-sorting`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Logic: `src/frontend/src/games/sizeSortingLogic.ts` (107 lines)
- Tests: `src/frontend/src/games/__tests__/sizeSortingLogic.test.ts` (49 tests)
- Spec: `docs/games/size-sorting-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Size Sorting is an educational game where children sort items by size (smallest-to-largest or largest-to-smallest). The implementation includes 3 item sets (animals, nature, containers) with difficulty-based scoring multipliers.

### Test Coverage
- **49 tests** (excellent)
- **49 tests passing** (100% pass rate)
- Tests cover: item sets, round creation, instruction types, pick evaluation, scoring with multipliers, integration scenarios

---

## Implementation Quality Assessment

### Strengths
1. **3 item sets** - Animals (mouse/cat/elephant), Nature (seed/tree/mountain), Containers (cup/bucket/pool)
2. **2 sorting instructions** - small-to-big (1× multiplier), big-to-small (1.5× multiplier)
3. **Fisher-Yates shuffle** - Randomized item order each round
4. **Deterministic RNG injection** - Allows for predictable testing
5. **Duplicate detection** - Prevents picking same item twice
6. **Pure functional design** - No side effects in logic module

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `sizeSortingLogic.ts` | 107 | Item sets, round generation, pick evaluation, scoring |
| `SizeSorting.tsx` | ~400 | Component with UI and hand tracking |

---

## Test Results

### Passing Tests (49/49) ✅

**ITEM_SETS (8 tests)**
- Has exactly 3 item sets
- Animals set has mouse, cat, elephant
- Nature set has seed, tree, mountain
- Containers set has cup, bucket, pool
- Each item has id, label, emoji, and sizeRank
- sizeRanks are 1, 2, 3 (smallest to largest)
- mouse has rank 1, cat has rank 2, elephant has rank 3

**createSizeSortingRound (7 tests)**
- Creates a round with three items and a valid instruction
- Instruction is small-to-big when RNG > 0.5
- Instruction is big-to-small when RNG <= 0.5
- Items are shuffled (not always in same order)
- Deterministic with same RNG
- All items have unique IDs
- All items have unique sizeRanks
- Produces different rounds on multiple calls

**evaluateSizeSortingPick - small-to-big (6 tests)**
- Accepts correct first pick (smallest)
- Accepts correct second pick (medium)
- Accepts correct final pick and marks completed
- Rejects wrong first pick (largest)
- Rejects wrong second pick
- Rejects duplicate pick

**evaluateSizeSortingPick - big-to-small (4 tests)**
- Accepts correct first pick (largest)
- Accepts correct second pick (medium)
- Accepts correct final pick and marks completed
- Rejects wrong first pick (smallest)

**evaluateSizeSortingPick - duplicate handling (2 tests)**
- Rejects picking same item twice
- Rejects picking already-picked item out of order

**evaluateSizeSortingPick - invalid item (1 test)**
- Handles non-existent item id

**evaluateSizeSortingPick - full game simulation (2 tests)**
- Completes a full small-to-big round
- Completes a full big-to-small round

**calculateScore - small-to-big (6 tests)**
- Returns 15 for streak 0
- Returns 18 for streak 1
- Returns 21 for streak 2
- Returns 24 for streak 3
- Returns 30 for streak 5 (max bonus)
- Returns 30 for streak 10 (capped)

**calculateScore - big-to-small (6 tests)**
- Returns 22 for streak 0 (15 × 1.5 = 22.5 → 22)
- Returns 27 for streak 1 (18 × 1.5 = 27)
- Returns 31 for streak 2 (21 × 1.5 = 31.5 → 31)
- Returns 36 for streak 3 (24 × 1.5 = 36)
- Returns 45 for streak 5 (30 × 1.5 = 45)
- Returns 45 for streak 10 (capped)

**calculateScore - progression (2 tests)**
- small-to-big scores increase by 3 until streak 5
- big-to-small scores plateau after streak 5

**integration scenarios (3 tests)**
- Can simulate a complete game session
- Handles mixed correct and incorrect picks
- Calculates total score for completed round

**type definitions (2 tests)**
- SizeSortItem interface is correctly implemented
- SizeSortingRound interface is correctly implemented

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 107 |
| Exports | 6 (3 interfaces, 3 functions) |
| Test coverage | 49 tests |
| Test pass rate | 100% |
| Item sets | 3 |
| Items per set | 3 |

---

## 3 Item Sets

### Animals

| ID | Label | Emoji | Size Rank |
|----|-------|-------|-----------|
| mouse | Mouse | 🐭 | 1 (smallest) |
| cat | Cat | 🐱 | 2 (medium) |
| elephant | Elephant | 🐘 | 3 (largest) |

### Nature

| ID | Label | Emoji | Size Rank |
|----|-------|-------|-----------|
| seed | Seed | 🌱 | 1 (smallest) |
| tree | Tree | 🌳 | 2 (medium) |
| mountain | Mountain | ⛰️ | 3 (largest) |

### Containers

| ID | Label | Emoji | Size Rank |
|----|-------|-------|-----------|
| cup | Cup | 🥤 | 1 (smallest) |
| bucket | Bucket | 🪣 | 2 (medium) |
| pool | Pool | 🏊 | 3 (largest) |

---

## Key Interfaces

```typescript
interface SizeSortItem {
  id: string;
  label: string;
  emoji: string;
  sizeRank: number;  // 1 = smallest, 3 = largest
}

interface SizeSortingRound {
  instruction: 'small-to-big' | 'big-to-small';
  items: SizeSortItem[];
}

interface SizeSortingPickResult {
  ok: boolean;
  completed: boolean;
  nextExpectedRank: number | null;
}
```

---

## Round Generation Algorithm

```typescript
function createSizeSortingRound(rng: () => number = Math.random): SizeSortingRound {
  const baseSet = ITEM_SETS[Math.floor(rng() * ITEM_SETS.length)];
  const instruction: SizeSortingRound['instruction'] = rng() > 0.5 ? 'small-to-big' : 'big-to-small';
  return {
    instruction,
    items: shuffle(baseSet, rng),
  };
}
```

### Fisher-Yates Shuffle

```typescript
function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
```

---

## Pick Evaluation Algorithm

```typescript
function evaluateSizeSortingPick(
  round: SizeSortingRound,
  alreadyPickedIds: string[],
  pickedId: string,
): SizeSortingPickResult {
  // Check duplicate
  if (alreadyPickedIds.includes(pickedId)) {
    return { ok: false, completed: false, nextExpectedRank: null };
  }

  // Sort ranks by instruction
  const targetRanks = [...round.items]
    .map((item) => item.sizeRank)
    .sort((a, b) =>
      round.instruction === 'small-to-big' ? a - b : b - a,
    );
  const nextExpectedRank = targetRanks[alreadyPickedIds.length] ?? null;
  const picked = round.items.find((item) => item.id === pickedId);

  // Validate pick
  if (!picked || nextExpectedRank === null || picked.sizeRank !== nextExpectedRank) {
    return { ok: false, completed: false, nextExpectedRank };
  }

  const completed = alreadyPickedIds.length + 1 === round.items.length;
  const followUpExpected = completed ? null : targetRanks[alreadyPickedIds.length + 1];

  return { ok: true, completed, nextExpectedRank: followUpExpected };
}
```

---

## Scoring System

### Score Formula

```typescript
baseScore = 15;
streakBonus = Math.min(streak × 3, 15);
multiplier = instruction === 'big-to-small' ? 1.5 : 1;
score = Math.floor((baseScore + streakBonus) × multiplier);
```

### Score Examples

| Instruction | Streak | Base | Bonus | Subtotal | Multiplier | Total |
|-------------|--------|------|-------|----------|------------|-------|
| small-to-big | 0 | 15 | 0 | 15 | 1× | 15 |
| small-to-big | 3 | 15 | 9 | 24 | 1× | 24 |
| small-to-big | 5+ | 15 | 15 | 30 | 1× | 30 |
| big-to-small | 0 | 15 | 0 | 15 | 1.5× | 22 |
| big-to-small | 3 | 15 | 9 | 24 | 1.5× | 36 |
| big-to-small | 5+ | 15 | 15 | 30 | 1.5× | 45 |

### Max Score per Round

- **small-to-big:** 30 points
- **big-to-small:** 45 points

---

## Difficulty Multipliers

| Instruction | Multiplier | Rationale |
|-------------|------------|-----------|
| small-to-big | 1× | Natural ordering, easier for kids |
| big-to-small | 1.5× | Reverse ordering requires more cognitive effort |

---

## Visual Design

### UI Elements

- **Item Cards:** Display emoji + label
- **Instruction Banner:** "Sort from SMALL to BIG" or "Sort from BIG to SMALL"
- **Selection Slots:** 3 empty slots for placing sorted items
- **Hand Cursor:** Visual feedback for drag selection

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Correct pick | playSuccess() | 'success' |
| Wrong pick | playError() | 'error' |
| Round complete | playCelebration() | 'celebration' |

---

## Game Constants

```typescript
const ITEMS_PER_SET = 3;
const TOTAL_SETS = 3;
const BASE_SCORE = 15;
const MAX_STREAK_BONUS = 15;
const STREAK_BONUS_PER_STREAK = 3;
const BIG_TO_SMALL_MULTIPLIER = 1.5;
```

---

## Comparison with Similar Games

| Feature | SizeSorting | PatternMatch | OrderingGame |
|---------|-------------|--------------|--------------|
| Educational Focus | Size comparison | Visual patterns | Sequencing |
| Items per Round | 3 | Varies | 5-8 |
| Scoring | Base + streak + multiplier | Base only | Time-based |
| Difficulty Types | 2 (direction) | 3 | 3 |
| Age Range | 3-6 | 4-8 | 5-10 |

---

## Educational Value

### Skills Developed

1. **Size Comparison** - Understanding relative sizes, biggest/smallest concepts
2. **Sequential Ordering** - Arranging items by attribute, logical sequencing
3. **Cognitive Flexibility** - Handling both ascending and descending orders
4. **Visual Discrimination** - Distinguishing between similar sized items
5. **Vocabulary** - Size words (small, big, medium), animal/nature/container names

---

## Conclusion

Size Sorting is **functionally correct** with excellent test coverage (49 tests). The implementation provides comprehensive size comparison training with 3 themed item sets. The difficulty multiplier for reverse ordering (big-to-small) adds appropriate cognitive challenge for young children.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (49/49)
**Documentation:** COMPLETE ✅
