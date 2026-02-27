/**
 * Kaleidoscope Hands game logic — create beautiful symmetrical patterns.
 *
 * Move your hands to create gorgeous kaleidoscope art!
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Kaleidoscope Hands P1
 */

export interface KaleidoscopeSegment {
  angle: number;
  mirrors: number;
}

export interface LevelConfig {
  level: number;
  segmentCount: number;
  colorMode: 'rainbow' | 'gradient' | 'solid';
}

export const LEVELS: LevelConfig[] = [
  { level: 1, segmentCount: 4, colorMode: 'rainbow' },
  { level: 2, segmentCount: 6, colorMode: 'gradient' },
  { level: 3, segmentCount: 8, colorMode: 'rainbow' },
];

export const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F1948A', '#82E0AA', '#F7DC6F', '#D2B4DE', '#AED6F1',
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function getRainbowColor(progress: number): string {
  const hue = (progress * 360) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export function getGradientColor(progress: number): string {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
  const idx = Math.floor(progress * (colors.length - 1));
  return colors[Math.min(idx, colors.length - 1)];
}

export function getColorForPoint(mode: 'rainbow' | 'gradient' | 'solid', progress: number): string {
  if (mode === 'rainbow') return getRainbowColor(progress);
  if (mode === 'gradient') return getGradientColor(progress);
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
