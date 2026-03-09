import { describe, expect, it } from 'vitest';

import {
  Bubble,
  LevelConfig,
  LEVELS,
  getLevelConfig,
  createBubble,
  updateBubbles,
  checkBubblePop,
} from '../virtualBubblesLogic';

describe('LEVELS', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 10 bubbles to pop, max 5, spawn rate 2000ms, time 45s', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].bubblesToPop).toBe(10);
    expect(LEVELS[0].maxBubbles).toBe(5);
    expect(LEVELS[0].spawnRate).toBe(2000);
    expect(LEVELS[0].timeLimit).toBe(45);
  });

  it('level 2 has 15 bubbles to pop, max 8, spawn rate 1500ms, time 40s', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].bubblesToPop).toBe(15);
    expect(LEVELS[1].maxBubbles).toBe(8);
    expect(LEVELS[1].spawnRate).toBe(1500);
    expect(LEVELS[1].timeLimit).toBe(40);
  });

  it('level 3 has 20 bubbles to pop, max 10, spawn rate 1000ms, time 35s', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].bubblesToPop).toBe(20);
    expect(LEVELS[2].maxBubbles).toBe(10);
    expect(LEVELS[2].spawnRate).toBe(1000);
    expect(LEVELS[2].timeLimit).toBe(35);
  });

  it('bubblesToPop increases across levels', () => {
    expect(LEVELS[0].bubblesToPop).toBeLessThan(LEVELS[1].bubblesToPop);
    expect(LEVELS[1].bubblesToPop).toBeLessThan(LEVELS[2].bubblesToPop);
  });

  it('maxBubbles increases across levels', () => {
    expect(LEVELS[0].maxBubbles).toBeLessThan(LEVELS[1].maxBubbles);
    expect(LEVELS[1].maxBubbles).toBeLessThan(LEVELS[2].maxBubbles);
  });

  it('spawnRate decreases across levels (faster spawning)', () => {
    expect(LEVELS[0].spawnRate).toBeGreaterThan(LEVELS[1].spawnRate);
    expect(LEVELS[1].spawnRate).toBeGreaterThan(LEVELS[2].spawnRate);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.bubblesToPop).toBe(10);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.bubblesToPop).toBe(15);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.bubblesToPop).toBe(20);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('createBubble', () => {
  it('creates a bubble with valid structure', () => {
    const bubble = createBubble(1, 800);

    expect(bubble.id).toBe(1);
    expect(typeof bubble.x).toBe('number');
    expect(typeof bubble.y).toBe('number');
    expect(typeof bubble.size).toBe('number');
    expect(typeof bubble.color).toBe('string');
    expect(typeof bubble.speedY).toBe('number');
    expect(typeof bubble.speedX).toBe('number');
  });

  it('bubble starts at y = -50 (above screen)', () => {
    const bubble = createBubble(1, 800);
    expect(bubble.y).toBe(-50);
  });

  it('bubble x is within canvas bounds', () => {
    const canvasWidth = 800;
    const bubble = createBubble(1, canvasWidth);
    expect(bubble.x).toBeGreaterThanOrEqual(40);
    expect(bubble.x).toBeLessThanOrEqual(canvasWidth - 40);
  });

  it('bubble size is between 30 and 70', () => {
    const bubble = createBubble(1, 800);
    expect(bubble.size).toBeGreaterThanOrEqual(30);
    expect(bubble.size).toBeLessThanOrEqual(70);
  });

  it('bubble speedY is positive (floats upward)', () => {
    const bubble = createBubble(1, 800);
    expect(bubble.speedY).toBeGreaterThan(0);
    expect(bubble.speedY).toBeLessThanOrEqual(2);
  });

  it('bubble speedX can be negative or positive', () => {
    // Generate many bubbles to ensure we get both negative and positive speeds
    const bubbles = [];
    for (let i = 0; i < 20; i++) {
      bubbles.push(createBubble(i, 800));
    }
    const speedsX = bubbles.map(b => b.speedX);
    expect(speedsX.some(s => s < 0)).toBe(true);
    expect(speedsX.some(s => s > 0)).toBe(true);
  });

  it('uses unique id', () => {
    const bubble1 = createBubble(1, 800);
    const bubble2 = createBubble(2, 800);
    expect(bubble1.id).not.toBe(bubble2.id);
  });
});

describe('updateBubbles', () => {
  it('updates bubble positions', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0.5 },
    ];

    const updated = updateBubbles(bubbles, 800, 600);

    expect(updated[0].x).toBeCloseTo(50.5, 1);
    expect(updated[0].y).toBeCloseTo(51, 1);
  });

  it('removes bubbles that go off bottom of screen', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 649, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
    ];

    const updated = updateBubbles(bubbles, 800, 600);

    // Bubble at y=649 gets updated to y=650, which is removed (650 is not < 650)
    expect(updated).toHaveLength(0);
  });

  it('removes bubbles that go off left side', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: -60, y: 50, size: 40, color: '#FF6B6B', speedY: 0, speedX: -1 },
    ];

    const updated = updateBubbles(bubbles, 800, 600);

    expect(updated).toHaveLength(0);
  });

  it('removes bubbles that go off right side', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 860, y: 50, size: 40, color: '#FF6B6B', speedY: 0, speedX: 1 },
    ];

    const updated = updateBubbles(bubbles, 800, 600);

    expect(updated).toHaveLength(0);
  });

  it('keeps bubbles within bounds', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
      { id: 2, x: 100, y: 100, size: 40, color: '#4ECDC4', speedY: 0.5, speedX: -0.5 },
    ];

    const updated = updateBubbles(bubbles, 800, 600);

    expect(updated).toHaveLength(2);
  });

  it('does not mutate original bubbles array', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
    ];

    updateBubbles(bubbles, 800, 600);

    expect(bubbles[0].x).toBe(50);
    expect(bubbles[0].y).toBe(50);
  });
});

describe('checkBubblePop', () => {
  it('pops bubble when hand is within radius', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
    ];

    const result = checkBubblePop(bubbles, 50 / 800, 50 / 600, 800, 600);

    expect(result.popped).not.toBeNull();
    expect(result.popped?.id).toBe(1);
    expect(result.remaining).toHaveLength(0);
  });

  it('does not pop bubble when hand is outside radius', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
    ];

    const result = checkBubblePop(bubbles, 100 / 800, 100 / 600, 800, 600);

    expect(result.popped).toBeNull();
    expect(result.remaining).toHaveLength(1);
  });

  it('removes popped bubble from remaining', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
      { id: 2, x: 100, y: 100, size: 40, color: '#4ECDC4', speedY: 1, speedX: 0 },
    ];

    const result = checkBubblePop(bubbles, 50 / 800, 50 / 600, 800, 600);

    expect(result.popped?.id).toBe(1);
    expect(result.remaining).toHaveLength(1);
    expect(result.remaining[0].id).toBe(2);
  });

  it('handles empty bubbles array', () => {
    const result = checkBubblePop([], 50, 50, 800, 600);

    expect(result.popped).toBeNull();
    expect(result.remaining).toHaveLength(0);
  });

  it('normalizes hand coordinates correctly', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 400, y: 300, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
    ];

    // Hand at center (0.5, 0.5) should match bubble at (400, 300)
    const result = checkBubblePop(bubbles, 0.5, 0.5, 800, 600);

    expect(result.popped).not.toBeNull();
  });

  it('pops closest bubble when multiple are present', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
      { id: 2, x: 400, y: 300, size: 40, color: '#4ECDC4', speedY: 1, speedX: 0 },
    ];

    const result = checkBubblePop(bubbles, 50 / 800, 50 / 600, 800, 600);

    expect(result.popped?.id).toBe(1);
  });
});

describe('integration scenarios', () => {
  it('can create and update bubbles', () => {
    const bubble = createBubble(1, 800);
    const bubbles = [bubble];

    const updated = updateBubbles(bubbles, 800, 600);

    expect(updated).toHaveLength(1);
    expect(updated[0].y).toBeGreaterThan(bubble.y);
  });

  it('can create, update, and pop bubble', () => {
    const bubble = createBubble(1, 800);
    let bubbles = [bubble];

    bubbles = updateBubbles(bubbles, 800, 600);

    const result = checkBubblePop(bubbles, bubble.x / 800, bubble.y / 600, 800, 600);

    expect(result.popped?.id).toBe(bubble.id);
  });

  it('can simulate popping all bubbles', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 50, y: 50, size: 40, color: '#FF6B6B', speedY: 1, speedX: 0 },
      { id: 2, x: 100, y: 100, size: 40, color: '#4ECDC4', speedY: 1, speedX: 0 },
    ];

    let remaining = bubbles;
    for (const bubble of bubbles) {
      const result = checkBubblePop(remaining, bubble.x / 800, bubble.y / 600, 800, 600);
      remaining = result.remaining;
    }

    expect(remaining).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('handles bubble at exact edge of screen', () => {
    const bubbles: Bubble[] = [
      { id: 1, x: 0, y: 300, size: 40, color: '#FF6B6B', speedY: 0, speedX: 0 },
    ];

    const updated = updateBubbles(bubbles, 800, 600);

    // Bubble at x=0 should still be there (margin of 50)
    expect(updated).toHaveLength(1);
  });

  it('handles very large canvas size', () => {
    const bubble = createBubble(1, 2000);
    expect(bubble.x).toBeGreaterThanOrEqual(40);
    expect(bubble.x).toBeLessThanOrEqual(1960);
  });

  it('handles very small canvas size', () => {
    const bubble = createBubble(1, 100);
    // Minimum x is 40, so small canvas might have limited range
    expect(bubble.x).toBeGreaterThanOrEqual(40);
  });
});

describe('type definitions', () => {
  it('Bubble interface is correctly implemented', () => {
    const bubble: Bubble = {
      id: 1,
      x: 50,
      y: 50,
      size: 40,
      color: '#FF6B6B',
      speedY: 1,
      speedX: 0.5,
    };

    expect(typeof bubble.id).toBe('number');
    expect(typeof bubble.x).toBe('number');
    expect(typeof bubble.y).toBe('number');
    expect(typeof bubble.size).toBe('number');
    expect(typeof bubble.color).toBe('string');
    expect(typeof bubble.speedY).toBe('number');
    expect(typeof bubble.speedX).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      bubblesToPop: 15,
      maxBubbles: 8,
      spawnRate: 1500,
      timeLimit: 40,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.bubblesToPop).toBe('number');
    expect(typeof config.maxBubbles).toBe('number');
    expect(typeof config.spawnRate).toBe('number');
    expect(typeof config.timeLimit).toBe('number');
  });
});

describe('difficulty progression', () => {
  it('level 1 is easiest (fewest bubbles, slowest spawn)', () => {
    expect(LEVELS[0].bubblesToPop).toBe(10);
    expect(LEVELS[0].spawnRate).toBe(2000);
    expect(LEVELS[0].timeLimit).toBe(45);
  });

  it('level 3 is hardest (most bubbles, fastest spawn)', () => {
    expect(LEVELS[2].bubblesToPop).toBe(20);
    expect(LEVELS[2].spawnRate).toBe(1000);
    expect(LEVELS[2].timeLimit).toBe(35);
  });

  it('spawn rate halves from level 1 to level 3', () => {
    expect(LEVELS[0].spawnRate / LEVELS[2].spawnRate).toBe(2);
  });
});
