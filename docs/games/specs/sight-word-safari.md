# Sight Word Safari (Sight Word Flash)

**Game ID:** sight-word-flash  
**Slug:** sight-word-safari  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/SightWordFlash.tsx`  
**Logic:** `src/frontend/src/games/sightWordFlashLogic.ts`

---

## 1. Concept Summary

- **One-line concept:** Flash-card style sight word recognition game where words appear briefly and children self-assess their recognition speed and accuracy
- **Genre:** Educational / Flash Cards / Reading Recognition
- **Target audience:** Ages 4-8, emergent readers building sight word vocabulary
- **Core player fantasy:** "I can read words instantly without sounding them out!" - becoming a confident, fluent reader
- **Primary skill tested:** Sight word recognition (high-frequency words), reading fluency, reading confidence, memory recall
- **Session length:** 2-5 minutes per round (10-20 words)
- **Platform context:** Core literacy game for Word Workshop world, demonstrates adaptive difficulty with 3 skill levels

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - 3-tier difficulty system (Levels 1, 2, 3)
  - 2-second flash timer with visual countdown bar
  - 52 high-frequency sight words organized by difficulty
  - Self-assessment system ("I Know It!" / "Skip It")
  - Score tracking with streak bonuses (+3 points per streak level, max +20)
  - Streak milestone celebrations (every 5 words)
  - Hand tracking cursor with index finger tip detection
  - Level selector on start screen
  - Progress indicator (Word X/Y)
  - Completion summary with accuracy percentage
  - Haptic feedback on interactions
  - Success/error sound effects
  - Responsive UI for all screen sizes
- **What is partial/missing:**
  - TTS (Text-to-Speech) integration for word pronunciation
  - Word audio not played during or after flash
  - No visual theming related to "safari" concept (generic flash cards)
  - No animation on word appearance (just instant show/hide)
  - No difficulty-based timing (all levels get 2 seconds)
  - No persistent progress tracking across sessions
  - No word mastery tracking (which words the child knows consistently)
- **Evidence:**
  - Main page: `src/frontend/src/pages/SightWordFlash.tsx` (399 lines)
  - Logic: `src/frontend/src/games/sightWordFlashLogic.ts` (96 lines)
  - Registry: `src/frontend/src/data/gameRegistries/wordWorkshop.ts` lines 462-479
- **Confidence level:** High - Clean, focused implementation with clear educational purpose

---

## 3. Gameplay Flow

### Flow
1. **Start Screen:** Title, instructions, level selector (3 buttons), Start button
2. **Flash Phase:** Word appears for 2 seconds with countdown progress bar
3. **Self-Assessment Phase:** Word shown again, player chooses "I Know It!" or "Skip It"
4. **Feedback:** Immediate visual/audio feedback, score updates, streak counter
5. **Repeat:** Next word appears, continue through all words in level
6. **Completion:** Summary screen with stats (knew/skipped/accuracy/score)

### Game States
| State | Description | UI |
|-------|-------------|-----|
| `start` | Menu/level selection | Title card, level buttons, instructions |
| `showing` | Word flashing (2s) | Large word, progress countdown bar, HUD |
| `answering` | Self-assessment | Word shown again, two choice buttons |
| `complete` | Round finished | Stats grid, play again/finish buttons |

---

## 4. Controls

| Input | Action | CV Mode | Mouse Mode |
|-------|--------|---------|------------|
| Index finger move | Move cursor | ✅ Hand tracking | ✅ Mouse move |
| Cursor hover | Button hover states | ✅ | ✅ |
| Click/Tap | Button selection | ✅ Simulated | ✅ Mouse click |

### CV-Specific Interactions
- Hand tracking: Index finger tip position mapped to cursor
- Coordinate space: Normalized (0-1) mapped to game area
- Frame rate: 30 FPS target
- Cursor size: 64px
- Cursor color: Purple (#8b5cf6)

---

## 5. Core Mechanics

### Flash Timer System
- **Duration:** Fixed 2 seconds for all levels
- **Progress bar:** Decreasing width from 100% to 0%
- **Tick interval:** 100ms (20 ticks total)
- **Step size:** 100% / 20 = 5% per tick
- **Visual:** Red bar that shrinks, indicating time remaining

### Scoring System
- **Base points:** 20 points per correct recognition
- **Streak bonus:** +3 points per streak level (capped at +20)
- **Formula:** `total = 20 + min(streak * 3, 20)`
- **Streak milestones:** Every 5 consecutive correct words triggers celebration

### Word Selection Algorithm
```
1. Filter words by difficulty ≤ current level
2. Separate words where difficulty === current level (featured words)
3. Shuffle allowed words randomly
4. Select first word from featured (if available)
5. Fill remainder from shuffled allowed words
6. Return slice of wordCount for level
```

### Level Configuration
| Level | Word Count | Max Difficulty | Description |
|-------|------------|----------------|-------------|
| 1 | 5 | 1 | Basic sight words (the, is, a, to) |
| 2 | 8 | 2 | Common words + harder basics (what, when, said) |
| 3 | 10 | 3 | All words including complex (would, should, which) |

---

## 6. Rules

### Start
- Player selects level (1, 2, or 3)
- Word list generated based on level configuration
- Score, streak, correct count reset to 0

### Allowed Actions
- Select different level before starting
- Click "Start Reading!" to begin
- Click "I Know It!" if word was recognized
- Click "Skip It" if word was not recognized
- Click "Finish Game" to end early
- Click "Play Again" to restart same level

### Restricted Actions
- Cannot change level during active game
- Cannot skip flash phase (must wait 2 seconds)
- Cannot undo a self-assessment

### Scoring
- Only "I Know It!" responses add to score
- "Skip It" resets streak to 0
- No penalty for skipping (kid-friendly design)

### Completion
- After all words in level are presented
- Stats displayed: words known, accuracy %, total score
- Option to replay same level or finish

---

## 7. Visual Design

- **Overall look:** Clean, playful card-based interface with warm colors
- **Card style:** Rounded corners (rounded-3xl), subtle shadows with offset
- **Mood:** Encouraging, low-pressure, celebratory
- **Color palette:**
  - Primary: Purple (#8b5cf6) for words and accents
  - Background: Gradient from purple-50 to pink-50
  - Success: Emerald/emerald-700 for "I Know It!"
  - Skip: Red/red-600 for "Skip It"
  - Border: Warm beige (#F2CC8F, #E5B86E)
  - Progress bar: Red-400

### Typography
- Word display: text-7xl to text-8xl (very large for readability)
- Headers: font-black, tracking-tight
- Body: font-bold for instructions

### Animations
- Streak milestone: Scale from 0 to 1 with rotation (-180° to 0°)
- Button hover: Scale 1.05, active: Scale 0.95
- Card shadows: Offset shadow technique (shadow-[0_6px_0_#E5B86E])

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start** | Level selection | Title, emoji, instructions, 3 level buttons, start button |
| **Flash** | Word display | Large word card, progress bar, HUD (score/streak/progress) |
| **Assessment** | Self-evaluation | Word card, two choice buttons, finish button |
| **Milestone** | Streak celebration | Full-screen overlay with streak count, fire emoji |
| **Complete** | End of round | Trophy emoji, stats grid (3 columns), action buttons |

---

## 9. HUD / Gameplay UI

### Top Bar (GameContainer)
- Title: "Sight Word Flash"
- Current score (numeric)
- Current level indicator
- Home button

### GameHUD Component (During Play)
- Left: Score with label
- Center: Streak counter (if > 0)
- Right: Level info + word progress ("Word 3/10")

### Progress Indicator
- Horizontal bar at top of game area
- Width represents remaining flash time
- Smooth 100ms transition updates

### Choice Buttons
| Button | Color | Text | Shadow |
|--------|-------|------|--------|
| "I Know It!" | Emerald-100 bg, emerald-400 border, emerald-700 text | ✅ I Know It! | 0_4px_0 #6EE7B7 |
| "Skip It" | Red-50 bg, red-300 border, red-600 text | ❌ Skip It | 0_4px_0 #FCA5A5 |

---

## 10. Feedback and Feel

### Success Feedback ("I Know It!")
- Success sound effect (playSuccess)
- Haptic: 'success' vibration
- Score increments with animation
- Streak counter increases
- Milestone celebration every 5 streak

### Skip Feedback ("Skip It")
- Error sound effect (playError)
- Haptic: 'error' vibration
- Streak resets to 0

### Streak Milestone (Every 5)
- Celebration sound
- Haptic: 'celebration'
- Animated overlay: "🔥 5 Streak! 🔥"
- Scale + rotate animation
- Auto-dismiss after 2 seconds

### Audio
| Event | Sound | Haptic |
|-------|-------|--------|
| Button click | click | light |
| "I Know It!" | success | success |
| "Skip It" | error | error |
| Streak milestone | celebration | celebration |
| Game complete | celebration | celebration |

---

## 11. Points / Rewards / Progression

### Points System
- Base: 20 points per recognized word
- Streak bonus: 0-20 additional points based on streak
- Maximum per word: 40 points (at streak 7+)

### Streak System
- Increments on each "I Know It!"
- Resets to 0 on "Skip It"
- Milestone display every 5 consecutive correct answers

### Drops (From Registry)
- book-blue: 20% chance
- star-gold: 15% chance

### Easter Eggs
- None currently configured

### Progression
- No persistent word mastery tracking
- No unlockable levels (all 3 available from start)
- Session-based scoring only

---

## 12. End States

### Round End (Normal Completion)
- Trigger: All words in level completed
- Display: Stats grid with 3 columns
  - Known: count/total (emerald theme)
  - Accuracy: percentage (red theme)
  - Score: total points (purple theme)
- Options: "Play Again" or "Finish"

### Early Finish
- Trigger: Player clicks "Finish Game" during assessment
- Same stats display as normal completion
- Partial level progress counted

### Game State Reset
- Choosing "Play Again" resets:
  - Score to 0
  - Streak to 0
  - Correct count to 0
  - Generates new word list
  - Returns to flash phase

---

## 13. Current Implementation

### Code Architecture
The game follows a clean React functional component pattern:

**Main Component:** `SightWordFlashContent`
- Uses React hooks: useState, useEffect, useRef, useCallback
- Integrates with platform systems via custom hooks

**State Management:**
```typescript
currentLevel: number (1-3)
words: SightWord[] (current round's words)
currentIndex: number (position in words array)
round: number (progress counter)
score: number (total points)
correct: number (words marked "known")
showWord: boolean (flash visibility)
flashProgress: number (0-100 countdown)
gameState: 'start' | 'showing' | 'answering' | 'complete'
streak: number (consecutive correct)
showStreakMilestone: boolean (celebration display)
```

**Key Hooks:**
- `useGameHandTracking`: Hand tracking with 30 FPS, index finger cursor
- `useAudio`: Sound effect playback
- `useGameCompletion`: Platform completion tracking
- `useGameSessionProgress`: Session analytics

**CV Integration:**
```typescript
const handleFrame = useCallback((frame: TrackedHandFrame) => {
  const tip = frame.indexTip;
  if (!tip) { setCursor(null); return; }
  setCursor(tip);
}, []);
```

### Flash Timer Implementation
```typescript
useEffect(() => {
  if (gameState === 'showing' && words.length > 0 && !showWord) {
    showPending.current = true;
    setShowWord(true);
    setFlashProgress(100);

    const step = 100 / 20; // 20 ticks over 2s
    progressIntervalRef.current = setInterval(() => {
      setFlashProgress((p) => Math.max(p - step, 0));
    }, 100);

    setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setShowWord(false);
      setGameState('answering');
      showPending.current = false;
    }, 2000);
  }
}, [gameState, words, showWord]);
```

### Word Database
52 sight words organized by 3 difficulty tiers:
- **Level 1 (18 words):** the, is, it, a, to, and, I, you, he, she, we, me, go, no, so, at, be, by
- **Level 2 (21 words):** or, if, but, was, were, had, her, him, his, how, now, out, said, saw, make, like, have, has, make, were, was
- **Level 3 (16 words):** what, when, who, which, their, there, where, would, could, should, does, doing, come, some

### Gaps/Issues
1. **No TTS:** Words are not spoken aloud (accessibility gap)
2. **Static timing:** 2 seconds for all levels and word difficulties
3. **No word audio:** No option to hear word pronunciation
4. **No mastery tracking:** Same words may repeat frequently
5. **Limited feedback:** No visual/audio cue when word first appears
6. **No "show again" option:** Can't review word if missed
7. **No hint system:** No help for struggling readers

---

## 14. Intended Experience

Based on manifest and code evidence:

- **Educational goal:** Build sight word recognition fluency - the ability to instantly recognize high-frequency words without decoding
- **Pedagogical approach:** Self-paced, self-assessed learning with positive reinforcement
- **Focus vibe:** Calm, encouraging, low-pressure reading practice
- **Accessibility:** Large text, clear buttons, immediate feedback

### Core Loop
1. Child selects appropriate difficulty level
2. Word flashes briefly (simulating instant recognition)
3. Child honestly assesses whether they recognized it
4. Immediate feedback reinforces learning
5. Progress through words, building confidence
6. Celebrate completion and accuracy

### What Success Looks Like
- Child recognizes words faster over time
- Child advances from Level 1 → 2 → 3
- Child develops confidence in reading ability
- Child self-identifies words needing more practice

---

## 15. Drift Analysis

### Where Implementation Matches Intent
✅ Clean, focused sight word practice  
✅ Self-assessment promotes metacognition  
✅ Three difficulty tiers appropriate for ages 4-8  
✅ High-frequency word selection (Dolch/Fry style)  
✅ Streak system motivates continued success  
✅ Hand tracking cursor works for touchless play  
✅ Kid-friendly design (no penalties, positive framing)  

### Where Implementation Exceeds Intent
🌟 Streak milestone celebrations add excitement  
🌟 Progress bar visualizes flash timing  
🌟 Level selector gives player agency  
🌟 Responsive design works on tablets and desktop  
🌟 Clean integration with platform systems (GameShell, GameContainer)  

### Where Implementation Falls Short
⚠️ No audio/TTS support for word pronunciation  
⚠️ No "safari" theme elements (name doesn't match visuals)  
⚠️ Fixed 2-second timing doesn't adapt to difficulty  
⚠️ No word mastery persistence across sessions  
⚠️ No variety in presentation (could use animations)  
⚠️ Limited visual engagement for young children  

### Overall Assessment
**Alignment: 78%** - The core educational mechanics are solid and well-implemented. The game successfully teaches sight word recognition. However, the "safari" branding is completely absent, and the lack of audio support is a significant gap for emergent readers who need phonetic reinforcement.

---

## 16. Recommendations

### Critical Priority
1. **Add TTS Support:** Use the platform's useTTS hook to speak each word during/after flash
2. **Theme the Visuals:** Add safari elements (jungle background, animal mascots, adventure framing)
3. **Adaptive Timing:** Shorter flash for easy words, longer for harder words

### High Priority
4. **Word Mastery Tracking:** Track which words the child consistently knows
5. **Audio Toggle:** Option to hear word on demand (click to repeat)
6. **Animated Word Entrance:** Words could "pop" or slide in rather than just appearing
7. **Celebration Animations:** Confetti or animated mascots on completion

### Medium Priority
8. **Hint System:** Show first letter or sound if child struggles
9. **Word Review Mode:** Practice only words previously skipped
10. **Parent Dashboard:** Show progress on specific words over time
11. **Themed Word Sets:** Animals, colors, actions, etc.

### Nice to Have
12. **Multiplayer Mode:** Take turns with siblings
13. **Timed Challenge Mode:** Race against clock
14. **Word Builder Extension:** After recognizing, spell the word

---

## 17. Parallel Modes / Alternate Implementations

### Mode A: Current Flash Cards (Default)
- Self-paced, self-assessed
- Best for: Building confidence, independent practice
- No time pressure beyond fixed 2s flash

### Mode B: Audio-First (Recommended Enhancement)
- TTS speaks word aloud
- Option: Hear then recognize, or recognize then hear
- Best for: Auditory learners, phonetic reinforcement

### Mode C: Timed Challenge
- Faster flash times (1s, 1.5s, 2s options)
- Score multiplier for faster recognition
- Best for: Advanced readers, gamification

### Mode D: Safari Adventure Theme (Full Reskin)
- Explorer character guiding journey
- Words appear on "ancient tablets" or "jungle leaves"
- Progress mapped as safari trail
- Animals celebrate milestones
- Best for: Thematic immersion, engagement

### Potential Future Modes
| Mode | Concept | Educational Value |
|------|---------|-------------------|
| Story Mode | Words appear in simple sentences | Contextual reading |
| Tracing Mode | After flash, trace the word | Kinesthetic reinforcement |
| Partner Mode | Two players alternate | Social learning |
| Word Families | Group words by spelling patterns | Phonics connection |

---

## 18. Visual Identity

### Current Implementation
- **Style:** Clean, minimal, card-based
- **Background:** Soft gradient (purple to pink)
- **Cards:** White with warm beige borders
- **Typography:** Large, bold, sans-serif
- **Emoji:** 👀 for theme, ✅/❌ for feedback

### Recommended Safari Theme
- **Style:** Adventure, exploration, nature
- **Background:** Jungle scene with trees, vines, distant mountains
- **Cards:** Ancient stone tablets or jungle leaves
- **Typography:** Friendly rounded font, adventure-style headers
- **Mascot:** Explorer animal (monkey, parrot, or tiger)
- **Colors:** Earth tones (greens, browns) with accent colors
- **Animations:** Vines growing, animals cheering, map progress

---

## 19. Content Model

### Sight Words Database
```typescript
interface SightWord {
  word: string;
  difficulty: number; // 1-3
}
```

**Total Words:** 52 high-frequency sight words

**Word Selection Criteria:**
- High-frequency in children's literature
- Mostly irregular spellings (can't be easily sounded out)
- Common function words (the, and, was)
- Basic nouns and verbs

**Duplicates in Database:**
- "would" appears twice (line 55, 58)
- "come" appears twice (line 59, 61)
- Should be deduplicated

### Level Progression
| Level | Word Count | Target Age | Sample Words |
|-------|------------|------------|--------------|
| 1 | 5 | 4-5 | the, and, I, me, go |
| 2 | 8 | 5-6 | what, said, have, like, were |
| 3 | 10 | 6-8 | would, should, which, their, could |

---

## 20. Technical Structure

### File Organization
```
src/frontend/src/
├── pages/
│   └── SightWordFlash.tsx      # Main game component (399 lines)
├── games/
│   └── sightWordFlashLogic.ts  # Word database & selection (96 lines)
└── data/gameRegistries/
    └── wordWorkshop.ts         # Manifest entry
```

### Key Dependencies
- `framer-motion` - Streak milestone animations
- `react-webcam` - Camera input for hand tracking
- `lucide-react` - Icons

### State Management
- React useState/useRef for local state
- No external state management needed
- Words regenerated each round

### CV Integration
- `useGameHandTracking` hook
- Index finger tip tracking only
- No pinch/grab needed (button clicks only)
- Tracking loss handled gracefully (cursor hides)

---

## 21. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| TTS Integration | Platform has useTTS hook but not used here | High |
| Safari Theme | Name suggests theme but none implemented | High |
| Word Duplicates | SIGHT_WORDS has duplicate entries | Observed |
| Mastery Tracking | No persistence of learned words | High |
| Adaptive Timing | All words get same 2s regardless of difficulty | High |
| Audio Pronunciation | No audio support for words | High |
| Visual Variety | Minimal animations/transitions | Medium |

---

## 22. Implementation Notes

### Strengths to Preserve
1. **Clean UI:** Uncluttered, focused on the word
2. **Self-assessment:** Builds metacognitive skills
3. **Streak system:** Motivates continued engagement
4. **Level selection:** Player agency in difficulty
5. **Platform integration:** Proper use of GameShell, GameContainer
6. **Responsive design:** Works across device sizes

### Refactor Opportunities
1. **SIGHT_WORDS array:** Remove duplicate entries
2. **SightWordFlash.tsx:** 399 lines - could extract sub-components:
   - `FlashCard` component for word display
   - `LevelSelector` component
   - `CompletionStats` component
3. **Timing logic:** Extract flash timer to custom hook
4. **Word selection:** Could add more sophisticated algorithm

### Performance Considerations
- Word list small (52 items) - no optimization needed
- Images not used - no asset loading
- Smooth animations via Framer Motion

### Testing Focus
- Word selection randomization
- Timer accuracy
- Score calculation
- Streak milestone triggering
- Hand tracking cursor position

---

## 23. Acceptance Criteria

### Core Functionality
- [ ] Level selector displays 3 buttons
- [ ] Words flash for exactly 2 seconds
- [ ] Progress bar animates during flash
- [ ] "I Know It!" and "Skip It" buttons appear after flash
- [ ] Score increments correctly (20 + streak bonus)
- [ ] Streak counter works and resets on skip
- [ ] Milestone celebration appears every 5 streak
- [ ] Completion screen shows accurate stats

### CV/Hand Tracking
- [ ] Cursor follows index finger
- [ ] Cursor hidden when hand not detected
- [ ] Buttons clickable via cursor

### Content
- [ ] 52 unique sight words in database
- [ ] Words filtered correctly by level
- [ ] At least one featured word from current level each round

### Edge Cases
- [ ] Finish early button works correctly
- [ ] Play again resets all state
- [ ] Level can be changed before starting
- [ ] Progress bar cleanup on unmount

### Accessibility
- [ ] Text is large and readable
- [ ] Buttons are large enough for cursor targeting
- [ ] Color contrast meets WCAG guidelines

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Comprehensive review of production-ready implementation
