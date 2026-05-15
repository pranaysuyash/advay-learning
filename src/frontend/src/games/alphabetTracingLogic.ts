/**
 * Alphabet Tracing Game Logic
 * 
 * Core logic for letter tracing with path validation, scoring,
 * and progress tracking.
 */

export interface LetterPath {
  id: string;
  char: string;
  name: string;
  emoji: string;
  color: string;
  // Normalized path points (0-1 range)
  pathPoints: Array<{ x: number; y: number }>;
  // Strokes for multi-stroke letters
  strokes?: Array<Array<{ x: number; y: number }>>;
}

export interface TracePoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface TraceSession {
  letterId: string;
  points: TracePoint[];
  startTime: number;
  endTime?: number;
}

export interface TracingResult {
  accuracy: number;
  stars: 0 | 1 | 2 | 3;
  passed: boolean;
  coverage: number; // Percentage of path covered
  deviation: number; // Average deviation from path
}

export interface GameProgress {
  completedLetters: string[];
  currentLetterIndex: number;
  totalScore: number;
  streak: number;
}

// Alphabet with emoji associations for kid-friendly learning
export const ALPHABET_LETTERS: LetterPath[] = [
  { id: 'A', char: 'A', name: 'Apple', emoji: '🍎', color: '#EF4444', pathPoints: [] },
  { id: 'B', char: 'B', name: 'Ball', emoji: '🏀', color: '#F97316', pathPoints: [] },
  { id: 'C', char: 'C', name: 'Cat', emoji: '🐱', color: '#F59E0B', pathPoints: [] },
  { id: 'D', char: 'D', name: 'Dog', emoji: '🐕', color: '#EAB308', pathPoints: [] },
  { id: 'E', char: 'E', name: 'Elephant', emoji: '🐘', color: '#84CC16', pathPoints: [] },
  { id: 'F', char: 'F', name: 'Fish', emoji: '🐟', color: '#22C55E', pathPoints: [] },
  { id: 'G', char: 'G', name: 'Giraffe', emoji: '🦒', color: '#10B981', pathPoints: [] },
  { id: 'H', char: 'H', name: 'Hat', emoji: '🎩', color: '#14B8A6', pathPoints: [] },
  { id: 'I', char: 'I', name: 'Igloo', emoji: '🧊', color: '#06B6D4', pathPoints: [] },
  { id: 'J', char: 'J', name: 'Jam', emoji: '🍓', color: '#0EA5E9', pathPoints: [] },
  { id: 'K', char: 'K', name: 'Kite', emoji: '🪁', color: '#3B82F6', pathPoints: [] },
  { id: 'L', char: 'L', name: 'Lion', emoji: '🦁', color: '#6366F1', pathPoints: [] },
  { id: 'M', char: 'M', name: 'Moon', emoji: '🌙', color: '#8B5CF6', pathPoints: [] },
  { id: 'N', char: 'N', name: 'Nest', emoji: '🪺', color: '#A855F7', pathPoints: [] },
  { id: 'O', char: 'O', name: 'Orange', emoji: '🍊', color: '#D946EF', pathPoints: [] },
  { id: 'P', char: 'P', name: 'Pig', emoji: '🐷', color: '#EC4899', pathPoints: [] },
  { id: 'Q', char: 'Q', name: 'Queen', emoji: '👑', color: '#F43F5E', pathPoints: [] },
  { id: 'R', char: 'R', name: 'Rocket', emoji: '🚀', color: '#FB7185', pathPoints: [] },
  { id: 'S', char: 'S', name: 'Sun', emoji: '☀️', color: '#FBBF24', pathPoints: [] },
  { id: 'T', char: 'T', name: 'Tree', emoji: '🌳', color: '#4ADE80', pathPoints: [] },
  { id: 'U', char: 'U', name: 'Umbrella', emoji: '☂️', color: '#2DD4BF', pathPoints: [] },
  { id: 'V', char: 'V', name: 'Violin', emoji: '🎻', color: '#38BDF8', pathPoints: [] },
  { id: 'W', char: 'W', name: 'Whale', emoji: '🐋', color: '#60A5FA', pathPoints: [] },
  { id: 'X', char: 'X', name: 'Xylophone', emoji: '🎹', color: '#818CF8', pathPoints: [] },
  { id: 'Y', char: 'Y', name: 'Yo-yo', emoji: '🪀', color: '#A78BFA', pathPoints: [] },
  { id: 'Z', char: 'Z', name: 'Zebra', emoji: '🦓', color: '#C084FC', pathPoints: [] },
];

// Generate approximate path points for each letter (simplified representation)
// In a real implementation, these would be more precise SVG paths
export function generateLetterPath(letter: string): Array<{ x: number; y: number }> {
  // Simplified path generation based on letter shapes
  const paths: Record<string, Array<{ x: number; y: number }>> = {
    'A': [{x: 0.3, y: 0.8}, {x: 0.5, y: 0.2}, {x: 0.7, y: 0.8}, {x: 0.4, y: 0.5}, {x: 0.6, y: 0.5}],
    'B': [{x: 0.3, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.7, y: 0.35}, {x: 0.3, y: 0.5}, {x: 0.7, y: 0.65}, {x: 0.3, y: 0.8}],
    'C': [{x: 0.7, y: 0.3}, {x: 0.4, y: 0.2}, {x: 0.2, y: 0.5}, {x: 0.4, y: 0.8}, {x: 0.7, y: 0.7}],
    'D': [{x: 0.3, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.7, y: 0.65}, {x: 0.7, y: 0.35}, {x: 0.3, y: 0.2}],
    'E': [{x: 0.7, y: 0.2}, {x: 0.3, y: 0.2}, {x: 0.3, y: 0.5}, {x: 0.6, y: 0.5}, {x: 0.3, y: 0.5}, {x: 0.3, y: 0.8}, {x: 0.7, y: 0.8}],
    'F': [{x: 0.7, y: 0.2}, {x: 0.3, y: 0.2}, {x: 0.3, y: 0.5}, {x: 0.6, y: 0.5}, {x: 0.3, y: 0.5}, {x: 0.3, y: 0.8}],
    'G': [{x: 0.7, y: 0.3}, {x: 0.4, y: 0.2}, {x: 0.2, y: 0.5}, {x: 0.4, y: 0.8}, {x: 0.7, y: 0.7}, {x: 0.7, y: 0.5}, {x: 0.5, y: 0.5}],
    'H': [{x: 0.3, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.3, y: 0.5}, {x: 0.7, y: 0.5}, {x: 0.7, y: 0.2}, {x: 0.7, y: 0.8}],
    'I': [{x: 0.3, y: 0.2}, {x: 0.7, y: 0.2}, {x: 0.5, y: 0.2}, {x: 0.5, y: 0.8}, {x: 0.3, y: 0.8}, {x: 0.7, y: 0.8}],
    'J': [{x: 0.7, y: 0.2}, {x: 0.7, y: 0.7}, {x: 0.5, y: 0.8}, {x: 0.3, y: 0.7}],
    'K': [{x: 0.3, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.3, y: 0.5}, {x: 0.7, y: 0.2}, {x: 0.3, y: 0.5}, {x: 0.7, y: 0.8}],
    'L': [{x: 0.3, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.7, y: 0.8}],
    'M': [{x: 0.2, y: 0.8}, {x: 0.2, y: 0.2}, {x: 0.5, y: 0.5}, {x: 0.8, y: 0.2}, {x: 0.8, y: 0.8}],
    'N': [{x: 0.2, y: 0.8}, {x: 0.2, y: 0.2}, {x: 0.8, y: 0.8}, {x: 0.8, y: 0.2}],
    'O': [{x: 0.5, y: 0.2}, {x: 0.7, y: 0.35}, {x: 0.7, y: 0.65}, {x: 0.5, y: 0.8}, {x: 0.3, y: 0.65}, {x: 0.3, y: 0.35}, {x: 0.5, y: 0.2}],
    'P': [{x: 0.3, y: 0.8}, {x: 0.3, y: 0.2}, {x: 0.7, y: 0.35}, {x: 0.3, y: 0.5}],
    'Q': [{x: 0.5, y: 0.2}, {x: 0.7, y: 0.35}, {x: 0.7, y: 0.65}, {x: 0.5, y: 0.8}, {x: 0.3, y: 0.65}, {x: 0.3, y: 0.35}, {x: 0.5, y: 0.2}, {x: 0.6, y: 0.7}, {x: 0.7, y: 0.8}],
    'R': [{x: 0.3, y: 0.8}, {x: 0.3, y: 0.2}, {x: 0.7, y: 0.35}, {x: 0.3, y: 0.5}, {x: 0.7, y: 0.8}],
    'S': [{x: 0.7, y: 0.25}, {x: 0.4, y: 0.2}, {x: 0.3, y: 0.4}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.6}, {x: 0.6, y: 0.8}, {x: 0.3, y: 0.75}],
    'T': [{x: 0.5, y: 0.2}, {x: 0.5, y: 0.8}, {x: 0.3, y: 0.2}, {x: 0.7, y: 0.2}],
    'U': [{x: 0.3, y: 0.2}, {x: 0.3, y: 0.6}, {x: 0.5, y: 0.8}, {x: 0.7, y: 0.6}, {x: 0.7, y: 0.2}],
    'V': [{x: 0.3, y: 0.2}, {x: 0.5, y: 0.8}, {x: 0.7, y: 0.2}],
    'W': [{x: 0.2, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.8}, {x: 0.8, y: 0.2}],
    'X': [{x: 0.3, y: 0.2}, {x: 0.7, y: 0.8}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.2}, {x: 0.3, y: 0.8}],
    'Y': [{x: 0.3, y: 0.2}, {x: 0.5, y: 0.5}, {x: 0.7, y: 0.2}, {x: 0.5, y: 0.5}, {x: 0.5, y: 0.8}],
    'Z': [{x: 0.3, y: 0.2}, {x: 0.7, y: 0.2}, {x: 0.3, y: 0.8}, {x: 0.7, y: 0.8}],
  };
  
  return paths[letter.toUpperCase()] || [{x: 0.3, y: 0.5}, {x: 0.7, y: 0.5}];
}

// Initialize path points for all letters
ALPHABET_LETTERS.forEach(letter => {
  letter.pathPoints = generateLetterPath(letter.char);
});

/**
 * Calculate distance from point to line segment
 */
export function distanceToLineSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number;
  let yy: number;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate minimum distance from point to any segment of the letter path
 */
export function distanceToLetterPath(
  point: { x: number; y: number },
  pathPoints: Array<{ x: number; y: number }>
): number {
  if (pathPoints.length < 2) return Infinity;

  let minDistance = Infinity;

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const dist = distanceToLineSegment(
      point.x,
      point.y,
      pathPoints[i].x,
      pathPoints[i].y,
      pathPoints[i + 1].x,
      pathPoints[i + 1].y
    );
    minDistance = Math.min(minDistance, dist);
  }

  return minDistance;
}

/**
 * Calculate what percentage of the letter path was covered by the trace
 */
export function calculatePathCoverage(
  tracePoints: Array<{ x: number; y: number }>,
  pathPoints: Array<{ x: number; y: number }>,
  threshold: number = 0.1
): number {
  if (pathPoints.length < 2 || tracePoints.length < 2) return 0;

  let coveredSegments = 0;
  const totalSegments = pathPoints.length - 1;

  for (let i = 0; i < totalSegments; i++) {
    const startPoint = pathPoints[i];
    const endPoint = pathPoints[i + 1];
    // Midpoint calculation for potential future use
    void {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    };

    // Check if any trace point is near this segment
    const isCovered = tracePoints.some(
      tracePoint =>
        distanceToLineSegment(
          tracePoint.x,
          tracePoint.y,
          startPoint.x,
          startPoint.y,
          endPoint.x,
          endPoint.y
        ) <= threshold
    );

    if (isCovered) {
      coveredSegments++;
    }
  }

  return coveredSegments / totalSegments;
}

/**
 * Calculate tracing accuracy based on deviation from ideal path
 */
export function calculateTracingAccuracy(
  tracePoints: Array<{ x: number; y: number }>,
  pathPoints: Array<{ x: number; y: number }>
): number {
  if (tracePoints.length === 0 || pathPoints.length < 2) return 0;

  let totalDeviation = 0;
  let validPoints = 0;

  for (const tracePoint of tracePoints) {
    const deviation = distanceToLetterPath(tracePoint, pathPoints);
    // Convert deviation to score (closer = higher score)
    // Max deviation of 0.2 (20% of canvas) = 0 score
    const score = Math.max(0, 1 - deviation / 0.2);
    totalDeviation += score;
    validPoints++;
  }

  return validPoints > 0 ? totalDeviation / validPoints : 0;
}

/**
 * Evaluate a completed tracing session
 */
export function evaluateTracing(
  tracePoints: Array<{ x: number; y: number }>,
  letter: LetterPath,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): TracingResult {
  // Normalize trace points to 0-1 range (assuming canvas coordinates)
  const normalizedTrace = tracePoints.map(p => ({
    x: Math.max(0, Math.min(1, p.x)),
    y: Math.max(0, Math.min(1, p.y)),
  }));

  const coverage = calculatePathCoverage(normalizedTrace, letter.pathPoints);
  const accuracy = calculateTracingAccuracy(normalizedTrace, letter.pathPoints);

  // Difficulty thresholds
  const thresholds = {
    easy: { coverage: 0.4, accuracy: 0.4 },
    medium: { coverage: 0.6, accuracy: 0.5 },
    hard: { coverage: 0.8, accuracy: 0.7 },
  };

  const threshold = thresholds[difficulty];
  const passed = coverage >= threshold.coverage && accuracy >= threshold.accuracy;

  // Calculate stars (0-3)
  let stars: 0 | 1 | 2 | 3 = 0;
  if (passed) {
    const score = (coverage + accuracy) / 2;
    if (score >= 0.9) stars = 3;
    else if (score >= 0.7) stars = 2;
    else stars = 1;
  }

  return {
    accuracy: Math.round(accuracy * 100) / 100,
    stars,
    passed,
    coverage: Math.round(coverage * 100) / 100,
    deviation: Math.round((1 - accuracy) * 100) / 100,
  };
}

/**
 * Calculate score based on accuracy and speed
 */
export function calculateTracingScore(
  accuracy: number,
  durationMs: number,
  streak: number
): number {
  const baseScore = Math.round(accuracy * 100);
  const timeBonus = Math.max(0, Math.round((10000 - durationMs) / 100));
  const streakBonus = Math.min(streak * 5, 25);
  
  return baseScore + timeBonus + streakBonus;
}

/**
 * Get the next letter in sequence
 */
export function getNextLetter(
  currentIndex: number,
  letters: LetterPath[] = ALPHABET_LETTERS
): { letter: LetterPath; index: number } | null {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= letters.length) return null;
  return { letter: letters[nextIndex], index: nextIndex };
}

/**
 * Get letters for a specific difficulty level
 */
export function getLettersForLevel(
  level: number,
  letters: LetterPath[] = ALPHABET_LETTERS
): LetterPath[] {
  const lettersPerLevel = Math.ceil(letters.length / 3);
  const startIndex = (level - 1) * lettersPerLevel;
  const endIndex = Math.min(startIndex + lettersPerLevel, letters.length);
  return letters.slice(startIndex, endIndex);
}

/**
 * Check if tracing point is within valid drawing area
 */
export function isValidTracePoint(
  point: { x: number; y: number },
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 20
): boolean {
  return (
    point.x >= padding &&
    point.x <= canvasWidth - padding &&
    point.y >= padding &&
    point.y <= canvasHeight - padding
  );
}

/**
 * Smooth trace points using moving average
 */
export function smoothTracePoints(
  points: Array<{ x: number; y: number }>,
  windowSize: number = 3
): Array<{ x: number; y: number }> {
  if (points.length < windowSize) return points;

  const smoothed: Array<{ x: number; y: number }> = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < points.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let j = -halfWindow; j <= halfWindow; j++) {
      const index = i + j;
      if (index >= 0 && index < points.length) {
        sumX += points[index].x;
        sumY += points[index].y;
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
 * Get default game progress
 */
export function getDefaultProgress(): GameProgress {
  return {
    completedLetters: [],
    currentLetterIndex: 0,
    totalScore: 0,
    streak: 0,
  };
}

/**
 * Update progress after completing a letter
 */
export function updateProgress(
  progress: GameProgress,
  letterId: string,
  score: number,
  passed: boolean
): GameProgress {
  const newCompletedLetters = passed && !progress.completedLetters.includes(letterId)
    ? [...progress.completedLetters, letterId]
    : progress.completedLetters;

  return {
    completedLetters: newCompletedLetters,
    currentLetterIndex: progress.currentLetterIndex + 1,
    totalScore: progress.totalScore + score,
    streak: passed ? progress.streak + 1 : 0,
  };
}

/**
 * Get stars based on accuracy percentage
 */
export function getStarsFromAccuracy(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}
