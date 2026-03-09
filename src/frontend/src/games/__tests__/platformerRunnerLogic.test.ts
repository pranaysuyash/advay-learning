/**
 * Platformer Runner - Game Logic Tests
 *
 * @spec docs/games/platformer-runner-spec.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  GRAVITY,
  JUMP_VELOCITY,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  HAND_RAISE_THRESHOLD,
  HAND_LOWER_THRESHOLD,
  COIN_SIZE,
  STAR_SIZE,
  SLIME_SPEED,
  COIN_POINTS,
  STAR_POINTS,
  STREAK_MULTIPLIER,
  MAX_STREAK_BONUS,
  STREAK_MILESTONE_INTERVAL,
  COLLISION_MARGIN,
  checkCollision,
  createPlayer,
  applyGravity,
  updatePlayerPosition,
  applyGroundCollision,
  canJump,
  jump,
  isHandRaised,
  isHandLowered,
  updateJumpState,
  calculateCollectiblePoints,
  isStreakMilestone,
  generateId,
  resetIdCounter,
  createCollectible,
  createEnemy,
  updateEnemy,
  calculateCameraX,
  calculateCleanupThreshold,
  isObjectOffScreen,
  type Player,
  type Rect,
} from '../platformerRunnerLogic';

describe('Platformer Runner - Game Logic', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('Constants', () => {
    it('should have defined canvas dimensions', () => {
      expect(CANVAS_WIDTH).toBe(800);
      expect(CANVAS_HEIGHT).toBe(600);
    });

    it('should have defined ground position', () => {
      expect(GROUND_Y).toBe(480);
    });

    it('should have defined physics constants', () => {
      expect(GRAVITY).toBe(0.8);
      expect(JUMP_VELOCITY).toBe(-16);
    });

    it('should have defined player dimensions', () => {
      expect(PLAYER_WIDTH).toBe(48);
      expect(PLAYER_HEIGHT).toBe(64);
    });

    it('should have defined hand gesture thresholds', () => {
      expect(HAND_RAISE_THRESHOLD).toBe(0.4);
      expect(HAND_LOWER_THRESHOLD).toBe(0.6);
    });

    it('should have defined scoring constants', () => {
      expect(COIN_POINTS).toBe(10);
      expect(STAR_POINTS).toBe(50);
      expect(STREAK_MULTIPLIER).toBe(2);
      expect(MAX_STREAK_BONUS).toBe(15);
    });
  });

  describe('Player Physics', () => {
    it('should create player at starting position', () => {
      const player = createPlayer();
      expect(player.x).toBe(100);
      expect(player.y).toBe(GROUND_Y - PLAYER_HEIGHT);
      expect(player.vx).toBe(PLAYER_SPEED);
      expect(player.vy).toBe(0);
      expect(player.onGround).toBe(true);
    });

    it('should create player at custom x position', () => {
      const player = createPlayer(500);
      expect(player.x).toBe(500);
      expect(player.y).toBe(GROUND_Y - PLAYER_HEIGHT);
    });

    it('should apply gravity to velocity', () => {
      const vy = 0;
      const newVy = applyGravity(vy, 1);
      expect(newVy).toBe(GRAVITY);
    });

    it('should apply gravity with dt normalization', () => {
      const vy = 0;
      const newVy = applyGravity(vy, 2);
      expect(newVy).toBe(GRAVITY * 2);
    });

    it('should update player position based on velocity', () => {
      const player: Player = {
        x: 100,
        y: 400,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 10,
        vy: 5,
        onGround: false,
      };
      const updated = updatePlayerPosition(player, 1);
      expect(updated.x).toBe(110);
      expect(updated.y).toBe(405);
    });

    it('should apply ground collision when player falls through ground', () => {
      const player: Player = {
        x: 100,
        y: GROUND_Y - 30, // Below ground
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 10,
        onGround: false,
      };
      const result = applyGroundCollision(player);
      expect(result.y).toBe(GROUND_Y - PLAYER_HEIGHT);
      expect(result.vy).toBe(0);
      expect(result.onGround).toBe(true);
    });

    it('should not modify player already on ground', () => {
      const player: Player = {
        x: 100,
        y: GROUND_Y - PLAYER_HEIGHT,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 0,
        onGround: true,
      };
      const result = applyGroundCollision(player);
      expect(result.y).toBe(GROUND_Y - PLAYER_HEIGHT);
      expect(result.onGround).toBe(true);
    });

    it('should not modify player in air', () => {
      const player: Player = {
        x: 100,
        y: 300,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 0,
        onGround: false,
      };
      const result = applyGroundCollision(player);
      expect(result.y).toBe(300);
      expect(result.onGround).toBe(false);
    });

    it('should check if player can jump', () => {
      const playerOnGround: Player = {
        x: 100,
        y: GROUND_Y - PLAYER_HEIGHT,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 0,
        onGround: true,
      };
      expect(canJump(playerOnGround)).toBe(true);

      const playerInAir: Player = {
        x: 100,
        y: GROUND_Y - PLAYER_HEIGHT - 50,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: -5,
        onGround: false,
      };
      expect(canJump(playerInAir)).toBe(false);
    });

    it('should make player jump when on ground', () => {
      const player: Player = {
        x: 100,
        y: GROUND_Y - PLAYER_HEIGHT,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 0,
        onGround: true,
      };
      const result = jump(player);
      expect(result.vy).toBe(JUMP_VELOCITY);
    });

    it('should not jump when player is in air', () => {
      const player: Player = {
        x: 100,
        y: GROUND_Y - PLAYER_HEIGHT - 100,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 0,
        onGround: false,
      };
      const result = jump(player);
      expect(result.vy).toBe(0);
    });
  });

  describe('Hand Gesture Detection', () => {
    it('should detect hand is raised when y is less than threshold', () => {
      expect(isHandRaised(0.3)).toBe(true);
      expect(isHandRaised(0.39)).toBe(true);
    });

    it('should not detect hand is raised when y is above threshold', () => {
      expect(isHandRaised(0.4)).toBe(false);
      expect(isHandRaised(0.5)).toBe(false);
      expect(isHandRaised(0.7)).toBe(false);
    });

    it('should detect hand is lowered when y is greater than threshold', () => {
      expect(isHandLowered(0.7)).toBe(true);
      expect(isHandLowered(0.61)).toBe(true);
    });

    it('should not detect hand is lowered when y is below threshold', () => {
      expect(isHandLowered(0.6)).toBe(false);
      expect(isHandLowered(0.5)).toBe(false);
      expect(isHandLowered(0.3)).toBe(false);
    });

    it('should trigger jump when hand is raised and can jump', () => {
      const result = updateJumpState(0.3, true);
      expect(result.canJump).toBe(false);
      expect(result.shouldJump).toBe(true);
    });

    it('should not trigger jump when hand is raised but cannot jump', () => {
      const result = updateJumpState(0.3, false);
      expect(result.canJump).toBe(false);
      expect(result.shouldJump).toBe(false);
    });

    it('should reset jump ability when hand is lowered', () => {
      const result = updateJumpState(0.7, false);
      expect(result.canJump).toBe(true);
      expect(result.shouldJump).toBe(false);
    });

    it('should maintain state when hand is in middle position', () => {
      const result = updateJumpState(0.5, false);
      expect(result.canJump).toBe(false);
      expect(result.shouldJump).toBe(false);
    });

    it('should reset jump ability when hand is lost', () => {
      const result = updateJumpState(null, false);
      expect(result.canJump).toBe(true);
      expect(result.shouldJump).toBe(false);
    });
  });

  describe('Collision Detection', () => {
    it('should detect collision between overlapping rectangles', () => {
      const r1: Rect = { x: 0, y: 0, w: 50, h: 50 };
      const r2: Rect = { x: 25, y: 25, w: 50, h: 50 };
      expect(checkCollision(r1, r2)).toBe(true);
    });

    it('should detect collision when rectangles touch at edges', () => {
      const r1: Rect = { x: 0, y: 0, w: 50, h: 50 };
      const r2: Rect = { x: 48, y: 48, w: 50, h: 50 };
      // margin=0.98 → hitbox is 98% of rect size (large) → detects the 1px overlap → collides
      expect(checkCollision(r1, r2, 0.98)).toBe(true);
      // margin=0.8 → hitbox is 80% of rect size (tight) → shrinks rect inward, gap appears → no collision
      expect(checkCollision(r1, r2, 0.8)).toBe(false);
    });

    it('should not detect collision for non-overlapping rectangles', () => {
      const r1: Rect = { x: 0, y: 0, w: 50, h: 50 };
      const r2: Rect = { x: 100, y: 100, w: 50, h: 50 };
      expect(checkCollision(r1, r2)).toBe(false);
    });

    it('should use forgiving margin by default', () => {
      const r1: Rect = { x: 0, y: 0, w: 50, h: 50 };
      const r2: Rect = { x: 40, y: 40, w: 50, h: 50 };
      // With 0.6 margin, effective size is 30x30
      // r1: 10,10 to 40,40
      // r2: 50,50 to 80,80
      // These don't overlap with margin
      expect(checkCollision(r1, r2, 0.6)).toBe(false);
    });
  });

  describe('Scoring', () => {
    it('should calculate base coin points without streak', () => {
      const points = calculateCollectiblePoints('coin', 0);
      expect(points).toBe(COIN_POINTS);
    });

    it('should calculate base star points without streak', () => {
      const points = calculateCollectiblePoints('star', 0);
      expect(points).toBe(STAR_POINTS);
    });

    it('should add streak bonus to coin points', () => {
      const points = calculateCollectiblePoints('coin', 5);
      expect(points).toBe(COIN_POINTS + 10); // 10 + (5 * 2)
    });

    it('should add streak bonus to star points', () => {
      const points = calculateCollectiblePoints('star', 3);
      expect(points).toBe(STAR_POINTS + 6); // 50 + (3 * 2)
    });

    it('should cap streak bonus at maximum', () => {
      const points = calculateCollectiblePoints('coin', 20);
      const expected = COIN_POINTS + MAX_STREAK_BONUS;
      expect(points).toBe(expected);
    });

    it('should check streak milestone intervals', () => {
      expect(isStreakMilestone(5)).toBe(true);
      expect(isStreakMilestone(10)).toBe(true);
      expect(isStreakMilestone(15)).toBe(true);
      expect(isStreakMilestone(3)).toBe(false);
      expect(isStreakMilestone(0)).toBe(false);
    });
  });

  describe('Game Objects', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should create coin collectible', () => {
      const coin = createCollectible(100, 200, 'coin');
      expect(coin.type).toBe('coin');
      expect(coin.x).toBe(100);
      expect(coin.y).toBe(200);
      expect(coin.w).toBe(COIN_SIZE);
      expect(coin.h).toBe(COIN_SIZE);
      expect(coin.active).toBe(true);
    });

    it('should create star collectible', () => {
      const star = createCollectible(100, 200, 'star');
      expect(star.type).toBe('star');
      expect(star.w).toBe(STAR_SIZE);
      expect(star.h).toBe(STAR_SIZE);
    });

    it('should default to coin type', () => {
      const collectible = createCollectible(100, 200);
      expect(collectible.type).toBe('coin');
    });

    it('should create enemy at ground level', () => {
      const enemy = createEnemy(500);
      expect(enemy.type).toBe('slime');
      expect(enemy.x).toBe(500);
      expect(enemy.y).toBe(GROUND_Y - 32); // SLIME_HEIGHT = 32
      expect(enemy.vx).toBe(SLIME_SPEED);
      expect(enemy.active).toBe(true);
    });

    it('should update enemy position', () => {
      const enemy = createEnemy(500);
      const updated = updateEnemy(enemy, 1);
      expect(updated.x).toBe(500 + SLIME_SPEED); // 500 - 1 = 499
    });
  });

  describe('Camera', () => {
    it('should calculate camera position relative to player', () => {
      expect(calculateCameraX(100)).toBe(-100);
      expect(calculateCameraX(500)).toBe(300);
      expect(calculateCameraX(1000)).toBe(800);
    });

    it('should calculate cleanup threshold behind camera', () => {
      expect(calculateCleanupThreshold(0)).toBe(-200);
      expect(calculateCleanupThreshold(500)).toBe(300);
      expect(calculateCleanupThreshold(1000)).toBe(800);
    });

    it('should detect objects off-screen', () => {
      const enemy = createEnemy(0);
      // Camera at 0: cleanup threshold is -200, enemy at 0 is on screen (200px buffer)
      expect(isObjectOffScreen(enemy, 0)).toBe(false);
      // Camera at 100: cleanup threshold is -100, enemy at 0 is on screen
      expect(isObjectOffScreen(enemy, 100)).toBe(false);
      // Camera at 300: cleanup threshold is 100, enemy at 0 is off screen
      expect(isObjectOffScreen(enemy, 300)).toBe(true);
    });

    it('should keep objects on-screen when ahead of camera', () => {
      const enemy = createEnemy(500);
      // Camera at 0: cleanup threshold is -200, enemy at 500 is on screen
      expect(isObjectOffScreen(enemy, 0)).toBe(false);
      // Camera at 300: cleanup threshold is 100, enemy at 500 is on screen
      expect(isObjectOffScreen(enemy, 300)).toBe(false);
      // Camera at 700: cleanup threshold is 500, enemy at 500 is off screen (edge case)
      expect(isObjectOffScreen(enemy, 701)).toBe(true);
      // Camera at 800: cleanup threshold is 600, enemy at 500 is off screen
      expect(isObjectOffScreen(enemy, 800)).toBe(true);
    });
  });

  describe('Physics Integration', () => {
    it('should simulate jump arc correctly', () => {
      let player = createPlayer();

      // Jump
      player = jump(player);
      expect(player.vy).toBe(JUMP_VELOCITY);

      // First frame: apply gravity and move
      player.vy = applyGravity(player.vy, 1);
      player = updatePlayerPosition(player, 1);
      expect(player.y).toBeLessThan(GROUND_Y - PLAYER_HEIGHT);

      // Second frame: more gravity
      player.vy = applyGravity(player.vy, 1);
      player = updatePlayerPosition(player, 1);
      expect(player.vy).toBeGreaterThan(JUMP_VELOCITY);

      // Eventually land back on ground
      let frames = 0;
      while (player.y < GROUND_Y - PLAYER_HEIGHT && frames < 100) {
        player.vy = applyGravity(player.vy, 1);
        player = updatePlayerPosition(player, 1);
        player = applyGroundCollision(player);
        frames++;
      }

      expect(player.onGround).toBe(true);
      expect(player.y).toBe(GROUND_Y - PLAYER_HEIGHT);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative dt gracefully', () => {
      const player: Player = {
        x: 100,
        y: 400,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 5,
        onGround: false,
      };
      const updated = updatePlayerPosition(player, -1);
      expect(updated.x).toBe(95);
      expect(updated.y).toBe(395);
    });

    it('should handle zero dt', () => {
      const player: Player = {
        x: 100,
        y: 400,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        vx: 5,
        vy: 5,
        onGround: false,
      };
      const updated = updatePlayerPosition(player, 0);
      expect(updated.x).toBe(100);
      expect(updated.y).toBe(400);
    });

    it('should handle very large dt (lag prevention)', () => {
      const vy = 0;
      const newVy = applyGravity(vy, 100); // Simulate lag
      expect(newVy).toBe(GRAVITY * 100);
    });
  });
});
