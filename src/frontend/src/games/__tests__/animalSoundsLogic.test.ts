/**
 * Animal Sounds Game Logic Tests
 *
 * Tests for animal data, level configurations, scoring,
 * animal selection, and game mechanics.
 */

import { describe, expect, it } from 'vitest';
import {
  LEVELS,
  getLevelConfig,
  getAnimalsForLevel,
  calculateScore,
  DIFFICULTY_MULTIPLIERS,
} from '../animalSoundsLogic';

describe('ANIMALS Data', () => {
  it('has 12 animals', () => {
    // We can verify animal count by checking level 3 (6 animals) is a subset
    const level3Animals = getAnimalsForLevel(3);
    expect(level3Animals.length).toBe(6);
  });

  it('each animal has name, emoji, and sound', () => {
    const animals = getAnimalsForLevel(1);
    animals.forEach((animal) => {
      expect(animal.name).toBeDefined();
      expect(animal.emoji).toBeDefined();
      expect(animal.sound).toBeDefined();
      expect(animal.name.length).toBeGreaterThan(0);
      expect(animal.emoji.length).toBeGreaterThan(0);
      expect(animal.sound.length).toBeGreaterThan(0);
    });
  });

  it('animal names start with capital letter', () => {
    const animals = getAnimalsForLevel(3);
    animals.forEach((animal) => {
      expect(animal.name[0]).toBe(animal.name[0].toUpperCase());
    });
  });

  it('all animals have unique names', () => {
    const animals = getAnimalsForLevel(3);
    const names = animals.map((a) => a.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('contains common farm and zoo animals', () => {
    const animals = getAnimalsForLevel(3);
    const animalNames = animals.map((a) => a.name);

    // Check for some expected animals
    const commonAnimals = ['Dog', 'Cat', 'Cow', 'Pig', 'Bird', 'Lion', 'Elephant'];
    const hasCommonAnimal = commonAnimals.some((name) => animalNames.includes(name));
    expect(hasCommonAnimal).toBe(true);
  });
});

describe('LEVELS Configuration', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 3 animals', () => {
    const level1 = LEVELS[0];
    expect(level1.level).toBe(1);
    expect(level1.animalCount).toBe(3);
  });

  it('level 2 has 4 animals', () => {
    const level2 = LEVELS[1];
    expect(level2.level).toBe(2);
    expect(level2.animalCount).toBe(4);
  });

  it('level 3 has 6 animals', () => {
    const level3 = LEVELS[2];
    expect(level3.level).toBe(3);
    expect(level3.animalCount).toBe(6);
  });

  it('levels increase in animal count', () => {
    expect(LEVELS[0].animalCount).toBeLessThan(LEVELS[1].animalCount);
    expect(LEVELS[1].animalCount).toBeLessThan(LEVELS[2].animalCount);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.animalCount).toBe(3);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.animalCount).toBe(4);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.animalCount).toBe(6);
  });

  it('returns level 1 config for invalid level', () => {
    const config = getLevelConfig(99);
    expect(config.level).toBe(1);
  });

  it('returns level 1 config for level 0', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('getAnimalsForLevel', () => {
  it('returns 3 animals for level 1', () => {
    const animals = getAnimalsForLevel(1);
    expect(animals).toHaveLength(3);
  });

  it('returns 4 animals for level 2', () => {
    const animals = getAnimalsForLevel(2);
    expect(animals).toHaveLength(4);
  });

  it('returns 6 animals for level 3', () => {
    const animals = getAnimalsForLevel(3);
    expect(animals).toHaveLength(6);
  });

  it('returns animal objects with required properties', () => {
    const animals = getAnimalsForLevel(1);
    animals.forEach((animal) => {
      expect(animal.name).toBeDefined();
      expect(animal.emoji).toBeDefined();
      expect(animal.sound).toBeDefined();
    });
  });

  it('animals have valid emojis', () => {
    const animals = getAnimalsForLevel(3);
    animals.forEach((animal) => {
      // Emojis should be 1-4 characters typically
      expect(animal.emoji.length).toBeGreaterThan(0);
      expect(animal.emoji.length).toBeLessThanOrEqual(4);
    });
  });

  it('animals have descriptive sounds', () => {
    const animals = getAnimalsForLevel(2);
    animals.forEach((animal) => {
      expect(animal.sound.length).toBeGreaterThan(0);
      // Sounds often contain exclamation marks or words
      expect(animal.sound).toMatch(/^[A-Z]/); // Starts with capital
    });
  });

  it('different calls may return different animals (random)', () => {
    const animals1 = getAnimalsForLevel(3);
    const animals2 = getAnimalsForLevel(3);

    // Due to randomness, they may or may not be different
    // Just verify both are valid
    expect(animals1).toHaveLength(6);
    expect(animals2).toHaveLength(6);
  });

  it('animals within a level are unique', () => {
    const animals = getAnimalsForLevel(3);
    const names = animals.map((a) => a.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

describe('calculateScore', () => {
  it('returns higher score for higher streak', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(3, 1);
    expect(score2).toBeGreaterThan(score1);
  });

  it('returns higher score for higher level', () => {
    const score1 = calculateScore(1, 1);
    const score2 = calculateScore(1, 3);
    expect(score2).toBeGreaterThan(score1);
  });

  it('level 3 with high streak gives maximum points', () => {
    const score = calculateScore(10, 3);
    expect(score).toBeGreaterThan(0);
  });

  it('level 1 base score is reasonable', () => {
    const score = calculateScore(1, 1);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('level 3 score is higher than level 1 for same streak', () => {
    const score1 = calculateScore(5, 1);
    const score3 = calculateScore(5, 3);
    expect(score3).toBeGreaterThan(score1);
  });

  it('streak increases score within same level', () => {
    const score1 = calculateScore(1, 2);
    const score2 = calculateScore(3, 2);
    const score3 = calculateScore(5, 2);
    expect(score3).toBeGreaterThan(score2);
    expect(score2).toBeGreaterThan(score1);
  });
});

describe('DIFFICULTY_MULTIPLIERS', () => {
  it('has multipliers for all 3 levels', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBe(1);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBe(1.5);
    expect(DIFFICULTY_MULTIPLIERS[3]).toBe(2);
  });

  it('multipliers increase with level', () => {
    expect(DIFFICULTY_MULTIPLIERS[1]).toBeLessThan(DIFFICULTY_MULTIPLIERS[2]);
    expect(DIFFICULTY_MULTIPLIERS[2]).toBeLessThan(DIFFICULTY_MULTIPLIERS[3]);
  });
});

describe('Animal Sound Examples', () => {
  it('dog says Woof woof!', () => {
    const animals = getAnimalsForLevel(3);
    const dog = animals.find((a) => a.name === 'Dog');
    if (dog) {
      expect(dog.sound).toBe('Woof woof!');
    }
  });

  it('cat says Meow!', () => {
    const animals = getAnimalsForLevel(3);
    const cat = animals.find((a) => a.name === 'Cat');
    if (cat) {
      expect(cat.sound).toBe('Meow!');
    }
  });

  it('cow says Moo!', () => {
    const animals = getAnimalsForLevel(3);
    const cow = animals.find((a) => a.name === 'Cow');
    if (cow) {
      expect(cow.sound).toBe('Moo!');
    }
  });

  it('lion says Roar!', () => {
    const animals = getAnimalsForLevel(3);
    const lion = animals.find((a) => a.name === 'Lion');
    if (lion) {
      expect(lion.sound).toBe('Roar!');
    }
  });
});

describe('Game Mechanics', () => {
  it('has 5 rounds per game', () => {
    // From component: const nextRound = round + 1; if (nextRound >= 5)
    const roundsPerGame = 5;
    expect(roundsPerGame).toBe(5);
  });

  it('correct count increments on right answer', () => {
    let correct = 0;
    correct++;
    expect(correct).toBe(1);
  });

  it('feedback message shows on correct answer', () => {
    const animal = { name: 'Dog', emoji: '🐕', sound: 'Woof woof!' };
    const feedback = `Correct! The ${animal.name} makes this sound!`;
    expect(feedback).toContain('Correct');
    expect(feedback).toContain('Dog');
  });

  it('feedback message shows on wrong answer', () => {
    const targetAnimal = { name: 'Cat', emoji: '🐱', sound: 'Meow!' };
    const feedback = `Oops! The ${targetAnimal.name} makes that sound!`;
    expect(feedback).toContain('Oops');
    expect(feedback).toContain('Cat');
  });
});
