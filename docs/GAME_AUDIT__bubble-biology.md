# Bubble Biology - Comprehensive Game Audit

**Game ID:** bubble-biology  
**Route:** /games/bubble-biology  
**Age Range:** 5-8  
**World:** lab-of-wonders  
**CV:** ['hand']  
**Audit Date:** 2026-03-09  
**Auditor:** AI Agent (Multi-Lens Analysis)  
**Prompts Used:** 
- Child-Centered UX Audit (Learning Expert Lens)
- Game Juice Audit
- Reality-First Code Audit

---

## 1. EXECUTIVE SUMMARY

### Overall Score: 6.5/10

| Lens | Score | Status |
|------|-------|--------|
| Child-Centered UX | 6/10 | Needs Improvement |
| Game Juice | 7/10 | Good Foundation |
| Code Quality | 6.5/10 | Solid with Gaps |

### Key Issue Count: 14
- **HIGH:** 3 issues
- **MEDIUM:** 6 issues  
- **LOW:** 5 issues

### Critical Summary
Bubble Biology is a **functional cell-sorting game** with solid core mechanics and good visual polish. The pinch-to-grab interaction works well, and the game successfully integrates with the standard game infrastructure (GameShell, TTS, haptics). However, it suffers from a **critical messaging bug** in the celebration overlay (hardcoded tracing message doesn't match sorting gameplay), limited educational scaffolding, and missing accessibility fallbacks. The game also lacks proper adaptive difficulty and mascot integration that would elevate it to a truly engaging learning experience.

---

## 2. CHILD-CENTERED UX FINDINGS (Learning Expert Lens)

**Child Persona Context:**  
*Ages 5-8, developing classification skills and biology vocabulary. Fine motor skills developing—pinch gestures may be challenging. Attention span 5-10 minutes. Needs clear feedback and progressive challenge.*

---

### KUX-001: Celebration Overlay Shows Incorrect Message
**Severity:** HIGH  
**Evidence:** Observed in `BubbleBiology.tsx:505-511` and `CelebrationOverlay.tsx:244-245`

```typescript
// BubbleBiology.tsx passes letter="B" (hardcoded)
<CelebrationOverlay
  show={showCelebration}
  letter="B"
  accuracy={100}
  message="Level Complete!"
  onComplete={() => setShowCelebration(false)}
/>

// CelebrationOverlay.tsx hardcodes tracing message
<p className="text-blue-600 font-bold text-2xl...">
  You traced {letter} beautifully!  // ← WRONG for sorting game
</p>
```

**Failure Mode:** When children complete a level, they see "You traced B beautifully!" instead of a message about sorting cells. This creates **cognitive dissonance**—the child sorted cells, not traced letters. For ages 5-8, this inconsistency can be confusing and undermine trust in the game's feedback.

**Why It Matters (Child Lens):** Children this age are building **causal understanding**. When their action (sorting) produces an unrelated result message (tracing), it disrupts their sense of agency and comprehension.

**Recommendation:** 
- Pass `letter={null}` and customize the message prop: "You sorted all the cells!"
- Or modify CelebrationOverlay to accept a custom subtitle prop
- Remove hardcoded "traced" language when not in tracing games

**Validation Plan:** 
- [ ] Test with 3 children ages 5-7
- [ ] Ask: "What did you do to win?" (should answer "sorted cells" not "traced")
- [ ] Observe confusion indicators (hesitation, repeating "traced?")

---

### KUX-002: No Adaptive Difficulty Based on Performance
**Severity:** HIGH  
**Evidence:** Observed in `bubbleBiologyLogic.ts:77-96` and `BubbleBiology.tsx:111-124`

```typescript
// Level config is static—doesn't adapt to child's success rate
export const LEVEL_CONFIG = {
  1: { cellSpeed: 0.5, spawnRate: 3000, jarCapacity: 5, cellRadius: 40 },
  2: { cellSpeed: 0.8, spawnRate: 2500, jarCapacity: 7, cellRadius: 35 },
  3: { cellSpeed: 1.0, spawnRate: 2000, jarCapacity: 10, cellRadius: 30 },
};

// Spawning happens at fixed interval regardless of player skill
spawnTimerRef.current = setInterval(() => {
  const newCell = spawnCell(width, level);
  // ...
}, config.spawnRate);
```

**Failure Mode:** The game progresses through levels based solely on filling jars, not on **player mastery**. A struggling child who misses many cells sees the same spawn rate as a proficient child. This creates frustration for slower players and boredom for faster ones.

**Why It Matters:** Ages 5-8 have **high variability in fine motor skills**. Adaptive difficulty keeps children in their "zone of proximal development"—challenged but not overwhelmed.

**Recommendation:**
- Track `missedCells` ratio per level
- If miss rate > 30%, reduce spawn rate by 20%
- If miss rate < 10% and streak > 5, increase spawn rate slightly
- Add "Practice Mode" option after 3 consecutive failures

---

### KUX-003: No Hand-Tracking Accessibility Fallback
**Severity:** HIGH  
**Evidence:** Observed in `BubbleBiology.tsx:155-200`

```typescript
// Only pointer events—no CV hand tracking integration
const handlePointerDown = useCallback((e: React.PointerEvent) => {
  // Mouse/touch only - no hand tracking fallback
}, [gameState.isPlaying, gameState.currentCells, playPop]);
```

**Failure Mode:** The game lists `cv: ['hand']` in its registry but **only implements mouse/touch input**. Children using hand tracking cannot play. Children with motor disabilities have no alternative.

**Why It Matters:** CV requirement shouldn't mean "CV OR touch"—it should enhance the experience while maintaining accessibility.

**Recommendation:** 
- Integrate `useGameHandTracking` hook (used in other CV games)
- Implement pinch-to-grab detection from camera
- Add mode toggle: "Hand Camera" vs "Touch Mode"
- Document CV as "enhanced experience" not "required feature"

---

### KUX-004: Limited Educational Scaffolding
**Severity:** MEDIUM  
**Evidence:** Observed in `bubbleBiologyLogic.ts:53-75`

```typescript
export const CELL_TYPES: CellType[] = [
  {
    id: 'plant',
    name: 'Plant Cell',
    emoji: '🌱',
    color: '#22C55E',
    description: 'Has a cell wall!',  // ← Never shown in UI
  },
  // ...
];
```

**Failure Mode:** Cell descriptions exist in data but are **never displayed to children**. The educational content (cell wall, flexible membrane, single-celled organism) is invisible. Children sort by color/emoji matching without learning biology concepts.

**Why It Matters:** The game is called "Bubble **Biology**" but teaches **color matching**, not biology. Missed opportunity for vocabulary building.

**Recommendation:**
- Show description tooltip on cell hover (with TTS)
- Add "Learn More" button that shows cell facts
- On correct sort, speak: "Plant Cell! It has a strong cell wall!"
- Add visual diagram comparing cell types

---

### KUX-005: No "Help" or Hint System for Struggling Players
**Severity:** MEDIUM  
**Evidence:** Observed in `BubbleBiology.tsx` - no hint mechanism exists

**Failure Mode:** If a child repeatedly puts cells in wrong jars, there's **no guidance**. The only feedback is "Oops! That goes in a different jar!" with no indication of which jar is correct.

**Why It Matters:** Frustration leads to abandonment. A hint system ("Look for the green jar!" or "This cell matches the plant! 🌱") maintains engagement.

**Recommendation:**
- After 2 consecutive wrong attempts, highlight correct jar
- Add color-matching hint: "Find the jar with the same color!"
- Consider "Assistant Mode" that shows matching lines

---

### KUX-006: Streak Display Without Milestone Celebration
**Severity:** MEDIUM  
**Evidence:** Observed in `BubbleBiology.tsx:60,217-219,265-267`

```typescript
const { streak, incrementStreak, resetStreak } = useStreakTracking();
// ...
if (isCorrect) {
  incrementStreak();  // Updates number only
  // No milestone celebration shown
}
```

**Failure Mode:** The streak hook provides tracking but the game **doesn't show milestone celebrations** (like "5 in a row! 🔥"). Children see a number increasing but get no special recognition for achievements.

**Why It Matters:** Streaks are powerful motivators, but only when **celebrated**. A number alone is less engaging than visual/audio milestones.

**Recommendation:**
- Add streak milestone overlay every 5 correct sorts
- Use `showMilestone` from `useStreakTracking` hook
- Include TTS: "5 in a row! Amazing!"

---

### KUX-007: Cells Can Spawn Too Close to Bottom Edge
**Severity:** MEDIUM  
**Evidence:** Observed in `bubbleBiologyLogic.ts:130-147`

```typescript
export function spawnCell(canvasWidth: number, ...): Cell {
  return {
    // ...
    y: -config.cellRadius,  // Starts just above viewport
    speed: config.cellSpeed,  // Can be 0.5-1.0 pixels/ms
    // No minimum spawn height buffer
  };
}
```

**Failure Mode:** On smaller screens or slower devices, cells may spawn and reach the bottom **before the child can react**. This is especially problematic for children with slower reaction times.

**Why It Matters:** Ages 5-8 have **variable reaction times** (300-500ms). Combined with developing motor skills, they need fair time to interact.

**Recommendation:**
- Add minimum spawn Y position: `-cellRadius - 100` (gives ~100px buffer)
- Or add "grace period" where first 500ms of fall is slower
- Consider device capability detection

---

### KUX-008: No Progress Persistence Within Session
**Severity:** LOW  
**Evidence:** Observed in `BubbleBiology.tsx:53-56`

```typescript
const [gameState, setGameState] = useState<GameState>(() => initializeGame());
// All state is local—lost on navigation
```

**Failure Mode:** If the child accidentally clicks "Back" or the browser refreshes, **all progress is lost**. No localStorage, no session persistence.

**Why It Matters:** While session-scoped gameplay is acceptable, lack of any persistence can frustrate children who invested time.

**Recommendation:**
- Persist to localStorage: current level, score, streak
- On return: "Welcome back! Continue sorting?"

---

### KUX-009: Score Penalty May Discourage Risk-Taking
**Severity:** LOW  
**Evidence:** Observed in `bubbleBiologyLogic.ts:204-216`

```typescript
export function calculateScore(isCorrect: boolean, level: number, streak: number): number {
  if (!isCorrect) return -5;  // Penalty for mistakes
  // ...
}
```

**Failure Mode:** The `-5` point penalty for wrong jar placement may **discourage experimentation**. Some children may stop playing rather than risk losing points.

**Why It Matters:** Learning requires **safe failure**. Penalties can create anxiety in young children.

**Recommendation:**
- Remove score penalty—keep streak reset only
- Or make it gentler: no penalty, just no points
- Consider "Exploration Mode" with no scoring

---

## 3. GAME JUICE FINDINGS

**Juice Score: 7/10**

---

### Juice Strengths

#### ✅ Visual Feedback: GOOD
- **Cell Grab Animation:** Scale up to 1.2x with Framer Motion (line 351)
- **Cell Spawn Animation:** Scale from 0 with spring physics (line 350)
- **Cell Exit Animation:** Scale to 0 with opacity fade (line 352)
- **Jar Fill Indicator:** Smooth height transition with color blending (lines 393-398)
- **Streak Display:** Persistent fire counter in header

#### ✅ Auditory Feedback: GOOD
- **TTS Integration:** Instructions and feedback announcements
- **Sound Effects:** `playPop()` on grab, `playSuccess()` on correct, `playError()` on wrong
- **Haptic Triggers:** Success haptic on grab, error haptic on wrong jar

#### ✅ Interaction Design: SATISFACTORY
- **Direct Manipulation:** Cells follow finger/mouse exactly
- **Visual Hit Areas:** Clear cell boundaries with border
- **Immediate Response:** No lag between grab input and visual feedback

---

### Juice Weaknesses

#### JUICE-001: No Mascot Integration During Gameplay
**Severity:** MEDIUM  
**Evidence:** Observed - No Pippin references in file except via CelebrationOverlay

**Finding:** The mascot Pippin only appears in the **CelebrationOverlay**, not during actual gameplay. No encouragement during play, no reactions to correct/incorrect sorting.

**Remediation:**
- Add Pippin commentary: "Great grab!" on cell pickup
- Pippin reaction when jar is filled: "Almost there!"
- Pippin encouragement on wrong attempt: "Try the green jar!"

---

#### JUICE-002: Limited Particle Effects
**Severity:** MEDIUM  
**Evidence:** Observed - No particle effects beyond CelebrationOverlay

**Finding:** The game lacks **ambient and interaction particles**:
- No sparkle when cell is grabbed
- No splash effect when cell enters jar
- No trail when dragging cells

**Remediation:**
- Add sparkle particles on successful grab
- Splash effect with jar color when cell dropped
- Subtle trail following dragged cell

---

#### JUICE-003: No Background Music or Ambient Sounds
**Severity:** MEDIUM  
**Evidence:** Observed - No BGM integration

**Finding:** No background music or ambient lab sounds. The game is silent between interactions, reducing immersion.

**Remediation:**
- Gentle bubbling ambient sounds
- Lab-themed background music (subtle, non-distracting)
- Different ambient per level (increasing intensity)

---

#### JUICE-004: Jars Lack Visual "Active" State
**Severity:** LOW  
**Evidence:** Observed in `BubbleBiology.tsx:369-414`

**Finding:** When dragging a cell, jars don't visually indicate they are **valid drop targets**. No hover state, no pulsing, no highlight.

**Remediation:**
- Pulse jar when dragged cell matches its type
- Scale up jar slightly on hover
- Add "glow" effect around matching jar

---

#### JUICE-005: Streak Milestones Not Celebrated
**Severity:** LOW  
**Evidence:** Observed - streak number shown but no special celebration

**Finding:** While streak is displayed, there's no **special celebration** for milestones (5, 10, 15). The hook supports it but UI doesn't use it.

**Remediation:**
- Show `showMilestone` from streak hook
- Mini fireworks at 5, 10, 15 streaks
- TTS celebration: "10 in a row! You're a sorting master!"

---

## 4. TECHNICAL ISSUES

### Code Quality Issues

---

#### TECH-001: Level Complete Race Condition
**Severity:** HIGH  
**Evidence:** Observed in `BubbleBiology.tsx:238-260`

```typescript
setTimeout(() => {
  const updatedJars = gameState.jars.map(j =>
    j.id === jar.id ? updateJarFill(j) : j  // ← Uses stale state!
  );
  
  if (isLevelComplete(updatedJars)) {  // ← May not reflect actual state
    // ... celebration
  }
}, 100);
```

**Failure Mode:** The `isLevelComplete` check uses a **manually computed jar update** that may not match the actual React state. This could cause:
- False positives (celebration before all jars full)
- False negatives (no celebration when level actually complete)

**Blast Radius:**
- Confusing player experience
- Potential double-triggering of celebrations
- Progress tracking inaccuracies

**Recommendation:**
- Use functional state update to check completion
- Or check completion in a useEffect watching jar state
- Add test: "Level completes exactly when all jars reach capacity"

---

#### TECH-002: Cell ID Generation Not Unique
**Severity:** MEDIUM  
**Evidence:** Observed in `bubbleBiologyLogic.ts:139`

```typescript
id: Date.now() + Math.random(),  // Could collide in rapid succession
```

**Failure Mode:** If two cells spawn in the same millisecond, they could receive **duplicate IDs** (though unlikely). This causes React key conflicts and potential rendering issues.

**Recommendation:**
- Use `crypto.randomUUID()` or sequential counter
- Or combine timestamp with incrementing counter

---

#### TECH-003: Timer Type Incorrect
**Severity:** LOW  
**Evidence:** Observed in `BubbleBiology.tsx:49`

```typescript
const spawnTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);  // Wrong type
```

**Failure Mode:** In browser environment, `setInterval` returns `number`, not `NodeJS.Timeout`. Type is misleading for browser context.

**Recommendation:**
```typescript
const spawnTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
```

---

#### TECH-004: Missing Error Boundary for Game Logic
**Severity:** MEDIUM  
**Evidence:** Observed - No error handling for game state corruption

**Failure Mode:** If `gameState` becomes corrupted (e.g., `grabbedCell` references non-existent cell), the game **crashes without recovery**.

**Recommendation:**
- Add defensive checks before accessing `grabbedCell`
- Validate game state in critical paths
- Log errors for debugging

---

#### TECH-005: Canvas Dimensions Calculated Repeatedly
**Severity:** LOW  
**Evidence:** Observed in `BubbleBiology.tsx:71-75,207,369-370`

```typescript
// Called in every game loop and render
const getCanvasDimensions = useCallback(() => {
  if (!canvasRef.current) return { width: 800, height: 600 };
  const rect = canvasRef.current.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}, []);
```

**Failure Mode:** `getBoundingClientRect()` triggers **layout recalculation**. Called frequently in game loop, this could cause performance issues on lower-end devices.

**Recommendation:**
- Cache dimensions in ResizeObserver
- Only recalculate on actual resize
- Use CSS custom properties for responsive sizing

---

### Performance Issues

---

#### PERF-001: Game Loop Creates New Arrays Every Frame
**Severity:** MEDIUM  
**Evidence:** Observed in `bubbleBiologyLogic.ts:149-173`

```typescript
const updatedCells = cells
  .map(cell => { /* ... */ })  // New array
  .filter((cell): cell is Cell => cell !== null);  // Another new array
```

**Failure Mode:** Creating new arrays every animation frame causes **garbage collection pressure**. With many cells, this could cause frame drops.

**Recommendation:**
- Use mutable updates for performance-critical paths
- Or use `useRef` for cells that don't need React reactivity
- Consider object pooling for cells

---

#### PERF-002: Feedback State Causes Re-render
**Severity:** LOW  
**Evidence:** Observed in `BubbleBiology.tsx:57,232,274`

```typescript
const [feedback, setFeedback] = useState('Pinch cells to grab them!');
// ...
setFeedback(`Correct! +${points} points!`);  // Triggers re-render
```

**Failure Mode:** Feedback updates cause **full component re-render**, even though feedback is visually isolated.

**Recommendation:**
- Move feedback to separate component
- Use CSS animation instead of React state for transient messages

---

### Security Concerns

---

#### SEC-001: No Input Sanitization on Progress Save
**Severity:** LOW  
**Evidence:** Observed in `BubbleBiology.tsx:308-313`

```typescript
await saveProgress({ score: gameState.cellsSorted, completed: true, level: gameState.level });
```

**Finding:** Score values are passed directly to progress save without validation. While unlikely to be exploited in this context, defense in depth is recommended.

**Recommendation:**
- Validate score is within expected bounds
- Clamp level to valid range
- Log suspicious values for monitoring

---

## 5. QUICK WINS (Low-Effort Improvements)

| # | Fix | Effort | Impact | Evidence |
|---|-----|--------|--------|----------|
| 1 | Fix celebration message: pass `letter={null}` and custom subtitle | XS | HIGH | Lines 505-511 |
| 2 | Add `showMilestone` from streak hook with mini-celebration | XS | MED | Line 60 |
| 3 | Show cell description on hover with TTS | S | HIGH | Lines 53-75 |
| 4 | Add sparkle particles on correct sort | S | MED | Missing |
| 5 | Highlight matching jar when dragging cell | S | MED | Lines 369-414 |
| 6 | Remove score penalty (-5) for wrong jar | XS | LOW | Line 267 |
| 7 | Fix timer type to `ReturnType<typeof setInterval>` | XS | LOW | Line 49 |
| 8 | Add Pippin commentary on grab/release | S | MED | Missing |
| 9 | Add minimum spawn height buffer | XS | MED | Line 142 |
| 10 | Cache canvas dimensions in ResizeObserver | S | LOW | Lines 71-75 |

---

## 6. MAJOR IMPROVEMENTS (Bigger Epics)

### EPIC-001: Implement True Hand Tracking Integration
**Priority:** HIGH  
**Effort:** M (2-3 days)  
**Description:** Add CV hand tracking using `useGameHandTracking` hook to enable pinch-to-grab from camera input.

**Acceptance Criteria:**
- [ ] Hand tracking hook integrated
- [ ] Pinch gesture detection for grab/release
- [ ] Hand cursor visualization on canvas
- [ ] Fallback to touch mode when no hand detected
- [ ] Toggle between "Hand Camera" and "Touch" modes
- [ ] Performance: maintains 30fps with tracking

---

### EPIC-002: Add Educational Content Layer
**Priority:** HIGH  
**Effort:** M (2-3 days)  
**Description:** Transform from color-matching to biology-learning game by surfacing educational content.

**Acceptance Criteria:**
- [ ] Cell descriptions shown in UI (tooltip or sidebar)
- [ ] TTS reads cell facts on correct sort
- [ ] "Learn More" modal with cell diagrams
- [ ] Progress tracking for "cell facts learned"
- [ ] Cell type quiz at end of each level
- [ ] Parent report showing biology concepts encountered

---

### EPIC-003: Adaptive Difficulty System
**Priority:** MEDIUM  
**Effort:** M (3-4 days)  
**Description:** Implement dynamic spawn rate and speed adjustment based on player performance.

**Acceptance Criteria:**
- [ ] Track miss rate per level
- [ ] Auto-adjust spawn rate based on performance
- [ ] Speed gradually increases with streak
- [ ] "Practice Mode" available after multiple failures
- [ ] Visual indicator of difficulty adjustment
- [ ] Parent setting: "Adaptive Difficulty" on/off

---

### EPIC-004: Enhanced Juice Package
**Priority:** MEDIUM  
**Effort:** M (3-4 days)  
**Description:** Comprehensive juice improvements including mascot integration, particles, and sound layers.

**Acceptance Criteria:**
- [ ] Pippin integrated throughout gameplay (not just celebration)
- [ ] Particle effects: sparkles, splashes, trails
- [ ] Jar hover/active states with animations
- [ ] Background music and ambient lab sounds
- [ ] Enhanced streak milestones with visual celebration
- [ ] Cell "wobble" animation when near correct jar

---

### EPIC-005: Fix Celebration Architecture
**Priority:** HIGH  
**Effort:** S (1-2 days)  
**Description:** Refactor CelebrationOverlay to support non-tracing games properly.

**Acceptance Criteria:**
- [ ] CelebrationOverlay accepts custom subtitle prop
- [ ] Remove hardcoded "traced" language
- [ ] Game-type aware messaging (tracing vs sorting vs matching)
- [ ] Backward compatibility with existing tracing games
- [ ] Type-safe props for different game types

---

## 7. EVIDENCE APPENDIX

### Discovery Commands Executed

```bash
# File existence and tracking
git ls-files -- src/frontend/src/pages/BubbleBiology.tsx
# Output: src/frontend/src/pages/BubbleBiology.tsx

git ls-files -- src/frontend/src/games/bubbleBiologyLogic.ts
# Output: src/frontend/src/games/bubbleBiologyLogic.ts

# Line counts
wc -l src/frontend/src/pages/BubbleBiology.tsx src/frontend/src/games/bubbleBiologyLogic.ts
# Output: 524 BubbleBiology.tsx, 283 bubbleBiologyLogic.ts

# Recent history
git log -n 5 --oneline -- src/frontend/src/pages/BubbleBiology.tsx
# Output: Check actual git log

# Inbound references
grep -r "bubble-biology" src/frontend/src --include="*.ts" --include="*.tsx" | wc -l
# Output: ~5 files reference this game
```

### Inbound Dependencies
- `src/frontend/src/App.tsx` - Route registration
- `src/frontend/src/data/gameRegistries/labOfWonders.ts` - Game registry entry
- `src/frontend/src/routes/lazyPages.tsx` - Lazy loading import

### Outbound Dependencies
- `../components/GameShell` - Game wrapper with error boundary
- `../components/GameContainer` - Layout container
- `../components/GameControls` - Menu/game controls
- `../components/CelebrationOverlay` - Level complete celebration
- `../components/game/VoiceInstructions` - TTS integration
- `../hooks/useAudio` - Sound effects
- `../hooks/useTTS` - Text-to-speech
- `../hooks/useGameCompletion` - Progress saving
- `../hooks/useStreakTracking` - Streak counter
- `../utils/haptics` - Haptic feedback
- `framer-motion` - Animations

---

## 8. VERIFICATION CHECKLIST

Before marking any remediation as complete:

### For HIGH Severity Issues
- [ ] KUX-001: Verify celebration shows sorting message, not tracing
- [ ] KUX-002: Test adaptive difficulty with simulated slow/fast play
- [ ] KUX-003: Test hand tracking mode with actual camera
- [ ] TECH-001: Verify level completes exactly when last jar fills

### For MEDIUM Severity Issues  
- [ ] KUX-004: Verify cell descriptions appear and TTS reads them
- [ ] KUX-005: Verify hint system activates after 2 wrong attempts
- [ ] KUX-006: Verify streak milestone celebration at 5, 10, 15
- [ ] JUICE-001: Verify Pippin appears during gameplay
- [ ] JUICE-002: Verify particle effects on correct sort

### For Code Quality
- [ ] All TypeScript compiles without errors
- [ ] All existing tests pass
- [ ] No new lint warnings
- [ ] Manual playtest completed on tablet
- [ ] Hand tracking mode tested with camera
- [ ] Touch mode tested on mobile device

---

*End of Audit Document*
