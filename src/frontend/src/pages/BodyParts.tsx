import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GamePage } from '../components/GamePage';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  getPartsForLevel,
  type BodyPart,
} from '../games/bodyPartsLogic';

interface BodyPartsCtx {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  finishContext: () => Promise<void>;
}

function BodyPartsGame({
  score,
  setScore,
  currentLevel,
  setCurrentLevel,
  finishContext,
}: BodyPartsCtx) {
  const navigate = useNavigate();
  const [parts, setParts] = useState<BodyPart[]>([]);
  const [targetPart, setTargetPart] = useState<BodyPart | null>(null);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [feedback, setFeedback] = useState('');
  const [_error, setError] = useState<Error | null>(null);

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('body-parts');

  useGameSessionProgress({
    gameName: 'Body Parts',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { correct, round },
  });

  // guard logic moved into wrapper (GamePage handles subscription, access, error)

  const startGame = () => {
    const newParts = getPartsForLevel(currentLevel);
    setParts(newParts);
    setTargetPart(newParts[Math.floor(Math.random() * newParts.length)]);
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (part: BodyPart) => {
    if (!targetPart || gameState !== 'playing') return;
    playClick();
    if (part.name === targetPart.name) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 25);
      setFeedback(`Correct! That's the ${part.name}!`);
    } else {
      playError();
      setFeedback(`Oops! That's the ${part.name}.`);
    }
    setTimeout(() => {
      const newParts = getPartsForLevel(currentLevel);
      setParts(newParts);
      setTargetPart(newParts[Math.floor(Math.random() * newParts.length)]);
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
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      try {
        await finishContext(); // wrapper will record progress/additional metadata as needed
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to complete', err);
        setError(err as Error);
      }
    },
    [finishContext, onGameComplete],
  );

  const handleFinish = useCallback(async () => {
    playClick();
    await handleGameComplete(score);
    await onGameComplete(correct);
    navigate('/games');
  }, [correct, onGameComplete, navigate, playClick, handleGameComplete, score]);

  return (
    <GameContainer
      title='Body Parts'
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
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-rose-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🧘</p>
            <h2 className='text-2xl font-bold mb-2'>Body Parts!</h2>
            <p className='mb-4'>Point to the body part!</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && targetPart && (
          <div className='text-center'>
            <p className='text-2xl font-bold mb-4'>Point to your:</p>
            <p className='text-5xl font-bold text-rose-600 mb-4'>
              {targetPart.name}
            </p>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              {parts.map((part) => (
                <button
                  type='button'
                  key={part.name}
                  onClick={() => handleAnswer(part)}
                  className='p-6 bg-white rounded-xl shadow-md hover:bg-rose-50 transition-all text-6xl'
                >
                  {part.emoji}
                </button>
              ))}
            </div>
            <p className='text-lg font-medium text-purple-600'>{feedback}</p>
            <div className='flex gap-4 mt-4'>
              <div className='bg-green-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Correct</p>
                <p className='text-2xl font-bold'>{correct}</p>
              </div>
              <div className='bg-rose-100 px-4 py-2 rounded-xl text-center'>
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
            <p className='text-xl mb-4'>You got {correct} right!</p>
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-rose-500 text-white rounded-xl font-bold mr-4'
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

export function BodyParts() {
  return (
    <GamePage title='Body Parts' gameId='body-parts'>
      {({ score, setScore, currentLevel, setCurrentLevel, handleFinish }) => (
        <BodyPartsGame
          score={score}
          setScore={setScore}
          currentLevel={currentLevel}
          setCurrentLevel={setCurrentLevel}
          finishContext={handleFinish}
        />
      )}
    </GamePage>
  );
}
