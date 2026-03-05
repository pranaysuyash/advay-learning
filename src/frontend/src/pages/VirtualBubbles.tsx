import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import {
  LEVELS,
  createBubble,
  updateBubbles,
  checkBubblePop,
  type Bubble,
} from '../games/virtualBubblesLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

export const VirtualBubbles = memo(function VirtualBubblesComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('virtual-bubbles');
  const { currentProfile } = useProgressStore();
  const { onGameComplete } = useGameDrops('virtual-bubbles');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [handPosition, setHandPosition] = useState({ x: 0.5, y: 0.5 });
  const [blowDetected, setBlowDetected] = useState(false);
  const [micState, setMicState] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [error, setError] = useState<Error | null>(null);

  const bubbleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { playClick, playPop, playCelebration } = useAudio();
  const levelConfig = LEVELS[currentLevel - 1];

  // Show loading while checking subscription
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  // Check subscription access
  if (!hasAccess) {
    return <AccessDenied gameName='Virtual Bubbles' gameId='virtual-bubbles' />;
  }

  // Error state
  if (error) {
    return (
      <GameContainer title='Virtual Bubbles' onHome={() => navigate('/games')}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              Oops! Something went wrong
            </h2>
            <p className='text-slate-600 mb-4'>{error.message}</p>
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
  }

  // Save progress on game complete
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      if (!currentProfile) return;

      try {
        await progressQueue.add({
          profileId: currentProfile.id,
          gameId: 'virtual-bubbles',
          score: finalScore,
          completed: true,
          metadata: {
            level: currentLevel,
            popped: poppedCount,
            target: levelConfig.bubblesToPop,
          },
        });
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to save progress:', err);
        setError(err as Error);
      }
    },
    [currentProfile, currentLevel, poppedCount, levelConfig, onGameComplete],
  );

  useGameSessionProgress({
    gameName: 'Virtual Bubbles',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: {
      popped: poppedCount,
      target: levelConfig.bubblesToPop,
    },
  });

  // Initialize audio for blow detection
  useEffect(() => {
    if (gameState === 'playing') {
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source =
            audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
          setMicState('granted');
        } catch (e) {
          console.warn('Mic not available for blow detection - falling back to tap mode');
          setMicState('denied');
        }
      };
      initAudio();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, [gameState]);

  // Check for blow detection
  useEffect(() => {
    if (gameState !== 'playing' || !analyserRef.current) return;

    const checkBlow = () => {
      try {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        // Lowered threshold from 50 to 15 to make it easier for kids to trigger
        if (average > 15) {
          setBlowDetected(true);
          // Create new bubble
          if (bubbles.length < levelConfig.maxBubbles) {
            const newBubble = createBubble(bubbleIdRef.current++, CANVAS_WIDTH);
            setBubbles((prev) => [...prev, newBubble]);
          }
        } else {
          setBlowDetected(false);
        }
      } catch (err) {
        console.error('Blow detection failed:', err);
      }
    };

    const interval = setInterval(checkBlow, 100);
    return () => clearInterval(interval);
  }, [gameState, bubbles.length, levelConfig.maxBubbles]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    try {
      const gameLoop = setInterval(() => {
        setBubbles((prev) => updateBubbles(prev, CANVAS_WIDTH, CANVAS_HEIGHT));

        // Check for popped bubbles
        setBubbles((prev) => {
          const result = checkBubblePop(
            prev,
            handPosition.x,
            handPosition.y,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
          );
          if (result.popped) {
            // Streak and scoring
            const newStreak = streak + 1;
            setStreak(newStreak);
            const basePoints = 10;
            const streakBonus = Math.min(newStreak * 2, 15);
            
            setPoppedCount((p) => p + 1);
            setScore((s) => s + basePoints + streakBonus);
            playPop();
            triggerHaptic('success');

            // Milestone every 5
            if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
              setShowStreakMilestone(true);
              triggerHaptic('celebration');
              setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
            }
          }
          return result.remaining;
        });
      }, 50);

      return () => clearInterval(gameLoop);
    } catch (err) {
      console.error('Game loop failed:', err);
      setError(err as Error);
    }
  }, [gameState, handPosition, playPop]);

  // Check for level complete
  useEffect(() => {
    if (poppedCount >= levelConfig.bubblesToPop && gameState === 'playing') {
      setGameState('complete');
      playCelebration();
      void handleGameComplete(score);
    }
  }, [
    poppedCount,
    levelConfig,
    gameState,
    playCelebration,
    handleGameComplete,
    score,
  ]);

  // Canvas rendering
  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      bubbles.forEach((bubble) => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    } catch (err) {
      console.error('Canvas rendering failed:', err);
      setError(err as Error);
    }
  }, [bubbles]);

  const handleStart = useCallback(() => {
    try {
      playClick();
      setGameState('playing');
      setBubbles([]);
      setPoppedCount(0);
      setScore(0);
      setStreak(0);
      setShowStreakMilestone(false);
      setMicState('requesting');
      bubbleIdRef.current = 0;
    } catch (err) {
      console.error('Game start failed:', err);
      setError(err as Error);
    }
  }, [playClick]);

  const handleStop = useCallback(async () => {
    try {
      playClick();
      await handleGameComplete(score);
      setGameState('start');
      navigate('/dashboard');
    } catch (err) {
      console.error('Game stop failed:', err);
      setError(err as Error);
    }
  }, [score, handleGameComplete, navigate, playClick]);

  const handleLevelChange = useCallback(
    (level: number) => {
      playClick();
      setCurrentLevel(level);
      setBubbles([]);
      setPoppedCount(0);
      setScore(0);
      setStreak(0);
      setShowStreakMilestone(false);
    },
    [playClick],
  );

  const handleCanvasMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      try {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setHandPosition({ x, y });
      } catch (err) {
        console.error('Canvas move failed:', err);
      }
    },
    [],
  );

  const handleManualBlow = useCallback(() => {
    if (gameState !== 'playing' || bubbles.length >= levelConfig.maxBubbles) return;
    const newBubble = createBubble(bubbleIdRef.current++, CANVAS_WIDTH);
    setBubbles((prev) => [...prev, newBubble]);
  }, [gameState, bubbles.length, levelConfig.maxBubbles]);

  return (
    <GlobalErrorBoundary>
      <GameContainer
        title='Virtual Bubbles'
        score={score}
        level={currentLevel}
        onHome={() => navigate('/games')}
        reportSession={false}
      >
        <div className='flex flex-col h-full bg-slate-50'>
          {/* Stats Bar */}
          <div className='flex justify-between items-center p-4 bg-white shadow-[0_4px_0_#E5B86F]'>
            <div className='flex gap-6'>
              <div>
                <span className='text-text-secondary text-sm'>Score:</span>
                <span className='font-bold text-blue-600 ml-2 text-xl'>
                  {score}
                </span>
              </div>
              <div>
                <span className='text-text-secondary text-sm'>Popped:</span>
                <span className='font-bold text-green-600 ml-2'>
                  {poppedCount}/{levelConfig.bubblesToPop}
                </span>
              </div>
              {streak > 0 && (
                <div>
                  <span className='text-text-secondary text-sm'>Streak:</span>
                  <span className='font-bold text-orange-600 ml-2'>🔥 {streak}</span>
                </div>
              )}
            </div>

            {/* Streak Milestone Overlay */}
            {showStreakMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'
              >
                <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg'>
                  🔥 {streak} Streak! 🔥
                </div>
              </motion.div>
            )}

            {/* Level selector */}
            <div className='flex gap-2'>
              {LEVELS.map((level, idx) => (
                <motion.button
                  key={level.level}
                  onClick={() => handleLevelChange(idx + 1)}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  whileTap={reducedMotion ? {} : { scale: 0.95 }}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${currentLevel === idx + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                    }`}
                >
                  L{level.level}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Game Canvas */}
          <div className='flex-1 relative'>
            {gameState === 'start' && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-10'>
                <motion.div
                  initial={
                    reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }
                  }
                  animate={
                    reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
                  }
                  className='bg-white p-8 rounded-2xl text-center'
                >
                  <h2 className='text-2xl font-bold mb-4'>Virtual Bubbles!</h2>
                  <p className='text-slate-600 mb-6'>
                    Blow to create bubbles, click to pop!
                  </p>
                  <motion.button
                    onClick={handleStart}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    className='px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold'
                  >
                    Start Blowing!
                  </motion.button>
                </motion.div>
              </div>
            )}

            {gameState === 'complete' && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-10'>
                <motion.div
                  initial={
                    reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }
                  }
                  animate={
                    reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
                  }
                  className='bg-white p-8 rounded-2xl text-center'
                >
                  <h2 className='text-2xl font-bold text-green-600 mb-4'>
                    Amazing!
                  </h2>
                  <p className='text-slate-600 mb-4'>
                    You popped {poppedCount} bubbles!
                  </p>
                  <p className='text-slate-600 mb-6'>Score: {score}</p>
                  <motion.button
                    onClick={handleStart}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    className='px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold mr-4'
                  >
                    Play Again
                  </motion.button>
                  <motion.button
                    onClick={handleStop}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    className='px-8 py-4 bg-slate-200 text-slate-700 rounded-xl font-bold'
                  >
                    Exit
                  </motion.button>
                </motion.div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleCanvasMove}
              className='w-full h-full cursor-crosshair'
            />

            {/* Blow indicator */}
            {blowDetected && (
              <div className='absolute top-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold animate-pulse'>
                🌬️ Blowing!
              </div>
            )}
          </div>

          <div className='p-4 bg-white border-t flex justify-between items-center relative gap-4'>
            <div className='text-sm text-slate-600 flex-1'>
              {micState === 'denied'
                ? '🎙️ Mic unavailable. Tap the screen to blow!'
                : blowDetected
                  ? '🌬️ Blow detected!'
                  : 'Blow into mic to create bubbles'}
            </div>

            {micState === 'denied' && (
              <motion.button
                onClick={handleManualBlow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold flex-1 text-lg shadow-md hover:bg-blue-600 z-20'
              >
                Tap to Blow! 🌬️
              </motion.button>
            )}

            <motion.button
              onClick={handleStop}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold max-w-[120px]'
            >
              Stop
            </motion.button>
          </div>

          {/* Wellness timer */}
          <WellnessTimer />
        </div>
      </GameContainer>
    </GlobalErrorBoundary>
  );
});
