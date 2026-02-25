import { describe, expect, it } from 'vitest';
import {
  COLOR_BY_NUMBER_TEMPLATES,
  createInitialState,
  getCompletionPercent,
  getLevelSummary,
  getRemainingCountByNumber,
  getSuggestedNumber,
  paintRegion,
  selectColorNumber,
} from '../colorByNumberLogic';

describe('colorByNumberLogic', () => {
  it('creates initial state from template', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);

    expect(state.score).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(state.moves).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.maxStreak).toBe(0);
    expect(state.completed).toBe(false);
    expect(state.selectedNumber).toBeNull();
    expect(state.regions.length).toBeGreaterThan(0);
    expect(state.regions.every((region) => !region.painted)).toBe(true);
  });

  it('selects a color number', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const updated = selectColorNumber(initial, 2);

    expect(updated.selectedNumber).toBe(2);
  });

  it('requires color selection before painting', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const firstRegion = initial.regions[0];
    const outcome = paintRegion(initial, firstRegion.id);

    expect(outcome.result).toBe('no-color-selected');
    expect(outcome.state.score).toBe(0);
    expect(outcome.state.mistakes).toBe(0);
    expect(outcome.state.regions[0].painted).toBe(false);
  });

  it('penalizes wrong number', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const firstRegion = initial.regions[0];
    const wrongNumber = firstRegion.number === 1 ? 2 : 1;
    const selected = selectColorNumber(initial, wrongNumber);

    const outcome = paintRegion(selected, firstRegion.id);
    expect(outcome.result).toBe('wrong-number');
    expect(outcome.state.mistakes).toBe(1);
    expect(outcome.state.moves).toBe(1);
    expect(outcome.state.streak).toBe(0);
    expect(outcome.state.score).toBe(0);
    expect(outcome.state.regions[0].painted).toBe(false);
  });

  it('paints correctly and increases score', () => {
    const initial = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const firstRegion = initial.regions[0];
    const selected = selectColorNumber(initial, firstRegion.number);

    const outcome = paintRegion(selected, firstRegion.id);
    expect(outcome.result).toBe('correct');
    expect(outcome.state.score).toBe(11);
    expect(outcome.state.streak).toBe(1);
    expect(outcome.state.maxStreak).toBe(1);
    expect(outcome.state.moves).toBe(1);
    expect(outcome.state.regions[0].painted).toBe(true);
    expect(outcome.state.completed).toBe(false);
  });

  it('marks completed and grants completion bonus when final region is painted', () => {
    const template = COLOR_BY_NUMBER_TEMPLATES[0];
    let state = createInitialState(template);

    for (let i = 0; i < template.regions.length - 1; i++) {
      state = selectColorNumber(state, template.regions[i].number);
      state = paintRegion(state, template.regions[i].id).state;
    }

    const finalRegion = template.regions[template.regions.length - 1];
    state = selectColorNumber(state, finalRegion.number);
    const finalOutcome = paintRegion(state, finalRegion.id);

    expect(finalOutcome.result).toBe('correct');
    expect(finalOutcome.state.completed).toBe(true);
    const streakBonus = Array.from({ length: template.regions.length }).reduce(
      (acc, _, idx) => acc + Math.min(5, idx + 1),
      0,
    );
    const expectedScoreFromStreaks = template.regions.length * 10 + streakBonus + 20;
    expect(finalOutcome.state.score).toBe(expectedScoreFromStreaks);
    expect(getCompletionPercent(finalOutcome.state)).toBe(100);
  });

  it('suggests a number with remaining regions', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const suggested = getSuggestedNumber(state);
    expect(suggested).not.toBeNull();
    expect(getRemainingCountByNumber(state, suggested as number)).toBeGreaterThan(0);
  });

  it('returns level summary stars by mistakes', () => {
    const state = createInitialState(COLOR_BY_NUMBER_TEMPLATES[0]);
    const summaryBefore = getLevelSummary(state);
    expect(summaryBefore.stars).toBe(0);

    const completedState = {
      ...state,
      completed: true,
      regions: state.regions.map((region) => ({ ...region, painted: true })),
      mistakes: 2,
      score: 120,
    };
    const summaryAfter = getLevelSummary(completedState);
    expect(summaryAfter.completionPercent).toBe(100);
    expect(summaryAfter.stars).toBe(2);
  });
});
