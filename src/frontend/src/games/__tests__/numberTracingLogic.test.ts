import { describe, expect, it } from 'vitest';

import {
  NUMBER_TEMPLATES,
  NumberTemplate,
  TracePoint,
  buildScore,
  calculateTraceCoverage,
  getTemplateForDigit,
  nextDigit,
} from '../numberTracingLogic';

describe('NUMBER_TEMPLATES', () => {
  it('has 10 templates for digits 0-9', () => {
    expect(NUMBER_TEMPLATES).toHaveLength(10);
  });

  it('has template for digit 0', () => {
    const zero = NUMBER_TEMPLATES.find(t => t.digit === 0);
    expect(zero?.name).toBe('Zero');
    expect(zero?.guidePoints.length).toBe(7);
  });

  it('has template for digit 1', () => {
    const one = NUMBER_TEMPLATES.find(t => t.digit === 1);
    expect(one?.name).toBe('One');
    expect(one?.guidePoints.length).toBe(3);
  });

  it('has template for digit 2', () => {
    const two = NUMBER_TEMPLATES.find(t => t.digit === 2);
    expect(two?.name).toBe('Two');
    expect(two?.guidePoints.length).toBe(6);
  });

  it('has template for digit 3', () => {
    const three = NUMBER_TEMPLATES.find(t => t.digit === 3);
    expect(three?.name).toBe('Three');
    expect(three?.guidePoints.length).toBe(5);
  });

  it('has template for digit 4', () => {
    const four = NUMBER_TEMPLATES.find(t => t.digit === 4);
    expect(four?.name).toBe('Four');
    expect(four?.guidePoints.length).toBe(4);
  });

  it('has template for digit 5', () => {
    const five = NUMBER_TEMPLATES.find(t => t.digit === 5);
    expect(five?.name).toBe('Five');
    expect(five?.guidePoints.length).toBe(6);
  });

  it('has template for digit 6', () => {
    const six = NUMBER_TEMPLATES.find(t => t.digit === 6);
    expect(six?.name).toBe('Six');
    expect(six?.guidePoints.length).toBe(7);
  });

  it('has template for digit 7', () => {
    const seven = NUMBER_TEMPLATES.find(t => t.digit === 7);
    expect(seven?.name).toBe('Seven');
    expect(seven?.guidePoints.length).toBe(3);
  });

  it('has template for digit 8', () => {
    const eight = NUMBER_TEMPLATES.find(t => t.digit === 8);
    expect(eight?.name).toBe('Eight');
    expect(eight?.guidePoints.length).toBe(9);
  });

  it('has template for digit 9', () => {
    const nine = NUMBER_TEMPLATES.find(t => t.digit === 9);
    expect(nine?.name).toBe('Nine');
    expect(nine?.guidePoints.length).toBe(7);
  });

  it('all templates have valid digit property', () => {
    for (const template of NUMBER_TEMPLATES) {
      expect(template.digit).toBeGreaterThanOrEqual(0);
      expect(template.digit).toBeLessThanOrEqual(9);
    }
  });

  it('all templates have non-empty guide points', () => {
    for (const template of NUMBER_TEMPLATES) {
      expect(template.guidePoints.length).toBeGreaterThan(0);
    }
  });
});

describe('getTemplateForDigit', () => {
  it('returns template for digit 0', () => {
    const template = getTemplateForDigit(0);
    expect(template).toBeDefined();
    expect(template?.digit).toBe(0);
  });

  it('returns template for digit 5', () => {
    const template = getTemplateForDigit(5);
    expect(template).toBeDefined();
    expect(template?.digit).toBe(5);
  });

  it('returns template for digit 9', () => {
    const template = getTemplateForDigit(9);
    expect(template).toBeDefined();
    expect(template?.digit).toBe(9);
  });

  it('returns undefined for invalid digit', () => {
    const template = getTemplateForDigit(10);
    expect(template).toBeUndefined();
  });

  it('returns undefined for negative digit', () => {
    const template = getTemplateForDigit(-1);
    expect(template).toBeUndefined();
  });
});

describe('calculateTraceCoverage', () => {
  it('returns 0 for empty stroke points', () => {
    const template = getTemplateForDigit(1)!;
    expect(calculateTraceCoverage([], template.guidePoints)).toBe(0);
  });

  it('returns 0 for empty template points', () => {
    const strokePoints: TracePoint[] = [{ x: 0.5, y: 0.5 }];
    expect(calculateTraceCoverage(strokePoints, [])).toBe(0);
  });

  it('returns 0 for both empty', () => {
    expect(calculateTraceCoverage([], [])).toBe(0);
  });

  it('returns 100 for perfect trace (identical points)', () => {
    const template = getTemplateForDigit(2)!;
    const coverage = calculateTraceCoverage(template.guidePoints, template.guidePoints);
    expect(coverage).toBe(100);
  });

  it('returns high coverage for near-perfect trace', () => {
    const template = getTemplateForDigit(3)!;
    // Slightly offset points
    const nearPoints = template.guidePoints.map(p => ({
      x: p.x + 0.01,
      y: p.y + 0.01,
    }));
    const coverage = calculateTraceCoverage(nearPoints, template.guidePoints);
    expect(coverage).toBe(100);
  });

  it('returns partial coverage for half-covered', () => {
    const template = getTemplateForDigit(4)!;
    const halfPoints = template.guidePoints.slice(0, Math.floor(template.guidePoints.length / 2));
    const coverage = calculateTraceCoverage(halfPoints, template.guidePoints);
    expect(coverage).toBeGreaterThan(0);
    expect(coverage).toBeLessThan(100);
  });

  it('uses default tolerance of 0.12', () => {
    const template = getTemplateForDigit(1)!;
    // Points just at tolerance threshold
    const nearPoints = template.guidePoints.map(p => ({
      x: p.x + 0.11,
      y: p.y,
    }));
    const coverage = calculateTraceCoverage(nearPoints, template.guidePoints);
    expect(coverage).toBe(100);
  });

  it('returns 0 for points far from template', () => {
    const template = getTemplateForDigit(1)!;
    const farPoints: TracePoint[] = [{ x: 0, y: 0 }];
    const coverage = calculateTraceCoverage(farPoints, template.guidePoints);
    expect(coverage).toBe(0);
  });

  it('respects custom tolerance parameter', () => {
    const template = getTemplateForDigit(2)!;
    const offsetPoints = template.guidePoints.map(p => ({
      x: p.x + 0.1,
      y: p.y,
    }));

    const strict = calculateTraceCoverage(offsetPoints, template.guidePoints, 0.05);
    const lenient = calculateTraceCoverage(offsetPoints, template.guidePoints, 0.15);

    expect(lenient).toBeGreaterThan(strict);
  });

  it('handles single point template', () => {
    const singleTemplate: TracePoint[] = [{ x: 0.5, y: 0.5 }];
    const stroke: TracePoint[] = [{ x: 0.5, y: 0.5 }];
    expect(calculateTraceCoverage(stroke, singleTemplate)).toBe(100);
  });
});

describe('buildScore', () => {
  it('returns accuracy for zero hints', () => {
    expect(buildScore(100, 0)).toBe(100);
    expect(buildScore(80, 0)).toBe(80);
    expect(buildScore(50, 0)).toBe(50);
  });

  it('subtracts 5 points per hint', () => {
    expect(buildScore(100, 1)).toBe(95);
    expect(buildScore(100, 2)).toBe(90);
    expect(buildScore(100, 3)).toBe(85);
  });

  it('caps hint penalty at 25 points (5 hints)', () => {
    expect(buildScore(100, 5)).toBe(75);
    expect(buildScore(100, 6)).toBe(75); // Same as 5
    expect(buildScore(100, 10)).toBe(75); // Same as 5
  });

  it('never returns negative score', () => {
    expect(buildScore(10, 10)).toBe(0);
    expect(buildScore(5, 5)).toBe(0);
    expect(buildScore(0, 1)).toBe(0);
  });

  it('handles zero accuracy', () => {
    expect(buildScore(0, 0)).toBe(0);
    expect(buildScore(0, 5)).toBe(0);
  });

  it('handles perfect accuracy with hints', () => {
    expect(buildScore(100, 1)).toBe(95);
    expect(buildScore(100, 4)).toBe(80);
  });
});

describe('nextDigit', () => {
  it('increments digit by 1', () => {
    expect(nextDigit(0)).toBe(1);
    expect(nextDigit(1)).toBe(2);
    expect(nextDigit(5)).toBe(6);
  });

  it('wraps from 9 to 0', () => {
    expect(nextDigit(9)).toBe(0);
  });

  it('handles negative input by returning 0', () => {
    expect(nextDigit(-1)).toBe(0);
    expect(nextDigit(-10)).toBe(0);
  });

  it('handles input greater than 9 by returning 0', () => {
    expect(nextDigit(10)).toBe(0);
    expect(nextDigit(100)).toBe(0);
  });

  it('cycles through all digits', () => {
    let digit = 0;
    const sequence: number[] = [];
    for (let i = 0; i < 12; i++) {
      sequence.push(digit);
      digit = nextDigit(digit);
    }
    expect(sequence).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1]);
  });
});

describe('integration scenarios', () => {
  it('can trace digit 1 completely', () => {
    const template = getTemplateForDigit(1)!;
    const coverage = calculateTraceCoverage(template.guidePoints, template.guidePoints);
    expect(coverage).toBe(100);
  });

  it('can score a perfect trace with no hints', () => {
    const score = buildScore(100, 0);
    expect(score).toBe(100);
  });

  it('can score a partial trace with hints', () => {
    const score = buildScore(70, 2);
    expect(score).toBe(60);
  });

  it('can progress through all digits', () => {
    let digit = 0;
    const visited: number[] = [];
    for (let i = 0; i < 10; i++) {
      visited.push(digit);
      digit = nextDigit(digit);
    }
    expect(visited).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe('edge cases', () => {
  it('handles empty template gracefully', () => {
    const coverage = calculateTraceCoverage([{ x: 0.5, y: 0.5 }], []);
    expect(coverage).toBe(0);
  });

  it('handles very low accuracy', () => {
    const score = buildScore(5, 0);
    expect(score).toBe(5);
  });

  it('handles max hints', () => {
    const score = buildScore(50, 100);
    expect(score).toBe(25); // Min capped penalty
  });

  it('handles digit boundary at 0', () => {
    expect(nextDigit(0)).toBe(1);
  });

  it('handles digit boundary at 9', () => {
    expect(nextDigit(9)).toBe(0);
  });
});

describe('type definitions', () => {
  it('TracePoint interface is correctly implemented', () => {
    const point: TracePoint = {
      x: 0.5,
      y: 0.5,
    };

    expect(typeof point.x).toBe('number');
    expect(typeof point.y).toBe('number');
  });

  it('NumberTemplate interface is correctly implemented', () => {
    const template: NumberTemplate = {
      digit: 5,
      name: 'Five',
      guidePoints: [
        { x: 0.5, y: 0.2 },
        { x: 0.5, y: 0.8 },
      ],
    };

    expect(typeof template.digit).toBe('number');
    expect(typeof template.name).toBe('string');
    expect(Array.isArray(template.guidePoints)).toBe(true);
  });

  it('all guide points have valid coordinates', () => {
    for (const template of NUMBER_TEMPLATES) {
      for (const point of template.guidePoints) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(1);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(1);
      }
    }
  });
});
