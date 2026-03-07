/**
 * Follow the Leader Game
 *
 * Children mirror movement patterns demonstrated by a guide character.
 * Builds imitation skills, motor planning, and body awareness.
 *
 * Educational Focus:
 * - Motor planning and coordination
 * - Imitation and following instructions
 * - Body awareness and spatial reasoning
 * - Animal movement vocabulary
 *
 * Controls:
 * - Camera tracks full body movements
 * - Child mirrors the movements shown by the guide character
 * - Hold each pose for the required duration to progress
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import {
  type GameState,
  MOVEMENT_PATTERNS,
  initializeGame,
  checkPoseMatch,
  updateGameState,
  isLevelComplete,
  advanceLevel,
  calculateFinalStats,
} from '../games/followTheLeaderLogic';

const FollowTheLeaderGame = memo(function FollowTheLeaderGame() {
  // ===== HOOKS =====
  const { onGameComplete } = useGameDrops('follow-the-leader');
  const { playSuccess: _playSuccess, playCelebration, playClick, playPop } = useAudio();

  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  // Streak tracking
  const { streak, showMilestone, incrementStreak, resetStreak } = useStreakTracking();

  const lastCompletedRef = useRef(0);
  const wasMatchingRef = useRef(false);

  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // ===== GAME SESSION TRACKING =====
  useGameSessionProgress({
    gameName: 'Follow the Leader',
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

    // Update game state based on pose matching
    if (results.landmarks && results.landmarks.length > 0 && gameState.currentPattern) {
      const landmarks = results.landmarks[0] as any[];
      const poseMatch = checkPoseMatch(landmarks, gameState.currentPattern);

      setGameState(prevState => {
        if (!prevState) return prevState;
        return updateGameState(prevState, poseMatch, deltaTime);
      });

      // Play success sound and haptic when matching starts
      if (poseMatch.matches && !wasMatchingRef.current) {
        playPop();
        triggerHaptic('success');
      }

      // Reset streak when pose breaks
      if (!poseMatch.matches && wasMatchingRef.current && gameState.holdTime > 0) {
        resetStreak();
        triggerHaptic('error');
      }
      
      wasMatchingRef.current = poseMatch.matches;
    }

    // Check for movement completion (streak increase)
    if (gameState.completedMovements > lastCompletedRef.current) {
      lastCompletedRef.current = gameState.completedMovements;
      incrementStreak();

      // Celebration haptic at streak milestones is handled by the hook
      if (streak > 0 && streak % 5 === 0) {
        triggerHaptic('celebration');
      }
    }

    // Check for level completion
    if (isLevelComplete(gameState)) {
      playCelebration();
      triggerHaptic('celebration');
      setGameState(advanceLevel(gameState));
      setShowGuide(true);
      setTimeout(() => setShowGuide(false), 3000);
    }

    // Render canvas
    renderCanvas();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, cameraReady, showMenu, playPop, playCelebration]);

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
    if (!canvas || !gameState?.currentPattern) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#FFE5B4'); // Warm orange
    gradient.addColorStop(1, '#FFDAB9'); // Peach
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw progress bar
    const progressBarWidth = width * 0.8;
    const progressBarHeight = 20;
    const progressX = (width - progressBarWidth) / 2;
    const progressY = height * 0.1;

    // Background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressBarWidth, progressBarHeight, 10);
    ctx.fill();

    // Progress fill
    ctx.fillStyle = gameState.progress > 0.8 ? '#10B981' : gameState.progress > 0.5 ? '#F59E0B' : '#EF4444';
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressBarWidth * gameState.progress, progressBarHeight, 10);
    ctx.fill();

    // Draw guide character (simple representation)
    const guideX = width * 0.3;
    const guideY = height * 0.4;
    const guideSize = Math.min(width, height) * 0.15;

    ctx.save();
    ctx.translate(guideX, guideY);

    // Draw guide emoji
    ctx.font = `${guideSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gameState.currentPattern.emoji, 0, 0);

    // Draw movement instruction
    ctx.font = `bold ${guideSize * 0.3}px Arial`;
    ctx.fillStyle = '#1F2937';
    ctx.fillText(gameState.currentPattern.name, 0, guideSize * 0.8);

    ctx.restore();

    // Draw feedback text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = gameState.progress > 0.5 ? '#10B981' : '#EF4444';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.feedback, width / 2, height * 0.8);
  }, [gameState]);

  // ===== GAME FLOW =====
  const startGame = () => {
    playClick();
    setGameState(initializeGame(1));
    setShowMenu(false);
    setShowGuide(true);
    setTimeout(() => setShowGuide(false), 5000);
  };

  const handleGameComplete = () => {
    if (gameState) calculateFinalStats(gameState);
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
    <GameContainer webcamRef={webcamRef} title="Follow the Leader" onHome={handleShowMenu} reportSession={false}>
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
          {/* Animated Leader Icon */}
          <motion.div
            className="relative mb-6"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-8xl">🎭</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce">👯</div>
          </motion.div>

          <h2 className="text-3xl font-bold text-advay-slate mb-3">
            Follow the Leader!
          </h2>
          <p className="text-advay-slate mb-6 text-center max-w-md">
            Mirror the movements shown by the guide character. Copy their poses and hold each position!
          </p>

          {/* Movement Examples */}
          <div className="grid grid-cols-2 gap-4 mb-6 max-w-2xl w-full">
            {MOVEMENT_PATTERNS.slice(0, 4).map((pattern) => (
              <div
                key={pattern.id}
                className="bg-white rounded-2xl p-4 border-2 border-orange-200 shadow-lg flex items-center gap-3"
              >
                <div className="text-4xl">{pattern.emoji}</div>
                <div>
                  <div className="font-bold text-slate-800">{pattern.name}</div>
                  <div className="text-xs text-slate-600">{pattern.instruction.slice(0, 30)}...</div>
                </div>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <button
            onClick={startGame}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-lg font-bold shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Start Following! 🎭'}
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
          <div className="flex items-center justify-between px-4 py-2 bg-white/50 border-b border-orange-200">
            <div>
              <h2 className="text-lg font-bold text-advay-slate">Level {gameState?.level || 1}</h2>
              <p className="text-advay-slate text-xs">
                Score: <span className="text-orange-600 font-bold">{gameState?.score || 0}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <div className="bg-orange-100 px-3 py-1 rounded-full text-sm">
                  <span className="text-orange-600 font-bold">🔥 {streak}</span>
                </div>
              )}
              <div className="text-advay-slate text-sm">
                Movements: <span className="text-orange-600 font-bold">
                  {gameState?.completedMovements || 0}/4
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

            {/* Guide Overlay */}
            {showGuide && gameState?.currentPattern && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">{gameState.currentPattern.emoji}</div>
                  <h3 className="text-2xl font-bold text-advay-slate mb-2">
                    {gameState.currentPattern.name}
                  </h3>
                  <p className="text-advay-slate mb-4">
                    {gameState.currentPattern.instruction}
                  </p>
                  <div className="text-orange-500 font-bold">Get ready...</div>
                </div>
              </div>
            )}

            {/* Game Complete Overlay */}
            {gameState && !gameState.gameActive && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-advay-slate mb-2">Great Job!</h3>
                  <p className="text-advay-slate mb-2">
                    Final Score: <span className="text-orange-600 font-bold">{gameState.score}</span>
                  </p>
                  <p className="text-advay-slate mb-4">
                    Level Reached: <span className="text-orange-600 font-bold">{gameState.level}</span>
                  </p>
                  <button
                    onClick={handleShowMenu}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-bold transition-all transform hover:scale-105"
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
        letter="🎭"
        accuracy={100}
        onComplete={() => {
          setShowCelebration(false);
          handleGameComplete();
        }}
        message="Great Following!"
      />

      {/* Streak Milestone */}
      {showMilestone && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'
        >
          <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-3xl font-black text-3xl shadow-2xl'>
            🔥 {streak} Streak! 🔥
          </div>
        </motion.div>
      )}
    </GameContainer>
  );
});

export const FollowTheLeader = memo(function FollowTheLeaderComponent() {
  return (
    <GameShell
      gameId='follow-the-leader'
      gameName='Follow the Leader'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FollowTheLeaderGame />
    </GameShell>
  );
});

export default FollowTheLeader;
