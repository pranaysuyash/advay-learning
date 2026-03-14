# Physics Engines & Game Development Frameworks Research

**Date:** 2026-03-12  
**Purpose:** Evaluate alternatives to current stack (React + TypeScript + Three.js + Rapier) for browser-based kids learning games  
**Target Audience:** Development team working on kids learning game repo

---

## Executive Summary

For a browser-based kids learning game using React + TypeScript, the current stack of **Three.js + Rapier** remains highly competitive. Rapier has made significant performance improvements in 2025 (2-5x faster with SIMD), and the React Three Fiber ecosystem provides excellent React integration. However, alternatives exist depending on specific needs:

- **For 2D games:** Phaser or Matter.js
- **For complex 3D games:** Babylon.js (with Havok physics)
- **For rapid prototyping:** PlayCanvas
- **For native-quality web games:** Consider Godot or Unity WebGL export (with tradeoffs)

**Recommendation:** Stick with current stack for 3D learning games; consider Phaser for 2D games; evaluate Babylon.js if needing advanced built-in features.

---

## 1. Physics Engine Alternatives to Rapier

### 1.1 Cannon.js / cannon-es

**What it is:**  
A lightweight, pure JavaScript 3D physics engine inspired by three.js and Ammo.js. Cannon-es is the modern, maintained fork of the original Cannon.js.

**Pros for Kids Games:**
- Pure JavaScript - no WASM loading overhead
- Small bundle size (~100KB)
- Easy integration with Three.js
- Good for simple physics simulations
- Well-documented API

**Cons:**
- Less accurate than Rapier/Ammo.js
- No continuous collision detection (CCD) - fast objects can tunnel through walls
- Compound bodies have issues
- Slower than WASM-based engines for complex scenes
- Less active development than Rapier

**Integration Complexity:** Low  
**Performance:** Moderate - suitable for simple to medium complexity  
**License:** MIT  
**Verdict:** ⚠️ **Consider only for simple physics needs** - Rapier is better maintained and faster

---

### 1.2 Ammo.js (Bullet WASM)

**What it is:**  
JavaScript/WebAssembly port of the Bullet Physics engine - a professional-grade C++ physics engine used in AAA games (Red Dead Redemption, GTA V).

**Pros for Kids Games:**
- Battle-tested, 20+ years of development
- Highly accurate physics simulation
- Excellent vehicle physics
- Handles complex collisions well
- Good heightfield collision support

**Cons:**
- Large bundle size (~1.5MB+ WASM)
- WASM loading overhead
- No rolling friction support (must simulate with damping)
- JavaScript API is clunky (auto-generated from C++)
- Slower than Rapier in benchmarks (up to 9.88x slower than optimized WASM)

**Integration Complexity:** Medium-High  
**Performance:** Good accuracy, slower than Rapier  
**License:** zlib (permissive)  
**Verdict:** ⚠️ **Consider if you need specific Bullet features** - otherwise Rapier is faster and easier

---

### 1.3 PhysX (NVIDIA)

**What it is:**  
NVIDIA's physics engine, available for web through WASM builds. Powers many AAA games.

**Pros for Kids Games:**
- Excellent accuracy (mass/gravity simulations)
- GPU acceleration potential
- Professional-grade features
- Good performance on compatible hardware

**Cons:**
- Complex integration
- WASM bundle size
- Less documentation for web usage
- May be overkill for simple learning games
- Requires specific browser capabilities

**Integration Complexity:** High  
**Performance:** Good to excellent (hardware dependent)  
**License:** BSD-3 (open source since 2018)  
**Verdict:** ⚠️ **Consider for high-fidelity simulations** - likely overkill for most kids games

---

### 1.4 Oimo.js

**What it is:**  
Lightweight JavaScript 3D physics engine focused on performance.

**Pros for Kids Games:**
- Very fast for simple simulations
- Pure JavaScript - no WASM
- Small footprint
- Good for mobile browsers

**Cons:**
- Less accurate than Rapier/Ammo
- Last significant update was years ago
- Limited features compared to major engines
- Community smaller than Rapier
- Two competing versions (Oimo.js vs OimoPhysics) cause confusion

**Integration Complexity:** Low  
**Performance:** Fast but "cuts corners" in simulation  
**License:** MIT  
**Verdict:** ❌ **Not recommended** - Rapier is better in almost every way

---

### 1.5 Matter.js (2D Only)

**What it is:**  
A 2D rigid body physics engine specifically for the web.

**Pros for Kids Games:**
- Purpose-built for 2D
- ~87KB minified
- Excellent constraint system (springs, chains, pulleys)
- Great collision event system
- Works with Pixi.js, Three.js, or Canvas
- No WASM overhead
- Perfect for 2D puzzle/platformer games

**Cons:**
- 2D only - not suitable for 3D games
- No continuous collision detection (fast objects can pass through)
- Limited for complex physics simulations

**Integration Complexity:** Low  
**Performance:** Excellent for 2D  
**License:** MIT  
**Verdict:** ✅ **Strongly consider for 2D games** - best pure-JS 2D physics engine

---

### 1.6 Rapier (Current Stack)

**What it is:**  
Modern physics engine written in Rust, compiled to WASM for web use.

**Pros for Kids Games:**
- **2-5x faster in 2025** than 2024 versions (significant improvements)
- SIMD-accelerated NPM packages available
- Small bundle size (~300KB)
- Excellent TypeScript support
- Active development (Dimforge)
- Cross-platform determinism (great for multiplayer)
- Good balance of speed and accuracy
- Works well with React Three Fiber

**Cons:**
- Some accuracy issues compared to Ammo.js in specific scenarios (ragdolls, mass simulations)
- WASM loading requirement (async initialization)
- Newer - less "battle-tested" than Bullet

**Integration Complexity:** Low (especially with R3F)  
**Performance:** Excellent and improving  
**License:** Apache 2.0  
**Verdict:** ✅ **Keep current stack** - best overall choice for 3D web physics

---

## 2. Complete Game Engines

### 2.1 Babylon.js

**What it is:**  
Complete, open-source 3D game engine backed by Microsoft. Web-first design with enterprise features.

**Pros for Kids Games:**
- Built-in physics (Cannon.js, Oimo.js, Ammo.js, or Havok)
- **Havok Physics integration** - up to 100x faster than Ammo.js (according to benchmarks)
- Excellent WebXR support for VR/AR
- Node Material Editor (visual shader creation)
- Built-in Inspector and debugging tools
- Entity-Component-System architecture
- PBR rendering out of the box
- Strong enterprise support

**Cons:**
- Large bundle size (~2MB+)
- Steeper learning curve than Three.js
- Overkill for simple games
- Less React-friendly than R3F
- More opinionated than Three.js

**Integration Complexity:** Medium  
**Performance:** Excellent with Havok  
**License:** Apache 2.0  
**Verdict:** ✅ **Consider for complex 3D games** - especially with Havok physics

---

### 2.2 PlayCanvas

**What it is:**  
Open-source 3D game engine with a cloud-based visual editor.

**Pros for Kids Games:**
- Visual editor with real-time collaboration
- Mobile-first optimization
- Hot reloading (no browser refresh)
- Built-in Ammo.js physics
- Small engine footprint
- Zero compile time (JavaScript-based)
- Entity-Component-System

**Cons:**
- Private projects require paid plan ($15+/month)
- Cloud editor dependency (can work offline but limited)
- Less flexible than Three.js
- Fewer tutorials than Babylon/Three.js
- Collision offset limitations

**Integration Complexity:** Low-Medium  
**Performance:** Excellent on mobile  
**License:** MIT (engine), proprietary (editor)  
**Verdict:** ⚠️ **Consider for rapid prototyping** - free tier limitations may be problematic

---

### 2.3 Godot (Web Export)

**What it is:**  
Full-featured open-source game engine with HTML5 export capability.

**Pros for Kids Games:**
- Complete game editor (visual)
- GDScript (Python-like) or C#
- 2D and 3D support
- No licensing fees ever
- Large, active community
- Export to web, mobile, desktop, consoles
- Progressive Web App support

**Cons:**
- Web export is secondary priority (desktop is primary)
- Performance not as good as web-native engines
- WebGL 2.0 only (Compatibility renderer)
- C# not supported for web export in Godot 4
- Threading issues require workarounds (single-threaded mode default since 4.3)
- Larger bundle sizes than web-native solutions

**Integration Complexity:** Medium  
**Performance:** Good for simple games, struggles with complex scenes  
**License:** MIT  
**Verdict:** ⚠️ **Consider if already using Godot** - not ideal for web-first games

---

### 2.4 Unity (WebGL Export)

**What it is:**  
Industry-standard game engine with WebGL export option.

**Pros for Kids Games:**
- Powerful visual editor
- Built-in physics, animation, audio systems
- Massive asset store
- Large talent pool
- C# scripting
- State machines, blend trees

**Cons:**
- **Large bundle size** (5-25MB+ compressed, 25-50MB typical)
- **Long load times** (8-30 seconds typical)
- Mobile performance issues
- Single-threaded on WebGL
- Physics simulations differ from native builds
- License costs ($2,310/seat/year for Pro at $200K+ revenue)
- No WebGPU support (WebGL 2.0 only)
- Memory limits (2GB browser tab limit shared)

**Integration Complexity:** Medium-High  
**Performance:** Constrained by WASM overhead  
**License:** Free (revenue <$200K), Pro ($2,310/seat/year)  
**Verdict:** ❌ **Not recommended for web-first kids games** - bundle size and load time unacceptable for web

---

### 2.5 Unreal Engine (Web Export)

**What it is:**  
AAA game engine. HTML5 export was removed in UE5.

**Current Status:**
- **UE5 has NO built-in HTML5 export** (removed after UE 4.24)
- Community efforts exist but not production-ready
- Pixel Streaming is alternative but requires cloud infrastructure

**Verdict:** ❌ **Not viable** - no official web export in UE5

---

## 3. Frameworks

### 3.1 React Three Fiber (R3F) Ecosystem

**What it is:**  
React renderer for Three.js. Provides declarative, component-based 3D graphics in React.

**Pros for Kids Games:**
- **Perfect React integration** - state management, hooks, components
- Declarative scene graph
- Pointer events system (no manual raycasting)
- Excellent performance optimization tools
- Drei library provides useful abstractions
- PerformanceMonitor for adaptive quality
- Large, active community
- Post-processing simplified
- Physics via @react-three/rapier

**Cons:**
- React-specific (can't easily migrate away)
- Additional abstraction layer
- Need to understand both React and Three.js

**Integration Complexity:** Low (if already using React)  
**Performance:** Excellent with proper optimization  
**License:** MIT  
**Verdict:** ✅ **Keep using** - best choice for React-based 3D games

---

### 3.2 Three.js + Custom Physics

**What it is:**  
Core 3D library without React abstraction. Direct WebGL access.

**Pros for Kids Games:**
- Maximum flexibility and control
- Smallest possible bundle (tree-shakeable to ~500KB-1MB)
- Direct WebGL optimization access
- WebGPU support native (since r171)
- Largest community of web 3D
- Extensive examples and documentation
- Works with any physics engine

**Cons:**
- More verbose than R3F
- Manual state management
- No React integration (would need custom bridge)
- Must implement game systems from scratch

**Integration Complexity:** Medium-High  
**Performance:** Excellent (most optimized path)  
**License:** MIT  
**Verdict:** ✅ **Consider if leaving React** - best raw performance

---

### 3.3 PixiJS (2D)

**What it is:**  
Fast 2D rendering engine using WebGL with Canvas fallback.

**Pros for Kids Games:**
- **Extremely fast 2D rendering** - handles 100k+ sprites at 60fps
- WebGPU support in v8
- WebGL with Canvas fallback
- Excellent for UI-heavy games
- Batch rendering optimizations
- Texture atlases support
- Filters and effects built-in

**Cons:**
- 2D only (limited 3D support)
- Not a complete game framework (no physics, input handling)
- Learning curve for Flash-like API

**Integration Complexity:** Low  
**Performance:** Excellent for 2D  
**License:** MIT  
**Verdict:** ✅ **Strongly consider for 2D games** - best 2D renderer

---

### 3.4 Phaser (2D)

**What it is:**  
Complete 2D game framework built for browsers.

**Pros for Kids Games:**
- **Built specifically for browser games**
- Complete game framework (physics, audio, input, animation)
- Arcade Physics (simple, fast) and Matter.js integration
- WebGL and Canvas support
- Large community
- Excellent documentation
- React/Vue/Svelte integration templates
- Small bundle size (~200KB min+gz)
- Perfect for 2D platformers, puzzles, educational games

**Cons:**
- 2D only (3D on 2025 roadmap)
- Not suitable for 3D learning games

**Integration Complexity:** Low  
**Performance:** Excellent for 2D  
**License:** MIT  
**Verdict:** ✅ **Best choice for 2D games** - purpose-built for web games

---

## 4. Comparison Matrix

| Technology | Type | Bundle Size | 2D | 3D | Physics | React-Friendly | License | Recommendation |
|------------|------|-------------|----|----|---------|----------------|---------|----------------|
| **Rapier** | Physics | ~300KB | ❌ | ✅ | Built-in | ✅ (via R3F) | Apache 2.0 | ✅ Keep |
| **Cannon.js** | Physics | ~100KB | ❌ | ✅ | Built-in | ✅ | MIT | ⚠️ Simple only |
| **Ammo.js** | Physics | ~1.5MB | ❌ | ✅ | Built-in | ✅ | zlib | ⚠️ Accuracy needs |
| **Matter.js** | Physics | ~87KB | ✅ | ❌ | Built-in | ✅ | MIT | ✅ 2D games |
| **Babylon.js** | Engine | ~2MB | ✅ | ✅ | Multiple | ⚠️ | Apache 2.0 | ✅ Complex 3D |
| **PlayCanvas** | Engine | Small | ❌ | ✅ | Ammo.js | ⚠️ | MIT/Proprietary | ⚠️ Prototyping |
| **Godot Web** | Engine | Large | ✅ | ✅ | Built-in | ❌ | MIT | ⚠️ Desktop-first |
| **Unity WebGL** | Engine | 15-50MB | ✅ | ✅ | Built-in | ❌ | Commercial | ❌ Not recommended |
| **R3F** | Framework | ~600KB | ❌ | ✅ | Via Rapier | ✅ | MIT | ✅ Keep |
| **Three.js** | Framework | ~500KB-1MB | ❌ | ✅ | Any | ⚠️ (manual) | MIT | ✅ If no React |
| **PixiJS** | Framework | Small | ✅ | ❌ | Via Matter.js | ✅ | MIT | ✅ 2D games |
| **Phaser** | Framework | ~200KB | ✅ | ❌ | Arcade/Matter | ✅ | MIT | ✅ 2D games |

---

## 5. Recommendations by Use Case

### 5.1 Current 3D Learning Games (React Stack)

**Recommendation:** **Stay with React + Three.js + Rapier**

Rationale:
- Rapier has improved 2-5x in 2025
- Excellent React integration via R3F
- Good bundle size for web
- Active development
- Team already has expertise

---

### 5.2 New 2D Learning Games

**Primary Recommendation:** **Phaser**

Rationale:
- Purpose-built for web 2D games
- Complete framework (physics, audio, input)
- Small bundle size
- Excellent educational game examples
- Can still use React with integration templates

**Alternative:** PixiJS + Matter.js for more custom 2D rendering

---

### 5.3 Complex 3D Games (Not React)

**Recommendation:** **Babylon.js with Havok Physics**

Rationale:
- Havok physics is significantly faster
- Complete engine with editor features
- Better for non-React teams
- WebXR support for future VR learning

---

### 5.4 Rapid Prototyping

**Recommendation:** **PlayCanvas**

Rationale:
- Visual editor speeds up iteration
- Hot reloading
- Mobile optimization

Note: Consider free tier limitations

---

## 6. Migration Considerations

### From Rapier to Another Physics Engine

**Effort Level:** Medium-High

Things to consider:
- Physics API differences
- Initialization patterns (especially WASM async loading)
- Collision detection nuances
- Performance characteristics differ
- May need to retune physics parameters

**Only migrate if:**
- Specific physics features needed (e.g., Bullet's accuracy)
- Performance issues with Rapier (unlikely after 2025 improvements)

### From R3F to Another Framework

**Effort Level:** High

Things to consider:
- Loss of React integration
- Must rebuild state management
- Reimplement component architecture
- Team retraining required

**Only migrate if:**
- Leaving React entirely
- Performance absolutely critical (use Three.js directly)

---

## 7. Future Considerations

### WebGPU

- Three.js: Native support since r171 (Sept 2025)
- Babylon.js: Leading WebGPU integration
- PixiJS: v8 has WebGPU support
- Unity: No WebGPU export path announced
- Rapier: Exploring GPU physics (experimental)

**Impact:** Three.js and Babylon.js will see continued performance improvements. Unity WebGL export will fall further behind.

### WebAssembly Evolution

- WASI 0.3 expected to improve async capabilities
- Memory64 allows >4GB (theoretically 16 exabytes)
- Garbage Collection support maturing

**Impact:** Physics engines like Rapier will continue to improve in performance and capabilities.

---

## 8. Conclusion

For the current kids learning game project using React + TypeScript:

1. **Keep the current stack** (Three.js + Rapier + R3F) for 3D games
2. **Consider Phaser** for any 2D game spin-offs
3. **Monitor Rapier updates** - the 2025 improvements are significant
4. **Evaluate WebGPU** migration path for future performance gains

The grass is not significantly greener elsewhere for web-first, React-based educational 3D games. The current stack is modern, well-supported, and performant.

---

**Sources:**
- Rapier 2025 Review: https://dimforge.com/blog/2026/01/09/the-year-2025-in-dimforge/
- WebAssembly State 2025: https://platform.uno/blog/state-of-webassembly-2024-2025/
- Three.js vs Unity 2026: https://www.utsubo.com/blog/threejs-vs-unity-web-comparison
- Phaser Documentation: https://phaser.io/
- Babylon.js Features: https://www.babylonjs.com/
- PlayCanvas Documentation: https://playcanvas.com/
- Godot Web Export Docs: https://docs.godotengine.org/en/latest/tutorials/export/exporting_for_web.html
- Various community benchmarks and comparisons from three.js discourse
