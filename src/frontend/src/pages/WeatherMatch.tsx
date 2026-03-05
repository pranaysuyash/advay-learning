import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { LEVELS, generateGame, calculateScore, type Weather, type Clothing } from '../games/weatherMatchLogic';
import { triggerHaptic } from '../utils/haptics';

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
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();
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
    resetStreak();
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
      // Correct match - build streak
      incrementStreak();

      // Calculate score with streak and level multiplier
      const points = calculateScore(streak + 1, currentLevel);
      setScore(s => s + points);

      // Show score popup
      setScorePopup({ points });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');

      playSuccess();
      setCorrect(c => c + 1);
      if (correct + 1 >= pairs.length) {
        setGameState('complete');
        triggerHaptic('celebration');
      }
    } else {
      // Wrong match - break streak
      resetStreak();
      triggerHaptic('error');
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
            <p className="mb-2">Match weather to clothing!</p>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 mb-4 inline-block">
              <p className="font-bold mb-1">🎯 Scoring:</p>
              <p>Base 15 pts + streak bonus</p>
              <p>× Level: L1 1× | L2 1.5× | L3 2×</p>
            </div>
            <br />
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform">Start!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="text-center">
            {/* Streak HUD */}
            <div className="flex items-center justify-center gap-3 bg-white rounded-xl border-2 border-orange-200 px-4 py-2 mb-4 shadow-sm">
              <span className="font-black text-lg">🔥 Streak</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={
                      streak >= i * 2
                        ? '/assets/kenney/platformer/hud/hud_heart.png'
                        : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                    }
                    alt={streak >= i * 2 ? 'filled heart' : 'empty heart'}
                    className="w-6 h-6"
                  />
                ))}
              </div>
              <span className="font-black text-2xl text-orange-500 min-w-[2ch] text-center">
                {streak}
              </span>
            </div>

            {/* Streak milestone popup */}
            {showMilestone && (
              <div className="animate-bounce bg-orange-100 border-2 border-orange-300 rounded-xl px-6 py-3 mb-4 inline-block">
                <p className="text-xl font-black text-orange-600">
                  🔥 {streak} Match Streak! 🔥
                </p>
              </div>
            )}

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
            {/* Score popup */}
            {scorePopup && (
              <div className="font-black text-3xl text-green-500 animate-bounce mb-2">
                +{scorePopup.points}
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center border-2 border-green-200">
                <p className="text-xs font-black uppercase text-green-600">Correct</p>
                <p className="text-2xl font-bold text-green-700">{correct}</p>
              </div>
              <div className="bg-sky-100 px-4 py-2 rounded-xl text-center border-2 border-sky-200">
                <p className="text-xs font-black uppercase text-sky-600">Score</p>
                <p className="text-2xl font-bold text-sky-700">{score}</p>
              </div>
              <div className="bg-orange-100 px-4 py-2 rounded-xl text-center border-2 border-orange-200">
                <p className="text-xs font-black uppercase text-orange-600">Best Streak</p>
                <p className="text-2xl font-bold text-orange-700">{maxStreak}</p>
              </div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-xl mb-4">You matched all weather!</p>
            {/* Streak badge */}
            {maxStreak >= 5 && (
              <div className="flex items-center justify-center gap-2 bg-orange-100 border-2 border-orange-300 px-4 py-2 rounded-full mb-4">
                <img
                  src="/assets/kenney/platformer/collectibles/star.png"
                  alt="star"
                  className="w-6 h-6"
                />
                <span className="font-black text-orange-700">
                  Best Streak: {maxStreak}!
                </span>
              </div>
            )}
            <div className="flex justify-center gap-4 mb-4">
              <div className="bg-sky-50 border-2 border-sky-200 px-6 py-3 rounded-xl text-center">
                <p className="text-xs font-black uppercase text-sky-600">Score</p>
                <p className="text-3xl font-black text-sky-700">{score}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 px-6 py-3 rounded-xl text-center">
                <p className="text-xs font-black uppercase text-orange-600">Max Streak</p>
                <p className="text-3xl font-black text-orange-700">{maxStreak}</p>
              </div>
            </div>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-sky-500 text-white rounded-xl font-bold mr-4 hover:scale-105 transition-transform">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
