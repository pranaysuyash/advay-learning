export interface ConductorNote {
  id: number;
  lane: number;
  y: number;
  speed: number;
  hit: boolean;
}

export interface ConductorLevel {
  id: number;
  bpm: number;
  duration: number;
  lanes: number;
}

export const LEVELS: ConductorLevel[] = [
  { id: 1, bpm: 60, duration: 30, lanes: 3 },
  { id: 2, bpm: 80, duration: 30, lanes: 3 },
  { id: 3, bpm: 100, duration: 45, lanes: 3 },
  { id: 4, bpm: 80, duration: 45, lanes: 4 },
  { id: 5, bpm: 100, duration: 60, lanes: 4 },
];

export function createNote(lane: number, y: number, speed: number): ConductorNote {
  return {
    id: Date.now() + Math.random(),
    lane,
    y,
    speed,
    hit: false,
  };
}

export function updateNotes(notes: ConductorNote[], deltaMs: number, removeBelowY: number): ConductorNote[] {
  return notes
    .map((note) => ({
      ...note,
      y: note.y + note.speed * deltaMs,
    }))
    .filter((note) => note.y < removeBelowY && !note.hit);
}

export function checkNoteHit(
  notes: ConductorNote[],
  lane: number,
  hitY: number,
  tolerance: number = 0.15
): { hit: ConductorNote | null; score: number } {
  const sortedNotes = notes
    .filter((n) => n.lane === lane && !n.hit)
    .sort((a, b) => Math.abs(a.y - hitY) - Math.abs(b.y - hitY));

  if (sortedNotes.length === 0) {
    return { hit: null, score: 0 };
  }

  const closest = sortedNotes[0];
  const distance = Math.abs(closest.y - hitY);

  if (distance < tolerance) {
    return { hit: closest, score: distance < tolerance * 0.5 ? 100 : 50 };
  }

  return { hit: null, score: 0 };
}

export function generatePattern(
  level: ConductorLevel,
  elapsedMs: number,
  lastNoteTime: number,
  bpm: number
): ConductorNote[] {
  const beatInterval = 60000 / bpm;
  const shouldCreateNote = elapsedMs - lastNoteTime >= beatInterval;

  if (!shouldCreateNote) return [];

  const lane = Math.floor(Math.random() * level.lanes);
  return [createNote(lane, 0, 0.0005)];
}

export function calculateComboScore(baseScore: number, combo: number): number {
  const multiplier = 1 + Math.min(combo, 10) * 0.1;
  return Math.floor(baseScore * multiplier);
}
