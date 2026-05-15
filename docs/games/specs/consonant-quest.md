# Consonant Quest - Game Specification

> **Slug:** `consonant-quest`  
> **World:** Word Workshop  
> **CV Mode:** Hand tracking (`cv: ['hand']`)  
> **Target File:** `src/frontend/src/pages/ConsonantQuest.tsx`  
> **Created:** 2026-04-03  
> **Template Version:** 23-Section Spec v1.0

---

## Section 1: Concept Summary

| Aspect | Description |
|--------|-------------|
| **One-line concept** | Identify consonant sounds and match them to letters by pinching the correct answer |
| **Genre** | Educational phonics quiz |
| **Target audience** | Ages 4-7, early readers learning consonant phonics |
| **Core player fantasy** | Become a "Consonant Detective" who solves sound mysteries |
| **Primary skill tested** | Phonemic awareness, consonant sound recognition, letter-sound correspondence |
| **Session length** | 5-8 minutes (3 levels × 5 rounds) |
| **Platform context** | Browser-based vision learning platform with hand tracking |

---

## Section 2: Repo Status

### Implementation Status: **NOT IMPLEMENTED**

| Aspect | Status | Evidence |
|--------|--------|----------|
| Source file exists | ❌ No | `src/frontend/src/pages/ConsonantQuest.tsx` not found |
| Logic file exists | ❌ No | `src/frontend/src/games/consonantQuestLogic.ts` not found |
| Registry entry exists | ❌ No | Not found in `wordWorkshop.ts` or `wordWorkshopExtra.ts` |
| Route configured | ❌ No | Not in `appRoutes.tsx` |
| Assets prepared | ❌ No | No preview image or assets |

### What Would Work (If Implemented)
- Hand tracking integration via `useGameHandTracking` hook
- Pinch-to-select gesture pattern (established in PhonicsSounds, WordBuilder)
- TTS audio feedback system
- Score/streak tracking via existing hooks

### What's Missing
- Complete game implementation
- Game logic module with consonant phoneme data
- Curriculum integration for progressive difficulty
- Parent settings panel for difficulty adjustment
- Analytics integration for learning tracking

**Confidence Level:** High (100% — game does not exist)

---

## Section 3: Current Implementation

> **Status:** No implementation exists. This section describes the intended implementation based on patterns from similar games.

### Intended Flow
```
[Start Screen] → [Countdown] → [Round 1] → [Feedback] → [Round 2+] → [Level Complete] → [Next Level/Game Complete]
```

### Intended Controls
- **Hand tracking**: Index finger controls cursor position
- **Pinch gesture**: Select letter target
- **Hand visibility**: Required for gameplay

### Intended Mechanics
1. Player hears a consonant sound (e.g., "/b/")
2. 3-4 letter cards appear on screen with different consonants
3. Player pinches the letter that makes the target sound
4. Correct answer: Points + streak bonus, positive feedback
5. Wrong answer: Visual feedback, retry opportunity, sound repeats

### Visual Design Pattern (Based on PhonicsSounds)
- Card-based letter targets (130px × 130px)
- Colorful card backgrounds for visual distinction
- Central feedback area showing target sound
- Progress indicator (round X of Y)
- Streak milestone celebrations

### Gaps/Issues to Address
| Gap | Severity | Notes |
|-----|----------|-------|
| No source file | Critical | Complete implementation needed |
| No consonant phoneme data | High | Need phoneme library with 21 consonant sounds |
| No curriculum integration | Medium | Should align with phonics progression |
| No audio assets | Medium | TTS fallback available, but pre-recorded preferred |

---

## Section 4: Intended Design

### Educational Goal
Teach children to recognize and differentiate consonant sounds, building phonemic awareness essential for reading. Focus on:
- Initial consonant sounds (word beginnings)
- Final consonant sounds (word endings)
- Consonant sound discrimination (e.g., /b/ vs /p/)

### Pedagogical Approach
1. **Explicit instruction**: Clear sound presentation with visual mouth cue
2. **Multiple choice**: 3-4 options to prevent overwhelming
3. **Immediate feedback**: Correct mistakes right away
4. **Progressive difficulty**: Start with distinct sounds, move to similar sounds
5. **Repetition with variety**: Same sounds, different example words

### Difficulty Progression

| Level | Focus | Sounds | Distractors |
|-------|-------|--------|-------------|
| 1 | Stop consonants (p, b, t, d, k, g) | 6 sounds | Visual-only distractors (vowels) |
| 2 | Continuants (f, v, s, z, m, n) | 6 sounds | Acoustically different |
| 3 | Complex (h, w, r, l, y, th, sh, ch) | 8 sounds | Acoustically similar pairs |

### Accessibility
- **Visual**: High contrast targets, clear typography (Kenney Future or similar)
- **Audio**: TTS for all instructions, clear phoneme pronunciation
- **Motor**: Large hit targets (0.12 normalized radius), forgiving pinch detection
- **Cognitive**: No time pressure, self-paced rounds

### Engagement
- Detective/conquest theme ("Quest" motif)
- Streak rewards ("X-Ray Vision!" at 5 streak)
- Collectible badges for completing each level
- Animated character guide (optional)

### Core Loop
```
Listen to sound → Scan options → Pinch answer → Get feedback → Next round
     ↑___________________________________________________________|
```

---

## Section 5: Drift Analysis

> Since no implementation exists, this section describes the gap between "nothing" and the intended design.

### Where Implementation Matches Intent
N/A — No implementation exists.

### Where Implementation Falls Short
| Area | Current | Intended | Gap |
|------|---------|----------|-----|
| Existence | Non-existent | Fully functional | 100% missing |
| Source file | None | Complete TSX component | 100% missing |
| Game logic | None | Consonant phoneme system | 100% missing |
| Registry entry | None | Listed in Word Workshop | 100% missing |
| Assets | None | Preview image, icons | 100% missing |

### Overall Assessment

| Metric | Score | Notes |
|--------|-------|-------|
| **Implementation completeness** | 0% | Game does not exist |
| **Code quality** | N/A | No code to evaluate |
| **CV integration** | 0% | Would use hand tracking |
| **Educational value** | N/A | Design specifies strong pedagogy |
| **Visual design** | 0% | Would follow Word Workshop patterns |

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
N/A — New game implementation.

### Enhancements to Implement

#### Tier 1: Core MVP
- [ ] Basic game loop with 3 levels
- [ ] 21 consonant phonemes with TTS
- [ ] Pinch-to-select interaction
- [ ] Score and streak tracking
- [ ] Level progression

#### Tier 2: Enhanced Experience
- [ ] Animated character guide (detective mascot)
- [ ] Pre-recorded phoneme audio ( clearer than TTS)
- [ ] Example words with images ("B is for Ball 🏐")
- [ ] Parent settings for difficulty
- [ ] Learning analytics integration

#### Tier 3: Premium Features
- [ ] Voice input mode ("Say the sound you hear!")
- [ ] Consonant blend levels (/bl/, /tr/, /st/)
- [ ] Mini-game variations ("Find all the /m/ words")
- [ ] Printable progress certificates

### Experimental Features
- **Mouth camera mode**: Show child's mouth alongside animated mouth model
- **Voice comparison**: Record child saying sound, compare to target
- **Multiplayer**: Two children race to find the sound

---

## Section 7: Visual Identity

### Overall Look
Clean, detective-themed educational interface with a "mystery to solve" motif. Magnifying glass imagery, fingerprint patterns, evidence boards.

### Camera View
Full-screen game area with camera preview in corner (standard platform pattern).

### Art Style
- **Flat design** with subtle shadows (consistent with Word Workshop)
- **Rounded corners** (3rem border radius)
- **Card-based** letter targets
- **Kenney Game Assets** for icons and characters

### Mood
Playful detective adventure — curious, investigative, rewarding.

### Colors
| Element | Color | Hex |
|---------|-------|-----|
| Primary | Detective Blue | `#3B82F6` |
| Secondary | Mystery Gold | `#F59E0B` |
| Success | Case Closed Green | `#10B981` |
| Background | Clue Board Cream | `#FFF8F0` |
| Card Border | Fingerprint Tan | `#F2CC8F` |
| Accent | Magnifying Glass Silver | `#94A3B8` |

### Environment
Abstract "detective office" background with subtle magnifying glass, fingerprint, and clue board motifs.

### UI Style
- Chunky buttons with `shadow-[0_4px_0_#E5B86E]` pattern
- Large, friendly typography (Kenney Future)
- Emoji integration for visual interest

### Active Vibe
Focused but fun — the child is "solving cases" by identifying sounds.

---

## Section 8: Screen Map

| Screen | Purpose | Key Elements |
|--------|---------|--------------|
| Start Screen | Game intro, instructions | Title, detective mascot, Start button, settings hint |
| Countdown | Prepare player | 3-2-1 animation, hand detection check |
| Game Round | Main gameplay | Sound button, 3-4 letter cards, progress indicator |
| Correct Feedback | Reward correct answer | Green flash, points popup, streak indicator |
| Wrong Feedback | Guide correction | Red shake, hint, repeat sound |
| Level Complete | Celebrate progress | Stats, badge unlock, next level button |
| Game Complete | Final celebration | Total score, certificate, replay/home buttons |
| Settings (Parent) | Difficulty, analytics | Level selector, TTS toggle, progress export |

---

## Section 9: Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position (index finger) | Cursor follows finger position |
| Select letter | Pinch (index-thumb) | Letter card "presses" with bounce |
| Repeat sound | Pinch sound button | Sound replayed with visual pulse |
| Pause/Menu | Pinch menu button | Pause overlay appears |
| Start game | Pinch Start button | Countdown begins |
| Navigate levels | Pinch level buttons (settings) | Highlight selected level |

### Gesture Details
- **Cursor tracking**: Normalized coordinates (0-1)
- **Pinch detection**: Distance < 0.05 between index and thumb tips
- **Hit radius**: 0.12 normalized (generous for children)
- **Cooldown**: 500ms between pinches to prevent accidental double-taps

---

## Section 10: Core Mechanics

### Phoneme Selection Algorithm
```typescript
// Select target consonant for round
function selectTargetConsonant(level: number, usedSounds: string[]): ConsonantPhoneme {
  const pool = level === 1 ? STOP_CONSONANTS 
              : level === 2 ? CONTINUANTS 
              : COMPLEX_CONSONANTS;
  
  // Avoid recently used sounds
  const available = pool.filter(c => !usedSounds.includes(c.letter));
  return randomFrom(available.length > 0 ? available : pool);
}

// Generate distractors (wrong answers)
function generateDistractors(target: ConsonantPhoneme, level: number): ConsonantPhoneme[] {
  const count = level === 1 ? 2 : level === 2 ? 3 : 3;
  
  // Level 1: Mix of any other consonants
  // Level 2: Same category, different sounds
  // Level 3: Acoustically similar (p/b, t/d, f/v)
  const pool = level === 3 ? getSimilarSounds(target) : ALL_CONSONANTS;
  return shuffle(pool.filter(c => c.letter !== target.letter)).slice(0, count);
}
```

### Scoring Formula
```
basePoints = 10
streakBonus = min(streak * 2, 15)
speedBonus = max(0, 5 - timeTaken)  // Optional

roundScore = basePoints + streakBonus + speedBonus
```

### Streak System
- Streak increases with consecutive correct answers
- Milestone at 5: "Detective Vision!" + bonus animation
- Milestone at 10: "Super Sleuth!" + confetti
- Wrong answer resets streak to 0

---

## Section 11: Rules

### Start Conditions
- Player on Start Screen
- Hand tracking initialized (or fallback ready)
- Audio system ready

### Objectives
- Correctly identify the consonant sound presented
- Complete all rounds in a level to advance
- Achieve 80% accuracy to unlock next level

### Allowed Actions
- Pinch to select letter cards
- Pinch to repeat sound
- Navigate via on-screen buttons

### Restrictions
- Cannot select multiple answers simultaneously
- Cannot advance until current round complete
- Level locks until previous level completed (optional)

### Scoring
| Action | Points |
|--------|--------|
| Correct answer | 10 + streak bonus |
| 5-streak milestone | +25 bonus |
| Level complete | +50 bonus |
| Wrong answer | 0 (no penalty) |

### Win/Lose Conditions
- **Win**: Complete all 3 levels with passing accuracy
- **Level Pass**: ≥80% correct in level
- **Level Retry**: <80% correct (replay same level)

---

## Section 12: HUD / Gameplay UI

### Layout (Top to Bottom)

```
┌─────────────────────────────────────────┐
│  [Score]        Level X        [Time]   │  ← Top bar
├─────────────────────────────────────────┤
│                                         │
│     "Listen to the sound..."            │  ← Feedback area
│                                         │
│        ┌─────────┐                      │
│        │  🔊 /b/  │ ← Pinch to repeat   │
│        └─────────┘                      │
│                                         │
│     ┌─────┐  ┌─────┐  ┌─────┐          │
│     │  P  │  │  B  │  │  M  │          │  ← Letter cards
│     └─────┘  └─────┘  └─────┘          │    (2-4 cards)
│                                         │
│           🔥 Streak: 3                 │  ← Streak indicator
│                                         │
└─────────────────────────────────────────┘
        [Home] [Restart] [Settings]       ← Bottom controls
```

### HUD Elements
| Element | Position | Purpose |
|---------|----------|---------|
| Score | Top-left | Total points earned |
| Level | Top-center | Current level indicator |
| Round | Top-right | Round X of Y |
| Feedback | Upper-center | Instructions and feedback |
| Sound button | Center | Replay target sound |
| Letter cards | Middle | Answer choices |
| Streak | Bottom-center | Current streak count |
| Controls | Bottom-right | Navigation buttons |

---

## Section 13: Feedback and Feel

### Success Feedback
- **Visual**: Card turns green, bounces, checkmark appears
- **Audio**: Success chime + TTS "Yes! /b/ as in ball!"
- **Haptic**: Success vibration pattern
- **Points**: Score popup with animation (+points)

### Failure Feedback
- **Visual**: Card shakes with red tint
- **Audio**: Gentle error sound + TTS "That's /p/. Listen again."
- **Haptic**: Light error vibration
- **Recovery**: Sound auto-repeats after 1 second

### During Gameplay
- Cursor: Color changes when hovering target (blue → gold)
- Idle hint: Gentle pulse on sound button if no action for 5s
- Progress: Subtle fill animation on progress bar

### Streak/Progress Feedback
| Milestone | Visual | Audio |
|-----------|--------|-------|
| 3 correct | Small flame emoji appears | "Great!" |
| 5 correct | "Detective Vision!" banner + screen flash | Celebration sound |
| 10 correct | "Super Sleuth!" + confetti | Full celebration |
| Level complete | Badge unlock animation | Level complete music |

---

## Section 14: Points / Rewards / Progression

### Points Breakdown
| Action | Base | Streak Bonus | Max |
|--------|------|--------------|-----|
| Correct answer | 10 | +2 per streak | 25 |
| 5-streak milestone | — | +25 | 25 |
| Level complete | — | +50 | 50 |
| Perfect level (100%) | — | +25 | 25 |

### Final Score Calculation
```
totalScore = sum(all round scores) + completionBonus
accuracy = (correctAnswers / totalRounds) × 100
starRating = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1
```

### Rewards/Drops (Proposed Registry Entry)
```typescript
drops: [
  { itemId: 'letter-b', chance: 0.15 },  // Consonant letters
  { itemId: 'letter-c', chance: 0.15 },
  { itemId: 'letter-d', chance: 0.15 },
  { itemId: 'creature-owl', chance: 0.05, minScore: 100 }, // Wise detective
  { itemId: 'tool-magnifying-glass', chance: 0.1 }, // Detective tool
  { itemId: 'star-bronze', chance: 0.2 },
]
```

### Easter Eggs
```typescript
easterEggs: [
  {
    id: 'egg-consonant-cadet',
    name: 'Consonant Cadet',
    description: 'Complete Level 1 with 100% accuracy',
    trigger: 'level1-perfect',
    reward: { itemId: 'badge-cadet', quantity: 1 },
    hint: 'Get every sound right on the first try!',
    difficulty: 'medium',
  },
  {
    id: 'egg-sound-sleuth',
    name: 'Sound Sleuth',
    description: 'Achieve a 10-streak',
    trigger: 'streak-10',
    reward: { itemId: 'creature-owl', quantity: 1 },
    hint: 'Keep answering correctly without mistakes!',
    difficulty: 'hard',
  },
]
```

### Progression System
- **Level 1**: Unlock after starting (stop consonants)
- **Level 2**: Unlock after 80% on Level 1 (continuants)
- **Level 3**: Unlock after 80% on Level 2 (complex sounds)
- **Master Badge**: Unlock after completing all levels

---

## Section 15: End States

### Correct Answer
1. Card animates (green + bounce)
2. Success sound plays
3. Points awarded with popup
4. Streak incremented
5. 1.5s delay → next round

### Wrong Answer
1. Card animates (red + shake)
2. Error sound plays
3. Streak reset to 0
4. Sound repeats automatically
5. Player retries same round

### Level Complete (Success)
1. Level stats displayed
2. Badge unlock animation (if earned)
3. "Level Complete!" celebration
4. Option: Next Level or Replay

### Level Complete (Retry Needed)
1. "Good try!" message
2. Accuracy shown
3. "Let's practice more!" encouragement
4. Replay level button

### Game Complete (All Levels)
1. Full celebration with confetti
2. Final score and stars displayed
3. All badges earned shown
4. Options: Play Again or Return Home

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Voice Input (`cv: ['voice']`)
- Child says the sound they hear
- Speech recognition matches to target
- Visual "listening" indicator
- Same scoring system

### Mode B: Touch/Mouse (Fallback)
- Click/tap instead of pinch
- For desktop or non-CV environments
- Same visual design

### Mode C: Teacher/Parent Mode
- No scoring, unlimited time
- Can select specific sounds to practice
- Progress tracking for intervention

### Mode D: Speed Challenge
- Timed rounds (3 seconds per answer)
- Faster pace, higher stakes
- Time bonus for quick answers

---

## Section 17: Improvement Opportunities

### Low Cost (Quick Wins)
1. **Pre-recorded phonemes**: Replace TTS with clear child-voice recordings
2. **Example word images**: Show picture of "ball" when teaching /b/
3. **Mouth shape hints**: Visual mouth position diagram
4. **Streak saving**: Maintain streak across sessions

### Medium Effort
1. **Adaptive difficulty**: Adjust based on accuracy patterns
2. **Confusion tracking**: Log which sounds are commonly confused
3. **Progress certificates**: Printable PDF achievement certificates
4. **Multiple profiles**: Per-child progress tracking

### Ambitious
1. **AI speech assessment**: Evaluate child's pronunciation
2. **Custom word lists**: Parents add family names or interest words
3. **Multiplayer races**: Head-to-head sound identification
4. **AR integration**: 3D letters floating in room

---

## Section 18: Content Model

### Consonant Phonemes (21 sounds)

#### Level 1: Stop Consonants
| Letter | Sound | Example Word | Example Emoji |
|--------|-------|--------------|---------------|
| B | /b/ | ball | 🏐 |
| D | /d/ | dog | 🐕 |
| G | /g/ | goat | 🐐 |
| K | /k/ | kite | 🪁 |
| P | /p/ | pig | 🐷 |
| T | /t/ | turtle | 🐢 |

#### Level 2: Continuants
| Letter | Sound | Example Word | Example Emoji |
|--------|-------|--------------|---------------|
| F | /f/ | fish | 🐟 |
| M | /m/ | mouse | 🐭 |
| N | /n/ | nose | 👃 |
| S | /s/ | sun | ☀️ |
| V | /v/ | violin | 🎻 |
| Z | /z/ | zebra | 🦓 |

#### Level 3: Complex Consonants
| Letter | Sound | Example Word | Example Emoji |
|--------|-------|--------------|---------------|
| H | /h/ | hat | 🎩 |
| L | /l/ | lion | 🦁 |
| R | /r/ | rabbit | 🐰 |
| W | /w/ | whale | 🐋 |
| Y | /j/ | yo-yo | 🪀 |
| CH | /tʃ/ | cheese | 🧀 |
| SH | /ʃ/ | shark | 🦈 |
| TH | /θ/ | thumb | 👍 |

### Data Structure
```typescript
interface ConsonantPhoneme {
  letter: string;      // "B"
  sound: string;       // "/b/"
  ipa: string;         // "b"
  exampleWord: string; // "ball"
  exampleEmoji: string; // "🏐"
  category: 'stop' | 'continuant' | 'complex';
  similarSounds: string[]; // Letters commonly confused with this
}
```

---

## Section 19: Technical Structure

### Main Files to Create

| File | Purpose | Lines (est.) |
|------|---------|--------------|
| `src/frontend/src/pages/ConsonantQuest.tsx` | Main game component | 600-800 |
| `src/frontend/src/games/consonantQuestLogic.ts` | Game logic & phoneme data | 400-500 |
| `src/frontend/src/data/gameRegistries/wordWorkshop.ts` | Add registry entry | +50 |
| `src/frontend/src/routes/appRoutes.tsx` | Add route | +10 |

### Key Components
- `GameContainer` — Standard game wrapper
- `GameShell` — Error boundary and wellness timer
- `GameCursor` — Hand tracking cursor
- `GameHUD` — Score, level, streak display
- `CelebrationOverlay` — Win animations
- `VoiceInstructions` — TTS integration

### Hooks Used
```typescript
useGameHandTracking      // Hand tracking
useGameCompletion        // Game end, drops
useTTS                   // Text-to-speech
useAudio                 // Sound effects
useStreakTracking        // Streak management
```

### State Management
- Local React state for game state
- Refs for tracking game loop
- LocalStorage for settings persistence

### Dependencies
- `framer-motion` — Animations
- `react-webcam` — Camera access
- `@mediapipe/hands` — Hand tracking (via useGameHandTracking)

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Phoneme audio source | Use TTS initially, record custom later | High |
| Difficulty curve | Start easy, based on phonics research | Medium |
| Optimal round count | 5 rounds per level = 15 total | Medium |
| Similar sound pairs | /b/-/p/, /d/-/t/, /f/-/v/ based on phonetics | High |
| Engagement duration | 5-8 minutes based on age research | Medium |
| Visual style | Match Word Workshop (cream/blue/gold) | High |

---

## Section 21: Implementation Notes

### Strengths to Preserve (from similar games)
1. **PhonicsSounds** card layout and color system
2. **WordBuilder** streak milestone animations
3. **BlendBuilder** level selection UI
4. **Consistent hit radius** (0.12) across games

### Architecture Patterns
- Memoized component with `React.memo`
- Refs for game state accessed in callbacks
- Effect cleanup for all timers
- LocalStorage for persistent settings

### Testing Considerations
- Test with child users (ages 4-7)
- Verify phoneme clarity with speech therapist
- Test hand tracking with various lighting
- Validate no similar-sounding distractors in Level 1

### Performance Notes
- Target: 30 FPS for hand tracking
- Asset preload for smooth start
- Lazy load higher difficulty assets

---

## Section 22: Acceptance Criteria

### Must Have (MVP)
- [ ] Game launches from Word Workshop gallery
- [ ] Hand tracking initializes and shows cursor
- [ ] Player can hear consonant sounds
- [ ] Player can pinch to select letter cards
- [ ] Correct/incorrect feedback displayed
- [ ] Score tracks correctly
- [ ] Level progression works
- [ ] Game completes after 3 levels

### Should Have (Enhanced)
- [ ] Streak tracking with milestones
- [ ] TTS feedback for all interactions
- [ ] Parent settings panel
- [ ] Learning analytics captured
- [ ] Responsive design for tablets

### Nice to Have (Polish)
- [ ] Custom phoneme recordings
- [ ] Animated detective mascot
- [ ] Example word images
- [ ] Confusion tracking analytics
- [ ] Printable certificates

---

## Section 23: Test Plan

### Manual Gameplay Tests
| Test | Steps | Expected |
|------|-------|----------|
| Start game | Click Start button | Countdown, then first round |
| Correct answer | Pinch correct letter | Green feedback, points added |
| Wrong answer | Pinch wrong letter | Red feedback, retry allowed |
| Streak milestone | Answer 5 correctly | Celebration animation |
| Level complete | Finish 5 rounds | Level stats, unlock next |
| Game complete | Finish all levels | Final celebration |

### CV Control Tests
| Test | Steps | Expected |
|------|-------|----------|
| Hand detection | Show hand to camera | Cursor appears |
| Cursor tracking | Move hand | Cursor follows smoothly |
| Pinch detection | Pinch fingers | Selection registered |
| No hand | Remove hand | Cursor hides, game pauses |
| Re-entry | Show hand again | Cursor reappears |

### Fallback Tests
| Test | Steps | Expected |
|------|-------|----------|
| Touch mode | Disable camera | Touch controls work |
| Mouse mode | Use mouse | Click selection works |

### Edge Cases
| Test | Steps | Expected |
|------|-------|----------|
| Rapid pinching | Pinch quickly | Cooldown prevents double-tap |
| Partial hand | Show only fingers | Graceful degradation |
| Low light | Dim room | Tracking degrades gracefully |
| Audio off | Mute device | Visual feedback sufficient |

### Performance Tests
| Test | Metric | Target |
|------|--------|--------|
| Frame rate | Hand tracking FPS | ≥25 FPS |
| Load time | Start to playable | <3 seconds |
| Memory | Heap growth | <50MB per session |

---

## Appendix A: Registry Entry (Proposed)

```typescript
{
  id: 'consonant-quest',
  name: 'Consonant Quest',
  tagline: 'Be a sound detective! Find the letters that match the sounds! 🔍🔤',
  path: '/games/consonant-quest',
  icon: 'search',
  previewImage: '/assets/previews/consonant-quest.png',
  worldId: 'word-workshop',
  vibe: 'educational',
  ageRange: '4-7',
  isNew: true,
  cv: ['hand'],
  listed: true,
  drops: [
    { itemId: 'letter-b', chance: 0.1 },
    { itemId: 'letter-c', chance: 0.1 },
    { itemId: 'letter-d', chance: 0.1 },
    { itemId: 'tool-magnifying-glass', chance: 0.15 },
    { itemId: 'creature-owl', chance: 0.05, minScore: 100 },
  ],
  easterEggs: [
    {
      id: 'egg-consonant-cadet',
      name: 'Consonant Cadet',
      description: 'Complete Level 1 with 100% accuracy',
      trigger: 'level1-perfect',
      reward: { itemId: 'badge-cadet', quantity: 1 },
      hint: 'Get every sound right on the first try!',
      difficulty: 'medium',
    },
  ],
}
```

---

## Appendix B: File References

### Similar Games for Reference
| Game | File | Pattern to Follow |
|------|------|-------------------|
| PhonicsSounds | `src/frontend/src/pages/PhonicsSounds.tsx` | Card layout, phoneme playback |
| WordBuilder | `src/frontend/src/pages/WordBuilder.tsx` | Streak system, settings panel |
| BlendBuilder | `src/frontend/src/pages/BlendBuilder.tsx` | Level structure, progress tracking |

### Key Logic Files
| File | Purpose |
|------|---------|
| `src/frontend/src/games/phonicsSoundsLogic.ts` | Phoneme data structure reference |
| `src/frontend/src/games/wordBuilderLogic.ts` | Word selection algorithms |
| `src/frontend/src/hooks/useGameHandTracking.ts` | Hand tracking integration |

---

*End of Specification — Consonant Quest*
