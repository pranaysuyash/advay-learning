import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { Mascot } from '../components/Mascot';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { getAlphabet } from '../data/alphabets';
import { useSettingsStore } from '../store';
import { useGameDrops } from '../hooks/useGameDrops';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { hitTestRects } from '../utils/hitTest';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
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

const getLetterColorClass = (color?: string) =>
  (color ? LETTER_COLOR_CLASS_MAP[color.toLowerCase()] : undefined) ??
  'text-pip-orange';

export const LetterHunt = memo(function LetterHuntComponent() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const webcamRef = useRef<Webcam>(null);
  const cameraAreaRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastSelectAtRef = useRef<number>(0);

  const [useMouseFallback, setUseMouseFallback] = useState<boolean>(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(
    null,
  );
  const [isPinching, setIsPinching] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
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
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('letter-hunt');

  // Get alphabet based on settings
  const alphabet = getAlphabet(settings.gameLanguage || 'en');

  // Initialize a round
  useEffect(() => {
    if (!gameStarted) return;

    const randomIndex = Math.floor(Math.random() * alphabet.letters.length);
    const target = alphabet.letters[randomIndex].char;
    setTargetLetter(target);

    // Announce the target letter with TTS
    if (ttsEnabled) {
      void speak(`Find the letter ${target}!`);
    }

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
  }, [round, gameStarted, alphabet, ttsEnabled, speak]);

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
        if (ttsEnabled) {
          void speak('Correct! Great job!');
        }
        setTimeout(nextRound, 1500);
      } else {
        playError();
        setFeedback({
          message: `Oops! That was ${option.char}, not ${targetLetter}`,
          type: 'error',
        });
        if (ttsEnabled) {
          void speak(`Try again! Find the letter ${targetLetter}!`);
        }
        setTimeout(nextRound, 1500);
      }
    },
    [targetLetter, timeLeft, playSuccess, playError, speak, ttsEnabled],
  );

  const nextRound = () => {
    setFeedback(null);
    setTimeLeft(60);

    if (round >= totalRounds) {
      playCelebration();
      setShowCelebration(true);
      if (ttsEnabled) {
        if (level >= 3) {
          void speak("You finished all levels! You're a letter expert!");
        } else {
          void speak('Level complete! Next level!');
        }
      }
      if (level >= 3) {
        setTimeout(() => {
          setShowCelebration(false);
          onGameComplete();
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
    setTimeLeft(60);
    setCursor(null);
    setHoveredOptionIndex(null);
    setIsPinching(false);
    lastSelectAtRef.current = 0;

    if (ttsEnabled) {
      void speak("Let's hunt for letters! Show me your hand!");
    }

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setLevel(1);
    setRound(1);
    setTimeLeft(60);
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

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking } =
    useGameHandTracking({
      gameName: 'LetterHunt',
      isRunning:
        gameStarted &&
        !gameCompleted &&
        !feedback &&
        !useMouseFallback,
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
    if (gameStarted && !gameCompleted && !useMouseFallback && !feedback && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [
    feedback,
    gameCompleted,
    gameStarted,
    isHandTrackingReady,
    isModelLoading,
    startTracking,
    useMouseFallback,
  ]);

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
  const cursorViewport =
    cursor && cameraAreaRef.current
      ? {
          x: cameraAreaRef.current.getBoundingClientRect().left + cursor.x,
          y: cameraAreaRef.current.getBoundingClientRect().top + cursor.y,
        }
      : null;

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
          isHandDetected={isHandTrackingReady}
          isPlaying={gameStarted && !gameCompleted}
        >
          <div className='relative w-full h-full bg-[#FFF8F0]'>
            {/* Camera Area */}
            <figure
              ref={cameraAreaRef}
              className='relative w-full h-full overflow-hidden m-0 border-3 border-[#F2CC8F] rounded-[2.5rem]'
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
                videoConstraints={{ facingMode: 'user' }}
              />

              <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-sm pointer-events-none' />

              {/* Top HUD */}
              <div className='absolute inset-x-0 top-0 p-6 flex flex-wrap gap-4 items-start justify-between pointer-events-none z-10'>
                <div className='bg-white/95 backdrop-blur-sm px-6 py-4 rounded-[1.5rem] border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
                  <div className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>Find this letter</div>
                  <div className='flex items-baseline gap-3'>
                    <div
                      className={`text-5xl font-black tracking-tight ${targetLetterColorClass}`}
                    >
                      {targetLetter}
                    </div>
                    <div className='text-lg font-bold text-advay-slate'>
                      {targetLetterMeta?.name}
                    </div>
                  </div>
                </div>

                <div className='bg-white/95 backdrop-blur-sm px-6 py-4 rounded-[1.5rem] border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-right'>
                  <div className='text-xl font-bold text-text-secondary mb-1'>Score: <span className='text-[#10B981] font-black'>{score}</span></div>
                  <div className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                    Level {level} · Round {round}/{totalRounds} · <span className='text-slate-400'>Take your time!</span>
                  </div>
                </div>
              </div>

              {/* Tracking status */}
              {!isHandTrackingReady && (
                <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'>
                  <div className='bg-white/95 backdrop-blur-sm px-8 py-4 rounded-full border-3 border-[#F2CC8F] text-advay-slate shadow-[0_4px_0_#E5B86E] font-bold text-lg'>
                    {isModelLoading
                      ? 'Loading hand tracking…'
                      : 'Hand tracking unavailable'}
                  </div>
                </div>
              )}

              {/* Cursor */}
              {cursorViewport && (
                <GameCursor
                  position={cursorViewport}
                  isPinching={isPinching}
                  isHandDetected={!useMouseFallback}
                  size={84}
                  highContrast={true}
                  icon='👆'
                />
              )}

              {/* Options overlay */}
              <div className='absolute inset-x-0 bottom-0 p-6 z-10'>
                <div className='bg-white/90 backdrop-blur-md rounded-[2rem] border-3 border-[#F2CC8F] p-6 shadow-[0_4px_0_#E5B86E]'>
                  <div className='text-sm font-bold text-slate-400 mb-4 flex items-center justify-between uppercase tracking-wider'>
                    <span>Point with your index finger · Pinch to select</span>
                    <span className='text-amber-500'>
                      {useMouseFallback ? 'Mouse fallback ON' : ''}
                    </span>
                  </div>
                  <div className='flex gap-2 justify-between'>
                    {options.map((option, idx) => {
                      const optionColorClass = getLetterColorClass(
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
                          className={`flex-1 min-w-0 rounded-[1.5rem] px-4 py-6 border-3 text-center transition-all min-h-[56px] ${hoveredOptionIndex === idx
                            ? `border-[#10B981] bg-emerald-50 scale-105 shadow-[0_4px_0_#E5B86E]`
                            : `border-[#F2CC8F] bg-white hover:bg-slate-50 hover:scale-105 shadow-[0_4px_0_#E5B86E]`
                            }`}
                        >
                          <div
                            className={`text-[3rem] tracking-tight font-black leading-none mb-2 ${optionColorClass}`}
                          >
                            {option.char}
                          </div>
                          <div className='text-sm font-bold text-text-secondary truncate'>
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
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-8 py-4 text-center font-bold text-xl pointer-events-none z-40 border-3 shadow-[0_4px_0_#E5B86E] ${feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-700'
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
        <section className='max-w-4xl mx-auto px-4 py-8 h-full flex flex-col'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex-1 flex flex-col'
          >
            {/* Header */}
            <header className='flex justify-between items-center mb-10'>
              <div>
                <h1 className='text-4xl md:text-5xl font-black text-advay-slate tracking-tight'>Letter Hunt</h1>
                <p className='text-text-secondary font-bold text-lg mt-2'>
                  Find the target letter among the options!
                </p>
              </div>

              <div className='text-right bg-white border-3 border-amber-100 rounded-[2rem] px-8 py-4 shadow-[0_4px_0_#E5B86E]'>
                <output className='block text-3xl font-black text-amber-500'>
                  Score: {score}
                </output>
                {gameStarted && (
                  <div className='flex items-center gap-4 text-sm font-bold text-slate-400 mt-2 uppercase tracking-wide'>
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
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-[0_4px_0_#E5B86E] flex-1 flex flex-col justify-center'>
              {!gameStarted ? (
                <div className='flex flex-col items-center justify-center py-6'>
                  <div className='w-32 h-32 mx-auto mb-8 bg-blue-50 border-3 border-blue-100 rounded-[2rem] p-6 flex items-center justify-center drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform'>
                    <img
                      src='/assets/images/letter-hunt.svg'
                      alt='Letter Hunt'
                      className='w-full h-full object-contain'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerText = '🔎';
                        e.currentTarget.parentElement!.className = 'w-32 h-32 mx-auto mb-8 bg-blue-50 border-3 border-blue-100 rounded-[2rem] p-6 flex items-center justify-center text-[4rem] drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform';
                      }}
                    />
                  </div>

                  <h2 className='text-3xl font-black text-advay-slate tracking-tight mb-4'>
                    Letter Hunt Challenge
                  </h2>
                  <p className='text-text-secondary font-bold text-lg mb-10 max-w-lg text-center leading-relaxed'>
                    Use your camera to control a cursor with your index finger,
                    then pinch (thumb + index) to select the matching letter.
                    Complete all rounds to advance to the next level.
                  </p>

                  {/* Standardized Menu Controls */}
                  {ttsEnabled && (
                    <VoiceInstructions
                      instructions={[
                        'Find the target letter.',
                        'Point with your finger.',
                        'Pinch to select!',
                      ]}
                      autoSpeak={true}
                      showReplayButton={true}
                      replayButtonPosition='bottom-right'
                    />
                  )}
                  <GameControls
                    controls={menuControls}
                    position='bottom-center'
                  />
                </div>
              ) : (
                /* Game Completed Screen */
                <div className='flex flex-col items-center justify-center py-8'>
                  <div className='w-32 h-32 mx-auto mb-8 bg-amber-50 border-3 border-amber-100 rounded-[2rem] p-6 flex items-center justify-center drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform text-amber-500'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>

                  <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-3'>
                    Congratulations!
                  </h2>
                  <p className='text-xl font-bold text-text-secondary mb-8'>You completed all levels!</p>
                  <div className='text-3xl font-black text-amber-500 mb-10 bg-amber-50 px-8 py-4 rounded-full border-3 border-amber-100'>
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
            <div className='bg-slate-50 border-3 border-[#F2CC8F] rounded-[2rem] p-8 shadow-[0_4px_0_#E5B86E]'>
              <h2 className='text-xl font-black text-advay-slate tracking-tight mb-4'>
                How to Play
              </h2>
              <ul className='space-y-3 text-advay-slate font-bold'>
                <li className='flex items-center gap-3'><span className='text-blue-500 text-lg'>•</span> A target letter appears on the camera screen</li>
                <li className='flex items-center gap-3'><span className='text-blue-500 text-lg'>•</span> Move your index finger to control the cursor</li>
                <li className='flex items-center gap-3'><span className='text-blue-500 text-lg'>•</span> Pinch (thumb + index) while hovering a tile to select it</li>
                <li className='flex items-center gap-3'><span className='text-blue-500 text-lg'>•</span> You have 30 seconds per round — faster answers score more</li>
                <li className='flex items-center gap-3'><span className='text-blue-500 text-lg'>•</span> Complete all 10 rounds to advance to the next level</li>
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
                ? 'Amazing! All levels complete!'
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
