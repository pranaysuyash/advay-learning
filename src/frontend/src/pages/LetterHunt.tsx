import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { UIIcon } from '../components/ui/Icon';
import { Mascot } from '../components/Mascot';
import { getAlphabet } from '../data/alphabets';
import { useSettingsStore } from '../store';
import { hitTestRects } from '../utils/hitTest';
// Centralized hand tracking
import { useHandTracking } from '../hooks/useHandTracking';
import { useGameLoop } from '../hooks/useGameLoop';
import { detectPinch, createDefaultPinchState } from '../utils/pinchDetection';
import type { PinchState } from '../types/tracking';

interface LetterOption {
  id: number;
  char: string;
  name: string;
  color: string;
  isTarget: boolean;
}

export const LetterHunt = memo(function LetterHuntComponent() {
  const navigate = useNavigate();
  const settings = useSettingsStore();
  const webcamRef = useRef<Webcam>(null);
  const cameraAreaRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pinchStateRef = useRef<PinchState>(createDefaultPinchState());
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
  // Cursor coordinates are local to the camera container (CSS pixels).
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(
    null,
  );
  const [isPinching, setIsPinching] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds per level
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [targetLetter, setTargetLetter] = useState<string>('');
  const [options, setOptions] = useState<LetterOption[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [round, setRound] = useState<number>(1);
  const [totalRounds] = useState<number>(10); // 10 rounds per level

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

    // Select a random target letter
    const randomIndex = Math.floor(Math.random() * alphabet.letters.length);
    const target = alphabet.letters[randomIndex].char;
    setTargetLetter(target);

    // Create options - 1 target + 4 distractors
    const newOptions: LetterOption[] = [];

    // Add target letter
    newOptions.push({
      id: 0,
      char: target,
      name: alphabet.letters[randomIndex].name,
      color: alphabet.letters[randomIndex].color,
      isTarget: true,
    });

    // Add 4 distractors
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

    // Shuffle options
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
        // Correct answer
        setScore((prev) => prev + timeLeft * 5); // More points for faster answers
        setFeedback({ message: 'Correct! Great job!', type: 'success' });
        setTimeout(nextRound, 1500);
      } else {
        // Wrong answer
        setFeedback({
          message: `Oops! That was ${option.char}, not ${targetLetter}`,
          type: 'error',
        });
        setTimeout(nextRound, 1500);
      }
    },
    [targetLetter, timeLeft],
  );

  const nextRound = () => {
    setFeedback(null);
    setTimeLeft(30);

    if (round >= totalRounds) {
      // Level completed
      if (level >= 3) {
        // Game completed
        setGameCompleted(true);
      } else {
        // Move to next level
        setLevel((prev) => prev + 1);
        setRound(1);
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
    pinchStateRef.current = createDefaultPinchState();
    lastSelectAtRef.current = 0;

    // Camera-first: initialize tracking on game start.
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
    pinchStateRef.current = createDefaultPinchState();
    lastSelectAtRef.current = 0;
  };

  const goToHome = () => {
    navigate('/dashboard');
  };

  // Game loop using centralized hook
  useGameLoop({
    isRunning: gameStarted && !gameCompleted && !feedback,
    targetFps: 30,
    onFrame: useCallback(() => {
      const webcam = webcamRef.current;
      const container = cameraAreaRef.current;
      const video = webcam?.video;

      if (!container || !video || !handLandmarker) return;
      if (video.readyState < 2 || video.videoWidth === 0) return;

      let results;
      try {
        results = handLandmarker.detectForVideo(video, performance.now());
      } catch {
        return;
      }

      const landmarks = results?.landmarks?.[0];
      if (!landmarks || landmarks.length < 9) {
        if (cursor !== null) setCursor(null);
        if (hoveredOptionIndex !== null) setHoveredOptionIndex(null);
        if (isPinching) {
          setIsPinching(false);
          pinchStateRef.current = createDefaultPinchState();
        }
        return;
      }

      const rect = container.getBoundingClientRect();
      const indexTip = landmarks[8];

      const xNorm = indexTip?.x ?? 0.5;
      const yNorm = indexTip?.y ?? 0.5;

      // Mirror X to match the mirrored webcam view.
      const localX = (1 - xNorm) * rect.width;
      const localY = yNorm * rect.height;
      const nextCursor = { x: localX, y: localY };
      setCursor(nextCursor);

      // Determine which option tile is currently "hovered" by the cursor.
      const rects = optionRefs.current
        .map((el) => (el ? el.getBoundingClientRect() : null))
        .filter(Boolean) as DOMRect[];
      const hitIndex = hitTestRects(
        { x: rect.left + localX, y: rect.top + localY },
        rects,
      );
      if (hitIndex !== hoveredOptionIndex) setHoveredOptionIndex(hitIndex);

      // Pinch detection with hysteresis
      const pinchResult = detectPinch(landmarks, pinchStateRef.current);
      pinchStateRef.current = pinchResult.state;

      if (pinchResult.state.isPinching !== isPinching) {
        setIsPinching(pinchResult.state.isPinching);
      }

      // Select on pinch "start" transition (debounced).
      if (pinchResult.transition === 'start') {
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
    }, [
      handLandmarker,
      cursor,
      hoveredOptionIndex,
      isPinching,
      options,
      handleSelectOption,
    ]),
  });

  return (
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
            <output className='block text-2xl font-bold'>Score: {score}</output>
            <div className='flex items-center gap-4 text-sm text-white/60'>
              <span>Level: {level}</span>
              <span>
                Round: {round}/{totalRounds}
              </span>
              <span>Time: {timeLeft}s</span>
            </div>
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
                Use your camera to control a cursor with your index finger, then
                pinch (thumb + index) to select the matching letter. Complete
                all rounds to advance to the next level.
              </p>

              <div className='flex gap-4'>
                <button
                  onClick={goToHome}
                  className='px-6 py-3 bg-white border border-border rounded-lg font-semibold transition shadow-soft flex items-center gap-2 text-text-primary hover:bg-bg-tertiary'
                >
                  <UIIcon name='home' size={20} />
                  Home
                </button>
                <button
                  onClick={startGame}
                  className='px-8 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition shadow-soft hover:shadow-soft-lg'
                >
                  Start Game
                </button>
              </div>
            </div>
          ) : gameCompleted ? (
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

              <div className='flex gap-4'>
                <button
                  onClick={resetGame}
                  className='px-6 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition shadow-soft hover:shadow-soft-lg'
                >
                  Play Again
                </button>
                <button
                  onClick={goToHome}
                  className='px-6 py-3 bg-white border border-border rounded-lg font-semibold transition shadow-soft text-text-primary hover:bg-bg-tertiary'
                >
                  Home
                </button>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Camera hero (main mechanic) */}
              <figure
                ref={cameraAreaRef}
                className='relative overflow-hidden rounded-2xl border border-border bg-black shadow-soft m-0'
              >
                <div className='aspect-video w-full'>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored
                    className='h-full w-full object-cover'
                    videoConstraints={{ facingMode: 'user' }}
                  />
                </div>

                {/* Top HUD */}
                <div className='absolute inset-x-0 top-0 p-4 flex items-start justify-between'>
                  <div className='bg-black/50 backdrop-blur px-3 py-2 rounded-xl border border-white/30 text-white'>
                    <div className='text-xs opacity-80'>Find this letter</div>
                    <div className='flex items-baseline gap-2'>
                      <div
                        className='text-4xl font-extrabold leading-none'
                        style={{
                          color:
                            alphabet.letters.find(
                              (l) => l.char === targetLetter,
                            )?.color ?? '#E85D04',
                        }}
                      >
                        {targetLetter}
                      </div>
                      <div className='text-sm opacity-90'>
                        {
                          alphabet.letters.find((l) => l.char === targetLetter)
                            ?.name
                        }
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
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='bg-black/60 backdrop-blur px-4 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold'>
                      {isModelLoading
                        ? 'Loading hand tracking…'
                        : 'Hand tracking unavailable. Enable mouse fallback below.'}
                    </div>
                  </div>
                )}

                {/* Cursor */}
                {cursor && (
                  <div
                    className='absolute w-4 h-4 rounded-full bg-pip-orange shadow-soft-lg border-2 border-white/80'
                    style={{
                      left: cursor.x - 8,
                      top: cursor.y - 8,
                    }}
                  />
                )}

                {/* Options overlay */}
                <div className='absolute inset-x-0 bottom-0 p-4'>
                  <div className='bg-black/45 backdrop-blur rounded-2xl border border-white/15 p-3'>
                    <div className='text-xs text-white/80 mb-2 flex items-center justify-between'>
                      <span>
                        Point with your index finger · Pinch to select
                      </span>
                      <span className='opacity-80'>
                        {useMouseFallback ? 'Mouse fallback ON' : ''}
                      </span>
                    </div>
                    <div className='flex gap-2 justify-between'>
                      {options.map((option, idx) => (
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
                          className={`flex-1 min-w-0 rounded-xl px-2 py-3 border text-center transition ${
                            hoveredOptionIndex === idx
                              ? 'border-white/80 bg-white/15 ring-2 ring-pip-orange/70'
                              : 'border-white/15 bg-white/10 hover:bg-white/15'
                          }`}
                          style={{
                            borderColor:
                              hoveredOptionIndex === idx
                                ? '#fff'
                                : option.color + '40',
                          }}
                        >
                          <div
                            className='text-3xl font-extrabold leading-none'
                            style={{ color: option.color }}
                          >
                            {option.char}
                          </div>
                          <div className='text-[11px] text-white/80 truncate'>
                            {option.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <figcaption className='sr-only'>
                  Camera view for hand gesture tracking to select letters
                </figcaption>
              </figure>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-4 text-center font-semibold ${
                    feedback.type === 'success'
                      ? 'bg-success/20 border border-success/30 text-success'
                      : 'bg-error/10 border border-error/20 text-error'
                  }`}
                >
                  {feedback.message}
                </motion.div>
              )}

              {/* Game Controls */}
              <fieldset
                className='flex justify-between items-center border-0 p-0 m-0'
                aria-label='Game controls'
              >
                <legend className='sr-only'>Game Controls</legend>
                <button
                  onClick={goToHome}
                  className='px-4 py-2 bg-white border border-border rounded-lg font-semibold transition flex items-center gap-2 text-text-primary hover:bg-bg-tertiary shadow-soft'
                >
                  <UIIcon name='home' size={16} />
                  Home
                </button>

                <div className='text-center'>
                  <div className='text-sm text-text-secondary'>
                    Round {round} of {totalRounds}
                  </div>
                  <div className='text-sm text-text-secondary'>
                    Level {level}
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <label className='text-xs text-text-secondary flex items-center gap-2 select-none'>
                    <input
                      type='checkbox'
                      checked={useMouseFallback}
                      onChange={(e) => setUseMouseFallback(e.target.checked)}
                      className='accent-pip-orange'
                    />
                    Mouse fallback
                  </label>
                  <button
                    onClick={resetGame}
                    className='px-4 py-2 bg-white border border-border rounded-lg hover:bg-bg-tertiary transition shadow-soft text-text-primary'
                  >
                    Reset
                  </button>
                </div>
              </fieldset>

              {/* Mascot */}
              <div className='flex justify-center'>
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
            <li>• Pinch (thumb + index) while hovering a tile to select it</li>
            <li>• You have 30 seconds per round — faster answers score more</li>
            <li>• Complete all 10 rounds to advance to the next level</li>
          </ul>
        </div>
      </motion.div>
    </section>
  );
});
