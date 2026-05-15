# Syllable Clap

**Game ID:** syllable-clap  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/SyllableClap.tsx`  
**Logic:** `src/frontend/src/games/syllableClapLogic.ts`  

---

## 1. Concept Summary

- **One-line concept:** Listen to a word and tap the number of syllables, building phonological awareness through clapping rhythm
- **Genre:** Educational / Phonological Awareness / Rhythm
- **Target audience:** Ages 3-6, pre-readers developing phonological skills
- **Core player fantasy:** "I can hear the beats in words and clap along!"
- **Primary skill tested:** Syllable segmentation, phonological awareness, listening skills
- **Session length:** 5-10 minutes (4-10 words per level)
- **Platform context:** Foundational phonics game with progressive difficulty

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - 4 progressive difficulty levels (1-4 syllables)
  - 25-word vocabulary bank with emojis and hints
  - Hand tracking integration for CV-based tapping
  - Number button selection (1-4 syllables)
  - Score system with streak bonuses
  - Streak milestone celebrations (every 5)
  - Kenney Heart HUD for streak visualization
  - Score popup animations on correct answers
  - Haptic feedback integration
  - Level selector (4 levels available)
  - Game completion screen with stats
  - Progress tracking
- **What is partial/missing:**
  - No actual TTS/audio playback for words (visual only)
  - No clap detection (uses tap instead)
  - No syllable breakdown animation
  - Limited to 25 words (could expand)
- **Evidence:**
  - Main file: `src/frontend/src/pages/SyllableClap.tsx` (390 lines)
  - Logic file: `src/frontend/src/games/syllableClapLogic.ts` (68 lines)
  - Uses: `useGameHandTracking` hook with 30fps target
  - Uses: `GameCursor` component for hand visualization
  - Uses: Kenney platformer HUD assets
- **Confidence level:** High - Solid implementation with good level progression

---

## 3. Current Implementation

### Flow
1. **Level Selection:** Choose from 4 levels (buttons at top)
2. **Start Screen:** Game intro with instructions and Start button
3. **Gameplay Loop:**
   - Display word card with emoji and hint
   - Show numbered buttons (1 to max syllables for level)
   - Player taps the syllable count
   - Immediate feedback with color coding
   - Progress to next word
4. **Completion:** After all words, stats screen with replay option

### Level System
| Level | Words | Max Syllables | Content |
|-------|-------|---------------|---------|
| 1 | 4 | 1 | cat, dog, sun, ball, fish, bird |
| 2 | 6 | 2 | + apple, flower, rainbow, water, happy... |
| 3 | 8 | 3 | + banana, elephant, butterfly, computer... |
| 4 | 10 | 4 | + television, helicopter |

### Hand Tracking
```typescript
const { isLoading, isReady, startTracking, webcamRef } = useGameHandTracking({
  gameName: 'SyllableClap',
  targetFps: 30,
  isRunning: isPlaying,
  onFrame: handleFrame,
  onNoVideoFrame: handleNoVideoFrame,
});
```
- 30fps target for responsive interaction
- `GameCursor` component shows hand position
- Falls back to mouse/touch naturally

### Scoring
- Base points: 15 per correct answer
- Streak bonus: +3 per streak level (capped at +15)
- Total points formula: `15 + min(streak × 3, 15)`
- Example: 5-streak = 15 + 15 = 30 points

### Streak System
- Increments on correct answers
- Resets to 0 on incorrect
- Milestone celebration every 5 consecutive correct
- Visual: Kenney Heart HUD (5 hearts showing streak/2)
- Popup: "🔥 N Streak! 🔥" gradient badge

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Develop phonological awareness through syllable counting
- **Pedagogical approach:** Multimodal (visual emoji + hint + syllable counting)
- **Core loop:** See word → Count syllables → Tap number → Receive feedback
- **Accessibility:** Emojis and hints support pre-readers; hand tracking enables touch-free
- **Progression:** 4 levels with increasing syllable complexity

### Game Phases Detail
| Phase | Duration | Action Required | Visual Cue |
|-------|----------|-----------------|------------|
| Level Select | Variable | Choose difficulty level | 4 level buttons |
| Intro | Variable | Read instructions, press Start | Word count preview |
| Word Display | Variable | View word, count syllables | Large emoji + word + hint |
| Selection | Variable | Tap syllable count | Number buttons (1-N) |
| Feedback | 2.5s | View result | Color-coded feedback |
| Transition | Brief | Auto-advance | Next word appears |

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Progressive 4-level difficulty system  
✅ Hand tracking integration for CV play  
✅ Streak system with milestone celebrations  
✅ Visual feedback (emojis, hints, hearts)  
✅ Score system with streak bonuses  
✅ Completion screen with stats  
✅ Level selector allows practice at any difficulty  
✅ Kenney asset integration for visual polish  

### Where Implementation Exceeds Intent
🌟 **Heart HUD visualization** - Creative use of Kenney assets for streak  
🌟 **Score popup animations** - Floating +N points feedback  
🌟 **Streak milestone celebration** - Visual reward every 5 correct  
🌟 **Level flexibility** - Can jump to any level, not locked progression  

### Where Implementation Falls Short
⚠️ **No audio/TTS** - Words are silent (major gap for phonological game)  
⚠️ **No clap detection** - Name suggests clapping, but uses button taps  
⚠️ **No syllable animation** - Doesn't visually break words into syllables  
⚠️ **Small word bank** - Only 25 words total  
⚠️ **No rhythm guidance** - Doesn't teach the "clap" rhythm concept  
⚠️ **Limited CV integration** - Only basic cursor, no gesture recognition  

### Comparison to Similar Games
| Feature | Syllable Clap | Beginning Sounds | Rhyme Time |
|---------|--------------|------------------|------------|
| CV Mode | Hand only | Hand + Voice | Hand only |
| Audio | None | TTS | TTS |
| Levels | 4 levels | Multiple | Single |
| Feedback | Score popups | Mascot | Simple |
| Progression | Word count increases | Difficulty increases | Fixed |

### Overall Assessment
**Alignment: 78%** - Strong level structure and scoring, but missing the core audio component expected in a phonological awareness game. The "clap" in the name is misleading since there's no clapping mechanic.

---

## 6. Recommended Canonical Version

The current implementation with audio enhancements:

### Keep (Current Strengths)
- 4-level progressive difficulty
- Hand tracking cursor integration
- Streak system with Heart HUD
- Score popup animations
- Emoji + hint word cards
- Level selector flexibility
- Completion stats screen

### Enhance
1. **TTS integration:** Speak each word aloud
2. **Clap detection:** Use audio or CV to detect actual clapping
3. **Syllable animation:** Visually break words into syllable blocks
4. **Rhythm guide:** Metronome or visual pulse for clapping rhythm
5. **Word expansion:** Increase to 50+ words per level
6. **Practice mode:** Free play with any word

### Consider Renaming
- "Syllable Tap" or "Syllable Count" more accurately describes current implementation
- Reserve "Syllable Clap" for version with actual clap detection

---

## 7. Visual Identity

- **Overall look:** Bright, cheerful educational environment with game-like elements
- **Camera view:** Small preview, main focus on word cards
- **Art style:** Colorful emojis, Kenney platformer assets, rounded UI
- **Mood:** Playful and encouraging, game-like rather than academic
- **Colors:**
  - Primary: Blue (#3B82F6) for level buttons and progress
  - Accent: Warm gold (#F2CC8F) for card borders
  - Success: Emerald (#10B981) for correct answers
  - Error: Red (#EF4444) for incorrect feedback
  - Hearts: Pink (#EC4899) for streak HUD
  - Background: Gradient blue-to-purple for word cards
- **Environment:** Clean card-based layout with gaming elements
- **UI style:** Large buttons, emoji prominence, heart HUD, bold typography

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Level Selector** | Difficulty choice | 4 level buttons (1-4) |
| **Start Screen** | Game introduction | Emoji, title, instructions, scoring info, Start button |
| **Progress Bar** | Session tracking | Word counter, progress bar, correct count |
| **Heart HUD** | Streak visualization | 5 Kenney hearts + streak multiplier |
| **Score Popup** | Points feedback | Animated floating +N points |
| **Streak Milestone** | Achievement celebration | Gradient "🔥 N Streak! 🔥" badge |
| **Word Card** | Main gameplay | Large emoji, word, hint text, question |
| **Number Buttons** | Answer selection | Large numbered buttons (1 to max) |
| **Feedback Card** | Result confirmation | Color-coded message with syllable count |
| **Completion Screen** | Session end | Stats grid (Correct, Accuracy, Score), replay buttons |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Select level | Button press / Hand tap | Level button highlights, game resets to start screen |
| Start game | Button press / Hand tap | Game begins with first word |
| Count syllables | Mental / Speak aloud | (No current feedback for this step) |
| Select number | Hand cursor tap / Mouse click | Button press animation |
| Navigate | Hand cursor movement | GameCursor follows finger position |
| Finish session | Finish button | Returns to menu with saved progress |
| Replay | Play Again button | Restarts same level with shuffled words |

### CV Technical Details
- **Hand tracking:** `useGameHandTracking` hook
- **Frame rate:** 30fps (responsive for tapping)
- **Cursor:** `GameCursor` with container-relative positioning
- **Interaction:** onClick handlers on button elements
- **Fallback:** Mouse/touch works identically

---

## 10. Core Mechanics

### Level Structure
```
LEVEL SELECT → START → WORD 1 → SELECTION → FEEDBACK → WORD 2 → ... → COMPLETION
```

### Word Selection Per Level
```typescript
export function getWordsForLevel(level: number): SyllableWord[] {
  const config = getLevelConfig(level);
  const filtered = SYLLABLE_WORDS.filter(w => w.syllableCount <= config.maxSyllables);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, config.wordCount);
}
```

### Answer Validation
- Direct number comparison: `correctSyllableCount === selectedNumber`
- Immediate boolean result
- Feedback shows actual syllable count

### Scoring Formula
- Base: 15 points per correct answer
- Streak bonus: `min(streak × 3, 15)` (capped at 15)
- Maximum per correct: 30 points (at streak 5+)

### Streak Mechanics
```typescript
if (isCorrect) {
  const newStreak = streak + 1;
  setStreak(newStreak);
  const streakBonus = Math.min(newStreak * 3, 15);
  const totalPoints = basePoints + streakBonus;
  
  // Milestone every 5
  if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
    setShowStreakMilestone(true);
    triggerHaptic('celebration');
    playCelebration();
  }
} else {
  setStreak(0); // Reset on incorrect
}
```

### Heart HUD Logic
```typescript
// 5 hearts, each represents 2 streak points
{Array.from({ length: 5 }).map((_, i) => (
  <img
    src={streak >= (i + 1) * 2
      ? '/assets/kenney/platformer/hud/hud_heart.png'
      : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
  />
))}
```

---

## 11. Rules

- **Level Select:** Choose from 4 levels before starting
- **Start:** Press "Start Clapping!" button
- **Word Display:** See word, emoji, and hint; count syllables mentally
- **Selection:** Tap the number (1-4) matching syllable count
- **Scoring:** 15 points base + streak bonus for correct answers
- **Streak:** Build consecutive correct answers for bonus points
- **Milestone:** Every 5 streak triggers special celebration
- **Completion:** After all words, view stats and choose replay or finish

### What Counts as Correct
- Exact syllable count match
- Syllable counts are predetermined in word bank
- Examples: cat=1, apple=2, banana=3, television=4

### Level Progression
- Level 1: Master 1-syllable words
- Level 2: Add 2-syllable words
- Level 3: Add 3-syllable words
- Level 4: Include 4-syllable words
- Can replay any level anytime (not locked)

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Level buttons | Difficulty selection | Highlight selected level |
| Progress bar | Session progress | Fills as words complete |
| Word counter | Progress text | "Word X of Y" |
| Correct counter | Score tracking | "Correct: N" |
| Heart HUD | Streak visualization | Hearts fill based on streak/2 |
| Streak multiplier | Bonus indicator | "xN" next to hearts |
| Score popup | Points feedback | Animates on correct answer |
| Streak milestone | Achievement | Appears every 5 streak |
| Word card | Main display | Emoji, word, hint |
| Number buttons | Answer choices | 1 to maxSyllables for level |
| Feedback card | Result message | Green/red with explanation |
| Completion stats | Session summary | Correct, Accuracy%, Score |

### Button States
- **Default:** White with gold border, hover scales up
- **Selected (correct):** Emerald background, green border, scale 110%
- **Selected (incorrect):** Red background, red border
- **Disabled (other):** Grayed out during result display

---

## 13. Feedback and Feel

### Success Feedback
- **Correct answer:**
  - Button turns emerald green with shadow
  - Score popup animates: "+N" floating up
  - Success haptic feedback
  - Positive message: "✅ Yes! '[word]' has N syllable[s]!"
  
### Streak Milestone (every 5)
- Gradient badge: "🔥 N Streak! 🔥"
- Scales and rotates in with bounce
- Celebration sound and haptic
- Orange-to-pink gradient background

### Failure Feedback
- **Incorrect answer:**
  - Selected button turns red
  - Correct answer button highlighted in green
  - Error sound and haptic
  - Informative message: "❌ '[word]' has N syllable[s]!"
  - Streak resets to 0, hearts empty

### Audio/Haptic
- **Sounds:** Click, success, error, celebration
- **Haptics:** success, error, celebration (via `triggerHaptic`)
- **Missing:** No word audio/TTS currently

### Rhythm/Timing
- Feedback display: 2.5s fixed duration
- Auto-advance to next word after feedback
- Immediate button response on tap
- Smooth progress bar transitions

---

## 14. Points / Rewards / Progression

### Points
- Base: 15 points per correct answer
- Streak bonus: +3 per streak level (max +15)
- Maximum per correct: 30 points
- Session maximum: Varies by level (Level 4: 10 words × 30 = 300 max)

### Rewards (Drops)
From game manifest:
- `music-note` (20% chance) - Thematic for rhythm game
- `star-bronze` (15% chance) - Standard reward

### Easter Eggs
- None defined in manifest
- Potential: "Rhythm Master" for 10+ streak
- Potential: "Syllable Expert" for 100% on Level 4

### Progression
- 4 levels with increasing difficulty
- Levels not locked (free selection)
- Shuffled words prevent repetition
- Accuracy and score tracked per session
- Can replay same level for improvement

---

## 15. End States

### Word Transition
- Feedback displayed (2.5s)
- Score updated (if correct)
- Streak updated
- Next word auto-loads (or completion)

### Level Completion
- Stats displayed: Correct/Total, Accuracy%, Score
- Options: "Play Again" (restart level) or "Finish" (exit)
- `completeGame()` called with score
- Navigate to games menu on Finish

### Early Exit
- No explicit early exit button during gameplay
- Must complete all words or navigate away
- Home button in GameContainer allows exit

### No Failure State
- All words play regardless of accuracy
- Incorrect answers don't end session
- Designed for practice and learning

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current Implementation (Default)
- Button tapping for syllable count
- Visual-only word presentation
- 4 progressive levels
- Hand tracking cursor

### Mode B: Audio-Enhanced (Proposed)
- TTS speaks each word aloud
- Emphasizes syllables with audio cues
- Better supports phonological awareness goal
- Critical missing feature

### Mode C: Clap Detection (Proposed)
- Actual clapping gesture or sound detection
- Count claps to match syllables
- More authentic to game name
- Could use audio input or CV clap gesture

### Mode D: Syllable Animation (Proposed)
- Visually break words into syllable blocks
- Animated bouncing balls or blocks per syllable
- Tap each block as you say/clap it
- Multimodal reinforcement

### Mode E: Rhythm Mode (Proposed)
- Metronome or visual pulse
- Clap on the beat for each syllable
- Timing accuracy scoring
- Musical approach to phonological awareness

### Mode F: Challenge Mode (Proposed)
- Timed responses
- Multiplayer racing
- Accuracy streaks for bonus rounds
- Competitive elements

---

## 17. Improvement Opportunities

### Low Cost
- Add TTS for word pronunciation
- Expand word bank to 40-50 words
- Add more emoji variety
- Include syllable breakdown in feedback

### Medium Effort
- Implement syllable animation (bouncing balls/blocks)
- Add audio clap detection
- Create practice mode with any word
- Add visual rhythm guide (metronome)
- Implement word categories (animals, food, etc.)

### Ambitious
- Create new "Syllable Clap" with actual clapping CV detection
- Multiplayer syllable racing
- Adaptive difficulty based on performance
- Custom word upload for teachers/parents
- Syllable segmentation mini-games

---

## 18. Content Model

### Word Bank Structure (25 words)

#### 1 Syllable (6 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| cat | 1 | A furry pet | 🐱 |
| dog | 1 | A barking pet | 🐕 |
| sun | 1 | It shines in the sky | ☀️ |
| ball | 1 | You throw and catch it | ⚽ |
| fish | 1 | It swims in water | 🐟 |
| bird | 1 | It flies in the sky | 🐦 |

#### 2 Syllables (9 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| apple | 2 | A red or green fruit | 🍎 |
| flower | 2 | It smells nice | 🌸 |
| rainbow | 2 | It appears after rain | 🌈 |
| sunshine | 2 | It comes from the sun | ☀️ |
| water | 2 | We drink it every day | 💧 |
| happy | 2 | The opposite of sad | 😊 |
| baby | 2 | A very young child | 👶 |
| purple | 2 | A color like grapes | 🟣 |
| orange | 2 | A fruit and a color | 🍊 |

#### 3 Syllables (8 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| banana | 3 | A long yellow fruit | 🍌 |
| elephant | 3 | A huge gray animal | 🐘 |
| butterfly | 3 | It has beautiful wings | 🦋 |
| computer | 3 | We use it to work and play | 💻 |
| dinosaur | 3 | An ancient reptile | 🦖 |
| chocolate | 3 | A sweet brown treat | 🍫 |
| strawberry | 3 | A red fruit with seeds | 🍓 |
| cucumber | 3 | A green vegetable | 🥒 |

#### 4 Syllables (2 words)
| Word | Count | Hint | Emoji |
|------|-------|------|-------|
| television | 4 | We watch shows on it | 📺 |
| helicopter | 4 | It flies with spinning blades | 🚁 |

### Proposed Content Expansion
- **Animals:** 10+ additional animal words
- **Food:** 10+ food items with varying syllables
- **Actions:** 10+ verb words
- **Places:** 10+ location words
- **Challenge words:** 5+ syllables for advanced level

---

## 19. Technical Structure

### Main Files
- `src/frontend/src/pages/SyllableClap.tsx` - Main component (390 lines)
- `src/frontend/src/games/syllableClapLogic.ts` - Game logic (68 lines)

### Key Components
```typescript
// State management
const [currentLevel, setCurrentLevel] = useState(1);
const [words, setWords] = useState<SyllableWord[]>([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [score, setScore] = useState(0);
const [correct, setCorrect] = useState(0);
const [streak, setStreak] = useState(0);
const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

// Hand tracking
const [cursor, setCursor] = useState<Point | null>(null);
const { isLoading, isReady, startTracking, webcamRef } = useGameHandTracking({
  gameName: 'SyllableClap',
  targetFps: 30,
  isRunning: isPlaying,
  onFrame: handleFrame,
});
```

### CV Integration
- **Hand Detection:** `useGameHandTracking` hook
  - Target FPS: 30 (responsive for tapping)
  - Index finger tip tracking
  - Container-relative coordinates

### State Machine
```
MENU → [Level select] → START → PLAYING → [Tap number] → FEEDBACK → [If more words] → PLAYING
                                                                   ↓
                                                            [If last word] → COMPLETE
```

### Dependencies
- `framer-motion` - Animations (popups, milestones)
- Kenney platformer assets - Heart HUD
- Custom hooks: `useGameHandTracking`, `useAudio`, `useGameCompletion`
- Components: `GameContainer`, `GameShell`, `GameCursor`

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Audio/TTS | No word pronunciation (critical for phonological game) | High |
| Clap detection | Game name suggests clapping, but uses taps | High |
| Syllable animation | No visual breakdown of syllables | Medium |
| Word bank size | Only 25 words limits variety | High |
| Rhythm guidance | No metronome or timing help | Medium |
| Voice input | Can't speak the syllable count | Low |
| Accessibility | No screen reader optimization noted | Low |
| Cross-device | TTS not implemented, but would need testing | Medium |

---

## 21. Implementation Notes

### Strengths to Preserve
- Excellent 4-level progressive difficulty
- Heart HUD is creative and engaging
- Score popup animations add polish
- Level selector provides flexibility
- Emoji + hint supports pre-readers
- Streak milestone celebrations motivate
- Clean, game-like visual design

### Refactor Opportunities
- Word bank should be externalized to JSON
- Consider extracting WordCard component
- Feedback logic could be consolidated
- Level config could be more dynamic
- TTS integration should be added

### Performance Considerations
- 30fps hand tracking is appropriately responsive
- Framer Motion animations are performant
- Word shuffling happens once per level start
- No heavy computations during gameplay

### Testing Focus
- Level filtering logic (correct words per level)
- Streak calculation and milestone triggering
- Hand tracking tap detection
- Score calculation accuracy
- Word shuffling randomness

---

## 22. Acceptance Criteria

- [ ] Level selector shows 4 levels
- [ ] Selecting level updates available word pool
- [ ] Start button begins gameplay
- [ ] Word card displays emoji, word, and hint
- [ ] Number buttons show 1 to maxSyllables for level
- [ ] Hand tracking cursor appears and moves
- [ ] Correct answer shows green feedback + score popup
- [ ] Incorrect answer shows red feedback + correction
- [ ] Streak increments on consecutive correct
- [ ] Heart HUD updates based on streak
- [ ] Streak milestone appears every 5 correct
- [ ] Score calculates correctly (15 + min(streak×3, 15))
- [ ] Progress bar advances each word
- [ ] Completion screen shows correct/accuracy/score
- [ ] Play Again restarts same level with new shuffle
- [ ] Finish button exits and saves progress
- [ ] Haptic feedback triggers on events

---

## 23. Test Plan

### Manual Checks
- [ ] Select each level, verify appropriate word syllable counts
- [ ] Start game, verify word displays with emoji
- [ ] Select correct syllable count, verify green feedback
- [ ] Select incorrect count, verify red feedback + correction
- [ ] Build 5+ streak, verify milestone celebration appears
- [ ] Verify Heart HUD fills correctly (1 heart per 2 streak)
- [ ] Complete level, verify stats screen accuracy
- [ ] Click Play Again, verify new word shuffle
- [ ] Click Finish, verify exit and save

### State Transitions
- [ ] Level select → Start → Playing → Feedback → Playing (loop)
- [ ] Level select → Start → Playing → Feedback → Complete
- [ ] Complete → Play Again → Start → Playing
- [ ] Complete → Finish → Games menu

### Edge Cases
- [ ] Rapid level switching before start
- [ ] Multiple rapid taps on number buttons
- [ ] Hand tracking lost during selection
- [ ] All words filtered (unlikely with current bank)
- [ ] Browser back button during game
- [ ] Level 4 with only 2 four-syllable words

### Performance Tests
- [ ] Complete full level at each difficulty
- [ ] Test on low-end device with hand tracking
- [ ] Verify no memory leaks over extended play
- [ ] Hand tracking performance at 30fps

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Solid implementation with good level structure, but missing critical audio component for phonological awareness
