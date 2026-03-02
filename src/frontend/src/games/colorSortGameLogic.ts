/**
 * Color Sort game logic — sort colors into correct buckets.
 */

export interface ColorItem {
  name: string;
  hex: string;
}

export interface LevelConfig {
  level: number;
  colorCount: number;
}

const COLORS: ColorItem[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Brown', hex: '#92400E' },
];

export const LEVELS: LevelConfig[] = [
  { level: 1, colorCount: 3 },
  { level: 2, colorCount: 4 },
  { level: 3, colorCount: 6 },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateItems(level: number): { items: ColorItem[]; targets: ColorItem[] } {
  const config = getLevelConfig(level);
  const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
  const targets = shuffled.slice(0, config.colorCount);
  const items: ColorItem[] = [];
  targets.forEach(t => {
    items.push(t, t, t);
  });
  return { items: items.sort(() => Math.random() - 0.5), targets };
}
