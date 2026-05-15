# Picture Word Match

**Game ID:** picture-word-match  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts` (to be added)  
**Code:** `src/frontend/src/pages/PictureWordMatch.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/pictureWordMatchLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** An engaging visual vocabulary game where children match colorful picture cards to their corresponding words, strengthening reading comprehension and word recognition through delightful hand-tracking interactions
- **Genre:** Educational / Vocabulary / Visual Recognition
- **Target audience:** Ages 4-8, emergent readers building sight word vocabulary
- **Core player fantasy:** "I'm a word detective solving picture puzzles!" - combining visual matching with the joy of discovering that written words represent real objects
- **Primary skill tested:** Sight word recognition, vocabulary building, visual-to-text association, object naming, reading readiness
- **Session length:** 4-6 minutes (8-12 matches per game session)
- **Platform context:** Hand tracking CV game emphasizing reaching, selecting, and confirming choices through pinch gestures

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Framework patterns available from similar games (Shadow Match, Letter Sound Match, Vocabulary)
  - Hand tracking infrastructure ready via `useGameHandTracking`
  - TTS system available for word pronunciation
  - Image/emoji display system available
- **What is partial/missing:**
  - Main game component `PictureWordMatch.tsx`
  - Game logic module `pictureWordMatchLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Picture-to-word matching dataset
  - Difficulty progression system
  - Visual feedback for correct/incorrect matches
- **Evidence:**
  - No file exists at `src/frontend/src/pages/PictureWordMatch.tsx`
  - No file exists at `src/frontend/src/games/pictureWordMatchLogic.ts`
  - Registry entry needed in `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (Easy: 3 options, Medium: 4 options, Hard: 6 options)
2. **Game Start:** Voice welcomes player, explains the task
3. **Gameplay Loop:**
   - Target word appears prominently at top of screen
   - 3-6 picture cards float/arrange on screen
   - Player uses hand cursor to hover over pictures
   - Pinch gesture to select the matching picture
   - Immediate feedback on selection
4. **Round Progression:** 
   - Correct match: Celebration, points, next word
   - Incorrect match: Gentle correction, retry same word
5. **Session End:** Score summary, rewards, progress saved

### Controls
- **Hand movement:** Index finger controls cursor position
- **Pinch to select:** Index finger + thumb contact to choose picture
- **Hover preview:** Cards highlight when cursor approaches
- **Touch/mouse:** Click/tap pictures directly (fallback)
- **CV primary:** Full hand tracking with pinch selection

### Mechanics
- **Picture cards:** Large, colorful emoji/image cards (120px minimum)
- **Target word display:** Large, clear text with TTS option
- **Hit detection:** Pinch within card bounds triggers selection
- **Shuffle system:** Pictures randomize position each round
- **Distractor logic:** Incorrect options from same category (animals, foods, etc.)
- **Progression:**
  - Easy: Common objects (cat, dog, sun), 3 options
  - Medium: Expanded vocabulary, 4 options, similar categories
  - Hard: Abstract concepts, 6 options, subtle distinctions

### Visuals/UI
- **Background:** Warm, inviting gradient (soft yellow to peach)
- **Picture cards:** Rounded corners, subtle shadows, 3D lift effect on hover
- **Target word:** Large, bold font (48px+), high contrast
- **Card design:** 
  - White background with colored border
  - Centered emoji/image
  - Optional word label underneath (toggle in settings)
- **Hand cursor:** Glowing finger indicator with pinch state
- **Feedback overlays:** Success sparkles, gentle shake on error

### Gaps/Issues
- No implementation exists to analyze
- Need comprehensive word-image dataset organized by difficulty
- Card layout algorithm needed for responsive positioning
- Consider adding word audio pronunciation for pre-readers
- Distractor selection logic needs careful tuning to avoid frustration

---

## 4. Intended Design

### Educational Goal
Build foundational sight word vocabulary through active picture-word association. Children learn that written words are symbolic representations of objects, actions, and concepts they know.

### Pedagogical Approach
- **Visual scaffolding:** Pictures provide context clues for word recognition
- **Multisensory learning:** See picture, read word, hear pronunciation, physically select
- **Graduated difficulty:** Start with concrete nouns, progress to verbs and adjectives
- **Error-friendly:** Wrong answers are learning opportunities, not failures
- **Repetition with variation:** Same words appear with different distractors

### Difficulty Progression
| Level | Word Types | Options | Distractor Strategy | Examples |
|-------|-----------|---------|---------------------|----------|
| Easy (1-2) | Concrete nouns | 3 | Different categories | Cat, Apple, Car |
| Medium (3-4) | Expanded nouns | 4 | Same category | Cat, Dog, Bird, Fish |
| Hard (5-6) | Verbs + Adjectives | 6 | Similar concepts | Run, Walk, Jump, Skip |
| Expert (7+) | Abstract concepts | 6 | Semantic neighbors | Happy, Excited, Glad |

### Accessibility
- **Visual:** Large cards (min 120px), high contrast text, clear emojis
- **Auditory:** TTS for all words, clear success/error sounds
- **Motor:** Generous hit areas (card-based), no time pressure
- **Cognitive:** Optional word labels on cards, hint system available

### Engagement
- **Streak system:** Consecutive correct matches build bonus
- **Collection book:** Words "collected" shown in post-game summary
- **Voice encouragement:** Cheerful narrator celebrates progress
- **Visual rewards:** Cards animate when selected, confetti on milestones

### Core Loop
1. View target word at top of screen
2. Scan picture cards to find match
3. Move hand cursor to target card
4. Pinch to select
5. Receive immediate feedback
6. Build vocabulary collection
7. Progress to next word

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
- Clean hand tracking integration with pinch detection
- Responsive card hover and selection feedback
- Comprehensive word-picture dataset
- Smooth TTS pronunciation
- Appropriate difficulty scaling
- Robust error handling

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Three difficulty tiers:**
   - Easy: 3 cards, concrete objects, distinct categories
   - Medium: 4 cards, expanded vocabulary, same-category distractors
   - Hard: 6 cards, verbs/adjectives, semantic neighbors

2. **Hand tracking controls:**
   - Index finger position for cursor
   - Pinch gesture for selection
   - Hover state for card preview
   - Visual feedback for pinch readiness

3. **Picture card system:**
   - Large, tappable cards (120px minimum)
   - Centered emoji or custom image
   - Optional word label (toggleable)
   - Smooth hover and selection animations

4. **Scoring and feedback:**
   - Base points: 50 per correct match
   - Streak bonus: +10 per consecutive correct (max +50)
   - Speed bonus: Up to 25 points for quick matches

5. **Progressive vocabulary:**
   - 50+ words per difficulty level
   - Categories: Animals, Food, Objects, Nature, Actions, Feelings
   - Words appropriate for ages 4-8

### Enhancements for Future Versions
1. **Custom word lists:** Parent-defined vocabulary practice
2. **Themed packs:** Animals, Space, Ocean, Vehicles
3. **Sentence mode:** Match pictures to short phrases
4. **Spelling integration:** Type the word after matching
5. **Multiplayer:** Race to find matches

### Experimental Features
- **Voice input:** Say the word instead of selecting picture
- **Camera mode:** Use real objects as pictures
- **Adaptive difficulty:** AI adjusts based on performance patterns
- **Story mode:** Matched words build a story

---

## 7. Visual Identity

- **Overall look:** Bright, cheerful, organized card grid
- **Camera view:** Full screen with centered card layout
- **Art style:** Clean, modern, emoji-forward with custom illustrations
- **Mood:** Encouraging, playful, educational
- **Colors:**
  - Background: Warm gradient (#FFF8E7 to #FFE4CC)
  - Cards: White with soft shadows
  - Card borders: Pastel rainbow colors rotating
  - Target word: Deep navy (#1E3A5F) for readability
  - Success: Bright green (#4CAF50) with gold accents
  - Error: Soft coral (#FF8A80) with gentle feedback
- **Environment:** Clean, distraction-free workspace
- **UI style:** Rounded corners, soft shadows, generous spacing
- **Active vibe:** "Find the picture that matches the word!" 🎯

### Card Design
```
┌─────────────────┐
│  ┌───────────┐  │
│  │           │  │
│  │    🐱     │  │  ← Large centered emoji
│  │           │  │
│  └───────────┘  │
│    [CAT]        │  ← Optional word label
│  ━━━━━━━━━━━━━  │  ← Colored border accent
└─────────────────┘
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Difficulty buttons (Easy/Medium/Hard), instructions |
| **Tutorial** | Learn controls | Animated hand demo, practice selection |
| **Gameplay** | Core experience | Target word, picture cards, score, progress |
| **Match Success** | Reward feedback | Celebration, points popup, word pronunciation |
| **Match Wrong** | Gentle correction | Shake animation, hint highlight, retry |
| **Milestone** | Progress celebration | Streak banner, encouragement |
| **Game Complete** | Final summary | Total score, words collected, rewards, play again |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows smoothly |
| Hover card | Cursor enters card bounds | Card lifts, border glows |
| Select card | Pinch (index + thumb touch) | Card selected, confirmation |
| Select (fallback) | Click/tap card | Same selection effect |
| Replay audio | Click speaker icon | Word pronunciation repeats |
| Start game | Click Start button | Game begins |

### CV Control Details
- **Hand tracking:** Index finger tip position mapped to cursor
- **Pinch detection:** Distance < 0.05 normalized
- **Card hit area:** Full card bounds (120x120px minimum)
- **Hover threshold:** Cursor within card rectangle
- **Cursor states:**
  - Normal: Open hand cursor
  - Hovering: Hand with highlight ring
  - Pinching: Closed hand, pulsing effect
- **Visual feedback:** Card scales 1.05x on hover

---

## 10. Core Mechanics

### Picture Card System
```typescript
interface PictureCard {
  id: string;
  word: string;           // Target word (e.g., "cat")
  emoji: string;          // Display emoji (e.g., "🐱")
  category: string;       // "animals", "food", etc.
  difficulty: 1 | 2 | 3;  // Complexity level
  x: number;              // Grid position
  y: number;
}

// Card layout (responsive grid)
// Easy: 1x3 or 3x1
// Medium: 2x2
// Hard: 2x3 or 3x2
```

### Distractor Selection Logic
```typescript
function selectDistractors(
  target: PictureCard,
  allCards: PictureCard[],
  count: number,
  difficulty: number
): PictureCard[] {
  // Easy: Different categories
  if (difficulty === 1) {
    return allCards
      .filter(c => c.category !== target.category)
      .slice(0, count);
  }
  // Medium: Same category
  if (difficulty === 2) {
    return allCards
      .filter(c => c.category === target.category && c.id !== target.id)
      .slice(0, count);
  }
  // Hard: Semantic neighbors (configurable)
  return selectSemanticNeighbors(target, count);
}
```

### Scoring Formula
```
Base Points: 50 per correct match
Streak Bonus: +10 per consecutive match (max +50)
  - 1st match: +0
  - 2nd match: +10
  - 3rd match: +20
  - 4th match: +30
  - 5th+ match: +40, +50 cap
Speed Bonus: max(0, 25 - timeTaken * 5)

Total = Base + Streak Bonus + Speed Bonus
```

### Difficulty Configuration
| Level | Cards | Categories | Word Types | Session Length |
|-------|-------|------------|------------|----------------|
| 1 | 3 | Mixed | Common nouns | 8 words |
| 2 | 3 | Single | Animals only | 10 words |
| 3 | 4 | Single | Food items | 10 words |
| 4 | 4 | Mixed | Objects + Nature | 12 words |
| 5 | 6 | Mixed | Verbs + Actions | 12 words |
| 6 | 6 | Mixed | Adjectives | 15 words |

---

## 11. Rules

- **Start:** Select difficulty, click Start
- **Objective:** Match each target word to its correct picture
- **Allowed:**
  - Hover over cards to preview
  - Pinch to select
  - Take time to decide
  - Touch/mouse fallback anytime
- **Restricted:**
  - Cannot select multiple cards at once
  - Must wait for feedback before next selection
  - Cannot change answer after selection
- **Scoring:** Based on streak + speed bonuses
- **Wrong selection:** Card shakes, gentle error sound, retry same word
- **Win condition:** Complete all words in the session

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Target Word | Display word to match | Each new round |
| Picture Cards | Selection options | Each round (shuffled) |
| Score | Current points | After each match |
| Streak | Consecutive correct | On each correct |
| Progress | "Word X of Y" | After each match |
| Speaker Button | Replay pronunciation | On click |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 450      Streak: 🔥 x4      │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────┐              │
│        │    CAT      │  ← Target    │
│        │   [🔊]      │     word     │
│        └─────────────┘              │
│                                     │
│    ┌─────┐  ┌─────┐  ┌─────┐       │
│    │ 🐱  │  │ 🐶  │  │ 🐦  │       │
│    │CAT  │  │DOG  │  │BIRD │       │
│    └─────┘  └─────┘  └─────┘       │
│                                     │
│    ┌─────┐  ┌─────┐  ┌─────┐       │
│    │ 🐟  │  │ 🐰  │  │ 🐭  │       │
│    │FISH │  │BUNNY│  │MOUSE│       │
│    └─────┘  └─────┘  └─────┘       │
│                                     │
├─────────────────────────────────────┤
│  Word 5 of 12              [||]     │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Correct Match)
- Card "pops" with scale animation (1.2x → 1.0x)
- Sparkle particle burst from card
- Success chime (pleasant ascending notes)
- Haptic feedback (light vibration)
- Voice: "Great job! Cat! 🐱"
- Score floats up with "+60" animation
- Brief celebration (0.5s) before next word

### Failure (Wrong Selection)
- Card shakes side-to-side (gentle, 3 shakes)
- Soft "boop" error sound (not harsh)
- Subtle red tint on selected card
- Voice: "That's a [dog]. Find the [cat]!"
- Target word highlighted/pulsed
- Retry same word immediately

### During Gameplay
- Cards have subtle idle animation (gentle float)
- Hover: Card lifts (translateY -5px), border glows
- Pinch: Cursor pulses, card ready state
- Background: Soft ambient gradient shift

### Streak Feedback
| Streak | Visual | Sound | Voice |
|--------|--------|-------|-------|
| 1-2 | - | Standard | "Good!" |
| 3-4 | Small star | Rising tone | "Great!" |
| 5-6 | Star burst | Fanfare | "Amazing!" |
| 7+ | Rainbow effect | Victory notes | "Incredible!" |

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Match | 50 points |
| Streak Bonus | +10 per consecutive (max +50) |
| Speed Bonus | Up to 25 points |
| Session Complete | 100 bonus points |

### Example Score Calculation
```
Match 1 (3.2s): 50 + 0 + 9 = 59
Match 2 (2.1s): 50 + 10 + 15 = 75
Match 3 (1.8s): 50 + 20 + 16 = 86
Match 4 (2.5s): 50 + 30 + 13 = 93
Match 5 (1.2s): 50 + 40 + 19 = 109
Session Bonus: 100
Total: 522 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- Picture card collectible (20% chance)
- Word star (15% chance)
- Book item (10% chance)
- Owl companion (5% chance at 90%+ accuracy)
- Golden picture frame (2% chance, rare)

### Easter Eggs
- **Word Wizard:** Complete session with 100% accuracy
  - Reward: Wizard hat accessory
  - Hint: "Get every word right!"
- **Speed Reader:** Complete 10 words in under 60 seconds
  - Reward: Lightning bolt sticker
  - Hint: "How fast can you match?"
- **Category Master:** Complete a full category without errors
  - Reward: Category trophy
  - Hint: "Perfect round in one category!"

### Progression
- Vocabulary collection book tracks discovered words
- Difficulty unlocks based on performance
- Personal best tracking for score and speed
- Word mastery status (seen → practiced → mastered)

---

## 15. End States

### Match Correct
- Card celebration animation
- Score update with bonus breakdown
- Streak increment
- Voice pronunciation and praise
- Word added to collection
- Brief pause (0.5s)
- Next target word appears
- Cards reshuffle

### Match Wrong
- Gentle shake animation
- Soft error sound
- Voice correction with hint
- Target word emphasized
- Same word retry (no penalty to streak)
- Cards remain in position

### Session Complete
- Final score display with breakdown
- Words collected gallery
- Accuracy percentage
- Rewards/drops earned
- Personal best comparison
- Options: Play Again, Change Difficulty, Exit
- Progress saved via completeGame hook

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking with Pinch)
Full hand tracking with pinch-to-select mechanics as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click or tap cards directly
- No hand tracking required
- Same gameplay, different input
- Suitable for tablets and desktop

### Mode C: Voice-Assisted Mode
- Player can say the word to confirm match
- "Is it cat?" - confirmation check
- Combines visual matching with pronunciation practice

### Mode D: Reverse Mode
- Picture shown at top
- Select from word cards below
- Tests reading comprehension

### Mode E: Timed Challenge
- Fixed time limit (90 seconds)
- Match as many as possible
- Speed prioritized
- High score leaderboard

---

## 17. Improvement Opportunities

### Low Cost
- Add more word categories
- Seasonal theme packs
- Background music toggle
- More voice line variety
- Achievement notifications

### Medium Effort
- Custom word list import
- Photo upload for personal pictures
- Word tracing after match
- Difficulty auto-adjustment
- Parent progress reports

### Ambitious
- AI-generated distractors based on confusion patterns
- Multiplayer race mode
- Curriculum alignment (sight word lists)
- Real object recognition via camera
- Sign language integration

---

## 18. Content Model

### Word Data Structure
```typescript
interface WordEntry {
  id: string;
  word: string;              // Display word
  emoji: string;             // Visual representation
  phonetic: string;          // Pronunciation guide
  category: WordCategory;
  difficulty: 1 | 2 | 3;
  exampleSentence?: string;  // "The cat sleeps."
}

type WordCategory = 
  | 'animals' 
  | 'food' 
  | 'objects' 
  | 'nature' 
  | 'actions' 
  | 'feelings' 
  | 'colors' 
  | 'body';

const WORD_DATABASE: WordEntry[] = [
  // Easy - Concrete nouns
  { id: 'cat', word: 'cat', emoji: '🐱', category: 'animals', difficulty: 1 },
  { id: 'dog', word: 'dog', emoji: '🐕', category: 'animals', difficulty: 1 },
  { id: 'sun', word: 'sun', emoji: '☀️', category: 'nature', difficulty: 1 },
  // Medium - Expanded vocabulary
  { id: 'elephant', word: 'elephant', emoji: '🐘', category: 'animals', difficulty: 2 },
  { id: 'pizza', word: 'pizza', emoji: '🍕', category: 'food', difficulty: 2 },
  // Hard - Abstract
  { id: 'happy', word: 'happy', emoji: '😊', category: 'feelings', difficulty: 3 },
  { id: 'running', word: 'running', emoji: '🏃', category: 'actions', difficulty: 3 },
];
```

### Category Organization
| Category | Easy | Medium | Hard | Total |
|----------|------|--------|------|-------|
| Animals | 10 | 10 | 5 | 25 |
| Food | 8 | 8 | 4 | 20 |
| Objects | 8 | 8 | 4 | 20 |
| Nature | 6 | 6 | 3 | 15 |
| Actions | 4 | 8 | 8 | 20 |
| Feelings | 2 | 6 | 10 | 18 |
| **Total** | **38** | **46** | **34** | **118** |

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `PictureWordMatch.tsx` | Main React component | 300-350 |
| `pictureWordMatchLogic.ts` | Pure game logic | 200-250 |
| `pictureWordMatch.types.ts` | TypeScript interfaces | 50-75 |

### Key Components
- `PictureWordMatchContent` - Core game
- `PictureWordMatch` (default) - GameShell wrapper
- `PictureCard` - Individual selectable card
- `TargetWordDisplay` - Word and audio controls
- `GameGrid` - Responsive card layout

### Logic Functions
| Function | Purpose |
|----------|---------|
| `createRound()` | Generate target + distractors |
| `shuffleCards()` | Randomize card positions |
| `selectDistractors()` | Choose appropriate wrong answers |
| `checkAnswer()` | Validate selection |
| `calculateScore()` | Compute points |
| `getWordsByDifficulty()` | Filter word database |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Word pronunciation

### State Management
```typescript
interface GameState {
  targetWord: WordEntry;
  cards: PictureCard[];
  score: number;
  streak: number;
  round: number;
  totalRounds: number;
  difficulty: 1 | 2 | 3;
  gameStatus: 'menu' | 'playing' | 'complete';
  cursor: { x: number; y: number } | null;
}
```

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Optimal card size | 120px based on similar games | Medium |
| Grid layout | Responsive: 1x3, 2x2, 2x3 | Medium |
| Word database size | 100+ words for variety | Medium |
| Pinch threshold | 0.05 normalized distance | High |
| Session length | 8-15 words per session | Medium |
| Distractor selection | Same category for challenge | Medium |

---

## 21. Implementation Notes

### Strengths to Build On
- Hand tracking infrastructure mature
- TTS system provides clear pronunciation
- Similar games (Shadow Match) provide patterns
- Educational focus allows forgiving gameplay

### Architecture Patterns
- Separate logic from presentation
- Use refs for game state to avoid re-renders
- Throttle hand tracking to 30fps
- Debounce pinch detection

### Testing Considerations
- Test pinch with various hand sizes
- Verify card visibility at all screen sizes
- Ensure TTS works for all words
- Test with children for difficulty calibration

### Performance Notes
- Limit concurrent animations
- Preload emoji assets
- Optimize hit detection
- Use CSS transforms for animations

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes and shows cursor
- [ ] Pinch gesture detects selection accurately
- [ ] Cards display with correct emoji and word
- [ ] Target word displays clearly with TTS
- [ ] Three difficulty levels function
- [ ] Distractor selection appropriate for difficulty
- [ ] Score calculates with streak and speed bonuses
- [ ] Streak system tracks consecutive matches
- [ ] Voice feedback plays for all interactions
- [ ] Touch/mouse fallback functions
- [ ] Visual feedback on hover and select
- [ ] Game completes after all words
- [ ] Final score displays with breakdown
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, complete all words
- [ ] Play medium mode, verify harder distractors
- [ ] Play hard mode, verify 6-card layout
- [ ] Get a match wrong, verify gentle correction
- [ ] Build 5+ streak, verify bonus applies
- [ ] Complete session, verify final summary

### CV Control Tests
- [ ] Hand tracking initializes
- [ ] Cursor follows smoothly
- [ ] Pinch detection works
- [ ] Card hover effects work
- [ ] No hand = no cursor

### Fallback Tests
- [ ] Touch cards work
- [ ] Mouse clicks work
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid selections (debounce works)
- [ ] Hand lost mid-selection
- [ ] Tab switch during game
- [ ] All word categories tested

### Performance
- [ ] 60fps with 6 cards
- [ ] No memory leaks
- [ ] Smooth on tablets

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/ShadowMatch.tsx`, `src/frontend/src/pages/LetterSoundMatch.tsx`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
