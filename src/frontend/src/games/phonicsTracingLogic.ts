/**
 * Phonics Tracing game logic — real-time audio feedback as kids trace letters.
 *
 * As the child traces a letter, Pip sounds it out IN REAL-TIME:
 * - Continuous: S, F, M, N, R, L, Z (sound plays while tracing)
 * - Burst: B, D, P, T, K, G (single burst at stroke start)
 * - Vowel: A, E, I, O, U (held note while tracing)
 *
 * @see docs/GAME_IDEAS_CATALOG.md - Phonics Tracing (Sound It Out!) - P1
 */

export type SoundType = 'continuous' | 'burst' | 'vowel';

export interface LetterData {
  letter: string;
  uppercase: string;
  lowercase: string;
  soundType: SoundType;
  ttsIntro: string;
  ttsExample: string;
  exampleWord: string;
  exampleEmoji: string;
}

export interface TracingState {
  letter: string;
  strokePoints: TracePoint[];
  isComplete: boolean;
  accuracy: number;
}

export interface TracePoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface TracingLevelConfig {
  level: number;
  letters: string[];
  timePerLetter: number;
  passThreshold: number;
}

// ---------------------------------------------------------------------------
// Letter data with sound types
// ---------------------------------------------------------------------------

export const LETTER_DATA: LetterData[] = [
  { letter: 'A', uppercase: 'A', lowercase: 'a', soundType: 'vowel', ttsIntro: 'A is for', ttsExample: 'Ahhh like in Apple', exampleWord: 'Apple', exampleEmoji: '🍎' },
  { letter: 'B', uppercase: 'B', lowercase: 'b', soundType: 'burst', ttsIntro: 'B is for', ttsExample: 'Buh like in Ball', exampleWord: 'Ball', exampleEmoji: '🏐' },
  { letter: 'C', uppercase: 'C', lowercase: 'c', soundType: 'burst', ttsIntro: 'C is for', ttsExample: 'Kuh like in Cat', exampleWord: 'Cat', exampleEmoji: '🐱' },
  { letter: 'D', uppercase: 'D', lowercase: 'd', soundType: 'burst', ttsIntro: 'D is for', ttsExample: 'Duh like in Dog', exampleWord: 'Dog', exampleEmoji: '🐕' },
  { letter: 'E', uppercase: 'E', lowercase: 'e', soundType: 'vowel', ttsIntro: 'E is for', ttsExample: 'Ehhh like in Egg', exampleWord: 'Egg', exampleEmoji: '🥚' },
  { letter: 'F', uppercase: 'F', lowercase: 'f', soundType: 'continuous', ttsIntro: 'F is for', ttsExample: 'Fuh like in Fish', exampleWord: 'Fish', exampleEmoji: '🐟' },
  { letter: 'G', uppercase: 'G', lowercase: 'g', soundType: 'burst', ttsIntro: 'G is for', ttsExample: 'Guh like in Goat', exampleWord: 'Goat', exampleEmoji: '🐐' },
  { letter: 'H', uppercase: 'H', lowercase: 'h', soundType: 'burst', ttsIntro: 'H is for', ttsExample: 'Huh like in Hat', exampleWord: 'Hat', exampleEmoji: '🎩' },
  { letter: 'I', uppercase: 'I', lowercase: 'i', soundType: 'vowel', ttsIntro: 'I is for', ttsExample: 'Ihh like in Igloo', exampleWord: 'Igloo', exampleEmoji: '🏠' },
  { letter: 'J', uppercase: 'J', lowercase: 'j', soundType: 'burst', ttsIntro: 'J is for', ttsExample: 'Juh like in Jam', exampleWord: 'Jam', exampleEmoji: '🫙' },
  { letter: 'K', uppercase: 'K', lowercase: 'k', soundType: 'burst', ttsIntro: 'K is for', ttsExample: 'Kuh like in Kite', exampleWord: 'Kite', exampleEmoji: '🪁' },
  { letter: 'L', uppercase: 'L', lowercase: 'l', soundType: 'continuous', ttsIntro: 'L is for', ttsExample: 'Luh like in Lion', exampleWord: 'Lion', exampleEmoji: '🦁' },
  { letter: 'M', uppercase: 'M', lowercase: 'm', soundType: 'continuous', ttsIntro: 'M is for', ttsExample: 'Muh like in Moon', exampleWord: 'Moon', exampleEmoji: '🌙' },
  { letter: 'N', uppercase: 'N', lowercase: 'n', soundType: 'continuous', ttsIntro: 'N is for', ttsExample: 'Nuh like in Nest', exampleWord: 'Nest', exampleEmoji: '🪺' },
  { letter: 'O', uppercase: 'O', lowercase: 'o', soundType: 'vowel', ttsIntro: 'O is for', ttsExample: 'Ohhh like in Octopus', exampleWord: 'Octopus', exampleEmoji: '🐙' },
  { letter: 'P', uppercase: 'P', lowercase: 'p', soundType: 'burst', ttsIntro: 'P is for', ttsExample: 'Puh like in Pig', exampleWord: 'Pig', exampleEmoji: '🐷' },
  { letter: 'Q', uppercase: 'Q', lowercase: 'q', soundType: 'burst', ttsIntro: 'Q is for', ttsExample: 'Kuh like in Queen', exampleWord: 'Queen', exampleEmoji: '👑' },
  { letter: 'R', uppercase: 'R', lowercase: 'r', soundType: 'continuous', ttsIntro: 'R is for', ttsExample: 'Ruh like in Rain', exampleWord: 'Rain', exampleEmoji: '🌧️' },
  { letter: 'S', uppercase: 'S', lowercase: 's', soundType: 'continuous', ttsIntro: 'S is for', ttsExample: 'Ssss like in Sun', exampleWord: 'Sun', exampleEmoji: '☀️' },
  { letter: 'T', uppercase: 'T', lowercase: 't', soundType: 'burst', ttsIntro: 'T is for', ttsExample: 'Tuh like in Tree', exampleWord: 'Tree', exampleEmoji: '🌳' },
  { letter: 'U', uppercase: 'U', lowercase: 'u', soundType: 'vowel', ttsIntro: 'U is for', ttsExample: 'Uhh like in Umbrella', exampleWord: 'Umbrella', exampleEmoji: '☂️' },
  { letter: 'V', uppercase: 'V', lowercase: 'v', soundType: 'burst', ttsIntro: 'V is for', ttsExample: 'Vuh like in Van', exampleWord: 'Van', exampleEmoji: '🚐' },
  { letter: 'W', uppercase: 'W', lowercase: 'w', soundType: 'continuous', ttsIntro: 'W is for', ttsExample: 'Wuh like in Water', exampleWord: 'Water', exampleEmoji: '💧' },
  { letter: 'X', uppercase: 'X', lowercase: 'x', soundType: 'burst', ttsIntro: 'X is for', ttsExample: 'Ks like in Box', exampleWord: 'Box', exampleEmoji: '📦' },
  { letter: 'Y', uppercase: 'Y', lowercase: 'y', soundType: 'vowel', ttsIntro: 'Y is for', ttsExample: 'Yuh like in Yellow', exampleWord: 'Yellow', exampleEmoji: '🟡' },
  { letter: 'Z', uppercase: 'Z', lowercase: 'z', soundType: 'continuous', ttsIntro: 'Z is for', ttsExample: 'Zzz like in Zoo', exampleWord: 'Zoo', exampleEmoji: '🦓' },
];

// ---------------------------------------------------------------------------
// Level configurations
// ---------------------------------------------------------------------------

export const LEVELS: TracingLevelConfig[] = [
  { level: 1, letters: ['A', 'B', 'C', 'M', 'S', 'T'], timePerLetter: 30, passThreshold: 60 },
  { level: 2, letters: ['D', 'F', 'G', 'H', 'K', 'L', 'N', 'P', 'R'], timePerLetter: 25, passThreshold: 65 },
  { level: 3, letters: ['E', 'I', 'O', 'U', 'V', 'W', 'Y', 'Z'], timePerLetter: 20, passThreshold: 70 },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getLetterData(letter: string): LetterData | undefined {
  return LETTER_DATA.find((l) => l.letter === letter.toUpperCase());
}

export function getLettersForLevel(level: number): string[] {
  const config = LEVELS.find((l) => l.level === level);
  return config?.letters ?? LEVELS[0].letters;
}

export function getLevelConfig(level: number): TracingLevelConfig {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

/**
 * Calculate how well the traced points follow the letter template.
 * Uses simplified path matching based on coverage and smoothness.
 */
export function calculateTraceAccuracy(
  tracePoints: TracePoint[],
  letter: string,
): number {
  if (tracePoints.length < 10) return 0;

  const letterData = getLetterData(letter);
  if (!letterData) return 0;

  // Calculate coverage: what percentage of the letter area was traced
  const bounds = getTraceBounds(tracePoints);
  const tracedArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  const coverageScore = Math.min(100, tracedArea * 200 + (tracePoints.length / 50) * 50);

  // Calculate smoothness: how smooth are the strokes (variance in angles)
  const smoothnessScore = calculateSmoothnessScore(tracePoints);

  // Letter-specific bonus: certain letters need more points
  const complexityBonus = letterData.letter.length > 1 ? 10 : 0;

  // Weighted combination
  const accuracy = Math.min(
    100,
    coverageScore * 0.5 + smoothnessScore * 0.4 + complexityBonus,
  );

  return Math.round(accuracy);
}

function getTraceBounds(points: TracePoint[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, maxX, minY, maxY };
}

function calculateSmoothnessScore(points: TracePoint[]): number {
  if (points.length < 3) return 0;

  let totalAngleChange = 0;
  let pointCount = 0;

  for (let i = 2; i < points.length; i++) {
    const v1 = { x: points[i - 1].x - points[i - 2].x, y: points[i - 1].y - points[i - 2].y };
    const v2 = { x: points[i].x - points[i - 1].x, y: points[i].y - points[i - 1].y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 > 0 && mag2 > 0) {
      const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      const angle = Math.acos(cosAngle);
      totalAngleChange += angle;
      pointCount++;
    }
  }

  if (pointCount === 0) return 50;

  const avgAngleChange = totalAngleChange / pointCount;
  // Lower angle variance = smoother = higher score
  const smoothness = Math.max(0, 100 - avgAngleChange * 50);
  return smoothness;
}

/**
 * Check if tracing is complete based on point count and coverage.
 */
export function isTracingComplete(tracePoints: TracePoint[], minPoints: number = 30): boolean {
  if (tracePoints.length < minPoints) return false;

  const bounds = getTraceBounds(tracePoints);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  // Must have traced a reasonable area
  return width > 0.15 && height > 0.15;
}

/**
 * Get the next letter in sequence for practice.
 */
export function getNextLetter(currentLetter: string, level: number): string {
  const letters = getLettersForLevel(level);
  const currentIndex = letters.indexOf(currentLetter.toUpperCase());

  if (currentIndex === -1 || currentIndex === letters.length - 1) {
    return letters[0];
  }
  return letters[currentIndex + 1];
}

/**
 * Calculate score based on accuracy and time.
 */
export function calculateScore(accuracy: number, timeUsed: number, timeLimit: number): number {
  const baseScore = accuracy;
  const timeBonus = Math.max(0, Math.round(((timeLimit - timeUsed) / timeLimit) * 20));
  return Math.min(100, baseScore + timeBonus);
}

/**
 * Generate guide points for a letter (simplified template).
 * Returns normalized coordinates (0-1) for the letter outline.
 */
export function getLetterGuidePoints(letter: string): { x: number; y: number }[] {
  // Simplified guide templates - in production these would be more detailed
  const templates: Record<string, { x: number; y: number }[]> = {
    'A': [{ x: 0.5, y: 0.1 }, { x: 0.2, y: 0.9 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.9 }, { x: 0.5, y: 0.1 }],
    'S': [{ x: 0.8, y: 0.2 }, { x: 0.2, y: 0.2 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.8 }, { x: 0.2, y: 0.8 }],
    'B': [{ x: 0.2, y: 0.1 }, { x: 0.2, y: 0.9 }, { x: 0.6, y: 0.2 }, { x: 0.8, y: 0.35 }, { x: 0.6, y: 0.5 }, { x: 0.8, y: 0.65 }, { x: 0.6, y: 0.8 }, { x: 0.2, y: 0.9 }],
    'O': [{ x: 0.5, y: 0.1 }, { x: 0.1, y: 0.5 }, { x: 0.5, y: 0.9 }, { x: 0.9, y: 0.5 }, { x: 0.5, y: 0.1 }],
  };

  const upper = letter.toUpperCase();
  return templates[upper] ?? [
    { x: 0.3, y: 0.2 },
    { x: 0.3, y: 0.8 },
    { x: 0.7, y: 0.2 },
    { x: 0.7, y: 0.8 },
  ];
}
