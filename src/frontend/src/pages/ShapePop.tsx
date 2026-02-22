import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { triggerHaptic } from '../utils/haptics';
import { isPointInCircle, pickRandomPoint } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const SHAPES = ['◯', '△', '□', '◇', '☆'] as const;
const POP_RADIUS = 0.16; // Increased from 0.11 for kids' easier targeting

// Touch-friendly sizing constants for kids
const CURSOR_SIZE = 64; // Increased from 40 for easier visibility
const TARGET_SIZE = 144; // Increased from 144 (w-36 = 9rem = 144px) for kids' fingers

export const ShapePop = memo(function ShapePopComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [targetCenter, setTargetCenter] = useState<Point>(
    pickRandomPoint(0.4, 0.55, 0.18),
  );
  const [targetShape, setTargetShape] = useState<(typeof SHAPES)[number]>('◯');
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState(
    'Pinch when your finger is inside the shape ring.',
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const scoreRef = useRef(score);

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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
    setTargetCenter(pickRandomPoint(randomFloat01(), randomFloat01(), 0.18));
    setTargetShape(SHAPES[Math.floor(randomFloat01() * SHAPES.length)] ?? '◯');
  }, []);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        if (cursor !== null) setCursor(null);
        return;
      }

      if (!cursor || cursor.x !== tip.x || cursor.y !== tip.y) {
        setCursor(tip);
      }

      if (frame.pinch.transition !== 'start') return;

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
    },
    [cursor, playCelebration, playError, playPop, spawnTarget, targetCenter],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } =
    useGameHandTracking({
      gameName: 'ShapePop',
      targetFps: 30,
      isRunning: isPlaying,
      onFrame: handleFrame,
      onNoVideoFrame: () => {
        if (cursor !== null) setCursor(null);
      },
    });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  const startGame = async () => {
    setScore(0);
    setTimeLeft(60);
    setFeedback('Pinch when your finger is inside the shape ring.');
    setCursor(null);
    spawnTarget();
    setIsPlaying(true);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setCursor(null);
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
      title='Shape Pop'
      score={score}
      level={Math.max(1, Math.floor(score / 120) + 1)}
      onHome={goHome}
    >
      <div ref={gameAreaRef} className='absolute inset-0 bg-blue-50 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-fuchsia-100/40 pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-600 font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-500 font-bold text-lg'>
          Time: <span className={`font-black text-2xl ml-2 ${timeLeft <= 5 ? 'text-[#EF4444]' : 'text-amber-500'}`}>{timeLeft}s</span>
        </div>

        <div
          className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform hover:scale-105'
          style={{
            left: `${targetCenter.x * 100}%`,
            top: `${targetCenter.y * 100}%`,
            width: `${TARGET_SIZE}px`,
            height: `${TARGET_SIZE}px`,
          }}
          aria-hidden='true'
        >
          <div className='absolute inset-0 rounded-full border-[6px] border-[#D946EF] bg-fuchsia-100/30 shadow-[0_0_30px_rgba(217,70,239,0.3)] backdrop-blur-sm' />
          <div className='absolute inset-0 flex items-center justify-center text-7xl font-black text-[#D946EF] drop-shadow-sm'>
            {targetShape}
          </div>
        </div>

        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={CURSOR_SIZE}
            color='#3B82F6'
          />
        )}

        {!isPlaying && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-sm'>
              <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🫧</div>
              <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4'>Shape Pop</h2>
              <p className='text-slate-500 font-bold text-xl mb-10'>
                Pinch inside the shapes to pop them!
              </p>
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-sm text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Popping!
              </button>
            </div>
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

export default ShapePop;
