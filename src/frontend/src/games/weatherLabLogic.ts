/**
 * Weather Lab Game Logic
 *
 * Control weather and learn meteorology for ages 4-10
 * @ticket S-003
 */

export interface WeatherConditions {
  temperature: number; // -10 to 40 (Celsius)
  humidity: number; // 0 to 100 (percentage)
  windSpeed: number; // 0 to 100 (km/h)
  pressure: number; // 980 to 1050 (hPa)
}

export type WeatherType =
  | 'clear'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'stormy'
  | 'foggy'
  | 'desert'
  | 'winter-sun'
  | 'thunderstorm';

export interface WeatherResult {
  type: WeatherType;
  name: string;
  emoji: string;
  description: string;
  educational: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  hint: string;
  targetWeather: WeatherType;
  tolerance: Partial<WeatherConditions>;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  conditions: WeatherConditions;
  currentWeather: WeatherResult | null;
  score: number;
  attempts: number;
  timeElapsed: number;
  discoveredWeathers: WeatherType[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'make-it-snow',
    name: 'Make It Snow!',
    description: 'Create snowy weather by making it cold and humid.',
    hint: 'Set temperature below 0°C and humidity above 60%',
    targetWeather: 'snowy',
    tolerance: { temperature: 5, humidity: 15 },
  },
  {
    id: 'desert-heat',
    name: 'Desert Heat',
    description: 'Create desert conditions with hot and dry air.',
    hint: 'Set temperature above 30°C and humidity below 30%',
    targetWeather: 'desert',
    tolerance: { temperature: 5, humidity: 10 },
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm!',
    description: 'Create a thunderstorm with hot, humid conditions.',
    hint: 'Set temperature above 25°C and humidity above 80%',
    targetWeather: 'thunderstorm',
    tolerance: { temperature: 5, humidity: 10 },
  },
  {
    id: 'clear-winter',
    name: 'Clear Winter Day',
    description: 'Create a cold but clear winter day.',
    hint: 'Set temperature below 5°C and humidity below 40%',
    targetWeather: 'winter-sun',
    tolerance: { temperature: 5, humidity: 10 },
  },
  {
    id: 'gentle-rain',
    name: 'Gentle Rain',
    description: 'Create rainy weather with moderate conditions.',
    hint: 'Set temperature between 10-20°C and humidity above 70%',
    targetWeather: 'rainy',
    tolerance: { temperature: 5, humidity: 10 },
  },
  {
    id: 'stormy-weather',
    name: 'Stormy Weather',
    description: 'Create a storm with low pressure and high wind.',
    hint: 'Set pressure below 1000 hPa and wind speed above 60 km/h',
    targetWeather: 'stormy',
    tolerance: { pressure: 10, windSpeed: 10 },
  },
];

/**
 * Calculate weather based on conditions
 */
export function calculateWeather(conditions: WeatherConditions): WeatherResult {
  const { temperature, humidity, windSpeed, pressure } = conditions;

  // Thunderstorm: hot + very humid
  if (temperature > 25 && humidity > 80) {
    return {
      type: 'thunderstorm',
      name: 'Thunderstorm',
      emoji: '⛈️',
      description: 'Lightning flashes and thunder rumbles!',
      educational:
        'Thunderstorms form when warm, moist air rises quickly and creates cumulonimbus clouds.',
    };
  }

  // Snow: cold + humid
  if (temperature < 0 && humidity > 60) {
    return {
      type: 'snowy',
      name: 'Snowy',
      emoji: '❄️',
      description: 'Soft snowflakes are falling!',
      educational:
        'Snow forms when water vapor freezes directly into ice crystals in cold clouds.',
    };
  }

  // Desert: hot + dry
  if (temperature > 30 && humidity < 30) {
    return {
      type: 'desert',
      name: 'Desert Heat',
      emoji: '☀️',
      description: 'Hot and dry desert conditions!',
      educational:
        'Deserts have very low humidity because hot air can hold more moisture, preventing condensation.',
    };
  }

  // Clear winter: cold + dry
  if (temperature < 5 && humidity < 40) {
    return {
      type: 'winter-sun',
      name: 'Clear Winter Day',
      emoji: '🌨️',
      description: 'Cold but sunny winter day!',
      educational:
        'Cold air holds less moisture, so winter days are often clear and crisp.',
    };
  }

  // Storm: low pressure + high wind
  if (pressure < 1000 && windSpeed > 60) {
    return {
      type: 'stormy',
      name: 'Stormy',
      emoji: '🌪️',
      description: 'Strong winds and storm clouds!',
      educational:
        'Storms often form around areas of low pressure where air rushes in and rises.',
    };
  }

  // Rain: moderate temp + humid
  if (humidity > 70 && temperature > 5) {
    return {
      type: 'rainy',
      name: 'Rainy',
      emoji: '🌧️',
      description: 'Raindrops are falling from the sky!',
      educational:
        'Rain forms when water droplets in clouds become too heavy and fall to the ground.',
    };
  }

  // Cloudy: moderate humidity
  if (humidity > 50) {
    return {
      type: 'cloudy',
      name: 'Cloudy',
      emoji: '☁️',
      description: 'Gray clouds cover the sky.',
      educational:
        'Clouds form when warm, moist air rises and cools, causing water vapor to condense.',
    };
  }

  // Fog: high humidity + low wind + specific pressure
  if (humidity > 80 && windSpeed < 20 && pressure > 1010) {
    return {
      type: 'foggy',
      name: 'Foggy',
      emoji: '🌫️',
      description: 'Thick fog reduces visibility!',
      educational:
        'Fog is basically a cloud that forms at ground level when humid air cools.',
    };
  }

  // Default: clear
  return {
    type: 'clear',
    name: 'Clear Sky',
    emoji: '☀️',
    description: 'The sky is clear and blue!',
    educational:
      'Clear skies happen when there is little moisture in the air and conditions are stable.',
  };
}

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    conditions: {
      temperature: 20,
      humidity: 50,
      windSpeed: 20,
      pressure: 1013,
    },
    currentWeather: null,
    score: 0,
    attempts: 0,
    timeElapsed: 0,
    discoveredWeathers: [],
  };
}

/**
 * Start a challenge
 */
export function startChallenge(state: GameState, challengeId: string): GameState {
  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    conditions: {
      temperature: 20,
      humidity: 50,
      windSpeed: 20,
      pressure: 1013,
    },
    currentWeather: null,
    attempts: 0,
    timeElapsed: 0,
  };
}

/**
 * Update weather conditions
 */
export function updateConditions(
  state: GameState,
  updates: Partial<WeatherConditions>,
): GameState {
  const newConditions = {
    ...state.conditions,
    ...updates,
  };

  // Clamp values
  newConditions.temperature = Math.max(-10, Math.min(40, newConditions.temperature));
  newConditions.humidity = Math.max(0, Math.min(100, newConditions.humidity));
  newConditions.windSpeed = Math.max(0, Math.min(100, newConditions.windSpeed));
  newConditions.pressure = Math.max(980, Math.min(1050, newConditions.pressure));

  const weather = calculateWeather(newConditions);

  return {
    ...state,
    conditions: newConditions,
    currentWeather: weather,
    discoveredWeathers: state.discoveredWeathers.includes(weather.type)
      ? state.discoveredWeathers
      : [...state.discoveredWeathers, weather.type],
  };
}

/**
 * Check if current weather matches challenge target
 */
export function checkChallenge(state: GameState): { success: boolean; feedback: string } {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) {
    return { success: false, feedback: 'No challenge selected!' };
  }

  const currentWeather = state.currentWeather;
  if (!currentWeather) {
    return { success: false, feedback: 'Adjust the controls to create weather!' };
  }

  if (currentWeather.type === challenge.targetWeather) {
    return {
      success: true,
      feedback: `Perfect! You created ${currentWeather.name} conditions! ${currentWeather.educational}`,
    };
  }

  // Provide helpful feedback based on target
  const hints: Record<WeatherType, string> = {
    snowy: 'Try making it colder and more humid for snow.',
    desert: 'Try making it hotter and drier for desert conditions.',
    thunderstorm: 'Try making it very hot and very humid for thunderstorms.',
    'winter-sun': 'Try making it cold but dry for a clear winter day.',
    rainy: 'Try increasing the humidity for rain.',
    stormy: 'Try lowering the pressure and increasing wind speed.',
    clear: 'Try lowering humidity for clear skies.',
    cloudy: 'You need some clouds! Try increasing humidity.',
    foggy: 'Fog needs high humidity and low wind.',
  };

  return {
    success: false,
    feedback: `You created ${currentWeather.name}. ${hints[challenge.targetWeather] || 'Keep adjusting!'}`,
  };
}

/**
 * Submit challenge attempt
 */
export function submitChallenge(state: GameState): GameState {
  const result = checkChallenge(state);
  const newAttempts = state.attempts + 1;

  if (result.success) {
    const baseScore = 100;
    const attemptBonus = Math.max(0, 50 - newAttempts * 10);
    const timeBonus = Math.max(0, 50 - Math.floor(state.timeElapsed / 10));
    const totalScore = baseScore + attemptBonus + timeBonus;

    return {
      ...state,
      status: 'success',
      score: state.score + totalScore,
      attempts: newAttempts,
    };
  }

  return {
    ...state,
    status: 'failure',
    attempts: newAttempts,
  };
}

/**
 * Reset current challenge
 */
export function resetChallenge(state: GameState): GameState {
  return {
    ...state,
    conditions: {
      temperature: 20,
      humidity: 50,
      windSpeed: 20,
      pressure: 1013,
    },
    currentWeather: null,
    status: 'playing',
    attempts: 0,
  };
}

/**
 * Update timer
 */
export function updateTimer(state: GameState): GameState {
  return {
    ...state,
    timeElapsed: state.timeElapsed + 1,
  };
}

/**
 * Get weather display info
 */
export function getWeatherInfo(type: WeatherType): {
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
} {
  const info: Record<WeatherType, { name: string; emoji: string; color: string; bgGradient: string }> =
    {
      clear: {
        name: 'Clear Sky',
        emoji: '☀️',
        color: '#FFD700',
        bgGradient: 'from-blue-400 to-blue-300',
      },
      cloudy: {
        name: 'Cloudy',
        emoji: '☁️',
        color: '#B0C4DE',
        bgGradient: 'from-gray-400 to-gray-300',
      },
      rainy: {
        name: 'Rainy',
        emoji: '🌧️',
        color: '#4682B4',
        bgGradient: 'from-slate-600 to-slate-500',
      },
      snowy: {
        name: 'Snowy',
        emoji: '❄️',
        color: '#E0FFFF',
        bgGradient: 'from-blue-100 to-white',
      },
      stormy: {
        name: 'Stormy',
        emoji: '🌪️',
        color: '#4B0082',
        bgGradient: 'from-indigo-800 to-purple-700',
      },
      foggy: {
        name: 'Foggy',
        emoji: '🌫️',
        color: '#D3D3D3',
        bgGradient: 'from-gray-300 to-gray-200',
      },
      desert: {
        name: 'Desert Heat',
        emoji: '🏜️',
        color: '#FF8C00',
        bgGradient: 'from-orange-500 to-yellow-400',
      },
      'winter-sun': {
        name: 'Clear Winter Day',
        emoji: '🌨️',
        color: '#87CEEB',
        bgGradient: 'from-blue-200 to-white',
      },
      thunderstorm: {
        name: 'Thunderstorm',
        emoji: '⛈️',
        color: '#483D8B',
        bgGradient: 'from-slate-800 to-indigo-900',
      },
    };
  return info[type];
}

/**
 * Calculate final score
 */
export function calculateFinalScore(state: GameState): {
  totalScore: number;
  challengesCompleted: number;
  weathersDiscovered: number;
  accuracy: number;
} {
  return {
    totalScore: state.score,
    challengesCompleted: Math.floor(state.score / 100),
    weathersDiscovered: state.discoveredWeathers.length,
    accuracy: state.attempts > 0 ? Math.floor((state.score / 100 / state.attempts) * 100) : 0,
  };
}

// Legacy compatibility surface retained for older game page/tests.
export type WeatherCondition = WeatherConditions;
export type WeatherState = GameState;
export interface Level {
  level: number;
  id: string;
  name: string;
  targetWeather: WeatherType;
}

export const LEVELS: Level[] = CHALLENGES.map((challenge, index) => ({
  level: index + 1,
  id: challenge.id,
  name: challenge.name,
  targetWeather: challenge.targetWeather,
}));

export const WEATHER_CONDITIONS = {
  temperature: { min: -10, max: 40, default: 20 },
  humidity: { min: 0, max: 100, default: 50 },
  windSpeed: { min: 0, max: 100, default: 20 },
  pressure: { min: 980, max: 1050, default: 1013 },
} as const;

export function initializeGame(): GameState {
  return createInitialState();
}

export function startGame(state: GameState, level = 1): GameState {
  const challenge = LEVELS[level - 1] ?? LEVELS[0];
  return startChallenge(state, challenge.id);
}

export function getCurrentLevel(state: GameState): number {
  if (!state.currentChallengeId) return 1;
  const index = LEVELS.findIndex((level) => level.id === state.currentChallengeId);
  return index >= 0 ? index + 1 : 1;
}

export function getCurrentWeather(state: GameState): WeatherResult | null {
  return state.currentWeather;
}

export function updateTemperature(state: GameState, temperature: number): GameState {
  return updateConditions(state, { temperature });
}

export function updateHumidity(state: GameState, humidity: number): GameState {
  return updateConditions(state, { humidity });
}

export function updateWindSpeed(state: GameState, windSpeed: number): GameState {
  return updateConditions(state, { windSpeed });
}

export function updateWindDirection(state: GameState, _windDirection: number): GameState {
  return state;
}

export function updatePressure(state: GameState, pressure: number): GameState {
  return updateConditions(state, { pressure });
}

export function updateWeather(
  state: GameState,
  updates: Partial<WeatherConditions>,
): GameState {
  return updateConditions(state, updates);
}

export function checkWeatherMatch(state: GameState): boolean {
  return checkChallenge(state).success;
}

export function calculateScore(state: GameState): number {
  return state.score;
}

export function nextLevel(state: GameState): GameState {
  const nextLevelNumber = getCurrentLevel(state) + 1;
  const next = LEVELS[nextLevelNumber - 1];
  if (!next) return state;
  return startChallenge(
    {
      ...state,
      status: 'menu',
    },
    next.id,
  );
}

export function resetLevel(state: GameState): GameState {
  return resetChallenge(state);
}
