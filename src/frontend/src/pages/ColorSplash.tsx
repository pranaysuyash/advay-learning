import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { 
  LEVELS, 
  generateObjects, 
  splashObject, 
  COLORS, 
  type ColorObject, 
  type ColorName 
} from '../games/colorSplashLogic';

export function ColorSplash() {
  const navigate = useNavigate();
  const [currentLevel, _setCurrentLevel] = useState(1);
  const [objects, setObjects] = useState<ColorObject[]>([]);
  const [targetColor, setTargetColor] = useState<ColorName>('red');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [correct, setCorrect] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  const { playClick, playSuccess, playError, playPop } = useAudio();
  const { onGameComplete } = useGameDrops('color-splash');
  useGameSessionProgress({ gameName: 'Color Splash', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const level = LEVELS.find(l => l.id === currentLevel) || LEVELS[0];

  const startGame = useCallback(() => {
    const { objects: newObjects, targetColor: newTarget } = generateObjects(level);
    setObjects(newObjects);
    setTargetColor(newTarget);
    setScore(0);
    setCorrect(0);
    setTimeLeft(level.timeLimit);
    setGameState('playing');
    playClick();
  }, [level, playClick]);

  const handleObjectClick = useCallback((objectId: number) => {
    if (gameState !== 'playing') return;

    const result = splashObject(objects, objectId, targetColor);
    
    if (result.correct) {
      playPop();
      setObjects(prev => prev.map(o => 
        o.id === objectId ? { ...o, splashed: true } : o
      ));
      setCorrect(c => c + 1);
      setScore(s => s + result.scoreDelta);

      if (result.allSplashed) {
        setGameState('complete');
        onGameComplete(score + 50);
        playSuccess();
      }
    } else {
      playError();
      setScore(s => Math.max(s + result.scoreDelta, 0));
    }
  }, [gameState, objects, targetColor, score, onGameComplete, playPop, playError, playSuccess]);

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
    <GameContainer title="Color Splash" onHome={handleBack} reportSession={false}>
      <div className="relative w-full h-full bg-gradient-to-b from-amber-50 to-orange-100 rounded-lg overflow-hidden">
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h2 className="text-4xl font-bold text-orange-600 mb-4">Color Splash!</h2>
            <p className="text-lg text-orange-700 mb-2 text-center px-4">
              Splash all the <span className="font-bold text-2xl" style={{ color: COLORS[targetColor].hex }}>{targetColor}</span> items!
            </p>
            <p className="text-sm text-orange-500 mb-8">Tap the right colors to splash them!</p>
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-4 bg-orange-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-orange-600 transition-colors"
            >
              Start Splashing!
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <h2 className="text-4xl font-bold text-green-600 mb-4">Amazing!</h2>
            <p className="text-2xl text-green-700 mb-2">You splashed {correct} items!</p>
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
            <div className="absolute top-4 left-4 bg-white/90 rounded-xl px-6 py-3 shadow-lg">
              <p className="text-lg font-bold">
                Splash: <span className="text-2xl" style={{ color: COLORS[targetColor].hex }}>{targetColor.toUpperCase()}</span>
              </p>
            </div>

            <div className="absolute top-4 right-4 bg-white/90 rounded-lg px-4 py-2">
              <p className="text-lg font-bold text-orange-500">
                Time: {timeLeft}s
              </p>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/80 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-600">Score: {score}</p>
            </div>

            {objects.map((obj) => (
              <button
                key={obj.id}
                type="button"
                onClick={() => handleObjectClick(obj.id)}
                disabled={obj.splashed}
                className={`absolute flex items-center justify-center text-4xl transition-all duration-300 ${
                  obj.splashed 
                    ? 'opacity-0 scale-150 pointer-events-none' 
                    : 'hover:scale-110 active:scale-95'
                }`}
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: obj.size,
                  height: obj.size,
                }}
              >
                {obj.emoji}
              </button>
            ))}
          </>
        )}
      </div>
    </GameContainer>
  );
}
