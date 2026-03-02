import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  spawnLetter,
  updatePositions,
  checkCatch,
  type FallingLetter,
} from '../games/letterCatcherLogic';

export function LetterCatcher() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [targetLetter, setTargetLetter] = useState('A');
  const [bucketX, setBucketX] = useState(175);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const letterIdRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('letter-catcher');
  useGameSessionProgress({
    gameName: 'Letter Catcher',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { caught, missed },
  });

  const startGame = () => {
    setTargetLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    setLetters([]);
    setScore(0);
    setCaught(0);
    setMissed(0);
    setGameState('playing');
    letterIdRef.current = 0;
  };

  useEffect(() => {
    if (gameState !== 'playing') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const config = LEVELS[currentLevel - 1];
    intervalRef.current = window.setInterval(() => {
      setLetters((prev) => {
        const updated = updatePositions(prev, config.speed);
        const missedLetters = updated.filter((l) => l.y > 300);
        if (missedLetters.length > 0) {
          setMissed((m) => m + missedLetters.length);
          playError();
        }
        return updated.filter((l) => l.y <= 300);
      });
    }, 50);
    const spawnInterval = window.setInterval(() => {
      const newLetter = spawnLetter(letterIdRef.current++);
      setLetters((prev) => [...prev, newLetter]);
    }, config.spawnRate);
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      clearInterval(spawnInterval);
    };
  }, [gameState, currentLevel, playError]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setBucketX(Math.max(20, Math.min(330, x)));
    const caughtLetter = letters.find((l) => checkCatch(l, x));
    if (caughtLetter) {
      if (caughtLetter.letter === targetLetter) {
        playSuccess();
        setCaught((prevCaught) => {
          const nextCaught = prevCaught + 1;
          if (nextCaught > 5) {
            setGameState('complete');
          }
          return nextCaught;
        });
        setScore((s) => s + 20);
      } else {
        playError();
        setScore((s) => Math.max(s - 10, 0));
      }
      setLetters((prev) => prev.filter((l) => l.id !== caughtLetter.id));
    }
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(caught);
    navigate('/games');
  }, [caught, onGameComplete, navigate, playClick]);

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <GameContainer
      title='Letter Catcher'
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
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🪣</p>
            <h2 className='text-2xl font-bold mb-2'>Letter Catcher!</h2>
            <p className='mb-4'>
              Catch the letter:{' '}
              <span className='text-amber-600 font-bold'>{targetLetter}</span>
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div
            className='relative w-80 h-64 bg-slate-100 rounded-xl overflow-hidden cursor-crosshair'
            onMouseMove={handleMouseMove}
          >
            <div className='absolute top-2 left-2 bg-white px-3 py-1 rounded-full text-amber-600 font-bold'>
              Catch: {targetLetter}
            </div>
            {letters.map((letter) => (
              <div
                key={letter.id}
                className='absolute text-3xl font-bold'
                style={{ left: letter.x, top: letter.y }}
              >
                {letter.letter}
              </div>
            ))}
            <div className='absolute bottom-2 left-0 right-0 flex justify-center'>
              <div className='text-4xl'>🪣</div>
            </div>
            <div className='absolute bottom-2' style={{ left: bucketX }}>
              👆
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
            <p className='text-xl mb-4'>Caught {caught} letters!</p>
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
              onClick={handleFinish}
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
