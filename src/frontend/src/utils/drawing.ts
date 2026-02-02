/**
 * Drawing utilities for smooth, anti-aliased canvas drawing
 * 
 * Provides shared drawing functions for all camera-based games
 * including point smoothing, glow effects, and canvas management.
 * 
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 */

import type {
  Point,
  PointSegment,
  DrawOptions,
  CompressedPoint,
} from '../types/tracking';

const DEFAULT_DRAW_OPTIONS: Required<DrawOptions> = {
  color: '#000000',
  lineWidth: 10,
  enableGlow: true,
  glowColor: '',  // Will default to color
  glowBlur: 10,
};

/**
 * Smooth points using moving average
 * 
 * @param points - Array of points to smooth
 * @param windowSize - Size of smoothing window (default: 3)
 * @returns Smoothed array of points
 */
export function smoothPoints(
  points: Point[],
  windowSize: number = 3
): Point[] {
  if (points.length < windowSize) return points;
  
  const smoothed: Point[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < points.length; i++) {
    let sumX = 0, sumY = 0, count = 0;
    
    // Average over window centered at current point
    for (let j = -halfWindow; j <= halfWindow; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < points.length) {
        sumX += points[idx].x;
        sumY += points[idx].y;
        count++;
      }
    }
    
    smoothed.push({
      x: sumX / count,
      y: sumY / count,
    });
  }
  
  return smoothed;
}

/**
 * Build segments from points, splitting on break points (NaN)
 * 
 * @param points - Array of points, NaN values indicate breaks
 * @returns Array of segments (continuous point arrays)
 */
export function buildSegments(points: Point[]): PointSegment[] {
  const segments: PointSegment[] = [];
  let currentSegment: Point[] = [];
  
  for (const point of points) {
    if (isNaN(point.x) || isNaN(point.y)) {
      // Break point - save current segment and start new one
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    } else {
      currentSegment.push(point);
    }
  }
  
  // Don't forget the last segment
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }
  
  return segments;
}

/**
 * Draw segments to canvas with optional glow effect
 * 
 * @param ctx - Canvas rendering context
 * @param segments - Array of point segments
 * @param canvasWidth - Canvas width for coordinate scaling
 * @param canvasHeight - Canvas height for coordinate scaling
 * @param options - Drawing options
 */
export function drawSegments(
  ctx: CanvasRenderingContext2D,
  segments: PointSegment[],
  canvasWidth: number,
  canvasHeight: number,
  options: DrawOptions = {}
): void {
  const opts = { ...DEFAULT_DRAW_OPTIONS, ...options };
  const glowColor = opts.glowColor || opts.color;
  
  if (segments.length === 0) return;
  
  ctx.save();
  
  // Set up drawing style
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Apply glow effect
  if (opts.enableGlow) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = opts.glowBlur;
  }
  
  // Draw each segment
  for (const segment of segments) {
    if (segment.length === 0) continue;

    // Apply smoothing for better visual quality (matches prior in-game behavior)
    const pointsToDraw = segment.length > 3 ? smoothPoints(segment) : segment;
    
    ctx.beginPath();
    
    // Move to first point
    ctx.moveTo(pointsToDraw[0].x * canvasWidth, pointsToDraw[0].y * canvasHeight);
    
    // Draw lines to remaining points
    for (let i = 1; i < pointsToDraw.length; i++) {
      ctx.lineTo(pointsToDraw[i].x * canvasWidth, pointsToDraw[i].y * canvasHeight);
    }
    
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Setup canvas to match video dimensions
 * 
 * @param canvas - Canvas element
 * @param video - Video element
 * @returns True if canvas was resized
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement
): boolean {
  if (
    canvas.width !== video.videoWidth ||
    canvas.height !== video.videoHeight
  ) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    return true;
  }
  return false;
}

/**
 * Draw letter hint outline on canvas
 * 
 * @param ctx - Canvas rendering context
 * @param letter - Letter to draw
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param opacity - Opacity of hint (0-1, default: 0.25)
 */
export function drawLetterHint(
  ctx: CanvasRenderingContext2D,
  letter: string,
  canvasWidth: number,
  canvasHeight: number,
  opacity: number = 0.25
): void {
  const fontSize = Math.min(canvasWidth, canvasHeight) * 0.6;
  
  ctx.save();
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.02));
  // Outline-only hint (less visually blocking than filled text)
  // Keep the letter readable while allowing the camera feed + strokes to be primary.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(letter, canvasWidth / 2, canvasHeight / 2);
  
  // Draw guide circle
  ctx.beginPath();
  ctx.arc(
    canvasWidth / 2,
    canvasHeight / 2,
    Math.min(canvasWidth, canvasHeight) * 0.25,
    0,
    2 * Math.PI
  );
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
  ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.004));
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Compress points for storage/transmission
 * Reduces precision to save space
 * 
 * @param points - Array of points
 * @param precision - Decimal places (default: 4)
 * @returns Compressed points
 */
export function compressPoints(
  points: Point[],
  precision: number = 4
): CompressedPoint[] {
  const multiplier = Math.pow(10, precision);
  return points.map(p => ({
    x: Math.round(p.x * multiplier) / multiplier,
    y: Math.round(p.y * multiplier) / multiplier,
  }));
}

/**
 * Decompress points (currently just returns as-is, but allows for future encoding)
 * 
 * @param points - Compressed points
 * @returns Decompressed points
 */
export function decompressPoints(points: CompressedPoint[]): Point[] {
  return points.map(p => ({ x: p.x, y: p.y }));
}

/**
 * Add a break point to separate line segments
 * 
 * @param points - Point array to modify
 */
export function addBreakPoint(points: Point[]): void {
  points.push({ x: NaN, y: NaN });
}

/**
 * Calculate distance between two points
 * 
 * @param a - First point
 * @param b - Second point
 * @returns Euclidean distance
 */
export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point movement exceeds minimum threshold
 * 
 * @param lastPoint - Previous point
 * @param newPoint - New point
 * @param minDistance - Minimum distance threshold
 * @returns True if movement exceeds threshold
 */
export function shouldAddPoint(
  lastPoint: Point | null | undefined,
  newPoint: Point,
  minDistance: number = 0.002
): boolean {
  if (!lastPoint || isNaN(lastPoint.x)) return true;
  return distance(lastPoint, newPoint) > minDistance;
}

/**
 * Clear canvas with optional fade effect
 * 
 * @param ctx - Canvas context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param fadeAmount - Fade amount (0 = clear, 1 = keep everything)
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fadeAmount: number = 0
): void {
  if (fadeAmount <= 0) {
    ctx.clearRect(0, 0, width, height);
  } else {
    // Fade effect - draw semi-transparent background
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
