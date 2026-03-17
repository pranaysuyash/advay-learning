/**
 * Mirror Maze Game
 *
 * Steer a ball through a maze using head tilt!
 *
 * Educational Focus:
 * - Spatial awareness
 * - Motor control
 * - Problem-solving
 * - Cause and effect
 *
 * Controls:
 * - CV Mode: Tilt head to steer ball
 * - Mouse Mode: Arrow keys or WASD to steer
 */

import { memo, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { useGameFaceTracking } from '../hooks/useGameFaceTracking';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { ThreeDGameCanvas } from '../components/game/three/ThreeDGameCanvas';
import Webcam from 'react-webcam';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import {
  initializeGame,
  updateBall,
  checkGoalReached,
  normalizeTilt,
  calculateScore,
  getCurrentMaze,
  type GameState,
} from '../games/mirrorMazeLogic';
import { type HeadPose } from '../utils/headPose';

const MirrorMazeContent = memo(function MirrorMazeContent() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // Game state
  const [showMenu, setShowMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(1));
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState('Tilt your head to steer the ball!');
  const [cursor, setCursor] = useState<Point | null>(null);

  // Rendering mode (2D or 3D)
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Streak tracking
  const { streak, incrementStreak } = useStreakTracking();

  // Hooks
  const { playPop, playSuccess } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('mirror-maze');

  // Get current maze
  const maze = getCurrentMaze(gameState.level);

  // Conversion helpers for 3D view
  const WORLD_SCALE = 0.01; // pixels -> world units
  const to3D = (x: number, y: number): [number, number, number] => {
    // Convert 2D maze coordinates (0..width, 0..height) into centered 3D coordinates
    return [
      (x - maze.width / 2) * WORLD_SCALE,
      0.25,
      (y - maze.height / 2) * WORLD_SCALE,
    ];
  };

  const to3DWall = (wall: { x: number; y: number; width: number; height: number }) => {
    return {
      position: [
        (wall.x + wall.width / 2 - maze.width / 2) * WORLD_SCALE,
        0.25,
        (wall.y + wall.height / 2 - maze.height / 2) * WORLD_SCALE,
      ] as [number, number, number],
      size: [wall.width * WORLD_SCALE, 0.5, wall.height * WORLD_SCALE] as [number, number, number],
    };
  };

  // Handle Face Frame
  const handleFaceFrame = useCallback((pose: HeadPose) => {
    if (!gameState.isPlaying) return;

    // Convert roll (tilt) and pitch (up/down) to game tilt
    // Roll is head tilt side-to-side (-90 to 90)
    // Pitch is up/down (-90 to 90)

    // Calculate cursor from tilt for GameCursor display
    const cursorX = 0.5 + (pose.roll / 90) * 0.4;
    const cursorY = 0.5 + (pose.pitch / 90) * 0.4;
    setCursor({ x: Math.max(0, Math.min(1, cursorX)), y: Math.max(0, Math.min(1, cursorY)) });

    // Sensitivity adjustment
    const sensitivity = 0.05;
    const deadzone = 5; // degrees

    let tx = 0;
    let ty = 0;

    if (Math.abs(pose.roll) > deadzone) {
      tx = pose.roll * sensitivity;
    }

    if (Math.abs(pose.pitch) > deadzone) {
      ty = pose.pitch * sensitivity;
    }

    const normalized = normalizeTilt(tx, ty, 1.0);
    setTilt(normalized);
  }, [gameState.isPlaying]);

  const { faceDetected } = useGameFaceTracking({
    gameName: 'Mirror Maze',
    webcamRef,
    onFrame: handleFaceFrame,
    enabled: true,
  });

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameState.isPlaying) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update ball physics
    const newBall = updateBall(
      gameState.ball,
      tilt.x,
      tilt.y,
      maze.walls,
      maze.width,
      maze.height,
      deltaTime
    );

    setGameState(prev => ({
      ...prev,
      ball: newBall,
      moves: prev.moves + 1,
    }));

    // Check goal
    if (checkGoalReached(newBall, maze.goal)) {
      playSuccess();
      triggerHaptic('celebration');
      incrementStreak();

      const timeMs = Date.now() - gameState.startTime;
      const score = calculateScore(gameState.moves, timeMs, gameState.level);

      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        completed: true,
      }));

      setShowCelebration(true);
      setFeedback('Level Complete! 🎉');

      if (ttsEnabled) {
        speak(`Amazing! You completed level ${gameState.level}!`);
      }

      setTimeout(() => {
        setShowCelebration(false);

        // Next level or complete
        if (gameState.level < 3) {
          setGameState(initializeGame(gameState.level + 1));
          setShowMenu(true);
        } else {
          // All levels complete
          (async () => {
            await completeGame({ score, level: 3 });
          })();
        }
      }, 2000);

      return;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, tilt, maze, playSuccess, incrementStreak, ttsEnabled, speak, completeGame]);

  // Keyboard controls (fallback)
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      updateTiltFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
      updateTiltFromKeys();
    };

    const updateTiltFromKeys = () => {
      let x = 0;
      let y = 0;

      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) x -= 1;
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) x += 1;
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) y -= 1;
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) y += 1;

      const normalized = normalizeTilt(x, y, 0.8);
      setTilt(normalized);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPlaying]);

  // Start game
  const handleStart = useCallback(() => {
    playPop();
    setShowMenu(false);
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now(),
    }));
    lastTimeRef.current = performance.now();

    if (ttsEnabled) {
      speak('Tilt your head to steer the ball to the goal!');
    }

    setFeedback('Use arrow keys or WASD to steer!');

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [playPop, ttsEnabled, speak, gameLoop]);

  // Stop game
  const stopGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Reset level
  const handleReset = useCallback(() => {
    playPop();
    stopGame();
    setGameState(initializeGame(gameState.level));
    setTilt({ x: 0, y: 0 });
    setShowMenu(true);
  }, [playPop, stopGame, gameState.level]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Menu controls
  const menuControls: GameControl[] = [
    { id: 'play', label: 'Play', icon: 'play', onClick: handleStart },
  ];

  // Game controls
  const gameControls: GameControl[] = [
    { id: 'reset', label: 'Reset', icon: 'rotate-ccw', onClick: handleReset },
    { id: 'menu', label: 'Menu', icon: 'home', onClick: () => { stopGame(); setShowMenu(true); } },
  ];

  // Render maze walls
  const renderWalls = () => (
    <>
      {maze.walls.map((wall) => (
        <div
          key={`wall-${wall.x}-${wall.y}`}
          className="absolute rounded shadow-lg"
          style={{
            left: wall.x,
            top: wall.y,
            width: wall.width,
            height: wall.height,
            backgroundImage: 'url(/assets/kenney/platformer/tiles/brick_grey.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ))}
    </>
  );

  // Render ball
  const renderBall = () => (
    <motion.div
      className="absolute rounded-full shadow-xl overflow-hidden"
      style={{
        left: gameState.ball.x - gameState.ball.radius,
        top: gameState.ball.y - gameState.ball.radius,
        width: gameState.ball.radius * 2,
        height: gameState.ball.radius * 2,
      }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src="/assets/kenney/platformer/collectibles/coin_gold.png"
        alt="Ball"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </motion.div>
  );

  // Render goal
  const renderGoal = () => (
    <motion.div
      className="absolute rounded-full shadow-xl overflow-hidden"
      style={{
        left: maze.goal.x - maze.goal.radius,
        top: maze.goal.y - maze.goal.radius,
        width: maze.goal.radius * 2,
        height: maze.goal.radius * 2,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src="/assets/kenney/platformer/collectibles/star.png"
        alt="Goal"
        className="w-full h-full object-contain"
        draggable={false}
      />
    </motion.div>
  );

  const Ball3D = ({ position }: { position: [number, number, number] }) => {
    const meshRef = useRef<Mesh>(null);

    useFrame(() => {
      if (meshRef.current) {
        meshRef.current.position.set(position[0], position[1], position[2]);
      }
    });

    return (
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#60a5fa" emissiveIntensity={0.4} />
      </mesh>
    );
  };

  const render3DScene = () => (
    <ThreeDGameCanvas
      cameraPosition={[0, 5, 8]}
      cameraTarget={[0, 0, 0]}
      enableOrbit={false}
      backgroundColor="#e0f7ff"
      environment="studio"
      className="w-full h-full"
    >
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[maze.width * WORLD_SCALE, maze.height * WORLD_SCALE]} />
        <meshStandardMaterial color="#bfdbfe" />
      </mesh>

      {/* Maze walls */}
      {maze.walls.map((wall) => {
        const { position, size } = to3DWall(wall);
        return (
          <mesh key={`wall3d-${wall.x}-${wall.y}`} position={position} receiveShadow castShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        );
      })}

      {/* Goal */}
      <mesh position={to3D(maze.goal.x, maze.goal.y)} castShadow>
        <sphereGeometry args={[maze.goal.radius * WORLD_SCALE, 32, 32]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
      </mesh>

      {/* Ball */}
      <Ball3D position={to3D(gameState.ball.x, gameState.ball.y)} />
    </ThreeDGameCanvas>
  );

  return (
    <GameContainer
      title="Mirror Maze"
      isPlaying={gameState.isPlaying}
      isHandDetected={faceDetected}
      webcamRef={webcamRef}
    >
      {/* Hidden webcam feed used for face tracking */}
      <div className="sr-only">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          videoConstraints={{ facingMode: 'user' }}
        />
      </div>

      <VoiceInstructions
        instructions="Tilt your head to steer the ball to the star!"
      />

      {/* Header */}
      {!showMenu && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-gray-600">Level</div>
            <div className="text-xl font-bold text-blue-900">
              {gameState.level} / 3
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-gray-600">Moves</div>
            <div className="text-xl font-bold text-purple-900">
              {gameState.moves}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-gray-600">Streak</div>
            <div className="text-xl font-bold text-green-900">
              {streak}
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {!showMenu && feedback && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <AnimatePresence>
            <motion.div
              key={feedback}
              className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
            >
              {feedback}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Game Area */}
      {showMenu ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Mirror Maze 🎯
          </h1>
          <p className="text-lg text-blue-800 mb-4 text-center max-w-md">
            Tilt your head to steer the ball to the star!
          </p>

          <div className="flex items-center justify-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-4 py-2 rounded-full border-2 transition ${
                viewMode === '2d'
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
              }`}
            >
              2D Mode
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-full border-2 transition ${
                viewMode === '3d'
                  ? 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
              }`}
            >
              3D Mode
            </button>
          </div>

          <div className="flex gap-8 mb-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🔵</div>
              <div className="text-sm">Ball</div>
            </div>
            <div className="text-6xl">→</div>
            <div className="text-center">
              <div className="text-4xl mb-2">⭐</div>
              <div className="text-sm">Goal</div>
            </div>
          </div>
          <GameControls controls={menuControls} />
        </div>
      ) : (
        <div
          ref={canvasRef}
          className="flex-1 relative bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden"
          style={{
            width: maze.width,
            height: maze.height,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {viewMode === '2d' ? (
            <>
              {renderWalls()}
              {renderGoal()}
              {renderBall()}
            </>
          ) : (
            render3DScene()
          )}
        </div>
      )}

      {/* Controls */}
      {!showMenu && <GameControls controls={gameControls} position="bottom-left" />}

      {/* Celebrations */}
      <CelebrationOverlay
        show={showCelebration}
        letter="M"
        accuracy={100}
        message={gameState.completed ? `Level ${gameState.level} Complete!` : ''}
        onComplete={() => setShowCelebration(false)}
      />

      {cursor && (
        <GameCursor
          position={cursor}
          coordinateSpace="normalized"
          containerRef={canvasRef}
          isPinching={false}
          isHandDetected={true}
          size={64}
          color="#22c55e"
        />
      )}
    </GameContainer>
  );
});

export default function MirrorMaze() {
  return (
    <GameShell gameName="Mirror Maze" gameId="mirror-maze">
      <MirrorMazeContent />
    </GameShell>
  );
}

export { MirrorMaze };
