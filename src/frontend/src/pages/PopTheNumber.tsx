import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateBubbles, checkPop, type NumberBubble } from '../games/popTheNumberLogic';

export function PopTheNumber() {
  const navigate = useNavigate();
  const [currentLevel, _setCurrentLevel] = useState(1);
  const [bubbles, setBubbles] = useState<NumberBubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [nextExpected, setNextExpected] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(1);
  
  const timerRef = useRef<number | null>(null);
  const levelRef = useRef(LEVELS[0]);

  const { playClick, playSuccess, playError, playPop } = useAudio();
  const { onGameComplete } = useGameDrops('pop-the-number');
  useGameSessionProgress({ gameName: 'Pop the Number', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const level = LEVELS.find(l => l.id === currentLevel) || LEVELS[0];
  levelRef.current = level;

  const startGame = useCallback(() => {
    const newBubbles = generateBubbles(level);
    setBubbles(newBubbles);
    setNextExpected(1);
    setScore(0);
    setCorrect(0);
    setRound(1);
    setTimeLeft(level.timeLimit);
    setGameState('playing');
    playClick();
  }, [level, playClick]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
  }, [score, onGameComplete, playSuccess]);

  const handleBubbleClick = useCallback((bubbleId: number) => {
    if (gameState !== 'playing') return;

    const result = checkPop(bubbles, bubbleId, nextExpected);
    
    if (result.correct) {
      playPop();
      setBubbles(prev => prev.map(b => 
        b.id === bubbleId ? { ...b, popped: true } : b
      ));
      setCorrect(c => c + 1);
      setScore(s => s + 25);
      setNextExpected(result.nextExpected);

      if (result.allPopped) {
        const timeBonus = timeLeft * 2;
        setScore(s => s + timeBonus);
        
        if (round < level.rounds) {
          setTimeout(() => {
            setRound(r => r + 1);
            setBubbles(generateBubbles(level));
            setNextExpected(1);
          }, 500);
        } else {
          handleComplete();
        }
      }
    } else {
      playError();
      setScore(s => Math.max(s - 10, 0));
    }
  }, [gameState, bubbles, nextExpected, timeLeft, round, level, playPop, playError, handleComplete]);

  const handleBack = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('complete');
            onGameComplete(score);
            playSuccess();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, score, onGameComplete, playSuccess]);

  return (
    <GameContainer title="Pop the Number" onHome={handleBack} reportSession={false}>
      <div className="relative w-full h-full bg-gradient-to-b from-sky-100 to-blue-200 rounded-lg overflow-hidden">
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h2 className="text-4xl font-bold text-blue-600 mb-4">Pop the Number!</h2>
            <p className="text-lg text-blue-700 mb-2 text-center px-4">
              Pop the numbers in order!<br />
              <span className="text-2xl font-bold">1 → 2 → 3 → ...</span>
            </p>
            <p className="text-sm text-blue-500 mb-8">Tap them in the right order to score!</p>
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-4 bg-blue-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            >
              Start Popping!
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h2 className="text-4xl font-bold text-green-600 mb-4">Amazing!</h2>
            <p className="text-2xl text-green-700 mb-2">You popped {correct} numbers!</p>
            <p className="text-xl text-green-600 mb-8">Score: {score}</p>
            <button
              type="button"
              onClick={handleBack}
              className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors"
            >
              Play More Games!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="absolute top-4 left-4 bg-white/80 rounded-lg px-4 py-2">
              <p className="text-lg font-bold text-blue-600">
                Next: <span className="text-2xl">{nextExpected}</span>
              </p>
            </div>

            <div className="absolute top-4 right-4 bg-white/80 rounded-lg px-4 py-2">
              <p className="text-lg font-bold text-orange-500">
                Time: {timeLeft}s
              </p>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/80 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-600">
                Round {round}/{level.rounds}
              </p>
            </div>

            {bubbles.map((bubble) => (
              <button
                key={bubble.id}
                type="button"
                onClick={() => handleBubbleClick(bubble.id)}
                disabled={bubble.popped}
                className={`absolute flex items-center justify-center text-3xl font-bold rounded-full transition-all duration-300 ${
                  bubble.popped 
                    ? 'opacity-0 scale-150 pointer-events-none' 
                    : 'hover:scale-110 active:scale-95 shadow-lg'
                }`}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: bubble.size,
                  height: bubble.size,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: bubble.value === nextExpected ? '#3B82F6' : '#60A5FA',
                  color: 'white',
                }}
              >
                {bubble.value}
              </button>
            ))}
          </>
        )}
      </div>
    </GameContainer>
  );
}
