# Number Sequence Game Specification

**Game ID:** `number-sequence`
**World:** Learning
**Vibe:** Chill
**Age Range:** 5-10 years
**CV Requirements:** None

---

## Overview

Number Sequence is a mathematical pattern recognition game where children identify missing numbers in arithmetic sequences. The game builds foundational algebraic thinking through pattern completion.

### Tagline
"Find the missing number in the pattern! 🔢✨"

---

## Game Mechanics

### Core Gameplay Loop

1. **See Sequence** - 5 numbers in a row with one missing
2. **Analyze Pattern** - Determine the arithmetic progression
3. **Choose Answer** - Select missing number from 4 options
4. **Get Feedback** - Instant feedback on correctness
5. **Continue** - 8 rounds per session

### Controls

| Action | Input |
|--------|-------|
| Select answer | Click/tap number button |
| Select level | Click level button |
| Start game | Click "Start Pattern Game" button |
| Exit | Click "Finish" button |

---

## Difficulty Levels

### 3 Difficulty Settings

| Level | Step | Range | Pattern | Multiplier |
|-------|------|-------|---------|------------|
| 1 | 1 | 1-8 | Counting by 1s | 1× |
| 2 | 2 | 2-16 | Counting by 2s | 1.5× |
| 3 | 5 | 5-30 | Counting by 5s | 2× |

### Sequence Examples

| Level | Start | Step | Sequence (missing example) |
|-------|-------|------|---------------------------|
| 1 | 3 | 1 | 3, 4, ?, 6, 7 |
| 2 | 4 | 2 | 4, 8, ?, 16, 20 |
| 3 | 10 | 5 | 10, 20, ?, 40, 50 |

---

## Scoring System

### Score Formula

```typescript
baseScore = 10;
streakBonus = Math.min(streak × 3, 15);
difficultyMultiplier = { 1: 1, 2: 1.5, 3: 2 }[level];
score = (baseScore + streakBonus) × difficultyMultiplier;
```

### Score Examples

| Level | Streak | Base | Bonus | Subtotal | Final |
|-------|--------|------|-------|----------|-------|
| 1 | 0 | 10 | 0 | 10 | 10 |
| 1 | 5 | 10 | 15 | 25 | 25 |
| 2 | 5 | 10 | 15 | 25 | 37 |
| 3 | 5 | 10 | 15 | 25 | 50 |

### Max Score per Round

| Level | Max Score |
|-------|-----------|
| 1 | 25 |
| 2 | 37 |
| 3 | 50 |

---

## Streak System

### Streak Progression

| Streak | Bonus | Running Total (Level 1) |
|--------|-------|-------------------------|
| 1 | 0 | 10 |
| 2 | 3 | 13 |
| 3 | 6 | 16 |
| 4 | 9 | 19 |
| 5 | 12 | 22 |
| 6+ | 15 | 25 (capped) |

### Visual Feedback

- Kenney heart HUD fills (5 hearts max)
- Heart fills every 2 streak points
- Streak milestone overlay at intervals
- "🔥 X Streak! 🔥" message

---

## Round Generation

### Sequence Creation

```typescript
start = minStart + floor(random() × (maxStart - minStart + 1));
sequence = [start, start + step, start + 2×step, ...];
```

### Missing Number Rules

- **Never first** - First number always visible
- **Never last** - Last number always visible
- **Random middle** - Missing index: 1 to 3 (inclusive)

### Distractor Generation

```typescript
distractors = [answer - step, answer + step, answer + 2×step]
filtered = distractors.filter(n > 0)  // Remove non-positive
options = shuffle([answer, ...filtered]).slice(0, 4)
```

---

## Visual Design

### UI Elements

- **Sequence Display:** 5 boxes in a row, missing shown as "?"
- **Options Grid:** 2×2 or 2×4 grid of answer buttons
- **Streak HUD:** White rounded box with heart icons
- **Feedback Bar:** Shows result and explanation
- **Level Buttons:** Pill-shaped, blue when active

### Color Scheme

| Element | Colors |
|---------|--------|
| Sequence box | Border: #F2CC8F, BG: #F8FAFC |
| Option buttons | Border: #F2CC8F, BG: #EFF6FF, Hover: #3B82F6 |
| Active level | BG: #3B82F6, Text: White |
| Inactive level | BG: White, Text: Slate, Border: #F2CC8F |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Start game | playClick() | None |
| Select answer | playClick() | None |
| Correct | playSuccess() | 'success' |
| Wrong | playError() | 'error' |
| Complete | playCelebration() | 'celebration' |
| Milestone | None | 'celebration' |

---

## Game Configuration

| Parameter | Value | Description |
|-----------|-------|-------------|
| Sequence length | 5 | Numbers per sequence |
| Options count | 4 | Multiple choice options |
| Rounds per session | 8 | Total rounds in game |
| Base score | 10 | Points per correct answer |
| Streak bonus per | 3 | Points added per streak level |
| Max streak bonus | 15 | Cap on streak bonus |

---

## Data Structures

### Number Sequence Level

```typescript
interface NumberSequenceLevel {
  level: number;     // Level identifier (1-3)
  minStart: number;  // Minimum sequence start
  maxStart: number;  // Maximum sequence start
  step: number;      // Arithmetic progression step
  length: number;    // Sequence length (always 5)
}
```

### Number Sequence Round

```typescript
interface NumberSequenceRound {
  sequence: number[];     // The full sequence
  missingIndex: number;   // Which element is hidden (1-3)
  answer: number;         // The missing value
  options: number[];      // 4 answer choices
}
```

---

## Code Organization

### File Structure

| File | Lines | Purpose |
|------|-------|---------|
| `NumberSequence.tsx` | 288 | Main component with game loop |
| `numberSequenceLogic.ts` | 74 | Game logic and utilities |
| `numberSequenceLogic.test.ts` | 273 | Unit tests (52 tests) |

### Architecture

- **Component** (`NumberSequence.tsx`): UI, state, game loop, events
- **Logic** (`numberSequenceLogic.ts`): Pure functions for rounds, scoring, levels
- **Tests** (`numberSequenceLogic.test.ts`): Comprehensive test coverage

---

## Educational Value

### Skills Developed

1. **Pattern Recognition**
   - Arithmetic sequences
   - Number patterns
   - Algebraic thinking foundations

2. **Number Sense**
   - Skip counting (by 1s, 2s, 5s)
   - Number relationships
   - Sequencing skills

3. **Mathematical Reasoning**
   - Deductive thinking
   - Rule identification
   - Logical deduction

4. **Problem Solving**
   - Analyzing patterns
   - Making predictions
   - Verifying solutions

5. **Mental Math**
   - Addition strategies
   - Step calculation
   - Number operations

---

## Progress Tracking

### useGameSessionProgress Integration

```typescript
useGameSessionProgress({
  gameName: 'Number Sequence',
  score,
  level,
  isPlaying: Boolean(activeRound),
  metaData: { round, correct, roundsPerSession }
});
```

### useGameDrops Integration

```typescript
const { onGameComplete } = useGameDrops('number-sequence');

// On session completion
await onGameComplete(score);
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-07
**Game Version:** 1.0
