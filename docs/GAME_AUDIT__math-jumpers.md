# Game Audit: Math Jumpers

**Audit Date:** 2026-03-09  
**Game ID:** math-jumpers  
**Files:** 
- `src/frontend/src/pages/MathJumpers.tsx` (438 lines)
- `src/frontend/src/games/mathJumpersLogic.ts` (485 lines)  
**Age Range:** 4-7  
**World:** number-jungle  
**CV:** ['hand']

---

## 1. Executive Summary

| Metric | Score | Notes |
|--------|-------|-------|
| **Overall Score** | **6.5/10** | Functional foundation with significant gaps in visual polish and child-appropriate scaffolding |
| **Child-Centered UX** | 5.5/10 | Core mechanic works but lacks guidance for younger players; timeout pressure too high |
| **Game Juice** | 5/10 | Minimal visual/audio feedback; feels "flat" despite motion mechanics |
| **Code Quality** | 8/10 | Well-structured logic separation, good TypeScript, uses shared infrastructure |
| **Total Issues** | **17** | 6 UX, 6 Juice, 5 Technical |

**Verdict:** A competent technical implementation that under-delivers on child engagement. The jumping mechanic has potential but needs significant juice and UX scaffolding to feel like a complete game for 4-7 year olds. Production-ready only with quick wins implemented.

---

## 2. Child-Centered UX Findings (KUX-###)

### 🔴 HIGH: No Tutorial or First-Time Guidance (KUX-001)
**Evidence:** `Observed` - Pre-game screen (lines 286-309) shows only difficulty buttons and "Start Game!" button. No explanation of HOW to play.

**Impact:** Children aged 4-5 may not understand the hand-tracking mechanic (move hand horizontally to position, then jump). The game expects them to intuit "move hand left/right to align with platform" without demonstration.

**Recommendation:** 
- Add animated hand cursor showing horizontal movement
- Show brief "Move your hand to aim, then press button to jump" animation
- Include visual diagram showing hand position → platform selection → jump

---

### 🔴 HIGH: Timeout Pressure Excessive for Age Group (KUX-002)
**Evidence:** `Observed` - Lines 73-87 (LEVEL_CONFIGS): Easy = 20s/problem, Medium = 15s, Hard = 12s. Timer counts down visibly (line 372).

**Impact:** Research on children 4-7 shows that visible countdown timers increase math anxiety and reduce performance. 20 seconds may not be enough for a 4-year-old to: (1) read problem, (2) calculate answer, (3) position hand, (4) jump.

**Recommendation:**
- Double easy mode timer to 40 seconds
- Add "Zen Mode" option with no timer
- Replace numeric countdown with visual "sun setting" or character getting tired
- Consider age-based auto-adjustment

---

### 🔴 HIGH: No Visual Feedback During Hand Positioning (KUX-003)
**Evidence:** `Observed` - Line 65-88: Hand position maps directly to platform selection with `minDistance < 0.15` threshold. No on-screen cursor, ghost character, or platform highlight during aiming.

**Impact:** Children cannot see WHERE their hand is pointing until they commit to a jump. This creates trial-and-error frustration rather than skill-based play.

**Recommendation:**
- Add floating cursor showing hand position on screen
- Highlight nearest platform as "ready to jump" target
- Show ghost/outline of player character at jump destination

---

### 🟡 MEDIUM: No Progression Visibility Within Level (KUX-004)
**Evidence:** `Observed` - Line 371-373: Shows "Problem X of Y" text only. No visual progress bar, stars earned so far, or completion celebration between problems.

**Impact:** Children lose sense of accomplishment mid-game. Each problem feels disconnected rather than part of a journey.

**Recommendation:**
- Add star trail or path that fills in as problems are solved
- Show mini-celebration (sparkle, character cheer) between problems
- Display streak count more prominently than just top-right badge

---

### 🟡 MEDIUM: Error Feedback Resets Without Teaching (KUX-005)
**Evidence:** `Observed` - Lines 168-187: Wrong answer plays error sound, says "Not quite! Try again.", then resets player to center after 1.5s delay. No explanation of what the correct answer was.

**Impact:** Children learn by trial-and-error rather than understanding. No opportunity to connect wrong platform number with correct answer.

**Recommendation:**
- Show correct answer highlighted on the platform they should have chosen
- Add educational voiceover: "That was 4. The answer to 2+3 is 5!"
- Consider "second chance" mechanic before resetting

---

### 🟢 LOW: Character Choice Limited (KUX-006)
**Evidence:** `Observed` - Line 250: Player is always emoji `👾` (or `🚀` when jumping). No customization or avatar selection.

**Impact:** Reduced emotional connection for children who want to "be" a favorite character.

**Recommendation:** Offer 3-4 character options (animal, robot, alien) in pre-game screen.

---

## 3. Game Juice Findings

### Overall Juice Score: 5/10

**What's Working:**
- ✅ Basic jump animation (line 330-334: sine wave arc)
- ✅ Streak celebration badge (lines 320-324)
- ✅ Motion feedback via framer-motion (AnimatePresence on feedback)
- ✅ Haptic feedback on success/error (lines 144, 170)
- ✅ Score breakdown in completion screen (lines 397-400)

**What's Missing:**

### 🔴 HIGH: Jump Animation Lacks Impact (JUICE-001)
**Evidence:** `Observed` - Lines 294-344: Player moves horizontally at constant speed while Y position follows `sin(progress * PI)`. No squash/stretch, no particle trail, no landing impact.

**Impact:** Jump feels mechanical rather than joyful. The core mechanic (jumping) should be the most satisfying moment.

**Recommendation:**
- Add squash animation before jump (anticipation)
- Stretch character during jump arc
- Add particle trail behind jumping character
- Landing: brief squash + dust cloud particles
- Screen shake on landing (subtle)

---

### 🔴 HIGH: Platforms Are Static and Lifeless (JUICE-002)
**Evidence:** `Observed` - Lines 215-233: Platforms are solid green rectangles with numbers. No idle animation, no reaction to player proximity.

**Impact:** Game world feels "dead" — platforms are just UI elements, not part of a living game world.

**Recommendation:**
- Gentle floating/bobbing animation on platforms
- Platform "wobble" when player lands nearby
- Highlight/glow on platform when hand cursor hovers over it
- Different platform styles (grass, stone, cloud) by difficulty

---

### 🔴 HIGH: Success Feedback Minimal (JUICE-003)
**Evidence:** `Observed` - Lines 357-367: Correct answer shows motion.div with emoji + message, plays success sound. No particles, no screen flash, no character reaction.

**Impact:** Solving a math problem should feel like a celebration. Current feedback is functional but not delightful.

**Recommendation:**
- Burst of 12-16 particles from platform center
- Character does victory dance/flip
- Score number pops up and floats upward
- Background briefly brightens
- Success sound with musical "level up" chime

---

### 🟡 MEDIUM: No Environmental Atmosphere (JUICE-004)
**Evidence:** `Observed` - Lines 203-212: Background is solid `#87CEEB` (sky blue) with single cloud shape. No parallax, no animated elements, no thematic cohesion.

**Impact:** Game feels like a prototype rather than a "jungle" game (despite being in number-jungle world).

**Recommendation:**
- Add parallax background layers (distant trees, clouds)
- Animated elements: birds, butterflies, leaves falling
- Platform theming: vines, jungle platforms, floating islands
- Ambient soundscape (jungle birds, wind)

---

### 🟡 MEDIUM: Celebration Screen Underwhelming (JUICE-005)
**Evidence:** `Observed` - Lines 378-424: Game completion shows modal with KenneyIcon star and score breakdown. No confetti, no character celebration, no fanfare.

**Impact:** Completion of 5-10 math problems should feel like a major achievement for young children.

**Recommendation:**
- Full-screen confetti burst
- Character does celebration animation
- Voiceover: "Amazing work! You're a math superstar!"
- Unlock notification for any earned drops
- Option to continue (harder problems) or return to menu

---

### 🟢 LOW: No Audio Feedback During Jump (JUICE-006)
**Evidence:** `Observed` - Jump action (lines 276-288) triggers no sound effect.

**Impact:** Missing audio cue for primary action reduces immersion.

**Recommendation:** Add "whoosh" or "spring" sound effect on jump initiation.

---

## 4. Technical Issues

### 🟡 MEDIUM: Game Loop Runs Unnecessarily When Idle (TECH-001)
**Evidence:** `Observed` - Lines 98-117: `requestAnimationFrame` game loop runs continuously regardless of game state. Only updates player position when `status === 'playing'` but still fires every frame.

**Impact:** Unnecessary CPU/battery usage when game is in menu or paused.

**Fix:** Pause RAF when `gameState.status === 'idle'` or `'complete'`:
```typescript
useEffect(() => {
  if (gameState.status !== 'playing') {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    return;
  }
  // ... start loop
}, [gameState.status]);
```

---

### 🟡 MEDIUM: Timer Effect Recreation Every Second (TECH-002)
**Evidence:** `Observed` - Lines 120-135: `setInterval` recreated whenever `gameState.status`, `playError`, `speak`, or `ttsEnabled` changes. Dependencies cause unnecessary interval teardown/recreation.

**Impact:** Potential timing drift and unnecessary effect churn.

**Fix:** Use functional updates and reduce dependencies:
```typescript
useEffect(() => {
  if (gameState.status !== 'playing') return;
  const timer = setInterval(() => {
    setGameState(prev => updateTimer(prev));
  }, 1000);
  return () => clearInterval(timer);
}, [gameState.status]); // Minimal deps
```

---

### 🟡 MEDIUM: Hand Tracking Threshold Magic Number (TECH-003)
**Evidence:** `Observed` - Line 86: `minDistance < 0.15` hardcoded. No documentation or configurability.

**Impact:** Threshold may be too sensitive or not sensitive enough for different screen sizes. No way to tune without code change.

**Fix:** Extract to named constant with JSDoc explaining the value:
```typescript
/** Proximity threshold (0-1 normalized) for auto-jump. 
 *  0.15 = ~15% of screen width — roughly one platform width */
const JUMP_PROXIMITY_THRESHOLD = 0.15;
```

---

### 🟢 LOW: Unused isLoading State (TECH-004)
**Evidence:** `Observed` - Line 55: `const [isLoading] = useState(false)` — never changed, always false.

**Impact:** Dead code. Loading state is hardcoded off.

**Fix:** Either implement actual loading (e.g., for assets) or remove the state.

---

### 🟢 LOW: No Test Coverage for Game Logic (TECH-005)
**Evidence:** `Observed` - No test file found for `mathJumpersLogic.ts`.

**Impact:** Core game mechanics (scoring, problem generation, answer checking) have no automated verification.

**Fix:** Create `mathJumpersLogic.test.ts` covering:
- Problem generation produces valid equations
- Answer checking correctly identifies right/wrong
- Score calculation with streak/time bonuses
- Platform positioning logic

---

## 5. Quick Wins (5-10 Items)

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 1 | Add jump sound effect (JUICE-006) | 5 min | Medium |
| 2 | Remove/hide numeric timer for Easy mode (KUX-002) | 10 min | High |
| 3 | Add platform highlight on hand proximity (KUX-003) | 20 min | High |
| 4 | Fix game loop to pause when idle (TECH-001) | 15 min | Medium |
| 5 | Add particle burst on correct answer (JUICE-003) | 30 min | High |
| 6 | Add gentle platform bobbing animation (JUICE-002) | 20 min | Medium |
| 7 | Show correct answer after wrong attempt (KUX-005) | 15 min | Medium |
| 8 | Add simple hand cursor overlay (KUX-003) | 25 min | High |
| 9 | Reduce timer dependencies (TECH-002) | 10 min | Low |
| 10 | Document magic number threshold (TECH-003) | 5 min | Low |

**Total Effort:** ~2.5 hours for all quick wins

---

## 6. Major Improvements

### 6.1 Interactive Tutorial System (KUX-001)
**Complexity:** Medium  
**Effort:** 6-8 hours

Create first-time user experience:
- Animated hand cursor showing horizontal movement
- Step-by-step: "Move your hand left and right" → "Stop at the platform with the answer" → "Press the button to jump!"
- Practice round with guaranteed success (problem: 1+1, platforms: 2 and 9)
- "Don't show again" checkbox (persist in localStorage)

---

### 6.2 Enhanced Jump Juice System (JUICE-001)
**Complexity:** Medium  
**Effort:** 4-6 hours

Transform jump from mechanical to delightful:
- Anticipation frame: character squashes down
- Jump: stretch vertically + particle trail + whoosh sound
- Arc: smooth bezier with slight horizontal easing
- Landing: squash impact + dust particles + subtle screen shake
- Chain jumps: if next problem's answer is adjacent, continue momentum

---

### 6.3 Living Jungle Environment (JUICE-004)
**Complexity:** Medium  
**Effort:** 6-8 hours

Transform static background to immersive jungle:
- Parallax layers: distant mountains, midground trees, foreground vines
- Animated sprites: birds, butterflies, floating pollen
- Dynamic lighting: sun rays, occasional cloud shadows
- Platform themes: mossy stone, jungle leaves, wooden planks
- Ambient audio: jungle soundscape with reactive elements

---

### 6.4 Adaptive Difficulty & Age Profiles (KUX-002)
**Complexity:** High  
**Effort:** 10-12 hours

Replace static difficulty with adaptive system:
- Pre-game age selection (4-5, 6-7) adjusts timer and problem complexity
- Track accuracy and speed to auto-adjust difficulty within session
- "I need help" button that extends timer or shows hint
- Parent settings: override defaults, disable timer entirely

---

### 6.5 Character Selection & Progression (KUX-006)
**Complexity:** Medium  
**Effort:** 6-8 hours

Add emotional investment through characters:
- 4 characters: Jungle Monkey, Math Robot, Space Alien, Magic Fairy
- Each has unique jump animation and celebration
- Unlock new characters via perfect streaks or total problems solved
- Character-themed particle effects

---

### 6.6 Comprehensive Test Suite (TECH-005)
**Complexity:** Low  
**Effort:** 4-6 hours

Create `mathJumpersLogic.test.ts` with coverage for:
- Problem generation: verify all difficulties produce solvable equations
- Answer options: verify distractors are plausible but wrong
- Scoring: verify streak bonus caps at 50, time bonus calculation
- State transitions: idle → playing → correct/wrong → complete
- Edge cases: timeout, simultaneous inputs, rapid platform changes

---

## 7. Accessibility Notes

**Strengths:**
- TTS integration present (`speak()` calls on problem start, success, error)
- Mouse/touch fallback via platform buttons (lines 338-354)
- Haptic feedback for mobile/tablet
- Good color contrast on problem display (dark text on white)

**Gaps:**
- No keyboard navigation support (arrow keys to aim, space to jump)
- No high-contrast mode for visually impaired
- No screen reader announcements for game state changes
- Timer creates barrier for children with processing delays

---

## 8. Safety Considerations

**Strengths:**
- Uses standardized GameShell with wellness timer
- Error boundary enabled
- No data collection beyond game progress
- COPPA-compliant (no PII)

**Gaps:**
- No pause button during gameplay
- Hand tracking loss detection present but not surfaced to user
- No "take a break" reminder during long sessions

---

## 9. Evidence Log

| Finding | Type | Location |
|---------|------|----------|
| No tutorial/guidance | Observed | MathJumpers.tsx:286-309 |
| Easy timer = 20s | Observed | mathJumpersLogic.ts:73 |
| No hand cursor | Observed | MathJumpers.tsx:65-88 |
| Jump animation = sin wave | Observed | mathJumpersLogic.ts:330-334 |
| Platforms static green rects | Observed | MathJumpers.tsx:215-233 |
| isLoading = useState(false) | Observed | MathJumpers.tsx:55 |
| No test file exists | Observed | (file missing) |
| minDistance < 0.15 | Observed | MathJumpers.tsx:86 |
| RAF loop always runs | Observed | MathJumpers.tsx:98-117 |
| Problem X of Y display | Observed | MathJumpers.tsx:371-373 |
| Error: "Not quite! Try again." | Observed | MathJumpers.tsx:171 |
| Success: basic motion.div | Observed | MathJumpers.tsx:357-367 |

---

## 10. Summary & Next Steps

**Immediate Actions (This Week):**
1. Add jump sound effect (5 min)
2. Hide numeric timer for Easy mode, replace with visual indicator (10 min)
3. Add platform highlight on hand proximity (20 min)
4. Create basic test suite for logic (4 hours)

**Short Term (Next Sprint):**
1. Implement hand cursor overlay
2. Add particle burst on correct answer
3. Add platform bobbing animation
4. Show correct answer after wrong attempt

**Long Term (Backlog):**
1. Interactive tutorial system
2. Living jungle environment with parallax
3. Character selection and progression
4. Adaptive difficulty based on age and performance

---

*Audit conducted using Evidence-First discipline. All claims labeled as Observed (directly verified), Inferred (logical implication), or Unknown (cannot determine).*

**Audited By:** AI Agent  
**Prompt Used:** Comprehensive Game Auditor  
**Lenses Applied:** Child-Centered UX, Game Juice, Reality-First Code
