/**
 * Time Tell game logic — learn to read clocks.
 */

export interface TimeQuestion {
  hour: number;
  minute: number;
  isDigital: boolean;
}

export interface LevelConfig {
  level: number;
  includeHalf: boolean;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, includeHalf: false },
  { level: 2, includeHalf: true },
  { level: 3, includeHalf: true },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateTime(level: number): TimeQuestion {
  const config = getLevelConfig(level);
  const hour = Math.floor(Math.random() * 12) + 1;
  let minute = 0;
  if (config.includeHalf) {
    const options = [0, 15, 30, 45];
    minute = options[Math.floor(Math.random() * options.length)];
  }
  return { hour, minute, isDigital: Math.random() > 0.5 };
}

export function formatTime(hour: number, minute: number): string {
  if (minute === 0) return `${hour} o'clock`;
  if (minute === 15) return `quarter past ${hour}`;
  if (minute === 30) return `half past ${hour}`;
  if (minute === 45) return `quarter to ${(hour % 12) + 1}`;
  return `${hour}:${minute.toString().padStart(2, '0')}`;
}
