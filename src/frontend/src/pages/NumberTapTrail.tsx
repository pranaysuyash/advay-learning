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

interface TrailTarget {
  id: number;
  value: number;
  position: Point;
  cleared: boolean;
}

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

function createRoundTargets(level: number): TrailTarget[] {
  const count = Math.min(4 + level, 9);
  const points = pickSpacedPoints(count, 0.2, 0.14, random01);

  return points.map((point, index) => ({
    id: index,
    value: index + 1,
    position: point.position,
    cleared: false,
  }));
}

export const NumberTapTrail = memo(function NumberTapTrailComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(90);
  const [targets, setTargets] = useState<TrailTarget[]>([]);
  const [expectedIndex, setExpectedIndex] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch numbers in order: 1, 2, 3...');
  const [showCelebration, setShowCelebration] = useState(false);

  const targetsRef = useRef<TrailTarget[]>(targets);
  const expectedIndexRef = useRef(expectedIndex);
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
    expectedIndexRef.current = expectedIndex;
  }, [expectedIndex]);

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

    const roundTargets = createRoundTargets(level);
    setTargets(roundTargets);
    setExpectedIndex(0);
    setFeedback(`Find number 1 of ${roundTargets.length}`);
  }, [isPlaying, level, gameCompleted]);

  const completeLevel = useCallback(() => {
    if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

    playCelebration();
    setShowCelebration(true);
    setScore((prev) => prev + 35 + timeLeftRef.current * 2);

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
      const expected = activeTargets[expectedIndexRef.current];
      if (!expected) return;

      const hit = findHitTarget(
        tip,
        activeTargets.filter((target) => !target.cleared),
        HIT_RADIUS,
      );

      if (!hit) {
        setFeedback('Move closer to the number and pinch again.');
        void playError();
        return;
      }

      if (hit.id !== expected.id) {
        setFeedback(`That is ${hit.value}. Find ${expected.value}.`);
        void playError();
        return;
      }

      void playPop();
      setTargets((prev) =>
        prev.map((target) =>
          target.id === hit.id ? { ...target, cleared: true } : target,
        ),
      );

      const nextIndex = expectedIndexRef.current + 1;
      setExpectedIndex(nextIndex);

      if (nextIndex >= activeTargets.length) {
        setFeedback(`Level ${levelRef.current} complete!`);
        completeLevel();
      } else {
        setScore((prev) => prev + 8);
        setFeedback(`Great! Now find ${activeTargets[nextIndex].value}.`);
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
    setTimeLeft(90);
    setFeedback('Pinch numbers in order: 1, 2, 3...');
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
    setExpectedIndex(0);
    setCursor(null);
    setFeedback('Pinch numbers in order: 1, 2, 3...');
    setTimeLeft(90);
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

  const expectedTarget = targets[expectedIndex];

  return (
    <GameContainer title='Number Tap Trail' score={score} level={level} onHome={goHome}>
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

        {expectedTarget && (
          <div className='absolute top-16 left-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm border border-white/20'>
            Next: <span className='font-bold text-emerald-300'>{expectedTarget.value}</span>
          </div>
        )}

        {targets.map((target) => (
          <div
            key={target.id}
            className='absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
            style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
            aria-hidden='true'
          >
            <div
              className={`absolute inset-0 rounded-full border-4 flex items-center justify-center font-black text-xl ${
                target.cleared
                  ? 'border-emerald-300 bg-emerald-300/40 text-emerald-100'
                  : 'border-sky-300 bg-sky-300/30 text-white'
              }`}
            >
              {target.value}
            </div>
          </div>
        ))}

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
              Start Number Trail
            </button>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3'>
            <h2 className='text-3xl font-black text-emerald-300'>Trail Complete!</h2>
            <p className='text-white/90'>Final Score: {score}</p>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter={String(level)}
          accuracy={100}
          message={`Level ${level} cleared!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default NumberTapTrail;
