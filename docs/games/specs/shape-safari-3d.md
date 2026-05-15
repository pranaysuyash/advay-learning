# Shape Safari 3D - Game Specification

**Game ID:** shape-safari-3d  
**Slug:** shape-safari-3d  
**World:** 3D World  
**CV Mode:** Hand tracking (`cv: ['hand']`)  
**Code:** `src/frontend/src/pages/three/ShapeSafari3D.tsx`  
**Registry:** `src/frontend/src/data/gameRegistries/threeDWorld.ts`  

---

## Section 1: Concept Summary

| Attribute | Description |
|-----------|-------------|
| **One-line concept** | 3D shape discovery game where children find and identify geometric shapes in a virtual safari environment |
| **Genre** | Educational / Shape Recognition / Visual Scanning |
| **Target audience** | Ages 3-7, children learning geometric shapes and spatial relationships |
| **Core player fantasy** | "I'm an explorer on a safari adventure discovering hidden animal shapes!" |
| **Primary skill tested** | Shape recognition (cube, sphere, cylinder, cone), visual scanning, hand-eye coordination in 3D space |
| **Session length** | 3-5 minutes per level, 3 levels total (~10-15 minutes full game) |
| **Platform context** | 3D World game using React Three Fiber with hand tracking CV controls |

---

## Section 2: Repo Status

- **Implementation status:** ⚠️ Partial Implementation (Functional MVP)
- **What works now:**
  - Basic 3D scene with Three.js primitives (box, sphere, cylinder, cone)
  - Hand tracking cursor integration with 2D-to-3D projection
  - Shape hover detection with emissive highlighting
  - Level progression system (3 levels with increasing shape count)
  - Score tracking and celebration overlay
  - Forest environment with ground plane and procedural trees
  - Start screen and game flow
  - Audio feedback via use3DGameAudio hook
- **What is partial/missing:**
  - No actual "animals" - shapes are abstract geometric primitives without animal theming
  - No pinch-to-select interaction (currently uses click/tap only)
  - No proper raycasting for 3D selection (uses simplified 2D distance check)
  - Missing particle effects on shape collection
  - No shape name audio feedback (TTS not integrated)
  - Limited safari environment detail (no animated animals, water, sounds)
  - No progressive difficulty beyond shape count
  - No 2D fallback mode implementation
- **Evidence:**
  - Main file: `src/frontend/src/pages/three/ShapeSafari3D.tsx` (322 lines)
  - No separate logic file (all code inline)
  - Uses shared ThreeDGameCanvas component
  - CV integration via useGameHandTracking hook
- **Confidence level:** Medium - Core loop works but lacks polish and animal theming

---

## Section 3: Current Implementation

### Flow
1. **Start Screen:** Safari-themed overlay with shape preview icons, "Start Safari" button
2. **Level Generation:** Random shape generation with 3 + level count shapes
3. **Target Assignment:** Random shape type selected as target (cube, sphere, cylinder, cone)
4. **Gameplay Loop:**
   - Player moves hand to control cursor in 3D space
   - Hover over shapes triggers emissive glow effect
   - Click/tap on target shape type to "find" it
   - Shape disappears with score increment
   - Progress tracked until all target shapes found
5. **Level Complete:** New shapes generated with increased count
6. **Game Complete:** Celebration overlay after level 3

### Controls
| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand position | Cursor follows hand |
| Hover shape | Cursor proximity | Shape glows (emissiveIntensity: 0.5) |
| Select shape | Click/tap | Success SFX, shape disappears |
| Start game | Button click | Start SFX, transition to game |

### Mechanics
- **Shape Types:** Cube, Sphere, Cylinder, Cone (4 geometric primitives)
- **Shape Generation:** Random positions within 8×2×8 unit area
- **Level Scaling:** `shapes = 3 + currentLevel` (4, 5, 6 shapes for levels 1-3)
- **Target System:** One shape type designated as target per level
- **Selection Logic:** Distance check between cursor and shape position (2D projection)
- **Rotation:** All shapes rotate continuously (y-axis, 0.01 rad/frame)
- **Scoring:** 10 points per correct selection

### Visuals/UI
- **Environment:** Forest preset with ground plane (#8b7355), procedural trees
- **Background:** Sky blue (#87ceeb)
- **Shapes:** Standard materials with bright colors (red, blue, green, yellow, purple)
- **HUD:** Score (amber), Target shape type (purple), Level (blue)
- **Cursor:** CursorEmbodiment component (yellow hand cursor)
- **Start Screen:** Amber/brown safari theme with shape icons

### Gaps/Issues
- Selection uses 2D distance check rather than true 3D raycasting
- No pinch gesture required (reduces CV fidelity)
- Shapes lack animal theming (should be "shape-animals" not pure geometry)
- No celebration effects when finding shapes
- Limited environmental storytelling

---

## Section 4: Intended Design

### Educational Goal
- **Shape Recognition:** Identify 3D geometric forms (cube, sphere, cylinder, cone, pyramid)
- **Spatial Awareness:** Navigate 3D space using hand tracking
- **Visual Scanning:** Find specific targets among distractors
- **Vocabulary Building:** Learn shape names and descriptive attributes

### Pedagogical Approach
- **Discovery Learning:** Children explore the environment to find shapes
- **Visual Association:** Shapes should represent animals (cube = elephant, sphere = hippo)
- **Scaffolded Difficulty:** More shapes and distractors as levels progress
- **Immediate Feedback:** Visual and audio confirmation on success

### Difficulty Progression
| Level | Shapes | Target Count | Distractors | Complexity |
|-------|--------|--------------|-------------|------------|
| 1 | 4 | 2 | Simple | Single shape type target |
| 2 | 6 | 3 | Moderate | Target type + color matching |
| 3 | 8 | 4 | Complex | Multiple criteria (shape + color) |

### Accessibility
- Large hit targets (shapes scale to 1.2x on hover)
- High contrast colors
- No time pressure
- Clear visual highlighting
- Voice instructions (planned but not implemented)

### Core Loop
1. **Scan** - Look around the 3D environment for target shapes
2. **Identify** - Recognize the target shape type
3. **Navigate** - Move hand cursor to target shape
4. **Select** - Pinch/click to "collect" the shape
5. **Learn** - Hear shape name and see animal association
6. **Progress** - Continue until all targets found

---

## Section 5: Drift Analysis

### Where Implementation Matches Intent (70%)
✅ 3D environment with hand tracking controls  
✅ Shape recognition gameplay (find specific geometric forms)  
✅ Level progression with increasing difficulty  
✅ Visual feedback (hover highlighting)  
✅ Score tracking and celebration  
✅ Safari forest environment theme  

### Where Implementation Exceeds Intent (5%)
🌟 Clean React Three Fiber integration with shared canvas component  
🌟 Smooth shape rotation animation  
🌟 Adaptive quality rendering  

### Where Implementation Falls Short (25%)
⚠️ **No animal theming** - Shapes are abstract, not animal representations  
⚠️ **Simplified selection** - 2D distance check instead of 3D raycasting  
⚠️ **Missing pinch gesture** - Click only, no hand pinch required  
⚠️ **No TTS feedback** - Shape names not spoken aloud  
⚠️ **Limited environment** - Static trees, no animated animals or ambient effects  
⚠️ **No collection effects** - Missing particles, sounds, animations on find  
⚠️ **No 2D fallback** - Shape Safari 2D exists but not linked  

### Overall Assessment
**Alignment: 75%** - The core 3D shape-finding mechanic works, but the "safari" theme is underdeveloped. Shapes need animal associations, environment needs more life, and CV interaction needs pinch detection.

---

## Section 6: Recommended Canonical Version

### Current Strengths to Keep
1. **R3F Architecture** - Clean React Three Fiber integration
2. **Shared Canvas** - ThreeDGameCanvas provides consistent 3D experience
3. **Level Progression** - Scalable difficulty system
4. **Hand Tracking Integration** - CursorEmbodiment for CV feedback

### Enhancements to Implement
1. **Animal-Themed Shapes:** Each shape represents a safari animal
   - Cube → Elephant (square body)
   - Sphere → Hippo (round body)
   - Cylinder → Giraffe (long neck)
   - Cone → Lion mane or bird beak
2. **3D Raycasting Selection:** Proper hand-to-3D intersection detection
3. **Pinch Gesture:** Require pinch to grab shapes (higher CV fidelity)
4. **TTS Integration:** Speak shape names and animal associations
5. **Collection Effects:** Particles, sound, animation when shape found
6. **Living Environment:** Animated animals, ambient sounds, water features
7. **2D Fallback:** Link to Shape Safari 2D for non-CV users

### Experimental Features
- **Shape Builder Mode:** After finding shapes, use them to build structures
- **Multiplayer Safari:** Two players find shapes collaboratively
- **AR Mode:** Place safari on real-world surfaces

---

## Section 7: Visual Identity

| Aspect | Current | Target |
|--------|---------|--------|
| **Overall look** | Simple 3D with geometric primitives | Lush safari environment with animal-shaped objects |
| **Camera view** | Fixed orbit with limited movement | Orbit with auto-focus on action points |
| **Art style** | Abstract geometric | Stylized low-poly safari with charm |
| **Mood** | Calm, exploratory | Adventurous, curious, friendly |
| **Colors** | Bright primaries (red, blue, green, yellow) | Earthy safari tones (ochre, olive, terracotta, sky) |
| **Environment** | Basic ground with cylinder trees | Detailed savanna with acacia trees, waterhole, rocks |
| **UI style** | Clean modern cards | Safari expedition journal aesthetic |
| **Active vibe** | Gentle rotation | Living world with animals moving, wind, particles |

### Color Palette
- **Ground:** #C4A77D (Savanna sand)
- **Sky:** #87CEEB → #FFE4B5 (Day to sunset gradient)
- **Shapes:** Animal-themed colors (elephant grey, hippo purple, giraffe yellow)
- **UI:** Khaki (#F0E68C) with dark brown text (#3E2723)
- **Accent:** Safari orange (#FF8C00)

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| **Loading** | Initialize 3D scene | Spinner, "Entering the safari..." |
| **Start Screen** | Game introduction | Title, shape preview, hand tracking hint, Start button |
| **Level Start** | Show target | Target shape display, "Find the [shape]!" instruction |
| **Gameplay** | Core discovery | 3D environment, floating shapes, HUD overlay |
| **Shape Found** | Success feedback | Particle burst, animal sound, TTS name |
| **Level Complete** | Transition | "Great job!" message, score, Next Level button |
| **Game Complete** | Final celebration | Trophy, total score, Play Again button |

---

## Section 9: Controls

| Action | Input | CV Mode | Mouse Mode |
|--------|-------|---------|------------|
| Look around | Move hand | ✅ Hand position | ✅ Mouse move |
| Hover shape | Cursor proximity | ✅ Auto on approach | ✅ Auto on hover |
| Grab shape | Pinch gesture | ✅ Pinch to grab | ✅ Click to select |
| Release shape | Release pinch | ✅ Release | ✅ Click release |
| Rotate view | Drag edge | ❌ Orbit disabled during grab | ✅ Right-click drag |
| Zoom | Pinch/Pull | ❌ Disabled | ✅ Scroll wheel |

### CV-Specific Interactions
- **Hand cursor:** CursorEmbodiment with yellow glow
- **Pinch threshold:** 0.045 (grab), 0.075 (release)
- **Hover radius:** 0.15 normalized units
- **Grab radius:** Raycast intersection with shape bounds

---

## Section 10: Core Mechanics

### Shape System
```typescript
interface ShapeAnimal {
  id: string;
  shape: 'cube' | 'sphere' | 'cylinder' | 'cone';
  animal: string;        // "elephant", "hippo", "giraffe", "lion"
  name: string;          // Display name
  color: string;         // Theme color
  position: [x, y, z];   // 3D position
  rotation: [x, y, z];   // Continuous rotation
  isFound: boolean;      // Collection state
}
```

### 3D Raycasting Selection
```typescript
// Convert hand position to normalized device coordinates
const mouse = new THREE.Vector2(
  handX * 2 - 1,
  -(handY * 2 - 1)
);

// Raycast from camera
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(shapeMeshes);

// Check pinch for selection
if (pinchState.isPinching && intersects.length > 0) {
  selectShape(intersects[0].object);
}
```

### Scoring Formula
```
basePoints = 10
levelMultiplier = 1 + (level - 1) * 0.5  // 1x, 1.5x, 2x
streakBonus = min(streak * 2, 10)
total = basePoints * levelMultiplier + streakBonus
```

### Spawn Algorithm
```typescript
// Generate non-overlapping positions
for each shape:
  do:
    x = random(-4, 4)
    y = random(-1, 1)
    z = random(-4, 4)
  while (distanceToAnyOtherShape < 1.5)
```

---

## Section 11: Rules

### Start Conditions
- Player clicks "Start Safari" on start screen
- Level 1 generates with 4 shapes (2 target, 2 distractors)
- Target shape type announced via TTS

### Objectives
- Find and collect all shapes matching the target type
- Progress through 3 levels of increasing difficulty
- Achieve high score through streaks and speed

### Allowed Actions
- Move hand to control cursor
- Hover over shapes to inspect
- Pinch to grab target shapes
- Release to collect
- Orbit camera when not grabbing

### Restrictions
- Cannot grab non-target shapes
- Cannot grab while another grab in progress
- Camera locked during grab interaction

### Scoring
| Action | Points |
|--------|--------|
| Find target shape | 10 (base) |
| Level 2 bonus | +50% |
| Level 3 bonus | +100% |
| Streak bonus | +2 per consecutive find |

### Win/Lose Conditions
- **Level Win:** All target shapes found
- **Game Win:** Complete level 3
- **No Lose State:** Kid-friendly, no penalties

---

## Section 12: HUD / Gameplay UI

### Top Bar (Absolute positioned)
```
┌─────────────────────────────────────────────────────┐
│ [Score: 150]    [Find: Cubes 🔲]    [Level: 2/3]    │
└─────────────────────────────────────────────────────┘
```

### Score Panel (Top-left)
- Score label with amber color
- Large bold number
- Updates with pop animation

### Target Panel (Top-center)
- "Find" label
- Shape name with emoji/icon
- Target shape rotates as icon

### Level Panel (Top-right)
- Level indicator
- Progress dots (● ● ○)

### Streak Indicator (Appears when streak > 1)
- "🔥 x3" badge
- Orange gradient background
- Bounce animation

---

## Section 13: Feedback and Feel

### Success Feedback
| Trigger | Visual | Audio | Haptic |
|---------|--------|-------|--------|
| Hover shape | Emissive glow (0.5) | Subtle hum | - |
| Grab shape | Scale to 1.3, shake | Pop SFX | Light pulse |
| Collect shape | Particle burst, float up | Animal sound + "You found a [animal]!" | Success pulse |
| Level complete | Confetti rain | Celebration music | Celebration |
| Streak milestone | Flame badge appears | Chime | Pattern |

### Failure/Neutral Feedback
- **Wrong shape:** Gentle wobble, "Try another!" TTS
- **Hand lost:** Cursor fades, tracking reminder

### Audio Design
| Event | Sound |
|-------|-------|
| Game start | Safari ambience (birds, wind) |
| Hover | Subtle tone (pitch varies by shape) |
| Collect | Animal sound + success chime |
| Level complete | Fanfare |

### Responsiveness
- Raycast: Every frame (60 FPS)
- Hand tracking: 30 FPS target
- Animation: 60 FPS smooth

---

## Section 14: Points / Rewards / Progression

### Points System
- **Base collection:** 10 points
- **Level multiplier:** Level × 0.5 bonus
- **Streak bonus:** +2 per consecutive find (max 10)
- **Speed bonus:** Up to 5 points for quick finds

### Drops (From Registry)
| Item | Chance | Condition |
|------|--------|-----------|
| shape-cube | 25% | - |
| shape-sphere | 25% | - |
| star-silver | 10% | Min score 80 |

### Easter Eggs
- **Shape Master:** Find all shapes in a level without missing → trophy-gold
- **Speed Finder:** Complete level in under 30 seconds

### Progression
- 3 levels with increasing shape count
- Shapes persist in collection (visual tracker)
- Unlockable shape "stickers" for gallery

---

## Section 15: End States

### Level Complete
- Trigger: All target shapes collected
- Feedback:
  - "Level Complete!" banner
  - Score summary
  - Collected shapes parade across screen
  - "Next Level" button (or "Play Again" if level 3)

### Game Complete
- Trigger: Level 3 completed
- Feedback:
  - Safari complete celebration overlay
  - Total score display
  - Trophy animation
  - Confetti and particle effects
  - "Play Again" button

### Restart
- Available from pause menu or game end
- Resets all progress
- Returns to start screen

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: 3D Safari (Current/Default)
- Full 3D environment with hand tracking
- Immersive safari exploration
- Raycast selection with pinch

### Mode B: 2D Shape Safari
- Fallback to existing `ShapeSafari.tsx`
- Canvas-based tracing gameplay
- Mouse/touch fallback

### Mode C: Mixed Reality (Future)
- AR safari in real environment
- Shapes appear on real surfaces
- Hand tracking with depth

---

## Section 17: Improvement Opportunities

### Low Cost
- Add TTS for shape names
- Implement proper 3D raycasting
- Add particle effects on collection
- Color-code shapes by type

### Medium Effort
- Create animal-themed shape models (low-poly)
- Add ambient safari sounds
- Implement pinch gesture requirement
- Add shape collection gallery
- Create 2D fallback linkage

### Ambitious
- Custom 3D animal models for each shape
- Animated environment (moving animals, water)
- AR mode with 8th Wall
- Multiplayer collaborative safari
- Shape building mode (collect then construct)
- Procedural terrain generation

---

## Section 18: Content Model

### Shape Types
```typescript
const SHAPE_ANIMALS = {
  cube: { animal: 'elephant', sound: 'elephant-trumpet.ogg' },
  sphere: { animal: 'hippo', sound: 'hippo-grunt.ogg' },
  cylinder: { animal: 'giraffe', sound: 'giraffe-hum.ogg' },
  cone: { animal: 'lion', sound: 'lion-roar.ogg' },
};
```

### Level Configurations
| Level | Shapes | Targets | Distractors | Spawn Area |
|-------|--------|---------|-------------|------------|
| 1 | 4 | 2 | 2 | 6×1×6 |
| 2 | 6 | 3 | 3 | 8×2×8 |
| 3 | 8 | 4 | 4 | 10×2×10 |

### Assets Needed
| Asset | Priority | Source |
|-------|----------|--------|
| Animal sounds | High | Kenney audio or generate |
| Particle texture | Medium | Create procedurally |
| Environment models | Medium | Kenney nature pack |
| Animal models | Low | Custom or Kenney |

---

## Section 19: Technical Structure

### File Organization
```
src/frontend/src/
├── pages/three/
│   └── ShapeSafari3D.tsx       # Main game component (current)
├── games/
│   └── shapeSafari3DLogic.ts   # RECOMMENDED: Extract logic
├── components/game/three/
│   ├── ThreeDGameCanvas.tsx    # Shared canvas (exists)
│   ├── ShapeAnimal3D.tsx       # RECOMMENDED: Shape component
│   └── SafariEnvironment.tsx   # RECOMMENDED: Environment
└── hooks/
    └── use3DGameAudio.ts       # Shared audio hook (exists)
```

### Key Dependencies
- `@react-three/fiber` - React Three Fiber
- `@react-three/drei` - R3F helpers
- `three` - 3D library
- `lucide-react` - Icons

### State Management
```typescript
interface GameState {
  level: number;
  score: number;
  shapes: ShapeAnimal[];
  targetShape: ShapeType;
  foundThisLevel: number;
  streak: number;
  gameStatus: 'menu' | 'playing' | 'levelComplete' | 'gameComplete';
}
```

### CV Integration
- `useGameHandTracking` - Hand position and pinch state
- `CursorEmbodiment` - Visual cursor representation
- Raycasting for 3D selection (RECOMMENDED)

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| Raycast implementation | Uses 2D distance instead of 3D intersection | High |
| Pinch gesture | Only click implemented, no pinch requirement | High |
| Animal theming | Shapes are abstract, no animal associations | High |
| TTS integration | useTTS hook available but not used | High |
| 2D fallback link | ShapeSafari exists but no connection | Medium |
| Performance on mobile | Not tested on low-end devices | Medium |

---

## Section 21: Implementation Notes

### Strengths to Preserve
1. Clean R3F component structure
2. Smooth useFrame rotation animation
3. Level progression scaling
4. Integration with shared canvas system

### Refactor Opportunities
1. Extract game logic to separate file (shapeSafari3DLogic.ts)
2. Split ShapeAnimal3D to separate component
3. Add proper 3D raycasting for selection
4. Implement pinch gesture requirement

### Performance Considerations
- Use instanced meshes if shape count increases
- Limit shadow casting to player-near objects
- Pool particle effects for collection

### Testing Focus
- Hand tracking accuracy in 3D space
- Raycast hit detection precision
- Level progression boundaries
- Audio feedback timing

---

## Section 22: Acceptance Criteria

### Core Functionality
- [ ] 3D scene renders with forest environment
- [ ] Shapes generate at random positions
- [ ] Hand tracking moves cursor in 3D space
- [ ] Hover highlights shapes with emissive glow
- [ ] Click selects target shapes
- [ ] Score updates on successful selection
- [ ] Level progression works (3 levels)
- [ ] Game complete celebration triggers

### CV Requirements
- [ ] Hand tracking initializes on start
- [ ] Cursor follows hand position
- [ ] Pinch gesture detected (if implemented)
- [ ] Tracking loss handled gracefully

### UX/Polish
- [ ] Start screen displays clearly
- [ ] HUD shows score, target, level
- [ ] Shapes rotate smoothly
- [ ] Audio feedback on interactions
- [ ] Celebration overlay on game complete

### Edge Cases
- [ ] Rapid selections handled correctly
- [ ] Multiple simultaneous hovers prevented
- [ ] Game restart clears all state
- [ ] Hand tracking loss pauses interaction

---

## Section 23: Test Plan

### Manual Gameplay Tests
- [ ] Start game, verify 3D scene loads
- [ ] Move hand, verify cursor tracks
- [ ] Hover over shape, verify glow effect
- [ ] Click shape, verify success feedback
- [ ] Complete level, verify progression
- [ ] Complete all 3 levels, verify celebration

### CV Control Tests
- [ ] Test hand tracking initialization
- [ ] Verify cursor accuracy across screen
- [ ] Test pinch detection (if implemented)
- [ ] Verify tracking loss overlay

### Fallback Tests
- [ ] Test mouse control (if implemented)
- [ ] Verify touch controls on mobile

### Edge Cases
- [ ] Rapid clicking on multiple shapes
- [ ] Lose hand tracking mid-selection
- [ ] Resize window during gameplay
- [ ] Switch browser tabs and return

### Performance
- [ ] Maintain 60 FPS with 8 shapes
- [ ] No memory leaks after multiple games
- [ ] Smooth hand tracking at 30 FPS

---

**Last Updated:** 2026-04-03  
**Confidence:** Medium-High - Implementation functional but needs polish for full safari experience  
**Prompt Used:** SPEC_TEMPLATE.md v23-section + 3D_WORLD_PATTERNS.md technical context
