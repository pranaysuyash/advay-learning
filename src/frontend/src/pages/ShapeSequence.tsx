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
      <div className='absolute inset-0 bg-black'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-45'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/65' />

        <div className='absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/55 text-white text-sm text-center max-w-[90%]'>
          {feedback}
        </div>

        <div className='absolute top-16 right-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm'>
          Time: <span className='font-bold text-amber-300'>{timeLeft}s</span>
        </div>

        <div className='absolute top-16 left-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm border border-white/20'>
          Sequence:{' '}
          <span className='font-bold text-fuchsia-300 tracking-wide'>
            {sequenceShapes.join('  ')}
          </span>
        </div>

        {targets.map((target) => {
          const isExpected = order[stepIndex] === target.id;
          return (
            <div
              key={target.id}
              className='absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
              style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
              aria-hidden='true'
            >
              <div
                className={`absolute inset-0 rounded-full border-4 flex items-center justify-center font-black text-4xl ${
                  isExpected
                    ? 'border-fuchsia-300 bg-fuchsia-300/35 text-fuchsia-100'
                    : 'border-slate-200 bg-slate-200/25 text-white'
                }`}
              >
                {target.shape}
              </div>
            </div>
          );
        })}

        {cursor && (
          <div
            className='absolute w-10 h-10 rounded-full border-4 border-cyan-300 bg-cyan-300/20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_26px_rgba(34,211,238,0.7)] pointer-events-none'
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
            aria-hidden='true'
          />
        )}

        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center'>
            <button
              type='button'
              onClick={startGame}
              className='px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl text-lg'
            >
              Start Shape Sequence
            </button>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3'>
            <h2 className='text-3xl font-black text-fuchsia-300'>Sequence Master!</h2>
            <p className='text-white/90'>Final Score: {score}</p>
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
