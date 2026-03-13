# Three.js & OSS Libraries for Game Improvements

**Date:** 2026-03-10  
**Status:** Research & Recommendations  
**Scope:** Replacing "games for the sake of it" with proper 3D/physics gameplay

---

## Current Problem Analysis

### Games That Need Real 3D/Physics

| Game | Current Implementation | What's Wrong | Recommended Approach |
|------|----------------------|--------------|---------------------|
| **DigitalJenga** | 2D Canvas rectangles | No 3D tower, no physics, just colored blocks | Three.js + Cannon.js physics |
| **DressForWeather** | Drag-drop SVG icons | No character model, just icon placement | Three.js character + cloth physics |
| **VirtualBubbles** | Canvas circles | 2D circles, no bubble physics | Three.js + custom shaders |
| **ObstacleCourse** | 2D canvas game | No 3D depth, no real obstacles | Three.js + physics engine |
| **CuttingPractice** | Canvas lines | No depth, just 2D line following | Three.js + slicing physics |
| **Block-based games** | CSS rectangles | No physics, no real interaction | Matter.js or Cannon.js |

### Common Issues
1. **No depth perception** - Everything is 2D flat
2. **No physics** - Objects don't fall, collide, or behave realistically
3. **No proper assets** - Using colored rectangles instead of models
4. **Weak gameplay** - Just "click and watch" instead of skill-based

---

## Recommended Libraries

### 1. Three.js (3D Rendering)
**URL:** https://threejs.org/  
**License:** MIT  
**Use for:** All 3D games

```bash
npm install three @types/three
```

**Games to improve:**
- DigitalJenga - Real 3D tower with physics
- DressForWeather - 3D character you dress
- VirtualBubbles - 3D bubble physics
- ObstacleCourse - 3D runner with depth

**Example - 3D Jenga:**
```typescript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create tower
const blockGeometry = new THREE.BoxGeometry(3, 1, 0.6);
const blockMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x8B4513,
  roughness: 0.8 
});

// Stack blocks with physics
for (let i = 0; i < 16; i++) {
  const block = new THREE.Mesh(blockGeometry, blockMaterial);
  block.position.y = i * 1.0;
  block.rotation.y = (i % 2) * Math.PI / 2;
  scene.add(block);
}
```

---

### 2. Cannon.js / Rapier (Physics)
**URL:** https://github.com/pmndrs/cannon-es or https://rapier.rs/  
**License:** MIT / Apache 2.0  
**Use for:** Physics simulation

```bash
npm install cannon-es @types/cannon
# OR
npm install @dimforge/rapier3d
```

**Games to improve:**
- DigitalJenga - Real block physics, falling tower
- ObstacleCourse - Character jumping physics
- FeedTheMonster - Objects falling into mouth

**Example - Physics-enabled Jenga:**
```typescript
import * as CANNON from 'cannon-es';

// Physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Block physics body
const shape = new CANNON.Box(new CANNON.Vec3(1.5, 0.5, 0.3));
const body = new CANNON.Body({ mass: 1, shape });
world.addBody(body);

// Sync Three.js mesh with physics
function update() {
  mesh.position.copy(body.position);
  mesh.quaternion.copy(body.quaternion);
}
```

---

### 3. React Three Fiber (React + Three.js)
**URL:** https://docs.pmnd.rs/react-three-fiber  
**License:** MIT  
**Use for:** React-friendly 3D

```bash
npm install @react-three/fiber @react-three/drei
```

**Benefits:**
- Declarative React-style 3D
- Better performance management
- Easier integration with existing React games

**Example:**
```tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';

function JengaBlock({ position }) {
  const ref = useRef();
  
  return (
    <Box ref={ref} position={position} args={[3, 1, 0.6]}>
      <meshStandardMaterial color="#8B4513" />
    </Box>
  );
}

// In game render:
<Canvas>
  <OrbitControls />
  <ambientLight />
  <pointLight position={[10, 10, 10]} />
  {blocks.map((block, i) => (
    <JengaBlock key={i} position={block.position} />
  ))}
</Canvas>
```

---

### 4. Matter.js (2D Physics)
**URL:** https://brm.io/matter-js/  
**License:** MIT  
**Use for:** 2D physics games

```bash
npm install matter-js @types/matter-js
```

**Games to improve:**
- CountingCollectathon - Real falling objects
- CuttingPractice - Slicing physics
- ShapePop - Balloon physics

**Example:**
```typescript
import Matter from 'matter-js';

const engine = Matter.Engine.create();

// Create block
const block = Matter.Bodies.rectangle(400, 200, 80, 80);
Matter.Composite.add(engine.world, block);

// Update loop
function update() {
  Matter.Engine.update(engine, 16);
  // Sync positions to React state
}
```

---

### 5. Planck.js (2D Physics - Box2D)
**URL:** https://github.com/shakiba/planck.js  
**License:** MIT  
**Use for:** Lightweight 2D physics

Good for mobile performance.

---

### 6. Poly Haven (Free Assets)
**URL:** https://polyhaven.com/  
**License:** CC0  
**Use for:** Free 3D models, textures, HDRIs

**Assets needed:**
- Jenga wood textures
- Clothing item models
- Environment HDRIs

---

### 7. Kenney Assets (Already have)
**URL:** https://kenney.nl/  
**License:** CC0  

**3D Assets available:**
- Food items for FeedTheMonster
- Nature pack for backgrounds
- Platformer kit for characters

---

## Specific Game Improvements

### 1. Digital Jenga → Real 3D Jenga

**Current:** 2D canvas rectangles

**Improved with Three.js + Cannon.js:**
```typescript
// Full 3D tower with real physics
<Canvas camera={{ position: [10, 10, 10] }}>
  <OrbitControls enablePan={false} />
  <ambientLight intensity={0.5} />
  <directionalLight position={[5, 10, 5]} castShadow />
  
  {towerBlocks.map((block, i) => (
    <RigidBody key={i} position={block.position}>
      <Box args={[3, 1, 0.6]}>
        <meshStandardMaterial 
          map={woodTexture}
          roughness={0.8}
        />
      </Box>
    </RigidBody>
  ))}
  
  {/* Ground plane */}
  <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]}>
    <meshStandardMaterial color="#1a1a2e" />
  </Plane>
</Canvas>
```

**Features:**
- Real 3D tower with proper dimensions
- Physics-based block removal
- Camera orbit controls
- Shadows and lighting
- Falling physics when tower collapses

---

### 2. DressForWeather → 3D Character Dressing

**Current:** Drag icons onto background

**Improved with Three.js:**
```typescript
// 3D character you can rotate and dress
<Canvas>
  <OrbitControls target={[0, 1, 0]} />
  
  {/* 3D Character model */}
  <CharacterModel 
    shirt={selectedShirt}
    pants={selectedPants}
    shoes={selectedShoes}
  />
  
  {/* Clothing items to pick */}
  {clothingItems.map(item => (
    <Draggable3DItem 
      key={item.id}
      model={item.model}
      onDrop={(position) => dressCharacter(item, position)}
    />
  ))}
  
  {/* Environment based on weather */}
  {weather === 'rain' && <RainEffect />}
  {weather === 'snow' && <SnowEffect />}
</Canvas>
```

**Features:**
- 3D character that rotates
- Physics-based clothing draping
- Real-time weather effects
- Proper fit checking

---

### 3. VirtualBubbles → 3D Bubble Physics

**Current:** 2D canvas circles

**Improved with Three.js + Shaders:**
```typescript
// Realistic bubble rendering
function Bubble({ position, size }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <shaderMaterial
        vertexShader={bubbleVertexShader}
        fragmentShader={bubbleFragmentShader}
        uniforms={{
          time: { value: 0 },
          color: { value: new THREE.Color(0x88ccff) }
        }}
        transparent
      />
    </mesh>
  );
}
```

**Features:**
- Real bubble refraction
- 3D positioning
- Physics-based floating
- Pop effects with particles

---

### 4. ObstacleCourse → 3D Runner

**Current:** 2D canvas shapes

**Improved:**
```typescript
// Temple Run-style 3D runner
<Canvas>
  <PerspectiveCamera makeDefault position={[0, 2, 5]} />
  
  {/* Running track */}
  <Track />
  
  {/* Character */}
  <Runner 
    position={playerPosition}
    animation={isJumping ? 'jump' : 'run'}
  />
  
  {/* Obstacles */}
  {obstacles.map(obs => (
    <Obstacle 
      key={obs.id}
      type={obs.type}
      position={obs.position}
    />
  ))}
  
  {/* Camera follow */}
  <CameraRig target={playerPosition} />
</Canvas>
```

**Features:**
- Third-person perspective
- 3D jumping physics
- Real obstacles to dodge
- Camera follow mechanics

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 weeks)
1. **DigitalJenga** → Three.js + Cannon.js
2. **VirtualBubbles** → Three.js shaders
3. **ShapePop** → Matter.js physics

### Phase 2: Character Games (2-3 weeks)
1. **DressForWeather** → 3D character + clothing
2. **FeedTheMonster** → 3D monster + physics food
3. **ObstacleCourse** → 3D runner

### Phase 3: Complex Games (3-4 weeks)
1. **CuttingPractice** → 3D slicing physics
2. **DiscoveryLab** → 3D sandbox
3. **AirCanvas** → 3D painting in space

---

## Technical Considerations

### Performance
- Use React Three Fiber's `useFrame` for animations
- Implement LOD (Level of Detail) for complex scenes
- Use instanced meshes for repeated objects (bubbles, blocks)
- Enable frustum culling

### Mobile Support
- Use lighter physics (Planck.js instead of Cannon.js)
- Reduce polygon count on mobile
- Disable shadows on low-end devices
- Use touch controls instead of mouse

### Asset Pipeline
```typescript
// Asset loading with progress
import { useGLTF, useTexture } from '@react-three/drei';

function GameAssetLoader() {
  const { scene } = useGLTF('/assets/models/jenga-block.glb');
  const texture = useTexture('/assets/textures/wood.jpg');
  
  return (
    <mesh geometry={scene.children[0].geometry}>
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
```

---

## Free Asset Sources

### 3D Models
- **Kenney 3D Assets:** https://kenney.nl/assets/category:3D
- **Poly Haven:** https://polyhaven.com/models
- **Sketchfab Free:** https://sketchfab.com/search?features=downloadable&type=models

### Textures
- **Poly Haven Textures:** https://polyhaven.com/textures
- **CC0 Textures:** https://cc0textures.com/

### HDRIs
- **Poly Haven HDRIs:** https://polyhaven.com/hdris

---

## Conclusion

Current games use primitive shapes (rectangles, circles) with no physics or depth. By adding:

1. **Three.js** - Real 3D rendering
2. **Cannon.js/Matter.js** - Physics simulation  
3. **React Three Fiber** - React integration
4. **Proper 3D assets** - From Kenney/Poly Haven

We can transform "games for the sake of it" into engaging, skill-based experiences with real depth and physics.

**Estimated effort:** 6-8 weeks for full transformation  
**Biggest impact:** DigitalJenga, DressForWeather, ObstacleCourse

---

*Research completed: 2026-03-10*
