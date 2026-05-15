# Spelling Bee - Game Specification

> **Slug:** `spelling-bee`  
> **World:** Word Workshop  
> **CV Mode:** Hand tracking (`cv: ['hand']`)  
> **Target File:** `src/frontend/src/pages/SpellingBee.tsx`  
> **Created:** 2026-04-03  
> **Template Version:** 23-Section Spec v1.0

---

## Section 1: Concept Summary

| Aspect | Description |
|--------|-------------|
| **One-line concept** | Hear a word, then spell it by pinching letters in the correct order |
| **Genre** | Educational spelling quiz / assessment |
| **Target audience** | Ages 5-8, children learning to spell common words |
| **Core player fantasy** | Compete in a friendly spelling competition like a real spelling bee |
| **Primary skill tested** | Auditory processing, phonics application, spelling accuracy, letter sequencing |
| **Session length** | 8-12 minutes (adaptive based on performance) |
| **Platform context** | Browser-based vision learning platform with hand tracking |

---

## Section 2: Repo Status

### Implementation Status: **NOT IMPLEMENTED**

> **Note:** `SpellingRun.tsx` exists but is a different game (side-scrolling runner). There is no `SpellingBee.tsx` quiz game.

| Aspect | Status | Evidence |
|--------|--------|----------|
| Source file exists | ❌ No | `src/frontend/src/pages/SpellingBee.tsx` not found |
| Logic file exists | ❌ No | `src/frontend/src/games/spellingBeeLogic.ts` not found |
| Registry entry exists | ❌ No | Not found in `wordWorkshop.ts` or `wordWorkshopExtra.ts` |
| Route configured | ❌ No | Not in `appRoutes.tsx` |
| Assets prepared | ❌ No | No preview image or assets |

### What Would Work (If Implemented)
- Hand tracking integration via `useGameHandTracking` hook
- Pinch-to-select gesture pattern (established in WordBuilder)
- TTS for word pronunciation
- Letter target system (from WordBuilder)
- Score/streak tracking via existing hooks

### What's Missing
- Complete game implementation
- Adaptive difficulty system
- Spelling word bank with audio
- Hint/reveal system
- Competition/achievement framework

**Confidence Level:** High (100% — game does not exist)

---

## Section 3: Current Implementation

> **Status:** No implementation exists. This section describes the intended implementation based on patterns from similar games.

### Intended Flow
```
[Start Screen] → [Select Difficulty] → [Word 1] → [Spell Word] → 
[Feedback] → [Word 2+] → [Score Summary] → [Rewards]
```

### Intended Controls
- **Hand tracking**: Index finger controls cursor position
- **Pinch gesture**: Select letter from available pool
- **Double pinch**: Submit spelling (or auto-submit when slots full)
- **Hold pinch on slot**: Clear letter (undo)

### Intended Mechanics
1. Player hears a word pronounced (e.g., "Cat")
2. Optional: Hear word used in a sentence
3. Letter tiles appear in a scrambled pool
4. Player pinches letters in order to spell the word
5. Spelling slots fill from left to right
6. When complete, automatic validation or submit button
7. Points awarded based on accuracy, hints used, and speed

### Visual Design Pattern (Based on WordBuilder + Enhancements)
- **Word display**: Empty slots showing word length (e.g., `_ _ _` for "cat")
- **Letter pool**: Scrambled letters below (includes all needed letters + distractors)
- **Progress**: Words completed / total words
- **Hint button**: Reveals next letter (with point penalty)
- **Repeat button**: Hear word again

### Gaps/Issues to Address
| Gap | Severity | Notes |
|-----|----------|-------|
| No source file | Critical | Complete implementation needed |
| No spelling word bank | High | Need graded word lists with definitions |
| No hint system | Medium | Core differentiator from WordBuilder |
| No sentence context | Medium | Important for homophones |

---

## Section 4: Intended Design

### Educational Goal
Develop spelling skills through:
- Auditory word recognition
- Sound-to-letter translation (phonics)
- Visual memory of word patterns
- Self-correction through immediate feedback

### Pedagogical Approach
1. **Hear-See-Do**: Audio word → visual letters → motor selection
2. **Scaffolded support**: Hints available, no penalties for retry
3. **Word families**: Group words by pattern (-at, -ig, -op)
4. **Spaced repetition**: Missed words reappear later in session
5. **Confidence building**: Start with high-success words

### Difficulty Progression

| Grade | Word Length | Patterns | Examples |
|-------|-------------|----------|----------|
| Grade 1 (5-6) | 2-3 letters | CVC, simple sight | at, cat, dog, the |
| Grade 2 (6-7) | 3-4 letters | Blends, silent e | frog, play, bike |
| Grade 3 (7-8) | 4-5 letters | Digraphs, vowel teams | ship, boat, train |
| Challenge | 5+ letters | Complex patterns | rainbow, elephant |

### Accessibility
- **Visual**: Large letter tiles (150px), clear dyslexia-friendly font option
- **Audio**: Clear TTS, optional slower pronunciation
- **Motor**: Large hit targets, no time pressure mode
- **Cognitive**: Hint system, unlimited retries, skip option

### Engagement
- Spelling bee competition theme
- Podium/award ceremony at completion
- Trophy collection for perfect rounds
- "Spell Master" title progression

### Core Loop
```
Hear word → Remember spelling → Find letters → 
   ↑________________________________________↓
   ←←←←←←←←←←←← Submit ←←←←←←←←←←←←←←←←←
```

---

## Section 5: Drift Analysis

> Since no implementation exists, this section describes the gap between "nothing" and the intended design.

### Where Implementation Matches Intent
N/A — No implementation exists.

### Where Implementation Falls Short
| Area | Current | Intended | Gap |
|------|---------|----------|-----|
| Existence | Non-existent | Fully functional | 100% missing |
| Source file | None | Complete TSX component | 100% missing |
| Game logic | None | Spelling assessment system | 100% missing |
| Registry entry | None | Listed in Word Workshop | 100% missing |

### Differentiation from WordBuilder
| Feature | WordBuilder | Spelling Bee (Intended) |
|---------|-------------|------------------------|
| Word source | Random/curriculum | Grade-level lists |
| Input method | Find next letter | Spell entire word |
| Audio | Letter sounds only | Full word + sentence |
| Hints | None | Reveal letter, hear again |
| Scoring | Speed + streak | Accuracy + hints used |
| Focus | Letter recognition | Spelling memory |

### Overall Assessment

| Metric | Score | Notes |
|--------|-------|-------|
| **Implementation completeness** | 0% | Game does not exist |
| **Design clarity** | 95% | Clear vision from similar games |
| **Educational value** | N/A | Design specifies strong pedagogy |
| **Differentiation** | High | Unique from existing Word Workshop games |

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
N/A — New game implementation.

### Enhancements to Implement

#### Tier 1: Core MVP
- [ ] Word bank with 50+ grade-leveled words
- [ ] TTS pronunciation and sentences
- [ ] Scrambled letter pool selection
- [ ] Spelling slot filling system
- [ ] Basic scoring (correct/incorrect)
- [ ] 3 difficulty grades

#### Tier 2: Enhanced Experience
- [ ] Hint system (reveal letter with penalty)
- [ ] Sentence context for each word
- [ ] "Hear again" button
- [ ] Progress persistence (resume later)
- [ ] Missed word review at end

#### Tier 3: Premium Features
- [ ] Custom word list creation (parents)
- [ ] Homophone handling ("Meet the meat")
- [ ] Syllable breakdown hints
- [ ] Printable spelling lists
- [ ] Weekly spelling challenge mode

### Experimental Features
- **Voice spelling**: Child says letters aloud
- **Write mode**: Finger-write letters in air
- **Team mode**: Family spelling bee competition
- **Difficulty AI**: Adapts to child's accuracy in real-time

---

## Section 7: Visual Identity

### Overall Look
Academic competition theme — think friendly school spelling bee with stage curtains, spotlights, and award podium.

### Camera View
Full-screen game area with camera preview in corner.

### Art Style
- **Academic elegance** meets **kid-friendly** 
- **Stage/curtain motifs**
- **Trophy/medal imagery**
- Consistent with Word Workshop palette

### Mood
Focused concentration with moments of celebration. Like a real spelling bee but pressure-free.

### Colors
| Element | Color | Hex |
|---------|-------|-----|
| Primary | Stage Curtain Red | `#DC2626` |
| Secondary | Gold Trophy | `#F59E0B` |
| Success | Winner Green | `#10B981` |
| Background | Spotlight Cream | `#FFFBEB` |
| Card Border | Podium Wood | `#D97706` |
| Accent | Spotlight Yellow | `#FCD34D` |

### Environment
Abstract stage setting with:
- Subtle curtain drapes on sides
- Spotlight effect center stage
- Podium silhouette at bottom
- Floating star/trophy decorations

### UI Style
- Theater-style announcement banners
- Velvet-textured buttons
- Spotlight hover effects
- Award ceremony animations

### Active Vibe
Focus mode — quiet concentration with bursts of celebration.

---

## Section 8: Screen Map

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| Start Screen | Game intro, grade selection | Title, grade buttons (1-3), challenge mode |
| Instructions | How to play | Animated demo, voice instructions |
| Spelling Round | Main gameplay | Word slots, letter pool, hint/repeat buttons |
| Correct Feedback | Success celebration | Points, "Perfect!" banner, next button |
| Wrong Feedback | Gentle correction | Correct spelling shown, retry button |
| Hint Reveal | Show next letter | Letter appears in slot, point deduction |
| Progress Check | Mid-game stats | Words correct, accuracy, streak |
| Game Complete | Final celebration | Trophy ceremony, final score, certificates |
| Review Screen | Learn from mistakes | Missed words list with correct spellings |
| Settings | Parent controls | Grade override, hint settings, TTS options |

---

## Section 9: Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position | Spotlight follows finger |
| Select letter | Pinch letter tile | Tile lifts, flies to next empty slot |
| Remove letter | Pinch filled slot | Letter returns to pool |
| Submit spelling | Pinch "Spell It!" button / Auto on full | Validation animation |
| Hear word | Pinch speaker icon | Word pronunciation |
| Hear sentence | Pinch sentence icon | Context sentence |
| Use hint | Pinch hint button | Next letter revealed, points deducted |
| Pause | Pinch pause button | Pause overlay |

### Gesture Details
- **Letter selection**: Pinch and release — letter animates to slot
- **Slot removal**: Pinch occupied slot — letter returns to pool
- **Pool scrolling**: If many letters, hand Y position scrolls pool

---

## Section 10: Core Mechanics

### Word Selection Algorithm
```typescript
function selectWord(grade: number, usedWords: string[], missedWords: string[]): SpellingWord {
  // 30% chance to retry a missed word
  if (missedWords.length > 0 && Math.random() < 0.3) {
    return randomFrom(missedWords);
  }
  
  const pool = WORD_BANK[grade].filter(w => !usedWords.includes(w.word));
  return randomFrom(pool);
}

function generateLetterPool(word: string, grade: number): LetterTile[] {
  const letters = word.toUpperCase().split('');
  const distractorCount = grade === 1 ? 2 : grade === 2 ? 3 : 4;
  
  // Add distractors from common confusion letters
  const distractors = selectDistractors(word, distractorCount);
  
  return shuffle([...letters, ...distractors]).map((letter, i) => ({
    id: `tile-${i}`,
    letter,
    isUsed: false,
  }));
}
```

### Scoring Formula
```
basePoints = 20
speedBonus = max(0, 10 - secondsTaken)  // Optional timer
hintPenalty = hintsUsed * 5

wordScore = basePoints + speedBonus - hintPenalty
accuracyBonus = (correctWords / totalWords) * 50

finalScore = sum(wordScores) + accuracyBonus
```

### Hint System
- **First hint**: Reveals first letter (-3 points)
- **Second hint**: Reveals next unknown letter (-3 points)
- **Hear again**: Free, unlimited
- **Sentence context**: Free, always available

---

## Section 11: Rules

### Start Conditions
- Player selects grade level (1, 2, 3, or Challenge)
- Hand tracking ready
- Audio system initialized

### Objectives
- Spell words correctly using letter tiles
- Complete 10 words per session
- Maximize score (accuracy over speed)

### Allowed Actions
- Select letters from pool
- Remove letters from spelling slots
- Request hints (with point penalty)
- Hear word/sentence again
- Skip word (0 points, counts as incorrect)

### Restrictions
- Can only use letters provided in pool
- Cannot submit incomplete words
- Maximum 3 hints per word
- Cannot change grade mid-session

### Scoring
| Action | Points |
|--------|--------|
| Correct spelling | 20 |
| Speed bonus | 0-10 |
| No hints bonus | +5 |
| Hint used | -3 each |
| Wrong spelling | 0 |
| Perfect session (10/10) | +50 bonus |

### Win/Lose Conditions
- **Completion**: Finish 10 words
- **Success**: Any score (no failure state)
- **Excellence**: 90%+ accuracy earns gold trophy

---

## Section 12: HUD / Gameplay UI

### Layout (Theater Stage Design)

```
┌─────────────────────────────────────────┐
│  [Score: 45]     Grade 1     [Word 3/10]│  ← Header
├─────────────────────────────────────────┤
│                                         │
│    "Spell the word..."                  │  ← Word prompt
│                                         │
│         ┌─────────┐                     │
│         │ 🔊 CAT  │ ← Tap to hear       │
│         └─────────┘                     │
│                                         │
│    ┌───┐ ┌───┐ ┌───┐                    │
│    │ C │ │ A │ │ T │  ← Spelling slots  │
│    └───┘ └───┘ └───┘                    │
│                                         │
│    [🔊 Word] [🔊 Sentence] [💡 Hint (-3)]│
│                                         │
│    Available letters:                   │
│    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│    │ T │ │ C │ │ P │ │ A │ │ G │       │  ← Letter pool
│    └───┘ └───┘ └───┘ └───┘ └───┘       │
│                                         │
│          [✓ SPELL IT!]                  │
│                                         │
└─────────────────────────────────────────┘
```

### HUD Elements
| Element | Position | Purpose |
|---------|----------|---------|
| Score | Top-left | Current points |
| Grade | Top-center | Current difficulty |
| Progress | Top-right | Word X of 10 |
| Word prompt | Upper-center | Hear word button |
| Spelling slots | Center | Empty/filled letter slots |
| Action buttons | Below slots | Word, Sentence, Hint |
| Letter pool | Lower-center | Available letters |
| Submit button | Bottom | Submit spelling |

---

## Section 13: Feedback and Feel

### Success Feedback
- **Visual**: Slots glow green, trophy sparkles
- **Audio**: Success chime + "Correct! C-A-T spells cat!"
- **Haptic**: Success vibration
- **Animation**: Confetti burst from word

### Wrong Spelling Feedback
- **Visual**: Slots shake red, incorrect letters highlighted
- **Audio**: Gentle chime + "Let's try again. C-A-T."
- **Haptic**: Light error buzz
- **Recovery**: Letters return to pool, retry allowed

### Hint Feedback
- **Visual**: Hinted letter glows gold as it fills slot
- **Audio**: "The next letter is..."
- **Points**: Deduction shown with "-3" animation

### During Gameplay
- **Hover**: Letters lift slightly when cursor hovers
- **Selection**: Letter flies to slot with arc animation
- **Slot full**: Submit button pulses gently

### Progress Feedback
| Milestone | Visual | Audio |
|-----------|--------|-------|
| 3 correct | Bronze medal appears | "Great start!" |
| 5 correct | Silver medal upgrade | "Halfway there!" |
| 8 correct | Gold medal upgrade | "Almost perfect!" |
| 10 correct | Trophy ceremony | Winner fanfare |

---

## Section 14: Points / Rewards / Progression

### Points Breakdown
| Action | Points |
|--------|--------|
| Correct spelling | 20 |
| Speed bonus (≤5s) | +10 |
| Speed bonus (≤10s) | +5 |
| No hints used | +5 |
| Hint used | -3 |
| Streak bonus (3+) | +5 |
| Perfect session (10/10) | +50 |

### Final Score Tiers
| Score | Rating | Trophy |
|-------|--------|--------|
| 250+ | Spelling Master | Gold 🏆 |
| 200-249 | Spelling Star | Silver 🥈 |
| 150-199 | Spelling Scholar | Bronze 🥉 |
| <150 | Word Learner | Ribbon 🎗️ |

### Rewards/Drops (Proposed Registry Entry)
```typescript
drops: [
  { itemId: 'letter-a', chance: 0.15 },
  { itemId: 'letter-e', chance: 0.15 },
  { itemId: 'letter-i', chance: 0.15 },
  { itemId: 'star-gold', chance: 0.1 },
  { itemId: 'trophy-gold', chance: 0.05, minScore: 200 },
  { itemId: 'book-spelling', chance: 0.1 },
]
```

### Easter Eggs
```typescript
easterEggs: [
  {
    id: 'egg-perfect-bee',
    name: 'Perfect Speller',
    description: 'Complete a session with 100% accuracy and no hints',
    trigger: 'perfect-session',
    reward: { itemId: 'trophy-gold', quantity: 1 },
    hint: 'Spell every word right on the first try!',
    difficulty: 'hard',
  },
  {
    id: 'egg-speed-speller',
    name: 'Speed Speller',
    description: 'Complete 5 words in under 30 seconds each',
    trigger: 'speed-demon',
    reward: { itemId: 'star-gold', quantity: 2 },
    hint: 'Spell quickly without hints!',
    difficulty: 'medium',
  },
]
```

### Progression System
- **Grade 1**: 2-3 letter words (unlocked)
- **Grade 2**: 3-4 letter words (unlock at 80% Grade 1)
- **Grade 3**: 4-5 letter words (unlock at 80% Grade 2)
- **Challenge**: Mixed difficulty (unlock all grades)

---

## Section 15: End States

### Correct Spelling
1. Green glow animation on slots
2. Success sound + TTS confirmation
3. Points awarded with popup
4. Word marked correct
5. Next word appears after 2s

### Wrong Spelling
1. Red shake on incorrect slots
2. Gentle error sound
3. Correct spelling displayed
4. Word marked incorrect (for review)
5. Option to retry or continue

### Session Complete
1. Trophy ceremony animation
2. Final score and rating displayed
3. Missed words review list
4. Rewards/drops granted
5. Options: Play Again, Try Harder Grade, Home

### Hint Used
1. Gold glow on revealed letter
2. Point deduction shown
3. Letter auto-fills in correct slot
4. Player continues with remaining letters

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Typing Mode (`cv: []` or keyboard)
- Traditional keyboard input
- For desktop users without camera
- Same word bank and scoring

### Mode B: Voice Spelling (`cv: ['voice']`)
- Child says letters aloud
- Speech recognition validates
- "C... A... T..."

### Mode C: Writing Mode (`cv: ['hand']` advanced)
- Air-write letters with finger
- OCR recognizes written letters
- More tactile learning

### Mode D: Parent/Teacher Mode
- Create custom word lists
- Track specific spelling patterns
- No game elements, pure assessment

### Mode E: Competition Mode
- Head-to-head spelling race
- Same word for both players
- Speed + accuracy scoring

---

## Section 17: Improvement Opportunities

### Low Cost
1. **Syllable hints**: Break long words into syllables
2. **Picture hints**: Show image of word meaning
3. **Pattern highlighting**: Show word family (-at, -ig)
4. **Voice recording**: Record child saying word first

### Medium Effort
1. **Missed word practice**: Dedicated review mode
2. **Weekly challenges**: New word lists each week
3. **Parent reports**: Email progress summaries
4. **Homophone lessons**: "Their/there/they're" mode

### Ambitious
1. **AI difficulty**: Real-time adaptation
2. **Personalized lists**: Based on reading level
3. **Cross-game integration**: Words from Story Builder
4. **Real spelling bee prep**: Official Scripps word lists

---

## Section 18: Content Model

### Word Bank Structure
```typescript
interface SpellingWord {
  word: string;
  grade: 1 | 2 | 3 | 4;
  category: 'cvc' | 'blend' | 'sight' | 'digraph' | 'vowel-team';
  sentence: string;
  image?: string; // Optional illustration
  syllables?: number;
}

// Example entries
const WORD_BANK: SpellingWord[] = [
  { word: 'cat', grade: 1, category: 'cvc', sentence: 'The cat sat on the mat.' },
  { word: 'frog', grade: 2, category: 'blend', sentence: 'The green frog jumps high.' },
  { word: 'ship', grade: 3, category: 'digraph', sentence: 'We sailed on a big ship.' },
];
```

### Grade 1 Words (Sample)
cat, dog, sun, bus, hat, bat, rat, mat, sit, run, pen, ten, hen, big, dig, pig, log, hop, pop, mom, dad, the, and, you

### Grade 2 Words (Sample)
frog, bird, fish, jump, play, star, blue, green, tree, house, boat, rain, snow, happy, school, friend

### Grade 3 Words (Sample)
ship, boat, train, cloud, flower, garden, yellow, purple, orange, family, picture, water, morning

---

## Section 19: Technical Structure

### Main Files to Create

| File | Purpose | Lines (est.) |
|------|---------|--------------|
| `src/frontend/src/pages/SpellingBee.tsx` | Main game component | 700-900 |
| `src/frontend/src/games/spellingBeeLogic.ts` | Word bank & game logic | 500-600 |
| `src/frontend/src/data/gameRegistries/wordWorkshop.ts` | Add registry entry | +50 |
| `src/frontend/src/routes/appRoutes.tsx` | Add route | +10 |

### Key Components
- `GameContainer` — Standard wrapper
- `GameShell` — Error boundary
- `GameCursor` — Hand tracking cursor
- `LetterTile` — Animated letter component
- `SpellingSlot` — Target slot component
- `HintButton` — Hint with cost display

### Hooks Used
```typescript
useGameHandTracking      // Hand tracking
useGameCompletion        // Session end
useTTS                   // Word pronunciation
useAudio                 // Sound effects
useLocalStorage          // Progress persistence
```

### State Management
```typescript
interface GameState {
  currentWord: SpellingWord;
  spelledLetters: (string | null)[];
  letterPool: LetterTile[];
  hintsUsed: number;
  sessionStats: {
    correct: number;
    incorrect: number;
    hintsUsed: number;
    words: WordResult[];
  };
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Word bank size | 150-200 words across grades | Medium |
| Optimal session length | 10 words based on attention span | Medium |
| Hint penalty balance | -3 points feels fair | Low |
| Distractor selection | Letters that look/sound similar | High |
| TTS sentence quality | Test with children | Medium |

---

## Section 21: Implementation Notes

### Strengths to Preserve
1. **WordBuilder** letter selection mechanics
2. **PhonicsSounds** audio feedback patterns
3. **BlendBuilder** grade/difficulty system

### New Patterns Needed
1. **Scrambled pool** — Different from WordBuilder's sequential selection
2. **Slot management** — Fill/remove mechanics
3. **Hint economy** — Balanced penalty system

### Testing Considerations
- Test with early readers (ages 5-7)
- Validate word difficulty appropriateness
- Ensure audio clarity for all words
- Test with various hand sizes/positions

### Performance Notes
- Pre-load word bank on mount
- Cache TTS audio when possible
- Animate efficiently with Framer Motion

---

## Section 22: Acceptance Criteria

### Must Have (MVP)
- [ ] Game launches from Word Workshop gallery
- [ ] Grade selection (1, 2, 3)
- [ ] Word pronunciation via TTS
- [ ] Letter pool with correct letters + distractors
- [ ] Spelling slot filling system
- [ ] Submit and validate spelling
- [ ] Correct/incorrect feedback
- [ ] Score tracking
- [ ] Session completion after 10 words

### Should Have
- [ ] Sentence context for words
- [ ] Hint system (reveal letter)
- [ ] Hear again button
- [ ] Progress persistence
- [ ] Missed word review
- [ ] Trophy/rating system

### Nice to Have
- [ ] Custom word lists
- [ ] Picture hints
- [ ] Voice spelling mode
- [ ] Parent progress reports
- [ ] Weekly challenges

---

## Section 23: Test Plan

### Manual Gameplay Tests
| Test | Steps | Expected |
|------|-------|----------|
| Start game | Select Grade 1 | First word appears |
| Hear word | Tap speaker | Word pronounced clearly |
| Spell correctly | Select C-A-T | Green success, points awarded |
| Spell incorrectly | Select C-A-P | Red feedback, retry allowed |
| Use hint | Tap hint button | First letter revealed, -3 points |
| Complete word | Fill all slots | Auto-submit or submit button active |
| Finish session | Complete 10 words | Trophy ceremony, final score |

### CV Control Tests
| Test | Steps | Expected |
|------|-------|----------|
| Hand tracking | Show hand | Cursor appears |
| Select letter | Pinch letter tile | Letter animates to slot |
| Remove letter | Pinch filled slot | Letter returns to pool |
| Precision | Select specific letters | Accurate hit detection |

### Content Tests
| Test | Steps | Expected |
|------|-------|----------|
| Word difficulty | Play each grade | Appropriate challenge |
| Audio clarity | Listen to 20 words | All clearly pronounced |
| Sentence context | Tap sentence button | Full sentence spoken |
| Distractor balance | Check letter pools | Reasonable options only |

### Edge Cases
| Test | Steps | Expected |
|------|-------|----------|
| Partial spelling | Submit incomplete | Warning, not submitted |
| All hints used | Use 3 hints | Hint button disabled |
| Same letter twice | Word: "book" | Two 'O' tiles in pool |
| Disconnected | Lose camera | Graceful pause state |

---

## Appendix A: Registry Entry (Proposed)

```typescript
{
  id: 'spelling-bee',
  name: 'Spelling Bee',
  tagline: 'Hear the word, then spell it! Can you win the golden trophy? 🏆🔤',
  path: '/games/spelling-bee',
  icon: 'trophy',
  previewImage: '/assets/previews/spelling-bee.png',
  worldId: 'word-workshop',
  vibe: 'educational',
  ageRange: '5-8',
  isNew: true,
  cv: ['hand'],
  listed: true,
  drops: [
    { itemId: 'letter-a', chance: 0.12 },
    { itemId: 'letter-e', chance: 0.12 },
    { itemId: 'letter-i', chance: 0.12 },
    { itemId: 'star-gold', chance: 0.15 },
    { itemId: 'trophy-gold', chance: 0.05, minScore: 200 },
    { itemId: 'book-spelling', chance: 0.1 },
  ],
  easterEggs: [
    {
      id: 'egg-perfect-bee',
      name: 'Perfect Speller',
      description: 'Complete a session with 100% accuracy and no hints',
      trigger: 'perfect-session',
      reward: { itemId: 'trophy-gold', quantity: 1 },
      hint: 'Spell every word right on the first try!',
      difficulty: 'hard',
    },
  ],
}
```

---

## Appendix B: Differentiation from SpellingRun

| Aspect | SpellingRun | SpellingBee (Proposed) |
|--------|-------------|------------------------|
| **Gameplay** | Side-scrolling platformer | Quiz-based spelling test |
| **Interaction** | Jump to collect letters | Pinch to select letters |
| **Pace** | Fast, active | Slow, thoughtful |
| **Focus** | Hand-eye coordination | Spelling memory |
| **Words** | Random CVC words | Grade-leveled lists |
| **Scoring** | Collection-based | Accuracy-based |
| **CV Mode** | Hand position controls jump | Pinch to select |

Both games teach spelling but target different learning styles and skills.

---

## Appendix C: File References

### Similar Games for Reference
| Game | File | Pattern to Follow |
|------|------|-------------------|
| WordBuilder | `src/frontend/src/pages/WordBuilder.tsx` | Letter selection, slots |
| PhonicsSounds | `src/frontend/src/pages/PhonicsSounds.tsx` | Audio feedback system |
| BlendBuilder | `src/frontend/src/pages/BlendBuilder.tsx` | Grade/difficulty structure |
| SpellingRun | `src/frontend/src/pages/SpellingRun.tsx` | Word lists (NOT gameplay) |

---

*End of Specification — Spelling Bee*
