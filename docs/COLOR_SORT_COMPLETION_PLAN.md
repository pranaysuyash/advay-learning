# Color Sort Game - Completion Plan

**Date**: 2026-03-09  
**Status**: PARTIAL IMPLEMENTATION  
**Source**: Existing logic file, needs page component

---

## Discovery

Found during systematic check of partial implementations:

**Evidence**:
- Logic file: `src/frontend/src/games/colorSortLogic.ts` (275 lines, 12 exports)
- Test file: `src/frontend/src/games/__tests__/colorSortLogic.test.ts` (1582 bytes)
- Registry: `id: 'color-sort'` with full metadata
- Page: ❌ **MISSING** - No ColorSort.tsx page component

---

## Game Overview

**Name**: Color Sort  
**Concept**: Drop colored balls into matching buckets using physics simulation  
**Tech**: Matter.js physics engine  
**Age**: 3-6 years  
**CV**: None required (cv: [])  
**Vibe**: Puzzle

**Mechanics**:
- Physics-based ball dropping
- 4 colored buckets (Red, Blue, Green, Yellow)
- Ball spawns at top, player taps/clicks to drop
- Ball rolls/bounces with gravity
- Score when ball lands in matching bucket
- Lose points for wrong bucket

---

## Existing Assets

### ✅ Logic File (275 lines)
**File**: `src/frontend/src/games/colorSortLogic.ts`

**Exports**:
1. `COLORS` - 4 game colors
2. `GameState` - Game state interface
3. `PhysicsBodies` - Physics bodies interface
4. `initializeGame()` - Initialize state
5. `getRandomColor()` - Get random color
6. `createPhysicsWorld()` - Create Matter.js world
7. `spawnBall()` - Spawn new ball
8. `checkBucketCollision()` - Detect bucket scoring
9. `updateScore()` - Update score logic
10. `cleanupBalls()` - Remove off-screen balls
11. `advanceLevel()` - Level progression
12. `STREAK_MILESTONE_INTERVAL` - Streak constant

**Features**:
- Matter.js physics engine
- Gravity simulation
- Ball spawning
- Bucket collision detection
- Score tracking
- Level system
- Ball cleanup

### ✅ Test File
**File**: `src/frontend/src/games/__tests__/colorSortLogic.test.ts`

**Tests**: Unknown count (need to verify)

### ✅ Registry Entry
```typescript
{
  id: 'color-sort',
  name: 'Color Sort',
  tagline: 'Sort colors into matching buckets! 🎨',
  path: '/games/color-sort',
  icon: 'palette',
  worldId: 'color-splash',
  vibe: 'puzzle',
  ageRange: '3-6',
  isNew: true,
  cv: [],
  listed: true,
  drops: [
    { itemId: 'color-rainbow', chance: 0.2 },
    { itemId: 'star-silver', chance: 0.15 },
  ],
  easterEggs: [],
}
```

---

## Missing Pieces

### ❌ Page Component
**Need**: `src/frontend/src/pages/ColorSort.tsx`

**Requirements**:
- Matter.js canvas rendering
- Touch/mouse controls for dropping balls
- Visual feedback (ball colors, bucket colors)
- Score display
- Level progression UI
- Game over/completion screen
- Menu system

### ❌ Route
**Need**: Add route in `App.tsx` for `/games/color-sort`

### ❌ Additional Tests
**Need**: UI integration tests (logic tests exist)

---

## Implementation Plan

### Unit 1: Basic Page with Physics (30 min)
**Goal**: Get Matter.js canvas rendering with buckets

**Scope**:
- IN: Canvas setup, Matter.js world, bucket rendering
- OUT: Ball spawning, scoring, UI polish

**Files**:
- CREATE: `src/frontend/src/pages/ColorSort.tsx`
- UPDATE: `src/frontend/src/App.tsx` (add route)

**Acceptance**:
- [ ] Page renders with GameShell
- [ ] Canvas shows 4 colored buckets
- [ ] Matter.js physics world initialized
- [ ] No console errors

---

### Unit 2: Ball Spawning & Controls (30 min)
**Goal**: Spawn balls and drop with touch/click

**Scope**:
- IN: Ball spawning, tap to drop, basic physics
- OUT: Scoring, collision detection

**Files**:
- UPDATE: `src/frontend/src/pages/ColorSort.tsx`

**Acceptance**:
- [ ] Can tap/click to spawn ball
- [ ] Ball falls with gravity
- [ ] Ball bounces off walls
- [ ] Next ball color shown

---

### Unit 3: Scoring & Collision (20 min)
**Goal**: Detect bucket collisions and track score

**Scope**:
- IN: Collision detection, score updates, feedback
- OUT: Level progression, game over

**Files**:
- UPDATE: `src/frontend/src/pages/ColorSort.tsx`
- UPDATE: `src/frontend/src/pages/ColorSort.tsx`

**Acceptance**:
- [ ] Detects ball landing in bucket
- [ ] Correct bucket = +points + sound
- [ ] Wrong bucket = -points + sound
- [ ] Score display updates

---

### Unit 4: Game Flow & Polish (20 min)
**Goal**: Menu, level progression, celebrations

**Scope**:
- IN: Start menu, level system, game over, celebrations
- OUT: Advanced features

**Files**:
- UPDATE: `src/frontend/src/pages/ColorSort.tsx`

**Acceptance**:
- [ ] Start menu with play button
- [ ] Level progression (more balls needed per level)
- [ ] Game over screen with score
- [ ] Celebration on level complete
- [ ] Can replay

---

## Total Estimate

**Time**: ~1.5-2 hours  
**Complexity**: MEDIUM (physics-based, but logic exists)  
**Risk**: LOW (logic complete, just need UI)

---

## Why This Game?

1. **Partial implementation exists** - logic file is complete (275 lines)
2. **Tests exist** - logic is tested
3. **Registry ready** - full metadata in gameRegistry
4. **No CV required** - simpler than camera games
5. **Physics is fun** - kids love bouncing balls
6. **Quick win** - estimated 2 hours vs 3+ for new game
7. **Different tech** - Matter.js physics vs Color Potions mixing

---

## Alternative Candidates (Rejected)

| Game | Why Rejected |
|------|--------------|
| music-pinch | Only 21 lines logic (stub) |
| steady-hand | Only 36 lines logic (stub) |
| shadow-puppet | Has page already |
| wash-hands-dance | Not in registry |

---

## Next Steps

1. ✅ Document existing state (this doc)
2. ⏳ Implement Unit 1: Basic Page with Physics
3. ⏳ Implement Unit 2: Ball Spawning & Controls
4. ⏳ Implement Unit 3: Scoring & Collision
5. ⏳ Implement Unit 4: Game Flow & Polish
6. ⏳ Test and document

**Starting**: Unit 1 - Basic Page with Physics
