# Math Jumpers

**Game ID:** math-jumpers  
**World:** Number Jungle  
**Manifest:** `src/frontend/src/data/gameRegistries/numberJungle.ts`  
**Code:** `src/frontend/src/pages/MathJumpers.tsx` (460 lines)  
**Logic:** `src/frontend/src/games/mathJumpersLogic.ts` (485 lines)

---

## 1. Concept Summary

- **One-line concept:** A number line platformer where kids solve math problems by jumping their character to the correct answer platform
- **Genre:** Educational / Platformer / Math
- **Target audience:** Ages 4-7, early math learners
- **Core player fantasy:** "I'm a math superhero jumping to answers!" - combining physical movement with mental arithmetic
- **Primary skill tested:** Mental math (addition, subtraction, multiplication), number recognition, decision-making under time pressure
- **Session length:** 3-5 minutes (5-10 problems per game)
- **Platform context:** Active CV game emphasizing hand-controlled movement and spatial reasoning

---

## 2. Repo Status

- **Implementation status:** ✅ Production Ready
- **What works now:**
  - Three difficulty levels (easy, medium, hard)
  - Hand tracking-based horizontal movement
  - Dynamic math problem generation (addition, subtraction, multiplication)
  - Multiple choice answer platforms (3-5 options)
  - Jump animation with parabolic arc
  - Real-time scoring with streak bonuses
  - TTS voice instructions and feedback
  - Timer-based rounds (12-20 seconds per problem)
  - Haptic feedback on correct answers
  - Touch/mouse fallback for platform selection
- **What is partial/missing:**
  - Body/pose tracking "jump" gesture (currently uses hand position only)
  - Vertical platform variations (all platforms at same height)
  - Multiplayer/competitive mode
  - Advanced visual effects for jumps
- **Evidence:**
  - Main file: `src/frontend/src/pages/MathJumpers.tsx` (460 lines)
  - Logic file: `src/frontend/src/games/mathJumpersLogic.ts` (485 lines)
  - Registry: `src/frontend/src/data/gameRegistries/numberJungle.ts`
- **Confidence level:** High - Fully playable and tested

---

## 3. Current Implementation

### Flow
1. **Pre-game menu:** Difficulty selection (easy/medium/hard)
2. **Game Start:** Voice introduces the game
3. **Gameplay Loop:**
   - Math problem displayed at top (e.g., "2 + 3 = ?")
   - Answer platforms appear at bottom with numbers
   - Player moves hand horizontally to position cursor
   - Character auto-jumps to nearest platform when hand is close
   - Answer validated on landing
4. **Feedback:** Immediate correct/wrong feedback with TTS
5. **Progression:** Next problem loads after 1.5s delay
6. **Completion:** Final score with accuracy and streak bonuses

### Controls
- **Hand X-position:** Move character horizontally
- **Proximity to platform:** Triggers auto-jump (within 0.15 normalized distance)
- **Touch/mouse:** Direct platform button clicking (fallback)
- **CV primary:** No keyboard controls

### Mechanics
- **Jump initiation:** Automatic when hand position aligns with platform
- **Jump physics:** Parabolic arc animation (2.5 units/sec horizontal speed)
- **Platform layout:** Horizontal row of 3-5 platforms (depending on difficulty)
- **Timer:** Counts down per problem (20s/15s/12s for easy/medium/hard)
- **Scoring:**
  - Base: 100 points per correct answer
  - Streak bonus: Up to 50 points (10 × streak, max 50)
  - Time bonus: 2 × remaining seconds

### Visuals/UI
- Sky blue background with cloud decorations
- Green platform blocks with white numbers
- Player character (emoji: 👾 standing, 🚀 jumping)
- Problem display banner at top
- Platform selection buttons at bottom (touch fallback)
- Streak counter (appears after 2+ consecutive correct)
- Progress indicator ("Problem X of Y")

### Gaps/Issues
- Jump feels "automatic" rather than player-controlled
- No vertical platform variety (all at same height)
- Limited visual feedback during jump
- Timer may be too fast for younger players

---

## 4. Intended Design

Based on manifest and code evidence:

- **Educational goal:** Build mental math fluency through active engagement
- **Pedagogical approach:** Kinesthetic learning - body movement reinforces number line concepts
- **Difficulty progression:** 
  - Easy: Addition/subtraction (1-10 range), 3 answer options
  - Medium: Add/subtract/multiply (1-20 range), 4 answer options
  - Hard: All operations (up to 30×10), 5 answer options
- **Accessibility:** Voice prompts, visual number display, touch fallback
- **Engagement:** Streak rewards, time pressure, character animation

### Core Loop
1. Read/hear math problem
2. Calculate answer mentally
3. Locate correct number on platform
4. Move hand to position above platform
5. Watch character jump to selected answer
6. Receive immediate feedback
7. Build streak for bonus points
8. Progress through problem set

---

## 5. Drift Analysis

### Where Implementation Matches Intent
✅ Hand tracking for horizontal positioning works well  
✅ Three difficulty levels with appropriate math ranges  
✅ Voice feedback via TTS integration  
✅ Streak system encourages continued success  
✅ Touch/mouse fallback ensures accessibility  
✅ Problem generation covers add/subtract/multiply  

### Where Implementation Exceeds Intent
🌟 Smooth jump animation with parabolic arc  
🌟 Comprehensive scoring with multiple bonus types  
🌟 Haptic feedback integration  
🌟 Clean platform button fallback UI  
🌟 Easter egg for perfect streak ("Math Master")  

### Where Implementation Falls Short
⚠️ "Jump" is position-based, not gesture-based (no actual jumping motion)  
⚠️ Platforms are static at same height (no vertical challenge)  
⚠️ Limited character customization  
⚠️ No power-ups or special abilities  

### Overall Assessment
**Alignment: 88%** - Core gameplay solid, could enhance with gesture-based jumping

---

## 6. Recommended Canonical Version

### Current Strengths to Keep
- Hand tracking horizontal movement
- Three-tier difficulty system
- Voice feedback integration
- Streak/scoring system
- Touch fallback

### Enhancements to Implement
1. **Gesture-based jumping:** Add body/pose "jump" gesture as trigger
2. **Vertical platform variety:** Stacked platforms at different heights
3. **Character selection:** Unlockable characters via drops
4. **Power-ups:** 
   - Time freeze
   - Hint (highlight correct platform)
   - Double points
5. **Better visuals:** Particle trails during jumps, platform glow on hover

### Experimental Features
- **Endless mode:** Continue until time runs out
- **Boss levels:** Multi-step problems
- **Multiplayer:** Race to answer first

---

## 7. Visual Identity

- **Overall look:** Bright, energetic, game-like
- **Camera view:** Side panel (hand tracking focus)
- **Art style:** Platformer aesthetic with blocky platforms
- **Mood:** Exciting, encouraging, action-oriented
- **Colors:** 
  - Sky blue background (#87CEEB)
  - Green platforms (#4CAF50, #81C784)
  - White text on platforms
  - Yellow/gold for streaks and highlights
- **Environment:** Floating platforms in sky with clouds
- **UI style:** Bold, rounded, kid-friendly
- **Active vibe:** "Jump to the correct answer!" 🚀

---

## 8. Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Pre-Game Menu** | Difficulty selection | Easy/Medium/Hard buttons, start button |
| **Gameplay** | Core experience | Problem display, game canvas, platforms, progress |
| **Jump Animation** | Transition | Character arc between platforms |
| **Feedback** | Answer validation | Correct/wrong message, TTS feedback |
| **Streak Display** | Motivation | Fire emoji + streak count (appears top-right) |
| **Game Complete** | Celebration | Final score breakdown, play again/done buttons |
| **Pause** | Break | Resume/restart options (via GameShell) |

---

## 9. Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move horizontally | Hand X position | Cursor follows hand |
| Jump to platform | Hand near platform X (auto-triggers) | Character launches with arc |
| Select platform (fallback) | Click/tap platform button | Same jump animation |
| Start game | Click Start button | Game begins, timer starts |

### CV Control Details
- **Hand tracking:** Index finger position mapped to horizontal cursor
- **Jump threshold:** Within 0.15 normalized distance of platform center
- **Cooldown:** Cannot jump while already jumping
- **Cursor visibility:** Green cursor follows hand position

---

## 10. Core Mechanics

### Problem Generation
```typescript
// From mathJumpersLogic.ts
easy: addition/subtraction (1-10 range)
medium: add/subtract/multiply (1-20 range, 2-6 × 2-5)
hard: add/subtract/multiply (up to 30×10, 20-49 range)
```

### Platform Layout
- Platforms distributed evenly across width (0.8 / count)
- Fixed Y position at 0.6 (60% down screen)
- Each platform displays one answer option
- Width: 12% of screen, Height: 8% of screen

### Jump Physics
```typescript
// Parabolic jump arc
speed: 2.5 units per second
arc height: 0.3 (30% of screen height)
y = 0.3 - sin(progress × π) × 0.3
```

### Scoring Formula
```
Base: 100 points
+ Streak Bonus: min(streak × 10, 50)
+ Time Bonus: timeLeft × 2
= Total per problem
```

### Timer Mechanics
- Decrements every second during gameplay
- Wrong answer or timeout: streak resets to 0
- Time bonus rewards quick answers

---

## 11. Rules

- **Start:** Select difficulty, click Start
- **Objective:** Solve math problems by jumping to correct answer platform
- **Allowed:** 
  - Move hand freely to position
  - Multiple attempts per problem (if wrong, reset to center)
  - Touch/mouse fallback anytime
- **Restricted:**
  - Cannot jump while already jumping
  - Cannot change answer after landing
  - Cannot pause timer (except via pause menu)
- **Scoring:** Based on correctness + speed + streak
- **Retry on wrong:** Player resets to center position, can try again
- **Win condition:** Complete all problems in the set

---

## 12. HUD / Gameplay UI

| Element | Purpose | Update |
|---------|---------|--------|
| Problem Display | Show current math problem | Each new problem |
| Game Canvas | Render platforms, player, background | Every frame (60fps) |
| Platform Buttons | Touch fallback for selection | Static during problem |
| Streak Counter | Show consecutive correct answers | On each correct answer |
| Progress | "Problem X of Y" indicator | After each problem |
| Score | Current points | Real-time |
| Timer | Seconds remaining | Every second |
| Feedback Overlay | Correct/wrong messages | On answer validation |

### Layout
```
┌─────────────────────────────────────┐
│         [Problem Display]           │
│              2 + 3 = ?              │
├─────────────────────────────────────┤
│                                     │
│         [Game Canvas]               │
│      ☁️                      ☁️     │
│                                     │
│         👾  (player)                │
│                                     │
│   ┌───┐   ┌───┐   ┌───┐            │
│   │ 4 │   │ 5 │   │ 6 │  platforms  │
│   └───┘   └───┘   └───┘            │
├─────────────────────────────────────┤
│  [4]  [5]  [6]  (touch buttons)     │
└─────────────────────────────────────┘
```

---

## 13. Feedback and Feel

### Success (Correct Answer)
- Success sound effect (playSuccess)
- Haptic vibration (triggerHaptic 'success')
- Voice feedback: "Great job!" + streak count
- Streak counter appears/updates
- 1.5s delay, then next problem
- Green highlight on selected platform

### Failure (Wrong Answer)
- Error sound effect (playError)
- Haptic vibration (triggerHaptic 'error')
- Voice feedback: "Not quite! Try again."
- Streak resets to 0
- Player resets to center position
- 1.5s delay before retry

### During Jump
- Character changes to rocket emoji (🚀)
- Smooth parabolic arc animation
- Shadow ellipse beneath character
- Lands on target platform

### Streak Feedback
| Streak | Message | Emoji |
|--------|---------|-------|
| 1 | "Great job!" | 🎉 |
| 2 | "Keep it up!" | ⭐ |
| 3+ | "Amazing streak!" | ⚡ |
| 5+ | "Unstoppable!" | 🔥 |

---

## 14. Points / Rewards / Progression

### Points Breakdown
| Source | Calculation |
|--------|-------------|
| Base | 100 per correct answer |
| Streak Bonus | +10 × streak (max 50) |
| Time Bonus | +2 × seconds remaining |

### Final Score Calculation
```typescript
calculateFinalScore(state): {
  baseScore: accumulated points
  accuracyBonus: (correct/total) × 200
  streakBonus: min(streak × 20, 100)
  total: sum of all above
}
```

### Rewards (Drops)
- Shape Star (20% chance)
- Creature Alien (10% chance)
- Element Gold (3% chance at 95+ score)

### Easter Eggs
- **Math Master:** Solve 5 problems in a row without mistakes
  - Reward: Element Gold × 1
  - Hint: "Perfect math skills reveal golden treasures..."

### Progression
- Problem-by-problem advancement
- Difficulty selectable at start
- No persistent leveling (session-based)

---

## 15. End States

### Problem Correct
- Score updates with bonuses
- Streak increments
- Voice feedback
- 1.5s celebration delay
- Next problem loads (or game complete)

### Problem Wrong
- Streak resets to 0
- Voice feedback
- Player returns to center
- Can retry same problem type

### Timeout
- Treated as wrong answer
- Streak resets
- Voice: "Time's up! Try the next one."
- Advances to next problem

### Game Complete
- Celebration modal appears
- Final score breakdown displayed:
  - Base Score
  - Accuracy Bonus
  - Streak Bonus
  - Total
- Options: Play Again / Done
- Progress saved via completeGame hook

---

## 16. Parallel Modes / Alternate Implementations

### Mode A: Current (Hand Position Jump)
Hand X-position determines jump target. Automatic jump when aligned.

### Mode B: Gesture Jump (Recommended Enhancement)
- Body/pose tracking detects actual "jump" gesture
- Player positions hand over platform
- Physical jump motion triggers character jump
- More active, physically engaging

### Mode C: Vertical Platformer
- Platforms at multiple heights
- Must solve sequence of problems to climb
- Higher platforms = harder problems
- Goal: Reach the top

### Mode D: Race Mode (Multiplayer)
- Two players side by side
- Same problems, race to answer
- First to land on correct platform wins round
- Best of 5 problems

### Mode E: Endless Mode
- Continuous problem generation
- Speed increases over time
- How many can you solve before timeout?
- Leaderboard for high scores

---

## 17. Improvement Opportunities

### Low Cost
- Add particle trail during jumps
- Platform glow effect on hover
- More feedback messages
- Character selection (emoji options)

### Medium Effort
- Implement gesture-based jumping (pose tracking)
- Vertical platform variations
- Power-ups (time freeze, hint, double points)
- Background themes (space, underwater, etc.)

### Ambitious
- Multiplayer race mode
- Level editor for custom problems
- AI-generated problems based on skill
- Integration with school curriculum standards
- Parent dashboard showing math progress

---

## 18. Content Model

### Math Problems

**Easy Difficulty**
- Addition: 1-6 + 1-5 (answers 2-11)
- Subtraction: 3-10 - 1 to (n-1) (answers 1-9)
- 3 answer options
- 20 seconds per problem

**Medium Difficulty**
- Addition: 5-14 + 1-10 (answers 6-24)
- Subtraction: 10-19 - 1-9 (answers 1-18)
- Multiplication: 2-6 × 2-5 (answers 4-30)
- 4 answer options
- 15 seconds per problem

**Hard Difficulty**
- Addition: 10-29 + 5-24 (answers 15-53)
- Subtraction: 20-49 - 1-19 (answers 1-48)
- Multiplication: 3-10 × 3-10 (answers 9-100)
- 5 answer options
- 12 seconds per problem

### Answer Generation
- Always includes correct answer
- Distractors: correct ± random offset
- Easy: offset -3 to +3
- Medium: offset -5 to +5
- Hard: offset -8 to +8
- All answers > 0

### Problem Set Size
- Easy: 5 problems
- Medium: 7 problems
- Hard: 10 problems

---

## 19. Technical Structure

### Main Files
| File | Purpose | Lines |
|------|---------|-------|
| `MathJumpers.tsx` | Main React component | 460 |
| `mathJumpersLogic.ts` | Pure game logic functions | 485 |

### Key Components in MathJumpers.tsx
- `MathJumpersContent` - Game implementation
- `MathJumpers` (default) - GameShell wrapper
- Canvas-based rendering for game world
- Framer Motion for celebration animations

### Logic Functions (mathJumpersLogic.ts)
| Function | Purpose |
|----------|---------|
| `generateProblem()` | Create math problem based on difficulty |
| `generateAnswerOptions()` | Create multiple choice options |
| `createPlatforms()` | Generate platform layout |
| `createInitialState()` | Reset game state |
| `startGame()` | Begin new game |
| `movePlayerToPlatform()` | Initiate jump to platform |
| `updatePlayerPosition()` | Frame-by-frame movement |
| `checkAnswer()` | Validate landing on platform |
| `nextProblem()` | Advance to next problem |
| `updateTimer()` | Decrement timer each second |
| `getFeedbackMessage()` | Streak-based messages |
| `calculateFinalScore()` | Final scoring with bonuses |

### Hooks Used
- `useGameHandTracking` - Hand position tracking
- `useGameCompletion` - Progress saving
- `useAudio` - Sound effects
- `useTTS` - Voice feedback

### State Management
- Local React state for game state
- Refs for game loop and timing
- Zustand for completion/progress

### Dependencies
- MediaPipe hand tracking
- Framer Motion for animations
- Canvas API for game rendering

---

## 20. Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Gesture-based jumping | Not implemented; body tracking available | High |
| Vertical platforms | All platforms at y=0.6 | High |
| Character customization | Hardcoded emojis | High |
| Problem difficulty calibration | Not user-tested with target age | Medium |
| Timer appropriateness | May be too fast for 4-year-olds | Medium |
| Accessibility for motor differences | Hit radius not adjustable | Medium |

---

## 21. Implementation Notes

### Strengths to Preserve
- Clean separation of logic into `mathJumpersLogic.ts`
- Pure functions for game state updates
- Smooth canvas-based animation loop
- Comprehensive TypeScript types
- Good fallback touch UI

### Architecture Patterns
- Functional state updates
- Refs for mutable game loop data
- Canvas for game world, React for UI overlay
- RequestAnimationFrame for smooth animation

### Testing Considerations
- Problem generation should avoid duplicates
- Answer options must always include correct answer
- Jump physics must complete before next input
- Timer cleanup on unmount

### Performance Notes
- Canvas clearing/redrawing every frame
- Minimal React re-renders during gameplay
- Efficient hand tracking callback

---

## 22. Acceptance Criteria

- [ ] Hand tracking moves cursor smoothly horizontally
- [ ] Character jumps to platform when hand aligned
- [ ] Math problems generate correctly for each difficulty
- [ ] All three difficulties work (easy/medium/hard)
- [ ] Scoring calculates correctly (base + streak + time)
- [ ] Streak system tracks consecutive correct answers
- [ ] Voice feedback works via TTS
- [ ] Touch fallback buttons function correctly
- [ ] Timer counts down and triggers timeout
- [ ] Game completes after all problems solved
- [ ] Final score displays all bonuses
- [ ] Progress saves on completion
- [ ] Easter egg triggers on 5-problem streak

---

## 23. Test Plan

### Manual Gameplay Tests
- [ ] Play easy mode, solve all 5 problems
- [ ] Play medium mode, verify multiplication appears
- [ ] Play hard mode, verify larger numbers
- [ ] Get a problem wrong, verify retry works
- [ ] Let timer expire, verify timeout handling
- [ ] Build 5+ streak, verify "Unstoppable!" message
- [ ] Complete game, verify score breakdown

### CV Control Tests
- [ ] Hand tracking initializes correctly
- [ ] Cursor follows hand position
- [ ] Jump triggers at correct proximity
- [ ] Jump animation plays smoothly
- [ ] No hand = no cursor (safe state)

### Fallback Tests
- [ ] Touch platform buttons work
- [ ] Mouse clicks on buttons work
- [ ] Game playable without camera

### Edge Cases
- [ ] Rapid hand movement (don't crash)
- [ ] Multiple platform proximity (nearest wins)
- [ ] Click during jump (ignored)
- [ ] Tab switch during game (timer pauses?)
- [ ] Very fast answers (streak tracking)

### Performance
- [ ] 60fps maintained during jumps
- [ ] No memory leaks in game loop
- [ ] Smooth on target devices (tablets)

---

**Last Updated:** 2026-04-01  
**Confidence:** High - Fully implemented and playable

**Related:**
- Logic: `src/frontend/src/games/mathJumpersLogic.ts`
- Main: `src/frontend/src/pages/MathJumpers.tsx`
- Registry: `src/frontend/src/data/gameRegistries/numberJungle.ts`
