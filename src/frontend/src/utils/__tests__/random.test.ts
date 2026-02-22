import { describe, expect, it, vi } from 'vitest';

import { randomBetween, randomFloat01 } from '../random';

describe('random utilities', () => {
  it('returns values in [0, 1]', () => {
    const value = randomFloat01();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });

  it('falls back to Math.random when crypto fails', () => {
    const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.25);
    vi.spyOn(crypto, 'getRandomValues').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(randomFloat01()).toBe(0.25);

    mathSpy.mockRestore();
  });

  it('randomBetween stays in bounds', () => {
    const value = randomBetween(5, 10);
    expect(value).toBeGreaterThanOrEqual(5);
    expect(value).toBeLessThanOrEqual(10);
  });
});
