import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useHandTracking } from '../hooks/useHandTracking';
import {
  useHandTrackingRuntime,
  type HandTrackingRuntimeMeta,
} from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
import {
  isPointInCircle,
  pickRandomPoint,
} from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const SHAPES = ['◯', '△', '□', '◇', '☆'] as const;
const POP_RADIUS = 0.11;

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

export const ShapePop = memo(function ShapePopComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [targetCenter, setTargetCenter] = useState<Point>(
    pickRandomPoint(0.4, 0.55, 0.18),
  );
  const [targetShape, setTargetShape] = useState<(typeof SHAPES)[number]>('◯');
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch when your finger is inside the shape ring.');
  const [showCelebration, setShowCelebration] = useState(false);

  const scoreRef = useRef(score);

  const {
    landmarker,
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    initialize: initializeHandTracking,
  } = useHandTracking({
    numHands: 1,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [initializeHandTracking, isHandTrackingReady, isModelLoading, isPlaying]);

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

        if (nextScore > 0 && nextScore % 120 === 0) {
          setShowCelebration(true);
          void playCelebration();
          setTimeout(() => setShowCelebration(false), 1800);
        }

        spawnTarget();
      } else {
        setFeedback('Close! Move into the ring, then pinch.');
        void playError();
      }
    },
    [cursor, playCelebration, playError, playPop, spawnTarget, targetCenter],
  );

  useHandTrackingRuntime({
    isRunning: isPlaying && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps: 30,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
    },
  });

  const startGame = async () => {
    setScore(0);
    setTimeLeft(60);
    setFeedback('Pinch when your finger is inside the shape ring.');
    setCursor(null);
    spawnTarget();
    setIsPlaying(true);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void initializeHandTracking();
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
      <div className='absolute inset-0 bg-black'>
        <Webcam
          ref={webcamRef}
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
        </div>

        <div
          className='absolute w-36 h-36 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
          style={{ left: `${targetCenter.x * 100}%`, top: `${targetCenter.y * 100}%` }}
          aria-hidden='true'
        >
          <div className='absolute inset-0 rounded-full border-4 border-fuchsia-300/90 shadow-[0_0_30px_rgba(217,70,239,0.55)]' />
          <div className='absolute inset-0 flex items-center justify-center text-6xl font-black text-fuchsia-100'>
            {targetShape}
          </div>
        </div>

        {cursor && (
          <div
            className='absolute w-10 h-10 rounded-full border-4 border-cyan-300 bg-cyan-300/20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_26px_rgba(34,211,238,0.7)] pointer-events-none'
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
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

export default ShapePop;
