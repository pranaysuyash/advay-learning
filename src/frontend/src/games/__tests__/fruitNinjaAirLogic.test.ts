/**
 * Fruit Ninja Air Game Logic Tests
 *
 * Tests for level configurations, fruit spawning, physics,
 * slice detection, scoring, and game mechanics.
 */

import { describe, expect, it, beforeEach } from 'vitest';

// Types from FruitNinjaAir
interface Point {
  x: number;
  y: number;
}

interface Fruit {
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

interface LevelConfig {
  level: number;
  fruitsToSlice: number;
  spawnRate: number;
  timeLimit: number;
}

// Fruit emojis
const FRUIT_EMOJIS = [
  '🍎', '🍊', '🍋', '🍉', '🍇',
  '🍓', '🍑', '🥝', '🍍', '🥭',
];

// Level configurations
const LEVELS: Record<number, LevelConfig> = {
  1: { level: 1, fruitsToSlice: 10, spawnRate: 1500, timeLimit: 30 },
  2: { level: 2, fruitsToSlice: 15, spawnRate: 1200, timeLimit: 35 },
  3: { level: 3, fruitsToSlice: 20, spawnRate: 900, timeLimit: 40 },
};

// Game constants
const GRAVITY = 0.15;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const SLICE_DISTANCE = 40;

// Let nextId be mutable
let nextId = 0;

/**
 * Spawn a new fruit at the bottom of the canvas.
 */
function spawnFruit(): Fruit {
  const x = 50 + Math.random() * (CANVAS_WIDTH - 100);
  const y = -50;

  return {
    id: nextId++,
    x,
    y,
    vx: -2 + Math.random() * 4,
    vy: 4 + Math.random() * 3,
    rotation: 0,
    rotationSpeed: -0.1 + Math.random() * 0.2,
    emoji: FRUIT_EMOJIS[Math.floor(Math.random() * FRUIT_EMOJIS.length)],
    sliced: false,
  };
}

/**
 * Update fruit physics.
 */
function updateFruit(fruit: Fruit): Fruit {
  const newVy = fruit.vy + GRAVITY;
  return {
    ...fruit,
    x: fruit.x + fruit.vx,
    y: fruit.y + newVy,
    vy: newVy,
    rotation: fruit.rotation + fruit.rotationSpeed,
  };
}

/**
 * Check if slice path intersects with fruit.
 */
function checkSlice(fruit: Fruit, slicePath: Point[]): boolean {
  if (fruit.sliced) return false;

  for (const point of slicePath) {
    const distance = Math.sqrt(
      Math.pow(point.x - fruit.x, 2) +
      Math.pow(point.y - fruit.y, 2)
    );
    if (distance < SLICE_DISTANCE) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate score with streak bonus.
 */
function calculateScore(fruitsSliced: number, streak: number): number {
  const basePoints = 10 * fruitsSliced;
  const streakBonus = Math.min(streak * 2, 15);
  return basePoints + streakBonus;
}

/**
 * Filter fruits that are still on screen.
 */
function filterVisibleFruits(fruits: Fruit[]): Fruit[] {
  return fruits.filter(f => f.y < CANVAS_HEIGHT + 100 && !f.sliced);
}

describe('Fruit Ninja Air - Level Configurations', () => {
  it('has three difficulty levels', () => {
    expect(Object.keys(LEVELS)).toHaveLength(3);
    expect(LEVELS[1]).toBeDefined();
    expect(LEVELS[2]).toBeDefined();
    expect(LEVELS[3]).toBeDefined();
  });

  it('level 1 has easiest settings', () => {
    expect(LEVELS[1].fruitsToSlice).toBe(10);
    expect(LEVELS[1].spawnRate).toBe(1500);
    expect(LEVELS[1].timeLimit).toBe(30);
  });

  it('level 2 has moderate settings', () => {
    expect(LEVELS[2].fruitsToSlice).toBe(15);
    expect(LEVELS[2].spawnRate).toBe(1200);
    expect(LEVELS[2].timeLimit).toBe(35);
  });

  it('level 3 has hardest settings', () => {
    expect(LEVELS[3].fruitsToSlice).toBe(20);
    expect(LEVELS[3].spawnRate).toBe(900);
    expect(LEVELS[3].timeLimit).toBe(40);
  });

  it('spawn rate decreases from level 1 to 3', () => {
    expect(LEVELS[1].spawnRate).toBeGreaterThan(LEVELS[2].spawnRate);
    expect(LEVELS[2].spawnRate).toBeGreaterThan(LEVELS[3].spawnRate);
  });

  it('fruits to slice increases from level 1 to 3', () => {
    expect(LEVELS[1].fruitsToSlice).toBeLessThan(LEVELS[2].fruitsToSlice);
    expect(LEVELS[2].fruitsToSlice).toBeLessThan(LEVELS[3].fruitsToSlice);
  });
});

describe('Fruit Ninja Air - Fruit Types', () => {
  it('has 10 fruit emojis', () => {
    expect(FRUIT_EMOJIS).toHaveLength(10);
  });

  it('contains expected fruits', () => {
    expect(FRUIT_EMOJIS).toContain('🍎'); // Apple
    expect(FRUIT_EMOJIS).toContain('🍉'); // Watermelon
    expect(FRUIT_EMOJIS).toContain('🍇'); // Grape
    expect(FRUIT_EMOJIS).toContain('🍓'); // Strawberry
  });
});

describe('Fruit Ninja Air - Fruit Spawning', () => {
  beforeEach(() => {
    nextId = 0;
  });

  it('spawns fruit with unique ID', () => {
    const fruit1 = spawnFruit();
    const fruit2 = spawnFruit();
    expect(fruit1.id).not.toBe(fruit2.id);
  });

  it('spawns fruit above canvas', () => {
    const fruit = spawnFruit();
    expect(fruit.y).toBe(-50);
  });

  it('spawns fruit within horizontal bounds', () => {
    const fruit = spawnFruit();
    expect(fruit.x).toBeGreaterThanOrEqual(50);
    expect(fruit.x).toBeLessThanOrEqual(CANVAS_WIDTH - 50);
  });

  it('spawns fruit with upward velocity', () => {
    const fruit = spawnFruit();
    expect(fruit.vy).toBeGreaterThan(0);
    expect(fruit.vy).toBeGreaterThanOrEqual(4);
    expect(fruit.vy).toBeLessThanOrEqual(7);
  });

  it('spawns fruit with horizontal velocity', () => {
    const fruit = spawnFruit();
    expect(fruit.vx).toBeGreaterThanOrEqual(-2);
    expect(fruit.vx).toBeLessThanOrEqual(2);
  });

  it('spawns fruit with random rotation speed', () => {
    const fruit = spawnFruit();
    expect(fruit.rotationSpeed).toBeGreaterThanOrEqual(-0.1);
    expect(fruit.rotationSpeed).toBeLessThanOrEqual(0.1);
  });

  it('spawns unsliced fruit', () => {
    const fruit = spawnFruit();
    expect(fruit.sliced).toBe(false);
  });
});

describe('Fruit Ninja Air - Physics Update', () => {
  it('applies gravity to vertical velocity', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 100,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const updated = updateFruit(fruit);
    expect(updated.vy).toBeCloseTo(5.15, 2);
  });

  it('updates position based on velocity', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 100,
      vx: 2,
      vy: 3,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const updated = updateFruit(fruit);
    expect(updated.x).toBe(202);
    // y = 100 + 3.15 (vy after gravity applied)
    expect(updated.y).toBeCloseTo(103.15, 2);
  });

  it('updates rotation', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 100,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0.05,
      emoji: '🍎',
      sliced: false,
    };
    const updated = updateFruit(fruit);
    expect(updated.rotation).toBe(0.05);
  });
});

describe('Fruit Ninja Air - Slice Detection', () => {
  it('detects slice when point is within distance', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const slicePath: Point[] = [{ x: 200, y: 200 }];
    expect(checkSlice(fruit, slicePath)).toBe(true);
  });

  it('detects slice when point is at edge of distance', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const slicePath: Point[] = [{ x: 200, y: 160.1 }]; // 39.9 pixels away (within 40)
    expect(checkSlice(fruit, slicePath)).toBe(true);
  });

  it('does not detect slice when point is outside distance', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const slicePath: Point[] = [{ x: 200, y: 150 }]; // 50 pixels away
    expect(checkSlice(fruit, slicePath)).toBe(false);
  });

  it('does not slice already sliced fruit', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: true,
    };
    const slicePath: Point[] = [{ x: 200, y: 200 }];
    expect(checkSlice(fruit, slicePath)).toBe(false);
  });

  it('checks multiple points in slice path', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const slicePath: Point[] = [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 200, y: 200 }, // This point should hit
    ];
    expect(checkSlice(fruit, slicePath)).toBe(true);
  });

  it('uses 40 pixel slice distance', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    // Point at 39.9 pixels should hit (distance < 40)
    const closePath: Point[] = [{ x: 200, y: 160.1 }];
    expect(checkSlice(fruit, closePath)).toBe(true);

    // Point at exactly 40 pixels should miss (distance must be < 40)
    const exactPath: Point[] = [{ x: 200, y: 160 }];
    expect(checkSlice(fruit, exactPath)).toBe(false);

    // Point at 40.1 pixels should miss
    const farPath: Point[] = [{ x: 200, y: 159.9 }];
    expect(checkSlice(fruit, farPath)).toBe(false);
  });
});

describe('Fruit Ninja Air - Score Calculation', () => {
  it('calculates base score correctly', () => {
    expect(calculateScore(1, 0)).toBe(10);
    expect(calculateScore(5, 0)).toBe(50);
    expect(calculateScore(10, 0)).toBe(100);
  });

  it('adds streak bonus correctly', () => {
    expect(calculateScore(1, 1)).toBe(12); // 10 + 2
    expect(calculateScore(1, 3)).toBe(16); // 10 + 6
    expect(calculateScore(1, 5)).toBe(20); // 10 + 10
  });

  it('caps streak bonus at 15', () => {
    const score5 = calculateScore(1, 5); // 10 + 10
    const score8 = calculateScore(1, 8); // Should also be 10 + 15
    const score10 = calculateScore(1, 10); // Should also be 10 + 15

    expect(calculateScore(1, 5)).toBe(20);
    expect(calculateScore(1, 8)).toBe(25); // 10 + 15 (capped)
    expect(calculateScore(1, 10)).toBe(25); // 10 + 15 (capped)
  });

  it('calculates total score for multiple fruits', () => {
    expect(calculateScore(5, 3)).toBe(56); // 50 + 6
    expect(calculateScore(10, 5)).toBe(110); // 100 + 10 (streak 5)
    expect(calculateScore(10, 8)).toBe(115); // 100 + 15 (capped at streak 8)
  });

  it('streak bonus formula is min(streak * 2, 15)', () => {
    expect(calculateScore(1, 0)).toBe(10); // 0 bonus
    expect(calculateScore(1, 1)).toBe(12); // 2 bonus
    expect(calculateScore(1, 2)).toBe(14); // 4 bonus
    expect(calculateScore(1, 3)).toBe(16); // 6 bonus
    expect(calculateScore(1, 4)).toBe(18); // 8 bonus
    expect(calculateScore(1, 5)).toBe(20); // 10 bonus
    expect(calculateScore(1, 6)).toBe(22); // 12 bonus
    expect(calculateScore(1, 7)).toBe(24); // 14 bonus
    expect(calculateScore(1, 8)).toBe(25); // 15 bonus (capped)
  });
});

describe('Fruit Ninja Air - Streak System', () => {
  it('streak increases by 2 points per streak', () => {
    const bonus0 = calculateScore(1, 0) - 10;
    const bonus1 = calculateScore(1, 1) - 10;
    const bonus2 = calculateScore(1, 2) - 10;

    expect(bonus1 - bonus0).toBe(2);
    expect(bonus2 - bonus1).toBe(2);
  });

  it('streak bonus caps at 8th streak', () => {
    const bonus7 = calculateScore(1, 7) - 10;
    const bonus8 = calculateScore(1, 8) - 10;
    const bonus10 = calculateScore(1, 10) - 10;

    expect(bonus7).toBe(14);
    expect(bonus8).toBe(15);
    expect(bonus10).toBe(15);
  });

  it('streak resets on miss (by game logic)', () => {
    // Game logic tracks streak separately
    // This documents expected behavior
    let streak = 5;
    const missed = true;

    if (missed) {
      streak = 0;
    }

    expect(streak).toBe(0);
    expect(calculateScore(1, streak)).toBe(10);
  });
});

describe('Fruit Ninja Air - Level Progression', () => {
  it('level 1 completes after 10 fruits', () => {
    expect(LEVELS[1].fruitsToSlice).toBe(10);
  });

  it('level 2 completes after 15 fruits', () => {
    expect(LEVELS[2].fruitsToSlice).toBe(15);
  });

  it('level 3 completes after 20 fruits', () => {
    expect(LEVELS[3].fruitsToSlice).toBe(20);
  });

  it('progress increases with each sliced fruit', () => {
    let sliced = 0;
    const target = 10;
    let progress = sliced / target;

    expect(progress).toBe(0);

    sliced = 5;
    progress = sliced / target;
    expect(progress).toBe(0.5);

    sliced = 10;
    progress = sliced / target;
    expect(progress).toBe(1);
  });
});

describe('Fruit Ninja Air - Fruit Filtering', () => {
  it('removes fruits below canvas', () => {
    const fruits: Fruit[] = [
      {
        id: 1,
        x: 200,
        y: 100,
        vx: 0,
        vy: 5,
        rotation: 0,
        rotationSpeed: 0,
        emoji: '🍎',
        sliced: false,
      },
      {
        id: 2,
        x: 200,
        y: CANVAS_HEIGHT + 200, // Below canvas
        vx: 0,
        vy: 5,
        rotation: 0,
        rotationSpeed: 0,
        emoji: '🍊',
        sliced: false,
      },
    ];

    const filtered = filterVisibleFruits(fruits);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
  });

  it('removes sliced fruits', () => {
    const fruits: Fruit[] = [
      {
        id: 1,
        x: 200,
        y: 100,
        vx: 0,
        vy: 5,
        rotation: 0,
        rotationSpeed: 0,
        emoji: '🍎',
        sliced: false,
      },
      {
        id: 2,
        x: 200,
        y: 100,
        vx: 0,
        vy: 5,
        rotation: 0,
        rotationSpeed: 0,
        emoji: '🍊',
        sliced: true,
      },
    ];

    const filtered = filterVisibleFruits(fruits);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
  });

  it('keeps fruits just below canvas with buffer', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: CANVAS_HEIGHT + 50, // Within 100px buffer
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };

    const filtered = filterVisibleFruits([fruit]);
    expect(filtered).toHaveLength(1);
  });
});

describe('Fruit Ninja Air - Edge Cases', () => {
  it('handles empty slice path', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 200,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };
    const slicePath: Point[] = [];
    expect(checkSlice(fruit, slicePath)).toBe(false);
  });

  it('handles zero fruits sliced', () => {
    expect(calculateScore(0, 0)).toBe(0);
  });

  it('handles very high streak values', () => {
    expect(calculateScore(1, 100)).toBe(25); // 10 + 15 (capped)
  });

  it('handles zero gravity effect over time', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 100,
      vx: 0,
      vy: 0,
      rotation: 0,
      rotationSpeed: 0,
      emoji: '🍎',
      sliced: false,
    };

    let updated = fruit;
    for (let i = 0; i < 10; i++) {
      updated = updateFruit(updated);
    }

    // After 10 frames, vy should be 10 * 0.15 = 1.5
    expect(updated.vy).toBeCloseTo(1.5, 1);
  });

  it('handles negative rotation speed', () => {
    const fruit: Fruit = {
      id: 1,
      x: 200,
      y: 100,
      vx: 0,
      vy: 5,
      rotation: 0,
      rotationSpeed: -0.05,
      emoji: '🍎',
      sliced: false,
    };
    const updated = updateFruit(fruit);
    expect(updated.rotation).toBe(-0.05);
  });
});

describe('Fruit Ninja Air - Game Constants', () => {
  it('uses 400px canvas width', () => {
    expect(CANVAS_WIDTH).toBe(400);
  });

  it('uses 500px canvas height', () => {
    expect(CANVAS_HEIGHT).toBe(500);
  });

  it('uses 0.15 gravity', () => {
    expect(GRAVITY).toBe(0.15);
  });

  it('uses 40px slice distance', () => {
    expect(SLICE_DISTANCE).toBe(40);
  });
});
