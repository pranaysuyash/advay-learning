# Word Ladder

**Game ID:** word-ladder  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Planned File:** `src/frontend/src/pages/WordLadder.tsx`  
**Planned Logic:** `src/frontend/src/games/wordLadderLogic.ts`

---

## 1. Concept Summary

- **One-line concept:** Transform a starting word into a target word by changing one letter at a time, with each step creating a valid word—bridge the gap!
- **Genre:** Word Puzzle / Vocabulary / Logic
- **Target audience:** Ages 5-8, children building vocabulary and phonemic awareness
- **Core player fantasy:** "I'm a word wizard connecting words through letter magic!"
- **Primary skill tested:** Vocabulary knowledge, letter substitution, word recognition, logical sequencing
- **Session length:** 5-10 minutes (5 puzzles per session)
- **Platform context:** Hand-tracking puzzle game with drag-and-drop letter interactions

---

## 2. Repo Status

- **Implementation status:** ❌ NOT IMPLEMENTED
- **What works now:** N/A - Game exists only in GAME_INDEX.md reference
- **What is partial/missing:** 
  - No React component exists
  - No game logic file exists
  - No registry entry in wordWorkshop.ts
  - No route in App.tsx
- **Evidence:**
  - No `src/frontend/src/pages/WordLadder.tsx` file found
  - No `src/frontend/src/games/wordLadderLogic.ts` file found
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
| Pinch/Click | Select/drag letter | Index finger pinch | Mouse click |
| Release | Drop letter into slot | Pinch release | Mouse release |
| Tap | Submit word | Cursor + pinch | Click |

### Mechanics (Intended)
- **Word ladder concept:** Transform START word to TARGET word one letter at a time
- **Valid intermediate words:** Each step must form a real dictionary word
- **Letter substitution:** Change exactly one letter per step
- **Path finding:** Find shortest valid path between words
- **Hint system:** Reveal one possible next word

### Visuals/UI (Planned)
- Clean ladder visualization with rungs representing word steps
- Current word displayed prominently with letter slots
- Draggable alphabet letters for substitution
- Visual connection lines between valid word steps
- Progress indicator showing steps used vs. minimum possible

### Gaps/Issues
- Game does not exist yet - needs full implementation
- Dictionary/word list needs to be curated for age-appropriateness
- Hint algorithm needs design
- Difficulty progression system needs definition

---

## 4. Intended Design

### Educational Goal
Teach children that words are malleable—changing one sound/letter creates new words. Builds vocabulary through word families and phoneme manipulation. Develops logical sequencing and problem-solving skills.

### Pedagogical Approach
Discovery-based learning through experimentation. Children try letter substitutions and see immediate feedback on whether a valid word is formed. Encourages vocabulary recall and pattern recognition.

### Difficulty Progression
| Level | Word Length | Steps Required | Complexity |
|-------|-------------|----------------|------------|
| 1 | 3 letters | 2-3 steps | CVC words (cat → bat → bag) |
| 2 | 3 letters | 3-4 steps | Short vowel families |
| 3 | 4 letters | 3-4 steps | Simple CVCC/CCVC |
| 4 | 4 letters | 4-5 steps | Blends and digraphs |
| 5 | 5 letters | 4-6 steps | Longer vocabulary |

### Accessibility
- Large letter tiles for easy grasping
- Audio pronunciation of words on completion
- Visual highlighting of changed letters
- Unlimited hints for struggling players
- No time pressure

### Engagement
- Satisfying "click" when valid word formed
- Ladder animation showing progress climbing
- Celebration when target reached
- Star rating based on efficiency (steps used vs. optimal)

### Core Loop
1. View START word and TARGET word
2. Identify which letter to change
3. Drag new letter to substitution slot
4. Submit to validate
5. If valid: advance to next rung
6. If invalid: gentle feedback, try again
7. Continue until TARGET reached
8. Earn stars based on efficiency

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

---

## 6. Recommended Canonical Version

Since no implementation exists, this section defines the target design:

### Core Features to Implement
1. **Word Ladder Engine:** Path-finding between words
2. **Dictionary Service:** Age-appropriate word validation
3. **Visual Ladder:** Animated rung progression
4. **Drag-and-Drop:** Hand-tracked letter manipulation
5. **Hint System:** Smart suggestions for next word
6. **Star Rating:** Efficiency-based scoring

### Technical Architecture
- Pure TypeScript logic layer (wordLadderLogic.ts)
- React component with canvas or DOM-based rendering
- useGameHandTracking for gesture control
- Word graph pre-computed for performance

### Content Requirements
- Curated word pairs at 5 difficulty levels
- Minimum 20 puzzles per level (100 total)
- Word families organized by phonics patterns

---

## 7. Visual Identity

- **Overall look:** Whimsical ladder climbing upward through clouds
- **Camera view:** Static full-screen game area
- **Art style:** Friendly, rounded shapes with warm colors
- **Mood:** Encouraging puzzle-solving atmosphere
- **Colors:**
  - Ladder rungs: Warm wood tones (#D4A574, #8B6914)
  - Active word highlight: Sky blue (#0EA5E9)
  - Valid word glow: Emerald (#10B981)
  - Invalid shake: Rose (#F43F5E)
  - Background: Soft sky gradient
- **Environment:** Floating ladder in friendly sky setting
- **UI style:** Rounded cards with soft shadows
- **Active vibe:** Gentle, contemplative puzzle play

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start** | Intro and difficulty select | Title, emoji (🪜), instructions, level buttons |
| **Tutorial** | First-time guidance | Animated demo of letter substitution |
| **Playing** | Main puzzle view | Start word, target word, current word, letter bank |
| **Dragging** | Letter selection | Cursor holding letter, drop zones highlighted |
| **Validating** | Word submission | Loading spinner, validation check |
| **Success** | Word accepted | Rung animation, word added to ladder |
| **Complete** | Puzzle finished | Star rating, celebration, next puzzle button |
| **Stuck** | Player struggling | Hint button pulse, suggestion overlay |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Position cursor | Hand movement | Cursor follows index finger |
| Grab letter | Pinch gesture | Letter scales up, attaches to cursor |
| Drag letter | Move while pinching | Letter follows cursor with trail |
| Hover slot | Move over drop zone | Slot highlights with glow |
| Drop letter | Release pinch | Letter snaps into slot |
| Submit word | Tap submit button | Button press animation |
| Request hint | Tap hint button | Hint word revealed with sparkle |
| Skip puzzle | Tap skip (penalty) | Confirmation dialog |

### CV-Specific Interactions
- Cursor: Index finger tip with pinch indicator
- Pinch threshold: 0.15 (for precise letter grabbing)
- Drag smoothing: OneEuro filter enabled
- Drop zones: Expanded hit targets (1.5x visual size)

---

## 10. Core Mechanics

### Word Ladder Algorithm
```typescript
interface WordLadderPuzzle {
  id: string;
  startWord: string;
  targetWord: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  optimalSteps: number;
  hints: string[]; // Valid intermediate words
}

// Word graph for validation
const WORD_GRAPH: Map<string, string[]> = {
  // Pre-computed adjacent words (differ by one letter)
  'cat': ['bat', 'rat', 'hat', 'cut', 'car', 'can'],
  'bat': ['cat', 'rat', 'hat', 'bad', 'bag', 'bet'],
  // ... etc
};

function isValidStep(currentWord: string, newWord: string): boolean {
  // Must differ by exactly one letter
  if (currentWord.length !== newWord.length) return false;
  let diffCount = 0;
  for (let i = 0; i < currentWord.length; i++) {
    if (currentWord[i] !== newWord[i]) diffCount++;
  }
  return diffCount === 1 && isValidDictionaryWord(newWord);
}

function findShortestPath(start: string, target: string): string[] | null {
  // BFS to find optimal path
  // Returns array of words including start and target
}
```

### Puzzle Generation
```typescript
function generatePuzzle(difficulty: number): WordLadderPuzzle {
  // Select word length based on difficulty
  const length = difficulty <= 2 ? 3 : difficulty <= 4 ? 4 : 5;
  
  // Find valid word pairs with path
  const startWord = selectRandomWord(length);
  const targetWord = selectTargetWithPath(startWord, difficulty);
  
  return {
    id: generateId(),
    startWord,
    targetWord,
    difficulty,
    optimalSteps: calculateOptimalSteps(startWord, targetWord),
    hints: generateHints(startWord, targetWord)
  };
}
```

### Scoring Formula
```typescript
function calculateStars(stepsUsed: number, optimalSteps: number): number {
  const efficiency = stepsUsed / optimalSteps;
  if (efficiency <= 1.0) return 3; // Perfect
  if (efficiency <= 1.3) return 2; // Good
  return 1; // Completed
}

function calculateScore(stars: number, hintsUsed: number): number {
  const baseScore = stars * 50;
  const hintPenalty = hintsUsed * 10;
  return Math.max(baseScore - hintPenalty, 10);
}
```

---

## 11. Rules

### Start
- Select difficulty level or "Adventure" mode (progressive)
- First puzzle generates with start and target word displayed
- Tutorial overlay for first-time players

### Allowed Actions
- Drag any letter from alphabet bank to any position
- Submit current word for validation
- Request hint (limited per puzzle)
- Undo last step
- Skip puzzle (with score penalty)

### Restricted Actions
- Cannot submit same word twice
- Cannot submit non-dictionary words
- Cannot change more than one letter at a time
- Cannot use hints in "Expert" challenge mode

### Scoring
- Base: 50 points per star earned
- Perfect bonus: +25 points (optimal path found)
- Hint penalty: -10 points per hint used
- Skip penalty: -30 points

### Error Handling
- Invalid word: Gentle shake animation + "That's not a valid word"
- Multiple letter changes: "Only change one letter at a time"
- Repeated word: "You already tried that word"
- Stuck detection: Auto-offer hint after 3 failed attempts

### Win/Lose Conditions
- **Win:** Reach target word through valid steps
- **Abandon:** Skip or exit (partial credit awarded)
- **Perfect:** Reach target in optimal steps, no hints

---

## 12. HUD / Gameplay UI

### Top Bar
```
┌─────────────────────────────────────────────────────┐
│  🏠  Word Ladder  Level 3     ⭐ 150    ❤️ ❤️ ❤️    │
└─────────────────────────────────────────────────────┘
```

### Main Game Area
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              ☁️  TARGET: BAG  ☁️                    │
│                                                     │
│  ╔═══════════════════════════════════════════════╗  │
│  ║  BAG  ← Current word (on rung 3)              ║  │
│  ╠═══════════════════════════════════════════════╣  │
│  ║  BAT  ← Previous step                         ║  │
│  ╠═══════════════════════════════════════════════╣  │
│  ║  CAT  ← Start word (on rung 1)                ║  │
│  ╚═══════════════════════════════════════════════╝  │
│                                                     │
│   Change one letter to reach the target!           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Letter Bank (Bottom)
```
┌─────────────────────────────────────────────────────┐
│  A  B  C  D  E  F  G  H  I  J  K  L  M              │
│  N  O  P  Q  R  S  T  U  V  W  X  Y  Z              │
│                                                     │
│       [💡 Hint]  [✓ Submit]  [↩️ Undo]              │
└─────────────────────────────────────────────────────┘
```

### Completion Overlay
```
┌─────────────────────────────────────────┐
│                                         │
│     ⭐ ⭐ ⭐                            │
│                                         │
│    Great climbing!                      │
│    3 steps used (optimal: 3)            │
│                                         │
│    [Next Puzzle]  [Back to Menu]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success Feedback
- **Valid word created:**
  - Pleasant chime sound
  - Word glows emerald green
  - Ladder rung animates upward
  - New rung appears with satisfying "click"
- **Target reached:**
  - Celebration sound
  - Confetti animation
  - Stars fill in with sparkle
  - Target word flashes gold
- **Perfect solution:**
  - Special "Perfect!" announcement
  - Golden ladder animation
  - Bonus points popup

### Failure/Caution Feedback
- **Invalid word:**
  - Gentle buzz sound
  - Word shakes horizontally
  - Soft red glow
  - "Try a different word" message
- **Multiple letter changes:**
  - Warning sound
  - Highlight changed positions
  - "Change just one letter" reminder
- **Already used word:**
  - Neutral tone
  - Show previous occurrence
  - "You already climbed this word"

### Audio
| Event | Sound | Source |
|-------|-------|--------|
| Letter grab | pop | useAudio.playPop |
| Letter drop | click | useAudio.playClick |
| Valid word | success | useAudio.playSuccess |
| Invalid word | error | useAudio.playError |
| Target reached | celebration | useAudio.playCelebration |
| Star earned | sparkle | useAudio.playSuccess |

### Responsiveness
- Letter grab: <50ms feedback
- Drag: 60fps smooth following
- Drop: Immediate snap or return
- Validation: <200ms response
- Ladder animation: 500ms per rung

---

## 14. Points / Rewards / Progression

### Points System
| Component | Value |
|-----------|-------|
| 3-star completion | 150 points |
| 2-star completion | 100 points |
| 1-star completion | 50 points |
| Perfect bonus | +25 points |
| Hint penalty | -10 points per hint |
| Skip penalty | -30 points |

### Recommended Drops (Registry)
```typescript
drops: [
  { itemId: 'letter-a', chance: 0.15 },
  { itemId: 'book-blue', chance: 0.12 },
  { itemId: 'creature-owl', chance: 0.08, minScore: 100 },
  { itemId: 'trophy-silver', chance: 0.05, minScore: 150 },
  { itemId: 'artifact-word-master', chance: 0.02, minScore: 200 },
]
```

### Recommended Easter Eggs
```typescript
easterEggs: [
  {
    id: 'egg-first-rung',
    name: 'First Step',
    description: 'Complete your first word ladder',
    trigger: 'first-puzzle-complete',
    reward: { itemId: 'letter-a', quantity: 1 },
    hint: 'Change one letter at a time!',
    difficulty: 'easy',
  },
  {
    id: 'egg-perfect-climber',
    name: 'Perfect Climber',
    description: 'Complete 5 puzzles in optimal steps',
    trigger: 'five-perfect-solutions',
    reward: { itemId: 'trophy-silver', quantity: 1 },
    hint: 'Find the shortest path!',
    difficulty: 'medium',
  },
  {
    id: 'egg-vocabulary-master',
    name: 'Vocabulary Master',
    description: 'Complete all difficulty levels',
    trigger: 'all-levels-complete',
    reward: { itemId: 'creature-owl', quantity: 1 },
    hint: 'Master every challenge!',
    difficulty: 'hard',
  },
]
```

### Progression
- **Level unlock:** Complete 3 puzzles in current level
- **Adventure mode:** Progressive difficulty
- **Challenge mode:** Timed puzzles, no hints
- **Mastery tracking:** Stars collected per level

---

## 15. End States

### Puzzle Complete (Success)
1. Target word validated
2. Celebration sound plays
3. Confetti animation (3-star) or sparkle (1-2 star)
4. Stars fill based on efficiency
5. Score calculated and displayed
6. Drops rolled and awarded
7. Easter egg checks triggered
8. "Next Puzzle" and "Menu" buttons appear

### Abandoned (Early Exit)
1. Current progress saved
2. Partial score awarded (50% of current)
3. Return to level select
4. Can resume from saved puzzle

### Session Complete (5 Puzzles)
1. Total session score calculated
2. Average stars displayed
3. New high score celebration (if applicable)
4. Drops summary shown
5. Return to main menu after 3 seconds

### Stuck State (Help Offered)
1. After 3 failed attempts
2. Hint button pulses
3. "Need a hint?" gentle suggestion
4. Option to reveal next word

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Standard (Primary)
- Drag and drop letters
- Hand tracking with pinch gestures
- Full visual feedback

### Mode B: Touch/Mouse (Fallback)
- Click to select letter
- Click to place in position
- No pinch required

### Mode C: Voice Assisted (Accessibility)
- Speak letter to place
- "Put A in position 2"
- Audio confirmation

### Mode D: Timed Challenge (Expert)
- 60 seconds per puzzle
- No hints available
- Bonus for speed

### Mode E: Two-Player Race
- Split screen
- Same start/target
- Race to find path first

---

## 17. Improvement Opportunities

### Phase 1: MVP (Required for Launch)
- [ ] Core word ladder logic
- [ ] 20 puzzles at each difficulty
- [ ] Basic drag-and-drop with hand tracking
- [ ] Star scoring system
- [ ] Sound effects integration

### Phase 2: Polish (Post-Launch)
- [ ] Expand to 100+ puzzles
- [ ] Animated ladder visualization
- [ ] Hint system implementation
- [ ] Progress persistence
- [ ] Difficulty auto-adjustment

### Phase 3: Enhancement (Future)
- [ ] Daily challenge puzzles
- [ ] Player-created puzzles
- [ ] Multiplayer race mode
- [ ] Themed puzzle packs (animals, food, etc.)
- [ ] Achievement system expansion

---

## 18. Content Model

### Puzzle Structure
```typescript
interface WordLadderPuzzle {
  id: string;
  startWord: string;
  targetWord: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category?: 'animals' | 'food' | 'nature' | 'actions';
  hints: string[];
  optimalPath: string[];
}
```

### Sample Content (Level 1 - 3 letter CVC)
| ID | Start | Target | Optimal Path | Category |
|----|-------|--------|--------------|----------|
| cat-bag | CAT | BAG | CAT→BAT→BAG | animals |
| dog-dig | DOG | DIG | DOG→DIG | actions |
| hat-hot | HAT | HOT | HAT→HOT | objects |
| sun-run | SUN | RUN | SUN→BUN→RUN | nature |
| big-bag | BIG | BAG | BIG→BAG | objects |

### Sample Content (Level 3 - 4 letter)
| ID | Start | Target | Optimal Path | Category |
|----|-------|--------|--------------|----------|
| park-dark | PARK | DARK | PARK→DARK | nature |
| hand-sand | HAND | SAND | HAND→SAND | body |
| fish-dish | FISH | DISH | FISH→DISH | food |

### Target Content Volume
| Difficulty | Puzzles | Word Length | Steps |
|------------|---------|-------------|-------|
| Level 1 | 20 | 3 | 2-3 |
| Level 2 | 20 | 3 | 3-4 |
| Level 3 | 20 | 4 | 3-4 |
| Level 4 | 20 | 4 | 4-5 |
| Level 5 | 20 | 5 | 4-6 |

---

## 19. Technical Structure

### File Organization
```
src/frontend/src/
├── pages/
│   └── WordLadder.tsx          # Main component (~400 lines)
├── games/
│   ├── wordLadderLogic.ts      # Game logic (~200 lines)
│   ├── wordLadderLogic.test.ts # Unit tests
│   └── wordGraph.ts            # Pre-computed word graph
└── data/
    └── wordLadderPuzzles.ts    # Puzzle content
```

### Key Components
```typescript
// WordLadder.tsx
function WordLadderGame() {
  // State
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [currentWord, setCurrentWord] = useState('');
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [draggedLetter, setDraggedLetter] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  
  // Hand tracking
  const { cursor, isPinching } = useGameHandTracking({
    gameName: 'WordLadder',
    onFrame: handleFrame,
  });
  
  // Render ladder, word slots, letter bank
}
```

### Key Dependencies
- `useGameHandTracking`: CV cursor and pinch detection
- `useAudio`: Sound effects
- `useGameCompletion`: Progress recording
- `framer-motion`: Animations
- `wordGraph`: Pre-computed valid word transitions

### State Management
```
PuzzleState: {
  puzzle: WordLadderPuzzle
  currentWord: string
  history: string[]
  hintsUsed: number
  attempts: number
  status: 'playing' | 'complete' | 'abandoned'
}
```

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Word list source | Need age-appropriate curated list | High |
| Word graph size | Estimated 500-1000 words for coverage | Medium |
| Optimal path algorithm | BFS with pre-computation | High |
| Drag physics | Spring-based with snapping | Medium |
| Hint algorithm | Show one valid next step | High |
| Performance | Word validation must be O(1) | High |

---

## 21. Implementation Notes

### Architecture Patterns
1. **Logic separation:** Pure functions in wordLadderLogic.ts
2. **Graph pre-computation:** Build word adjacency at build time
3. **Immutable state:** New array for word history each step
4. **Optimistic UI:** Show letter placement before validation

### Testing Considerations
- Word graph coverage tests
- Path-finding algorithm correctness
- Hand tracking drag interactions
- Edge cases (no valid path, dead ends)

### Performance Notes
- Pre-compute word graph to avoid runtime calculations
- Use Set for O(1) word validation
- Debounce drag updates to 60fps
- Lazy load puzzle content by difficulty

### Accessibility
- High contrast mode support
- Audio descriptions for words
- Large touch targets (min 64px)
- Keyboard navigation support

---

## 22. Acceptance Criteria

### Core Functionality
- [ ] Start screen with difficulty selection
- [ ] Puzzle generates with start/target words
- [ ] Letter drag-and-drop works with hand tracking
- [ ] Word validation checks dictionary
- [ ] One-letter change rule enforced
- [ ] Ladder visualizes progress
- [ ] Star rating calculated correctly
- [ ] Session completion tracked

### Content
- [ ] 20 puzzles per difficulty level
- [ ] Words are age-appropriate
- [ ] Puzzles have valid solutions
- [ ] Optimal paths pre-calculated

### CV/Input
- [ ] Hand tracking cursor visible
- [ ] Pinch grabs letters
- [ ] Release drops letters
- [ ] Mouse fallback works
- [ ] Touch devices supported

### UX/Polish
- [ ] Sound effects on all actions
- [ ] Animations smooth (60fps)
- [ ] Feedback clear and immediate
- [ ] Celebration on completion

### Edge Cases
- [ ] Invalid word handling
- [ ] Same word re-entry prevented
- [ ] Stuck detection works
- [ ] Hint system functional

---

## 23. Test Plan

### Manual Gameplay Tests

#### Basic Flow
- [ ] Start game, select difficulty
- [ ] Complete puzzle with valid steps
- [ ] Verify star rating
- [ ] Complete 5-puzzle session
- [ ] Verify score calculation

#### Word Validation
- [ ] Try invalid word, verify rejection
- [ ] Try changing two letters, verify error
- [ ] Try reusing word, verify prevention
- [ ] Test optimal path detection

#### Drag and Drop
- [ ] Grab letter with pinch
- [ ] Drag letter to position
- [ ] Release to drop
- [ ] Invalid drop returns letter

#### Hints and Help
- [ ] Request hint, verify suggestion
- [ ] Stuck detection after failures
- [ ] Hint penalty applied correctly

### CV Control Tests
- [ ] Hand tracking initializes
- [ ] Cursor follows finger
- [ ] Pinch detection reliable
- [ ] Drag smoothing works

### Fallback Tests
- [ ] Mouse click selects
- [ ] Mouse drag works
- [ ] Touch tap works
- [ ] Keyboard navigation works

### Edge Cases
- [ ] Rapid drag attempts
- [ ] Hand loss during drag
- [ ] Browser back button
- [ ] Resume saved progress

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Comprehensive design specification for new game implementation
