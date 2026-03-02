/**
 * Musical Statues Game
 *
 * Children dance to music and freeze when it stops.
 * Game detects movement vs stillness using pose detection.
 *
 * Educational Focus:
 * - Body awareness and self-control
 * - Listening skills and timing
 * - Gross motor skills through dancing
 * - Inhibition control (stopping action)
 *
 * Controls:
 * - Camera tracks full body movements
 * - Dance when music plays
 * - Freeze completely when music stops
 * - Hold poses until music starts again
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  type GameState,
  initializeGame,
  updateGameState,
  getFeedbackMessage,
  getLevelDisplayName,
} from '../games/musicalStatuesLogic';

export const MusicalStatues = memo(function MusicalStatues() {
  // ===== HOOKS =====
  const { onGameComplete } = useGameDrops('musical-statues');
  const { playClick } = useAudio();

  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const currentPoseRef = useRef<any[] | null>(null);

  // ===== GAME SESSION TRACKING =====
  useGameSessionProgress({
    gameName: 'Musical Statues',
    score: gameState?.score || 0,
    level: gameState?.level || 1,
    isPlaying: !showMenu && gameState?.gameActive && !isLoading,
  });

  // ===== POSE LANDMARKER INITIALIZATION =====
  useEffect(() => {
    async function initPose() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        let landmarker: PoseLandmarker;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        } catch (e) {
          console.warn('GPU delegate failed for PoseLandmarker, falling back to CPU:', e);
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        }

        poseLandmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize pose landmarker:', err);
        setError('Could not load pose detection. Try refreshing or check your internet connection.');
        setIsLoading(false);
      }
    }

    initPose();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ===== GAME LOOP =====
  const gameLoop = useCallback(() => {
    if (
      !webcamRef.current ||
      !poseLandmarkerRef.current ||
      !cameraReady ||
      !gameState?.gameActive ||
      showMenu
    ) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Detect pose
    const results = poseLandmarkerRef.current.detectForVideo(video, currentTime);

    // Store current pose for movement detection
    if (results.landmarks && results.landmarks.length > 0) {
      currentPoseRef.current = results.landmarks[0] as any[];
    }

    // Update game state
    setGameState(prevState => {
      if (!prevState) return prevState;
      return updateGameState(prevState, deltaTime, currentPoseRef.current);
    });

    // Render canvas
    renderCanvas();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, cameraReady, showMenu]);

  // Start game loop when ready
  useEffect(() => {
    if (!isLoading && !showMenu && gameState?.gameActive) {
      lastFrameTimeRef.current = performance.now();
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading, showMenu, gameState?.gameActive, gameLoop]);

  // ===== CANVAS RENDERING =====
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background based on game state
    if (gameState.isMusicPlaying) {
      // Fun dance background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#FF6B6B');
      gradient.addColorStop(0.5, '#FFE66D');
      gradient.addColorStop(1, '#4ECDC4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else if (gameState.isFrozen) {
      // Frozen background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F7FA');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Neutral background
      ctx.fillStyle = '#F8F9FA';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw music notes when playing
    if (gameState.isMusicPlaying) {
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const time = Date.now() / 1000;

      for (let i = 0; i < 8; i++) {
        const x = (width / 8) * i + (width / 16);
        const y = (height / 2) + Math.sin(time + i) * 50;
        const note = ['♪', '♫', '♬'][i % 3];
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time + i) * 0.4})`;
        ctx.fillText(note, x, y);
      }
    }

    // Draw freeze indicator when frozen
    if (gameState.isFrozen) {
      ctx.save();
      ctx.strokeStyle = gameState.moveDuringFreeze ? '#FF6B6B' : '#4ECDC4';
      ctx.lineWidth = 8;
      ctx.setLineDash([20, 10]);

      if (gameState.moveDuringFreeze) {
        // Red X for movement detected
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.3);
        ctx.lineTo(width * 0.7, height * 0.7);
        ctx.moveTo(width * 0.7, height * 0.3);
        ctx.lineTo(width * 0.3, height * 0.7);
        ctx.stroke();
      } else {
        // Blue circle for frozen
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 150, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw status message
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const feedback = getFeedbackMessage(gameState);
    ctx.fillText(feedback, width / 2, height * 0.85);

    // Draw combo indicator
    if (gameState.combo > 1) {
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`🔥 ${gameState.combo}x Combo!`, width / 2, height * 0.92);
    }
  }, [gameState]);

  // ===== GAME FLOW =====
  const startGame = () => {
    playClick();
    setGameState(initializeGame(1));
    setShowMenu(false);
    currentPoseRef.current = null;
  };

  const handleGameComplete = () => {
    if (gameState) {
      // DEBUG: console.log('Game complete');
    }
    setShowMenu(true);
    setGameState(null);
  };

  const handleShowMenu = () => {
    playClick();
    if (gameState) {
      onGameComplete();
    }
    setShowMenu(true);
    setGameState(null);
  };

  // ===== CAMERA READY HANDLER =====
  const handleCameraReady = () => {
    setCameraReady(true);
  };

  // ===== RENDER =====
  return (
    <GameContainer webcamRef={webcamRef} title="Musical Statues" onHome={handleShowMenu} reportSession={false}>
      {/* Hidden webcam for pose detection */}
      <div className="absolute top-0 right-0 w-40 h-32 opacity-0 pointer-events-none overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          onUserMedia={handleCameraReady}
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className="w-full h-full object-cover"
        />
      </div>

      {showMenu ? (
        // ===== MAIN MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          {/* Animated Music Icon */}
          <motion.div
            className="relative mb-6"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-8xl">🎵</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🗿</div>
          </motion.div>

          <h2 className="text-3xl font-bold text-advay-slate mb-3">
            Musical Statues!
          </h2>
          <p className="text-advay-slate mb-6 text-center max-w-md">
            Dance to the music and freeze when it stops! Hold your poses like a statue!
          </p>

          {/* Game Instructions */}
          <div className="grid grid-cols-1 gap-4 mb-6 max-w-md w-full">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">🎵</div>
                <div className="font-bold text-pink-700">When Music Plays</div>
              </div>
              <div className="text-sm text-pink-600">Dance! Move your body and have fun!</div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">🗿</div>
                <div className="font-bold text-blue-700">When Music Stops</div>
              </div>
              <div className="text-sm text-blue-600">FREEZE! Hold completely still like a statue!</div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">⭐</div>
                <div className="font-bold text-green-700">Score Points</div>
              </div>
              <div className="text-sm text-green-600">Stay frozen to score! Build combos for bonus points!</div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl text-lg font-bold shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Start Dancing! 🎵'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-red-600 text-center max-w-md">
              {error}
            </div>
          )}
        </div>
      ) : (
        // ===== GAME AREA =====
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/50 border-b border-purple-200">
            <div>
              <h2 className="text-lg font-bold text-advay-slate">
                {getLevelDisplayName(gameState?.level || 1)}
              </h2>
              <p className="text-advay-slate text-xs">
                Score: <span className="text-purple-600 font-bold">{gameState?.score || 0}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-advay-slate text-sm">
                Round: <span className="text-purple-600 font-bold">
                  {gameState?.roundsCompleted || 0}/{gameState?.totalRounds || 0}
                </span>
              </div>
              {gameState?.combo && gameState.combo > 1 && (
                <div className="text-orange-500 font-bold">
                  🔥 {gameState.combo}x Combo!
                </div>
              )}
            </div>
          </div>

          {/* Game Canvas */}
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />

            {/* Game Over Overlay */}
            {gameState && !gameState.gameActive && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-advay-slate mb-2">Great Dancing!</h3>
                  <p className="text-advay-slate mb-2">
                    Final Score: <span className="text-purple-600 font-bold">{gameState.score}</span>
                  </p>
                  <p className="text-advay-slate mb-4">
                    Rounds Completed: <span className="text-purple-600 font-bold">
                      {gameState.roundsCompleted}/{gameState.totalRounds}
                    </span>
                  </p>
                  <button
                    onClick={handleShowMenu}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter="🎵"
        accuracy={100}
        onComplete={() => {
          setShowCelebration(false);
          handleGameComplete();
        }}
        message="Great Dancing!"
      />
    </GameContainer>
  );
});

export default MusicalStatues;
