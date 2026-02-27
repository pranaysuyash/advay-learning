/**
 * Balloon Pop Fitness Game
 *
 * Children pop floating balloons using different full-body actions
 * based on balloon colors for a fun physical workout!
 *
 * Educational Focus:
 * - Color recognition (red, blue, yellow)
 * - Gross motor skills (jumping, waving, clapping)
 * - Body awareness and coordination
 * - Following instructions
 *
 * Controls:
 * - 🔴 Red balloons: Jump and touch
 * - 🔵 Blue balloons: Wave your hand
 * - 🟡 Yellow balloons: Clap your hands
 * - Camera tracks full body movements
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  type GameState,
  type PopAction,
  generateBalloon,
  updateBalloons,
  shouldSpawnBalloon,
  checkBodyCollisions,
  detectAllActions,
  processPops,
  updateGameTimer,
  shouldAdvanceLevel,
  advanceLevel,
  initializeGame,
  getActionText,
  getBalloonEmoji,
  calculateFinalStats,
  BALLOON_COLORS,
} from '../games/balloonPopFitnessLogic';

export const BalloonPopFitness = memo(function BalloonPopFitness() {
  // ===== HOOKS =====
  const { onGameComplete } = useGameDrops('balloon-pop-fitness');
  const { playPop, playSuccess, playCelebration, playClick } = useAudio();

  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [lastSpawnTime, setLastSpawnTime] = useState(0);

  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // ===== GAME SESSION TRACKING =====
  useGameSessionProgress({
    gameName: 'Balloon Pop Fitness',
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

    // Update game state
    setGameState(prevState => {
      if (!prevState) return prevState;

      // Spawn new balloons
      let updatedBalloons = [...prevState.balloons];
      if (shouldSpawnBalloon(lastSpawnTime, updatedBalloons.length)) {
        const newBalloon = generateBalloon(prevState.level);
        updatedBalloons = [...updatedBalloons, newBalloon];
        setLastSpawnTime(Date.now());
      }

      // Update balloon positions
      updatedBalloons = updateBalloons(updatedBalloons, deltaTime);

      // Detect actions from pose
      let detectedActions: PopAction[] = [];
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0] as any[];
        detectedActions = detectAllActions(landmarks);

        // Update current action display
        const activeAction = detectedActions.find(a => a.detected);
        if (activeAction && activeAction.confidence > 0.6) {
          setCurrentAction(getActionText(activeAction.type));
        } else {
          setCurrentAction(null);
        }
      }

      // Process collisions and pops
      let updatedState = { ...prevState, balloons: updatedBalloons };
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0] as any[];

        // Check each balloon for collision with relevant body points
        updatedBalloons = updatedBalloons.map(balloon => {
          if (balloon.popped) return balloon;

          let popped = false;
          switch (balloon.action) {
            case 'jump':
              // Check ankles/feet for jump
              const leftAnkle = landmarks[27];
              const rightAnkle = landmarks[28];
              popped = checkBodyCollisions(balloon, [leftAnkle, rightAnkle]);
              break;

            case 'wave':
              // Check wrists for wave
              const leftWrist = landmarks[15];
              const rightWrist = landmarks[16];
              popped = checkBodyCollisions(balloon, [leftWrist, rightWrist]);
              break;

            case 'clap':
              // Check either wrist for clap
              const wrists = [landmarks[15], landmarks[16]];
              popped = checkBodyCollisions(balloon, wrists);
              break;
          }

          return { ...balloon, popped: popped || balloon.popped };
        });

        const { updatedState: processedState, poppedBalloons } = processPops(
          { ...updatedState, balloons: updatedBalloons },
          detectedActions
        );

        // Play sounds for popped balloons
        poppedBalloons.forEach(() => {
          playPop();
        });

        if (poppedBalloons.length > 0) {
          playSuccess();
        }

        updatedState = processedState;
      }

      // Update timer
      updatedState = updateGameTimer(updatedState, deltaTime);

      // Check for level advancement
      if (shouldAdvanceLevel(updatedState)) {
        updatedState = advanceLevel(updatedState);
        playCelebration();
      }

      // Check for game completion
      if (!updatedState.gameActive && !showCelebration) {
        setTimeout(() => {
          setShowCelebration(true);
          playCelebration();
          onGameComplete();
        }, 500);
      }

      return updatedState;
    });

    // Render canvas
    renderCanvas();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, cameraReady, showMenu, lastSpawnTime, playPop, playSuccess, playCelebration, onGameComplete]);

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

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(1, '#E0F7FA'); // Light cyan
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw clouds (decorative)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.15, 40, 0, Math.PI * 2);
    ctx.arc(width * 0.25, height * 0.12, 50, 0, Math.PI * 2);
    ctx.arc(width * 0.3, height * 0.15, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.2, 35, 0, Math.PI * 2);
    ctx.arc(width * 0.75, height * 0.18, 45, 0, Math.PI * 2);
    ctx.arc(width * 0.8, height * 0.2, 35, 0, Math.PI * 2);
    ctx.fill();

    // Draw balloons
    gameState.balloons.forEach(balloon => {
      if (balloon.popped) return;

      const x = balloon.x * width;
      const y = balloon.y * height;
      const size = balloon.size * width;

      // Draw balloon string
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.quadraticCurveTo(x + 5, y + size + 20, x, y + size + 40);
      ctx.stroke();

      // Draw balloon body
      ctx.fillStyle = BALLOON_COLORS[balloon.color];
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Add highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x - size * 0.3, y - size * 0.3, size * 0.2, size * 0.3, -0.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw balloon knot
      ctx.fillStyle = BALLOON_COLORS[balloon.color];
      ctx.beginPath();
      ctx.moveTo(x - 5, y + size * 1.1);
      ctx.lineTo(x + 5, y + size * 1.1);
      ctx.lineTo(x, y + size * 1.2);
      ctx.closePath();
      ctx.fill();

      // Draw action indicator
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getBalloonEmoji(balloon.color), x, y);
    });

    // Draw current action indicator
    if (currentAction) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(width / 2 - 150, height - 80, 300, 60);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(currentAction, width / 2, height - 50);
    }
  }, [gameState, currentAction]);

  // ===== GAME FLOW =====
  const startGame = () => {
    playClick();
    setGameState(initializeGame(1));
    setShowMenu(false);
    setLastSpawnTime(Date.now());
    setCurrentAction(null);
  };

  const handleGameComplete = () => {
    if (gameState) {
      const stats = calculateFinalStats(gameState);
      console.log('Game complete:', stats);
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
    <GameContainer title="Balloon Pop Fitness" onHome={handleShowMenu} reportSession={false}>
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
          {/* Animated Balloon Icon */}
          <motion.div
            className="relative mb-6"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-8xl">🎈</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce">💪</div>
          </motion.div>

          <h2 className="text-3xl font-bold text-advay-slate mb-3">
            Balloon Pop Fitness!
          </h2>
          <p className="text-advay-slate mb-6 text-center max-w-md">
            Pop floating balloons using different body movements based on their colors!
          </p>

          {/* Color Instructions */}
          <div className="grid grid-cols-1 gap-3 mb-6 max-w-md w-full">
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3">
              <div className="text-3xl">🔴</div>
              <div>
                <div className="font-bold text-red-700">Jump and Touch!</div>
                <div className="text-sm text-red-600">Jump up to pop red balloons</div>
              </div>
            </div>

            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 flex items-center gap-3">
              <div className="text-3xl">🔵</div>
              <div>
                <div className="font-bold text-blue-700">Wave Your Hand!</div>
                <div className="text-sm text-blue-600">Raise your hand to pop blue balloons</div>
              </div>
            </div>

            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3">
              <div className="text-3xl">🟡</div>
              <div>
                <div className="font-bold text-yellow-700">Clap Your Hands!</div>
                <div className="text-sm text-yellow-600">Clap to pop yellow balloons</div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-lg font-bold shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Start Popping! 🎈'}
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
              <h2 className="text-lg font-bold text-advay-slate">Level {gameState?.level || 1}</h2>
              <p className="text-advay-slate text-xs">
                Score: <span className="text-purple-600 font-bold">{gameState?.score || 0}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {gameState?.combo && gameState.combo > 1 && (
                <div className="text-orange-500 font-bold">
                  🔥 {gameState.combo}x Combo!
                </div>
              )}
              <div className="text-advay-slate text-sm">
                Time: <span className="text-purple-600 font-bold">
                  {Math.ceil((gameState?.timeRemaining || 0) / 1000)}s
                </span>
              </div>
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
                  <div className="text-5xl mb-4">🎈</div>
                  <h3 className="text-2xl font-bold text-advay-slate mb-2">Great Workout!</h3>
                  <p className="text-advay-slate mb-2">
                    Final Score: <span className="text-purple-600 font-bold">{gameState.score}</span>
                  </p>
                  <p className="text-advay-slate mb-4">
                    Level Reached: <span className="text-purple-600 font-bold">{gameState.level}</span>
                  </p>
                  <button
                    onClick={handleShowMenu}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
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
        letter="🎈"
        accuracy={100}
        onComplete={() => {
          setShowCelebration(false);
          handleGameComplete();
        }}
        message="Great Workout!"
      />
    </GameContainer>
  );
});

export default BalloonPopFitness;