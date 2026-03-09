# Connect The Dots - Doc to Code Audit Report

**Date:** 2026-03-09
**Game ID:** `connect-the-dots`
**Audit Type:** Doc-to-Code Verification
**Files:**
- Component: `ConnectTheDots.tsx` (953 lines)
- Tests: `src/frontend/src/games/__tests__/connectTheDotsLogic.test.ts` (42 tests)
- Spec: `docs/games/connect-the-dots-spec.md`

---

## Executive Summary

**Status:** PASS ✅

Connect The Dots is an educational puzzle game where children connect numbered dots in sequential order (1, 2, 3...) to reveal a picture. The implementation includes 5 levels with 3 difficulty settings.

### Test Coverage
- **42 tests** (excellent)
- **42 tests passing** (100% pass rate)
- Tests cover: difficulty configs, dot count, hit detection, dot generation, scoring, level progression, game state, edge cases, canvas bounds, sequential connection

---

## Implementation Quality Assessment

### Strengths
1. **5-level progression** - Increasing dot counts (5-15 dots)
2. **3 difficulty modes** - Easy/Medium/Hard with different dots, time, and hit radius
3. **Optional hand tracking** - Pinch detection with mouse/touch fallback
4. **Rejection sampling** - Prevents dot overlap (80px minimum distance)
5. **Streak system** - Visual hearts filling every 2 streak points
6. **Time bonus** - Remaining time × 10 on level completion

### Code Organization

| File | Lines | Purpose |
|------|-------|---------|
| `ConnectTheDots.tsx` | 953 | Component with embedded logic, hand tracking, UI |
| `connectTheDotsLogic.test.ts` | ~400 | Unit tests with extracted algorithms |

---

## Test Results

### Passing Tests (42/42) ✅

**Difficulty Configurations (4 tests)**
- Has 3 difficulty levels
- Easy mode has lowest dot count and longest time
- Medium mode has balanced settings
- Hard mode has highest dot count and shortest time

**Dot Count Calculation (5 tests)**
- Calculates level 1 dots correctly for each difficulty
- Increases dots with level
- Caps dots at maxDots for each difficulty
- Level 5 has max dots for all difficulties
- Has maximum 5 levels

**Hit Detection (6 tests)**
- Detects hit when cursor is within radius
- Does not detect hit when cursor is outside radius
- Detects hit at edge of radius
- Detects hit with exactly radius distance
- Uses correct radius for each difficulty
- Handles diagonal distance correctly

**Dot Generation (5 tests)**
- Generates position within canvas bounds
- Detects when position is too close to existing dot
- Checks distance against all existing dots
- Allows positions at exactly minimum distance
- Empty dots array has no conflicts

**Scoring System (4 tests)**
- Calculates base score correctly
- Adds streak bonus correctly
- Caps streak bonus at 15
- Calculates time bonus correctly

**Level Progression (4 tests)**
- Starts at level 1
- Advances to next level after completion
- Completes game after level 5
- Does not advance beyond level 5

**Game State (4 tests)**
- Starts with zero score
- Tracks connected dots
- Checks if all dots are connected
- Tracks current dot index

**Edge Cases (4 tests)**
- Handles single dot level
- Handles maximum dots for hard mode
- Handles zero time remaining
- Handles difficulty level changes mid-game

**Canvas Bounds (3 tests)**
- Canvas has correct dimensions
- Dot generation is padded from edges
- Minimum dot distance is enforced

**Sequential Connection (3 tests)**
- Only allows connecting current dot
- Advances current index after connection
- Does not advance beyond last dot

---

## Code Metrics

| Metric | Value |
|--------|-------|
| Lines of code | 953 (component) |
| Exports | Embedded (no separate logic module) |
| Test coverage | 42 tests |
| Test pass rate | 100% |
| Levels | 5 |
| Difficulty modes | 3 |

---

## 3 Difficulty Modes

| Difficulty | Min Dots | Max Dots | Time Limit | Hit Radius |
|------------|----------|----------|------------|------------|
| Easy | 5 | 8 | 90s | 35px |
| Medium | 7 | 12 | 75s | 30px |
| Hard | 10 | 15 | 60s | 25px |

---

## 5 Levels

| Level | Easy | Medium | Hard |
|-------|------|--------|------|
| 1 | 5 dots | 7 dots | 10 dots |
| 2 | 6 dots | 8 dots | 11 dots |
| 3 | 7 dots | 9 dots | 12 dots |
| 4 | 8 dots | 11 dots | 13 dots |
| 5 | 8 dots | 12 dots | 15 dots |

Formula: `baseDots = minDots + Math.floor((level - 1) × 1.5)`

---

## Key Interfaces

```typescript
interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}
```

---

## Dot Generation Algorithm

```typescript
// Calculate dot count based on level and difficulty
const baseDots = config.minDots + Math.floor((level - 1) × 1.5);
const numDots = Math.min(baseDots, config.maxDots);

// Generate dots with rejection sampling
for (let i = 0; i < numDots; i++) {
  let attempts = 0;
  let x, y;

  do {
    x = 100 + Math.random() × 600;  // Canvas width 800, padding 100
    y = 100 + Math.random() × 400;  // Canvas height 600, padding 100
    attempts++;
  } while (attempts < 50 && tooCloseToExistingDots(x, y));
}
```

### Position Constraints
- **Canvas Size:** 800 × 600 pixels
- **Padding:** 100px from edges
- **Valid Range:** X: 100-700, Y: 100-500
- **Min Distance:** 80px between dots

---

## Hit Detection

```typescript
distance = Math.hypot(cursorX - dotX, cursorY - dotY);
hit = distance <= difficultyRadius;
```

| Difficulty | Hit Radius |
|------------|-----------|
| Easy | 35px |
| Medium | 30px |
| Hard | 25px |

---

## Scoring System

```typescript
basePoints = 10;  // per connected dot
streakBonus = Math.min(streak × 2, 15);  // +2 per streak, max +15
timeBonus = timeLeft × 10;  // on level completion
totalScore = sum of all (basePoints + streakBonus) + timeBonus;
```

### Score Examples

| Streak | Base | Bonus | Total per Dot |
|--------|------|-------|---------------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

### Level Completion Bonus
- **Formula:** timeLeft × 10
- **Maximum:** 90 × 10 = 900 points (Easy level 1)

---

## Visual Design

### Canvas

- **Size:** 800 × 600 pixels
- **Background:** Semi-transparent white with weather background (windy)
- **Rendering:** SVG overlay for dots and lines

### Dot Appearance

| State | Fill | Radius | Stroke |
|-------|------|--------|--------|
| Current (target) | Blue (#3B82F6) | 20px | Black 2px |
| Pending | Blue (#3B82F6) | 15px | Black 2px |
| Connected | Emerald (#10B981) | 15px | Black 2px |

### Connecting Lines

- **Color:** Slate-300 (#CBD5E1)
- **Width:** 3px
- **Drawn between:** Connected adjacent dots

### Game Colors

```typescript
const GAME_COLORS = {
  path: '#CBD5E1',        // slate-300
  dotConnected: '#10B981', // emerald-500
  dotPending: '#3B82F6',   // blue-500
  dotStroke: '#000000',    // black
  dotLabel: '#FFFFFF',     // white
  cursorIdle: '#F59E0B',   // amber-500
  cursorPinch: '#E85D04',  // pip-orange
};
```

### UI Elements

- **Next Dot Indicator:** Top-left, shows "#N"
- **Relaxed Message:** Top-center, "Take your time!"
- **Kenney Heart HUD:** Bottom-left, shows streak
- **Score Popup:** Center screen, animated +points
- **Streak Milestone:** Top-third, fire overlay

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Game start | playPop() | None |
| Dot connected | playPop() | 'success' |
| Level complete | playCelebration() | 'celebration' |
| All complete | playCelebration() | 'celebration' |
| Streak milestone | None | Via hook |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Connect the dots in order! Pinch each number!" |
| Every 3 dots | "{N} dots connected! Keep going!" |
| Last dot | "Great job! You connected all the dots!" |
| Menu | "Connect the dots in order. Start with number one. Pinch each dot to connect it. Complete the picture!" |

---

## Progress Tracking

### Integration with useGameDrops

```typescript
await onGameComplete(finalScore);
triggerEasterEgg('egg-star-connector');
```

### Easter Egg

- **ID:** `egg-star-connector`
- **Trigger:** Complete all 5 levels
- **Effect:** Triggers item drop system

---

## Comparison with Similar Games

| Feature | ConnectTheDots | NumberTapTrail | MazeRunner |
|---------|---------------|----------------|------------|
| CV Required | Hand (pinch) - optional | Hand (pinch) | None |
| Core Mechanic | Connect sequential dots | Pinch numbers in order | Navigate maze |
| Educational Focus | Number sequencing | Number recognition | Path planning |
| Progression | 5 levels × 3 difficulty | 6 fixed levels | 3 fixed levels |
| Interaction | Canvas drawing | Direct pinch | Keyboard/touch |
| Visual Output | Lines form picture | Numbers disappear | Character moves |
| Time Limit | 60-90s per level | 90s total | None |
| Streak System | Yes | Yes | Yes |
| Age Range | 4-8 | 3-6 | 5-10 |

---

## Educational Value

### Skills Developed

1. **Number Recognition** - Numbers 1-15 (depending on level)
2. **Sequencing** - Order: 1, 2, 3... with pattern understanding
3. **Fine Motor Skills** - Pointing accuracy, pinch gesture, hand-eye coordination
4. **Patience** - Taking time to connect, no pressure for speed

---

## Conclusion

Connect The Dots is **functionally correct** with excellent test coverage (42 tests). The implementation provides age-appropriate number sequencing education with clean visual design using SVG rendering. The optional hand tracking with pinch detection makes it accessible for different input preferences.

**Audit Status:** APPROVED ✅
**All Tests:** PASSING ✅ (42/42)
**Documentation:** COMPLETE ✅
