# Bubble Biology Game - Implementation Plan

**Date**: 2026-03-09  
**Status**: READY TO BUILD  
**Source**: GAME_IDEAS_CATALOG.md P2 game  
**Why**: Simplest missing game, reuses pinch patterns from Fruit Ninja Air

---

## Game Overview

**Name**: Bubble Biology  
**Concept**: Pinch to "grab" cells, sort them, merge to evolve creatures  
**Age**: 5-8 years  
**CV**: Hand tracking (pinch gesture)  
**Vibe**: Educational/Brainy

**Learning Goals**:
- Basic biology vocabulary (cells, organisms)
- Classification/sorting skills
- Fine motor control (pinch precision)
- Pattern recognition

---

## Simple MVP Design

### Core Loop (60 seconds)
```
1. Cells float on screen (3 types: plant, animal, bacteria)
2. Player PINCHES to grab a cell
3. Player DROPS cell into matching jar (Plant/Animal/Bacteria)
4. Correct jar = score + celebration
5. Wrong jar = gentle error, no punishment
6. Fill all 3 jars to complete level
```

### Levels
- Level 1: 2 cell types, large cells, slow movement
- Level 2: 3 cell types, smaller cells, medium speed
- Level 3: 3 cell types + rare "virus" cells (bonus points)

---

## Implementation Plan (2 hours)

### Unit 1: Core Logic (30 min)
**File**: `src/frontend/src/games/bubbleBiologyLogic.ts`

**Exports**:
- `CELL_TYPES` - Cell definitions with emojis
- `createCell()` - Spawn a cell
- `checkJarCollision()` - Detect if cell dropped in jar
- `calculateScore()` - Points based on level/accuracy
- `initializeGame()` - Setup state

**Cell Types**:
```typescript
const CELL_TYPES = [
  { id: 'plant', name: 'Plant Cell', emoji: '🌱', color: '#22C55E' },
  { id: 'animal', name: 'Animal Cell', emoji: '🦠', color: '#3B82F6' },
  { id: 'bacteria', name: 'Bacteria', emoji: '🔴', color: '#EF4444' },
];
```

---

### Unit 2: Basic Page + Floating Cells (30 min)
**File**: `src/frontend/src/pages/BubbleBiology.tsx`

**Features**:
- Canvas with floating cells (CSS animation)
- 3 jars at bottom (colored targets)
- Hand tracking for pinch gesture
- Cells drift slowly downward
- Tap/pinch to grab cells

---

### Unit 3: Drag & Drop + Scoring (30 min)
**Goal**: Grab cells, drop in jars, track score

**Features**:
- Pinch detection to "hold" cell
- Move hand to drag cell
- Release pinch to drop
- Collision detection with jars
- Score feedback

---

### Unit 4: Polish + Level System (30 min)
**Goal**: Multiple levels, celebrations, progression

**Features**:
- Level progression
- Cell speed increases
- Celebration particles
- Level complete screen
- Menu system

---

## Reusable Patterns

**From Fruit Ninja Air**:
- Pinch detection logic
- Hand tracking frame handling
- Falling object spawning

**From Color Potions**:
- GameShell/GameContainer pattern
- Menu controls pattern
- Celebration overlay
- Progress tracking

**From Emoji Match**:
- Grid layout for targets
- Collision detection
- Score popups

---

## Simplicity Decisions

**KEEPING SIMPLE** (MVP only):
- ✅ 3 cell types (not 10)
- ✅ Straight drop (no physics)
- ✅ Touch fallback (mouse mode)
- ✅ Basic scoring (no combos)
- ✅ No "evolution" mechanic yet
- ✅ No real biology facts yet

**POSTPONING** (complex features):
- ❌ Cell merging/evolution
- ❌ Wikipedia summaries
- ❌ Real microscope images
- ❌ Complex physics
- ❌ Multiplayer

---

## Estimated Time

- Unit 1: Logic - 30 min
- Unit 2: Page + cells - 30 min
- Unit 3: Drag/drop - 30 min
- Unit 4: Polish - 30 min

**Total**: 2 hours (simplest viable game)

---

## Acceptance Criteria

**MVP**:
- [ ] Can see 3 cell types floating
- [ ] Can pinch to grab a cell
- [ ] Can drag cell to jar
- [ ] Correct jar = +points
- [ ] Wrong jar = -points (gentle)
- [ ] Level complete celebration
- [ ] Works with mouse fallback

**Good Enough**:
- [ ] All MVP criteria
- [ ] 3 levels
- [ ] Voice announcements
- [ ] Hint system (like Color Potions)
- [ ] Progress saves

---

## Next Steps

1. ⏳ Create logic file (bubbleBiologyLogic.ts)
2. ⏳ Create page component (BubbleBiology.tsx)
3. ⏳ Add to registry
4. ⏳ Add route
5. ⏳ Test with pinch + mouse

**Starting**: Unit 1 - Core Logic
