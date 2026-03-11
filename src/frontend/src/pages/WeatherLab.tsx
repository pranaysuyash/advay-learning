/**
 * Weather Lab Game
 *
 * Create weather by manipulating temperature, humidity, and pressure.
 *
 * Educational Focus:
 * - Meteorology basics
 * - Cause and effect
 * - Weather patterns
 * - Real-world data connection
 *
 * Controls:
 * - Temperature slider (cold ↔ hot)
 * - Humidity slider (dry ↔ humid)
 * - Wind speed control
 * - Pressure system visualization
 */

import { memo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import {
  initializeGame,
  getCurrentLevel,
  updateTemperature,
  updateHumidity,
  updateWindSpeed,
  updatePressure,
  updateWeather,
  startGame,
  resetLevel,
  nextLevel,
  calculateScore,
  getWeatherInfo,
  type GameState,
} from '../games/weatherLabLogic';

const WeatherLabContent = memo(function WeatherLabContent() {
  const [showMenu, setShowMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(1));
  const [showCelebration, setShowCelebration] = useState(false);
  
  const { streak, incrementStreak } = useStreakTracking();
  const { playPop, playSuccess } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('weather-lab');
  
  const level = getCurrentLevel(gameState.level);
  const currentWeather = gameState.currentWeather;
  
  const handleStart = useCallback(() => {
    setShowMenu(false);
    setGameState(startGame(gameState));
    if (ttsEnabled) {
      speak(level.description);
    }
  }, [gameState, level, ttsEnabled, speak]);
  
  const handleReset = useCallback(() => {
    setGameState(resetLevel(gameState));
  }, [gameState]);
  
  const handleNextLevel = useCallback(() => {
    const newState = nextLevel(gameState);
    setGameState(newState);
    setShowCelebration(false);
    const newLevel = getCurrentLevel(newState.level);
    if (ttsEnabled) {
      speak(newLevel.description);
    }
  }, [gameState, ttsEnabled, speak]);
  
  const handleMenu = useCallback(() => {
    setShowMenu(true);
  }, []);
  
  const handleTemperatureChange = useCallback((delta: number) => {
    const newState = updateTemperature(gameState, delta);
    const updated = updateWeather(newState);
    setGameState(updated);
    playPop();
    triggerHaptic('success');
  }, [gameState, playPop]);
  
  const handleHumidityChange = useCallback((delta: number) => {
    const newState = updateHumidity(gameState, delta);
    const updated = updateWeather(newState);
    setGameState(updated);
    playPop();
    triggerHaptic('success');
  }, [gameState, playPop]);
  
  const handleWindChange = useCallback((delta: number) => {
    const newState = updateWindSpeed(gameState, delta);
    const updated = updateWeather(newState);
    setGameState(updated);
    playPop();
    triggerHaptic('success');
  }, [gameState, playPop]);
  
  const handlePressureChange = useCallback((delta: number) => {
    const newState = updatePressure(gameState, delta);
    const updated = updateWeather(newState);
    setGameState(updated);
    playPop();
    triggerHaptic('success');
  }, [gameState, playPop]);
  
  useEffect(() => {
    if (gameState.isComplete && !showCelebration) {
      playSuccess();
      triggerHaptic('celebration');
      incrementStreak();
      setShowCelebration(true);
      
      const timeMs = Date.now() - gameState.startTime;
      const score = calculateScore(gameState.moves, timeMs, gameState.level);
      onGameComplete(score);
      
      if (ttsEnabled) {
        speak('Great weather creation!');
      }
    }
  }, [gameState.isComplete, showCelebration, playSuccess, incrementStreak, onGameComplete, gameState, ttsEnabled, speak]);
  
  const gameControls: GameControl[] = [
    { id: 'reset', label: 'Reset', icon: 'rotate-ccw', onClick: handleReset },
    { id: 'menu', label: 'Menu', icon: 'home', onClick: handleMenu },
  ];
  
  // Remove unused menuControls
  // const menuControls: GameControl[] = [
  //   { id: 'play', label: 'Play', icon: 'play', onClick: handleStart },
  // ];
  
  const renderControl = (label: string, value: number, min: number, max: number, onChange: (delta: number) => void) => {
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{label}</span>
          <span className="text-gray-600">{Math.round(value)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold hover:bg-gray-300"
            onClick={() => onChange(-5)}
          >
            −
          </button>
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <button
            type="button"
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold hover:bg-gray-300"
            onClick={() => onChange(5)}
          >
            +
          </button>
        </div>
      </div>
    );
  };
  
  const renderWeatherDisplay = () => {
    if (!currentWeather) {
      return (
        <div className="text-center p-8">
          <div className="text-6xl mb-4">☁️</div>
          <p className="text-gray-600">Adjust sliders to see the weather</p>
        </div>
      );
    }
    
    const info = getWeatherInfo(currentWeather.id);
    
    return (
      <motion.div
        className="text-center p-8 bg-gradient-to-b from-blue-100 to-white rounded-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        key={currentWeather.id}
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {info.emoji}
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-800">{info.name}</h3>
        <p className="text-gray-600 mt-2">{info.description}</p>
      </motion.div>
    );
  };
  
  const renderTargetWeather = () => {
    const targetInfo = getWeatherInfo(level.targetWeather);
    if (level.targetWeather === 'mixed') {
      return null;
    }
    
    return (
      <div className="bg-white/80 rounded-lg px-4 py-2 mb-4 text-center">
        <span className="text-gray-600">Target: </span>
        <span className="text-xl">{targetInfo.emoji}</span>
        <span className="font-medium ml-1">{targetInfo.name}</span>
      </div>
    );
  };
  
  if (showMenu) {
    return (
      <GameContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-blue-900 mb-2">🌦️ Weather Lab</h1>
            <p className="text-xl text-blue-800">{level.name}</p>
            <p className="text-gray-600 mt-2">{level.description}</p>
          </motion.div>
          
          <motion.button
            type="button"
            className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xl shadow-lg"
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Start Creating! 🌤️
          </motion.button>
          
          <VoiceInstructions
            instructions={`Welcome to Weather Lab! ${level.description} ${level.hint}`}
          />
        </div>
      </GameContainer>
    );
  }
  
  return (
    <GameContainer>
      <VoiceInstructions
        instructions={`${level.description} ${level.hint}`}
      />
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-gray-600">Level {gameState.level}</div>
          <div className="text-lg font-bold text-blue-900">{level.name}</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-gray-600">Streak</div>
          <div className="text-lg font-bold text-green-900">{streak}</div>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {renderTargetWeather()}
        
        {/* Weather Display */}
        <div className="w-full max-w-md mb-6">
          {renderWeatherDisplay()}
        </div>
        
        {/* Weather Animation Background */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-20"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(
                to bottom,
                ${currentWeather?.id === 'stormy' ? '#374151' :
                   currentWeather?.id === 'sunny' ? '#fbbf24' :
                   currentWeather?.id === 'snowy' ? '#e5e7eb' :
                   currentWeather?.id === 'rainy' ? '#6b7280' :
                   '#93c5fd'}
                ,
                ${currentWeather?.id === 'stormy' ? '#1f2937' :
                   currentWeather?.id === 'sunny' ? '#fde68a' :
                   currentWeather?.id === 'snowy' ? '#f3f4f6' :
                   currentWeather?.id === 'rainy' ? '#4b5563' :
                   '#bfdbfe'}
              )`,
            }}
          />
        </motion.div>
        
        {/* Controls */}
        <div className="w-full max-w-md bg-white/90 rounded-xl p-6 shadow-lg">
          {level.availableControls.includes('temperature') && (
            renderControl('Temperature (-20°C to 50°C)', gameState.weather.temperature, -20, 50, handleTemperatureChange)
          )}
          {level.availableControls.includes('humidity') && (
            renderControl('Humidity (0% to 100%)', gameState.weather.humidity, 0, 100, handleHumidityChange)
          )}
          {level.availableControls.includes('wind') && (
            renderControl('Wind Speed (0 to 100 km/h)', gameState.weather.windSpeed, 0, 100, handleWindChange)
          )}
          {level.availableControls.includes('pressure') && (
            renderControl('Pressure (950 to 1050 hPa)', gameState.weather.pressure, 950, 1050, handlePressureChange)
          )}
        </div>
        
        {/* Feedback */}
        <div className="mt-4 text-center text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-lg">
          {gameState.moves} adjustments made
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <GameControls controls={gameControls} position="bottom-left" />
      </div>
      
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-sm"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="text-6xl mb-4">🌦️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Weather Created!
              </h2>
              <p className="text-gray-600 mb-4">
                You made {currentWeather?.name} {currentWeather?.emoji}
              </p>
              
              {gameState.level < 5 ? (
                <button
                  type="button"
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold"
                  onClick={handleNextLevel}
                >
                  Next Level
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold"
                  onClick={handleMenu}
                >
                  Back to Menu
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameContainer>
  );
});

export default WeatherLabContent;
