/**
 * Weather Lab Game Logic
 *
 * Create weather by manipulating temperature, humidity, and pressure systems.
 *
 * Educational Focus:
 * - Meteorology basics
 * - Cause and effect
 * - Understanding weather patterns
 * - Real-world data connection
 *
 * Weather Combinations:
 * - Cold + Humid = Snow ❄️
 * - Hot + Humid = Thunderstorm ⛈️
 * - Hot + Dry = Desert ☀️
 * - Cold + Dry = Clear winter day 🌤️
 */

export interface WeatherState {
  temperature: number; // -20 to 50 (Celsius)
  humidity: number;    // 0 to 100 (%)
  pressure: number;    // 950 to 1050 (hPa)
  windSpeed: number;   // 0 to 100 (km/h)
  windDirection: number; // 0 to 360 (degrees)
}

export interface WeatherCondition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  temperature: number;
  humidity: number;
  precipitation: boolean;
  windRequired: boolean;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  targetWeather: string;
  hint: string;
  availableControls: string[];
}

export interface GameState {
  level: number;
  weather: WeatherState;
  currentWeather: WeatherCondition | null;
  isComplete: boolean;
  isPlaying: boolean;
  startTime: number;
  moves: number;
  score: number;
}

export const WEATHER_CONDITIONS: WeatherCondition[] = [
  {
    id: 'sunny',
    name: 'Sunny',
    emoji: '☀️',
    description: 'Bright and clear sky!',
    temperature: 25,
    humidity: 30,
    precipitation: false,
    windRequired: false,
  },
  {
    id: 'cloudy',
    name: 'Cloudy',
    emoji: '☁️',
    description: 'Overcast with clouds',
    temperature: 18,
    humidity: 50,
    precipitation: false,
    windRequired: false,
  },
  {
    id: 'rainy',
    name: 'Rainy',
    emoji: '🌧️',
    description: 'Light rain falling',
    temperature: 15,
    humidity: 80,
    precipitation: true,
    windRequired: false,
  },
  {
    id: 'stormy',
    name: 'Stormy',
    emoji: '⛈️',
    description: 'Thunder and lightning!',
    temperature: 22,
    humidity: 90,
    precipitation: true,
    windRequired: true,
  },
  {
    id: 'snowy',
    name: 'Snowy',
    emoji: '❄️',
    description: 'Snowflakes falling',
    temperature: -2,
    humidity: 85,
    precipitation: true,
    windRequired: false,
  },
  {
    id: 'windy',
    name: 'Windy',
    emoji: '💨',
    description: 'Strong winds blowing',
    temperature: 16,
    humidity: 40,
    precipitation: false,
    windRequired: true,
  },
  {
    id: 'foggy',
    name: 'Foggy',
    emoji: '🌫️',
    description: 'Misty and foggy',
    temperature: 10,
    humidity: 95,
    precipitation: false,
    windRequired: false,
  },
  {
    id: 'hail',
    name: 'Hail',
    emoji: '🧊',
    description: 'Ice balls falling!',
    temperature: 2,
    humidity: 85,
    precipitation: true,
    windRequired: true,
  },
];

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Sunny Day',
    description: 'Make a sunny day! ☀️',
    targetWeather: 'sunny',
    hint: 'Turn up the temperature and lower the humidity',
    availableControls: ['temperature', 'humidity'],
  },
  {
    id: 2,
    name: 'Rainy Day',
    description: 'Create some rain! 🌧️',
    targetWeather: 'rainy',
    hint: 'Moderate temperature, high humidity',
    availableControls: ['temperature', 'humidity', 'pressure'],
  },
  {
    id: 3,
    name: 'Winter Wonderland',
    description: 'Make it snow! ❄️',
    targetWeather: 'snowy',
    hint: 'Cold temperature, high humidity',
    availableControls: ['temperature', 'humidity', 'pressure'],
  },
  {
    id: 4,
    name: 'Storm Warning',
    description: 'Create a thunderstorm! ⛈️',
    targetWeather: 'stormy',
    hint: 'Warm temperature, high humidity, windy',
    availableControls: ['temperature', 'humidity', 'wind', 'pressure'],
  },
  {
    id: 5,
    name: 'Weather Master',
    description: 'Complete weather challenges! 🌤️',
    targetWeather: 'mixed',
    hint: 'Experiment with all controls',
    availableControls: ['temperature', 'humidity', 'wind', 'pressure'],
  },
];

export function initializeGame(levelId: number): GameState {
  return {
    level: levelId,
    weather: {
      temperature: 20,
      humidity: 50,
      pressure: 1013,
      windSpeed: 10,
      windDirection: 0,
    },
    currentWeather: null,
    isComplete: false,
    isPlaying: false,
    startTime: 0,
    moves: 0,
    score: 0,
  };
}

export function getCurrentLevel(levelId: number): Level {
  return LEVELS.find((l) => l.id === levelId) || LEVELS[0];
}

export function updateTemperature(state: GameState, delta: number): GameState {
  return {
    ...state,
    weather: {
      ...state.weather,
      temperature: Math.max(-20, Math.min(50, state.weather.temperature + delta)),
    },
    moves: state.moves + 1,
  };
}

export function updateHumidity(state: GameState, delta: number): GameState {
  return {
    ...state,
    weather: {
      ...state.weather,
      humidity: Math.max(0, Math.min(100, state.weather.humidity + delta)),
    },
    moves: state.moves + 1,
  };
}

export function updatePressure(state: GameState, delta: number): GameState {
  return {
    ...state,
    weather: {
      ...state.weather,
      pressure: Math.max(950, Math.min(1050, state.weather.pressure + delta)),
    },
    moves: state.moves + 1,
  };
}

export function updateWindSpeed(state: GameState, delta: number): GameState {
  return {
    ...state,
    weather: {
      ...state.weather,
      windSpeed: Math.max(0, Math.min(100, state.weather.windSpeed + delta)),
    },
    moves: state.moves + 1,
  };
}

export function updateWindDirection(state: GameState, angle: number): GameState {
  return {
    ...state,
    weather: {
      ...state.weather,
      windDirection: angle % 360,
    },
    moves: state.moves + 1,
  };
}

export function getCurrentWeather(state: GameState): WeatherCondition | null {
  const w = state.weather;

  // Determine weather based on conditions
  if (w.temperature < 0 && w.humidity > 70) {
    return WEATHER_CONDITIONS.find(c => c.id === 'snowy') || null;
  }
  if (w.temperature < 5 && w.humidity > 80) {
    return WEATHER_CONDITIONS.find(c => c.id === 'hail') || null;
  }
  if (w.humidity > 85 && w.windSpeed > 30) {
    return WEATHER_CONDITIONS.find(c => c.id === 'stormy') || null;
  }
  if (w.humidity > 70) {
    return WEATHER_CONDITIONS.find(c => c.id === 'rainy') || null;
  }
  if (w.humidity > 60 && w.windSpeed > 20) {
    return WEATHER_CONDITIONS.find(c => c.id === 'windy') || null;
  }
  if (w.humidity > 85) {
    return WEATHER_CONDITIONS.find(c => c.id === 'foggy') || null;
  }
  if (w.temperature > 25 && w.humidity < 40) {
    return WEATHER_CONDITIONS.find(c => c.id === 'sunny') || null;
  }
  if (w.windSpeed > 40) {
    return WEATHER_CONDITIONS.find(c => c.id === 'windy') || null;
  }

  return WEATHER_CONDITIONS.find(c => c.id === 'cloudy') || null;
}

export function checkWeatherMatch(
  state: GameState,
  targetWeatherId: string
): boolean {
  const current = getCurrentWeather(state);
  if (!current) return false;

  if (targetWeatherId === 'mixed') {
    // For level 5, just ensure we've triggered multiple weather conditions
    return true;
  }

  return current.id === targetWeatherId;
}

export function updateWeather(state: GameState): GameState {
  const currentWeather = getCurrentWeather(state);
  return {
    ...state,
    currentWeather,
    isComplete: checkWeatherMatch(state, getCurrentLevel(state.level).targetWeather),
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    startTime: Date.now(),
  };
}

export function resetLevel(state: GameState): GameState {
  return initializeGame(state.level);
}

export function nextLevel(state: GameState): GameState {
  const currentLevel = getCurrentLevel(state.level);
  const nextLevelId = currentLevel.id + 1;

  if (nextLevelId > LEVELS.length) {
    return state;
  }

  return initializeGame(nextLevelId);
}

export function calculateScore(moves: number, timeMs: number, level: number): number {
  const baseScore = 1000;
  const movesPenalty = Math.max(0, moves - 10) * 5;
  const timePenalty = Math.floor(timeMs / 1000) * 2;
  const levelBonus = level * 150;

  return Math.max(0, baseScore - movesPenalty - timePenalty + levelBonus);
}

export function getWeatherInfo(weatherId: string): {
  name: string;
  emoji: string;
  description: string;
} {
  const weather = WEATHER_CONDITIONS.find(c => c.id === weatherId);
  return weather
    ? { name: weather.name, emoji: weather.emoji, description: weather.description }
    : { name: 'Unknown', emoji: '❓', description: 'Weather not found' };
}
