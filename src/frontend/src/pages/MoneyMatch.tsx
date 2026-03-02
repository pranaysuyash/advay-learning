import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  generateAmount,
  COINS,
  type Coin,
} from '../games/moneyMatchLogic';

export function MoneyMatch() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetAmount, setTargetAmount] = useState(0);
  const [selectedCoins, setSelectedCoins] = useState<Coin[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [feedback, setFeedback] = useState('');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('money-match');

  useGameSessionProgress({
    gameName: 'Money Match',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startGame = () => {
    const amount = generateAmount(currentLevel);
    setTargetAmount(amount);
    setSelectedCoins([]);
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const addCoin = (coin: Coin) => {
    if (gameState !== 'playing') return;
    playClick();
    setSelectedCoins((prev) => [...prev, coin]);
    const total =
      selectedCoins.reduce((sum, c) => sum + c.value, 0) + coin.value;
    if (total === targetAmount) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 25);
      setFeedback('Perfect!');
      setTimeout(() => {
        if (round >= 4) {
          setGameState('complete');
        } else {
          setRound((r) => r + 1);
          const newAmount = generateAmount(currentLevel);
          setTargetAmount(newAmount);
          setSelectedCoins([]);
          setFeedback('');
        }
      }, 1000);
    } else if (total > targetAmount) {
      playError();
      setFeedback(`Too much! You have ${total}¢`);
      setTimeout(() => setSelectedCoins([]), 1000);
    }
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

  const currentTotal = selectedCoins.reduce((sum, c) => sum + c.value, 0);

  return (
    <GameContainer
      title='Money Match'
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
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>💰</p>
            <h2 className='text-2xl font-bold mb-2'>Money Match!</h2>
            <p className='mb-4'>Count the coins to make the amount!</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-green-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className='text-center'>
            <p className='text-xl font-bold mb-2'>Make this amount:</p>
            <p className='text-5xl font-bold text-green-600 mb-4'>
              ${(targetAmount / 100).toFixed(2)}
            </p>
            <div className='bg-yellow-100 p-4 rounded-xl mb-4 min-h-20 flex flex-wrap justify-center gap-2'>
              {selectedCoins.map((coin, idx) => (
                <span key={idx} className='text-3xl'>
                  {coin.emoji}
                </span>
              ))}
              {selectedCoins.length === 0 && (
                <span className='text-gray-400'>Tap coins below!</span>
              )}
            </div>
            <p className='text-lg font-bold mb-4'>
              Total: ${(currentTotal / 100).toFixed(2)}
            </p>
            <div className='flex gap-3 mb-4'>
              {COINS.map((coin) => (
                <button
                  key={coin.name}
                  type='button'
                  onClick={() => addCoin(coin)}
                  className='px-4 py-3 bg-yellow-200 rounded-xl font-bold hover:bg-yellow-300 flex flex-col items-center'
                >
                  <span className='text-2xl'>{coin.emoji}</span>
                  <span className='text-xs'>
                    ${(coin.value / 100).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={() => {
                playClick();
                setSelectedCoins([]);
              }}
              className='px-4 py-2 bg-gray-200 rounded-lg text-sm'
            >
              Clear
            </button>
            <p className='text-lg font-medium text-purple-600 mt-2'>
              {feedback}
            </p>
            <div className='flex gap-4 mt-4'>
              <div className='bg-green-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Correct</p>
                <p className='text-2xl font-bold'>{correct}</p>
              </div>
              <div className='bg-yellow-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm'>Round</p>
                <p className='text-2xl font-bold'>{round + 1}/5</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Money Master!</h2>
            <p className='text-xl mb-4'>You got {correct} right!</p>
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-green-500 text-white rounded-xl font-bold mr-4'
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
