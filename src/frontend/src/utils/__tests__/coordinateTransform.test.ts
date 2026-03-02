/**
 * Unit tests for coordinate transform utilities
 * 
 * Verifies conversion between normalized landmarks and canvas pixels
 * accounts for devicePixelRatio and CSS transforms.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  getCanvasCoordinates,
  getNormalizedCoordinates,
  isPointInCircle,
} from '../coordinateTransform';

// Mock DOMRect for testing
const createMockRect = (
  width: number,
  height: number,
  x: number = 0,
  y: number = 0
): DOMRect => ({
  x,
  y,
  width,
  height,
  top: y,
  right: x + width,
  bottom: y + height,
  left: x,
  toJSON: () => ({ x, y, width, height }),
});

describe('getCanvasCoordinates', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockRect: DOMRect;

  beforeEach(() => {
    // Create mock canvas
    mockCanvas = document.createElement('canvas');
    mockRect = createMockRect(800, 600);
    
    // Mock getBoundingClientRect
    vi.spyOn(mockCanvas, 'getBoundingClientRect').mockReturnValue(mockRect);
  });

  it('converts normalized point to pixels with DPR=1', () => {
    // Mock DPR = 1
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 1,
      writable: true,
      configurable: true,
    });

    const normalized = { x: 0.5, y: 0.5 };
    const result = getCanvasCoordinates(mockCanvas, normalized);

    expect(result.x).toBe(400); // 0.5 * 800 * 1
    expect(result.y).toBe(300); // 0.5 * 600 * 1
  });

  it('accounts for devicePixelRatio=2 (Retina display)', () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true,
      configurable: true,
    });

    const normalized = { x: 0.25, y: 0.75 };
    const result = getCanvasCoordinates(mockCanvas, normalized);

    expect(result.x).toBe(400); // 0.25 * 800 * 2
    expect(result.y).toBe(900); // 0.75 * 600 * 2
  });

  it('handles edge values (0 and 1)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1 });

    expect(getCanvasCoordinates(mockCanvas, { x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(getCanvasCoordinates(mockCanvas, { x: 1, y: 1 })).toEqual({ x: 800, y: 600 });
  });

  it('works with CSS-transformed canvas (getBoundingClientRect accounts for it)', () => {
    // Simulate canvas scaled via CSS: 800x600 CSS pixels, but 1600x1200 device pixels
    mockRect = createMockRect(400, 300); // CSS says 400x300
    vi.spyOn(mockCanvas, 'getBoundingClientRect').mockReturnValue(mockRect);
    Object.defineProperty(window, 'devicePixelRatio', { value: 2 });

    const normalized = { x: 0.5, y: 0.5 };
    const result = getCanvasCoordinates(mockCanvas, normalized);

    // Should use CSS dimensions * DPR: 400 * 2 = 800 actual pixels wide
    expect(result.x).toBe(400); // 0.5 * 400 * 2
    expect(result.y).toBe(300); // 0.5 * 300 * 2
  });
});

describe('getNormalizedCoordinates', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    vi.spyOn(mockCanvas, 'getBoundingClientRect').mockReturnValue(
      createMockRect(800, 600)
    );
  });

  it('converts pixel coordinates back to normalized [0,1]', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1 });

    const pixel = { x: 400, y: 300 };
    const result = getNormalizedCoordinates(mockCanvas, pixel);

    expect(result.x).toBe(0.5); // 400 / (800 * 1)
    expect(result.y).toBe(0.5); // 300 / (600 * 1)
  });

  it('round-trip conversion is accurate', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2 });

    const original = { x: 0.33, y: 0.67 };
    const pixel = getCanvasCoordinates(mockCanvas, original);
    const recovered = getNormalizedCoordinates(mockCanvas, pixel);

    // Allow small floating-point error
    expect(Math.abs(recovered.x - original.x)).toBeLessThan(0.001);
    expect(Math.abs(recovered.y - original.y)).toBeLessThan(0.001);
  });

  it('handles pixel values at canvas boundaries', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1 });

    expect(getNormalizedCoordinates(mockCanvas, { x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(getNormalizedCoordinates(mockCanvas, { x: 800, y: 600 })).toEqual({ x: 1, y: 1 });
  });
});

describe('isPointInCircle', () => {
  it('returns true for point inside radius', () => {
    const point = { x: 10, y: 10 };
    const center = { x: 10, y: 10 };
    const radius = 5;

    expect(isPointInCircle(point, center, radius)).toBe(true);
  });

  it('returns false for point outside radius', () => {
    const point = { x: 20, y: 20 };
    const center = { x: 10, y: 10 };
    const radius = 5;

    expect(isPointInCircle(point, center, radius)).toBe(false);
  });

  it('handles edge case: point exactly on radius', () => {
    // Distance from (0,0) to (3,4) is exactly 5
    const point = { x: 3, y: 4 };
    const center = { x: 0, y: 0 };
    const radius = 5;

    expect(isPointInCircle(point, center, radius)).toBe(true); // <= comparison
  });

  it('works with floating-point coordinates', () => {
    const point = { x: 10.5, y: 10.5 };
    const center = { x: 10, y: 10 };
    const radius = 1;

    // Distance = sqrt(0.5^2 + 0.5^2) = sqrt(0.5) ≈ 0.707 < 1
    expect(isPointInCircle(point, center, radius)).toBe(true);
  });
});
