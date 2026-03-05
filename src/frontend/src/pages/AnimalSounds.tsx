/**
 * Animal Sounds Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import {
  LEVELS,
  getAnimalsForLevel,
  calculateScore,
  type Animal,
} from '../games/animalSoundsLogic';
import { triggerHaptic } from '../utils/haptics';
import { GamePage } from '../components/GamePage';
import { useTTS } from '../hooks/useTTS';

interface InnerProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  onFinish: () => Promise<void>;
}

function AnimalSoundsGame({
  score,
  setScore,
  currentLevel,
  setCurrentLevel,
  onFinish,
}: InnerProps) {
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [targetAnimal, setTargetAnimal] = useState<Animal | null>(null);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();

  const { playClick, playSuccess, playError } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const allowInteractionRef = useRef(true);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Preload audio files
  useEffect(() => {
    const extMap: Record<string, string> = {
      dog: '.wav', cat: '.wav', cow: '.ogg', pig: '.mp3',
      bird: '.wav', rooster: '.mp3', sheep: '.ogg', horse: '.ogg',
      lion: '.wav', elephant: '.mp3', monkey: '.wav', frog: '.wav'
    };

    // Preload them
    Object.keys(extMap).forEach(animal => {
      const audio = new Audio(`/assets/sounds/animals/${animal}${extMap[animal]}`);
      audio.preload = 'auto';
      audioRefs.current[animal] = audio;
    });
  }, []);

  useGameSessionProgress({
    gameName: 'Animal Sounds',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startGame = () => {
    const newAnimals = getAnimalsForLevel(currentLevel);
    const target = newAnimals[Math.floor(Math.random() * newAnimals.length)];
    setAnimals(newAnimals);
    setTargetAnimal(target);
    setScore(0);
    setCorrect(0);
    setRound(0);
    resetStreak();
    setGameState('playing');
    setFeedback('');
    allowInteractionRef.current = true;
    if (ttsEnabled) {
      void speak(`Which animal makes this sound?`);
    }
  };

  const handleAnswer = (animal: Animal) => {
    if (!targetAnimal || gameState !== 'playing' || !allowInteractionRef.current) return;
    playClick();
    allowInteractionRef.current = false;

    if (animal.name === targetAnimal.name) {
      // Correct answer - build streak
      incrementStreak();

      // Calculate score with streak and level multiplier
      const points = calculateScore(streak + 1, currentLevel);
      setScore((s) => s + points);

      // Show score popup
      setScorePopup({ points });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');

      playSuccess();
      setCorrect((c) => c + 1);
      setFeedback(`Correct! The ${animal.name} makes this sound!`);
      if (ttsEnabled) {
        void speak(`Correct! The ${animal.name} says ${animal.sound}`);
      }
    } else {
      // Wrong answer - break streak
      resetStreak();
      triggerHaptic('error');
      playError();
      setFeedback(`Oops! The ${targetAnimal.name} makes that sound!`);
      if (ttsEnabled) {
        void speak(`Oops! Look for the ${targetAnimal.name}. It says ${targetAnimal.sound}`);
      }
    }
    setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound >= 5) {
        setGameState('complete');
        if (ttsEnabled) {
          void speak(`Great job! You got ${correct + (animal.name === targetAnimal.name ? 1 : 0)} out of 5 animals right!`);
        }
      } else {
        const newAnimals = getAnimalsForLevel(currentLevel);
        const nextTarget = newAnimals[Math.floor(Math.random() * newAnimals.length)];
        setAnimals(newAnimals);
        setTargetAnimal(nextTarget);
        setRound(nextRound);
        setFeedback('');
        allowInteractionRef.current = true;
        if (ttsEnabled) {
          void speak(`Which animal makes this sound?`);
        }
      }
    }, 2800);
  };

  const handleStart = () => {
    playClick();
    startGame();
  };

  const finish = useCallback(async () => {
    try {
      await onFinish();
    } catch (err) {
      console.error(err);
      setError(err as Error);
    }
  }, [onFinish]);

  if (error) {
    return (
      <GameContainer title='Animal Sounds' onHome={() => navigate('/games')}>
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

  return (
    <GameContainer
      title='Animal Sounds'
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200'
                }`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🐾</p>
            <h2 className='text-2xl font-bold mb-2'>Animal Sounds!</h2>
            <p className='mb-2'>Which animal makes this sound?</p>
            <div className='bg-amber-50 rounded-xl p-3 text-sm text-slate-600 mb-4 inline-block'>
              <p className='font-bold mb-1'>🎯 Scoring:</p>
              <p>Base 15 pts + streak bonus</p>
              <p>× Level: L1 1× | L2 1.5× | L3 2×</p>
            </div>
            <br />
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && targetAnimal && (
          <div className='text-center w-full max-w-2xl'>
            {/* Streak HUD */}
            <div className='flex items-center justify-center gap-3 bg-white rounded-xl border-2 border-orange-200 px-4 py-2 mb-4 shadow-sm'>
              <span className='font-black text-lg'>🔥 Streak</span>
              <div className='flex gap-1'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={
                      streak >= i * 2
                        ? '/assets/kenney/platformer/hud/hud_heart.png'
                        : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                    }
                    alt={streak >= i * 2 ? 'filled heart' : 'empty heart'}
                    className='w-6 h-6'
                  />
                ))}
              </div>
              <span className='font-black text-2xl text-orange-500 min-w-[2ch] text-center'>
                {streak}
              </span>
            </div>

            {/* Streak milestone popup */}
            {showMilestone && (
              <div className='animate-bounce bg-orange-100 border-2 border-orange-300 rounded-xl px-6 py-3 mb-4 inline-block'>
                <p className='text-xl font-black text-orange-600'>
                  🔥 {streak} Streak! 🔥
                </p>
              </div>
            )}

            <div className='bg-white shadow-xl rounded-2xl p-6 mb-8 border-4 border-amber-100 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent pointer-events-none' />
              <p className='text-xl font-bold mb-2 text-slate-500'>Which animal makes this sound?</p>
              <div className='flex items-center justify-center gap-4 my-4'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className='text-5xl p-6 bg-amber-100 rounded-full hover:bg-amber-200 text-amber-600 shadow-md border-4 border-amber-300'
                  title="Play Sound"
                  onClick={() => {
                    const aName = targetAnimal.name.toLowerCase();
                    if (audioRefs.current[aName]) {
                      audioRefs.current[aName].currentTime = 0;
                      void audioRefs.current[aName].play().catch(e => console.warn("Audio play blocked", e));
                    } else if (ttsEnabled) {
                      void speak(targetAnimal.sound);
                    }
                  }}
                >
                  🔊
                </motion.button>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
              <AnimatePresence mode="popLayout">
                {animals.map((animal, i) => (
                  <motion.button
                    type='button'
                    key={`${animal.name}-${round}`}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05, translateY: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer(animal)}
                    className='aspect-square flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-lg border-b-4 border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all group'
                  >
                    <span className='text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm'>{animal.emoji}</span>
                    <span className='mt-3 font-bold text-slate-500 opacity-60 group-hover:opacity-100'>{animal.name}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Score popup */}
            {scorePopup && (
              <div className='font-black text-3xl text-green-500 animate-bounce mb-2'>
                +{scorePopup.points}
              </div>
            )}

            <div className='h-12'>
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.p
                    key={feedback}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`text-xl font-bold bg-white px-6 py-2 rounded-full shadow-sm inline-block ${feedback.includes('Correct') ? 'text-green-500 border-2 border-green-200' : 'text-red-500 border-2 border-red-200'}`}
                  >
                    {feedback}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className='flex gap-4 mt-4'>
              <div className='bg-green-100 px-4 py-2 rounded-xl text-center border-2 border-green-200'>
                <p className='text-xs font-black uppercase text-green-600'>Correct</p>
                <p className='text-2xl font-bold text-green-700'>{correct}</p>
              </div>
              <div className='bg-amber-100 px-4 py-2 rounded-xl text-center border-2 border-amber-200'>
                <p className='text-xs font-black uppercase text-amber-600'>Round</p>
                <p className='text-2xl font-bold text-amber-700'>{round + 1}/5</p>
              </div>
              <div className='bg-orange-100 px-4 py-2 rounded-xl text-center border-2 border-orange-200'>
                <p className='text-xs font-black uppercase text-orange-600'>Best Streak</p>
                <p className='text-2xl font-bold text-orange-700'>{maxStreak}</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
            <p className='text-xl mb-4'>You got {correct} animals right!</p>
            {/* Streak badge */}
            {maxStreak >= 5 && (
              <div className='flex items-center justify-center gap-2 bg-orange-100 border-2 border-orange-300 px-4 py-2 rounded-full mb-4'>
                <img
                  src='/assets/kenney/platformer/collectibles/star.png'
                  alt='star'
                  className='w-6 h-6'
                />
                <span className='font-black text-orange-700'>
                  Best Streak: {maxStreak}!
                </span>
              </div>
            )}
            <div className='flex justify-center gap-4 mb-4'>
              <div className='bg-amber-50 border-2 border-amber-200 px-6 py-3 rounded-xl text-center'>
                <p className='text-xs font-black uppercase text-amber-600'>Score</p>
                <p className='text-3xl font-black text-amber-700'>{score}</p>
              </div>
              <div className='bg-orange-50 border-2 border-orange-200 px-6 py-3 rounded-xl text-center'>
                <p className='text-xs font-black uppercase text-orange-600'>Max Streak</p>
                <p className='text-3xl font-black text-orange-700'>{maxStreak}</p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-amber-500 text-white rounded-xl font-bold mr-4 hover:scale-105 transition-transform'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={finish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors'
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}

const AnimalSoundsPage = memo(function AnimalSoundsGameComponent() {
  return (
    <GamePage
      title='Animal Sounds'
      gameId='animal-sounds'
      reportSession={false}
    >
      {({ score, setScore, currentLevel, setCurrentLevel, handleFinish }) => (
        <AnimalSoundsGame
          score={score}
          setScore={setScore}
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          onFinish={handleFinish}
        />
      )}
    </GamePage>
  );
});

// Main export wrapped with GameShell
export const AnimalSounds = memo(function AnimalSoundsComponent() {
  return (
    <GameShell
      gameId="animal-sounds"
      gameName="Animal Sounds"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <AnimalSoundsPage />
    </GameShell>
  );
});
