# Game Improvements Batch 3 - Analysis & Implementation

> **Batch**: 5 Games (Number Bubble Pop, Pop The Number, Beginning Sounds, Fraction Pizza, Math Monsters)  
> **Ticket**: TCK-20260303-009 :: Game Improvements Batch 3  
> **Ticket Stamp**: STAMP-20260303T123654Z-codex-2jlj  
> **Created**: 2026-03-03  

---

## 1. Number Bubble Pop

### 1.1 Current Implementation
**Files**: `NumberBubblePop.tsx`, `numberBubblePopLogic.ts`

**Current Mechanics:**
- Pop bubbles with the target number
- Fixed +25 points per correct pop
- -10 penalty for wrong pop
- No streak system
- 3 levels (number range 5/10/20)

**Current Scoring (line 41):**
```typescript
setScore(s => s + 25);  // Fixed 25 points
```

### 1.2 Improvement Plan

**Add to numberBubblePopLogic.ts:**
```typescript
// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-5 range
  2: 1.5,  // 1-10 range
  3: 2,    // 1-20 range
};

export function calculateScore(streak: number, level: number): number {
  const baseScore = 15;
  const streakBonus = Math.min(streak * 3, 15);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
```

**Add to NumberBubblePop.tsx:**
- Streak state (consecutive correct pops)
- Max streak tracking
- Kenney heart HUD
- Score popups
- Haptic feedback
- Streak milestones

---

## 2. Pop The Number

### 2.1 Current Implementation
**Files**: `PopTheNumber.tsx`, `popTheNumberLogic.ts`

**Current Mechanics:**
- Pop numbers in sequential order (1, 2, 3...)
- Fixed +25 points per correct pop
- Time bonus at end of round
- No streak system (already sequential by nature)

**Current Scoring (line 59):**
```typescript
setScore(s => s + 25);  // Fixed 25 points
```

### 2.2 Improvement Plan

Since this game is about popping in sequence, the "streak" is inherent in the gameplay. Instead of a separate streak system, let's add:

**Add to popTheNumberLogic.ts:**
```typescript
// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1,    // 1-3 range
  2: 1.5,  // 1-5 range
  3: 2,    // 1-7 range
  4: 2.5,  // 1-10 range
};

export function calculateScore(consecutivePops: number, level: number): number {
  const baseScore = 10;
  // Bonus for consecutive pops in a round
  const streakBonus = Math.min(consecutivePops * 2, 20);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
```

**Add to PopTheNumber.tsx:**
- Track consecutive pops within a round
- Kenney heart HUD showing progress through current number set
- Score popups
- Haptic feedback

---

## 3. Beginning Sounds

### 3.1 Current Implementation
**Files**: `BeginningSounds.tsx`, `beginningSoundsLogic.ts`

**Current State:**
- Already has feature flag integration
- Has `calculateScore` function (time-based)
- Has some modern patterns

**Analysis needed:** Check if streak system exists

### 3.2 Improvement Plan
Check current implementation and add if missing:
- Streak tracking
- Kenney heart HUD
- Haptic feedback
- Max streak display

---

## 4. Fraction Pizza

### 4.1 Current Implementation
**Files**: `FractionPizza.tsx`, `fractionPizzaLogic.ts`

**Current Mechanics:**
- Drag fraction labels to match pizza
- Fixed +25 points per correct match
- 5 rounds per level, multiple levels
- No streak system
- Already has hand tracking, voice instructions

**Current Scoring (line 210):**
```typescript
setScore((prev) => prev + 25);  // Fixed 25 points
```

### 4.2 Improvement Plan

**Add to fractionPizzaLogic.ts:**
```typescript
// Level multipliers
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  0: 1,    // Level 1 - basic fractions
  1: 1.5,  // Level 2
  2: 2,    // Level 3
};

export function calculateScore(streak: number, level: number): number {
  const baseScore = 15;
  const streakBonus = Math.min(streak * 3, 15);
  const multiplier = DIFFICULTY_MULTIPLIERS[level] ?? 1;
  return Math.floor((baseScore + streakBonus) * multiplier);
}
```

**Add to FractionPizza.tsx:**
- Streak state
- Kenney heart HUD (integrate with existing UI)
- Score popups
- Haptic feedback
- Max streak tracking

---

## 5. Math Monsters

### 5.1 Current Implementation
**Files**: `MathMonsters.tsx`, `mathMonstersLogic.ts`

**Analysis needed:**
- Check current scoring mechanism
- Check if streak system exists

### 5.2 Expected Improvements
- Add combo scoring if not present
- Kenney heart HUD
- Haptic feedback
- Streak tracking

---

## Implementation Checklist

### For Each Game:
- [ ] Create/update `calculateScore()` in logic file
- [ ] Add streak state variables
- [ ] Add max streak tracking
- [ ] Add score popup state
- [ ] Add streak milestone state
- [ ] Import `triggerHaptic` from utils
- [ ] Implement streak HUD with Kenney hearts
- [ ] Implement score popups
- [ ] Implement streak milestones
- [ ] Add haptic feedback (success/error/celebration)
- [ ] Update results screen with max streak
- [ ] Add star badge for maxStreak >= 5
- [ ] TypeScript compilation passes

---

## Implementation Progress

### Number Bubble Pop ⏳ IN PROGRESS
- [ ] `calculateScore()` in logic file
- [ ] Add streak state variables
- [ ] Add max streak tracking
- [ ] Add score popup state
- [ ] Add streak milestone state
- [ ] Import `triggerHaptic`
- [ ] Implement streak HUD
- [ ] Implement score popups
- [ ] Implement streak milestones
- [ ] Add haptic feedback
- [ ] Update results screen

### Pop The Number ⏳ PENDING
- [ ] `calculateScore()` in logic file
- [ ] Add consecutive pop tracking
- [ ] Add max streak tracking
- [ ] Add score popup state
- [ ] Import `triggerHaptic`
- [ ] Implement progress HUD
- [ ] Implement score popups
- [ ] Add haptic feedback
- [ ] Update results screen

### Beginning Sounds ⏳ PENDING
- [ ] Check current implementation
- [ ] Add streak if missing
- [ ] Add Kenney HUD if missing
- [ ] Add haptics if missing

### Fraction Pizza ⏳ PENDING
- [ ] `calculateScore()` in logic file
- [ ] Add streak state variables
- [ ] Add max streak tracking
- [ ] Add score popup state
- [ ] Import `triggerHaptic`
- [ ] Implement streak HUD
- [ ] Implement score popups
- [ ] Add haptic feedback
- [ ] Update results screen

### Math Monsters ⏳ PENDING
- [ ] Check current implementation
- [ ] Add improvements as needed
