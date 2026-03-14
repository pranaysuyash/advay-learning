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

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
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
import Webcam from 'react-webcam';
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

  // Streak tracking
  const { streak, incrementStreak } = useStreakTracking();

  // Hooks
  const { playPop, playSuccess } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('mirror-maze');

  // Get current maze
  const maze = getCurrentMaze(gameState.level);

  // Handle Face Frame
  const handleFaceFrame = useCallback((pose: HeadPose) => {
    if (!gameState.isPlaying) return;

    // Convert roll (tilt) and pitch (up/down) to game tilt
    // Roll is head tilt side-to-side (-90 to 90)
    // Pitch is up/down (-90 to 90)

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
    enabled: gameState.isPlaying,
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
          className="absolute bg-gradient-to-br from-gray-700 to-gray-800 rounded shadow-lg"
          style={{
            left: wall.x,
            top: wall.y,
            width: wall.width,
            height: wall.height,
          }}
        />
      ))}
    </>
  );

  // Render ball
  const renderBall = () => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl"
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
      <div className="w-full h-full rounded-full bg-white/30 absolute top-0 left-0" />
    </motion.div>
  );

  // Render goal
  const renderGoal = () => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl"
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
      <div className="w-full h-full rounded-full flex items-center justify-center text-2xl">
        ⭐
      </div>
    </motion.div>
  );

  return (
    <GameContainer
      title="Mirror Maze"
      isPlaying={gameState.isPlaying}
      isHandDetected={faceDetected}
      webcamRef={webcamRef}
    >
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
          <p className="text-lg text-blue-800 mb-8 text-center max-w-md">
            Tilt your head to steer the ball to the star!
          </p>
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
          {renderWalls()}
          {renderGoal()}
          {renderBall()}
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
