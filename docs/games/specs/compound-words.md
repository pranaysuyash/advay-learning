# Compound Words

**Game ID:** compound-words  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Manifest:** To be added to `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/CompoundWords.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/compoundWordsLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** Combine two word pieces to form compound words — like solving word puzzles by joining "sun" + "flower" to make "sunflower"! 🌻
- **Genre:** Educational / Word Puzzle / Vocabulary Building
- **Target audience:** Ages 5-8, emerging readers developing vocabulary and word recognition
- **Core player fantasy:** "I'm a word builder discovering how words combine to make new meanings!"
- **Primary skill tested:** Vocabulary building, compound word recognition, word relationships, spelling patterns
- **Session length:** 5-8 minutes (8-12 compound words per game)
- **Platform context:** Hand tracking CV game with drag-and-drop mechanics for combining word parts

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Similar pattern available in `BlendBuilder.tsx` for word-building gameplay
  - Drag-and-drop infrastructure from other games (e.g., Word Scramble pattern)
  - Hand tracking via `useGameHandTracking`
  - TTS system for word pronunciation
  - Particle effects and celebration systems
- **What is partial/missing:**
  - Main game component `CompoundWords.tsx`
  - Game logic module `compoundWordsLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Compound word bank with visual associations
  - Drag-to-combine mechanics
  - Visual feedback for successful combinations
- **Evidence:**
  - No file exists at `src/frontend/src/pages/CompoundWords.tsx`
  - No file exists at `src/frontend/src/games/compoundWordsLogic.ts`
  - No registry entry found for "compound-words"
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (Easy: common compounds, Medium: less common, Hard: challenging)
2. **Game Start:** Animated introduction showing word pieces coming together
3. **Gameplay Loop:**
   - Two word pieces appear on screen (e.g., "sun" and "flower")
   - Visual clue (silhouette) of the compound word shown
   - Player drags one piece toward the other using hand
   - When pieces touch, they snap together with satisfying animation
   - Full compound word revealed with image (sunflower 🌻)
   - Word pronounced via TTS
   - Progress to next compound word
4. **Feedback:** Immediate visual and audio feedback on successful combination
5. **Progression:** Difficulty increases with less common compound words
6. **Completion:** Score summary with words discovered and rewards

### Controls
- **Hand drag:** Move hand to word piece, pinch to grab, drag toward other piece
- **Hand tracking:** Index finger position for cursor
- **Pinch gesture:** Hold pinch to carry word piece, release to drop
- **Snap combine:** Word pieces auto-combine when brought within 100px
- **Touch/mouse:** Click-drag or tap piece then tap target location (fallback)
- **CV primary:** Full hand tracking with drag-and-combine mechanics

### Mechanics
- **Word pair generation:** Random selection from compound word bank
- **Drag physics:** Word piece follows hand with slight smoothing
- **Combine detection:** Detects when pieces are close enough to merge
- **Snap animation:** Pieces animate together forming complete word
- **Visual reveal:** Silhouette fills with full-color image after combination
- **TTS pronunciation:** Combined word spoken aloud after success
- **Streak system:** Consecutive successful combinations earn bonus points

### Visuals/UI
- **Background:** Cheerful workshop scene with word-building theme
- **Word pieces:** Colorful rounded cards with large text
- **Combine zone:** Central "magic merge" area with glow effect
- **Silhouette clue:** Faded outline of final compound word image
- **Revealed image:** Full-color emoji/illustration of compound word
- **Progress tracker:** Words completed / total counter
- **Streak indicator:** Visual flame with consecutive count

### Gaps/Issues
- No implementation exists to analyze
- Drag physics need tuning for natural feel
- Combine detection radius needs balancing
- Need to ensure word pairs don't have multiple valid combinations
- Consider accessibility for children with motor difficulties

---

## 4. Intended Design

### Educational Goal
Develop vocabulary and understanding of how smaller words combine to create new words with compound meanings. Reinforces reading skills and word recognition patterns.

### Pedagogical Approach
- **Constructivist learning:** Build understanding by physically combining word parts
- **Visual association:** Connect words with images for concrete understanding
- **Multisensory engagement:** Visual (word pieces), auditory (TTS), kinesthetic (dragging)
- **Meaningful connections:** "Sun" + "flower" = something that looks like the sun and is a flower
- **Scaffolded difficulty:** Start with concrete, imageable compound words

### Difficulty Progression
| Level | Word Types | Examples | Clue Type |
|-------|------------|----------|-----------|
| Easy | Common concrete nouns | sun+flower, rain+bow, foot+ball, butter+fly | Full silhouette |
| Medium | Moderate frequency | tooth+brush, fire+fly, book+shelf, snow+man | Partial silhouette |
| Hard | Less common compounds | dragon+fly, butter+cup, moon+light, star+fish | Minimal hint |
| Expert | Abstract/challenging | any+thing, every+one, under+stand, with+draw | No hint |

### Accessibility
- **Visual:** Large word cards, clear emojis, high contrast
- **Auditory:** Word pronunciation before and after combining
- **Motor:** Generous combine radius, tap-to-move fallback
- **Cognitive:** Visual clues available, no time pressure
- **Reading support:** Words paired with images for pre-readers

### Engagement
- **Discovery satisfaction:** "Aha!" moment when words combine
- **Visual reward:** Full-color reveal of compound word image
- **Collection element:** Word journal showing all compounds discovered
- **Streak excitement:** Multiplier for consecutive correct combinations
- **Thematic consistency:** Workshop theme — "building" words like crafts

### Core Loop
1. View the two word pieces and silhouette clue
2. Plan which piece to move
3. Grab first word piece with pinch
4. Drag toward second piece
5. Release to combine (snap animation)
6. See full image revealed and hear pronunciation
7. Celebrate and progress to next word pair
8. Build streak for bonus points

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
- Smooth drag-and-drop mechanics
- Satisfying combine animation
- Clear visual feedback
- Responsive hand tracking
- Engaging word bank with variety
- Proper difficulty progression

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Four difficulty tiers:**
   - Easy: Common compound words with clear images
   - Medium: Less common but still imageable compounds
   - Hard: More abstract compound words
   - Expert: Challenging vocabulary words

2. **Hand tracking drag-and-combine:**
   - Pinch to grab word piece
   - Drag toward other piece
   - Auto-combine when close enough
   - Visual "magnetic pull" effect when near combine zone

3. **Visual clue system:**
   - Silhouette hint before combination
   - Full reveal after successful combine
   - Progressive difficulty (full → partial → minimal hint)

4. **Word bank by category:**
   - Nature (sunflower, rainbow, butterfly)
   - Animals (dragonfly, starfish, jellyfish)
   - Objects (toothbrush, bookshelf, football)
   - Food (blueberry, pancake, popcorn)

5. **Scoring system:**
   - Base: 100 points per compound word
   - Speed bonus: Up to 30 points
   - Streak multiplier: 1.2x at 3+, 1.5x at 6+
   - Hint penalty: -20 points if silhouette hint used

### Enhancements for Future Versions
1. **Reverse mode:** Given compound word, break into parts
2. **Create your own:** Allow creating custom compound words
3. **Story mode:** Use compound words to progress narrative
4. **Multiplayer:** Race to combine words first
5. **Word family exploration:** See related compound words

### Experimental Features
- **3D mode:** Word pieces float in 3D space
- **Voice input:** Say the compound word to confirm
- **Drawing mode:** Draw the compound word after combining
- **AR mode:** Word pieces appear on real surfaces

---

## 7. Visual Identity

- **Overall look:** Bright, playful workshop where words are "built" and "crafted"
- **Camera view:** Full screen with centered play area
- **Art style:** Colorful flat design with tactile 3D card effects
- **Mood:** Creative, constructive, satisfying
- **Colors:**
  - Background: Warm workshop beige (#F5E6D3)
  - Word Piece A: Sky blue (#64B5F6) with white text
  - Word Piece B: Sunny yellow (#FFD54F) with dark text
  - Combine zone: Magical purple glow (#9C27B0)
  - Success: Fresh green (#4CAF50)
  - Accent: Coral orange (#FF7043)
- **Environment:** Workbench theme with tools and word-building materials
- **UI style:** Rounded, friendly, with tactile card appearance
- **Active vibe:** "Build the word!" 🔨🔤

### Word Piece Design
```
┌─────────────────┐     ┌─────────────────┐
│  ┌───────────┐  │     │  ┌───────────┐  │
│  │   SUN     │  │  +  │  │  FLOWER   │  │  →  🌻
│  │  (blue)   │  │     │  │  (yellow) │  │
│  └───────────┘  │     │  └───────────┘  │
└─────────────────┘     └─────────────────┘
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Easy/Medium/Hard/Expert buttons, category selection |
| **Tutorial** | Learn drag controls | Animated hand demo, practice combine |
| **Gameplay** | Core experience | Word pieces, combine zone, silhouette clue, progress |
| **Combine Animation** | Success moment | Pieces snapping, glow effect, reveal |
| **Word Reveal** | Show result | Full image, word pronunciation, points |
| **Level Complete** | Progress milestone | Stats, words discovered, next level button |
| **Game Complete** | Final celebration | Total score, word journal, rewards |
| **Word Journal** | Collection view | All compounds discovered with images |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows hand |
| Grab word piece | Pinch (index + thumb) | Piece lifts with shadow, scales up |
| Drag piece | Move hand while pinching | Piece follows smoothly |
| Combine pieces | Drag near other piece | Magnetic pull effect, auto-snap |
| Release | Release pinch | If near other piece, combine triggers |
| Tap to move (fallback) | Click piece, click destination | Piece animates to position |
| Hear word | Word pronounced automatically | TTS after successful combine |
| Progress | Auto-advance after 2s | Smooth transition to next word |

### CV Control Details
- **Hand tracking:** Index finger tip position
- **Pinch threshold:** < 0.05 normalized distance
- **Grab detection:** Raycast from finger to word piece
- **Drag smoothing:** Lerp factor 0.25 for weighty feel
- **Combine radius:** 100px between piece centers
- **Magnetic effect:** Piece B pulls toward piece A when A dragged near

---

## 10. Core Mechanics

### Compound Word Bank Structure
```typescript
interface CompoundWord {
  word: string;           // "sunflower"
  partA: string;          // "sun"
  partB: string;          // "flower"
  emoji: string;          // 🌻
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;       // "nature", "animals", "objects", "food"
}

const COMPOUND_WORDS: CompoundWord[] = [
  { word: 'sunflower', partA: 'sun', partB: 'flower', emoji: '🌻', difficulty: 'easy', category: 'nature' },
  { word: 'rainbow', partA: 'rain', partB: 'bow', emoji: '🌈', difficulty: 'easy', category: 'nature' },
  { word: 'butterfly', partA: 'butter', partB: 'fly', emoji: '🦋', difficulty: 'easy', category: 'animals' },
  { word: 'football', partA: 'foot', partB: 'ball', emoji: '🏈', difficulty: 'easy', category: 'objects' },
  // ... more words
];
```

### Drag and Combine Physics
```typescript
// Word piece follows hand with smoothing
function updatePiecePosition(
  piece: WordPiece,
  handPos: Vector2,
  isDragging: boolean
): void {
  if (isDragging) {
    piece.x = lerp(piece.x, handPos.x, 0.25);
    piece.y = lerp(piece.y, handPos.y, 0.25);
    piece.rotation = (handPos.x - piece.x) * 0.5; // Slight tilt
  }
}

// Check for combine opportunity
function checkCombineProximity(pieceA: WordPiece, pieceB: WordPiece): boolean {
  const distance = getDistance(pieceA, pieceB);
  return distance < COMBINE_RADIUS;
}

// Magnetic pull effect
function applyMagneticPull(
  draggedPiece: WordPiece,
  targetPiece: WordPiece
): void {
  const distance = getDistance(draggedPiece, targetPiece);
  if (distance < MAGNETIC_RADIUS) {
    const pullStrength = 1 - (distance / MAGNETIC_RADIUS);
    targetPiece.x = lerp(targetPiece.x, draggedPiece.x, pullStrength * 0.1);
    targetPiece.y = lerp(targetPiece.y, draggedPiece.y, pullStrength * 0.1);
  }
}
```

### Combine Animation Sequence
```typescript
async function animateCombine(pieceA: WordPiece, pieceB: WordPiece): Promise<void> {
  // Phase 1: Pieces snap together
  await animate({
    targets: [pieceA, pieceB],
    x: COMBINE_CENTER_X,
    y: COMBINE_CENTER_Y,
    duration: 300,
    easing: 'easeOutElastic'
  });
  
  // Phase 2: Glow and merge effect
  triggerGlowEffect(COMBINE_CENTER_X, COMBINE_CENTER_Y);
  playCombineSound();
  
  // Phase 3: Reveal compound word
  await animate({
    targets: compoundWordDisplay,
    scale: [0, 1.2, 1],
    opacity: [0, 1],
    duration: 500,
    easing: 'easeOutBack'
  });
  
  // Phase 4: Pronounce word
  speak(compoundWord.word);
}
```

### Scoring Formula
```
Base Points: 100 per compound word
Speed Bonus: max(0, 30 - timeTakenSeconds)
Streak Multiplier:
  - 1-2 words: 1.0x
  - 3-5 words: 1.2x
  - 6+ words: 1.5x
Hint Penalty: -20 if silhouette hint used

Total = (Base + Speed - HintPenalty) × StreakMultiplier
```

### Streak System
- Increments on each successful combination
- Resets to 0 on incorrect attempt (if applicable in alternate modes)
- Visual flame indicator with number
- Multiplier shown during score calculation
- Milestone celebration at 5 and 10 streak

---

## 11. Rules

- **Start:** Select difficulty and category, click Start
- **Objective:** Combine word pieces to form compound words
- **Allowed:**
  - Drag word pieces freely
  - Release to attempt combine when pieces are close
  - Use silhouette hint (with point penalty)
  - Touch/mouse fallback available
  - Request word pronunciation after combine
- **Restricted:**
  - Cannot combine wrong word pairs (pieces repel)
  - Cannot skip words (must solve to progress)
  - Time does not penalize, but affects speed bonus
- **Scoring:** Based on speed + streak + hint usage
- **Wrong combination:** Pieces bounce apart with gentle feedback
- **Win condition:** Complete all compound words in the level

### Difficulty-Specific Rules
| Difficulty | Words | Hint Type | Combine Radius |
|------------|-------|-----------|----------------|
| Easy | 8 words | Full silhouette | 120px |
| Medium | 10 words | Partial silhouette | 100px |
| Hard | 12 words | Minimal hint | 80px |
| Expert | 15 words | No hint | 60px |

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Word Piece A | First part of compound | Each new word |
| Word Piece B | Second part of compound | Each new word |
| Combine Zone | Central merge area | Constant |
| Silhouette Clue | Hint for compound word | Each new word |
| Compound Reveal | Full image after combine | Post-combine |
| Progress | Words completed / total | After each word |
| Score | Current points | After each word |
| Streak | Consecutive successful combines | On success |
| Timer | Time spent (for bonus calc) | Continuous |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 450    Word: 4 of 10        │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────┐                      │
│    │   🌻    │  ← Silhouette clue   │
│    │  (dim)  │     (fades to full)  │
│    └─────────┘                      │
│                                     │
│  ┌─────┐      ┌─────┐              │
│  │ SUN │  +   │FLOWER│  → COMBINE  │
│  │(blue│      │yellow│     ZONE     │
│  └─────┘      └─────┘              │
│                                     │
│      [Drag pieces together!]        │
│                                     │
│         🔥 Streak: 3                │
├─────────────────────────────────────┤
│  Progress: ████████░░ 80%           │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Word Combined)
- Satisfying "click-snap" as pieces connect
- Purple glow burst at combine point
- Success fanfare sound
- Word pronounced: "Sunflower!"
- Silhouette fills with full-color emoji
- Points float up with "+120" animation
- Streak counter increments with flame animation
- Haptic success pulse
- Progress to next word after 2s

### Magnetic Pull Effect
- Subtle pull sensation as pieces get close
- Visual "connection line" appears between pieces
- Target piece slightly glows when in range
- Soft "magnetic hum" sound

### Failure (Wrong Combination Attempt)
- Gentle "bounce" effect if pieces don't match
- Pieces repel slightly
- Soft "not quite" tone
- Voice: "Try combining these words!"
- No streak penalty (encouragement-focused)

### Dragging State
- Word piece scales up 10% when grabbed
- Shadow deepens under piece
- Slight rotation based on drag direction
- Smooth follow with weighty feel

### Streak Feedback
| Streak | Visual | Sound | Effect |
|--------|--------|-------|--------|
| 1-2 | Small flame | Standard | - |
| 3-5 | Medium flame | Rising scale | 1.2x multiplier |
| 6-9 | Large flame | Fanfare | 1.5x multiplier |
| 10+ | Rainbow flame | Victory music | 1.5x + special badge |

### Milestone Celebrations
- **5 streak:** "On Fire!" badge with sparkles
- **10 streak:** "Word Wizard!" badge with rainbow effect
- **Level complete:** Confetti explosion with summary

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Word | 100 points |
| Speed Bonus | Up to 30 points (faster = more) |
| Streak Multiplier | 1.0x → 1.2x → 1.5x |
| Hint Penalty | -20 if silhouette hint used |

### Example Score Calculation
```
Word 1 (hint used, 12s): (100 + 0 - 20) × 1.0 = 80
Word 2 (no hint, 5s): (100 + 15 + 0) × 1.0 = 115
Word 3 (no hint, 4s): (100 + 20 + 0) × 1.2 = 144
Word 4 (no hint, 6s): (100 + 15 + 0) × 1.2 = 138
Total: 477 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- `book-blue` (20% chance) - For word discovery
- `star-silver` (15% chance) - Standard reward
- `letter-a` (10% chance) - Letter collection
- `creature-owl` (5% chance at 80%+ accuracy) - Wisdom symbol

### Easter Eggs
- **Speed Builder:** Complete word in under 3 seconds
  - Reward: Lightning Bolt sticker
  - Hint: "How fast can you build?"
- **Compound Collector:** Discover 50 unique compound words
  - Reward: Magnifying Glass (master explorer)
  - Hint: "Build them all!"
- **Perfect Round:** Complete level without using hints
  - Reward: Golden Wrench (master builder)
  - Hint: "No hints needed!"
- **Category Master:** Complete all words in a category
  - Reward: Category trophy (e.g., "Nature Expert")
  - Hint: "Master a whole category!"

### Progression
- Word journal shows all compounds discovered
- Categories unlock as you complete previous ones
- Personal best tracking per difficulty
- Mastery stars for hintless completions
- Total compound words discovered counter

---

## 15. End States

### Word Combined Successfully
- Combine animation plays
- Word pronounced via TTS
- Score calculated and displayed
- Streak incremented
- Word added to journal
- 2s celebration, then next word loads

### Level Complete
- Level stats displayed (words completed, accuracy, score)
- Words discovered in this level shown
- Category progress updated
- Bonus points for completion
- Unlock notification (if applicable)
- Option to continue or review journal

### Game Complete
- Final score with breakdown
- Total words discovered
- Rewards earned display
- Word journal view option
- Category completion status
- Play Again / Change Difficulty / Exit

### Early Exit
- Progress saved up to current word
- Partial rewards based on completion percentage
- Return to menu with option to resume

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking Drag-and-Combine)
Full hand tracking with pinch-to-grab and drag mechanics as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click/tap piece, then click destination
- No drag required
- Accessible for all devices
- Same combine radius and feedback

### Mode C: Reverse Mode
- Given compound word (image + text)
- Break into two pieces by dragging apart
- Teaches decomposition of compound words
- Good for advanced learners

### Mode D: Timed Challenge
- Race against clock to combine words
- Time limit per word
- Bonus points for remaining time
- Fast-paced variant

### Mode E: Memory Mode
- Word pieces shown briefly, then flipped
- Remember which pieces go together
- Flip cards to find matches
- Memory + compound word recognition

### Mode F: Category Rush
- Words from single category only
- Race to complete entire category
- Category mastery challenge

---

## 17. Improvement Opportunities

### Low Cost
- Add more compound words (target: 100+)
- Combine sound variations
- Background music (upbeat, constructive)
- Achievement badges for milestones
- Word pronunciation speed options
- Category filtering in word journal

### Medium Effort
- Reverse mode (break apart compound words)
- Create-your-own compound word sandbox
- Custom word list for parents/teachers
- Difficulty fine-tuning per word
- Multiplayer racing mode
- Story mode with compound word narrative

### Ambitious
- AI-generated compound word validation
- User-created compound word sharing
- AR mode with floating word pieces
- Multi-language compound word support
- Integration with reading curriculum
- Parent/teacher progress dashboard
- Voice input for pronunciation practice

---

## 18. Content Model

### Word Data Structure
```typescript
interface CompoundWord {
  word: string;              // "sunflower"
  partA: string;             // "sun"
  partB: string;             // "flower"
  emoji: string;             // 🌻
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'nature' | 'animals' | 'objects' | 'food' | 'body';
  audio?: string;            // Optional custom pronunciation
}

// Compound word bank
const COMPOUND_WORDS: CompoundWord[] = [
  // Easy - Nature
  { word: 'sunflower', partA: 'sun', partB: 'flower', emoji: '🌻', difficulty: 'easy', category: 'nature' },
  { word: 'rainbow', partA: 'rain', partB: 'bow', emoji: '🌈', difficulty: 'easy', category: 'nature' },
  { word: 'snowman', partA: 'snow', partB: 'man', emoji: '⛄', difficulty: 'easy', category: 'nature' },
  { word: 'moonlight', partA: 'moon', partB: 'light', emoji: '🌙', difficulty: 'medium', category: 'nature' },
  
  // Easy - Animals
  { word: 'butterfly', partA: 'butter', partB: 'fly', emoji: '🦋', difficulty: 'easy', category: 'animals' },
  { word: 'dragonfly', partA: 'dragon', partB: 'fly', emoji: '🐉', difficulty: 'medium', category: 'animals' },
  { word: 'jellyfish', partA: 'jelly', partB: 'fish', emoji: '🪼', difficulty: 'easy', category: 'animals' },
  { word: 'starfish', partA: 'star', partB: 'fish', emoji: '⭐', difficulty: 'easy', category: 'animals' },
  
  // Easy - Objects
  { word: 'football', partA: 'foot', partB: 'ball', emoji: '🏈', difficulty: 'easy', category: 'objects' },
  { word: 'toothbrush', partA: 'tooth', partB: 'brush', emoji: '🪥', difficulty: 'medium', category: 'objects' },
  { word: 'bookshelf', partA: 'book', partB: 'shelf', emoji: '📚', difficulty: 'medium', category: 'objects' },
  { word: 'sunglasses', partA: 'sun', partB: 'glasses', emoji: '🕶️', difficulty: 'easy', category: 'objects' },
  
  // Easy - Food
  { word: 'blueberry', partA: 'blue', partB: 'berry', emoji: '🫐', difficulty: 'easy', category: 'food' },
  { word: 'pancake', partA: 'pan', partB: 'cake', emoji: '🥞', difficulty: 'medium', category: 'food' },
  { word: 'popcorn', partA: 'pop', partB: 'corn', emoji: '🍿', difficulty: 'easy', category: 'food' },
  { word: 'watermelon', partA: 'water', partB: 'melon', emoji: '🍉', difficulty: 'medium', category: 'food' },
  
  // Medium - Body
  { word: 'eyebrow', partA: 'eye', partB: 'brow', emoji: '🤨', difficulty: 'medium', category: 'body' },
  { word: 'toothpaste', partA: 'tooth', partB: 'paste', emoji: '🦷', difficulty: 'medium', category: 'body' },
  { word: 'fingernail', partA: 'finger', partB: 'nail', emoji: '💅', difficulty: 'medium', category: 'body' },
  { word: 'hairbrush', partA: 'hair', partB: 'brush', emoji: '🪮', difficulty: 'medium', category: 'body' },
  
  // Hard
  { word: 'buttercup', partA: 'butter', partB: 'cup', emoji: '🧈', difficulty: 'hard', category: 'nature' },
  { word: 'lighthouse', partA: 'light', partB: 'house', emoji: '🗼', difficulty: 'hard', category: 'objects' },
  { word: 'wheelchair', partA: 'wheel', partB: 'chair', emoji: '🦽', difficulty: 'hard', category: 'objects' },
  { word: 'honeycomb', partA: 'honey', partB: 'comb', emoji: '🍯', difficulty: 'hard', category: 'food' },
  
  // Expert
  { word: 'everything', partA: 'every', partB: 'thing', emoji: '🔮', difficulty: 'expert', category: 'objects' },
  { word: 'understand', partA: 'under', partB: 'stand', emoji: '🧠', difficulty: 'expert', category: 'body' },
  { word: 'anywhere', partA: 'any', partB: 'where', emoji: '🗺️', difficulty: 'expert', category: 'nature' },
  { word: 'firefighter', partA: 'fire', partB: 'fighter', emoji: '👨‍🚒', difficulty: 'expert', category: 'objects' },
];
```

### Level Configuration
```typescript
interface LevelConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  wordCount: number;
  categories: string[];
  showHint: boolean;
  hintType: 'full' | 'partial' | 'minimal' | 'none';
  combineRadius: number;
}

const LEVELS: LevelConfig[] = [
  { difficulty: 'easy', wordCount: 8, categories: ['nature', 'animals'], showHint: true, hintType: 'full', combineRadius: 120 },
  { difficulty: 'medium', wordCount: 10, categories: ['nature', 'animals', 'objects'], showHint: true, hintType: 'partial', combineRadius: 100 },
  { difficulty: 'hard', wordCount: 12, categories: ['all'], showHint: true, hintType: 'minimal', combineRadius: 80 },
  { difficulty: 'expert', wordCount: 15, categories: ['all'], showHint: false, hintType: 'none', combineRadius: 60 },
];
```

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `CompoundWords.tsx` | Main React component | 400-500 |
| `compoundWordsLogic.ts` | Pure game logic functions | 250-300 |
| `compoundWords.types.ts` | TypeScript interfaces | 60-80 |
| `compoundWordBank.ts` | Word data and categories | 150-200 |

### Key Components in CompoundWords.tsx
- `CompoundWordsContent` - Core game implementation
- `CompoundWords` (default) - GameShell wrapper
- `WordPiece` - Draggable word component
- `CombineZone` - Central merge area with effects
- `SilhouetteClue` - Hint display component
- `CompoundReveal` - Full reveal animation component
- `WordJournal` - Collection view component
- `HandCursor` - Custom cursor with grab states

### Logic Functions (compoundWordsLogic.ts)
| Function | Purpose |
|----------|---------|
| `getWordsForLevel()` | Select appropriate words for difficulty |
| `createWordPieces()` | Initialize word piece positions |
| `updatePieceDrag()` | Handle drag physics |
| `checkCombineProximity()` | Detect when pieces should combine |
| `animateCombine()` | Trigger combine sequence |
| `calculateScore()` | Compute word score |
| `getHintType()` | Determine hint level for difficulty |
| `shuffleArray()` | Randomize word order |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Word pronunciation

### State Management
```typescript
interface GameState {
  currentWord: CompoundWord;
  pieceA: WordPiece;
  pieceB: WordPiece;
  isDragging: boolean;
  draggedPiece: 'A' | 'B' | null;
  score: number;
  streak: number;
  wordsCompleted: number;
  hintUsed: boolean;
  gameStatus: 'menu' | 'playing' | 'combining' | 'revealing' | 'complete';
  handPosition: { x: number; y: number };
  isPinching: boolean;
}
```

### Dependencies
- MediaPipe hand tracking
- Framer Motion for animations
- Canvas or DOM for word piece rendering
- TTS engine for pronunciation

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Optimal drag smoothing | 0.25 lerp factor | Medium |
| Combine radius size | 100px default | Medium |
| Word bank size needed | 50+ words minimum | High |
| Magnetic pull strength | 0.1 lerp when in range | Low |
| Hint penalty balance | -20 points feels fair | Medium |
| Word piece size | 120px for visibility | High |
| Combine animation timing | 300ms snap + 500ms reveal | Medium |
| Accessibility for motor disabilities | Tap-to-move fallback | High |

---

## 21. Implementation Notes

### Strengths to Build On
- BlendBuilder provides word-building patterns
- Hand tracking drag infrastructure exists
- TTS provides excellent word reinforcement
- Educational games have forgiving design patterns
- SyllableClap shows level selection patterns
- VowelValley demonstrates zone-based gameplay

### Architecture Patterns
- Separate drag physics from rendering
- Use refs for drag position (avoid React state during drag)
- Debounce combine detection
- Animate layout changes with Framer Motion
- Use GameShell for consistent game wrapper

### Testing Considerations
- Test drag feel with various hand sizes
- Verify combine detection at screen edges
- Test word bank randomization (no repeats)
- Validate with target age group for difficulty
- Test magnetic pull doesn't feel "sticky"

### Performance Notes
- Limit animated elements during drag
- Optimize hit detection
- Lazy load word images
- Preload audio for upcoming words

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes with cursor visible
- [ ] Pinch gesture grabs word pieces accurately
- [ ] Pieces drag smoothly with hand movement
- [ ] Combine detection works within radius
- [ ] Magnetic pull effect activates when pieces near
- [ ] Combine animation plays successfully
- [ ] Word pronunciation triggers after combine
- [ ] Four difficulty levels work
- [ ] Word bank provides appropriate words
- [ ] Silhouette clues display correctly
- [ ] Hint system works with point penalty
- [ ] Score calculates with bonuses and multipliers
- [ ] Streak multiplier applies correctly
- [ ] Touch/mouse fallback works
- [ ] Word journal tracks discovered words
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly
- [ ] Category filtering works

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, complete all words
- [ ] Play medium mode, verify reduced hint visibility
- [ ] Play hard mode, verify minimal hints
- [ ] Play expert mode, verify no hints
- [ ] Test combine with both pieces (drag A to B, drag B to A)
- [ ] Build 5+ streak, verify multiplier
- [ ] Use hint, verify point deduction
- [ ] Complete level, verify progress tracking
- [ ] View word journal, verify all words recorded

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Pinch grabs word piece consistently
- [ ] Drag follows hand smoothly
- [ ] Combine triggers at correct distance
- [ ] Magnetic pull activates appropriately
- [ ] Release places piece accurately
- [ ] No hand = safe state

### Fallback Tests
- [ ] Tap piece then tap combine zone works
- [ ] Click-drag with mouse works
- [ ] Touch drag works on tablet
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid grab/release (no crash)
- [ ] Drag off-screen (clamping)
- [ ] Multiple rapid combines (throttling)
- [ ] Hand lost mid-drag (piece returns)
- [ ] Word bank exhausted (loop or end)
- [ ] Category with no words (fallback to all)

### Performance
- [ ] 60fps during drag operations
- [ ] Smooth combine animations
- [ ] No memory leaks in drag loop
- [ ] Fast word loading between rounds

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/BlendBuilder.tsx`, `src/frontend/src/pages/VowelValley.tsx`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
