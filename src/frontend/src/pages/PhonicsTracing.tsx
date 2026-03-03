import { memo, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import {
  calculateScore,
  calculateTraceAccuracy,
  getLetterData,
  getLetterGuidePoints,
  getLevelConfig,
  getNextLetter,
  isTracingComplete,
  LEVELS,
  type TracePoint,
} from '../games/phonicsTracingLogic';

const CANVAS_SIZE = 400;

// Inner game component
const PhonicsTracingGame = memo(function PhonicsTracingGameComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('phonics-tracing');
  const { currentProfile } = useProgressStore();
  const { onGameComplete } = useGameDrops('phonics-tracing');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLetter, setCurrentLetter] = useState('S');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [strokePoints, setStrokePoints] = useState<TracePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [lettersCompleted, setLettersCompleted] = useState(0);
  const [feedback, setFeedback] = useState(
    'Trace the letter and hear the sound!',
  );
  const [showIntro, setShowIntro] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const { playClick, playCelebration, playPop, playSuccess } = useAudio();

  const letterData = useMemo(
    () => getLetterData(currentLetter),
    [currentLetter],
  );
  const levelConfig = useMemo(
    () => getLevelConfig(currentLevel),
    [currentLevel],
  );
  const guidePoints = useMemo(
    () => getLetterGuidePoints(currentLetter),
    [currentLetter],
  );

  // helper renderers for guard conditions
  const renderLoading = () => (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
    </div>
  );

  const renderAccessDenied = () => (
    <AccessDenied gameName='Phonics Tracing' gameId='phonics-tracing' />
  );

  const renderErrorState = () => (
    <GameContainer title='Phonics Tracing' onHome={() => navigate('/games')}>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-4'>
            Oops! Something went wrong
          </h2>
          <p className='text-slate-600 mb-4'>{error?.message}</p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className='px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold'
          >
            Try Again
          </button>
        </div>
      </div>
    </GameContainer>
  );

  // NOTE: early return logic moved below after all hook definitions

  // Save progress on game complete
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      if (!currentProfile) return;

      try {
        await progressQueue.add({
          profileId: currentProfile.id,
          gameId: 'phonics-tracing',
          score: finalScore,
          completed: true,
          metadata: {
            level: currentLevel,
            letters_completed: lettersCompleted,
            total_score: totalScore,
            last_accuracy: lastAccuracy,
          },
        });
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to save progress:', err);
        setError(err as Error);
      }
    },
    [
      currentProfile,
      currentLevel,
      lettersCompleted,
      totalScore,
      lastAccuracy,
      onGameComplete,
    ],
  );

  const speakLetter = useCallback((letter: string) => {
    try {
      const data = getLetterData(letter);
      if (!data) return;

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${data.ttsIntro} ${data.exampleWord}! ${data.exampleEmoji}`,
        );
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Speech synthesis failed:', err);
    }
  }, []);

  const speakSound = useCallback((letter: string, isTracing: boolean) => {
    try {
      const data = getLetterData(letter);
      if (!data) return;

      if ('speechSynthesis' in window) {
        let text = '';
        switch (data.soundType) {
          case 'continuous':
            text = isTracing
              ? `${data.letter} ${data.letter} ${data.letter}`
              : data.soundType;
            break;
          case 'burst':
            text = `${data.letter}!`;
            break;
          case 'vowel':
            text = isTracing ? `${data.letter} ${data.letter}` : data.letter;
            break;
          default:
            text = data.letter;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = data.soundType === 'continuous' ? 0.5 : 0.8;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Speech synthesis failed:', err);
    }
  }, []);

  useEffect(() => {
    if (showIntro && letterData) {
      const timer = setTimeout(() => {
        speakLetter(currentLetter);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showIntro, letterData, currentLetter, speakLetter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext('2d');
      if (!ctx || typeof ctx.setLineDash !== 'function') return;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      if (guidePoints.length > 0) {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 12;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.setLineDash([15, 10]);
        ctx.beginPath();
        ctx.moveTo(
          guidePoints[0].x * CANVAS_SIZE,
          guidePoints[0].y * CANVAS_SIZE,
        );
        for (let i = 1; i < guidePoints.length; i++) {
          ctx.lineTo(
            guidePoints[i].x * CANVAS_SIZE,
            guidePoints[i].y * CANVAS_SIZE,
          );
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (letterData) {
        ctx.font = 'bold 200px Fredoke One, Bubblegum Sans, sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letterData.letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      }

      if (strokePoints.length > 0) {
        const gradient = ctx.createLinearGradient(
          0,
          0,
          CANVAS_SIZE,
          CANVAS_SIZE,
        );
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 16;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(
          strokePoints[0].x * CANVAS_SIZE,
          strokePoints[0].y * CANVAS_SIZE,
        );
        for (let i = 1; i < strokePoints.length; i++) {
          ctx.lineTo(
            strokePoints[i].x * CANVAS_SIZE,
            strokePoints[i].y * CANVAS_SIZE,
          );
        }
        ctx.stroke();
      }
    } catch (err) {
      console.error('Canvas rendering failed:', err);
      setError(err as Error);
    }
  }, [strokePoints, guidePoints, letterData]);

  const getPointFromEvent = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ): TracePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      timestamp: Date.now(),
    };
  };

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      try {
        if (showIntro) {
          setShowIntro(false);
          playPop();
          return;
        }

        if (sessionComplete) return;

        setIsDrawing(true);
        const point = getPointFromEvent(event);
        setStrokePoints([point]);

        speakSound(currentLetter, false);
      } catch (err) {
        console.error('Pointer down failed:', err);
        setError(err as Error);
      }
    },
    [showIntro, sessionComplete, currentLetter, playPop, speakSound],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      try {
        if (!isDrawing || sessionComplete) return;

        const point = getPointFromEvent(event);
        setStrokePoints((prev) => [...prev, point]);

        if (strokePoints.length > 0 && strokePoints.length % 10 === 0) {
          speakSound(currentLetter, true);
        }
      } catch (err) {
        console.error('Pointer move failed:', err);
        setError(err as Error);
      }
    },
    [
      isDrawing,
      sessionComplete,
      currentLetter,
      strokePoints.length,
      speakSound,
    ],
  );

  const handlePointerUp = useCallback(() => {
    try {
      if (!isDrawing) return;
      setIsDrawing(false);

      const complete = isTracingComplete(strokePoints);
      if (complete) {
        const accuracy = calculateTraceAccuracy(strokePoints, currentLetter);
        const roundScore = calculateScore(
          accuracy,
          10,
          levelConfig.timePerLetter,
        );

        setLastAccuracy(accuracy);
        setScore(roundScore);
        setTotalScore((prev) => prev + roundScore);
        setLettersCompleted((prev) => prev + 1);

        playCelebration();

        if (accuracy >= levelConfig.passThreshold) {
          setFeedback(
            `Great job! ${currentLetter} sounds like ${letterData?.exampleWord}! ${letterData?.exampleEmoji}`,
          );
          speakLetter(currentLetter);
          playSuccess();

          setTimeout(() => {
            const next = getNextLetter(currentLetter, currentLevel);
            setCurrentLetter(next);
            setStrokePoints([]);
            setFeedback('Trace the next letter!');
          }, 2000);
        } else {
          setFeedback('Try again! Trace the letter more completely.');
          setTimeout(() => {
            setStrokePoints([]);
            setFeedback('Trace the letter and hear the sound!');
          }, 1500);
        }
      } else {
        setFeedback('Keep tracing! Cover the whole letter.');
      }
    } catch (err) {
      console.error('Pointer up failed:', err);
      setError(err as Error);
    }
  }, [
    isDrawing,
    strokePoints,
    currentLetter,
    levelConfig,
    letterData,
    playCelebration,
    speakLetter,
    currentLevel,
    playSuccess,
  ]);

  const handleLevelChange = useCallback(
    (level: number) => {
      playClick();
      setCurrentLevel(level);
      const config = getLevelConfig(level);
      setCurrentLetter(config.letters[0]);
      setStrokePoints([]);
      setScore(0);
      setTotalScore(0);
      setLettersCompleted(0);
      setShowIntro(true);
      setSessionComplete(false);
    },
    [playClick],
  );

  const handleRestart = useCallback(() => {
    playClick();
    setStrokePoints([]);
    setScore(0);
    setTotalScore(0);
    setLettersCompleted(0);
    setShowIntro(true);
    setSessionComplete(false);
    const config = getLevelConfig(currentLevel);
    setCurrentLetter(config.letters[0]);
  }, [playClick, currentLevel]);

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(
      totalScore / Math.max(1, lettersCompleted) || 0,
    );
    await handleGameComplete(finalScore);
    navigate('/games');
  }, [totalScore, lettersCompleted, handleGameComplete, navigate, playClick]);

  // guarded early return (all hooks defined above ensure consistent hook order)
  if (subLoading) return renderLoading();
  if (!hasAccess) return renderAccessDenied();
  if (error) return renderErrorState();

  return (
    <GlobalErrorBoundary>
      <GameContainer
        title='Phonics Tracing'
        score={totalScore}
        level={currentLevel}
        onHome={() => navigate('/games')}
        reportSession={false}
      >
        <div className='flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto'>
          {/* Level selector */}
          <div className='flex gap-2'>
            {LEVELS.map((level) => (
              <motion.button
                type='button'
                key={level.level}
                onClick={() => handleLevelChange(level.level)}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  currentLevel === level.level
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                Level {level.level}
              </motion.button>
            ))}
          </div>

          <div className='text-center'>
            <p className='text-lg text-gray-700 font-medium'>{feedback}</p>
            {letterData && (
              <p className='text-sm text-gray-500 mt-1'>
                {letterData.ttsExample} {letterData.exampleEmoji}
              </p>
            )}
          </div>

          <div className='relative'>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className='touch-none cursor-crosshair rounded-2xl shadow-xl border-4 border-purple-200 bg-white'
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            {showIntro && (
              <motion.div
                className='absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl'
                initial={
                  reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }
                }
                animate={
                  reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
                }
                transition={
                  reducedMotion ? { duration: 0.01 } : { duration: 0.3 }
                }
              >
                <div className='bg-white p-6 rounded-2xl text-center shadow-2xl'>
                  <p className='text-2xl font-bold text-purple-600 mb-2'>
                    Trace {currentLetter}!
                  </p>
                  <p className='text-gray-600'>Tap to start</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className='flex gap-4 text-center'>
            <div className='bg-purple-100 px-4 py-2 rounded-xl'>
              <p className='text-sm text-purple-600 font-medium'>This Round</p>
              <p className='text-2xl font-bold text-purple-700'>{score}</p>
            </div>
            <div className='bg-pink-100 px-4 py-2 rounded-xl'>
              <p className='text-sm text-pink-600 font-medium'>Total</p>
              <p className='text-2xl font-bold text-pink-700'>{totalScore}</p>
            </div>
            <div className='bg-green-100 px-4 py-2 rounded-xl'>
              <p className='text-sm text-green-600 font-medium'>Letters</p>
              <p className='text-2xl font-bold text-green-700'>
                {lettersCompleted}
              </p>
            </div>
          </div>

          <div className='flex gap-3'>
            <motion.button
              type='button'
              onClick={handleRestart}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className='px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all'
            >
              Restart
            </motion.button>
            <motion.button
              type='button'
              onClick={handleFinish}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className='px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg transition-all'
            >
              Finish
            </motion.button>
          </div>
        </div>

      </GameContainer>
    </GlobalErrorBoundary>
  );
});

// Main export wrapped with GameShell
export const PhonicsTracing = memo(function PhonicsTracingComponent() {
  return (
    <GameShell
      gameId="phonics-tracing"
      gameName="Phonics Tracing"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <PhonicsTracingGame />
    </GameShell>
  );
});
