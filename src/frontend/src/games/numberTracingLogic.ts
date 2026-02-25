export interface TracePoint {
  x: number;
  y: number;
}

export interface NumberTemplate {
  digit: number;
  name: string;
  guidePoints: TracePoint[];
}

export const NUMBER_TEMPLATES: NumberTemplate[] = [
  { digit: 0, name: 'Zero', guidePoints: [{ x: 0.5, y: 0.2 }, { x: 0.7, y: 0.35 }, { x: 0.7, y: 0.65 }, { x: 0.5, y: 0.8 }, { x: 0.3, y: 0.65 }, { x: 0.3, y: 0.35 }, { x: 0.5, y: 0.2 }] },
  { digit: 1, name: 'One', guidePoints: [{ x: 0.45, y: 0.35 }, { x: 0.55, y: 0.2 }, { x: 0.55, y: 0.8 }] },
  { digit: 2, name: 'Two', guidePoints: [{ x: 0.3, y: 0.3 }, { x: 0.5, y: 0.2 }, { x: 0.7, y: 0.3 }, { x: 0.7, y: 0.45 }, { x: 0.3, y: 0.8 }, { x: 0.7, y: 0.8 }] },
  { digit: 3, name: 'Three', guidePoints: [{ x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }, { x: 0.55, y: 0.5 }, { x: 0.7, y: 0.75 }, { x: 0.3, y: 0.75 }] },
  { digit: 4, name: 'Four', guidePoints: [{ x: 0.65, y: 0.2 }, { x: 0.35, y: 0.55 }, { x: 0.72, y: 0.55 }, { x: 0.72, y: 0.8 }] },
  { digit: 5, name: 'Five', guidePoints: [{ x: 0.7, y: 0.2 }, { x: 0.35, y: 0.2 }, { x: 0.35, y: 0.5 }, { x: 0.65, y: 0.5 }, { x: 0.7, y: 0.75 }, { x: 0.35, y: 0.75 }] },
  { digit: 6, name: 'Six', guidePoints: [{ x: 0.65, y: 0.25 }, { x: 0.45, y: 0.2 }, { x: 0.32, y: 0.45 }, { x: 0.42, y: 0.75 }, { x: 0.68, y: 0.75 }, { x: 0.7, y: 0.55 }, { x: 0.42, y: 0.55 }] },
  { digit: 7, name: 'Seven', guidePoints: [{ x: 0.3, y: 0.22 }, { x: 0.72, y: 0.22 }, { x: 0.45, y: 0.8 }] },
  { digit: 8, name: 'Eight', guidePoints: [{ x: 0.5, y: 0.2 }, { x: 0.67, y: 0.33 }, { x: 0.5, y: 0.5 }, { x: 0.33, y: 0.33 }, { x: 0.5, y: 0.2 }, { x: 0.67, y: 0.67 }, { x: 0.5, y: 0.8 }, { x: 0.33, y: 0.67 }, { x: 0.5, y: 0.5 }] },
  { digit: 9, name: 'Nine', guidePoints: [{ x: 0.68, y: 0.45 }, { x: 0.58, y: 0.2 }, { x: 0.36, y: 0.25 }, { x: 0.3, y: 0.45 }, { x: 0.45, y: 0.58 }, { x: 0.65, y: 0.45 }, { x: 0.58, y: 0.8 }] },
];

function distance(a: TracePoint, b: TracePoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getTemplateForDigit(digit: number): NumberTemplate | undefined {
  return NUMBER_TEMPLATES.find((template) => template.digit === digit);
}

export function calculateTraceCoverage(
  strokePoints: TracePoint[],
  templatePoints: TracePoint[],
  tolerance = 0.12,
): number {
  if (strokePoints.length === 0 || templatePoints.length === 0) return 0;

  let covered = 0;
  for (const guidePoint of templatePoints) {
    const near = strokePoints.some((point) => distance(point, guidePoint) <= tolerance);
    if (near) covered += 1;
  }
  return Math.round((covered / templatePoints.length) * 100);
}

export function buildScore(accuracy: number, hintsUsed: number): number {
  const base = Math.max(0, accuracy);
  const penalty = Math.min(hintsUsed * 5, 25);
  return Math.max(0, base - penalty);
}

export function nextDigit(currentDigit: number): number {
  if (currentDigit >= 9) return 0;
  if (currentDigit < 0) return 0;
  return currentDigit + 1;
}
