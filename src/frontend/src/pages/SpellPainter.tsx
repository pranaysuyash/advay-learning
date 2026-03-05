import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  generateLetterTargets,
  checkLetterPainted,
  isLevelComplete,
  calculateScore,
  type LetterPosition,
} from '../games/spellPainterLogic';
import { useHandTracking } from '../hooks/useHandTracking';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { triggerHaptic } from '../utils/haptics';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

export function SpellPainter() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [letters, setLetters] = useState<LetterPosition[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number; x: number; y: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentLevelRef = useRef(1);

  const { playClick, playSuccess } = useAudio();
  const { onGameComplete } = useGameDrops('spell-painter');
  useGameSessionProgress({
    gameName: 'Spell Painter',
    score,
    level: currentLevelRef.current,
    isPlaying: gameState === 'playing',
  });

  const {
    landmarker,
    isReady,
    initialize: initHandTracking,
    reset: resetHandTracking,
  } = useHandTracking();

  const level = LEVELS.find((l) => l.id === currentLevel) || LEVELS[0];

  useEffect(() => {
    if (gameState === 'playing') {
      initHandTracking();
      startTimeRef.current = Date.now();
    }
    return () => {
      resetHandTracking();
    };
  }, [gameState, initHandTracking, resetHandTracking]);

  useEffect(() => {
    if (!landmarker || gameState !== 'playing' || !isReady) return;

    let animationId: number;

    const checkHands = () => {
      const hands = landmarker.getHandLandmarks();
      if (hands.length > 0) {
        const canvas = canvasRef.current;
        if (canvas) {
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const hand = hands[0];
          const indexTip = hand[8];
          const x = indexTip.x * canvasWidth;
          const y = (1 - indexTip.y) * canvasHeight;

          setLetters((prev) => {
            let changed = false;
            const updated = prev.map((letter) => {
              if (
                !letter.painted &&
                checkLetterPainted(letter, x / canvasWidth, y / canvasHeight)
              ) {
                changed = true;
                playClick();
                return { ...letter, painted: true };
              }
              return letter;
            });

            if (changed && isLevelComplete(updated)) {
              playSuccess();
              const timeMs = Date.now() - startTimeRef.current;
              const levelScore = calculateScore(updated, timeMs);
              
              // Streak and scoring logic
              const newStreak = streak + 1;
              setStreak(newStreak);
              const basePoints = levelScore;
              const streakBonus = Math.min(newStreak * 2, 15);
              const totalPoints = basePoints + streakBonus;
              setScore((s) => s + totalPoints);
              setScorePopup({ points: totalPoints, x: 50, y: 30 });
              setTimeout(() => setScorePopup(null), 700);
              triggerHaptic('success');
              if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
                setShowStreakMilestone(true);
                triggerHaptic('celebration');
                setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
              }
              
              setShowCelebration(true);
              setTimeout(() => {
                setShowCelebration(false);
                if (currentLevel < LEVELS.length) {
                  setCurrentLevel((l) => l + 1);
                  currentLevelRef.current = currentLevel + 1;
                  const nextLevel = LEVELS.find(
                    (lv) => lv.id === currentLevel + 1,
                  );
                  if (nextLevel && canvas) {
                    setLetters(
                      generateLetterTargets(
                        nextLevel.word,
                        canvas.width,
                        canvas.height,
                      ),
                    );
                  }
                } else {
                  handleComplete();
                }
              }, 2000);
            }

            return changed ? updated : prev;
          });
        }
      }
      animationId = requestAnimationFrame(checkHands);
    };

    checkHands();
    return () => cancelAnimationFrame(animationId);
  }, [landmarker, isReady, gameState, currentLevel, playClick, playSuccess, streak]);

  const handleStart = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setLetters(
        generateLetterTargets(level.word, canvas.width, canvas.height),
      );
    }
    setGameState('playing');
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    playClick();
  }, [level.word, playClick]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
  }, [score, onGameComplete, playSuccess]);

  const handleBack = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  return (
    <GameContainer
      title='Spell Painter'
      onHome={handleBack}
      reportSession={false}
    >
      <div className='relative w-full h-full'>
        {/* HUD - Streak Counter */}
        {gameState === 'playing' && (
          <div className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg'>
            <span className='text-2xl'>🔥</span>
            <span className='text-xl font-bold text-orange-600'>{streak}</span>
          </div>
        )}

        {/* Score Popup */}
        <AnimatePresence>
          {scorePopup && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className='absolute z-30 pointer-events-none'
              style={{
                left: `${scorePopup.x}%`,
                top: `${scorePopup.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className='text-3xl font-bold text-green-500 drop-shadow-lg'>
                +{scorePopup.points}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak Milestone Celebration */}
        <AnimatePresence>
          {showStreakMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className='absolute inset-0 flex items-center justify-center z-40 pointer-events-none'
            >
              <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl'>
                <span className='text-4xl font-bold'>🔥 {streak} Streak! 🔥</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === 'start' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200 z-10'>
            <h2 className='text-3xl font-bold text-purple-700 mb-4'>
              Spell Painter
            </h2>
            <p className='text-lg text-purple-600 mb-8 text-center px-4'>
              Trace the letters with your finger to paint the word!
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-purple-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-purple-600 transition-colors'
            >
              Start Painting!
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-green-200 z-10'>
            <h2 className='text-3xl font-bold text-green-700 mb-4'>
              Great Job!
            </h2>
            <p className='text-xl text-green-600 mb-2'>Final Score: {score}</p>
            <p className='text-lg text-orange-600 mb-4'>Best Streak: 🔥 {streak}</p>
            <button
              type='button'
              onClick={handleBack}
              className='px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors'
            >
              Play More Games!
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className='w-full h-full bg-white rounded-lg'
        />

        {letters.map((letter, idx) => (
          <div
            key={idx}
            className={`absolute flex items-center justify-center text-6xl font-bold transition-all duration-300 ${
              letter.painted ? 'text-purple-500' : 'text-gray-300'
            }`}
            style={{
              left: `${(letter.x / 800) * 100}%`,
              top: `${(letter.y / 400) * 100}%`,
              width: `${(letter.width / 800) * 100}%`,
              height: `${(letter.height / 400) * 100}%`,
            }}
          >
            {letter.char}
          </div>
        ))}

        {showCelebration && (
          <CelebrationOverlay
            show={showCelebration}
            letter='🎨'
            accuracy={100}
            onComplete={() => setShowCelebration(false)}
          />
        )}

        {!isReady && gameState === 'playing' && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
            <p className='text-white text-xl'>Loading camera...</p>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
