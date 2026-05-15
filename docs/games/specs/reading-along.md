# Reading Along

**Game ID:** reading-along  
**World:** Word Workshop  
**Manifest:** `src/frontend/src/data/gameRegistries/wordWorkshop.ts`  
**Code:** `src/frontend/src/pages/ReadingAlong.tsx`  
**Logic:** `src/frontend/src/games/readingAlongLogic.ts`  

---

## 1. Concept Summary

- **One-line concept:** Listen to a sentence being read aloud, then tap the target word from multiple choices to build reading comprehension
- **Genre:** Educational / Literacy / Multiple Choice
- **Target audience:** Ages 4-8, early readers developing sight word recognition
- **Core player fantasy:** "I'm a real reader who can follow along with stories!"
- **Primary skill tested:** Reading comprehension, sight word recognition, listening comprehension
- **Session length:** 5-10 minutes (7 rounds per session)
- **Platform context:** A foundational literacy game combining TTS audio with visual word recognition

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready (Juice-Enhanced)
- **What works now:**
  - TTS (Text-to-Speech) with word-by-word visual highlighting
  - Hand tracking integration for CV-based tapping
  - Multiple choice selection (3 options per round)
  - Celebration effects on correct answers
  - Mascot feedback and encouragement
  - Page-turn animations between rounds
  - Streak tracking with milestone celebrations
  - Score system with streak bonuses
  - Haptic feedback integration
  - Analytics event tracking
  - Game completion and progress saving
  - "Read to me" button for replaying TTS
- **What is partial/missing:**
  - Limited sentence bank (only 6 sentences currently)
  - No difficulty progression levels
  - No voice input option (tap-only interaction)
  - No syllable breakdown or phonics hints
- **Evidence:**
  - Main file: `src/frontend/src/pages/ReadingAlong.tsx` (617 lines)
  - Logic file: `src/frontend/src/games/readingAlongLogic.ts` (56 lines)
  - Uses: `useGameHandTracking` hook with 24fps target
  - Uses: `useTTS` hook for text-to-speech
  - Juice ticket: TCK-20260314-004
- **Confidence level:** High - Well-implemented literacy game with good polish

---

## 3. Current Implementation

### Flow
1. **Start Screen:** Game introduction with mascot, instructions, and Start button
2. **Gameplay Loop (7 rounds):**
   - Display sentence card with word-by-word highlighting during TTS
   - Show 3 word options below
   - Player taps the target word
   - Immediate feedback with celebration or gentle correction
   - Page-turn animation to next round
3. **Completion:** After 7 rounds, final score shown and progress saved

### TTS Integration
```typescript
// Word timing for TTS highlighting (ms per word)
const WORD_TIMING_MS = 350;

// Speak the full sentence
void speak(activeRound.sentence.text);

// Animate word highlighting in sync with TTS
for (let i = 0; i < words.length; i++) {
  setTimeout(() => {
    setHighlightedWordIndex(i);
  }, i * WORD_TIMING_MS);
}
```

### Word Highlighting System
- Each word in the sentence is individually highlightable
- During TTS playback: Yellow highlight moves word-by-word (350ms per word)
- After answer: Target word turns green (correct) or red (incorrect)
- Visual scale animation on highlighted words

### Hand Tracking
- Uses `useGameHandTracking` hook at 24fps
- Cursor tracks index finger position
- `CursorEmbodiment` component shows hand position overlay
- Tap detection via onClick handlers on word buttons

### Scoring
- Base points: 20 per correct answer
- Streak bonus: +5 points per streak level (streak × 5)
- Example: 3-streak correct answer = 20 + 15 = 35 points

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Build reading comprehension and sight word recognition
- **Pedagogical approach:** Multimodal learning (audio + visual + kinesthetic)
- **Core loop:** Listen to sentence → Identify target word → Receive feedback → Progress
- **Accessibility:** TTS removes reading barrier; hand tracking enables touch-free play
- **Progression:** Fixed 7-round sessions with shuffled sentences

### Game Phases Detail
| Phase | Duration | Action Required | Visual Cue |
|-------|----------|-----------------|------------|
| Intro | Variable | Read instructions, press Start | Mascot welcome |
| Listening | ~2-3s | Listen to sentence | Yellow word highlighting |
| Selection | Variable | Tap target word | 3 word option buttons |
| Feedback | 1.8-2.5s | View result, celebrate | Color-coded feedback card |
| Transition | 0.6s | Wait for next round | Page-turn animation |

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ TTS with word-by-word highlighting works excellently  
✅ Hand tracking integration for touch-free play  
✅ Visual feedback is clear and age-appropriate  
✅ Mascot provides encouraging guidance  
✅ Celebration effects add positive reinforcement  
✅ Streak system motivates continued success  
✅ Page-turn animations create narrative flow  

### Where Implementation Exceeds Intent
🌟 **Juice-enhanced version** adds significant polish over base implementation  
🌟 **Word-by-word TTS highlighting** is sophisticated educational feature  
🌟 **Dual feedback system** (mascot + celebration + haptics) is comprehensive  
🌟 **Auto-read on round start** reduces friction for young players  

### Where Implementation Falls Short
⚠️ **Very limited content:** Only 6 sentences in the bank  
⚠️ **No difficulty levels:** Same complexity for all rounds  
⚠️ **No progression system:** Same experience every session  
⚠️ **No phonics breakdown:** Doesn't teach syllables or letter sounds  
⚠️ **No voice input:** Despite being a reading game, can't use voice answers  
⚠️ **Simple distractors:** Just other target words, not contextually challenging  

### Comparison to Similar Games
| Feature | Reading Along | Syllable Clap | Sight Word Flash |
|---------|--------------|---------------|------------------|
| CV Mode | Hand only | Hand only | Hand only |
| Audio | TTS sentences | Word audio | Word audio |
| Content Size | 6 sentences | 25 words | Larger bank |
| Levels | No | Yes (4 levels) | Yes |
| Feedback Style | Mascot + celebration | Score popups | Simple |

### Overall Assessment
**Alignment: 75%** - Core implementation is solid and juice-enhanced, but severely limited by tiny content bank (6 sentences). Educational potential is high but content depth is lacking.

---

## 6. Recommended Canonical Version

The current implementation with content expansion:

### Keep (Current Strengths)
- TTS with word-by-word highlighting
- Hand tracking cursor integration
- Mascot feedback system
- Celebration effects
- Streak tracking
- Page-turn animations
- Juice-enhanced visual design

### Enhance
1. **Content expansion:** Increase to 50+ sentences with varied complexity
2. **Difficulty levels:** Simple (3-4 words) → Medium (5-6 words) → Complex (7+ words)
3. **Phonics hints:** Optional syllable breakdown or sound highlighting
4. **Picture support:** Add illustrations for each sentence
5. **Voice input:** Allow speaking the target word as alternative input
6. **Smart distractors:** Contextually similar words rather than random target words

### Remove
- Nothing significant (current features are well-implemented)

---

## 7. Visual Identity

- **Overall look:** Book-themed literacy environment with warm, inviting colors
- **Camera view:** Small preview (top-right), main focus on reading card
- **Art style:** Clean typography, rounded UI elements, friendly mascot
- **Mood:** Calm and focused during reading, celebratory on success
- **Colors:**
  - Primary: Sky blue (#0EA5E9) for reading card
  - Accent: Warm gold (#F2CC8F) for borders and highlights
  - Success: Green (#22C55E) for correct answers
  - Error: Orange (#F97316) for incorrect feedback
  - Background: Soft blue (#F0F9FF) for sentence display
- **Environment:** Clean card-based layout reminiscent of storybooks
- **UI style:** Large readable text (2xl-3xl), prominent buttons, clear hierarchy

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Start Screen** | Game introduction | Mascot, title, instructions, Start button, emoji indicators |
| **Sentence Card** | Display reading material | Word-by-word display, TTS button, progress indicator |
| **Options Panel** | Word selection | 3 large word buttons in grid layout |
| **Feedback Overlay** | Answer confirmation | Color-coded result card with explanation |
| **Streak Milestone** | Achievement celebration | Animated streak badge with fire icon |
| **Progress Bar** | Session tracking | Round counter, progress bar, score display |
| **Celebration** | Success feedback | Particle effects originating from tap position |
| **Completion** | Session end | Final score, completion message, return button |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Start game | Button press / Hand tap | Game begins, first sentence appears |
| Listen to sentence | Auto-play on round start + TTS button | Word-by-word yellow highlighting |
| Select word | Hand cursor tap / Mouse click | Button press animation, color feedback |
| Navigate | Hand cursor movement | Cursor embodiment follows finger |
| End early | Finish button | Confirmation, progress saved |

### CV Technical Details
- **Hand tracking:** `useGameHandTracking` hook
- **Frame rate:** 24fps (optimized for reading pace)
- **Cursor:** `CursorEmbodiment` with normalized coordinates
- **Interaction:** onClick handlers on button elements
- **Fallback:** Mouse/touch works identically

---

## 10. Core Mechanics

### Sentence Display System
```
ROUND START → AUTO-PLAY TTS → HIGHLIGHT WORDS → AWAIT SELECTION → FEEDBACK → TRANSITION → NEXT ROUND
```

### TTS Synchronization
- Fixed timing: 350ms per word
- Highlight advances sequentially
- Post-TTS: All words return to normal state
- Player can replay via "Read to me!" button

### Answer Selection
- 3 options displayed as large buttons
- Options: 1 target word + 2 distractor words (other targets)
- Shuffled random order each round
- Immediate visual feedback on selection

### Scoring Formula
- Base: 20 points per correct answer
- Streak multiplier: Current streak × 5 bonus points
- Example progression:
  - Round 1 correct: 20 points
  - Round 2 correct (streak=1): 25 points
  - Round 3 correct (streak=2): 30 points
  - etc.

### Streak System
- Increments on each correct answer
- Resets to 0 on incorrect answer
- Milestone celebration every 3 consecutive correct
- Visual streak indicator appears when streak > 1

---

## 11. Rules

- **Start:** Press "Start Reading!" button
- **Listening:** Sentence auto-plays with word highlighting
- **Selection:** Tap the target word from 3 options
- **Scoring:** Points awarded based on correctness + streak
- **Rounds:** Fixed 7 rounds per session
- **Completion:** After round 7, progress saved automatically
- **Early exit:** Finish button available anytime

### What Counts as Correct
- Exact word match (case-sensitive comparison)
- Target word must match the specified word in sentence
- Punctuation is stripped for comparison: `word.toLowerCase().replace(/[^a-z]/g, '')`

### Anti-Repetition
- Tracks used sentence IDs across session
- Filters out already-seen sentences
- Falls back to full pool if all used

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Round counter | Progress tracking | "Round X / 7" |
| Progress bar | Visual progress | Fills as rounds complete |
| Score display | Points earned | Top-right corner |
| TTS button | Replay sentence | Toggles between "Read to me!" and "Reading..." |
| Word display | Reading content | Word-by-word highlighting during TTS |
| Target hint | Subtle guidance | "Find the word: [target]" |
| Option buttons | Answer choices | Color changes based on result |
| Feedback card | Result message | Green/red with explanation |
| Streak badge | Achievement | Appears at top-right when streak > 1 |
| Mascot | Encouragement | Bottom-left with messages |

---

## 13. Feedback and Feel

### Success Feedback
- **Correct answer:**
  - Green color on selected word
  - Celebration effects (stars) from tap position
  - Success sound + celebration sound
  - Haptic success feedback
  - Mascot message: "Great job!", "You got it!", etc.
  - Score popup (implied by score increase)

### Streak Milestone (every 3+)
- Orange/red gradient streak badge: "🔥 N streak! 🔥"
- Badge animates in from top-right
- Disappears after next answer

### Failure Feedback
- **Incorrect answer:**
  - Red color on selected word
  - Green highlight on correct word
  - Error sound
  - Haptic error feedback
  - Mascot: "Keep trying!"
  - Helpful message: "Good try! The word was '[target]'. 📖"
  - Streak reset to 0

### Audio/Haptic
- **Sounds:** Click, success, error, celebration
- **Haptics:** success, error, celebration (via `triggerHaptic`)
- **TTS:** Sentence playback with word highlighting

### Rhythm/Timing
- TTS: ~350ms per word (adjustable)
- Feedback display: 1.8s (correct) / 2.5s (incorrect)
- Page transition: 0.6s
- Round total: ~15-20 seconds

---

## 14. Points / Rewards / Progression

### Points
- Base: 20 points per correct answer
- Streak bonus: +5 per streak level
- Maximum per round: 20 + (streak × 5)
- Session maximum: ~200+ points depending on streak

### Rewards (Drops)
From game manifest:
- `book-blue` (18% chance) - Thematic book item
- `letter-a` (10% chance) - Letter collectibles
- `star-gold` (8% chance) - Rare star reward

### Easter Eggs
- None defined in manifest
- Potential: "Speed Reader" for quick consecutive correct answers
- Potential: "Perfect Session" for 7/7 correct

### Progression
- No level system currently
- Fixed 7-round sessions
- Shuffled sentences prevent exact repetition
- Score and accuracy tracked per session

---

## 15. End States

### Round End
- Feedback displayed (1.8-2.5s)
- Score updated
- Streak updated
- Next round auto-starts (or completion)

### Session Completion (Round 7)
- Final feedback shown
- Completion celebration
- `completeGame()` called with final score
- Analytics event: `reading_along_complete`
- Delay before returning to menu state

### Early Exit
- Finish button available anytime
- `completeGame()` called with current score
- Analytics event: `reading_along_finish_early`
- Navigate to games menu

### No Failure State
- All 7 rounds play regardless of accuracy
- Incorrect answers don't end session
- Designed for learning, not punishment

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current Implementation (Default)
- Hand tracking for tapping
- 7 fixed rounds
- 6 sentences (limited variety)
- TTS with highlighting

### Mode B: Voice-Enhanced (Proposed)
- Add voice input as alternative to tapping
- Child can speak the target word
- Speech recognition validation
- Good for practicing pronunciation

### Mode C: Phonics Mode (Proposed)
- Break words into syllables/phonemes
- Tap each sound separately
- Teaches decoding, not just recognition
- Slower pace, more educational depth

### Mode D: Picture Support (Proposed)
- Add illustration for each sentence
- Visual context aids comprehension
- Especially helpful for ESL learners
- Can tap picture OR word

### Mode E: Adaptive Difficulty (Proposed)
- Track accuracy per child
- Adjust sentence complexity dynamically
- More distractors for high performers
- Hints for struggling readers

---

## 17. Improvement Opportunities

### Low Cost
- Expand sentence bank to 25-50 sentences
- Add more encouraging mascot messages
- Vary celebration effects
- Add subtle background music

### Medium Effort
- Implement 3 difficulty levels (word count based)
- Add picture illustrations
- Create phonics hint mode
- Add voice input option
- Implement smart distractors (rhyming words, similar spellings)

### Ambitious
- Dynamic sentence generation
- Personalized sentence topics based on interests
- Full story mode with connected sentences
- Parent/teacher sentence upload
- Reading fluency timing (words per minute)
- Multiplayer reading races

---

## 18. Content Model

### Current Sentence Bank (6 sentences)
| ID | Sentence | Target Word | Complexity |
|----|----------|-------------|------------|
| cat-mat | "The cat sits on the mat" | cat | Simple (6 words) |
| sun-bright | "The sun is bright today" | sun | Simple (6 words) |
| pip-runs | "Pip runs fast at school" | runs | Medium (5 words) |
| bird-sings | "A bird sings every morning" | sings | Medium (5 words) |
| kids-read | "Kids read books together" | read | Simple (4 words) |
| stars-shine | "Stars shine in the sky" | shine | Simple (6 words) |

### Vocabulary Categories
- **Animals:** cat, bird
- **Nature:** sun, stars, shine
- **Actions:** runs, sings, read
- **Objects:** mat, books

### Proposed Content Expansion
- **Level 1:** 4-word sentences (20+ sentences)
- **Level 2:** 5-6 word sentences (20+ sentences)
- **Level 3:** 7+ word sentences with compound words (20+ sentences)
- **Topics:** Animals, nature, daily routines, school, family, food

---

## 19. Technical Structure

### Main Files
- `src/frontend/src/pages/ReadingAlong.tsx` - Main component (617 lines)
- `src/frontend/src/games/readingAlongLogic.ts` - Game logic (56 lines)

### Key Components
```typescript
// State management
const [score, setScore] = useState(0);
const [round, setRound] = useState(0);
const [activeRound, setActiveRound] = useState<ReadingAlongRound | null>(null);
const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
const [streak, setStreak] = useState(0);

// Hand tracking
const [cursor, setCursor] = useState<Point | null>(null);
const { webcamRef, isReady, startTracking } = useGameHandTracking({
  gameName: 'ReadingAlong',
  targetFps: 24,
  onFrame: handleHandTrackingFrame,
});
```

### CV Integration
- **Hand Detection:** `useGameHandTracking` hook
  - Target FPS: 24 (appropriate for reading pace)
  - Index finger tip tracking only
  - Normalized coordinates (0-1 range)

### State Machine
```
START → [Start button] → ROUND START → [TTS] → AWAITING_SELECTION → [Tap] → FEEDBACK → [Timer] → [If round < 7] → ROUND START
                                                                                           ↓
                                                                                    [If round = 7] → COMPLETE
```

### Dependencies
- `framer-motion` - Animations and transitions
- `lucide-react` - Icons (via KenneyIcon)
- Custom hooks: `useGameHandTracking`, `useTTS`, `useAudio`, `useGameCompletion`
- Components: `CelebrationEffects`, `Mascot`, `CursorEmbodiment`, `GameContainer`, `GameShell`

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Content expansion | Only 6 sentences severely limits replayability | High |
| Difficulty scaling | No levels or adaptive difficulty | High |
| Voice input | Reading game doesn't use voice recognition | Medium |
| Phonics integration | No syllable or sound breakdown | Medium |
| Picture support | No visual context illustrations | Medium |
| Sentence variety | Limited vocabulary and structures | High |
| Accessibility | No dyslexia-friendly font option | Low |
| Multi-language | English only, no i18n | Medium |

---

## 21. Implementation Notes

### Strengths to Preserve
- Word-by-word TTS highlighting is excellent educational feature
- Mascot feedback adds personality and encouragement
- Celebration effects provide positive reinforcement
- Hand tracking enables touch-free interaction
- Clean, readable typography appropriate for children
- Page-turn animations create narrative flow

### Refactor Opportunities
- Sentence bank should be externalized to JSON/config
- Consider splitting into smaller components (SentenceCard, OptionButtons)
- Word highlighting logic could be extracted to custom hook
- Analytics events could be consolidated

### Performance Considerations
- TTS generation may have slight latency
- 24fps hand tracking is appropriately throttled
- Celebration effects use CSS animations (GPU accelerated)
- Framer Motion animations are performant

### Testing Focus
- TTS timing accuracy across devices
- Hand tracking tap detection accuracy
- Word highlighting synchronization
- Accessibility (screen reader compatibility)
- Cross-browser TTS support

---

## 22. Acceptance Criteria

- [ ] Game initializes and shows start screen
- [ ] Start button begins first round
- [ ] TTS auto-plays with word highlighting
- [ ] "Read to me" button replays TTS
- [ ] Hand tracking cursor appears and moves
- [ ] Word buttons respond to hand cursor taps
- [ ] Correct answer shows green feedback + celebration
- [ ] Incorrect answer shows orange feedback + correction
- [ ] Streak increments on consecutive correct answers
- [ ] Streak badge appears at streak > 1
- [ ] Score updates correctly (20 + streak×5)
- [ ] Progress bar advances each round
- [ ] Round counter displays correctly (X / 7)
- [ ] After round 7, completion screen appears
- [ ] Game completion saves progress
- [ ] Early finish button works and saves progress
- [ ] Haptic feedback triggers on events
- [ ] Mascot displays appropriate messages

---

## 23. Test Plan

### Manual Checks
- [ ] Start game, verify TTS plays automatically
- [ ] Tap "Read to me" button, verify TTS replays
- [ ] Select correct word, verify celebration effects
- [ ] Select incorrect word, verify correction feedback
- [ ] Build 3+ streak, verify milestone badge appears
- [ ] Complete all 7 rounds, verify completion flow
- [ ] Press Finish early, verify early exit saves progress

### State Transitions
- [ ] Start → Round 1 → Selection → Feedback → Round 2 (loop)
- [ ] Round 7 → Feedback → Completion → Menu
- [ ] Any Round → Finish button → Menu (saved)

### Edge Cases
- [ ] Very quick TTS replay (spam button)
- [ ] Hand tracking lost during selection
- [ ] Multiple rapid taps on same word
- [ ] TTS disabled in browser
- [ ] All 6 sentences used (verify wrap-around)
- [ ] Browser back button during game

### Performance Tests
- [ ] Complete full 7-round session
- [ ] Test on low-end device with TTS
- [ ] Verify memory usage doesn't grow
- [ ] Hand tracking performance at 24fps

---

**Last Updated:** 2026-04-03  
**Confidence:** High - Production-ready with excellent juice implementation, but needs content expansion
