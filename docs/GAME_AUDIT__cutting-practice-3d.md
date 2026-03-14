# Game Audit: Cutting Practice 3D

**Audit Date:** 2026-03-09  
**Auditor:** AI Agent (Comprehensive Game Auditor)  
**Game ID:** cutting-practice-3d  
**File:** `src/frontend/src/pages/three/CuttingPractice3D.tsx`  
**Base Commit:** Current HEAD  
**Age Range:** 4-7 years  
**CV:** Hand tracking enabled (['hand'])

---

## 1. Executive Summary

| Metric | Score | Assessment |
|--------|-------|------------|
| **Overall** | **4.5/10** | Below production quality |
| **Child-Centered UX** | **4/10** | Misaligned with cutting skill goals, confusing gameplay |
| **Game Juice** | **5/10** | Basic feedback, missing celebration moments |
| **Technical Quality** | **5/10** | Functional but has lifecycle and performance issues |

**Issue Count:** 16 findings (2 HIGH, 7 MEDIUM, 7 LOW)

**Verdict:** This game has a fundamental design mismatch. The name suggests "cutting practice" for fine motor skills (tracing lines through materials), but the implementation is a "fruit clicker" game where clicking flying fruits makes them disappear. This disconnect between expectations and reality creates confusion for both children and parents.

---

## 2. Child-Centered UX Findings (KUX-###)

### KUX-001: Game Concept Mismatch - "Cutting" vs "Clicking" ⭐ HIGH

**Evidence:** `Observed` - Game title and implementation

The game is named "Cutting Practice 3D" but the actual gameplay involves:
- **Clicking** flying fruits (not cutting)
- **No line tracing** or following paths
- **No scissor motion** or cutting gesture
- **Single point interaction** instead of drag-to-cut

```tsx
// Line 104-109: Simple click handler
const handleClick = () => {
  if (!sliced) {
    setSliced(true);
    onSlice(fruit.points);
  }
};
```

Meanwhile, `cuttingPracticeLogic.ts` contains complete cutting mechanics:
- Line tracing with tolerance checking
- Progress tracking along cut lines
- Quality scoring based on accuracy
- Progressive difficulty (paper → fabric → food)

**Failure Mode:** Children expecting to practice cutting motions are instead playing a simple clicking game. Parents looking for motor skill development will be disappointed.

**Blast Radius:**
- Complete misunderstanding of game purpose
- Wasted potential for actual skill development
- Disappointment for target age group (4-7) who need cutting practice

**Suggested Fix:**
- **Option A:** Rename to "Fruit Clicker 3D" and embrace the simple gameplay
- **Option B:** Implement actual cutting mechanics using the existing logic file
  - Static fruit models on cutting board
  - Drag-to-cut interaction following dotted lines
  - Progress feedback along cut path

---

### KUX-002: No Hand Tracking Despite CV=['hand'] Declaration ⭐ HIGH

**Evidence:** `Observed` - No hand tracking integration

The game claims CV support for hand tracking but:
- No `useGameHandTracking` hook usage
- No `webcamRef` passed to GameContainer
- No hand cursor visualization
- No gesture recognition for "cutting" motion

```tsx
// GameContainer props missing:
// isHandDetected={isHandDetected}
// isPlaying={isPlaying}
// webcamRef={webcamRef}
```

**Failure Mode:** Parents/children selecting "hand mode" will see no difference from mouse mode, creating false expectations.

**Suggested Fix:**
- Implement hand tracking with "scissor" gesture recognition
- Track hand position for "virtual scissors" cutting motion
- Add visual hand cursor with scissor animation
- Require two-finger pinch or swipe gesture to "cut"

---

### KUX-003: Lives System Creates Anxiety for Young Children ⭐ MEDIUM

**Evidence:** `Observed` - Lines 138, 165-175

```tsx
const [lives, setLives] = useState(3);
// ...
const handleMiss = useCallback(() => {
  setLives((l) => {
    const newLives = l - 1;
    if (newLives <= 0) {
      setGameOver(true);
      playSFX('win', 0.7); // Inappropriate sound for game over
    }
    return newLives;
  });
}, [playSFX]);
```

**Failure Mode:** The 4-7 age group experiences anxiety from "lives" mechanics. Missing a fruit (which falls naturally) leads to punishment and eventual "game over." This discourages exploration and creates negative associations.

**Blast Radius:**
- Children may stop playing after first "game over"
- Fear of failure reduces willingness to try
- Counterproductive for a "practice" game

**Suggested Fix:**
- Remove lives system entirely
- Or convert to "streak" bonus (positive reinforcement only)
- Ensure endless play mode with no failure state
- Celebrate effort, not just success

---

### KUX-004: Inappropriate Audio Feedback on Game Over ⭐ MEDIUM

**Evidence:** `Observed` - Line 170

```tsx
if (newLives <= 0) {
  setGameOver(true);
  playSFX('win', 0.7); // WIN sound for game over!
}
```

**Failure Mode:** When children lose all lives (game over), they hear a celebratory "win" sound. This is confusing and undermines the emotional impact of the game state.

**Suggested Fix:**
- Use 'lose' sound from AUDIO_ASSETS for game over
- Or remove failure state entirely (see KUX-003)

---

### KUX-005: Fruits Spawn Too Quickly for Target Age ⭐ MEDIUM

**Evidence:** `Observed` - Lines 152-158

```tsx
const interval = setInterval(() => {
  const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  setFruits((prev) => [...prev, { id: fruitIdRef.current++, fruit: randomFruit }]);
}, 2000); // Every 2 seconds
```

**Failure Mode:** New fruits spawn every 2 seconds. For 4-5 year olds developing coordination, this creates overwhelming pressure. Multiple fruits accumulate on screen, causing cognitive overload.

**Suggested Fix:**
- Start with 4-5 second intervals
- Gradually increase speed as score increases
- Cap maximum fruits on screen to 3
- Or add difficulty setting (easy/medium/hard)

---

### KUX-006: No Tutorial or Instructions ⭐ MEDIUM

**Evidence:** `Observed` - Line 270-272

Only instruction: `"Click on flying fruits to slice them! Don't let them fall."`

Missing:
- Visual demonstration of interaction
- Voice instructions for pre-readers
- First-time tutorial overlay
- Hand tracking instructions (if implemented)

**Suggested Fix:**
- Animated hand cursor showing click action
- Voiceover: "Click the fruits before they fall!"
- First-time tutorial with guided practice
- Visual arrows pointing to first fruit

---

### KUX-007: No Visual Progression or Level System ⭐ MEDIUM

**Evidence:** `Observed` - No level progression

The game continues indefinitely with the same 4 fruits spawning randomly. No:
- Difficulty progression
- New fruit types unlocked
- Visual feedback for improvement
- Achievement milestones

**Suggested Fix:**
- Add levels with increasing speed
- Unlock new fruits at score milestones
- Show "Level Up!" celebration
- Visual progress bar to next milestone

---

### KUX-008: Score Display Uses Small Text ⭐ LOW

**Evidence:** `Observed` - Lines 236-248

```tsx
<Html position={[-3, 4, 0]}>
  <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg">
    <div className="text-sm text-slate-400">Score</div>
    <div className="text-2xl font-bold">{score}</div>
  </div>
</Html>
```

**Failure Mode:** "text-sm" for the "Score" label and "text-2xl" for the number may be too small for young children to read easily, especially on smaller screens.

**Suggested Fix:**
- Increase font sizes (text-4xl for score)
- Use high contrast colors
- Consider using iconography instead of text labels

---

## 3. Game Juice Findings

### Overall Juice Score: **5/10**

| Category | Score | Notes |
|----------|-------|-------|
| Visual Feedback | 6/10 | Basic particles on slice, no other effects |
| Audio Feedback | 4/10 | Only 2 sounds (crunch, win), repetitive |
| Physical Feel | 5/10 | No screenshake, minimal impact |
| Celebration | 4/10 | Basic game over modal, no mid-game celebrations |
| Polish | 5/10 | Cursor changes, but missing impact frames |

---

### JUICE-001: Particle Effects Too Minimal ⭐ MEDIUM

**Evidence:** `Observed` - SliceParticles component (Lines 20-57)

```tsx
// Only 8 particles, simple boxes
return Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i / 8) * Math.PI * 2,
  speed: Math.random() * 0.1 + 0.05,
}));
// ...
<boxGeometry args={[0.05, 0.05, 0.05]} />
```

**Failure Mode:** Particle effect is underwhelming:
- Only 8 particles
- Simple cubes instead of fruit-colored shards
- No rotation
- Short duration (1 second)

**Suggested Fix:**
- Increase to 15-20 particles
- Use fruit-textured fragments or colored particles
- Add rotation to particles
- Extend duration slightly
- Vary particle sizes

---

### JUICE-002: Missing "Slice Trail" Visual Effect ⭐ MEDIUM

**Evidence:** `Observed` - No trail effect

When clicking to "slice," there's no visual indication of the cut path:
- No trail following the cursor
- No slash line
- No glow effect on interaction

**Suggested Fix:**
- Add a brief slash line across the fruit on click
- Cursor trail effect (sparkle/dust)
- Brief glow flash on the fruit

---

### JUICE-003: Audio Feedback Too Limited ⭐ MEDIUM

**Evidence:** `Observed` - Lines 145, 163, 170

```tsx
preload(['click', 'crunch', 'win']);
// ...
playSFX('crunch', 0.5); // Only sound for slicing
```

Only 3 sounds used:
- 'click' (mute toggle)
- 'crunch' (fruit slice)
- 'win' (inappropriately used for game over)

Missing:
- Different sounds for different fruits
- Background music
- Spawn sound when fruit appears
- Miss sound when fruit falls
- Celebration for milestones

**Suggested Fix:**
- Different "crunch" variations per fruit type
- Add background music
- Subtle "whoosh" sound on fruit spawn
- Comical "oops" sound on miss (not scary)

---

### JUICE-004: No Score Pop Animation ⭐ LOW

**Evidence:** `Observed` - Score updates instantly

Score changes without any visual celebration:
- No scale pop
- No color flash
- No floating "+X" text

**Suggested Fix:**
```tsx
// Add scale animation on score change
const [scoreBounce, setScoreBounce] = useState(false);
useEffect(() => {
  setScoreBounce(true);
  setTimeout(() => setScoreBounce(false), 200);
}, [score]);
// Apply scale transform when scoreBounce is true
```

---

### JUICE-005: Fruits Have No Idle Animation ⭐ LOW

**Evidence:** `Observed` - Lines 99-102

```tsx
setRotation((r) => r + 0.02); // Only rotation
```

Fruits only rotate. Missing:
- Subtle wobble
- Scale pulse
- Texture shimmer

**Suggested Fix:**
- Add subtle wobble using sine wave on scale
- Slight vertical oscillation
- Make rotation speed vary by fruit

---

### JUICE-006: Game Over Modal Too Sudden ⭐ LOW

**Evidence:** `Observed` - Lines 251-266

Game over appears instantly with no transition:
- No slow-motion effect
- No warning flash
- Modal just "pops" in

**Suggested Fix:**
- Slow down time briefly before game over
- Red flash warning when on last life
- Modal fade-in animation
- "Try again" encouragement animation

---

## 4. Technical Issues

### TECH-001: Memory Leak from Fruit Array Accumulation ⭐ MEDIUM

**Evidence:** `Observed` - Lines 140, 152-158, 177-179

```tsx
const [fruits, setFruits] = useState<{ id: number; fruit: typeof FRUITS[0] }[]>([]);
// ...
setFruits((prev) => [...prev, { id: fruitIdRef.current++, fruit: randomFruit }]);
```

Fruits are added to array but only removed on slice/miss. If user doesn't interact:
- Array grows unbounded
- All fruits render (performance impact)
- Memory accumulates

**Suggested Fix:**
```tsx
// Cap maximum fruits
setFruits((prev) => {
  const next = [...prev, { id: fruitIdRef.current++, fruit: randomFruit }];
  return next.slice(-10); // Keep only last 10
});
```

---

### TECH-002: Document Body Cursor Mutation is Side-Effect ⭐ MEDIUM

**Evidence:** `Observed` - Lines 119-120

```tsx
onPointerOver={() => document.body.style.cursor = 'crosshair'}
onPointerOut={() => document.body.style.cursor = 'default'}
```

**Failure Mode:** Direct DOM mutation outside React lifecycle. Can cause:
- Cursor stuck in wrong state on error
- Conflicts with other components
- SSR issues (if ever implemented)

**Suggested Fix:**
```tsx
// Use CSS class on container instead
const [isHovering, setIsHovering] = useState(false);
// Apply cursor style via inline style on container div
```

---

### TECH-003: handleRemoveFruit Called Twice Per Fruit ⭐ MEDIUM

**Evidence:** `Observed` - Lines 224-231

```tsx
<FlyingFruit
  onSlice={(points) => {
    handleSlice(points);
    handleRemoveFruit(id);  // Called here
  }}
  onMiss={() => {
    handleMiss();
    handleRemoveFruit(id);  // And here
  }}
/>
```

The fruit component also has internal removal logic in handleMiss (line 174). This creates double removal attempts.

**Suggested Fix:**
- Consolidate removal logic
- Ensure single source of truth for fruit lifecycle

---

### TECH-004: Missing Error Handling for GLTF Load Failures ⭐ MEDIUM

**Evidence:** `Observed` - Line 72

```tsx
const { scene } = useGLTF(`/assets/kenney/3d/food/${fruit.id}.glb`);
```

No error boundary or fallback for:
- Missing 3D model files
- Network failures
- Corrupted assets

**Suggested Fix:**
- Add ErrorBoundary around FlyingFruit
- Provide fallback colored geometry if model fails
- Pre-validate assets on game load

---

### TECH-005: velocityRef Mutated During Render ⭐ LOW

**Evidence:** `Observed` - Line 70

```tsx
const velocityRef = useRef({ x: (Math.random() - 0.5) * 0.05, y: 0.1 + Math.random() * 0.05 });
```

Random values generated during render can cause hydration mismatches in SSR scenarios.

**Suggested Fix:**
```tsx
const velocityRef = useRef({ x: 0, y: 0 });
useEffect(() => {
  velocityRef.current = { 
    x: (Math.random() - 0.5) * 0.05, 
    y: 0.1 + Math.random() * 0.05 
  };
}, []);
```

---

### TECH-006: ThreeDGameCanvas enableOrbit Disabled But Not Needed ⭐ LOW

**Evidence:** `Observed` - Line 210

```tsx
enableOrbit={false}
```

Camera is fixed, which is appropriate, but the prop is explicitly passed when the default would suffice.

**Suggested Fix:**
- Remove explicit prop (accept default)
- Or document why camera must be fixed

---

### TECH-007: Unused Logic File Creates Maintenance Burden ⭐ LOW

**Evidence:** `Observed` - `cuttingPracticeLogic.ts` exists but unused

367 lines of well-tested cutting logic exists but is not imported or used by the 3D game:
- Line tracing functions
- Quality scoring
- Level progression
- Material types

**Suggested Fix:**
- Either integrate the logic (implement real cutting game)
- Or remove the unused file to reduce confusion
- Or create a 2D version that uses this logic

---

## 5. Quick Wins (5-10 items)

| # | Issue | Effort | Impact | Fix |
|---|-------|--------|--------|-----|
| 1 | **Fix game over sound** (KUX-004) | 2 min | MEDIUM | Change 'win' to 'lose' |
| 2 | **Slow spawn rate** (KUX-005) | 5 min | MEDIUM | Change 2000ms to 4000ms |
| 3 | **Add fruit cap** (TECH-001) | 10 min | MEDIUM | Slice array to max 10 |
| 4 | **Remove lives system** (KUX-003) | 15 min | HIGH | Remove lives, keep endless |
| 5 | **Fix cursor side-effect** (TECH-002) | 15 min | LOW | Use CSS class |
| 6 | **Add score animation** (JUICE-004) | 20 min | MEDIUM | Scale bounce on change |
| 7 | **Increase text sizes** (KUX-008) | 5 min | LOW | text-2xl → text-4xl |
| 8 | **Add spawn sound** (JUICE-003) | 10 min | MEDIUM | playSFX on interval |
| 9 | **Fix double removal** (TECH-003) | 15 min | MEDIUM | Consolidate logic |
| 10 | **Add more particles** (JUICE-001) | 20 min | MEDIUM | 8 → 20 particles |

**Estimated Total:** ~2 hours for all quick wins

---

## 6. Major Improvements

### MAJOR-001: Implement Actual Cutting Mechanics

**Current:** Click to make fruit disappear  
**Proposed:** Drag to trace cut lines through stationary fruits

**Implementation:**
1. Use `cuttingPracticeLogic.ts` for line generation and validation
2. Place fruits on virtual cutting board (not flying)
3. Draw dotted cut lines on fruit models
4. Track finger/mouse drag path
5. Calculate accuracy against dotted line
6. Show cut animation when complete
7. Award points based on cut quality

**Effort:** 6-8 hours  
**Impact:** Aligns game with its name and educational purpose

---

### MAJOR-002: Add Hand Tracking Integration

**Requirements:**
- Integrate `useGameHandTracking` hook
- Recognize "scissor" gesture (two fingers)
- Track hand position as "virtual scissors"
- Visual hand cursor with scissor animation
- Close gesture = cut, open = move

**Effort:** 6-8 hours  
**Impact:** Enables CV mode as advertised, adds immersion

---

### MAJOR-003: Progressive Level System

**Requirements:**
- 3 levels matching logic file (Paper → Fabric → Food)
- Paper: Straight line cuts, high tolerance
- Fabric: Curved lines, medium tolerance
- Food: Complex shapes, low tolerance
- Visual material change per level
- Unlock animations between levels

**Effort:** 4-6 hours  
**Impact:** Educational progression, replayability

---

### MAJOR-004: Complete Audio Overhaul

**Requirements:**
- Background music (calm, focused)
- Different cut sounds per material
- Scissor "snip" sound
- Success fanfare per level
- Gentle encouragement on near-misses
- TTS instructions for pre-readers

**Effort:** 4-5 hours (including asset sourcing)  
**Impact:** Transforms feel from prototype to production

---

### MAJOR-005: Visual Polish Pass

**Requirements:**
- Animated cutting board surface
- Particle effects for different materials
- Confetti celebration on level complete
- Smooth camera transitions
- Material-appropriate textures
- Glow effect on successful cut

**Effort:** 5-6 hours  
**Impact:** Professional presentation, child engagement

---

## 7. Evidence Log

| Finding | Evidence Type | Source |
|---------|---------------|--------|
| Game concept mismatch | Observed | cuttingPracticeLogic.ts vs CuttingPractice3D.tsx |
| No hand tracking | Observed | Missing hook usage in component |
| Lives system anxiety | Observed | Lines 138, 165-175 |
| Wrong game over sound | Observed | Line 170 |
| 2-second spawn rate | Observed | Line 152 |
| Memory leak risk | Inferred | Unbounded array growth |
| Unused logic file | Observed | cuttingPracticeLogic.ts not imported |
| Double removal | Observed | Lines 224-231, 174 |
| Cursor side-effect | Observed | Lines 119-120 |
| Missing error handling | Inferred | useGLTF without fallback |

---

## 8. Regression Analysis

**Git History:**
- File has been present in codebase
- `cuttingPracticeLogic.ts` exists with comprehensive cutting mechanics
- `CuttingPractice3D.tsx` implements different gameplay

**Status:** DESIGN MISMATCH - The 3D implementation diverges significantly from the logic file's intent. This appears to be a case where a simpler "clicker" game was implemented instead of the planned "cutting practice" game.

---

## 9. Test Coverage Assessment

| Component | Tests Exist | Coverage Level |
|-----------|-------------|----------------|
| CuttingPractice3D.tsx | NO | None |
| cuttingPracticeLogic.ts | YES | Comprehensive (288 lines) |
| ThreeDGameCanvas | NO | None (tested elsewhere) |
| use3DGameAudio | NO | None (tested elsewhere) |

**Gap:** The 3D game component has no tests. The existing test file covers the logic module which is not used by the 3D game.

---

## 10. Risk Rating: MEDIUM

**Why MEDIUM (not HIGH):**
- No security vulnerabilities
- Game is functional and won't crash
- No inappropriate content

**Why MEDIUM (not LOW):**
- Fundamental design mismatch with stated purpose
- Missing advertised hand tracking feature
- Lives system may discourage young players
- Wasted effort on unused logic file

**Primary Concern:** The disconnect between game name/purpose and actual implementation creates confusion and missed educational opportunity.

---

## 11. Next Actions

### Immediate (Pre-Release Blockers):
1. **KUX-004**: Fix game over sound (use 'lose' instead of 'win')
2. **KUX-005**: Slow spawn rate for target age
3. **TECH-001**: Add fruit cap to prevent memory issues

### Short Term (Quality):
4. **KUX-003**: Remove or soften lives system
5. **JUICE-001**: Improve particle effects
6. **JUICE-003**: Add more audio variety

### Long Term (Strategic Decision):
7. **MAJOR-001**: DECISION NEEDED - Either:
   - Rename game to match current clicker gameplay, OR
   - Implement actual cutting mechanics using existing logic
8. **MAJOR-002**: Add hand tracking integration
9. **TECH-007**: Resolve unused logic file (use or remove)

---

## Appendix A: Related Files

| File | Relationship |
|------|--------------|
| `src/frontend/src/components/game/three/ThreeDGameCanvas.tsx` | Parent 3D canvas provider |
| `src/frontend/src/hooks/use3DGameAudio.ts` | Audio hook dependency |
| `src/frontend/src/hooks/useGameHandTracking.ts` | Hand tracking (not used) |
| `src/frontend/src/components/GameContainer.tsx` | Layout wrapper |
| `src/frontend/src/games/cuttingPracticeLogic.ts` | Unused cutting logic |
| `src/frontend/src/games/__tests__/cuttingPracticeLogic.test.ts` | Tests for unused logic |

---

## Appendix B: Asset Dependencies

**3D Models (Kenney Assets):**
- `/assets/kenney/3d/food/apple.glb` ✓
- `/assets/kenney/3d/food/banana.glb` ✓
- `/assets/kenney/3d/food/orange.glb` ✓
- `/assets/kenney/3d/food/watermelon.glb` ✓

**Audio (Kenney Assets):**
- `/assets/kenney/audio/interface/click.ogg`
- `/assets/kenney/audio/impact/crunch_000.ogg`
- `/assets/kenney/audio/jingles/win.ogg` (misused for game over)

---

*Audit completed using evidence-first discipline. All claims labeled as Observed, Inferred, or Unknown per AGENTS.md requirements.*
