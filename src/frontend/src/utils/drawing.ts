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
 * Smooth points using Chaikin's corner cutting algorithm for smoother curves
 *
 * @param points - Array of points to smooth
 * @param iterations - Number of smoothing iterations (default: 2)
 * @returns Smoothed array of points
 */
export function smoothPoints(
  points: Point[],
  iterations: number = 2
): Point[] {
  if (points.length < 3) return points;

  let result = [...points];

  for (let iter = 0; iter < iterations; iter++) {
    if (result.length < 3) break;

    const smoothed: Point[] = [];

    // Keep first point
    smoothed.push(result[0]);

    // Apply Chaikin's algorithm
    for (let i = 0; i < result.length - 1; i++) {
      const p0 = result[i];
      const p1 = result[i + 1];

      // Q point at 25% between p0 and p1
      smoothed.push({
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      });

      // R point at 75% between p0 and p1
      smoothed.push({
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      });
    }

    // Keep last point
    smoothed.push(result[result.length - 1]);

    result = smoothed;
  }

  return result;
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
 * Draw segments to canvas with optional glow effect using quadratic bezier curves
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

    // Apply smoothing for better visual quality
    const pointsToDraw = segment.length > 3 ? smoothPoints(segment, 2) : segment;

    if (pointsToDraw.length === 1) {
      // Single point - draw as a circle
      const x = pointsToDraw[0].x * canvasWidth;
      const y = pointsToDraw[0].y * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, opts.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = opts.color;
      ctx.fill();
    } else if (pointsToDraw.length === 2) {
      // Two points - draw straight line
      ctx.beginPath();
      ctx.moveTo(pointsToDraw[0].x * canvasWidth, pointsToDraw[0].y * canvasHeight);
      ctx.lineTo(pointsToDraw[1].x * canvasWidth, pointsToDraw[1].y * canvasHeight);
      ctx.stroke();
    } else {
      // Three or more points - draw using quadratic bezier curves for smoothness
      ctx.beginPath();
      ctx.moveTo(pointsToDraw[0].x * canvasWidth, pointsToDraw[0].y * canvasHeight);

      // Draw quadratic curves through midpoints for smoothness
      for (let i = 1; i < pointsToDraw.length - 1; i++) {
        const xc = (pointsToDraw[i].x * canvasWidth + pointsToDraw[i + 1].x * canvasWidth) / 2;
        const yc = (pointsToDraw[i].y * canvasHeight + pointsToDraw[i + 1].y * canvasHeight) / 2;
        ctx.quadraticCurveTo(
          pointsToDraw[i].x * canvasWidth,
          pointsToDraw[i].y * canvasHeight,
          xc,
          yc
        );
      }

      // Connect to the last point
      const lastIdx = pointsToDraw.length - 1;
      ctx.lineTo(pointsToDraw[lastIdx].x * canvasWidth, pointsToDraw[lastIdx].y * canvasHeight);

      ctx.stroke();
    }
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
  opacity: number = 0.35
): void {
  const fontSize = Math.min(canvasWidth, canvasHeight) * 0.6;
  
  ctx.save();
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Subtle fill for better visibility against camera feed
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
  ctx.fillText(letter, canvasWidth / 2, canvasHeight / 2);
  
  // Outline stroke
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.lineWidth = Math.max(3, Math.round(fontSize * 0.025));
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

/**
 * Draw animated direction arrow to guide tracing
 *
 * @param ctx - Canvas context
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param letter - Letter being traced (determines arrow positions)
 * @param progress - Animation progress (0-1)
 * @param color - Arrow color
 */
export function drawDirectionArrow(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  _letter: string, // Currently unused - could be used for letter-specific arrow paths
  progress: number,
  color: string = 'rgba(74, 222, 128, 0.8)'
): void {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const arrowSize = Math.min(canvasWidth, canvasHeight) * 0.08;
  const arrowOffset = arrowSize * 1.5;

  // Calculate arrow position based on letter tracing direction
  // For most letters, trace goes counter-clockwise from top
  const angle = (progress * Math.PI * 2) - Math.PI / 2;
  const arrowX = centerX + Math.cos(angle) * arrowOffset;
  const arrowY = centerY + Math.sin(angle) * arrowOffset;

  ctx.save();
  ctx.translate(arrowX, arrowY);
  ctx.rotate(angle + Math.PI / 2);

  // Draw arrow
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(0, -arrowSize);
  ctx.lineTo(-arrowSize * 0.6, arrowSize * 0.4);
  ctx.lineTo(-arrowSize * 0.3, arrowSize * 0.2);
  ctx.lineTo(-arrowSize * 0.1, arrowSize * 0.5);
  ctx.lineTo(arrowSize * 0.1, arrowSize * 0.5);
  ctx.lineTo(arrowSize * 0.3, arrowSize * 0.2);
  ctx.lineTo(arrowSize * 0.6, arrowSize * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Draw small circles at key tracing points (top, clockwise)
  const guidePoints = [
    { x: centerX, y: centerY - arrowSize * 1.8 }, // top
    { x: centerX + arrowSize * 1.8, y: centerY }, // right
    { x: centerX, y: centerY + arrowSize * 1.8 }, // bottom
    { x: centerX - arrowSize * 1.8, y: centerY }, // left
  ];

  guidePoints.forEach((point, idx) => {
    const alpha = 0.3 + 0.4 * Math.sin((progress * Math.PI * 2) + (idx * Math.PI / 2));
    ctx.beginPath();
    ctx.arc(point.x, point.y, arrowSize * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
    ctx.fill();
  });
}
