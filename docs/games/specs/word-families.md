# Word Families - Game Specification

> **Slug:** `word-families`  
> **World:** Word Workshop  
> **CV Mode:** Hand Tracking (`cv: ['hand']`)  
> **File:** `src/frontend/src/pages/WordFamilies.tsx` (PLANNED)  
> **Logic:** `src/frontend/src/games/wordFamiliesLogic.ts` (PLANNED)  
> **Registry:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts` (TO ADD)  
> **Version:** 1.0 (Design Spec)  
> **Last Updated:** 2026-04-03  
> **Status:** NOT YET IMPLEMENTED  

---

## Section 1: Concept Summary

| Attribute | Value |
|-----------|-------|
| **One-line concept** | Children build words by combining onsets and rimes to discover word families and spelling patterns |
| **Genre** | Educational / Phonics / Word Building / Spelling |
| **Target audience** | Ages 5-7 (early readers developing decoding skills) |
| **Core player fantasy** | Being a "word architect" who constructs words from building blocks to populate a magical village |
| **Primary skill tested** | Decoding (sounding out words), onset-rime segmentation, spelling patterns |
| **Session length** | 6-10 minutes (8 rounds per game) |
| **Platform context** | Multi-modal vision platform - hand tracking for drag-and-drop word building |

**Educational Foundation:**
- Based on research that onset-rime awareness bridges phonological awareness and phonics
- Word families (-at, -an, -ake) help children recognize spelling patterns
- Decoding practice essential for reading fluency (National Reading Panel, 2000)
- Builds on Rhyme Time by adding visual/spelling component

**Distinction from Rhyme Time:**
- Rhyme Time = Auditory matching (sounds the same)
- Word Families = Visual + Auditory construction (spelling patterns)

---

## Section 2: Repo Status

### Implementation Status: ❌ NOT IMPLEMENTED

**What Exists:**
- ⚠️ Concept documented in this specification
- ⚠️ Similar pattern exists in Rhyme Time (can reuse hooks/patterns)
- ⚠️ Word families data exists in rhymeTimeLogic.ts (can extend)

**What is Needed:**
- ❌ WordFamilies.tsx page component
- ❌ wordFamiliesLogic.ts game logic
- ❌ Game registry entry
- ❌ Route in appRoutes.tsx
- ❌ Lazy import in lazyPages

**Evidence:**
- No file at `src/frontend/src/pages/WordFamilies.tsx`
- No grep matches for "word-families" or "WordFamilies" in codebase
- Related implementation exists: Rhyme Time (similar mechanics)

**Confidence Level:** High - Clear implementation path from existing Rhyme Time code

---

## Section 3: Current Implementation

### Status: NOT IMPLEMENTED

This section describes the **planned implementation** based on patterns from Rhyme Time and other Word Workshop games.

### Proposed Flow
```
Difficulty Menu → Word Building Round → Feedback → Next Round → Completion Screen
     ↓                    ↓                  ↓            ↓
  Select Level    Drag/Select Onset     Correct/    Continue
  (3 options)      + Rime Blocks       Incorrect   (8 rounds)
```

### Planned Controls

**Primary (Hand Tracking):**
- Point to hover over letter/onset blocks
- Pinch to grab a block
- Drag (while pinching) to move block to construction area
- Release pinch to drop block
- Pinch on "Build" button to confirm word

**Fallback (Mouse/Touch):**
- Click to select block
- Drag to construction area
- Click "Build" to confirm

### Planned Mechanics

1. **Round Structure:**
   - Target word family displayed (e.g., "-at family")
   - Onset options shown (c-, b-, h-, m-, r-, s-)
   - Rime block fixed (at)
   - Child combines to build words

2. **Scoring:**
   - Base points: 20 per valid word built
   - Family completion bonus: 50 for building all family members
   - Speed bonus: +10 if completed within time (optional)
   - Streak bonus: +5 per consecutive correct word

3. **Difficulty Scaling:**
   | Level | Families | Blocks | Challenge |
   |-------|----------|--------|-----------|
   | Easy  | 3 short vowel | 3 onsets | CVC words only |
   | Medium| 5 mixed | 4 onsets | CVC + CVCE |
   | Hard  | 8+ mixed | 5-6 onsets | All + digraphs |

### Visual Design (Planned)

- **Theme:** Word construction site / Magical library
- **Background:** Bookshelf or building blocks aesthetic
- **Character:** Friendly robot librarian or builder owl
- **Blocks:** 3D-style letter blocks that snap together
- **Construction Area:** Visual "word slot" where blocks combine
- **Family Display:** House-shaped container for completed words

---

## Section 4: Intended Design

### Educational Goal
Develop **decoding skills** through onset-rime manipulation. Children learn that words can be broken into parts and recombined, a foundational skill for reading unfamiliar words.

### Pedagogical Approach

**1. Explicit Pattern Recognition:**
- Visual highlighting of rime (family) in one color
- Onset in different color
- Shows spelling-sound correspondence

**2. Manipulative Learning:**
- Physical act of combining blocks reinforces mental segmentation
- Multiple modalities: see, hear, and "touch" word parts

**3. Systematic Progression:**
- Short vowel families first (-at, -an, -ig)
- Silent e families (-ake, -ine, -ore)
- Digraph onsets (sh-, ch-, th-) for advanced

### Difficulty Progression

| Stage | Family Types | Examples | Skill |
|-------|--------------|----------|-------|
| Initial | CVC short vowel | cat, bat, hat | Basic blending |
| Developing | CVC variety | dog, log, frog | Pattern transfer |
| Intermediate | CVCE silent e | cake, make, bake | Long vowel rule |
| Advanced | Digraph onsets | ship, shop, sharp | Complex onsets |

### Accessibility

- **Audio blending:** TTS says onset, then rime, then blended word
- **Visual highlighting:** Onset and rime color-coded
- **Error tolerance:** Invalid combinations simply don't snap together
- **Multiple attempts:** Can try different onsets without penalty
- **Large grab zones:** Blocks easy to grab with hand tracking

### Engagement

- **Construction metaphor:** Building words like building with blocks
- **Family houses:** Each completed family fills a house in "Word Village"
- **Block animations:** Satisfying snap-together effects
- **Character reactions:** Owl/robot celebrates each valid word
- **Collection aspect:** "Collect all 6 words in the -at family!"

### Core Loop

```
See Target Family → Select Onset Block → Drag to Rime → Build Word → Hear Result → Add to Collection
        ↓                   ↓                  ↓            ↓               ↓
   (Visual pattern)    (Choose start)    (Combine)    (TTS speaks)    (Progress toward
                                                               family completion)
```

---

## Section 5: Drift Analysis

### Status: NOT APPLICABLE (Not Yet Implemented)

Since this game does not exist yet, this section will be populated after initial implementation.

**Expected Alignment Targets:**
- Hand tracking drag-and-drop: 100% critical
- TTS for all word parts: 100% critical  
- Visual block snapping: 95% important
- Family completion tracking: 90% important
- Character reactions: 80% nice-to-have

---

## Section 6: Recommended Canonical Version

### Core Features to Implement

**Phase 1 (MVP):**
1. Drag-and-drop word building with hand tracking
2. 6 CVC word families (-at, -an, -ig, -op, -ug, -et)
3. TTS for onset, rime, and blended word
4. Family completion tracking
5. Basic scoring and completion screen

**Phase 2 (Enhancement):**
6. Owl/robot character with expressions
7. Word Village visualization (houses fill as families complete)
8. Silent e families (-ake, -ine, -ore, -ute)
9. Invalid combination feedback (gentle "try another")
10. Streak and bonus system

**Phase 3 (Polish):**
11. Digraph onsets for hard mode
12. Sentence building with created words
13. Word family "dictionary" showing all collected words
14. Parent progress report

### Experimental Features

- **Voice blending:** Child says onset, TTS says rime, together make word
- **Block physics:** Blocks have weight/bounce when dropped
- **Multiplayer:** Race to build words from same family
- **Word creation:** Add custom words to families

---

## Section 7: Visual Identity

### Overall Look
Constructive and organized - like a colorful building workshop for words.

### Camera View
Standard webcam view with construction area centered. Blocks appear in lower portion, construction area in center.

### Art Style
- **3D block aesthetic** with shadows and depth
- **Construction theme** - hard hats, tools (playful)
- **Color-coded:** Onsets (blue), rimes (green), blended (purple)
- **Kenney assets** for UI elements (blocks, houses)
- **SVG character** - wise owl or helpful robot

### Mood
Busy, productive, and satisfying. "I'm building something!"

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Onset blocks | Blue | #3b82f6 |
| Rime blocks | Green | #22c55e |
| Combined word | Purple | #8b5cf6 |
| Valid snap | Gold flash | #f59e0b |
| Invalid try | Gentle red | #fca5a5 |
| Background | Warm white | #fffbeb |
| Houses | Pastel colors | Varies by family |

### Environment
Word construction workshop with shelves of blocks, partially built word families, and a growing "Word Village" showing progress.

### UI Style
- **Blocks:** 3D effect with top/side shading, rounded edges
- **Snap zones:** Dashed outlines with glow on hover
- **Houses:** Simple shapes that fill with words
- **Progress:** Village view with family houses

### Active Vibe
Productive and hands-on. Satisfying snap effects and building sounds.

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Difficulty Menu** | Select game difficulty | Character intro, 3 difficulty cards, family preview |
| **Word Building** | Main construction | Target family display, onset blocks, rime block, construction zone, village progress |
| **Word Complete** | Celebrate valid word | Word displayed, TTS playback, added to house |
| **Family Complete** | Celebrate family | House fills, bonus awarded, confetti |
| **Completion Screen** | End game summary | Village view, stats, stars, play again |

---

## Section 9: Controls

| Action | Input | Feedback |
|--------|-------|----------|
| **Hover block** | Hand point / Mouse over | Block lifts slightly, glows |
| **Grab block** | Pinch / Mouse down | Block scales up, follows cursor |
| **Drag block** | Move hand (pinching) / Mouse drag | Block follows smoothly |
| **Drop block** | Release pinch / Mouse up | Snaps if valid, bounces if invalid |
| **Build word** | Pinch build button / Click | Word spoken, added to collection |
| **Replay audio** | Click word | Onset-rime-blend sequence |

**Hand Tracking Details:**
- Grab detection: Pinch start while hovering block
- Drag smoothing: Lerp position for stability
- Snap threshold: Within 50px of construction zone
- Release tolerance: Brief release (<200ms) doesn't drop

---

## Section 10: Core Mechanics

### Word Building Algorithm

```typescript
interface WordFamily {
  rime: string;           // "at", "an", "ake"
  type: 'cvc' | 'cvce' | 'digraph';
  onsets: string[];       // ["c", "b", "h", "m", "r", "s"]
  words: ValidWord[];
}

interface ValidWord {
  onset: string;
  rime: string;
  word: string;           // "cat"
  emoji: string;
  completed: boolean;
}

function tryBuildWord(selectedOnset: string, targetRime: string): boolean {
  const family = getFamilyByRime(targetRime);
  return family.onsets.includes(selectedOnset);
}

function calculateScore(validWords: number, streak: number): number {
  const basePoints = validWords * 20;
  const familyBonus = completedFamilies * 50;
  const streakBonus = streak * 5;
  return basePoints + familyBonus + streakBonus;
}
```

### Family Progression

| Round | Family | Onsets Available | Words to Build |
|-------|--------|------------------|----------------|
| 1 | -at | c, b, h | 3 |
| 2 | -at | m, r, s | 3 (complete family) |
| 3 | -an | c, f, m | 3 |
| 4 | -an | p, v, r | 3 (complete family) |
| 5+ | Mixed | From 2 families | 4-5 per round |

### Scoring System

```
Base: 20 points per valid word
Family completion: +50 when all words in family built
Streak bonus: +5 per consecutive valid word
Perfect round: +25 for building all words in round
```

---

## Section 11: Rules

### Start Conditions
- Player selects difficulty
- First family introduced with full onset set
- Tutorial overlay shows drag-and-drop (first play only)

### Objectives
- Build valid words by combining onsets with rimes
- Complete all words in each family
- Build 8 families total per game

### Allowed Actions
- Grab and drag any onset block
- Drop onsets onto rime block in construction zone
- Click "Build" to confirm valid combinations
- Click completed words to hear them again
- View Word Village progress anytime

### Restrictions
- Only one onset per word
- Must use current round's rime
- Invalid combinations don't snap together
- Cannot skip words (must build available ones)

### Scoring
- See Section 10 for formulas
- Maximum score: ~800 points (perfect game)
- Star thresholds: 3 stars (90%+), 2 stars (70%+), 1 star (50%+)

### Win/Lose Conditions
- **Win:** Complete 8 rounds of word building
- **No Lose:** All efforts progress toward completion
- **Stars:** Based on efficiency and family completions

---

## Section 12: HUD / Gameplay UI

### Layout Diagram

```
┌─────────────────────────────────────────────┐
│  WORD VILLAGE                    Round 3/8  │  <- Progress
│  [🏠] [🏠] [🟨] [⬜] [⬜] [⬜] [⬜] [⬜]       │  <- Family houses
├─────────────────────────────────────────────┤
│                                             │
│              ┌─────────┐                    │
│              │  🦉     │                    │  <- Owl Character
│              │ Builder │                    │
│              └─────────┘                    │
│                                             │
│   "Build words in the -AT family!"          │  <- Instruction
│                                             │
│   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
│   │  C  │ │  B  │ │  H  │ │  M  │         │  <- Onset Blocks
│   │ 🔵  │ │ 🔵  │ │ 🔵  │ │ 🔵  │         │
│   └─────┘ └─────┘ └─────┘ └─────┘         │
│                                             │
│        ┌─────────────────┐                  │
│   + ➜  │       AT        │  =  ?           │  <- Construction Zone
│        │      🟢         │                  │
│        └─────────────────┘                  │
│                                             │
│           ┌──────────┐                      │
│           │  BUILD   │                      │  <- Build Button
│           └──────────┘                      │
│                                             │
│   Built: CAT ✓ BAT ✓ HAT ⬜ MAT ⬜          │  <- Family Progress
└─────────────────────────────────────────────┘
```

### Element Details

| Element | Purpose | Update Frequency |
|---------|---------|------------------|
| Village Houses | Show family completion | Per family |
| Owl Character | Guide and celebrate | Expression changes |
| Onset Blocks | Letter selection | Static per round |
| Rime Block | Fixed family ending | Per round |
| Construction Zone | Word assembly | Per attempt |
| Build Button | Confirm word | Available when valid |
| Family Progress | Checklist of words | Per word built |

---

## Section 13: Feedback and Feel

### Success Feedback

**Block Snap:**
- Satisfying "click" sound
- Gold flash on connection
- Block slightly bounces
- Haptic feedback (mobile)

**Valid Word Built:**
- Word glows purple
- TTS: "C... at... CAT!"
- Owl celebrates (wings up)
- Word flies to family house
- House fills partially
- Score increments

**Family Complete:**
- House fully colors in
- Confetti burst
- Bonus points displayed
- Owl dance animation
- TTS: "You completed the -at family!"

### Failure/Invalid Feedback

**Invalid Combination:**
- Block bounces back (gentle physics)
- Soft "thud" sound (not harsh)
- Owl: "Try a different letter!"
- Block remains available

**Incomplete Word:**
- Build button disabled
- Gentle hint: "Drag a letter to -at"

### During Gameplay

- Blocks have idle bob animation
- Hover lifts and highlights block
- Drag has slight lag for weight feel
- Valid drop zone glows when dragging
- Village houses pulse when close to completion

### Progress Feedback

| Milestone | Feedback |
|-----------|----------|
| 1 word built | Owl nods approval |
| Half family | House frame appears |
| Family complete | Full celebration |
| All families | Victory parade |

---

## Section 14: Points / Rewards / Progression

### Points Breakdown

| Action | Points | Notes |
|--------|--------|-------|
| Valid word | 20 | Standard reward |
| Family complete | +50 | Bonus for finishing family |
| Streak (3+) | +5/word | Consecutive valid words |
| Perfect round | +25 | All words in round built |

### Final Score

```
totalScore = sum of word points + family bonuses + streak bonuses
maxPossible = ~800 points

accuracy = (valid words built / attempts) × 100

starRating:
  🌟🌟🌟 = 8 families completed
  🌟🌟   = 6-7 families completed
  🌟     = 4-5 families completed
```

### Rewards/Drops (Proposed)

| Item | Chance | Condition |
|------|--------|-----------|
| letter-block | 20% | Any completion |
| word-book | 15% | Family completion |
| owl-feather | 10% | 3+ families |
| house-token | 5% | Perfect round |

### Easter Eggs (Planned)

- **"Architect"** - Build 10 words without an invalid attempt
- **"Family Reunion"** - Complete 3 families in one game
- **"Speed Builder"** - Build a word within 5 seconds

### Progression

- Word Village persists between sessions (shows all-time progress)
- New families unlock based on completed games
- Mastery tracking per family

---

## Section 15: End States

### Valid Word Built

- TTS plays onset-rime-blend sequence
- Word animates to family house
- Checkmark appears in family list
- Score updates
- Continue to next word

### Invalid Attempt

- Block bounces back to shelf
- Gentle audio cue
- Owl provides hint
- No penalty, try again

### Family Complete

- House fully renders
- Confetti celebration
- Bonus points awarded
- Brief pause before next family
- Owl celebration animation

### Game Complete

**Triggers:** After 8 families completed

**Sequence:**
1. Final celebration audio
2. Word Village full view with all houses
3. Score tally with star rating
4. Completion screen:
   - Total words built
   - Families completed
   - Accuracy percentage
   - Star rating (1-3)
   - "Play Again" / "Back to Menu"

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Hand Tracking Drag (Primary)
- Grab blocks with pinch
- Drag to construction zone
- Release to drop
- Full physics feel

### Mode B: Click to Select (Fallback)
- Click onset block (selects)
- Click rime block (combines)
- Simpler, no dragging
- Same end result

### Mode C: Touch Direct (Tablet)
- Touch and drag with finger
- Larger hit targets
- Snap assistance

### Mode D: Keyboard (Accessibility)
- Tab through blocks
- Space to select
- Arrow keys to "drag"
- Enter to build

---

## Section 17: Improvement Opportunities

### Phase 1 (MVP)

1. Basic drag-and-drop word building
2. 6 CVC families
3. TTS integration
4. Simple scoring

### Phase 2 (Enhancement)

1. Owl character with animations
2. Word Village visualization
3. Silent e families
4. Family completion bonuses
5. Sound effects library

### Phase 3 (Advanced)

1. Digraph onsets (hard mode)
2. Sentence builder using created words
3. Persistent Word Village across sessions
4. Parent dashboard
5. Custom word family creation

### Experimental

- **AR mode:** Build words on real table
- **Voice onset:** Say the onset, TTS says rime
- **Multiplayer:** Collaborative village building

---

## Section 18: Content Model

### Word Families Database (Proposed)

**Phase 1 Families (CVC):**

| Family | Onsets | Words |
|--------|--------|-------|
| -at | c, b, h, m, r, s | cat, bat, hat, mat, rat, sat |
| -an | c, f, m, p, v, r | can, fan, man, pan, van, ran |
| -ig | b, d, f, p, w | big, dig, fig, pig, wig |
| -op | c, h, m, p, t | cop, hop, mop, pop, top |
| -ug | b, h, j, m, r | bug, hug, jug, mug, rug |
| -et | b, g, j, n, p, w | bet, get, jet, net, pet, wet |

**Phase 2 Families (CVCE - Silent E):**

| Family | Onsets | Words |
|--------|--------|-------|
| -ake | b, c, l, m, r, s | bake, cake, lake, make, rake, sake |
| -ine | d, f, l, m, n, p | dine, fine, line, mine, nine, pine |
| -ore | b, c, ch, m, sh, st | bore, core, chore, more, shore, store |
| -ute | c, h, m, p, pl | cute, hute, mute, pute, plute |

**Phase 3 Families (Digraphs):**

| Family | Onsets | Words |
|--------|--------|-------|
| -ip | sh, ch, tr, dr, fl | ship, chip, trip, drip, flip |
| -op | sh, ch, st, dr, pl | shop, chop, stop, drop, plop |

### Data Structure

```typescript
interface WordFamilyData {
  id: string;
  rime: string;
  type: 'cvc' | 'cvce' | 'digraph';
  vowelSound: 'short-a' | 'short-i' | 'long-a' | 'long-i';
  onsets: string[];
  words: {
    onset: string;
    word: string;
    emoji: string;
    audio?: string;
  }[];
}
```

---

## Section 19: Technical Structure

### Files to Create

| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `WordFamilies.tsx` | Main game component | 600-800 |
| `wordFamiliesLogic.ts` | Game logic, algorithms | 400-500 |
| `wordWorkshop.ts` | Add registry entry | +30 |
| `appRoutes.tsx` | Add route | +10 |

### Components to Build/Reuse

**Reuse from Rhyme Time:**
- `GameContainer` - Layout wrapper
- `GameShell` - Error boundary
- `CelebrationOverlay` - Completion UI
- `GameCursor` - Hand tracking cursor
- `useGameHandTracking` - CV hook
- `useAudio`, `useTTS` - Media hooks

**New Components:**
- `Block` - Draggable letter block
- `ConstructionZone` - Drop target area
- `FamilyHouse` - Progress visualization
- `WordBuilder` - Main building interface
- `OwlCharacter` - Guide character (or reuse SVGBird)

### Hooks Needed

| Hook | Purpose | Source |
|------|---------|--------|
| `useGameHandTracking` | Hand tracking | Existing |
| `useAudio` | Sound effects | Existing |
| `useTTS` | Text-to-speech | Existing |
| `useDragAndDrop` | Block dragging | New (or framer-motion) |
| `useGameCompletion` | Progress tracking | Existing |

### State Management

```typescript
interface GameState {
  currentRound: number;
  totalRounds: number;
  currentFamily: WordFamily;
  builtWords: string[];        // Words completed this round
  familyProgress: Map<string, string[]>; // All families progress
  score: number;
  streak: number;
  selectedBlock: string | null;
  isDragging: boolean;
}
```

### Dependencies

```json
{
  "framer-motion": "Animations + drag gestures",
  "lucide-react": "Icons",
  "react-webcam": "Camera input"
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| No existing file | Needs full implementation | High |
| Drag physics | Framer Motion can handle | Medium |
| Character design | Could reuse SVGBird or create owl | Medium |
| Audio assets | Use TTS initially | High |
| Block graphics | CSS 3D or Kenney assets | Medium |
| Hand tracking drag | Pattern exists but needs adaptation | Medium |

---

## Section 21: Implementation Notes

### Recommended Approach

1. **Copy Rhyme Time structure** as starting template
2. **Replace selection logic** with drag-and-drop
3. **Create Block component** with Framer Motion drag
4. **Build ConstructionZone** as drop target
5. **Add FamilyHouse** visualization
6. **Test hand tracking** with grab/release gestures

### Architecture Decisions

- Use Framer Motion's `drag` prop for block movement
- Implement custom `useDragAndDrop` hook for game logic
- Store valid/invalid state in construction zone
- Animate words "flying" to family houses

### Testing Priorities

1. Drag-and-drop with mouse
2. Hand tracking pinch-to-grab
3. Block snap detection
4. TTS sequence (onset → rime → blend)
5. Family completion flow

### Performance Considerations

- Use `transform` for block animations (GPU)
- Debounce hand tracking position updates
- Lazy load TTS for words
- Pool block components for reuse

---

## Section 22: Acceptance Criteria

### Functional Requirements

- [ ] Game loads without errors
- [ ] Hand tracking can grab and drag blocks
- [ ] Blocks snap to construction zone
- [ ] Valid combinations create words
- [ ] Invalid combinations bounce back
- [ ] TTS plays onset-rime-blend sequence
- [ ] Family progress tracked visually
- [ ] Family completion triggers celebration
- [ ] Scoring calculates correctly
- [ ] Completion screen shows stats
- [ ] All 8 families playable
- [ ] 3 difficulty levels implemented

### CV Requirements

- [ ] `cv: ['hand']` declared in registry
- [ ] `useGameHandTracking` integrated
- [ ] Pinch-to-grab functional
- [ ] Drag while pinching works
- [ ] Release to drop functional
- [ ] Cursor visible during play
- [ ] Fallback to mouse works

### Educational Requirements

- [ ] All families appropriate for ages 5-7
- [ ] Clear onset-rime visual separation
- [ ] Audio support for all word parts
- [ ] No negative feedback
- [ ] Progress tracking motivating

---

## Section 23: Test Plan

### Manual Gameplay Tests

| Test | Steps | Expected |
|------|-------|----------|
| Start game | Select Easy | First family loads |
| Drag block | Grab onset, drag to rime | Block follows cursor |
| Valid word | Drop C on -at | "CAT" forms, TTS plays |
| Invalid word | Drop X on -at | Block bounces back |
| Build word | Click BUILD | Word saved, added to house |
| Complete family | Build all words | Celebration, next family |
| Finish game | Complete 8 families | Completion screen |

### CV Control Tests

| Test | Steps | Expected |
|------|-------|----------|
| Hand grab | Pinch on block | Block scales up, attaches to cursor |
| Hand drag | Move hand while pinching | Block follows smoothly |
| Hand drop | Release pinch over zone | Block snaps or bounces |
| Processing | Grab during feedback | No action until ready |

### Fallback Tests

| Test | Steps | Expected |
|------|-------|----------|
| Mouse drag | Click and drag block | Same as hand tracking |
| Touch drag | Finger drag on tablet | Same with larger targets |
| Click select | Click block, click zone | Alternative input method |

### Edge Cases

| Test | Steps | Expected |
|------|-------|----------|
| Rapid grabs | Grab multiple blocks | Only one active |
| Drop off-screen | Drag off window | Block returns to shelf |
| TTS failure | Block TTS | Visual feedback only |
| Camera deny | Deny permission | Mouse mode activated |

### Performance

- [ ] 60fps during drag operations
- [ ] Block snap < 100ms
- [ ] TTS starts within 500ms
- [ ] No lag with 6+ blocks on screen

---

## Appendix A: Related Games

| Game | Relationship | Differentiation |
|------|--------------|-----------------|
| Rhyme Time | Predecessor | Auditory matching vs. visual construction |
| Phonics Sounds | Related | Single sounds vs. word building |
| Blend Builder | Related | More complex blending, older target |
| Beginning Sounds | Prerequisite | First sounds only |

---

## Appendix B: Implementation Checklist

### Setup
- [ ] Create WordFamilies.tsx
- [ ] Create wordFamiliesLogic.ts
- [ ] Add registry entry
- [ ] Add route
- [ ] Add lazy import

### Core Features
- [ ] Block component with drag
- [ ] Construction zone
- [ ] Word validation logic
- [ ] TTS integration
- [ ] Family tracking
- [ ] Scoring system

### Polish
- [ ] Character animations
- [ ] Sound effects
- [ ] Particle effects
- [ ] Background art
- [ ] Responsive layout

### Testing
- [ ] Unit tests for logic
- [ ] CV integration test
- [ ] Accessibility audit
- [ ] Performance test

---

*End of Design Specification*
