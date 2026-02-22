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
import { findHitTarget } from '../games/hitTarget';
import { pickSpacedPoints } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

interface SequenceTarget {
  id: number;
  shape: string;
  position: Point;
}

const SHAPES = ['◯', '□', '△', '◇', '☆', '✦'] as const;
const HIT_RADIUS = 0.1;
const MAX_LEVEL = 6;

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

function createSequenceRound(level: number): {
  targets: SequenceTarget[];
  order: number[];
} {
  const targetCount = 4;
  const points = pickSpacedPoints(targetCount, 0.25, 0.16, random01);
  const availableShapes = [...SHAPES].sort(() => random01() - 0.5);

  const targets: SequenceTarget[] = points.map((point, index) => ({
    id: index,
    shape: availableShapes[index] ?? SHAPES[index % SHAPES.length],
    position: point.position,
  }));

  const shuffledIds = targets.map((target) => target.id).sort(() => random01() - 0.5);
  const orderLength = Math.min(2 + level, targetCount);

  return {
    targets,
    order: shuffledIds.slice(0, orderLength),
  };
}

export const ShapeSequence = memo(function ShapeSequenceComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(80);
  const [targets, setTargets] = useState<SequenceTarget[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the shapes in the shown order.');
  const [showCelebration, setShowCelebration] = useState(false);

  const targetsRef = useRef<SequenceTarget[]>(targets);
  const orderRef = useRef<number[]>(order);
  const stepIndexRef = useRef(stepIndex);
  const levelRef = useRef(level);
  const timeLeftRef = useRef(timeLeft);

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
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [initializeHandTracking, isHandTrackingReady, isModelLoading, isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;

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
  }, [isPlaying, gameCompleted]);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;

    const round = createSequenceRound(level);
    setTargets(round.targets);
    setOrder(round.order);
    setStepIndex(0);
    setFeedback('Pinch the first shape in the sequence.');
  }, [isPlaying, level, gameCompleted]);

  const completeLevel = useCallback(() => {
    if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

    playCelebration();
    setShowCelebration(true);
    setScore((prev) => prev + 30 + timeLeftRef.current * 2);

    levelTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false);
      if (levelRef.current >= MAX_LEVEL) {
        setGameCompleted(true);
        setIsPlaying(false);
      } else {
        setLevel((prev) => prev + 1);
      }
      levelTimeoutRef.current = null;
    }, 1800);
  }, [playCelebration]);

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

      const activeTargets = targetsRef.current;
      const hit = findHitTarget(tip, activeTargets, HIT_RADIUS);

      if (!hit) {
        setFeedback('Pinch directly on a shape.');
        void playError();
        return;
      }

      const expectedId = orderRef.current[stepIndexRef.current];
      if (typeof expectedId !== 'number') return;

      if (hit.id !== expectedId) {
        setStepIndex(0);
        setFeedback('Wrong order. Sequence reset to start.');
        void playError();
        return;
      }

      void playPop();
      setScore((prev) => prev + 10);
      const nextStep = stepIndexRef.current + 1;
      setStepIndex(nextStep);

      if (nextStep >= orderRef.current.length) {
        setFeedback(`Level ${levelRef.current} sequence complete!`);
        completeLevel();
      } else {
        setFeedback(`Great! Next shape ${nextStep + 1}/${orderRef.current.length}.`);
      }
    },
    [completeLevel, cursor, playError, playPop],
  );

  useHandTrackingRuntime({
    isRunning: isPlaying && !gameCompleted && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps: 24,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
    },
  });

  const startGame = async () => {
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setTimeLeft(80);
    setFeedback('Pinch the shapes in the shown order.');
    setCursor(null);
    setIsPlaying(true);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void initializeHandTracking();
    }
  };

  const resetGame = () => {
    if (levelTimeoutRef.current) {
      clearTimeout(levelTimeoutRef.current);
      levelTimeoutRef.current = null;
    }

    setIsPlaying(false);
    setGameCompleted(false);
    setTargets([]);
    setOrder([]);
    setStepIndex(0);
    setCursor(null);
    setTimeLeft(80);
    setFeedback('Pinch the shapes in the shown order.');
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

  const sequenceShapes = order.map((targetId) => {
    const target = targets.find((item) => item.id === targetId);
    return target?.shape ?? '?';
  });

  return (
    <GameContainer title='Shape Sequence' score={score} level={level} onHome={goHome}>
      <div className='absolute inset-0 bg-blue-50 overflow-hidden'>
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

        <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-500 font-bold text-lg flex items-center gap-3'>
          Sequence:
          <span className='font-black text-2xl tracking-widest text-[#D946EF] drop-shadow-sm ml-2'>
            {sequenceShapes.join(' ')}
          </span>
        </div>

        {targets.map((target) => {
          const isExpected = order[stepIndex] === target.id;
          return (
            <div
              key={target.id}
              className={`absolute w-[7rem] h-[7rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ${isExpected ? 'scale-110' : 'hover:scale-105'}`}
              style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
              aria-hidden='true'
            >
              <div
                className={`absolute inset-0 rounded-[2rem] border-[6px] shadow-sm flex items-center justify-center font-black text-5xl transition-colors ${isExpected
                    ? 'border-[#D946EF] bg-fuchsia-50 text-[#D946EF]'
                    : 'border-[#3B82F6] bg-white text-[#3B82F6]'
                  }`}
              >
                {target.shape}
              </div>
            </div>
          );
        })}

        {cursor && (
          <div
            className='absolute w-12 h-12 rounded-full border-4 border-[#F59E0B] bg-amber-100/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(245,158,11,0.5)] pointer-events-none z-20'
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
            aria-hidden='true'
          />
        )}

        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-sm'>
              <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🔢</div>
              <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4'>Shape Sequence</h2>
              <p className='text-slate-500 font-bold text-xl mb-10'>
                Pinch the shapes in the shown order.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-sm text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Shape Sequence
              </button>
            </div>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[80%] shadow-sm'>
              <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🏆</div>
              <h2 className='text-4xl font-black text-[#D946EF] tracking-tight mb-2'>Sequence Master!</h2>
              <p className='text-xl font-bold text-slate-500 mb-8'>Incredible job memorizing the order!</p>
              <div className='inline-block bg-amber-50 border-4 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
                Final Score: {score}
              </div>
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='◆'
          accuracy={100}
          message={`Level ${level} sequence cleared!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default ShapeSequence;
