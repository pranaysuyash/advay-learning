import { calculateScore as calculateAir } from '../airGuitarHeroLogic';
import { calculateScore as calculateColorSort } from '../colorSortGameLogic';
import { calculateScore as calculateWeather } from '../weatherMatchLogic';
import { calculateScore as calculateAnimal } from '../animalSoundsLogic';
import { calculateScore as calculateBody } from '../bodyPartsLogic';
import { calculateScore as calculateMoney } from '../moneyMatchLogic';

// Basic smoke tests for scoring functions

describe('Game scoring logic', () => {
  it('air guitar hero should use ×2 multiplier correctly', () => {
    expect(calculateAir(0, 'easy')).toBe(10);
    expect(calculateAir(5, 'easy')).toBe(10 + Math.min(5 * 2, 20));
    expect(calculateAir(10, 'hard')).toBe(Math.floor((10 + 20) * 2));
  });

  it('color sort should calculate based on level', () => {
    expect(calculateColorSort(0, 1)).toBe(10);
    expect(calculateColorSort(2, 3)).toBe(Math.floor((10 + Math.min(2 * 3, 15)) * 2));
  });

  it('weather match should include base 15 and level multiplier', () => {
    expect(calculateWeather(0, 1)).toBe(15);
    expect(calculateWeather(3, 2)).toBe(Math.floor((15 + Math.min(3 * 3, 15)) * 1.5));
  });

  it('animal sounds & body parts & money match share formula', () => {
    const animals = calculateAnimal(4, 3);
    const body = calculateBody(4, 3);
    const money = calculateMoney(4, 3);
    // they should match the same math
    expect(animals).toBe(body);
    expect(body).toBe(money);
  });
});
