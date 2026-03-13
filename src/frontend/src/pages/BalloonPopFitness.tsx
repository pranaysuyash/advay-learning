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

import { useState, useEffect, useRef, useCallback, memo, type RefObject } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useStreakTracking, type ScorePopup } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { GameStartButton } from '../components/game/GameStartButton';
import { GameHUD } from '../components/game/GameHUD';
import {
  type Balloon,
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

// ===== MODULE-LEVEL RENDER HELPERS =====

function drawBalloon(
  ctx: CanvasRenderingContext2D,
  balloon: Balloon,
  width: number,
  height: number,
): void {
  const x = balloon.x * width;
  const y = balloon.y * height;
  const size = balloon.size * width;

  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.quadraticCurveTo(x + 5, y + size + 20, x, y + size + 40);
  ctx.stroke();

  ctx.fillStyle = BALLOON_COLORS[balloon.color];
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(x - size * 0.3, y - size * 0.3, size * 0.2, size * 0.3, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = BALLOON_COLORS[balloon.color];
  ctx.beginPath();
  ctx.moveTo(x - 5, y + size * 1.1);
  ctx.lineTo(x + 5, y + size * 1.1);
  ctx.lineTo(x, y + size * 1.2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getBalloonEmoji(balloon.color), x, y);
}

function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  currentAction: string | null,
): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F7FA');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

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

  gameState.balloons.forEach((balloon) => {
    if (!balloon.popped) drawBalloon(ctx, balloon, width, height);
  });

  if (currentAction) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width / 2 - 150, height - 80, 300, 60);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentAction, width / 2, height - 50);
  }
}

function resolveBalloonPopped(balloon: Balloon, landmarks: any[]): boolean {
  switch (balloon.action) {
    case 'jump':
      return checkBodyCollisions(balloon, [landmarks[27], landmarks[28]]);
    case 'wave':
      return checkBodyCollisions(balloon, [landmarks[15], landmarks[16]]);
    case 'clap':
      return checkBodyCollisions(balloon, [landmarks[15], landmarks[16]]);
    default:
      return false;
  }
}

interface GameFrameResult {
  nextState: GameState;
  poppedBalloons: Balloon[];
  detectedActionText: string | null;
  levelAdvanced: boolean;
  gameEnded: boolean;
  newSpawnTime: number | null;
}

function computeGameFrameUpdate(
  prevState: GameState,
  landmarks: any[] | null,
  deltaTime: number,
  lastSpawnTime: number,
): GameFrameResult {
  let updatedBalloons = [...prevState.balloons];
  let newSpawnTime: number | null = null;

  if (shouldSpawnBalloon(lastSpawnTime, updatedBalloons.length)) {
    updatedBalloons = [...updatedBalloons, generateBalloon(prevState.level)];
    newSpawnTime = Date.now();
  }

  updatedBalloons = updateBalloons(updatedBalloons, deltaTime);

  let detectedActions: PopAction[] = [];
  let detectedActionText: string | null = null;

  if (landmarks) {
    detectedActions = detectAllActions(landmarks);
    const activeAction = detectedActions.find((a) => a.detected);
    if (activeAction && activeAction.confidence > 0.6) {
      detectedActionText = getActionText(activeAction.type);
    }
    updatedBalloons = updatedBalloons.map((balloon) => {
      if (balloon.popped) return balloon;
      const popped = resolveBalloonPopped(balloon, landmarks);
      return { ...balloon, popped: popped || balloon.popped };
    });
  }

  const { updatedState: stateAfterPops, poppedBalloons } = processPops(
    { ...prevState, balloons: updatedBalloons },
    detectedActions,
  );

  let nextState = updateGameTimer(stateAfterPops, deltaTime);

  const levelAdvanced = shouldAdvanceLevel(nextState);
  if (levelAdvanced) {
    nextState = advanceLevel(nextState);
  }

  return {
    nextState,
    poppedBalloons,
    detectedActionText,
    levelAdvanced,
    gameEnded: !nextState.gameActive,
    newSpawnTime,
  };
}

// ===== MENU SUB-COMPONENT =====

interface BalloonMenuScreenProps {
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
}

const BalloonMenuScreen = memo(function BalloonMenuScreen({
  isLoading,
  error,
  onStart,
}: BalloonMenuScreenProps) {
  return (
    <div className='flex flex-col items-center justify-center h-full p-6'>
      <motion.div
        className='relative mb-6'
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className='text-8xl'>🎈</div>
        <div className='absolute -top-2 -right-2 text-4xl animate-bounce'>💪</div>
      </motion.div>

      <h2 className='text-3xl font-bold text-advay-slate mb-3'>Balloon Pop Fitness!</h2>
      <p className='text-advay-slate mb-6 text-center max-w-md'>
        Pop floating balloons using different body movements based on their colors!
      </p>

      <div className='grid grid-cols-1 gap-3 mb-6 max-w-md w-full'>
        <div className='bg-red-100 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3'>
          <div className='text-3xl'>🔴</div>
          <div>
            <div className='font-bold text-red-700'>Jump and Touch!</div>
            <div className='text-sm text-red-600'>Jump up to pop red balloons</div>
          </div>
        </div>
        <div className='bg-blue-100 border-2 border-blue-300 rounded-lg p-4 flex items-center gap-3'>
          <div className='text-3xl'>🔵</div>
          <div>
            <div className='font-bold text-blue-700'>Wave Your Hand!</div>
            <div className='text-sm text-blue-600'>Raise your hand to pop blue balloons</div>
          </div>
        </div>
        <div className='bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3'>
          <div className='text-3xl'>🟡</div>
          <div>
            <div className='font-bold text-yellow-700'>Clap Your Hands!</div>
            <div className='text-sm text-yellow-600'>Clap to pop yellow balloons</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <GameStartButton
          onClick={onStart}
          disabled={isLoading}
          text={isLoading ? 'Loading…' : 'Start Workout!'}
        />
      </div>

      {error && (
        <div className='mt-4 text-red-600 text-center max-w-md'>{error}</div>
      )}
    </div>
  );
});

// ===== GAME AREA SUB-COMPONENT =====

interface BalloonGameAreaProps {
  gameState: GameState | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  streak: number;
  scorePopup: ScorePopup | null;
  showMilestone: boolean;
  onShowMenu: () => void;
}

const BalloonGameArea = memo(function BalloonGameArea({
  gameState,
  canvasRef,
  streak,
  scorePopup,
  showMilestone,
  onShowMenu,
}: BalloonGameAreaProps) {
  const comboActive = gameState?.combo != null && gameState.combo > 1;
  const timeMs = gameState?.timeRemaining ?? 0;
  const timerClass =
    timeMs < 10000
      ? 'bg-red-100 border-red-300 text-red-700 animate-pulse'
      : 'bg-white/90 border-slate-200 text-slate-600';

  return (
    <div className='flex flex-col h-full'>
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-2">
        <GameHUD
          score={gameState?.score}
          streak={streak}
          level={gameState?.level}
          rightHeaderContent={
            <div className="flex gap-4 items-center">
              {comboActive && (
                <div className='bg-orange-100 text-orange-600 px-3 py-1 rounded-xl font-black border-2 border-orange-200 shadow-sm animate-pulse text-xs uppercase'>
                  ⚡ {gameState!.combo}x Combo
                </div>
              )}
              <div className={`px-4 py-1.5 rounded-xl font-black border-2 shadow-sm text-sm ${timerClass}`}>
                ⏳ {Math.ceil(timeMs / 1000)}s
              </div>
            </div>
          }
        />
      </div>

      <div className='flex-1 relative'>
        <canvas ref={canvasRef} className='w-full h-full' />

        {scorePopup && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 1.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className='absolute pointer-events-none'
            style={{
              left: `${scorePopup.x}%`,
              top: `${scorePopup.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className='text-2xl font-bold text-green-500 drop-shadow-lg'>
              +{scorePopup.points}
            </div>
          </motion.div>
        )}

        {showMilestone && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className='absolute inset-0 flex items-center justify-center pointer-events-none'
          >
            <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg'>
              🔥 {streak} Streak! 🔥
            </div>
          </motion.div>
        )}

        {gameState && !gameState.gameActive && (
          <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
            <div className='bg-white rounded-2xl p-8 text-center max-w-md'>
              <div className='text-5xl mb-4'>🎈</div>
              <h3 className='text-2xl font-bold text-advay-slate mb-2'>
                Great Workout!
              </h3>
              <p className='text-advay-slate mb-2'>
                Final Score:{' '}
                <span className='text-purple-600 font-bold'>{gameState.score}</span>
              </p>
              <p className='text-advay-slate mb-4'>
                Level Reached:{' '}
                <span className='text-purple-600 font-bold'>{gameState.level}</span>
              </p>
              <button
                onClick={onShowMenu}
                className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all transform hover:scale-105'
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const BalloonPopFitnessGame = memo(function BalloonPopFitnessGame() {
  // ===== HOOKS =====
  const { completeGame } = useGameCompletion('balloon-pop-fitness');
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

  // ===== STREAK TRACKING =====
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

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
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );

        let landmarker: PoseLandmarker;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        } catch (e) {
          console.warn(
            'GPU delegate failed for PoseLandmarker, falling back to CPU:',
            e,
          );
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
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
        setError(
          'Could not load pose detection. Try refreshing or check your internet connection.',
        );
        setIsLoading(false);
      }
    }

    initPose();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
        poseLandmarkerRef.current = null;
      }
    };
  }, []);

  // Keep canvas backing resolution in sync with displayed size.
  useEffect(() => {
    function syncCanvasSize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(rect.width));
      const nextHeight = Math.max(1, Math.floor(rect.height));
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    }

    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, []);

  // ===== GAME LOOP =====
  function doGameLoop() {
    if (
      !webcamRef.current ||
      !poseLandmarkerRef.current ||
      !cameraReady ||
      !gameState?.gameActive ||
      showMenu
    ) {
      animationRef.current = requestAnimationFrame(doGameLoop);
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(doGameLoop);
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    const results = poseLandmarkerRef.current.detectForVideo(video, currentTime);
    const landmarks =
      results.landmarks && results.landmarks.length > 0
        ? (results.landmarks[0] as any[])
        : null;

    setGameState((prevState) => {
      if (!prevState) return prevState;

      const {
        nextState,
        poppedBalloons,
        detectedActionText,
        levelAdvanced,
        gameEnded,
        newSpawnTime,
      } = computeGameFrameUpdate(prevState, landmarks, deltaTime, lastSpawnTime);

      if (newSpawnTime !== null) setLastSpawnTime(newSpawnTime);
      setCurrentAction(detectedActionText);

      poppedBalloons.forEach((balloon) => {
        playPop();
        const newStreak = incrementStreak();
        const streakBonus = Math.min(newStreak * 2, 15);
        setScorePopup({ points: 15 + streakBonus, x: balloon.x * 100, y: balloon.y * 100 });
        triggerHaptic('success');
      });

      if (poppedBalloons.length > 0) playSuccess();
      if (levelAdvanced) playCelebration();

      if (gameEnded && !showCelebration) {
        setTimeout(async () => {
          setShowCelebration(true);
          playCelebration();
          await completeGame({ score: gameState?.score || 0, level: gameState?.level || 1 });
        }, 500);
      }

      return nextState;
    });

    renderCanvasFrame();

    animationRef.current = requestAnimationFrame(doGameLoop);
  }

  const gameLoop = useCallback(doGameLoop, [
    cameraReady,
    gameState?.gameActive,
    incrementStreak,
    lastSpawnTime,
    completeGame,
    playCelebration,
    playPop,
    playSuccess,
    showMenu,
    showCelebration,
  ]);

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
  function renderCanvasFrame() {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderGameFrame(ctx, gameState, currentAction);
  }

  // ===== GAME FLOW =====
  const startGame = () => {
    playClick();
    setGameState(initializeGame(1));
    setShowMenu(false);
    setLastSpawnTime(Date.now());
    setCurrentAction(null);
    resetStreak();
  };

  const handleGameComplete = () => {
    if (gameState) calculateFinalStats(gameState);
    setShowMenu(true);
    setGameState(null);
  };

  const handleShowMenu = async () => {
    playClick();
    // Reward completion only when the game actually finished.
    if (gameState && !gameState.gameActive) {
      await completeGame({ score: gameState.score, level: gameState.level });
    }
    setShowMenu(true);
    setGameState(null);
    resetStreak();
  };

  // ===== CAMERA READY HANDLER =====
  const handleCameraReady = () => {
    setCameraReady(true);
  };

  // ===== RENDER =====
  return (
    <GameContainer
      webcamRef={webcamRef}
      title='Balloon Pop Fitness'
      onHome={handleShowMenu}
      reportSession={false}
    >
      {/* Hidden webcam for pose detection */}
      <div className='absolute top-0 right-0 w-40 h-32 opacity-0 pointer-events-none overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          onUserMedia={handleCameraReady}
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className='w-full h-full object-cover'
        />
      </div>

      {showMenu ? (
        <BalloonMenuScreen isLoading={isLoading} error={error} onStart={startGame} />
      ) : (
        <BalloonGameArea
          gameState={gameState}
          canvasRef={canvasRef}
          streak={streak}
          scorePopup={scorePopup}
          showMilestone={showMilestone}
          onShowMenu={handleShowMenu}
        />
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter='🎈'
        accuracy={100}
        onComplete={() => {
          setShowCelebration(false);
          handleGameComplete();
        }}
        message='Great Workout!'
      />
    </GameContainer>
  );
});

export const BalloonPopFitness = memo(function BalloonPopFitnessComponent() {
  return (
    <GameShell
      gameId='balloon-pop-fitness'
      gameName='Balloon Pop Fitness'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BalloonPopFitnessGame />
    </GameShell>
  );
});

export default BalloonPopFitness;
