import { describe, expect, it } from 'vitest';

import {
  NUMBER_TEMPLATES,
  buildScore,
  calculateTraceCoverage,
  getTemplateForDigit,
  nextDigit,
} from '../numberTracingLogic';

describe('number tracing templates', () => {
  it('contains templates for 0 through 9', () => {
    expect(NUMBER_TEMPLATES).toHaveLength(10);
    expect(NUMBER_TEMPLATES[0].digit).toBe(0);
    expect(NUMBER_TEMPLATES[9].digit).toBe(9);
  });

  it('gets template for a valid digit', () => {
    const template = getTemplateForDigit(4);
    expect(template?.name).toBe('Four');
    expect(template?.guidePoints.length).toBeGreaterThan(2);
  });
});

describe('calculateTraceCoverage', () => {
  it('returns 0 for empty stroke', () => {
    const template = getTemplateForDigit(1)!;
    expect(calculateTraceCoverage([], template.guidePoints)).toBe(0);
  });

  it('returns high coverage for near-perfect trace', () => {
    const template = getTemplateForDigit(2)!;
    const coverage = calculateTraceCoverage(template.guidePoints, template.guidePoints);
    expect(coverage).toBe(100);
  });

  it('returns partial coverage for incomplete trace', () => {
    const template = getTemplateForDigit(3)!;
    const partialStroke = template.guidePoints.slice(0, 2);
    const coverage = calculateTraceCoverage(partialStroke, template.guidePoints);
    expect(coverage).toBeGreaterThan(0);
    expect(coverage).toBeLessThan(100);
  });
});

describe('score and progression helpers', () => {
  it('applies hint penalty to score', () => {
    expect(buildScore(90, 0)).toBe(90);
    expect(buildScore(90, 2)).toBe(80);
  });

  it('loops to zero after nine', () => {
    expect(nextDigit(8)).toBe(9);
    expect(nextDigit(9)).toBe(0);
  });
});
