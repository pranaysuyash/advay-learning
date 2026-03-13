import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBox } from '@react-three/cannon';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { PhysicsProvider } from '../../components/game/three/PhysicsProvider';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { Trophy, RotateCcw, MousePointer2, Volume2, VolumeX } from 'lucide-react';

// Jenga block component
interface JengaBlockProps {
  position: [number, number, number];
  rotation: [number, number, number];
  id: string;
  isSelected: boolean;
  isRemoved: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

function JengaBlock({
  position,
  rotation,
  id,
  isSelected,
  isRemoved,
  onSelect,
  onRemove,
}: JengaBlockProps) {
  // Physics body - static until removed
  const [ref, api] = useBox<THREE.Group>(() => ({
    mass: isRemoved ? 1 : 0,
    position,
    rotation,
    args: [0.6, 0.2, 1.8], // Jenga block dimensions
    material: {
      friction: 0.6,
      restitution: 0.05,
    },
    allowSleep: true,
    sleepSpeedLimit: 0.1,
  }));

  // Load Kenney marble block model
  const { scene } = useGLTF('/assets/kenney/3d/marble/straight.glb');

  // Clone and configure scene
  const clonedScene = useMemo(() => {
    const clone = scene.clone();

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Apply highlight when selected
        if (isSelected && mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.emissive = new THREE.Color('#FFD700');
          mat.emissiveIntensity = 0.4;
          mesh.material = mat;
        }
      }
    });

    return clone;
  }, [scene, isSelected]);

  // Apply physics when removed
  useEffect(() => {
    if (isRemoved) {
      // Push block out randomly
      const pushX = (Math.random() - 0.5) * 5;
      const pushZ = (Math.random() - 0.5) * 5;
      api.velocity.set(pushX, 2, pushZ);
      api.angularVelocity.set(
        Math.random() * 5,
        Math.random() * 5,
        Math.random() * 5
      );
    }
  }, [isRemoved, api]);

  if (isRemoved) {
    return (
      <primitive
        ref={ref}
        object={clonedScene}
        scale={[0.5, 0.5, 0.5]}
      />
    );
  }

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (!isRemoved) {
          onSelect(id);
          onRemove(id);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clonedScene} scale={[0.5, 0.5, 0.5]} />
    </group>
  );
}

// Ground platform
function Ground() {
  const [ref] = useBox(() => ({
    type: 'Static',
    position: [0, -0.25, 0],
    args: [10, 0.5, 10],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <boxGeometry args={[10, 0.5, 10]} />
      <meshStandardMaterial color="#2a2a3e" roughness={0.8} />
    </mesh>
  );
}

// Complete tower
function JengaTower() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [removedBlocks, setRemovedBlocks] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const { playSFX, preload } = use3DGameAudio();
  const { resetAutoCompletion } = useAutoGameCompletion('digital-jenga-3d', {
    when: gameOver,
    score,
    level: 1,
    metadata: {
      removedBlocks: removedBlocks.size,
    },
  });

  // Preload audio on mount
  useEffect(() => {
    preload(['blockPlace', 'blockFall', 'win']);
  }, [preload]);

  // Generate tower blocks
  const blocks = useMemo(() => {
    const tower = [];
    const layers = 16;
    const blocksPerLayer = 3;

    for (let layer = 0; layer < layers; layer++) {
      const isEven = layer % 2 === 0;

      for (let i = 0; i < blocksPerLayer; i++) {
        const id = `${layer}-${i}`;

        // Alternate 90° rotation for Jenga pattern
        const x = isEven ? (i - 1) * 0.7 : 0;
        const z = isEven ? 0 : (i - 1) * 0.7;
        const y = layer * 0.2 + 0.2;

        const rotation: [number, number, number] = isEven
          ? [0, 0, 0]
          : [0, Math.PI / 2, 0];

        tower.push({
          id,
          position: [x, y, z] as [number, number, number],
          rotation,
          layer,
        });
      }
    }
    return tower;
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedBlock(id);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setRemovedBlocks((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setScore((prev) => prev + 10);
    playSFX('blockFall', 0.5);
  }, [playSFX]);

  const resetGame = useCallback(() => {
    resetAutoCompletion();
    setRemovedBlocks(new Set());
    setSelectedBlock(null);
    setScore(0);
    setGameOver(false);
  }, [resetAutoCompletion]);

  // Check for tower collapse (simplified)
  useEffect(() => {
    if (removedBlocks.size > 30 && !gameOver) {
      setGameOver(true);
      playSFX('win', 0.7);
    }
  }, [removedBlocks.size, gameOver, playSFX]);

  return (
    <>
      <Ground />

      {blocks.map((block) => (
        <JengaBlock
          key={block.id}
          id={block.id}
          position={block.position}
          rotation={block.rotation}
          isSelected={selectedBlock === block.id}
          isRemoved={removedBlocks.has(block.id)}
          onSelect={handleSelect}
          onRemove={handleRemove}
        />
      ))}

      {/* Score display */}
      <Html position={[-4, 4, 0]}>
        <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg">
          <div className="text-sm text-slate-400">Score</div>
          <div className="text-2xl font-bold">{score}</div>
        </div>
      </Html>

      {/* Instructions */}
      <Html position={[4, 4, 0]}>
        <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg text-center">
          <MousePointer2 className="w-6 h-6 mx-auto mb-1" />
          <div className="text-xs">Click blocks to remove</div>
        </div>
      </Html>

      {/* Game over screen */}
      {gameOver && (
        <Html center>
          <div className="bg-[#FFF8F0] text-gray-800 p-8 rounded-2xl shadow-2xl text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold mb-2">Tower Collapsed!</h2>
            <p className="text-slate-400 mb-4">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </Html>
      )}
    </>
  );
}

// Preload the asset
useGLTF.preload('/assets/kenney/3d/marble/straight.glb');

// Main game component
export default function DigitalJenga3D() {
  const navigate = useNavigate();
  const { setMuted, playSFX } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  return (
    <GameShell gameId='digital-jenga-3d' gameName='Digital Jenga 3D'>
    <GameContainer title="3D Jenga" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-[#FFF8F0] relative">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
        <ThreeDGameCanvas
          cameraPosition={[6, 5, 6]}
          cameraTarget={[0, 1.5, 0]}
          enableOrbit={true}
          showStats={import.meta.env.DEV}
          showFPS={import.meta.env.DEV}
          backgroundColor="#1e293b"
          environment="studio"
        >
          <PhysicsProvider
            gravity={[0, -9.82, 0]}
            iterations={10}
            allowSleep={true}
          >
            <JengaTower />
          </PhysicsProvider>
        </ThreeDGameCanvas>
      </div>

      {/* Controls hint */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <MousePointer2 className="w-4 h-4" />
          <span>Click blocks to remove</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🖱️</span>
          <span>Drag to rotate view</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span>Scroll to zoom</span>
        </div>
      </div>
    </GameContainer>
    </GameShell>
  );
}
