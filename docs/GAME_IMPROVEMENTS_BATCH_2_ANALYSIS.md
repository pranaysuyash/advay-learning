# Game Improvements Batch 2 - Analysis & Implementation

> **Batch**: 5 Games (Size Sorting, Odd One Out, Counting Objects, Number Sequence, More Or Less)  
> **Ticket**: TCK-20260303-008 :: Game Improvements Batch 2  
> **Ticket Stamp**: STAMP-20260303T110835Z-codex-axny  
> **Created**: 2026-03-03  

---

## 1. Size Sorting

### 1.1 Current Implementation
**Files**: `SizeSorting.tsx`, `sizeSortingLogic.ts`

**Current Mechanics:**
- Sort 3 items by size (small-to-big or big-to-small)
- Fixed +25 points per completed round
- 6 rounds per session
- No streak system
- No difficulty levels (just random item sets)

**Current Scoring (line 73):**
```typescript
const nextScore = score + 25;  // Fixed 25 points
```

### 1.2 Improvement Plan

**Add to sizeSortingLogic.ts:**
```typescript
// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS = {
  instruction: 1,      // small-to-big (easier)
  2: 1.5,              // big-to-small (harder for kids)
};

// Calculate score based on streak and instruction type
export function calculateScore(
  streak: number,
  instruction: 'small-to-big' | 'big-to-small'
): number {
  const baseScore = 15;
  const streakBonus = Math.min(streak * 3, 15);
  const multiplier = instruction === 'small-to-big' ? 1 : 1.5;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
```

**Add to SizeSorting.tsx:**
- Streak state (consecutive correct rounds)
- Max streak tracking
- Kenney heart HUD
- Score popups
- Haptic feedback
- Streak milestones (every 5 rounds)

---

## 2. Odd One Out

### 2.1 Current Implementation
**Files**: `OddOneOut.tsx`, `oddOneOutLogic.ts`

**Current Mechanics:**
- Pick the item that doesn't belong
- 3 difficulty levels with different round counts
- Time-based scoring (already has `calculateScore`)
- No streak system

**Current Scoring (line 66):**
```typescript
const roundScore = calculateScore(isCorrect, 5, levelConfig.timePerRound);
// Logic: base 20 + time bonus up to 5 = max 25
```

### 2.2 Improvement Plan

**Modify scoring in OddOneOut.tsx:**
- Add streak bonus on top of time-based score
- Streak bonus: +3 per consecutive correct, max +15
- Streak HUD with hearts
- Haptic feedback
- Streak milestone celebrations

**New calculateScore in component:**
```typescript
function calculateRoundScore(
  isCorrect: boolean,
  timeUsed: number,
  timeLimit: number,
  streak: number
): number {
  if (!isCorrect) return 0;
  const baseScore = 15;
  const timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 5));
  const streakBonus = Math.min(streak * 3, 15);
  return Math.min(35, baseScore + timeBonus + streakBonus);
}
```

---

## 3. Counting Objects

### 3.1 Current Implementation
**Files**: `CountingObjects.tsx`, `countingObjectsLogic.ts`

**Current Mechanics:**
- Count items in a scene
- Fixed +20 points per correct answer
- 3 difficulty levels (different count ranges)
- No streak system

**Current Scoring (line 55):**
```typescript
setScore((s) => s + 20);  // Fixed 20 points
```

### 3.2 Improvement Plan

**Add to countingObjectsLogic.ts:**
```typescript
// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-5 count
  2: 1.5,  // 3-8 count
  3: 2,    // 5-10 count
};

export function calculateScore(streak: number, level: number): number {
  const baseScore = 10;
  const streakBonus = Math.min(streak * 3, 15);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
```

**Add to CountingObjects.tsx:**
- Streak state
- Max streak tracking
- Kenney heart HUD
- Score popups
- Haptic feedback
- Streak milestones

---

## 4. Number Sequence

### 4.1 Current Implementation
**Files**: `NumberSequence.tsx`, `numberSequenceLogic.ts`

**Analysis needed:**
- Check current scoring mechanism
- Identify if streak system exists

### 4.2 Expected Improvements
- Add combo scoring if not present
- Kenney heart HUD
- Haptic feedback
- Streak tracking

---

## 5. More Or Less

### 5.1 Current Implementation
**Files**: `MoreOrLess.tsx`, `moreOrLessLogic.ts`

**Analysis needed:**
- Check current scoring mechanism
- Identify if streak system exists

### 5.2 Expected Improvements
- Add combo scoring if not present
- Kenney heart HUD
- Haptic feedback
- Streak tracking

---

## Implementation Progress - ALL COMPLETE ✅

### Size Sorting ✅ COMPLETE
- [x] `calculateScore()` added to logic file
- [x] Streak state variables added
- [x] Max streak tracking added
- [x] Score popup state added
- [x] Streak milestone state added
- [x] `triggerHaptic` imported
- [x] Streak HUD with Kenney hearts implemented
- [x] Score popups implemented
- [x] Streak milestones implemented
- [x] Haptic feedback added
- [x] Stats section with max streak added
- [x] TypeScript compilation passes

### Odd One Out ✅ COMPLETE
- [x] Updated scoring with streak bonus
- [x] Streak state variables added
- [x] Max streak tracking added
- [x] Score popup state added
- [x] Streak milestone state added
- [x] `triggerHaptic` imported
- [x] Streak HUD implemented
- [x] Score popups implemented
- [x] Streak milestones implemented
- [x] Haptic feedback added
- [x] Results screen updated with star badge
- [x] TypeScript compilation passes

### Counting Objects ✅ COMPLETE
- [x] `calculateScore()` added to logic file
- [x] Streak state variables added
- [x] Max streak tracking added
- [x] Score popup state added
- [x] Streak milestone state added
- [x] `triggerHaptic` imported
- [x] Streak HUD implemented
- [x] Score popups implemented
- [x] Streak milestones implemented
- [x] Haptic feedback added
- [x] Stats section updated
- [x] TypeScript compilation passes

### Number Sequence ✅ COMPLETE
- [x] `calculateScore()` added to logic file
- [x] Streak state variables added
- [x] Max streak tracking added
- [x] Score popup state added
- [x] Streak milestone state added
- [x] `triggerHaptic` imported
- [x] Streak HUD implemented
- [x] Score popups implemented
- [x] Streak milestones implemented
- [x] Haptic feedback added
- [x] Stats section added
- [x] TypeScript compilation passes

### More Or Less ✅ COMPLETE
- [x] `calculateScore()` added to logic file
- [x] Streak state variables added
- [x] Max streak tracking added
- [x] Score popup state added
- [x] Streak milestone state added
- [x] `triggerHaptic` imported
- [x] Streak HUD implemented
- [x] Score popups implemented
- [x] Streak milestones implemented
- [x] Haptic feedback added
- [x] Stats section updated
- [x] TypeScript compilation passes

---

## Combined Review Guide for Batch 2

### Games Improved (5 Total):
1. **Size Sorting** - Logic: `sizeSortingLogic.ts`, Component: `SizeSorting.tsx`
2. **Odd One Out** - Logic: `oddOneOutLogic.ts`, Component: `OddOneOut.tsx`
3. **Counting Objects** - Logic: `countingObjectsLogic.ts`, Component: `CountingObjects.tsx`
4. **Number Sequence** - Logic: `numberSequenceLogic.ts`, Component: `NumberSequence.tsx`
5. **More Or Less** - Logic: `moreOrLessLogic.ts`, Component: `MoreOrLess.tsx`

### Common Pattern Applied:
- All games now have `calculateScore(streak, level)` function
- All games have streak HUD with Kenney hearts (5 hearts, i*2 threshold)
- All games have score popups with 700ms timeout
- All games have streak milestones at 5, 10, 15...
- All games have haptic feedback (success/error/celebration)
- All games track max streak and display in stats
- All games reset streak on wrong answer

### Files Modified:
**Logic Files:**
- `src/games/sizeSortingLogic.ts`
- `src/games/countingObjectsLogic.ts`
- `src/games/numberSequenceLogic.ts`
- `src/games/moreOrLessLogic.ts`

**Component Files:**
- `src/pages/SizeSorting.tsx`
- `src/pages/OddOneOut.tsx`
- `src/pages/CountingObjects.tsx`
- `src/pages/NumberSequence.tsx`
- `src/pages/MoreOrLess.tsx`

---

## Post-Implementation Review

After all 5 games are improved, create a combined review document similar to `GAME_IMPROVEMENTS_REVIEW_GUIDE.md` for validation.
