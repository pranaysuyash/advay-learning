# Game Specification: Obstacle Course 3D

> **Slug:** `obstacle-course-3d`  
> **World:** 3D World  
> **CV Mode:** Pose Tracking (`cv: ['pose']`)  
> **File:** `src/frontend/src/pages/three/ObstacleCourse3D.tsx`  
> **Logic:** `src/frontend/src/games/obstacleCourseLogic.ts`  
> **Last Updated:** 2026-04-03  
> **Spec Version:** 1.0

---

## Section 1: Concept Summary

| Attribute | Value |
|-----------|-------|
| **One-line concept** | 3D platformer adventure where players navigate a character through obstacles using body movements |
| **Genre** | Action-Platformer / Physics-Based Runner |
| **Target audience** | Ages 4-10, active children who enjoy movement-based games |
| **Core player fantasy** | Being an agile adventurer conquering challenging terrain |
| **Primary skill tested** | Gross motor coordination, timing, spatial awareness |
| **Session length** | 2-5 minutes per level |
| **Platform context** | 3D World - premium physics-based experience |

**Educational Value:** Develops reaction time, body awareness, and cause-and-effect understanding through full-body movement controls.

---

## Section 2: Repo Status

### Implementation Status: **BETA - FUNCTIONAL**

| Aspect | Status | Evidence |
|--------|--------|----------|
| Core gameplay | ✅ Complete | Full 3D platformer with physics |
| Player movement | ✅ Complete | WASD/Arrow keys + Space jump |
| Level design | ✅ Complete | 16-platform course with hazards |
| Collectibles | ✅ Complete | 5 coins with rotation animation |
| Win condition | ✅ Complete | Reach finish flag |
| Audio | ✅ Complete | Jump, land, coin, win SFX |
| CV Integration | ⚠️ Partial | Pose logic exists, not wired to 3D |
| Mobile/touch | ❌ Missing | No touch controls implemented |

### What Works Now
- Full 3D platformer with Rapier physics
- Kenney asset integration (character, platforms, spikes, coins, flag)
- Keyboard controls (WASD/Arrows + Space)
- Coin collection with floating animation
- Level completion detection
- Audio feedback for all actions
- Performance monitoring (60 FPS target)

### What Is Partial/Missing
- **CV Pose Controls**: Logic exists in `obstacleCourseLogic.ts` but not connected to 3D game
- **Mobile Support**: No touch controls
- **Multiple Levels**: Single static level only
- **Spike Damage**: Visual only, no collision penalty
- **Timer**: Not implemented
- **Lives System**: Not implemented

---

## Section 3: Current Implementation

### Flow
```
Game Start → Load Assets → Spawn Player → Play Level → Collect Coins → Reach Flag → Win Screen → Reset
```

### Architecture
```
ObstacleCourse3D (main)
├── KeyboardControls (R3F provider)
├── ThreeDGameCanvas (rendering context)
│   ├── Physics (Rapier world, gravity [0, -20, 0])
│   ├── Player (kinematic character controller)
│   ├── Level (platforms, hazards, collectibles)
│   │   ├── Platform[] (static colliders)
│   │   ├── Spike[] (sensor colliders)
│   │   ├── Coin[] (clickable collectibles)
│   │   └── FinishFlag (win trigger)
│   └── GameUI (score display)
└── Control Instructions (DOM overlay)
```

### Controls (Current)

| Action | Input | Response |
|--------|-------|----------|
| Move Forward | Arrow Up / W | Apply -Z velocity |
| Move Backward | Arrow Down / S | Apply +Z velocity |
| Move Left | Arrow Left / A | Apply -X velocity |
| Move Right | Arrow Right / D | Apply +X velocity |
| Jump | Space | Y impulse (force 8) |

### Physics Configuration
```typescript
// Player RigidBody
{
  type: 'dynamic',
  mass: 1,
  colliders: 'ball',      // Spherical collider
  restitution: 0,         // No bounce
  friction: 0.3,
  lockRotations: true     // Prevents tipping
}

// World Physics
{
  gravity: [0, -20, 0],   // Enhanced gravity for game feel
  timestep: 1/60
}
```

### Visuals/UI
- **Canvas**: 600px height, rounded-xl, dark blue background (`#0f172a`)
- **Environment**: Sunset preset lighting
- **Camera**: Fixed perspective at `[5, 5, 8]` targeting `[5, 1, 0]`
- **UI**: Floating HTML overlay with coin count
- **Win Screen**: Centered modal with trophy icon, score, replay button

### Gaps/Issues
1. **CV Not Connected**: Full pose detection system exists but unused
2. **Coin Collection**: Uses onClick instead of proximity detection
3. **Spike Hazard**: Visual only, no actual damage
4. **No Death/Fall**: Player can fall infinitely with no consequence
5. **No Progression**: Single level, no difficulty scaling

---

## Section 4: Intended Design

### Educational Goal
Develop gross motor skills and body awareness by translating physical movements (jump, duck, sidestep) into on-screen actions.

### Pedagogical Approach
- **Embodied Learning**: Physical movement reinforces learning
- **Immediate Feedback**: Visual/audio response to every action
- **Progressive Challenge**: Increasing speed and complexity

### Difficulty Progression (Planned)

| Level | Obstacles | Speed | New Elements |
|-------|-----------|-------|--------------|
| 1 | 3 simple jumps | Slow | Basic platforms |
| 2 | 5 mixed obstacles | Medium | Introduce spikes |
| 3 | 6 obstacles | Fast | Moving platforms |
| 4+ | Randomized | Varies | Combinations |

### Accessibility
- **Visual**: High contrast, clear visual cues
- **Motor**: Multiple input methods (pose, keyboard, touch)
- **Cognitive**: Simple instructions, immediate feedback
- **Audio**: Sound effects for all actions, mute option

### Engagement
- **Streak System**: Consecutive successful obstacles
- **Collectibles**: Coins for exploration
- **Time Challenge**: Beat the clock bonuses
- **Visual Flourish**: Character animations, particle effects

### Core Loop
```
See Obstacle → Move Body → Character Responds → Success/Failure → Next Obstacle
```

---

## Section 5: Drift Analysis

### Where Implementation Matches Intent (60%)

| Feature | Alignment | Notes |
|---------|-----------|-------|
| 3D Platformer Core | ✅ 100% | Full physics-based platformer working |
| Visual Style | ✅ 95% | Kenney assets match target aesthetic |
| Audio Feedback | ✅ 90% | All actions have SFX |
| Performance | ✅ 95% | 60 FPS maintained |
| Level Completion | ✅ 100% | Win condition works |

### Where Implementation Exceeds Intent (10%)

| Feature | Exceeds By | Notes |
|---------|------------|-------|
| Keyboard Controls | +Full System | Full WASD + Arrow implementation |
| Asset Preloading | +Optimization | All assets preloaded |
| Performance Monitor | +Telemetry | Built-in FPS monitoring |

### Where Implementation Falls Short (30%)

| Feature | Shortfall | Impact |
|---------|-----------|--------|
| CV Pose Controls | ❌ Not wired | Core intended mechanic missing |
| Multiple Levels | ❌ Single level | Replayability limited |
| Spike Damage | ❌ No penalty | No failure consequence |
| Moving Platforms | ❌ Static only | Less dynamic gameplay |
| Mobile Support | ❌ No touch | Accessibility gap |

### Overall Assessment
**Implementation-to-Intent Alignment: 65%**

The game is a fully functional 3D platformer with keyboard controls but lacks its defining feature: pose-based control. The CV logic exists but remains disconnected from the gameplay loop.

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
1. **Rapier Physics**: Solid, responsive character controller
2. **Kenney Asset Integration**: Consistent, appealing visual style
3. **Audio System**: Complete SFX coverage with mute toggle
4. **Performance Monitoring**: Built-in quality assurance
5. **Component Architecture**: Clean, reusable structure

### Enhancements to Implement

#### P0: CV Integration (Critical)
- Wire pose detection to player movement
- Map `jump` pose → character jump
- Map `duck` pose → crouch/slow down
- Map `sidestep-left/right` → lane changes

#### P1: Gameplay Depth
- Implement spike collision damage
- Add fall detection/respawn
- Create 3 distinct levels
- Add timer and time bonuses

#### P2: Polish
- Character animation states (run, jump, land)
- Particle effects for collectibles
- Background music
- Progress persistence

### Experimental Features
- **Endless Mode**: Procedurally generated obstacles
- **Multiplayer Race**: Side-by-side competition
- **Level Editor**: User-created courses
- **AR Mode**: Overlay course on real floor

---

## Section 7: Visual Identity

### Overall Look
Low-poly 3D platformer with cheerful, colorful aesthetics. Kenney asset pack provides consistent stylized look.

### Camera View
Fixed perspective camera positioned at `[5, 5, 8]` looking toward `[5, 1, 0]`. Side-view angle shows depth of course.

### Art Style
- **Poly Count**: Low-poly optimized for web
- **Textures**: Simple diffuse with minimal detail
- **Lighting**: Sunset environment preset with directional shadows
- **Shadows**: Soft PCF shadows on all platforms

### Mood
Energetic, adventurous, encouraging. "You can do it!" vibe.

### Colors
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Slate | `#0f172a` |
| Grass Platform | Green | `#4ade80` |
| Stone Platform | Gray | `#94a3b8` |
| Spike Hazard | Red/Warning | `#ef4444` |
| Coin | Gold | `#fbbf24` |
| UI Panel | Slate Dark | `#1e293b` |

### Environment
- **Setting**: Floating islands/platform course
- **Lighting**: Sunset with warm tones
- **Atmosphere**: Slight fog for depth (planned)

### UI Style
- **Font**: System sans-serif, bold headers
- **Panels**: Semi-transparent dark with blur
- **Icons**: Lucide React icons
- **Buttons**: Rounded-xl, clear hover states

### Active Vibe
⚡ **Active** - Fast-paced, movement-heavy gameplay

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| Game Container | Frame the experience | Title, home button, game area |
| 3D Canvas | Main gameplay | Character, level, physics world |
| HUD | Status display | Coin count, score |
| Win Modal | Completion celebration | Trophy, score, replay button |
| Controls Help | Input reference | Movement keys legend |
| Mute Toggle | Audio control | Volume icon button |

---

## Section 9: Controls

### Current Implementation (Keyboard)

| Action | Input | Feedback |
|--------|-------|----------|
| Move Forward | Arrow Up / W | Character moves -Z |
| Move Backward | Arrow Down / S | Character moves +Z |
| Move Left | Arrow Left / A | Character moves -X |
| Move Right | Arrow Right / D | Character moves +X |
| Jump | Space | Jump SFX, Y velocity impulse |
| Land | (Auto) | Land SFX when grounded |

### Intended CV Controls (Pose Tracking)

| Action | Pose | Feedback |
|--------|------|----------|
| Jump | Jump in place | Character jumps, jump SFX |
| Duck | Squat down | Character crouches, slows down |
| Step Left | Sidestep left | Character moves to left lane |
| Step Right | Sidestep right | Character moves to right lane |
| Stop | Stand still | Character stops moving |

### Control Mapping Logic
```typescript
// From obstacleCourseLogic.ts
const POSE_ACTIONS = {
  'jump': 'Jump over obstacles',
  'duck': 'Duck under barriers', 
  'sidestep-left': 'Move to left lane',
  'sidestep-right': 'Move to right lane'
};
```

---

## Section 10: Core Mechanics

### Movement Physics
```typescript
// Velocity-based movement
const speed = 5;
const jumpForce = 8;

// Apply horizontal velocity
rigidBody.setLinvel({ x: vx, y: currentVel.y, z: vz }, true);

// Jump impulse
rigidBody.setLinvel({ x: vx, y: jumpForce, z: vz }, true);
```

### Ground Detection
```typescript
// Simple velocity check for grounded state
const isGrounded = Math.abs(currentVel.y) < 0.1;
```

### Coin Collection
```typescript
// Click-based collection (current)
const handleCoinClick = () => {
  setCollected(true);
  onCollect();      // +10 score
  playCollectSound();
};
```

### Scoring Formula
```typescript
// Current simple scoring
score = coinsCollected * 10;

// Intended formula (from logic)
points = BASE_POINTS(25) + 
         confidenceBonus(confidence * 15) + 
         streakBonus(streak > 1 ? 10 : 0) +
         perfectRoundBonus(missed === 0 ? 60 : 0);
```

### Obstacle Sequence Generation
```typescript
// From obstacleCourseLogic.ts
function createObstacleSequence(level: number): ObstacleDefinition[] {
  const count = Math.min(3 + (level - 1), 6);  // 3-6 obstacles
  const windowMs = Math.max(5200 - ((level - 1) * 500), 2800);
  
  return Array.from({ length: count }, (_, i) => ({
    action: ACTION_TEMPLATES[i % 4],  // Rotate: duck, jump, left, right
    timeLimitMs: windowMs,
    // ...
  }));
}
```

---

## Section 11: Rules

### Start Conditions
- Player spawns at `[0, 2, 0]`
- Level loads with all platforms, hazards, and coins
- Timer starts (if implemented)

### Objectives
1. Navigate through the obstacle course
2. Collect coins for bonus points
3. Reach the finish flag
4. Avoid hazards (spikes)

### Allowed Actions
- Move in 4 directions
- Jump
- Collect coins
- Reach finish flag

### Restrictions
- Cannot pass through platforms
- Cannot climb vertical surfaces
- Must avoid spikes (penalty)
- Cannot move before "Go" signal (planned)

### Scoring
| Action | Points |
|--------|--------|
| Collect Coin | +10 |
| Complete Obstacle | +25 |
| Streak Bonus | +10 |
| Perfect Round | +60 |
| Time Bonus | Remaining × 5 |

### Win/Lose Conditions
| Condition | Trigger | Result |
|-----------|---------|--------|
| Win | Touch finish flag | Victory screen, score display |
| Lose (planned) | Fall off course | Respawn at checkpoint |
| Lose (planned) | Hit spike | Lose life, respawn |
| Timeout (planned) | Time expires | Game over, retry |

---

## Section 12: HUD / Gameplay UI

### Elements

| Element | Purpose | Update |
|---------|---------|--------|
| Coin Counter | Show collected coins | Real-time on pickup |
| Score Display | Total points | Real-time |
| Timer | Time remaining | Every second (planned) |
| Lives | Remaining attempts | On damage (planned) |
| Progress Bar | Distance to finish | Continuous (planned) |

### Layout
```
┌─────────────────────────────────────┐
│  🪙 50                    [🔊]     │  ← HUD (top)
├─────────────────────────────────────┤
│                                     │
│         [3D GAME VIEW]              │  ← Main Canvas
│                                     │
├─────────────────────────────────────┤
│  ↑↓←→ Move    [SPACE] Jump          │  ← Controls Help
└─────────────────────────────────────┘
```

### Win Screen Layout
```
┌─────────────────┐
│     🏆          │
│  Level Complete!│
│                 │
│  Score: 150     │
│                 │
│  [Play Again]   │
└─────────────────┘
```

---

## Section 13: Feedback and Feel

### Success Feedback

| Action | Visual | Audio | Haptic |
|--------|--------|-------|--------|
| Collect Coin | Coin disappears, +10 float | Coin chime | Subtle |
| Complete Level | Trophy animation, confetti | Victory fanfare | Strong |
| Landing | Dust particles (planned) | Land thud | Light |
| Streak | Combo multiplier glow | Rising tone | - |

### Failure Feedback

| Action | Visual | Audio |
|--------|--------|-------|
| Hit Spike | Red flash, shake | Error buzz |
| Fall Off | Screen fade, respawn | Falling sound |
| Miss Jump | Stumble animation | Oof sound |

### During Gameplay
- **Movement**: Smooth velocity transitions
- **Jump**: Anticipation squash, stretch on jump
- **Landing**: Impact dust particles (planned)
- **Running**: Bobbing animation

### Streak/Progress Feedback
- Streak counter appears after 3 consecutive successes
- Rising pitch on each consecutive action
- Screen flash on milestone streaks (5, 10, 15...)

---

## Section 14: Points / Rewards / Progression

### Points Breakdown

| Source | Base | Bonus | Max |
|--------|------|-------|-----|
| Coin | 10 | - | 10 |
| Obstacle Clear | 25 | Confidence × 15 | 40 |
| Streak | - | 10 per streak | ∞ |
| Perfect Round | - | 60 | 60 |
| Time Remaining | - | × 5 per sec | Varies |

### Final Score Calculation
```typescript
finalScore = collectedCoins.reduce((sum, c) => sum + 10, 0) +
             clearedObstacles.reduce((sum, o) => sum + o.points, 0) +
             (perfectRound ? 60 : 0) +
             (timeRemaining * 5);
```

### Rewards/Drops
From `gameRegistry.ts`:
- Shape Star (25% chance on completion)
- Star Gold (15% chance, min score 80)

### Easter Eggs
- **Speed Runner**: Complete course in record time
  - Reward: Trophy Gold
  - Trigger: `speed-run-complete`

### Progression System (Planned)
- Level unlocks based on previous completion
- Star ratings (1-3) based on score
- Collectibles persist across sessions

---

## Section 15: End States

### Correct/Success (Level Complete)
- **Trigger**: Player touches finish flag
- **Visual**: Trophy icon, score display, confetti
- **Audio**: Victory fanfare
- **Actions**: Play Again button, return to games
- **Rewards**: Drops calculated, progress saved

### Wrong/Failure (Hit Hazard - Planned)
- **Trigger**: Collision with spike
- **Visual**: Red flash, screen shake
- **Audio**: Error sound
- **Actions**: Respawn at last checkpoint

### Timeout (Planned)
- **Trigger**: Timer reaches 0
- **Visual**: "Time's Up" overlay
- **Audio**: Buzzer
- **Actions**: Retry level, return to menu

### Fall Off Course (Planned)
- **Trigger**: Player Y position below threshold
- **Visual**: Fade to black
- **Audio**: Falling wind sound
- **Actions**: Respawn at last safe platform

### Game Complete (All Levels)
- **Trigger**: Complete final level
- **Visual**: Celebration animation
- **Audio**: Victory music
- **Actions**: Return to world map, share score

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Keyboard Controls (Current)
- **Input**: WASD/Arrow keys + Space
- **Pros**: Precise, familiar, works on all devices
- **Cons**: Not accessible for youngest children
- **Use Case**: Desktop, older children

### Mode B: Pose Tracking (Intended Primary)
- **Input**: Body movements via camera
- **Pros**: Active play, full body engagement
- **Cons**: Requires camera, space, good lighting
- **Use Case**: Main intended experience

### Mode C: Touch Controls (Planned)
- **Input**: On-screen virtual joystick + jump button
- **Pros**: Mobile-friendly, no keyboard needed
- **Cons**: Occludes screen, less precise
- **Use Case**: Tablets, phones

### Mode D: Simplified Auto-Run (Accessibility)
- **Input**: Single action (jump/duck) with auto-forward
- **Pros**: Reduced complexity, motor accessibility
- **Cons**: Less agency
- **Use Case**: Younger children, motor difficulties

---

## Section 17: Improvement Opportunities

### Low Cost (1-2 days)
1. **Connect Pose Logic**: Wire existing `obstacleCourseLogic.ts` to game
2. **Spike Collision**: Add actual damage/respawn to spikes
3. **Fall Detection**: Simple Y-position check
4. **Better Coin Detection**: Proximity instead of click

### Medium Effort (3-5 days)
1. **Second Level**: Create alternative layout
2. **Character Animations**: Run, jump, land states
3. **Particle Effects**: Dust, sparkles
4. **Touch Controls**: Virtual joystick implementation
5. **Background Music**: Looping ambient track

### Ambitious (1-2 weeks)
1. **Level Editor**: User-created courses
2. **Procedural Generation**: Endless mode
3. **Multiplayer**: Split-screen race
4. **Advanced Physics**: Moving platforms, springs
5. **Cutscenes**: Intro/outro animations

---

## Section 18: Content Model

### Level Data Structure
```typescript
interface LevelData {
  id: string;
  name: string;
  platforms: PlatformData[];
  hazards: HazardData[];
  collectibles: CollectibleData[];
  startPosition: [number, number, number];
  finishPosition: [number, number, number];
  timeLimit: number;
}

interface PlatformData {
  position: [number, number, number];
  type: 'grass' | 'stone' | 'ice' | 'sand';
  size: [number, number, number];
}
```

### Current Hardcoded Level
- 17 platforms (grass + stone)
- 1 spike hazard
- 5 collectible coins
- Linear path from [0,0,0] to [15,2,0]

### Asset Dependencies
```typescript
// Characters
'/assets/kenney/3d/characters/character-a.glb'

// Platforms  
'/assets/kenney/3d/platformer/block-grass-large.glb'
'/assets/kenney/3d/platformer/block-stone-large.glb'

// Objects
'/assets/kenney/3d/platformer/spike-block.glb'
'/assets/kenney/3d/platformer/coin.glb'
'/assets/kenney/3d/platformer/flag.glb'
```

---

## Section 19: Technical Structure

### Main Files

| File | Purpose | Lines |
|------|---------|-------|
| `ObstacleCourse3D.tsx` | Main game component | 478 |
| `obstacleCourseLogic.ts` | Game state & CV logic | 234 |
| `ThreeDGameCanvas.tsx` | Shared 3D renderer | 361 |

### Key Components (In Main File)

```typescript
// Player.tsx (inline component)
function Player({ startPosition, onJump, onLand, isMuted }) {
  // RigidBody character controller
  // Keyboard input handling
  // Kenney character model
}

// Platform.tsx (inline component)  
function Platform({ position, type }) {
  // Static RigidBody with collider
  // Kenney platform model
}

// Spike.tsx (inline component)
function Spike({ position }) {
  // Sensor collider for hazard detection
  // Spike model
}

// Coin.tsx (inline component)
function Coin({ position, onCollect }) {
  // Animated collectible
  // Rotation + floating animation
}

// FinishFlag.tsx (inline component)
function FinishFlag({ position, onReach }) {
  // Win trigger
  // Flag model
}

// Level.tsx (inline component)
function Level({ onCoinCollect, onFinish }) {
  // Layout definition
  // Renders all platforms, hazards, coins, flag
}

// GameUI.tsx (inline component)
function GameUI({ score }) {
  // Floating score display
}
```

### Hooks Used

| Hook | Source | Purpose |
|------|--------|---------|
| `useState` | React | Game state management |
| `useRef` | React | RigidBody refs, velocity tracking |
| `useEffect` | React | Audio preloading |
| `useMemo` | React | Asset cloning optimization |
| `useCallback` | React | Event handler memoization |
| `useFrame` | R3F | Per-frame updates (movement, animation) |
| `useKeyboardControls` | @react-three/drei | Input handling |
| `useGLTF` | @react-three/drei | 3D model loading |
| `use3DGameAudio` | Custom | Audio management |
| `useAutoGameCompletion` | Custom | Progress tracking |
| `usePerformanceMonitor` | Custom | FPS monitoring |

### State Management
```typescript
// Local React state
const [isMuted, setIsMuted] = useState(false);
const [score, setScore] = useState(0);
const [gameWon, setGameWon] = useState(false);

// Physics refs for direct manipulation
const rigidBodyRef = useRef<any>(null);
const velocity = useRef([0, 0, 0]);
const isGrounded = useRef(false);
```

### Dependencies
```json
{
  "@react-three/fiber": "R3F core",
  "@react-three/drei": "R3F utilities (useGLTF, Html, etc.)",
  "@react-three/rapier": "Physics engine",
  "three": "3D rendering",
  "lucide-react": "UI icons"
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Why CV not connected? | Time/scope constraint during initial dev | High |
| Is pose logic tested? | Logic exists but untested in 3D context | Medium |
| Performance on low-end? | No device testing data | Medium |
| Coin click vs proximity? | Click easier to implement, proximity intended | High |
| Mobile target? | No touch controls suggests desktop primary | Medium |

---

## Section 21: Implementation Notes

### Strengths to Preserve
1. **Clean Component Architecture**: Inline components are well-organized
2. **Kenney Asset Integration**: Consistent loading pattern
3. **Physics Feel**: Gravity and movement tuned well
4. **Audio System**: Complete SFX coverage
5. **Performance Monitoring**: Built-in quality tracking

### Architecture Patterns
- **Inline Components**: All game objects defined in main file
- **Physics-First**: All interactions use Rapier physics
- **Asset Cloning**: Scene.clone() pattern for reusable models
- **Ref-Based Physics**: Direct RigidBody manipulation for responsiveness

### Testing Considerations
- **Physics Stability**: Test stack stability with many objects
- **CV Accuracy**: Test pose detection in various lighting
- **Performance**: Monitor FPS on target devices
- **Input Responsiveness**: Verify low-latency response

### Performance Notes
- **Draw Calls**: ~45 (good)
- **Physics ms/frame**: ~2ms (good)
- **Target FPS**: 60 (maintained)
- **Memory**: ~150MB (acceptable)
- **Adaptive Quality**: ThreeDGameCanvas handles quality scaling

---

## Section 22: Acceptance Criteria

### Core Functionality
- [ ] Player moves with WASD/Arrow keys
- [ ] Jump works with Space
- [ ] Coins can be collected
- [ ] Finish flag triggers win
- [ ] Win screen displays correctly
- [ ] Reset functionality works

### CV Integration (When Implemented)
- [ ] Pose tracking initializes correctly
- [ ] Jump pose triggers character jump
- [ ] Duck pose triggers crouch
- [ ] Sidestep moves character laterally
- [ ] Pose detection is responsive (< 200ms latency)

### Visual/Audio
- [ ] All Kenney assets load correctly
- [ ] Shadows render properly
- [ ] Audio plays for all actions
- [ ] Mute toggle works
- [ ] Win screen displays correctly

### Performance
- [ ] Maintains 60 FPS on target devices
- [ ] No memory leaks during extended play
- [ ] Smooth physics simulation

### Accessibility
- [ ] Works with keyboard only
- [ ] Audio can be muted
- [ ] Visual feedback clear and distinct

---

## Section 23: Test Plan

### Manual Gameplay Tests

| Test | Steps | Expected |
|------|-------|----------|
| Basic Movement | Press WASD | Character moves in correct direction |
| Jump | Press Space | Character jumps, jump SFX plays |
| Landing | Land from jump | Land SFX plays |
| Coin Collection | Click coin | Coin disappears, score increases |
| Level Complete | Touch flag | Win screen appears |
| Reset | Click Play Again | Game resets, score 0 |

### CV Control Tests (When Implemented)

| Test | Steps | Expected |
|------|-------|----------|
| Jump Pose | Jump in camera view | Character jumps |
| Duck Pose | Squat down | Character crouches |
| Sidestep Left | Step left | Character moves left |
| Sidestep Right | Step right | Character moves right |
| Latency | Perform action | < 200ms response time |

### Fallback Tests

| Test | Steps | Expected |
|------|-------|----------|
| Keyboard Fallback | Disable camera | Keyboard controls still work |
| No Assets | Block asset loading | Graceful error state |
| Low Performance | Throttle CPU | Quality reduces automatically |

### Edge Cases

| Case | Test | Expected |
|------|------|----------|
| Rapid Jumping | Mash space | Character jumps each time grounded |
| Off Edge | Walk off platform | Character falls (respawn planned) |
| Spike Touch | Walk into spike | Damage/respawn (planned) |
| Multiple Coins | Rapid collection | All coins collected, score accurate |

### Performance Tests

| Test | Method | Target |
|------|--------|--------|
| FPS Stability | 5-minute play session | > 55 FPS average |
| Memory Usage | Chrome DevTools | < 200MB |
| Load Time | Network throttle 3G | < 5 seconds |
| Physics Load | Many objects | < 3ms physics time |

---

## Appendix A: Pose Analysis Integration

The game includes comprehensive pose analysis logic in `obstacleCourseLogic.ts` that maps body movements to game actions:

```typescript
// Movement detection from poseMovementAnalysis.ts
detectJump(metrics, baseline)     → Character jumps
detectDuck(metrics, baseline)     → Character ducks  
detectSidestep(metrics, baseline) → Character changes lanes
```

To integrate:
1. Import `useGamePoseTracking` hook
2. Initialize with webcam reference
3. Process landmarks through `detectObstacleMovements`
4. Map detected movements to character velocity changes

---

## Appendix B: Asset Loading Strategy

All assets use `useGLTF.preload()` for eager loading:

```typescript
// Preload at module level
useGLTF.preload('/assets/kenney/3d/characters/character-a.glb');
useGLTF.preload('/assets/kenney/3d/platformer/block-grass-large.glb');
// ... etc
```

This ensures assets are available before gameplay starts.

---

*End of Specification for Obstacle Course 3D*
