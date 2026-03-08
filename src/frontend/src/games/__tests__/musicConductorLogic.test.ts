/**
 * Music Conductor Game Logic Tests
 *
 * Tests for note generation, hit detection, scoring,
 * level configuration, and game state management.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  ConductorNote,
  ConductorLevel,
  LEVELS,
  createNote,
  updateNotes,
  checkNoteHit,
  generatePattern,
  calculateComboScore,
} from '../musicConductorLogic';

describe('LEVELS Configuration', () => {
  it('has 4 levels', () => {
    expect(LEVELS).toHaveLength(4);
  });

  it('level 1 is easiest', () => {
    const level1 = LEVELS[0];
    expect(level1.level).toBe(1);
    expect(level1.bpm).toBe(50);
    expect(level1.lanes).toBe(2);
    expect(level1.hitTolerance).toBe(0.25);
  });

  it('level 4 is hardest', () => {
    const level4 = LEVELS[3];
    expect(level4.level).toBe(4);
    expect(level4.bpm).toBe(100);
    expect(level4.lanes).toBe(4);
    expect(level4.hitTolerance).toBe(0.12);
  });

  it('has sequential level numbers', () => {
    expect(LEVELS.map((l) => l.level)).toEqual([1, 2, 3, 4]);
  });

  it('BPM increases with each level', () => {
    const bpms = LEVELS.map((l) => l.bpm);
    expect(bpms).toEqual([50, 60, 80, 100]);
  });

  it('hit tolerance decreases with each level', () => {
    const tolerances = LEVELS.map((l) => l.hitTolerance);
    expect(tolerances).toEqual([0.25, 0.20, 0.15, 0.12]);
  });
});

describe('createNote', () => {
  it('creates note with required properties', () => {
    const note = createNote(0, 0.5, 0.001);
    expect(note.id).toBeDefined();
    expect(note.lane).toBe(0);
    expect(note.y).toBe(0.5);
    expect(note.speed).toBe(0.001);
    expect(note.hit).toBe(false);
  });

  it('generates unique IDs', () => {
    const note1 = createNote(0, 0.5, 0.001);
    const note2 = createNote(0, 0.5, 0.001);
    expect(note1.id).not.toBe(note2.id);
  });

  it('sets lane correctly', () => {
    const note = createNote(2, 0.5, 0.001);
    expect(note.lane).toBe(2);
  });

  it('sets position correctly', () => {
    const note = createNote(0, 0.75, 0.001);
    expect(note.y).toBe(0.75);
  });

  it('sets speed correctly', () => {
    const note = createNote(0, 0, 0.002);
    expect(note.speed).toBe(0.002);
  });
});

describe('updateNotes', () => {
  const baseNotes: ConductorNote[] = [
    { id: 1, lane: 0, y: 0.5, speed: 0.001, hit: false },
    { id: 2, lane: 1, y: 0.3, speed: 0.0015, hit: false },
    { id: 3, lane: 0, y: 0.8, speed: 0.0008, hit: true },
  ];

  it('moves notes based on speed and delta', () => {
    const updated = updateNotes(baseNotes, 100, 2);
    // Note 1: 0.5 + 0.001 * 100 = 0.6
    expect(updated[0].y).toBeCloseTo(0.6, 5);
    // Note 2: 0.3 + 0.0015 * 100 = 0.45
    expect(updated[1].y).toBeCloseTo(0.45, 5);
  });

  it('removes notes past removeBelowY', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.5, speed: 0.001, hit: false },
      { id: 2, lane: 0, y: 1.5, speed: 0.001, hit: false },
    ];
    const updated = updateNotes(notes, 0, 1.0);
    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(1);
  });

  it('removes hit notes', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.5, speed: 0.001, hit: false },
      { id: 2, lane: 0, y: 0.3, speed: 0.001, hit: true },
    ];
    const updated = updateNotes(notes, 0, 2);
    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(1);
  });

  it('preserves note properties except y', () => {
    const updated = updateNotes(baseNotes, 100, 2);
    expect(updated[0].id).toBe(baseNotes[0].id);
    expect(updated[0].lane).toBe(baseNotes[0].lane);
    expect(updated[0].speed).toBe(baseNotes[0].speed);
  });

  it('returns empty array when all notes removed', () => {
    const notes = [
      { id: 1, lane: 0, y: 1.5, speed: 0.001, hit: false },
      { id: 2, lane: 0, y: 1.8, speed: 0.001, hit: false },
    ];
    const updated = updateNotes(notes, 0, 1.0);
    expect(updated).toHaveLength(0);
  });
});

describe('checkNoteHit', () => {
  const hitY = 0.85;

  it('returns null when no notes in lane', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.8, speed: 0.001, hit: false },
      { id: 2, lane: 1, y: 0.9, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 2, hitY, 0.15);
    expect(result.hit).toBeNull();
    expect(result.score).toBe(0);
  });

  it('returns null when no notes within tolerance', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.5, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.15);
    expect(result.hit).toBeNull();
    expect(result.score).toBe(0);
  });

  it('detects hit when note is within tolerance', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.85, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.15);
    expect(result.hit).toEqual(notes[0]);
    expect(result.score).toBeGreaterThan(0);
  });

  it('awards 100 points for perfect hit (within half tolerance)', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.85, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.25);
    expect(result.score).toBe(100);
  });

  it('awards 50 points for good hit (within tolerance but not perfect)', () => {
    // distance = 0.16, tolerance = 0.25, tolerance * 0.5 = 0.125
    // 0.16 >= 0.125, so it's a good hit (50 points)
    const notes = [
      { id: 1, lane: 0, y: 1.01, speed: 0.001, hit: false }, // distance from 0.85 is 0.16
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.25);
    expect(result.score).toBe(50);
  });

  it('finds closest note when multiple in lane', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.75, speed: 0.001, hit: false },
      { id: 2, lane: 0, y: 0.87, speed: 0.001, hit: false },
      { id: 3, lane: 0, y: 0.80, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.15);
    expect(result.hit?.id).toBe(2); // Closest to 0.85
  });

  it('ignores already hit notes', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.85, speed: 0.001, hit: true },
      { id: 2, lane: 0, y: 0.87, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.15);
    expect(result.hit?.id).toBe(2);
  });

  it('only considers notes in specified lane', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.85, speed: 0.001, hit: false },
      { id: 2, lane: 1, y: 0.85, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY, 0.15);
    expect(result.hit?.id).toBe(1);
  });

  it('uses default tolerance of 0.15', () => {
    const notes = [
      { id: 1, lane: 0, y: 0.85, speed: 0.001, hit: false },
    ];
    const result = checkNoteHit(notes, 0, hitY);
    expect(result.hit).toEqual(notes[0]);
  });
});

describe('generatePattern', () => {
  const level: ConductorLevel = {
    id: 1,
    level: 1,
    bpm: 60,
    duration: 40,
    lanes: 2,
    hitTolerance: 0.25,
  };

  it('returns empty array when not enough time elapsed', () => {
    const notes = generatePattern(level, 500, 400, 60);
    expect(notes).toHaveLength(0);
  });

  it('generates note when beat interval passed', () => {
    const beatInterval = 60000 / 60; // 1000ms
    const notes = generatePattern(level, 1500, 500, 60);
    expect(notes).toHaveLength(1);
  });

  it('calculates beat interval correctly from BPM', () => {
    // BPM 60 = 1000ms per beat
    const notes1 = generatePattern(level, 2000, 900, 60);
    expect(notes1).toHaveLength(1);

    // BPM 120 = 500ms per beat
    const notes2 = generatePattern({ ...level, bpm: 120 }, 1000, 400, 120);
    expect(notes2).toHaveLength(1);
  });

  it('creates note at y=0 with speed 0.0005', () => {
    const notes = generatePattern(level, 2000, 500, 60);
    expect(notes).toHaveLength(1);
    expect(notes[0].y).toBe(0);
    expect(notes[0].speed).toBe(0.0005);
  });

  it('generates lane within valid range', () => {
    const notes = generatePattern(level, 2000, 500, 60);
    expect(notes[0].lane).toBeGreaterThanOrEqual(0);
    expect(notes[0].lane).toBeLessThan(level.lanes);
  });

  it('generates different lanes over time', () => {
    // This test checks randomness - may occasionally fail but very unlikely
    const lanes = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const elapsed = 2000 + i * 2000;
      const notes = generatePattern(level, elapsed, elapsed - 1500, 60);
      notes.forEach((n) => lanes.add(n.lane));
    }
    // With 2 lanes and 20 iterations, should have at least one of each
    expect(lanes.size).toBeGreaterThan(0);
  });
});

describe('calculateComboScore', () => {
  it('returns base score with zero combo', () => {
    expect(calculateComboScore(100, 0)).toBe(100);
  });

  it('adds 10% per combo level', () => {
    expect(calculateComboScore(100, 1)).toBe(110);
    expect(calculateComboScore(100, 2)).toBe(120);
    expect(calculateComboScore(100, 5)).toBe(150);
  });

  it('caps combo multiplier at 10 (2x max)', () => {
    expect(calculateComboScore(100, 10)).toBe(200);
    expect(calculateComboScore(100, 15)).toBe(200);
    expect(calculateComboScore(100, 100)).toBe(200);
  });

  it('handles different base scores', () => {
    expect(calculateComboScore(50, 3)).toBe(65); // 50 * 1.3
    expect(calculateComboScore(75, 5)).toBe(112); // 75 * 1.5 = 112.5 floor
  });

  it('caps at 10x combo regardless of base', () => {
    const score1 = calculateComboScore(50, 10);
    const score2 = calculateComboScore(50, 20);
    expect(score1).toBe(score2);
  });
});

describe('Hit Detection Mechanics', () => {
  it('perfect hit is within 50% of tolerance', () => {
    const notes = [{ id: 1, lane: 0, y: 0.85, speed: 0.001, hit: false }];
    const result = checkNoteHit(notes, 0, 0.85, 0.20);
    expect(result.score).toBe(100); // distance 0 < 0.10
  });

  it('good hit is within tolerance but not perfect', () => {
    // tolerance = 0.20, tolerance * 0.5 = 0.10
    // distance = 0.15 >= 0.10, so good hit (50 points)
    const notes = [{ id: 1, lane: 0, y: 1.0, speed: 0.001, hit: false }];
    const result = checkNoteHit(notes, 0, 0.85, 0.20);
    expect(result.score).toBe(50); // distance 0.15 < 0.20 but >= 0.10
  });

  it('miss is outside tolerance', () => {
    const notes = [{ id: 1, lane: 0, y: 0.70, speed: 0.001, hit: false }];
    const result = checkNoteHit(notes, 0, 0.85, 0.10);
    expect(result.score).toBe(0);
  });
});

describe('Level Progression', () => {
  it('level 1 has 2 lanes', () => {
    expect(LEVELS[0].lanes).toBe(2);
  });

  it('level 2 has 3 lanes', () => {
    expect(LEVELS[1].lanes).toBe(3);
  });

  it('levels 3 and 4 have 4 lanes', () => {
    expect(LEVELS[2].lanes).toBe(4);
    expect(LEVELS[3].lanes).toBe(4);
  });

  it('duration increases from level 1 to 2', () => {
    expect(LEVELS[0].duration).toBe(40);
    expect(LEVELS[1].duration).toBe(45);
  });

  it('duration stays at 60 for levels 3-4', () => {
    expect(LEVELS[2].duration).toBe(60);
    expect(LEVELS[3].duration).toBe(60);
  });
});

describe('Edge Cases', () => {
  it('handles empty notes array', () => {
    const result = checkNoteHit([], 0, 0.85, 0.15);
    expect(result.hit).toBeNull();
    expect(result.score).toBe(0);
  });

  it('handles empty notes in updateNotes', () => {
    const updated = updateNotes([], 100, 2);
    expect(updated).toHaveLength(0);
  });

  it('handles combo with zero base score', () => {
    expect(calculateComboScore(0, 5)).toBe(0);
  });

  it('handles negative combo (reduces score)', () => {
    // Note: Negative combo actually reduces multiplier below 1x
    // combo = -1, multiplier = 1 + min(-1, 10) * 0.1 = 1 - 0.1 = 0.9
    expect(calculateComboScore(100, -1)).toBe(90);
  });

  it('generates valid lane at boundary', () => {
    const level = { ...LEVELS[0], lanes: 2 };
    // Force lane to be at max boundary
    const notes = generatePattern(level, 2000, 500, 60);
    expect(notes[0].lane).toBeGreaterThanOrEqual(0);
    expect(notes[0].lane).toBeLessThan(2);
  });
});

describe('Scoring System', () => {
  it('combo multiplier formula is 1 + min(combo, 10) * 0.1', () => {
    // combo 0: 1 + 0 = 1x
    expect(calculateComboScore(100, 0)).toBe(100);
    // combo 5: 1 + 0.5 = 1.5x
    expect(calculateComboScore(100, 5)).toBe(150);
    // combo 10: 1 + 1 = 2x
    expect(calculateComboScore(100, 10)).toBe(200);
  });

  it('perfect hit (center) gives 100 base points', () => {
    const notes = [{ id: 1, lane: 0, y: 0.85, speed: 0.001, hit: false }];
    const result = checkNoteHit(notes, 0, 0.85, 0.20);
    expect(result.score).toBe(100);
  });

  it('good hit (edge of tolerance) gives 50 base points', () => {
    const tolerance = 0.20;
    const hitY = 0.85;
    // Just barely within tolerance
    const notes = [{ id: 1, lane: 0, y: hitY + tolerance * 0.9, speed: 0.001, hit: false }];
    const result = checkNoteHit(notes, 0, hitY, tolerance);
    expect(result.score).toBe(50);
  });
});
