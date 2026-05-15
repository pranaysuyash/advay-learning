# Opposites Attract

**Game ID:** opposites-attract  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Manifest:** To be added to `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/OppositesAttract.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/oppositesAttractLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** Match opposite word pairs by dragging them together — like connecting "hot" 🔥 with "cold" ❄️ to learn antonyms through play!
- **Genre:** Educational / Word Matching / Vocabulary Building
- **Target audience:** Ages 4-7, children developing vocabulary and conceptual understanding
- **Core player fantasy:** "I'm a word matcher discovering how opposites attract and complete each other!"
- **Primary skill tested:** Antonym recognition, vocabulary development, conceptual relationships, memory
- **Session length:** 5-8 minutes (6-10 word pairs per game)
- **Platform context:** Hand tracking CV game with drag-and-match mechanics for pairing opposite concepts

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
  - Main game component `OppositesAttract.tsx`
  - Game logic module `oppositesAttractLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Antonym word bank with visual pairs
  - Drag-to-match mechanics for opposite words
  - Connection visualization between pairs
- **Evidence:**
  - No file exists at `src/frontend/src/pages/OppositesAttract.tsx`
  - No file exists at `src/frontend/src/games/oppositesAttractLogic.ts`
  - No registry entry found for "opposites-attract"
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (Easy: concrete opposites, Medium: abstract, Hard: challenging)
2. **Game Start:** Word cards scatter across the screen
3. **Gameplay Loop:**
   - Multiple word cards displayed with emojis (e.g., "hot 🔥", "cold ❄️", "big", "small")
   - Player identifies opposite pairs
   - Drag one word card onto its opposite using hand
   - Successful match triggers connection animation
   - Words pronounced and concept explained
   - Matched pairs move to "completed" area
   - Continue until all pairs matched
4. **Feedback:** Immediate visual and audio feedback on successful match
5. **Progression:** More challenging antonyms as difficulty increases
6. **Completion:** Score summary with pairs matched and rewards

### Controls
- **Hand drag:** Move hand to word card, pinch to grab, drag to opposite
- **Hand tracking:** Index finger position for cursor
- **Pinch gesture:** Hold pinch to carry card, release to attempt match
- **Snap match:** Cards auto-connect when correct opposite is near
- **Touch/mouse:** Click-drag or tap card then tap target (fallback)
- **CV primary:** Full hand tracking with drag-and-match mechanics

### Mechanics
- **Word card generation:** Random selection from antonym pairs bank
- **Card positioning:** Scattered layout with sufficient spacing
- **Drag physics:** Card follows hand with slight smoothing
- **Match detection:** Detects when correct opposite cards overlap
- **Connection animation:** Visual line/link between matched pairs
- **Pair removal:** Matched cards animate to completed area
- **TTS pronunciation:** Both words spoken after successful match
- **Streak system:** Consecutive correct matches earn bonus points
- **Shuffle option:** Ability to reshuffle remaining cards if stuck

### Visuals/UI
- **Background:** Playful magnetic field theme with attraction lines
- **Word cards:** Colorful rounded cards with large text and emoji
- **Match visualization:** Animated connection line between pairs
- **Completed area:** Designated zone for successfully matched pairs
- **Magnetic effect:** Visual attraction when correct cards approach
- **Progress tracker:** Pairs matched / total counter
- **Streak indicator:** Visual spark with consecutive count
- **Shuffle button:** Option to rearrange remaining cards

### Gaps/Issues
- No implementation exists to analyze
- Drag physics need tuning for satisfying feel
- Match detection radius needs balancing
- Need visual clarity for completed vs. remaining cards
- Consider accessibility for children with motor difficulties

---

## 4. Intended Design

### Educational Goal
Develop vocabulary and understanding of antonyms (opposite words). Builds conceptual thinking by teaching relationships between contrasting ideas.

### Pedagogical Approach
- **Associative learning:** Connect opposite concepts physically
- **Visual reinforcement:** Emojis provide concrete representations
- **Multisensory engagement:** Visual (cards), auditory (TTS), kinesthetic (dragging)
- **Conceptual understanding:** "Hot" is opposite of "cold" — they contrast
- **Pattern recognition:** Learn to identify opposite relationships

### Difficulty Progression
| Level | Opposite Types | Examples | Visual Support |
|-------|---------------|----------|----------------|
| Easy | Concrete sensory | hot/cold, big/small, happy/sad | Full emoji pairs |
| Medium | Action opposites | open/close, up/down, fast/slow | Emoji + context |
| Hard | Abstract concepts | always/never, everything/nothing | Minimal visual |
| Expert | Complex antonyms | early/late, remember/forget | Word only |

### Accessibility
- **Visual:** Large word cards, clear emojis, high contrast colors
- **Auditory:** Both words pronounced on match
- **Motor:** Generous match radius, tap-to-move fallback
- **Cognitive:** Emoji support for pre-readers, no time pressure
- **Memory aid:** Cards remain visible (no flipping required)

### Engagement
- **Discovery satisfaction:** "Aha!" moment when opposites connect
- **Visual reward:** Satisfying magnetic connection animation
- **Collection element:** Matched pairs displayed in completed area
- **Streak excitement:** Multiplier for consecutive correct matches
- **Thematic consistency:** Magnetic attraction — opposites attract!

### Core Loop
1. View scattered word cards with emojis
2. Identify opposite pair (e.g., "hot" and "cold")
3. Grab first card with pinch gesture
4. Drag toward opposite card
5. Release to attempt match (magnetic snap)
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
- Satisfying magnetic match animation
- Clear visual feedback
- Responsive hand tracking
- Engaging antonym word bank
- Proper difficulty progression

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Four difficulty tiers:**
   - Easy: Concrete sensory opposites with strong visuals
   - Medium: Action and descriptive opposites
   - Hard: More abstract conceptual opposites
   - Expert: Challenging vocabulary antonyms

2. **Hand tracking drag-and-match:**
   - Pinch to grab word card
   - Drag toward potential match
   - Magnetic attraction when correct opposite is near
   - Auto-match when cards overlap sufficiently

3. **Visual connection system:**
   - Animated line between matched pairs
   - Magnetic field visualization
   - Color-coded by match order (rainbow progression)

4. **Word bank by category:**
   - Sensory (hot/cold, loud/quiet, light/dark)
   - Size (big/small, tall/short, huge/tiny)
   - Actions (open/close, start/stop, give/take)
   - Concepts (always/never, same/different, before/after)

5. **Scoring system:**
   - Base: 100 points per matched pair
   - Speed bonus: Up to 40 points
   - Streak multiplier: 1.2x at 3+, 1.5x at 6+
   - Shuffle penalty: -10 points per shuffle used

### Enhancements for Future Versions
1. **Memory mode:** Cards flipped, remember positions to match
2. **Speed mode:** Race against clock to match all pairs
3. **Sentence mode:** Use opposite words in sentences
4. **Category challenge:** Match only from specific category
5. **Create pairs:** Build custom opposite word sets

### Experimental Features
- **3D mode:** Cards float in 3D magnetic field
- **Voice confirmation:** Say "match!" to confirm selection
- **Emotion teaching:** Match feelings with appropriate responses
- **AR mode:** Cards appear on real surfaces with magnetic effects

---

## 7. Visual Identity

- **Overall look:** Playful magnetic field where opposite words attract like magnets
- **Camera view:** Full screen with scattered card layout
- **Art style:** Colorful magnetic cards with emoji accents
- **Mood:** Curious, satisfying, discovery-focused
- **Colors:**
  - Background: Soft magnetic field blue (#E3F2FD)
  - Card A (positive): Warm red-orange (#FF7043)
  - Card B (opposite): Cool blue-cyan (#29B6F6)
  - Match line: Electric purple (#9C27B0)
  - Completed area: Success green (#81C784)
  - Accent: Magnetic silver (#B0BEC5)
- **Environment:** Abstract magnetic field with attraction lines
- **UI style:** Rounded cards with magnetic "poles" visual
- **Active vibe:** "Match the opposites!" 🧲🔤

### Word Card Design
```
┌─────────────────┐     ┌─────────────────┐
│  ┌───────────┐  │     │  ┌───────────┐  │
│  │   HOT     │  │  ←→ │  │   COLD    │  │
│  │    🔥     │  │     │    ❄️     │  │
│  │  (warm)   │  │     │  (cool)   │  │
│  └───────────┘  │     │  └───────────┘  │
└─────────────────┘     └─────────────────┘
        ↓                      ↓
   [Drag to connect opposites!]
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Easy/Medium/Hard/Expert buttons, category selection |
| **Tutorial** | Learn drag controls | Animated hand demo, magnetic attraction demo |
| **Gameplay** | Core experience | Word cards scattered, completed area, progress |
| **Match Animation** | Success moment | Magnetic snap, connection line, card movement |
| **Pair Reveal** | Show result | Connected pair, pronunciation, explanation |
| **Level Complete** | Progress milestone | Stats, pairs matched, next level button |
| **Game Complete** | Final celebration | Total score, all pairs displayed, rewards |
| **Opposites Journal** | Collection view | All opposites learned with visual pairs |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows hand |
| Grab word card | Pinch (index + thumb) | Card lifts with magnetic glow |
| Drag card | Move hand while pinching | Card follows smoothly |
| Attempt match | Drag near opposite card | Magnetic pull effect |
| Release | Release pinch | If correct match, snap together |
| Tap to move (fallback) | Click card, click destination | Card animates to position |
| Shuffle | Click shuffle button | Remaining cards rearrange |
| Hear words | Auto-play on match | TTS both words in pair |

### CV Control Details
- **Hand tracking:** Index finger tip position
- **Pinch threshold:** < 0.05 normalized distance
- **Grab detection:** Raycast from finger to card collider
- **Drag smoothing:** Lerp factor 0.2 for magnetic feel
- **Match radius:** 80px between card centers
- **Magnetic effect:** Cards pull together when correct opposites approach

---

## 10. Core Mechanics

### Antonym Word Bank Structure
```typescript
interface OppositePair {
  id: string;
  wordA: string;          // "hot"
  wordB: string;          // "cold"
  emojiA: string;         // 🔥
  emojiB: string;         // ❄️
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'sensory' | 'size' | 'action' | 'concept';
  explanation?: string;   // "Hot and cold are opposite temperatures"
}

const OPPOSITE_PAIRS: OppositePair[] = [
  { id: '1', wordA: 'hot', wordB: 'cold', emojiA: '🔥', emojiB: '❄️', 
    difficulty: 'easy', category: 'sensory', explanation: 'Hot and cold are opposite temperatures' },
  { id: '2', wordA: 'big', wordB: 'small', emojiA: '🐘', emojiB: '🐁', 
    difficulty: 'easy', category: 'size', explanation: 'Big and small are opposite sizes' },
  // ... more pairs
];
```

### Drag and Match Physics
```typescript
// Word card follows hand with magnetic smoothing
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

// Check for match opportunity with magnetic attraction
function checkMatchProximity(
  draggedCard: WordCard,
  otherCards: WordCard[]
): WordCard | null {
  for (const card of otherCards) {
    if (isOppositePair(draggedCard, card)) {
      const distance = getDistance(draggedCard, card);
      if (distance < MATCH_RADIUS) {
        return card; // Return the matching card
      }
    }
  }
  return null;
}

// Apply magnetic pull to opposite cards
function applyMagneticAttraction(
  draggedCard: WordCard,
  allCards: WordCard[]
): void {
  for (const card of allCards) {
    if (isOppositePair(draggedCard, card)) {
      const distance = getDistance(draggedCard, card);
      if (distance < MAGNETIC_FIELD_RADIUS) {
        const pullStrength = 1 - (distance / MAGNETIC_FIELD_RADIUS);
        card.x = lerp(card.x, draggedCard.x, pullStrength * 0.15);
        card.y = lerp(card.y, draggedCard.y, pullStrength * 0.15);
        card.glowIntensity = pullStrength;
      }
    }
  }
}
```

### Match Animation Sequence
```typescript
async function animateMatch(cardA: WordCard, cardB: WordCard): Promise<void> {
  // Phase 1: Magnetic snap together
  await animate({
    targets: [cardA, cardB],
    x: MATCH_CENTER_X,
    y: MATCH_CENTER_Y,
    duration: 250,
    easing: 'easeOutElastic'
  });
  
  // Phase 2: Connection line appears
  drawConnectionLine(cardA, cardB);
  playMatchSound();
  triggerMagneticGlow();
  
  // Phase 3: Pronounce both words
  speak(`${cardA.word}... ${cardB.word}`);
  await delay(500);
  
  // Phase 4: Cards move to completed area
  await animate({
    targets: [cardA, cardB],
    x: COMPLETED_AREA_X,
    y: COMPLETED_AREA_Y + (matchedCount * CARD_SPACING),
    scale: 0.8,
    duration: 400,
    easing: 'easeInOutQuad'
  });
  
  // Phase 5: Connection line remains visible
  maintainConnectionLine(cardA, cardB);
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
Shuffle Penalty: -10 per shuffle used

Total = (Base + Speed - ShufflePenalty) × StreakMultiplier
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
- **Objective:** Match all opposite word pairs by dragging cards together
- **Allowed:**
  - Drag word cards freely
  - Release to attempt match when near opposite
  - Use shuffle button to rearrange (with point penalty)
  - Touch/mouse fallback available
  - Request word pronunciation on match
- **Restricted:**
  - Cannot match non-opposite cards (cards repel)
  - Cannot skip pairs (must match all to complete)
  - Time does not penalize, but affects speed bonus
- **Scoring:** Based on speed + streak + shuffle usage
- **Wrong match:** Cards bounce apart with gentle feedback
- **Win condition:** Match all opposite pairs in the level

### Difficulty-Specific Rules
| Difficulty | Pairs | Emoji Support | Match Radius |
|------------|-------|---------------|--------------|
| Easy | 6 pairs | Full emoji | 100px |
| Medium | 8 pairs | Emoji + text | 80px |
| Hard | 10 pairs | Minimal emoji | 70px |
| Expert | 12 pairs | Text only | 60px |

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Word Cards | Opposite word pairs to match | Each new round |
| Completed Area | Successfully matched pairs | After each match |
| Connection Lines | Visual links between pairs | After each match |
| Progress | Pairs matched / total | After each match |
| Score | Current points | After each match |
| Streak | Consecutive successful matches | On success |
| Shuffle Button | Rearrange remaining cards | On demand |
| Timer | Time spent (for bonus calc) | Continuous |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 380    Pairs: 3 of 8        │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐      ┌─────────┐      │
│  │   HOT   │      │   BIG   │      │
│  │    🔥   │      │   🐘    │      │
│  └─────────┘      └─────────┘      │
│                                     │
│      [Drag opposites together!]     │
│                                     │
│  ┌─────────┐      ┌─────────┐      │
│  │  COLD   │      │  SMALL  │      │
│  │   ❄️    │      │   🐁    │      │
│  └─────────┘      └─────────┘      │
│                                     │
├─────────────────────────────────────┤
│  ✓ Matched:                         │
│  [HOT🔥-COLD❄️] [BIG🐘-SMALL🐁]     │
├─────────────────────────────────────┤
│  🔥 Streak: 3     [Shuffle 🔄]      │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Pair Matched)
- Satisfying "magnetic click" as cards connect
- Electric connection line animates between cards
- Success chime sound
- Words pronounced: "Hot... Cold!"
- Explanation spoken: "Hot and cold are opposites!"
- Cards glow and move to completed area together
- Points float up with "+140" animation
- Streak counter increments with spark animation
- Haptic success pulse
- Next pair focus after 1.5s

### Magnetic Attraction Effect
- Subtle pull sensation when dragging near opposite
- Target card glows purple when in magnetic range
- "Electric spark" particles between approaching opposites
- Soft "magnetic hum" sound intensifies as cards approach

### Failure (Wrong Match Attempt)
- Gentle "repel" effect if cards don't match
- Incorrect cards briefly turn red
- Soft "not a match" tone
- Voice: "Those aren't opposites, try again!"
- No streak penalty (encouragement-focused)

### Dragging State
- Card scales up 10% when grabbed
- Magnetic field glow appears around card
- Smooth follow with magnetic weight feel
- Other cards subtly react to dragged card's "field"

### Streak Feedback
| Streak | Visual | Sound | Effect |
|--------|--------|-------|--------|
| 1-2 | Small spark | Standard | - |
| 3-5 | Electric arc | Rising scale | 1.2x multiplier |
| 6-8 | Lightning bolt | Fanfare | 1.5x multiplier |
| 9+ | Plasma glow | Epic music | 1.5x + special badge |

### Milestone Celebrations
- **3 streak:** "Magnetic Master!" badge
- **5 streak:** "Opposites Expert!" badge
- **8 streak:** "Attraction Pro!" badge with lightning effects
- **Level complete:** Magnetic field explosion with summary

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Pair | 100 points |
| Speed Bonus | Up to 40 points (faster = more) |
| Streak Multiplier | 1.0x → 1.2x → 1.5x |
| Shuffle Penalty | -10 per shuffle used |

### Example Score Calculation
```
Pair 1 (no shuffle, 8s): (100 + 20 + 0) × 1.0 = 120
Pair 2 (no shuffle, 6s): (100 + 25 + 0) × 1.0 = 125
Pair 3 (shuffle used, 5s): (100 + 30 - 10) × 1.2 = 144
Pair 4 (no shuffle, 7s): (100 + 22 + 0) × 1.2 = 146
Total: 535 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- `magnet-item` (20% chance) - Thematic for magnetic game
- `star-silver` (15% chance) - Standard reward
- `book-blue` (10% chance) - Learning reward
- `creature-owl` (5% chance at 80%+ accuracy) - Wisdom symbol

### Easter Eggs
- **Speed Matcher:** Match pair in under 2 seconds
  - Reward: Lightning Bolt sticker
  - Hint: "Match at lightning speed!"
- **Perfect Memory:** Complete without using shuffle
  - Reward: Perfect Memory Badge
  - Hint: "No reshuffling needed!"
- **Category Master:** Complete all pairs in single category
  - Reward: Category Trophy
  - Hint: "Master all opposites in a category!"
- **Opposite Expert:** Complete Expert difficulty
  - Reward: Master Magnet
  - Hint: "Conquer the hardest opposites!"

### Progression
- Opposites journal shows all pairs learned
- Categories unlock as you complete previous ones
- Personal best tracking per difficulty
- Mastery stars for shuffle-free completions
- Total opposites learned counter

---

## 15. End States

### Pair Matched Successfully
- Magnetic snap animation plays
- Connection line draws between cards
- Both words pronounced via TTS
- Explanation spoken
- Score calculated and displayed
- Streak incremented
- Cards move to completed area
- 1.5s celebration, then focus next pair

### Level Complete
- Level stats displayed (pairs matched, accuracy, score)
- All matched pairs displayed with connection lines
- Category progress updated
- Bonus points for completion
- Unlock notification (if applicable)
- Option to continue or review journal

### Game Complete
- Final score with breakdown
- Total pairs matched
- Rewards earned display
- Opposites journal view option
- Category completion status
- Play Again / Change Difficulty / Exit

### Early Exit
- Progress saved up to current pair
- Partial rewards based on completion percentage
- Return to menu with option to resume

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking Drag-and-Match)
Full hand tracking with pinch-to-grab and magnetic match mechanics as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click/tap card, then click destination
- No drag required
- Same magnetic match feedback
- Accessible for all devices

### Mode C: Memory Mode
- Cards start face-down
- Flip cards to reveal words
- Remember positions to find opposites
- Memory + antonym recognition challenge
- Higher difficulty variant

### Mode D: Timed Challenge
- Race against clock to match all pairs
- Time limit for entire level
- Bonus points for remaining time
- Fast-paced variant for advanced players

### Mode E: Category Focus
- Only opposites from single category
- Deep dive into specific opposite types
- Category mastery challenge

### Mode F: Cooperative Mode
- Two players work together
- Each player controls half the cards
- Communication required to find matches
- Shared score and celebration

---

## 17. Improvement Opportunities

### Low Cost
- Add more opposite pairs (target: 80+)
- Match sound variations
- Background music (magical/magnetic theme)
- Achievement badges for milestones
- Word pronunciation speed options
- Category filtering in journal

### Medium Effort
- Memory mode (face-down cards)
- Custom opposite pair creator
- Sentence building with opposite words
- Difficulty fine-tuning per pair
- Multiplayer racing mode
- Visual theme customization

### Ambitious
- AI-generated opposite word validation
- User-created pair sharing
- AR mode with magnetic field visualization
- Multi-language opposite word support
- Integration with reading curriculum
- Parent/teacher progress dashboard
- Emotion teaching with opposite feelings

---

## 18. Content Model

### Opposite Pair Data Structure
```typescript
interface OppositePair {
  id: string;
  wordA: string;
  wordB: string;
  emojiA: string;
  emojiB: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: 'sensory' | 'size' | 'action' | 'concept' | 'time' | 'direction';
  explanation: string;
}

// Opposite word bank
const OPPOSITE_PAIRS: OppositePair[] = [
  // Easy - Sensory
  { id: '1', wordA: 'hot', wordB: 'cold', emojiA: '🔥', emojiB: '❄️', 
    difficulty: 'easy', category: 'sensory', explanation: 'Hot and cold are opposite temperatures' },
  { id: '2', wordA: 'loud', wordB: 'quiet', emojiA: '🔊', emojiB: '🔇', 
    difficulty: 'easy', category: 'sensory', explanation: 'Loud and quiet are opposite sounds' },
  { id: '3', wordA: 'light', wordB: 'dark', emojiA: '💡', emojiB: '🌑', 
    difficulty: 'easy', category: 'sensory', explanation: 'Light and dark are opposite brightness' },
  { id: '4', wordA: 'happy', wordB: 'sad', emojiA: '😊', emojiB: '😢', 
    difficulty: 'easy', category: 'sensory', explanation: 'Happy and sad are opposite feelings' },
  
  // Easy - Size
  { id: '5', wordA: 'big', wordB: 'small', emojiA: '🐘', emojiB: '🐁', 
    difficulty: 'easy', category: 'size', explanation: 'Big and small are opposite sizes' },
  { id: '6', wordA: 'tall', wordB: 'short', emojiA: '🦒', emojiB: '🐹', 
    difficulty: 'easy', category: 'size', explanation: 'Tall and short are opposite heights' },
  { id: '7', wordA: 'huge', wordB: 'tiny', emojiA: '🐋', emojiB: '🐜', 
    difficulty: 'easy', category: 'size', explanation: 'Huge and tiny are opposite sizes' },
  
  // Easy - Actions
  { id: '8', wordA: 'open', wordB: 'close', emojiA: '🚪', emojiB: '🚪', 
    difficulty: 'easy', category: 'action', explanation: 'Open and close are opposite actions' },
  { id: '9', wordA: 'up', wordB: 'down', emojiA: '⬆️', emojiB: '⬇️', 
    difficulty: 'easy', category: 'direction', explanation: 'Up and down are opposite directions' },
  { id: '10', wordA: 'fast', wordB: 'slow', emojiA: '🐆', emojiB: '🐢', 
    difficulty: 'easy', category: 'action', explanation: 'Fast and slow are opposite speeds' },
  
  // Medium - Actions
  { id: '11', wordA: 'push', wordB: 'pull', emojiA: '👋', emojiB: '🤚', 
    difficulty: 'medium', category: 'action', explanation: 'Push and pull are opposite forces' },
  { id: '12', wordA: 'give', wordB: 'take', emojiA: '🎁', emojiB: '✋', 
    difficulty: 'medium', category: 'action', explanation: 'Give and take are opposite actions' },
  { id: '13', wordA: 'start', wordB: 'stop', emojiA: '▶️', emojiB: '⏹️', 
    difficulty: 'medium', category: 'action', explanation: 'Start and stop are opposite actions' },
  { id: '14', wordA: 'win', wordB: 'lose', emojiA: '🏆', emojiB: '😔', 
    difficulty: 'medium', category: 'concept', explanation: 'Win and lose are opposite outcomes' },
  
  // Medium - Concepts
  { id: '15', wordA: 'same', wordB: 'different', emojiA: '👯', emojiB: '🎭', 
    difficulty: 'medium', category: 'concept', explanation: 'Same and different are opposites' },
  { id: '16', wordA: 'full', wordB: 'empty', emojiA: '🥤', emojiB: '🥛', 
    difficulty: 'medium', category: 'concept', explanation: 'Full and empty are opposite amounts' },
  { id: '17', wordA: 'clean', wordB: 'dirty', emojiA: '✨', emojiB: '😷', 
    difficulty: 'medium', category: 'concept', explanation: 'Clean and dirty are opposites' },
  
  // Hard - Time/Direction
  { id: '18', wordA: 'early', wordB: 'late', emojiA: '🌅', emojiB: '🌙', 
    difficulty: 'hard', category: 'time', explanation: 'Early and late are opposite times' },
  { id: '19', wordA: 'before', wordB: 'after', emojiA: '⏮️', emojiB: '⏭️', 
    difficulty: 'hard', category: 'time', explanation: 'Before and after are opposite orders' },
  { id: '20', wordA: 'left', wordB: 'right', emojiA: '⬅️', emojiB: '➡️', 
    difficulty: 'medium', category: 'direction', explanation: 'Left and right are opposite sides' },
  
  // Hard - Abstract
  { id: '21', wordA: 'always', wordB: 'never', emojiA: '♾️', emojiB: '🚫', 
    difficulty: 'hard', category: 'concept', explanation: 'Always and never are opposite frequencies' },
  { id: '22', wordA: 'everything', wordB: 'nothing', emojiA: '🌌', emojiB: '⚫', 
    difficulty: 'hard', category: 'concept', explanation: 'Everything and nothing are opposites' },
  { id: '23', wordA: 'remember', wordB: 'forget', emojiA: '🧠', emojiB: '💭', 
    difficulty: 'hard', category: 'concept', explanation: 'Remember and forget are opposites' },
  
  // Expert
  { id: '24', wordA: 'difficult', wordB: 'easy', emojiA: '🤯', emojiB: '👌', 
    difficulty: 'expert', category: 'concept', explanation: 'Difficult and easy are opposites' },
  { id: '25', wordA: 'dangerous', wordB: 'safe', emojiA: '⚠️', emojiB: '🛡️', 
    difficulty: 'expert', category: 'concept', explanation: 'Dangerous and safe are opposites' },
];
```

### Level Configuration
```typescript
interface LevelConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  pairCount: number;
  categories: string[];
  matchRadius: number;
  showExplanation: boolean;
}

const LEVELS: LevelConfig[] = [
  { difficulty: 'easy', pairCount: 6, categories: ['sensory', 'size'], matchRadius: 100, showExplanation: true },
  { difficulty: 'medium', pairCount: 8, categories: ['sensory', 'size', 'action'], matchRadius: 80, showExplanation: true },
  { difficulty: 'hard', pairCount: 10, categories: ['all'], matchRadius: 70, showExplanation: false },
  { difficulty: 'expert', pairCount: 12, categories: ['all'], matchRadius: 60, showExplanation: false },
];
```

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `OppositesAttract.tsx` | Main React component | 400-500 |
| `oppositesAttractLogic.ts` | Pure game logic functions | 250-300 |
| `oppositesAttract.types.ts` | TypeScript interfaces | 60-80 |
| `oppositePairsBank.ts` | Word pair data | 150-200 |

### Key Components in OppositesAttract.tsx
- `OppositesAttractContent` - Core game implementation
- `OppositesAttract` (default) - GameShell wrapper
- `WordCard` - Draggable word card component
- `CompletedArea` - Zone for matched pairs
- `ConnectionLine` - Visual link between matches
- `MagneticField` - Background attraction effect
- `OppositesJournal` - Collection view component
- `HandCursor` - Custom cursor with grab states

### Logic Functions (oppositesAttractLogic.ts)
| Function | Purpose |
|----------|---------|
| `getPairsForLevel()` | Select appropriate pairs for difficulty |
| `createWordCards()` | Initialize card positions scattered |
| `updateCardDrag()` | Handle drag physics |
| `checkMatchProximity()` | Detect when cards should match |
| `isOppositePair()` | Verify if two cards are opposites |
| `animateMatch()` | Trigger match sequence |
| `calculateScore()` | Compute pair score |
| `shuffleCards()` | Rearrange remaining cards |

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
  shuffleCount: number;
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
| Magnetic pull strength | 0.15 lerp when in range | Low |
| Shuffle penalty balance | -10 points feels fair | Medium |
| Word card size | 100px for visibility | High |
| Match animation timing | 250ms snap + 400ms move | Medium |
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
- Test magnetic pull doesn't feel "too sticky"

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
- [ ] Magnetic attraction effect activates when correct cards near
- [ ] Match animation plays successfully
- [ ] Connection line draws between matched cards
- [ ] Both words pronounced via TTS after match
- [ ] Explanation spoken after match (if enabled)
- [ ] Four difficulty levels work
- [ ] Word bank provides appropriate opposite pairs
- [ ] Shuffle button rearranges remaining cards
- [ ] Score calculates with bonuses and multipliers
- [ ] Streak multiplier applies correctly
- [ ] Touch/mouse fallback works
- [ ] Opposites journal tracks learned pairs
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, match all pairs
- [ ] Play medium mode, verify reduced match radius
- [ ] Play hard mode, verify no explanations
- [ ] Play expert mode, verify text-only cards
- [ ] Test drag with both cards in a pair
- [ ] Build 5+ streak, verify multiplier
- [ ] Use shuffle, verify point deduction
- [ ] Complete level, verify progress tracking
- [ ] View opposites journal, verify all pairs recorded

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Pinch grabs word card consistently
- [ ] Drag follows hand smoothly
- [ ] Match triggers at correct distance
- [ ] Magnetic attraction activates appropriately
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
- Similar Games: `src/frontend/src/pages/MemoryMatch.tsx`, `src/frontend/src/pages/BlendBuilder.tsx`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- Streak System: `src/frontend/src/hooks/useStreakTracking.ts`
