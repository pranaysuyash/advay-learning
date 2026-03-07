import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { triggerHaptic } from '../utils/haptics';
import {
  advanceObstacleCourseState,
  completeCurrentObstacle,
  createObstacleCourseRoundState,
  getCurrentObstacle,
  matchesObstacleAction,
  type ObstacleCourseRoundState,
} from '../games/obstacleCourseLogic';
import {
  createPoseBaseline,
  derivePoseMetrics,
  detectObstacleMovements,
  estimateDepthRatio,
  isPoseFrameStable,
  selectDominantMovement,
  type MovementSignal,
  type PoseBaseline,
  type PoseMetrics,
} from '../games/poseMovementAnalysis';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';

type GamePhase = 'menu' | 'calibrating' | 'playing' | 'summary';

interface FinalSummary {
  score: number;
  level: number;
  bestStreak: number;
  completedObstacles: number;
  missedObstacles: number;
}

const TOTAL_LEVELS = 3;
const CALIBRATION_SAMPLE_TARGET = 24;
const MOVEMENT_COOLDOWN_MS = 900;

function getMovementLabel(movement: MovementSignal | null) {
  if (!movement) {
    return 'Hold steady for the next obstacle';
  }

  switch (movement.type) {
    case 'duck':
      return 'Duck detected';
    case 'jump':
      return 'Jump detected';
    case 'sidestep-left':
      return 'Left sidestep detected';
    case 'sidestep-right':
      return 'Right sidestep detected';
    default:
      return 'Movement detected';
  }
}

function laneFromOffset(offset: number) {
  if (offset <= -0.12) {
    return 0;
  }

  if (offset >= 0.12) {
    return 2;
  }

  return 1;
}

export const ObstacleCourse = memo(function ObstacleCourse() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const baselineSamplesRef = useRef<PoseMetrics[]>([]);
  const previousMetricsRef = useRef<PoseMetrics | null>(null);
  const baselineRef = useRef<PoseBaseline | null>(null);
  const phaseRef = useRef<GamePhase>('menu');
  const roundStateRef = useRef<ObstacleCourseRoundState | null>(null);
  const levelTransitionTimeoutRef = useRef<number | null>(null);
  const lastResolveAtRef = useRef(0);
  const lastErrorAtRef = useRef(0);

  const [phase, setPhase] = useState<GamePhase>('menu');
  const [isLoading, setIsLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [baseline, setBaseline] = useState<PoseBaseline | null>(null);
  const [roundState, setRoundState] = useState<ObstacleCourseRoundState | null>(
    null,
  );
  const [movementHint, setMovementHint] = useState(
    'Calibrate to begin your obstacle run',
  );
  const [depthRatio, setDepthRatio] = useState(1);
  const [avatarLane, setAvatarLane] = useState(1);
  const [finalSummary, setFinalSummary] = useState<FinalSummary | null>(null);
  const [scorePopup, setScorePopup] = useState<{ value: number; x: number; y: number } | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { playClick, playError, playLevelUp, playCelebration, playSuccess } =
    useAudio();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('obstacle-course');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    roundStateRef.current = roundState;
  }, [roundState]);

  useEffect(() => {
    baselineRef.current = baseline;
  }, [baseline]);

  const finishSession = useCallback(
    (state: ObstacleCourseRoundState) => {
      const summary: FinalSummary = {
        score: state.score,
        level: state.level,
        bestStreak: state.bestStreak,
        completedObstacles: state.completedObstacles,
        missedObstacles: state.missedObstacles,
      };

      setFinalSummary(summary);
      setPhase('summary');
      setMovementHint('Course complete');

      const normalizedScore = Math.min(100, Math.round(state.score / 4));
      onGameComplete(normalizedScore);

      if (state.bestStreak >= 5) {
        triggerEasterEgg('egg-course-champion');
      }

      playCelebration();
    },
    [onGameComplete, playCelebration, triggerEasterEgg],
  );

  const scheduleNextLevel = useCallback(
    (state: ObstacleCourseRoundState) => {
      if (levelTransitionTimeoutRef.current) {
        window.clearTimeout(levelTransitionTimeoutRef.current);
      }

      levelTransitionTimeoutRef.current = window.setTimeout(() => {
        levelTransitionTimeoutRef.current = null;
        const nextRound = createObstacleCourseRoundState(
          state.level + 1,
          Date.now(),
          state.score,
          state.bestStreak,
        );
        setRoundState(nextRound);
        roundStateRef.current = nextRound;
        setMovementHint(`Level ${nextRound.level}: stay centered and go!`);
      }, 1100);
    },
    [],
  );

  const handleRoundCompletion = useCallback(
    (state: ObstacleCourseRoundState) => {
      if (state.level >= TOTAL_LEVELS) {
        finishSession(state);
        return;
      }

      if (levelTransitionTimeoutRef.current) {
        return;
      }

      setMovementHint(
        `Level ${state.level} finished. Next lane set incoming...`,
      );
      playLevelUp();
      scheduleNextLevel(state);
    },
    [finishSession, playLevelUp, scheduleNextLevel],
  );

  const startSession = useCallback(() => {
    playClick();
    baselineSamplesRef.current = [];
    previousMetricsRef.current = null;
    baselineRef.current = null;
    lastResolveAtRef.current = 0;
    lastErrorAtRef.current = 0;
    setCalibrationProgress(0);
    setBaseline(null);
    setDepthRatio(1);
    setAvatarLane(1);
    setFinalSummary(null);
    setMovementHint('Stand tall in the center lane for calibration');
    setRoundState(null);
    setPhase('calibrating');
  }, [playClick]);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  const goHome = useCallback(() => {
    playClick();
    navigate('/games');
  }, [navigate, playClick]);

  useEffect(() => {
    async function initPoseLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        let landmarker: PoseLandmarker;

        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        } catch (gpuError) {
          console.warn(
            '[ObstacleCourse] GPU pose init failed, falling back to CPU',
            gpuError,
          );
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        }

        poseLandmarkerRef.current = landmarker;
      } catch (initError) {
        console.error('[ObstacleCourse] Failed to initialize pose tracking', initError);
        setError(
          'Could not load pose tracking. Please refresh and check your connection.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    initPoseLandmarker();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (levelTransitionTimeoutRef.current) {
        window.clearTimeout(levelTransitionTimeoutRef.current);
      }

      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  const processFrame = useCallback(() => {
    const shouldContinue =
      phaseRef.current === 'calibrating' || phaseRef.current === 'playing';

    if (!shouldContinue) {
      return;
    }

    if (
      !poseLandmarkerRef.current ||
      !cameraReady ||
      !webcamRef.current?.video
    ) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = webcamRef.current.video;
    if (!video || video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const results = poseLandmarkerRef.current.detectForVideo(
      video,
      performance.now(),
    );
    const landmarks = results.landmarks?.[0];

    if (!landmarks) {
      setMovementHint('We lost you - step back into the frame');
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const metrics = derivePoseMetrics(landmarks);
    if (!metrics) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const previousMetrics = previousMetricsRef.current;
    previousMetricsRef.current = metrics;

    if (phaseRef.current === 'calibrating') {
      if (isPoseFrameStable(metrics, previousMetrics)) {
        baselineSamplesRef.current = [...baselineSamplesRef.current, metrics].slice(
          -CALIBRATION_SAMPLE_TARGET,
        );
      }

      const nextProgress = Math.round(
        (baselineSamplesRef.current.length / CALIBRATION_SAMPLE_TARGET) * 100,
      );
      setCalibrationProgress(Math.min(100, nextProgress));

      if (baselineSamplesRef.current.length >= CALIBRATION_SAMPLE_TARGET) {
        const nextBaseline = createPoseBaseline(baselineSamplesRef.current);
        if (nextBaseline) {
          baselineRef.current = nextBaseline;
          setBaseline(nextBaseline);
          const nextRound = createObstacleCourseRoundState(1);
          setRoundState(nextRound);
          roundStateRef.current = nextRound;
          setMovementHint('Calibration locked. Start moving through the course!');
          setPhase('playing');
          playLevelUp();
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const activeBaseline = baselineRef.current;
    const currentRound = roundStateRef.current;

    if (!activeBaseline || !currentRound) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const advancedRound = advanceObstacleCourseState(currentRound, Date.now());
    if (advancedRound !== currentRound) {
      setRoundState(advancedRound);
      roundStateRef.current = advancedRound;
    }

    const liveRound = roundStateRef.current;
    if (!liveRound) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (liveRound.status === 'complete') {
      handleRoundCompletion(liveRound);
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const currentObstacle = getCurrentObstacle(liveRound);
    const dominantMovement = selectDominantMovement(
      detectObstacleMovements(metrics, activeBaseline),
    );
    const centerOffset = metrics.centerX - activeBaseline.centerX;

    setDepthRatio(estimateDepthRatio(metrics, activeBaseline));
    setAvatarLane(laneFromOffset(centerOffset));

    if (currentObstacle) {
      const defaultHint = `${currentObstacle.instruction}`;
      setMovementHint(
        dominantMovement
          ? `${getMovementLabel(dominantMovement)} (${Math.round(dominantMovement.confidence * 100)}%)`
          : defaultHint,
      );
    } else {
      setMovementHint(getMovementLabel(dominantMovement));
    }

    if (
      currentObstacle &&
      dominantMovement &&
      matchesObstacleAction(currentObstacle, dominantMovement) &&
      Date.now() - lastResolveAtRef.current >= MOVEMENT_COOLDOWN_MS
    ) {
      const completedRound = completeCurrentObstacle(
        liveRound,
        dominantMovement,
        Date.now(),
      );

      lastResolveAtRef.current = Date.now();
      setRoundState(completedRound);
      roundStateRef.current = completedRound;
      playSuccess();
      triggerHaptic('success');

      // Show score popup for obstacle completion
      const baseScore = 15;
      const streakBonus = Math.min(completedRound.streak * 2, 15);
      setScorePopup({ value: baseScore + streakBonus, x: 50, y: 30 });
      setTimeout(() => setScorePopup(null), 700);

      // Track streak and trigger celebration at milestones
      const newStreak = completedRound.streak;
      setStreak(newStreak);
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        triggerHaptic('celebration');
        setShowStreakMilestone(true);
        setTimeout(() => setShowStreakMilestone(false), 1500);
      }

      if (completedRound.status === 'complete') {
        handleRoundCompletion(completedRound);
      }
    } else if (
      currentObstacle &&
      dominantMovement &&
      !matchesObstacleAction(currentObstacle, dominantMovement) &&
      dominantMovement.confidence > 0.7 &&
      Date.now() - lastErrorAtRef.current > 1200
    ) {
      lastErrorAtRef.current = Date.now();
      playError();
      triggerHaptic('error');
      setStreak(0);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [
    cameraReady,
    handleRoundCompletion,
    finishSession,
    playError,
    playSuccess,
  ]);

  useEffect(() => {
    if (phase !== 'calibrating' && phase !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [phase, processFrame]);

  const currentObstacle = roundState ? getCurrentObstacle(roundState) : null;
  const laneLabels = ['Left', 'Center', 'Right'];

  return (
    <GameContainer
      webcamRef={webcamRef}
      title='Obstacle Course'
      score={roundState?.score ?? finalSummary?.score ?? 0}
      level={roundState?.level ?? finalSummary?.level ?? 1}
      onHome={goHome}
      isPlaying={phase === 'playing'}
      reportSession={false}
    >
      <div className='absolute top-0 right-0 w-40 h-32 opacity-0 pointer-events-none overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          onUserMedia={handleCameraReady}
          mirrored
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className='w-full h-full object-cover'
        />
      </div>

      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(224,231,255,0.7),_rgba(219,234,254,0.9))]' />

      {isLoading ? (
        <div className='relative z-10 flex h-full items-center justify-center px-6 text-center'>
          <div className='rounded-3xl border-4 border-[#BFDBFE] bg-white/90 px-8 py-10 shadow-[0_8px_0_#93C5FD] max-w-lg'>
            <div className='text-6xl mb-4'>🏃</div>
            <h2 className='text-3xl font-black text-slate-800 mb-3'>
              Loading Obstacle Course
            </h2>
            <p className='text-slate-600'>
              Preparing pose tracking and course logic...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className='relative z-10 flex h-full items-center justify-center px-6 text-center'>
          <div className='rounded-3xl border-4 border-rose-200 bg-white/95 px-8 py-10 shadow-[0_8px_0_#FCA5A5] max-w-lg'>
            <div className='text-5xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-black text-slate-800 mb-3'>
              Obstacle Course
            </h2>
            <p className='text-slate-600 mb-5'>{error}</p>
            <button
              type='button'
              onClick={goHome}
              className='rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-white'
            >
              Back to Games
            </button>
          </div>
        </div>
      ) : phase === 'menu' ? (
        <div className='relative z-10 flex h-full items-center justify-center px-6 py-8'>
          <div className='w-full max-w-5xl rounded-[2rem] border-4 border-[#FDE68A] bg-white/95 p-8 shadow-[0_10px_0_#FCD34D]'>
            <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
              <div>
                <div className='mb-4 inline-flex rounded-full border-2 border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700'>
                  Full-body movement + sequencing
                </div>
                <h2 className='text-4xl font-black text-slate-900 mb-4'>
                  Obstacle Course
                </h2>
                <p className='text-lg text-slate-600 mb-6 max-w-2xl'>
                  Calibrate once, then clear three escalating rounds by ducking,
                  jumping, and sidestepping through the course in the correct
                  order.
                </p>
                <div className='grid gap-3 sm:grid-cols-3'>
                  <div className='rounded-3xl border-2 border-amber-200 bg-amber-50 p-4'>
                    <div className='text-3xl mb-2'>🦆</div>
                    <div className='font-black text-slate-800'>Duck</div>
                    <div className='text-sm text-slate-600'>
                      Lower under the bar
                    </div>
                  </div>
                  <div className='rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4'>
                    <div className='text-3xl mb-2'>🪵</div>
                    <div className='font-black text-slate-800'>Jump</div>
                    <div className='text-sm text-slate-600'>
                      Lift your whole body
                    </div>
                  </div>
                  <div className='rounded-3xl border-2 border-violet-200 bg-violet-50 p-4'>
                    <div className='text-3xl mb-2'>🪨</div>
                    <div className='font-black text-slate-800'>Sidestep</div>
                    <div className='text-sm text-slate-600'>
                      Move left or right fast
                    </div>
                  </div>
                </div>
              </div>

              <div className='rounded-[2rem] border-4 border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6'>
                <div className='grid gap-4'>
                  <div className='rounded-3xl border-2 border-sky-100 bg-white p-4'>
                    <div className='text-sm font-bold uppercase tracking-[0.2em] text-sky-600 mb-2'>
                      Depth-aware calibration
                    </div>
                    <p className='text-sm text-slate-600'>
                      The course measures your baseline body scale first, then
                      uses it to normalize movement and estimate how near or far
                      you are from the camera.
                    </p>
                  </div>
                  <div className='rounded-3xl border-2 border-slate-100 bg-white p-4'>
                    <div className='text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-2'>
                      Before you start
                    </div>
                    <ul className='space-y-2 text-sm text-slate-600'>
                      <li>Stand where your full body fits in frame.</li>
                      <li>Keep a little room above your head.</li>
                      <li>Face the camera and hold still for calibration.</li>
                    </ul>
                  </div>
                  <button
                    type='button'
                    onClick={startSession}
                    className='rounded-3xl bg-[#6366F1] px-6 py-4 text-base font-black text-white shadow-[0_6px_0_#3730A3] transition-transform hover:translate-y-[2px] hover:shadow-[0_4px_0_#3730A3] active:translate-y-[6px] active:shadow-none'
                  >
                    Start Obstacle Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : phase === 'calibrating' ? (
        <div className='relative z-10 flex h-full items-center justify-center px-6 py-8'>
          <div className='w-full max-w-3xl rounded-[2rem] border-4 border-sky-200 bg-white/95 p-8 shadow-[0_10px_0_#93C5FD]'>
            <div className='text-center mb-8'>
              <div className='text-6xl mb-4'>📷</div>
              <h2 className='text-3xl font-black text-slate-900 mb-3'>
                Calibrating Your Course
              </h2>
              <p className='text-slate-600'>{movementHint}</p>
            </div>

            <div className='mb-6 rounded-full bg-slate-100 p-2'>
              <div
                className='h-5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all'
                style={{ width: `${calibrationProgress}%` }}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-4 text-center'>
                <div className='text-sm font-bold text-slate-500'>Camera</div>
                <div className='mt-2 text-xl font-black text-slate-800'>
                  {cameraReady ? 'Ready' : 'Waiting'}
                </div>
              </div>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-4 text-center'>
                <div className='text-sm font-bold text-slate-500'>Stable Frames</div>
                <div className='mt-2 text-xl font-black text-slate-800'>
                  {baselineSamplesRef.current.length}/{CALIBRATION_SAMPLE_TARGET}
                </div>
              </div>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-4 text-center'>
                <div className='text-sm font-bold text-slate-500'>Progress</div>
                <div className='mt-2 text-xl font-black text-slate-800'>
                  {calibrationProgress}%
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : phase === 'summary' && finalSummary ? (
        <div className='relative z-10 flex h-full items-center justify-center px-6 py-8'>
          <div className='w-full max-w-4xl rounded-[2rem] border-4 border-emerald-200 bg-white/95 p-8 shadow-[0_10px_0_#86EFAC]'>
            <div className='text-center mb-8'>
              <div className='text-6xl mb-4'>🏁</div>
              <h2 className='text-4xl font-black text-slate-900 mb-3'>
                Course Complete
              </h2>
              <p className='text-slate-600'>
                You cleared the movement sequence and finished all levels.
              </p>
            </div>

            <div className='grid gap-4 md:grid-cols-4 mb-8'>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-5 text-center'>
                <div className='text-sm font-bold text-slate-500'>Score</div>
                <div className='mt-2 text-3xl font-black text-slate-900'>
                  {finalSummary.score}
                </div>
              </div>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-5 text-center'>
                <div className='text-sm font-bold text-slate-500'>Level</div>
                <div className='mt-2 text-3xl font-black text-slate-900'>
                  {finalSummary.level}
                </div>
              </div>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-5 text-center'>
                <div className='text-sm font-bold text-slate-500'>Best Streak</div>
                <div className='mt-2 text-3xl font-black text-slate-900'>
                  {finalSummary.bestStreak}
                </div>
              </div>
              <div className='rounded-3xl border-2 border-slate-100 bg-slate-50 p-5 text-center'>
                <div className='text-sm font-bold text-slate-500'>Misses</div>
                <div className='mt-2 text-3xl font-black text-slate-900'>
                  {finalSummary.missedObstacles}
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <button
                type='button'
                onClick={startSession}
                className='rounded-3xl bg-[#6366F1] px-6 py-4 text-base font-black text-white shadow-[0_6px_0_#3730A3] hover:translate-y-[2px] transition-transform active:translate-y-[6px] active:shadow-none'
              >
                Run Again
              </button>
              <button
                type='button'
                onClick={goHome}
                className='rounded-3xl border-2 border-slate-200 bg-white px-6 py-4 text-base font-black text-slate-800'
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative z-10 flex h-full flex-col px-4 py-4 md:px-6'>
          <div className='mb-4 grid gap-4 xl:grid-cols-[1.4fr_0.6fr]'>
            <div className='rounded-3xl border-4 border-slate-100 bg-white/95 p-5 shadow-[0_8px_0_#E2E8F0]'>
              <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                <div>
                  <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                    Current Obstacle
                  </div>
                  <div className='mt-1 text-2xl font-black text-slate-900'>
                    {currentObstacle?.label ?? 'Finish line'}
                  </div>
                  <div className='text-sm text-slate-600 mt-1'>
                    {currentObstacle?.instruction ?? 'You have cleared the course.'}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={startSession}
                  className='rounded-2xl border-2 border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-700'
                >
                  Recalibrate
                </button>
              </div>
            </div>

            <div className='rounded-3xl border-4 border-slate-100 bg-white/95 p-5 shadow-[0_8px_0_#E2E8F0]'>
              <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                Depth Meter
              </div>
              <div className='mt-2 text-3xl font-black text-slate-900'>
                {depthRatio.toFixed(2)}x
              </div>
              <div className='mt-2 h-3 rounded-full bg-slate-100'>
                <div
                  className='h-3 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500'
                  style={{ width: `${Math.min(100, Math.max(0, ((depthRatio - 0.7) / 0.75) * 100))}%` }}
                />
              </div>
              <div className='mt-2 text-xs text-slate-500'>
                Normalized from your calibration stance
              </div>
            </div>
          </div>

          <div className='mb-4 rounded-3xl border-4 border-slate-100 bg-white/90 p-4 shadow-[0_8px_0_#E2E8F0]'>
            <div className='grid gap-3 md:grid-cols-3'>
              {roundState?.sequence.map((obstacle, index) => {
                const isActive = index === roundState.currentIndex;
                const isDone = index < roundState.currentIndex;

                return (
                  <div
                    key={obstacle.id}
                    className={`rounded-2xl border-2 px-4 py-3 transition-colors ${isDone
                        ? 'border-emerald-200 bg-emerald-50'
                        : isActive
                          ? 'border-sky-200 bg-sky-50'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <div className='text-sm font-black text-slate-800'>
                          {obstacle.label}
                        </div>
                        <div className='text-xs text-slate-500'>
                          {obstacle.timeLimitMs / 1000}s window
                        </div>
                      </div>
                      <div className='text-2xl'>
                        {isDone ? '✓' : obstacle.action === 'duck'
                          ? '🦆'
                          : obstacle.action === 'jump'
                            ? '🪵'
                            : obstacle.action === 'sidestep-left'
                              ? '⬅️'
                              : '➡️'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='grid flex-1 gap-4 xl:grid-cols-[1.45fr_0.55fr]'>
            <div className='rounded-[2rem] border-4 border-slate-100 bg-white/90 p-4 shadow-[0_8px_0_#E2E8F0]'>
              <div className='grid h-full gap-4 md:grid-cols-3'>
                {laneLabels.map((laneLabel, laneIndex) => {
                  const obstacleHere = currentObstacle?.lane === laneIndex;
                  const playerHere = avatarLane === laneIndex;

                  return (
                    <div
                      key={laneLabel}
                      className={`relative rounded-[1.5rem] border-2 p-4 ${obstacleHere
                          ? 'border-sky-200 bg-sky-50'
                          : 'border-slate-100 bg-slate-50'
                        }`}
                    >
                      <div className='mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                        {laneLabel}
                      </div>

                      <div className='absolute inset-x-4 top-14 rounded-full bg-white/80 px-3 py-2 text-center text-xs font-bold text-slate-500'>
                        {obstacleHere
                          ? currentObstacle?.instruction
                          : 'Clear lane'}
                      </div>

                      <div className='mt-20 flex h-[58%] items-center justify-center rounded-[1.25rem] border-2 border-dashed border-slate-200 bg-white/70'>
                        {obstacleHere ? (
                          <div
                            className='rounded-3xl px-5 py-4 text-center text-white shadow-lg'
                            style={{ backgroundColor: currentObstacle?.color }}
                          >
                            <div className='text-4xl mb-2'>
                              {currentObstacle?.action === 'duck'
                                ? '🚧'
                                : currentObstacle?.action === 'jump'
                                  ? '🪵'
                                  : '🪨'}
                            </div>
                            <div className='text-sm font-black'>
                              {currentObstacle?.label}
                            </div>
                          </div>
                        ) : (
                          <div className='text-center text-slate-400'>
                            <div className='text-4xl mb-2'>.</div>
                            <div className='text-xs font-bold uppercase tracking-[0.2em]'>
                              Open
                            </div>
                          </div>
                        )}
                      </div>

                      <div className='absolute inset-x-0 bottom-4 flex justify-center'>
                        <div
                          className={`rounded-full border-4 px-5 py-3 text-2xl shadow-md ${playerHere
                              ? 'border-emerald-300 bg-emerald-100'
                              : 'border-slate-200 bg-white'
                            }`}
                        >
                          🧒
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='space-y-4'>
              <div className='rounded-3xl border-4 border-slate-100 bg-white/95 p-5 shadow-[0_8px_0_#E2E8F0]'>
                <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                  Live Coach
                </div>
                <div className='mt-2 text-lg font-black text-slate-900'>
                  {movementHint}
                </div>
                <div className='mt-3 text-sm text-slate-500'>
                  {baseline
                    ? `Body scale baseline: ${baseline.horizontalScale.toFixed(2)}`
                    : 'Baseline pending'}
                </div>
              </div>

              <div className='rounded-3xl border-4 border-slate-100 bg-white/95 p-5 shadow-[0_8px_0_#E2E8F0]'>
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-1'>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                      Time Left
                    </div>
                    <div className='mt-2 text-3xl font-black text-slate-900'>
                      {Math.ceil((roundState?.timeRemainingMs ?? 0) / 1000)}s
                    </div>
                  </div>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                      Streak
                    </div>
                    <div className='mt-2 text-3xl font-black text-slate-900'>
                      {roundState?.streak ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                      Best
                    </div>
                    <div className='mt-2 text-3xl font-black text-slate-900'>
                      {roundState?.bestStreak ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className='text-xs font-bold uppercase tracking-[0.2em] text-slate-500'>
                      Missed
                    </div>
                    <div className='mt-2 text-3xl font-black text-slate-900'>
                      {roundState?.missedObstacles ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Popup */}
      {scorePopup && (
        <div
          className='fixed z-50 pointer-events-none animate-bounce'
          style={{ left: `${scorePopup.x}%`, top: `${scorePopup.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className='bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-xl shadow-lg'>
            +{scorePopup.value}
          </div>
        </div>
      )}

      {/* Streak Milestone */}
      {showStreakMilestone && (
        <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
          <div className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-3xl font-black text-3xl shadow-2xl animate-pulse'>
            🔥 {streak} Streak! 🔥
          </div>
        </div>
      )}
    </GameContainer>
  );
});

export default ObstacleCourse;
