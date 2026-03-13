import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { RotateCcw, Volume2, VolumeX, Sword } from 'lucide-react';

// Fruit types
const FRUIT_TYPES = ['apple', 'banana', 'orange'] as const;
type FruitType = typeof FRUIT_TYPES[number];

interface FruitData {
  id: string;
  type: FruitType;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  rotVelocity: [number, number, number];
  sliced: boolean;
}

// Slice particle effect
function SliceEffect({ position, color, onComplete }: { 
  position: [number, number, number]; 
  color: string;
  onComplete: () => void;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * Math.PI * 2,
      speed: Math.random() * 0.15 + 0.05,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress((p) => {
      if (p >= 1) {
        setTimeout(onComplete, 0);
        return 1;
      }
      return p + 0.03;
    });

    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 - progress * 0.5);
      groupRef.current.rotation.z += 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p) => (
        <mesh
          key={p.id}
          position={[
            Math.cos(p.angle) * progress * 0.8,
            Math.sin(p.angle) * progress * 0.8,
            (Math.random() - 0.5) * 0.5,
          ]}
        >
          <circleGeometry args={[0.06, 6]} />
          <meshBasicMaterial color={color} transparent opacity={1 - progress} />
        </mesh>
      ))}
    </group>
  );
}

// Fruit component
function Fruit({
  fruit,
  onSlice,
}: {
  fruit: FruitData;
  onSlice: (id: string, position: [number, number, number], type: FruitType) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(`/assets/kenney/3d/food/${fruit.type}.glb`);

  const fruitScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current && !fruit.sliced) {
      // Apply gravity
      fruit.velocity[1] -= 9.8 * delta * 0.5;

      // Update position
      fruit.position[0] += fruit.velocity[0] * delta;
      fruit.position[1] += fruit.velocity[1] * delta;
      fruit.position[2] += fruit.velocity[2] * delta;

      // Update rotation
      fruit.rotation[0] += fruit.rotVelocity[0] * delta;
      fruit.rotation[1] += fruit.rotVelocity[1] * delta;
      fruit.rotation[2] += fruit.rotVelocity[2] * delta;

      meshRef.current.position.set(...fruit.position);
      meshRef.current.rotation.set(...fruit.rotation);

      // Check if fruit fell below screen
      if (fruit.position[1] < -6) {
        meshRef.current.visible = false;
      }
    }
  });

  const handleClick = useCallback(() => {
    if (!fruit.sliced && meshRef.current && meshRef.current.visible) {
      onSlice(fruit.id, fruit.position, fruit.type);
    }
  }, [fruit.id, fruit.position, fruit.type, fruit.sliced, onSlice]);

  if (fruit.sliced) {
    return null;
  }

  return (
    <group
      ref={meshRef}
      position={fruit.position}
      rotation={fruit.rotation}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = 'crosshair')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <primitive object={fruitScene} scale={0.4} />
    </group>
  );
}

// Fruit slice (the two halves)
function FruitSlice({
  type,
  position,
  rotation,
  direction,
}: {
  type: FruitType;
  position: [number, number, number];
  rotation: [number, number, number];
  direction: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(`/assets/kenney/3d/food/${type}.glb`);

  const sliceScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x += direction * 2 * delta;
      meshRef.current.position.y -= 2 * delta;
      meshRef.current.rotation.z += direction * 2 * delta;
      meshRef.current.scale.multiplyScalar(0.98);

      if (meshRef.current.scale.x < 0.1) {
        meshRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      <primitive object={sliceScene} scale={0.35} />
    </group>
  );
}

// Background decorations
function Background() {
  return (
    <>
      {/* Wooden cutting board style ground */}
      <mesh position={[0, -4, 0]} receiveShadow>
        <boxGeometry args={[20, 0.5, 10]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Kitchen backsplash */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
      </mesh>
    </>
  );
}

// Main game component
export default function CuttingPractice3D() {
  const navigate = useNavigate();
  const { playSFX, preload, setMuted } = use3DGameAudio();
  
  // Performance monitoring
  usePerformanceMonitor('CuttingPractice3D', {
    reportToAnalytics: true,
    fpsThreshold: 30,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [fruits, setFruits] = useState<FruitData[]>([]);
  const [slices, setSlices] = useState<
    { id: string; position: [number, number, number]; type: FruitType; rotation: [number, number, number]; direction: number }[]
  >([]);
  const [effects, setEffects] = useState<
    { id: string; position: [number, number, number]; type: FruitType }[]
  >([]);
  const [gameActive, setGameActive] = useState(true);
  const [missed, setMissed] = useState(0);
  const fruitIdCounter = useRef(0);
  const spawnTimer = useRef(0);

  // Preload assets
  useEffect(() => {
    preload(['pop', 'crunch', 'win']);
    FRUIT_TYPES.forEach((type) => {
      useGLTF.preload(`/assets/kenney/3d/food/${type}.glb`);
    });
  }, [preload]);

  // Spawn fruit
  const spawnFruit = useCallback(() => {
    const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    const x = (Math.random() - 0.5) * 8;
    const newFruit: FruitData = {
      id: `fruit-${fruitIdCounter.current++}`,
      type,
      position: [x, -3, 0],
      velocity: [(Math.random() - 0.5) * 2, 8 + Math.random() * 4, 0],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      rotVelocity: [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2],
      sliced: false,
    };
    setFruits((prev) => [...prev, newFruit]);
  }, []);

  // Slice fruit
  const handleSlice = useCallback(
    (id: string, position: [number, number, number], type: FruitType) => {
      playSFX('crunch', 0.6);
      setScore((s) => s + 10);

      // Mark fruit as sliced
      setFruits((prev) => prev.map((f) => (f.id === id ? { ...f, sliced: true } : f)));

      // Create slice pieces
      const rotation: [number, number, number] = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ];
      setSlices((prev) => [
        ...prev,
        { id: `${id}-left`, position: [...position], type, rotation, direction: -1 },
        { id: `${id}-right`, position: [...position], type, rotation, direction: 1 },
      ]);

      // Add particle effect
      setEffects((prev) => [
        ...prev,
        { id: `effect-${Date.now()}`, position: [...position], type },
      ]);

      // Cleanup sliced fruit and slices after animation
      setTimeout(() => {
        setFruits((prev) => prev.filter((f) => f.id !== id));
        setSlices((prev) => prev.filter((s) => !s.id.startsWith(id)));
      }, 2000);
    },
    [playSFX]
  );

  // Remove effect
  const removeEffect = useCallback((id: string) => {
    setEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Game loop
  useFrame((_, delta) => {
    if (!gameActive) return;

    spawnTimer.current += delta;
    if (spawnTimer.current > 1.5) {
      spawnFruit();
      spawnTimer.current = 0;
    }

    // Check for missed fruits (fell below screen)
    setFruits((prev) => {
      const remaining = prev.filter((f) => f.position[1] > -6);
      const missedCount = prev.filter((f) => !f.sliced && f.position[1] <= -6).length;
      if (missedCount > 0) {
        setMissed((m) => m + missedCount);
      }
      return remaining;
    });
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  const resetGame = () => {
    setScore(0);
    setFruits([]);
    setSlices([]);
    setEffects([]);
    setMissed(0);
    setGameActive(true);
    spawnTimer.current = 0;
  };

  const fruitColors: Record<FruitType, string> = {
    apple: '#ef4444',
    banana: '#eab308',
    orange: '#f97316',
  };

  return (
    <GameContainer title="Cutting Practice 3D" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100 relative">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-lg shadow-md transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-slate-700" /> : <Volume2 className="w-5 h-5 text-slate-700" />}
        </button>

        <ThreeDGameCanvas
          cameraPosition={[0, 0, 10]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={import.meta.env.DEV}
          showFPS={import.meta.env.DEV}
          backgroundColor="transparent"
          environment={null}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffd700" />

          <Background />

          {fruits.map((fruit) => (
            <Fruit key={fruit.id} fruit={fruit} onSlice={handleSlice} />
          ))}

          {slices.map((slice) => (
            <FruitSlice
              key={slice.id}
              type={slice.type}
              position={slice.position}
              rotation={slice.rotation}
              direction={slice.direction}
            />
          ))}

          {effects.map((effect) => (
            <SliceEffect
              key={effect.id}
              position={effect.position}
              color={fruitColors[effect.type]}
              onComplete={() => removeEffect(effect.id)}
            />
          ))}

          {/* Score display */}
          <Html position={[-4, 3.5, 0]}>
            <div className="bg-white/95 px-4 py-3 rounded-xl shadow-lg">
              <div className="text-sm text-slate-500">Score</div>
              <div className="text-3xl font-bold text-slate-800">{score}</div>
            </div>
          </Html>

          {/* Missed display */}
          <Html position={[4, 3.5, 0]}>
            <div className="bg-white/95 px-4 py-3 rounded-xl shadow-lg">
              <div className="text-sm text-slate-500">Missed</div>
              <div className="text-3xl font-bold text-red-500">{missed}</div>
            </div>
          </Html>

          {/* Instructions */}
          <Html position={[0, -3.5, 0]} center>
            <div className="bg-slate-800/90 text-white px-6 py-3 rounded-xl shadow-lg text-center">
              <Sword className="w-6 h-6 mx-auto mb-1" />
              <p className="font-bold">Click fruits to slice them!</p>
            </div>
          </Html>
        </ThreeDGameCanvas>
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-between items-center px-8">
        <div className="text-sm text-slate-500">
          <p>🎯 Slice as many fruits as you can!</p>
          <p>⚡ Click to slice before they fall!</p>
        </div>

        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-600">{score}</div>
          <div className="text-xs text-slate-500">Points</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{Math.floor(score / 10)}</div>
          <div className="text-xs text-slate-500">Fruits Sliced</div>
        </div>
        <div className="bg-red-50 p-3 rounded-xl border border-red-200">
          <div className="text-2xl font-bold text-red-600">{missed}</div>
          <div className="text-xs text-slate-500">Missed</div>
        </div>
      </div>
    </GameContainer>
  );
}

// Preload all fruit assets
FRUIT_TYPES.forEach((type) => {
  useGLTF.preload(`/assets/kenney/3d/food/${type}.glb`);
});
