/**
 * Weather Lab Game
 *
 * Control weather and learn meteorology for ages 4-10
 * @ticket S-003
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import {
  createInitialState,
  startChallenge,
  updateConditions,
  checkChallenge,
  submitChallenge,
  resetChallenge,
  getWeatherInfo,
  calculateFinalScore,
  CHALLENGES,
  type WeatherConditions,
  type GameState,
} from '../games/weatherLabLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

const MIN_TEMP = -10;
const MAX_TEMP = 40;

export const WeatherLabContent = memo(function WeatherLabComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('weather-lab');
  const { playClick, playSuccess, playError } = useAudio();
  const { speak } = useTTS();

  const [state, setState] = useState<GameState>(createInitialState());
  const [feedback, setFeedback] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (state.status !== 'playing') return;
    const timer = setInterval(() => {
      setState((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.status]);

  // Clear feedback after delay
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleStartChallenge = useCallback(
    (challengeId: string) => {
      playClick();
      setState(startChallenge(state, challengeId));
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (challenge) {
        void speak(challenge.description);
      }
    },
    [state, playClick, speak],
  );

  const handleUpdateConditions = useCallback(
    (updates: Partial<WeatherConditions>) => {
      setState((prev) => updateConditions(prev, updates));
      playClick();
    },
    [playClick],
  );

  const handleCheckChallenge = useCallback(() => {
    const result = checkChallenge(state);
    setFeedback(result.feedback);
    if (result.success) {
      playSuccess();
    } else {
      playError();
    }
  }, [state, playSuccess, playError]);

  const handleSubmitChallenge = useCallback(() => {
    setState((prev) => {
      const newState = submitChallenge(prev);
      if (newState.status === 'success') {
        void speak('Challenge completed! Great job!');
      } else {
        setFeedback('Not quite right. Check the hint and try again!');
        playError();
      }
      return newState;
    });
  }, [playError, speak]);

  const handleReset = useCallback(() => {
    playClick();
    setState((prev) => resetChallenge(prev));
    setFeedback(null);
  }, [playClick]);

  // Loading state
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return <AccessDenied gameName='Weather Lab' gameId='weather-lab' />;
  }

  // Menu state
  if (state.status === 'menu') {
    return (
      <GameContainer title='Weather Lab' onHome={() => navigate('/games')}>
        <div className='max-w-4xl mx-auto p-6'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-blue-700 mb-4'>
              🌦️ Weather Lab 🌦️
            </h2>
            <p className='text-gray-600 text-lg'>
              Become a meteorologist! Control temperature, humidity, and more to create different weather conditions.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {CHALLENGES.map((challenge) => (
              <motion.button
                key={challenge.id}
                onClick={() => handleStartChallenge(challenge.id)}
                className='p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-blue-100 hover:border-blue-300 text-left transition-all'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className='text-xl font-bold text-blue-700 mb-2'>{challenge.name}</h3>
                <p className='text-gray-600 text-sm mb-3'>{challenge.description}</p>
                <p className='text-blue-500 text-xs'>💡 {challenge.hint}</p>
              </motion.button>
            ))}
          </div>

          <div className='mt-8 p-4 bg-blue-50 rounded-xl'>
            <h3 className='font-bold text-blue-700 mb-2'>🌡️ Weather Combinations:</h3>
            <ul className='text-blue-600 text-sm space-y-1'>
              <li>❄️ Cold + Humid = Snow</li>
              <li>☀️ Hot + Dry = Desert</li>
              <li>⛈️ Hot + Very Humid = Thunderstorm</li>
              <li>🌧️ Moderate + Humid = Rain</li>
              <li>☁️ Moderate Humidity = Cloudy</li>
              <li>🌪️ Low Pressure + High Wind = Storm</li>
            </ul>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Success state
  if (state.status === 'success') {
    const finalScore = calculateFinalScore(state);
    return (
      <GameContainer title='Weather Lab' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='text-6xl mb-4'
          >
            🌈
          </motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-4'>Challenge Complete!</h2>
          <p className='text-xl text-gray-700 mb-2'>Score: {finalScore.totalScore}</p>
          <p className='text-gray-600 mb-2'>
            Weather types discovered: {finalScore.weathersDiscovered}
          </p>
          <div className='flex gap-4'>
            <button
              onClick={() => setState(createInitialState())}
              className='px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors'
            >
              Back to Menu
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const currentChallenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  const weatherInfo = state.currentWeather ? getWeatherInfo(state.currentWeather.type) : null;

  return (
    <GameContainer
      title={`Weather Lab: ${currentChallenge?.name || ''}`}
      onHome={() => navigate('/games')}
      score={state.score}
    >
      <div className='flex flex-col lg:flex-row gap-4 p-4'>
        {/* Controls Panel */}
        <div className='lg:w-80 bg-white rounded-xl shadow-md p-4'>
          <h3 className='font-bold text-gray-700 mb-4'>Weather Controls</h3>

          {/* Temperature */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              🌡️ Temperature: {state.conditions.temperature}°C
            </label>
            <input
              type='range'
              min={MIN_TEMP}
              max={MAX_TEMP}
              value={state.conditions.temperature}
              onChange={(e) =>
                handleUpdateConditions({ temperature: parseInt(e.target.value) })
              }
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
            />
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>Cold (-10°C)</span>
              <span>Hot (40°C)</span>
            </div>
          </div>

          {/* Humidity */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              💧 Humidity: {state.conditions.humidity}%
            </label>
            <input
              type='range'
              min={0}
              max={100}
              value={state.conditions.humidity}
              onChange={(e) =>
                handleUpdateConditions({ humidity: parseInt(e.target.value) })
              }
              className='w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer'
            />
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>Dry (0%)</span>
              <span>Humid (100%)</span>
            </div>
          </div>

          {/* Wind Speed */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              💨 Wind Speed: {state.conditions.windSpeed} km/h
            </label>
            <input
              type='range'
              min={0}
              max={100}
              value={state.conditions.windSpeed}
              onChange={(e) =>
                handleUpdateConditions({ windSpeed: parseInt(e.target.value) })
              }
              className='w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer'
            />
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>Calm</span>
              <span>Stormy</span>
            </div>
          </div>

          {/* Pressure */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              📊 Air Pressure: {state.conditions.pressure} hPa
            </label>
            <input
              type='range'
              min={980}
              max={1050}
              value={state.conditions.pressure}
              onChange={(e) =>
                handleUpdateConditions({ pressure: parseInt(e.target.value) })
              }
              className='w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer'
            />
            <div className='flex justify-between text-xs text-gray-500 mt-1'>
              <span>Low (Storm)</span>
              <span>High (Clear)</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className='flex gap-2 mt-6'>
            <button
              onClick={handleReset}
              className='flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm'
            >
              Reset
            </button>
            <button
              onClick={handleCheckChallenge}
              className='flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm'
            >
              Check
            </button>
            <button
              onClick={handleSubmitChallenge}
              className='flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm'
            >
              Submit
            </button>
          </div>
        </div>

        {/* Weather Display */}
        <div className='flex-1'>
          <div
            className={`relative rounded-xl overflow-hidden min-h-[400px] bg-gradient-to-br ${
              weatherInfo?.bgGradient || 'from-blue-400 to-blue-300'
            } p-8 transition-all duration-500`}
          >
            {state.currentWeather ? (
              <div className='text-center'>
                <motion.div
                  initial={{ scale: 0, y: -50 }}
                  animate={{ scale: 1, y: 0 }}
                  key={state.currentWeather.type}
                  className='text-8xl mb-4'
                >
                  {state.currentWeather.emoji}
                </motion.div>
                <h2 className='text-3xl font-bold text-white mb-2'>
                  {state.currentWeather.name}
                </h2>
                <p className='text-white text-lg mb-4'>{state.currentWeather.description}</p>
                <div className='bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-lg mx-auto'>
                  <p className='text-white text-sm'>📚 {state.currentWeather.educational}</p>
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-center h-full'>
                <p className='text-white text-xl'>Adjust the controls to create weather!</p>
              </div>
            )}

            {/* Weather particles effect */}
            <div className='absolute inset-0 pointer-events-none overflow-hidden'>
              {state.currentWeather?.type === 'snowy' && (
                <div className='snow-animation'>❄️</div>
              )}
              {state.currentWeather?.type === 'rainy' && (
                <div className='rain-animation'>🌧️</div>
              )}
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl text-center font-bold ${
                feedback.includes('Perfect') || feedback.includes('completed')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {feedback}
            </motion.div>
          )}

          {/* Challenge Info */}
          {currentChallenge && (
            <div className='mt-4 p-4 bg-white rounded-xl shadow-md'>
              <h4 className='font-bold text-gray-700'>{currentChallenge.name}</h4>
              <p className='text-gray-600 text-sm'>{currentChallenge.description}</p>
              <p className='text-blue-600 text-sm mt-2'>💡 {currentChallenge.hint}</p>
              <div className='mt-2 text-sm text-gray-500'>
                Attempts: {state.attempts} | Time: {Math.floor(state.timeElapsed / 60)}:
                {(state.timeElapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}

          {/* Discovered Weathers */}
          <div className='mt-4 p-4 bg-white rounded-xl shadow-md'>
            <h4 className='font-bold text-gray-700 mb-2'>🔍 Discovered Weather ({state.discoveredWeathers.length})</h4>
            <div className='flex flex-wrap gap-2'>
              {state.discoveredWeathers.map((weather) => {
                const info = getWeatherInfo(weather);
                return (
                  <span
                    key={weather}
                    className='px-3 py-1 rounded-full text-sm bg-gray-100'
                  >
                    {info.emoji} {info.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </GameContainer>
  );
});

export const WeatherLab = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='weather-lab' gameName='Weather Lab'>
      <WeatherLabContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default WeatherLab;
