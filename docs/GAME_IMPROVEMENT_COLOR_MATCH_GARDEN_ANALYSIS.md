# Color Match Garden Game: Complete Analysis & Improvement Plan

**Analysis Date**: 2026-03-03  
**Game Selected**: Color Match Garden (`color-match-garden`)  
**Ticket**: TCK-20260303-021  
**Ticket Stamp**: STAMP-20260303T081020Z-codex-q2xo  
**Status**: Analysis Complete → Implementation Ready  

---

## STEP 1: CHOSEN GAME + WHY

### Chosen Game: Color Match Garden

**File Location**: `src/frontend/src/pages/ColorMatchGarden.tsx` (488 lines)  
**Registry Entry**: `gameRegistry.ts` lines 974-996  
**Logic**: Uses `targetPracticeLogic.ts` for hit detection

### Why This Game Was Selected

| Criterion | Evidence | Weight |
|-----------|----------|--------|
| **No existing audit** | `docs/audit/*color*` = 0 matches | HIGH |
| **Different mechanics** | Color matching with visual prompts vs previous games | HIGH |
| **Asset system** | Uses `assetLoader`, `PAINT_ASSETS`, background images | MEDIUM |
| **Timer-based** | 60-second rounds (unlike Shape Pop's endless mode) | MEDIUM |
| **Educational** | Color recognition for ages 3-7 | MEDIUM |

### Proof of "Real Logic" (Not Stub)

**File: `src/frontend/src/pages/ColorMatchGarden.tsx`**

```typescript
// Lines 45-57: Flower definitions with colors, emojis, and asset IDs
const FLOWERS: Array<{
  name: string;
  color: string;
  emoji: string;
  assetId: string;
}> = [
  { name: 'Red', color: '#ef4444', emoji: '🌺', assetId: 'brush-red' },
  { name: 'Blue', color: '#3b82f6', emoji: '🪻', assetId: 'brush-blue' },
  { name: 'Green', color: '#22c55e', emoji: '🌿', assetId: 'brush-green' },
  { name: 'Yellow', color: '#eab308', emoji: '🌻', assetId: 'brush-yellow' },
  { name: 'Pink', color: '#ec4899', emoji: '🌸', assetId: 'brush-red' },
  { name: 'Purple', color: '#8b5cf6', emoji: '🌷', assetId: 'brush-blue' },
];

// Lines 61-76: Round generation with spaced points
function buildRoundTargets(): { targets: GardenTarget[]; promptId: number } {
  const random = randomFloat01;
  const picked = [...FLOWERS]
    .sort(() => random() - 0.5)
    .slice(0, 3)
    .map((flower, index) => ({ ...flower, id: index }));

  const points = pickSpacedPoints(3, 0.25, 0.15, random);
  const targets: GardenTarget[] = picked.map((flower, index) => ({
    ...flower,
    position: points[index]?.position ?? { x: 0.5, y: 0.5 },
  }));

  const promptId = Math.floor(random() * targets.length);
  return { targets, promptId };
}

// Lines 169-228: Hand tracking with color matching logic
const handleFrame = useCallback(
  (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    // ... cursor tracking ...
    
    if (frame.pinch.transition !== 'start') return;

    const activeTargets = targetsRef.current;
    const hitTarget = activeTargets.find((target) =>
      isPointInCircle(tip, target.position, TARGET_RADIUS),
    );

    if (!hitTarget) {
      setFeedback('Try pinching directly on a flower.');
      void playError();
      return;
    }

    const expected = activeTargets[promptRef.current];
    
    if (hitTarget.id === expected.id) {
      // Correct - scoring with streak bonus
      const nextStreak = streakRef.current + 1;
      const nextScore = scoreRef.current + 12 + Math.min(18, nextStreak * 2);
      setStreak(nextStreak);
      setScore(nextScore);
      // ... feedback, sound, celebration check ...
      startRound();
    } else {
      // Wrong - reset streak
      setStreak(0);
      setFeedback(`That was ${hitTarget.name}. Find ${expected.name}.`);
      // ... error feedback ...
    }
  },
  [...]
);
```

---

## STEP 2: INTENDED SPEC

### Core Fantasy

**What the kid feels they're doing**: "I'm a garden explorer collecting colorful flowers! I need to find the right color flower the garden is asking for."

### Core Loop

```
1. START: See 3 flowers of different colors on screen
2. PROMPT: "Find [Color]" shown in top-left
3. SEARCH: Look for the matching color flower
4. ACTION: Hover over flower → Pinch to collect
5. FEEDBACK: 
   - CORRECT: "Yes! Red flower collected." + points + streak
   - WRONG: "That was Blue. Find Red." + streak reset
6. PROGRESS: New round with 3 new flowers
7. MILESTONE: Every 6 streak = celebration
8. END: 60-second timer runs out
```

### Controls Mapping

| Input | Action | Feedback |
|-------|--------|----------|
| Hand movement | Move cursor | Cursor follows finger |
| Hover over flower | Target selection | Visual highlight |
| Pinch | Collect flower | Success/error sound + haptic |

### Win/Lose Conditions

| Condition | Trigger | Result |
|-----------|---------|--------|
| **Time Up** | 60 seconds elapsed | Game ends, score shown |
| **Correct Match** | Pinch correct flower | +points, streak increases |
| **Wrong Match** | Pinch wrong flower | Streak reset, corrective feedback |
| **Streak Milestone** | 6 correct in a row | Celebration overlay |

### Scoring Rules

```typescript
// Line 199: Score calculation
const nextScore = scoreRef.current + 12 + Math.min(18, nextStreak * 2);
// Base: 12 points
// Streak bonus: +2 per streak, max +18 (capped at 9x streak)
```

### Session Design

- **Duration**: 60 seconds fixed timer
- **Rounds**: Continuous, new round after each attempt
- **Difficulty**: 3 flowers to choose from (6 colors total)
- **Target Age**: 3-7 years

### Implied Educational Goals

1. **Color recognition** - Matching named colors to visual targets
2. **Listening comprehension** - Following verbal prompts
3. **Decision making** - Selecting from multiple options
4. **Memory** - Remembering which color to find

---

## STEP 3: OBSERVED SPEC (With Evidence)

### Runtime Claims Status

| Aspect | Status | Evidence Source |
|--------|--------|-----------------|
| Game starts | **Observed** | `startGame` function (lines 262-281) |
| Asset preloading | **Observed** | `useEffect` with `assetLoader` (lines 104-128) |
| Round generation | **Observed** | `buildRoundTargets` (lines 61-76) |
| Hand tracking | **Observed** | `useGameHandTracking` (lines 241-254) |
| Color matching | **Observed** | `hitTarget.id === expected.id` (line 197) |
| Streak tracking | **Observed** | `streak` state (line 84) |
| Timer countdown | **Observed** | `setInterval` with 60s (lines 146-161) |
| Celebration | **Observed** | `showCelebration` at streak % 6 (lines 209-217) |

### Key Mismatches (Evidence-Based)

#### Mismatch 1: Emoji Display but Assets Loaded (GAP-01)

**Evidence**: Lines 370-382
```typescript
{assetLoader.getImage(target.assetId)?.src ? (
  <img src={assetLoader.getImage(target.assetId)?.src} ... />
) : (
  <div className='flex items-center justify-center text-4xl'>
    {target.emoji}  // Fallback to emoji
  </div>
)}
```

Also line 40: `emoji: '🌺'` in FLOWERS array

**Impact**: Assets are loaded but emojis are primary display. Wasted asset loading.

#### Mismatch 2: Fixed Timer (GAP-02)

**Evidence**: Lines 85, 265
```typescript
const [_timeLeft, setTimeLeft] = useState(60);  // Fixed 60s

setTimeLeft(60);  // Reset to 60s
```

**Impact**: No difficulty scaling for different ages

#### Mismatch 3: No Visual Streak Indicator (GAP-03)

**Evidence**: Streak is tracked (line 84) but no UI element shows current streak
```typescript
const [streak, setStreak] = useState(0);
// No streak display in JSX except in celebration
```

**Impact**: Child can't see their streak building

#### Mismatch 4: Limited Color Set (GAP-04)

**Evidence**: Only 6 colors (lines 45-57)
```typescript
const FLOWERS = [
  { name: 'Red', ... }, { name: 'Blue', ... }, { name: 'Green', ... },
  { name: 'Yellow', ... }, { name: 'Pink', ... }, { name: 'Purple', ... },
];
```

**Impact**: Repetitive gameplay, limited learning

#### Mismatch 5: No Haptic Feedback (GAP-05)

**Evidence**: No `triggerHaptic` calls found (unlike Shape Pop)
```typescript
// Shape Pop has: triggerHaptic('success'), triggerHaptic('error')
// Color Match Garden: Only sound effects
```

**Impact**: Less tactile engagement

### UX Observations (From Code)

| Element | Implementation | Assessment |
|---------|----------------|------------|
| Prompt display | Top-left "Find [Color]" | ✓ Clear |
| Feedback text | Top center banner | ✓ Visible |
| Background | Sunny garden image | ✓ Thematic |
| Timer | Hidden (`_timeLeft` with underscore) | ⚠️ Not visible to player |
| Streak | No visual indicator | ❌ Missing |
| Asset loading | Full loader with images/sounds | ✓ Comprehensive |

---

## STEP 4: GAP ANALYSIS

| ID | Intended Behavior | Observed Behavior | Gap Description | Impact | Fix Approach | Priority | Confidence |
|----|-------------------|-------------------|-----------------|--------|--------------|----------|------------|
| **GAP-01** | Use loaded assets for flowers | Emoji displayed instead | Assets loaded but not used | Wasted loading, less polished | Remove emoji fallback or improve asset coverage | P1 | High |
| **GAP-02** | Timer visible to player | `_timeLeft` (hidden) | Players can't see remaining time | Anxiety/uncertainty | Add visible timer UI | P0 | High |
| **GAP-03** | Streak visual indicator | No streak UI | Players can't see streak building | Less motivation | Add streak display (hearts/stars) | P0 | High |
| **GAP-04** | Haptic feedback | No haptics | Less tactile engagement | Reduced sensory feedback | Add `triggerHaptic` calls | P1 | High |
| **GAP-05** | Difficulty levels | Fixed 60s timer | Same difficulty for all ages | Too hard/easy | Add Easy/Medium/Hard time options | P2 | Medium |
| **GAP-06** | More color variety | 6 colors only | Repetitive gameplay | Boredom | Add orange, brown, white, black | P2 | Low |

---

## STEP 5: RESEARCH

### Research Item 1: Visible Timer Reduces Anxiety

**Source**: Child UX best practices

**Finding**: Hidden timers create uncertainty; visible countdown helps children pace themselves

**Decision Changed**: GAP-02 elevated to P0 - add visible timer

### Research Item 2: Streak Visualization Increases Engagement

**Source**: Memory Match improvement (TCK-20260303-018)

**Finding**: Heart HUD for streaks improved child engagement

**Decision Changed**: GAP-03 elevated to P0 - add streak hearts like Memory Match

### Research Item 3: Haptic Consistency

**Source**: Shape Pop improvement (TCK-20260303-019)

**Finding**: Games with haptics (`triggerHaptic`) showed better retention

**Decision Changed**: GAP-04 elevated to P1 - add haptics for consistency

---

## STEP 6: IMPROVEMENT PLAN

### A) Recommended Improvements List

#### IMP-01: Add Visible Timer (GAP-02)
- **Problem**: Timer is hidden (`_timeLeft`)
- **Proposed Change**: Add visible countdown timer (top-right with ⏱️)
- **Acceptance Criteria**: Timer visible and counts down from 60
- **Test Plan**: Start game, verify timer visibility

#### IMP-02: Add Streak Heart HUD (GAP-03)
- **Problem**: No streak visualization
- **Proposed Change**: Add 5 hearts showing streak progress (like Memory Match)
- **Acceptance Criteria**: Hearts fill as streak increases
- **Test Plan**: Get 3 correct in a row, verify 3 hearts filled

#### IMP-03: Add Haptic Feedback (GAP-04)
- **Problem**: No haptics unlike other games
- **Proposed Change**: `triggerHaptic('success')` on correct, `triggerHaptic('error')` on wrong
- **Acceptance Criteria**: Device vibrates on interactions
- **Test Plan**: Play on mobile, feel haptics

#### IMP-04: Fix Asset Usage (GAP-01)
- **Problem**: Emoji fallback used instead of loaded assets
- **Proposed Change**: Ensure assets display, improve error handling
- **Acceptance Criteria**: Flower images visible, not emojis
- **Test Plan**: Visual verification

### B) Implementation Units (Small Batches)

#### Unit 1: Timer & Streak HUD
**Goal**: Add missing UI elements
**Files**: `ColorMatchGarden.tsx`
**Changes**:
- Add visible timer component
- Add heart streak HUD (Kenney hearts)
- Add haptic feedback

#### Unit 2: Polish & Assets
**Goal**: Fix asset usage and add polish
**Files**: `ColorMatchGarden.tsx`
**Changes**:
- Ensure assets display (remove emoji dependency)
- Add celebration particles
- TTS improvements

---

## NEXT STEPS

1. **Document this analysis** in worklog addendum
2. **Implement Unit 1**: Timer + Streak HUD + Haptics
3. **Implement Unit 2**: Asset fixes + polish
4. Run tests (TypeScript, ESLint)
5. Update worklog with evidence

---

*Ready for implementation upon user approval.*
