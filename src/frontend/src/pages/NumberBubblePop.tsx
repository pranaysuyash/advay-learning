import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateBubbles, type Bubble } from '../games/numberBubblePopLogic';

export function NumberBubblePop() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('number-bubble-pop');

  useGameSessionProgress({ gameName: 'Number Bubble Pop', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const config = LEVELS[currentLevel - 1];
    const target = Math.floor(Math.random() * config.numberRange) + 1;
    setTargetNumber(target);
    setBubbles(generateBubbles(5, target, config.numberRange));
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
  };

  const handleBubbleClick = (bubble: Bubble) => {
    if (gameState !== 'playing') return;
    playClick();
    if (bubble.number === targetNumber) {
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 25);
      if (round >= 4) {
        setGameState('complete');
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          startGame();
        }, 500);
      }
    } else {
      playError();
      setScore(s => Math.max(s - 10, 0));
    }
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Number Bubble Pop" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🫧</p>
            <h2 className="text-2xl font-bold mb-2">Number Bubble Pop!</h2>
            <p className="mb-4">Pop bubbles with the number!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="relative w-80 h-80 bg-sky-50 rounded-full overflow-hidden">
            <div className="absolute top-4 left-0 right-0 text-center bg-white/80 py-2">
              <p className="text-lg font-bold">Pop number: <span className="text-blue-600 text-2xl">{targetNumber}</span></p>
            </div>
            {bubbles.map((bubble) => (
              <button key={bubble.id} type="button" onClick={() => handleBubbleClick(bubble)}
                className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 text-white text-xl font-bold shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                style={{ left: bubble.x, top: bubble.y }}>
                {bubble.number}
              </button>
            ))}
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Popping Good!</h2>
            <p className="text-xl mb-4">You popped {correct} bubbles!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
