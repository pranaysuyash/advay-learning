import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  generateFraction,
  generateOptions,
  type Fraction,
} from '../games/fractionPizzaLogic';

function renderPizza(fraction: Fraction) {
  const slices = [];
  const angle = 360 / fraction.denominator;
  for (let i = 0; i < fraction.denominator; i++) {
    const isFilled = i < fraction.numerator;
    slices.push(
      <div
        key={i}
        className={`absolute w-1/2 h-full origin-left ${isFilled ? 'bg-yellow-400' : 'bg-yellow-100'}`}
        style={{
          transform: `rotate(${i * angle}deg)`,
          border: '1px solid #ca8a04',
        }}
      />,
    );
  }
  return slices;
}

export function FractionPizza() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [fraction, setFraction] = useState<Fraction>({
    numerator: 1,
    denominator: 2,
  });
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [feedback, setFeedback] = useState('');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('fraction-pizza');

  useGameSessionProgress({
    gameName: 'Fraction Pizza',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startGame = () => {
    const newFraction = generateFraction(currentLevel);
    setFraction(newFraction);
    setOptions(generateOptions(newFraction));
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (answer: number) => {
    if (gameState !== 'playing') return;
    playClick();
    const correctAnswer = fraction.numerator / fraction.denominator;
    if (Math.abs(answer - correctAnswer) < 0.01) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 25);
      setFeedback('Delicious! Correct!');
    } else {
      playError();
      setFeedback(`The answer was ${correctAnswer}!`);
    }
    setTimeout(() => {
      if (round >= 4) {
        setGameState('complete');
      } else {
        setRound((r) => r + 1);
        const newFraction = generateFraction(currentLevel);
        setFraction(newFraction);
        setOptions(generateOptions(newFraction));
        setFeedback('');
      }
    }, 1500);
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(correct);
    navigate('/games');
  }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer
      title='Fraction Pizza'
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
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🍕</p>
            <h2 className='text-2xl font-bold mb-2'>Fraction Pizza!</h2>
            <p className='mb-4'>Learn fractions with pizza!</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className='text-center'>
            <p className='text-xl font-bold mb-4'>What fraction is shown?</p>
            <div
              className='relative w-48 h-48 rounded-full overflow-hidden mb-4 mx-auto'
              style={{ backgroundColor: '#fef3c7' }}
            >
              {renderPizza(fraction)}
            </div>
            <div className='flex gap-3 mb-4'>
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => handleAnswer(opt)}
                  className='px-6 py-3 bg-orange-100 rounded-xl font-bold hover:bg-orange-200 text-lg'
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className='text-lg font-medium text-purple-600'>{feedback}</p>
            <div className='flex gap-4 mt-4'>
              <div className='bg-green-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Correct</p>
                <p className='text-2xl font-bold'>{correct}</p>
              </div>
              <div className='bg-orange-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Round</p>
                <p className='text-2xl font-bold'>{round + 1}/5</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Pizza Master!</h2>
            <p className='text-xl mb-4'>You got {correct} right!</p>
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-orange-500 text-white rounded-xl font-bold mr-4'
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
