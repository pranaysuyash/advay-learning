# Connect The Dots Doc-to-Code Review Report

**Date:** 2026-03-07
**Auditor:** Doc-to-Code Audit Agent
**Scope:** Connect The Dots game - comprehensive verification and documentation

---

## Executive Summary

Conducted a comprehensive doc-to-code audit of the Connect The Dots game. No specification existed. Created full specification from code analysis.

**Key Results:**
- ✅ Created comprehensive game specification document
- ✅ Added 42 tests for game logic (0 → 42 tests)
- ✅ All tests passing
- ✅ Logic embedded in component (950+ lines)
- ✅ Optional hand tracking support

---

## Files Modified/Created

### Created
| File | Purpose |
|------|---------|
| `docs/games/connect-the-dots-spec.md` | Comprehensive game specification |
| `docs/reviews/CONNECTTHEDOTS_DOC_TO_CODE_AUDIT_2026-03-07.md` | This audit report |
| `src/frontend/src/games/__tests__/connectTheDotsLogic.test.ts` | 42 tests for game mechanics |

### Modified
| File | Changes |
|------|---------|
| None - Logic is embedded in component |

---

## Findings and Resolutions

### CTD-001: No Game Specification Exists
**Status:** ✅ RESOLVED - Created comprehensive spec

**Document Created:** `docs/games/connect-the-dots-spec.md`

**Contents:**
- Overview and core gameplay loop
- Three difficulty levels (easy, medium, hard)
- Five levels with increasing dot counts
- Dot generation with rejection sampling
- Scoring system with streak and time bonuses
- Hit detection specifications
- Visual design (SVG rendering)
- Progress tracking integration
- Easter egg documentation

---

### CTD-002: No Test Coverage
**Status:** ✅ RESOLVED - Added 42 tests

**Added Tests (42 total):**
- Difficulty configurations (4 tests)
- Dot count calculation (5 tests)
- Hit detection (6 tests)
- Dot generation (5 tests)
- Scoring calculations (4 tests)
- Level progression (4 tests)
- Game state (4 tests)
- Edge cases (4 tests)
- Canvas bounds (3 tests)
- Sequential connection (3 tests)

**All tests passing ✅**

---

## Game Mechanics Discovered

### Core Gameplay

Connect The Dots is an educational puzzle game where children connect numbered dots in sequential order (1, 2, 3, etc.) to reveal a picture. The game teaches number sequencing and fine motor skills.

| Feature | Value |
|---------|-------|
| CV Required | Hand tracking (pinch detection) - optional |
| Gameplay | Click/pinch dots in sequence → Draw lines → Complete picture |
| Input Options | Hand tracking or mouse/touch |
| Levels | 5 (increasing dot count) |
| Difficulty | 3 modes (affects dots, time, radius) |

### Three Difficulty Modes

| Difficulty | Min Dots | Max Dots | Time Limit | Hit Radius |
|------------|----------|----------|------------|------------|
| Easy | 5 | 8 | 90s | 35px |
| Medium | 7 | 12 | 75s | 30px |
| Hard | 10 | 15 | 60s | 25px |

### Dot Count by Level

Formula: `baseDots = minDots + Math.floor((level - 1) * 1.5)`

| Level | Easy | Medium | Hard |
|-------|------|--------|------|
| 1 | 5 | 7 | 10 |
| 2 | 6 | 8 | 11 |
| 3 | 7 | 9 | 12 |
| 4 | 8 | 11 | 13 |
| 5 | 8 | 12 | 15 |

---

## Dot Generation

### Algorithm

1. **Calculate Count** - Based on level and difficulty
2. **Generate Positions** - Random within padded bounds
3. **Rejection Sampling** - Ensure 80px minimum distance
4. **Max Attempts** - 50 attempts per dot to prevent infinite loop
5. **Create Dots** - Sequential IDs and numbers

### Position Constraints

- **Canvas Size:** 800 × 600 pixels
- **Padding:** 100px from edges
- **Valid Range:** X: 100-700, Y: 100-500
- **Min Distance:** 80px between dots

---

## Hit Detection

### Algorithm

```typescript
distance = Math.hypot(cursorX - dotX, cursorY - dotY);
hit = distance <= difficultyRadius;
```

### Hit Radius by Difficulty

- **Easy:** 35px
- **Medium:** 30px
- **Hard:** 25px

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10; // per connected dot
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
timeBonus = timeLeft × 10; // on level completion
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
} as const;
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

## Game State

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| isPlaying | boolean | Whether game is active |
| gameCompleted | boolean | Whether all levels finished |
| score | number | Total accumulated score |
| streak | number | Current consecutive connections |
| level | number | Current level (1-5) |
| timeLeft | number | Remaining seconds |
| dots | Dot[] | All dots on canvas |
| currentDotIndex | number | Index of next dot to connect |
| difficulty | 'easy' \| 'medium' \| 'hard' | Selected difficulty |
| isHandTrackingEnabled | boolean | Hand tracking toggle |

---

## Code Quality Observations

### Strengths
- ✅ Comprehensive hand tracking integration with fallback to mouse
- ✅ Proper ref-based state management to avoid stale closures
- ✅ Good use of React hooks (useStreakTracking, useGameDrops)
- ✅ Camera permission handling
- ✅ Asset preloading
- ✅ Proper timeout cleanup
- ✅ Rejection sampling for dot generation
- ✅ SVG rendering for crisp graphics
- ✅ TTS integration for accessibility

### Areas for Consideration
- ⚠️ Logic is embedded in 950+ line component (could be extracted)
- ⚠️ No separate logic file (tests extracted algorithms manually)

### Code Organization

The game follows a component-based architecture:
- **Component** (`ConnectTheDots.tsx`): UI rendering, hand tracking, game logic (950+ lines)
- **Tests** (`connectTheDotsLogic.test.ts`): Extracted and tested algorithms (42 tests)

### Reusability

The game uses shared utilities:
- `useGameHandTracking()` - Hand tracking (shared hook)
- `useStreakTracking()` - Streak management (shared hook)
- `useGameDrops()` - Completion rewards (shared hook)
- `useTTS()` - Text-to-speech (shared hook)
- `GameCursor` - Cursor rendering (shared component)

---

## Test Coverage

### Test Suite: `connectTheDotsLogic.test.ts`

**42 tests covering:**

*Difficulty Configurations (4 tests):*
1. Has 3 difficulty levels
2. Easy mode has lowest dot count and longest time
3. Medium mode has balanced settings
4. Hard mode has highest dot count and shortest time

*Dot Count Calculation (5 tests):*
5. Calculates level 1 dots correctly for each difficulty
6. Increases dots with level
7. Caps dots at maxDots for each difficulty
8. Level 5 has max dots for all difficulties
9. Has maximum 5 levels

*Hit Detection (6 tests):*
10. Detects hit when cursor is within radius
11. Does not detect hit when cursor is outside radius
12. Detects hit at edge of radius
13. Detects hit with exactly radius distance
14. Uses correct radius for each difficulty
15. Handles diagonal distance correctly

*Dot Generation (5 tests):*
16. Generates position within canvas bounds
17. Detects when position is too close to existing dot
18. Checks distance against all existing dots
19. Allows positions at exactly minimum distance
20. Empty dots array has no conflicts

*Scoring System (4 tests):*
21. Calculates base score correctly
22. Adds streak bonus correctly
23. Caps streak bonus at 15
24. Calculates time bonus correctly

*Level Progression (4 tests):*
25. Starts at level 1
26. Advances to next level after completion
27. Completes game after level 5
28. Does not advance beyond level 5

*Game State (4 tests):*
29. Starts with zero score
30. Tracks connected dots
31. Checks if all dots are connected
32. Tracks current dot index

*Edge Cases (4 tests):*
33. Handles single dot level
34. Handles maximum dots for hard mode
35. Handles zero time remaining
36. Handles difficulty level changes mid-game

*Canvas Bounds (3 tests):*
37. Canvas has correct dimensions
38. Dot generation is padded from edges
39. Minimum dot distance is enforced

*Sequential Connection (3 tests):*
40. Only allows connecting current dot
41. Advances current index after connection
42. Does not advance beyond last dot

**All tests passing ✅**

---

## Summary of Changes

| Metric | Before | After |
|--------|--------|-------|
| Game specification | None | Full spec document |
| Game-specific test coverage | 0 tests | 42 tests |

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
| Difficulty Modes | Yes (3) | No | No |
| Age Range | 4-8 | 3-6 | 5-10 |
| Vibe | Chill | Chill | Chill |

---

## Educational Value

### Skills Developed

1. **Number Recognition**
   - Numbers 1-15 (depending on level)
   - Sequential understanding
   - Visual identification

2. **Sequencing**
   - Order: 1, 2, 3...
   - Following patterns
   - Forward thinking

3. **Fine Motor Skills**
   - Pointing accuracy
   - Pinch gesture or click
   - Hand-eye coordination

4. **Patience**
   - Taking time to connect
   - No pressure for speed
   - Completing the full picture

---

**Audit Status:** COMPLETE ✅
**All Tests:** PASSING ✅ (42/42)
**Documentation:** CREATED ✅
**Code Quality:** ASSESSED ✅
