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
import { useHandTracking } from '../hooks/useHandTracking';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { detectPinch, createDefaultPinchState } from '../utils/pinchDetection';
import type { PinchState, Landmark } from '../types/tracking';

interface Dot {
  id: number;
  x: number;
  y: number;
  connected: boolean;
  number: number;
}

const GAME_COLORS = {
  path: 'var(--text-error)',
  dotConnected: 'var(--success)',
  dotPending: 'var(--text-error)',
  dotStroke: 'var(--text-inverse)',
  dotLabel: 'var(--text-inverse)',
  cursorIdle: 'var(--brand-secondary)',
  cursorPinch: 'var(--warning)',
} as const;

export const ConnectTheDots = memo(function ConnectTheDotsComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const pinchStateRef = useRef<PinchState>(createDefaultPinchState());
  const animationFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false); // true while a processing tick is running
  const lastProcessedAtRef = useRef(0);
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

  // Use centralized hand tracking hook
  const {
    landmarker,
    isReady: isHandTrackingReady,
    initialize: initializeHandTracking,
  } = useHandTracking({
    numHands: 1, // ConnectTheDots only needs one hand
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });

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

  // Initialize hand tracking when game starts and enabled
  useEffect(() => {
    if (gameStarted && isHandTrackingEnabled && !landmarker) {
      initializeHandTracking();
    }
  }, [gameStarted, isHandTrackingEnabled, landmarker, initializeHandTracking]);

  // Hand tracking loop with FPS throttling and single-instance guard
  // Controls whether the loop should continue scheduling frames. This is
  // toggled by the start/stop effect to avoid race conditions where a
  // scheduled callback keeps re-arming after the loop was stopped.
  const loopActiveRef = useRef<boolean>(false);

  const runHandTracking = useCallback(async () => {
    // Bail early if the loop has been deactivated
    if (!loopActiveRef.current) return;

    // If a tick is already in flight, do nothing - avoid double-scheduling
    if (isProcessingRef.current) return;

    // If hand mode was disabled while scheduled, bail immediately
    if (!isHandTrackingEnabled) return;

    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    // If core prerequisites are missing (webcam, model, canvas, readiness),
    // schedule a retry only when the loop should be active.
    if (!video || !landmarker || !isHandTrackingReady || !canvas) {
      if (loopActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(runHandTracking);
      }
      return;
    }

    const now = performance.now();

    // FPS throttle for vision processing (15 fps = ~66ms intervals)
    if (now - lastProcessedAtRef.current < 1000 / 15) {
      if (loopActiveRef.current)
        animationFrameRef.current = requestAnimationFrame(runHandTracking);
      return;
    }

    if (video.readyState < 2) {
      if (loopActiveRef.current)
        animationFrameRef.current = requestAnimationFrame(runHandTracking);
      return;
    }

    // Guard to indicate work in-flight
    isProcessingRef.current = true;
    lastProcessedAtRef.current = now;

    try {
      const results = landmarker.detectForVideo(video, now);

      if (results?.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0] as Landmark[];

        // Get index finger tip (landmark 8) for cursor
        const indexTip = landmarks[8];
        if (indexTip) {
          // Map from video coordinates (mirrored) to canvas coordinates
          // Mirror the x coordinate since webcam is mirrored
          const mirroredX = 1 - indexTip.x;

          // Map to canvas internal coordinates (800x600)
          const canvasX = mirroredX * canvas.width;
          const canvasY = indexTip.y * canvas.height;

          // Detect pinch gesture (thumb tip + index tip)
          const pinchResult = detectPinch(landmarks, pinchStateRef.current, {
            startThreshold: 0.05,
            releaseThreshold: 0.07,
          });

          pinchStateRef.current = pinchResult.state;

          // Throttle UI updates so both cursor & pinch update together (10 fps)
          const needsUIUpdate = now - lastUIUpdateAtRef.current >= 1000 / 10;
          if (needsUIUpdate) {
            setHandCursor({ x: canvasX, y: canvasY });
            setIsPinching(pinchResult.state.isPinching);
            lastUIUpdateAtRef.current = now;
          }

          // When pinching starts, check if cursor is near current dot (uses ref-based checker)
          if (pinchResult.transition === 'start') {
            checkDotProximityRef(canvasX, canvasY);
          }
        }
      } else {
        // No hand detected - throttle these updates too
        if (now - lastUIUpdateAtRef.current >= 1000 / 10) {
          setHandCursor(null);
          setIsPinching(false);
          lastUIUpdateAtRef.current = now;
        }
      }
    } catch (error) {
      console.error('[ConnectTheDots] Hand tracking error:', error);
    } finally {
      // Mark tick completed
      isProcessingRef.current = false;

      // Only schedule the next frame if the loop is still intended to be active
      if (loopActiveRef.current && isHandTrackingEnabled) {
        animationFrameRef.current = requestAnimationFrame(runHandTracking);
      } else {
        animationFrameRef.current = null;
      }
    }
  }, [landmarker, isHandTrackingReady, isHandTrackingEnabled]);

  // Start/stop hand tracking loop with proper cleanup
  useEffect(() => {
    // Manage the loopActive gate and schedule the first animation frame when
    // conditions are met. Use requestAnimationFrame to let refs (e.g., webcam)
    // initialize in the first paint.
    if (
      gameStarted &&
      isHandTrackingEnabled &&
      isHandTrackingReady &&
      animationFrameRef.current == null
    ) {
      loopActiveRef.current = true;
      animationFrameRef.current = requestAnimationFrame(runHandTracking);
    } else {
      // Stop the loop
      loopActiveRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isProcessingRef.current = false;
      setHandCursor(null);
      setIsPinching(false);
      // Reset pinch detection state so re-enabling starts fresh
      pinchStateRef.current = createDefaultPinchState();
    }

    return () => {
      // Comprehensive cleanup
      loopActiveRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isProcessingRef.current = false;
      // Ensure pinch state cleared on unmount as well
      pinchStateRef.current = createDefaultPinchState();
    };
  }, [
    gameStarted,
    isHandTrackingEnabled,
    isHandTrackingReady,
    runHandTracking,
  ]);

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
          <div className='relative w-full h-full'>
            {/* Timer Display - Top Center */}
            <div className='absolute top-4 left-1/2 -translate-x-1/2 z-40'>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm ${
                  timeLeft <= 10
                    ? 'bg-red-500/20 border-red-500/30 animate-pulse'
                    : timeLeft <= 30
                      ? 'bg-yellow-500/20 border-yellow-500/30'
                      : 'bg-green-500/20 border-green-500/30'
                }`}
              >
                <UIIcon
                  name='timer'
                  size={18}
                  className={
                    timeLeft <= 10
                      ? 'text-red-400'
                      : timeLeft <= 30
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }
                />
                <span
                  className={`font-bold tabular-nums ${
                    timeLeft <= 10
                      ? 'text-red-400'
                      : timeLeft <= 30
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Next Dot Indicator */}
            <div className='absolute top-4 left-4 z-40'>
              <div className='bg-black/55 backdrop-blur px-4 py-2 rounded-xl border border-white/30 text-white shadow-soft'>
                <span className='text-sm text-white/70'>Next Dot</span>
                <span className='ml-2 font-bold text-lg'>
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

                {/* Hand cursor */}
                {handCursor && isHandTrackingEnabled && (
                  <g>
                    <circle
                      cx={handCursor.x}
                      cy={handCursor.y}
                      r={isPinching ? 15 : 12}
                      fill={
                        isPinching
                          ? GAME_COLORS.cursorPinch
                          : GAME_COLORS.cursorIdle
                      }
                      fillOpacity={0.7}
                      stroke={GAME_COLORS.dotStroke}
                      strokeWidth='2'
                    />
                    {isPinching && (
                      <circle
                        cx={handCursor.x}
                        cy={handCursor.y}
                        r={25}
                        fill='none'
                        stroke={GAME_COLORS.cursorPinch}
                        strokeWidth='2'
                        opacity='0.5'
                      />
                    )}
                  </g>
                )}
              </svg>
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
        <section className='max-w-7xl mx-auto px-4 py-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <header className='flex justify-between items-center mb-6'>
              <div>
                <h1 className='text-3xl font-bold'>Connect The Dots</h1>
                <p className='text-white/60'>
                  Connect the numbered dots in sequence to reveal the picture!
                </p>
              </div>

              <div className='text-right'>
                <output className='block text-2xl font-bold'>
                  Score: {score}
                </output>
                {gameStarted && (
                  <div className='flex items-center gap-4 text-sm text-white/60'>
                    <span>Level: {level}</span>
                    <span>Time: {timeLeft}s</span>
                  </div>
                )}
              </div>
            </header>

            {showPermissionWarning && (
              <div
                role='alert'
                className='mb-4 flex items-start gap-3 bg-white/10 border border-border rounded-xl p-4 shadow-soft'
              >
                <UIIcon
                  name='warning'
                  size={20}
                  className='text-text-warning mt-0.5'
                />
                <div className='text-sm text-white/80'>
                  <p className='font-semibold text-white'>
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
            <div className='bg-white/10 border border-border rounded-xl p-6 mb-6 shadow-sm'>
              {!gameStarted ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='w-24 h-24 mx-auto mb-6'>
                    <img
                      src='/assets/images/connect-the-dots.svg'
                      alt='Connect the Dots'
                      className='w-full h-full object-contain'
                    />
                  </div>

                  <h2 className='text-2xl font-semibold mb-4'>
                    Connect the Dots Challenge
                  </h2>
                  <p className='text-white/70 mb-6 max-w-md text-center'>
                    Connect the numbered dots in sequence to reveal the hidden
                    picture. Complete levels as fast as you can to earn more
                    points!
                  </p>

                  <div className='mb-6 w-full max-w-md'>
                    <label className='block text-sm font-medium text-white/80 mb-2'>
                      Difficulty
                    </label>
                    <div className='flex gap-2'>
                      {(['easy', 'medium', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          className={`px-4 py-2 min-h-[56px] rounded-lg font-medium transition ${
                            difficulty === diff
                              ? 'bg-pip-orange text-white shadow-lg'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
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
                  <div className='w-24 h-24 mx-auto mb-6'>
                    <img
                      src='/assets/images/trophy.svg'
                      alt='Trophy'
                      className='w-full h-full object-contain'
                    />
                  </div>

                  <h2 className='text-3xl font-bold text-green-400 mb-2'>
                    Congratulations!
                  </h2>
                  <p className='text-xl mb-6'>You completed all levels!</p>
                  <div className='text-2xl font-bold mb-8'>
                    Final Score: {score}
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
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-xl p-6'>
              <h2 className='text-lg font-semibold mb-3 text-blue-400'>
                How to Play
              </h2>
              <ul className='space-y-2 text-white/70 text-sm'>
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
                  <li>
                    • <strong className='text-green-400'>Hand Tracking:</strong>{' '}
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
