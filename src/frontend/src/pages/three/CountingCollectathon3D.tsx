import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, Text } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { PhysicsProvider } from '../../components/game/three/PhysicsProvider';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { Trophy, RotateCcw, Volume2, VolumeX, Move, Hash } from 'lucide-react';

// Player movement speed
const MOVE_SPEED = 4;

// Collectible item
interface CollectibleData {
  id: string;
  number: number;
  position: [number, number, number];
  collected: boolean;
}

// Particle effect when collecting
function CollectEffect({ position, onComplete }: { 
  position: [number, number, number];
  onComplete: () => void;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      angle: (i / 10) * Math.PI * 2,
      speed: Math.random() * 0.2 + 0.1,
      color: ['#fbbf24', '#f59e0b', '#fcd34d', '#f97316'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    setProgress((p) => {
      const newP = p + delta * 2;
      if (newP >= 1) {
        setTimeout(onComplete, 0);
        return 1;
      }
      return newP;
    });

    if (groupRef.current) {
      particles.forEach((p, i) => {
        const mesh = groupRef.current?.children[i] as THREE.Mesh;
        if (mesh) {
          mesh.position.x = Math.cos(p.angle) * progress * p.speed * 4;
          mesh.position.y = Math.sin(p.angle) * progress * p.speed * 4 + progress * 2;
          mesh.position.z = Math.sin(progress * Math.PI) * 0.5;
          mesh.scale.setScalar(1 - progress);
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p) => (
        <mesh key={p.id}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={1 - progress} />
        </mesh>
      ))}
    </group>
  );
}

// Player character
function Player({
  position,
  onMove,
  keys,
}: {
  position: [number, number, number];
  onMove: (pos: [number, number, number]) => void;
  keys: { [key: string]: boolean };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/kenney/3d/characters/character-a.glb');
  const velocity = useRef({ x: 0, z: 0 });

  const playerScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Calculate movement based on keys
      let dx = 0;
      let dz = 0;

      if (keys['w'] || keys['arrowup']) dz -= 1;
      if (keys['s'] || keys['arrowdown']) dz += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      // Normalize diagonal movement
      if (dx !== 0 && dz !== 0) {
        const length = Math.sqrt(dx * dx + dz * dz);
        dx /= length;
        dz /= length;
      }

      // Apply velocity with smoothing
      velocity.current.x += (dx * MOVE_SPEED - velocity.current.x) * delta * 5;
      velocity.current.z += (dz * MOVE_SPEED - velocity.current.z) * delta * 5;

      // Update position
      const newX = Math.max(-8, Math.min(8, groupRef.current.position.x + velocity.current.x * delta));
      const newZ = Math.max(-5, Math.min(5, groupRef.current.position.z + velocity.current.z * delta));

      groupRef.current.position.x = newX;
      groupRef.current.position.z = newZ;
      groupRef.current.position.y = 0;

      // Rotate towards movement direction
      if (dx !== 0 || dz !== 0) {
        const targetRotation = Math.atan2(dx, dz);
        groupRef.current.rotation.y = targetRotation;
      }

      // Walking animation
      if (dx !== 0 || dz !== 0) {
        groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.1;
      }

      onMove([newX, 0, newZ]);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={playerScene} scale={1} />
    </group>
  );
}

// Collectible number item
function Collectible({
  item,
  onCollect,
}: {
  item: CollectibleData;
  onCollect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current && !item.collected) {
      // Float and rotate
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  const handleClick = useCallback(() => {
    if (!item.collected) {
      onCollect(item.id);
    }
  }, [item.id, item.collected, onCollect]);

  if (item.collected) {
    return null;
  }

  return (
    <group
      ref={meshRef}
      position={item.position}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      {/* Platform */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      
      {/* Number text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.8}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        font="/assets/fonts/kenney-future.ttf"
      >
        {item.number}
      </Text>

      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Ground platform
function Ground() {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [0, -0.5, 0],
    args: [20, 1, 12],
  }));

  // Create grass blocks using platformer kit
  const { scene } = useGLTF('/assets/kenney/3d/platformer/block-grass-low.glb');

  const groundPieces = useMemo(() => {
    const pieces = [];
    for (let x = -4; x <= 4; x++) {
      for (let z = -3; z <= 3; z++) {
        pieces.push({ x, z, id: `${x}-${z}` });
      }
    }
    return pieces;
  }, []);

  return (
    <group>
      <mesh ref={ref} receiveShadow>
        <boxGeometry args={[20, 1, 12]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      {/* Add decorative grass blocks */}
      {groundPieces.map((piece) => (
        <primitive
          key={piece.id}
          object={scene.clone()}
          position={[piece.x * 2, -0.5, piece.z * 2]}
          scale={1}
        />
      ))}
    </group>
  );
}

// Environment decorations
function Environment() {
  // Trees and rocks
  const decorations = useMemo(() => {
    const items = [];
    // Border trees
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 8 + Math.random() * 2;
      items.push({
        id: `tree-${i}`,
        position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number],
        type: Math.random() > 0.5 ? 'tree' : 'rock',
        scale: 0.5 + Math.random() * 0.5,
      });
    }
    return items;
  }, []);

  const treeScene = useGLTF('/assets/kenney/3d/nature/tree-oak.glb')?.scene;
  const rockScene = useGLTF('/assets/kenney/3d/nature/rock.glb')?.scene;

  return (
    <>
      {decorations.map((item) => (
        <primitive
          key={item.id}
          object={item.type === 'tree' ? treeScene?.clone() : rockScene?.clone()}
          position={item.position}
          scale={item.scale}
        />
      ))}
    </>
  );
}

// Main game component
export default function CountingCollectathon3D() {
  const navigate = useNavigate();
  const { playSFX, preload, setMuted } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [collectibles, setCollectibles] = useState<CollectibleData[]>([]);
  const [effects, setEffects] = useState<
    { id: string; position: [number, number, number] }[]
  >([]);
  const [gameActive, setGameActive] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [nextNumber, setNextNumber] = useState(1);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const collectibleIdCounter = useRef(0);

  // Preload assets
  useEffect(() => {
    preload(['coin', 'win', 'click']);
    useGLTF.preload('/assets/kenney/3d/characters/character-a.glb');
    useGLTF.preload('/assets/kenney/3d/platformer/block-grass-low.glb');
    useGLTF.preload('/assets/kenney/3d/nature/tree-oak.glb');
    useGLTF.preload('/assets/kenney/3d/nature/rock.glb');
  }, [preload]);

  // Initialize collectibles
  useEffect(() => {
    const items: CollectibleData[] = [];
    for (let i = 1; i <= 10; i++) {
      let position: [number, number, number];
      let validPosition = false;
      let attempts = 0;

      // Find valid position (not too close to others or start)
      while (!validPosition && attempts < 50) {
        position = [
          (Math.random() - 0.5) * 14,
          0.5,
          (Math.random() - 0.5) * 8,
        ];
        validPosition = true;

        // Check distance from other items
        for (const item of items) {
          const dx = item.position[0] - position![0];
          const dz = item.position[2] - position![2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 2) {
            validPosition = false;
            break;
          }
        }

        // Check distance from start position
        const distFromStart = Math.sqrt(position![0] * position![0] + position![2] * position![2]);
        if (distFromStart < 2) {
          validPosition = false;
        }

        attempts++;
      }

      items.push({
        id: `collectible-${collectibleIdCounter.current++}`,
        number: i,
        position: position!,
        collected: false,
      });
    }
    setCollectibles(items);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check collisions
  useFrame(() => {
    if (!gameActive || gameWon) return;

    setCollectibles((prev) => {
      let changed = false;
      const updated = prev.map((item) => {
        if (item.collected) return item;

        // Check distance to player
        const dx = item.position[0] - playerPos[0];
        const dz = item.position[2] - playerPos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 1 && item.number === nextNumber) {
          changed = true;
          playSFX('coin', 0.5);
          setScore((s) => s + item.number * 10);
          setNextNumber((n) => n + 1);

          // Add effect
          setEffects((eff) => [
            ...eff,
            { id: `effect-${Date.now()}`, position: [...item.position] },
          ]);

          // Check win condition
          if (item.number === 10) {
            setGameWon(true);
            setGameActive(false);
            playSFX('win', 0.7);
          }

          return { ...item, collected: true };
        }

        return item;
      });

      return changed ? updated : prev;
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
    setNextNumber(1);
    setGameActive(true);
    setGameWon(false);
    setEffects([]);
    setPlayerPos([0, 0, 0]);
    
    // Respawn collectibles
    const items: CollectibleData[] = [];
    for (let i = 1; i <= 10; i++) {
      let position: [number, number, number];
      let validPosition = false;
      let attempts = 0;

      while (!validPosition && attempts < 50) {
        position = [
          (Math.random() - 0.5) * 14,
          0.5,
          (Math.random() - 0.5) * 8,
        ];
        validPosition = true;

        for (const item of items) {
          const dx = item.position[0] - position![0];
          const dz = item.position[2] - position![2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 2) {
            validPosition = false;
            break;
          }
        }

        const distFromStart = Math.sqrt(position![0] * position![0] + position![2] * position![2]);
        if (distFromStart < 2) {
          validPosition = false;
        }

        attempts++;
      }

      items.push({
        id: `collectible-${collectibleIdCounter.current++}`,
        number: i,
        position: position!,
        collected: false,
      });
    }
    setCollectibles(items);
  };

  const collectedCount = collectibles.filter((c) => c.collected).length;

  return (
    <GameContainer title="Counting Collectathon 3D" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 relative">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-lg shadow-md transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-slate-700" /> : <Volume2 className="w-5 h-5 text-slate-700" />}
        </button>

        <ThreeDGameCanvas
          cameraPosition={[0, 8, 12]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={false}
          backgroundColor="transparent"
          environment="sunset"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

          <PhysicsProvider gravity={[0, -20, 0]} iterations={10}>
            <Ground />
            <Environment />
            
            <Player position={playerPos} onMove={setPlayerPos} keys={keys} />

            {collectibles.map((item) => (
              <Collectible
                key={item.id}
                item={item}
                onCollect={() => {
                  // Handled by collision detection
                }}
              />
            ))}
          </PhysicsProvider>

          {effects.map((effect) => (
            <CollectEffect
              key={effect.id}
              position={effect.position}
              onComplete={() => setEffects((prev) => prev.filter((e) => e.id !== effect.id))}
            />
          ))}

          {/* Score display */}
          <Html position={[-5, 4, 0]}>
            <div className="bg-white/95 px-4 py-3 rounded-xl shadow-lg">
              <div className="text-sm text-slate-500 flex items-center gap-1">
                <Hash className="w-4 h-4" /> Next Number
              </div>
              <div className="text-4xl font-bold text-blue-600">{nextNumber}</div>
            </div>
          </Html>

          {/* Progress display */}
          <Html position={[5, 4, 0]}>
            <div className="bg-white/95 px-4 py-3 rounded-xl shadow-lg">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="text-3xl font-bold text-green-600">
                {collectedCount}/10
              </div>
              <div className="w-24 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(collectedCount / 10) * 100}%` }}
                />
              </div>
            </div>
          </Html>

          {/* Win screen */}
          {gameWon && (
            <Html center>
              <div className="bg-[#FFF8F0] text-gray-800 p-8 rounded-2xl shadow-2xl text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold mb-2">You Won!</h2>
                <p className="text-slate-400 mb-2">You collected all numbers!</p>
                <p className="text-2xl font-bold text-green-400 mb-6">Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
              </div>
            </Html>
          )}
        </ThreeDGameCanvas>
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-between items-center px-8">
        <div className="text-sm text-slate-500">
          <p>🎯 Collect numbers in order from 1 to 10!</p>
          <p>⌨️ Use WASD or Arrow Keys to move</p>
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
      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{score}</div>
          <div className="text-xs text-slate-500">Score</div>
        </div>
        <div className="bg-green-50 p-3 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-600">{nextNumber}</div>
          <div className="text-xs text-slate-500">Next Number</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{collectedCount}</div>
          <div className="text-xs text-slate-500">Collected</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{10 - collectedCount}</div>
          <div className="text-xs text-slate-500">Remaining</div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          <span className="font-mono bg-slate-100 px-2 py-1 rounded">W</span>
          <span className="font-mono bg-slate-100 px-2 py-1 rounded">A</span>
          <span className="font-mono bg-slate-100 px-2 py-1 rounded">S</span>
          <span className="font-mono bg-slate-100 px-2 py-1 rounded">D</span>
          <span>or Arrow Keys to move</span>
        </div>
      </div>
    </GameContainer>
  );
}
