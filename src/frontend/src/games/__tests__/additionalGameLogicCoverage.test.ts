import { describe, expect, it } from 'vitest';

import {
  VOWEL_WORDS,
  checkSelection as checkVowelSelection,
  createInitialState as createVowelState,
  getRandomWord,
} from '../vowelValleyLogic';
import {
  TASTE_FOODS,
  calculateStars as calculateTasteStars,
  createInitialState as createTasteState,
  getFoodsForLevel,
} from '../tasteMatchLogic';
import {
  TEXTURE_ITEMS,
  calculateScore as calculateTextureScore,
  createInitialState as createTextureState,
  getTextureItems,
} from '../textureExplorerLogic';
import {
  ANIMALS,
  FOODS,
  calculateScore as calculateFarmScore,
  createInitialState as createFarmState,
  getCorrectFoods,
  isFoodCorrect,
} from '../farmFriendsLogic';
import {
  DINOSAURS,
  calculateScore as calculateDinoScore,
  createInitialState as createDinoState,
  getRandomDino,
} from '../dinosaurDigLogic';
import {
  addTrailPoint,
  createInitialState as createLightPainterState,
  fadeOldTrails,
  getColorHex,
  setBackgroundColor,
  updateGlowSettings,
} from '../lightPainterLogic';

describe('additional game logic coverage', () => {
  it('initializes vowel valley with baseline values', () => {
    const state = createVowelState();
    expect(state.status).toBe('idle');
    expect(state.totalItems).toBe(10);
    expect(state.lives).toBe(3);
  });

  it('returns random vowel words from configured list', () => {
    const word = getRandomWord();
    expect(VOWEL_WORDS).toContainEqual(word);
    expect(checkVowelSelection(word, word.type)).toBe(true);
    expect(checkVowelSelection(word, word.type === 'short' ? 'long' : 'short')).toBe(false);
  });

  it('keeps taste level pools constrained and computes stars', () => {
    const state = createTasteState();
    expect(state.isPlaying).toBe(false);

    const levelOneFoods = getFoodsForLevel(1);
    expect(levelOneFoods).toHaveLength(3);
    levelOneFoods.forEach((food) => {
      expect(['candy', 'chips', 'lemon']).toContain(food.id);
      expect(TASTE_FOODS).toContainEqual(food);
    });

    expect(calculateTasteStars(10)).toBe(5);
    expect(calculateTasteStars(3)).toBe(1);
  });

  it('returns texture items and scores with mistake penalty', () => {
    const state = createTextureState();
    expect(state.currentItem).toBeNull();

    const items = getTextureItems();
    expect(items).toHaveLength(TEXTURE_ITEMS.length);
    items.forEach((item) => expect(TEXTURE_ITEMS).toContainEqual(item));

    expect(calculateTextureScore(6, 2)).toBe(110);
  });

  it('validates farm friend food matching and scoring', () => {
    const state = createFarmState();
    expect(state.currentAnimal).toBeNull();

    const cow = ANIMALS.find((animal) => animal.id === 'cow');
    const grass = FOODS.find((food) => food.id === 'grass');
    const fish = FOODS.find((food) => food.id === 'fish');
    expect(cow && grass && fish).toBeTruthy();
    if (!cow || !grass || !fish) {
      return;
    }

    const cowFoods = getCorrectFoods(cow);
    expect(cowFoods.some((food) => food.id === 'grass')).toBe(true);
    expect(isFoodCorrect(cow, grass)).toBe(true);
    expect(isFoodCorrect(cow, fish)).toBe(false);
    expect(calculateFarmScore(4, 1)).toBe(90);
  });

  it('returns dinosaur data and scoring outputs', () => {
    const state = createDinoState();
    expect(state.currentDino).toBeNull();

    const dino = getRandomDino();
    expect(DINOSAURS).toContainEqual(dino);
    expect(calculateDinoScore(60, 3)).toBe(120);
  });

  it('updates light painter state immutably', () => {
    const base = createLightPainterState();
    const withSettings = updateGlowSettings(base, { color: 'pink', size: 24 });
    const withPoint = addTrailPoint(withSettings, { x: 0.25, y: 0.5 });
    const withBackground = setBackgroundColor(withPoint, '#001a1a');

    expect(getColorHex('pink')).toBe('#ff69b4');
    expect(withBackground.canvas.backgroundColor).toBe('#001a1a');
    expect(withBackground.canvas.trails).toHaveLength(1);
    expect(withBackground.currentGlow.color).toBe('pink');

    const faded = fadeOldTrails(
      {
        ...withBackground,
        canvas: {
          ...withBackground.canvas,
          trails: [
            { ...withBackground.canvas.trails[0], timestamp: Date.now() - 10_000 },
          ],
        },
      },
      5_000
    );
    expect(faded.canvas.trails).toHaveLength(0);
  });
});
