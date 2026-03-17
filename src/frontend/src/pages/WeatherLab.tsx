/**
 * Weather Lab Game
 *
 * Control weather and learn meteorology for ages 4-10
 * @ticket S-003
 */

import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameCursor } from '../components/game/GameCursor';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import {
  createInitialState,
  startChallenge,
  updateConditions,
  checkChallenge,
  submitChallenge,
  resetChallenge,
  calculateFinalScore,
  CHALLENGES,
  type WeatherConditions,
  type GameState,
  type WeatherType,
} from '../games/weatherLabLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

const MIN_TEMP = -10;
const MAX_TEMP = 40;

// API Quota Protection
const API_QUOTA_KEY = 'weather_api_quota';
const API_CACHE_KEY = 'weather_cache';
const MAX_CALLS_PER_HOUR = 50; // Conservative limit for free tier
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface ApiQuota {
  calls: number;
  resetTime: number;
}

interface CachedWeather {
  lat: number;
  lon: number;
  cityName: string;
  data: RealWeatherData;
  timestamp: number;
}

// Check and update API quota
function checkQuota(): boolean {
  const now = Date.now();
  const quota: ApiQuota = JSON.parse(localStorage.getItem(API_QUOTA_KEY) || '{"calls":0,"resetTime":0}');
  
  // Reset if hour has passed
  if (now > quota.resetTime) {
    quota.calls = 0;
    quota.resetTime = now + 60 * 60 * 1000; // 1 hour from now
  }
  
  if (quota.calls >= MAX_CALLS_PER_HOUR) {
    return false;
  }
  
  quota.calls++;
  localStorage.setItem(API_QUOTA_KEY, JSON.stringify(quota));
  return true;
}

function getQuotaStatus(): { remaining: number; resetInMinutes: number } {
  const now = Date.now();
  const quota: ApiQuota = JSON.parse(localStorage.getItem(API_QUOTA_KEY) || '{"calls":0,"resetTime":0}');
  
  if (now > quota.resetTime) {
    return { remaining: MAX_CALLS_PER_HOUR, resetInMinutes: 0 };
  }
  
  return {
    remaining: Math.max(0, MAX_CALLS_PER_HOUR - quota.calls),
    resetInMinutes: Math.ceil((quota.resetTime - now) / 60000),
  };
}

// Cache management
function getCachedWeather(lat: number, lon: number): RealWeatherData | null {
  const cache: CachedWeather[] = JSON.parse(localStorage.getItem(API_CACHE_KEY) || '[]');
  const now = Date.now();
  
  const entry = cache.find((c) => c.lat === lat && c.lon === lon);
  if (entry && now - entry.timestamp < CACHE_DURATION_MS) {
    return entry.data;
  }
  return null;
}

function setCachedWeather(lat: number, lon: number, cityName: string, data: RealWeatherData) {
  const cache: CachedWeather[] = JSON.parse(localStorage.getItem(API_CACHE_KEY) || '[]');
  const now = Date.now();
  
  // Remove old entries for this location
  const filtered = cache.filter((c) => !(c.lat === lat && c.lon === lon));
  
  // Add new entry
  filtered.push({ lat, lon, cityName, data, timestamp: now });
  
  // Keep only last 20 entries
  while (filtered.length > 20) {
    filtered.shift();
  }
  
  localStorage.setItem(API_CACHE_KEY, JSON.stringify(filtered));
}

// Geocoding result
interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // State/Province
}

// Open-Meteo API response type
interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
}

// Weather code mapping from Open-Meteo WMO codes to our WeatherType
function mapWeatherCodeToType(code: number): WeatherType {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'cloudy';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 67) return 'rainy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'cloudy';
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    95: 'Thunderstorm',
  };
  return descriptions[code] || 'Unknown';
}

// Real weather data state
interface RealWeatherData {
  temperature: number;
  weatherType: WeatherType;
  description: string;
  cityName: string;
  cached?: boolean;
}

export const WeatherLabContent = memo(function WeatherLabComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('weather-lab');
  const { playClick, playSuccess, playError } = useAudio();
  const { speak } = useTTS();
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);

  const [state, setState] = useState<GameState>(createInitialState());
  const [feedback, setFeedback] = useState<string | null>(null);

  const isPlaying = state.status === 'playing';
  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);
  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);
  const { isReady: isHandTrackingReady } = useGameHandTracking({
    gameName: 'WeatherLab',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });

  // Real weather data state
  const [realWeather, setRealWeather] = useState<RealWeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showRealWeatherPanel, setShowRealWeatherPanel] = useState(true);
  
  // City search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Selected city is tracked via searchQuery and realWeather state
  
  // Quota status
  const [quotaStatus, setQuotaStatus] = useState(getQuotaStatus());
  const finalScore = calculateFinalScore(state).totalScore;
  const { resetAutoCompletion } = useAutoGameCompletion('weather-lab', {
    when: state.status === 'success',
    score: finalScore,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      weatherType: state.currentWeather?.type ?? null,
      cityName: realWeather?.cityName ?? null,
    },
  });

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

  // Fetch real weather data from Open-Meteo
  const fetchWeatherData = useCallback(async (lat: number, lon: number, cityName: string, skipCache = false) => {
    // Check quota
    if (!checkQuota()) {
      setQuotaStatus(getQuotaStatus());
      setWeatherError(`API quota exceeded. Try again in ${quotaStatus.resetInMinutes} minutes.`);
      return;
    }
    setQuotaStatus(getQuotaStatus());

    // Check cache first
    if (!skipCache) {
      const cached = getCachedWeather(lat, lon);
      if (cached) {
        setRealWeather({ ...cached, cityName, cached: true });
        applyWeatherToGame({ ...cached, cityName });
        return;
      }
    }

    setIsLoadingWeather(true);
    setWeatherError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: OpenMeteoResponse = await response.json();
      const weatherCode = data.current_weather.weathercode;
      const weatherType = mapWeatherCodeToType(weatherCode);

      const weatherData: RealWeatherData = {
        temperature: data.current_weather.temperature,
        weatherType,
        description: getWeatherDescription(weatherCode),
        cityName,
        cached: false,
      };

      // Cache the result
      setCachedWeather(lat, lon, cityName, weatherData);
      setRealWeather(weatherData);
      applyWeatherToGame(weatherData);
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Apply weather data to game state
  const applyWeatherToGame = useCallback((weather: RealWeatherData) => {
    const conditions: Partial<WeatherConditions> = {
      temperature: Math.max(MIN_TEMP, Math.min(MAX_TEMP, weather.temperature)),
      windSpeed: 20, // Default, will be updated from API
    };

    switch (weather.weatherType) {
      case 'clear':
        conditions.humidity = 30;
        conditions.pressure = 1020;
        conditions.windSpeed = 10;
        break;
      case 'cloudy':
        conditions.humidity = 60;
        conditions.pressure = 1010;
        conditions.windSpeed = 20;
        break;
      case 'rainy':
        conditions.humidity = 80;
        conditions.pressure = 1000;
        conditions.windSpeed = 30;
        break;
      case 'snowy':
        conditions.humidity = 70;
        conditions.pressure = 1015;
        conditions.windSpeed = 15;
        break;
      case 'thunderstorm':
        conditions.humidity = 85;
        conditions.pressure = 995;
        conditions.windSpeed = 60;
        break;
      case 'foggy':
        conditions.humidity = 90;
        conditions.pressure = 1015;
        conditions.windSpeed = 10;
        break;
      default:
        conditions.humidity = 50;
        conditions.pressure = 1013;
        conditions.windSpeed = 20;
    }

    setState((prev) => updateConditions(prev, conditions));
  }, []);

  // Search for cities using Open-Meteo Geocoding API
  const searchCities = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Check quota
    if (!checkQuota()) {
      setQuotaStatus(getQuotaStatus());
      setWeatherError(`Search quota exceeded. Try again in ${quotaStatus.resetInMinutes} minutes.`);
      return;
    }
    setQuotaStatus(getQuotaStatus());

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery) {
        void searchCities(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, searchCities]);

  // Get user's location with reverse geocoding
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get city name from reverse geocoding
        try {
          if (checkQuota()) {
            setQuotaStatus(getQuotaStatus());
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${latitude},${longitude}&count=1&language=en`
            );
            const data = await response.json();
            const cityName = data.results?.[0]?.name || 'Your Location';
            await fetchWeatherData(latitude, longitude, cityName);
          } else {
            await fetchWeatherData(latitude, longitude, 'Your Location');
          }
        } catch {
          await fetchWeatherData(latitude, longitude, 'Your Location');
        }
      },
      (error) => {
        setIsLoadingWeather(false);
        let errorMsg = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied. Please search for a city.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
        }
        setWeatherError(errorMsg);
      }
    );
  }, [fetchWeatherData]);

  // Handle city selection from search
  const handleCitySelect = useCallback((city: GeocodingResult) => {
    setSearchQuery(city.name + (city.country ? `, ${city.country}` : ''));
    setSearchResults([]);
    playClick();
    void fetchWeatherData(city.latitude, city.longitude, city.name);
  }, [fetchWeatherData, playClick]);

  // Initial weather fetch on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const handleStartChallenge = useCallback(
    (challengeId: string) => {
      playClick();
      resetAutoCompletion();
      setState(startChallenge(state, challengeId));
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (challenge) {
        void speak(challenge.description);
      }
    },
    [state, playClick, speak, resetAutoCompletion],
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
    resetAutoCompletion();
    setState((prev) => resetChallenge(prev));
    setFeedback(null);
  }, [playClick, resetAutoCompletion]);

  // Loading state
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDenied gameName='Weather Lab' gameId='weather-lab' />;
  }

  const currentChallenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);

  return (
    <GameContainer
      title='Weather Lab'
      onHome={() => navigate('/games')}
      score={state.status === 'success' ? finalScore : undefined}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div ref={gameAreaRef} className='flex flex-col lg:flex-row gap-4 p-4 relative'>
        {/* Main Game Area */}
        <div className='flex-1'>
          {/* Challenge Selector */}
          {state.status === 'menu' && (
            <div className='mb-6'>
              <h3 className='text-xl font-bold text-sky-700 mb-4'>Select a Challenge</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {CHALLENGES.map((challenge) => (
                  <motion.button
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartChallenge(challenge.id)}
                    className='p-4 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl text-left hover:shadow-lg transition-shadow'
                  >
                    <div className='font-bold text-sky-800'>{challenge.name}</div>
                    <div className='text-sm text-sky-600 mt-1'>{challenge.description}</div>
                    <div className='text-xs text-sky-500 mt-2'>
                      Target: {challenge.targetWeather}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Game Controls */}
          {state.status === 'playing' && (
            <div className='space-y-6'>
              {/* Challenge Info */}
              <div className='bg-sky-50 p-4 rounded-xl'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='font-bold text-sky-800'>{currentChallenge?.name}</h3>
                    <p className='text-sm text-sky-600 mt-1'>{currentChallenge?.description}</p>
                  </div>
                  <div className='text-right'>
                    <div className='text-sm text-sky-600'>Time: {state.timeElapsed}s</div>
                    <div className='text-sm text-sky-600'>Score: {state.score}</div>
                  </div>
                </div>
              </div>

              {/* Weather Display */}
              <div className='bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl'>
                <div className='text-center mb-4'>
                  <div className='text-6xl mb-2'>🌤️</div>
                  <div className='text-xl font-bold text-gray-800'>
                    Current Conditions
                  </div>
                  <div className='text-3xl font-bold text-sky-600 mt-2'>
                    {state.conditions.temperature}°C
                  </div>
                </div>

                {/* Weather Metrics */}
                <div className='grid grid-cols-3 gap-4 mt-6'>
                  <div className='text-center'>
                    <div className='text-2xl'>💧</div>
                    <div className='text-sm text-gray-600'>Humidity</div>
                    <div className='font-bold'>{state.conditions.humidity}%</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl'>💨</div>
                    <div className='text-sm text-gray-600'>Wind</div>
                    <div className='font-bold'>{state.conditions.windSpeed} km/h</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl'>📊</div>
                    <div className='text-sm text-gray-600'>Pressure</div>
                    <div className='font-bold'>{state.conditions.pressure} hPa</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className='space-y-4'>
                {/* Temperature */}
                <div>
                  <label className='flex justify-between text-sm font-medium text-gray-700 mb-2'>
                    <span>🌡️ Temperature</span>
                    <span>{state.conditions.temperature}°C</span>
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
                    <span>{MIN_TEMP}°C</span>
                    <span>{MAX_TEMP}°C</span>
                  </div>
                </div>

                {/* Humidity */}
                <div>
                  <label className='flex justify-between text-sm font-medium text-gray-700 mb-2'>
                    <span>💧 Humidity</span>
                    <span>{state.conditions.humidity}%</span>
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
                </div>

                {/* Wind Speed */}
                <div>
                  <label className='flex justify-between text-sm font-medium text-gray-700 mb-2'>
                    <span>💨 Wind Speed</span>
                    <span>{state.conditions.windSpeed} km/h</span>
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
                </div>

                {/* Pressure */}
                <div>
                  <label className='flex justify-between text-sm font-medium text-gray-700 mb-2'>
                    <span>📊 Pressure</span>
                    <span>{state.conditions.pressure} hPa</span>
                  </label>
                  <input
                    type='range'
                    min={980}
                    max={1030}
                    value={state.conditions.pressure}
                    onChange={(e) =>
                      handleUpdateConditions({ pressure: parseInt(e.target.value) })
                    }
                    className='w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer'
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3'>
                <button
                  onClick={handleCheckChallenge}
                  className='flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors'
                >
                  Check Conditions
                </button>
                <button
                  onClick={handleSubmitChallenge}
                  className='flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors'
                >
                  Submit Challenge
                </button>
                <button
                  onClick={handleReset}
                  className='px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors'
                >
                  🔄
                </button>
              </div>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl text-center font-medium ${
                    feedback.includes('Great') || feedback.includes('completed')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {feedback}
                </motion.div>
              )}
            </div>
          )}

          {/* Success State */}
          {state.status === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='text-center py-12'
            >
              <div className='text-6xl mb-4'>🎉</div>
              <h3 className='text-2xl font-bold text-green-600 mb-2'>Challenge Complete!</h3>
              <p className='text-lg text-gray-600 mb-4'>
                Final Score: {calculateFinalScore(state).totalScore}
              </p>
              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => { resetAutoCompletion(); setState(createInitialState()); }}
                  className='px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600'
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Real Weather Panel */}
        <div className='lg:w-80'>
          <motion.div
            initial={false}
            animate={{ height: showRealWeatherPanel ? 'auto' : '60px' }}
            className='bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl overflow-hidden'
          >
            <button
              onClick={() => setShowRealWeatherPanel(!showRealWeatherPanel)}
              className='w-full p-4 flex items-center justify-between text-white'
            >
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>🌍</span>
                <span className='font-bold'>Real Weather</span>
              </div>
              <span>{showRealWeatherPanel ? '▼' : '▶'}</span>
            </button>

            {showRealWeatherPanel && (
              <div className='p-4 pt-0 space-y-4'>
                {/* Quota Status */}
                <div className='text-xs text-sky-100 bg-sky-700/50 px-2 py-1 rounded'>
                  API Calls: {quotaStatus.remaining}/{MAX_CALLS_PER_HOUR} remaining
                  {quotaStatus.resetInMinutes > 0 && ` (resets in ${quotaStatus.resetInMinutes}m)`}
                </div>

                {/* Search Box */}
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Search city...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full px-3 py-2 rounded-lg text-gray-800 placeholder-gray-400'
                  />
                  {isSearching && (
                    <div className='absolute right-3 top-2 text-gray-400'>...</div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className='bg-white rounded-lg overflow-hidden max-h-40 overflow-y-auto'>
                    {searchResults.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city)}
                        className='w-full px-3 py-2 text-left text-gray-800 hover:bg-sky-50 transition-colors text-sm'
                      >
                        {city.name}
                        {city.admin1 && `, ${city.admin1}`}
                        {city.country && ` (${city.country})`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Current Location Button */}
                <button
                  onClick={getUserLocation}
                  disabled={isLoadingWeather}
                  className='w-full py-2 bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-300 transition-colors disabled:opacity-50'
                >
                  {isLoadingWeather ? 'Loading...' : '📍 Use My Location'}
                </button>

                {/* Error Message */}
                {weatherError && (
                  <div className='bg-red-500/80 text-white p-3 rounded-lg text-sm'>
                    {weatherError}
                  </div>
                )}

                {/* Weather Display */}
                {realWeather && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='bg-white/10 backdrop-blur rounded-xl p-4 text-white'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <span className='font-bold'>{realWeather.cityName}</span>
                      {realWeather.cached && (
                        <span className='text-xs bg-sky-400/50 px-2 py-0.5 rounded'>cached</span>
                      )}
                    </div>
                    <div className='text-3xl font-bold'>{Math.round(realWeather.temperature)}°C</div>
                    <div className='text-sky-100'>{realWeather.description}</div>
                    <div className='mt-3 pt-3 border-t border-white/20'>
                      <button
                        onClick={() => {
                          playClick();
                          applyWeatherToGame(realWeather);
                          setFeedback(`Applied ${realWeather.cityName}'s weather!`);
                        }}
                        className='w-full py-2 bg-white text-sky-600 rounded-lg font-bold hover:bg-sky-50 transition-colors'
                      >
                        Apply to Lab
                      </button>
                    </div>
                  </motion.div>
                )}

                {!realWeather && !isLoadingWeather && !weatherError && (
                  <div className='text-center text-sky-100 text-sm py-4'>
                    Search for a city or use your location to see real weather data
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
        {cursor && (
          <GameCursor position={cursor} coordinateSpace="normalized" containerRef={gameAreaRef} isPinching={false} isHandDetected={isHandTrackingReady} size={64} color="#ef4444" />
        )}
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
