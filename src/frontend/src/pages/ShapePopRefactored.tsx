import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { isPointInCircle, pickRandomPoint } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';

const SHAPES = ['◯', '△', '□', '◇', '☆'] as const;
const POP_RADIUS = 0.16; // Increased from 0.11 for kids' easier targeting

// Touch-friendly sizing constants for kids
const CURSOR_SIZE = 64; // Increased from 40 for easier visibility
const TARGET_SIZE = 144; // Increased from 144 (w-36 = 9rem = 144px) for kids' fingers

/**
 * Kid-friendly haptic feedback utility
 * Uses longer, softer vibrations appropriate for children
 */
function triggerHaptic(type: 'success' | 'error' | 'celebration'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const patterns = {
    success: [50, 30, 50], // Gentle double tap
    error: [100, 50, 100], // Softer error buzz
    celebration: [100, 50, 100, 50, 200], // Joyful burst
  };

  navigator.vibrate(patterns[type]);
}

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

export const ShapePopRefactored = memo(function ShapePopRefactoredComponent() {
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [targetCenter, setTargetCenter] = useState<Point>(
    pickRandomPoint(0.4, 0.55, 0.18),
  );
  const [targetShape, setTargetShape] = useState<(typeof SHAPES)[number]>('◯');
  const [feedback, setFeedback] = useState(
    'Pinch when your finger is inside the shape ring.',
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const scoreRef = useRef(score);
  const { playPop, playError, playCelebration, playStart } = useSoundEffects();

  const {
    isReady,
    cursor,
    pinch,
    startTracking,
    resetTracking,
    fps,
    error,
    isLoading,
  } = useGameHandTracking({
    gameName: 'ShapePop',
    targetFps: 30,
    smoothing: { minCutoff: 1.0, beta: 0.0 },
    pinch: {
      startThreshold: 0.05,
      releaseThreshold: 0.07,
      landmarks: [4, 8], // Thumb and index finger
    },
    onError: (error) => {
      console.error('ShapePop hand tracking error:', error);
      setFeedback(
        'Camera not detected. Please check permissions and try again.',
      );
    },
    onReady: () => {
      setFeedback('Pinch when your finger is inside the shape ring.');
    },
  });

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (isPlaying && !isReady && !isLoading) {
      startTracking();
    }
  }, [isPlaying, isReady, isLoading, startTracking]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const spawnTarget = useCallback(() => {
    setTargetCenter(pickRandomPoint(random01(), random01(), 0.18));
    setTargetShape(SHAPES[Math.floor(random01() * SHAPES.length)] ?? '◯');
  }, []);

  // Handle pinch interactions
  useEffect(() => {
    if (!isPlaying || !isReady) return;

    if (pinch.transition === 'start') {
      const tip = cursor;
      if (!tip) return;

      const inside = isPointInCircle(tip, targetCenter, POP_RADIUS);
      if (inside) {
        const nextScore = scoreRef.current + 15;
        setScore(nextScore);
        setFeedback('Pop! Great hit.');
        void playPop();
        triggerHaptic('success');

        if (nextScore > 0 && nextScore % 120 === 0) {
          setShowCelebration(true);
          triggerHaptic('celebration');
          void playCelebration();
          setTimeout(() => setShowCelebration(false), 3000); // Slower pacing for kids
        }

        spawnTarget();
      } else {
        setFeedback('Close! Move into the ring, then pinch.');
        void playError();
        triggerHaptic('error');
      }
    }
  }, [
    pinch.transition,
    cursor,
    targetCenter,
    playPop,
    playError,
    playCelebration,
    spawnTarget,
    isPlaying,
    isReady,
  ]);

  const startGame = async () => {
    setScore(0);
    setTimeLeft(60);
    setFeedback('Pinch when your finger is inside the shape ring.');
    spawnTarget();
    setIsPlaying(true);
    await playStart();

    if (!isReady && !isLoading) {
      await startTracking();
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    resetTracking();
    setTimeLeft(60);
    setFeedback('Pinch when your finger is inside the shape ring.');
  };

  const goHome = () => {
    resetGame();
    navigate('/dashboard');
  };

  const controls: GameControl[] = [
    {
      id: 'start',
      icon: isPlaying ? 'rotate-ccw' : 'play',
      label: isPlaying ? 'Restart' : 'Start',
      onClick: startGame,
      variant: isPlaying ? 'secondary' : 'success',
    },
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goHome,
      variant: 'primary',
    },
  ];

  return (
    <GameContainer
      title='Shape Pop (Refactored)'
      score={score}
      level={Math.max(1, Math.floor(score / 120) + 1)}
      onHome={goHome}
    >
      <div className='absolute inset-0 bg-[#FFF8F0]'>
        <Webcam
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-45'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/65' />

        <div className='absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/50 text-white text-sm text-center max-w-[90%]'>
          {feedback}
        </div>

        <div className='absolute top-16 right-4 px-4 py-2 rounded-xl bg-black/50 text-white text-sm'>
          Time: <span className='font-bold text-amber-300'>{timeLeft}s</span>
          {isReady && (
            <span className='ml-2 text-xs text-gray-300'>(FPS: {fps})</span>
          )}
        </div>

        {error && (
          <div className='absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-red-500/90 text-white text-sm'>
            Error: {error.message}
          </div>
        )}

        <div
          className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none'
          style={{
            left: `${targetCenter.x * 100}%`,
            top: `${targetCenter.y * 100}%`,
            width: `${TARGET_SIZE}px`,
            height: `${TARGET_SIZE}px`,
          }}
          aria-hidden='true'
        >
          <div className='absolute inset-0 rounded-full border-4 border-fuchsia-300/90 shadow-[0_0_30px_rgba(217,70,239,0.55)]' />
          <div className='absolute inset-0 flex items-center justify-center text-6xl font-black text-fuchsia-100'>
            {targetShape}
          </div>
        </div>

        {cursor && (
          <div
            className='absolute rounded-full border-4 border-cyan-300 bg-cyan-300/20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_26px_rgba(34,211,238,0.7)] pointer-events-none'
            style={{
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
              width: `${CURSOR_SIZE}px`,
              height: `${CURSOR_SIZE}px`,
            }}
            aria-hidden='true'
          />
        )}

        {!isPlaying && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center'>
            <button
              type='button'
              onClick={startGame}
              className='px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl text-lg'
            >
              Start Shape Pop
            </button>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='★'
          accuracy={100}
          message='Awesome popping!'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default ShapePopRefactored;
