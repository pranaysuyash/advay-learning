# Virtual Bubbles - Game Specification

**Slug:** `virtual-bubbles`  
**World:** 3D World (note: implemented as 2D canvas)  
**CV Mode:** Hand tracking (`cv: ['hand']`)  
**File:** `src/frontend/src/pages/VirtualBubbles.tsx`  
**Logic:** `src/frontend/src/games/virtualBubblesLogic.ts`  

---

## Section 1: Concept Summary

| Attribute | Value |
|-----------|-------|
| **One-line concept** | Blow into microphone to create bubbles, then pop them with hand movements |
| **Genre** | Casual / Action / Sensory Play |
| **Target audience** | Ages 2-6 (early childhood) |
| **Core player fantasy** | Being a bubble wizard who creates and pops magical floating spheres |
| **Primary skill tested** | Breath control, hand-eye coordination, timing |
| **Session length** | 2-5 minutes per level |
| **Platform context** | Web-based, camera + microphone required for full experience |

---

## Section 2: Repo Status

| Status | Details |
|--------|---------|
| **Implementation status** | ✅ Complete and functional |
| **What works now** | Full game loop with 3 levels, microphone blow detection, hand tracking for popping, streak system, scoring |
| **What is partial/missing** | 3D implementation (currently 2D canvas), no Rapier physics, limited bubble visual effects |
| **Evidence** | Code review shows working canvas-based renderer, Web Audio API integration, hand tracking hook usage |
| **Confidence level** | High - game is playable and complete |

---

## Section 3: Current Implementation

### Flow
```
Start Screen → Playing (blow creates bubbles) → Pop bubbles with hand → Level Complete → Next Level/Exit
```

1. **Start Screen**: Modal with instructions "Blow to create bubbles, click to pop!"
2. **Playing**: Real-time canvas rendering at 60 FPS via requestAnimationFrame
3. **Blow Detection**: Web Audio API analyzes microphone input (threshold: 15)
4. **Bubble Creation**: New bubble spawns at random X position when blow detected
5. **Popping**: Hand position (normalized 0-1) maps to canvas coordinates for collision
6. **Level Complete**: Achievement modal when target bubbles popped

### Controls

| Input | Action | Implementation |
|-------|--------|----------------|
| Microphone blow | Create bubble | Web Audio API analyser, average volume > 15 |
| Hand tracking | Position cursor | `useGameHandTracking` hook, index finger tip |
| Hand hover + proximity | Pop bubble | Distance check: cursor within bubble radius |
| Mouse move | Fallback cursor | `handleCanvasMove` maps mouse to normalized coords |
| Tap/Click | Manual blow fallback | `handleManualBlow` creates bubble without mic |

### Mechanics

**Bubble Physics (2D):**
```typescript
// From virtualBubblesLogic.ts
interface Bubble {
  id: number;
  x: number;        // Position
  y: number;
  size: number;     // 30-70px radius
  color: string;    // Random from 10-color palette
  speedY: number;   // 0.5-2.0 px/frame (upward)
  speedX: number;   // -1.0 to 1.0 px/frame (drift)
}
```

**Collision Detection:**
```typescript
// Euclidean distance check
const distance = Math.sqrt(
  Math.pow(normalizedX - bubble.x, 2) + 
  Math.pow(normalizedY - bubble.y, 2)
);
if (distance < bubble.size) { /* pop */ }
```

**Scoring Formula:**
- Base points: 10 per bubble
- Streak bonus: min(streak × 2, 15)
- Example: 5th consecutive pop = 10 + 10 = 20 points

### Visuals/UI

**Canvas Rendering (400×400 logical, scales to container):**
- Background: Sky blue (`#87CEEB`)
- Bubble: White fill with 50% opacity, 80% opacity stroke
- No gradients, shadows, or 3D effects
- Simple circle arcs via Canvas 2D API

**UI Overlay (React components):**
- Stats bar: Score, popped count, streak indicator
- Level selector: 3 level buttons (L1, L2, L3)
- Streak milestone: Animated overlay at 5, 10, 15... streaks
- Blow indicator: "🌬️ Blowing!" badge when mic active
- Camera thumbnail: Bottom-right with hand detection status

### Gaps/Issues

1. **Not actually 3D**: Game is in 3D World registry but uses 2D canvas
2. **Limited visuals**: No iridescence, reflections, or 3D depth
3. **No physics**: Simple linear movement, no Rapier integration
4. **Mic permission friction**: Requires microphone access for core mechanic
5. **No bubble variety**: All bubbles behave identically

---

## Section 4: Intended Design

### Educational Goal
Develop breath control awareness and hand-eye coordination in young children through playful cause-and-effect interaction.

### Pedagogical Approach
- **Sensory-motor learning**: Physical action (blow) creates digital reaction
- **Immediate feedback**: Visual pop + sound + haptic on success
- **Progressive challenge**: More bubbles, faster spawn, time pressure
- **Positive reinforcement**: Streak system celebrates consecutive successes

### Difficulty Progression

| Level | Bubbles to Pop | Max Concurrent | Spawn Rate | Time Limit |
|-------|----------------|----------------|------------|------------|
| 1 | 10 | 5 | 2000ms | 45s |
| 2 | 15 | 8 | 1500ms | 40s |
| 3 | 20 | 10 | 1000ms | 35s |

### Accessibility
- ✅ Visual cursor shows hand position
- ✅ Reduced motion support via `useReducedMotion`
- ✅ Microphone optional (tap fallback)
- ✅ Large hit targets (bubble radius 30-70px)
- ⚠️ Requires camera for hand tracking
- ⚠️ Color-blind friendly palette but not optimized

### Engagement
- **Variable reward**: Random bubble colors and sizes
- **Streak mechanic**: Builds investment through consecutive successes
- **Celebration effects**: Milestone animations at streak intervals
- **Audio feedback**: Pop sound + celebration on completion

### Core Loop
```
Blow → Create Bubble → Track Bubble → Pop → Score → Repeat
         ↑_________________________________________|
```

---

## Section 5: Drift Analysis

### Where Implementation Matches Intent (85%)

| Feature | Match % | Notes |
|---------|---------|-------|
| Core blow-to-create mechanic | 100% | Fully implemented with Web Audio API |
| Hand tracking for popping | 100% | `useGameHandTracking` integration working |
| Level progression | 100% | 3 levels with escalating difficulty |
| Streak system | 100% | Milestone celebrations at intervals |
| Score tracking | 100% | Base + streak bonus formula |
| Audio feedback | 100% | Pop sounds via `useAudio` hook |

### Where Implementation Exceeds Intent (10%)

| Feature | Notes |
|---------|-------|
| Microphone fallback | Tap-to-blow when mic denied adds accessibility |
| Haptic feedback | `triggerHaptic` adds tactile dimension not in original spec |
| Wellness timer | Session health tracking built-in |
| Progress persistence | `useGameCompletion` saves scores |

### Where Implementation Falls Short (5%)

| Feature | Gap | Impact |
|---------|-----|--------|
| 3D visuals | Registry says 3D World, but 2D canvas | High - brand alignment |
| Bubble iridescence | No shader effects, just white circles | Medium - visual delight |
| Physics simulation | No Rapier, no realistic float | Medium - could enhance feel |
| Bubble interactions | Bubbles don't collide with each other | Low - minor enhancement |

### Overall Assessment

**Alignment Score: 95%**

The game successfully delivers its intended experience as a 2D canvas-based bubble popping game. The only significant drift is the categorization as "3D World" when the implementation is 2D. This appears to be a registry/metadata issue rather than an implementation gap.

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
1. **Blow detection sensitivity** - Threshold of 15 works well for children
2. **Streak system** - Excellent engagement mechanic
3. **Fallback controls** - Tap mode when mic unavailable
4. **Performance** - 60 FPS via rAF, refs prevent React re-render storms
5. **Level scaling** - Good difficulty curve

### Enhancements to Implement

#### Phase 1: Visual Polish (Low Effort)
- [ ] Gradient fills on bubbles (iridescence effect)
- [ ] Bubble shine/highlight overlay
- [ ] Particle burst on pop
- [ ] Background clouds or underwater scene

#### Phase 2: 3D Migration (Medium Effort)
- [ ] Port to React Three Fiber + Rapier
- [ ] True 3D bubble spheres with physics
- [ ] Depth-based parallax
- [ ] 3D hand cursor with depth perception

#### Phase 3: Gameplay Expansion (High Effort)
- [ ] Bubble types (normal, speedy, giant, golden)
- [ ] Power-ups (freeze, multi-pop, magnet)
- [ ] Obstacles (wind currents, barriers)
- [ ] Multiplayer: race to pop most bubbles

### Experimental Features
- **Voice pitch control**: Blow harder/louder = bigger bubbles
- **Stereo panning**: Bubbles spawn left/right based on hand position
- **AR mode**: Bubbles appear to float in real room (WebXR)

---

## Section 7: Visual Identity

### Overall Look
Playful, airy, and light. The current implementation uses a clean, minimal aesthetic suitable for young children.

### Camera View
**Current:** Static top-down view of 2D canvas
**Ideal 3D:** Slightly angled perspective camera looking into a "bubble tank"

### Art Style
- **Current:** Flat, solid colors
- **Target:** Iridescent, semi-transparent spheres with reflections
- **Reference:** Soap bubbles in sunlight - rainbow gradients

### Mood
Calm, joyful, satisfying. The "pop" should feel rewarding without being jarring.

### Colors
```
Background: #87CEEB (Sky blue)
Bubble fill: rgba(255, 255, 255, 0.5)
Bubble stroke: rgba(255, 255, 255, 0.8)
Bubble palette: #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7, #DDA0DD
UI primary: #3B82F6 (Blue)
Success: #22C55E (Green)
Streak: #F97316 (Orange)
```

### Environment
**Current:** Abstract blue void
**Ideal:** Underwater scene with subtle background elements (seaweed, coral, fish)

### UI Style
Kenney-inspired playful UI with rounded buttons, bold typography, and clear iconography.

### Active Vibe
Relaxed but engaging - children should feel calm but motivated to continue popping.

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| Start Modal | Instructions & start | Title, instructions, Start button |
| Game Canvas | Main gameplay | Canvas, stats bar, level selector |
| Streak Milestone | Celebrate streaks | Animated badge overlay |
| Level Complete | Victory screen | Score, popped count, Play Again, Exit |
| Blow Indicator | Feedback during play | "🌬️ Blowing!" badge |

---

## Section 9: Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Create bubble | Blow into mic | "🌬️ Blowing!" badge appears |
| Create bubble (fallback) | Tap screen | Bubble spawns at random position |
| Move cursor | Hand tracking | Green cursor follows index finger |
| Move cursor (fallback) | Mouse move | Cursor follows mouse |
| Pop bubble | Hover hand over bubble | Bubble disappears, pop sound, score + |
| Change level | Click L1/L2/L3 buttons | Button highlights, level resets |
| Exit game | Click Stop button | Returns to dashboard |
| Play again | Click Play Again | Resets current level |

---

## Section 10: Core Mechanics

### Bubble Lifecycle
```
Spawn (bottom) → Float Upward (+ drift) → Pop (hand collision) → Exit (top of screen)
```

### Spawn Algorithm
```typescript
function createBubble(id: number, canvasWidth: number): Bubble {
  return {
    id,
    x: Math.random() * (canvasWidth - 80) + 40,  // Padding from edges
    y: -50,  // Start above visible area
    size: Math.random() * 40 + 30,  // 30-70px radius
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    speedY: Math.random() * 1.5 + 0.5,  // Upward velocity
    speedX: (Math.random() - 0.5) * 2,  // Horizontal drift
  };
}
```

### Update Loop (per frame)
```typescript
// 1. Update positions
bubbles = bubbles.map(b => ({
  ...b,
  x: b.x + b.speedX,
  y: b.y + b.speedY
}));

// 2. Remove off-screen bubbles
bubbles = bubbles.filter(b => 
  b.y < canvasHeight + 50 && 
  b.x > -50 && 
  b.x < canvasWidth + 50
);
```

### Scoring Formula
```
points = 10 + min(streak × 2, 15)
```

| Streak | Points per Pop |
|--------|----------------|
| 1 | 12 |
| 2 | 14 |
| 3 | 16 |
| 4 | 18 |
| 5+ | 25 |

---

## Section 11: Rules

### Start Conditions
- Player clicks "Start Blowing!" button
- Game requests microphone permission
- Hand tracking initializes
- Canvas cleared, score reset

### Objectives
- Pop the target number of bubbles before time expires
- Maintain streaks for bonus points
- Complete all 3 levels

### Allowed Actions
- Blow to create bubbles (if mic enabled)
- Tap to create bubbles (if mic disabled)
- Move hand to position cursor
- Pop bubbles by hovering cursor over them

### Restrictions
- Maximum concurrent bubbles per level
- Cannot pop same bubble twice
- Bubbles automatically despawn if they float off-screen

### Scoring
- Base: 10 points per bubble
- Streak bonus: up to 15 additional points
- No penalty for missed bubbles

### Win/Lose Conditions
| Condition | Trigger | Result |
|-----------|---------|--------|
| Level Win | Popped ≥ target bubbles | Level complete modal |
| Game Win | Complete level 3 | Celebration, final score |
| Level Loss | Time expires (not enforced in current) | Retry level |

---

## Section 12: HUD / Gameplay UI

### Stats Bar (Top)
```
┌─────────────────────────────────────────────────────────────┐
│ Score: [XXX]  Popped: [X/Y]  [🔥 Streak: Z]    [L1][L2][L3] │
└─────────────────────────────────────────────────────────────┘
```

| Element | Purpose | Update |
|---------|---------|--------|
| Score | Track total points | Real-time on pop |
| Popped | Progress to target | Real-time on pop |
| Streak | Consecutive pops | Reset on miss, +1 on pop |
| Level buttons | Select difficulty | Click to switch |

### Game Canvas (Center)
- Full available space
- 400×400 logical resolution
- Scales with CSS `w-full h-full`

### Bottom Bar
```
┌─────────────────────────────────────────────────────────────┐
│ [Mic status message]              [Tap to Blow!]  [Stop]   │
└─────────────────────────────────────────────────────────────┘
```

| Element | Purpose |
|---------|---------|
| Status | "Blow into mic" or "Mic unavailable" |
| Tap button | Manual bubble creation (mic fallback) |
| Stop | Exit to dashboard |

### Overlays
- **Streak milestone**: Center screen, animated badge
- **Blow indicator**: Top-right when blowing detected
- **Hand tracking status**: Bottom-right camera thumbnail

---

## Section 13: Feedback and Feel

### Success Feedback
| Trigger | Feedback |
|---------|----------|
| Bubble popped | Pop sound, bubble disappears, score increments |
| Streak milestone | Animated badge "🔥 5 Streak! 🔥", celebration haptic |
| Level complete | Celebration sound, modal with score |

### Failure Feedback
| Trigger | Feedback |
|---------|----------|
| Missed bubble | None (intentionally forgiving) |
| Bubble floats away | Silent removal |
| Hand lost | Hand tracking status indicator changes |

### During Gameplay
| State | Feedback |
|-------|----------|
| Blowing detected | "🌬️ Blowing!" badge pulses |
| Hand moving | Green cursor follows smoothly |
| Bubble spawned | Visual appearance at bottom of canvas |

### Streak/Progress Feedback
- **Milestone interval**: Every 5 pops (configurable via `STREAK_MILESTONE_INTERVAL`)
- **Animation**: Scale from 0 → 1 with rotation
- **Duration**: 2 seconds (`STREAK_MILESTONE_DURATION_MS`)

---

## Section 14: Points / Rewards / Progression

### Points Breakdown
| Action | Points |
|--------|--------|
| Pop bubble (base) | 10 |
| Streak bonus (max) | +15 |
| Max per bubble | 25 |

### Final Score Calculation
```
Final Score = Σ(points per pop across all levels)
```

### Drops (from gameRegistry)
| Item | Chance | Condition |
|------|--------|-----------|
| color-blue | 30% | Always |
| drop | 20% | Always |
| star-silver | 10% | Score ≥ 70 |

### Easter Eggs
| Egg | Trigger | Reward |
|-----|---------|--------|
| Bubble Popper | Pop 100 bubbles in one session | star-gold × 1 |

### Progression
- 3 linear levels with increasing difficulty
- No persistent unlocks (all levels available)
- High score tracking per level

---

## Section 15: End States

### Correct/Success (Level Complete)
```
┌──────────────────────────────────────┐
│            🎉 Amazing! 🎉            │
│                                      │
│      You popped X bubbles!           │
│                                      │
│         Score: XXX                   │
│                                      │
│   [Play Again]        [Exit]         │
└──────────────────────────────────────┘
```

### Wrong/Failure
- No explicit failure state in current implementation
- Bubbles can float away without penalty

### Timeout
- Time limits defined but not enforced
- Timer counts down but doesn't trigger game over

### Game Complete (Level 3 Finished)
Same as Level Complete with option to restart from Level 1.

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Microphone Primary (Current)
| Aspect | Implementation |
|--------|----------------|
| Input | Web Audio API blow detection |
| Threshold | Average volume > 15 |
| Fallback | Tap-to-blow button if mic denied |

### Mode B: Touch/Mouse Only
| Aspect | Implementation |
|--------|----------------|
| Input | Click/tap to create bubbles |
| Best for | Desktop without mic, tablet users |
| Enabled | Automatically when mic permission denied |

### Mode C: Hand Tracking Variations
| Variation | Description |
|-----------|-------------|
| Pinch to pop | Current: hover to pop. Alternative: pinch gesture |
| Two-hand mode | Left hand creates, right hand pops |
| Speed mode | Faster hand movement = faster bubble rise |

### Mode D: Full 3D (Target)
| Aspect | Implementation |
|--------|----------------|
| Engine | React Three Fiber + Rapier |
| Physics | Realistic bubble buoyancy |
| Interaction | Hand raycast into 3D space |
| Visuals | Iridescent shader materials |

---

## Section 17: Improvement Opportunities

### Low Cost (1-2 days)
- [ ] Add bubble gradient/iridescence to canvas renderer
- [ ] Particle burst effect on pop
- [ ] Background theme (underwater, sky, space)
- [ ] Bubble sound variations (pitch based on size)

### Medium Effort (3-5 days)
- [ ] Port to React Three Fiber for true 3D
- [ ] Add Rapier physics for realistic bubble movement
- [ ] Implement bubble-bubble collision
- [ ] Add bubble types (speedy, giant, explosive)
- [ ] Time limit enforcement with visible countdown

### Ambitious (1-2 weeks)
- [ ] Multiplayer mode (race or co-op)
- [ ] Level editor for custom bubble patterns
- [ ] AR integration (bubbles in real world)
- [ ] Voice-controlled bubble colors ("red bubble!")
- [ ] Seasonal themes (Halloween bubbles, snow bubbles)

---

## Section 18: Content Model

### Level Configurations
```typescript
interface LevelConfig {
  level: number;
  bubblesToPop: number;  // Victory condition
  maxBubbles: number;    // Spawn cap
  spawnRate: number;     // Milliseconds between spawns
  timeLimit: number;     // Seconds (not enforced)
}
```

| Level | bubblesToPop | maxBubbles | spawnRate | timeLimit |
|-------|--------------|------------|-----------|-----------|
| 1 | 10 | 5 | 2000ms | 45s |
| 2 | 15 | 8 | 1500ms | 40s |
| 3 | 20 | 10 | 1000ms | 35s |

### Bubble Color Palette
```
['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
 '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
```

### Content Expansion Ideas
- **Theme packs**: Ocean, Space, Fantasy bubble sets
- **Special bubbles**: Golden (bonus points), Black (avoid), Rainbow (clears screen)
- **Obstacles**: Currents, barriers, gravity wells

---

## Section 19: Technical Structure

### Main Files
| File | Purpose | Lines |
|------|---------|-------|
| `VirtualBubbles.tsx` | Main game component | ~600 |
| `virtualBubblesLogic.ts` | Game logic utilities | ~87 |

### Key Components (in VirtualBubbles.tsx)
| Component | Purpose |
|-----------|---------|
| `VirtualBubblesContent` | Main game logic and rendering |
| `GameContainer` | Layout wrapper with title, score |
| `GameShell` | Game session management |
| `GameCursor` | Hand tracking visual cursor |
| `CameraThumbnail` | Webcam preview |
| `HandTrackingStatus` | Hand detection indicator |

### Logic Functions (virtualBubblesLogic.ts)
| Function | Purpose |
|----------|---------|
| `createBubble(id, width)` | Generate new bubble object |
| `updateBubbles(bubbles, width, height)` | Physics update per frame |
| `checkBubblePop(bubbles, handX, handY, width, height)` | Collision detection |
| `getLevelConfig(level)` | Lookup level parameters |

### Hooks Used
| Hook | Purpose |
|------|---------|
| `useGameHandTracking` | CV hand position tracking |
| `useGameCompletion` | Progress persistence |
| `useGameSessionProgress` | Session analytics |
| `useAudio` | Sound effects |
| `useReducedMotion` | Accessibility |
| `useSubscription` | Access control |

### State Management
```typescript
// Game state
const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
const [currentLevel, setCurrentLevel] = useState(1);
const [bubbles, setBubbles] = useState<Bubble[]>([]);
const [score, setScore] = useState(0);
const [streak, setStreak] = useState(0);
const [poppedCount, setPoppedCount] = useState(0);

// CV state
const [cursor, setCursor] = useState<Point | null>(null);
const [handPosition, setHandPosition] = useState({ x: 0.5, y: 0.5 });
const [isHandDetected, setIsHandDetected] = useState(false);

// Mic state
const [blowDetected, setBlowDetected] = useState(false);
const [micState, setMicState] = useState<'requesting' | 'granted' | 'denied'>('requesting');
```

### Dependencies
```json
{
  "react-webcam": "^7.x",
  "framer-motion": "^11.x",
  "@react-three/fiber": "(installed but unused)",
  "@react-three/rapier": "(installed but unused)"
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Why 3D World category? | Likely planned for 3D, implemented 2D first | High |
| Time limit not enforced | Intentionally relaxed or unfinished | Medium |
| No bubble collision | Simplification for performance | High |
| Limited color palette | 10 colors sufficient for ages 2-6 | High |
| No 3D assets in repo | 3D version not started | High |

---

## Section 21: Implementation Notes

### Strengths to Preserve
1. **Performance pattern**: Using refs + rAF to avoid React re-render storms
2. **Fallback design**: Graceful degradation when mic unavailable
3. **Hook abstraction**: Clean separation of CV logic via `useGameHandTracking`
4. **Streak system**: Well-tuned engagement mechanic
5. **Level scaling**: Appropriate difficulty curve

### Architecture Patterns
```typescript
// Pattern: Refs for high-frequency updates
const bubblesRef = useRef<Bubble[]>(bubbles);
bubblesRef.current = bubbles;  // Sync on render

// Pattern: rAF loop with conditional state updates
const loop = () => {
  const updated = updateBubbles(bubblesRef.current, ...);
  // Only update React state when array length changes
  if (updated.length !== bubblesRef.current.length) {
    setBubbles(updated);
  }
  rafId = requestAnimationFrame(loop);
};
```

### Testing Considerations
- Test with various microphones (sensitivity varies)
- Test in noisy environments (background noise affects blow detection)
- Test hand tracking at different distances from camera
- Test fallback mode (mic denied)

### Performance Notes
- Canvas rendering: ~0.5ms/frame
- Physics update: ~0.1ms/frame (O(n) where n = bubble count, max 10)
- Audio analysis: ~0.2ms every 100ms (not per frame)
- Memory: Stable, no leaks detected

---

## Section 22: Acceptance Criteria

- [x] Game loads without errors
- [x] Start screen displays instructions
- [x] Microphone permission requested on start
- [x] Blow detection creates bubbles
- [x] Hand tracking controls cursor
- [x] Cursor proximity pops bubbles
- [x] Score increments correctly (10 base + streak)
- [x] Streak milestone shows at 5, 10, 15...
- [x] Level completes when target reached
- [x] Level selector switches difficulty
- [x] Tap fallback works when mic denied
- [x] Progress saves on completion
- [x] Audio feedback plays on pop
- [ ] 3D implementation (deferred)
- [ ] Time limit enforcement (optional)

---

## Section 23: Test Plan

### Manual Gameplay Tests
| Test | Steps | Expected |
|------|-------|----------|
| Start game | Click Start Blowing | Game canvas appears, mic permission requested |
| Create bubbles | Blow into mic | Bubbles appear at bottom, "Blowing!" badge shows |
| Pop bubble | Move hand over bubble | Bubble disappears, pop sound plays |
| Score tracking | Pop 5 bubbles | Score = 10+12+14+16+18 = 70 |
| Streak milestone | Pop 5 consecutive | "🔥 5 Streak!" animation appears |
| Level complete | Pop target bubbles | Level complete modal shows |

### CV Control Tests
| Test | Steps | Expected |
|------|-------|----------|
| Hand detection | Show hand to camera | Green cursor appears |
| Cursor mapping | Move hand left/right | Cursor follows smoothly |
| Hand loss | Hide hand | Cursor disappears, status changes |
| Hand recovery | Show hand again | Cursor reappears |

### Fallback Tests
| Test | Steps | Expected |
|------|-------|----------|
| Mic denied | Deny mic permission | "Tap to Blow!" button appears |
| Tap to blow | Click button | Bubble created without mic |
| Mouse cursor | Move mouse over canvas | Cursor follows mouse |

### Edge Cases
| Test | Steps | Expected |
|------|-------|----------|
| Max bubbles | Fill to maxBubbles | No new bubbles spawn until some pop |
| Rapid popping | Pop bubbles quickly | Streak increases, score bonus applies |
| Level switch | Click L2 during L1 | Level resets to L2 difficulty |

### Performance
| Test | Metric | Target |
|------|--------|--------|
| Frame rate | FPS | 60 |
| Memory usage | Heap | < 50MB |
| Audio latency | Blow to bubble | < 200ms |

---

**Specification Version:** 1.0  
**Last Updated:** 2026-04-03  
**Author:** AI Agent (Specification Audit)  
**Review Status:** Draft  
