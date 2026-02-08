import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { Mascot } from '../components/Mascot';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { getAlphabet } from '../data/alphabets';
import { useSettingsStore } from '../store';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { hitTestRects } from '../utils/hitTest';
import { useHandTracking } from '../hooks/useHandTracking';
import {
  useHandTrackingRuntime,
  type HandTrackingRuntimeMeta,
} from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

interface LetterOption {
  id: number;
  char: string;
  name: string;
  color: string;
  isTarget: boolean;
}

const LETTER_COLOR_CLASS_MAP: Record<string, string> = {
  '#ef4444': 'letter-color-ef4444',
  '#dc2626': 'letter-color-dc2626',
  '#3b82f6': 'letter-color-3b82f6',
  '#f59e0b': 'letter-color-f59e0b',
  '#10b981': 'letter-color-10b981',
  '#8b5cf6': 'letter-color-8b5cf6',
  '#06b6d4': 'letter-color-06b6d4',
  '#84cc16': 'letter-color-84cc16',
  '#f97316': 'letter-color-f97316',
  '#ec4899': 'letter-color-ec4899',
  '#eab308': 'letter-color-eab308',
  '#6366f1': 'letter-color-6366f1',
  '#64748b': 'letter-color-64748b',
  '#a16207': 'letter-color-a16207',
  '#a855f7': 'letter-color-a855f7',
  '#16a34a': 'letter-color-16a34a',
  '#1f2937': 'letter-color-1f2937',
  '#fff': 'letter-color-ffffff',
  '#ffffff': 'letter-color-ffffff',
};

const LETTER_BORDER_CLASS_MAP: Record<string, string> = {
  '#ef4444': 'letter-border-ef4444',
  '#dc2626': 'letter-border-dc2626',
  '#3b82f6': 'letter-border-3b82f6',
  '#f59e0b': 'letter-border-f59e0b',
  '#10b981': 'letter-border-10b981',
  '#8b5cf6': 'letter-border-8b5cf6',
  '#06b6d4': 'letter-border-06b6d4',
  '#84cc16': 'letter-border-84cc16',
  '#f97316': 'letter-border-f97316',
  '#ec4899': 'letter-border-ec4899',
  '#eab308': 'letter-border-eab308',
  '#6366f1': 'letter-border-6366f1',
  '#64748b': 'letter-border-64748b',
  '#a16207': 'letter-border-a16207',
  '#a855f7': 'letter-border-a855f7',
  '#16a34a': 'letter-border-16a34a',
  '#1f2937': 'letter-border-1f2937',
  '#fff': 'letter-border-ffffff',
  '#ffffff': 'letter-border-ffffff',
};

const getLetterColorClass = (color?: string) =>
  (color ? LETTER_COLOR_CLASS_MAP[color.toLowerCase()] : undefined) ??
  'text-pip-orange';

const getLetterBorderClass = (color?: string) =>
  (color ? LETTER_BORDER_CLASS_MAP[color.toLowerCase()] : undefined) ??
  'border-white/15';

export const LetterHunt = memo(function LetterHuntComponent() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const webcamRef = useRef<Webcam>(null);
  const cameraAreaRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastSelectAtRef = useRef<number>(0);

  // Use centralized hand tracking hook
  const {
    landmarker: handLandmarker,
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

  const [useMouseFallback, setUseMouseFallback] = useState<boolean>(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(
    null,
  );
  const [isPinching, setIsPinching] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [targetLetter, setTargetLetter] = useState<string>('');
  const [options, setOptions] = useState<LetterOption[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [round, setRound] = useState<number>(1);
  const [totalRounds] = useState<number>(10);
  const [showCelebration, setShowCelebration] = useState(false);

  // Sound effects
  const { playCelebration, playSuccess, playError } = useSoundEffects();

  // Get alphabet based on settings
  const alphabet = getAlphabet(settings.gameLanguage || 'en');

  // Initialize hand tracking when game starts
  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [
    gameStarted,
    isHandTrackingReady,
    isModelLoading,
    initializeHandTracking,
  ]);

  // Initialize a round
  useEffect(() => {
    if (!gameStarted) return;

    const randomIndex = Math.floor(Math.random() * alphabet.letters.length);
    const target = alphabet.letters[randomIndex].char;
    setTargetLetter(target);

    const newOptions: LetterOption[] = [];
    newOptions.push({
      id: 0,
      char: target,
      name: alphabet.letters[randomIndex].name,
      color: alphabet.letters[randomIndex].color,
      isTarget: true,
    });

    const usedIndices = new Set([randomIndex]);
    for (let i = 1; i < 5; i++) {
      let randomIdx;
      do {
        randomIdx = Math.floor(Math.random() * alphabet.letters.length);
      } while (usedIndices.has(randomIdx));

      usedIndices.add(randomIdx);
      newOptions.push({
        id: i,
        char: alphabet.letters[randomIdx].char,
        name: alphabet.letters[randomIdx].name,
        color: alphabet.letters[randomIdx].color,
        isTarget: false,
      });
    }

    setOptions(newOptions.sort(() => Math.random() - 0.5));
  }, [round, gameStarted, alphabet]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, gameCompleted]);

  const handleTimeout = () => {
    setFeedback({
      message: `Time's up! The target was ${targetLetter}`,
      type: 'error',
    });
    setTimeout(nextRound, 1500);
  };

  const handleSelectOption = useCallback(
    (option: LetterOption) => {
      if (option.isTarget) {
        playSuccess();
        setScore((prev) => prev + timeLeft * 5);
        setFeedback({ message: 'Correct! Great job!', type: 'success' });
        setTimeout(nextRound, 1500);
      } else {
        playError();
        setFeedback({
          message: `Oops! That was ${option.char}, not ${targetLetter}`,
          type: 'error',
        });
        setTimeout(nextRound, 1500);
      }
    },
    [targetLetter, timeLeft, playSuccess, playError],
  );

  const nextRound = () => {
    setFeedback(null);
    setTimeLeft(30);

    if (round >= totalRounds) {
      playCelebration();
      setShowCelebration(true);
      if (level >= 3) {
        setTimeout(() => {
          setShowCelebration(false);
          setGameCompleted(true);
        }, 2500);
      } else {
        setTimeout(() => {
          setShowCelebration(false);
          setLevel((prev) => prev + 1);
          setRound(1);
        }, 2500);
      }
    } else {
      setRound((prev) => prev + 1);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(30);
    setCursor(null);
    setHoveredOptionIndex(null);
    setIsPinching(false);
    lastSelectAtRef.current = 0;

    if (!isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(30);
    setFeedback(null);
    setCursor(null);
    setHoveredOptionIndex(null);
    setIsPinching(false);
    lastSelectAtRef.current = 0;
  };

  const goToHome = () => {
    navigate('/dashboard');
  };

  const handleTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const container = cameraAreaRef.current;
      if (!container) return;

      const tip = frame.indexTip;
      if (!tip) {
        if (cursor !== null) setCursor(null);
        if (hoveredOptionIndex !== null) setHoveredOptionIndex(null);
        if (isPinching) setIsPinching(false);
        return;
      }

      const rect = container.getBoundingClientRect();
      const localX = tip.x * rect.width;
      const localY = tip.y * rect.height;
      const nextCursor = { x: localX, y: localY };
      setCursor(nextCursor);

      const rects = optionRefs.current
        .map((el) => (el ? el.getBoundingClientRect() : null))
        .filter(Boolean) as DOMRect[];
      const hitIndex = hitTestRects(
        { x: rect.left + localX, y: rect.top + localY },
        rects,
      );
      if (hitIndex !== hoveredOptionIndex) setHoveredOptionIndex(hitIndex);

      if (frame.pinch.state.isPinching !== isPinching) {
        setIsPinching(frame.pinch.state.isPinching);
      }

      if (frame.pinch.transition === 'start') {
        const now = Date.now();
        if (
          now - lastSelectAtRef.current > 450 &&
          hitIndex != null &&
          options[hitIndex]
        ) {
          lastSelectAtRef.current = now;
          handleSelectOption(options[hitIndex]);
        }
      }
    },
    [cursor, hoveredOptionIndex, isPinching, options, handleSelectOption],
  );

  useHandTrackingRuntime({
    isRunning:
      gameStarted &&
      !gameCompleted &&
      !feedback &&
      !useMouseFallback &&
      isHandTrackingReady,
    handLandmarker,
    webcamRef,
    targetFps: 30,
    onFrame: handleTrackingFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
      if (hoveredOptionIndex !== null) setHoveredOptionIndex(null);
      if (isPinching) setIsPinching(false);
    },
  });

  useEffect(() => {
    if (!useMouseFallback) return;
    setCursor(null);
    setHoveredOptionIndex(null);
    setIsPinching(false);
  }, [useMouseFallback]);

  const targetLetterMeta = alphabet.letters.find(
    (letter) => letter.char === targetLetter,
  );
  const targetLetterColorClass = getLetterColorClass(targetLetterMeta?.color);

  // Menu controls
  const menuControls: GameControl[] = [
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goToHome,
      variant: 'primary',
    },
    {
      id: 'start',
      icon: 'play',
      label: 'Start Game',
      onClick: startGame,
      variant: 'success',
    },
  ];

  // Game controls
  const gameControls: GameControl[] = [
    {
      id: 'mouse-fallback',
      icon: useMouseFallback ? 'mouse-pointer' : 'hand',
      label: useMouseFallback ? 'Mouse On' : 'Hand Mode',
      onClick: () => setUseMouseFallback(!useMouseFallback),
      variant: 'primary',
      isActive: !useMouseFallback,
    },
    {
      id: 'reset',
      icon: 'rotate-ccw',
      label: 'Reset',
      onClick: resetGame,
      variant: 'danger',
    },
  ];

  // Completion controls
  const completionControls: GameControl[] = [
    {
      id: 'play-again',
      icon: 'rotate-ccw',
      label: 'Play Again',
      onClick: resetGame,
      variant: 'primary',
    },
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goToHome,
      variant: 'secondary',
    },
  ];

  return (
    <>
      {/* Full Screen Game Mode */}
      {gameStarted && !gameCompleted ? (
        <GameContainer
          title='Letter Hunt'
          score={score}
          level={level}
          onHome={goToHome}
        >
          <div className='relative w-full h-full bg-black'>
            {/* Camera Area */}
            <figure
              ref={cameraAreaRef}
              className='relative w-full h-full overflow-hidden m-0'
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className='h-full w-full object-cover'
                videoConstraints={{ facingMode: 'user' }}
              />

              {/* Top HUD */}
              <div className='absolute inset-x-0 top-0 p-4 flex items-start justify-between pointer-events-none'>
                <div className='bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-white/30 text-white'>
                  <div className='text-xs opacity-80'>Find this letter</div>
                  <div className='flex items-baseline gap-2'>
                    <div
                      className={`text-4xl font-extrabold leading-none ${targetLetterColorClass}`}
                    >
                      {targetLetter}
                    </div>
                    <div className='text-sm opacity-90'>
                      {targetLetterMeta?.name}
                    </div>
                  </div>
                </div>

                <div className='bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-white/20 text-white text-right'>
                  <div className='text-sm font-bold'>Score: {score}</div>
                  <div className='text-xs opacity-80'>
                    Level {level} · Round {round}/{totalRounds} · {timeLeft}s
                  </div>
                </div>
              </div>

              {/* Tracking status */}
              {!isHandTrackingReady && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                  <div className='bg-black/60 backdrop-blur px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold'>
                    {isModelLoading
                      ? 'Loading hand tracking…'
                      : 'Hand tracking unavailable'}
                  </div>
                </div>
              )}

              {/* Cursor */}
              {cursor && (
                <motion.div
                  className='absolute w-4 h-4 rounded-full bg-pip-orange shadow-soft-lg border-2 border-white/80 pointer-events-none z-30'
                  animate={{ x: cursor.x - 8, y: cursor.y - 8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Options overlay */}
              <div className='absolute inset-x-0 bottom-0 p-4'>
                <div className='bg-black/45 backdrop-blur rounded-2xl border border-white/15 p-3'>
                  <div className='text-xs text-white/80 mb-2 flex items-center justify-between'>
                    <span>Point with your index finger · Pinch to select</span>
                    <span className='opacity-80'>
                      {useMouseFallback ? 'Mouse fallback ON' : ''}
                    </span>
                  </div>
                  <div className='flex gap-2 justify-between'>
                    {options.map((option, idx) => {
                      const optionColorClass = getLetterColorClass(
                        option.color,
                      );
                      const optionBorderClass = getLetterBorderClass(
                        option.color,
                      );

                      return (
                        <button
                          key={option.id}
                          ref={(el) => {
                            optionRefs.current[idx] = el;
                          }}
                          type='button'
                          onClick={
                            useMouseFallback || !isHandTrackingReady
                              ? () => handleSelectOption(option)
                              : undefined
                          }
                          className={`flex-1 min-w-0 rounded-xl px-2 py-3 border text-center transition min-h-[56px] ${
                            hoveredOptionIndex === idx
                              ? 'border-white/80 bg-white/15 ring-2 ring-pip-orange/70'
                              : `${optionBorderClass} bg-white/10 hover:bg-white/15`
                          }`}
                        >
                          <div
                            className={`text-3xl font-extrabold leading-none ${optionColorClass}`}
                          >
                            {option.char}
                          </div>
                          <div className='text-[11px] text-white/80 truncate'>
                            {option.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl p-4 text-center font-semibold pointer-events-none z-40 ${
                    feedback.type === 'success'
                      ? 'bg-success/90 border border-success text-white'
                      : 'bg-error/90 border border-error text-white'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              {/* Mascot */}
              <div className='absolute bottom-4 left-4 z-20'>
                <Mascot
                  state={
                    feedback?.type === 'success'
                      ? 'happy'
                      : feedback?.type === 'error'
                        ? 'thinking'
                        : 'idle'
                  }
                  message={
                    feedback?.message || `Find the letter "${targetLetter}"!`
                  }
                />
              </div>

              {/* Standardized Game Controls */}
              <GameControls controls={gameControls} position='top-right' />
            </figure>
          </div>
        </GameContainer>
      ) : (
        /* Menu / Completion Screen */
        <section className='max-w-7xl mx-auto px-4 py-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <header className='flex justify-between items-center mb-6'>
              <div>
                <h1 className='text-3xl font-bold'>Letter Hunt</h1>
                <p className='text-white/60'>
                  Find the target letter among the options!
                </p>
              </div>

              <div className='text-right'>
                <output className='block text-2xl font-bold'>
                  Score: {score}
                </output>
                {gameStarted && (
                  <div className='flex items-center gap-4 text-sm text-white/60'>
                    <span>Level: {level}</span>
                    <span>
                      Round: {round}/{totalRounds}
                    </span>
                    <span>Time: {timeLeft}s</span>
                  </div>
                )}
              </div>
            </header>

            {/* Game Area */}
            <div className='bg-white border border-border rounded-xl p-6 mb-6 shadow-soft'>
              {!gameStarted ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='w-24 h-24 mx-auto mb-6'>
                    <img
                      src='/assets/images/letter-hunt.svg'
                      alt='Letter Hunt'
                      className='w-full h-full object-contain'
                    />
                  </div>

                  <h2 className='text-2xl font-semibold mb-4'>
                    Letter Hunt Challenge
                  </h2>
                  <p className='text-text-secondary mb-6 max-w-md text-center'>
                    Use your camera to control a cursor with your index finger,
                    then pinch (thumb + index) to select the matching letter.
                    Complete all rounds to advance to the next level.
                  </p>

                  {/* Standardized Menu Controls */}
                  <GameControls
                    controls={menuControls}
                    position='bottom-center'
                  />
                </div>
              ) : (
                /* Game Completed Screen */
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='w-24 h-24 mx-auto mb-6'>
                    <img
                      src='/assets/images/trophy.svg'
                      alt='Trophy'
                      className='w-full h-full object-contain'
                    />
                  </div>

                  <h2 className='text-3xl font-bold text-green-400 mb-2'>
                    Congratulations!
                  </h2>
                  <p className='text-xl mb-6'>You completed all levels!</p>
                  <div className='text-2xl font-bold mb-8'>
                    Final Score: {score}
                  </div>

                  {/* Standardized Completion Controls */}
                  <GameControls
                    controls={completionControls}
                    position='bottom-center'
                  />
                </div>
              )}
            </div>

            {/* Game Instructions */}
            <div className='bg-white border border-border rounded-xl p-6 shadow-soft'>
              <h2 className='text-lg font-semibold mb-3 text-advay-slate'>
                How to Play
              </h2>
              <ul className='space-y-2 text-text-secondary text-sm'>
                <li>• A target letter appears on the camera screen</li>
                <li>• Move your index finger to control the cursor</li>
                <li>
                  • Pinch (thumb + index) while hovering a tile to select it
                </li>
                <li>
                  • You have 30 seconds per round — faster answers score more
                </li>
                <li>• Complete all 10 rounds to advance to the next level</li>
              </ul>
            </div>
          </motion.div>

          {/* Celebration Overlay */}
          <CelebrationOverlay
            show={showCelebration}
            letter={targetLetter}
            accuracy={100}
            message={
              level >= 3
                ? 'Amazing! All levels complete! 🏆'
                : `Level ${level} Complete!`
            }
            onComplete={() => setShowCelebration(false)}
          />
        </section>
      )}
    </>
  );
});

export default LetterHunt;
