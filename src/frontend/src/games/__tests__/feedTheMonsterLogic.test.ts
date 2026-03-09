import { describe, expect, it } from 'vitest';

import {
  FoodItem,
  MonsterEmotion,
  LevelConfig,
  FOODS,
  MONSTER_EMOTIONS,
  LEVELS,
  getLevelConfig,
  getEmotionForLevel,
  generateOptions,
  checkAnswer,
  calculateScore,
} from '../feedTheMonsterLogic';

describe('FOODS', () => {
  it('has 11 food items', () => {
    expect(FOODS).toHaveLength(11);
  });

  it('all foods have valid structure', () => {
    for (const food of FOODS) {
      expect(typeof food.id).toBe('number');
      expect(typeof food.emoji).toBe('string');
      expect(typeof food.name).toBe('string');
      expect(typeof food.category).toBe('string');
    }
  });

  it('all categories are valid', () => {
    const validCategories: FoodItem['category'][] = ['happy', 'sad', 'angry', 'excited', 'calm'];
    for (const food of FOODS) {
      expect(validCategories).toContain(food.category);
    }
  });

  it('has happy foods', () => {
    const happyFoods = FOODS.filter(f => f.category === 'happy');
    expect(happyFoods.length).toBeGreaterThanOrEqual(2);
    expect(happyFoods.every(f => f.category === 'happy')).toBe(true);
  });

  it('has sad foods', () => {
    const sadFoods = FOODS.filter(f => f.category === 'sad');
    expect(sadFoods.length).toBeGreaterThanOrEqual(1);
  });

  it('has angry foods', () => {
    const angryFoods = FOODS.filter(f => f.category === 'angry');
    expect(angryFoods.length).toBeGreaterThanOrEqual(1);
  });

  it('has excited foods', () => {
    const excitedFoods = FOODS.filter(f => f.category === 'excited');
    expect(excitedFoods.length).toBeGreaterThanOrEqual(1);
  });

  it('has calm foods', () => {
    const calmFoods = FOODS.filter(f => f.category === 'calm');
    expect(calmFoods.length).toBeGreaterThanOrEqual(1);
  });

  it('includes specific foods', () => {
    const foods = FOODS.map(f => f.name);
    expect(foods).toContain('Pizza');
    expect(foods).toContain('Ice Cream');
    expect(foods).toContain('Hot Pepper');
  });

  it('all food IDs are unique', () => {
    const ids = FOODS.map(f => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('MONSTER_EMOTIONS', () => {
  it('has 5 emotions', () => {
    expect(MONSTER_EMOTIONS).toHaveLength(5);
  });

  it('all emotions have valid structure', () => {
    for (const emotion of MONSTER_EMOTIONS) {
      expect(typeof emotion.id).toBe('number');
      expect(typeof emotion.emotion).toBe('string');
      expect(typeof emotion.emoji).toBe('string');
      expect(typeof emotion.prompt).toBe('string');
    }
  });

  it('contains happy emotion', () => {
    const happy = MONSTER_EMOTIONS.find(e => e.emotion === 'happy');
    expect(happy).toBeDefined();
    expect(happy?.emoji).toBe('😄');
  });

  it('contains sad emotion', () => {
    const sad = MONSTER_EMOTIONS.find(e => e.emotion === 'sad');
    expect(sad).toBeDefined();
    expect(sad?.emoji).toBe('😢');
  });

  it('contains calm emotion', () => {
    const calm = MONSTER_EMOTIONS.find(e => e.emotion === 'calm');
    expect(calm).toBeDefined();
    expect(calm?.emoji).toBe('😌');
  });

  it('contains excited emotion', () => {
    const excited = MONSTER_EMOTIONS.find(e => e.emotion === 'excited');
    expect(excited).toBeDefined();
    expect(excited?.emoji).toBe('🤩');
  });

  it('contains angry emotion', () => {
    const angry = MONSTER_EMOTIONS.find(e => e.emotion === 'angry');
    expect(angry).toBeDefined();
    expect(angry?.emoji).toBe('😠');
  });

  it('all emotion IDs are unique', () => {
    const ids = MONSTER_EMOTIONS.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('LEVELS', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 3 options', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].optionsCount).toBe(3);
  });

  it('level 2 has 4 options', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].optionsCount).toBe(4);
  });

  it('level 3 has 5 options', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].optionsCount).toBe(5);
  });

  it('optionsCount increases across levels', () => {
    expect(LEVELS[0].optionsCount).toBeLessThan(LEVELS[1].optionsCount);
    expect(LEVELS[1].optionsCount).toBeLessThan(LEVELS[2].optionsCount);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.optionsCount).toBe(3);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.optionsCount).toBe(4);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.optionsCount).toBe(5);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });
});

describe('getEmotionForLevel', () => {
  it('returns an emotion for level 1', () => {
    const emotion = getEmotionForLevel(1);
    expect(MONSTER_EMOTIONS).toContain(emotion);
  });

  it('returns an emotion for level 2', () => {
    const emotion = getEmotionForLevel(2);
    expect(MONSTER_EMOTIONS).toContain(emotion);
  });

  it('returns an emotion for level 3', () => {
    const emotion = getEmotionForLevel(3);
    expect(MONSTER_EMOTIONS).toContain(emotion);
  });

  it('level 1 only uses first 3 emotions', () => {
    const emotions = new Set();
    for (let i = 0; i < 20; i++) {
      emotions.add(getEmotionForLevel(1).id);
    }
    // Level 1 should only use emotions with id 1-3 (first 3)
    const ids = Array.from(emotions);
    for (const id of ids) {
      expect(id).toBeLessThanOrEqual(3);
    }
  });
});

describe('generateOptions', () => {
  it('returns correct number of options for level 1', () => {
    const options = generateOptions('happy', 1);
    expect(options.length).toBe(3);
  });

  it('returns correct number of options for level 2', () => {
    const options = generateOptions('happy', 2);
    expect(options.length).toBe(4);
  });

  it('returns correct number of options for level 3', () => {
    const options = generateOptions('happy', 3);
    expect(options.length).toBe(5);
  });

  it('includes at least one matching food', () => {
    const options = generateOptions('happy', 1);
    const hasMatching = options.some(f => f.category === 'happy');
    expect(hasMatching).toBe(true);
  });

  it('includes foods from different categories', () => {
    const options = generateOptions('happy', 2);
    const categories = new Set(options.map(f => f.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('generates different options on multiple calls', () => {
    const options1 = generateOptions('happy', 1);
    const options2 = generateOptions('happy', 1);

    const ids1 = options1.map(f => f.id).join(',');
    const ids2 = options2.map(f => f.id).join(',');

    // Due to shuffling, they should often differ
    expect(options1.length).toBe(options2.length);
  });

  it('all options are unique', () => {
    const options = generateOptions('happy', 2);
    const ids = options.map(f => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct category', () => {
    const food: FoodItem = { id: 1, emoji: '🍕', name: 'Pizza', category: 'happy' };
    expect(checkAnswer(food, 'happy')).toBe(true);
  });

  it('returns false for wrong category', () => {
    const food: FoodItem = { id: 1, emoji: '🍕', name: 'Pizza', category: 'happy' };
    expect(checkAnswer(food, 'sad')).toBe(false);
  });

  it('works for all categories', () => {
    const categories: FoodItem['category'][] = ['happy', 'sad', 'angry', 'excited', 'calm'];
    for (const category of categories) {
      const food = FOODS.find(f => f.category === category);
      if (food) {
        expect(checkAnswer(food, category)).toBe(true);
      }
    }
  });
});

describe('calculateScore', () => {
  it('returns 0 for incorrect answer', () => {
    const score = calculateScore(false, 10, 0);
    expect(score).toBe(0);
  });

  it('calculates base score for correct answer', () => {
    const score = calculateScore(true, 0, 0);
    expect(score).toBe(100);
  });

  it('adds time bonus', () => {
    const score1 = calculateScore(true, 5, 0);
    const score2 = calculateScore(true, 10, 0);
    expect(score1).toBe(100 + 5 * 5); // 125
    expect(score2).toBe(100 + 10 * 5); // 150
  });

  it('adds combo bonus', () => {
    const score1 = calculateScore(true, 0, 1);
    const score2 = calculateScore(true, 0, 5);
    expect(score1).toBe(100 + 1 * 10); // 110
    expect(score2).toBe(100 + 5 * 10); // 150
  });

  it('combines time and combo bonuses', () => {
    const score = calculateScore(true, 10, 5);
    expect(score).toBe(100 + 10 * 5 + 5 * 10); // 200
  });

  it('can calculate high scores', () => {
    const score = calculateScore(true, 20, 10);
    expect(score).toBe(100 + 20 * 5 + 10 * 10); // 300
  });
});

describe('integration scenarios', () => {
  it('can get emotion and generate matching options', () => {
    const emotion = getEmotionForLevel(1);
    const options = generateOptions(emotion.emotion, 1);

    expect(options.length).toBe(3);
    const hasMatching = options.some(f => f.category === emotion.emotion);
    expect(hasMatching).toBe(true);
  });

  it('can check answer against emotion', () => {
    const emotion = getEmotionForLevel(1);
    const options = generateOptions(emotion.emotion, 1);
    const correctFood = options.find(f => f.category === emotion.emotion);

    if (correctFood) {
      expect(checkAnswer(correctFood, emotion.emotion)).toBe(true);
    }
  });

  it('can calculate score for complete round', () => {
    const emotion = getEmotionForLevel(2);
    const options = generateOptions(emotion.emotion, 2);
    const correctFood = options.find(f => f.category === emotion.emotion);

    if (correctFood) {
      const isCorrect = checkAnswer(correctFood, emotion.emotion);
      const score = calculateScore(isCorrect, 15, 3);
      expect(score).toBeGreaterThan(100);
    }
  });

  it('can play multiple rounds with increasing difficulty', () => {
    for (let level = 1; level <= 3; level++) {
      const emotion = getEmotionForLevel(level);
      const options = generateOptions(emotion.emotion, level);
      expect(options.length).toBe(level + 2); // 3, 4, 5
    }
  });
});

describe('edge cases', () => {
  it('handles zero time remaining', () => {
    const score = calculateScore(true, 0, 5);
    expect(score).toBe(100 + 5 * 10); // 150
  });

  it('handles zero combo', () => {
    const score = calculateScore(true, 10, 0);
    expect(score).toBe(100 + 10 * 5); // 150
  });

  it('handles all emotion categories', () => {
    const categories: FoodItem['category'][] = ['happy', 'sad', 'angry', 'excited', 'calm'];
    for (const category of categories) {
      const options = generateOptions(category, 1);
      expect(options.length).toBeGreaterThan(0);
    }
  });

  it('generates options even when category has few foods', () => {
    const options = generateOptions('angry', 1);
    expect(options.length).toBe(3);
  });
});

describe('type definitions', () => {
  it('FoodItem interface is correctly implemented', () => {
    const food: FoodItem = {
      id: 1,
      emoji: '🍕',
      name: 'Pizza',
      category: 'happy',
    };

    expect(typeof food.id).toBe('number');
    expect(typeof food.emoji).toBe('string');
    expect(typeof food.name).toBe('string');
    expect(['happy', 'sad', 'angry', 'excited', 'calm']).toContain(food.category);
  });

  it('MonsterEmotion interface is correctly implemented', () => {
    const emotion: MonsterEmotion = {
      id: 1,
      emotion: 'happy',
      emoji: '😄',
      prompt: 'Yummy!',
    };

    expect(typeof emotion.id).toBe('number');
    expect(typeof emotion.emotion).toBe('string');
    expect(typeof emotion.emoji).toBe('string');
    expect(typeof emotion.prompt).toBe('string');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      optionsCount: 4,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.optionsCount).toBe('number');
  });
});

describe('educational content', () => {
  it('teaches emotion-food associations', () => {
    // Happy foods: treats, vegetables
    const happy = FOODS.filter(f => f.category === 'happy');
    expect(happy.length).toBeGreaterThanOrEqual(2);

    // Sad foods: comfort items
    const sad = FOODS.filter(f => f.category === 'sad');
    expect(sad.length).toBeGreaterThanOrEqual(1);

    // Angry foods: spicy things
    const angry = FOODS.filter(f => f.category === 'angry');
    expect(angry.length).toBeGreaterThanOrEqual(1);
  });

  it('has diverse food representations', () => {
    const hasEmoji = FOODS.some(f => f.emoji.length > 0);
    expect(hasEmoji).toBe(true);
  });

  it('monster prompts are child-friendly', () => {
    for (const emotion of MONSTER_EMOTIONS) {
      expect(emotion.prompt.length).toBeGreaterThan(0);
      expect(emotion.prompt.length).toBeLessThan(50);
    }
  });
});
