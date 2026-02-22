import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { UIIcon } from '../components/ui/Icon';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { Mascot } from '../components/Mascot';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { OptionChips } from '../components/game/OptionChips';
import { GameCursor } from '../components/game/GameCursor';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  assetLoader,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';

interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}

const GAME_COLORS = {
  path: '#CBD5E1', // slate-300
  dotConnected: '#10B981', // emerald-500
  dotPending: '#3B82F6', // blue-500
  dotStroke: '#000000',
  dotLabel: '#FFFFFF',
  cursorIdle: '#F59E0B', // amber-500 
  cursorPinch: '#E85D04', // pip-orange
} as const;

export const ConnectTheDots = memo(function ConnectTheDotsComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastUIUpdateAtRef = useRef(0);
  const permissionHandlerRef = useRef<
    ((this: PermissionStatus, ev: Event) => any) | null
  >(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [dots, setDots] = useState<Dot[]>([]);
  const [currentDotIndex, setCurrentDotIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds per level
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'easy',
  );
  const [showCelebration, setShowCelebration] = useState(false);

  // Live refs for game state used by the tracking loop to avoid stale closures
  const dotsRef = useRef<Dot[]>([]);
  const currentDotIndexRef = useRef<number>(0);
  const difficultyRef = useRef<'easy' | 'medium' | 'hard'>('easy');
  const gameStartedRef = useRef<boolean>(false);
  const gameCompletedRef = useRef<boolean>(false);

  // Sound effects
  const { playCelebration, playPop } = useSoundEffects();

  const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(true);
  const [isPinching, setIsPinching] = useState(false);
  const [handCursor, setHandCursor] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Camera permission state
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'prompt'
  >('prompt');
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);

  // Check camera permission on mount
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (
          !navigator.permissions ||
          typeof navigator.permissions.query !== 'function'
        ) {
          console.warn(
            '[ConnectTheDots] navigator.permissions.query not available',
          );
        } else {
          const result = await navigator.permissions.query({
            name: 'camera' as PermissionName,
          });
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');

          if (result.state === 'denied') {
            setShowPermissionWarning(true);
          }

          // Store PermissionStatus first and create a handler that reads the current state
          permissionStatusRef.current = result;
          permissionHandlerRef.current = () => {
            const state = permissionStatusRef.current?.state as
              | 'granted'
              | 'denied'
              | 'prompt';
            setCameraPermission(state);
            setShowPermissionWarning(state === 'denied');
          };

          result.addEventListener('change', permissionHandlerRef.current);
        }
      } catch (error) {
        console.warn(
          '[ConnectTheDots] Camera permission check not supported',
          error,
        );
      }
    };

    checkCameraPermission();

    // Cleanup function
    return () => {
      if (permissionHandlerRef.current) {
        try {
          if (permissionStatusRef.current) {
            permissionStatusRef.current.removeEventListener(
              'change',
              permissionHandlerRef.current,
            );
          }
        } catch (error) {
          // Ignore cleanup errors
        }
        permissionHandlerRef.current = null;
        permissionStatusRef.current = null;
      }
    };
  }, []);

  // Asset preloading for premium polish
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await Promise.all([
          assetLoader.loadImages(Object.values(WEATHER_BACKGROUNDS)),
          assetLoader.loadSounds(Object.values(SOUND_ASSETS)),
        ]);
      } catch (error) {
        console.error('Asset preload failed (non-blocking):', error);
      }
    };

    void preloadAssets();
  }, []);

  // Cleanup level timeout on unmount (lifecycle hardening)
  useEffect(() => {
    return () => {
      if (levelTimeoutRef.current) {
        clearTimeout(levelTimeoutRef.current);
      }
    };
  }, []);

  const handleTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = performance.now();
      const tip = frame.indexTip;

      if (!tip) {
        if (now - lastUIUpdateAtRef.current >= 1000 / 10) {
          setHandCursor(null);
          setIsPinching(false);
          lastUIUpdateAtRef.current = now;
        }
        return;
      }

      const canvasX = tip.x * canvas.width;
      const canvasY = tip.y * canvas.height;
      const needsUIUpdate = now - lastUIUpdateAtRef.current >= 1000 / 10;
      if (needsUIUpdate) {
        setHandCursor({ x: canvasX, y: canvasY });
        setIsPinching(frame.pinch.state.isPinching);
        lastUIUpdateAtRef.current = now;
      }

      if (frame.pinch.transition === 'start') {
        checkDotProximityRef(canvasX, canvasY);
      }
    },
    [],
  );

  useGameHandTracking({
    gameName: 'ConnectTheDots',
    isRunning: gameStarted && isHandTrackingEnabled && !gameCompleted,
    webcamRef,
    targetFps: 15,
    onFrame: handleTrackingFrame,
    onNoVideoFrame: () => {
      const now = performance.now();
      if (now - lastUIUpdateAtRef.current >= 1000 / 10) {
        setHandCursor(null);
        setIsPinching(false);
        lastUIUpdateAtRef.current = now;
      }
    },
    onError: (error) => {
      console.error('[ConnectTheDots] Hand tracking error:', error);
    },
  });

  useEffect(() => {
    if (!isHandTrackingEnabled) {
      setHandCursor(null);
      setIsPinching(false);
    }
  }, [isHandTrackingEnabled]);

  // Proximity check moved to `checkDotProximityRef` (reads live refs) to avoid stale closures in the tracking loop.

  // Ref-based proximity checker used by the hand tracking loop (reads live refs)
  const checkDotProximityRef = (x: number, y: number) => {
    if (
      !gameStartedRef.current ||
      gameCompletedRef.current ||
      currentDotIndexRef.current >= dotsRef.current.length
    )
      return;

    const currentDot = dotsRef.current[currentDotIndexRef.current];

    const difficultyRadiusMap: Record<string, number> = {
      easy: 35,
      medium: 30,
      hard: 25,
    };

    const radius = difficultyRadiusMap[difficultyRef.current] ?? 30;
    const distance = Math.hypot(x - currentDot.x, y - currentDot.y);

    if (distance <= radius) {
      handleDotClick(currentDotIndexRef.current);
    }
  };

  // Keep refs up to date with React state to avoid stale closures in the loop
  useEffect(() => {
    dotsRef.current = dots;
  }, [dots]);
  useEffect(() => {
    currentDotIndexRef.current = currentDotIndex;
  }, [currentDotIndex]);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);
  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);
  useEffect(() => {
    gameCompletedRef.current = gameCompleted;
  }, [gameCompleted]);

  // Initialize dots for the current level with difficulty scaling and overlap prevention
  useEffect(() => {
    if (!gameStarted) return;

    // Difficulty scaling
    const difficultyConfig = {
      easy: { minDots: 5, maxDots: 8, timeLimit: 90, radius: 35 },
      medium: { minDots: 7, maxDots: 12, timeLimit: 75, radius: 30 },
      hard: { minDots: 10, maxDots: 15, timeLimit: 60, radius: 25 },
    };

    const config = difficultyConfig[difficulty];
    const baseDots = config.minDots + Math.floor((level - 1) * 1.5);
    const numDots = Math.min(baseDots, config.maxDots);
    const newDots: Dot[] = [];
    const minDistance = 80; // Minimum distance between dots

    // Generate dots with rejection sampling to prevent overlap
    for (let i = 0; i < numDots; i++) {
      let attempts = 0;
      let x: number, y: number;

      do {
        x = 100 + Math.random() * 600; // Canvas width is 800
        y = 100 + Math.random() * 400; // Canvas height is 600
        attempts++;
      } while (
        attempts < 50 && // Max attempts to prevent infinite loop
        newDots.some(
          (dot) =>
            Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2)) <
            minDistance,
        )
      );

      newDots.push({
        id: i,
        x,
        y,
        connected: false,
        number: i + 1,
      });
    }

    setDots(newDots);
    setCurrentDotIndex(0);
    setTimeLeft(config.timeLimit);
  }, [level, gameStarted, difficulty]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameCompleted) return;

    // Start a single interval for the duration of the game; use functional
    // updates to avoid depending on `timeLeft` and to minimize churn.
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);

  // Check if level is completed with proper timeout cleanup
  useEffect(() => {
    if (dots.length > 0 && dots.every((dot) => dot.connected)) {
      // Clear any existing timeout
      if (levelTimeoutRef.current) {
        clearTimeout(levelTimeoutRef.current);
      }

      // Level completed - play celebration!
      playCelebration();
      setShowCelebration(true);
      setScore((prev) => prev + timeLeft * 10); // Bonus points for remaining time

      levelTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
        if (level >= 5) {
          setGameCompleted(true);
        } else {
          setLevel((prev) => prev + 1);
          // Time limit is now set in the dots initialization effect based on difficulty
        }
        levelTimeoutRef.current = null;
      }, 2500); // Match CelebrationOverlay timing
    }
  }, [dots, timeLeft, level, playCelebration]);

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    // timeLeft will be set by the dots initialization effect based on difficulty
  };

  const handleDotClick = (dotId: number) => {
    // Use ref-based guards so both mouse and tracking paths behave consistently
    if (!gameStartedRef.current || gameCompletedRef.current) return;

    // Validate against the live ref index - avoids stale closure mismatches
    if (dotId !== currentDotIndexRef.current) return;

    try {
      playPop(); // Play pop - guard in case audio unavailable
    } catch (err) {
      /* ignore audio errors in test/env */
    }

    // Update dots using functional update to avoid captured-state races
    setDots((prevDots) => {
      if (dotId < 0 || dotId >= prevDots.length) return prevDots;
      const next = [...prevDots];
      next[dotId] = { ...next[dotId], connected: true };
      // Keep dotsRef in sync immediately so the tracking loop sees the change
      dotsRef.current = next;
      return next;
    });

    // Advance currentDotIndex using functional update and keep ref synced
    setCurrentDotIndex((prev) => {
      const next = prev < dotsRef.current.length - 1 ? prev + 1 : prev;
      currentDotIndexRef.current = next;
      return next;
    });
  };

  const resetGame = () => {
    // Clear any pending timeouts
    if (levelTimeoutRef.current) {
      clearTimeout(levelTimeoutRef.current);
      levelTimeoutRef.current = null;
    }

    setGameStarted(false);
    setGameCompleted(false);
    setDots([]);
    setCurrentDotIndex(0);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
  };

  const goToHome = () => {
    assetLoader.playSound('pop', 0.3); // Audio feedback on navigation
    navigate('/dashboard');
  };

  // Define game controls for the active game
  const gameControls: GameControl[] = [
    {
      id: 'mode',
      icon: isHandTrackingEnabled ? 'hand' : 'pencil',
      label: isHandTrackingEnabled ? 'Hand Mode' : 'Mouse Mode',
      onClick: () => setIsHandTrackingEnabled(!isHandTrackingEnabled),
      variant: 'primary',
      isActive: isHandTrackingEnabled,
    },
    {
      id: 'reset',
      icon: 'rotate-ccw',
      label: 'Reset',
      onClick: resetGame,
      variant: 'danger',
    },
  ];

  // Menu screen controls
  const menuControls: GameControl[] = [
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goToHome,
      variant: 'primary',
    },
    {
      id: 'start',
      icon: 'play',
      label: 'Start Game',
      onClick: startGame,
      variant: 'success',
    },
  ];

  // Completion screen controls
  const completionControls: GameControl[] = [
    {
      id: 'play-again',
      icon: 'rotate-ccw',
      label: 'Play Again',
      onClick: resetGame,
      variant: 'primary',
    },
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goToHome,
      variant: 'secondary',
    },
  ];

  const normalizedCursor = handCursor
    ? {
        x: handCursor.x / 800,
        y: handCursor.y / 600,
      }
    : null;

  return (
    <>
      {/* Full Screen Game Mode */}
      {gameStarted && !gameCompleted ? (
        <GameContainer
          title='Connect the Dots'
          score={score}
          level={level}
          onHome={goToHome}
        >
          <div
            ref={gameAreaRef}
            className='relative w-full h-full bg-white/50'
            role='main'
            aria-label='Connect the Dots drawing game with numbered dots'
          >
            {/* Background layer for visual variety */}
            <div
              className='absolute inset-0 bg-cover bg-center opacity-10'
              style={{
                backgroundImage: `url(${WEATHER_BACKGROUNDS.windy.url})`,
              }}
              aria-hidden='true'
            />

            {/* Timer Display - Top Center */}
            <div className='absolute top-4 left-1/2 -translate-x-1/2 z-40'>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-[1.25rem] border-4 shadow-sm backdrop-blur-md ${timeLeft <= 10
                    ? 'bg-red-500 border-[#000000] text-white animate-pulse'
                    : timeLeft <= 30
                      ? 'bg-[#F59E0B] border-[#000000] text-white'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
              >
                <UIIcon
                  name='timer'
                  size={18}
                  className={
                    timeLeft <= 30
                      ? 'text-white'
                      : 'text-slate-400'
                  }
                />
                <span
                  className={`font-black tabular-nums text-lg ${timeLeft <= 30
                      ? 'text-white'
                      : 'text-slate-700'
                    }`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Next Dot Indicator */}
            <div className='absolute top-4 left-4 z-40'>
              <div className='bg-white px-5 py-3 rounded-[1.25rem] border-4 border-slate-200 text-slate-800 shadow-sm'>
                <span className='text-sm font-bold uppercase tracking-widest text-slate-500'>Next Dot</span>
                <span className='ml-3 font-black text-xl text-[#3B82F6]'>
                  #{currentDotIndex + 1}
                </span>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className='w-full h-full'
              onClick={(e) => {
                if (!canvasRef.current) return;

                const rect = canvasRef.current.getBoundingClientRect();
                const scaleX = canvasRef.current.width / rect.width;
                const scaleY = canvasRef.current.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;

                // Difficulty-based radius for mouse clicks too
                const difficultyConfig = {
                  easy: 35,
                  medium: 30,
                  hard: 25,
                };
                const radius = difficultyConfig[difficulty];

                for (let i = 0; i < dots.length; i++) {
                  const dot = dots[i];
                  const distance = Math.sqrt(
                    Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2),
                  );

                  if (distance <= radius) {
                    handleDotClick(i);
                    break;
                  }
                }
              }}
            />

            {/* Webcam for hand tracking (hidden) */}
            {isHandTrackingEnabled && (
              <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-0'>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored={true}
                  videoConstraints={{
                    facingMode: 'user',
                    width: 640,
                    height: 480,
                  }}
                  className='w-full h-full object-cover'
                />
              </div>
            )}

            {/* Draw dots and lines */}
            {dots.length > 0 && (
              <svg
                className='absolute top-0 left-0 w-full h-full pointer-events-none'
                viewBox='0 0 800 600'
                preserveAspectRatio='xMidYMid meet'
              >
                {/* Draw connecting lines */}
                {dots.slice(0, -1).map((dot, index) => {
                  if (dot.connected && dots[index + 1].connected) {
                    return (
                      <line
                        key={`line-${index}`}
                        x1={dot.x}
                        y1={dot.y}
                        x2={dots[index + 1].x}
                        y2={dots[index + 1].y}
                        stroke={GAME_COLORS.path}
                        strokeWidth='3'
                      />
                    );
                  }
                  return null;
                })}

                {/* Draw dots */}
                {dots.map((dot) => (
                  <g key={dot.id}>
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={dot.id === currentDotIndex ? 20 : 15}
                      fill={
                        dot.connected
                          ? GAME_COLORS.dotConnected
                          : GAME_COLORS.dotPending
                      }
                      stroke={GAME_COLORS.dotStroke}
                      strokeWidth='2'
                    />
                    <text
                      x={dot.x}
                      y={dot.y}
                      textAnchor='middle'
                      dominantBaseline='middle'
                      fill={GAME_COLORS.dotLabel}
                      fontSize='14'
                      fontWeight='bold'
                    >
                      {dot.number}
                    </text>
                  </g>
                ))}

              </svg>
            )}

            {normalizedCursor && isHandTrackingEnabled && (
              <GameCursor
                position={normalizedCursor}
                coordinateSpace='normalized'
                containerRef={gameAreaRef}
                isPinching={isPinching}
                isHandDetected
                size={62}
                color='#F59E0B'
              />
            )}

            {/* Mascot */}
            <div className='absolute bottom-4 left-4 z-20'>
              <Mascot
                state={currentDotIndex === 0 ? 'idle' : 'happy'}
                message={`Connect to dot #${currentDotIndex + 1}`}
              />
            </div>

            {/* Standardized Game Controls */}
            <GameControls controls={gameControls} position='bottom-right' />
          </div>
        </GameContainer>
      ) : (
        /* Menu / Completion Screen */
        <section className='max-w-5xl mx-auto px-4 py-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <header className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6'>
              <div>
                <h1 className='text-4xl font-black text-slate-800 mb-2 tracking-tight'>Connect The Dots</h1>
                <p className='text-slate-500 font-bold text-lg'>
                  Connect the numbered dots in sequence to reveal the picture!
                </p>
              </div>

              <div className='text-left sm:text-right bg-white p-4 rounded-2xl border-4 border-slate-100 shadow-sm'>
                <output className='block text-3xl font-black text-[#10B981] mb-1'>
                  Score: {score}
                </output>
                {gameStarted && (
                  <div className='flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest'>
                    <span>Level {level}</span>
                    <span>•</span>
                    <span>Time {timeLeft}s</span>
                  </div>
                )}
              </div>
            </header>

            {showPermissionWarning && (
              <div
                role='alert'
                className='mb-8 flex items-start gap-4 bg-red-50 border-4 border-red-100 rounded-[2rem] p-6 shadow-sm'
              >
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <UIIcon
                    name='warning'
                    size={24}
                    className='text-red-500'
                  />
                </div>
                <div className='text-sm text-red-700 font-medium pt-1'>
                  <p className='font-black text-lg mb-1'>
                    Camera permission denied
                  </p>
                  <p>
                    You can still play with mouse/touch. Enable camera
                    permission to use hand tracking controls.
                  </p>
                </div>
              </div>
            )}

            {/* Game Area */}
            <div className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-sm'>
              {!gameStarted ? (
                <div className='flex flex-col items-center justify-center py-8'>
                  <div className='w-32 h-32 mx-auto mb-8 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100'>
                    <div className="text-6xl">🔢</div>
                  </div>

                  <h2 className='text-4xl font-black text-slate-800 mb-4'>
                    Connect the Dots Challenge
                  </h2>
                  <p className='text-slate-500 font-bold mb-10 max-w-lg text-center text-lg leading-relaxed'>
                    Connect the numbered dots in sequence to reveal the hidden
                    picture. Complete levels as fast as you can to earn more
                    points!
                  </p>

                  <div className='mb-10 w-full max-w-md bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100'>
                    <OptionChips
                      label='Difficulty'
                      theme='light'
                      options={(['easy', 'medium', 'hard'] as const).map(
                        (diff) => ({
                          id: diff,
                          label: diff.charAt(0).toUpperCase() + diff.slice(1),
                        }),
                      )}
                      selectedId={difficulty}
                      onSelect={(id) => setDifficulty(id as typeof difficulty)}
                      buttonMinHeightClassName='min-h-[56px]'
                    />
                  </div>

                  {/* Standardized Menu Controls */}
                  <GameControls
                    controls={menuControls}
                    position='bottom-center'
                  />
                </div>
              ) : (
                /* Game Completed Screen */
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='w-32 h-32 mx-auto mb-8 text-7xl'>
                    🏆
                  </div>

                  <h2 className='text-4xl font-black text-[#10B981] mb-2'>
                    Congratulations!
                  </h2>
                  <p className='text-xl text-slate-500 font-bold mb-8'>You completed all levels!</p>
                  <div className='text-3xl font-black text-slate-800 mb-10 border-4 border-slate-100 bg-slate-50 px-8 py-4 rounded-3xl'>
                    Final Score: <span className="text-[#3B82F6]">{score}</span>
                  </div>

                  {/* Standardized Completion Controls */}
                  <GameControls
                    controls={completionControls}
                    position='bottom-center'
                  />
                </div>
              )}
            </div>

            {/* Game Instructions */}
            <div className='bg-[#3B82F6]/5 border-4 border-[#3B82F6]/10 rounded-[2rem] p-8'>
              <h2 className='text-2xl font-black mb-4 text-[#3B82F6]'>
                How to Play
              </h2>
              <ul className='space-y-3 text-slate-600 font-bold text-lg'>
                <li>
                  • Connect the numbered dots in ascending order (1, 2, 3...)
                </li>
                <li>
                  • Complete each level as fast as you can to earn bonus points
                </li>
                <li>
                  • Levels get progressively harder with more dots to connect
                </li>
                <li>• Finish all 5 levels to win the game!</li>
                {cameraPermission === 'granted' && (
                  <li className="pt-2">
                    <strong className='text-[#E85D04]'>Hand Tracking:</strong>{' '}
                    Toggle &quot;Hand Mode&quot; to use gestures. Point with
                    your index finger and pinch to connect dots!
                  </li>
                )}
              </ul>
            </div>
          </motion.div>

          {/* Celebration Overlay */}
          <CelebrationOverlay
            show={showCelebration}
            letter={String(level)}
            accuracy={100}
            message={
              level >= 5
                ? 'Amazing! All levels complete! 🏆'
                : `Level ${level} Complete!`
            }
            onComplete={() => setShowCelebration(false)}
          />
        </section>
      )}
    </>
  );
});

export default ConnectTheDots;
