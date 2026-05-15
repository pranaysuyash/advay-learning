/**
 * Obstacle Course 3D Game Logic
 *
 * 3D platform runner with physics-based obstacles.
 * Educational value: Timing, coordination, spatial awareness
 *
 * @ticket TCK-20250411-001
 */

// Game configuration
export const OBSTACLE_COURSE_3D_CONFIG = {
  // Player settings
  PLAYER_SPEED: 5,
  JUMP_FORCE: 8,
  GRAVITY: -20,

  // Obstacle types
  OBSTACLE_TYPES: [
    { id: 'spike', name: 'Spike Trap', damage: 1, color: '#ef4444', requiresJump: false },
    { id: 'barrier', name: 'Barrier', damage: 0, color: '#fbbf24', requiresJump: true },
    { id: 'gap', name: 'Gap', damage: 1, color: '#1e293b', requiresJump: true },
  ] as const,

  // Level settings
  OBSTACLES_PER_LEVEL: 8,
  LEVEL_LENGTH: 20,

  // Scoring
  POINTS_PER_OBSTACLE: 15,
  COIN_VALUE: 10,
  PERFECT_RUN_BONUS: 50,

  // Game settings
  TOTAL_LEVELS: 3,
  MAX_LIVES: 3,
} as const;

// Types
export type ObstacleType = typeof OBSTACLE_COURSE_3D_CONFIG.OBSTACLE_TYPES[number];

export interface Obstacle3D {
  id: string;
  type: ObstacleType;
  position: { x: number; y: number; z: number };
  passed: boolean;
}

export interface Coin3D {
  id: string;
  position: { x: number; y: number; z: number };
  collected: boolean;
  rotation: number;
}

export interface Player3D {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  isGrounded: boolean;
  isJumping: boolean;
}

export interface GameState {
  player: Player3D;
  obstacles: Obstacle3D[];
  coins: Coin3D[];
  score: number;
  lives: number;
  level: number;
  distance: number;
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  feedback: string;
  obstaclesPassed: number;
}

export interface MoveResult {
  collided: boolean;
  collectedCoin: boolean;
  points: number;
}

// Generate unique ID
function generateId(): string {
  return `oc3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate level obstacles
export function generateLevel(level: number): { obstacles: Obstacle3D[]; coins: Coin3D[] } {
  const obstacles: Obstacle3D[] = [];
  const coins: Coin3D[] = [];

  const obstacleCount = OBSTACLE_COURSE_3D_CONFIG.OBSTACLES_PER_LEVEL + level;

  for (let i = 0; i < obstacleCount; i++) {
    const type = OBSTACLE_COURSE_3D_CONFIG.OBSTACLE_TYPES[
      Math.floor(Math.random() * OBSTACLE_COURSE_3D_CONFIG.OBSTACLE_TYPES.length)
    ];

    obstacles.push({
      id: generateId(),
      type,
      position: {
        x: 3 + i * 2,
        y: 0,
        z: 0,
      },
      passed: false,
    });

    // Add coins between obstacles
    if (Math.random() < 0.5) {
      coins.push({
        id: generateId(),
        position: {
          x: 3 + i * 2 + 1,
          y: 1 + Math.random(),
          z: 0,
        },
        collected: false,
        rotation: 0,
      });
    }
  }

  return { obstacles, coins };
}

// Initialize game
export function initializeGame(): GameState {
  return {
    player: {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      isGrounded: true,
      isJumping: false,
    },
    obstacles: [],
    coins: [],
    score: 0,
    lives: OBSTACLE_COURSE_3D_CONFIG.MAX_LIVES,
    level: 1,
    distance: 0,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    feedback: 'Run and jump!',
    obstaclesPassed: 0,
  };
}

// Start game
export function startGame(_state: GameState): GameState {
  const { obstacles, coins } = generateLevel(1);
  return {
    ...initializeGame(),
    obstacles,
    coins,
    isPlaying: true,
    feedback: 'Level 1 - Watch out for obstacles!',
  };
}

// Start next level
export function nextLevel(state: GameState): GameState {
  const newLevel = state.level + 1;
  const { obstacles, coins } = generateLevel(newLevel);

  return {
    ...state,
    level: newLevel,
    obstacles,
    coins,
    player: {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      isGrounded: true,
      isJumping: false,
    },
    distance: 0,
    obstaclesPassed: 0,
    feedback: `Level ${newLevel} - Go!`,
  };
}

// Jump action
export function jump(state: GameState): GameState {
  if (!state.isPlaying || !state.player.isGrounded) return state;

  return {
    ...state,
    player: {
      ...state.player,
      velocity: {
        ...state.player.velocity,
        y: OBSTACLE_COURSE_3D_CONFIG.JUMP_FORCE,
      },
      isJumping: true,
      isGrounded: false,
    },
  };
}

// Update physics
export function updatePhysics(state: GameState, deltaTime: number): { state: GameState; result: MoveResult } {
  if (!state.isPlaying) {
    return { state, result: { collided: false, collectedCoin: false, points: 0 } };
  }

  const dt = deltaTime / 1000;
  const player = state.player;

  // Apply forward movement
  const newX = player.position.x + OBSTACLE_COURSE_3D_CONFIG.PLAYER_SPEED * dt;

  // Apply gravity
  const newVelocityY = player.velocity.y + OBSTACLE_COURSE_3D_CONFIG.GRAVITY * dt;
  const newY = player.position.y + newVelocityY * dt;

  // Ground collision
  let isGrounded = false;
  let finalY = newY;
  let finalVelocityY = newVelocityY;

  if (newY <= 0) {
    finalY = 0;
    finalVelocityY = 0;
    isGrounded = true;
  }

  const updatedPlayer = {
    ...player,
    position: { ...player.position, x: newX, y: finalY },
    velocity: { ...player.velocity, y: finalVelocityY },
    isGrounded,
  };

  // Check obstacle collisions
  let collided = false;
  let damage = 0;
  let obstaclesPassed = state.obstaclesPassed;

  const updatedObstacles = state.obstacles.map((obstacle) => {
    if (obstacle.passed) return obstacle;

    const distance = Math.abs(newX - obstacle.position.x);
    if (distance < 0.8) {
      // Collision!
      if (obstacle.type.requiresJump && !player.isJumping) {
        collided = true;
        damage = obstacle.type.damage;
        return { ...obstacle, passed: true };
      } else if (!obstacle.type.requiresJump) {
        collided = true;
        damage = obstacle.type.damage;
        return { ...obstacle, passed: true };
      }
    }

    // Mark as passed if player moved past
    if (newX > obstacle.position.x + 1) {
      obstaclesPassed++;
      return { ...obstacle, passed: true };
    }

    return obstacle;
  });

  // Check coin collection
  let collectedCoin = false;
  const updatedCoins = state.coins.map((coin) => {
    if (coin.collected) return coin;

    const distance = Math.sqrt(
      Math.pow(newX - coin.position.x, 2) +
      Math.pow(finalY - coin.position.y, 2)
    );

    if (distance < 1) {
      collectedCoin = true;
      return { ...coin, collected: true };
    }

    return { ...coin, rotation: coin.rotation + 0.05 };
  });

  const points = collectedCoin ? OBSTACLE_COURSE_3D_CONFIG.COIN_VALUE : 0;
  const newLives = state.lives - (collided ? damage : 0);
  const gameOver = newLives <= 0;

  // Check level complete
  const allObstaclesPassed = updatedObstacles.every((o) => o.passed);
  const gameWon = allObstaclesPassed && state.level >= OBSTACLE_COURSE_3D_CONFIG.TOTAL_LEVELS;

  return {
    state: {
      ...state,
      player: updatedPlayer,
      obstacles: updatedObstacles,
      coins: updatedCoins,
      score: state.score + points,
      lives: Math.max(0, newLives),
      distance: newX,
      obstaclesPassed,
      isPlaying: !gameOver && !gameWon,
      gameOver,
      gameWon,
      feedback: collided ? 'Ouch!' : collectedCoin ? 'Coin!' : state.feedback,
    },
    result: { collided, collectedCoin, points },
  };
}

// Get progress
export function getProgress(state: GameState): number {
  return (state.obstaclesPassed / state.obstacles.length) * 100;
}

// Get level progress
export function getLevelProgress(state: GameState): number {
  return (state.level / OBSTACLE_COURSE_3D_CONFIG.TOTAL_LEVELS) * 100;
}
