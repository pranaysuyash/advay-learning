# Digital Jenga - Complete Parity Audit Report

**Date:** 2026-03-12  
**Auditor:** AI Agent (Intent-First Game Implementation Audit)  
**Scope:** Full parity audit against current implementation + 2 alternate versions + real Jenga mechanics  
**Status:** Phase 1 Complete

---

## Executive Summary

Your current Jenga implementation is a **tower generator, not a game**. It creates blocks in alternating layers but stops there—no physics, no interaction, no game loop, no Jenga mechanics.

**The brutal truth:**
- Current (digitalJengaLogic.ts): **10/100** - Static data structure only
- Alternate A (Cannon.js): **45/100** - Interactive prototype with physics
- Alternate B (Rapier): **55/100** - Better physics feel, cleaner architecture
- Real Jenga target: **100/100** - Full mechanics-faithful implementation

**Gap:** Your implementation is missing 90% of what makes Jenga Jenga.

---

## 1. Current Implementation Audit

### digitalJengaLogic.ts + DigitalJenga.tsx + DigitalJenga3D.tsx

#### What It Actually Does

| Aspect | Current State |
|--------|---------------|
| **Tower Generation** | ✅ Creates 3×N layers in alternating orientation |
| **Block Data** | Basic: id, position, rotation, color |
| **Physics** | ❌ None (2D) / Static bodies only (3D) |
| **Interaction** | ❌ Click-to-delete / Click-to-vanish |
| **Game Loop** | ❌ None - just remove blocks |
| **Placement on Top** | ❌ Not implemented |
| **Stability** | ❌ Fake math (maxX > 1.5) |
| **Win/Loss** | ❌ Arbitrary thresholds |

#### Critical Missing Elements

```typescript
// What a Block SHOULD have but doesn't:
interface Block {
  id: string;              // ✅ Has
  layerIndex: number;      // ❌ Missing - which layer
  slotIndex: number;       // ❌ Missing - position in layer
  state: 'inTower' | 'removed' | 'onTop' | 'fallen'; // ❌ Missing
  isRemovable: boolean;    // ❌ Missing - game rule check
  supportCount: number;    // ❌ Missing - structural support
  mass: number;            // ❌ Missing - physics property
  dimensions: Vector3;     // ❌ Missing - shared constants
}
```

#### Code-Level Weaknesses

1. **blockSize is local** - Physics can drift from visual representation
2. **IDs are positional** - Brittle for save/load/replay
3. **Perfect alignment** - No gaps, no jitter = sterile physics
4. **Color in game logic** - Presentation mixed with domain
5. **LevelConfig is anemic** - Only height, no physics tuning
6. **No shared constants** - Dimensions scattered across files

---

## 2. Alternate Implementation A Audit

### Cannon.js Version (ai_studio_code_v2.html)

#### What It Does Better

| Feature | Implementation | Quality |
|---------|---------------|---------|
| **Physics Engine** | Cannon.js with full rigid bodies | ✅ Real physics |
| **Block Dimensions** | Explicit Jenga-like 1:3:9 ratio | ✅ Proper |
| **Tower Size** | 54 blocks (18 layers) | ✅ Standard |
| **Grab Interaction** | Point-to-point constraint | ✅ Works |
| **Targeting** | FPS crosshair + tooltip | ✅ Excellent |
| **Input Modes** | Mouse + MediaPipe pinch | ✅ Flexible |
| **Game Modes** | Classic, Dice, Math54 | ✅ Creative |
| **Camera** | Orbit + height control | ✅ Good |
| **UI Feedback** | Status text, colors, menu | ✅ Rich |
| **Tower Settling** | Pre-step 60 frames + sleep | ✅ Stable start |

#### What It Still Does Wrong

1. **No placement on top** - Core Jenga mechanic missing
2. **No Jenga legality rules** - Can grab any block
3. **Constraint-based dragging** - Can feel "yanky"
4. **Monolithic architecture** - Single HTML file
5. **Fake success detection** - Distance from center heuristic
6. **Old physics engine** - Cannon.js vs modern Rapier
7. **Mode sprawl** - Three game modes, none fully polished

#### Key Technical Decisions

```javascript
// Good: Explicit dimensions
const config = {
    blockW: 1.5, blockH: 0.5, blockL: 4.5,  // 1:3:9 ratio
    gap: 0.02, layers: 18  // Realistic gaps
};

// Good: Contact material tuning
{ friction: 0.5, restitution: 0.0, 
  contactEquationStiffness: 5e7, 
  contactEquationRelaxation: 3 }

// Bad: No domain model
blocks.push({ mesh, body, number: blockNum });  // Just mesh+body

// Bad: Grab is constraint-based
State.grabConstraint = new CANNON.PointToPointConstraint(
    State.grabbedBody, localPivot, kinematicMarkerBody, 
    new CANNON.Vec3(0,0,0), 1e6  // Force value is a magic number
);
```

---

## 3. Alternate Implementation B Audit

### Rapier Version (ai_studio_code_v3.html)

#### What It Does Better

| Feature | Implementation | Quality |
|---------|---------------|---------|
| **Physics Engine** | Rapier (WASM, modern) | ✅ Better than Cannon |
| **Drag Strategy** | Velocity-based with cap | ✅ Smoother feel |
| **Anti-Explosion** | CCD + jitter + gaps + damping | ✅ Excellent |
| **Architecture** | Cleaner separation | ✅ More maintainable |
| **Focus** | Single core mechanic | ✅ Disciplined |
| **Visual Feedback** | Neon pointer, color states | ✅ Good |

#### What It Still Does Wrong

1. **No placement on top** - Same gap as Version A
2. **No legality rules** - Can grab any block
3. **No game state model** - Still mesh/body arrays
4. **No win/loss system** - Just restart
5. **Simpler UI** - Less discoverability than Version A

#### Key Technical Decisions

```javascript
// Good: Modern physics engine
const RAPIER = await import('https://cdn.skypack.dev/@dimforge/rapier3d-compat');

// Good: Velocity-based dragging (not constraint)
let maxSpeed = 2.0;  // m/s cap simulates careful pulling
let speed = Math.min(dist * 10, maxSpeed);
grabbedRb.setLinvel({ x: dir.x * speed, y: dir.y * speed, z: dir.z * speed }, true);

// Good: Anti-explosion tactics
bodyDesc.setCcdEnabled(true);  // Continuous collision detection
.setAngularDamping(2.0)  // Damp rotation while dragging
const jitterX = (Math.random() - 0.5) * 0.01;  // Tiny imperfections

// Good: Physics properties
.setMass(1.5).setFriction(0.8).setRestitution(0.0)  // Heavy, grippy, no bounce
```

---

## 4. Comparison Matrix

| Feature | Current | Alt A (Cannon) | Alt B (Rapier) | Real Jenga |
|---------|---------|----------------|----------------|------------|
| **Physics Engine** | ❌ None | ⚠️ Cannon (old) | ✅ Rapier (modern) | Real wood |
| **Block Extraction** | ❌ Click-delete | ✅ Constraint drag | ✅ Velocity drag | Hand pull |
| **Placement on Top** | ❌ None | ❌ None | ❌ None | ✅ Required |
| **Legality Rules** | ❌ None | ❌ Dice only | ❌ None | ✅ Layer rules |
| **Stability Check** | ❌ Fake math | ❌ None | ❌ None | ✅ Physics |
| **Tower Settling** | N/A | ✅ Pre-step | ✅ CCD+jitter | Gravity |
| **Input Methods** | ❌ Click | ✅ Mouse+Camera | ✅ Mouse+Camera | Hands |
| **Targeting Feedback** | ❌ None | ✅ FPS pointer | ✅ Neon dot | Visual |
| **Domain Model** | ❌ Data only | ❌ Mesh+Body | ❌ Mesh+Body | State machine |
| **Architecture** | ⚠️ Scattered | ❌ Monolith | ⚠️ Cleaner | Modular |

---

## 5. Real Jenga Mechanics Parity Review

### What Real Jenga Actually Is

```
TOWER SETUP:
- 54 wooden blocks
- 3 blocks per layer
- 16 complete layers + 2 blocks on top
- Alternating 90° orientation per layer
- Dimensions: 7.5cm × 2.5cm × 1.5cm (roughly 3:1:0.6 ratio)

GAME LOOP (One Turn):
1. ASSESS: Identify legally removable blocks
   - Cannot remove from top incomplete layer
   - Block must be supported by at least one block below
   - Center of gravity check implied

2. EXTRACT: Carefully pull block from tower
   - Hand grip, slow pull
   - Block slides out horizontally
   - Risk: Tower may wobble/collapse during extraction

3. PLACE: Put block on top of tower
   - Must complete current top layer
   - Perpendicular orientation to layer below
   - Center as well as possible
   - Risk: Placement can destabilize

4. CHECK: Is tower stable?
   - If collapsed: Previous player loses
   - If stable: Next player's turn

WIN/LOSS:
- Loss: You cause tower to collapse (on your turn)
- Win: Be player before collapse, OR successfully place last block
```

### Critical Mechanics Neither Alternate Implements

1. **Top-layer restriction** - Cannot remove from incomplete top layer
2. **Support calculation** - Block must have support below
3. **Placement requirement** - Removed blocks go on top
4. **Turn-based flow** - Proper game loop with alternating players
5. **Collapse detection** - Real physics-based failure

---

## 6. Complete Gap Register

### P0 - Critical (Must Have)

| ID | Gap | Current | Alt A | Alt B | Real Jenga |
|----|-----|---------|-------|-------|------------|
| JENGA-001 | Physics Engine | ❌ None | ⚠️ Cannon | ✅ Rapier | ✅ Real |
| JENGA-002 | Block Extraction | ❌ Delete | ✅ Constraint | ✅ Velocity | ✅ Hand pull |
| JENGA-003 | Placement on Top | ❌ None | ❌ None | ❌ None | ✅ Required |
| JENGA-004 | Legality Rules | ❌ None | ⚠️ Dice only | ❌ None | ✅ Layer logic |
| JENGA-005 | Domain Model | ❌ Data | ❌ Mesh+Body | ❌ Mesh+Body | ✅ State machine |
| JENGA-006 | 54 Block Tower | ❌ 16-48 | ✅ 54 | ❌ 36 | ✅ 54 |
| JENGA-007 | Block Dimensions | ❌ Arbitrary | ✅ 1:3:9 | ✅ Ratio | ✅ Standard |

### P1 - High (Game Feel)

| ID | Gap | Priority |
|----|-----|----------|
| JENGA-008 | Drag smoothness | Use velocity-based (Alt B) |
| JENGA-009 | Targeting feedback | Use FPS pointer (Alt A) |
| JENGA-010 | Tower settling | Use CCD+jitter (Alt B) |
| JENGA-011 | Input flexibility | Use mouse+camera (both) |
| JENGA-012 | Visual polish | Use wood textures |
| JENGA-013 | Audio feedback | Wood sounds, slide cues |

### P2 - Medium (Architecture)

| ID | Gap | Priority |
|----|-----|----------|
| JENGA-014 | Reusable components | Extract physics, grab, tower |
| JENGA-015 | State management | Proper game state machine |
| JENGA-016 | Save/load | Serialization support |
| JENGA-017 | Tests | Physics, interaction, game loop |

### P3 - Low (Polish)

| ID | Gap | Priority |
|----|-----|----------|
| JENGA-018 | Multiplayer | Turn-based support |
| JENGA-019 | Difficulty modes | Assist, challenge variants |
| JENGA-020 | Themes | Different block materials |

---

## 7. Merged Target Spec

### Domain Model

```typescript
// Block.ts - Core domain entity
interface Block {
  id: string;
  layerIndex: number;      // 0-17 (which layer)
  slotIndex: number;       // 0-2 (position in layer)
  orientation: 'x' | 'z';  // Which axis the block runs along
  
  // Physics
  dimensions: { w: number; h: number; d: number }; // Shared constants
  mass: number;
  friction: number;
  restitution: number;
  
  // State
  state: 'inTower' | 'grabbed' | 'removed' | 'onTop' | 'fallen';
  
  // Game logic
  isRemovable(): boolean;  // Layer rules + support check
  supportCount: number;    // How many blocks support this one
  
  // References (for physics engine binding)
  body: RAPIER.RigidBody;  // Physics body reference
  mesh: THREE.Mesh;        // Visual mesh reference
}

// Tower.ts - Aggregate root
interface Tower {
  blocks: Block[];
  topLayerIndex: number;   // Current highest complete layer
  topLayerFill: number;    // 0, 1, 2, or 3 blocks on current top
  
  // Queries
  getRemovableBlocks(): Block[];
  getTopBlocks(): Block[];
  isStable(): boolean;     // Center of mass check
  isComplete(): boolean;   // All 54 blocks placed on top
  
  // Actions
  removeBlock(block: Block): boolean;  // Returns success
  placeOnTop(block: Block): boolean;   // Returns success
}

// GameState.ts - Game session
interface JengaGameState {
  tower: Tower;
  currentPlayer: number;   // For multiplayer
  turnPhase: 'select' | 'extract' | 'place' | 'check';
  
  // Tracking
  moves: Move[];           // History for replay
  extractedBlock: Block | null;
  
  // End conditions
  isGameOver: boolean;
  winner: number | null;   // null = tower fell, last player wins
}
```

### Physics Expectations

```typescript
// Physics tuning for "Jenga feel"
const PHYSICS_CONFIG = {
  // Block dimensions (standard Jenga-ish)
  block: {
    width: 0.75,   // Short side (x)
    height: 0.5,   // Thickness (y)
    length: 2.25,  // Long side (z) - 3:2:1 ratio
  },
  
  // Tower layout
  tower: {
    layers: 18,
    blocksPerLayer: 3,
    gap: 0.005,    // Tiny gap prevents physics lock
    jitter: 0.002, // Random imperfection
  },
  
  // Material properties (wood-like)
  material: {
    mass: 0.8,           // kg per block
    friction: 0.6,       // Wood-on-wood
    restitution: 0.0,    // No bounce
    linearDamping: 0.1,  // Air resistance
    angularDamping: 0.1, // Rotation resistance
  },
  
  // Drag behavior
  drag: {
    maxSpeed: 1.5,       // m/s - slow, careful pulling
    acceleration: 10,    // How fast to reach target
    angularDamping: 2.0, // Prevent wild spinning while held
  },
  
  // Stability
  stability: {
    sleepThreshold: 0.1, // Velocity to consider "at rest"
    sleepTime: 0.5,      // Seconds at rest before sleep
    ccdEnabled: true,    // Prevent tunneling
  }
};
```

### Interaction Model

```typescript
// Interaction flow (one complete turn)
enum TurnPhase {
  SELECT = 'select',    // Hover, find removable blocks
  EXTRACT = 'extract',  // Grab, pull horizontally
  PLACE = 'place',      // Move to top, align
  CHECK = 'check',      // Release, wait for settle
}

interface InteractionConfig {
  // Selection
  hoverHighlight: boolean;
  showRemovable: boolean;  // Visual indicator
  
  // Extraction
  grabButton: 'pinch' | 'click' | 'space';
  pullAxis: 'horizontal';  // Only allow horizontal pull
  maxPullDistance: 3.0;    // Max distance from tower
  
  // Placement
  placementGuide: boolean; // Ghost block preview
  snapToGrid: boolean;     // Snap to valid positions
  
  // Feedback
  hapticOnGrab: boolean;
  hapticOnRelease: boolean;
  soundOnSlide: boolean;
}
```

### Rules/Constraints

```typescript
// Jenga rules engine
class JengaRules {
  // Can this block be legally removed?
  static canRemove(block: Block, tower: Tower): boolean {
    // Rule 1: Must be in tower
    if (block.state !== 'inTower') return false;
    
    // Rule 2: Cannot be in top incomplete layer
    if (block.layerIndex >= tower.topLayerIndex) return false;
    
    // Rule 3: Must have structural support (simplified)
    // In real Jenga: block is supported by 2 blocks below
    // Removing it shouldn't immediately collapse tower
    return block.supportCount > 0;
  }
  
  // Where can this block be placed on top?
  static getValidPlacement(tower: Tower): PlacementSpot | null {
    const layer = tower.topLayerIndex + 1;
    const fill = tower.topLayerFill;
    
    if (fill >= 3) return null; // Layer full
    
    return {
      layerIndex: layer,
      slotIndex: fill,
      position: calculatePosition(layer, fill),
      orientation: layer % 2 === 0 ? 'x' : 'z',
    };
  }
  
  // Has the tower collapsed?
  static isCollapsed(tower: Tower): boolean {
    // Check if center of mass is outside base
    // OR if any block has fallen below threshold
    // OR if blocks have separated beyond tolerance
    return tower.calculateStability() < 0.5;
  }
}
```

### Rendering Expectations

```typescript
// Visual configuration
const RENDER_CONFIG = {
  // Block appearance
  block: {
    color: 0xe1b12c,      // Wood color
    roughness: 0.9,       // Matte wood
    metalness: 0.0,
    texture: 'wood_grain', // Optional texture
  },
  
  // Highlights
  hover: {
    color: 0xffff00,      // Yellow
    intensity: 0.3,
  },
  removable: {
    color: 0x00ff00,      // Green
    intensity: 0.2,
  },
  grabbed: {
    color: 0xff0000,      // Red
    intensity: 0.4,
  },
  
  // Pointer
  pointer: {
    color: 0x00ff00,      // Green dot
    size: 0.1,
    snapToSurface: true,
  },
  
  // Camera
  camera: {
    initialAngle: Math.PI / 4,
    radius: 18,
    height: 9,
    minHeight: 2,
    maxHeight: 25,
  },
  
  // Lighting
  lighting: {
    ambient: 0.5,
    directional: 1.2,
    shadows: true,
  },
};
```

### Failure Conditions

```typescript
// Game over detection
interface FailureConditions {
  // Tower collapse
  collapse: {
    // Center of mass outside base
    comDeviation: number;  // meters from center
    
    // Blocks fell
    fallenBlocks: number;  // count below threshold
    
    // Structural separation
    maxSeparation: number; // meters between adjacent blocks
  };
  
  // Illegal move
  illegalMove: {
    attempted: boolean;
    reason: 'topLayer' | 'noSupport' | 'notInTower';
  };
  
  // Timeout (optional)
  timeout: {
    duration: number;  // seconds
    enabled: false;
  };
}
```

---

## 8. Prioritized Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal:** Working physics-based tower with basic interaction

| Task | Why It Matters | Dependencies |
|------|----------------|--------------|
| 1.1 Set up Rapier physics | Modern, stable, WASM performance | None |
| 1.2 Create Block domain model | Proper abstraction for game logic | Physics |
| 1.3 Implement 54-block tower | Standard Jenga configuration | Block model |
| 1.4 Add gaps and jitter | Prevents physics lock, realistic | Tower |
| 1.5 Implement hover targeting | Essential for interaction | Tower |
| 1.6 Basic grab (velocity-based) | Core mechanic - Alt B approach | Targeting |

**Deliverable:** Can hover over blocks and drag them smoothly

### Phase 2: Game Mechanics (Week 2)

**Goal:** Complete one Jenga turn (extract + place)

| Task | Why It Matters | Dependencies |
|------|----------------|--------------|
| 2.1 Legality rules engine | Prevents illegal moves | Block model |
| 2.2 Removable block highlighting | Player guidance | Legality rules |
| 2.3 Placement on top | Core Jenga mechanic | Grab system |
| 2.4 Placement guide/ghost | Player assistance | Placement |
| 2.5 Turn state machine | Proper game flow | Placement |
| 2.6 Collapse detection | Win/loss condition | Physics |

**Deliverable:** Can complete full turn: remove block, place on top, tower checks stability

### Phase 3: Polish (Week 3)

**Goal:** Game feel and presentation

| Task | Why It Matters | Dependencies |
|------|----------------|--------------|
| 3.1 Wood textures/materials | Visual appeal | Rendering |
| 3.2 Audio (grab, slide, release) | Tactile feedback | Interaction |
| 3.3 Camera controls | Better viewing angles | Camera |
| 3.4 UI (score, status, menu) | Player experience | Game state |
| 3.5 MediaPipe hand tracking | "Cool" input method | Input |
| 3.6 Win/loss screens | Game completion | Collapse detection |

**Deliverable:** Polished, playable Jenga game

### Phase 4: Architecture (Week 4)

**Goal:** Clean, reusable, tested code

| Task | Why It Matters | Dependencies |
|------|----------------|--------------|
| 4.1 Extract reusable components | Future games benefit | Core game |
| 4.2 State serialization | Save/load games | Game state |
| 4.3 Comprehensive tests | Reliability | All systems |
| 4.4 Documentation | Maintainability | All systems |
| 4.5 Performance optimization | Mobile/tablet ready | All systems |

**Deliverable:** Production-ready, documented, tested codebase

---

## 9. Risks and Tradeoffs

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Physics instability | Medium | High | Extensive tuning, CCD, small timesteps |
| Performance on mobile | Medium | Medium | LOD, physics LOD, device detection |
| Hand tracking reliability | High | Low | Mouse fallback, generous thresholds |
| Complexity blowout | Medium | High | Strict scoping, weekly demos |

### Design Tradeoffs

| Decision | Option A | Option B | Choice |
|----------|----------|----------|--------|
| Physics engine | Cannon.js (familiar) | Rapier (modern) | **Rapier** - Better performance |
| Drag method | Constraint (strong) | Velocity (smooth) | **Velocity** - Better feel |
| Placement | Free-form | Snapped | **Snapped** - Easier for kids |
| Hand tracking | Primary | Fallback | **Fallback** - Mouse is reliable |
| Legality rules | Strict | Lenient | **Strict** - True to game |

### Out of Scope (For This Pass)

1. **Multiplayer networking** - Local only
2. **AI opponent** - Human vs tower only
3. **Different block shapes** - Standard blocks only
4. **Power-ups** - Pure Jenga
5. **Level editor** - Fixed tower
6. **Replay system** - Save state only

---

## 10. Recommendation

### What to Do

**Build on current 3D code base, but replace core:**

1. **Keep:** Three.js + React Three Fiber setup
2. **Replace:** Cannon.js with Rapier
3. **Replace:** Static blocks with dynamic rigid bodies
4. **Add:** Domain model (Block, Tower, GameState)
5. **Add:** Velocity-based drag interaction
6. **Add:** Placement on top mechanic
7. **Add:** Legality rules engine
8. **Add:** Collapse detection

### What NOT to Do

- ❌ Patch the 2D version - insufficient
- ❌ Use constraint-based dragging - feels worse
- ❌ Skip placement on top - not Jenga without it
- ❌ Ignore legality rules - teaches wrong game
- ❌ Build monolith - extract components

### Strongest Ideas to Copy

**From Version A (Cannon.js):**
- 54-block full tower
- FPS pointer + tooltip
- Input mode flexibility
- Rich UI feedback
- Game mode concepts (future)

**From Version B (Rapier):**
- Modern physics engine
- Velocity-based dragging
- Anti-explosion tactics (CCD, jitter)
- Cleaner architecture
- Focus on core feel

### Final Verdict

**Estimated effort:** 4 weeks for production-ready implementation

**Confidence:** High - Both alternates prove it's doable

**Priority:** High - Current implementation is embarrassing

**Success criteria:**
- Can extract any non-top block
- Can place on top
- Tower collapses realistically
- Feels like Jenga, not "block clicker"

---

## Appendix A: Code Samples

### Block Class (Target)

```typescript
class JengaBlock {
  readonly id: string;
  readonly layerIndex: number;
  readonly slotIndex: number;
  readonly orientation: 'x' | 'z';
  
  private _state: BlockState = 'inTower';
  private _body: RAPIER.RigidBody;
  private _mesh: THREE.Mesh;
  
  constructor(config: BlockConfig, physics: PhysicsWorld, scene: THREE.Scene) {
    // Initialize physics body
    // Initialize mesh
    // Set initial position based on layer/slot
  }
  
  get isRemovable(): boolean {
    if (this._state !== 'inTower') return false;
    if (this.isInTopLayer) return false;
    return this.supportCount > 0;
  }
  
  get supportCount(): number {
    // Calculate from adjacent blocks
  }
  
  grab(): boolean {
    if (!this.isRemovable) return false;
    this._state = 'grabbed';
    this._body.wakeUp();
    this._body.setAngularDamping(2.0);
    return true;
  }
  
  release(): void {
    this._state = 'inTower';
    this._body.setAngularDamping(0.1);
  }
  
  placeOnTop(layer: number, slot: number): void {
    this._state = 'onTop';
    // Move to new position
    // Animate placement
  }
  
  updateVisuals(): void {
    // Sync mesh to physics body
  }
}
```

### Grab Controller (Target)

```typescript
class GrabController {
  private grabbedBlock: JengaBlock | null = null;
  private grabOffset: THREE.Vector3 = new THREE.Vector3();
  private dragPlane: THREE.Plane = new THREE.Plane();
  
  constructor(private raycaster: THREE.Raycaster, private camera: THREE.Camera) {}
  
  attemptGrab(point: THREE.Vector3, ray: THREE.Ray): boolean {
    const block = this.findBlockAt(ray);
    if (!block || !block.grab()) return false;
    
    this.grabbedBlock = block;
    this.setupDragPlane(point);
    this.calculateOffset(point);
    return true;
  }
  
  updateDrag(ray: THREE.Ray): void {
    if (!this.grabbedBlock) return;
    
    const hitPoint = new THREE.Vector3();
    if (!ray.intersectPlane(this.dragPlane, hitPoint)) return;
    
    const targetPos = hitPoint.sub(this.grabOffset);
    const currentPos = this.grabbedBlock.position;
    
    const diff = targetPos.sub(currentPos);
    const dist = diff.length();
    const dir = diff.normalize();
    
    // Soft velocity cap
    const maxSpeed = 1.5;
    const speed = Math.min(dist * 10, maxSpeed);
    
    this.grabbedBlock.setVelocity(dir.multiplyScalar(speed));
  }
  
  release(): void {
    if (this.grabbedBlock) {
      this.grabbedBlock.release();
      this.grabbedBlock = null;
    }
  }
}
```

---

## Appendix B: Test Plan

### Unit Tests

```typescript
// Block logic tests
describe('JengaBlock', () => {
  it('calculates correct position from layer and slot');
  it('identifies top layer blocks as non-removable');
  it('identifies unsupported blocks as non-removable');
  it('transitions through states correctly');
  it('calculates support count from neighbors');
});

// Tower logic tests
describe('Tower', () => {
  it('generates 54 blocks in correct pattern');
  it('identifies removable blocks correctly');
  it('places blocks on top in correct orientation');
  it('detects collapse when COM outside base');
  it('detects structural failure');
});

// Physics tests
describe('Physics', () => {
  it('tower settles without explosion');
  it('blocks collide correctly');
  it('drag respects velocity cap');
  it('sleep/wake cycles work');
});
```

### Integration Tests

```typescript
// Full turn tests
describe('Jenga Turn', () => {
  it('completes full turn: select, extract, place, check');
  it('prevents illegal moves');
  it('detects tower collapse after bad move');
  it('awards win when all blocks placed');
});
```

---

*End of Audit Report*

**Next Step:** Approve Phase 1 implementation plan to begin production.
