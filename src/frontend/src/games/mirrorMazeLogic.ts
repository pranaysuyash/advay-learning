/**
 * Mirror Maze Game Logic
 *
 * Steer a ball through a maze using head tilt.
 * Simple physics-based movement with collision detection.
 *
 * Educational Focus:
 * - Spatial awareness
 * - Motor control
 * - Problem-solving
 * - Cause and effect
 */

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Ball extends Position, Velocity {
  radius: number;
}

export interface Wall {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Goal extends Position {
  radius: number;
}

export interface Maze {
  walls: Wall[];
  start: Position;
  goal: Goal;
  width: number;
  height: number;
}

export interface GameState {
  ball: Ball;
  isPlaying: boolean;
  level: number;
  moves: number;
  startTime: number;
  completed: boolean;
}

// Simple maze layouts for 3 levels
export const MAZES: Maze[] = [
  // Level 1: Simple maze
  {
    width: 800,
    height: 600,
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 40 },
    walls: [
      // Vertical walls
      { x: 200, y: 100, width: 20, height: 300 },
      { x: 400, y: 200, width: 20, height: 300 },
      { x: 600, y: 100, width: 20, height: 300 },
      // Horizontal walls
      { x: 300, y: 100, width: 120, height: 20 },
      { x: 500, y: 480, width: 120, height: 20 },
    ],
  },
  // Level 2: Medium maze
  {
    width: 800,
    height: 600,
    start: { x: 100, y: 100 },
    goal: { x: 700, y: 500, radius: 35 },
    walls: [
      { x: 150, y: 50, width: 20, height: 250 },
      { x: 150, y: 350, width: 20, height: 200 },
      { x: 300, y: 150, width: 20, height: 350 },
      { x: 450, y: 50, width: 20, height: 300 },
      { x: 450, y: 400, width: 20, height: 150 },
      { x: 600, y: 100, width: 20, height: 400 },
      { x: 250, y: 200, width: 70, height: 20 },
      { x: 520, y: 350, width: 100, height: 20 },
    ],
  },
  // Level 3: Complex maze
  {
    width: 800,
    height: 600,
    start: { x: 100, y: 300 },
    goal: { x: 700, y: 300, radius: 30 },
    walls: [
      { x: 100, y: 150, width: 20, height: 150 },
      { x: 100, y: 350, width: 20, height: 150 },
      { x: 200, y: 50, width: 20, height: 200 },
      { x: 200, y: 350, width: 20, height: 200 },
      { x: 300, y: 150, width: 20, height: 300 },
      { x: 400, y: 50, width: 20, height: 250 },
      { x: 400, y: 350, width: 20, height: 200 },
      { x: 500, y: 100, width: 20, height: 250 },
      { x: 500, y: 400, width: 20, height: 150 },
      { x: 600, y: 50, width: 20, height: 200 },
      { x: 600, y: 300, width: 20, height: 250 },
      { x: 150, y: 300, width: 70, height: 20 },
      { x: 350, y: 200, width: 70, height: 20 },
      { x: 350, y: 400, width: 70, height: 20 },
      { x: 550, y: 300, width: 70, height: 20 },
    ],
  },
];

export function initializeGame(level: number = 1): GameState {
  const maze = MAZES[level - 1] || MAZES[0];
  
  return {
    ball: {
      x: maze.start.x,
      y: maze.start.y,
      vx: 0,
      vy: 0,
      radius: 20,
    },
    isPlaying: false,
    level,
    moves: 0,
    startTime: 0,
    completed: false,
  };
}

export function updateBall(
  ball: Ball,
  tiltX: number,
  tiltY: number,
  walls: Wall[],
  mazeWidth: number,
  mazeHeight: number,
  _deltaTime: number = 16
): Ball {
  // Apply tilt as acceleration
  const acceleration = 0.5;
  const friction = 0.95;
  const maxSpeed = 8;
  
  let newVx = (ball.vx + tiltX * acceleration) * friction;
  let newVy = (ball.vy + tiltY * acceleration) * friction;
  
  // Clamp velocity
  newVx = Math.max(-maxSpeed, Math.min(maxSpeed, newVx));
  newVy = Math.max(-maxSpeed, Math.min(maxSpeed, newVy));
  
  // Calculate new position
  let newX = ball.x + newVx;
  let newY = ball.y + newVy;
  
  // Wall collision
  for (const wall of walls) {
    const collision = checkBallWallCollision(
      { ...ball, x: newX, y: newY },
      wall
    );
    
    if (collision.collided) {
      if (collision.axis === 'x') {
        newX = ball.x;
        newVx = -newVx * 0.3; // Bounce with energy loss
      }
      if (collision.axis === 'y') {
        newY = ball.y;
        newVy = -newVy * 0.3;
      }
    }
  }
  
  // Boundary collision
  if (newX - ball.radius < 0) {
    newX = ball.radius;
    newVx = -newVx * 0.3;
  }
  if (newX + ball.radius > mazeWidth) {
    newX = mazeWidth - ball.radius;
    newVx = -newVx * 0.3;
  }
  if (newY - ball.radius < 0) {
    newY = ball.radius;
    newVy = -newVy * 0.3;
  }
  if (newY + ball.radius > mazeHeight) {
    newY = mazeHeight - ball.radius;
    newVy = -newVy * 0.3;
  }
  
  return {
    ...ball,
    x: newX,
    y: newY,
    vx: newVx,
    vy: newVy,
  };
}

export function checkBallWallCollision(
  ball: Ball,
  wall: Wall
): { collided: boolean; axis: 'x' | 'y' | 'both' | null } {
  const closestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.width));
  const closestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.height));
  
  const distanceX = ball.x - closestX;
  const distanceY = ball.y - closestY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
  
  if (distance < ball.radius) {
    // Determine primary collision axis
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      return { collided: true, axis: 'x' };
    } else if (Math.abs(distanceY) > Math.abs(distanceX)) {
      return { collided: true, axis: 'y' };
    }
    return { collided: true, axis: 'both' };
  }
  
  return { collided: false, axis: null };
}

export function checkGoalReached(ball: Ball, goal: Goal): boolean {
  const dx = ball.x - goal.x;
  const dy = ball.y - goal.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < ball.radius + goal.radius;
}

export function normalizeTilt(
  rawTiltX: number,
  rawTiltY: number,
  sensitivity: number = 1.0
): { x: number; y: number } {
  // Normalize tilt values (assuming input range -1 to 1)
  // Apply sensitivity multiplier
  // Clamp to reasonable range
  
  const x = Math.max(-1, Math.min(1, rawTiltX * sensitivity));
  const y = Math.max(-1, Math.min(1, rawTiltY * sensitivity));
  
  return { x, y };
}

export function calculateScore(
  moves: number,
  timeMs: number,
  level: number
): number {
  const baseScore = 1000;
  const movesPenalty = Math.max(0, moves - 20) * 5;
  const timePenalty = Math.floor(timeMs / 1000) * 2;
  const levelBonus = level * 200;
  
  return Math.max(0, baseScore - movesPenalty - timePenalty + levelBonus);
}

export function getCurrentMaze(level: number): Maze {
  return MAZES[level - 1] || MAZES[0];
}
