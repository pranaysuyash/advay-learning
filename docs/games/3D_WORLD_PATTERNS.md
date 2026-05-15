# 3D World - Technical Patterns & Best Practices

**Date:** 2026-04-01  
**Games:** 11 3D games  
**Stack:** React Three Fiber + Rapier Physics + Three.js

---

## Executive Summary

3D World games use a distinct technical stack with specific patterns for physics, rendering, and CV interaction in 3D space.

| Component | Technology |
|-----------|------------|
| **3D Engine** | React Three Fiber (R3F) |
| **Physics** | Rapier (WASM) |
| **Rendering** | Three.js WebGL |
| **CV Integration** | Hand tracking with depth perception |

---

## 1. Architecture Overview

### 3D Game Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Component                          │
│                   (Game logic, state)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 React Three Fiber Canvas                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Scene     │  │   Lights    │  │   Camera Controls   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Rapier Physics World                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  RigidBodies│  │  Colliders  │  │  Joints/Constraints │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Three.js Rendering                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Meshes     │  │  Materials  │  │   Transformations   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Shared 3D Components

### Common Components (Used Across 3D Games)

| Component | Purpose | Games Using |
|-----------|---------|-------------|
| `PhysicsWorld` | Rapier physics setup | All 11 |
| `RigidBody` | Physics-enabled objects | All 11 |
| `OrbitControls` | Camera manipulation | 8 games |
| `Environment` | Lighting/skybox | 6 games |
| `ShadowRenderer` | Shadow mapping | 9 games |

### 3D-Specific UI Components

| Component | Purpose | Notes |
|-----------|---------|-------|
| `HandCursor3D` | 3D cursor projection | Converts 2D hand to 3D ray |
| `PinchDetector3D` | 3D selection | Raycast from cursor |
| `StabilityMeter` | Physics stability | Jenga-specific |

---

## 3. Physics Patterns (Rapier)

### Physics Configuration

```typescript
// Standard Rapier setup from 3D games
const PHYSICS_CONFIG = {
  gravity: [0, -9.81, 0],      // Realistic gravity
  timestep: 1/60,               // 60 FPS physics
  substeps: 4,                  // Stability
  solverIterations: 4,          // Constraint solving
};
```

### RigidBody Types by Game

| Game | Static | Dynamic | Kinematic |
|------|--------|---------|-----------|
| Digital Jenga | Base platform | 54 blocks | None |
| Obstacle Course | Ground, walls | Player | Moving platforms |
| Feed Monster | Monster, ground | Food items | Mouth animation |
| Dress Up | Character base | Clothing | None |
| Bubbles | None | Bubbles (float) | None |

### Common Collider Shapes

| Shape | Use Case | Performance |
|-------|----------|-------------|
| `cuboid` | Blocks, walls | ✅ Fast |
| `sphere` | Bubbles, balls | ✅ Fast |
| `cylinder` | Towers, poles | ✅ Medium |
| `trimesh` | Complex meshes | ⚠️ Slow |
| `convexHull` | Custom shapes | ⚠️ Medium |

### Physics Materials

| Material | Friction | Restitution | Games |
|----------|----------|-------------|-------|
| Wood (Jenga) | 0.8 | 0.1 | Digital Jenga |
| Bouncy | 0.3 | 0.9 | Virtual Bubbles |
| Metal | 0.4 | 0.2 | Circuit Builder |
| Plastic | 0.5 | 0.3 | Dress Up |

---

## 4. CV in 3D Space

### Hand Tracking to 3D

| Aspect | 2D Games | 3D Games |
|--------|----------|----------|
| Input | Screen X,Y | Normalized X,Y |
| Conversion | Direct | Raycasting |
| Depth | N/A | Z from camera or physics |

### 3D Cursor Implementation

```typescript
// Pattern from Digital Jenga
const handPosition = useGameHandTracking();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(
  handPosition.x * 2 - 1,  // Normalize to -1 to 1
  -(handPosition.y * 2 - 1)
);

raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children);
```

### 3D Selection Mechanisms

| Mechanism | Games | Use Case |
|-----------|-------|----------|
| Raycast + pinch | Jenga, Bubbles | Object selection |
| Proximity hover | Dress Up | Attachment points |
| Physics grab | Jenga | Drag with constraints |

---

## 5. Performance Optimization

### Rendering Optimizations

| Technique | Games Using | Impact |
|-----------|-------------|--------|
| InstancedMesh | Shape Safari, Bubbles | High |
| LOD (Level of Detail) | Obstacle Course | Medium |
| Frustum culling | All games | Automatic |
| Shadow optimization | All games | Medium |
| Physics sleep | Jenga | High |

### Physics Optimizations

```typescript
// From Digital Jenga - physics sleep
rb.sleep();  // When block is stable
rb.wakeUp(); // When interacted with
```

| Optimization | When to Use |
|--------------|-------------|
| Sleep bodies | Static or stable objects |
| Disable collisions | Non-interacting objects |
| Simplified colliders | Complex meshes |
| Fixed timestep | Consistent physics |

### Performance Targets

| Metric | Target | Current (Jenga) |
|--------|--------|-----------------|
| FPS | 60 | 60 ✅ |
| Physics ms/frame | < 3ms | ~2ms ✅ |
| Draw calls | < 100 | ~45 ✅ |
| Memory | < 200MB | ~150MB ✅ |

---

## 6. Asset Management

### 3D Asset Types

| Type | Format | Loading |
|------|--------|---------|
| Models | GLTF/GLB | Lazy load |
| Textures | PNG/WebP | Preload critical |
| Materials | JSON | Inline |
| Physics data | JSON | Generate at runtime |

### Asset Loading Pattern

```typescript
// From 3D World games
import { useGLTF } from '@react-three/drei';

function GameObject() {
  const { scene } = useGLTF('/assets/models/character.glb');
  return <primitive object={scene} />;
}
```

### Critical Assets (Preload)

| Asset | Priority | Games |
|-------|----------|-------|
| Kenney UI elements | Critical | All |
| Base physics shapes | Critical | All |
| Character models | High | Dress Up, Monster |
| Environment | Medium | Obstacle Course |

---

## 7. Lighting & Rendering

### Lighting Setups

| Game | Primary Light | Shadows | Environment |
|------|---------------|---------|-------------|
| Digital Jenga | Directional | Soft | Studio |
| Obstacle Course | Hemisphere + Directional | Hard | Outdoor |
| Dress Up | Point + Ambient | Soft | Indoor |
| Bubbles | Ambient + Point | None | Underwater |

### Shadow Configuration

```typescript
// Standard 3D World shadow setup
<directionalLight
  castShadow
  shadow-mapSize={[2048, 2048]}
  shadow-camera-near={0.1}
  shadow-camera-far={50}
  shadow-bias={-0.001}
/>
```

### Post-Processing

| Effect | Games | Performance |
|--------|-------|-------------|
| Bloom | Bubbles | Medium |
| SSAO | None | High cost |
| FXAA | All | Low |
| Color grading | Dress Up | Low |

---

## 8. Camera Patterns

### Camera Types

| Type | Games | Controls |
|------|-------|----------|
| Orbit | Jenga, Bubbles | Mouse/hand rotate |
| Follow | Obstacle Course | Tracks player |
| Fixed | Dress Up | Static view |
| Cinematic | Story moments | Scripted |

### Camera Configuration

```typescript
// From Digital Jenga
<OrbitControls
  enablePan={false}
  enableZoom={true}
  minDistance={3}
  maxDistance={10}
  minPolarAngle={Math.PI / 6}
  maxPolarAngle={Math.PI / 2.5}
/>
```

---

## 9. Interaction Patterns

### 3D Manipulation

| Interaction | Implementation | Games |
|-------------|----------------|-------|
| Grab and drag | Physics constraints | Jenga |
| Point and click | Raycast selection | Bubbles |
| Hover highlight | Emissive material | Dress Up |
| Proximity trigger | Distance check | Monster feeding |

### Hand-to-3D Mapping

```typescript
// Standard pattern
const hand2D = useGameHandTracking();  // 0-1 normalized
const hand3D = useMemo(() => ({
  x: (hand2D.x - 0.5) * viewport.width,
  y: (0.5 - hand2D.y) * viewport.height,
  z: 0  // Or raycast to find depth
}), [hand2D, viewport]);
```

---

## 10. Common Pitfalls

### Performance Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Frame drops | Too many physics bodies | Limit active bodies |
| Memory leaks | Unloaded assets | Proper disposal |
| Z-fighting | Overlapping faces | Offset or depth bias |
| Shadow acne | Bias too low | Increase shadow bias |

### Physics Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Jitter | Solver iterations too low | Increase iterations |
| Slow motion | Timestep too large | Use fixed timestep |
| Tunneling | Fast objects | Enable CCD or limit velocity |
| Unstable stacks | Friction too low | Tune material properties |

### CV Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Cursor drift | No depth perception | Raycast to surface |
| Missed selections | Small hit targets | Adaptive hit radius |
| Occlusion | Hand covers object | Virtual cursor offset |

---

## 11. Best Practices

### Do's

✅ Use instanced meshes for repeated objects  
✅ Enable physics sleep for stable objects  
✅ Preload critical assets  
✅ Use simplified colliders for complex meshes  
✅ Implement LOD for detailed models  
✅ Profile with React DevTools  

### Don'ts

❌ Update physics every frame unnecessarily  
❌ Use trimesh colliders for moving objects  
❌ Load all assets at once  
❌ Ignore mobile performance  
❌ Forget to dispose of Three.js objects  

---

## 12. Game-Specific Patterns

### Digital Jenga

| Pattern | Implementation |
|---------|----------------|
| Block extraction | Spring constraints with drag |
| Stability | COM + contact heuristics |
| Win detection | 54 blocks removed |
| Lose detection | Tower collapse physics |

### Obstacle Course 3D

| Pattern | Implementation |
|---------|----------------|
| Player movement | Kinematic body with velocity |
| Jump | Impulse force on input |
| Platforms | Static with moving kinematic |
| Collision | Sensor colliders for scoring |

### Feed the Monster 3D

| Pattern | Implementation |
|---------|----------------|
| Food throwing | Velocity-based trajectory |
| Mouth detection | Trigger collider |
| Monster animation | Blend shapes/morph targets |
| Satisfaction | State machine |

---

## 13. Testing 3D Games

### Manual Testing Checklist

- [ ] Physics feels realistic
- [ ] Hand tracking works in 3D space
- [ ] Camera controls are intuitive
- [ ] Shadows render correctly
- [ ] Performance is smooth (60 FPS)
- [ ] Works on target devices

### Automated Testing

| Test | Tool | Priority |
|------|------|----------|
| Physics stability | Jest + Rapier | High |
| Render performance | Lighthouse | Medium |
| Asset loading | Custom | Medium |
| CV accuracy | Manual | High |

---

## 14. Future Improvements

### Technical

- WebGPU renderer (when stable)
- Worker-based physics
- Procedural textures
- Compressed texture formats

### Gameplay

- Multiplayer physics sync
- AR mode (8th Wall)
- VR support (hand tracking)
- Cloud save for 3D states

---

## 15. Files & References

### Key Source Files

- `src/frontend/src/pages/DigitalJenga.tsx`
- `src/frontend/src/components/3d/PhysicsWorld.tsx`
- `src/frontend/src/hooks/use3DHandTracking.ts`
- `src/frontend/src/games/digitalJengaLogic.ts`

### External Documentation

- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- Rapier: https://rapier.rs/docs/
- Three.js: https://threejs.org/docs/

---

## 16. Quick Reference

### Rapier Body Types

```typescript
// Static - doesn't move
<RigidBody type="fixed" />

// Dynamic - physics controlled
<RigidBody type="dynamic" mass={1} />

// Kinematic - code controlled
<RigidBody type="kinematicPosition" />
```

### Common Colliders

```typescript
<Cuboid args={[width, height, depth]} />
<Sphere args={[radius]} />
<Cylinder args={[radius, height]} />
```

### Materials

```typescript
<meshStandardMaterial
  color="#d4a373"
  roughness={0.8}
  metalness={0.1}
/>
```

---

**Last Updated:** 2026-04-01  
**Maintainer:** 3D World Development Team
