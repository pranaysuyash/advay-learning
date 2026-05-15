# Synonym Match

**Game ID:** synonym-match  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Manifest:** To be added to `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/SynonymMatch.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/synonymMatchLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** Match words that mean the same thing by connecting synonym pairs — like linking "happy" 😊 with "joyful" 🎉 to build vocabulary through playful discovery!
- **Genre:** Educational / Word Matching / Vocabulary Building
- **Target audience:** Ages 5-8, children developing reading comprehension and vocabulary breadth
- **Core player fantasy:** "I'm a word explorer discovering secret connections between words!"
- **Primary skill tested:** Synonym recognition, vocabulary expansion, reading comprehension, word relationships
- **Session length:** 5-8 minutes (6-10 word pairs per game)
- **Platform context:** Hand tracking CV game with drag-and-match mechanics for pairing words with similar meanings

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Similar matching pattern in `MemoryMatch.tsx` for pair-matching gameplay
  - Drag-and-drop infrastructure from WordBuilder and other games
  - Hand tracking via `useGameHandTracking`
  - TTS system for word pronunciation
  - Celebration and particle effects
  - Streak tracking from `useStreakTracking` hook
- **What is partial/missing:**
  - Main game component `SynonymMatch.tsx`
  - Game logic module `synonymMatchLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Synonym word bank with visual representations
  - Drag-to-match mechanics for synonym words
  - Connection visualization between pairs
  - Difficulty-based synonym complexity
- **Evidence:**
  - No file exists at `src/frontend/src/pages/SynonymMatch.tsx`
  - No file exists at `src/frontend/src/games/synonymMatchLogic.ts`
  - No registry entry found for "synonym-match"
  - Not referenced in any game catalog or audit
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (Easy: simple synonyms, Medium: grade-level, Hard: advanced vocabulary)
2. **Game Start:** Word cards scatter across the screen showing target words and their synonyms
3. **Gameplay Loop:**
   - Multiple word cards displayed with supporting emojis (e.g., "happy 😊", "joyful 🎉", "big", "large")
   - Player identifies synonym pairs (words with similar meanings)
   - Drag one word card onto its synonym using hand tracking
   - Successful match triggers connection animation
   - Words pronounced and meaning explained
   - Matched pairs move to "completed" area
   - Continue until all pairs matched
4. **Feedback:** Immediate visual and audio feedback on successful match
5. **Progression:** More challenging synonyms as difficulty increases
6. **Completion:** Score summary with pairs matched and rewards

### Controls
- **Hand drag:** Move hand to word card, pinch to grab, drag to synonym match
- **Hand tracking:** Index finger position for cursor
- **Pinch gesture:** Hold pinch to carry card, release to attempt match
- **Snap match:** Cards auto-connect when correct synonym is near
- **Touch/mouse:** Click-drag or tap card then tap target (fallback)
- **CV primary:** Full hand tracking with drag-and-match mechanics

### Mechanics
- **Word card generation:** Random selection from synonym pairs bank
- **Card positioning:** Scattered layout with sufficient spacing
- **Drag physics:** Card follows hand with slight smoothing
- **Match detection:** Detects when correct synonym cards overlap
- **Connection animation:** Visual line/link between matched pairs
- **Pair removal:** Matched cards animate to completed area
- **TTS pronunciation:** Both words spoken after successful match
- **Streak system:** Consecutive correct matches earn bonus points
- **Hint system:** Option to reveal a letter or synonym category

### Visuals/UI
- **Background:** Word garden theme with floating letters and vines
- **Word cards:** Colorful rounded cards with text and supporting emoji
- **Match visualization:** Animated vine/connection between paired words
- **Completed area:** Designated zone for successfully matched pairs
- **Glow effect:** Visual highlighting when correct cards approach
- **Progress tracker:** Pairs matched / total counter
- **Streak indicator:** Visual spark with consecutive count
- **Hint button:** Option to get help (with point penalty)

### Gaps/Issues
- No implementation exists to analyze
- Drag physics need tuning for satisfying feel
- Match detection radius needs balancing
- Need visual clarity for completed vs. remaining cards
- Consider accessibility for children with motor difficulties
- Synonym difficulty must align with reading levels

---

## 4. Intended Design

### Educational Goal
Develop vocabulary breadth and understanding of synonyms (words with similar meanings). Builds reading comprehension by teaching that multiple words can express the same concept.

### Pedagogical Approach
- **Associative learning:** Connect similar-meaning words physically
- **Visual reinforcement:** Emojis provide concrete representations of abstract words
- **Multisensory engagement:** Visual (cards), auditory (TTS), kinesthetic (dragging)
- **Conceptual understanding:** "Happy" means similar to "joyful" — they express the same feeling
- **Pattern recognition:** Learn to identify synonym relationships

### Difficulty Progression
| Level | Synonym Types | Examples | Visual Support |
|-------|---------------|----------|----------------|
| Easy | Common adjectives | happy/joyful, big/large, sad/unhappy | Full emoji support |
| Medium | Verbs and nouns | run/sprint, house/home, speak/talk | Emoji + context |
| Hard | Abstract concepts | beautiful/gorgeous, angry/furious | Minimal visual |
| Expert | Academic vocabulary | enormous/immense, rapid/swift | Word only |

### Accessibility
- **Visual:** Large word cards, clear emojis, high contrast colors
- **Auditory:** Both words pronounced on match
- **Motor:** Generous match radius, tap-to-move fallback
- **Cognitive:** Emoji support for emerging readers, no time pressure
- **Memory aid:** Cards remain visible (no flipping required)
- **Reading support:** Words grouped by reading difficulty level

### Engagement
- **Discovery satisfaction:** "Aha!" moment when synonyms connect
- **Visual reward:** Satisfying vine/connection animation growing between words
- **Collection element:** Matched pairs displayed in completed area
- **Streak excitement:** Multiplier for consecutive correct matches
- **Thematic consistency:** Word garden — words grow and bloom together!

### Core Loop
1. View scattered word cards with emojis
2. Identify synonym pair (e.g., "happy" and "joyful")
3. Grab first card with pinch gesture
4. Drag toward matching synonym card
5. Release to attempt match
6. See connection animation and hear pronunciation
7. Matched cards move to completed area
8. Continue until all pairs matched

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
- Satisfying vine/growth match animation
- Clear visual feedback
- Responsive hand tracking
- Engaging synonym word bank
- Proper difficulty progression aligned with reading levels
- Clear distinction from antonym games

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Four difficulty tiers:**
   - Easy: Common adjectives (happy/joyful, big/large)
   - Medium: Verbs and everyday nouns (run/sprint, house/home)
   - Hard: More expressive vocabulary (beautiful/gorgeous)
   - Expert: Academic/challenging synonyms (enormous/immense)

2. **Hand tracking drag-and-match:**
   - Pinch to grab word card
   - Drag toward potential match
   - Glow effect when correct synonym is near
   - Auto-match when cards overlap sufficiently

3. **Visual connection system:**
   - Animated vine/flower growing between matched pairs
   - Garden theme with blooming effects
   - Color-coded by match order (rainbow progression)

4. **Word bank by category:**
   - Feelings (happy/joyful, sad/unhappy, angry/mad)
   - Size (big/large, small/tiny, huge/enormous)
   - Speed (fast/quick, slow/sluggish)
   - Appearance (beautiful/pretty, ugly/unattractive)
   - Actions (run/sprint, walk/stroll, speak/talk)

5. **Scoring system:**
   - Base: 100 points per matched pair
   - Speed bonus: Up to 40 points
   - Streak multiplier: 1.2x at 3+, 1.5x at 6+
   - Hint penalty: -15 points per hint used

### Enhancements for Future Versions
1. **Sentence mode:** Use synonym words in sentences to show context
2. **Thesaurus expansion:** Unlock more synonyms as vocabulary grows
3. **Category challenge:** Match only from specific word category
4. **Word family mode:** Match words with same root (happy/happiness)
5. **Create pairs:** Build custom synonym sets

### Experimental Features
- **3D word garden:** Cards float in 3D space with growth animations
- **Voice confirmation:** Say "match!" to confirm selection
- **Story context:** Match synonyms that fit a story context
- **AR mode:** Cards appear on real surfaces with garden effects

---

## 7. Visual Identity

- **Overall look:** Lush word garden where matching words bloom and grow together
- **Camera view:** Full screen with scattered card layout
- **Art style:** Colorful garden theme with blooming flower accents
- **Mood:** Curious, growing, discovery-focused
- **Colors:**
  - Background: Soft garden green (#E8F5E9)
  - Card A (main word): Warm sunflower (#FFD54F)
  - Card B (synonym): Complementary petal pink (#F48FB1)
  - Match vine: Growing green (#66BB6A)
  - Completed area: Bloom gold (#FFB300)
  - Accent: Sky blue (#81D4FA)
- **Environment:** Abstract garden with floating petals and gentle vines
- **UI style:** Rounded cards with floral accents
- **Active vibe:** "Match the words that mean the same!" 🌸🔤

### Word Card Design
```
┌─────────────────┐     ┌─────────────────┐
│  ┌───────────┐  │     │  ┌───────────┐  │
│  │   HAPPY   │  │  ←→ │  │  JOYFUL   │  │
│  │    😊     │  │     │    🎉     │  │
│  │ (feeling) │  │     │ (feeling) │  │
│  └───────────┘  │     │  └───────────┘  │
└─────────────────┘     └─────────────────┘
        ↓                      ↓
   [Drag to connect synonyms!]
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Easy/Medium/Hard/Expert buttons, category selection |
| **Tutorial** | Learn drag controls | Animated hand demo, glow effect demo |
| **Gameplay** | Core experience | Word cards scattered, completed area, progress |
| **Match Animation** | Success moment | Vine growth, connection line, card movement |
| **Pair Reveal** | Show result | Connected pair, pronunciation, meaning explanation |
| **Level Complete** | Progress milestone | Stats, pairs matched, next level button |
| **Game Complete** | Final celebration | Total score, all pairs displayed, rewards |
| **Synonym Garden** | Collection view | All synonyms learned with visual pairs |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows hand |
| Grab word card | Pinch (index + thumb) | Card lifts with glow effect |
| Drag card | Move hand while pinching | Card follows smoothly |
| Attempt match | Drag near synonym card | Target glows green |
| Release | Release pinch | If correct match, vine grows |
| Tap to move (fallback) | Click card, click destination | Card animates to position |
| Hint | Click hint button | Category revealed (point penalty) |
| Hear words | Auto-play on match | TTS both words in pair |

### CV Control Details
- **Hand tracking:** Index finger tip position
- **Pinch threshold:** < 0.05 normalized distance
- **Grab detection:** Raycast from finger to card collider
- **Drag smoothing:** Lerp factor 0.2 for natural feel
- **Match radius:** 80px between card centers
- **Glow effect:** Target card glows green when correct synonym approaches

---

## 10. Core Mechanics

### Synonym Word Bank Structure
```typescript
interface SynonymPair {
  id: string;
  wordA: string;          // "happy"
  wordB: string;          // "joyful"
  emoji: string;          // 😊 (shared representation)
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'feelings' | 'size' | 'speed' | 'appearance' | 'actions';
  meaning?: string;       // "Full of joy and happiness"
}

const SYNONYM_PAIRS: SynonymPair[] = [
  { id: '1', wordA: 'happy', wordB: 'joyful', emoji: '😊', 
    difficulty: 'easy', category: 'feelings', meaning: 'Feeling good and pleased' },
  { id: '2', wordA: 'big', wordB: 'large', emoji: '🐘', 
    difficulty: 'easy', category: 'size', meaning: 'Taking up lots of space' },
  // ... more pairs
];
```

### Drag and Match Physics
```typescript
// Word card follows hand with smoothing
function updateCardPosition(
  card: WordCard,
  handPos: Vector2,
  isDragging: boolean
): void {
  if (isDragging) {
    card.x = lerp(card.x, handPos.x, 0.2);
    card.y = lerp(card.y, handPos.y, 0.2);
  }
}

// Check for match opportunity with glow effect
function checkMatchProximity(
  draggedCard: WordCard,
  otherCards: WordCard[]
): WordCard | null {
  for (const card of otherCards) {
    if (isSynonymPair(draggedCard, card)) {
      const distance = getDistance(draggedCard, card);
      if (distance < MATCH_RADIUS) {
        return card; // Return the matching card
      }
    }
  }
  return null;
}

// Apply glow effect to synonym cards
function applyGlowEffect(
  draggedCard: WordCard,
  allCards: WordCard[]
): void {
  for (const card of allCards) {
    if (isSynonymPair(draggedCard, card)) {
      const distance = getDistance(draggedCard, card);
      if (distance < GLOW_RADIUS) {
        const glowStrength = 1 - (distance / GLOW_RADIUS);
        card.glowIntensity = glowStrength;
        card.glowColor = '#66BB6A'; // Garden green
      }
    }
  }
}
```

### Match Animation Sequence
```typescript
async function animateMatch(cardA: WordCard, cardB: WordCard): Promise<void> {
  // Phase 1: Cards move together
  await animate({
    targets: [cardA, cardB],
    x: MATCH_CENTER_X,
    y: MATCH_CENTER_Y,
    duration: 250,
    easing: 'easeOutQuad'
  });
  
  // Phase 2: Vine/connection grows between cards
  growVineConnection(cardA, cardB);
  playBloomSound();
  triggerGlowPulse();
  
  // Phase 3: Pronounce both words
  speak(`${cardA.word}... ${cardB.word}`);
  await delay(500);
  speak("These words mean the same thing!");
  
  // Phase 4: Cards move to completed area with vine
  await animate({
    targets: [cardA, cardB],
    x: COMPLETED_AREA_X,
    y: COMPLETED_AREA_Y + (matchedCount * CARD_SPACING),
    scale: 0.8,
    duration: 400,
    easing: 'easeInOutQuad'
  });
  
  // Phase 5: Flower blooms on connection
  bloomFlower(cardA, cardB);
}
```

### Scoring Formula
```
Base Points: 100 per matched pair
Speed Bonus: max(0, 40 - timeTakenSeconds)
Streak Multiplier:
  - 1-2 pairs: 1.0x
  - 3-5 pairs: 1.2x
  - 6+ pairs: 1.5x
Hint Penalty: -15 per hint used

Total = (Base + Speed - HintPenalty) × StreakMultiplier
```

### Streak System
- Increments on each successful match
- Resets to 0 on incorrect match attempt
- Visual spark indicator with number
- Multiplier shown during score calculation
- Milestone celebration at 3, 5, and 8 streak

---

## 11. Rules

- **Start:** Select difficulty and category, click Start
- **Objective:** Match all synonym word pairs by dragging cards together
- **Allowed:**
  - Drag word cards freely
  - Release to attempt match when near synonym
  - Use hint button for category reveal (with point penalty)
  - Touch/mouse fallback available
  - Request word pronunciation on match
- **Restricted:**
  - Cannot match non-synonym cards (cards bounce)
  - Cannot skip pairs (must match all to complete)
  - Time does not penalize, but affects speed bonus
- **Scoring:** Based on speed + streak + hint usage
- **Wrong match:** Cards bounce apart with gentle feedback
- **Win condition:** Match all synonym pairs in the level

### Difficulty-Specific Rules
| Difficulty | Pairs | Emoji Support | Match Radius | Word Complexity |
|------------|-------|---------------|--------------|-----------------|
| Easy | 6 pairs | Full emoji | 100px | Common adjectives |
| Medium | 8 pairs | Emoji + text | 80px | Verbs and nouns |
| Hard | 10 pairs | Minimal emoji | 70px | Abstract concepts |
| Expert | 12 pairs | Text only | 60px | Academic vocabulary |

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Word Cards | Synonym word pairs to match | Each new round |
| Completed Area | Successfully matched pairs | After each match |
| Connection Vines | Visual links between pairs | After each match |
| Progress | Pairs matched / total | After each match |
| Score | Current points | After each match |
| Streak | Consecutive successful matches | On success |
| Hint Button | Reveal word category | On demand (penalty) |
| Timer | Time spent (for bonus calc) | Continuous |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 380    Pairs: 3 of 8        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐      ┌─────────┐      │
│  │  HAPPY  │      │   BIG   │      │
│  │    😊   │      │   🐘    │      │
│  └─────────┘      └─────────┘      │
│                                     │
│      [Drag matching words!]         │
│                                     │
│  ┌─────────┐      ┌─────────┐      │
│  │ JOYFUL  │      │  LARGE  │      │
│  │   🎉    │      │   🐘    │      │
│  └─────────┘      └─────────┘      │
│                                     │
├─────────────────────────────────────┤
│  ✓ Matched:                         │
│  [HAPPY😊-JOYFUL🎉] [BIG🐘-LARGE🐘]  │
├─────────────────────────────────────┤
│  🔥 Streak: 3     [Hint 💡]         │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Pair Matched)
- Satisfying "bloom" sound as cards connect
- Vine grows between cards with flower blooming
- Success chime sound
- Words pronounced: "Happy... Joyful!"
- Explanation spoken: "These words mean the same thing!"
- Cards glow green and move to completed area together
- Points float up with "+140" animation
- Streak counter increments with spark animation
- Haptic success pulse
- 1.5s celebration, then focus next pair

### Glow Approach Effect
- Subtle green glow when dragging near synonym
- Target card brightens when in match range
- "Pollen spark" particles between approaching synonyms
- Soft "garden breeze" sound intensifies as cards approach

### Failure (Wrong Match Attempt)
- Gentle "bounce" effect if cards don't match
- Incorrect cards briefly turn brown (wilted look)
- Soft "not a match" tone
- Voice: "Those don't mean the same thing, try again!"
- No streak penalty (encouragement-focused)

### Dragging State
- Card scales up 10% when grabbed
- Soft glow appears around card
- Smooth follow with natural weight feel
- Other cards subtly react to dragged card

### Streak Feedback
| Streak | Visual | Sound | Effect |
|--------|--------|-------|--------|
| 1-2 | Small spark | Standard | - |
| 3-5 | Flower bloom | Rising scale | 1.2x multiplier |
| 6-8 | Garden burst | Fanfare | 1.5x multiplier |
| 9+ | Rainbow bloom | Epic music | 1.5x + special badge |

### Milestone Celebrations
- **3 streak:** "Word Gardener!" badge
- **5 streak:** "Synonym Expert!" badge
- **8 streak:** "Vocabulary Master!" badge with rainbow effects
- **Level complete:** Garden blooms with flower explosion

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Pair | 100 points |
| Speed Bonus | Up to 40 points (faster = more) |
| Streak Multiplier | 1.0x → 1.2x → 1.5x |
| Hint Penalty | -15 per hint used |

### Example Score Calculation
```
Pair 1 (no hint, 8s): (100 + 20 + 0) × 1.0 = 120
Pair 2 (no hint, 6s): (100 + 25 + 0) × 1.0 = 125
Pair 3 (hint used, 5s): (100 + 30 - 15) × 1.2 = 138
Pair 4 (no hint, 7s): (100 + 22 + 0) × 1.2 = 146
Total: 529 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- `flower-item` (20% chance) - Thematic for garden game
- `book-blue` (15% chance) - Learning reward
- `star-silver` (12% chance) - Standard reward
- `creature-butterfly` (5% chance at 80%+ accuracy) - Garden creature

### Easter Eggs
- **Speed Matcher:** Match pair in under 2 seconds
  - Reward: Lightning Flower sticker
  - Hint: "Match at blooming speed!"
- **Perfect Memory:** Complete without using hints
  - Reward: Perfect Garden Badge
  - Hint: "No hints needed!"
- **Category Master:** Complete all pairs in single category
  - Reward: Category Flower Crown
  - Hint: "Master all synonyms in a category!"
- **Synonym Expert:** Complete Expert difficulty
  - Reward: Master Gardener Trophy
  - Hint: "Conquer the hardest synonyms!"

### Progression
- Synonym garden shows all pairs learned
- Categories unlock as you complete previous ones
- Personal best tracking per difficulty
- Mastery flowers for hint-free completions
- Total synonyms learned counter

---

## 15. End States

### Pair Matched Successfully
- Cards move together
- Vine grows with flower bloom animation
- Success chime sound
- Both words pronounced via TTS
- Meaning explanation spoken
- Score calculated and displayed
- Streak incremented
- Cards move to completed area
- 1.5s celebration, then focus next pair

### Level Complete
- Level stats displayed (pairs matched, accuracy, score)
- All matched pairs displayed with vine connections
- Category progress updated
- Bonus points for completion
- Unlock notification (if applicable)
- Option to continue or view garden

### Game Complete
- Final score with breakdown
- Total pairs matched
- Rewards earned display
- Synonym garden view option
- Category completion status
- Play Again / Change Difficulty / Exit

### Early Exit
- Progress saved up to current pair
- Partial rewards based on completion percentage
- Return to menu with option to resume

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking Drag-and-Match)
Full hand tracking with pinch-to-grab and garden-themed match mechanics as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click/tap card, then click destination
- No drag required
- Same vine/growth match feedback
- Accessible for all devices

### Mode C: Memory Mode
- Cards start face-down
- Flip cards to reveal words
- Remember positions to find synonyms
- Memory + synonym recognition challenge
- Higher difficulty variant

### Mode D: Timed Challenge
- Race against clock to match all pairs
- Time limit for entire level
- Bonus points for remaining time
- Fast-paced variant for advanced players

### Mode E: Category Focus
- Only synonyms from single category
- Deep dive into specific synonym types
- Category mastery challenge

### Mode F: Sentence Mode
- Words appear in sentence context
- "The ____ child smiled" → match with "happy"
- Contextual synonym understanding

---

## 17. Improvement Opportunities

### Low Cost
- Add more synonym pairs (target: 80+)
- Match sound variations (different flower sounds)
- Background music (gentle garden theme)
- Achievement badges for milestones
- Word pronunciation speed options
- Category filtering in garden

### Medium Effort
- Memory mode (face-down cards)
- Custom synonym pair creator
- Sentence building with synonym words
- Difficulty fine-tuning per pair
- Multiplayer racing mode
- Visual theme customization (seasons)

### Ambitious
- AI-generated synonym validation
- User-created pair sharing
- AR mode with garden visualization
- Multi-language synonym support
- Integration with reading curriculum
- Parent/teacher progress dashboard
- Word origin stories

---

## 18. Content Model

### Synonym Pair Data Structure
```typescript
interface SynonymPair {
  id: string;
  wordA: string;
  wordB: string;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'feelings' | 'size' | 'speed' | 'appearance' | 'actions' | 'intensity';
  meaning: string;
}

// Synonym word bank
const SYNONYM_PAIRS: SynonymPair[] = [
  // Easy - Feelings
  { id: '1', wordA: 'happy', wordB: 'joyful', emoji: '😊', 
    difficulty: 'easy', category: 'feelings', meaning: 'Feeling good and pleased' },
  { id: '2', wordA: 'sad', wordB: 'unhappy', emoji: '😢', 
    difficulty: 'easy', category: 'feelings', meaning: 'Feeling down or sorrowful' },
  { id: '3', wordA: 'angry', wordB: 'mad', emoji: '😠', 
    difficulty: 'easy', category: 'feelings', meaning: 'Feeling upset or annoyed' },
  { id: '4', wordA: 'scared', wordB: 'afraid', emoji: '😨', 
    difficulty: 'easy', category: 'feelings', meaning: 'Feeling frightened' },
  
  // Easy - Size
  { id: '5', wordA: 'big', wordB: 'large', emoji: '🐘', 
    difficulty: 'easy', category: 'size', meaning: 'Taking up lots of space' },
  { id: '6', wordA: 'small', wordB: 'little', emoji: '🐭', 
    difficulty: 'easy', category: 'size', meaning: 'Not taking up much space' },
  { id: '7', wordA: 'tiny', wordB: 'mini', emoji: '🐜', 
    difficulty: 'easy', category: 'size', meaning: 'Very small' },
  
  // Easy - Speed
  { id: '8', wordA: 'fast', wordB: 'quick', emoji: '⚡', 
    difficulty: 'easy', category: 'speed', meaning: 'Moving rapidly' },
  { id: '9', wordA: 'slow', wordB: 'sluggish', emoji: '🐢', 
    difficulty: 'medium', category: 'speed', meaning: 'Moving at low speed' },
  
  // Medium - Actions
  { id: '10', wordA: 'run', wordB: 'sprint', emoji: '🏃', 
    difficulty: 'medium', category: 'actions', meaning: 'Moving quickly on feet' },
  { id: '11', wordA: 'walk', wordB: 'stroll', emoji: '🚶', 
    difficulty: 'medium', category: 'actions', meaning: 'Moving at a leisurely pace' },
  { id: '12', wordA: 'speak', wordB: 'talk', emoji: '🗣️', 
    difficulty: 'easy', category: 'actions', meaning: 'Communicating verbally' },
  { id: '13', wordA: 'look', wordB: 'gaze', emoji: '👀', 
    difficulty: 'medium', category: 'actions', meaning: 'Directing eyes toward something' },
  
  // Medium - Appearance
  { id: '14', wordA: 'beautiful', wordB: 'pretty', emoji: '✨', 
    difficulty: 'medium', category: 'appearance', meaning: 'Pleasing to look at' },
  { id: '15', wordA: 'ugly', wordB: 'unattractive', emoji: '😕', 
    difficulty: 'hard', category: 'appearance', meaning: 'Not pleasing to look at' },
  
  // Hard - Intensity
  { id: '16', wordA: 'big', wordB: 'huge', emoji: '🏔️', 
    difficulty: 'medium', category: 'intensity', meaning: 'Very large in size' },
  { id: '17', wordA: 'happy', wordB: 'ecstatic', emoji: '🤩', 
    difficulty: 'hard', category: 'intensity', meaning: 'Extremely happy' },
  { id: '18', wordA: 'sad', wordB: 'devastated', emoji: '💔', 
    difficulty: 'hard', category: 'intensity', meaning: 'Extremely sad' },
  
  // Hard - Abstract
  { id: '19', wordA: 'smart', wordB: 'intelligent', emoji: '🧠', 
    difficulty: 'hard', category: 'feelings', meaning: 'Having mental sharpness' },
  { id: '20', wordA: 'tired', wordB: 'exhausted', emoji: '😴', 
    difficulty: 'medium', category: 'feelings', meaning: 'Needing rest or sleep' },
  
  // Expert
  { id: '21', wordA: 'enormous', wordB: 'immense', emoji: '🌌', 
    difficulty: 'expert', category: 'size', meaning: 'Extremely large' },
  { id: '22', wordA: 'rapid', wordB: 'swift', emoji: '🚀', 
    difficulty: 'expert', category: 'speed', meaning: 'Very fast' },
  { id: '23', wordA: 'gorgeous', wordB: 'stunning', emoji: '💎', 
    difficulty: 'expert', category: 'appearance', meaning: 'Extremely beautiful' },
  { id: '24', wordA: 'furious', wordB: 'livid', emoji: '😤', 
    difficulty: 'expert', category: 'intensity', meaning: 'Extremely angry' },
];
```

### Level Configuration
```typescript
interface LevelConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  pairCount: number;
  categories: string[];
  matchRadius: number;
  showMeaning: boolean;
  emojiSupport: 'full' | 'partial' | 'none';
}

const LEVELS: LevelConfig[] = [
  { difficulty: 'easy', pairCount: 6, categories: ['feelings', 'size'], matchRadius: 100, showMeaning: true, emojiSupport: 'full' },
  { difficulty: 'medium', pairCount: 8, categories: ['feelings', 'size', 'actions'], matchRadius: 80, showMeaning: true, emojiSupport: 'partial' },
  { difficulty: 'hard', pairCount: 10, categories: ['all'], matchRadius: 70, showMeaning: false, emojiSupport: 'partial' },
  { difficulty: 'expert', pairCount: 12, categories: ['all'], matchRadius: 60, showMeaning: false, emojiSupport: 'none' },
];
```

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `SynonymMatch.tsx` | Main React component | 400-500 |
| `synonymMatchLogic.ts` | Pure game logic functions | 250-300 |
| `synonymMatch.types.ts` | TypeScript interfaces | 60-80 |
| `synonymPairsBank.ts` | Word pair data | 150-200 |

### Key Components in SynonymMatch.tsx
- `SynonymMatchContent` - Core game implementation
- `SynonymMatch` (default) - GameShell wrapper
- `WordCard` - Draggable word card component
- `CompletedArea` - Zone for matched pairs
- `VineConnection` - Visual vine link between matches
- `GardenBackground` - Themed background with floating petals
- `SynonymGarden` - Collection view component
- `HandCursor` - Custom cursor with grab states

### Logic Functions (synonymMatchLogic.ts)
| Function | Purpose |
|----------|---------|
| `getPairsForLevel()` | Select appropriate pairs for difficulty |
| `createWordCards()` | Initialize card positions scattered |
| `updateCardDrag()` | Handle drag physics |
| `checkMatchProximity()` | Detect when cards should match |
| `isSynonymPair()` | Verify if two cards are synonyms |
| `animateMatch()` | Trigger match sequence |
| `calculateScore()` | Compute pair score |
| `applyGlowEffect()` | Highlight matching cards |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Word pronunciation and explanations
- `useStreakTracking` - Streak management

### State Management
```typescript
interface GameState {
  cards: WordCard[];
  matchedPairs: MatchedPair[];
  score: number;
  streak: number;
  pairsMatched: number;
  totalPairs: number;
  gameStatus: 'menu' | 'playing' | 'matching' | 'complete';
  draggedCard: WordCard | null;
  isDragging: boolean;
  hintCount: number;
  handPosition: { x: number; y: number };
  isPinching: boolean;
}
```

### Dependencies
- MediaPipe hand tracking
- Framer Motion for animations
- Canvas or DOM for card rendering
- TTS engine for pronunciation

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Optimal drag smoothing | 0.2 lerp factor | Medium |
| Match radius size | 80px default | Medium |
| Word bank size needed | 40+ pairs minimum | High |
| Glow effect intensity | 0.7 opacity max | Low |
| Hint penalty balance | -15 points feels fair | Medium |
| Word card size | 120px for readability | High |
| Match animation timing | 250ms move + 400ms vine | Medium |
| Accessibility for motor disabilities | Tap-to-move fallback | High |

---

## 21. Implementation Notes

### Strengths to Build On
- MemoryMatch provides pair-matching patterns
- Hand tracking drag infrastructure exists
- TTS provides excellent word reinforcement
- Streak tracking system available
- BlendBuilder shows word-building patterns
- VowelValley demonstrates zone-based gameplay

### Architecture Patterns
- Separate drag physics from rendering
- Use refs for drag position (avoid React state during drag)
- Debounce match detection
- Animate layout changes with Framer Motion
- Use GameShell for consistent game wrapper

### Testing Considerations
- Test drag feel with various hand sizes
- Verify match detection at screen edges
- Test word bank randomization (no repeats)
- Validate with target age group for difficulty
- Test glow effect doesn't distract from gameplay

### Performance Notes
- Limit animated elements during drag
- Optimize hit detection
- Lazy load card images
- Preload audio for upcoming words

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes with cursor visible
- [ ] Pinch gesture grabs word cards accurately
- [ ] Cards drag smoothly with hand movement
- [ ] Match detection works within radius
- [ ] Glow effect activates when correct synonyms approach
- [ ] Match animation plays successfully
- [ ] Vine connection grows between matched cards
- [ ] Both words pronounced via TTS after match
- [ ] Meaning explanation spoken after match (if enabled)
- [ ] Four difficulty levels work
- [ ] Word bank provides appropriate synonym pairs
- [ ] Hint button reveals category with penalty
- [ ] Score calculates with bonuses and multipliers
- [ ] Streak multiplier applies correctly
- [ ] Touch/mouse fallback works
- [ ] Synonym garden tracks learned pairs
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, match all pairs
- [ ] Play medium mode, verify reduced match radius
- [ ] Play hard mode, verify no meanings shown
- [ ] Play expert mode, verify text-only cards
- [ ] Test drag with both cards in a pair
- [ ] Build 5+ streak, verify multiplier
- [ ] Use hint, verify point deduction
- [ ] Complete level, verify progress tracking
- [ ] View synonym garden, verify all pairs recorded

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Pinch grabs word card consistently
- [ ] Drag follows hand smoothly
- [ ] Match triggers at correct distance
- [ ] Glow effect activates appropriately
- [ ] Release places card accurately
- [ ] No hand = safe state

### Fallback Tests
- [ ] Tap card then tap destination works
- [ ] Click-drag with mouse works
- [ ] Touch drag works on tablet
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid grab/release (no crash)
- [ ] Drag off-screen (clamping)
- [ ] Multiple rapid matches (throttling)
- [ ] Hand lost mid-drag (card returns)
- [ ] Word bank exhausted (loop or end)
- [ ] Category with no pairs (fallback to all)

### Performance
- [ ] 60fps during drag operations
- [ ] Smooth match animations
- [ ] No memory leaks in drag loop
- [ ] Fast card loading between rounds

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/MemoryMatch.tsx`, `src/frontend/src/pages/WordBuilder.tsx`
- Opposites Game: `docs/games/specs/opposites-attract.md`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- Streak System: `src/frontend/src/hooks/useStreakTracking.ts`
