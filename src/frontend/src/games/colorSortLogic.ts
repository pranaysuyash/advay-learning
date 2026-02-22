/**
 * Color Sort Physics Game Logic
 * 
 * A Matter.js physics game where players drop colored balls
 * into matching colored buckets.
 * 
 * Uses real physics simulation for:
 * - Gravity
 * - Collisions
 * - Bouncing
 * - Bucket collection detection
 */

import Matter from 'matter-js';

// Re-export Matter types for convenience
export const { Engine, Render, Runner, Bodies, Composite, Events, Vector } = Matter;

// Game colors
export const COLORS = [
  { name: 'Red', hex: '#FF6B6B', matter: '#FF6B6B' },
  { name: 'Blue', hex: '#4ECDC4', matter: '#4ECDC4' },
  { name: 'Green', hex: '#96CEB4', matter: '#96CEB4' },
  { name: 'Yellow', hex: '#FFEAA7', matter: '#FFEAA7' },
];

export interface GameState {
  score: number;
  ballsDropped: number;
  ballsSorted: number;
  level: number;
  isPlaying: boolean;
  nextBallColor: string;
}

export interface PhysicsBodies {
  engine: Matter.Engine;
  world: Matter.World;
  balls: Matter.Body[];
  buckets: Matter.Body[];
  walls: Matter.Body[];
  spawner: Matter.Body;
}

// Initialize game state
export function initializeGame(): GameState {
  return {
    score: 0,
    ballsDropped: 0,
    ballsSorted: 0,
    level: 1,
    isPlaying: false,
    nextBallColor: getRandomColor(),
  };
}

// Get random color
export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)].hex;
}

// Create physics world
export function createPhysicsWorld(width: number, height: number): PhysicsBodies {
  const engine = Engine.create({
    gravity: { x: 0, y: 0.8 },
  });
  
  const world = engine.world;
  
  // Create walls (invisible boundaries)
  const wallThickness = 60;
  const walls = [
    // Floor
    Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { 
      isStatic: true,
      render: { visible: false },
      label: 'floor',
    }),
    // Left wall
    Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { 
      isStatic: true,
      render: { visible: false },
    }),
    // Right wall
    Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { 
      isStatic: true,
      render: { visible: false },
    }),
  ];
  
  // Create buckets
  const bucketWidth = width / (COLORS.length + 1);
  const bucketHeight = 80;
  const buckets: Matter.Body[] = [];
  
  COLORS.forEach((color, index) => {
    const x = bucketWidth * (index + 1);
    const y = height - 100;
    
    // Bucket walls (L-shape)
    const leftWall = Bodies.rectangle(x - bucketWidth / 3, y, 10, bucketHeight, {
      isStatic: true,
      render: { fillStyle: color.hex },
      label: `bucket-${color.name}-left`,
    });
    
    const rightWall = Bodies.rectangle(x + bucketWidth / 3, y, 10, bucketHeight, {
      isStatic: true,
      render: { fillStyle: color.hex },
      label: `bucket-${color.name}-right`,
    });
    
    const bottom = Bodies.rectangle(x, y + bucketHeight / 2, bucketWidth / 1.5, 10, {
      isStatic: true,
      render: { fillStyle: color.hex },
      label: `bucket-${color.name}`,
    });
    
    buckets.push(leftWall, rightWall, bottom);
  });
  
  // Spawner area (where balls appear)
  const spawner = Bodies.rectangle(width / 2, 50, 60, 60, {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: '#ddd' },
    label: 'spawner',
  });
  
  Composite.add(world, [...walls, ...buckets, spawner]);
  
  return {
    engine,
    world,
    balls: [],
    buckets,
    walls,
    spawner,
  };
}

// Create a ball
export function createBall(x: number, y: number, color: string): Matter.Body {
  return Bodies.circle(x, y, 20, {
    restitution: 0.6,  // Bounciness
    friction: 0.005,
    density: 0.04,
    render: { fillStyle: color },
    label: `ball-${color}`,
  });
}

// Drop a ball
export function dropBall(
  physics: PhysicsBodies,
  x: number,
  color: string
): { body: Matter.Body; updatedPhysics: PhysicsBodies } {
  const ball = createBall(x, 50, color);
  Composite.add(physics.world, ball);
  
  return {
    body: ball,
    updatedPhysics: {
      ...physics,
      balls: [...physics.balls, ball],
    },
  };
}

// Check if ball is in correct bucket
export function checkBallInBucket(
  ball: Matter.Body,
  buckets: Matter.Body[]
): { isInBucket: boolean; isCorrect: boolean; color?: string } {
  const ballColor = ball.label.replace('ball-', '');
  
  for (const bucket of buckets) {
    if (bucket.label.includes('bucket') && !bucket.label.includes('wall')) {
      const bucketColor = bucket.label.replace('bucket-', '');
      const collision = Matter.Collision.collides(ball, bucket);
      
      if (collision && collision.collided) {
        return {
          isInBucket: true,
          isCorrect: ballColor === bucketColor,
          color: bucketColor,
        };
      }
    }
  }
  
  return { isInBucket: false, isCorrect: false };
}

// Update game state based on physics
export function updateGameState(
  state: GameState,
  physics: PhysicsBodies
): { state: GameState; physics: PhysicsBodies; events: GameEvent[] } {
  const events: GameEvent[] = [];
  
  // Check balls that have settled
  const remainingBalls: Matter.Body[] = [];
  
  for (const ball of physics.balls) {
    const result = checkBallInBucket(ball, physics.buckets);
    
    if (result.isInBucket) {
      // Ball is in a bucket
      if (result.isCorrect) {
        state.score += 10 * state.level;
        state.ballsSorted++;
        events.push({ type: 'correct', color: result.color! });
      } else {
        state.score = Math.max(0, state.score - 5);
        events.push({ type: 'wrong', color: result.color! });
      }
      
      // Remove ball from world
      Composite.remove(physics.world, ball);
    } else if (ball.position.y > 1000) {
      // Ball fell off screen
      Composite.remove(physics.world, ball);
      events.push({ type: 'missed' });
    } else {
      remainingBalls.push(ball);
    }
  }
  
  // Level up every 5 sorted balls
  if (state.ballsSorted > 0 && state.ballsSorted % 5 === 0) {
    const newLevel = Math.floor(state.ballsSorted / 5) + 1;
    if (newLevel > state.level) {
      state.level = newLevel;
      events.push({ type: 'levelup', level: newLevel });
    }
  }
  
  return {
    state,
    physics: { ...physics, balls: remainingBalls },
    events,
  };
}

// Game events
export type GameEvent =
  | { type: 'correct'; color: string }
  | { type: 'wrong'; color: string }
  | { type: 'missed' }
  | { type: 'levelup'; level: number };

// Start game
export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
  };
}

// End game
export function endGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: false,
  };
}

// Cleanup physics
export function cleanupPhysics(physics: PhysicsBodies): void {
  Engine.clear(physics.engine);
  Composite.clear(physics.world, false, true);
}
