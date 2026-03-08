import { describe, expect, it } from 'vitest';
import {
  COLOR_BY_NUMBER_TEMPLATES,
  COLOR_PALETTE,
  ColorByNumberState,
  PaintResult,
  createInitialState,
  getCompletionPercent,
  getLevelSummary,
  getRemainingCountByNumber,
  getSuggestedNumber,
  paintRegion,
  selectColorNumber,
} from '../colorByNumberLogic';

describe('COLOR_PALETTE', () => {
  it('has 4 colors', () => {
    expect(COLOR_PALETTE).toHaveLength(4);
  });

  it('has number 1 as Sky Blue', () => {
    const entry = COLOR_PALETTE.find(c => c.number === 1);
    expect(entry?.label).toBe('Sky Blue');
    expect(entry?.color).toBe('#60A5FA');
  });

  it('has number 2 as Sun Yellow', () => {
    const entry = COLOR_PALETTE.find(c => c.number === 2);
    expect(entry?.label).toBe('Sun Yellow');
    expect(entry?.color).toBe('#FACC15');
  });

  it('has number 3 as Leaf Green', () => {
    const entry = COLOR_PALETTE.find(c => c.number === 3);
    expect(entry?.label).toBe('Leaf Green');
    expect(entry?.color).toBe('#4ADE80');
  });

  it('has number 4 as Berry Pink', () => {
    const entry = COLOR_PALETTE.find(c => c.number === 4);
    expect(entry?.label).toBe('Berry Pink');
    expect(entry?.color).toBe('#F472B6');
  });

  it('all entries have valid structure', () => {
    for (const entry of COLOR_PALETTE) {
      expect(typeof entry.number).toBe('number');
      expect(typeof entry.label).toBe('string');
      expect(typeof entry.color).toBe('string');
      expect(entry.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('COLOR_BY_NUMBER_TEMPLATES', () => {
  it('has 3 templates', () => {
    expect(COLOR_BY_NUMBER_TEMPLATES).toHaveLength(3);
  });

  it('has butterfly-garden template', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES.find(t => t.id === 'butterfly-garden');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Butterfly Garden');
    expect(template?.regions).toHaveLength(8);
  });

  it('has happy-fish template', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES.find(t => t.id === 'happy-fish');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Happy Fish');
    expect(template?.regions).toHaveLength(8);
  });

  it('has rocket-trip template', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES.find(t => t.id === 'rocket-trip');
    expect(template).toBeDefined();
    expect(template?.name).toBe('Rocket Trip');
    expect(template?.regions).toHaveLength(8);
  });

  it('all regions have valid numbers (1-4)', () => {
    for (const template of COLOR_BY_NUMBER_TEMPLATES) {
      for (const region of template.regions) {
        expect(region.number).toBeGreaterThanOrEqual(1);
        expect(region.number).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('createInitialState', () => {
  it('creates state with zero initial values', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);

    expect(state.score).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(state.moves).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.maxStreak).toBe(0);
  });

  it('creates state with no selected number', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    expect(state.selectedNumber).toBeNull();
  });

  it('creates state with not completed', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    expect(state.completed).toBe(false);
  });

  it('copies all regions from template', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    const state = createInitialState(template);
    expect(state.regions).toHaveLength(template.regions.length);
  });

  it('all regions start unpainted', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    expect(state.regions.every(r => !r.painted)).toBe(true);
  });

  it('preserves region properties', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    const state = createInitialState(template);

    for (let i = 0; i < template.regions.length; i++) {
      expect(state.regions[i].id).toBe(template.regions[i].id);
      expect(state.regions[i].label).toBe(template.regions[i].label);
      expect(state.regions[i].number).toBe(template.regions[i].number);
    }
  });
});

describe('selectColorNumber', () => {
  it('sets selectedNumber to 1', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const updated = selectColorNumber(initial, 1);
    expect(updated.selectedNumber).toBe(1);
  });

  it('sets selectedNumber to 4', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const updated = selectColorNumber(initial, 4);
    expect(updated.selectedNumber).toBe(4);
  });

  it('does not mutate original state', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const originalSelected = initial.selectedNumber;
    selectColorNumber(initial, 2);
    expect(initial.selectedNumber).toBe(originalSelected);
  });

  it('preserves other state properties', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const updated = selectColorNumber(initial, 3);

    expect(updated.score).toBe(initial.score);
    expect(updated.mistakes).toBe(initial.mistakes);
    expect(updated.moves).toBe(initial.moves);
    expect(updated.streak).toBe(initial.streak);
  });

  it('can change selected number', () => {
    let state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    state = selectColorNumber(state, 1);
    expect(state.selectedNumber).toBe(1);

    state = selectColorNumber(state, 3);
    expect(state.selectedNumber).toBe(3);
  });
});

describe('paintRegion', () => {
  let initialState: ColorByNumberState;

  beforeEach(() => {
    initialState = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
  });

  it('returns no-color-selected when no color selected', () => {
    const result = paintRegion(initialState, initialState.regions[0].id);
    expect(result.result).toBe('no-color-selected');
    expect(result.state).toBe(initialState);
  });

  it('returns already-painted for painted region', () => {
    let state = selectColorNumber(initialState, initialState.regions[0].number);
    state = paintRegion(state, state.regions[0].id).state;

    const result = paintRegion(state, state.regions[0].id);
    expect(result.result).toBe('already-painted');
  });

  it('returns missing-region for invalid region ID', () => {
    let state = selectColorNumber(initialState, 1);
    const result = paintRegion(state, 'invalid-id');
    expect(result.result).toBe('missing-region');
  });

  it('returns wrong-number when colors do not match', () => {
    const region = initialState.regions[0];
    const wrongNumber = region.number === 1 ? 2 : 1;

    let state = selectColorNumber(initialState, wrongNumber);
    const result = paintRegion(state, region.id);

    expect(result.result).toBe('wrong-number');
    expect(result.state.mistakes).toBe(1);
    expect(result.state.score).toBeLessThanOrEqual(0);
  });

  it('resets streak on wrong-number', () => {
    // Build up a streak first
    let state = initialState;
    for (let i = 0; i < 3; i++) {
      state = selectColorNumber(state, state.regions[i].number);
      state = paintRegion(state, state.regions[i].id).state;
    }
    expect(state.streak).toBe(3);

    // Now make a mistake
    const nextRegion = state.regions[3];
    const wrongNumber = nextRegion.number === 1 ? 2 : 1;
    state = selectColorNumber(state, wrongNumber);
    const result = paintRegion(state, nextRegion.id);

    expect(result.result).toBe('wrong-number');
    expect(result.state.streak).toBe(0);
  });

  it('returns correct for matching number', () => {
    const region = initialState.regions[0];
    let state = selectColorNumber(initialState, region.number);
    const result = paintRegion(state, region.id);

    expect(result.result).toBe('correct');
    expect(result.state.regions[0].painted).toBe(true);
  });

  it('increases score by 10 for correct paint with no streak', () => {
    const region = initialState.regions[0];
    let state = selectColorNumber(initialState, region.number);
    const result = paintRegion(state, region.id);

    expect(result.state.score).toBe(11); // 10 base + 1 streak bonus
  });

  it('adds streak bonus to score', () => {
    // First paint
    let state = selectColorNumber(initialState, initialState.regions[0].number);
    state = paintRegion(state, state.regions[0].id).state;
    expect(state.score).toBe(11);

    // Second paint (should have +2 bonus)
    state = selectColorNumber(state, state.regions[1].number);
    state = paintRegion(state, state.regions[1].id).state;
    expect(state.score).toBe(23); // 11 + 10 + 2
  });

  it('caps streak bonus at 5', () => {
    let state = initialState;
    // Paint 6 regions to test streak cap
    for (let i = 0; i < Math.min(6, state.regions.length); i++) {
      state = selectColorNumber(state, state.regions[i].number);
      state = paintRegion(state, state.regions[i].id).state;
    }

    // After 5th region, streak bonus should be capped at 5
    expect(state.maxStreak).toBeGreaterThanOrEqual(5);
  });

  it('increments moves count on all paint attempts', () => {
    const region = initialState.regions[0];

    // Correct paint
    let state = selectColorNumber(initialState, region.number);
    state = paintRegion(state, region.id).state;
    expect(state.moves).toBe(1);

    // Wrong paint
    const wrongNumber = region.number === 1 ? 2 : 1;
    state = selectColorNumber(state, wrongNumber);
    state = paintRegion(state, initialState.regions[1].id).state;
    expect(state.moves).toBe(2);
  });

  it('sets completed to true when final region painted', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    // Paint all but last region
    for (let i = 0; i < template.regions.length - 1; i++) {
      state = selectColorNumber(state, template.regions[i].number);
      state = paintRegion(state, template.regions[i].id).state;
    }
    expect(state.completed).toBe(false);

    // Paint final region
    const lastRegion = template.regions[template.regions.length - 1];
    state = selectColorNumber(state, lastRegion.number);
    const result = paintRegion(state, lastRegion.id);

    expect(result.state.completed).toBe(true);
  });

  it('adds completion bonus of 20 points', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    // Calculate expected score without completion bonus
    let expectedWithoutBonus = 0;
    for (let i = 0; i < template.regions.length; i++) {
      expectedWithoutBonus += 10 + Math.min(5, i + 1);
    }

    // Paint all regions
    for (let i = 0; i < template.regions.length; i++) {
      state = selectColorNumber(state, template.regions[i].number);
      state = paintRegion(state, template.regions[i].id).state;
    }

    expect(state.score).toBe(expectedWithoutBonus + 20);
  });

  it('does not paint region on wrong-number', () => {
    const region = initialState.regions[0];
    const wrongNumber = region.number === 1 ? 2 : 1;

    let state = selectColorNumber(initialState, wrongNumber);
    const result = paintRegion(state, region.id);

    expect(result.state.regions[0].painted).toBe(false);
  });
});

describe('getCompletionPercent', () => {
  it('returns 0 for initial state', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    expect(getCompletionPercent(state)).toBe(0);
  });

  it('returns 100 for completed state', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    for (const region of template.regions) {
      state = selectColorNumber(state, region.number);
      state = paintRegion(state, region.id).state;
    }

    expect(getCompletionPercent(state)).toBe(100);
  });

  it('returns 50 for half-painted state', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    const halfCount = Math.floor(template.regions.length / 2);
    for (let i = 0; i < halfCount; i++) {
      state = selectColorNumber(state, template.regions[i].number);
      state = paintRegion(state, template.regions[i].id).state;
    }

    const percent = getCompletionPercent(state);
    expect(percent).toBeGreaterThan(0);
    expect(percent).toBeLessThan(100);
  });

  it('handles empty regions gracefully', () => {
    const state: ColorByNumberState = {
      selectedNumber: null,
      regions: [],
      score: 0,
      mistakes: 0,
      moves: 0,
      streak: 0,
      maxStreak: 0,
      completed: false,
    };
    expect(getCompletionPercent(state)).toBe(0);
  });
});

describe('getRemainingCountByNumber', () => {
  it('returns count of unpainted regions for number 1', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const count = getRemainingCountByNumber(state, 1);
    expect(count).toBeGreaterThan(0);
  });

  it('returns 0 when all regions of number are painted', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    // Paint all regions of a specific number
    const targetNumber = template.regions[0].number;
    for (const region of template.regions) {
      if (region.number === targetNumber) {
        state = selectColorNumber(state, targetNumber);
        state = paintRegion(state, region.id).state;
      }
    }

    const count = getRemainingCountByNumber(state, targetNumber);
    expect(count).toBe(0);
  });

  it('returns 0 for number not in template', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const count = getRemainingCountByNumber(state, 99);
    expect(count).toBe(0);
  });
});

describe('getSuggestedNumber', () => {
  it('returns number with most remaining regions', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    // Paint some regions to change distribution
    const targetNumber = template.regions[0].number;
    for (const region of template.regions) {
      if (region.number === targetNumber && state.regions.find(r => r.id === region.id && !r.painted)) {
        state = selectColorNumber(state, targetNumber);
        state = paintRegion(state, region.id).state;
        break; // Just paint one
      }
    }

    const suggested = getSuggestedNumber(state);
    expect(suggested).not.toBeNull();
    expect(suggested).not.toBe(targetNumber); // Should suggest another number
  });

  it('returns null for completed state', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    for (const region of template.regions) {
      state = selectColorNumber(state, region.number);
      state = paintRegion(state, region.id).state;
    }

    const suggested = getSuggestedNumber(state);
    expect(suggested).toBeNull();
  });

  it('returns null for empty regions', () => {
    const state: ColorByNumberState = {
      selectedNumber: null,
      regions: [],
      score: 0,
      mistakes: 0,
      moves: 0,
      streak: 0,
      maxStreak: 0,
      completed: false,
    };
    expect(getSuggestedNumber(state)).toBeNull();
  });
});

describe('getLevelSummary', () => {
  it('returns 0 stars for incomplete state', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const summary = getLevelSummary(state);
    expect(summary.stars).toBe(0);
  });

  it('returns 3 stars for 0-1 mistakes', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    for (const region of template.regions) {
      state = selectColorNumber(state, region.number);
      state = paintRegion(state, region.id).state;
    }

    state.mistakes = 0;
    let summary = getLevelSummary(state);
    expect(summary.stars).toBe(3);

    state.mistakes = 1;
    summary = getLevelSummary(state);
    expect(summary.stars).toBe(3);
  });

  it('returns 2 stars for 2-3 mistakes', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    for (const region of template.regions) {
      state = selectColorNumber(state, region.number);
      state = paintRegion(state, region.id).state;
    }

    state.mistakes = 2;
    let summary = getLevelSummary(state);
    expect(summary.stars).toBe(2);

    state.mistakes = 3;
    summary = getLevelSummary(state);
    expect(summary.stars).toBe(2);
  });

  it('returns 1 star for 4+ mistakes', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    for (const region of template.regions) {
      state = selectColorNumber(state, region.number);
      state = paintRegion(state, region.id).state;
    }

    state.mistakes = 4;
    let summary = getLevelSummary(state);
    expect(summary.stars).toBe(1);

    state.mistakes = 10;
    summary = getLevelSummary(state);
    expect(summary.stars).toBe(1);
  });

  it('includes correct score in summary', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    state.score = 150;
    const summary = getLevelSummary(state);
    expect(summary.score).toBe(150);
  });

  it('includes correct mistakes in summary', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    state.mistakes = 3;
    const summary = getLevelSummary(state);
    expect(summary.mistakes).toBe(3);
  });

  it('includes correct completion percent in summary', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    // Paint half
    for (let i = 0; i < template.regions.length / 2; i++) {
      state = selectColorNumber(state, template.regions[i].number);
      state = paintRegion(state, template.regions[i].id).state;
    }

    const summary = getLevelSummary(state);
    expect(summary.completionPercent).toBe(50);
  });
});

describe('integration scenarios', () => {
  it('can complete a full game cycle', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    expect(state.completed).toBe(false);
    expect(getCompletionPercent(state)).toBe(0);

    for (const region of template.regions) {
      state = selectColorNumber(state, region.number);
      const result = paintRegion(state, region.id);
      state = result.state;
      expect(result.result).toBe('correct');
    }

    expect(state.completed).toBe(true);
    expect(getCompletionPercent(state)).toBe(100);

    const summary = getLevelSummary(state);
    expect(summary.stars).toBeGreaterThan(0);
  });

  it('handles making mistakes and recovering', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    const firstRegion = template.regions[0];
    const wrongNumber = firstRegion.number === 1 ? 2 : 1;

    // Make mistake
    state = selectColorNumber(state, wrongNumber);
    let result = paintRegion(state, firstRegion.id);
    state = result.state;

    expect(result.result).toBe('wrong-number');
    expect(state.mistakes).toBe(1);
    expect(state.streak).toBe(0);

    // Correct it
    state = selectColorNumber(state, firstRegion.number);
    result = paintRegion(state, firstRegion.id);
    state = result.state;

    expect(result.result).toBe('correct');
    expect(state.streak).toBe(1);
  });
});

describe('type definitions', () => {
  it('PaintResult type contains all expected values', () => {
    const results: PaintResult[] = ['correct', 'wrong-number', 'no-color-selected', 'already-painted', 'missing-region'];
    expect(results).toHaveLength(5);
  });
});
