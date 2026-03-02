/**
 * Weather Match game logic — match weather to clothing.
 */

export interface Weather {
  name: string;
  emoji: string;
  icon: string;
}

export interface Clothing {
  name: string;
  emoji: string;
}

export interface LevelConfig {
  level: number;
  pairCount: number;
}

const WEATHER: Weather[] = [
  { name: 'Sunny', emoji: '☀️', icon: 'sun' },
  { name: 'Rainy', emoji: '🌧️', icon: 'cloud-rain' },
  { name: 'Snowy', emoji: '❄️', icon: 'snowflake' },
  { name: 'Windy', emoji: '💨', icon: 'wind' },
  { name: 'Cloudy', emoji: '☁️', icon: 'cloud' },
  { name: 'Stormy', emoji: '⛈️', icon: 'cloud-lightning' },
];

const CLOTHING: Record<string, Clothing[]> = {
  Sunny: [{ name: 'Sunglasses', emoji: '🕶️' }, { name: 'Hat', emoji: '🧢' }],
  Rainy: [{ name: 'Raincoat', emoji: '🧥' }, { name: 'Umbrella', emoji: '☂️' }],
  Snowy: [{ name: 'Coat', emoji: '🧥' }, { name: 'Scarf', emoji: '🧣' }],
  Windy: [{ name: 'Jacket', emoji: '🧥' }],
  Cloudy: [{ name: 'Light Jacket', emoji: '🧥' }],
  Stormy: [{ name: 'Raincoat', emoji: '🧥' }],
};

export const LEVELS: LevelConfig[] = [
  { level: 1, pairCount: 2 },
  { level: 2, pairCount: 3 },
  { level: 3, pairCount: 4 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateGame(level: number) {
  const config = getLevelConfig(level);
  const shuffled = [...WEATHER].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, config.pairCount);
  const pairs = selected.map(w => ({
    weather: w,
    clothing: CLOTHING[w.name][Math.floor(Math.random() * CLOTHING[w.name].length)],
  }));
  return pairs;
}
