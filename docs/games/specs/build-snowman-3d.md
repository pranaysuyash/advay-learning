# Build a Snowman 3D - Game Specification

**Slug:** `build-snowman-3d`  
**World:** 3D World  
**CV Mode:** Hand tracking (`cv: ['hand']`)  
**File:** `src/frontend/src/pages/BuildSnowman3D.tsx` (planned)  
**Logic:** `src/frontend/src/games/buildSnowman3DLogic.ts` (planned)  

**Status:** ⚠️ NOT YET IMPLEMENTED - This specification defines the target implementation based on 3D World patterns and similar games.

---

## Section 1: Concept Summary

| Attribute | Value |
|-----------|-------|
| **One-line concept** | Assemble a 3D snowman by dragging and stacking snowballs, then decorate with accessories |
| **Genre** | Creative / Sandbox / Construction |
| **Target audience** | Ages 3-8 (early childhood creativity) |
| **Core player fantasy** | Being a winter magician who builds the perfect snowman without cold hands |
| **Primary skill tested** | Spatial reasoning, fine motor control, creative expression |
| **Session length** | 5-10 minutes (open-ended, no time pressure) |
| **Platform context** | Web-based, 3D canvas with hand tracking interaction |

---

## Section 2: Repo Status

| Status | Details |
|--------|---------|
| **Implementation status** | ❌ NOT IMPLEMENTED |
| **What works now** | N/A - Game does not exist |
| **What is partial/missing** | All components need creation |
| **Evidence** | No file at src/frontend/src/pages/BuildSnowman3D.tsx |
| **Confidence level** | High - confirmed missing via file system search |

**Related/Planned:**
- Listed in PHASE2_PLAN.md Wave 4 for 3D World
- Similar pattern to Dress Up 3D (character customization)
- Would use React Three Fiber + Rapier physics (per 3D World standards)

---

## Section 3: Current Implementation

**STATUS: NO IMPLEMENTATION EXISTS**

This section describes the PLANNED implementation based on 3D World patterns from `docs/games/3D_WORLD_PATTERNS.md`.

### Planned Flow
```
Start Screen → Tutorial (optional) → Build Mode → Decorate Mode → Photo/Save → Share/Exit
                    ↓_____________________________________________↑
                              (can revisit any step)
```

1. **Start Screen**: Welcome with "Build Your Snowman!" call-to-action
2. **Build Mode**: Stack 3 snowballs (base, middle, head) using physics
3. **Decorate Mode**: Add accessories (hat, scarf, eyes, nose, buttons, arms)
4. **Photo Mode**: Capture and save creation
5. **Completion**: Save progress, option to rebuild

### Planned Controls

| Input | Action | Implementation |
|-------|--------|----------------|
| Hand tracking | Move 3D cursor | `useGameHandTracking` → normalized coordinates |
| Hand hover | Highlight selectable object | Raycast from cursor |
| Pinch gesture | Grab/drag object | Physics constraint on pinch start |
| Release pinch | Drop object | Physics constraint release, body wakes up |
| Hand swipe | Rotate camera | OrbitControls with hand gesture mapping |
| Click/tap | Select/place (fallback) | Mouse event handlers |

### Planned Mechanics

**Physics-Based Stacking (Rapier):**
```typescript
// Planned: Snowball physics bodies
interface Snowball {
  id: string;
  size: 'large' | 'medium' | 'small';
  rigidBody: RapierRigidBody;
  collider: RapierCollider;  // Sphere collider
  position: Vector3;
  isPlaced: boolean;
}

// Physics material: Snow
const SNOW_MATERIAL = {
  friction: 0.6,      // Sticky but not too sticky
  restitution: 0.2,   // Low bounce
  density: 0.5,       // Light, floaty feel
};
```

**Attachment System:**
```typescript
interface Accessory {
  id: string;
  type: 'hat' | 'scarf' | 'eyes' | 'nose' | 'buttons' | 'arms';
  model: GLTF;
  attachPoint: Vector3;  // Relative to snowball center
  socketName: string;    // Named attachment point
}

// Attachment zones on snowman
const ATTACHMENT_ZONES = {
  head: { y: 1.8, radius: 0.4 },
  middle: { y: 1.0, radius: 0.5 },
  base: { y: 0.3, radius: 0.6 },
};
```

**Stability Detection:**
```typescript
// Check if snowman is stable (not toppling)
function isSnowmanStable(snowballs: Snowball[]): boolean {
  // COM (center of mass) check
  // Contact point verification
  // Angular velocity check (all near zero)
  return snowballs.every(sb => 
    sb.rigidBody.angularVelocity.length() < 0.1 &&
    sb.rigidBody.linvel().length() < 0.1
  );
}
```

### Planned Visuals/UI

**3D Scene:**
- Ground: Snow-covered plane with footprints
- Background: Winter forest with falling snow particles
- Lighting: Soft ambient + directional (moonlight feel)
- Shadows: Enabled for all objects

**Snowman Parts:**
- 3 sphere primitives (radius: 0.6, 0.45, 0.3)
- White material with slight roughness for snow texture
- Sub-surface scattering (if performance allows)

**UI Panels:**
- Left: Accessory palette (scrollable grid)
- Top: Current step indicator (Build → Decorate → Done)
- Bottom: Action buttons (Reset, Done, Photo)
- Right: Help/Tips toggle

### Gaps/Issues (Pre-Implementation)

1. **No existing code** - Must build from scratch
2. **Asset requirements** - Need 3D models for accessories
3. **Physics tuning** - Balancing stability vs. fun challenge
4. **Hand tracking precision** - Dragging requires fine motor control
5. **Save system** - 3D state serialization needed

---

## Section 4: Intended Design

### Educational Goal
Develop spatial reasoning, cause-and-effect understanding, and creative self-expression through constructive play.

### Pedagogical Approach
- **Constructivist learning**: Children learn physics through experimentation
- **Open-ended creativity**: No "wrong" way to build (though unstable stacks fall)
- **Scaffolded complexity**: Start with stacking, unlock decoration
- **Pride of creation**: Photo/save feature validates effort

### Difficulty Progression

| Stage | Task | Challenge |
|-------|------|-----------|
| 1 | Stack 3 snowballs | Basic physics understanding |
| 2 | Keep it stable for 3 seconds | Learn about balance |
| 3 | Add accessories | Fine motor placement |
| 4 | Creative decoration | Unlimited expression |

### Accessibility
- [ ] Large hit targets for hand tracking (sphere radius + buffer)
- [ ] Snap-to-place assistance (magnetic zones)
- [ ] Reduced motion mode (no falling animations)
- [ ] Audio descriptions for screen readers
- [ ] Color-blind friendly accessory options
- [ ] One-hand mode (simplified controls)

### Engagement
- **Tangible creation**: Physical act of stacking in 3D space
- **Surprise moments**: Physics-based toppling (funny, not frustrating)
- **Collection**: Unlock new accessories through play
- **Sharing**: Photo export to share creations

### Core Loop
```
Select Part → Position Part → Drop/Attach → Evaluate → Adjust/Continue
                ↑_____________________________________________|
```

---

## Section 5: Drift Analysis

**STATUS: NO IMPLEMENTATION EXISTS**

Since the game is not yet implemented, this analysis compares the PLANNED specification against the INTENDED design:

### Where Planned Matches Intent (100%)

All planned features align with the creative construction vision:
- Physics-based stacking ✓
- Hand tracking interaction ✓
- Decoration system ✓
- Open-ended creativity ✓

### Where Implementation Will Need Attention

| Risk Area | Concern | Mitigation |
|-----------|---------|------------|
| Physics stability | Too easy = boring, too hard = frustrating | Tunable difficulty settings |
| Hand tracking accuracy | 3D placement requires precision | Snap zones, larger hit areas |
| Performance | R3F + Rapier + multiple objects | LOD, object pooling |
| Asset loading | GLTF accessories may be large | Compress, lazy load |

### Overall Assessment

**Alignment Score: N/A (Not Implemented)**

The specification is ready for implementation with clear patterns from existing 3D World games.

---

## Section 6: Recommended Canonical Version

### Phase 1: Core Physics (MVP)
1. Static ground plane
2. 3 draggable snowball spheres
3. Basic stacking challenge
4. Stability detection
5. Simple win condition (stacked)

### Phase 2: Decoration System
1. 5-10 basic accessories (hat, scarf, eyes, nose, buttons)
2. Attachment point system
3. Color variations
4. Reset/undo functionality

### Phase 3: Polish & Expansion
1. Particle effects (falling snow, poof on place)
2. Sound effects (snow thud, accessory click)
3. Photo mode with filters
4. Save/load creations
5. More accessories (unlockable)

### Phase 4: Advanced Features
1. Multi-snowman scenes
2. Background themes (forest, village, mountain)
3. Multiplayer collaborative building
4. AI-generated accessory suggestions

---

## Section 7: Visual Identity

### Overall Look
Whimsical winter wonderland with soft, inviting colors and playful proportions.

### Camera View
**Primary:** Orbit camera at fixed distance, slight angle looking down
```typescript
<OrbitControls
  enablePan={false}
  enableZoom={false}  // Fixed distance for CV consistency
  minPolarAngle={Math.PI / 4}
  maxPolarAngle={Math.PI / 2.5}
  minAzimuthAngle={-Math.PI / 4}
  maxAzimuthAngle={Math.PI / 4}
/>
```

**Photo Mode:** Free rotation with zoom enabled

### Art Style
- **Style:** Low-poly, stylized winter aesthetic
- **Reference:** Animal Crossing, Fall Guys (approachable, rounded)
- **Materials:** Matte snow, slight sparkle, soft shadows

### Mood
Cozy, magical, playful. Like building a snowman on a perfect winter day.

### Colors
```
Snow: #FFFAFA (Ghost white)
Snow shadow: #E8E8E8
Sky: #87CEEB (gradients to #B0E0E6)
Tree (pine): #2F4F4F
Tree (snow cap): #FFFFFF
Scarf red: #DC143C
Hat black: #1A1A1A
Carrot orange: #FF8C00
Button coal: #2C2C2C
UI background: rgba(255, 255, 255, 0.9)
```

### Environment
- Ground: Undulating snow plane
- Trees: Stylized pine trees with snow caps (background)
- Particles: Gentle falling snow
- Lighting: Soft directional (moon) + ambient (blue-tinted)

### UI Style
Floating glass-morphism panels with winter-themed icons.

### Active Vibe
Calm, creative focus. No time pressure, just peaceful construction.

---

## Section 8: Screen Map

| Screen | Purpose | Elements |
|--------|---------|----------|
| Welcome | Intro & start | Title, snowman preview, Start button |
| Tutorial | Teach controls | Step-by-step hand tracking guide |
| Build | Stack snowballs | 3D canvas, snowball spawn area, hint text |
| Decorate | Add accessories | Accessory palette, snowman, category tabs |
| Evaluate | Stability check | 3-second countdown, wobble animation |
| Photo | Capture creation | Camera controls, filters, Save button |
| Complete | Celebration | Confetti, score, replay options |

---

## Section 9: Controls

| Action | Input | Feedback |
|--------|-------|----------|
| Move cursor | Hand tracking | 3D cursor follows index finger |
| Highlight | Hover over object | Object glow/outline |
| Grab | Pinch gesture | Hand closes, object attaches to cursor |
| Drag | Move hand while pinching | Object follows in 3D space |
| Drop | Release pinch | Object falls with physics |
| Rotate view | Hand swipe (edge) | Camera orbits smoothly |
| Select accessory | Hover + pinch | Accessory spawns in hand |
| Attach | Release near socket | Snap to position, click sound |
| Reset | Button press | All parts reset to spawn |
| Photo | Button press | Screenshot with UI hidden |

---

## Section 10: Core Mechanics

### Snowball Physics

**Body Configuration:**
```typescript
<RigidBody
  type="dynamic"
  mass={mass}  // Large: 2.0, Medium: 1.0, Small: 0.5
  friction={0.6}
  restitution={0.2}
  linearDamping={0.5}
  angularDamping={0.5}
>
  <Sphere args={[radius]}>
    <meshStandardMaterial
      color="#FFFAFA"
      roughness={0.9}
      metalness={0.0}
    />
  </Sphere>
  <BallCollider args={[radius]} />
</RigidBody>
```

**Spawn Positions:**
```typescript
const SPAWN_POINTS = [
  { x: -2, y: 0.6, z: 0 },   // Large
  { x: 0, y: 0.45, z: 0 },   // Medium
  { x: 2, y: 0.3, z: 0 },    // Small
];
```

### Attachment System

**Socket Definition:**
```typescript
interface AttachmentSocket {
  id: string;
  position: Vector3;
  allowedTypes: AccessoryType[];
  occupied: boolean;
  currentAccessory: string | null;
}

// Sockets on completed snowman
const SNOWMAN_SOCKETS = {
  'hat': { position: [0, 2.1, 0], allowedTypes: ['hat'] },
  'eyes': { position: [-0.1, 1.9, 0.25], allowedTypes: ['eyes'] },
  'nose': { position: [0, 1.85, 0.28], allowedTypes: ['nose'] },
  'scarf': { position: [0, 1.4, 0], allowedTypes: ['scarf'] },
  'buttons': { position: [0, 1.1, 0.45], allowedTypes: ['buttons'] },
  'arms': { position: [±0.5, 1.2, 0], allowedTypes: ['arms'] },
};
```

**Snap Logic:**
```typescript
function tryAttach(
  accessory: Accessory,
  position: Vector3
): AttachmentResult {
  for (const socket of Object.values(SNOWMAN_SOCKETS)) {
    const distance = position.distanceTo(socket.position);
    if (distance < SNAP_THRESHOLD && !socket.occupied) {
      return { success: true, socket };
    }
  }
  return { success: false };
}
```

### Stability Check

```typescript
function evaluateSnowman(snowballs: Snowball[]): Evaluation {
  const allSleeping = snowballs.every(
    sb => sb.rigidBody.isSleeping()
  );
  
  const heights = snowballs.map(sb => sb.position.y);
  const properlyStacked = heights[0] < heights[1] && heights[1] < heights[2];
  
  const contacts = checkContacts(snowballs);
  const touching = contacts.length >= 2;  // At least adjacent pairs touching
  
  return {
    stable: allSleeping && properlyStacked && touching,
    score: calculateScore(snowballs, contacts),
    bonus: checkBonusConditions(snowballs),
  };
}
```

---

## Section 11: Rules

### Start Conditions
- Player clicks "Start Building"
- 3 snowballs spawn at designated positions
- Camera positioned at default angle
- Tutorial shown (first time) or skipped

### Objectives
- Stack all 3 snowballs (base → middle → head)
- Keep stable for 3 seconds
- Add at least 3 accessories
- Capture photo of creation

### Allowed Actions
- Grab and drag any snowball
- Drop snowballs anywhere (physics applies)
- Spawn accessories from palette
- Attach accessories to snowman
- Reset entire scene
- Rotate camera view

### Restrictions
- Cannot stack snowballs before placing base on ground
- Accessories only attach to designated sockets
- Camera cannot go below ground level
- Maximum 10 accessories per snowman

### Scoring
| Action | Points |
|--------|--------|
| Base placed on ground | 10 |
| Middle stacked on base | 20 |
| Head stacked on middle | 30 |
| Stable for 3s | 50 |
| Each accessory | 10 |
| Balanced pose (centered) | 25 bonus |
| All accessories | 100 bonus |

### Win/Lose Conditions
| Condition | Trigger | Result |
|-----------|---------|--------|
| Build complete | Stable + 3+ accessories | Unlock photo mode |
| Topple | Snowman falls apart | Gentle reset offer |
| Timeout | None (open-ended) | N/A |

---

## Section 12: HUD / Gameplay UI

### Top Bar
```
┌─────────────────────────────────────────────────────────────┐
│ [❓ Help]    Build → Decorate → [Photo] → Done     [🔄 Reset]│
└─────────────────────────────────────────────────────────────┘
```

### Left Panel (Accessory Palette)
```
┌─────────────────┐
│ 🎩 Hats      [▲]│
├─────────────────┤
│ [hat1] [hat2]   │
│ [hat3] [hat4]   │
├─────────────────┤
│ 🧣 Scarves   [▼]│
├─────────────────┤
│ 👀 Eyes      [▼]│
├─────────────────┤
│ ...more       │
└─────────────────┘
```

### Bottom Bar
```
┌─────────────────────────────────────────────────────────────┐
│ [Tip: Try placing the biggest ball first!]    [📷 Photo]   │
└─────────────────────────────────────────────────────────────┘
```

### Stability Indicator
```
┌─────────────┐
│ Stability:  │
│ ████████░░  │ 80%
│ ✓ Stable!   │
└─────────────┘
```

---

## Section 13: Feedback and Feel

### Success Feedback
| Trigger | Feedback |
|---------|----------|
| Snowball placed | Soft "thud" sound, slight bounce |
| Stable stack | Green indicator, chime sound |
| Accessory attached | Click sound, sparkle particle |
| Photo taken | Flash effect, shutter sound |
| Completion | Confetti, celebration music |

### Failure Feedback
| Trigger | Feedback |
|---------|----------|
| Snowman topples | Gentle "oh no" sound, slow-motion fall |
| Invalid attachment | Red highlight, error sound |
| Drop outside bounds | Poof effect, return to spawn |

### During Gameplay
| State | Feedback |
|-------|----------|
| Grabbing | Hand cursor closes, object lifts |
| Dragging | Trail particles, slight glow |
| Hover socket | Socket highlight, ghost preview |
| Near stability | Increasing pitch in indicator |

### Haptic Feedback
| Trigger | Pattern |
|---------|---------|
| Grab | Light tap |
| Place | Medium pulse |
| Success | Celebration rumble |
| Topple | Quick double-tap |

---

## Section 14: Points / Rewards / Progression

### Points Breakdown
| Action | Points |
|--------|--------|
| Base placement | 10 |
| Middle stack | 20 |
| Head stack | 30 |
| Stability bonus | 50 |
| Per accessory | 10 |
| Balanced bonus | 25 |
| All accessories | 100 |
| **Max per build** | **~300** |

### Drops (Proposed)
| Item | Chance | Condition |
|------|--------|-----------|
| snow-flake | 40% | Always |
| color-white | 25% | Always |
| star-silver | 15% | Score ≥ 150 |
| star-gold | 5% | Score ≥ 250 |
| accessory-unlock | 10% | First completion |

### Easter Eggs (Proposed)
| Egg | Trigger | Reward |
|-----|---------|--------|
| Perfect Balance | Centered COM ± 0.1 | star-gold × 1 |
| Speed Builder | Complete in < 60s | trophy-silver × 1 |
| Accessorizer | Use 8+ accessories | star-silver × 2 |
| Tower of Snow | Stack 5+ balls | trophy-gold × 1 |

### Progression
- **Session**: Build → Decorate → Photo
- **Unlocks**: New accessories via drops/completion
- **Collection**: Gallery of saved snowmen
- **Mastery**: Perfect balance challenges

---

## Section 15: End States

### Success (Build Complete)
```
┌──────────────────────────────────────┐
│        ⛄ Snowman Complete! ⛄        │
│                                      │
│         [Snowman preview]            │
│                                      │
│    Score: XXX | Stability: 95%       │
│                                      │
│   [Build Another]    [Gallery]       │
│   [📷 Take Photo]    [Exit]          │
└──────────────────────────────────────┘
```

### Topple (Optional Reset)
```
┌──────────────────────────────────────┐
│         Oops! It fell! 😅            │
│                                      │
│    [Watch Replay]  [Try Again]       │
└──────────────────────────────────────┘
```

### Photo Captured
```
┌──────────────────────────────────────┐
│      📸 Photo Saved! 📸              │
│                                      │
│      [Photo preview]                 │
│                                      │
│   [Download]  [Share]  [New Build]   │
└──────────────────────────────────────┘
```

---

## Section 16: Parallel Modes / Alternate Implementations

### Mode A: Hand Tracking Primary (Planned)
| Aspect | Implementation |
|--------|----------------|
| Input | `useGameHandTracking` with 3D cursor |
| Grab | Pinch gesture detection |
| Precision | Raycast from cursor position |

### Mode B: Touch/Mouse Fallback
| Aspect | Implementation |
|--------|----------------|
| Input | Mouse/touch events |
| Grab | Click and drag |
| Rotate | Right-click drag or pinch-zoom |

### Mode C: Simplified (Younger Children)
| Modification | Description |
|--------------|-------------|
| Snap zones | Larger, magnetic attachment |
| Auto-stabilize | Physics damping increased |
| Preset stacks | One-click stack option |
| Limited accessories | 5 core items only |

### Mode D: Challenge Mode
| Modification | Description |
|--------------|-------------|
| Time limit | Build in 2 minutes |
| Wind physics | Random forces challenge stability |
| Height bonus | Taller snowmen score more |
| Obstacles | Must build around trees/rocks |

---

## Section 17: Improvement Opportunities

### Phase 1: MVP (2-3 weeks)
- [ ] Basic R3F scene with ground
- [ ] 3 draggable snowball spheres
- [ ] Simple physics stacking
- [ ] Win detection (stacked + stable)

### Phase 2: Decoration (1-2 weeks)
- [ ] 5-10 accessory models
- [ ] Attachment socket system
- [ ] Basic UI palette
- [ ] Reset functionality

### Phase 3: Polish (1-2 weeks)
- [ ] Particle effects (snow, sparkles)
- [ ] Sound effects
- [ ] Photo mode
- [ ] Save/load system

### Phase 4: Expansion (2-4 weeks)
- [ ] Unlockable accessories
- [ ] Multiple snowmen scenes
- [ ] Background themes
- [ ] Multiplayer support

---

## Section 18: Content Model

### Snowball Specifications
| Size | Radius | Mass | Spawn Y |
|------|--------|------|---------|
| Large (base) | 0.6 | 2.0 | 0.6 |
| Medium | 0.45 | 1.0 | 0.45 |
| Small (head) | 0.3 | 0.5 | 0.3 |

### Accessory Catalog
| Type | Options | Attach Point |
|------|---------|--------------|
| Hats | Top hat, Beanie, Cap, Crown, Bucket | Head top |
| Eyes | Coal, Buttons, Googly, Sunglasses | Head front |
| Nose | Carrot, Button, Candy | Head center |
| Scarf | Red, Striped, Blue, Green | Neck |
| Buttons | Coal (2-3), Colored, Shaped | Middle |
| Arms | Stick, Branch, Ski poles, Gloves | Sides |

### Scene Themes
| Theme | Elements | Lighting |
|-------|----------|----------|
| Winter Forest | Pine trees, snow | Cool blue |
| Village | Houses, lights | Warm yellow |
| Mountain | Peaks, clouds | Bright white |
| Night | Stars, moon | Dark blue |

---

## Section 19: Technical Structure

### Planned File Structure
```
src/frontend/src/
├── pages/
│   └── BuildSnowman3D.tsx          # Main game component
├── games/
│   └── buildSnowman3DLogic.ts      # Physics & game logic
├── components/3d/
│   ├── SnowmanScene.tsx            # R3F canvas setup
│   ├── DraggableSnowball.tsx       # Interactive snowball
│   ├── Accessory.tsx               # Attachable items
│   ├── SnowGround.tsx              # Environment
│   └── AttachmentSocket.tsx        # Snap zones
└── hooks/
    └── useSnowmanPhysics.ts        # Custom physics hook
```

### Key Components

**BuildSnowman3D.tsx:**
```typescript
// Main component structure
export function BuildSnowman3D() {
  const [gameState, setGameState] = useState<'build' | 'decorate' | 'complete'>('build');
  const [snowballs, setSnowballs] = useState<Snowball[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [score, setScore] = useState(0);
  
  return (
    <GameShell gameId="build-snowman-3d">
      <Canvas>
        <Physics gravity={[0, -9.81, 0]}>
          <SnowmanScene
            snowballs={snowballs}
            accessories={accessories}
            onStable={handleStable}
          />
        </Physics>
      </Canvas>
      <AccessoryPalette onSelect={spawnAccessory} />
      <GameUI score={score} state={gameState} />
    </GameShell>
  );
}
```

### Hooks Required
| Hook | Purpose |
|------|---------|
| `useGameHandTracking` | Hand position for 3D cursor |
| `use3DDrag` | Physics-based dragging |
| `useSnowmanPhysics` | Stability evaluation |
| `useGameCompletion` | Progress persistence |

### Dependencies
```json
{
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "@react-three/rapier": "^1.x",
  "three": "^0.160.x"
}
```

---

## Section 20: Gaps and Unknowns

| Gap | Inference | Confidence |
|-----|-----------|------------|
| 3D asset availability | Need to create or source accessory models | High |
| Physics tuning complexity | Will require iteration for "fun" physics | Medium |
| Hand tracking precision | May need larger hit zones for children | Medium |
| Performance on low-end devices | R3F + physics may struggle on old tablets | Medium |
| Save format for 3D state | Need to serialize positions/rotations | High |

---

## Section 21: Implementation Notes

### Patterns from Similar Games

**From Dress Up 3D:**
- Attachment socket system
- Category-based accessory palette
- Smooth camera transitions

**From Digital Jenga:**
- Physics constraint dragging
- Stability detection logic
- Rigid body sleep/wake patterns

### Architecture Decisions

1. **Single Canvas vs. Multiple**: One R3F canvas for entire game
2. **Physics Engine**: Rapier (WASM) for determinism
3. **State Management**: React state + refs for physics bodies
4. **Asset Loading**: Lazy load accessories on category open

### Testing Considerations
- Physics stability across devices
- Hand tracking accuracy in 3D space
- Memory leaks with R3F disposal
- Touch fallback functionality

### Performance Targets
| Metric | Target |
|--------|--------|
| FPS | 60 |
| Physics ms/frame | < 3ms |
| Load time | < 3s |
| Memory | < 150MB |

---

## Section 22: Acceptance Criteria

### MVP Release
- [ ] 3 draggable snowball spheres
- [ ] Physics stacking with gravity
- [ ] Stability detection (3-second hold)
- [ ] Basic win condition
- [ ] Reset functionality
- [ ] Hand tracking controls
- [ ] Touch/mouse fallback

### Full Release
- [ ] 10+ accessories
- [ ] Attachment socket system
- [ ] Photo mode
- [ ] Save/load creations
- [ ] Particle effects
- [ ] Sound effects
- [ ] Tutorial system
- [ ] Progress persistence

### Polish
- [ ] Multiple themes
- [ ] Unlockable content
- [ ] Gallery view
- [ ] Share functionality
- [ ] Accessibility features

---

## Section 23: Test Plan

### Physics Tests
| Test | Steps | Expected |
|------|-------|----------|
| Basic stack | Stack 3 balls | All rest on ground or each other |
| Stability | Stack and wait 3s | "Stable" indicator appears |
| Topple | Knock stack sideways | Balls roll/fall realistically |
| Reset | Click reset | All return to spawn positions |

### CV Tests
| Test | Steps | Expected |
|------|-------|----------|
| Hand cursor | Show hand | 3D cursor appears |
| Grab | Pinch over ball | Ball lifts with hand |
| Drag | Move pinched hand | Ball follows smoothly |
| Drop | Release pinch | Ball falls with physics |
| Rotate | Swipe at screen edge | Camera orbits |

### UI Tests
| Test | Steps | Expected |
|------|-------|----------|
| Accessory spawn | Click palette item | Item appears in scene |
| Attach | Drag to socket | Snaps to position |
| Category switch | Click different tab | New accessories shown |
| Photo mode | Click camera | UI hides, screenshot ready |

### Edge Cases
| Test | Steps | Expected |
|------|-------|----------|
| Rapid grab/grab | Quickly grab different balls | No crash, correct ball grabbed |
| Many accessories | Add 10+ items | Performance stable |
| Browser resize | Resize window | Canvas adapts |
| Tab switch | Switch away and back | Physics resumes correctly |

---

**Specification Version:** 1.0  
**Last Updated:** 2026-04-03  
**Author:** AI Agent (Specification Audit)  
**Status:** PLANNED - Not yet implemented  
**Dependencies:** React Three Fiber, Rapier physics, 3D assets  
