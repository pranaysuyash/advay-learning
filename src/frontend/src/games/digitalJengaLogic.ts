/**
 * Digital Jenga game logic — 3D tower building with physics.
 */

export interface Block {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}

export interface LevelConfig {
  level: number;
  initialHeight: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, initialHeight: 3 },
  { level: 2, initialHeight: 5 },
  { level: 3, initialHeight: 7 },
];

export const BLOCK_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#A855F7', // purple
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find(l => l.level === level) ?? LEVELS[0];
}

export function generateInitialBlocks(level: number): Block[] {
  const config = getLevelConfig(level);
  const blocks: Block[] = [];
  const blockSize = { x: 1, y: 0.3, z: 0.3 };
  
  for (let y = 0; y < config.initialHeight; y++) {
    const isEvenLayer = y % 2 === 0;
    for (let x = 0; x < 3; x++) {
      blocks.push({
        id: blocks.length,
        position: [
          isEvenLayer ? x - 1 : 0,
          y * blockSize.y + blockSize.y / 2,
          isEvenLayer ? 0 : x - 1
        ],
        rotation: [0, isEvenLayer ? 0 : Math.PI / 2, 0],
        color: BLOCK_COLORS[y % BLOCK_COLORS.length],
      });
    }
  }
  
  return blocks;
}
