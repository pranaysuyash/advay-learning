# Letter Match

**Game ID:** letter-match  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts` (to be added)  
**Code:** `src/frontend/src/pages/LetterMatch.tsx` (to be implemented)  
**Logic:** `src/frontend/src/games/letterMatchLogic.ts` (to be implemented)

---

## 1. Concept Summary

- **One-line concept:** A fast-paced letter recognition game where kids match uppercase and lowercase letters, or letters to their sounds, by grabbing floating letter pairs with their hand
- **Genre:** Educational / Recognition / Matching
- **Target audience:** Ages 3-6, early readers and letter learners
- **Core player fantasy:** "I'm a letter collector catching magical floating letters!" - combining visual discrimination with physical reaching and grabbing motions
- **Primary skill tested:** Letter recognition (uppercase/lowercase), phonemic awareness, visual matching, hand-eye coordination
- **Session length:** 3-4 minutes (10-15 matches per game)
- **Platform context:** Hand tracking CV game emphasizing reaching, grabbing, and matching motions in 3D space

---

## 2. Repo Status

- **Implementation status:** 📝 NOT IMPLEMENTED
- **What works now:**
  - No implementation exists yet
  - Framework patterns available from similar games (Letter Sound Match, Beginning Sounds)
  - Hand tracking infrastructure ready via `useGameHandTracking`
  - TTS system available for letter sound pronunciation
- **What is partial/missing:**
  - Main game component `LetterMatch.tsx`
  - Game logic module `letterMatchLogic.ts`
  - Registry entry in wordWorkshop.ts
  - Art assets for floating letters and visual effects
  - Sound effects for match success/failure
- **Evidence:**
  - No file exists at `src/frontend/src/pages/LetterMatch.tsx`
  - No file exists at `src/frontend/src/games/letterMatchLogic.ts`
  - Registry entry needed in `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
- **Confidence level:** N/A - New game specification

---

## 3. Current Implementation

### Flow (Proposed)
1. **Pre-game menu:** Select match type (Upper↔Lower, Letter↔Sound, or Mixed)
2. **Game Start:** Voice introduces the game, letters begin floating
3. **Gameplay Loop:**
   - Letters float across screen from various directions
   - Player reaches out with hand to "grab" a letter
   - Target letter appears in center (e.g., uppercase "A")
   - Player must find and grab matching letter (e.g., lowercase "a")
   - Match validation on successful grab
4. **Feedback:** Immediate visual and audio feedback
5. **Progression:** Difficulty increases (more letters, faster movement)
6. **Completion:** Score summary and rewards

### Controls
- **Hand reach/grab:** Move hand to letter position, pinch to grab
- **Hand tracking:** Index finger position for cursor
- **Pinch gesture:** Index finger + thumb contact to "grab"
- **Touch/mouse:** Click/tap letters directly (fallback)
- **CV primary:** Full hand tracking with pinch interaction

### Mechanics
- **Floating letters:** Letters drift across screen with gentle bobbing motion
- **Grab detection:** Pinch gesture within hit radius of letter (80px)
- **Match validation:** Grabbed letter checked against target
- **Score calculation:** Base points + speed bonus + streak bonus
- **Difficulty scaling:**
  - Easy: 3 letters visible, slow movement, clear pairs
  - Medium: 5 letters visible, medium speed, mixed pairs
  - Hard: 7+ letters visible, faster movement, similar-looking letters (b/d/p/q)

### Visuals/UI
- **Background:** Soft gradient (pastel blue to lavender)
- **Floating letters:** 3D-styled letter cards with shadows
- **Target display:** Large letter in center top with prompt ("Find the match!")
- **Hand cursor:** Glowing hand indicator with pinch state feedback
- **Particle effects:** Sparkles on successful match, shake on wrong grab
- **Score display:** Floating numbers that animate on points earned

### Gaps/Issues
- No implementation exists to analyze
- Need to determine optimal floating speed for age group
- Grab radius may need tuning for different hand sizes
- Consider letter confusion pairs (b/d, p/q, m/n) for challenge

---

## 4. Intended Design

### Educational Goal
Build foundational letter recognition skills through active, engaging play. The physical act of reaching and grabbing reinforces memory associations.

### Pedagogical Approach
- **Kinesthetic learning:** Physical reaching motion connects with visual recognition
- **Multisensory feedback:** Visual (letter), auditory (sound), and tactile (haptic) reinforcement
- **Progressive difficulty:** Start with distinct letter pairs, introduce similar-looking letters
- **Error tolerance:** Wrong matches provide immediate correction without penalty

### Difficulty Progression
| Level | Match Type | Letters | Speed | Challenge |
|-------|-----------|---------|-------|-----------|
| Easy | Upper↔Lower (A-a) | 3 pairs | Slow | Distinct letters only |
| Medium | Upper↔Lower + Sound | 5 pairs | Medium | Some similar letters |
| Hard | All types | 7+ pairs | Fast | Confusing pairs (b/d/p/q) |

### Accessibility
- **Visual:** Large letter display, high contrast colors
- **Auditory:** TTS for letter names and sounds, clear success/error sounds
- **Motor:** Generous hit radius, no time pressure on individual matches
- **Cognitive:** Clear prompts, visual hints available

### Engagement
- **Streak system:** Consecutive correct matches build bonus multiplier
- **Visual rewards:** Particle effects, letter animations
- **Progress tracking:** Fill a letter collection book
- **Voice encouragement:** Positive reinforcement from cheerful narrator

### Core Loop
1. View target letter in center display
2. Scan floating letters for match
3. Reach hand toward matching letter
4. Pinch to grab
5. Receive immediate feedback
6. Build streak for bonus points
7. Progress to next match

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
- Clean hand tracking integration
- Smooth floating animations
- Responsive pinch detection
- Clear visual feedback
- Robust error handling

---

## 6. Recommended Canonical Version

### Core Features to Implement
1. **Three match modes:**
   - Uppercase ↔ Lowercase (A matches a)
   - Letter ↔ Sound ("A" sound matches "A")
   - Mixed mode (random combination)

2. **Hand tracking controls:**
   - Index finger position for cursor
   - Pinch gesture for grabbing
   - Visual feedback for pinch state

3. **Floating letter system:**
   - Letters drift with sine-wave bobbing
   - Wrap-around screen edges
   - Speed increases with difficulty

4. **Scoring and feedback:**
   - Base points: 100 per match
   - Speed bonus: Up to 50 points
   - Streak multiplier: 1.5x at 5+, 2x at 10+

5. **Progressive difficulty:**
   - Level 1-3: Easy (3 letters, slow)
   - Level 4-7: Medium (5 letters, medium)
   - Level 8+: Hard (7+ letters, fast, confusing pairs)

### Enhancements for Future Versions
1. **Multiplayer mode:** Race to find matches first
2. **Letter tracing integration:** Trace letter after match
3. **Word building:** Match letters to form simple words
4. **Custom letter sets:** Parent-defined practice letters
5. **Progress dashboard:** Track improvement over time

### Experimental Features
- **AR mode:** Letters float in real room space
- **Voice control:** Say letter name to highlight matching letters
- **Adaptive difficulty:** AI adjusts speed based on performance

---

## 7. Visual Identity

- **Overall look:** Bright, magical, floating letter wonderland
- **Camera view:** Full screen gameplay with floating elements
- **Art style:** 3D-styled letters with soft shadows and gradients
- **Mood:** Whimsical, encouraging, magical
- **Colors:**
  - Background: Soft pastel gradient (#E8F4F8 to #F0E6FF)
  - Letters: Vibrant primary colors with white highlights
  - Success: Bright green with gold sparkles (#4CAF50, #FFD700)
  - Error: Gentle red with soft shake (#FF6B6B)
  - UI: Soft purple accents (#9C27B0)
- **Environment:** Floating against a dreamy sky with soft clouds
- **UI style:** Rounded, friendly, with soft shadows
- **Active vibe:** "Catch the floating letters!" ✨

### Letter Card Design
```
┌─────────────────┐
│  ┌───────────┐  │
│  │     A     │  │  ← 3D depth effect
│  │   ╱   ╲   │  │  ← Soft shadow
│  └───────────┘  │
│   Light glow    │
└─────────────────┘
```

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Select match mode | Mode buttons (Upper/Lower, Sound, Mixed), Start button |
| **Tutorial** | Learn controls | Animated hand demo, practice grab |
| **Gameplay** | Core experience | Floating letters, target display, score, progress |
| **Match Success** | Reward feedback | Celebration particles, points popup, streak display |
| **Match Wrong** | Gentle correction | Shake animation, hint highlight, retry prompt |
| **Level Complete** | Progress milestone | Stats, next level button, reward preview |
| **Game Complete** | Final celebration | Total score, accuracy, rewards earned, play again |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Glowing cursor follows hand |
| Prepare grab | Hand near letter | Letter highlights, scales up slightly |
| Grab letter | Pinch (index + thumb touch) | Hand cursor closes, letter "sticks" to hand |
| Release/Match | Release pinch over target zone | Letter snaps to match, success effect |
| Select letter (fallback) | Click/tap letter | Same grab effect |
| Start game | Click Start button | Game begins, letters appear |

### CV Control Details
- **Hand tracking:** Index finger tip position mapped to cursor
- **Pinch detection:** Distance between index tip and thumb tip < 0.05 normalized
- **Grab radius:** 80px hit detection around letter center
- **Cursor states:** 
  - Open hand: Normal cursor
  - Near letter: Highlight ring
  - Pinching: Closed hand icon
  - Holding: Letter attached to cursor
- **Visual feedback:** Trail effect when moving quickly

---

## 10. Core Mechanics

### Floating Letter System
```typescript
// Letter movement parameters
interface FloatingLetter {
  id: string;
  char: string;           // 'A', 'b', etc.
  type: 'uppercase' | 'lowercase' | 'sound';
  x: number;              // 0-1 normalized position
  y: number;              // 0-1 normalized position
  velocityX: number;      // Horizontal drift speed
  velocityY: number;      // Vertical bob speed
  bobOffset: number;      // Sine wave offset for bobbing
  isGrabbed: boolean;
  isTarget: boolean;      // Is this the target to match?
}

// Movement update (per frame)
x += velocityX * deltaTime;
y = baseY + sin(time * bobSpeed + bobOffset) * bobAmplitude;

// Screen wrapping
if (x > 1.1) x = -0.1;   // Wrap right to left
if (x < -0.1) x = 1.1;   // Wrap left to right
```

### Match Validation
```typescript
// Match types
enum MatchType {
  UPPER_TO_LOWER,    // 'A' matches 'a'
  LETTER_TO_SOUND,   // 'A' matches /eɪ/ sound
  MIXED             // Random combination
}

// Validation logic
function isMatch(target: Letter, selected: Letter, type: MatchType): boolean {
  switch (type) {
    case MatchType.UPPER_TO_LOWER:
      return target.char.toLowerCase() === selected.char.toLowerCase() &&
             target.type !== selected.type;
    case MatchType.LETTER_TO_SOUND:
      return target.char.toLowerCase() === selected.char.toLowerCase();
    case MatchType.MIXED:
      return target.char.toLowerCase() === selected.char.toLowerCase();
  }
}
```

### Scoring Formula
```
Base Points: 100 per match
Speed Bonus: max(0, 50 - timeTaken * 10)  // Faster = more points
Streak Bonus: multiplier based on consecutive matches
  - 1-2 matches: 1.0x
  - 3-4 matches: 1.25x
  - 5-9 matches: 1.5x
  - 10+ matches: 2.0x

Total = (Base + Speed Bonus) × Streak Multiplier
```

### Difficulty Scaling
| Level | Letters Visible | Base Speed | Bob Amplitude | Special |
|-------|----------------|------------|---------------|---------|
| 1 | 3 | 0.1 | 0.05 | Vowels only |
| 2 | 3 | 0.12 | 0.06 | A-M range |
| 3 | 4 | 0.15 | 0.07 | Full alphabet |
| 4 | 5 | 0.18 | 0.08 | N-Z added |
| 5 | 5 | 0.20 | 0.09 | Mixed range |
| 6+ | 7 | 0.25+ | 0.10 | Confusing pairs (b/d/p/q) |

---

## 11. Rules

- **Start:** Select match mode, click Start
- **Objective:** Match all letter pairs in the level
- **Allowed:**
  - Grab any visible letter
  - Release and re-grab if wrong letter selected
  - Take time to scan before grabbing
  - Touch/mouse fallback anytime
- **Restricted:**
  - Cannot grab multiple letters at once
  - Must match target letter (can't match random pairs)
  - No penalty for wrong grabs (educational focus)
- **Scoring:** Based on speed + streak multiplier
- **Wrong grab:** Letter shakes, gentle error sound, try again
- **Win condition:** Match all required pairs for the level

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Target Display | Show letter to match | Each new target |
| Floating Letters | Interactive game elements | Continuous (60fps) |
| Score | Current points | After each match |
| Streak Counter | Consecutive matches | On each correct match |
| Progress | "Match X of Y" | After each match |
| Level Indicator | Current difficulty level | Between levels |
| Hand Cursor | Player hand position | Real-time (30fps) |
| Pinch Indicator | Show grab readiness | Real-time |
| Pause Button | Access pause menu | Static |

### Layout
```
┌─────────────────────────────────────┐
│  Score: 1,250    Streak: 🔥 x5      │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────┐          │
│    │   TARGET: A         │  ← Large target display
│    │   "Find lowercase a"│     with instruction
│    └─────────────────────┘          │
│                                     │
│        ☁️              ☁️           │
│            ┌───┐                    │
│            │ a │ ← floating letter  │
│            └───┘                    │
│     ┌───┐        ┌───┐             │
│     │ B │   ☁️   │ c │  letters     │
│     └───┘        └───┘             │
│              ┌───┐                  │
│              │ D │                  │
│              └───┘                  │
│                                     │
├─────────────────────────────────────┤
│  Progress: Match 5 of 10     [||]   │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Correct Match)
- Sparkle particle burst from matched letters
- Success chime sound (ascending notes)
- Haptic vibration (light, pleasant)
- Voice: "Great job! A matches a!"
- Score floats up with "+150" animation
- Streak counter updates with fire effect
- Matched letters animate together briefly

### Failure (Wrong Grab)
- Gentle "whoosh" error sound (not harsh)
- Letter shakes side-to-side (subtle)
- Soft red tint on letter
- Voice: "That's not quite right, try again!"
- Streak continues (no penalty in educational mode)
- Letter returns to floating position

### During Gameplay
- Letters bob gently with sine wave motion
- Highlight ring appears when cursor near letter
- Letter scales up 10% on hover
- Cursor leaves faint trail when moving quickly
- Background clouds drift slowly (ambient motion)

### Streak Feedback
| Streak | Visual | Sound | Voice |
|--------|--------|-------|-------|
| 1-2 | - | Standard | "Great!" |
| 3-5 | Small flames | Rising tone | "Awesome!" |
| 6-9 | Larger flames | Fanfare start | "Amazing!" |
| 10+ | Full fire + glow | Victory fanfare | "Unstoppable!" |

### Level Progression
- Screen flash with color change between levels
- "Level Up!" banner with trumpet sound
- Brief speed slow-down then resume faster
- New letter types introduced with spotlight

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base Match | 100 points |
| Speed Bonus | Up to 50 points (faster = more) |
| Streak Multiplier | 1.0x → 1.25x → 1.5x → 2.0x |
| Level Complete | 200 bonus points |

### Example Score Calculation
```
Match 1 (2.5s): 100 + 25 = 125 × 1.0 = 125
Match 2 (1.8s): 100 + 32 = 132 × 1.0 = 132
Match 3 (1.2s): 100 + 38 = 138 × 1.25 = 172
Match 4 (0.9s): 100 + 41 = 141 × 1.25 = 176
Match 5 (1.5s): 100 + 35 = 135 × 1.5 = 202
Total: 807 points
```

### Rewards (Drops)
Based on Word Workshop theme:
- Letter A card (20% chance)
- Star sticker (15% chance)
- Book item (10% chance)
- Owl companion (5% chance at 90%+ accuracy)

### Easter Eggs
- **Alphabet Master:** Match all 26 letters in one session
  - Reward: Golden Alphabet Trophy
  - Hint: "Can you catch every letter?"
- **Speed Demon:** Complete 10 matches in under 30 seconds
  - Reward: Lightning Bolt sticker
  - Hint: "How fast can you go?"
- **Streak Champion:** Reach 15x streak
  - Reward: Fire Crown accessory
  - Hint: "Don't stop now!"

### Progression
- Session-based levels (10 matches per level)
- Difficulty increases each level
- Personal best tracking for score and streak
- Letter collection book fills as you play

---

## 15. End States

### Match Correct
- Celebration effects (particles, sound)
- Score update with bonus calculation
- Streak increment
- Voice feedback
- Brief pause (0.5s) for celebration
- Next target letter appears
- New letter floats in to replace matched one

### Match Wrong
- Gentle error indication (shake, soft sound)
- Voice correction with hint
- Streak maintained (educational mode)
- Letter returns to pool
- Try again with same target

### Level Complete
- Level completion banner
- Bonus points awarded
- Difficulty increase announcement
- Option to continue or rest
- Brief celebration animation

### Game Complete
- Final score display with breakdown
- Accuracy percentage shown
- Rewards/drops earned
- Personal best comparison
- Options: Play Again, Change Mode, Exit
- Progress saved via completeGame hook

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Tracking with Pinch)
Full hand tracking with pinch-to-grab mechanics as described above.

### Mode B: Touch/Mouse Only (Fallback)
- Click or tap letters directly
- No hand tracking required
- Same gameplay, different input method
- Suitable for tablets and desktop

### Mode C: Voice-Assisted Mode
- Player can say letter name to highlight matching letters
- "Show me the A" - all 'A' letters glow
- Combines hand tracking with voice hints
- Great for early learners

### Mode D: Cooperative Mode
- Two players work together
- Each player grabs one letter of the pair
- Requires coordination and communication
- Letters color-coded by player

### Mode E: Timed Challenge
- Fixed time limit (60 seconds)
- Match as many as possible
- Speed prioritized over accuracy
- Leaderboard for high scores

---

## 17. Improvement Opportunities

### Low Cost
- Add more particle effects (different colors per letter)
- Letter "wiggle" animation when cursor nearby
- Background music (gentle, upbeat)
- More voice lines for variety
- Achievement notifications

### Medium Effort
- Letter tracing after match (extend to tracing game)
- Word mode - match letters to spell words
- Seasonal themes (falling leaves, snow, etc.)
- Custom letter sets for practice
- Parent progress dashboard

### Ambitious
- AR mode with letters in real space
- Multiplayer competitive mode
- AI difficulty adjustment based on performance
- Integration with school curriculum standards
- Sign language mode (match letters to signs)

---

## 18. Content Model

### Letter Data Structure
```typescript
interface LetterData {
  char: string;              // 'A', 'a', etc.
  type: 'uppercase' | 'lowercase';
  name: string;              // "ay", "bee"
  sound: string;             // Phonetic pronunciation
  exampleWords: string[];    // ["Apple", "Ant"]
  color: string;             // Visual theme color
}

const ALPHABET_DATA: LetterData[] = [
  { char: 'A', type: 'uppercase', name: 'ay', sound: '/eɪ/', exampleWords: ['Apple', 'Ant'], color: '#FF6B6B' },
  { char: 'a', type: 'lowercase', name: 'ay', sound: '/eɪ/', exampleWords: ['apple', 'ant'], color: '#FF6B6B' },
  // ... B-Z
];
```

### Confusing Letter Pairs
For Hard difficulty:
- b / d / p / q (rotation confusion)
- m / n (visual similarity)
- i / l (visual similarity)
- u / v (visual similarity)

### Level Configuration
```typescript
interface LevelConfig {
  level: number;
  matchCount: number;        // Matches needed to complete
  lettersVisible: number;    // How many letters float at once
  baseSpeed: number;         // Movement speed
  includeConfusing: boolean; // Include similar-looking letters
  types: MatchType[];        // Which match types appear
}

const LEVELS: LevelConfig[] = [
  { level: 1, matchCount: 5, lettersVisible: 3, baseSpeed: 0.1, includeConfusing: false, types: ['UPPER_TO_LOWER'] },
  { level: 2, matchCount: 7, lettersVisible: 4, baseSpeed: 0.15, includeConfusing: false, types: ['UPPER_TO_LOWER'] },
  // etc.
];
```

---

## 19. Technical Structure

### Main Files
| File | Purpose | Estimated Lines |
|------|---------|-----------------|
| `LetterMatch.tsx` | Main React component | 350-400 |
| `letterMatchLogic.ts` | Pure game logic functions | 300-350 |
| `letterMatch.types.ts` | TypeScript interfaces | 50-75 |

### Key Components in LetterMatch.tsx
- `LetterMatchContent` - Core game implementation
- `LetterMatch` (default) - GameShell wrapper
- `FloatingLetter` - Individual letter component
- `TargetDisplay` - Target letter and instruction display
- `ScoreDisplay` - Score and streak UI
- `HandCursor` - Custom cursor with pinch state

### Logic Functions (letterMatchLogic.ts)
| Function | Purpose |
|----------|---------|
| `createLetters()` | Generate floating letter set |
| `updateLetterPositions()` | Frame-by-frame position update |
| `checkGrabCollision()` | Detect grab within letter radius |
| `validateMatch()` | Check if grabbed letter matches target |
| `calculateScore()` | Compute points with bonuses |
| `getNextTarget()` | Select next target letter |
| `generateConfusingSet()` | Create challenging letter groups |

### Hooks Used
- `useGameHandTracking` - Hand position and pinch detection
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Voice feedback

### State Management
```typescript
interface GameState {
  letters: FloatingLetter[];
  targetLetter: Letter;
  score: number;
  streak: number;
  level: number;
  matchesCompleted: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'complete';
  handPosition: { x: number; y: number };
  isPinching: boolean;
  heldLetter: Letter | null;
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
| Optimal grab radius | 80px based on similar games | Medium |
| Pinch detection threshold | 0.05 normalized distance | Medium |
| Letter floating speed | Start slow (0.1), scale to 0.25 | Medium |
| Best voice phrases | Test with children for engagement | Low |
| Confusing letter difficulty | May need adjustment based on age | Medium |
| Ideal session length | 3-4 minutes for 3-6 age group | Medium |
| Haptic intensity | Light vibration preferred | High |

---

## 21. Implementation Notes

### Strengths to Build On
- Hand tracking infrastructure is mature
- TTS system provides clear feedback
- Similar games (Letter Sound Match) provide patterns
- Educational focus means forgiving gameplay

### Architecture Patterns
- Separate logic from presentation
- Use refs for animation frame data
- Throttle hand tracking callbacks
- Debounce pinch detection

### Testing Considerations
- Test pinch detection with various hand sizes
- Verify letter visibility at all screen sizes
- Ensure voice feedback timing feels right
- Test with actual children for difficulty calibration

### Performance Notes
- Limit concurrent animations
- Pool particle effects
- Optimize hit detection (spatial partitioning if many letters)
- Use requestAnimationFrame for smooth motion

---

## 22. Acceptance Criteria

- [ ] Hand tracking initializes and shows cursor
- [ ] Pinch gesture detects grabs accurately
- [ ] Letters float with smooth bobbing animation
- [ ] Three match modes work (Upper/Lower, Sound, Mixed)
- [ ] Match validation works correctly
- [ ] Score calculates with speed and streak bonuses
- [ ] Streak system tracks consecutive matches
- [ ] Voice feedback plays for instructions and feedback
- [ ] Touch/mouse fallback functions correctly
- [ ] Progressive difficulty increases appropriately
- [ ] Visual feedback (particles, sounds) plays on match
- [ ] Game completes after required matches
- [ ] Final score displays with breakdown
- [ ] Progress saves on completion
- [ ] Easter eggs trigger correctly

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, complete all matches
- [ ] Play medium mode, verify more letters appear
- [ ] Play hard mode, verify confusing letters appear
- [ ] Get a match wrong, verify gentle correction
- [ ] Build 5+ streak, verify multiplier applies
- [ ] Complete level, verify difficulty increases
- [ ] Complete game, verify final score display

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Cursor follows hand smoothly
- [ ] Pinch detection triggers grab
- [ ] Grab radius feels appropriate
- [ ] Letter highlights when cursor near
- [ ] No hand = no cursor (safe state)

### Fallback Tests
- [ ] Touch letters work
- [ ] Mouse clicks work
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid grab attempts (don't crash)
- [ ] Multiple letters near each other (nearest wins)
- [ ] Hand lost mid-grab (graceful handling)
- [ ] Tab switch during game (pause behavior)

### Performance
- [ ] 60fps maintained with 7+ letters
- [ ] No memory leaks in animation loop
- [ ] Smooth on target devices (tablets)

---

**Last Updated:** 2026-04-03  
**Confidence:** Specification - Ready for Implementation

**Related:**
- Similar Games: `src/frontend/src/pages/LetterSoundMatch.tsx`
- Hand Tracking: `src/frontend/src/hooks/useGameHandTracking.ts`
- Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts`
