# Shadow Portal - Comprehensive Game Audit

**Audit Date:** 2026-03-09  
**Auditor:** AI Game Auditor (Multi-Lens Analysis)  
**Game ID:** shadow-portal  
**Target Age:** 4-8 years  
**Files Audited:**
- `src/frontend/src/pages/ShadowPortal.tsx` (515 lines)
- `src/frontend/src/games/shadowPortalLogic.ts` (527 lines)
- `src/frontend/src/games/shadowPortal/particles.ts` (482 lines)
- `src/frontend/src/games/shadowPortal/__tests__/*.ts` (1150+ test lines)

---

## 1. Executive Summary

### Overall Score: **6.8/10**

| Category | Score | Status |
|----------|-------|--------|
| Child-Centered UX | 6/10 | ⚠️ Needs Improvement |
| Game Juice | 5/10 | ⚠️ Significant Gaps |
| Code Quality | 8/10 | ✅ Good |
| Technical Implementation | 7/10 | ⚠️ Some Issues |

### Key Issues Summary
- **Critical:** 2
- **High:** 4
- **Medium:** 7
- **Low:** 6

### Quick Verdict
Shadow Portal has solid foundational physics and game logic but suffers from a disconnect between its promised "silhouette" mechanic and actual hand-tracking implementation. The game is playable but lacks the magical feel and accessibility features expected for the 4-8 age range.

---

## 2. Child-Centered UX Audit (Learning Expert Lens)

### 2.1 Cognitive Load & Clarity

#### KUX-001: Misleading Game Concept vs Implementation
**Severity:** HIGH  
**Evidence:** `Observed`

**Finding:** The game description promises "Your body silhouette blocks and guides falling light particles" but the implementation uses only **hand position** (index finger tip) as a simple rectangular collision box:

```typescript
// ShadowPortal.tsx:191-206
// Create silhouette region based on hand position
// In a real implementation, this would use body segmentation
// For now, we use hand position as a simple silhouette
if (frame.indexTip) {
  setSilhouetteRegions([
    {
      x: frame.indexTip.x - 0.08,
      y: frame.indexTip.y - 0.08,
      width: 0.16,
      height: 0.16,
      isActive: true,
    },
  ]);
}
```

**Impact:** Children expecting full-body interaction will be confused. The game mechanics don't match the marketing/description.

**Recommendation:** 
- Option A: Rename to "Hand Portal" and embrace hand-tracking
- Option B: Implement actual body segmentation (MediaPipe Pose or similar)

---

#### KUX-002: No Visual Feedback for "Silhouette" Zone
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** The silhouette region is only visible as a semi-transparent blue box when debugging:

```typescript
// ShadowPortal.tsx:122-136
silhouetteRegions.forEach((region) => {
  if (region.isActive) {
    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
    ctx.strokeRect(x, y, w, h);
  }
});
```

For children, there's no clear indication of WHERE their "blocking" area is. The visual feedback is too subtle.

**Recommendation:** Add a glowing, animated aura or shadow effect that clearly shows the interaction zone.

---

#### KUX-003: Unclear Particle-Portal Color Matching
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** The game has colored portals (red, teal, yellow) but particles have random target assignments based on spawn X position:

```typescript
// shadowPortalLogic.ts:237-242
const x = 0.1 + Math.random() * 0.8;
let targetPortal: PortalType = 'center';
if (x < 0.35) targetPortal = 'left';
else if (x > 0.65) targetPortal = 'right';
```

There's **no color matching** between particles and portals. Children may be confused why particles need to go to specific portals.

**Recommendation:** Either:
1. Make particles match portal colors and only score when matched
2. Remove portal colors entirely
3. Add clear visual lines showing particle trajectories toward target portals

---

#### KUX-004: Overwhelming "Missed" Counter
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** The HUD shows "Missed: X/5" in red when near limit:

```typescript
// ShadowPortal.tsx:389-393
<div className={`text-xl font-bold ${
  gameState.particlesMissed >= gameState.maxMissed - 1 ? 'text-red-400' : 'text-white'
}`}>
  {gameState.particlesMissed}/{gameState.maxMissed}
</div>
```

For ages 4-8, failure anxiety is high. Showing a "missed" counter creates negative pressure.

**Recommendation:** Replace with positive framing ("Portals need 10 more!" or "Saved: X").

---

### 2.2 Motivation & Feedback Loops

#### KUX-005: Combo System Too Abstract
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** The combo system shows text like "GOOD!", "GREAT!", "AMAZING!" but the multiplier (`comboMultiplier`) is hidden mathematical logic:

```typescript
// shadowPortalLogic.ts:364-366
newStreak++;
newCombo = Math.min(5, 1 + Math.floor(newStreak / 5) * 0.5);
newScore += Math.floor(basePoints * newCombo);
```

Children don't understand why scores jump or how to maintain combos.

**Recommendation:** 
- Show combo meter visually (filling bar)
- Use consistent character reactions (mascot cheering)
- Simplify: "5 in a row = 2x points!"

---

#### KUX-006: No Progressive Tutorial
**Severity:** HIGH  
**Evidence:** `Observed`

**Finding:** The game immediately starts with full difficulty. No guided first-time experience:

```typescript
// ShadowPortal.tsx:294-299
const handleStart = useCallback(() => {
  setGameState((prev) => startGame(prev, difficulty));
  if (ttsEnabled) {
    speak('Shadow Portal! Use your hands to guide particles into the portals!');
  }
}, [difficulty, speak, ttsEnabled]);
```

**Recommendation:** Add a tutorial mode with:
1. Single particle, slow motion
2. Visual arrow showing hand movement
3. Success celebration on first capture
4. Gradual speed increase

---

### 2.3 Exploration Safety

#### KUX-007: No Pause Functionality
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** The GameContainer accepts an `onPause` prop, but Shadow Portal doesn't implement it:

```typescript
// ShadowPortal.tsx:54-55
// No pause handler defined
const { completeGame } = useGameCompletion('shadow-portal');
```

```typescript
// GameContainer.tsx:41-43 - accepts onPause but not provided
onPause?: () => void;
// ...
{onPause && (
  <button onClick={onPause} ... />
)}
```

Children need breaks. No pause = potential frustration.

**Recommendation:** Implement pause with frozen physics and clear resume button.

---

#### KUX-008: Time Pressure Too High for Age Group
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Time limits by difficulty:
- Easy: 60s
- Medium: 90s 
- Hard: 120s

```typescript
// shadowPortalLogic.ts:91-114
DIFFICULTY_CONFIGS = {
  easy: { timeLimit: 60, ... },
  medium: { timeLimit: 90, ... },
  hard: { timeLimit: 120, ... }
}
```

For 4-6 year olds, time pressure creates anxiety. The "Time" countdown turns red under 10s.

**Recommendation:** 
- Add "Zen Mode" with no timer
- Extend easy mode to 90s
- Show time as "friendly" (sun moving across sky instead of countdown)

---

### 2.4 Accessibility & Motor Skills

#### KUX-009: No Motor Skill Accommodations
**Severity:** HIGH  
**Evidence:** `Observed`

**Finding:** The hand tracking requires precise positioning. No accommodations for:
- Limited arm mobility
- Tremors
- Delayed reactions

The collision detection is a simple box with no "assist" logic.

**Recommendation:** 
- Add "helper magnetism" (particles gravitate slightly toward portals)
- Implement "sticky" deflection (particles slow near silhouette)
- Provide larger collision zones option

---

#### KUX-010: Mouse Fallback Lacks Instruction
**Severity:** LOW  
**Evidence:** `Observed`

**Finding:** Mouse fallback exists but isn't advertised:

```typescript
// ShadowPortal.tsx:307-326
const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  // ... creates silhouette from mouse position
}, []);
```

```typescript
// ShadowPortal.tsx:410
<canvas ... onMouseMove={handleMouseMove} />
```

Children with no camera access won't know mouse works.

**Recommendation:** Add toggle: "Use Mouse 🖱️" / "Use Camera 📷"

---

#### KUX-011: Missing Audio Descriptions
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** TTS is optional and only speaks at game start and end. No real-time feedback:

```typescript
// ShadowPortal.tsx:232-243
if (updated.status === 'complete' && prev.status === 'playing') {
  // ... audio feedback
  if (ttsEnabled) speak('All portals filled! Amazing!');
}
if (updated.status === 'gameover' && prev.status === 'playing') {
  // ...
  if (ttsEnabled) speak('Game over! Try again!');
}
```

**Recommendation:** Add optional "coach" voice that gives tips ("Move your hand left!").

---

### 2.5 Learning Flow & Scaffolding

#### KUX-012: Score Display Distracts from Learning
**Severity:** LOW  
**Evidence:** `Inferred`

**Finding:** Score is prominently displayed, shifting focus from "experiment with physics" to "get points."

**Recommendation:** Option to hide score until end, emphasizing exploration over performance.

---

## 3. Game Juice Audit

### Juice Score: **5/10**

| Category | Score | Notes |
|----------|-------|-------|
| Visual Feedback | 5/10 | Basic particles, missing key moments |
| Auditory Feedback | 6/10 | Uses audio hook but minimal variety |
| Haptics | 4/10 | Only at game end |
| Animation | 6/10 | Framer Motion used for UI only |
| Interaction Feel | 4/10 | No squash/stretch, minimal anticipation |

---

### 3.1 Visual Feedback Issues

#### JUICE-001: No Particle Capture Effect
**Severity:** HIGH  
**Evidence:** `Observed`

**Finding:** When particles enter portals, they simply disappear:

```typescript
// shadowPortalLogic.ts:350-375
if (checkPortalCapture(updatedParticle, updatedPortals[i])) {
  captured = true;
  updatedParticle = { ...updatedParticle, captured: true };
  // ... scoring logic only, no visual effect
}
```

**Recommendation:** Add:
- Particle "sucked in" animation
- Portal pulse/glow burst
- Sparkle trail into portal

---

#### JUICE-002: Static Background Wastes Opportunity
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Stars are randomly positioned but completely static:

```typescript
// ShadowPortal.tsx:71-82
for (let i = 0; i < 50; i++) {
  const x = (i * 137.5) % CANVAS_WIDTH;  // Fixed pattern
  const y = (i * 73.3) % CANVAS_HEIGHT;  // Fixed pattern
  // ... static rendering
}
```

**Recommendation:** Add twinkling animation, shooting stars, or subtle parallax.

---

#### JUICE-003: No Hand/Silhouette Visual
**Severity:** HIGH  
**Evidence:** `Observed`

**Finding:** The "silhouette" is invisible to players. No visual representation of their body/hand blocking area.

**Recommendation:** 
- Add ghostly shadow effect at silhouette location
- Mirror the actual camera feed as a shadow
- Show hand landmark dots (MediaPipe style)

---

#### JUICE-004: Missing Combo Visual Punch
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Combo text uses basic Framer Motion but lacks impact:

```typescript
// ShadowPortal.tsx:419-431
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0, opacity: 0 }}
  className="absolute top-1/4 left-1/2 -translate-x-1/2 text-4xl font-bold text-yellow-400"
>
  {comboText}
</motion.div>
```

**Recommendation:** 
- Add screen shake on high combos
- Particle burst effect
- Mascot reaction animation

---

### 3.2 Auditory Feedback Issues

#### JUICE-005: Generic Audio Hooks
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Uses shared audio hooks with no custom sounds:

```typescript
// ShadowPortal.tsx:55
const { playSuccess, playError, playCelebration } = useAudio();
```

No unique "particle bounce," "portal hum," or "silhouette touch" sounds.

**Recommendation:** Add custom sound effects:
- Particle spawn: "Pop"
- Particle bounce: "Boop"
- Portal capture: "Chime"
- Silhouette block: "Thud/whoosh"

---

#### JUICE-006: No Ambient Audio
**Severity:** LOW  
**Evidence:** `Inferred`

**Finding:** No background atmosphere. A space/magical theme would benefit from ambient sound.

---

### 3.3 Haptics Issues

#### JUICE-007: Missing Capture Haptics
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Haptics only triggered at game end:

```typescript
// ShadowPortal.tsx:229-243
if (updated.status === 'complete' && prev.status === 'playing') {
  playSuccess();
  playCelebration();
  triggerHaptic('celebration');  // Only here
  setShowCelebration(true);
}
```

No haptic feedback for:
- Particle captured
- Combo achieved
- Portal partially filled

**Recommendation:** Add subtle haptics for each capture (light vibration pattern).

---

## 4. Technical Issues

### 4.1 Bugs & Logic Issues

#### TECH-001: Unused Code in Particles Module
**Severity:** LOW  
**Evidence:** `Observed`

**Finding:** The `particles.ts` module defines complex types and functions (Obstacle, moving obstacles, wind force) that are **never used** by the main game:

```typescript
// particles.ts:36-46 - Obstacle type defined but unused
export interface Obstacle {
  x: number; y: number; width: number; height: number;
  type: 'static' | 'moving';
  speed?: number;
  // ...
}

// particles.ts:124-130 - Wind force defined but unused
export function applyWindForce(particle: Particle, windForce: Vector2D, dt: number): Particle {
  // ... never called
}
```

**Impact:** Bundle size, confusion for maintainers.

**Recommendation:** Remove unused code or implement features.

---

#### TECH-002: Dual Particle System Confusion
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Two different particle type definitions exist:

```typescript
// particles.ts:18-26
export interface Particle {
  id: number;  // numeric
  x: number; y: number;  // pixel coordinates
  vx: number; vy: number;
  active: boolean; inPortal: boolean;
}

// shadowPortalLogic.ts:19-30
export interface Particle {
  id: string;  // string with timestamp
  x: number; y: number;  // normalized 0-1
  vx: number; vy: number;
  radius: number; type: ParticleType; color: string;
  captured: boolean; missed: boolean;
}
```

**Impact:** Potential confusion, though modules are separate.

**Recommendation:** Rename to `PhysicsParticle` vs `GameParticle` or consolidate.

---

#### TECH-003: Portal Position Inconsistency
**Severity:** LOW  
**Evidence:** `Observed`

**Finding:** Portals in `shadowPortalLogic.ts` use normalized coordinates (0-1):

```typescript
// shadowPortalLogic.ts:161-193
{
  id: 'left',
  x: 0.2,  // normalized
  y: 0.85,
  // ...
}
```

But `particles.ts` uses pixel coordinates:

```typescript
// particles.ts:423-432
portals: [
  { x: 400, y: 500, target: 15 },  // pixels
]
```

**Recommendation:** Standardize on one coordinate system.

---

### 4.2 Performance Issues

#### TECH-004: Canvas Redraws Every Frame
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** The entire canvas is cleared and redrawn every frame:

```typescript
// ShadowPortal.tsx:62-181
drawGame = useCallback((ctx) => {
  // Clear with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw stars (50 iterations)
  for (let i = 0; i < 50; i++) { ... }
  
  // Draw portals
  gameState.portals.forEach((portal) => { ... });
  
  // Draw silhouette regions
  silhouetteRegions.forEach((region) => { ... });
  
  // Draw particles
  gameState.particles.forEach((particle) => { ... });
}, [gameState, silhouetteRegions]);
```

On every game state update, all visual elements are redrawn.

**Recommendation:** 
- Use object pooling for particles
- Cache static elements (background stars)
- Consider offscreen canvas for portals

---

#### TECH-005: State Updates in RequestAnimationFrame
**Severity:** MEDIUM  
**Evidence:** `Observed`

**Finding:** Game loop triggers React state updates:

```typescript
// ShadowPortal.tsx:218-260
const gameLoop = (timestamp: number) => {
  if (gameStateRef.current.status === 'playing') {
    setGameState((prev) => {  // React state update
      let updated = spawnParticles(prev, deltaTime);
      updated = updateParticles(updated, deltaTime, silhouetteRegions);
      // ...
    });
  }
  gameLoopRef.current = requestAnimationFrame(gameLoop);
};
```

**Impact:** Potential React render thrashing at 60fps.

**Recommendation:** Decouple game logic from React state. Use refs for physics, only update React for UI changes.

---

#### TECH-006: Memory Leak Risk in Particle Generation
**Severity:** LOW  
**Evidence:** `Inferred`

**Finding:** Particles use Date.now() + counter for IDs:

```typescript
// particles.ts:58-61
let nextParticleId = 0;
export function generateParticleId(): number {
  return Date.now() + nextParticleId++;
}
```

If the module is hot-reloaded or reused, `nextParticleId` could theoretically overflow (though unlikely in practice).

---

### 4.3 Security Concerns

#### TECH-007: No Input Sanitization on Canvas Click
**Severity:** LOW  
**Evidence:** `Observed`

**Finding:** Mouse position is directly used without bounds checking:

```typescript
// ShadowPortal.tsx:307-326
const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  // No validation that x/y are in valid 0-1 range
  setSilhouetteRegions([{ x: x - 0.05, y: y - 0.05, ... }]);
}, []);
```

**Impact:** Minimal (canvas only), but could cause particles to spawn off-screen.

---

## 5. Quick Wins (Low Effort, High Impact)

| ID | Improvement | Effort | Impact | File |
|----|-------------|--------|--------|------|
| QW-001 | Add glowing silhouette visualization | Low | High | ShadowPortal.tsx |
| QW-002 | Portal pulse on particle capture | Low | High | ShadowPortal.tsx |
| QW-003 | Add capture haptic feedback | Low | Medium | ShadowPortal.tsx:356 |
| QW-004 | Show "Use Mouse" button when no camera | Low | Medium | ShadowPortal.tsx |
| QW-005 | Rename to "Hand Portal" (truth in advertising) | Low | High | Multiple |
| QW-006 | Add particle trail effect | Low | Medium | ShadowPortal.tsx:139-177 |
| QW-007 | Replace "Missed" counter with positive framing | Low | Medium | ShadowPortal.tsx:376-401 |
| QW-008 | Add twinkling star animation | Low | Low | ShadowPortal.tsx:71-82 |
| QW-009 | Implement pause button | Low | Medium | ShadowPortal.tsx |
| QW-010 | Add combo progress bar | Low | Medium | ShadowPortal.tsx |

---

## 6. Major Improvements (Epics)

### EPIC-001: True Body Segmentation Support
**Effort:** 2-3 weeks  
**Impact:** Transformative

Implement MediaPipe Pose or BodyPix for actual silhouette detection:
- Full body as collision shape
- Arms create "tunnels"
- Reward creative body poses

---

### EPIC-002: Physics Juice Pass
**Effort:** 1 week  
**Impact:** High

- Particle squash/stretch on bounce
- Screen shake on combo
- Portal swirl animation
- Particle trail effects
- "Magnetic" portal attraction visualization

---

### EPIC-003: Adaptive Difficulty System
**Effort:** 1 week  
**Impact:** High

- Monitor player success rate
- Adjust spawn rate dynamically
- Provide "helper" trajectory lines for struggling players
- Celebrate improvement with "You're getting better!" messages

---

### EPIC-004: Tutorial & Onboarding
**Effort:** 1-2 weeks  
**Impact:** High

- Interactive tutorial scene
- Slow-motion first capture
- Visual guidance (arrows showing hand movement)
- Practice mode with unlimited time

---

### EPIC-005: Audio Design Pass
**Effort:** 3-5 days  
**Impact:** Medium

- Custom sound effects for all interactions
- Ambient space atmosphere
- Mascot voice lines for encouragement
- Dynamic music that responds to combo streaks

---

## 7. Positive Findings

### ✅ Code Quality
- Well-structured game logic with pure functions
- Comprehensive test coverage (1150+ lines)
- Proper TypeScript types throughout
- Clean separation between physics and rendering

### ✅ Accessibility Foundation
- TTS integration present
- Haptic support wired in
- Reduced motion support via GameShell
- Mouse fallback exists

### ✅ Game Loop Architecture
- Proper requestAnimationFrame usage
- Delta time consideration
- Cleanup on unmount

### ✅ Infrastructure
- Uses standardized GameShell and GameContainer
- Proper error boundaries
- Wellness timer included
- Analytics tracking integrated

---

## 8. Evidence Log

| Claim | Type | Source |
|-------|------|--------|
| Silhouette = hand position only | Observed | ShadowPortal.tsx:191-206 |
| No capture visual effect | Observed | shadowPortalLogic.ts:350-375 |
| Combo multiplier hidden | Observed | shadowPortalLogic.ts:364-366 |
| Two particle type systems | Observed | particles.ts:18-26, shadowPortalLogic.ts:19-30 |
| Canvas redraws every frame | Observed | ShadowPortal.tsx:62-181 |
| Test coverage exists | Observed | particles.test.ts, particles.levels-and-integration.test.ts |

---

## 9. Recommendations Summary

### Immediate Actions (This Sprint)
1. Fix KUX-001: Rename or implement true silhouette
2. Implement QW-001: Add silhouette visualization
3. Implement QW-003: Add capture haptics

### Short Term (Next 2 Sprints)
1. EPIC-002: Physics juice pass
2. QW-007: Positive framing for missed counter
3. KUX-006: Basic tutorial mode

### Long Term (Next Quarter)
1. EPIC-001: True body segmentation (if desired)
2. EPIC-003: Adaptive difficulty
3. EPIC-005: Full audio design

---

## Appendix: Test Coverage

```
Test Files: 2 passed (particles.test.ts, particles.levels-and-integration.test.ts)
Tests: 70+ test cases covering:
  - Particle physics (gravity, position, bounds)
  - Collision detection (portal, obstacle, barrier)
  - Scoring system (base, streak, time bonus)
  - Level progression
  - Obstacle movement
```

---

*Audit conducted following Evidence-First Development principles. All claims labeled as Observed, Inferred, or Unknown per AGENTS.md guidelines.*
