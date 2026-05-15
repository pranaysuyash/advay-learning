# Magic E (Silent E Transform)

**Game ID:** magic-e  
**Slug:** magic-e  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts` (to be added)  
**Code:** `src/frontend/src/pages/MagicE.tsx` (to be created)  
**Logic:** `src/frontend/src/games/magicELogic.ts` (to be created)  
**CV Mode:** Hand tracking (`cv: ['hand']`)

---

## Section 1: Concept Summary

| Attribute | Description |
|-----------|-------------|
| **One-line concept** | Wave your hand to add the "Magic E" to CVC words and watch them transform into new words with long vowel sounds! |
| **Genre** | Educational / Word Transformation / Phonics Recognition |
| **Target audience** | Ages 5-8, children learning the silent "e" rule in phonics |
| **Core player fantasy** | "I have magic powers! I can transform words by adding the Magic E!" |
| **Primary skill tested** | Understanding the CVCe (consonant-vowel-consonant-e) pattern, recognizing how silent "e" changes vowel sounds from short to long |
| **Session length** | 4-6 minutes per round (8-12 word transformations) |
| **Platform context** | Core phonics game for Word Workshop world, demonstrates spatial CV interaction with gesture-based letter placement |

**Educational Foundation:** The "Magic E" (also known as "Silent E" or "Bossy E") is a fundamental phonics rule where adding an "e" at the end of a CVC word changes the vowel from short to long sound (e.g., "cap" → "cape", "kit" → "kite"). This game makes this abstract rule tangible and magical through physical interaction.

---

## Section 2: Repo Status

| Aspect | Status |
|--------|--------|
| **Implementation status** | 📝 DESIGN SPEC - Not yet implemented |
| **What works now** | N/A - This is a design specification for a new game |
| **What is partial/missing** | All components need to be created |
| **Evidence** | Listed in PHASE2_PLAN.md as Wave 3, final game |
| **Confidence level** | Design spec - Ready for implementation |

### Files to Create

```
src/frontend/src/
├── pages/
│   └── MagicE.tsx              # Main game component (est. 450-500 lines)
├── games/
│   └── magicELogic.ts          # Word database & game logic (est. 150-200 lines)
└── data/gameRegistries/
    └── wordWorkshop.ts         # Add manifest entry
```

---

## Section 3: Current Implementation

**Status:** This game does not exist yet. This section describes the PROPOSED implementation based on similar games (VowelValley, BlendBuilder) and design requirements.

### Proposed Flow

1. **Start Screen:** Title with magical sparkle effects, "Magic E" wand icon, instructions
2. **Word Presentation:** CVC word appears (e.g., "CAP" with 🧢 emoji)
3. **Instruction Phase:** TTS asks "What happens when we add Magic E?"
4. **Action Phase:** Player waves hand across the word to "sprinkle" Magic E
5. **Transformation:** Word animates: CAP → CAPE (with particle effects)
6. **Confirmation:** TTS confirms "Cap becomes Cape! The 'a' says its name!"
7. **Feedback:** Points awarded, celebration effect
8. **Progression:** Next word appears, increasing complexity

### Proposed Controls

| Input | Action | CV Mode | Mouse Fallback |
|-------|--------|---------|----------------|
| Hand wave across word | Add Magic E | ✅ Horizontal hand swipe gesture | ✅ Drag across word |
| Hover over word | Highlight interaction zone | ✅ Index finger position | ✅ Mouse hover |
| Pinch | Confirm transformation | ✅ Pinch gesture | ✅ Click |

### Proposed Mechanics

**Gesture Detection:**
- Hand enters word zone from left → triggers "ready" state
- Hand moves right across word zone → triggers transformation
- Visual trail follows hand movement (sparkle effect)

**Word Transformation Animation:**
1. Original word scales down slightly
2. Magic E flies in from off-screen (following hand gesture)
3. Both scale up with bounce effect
4. Letter colors shift (vowel turns gold to signify "saying its name")
5. Particle burst (sparkles) on completion

### Proposed Visuals/UI

- **Background:** Magical workshop with floating books, glowing stars
- **Word display:** Large 3D-styled letter tiles
- **Magic E:** Glowing golden "E" that follows hand movement
- **Transformation zone:** Circular area around the word with magical aura
- **Progress indicator:** Magic wand filling with sparkles

### Gaps/Issues (Design Level)

1. **Gesture sensitivity:** Balancing accidental vs intentional swipes
2. **Word complexity:** Managing words with different syllable patterns
3. **Visual clarity:** Ensuring the transformation is visually obvious
4. **Audio feedback:** Need distinct sounds for each transformation type

---

## Section 4: Intended Design

### Educational Goal

Teach the CVCe (consonant-vowel-consonant-e) phonics pattern through interactive, magical transformation. Children will:
- Recognize that adding "e" to the end changes the vowel sound
- Connect visual word changes to pronunciation changes
- Build confidence with the "silent e" rule through repetition
- Generalize the pattern to new words

### Pedagogical Approach

1. **Discovery Learning:** Child experiments with gestures to discover transformation
2. **Multisensory Reinforcement:** Visual (word change), auditory (TTS), kinesthetic (hand wave)
3. **Immediate Feedback:** Instant transformation shows cause and effect
4. **Pattern Recognition:** Repetition builds automaticity with the rule
5. **Errorless Learning:** No penalty for exploration, always positive outcome

### Difficulty Progression

| Level | Word Pattern | Examples | Complexity |
|-------|--------------|----------|------------|
| 1 | Simple CVC → CVCe (a, i, o) | cap→cape, kit→kite, hop→hope | ⭐ |
| 2 | CVC → CVCe (e, u, mixed) | pet→Pete, cut→cute, rid→ride | ⭐⭐ |
| 3 | Less common patterns | cub→cube, pin→pine, mat→mate | ⭐⭐⭐ |
| 4 | Mixed review + pseudo-words | Real words + nonsense words for pattern testing | ⭐⭐⭐⭐ |

### Accessibility

- **TTS integration:** All words spoken before and after transformation
- **Visual cues:** Emojis support word meaning
- **Large interaction zones:** Full word area is interactive
- **Multiple attempts:** No penalty for repeated transformations
- **Visual highlighting:** Vowel color changes to indicate sound shift

### Engagement

- **Magical theme:** "You have the power to transform words!"
- **Sparkle effects:** Particle systems for every interaction
- **Progressive wand charging:** Visual progress fills a magic wand
- **Mastery celebration:** Special effects for completing levels
- **Voice encouragement:** Positive TTS reinforcement

### Core Loop

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ See CVC     │ → │ Wave hand    │ → │ See CVCe    │
│ Word        │    │ to add E     │    │ Word        │
│ (e.g., CAP) │    │              │    │ (e.g., CAPE)│
└─────────────┘    └──────────────┘    └─────────────┘
       ↑                                      │
       └────────────── Points ←───────────────┘
```

**Loop duration:** ~20-30 seconds per word
**Engagement hook:** Anticipation of "what will this word become?"

---

## Section 5: Drift Analysis

**Note:** Since this is a design spec for a new game, drift analysis compares DESIGN INTENT vs PLATFORM PATTERNS.

### Where Design Matches Platform Patterns

✅ **Hand tracking integration** - Consistent with Word Workshop games  
✅ **TTS support** - Follows accessibility standards  
✅ **Streak scoring** - Uses existing `useStreakTracking` hook  
✅ **GameShell wrapper** - Standard game container pattern  
✅ **Completion tracking** - Uses `useGameCompletion` hook  
✅ **Haptic feedback** - Integrates platform haptics  

### Where Design Extends Platform Patterns

🌟 **Gesture-based transformation** - Novel interaction: horizontal swipe vs point/click  
🌟 **Animation-heavy feedback** - Word transformation requires complex Framer Motion sequences  
🌟 **Particle effects** - Sparkle systems not widely used in existing games  
🌟 **Dual-state word display** - Before/after states with smooth transition  

### Where Design Requires New Patterns

⚠️ **Swipe gesture detection** - Platform lacks standardized swipe detection  
⚠️ **Word transformation animation** - No existing component for letter morphing  
⚠️ **Progressive particle systems** - Need new particle effect utilities  

### Alignment Assessment

**Platform Alignment: 85%** - The game follows most platform conventions but introduces novel gesture interactions that require new utility development.

---

## Section 6: Recommended Canonical Version

### Current Design Strengths to Keep

1. **Magical transformation theme** - Engaging fantasy element
2. **Horizontal swipe gesture** - Intuitive "adding" motion
3. **Visual word transformation** - Clear before/after comparison
4. **Level-based progression** - Gradual complexity increase
5. **TTS integration** - Essential for phonics learning

### Enhancements to Implement

1. **Word family grouping** - Practice cap/cape, tap/tape together
2. **Reverse mode** - Start with CVCe, "remove" Magic E
3. **Sentence context** - Show words in simple sentences after transformation
4. **Mastery tracking** - Track which patterns child knows
5. **Speed challenge mode** - How many in 60 seconds?

### Experimental Features

1. **Multi-word chains** - CAP → CAPE → CAPES
2. **Rhyme discovery** - After cape, show tape, grape
3. **Recording feature** - Child records themselves saying the word
4. **AR mode** - Words appear to float in real space
5. **Collaborative mode** - Two children add E's together

---

## Section 7: Visual Identity

### Overall Look

A whimsical magical workshop where words come to life. Floating books, sparkling stars, and glowing magical energy create an atmosphere of wonder and discovery.

### Camera View

Full-screen game area with camera thumbnail in corner. Main focus on center-screen word display.

### Art Style

- **3D-styled UI elements** - Letter tiles with depth/shadows
- **Particle effects** - Sparkles, glows, magical auras
- **Bright, warm palette** - Golds, purples, magical blues
- **Rounded, friendly shapes** - No sharp corners

### Mood

Enchanting, empowering, wondrous. The child is a word wizard with real magical powers.

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background | Deep magical purple | `#4C1D95` |
| Word tiles | Ivory with gold trim | `#FFFBEB` / `#F59E0B` |
| Magic E glow | Bright gold | `#FCD34D` |
| Vowel (short) | Blue | `#3B82F6` |
| Vowel (long) | Gold | `#F59E0B` |
| Sparkles | White/gold | `#FFFFFF` / `#FDE68A` |
| Progress wand | Gradient pink-purple | `#EC4899` → `#8B5CF6` |

### Environment

- Floating bookshelves in background
- Glowing stars and sparkles ambient
- Magic wand cursor that follows hand
- Particle system for transformation effects

### UI Style

- Large, chunky buttons with rounded corners
- High contrast text on all elements
- Emoji support for word illustrations
- Smooth Framer Motion transitions

### Active Vibe

Active and engaging - the child is constantly waving, transforming, and creating magic. Quick interactions (20-30 sec per word) keep energy high.

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start** | Game introduction, level select | Title, magic wand animation, level buttons, start button |
| **Gameplay - Word Display** | Show current CVC word | Word tiles, emoji, instruction text, magic wand cursor |
| **Gameplay - Interaction** | Wait for hand swipe | Zone highlighting, sparkle trail, Magic E floating nearby |
| **Gameplay - Transformation** | Animate word change | Letter morphing, particle burst, color shift, TTS |
| **Gameplay - Feedback** | Celebrate success | Points popup, streak indicator, progress fill |
| **Level Complete** | Show level progress | Stats, star rating, next level button |
| **Game Complete** | Final celebration | Trophy, total score, replay/exit buttons |

---

## Section 9: Controls

| Action | Input | CV Mode | Mouse Fallback | Feedback |
|--------|-------|---------|----------------|----------|
| Move cursor | Index finger position | ✅ Hand tracking | ✅ Mouse move | Cursor follows hand |
| Hover word zone | Cursor over word area | ✅ Position check | ✅ Mouse hover | Word glows, sparkles appear |
| Swipe to transform | Horizontal hand movement across word | ✅ Gesture detection | ✅ Click and drag | Sparkle trail, word animates |
| Confirm/Skip | Pinch gesture | ✅ Pinch detection | ✅ Click | Haptic + sound |
| Select level | Hover + pinch on level button | ✅ Point + pinch | ✅ Click | Button highlight |

### CV-Specific Interactions

```typescript
// Swipe detection logic
interface SwipeState {
  startX: number | null;
  startTime: number | null;
  isSwiping: boolean;
}

// Detect valid Magic E swipe
function detectMagicESwipe(
  cursor: Point, 
  wordZone: Rect,
  state: SwipeState
): boolean {
  // Must start left of word
  if (cursor.x < wordZone.x && !state.isSwiping) {
    state.startX = cursor.x;
    state.startTime = Date.now();
    state.isSwiping = true;
  }
  
  // Must cross through word to right side within 500ms
  if (state.isSwiping && cursor.x > wordZone.x + wordZone.width) {
    const duration = Date.now() - state.startTime!;
    if (duration < 500) {
      return true; // Valid swipe!
    }
    state.isSwiping = false;
  }
  
  return false;
}
```

---

## Section 10: Core Mechanics

### Word Transformation System

**CVC to CVCe Database:**

| CVC Word | CVCe Word | Emoji | Vowel Sound |
|----------|-----------|-------|-------------|
| cap | cape | 🧢 / 🦸 | a → ā |
| kit | kite | 📦 / 🪁 | i → ī |
| hop | hope | 🐰 / ✨ | o → ō |
| cut | cute | ✂️ / 🥰 | u → ū |
| pet | Pete | 🐕 / 👦 | e → ē |
| rid | ride | 🚫 / 🚲 | i → ī |
| mat | mate | 🧘 / 🤝 | a → ā |
| pin | pine | 📌 / 🌲 | i → ī |
| cub | cube | 🐻 / 🎲 | u → ū |
| tub | tube | 🛁 / 🧪 | u → ū |
| can | cane | 🥫 / 🍬 | a → ā |
| man | mane | 👨 / 🦁 | a → ā |
| bit | bite | 🖥️ / 🦷 | i → ī |
| hid | hide | 🙈 / 🏃 | i → ī |
| rob | robe | 🦹 / 👘 | o → ō |
| tot | tote | 👶 / 👜 | o → ō |

### Scoring System

- **Base points:** 15 points per transformation
- **Speed bonus:** +5 points if completed within 10 seconds
- **Streak bonus:** +2 points per streak (max +20)
- **Level multiplier:** Level 1×1, Level 2×1.2, Level 3×1.5, Level 4×2

**Score Formula:**
```
total = (base + speedBonus + streakBonus) × levelMultiplier
```

### Gesture Detection Algorithm

```typescript
interface SwipeGesture {
  startPoint: Point;
  endPoint: Point;
  duration: number;
  velocity: number;
}

function calculateSwipe(
  positions: Point[],
  timestamps: number[]
): SwipeGesture | null {
  if (positions.length < 3) return null;
  
  const start = positions[0];
  const end = positions[positions.length - 1];
  const duration = timestamps[timestamps.length - 1] - timestamps[0];
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const velocity = distance / duration;
  
  // Valid swipe: rightward movement, >0.3 distance, 100-800ms duration
  if (end.x > start.x && distance > 0.3 && duration > 100 && duration < 800) {
    return { startPoint: start, endPoint: end, duration, velocity };
  }
  
  return null;
}
```

---

## Section 11: Rules

### Start Conditions

- Player selects level (1-4)
- 8 words to transform in the round
- Score starts at 0, streak at 0
- Magic wand empty

### Objectives

- Transform all CVC words to CVCe words by waving hand to add Magic E
- Build the longest streak possible
- Fill the magic wand with sparkles (progress indicator)

### Allowed Actions

- Wave hand across word to trigger transformation
- Hover to preview interaction
- Pinch to skip a word (no penalty, but no points)
- View hint (emoji) for word meaning

### Restrictions

- Must swipe through word zone (not just near it)
- Swipe must be left-to-right (the direction of adding "e")
- Minimum swipe speed to prevent accidental triggers
- 10-second time limit per word (optional, can be disabled)

### Scoring

| Action | Points | Effect |
|--------|--------|--------|
| Successful transformation | 15 | Next word appears, streak +1 |
| Speed bonus (under 10s) | +5 | Extra points added |
| Streak bonus | +2×streak | Scales with consecutive successes |
| Skip word | 0 | Streak reset, next word appears |
| Level complete bonus | 50×level | Completion reward |

### Win/Lose Conditions

| Condition | Trigger | Result |
|-----------|---------|--------|
| Level Complete | All 8 words transformed | Stats screen, unlock next level |
| Game Complete | Complete level 4 | Celebration, high score saved |
| Time Out (optional) | 10 seconds without action | Word skipped, streak reset |

---

## Section 12: HUD / Gameplay UI

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Home]  MAGIC E  [Level: 2 ⭐]     Score: 245    🔥 5   │  ← Top Bar
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         🧢                                  │  ← Emoji
│                                                             │
│                    ┌─────────┐                              │
│                    │  C  A  P│  ← [Word Zone]               │
│                    └─────────┘                              │
│                          ↓ Add Magic E!                     │
│                    ┌──────────┐                             │
│                    │  C  A  P E│ ← (appears after swipe)    │
│                    └──────────┘                             │
│                         ✨✨✨                               │  ← Sparkles
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   │  ← Wand Progress
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│              Word 3 of 8        [💡 Hint]                   │  ← Bottom Info
└─────────────────────────────────────────────────────────────┘
```

### HUD Elements

| Element | Position | Purpose | Update |
|---------|----------|---------|--------|
| Home button | Top-left | Exit to games menu | Static |
| Title | Top-center | Game identification | Static |
| Level indicator | Top-center-right | Current difficulty | On level select |
| Score | Top-right | Points earned | Real-time |
| Streak | Top-right | Consecutive successes | Real-time |
| Word zone | Center | Main interaction area | Per word |
| Word tiles | Center | CVC/CVCe display | Per transformation |
| Emoji | Above word | Visual cue | Per word |
| Magic wand progress | Bottom | Round progress | Per transformation |
| Word counter | Bottom-left | Progress (X of Y) | Per word |
| Hint button | Bottom-right | Show word meaning | On request |

---

## Section 13: Feedback and Feel

### Success Feedback (Transformation Complete)

- **Audio:** `playSuccess()` + magical chime sound
- **Haptic:** 'success' vibration (40ms)
- **Visual:** 
  - Word scales up 1.2x with bounce
  - Gold glow emanates from word
  - Sparkle particles burst outward
  - Vowel letter turns gold
  - Score popup: "+15" floats upward
- **TTS:** "[CVC] becomes [CVCe]! The '[vowel]' says its name!"

### Streak Feedback

| Streak | Feedback |
|--------|----------|
| 3 | "Great!" + small sparkles |
| 5 | "Amazing!" + medium burst + haptic celebration |
| 8 | "Unstoppable!" + large burst + screen flash |
| 10+ | "LEGENDARY!" + massive effect + special sound |

### Word Transition

- Current word fades out (scale down + opacity)
- 300ms pause
- New word slides in from top (scale up + opacity)
- TTS speaks new word automatically

### Error/Invalid Swipe Feedback

- **Audio:** Soft "whoosh" (not error sound - exploration is encouraged)
- **Visual:** Word shakes slightly
- **TTS:** "Try swiping across the word!"
- No penalty, keep trying

### During Gameplay

- Cursor leaves sparkle trail
- Word glows brighter as hand approaches
- Magic E orbits nearby, ready to be "placed"
- Ambient sparkles float in background

---

## Section 14: Points / Rewards / Progression

### Points Breakdown

| Source | Base | Bonus | Max per Word |
|--------|------|-------|--------------|
| Transformation | 15 | - | 15 |
| Speed (<10s) | - | +5 | +5 |
| Streak (×2) | - | +2×streak | +20 (at streak 10) |
| Level multiplier | - | ×1.0-2.0 | ×2 |

**Maximum per word:** (15 + 5 + 20) × 2 = 80 points

### Final Score Calculation

```
baseScore = sum of all word scores
levelBonus = level × 50
streakBonus = maxStreak × 10
accuracyBonus = (wordsCompleted / wordsAttempted) × 100

finalScore = baseScore + levelBonus + streakBonus + accuracyBonus
```

### Star Rating

| Stars | Condition | Reward Multiplier |
|-------|-----------|-------------------|
| ⭐ | Complete all words | ×1 |
| ⭐⭐ | Score > 300 | ×1.2 |
| ⭐⭐⭐ | Score > 500 + streak > 5 | ×1.5 |

### Drops (From Registry)

```typescript
drops: [
  { itemId: 'letter-e', chance: 0.25 },      // The magic letter itself!
  { itemId: 'star-gold', chance: 0.15 },
  { itemId: 'book-spell', chance: 0.1, minScore: 200 },
  { itemId: 'wand-magic', chance: 0.05, minScore: 400 },
]
```

### Easter Eggs

```typescript
easterEggs: [
  {
    id: 'egg-first-transformation',
    name: 'First Magic!',
    description: 'Transform your first word with Magic E',
    trigger: 'first-transformation',
    reward: { itemId: 'letter-e', quantity: 1 },
    hint: 'Wave your hand to add Magic E!',
    difficulty: 'easy',
  },
  {
    id: 'egg-master-wizard',
    name: 'Master Wizard',
    description: 'Complete Level 4 with a perfect streak',
    trigger: 'perfect-level-4',
    reward: { itemId: 'wand-magic', quantity: 1 },
    hint: 'Transform every word on the first try!',
    difficulty: 'hard',
  },
]
```

### Progression System

- **Level unlocks:** Complete previous level to unlock next
- **Word mastery:** Track which CVCe patterns child knows
- **Speed achievements:** Complete levels under time targets
- **Streak records:** Personal best streak tracking

---

## Section 15: End States

### Correct/Success (Per Word)

- Trigger: Valid swipe gesture detected
- Display: Transformation animation → Success feedback
- Points: Added immediately
- Progress: Wand fills, word counter increments
- Next: Auto-advance to next word after 2 seconds

### Level Complete

- Trigger: All words in level transformed
- Display: Full-screen celebration modal
- Content:
  - Star rating (1-3 stars)
  - Score breakdown
  - Words learned list
  - Next level button (or replay)
- Audio: `playCelebration()`
- Reward: Drop items, unlock next level

### Game Complete (Level 4 Finished)

- Trigger: All 4 levels completed
- Display: Trophy ceremony screen
- Content:
  - Master Wizard title
  - Total score
  - High score comparison
  - Words mastered count
  - Play again / Exit buttons
- Reward: Special "Master of Magic E" badge

### Early Exit

- Trigger: Player clicks home button
- Display: Confirm dialog
- Save: Current progress saved, partial score recorded
- Navigation: Return to games menu

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Magic Swipe (Default)

- Wave hand across word to add Magic E
- Emphasizes the "movement" of adding a letter
- Best for: Kinesthetic learners, active engagement

### Mode B: Pinch to Place (Accessibility)

- Drag Magic E from side with pinch gesture
- Drop onto word to transform
- Slower, more deliberate
- Best for: Fine motor practice, accessibility needs

### Mode C: Voice Command

- Say "Add Magic E!" to transform
- Hand tracking still used for selection (hover)
- Combines phonics practice with speech
- Best for: Verbal learners, speech therapy integration

### Mode D: Reverse Magic (Advanced)

- Start with CVCe words
- Swipe other direction to "remove" Magic E
- Hear the vowel change from long to short
- Best for: Advanced learners, pattern reinforcement

### Mode E: Speed Challenge

- 60-second timer
- Transform as many as possible
- No individual word timer
- Best for: Fluency building, advanced practice

---

## Section 17: Improvement Opportunities

### Low Cost (Can add post-launch)

1. **Additional word pairs** - Expand database to 50+ words
2. **New particle effects** - Different sparkles for each vowel
3. **Background variations** - Theme per level (forest, ocean, space)
4. **Sound variations** - Different success sounds per level
5. **Streak animation polish** - More elaborate milestone celebrations

### Medium Effort (Nice to have)

6. **Word families mode** - Practice cap→cape, then tap→tape, map→map
7. **Sentence builder** - Use transformed words in sentences
8. **Rhyme detection** - After cape, show other -ape words
9. **Recording feature** - Child records pronunciation
10. **Parent dashboard** - Track which patterns need work

### Ambitious (Future versions)

11. **Multi-syllable words** - Hoping→hope, etc.
12. **Other silent letter patterns** - KN, WR, GH words
13. **Story mode** - Narrative adventure using transformed words
14. **AR integration** - Words float in real room
15. **AI difficulty** - Adaptive word selection based on performance

---

## Section 18: Content Model

### Word Database Schema

```typescript
interface MagicEWord {
  id: string;
  cvc: string;           // Original CVC word
  cvce: string;          // Transformed CVCe word
  vowel: 'a' | 'e' | 'i' | 'o' | 'u';
  emoji: string;         // Visual representation
  hint: string;          // Word meaning hint
  difficulty: 1 | 2 | 3 | 4;
}

interface LevelConfig {
  level: number;
  wordCount: number;
  minDifficulty: number;
  maxDifficulty: number;
  timeLimit?: number;    // Optional per-word timer
}
```

### Content Structure

```typescript
const MAGIC_E_WORDS: MagicEWord[] = [
  // Level 1 (Difficulty 1)
  { id: '1', cvc: 'cap', cvce: 'cape', vowel: 'a', emoji: '🧢', hint: 'Wear it on your head', difficulty: 1 },
  { id: '2', cvc: 'kit', cvce: 'kite', vowel: 'i', emoji: '🪁', hint: 'Flies in the sky', difficulty: 1 },
  // ... 8 words per level
];

const LEVELS: LevelConfig[] = [
  { level: 1, wordCount: 8, minDifficulty: 1, maxDifficulty: 1 },
  { level: 2, wordCount: 8, minDifficulty: 1, maxDifficulty: 2 },
  { level: 3, wordCount: 8, minDifficulty: 2, maxDifficulty: 3 },
  { level: 4, wordCount: 8, minDifficulty: 3, maxDifficulty: 4 },
];
```

### Word Selection Algorithm

```typescript
function getWordsForLevel(level: number): MagicEWord[] {
  const config = LEVELS.find(l => l.level === level)!;
  const candidates = MAGIC_E_WORDS.filter(
    w => w.difficulty >= config.minDifficulty && 
         w.difficulty <= config.maxDifficulty
  );
  return shuffle(candidates).slice(0, config.wordCount);
}
```

---

## Section 19: Technical Structure

### File Organization

```
src/frontend/src/
├── pages/
│   └── MagicE.tsx                    # Main game component (~500 lines)
├── games/
│   └── magicELogic.ts                # Logic & data (~150 lines)
├── components/game/
│   ├── MagicEWordTile.tsx            # Animated word display
│   ├── MagicETransformation.tsx      # Transformation animation
│   └── MagicEParticleSystem.tsx      # Sparkle effects (optional)
└── data/gameRegistries/
    └── wordWorkshop.ts               # Add manifest entry
```

### Key Components

**MagicE.tsx:**
- State: `gameState`, `currentWord`, `cursor`, `streak`, `score`, `level`
- Hand tracking: `useGameHandTracking` with swipe detection
- Audio: `useAudio` for success/error/celebration
- TTS: `useTTS` for word pronunciation
- Completion: `useGameCompletion`

**magicELogic.ts:**
- Word database: `MAGIC_E_WORDS`
- Level configs: `LEVELS`
- Swipe detection: `detectSwipe()`, `isValidTransformation()`
- Scoring: `calculateScore()`, `calculateFinalScore()`

### Hooks Used

| Hook | Purpose |
|------|---------|
| `useGameHandTracking` | Hand position + gesture detection |
| `useGameCompletion` | Game completion tracking |
| `useAudio` | Sound effects |
| `useTTS` | Text-to-speech |
| `useStreakTracking` | Streak management |
| `useState/useRef` | Local state |

### Dependencies

```json
{
  "framer-motion": "^11.x",
  "react": "^18.x",
  "react-webcam": "^7.x"
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Swipe gesture library | May need custom implementation | Medium |
| Particle system | Could use canvas or CSS particles | Medium |
| Letter morphing animation | Framer Motion layout animations | High |
| Word database size | Start with 32 words, expand later | High |
| TTS pronunciation | Ensure CVCe words pronounced correctly | Medium |
| Gesture sensitivity | Requires playtesting to tune | High |
| Performance on low-end | Canvas particles may need optimization | Medium |

---

## Section 21: Implementation Notes

### Architecture Patterns

1. **GameShell wrapper** - Standard error boundary + wellness timer
2. **GameContainer** - Consistent layout with camera thumbnail
3. **Logic separation** - Game state in logic file, UI in component
4. **Gesture detection** - Custom hook `useSwipeGesture`
5. **Animation variants** - Framer Motion `variants` for complex sequences

### Strengths to Preserve

- Immediate, magical feedback
- Clear visual transformation
- Multisensory learning (see, hear, do)
- No-failure exploration
- Progressive difficulty

### Testing Considerations

- Gesture detection accuracy across hand sizes
- TTS pronunciation verification
- Animation performance on various devices
- Accessibility: alternative input methods
- Word difficulty appropriateness

### Performance Notes

- Use `will-change: transform` on animated elements
- Throttle gesture detection to 30fps
- Pool particle objects to reduce GC
- Lazy load audio assets
- Use `React.memo` for word tiles

---

## Section 22: Acceptance Criteria

### Core Functionality

- [ ] Start screen displays title, level select, instructions
- [ ] TTS speaks CVC word on appearance
- [ ] Word tiles display clearly with emoji
- [ ] Hand swipe gesture triggers transformation
- [ ] CVC → CVCe animation plays smoothly
- [ ] TTS confirms transformation with explanation
- [ ] Points added with popup animation
- [ ] Streak counter increments correctly
- [ ] Progress wand fills per transformation
- [ ] Level completes after 8 words
- [ ] Celebration screen shows stats

### CV/Hand Tracking

- [ ] Cursor follows index finger
- [ ] Swipe detection triggers at appropriate sensitivity
- [ ] Hover effects activate before swipe
- [ ] Sparkle trail follows cursor movement
- [ ] Pinch gesture works for skip/confirm
- [ ] Camera thumbnail visible during gameplay

### Content

- [ ] 32 words in database (8 per level × 4 levels)
- [ ] All 5 vowels represented
- [ ] Difficulty progression works (levels 1-4)
- [ ] Word hints available on request
- [ ] No inappropriate or unclear words

### Edge Cases

- [ ] Handles hand loss gracefully
- [ ] Invalid swipes don't break game
- [ ] Skip function works without penalty
- [ ] Early exit saves progress
- [ ] Works with mouse fallback

### Accessibility

- [ ] TTS works for all words
- [ ] Large interaction zones
- [ ] High contrast UI
- [ ] Visual + audio feedback
- [ ] Alternative input mode available

---

## Section 23: Test Plan

### Manual Gameplay Tests

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Basic transformation | Start game → Swipe across "CAP" | Word transforms to "CAPE", success feedback |
| Streak building | Transform 5 words correctly | Streak shows 5, bonus points added |
| Level progression | Complete level 1 | Level 2 unlocks, stats shown |
| Skip function | Pinch to skip word | New word appears, no points, streak reset |
| Hint display | Click hint button | Emoji hint appears |

### CV Control Tests

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Cursor tracking | Move hand | Cursor follows smoothly |
| Swipe detection | Swipe across word | Transformation triggers |
| Invalid swipe | Swipe away from word | No transformation, gentle feedback |
| Hand loss | Hide hand | Graceful pause, resume on hand return |
| Slow swipe | Swipe very slowly | No transformation (too slow) |

### Fallback Tests

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Mouse drag | Drag mouse across word | Transformation works |
| Click to skip | Click word | Skip or hint appears |
| Touch input | Touch and drag on tablet | Transformation works |

### Edge Cases

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Rapid swiping | Swipe multiple times quickly | Only first swipe counts, debounced |
| Partial swipe | Swipe only half across | No transformation |
| Wrong direction | Swipe right-to-left | No transformation (or reverse mode) |
| Network loss | Disconnect during game | Progress saved locally |

### Performance Tests

| Test | Metric | Target |
|------|--------|--------|
| Animation smoothness | Frame rate | 60fps |
| Gesture latency | Detection delay | <100ms |
| Load time | Initial load | <3 seconds |
| Memory usage | During gameplay | <100MB |

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Comprehensive design specification ready for implementation  
**Estimated Implementation Time:** 2-3 days
