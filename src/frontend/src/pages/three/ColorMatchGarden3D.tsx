/**
 * Color Match Garden 3D
 *
 * 3D version of Color Match Garden with 3D flowers and hand tracking.
 *
 * @ticket Phase-7-P0 - 3D Conversion
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import { Sparkles, Play, Hand, Flower } from 'lucide-react';
import {
  FLOWERS,
  GAME_CONFIG,
  buildRoundTargets,
  getPromptTarget,
  type GardenTarget,
} from '../../games/colorMatchGardenLogic';

// 3D Flower component
interface Flower3DProps {
  target: GardenTarget;
  onSelect: (id: number) => void;
  cursor: { x: number; y: number } | null;
  isCorrect: boolean;
}

function Flower3D({ target, onSelect, cursor, isCorrect }: Flower3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    // Gentle swaying animation
    meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 2) * 0.1;
    meshRef.current.position.y = Math.sin(clock.getElapsedTime() * 3) * 0.05;

    // Check cursor hover
    if (cursor) {
      const dx = cursor.x - target.position.x;
      const dy = cursor.y - target.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setHovered(distance < GAME_CONFIG.TARGET_RADIUS);
    }
  });

  const flowerColor =
    FLOWERS.find((f) => f.name === target.name)?.color || target.color;

  return (
    <group
      position={[target.position.x * 10 - 5, 0, target.position.y * 10 - 5]}
    >
      {/* Flower stem */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color='#22c55e' />
      </mesh>

      {/* Flower center */}
      <mesh
        ref={meshRef}
        position={[0, 1, 0]}
        scale={isCorrect ? 1.2 : hovered ? 1.1 : 1}
        onClick={() => onSelect(target.id)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={flowerColor}
          emissive={flowerColor}
          emissiveIntensity={isCorrect ? 0.5 : hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Correct indicator */}
      {isCorrect && (
        <mesh position={[0, 1.5, 0]}>
          <torusGeometry args={[0.4, 0.05, 8, 16]} />
          <meshBasicMaterial color='#fbbf24' />
        </mesh>
      )}
    </group>
  );
}

// Game state interface
interface ColorMatchGameState {
  targets: GardenTarget[];
  promptId: number;
  score: number;
  streak: number;
  level: number;
  timeLeft: number;
  gameOver: boolean;
  foundTargets: number[];
}

// Main game component
export default function ColorMatchGarden3D() {
  const { playSFX } = use3DGameAudio();
  const { completeGame } = useGameCompletion('color-match-garden-3d');

  const { cursor, isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'ColorMatchGarden3D',
    targetFps: 30,
  });

  const [gameState, setGameState] = useState<ColorMatchGameState>({
    targets: [],
    promptId: 0,
    score: 0,
    streak: 0,
    level: 1,
    timeLeft: GAME_CONFIG.GAME_DURATION_SECONDS,
    gameOver: false,
    foundTargets: [],
  });

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize round
  const initializeRound = useCallback(() => {
    const round = buildRoundTargets();
    setGameState((prev) => ({
      ...prev,
      targets: round.targets,
      promptId: round.promptId,
      foundTargets: [],
    }));
  }, []);

  const handleStart = useCallback(() => {
    initializeRound();
    setGameState((prev) => ({
      ...prev,
      score: 0,
      streak: 0,
      level: 1,
      timeLeft: GAME_CONFIG.GAME_DURATION_SECONDS,
      gameOver: false,
    }));
    setShowStartScreen(false);
    playSFX('start');
    startTracking();
  }, [playSFX, startTracking, initializeRound]);

  const handleSelectFlower = useCallback(
    (targetId: number) => {
      setGameState((prev) => {
        const promptTarget = getPromptTarget(prev.targets, prev.promptId);
        if (!promptTarget) return prev;

        const selectedTarget = prev.targets.find((t) => t.id === targetId);
        if (!selectedTarget || prev.foundTargets.includes(targetId))
          return prev;

        const isCorrect = selectedTarget.id === promptTarget.id;

        if (isCorrect) {
          playSFX('success');
          const newStreak = prev.streak + 1;
          const points = Math.floor(
            GAME_CONFIG.BASE_POINTS_PER_MATCH * (1 + newStreak * 0.1),
          );
          const newFoundTargets = [...prev.foundTargets, targetId];
          const newScore = prev.score + points;

          // Check if round complete
          if (newFoundTargets.length >= prev.targets.length) {
            if (prev.level >= 3) {
              setShowCelebration(true);
              completeGame({
                score: newScore,
                completed: true,
                level: prev.level,
              });
            } else {
              // Next level
              setTimeout(() => {
                setGameState((curr) => {
                  const round = buildRoundTargets();
                  return {
                    ...curr,
                    targets: round.targets,
                    promptId: round.promptId,
                    foundTargets: [],
                    level: curr.level + 1,
                  };
                });
              }, 1000);
            }
          }

          return {
            ...prev,
            score: newScore,
            streak: newStreak,
            foundTargets: newFoundTargets,
          };
        } else {
          playSFX('error');
          return { ...prev, streak: 0 };
        }
      });
    },
    [playSFX, completeGame],
  );

  useFrame(() => {
    if (showStartScreen || showCelebration) return;

    setGameState((prev) => {
      if (prev.timeLeft <= 0 && !prev.gameOver) {
        completeGame({ score: prev.score, completed: true, level: prev.level });
        return { ...prev, gameOver: true, timeLeft: 0 };
      }
      return { ...prev, timeLeft: Math.max(0, prev.timeLeft - 0.016) };
    });
  });

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  const promptTarget = getPromptTarget(gameState.targets, gameState.promptId);

  return (
    <GameShell gameId='color-match-garden-3d' gameName='Color Match Garden 3D'>
      <GameContainer>
        <ThreeDGameCanvas
          environment='forest'
          showFPS={import.meta.env.DEV}
          enableAdaptiveQuality={true}
        >
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color='#22c55e' />
          </mesh>

          {/* Sky */}
          <color attach='background' args={['#87ceeb']} />

          {/* Flowers */}
          {!showStartScreen &&
            gameState.targets.map((target) => (
              <Flower3D
                key={target.id}
                target={target}
                onSelect={handleSelectFlower}
                cursor={cursor}
                isCorrect={gameState.foundTargets.includes(target.id)}
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
          <div className='absolute inset-0 flex items-center justify-center bg-green-900/80 backdrop-blur-sm z-10'>
            <div className='text-center p-8 bg-white/10 rounded-2xl max-w-md'>
              <Flower className='w-16 h-16 text-pink-400 mx-auto mb-4' />
              <h1 className='text-4xl font-bold text-white mb-4'>
                Color Match Garden 3D
              </h1>
              <p className='text-white/80 mb-6'>
                Match the flowers to the target colors!
              </p>
              <button
                onClick={handleStart}
                className='px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl flex items-center gap-3 mx-auto transition-colors'
              >
                <Play className='w-6 h-6' />
                Start Game
              </button>
              <div className='mt-6 flex items-center justify-center gap-2 text-white/60'>
                <Hand className='w-5 h-5' />
                <span>Use hand tracking to select flowers</span>
              </div>
            </div>
          </div>
        )}

        {/* HUD */}
        {!showStartScreen && !showCelebration && (
          <div className='absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none'>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg'>
              <div className='text-sm text-gray-600'>Score</div>
              <div className='text-2xl font-bold text-green-600'>
                {gameState.score}
              </div>
            </div>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg text-center'>
              <div className='text-sm text-gray-600'>Find</div>
              <div className='text-2xl font-bold text-pink-600'>
                {promptTarget?.name || ''}
              </div>
            </div>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg'>
              <div className='text-sm text-gray-600'>Time</div>
              <div className='text-2xl font-bold text-blue-600'>
                {Math.ceil(gameState.timeLeft)}s
              </div>
            </div>
            <div className='bg-white/90 backdrop-blur-md rounded-xl px-6 py-3 shadow-lg'>
              <div className='text-sm text-gray-600'>Level</div>
              <div className='text-2xl font-bold text-purple-600'>
                {gameState.level}
              </div>
            </div>
          </div>
        )}

        {/* Celebration */}
        {showCelebration && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'>
            <div className='text-center p-8 bg-white rounded-2xl max-w-md animate-bounce'>
              <Sparkles className='w-24 h-24 text-yellow-400 mx-auto mb-4' />
              <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                Beautiful Garden!
              </h2>
              <p className='text-gray-600 mb-6'>You matched all the flowers!</p>
              <p className='text-2xl font-bold text-green-600 mb-6'>
                Score: {gameState.score}
              </p>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  setGameState({
                    targets: [],
                    promptId: 0,
                    score: 0,
                    streak: 0,
                    level: 1,
                    timeLeft: GAME_CONFIG.GAME_DURATION_SECONDS,
                    gameOver: false,
                    foundTargets: [],
                  });
                  setShowStartScreen(true);
                }}
                className='px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xl transition-colors'
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
