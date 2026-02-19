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
import { buildRound, type EmotionTarget } from '../games/emojiMatchLogic';
import { isPointInCircle } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const HIT_RADIUS = 0.12;
const ROUNDS_PER_LEVEL = 10;
const MAX_LEVEL = 3;
const ROUND_TIME = 20;

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

export const EmojiMatch = memo(function EmojiMatchComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [targets, setTargets] = useState<EmotionTarget[]>([]);
  const [correctId, setCorrectId] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the emoji that matches the emotion!');
  const [showCelebration, setShowCelebration] = useState(false);

  const targetsRef = useRef<EmotionTarget[]>(targets);
  const correctIdRef = useRef(correctId);
  const streakRef = useRef(streak);
  const roundRef = useRef(round);
  const levelRef = useRef(level);

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

  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { correctIdRef.current = correctId; }, [correctId]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { levelRef.current = level; }, [level]);

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [initializeHandTracking, isHandTrackingReady, isModelLoading, isPlaying]);

  const startRound = useCallback(() => {
    const optionCount = Math.min(4 + Math.floor((levelRef.current - 1) / 2), 6);
    const result = buildRound(optionCount, random01);
    setTargets(result.targets);
    setCorrectId(result.correctId);
    setTimeLeft(ROUND_TIME);
    const correctEmotion = result.targets[result.correctId];
    setFeedback(`Find: ${correctEmotion?.name ?? '?'}`);
  }, []);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;
    startRound();
  }, [isPlaying, level, gameCompleted, startRound]);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;

    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    roundTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for this round
          setStreak(0);
          nextRound();
          return ROUND_TIME;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [isPlaying, gameCompleted, round]);

  const nextRound = useCallback(() => {
    if (roundRef.current >= ROUNDS_PER_LEVEL) {
      if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

      playCelebration();
      setShowCelebration(true);

      levelTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
        if (levelRef.current >= MAX_LEVEL) {
          setGameCompleted(true);
          setIsPlaying(false);
        } else {
          setLevel((prev) => prev + 1);
          setRound(1);
        }
        levelTimeoutRef.current = null;
      }, 1800);
    } else {
      setRound((prev) => prev + 1);
      startRound();
    }
  }, [playCelebration, startRound]);

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
      const hit = activeTargets.find((t) =>
        isPointInCircle(tip, t.position, HIT_RADIUS),
      );

      if (!hit) {
        setFeedback('Pinch directly on an emoji.');
        void playError();
        return;
      }

      const expected = activeTargets[correctIdRef.current];
      if (!expected) return;

      if (hit.id === expected.id) {
        const nextStreak = streakRef.current + 1;
        setStreak(nextStreak);
        setScore((prev) => prev + 10 + Math.min(15, nextStreak * 3));
        setFeedback(`Yes! That's ${expected.name}! ${expected.emoji}`);
        void playPop();

        if (nextStreak > 0 && nextStreak % 5 === 0) {
          setShowCelebration(true);
          void playCelebration();
          setTimeout(() => setShowCelebration(false), 1800);
        }

        nextRound();
      } else {
        setStreak(0);
        setFeedback(`That's ${hit.name}. Find ${expected.name}.`);
        void playError();
      }
    },
    [cursor, nextRound, playCelebration, playError, playPop],
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
    setStreak(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(ROUND_TIME);
    setFeedback('Pinch the emoji that matches the emotion!');
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
    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    setIsPlaying(false);
    setGameCompleted(false);
    setTargets([]);
    setCursor(null);
    setTimeLeft(ROUND_TIME);
    setFeedback('Pinch the emoji that matches the emotion!');
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

  const promptTarget = targets[correctId];

  return (
    <GameContainer
      title='Emoji Match'
      score={score}
      level={level}
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

        <div className='absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/55 text-white text-sm text-center max-w-[90%]'>
          {feedback}
        </div>

        <div className='absolute top-16 right-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm'>
          Time: <span className='font-bold text-amber-300'>{timeLeft}s</span>
        </div>

        {promptTarget && (
          <div className='absolute top-16 left-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm border border-white/20'>
            Find: <span className='font-bold text-lg'>{promptTarget.name}</span>
            <span className='text-xs text-white/60 ml-2'>
              R{round}/{ROUNDS_PER_LEVEL}
            </span>
          </div>
        )}

        {targets.map((target) => {
          return (
            <div
              key={target.id}
              className='absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
              style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
              aria-hidden='true'
            >
              <div
                className='absolute inset-0 rounded-full border-4 shadow-[0_0_22px_rgba(255,255,255,0.35)]'
                style={{
                  borderColor: target.color,
                  backgroundColor: `${target.color}44`,
                }}
              />
              <div className='absolute inset-0 flex items-center justify-center text-5xl'>
                {target.emoji}
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
              Start Emoji Match
            </button>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3'>
            <h2 className='text-3xl font-black text-pink-300'>Emotion Expert! 🥰</h2>
            <p className='text-white/90'>Final Score: {score}</p>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter={promptTarget?.emoji ?? '🎉'}
          accuracy={100}
          message={`Level ${level} complete!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default EmojiMatch;
