import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';

import { useSubscription } from '../hooks/useSubscription';
import { useProgressStore } from '../store';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  getAnimalsForLevel,
  type Animal,
} from '../games/animalSoundsLogic';
import { progressQueue } from '../services/progressQueue';
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

  const { playClick, playSuccess, playError } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const allowInteractionRef = useRef(true);

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
    setGameState('playing');
    setFeedback('');
    allowInteractionRef.current = true;
    if (ttsEnabled) {
      void speak(`Which animal says ${target.sound}?`);
    }
  };

  const handleAnswer = (animal: Animal) => {
    if (!targetAnimal || gameState !== 'playing' || !allowInteractionRef.current) return;
    playClick();
    allowInteractionRef.current = false;

    if (animal.name === targetAnimal.name) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 30);
      setFeedback(`Correct! The ${animal.name} says "${animal.sound}"`);
      if (ttsEnabled) {
        void speak(`Correct! The ${animal.name} says ${animal.sound}`);
      }
    } else {
      playError();
      setFeedback(`Oops! The ${targetAnimal.name} says "${targetAnimal.sound}"`);
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
          void speak(`Which animal says ${nextTarget.sound}?`);
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
            <p className='mb-4'>Which animal makes this sound?</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && targetAnimal && (
          <div className='text-center w-full max-w-2xl'>
            <div className='bg-white shadow-xl rounded-2xl p-6 mb-8 border-4 border-amber-100 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent pointer-events-none' />
              <p className='text-xl font-bold mb-2 text-slate-500'>Which animal says:</p>
              <div className='flex items-center justify-center gap-4'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className='text-2xl p-3 bg-amber-100 rounded-full hover:bg-amber-200 text-amber-600'
                  onClick={() => {
                    if (ttsEnabled) void speak(targetAnimal.sound);
                    playClick();
                  }}
                >
                  🔊
                </motion.button>
                <p className='text-4xl md:text-5xl font-black text-amber-500 drop-shadow-sm'>
                  "{targetAnimal.sound}"
                </p>
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
              <div className='bg-green-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Correct</p>
                <p className='text-2xl font-bold'>{correct}</p>
              </div>
              <div className='bg-amber-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Round</p>
                <p className='text-2xl font-bold'>{round + 1}/5</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
            <p className='text-xl mb-4'>You got {correct} animals right!</p>
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-amber-500 text-white rounded-xl font-bold mr-4'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={finish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold'
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}

export function AnimalSounds() {
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
}
