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
import {
  pickWordForLevel,
  createLetterTargets,
  type LetterTarget,
} from '../games/wordBuilderLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  assetLoader,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';

/**
 * Kid-friendly haptic feedback utility
 * Uses longer, softer vibrations appropriate for children
 */
function triggerHaptic(type: 'success' | 'error' | 'celebration'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  // Kid-friendly patterns: longer, softer vibrations
  const patterns = {
    success: [50, 30, 50], // Gentle double tap
    error: [100, 50, 100], // Softer error buzz
    celebration: [100, 50, 100, 50, 200], // Joyful burst
  };

  navigator.vibrate(patterns[type]);
}

const HIT_RADIUS = 0.15; // Increased from 0.1 for kids' easier targeting
const MAX_LEVEL = 3;

// Touch-friendly sizing constants for kids
const CURSOR_SIZE = 64; // Increased from 40 (10 * 4) for easier visibility
const TARGET_SIZE = 120; // Increased from 80 for kids' fingers

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

export const WordBuilder = memo(function WordBuilderComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(90);
  const [word, setWord] = useState('');
  const [targets, setTargets] = useState<LetterTarget[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch letters to spell the word!');
  const [showCelebration, setShowCelebration] = useState(false);
  const [, setCompletedLetters] = useState<string[]>([]);

  const targetsRef = useRef<LetterTarget[]>(targets);
  const stepIndexRef = useRef(stepIndex);
  const wordRef = useRef(word);
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
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);
  useEffect(() => {
    wordRef.current = word;
  }, [word]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Asset preloading for premium polish
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await Promise.all([
          assetLoader.loadImages(Object.values(WEATHER_BACKGROUNDS)),
          assetLoader.loadSounds(Object.values(SOUND_ASSETS)),
        ]);
      } catch (error) {
        console.error('Asset preload failed (non-blocking):', error);
      }
    };

    void preloadAssets();
  }, []);

  // Cleanup level timeout on unmount (lifecycle hardening)
  useEffect(() => {
    return () => {
      if (levelTimeoutRef.current) {
        clearTimeout(levelTimeoutRef.current);
      }
    };
  }, []);

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

  const startNewWord = useCallback(() => {
    const newWord = pickWordForLevel(levelRef.current, random01);
    setWord(newWord);
    setStepIndex(0);
    setCompletedLetters([]);
    const distractors = Math.min(3, 2 + Math.floor(levelRef.current / 2));
    setTargets(createLetterTargets(newWord, distractors, random01));
    setFeedback(`Spell: ${newWord}`);
  }, []);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;
    startNewWord();
  }, [isPlaying, level, gameCompleted, startNewWord]);

  const completeWord = useCallback(() => {
    if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

    playCelebration();
    setShowCelebration(true);
    setScore((prev) => prev + 30 + timeLeftRef.current);

    // Slower pacing for kids - 3 seconds instead of 1.8s
    levelTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false);
      if (levelRef.current >= MAX_LEVEL) {
        setGameCompleted(true);
        setIsPlaying(false);
      } else {
        setLevel((prev) => prev + 1);
      }
      levelTimeoutRef.current = null;
    }, 3000);
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
      const currentWord = wordRef.current;
      const currentStep = stepIndexRef.current;
      const expectedLetter = currentWord[currentStep];
      if (!expectedLetter) return;

      const hit = findHitTarget(tip, activeTargets, HIT_RADIUS);

      if (!hit) {
        setFeedback('Move closer to a letter and pinch.');
        void playError();
        return;
      }

      if (hit.letter === expectedLetter) {
        void playPop();
        triggerHaptic('success');
        setCompletedLetters((prev) => [...prev, hit.letter]);
        setScore((prev) => prev + 15);

        const nextStep = currentStep + 1;
        setStepIndex(nextStep);

        if (nextStep >= currentWord.length) {
          setFeedback(`${currentWord} complete!`);
          triggerHaptic('celebration');
          completeWord();
        } else {
          setFeedback(`Great! Next: "${currentWord[nextStep]}"`);
        }
      } else {
        setFeedback(`That's "${hit.letter}". Find "${expectedLetter}".`);
        void playError();
        triggerHaptic('error');
      }
    },
    [completeWord, cursor, playError, playPop],
  );

  useHandTrackingRuntime({
    isRunning: isPlaying && !gameCompleted && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps: 30, // Increased from 24 for smoother hand tracking (less lag)
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
    setStepIndex(0);
    setCompletedLetters([]);
    setFeedback('Pinch letters to spell the word!');
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
    setStepIndex(0);
    setCompletedLetters([]);
    setCursor(null);
    setTimeLeft(90);
    setFeedback('Pinch letters to spell the word!');
  };

  const goHome = () => {
    assetLoader.playSound('pop', 0.3); // Audio feedback on navigation
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

  const expectedLetter = word[stepIndex];

  return (
    <GameContainer
      title='Word Builder'
      score={score}
      level={level}
      onHome={goHome}
    >
      <div
        className='absolute inset-0 bg-[#FFF8F0]'
        role='main'
        aria-label='Word Builder spelling game with gesture-based letter selection'
      >
        {/* Background layer for visual variety */}
        <div
          className='absolute inset-0 bg-cover bg-center opacity-8'
          style={{
            backgroundImage: `url(${WEATHER_BACKGROUNDS.rainy.url})`,
          }}
          aria-hidden='true'
        />

        <div className='absolute inset-4 md:inset-8 lg:inset-12 bg-white rounded-[3rem] border-[8px] border-slate-100 shadow-sm overflow-hidden'>
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            className='absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply'
            videoConstraints={{ facingMode: 'user' }}
          />

          <div className='absolute top-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-600 font-bold text-lg text-center min-w-[320px] z-20'>
            {feedback}
          </div>

          <div className='absolute top-8 right-8 px-6 py-3 rounded-[1.5rem] bg-amber-50 border-4 border-amber-100 text-amber-500 font-black text-xl shadow-sm z-20'>
            ⏰ <span className='text-amber-500'>{timeLeft}s</span>
          </div>

          {word && (
            <div className='absolute top-8 left-8 px-8 py-4 rounded-[2rem] bg-white border-4 border-slate-100 shadow-sm z-20'>
              <span className='font-black tracking-widest text-3xl flex gap-2'>
                {word.split('').map((letter, i) => (
                  <span
                    key={i}
                    className={
                      i < stepIndex
                        ? 'text-[#10B981]'
                        : i === stepIndex
                          ? 'text-[#F59E0B] border-b-4 border-[#F59E0B] pb-1'
                          : 'text-slate-300'
                    }
                  >
                    {i < stepIndex ? letter : '_'}
                  </span>
                ))}
              </span>
            </div>
          )}

          {targets.map((target) => {
            const isExpected =
              target.letter === expectedLetter && target.isCorrect;
            const isCompleted = target.isCorrect && target.orderIndex < stepIndex;
            return (
              <div
                key={target.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${isCompleted ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                style={{
                  left: `${target.position.x * 100}%`,
                  top: `${target.position.y * 100}%`,
                  width: `${TARGET_SIZE}px`,
                  height: `${TARGET_SIZE}px`,
                }}
                aria-hidden='true'
              >
                <div
                  className={`absolute inset-0 rounded-full border-[6px] flex items-center justify-center font-black text-5xl shadow-sm ${isExpected
                      ? 'border-[#F59E0B] bg-amber-50 text-[#F59E0B] z-10 scale-110'
                      : 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
                    }`}
                >
                  {target.letter}
                </div>
              </div>
            );
          })}

          {cursor && (
            <div
              className='absolute rounded-full border-4 border-[#3B82F6] bg-blue-100/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(59,130,246,0.5)] pointer-events-none z-30'
              style={{
                left: `${cursor.x * 100}%`,
                top: `${cursor.y * 100}%`,
                width: `${CURSOR_SIZE}px`,
                height: `${CURSOR_SIZE}px`,
              }}
              aria-hidden='true'
            />
          )}

          {!isPlaying && !gameCompleted && (
            <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex items-center justify-center rounded-[2.5rem]'>
              <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-sm'>
                <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🔤</div>
                <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4'>Word Builder</h2>
                <p className='text-slate-500 font-bold text-xl mb-10'>
                  Pinch the letters in the correct order!
                </p>
                <button
                  type='button'
                  onClick={startGame}
                  className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-sm text-2xl transition-transform hover:scale-[1.02] active:scale-95'
                >
                  Start Spelling
                </button>
              </div>
            </div>
          )}

          {gameCompleted && (
            <div className='absolute inset-0 bg-emerald-900/40 backdrop-blur-sm z-40 flex items-center justify-center rounded-[2.5rem]'>
              <div className='bg-white border-4 border-emerald-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-sm'>
                <div className='text-[6rem] mb-4 drop-shadow-sm'>🏆</div>
                <h2 className='text-4xl font-black text-[#10B981] mb-2'>
                  Word Master!
                </h2>
                <div className='inline-block bg-emerald-50 text-emerald-600 font-black text-2xl px-6 py-2 rounded-full mt-4'>
                  Score: {score}
                </div>
              </div>
            </div>
          )}
        </div>

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter={word}
          accuracy={100}
          message={`${word} spelled correctly!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default WordBuilder;
