/**
 * Sound Garden Logic Tests
 *
 * Tests for the musical flower garden game logic.
 */

import { describe, it, expect } from 'vitest';
import {
  FLOWERS,
  createInitialState,
  calculateScore,
  calculateStars,
  type Flower,
  type InstrumentType,
  type GameState,
} from '../soundGardenLogic';

describe('Constants', () => {
  it('should have 8 flowers defined', () => {
    expect(FLOWERS.length).toBe(8);
  });

  it('should have 2 flute flowers', () => {
    const flutes = FLOWERS.filter(f => f.instrument === 'flute');
    expect(flutes.length).toBe(2);
  });

  it('should have 2 violin flowers', () => {
    const violins = FLOWERS.filter(f => f.instrument === 'violin');
    expect(violins.length).toBe(2);
  });

  it('should have 2 piano flowers', () => {
    const pianos = FLOWERS.filter(f => f.instrument === 'piano');
    expect(pianos.length).toBe(2);
  });

  it('should have 1 drum flower', () => {
    const drums = FLOWERS.filter(f => f.instrument === 'drum');
    expect(drums.length).toBe(1);
  });

  it('should have 1 guitar flower', () => {
    const guitars = FLOWERS.filter(f => f.instrument === 'guitar');
    expect(guitars.length).toBe(1);
  });

  it('should have unique ids for all flowers', () => {
    const ids = FLOWERS.map(f => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);
  });

  it('should have flowers with valid frequencies', () => {
    FLOWERS.forEach(flower => {
      expect(flower.frequency).toBeGreaterThan(0);
      expect(flower.frequency).toBeLessThan(1000);
    });
  });

  it('should have flowers with valid colors', () => {
    FLOWERS.forEach(flower => {
      expect(flower.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('should have flowers with emoji icons', () => {
    FLOWERS.forEach(flower => {
      expect(flower.emoji).toBeTruthy();
      expect(flower.emoji.length).toBeGreaterThan(0);
    });
  });

  it('should have flowers spanning C major scale', () => {
    const notes = FLOWERS.map(f => f.note);
    expect(notes).toContain('C');
    expect(notes).toContain('D');
    expect(notes).toContain('E');
    expect(notes).toContain('F');
    expect(notes).toContain('G');
    expect(notes).toContain('A');
    expect(notes).toContain('B');
  });
});

describe('createInitialState', () => {
  it('should create initial state with empty played notes', () => {
    const state = createInitialState();
    expect(state.playedNotes).toEqual([]);
  });

  it('should start with zero score', () => {
    const state = createInitialState();
    expect(state.score).toBe(0);
  });

  it('should start not playing', () => {
    const state = createInitialState();
    expect(state.isPlaying).toBe(false);
  });

  it('should have all required GameState properties', () => {
    const state = createInitialState();
    expect(state).toHaveProperty('playedNotes');
    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('isPlaying');
  });
});

describe('calculateScore', () => {
  it('should give 10 points per note played', () => {
    expect(calculateScore(0)).toBe(0);
    expect(calculateScore(1)).toBe(10);
    expect(calculateScore(5)).toBe(50);
    expect(calculateScore(10)).toBe(100);
  });

  it('should scale linearly with notes played', () => {
    const score1 = calculateScore(5);
    const score2 = calculateScore(10);
    expect(score2).toBe(2 * score1);
  });

  it('should handle large numbers', () => {
    expect(calculateScore(100)).toBe(1000);
  });
});

describe('calculateStars', () => {
  it('should return 5 stars for 20+ notes', () => {
    expect(calculateStars(20)).toBe(5);
    expect(calculateStars(25)).toBe(5);
    expect(calculateStars(100)).toBe(5);
  });

  it('should return 4 stars for 15-19 notes', () => {
    expect(calculateStars(15)).toBe(4);
    expect(calculateStars(17)).toBe(4);
    expect(calculateStars(19)).toBe(4);
  });

  it('should return 3 stars for 10-14 notes', () => {
    expect(calculateStars(10)).toBe(3);
    expect(calculateStars(12)).toBe(3);
    expect(calculateStars(14)).toBe(3);
  });

  it('should return 2 stars for 5-9 notes', () => {
    expect(calculateStars(5)).toBe(2);
    expect(calculateStars(7)).toBe(2);
    expect(calculateStars(9)).toBe(2);
  });

  it('should return 1 star for less than 5 notes', () => {
    expect(calculateStars(0)).toBe(1);
    expect(calculateStars(1)).toBe(1);
    expect(calculateStars(4)).toBe(1);
  });

  it('should return exactly 5 stars at threshold', () => {
    expect(calculateStars(20)).toBe(5);
  });

  it('should return exactly 4 stars at threshold', () => {
    expect(calculateStars(15)).toBe(4);
  });

  it('should return exactly 3 stars at threshold', () => {
    expect(calculateStars(10)).toBe(3);
  });

  it('should return exactly 2 stars at threshold', () => {
    expect(calculateStars(5)).toBe(2);
  });
});

describe('Type Safety', () => {
  it('should accept Flower type', () => {
    const flower: Flower = {
      id: 'test-flower',
      emoji: '🌸',
      name: 'Test Flower',
      instrument: 'flute',
      note: 'C',
      frequency: 261.63,
      color: '#FFB6C1',
    };
    expect(flower.instrument).toBe('flute');
  });

  it('should accept InstrumentType type', () => {
    const instrument: InstrumentType = 'piano';
    expect(['flute', 'violin', 'piano', 'drum', 'guitar']).toContain(instrument);
  });

  it('should accept all instrument types', () => {
    const instruments: InstrumentType[] = ['flute', 'violin', 'piano', 'drum', 'guitar'];
    expect(instruments).toHaveLength(5);
  });

  it('should accept GameState type', () => {
    const state: GameState = {
      playedNotes: [],
      score: 0,
      isPlaying: false,
    };
    expect(typeof state.score).toBe('number');
  });
});

describe('Integration - Game Flow', () => {
  it('should simulate complete game cycle', () => {
    let state = createInitialState();
    state.isPlaying = true;

    // Simulate playing 25 notes
    const notesPlayed = 25;
    state.score = calculateScore(notesPlayed);
    state.isComplete = true;
    const stars = calculateStars(notesPlayed);

    expect(state.score).toBe(250);
    expect(stars).toBe(5);
  });

  it('should track playing notes across flowers', () => {
    const state = createInitialState();
    state.isPlaying = true;

    // Simulate playing each flower once
    FLOWERS.forEach(flower => {
      state.playedNotes.push(flower.note);
    });

    expect(state.playedNotes.length).toBe(8);
    expect(calculateScore(state.playedNotes.length)).toBe(80);
    expect(calculateStars(state.playedNotes.length)).toBe(2); // 8 notes = 2 stars
  });

  it('should calculate progression from 1 to 5 stars', () => {
    // 1 star: 0-4 notes
    expect(calculateStars(3)).toBe(1);

    // 2 stars: 5-9 notes
    expect(calculateStars(7)).toBe(2);

    // 3 stars: 10-14 notes
    expect(calculateStars(12)).toBe(3);

    // 4 stars: 15-19 notes
    expect(calculateStars(17)).toBe(4);

    // 5 stars: 20+ notes
    expect(calculateStars(22)).toBe(5);
  });

  it('should correlate score with stars', () => {
    const lowScore = calculateScore(3);
    const lowStars = calculateStars(3);
    expect(lowScore).toBe(30);
    expect(lowStars).toBe(1);

    const highScore = calculateScore(25);
    const highStars = calculateStars(25);
    expect(highScore).toBe(250);
    expect(highStars).toBe(5);
  });

  it('should handle flowers ordered by frequency', () => {
    const sortedByFrequency = [...FLOWERS].sort((a, b) => a.frequency - b.frequency);

    expect(sortedByFrequency[0].note).toBe('C');
    expect(sortedByFrequency[0].frequency).toBe(261.63);

    expect(sortedByFrequency[sortedByFrequency.length - 1].note).toBe('C2');
    expect(sortedByFrequency[sortedByFrequency.length - 1].frequency).toBe(523.25);
  });

  it('should group flowers by instrument', () => {
    const flutes = FLOWERS.filter(f => f.instrument === 'flute');
    const violins = FLOWERS.filter(f => f.instrument === 'violin');
    const pianos = FLOWERS.filter(f => f.instrument === 'piano');

    expect(flutes.length).toBe(2);
    expect(violins.length).toBe(2);
    expect(pianos.length).toBe(2);
  });
});
