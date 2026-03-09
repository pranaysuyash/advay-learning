/**
 * Shadow Portal - Particle Physics Module
 *
 * Handles particle creation, physics simulation, and collision detection
 * for the Shadow Portal game.
 *
 * @spec docs/games/shadow-portal-spec.md
 */

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

export const PARTICLE_RADIUS = 8;
export const GRAVITY = 0.15;
export const BOUNCE_DAMPING = 0.6;

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  inPortal: boolean;
}

export interface Portal {
  x: number;
  y: number;
  radius: number;
  count: number;
  target: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'static' | 'moving';
  speed?: number; // For moving obstacles
  direction?: 1 | -1; // For moving obstacles
  minX?: number; // Movement bounds
  maxX?: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

// ─── PARTICLE CREATION ───────────────────────────────────────────────────────

/**
 * Generate unique ID for new particles
 */
let nextParticleId = 0;
export function generateParticleId(): number {
  return Date.now() + nextParticleId++;
}

/**
 * Create a single particle at the specified position with random velocity variation
 */
export function createParticle(
  x: number,
  y: number,
  baseSpeed: number,
  randomOffset: number = 0
): Particle {
  return {
    id: generateParticleId(),
    x,
    y,
    vx: (Math.random() - 0.5) * 0.5 + randomOffset,
    vy: baseSpeed * (0.8 + Math.random() * 0.4),
    active: true,
    inPortal: false,
  };
}

/**
 * Create multiple particles for spawning
 */
export function createParticles(count: number, speed: number, canvasWidth: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push(
      createParticle(
        100 + Math.random() * (canvasWidth - 200),
        -20 - Math.random() * 100, // Start above screen
        speed
      )
    );
  }
  return particles;
}

// ─── PHYSICS ─────────────────────────────────────────────────────────────────

/**
 * Apply gravity to a particle's velocity
 * @returns Updated velocity Y
 */
export function applyGravity(vy: number, dt: number): number {
  return vy + GRAVITY * dt;
}

/**
 * Update particle position based on velocity
 */
export function updateParticlePosition(particle: Particle, dt: number): Particle {
  return {
    ...particle,
    x: particle.x + particle.vx * dt,
    y: particle.y + particle.vy * dt,
  };
}

/**
 * Apply wind force to particle (for wind gust mechanic)
 */
export function applyWindForce(particle: Particle, windForce: Vector2D, dt: number): Particle {
  return {
    ...particle,
    vy: particle.vy + windForce.y * 0.1 * dt,
    vx: particle.vx + windForce.x * 0.1 * dt,
  };
}

/**
 * Bounce particle off a wall with damping
 */
export function bounceOffAxis(velocity: number): number {
  return velocity * -BOUNCE_DAMPING;
}

/**
 * Constrain particle position within canvas bounds
 * Returns true if a bounce occurred
 */
export function constrainToBounds(
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number
): { particle: Particle; didBounce: boolean } {
  let { x, y, vx, vy } = particle;
  let didBounce = false;

  // Left wall
  if (x < PARTICLE_RADIUS) {
    x = PARTICLE_RADIUS;
    vx = bounceOffAxis(vx);
    didBounce = true;
  }

  // Right wall
  if (x > canvasWidth - PARTICLE_RADIUS) {
    x = canvasWidth - PARTICLE_RADIUS;
    vx = bounceOffAxis(vx);
    didBounce = true;
  }

  // Ceiling
  if (y < PARTICLE_RADIUS) {
    y = PARTICLE_RADIUS;
    vy = bounceOffAxis(vy);
    didBounce = true;
  }

  // Floor
  if (y > canvasHeight - PARTICLE_RADIUS) {
    y = canvasHeight - PARTICLE_RADIUS;
    vy = bounceOffAxis(vy);
    didBounce = true;
  }

  return {
    particle: { ...particle, x, y, vx, vy },
    didBounce,
  };
}

// ─── COLLISION DETECTION ─────────────────────────────────────────────────────

/**
 * Calculate Euclidean distance between two points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Check if a particle collides with a portal
 * Uses generous hitbox (2x particle radius) for accessibility
 */
export function checkPortalCollision(
  particle: Particle,
  portal: Portal,
  hitboxMultiplier: number = 2
): boolean {
  const hitRadius = portal.radius + PARTICLE_RADIUS * hitboxMultiplier;
  const dist = distance(particle.x, particle.y, portal.x, portal.y);
  return dist < hitRadius;
}

/**
 * Check if a particle collides with a circular barrier (mouse fallback)
 */
export function checkBarrierCollision(
  particle: Particle,
  barrier: Vector2D,
  barrierRadius: number
): boolean {
  const dist = distance(particle.x, particle.y, barrier.x, barrier.y);
  return dist < barrierRadius;
}

/**
 * Push a particle away from a barrier point
 */
export function pushFromBarrier(
  particle: Particle,
  barrier: Vector2D,
  pushSpeed: number = 2
): Particle {
  const angle = Math.atan2(particle.y - barrier.y, particle.x - barrier.x);
  return {
    ...particle,
    vx: Math.cos(angle) * pushSpeed,
    vy: Math.sin(angle) * pushSpeed,
  };
}

/**
 * Check if particle collides with a rectangular obstacle
 */
export function checkObstacleCollision(
  particle: Particle,
  obstacle: Obstacle
): boolean {
  return (
    particle.x + PARTICLE_RADIUS > obstacle.x &&
    particle.x - PARTICLE_RADIUS < obstacle.x + obstacle.width &&
    particle.y + PARTICLE_RADIUS > obstacle.y &&
    particle.y - PARTICLE_RADIUS < obstacle.y + obstacle.height
  );
}

/**
 * Bounce particle off an obstacle (determines which side was hit)
 */
export function bounceOffObstacle(
  particle: Particle,
  obstacle: Obstacle
): Particle {
  const particleLeft = particle.x - PARTICLE_RADIUS;
  const particleRight = particle.x + PARTICLE_RADIUS;
  const particleTop = particle.y - PARTICLE_RADIUS;
  const particleBottom = particle.y + PARTICLE_RADIUS;

  const obstacleLeft = obstacle.x;
  const obstacleRight = obstacle.x + obstacle.width;
  const obstacleTop = obstacle.y;
  const obstacleBottom = obstacle.y + obstacle.height;

  // Determine which side was hit by finding the minimum overlap
  const overlapLeft = particleRight - obstacleLeft;
  const overlapRight = obstacleRight - particleLeft;
  const overlapTop = particleBottom - obstacleTop;
  const overlapBottom = obstacleBottom - particleTop;

  const minOverlapX = Math.min(overlapLeft, overlapRight);
  const minOverlapY = Math.min(overlapTop, overlapBottom);

  if (minOverlapX < minOverlapY) {
    // Hit from left or right - bounce X
    return {
      ...particle,
      vx: -particle.vx * BOUNCE_DAMPING,
      x: overlapLeft < overlapRight
        ? obstacleLeft - PARTICLE_RADIUS
        : obstacleRight + PARTICLE_RADIUS,
    };
  } else {
    // Hit from top or bottom - bounce Y
    return {
      ...particle,
      vy: -particle.vy * BOUNCE_DAMPING,
      y: overlapTop < overlapBottom
        ? obstacleTop - PARTICLE_RADIUS
        : obstacleBottom + PARTICLE_RADIUS,
    };
  }
}

/**
 * Update moving obstacle position
 */
export function updateMovingObstacle(obstacle: Obstacle, dt: number): Obstacle {
  if (obstacle.type !== 'moving' || obstacle.speed === undefined) {
    return obstacle;
  }

  const direction = obstacle.direction ?? 1;
  const speed = obstacle.speed * dt;
  const minX = obstacle.minX ?? obstacle.x;
  const maxX = obstacle.maxX ?? obstacle.x + obstacle.width;

  let newX = obstacle.x + direction * speed;

  // Reverse direction at bounds
  if (newX <= minX || newX + obstacle.width >= maxX) {
    return {
      ...obstacle,
      x: Math.max(minX, Math.min(maxX - obstacle.width, newX)),
      direction: direction * -1 as 1 | -1,
    };
  }

  return { ...obstacle, x: newX };
}

/**
 * Create obstacles for a level
 */
export function createLevelObstacles(level: number): Obstacle[] {
  if (level < 3) return [];

  // Level 3: Two moving barriers that particles must navigate around
  return [
    {
      x: 250,
      y: 250,
      width: 40,
      height: 150,
      type: 'moving',
      speed: 0.5,
      direction: 1,
      minX: 150,
      maxX: 350,
    },
    {
      x: 510,
      y: 250,
      width: 40,
      height: 150,
      type: 'moving',
      speed: 0.5,
      direction: -1,
      minX: 410,
      maxX: 610,
    },
  ];
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

/**
 * Calculate points for a particle entering a portal
 * @param basePoints - Base points per particle (default: 1)
 * @param streak - Current streak count
 * @param maxStreakBonus - Maximum streak bonus (default: 25)
 * @param streakMultiplier - Points per streak level (default: 5)
 */
export function calculatePortalScore(
  basePoints: number = 1,
  streak: number = 0,
  maxStreakBonus: number = 25,
  streakMultiplier: number = 5
): number {
  const streakBonus = Math.min(streak * streakMultiplier, maxStreakBonus);
  return basePoints + streakBonus;
}

/**
 * Calculate time bonus for level completion
 * @param remainingSeconds - Time left on clock
 * @param pointsPerSecond - Points per second remaining (default: 5)
 */
export function calculateTimeBonus(
  remainingSeconds: number,
  pointsPerSecond: number = 5
): number {
  return Math.max(0, remainingSeconds * pointsPerSecond);
}

/**
 * Check if all portals are at their target count
 */
export function areAllPortalsFull(portals: Portal[]): boolean {
  return portals.every(p => p.count >= p.target);
}

/**
 * Get the total particle count across all portals
 */
export function getTotalPortalCount(portals: Portal[]): number {
  return portals.reduce((sum, p) => sum + p.count, 0);
}

/**
 * Get the total target count across all portals
 */
export function getTotalPortalTarget(portals: Portal[]): number {
  return portals.reduce((sum, p) => sum + p.target, 0);
}

// ─── LEVEL PROGRESSION ───────────────────────────────────────────────────────

export interface LevelConfig {
  level: number;
  portals: { x: number; y: number; target: number }[];
  particleSpeed: number;
  particleSpawnRate: number;
  hasObstacle: boolean;
}

/**
 * Default level configurations for Shadow Portal
 */
export const DEFAULT_LEVELS: LevelConfig[] = [
  {
    level: 1,
    portals: [
      { x: 400, y: 500, target: 15 },
    ],
    particleSpeed: 1.5,
    particleSpawnRate: 400,
    hasObstacle: false,
  },
  {
    level: 2,
    portals: [
      { x: 240, y: 500, target: 20 },
      { x: 560, y: 500, target: 20 },
    ],
    particleSpeed: 2.5,
    particleSpawnRate: 300,
    hasObstacle: false,
  },
  {
    level: 3,
    portals: [
      { x: 240, y: 500, target: 25 },
      { x: 560, y: 500, target: 25 },
    ],
    particleSpeed: 3.5,
    particleSpawnRate: 250,
    hasObstacle: true,
  },
];

/**
 * Create portal objects from level config
 */
export function createPortalsFromConfig(
  config: LevelConfig,
  portalRadius: number
): Portal[] {
  return config.portals.map(p => ({
    x: p.x,
    y: p.y,
    radius: portalRadius,
    count: 0,
    target: p.target,
  }));
}

// ─── GAME CONSTANTS ───────────────────────────────────────────────────────────

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const LEVEL_DURATION_SECONDS = 60;
export const GRACE_PERIOD_SECONDS = 10;
export const WIND_GUST_COOLDOWN_MS = 3000;
export const WIND_GUST_DURATION_MS = 500;
export const WIND_FORCE: Vector2D = { x: 0, y: -3 };
export const ARMS_UP_THRESHOLD = 0.45;
export const PORTAL_RADIUS = 60;
export const MAX_PARTICLES = 100;
