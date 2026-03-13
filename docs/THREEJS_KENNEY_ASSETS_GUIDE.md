# Three.js + Kenney Assets Integration Guide

**Date:** 2026-03-10  
**Purpose:** Complete guide to using Kenney 3D assets in Three.js games

---

## Available Kenney 3D Assets

### 🎯 Priority Assets for Game Rebuilds

#### 1. **Marble Kit** → Perfect for DigitalJenga
```
Location: /3D assets/Marble Kit/Models/GLB format/
Available formats: GLB (recommended), FBX, OBJ
```

**Key Models:**
- `bend.glb`, `bend-large.glb`, `bend-medium.glb` - Curved track pieces
- `corner.glb`, `corner-solid.glb` - 90° turns
- `cross.glb` - Intersections
- `curve.glb`, `curve-wide.glb` - Smooth curves
- `slope.glb`, `slope-corner.glb` - Inclines
- `straight.glb`, `straight-half.glb` - Straight sections

**Why for Jenga:** These are block-like pieces that stack - perfect for building a physics-based tower!

---

#### 2. **Blocky Characters** → Perfect for DressForWeather
```
Location: /3D assets/Blocky Characters/Models/GLB format/
```

**Available Characters:** 18 unique models (character-a through character-r)
- Character A: Robot
- Character B: Adventurer
- Character C: Pirate
- Character D: Knight
- Character E: Astronaut
- And 13 more...

**Why for DressUp:** These are rigged characters that can wear different clothing textures!

---

#### 3. **Platformer Kit** → Perfect for ObstacleCourse
```
Location: /3D assets/Platformer Kit/Models/GLB format/
```

**Key Models:**
- `block-grass-*.glb` - Various terrain blocks
- `spike-block.glb`, `spike-block-large.glb` - Hazards
- `coin.glb`, `gem.glb` - Collectibles
- `flag.glb` - Checkpoints
- `barrel.glb`, `crate.glb` - Props
- `arrow.glb` - Direction indicators

**Why for ObstacleCourse:** Complete platformer environment kit with everything needed for a 3D runner!

---

#### 4. **Nature Kit** → Environment/Background
```
Location: /3D assets/Nature Kit/Models/GLB format/
```

**Key Models:**
- Trees, rocks, grass
- Flowers, mushrooms
- Clouds, sun, moon

---

#### 5. **Food Kit** → FeedTheMonster, Cooking Games
```
Location: /3D assets/Food Kit/Models/GLB format/
```

**Available:** Fruits, vegetables, meals, drinks - all in 3D

---

### 📦 Additional Useful Kits

| Kit | Use Case | Key Assets |
|-----|----------|------------|
| **Animated Characters 1-3** | Any character game | Pre-animated humans |
| **Building Kit** | Construction games | Modular buildings |
| **Nature Kit (Classic)** | Environment | Low-poly nature |
| **Space Kit** | Space games | Rockets, planets |
| **Toy Car Kit** | Racing games | 18 toy vehicles |
| **Minigolf Kit** | Physics games | Ramps, obstacles |

---

## Asset Integration Examples

### Example 1: 3D Jenga with Marble Kit Blocks

```tsx
// pages/DigitalJenga3D.tsx
import { useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Physics, useBox } from '@react-three/cannon';
import * as THREE from 'three';

// Preload the GLB model
useGLTF.preload('/assets/kenney/3d/marble/straight.glb');

interface JengaBlockProps {
  position: [number, number, number];
  rotation: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

function JengaBlock({ position, rotation, isSelected, onClick }: JengaBlockProps) {
  // Physics body
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    rotation,
    material: {
      friction: 0.6,
      restitution: 0.05, // Low bounciness like real wood
    },
    allowSleep: true,
    sleepSpeedLimit: 0.1,
  }));

  // Load Kenney marble block model
  const { scene } = useGLTF('/assets/kenney/3d/marble/straight.glb');
  
  // Clone the model for independent instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Highlight material when selected
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (isSelected) {
        child.material = child.material.clone();
        child.material.emissive = new THREE.Color(0xFFD700);
        child.material.emissiveIntensity = 0.3;
      }
    }
  });

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      scale={[0.5, 0.5, 0.5]}
    />
  );
}

// Ground platform
function Ground() {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [0, -0.5, 0],
    args: [10, 1, 10],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[10, 1, 10]} />
      <meshStandardMaterial color="#2a2a3e" roughness={0.8} />
    </mesh>
  );
}

// Complete tower builder
function JengaTower() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [blocks, setBlocks] = useState(() => generateTowerBlocks());

  function generateTowerBlocks() {
    const tower = [];
    const layers = 16;
    const blocksPerLayer = 3;
    
    for (let layer = 0; layer < layers; layer++) {
      const isEven = layer % 2 === 0;
      
      for (let i = 0; i < blocksPerLayer; i++) {
        const id = `${layer}-${i}`;
        
        // Alternate 90° rotation for Jenga pattern
        const x = isEven ? (i - 1) * 0.8 : 0;
        const z = isEven ? 0 : (i - 1) * 0.8;
        const y = layer * 0.25;
        
        const rotation: [number, number, number] = isEven 
          ? [0, 0, 0] 
          : [0, Math.PI / 2, 0];

        tower.push({
          id,
          position: [x, y, z] as [number, number, number],
          rotation,
        });
      }
    }
    return tower;
  }

  const removeBlock = (id: string) => {
    // Physics-based removal - block falls away
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <Physics 
      gravity={[0, -9.82, 0]}
      defaultContactMaterial={{
        friction: 0.6,
        restitution: 0.1,
      }}
    >
      <Ground />
      
      {blocks.map((block) => (
        <JengaBlock
          key={block.id}
          position={block.position}
          rotation={block.rotation}
          isSelected={selectedBlock === block.id}
          onClick={() => {
            setSelectedBlock(block.id);
            removeBlock(block.id);
          }}
        />
      ))}
    </Physics>
  );
}

export default function DigitalJenga3D() {
  return (
    <GameContainer title="3D Jenga" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden">
        <Canvas
          camera={{ position: [4, 5, 4], fov: 50 }}
          shadows
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          <Environment preset="studio" />
          
          <JengaTower />
          
          <OrbitControls
            target={[0, 2, 0]}
            minDistance={3}
            maxDistance={15}
            enablePan={false}
          />
        </Canvas>
      </div>
    </GameContainer>
  );
}
```

---

### Example 2: DressForWeather with Blocky Character

```tsx
// pages/DressForWeather3D.tsx
import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html, useTexture } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

// Character with clothing support
function Character({ shirt, pants, weather }: CharacterProps) {
  const { scene } = useGLTF('/assets/kenney/3d/characters/character-b.glb');
  
  // Weather animation
  const { rotation, position } = useSpring({
    rotation: weather === 'wind' ? [0, 0, 0.1] : [0, 0, 0],
    position: weather === 'cold' ? [0, -0.1, 0] : [0, 0, 0],
    config: { duration: 2000 },
  });

  // Apply clothing textures
  const shirtTexture = useTexture(shirt ? `/assets/textures/shirt-${shirt}.png` : null);
  const pantsTexture = useTexture(pants ? `/assets/textures/pants-${pants}.png` : null);

  // Apply materials to character parts
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      
      // Apply shirt texture to torso
      if (child.name.includes('torso') && shirtTexture) {
        child.material.map = shirtTexture;
        child.material.needsUpdate = true;
      }
      
      // Apply pants texture to legs
      if (child.name.includes('leg') && pantsTexture) {
        child.material.map = pantsTexture;
        child.material.needsUpdate = true;
      }
    }
  });

  return (
    <animated.group rotation={rotation} position={position}>
      <primitive 
        object={scene} 
        scale={1.5}
        position={[0, -1, 0]}
      />
      
      {/* Weather effects */}
      {weather === 'rain' && <RainParticles />}
      {weather === 'snow' && <SnowParticles />}
      {weather === 'sunny' && <SunGlow />}
    </animated.group>
  );
}

// Weather particle systems
function RainParticles() {
  // Rain implementation using Three.js points
  return (
    <points>
      <bufferGeometry>
        {/* Rain drops geometry */}
      </bufferGeometry>
      <pointsMaterial color="#4a90d9" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

// Clothing selector UI
function ClothingSelector({ onSelect }: { onSelect: (type: string, item: string) => void }) {
  return (
    <Html position={[1.8, 0, 0]} transform>
      <div className="bg-white/95 p-4 rounded-xl shadow-lg w-48">
        <h3 className="font-bold mb-3 text-gray-800">Wardrobe</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Shirts</p>
          <div className="grid grid-cols-3 gap-2">
            {['red', 'blue', 'green', 'yellow', 'jacket', 'raincoat'].map((shirt) => (
              <button
                key={shirt}
                onClick={() => onSelect('shirt', shirt)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                style={{
                  backgroundColor: 
                    shirt === 'red' ? '#ef4444' :
                    shirt === 'blue' ? '#3b82f6' :
                    shirt === 'green' ? '#22c55e' :
                    shirt === 'yellow' ? '#eab308' : '#ccc'
                }}
              />
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Bottoms</p>
          <div className="grid grid-cols-3 gap-2">
            {['shorts', 'pants', 'rain-pants'].map((pants) => (
              <button
                key={pants}
                onClick={() => onSelect('pants', pants)}
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-blue-100"
              >
                {pants}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Html>
  );
}

export default function DressForWeather3D() {
  const [outfit, setOutfit] = useState({ shirt: null, pants: null });
  const [weather, setWeather] = useState('sunny');

  const handleClothingSelect = (type: string, item: string) => {
    setOutfit((prev) => ({ ...prev, [type]: item }));
  };

  return (
    <GameContainer title="Dress for Weather 3D" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden">
        <Canvas
          camera={{ position: [0, 1, 4], fov: 50 }}
          shadows
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          
          <Suspense fallback={null}>
            <Character 
              shirt={outfit.shirt}
              pants={outfit.pants}
              weather={weather}
            />
            <ClothingSelector onSelect={handleClothingSelect} />
          </Suspense>
          
          <OrbitControls
            target={[0, 0, 0]}
            minDistance={2}
            maxDistance={8}
            enablePan={false}
          />
        </Canvas>
      </div>
      
      {/* Weather selector */}
      <div className="flex justify-center gap-2 mt-4">
        {['sunny', 'rain', 'snow', 'wind'].map((w) => (
          <button
            key={w}
            onClick={() => setWeather(w)}
            className={`px-4 py-2 rounded-lg ${
              weather === w ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {w === 'sunny' && '☀️'}
            {w === 'rain' && '🌧️'}
            {w === 'snow' && '❄️'}
            {w === 'wind' && '💨'}
          </button>
        ))}
      </div>
    </GameContainer>
  );
}
```

---

### Example 3: 3D ObstacleCourse with Platformer Kit

```tsx
// pages/ObstacleCourse3D.tsx
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useKeyboardControls } from '@react-three/drei';
import { Physics, useBox, useSphere } from '@react-three/cannon';
import * as THREE from 'three';

// Player character
function Player({ position }: { position: [number, number, number] }) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.3],
    material: { friction: 0.3, restitution: 0 },
    fixedRotation: true,
  }));

  const [, getKeys] = useKeyboardControls();
  const velocity = useRef([0, 0, 0]);
  
  useEffect(() => {
    api.velocity.subscribe((v) => (velocity.current = v));
  }, [api]);

  useFrame(() => {
    const { forward, backward, left, right, jump } = getKeys();
    const speed = 5;
    const jumpForce = 8;

    // Movement
    if (forward) api.velocity.set(velocity.current[0], velocity.current[1], -speed);
    if (backward) api.velocity.set(velocity.current[0], velocity.current[1], speed);
    if (left) api.velocity.set(-speed, velocity.current[1], velocity.current[2]);
    if (right) api.velocity.set(speed, velocity.current[1], velocity.current[2]);

    // Jump
    if (jump && Math.abs(velocity.current[1]) < 0.1) {
      api.velocity.set(velocity.current[0], jumpForce, velocity.current[2]);
    }
  });

  // Use Kenney blocky character
  const { scene } = useGLTF('/assets/kenney/3d/characters/character-a.glb');

  return (
    <group ref={ref}>
      <primitive object={scene} scale={0.5} />
    </group>
  );
}

// Platform using Kenney assets
function Platform({ position, type = 'grass' }: PlatformProps) {
  const modelPath = `/assets/kenney/3d/platformer/block-${type}-large.glb`;
  const { scene } = useGLTF(modelPath);
  
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [1, 1, 1],
  }));

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={[0.5, 0.5, 0.5]}
    />
  );
}

// Hazard/spike using Kenney assets
function Spike({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/kenney/3d/platformer/spike-block.glb');
  
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [0.8, 0.8, 0.8],
    isTrigger: true, // Player dies on contact
  }));

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={0.4}
    />
  );
}

// Collectible coin
function Coin({ position, onCollect }: CoinProps) {
  const { scene } = useGLTF('/assets/kenney/3d/platformer/coin.glb');
  const [collected, setCollected] = useState(false);
  const coinRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (coinRef.current && !collected) {
      coinRef.current.rotation.y = clock.getElapsedTime() * 2;
      coinRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <group
      ref={coinRef}
      position={position}
      onClick={() => {
        setCollected(true);
        onCollect();
      }}
    >
      <primitive object={scene} scale={0.3} />
    </group>
  );
}

// Level generator
function Level() {
  const platforms = [];
  const spikes = [];
  const coins = [];

  // Generate a simple level
  for (let i = 0; i < 20; i++) {
    const x = i * 2;
    const y = Math.floor(Math.random() * 3) * 1.5;
    const z = 0;
    
    platforms.push(
      <Platform 
        key={`platform-${i}`}
        position={[x, y, z]}
        type={Math.random() > 0.5 ? 'grass' : 'stone'}
      />
    );

    // Add spikes occasionally
    if (Math.random() > 0.7 && i > 2) {
      spikes.push(
        <Spike 
          key={`spike-${i}`}
          position={[x, y + 1, z]}
        />
      );
    }

    // Add coins
    if (Math.random() > 0.5) {
      coins.push(
        <Coin
          key={`coin-${i}`}
          position={[x, y + 1.5, z]}
          onCollect={() => console.log('Coin collected!')}
        />
      );
    }
  }

  return (
    <>
      {platforms}
      {spikes}
      {coins}
    </>
  );
}

export default function ObstacleCourse3D() {
  return (
    <GameContainer title="3D Obstacle Course" onHome={() => navigate('/games')}>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w'] },
          { name: 'backward', keys: ['ArrowDown', 's'] },
          { name: 'left', keys: ['ArrowLeft', 'a'] },
          { name: 'right', keys: ['ArrowRight', 'd'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <div className="h-[600px] w-full rounded-xl overflow-hidden">
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            shadows
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            
            <Physics gravity={[0, -15, 0]}>
              <Player position={[0, 2, 0]} />
              <Level />
            </Physics>
          </Canvas>
        </div>
      </KeyboardControls>
      
      {/* Controls hint */}
      <div className="mt-4 text-center text-gray-600">
        Use WASD or Arrow Keys to move • Space to jump
      </div>
    </GameContainer>
  );
}
```

---

## Asset Sync Script

Create a script to sync Kenney 3D assets to the public folder:

```bash
#!/bin/bash
# tools/sync_kenney_3d_assets.sh

KENNEY_SOURCE="/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0/3D assets"
DEST="src/frontend/public/assets/kenney/3d"

echo "Syncing Kenney 3D assets..."

# Create directories
mkdir -p $DEST/{marble,platformer,characters,nature,food}

# Sync Marble Kit (for Jenga-like games)
cp "$KENNEY_SOURCE/Marble Kit/Models/GLB format/"*.glb $DEST/marble/

# Sync Platformer Kit (for platformer games)
cp "$KENNEY_SOURCE/Platformer Kit/Models/GLB format/"*.glb $DEST/platformer/

# Sync Blocky Characters
cp "$KENNEY_SOURCE/Blocky Characters/Models/GLB format/"*.glb $DEST/characters/

# Sync Nature Kit
cp "$KENNEY_SOURCE/Nature Kit/Models/GLB format/"*.glb $DEST/nature/

# Sync Food Kit
cp "$KENNEY_SOURCE/Food Kit/Models/GLB format/"*.glb $DEST/food/

echo "3D assets synced successfully!"
echo "Total files: $(find $DEST -name '*.glb' | wc -l)"
```

Run it:
```bash
chmod +x tools/sync_kenney_3d_assets.sh
./tools/sync_kenney_3d_assets.sh
```

---

## CC0 Asset Sources

Beyond Kenney, here are other great CC0 sources:

### 3D Models
| Source | URL | Best For |
|--------|-----|----------|
| **Poly Haven** | polyhaven.com | HDRIs, textures, models |
| **Quaternius** | quaternius.com | Animated characters |
| **KayKit** | kaylousberg.itch.io | Game kits |
| **OpenGameArt** | opengameart.org | Variety of assets |
| **Sketchfab CC0** | sketchfab.com | Various models |

### Example: Poly Haven HDRI for Lighting

```tsx
import { Environment } from '@react-three/drei';

// Use Poly Haven HDRI for realistic lighting
<Environment
  files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr"
  background
/>
```

### Example: Quaternius Animated Character

```tsx
// Quaternius characters come with animations
const { scene, animations } = useGLTF('/assets/quaternius/robot.glb');
const { actions } = useAnimations(animations, scene);

// Play animation
useEffect(() => {
  actions['Run']?.play();
}, [actions]);
```

---

## Performance Optimization with Kenney Assets

### 1. Model Compression

```bash
# Use gltf-transform to compress models
npm install -g @gltf-transform/cli

# Compress all Kenney GLBs
gltf-transform optimize \
  --compress draco \
  --texture-compress webp \
  src/frontend/public/assets/kenney/3d/marble/ \
  src/frontend/public/assets/kenney/3d/marble-compressed/
```

### 2. Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const DigitalJenga3D = lazy(() => import('./pages/DigitalJenga3D'));

// In router
<Suspense fallback={<LoadingScreen />}>
  <DigitalJenga3D />
</Suspense>
```

### 3. Instance Mesh for Repeated Objects

```tsx
import { Instances, Instance } from '@react-three/drei';

// For many identical blocks (like Jenga)
<Instances limit={100}>
  <boxGeometry />
  <meshStandardMaterial />
  {blocks.map((block, i) => (
    <Instance 
      key={i}
      position={block.position}
      rotation={block.rotation}
    />
  ))}
</Instances>
```

---

## Quick Reference: Asset to Game Mapping

| Game | Kenney Assets | Additional Assets |
|------|--------------|-------------------|
| **DigitalJenga** | Marble Kit (blocks) | None needed |
| **DressForWeather** | Blocky Characters | Clothing textures |
| **ObstacleCourse** | Platformer Kit + Character | None needed |
| **FeedTheMonster** | Food Kit + Blocky Characters | None needed |
| **VirtualBubbles** | Custom shaders | Particle textures |
| **CuttingPractice** | Food Kit (fruits/veggies) | Slicing shaders |

---

*Guide updated: 2026-03-10*
