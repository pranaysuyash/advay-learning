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
  pickSpacedPoints,
} from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

interface GardenTarget {
  id: number;
  name: string;
  color: string;
  position: Point;
}

const FLOWERS: Array<{ name: string; color: string }> = [
  { name: 'Red', color: '#ef4444' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Purple', color: '#8b5cf6' },
];

const TARGET_RADIUS = 0.1;

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

function buildRoundTargets(): { targets: GardenTarget[]; promptId: number } {
  const random = random01;
  const picked = [...FLOWERS]
    .sort(() => random() - 0.5)
    .slice(0, 3)
    .map((flower, index) => ({ ...flower, id: index }));

  const points = pickSpacedPoints(3, 0.25, 0.15, random);
  const targets: GardenTarget[] = picked.map((flower, index) => ({
    ...flower,
    position: points[index]?.position ?? { x: 0.5, y: 0.5 },
  }));

  const promptId = Math.floor(random() * targets.length);
  return { targets, promptId };
}

export const ColorMatchGarden = memo(function ColorMatchGardenComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [targets, setTargets] = useState<GardenTarget[]>([]);
  const [promptId, setPromptId] = useState<number>(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the flower with the asked color.');
  const [showCelebration, setShowCelebration] = useState(false);

  const scoreRef = useRef(score);
  const streakRef = useRef(streak);
  const targetsRef = useRef(targets);
  const promptRef = useRef(promptId);

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
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  useEffect(() => {
    promptRef.current = promptId;
  }, [promptId]);

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

  const startRound = useCallback(() => {
    const round = buildRoundTargets();
    setTargets(round.targets);
    setPromptId(round.promptId);
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

      const activeTargets = targetsRef.current;
      const hitTarget = activeTargets.find((target) =>
        isPointInCircle(tip, target.position, TARGET_RADIUS),
      );

      if (!hitTarget) {
        setFeedback('Try pinching directly on a flower.');
        void playError();
        return;
      }

      const expected = activeTargets[promptRef.current];
      if (!expected) return;

      if (hitTarget.id === expected.id) {
        const nextStreak = streakRef.current + 1;
        const nextScore = scoreRef.current + 12 + Math.min(18, nextStreak * 2);
        setStreak(nextStreak);
        setScore(nextScore);
        setFeedback(`Yes! ${expected.name} flower collected.`);
        void playPop();

        if (nextStreak > 0 && nextStreak % 6 === 0) {
          setShowCelebration(true);
          void playCelebration();
          setTimeout(() => setShowCelebration(false), 1800);
        }

        startRound();
      } else {
        setStreak(0);
        setFeedback(`That was ${hitTarget.name}. Find ${expected.name}.`);
        void playError();
      }
    },
    [cursor, playCelebration, playError, playPop, startRound],
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
    setStreak(0);
    setTimeLeft(75);
    setFeedback('Pinch the flower with the asked color.');
    setCursor(null);
    startRound();
    setIsPlaying(true);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void initializeHandTracking();
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setCursor(null);
    setTimeLeft(75);
    setFeedback('Pinch the flower with the asked color.');
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

  const promptTarget = targets[promptId];

  return (
    <GameContainer
      title='Color Match Garden'
      score={score}
      level={Math.max(1, Math.floor(score / 100) + 1)}
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

        {promptTarget && (
          <div className='absolute top-16 left-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm border border-white/20'>
            Pinch: <span className='font-bold'>{promptTarget.name}</span>
          </div>
        )}

        {targets.map((target) => (
          <div
            key={target.id}
            className='absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
            style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
            aria-hidden='true'
          >
            <div
              className='absolute inset-0 rounded-full border-4 shadow-[0_0_22px_rgba(255,255,255,0.35)]'
              style={{ borderColor: target.color, backgroundColor: `${target.color}55` }}
            />
            <div className='absolute inset-0 flex items-center justify-center text-white font-black text-sm drop-shadow'>
              {target.name}
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

        {!isPlaying && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center'>
            <button
              type='button'
              onClick={startGame}
              className='px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl text-lg'
            >
              Start Color Match
            </button>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='✿'
          accuracy={100}
          message='Blooming brilliance!'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default ColorMatchGarden;
