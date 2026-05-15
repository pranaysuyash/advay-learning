# Sentence Builder

**Game ID:** sentence-builder  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Planned File:** `src/frontend/src/pages/SentenceBuilder.tsx`  
**Planned Logic:** `src/frontend/src/games/sentenceBuilderLogic.ts`

---

## 1. Concept Summary

- **One-line concept:** Drag and drop jumbled words to form complete, meaningful sentences and bring the story to life!
- **Genre:** Language Arts / Sentence Construction / Early Grammar
- **Target audience:** Ages 4-8, children learning sentence structure and word order
- **Core player fantasy:** "I'm a sentence architect building stories word by word!"
- **Primary skill tested:** Sentence structure recognition, word order comprehension, grammar fundamentals, reading comprehension
- **Session length:** 5-10 minutes (5-7 sentences per session)
- **Platform context:** Hand-tracking word arrangement game with drag-and-drop mechanics

---

## 2. Repo Status

- **Implementation status:** ❌ NOT IMPLEMENTED (Note: `story-builder` exists but is a different game)
- **What works now:** N/A - Game exists only in GAME_INDEX.md reference
- **What is partial/missing:** 
  - No React component exists
  - No game logic file exists
  - No registry entry in wordWorkshop.ts
  - No route in App.tsx
- **Evidence:**
  - No `src/frontend/src/pages/SentenceBuilder.tsx` file found
  - No `src/frontend/src/games/sentenceBuilderLogic.ts` file found
  - `StoryBuilder.tsx` exists but is a different game (tap-based 3-word sentences)
  - Listed in docs/games/GAME_INDEX.md as "planned"
- **Confidence level:** High - Confirmed non-existent implementation

---

## 3. Current Implementation

### Flow
N/A - Game not implemented.

### Controls
| Input | Action | CV Mode | Mouse Mode |
|-------|--------|---------|------------|
| Hover | Position cursor | Hand tracking | Mouse pointer |
| Pinch/Click | Grab word | Index finger pinch | Mouse click + hold |
| Drag | Move word | Hand movement while pinching | Mouse movement |
| Release | Drop word in slot | Pinch release | Mouse release |
| Tap | Submit sentence | Cursor + pinch | Click |

### Mechanics (Intended)
- **Sentence assembly:** Drag scrambled words into correct order
- **Word types:** Nouns, verbs, adjectives, articles in proper sequence
- **Visual feedback:** Words snap into place, incorrect placement bounces back
- **Progressive complexity:** 3 words → 5 words → 7+ words
- **Picture context:** Image shown to guide sentence meaning

### Visuals/UI (Planned)
- Picture illustration for context
- Empty sentence slots (drop zones)
- Word pool with draggable word tiles
- Animated character reactions to correct sentences
- Progress bar through session

### Gaps/Issues
- Game does not exist yet - needs full implementation
- Content library needs curation
- Difficulty progression needs definition
- Picture assets need sourcing or creation

---

## 4. Intended Design

### Educational Goal
Teach children that sentences follow predictable patterns (Subject-Verb-Object). Build understanding of word types and their positions. Develop reading comprehension through picture-sentence matching.

### Pedagogical Approach
Constructionist learning through physical manipulation of words. Children learn grammar by assembling sentences like puzzle pieces. Visual context (pictures) supports emergent readers.

### Difficulty Progression
| Level | Word Count | Sentence Pattern | Example |
|-------|------------|------------------|---------|
| 1 | 3 words | Subject + Verb + Object | "The cat sleeps" |
| 2 | 4 words | Article + Noun + Verb + Object | "The dog eats food" |
| 3 | 5 words | Subject + Verb + Adjective + Object | "I see a red bird" |
| 4 | 6 words | Compound subject or object | "The boy and girl play" |
| 5 | 7+ words | Complex sentences | "The happy children play in the park" |

### Accessibility
- Large word tiles for easy grasping
- Audio narration of words on tap
- Visual color-coding by word type
- Unlimited attempts, no penalties
- Picture context always visible

### Engagement
- Character reacts to completed sentences
- Sentence read aloud on completion
- Animation illustrating the sentence meaning
- Collectible stickers for mastery

### Core Loop
1. View picture context
2. See scrambled word tiles
3. Drag words to sentence slots in correct order
4. Submit for validation
5. If correct: celebration + sentence read aloud
6. If incorrect: gentle feedback, try again
7. Progress to next sentence

---

## 5. Drift Analysis

### Where Implementation Matches Intent
N/A - No implementation exists.

### Where Implementation Exceeds Intent
N/A - No implementation exists.

### Where Implementation Falls Short
- ❌ No code exists
- ❌ No UI implemented
- ❌ No logic implemented
- ❌ No assets created
- ❌ Not registered in game system

### Overall Assessment
**Alignment: 0%** - Game is conceptual only. Complete implementation required.

**Note:** There exists a `story-builder` game (id: story-builder) which is a TAP-based 3-word sentence game with buttons. The `sentence-builder` specified here is a different game with DRAG-AND-DROP mechanics for longer sentences with picture context.

---

## 6. Recommended Canonical Version

Since no implementation exists, this section defines the target design:

### Core Features to Implement
1. **Drag-and-Drop Engine:** Hand-tracked word manipulation
2. **Sentence Validator:** Grammar-aware validation
3. **Picture Context:** Illustration per sentence
4. **Word Type System:** Color-coded parts of speech
5. **Audio Narration:** TTS for words and sentences
6. **Character Reactions:** Animated feedback

### Technical Architecture
- Pure TypeScript logic layer (sentenceBuilderLogic.ts)
- React with framer-motion for drag physics
- useGameHandTracking for gesture control
- Structured content with word type metadata

### Content Requirements
- 50+ sentences across 5 difficulty levels
- Picture assets for each sentence
- Word type tags (noun, verb, adjective, etc.)
- Audio narration (TTS or pre-recorded)

---

## 7. Visual Identity

- **Overall look:** Cheerful storybook scene with animated characters
- **Camera view:** Static full-screen with picture at top
- **Art style:** Friendly, storybook illustration style
- **Mood:** Playful and encouraging
- **Colors:**
  - Nouns: Blue (#3B82F6)
  - Verbs: Orange (#F97316)
  - Adjectives: Purple (#A855F7)
  - Articles: Gray (#6B7280)
  - Success: Emerald (#10B981)
  - Background: Warm cream (#FFFBEB)
- **Environment:** Storybook page with decorative border
- **UI style:** Rounded cards with word tiles
- **Active vibe:** Engaging and interactive

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start** | Intro and level select | Title, emoji (✍️), instructions, difficulty buttons |
| **Tutorial** | First-time guidance | Animated demo of drag-and-drop |
| **Playing** | Main sentence building | Picture, sentence slots, word pool |
| **Dragging** | Word manipulation | Cursor holding word, slot highlights |
| **Submitting** | Validation | Loading, correctness check |
| **Success** | Sentence correct | Character reaction, audio narration |
| **Complete** | Session finished | Progress summary, rewards |
| **Retry** | Incorrect attempt | Gentle feedback, words return to pool |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Position cursor | Hand movement | Cursor follows index finger |
| Grab word | Pinch gesture | Word scales up, lifts from pool |
| Drag word | Move while pinching | Word follows cursor, tilts slightly |
| Hover slot | Move over drop zone | Slot border glows |
| Drop word | Release pinch | Word snaps into slot or returns to pool |
| Submit sentence | Tap submit button | Button press, validation begins |
| Replay audio | Tap speaker icon | Sound wave animation |
| Get hint | Tap hint button | First correct word highlighted |

### CV-Specific Interactions
- Cursor: Index finger tip with grab indicator
- Pinch threshold: 0.12 (responsive for quick grabs)
- Drag smoothing: OneEuro filter with low beta
- Drop zones: Visual expansion on hover
- Word return: Spring animation if invalid drop

---

## 10. Core Mechanics

### Sentence Structure
```typescript
interface Word {
  text: string;
  type: 'article' | 'noun' | 'verb' | 'adjective' | 'preposition' | 'adverb';
  audio?: string; // TTS or pre-recorded
}

interface Sentence {
  id: string;
  words: Word[];
  correctOrder: number[]; // Indices of words in correct order
  picture: string; // Asset path
  difficulty: 1 | 2 | 3 | 4 | 5;
  hint?: string;
}

// Example
const exampleSentence: Sentence = {
  id: 'cat-sleeps',
  words: [
    { text: 'The', type: 'article' },
    { text: 'cat', type: 'noun' },
    { text: 'sleeps', type: 'verb' },
  ],
  correctOrder: [0, 1, 2],
  picture: '/assets/sentences/cat-sleeps.png',
  difficulty: 1,
};
```

### Validation Logic
```typescript
function validateSentence(
  sentence: Sentence,
  userOrder: number[]
): ValidationResult {
  const isCorrect = arraysEqual(userOrder, sentence.correctOrder);
  
  return {
    isCorrect,
    correctWords: userOrder.filter((idx, pos) => 
      idx === sentence.correctOrder[pos]
    ).length,
    misplacedWords: userOrder.filter((idx, pos) => 
      idx !== sentence.correctOrder[pos]
    ),
    missingWords: sentence.correctOrder.filter(idx => 
      !userOrder.includes(idx)
    ),
  };
}
```

### Scoring Formula
```typescript
function calculateScore(
  attempts: number,
  hintsUsed: number,
  sentenceDifficulty: number
): number {
  const baseScore = sentenceDifficulty * 20;
  const attemptBonus = attempts === 1 ? 10 : 0;
  const hintPenalty = hintsUsed * 5;
  
  return Math.max(baseScore + attemptBonus - hintPenalty, 5);
}
```

### Drag Physics
```typescript
interface DragState {
  wordId: string | null;
  position: { x: number; y: number };
  origin: { x: number; y: number };
  isDragging: boolean;
}

// Spring configuration for return animation
const RETURN_SPRING = {
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

// Snap configuration for valid drop
const SNAP_SPRING = {
  stiffness: 400,
  damping: 30,
  mass: 0.5,
};
```

---

## 11. Rules

### Start
- Select difficulty level
- First sentence loads with picture and scrambled words
- Tutorial shown for first-time players

### Allowed Actions
- Grab any word from the pool
- Drag word to any empty sentence slot
- Rearrange words already placed
- Submit sentence for validation
- Request hint (one word revealed)
- Replay sentence audio

### Restricted Actions
- Cannot place multiple words in one slot
- Cannot submit incomplete sentences
- Cannot use more than 2 hints per sentence

### Scoring
- Base: Difficulty × 20 points
- First-try bonus: +10 points
- Hint penalty: -5 points per hint
- Minimum: 5 points per sentence

### Error Handling
- Incomplete sentence: "Fill all the spots first!"
- Incorrect order: "Not quite right. Try rearranging!"
- Wrong word type placement: Color-coded hint
- Stuck detection: Offer hint after 3 failed attempts

### Win/Lose Conditions
- **Win:** Sentence assembled in correct word order
- **Abandon:** Exit early (partial credit)
- **Perfect:** First try, no hints

---

## 12. HUD / Gameplay UI

### Top Bar
```
┌─────────────────────────────────────────────────────┐
│  🏠  Sentence Builder  Level 2    ⭐ 85   🎯 3/5    │
└─────────────────────────────────────────────────────┘
```

### Picture Context
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           [Picture: Cat sleeping on bed]            │
│                                                     │
│           "What sentence matches this?"             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Sentence Slots
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌────────┐  ┌────────┐  ┌────────┐               │
│   │   ?    │  │   ?    │  │   ?    │               │
│   │ (drop) │  │ (drop) │  │ (drop) │               │
│   └────────┘  └────────┘  └────────┘               │
│                                                     │
│         [✓ Check Sentence]  [💡 Hint]              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Word Pool
```
┌─────────────────────────────────────────────────────┐
│  Word Bank:                                         │
│  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │  cat   │  │  The   │  │ sleeps │                │
│  │ (noun) │  │(article│  │ (verb) │                │
│  │  blue  │  │  gray  │  │ orange │                │
│  └────────┘  └────────┘  └────────┘                │
│                                                     │
│   🔊 [Tap words to hear them!]                     │
└─────────────────────────────────────────────────────┘
```

### Completion Overlay
```
┌─────────────────────────────────────────┐
│                                         │
│     ✨ Great sentence! ✨               │
│                                         │
│     "The cat sleeps"                    │
│                                         │
│     🎵 [Auto-playing audio]            │
│                                         │
│     [Next Sentence →]                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success Feedback
- **Word placed:**
  - Pop sound
  - Word gently bounces in slot
  - Slot glows briefly
- **Sentence correct:**
  - Success chime
  - Picture animates (character reacts)
  - Sentence reads aloud automatically
  - Stars sparkle
- **Session complete:**
  - Celebration music
  - Confetti animation
  - Character dances
  - Final score tally

### Failure/Caution Feedback
- **Incorrect sentence:**
  - Gentle buzz
  - Words shake in place
  - "Try rearranging the words" message
  - Misplaced words highlighted
- **Incomplete sentence:**
  - Neutral tone
  - Empty slots pulse
  - "Fill all the spots first"
- **Word dropped in wrong place:**
  - Word returns to pool with spring
  - "That doesn't fit there"

### Audio
| Event | Sound | Source |
|-------|-------|--------|
| Word grab | pop | useAudio.playPop |
| Word place | click | useAudio.playClick |
| Word return | soft whoosh | useAudio |
| Sentence correct | success | useAudio.playSuccess |
| Sentence incorrect | error | useAudio.playError |
| Session complete | celebration | useAudio.playCelebration |
| Word tap | blip | TTS trigger |

### Responsiveness
- Grab: <50ms
- Drag: 60fps smooth
- Drop snap: 150ms spring
- Return to pool: 300ms spring
- Validation: <100ms

---

## 14. Points / Rewards / Progression

### Points System
| Component | Value |
|-----------|-------|
| Level 1 sentence | 20 points |
| Level 2 sentence | 40 points |
| Level 3 sentence | 60 points |
| Level 4 sentence | 80 points |
| Level 5 sentence | 100 points |
| First-try bonus | +10 points |
| Hint penalty | -5 points per hint |

### Recommended Drops (Registry)
```typescript
drops: [
  { itemId: 'book-blue', chance: 0.18 },
  { itemId: 'letter-a', chance: 0.12 },
  { itemId: 'star-silver', chance: 0.08 },
  { itemId: 'creature-owl', chance: 0.05, minScore: 80 },
  { itemId: 'trophy-gold', chance: 0.03, minScore: 120 },
]
```

### Recommended Easter Eggs
```typescript
easterEggs: [
  {
    id: 'egg-first-sentence',
    name: 'First Sentence',
    description: 'Build your first correct sentence',
    trigger: 'first-sentence-complete',
    reward: { itemId: 'book-blue', quantity: 1 },
    hint: 'Put the words in order!',
    difficulty: 'easy',
  },
  {
    id: 'egg-sentence-master',
    name: 'Sentence Master',
    description: 'Complete 10 sentences without hints',
    trigger: 'ten-perfect-sentences',
    reward: { itemId: 'star-gold', quantity: 1 },
    hint: 'Try without using hints!',
    difficulty: 'medium',
  },
  {
    id: 'egg-storyteller',
    name: 'Storyteller',
    description: 'Complete all difficulty levels',
    trigger: 'all-levels-complete',
    reward: { itemId: 'trophy-gold', quantity: 1 },
    hint: 'Master every level!',
    difficulty: 'hard',
  },
]
```

### Progression
- **Level unlock:** Complete 4 sentences in current level
- **Picture gallery:** Collected illustrations viewable
- **Sentence mastery:** Track sentences completed without hints

---

## 15. End States

### Sentence Complete (Success)
1. Validation confirms correct order
2. Success sound plays
3. Picture character animates/reacts
4. Sentence reads aloud (TTS)
5. Score calculated and displayed
6. Brief celebration animation
7. "Next" button appears

### Sentence Incorrect (Retry)
1. Validation fails
2. Error sound plays
3. Misplaced words highlighted
4. Gentle feedback message
5. Player can rearrange and retry
6. Attempt counter increments

### Session Complete (5 Sentences)
1. Final score calculated
2. Star rating displayed
3. Drops awarded
4. Easter eggs checked
5. Picture gallery shows new unlocks
6. Return to menu or replay option

### Early Exit
1. Current progress saved
2. Partial score awarded
3. Can resume from same sentence later

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Drag-and-Drop (Primary)
- Full hand tracking with pinch
- Physics-based drag and drop
- Visual slot snapping

### Mode B: Tap-to-Place (Simplified)
- Tap word, then tap slot
- No drag required
- Easier for younger children

### Mode C: Voice Building (Accessibility)
- Speak words to place them
- "Put 'cat' in slot 2"
- Audio confirmation

### Mode D: Type Mode (Advanced)
- Keyboard input
- Type full sentence
- Spelling practice

### Mode E: Story Mode (Narrative)
- Connected sentences form story
- Characters remember previous sentences
- Sequential narrative progression

---

## 17. Improvement Opportunities

### Phase 1: MVP (Required for Launch)
- [ ] Core drag-and-drop mechanics
- [ ] 3-word sentence support
- [ ] Picture context display
- [ ] Basic validation
- [ ] Sound effects
- [ ] 20 sentences at Level 1

### Phase 2: Polish (Post-Launch)
- [ ] Expand to 5+ word sentences
- [ ] Difficulty levels 2-5
- [ ] Word type color coding
- [ ] TTS narration
- [ ] Character reactions
- [ ] 50+ total sentences

### Phase 3: Enhancement (Future)
- [ ] Story mode with connected narratives
- [ ] Player sentence creation
- [ ] Custom picture upload
- [ ] Multiplayer collaborative building
- [ ] Grammar mini-lessons

---

## 18. Content Model

### Sentence Structure
```typescript
interface SentenceContent {
  id: string;
  text: string;
  words: {
    text: string;
    type: WordType;
    color: string;
  }[];
  picture: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'animals' | 'actions' | 'places' | 'food' | 'daily';
}
```

### Sample Content

#### Level 1 (3 words)
| ID | Sentence | Words | Picture |
|----|----------|-------|---------|
| cat-sleeps | The cat sleeps | The (article), cat (noun), sleeps (verb) | Cat sleeping |
| dog-runs | The dog runs | The (article), dog (noun), runs (verb) | Dog running |
| i-eat | I eat apples | I (pronoun), eat (verb), apples (noun) | Child eating |

#### Level 3 (5 words)
| ID | Sentence | Words | Picture |
|----|----------|-------|---------|
| big-red-ball | I see a big ball | I (pronoun), see (verb), a (article), big (adj), ball (noun) | Large ball |
| happy-kids-play | The happy kids play | The (article), happy (adj), kids (noun), play (verb) | Children playing |

#### Level 5 (7+ words)
| ID | Sentence | Words | Picture |
|----|----------|-------|---------|
| park-playing | The children play in the park | The (article), children (noun), play (verb), in (prep), the (article), park (noun) | Park scene |
| breakfast-time | We eat breakfast at the table | We (pronoun), eat (verb), breakfast (noun), at (prep), the (article), table (noun) | Breakfast table |

### Target Content Volume
| Difficulty | Words | Sentences | Categories |
|------------|-------|-----------|------------|
| Level 1 | 3 | 15 | animals, actions |
| Level 2 | 4 | 15 | daily routines |
| Level 3 | 5 | 15 | descriptions |
| Level 4 | 6 | 10 | compound subjects |
| Level 5 | 7+ | 10 | complex scenes |

---

## 19. Technical Structure

### File Organization
```
src/frontend/src/
├── pages/
│   └── SentenceBuilder.tsx          # Main component (~450 lines)
├── games/
│   ├── sentenceBuilderLogic.ts      # Game logic (~180 lines)
│   ├── sentenceBuilderLogic.test.ts # Unit tests
│   └── sentencePhysics.ts           # Drag physics helpers
└── data/
    └── sentenceContent.ts           # Sentence library
```

### Key Components
```typescript
// SentenceBuilder.tsx
function SentenceBuilderGame() {
  // State
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [placedWords, setPlacedWords] = useState<(Word | null)[]>([]);
  const [poolWords, setPoolWords] = useState<Word[]>([]);
  const [draggedWord, setDraggedWord] = useState<Word | null>(null);
  
  // Hand tracking
  const { cursor, isPinching } = useGameHandTracking({
    gameName: 'SentenceBuilder',
    onFrame: handleFrame,
  });
  
  // Drag physics
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  
  // Render picture, slots, word pool
}
```

### Key Dependencies
- `useGameHandTracking`: CV cursor and pinch
- `framer-motion`: Drag physics and animations
- `useAudio`: Sound effects
- `useTTS`: Text-to-speech
- `useGameCompletion`: Progress tracking

### State Management
```
GameState: {
  sentence: SentenceContent
  placedWords: (Word | null)[]
  poolWords: Word[]
  draggedWord: Word | null
  attempts: number
  hintsUsed: number
  status: 'building' | 'validating' | 'correct' | 'incorrect'
}
```

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Picture assets | Need 50+ illustrations | High |
| Sentence corpus | Need curated age-appropriate sentences | High |
| Word type tagging | Manual or automated POS tagging | Medium |
| TTS voice | Use browser TTS or pre-record | Medium |
| Drag physics | Spring constants need tuning | Medium |
| Hit detection | Slot detection radius needs testing | High |

---

## 21. Implementation Notes

### Architecture Patterns
1. **Physics-based drag:** Framer Motion for natural feel
2. **Immutable state:** New arrays for word placements
3. **Ref-based tracking:** Current drag position for hit testing
4. **Lazy content:** Load sentences by difficulty level

### Testing Considerations
- Drag and drop accuracy
- Sentence validation correctness
- Hit detection precision
- Hand tracking responsiveness
- Edge cases (empty slots, duplicate words)

### Performance Notes
- Animate only dragged word (not whole pool)
- Use CSS transforms for smooth 60fps
- Debounce hit detection to 16ms
- Preload next sentence's picture

### Accessibility
- High contrast mode
- Large hit targets (80px min)
- Full keyboard navigation
- Screen reader support for words

---

## 22. Acceptance Criteria

### Core Functionality
- [ ] Start screen with level selection
- [ ] Picture displays for context
- [ ] Word pool renders scrambled
- [ ] Drag-and-drop works with hand tracking
- [ ] Words snap to sentence slots
- [ ] Validation checks word order
- [ ] Feedback for correct/incorrect
- [ ] Audio narration plays
- [ ] Session progress tracked

### Content
- [ ] 15 sentences at Level 1
- [ ] Pictures for all sentences
- [ ] Words color-coded by type
- [ ] Sentences are age-appropriate

### CV/Input
- [ ] Hand tracking cursor visible
- [ ] Pinch grabs words
- [ ] Release drops words
- [ ] Mouse fallback works
- [ ] Touch devices supported

### UX/Polish
- [ ] Sound effects on actions
- [ ] Smooth animations (60fps)
- [ ] Clear visual feedback
- [ ] Celebration on completion

### Edge Cases
- [ ] Word dropped outside slots returns
- [ ] Hand lost during drag handled
- [ ] Rapid grab attempts handled
- [ ] Incomplete sentence warning

---

## 23. Test Plan

### Manual Gameplay Tests

#### Basic Flow
- [ ] Start game, select level
- [ ] Drag words to build sentence
- [ ] Submit correct sentence
- [ ] Verify audio plays
- [ ] Complete 5-sentence session

#### Drag and Drop
- [ ] Grab word with pinch
- [ ] Drag to slot
- [ ] Release to place
- [ ] Verify snap animation
- [ ] Test invalid drop returns word

#### Validation
- [ ] Submit correct sentence
- [ ] Submit incorrect sentence
- [ ] Submit incomplete sentence
- [ ] Verify appropriate feedback

#### Audio
- [ ] Tap word plays audio
- [ ] Correct sentence plays full audio
- [ ] Speaker icon replays audio

### CV Control Tests
- [ ] Hand tracking initializes
- [ ] Cursor follows finger
- [ ] Pinch detection reliable
- [ ] Drag physics smooth

### Fallback Tests
- [ ] Mouse drag works
- [ ] Touch drag works
- [ ] Click-to-place works

### Edge Cases
- [ ] Rapid grab/drop attempts
- [ ] Hand loss mid-drag
- [ ] Browser back button
- [ ] Resume saved progress

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Comprehensive design specification for new game implementation

**Note:** This game (sentence-builder) is distinct from the existing story-builder game. Story Builder uses tap-based selection for simple 3-word sentences. Sentence Builder uses drag-and-drop mechanics for longer sentences with picture context.
