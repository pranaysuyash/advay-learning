/**
 * Cutting Practice Game Logic
 *
 * Fine motor skills game where children trace along dotted lines to "cut"
 * through various materials (paper, fabric, food).
 */

export interface Point {
  x: number;
  y: number;
}

export interface CutLine {
  id: number;
  points: Point[];
  completed: boolean;
  progress: number; // 0-100
  cutQuality: number; // Average distance from line
}

export interface CutLevel {
  level: number;
  name: string;
  material: 'paper' | 'fabric' | 'food';
  tolerance: number;
  lines: CutLine[];
}

export interface CutSession {
  lines: CutLine[];
  currentLineId: number | null;
  totalCuts: number;
  perfectCuts: number;
  score: number;
}

// Level configurations
export const LEVELS: Omit<CutLevel, 'lines'>[] = [
  {
    level: 1,
    name: 'Paper',
    material: 'paper',
    tolerance: 40,
  },
  {
    level: 2,
    name: 'Fabric',
    material: 'fabric',
    tolerance: 30,
  },
  {
    level: 3,
    name: 'Food',
    material: 'food',
    tolerance: 20,
  },
];

// Generate straight line (for paper)
function generateStraightLine(id: number, canvasWidth: number, canvasHeight: number): CutLine {
  const margin = 80;
  const y = margin + Math.random() * (canvasHeight - 2 * margin);
  const isHorizontal = Math.random() > 0.3;
  
  if (isHorizontal) {
    return {
      id,
      points: [
        { x: margin, y },
        { x: canvasWidth - margin, y },
      ],
      completed: false,
      progress: 0,
      cutQuality: 0,
    };
  } else {
    const x = margin + Math.random() * (canvasWidth - 2 * margin);
    return {
      id,
      points: [
        { x, y: margin },
        { x, y: canvasHeight - margin },
      ],
      completed: false,
      progress: 0,
      cutQuality: 0,
    };
  }
}

// Generate curved line (for fabric)
function generateCurvedLine(id: number, canvasWidth: number, canvasHeight: number): CutLine {
  const margin = 80;
  const points: Point[] = [];
  const numPoints = 4 + Math.floor(Math.random() * 3); // 4-6 points
  
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    points.push({
      x: margin + t * (canvasWidth - 2 * margin) + (Math.random() - 0.5) * 60,
      y: margin + Math.random() * (canvasHeight - 2 * margin),
    });
  }
  
  return {
    id,
    points,
    completed: false,
    progress: 0,
    cutQuality: 0,
  };
}

// Generate complex shape line (for food)
function generateComplexLine(id: number, canvasWidth: number, canvasHeight: number): CutLine {
  const margin = 80;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) / 3;
  
  const shapeType = Math.floor(Math.random() * 3);
  const points: Point[] = [];
  
  if (shapeType === 0) {
    // Pizza slice (triangle with curved base)
    const angle = Math.random() * Math.PI * 2;
    points.push({ x: centerX, y: centerY });
    points.push({
      x: centerX + Math.cos(angle - 0.5) * radius,
      y: centerY + Math.sin(angle - 0.5) * radius,
    });
    // Curved base
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const a = angle - 0.5 + t;
      points.push({
        x: centerX + Math.cos(a) * radius,
        y: centerY + Math.sin(a) * radius,
      });
    }
    points.push({
      x: centerX + Math.cos(angle + 0.5) * radius,
      y: centerY + Math.sin(angle + 0.5) * radius,
    });
  } else if (shapeType === 1) {
    // Zigzag
    const numZigs = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i <= numZigs; i++) {
      points.push({
        x: margin + (i / numZigs) * (canvasWidth - 2 * margin),
        y: centerY + (i % 2 === 0 ? -1 : 1) * radius * 0.5,
      });
    }
  } else {
    // Wavy line
    const numWaves = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i <= numWaves * 4; i++) {
      const t = i / (numWaves * 4);
      points.push({
        x: margin + t * (canvasWidth - 2 * margin),
        y: centerY + Math.sin(t * Math.PI * numWaves) * radius * 0.4,
      });
    }
  }
  
  return {
    id,
    points,
    completed: false,
    progress: 0,
    cutQuality: 0,
  };
}

// Generate cut lines for a level
export function generateCutLines(
  level: number,
  canvasWidth: number = 600,
  canvasHeight: number = 400
): CutLine[] {
  const numLines = 3 + level; // 4, 5, or 6 lines
  const lines: CutLine[] = [];
  
  for (let i = 0; i < numLines; i++) {
    if (level === 1) {
      lines.push(generateStraightLine(i, canvasWidth, canvasHeight));
    } else if (level === 2) {
      lines.push(generateCurvedLine(i, canvasWidth, canvasHeight));
    } else {
      lines.push(generateComplexLine(i, canvasWidth, canvasHeight));
    }
  }
  
  return lines;
}

// Calculate distance from point to line segment
export function distanceToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
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

  let xx: number, yy: number;

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

// Check if point is near any segment of a cut line
export function isNearCutLine(
  x: number,
  y: number,
  line: CutLine,
  tolerance: number
): { isNear: boolean; minDistance: number; closestSegment: number } {
  let minDistance = Infinity;
  let closestSegment = -1;

  for (let i = 0; i < line.points.length - 1; i++) {
    const p1 = line.points[i];
    const p2 = line.points[i + 1];
    const dist = distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
    
    if (dist < minDistance) {
      minDistance = dist;
      closestSegment = i;
    }
  }

  return {
    isNear: minDistance <= tolerance,
    minDistance,
    closestSegment,
  };
}

// Calculate progress along a line (0-100%)
export function calculateCutProgress(
  currentPos: Point,
  line: CutLine,
  _startPos: Point
): number {
  // Calculate total line length
  let totalLength = 0;
  for (let i = 0; i < line.points.length - 1; i++) {
    const p1 = line.points[i];
    const p2 = line.points[i + 1];
    totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  // Calculate distance from start to current position
  // Find closest point on line to current position
  let minDist = Infinity;
  let closestT = 0;

  for (let i = 0; i < line.points.length - 1; i++) {
    const p1 = line.points[i];
    const p2 = line.points[i + 1];
    
    const C = currentPos.x - p1.x;
    const D = currentPos.y - p1.y;
    const E = p2.x - p1.x;
    const F = p2.y - p1.y;
    
    const lenSq = E * E + F * F;
    let param = 0;
    
    if (lenSq !== 0) {
      param = Math.max(0, Math.min(1, (C * E + D * F) / lenSq));
    }
    
    const projX = p1.x + param * E;
    const projY = p1.y + param * F;
    const dist = Math.sqrt((currentPos.x - projX) ** 2 + (currentPos.y - projY) ** 2);
    
    if (dist < minDist) {
      minDist = dist;
      // Calculate cumulative distance to this segment
      let cumDist = 0;
      for (let j = 0; j < i; j++) {
        const a = line.points[j];
        const b = line.points[j + 1];
        cumDist += Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
      }
      const segLen = Math.sqrt(lenSq);
      closestT = (cumDist + param * segLen) / totalLength;
    }
  }

  return Math.min(100, Math.max(0, closestT * 100));
}

// Calculate cut quality based on average distance from line
export function calculateCutQuality(averageDistance: number, tolerance: number): 'perfect' | 'good' | 'ok' | 'miss' {
  const ratio = averageDistance / tolerance;
  if (ratio < 0.3) return 'perfect';
  if (ratio < 0.6) return 'good';
  if (ratio < 1.0) return 'ok';
  return 'miss';
}

// Get points for cut quality
export function getCutQualityPoints(quality: 'perfect' | 'good' | 'ok' | 'miss'): number {
  switch (quality) {
    case 'perfect': return 20;
    case 'good': return 15;
    case 'ok': return 10;
    case 'miss': return 0;
  }
}

// Check if all lines are completed
export function areAllLinesCompleted(lines: CutLine[]): boolean {
  return lines.every(line => line.completed);
}

// Calculate total score
export function calculateTotalScore(lines: CutLine[], combo: number): number {
  const baseScore = lines.reduce((sum, line) => {
    if (!line.completed) return sum;
    const quality = calculateCutQuality(line.cutQuality, 30); // Default tolerance
    return sum + getCutQualityPoints(quality);
  }, 0);
  
  const comboBonus = Math.min(combo * 5, 25);
  return baseScore + comboBonus;
}

// Get material emoji
export function getMaterialEmoji(material: 'paper' | 'fabric' | 'food'): string {
  switch (material) {
    case 'paper': return '📄';
    case 'fabric': return '🧵';
    case 'food': return '🍕';
  }
}

// Get material background color
export function getMaterialColor(material: 'paper' | 'fabric' | 'food'): string {
  switch (material) {
    case 'paper': return '#F5F5F5';
    case 'fabric': return '#FFE4E1';
    case 'food': return '#FFF8DC';
  }
}
