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

const HIT_RADIUS = 0.1;
const MAX_LEVEL = 3;

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

  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { stepIndexRef.current = stepIndex; }, [stepIndex]);
  useEffect(() => { wordRef.current = word; }, [word]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

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
        setCompletedLetters((prev) => [...prev, hit.letter]);
        setScore((prev) => prev + 15);

        const nextStep = currentStep + 1;
        setStepIndex(nextStep);

        if (nextStep >= currentWord.length) {
          setFeedback(`${currentWord} complete!`);
          completeWord();
        } else {
          setFeedback(`Great! Next: "${currentWord[nextStep]}"`);
        }
      } else {
        setFeedback(`That's "${hit.letter}". Find "${expectedLetter}".`);
        void playError();
      }
    },
    [completeWord, cursor, playError, playPop],
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
    <GameContainer title='Word Builder' score={score} level={level} onHome={goHome}>
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

        {word && (
          <div className='absolute top-16 left-4 px-4 py-2 rounded-xl bg-black/55 text-white text-sm border border-white/20'>
            <span className='font-bold text-emerald-300 tracking-widest text-lg'>
              {word.split('').map((letter, i) => (
                <span
                  key={i}
                  className={i < stepIndex ? 'text-emerald-300' : i === stepIndex ? 'text-amber-300 underline' : 'text-white/40'}
                >
                  {i < stepIndex ? letter : '_'}
                </span>
              ))}
            </span>
          </div>
        )}

        {targets.map((target) => {
          const isExpected = target.letter === expectedLetter && target.isCorrect;
          const isCompleted = target.isCorrect && target.orderIndex < stepIndex;
          return (
            <div
              key={target.id}
              className='absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
              style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
              aria-hidden='true'
            >
              <div
                className={`absolute inset-0 rounded-full border-4 flex items-center justify-center font-black text-2xl ${
                  isCompleted
                    ? 'border-emerald-300/40 bg-emerald-300/20 text-emerald-200/40'
                    : isExpected
                      ? 'border-amber-300 bg-amber-300/35 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                      : 'border-sky-300 bg-sky-300/30 text-white'
                }`}
              >
                {target.letter}
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
              Start Word Builder
            </button>
          </div>
        )}

        {gameCompleted && (
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3'>
            <h2 className='text-3xl font-black text-emerald-300'>Word Master!</h2>
            <p className='text-white/90'>Final Score: {score}</p>
          </div>
        )}

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
