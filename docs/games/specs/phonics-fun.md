# Phonics Fun

**Game ID:** phonics-fun  
**World:** Word Workshop  
**CV Mode:** Hand tracking (cv: ['hand'])  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts` (to be added)  
**Code:** `src/frontend/src/pages/PhonicsFun.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/phonicsFunLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** An interactive phonics adventure where children blend individual letter sounds together to build words, using hand tracking to grab and combine floating phoneme bubbles into complete words
- **Genre:** Educational / Phonics / Word Building
- **Target audience:** Ages 4-8, emergent readers learning to blend sounds into words
- **Core player fantasy:** "I'm a sound scientist mixing letter bubbles to create magic words!" - transforming abstract phonemes into meaningful words through active blending
- **Primary skill tested:** Phonemic awareness, sound blending, word decoding, letter-sound correspondence, reading readiness
- **Session length:** 5-7 minutes (6-10 words per session, 2-4 sounds per word)
- **Platform context:** Hand tracking CV game emphasizing grabbing, dragging, and combining phoneme elements

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Framework patterns available from similar games (Phonics Sounds, Blend Builder, Word Builder)
  - Hand tracking infrastructure ready via `useGameHandTracking`
  - TTS system available for phoneme pronunciation
  - Bubble/floating element patterns available
- **What is partial/missing:**
  - Main game component `PhonicsFun.tsx`
  - Game logic module `phonicsFunLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Phoneme-to-word mapping dataset
  - Drag-and-combine interaction system
  - Blending animation effects
- **Evidence:**
  - No file exists at `src/frontend/src/pages/PhonicsFun.tsx`
  - No file exists at `src/frontend/src/games/phonicsFunLogic.ts`
  - Registry entry needed in `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select difficulty (CVC words, blends, or digraphs)
2. **Game Start:** Voice introduces phonics blending concept
3. **Gameplay Loop:**
   - Target word picture appears (e.g., image of a cat)
   - Phoneme bubbles float on screen (/k/, /æ/, /t/)
   - Player grabs bubbles one by one with pinch gesture
   - Drags bubbles to "blending zone" at center
   - As bubbles combine, sounds blend together
   - Complete word reveals when all phonemes collected
4. **Round Progression:**
   - Success: Celebration, points, next word
   - Hint available: Tap picture to hear full word
5. **Session End:** Score summary, words mastered, rewards

### Controls
- **Hand movement:** Index finger controls cursor position
- **Pinch to grab:** Hold pinch to "hold" a phoneme bubble
- **Drag to blend:** Move held bubble to blending zone
- **Release to drop:** Release pinch to place bubble
- **Touch/mouse:** Click and drag bubbles (fallback)
- **CV primary:** Full hand tracking with grab-and-drag mechanics

### Mechanics
- **Phoneme bubbles:** Floating circular elements with letter(s) and sound
- **Blending zone:** Central area where phonemes combine
- **Grab detection:** Pinch within bubble triggers hold
- **Drag physics:** Bubble follows cursor while held
- **Blending validation:** Correct phonemes in order form word
- **Hint system:** Tap picture to hear target word
- **Progression:**
  - Easy: CVC words (cat, dog, sun) - 3 phonemes
  - Medium: CCVC/CVCC words (frog, jump, stop) - 4 phonemes
  - Hard: Digraphs and blends (ship, think, cloud) - 2-4 phonemes

### Visuals/UI
- **Background:** Playful laboratory/workshop theme with bubbling elements
- **Phoneme bubbles:** 
  - Color-coded by sound type (vowels: warm colors, consonants: cool colors)
  - Wobbly, liquid-like appearance
  - Gentle floating animation
- **Blending zone:** 
  - Central "mixing cauldron" or "word tube"
  - Phonemes snap into position when released
  - Visual connection lines between sounds
- **Target picture:** Large, clear image at top
- **Hand cursor:** Glowing cursor with grab state indicator
- **Feedback effects:** Bubble pop, merge animation, word reveal

### Gaps/Issues
- No implementation exists to analyze
- Drag-and-drop physics need tuning for children's motor skills
- Phoneme segmentation dataset required (word → phonemes)
- Audio blending (concatenating individual sounds smoothly)
- Consider alternative interaction: tap-to-select instead of drag

---

## 4. Intended Design

### Educational Goal
Develop phonemic awareness by physically manipulating individual sounds and experiencing how they blend together to form words. The kinesthetic act of "mixing" sounds reinforces the auditory blending process.

### Pedagogical Approach
- **Synthetic phonics:** Build words from individual phonemes
- **Kinesthetic reinforcement:** Physical grabbing mirrors mental sound manipulation
- **Segmentation practice:** Breaking words into sounds, then rebuilding
- **Multisensory blending:** Visual (letters), auditory (sounds), tactile (grabbing)
- **Error tolerance:** Wrong order provides learning opportunity, not failure

### Difficulty Progression
| Level | Word Type | Phonemes | Examples | Blending Support |
|-------|-----------|----------|----------|------------------|
| Easy (1-2) | CVC | 3 | cat, dog, sun | Visual connectors |
| Medium (3-4) | CCVC/CVCC | 4 | frog, jump, stop | Sound highlighting |
| Hard (5-6) | Digraphs | 2-4 | ship, think, cloud | Minimal support |
| Expert (7+) | Advanced | Variable | throne, scratch | No support |

### Accessibility
- **Visual:** Large bubbles (100px), high contrast, clear phoneme labels
- **Auditory:** Individual phoneme sounds, blended word pronunciation
- **Motor:** Generous grab areas, sticky drag (bubble follows even if cursor drifts)
- **Cognitive:** Picture hints, sound replay, optional phoneme order hints

### Engagement
- **Bubble collection:** Fun, tactile grabbing interaction
- **Blending animation:** Satisfying merge effect when sounds combine
- **Word reveal:** Picture animates when word complete
- **Streak system:** Consecutive words build "blending power"
- **Discovery element:** New words unlock in "phonics dictionary"

### Core Loop
1. View target picture and hear word (optional hint)
2. Identify needed phonemes from floating bubbles
3. Grab first phoneme bubble
4. Drag to blending zone
5. Hear phoneme sound on placement
6. Repeat for remaining phonemes
7. Hear sounds blend together
8. Complete word reveals, celebration
9. Progress to next word

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
- Smooth grab-and-drag interaction
- Clear phoneme audio blending
- Responsive bubble physics
- Intuitive blending zone
- Progressive difficulty scaling
- Robust error handling

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Three difficulty tiers:**
   - Easy: CVC words (3 phonemes), visual blending guides
   - Medium: CCVC/CVCC (4 phonemes), sound highlighting
   - Hard: Digraphs and complex blends, minimal support

2. **Hand tracking controls:**
   - Index finger position for cursor
   - Pinch to grab and hold bubble
   - Release to drop in zone
   - Visual feedback for grab state

3. **Phoneme bubble system:**
   - Color-coded by sound type
   - Gentle floating animation
   - Grab physics with sticky follow
   - Pop animation on placement

4. **Blending mechanics:**
   - Central blending zone
   - Phonemes snap to ordered slots
   - Progressive sound blending as added
   - Word reveal animation

5. **Scoring and feedback:**
   - Base points: 100 per word
   - Speed bonus: Up to 50 points
   - No-wrong-order bonus: +25
   - Streak multiplier

### Enhancements for Future Versions
1. **Custom word lists:** Parent-defined practice words
2. **Sound families:** Practice specific phonics rules (at, an, ap)
3. **Silly words mode:** Blend nonsense words for pure phonics practice
4. **Recording mode:** Child records themselves blending
5. **Challenge mode:** Timed blending challenges

### Experimental Features
- **AR mode:** Bubbles float in real space around child
- **Multi-bubble grab:** Grab multiple phonemes at once
- **Team mode:** Two players each grab different sounds
- **AI tutor:** Adaptive hints based on confusion patterns

---

## 7. Visual Identity

- **Overall look:** Bubbly, colorful phonics laboratory
- **Camera view:** Full screen with floating bubble elements
- **Art style:** Playful, rounded, liquid/gel-like bubble aesthetic
- **Mood:** Experimental, magical, scientific fun
- **Colors:**
  - Background: Deep purple gradient (#4A148C to #7B1FA2)
  - Vowel bubbles: Warm colors (red #FF5252, orange #FFAB40, yellow #FFD740)
  - Consonant bubbles: Cool colors (blue #448AFF, green #69F0AE, purple #E040FB)
  - Blending zone: Glowing gold (#FFD700) center
  - Success: Bright green burst (#00E676)
  - UI: White with purple accents
- **Environment:** Magical laboratory with bubbling potions
- **UI style:** Rounded, bubbly, with liquid animations
- **Active vibe:** "Mix the sounds to make magic words!" 🧪✨

### Bubble Design
```
     ╭─────────╮
    ╱   /k/    ╲      ← Phoneme label
   │   ┌───┐    │
   │   │ 💧│    │     ← Liquid/gel appearance
   │   └───┘    │
    ╲  wobble  ╱      ← Gentle wobble animation
     ╰─────────╯
```

### Blending Zone Design
```
    ┌─────────────────┐
    │  ╔═══════════╗  │
    │  ║  [ /k/ ]  ║  │  ← Phoneme slots
    │  ║  [ /æ/ ]  ║  │     (fill as added)
    │  ║  [ /t/ ]  ║  │
    │  ╚═══════════╝  │
    │     ╲   ╱       │
    │      [CAT]      │  ← Word reveals when
    │       🐱        │     complete
    └─────────────────┘
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select difficulty | Mode buttons (CVC/Blends/Digraphs), Start |
| **Tutorial** | Learn blending | Animated demo, practice grab-drag |
| **Gameplay** | Core experience | Picture, bubbles, blending zone, progress |
| **Word Success** | Celebration | Merge animation, word reveal, points |
| **Word Wrong** | Correction | Hint, replay option, try again |
| **Session Complete** | Summary | Words built, score, mastery, rewards |
| **Phonics Dictionary** | Progress view | All words discovered, replay any |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows smoothly |
| Grab bubble | Pinch on bubble | Bubble attaches to cursor, wobbles |
| Drag bubble | Move while pinching | Bubble follows with lag physics |
| Drop bubble | Release pinch in zone | Bubble snaps to slot, sound plays |
| Tap picture | Quick pinch on image | Hear target word pronunciation |
| Replay sounds | Click replay button | Replay all placed phonemes |
| Start game | Click Start button | Game begins |

### CV Control Details
- **Hand tracking:** Index finger tip position mapped to cursor
- **Pinch detection:** Distance < 0.05 normalized to grab
- **Grab hold:** Must maintain pinch to hold bubble
- **Bubble hit area:** 100px radius around bubble center
- **Drop zone:** Central blending area (300x200px)
- **Cursor states:**
  - Normal: Open hand
  - Near bubble: Hand glows
  - Grabbing: Closed fist, bubble attached
  - Over zone: Zone highlights

---

## 10. Core Mechanics

### Phoneme Bubble System
```typescript
interface PhonemeBubble {
  id: string;
  phoneme: string;        // "/k/", "/æ/", "/t/"
  letter: string;         // "c", "a", "t" (display letter)
  soundType: 'consonant' | 'vowel' | 'blend' | 'digraph';
  color: string;          // Based on sound type
  x: number;              // Current position
  y: number;
  velocityX: number;      // Float drift
  velocityY: number;
  isGrabbed: boolean;
  isPlaced: boolean;
  targetSlot: number;     // Expected order position
}

// Bubble movement (gentle float)
x += velocityX * deltaTime;
y += velocityY * deltaTime + sin(time * 2 + id) * 0.001;
// Soft bounce at screen edges
```

### Blending Zone Logic
```typescript
interface BlendingZone {
  slots: PhonemeSlot[];   // Ordered slots for phonemes
  placedPhonemes: PhonemeBubble[];
}

interface PhonemeSlot {
  position: number;       // 0, 1, 2, etc.
  x: number;              // Screen position
  y: number;
  occupiedBy: string | null; // Bubble ID
}

// Drop validation
function handleDrop(bubble: PhonemeBubble, zone: BlendingZone): boolean {
  if (isInZone(bubble, zone)) {
    const slot = findNearestSlot(bubble, zone);
    snapToSlot(bubble, slot);
    playPhonemeSound(bubble.phoneme);
    attemptBlend(zone);
    return true;
  }
  return false;
}
```

### Sound Blending
```typescript
// Play phonemes in sequence when placed
async function blendSounds(phonemes: PhonemeBubble[]) {
  // Play each phoneme with slight overlap
  for (let i = 0; i < phonemes.length; i++) {
    playPhoneme(phonemes[i].phoneme);
    await delay(200); // Brief pause between sounds
  }
  // Then play complete word
  await delay(300);
  playWord(word);
}
```

### Scoring Formula
```
Base Points: 100 per word
Speed Bonus: max(0, 50 - timeTaken * 5)
Order Bonus: +25 if placed in correct order first try
Streak Bonus: +10 per consecutive word (max +50)

Total = Base + Speed Bonus + Order Bonus + Streak Bonus
```

### Difficulty Configuration
| Level | Word Type | Phonemes | Bubble Speed | Support |
|-------|-----------|----------|--------------|---------|
| 1 | CVC | 3 | Slow | Slot highlighting |
| 2 | CVC | 3 | Medium | Color-coded slots |
| 3 | CCVC | 4 | Medium | Order hints |
| 4 | CVCC | 4 | Fast | Minimal hints |
| 5 | Digraphs | 2-3 | Fast | No hints |
| 6 | Mixed | 2-4 | Fast | No hints |

---

## 11. Rules

- **Start:** Select difficulty, click Start
- **Objective:** Build each target word by combining phonemes
- **Allowed:**
  - Grab any floating phoneme bubble
  - Drop bubbles in any order (educational mode)
  - Tap picture for word hint
  - Take time to plan
  - Touch/mouse fallback
- **Restricted:**
  - Can only hold one bubble at a time
  - Cannot place same phoneme twice
  - Must place all phonemes to complete word
- **Scoring:** Based on speed + order bonus + streak
- **Wrong order:** Bubbles still accept, reduced order bonus
- **Win condition:** Complete all words in session

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Target Picture | Show word to build | Each new word |
| Phoneme Bubbles | Draggable sound elements | Each round |
| Blending Zone | Where phonemes combine | Real-time |
| Placed Phonemes | Current blend progress | On each drop |
| Score | Current points | After each word |
| Streak | Consecutive words | On each complete |
| Progress | "Word X of Y" | After each word |
| Replay Button | Replay target word | On click |
| Hand Cursor | Player hand position | Real-time |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 350      Streak: 🔥 x3      │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────┐                 │
│         │   🐱    │  ← Target       │
│         │  [🔊]   │     picture     │
│         └─────────┘                 │
│                                     │
│     ○      ┌─────┐      ○           │
│    /k/     │blend│     /t/          │
│     ○      │zone │      ○           │
│    /æ/     │[/k/]│     (bubbles     │
│     ○      │[/æ/]│      float)      │
│            │[ _ ]│                  │
│            └─────┘                  │
│                                     │
├─────────────────────────────────────┤
│  Word 3 of 8               [||]     │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Word Complete)
- All phonemes glow and merge together
- Blending animation (bubbles flow together)
- Word appears with picture animation
- Success fanfare sound
- Haptic feedback (celebration pattern)
- Voice: "Cat! C-A-T! Great blending!"
- Score floats up with breakdown
- Confetti burst

### Partial Success (Wrong Order)
- Bubbles accept placement
- Different sound effect (gentle chime)
- Voice: "Good sounds, try this order..."
- Visual hint showing correct order
- Reduced order bonus (0 instead of 25)
- Still progress to next word

### Failure/Reset
- Gentle return of bubbles to pool
- Soft "whoosh" sound
- Voice: "Let's try again!"
- No penalty, fresh attempt

### During Gameplay
- Bubbles wobble with liquid physics
- Hover: Bubble scales up, glows
- Grab: Bubble attaches, wobbles more
- Over zone: Zone border glows gold
- Drop: Satisfying "pop" sound

### Streak Feedback
| Streak | Visual | Sound | Effect |
|--------|--------|-------|--------|
| 1-2 | - | Standard | - |
| 3-4 | Bubbles sparkle | Rising melody | +5% points |
| 5-6 | Rainbow bubbles | Fanfare | +10% points |
| 7+ | Golden bubbles | Victory music | +15% points |

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Word | 100 points |
| Speed Bonus | Up to 50 points |
| Order Bonus | +25 (correct order first try) |
| Streak Bonus | +10 per consecutive (max +50) |
| Session Complete | 200 bonus |

### Example Score Calculation
```
Word 1 (12s, correct order): 100 + 0 + 25 + 0 = 125
Word 2 (8s, correct order): 100 + 10 + 25 + 10 = 145
Word 3 (15s, wrong order): 100 + 0 + 0 + 20 = 120
Word 4 (6s, correct order): 100 + 20 + 25 + 30 = 175
Session Bonus: 200
Total: 765 points
```

### Rewards (Drops)
- Sound bubble collectible (20% chance)
- Phonics star (15% chance)
- Word book item (10% chance)
- Owl companion (5% chance at 80%+ accuracy)
- Golden microphone (3% chance, rare)

### Easter Eggs
- **Blending Master:** Complete 10 words with correct order
  - Reward: Master blender badge
  - Hint: "Place sounds in the right order!"
- **Speed Blender:** Complete word in under 3 seconds
  - Reward: Lightning bolt
  - Hint: "How fast can you blend?"
- **Sound Collector:** Discover all phonemes
  - Reward: Phonics encyclopedia
  - Hint: "Blend every sound in the game!"

### Progression
- Phonics dictionary tracks mastered words
- Difficulty unlocks based on performance
- Sound type badges (consonant expert, vowel master)
- Blending speed records

---

## 15. End States

### Word Complete (Correct)
- Blending animation
- Word reveal with pronunciation
- Score update
- Streak increment
- Brief celebration (1s)
- Next word loads

### Word Complete (Wrong Order)
- Bubbles merge (different animation)
- Word reveal
- Reduced points (no order bonus)
- Correction hint shown
- Progress to next word

### Word Reset
- Bubbles return to pool
- Gentle feedback
- Fresh attempt
- No penalty

### Session Complete
- Final score with breakdown
- Words mastered list
- Phonics dictionary update
- Rewards display
- Personal best comparison
- Play again / exit options

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking Drag-and-Drop)
Full hand tracking with grab-drag mechanics as described above.

### Mode B: Tap-to-Select (Simplified)
- Tap bubble to select
- Tap slot to place
- No drag required
- Better for younger children

### Mode C: Touch/Mouse Only (Fallback)
- Click and drag with mouse
- Touch and drag on tablets
- Same mechanics, no camera needed

### Mode D: Voice-Assisted Mode
- Say phoneme to highlight matching bubble
- "Find /k/" - all /k/ bubbles glow
- Combines visual and auditory

### Mode E: Sequential Mode
- Only one bubble available at a time
- Forces left-to-right blending
- Scaffolded for beginners

---

## 17. Improvement Opportunities

### Low Cost
- More bubble color variations
- Additional particle effects
- Background music toggle
- Voice line variety
- Celebration animations

### Medium Effort
- Custom word list import
- Recording and playback of blending
- Additional phonics rules (silent e, etc.)
- Parent progress dashboard
- Sound family practice mode

### Ambitious
- AI pronunciation assessment
- Multiplayer collaborative blending
- AR bubbles in real space
- Adaptive difficulty based on errors
- Full curriculum integration

---

## 18. Content Model

### Word Data Structure
```typescript
interface PhonicsWord {
  id: string;
  word: string;              // Complete word
  phonemes: Phoneme[];       // Ordered phonemes
  emoji: string;             // Visual representation
  difficulty: 1 | 2 | 3;
  category: WordCategory;
}

interface Phoneme {
  symbol: string;            // "/k/", "/æ/"
  letter: string;            // "c", "a"
  type: 'consonant' | 'vowel' | 'blend' | 'digraph';
}

type WordCategory = 
  | 'cvc'           // cat, dog, sun
  | 'ccvc'          // frog, stop
  | 'cvcc'          // jump, lamp
  | 'digraphs'      // ship, think
  | 'blends'        // cloud, train
  | 'silent_e';     // cake, kite

const PHONICS_WORDS: PhonicsWord[] = [
  // Easy - CVC words
  {
    id: 'cat',
    word: 'cat',
    phonemes: [
      { symbol: '/k/', letter: 'c', type: 'consonant' },
      { symbol: '/æ/', letter: 'a', type: 'vowel' },
      { symbol: '/t/', letter: 't', type: 'consonant' }
    ],
    emoji: '🐱',
    difficulty: 1,
    category: 'cvc'
  },
  // Medium - Blends
  {
    id: 'frog',
    word: 'frog',
    phonemes: [
      { symbol: '/fr/', letter: 'fr', type: 'blend' },
      { symbol: '/ɒ/', letter: 'o', type: 'vowel' },
      { symbol: '/g/', letter: 'g', type: 'consonant' }
    ],
    emoji: '🐸',
    difficulty: 2,
    category: 'ccvc'
  },
  // Hard - Digraphs
  {
    id: 'ship',
    word: 'ship',
    phonemes: [
      { symbol: '/ʃ/', letter: 'sh', type: 'digraph' },
      { symbol: '/ɪ/', letter: 'i', type: 'vowel' },
      { symbol: '/p/', letter: 'p', type: 'consonant' }
    ],
    emoji: '🚢',
    difficulty: 3,
    category: 'digraphs'
  }
];
```

### Content Distribution
| Category | Easy | Medium | Hard | Total |
|----------|------|--------|------|-------|
| CVC | 20 | 10 | - | 30 |
| CCVC | 5 | 15 | 10 | 30 |
| CVCC | 5 | 15 | 10 | 30 |
| Digraphs | - | 10 | 20 | 30 |
| Blends | - | 5 | 25 | 30 |
| **Total** | **30** | **55** | **65** | **150** |

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `PhonicsFun.tsx` | Main React component | 400-450 |
| `phonicsFunLogic.ts` | Pure game logic | 250-300 |
| `phonicsFun.types.ts` | TypeScript interfaces | 75-100 |

### Key Components
- `PhonicsFunContent` - Core game
- `PhonicsFun` (default) - GameShell wrapper
- `PhonemeBubble` - Draggable bubble component
- `BlendingZone` - Drop target and phoneme display
- `TargetPicture` - Word hint image
- `SoundPlayer` - Phoneme audio management

### Logic Functions
| Function | Purpose |
|----------|---------|
| `createWordRound()` | Select target word, create bubbles |
| `updateBubbles()` | Frame-by-frame bubble physics |
| `handleGrab()` | Detect and start drag |
| `handleDrop()` | Validate and place phoneme |
| `blendSounds()` | Play sequential phonemes |
| `calculateScore()` | Compute points |
| `checkComplete()` | Validate word completion |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Phoneme pronunciation

### State Management
```typescript
interface GameState {
  targetWord: PhonicsWord;
  bubbles: PhonemeBubble[];
  placedPhonemes: PhonemeBubble[];
  score: number;
  streak: number;
  round: number;
  isGrabbing: boolean;
  heldBubble: PhonemeBubble | null;
  gameStatus: 'menu' | 'playing' | 'complete';
}
```

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Bubble physics | Spring-based follow with lag | Medium |
| Grab radius | 100px for easy targeting | Medium |
| Phoneme audio | Pre-recorded for clarity | High |
| Blending timing | 200ms between sounds | Medium |
| Word database | 150+ words across difficulties | Medium |
| Drop zone size | 300x200px centered | Medium |

---

## 21. Implementation Notes

### Strengths to Build On
- Hand tracking infrastructure mature
- TTS system available
- Similar drag patterns in other games
- Audio system supports sequential playback

### Architecture Patterns
- Physics in refs, state for UI only
- Audio preloading for phonemes
- Debounced grab detection
- Smooth animations via Framer Motion

### Testing Considerations
- Test drag with various hand sizes
- Verify phoneme audio clarity
- Test bubble visibility at all sizes
- Validate with children for difficulty

### Performance Notes
- Limit concurrent bubble animations
- Pool audio elements
- Optimize hit detection
- Use will-change for moving elements

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes and shows cursor
- [ ] Pinch gesture grabs bubbles accurately
- [ ] Bubbles follow cursor while grabbed
- [ ] Drop in zone snaps phoneme to slot
- [ ] Phoneme sounds play on placement
- [ ] Sounds blend sequentially when complete
- [ ] Target picture displays correctly
- [ ] Three difficulty levels function
- [ ] Score calculates with all bonuses
- [ ] Streak system tracks consecutive words
- [ ] Voice feedback for all interactions
- [ ] Touch/mouse fallback functions
- [ ] Visual feedback for all states
- [ ] Game completes after all words
- [ ] Progress saves on completion

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, complete all CVC words
- [ ] Play medium mode, verify blend words
- [ ] Play hard mode, verify digraphs
- [ ] Complete word in wrong order, verify feedback
- [ ] Build 5+ streak, verify bonus
- [ ] Use hint system, verify word pronunciation
- [ ] Complete session, verify summary

### CV Control Tests
- [ ] Hand tracking initializes
- [ ] Cursor follows smoothly
- [ ] Pinch grabs bubble
- [ ] Drag follows cursor
- [ ] Drop in zone works
- [ ] No hand = no cursor

### Fallback Tests
- [ ] Touch drag works
- [ ] Mouse drag works
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid grab attempts
- [ ] Hand lost mid-drag
- [ ] Bubble dropped outside zone
- [ ] All word categories tested

### Performance
- [ ] 60fps with 6 bubbles
- [ ] Smooth audio playback
- [ ] No memory leaks
- [ ] Smooth on tablets

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/PhonicsSounds.tsx`, `src/frontend/src/pages/BlendBuilder.tsx`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
