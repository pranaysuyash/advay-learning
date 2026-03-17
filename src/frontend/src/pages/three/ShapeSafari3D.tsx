/**
 * Shape Safari 3D
 *
 * 3D version of Shape Safari with 3D animal shapes and hand tracking.
 *
 * @ticket Phase-7-P0 - 3D Conversion
 */

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import { Sparkles, Play, Hand } from 'lucide-react';

// Shape types
type ShapeType = 'cube' | 'sphere' | 'cylinder' | 'cone';

interface ShapeAnimal {
  id: string;
  shape: ShapeType;
  name: string;
  color: string;
  position: [number, number, number];
  isFound: boolean;
}

// 3D Shape Animal component
interface ShapeAnimal3DProps {
  animal: ShapeAnimal;
  onFind: (id: string) => void;
  cursor: { x: number; y: number } | null;
}

function ShapeAnimal3D({ animal, onFind, cursor }: ShapeAnimal3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;

    // Gentle rotation
    meshRef.current.rotation.y += 0.01;

    // Check cursor hover
    if (cursor && !animal.isFound) {
      const dx = cursor.x - (animal.position[0] * 0.1 + 0.5);
      const dy = cursor.y - (animal.position[1] * 0.1 + 0.5);
      const distance = Math.sqrt(dx * dx + dy * dy);
      setHovered(distance < 0.15);
    }
  });

  const geometry = useMemo(() => {
    switch (animal.shape) {
      case 'cube':
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
      case 'sphere':
        return <sphereGeometry args={[0.5, 16, 16]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.4, 0.4, 1, 16]} />;
      case 'cone':
        return <coneGeometry args={[0.5, 1, 16]} />;
      default:
        return <boxGeometry args={[0.8, 0.8, 0.8]} />;
    }
  }, [animal.shape]);

  if (animal.isFound) return null;

  return (
    <mesh
      ref={meshRef}
      position={animal.position}
      scale={hovered ? 1.2 : 1}
      onClick={() => onFind(animal.id)}
    >
      {geometry}
      <meshStandardMaterial
        color={animal.color}
        emissive={animal.color}
        emissiveIntensity={hovered ? 0.5 : 0}
      />
    </mesh>
  );
}

// Main game component
export default function ShapeSafari3D() {
  const { playSFX } = use3DGameAudio();
  const { completeGame } = useGameCompletion('shape-safari-3d');

  const { cursor, isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'ShapeSafari3D',
    targetFps: 30,
  });

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [shapes, setShapes] = useState<ShapeAnimal[]>([]);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [targetShape, setTargetShape] = useState<ShapeType>('cube');

  const generateShapes = useCallback((currentLevel: number) => {
    const shapeTypes: ShapeType[] = ['cube', 'sphere', 'cylinder', 'cone'];
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];
    const target = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    setTargetShape(target);

    const newShapes: ShapeAnimal[] = Array.from(
      { length: 3 + currentLevel },
      (_, i) => ({
        id: `shape-${i}`,
        shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        name: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 8,
        ],
        isFound: false,
      }),
    );

    setShapes(newShapes);
  }, []);

  const handleStart = useCallback(() => {
    setLevel(1);
    setScore(0);
    generateShapes(1);
    setShowStartScreen(false);
    playSFX('start');
    startTracking();
  }, [playSFX, startTracking, generateShapes]);

  const handleFindShape = useCallback(
    (shapeId: string) => {
      setShapes((prev) => {
        const shape = prev.find((s) => s.id === shapeId);
        if (!shape || shape.isFound) return prev;

        if (shape.shape === targetShape) {
          // Correct!
          playSFX('success');
          setScore((s) => s + 10);

          const newShapes = prev.map((s) =>
            s.id === shapeId ? { ...s, isFound: true } : s,
          );

          // Check if all target shapes found
          const remaining = newShapes.filter(
            (s) => s.shape === targetShape && !s.isFound,
          );
          if (remaining.length === 0) {
            // Level complete
            if (level >= 3) {
              setShowCelebration(true);
              completeGame({ score: score + 10, completed: true, level });
            } else {
              setLevel((l) => l + 1);
              generateShapes(level + 1);
            }
          }

          return newShapes;
        } else {
          // Wrong shape
          playSFX('error');
          return prev;
        }
      });
    },
    [targetShape, level, score, playSFX, completeGame, generateShapes],
  );

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return (
    <GameShell gameId='shape-safari-3d' gameName='Shape Safari 3D'>
      <GameContainer>
        <ThreeDGameCanvas
          environment='forest'
          showFPS={import.meta.env.DEV}
          enableAdaptiveQuality={true}
        >
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color='#8b7355' />
          </mesh>

          {/* Sky */}
          <color attach='background' args={['#87ceeb']} />

          {/* Trees in background */}
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 28,
                -1,
                (Math.random() - 0.5) * 28,
              ]}
            >
              <cylinderGeometry args={[0.3, 0.5, 3, 8]} />
              <meshStandardMaterial color='#8b4513' />
            </mesh>
          ))}

          {/* Shape animals */}
          {!showStartScreen &&
            shapes.map((shape) => (
              <ShapeAnimal3D
                key={shape.id}
                animal={shape}
                onFind={handleFindShape}
                cursor={cursor}
              />
            ))}
        </ThreeDGameCanvas>

        {isReady && cursor && (
          <CursorEmbodiment
            position={cursor}
            coordinateSpace='normalized'
            isHandDetected={true}
          />
        )}

        {/* Start Screen */}
        {showStartScreen && (
          <div className='absolute inset-0 flex items-center justify-center bg-amber-900/80 backdrop-blur-sm z-10'>
            <div className='text-center p-8 bg-white/10 rounded-2xl max-w-md'>
              <div className='flex justify-center gap-4 mb-4'>
                <div className='w-12 h-12 bg-red-400 rounded-lg' />
                <div className='w-12 h-12 bg-blue-400 rounded-full' />
                <div className='w-12 h-12 bg-green-400 rounded-t-lg' />
              </div>
              <h1 className='text-4xl font-bold text-white mb-4'>
                Shape Safari 3D
              </h1>
              <p className='text-white/80 mb-6'>
                Find all the shapes in the safari!
              </p>
              <button
                onClick={handleStart}
                className='px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xl flex items-center gap-3 mx-auto transition-colors'
              >
                <Play className='w-6 h-6' />
                Start Safari
              </button>
              <div className='mt-6 flex items-center justify-center gap-2 text-white/60'>
                <Hand className='w-5 h-5' />
                <span>Use hand tracking to find shapes</span>
              </div>
            </div>
          </div>
        )}

        {/* HUD */}
        {!showStartScreen && (
          <div className='absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none'>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg'>
              <div className='text-sm text-gray-600'>Score</div>
              <div className='text-2xl font-bold text-amber-600'>{score}</div>
            </div>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg text-center'>
              <div className='text-sm text-gray-600'>Find</div>
              <div className='text-2xl font-bold text-purple-600 capitalize'>
                {targetShape}s
              </div>
            </div>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg'>
              <div className='text-sm text-gray-600'>Level</div>
              <div className='text-2xl font-bold text-blue-600'>{level}</div>
            </div>
          </div>
        )}

        {/* Celebration */}
        {showCelebration && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'>
            <div className='text-center p-8 bg-white rounded-2xl max-w-md animate-bounce'>
              <Sparkles className='w-24 h-24 text-yellow-400 mx-auto mb-4' />
              <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                Safari Complete!
              </h2>
              <p className='text-gray-600 mb-6'>You found all the shapes!</p>
              <p className='text-2xl font-bold text-amber-600 mb-6'>
                Score: {score}
              </p>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  setLevel(1);
                  setScore(0);
                  setShowStartScreen(true);
                }}
                className='px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xl transition-colors'
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </GameContainer>
    </GameShell>
  );
}
