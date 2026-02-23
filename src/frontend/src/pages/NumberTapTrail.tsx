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
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { findHitTarget } from '../games/hitTarget';
import { pickSpacedPoints } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

interface TrailTarget {
  id: number;
  value: number;
  position: Point;
  cleared: boolean;
}

const HIT_RADIUS = 0.1;
const MAX_LEVEL = 6;

function createRoundTargets(level: number): TrailTarget[] {
  const count = Math.min(4 + level, 9);
  const points = pickSpacedPoints(count, 0.2, 0.14, randomFloat01);

  return points.map((point, index) => ({
    id: index,
    value: index + 1,
    position: point.position,
    cleared: false,
  }));
}

export const NumberTapTrail = memo(function NumberTapTrailComponent() {
  const navigate = useNavigate();
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

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

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('number-tap-trail');

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
    if (ttsEnabled) {
      void speak(`Find the numbers in order. Start with one!`);
    }
  }, [isPlaying, level, gameCompleted]);

  const completeLevel = useCallback(() => {
    if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

    playCelebration();
    setShowCelebration(true);
    if (ttsEnabled) {
      if (levelRef.current >= MAX_LEVEL) {
        void speak('Amazing! You completed all levels!');
      } else {
        void speak('Level complete! Great counting!');
      }
    }
    setScore((prev) => prev + 35 + timeLeftRef.current * 2);

    levelTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false);
      if (levelRef.current >= MAX_LEVEL) {
        onGameComplete();
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
        if (ttsEnabled) {
          void speak(`That is ${hit.value}. Look for ${expected.value}!`);
        }
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
        if (ttsEnabled) {
          void speak(`Great! Now find ${activeTargets[nextIndex].value}!`);
        }
      }
    },
    [completeLevel, cursor, playError, playPop, speak, ttsEnabled],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } =
    useGameHandTracking({
      gameName: 'NumberTapTrail',
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
    setTimeLeft(90);
    setFeedback('Pinch numbers in order: 1, 2, 3...');
    setCursor(null);
    setIsPlaying(true);
    if (ttsEnabled) {
      void speak('Pinch the numbers in order from one to ten!');
    }
    await playStart();

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
    <GameContainer title='Number Tap Trail' score={score} level={level} onHome={goHome} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
      <div ref={gameAreaRef} className='absolute inset-0 bg-blue-50 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-blue-200/40 pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[300px]'>
          {feedback}
        </div>

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-slate-400 font-bold text-lg'>
          Take your time! 🌈
        </div>

        {expectedTarget && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-text-secondary font-bold text-lg flex items-center gap-3'>
            Next: <span className='flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-[#10B981] font-black'>{expectedTarget.value}</span>
          </div>
        )}

        {targets.map((target) => (
          <div
            key={target.id}
            className='absolute w-[5.5rem] h-[5.5rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none'
            style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
            aria-hidden='true'
          >
            <div
              className={`absolute inset-0 rounded-full border-[6px] flex items-center justify-center font-black text-3xl shadow-[0_4px_0_#E5B86E] transition-all duration-300 ${target.cleared
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-500 scale-110'
                  : 'border-[#3B82F6] bg-white text-[#3B82F6] hover:scale-105'
                }`}
            >
              {target.value}
            </div>
          </div>
        ))}

        {cursor && (
          <CursorEmbodiment
            gameName='NumberTapTrail'
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={84}
            icon='👆'
            state={isPlaying ? 'tracking' : 'idle'}
          />
        )}

        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
              <div className='text-[5rem] mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform'>🔢</div>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>Number Tap Trail</h2>
              <p className='text-text-secondary font-bold text-xl mb-10'>
                Find and pinch the numbers in order from 1 to 10!
              </p>
              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Find the numbers in order.',
                    'Start with number one.',
                    'Pinch each number!',
                  ]}
                  autoSpeak={true}
                  showReplayButton={true}
                  replayButtonPosition='bottom-right'
                />
              )}
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-[0_4px_0_#E5B86E] text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Number Trail
              </button>
            </div>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-6'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[80%] shadow-[0_4px_0_#E5B86E]'>
              <div className='text-[5rem] mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform'>🌟</div>
              <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-2'>Trail Complete!</h2>
              <p className='text-xl font-bold text-text-secondary mb-6'>Amazing job finding them all!</p>
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
