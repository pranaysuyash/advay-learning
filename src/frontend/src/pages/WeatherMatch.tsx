import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateGame, type Weather, type Clothing } from '../games/weatherMatchLogic';

interface GamePair {
  weather: Weather;
  clothing: Clothing;
}

export function WeatherMatch() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pairs, setPairs] = useState<GamePair[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<Weather | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('weather-match');

  useGameSessionProgress({ gameName: 'Weather Match', score, level: currentLevel, isPlaying: true, metaData: { correct } });

  const startGame = () => {
    const newPairs = generateGame(currentLevel);
    setPairs(newPairs);
    setSelectedWeather(null);
    setScore(0);
    setCorrect(0);
    setGameState('playing');
  };

  const handleWeatherClick = (weather: Weather) => {
    if (gameState !== 'playing') return;
    playClick();
    setSelectedWeather(weather);
  };

  const handleClothingClick = (pair: GamePair) => {
    if (!selectedWeather || gameState !== 'playing') return;
    playClick();
    if (pair.weather.name === selectedWeather.name) {
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 30);
      if (correct + 1 >= pairs.length) {
        setGameState('complete');
      }
    } else {
      playError();
    }
    setSelectedWeather(null);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Weather Match" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-sky-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🌤️</p>
            <h2 className="text-2xl font-bold mb-2">Weather Match!</h2>
            <p className="mb-4">Match weather to clothing!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center">
            <p className="text-lg font-bold mb-4">Select weather, then pick the right clothing!</p>
            <div className="flex gap-4 mb-6">
              {pairs.map((pair) => (
                <button key={pair.weather.name} type="button" onClick={() => handleWeatherClick(pair.weather)}
                  className={`p-4 rounded-xl transition-all ${selectedWeather?.name === pair.weather.name ? 'bg-sky-200 ring-2 ring-sky-500' : 'bg-white shadow-md hover:bg-sky-50'}`}>
                  <div className="text-4xl">{pair.weather.emoji}</div>
                  <div className="font-bold text-sm">{pair.weather.name}</div>
                </button>
              ))}
            </div>
            {selectedWeather && (
              <div className="mb-4">
                <p className="text-lg font-bold mb-2">What should you wear for {selectedWeather.name} weather?</p>
                <div className="flex gap-4 justify-center">
                  {pairs.map((pair) => (
                    <button key={pair.clothing.name} type="button" onClick={() => handleClothingClick(pair)}
                      className="p-4 bg-white rounded-xl shadow-md hover:bg-sky-50 text-4xl">
                      {pair.clothing.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4 mt-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-sky-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Score</p><p className="text-2xl font-bold">{score}</p></div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-xl mb-4">You matched all weather!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
