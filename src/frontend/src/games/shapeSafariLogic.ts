/**
 * Shape Safari Game Logic
 * 
 * Children trace hidden shapes in illustrated scenes to discover
 * animals and objects. Builds shape recognition and fine motor skills.
 * 
 * Targets: Shape recognition, visual scanning, fine motor control
 * Age: 3-5 years
 * 
 * Research Insights:
 * - Shape recognition is foundational for geometry and spatial reasoning
 * - Children master circles (2-3 yrs), squares (3-4 yrs), triangles (4-5 yrs)
 * - Hidden object discovery adds excitement and engagement
 * - Tracing builds fine motor control needed for writing
 */

import type { Point } from '../types/tracking';
import { recordCVError } from '../analytics/extensions/countingCollectathon';
import { distanceToSegment as _distanceToSegment } from '../utils/geometry';

// Re-export Point type for convenience
export type { Point } from '../types/tracking';

// Game constants
export const STREAK_MILESTONE_INTERVAL = 5; // Celebrate every 5 correct answers
export const STREAK_MILESTONE_DURATION_MS = 1500; // Show celebration for 1.5 seconds

export type ShapeType = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'oval' | 'diamond' | 'heart';

export interface HiddenShape {
  id: string;
  type: ShapeType;
  path: Path2D | null;        // Canvas path for tracing
  normalizedPath: Point[];    // Path as normalized coordinates
  position: Point;            // Center position (normalized 0-1)
  size: number;               // Radius/size (normalized)
  rotation: number;           // Rotation in degrees
  isFound: boolean;
  hiddenObject: {
    name: string;
    emoji: string;
    description: string;
  };
  difficulty: 1 | 2 | 3;      // Tracing tolerance
}

export interface SafariScene {
  id: string;
  theme: 'jungle' | 'ocean' | 'space' | 'farm' | 'city' | 'garden';
  name: string;
  description: string;
  backgroundColor: string;
  gradientColors: [string, string];
  difficulty: 1 | 2 | 3;
  targetShape: ShapeType | 'mixed';
  targetCount: number;
  shapes: HiddenShape[];
  decorations: Decoration[];
}

export interface Decoration {
  emoji: string;
  position: Point;
  size: number;
  rotation: number;
}

export interface TracingState {
  isTracing: boolean;
  currentPath: Point[];
  targetShape: HiddenShape | null;
  progress: number;           // 0-1 tracing progress
}

export interface GameState {
  currentScene: SafariScene | null;
  // DECISION-2026-03-08: Removed foundShapes Set
  // RATIONALE: Duplicated state - shapes[].isFound already tracks this
  // Use getProgress() or shapes.filter(s => s.isFound).length instead
  tracingState: TracingState;
  score: number;
  startTime: number;
  hintsUsed: number;
  completed: boolean;
  // Note: completed is set by markShapeFound when all shapes found
}

// Shape drawing functions (normalized coordinates 0-1)
function createCirclePath(center: Point, radius: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
}

function createSquarePath(center: Point, size: number, rotation: number = 0): Point[] {
  const points: Point[] = [];
  const half = size / 2;
  const corners = [
    { x: -half, y: -half },
    { x: half, y: -half },
    { x: half, y: half },
    { x: -half, y: half },
  ];
  
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  for (let i = 0; i <= 4; i++) {
    const corner = corners[i % 4];
    const rotated = {
      x: corner.x * cos - corner.y * sin + center.x,
      y: corner.x * sin + corner.y * cos + center.y,
    };
    points.push(rotated);
  }
  return points;
}

function createTrianglePath(center: Point, size: number, rotation: number = 0): Point[] {
  const points: Point[] = [];
  const height = size * Math.sqrt(3) / 2;
  const corners = [
    { x: 0, y: -height * 2/3 },
    { x: -size / 2, y: height / 3 },
    { x: size / 2, y: height / 3 },
  ];
  
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  for (let i = 0; i <= 3; i++) {
    const corner = corners[i % 3];
    const rotated = {
      x: corner.x * cos - corner.y * sin + center.x,
      y: corner.x * sin + corner.y * cos + center.y,
    };
    points.push(rotated);
  }
  return points;
}

function createStarPath(center: Point, outerRadius: number, innerRadius: number = outerRadius * 0.4): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    });
  }
  return points;
}

function createHeartPath(center: Point, size: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= 32; i++) {
    const t = (i / 32) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({
      x: center.x + (x / 16) * size,
      y: center.y + (y / 16) * size,
    });
  }
  return points;
}

function createShapePath(type: ShapeType, center: Point, size: number, rotation: number = 0): Point[] {
  switch (type) {
    case 'circle':
    case 'oval':
      return createCirclePath(center, size);
    case 'square':
    case 'rectangle':
    case 'diamond':
      return createSquarePath(center, size, type === 'diamond' ? 45 : rotation);
    case 'triangle':
      return createTrianglePath(center, size, rotation);
    case 'star':
      return createStarPath(center, size);
    case 'heart':
      return createHeartPath(center, size);
    default:
      return createCirclePath(center, size);
  }
}

// Safari scenes database
export const SAFARI_SCENES: SafariScene[] = [
  {
    id: 'jungle-circles',
    theme: 'jungle',
    name: 'Jungle Circles',
    description: 'Find all the circles hiding in the jungle!',
    backgroundColor: '#1a4a1a',
    gradientColors: ['#0d2d0d', '#1a4a1a'],
    difficulty: 1,
    targetShape: 'circle',
    targetCount: 5,
    shapes: [
      {
        id: 'monkey-face',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.2, y: 0.3 },
        size: 0.08,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Monkey', emoji: '🐵', description: 'a playful monkey' },
        difficulty: 1,
      },
      {
        id: 'coconut',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.7, y: 0.2 },
        size: 0.06,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Coconut', emoji: '🥥', description: 'a coconut' },
        difficulty: 1,
      },
      {
        id: 'tiger-spot',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.5, y: 0.6 },
        size: 0.1,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Tiger', emoji: '🐯', description: 'a striped tiger' },
        difficulty: 1,
      },
      {
        id: 'frog',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.8, y: 0.7 },
        size: 0.05,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Frog', emoji: '🐸', description: 'a green frog' },
        difficulty: 1,
      },
      {
        id: 'sun',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.15, y: 0.15 },
        size: 0.07,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Sun', emoji: '☀️', description: 'the warm sun' },
        difficulty: 1,
      },
    ],
    decorations: [
      { emoji: '🌴', position: { x: 0.05, y: 0.5 }, size: 0.15, rotation: -5 },
      { emoji: '🌴', position: { x: 0.85, y: 0.4 }, size: 0.18, rotation: 5 },
      { emoji: '🌿', position: { x: 0.3, y: 0.8 }, size: 0.12, rotation: 0 },
      { emoji: '🌿', position: { x: 0.6, y: 0.85 }, size: 0.1, rotation: 0 },
      { emoji: '🍃', position: { x: 0.9, y: 0.15 }, size: 0.08, rotation: 45 },
    ],
  },
  {
    id: 'ocean-squares',
    theme: 'ocean',
    name: 'Ocean Squares',
    description: 'Find the squares hiding under the sea!',
    backgroundColor: '#006994',
    gradientColors: ['#003d5c', '#006994'],
    difficulty: 1,
    targetShape: 'square',
    targetCount: 4,
    shapes: [
      {
        id: 'treasure-chest',
        type: 'square',
        path: null,
        normalizedPath: [],
        position: { x: 0.3, y: 0.7 },
        size: 0.1,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Treasure', emoji: '💎', description: 'shiny treasure' },
        difficulty: 1,
      },
      {
        id: 'fish-tank',
        type: 'square',
        path: null,
        normalizedPath: [],
        position: { x: 0.6, y: 0.4 },
        size: 0.08,
        rotation: 15,
        isFound: false,
        hiddenObject: { name: 'Fish', emoji: '🐠', description: 'a colorful fish' },
        difficulty: 1,
      },
      {
        id: 'window',
        type: 'square',
        path: null,
        normalizedPath: [],
        position: { x: 0.2, y: 0.25 },
        size: 0.06,
        rotation: -10,
        isFound: false,
        hiddenObject: { name: 'Octopus', emoji: '🐙', description: 'a friendly octopus' },
        difficulty: 1,
      },
      {
        id: 'present',
        type: 'square',
        path: null,
        normalizedPath: [],
        position: { x: 0.75, y: 0.6 },
        size: 0.09,
        rotation: 5,
        isFound: false,
        hiddenObject: { name: 'Shell', emoji: '🐚', description: 'a pretty shell' },
        difficulty: 1,
      },
    ],
    decorations: [
      { emoji: '🌊', position: { x: 0.1, y: 0.1 }, size: 0.2, rotation: 0 },
      { emoji: '🌊', position: { x: 0.5, y: 0.05 }, size: 0.18, rotation: 0 },
      { emoji: '🌊', position: { x: 0.9, y: 0.12 }, size: 0.2, rotation: 0 },
      { emoji: '🐋', position: { x: 0.8, y: 0.3 }, size: 0.15, rotation: 0 },
      { emoji: '🦀', position: { x: 0.15, y: 0.85 }, size: 0.1, rotation: 0 },
      { emoji: '🐡', position: { x: 0.45, y: 0.55 }, size: 0.08, rotation: 0 },
    ],
  },
  {
    id: 'space-triangles',
    theme: 'space',
    name: 'Space Triangles',
    description: 'Blast off! Find the triangles in space!',
    backgroundColor: '#0a0a2e',
    gradientColors: ['#000000', '#1a1a4a'],
    difficulty: 2,
    targetShape: 'triangle',
    targetCount: 4,
    shapes: [
      {
        id: 'rocket-top',
        type: 'triangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.5, y: 0.2 },
        size: 0.1,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Rocket', emoji: '🚀', description: 'a space rocket' },
        difficulty: 2,
      },
      {
        id: 'star-point',
        type: 'triangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.2, y: 0.4 },
        size: 0.06,
        rotation: 45,
        isFound: false,
        hiddenObject: { name: 'Star', emoji: '⭐', description: 'a bright star' },
        difficulty: 2,
      },
      {
        id: 'alien-ship',
        type: 'triangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.75, y: 0.5 },
        size: 0.08,
        rotation: 180,
        isFound: false,
        hiddenObject: { name: 'Alien', emoji: '👽', description: 'a space alien' },
        difficulty: 2,
      },
      {
        id: 'mountain',
        type: 'triangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.3, y: 0.75 },
        size: 0.12,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Planet', emoji: '🪐', description: 'a ringed planet' },
        difficulty: 2,
      },
    ],
    decorations: [
      { emoji: '🌟', position: { x: 0.1, y: 0.15 }, size: 0.05, rotation: 0 },
      { emoji: '✨', position: { x: 0.3, y: 0.1 }, size: 0.04, rotation: 0 },
      { emoji: '🌟', position: { x: 0.7, y: 0.2 }, size: 0.06, rotation: 0 },
      { emoji: '✨', position: { x: 0.9, y: 0.3 }, size: 0.05, rotation: 0 },
      { emoji: '🌟', position: { x: 0.85, y: 0.8 }, size: 0.04, rotation: 0 },
      { emoji: '🌙', position: { x: 0.15, y: 0.6 }, size: 0.12, rotation: -15 },
      { emoji: '🛸', position: { x: 0.6, y: 0.35 }, size: 0.1, rotation: 10 },
    ],
  },
  {
    id: 'farm-mixed',
    theme: 'farm',
    name: 'Farm Shapes',
    description: 'Find circles, squares, and triangles on the farm!',
    backgroundColor: '#87CEEB',
    gradientColors: ['#87CEEB', '#90EE90'],
    difficulty: 2,
    targetShape: 'mixed',
    targetCount: 6,
    shapes: [
      {
        id: 'barn-window',
        type: 'square',
        path: null,
        normalizedPath: [],
        position: { x: 0.25, y: 0.35 },
        size: 0.06,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Barn', emoji: '🏠', description: 'a red barn' },
        difficulty: 1,
      },
      {
        id: 'tractor-wheel',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.6, y: 0.6 },
        size: 0.08,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Tractor', emoji: '🚜', description: 'a big tractor' },
        difficulty: 1,
      },
      {
        id: 'chicken-beak',
        type: 'triangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.75, y: 0.4 },
        size: 0.04,
        rotation: 90,
        isFound: false,
        hiddenObject: { name: 'Chicken', emoji: '🐔', description: 'a clucking chicken' },
        difficulty: 2,
      },
      {
        id: 'hay-bale',
        type: 'rectangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.15, y: 0.7 },
        size: 0.1,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Hay', emoji: '🌾', description: 'golden hay' },
        difficulty: 1,
      },
      {
        id: 'pig-snout',
        type: 'circle',
        path: null,
        normalizedPath: [],
        position: { x: 0.45, y: 0.75 },
        size: 0.05,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Pig', emoji: '🐷', description: 'a pink pig' },
        difficulty: 1,
      },
      {
        id: 'roof-top',
        type: 'triangle',
        path: null,
        normalizedPath: [],
        position: { x: 0.85, y: 0.2 },
        size: 0.08,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'House', emoji: '🏡', description: 'a cozy farmhouse' },
        difficulty: 1,
      },
    ],
    decorations: [
      { emoji: '🌻', position: { x: 0.05, y: 0.8 }, size: 0.1, rotation: 0 },
      { emoji: '🌻', position: { x: 0.95, y: 0.75 }, size: 0.12, rotation: 0 },
      { emoji: '🌳', position: { x: 0.05, y: 0.3 }, size: 0.18, rotation: 0 },
      { emoji: '🐄', position: { x: 0.7, y: 0.75 }, size: 0.12, rotation: 0 },
      { emoji: '🐑', position: { x: 0.35, y: 0.55 }, size: 0.1, rotation: 0 },
      { emoji: '☁️', position: { x: 0.5, y: 0.08 }, size: 0.15, rotation: 0 },
    ],
  },
  {
    id: 'garden-stars',
    theme: 'garden',
    name: 'Star Garden',
    description: 'Find the stars hiding among the flowers!',
    backgroundColor: '#FFB6C1',
    gradientColors: ['#FFB6C1', '#98FB98'],
    difficulty: 3,
    targetShape: 'star',
    targetCount: 5,
    shapes: [
      {
        id: 'flower-star',
        type: 'star',
        path: null,
        normalizedPath: [],
        position: { x: 0.2, y: 0.4 },
        size: 0.08,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Flower', emoji: '🌸', description: 'a cherry blossom' },
        difficulty: 2,
      },
      {
        id: 'butterfly-star',
        type: 'star',
        path: null,
        normalizedPath: [],
        position: { x: 0.5, y: 0.25 },
        size: 0.06,
        rotation: 36,
        isFound: false,
        hiddenObject: { name: 'Butterfly', emoji: '🦋', description: 'a butterfly' },
        difficulty: 3,
      },
      {
        id: 'magic-star',
        type: 'star',
        path: null,
        normalizedPath: [],
        position: { x: 0.75, y: 0.45 },
        size: 0.1,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Fairy', emoji: '🧚', description: 'a garden fairy' },
        difficulty: 2,
      },
      {
        id: 'leaf-star',
        type: 'star',
        path: null,
        normalizedPath: [],
        position: { x: 0.35, y: 0.7 },
        size: 0.07,
        rotation: 72,
        isFound: false,
        hiddenObject: { name: 'Ladybug', emoji: '🐞', description: 'a ladybug' },
        difficulty: 3,
      },
      {
        id: 'sun-star',
        type: 'star',
        path: null,
        normalizedPath: [],
        position: { x: 0.7, y: 0.75 },
        size: 0.09,
        rotation: 0,
        isFound: false,
        hiddenObject: { name: 'Sunflower', emoji: '🌻', description: 'a sunflower' },
        difficulty: 2,
      },
    ],
    decorations: [
      { emoji: '🌷', position: { x: 0.1, y: 0.6 }, size: 0.12, rotation: -5 },
      { emoji: '🌹', position: { x: 0.9, y: 0.65 }, size: 0.11, rotation: 5 },
      { emoji: '🌺', position: { x: 0.5, y: 0.5 }, size: 0.1, rotation: 0 },
      { emoji: '🍄', position: { x: 0.25, y: 0.85 }, size: 0.08, rotation: 0 },
      { emoji: '🐝', position: { x: 0.6, y: 0.35 }, size: 0.06, rotation: 0 },
      { emoji: '🌈', position: { x: 0.15, y: 0.15 }, size: 0.15, rotation: 0 },
    ],
  },
];

// Initialize shape paths (call this before using scenes)
export function initializeScenePaths(scene: SafariScene, canvasWidth: number, canvasHeight: number): SafariScene {
  const initializedShapes = scene.shapes.map(shape => {
    const normalizedPath = createShapePath(shape.type, shape.position, shape.size, shape.rotation);
    
    // Create canvas path
    const path = new Path2D();
    if (normalizedPath.length > 0) {
      path.moveTo(normalizedPath[0].x * canvasWidth, normalizedPath[0].y * canvasHeight);
      for (let i = 1; i < normalizedPath.length; i++) {
        path.lineTo(normalizedPath[i].x * canvasWidth, normalizedPath[i].y * canvasHeight);
      }
      path.closePath();
    }
    
    return { ...shape, path, normalizedPath };
  });
  
  return { ...scene, shapes: initializedShapes };
}

// Get scenes by difficulty
export function getScenesByDifficulty(difficulty?: 1 | 2 | 3): SafariScene[] {
  if (!difficulty) return SAFARI_SCENES;
  return SAFARI_SCENES.filter(scene => scene.difficulty === difficulty);
}

// Get random scene
// DECISION-2026-03-08: Returns null on empty filter instead of undefined
// RATIONALE: Forces caller to handle "no scenes" case explicitly
export function getRandomScene(difficulty?: 1 | 2 | 3): SafariScene | null {
  const scenes = getScenesByDifficulty(difficulty);
  if (scenes.length === 0) return null;
  return scenes[Math.floor(Math.random() * scenes.length)];
}

// Initialize game state
export function initializeGame(scene: SafariScene, canvasWidth: number, canvasHeight: number): GameState {
  const initializedScene = initializeScenePaths(scene, canvasWidth, canvasHeight);
  
  return {
    currentScene: initializedScene,
    // foundShapes removed - use shapes[].isFound instead
    tracingState: {
      isTracing: false,
      currentPath: [],
      targetShape: null,
      progress: 0,
    },
    score: 0,
    startTime: Date.now(),
    hintsUsed: 0,
    completed: false,
  };
}

// Check if point is near a shape outline
export function findShapeAtPoint(
  point: Point,
  shapes: HiddenShape[],
  canvasWidth: number,
  canvasHeight: number,
  tolerance: number = 30
): HiddenShape | null {
  for (const shape of shapes) {
    if (shape.isFound) continue;
    
    // Check if point is near the shape outline
    const isNear = isPointNearPath(point, shape.normalizedPath, tolerance, canvasWidth, canvasHeight);
    if (isNear) {
      return shape;
    }
  }
  return null;
}

// Check if point is near a path
// DECISION-2026-03-08: Added NaN validation for Point inputs
// RATIONALE: CV/tracking can produce invalid coordinates; fail gracefully
function isPointNearPath(
  point: Point,
  path: Point[],
  tolerance: number,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  // NaN/Infinity validation
  // DECISION-2026-03-08: Using recordCVError for telemetry + console fallback
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    if (!Number.isFinite(point.x)) recordCVError('handX', point.x);
    if (!Number.isFinite(point.y)) recordCVError('handY', point.y);
    return false;
  }
  
  if (path.length < 2) return false;
  
  const px = point.x * canvasWidth;
  const py = point.y * canvasHeight;
  
  for (let i = 0; i < path.length - 1; i++) {
    const x1 = path[i].x * canvasWidth;
    const y1 = path[i].y * canvasHeight;
    const x2 = path[i + 1].x * canvasWidth;
    const y2 = path[i + 1].y * canvasHeight;
    
    const dist = distanceToSegment(px, py, x1, y1, x2, y2);
    if (dist < tolerance) {
      return true;
    }
  }
  return false;
}

// Distance from point to line segment
// Uses centralized geometry utility (see: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-001)
function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  return _distanceToSegment(px, py, x1, y1, x2, y2);
}

// Calculate tracing accuracy
export function calculateTracingAccuracy(
  tracedPath: Point[],
  targetPath: Point[],
  canvasWidth: number,
  canvasHeight: number
): number {
  if (tracedPath.length < 5 || targetPath.length < 2) return 0;
  
  let totalScore = 0;
  const sampleCount = Math.min(tracedPath.length, 20);
  
  for (let i = 0; i < sampleCount; i++) {
    const idx = Math.floor((i / sampleCount) * tracedPath.length);
    const point = tracedPath[idx];
    
    // Find closest point on target path
    let minDist = Infinity;
    for (const targetPoint of targetPath) {
      const dx = (point.x - targetPoint.x) * canvasWidth;
      const dy = (point.y - targetPoint.y) * canvasHeight;
      const dist = Math.sqrt(dx * dx + dy * dy);
      minDist = Math.min(minDist, dist);
    }
    
    // Score based on distance (closer = higher score)
    const score = Math.max(0, 1 - minDist / 50);
    totalScore += score;
  }
  
  return totalScore / sampleCount;
}

// Check if shape tracing is complete
export function checkShapeComplete(
  tracedPath: Point[],
  shape: HiddenShape,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  const accuracy = calculateTracingAccuracy(tracedPath, shape.normalizedPath, canvasWidth, canvasHeight);
  return accuracy > 0.6; // 60% accuracy threshold
}

// Get hint for unfound shape
export function getHint(gameState: GameState): { shape: HiddenShape; hint: string } | null {
  if (!gameState.currentScene) return null;
  
  const unfoundShapes = gameState.currentScene.shapes.filter(s => !s.isFound);
  if (unfoundShapes.length === 0) return null;
  
  // Pick a random unfound shape
  const shape = unfoundShapes[Math.floor(Math.random() * unfoundShapes.length)];
  
  const positionHints = [
    'Look on the left side!',
    'Check the right side!',
    'Look near the top!',
    'Check near the bottom!',
    'Look in the center!',
  ];
  
  const hint = positionHints[Math.floor(Math.random() * positionHints.length)];
  return { shape, hint };
}

// Check if all shapes found
export function checkAllShapesFound(gameState: GameState): boolean {
  if (!gameState.currentScene) return false;
  return gameState.currentScene.shapes.every(s => s.isFound);
}

// Mark a shape as found and update game state
// DECISION-2026-03-08: Centralized shape-finding logic
// RATIONALE: Ensures completed flag is set, score updated, state consistent
export function markShapeFound(
  gameState: GameState,
  shapeId: string,
  currentTime: number = Date.now()
): GameState {
  if (!gameState.currentScene) return gameState;

  const targetShape = gameState.currentScene.shapes.find(shape => shape.id === shapeId);
  if (!targetShape || targetShape.isFound) return gameState;
  
  // Find and mark the shape
  const updatedShapes = gameState.currentScene.shapes.map(shape =>
    shape.id === shapeId ? { ...shape, isFound: true } : shape
  );
  
  const updatedScene = { ...gameState.currentScene, shapes: updatedShapes };
  
  // Check if all shapes found
  const allFound = updatedShapes.every(s => s.isFound);
  
  // Calculate new score
  const newScore = calculateFinalScore(
    { ...gameState, currentScene: updatedScene },
    currentTime
  );
  
  return {
    ...gameState,
    currentScene: updatedScene,
    score: newScore,
    completed: allFound,
  };
}

// Get shape display name
export function getShapeDisplayName(type: ShapeType): string {
  const names: Record<ShapeType, string> = {
    circle: 'Circle',
    square: 'Square',
    triangle: 'Triangle',
    rectangle: 'Rectangle',
    star: 'Star',
    oval: 'Oval',
    diamond: 'Diamond',
    heart: 'Heart',
  };
  return names[type] ?? 'Shape';
}

// Get progress
export function getProgress(gameState: GameState): { found: number; total: number } {
  if (!gameState.currentScene) return { found: 0, total: 0 };
  const found = gameState.currentScene.shapes.filter(s => s.isFound).length;
  return { found, total: gameState.currentScene.shapes.length };
}

// DECISION-2026-03-08: Using found count from shapes instead of foundShapes Set
// RATIONALE: Single source of truth - shapes[].isFound is the canonical state
// MAGIC NUMBERS: Should extract to config (see CONFIG below)
const BASE_SCORE_PER_SHAPE = 100;
const TIME_BONUS_SECONDS = 300;
const HINT_PENALTY = 50;

// Calculate final score
export function calculateFinalScore(gameState: GameState, currentTime: number = Date.now()): number {
  const progress = getProgress(gameState);
  const baseScore = progress.found * BASE_SCORE_PER_SHAPE;
  const timeBonus = Math.max(0, TIME_BONUS_SECONDS - Math.floor((currentTime - gameState.startTime) / 1000));
  const hintPenalty = gameState.hintsUsed * HINT_PENALTY;
  return Math.max(0, baseScore + timeBonus - hintPenalty);
}
