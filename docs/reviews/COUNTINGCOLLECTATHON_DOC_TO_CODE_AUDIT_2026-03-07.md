# Counting Collect-a-thon Doc-to-Code Review Report

**Date:** 2026-03-07
**Auditor:** Doc-to-Code Audit Agent
**Scope:** Counting Collect-a-thon game - comprehensive verification and documentation

---

## Executive Summary

Conducted a comprehensive doc-to-code audit of the Counting Collect-a-thon game. Specification already existed. Verified implementation against specification.

**Key Results:**
- ✅ Existing specification verified against code
- ✅ Verified 25 existing tests for game logic (all passing)
- ✅ All tests passing
- ✅ Clean separation between component and logic
- ✅ Pure functional design for logic module

---

## Files Verified

### Existing Documentation
| File | Status |
|------|--------|
| `docs/games/counting-collectathon-spec.md` | ✅ Verified - matches implementation |
| `src/frontend/src/games/__tests__/countingCollectathonLogic.test.ts` | ✅ 25 tests, all passing |

### Code Files
| File | Lines | Status |
|------|-------|--------|
| `src/frontend/src/games/countingCollectathonLogic.ts` | 375 | Logic file (pure functions) |
| `src/frontend/src/pages/CountingCollectathon.tsx` | 477 | Component file |
| `src/frontend/src/games/__tests__/countingCollectathonLogic.test.ts` | 339 | Tests |

---

## Findings and Resolutions

### CCA-001: Specification Already Exists
**Status:** ✅ VERIFIED - Specification matches implementation

**Document:** `docs/games/counting-collectathon-spec.md`

**Verified Contents:**
- Overview and core gameplay loop
- Two age bands (A: 2-4, B: 4-6)
- Five rounds per age band
- Three item types (star, coin, gem)
- Scoring system with streak bonus
- Time limits per round
- Hand tracking and fallback controls

---

### CCA-002: Test Coverage Already Exists
**Status:** ✅ VERIFIED - All tests passing

**Existing Tests (25 total):**
- Initial State (3 tests)
- Game Start (2 tests)
- Player Movement (3 tests)
- Item Spawning (3 tests)
- Item Updates (2 tests)
- Collision Detection (4 tests)
- Timer (3 tests)
- Round Progression (2 tests)
- Scoring (1 test)
- Helpers (2 tests)

**All tests passing ✅**

---

## Game Mechanics Verified

### Core Gameplay

Counting Collect-a-thon is an educational platformer where children collect a target number of specific items by moving a character left/right using hand tracking.

| Feature | Value |
|---------|-------|
| CV Required | Hand tracking (position) |
| Gameplay | Move character → Collect target items → Next round |
| Items | 3 types (star, coin, gem) |
| Rounds | 5 per age band |
| Age Bands | A (2-4 years), B (4-6 years) |

### Two Age Bands

| Band | Ages | Difficulty | Round 1 Target | Max Target |
|------|------|------------|----------------|------------|
| A | 2-4 | Easier | 2 stars | 4 items |
| B | 4-6 | Harder | 3 stars | 8 items |

### Round Configurations

**Age Band A:**
| Round | Target | Type | Time | Available Types |
|-------|--------|------|------|-----------------|
| 1 | 2 | star | 45s | star |
| 2 | 3 | star | 45s | star |
| 3 | 3 | coin | 45s | star, coin |
| 4 | 4 | star | 40s | star, coin |
| 5 | 4 | gem | 40s | star, coin, gem |

**Age Band B:**
| Round | Target | Type | Time | Available Types |
|-------|--------|------|------|-----------------|
| 1 | 3 | star | 45s | star, coin |
| 2 | 4 | star | 45s | star, coin |
| 3 | 5 | coin | 40s | star, coin, gem |
| 4 | 6 | gem | 40s | star, coin, gem |
| 5 | 8 | star | 35s | star, coin, gem |

---

## Scoring System

### Score Calculation

```typescript
basePoints = 10; // per correct item
streakBonus = Math.min(streak × 2, 15); // +2 per streak, max +15
finalScore = score + (timeRemaining × 2) + (currentRound × 50);
```

### Score Examples

| Streak | Base | Bonus | Total per Item |
|--------|------|-------|----------------|
| 0 | 10 | 0 | 10 |
| 1 | 10 | 2 | 12 |
| 3 | 10 | 6 | 16 |
| 5 | 10 | 10 | 20 |
| 8+ | 10 | 15 | 25 (capped) |

### Final Score Bonuses

- **Time Bonus:** timeRemaining × 2
- **Round Bonus:** currentRound × 50

---

## Game State

### State Machine

| Status | Description |
|--------|-------------|
| LOADING | Assets being loaded |
| READY | Waiting for player to start |
| PLAYING | Active gameplay |
| ROUND_COMPLETE | Target reached, showing celebration |
| GAME_COMPLETE | All rounds finished or time expired |

### State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| status | GameStateStatus | Current game state |
| currentRound | number | Current round (1-5) |
| totalRounds | number | Total rounds (5) |
| score | number | Accumulated score |
| streak | number | Current consecutive correct collects |
| timeRemaining | number | Seconds left in round |
| collected | number | Items collected this round |
| targetCount | number | Target items to collect |
| targetType | ItemType | Type to collect (star/coin/gem) |
| items | FallingItem[] | Active items on screen |
| playerX | number | Player position X |
| playerY | number | Player position Y |
| lastCollectTime | number | Timestamp of last collect |
| rounds | GameRound[] | Round configurations |

---

## Controls

### Hand Tracking

- **Input:** Index finger tip X position
- **Mapping:** handX maps to playerX (centered on player)
- **Bounds:** Clamped to canvas width

### Fallback Controls

- **Mouse:** Move to control player X
- **Touch:** Touch and drag to control player X

---

## Collision Detection

### Algorithm

```typescript
function rectsIntersect(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
```

### Player Hitbox

- **Size:** playerWidth - 16, playerHeight - 16 (inset by 8px)
- **Reason:** Forgiving hitbox for toddlers

---

## Item Spawning

### Spawn Rules

- **Interval:** 1200ms between spawns
- **Max On Screen:** 8 items
- **Types:** Random from round's available types
- **Position:** Random X (within canvas bounds)
- **Starting Y:** -itemHeight (above screen)

### Item Physics

- **Fall Speed:** 120 pixels/second
- **Horizontal Drift:** Random ±10 pixels/second
- **Removal:** Below canvas or outside bounds

---

## Visual Design

### Canvas

- **Size:** 800 × 600 pixels
- **Background:** Gradient (dark blue to light blue)
- **Ground:** Green with darker top border

### Assets

| Asset | Path |
|-------|------|
| Player | `/assets/kenney/platformer/characters/character_green_idle.png` |
| Star | `/assets/kenney/platformer/collectibles/star.png` |
| Coin | `/assets/kenney/platformer/collectibles/coin_gold.png` |
| Gem | `/assets/kenney/platformer/collectibles/gem_blue.png` |

### Fallback Emojis

| Type | Emoji |
|------|-------|
| star | ⭐ |
| coin | 🪙 |
| gem | 💎 |

---

## Audio & Haptics

| Event | Audio | Haptic |
|-------|-------|--------|
| Correct collect | sfx_coin.ogg, play('pop') | 'success' |
| Wrong collect | sfx_bump.ogg, playError() | 'error' |
| Round complete | sfx_coin.ogg | None |
| Game complete | playCelebration() | None |

---

## TTS Voice Instructions

| Situation | Voice |
|-----------|-------|
| Game start | "Let's collect the treasures! Move your hand to help!" |

---

## Progress Tracking

### Integration with useGameDrops

```typescript
const finalScore = calculateFinalScore(gameState);
await onGameComplete(finalScore);
```

---

## Feedback System

### Collect Feedback

| Streak | Message | Emoji |
|--------|---------|-------|
| 0-2 | "Good!" | ✨ |
| 3-4 | "Great!" | 🌟 |
| 5+ | "Amazing!" | 🎉 |
| Wrong | "Oops!" | 😕 |

---

## Code Quality Observations

### Strengths
- ✅ Logic cleanly separated into dedicated `countingCollectathonLogic.ts` file (375 lines)
- ✅ Pure functional design (immutable state updates)
- ✅ Comprehensive test coverage (25 tests)
- ✅ Clear game state machine
- ✅ Age band configuration
- ✅ Proper collision detection
- ✅ Multiple input methods (hand, mouse, touch)
- ✅ Asset preloading with fallbacks

### Code Organization

The game follows a clean architecture:
- **Component** (`CountingCollectathon.tsx`): UI rendering, game loop, asset loading (477 lines)
- **Logic** (`countingCollectathonLogic.ts`): Pure functions for game state, scoring, collision (375 lines)
- **Tests** (`countingCollectathonLogic.test.ts`): Comprehensive test coverage (339 lines)

### Reusability

The game uses shared utilities:
- `useGameHandTracking()` - Hand tracking (shared hook)
- `useGameDrops()` - Completion rewards (shared hook)
- `useTTS()` - Text-to-speech (shared hook)
- `GameContainer` - Game wrapper component
- `triggerHaptic()` - Haptic feedback

---

## Test Coverage

### Test Suite: `countingCollectathonLogic.test.ts`

**25 tests covering:**

*Initial State (3 tests):*
1. Should create initial state with correct defaults
2. Should have correct target for first round (age band B)
3. Should have correct target for first round (age band A)

*Game Start (2 tests):*
4. Should transition from READY to PLAYING on startGame
5. Should reset score and streak on game start

*Player Movement (3 tests):*
6. Should update player X position based on hand position
7. Should clamp player position to canvas bounds
8. Should not update player position when game is not PLAYING

*Item Spawning (3 tests):*
9. Should spawn an item when spawnItem is called
10. Should not spawn items when game is not PLAYING
11. Should not exceed max items on screen

*Item Updates (2 tests):*
12. Should update item positions based on velocity
13. Should remove items that fall below canvas

*Collision Detection (4 tests):*
14. Should detect collision when item overlaps player
15. Should increment collected count on correct item
16. Should reset streak on wrong item
17. Should complete round when target reached

*Timer (3 tests):*
18. Should decrement timer
19. Should not go below zero
20. Should end game when timer reaches zero

*Round Progression (2 tests):*
21. Should advance to next round
22. Should complete game after final round

*Scoring (1 test):*
23. Should calculate final score with time and round bonus

*Helpers (2 tests):*
24. Should return correct emoji for each item type
25. Should return correct feedback messages

**All tests passing ✅**

---

## Summary of Verification

| Metric | Value |
|--------|-------|
| Game specification | ✅ Verified - matches implementation |
| Test coverage | ✅ 25 tests, all passing |
| Code organization | ✅ Clean separation of concerns |
| Logic file | ✅ 375 lines, pure functions |
| Component file | ✅ 477 lines, game loop |
| Test file | ✅ 339 lines, comprehensive coverage |

---

## Comparison with Similar Games

| Feature | CountingCollectathon | MathMonsters | FruitNinjaAir |
|---------|----------------------|--------------|---------------|
| CV Required | Hand (position) | Hand (fingers) | Hand (swipe) |
| Core Mechanic | Move to collect | Show fingers | Swipe to slice |
| Educational Focus | Counting 1-10 | Finger counting | Reflexes |
| Progression | 5 rounds × 2 bands | 7 levels | 3 levels |
| Age Bands | Yes (A/B) | No | No |
| Items | 3 types (star/coin/gem) | 5 monsters | 10 fruits |
| Time Limit | Per round (35-45s) | Per level | 90s total |
| Streak System | Yes | Yes | Yes |
| Age Range | 2-6 | 3-8 | 4-10 |
| Vibe | Chill | Chill | Active |

---

## Educational Value

### Skills Developed

1. **Counting**
   - Numbers 1-10 (Age Band A)
   - Numbers 3-8 (Age Band B)
   - One-to-one correspondence

2. **Color/Shape Recognition**
   - Distinguish item types (star, coin, gem)
   - Visual discrimination

3. **Hand-Eye Coordination**
   - Track hand position
   - Move character to target
   - Timing for collection

4. **Following Instructions**
   - Collect specific item type
   - Understand target display
   - Complete rounds

---

**Audit Status:** COMPLETE ✅
**All Tests:** PASSING ✅ (25/25)
**Documentation:** VERIFIED ✅
**Code Quality:** ASSESSED ✅
