import { describe, expect, it } from 'vitest';

import {
  COLOR_MIX_RECIPES,
  createColorMixRound,
  isColorMixAnswerCorrect,
} from '../colorMixingLogic';

describe('createColorMixRound', () => {
  it('returns one of the canonical recipes and options set', () => {
    const round = createColorMixRound(() => 0);

    expect(COLOR_MIX_RECIPES.map((recipe) => recipe.id)).toContain(round.recipe.id);
    expect(round.options).toHaveLength(COLOR_MIX_RECIPES.length);
    expect(round.options).toContain(round.recipe.resultName);
  });
});

describe('isColorMixAnswerCorrect', () => {
  it('matches exact result name for the round recipe', () => {
    const round = createColorMixRound(() => 0.4);

    expect(isColorMixAnswerCorrect(round, round.recipe.resultName)).toBe(true);
    expect(isColorMixAnswerCorrect(round, 'Orange')).toBe(
      round.recipe.resultName === 'Orange',
    );
  });
});
