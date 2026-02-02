import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { UIIcon } from '../components/ui/Icon';
import { GameHeader } from '../components/GameHeader';
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

  // Sound effects
  const { playCelebration, playPop } = useSoundEffects();

  const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(false);
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
        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');

        if (result.state === 'denied') {
          setShowPermissionWarning(true);
        }

        result.addEventListener('change', () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
          setShowPermissionWarning(result.state === 'denied');
        });
      } catch (error) {
        console.warn(
          '[ConnectTheDots] Camera permission check not supported',
          error,
        );
      }
    };

    checkCameraPermission();
  }, []);

  // Initialize hand tracking when game starts and enabled
  useEffect(() => {
    if (gameStarted && isHandTrackingEnabled && !landmarker) {
      initializeHandTracking();
    }
  }, [gameStarted, isHandTrackingEnabled, landmarker, initializeHandTracking]);

  // Hand tracking loop
  const runHandTracking = useCallback(async () => {
    if (
      !webcamRef.current?.video ||
      !landmarker ||
      !isHandTrackingReady ||
      !isHandTrackingEnabled ||
      !canvasRef.current
    ) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(runHandTracking);
      return;
    }

    try {
      const results = landmarker.detectForVideo(video, performance.now());

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

          setHandCursor({ x: canvasX, y: canvasY });

          // Detect pinch gesture (thumb tip + index tip)
          const pinchResult = detectPinch(landmarks, pinchStateRef.current, {
            startThreshold: 0.05,
            releaseThreshold: 0.07,
          });

          pinchStateRef.current = pinchResult.state;
          setIsPinching(pinchResult.state.isPinching);

          // When pinching, check if cursor is near current dot
          if (pinchResult.transition === 'start' && handCursor) {
            checkDotProximity(canvasX, canvasY);
          }
        }
      } else {
        // No hand detected
        setHandCursor(null);
        setIsPinching(false);
      }
    } catch (error) {
      console.error('[ConnectTheDots] Hand tracking error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(runHandTracking);
  }, [landmarker, isHandTrackingReady, isHandTrackingEnabled, handCursor]);

  // Start/stop hand tracking loop
  useEffect(() => {
    if (gameStarted && isHandTrackingEnabled && isHandTrackingReady) {
      runHandTracking();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    gameStarted,
    isHandTrackingEnabled,
    isHandTrackingReady,
    runHandTracking,
  ]);

  // Check if hand cursor is near the current dot
  const checkDotProximity = useCallback(
    (x: number, y: number) => {
      if (!gameStarted || gameCompleted || currentDotIndex >= dots.length)
        return;

      const currentDot = dots[currentDotIndex];
      const distance = Math.sqrt(
        Math.pow(x - currentDot.x, 2) + Math.pow(y - currentDot.y, 2),
      );

      const radius = 30; // Same as mouse click radius
      if (distance <= radius) {
        handleDotClick(currentDotIndex);
      }
    },
    [dots, currentDotIndex, gameStarted, gameCompleted],
  );

  // Initialize dots for the current level
  useEffect(() => {
    if (!gameStarted) return;

    const numDots = Math.min(5 + level * 2, 15); // Increase dots with level, max 15
    const newDots: Dot[] = [];

    for (let i = 0; i < numDots; i++) {
      // Generate random positions within the canvas bounds
      const x = 100 + Math.random() * 600; // Canvas width is 800
      const y = 100 + Math.random() * 400; // Canvas height is 600

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
  }, [level, gameStarted]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, gameCompleted]);

  // Check if level is completed
  useEffect(() => {
    if (dots.length > 0 && dots.every((dot) => dot.connected)) {
      // Level completed - play celebration!
      playCelebration();
      setShowCelebration(true);
      setScore((prev) => prev + timeLeft * 10); // Bonus points for remaining time
      setTimeout(() => {
        setShowCelebration(false);
        if (level >= 5) {
          setGameCompleted(true);
        } else {
          setLevel((prev) => prev + 1);
          setTimeLeft(60); // Reset timer for next level
        }
      }, 2500); // Match CelebrationOverlay timing
    }
  }, [dots, timeLeft, level, playCelebration]);

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
  };

  const handleDotClick = (dotId: number) => {
    if (!gameStarted || gameCompleted) return;

    // Check if clicked the correct next dot
    if (dotId === currentDotIndex) {
      playPop(); // Play pop sound on successful connection
      const updatedDots = [...dots];
      updatedDots[dotId] = { ...updatedDots[dotId], connected: true };
      setDots(updatedDots);

      if (currentDotIndex < dots.length - 1) {
        setCurrentDotIndex((prev) => prev + 1);
      }
    }
  };

  const resetGame = () => {
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

  return (
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
            <output className='block text-2xl font-bold'>Score: {score}</output>
            <div className='flex items-center gap-4 text-sm text-white/60'>
              <span>Level: {level}</span>
              <span>Time: {timeLeft}s</span>
            </div>
          </div>
        </header>

        {showPermissionWarning && (
          <div
            role='alert'
            className='mb-4 flex items-start gap-3 bg-white/10 border border-border rounded-xl p-4 shadow-soft'
          >
            <UIIcon name='warning' size={20} className='text-text-warning mt-0.5' />
            <div className='text-sm text-white/80'>
              <p className='font-semibold text-white'>Camera permission denied</p>
              <p>
                You can still play with mouse/touch. Enable camera permission to
                use hand tracking controls.
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
                picture. Complete levels as fast as you can to earn more points!
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
                      className={`px-4 py-2 rounded-lg font-medium transition ${difficulty === diff
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={goToHome}
                  className='px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition shadow-lg flex items-center gap-2'
                >
                  <UIIcon name='home' size={20} />
                  Home
                </button>
                <button
                  onClick={startGame}
                  className='px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition shadow-red-900/20'
                >
                  Start Game
                </button>
              </div>
            </div>
          ) : gameCompleted ? (
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

              <div className='flex gap-4'>
                <button
                  onClick={resetGame}
                  className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition'
                >
                  Play Again
                </button>
                <button
                  onClick={goToHome}
                  className='px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition'
                >
                  Home
                </button>
              </div>
            </div>
          ) : (
            <div className='w-screen h-screen bg-black overflow-hidden fixed top-0 left-0 right-0 bottom-0 z-40'>
              <div className='relative'>
                <div className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
                  <GameHeader
                    title="Connect the Dots"
                    subtitle="Find the hidden shape"
                    score={score}
                    level={level}
                    timeLeft={timeLeft}
                    infoItems={[
                      { label: 'Next Dot', value: currentDotIndex + 1 },
                      { label: 'Mode', value: isHandTrackingEnabled ? 'Hand' : 'Mouse' }
                    ]}
                    onBack={goToHome}
                    secondaryAction={{
                      label: 'Reset',
                      icon: 'home',
                      onClick: resetGame
                    }}
                    primaryAction={{
                      label: isHandTrackingEnabled ? 'Mouse Mode' : 'Hand Mode',
                      icon: isHandTrackingEnabled ? 'pencil' : 'hand',
                      onClick: () => setIsHandTrackingEnabled(!isHandTrackingEnabled)
                    }}
                  />
                </div>
                <div className="relative w-full h-full">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className='w-full h-full'
                    onClick={(e) => {
                      if (!canvasRef.current) return;

                      const rect = canvasRef.current.getBoundingClientRect();
                      // Canvas internal coordinates are fixed (800x600). The element is responsive,
                      // so map from CSS pixels → canvas pixels to keep hit-testing correct.
                      const scaleX = canvasRef.current.width / rect.width;
                      const scaleY = canvasRef.current.height / rect.height;
                      const x = (e.clientX - rect.left) * scaleX;
                      const y = (e.clientY - rect.top) * scaleY;

                      // Find the closest dot within a certain radius
                      const radius = 30;
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

                  {/* Webcam for hand tracking (hidden, used for detection only) */}
                  {isHandTrackingEnabled && (
                    <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-0'>
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={true}
                        videoConstraints={{
                          facingMode: 'user',
                          width: 1280,
                          height: 720,
                        }}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}

                  {/* Draw dots and lines */}
                  {dots.length > 0 && (
                    <svg
                      className='absolute top-0 left-0 w-full h-full pointer-events-none'
                      width='800'
                      height='600'
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

                      {/* Hand cursor (when hand tracking enabled) */}
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

                  {/* Game Controls Overlay */}
                  {/* Overlays removed - moved to GameHeader */}

                  {/* Mascot */}
                  <div className='absolute bottom-4 left-4 z-20'>
                    <Mascot
                      state={currentDotIndex === 0 ? 'idle' : 'happy'}
                      message={`Connect to dot #${currentDotIndex + 1}`}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Game Instructions */}
        <div className='bg-blue-500/10 border border-blue-500/20 rounded-xl p-6'>
          <h2 className='text-lg font-semibold mb-3 text-blue-400'>
            How to Play
          </h2>
          <ul className='space-y-2 text-white/70 text-sm'>
            <li>• Connect the numbered dots in ascending order (1, 2, 3...)</li>
            <li>
              • Complete each level as fast as you can to earn bonus points
            </li>
            <li>• Levels get progressively harder with more dots to connect</li>
            <li>• Finish all 5 levels to win the game!</li>
            {cameraPermission === 'granted' && (
              <li>
                • <strong className='text-green-400'>Hand Tracking:</strong>{' '}
                Toggle "Hand Mode" to use gestures. Point with your index finger
                and pinch to connect dots!
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
        message={level >= 5 ? "Amazing! All levels complete! 🏆" : `Level ${level} Complete!`}
        onComplete={() => setShowCelebration(false)}
      />
    </section>
  );
});
