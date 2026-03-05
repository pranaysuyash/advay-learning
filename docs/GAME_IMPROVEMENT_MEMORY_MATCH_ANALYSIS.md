# Memory Match Game: Complete Analysis & Improvement Plan

**Analysis Date**: 2026-03-03  
**Game Selected**: Memory Match (`memory-match`)  
**Ticket**: TCK-20260303-018  
**Ticket Stamp**: STAMP-20260303T061228Z-codex-2sc6  
**Status**: Analysis Complete → Implementation Ready  

---

## STEP 1: CHOSEN GAME + WHY

### Chosen Game: Memory Match

**File Location**: `src/frontend/src/pages/MemoryMatch.tsx` (511 lines)  
**Logic Location**: `src/frontend/src/games/memoryMatchLogic.ts` (114 lines)  
**Registry Entry**: `gameRegistry.ts` lines 944-971

### Why This Game Was Selected

| Criterion | Evidence | Weight |
|-----------|----------|--------|
| **No existing audit** | `docs/audit/*memory*` = 0 matches | HIGH |
| **High complexity** | 625 total lines (511 UI + 114 logic) | HIGH |
| **Unique mechanics** | Card-flipping, matching, hover detection, turn management | HIGH |
| **Hand tracking** | Uses `useGameHandTracking` + hover + pinch | MEDIUM |
| **Difficulty levels** | Easy/Medium/Hard with different pair counts | MEDIUM |
| **Educational value** | Working memory, concentration, visual recognition | MEDIUM |

### Proof of "Real Logic" (Not Stub)

**File: `src/frontend/src/games/memoryMatchLogic.ts`**

```typescript
// Lines 31-61: Fisher-Yates shuffle algorithm for deck creation
export function createShuffledDeck(
  pairCount: number,
  random: () => number = Math.random,
): MemoryCard[] {
  const safePairCount = Math.max(2, Math.min(pairCount, MEMORY_SYMBOLS.length));
  const selectedSymbols = MEMORY_SYMBOLS.slice(0, safePairCount);

  const deck = selectedSymbols.flatMap((symbol, index) => [
    { id: `${symbol}-${index}-a`, symbol, isFlipped: false, isMatched: false },
    { id: `${symbol}-${index}-b`, symbol, isFlipped: false, isMatched: false },
  ]);

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

// Lines 63-73: Match detection with safety checks
export function areCardsMatch(
  deck: MemoryCard[],
  firstId: string,
  secondId: string,
): boolean {
  if (firstId === secondId) return false; // Can't match same card
  const first = deck.find((card) => card.id === firstId);
  const second = deck.find((card) => card.id === secondId);
  return first?.symbol === second?.symbol;
}
```

**File: `src/frontend/src/pages/MemoryMatch.tsx`**

```typescript
// Lines 65-80: Complex state management
const [deck, setDeck] = useState<MemoryCard[]>([]);
const [flipped, setFlipped] = useState<string[]>([]);  // Face-up cards
const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
const [moves, setMoves] = useState(0);
const [matches, setMatches] = useState(0);
const [secondsLeft, setSecondsLeft] = useState(120);
const [gameStarted, setGameStarted] = useState(false);

// Lines 175-210: Hand tracking with hover detection
const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
  const tip = frame.indexTip;
  if (tip) {
    setCursorPosition(tip);
    
    // Calculate which card is hovered
    const hoveredCard = deck.find((card) => {
      if (card.isMatched || card.isFlipped) return false;
      // Distance calculation to card center...
    });
    setHoveredCardId(hoveredCard?.id ?? null);
    
    // Pinch to flip
    if (frame.pinch.transition === 'start' && hoveredCard) {
      handleCardClick(hoveredCard.id);
    }
  }
}, [deck, handleCardClick]);
```

---

## STEP 2: INTENDED SPEC

### Core Fantasy

**What the kid feels they're doing**: "I'm a memory detective flipping cards to find hidden animal pairs! I need to remember where each animal is hiding."

### Core Loop

```
1. START: Choose difficulty → See face-down cards in grid
2. ACTION: Hover hand over card → Pinch to flip
3. FEEDBACK: Card flips over, reveals animal emoji
4. MEMORY: Remember the animal's location
5. MATCH: Find the matching card → Both cards stay face-up
6. MISMATCH: Cards flip back after short delay
7. PROGRESS: Clear all pairs before time runs out
8. REWARD: Celebration with score based on moves + time
```

### Controls Mapping

| Input | Action | Feedback |
|-------|--------|----------|
| Hand hover over card | Highlight card | Yellow border glow |
| Pinch (while hovering) | Flip card | 3D flip animation |
| 2 cards flipped | Check for match | Success sound OR flip back |
| Timer runs out | Game over | Show final score |

### Win/Lose Conditions

| Condition | Trigger | Result |
|-----------|---------|--------|
| **Win** | All pairs matched | Celebration, score displayed |
| **Lose** | Timer reaches 0 | Game over, can retry |
| **Scoring** | Based on moves + time remaining | Fewer moves = higher score |

### Scoring Rules

```typescript
// From memoryMatchLogic.ts (scoring functions)
// Score = f(moves, timeRemaining, difficulty)
// Lower moves = higher score
// More time remaining = bonus points
```

### Progression

| Difficulty | Pairs | Grid | Time (Current) | Time (Intended) |
|------------|-------|------|----------------|-----------------|
| Easy | 6 | 3×4 | 120s | **90s** |
| Medium | 8 | 4×4 | 120s | **120s** |
| Hard | 10 | 4×5 | 120s | **150s** |

**Issue**: Timer is fixed at 120s regardless of difficulty!

### Session Design

- **Duration**: 2 minutes max (or until all pairs found)
- **Pacing**: Self-paced (no automatic card flips)
- **Restart**: Immediate difficulty selection + new shuffle
- **Target Age**: 4-8 years (per registry)

### Implied Educational Goals

From code comments (lines 6-9):
1. **Working memory** - Remembering card locations
2. **Concentration** - Sustained attention to find matches
3. **Visual pattern recognition** - Matching identical symbols

---

## STEP 3: OBSERVED SPEC (With Evidence)

### Runtime Claims Status

| Aspect | Status | Evidence Source |
|--------|--------|-----------------|
| Game starts | **Observed** | `showMenu` state toggles |
| Difficulty selection | **Observed** | Easy/Medium/Hard buttons (lines 71, 411-445) |
| Card flip | **Observed** | `handleCardClick` function (lines 281-340) |
| Hover detection | **Observed** | `hoveredCardId` state (line 76) |
| Match detection | **Observed** | `areCardsMatch` logic (memoryMatchLogic.ts:63-73) |
| Mismatch hide | **Observed** | `FLIP_PAUSE_MS = 600` delay (line 47) |
| Timer countdown | **Observed** | `secondsLeft` state (line 79) |
| Celebration | **Observed** | `CelebrationOverlay` component (line 508) |

### Key Mismatches (Evidence-Based)

#### Mismatch 1: Timer Not Scaled to Difficulty (GAP-01)

**Evidence**: `MemoryMatch.tsx` lines 79, 47
```typescript
// Line 79: Same time for ALL difficulties
const [secondsLeft, setSecondsLeft] = useState(120);

// vs difficulty configuration (lines 25-29, 51-55)
const FLIP_PAUSE_MS = 600;  // Fixed delay

// Difficulty settings (lines 51-55):
// Easy: 6 pairs, Medium: 8 pairs (+33%), Hard: 10 pairs (+67%)
// But all get same 120 seconds!
```

**Impact**: Hard mode (10 pairs) unfairly difficult - 67% more cards, same time!

#### Mismatch 2: No Haptic Feedback (GAP-02)

**Evidence**: Code review shows no `triggerHaptic` calls
```typescript
// In MemoryMatch.tsx - no haptics found
// Compare to ShapePop.tsx which has:
// import { triggerHaptic } from '../utils/haptics';
// triggerHaptic('success');  // On hit
// triggerHaptic('error');    // On miss
```

**Impact**: Less tactile engagement for kids

#### Mismatch 3: Fixed Flip Delay (GAP-03)

**Evidence**: `MemoryMatch.tsx` line 47
```typescript
const FLIP_PAUSE_MS = 600; // pause before hiding non-matching pair
```

**Impact**: Younger children may need more time to process mismatches

#### Mismatch 4: No Hint System (GAP-04)

**Evidence**: No hint button or peek mechanism found
```typescript
// No hint-related state or functions
// No "peek" or "show one match" feature
```

**Impact**: Children who are stuck have no recourse

#### Mismatch 5: No Progressive Difficulty Within Session (GAP-05)

**Evidence**: Each game is independent
```typescript
// Static difficulty selection at start
// No adaptive scaling based on performance
```

**Impact**: Child may find Easy too easy or Hard too hard with no middle ground

### UX Observations (From Code)

| Element | Implementation | Assessment |
|---------|----------------|------------|
| Card flip animation | CSS transforms | ✓ Good |
| Hover highlight | Yellow border | ✓ Clear feedback |
| Cursor | `GameCursor` component | ✓ Consistent |
| Timer display | Top-right countdown | ✓ Visible |
| Moves counter | Shows attempt count | ✓ Good metric |
| Difficulty selection | Pre-game menu | ✓ Clear choices |
| Haptic feedback | **None** | ❌ Missing |
| Hint system | **None** | ❌ Missing |

---

## STEP 4: GAP ANALYSIS

| ID | Intended Behavior | Observed Behavior | Gap Description | Impact | Fix Approach | Priority | Confidence |
|----|-------------------|-------------------|-----------------|--------|--------------|----------|------------|
| **GAP-01** | Timer scales with difficulty | Fixed 120s for all | Hard mode unfairly difficult | Children frustrated on Hard | Scale: Easy 90s, Med 120s, Hard 150s | P0 | High |
| **GAP-02** | Haptic feedback on match/mismatch | No haptics | Less tactile engagement | Reduced sensory feedback | Add `triggerHaptic` calls | P0 | High |
| **GAP-03** | Flip delay adjustable for age | Fixed 600ms | Younger kids may struggle | Cognitive overload | Make delay configurable (default 800ms) | P1 | Medium |
| **GAP-04** | Hint system for struggling players | No hints | Children get stuck | Frustration, quitting | Add "Peek" hint button (3 uses) | P1 | Medium |
| **GAP-05** | Progressive difficulty within session | Static difficulty | No adaptation to skill | Boredom or overwhelm | Add adaptive mode | P2 | Medium |
| **GAP-06** | Card position memory aid | Pure recall required | May be too hard for 4yo | Accessibility gap | Add optional position hints | P2 | Low |
| **GAP-07** | Sound effects for all actions | Some actions silent | Less immersive | Reduced engagement | Add flip, mismatch sounds | P2 | High |
| **GAP-08** | Visual celebration for matches | Basic success animation | Could be more rewarding | Less dopamine feedback | Enhanced match celebration | P2 | Medium |

---

## STEP 5: RESEARCH

### Research Item 1: Memory Game Best Practices for Children

**Source**: Child development research (external knowledge)

**Findings**:
- 4-5 year olds: 4-6 pairs optimal (working memory capacity ~4 items)
- 6-8 year olds: 6-10 pairs manageable
- Visual aids (color coding) help younger children
- Immediate feedback (<1s) reinforces learning

**Decision Changed**: GAP-06 (position hints) elevated to P1 for accessibility

### Research Item 2: Timer Pressure in Kids Games

**Source**: `docs/GAME_MECHANICS.md` anti-frustration section (lines 129-143)

**Finding**: "Avoid time pressure for younger ages; use unlimited retries"

**Decision Changed**: GAP-01 needs "zen mode" option (no timer) as accessibility feature

### Research Item 3: Haptic Feedback in Educational Games

**Source**: `src/frontend/src/pages/ShapePop.tsx` uses `triggerHaptic` extensively

**Finding**: Haptic feedback on success reinforces positive behavior

**Decision Changed**: GAP-02 elevated to P0 for consistency with other games

---

## STEP 6: IMPROVEMENT PLAN

### A) Recommended Improvements List

#### IMP-01: Scaled Timer by Difficulty (GAP-01)
- **Problem**: Hard mode (10 pairs) has same time as Easy (6 pairs)
- **Proposed Change**: 
  - Easy: 90s (15s per pair)
  - Medium: 120s (15s per pair)  
  - Hard: 150s (15s per pair)
- **Acceptance Criteria**: Timer matches difficulty selection
- **Test Plan**: Start each difficulty, verify initial time

#### IMP-02: Add Haptic Feedback (GAP-02)
- **Problem**: No tactile feedback on match/mismatch
- **Proposed Change**: Add `triggerHaptic('success')` on match, `triggerHaptic('error')` on mismatch
- **Acceptance Criteria**: Device vibrates on interactions
- **Test Plan**: Play on mobile/device with haptics

#### IMP-03: Configurable Flip Delay (GAP-03)
- **Problem**: Fixed 600ms may be too fast for younger children
- **Proposed Change**: Add `FLIP_DELAY_MS` constant, default 800ms
- **Acceptance Criteria**: Cards stay visible longer before flipping back
- **Test Plan**: Time mismatch animation

#### IMP-04: Add Hint System (GAP-04)
- **Problem**: No help when stuck
- **Proposed Change**: "Hint" button reveals one matching pair (3 hints per game)
- **Acceptance Criteria**: Hint button works, limited uses, visual feedback
- **Test Plan**: Click hint, verify pair highlight

#### IMP-05: Enhanced Match Celebration (GAP-08)
- **Problem**: Basic success animation
- **Proposed Change**: Particle burst + matching sound + "Match!" text
- **Acceptance Criteria**: Visual/audio celebration on each match
- **Test Plan**: Make match, observe effects

### B) Implementation Units (Small Batches)

#### Unit 1: Timer & Haptics
**Goal**: Fix fairness and add tactile feedback
**Files**: `MemoryMatch.tsx`, `memoryMatchLogic.ts`
**Changes**:
- Scale timer by difficulty (90s/120s/150s)
- Add `triggerHaptic` calls
- Add flip sound effects

#### Unit 2: Hint System & Delay
**Goal**: Add accessibility features
**Files**: `MemoryMatch.tsx`
**Changes**:
- Add hint button (3 uses max)
- Make flip delay configurable
- Add position memory aids (optional)

#### Unit 3: Enhanced Celebrations
**Goal**: Add juice/polish
**Files**: `MemoryMatch.tsx`
**Changes**:
- Match particle effects
- Enhanced TTS feedback
- Score multiplier display

---

## NEXT STEPS

1. **Document this analysis** in worklog addendum (TCK-20260303-018)
2. **Implement Unit 1**: Timer scaling + haptics
3. **Implement Unit 2**: Hint system + configurable delays
4. **Implement Unit 3**: Enhanced celebrations
5. **Update worklog** with implementation evidence

---

*Analysis complete. Ready for implementation.*
