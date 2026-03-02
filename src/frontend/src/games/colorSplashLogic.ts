export type ColorName = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface ColorObject {
  id: number;
  color: ColorName;
  emoji: string;
  x: number;
  y: number;
  size: number;
  splashed: boolean;
}

export interface Level {
  id: number;
  objectCount: number;
  colorCount: number;
  timeLimit: number;
}

export const COLORS: Record<ColorName, { name: ColorName; hex: string; emoji: string }> = {
  red: { name: 'red', hex: '#EF4444', emoji: '🍎' },
  blue: { name: 'blue', hex: '#3B82F6', emoji: '🟦' },
  green: { name: 'green', hex: '#22C55E', emoji: '🌿' },
  yellow: { name: 'yellow', hex: '#EAB308', emoji: '⭐' },
  purple: { name: 'purple', hex: '#A855F7', emoji: '🍇' },
  orange: { name: 'orange', hex: '#F97316', emoji: '🍊' },
};

export const LEVELS: Level[] = [
  { id: 1, objectCount: 6, colorCount: 2, timeLimit: 30 },
  { id: 2, objectCount: 9, colorCount: 3, timeLimit: 45 },
  { id: 3, objectCount: 12, colorCount: 3, timeLimit: 60 },
  { id: 4, objectCount: 15, colorCount: 4, timeLimit: 75 },
];

export function generateObjects(level: Level): { objects: ColorObject[]; targetColor: ColorName } {
  const colorKeys = Object.keys(COLORS) as ColorName[];
  const selectedColors = shuffleArray(colorKeys).slice(0, level.colorCount);
  const targetColor = selectedColors[0];
  
  const objects: ColorObject[] = [];
  const positions = generatePositions(level.objectCount, 10, 14);
  
  for (let i = 0; i < level.objectCount; i++) {
    const color = selectedColors[i % selectedColors.length];
    objects.push({
      id: i,
      color,
      emoji: COLORS[color].emoji,
      x: positions[i].x,
      y: positions[i].y,
      size: 60,
      splashed: false,
    });
  }
  
  return { objects, targetColor };
}

function generatePositions(count: number, margin: number, minDistance: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const safeMargin = Math.min(Math.max(margin, 0), 49);
  const span = 100 - safeMargin * 2;
  const safeMinDistance = Math.min(Math.max(minDistance, 0), Math.max(span * 0.5, 0));
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0;
    let y = 0;
    
    while (!validPosition && attempts < 100) {
      x = safeMargin + Math.random() * span;
      y = safeMargin + Math.random() * span;
      
      validPosition = true;
      for (const pos of positions) {
        const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (dist < safeMinDistance) {
          validPosition = false;
          break;
        }
      }
      attempts++;
    }
    
    positions.push({ x, y });
  }
  
  return positions;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function splashObject(
  objects: ColorObject[],
  objectId: number,
  targetColor: ColorName
): { correct: boolean; scoreDelta: number; allSplashed: boolean; isTarget: boolean } {
  const obj = objects.find(o => o.id === objectId);
  
  if (!obj || obj.splashed) {
    return { correct: false, scoreDelta: 0, allSplashed: false, isTarget: false };
  }
  
  const isTarget = obj.color === targetColor;
  
  if (isTarget) {
    const remaining = objects.filter(o => !o.splashed && o.color === targetColor);
    const allSplashed = remaining.length === 1;
    return { 
      correct: true, 
      scoreDelta: 20, 
      allSplashed,
      isTarget: true
    };
  }
  
  return { 
    correct: false, 
    scoreDelta: -5, 
    allSplashed: false,
    isTarget: false
  };
}

export function updateSplashed(objects: ColorObject[], objectId: number): ColorObject[] {
  return objects.map(o => 
    o.id === objectId ? { ...o, splashed: true } : o
  );
}
