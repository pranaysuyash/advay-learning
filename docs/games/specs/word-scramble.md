# Word Scramble

**Game ID:** word-scramble  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts` (to be added)  
**Code:** `src/frontend/src/pages/WordScramble.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/wordScrambleLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** An interactive word unscrambling game where kids rearrange scrambled letters by dragging them into the correct order to spell words, using hand tracking for intuitive drag-and-drop
- **Genre:** Educational / Puzzle / Spelling
- **Target audience:** Ages 5-8, emerging readers and spellers
- **Core player fantasy:** "I'm a word detective solving letter puzzles!" - combining problem-solving with the satisfaction of building words
- **Primary skill tested:** Spelling, letter sequencing, phonics, word recognition, fine motor control
- **Session length:** 4-6 minutes (5-8 words per game)
- **Platform context:** Hand tracking CV game emphasizing precise dragging, positioning, and letter manipulation in 2D space

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Similar pattern available in `WordBuilder.tsx` for letter manipulation
  - Drag-and-drop infrastructure from other games
  - Hand tracking via `useGameHandTracking`
  - TTS system for word pronunciation
- **What is partial/missing:**
  - Main game component `WordScramble.tsx`
  - Game logic module `wordScrambleLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Word bank with difficulty tiers
  - Visual effects for letter placement
- **Evidence:**
  - No file exists at `src/frontend/src/pages/WordScramble.tsx`
  - No file exists at `src/frontend/src/games/wordScrambleLogic.ts`
  - Registry entry needed in `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (Easy: 3-letter words, Medium: 4-5 letters, Hard: 6+ letters)
2. **Game Start:** Voice introduces the scrambled word
3. **Gameplay Loop:**
   - Target word shown as picture (e.g., cat image)
   - Scrambled letters appear scattered at bottom
   - Empty slots shown for correct answer
   - Player drags letters to slots using hand
   - Letters snap into place when near correct slot
   - Word validates when all slots filled
4. **Feedback:** Immediate letter-by-letter feedback
5. **Progression:** Next word loads with brief celebration
6. **Completion:** Score summary with accuracy and speed bonuses

### Controls
- **Hand drag:** Move hand to letter, pinch to grab, drag to slot
- **Hand tracking:** Index finger position for cursor
- **Pinch gesture:** Hold pinch to carry letter, release to drop
- **Snap assist:** Letters auto-align when near correct slot
- **Touch/mouse:** Click-drag or tap slot to place (fallback)
- **CV primary:** Full hand tracking with drag-and-drop

### Mechanics
- **Scramble generation:** Word letters randomized with guaranteed non-trivial scramble
- **Drag physics:** Letter follows hand with slight lag for weight feel
- **Snap detection:** Letter snaps when within 50px of valid slot
- **Validation:** Real-time or submit-button based (configurable)
- **Hint system:** First letter hint available (small point cost)
- **Undo:** Can remove placed letters to retry

### Visuals/UI
- **Background:** Clean workspace theme (wooden desk, paper texture)
- **Letter tiles:** 3D-styled square tiles with rounded corners
- **Answer slots:** Dashed outline boxes showing letter positions
- **Picture clue:** Large image representing the target word
- **Word audio:** Speaker button to hear word pronunciation
- **Progress bar:** Visual indicator of words completed

### Gaps/Issues
- No implementation exists to analyze
- Drag physics need tuning for satisfying feel
- Snap assist strength needs balancing (helpful but not auto-play)
- Consider keyboard accessibility for diverse learners

---

## 4. Intended Design

### Educational Goal
Develop spelling skills and letter sequencing through active puzzle-solving. The physical act of arranging letters reinforces word structure memory.

### Pedagogical Approach
- **Constructivist learning:** Build words from components
- **Multisensory engagement:** Visual (letters), auditory (TTS), kinesthetic (dragging)
- **Scaffolded difficulty:** Start with CVC words, progress to complex phonics
- **Error-friendly:** Wrong arrangements can be easily corrected
- **Meaning connection:** Picture clues link spelling to vocabulary

### Difficulty Progression
| Level | Word Length | Word Types | Examples |
|-------|-------------|------------|----------|
| Easy | 3 letters | CVC words | cat, dog, sun, hat |
| Medium | 4-5 letters | Simple blends | fish, jump, clock, train |
| Hard | 6+ letters | Complex words | rocket, flower, rainbow, elephant |
| Expert | 8+ letters | Challenge words | butterfly, helicopter, adventure |

### Accessibility
- **Visual:** Large letter tiles, high contrast, clear picture clues
- **Auditory:** Word pronunciation on demand, clear feedback sounds
- **Motor:** Generous snap radius, can tap slot instead of drag
- **Cognitive:** Hints available, no time pressure, retry unlimited

### Engagement
- **Building satisfaction:** Letters snap satisfyingly into place
- **Progress visibility:** Fill a word journal as you complete words
- **Mastery tracking:** Words get "stamped" when mastered
- **Discovery element:** Unlock new word categories as you progress

### Core Loop
1. View picture clue and hear word
2. Study scrambled letters
3. Plan letter arrangement
4. Drag first letter to correct slot
5. Continue placing letters
6. Complete word and receive validation
7. Hear word spelled out and pronounced
8. Celebrate and progress to next word

---

## 5. Drift Analysis

### Where Implementation Matches Intent
📝 N/A - Game not yet implemented

### Where Implementation Exceeds Intent
📝 N/A - Game not yet implemented

### Where Implementation Falls Short
📝 N/A - Game not yet implemented

### Overall Assessment
**Alignment: 0%** - Game is in specification phase, no implementation exists

**Target Implementation Score: 90%+**
- Responsive drag-and-drop
- Satisfying snap mechanics
- Clear visual feedback
- Smooth hand tracking integration
- Robust word validation

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Four difficulty tiers:**
   - Easy: 3-letter CVC words (cat, dog, sun)
   - Medium: 4-5 letter words (fish, train, plant)
   - Hard: 6+ letter words (rocket, flower, garden)
   - Expert: Complex words (butterfly, dinosaur)

2. **Hand tracking drag-and-drop:**
   - Pinch to grab letter
   - Drag to position
   - Release to drop
   - Visual line showing drag path

3. **Snap-to-slot system:**
   - 50px snap radius
   - Visual preview (ghost letter) when near slot
   - Satisfying snap animation

4. **Word bank by category:**
   - Animals (cat, dog, elephant)
   - Nature (sun, tree, flower)
   - Food (apple, cake, pizza)
   - Objects (book, car, rocket)

5. **Scoring system:**
   - Base: 100 points per word
   - Speed bonus: Up to 50 points
   - No-hint bonus: +25 points
   - Streak multiplier: 1.5x at 3+ words

### Enhancements for Future Versions
1. **Sentence mode:** Unscramble words to form sentences
2. **Timed challenge:** Beat the clock mode
3. **Multiplayer:** Race to unscramble same word
4. **Custom word lists:** Parent/teacher added words
5. **Spelling patterns:** Focus on specific phonics rules

### Experimental Features
- **AR mode:** Letters float on real desk surface
- **Voice input:** Say letter name to auto-place
- **Cooperative:** Two players place alternating letters
- **Story mode:** Unscramble words to progress story

---

## 7. Visual Identity

- **Overall look:** Clean, organized workspace like a child's desk
- **Camera view:** Full screen with centered play area
- **Art style:** 3D letter tiles on paper-textured background
- **Mood:** Focused, satisfying, educational
- **Colors:**
  - Background: Warm cream paper (#FAF8F3)
  - Letter tiles: Light wood with dark letters (#DEB887, #3E2723)
  - Slots: Dashed gray outlines (#9E9E9E)
  - Success: Soft green glow (#4CAF50)
  - Accent: Sky blue for UI elements (#64B5F6)
- **Environment:** Clean desk with subtle texture, organized workspace feel
- **UI style:** Rounded, friendly, with tactile 3D appearance
- **Active vibe:** "Build the word!" 🔤

### Letter Tile Design
```
┌─────────────────┐
│  ┌───────────┐  │
│  │     A     │  │  ← 3D wood tile effect
│  │           │  │  ← Slight bevel/shadow
│  └───────────┘  │
│   Drop shadow   │
└─────────────────┘
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Easy/Medium/Hard/Expert buttons, category select |
| **Tutorial** | Learn drag controls | Animated hand demo, practice drag |
| **Gameplay** | Core experience | Picture clue, letter tiles, answer slots, progress |
| **Word Complete** | Success feedback | Celebration, word spelled out, points earned |
| **Hint Activation** | Show first letter | First letter placed, hint cost displayed |
| **Level Complete** | Progress milestone | Stats, words mastered, next level button |
| **Game Complete** | Final celebration | Total score, accuracy, words completed, rewards |
| **Word Journal** | View mastered words | Collection of completed words with pictures |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows hand |
| Grab letter | Pinch (index + thumb) | Letter lifts with shadow, scales up |
| Drag letter | Move hand while pinching | Letter follows with smooth lag |
| Release letter | Release pinch | Letter drops, snaps if near slot |
| Tap slot (fallback) | Click/tap empty slot | Letter auto-moves to slot |
| Tap placed letter | Click/tap in slot | Letter returns to pool |
| Hear word | Click speaker button | TTS pronounces word |
| Request hint | Click hint button | First letter revealed |
| Submit word | All slots filled | Auto-validation or submit button |

### CV Control Details
- **Hand tracking:** Index finger tip position
- **Pinch threshold:** < 0.05 normalized distance between finger and thumb
- **Grab detection:** Raycast from finger to letter collider
- **Drag smoothing:** Lerp factor 0.3 for weighty feel
- **Snap radius:** 50px from slot center
- **Ghost preview:** 30% opacity letter appears in slot when dragging near

---

## 10. Core Mechanics

### Scramble Algorithm
```typescript
// Ensure non-trivial scramble (not same as original or reverse)
function scrambleWord(word: string): string[] {
  const letters = word.split('');
  let scrambled;
  
  do {
    scrambled = shuffleArray([...letters]);
  } while (
    scrambled.join('') === word ||
    scrambled.join('') === letters.reverse().join('')
  );
  
  return scrambled;
}

// Shuffle with Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
```

### Drag Physics
```typescript
// Letter follows hand with smoothing
function updateLetterPosition(
  letter: LetterTile,
  handPos: Vector2,
  isDragging: boolean
): void {
  if (isDragging) {
    // Smooth follow for weighty feel
    letter.x = lerp(letter.x, handPos.x, 0.3);
    letter.y = lerp(letter.y, handPos.y, 0.3);
    letter.rotation = (handPos.x - letter.x) * 2; // Slight tilt
  }
}

// Snap detection
function checkSnap(letter: LetterTile, slots: Slot[]): Slot | null {
  for (const slot of slots) {
    const distance = getDistance(letter, slot);
    if (distance < SNAP_RADIUS && slot.isEmpty) {
      return slot;
    }
  }
  return null;
}
```

### Validation Logic
```typescript
// Check if placed letters form correct word
function validateWord(slots: Slot[], targetWord: string): boolean {
  const formedWord = slots
    .sort((a, b) => a.position - b.position)
    .map(slot => slot.letter?.char || '')
    .join('');
  
  return formedWord === targetWord;
}

// Real-time feedback (optional)
function getLetterAccuracy(slots: Slot[], targetWord: string): boolean[] {
  return slots.map((slot, index) => {
    return slot.letter?.char === targetWord[index];
  });
}
```

### Scoring Formula
```
Base Points: 100 per word
Speed Bonus: max(0, 50 - timeTakenSeconds)
No-Hint Bonus: +25 if no hint used
Streak Bonus: multiplier
  - 1-2 words: 1.0x
  - 3-5 words: 1.5x
  - 6+ words: 2.0x

Total = (Base + Speed + NoHint) × StreakMultiplier
```

### Hint System
- **First letter reveal:** Places first letter in correct slot
- **Cost:** -25 points from word score (can't go below 0)
- **Availability:** Unlimited, but affects final score
- **Visual:** Button deactivates when hint used for current word

---

## 11. Rules

- **Start:** Select difficulty and category, click Start
- **Objective:** Unscramble letters to spell the target word
- **Allowed:**
  - Drag letters in any order
  - Remove placed letters to retry
  - Use hint (with point cost)
  - Request word pronunciation anytime
  - Touch/mouse fallback
- **Restricted:**
  - Cannot place two letters in one slot
  - Cannot skip words (must solve to progress)
  - Time does not penalize, but affects bonus
- **Scoring:** Based on speed + hint usage + streak
- **Wrong word:** Letters shake, can rearrange and retry
- **Win condition:** Complete all words in the level

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Picture Clue | Show what word to spell | Each new word |
| Word Speaker | Play word pronunciation | On tap/click |
| Answer Slots | Drop targets for letters | Real-time |
| Letter Pool | Scrambled letters available | Each new word |
| Progress | Words completed / total | After each word |
| Score | Current points | After each word |
| Streak | Consecutive correct words | On success |
| Hint Button | Reveal first letter | On tap (once per word) |
| Timer | Time spent (for bonus calc) | Continuous |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 850    Word: 3 of 8         │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────┐                 │
│         │  🐱     │  ← Picture clue │
│         │  (cat)  │                 │
│         └─────────┘                 │
│                                     │
│    ┌─────┐ ┌─────┐ ┌─────┐         │
│    │  _  │ │  _  │ │  _  │  ← Slots│
│    └─────┘ └─────┘ └─────┘         │
│                                     │
│         [🔊]  [? Hint]              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   ┌───┐  ┌───┐  ┌───┐              │
│   │ T │  │ A │  │ C │  ← Letter    │
│   └───┘  └───┘  └───┘     pool     │
│                                     │
│   (drag letters to slots)           │
│                                     │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Word Correct)
- Satisfying "click" as each letter snaps in
- Success fanfare on word completion
- Word spelled out: "C-A-T... Cat!"
- Green glow effect on all slots
- Letters animate together briefly (celebration)
- Points float up with "+175" animation
- Haptic pulse pattern (success rhythm)
- Progress to next word after 1.5s

### Letter Snap
- Audible "snap" sound when letter locks in
- Slot glows green momentarily
- Letter settles with small bounce
- Visual ripple effect from slot

### Failure (Wrong Arrangement)
- Gentle "error" tone (not harsh buzz)
- Letters in wrong positions shake
- Incorrect letters tint red briefly
- Voice: "Not quite, try rearranging!"
- Letters remain in place (can adjust)
- No streak penalty (keep trying)

### Dragging State
- Letter scales up 15% when grabbed
- Shadow deepens under letter
- Trail effect shows drag path
- Slot highlights when letter dragged near
- Ghost preview shows potential placement

### Streak Feedback
| Streak | Visual | Sound | Effect |
|--------|--------|-------|--------|
| 1-2 | - | Standard | - |
| 3-5 | Sparkle border | Rising scale | 1.5x multiplier |
| 6-9 | Gold glow | Fanfare | 2.0x multiplier |
| 10+ | Rainbow effect | Victory music | 2.0x + special badge |

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Word | 100 points |
| Speed Bonus | Up to 50 points (faster = more) |
| No-Hint Bonus | +25 points if solved without hint |
| Streak Multiplier | 1.0x → 1.5x → 2.0x |

### Example Score Calculation
```
Word 1 (hint used, 8s): 100 + 0 + 0 = 100 × 1.0 = 100
Word 2 (no hint, 5s): 100 + 20 + 25 = 145 × 1.0 = 145
Word 3 (no hint, 4s): 100 + 30 + 25 = 155 × 1.5 = 232
Word 4 (no hint, 6s): 100 + 15 + 25 = 140 × 1.5 = 210
Total: 687 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- Book item (20% chance)
- Letter sticker (15% chance)
- Star bookmark (10% chance)
- Wise owl companion (5% chance at 90%+ accuracy)

### Easter Eggs
- **Speed Speller:** Complete word in under 3 seconds
  - Reward: Lightning Bolt sticker
  - Hint: "How fast can you spell?"
- **Hintless Master:** Complete 10 words without hints
  - Reward: Magnifying Glass (master detective)
  - Hint: "Solve without help!"
- **Word Wizard:** Complete entire Expert level
  - Reward: Wizard Hat accessory
  - Hint: "Conquer the hardest words!"

### Progression
- Word journal fills with mastered words
- Categories unlock as you progress
- Difficulty increases within session
- Personal best tracking per category
- Mastery stars for hintless completions

---

## 15. End States

### Word Correct
- Letter-by-letter spelling announcement
- Success fanfare and haptics
- Score calculation with bonuses
- Streak increment
- Word added to journal
- 1.5s celebration, then next word

### Word Wrong
- Gentle error feedback
- Incorrect positions highlighted
- Voice encouragement to retry
- Can rearrange letters freely
- No penalty other than time

### Level Complete
- Level stats displayed
- Words mastered list shown
- Bonus points for completion
- Unlock notification (if applicable)
- Option to continue or review journal

### Game Complete
- Final score with breakdown
- Accuracy percentage
- Words completed count
- Rewards earned display
- Journal view option
- Play Again / Change Difficulty / Exit

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking Drag-and-Drop)
Full hand tracking with pinch-to-grab and drag mechanics as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click/tap letter, then click slot to place
- Direct slot tapping for placement
- No drag required
- Accessible for all devices

### Mode C: Typing Mode (Keyboard)
- Type letters in order using keyboard
- Good for older kids practicing spelling
- Hand tracking optional
- Faster pace possible

### Mode D: Cooperative Mode
- Two players take turns placing letters
- Communication required for strategy
- Alternating hand tracking
- Shared score

### Mode E: Race Mode
- Two players solve same word simultaneously
- First to complete wins the word
- Real-time progress indicators
- Best of 5 or 10 words

### Mode F: Story Mode
- Unscramble words to progress narrative
- Contextual clues from story
- Sequential word puzzles
- Chapter-based progression

---

## 17. Improvement Opportunities

### Low Cost
- Add more word categories (sports, vehicles, etc.)
- Letter placement sound variations
- Background music (calm, focus-oriented)
- Achievement badges for milestones
- Word pronunciation speed options

### Medium Effort
- Sentence unscramble mode
- Timed challenge leaderboard
- Custom word list creator
- Difficulty fine-tuning per word
- Hint variations (last letter, vowel highlight)

### Ambitious
- AI-generated word difficulty calibration
- Adaptive difficulty based on performance
- Multi-language support
- Integration with reading curriculum
- Parent/teacher dashboard
- Multiplayer online races

---

## 18. Content Model

### Word Data Structure
```typescript
interface WordData {
  word: string;              // "cat"
  category: string;          // "animals"
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  image: string;             // Asset path
  audio: string;             // Pronunciation path
  hints?: string[];          // Optional context hints
}

// Word bank by difficulty
const WORD_BANK: Record<string, WordData[]> = {
  easy: [
    { word: 'cat', category: 'animals', difficulty: 'easy', image: '/assets/words/cat.png', audio: '/audio/words/cat.mp3' },
    { word: 'dog', category: 'animals', difficulty: 'easy', image: '/assets/words/dog.png', audio: '/audio/words/dog.mp3' },
    { word: 'sun', category: 'nature', difficulty: 'easy', image: '/assets/words/sun.png', audio: '/audio/words/sun.mp3' },
    // ... more words
  ],
  medium: [
    { word: 'fish', category: 'animals', difficulty: 'medium', image: '/assets/words/fish.png', audio: '/audio/words/fish.mp3' },
    { word: 'tree', category: 'nature', difficulty: 'medium', image: '/assets/words/tree.png', audio: '/audio/words/tree.mp3' },
    // ... more words
  ],
  // ... hard, expert
};
```

### Category Structure
- Animals (cat, dog, bird, elephant, dinosaur)
- Nature (sun, tree, flower, rainbow, ocean)
- Food (apple, cake, pizza, banana, sandwich)
- Objects (book, car, house, rocket, computer)
- People (baby, friend, doctor, teacher)

### Level Configuration
```typescript
interface LevelConfig {
  difficulty: string;
  wordCount: number;
  categories: string[];
  hintAllowed: boolean;
  timeBonus: boolean;
}

const LEVELS: LevelConfig[] = [
  { difficulty: 'easy', wordCount: 5, categories: ['animals', 'nature'], hintAllowed: true, timeBonus: true },
  { difficulty: 'medium', wordCount: 7, categories: ['animals', 'nature', 'food'], hintAllowed: true, timeBonus: true },
  { difficulty: 'hard', wordCount: 10, categories: ['all'], hintAllowed: true, timeBonus: true },
  { difficulty: 'expert', wordCount: 15, categories: ['all'], hintAllowed: false, timeBonus: true },
];
```

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `WordScramble.tsx` | Main React component | 400-450 |
| `wordScrambleLogic.ts` | Pure game logic functions | 350-400 |
| `wordScramble.types.ts` | TypeScript interfaces | 75-100 |
| `wordBank.ts` | Word data and categories | 200-300 |

### Key Components in WordScramble.tsx
- `WordScrambleContent` - Core game implementation
- `WordScramble` (default) - GameShell wrapper
- `LetterTile` - Draggable letter component
- `AnswerSlot` - Drop target for letters
- `PictureClue` - Word image display
- `WordJournal` - Completed words collection view
- `HandCursor` - Custom cursor with grab states

### Logic Functions (wordScrambleLogic.ts)
| Function | Purpose |
|----------|---------|
| `scrambleWord()` | Generate non-trivial letter scramble |
| `createLetterTiles()` | Initialize letter pool |
| `updateLetterDrag()` | Handle drag physics |
| `checkSlotSnap()` | Detect snap-to-slot |
| `validateWord()` | Check if word is correct |
| `calculateScore()` | Compute word score |
| `getNextWord()` | Select word from bank |
| `shuffleArray()` | Fisher-Yates shuffle |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Word pronunciation

### State Management
```typescript
interface GameState {
  currentWord: WordData;
  scrambledLetters: LetterTile[];
  answerSlots: Slot[];
  placedLetters: Map<number, LetterTile>; // slotIndex -> letter
  score: number;
  streak: number;
  wordsCompleted: number;
  hintUsed: boolean;
  gameStatus: 'menu' | 'playing' | 'paused' | 'complete';
  handPosition: { x: number; y: number };
  isPinching: boolean;
  draggedLetter: LetterTile | null;
  dragOffset: { x: number; y: number };
}
```

### Dependencies
- MediaPipe hand tracking
- Framer Motion for animations
- Canvas or DOM for letter rendering

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Optimal drag smoothing | 0.3 lerp factor | Medium |
| Snap radius size | 50px based on tile size | Medium |
| Word bank size needed | 50+ words per difficulty | High |
| Hint penalty balance | -25 points feels fair | Medium |
| Letter tile size | 80px for visibility | High |
| Voice feedback timing | After each letter + full word | Medium |
| Accessibility for motor disabilities | Tap-to-place fallback | High |
| Keyboard support | Optional typing mode | Medium |

---

## 21. Implementation Notes

### Strengths to Build On
- WordBuilder provides letter manipulation patterns
- Hand tracking drag infrastructure exists
- TTS provides excellent word reinforcement
- Educational games have forgiving design patterns

### Architecture Patterns
- Separate drag physics from rendering
- Use refs for drag position (avoid React state during drag)
- Debounce snap detection
- Animate layout changes with Framer Motion

### Testing Considerations
- Test drag feel with various hand sizes
- Verify snap detection at screen edges
- Test word bank randomization (no repeats)
- Validate with target age group for difficulty

### Performance Notes
- Limit animated elements during drag
- Optimize hit detection
- Lazy load word images
- Preload audio for upcoming words

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes with cursor visible
- [ ] Pinch gesture grabs letters accurately
- [ ] Letters drag smoothly with hand movement
- [ ] Snap-to-slot works within 50px radius
- [ ] Ghost preview shows when near slot
- [ ] Word validation checks correctly
- [ ] Four difficulty levels work
- [ ] Word bank provides appropriate words
- [ ] Picture clues display correctly
- [ ] TTS pronounces words on demand
- [ ] Hint system reveals first letter
- [ ] Score calculates with all bonuses
- [ ] Streak multiplier applies correctly
- [ ] Touch/mouse fallback works
- [ ] Word journal tracks completed words
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, complete all words
- [ ] Play medium mode, verify longer words
- [ ] Play hard mode, verify complex words appear
- [ ] Get word wrong, verify retry works
- [ ] Use hint, verify point deduction
- [ ] Build 5+ streak, verify multiplier
- [ ] Complete level, verify progress tracking
- [ ] Complete game, verify final score

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Pinch grabs letter consistently
- [ ] Drag follows hand smoothly
- [ ] Snap activates at correct distance
- [ ] Release places letter accurately
- [ ] No hand = safe state

### Fallback Tests
- [ ] Tap slot places letter
- [ ] Click letter then slot works
- [ ] Touch drag works
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid grab/release (no crash)
- [ ] Drag off-screen (clamping)
- [ ] Multiple letters near slot (nearest wins)
- [ ] Hand lost mid-drag (letter returns)
- [ ] Word with duplicate letters (correct handling)

### Performance
- [ ] 60fps during drag operations
- [ ] Smooth animations on all devices
- [ ] No memory leaks in drag loop
- [ ] Fast word loading

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/WordBuilder.tsx`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
