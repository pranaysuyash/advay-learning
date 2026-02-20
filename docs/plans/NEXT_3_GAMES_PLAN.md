# Next 3 Games Implementation Plan

**Created:** 2026-02-20
**Status:** READY FOR IMPLEMENTATION
**Target:** 3 new games (games #17, #18, #19)

---

## Selection Rationale

After reviewing all planning docs (GAME_ROADMAP.md, GAME_IMPROVEMENT_MASTER_PLAN.md, FUN_FIRST_GAMES_CATALOG.md, COMPREHENSIVE_INNOVATIVE_GAMES_CATALOG.md, GAMES-CRITICAL-ASSESSMENT-20260216.md), these 3 games were selected based on:

1. **Fill the CREATIVITY gap** (0 current games → 2 creativity games)
2. **Fill the PHONICS gap** (no phonics-specific game — critical for literacy progression)
3. **Leverage existing infrastructure** (hand tracking hooks, canvas, audio system)
4. **Maximum fun impact** per the critical assessment's "fun first" philosophy
5. **Reasonable effort** (~1 week each, parallel-friendly)

### Current State: 16 games implemented
### After This Sprint: 19 games

---

## Game 1: Air Canvas 🎨

**Route:** `/games/air-canvas`
**Age:** 3+ | **Category:** Creativity | **CV:** Hand tracking
**Effort:** ~1 week | **Priority:** P0

### Concept

Free-form air drawing game — kid draws with their finger in the air, creating glowing light trails on screen. Pure creative expression with no wrong answers.

### Why This Game

- **Fills creativity gap** (biggest skill area gap)
- **Instant "wow" factor** — the first game where kids see their hand movements become art
- **Zero frustration** — no right/wrong, pure expression
- **Showcases CV magic** — kids FEEL the computer tracking them
- **Reuses existing AirCanvas.tsx** — already have a basic page, needs game-ification

### Game Mechanics

```
┌─────────────────────────────────────────────────┐
│  ✨ Air Canvas Studio                    🎨     │
│                                                  │
│   [Glowing finger trail follows hand]           │
│                                                  │
│   ✨✨✨  (rainbow/sparkle trail)               │
│       ↖️                                         │
│         ✨  (movement captured)                  │
│                                                  │
│   🖐️ (hand tracked, index finger tip = brush)   │
│                                                  │
│   🎨 Colors: 🔴🟠🟡🟢🔵🟣 (cycle on pinch)     │
│   ✨ Brushes: Rainbow | Sparkle | Neon | Glow    │
│   🖐️ Open hand = draw | ✊ Fist = pause          │
│                                                  │
│   [Clear] [Screenshot] [Undo]                    │
└─────────────────────────────────────────────────┘
```

### Key Features

| Feature | Implementation |
|---------|---------------|
| **Finger trail** | Canvas 2D context, store points array, draw with `lineTo` + glow filter |
| **Brush types** | 4 brushes: Rainbow (hue cycles), Sparkle (particle dots), Neon (thick glow), Glow (soft wide) |
| **Color cycling** | Pinch gesture cycles through 6 colors |
| **Draw/pause** | Index finger extended = draw, fist = pause (prevent accidental marks) |
| **Clear canvas** | Shake hand rapidly (detect velocity > threshold) OR button |
| **Screenshot** | Save canvas as PNG, show celebration |
| **Undo** | Remove last stroke (between pauses) |
| **Trail fade** | Older points gradually fade (configurable: permanent or fading) |

### Technical Design

**New files:**
- `src/frontend/src/pages/AirCanvasGame.tsx` — Main game page (rename/enhance existing AirCanvas.tsx)
- `src/frontend/src/games/airCanvasLogic.ts` — Pure logic: stroke management, brush rendering, color cycling

**Reused:**
- `useHandTracking` + `useHandTrackingRuntime` — hand detection + game loop
- `useSoundEffects` — satisfying brush sounds
- `GameContainer` + `GameControls` — standardized layout
- `CelebrationOverlay` — screenshot celebration

**Key Hooks:**
- Index finger tip (landmark 8) position → brush position
- Pinch detection → color/brush change
- Finger extension detection → draw vs pause

### Progression (Optional Challenges)

| Challenge | Description |
|-----------|-------------|
| **Draw a Circle** | "Can you draw a circle?" — simple shape recognition |
| **Rainbow Trail** | "Draw for 30 seconds without stopping!" |
| **Two Colors** | "Use 2 different colors!" |
| **Fill the Canvas** | "Draw everywhere on the screen!" |

### Audio Design

- Continuous soft brush sound while drawing (Web Audio oscillator)
- Satisfying "pop" on color change
- Celebration sound on screenshot save
- No TTS prompts (pure creative mode)

---

## Game 2: Mirror Draw ✏️

**Route:** `/games/mirror-draw`
**Age:** 4-7 | **Category:** Creativity + Motor Skills | **CV:** Hand tracking
**Effort:** ~1 week | **Priority:** P0

### Concept

Half an image is shown on the left side — kid traces the mirror image on the right side with their finger. Teaches symmetry, builds fine motor skills, and unlocks paint mode on success.

### Why This Game

- **Creativity + educational** — teaches symmetry naturally
- **Reuses canvas + tracing infrastructure** from AlphabetGame
- **Clear success criteria** — path matching gives satisfying completion
- **High replayability** — many templates (animals, shapes, patterns)
- **Progressive difficulty** — simple shapes → complex patterns

### Game Mechanics

```
┌─────────────────────────────────────────────────┐
│  ✏️ Mirror Draw          Level 1/4    ⭐ 3      │
│                                                  │
│  ┌──────────────┬──────────────┐                │
│  │   Template   │   Your Turn  │                │
│  │              │              │                │
│  │    ╱ ╲      ││     (trace  │                │
│  │   /   \     ││      here)  │                │
│  │  /     \    ││             │                │
│  │ (heart ½)   │              │                │
│  │              │              │                │
│  └──────────────┴──────────────┘                │
│                                                  │
│  "Trace the other half!" 🖐️                     │
│  Accuracy: ████████░░ 82%                        │
└─────────────────────────────────────────────────┘
```

### Templates (20 designs, grouped by difficulty)

| Level | Templates | Accuracy Threshold |
|-------|-----------|-------------------|
| **1 - Easy** | Heart, Circle, Square, Star, Moon | 40% |
| **2 - Medium** | Butterfly, Leaf, Face (smiley), Fish, Diamond | 55% |
| **3 - Hard** | Flower, Tree, House, Car, Rocket | 65% |
| **4 - Expert** | Mandala pattern, Rangoli, Snowflake, Crown, Robot | 75% |

### Technical Design

**New files:**
- `src/frontend/src/pages/MirrorDraw.tsx` — Main game page
- `src/frontend/src/games/mirrorDrawLogic.ts` — Template data, path matching algorithm, scoring
- `src/frontend/src/games/__tests__/mirrorDrawLogic.test.ts` — Unit tests

**Reused:**
- `useHandTracking` + `useHandTrackingRuntime`
- `useSoundEffects`
- `GameContainer` + `GameControls`
- `CelebrationOverlay`

**Key Algorithms:**

1. **Template Storage:** SVG-like point arrays defining half-shapes
2. **Path Matching:** Compare user's traced points to mirrored template
   - Sample user stroke at regular intervals
   - Find nearest template point for each sample
   - Score = average (1 - distance/maxAllowedDistance), clamped 0-1
3. **Real-time Mirror Preview:** As user draws on right, faint mirror shows on left for feedback
4. **Symmetry Line:** Vertical center line with visual indicator

### Progression

- Each level: 5 templates
- Complete 3/5 with passing accuracy → unlock next level
- After completing a shape → optional "Paint It!" mode (free color fill)
- Stars awarded: 1 star (pass), 2 stars (70%+), 3 stars (90%+)

### Audio Design

- Soft tracing sound while finger moves
- "Ding!" on each template completed
- Celebration on level completion
- Mascot Pip: "Great symmetry!" / "Almost there!"

---

## Game 3: Phonics Sound Match 🔤🔊

**Route:** `/games/phonics-sounds`
**Age:** 3-7 | **Category:** Literacy / Phonics | **CV:** Hand tracking (pinch)
**Effort:** ~1.5 weeks | **Priority:** P0

### Concept

Pip says a letter sound (phoneme), and the child pinches the correct letter from a set of options floating on screen. Combines audio learning with hand tracking for a multisensory phonics experience.

### Why This Game

- **Critical literacy gap** — no phonics-specific game in the platform
- **Research-backed** — systematic phonics instruction is proven most effective for early reading (NIH, National Reading Panel)
- **Multisensory** — hear sound + see letter + physical pinch = triple encoding
- **Leverages existing infra** — same pinch-to-select pattern as ShapePop, ColorMatchGarden
- **Age-appropriate progression** — starts with individual letters, advances to blends

### Game Mechanics

```
┌─────────────────────────────────────────────────┐
│  🔤 Phonics Sounds       Level 1    ⭐ 5       │
│                                                  │
│  🔊 "Buh! Buh! Like in Ball!"                  │
│  [🔁 Repeat]                                     │
│                                                  │
│      ┌───┐    ┌───┐    ┌───┐    ┌───┐           │
│      │ A │    │ B │    │ D │    │ G │           │
│      └───┘    └───┘    └───┘    └───┘           │
│              (pinch the right letter!)           │
│                                                  │
│   🖐️ cursor ← (hand tracked)                    │
│                                                  │
│  Round 3/8   ⏱️ 15s   Streak: 🔥 4              │
└─────────────────────────────────────────────────┘
```

### Phonics Curriculum (Research-Based)

| Level | Content | Options | Time |
|-------|---------|---------|------|
| **1 - Letter Sounds** | Single consonants: B, C, D, F, G, H... | 3 choices | 20s |
| **2 - Vowel Sounds** | Short vowels: A (apple), E (egg), I (igloo)... | 4 choices | 15s |
| **3 - Beginning Blends** | BL, BR, CL, CR, DR, FL, FR, GL, GR... | 4 choices | 15s |

### Key Features

| Feature | Implementation |
|---------|---------------|
| **Audio phonemes** | Web Audio API speech synthesis OR pre-recorded phoneme audio |
| **Visual letters** | Large, colorful floating letter cards (60-80px, kid-friendly) |
| **Pinch-to-select** | Same pattern as ShapePop/ColorMatchGarden |
| **Example word** | After correct answer: show word + image (B → Ball 🏐) |
| **Repeat button** | Tap to hear phoneme again |
| **Streak tracking** | Consecutive correct answers → bonus points |
| **Gentle errors** | Wrong answer: "That's the 'duh' sound! Try again!" |

### Technical Design

**New files:**
- `src/frontend/src/pages/PhonicsSounds.tsx` — Main game page
- `src/frontend/src/games/phonicsSoundsLogic.ts` — Phoneme data, round generation, scoring
- `src/frontend/src/games/__tests__/phonicsSoundsLogic.test.ts` — Unit tests

**Reused:**
- `useHandTracking` + `useHandTrackingRuntime` — detection
- `useSoundEffects` — feedback sounds
- `isPointInCircle` from `targetPracticeLogic` — hit detection
- `GameContainer` + `GameControls`
- `CelebrationOverlay`

**Data Model:**

```typescript
interface Phoneme {
  letter: string;         // "B"
  sound: string;          // "buh"
  ttsText: string;        // "Buh! Buh! Like in Ball!"
  exampleWord: string;    // "Ball"
  exampleEmoji: string;   // "🏐"
  level: 1 | 2 | 3;
}

interface PhonicRound {
  target: Phoneme;
  distractors: Phoneme[];
  positions: Point[];
}
```

**Audio Strategy:**
- Primary: Web Speech API (`speechSynthesis`) for phoneme pronunciation
- Fallback: Pre-defined TTS strings with short, punchy prompts
- Sound effects: Pop on correct, gentle buzz on wrong, celebration on level complete

### Progression

- 8 rounds per level
- Pass 6/8 → unlock next level
- Total: 3 levels × 8 rounds = 24 rounds
- Stars: 1 (pass), 2 (7/8), 3 (8/8 perfect)

### Audio Design

- Pip says phoneme sound (short, 1-2 syllables)
- Example: "Buh!" (not "Can you find the letter that makes the 'buh' sound?")
- Correct: "B! Ball! 🏐" (show word + emoji)
- Wrong: "That's Duh! Try Buh!" (teach, don't punish)

---

## Implementation Roadmap

### Week 1 (Games 1 & 2 in parallel)

| Day | Air Canvas | Mirror Draw |
|-----|-----------|-------------|
| **1** | Create `airCanvasLogic.ts` + tests | Create `mirrorDrawLogic.ts` + tests |
| **2** | Build `AirCanvasGame.tsx` page | Build `MirrorDraw.tsx` page |
| **3** | Add brush types + color cycling | Add templates + path matching |
| **4** | Polish: particles, sounds, UI | Polish: accuracy meter, paint mode |
| **5** | Register route, update Games.tsx | Register route, update Games.tsx |

### Week 2 (Game 3 + Integration)

| Day | Phonics Sounds | Integration |
|-----|---------------|-------------|
| **1** | Create `phonicsSoundsLogic.ts` + tests | — |
| **2** | Build `PhonicsSounds.tsx` page | — |
| **3** | Add audio phoneme system | — |
| **4** | Polish: feedback, streaks, UI | Update docs/GAMES.md |
| **5** | Register route, update Games.tsx | Smoke tests, full test run |

---

## Integration Checklist

For each game:

- [ ] Game logic module in `src/frontend/src/games/` with unit tests
- [ ] Game page in `src/frontend/src/pages/` following existing patterns
- [ ] Route added to `src/frontend/src/App.tsx`
- [ ] Entry added to `src/frontend/src/pages/Games.tsx` gallery
- [ ] Lazy import added in App.tsx
- [ ] Smoke test in `src/frontend/src/pages/__tests__/GamePages.smoke.test.tsx`
- [ ] `docs/GAMES.md` updated with new game entries
- [ ] TypeScript compiles clean
- [ ] All existing tests pass
- [ ] Visual verification in browser

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Canvas performance with many trail points | Limit stroke history, use `requestAnimationFrame` batching |
| Path matching accuracy for Mirror Draw | Forgiving thresholds (40-75%), sample at intervals not every point |
| TTS phoneme pronunciation quality | Test across browsers, add manual phoneme spellings for edge cases |
| Kid frustration with accuracy | Always show encouraging feedback, low passing thresholds |

---

## Success Metrics

- All 3 games render and function with hand tracking
- Each game has pure logic module with ≥80% unit test coverage
- Total test suite passes (400+ tests expected)
- TypeScript clean compile
- Games are fun for a 4-year-old (the ultimate test)

---

## References

- `docs/GAME_ROADMAP.md` — Original roadmap (Mirror Draw = Tier 1)
- `docs/GAME_IMPROVEMENT_MASTER_PLAN.md` — Master plan (Phonics = P0)
- `docs/FUN_FIRST_GAMES_CATALOG.md` — Air Canvas concept (D-001)
- `docs/GAMES-CRITICAL-ASSESSMENT-20260216.md` — Fun factor analysis
- National Reading Panel (NICHD 2000) — Phonics instruction research
