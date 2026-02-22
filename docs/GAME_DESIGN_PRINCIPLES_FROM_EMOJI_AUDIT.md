# Game Design Principles - Lessons from Emoji Match Audit

**Date:** 2026-02-20  
**Source:** Comprehensive video audit of emoji_match.mov (185+ findings from 8 agents)  
**Purpose:** Mandatory design principles for ALL new games to prevent repeating critical failures  
**Status:** **REQUIRED READING** before implementing any game

---

## 🚨 CRITICAL FAILURES TO AVOID

### THE BIG 3 GAME-BREAKING ISSUES

1. **Invisible/Too-Small Cursor** (Issue UI-001, HT-001)
   - Emoji match had 10-15px cursor = effectively invisible to toddlers
   - **MANDATORY FIX:** 60-80px minimum cursor size, bright color, high contrast

2. **Coordinate Mapping Failures** (Issue HT-001)
   - 2787px offset between hand position and cursor = game unplayable
   - **MANDATORY FIX:** Proper handToScreenCoordinates() transformation with aspect ratio handling

3. **Text-Only Instructions for Pre-Readers** (Issue IN-001)
   - Target audience ages 2-4 cannot read
   - **MANDATORY FIX:** Voice-over + animated demos, zero text dependency

---

## ✅ MANDATORY REQUIREMENTS FOR ALL GAMES

### 1. CURSOR & HAND TRACKING (S1 - BLOCKER)

**Requirements:**

- ✅ Cursor size: **60-80px diameter minimum** (not 10-15px)
- ✅ Cursor color: **Bright yellow/red/white with dark outline**
- ✅ Cursor contrast: **≥4.5:1 against ALL backgrounds** (prefer 7:1)
- ✅ Cursor visibility: **100% of gameplay frames** (z-index top layer)
- ✅ Cursor effects: **Trailing effect or motion blur for movement clarity**
- ✅ Cursor states: **Different visual for pinch/select vs hover**
- ✅ Pulsing animation when hand detected (helps toddlers understand cause-and-effect)

**Code Template:**

```typescript
// MANDATORY cursor configuration
const CURSOR_CONFIG = {
  size: 70, // 60-80px range
  color: '#FFD700', // Bright yellow
  outlineColor: '#000000',
  outlineWidth: 3,
  trailLength: 5,
  pulseSpeed: 1.5,
  contrastRatio: 7.0, // WCAG AAA for children
};

// MANDATORY coordinate transformation
function handToScreenCoordinates(
  landmark: { x: number; y: number }, // MediaPipe normalized 0-1
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number } {
  // Step 1: Normalize to video pixel coordinates
  const videoX = landmark.x * videoWidth;
  const videoY = landmark.y * videoHeight;

  // Step 2: Calculate scaling (handle aspect ratio)
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Step 3: Transform to canvas coordinates
  const canvasX = videoX * scaleX;
  const canvasY = videoY * scaleY;

  // Step 4: Clamp to bounds
  return {
    x: Math.max(0, Math.min(canvasWidth, canvasX)),
    y: Math.max(0, Math.min(canvasHeight, canvasY)),
  };
}
```

**Acceptance Criteria:**

- [ ] Cursor visible in manual QA video (record 1-minute gameplay)
- [ ] Cursor follows hand within 50px tolerance (measure on screen)
- [ ] Cursor works on multiple screen sizes (test 3 different resolutions)
- [ ] Toddler tester can see cursor and understand it follows their hand (95% comprehension rate)

---

### 2. TARGET SIZES & HITBOXES (S1 - BLOCKER)

**Requirements:**

- ✅ Minimum target size: **15-20% of screen width** (420-560px at 2798px width)
- ✅ Minimum hitbox: **2-3x visual target size** (generous for toddler motor skills)
- ✅ Minimum spacing: **30-40px between interactive elements**
- ✅ Magnetic snap-to-target: **Within 100px, cursor snaps to center**
- ✅ No targets smaller than **120px** under any circumstances

**Toddler Motor Control Research:**

- Ages 2-4 reliably target 9-12mm physical size
- Fine motor skills still developing
- Need generous hitboxes and forgiving interactions

**Code Template:**

```typescript
// MANDATORY target configuration
const TARGET_CONFIG = {
  minVisibleSize: 150, // 15% of 1000px standard width
  minHitboxSize: 300, // 2x visible size
  minSpacing: 40,
  magneticSnapDistance: 100,
  snapAnimationDuration: 200, // ms
};

function checkTargetHit(
  cursorPos: { x: number; y: number },
  target: { x: number; y: number; size: number },
): { hit: boolean; shouldSnap: boolean } {
  const distance = Math.sqrt(
    Math.pow(cursorPos.x - target.x, 2) + Math.pow(cursorPos.y - target.y, 2),
  );

  const hitboxRadius = (target.size * 2) / 2; // 2x size for hitbox
  const hit = distance <= hitboxRadius;
  const shouldSnap = distance <= TARGET_CONFIG.magneticSnapDistance;

  return { hit, shouldSnap };
}
```

**Acceptance Criteria:**

- [ ] All targets measured ≥15% screen width
- [ ] Toddler tester achieves 95% success rate on first attempt
- [ ] No frustration behaviors observed (hitting screen, giving up)
- [ ] Hitbox tested with debug visualization (record video)

---

### 3. VOICE-OVER INSTRUCTIONS (S1 - BLOCKER)

**Requirements:**

- ✅ **Zero text dependency** for core gameplay
- ✅ Voice-over for ALL instructions (not optional)
- ✅ Simple language (2-4 year old vocabulary)
- ✅ Instructions <3 sentences
- ✅ Friendly, encouraging tone
- ✅ Speak prompts, goals, feedback (not just initial instructions)

**Code Template:**

```typescript
import { useTTS } from '../hooks/useTTS';

// MANDATORY voice-over configuration
const VOICE_CONFIG = {
  voice: 'child-friendly', // Warm, encouraging voice
  rate: 0.9, // Slightly slower for comprehension
  pitch: 1.1, // Slightly higher for engagement
  volume: 1.0,
};

// Example usage in game
function GameInstructions() {
  const { speak } = useTTS();

  useEffect(() => {
    // MANDATORY: Speak instructions on game start
    speak("Welcome! Find the happy emoji and pinch it!");

    // Wait 2 seconds, then demo
    setTimeout(() => {
      speak("Watch me show you how!");
      playAnimatedDemo();
    }, 2000);
  }, []);

  return (
    <div>
      {/* Visual instructions are SUPPLEMENTARY, not primary */}
      <AnimatedDemo />
    </div>
  );
}
```

**Banned Phrases** (too complex for ages 2-4):

- ❌ "Utilize", "Implement", "Configure"
- ❌ "Match the corresponding emoji"
- ❌ "Perform a pinch gesture"

**Good Phrases:**

- ✅ "Find the happy face!"
- ✅ "Pinch it like this!"
- ✅ "Great job! Try again!"

**Acceptance Criteria:**

- [ ] Game playable with monitor muted (turn off screen text)
- [ ] 90% of toddlers start game without parent help
- [ ] Voice instructions tested with 5+ children ages 2-4
- [ ] All vocabulary verified against 2-4 year old word lists

---

### 4. SUCCESS/FAILURE FEEDBACK (S1 - BLOCKER)

**Requirements:**

- ✅ **Immediate feedback** <100ms after action
- ✅ **Visual celebration** on success (particles, animations, confetti)
- ✅ **Sound effects** (pleasant chime for success, gentle boing for error)
- ✅ **Character celebration** (mascot dances, jumps, cheers)
- ✅ **Gentle error feedback** (shake animation + "try again", NO harsh sounds)
- ✅ **Feedback persistence** 2-3 seconds (toddler cognitive processing time)
- ✅ **Positive reinforcement** (even on errors, encourage trying again)

**Code Template:**

```typescript
// MANDATORY feedback configuration
const FEEDBACK_CONFIG = {
  successDelay: 50, // <100ms
  feedbackDuration: 2500, // 2.5 seconds minimum
  particleCount: 50,
  soundVolume: 0.8,
  celebrationAnimationDuration: 3000,
};

function onSuccessfulMatch() {
  // MANDATORY: Immediate visual feedback
  playParticleExplosion({ count: 50, color: 'gold' });

  // MANDATORY: Sound effect
  playSound('success-chime.mp3');

  // MANDATORY: Character celebration
  showMascotCelebration('dance');

  // MANDATORY: Voice feedback
  speak('Amazing! You found it!');

  // MANDATORY: Score update with animation
  animateScoreIncrease(10);

  // Persist for 2-3 seconds
  setTimeout(() => {
    continueGame();
  }, 2500);
}

function onIncorrectAttempt() {
  // MANDATORY: Gentle shake animation (no scary red X)
  animateTargetShake({ duration: 300, intensity: 5 });

  // MANDATORY: Gentle sound (boing, not buzzer)
  playSound('gentle-try-again.mp3');

  // MANDATORY: Encouraging voice
  speak('Not quite! Try the other one!');

  // NO PENALTIES (score stays same, no lives lost)
  // Let them try again immediately
}
```

**Banned Feedback:**

- ❌ Harsh buzzers or error sounds
- ❌ Red "X" or scary visuals
- ❌ Score penalties
- ❌ "Wrong!" or "Incorrect!" voice
- ❌ Game over / lives system

**Acceptance Criteria:**

- [ ] Feedback appears <100ms after action (measure with video frame analysis)
- [ ] Visual feedback persists 2-3 seconds
- [ ] Sound effects tested with target age group (no fear responses)
- [ ] 95% of toddlers smile/show positive emotion after success feedback
- [ ] Zero frustration behaviors after error feedback

---

### 5. TIMER PRESSURE (S1 - BLOCKER)

**Requirements:**

- ✅ **NO timers for ages 2-4** (inappropriate pressure)
- ✅ If timer needed for ages 5+: **60+ seconds minimum**
- ✅ Timer pauses when hand tracking lost
- ✅ Timer pauses during feedback animations
- ✅ **Untimed practice mode** available
- ✅ Timer is **visual-only** (no countdown voice creating anxiety)

**Emoji Match Failure:**

- 20 seconds for 10 rounds = 2 seconds per match
- Impossible for toddlers who need 3-5+ seconds per decision
- Creates anxiety and pressure

**Code Template:**

```typescript
// CONDITIONAL timer (only for ages 5+)
const TIMER_CONFIG = {
  durationSeconds: 60, // Minimum 60 seconds (6s per match for 10 rounds)
  pauseOnHandLost: true,
  pauseOnFeedback: true,
  showVisualTimer: true,
  showVoiceCountdown: false, // NO anxiety-inducing countdown
  untimedModeAvailable: true,
};

function GameTimer({ age }: { age: number }) {
  // MANDATORY: No timer for young children
  if (age < 5) {
    return null; // Untimed for ages 2-4
  }

  const [timeRemaining, setTimeRemaining] = useState(60);
  const isPaused = useGamePaused(); // Pauses on hand tracking loss

  // Visual-only timer (no voice countdown)
  return (
    <div className="timer-visual">
      <CircularProgress value={timeRemaining} max={60} />
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] Ages 2-4 have NO timer (verified in QA)
- [ ] Ages 5+ have ≥60 second timer
- [ ] 95% completion rate without timeout (test with 10+ children)
- [ ] No visible anxiety/stress behaviors during gameplay
- [ ] Timer pauses correctly during feedback (verified in video)

---

### 6. VISUAL CONTRAST & ACCESSIBILITY (S2 - MAJOR)

**Requirements:**

- ✅ **Text contrast ≥7:1** (WCAG AAA for children, not just 4.5:1)
- ✅ **Bold fonts, large sizes** (minimum 24pt)
- ✅ **Solid color backgrounds** (no busy patterns or real-world backgrounds)
- ✅ **Clear foreground/background separation**
- ✅ **No overlapping interactive elements**
- ✅ **High-contrast mode available**

**Code Template:**

```typescript
// MANDATORY contrast configuration
const CONTRAST_CONFIG = {
  textContrast: 7.0, // WCAG AAA
  minFontSize: 24, // 24pt minimum
  backgroundColor: '#FFFFFF', // Solid color, not gradient
  textColor: '#000000', // Dark text on light background
  cursorContrast: 7.0,
};

// Test contrast ratio
function meetsContrastRequirement(fg: string, bg: string): boolean {
  const ratio = calculateContrastRatio(fg, bg);
  return ratio >= 7.0; // WCAG AAA
}
```

**Acceptance Criteria:**

- [ ] All text measured ≥7:1 contrast (use contrast checker tool)
- [ ] Tested with color blindness simulators (deuteranopia, protanopia, tritanopia)
- [ ] High-contrast mode tested
- [ ] No child with visual impairment excluded from playing

---

### 7. ANIMATED TUTORIALS (S2 - MAJOR)

**Requirements:**

- ✅ **Animated character demonstrates gesture**
- ✅ **Visual sequence** (hand → target → result)
- ✅ **Repeating loop** (5-10 seconds) until child attempts
- ✅ **"Watch me!" mode** before gameplay starts
- ✅ **Skip option** for repeat players (after 2nd playthrough)

**Code Template:**

```typescript
function AnimatedTutorial({ gesture }: { gesture: string }) {
  const [showDemo, setShowDemo] = useState(true);
  const [demoLoopCount, setDemoLoopCount] = useState(0);

  useEffect(() => {
    if (showDemo) {
      // Show animated hand demonstrating gesture
      playAnimatedGestureDemo(gesture);

      // Loop 3 times, then allow skip
      if (demoLoopCount >= 3) {
        showSkipButton();
      }
    }
  }, [showDemo, demoLoopCount]);

  return (
    <motion.div>
      <AnimatedHand gesture={gesture} loop={true} />
      <VoiceNarration text="Watch me pinch the emoji!" />
      {demoLoopCount >= 3 && <SkipButton onClick={() => setShowDemo(false)} />}
    </motion.div>
  );
}
```

**Acceptance Criteria:**

- [ ] 95% of toddlers understand gesture from demo alone (no parent help)
- [ ] Demo loops for ≥10 seconds (toddler processing time)
- [ ] Skip button appears after 3 loops (tested with repeat players)
- [ ] Animated hand is clear and easy to understand

---

### 8. LEVEL PROGRESSION & GAME LOGIC (S1 - BLOCKER)

**Requirements:**

- ✅ **No progression bugs** (test state machine thoroughly)
- ✅ **Clear level advancement** (visual animation, voice confirmation)
- ✅ **Achievement unlocks** (show progress, build confidence)
- ✅ **No confusing repeats** (Emoji match bug: Level 1 completed twice)
- ✅ **State machine tested** with 20+ playthrough cycles

**Code Template:**

```typescript
// MANDATORY game state machine
enum GameState {
  TUTORIAL = 'tutorial',
  PLAYING = 'playing',
  LEVEL_COMPLETE = 'level_complete',
  GAME_COMPLETE = 'game_complete',
}

function GameStateMachine() {
  const [state, setState] = useState<GameState>(GameState.TUTORIAL);
  const [level, setLevel] = useState(1);

  function advanceLevel() {
    // MANDATORY: Validate level advancement
    if (level < MAX_LEVELS) {
      // Clear level transition
      playLevelCompleteAnimation();
      speak(`Level ${level} complete! Moving to level ${level + 1}!`);

      setTimeout(() => {
        setLevel(level + 1);
        setState(GameState.PLAYING);
      }, 3000);
    } else {
      setState(GameState.GAME_COMPLETE);
    }
  }

  // MANDATORY: Test state machine
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('State:', state, 'Level:', level);
    }
  }, [state, level]);
}
```

**Testing Requirements:**

- [ ] Complete 20+ full playthroughs without bugs
- [ ] Verify level numbers are correct (no repeats, no skips)
- [ ] Test edge cases (restart mid-level, exit early)
- [ ] State machine logged in dev mode (verify transitions)

---

### 9. HAND OCCLUSION & TRACKING FAILURES (S3 - MINOR)

**Requirements:**

- ✅ **"Hand Not Found" indicator** (friendly message, not error)
- ✅ **Timer pauses** when hand tracking lost
- ✅ **Visual prompt** to show hand ("Show me your hand!")
- ✅ **Character animation** (mascot points to camera)
- ✅ **No game over** due to tracking loss (graceful degradation)

**Code Template:**

```typescript
function HandTrackingStatus({ isHandDetected }: { isHandDetected: boolean }) {
  const { speak } = useTTS();

  useEffect(() => {
    if (!isHandDetected) {
      // Friendly prompt, not error
      speak("I can't see your hand! Show it to the camera!");
      pauseGameTimer();
      showMascotPointingAnimation();
    } else {
      resumeGameTimer();
    }
  }, [isHandDetected]);

  if (!isHandDetected) {
    return (
      <div className="hand-prompt">
        <MascotAnimation type="pointing-to-camera" />
        <p>Show me your hand! 👋</p>
      </div>
    );
  }

  return null;
}
```

**Acceptance Criteria:**

- [ ] Hand occlusion detected within 500ms
- [ ] Timer pauses correctly
- [ ] Prompt is friendly, not scary/confusing
- [ ] Game resumes smoothly when hand reappears

---

### 10. CAMERA PRIVACY & PERMISSIONS (S2 - MAJOR)

**Requirements:**

- ✅ **Clear camera permission prompt** (explain why camera is needed)
- ✅ **Visual indicator** when camera active (recording dot)
- ✅ **"No video saved" message** (reassure parents)
- ✅ **Privacy policy link** accessible
- ✅ **COPPA compliance** for ages <13

**Code Template:**

```typescript
function CameraPermissionPrompt() {
  return (
    <div className="camera-permission">
      <h2>We need your camera to play!</h2>
      <p>This game uses your hand movements to play.</p>
      <p><strong>No video is saved.</strong> Everything stays on your device.</p>
      <button onClick={requestCameraPermission}>
        Allow Camera
      </button>
      <a href="/privacy">Privacy Policy</a>
    </div>
  );
}

function CameraActiveIndicator() {
  return (
    <div className="camera-active">
      <span className="recording-dot"></span>
      <small>Camera active (not recording)</small>
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] Permission prompt tested and clear
- [ ] Visual indicator always visible when camera active
- [ ] Privacy policy reviewed by legal (if commercial)
- [ ] COPPA compliance verified

---

## 📊 MANDATORY TESTING CHECKLIST

Before any game goes to production, verify:

### Pre-Launch QA

- [ ] **Cursor Visibility Test** - Record 1-minute gameplay video, verify cursor always visible
- [ ] **Coordinate Accuracy Test** - Move hand to all 4 corners, verify cursor follows within 50px
- [ ] **Target Size Test** - Measure all targets ≥15% screen width
- [ ] **Hitbox Test** - Enable debug visualization, verify 2x size
- [ ] **Voice-Over Test** - Mute screen text, verify game is 100% playable
- [ ] **Text Independence Test** - Test with non-reading child (ages 2-4)
- [ ] **Feedback Timing Test** - Measure feedback delay <100ms (video frame analysis)
- [ ] **Feedback Persistence Test** - Verify 2-3 second duration
- [ ] **Contrast Test** - Measure all text ≥7:1 contrast ratio
- [ ] **Toddler Success Rate** - 95% completion without timeout (test with 10+ children)
- [ ] **No Frustration Test** - Zero frustration behaviors observed
- [ ] **State Machine Test** - 20+ full playthroughs without bugs
- [ ] **Hand Tracking Loss Test** - Cover hand, verify game pauses gracefully
- [ ] **Camera Privacy Test** - Verify clear permission prompt and active indicator

### Accessibility QA

- [ ] **WCAG AAA Compliance** - 7:1 contrast on all text
- [ ] **Color Blindness Test** - Test with simulators (deuteranopia, protanopia, tritanopia)
- [ ] **High-Contrast Mode** - Test and verify usability
- [ ] **Screen Reader Test** (if applicable) - Test with VoiceOver/TalkBack
- [ ] **Keyboard Navigation** (if applicable) - Test without mouse/touch

### Performance QA

- [ ] **60fps Consistency** - No drops below 55fps during gameplay
- [ ] **Latency Test** - Cursor lag <100ms (target: <50ms)
- [ ] **Jitter Test** - Cursor position variance <10px when hand still
- [ ] **Low-End Device Test** - Test on minimum spec devices
- [ ] **Browser Compatibility** - Test on Chrome, Firefox, Safari, Edge
- [ ] **Screen Size Test** - Test on 3+ screen sizes (laptop, desktop, tablet)

### User Testing

- [ ] **5+ Children Ages 2-4** - Test with target audience
- [ ] **Parent Observation** - Record parent feedback
- [ ] **Comprehension Test** - 90% start game without help
- [ ] **Enjoyment Test** - 95% smile/positive emotion during play
- [ ] **Repeat Play Test** - 80% want to play again

---

## 🎯 PRIORITY QUICK WINS (Apply Fixes to Existing Games)

Based on the audit, these games exist but may need fixes:

1. **Emoji Match** - CRITICAL fixes needed (coordinate bug, cursor size, timer)
2. **Freeze Dance** - Review cursor visibility, voice instructions
3. **Yoga Animals** - Review target sizes, feedback timing
4. **Simon Says** - Review voice instructions, success feedback

**Action Items:**

1. Audit existing games against this checklist
2. Create tickets for each S1 (Blocker) issue
3. Fix all S1 issues before implementing new games
4. Apply learnings to new game implementations

---

## 🚀 NEW GAME IMPLEMENTATION CHECKLIST

When implementing a new game, follow this workflow:

### Phase 1: Design (1-2 days)

- [ ] Read this document (GAME_DESIGN_PRINCIPLES_FROM_EMOJI_AUDIT.md)
- [ ] Review game catalogue and select game to implement
- [ ] Define target age group (2-4, 5-6, 7-8)
- [ ] List all interactions (cursor, pinch, gesture)
- [ ] Design voice-over script (simple 2-4 year old vocabulary)
- [ ] Design animated tutorial (storyboard)
- [ ] Define success/failure feedback (visual + audio + voice)
- [ ] Create accessibility plan (contrast, high-contrast mode)
- [ ] Create testing plan (QA checklist above)

### Phase 2: Core Implementation (3-5 days)

- [ ] Set up MediaPipe hand/pose tracking
- [ ] Implement cursor with MANDATORY config (60-80px, bright, high contrast)
- [ ] Implement proper coordinate transformation (handToScreenCoordinates)
- [ ] Test coordinate accuracy (4 corners, multiple screen sizes)
- [ ] Implement targets with MANDATORY config (15-20% screen width, 2x hitbox)
- [ ] Implement magnetic snap-to-target
- [ ] Test target sizes and hitboxes (debug visualization)

### Phase 3: Feedback & Voice (2-3 days)

- [ ] Implement success feedback (<100ms, particles, animation, sound, voice)
- [ ] Implement failure feedback (gentle, encouraging)
- [ ] Test feedback timing (video frame analysis)
- [ ] Record/implement voice-over instructions
- [ ] Test text independence (mute screen, test with non-reading child)
- [ ] Create animated tutorial
- [ ] Test tutorial comprehension (95% understand without help)

### Phase 4: Polish & Accessibility (1-2 days)

- [ ] Measure all text contrast (≥7:1)
- [ ] Test with color blindness simulators
- [ ] Implement high-contrast mode
- [ ] Add hand tracking loss handling
- [ ] Add camera permission prompt
- [ ] Add privacy visual indicator

### Phase 5: Testing & QA (2-3 days)

- [ ] Complete Pre-Launch QA checklist (above)
- [ ] Complete Accessibility QA checklist (above)
- [ ] Complete Performance QA checklist (above)
- [ ] Test with 5+ children ages 2-4 (or target age group)
- [ ] Record parent feedback
- [ ] Fix all S1 (Blocker) issues
- [ ] Fix 75%+ S2 (Major) issues

### Phase 6: Launch & Monitor (1 day)

- [ ] Deploy to staging
- [ ] Final QA pass
- [ ] Deploy to production
- [ ] Monitor analytics (completion rate, time-to-first-interaction)
- [ ] Collect user feedback

**Total Timeline: 2-3 weeks per game** (following quality standards)

---

## 📚 RELATED DOCUMENTATION

| Document                                                        | Purpose                                          |
| --------------------------------------------------------------- | ------------------------------------------------ |
| `EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md` | Full audit findings (22 issues, 185+ activities) |
| `COMPLETE_GAME_ACTIVITIES_CATALOG.md`                           | 185+ game ideas and priorities                   |
| `GAME_CATALOG.md`                                               | Master activity library                          |
| `GAME_MECHANICS.md`                                             | Core gameplay systems                            |
| `AGE_BANDS.md`                                                  | Age-specific guidance                            |

---

## 🎓 EDUCATION: WHY THESE REQUIREMENTS MATTER

### Child Development Research (Ages 2-4)

**Motor Skills:**

- Fine motor skills still developing
- Can reliably target 9-12mm physical objects
- Need generous hitboxes (2-3x visible size)
- Pinch gesture challenging but learnable with practice

**Cognitive Processing:**

- Need 3-5 seconds to process visual information
- Cannot read (pre-literate)
- Need immediate feedback (<100ms) for cause-and-effect learning
- Struggle with fast state transitions (<0.5s)

**Visual Perception:**

- Cannot see small objects (10-15px cursors invisible)
- Need high contrast (7:1 minimum)
- Easily distracted by background clutter
- Need clear foreground/background separation

**Emotional Development:**

- Harsh feedback creates fear/frustration
- Positive reinforcement builds confidence
- Timer pressure inappropriate (creates anxiety)
- Success celebration encourages continued play

### Accessibility Standards

**WCAG AAA (Children's Content):**

- 7:1 contrast ratio (higher than adult 4.5:1)
- Large text sizes (24pt minimum)
- Clear visual hierarchy
- No reliance on color alone

**COPPA Compliance (Ages <13):**

- Clear camera permission explanations
- No video storage (only processed data)
- Privacy policy accessible to parents
- Visual indicators when camera active

---

## ✅ SUCCESS CRITERIA

A game is ready to launch when:

- ✅ All S1 (Blocker) issues resolved (9 categories)
- ✅ 75%+ S2 (Major) issues resolved (8 categories)
- ✅ Cursor visible in 100% of gameplay frames
- ✅ 95%+ toddler completion rate
- ✅ Zero text dependency for core gameplay
- ✅ Voice-over for all instructions
- ✅ Success/failure feedback <100ms
- ✅ WCAG AAA compliance (7:1 contrast)
- ✅ Tested with 5+ children in target age group
- ✅ Parent feedback positive
- ✅ No frustration behaviors observed

**Evidence Required:**

- Video recording of playtest
- User testing report (10+ children)
- Accessibility audit pass
- Performance metrics log
- Parent feedback summary

---

## 🚨 REMEMBER

**Every game must prevent the emoji match failures:**

1. ❌ No invisible cursors (10-15px)
2. ❌ No coordinate mapping bugs (2787px offset)
3. ❌ No text-only instructions (pre-readers can't use)
4. ❌ No tiny targets (40-60px)
5. ❌ No timer pressure (20s for 10 rounds)
6. ❌ No unclear feedback (silent success/failure)
7. ❌ No level progression bugs (repeating levels)
8. ❌ No poor contrast (2.8:1)
9. ❌ No harsh error sounds (scary to toddlers)

**Apply these principles to EVERY game.** This is mandatory, not optional.

---

**Last Updated:** 2026-02-20  
**Version:** 1.0  
**Status:** **REQUIRED READING** for all game developers

---

_This document synthesizes 22 critical issues from an 8-agent comprehensive video audit. Following these principles will prevent repeating $50K+ worth of development mistakes._
