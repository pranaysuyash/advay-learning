import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useHandTracking } from '../hooks/useHandTracking';
import {
  useHandTrackingRuntime,
  type HandTrackingRuntimeMeta,
} from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';
import { buildRound, type EmotionTarget } from '../games/emojiMatchLogic';
import { distanceBetweenPoints, isPointInCircle } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import { KalmanFilter, isWithinTarget, mapNormalizedPointToCover } from '../utils/coordinateTransform';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const BASE_HIT_RADIUS = 0.18;
const ADAPTIVE_HIT_BONUS = 0.06;
const SNAP_RADIUS = 0.06;
const ROUNDS_PER_LEVEL = 10;
const MAX_LEVEL = 3;
const ROUND_TIME = 60;
const ADAPTIVE_TIME_BONUS = 10;
const MATCH_PAUSE_MS = 1400;
const LEVEL_PAUSE_MS = 2200;
const START_TARGET_FALLBACK_RADIUS = 120;
const TUTORIAL_STEPS = [
  { title: 'Show your hand', icon: '👋', detail: 'Hold your hand in front of the camera.' },
  { title: 'Move the dot', icon: '🟡', detail: 'Move the dot to the matching emoji.' },
  { title: 'Pinch to pick', icon: '🤏', detail: 'Pinch when you are on the right emoji.' },
];

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kalmanRef = useRef(new KalmanFilter(0.02, 0.12));
  const startTriggeredRef = useRef(false);
  const missCountRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [missCount, setMissCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [targets, setTargets] = useState<EmotionTarget[]>([]);
  const [correctId, setCorrectId] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [cursorPx, setCursorPx] = useState<Point | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [rawTip, setRawTip] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the matching emoji!');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [celebrationEmoji, setCelebrationEmoji] = useState('🎉');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Great job!');
  const [lastHitId, setLastHitId] = useState<number | null>(null);
  const [lastMissId, setLastMissId] = useState<number | null>(null);

  const targetsRef = useRef<EmotionTarget[]>(targets);
  const correctIdRef = useRef(correctId);
  const streakRef = useRef(streak);
  const roundRef = useRef(round);
  const levelRef = useRef(level);
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const showDebug = Boolean((import.meta as any)?.env?.DEV);

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
  useEffect(() => { missCountRef.current = missCount; }, [missCount]);
  useEffect(() => {
    if (!isPlaying && !gameCompleted) {
      startTriggeredRef.current = false;
    }
  }, [gameCompleted, isPlaying]);

  useEffect(() => {
    if (!gameCompleted && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [gameCompleted, initializeHandTracking, isHandTrackingReady, isModelLoading]);

  useEffect(() => {
    const updateRect = () => {
      const rect = containerRef.current?.getBoundingClientRect() ?? null;
      containerRectRef.current = rect;
      if (rect && cursor) {
        setCursorPx({
          x: rect.left + cursor.x * rect.width,
          y: rect.top + cursor.y * rect.height,
        });
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [cursor]);

  const startRound = useCallback(() => {
    const baseCount = levelRef.current === 1 ? 2 : levelRef.current === 2 ? 3 : 4;
    const adaptiveCount = missCountRef.current >= 3 ? Math.max(2, baseCount - 1) : baseCount;
    const result = buildRound(adaptiveCount, random01);
    setTargets(result.targets);
    setCorrectId(result.correctId);
    setTimeLeft(ROUND_TIME + (missCountRef.current >= 3 ? ADAPTIVE_TIME_BONUS : 0));
    const correctEmotion = result.targets[result.correctId];
    const prompt = correctEmotion?.name ?? '?';
    setFeedback(`Pinch the ${prompt} emoji!`);
    if (ttsEnabled) {
      void speak(`Find the ${prompt} emoji!`);
    }
  }, [speak, ttsEnabled]);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;
    startRound();
  }, [gameCompleted, isPlaying, startRound]);

  const nextRound = useCallback(() => {
    if (roundRef.current >= ROUNDS_PER_LEVEL) {
      if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

      setCelebrationEmoji('🎉');
      setCelebrationMessage(`Level ${levelRef.current} complete!`);
      setShowCelebration(true);
      playCelebration();

      levelTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
        setCelebrationMessage(null);
        if (levelRef.current >= MAX_LEVEL) {
          setGameCompleted(true);
          setIsPlaying(false);
        } else {
          const nextLevel = levelRef.current + 1;
          levelRef.current = nextLevel;
          roundRef.current = 1;
          setLevel(nextLevel);
          setRound(1);
          startRound();
        }
        levelTimeoutRef.current = null;
      }, LEVEL_PAUSE_MS);
    } else {
      const next = roundRef.current + 1;
      roundRef.current = next;
      setRound(next);
      startRound();
    }
  }, [playCelebration, startRound]);

  useEffect(() => {
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    if (!isPlaying || gameCompleted) return;
    if (!isHandDetected || isPaused || isTransitioning) return;

    roundTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStreak(0);
          const nextMisses = missCountRef.current + 1;
          setMissCount(nextMisses);
          setFeedback('Time is up! Try the next emoji.');
          setIsTransitioning(true);
          if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
          transitionTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
            nextRound();
          }, MATCH_PAUSE_MS);
          return ROUND_TIME + (nextMisses >= 3 ? ADAPTIVE_TIME_BONUS : 0);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [gameCompleted, isHandDetected, isPaused, isPlaying, isTransitioning, nextRound]);

  const startGame = useCallback(async () => {
    setGameCompleted(false);
    setScore(0);
    setStreak(0);
    setMissCount(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(ROUND_TIME);
    setFeedback('Pinch the matching emoji!');
    setCursor(null);
    setCursorPx(null);
    setIsPinching(false);
    setIsHandDetected(false);
    kalmanRef.current.reset();
    setIsPaused(false);
    setAutoPaused(false);
    setIsTransitioning(false);
    setShowTutorial(false);
    setLastHitId(null);
    setLastMissId(null);
    missCountRef.current = 0;
    setIsPlaying(true);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void initializeHandTracking();
    }
  }, [initializeHandTracking, isHandTrackingReady, isModelLoading, playStart]);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        if (isHandDetected) setIsHandDetected(false);
        if (isPinching) setIsPinching(false);
        kalmanRef.current.reset();
        return;
      }

      const containerRect = containerRectRef.current ?? containerRef.current?.getBoundingClientRect();
      const mappedTip = containerRect
        ? mapNormalizedPointToCover(
          tip,
          { width: meta.video.videoWidth, height: meta.video.videoHeight },
          { width: containerRect.width, height: containerRect.height },
        )
        : tip;

      if (!isHandDetected) setIsHandDetected(true);
      setIsPinching(frame.pinch.state.isPinching);
      setRawTip(frame.rawIndexTip);

      const tipPx = containerRect
        ? {
          x: containerRect.left + mappedTip.x * containerRect.width,
          y: containerRect.top + mappedTip.y * containerRect.height,
        }
        : null;
      const smoothedPx = tipPx ? kalmanRef.current.update(tipPx) : null;

      if (!cursor || cursor.x !== mappedTip.x || cursor.y !== mappedTip.y) {
        setCursor(mappedTip);
      }
      if (smoothedPx && (!cursorPx || cursorPx.x !== smoothedPx.x || cursorPx.y !== smoothedPx.y)) {
        setCursorPx(smoothedPx);
      }

      if (frame.pinch.transition !== 'start') return;

      if (!isPlaying && !gameCompleted) {
        if (!startTriggeredRef.current && smoothedPx) {
          const buttonRect = startButtonRef.current?.getBoundingClientRect();
          const target = buttonRect
            ? {
              x: buttonRect.left + buttonRect.width / 2,
              y: buttonRect.top + buttonRect.height / 2,
            }
            : {
              x: (containerRect?.left ?? 0) + (containerRect?.width ?? 0) / 2,
              y: (containerRect?.top ?? 0) + (containerRect?.height ?? 0) / 2,
            };
          const radius = buttonRect
            ? Math.max(buttonRect.width, buttonRect.height) / 2
            : START_TARGET_FALLBACK_RADIUS;
          if (isWithinTarget(smoothedPx, target, radius)) {
            startTriggeredRef.current = true;
            void startGame();
          }
        }
        return;
      }

      if (isPaused || isTransitioning) return;

      const activeTargets = targetsRef.current;
      const adaptiveHitRadius =
        missCountRef.current >= 3 ? BASE_HIT_RADIUS + ADAPTIVE_HIT_BONUS : BASE_HIT_RADIUS;
      const closestTarget = activeTargets
        .map((target) => ({
          target,
          distance: distanceBetweenPoints(mappedTip, target.position),
        }))
        .sort((a, b) => a.distance - b.distance)[0];
      const snappedPoint =
        closestTarget && closestTarget.distance <= SNAP_RADIUS
          ? closestTarget.target.position
          : mappedTip;
      const hit = activeTargets.find((t) =>
        isPointInCircle(snappedPoint, t.position, adaptiveHitRadius),
      );

      if (!hit) {
        setMissCount((current) => current + 1);
        setFeedback('Oops! Pinch a nearby emoji.');
        void playError();
        return;
      }

      const expected = activeTargets[correctIdRef.current];
      if (!expected) return;

      if (hit.id === expected.id) {
        const nextStreak = streakRef.current + 1;
        setStreak(nextStreak);
        setMissCount(0);
        setScore((prev) => prev + 10 + Math.min(15, nextStreak * 3));
        setFeedback(`Yes! That's the ${expected.name} emoji!`);
        void playPop();
        setSuccessMessage(`You found ${expected.name}!`);
        setShowSuccess(true);
        setLastHitId(hit.id);
        setLastMissId(null);
        setIsTransitioning(true);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setLastHitId(null), 900);

        if (nextStreak > 0 && nextStreak % 5 === 0) {
          setCelebrationEmoji(expected.emoji);
          setCelebrationMessage('Great job!');
          setShowCelebration(true);
          void playCelebration();
          setTimeout(() => {
            setShowCelebration(false);
            setCelebrationMessage(null);
          }, 1800);
        }

        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          nextRound();
        }, MATCH_PAUSE_MS);
      } else {
        setStreak(0);
        setMissCount((current) => current + 1);
        setFeedback(`Oops! That's ${hit.name}. Find ${expected.name}.`);
        void playError();
        setLastMissId(hit.id);
        setLastHitId(null);
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => setLastMissId(null), 900);
      }
    },
    [
      cursor,
      gameCompleted,
      isHandDetected,
      isPinching,
      isPaused,
      isPlaying,
      isTransitioning,
      nextRound,
      playCelebration,
      playError,
      playPop,
      startGame,
    ],
  );

  useHandTrackingRuntime({
    isRunning: !gameCompleted && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps: 30,
    smoothing: {
      minCutoff: 1.4,
      beta: 0.02,
      dCutoff: 1.0,
    },
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (isHandDetected) setIsHandDetected(false);
      if (cursorPx) setCursorPx(null);
      if (rawTip) setRawTip(null);
      if (isPinching) setIsPinching(false);
      kalmanRef.current.reset();
    },
  });

  const resetGame = () => {
    if (levelTimeoutRef.current) {
      clearTimeout(levelTimeoutRef.current);
      levelTimeoutRef.current = null;
    }
    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setAutoPaused(false);
    setGameCompleted(false);
    setTargets([]);
    setCursor(null);
    setCursorPx(null);
    setIsPinching(false);
    setIsHandDetected(false);
    kalmanRef.current.reset();
    setTimeLeft(ROUND_TIME);
    setFeedback('Pinch the matching emoji!');
    setMissCount(0);
    setShowCelebration(false);
    setCelebrationMessage(null);
    setCelebrationEmoji('🎉');
    setShowSuccess(false);
    setSuccessMessage('Great job!');
    setShowTutorial(true);
    setIsTransitioning(false);
    setLastHitId(null);
    setLastMissId(null);
    startTriggeredRef.current = false;
    missCountRef.current = 0;
  };

  const goHome = () => {
    resetGame();
    navigate('/dashboard');
  };

  const progressDots = useMemo(
    () => Array.from({ length: ROUNDS_PER_LEVEL }, (_, index) => index < Math.max(round - 1, 0)),
    [round],
  );
  const isAdaptive = missCount >= 3;

  const controls: GameControl[] = [
    {
      id: 'start',
      icon: (isPlaying ? 'rotate-ccw' : 'play') as any,
      label: isPlaying ? 'Restart' : 'Start',
      onClick: startGame,
      variant: isPlaying ? 'secondary' : 'success',
    },
    {
      id: 'pause',
      icon: (isPaused ? 'play' : 'pause') as any,
      label: isPaused ? 'Resume' : 'Pause',
      onClick: () => {
        if (!isPlaying) return;
        setIsPaused((prev) => !prev);
        setAutoPaused(false);
      },
      variant: 'secondary',
    },
    {
      id: 'home',
      icon: 'home' as any,
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
      onPause={() => {
        if (!isPlaying) return;
        setIsPaused((prev) => !prev);
        setAutoPaused(false);
      }}
    >
      <div ref={containerRef} className='absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-sm pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white border-4 border-slate-200 text-slate-700 font-bold text-base md:text-lg text-center shadow-sm min-w-max'>
          {feedback}
        </div>

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white border-4 border-slate-200 text-slate-500 font-bold text-lg shadow-sm'>
          Time left: <span className='font-black text-[#F59E0B]'>{timeLeft}s</span>
        </div>

        {promptTarget && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white border-4 border-slate-200 text-slate-500 text-lg shadow-sm'>
            <span className='font-bold uppercase tracking-widest text-xs mr-2 opacity-60'>Find</span>
            <span className='font-black text-slate-800 tracking-tight text-xl'>{promptTarget.name}</span>
            <span className='text-xs font-bold text-slate-400 ml-3 uppercase tracking-wider'>
              Round {round} of {ROUNDS_PER_LEVEL}
            </span>
          </div>
        )}

        {isPlaying && (
          <div className='absolute top-32 left-1/2 -translate-x-1/2 flex gap-2'>
            {progressDots.map((filled, index) => (
              <span
                key={`dot-${index}`}
                className={`h-3 w-3 rounded-full border border-white/40 ${filled ? 'bg-emerald-400' : 'bg-white/20'
                  }`}
              />
            ))}
            {isAdaptive && (
              <span className='ml-3 rounded-full bg-amber-200/90 px-3 py-1 text-xs font-semibold text-amber-900'>
                Easier mode
              </span>
            )}
          </div>
        )}

        {targets.map((target) => {
          const isHit = lastHitId === target.id;
          const isMiss = lastMissId === target.id;
          return (
            <div
              key={target.id}
              className='absolute w-[clamp(140px,20vw,420px)] h-[clamp(140px,20vw,420px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none'
              style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
              aria-hidden='true'
            >
              <div
                className={`absolute inset-0 rounded-full border-4 shadow-sm transition-transform ${isHit ? 'scale-110' : ''
                  }`}
                style={{
                  borderColor: target.color,
                  backgroundColor: 'white',
                  boxShadow: isHit
                    ? '0 0 32px rgba(16, 185, 129, 0.4)'
                    : isMiss
                      ? '0 0 28px rgba(248, 113, 113, 0.4)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <div
                className='absolute inset-2 overflow-hidden rounded-full opacity-30'
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${target.color}22, transparent)`
                }}
              />
              <div className='absolute inset-0 flex items-center justify-center text-5xl'>
                {target.emoji}
              </div>
            </div>
          );
        })}

        {cursorPx && (
          <GameCursor
            position={cursorPx}
            isPinching={isPinching}
            isHandDetected={isHandDetected}
            highContrast
          />
        )}

        <HandTrackingStatus
          isHandDetected={isPlaying ? isHandDetected : true}
          onHandDetectionChange={(detected) => {
            if (!isPlaying) return;
            if (!detected) {
              setIsPaused(true);
              setAutoPaused(true);
              return;
            }
            if (autoPaused) {
              setIsPaused(false);
              setAutoPaused(false);
            }
          }}
          pauseOnHandLost
          voicePrompt
          compact
        />

        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-50/60 backdrop-blur-sm z-20'>
            <div className='flex flex-col items-center w-full max-w-4xl'>
              {showTutorial && (
                <div className='flex flex-wrap items-center justify-center gap-6 mb-12'>
                  {TUTORIAL_STEPS.map((step) => (
                    <div
                      key={step.title}
                      className='flex flex-col items-center gap-3 rounded-[2.5rem] bg-white border-4 border-slate-100 px-8 py-6 w-72 text-center shadow-sm hover:scale-105 transition-transform'
                    >
                      <div className='flex items-center justify-center w-20 h-20 bg-blue-50 rounded-[1.5rem] border-4 border-blue-100 text-[3.5rem] drop-shadow-sm mb-2'>
                        {step.icon}
                      </div>
                      <div className='text-xl font-black text-slate-800 tracking-tight'>{step.title}</div>
                      <div className='text-base font-bold text-slate-500'>{step.detail}</div>
                    </div>
                  ))}
                </div>
              )}
              <button
                ref={startButtonRef}
                type='button'
                onClick={startGame}
                className='px-16 py-6 rounded-[2rem] bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white font-black text-3xl shadow-sm hover:scale-105 active:scale-95 transition-all'
              >
                Start Emoji Match
              </button>
            </div>
          </div>
        )}

        {showTutorial && !isPlaying && !gameCompleted && ttsEnabled && (
          <VoiceInstructions
            instructions={[
              'Show your hand to the camera.',
              'Move the dot to the matching emoji.',
              'Pinch to choose.',
            ]}
            replayButtonPosition='bottom-right'
          />
        )}

        {isPaused && isPlaying && (
          <div className='absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50'>
            <div className='rounded-[2.5rem] bg-white border-4 border-slate-200 p-10 text-center shadow-2xl max-w-md w-[90%]'>
              <div className='flex items-center justify-center w-24 h-24 mx-auto bg-amber-50 rounded-[1.5rem] border-4 border-amber-100 text-5xl mb-6'>
                ⏸️
              </div>
              <div className='text-3xl font-black text-slate-800 tracking-tight mb-3'>Paused</div>
              <div className='text-lg font-bold text-slate-500'>Pinch or press Resume to continue.</div>
            </div>
          </div>
        )}

        {showDebug && (
          <div className='absolute bottom-4 left-4 rounded-lg bg-black/70 px-3 py-2 text-xs text-white'>
            <div>raw: {rawTip ? `${rawTip.x.toFixed(3)}, ${rawTip.y.toFixed(3)}` : 'n/a'}</div>
            <div>mapped: {cursor ? `${cursor.x.toFixed(3)}, ${cursor.y.toFixed(3)}` : 'n/a'}</div>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-40'>
            <div className='flex flex-col items-center gap-6 bg-white border-4 border-slate-100 rounded-[3rem] p-12 shadow-sm text-center max-w-2xl'>
              <div className='text-7xl mb-2 hover:scale-110 transition-transform'>🥰</div>
              <h2 className='text-4xl md:text-5xl font-black text-slate-800 tracking-tight'>
                Emotion Expert!
              </h2>
              <p className='text-2xl font-bold text-slate-500 mb-2'>
                Final Score: <span className='text-[#10B981] text-3xl'>{score}</span>
              </p>
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && celebrationMessage && (
        <CelebrationOverlay
          show={showCelebration}
          letter={celebrationEmoji}
          accuracy={100}
          message={celebrationMessage}
          onComplete={() => {
            setShowCelebration(false);
            setCelebrationMessage(null);
          }}
        />
      )}

      <SuccessAnimation
        show={showSuccess}
        message={successMessage}
        duration={MATCH_PAUSE_MS}
        onComplete={() => setShowSuccess(false)}
        type='stars'
        showCharacter
        characterEmoji='⭐'
      />
    </GameContainer>
  );
});

export default EmojiMatch;
