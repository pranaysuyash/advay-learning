# Game Engines & Physics Architecture

**Date:** 2026-03-13  
**Status:** Current Stack + Research Document  
**Applies to:** All current and future games

---

## Current Stack (Production)

### 3D Games Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React + TypeScript                       │
│                        (UI Layer)                           │
├─────────────────────────────────────────────────────────────┤
│              React Three Fiber (R3F)                        │
│              (React renderer for Three.js)                  │
├─────────────────────────────────────────────────────────────┤
│                    Three.js                                 │
│              (3D Rendering Engine)                          │
├─────────────────────────────────────────────────────────────┤
│                   Rapier Physics                            │
│          (@dimforge/rapier3d-compat)                        │
│       (WASM-based 3D Physics Engine)                        │
└─────────────────────────────────────────────────────────────┘
```

### Core Libraries

| Library | Version | Purpose | Games Using |
|---------|---------|---------|-------------|
| `three` | Latest | 3D rendering | DigitalJenga3D, all 3D games |
| `@react-three/fiber` | Latest | React integration | All 3D games |
| `@react-three/drei` | Latest | Helpers (camera, controls, etc.) | All 3D games |
| `@dimforge/rapier3d-compat` | ^0.19.3 | Physics simulation | DigitalJenga3D |
| `@react-three/cannon` | ^6.6.0 | Physics (legacy) | DressForWeather3D, older games |

---

## Physics Engine Comparison

### Primary: Rapier (Current Choice ✅)

**Why We Use It:**
- 2-5x faster than alternatives (2025 SIMD optimizations)
- Excellent React Three Fiber integration (`@react-three/rapier`)
- Modern WASM-based, deterministic
- Built-in CCD (Continuous Collision Detection) for fast-moving objects
- Small bundle size (~300KB WASM)

**Best For:**
- Tower/stacking games (Jenga)
- Games requiring realistic physics
- High-performance needs

**Example:**
```typescript
import { initRapier, RapierPhysics } from '../games/jenga/physics/RapierPhysics';

// Initialize
const RAPIER = await initRapier();
const physics = new RapierPhysics(RAPIER, {
  gravity: { x: 0, y: -9.82, z: 0 },
  timestep: 1/60,
  substeps: 4
});

// Create block
const body = physics.createBlock(id, position, rotation);
```

### Alternative: Cannon.js / cannon-es (Legacy ⚠️)

**Status:** Still used in older games, migrating away

**Pros:**
- Pure JavaScript (no WASM loading)
- Mature, well-documented
- `@react-three/cannon` integration

**Cons:**
- Slower than Rapier
- No active development
- Less accurate collision detection
- No CCD (objects can tunnel through)

**Migration Path:**
- Existing games: Keep until major rewrite
- New games: Use Rapier instead

### Alternative: Ammo.js (Consider for Specific Needs ⚠️)

**When to Consider:**
- Need Bullet physics compatibility
- Complex collision shapes (concave meshes)
- Ragdoll physics for characters

**Cons:**
- Large bundle size (~1.5MB)
- Slower than Rapier
- Complex API

**Verdict:** Only use if Rapier can't handle your specific use case.

### Alternative: PhysX (Overkill ❌)

**When to Consider:**
- Professional-grade simulation
- Complex scenes with 1000+ rigid bodies
- Clothing/destructible physics

**Cons:**
- Complex integration
- Overkill for kids games
- Limited web tooling

**Verdict:** Not recommended for our use case.

### 2D Physics: Matter.js (For 2D Games ✅)

**When to Use:**
- Pure 2D games (platformers, puzzles)
- No need for 3D depth
- Lightweight (~87KB)

**Example Use Cases:**
- Pinball
- Block-stacking 2D
- Simple platformers

---

## Complete Game Engine Alternatives

### Babylon.js (Complex 3D Alternative ⚠️)

**When to Consider:**
- Need built-in Havok physics (100x faster)
- Complex 3D scenes with lighting/particles
- First-person camera games
- Professional asset pipeline

**Cons:**
- Larger learning curve
- Less React integration
- More opinionated than R3F

**Verdict:** Consider for future complex 3D games, not for current stack migration.

### PlayCanvas (Rapid Prototyping ⚠️)

**When to Consider:**
- Rapid 3D game prototyping
- Visual editor needed
- Team has no React experience

**Cons:**
- Private projects cost $15+/month
- Less control than custom stack
- Vendor lock-in

**Verdict:** Good for prototypes, not for production.

### Unity WebGL (Avoid ❌)

**Why Not:**
- 15-50MB bundles
- 8-30 second load times
- Poor WebGPU support
- Memory issues in browsers

**Verdict:** Not suitable for web-first kids games.

### Godot Web Export (Desktop-First ⚠️)

**Why Not Primary:**
- Web is secondary platform
- Performance issues
- Larger bundle than custom stack

**Verdict:** Good for desktop-first games, not web-first.

---

## 2D Game Frameworks

### PixiJS (2D Rendering ✅)

**When to Use:**
- 2D games needing 100k+ sprites
- WebGPU acceleration (v8+)
- Particle effects

**Integration:** Can work alongside React

### Phaser (Complete 2D Game Engine ✅)

**When to Use:**
- Dedicated 2D games
- Physics-heavy 2D (Arcade Physics built-in)
- Tilemaps, spritesheets
- ~200KB bundle

**Best For:**
- Platformers
- Puzzle games
- Arcade-style games

---

## Decision Matrix

| Game Type | Recommended Stack | Alternative |
|-----------|------------------|-------------|
| 3D Physics (Jenga) | R3F + Rapier | Babylon + Havok |
| 3D Visual (simple) | R3F + Drei | Three.js raw |
| 2D Physics | Phaser | PixiJS + Matter.js |
| 2D Simple | PixiJS | CSS Canvas |
| CV/Hand Tracking | React + MediaPipe | TensorFlow.js |

---

## Current Game Stack Assignments

| Game | Stack | Physics | Notes |
|------|-------|---------|-------|
| DigitalJenga | R3F + Rapier | ✅ Full 3D | Reference implementation |
| DressForWeather3D | R3F + Cannon | ⚠️ Legacy | Migrate to Rapier |
| BubblePop | React + Canvas | ❌ None | Simple animations |
| AlphabetGame | React + MediaPipe | ❌ None | CV-based |
| PlanetSandbox | R3F + Custom | ⚠️ Simple | Orbital mechanics |
| PhysicsPlayground | R3F + Cannon | ⚠️ Legacy | Use Rapier for new features |

---

## Future Game Recommendations

### Use Rapier (R3F Stack) For:
- Any tower/stacking game
- Games with realistic collisions
- Games needing CCD (fast objects)
- Performance-critical physics

### Use Phaser For:
- 2D platformers
- Classic arcade games
- Tile-based games
- Games not needing 3D depth

### Use Babylon.js For:
- Complex 3D adventure games
- FPS-style games
- Games needing advanced lighting/shadows
- When Havok physics is required

---

## Migration Path

### From Cannon.js to Rapier

```typescript
// Old (Cannon.js)
import { useBox } from '@react-three/cannon';
const [ref, api] = useBox(() => ({ mass: 1, position: [0, 0, 0] }));

// New (Rapier)
import { initRapier, RapierPhysics } from './physics/RapierPhysics';
const physics = new RapierPhysics(RAPIER, config);
const body = physics.createBlock(id, position, rotation);
```

See `src/games/jenga/` for full Rapier implementation example.

---

## Resources

- **Rapier:** https://rapier.rs/ | https://github.com/pmndrs/react-three-rapier
- **React Three Fiber:** https://docs.pmndrs.react-three-fiber.org/
- **Three.js:** https://threejs.org/
- **Babylon.js:** https://www.babylonjs.com/
- **Phaser:** https://phaser.io/
- **Matter.js:** https://brm.io/matter-js/

---

## Research Document

Full comparison research: [PHYSICS_ENGINES_GAME_FRAMEWORKS_RESEARCH.md](../research/PHYSICS_ENGINES_GAME_FRAMEWORKS_RESEARCH.md)

---

**Last Updated:** 2026-03-13  
**Owner:** Architecture Team  
**Review Schedule:** Quarterly or when adding new game types
