# Three.js Implementation Guide for Advay Vision

**Date:** 2026-03-10  
**Purpose:** Step-by-step guide to adding 3D to current games

---

## Installation

```bash
cd src/frontend

# Core Three.js
npm install three @types/three

# React integration
npm install @react-three/fiber @react-three/drei

# Physics
npm install @react-three/cannon cannon-es

# Additional utilities
npm install three-stdlib
```

---

## Basic 3D Game Component Structure

```tsx
// components/game/ThreeDGameCanvas.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

interface ThreeDGameCanvasProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
}

export function ThreeDGameCanvas({ 
  children, 
  cameraPosition = [5, 5, 5] 
}: ThreeDGameCanvasProps) {
  return (
    <div className="w-full h-full min-h-[500px]">
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        shadows
        dpr={[1, 2]} // Responsive pixel ratio
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={20}
        />
        
        {/* Game content */}
        {children}
      </Canvas>
    </div>
  );
}
```

---

## Example 1: 3D Jenga Rebuild

```tsx
// pages/DigitalJenga3D.tsx
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import { useBox, Physics } from '@react-three/cannon';
import * as CANNON from 'cannon-es';

// Individual Jenga block
function JengaBlock({ position, isSelected, onClick }: BlockProps) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    material: {
      friction: 0.5,
      restitution: 0.1, // Low bounciness
    },
  }));

  return (
    <Box
      ref={ref}
      args={[0.6, 0.2, 1.8]} // Real Jenga dimensions
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        color={isSelected ? '#FFD700' : '#D2691E'}
        roughness={0.8}
        metalness={0.1}
      />
    </Box>
  );
}

// Complete tower
function JengaTower() {
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  
  // Generate tower with proper alternating pattern
  const blocks = [];
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 3; j++) {
      const isEven = i % 2 === 0;
      const x = isEven ? (j - 1) * 0.6 : 0;
      const z = isEven ? 0 : (j - 1) * 0.6;
      const y = i * 0.2;
      
      blocks.push(
        <JengaBlock
          key={`${i}-${j}`}
          position={[x, y, z]}
          isSelected={selectedBlock === blocks.length}
          onClick={() => setSelectedBlock(blocks.length)}
        />
      );
    }
  }

  return (
    <Physics gravity={[0, -9.82, 0]}>
      {blocks}
      
      {/* Ground */}
      <Box args={[10, 0.5, 10]} position={[0, -0.25, 0]} receiveShadow>
        <meshStandardMaterial color="#2a2a3e" />
      </Box>
    </Physics>
  );
}

// Main game component
export default function DigitalJenga3D() {
  return (
    <GameContainer title="3D Jenga" onHome={() => navigate('/games')}>
      <div className="h-[600px]">
        <Canvas camera={{ position: [4, 4, 4], fov: 50 }} shadows>
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1}
            castShadow
          />
          <JengaTower />
          <OrbitControls target={[0, 1.5, 0]} />
        </Canvas>
      </div>
    </GameContainer>
  );
}
```

---

## Example 2: 3D Character for DressForWeather

```tsx
// components/game/Character3D.tsx
import { useRef } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

interface Character3DProps {
  shirt?: string;
  pants?: string;
  shoes?: string;
  weather?: 'sunny' | 'rain' | 'snow' | 'wind';
}

export function Character3D({ shirt, pants, shoes, weather }: Character3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load 3D model (from Kenney or Poly Haven)
  const { scene } = useGLTF('/assets/models/character.glb');
  const shirtTexture = useTexture(`/assets/textures/shirt-${shirt}.jpg`);
  
  // Animation based on weather
  const { rotation } = useSpring({
    rotation: weather === 'wind' ? [0, 0, 0.1] : [0, 0, 0],
    config: { duration: 2000 },
  });

  return (
    <animated.group 
      ref={groupRef}
      rotation={rotation}
      scale={1.5}
    >
      {/* Base character */}
      <primitive object={scene} castShadow receiveShadow />
      
      {/* Clothing overlays */}
      {shirt && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial map={shirtTexture} />
        </mesh>
      )}
      
      {/* Weather effects */}
      {weather === 'rain' && <RainEffect />}
      {weather === 'snow' && <SnowEffect />}
    </animated.group>
  );
}

// Usage in game
export default function DressForWeather3D() {
  const [outfit, setOutfit] = useState({ shirt: null, pants: null });
  
  return (
    <ThreeDGameCanvas cameraPosition={[0, 1, 3]}>
      <Character3D 
        shirt={outfit.shirt}
        pants={outfit.pants}
        weather="sunny"
      />
      
      {/* Clothing selector UI */}
      <Html position={[1.5, 0.5, 0]}>
        <div className="bg-white p-4 rounded-xl">
          <h3>Select Shirt</h3>
          {['red', 'blue', 'green'].map(color => (
            <button 
              key={color}
              onClick={() => setOutfit({ ...outfit, shirt: color })}
            >
              {color}
            </button>
          ))}
        </div>
      </Html>
    </ThreeDGameCanvas>
  );
}
```

---

## Example 3: 3D Bubbles with Shaders

```tsx
// components/game/Bubble3D.tsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const bubbleVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const bubbleFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  uniform float time;
  
  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    
    // Fresnel effect for bubble edge
    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    
    // Iridescent color shift
    vec3 color = vec3(
      0.5 + 0.5 * sin(time + vUv.x * 10.0),
      0.5 + 0.5 * sin(time + vUv.y * 10.0 + 2.0),
      0.5 + 0.5 * sin(time + fresnel * 5.0 + 4.0)
    );
    
    float alpha = fresnel * 0.6 + 0.1;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export function Bubble3D({ position, size, onPop }: BubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    time: { value: 0 },
  }), []);

  useFrame(({ clock }) => {
    uniforms.time.value = clock.getElapsedTime();
    
    // Floating motion
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onPop}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <shaderMaterial
        vertexShader={bubbleVertexShader}
        fragmentShader={bubbleFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
```

---

## Performance Optimization

```tsx
// hooks/usePerformanceMonitor.ts
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export function usePerformanceMonitor() {
  const { gl, scene } = useThree();
  
  useEffect(() => {
    // Reduce quality on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      gl.shadowMap.enabled = false;
    }
    
    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        // Auto-reduce quality if FPS is low
        if (fps < 30) {
          gl.setPixelRatio(1);
        }
      }
      
      requestAnimationFrame(checkFPS);
    };
    
    checkFPS();
  }, [gl]);
}
```

---

## Asset Loading with Progress

```tsx
// components/game/AssetLoader.tsx
import { useProgress } from '@react-three/drei';

export function AssetLoader({ children }: { children: React.ReactNode }) {
  const { progress, loaded, total } = useProgress();
  
  if (progress < 100) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            Loading 3D Assets...
          </div>
          <div className="w-64 h-4 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {loaded} / {total} files
          </div>
        </div>
      </div>
    );
  }
  
  return children;
}
```

---

## Integration with Existing Games

### Step-by-Step Migration

1. **Add Three.js Canvas wrapper**
```tsx
// Replace existing canvas:
<canvas ref={canvasRef} /> 

// With:
<ThreeDGameCanvas>
  <GameContent />
</ThreeDGameCanvas>
```

2. **Migrate 2D objects to 3D**
```tsx
// Before:
ctx.fillRect(x, y, width, height);

// After:
<Box position={[x, y, 0]} args={[width, height, 1]}>
  <meshStandardMaterial color="red" />
</Box>
```

3. **Add physics**
```tsx
// Wrap in physics provider:
<Physics gravity={[0, -9.82, 0]}>
  <GameObjects />
</Physics>
```

4. **Update interaction**
```tsx
// Before: 2D mouse position
const x = e.clientX - rect.left;

// After: 3D raycasting
const raycaster = new THREE.Raycaster();
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children);
```

---

## Recommended First Migration

Start with **DigitalJenga**:

1. Easiest to understand mechanics
2. Clear physics requirements
3. Immediate visual improvement
4. Good foundation for other games

Then move to:
2. VirtualBubbles (shaders practice)
3. DressForWeather (character modeling)
4. ObstacleCourse (camera work)

---

## Free Assets to Use

### 3D Models
```typescript
// From Kenney (already have access)
const { scene } = useGLTF('/assets/kenney/3d/character.glb');

// From Poly Haven
const { scene } = useGLTF('https://polyhaven.com/model.glb');
```

### Textures
```typescript
const texture = useTexture('/assets/kenney/textures/wood.png');
```

### HDRIs for lighting
```typescript
<Environment preset="sunset" />
```

---

## Conclusion

**Implementation path:**
1. Install packages
2. Create base canvas component
3. Migrate one game (DigitalJenga)
4. Refactor common patterns
5. Migrate remaining games

**Estimated time per game:**
- Simple (Jenga, Bubbles): 2-3 days
- Medium (ObstacleCourse): 3-5 days
- Complex (DressForWeather): 5-7 days

---

*Guide created: 2026-03-10*
