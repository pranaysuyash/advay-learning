# 3D Game Architecture Improvements

**Date:** 2026-03-14  
**Agents:** Multiple (Antigravity ISS Docking, Codex Jenga Integration)  
**Status:** Analysis Complete - Ready for Implementation

---

## Executive Summary

Two 3D games have been implemented in the repository with different architectural patterns:

| Game | Pattern | Quality | Key Strengths |
|------|---------|---------|---------------|
| **Jenga 3D** | Domain-Driven Design (DDD) | High | Clean separation, reusable hooks, proper game state |
| **ISS Docking 3D** | Ad-hoc integration | Medium | Simple, direct, but lacks structure |

This document identifies cross-game improvements to standardize on the superior Jenga patterns and extract common utilities.

---

## 1. Architecture Comparison

### 1.1 Physics Initialization Pattern

**Jenga (Preferred)**
```typescript
// Clean module passing
export async function initRapier(): Promise<typeof RAPIER> {
  const RAPIER = await import('@dimforge/rapier3d-compat');
  await RAPIER.init();
  return RAPIER;
}

// Usage: module passed to physics class
const RAPIER = await initRapier();
const physics = new RapierPhysics(RAPIER, config);
```

**ISS Docking (Problematic)**
```typescript
// Relies on global hack
export const initSpacePhysics = async () => {
  const RAPIER = await import('@dimforge/rapier3d-compat');
  await RAPIER.init();
  (globalThis as any).RAPIER = RAPIER;  // ❌ Anti-pattern
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  return new SpacePhysics(world);
};

// Usage: accesses global
const RAPIER = (globalThis as any).RAPIER;
```

**Recommendation:** Migrate ISS Docking to Jenga's pattern.

---

### 1.2 Folder Structure Comparison

**Jenga (Preferred)**
```
src/games/jenga/
├── domain/           # Business logic
│   ├── Block.ts      # Entity with physics binding
│   ├── Tower.ts      # Aggregate root
│   └── GameState.ts  # Game session state
├── physics/          # Physics wrapper
│   └── RapierPhysics.ts
├── components/       # React Three Fiber views
│   ├── TowerView.tsx
│   ├── BlockView.tsx
│   ├── HUD.tsx
│   └── PointerDot.tsx
├── hooks/            # Reusable interaction logic
│   ├── useGrabController.ts
│   └── useGameLoop.ts
├── utils/            # Helpers
│   └── generateTower.ts
└── config/           # Constants
    └── constants.ts
```

**ISS Docking (Incomplete)**
```
src/games/iss-docking-3d/
├── domain/
│   └── ISSShip.ts          # ❌ Not integrated with physics
├── physics/
│   └── SpacePhysics.ts     # ❌ Uses global hack
├── components/
│   ├── ShipView.tsx        # ✅ Presentational
│   └── ISSView.tsx
└── hooks/                  # ❌ Missing - logic in page
```

**Recommendation:** Restructure ISS Docking to match Jenga's completeness.

---

### 1.3 Game State Management

**Jenga (Preferred)**
```typescript
class JengaGameState {
  readonly tower: JengaTower;
  readonly gameMode: GameMode;
  private _phase: TurnPhase = 'select';
  private _gameOver: boolean = false;
  
  // Phase management
  grabBlock(block: JengaBlock): boolean;
  startExtract(): void;
  completeExtract(): boolean;
  placeOnTop(): boolean;
  checkStability(): void;
  
  // Callbacks for UI updates
  onPhaseChange?: (phase: TurnPhase) => void;
  onGameOver?: (winner: number | null) => void;
}
```

**ISS Docking (Missing)**
```typescript
// ❌ No state class - everything in component
const [shipState, setShipState] = useState({
  position: new Vector3(0, 0, 50),
  rotation: new Quaternion(),
});

// ❌ No mission phases
// ❌ No win/lose conditions
// ❌ No objective tracking
```

**Recommendation:** Create `ISSMission` class following Jenga patterns.

---

## 2. Extractable Common Utilities

### 2.1 Shared Physics Module

Create `src/games/shared/physics/`:

```typescript
// games/shared/physics/RapierPhysics.ts
export class RapierPhysics {
  world: RAPIER.World;
  rapierModule: typeof RAPIER;
  
  constructor(rapierModule: typeof RAPIER, config: PhysicsWorldConfig);
  step(): void;
  createGround(): void;
  createBody(id: string, desc: BodyDesc): RAPIER.RigidBody;
  raycast(origin: Vector3, direction: Vector3): RaycastHit | null;
}

// games/shared/physics/init.ts
export async function initRapier(): Promise<typeof RAPIER>;

// games/shared/physics/types.ts
export interface PhysicsWorldConfig {
  gravity: { x: number; y: number; z: number };
  timestep: number;
  substeps: number;
}
```

**Games affected:** Jenga, ISS Docking, and all future 3D games.

---

### 2.2 Shared Game Loop Hook

Jenga's `useGameLoop` can be generalized:

```typescript
// games/shared/hooks/useGameLoop.ts
export function useGameLoop<T extends { 
  phase: string; 
  isGameOver: boolean;
  forceUpdate: () => void;
}>(
  gameState: T | null,
  isActive: boolean,
  settleTime?: number
);
```

**Games affected:** Jenga, ISS Docking, and all future 3D games.

---

### 2.3 Shared Controller Hooks

```typescript
// games/shared/hooks/useKeyboardControls.ts
export function useKeyboardControls(
  keyMap: Record<string, () => void>
): void;

// games/shared/hooks/useRaycastSelector.ts
export function useRaycastSelector<T>(
  items: T[],
  getPosition: (item: T) => Vector3,
  onSelect: (item: T) => void
);
```

---

## 3. Specific Improvements for ISS Docking

### 3.1 Missing Domain Model

Create `src/games/iss-docking-3d/domain/ISSMission.ts`:

```typescript
export type MissionPhase = 
  | 'approach'      // Moving toward ISS
  | 'alignment'     // Rotating to match orientation
  | 'docking'       // Fine maneuvering
  | 'locked'        // Successful dock
  | 'failed';       // Collision or timeout

export interface MissionObjective {
  distance: number;        // Target distance from ISS
  alignment: number;       // Angular alignment (0-1)
  velocity: number;        // Maximum approach velocity
}

export class ISSMission {
  readonly ship: Spacecraft;
  readonly iss: SpaceStation;
  private _phase: MissionPhase = 'approach';
  private _objective: MissionObjective;
  private _startTime: number = Date.now();
  
  // State transitions
  checkApproach(): boolean;
  checkAlignment(): boolean;
  attemptDock(): boolean;
  checkFailure(): boolean;
  
  // Metrics for HUD
  getDistance(): number;
  getAlignment(): number;
  getRelativeVelocity(): number;
  getElapsedTime(): number;
  
  // Callbacks
  onPhaseChange?: (phase: MissionPhase) => void;
  onMissionComplete?: (success: boolean, time: number) => void;
}
```

### 3.2 Missing Mission HUD

Create `src/games/iss-docking-3d/components/MissionHUD.tsx`:

```typescript
interface MissionHUDProps {
  mission: ISSMission | null;
  onAbort: () => void;
  onRestart: () => void;
}

// Shows:
// - Distance to ISS
// - Velocity vector
// - Alignment indicator
// - Mission phase
// - Elapsed time
// - Abort/Restart buttons
```

### 3.3 Missing Controller Hook

Create `src/games/iss-docking-3d/hooks/useSpacecraftControls.ts`:

```typescript
interface ControlsConfig {
  thrustScale: number;
  torqueScale: number;
  deadzone: number;
}

export function useSpacecraftControls(
  physics: SpacePhysics,
  config: ControlsConfig
) {
  // Handles keyboard/gamepad input
  // Applies forces to physics body
  // Returns control state for HUD
}
```

### 3.4 Missing Integration with GameShell

Current ISS Docking:
```typescript
// ❌ Raw div, no GameShell
<div style={{ width: '100vw', height: '100vh', background: '#000' }}>
  <Canvas>...</Canvas>
</div>
```

Should be:
```typescript
// ✅ Standard wrapper
<GameShell gameId="iss-docking-3d" gameName="ISS Docking 3D">
  <GameContainer title="ISS Docking" onHome={() => navigate('/games')}>
    {/* Canvas here */}
  </GameContainer>
</GameShell>
```

---

## 4. Improvements for Jenga

### 4.1 Extract Physics-Sync Component

Move the inline `PhysicsSync` to shared:

```typescript
// games/shared/components/PhysicsSync.tsx
export function PhysicsSync({
  physics: { step: () => void };
  isActive: boolean;
}): null;
```

### 4.2 Camera Configuration

Jenga's camera constants are inline. Extract to shared:

```typescript
// games/shared/config/camera.ts
export const DEFAULT_3D_CAMERA = {
  minDistance: 12,
  maxDistance: 35,
  minPolarAngle: Math.PI / 6,
  maxPolarAngle: Math.PI / 2 - 0.05,
};
```

### 4.3 Add Alternative Controls

ISS Docking's keyboard controls could be an alternative input mode:

```typescript
// In Jenga
enum InputMode {
  MOUSE = 'mouse',
  KEYBOARD = 'keyboard',
  HAND_TRACKING = 'hand',
}

// Keyboard mode: arrow keys to select block, space to grab, wasd to extract
```

---

## 5. Recommended Implementation Plan

### Phase 1: Shared Infrastructure (1-2 days)

1. Create `src/games/shared/` folder structure
2. Extract `RapierPhysics` base class from Jenga
3. Extract `useGameLoop` hook
4. Extract `PhysicsSync` component
5. Create common types and constants

**Files to create:**
```
src/games/shared/
├── physics/
│   ├── RapierPhysics.ts
│   ├── init.ts
│   └── types.ts
├── hooks/
│   ├── useGameLoop.ts
│   └── usePhysicsSync.ts
├── components/
│   └── PhysicsSync.tsx
└── config/
    └── camera.ts
```

### Phase 2: Refactor Jenga (1 day)

1. Update Jenga to use shared utilities
2. Verify no regressions
3. Document any game-specific extensions

### Phase 3: Refactor ISS Docking (2-3 days)

1. Create proper domain model (`ISSMission`, `Spacecraft`, `DockingPort`)
2. Create `MissionHUD` component
3. Create `useSpacecraftControls` hook
4. Wrap with `GameShell` and `GameContainer`
5. Migrate to shared physics utilities
6. Add win/lose conditions

**Files to create/modify:**
```
src/games/iss-docking-3d/
├── domain/
│   ├── ISSMission.ts      (NEW)
│   ├── Spacecraft.ts      (NEW - integrate ISSShip)
│   └── DockingPort.ts     (NEW)
├── physics/
│   └── SpacePhysics.ts    (MODIFY - use shared)
├── components/
│   └── MissionHUD.tsx     (NEW)
├── hooks/
│   └── useSpacecraftControls.ts  (NEW)
└── index.ts               (NEW - exports)
```

### Phase 4: 3D Game Template (1 day)

Create `src/games/template-3d/` as a starter for future games:

```
template-3d/
├── README.md              # Getting started guide
├── domain/
│   ├── GameState.ts       # Stub with phases
│   └── Entity.ts          # Stub with physics binding
├── physics/
│   └── GamePhysics.ts     # Uses shared RapierPhysics
├── components/
│   ├── GameScene.tsx      # Basic R3F setup
│   ├── EntityView.tsx     # Stub view component
│   └── HUD.tsx            # Basic HUD shell
├── hooks/
│   └── useGameControls.ts # Stub controller
└── index.ts
```

---

## 6. Code Samples

### 6.1 Shared RapierPhysics Base Class

```typescript
// src/games/shared/physics/RapierPhysics.ts
import type RAPIER from '@dimforge/rapier3d-compat';
import { Vector3 } from 'three';

export interface PhysicsWorldConfig {
  gravity: { x: number; y: number; z: number };
  timestep: number;
  substeps: number;
}

export interface RaycastHit {
  body: RAPIER.RigidBody;
  point: { x: number; y: number; z: number };
  distance: number;
}

export class RapierPhysics {
  world: RAPIER.World;
  rapierModule: typeof RAPIER;
  private bodies: Map<string, RAPIER.RigidBody> = new Map();

  constructor(rapierModule: typeof RAPIER, config: PhysicsWorldConfig) {
    this.rapierModule = rapierModule;
    this.world = new rapierModule.World(config.gravity);
  }

  step(): void {
    this.world.step();
  }

  createGround(size: number = 50): void {
    const RAPIER = this.rapierModule;
    const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, -0.1, 0);
    const ground = this.world.createRigidBody(groundDesc);
    const colliderDesc = RAPIER.ColliderDesc.cuboid(size, 0.1, size)
      .setFriction(1.0)
      .setRestitution(0.0);
    this.world.createCollider(colliderDesc, ground);
  }

  createBody(
    id: string,
    desc: RAPIER.RigidBodyDesc,
    colliderDesc: RAPIER.ColliderDesc
  ): RAPIER.RigidBody {
    const body = this.world.createRigidBody(desc);
    this.world.createCollider(colliderDesc, body);
    this.bodies.set(id, body);
    return body;
  }

  getBody(id: string): RAPIER.RigidBody | undefined {
    return this.bodies.get(id);
  }

  raycast(origin: Vector3, direction: Vector3): RaycastHit | null {
    const RAPIER = this.rapierModule;
    const ray = new RAPIER.Ray(
      { x: origin.x, y: origin.y, z: origin.z },
      { x: direction.x, y: direction.y, z: direction.z }
    );
    const hit = this.world.castRay(ray, 100, true);
    
    if (hit) {
      const body = hit.collider.parent();
      if (!body) return null;
      const point = ray.pointAt(hit.timeOfImpact);
      return {
        body,
        point: { x: point.x, y: point.y, z: point.z },
        distance: hit.timeOfImpact,
      };
    }
    return null;
  }
}

export async function initRapier(): Promise<typeof RAPIER> {
  const RAPIER = await import('@dimforge/rapier3d-compat');
  await RAPIER.init();
  return RAPIER;
}
```

### 6.2 ISS Docking Mission State (Target)

```typescript
// src/games/iss-docking-3d/domain/ISSMission.ts
export type MissionPhase = 
  | 'approach' 
  | 'alignment' 
  | 'docking' 
  | 'locked' 
  | 'failed';

export interface MissionConfig {
  targetDistance: number;      // meters
  maxApproachVelocity: number; // m/s
  alignmentTolerance: number;  // degrees
  timeLimit: number;           // seconds
}

export class ISSMission {
  private _phase: MissionPhase = 'approach';
  private _startTime: number = Date.now();
  private _shipDistance: number = 50;
  private _alignment: number = 0;
  
  constructor(
    private config: MissionConfig,
    private physics: SpacePhysics
  ) {}

  update(): void {
    const state = this.physics.getShipState();
    const issState = this.physics.getISSState();
    
    // Calculate metrics
    this._shipDistance = this.calculateDistance(state.translation, issState.translation);
    this._alignment = this.calculateAlignment(state.rotation, issState.rotation);
    
    // Check phase transitions
    switch (this._phase) {
      case 'approach':
        if (this._shipDistance < 10) {
          this.setPhase('alignment');
        }
        break;
      case 'alignment':
        if (this._alignment > 0.95) {
          this.setPhase('docking');
        }
        break;
      case 'docking':
        if (this._shipDistance < 1 && this._alignment > 0.98) {
          this.setPhase('locked');
        }
        break;
    }
    
    // Check failure
    if (this.checkFailure()) {
      this.setPhase('failed');
    }
  }

  private setPhase(phase: MissionPhase): void {
    this._phase = phase;
    this.onPhaseChange?.(phase);
    
    if (phase === 'locked' || phase === 'failed') {
      const time = (Date.now() - this._startTime) / 1000;
      this.onMissionComplete?.(phase === 'locked', time);
    }
  }

  // ... getters, helpers, callbacks
}
```

---

## 7. Risks and Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Refactoring breaks Jenga | Medium | High | Comprehensive testing before merge |
| Shared physics too generic | Low | Medium | Allow game-specific extensions |
| ISS Docking scope creep | High | Medium | Strict phase-by-phase implementation |
| Breaking changes for other games | Low | High | Only affect 3D games in beta |

---

## 8. Acceptance Criteria

### Shared Infrastructure
- [ ] `games/shared/physics/RapierPhysics.ts` exists and compiles
- [ ] Jenga uses shared physics without regression
- [ ] ISS Docking uses shared physics
- [ ] `useGameLoop` hook extracted and reused

### ISS Docking Improvements
- [ ] `ISSMission` state class implemented
- [ ] Mission HUD displays distance, velocity, alignment
- [ ] Win/lose conditions work (dock successfully or crash)
- [ ] Wrapped in `GameShell` and `GameContainer`
- [ ] No `(globalThis as any)` hacks

### Documentation
- [ ] 3D game template created
- [ ] README explains architecture patterns
- [ ] Migration guide for future 3D games

---

## 9. Related Documents

- `docs/JENGA_PARITY_AUDIT.md` - Detailed Jenga analysis
- `docs/jenga_3d_analysis_report.md` - Antigravity's modernization analysis
- `docs/implementation-plans/iss_docking_3d_plan.md` - ISS Docking plan
- `docs/implementation-plans/jenga_modernization_plan.md` - Jenga plan

---

**Next Action:** Create worklog ticket for Phase 1 implementation.
