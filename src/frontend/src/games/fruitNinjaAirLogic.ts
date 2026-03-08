/**
 * Fruit Ninja Air game logic — slice fruits with hand gestures.
 *
 * Swipe to slice fruits as they fly through the air!
 *
 * @see docs/COMPLETE_GAMES_UNIVERSE.md - Fruit Ninja Air P1
 */

export interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  sliced: boolean;
}

export interface LevelConfig {
  level: number;
  fruitsToSlice: number;
  spawnRate: number;
  timeLimit: number;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, fruitsToSlice: 10, spawnRate: 1500, timeLimit: 30 },
  { level: 2, fruitsToSlice: 15, spawnRate: 1200, timeLimit: 35 },
  { level: 3, fruitsToSlice: 20, spawnRate: 900, timeLimit: 40 },
];

const FRUITS = ['🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍑', '🥝', '🍍', '🥭'];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function spawnFruit(id: number, canvasWidth: number, canvasHeight: number): Fruit {
  return {
    id,
    x: Math.random() * (canvasWidth - 100) + 50,
    y: canvasHeight + 50,
    vx: (Math.random() - 0.5) * 6,
    vy: -(Math.random() * 4 + 10), // Shoot upwards strongly
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    emoji: FRUITS[Math.floor(Math.random() * FRUITS.length)],
    sliced: false,
  };
}

export function updateFruits(fruits: Fruit[], canvasHeight: number, gravity: number = 0.2): Fruit[] {
  return fruits
    .map((f) => ({
      ...f,
      x: f.x + f.vx,
      y: f.y + f.vy,
      vy: f.vy + gravity,
      rotation: f.rotation + f.rotationSpeed,
    }))
    .filter((f) => {
      // Only filter out if it's moving DOWNWARD and reached past the bottom
      return !(f.vy > 0 && f.y > canvasHeight + 100);
    });
}

export function checkSlice(fruits: Fruit[], slicePath: { x: number; y: number }[]): { sliced: Fruit[]; remaining: Fruit[] } {
  const sliced: Fruit[] = [];
  const remaining: Fruit[] = [];

  for (const fruit of fruits) {
    let isSliced = false;
    for (const point of slicePath) {
      const distance = Math.sqrt(Math.pow(point.x - fruit.x, 2) + Math.pow(point.y - fruit.y, 2));
      if (distance < 40) {
        isSliced = true;
        break;
      }
    }
    if (isSliced) {
      sliced.push({ ...fruit, sliced: true });
    } else {
      remaining.push(fruit);
    }
  }

  return { sliced, remaining };
}
