/**
 * Animal Sounds Game - REFACTORED with GameShell
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useGameSessionProgress({
    gameName: 'Animal Sounds',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startGame = () => {
    const newAnimals = getAnimalsForLevel(currentLevel);
    setAnimals(newAnimals);
    setTargetAnimal(newAnimals[Math.floor(Math.random() * newAnimals.length)]);
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (animal: Animal) => {
    if (!targetAnimal || gameState !== 'playing') return;
    playClick();
    if (animal.name === targetAnimal.name) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 30);
      setFeedback(`Correct! ${animal.emoji} says "${animal.sound}"`);
    } else {
      playError();
      setFeedback(`Oops! ${targetAnimal.emoji} says "${targetAnimal.sound}"`);
    }
    setTimeout(() => {
      const newAnimals = getAnimalsForLevel(currentLevel);
      setAnimals(newAnimals);
      setTargetAnimal(
        newAnimals[Math.floor(Math.random() * newAnimals.length)],
      );
      setRound((r) => r + 1);
      setFeedback('');
      if (round >= 4) {
        setGameState('complete');
      }
    }, 2000);
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
              className={`px-4 py-2 rounded-full font-bold ${
                currentLevel === l.level
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
          <div className='text-center'>
            <p className='text-2xl font-bold mb-4'>Which animal says:</p>
            <p className='text-4xl font-bold text-amber-600 mb-4'>
              "{targetAnimal.sound}"
            </p>
            <div className='grid grid-cols-3 gap-4 mb-4'>
              {animals.map((animal) => (
                <button
                  type='button'
                  key={animal.name}
                  onClick={() => handleAnswer(animal)}
                  className='p-4 bg-white rounded-xl shadow-md hover:bg-amber-50 transition-all text-5xl'
                >
                  {animal.emoji}
                </button>
              ))}
            </div>
            <p className='text-lg font-medium text-purple-600'>{feedback}</p>
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

const AnimalSoundsGame = memo(function AnimalSoundsGameComponent() {
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

// Main export wrapped with GameShell
export const AnimalSounds = memo(function AnimalSoundsComponent() {
  return (
    <GameShell
      gameId="animal-sounds"
      gameName="Animal Sounds"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <AnimalSoundsGame />
    </GameShell>
  );
});
