/**
 * Spelling Run Logic Tests
 *
 * Tests for the word spelling runner game logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GRAVITY,
  JUMP_FORCE,
  PLAYER_SPEED,
  SPAWN_DISTANCE,
  initializeGame,
  spawnItems,
  updatePhysics,
  checkCollisions,
  type GameState,
  type Letter,
  type Platform,
  type Enemy,
} from '../spellingRunLogic';

describe('Constants', () => {
  it('should have defined gravity', () => {
    expect(GRAVITY).toBe(0.5);
  });

  it('should have defined jump force', () => {
    expect(JUMP_FORCE).toBe(-12);
  });

  it('should have defined player speed', () => {
    expect(PLAYER_SPEED).toBe(5);
  });

  it('should have defined spawn distance', () => {
    expect(SPAWN_DISTANCE).toBe(300);
  });
});

describe('initializeGame', () => {
  it('should create idle status initially', () => {
    const state = initializeGame(1);
    expect(state.status).toBe('idle');
  });

  it('should initialize player at starting position', () => {
    const state = initializeGame(1);
    expect(state.player.x).toBe(100);
    expect(state.player.y).toBe(400);
    expect(state.player.vy).toBe(0);
    expect(state.player.isJumping).toBe(false);
  });

  it('should have correct player dimensions', () => {
    const state = initializeGame(1);
    expect(state.player.width).toBe(50);
    expect(state.player.height).toBe(50);
  });

  it('should start with empty word', () => {
    const state = initializeGame(1);
    expect(state.currentWord).toBe('');
  });

  it('should start with zero score', () => {
    const state = initializeGame(1);
    expect(state.score).toBe(0);
  });

  it('should have initial platform', () => {
    const state = initializeGame(1);
    expect(state.platforms.length).toBeGreaterThan(0);
    expect(state.platforms[0].x).toBe(0);
    expect(state.platforms[0].y).toBe(500);
  });

  it('should select CVC word for level 1', () => {
    const state = initializeGame(1);
    const cvcWords = ['CAT', 'DOG', 'HAT', 'BAT', 'SUN', 'BUS', 'PIG', 'BOX'];
    expect(cvcWords).toContain(state.targetWord);
  });

  it('should select medium word for level 2', () => {
    const state = initializeGame(2);
    const mediumWords = ['FROG', 'BIRD', 'FISH', 'JUMP', 'PLAY', 'STAR', 'BLUE'];
    expect(mediumWords).toContain(state.targetWord);
  });

  it('should select hard word for level 3', () => {
    const state = initializeGame(3);
    const hardWords = ['APPLE', 'BANANA', 'CHERRY', 'ORANGE', 'PURPLE', 'GARDEN'];
    expect(hardWords).toContain(state.targetWord);
  });

  it('should spawn letters and enemies', () => {
    const state = initializeGame(1);
    expect(state.letters.length).toBeGreaterThan(0);
  });

  it('should have letters for each character in target word', () => {
    const state = initializeGame(1);
    const correctLetters = state.letters.filter(l => l.isCorrect);
    expect(correctLetters.length).toBe(state.targetWord.length);
  });

  it('should have distractor letters', () => {
    const state = initializeGame(1);
    const distractors = state.letters.filter(l => !l.isCorrect);
    expect(distractors.length).toBe(state.targetWord.length);
  });
});

describe('spawnItems', () => {
  it('should spawn correct letters in target word order', () => {
    const state: GameState = {
      status: 'idle',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = spawnItems(state);

    const correctLetters = result.letters.filter(l => l.isCorrect);
    expect(correctLetters[0].char).toBe('C');
    expect(correctLetters[1].char).toBe('A');
    expect(correctLetters[2].char).toBe('T');
  });

  it('should spawn distractor letters', () => {
    const state: GameState = {
      status: 'idle',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'DOG',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = spawnItems(state);

    const distractors = result.letters.filter(l => !l.isCorrect);
    expect(distractors.length).toBe(3); // One distractor per letter
  });

  it('should add platforms near letters', () => {
    const state: GameState = {
      status: 'idle',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = spawnItems(state);

    // Should have initial platform plus one per letter
    expect(result.platforms.length).toBe(1 + 3);
  });

  it('should mark correct letters with isCorrect flag', () => {
    const state: GameState = {
      status: 'idle',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'SUN',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = spawnItems(state);

    result.letters.forEach(letter => {
      if (letter.id.startsWith('l-')) {
        expect(letter.isCorrect).toBe(true);
      } else if (letter.id.startsWith('d-')) {
        expect(letter.isCorrect).toBe(false);
      }
    });
  });
});

describe('updatePhysics', () => {
  it('should not update when not playing', () => {
    const state: GameState = {
      status: 'idle',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = updatePhysics(state);
    expect(result.player.x).toBe(100);
    expect(result.player.y).toBe(400);
  });

  it('should apply gravity to player', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 600, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = updatePhysics(state, 1);
    expect(result.player.vy).toBe(GRAVITY);
    expect(result.player.y).toBe(400 + GRAVITY);
  });

  it('should move player horizontally', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = updatePhysics(state, 1);
    expect(result.player.x).toBe(100 + PLAYER_SPEED);
  });

  it('should detect platform collision', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 10, isJumping: true, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 450, width: 2000, height: 20 }],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = updatePhysics(state, 1);
    expect(result.player.y).toBe(450 - 50); // On top of platform
    expect(result.player.vy).toBe(0);
    expect(result.player.isJumping).toBe(false);
  });

  it('should fail when player falls below threshold', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 795, vy: 10, isJumping: false, width: 50, height: 50 },
      platforms: [],
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = updatePhysics(state, 1);
    expect(result.status).toBe('failed');
  });

  it('should scale with deltaTimeRatio', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 600, width: 2000, height: 100 }], // Platform below to avoid collision
      letters: [],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = updatePhysics(state, 2);
    // Gravity is applied first: vy = 0 + 0.5 * 2 = 1
    // Then position: y = 400 + 1 * 2 = 402
    expect(result.player.x).toBe(100 + PLAYER_SPEED * 2);
    expect(result.player.y).toBe(400 + GRAVITY * 2 * 2); // Gravity * deltaTimeRatio²
  });
});

describe('checkCollisions', () => {
  it('should collect correct letter', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-0', char: 'C', x: 125, y: 425, isCollected: false, isCorrect: true },
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.currentWord).toBe('C');
    expect(result.score).toBe(100);
    expect(result.letters[0].isCollected).toBe(true);
  });

  it('should ignore already collected letters', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-0', char: 'C', x: 125, y: 425, isCollected: true, isCorrect: true },
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.currentWord).toBe('');
    expect(result.score).toBe(0);
  });

  it('should penalize wrong letter collection', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'd-0', char: 'X', x: 125, y: 425, isCollected: false, isCorrect: false },
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: 'C',
      score: 100,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.score).toBe(50); // 100 - 50 penalty
    expect(result.letters[0].isCollected).toBe(true);
  });

  it('should not penalize below zero', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'd-0', char: 'X', x: 125, y: 425, isCollected: false, isCorrect: false },
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.score).toBe(0); // Should not go below 0
  });

  it('should complete game when word is finished', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-2', char: 'T', x: 125, y: 425, isCollected: false, isCorrect: true },
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: 'CA',
      score: 200,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.status).toBe('complete');
    expect(result.currentWord).toBe('CAT');
  });

  it('should only collect next correct letter in sequence', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-1', char: 'A', x: 125, y: 425, isCollected: false, isCorrect: true },
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    // 'A' is not the next letter (should be 'C'), so word should not advance
    expect(result.currentWord).toBe('');
  });

  it('should detect collision within 40px distance', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-0', char: 'C', x: 135, y: 425, isCollected: false, isCorrect: true }, // At edge of 40px range
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.letters[0].isCollected).toBe(true);
  });

  it('should not collect letters beyond 40px distance', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-0', char: 'C', x: 170, y: 425, isCollected: false, isCorrect: true }, // Just beyond 40px
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    expect(result.letters[0].isCollected).toBe(false);
  });

  it('should use player center for collision detection', () => {
    const state: GameState = {
      status: 'playing',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [{ id: 1, x: 0, y: 500, width: 2000, height: 100 }],
      letters: [
        { id: 'l-0', char: 'C', x: 125, y: 425, isCollected: false, isCorrect: true }, // Center to center distance
      ],
      enemies: [],
      targetWord: 'CAT',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };

    const result = checkCollisions(state);
    // Player center is (125, 425), letter is at (125, 425), distance = 0
    expect(result.letters[0].isCollected).toBe(true);
  });
});

describe('Type Safety', () => {
  it('should accept GameState type', () => {
    const state: GameState = {
      status: 'idle',
      player: { x: 100, y: 400, vy: 0, isJumping: false, width: 50, height: 50 },
      platforms: [],
      letters: [],
      enemies: [],
      targetWord: 'TEST',
      currentWord: '',
      score: 0,
      level: 1,
      scrollX: 0,
    };
    expect(typeof state.status).toBe('string');
  });

  it('should accept Letter type', () => {
    const letter: Letter = {
      id: 'test-1',
      char: 'A',
      x: 100,
      y: 200,
      isCollected: false,
      isCorrect: true,
    };
    expect(letter.char).toBe('A');
  });

  it('should accept Platform type', () => {
    const platform: Platform = {
      id: 1,
      x: 100,
      y: 200,
      width: 50,
      height: 20,
    };
    expect(platform.x).toBe(100);
  });

  it('should accept Enemy type', () => {
    const enemy: Enemy = {
      id: 1,
      x: 100,
      y: 200,
      type: 'slime',
    };
    expect(enemy.type).toBe('slime');
  });
});

describe('Integration - Game Flow', () => {
  it('should complete full game flow', () => {
    let state = initializeGame(1);
    state.status = 'playing';

    // Simulate collecting letters one by one
    const word = state.targetWord;
    for (let i = 0; i < word.length; i++) {
      // Find the correct letter
      const letterIndex = state.letters.findIndex(
        l => l.char === word[i] && l.isCorrect && !l.isCollected
      );

      if (letterIndex !== -1) {
        // Move player to the letter
        state.player.x = state.letters[letterIndex].x - 25;
        state.player.y = state.letters[letterIndex].y - 25;

        // Check collision
        state = checkCollisions(state);
      }
    }

    expect(state.status).toBe('complete');
    expect(state.currentWord).toBe(state.targetWord);
  });
});
