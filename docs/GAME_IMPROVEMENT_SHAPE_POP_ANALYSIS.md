# Shape Pop Game: Complete Analysis & Improvement Plan

**Analysis Date**: 2026-03-03  
**Game Selected**: Shape Pop (`shape-pop`)  
**Ticket**: TCK-20260303-019  
**Ticket Stamp**: STAMP-20260303T064434Z-codex-kivm  
**Status**: Analysis Complete → Implementation Ready  

---

## STEP 1: CHOSEN GAME + WHY

### Chosen Game: Shape Pop

**File Location**: `src/frontend/src/pages/ShapePop.tsx` (279 lines)  
**Registry Entry**: `gameRegistry.ts` lines 891-923  
**Logic**: Uses `targetPracticeLogic.ts` for point calculations

### Why This Game Was Selected

| Criterion | Evidence | Weight |
|-----------|----------|--------|
| **No existing audit** | `docs/audit/*shape*` = 0 matches | HIGH |
| **Different mechanics** | Target practice with hand tracking vs Bubble Pop (microphone) vs Memory Match (cards) | HIGH |
| **Good precedent** | Already has haptics implemented (reference for other games) | MEDIUM |
| **Kid-friendly** | Designed for ages 3-7 with larger hit radius | MEDIUM |
| **Easter egg system** | Already has `egg-diamond-pop` easter egg (line 90) | LOW |

### Proof of "Real Logic" (Not Stub)

**File: `src/frontend/src/pages/ShapePop.tsx`**

```typescript
// Lines 21-26: Game constants tuned for kids
const SHAPES = ['◯', '△', '□', '◇', '☆'] as const;
const POP_RADIUS = 0.16; // Increased from 0.11 for kids' easier targeting
const CURSOR_SIZE = 84; // Increased for easier visibility
const TARGET_SIZE = 144; // Increased for kids' fingers

// Lines 60-114: Hand tracking frame handler with pinch detection
const handleFrame = useCallback(
  (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) {
      if (cursor !== null) setCursor(null);
      return;
    }

    // Update cursor position
    if (!cursor || cursor.x !== tip.x || cursor.y !== tip.y) {
      setCursor(tip);
    }

    // Only trigger on pinch START (not hold)
    if (frame.pinch.transition !== 'start') return;

    // Hit detection
    const inside = isPointInCircle(tip, targetCenter, POP_RADIUS);
    if (inside) {
      // Score, feedback, haptics, TTS, easter egg check
      const nextScore = scoreRef.current + 15;
      // ... celebration logic
    }
  },
  [...]
);
```

### What I Expect to Learn That Generalizes

1. **Target practice mechanics** - Hit radius, positioning, cursor feedback
2. **Easter egg implementation** - Speed-based achievement system
3. **Haptic integration** - Success/error/celebration patterns
4. **Level calculation** - Score-based level system (line 182)

---

## STEP 2: INTENDED SPEC

### Core Fantasy

**What the kid feels they're doing**: "I'm a shape-popping wizard! I point at shapes with my finger magic and pinch to make them pop!"

### Core Loop

```
1. START: See floating shape on screen
2. ACTION: Move finger cursor into shape ring
3. FEEDBACK: Cursor hovers, shape is targetable
4. PINCH: Pinch fingers to "pop" the shape
5. SUCCESS: Shape disappears, score increases, praise given
6. PROGRESS: Every 120 points = celebration + level up
7. EASTER EGG: Pop 20 shapes in 30s = diamond reward
8. REWARD: Celebration overlay at milestones
```

### Controls Mapping

| Input | Action | Feedback |
|-------|--------|----------|
| Hand movement | Move cursor | Blue finger cursor follows |
| Cursor in ring | Target ready | Shape ring visible |
| Pinch | Pop shape | Haptic + sound + TTS praise |
| Rapid popping | Easter egg | Special reward |

### Win/Lose Conditions

| Condition | Trigger | Result |
|-----------|---------|--------|
| **Milestone** | Score divisible by 120 | Celebration overlay |
| **Easter Egg** | 20 pops in 30 seconds | `egg-diamond-pop` triggered |
| **Continuous play** | No end condition | Self-directed play |

### Scoring Rules

```typescript
// Line 76: Fixed 15 points per pop
const nextScore = scoreRef.current + 15;

// Line 182: Level = floor(score / 120) + 1
level={Math.max(1, Math.floor(score / 120) + 1)}
```

### Session Design

- **Duration**: Unlimited (no timer)
- **Pacing**: Self-paced, "Take your time!" message (line 197)
- **Restart**: Any time via controls
- **Target Age**: 3-7 years (per registry)

### Implied Educational Goals

1. **Hand-eye coordination** - Moving cursor to target
2. **Fine motor control** - Pinch gesture
3. **Shape recognition** - 5 different shapes
4. **Cause and effect** - Action → immediate feedback

---

## STEP 3: OBSERVED SPEC (With Evidence)

### Runtime Claims Status

| Aspect | Status | Evidence Source |
|--------|--------|-----------------|
| Game starts | **Observed** | `startGame` function (lines 133-147) |
| Hand tracking | **Observed** | `useGameHandTracking` hook (lines 116-125) |
| Cursor movement | **Observed** | `setCursor(tip)` (line 69) |
| Pinch detection | **Observed** | `frame.pinch.transition !== 'start'` (line 72) |
| Hit detection | **Observed** | `isPointInCircle` (line 74) |
| Haptic feedback | **Observed** | `triggerHaptic` (lines 84, 110) |
| TTS feedback | **Observed** | `speak()` calls (lines 80-81, 98, 107) |
| Easter egg | **Observed** | `popWindowRef` tracking (lines 86-91) |
| Celebration | **Observed** | `showCelebration` state (lines 93-101) |

### Key Mismatches (Evidence-Based)

#### Mismatch 1: Flat Scoring (GAP-01)

**Evidence**: Lines 76, 182
```typescript
const nextScore = scoreRef.current + 15;  // Always 15 points

level={Math.max(1, Math.floor(score / 120) + 1)}  // Level every 8 pops
```

**Impact**: No difficulty progression, no reward for accuracy/speed

#### Mismatch 2: No Difficulty Levels (GAP-02)

**Evidence**: No difficulty selection UI, no scaling
```typescript
// No difficulty state or configuration
// Target size, pop radius are constants
```

**Impact**: Same challenge for 3yo and 7yo

#### Mismatch 3: No Miss Penalty or Feedback (GAP-03)

**Evidence**: Lines 104-111
```typescript
} else {
  setFeedback('Close! Move into the ring, then pinch.');
  // ... haptic and sound
  // But NO score penalty, no streak reset
}
```

**Impact**: No consequence for misses, less incentive for accuracy

#### Mismatch 4: Fixed Target Size (GAP-04)

**Evidence**: Line 26
```typescript
const TARGET_SIZE = 144; // Fixed for all ages
```

**Impact**: May be too small for younger children

#### Mismatch 5: No Progressive Challenge (GAP-05)

**Evidence**: `spawnTarget` (lines 55-58) - random position only
```typescript
const spawnTarget = useCallback(() => {
  setTargetCenter(pickRandomPoint(randomFloat01(), randomFloat01(), 0.18));
  setTargetShape(SHAPES[Math.floor(randomFloat01() * SHAPES.length)] ?? '◯');
  // No speed increase, no size change, no complexity increase
}, []);
```

**Impact**: Game doesn't get harder as child improves

### UX Observations (From Code)

| Element | Implementation | Assessment |
|---------|----------------|------------|
| Cursor | `GameCursor` with 👆 icon | ✓ Good |
| Haptics | Success/error/celebration | ✓ Excellent |
| TTS | Random praises + feedback | ✓ Good variety |
| Visual | Fuchsia ring + shape | ✓ Clear target |
| Feedback text | Top center banner | ✓ Visible |
| "Take your time!" | Static message | ✓ Kid-friendly |

---

## STEP 4: GAP ANALYSIS

| ID | Intended Behavior | Observed Behavior | Gap Description | Impact | Fix Approach | Priority | Confidence |
|----|-------------------|-------------------|-----------------|--------|--------------|----------|------------|
| **GAP-01** | Progressive scoring (combo bonus) | Fixed 15 pts/pop | No reward for skill | Less engagement | Add combo multiplier | P0 | High |
| **GAP-02** | Difficulty selection | No difficulty levels | Same for all ages | Too hard/easy | Add Easy/Medium/Hard | P0 | High |
| **GAP-03** | Miss penalty or streak | No consequence for miss | Less accuracy incentive | Sloppy play | Add streak system | P1 | Medium |
| **GAP-04** | Adaptive target size | Fixed 144px | May be too small for 3yo | Accessibility | Scale by age | P1 | Medium |
| **GAP-05** | Progressive challenge | Static difficulty | No skill progression | Boredom | Add speed/complexity scaling | P2 | Low |
| **GAP-06** | Variety in gameplay | 5 shapes only | Limited variety | Repetitive | Add more shapes/modes | P2 | Low |

---

## STEP 5: RESEARCH

### Research Item 1: Combo Scoring in Kids Games

**Source**: Bubble Pop improvement (TCK-20260303-001)

**Finding**: Combo bonus (+5 per extra) increased engagement

**Decision Changed**: GAP-01 (combo system) elevated to P0

### Research Item 2: Adaptive Difficulty

**Source**: `docs/GAME_MECHANICS.md`

**Finding**: "Anti-frustration: the game adapts down before the child quits"

**Decision Changed**: GAP-02 (difficulty levels) needs auto-adapt mode

---

## STEP 6: IMPROVEMENT PLAN

### A) Recommended Improvements List

#### IMP-01: Combo Scoring System (GAP-01)
- **Problem**: Fixed 15 points per pop
- **Proposed Change**: 
  - Base: 10 points
  - Combo: +5 per consecutive hit (max +25)
  - Streak bonus: 5x hits = +50 bonus
- **Acceptance Criteria**: Score reflects accuracy
- **Test Plan**: Hit 5 shapes in row, verify increasing score

#### IMP-02: Difficulty Selection (GAP-02)
- **Problem**: No difficulty levels
- **Proposed Change**: Add Easy/Medium/Hard selector
  - Easy: Large targets (180px), big hit radius (0.20)
  - Medium: Current settings
  - Hard: Small targets (120px), small hit radius (0.12)
- **Acceptance Criteria**: Menu shows 3 options, settings applied
- **Test Plan**: Select each difficulty, verify target size

#### IMP-03: Streak System (GAP-03)
- **Problem**: No consequence for misses
- **Proposed Change**: 
  - Streak counter visible
  - Miss resets streak
  - 5x streak = bonus points
- **Acceptance Criteria**: Streak UI visible, resets on miss
- **Test Plan**: Hit 3, miss 1, verify streak resets

### B) Implementation Units (Small Batches)

#### Unit 1: Combo Scoring
**Goal**: Add skill-based scoring
**Files**: `ShapePop.tsx`
**Changes**:
- Add streak state
- Modify score calculation
- Add streak UI

#### Unit 2: Difficulty Selection
**Goal**: Add accessibility
**Files**: `ShapePop.tsx`
**Changes**:
- Add difficulty menu
- Scale target/hit radius
- Persist selection

---

*Ready for implementation after user confirmation.*
