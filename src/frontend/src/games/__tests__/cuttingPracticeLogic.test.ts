import { describe, expect, it } from 'vitest';
import {
  LEVELS,
  generateCutLines,
  distanceToSegment,
  isNearCutLine,
  calculateCutProgress,
  calculateCutQuality,
  getCutQualityPoints,
  areAllLinesCompleted,
  calculateTotalScore,
  getMaterialEmoji,
  getMaterialColor,
} from '../cuttingPracticeLogic';

describe('LEVELS', () => {
  it('has 3 levels defined', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('has correct level configurations', () => {
    expect(LEVELS[0]).toEqual({
      level: 1,
      name: 'Paper',
      material: 'paper',
      tolerance: 40,
    });
    expect(LEVELS[1]).toEqual({
      level: 2,
      name: 'Fabric',
      material: 'fabric',
      tolerance: 30,
    });
    expect(LEVELS[2]).toEqual({
      level: 3,
      name: 'Food',
      material: 'food',
      tolerance: 20,
    });
  });
});

describe('generateCutLines', () => {
  it('generates correct number of lines for each level', () => {
    const level1Lines = generateCutLines(1, 600, 400);
    const level2Lines = generateCutLines(2, 600, 400);
    const level3Lines = generateCutLines(3, 600, 400);

    expect(level1Lines).toHaveLength(4); // 3 + 1
    expect(level2Lines).toHaveLength(5); // 3 + 2
    expect(level3Lines).toHaveLength(6); // 3 + 3
  });

  it('generates lines with valid points', () => {
    const lines = generateCutLines(1, 600, 400);

    for (const line of lines) {
      expect(line.points.length).toBeGreaterThanOrEqual(2);
      expect(line.completed).toBe(false);
      expect(line.progress).toBe(0);
      expect(line.cutQuality).toBe(0);

      for (const point of line.points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(600);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(400);
      }
    }
  });

  it('generates unique IDs for lines', () => {
    const lines = generateCutLines(2, 600, 400);
    const ids = lines.map(l => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('distanceToSegment', () => {
  it('returns 0 for point on segment', () => {
    const dist = distanceToSegment(50, 50, 0, 0, 100, 100);
    expect(dist).toBeCloseTo(0, 5);
  });

  it('calculates perpendicular distance', () => {
    const dist = distanceToSegment(50, 50, 0, 0, 100, 0);
    expect(dist).toBe(50);
  });

  it('returns distance to endpoint when beyond segment', () => {
    const dist = distanceToSegment(150, 0, 0, 0, 100, 0);
    expect(dist).toBe(50);
  });

  it('calculates diagonal distance correctly', () => {
    // Point at (0, 10) to segment from (0, 0) to (10, 0)
    const dist = distanceToSegment(0, 10, 0, 0, 10, 0);
    expect(dist).toBe(10);
  });
});

describe('isNearCutLine', () => {
  const mockLine = {
    id: 0,
    points: [
      { x: 100, y: 100 },
      { x: 200, y: 100 },
      { x: 200, y: 200 },
    ],
    completed: false,
    progress: 0,
    cutQuality: 0,
  };

  it('returns true for point near line', () => {
    const { isNear, minDistance } = isNearCutLine(150, 100, mockLine, 50);
    expect(isNear).toBe(true);
    expect(minDistance).toBe(0);
  });

  it('returns false for point far from line', () => {
    const { isNear, minDistance } = isNearCutLine(150, 300, mockLine, 50);
    expect(isNear).toBe(false);
    expect(minDistance).toBeCloseTo(111.8, 1);
  });

  it('returns correct closest segment', () => {
    const { closestSegment } = isNearCutLine(150, 100, mockLine, 50);
    expect(closestSegment).toBe(0); // First segment
  });

  it('handles point near second segment', () => {
    const { closestSegment } = isNearCutLine(200, 150, mockLine, 50);
    expect(closestSegment).toBe(1); // Second segment
  });
});

describe('calculateCutProgress', () => {
  const mockLine = {
    id: 0,
    points: [
      { x: 0, y: 100 },
      { x: 100, y: 100 },
      { x: 200, y: 100 },
    ],
    completed: false,
    progress: 0,
    cutQuality: 0,
  };

  it('returns 0 at start of line', () => {
    const progress = calculateCutProgress({ x: 0, y: 100 }, mockLine, { x: 0, y: 100 });
    expect(progress).toBe(0);
  });

  it('returns approximately 50 at middle of line', () => {
    const progress = calculateCutProgress({ x: 100, y: 100 }, mockLine, { x: 0, y: 100 });
    expect(progress).toBeCloseTo(50, 0);
  });

  it('returns 100 at end of line', () => {
    const progress = calculateCutProgress({ x: 200, y: 100 }, mockLine, { x: 0, y: 100 });
    expect(progress).toBeCloseTo(100, 0);
  });

  it('clamps to 0-100 range', () => {
    const beforeStart = calculateCutProgress({ x: -50, y: 100 }, mockLine, { x: 0, y: 100 });
    const afterEnd = calculateCutProgress({ x: 250, y: 100 }, mockLine, { x: 0, y: 100 });

    expect(beforeStart).toBeGreaterThanOrEqual(0);
    expect(afterEnd).toBeLessThanOrEqual(100);
  });
});

describe('calculateCutQuality', () => {
  it('returns perfect for very close cuts', () => {
    expect(calculateCutQuality(5, 40)).toBe('perfect');
    expect(calculateCutQuality(10, 40)).toBe('perfect');
  });

  it('returns good for moderately close cuts', () => {
    expect(calculateCutQuality(20, 40)).toBe('good');
    expect(calculateCutQuality(23, 40)).toBe('good');
  });

  it('returns ok for distant cuts', () => {
    expect(calculateCutQuality(30, 40)).toBe('ok');
    expect(calculateCutQuality(35, 40)).toBe('ok');
  });

  it('returns miss for far cuts', () => {
    expect(calculateCutQuality(45, 40)).toBe('miss');
    expect(calculateCutQuality(100, 40)).toBe('miss');
  });
});

describe('getCutQualityPoints', () => {
  it('returns 20 for perfect', () => {
    expect(getCutQualityPoints('perfect')).toBe(20);
  });

  it('returns 15 for good', () => {
    expect(getCutQualityPoints('good')).toBe(15);
  });

  it('returns 10 for ok', () => {
    expect(getCutQualityPoints('ok')).toBe(10);
  });

  it('returns 0 for miss', () => {
    expect(getCutQualityPoints('miss')).toBe(0);
  });
});

describe('areAllLinesCompleted', () => {
  it('returns true when all lines are completed', () => {
    const lines = [
      { id: 0, points: [{ x: 0, y: 0 }], completed: true, progress: 100, cutQuality: 10 },
      { id: 1, points: [{ x: 100, y: 0 }], completed: true, progress: 100, cutQuality: 15 },
    ];
    expect(areAllLinesCompleted(lines)).toBe(true);
  });

  it('returns false when some lines are not completed', () => {
    const lines = [
      { id: 0, points: [{ x: 0, y: 0 }], completed: true, progress: 100, cutQuality: 10 },
      { id: 1, points: [{ x: 100, y: 0 }], completed: false, progress: 0, cutQuality: 0 },
    ];
    expect(areAllLinesCompleted(lines)).toBe(false);
  });

  it('returns true for empty array', () => {
    expect(areAllLinesCompleted([])).toBe(true);
  });
});

describe('calculateTotalScore', () => {
  it('calculates base score from completed lines', () => {
    const lines = [
      { id: 0, points: [{ x: 0, y: 0 }], completed: true, progress: 100, cutQuality: 5 }, // perfect (20)
      { id: 1, points: [{ x: 100, y: 0 }], completed: true, progress: 100, cutQuality: 15 }, // good (15)
    ];
    const score = calculateTotalScore(lines, 0);
    expect(score).toBe(35); // 20 + 15
  });

  it('adds combo bonus', () => {
    const lines = [
      { id: 0, points: [{ x: 0, y: 0 }], completed: true, progress: 100, cutQuality: 5 },
    ];
    const score = calculateTotalScore(lines, 3);
    expect(score).toBe(35); // 20 + (3 * 5)
  });

  it('caps combo bonus at 25', () => {
    const lines = [
      { id: 0, points: [{ x: 0, y: 0 }], completed: true, progress: 100, cutQuality: 5 },
    ];
    const score = calculateTotalScore(lines, 10);
    expect(score).toBe(45); // 20 + 25 (capped)
  });

  it('ignores incomplete lines', () => {
    const lines = [
      { id: 0, points: [{ x: 0, y: 0 }], completed: true, progress: 100, cutQuality: 5 },
      { id: 1, points: [{ x: 100, y: 0 }], completed: false, progress: 0, cutQuality: 0 },
    ];
    const score = calculateTotalScore(lines, 0);
    expect(score).toBe(20);
  });
});

describe('getMaterialEmoji', () => {
  it('returns correct emojis', () => {
    expect(getMaterialEmoji('paper')).toBe('📄');
    expect(getMaterialEmoji('fabric')).toBe('🧵');
    expect(getMaterialEmoji('food')).toBe('🍕');
  });
});

describe('getMaterialColor', () => {
  it('returns correct colors', () => {
    expect(getMaterialColor('paper')).toBe('#F5F5F5');
    expect(getMaterialColor('fabric')).toBe('#FFE4E1');
    expect(getMaterialColor('food')).toBe('#FFF8DC');
  });
});
