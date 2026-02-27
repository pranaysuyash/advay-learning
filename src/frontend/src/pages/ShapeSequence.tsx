import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { CursorEmbodiment } from '../components/game/CursorEmbodiment';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { findHitTarget } from '../games/hitTarget';
import { pickSpacedPoints } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

interface SequenceTarget {
  id: number;
  shape: string;
  position: Point;
}

const SHAPES = ['◯', '□', '△', '◇', '☆', '✦'] as const;
const HIT_RADIUS = 0.1;
const MAX_LEVEL = 6;

function createSequenceRound(level: number): {
  targets: SequenceTarget[];
  order: number[];
} {
  const targetCount = 4;
  const points = pickSpacedPoints(targetCount, 0.25, 0.16, randomFloat01);
  const availableShapes = [...SHAPES].sort(() => randomFloat01() - 0.5);

  const targets: SequenceTarget[] = points.map((point, index) => ({
    id: index,
    shape: availableShapes[index] ?? SHAPES[index % SHAPES.length],
    position: point.position,
  }));

  const shuffledIds = targets.map((target) => target.id).sort(() => randomFloat01() - 0.5);
  const orderLength = Math.min(2 + level, targetCount);

  return {
    targets,
    order: shuffledIds.slice(0, orderLength),
  };
}

export const ShapeSequence = memo(function ShapeSequenceComponent() {
  const navigate = useNavigate();
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
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

  const { playPop, playError, playFanfare: playCelebration, playPop: playStart } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('shape-sequence');

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
    if (ttsEnabled) {
      void speak('Pinch the shapes in the shown order!');
    }
  }, [isPlaying, level, gameCompleted]);

  const completeLevel = useCallback(() => {
    if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

    playCelebration();
    setShowCelebration(true);
    setScore((prev) => prev + 30 + timeLeftRef.current * 2);

    levelTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false);
      if (levelRef.current >= MAX_LEVEL) {
        onGameComplete();
        setGameCompleted(true);
        setIsPlaying(false);
        if (ttsEnabled) {
          void speak("You finished all levels! You're a shape expert!");
        }
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
        if (ttsEnabled) {
          void speak('Pinch a shape!');
        }
        void playError();
        return;
      }

      const expectedId = orderRef.current[stepIndexRef.current];
      if (typeof expectedId !== 'number') return;

      if (hit.id !== expectedId) {
        setStepIndex(0);
        setFeedback('Wrong order. Sequence reset to start.');
        if (ttsEnabled) {
          void speak('Oops! Start again from the first shape!');
        }
        void playError();
        return;
      }

      void playPop();
      setScore((prev) => prev + 10);
      const nextStep = stepIndexRef.current + 1;
      setStepIndex(nextStep);

      if (nextStep >= orderRef.current.length) {
        setFeedback(`Level ${levelRef.current} sequence complete!`);
        if (ttsEnabled) {
          void speak(`Level ${levelRef.current} complete! Amazing!`);
        }
        completeLevel();
      } else {
        setFeedback(`Great! Next shape ${nextStep + 1}/${orderRef.current.length}.`);
        if (ttsEnabled) {
          void speak('Great! Next shape!');
        }
      }
    },
    [completeLevel, cursor, playError, playPop, speak, ttsEnabled],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } =
    useGameHandTracking({
      gameName: 'ShapeSequence',
      targetFps: 24,
      isRunning: isPlaying && !gameCompleted,
      onFrame: handleFrame,
      onNoVideoFrame: () => {
        if (cursor !== null) setCursor(null);
      },
    });

  useEffect(() => {
    if (isPlaying && !gameCompleted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameCompleted, isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  const startGame = async () => {
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setFeedback('Pinch the shapes in the shown order.');
    setCursor(null);
    setIsPlaying(true);
    if (ttsEnabled) {
      void speak('Pinch the shapes in the shown order!');
    }
    playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
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
    setTimeLeft(60);
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
    <GameContainer title='Shape Sequence' score={score} level={level} onHome={goHome} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
      <div ref={gameAreaRef} className='absolute inset-0 bg-blue-50 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-sm pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-text-secondary font-bold text-lg'>
          <span className='text-slate-400'>Take your time!</span>
        </div>

        <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-text-secondary font-bold text-lg flex items-center gap-3'>
          Sequence:
          <span className='font-black text-2xl tracking-widest text-[#D946EF] drop-shadow-[0_4px_0_#E5B86E] ml-2'>
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
                className={`absolute inset-0 rounded-[2rem] border-[6px] shadow-[0_4px_0_#E5B86E] flex items-center justify-center font-black text-5xl transition-colors ${isExpected
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
          <CursorEmbodiment
            gameName='ShapeSequence'
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={84}
            icon='point'
            state={isPlaying ? 'tracking' : 'idle'}
          />
        )}

        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E]'>
              <div className='w-20 h-20 mx-auto mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform flex items-center justify-center bg-blue-100 rounded-3xl border-4 border-blue-200'>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 20-1.25-2.5L6 18" /><path d="M10 4 8.5 6.5 6 6" /><path d="m14 20 1.25-2.5L18 18" /><path d="m14 4 1.25 2.5L18 6" /><path d="M17 10h-6" /><path d="M17 14h-6" /></svg>
              </div>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>Shape Sequence</h2>
              <p className='text-text-secondary font-bold text-xl mb-10'>
                Pinch the shapes in the shown order.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-[0_4px_0_#E5B86E] text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Shape Sequence
              </button>

              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Pinch the shapes in the shown order.',
                    'Follow the sequence!',
                    'Start from the first shape.',
                  ]}
                  autoSpeak={true}
                  showReplayButton={true}
                  replayButtonPosition='bottom-right'
                />
              )}
            </div>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[80%] shadow-[0_4px_0_#E5B86E]'>
              <div className='w-20 h-20 mx-auto mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform flex items-center justify-center bg-amber-100 rounded-3xl border-4 border-amber-200'>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
              </div>
              <h2 className='text-4xl font-black text-[#D946EF] tracking-tight mb-2'>Sequence Master!</h2>
              <p className='text-xl font-bold text-text-secondary mb-8'>Incredible job memorizing the order!</p>
              <div className='inline-block bg-amber-50 border-3 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
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
