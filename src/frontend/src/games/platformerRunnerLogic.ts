/**
 * Platformer Runner - Game Logic Module
 *
 * Core game logic for the endless runner platformer.
 *
 * @spec docs/games/platformer-runner-spec.md
 */

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────────

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GROUND_Y = 480; // 600 - 120 (ground offset)
export const GRAVITY = 0.8;
export const JUMP_VELOCITY = -16;
export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 64;
export const PLAYER_SPEED = 5;
export const HAND_RAISE_THRESHOLD = 0.4;
export const HAND_LOWER_THRESHOLD = 0.6;

// Collectibles
export const COIN_SIZE = 32;
export const STAR_SIZE = 32;
export const SLIME_WIDTH = 48;
export const SLIME_HEIGHT = 32;
export const COIN_POINTS = 10;
export const STAR_POINTS = 50;
export const STREAK_MULTIPLIER = 2;
export const MAX_STREAK_BONUS = 15;
export const STREAK_MILESTONE_INTERVAL = 5;

// Enemies
export const SLIME_SPEED = -1;

// Collision
export const COLLISION_MARGIN = 0.6;

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  onGround: boolean;
}

export interface GameObject extends Rect {
  id: number;
  type: 'coin' | 'star' | 'slime';
  vx: number;
  vy: number;
  active: boolean;
}

export interface Collectible extends GameObject {
  type: 'coin' | 'star';
}

export interface Enemy extends GameObject {
  type: 'slime';
}

// ─── COLLISION DETECTION ───────────────────────────────────────────────────────────

/**
 * Check collision between two rectangles with margin for forgiving hitboxes
 */
export function checkCollision(r1: Rect, r2: Rect, margin = COLLISION_MARGIN): boolean {
  const mw = r1.w * (1 - margin);
  const mh = r1.h * (1 - margin);
  const r1Shrunken = {
    x: r1.x + mw / 2,
    y: r1.y + mh / 2,
    w: r1.w * margin,
    h: r1.h * margin,
  };
  const r2mw = r2.w * (1 - margin);
  const r2mh = r2.h * (1 - margin);
  const r2Shrunken = {
    x: r2.x + r2mw / 2,
    y: r2.y + r2mh / 2,
    w: r2.w * margin,
    h: r2.h * margin,
  };

  return (
    r1Shrunken.x < r2Shrunken.x + r2Shrunken.w &&
    r1Shrunken.x + r1Shrunken.w > r2Shrunken.x &&
    r1Shrunken.y < r2Shrunken.y + r2Shrunken.h &&
    r1Shrunken.y + r1Shrunken.h > r2Shrunken.y
  );
}

// ─── PLAYER PHYSICS ───────────────────────────────────────────────────────────────

/**
 * Create a player object
 */
export function createPlayer(x = 100): Player {
  return {
    x,
    y: GROUND_Y - PLAYER_HEIGHT,
    w: PLAYER_WIDTH,
    h: PLAYER_HEIGHT,
    vx: PLAYER_SPEED,
    vy: 0,
    onGround: true,
  };
}

/**
 * Apply gravity to player velocity
 */
export function applyGravity(vy: number, dt: number): number {
  return vy + GRAVITY * dt;
}

/**
 * Update player position based on velocity
 */
export function updatePlayerPosition(player: Player, dt: number): Player {
  return {
    ...player,
    x: player.x + player.vx * dt,
    y: player.y + player.vy * dt,
  };
}

/**
 * Apply ground collision to player
 */
export function applyGroundCollision(player: Player): Player {
  if (player.y >= GROUND_Y - player.h) {
    return {
      ...player,
      y: GROUND_Y - player.h,
      vy: 0,
      onGround: true,
    };
  }
  return {
    ...player,
    onGround: false,
  };
}

/**
 * Check if player can jump (must be on ground)
 */
export function canJump(player: Player): boolean {
  return player.y >= GROUND_Y - player.h - 5;
}

/**
 * Make player jump
 */
export function jump(player: Player): Player {
  if (canJump(player)) {
    return {
      ...player,
      vy: JUMP_VELOCITY,
    };
  }
  return player;
}

// ─── HAND GESTURE DETECTION ───────────────────────────────────────────────────────

/**
 * Check if hand is raised for jump
 */
export function isHandRaised(handY: number): boolean {
  return handY < HAND_RAISE_THRESHOLD;
}

/**
 * Check if hand is lowered to reset jump ability
 */
export function isHandLowered(handY: number): boolean {
  return handY > HAND_LOWER_THRESHOLD;
}

/**
 * Update jump state based on hand position
 */
export function updateJumpState(
  handY: number | null,
  canJumpPrev: boolean
): { canJump: boolean; shouldJump: boolean } {
  if (handY === null) {
    // Hand lost - reset to allow jumping when hand returns
    return { canJump: true, shouldJump: false };
  }

  const raised = isHandRaised(handY);
  const lowered = isHandLowered(handY);

  if (raised && canJumpPrev) {
    // Trigger jump
    return { canJump: false, shouldJump: true };
  } else if (lowered) {
    // Reset jump ability
    return { canJump: true, shouldJump: false };
  }

  return { canJump: canJumpPrev, shouldJump: false };
}

// ─── SCORING ───────────────────────────────────────────────────────────────────

/**
 * Calculate points for collecting an item
 */
export function calculateCollectiblePoints(
  type: 'coin' | 'star',
  streak: number
): number {
  const basePoints = type === 'star' ? STAR_POINTS : COIN_POINTS;
  const streakBonus = Math.min(streak * STREAK_MULTIPLIER, MAX_STREAK_BONUS);
  return basePoints + streakBonus;
}

/**
 * Check if streak milestone is reached
 */
export function isStreakMilestone(streak: number): boolean {
  return streak > 0 && streak % STREAK_MILESTONE_INTERVAL === 0;
}

// ─── GAME OBJECTS ───────────────────────────────────────────────────────────────

let nextId = 0;

/**
 * Generate unique object ID
 */
export function generateId(): number {
  return nextId++;
}

/**
 * Reset ID counter (for testing)
 */
export function resetIdCounter(): void {
  nextId = 0;
}

/**
 * Create a collectible
 */
export function createCollectible(
  x: number,
  y: number,
  type: 'coin' | 'star' = 'coin'
): Collectible {
  return {
    id: generateId(),
    type,
    x,
    y,
    w: type === 'star' ? STAR_SIZE : COIN_SIZE,
    h: type === 'star' ? STAR_SIZE : COIN_SIZE,
    vx: 0,
    vy: 0,
    active: true,
  };
}

/**
 * Create an enemy (slime)
 */
export function createEnemy(x: number): Enemy {
  return {
    id: generateId(),
    type: 'slime',
    x,
    y: GROUND_Y - SLIME_HEIGHT,
    w: SLIME_WIDTH,
    h: SLIME_HEIGHT,
    vx: SLIME_SPEED,
    vy: 0,
    active: true,
  };
}

/**
 * Update enemy position
 */
export function updateEnemy(enemy: Enemy, dt: number): Enemy {
  return {
    ...enemy,
    x: enemy.x + enemy.vx * dt,
  };
}

// ─── CAMERA ─────────────────────────────────────────────────────────────────────

/**
 * Calculate camera position based on player position
 */
export function calculateCameraX(playerX: number): number {
  return playerX - 200;
}

/**
 * Calculate cleanup threshold (remove objects behind camera)
 */
export function calculateCleanupThreshold(cameraX: number): number {
  return cameraX - 200;
}

/**
 * Check if object is off-screen (behind camera)
 */
export function isObjectOffScreen(obj: GameObject, cameraX: number): boolean {
  return obj.x < calculateCleanupThreshold(cameraX);
}
