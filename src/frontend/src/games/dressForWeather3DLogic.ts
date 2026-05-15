/**
 * Dress for Weather 3D Game Logic
 *
 * Dress a 3D character for different weather conditions.
 * Educational value: Weather awareness, clothing choices, matching
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const DRESS_FOR_WEATHER_3D_CONFIG = {
  // Weather types
  WEATHER_TYPES: [
    { id: 'sunny', name: 'Sunny', warmth: 3, color: '#fbbf24', icon: '☀️' },
    { id: 'rainy', name: 'Rainy', warmth: 1, color: '#60a5fa', icon: '🌧️' },
    { id: 'snowy', name: 'Snowy', warmth: -2, color: '#e2e8f0', icon: '❄️' },
    { id: 'windy', name: 'Windy', warmth: 0, color: '#94a3b8', icon: '💨' },
  ] as const,

  // Clothing items
  CLOTHING: {
    shirts: [
      { id: 'tshirt', name: 'T-Shirt', warmth: 1, color: '#ef4444', waterproof: false },
      { id: 'sweater', name: 'Sweater', warmth: 3, color: '#8b5cf6', waterproof: false },
      { id: 'jacket', name: 'Jacket', warmth: 5, color: '#1e293b', waterproof: false },
      { id: 'raincoat', name: 'Rain Coat', warmth: 2, color: '#fbbf24', waterproof: true },
    ],
    pants: [
      { id: 'shorts', name: 'Shorts', warmth: 1, color: '#22c55e', waterproof: false },
      { id: 'pants', name: 'Long Pants', warmth: 2, color: '#3b82f6', waterproof: false },
      { id: 'warm-pants', name: 'Warm Pants', warmth: 3, color: '#1e293b', waterproof: false },
    ],
  } as const,

  // Scoring
  POINTS_PER_OUTFIT: 20,
  PERFECT_BONUS: 10,
  VARIETY_BONUS: 5,

  // Game settings
  ROUNDS_TO_WIN: 5,
  GAME_DURATION_SECONDS: 120,
} as const;

// Types
export type WeatherType = typeof DRESS_FOR_WEATHER_3D_CONFIG.WEATHER_TYPES[number];
export type ShirtType = typeof DRESS_FOR_WEATHER_3D_CONFIG.CLOTHING.shirts[number];
export type PantsType = typeof DRESS_FOR_WEATHER_3D_CONFIG.CLOTHING.pants[number];

export interface Outfit {
  shirt: ShirtType | null;
  pants: PantsType | null;
}

export interface GameState {
  currentWeather: WeatherType;
  outfit: Outfit;
  score: number;
  rounds: number;
  perfectRounds: number;
  usedWeather: Set<string>;
  timeLeft: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
  isCorrect: boolean | null;
}

export interface CheckResult {
  isCorrect: boolean;
  points: number;
  feedback: string;
  temperatureRating: 'too-hot' | 'perfect' | 'too-cold';
}



// Pick random weather
export function pickWeather(used: Set<string>): WeatherType {
  const available = DRESS_FOR_WEATHER_3D_CONFIG.WEATHER_TYPES.filter(
    (w) => !used.has(w.id)
  );
  const pool = available.length > 0 ? available : DRESS_FOR_WEATHER_3D_CONFIG.WEATHER_TYPES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Initialize game
export function initializeGame(): GameState {
  return {
    currentWeather: DRESS_FOR_WEATHER_3D_CONFIG.WEATHER_TYPES[0],
    outfit: { shirt: null, pants: null },
    score: 0,
    rounds: 0,
    perfectRounds: 0,
    usedWeather: new Set(),
    timeLeft: DRESS_FOR_WEATHER_3D_CONFIG.GAME_DURATION_SECONDS,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Dress for the weather!',
    isCorrect: null,
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  const weather = pickWeather(new Set());
  return {
    ...initializeGame(),
    currentWeather: weather,
    isPlaying: true,
    usedWeather: new Set([weather.id]),
    feedback: `It's ${weather.name}! What should you wear?`,
  };
}

// Select shirt
export function selectShirt(state: GameState, shirt: ShirtType): GameState {
  return {
    ...state,
    outfit: { ...state.outfit, shirt },
    isCorrect: null,
    feedback: state.outfit.pants ? 'Check your outfit!' : 'Now select pants!',
  };
}

// Select pants
export function selectPants(state: GameState, pants: PantsType): GameState {
  return {
    ...state,
    outfit: { ...state.outfit, pants },
    isCorrect: null,
    feedback: state.outfit.shirt ? 'Check your outfit!' : 'Now select a shirt!',
  };
}

// Check if outfit matches weather
export function checkOutfit(state: GameState): { result: CheckResult; newState: GameState } {
  if (!state.outfit.shirt || !state.outfit.pants) {
    return {
      result: {
        isCorrect: false,
        points: 0,
        feedback: 'Select both shirt and pants!',
        temperatureRating: 'too-cold',
      },
      newState: state,
    };
  }

  const totalWarmth = state.outfit.shirt.warmth + state.outfit.pants.warmth;
  const weatherWarmth = state.currentWeather.warmth;

  let isCorrect = false;
  let temperatureRating: 'too-hot' | 'perfect' | 'too-cold' = 'perfect';
  let feedback = '';

  // Check weather-specific requirements
  if (state.currentWeather.id === 'rainy') {
    // Need waterproof for rain
    if (state.outfit.shirt.waterproof || totalWarmth >= 2) {
      isCorrect = true;
      feedback = 'Great rain protection! 🌧️';
    } else {
      isCorrect = false;
      feedback = 'You need rain protection!';
    }
  } else if (state.currentWeather.id === 'sunny') {
    // Light clothes for sun
    if (totalWarmth <= 3) {
      isCorrect = true;
      feedback = 'Perfect for sunny weather! ☀️';
    } else {
      isCorrect = false;
      feedback = 'Too warm for sunny weather!';
    }
  } else if (state.currentWeather.id === 'snowy') {
    // Warm clothes for snow
    if (totalWarmth >= 6) {
      isCorrect = true;
      feedback = 'Nice and warm for snow! ❄️';
    } else {
      isCorrect = false;
      feedback = 'Too cold for snow!';
    }
  } else if (state.currentWeather.id === 'windy') {
    // Protected clothes for wind
    if (state.outfit.shirt.warmth >= 2 && state.outfit.pants.warmth >= 2) {
      isCorrect = true;
      feedback = 'Good for windy weather! 💨';
    } else {
      isCorrect = false;
      feedback = 'Need warmer clothes for wind!';
    }
  }

  // Calculate warmth rating
  if (totalWarmth < weatherWarmth + 2) {
    temperatureRating = 'too-cold';
  } else if (totalWarmth > weatherWarmth + 6) {
    temperatureRating = 'too-hot';
  }

  // Calculate points
  const varietyBonus = state.usedWeather.size >= 3 ? DRESS_FOR_WEATHER_3D_CONFIG.VARIETY_BONUS : 0;
  const perfectBonus = isCorrect && temperatureRating === 'perfect' ? DRESS_FOR_WEATHER_3D_CONFIG.PERFECT_BONUS : 0;
  const points = isCorrect ? DRESS_FOR_WEATHER_3D_CONFIG.POINTS_PER_OUTFIT + varietyBonus + perfectBonus : 0;

  const newRounds = state.rounds + 1;
  const newPerfectRounds = state.perfectRounds + (isCorrect ? 1 : 0);

  // Next weather
  const newUsedWeather = new Set(state.usedWeather);
  const nextWeather = pickWeather(newUsedWeather);
  newUsedWeather.add(nextWeather.id);

  const gameWon = newRounds >= DRESS_FOR_WEATHER_3D_CONFIG.ROUNDS_TO_WIN;

  return {
    result: {
      isCorrect,
      points,
      feedback: isCorrect ? feedback : `Not quite! ${feedback}`,
      temperatureRating,
    },
    newState: {
      ...state,
      score: state.score + points,
      rounds: newRounds,
      perfectRounds: newPerfectRounds,
      currentWeather: nextWeather,
      outfit: { shirt: null, pants: null },
      usedWeather: newUsedWeather,
      isCorrect,
      isPlaying: !gameWon,
      gameWon,
      feedback: gameWon ? 'Perfect stylist! You win!' : `Now try: ${nextWeather.name}!`,
    },
  };
}

// Update time
export function updateTime(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying) return state;

  const newTimeLeft = Math.max(0, state.timeLeft - deltaTime / 1000);
  return {
    ...state,
    timeLeft: newTimeLeft,
    gameOver: newTimeLeft <= 0,
  };
}

// Get progress
export function getProgress(state: GameState): number {
  return (state.rounds / DRESS_FOR_WEATHER_3D_CONFIG.ROUNDS_TO_WIN) * 100;
}

// Get character reaction
export function getCharacterReaction(isCorrect: boolean | null): string {
  if (isCorrect === null) return '😐';
  return isCorrect ? '😊' : '😢';
}
