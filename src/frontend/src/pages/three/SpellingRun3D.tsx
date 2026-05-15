import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Webcam from 'react-webcam';

import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { GameCursor } from '../../components/game/GameCursor';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useAudio } from '../../utils/hooks/useAudio';
import { triggerHaptic } from '../../utils/haptics';
import { useTTS } from '../../hooks/useTTS';
import { KenneyIcon } from '../../components/ui/KenneyIcon';
import type { TrackedHandFrame } from '../../types/tracking';
import type { Point } from '../../types/tracking';
import {
  initializeGame,
  updatePhysics,
  checkCollisions,
  type GameState,
  JUMP_FORCE,
} from '../../games/spellingRunLogic';

// Slower speed for kids (reduced from 5 to 2.5)
const KID_FRIENDLY_SPEED = 2.5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Gesture detection thresholds
const JUMP_HAND_Y_THRESHOLD = 0.3; // Hand above 30% of screen = jump
const JUMP_COOLDOWN = 500; // ms between jumps
const GESTURE_CONFIDENCE_THRESHOLD = 3; // frames to confirm gesture

interface LetterBubbleProps {
  char: string;
  isCollected: boolean;
  isCorrect: boolean;
  position: [number, number, number];
  onCollect: () => void;
}

function LetterBubble({
  char,
  isCollected,
  isCorrect,
  position,
  onCollect,
}: LetterBubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(1);

  useFrame(({ clock }) => {
    if (!meshRef.current || isCollected) return;
    // Gentle floating animation
    meshRef.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 2) * 0.1;
    meshRef.current.rotation.y += 0.01;
  });

  useEffect(() => {
    if (isCollected) {
      // Shrink animation when collected
      const animate = () => {
        setScale((s) => {
          if (s <= 0.1) {
            onCollect();
            return 0;
          }
          requestAnimationFrame(animate);
          return s * 0.9;
        });
      };
      animate();
    }
  }, [isCollected, onCollect]);

  if (scale === 0) return null;

  const bubbleColor = isCorrect ? '#FFD700' : '#FF6B6B';
  const glowIntensity = isCorrect ? 1.5 : 1;

  return (
    <group position={position} scale={scale}>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.4 * glowIntensity, 32, 32]} />
        <meshBasicMaterial color={bubbleColor} transparent opacity={0.2} />
      </mesh>
      {/* Main bubble */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color={bubbleColor}
          transparent
          opacity={0.7}
          emissive={bubbleColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Letter */}
      <Html position={[0, 0, 0.4]} center>
        <div
          className={`text-3xl font-black ${
            isCorrect ? 'text-yellow-600' : 'text-red-600'
          }`}
          style={{
            textShadow: '0 2px 4px rgba(255,255,255,0.8)',
            fontFamily: '"Kenney Future", sans-serif',
          }}
        >
          {char}
        </div>
      </Html>
    </group>
  );
}

interface Player3DProps {
  position: [number, number, number];
  isJumping: boolean;
}

function Player3D({ position, isJumping }: Player3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Squash and stretch based on jump state
    if (isJumping) {
      groupRef.current.scale.set(0.9, 1.1, 0.9);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.3]} />
        <meshStandardMaterial color='#FF6B6B' />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color='#FFE4C4' />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 0.7, 0.15]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color='#333' />
      </mesh>
      <mesh position={[0.08, 0.7, 0.15]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color='#333' />
      </mesh>
      {/* Smile */}
      <mesh position={[0, 0.58, 0.15]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.08, 0.02, 8, 16, Math.PI]} />
        <meshBasicMaterial color='#333' />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, -0.1, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color='#4ECDC4' />
      </mesh>
      <mesh position={[0.1, -0.1, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color='#4ECDC4' />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.25, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color='#FFE4C4' />
      </mesh>
      <mesh position={[0.25, 0.25, 0]} castShadow>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color='#FFE4C4' />
      </mesh>
    </group>
  );
}

interface Platform3DProps {
  position: [number, number, number];
  width: number;
}

function Platform3D({ position, width }: Platform3DProps) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[width, 0.3, 2]} />
      <meshStandardMaterial color='#4CAF50' />
    </mesh>
  );
}

// Jump gesture indicator
function JumpIndicator({ isActive }: { isActive: boolean }) {
  return (
    <Html position={[0, 3, 0]} center>
      <div
        className={`px-4 py-2 rounded-full font-bold text-white transition-all ${
          isActive
            ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/50'
            : 'bg-slate-500/50 scale-100'
        }`}
      >
        {isActive ? 'JUMP!' : 'Raise hands to jump'}
      </div>
    </Html>
  );
}

function SpellingRun3DScene({
  gameState,
  onLetterCollect,
}: {
  gameState: GameState;
  onLetterCollect: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Camera follows player
  useFrame(() => {
    if (!groupRef.current) return;
    const scrollX = gameState.scrollX / CANVAS_WIDTH;
    groupRef.current.position.x = -scrollX * 5;
  });

  // Player position in 3D space (mapped from 2D coordinates)
  const player3DX =
    (gameState.player.x - gameState.scrollX) / CANVAS_WIDTH - 0.5;
  const player3DY = -(gameState.player.y / CANVAS_HEIGHT) + 0.5;

  return (
    <group ref={groupRef}>
      {/* Ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color='#87CEEB' opacity={0.3} transparent />
      </mesh>

      {/* Platforms */}
      {gameState.platforms.map((p) => {
        const x = (p.x - gameState.scrollX) / CANVAS_WIDTH - 0.5;
        const y = -(p.y / CANVAS_HEIGHT) + 0.5;
        // Only render visible platforms
        if (x < -3 || x > 3) return null;
        return (
          <Platform3D
            key={p.id}
            position={[x, y, 0]}
            width={p.width / CANVAS_WIDTH}
          />
        );
      })}

      {/* Letters */}
      {gameState.letters.map((l) => {
        if (l.isCollected) return null;
        const x = (l.x - gameState.scrollX) / CANVAS_WIDTH - 0.5;
        const y = -(l.y / CANVAS_HEIGHT) + 0.5;
        // Only render visible letters
        if (x < -3 || x > 3) return null;
        return (
          <LetterBubble
            key={l.id}
            char={l.char}
            isCollected={l.isCollected}
            isCorrect={l.isCorrect}
            position={[x, y, 0]}
            onCollect={() => onLetterCollect(l.id)}
          />
        );
      })}

      {/* Player */}
      <Player3D
        position={[player3DX, player3DY, 0]}
        isJumping={gameState.player.isJumping}
      />
    </group>
  );
}

export const SpellingRun3DContent = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGame(1),
  );
  const [difficulty] = useState<number>(1);

  // Gesture detection state
  const [jumpGestureActive, setJumpGestureActive] = useState(false);
  const [jumpGestureFrames, setJumpGestureFrames] = useState(0);
  const [lastJumpTime, setLastJumpTime] = useState(0);
  const [gestureHint, setGestureHint] = useState('');

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const { completeGame } = useGameCompletion('spelling-run');
  const { playError, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  // Detect jump gesture from hand position
  const detectJumpGesture = useCallback((frame: TrackedHandFrame): boolean => {
    // Check if index finger is raised high enough
    if (frame.indexTip && frame.indexTip.y < JUMP_HAND_Y_THRESHOLD) {
      return true;
    }
    return false;
  }, []);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (!frame.indexTip || gameStateRef.current.status !== 'playing') {
        if (!frame.indexTip) setCursor(null);
        return;
      }

      const tip = frame.indexTip;
      setCursor({ x: tip.x, y: tip.y });

      // Detect jump gesture
      const isJumpGesture = detectJumpGesture(frame);

      if (isJumpGesture) {
        setJumpGestureFrames((f) => f + 1);
        if (jumpGestureFrames >= GESTURE_CONFIDENCE_THRESHOLD) {
          setJumpGestureActive(true);
          setGestureHint('Release to jump!');

          // Trigger jump on gesture release or after threshold
          const now = Date.now();
          if (
            now - lastJumpTime > JUMP_COOLDOWN &&
            !gameStateRef.current.player.isJumping
          ) {
            setGameState((prev) => ({
              ...prev,
              player: {
                ...prev.player,
                vy: JUMP_FORCE,
                isJumping: true,
              },
            }));
            setLastJumpTime(now);
            triggerHaptic('success');
            playClick();
          }
        }
      } else {
        setJumpGestureFrames(0);
        setJumpGestureActive(false);
        setGestureHint('');
      }

      // Horizontal movement: Map finger X to player target position relative to scroll
      setGameState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          x: tip.x * CANVAS_WIDTH + prev.scrollX,
        },
      }));
    },
    [detectJumpGesture, jumpGestureFrames, lastJumpTime, playClick],
  );

  const { handVisible } = useGameHandTracking({
    gameName: 'SpellingRun3D',
    webcamRef,
    onFrame: handleFrame,
  });

  // Game Loop with slower speed
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      if (gameStateRef.current.status === 'playing') {
        setGameState((prev) => {
          // Use slower speed for kids
          let next = updatePhysics(prev, 1);

          // Override scroll speed with kid-friendly speed
          next.scrollX = prev.scrollX + KID_FRIENDLY_SPEED;

          next = checkCollisions(next);

          if (next.status === 'complete') {
            playCelebration();
            (async () => {
              await completeGame({ score: next.score, level: 1 });
            })();
          } else if (next.status === 'failed') {
            playError();
          }

          return next;
        });
      }
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [completeGame, playCelebration, playError]);

  const handleLetterCollect = useCallback((_id: string) => {
    // Animation callback - letter already collected in game logic
  }, []);

  const handleStart = () => {
    setGameState((prev) => ({ ...prev, status: 'playing' }));
    playClick();
    if (ttsEnabled) {
      speak(`Spell ${gameState.targetWord}! Raise your hands high to jump!`);
    }
  };

  const handleReset = () => {
    setGameState(initializeGame(difficulty));
    playClick();
  };

  return (
    <GameContainer
      title='Spelling Run 3D'
      onHome={() => navigate('/games')}
      score={gameState.score}
      showScore={gameState.status !== 'idle'}
      isPlaying={gameState.status === 'playing'}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      <div
        ref={gameAreaRef}
        className='relative w-full h-full flex flex-col items-center justify-center'
      >
        {gameState.status === 'idle' ? (
          <div className='text-center z-10'>
            <div className='mb-8'>
              <KenneyIcon type='star' size={80} className='text-yellow-400' />
            </div>
            <h2 className='text-4xl font-black text-white mb-4 drop-shadow-lg'>
              Ready to Spell?
            </h2>
            <p className='text-xl text-white/90 mb-6 drop-shadow'>
              Move your hand to walk • Raise hands high to jump!
            </p>
            <button
              onClick={handleStart}
              className='px-12 py-6 min-h-[80px] bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-3xl font-black text-2xl shadow-xl transition-all transform hover:scale-105'
            >
              Start Running!
            </button>
          </div>
        ) : (
          <>
            {/* Word progress display */}
            <div className='absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-xl z-10'>
              <span className='text-2xl font-bold text-gray-400'>Target:</span>
              <div className='flex gap-2'>
                {gameState.targetWord.split('').map((char, i) => (
                  <div
                    key={i}
                    className={`w-10 h-12 border-b-4 flex items-center justify-center text-3xl font-black ${
                      i < gameState.currentWord.length
                        ? 'border-green-500 text-green-600'
                        : 'border-gray-300 text-gray-300'
                    }`}
                  >
                    {i < gameState.currentWord.length ? char : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Gesture hint */}
            {gestureHint && (
              <div className='absolute top-20 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-6 py-3 rounded-full font-bold text-xl z-10 animate-pulse'>
                {gestureHint}
              </div>
            )}

            {/* 3D Canvas */}
            <div className='w-full h-full rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100'>
              <ThreeDGameCanvas
                cameraPosition={[0, 2, 6]}
                cameraTarget={[0, 0, 0]}
                enableOrbit={false}
                backgroundColor='#87CEEB'
                environment={null}
              >
                <ambientLight intensity={0.6} />
                <directionalLight
                  position={[5, 10, 5]}
                  intensity={1}
                  castShadow
                  shadow-mapSize={[1024, 1024]}
                />
                <pointLight
                  position={[-5, 5, -5]}
                  intensity={0.5}
                  color='#FFE4C4'
                />

                <SpellingRun3DScene
                  gameState={gameState}
                  onLetterCollect={handleLetterCollect}
                />
                <JumpIndicator isActive={jumpGestureActive} />
              </ThreeDGameCanvas>
            </div>

            {gameState.status === 'complete' && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-20 rounded-3xl'>
                <div className='bg-white p-12 rounded-[3rem] text-center shadow-2xl'>
                  <div className='flex justify-center mb-4'>
                    <KenneyIcon type='star' size={64} />
                  </div>
                  <h2 className='text-4xl font-black text-gray-800 mb-2'>
                    Word Spelled!
                  </h2>
                  <p className='text-2xl text-green-600 font-bold mb-8'>
                    {gameState.targetWord}
                  </p>
                  <button
                    onClick={handleReset}
                    className='px-8 py-4 min-h-[80px] bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg transition-all'
                  >
                    Next Word
                  </button>
                </div>
              </div>
            )}

            {gameState.status === 'failed' && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-20 rounded-3xl'>
                <div className='bg-white p-12 rounded-[3rem] text-center shadow-2xl'>
                  <h2 className='text-4xl font-black text-gray-800 mb-2'>
                    Try Again!
                  </h2>
                  <p className='text-xl text-gray-600 mb-8'>
                    Keep practicing! You'll get it!
                  </p>
                  <button
                    onClick={handleReset}
                    className='px-8 py-4 min-h-[80px] bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xl shadow-lg transition-all'
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Webcam (hidden, for tracking) */}
      <Webcam
        ref={webcamRef}
        audio={false}
        className='absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none'
      />

      {/* CV Cursor */}
      {cursor && (
        <GameCursor
          position={cursor}
          coordinateSpace='normalized'
          containerRef={gameAreaRef}
          isPinching={jumpGestureActive}
          isHandDetected={true}
          size={64}
          color={jumpGestureActive ? '#22c55e' : '#3B82F6'}
        />
      )}
    </GameContainer>
  );
};

export const SpellingRun3D = () => (
  <GameShell gameId='spelling-run-3d' gameName='Spelling Run 3D'>
    <SpellingRun3DContent />
  </GameShell>
);

export default SpellingRun3D;
