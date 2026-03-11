/**
 * Shadow Portal game logic — pure functions for the silhouette particle game.
 *
 * Your body silhouette blocks and guides falling light particles into portals.
 * Move your body, raise arms, make "tunnels" with your silhouette!
 *
 * @see docs/GAME_IDEAS_CATALOG.md - Shadow Portal (Segmentation)
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type ParticleType = 'normal' | 'bonus' | 'obstacle';
export type PortalType = 'left' | 'right' | 'center';

export interface Position {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: ParticleType;
  color: string;
  captured: boolean;
  missed: boolean;
}

export interface Portal {
  id: PortalType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  particlesCollected: number;
  targetParticles: number;
}

export interface SilhouetteRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}

export interface GameState {
  status: 'idle' | 'playing' | 'complete' | 'gameover';
  score: number;
  level: number;
  difficulty: Difficulty;
  particles: Particle[];
  portals: Portal[];
  timeLeft: number;
  particlesSpawned: number;
  maxParticles: number;
  particlesCollected: number;
  particlesMissed: number;
  maxMissed: number;
  streak: number;
  comboMultiplier: number;
}

export interface GameConfig {
  difficulty: Difficulty;
  timeLimit: number;
  maxParticles: number;
  maxMissed: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  difficulty: 'easy',
  timeLimit: 60,
  maxParticles: 30,
  maxMissed: 5,
};

// Difficulty configurations
export const DIFFICULTY_CONFIGS: Record<Difficulty, {
  spawnRate: number; // Particles per second
  fallSpeed: number; // Base falling speed
  maxMissed: number;
  timeLimit: number;
  obstacleChance: number;
  bonusChance: number;
}> = {
  easy: {
    spawnRate: 1.5,
    fallSpeed: 0.3,
    maxMissed: 5,
    timeLimit: 60,
    obstacleChance: 0.1,
    bonusChance: 0.2,
  },
  medium: {
    spawnRate: 2.0,
    fallSpeed: 0.5,
    maxMissed: 3,
    timeLimit: 90,
    obstacleChance: 0.15,
    bonusChance: 0.15,
  },
  hard: {
    spawnRate: 2.5,
    fallSpeed: 0.7,
    maxMissed: 2,
    timeLimit: 120,
    obstacleChance: 0.2,
    bonusChance: 0.1,
  },
};

const PORTAL_COLORS = {
  left: '#FF6B6B',
  center: '#4ECDC4',
  right: '#FFE66D',
};

const PARTICLE_COLORS = {
  normal: '#FFFFFF',
  bonus: '#FFD700',
  obstacle: '#FF4444',
};

/**
 * Generate a unique particle ID.
 */
function generateParticleId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create initial game state.
 */
export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    status: 'idle',
    score: 0,
    level: 1,
    difficulty: config.difficulty,
    particles: [],
    portals: [],
    timeLeft: config.timeLimit,
    particlesSpawned: 0,
    maxParticles: config.maxParticles,
    particlesCollected: 0,
    particlesMissed: 0,
    maxMissed: config.maxMissed,
    streak: 0,
    comboMultiplier: 1,
  };
}

/**
 * Create portals for the game.
 */
export function createPortals(): Portal[] {
  return [
    {
      id: 'left',
      x: 0.2,
      y: 0.85,
      width: 0.15,
      height: 0.1,
      color: PORTAL_COLORS.left,
      particlesCollected: 0,
      targetParticles: 10,
    },
    {
      id: 'center',
      x: 0.5,
      y: 0.85,
      width: 0.15,
      height: 0.1,
      color: PORTAL_COLORS.center,
      particlesCollected: 0,
      targetParticles: 10,
    },
    {
      id: 'right',
      x: 0.8,
      y: 0.85,
      width: 0.15,
      height: 0.1,
      color: PORTAL_COLORS.right,
      particlesCollected: 0,
      targetParticles: 10,
    },
  ];
}

/**
 * Start a new game.
 */
export function startGame(state: GameState, difficulty: Difficulty): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  return {
    ...state,
    status: 'playing',
    score: 0,
    level: 1,
    difficulty,
    particles: [],
    portals: createPortals(),
    timeLeft: config.timeLimit,
    particlesSpawned: 0,
    maxParticles: config.timeLimit * config.spawnRate,
    particlesCollected: 0,
    particlesMissed: 0,
    maxMissed: config.maxMissed,
    streak: 0,
    comboMultiplier: 1,
  };
}

/**
 * Spawn a new particle.
 */
export function spawnParticle(difficulty: Difficulty, _spawnCount: number): Particle {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Determine particle type
  const rand = Math.random();
  let type: ParticleType = 'normal';
  if (rand < config.obstacleChance) {
    type = 'obstacle';
  } else if (rand < config.obstacleChance + config.bonusChance) {
    type = 'bonus';
  }
  
  // Random x position (avoid edges)
  const x = 0.1 + Math.random() * 0.8;
  
  // Target portal based on x position
  let targetPortal: PortalType = 'center';
  if (x < 0.35) targetPortal = 'left';
  else if (x > 0.65) targetPortal = 'right';
  
  // Initial velocity (slight drift toward target)
  const targetX = targetPortal === 'left' ? 0.2 : targetPortal === 'right' ? 0.8 : 0.5;
  const vx = (targetX - x) * 0.1;
  
  return {
    id: generateParticleId(),
    x,
    y: 0, // Start at top
    vx,
    vy: config.fallSpeed * (0.8 + Math.random() * 0.4), // Slight speed variation
    radius: type === 'bonus' ? 0.025 : type === 'obstacle' ? 0.035 : 0.03,
    type,
    color: PARTICLE_COLORS[type],
    captured: false,
    missed: false,
  };
}

/**
 * Check if a particle collides with a silhouette region.
 */
export function checkSilhouetteCollision(
  particle: Particle,
  silhouette: SilhouetteRegion
): boolean {
  if (!silhouette.isActive) return false;
  
  // Circle-rectangle collision
  const closestX = Math.max(silhouette.x, Math.min(particle.x, silhouette.x + silhouette.width));
  const closestY = Math.max(silhouette.y, Math.min(particle.y, silhouette.y + silhouette.height));
  
  const dx = particle.x - closestX;
  const dy = particle.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  return distance < particle.radius;
}

/**
 * Check if a particle is captured by a portal.
 */
export function checkPortalCapture(particle: Particle, portal: Portal): boolean {
  const halfWidth = portal.width / 2;
  const halfHeight = portal.height / 2;
  
  return (
    particle.x >= portal.x - halfWidth &&
    particle.x <= portal.x + halfWidth &&
    particle.y >= portal.y - halfHeight &&
    particle.y <= portal.y + halfHeight
  );
}

/**
 * Update particle positions and handle collisions.
 */
export function updateParticles(
  state: GameState,
  deltaTime: number,
  silhouetteRegions: SilhouetteRegion[]
): GameState {
  if (state.status !== 'playing') return state;
  
  const updatedParticles: Particle[] = [];
  let newScore = state.score;
  let newStreak = state.streak;
  let newCombo = state.comboMultiplier;
  let newCollected = state.particlesCollected;
  let newMissed = state.particlesMissed;
  const updatedPortals = [...state.portals];
  
  for (const particle of state.particles) {
    if (particle.captured || particle.missed) {
      continue;
    }
    
    // Update position
    let newX = particle.x + particle.vx * deltaTime;
    let newY = particle.y + particle.vy * deltaTime;
    
    // Bounce off walls
    if (newX < particle.radius || newX > 1 - particle.radius) {
      newX = Math.max(particle.radius, Math.min(1 - particle.radius, newX));
      particle.vx *= -0.8; // Dampen bounce
    }
    
    const updatedParticle = { ...particle, x: newX, y: newY };

    // Check silhouette collisions (block/deflect)
    for (const silhouette of silhouetteRegions) {
      if (checkSilhouetteCollision(updatedParticle, silhouette)) {
        // Deflect particle based on silhouette position
        const centerX = silhouette.x + silhouette.width / 2;
        const deflectX = (updatedParticle.x - centerX) * 0.5;
        updatedParticle.vx += deflectX;
        updatedParticle.vy *= 0.5; // Slow down when blocked
        break;
      }
    }
    
    // Check portal capture
    let captured = false;
    for (let i = 0; i < updatedPortals.length; i++) {
      if (checkPortalCapture(updatedParticle, updatedPortals[i])) {
        captured = true;
        updatedParticle.captured = true;
        
        if (updatedParticle.type === 'obstacle') {
          // Penalty for capturing obstacle
          newScore = Math.max(0, newScore - 50);
          newStreak = 0;
          newCombo = 1;
        } else {
          // Points for normal/bonus
          const basePoints = updatedParticle.type === 'bonus' ? 30 : 10;
          newStreak++;
          newCombo = Math.min(5, 1 + Math.floor(newStreak / 5) * 0.5);
          newScore += Math.floor(basePoints * newCombo);
          newCollected++;
          updatedPortals[i].particlesCollected++;
        }
        break;
      }
    }
    
    // Check if missed (fell off bottom)
    if (!captured && updatedParticle.y > 1) {
      updatedParticle.missed = true;
      if (updatedParticle.type !== 'obstacle') {
        newMissed++;
        newStreak = 0;
        newCombo = 1;
      }
    }
    
    if (!updatedParticle.captured && !updatedParticle.missed) {
      updatedParticles.push(updatedParticle);
    }
  }
  
  return {
    ...state,
    particles: updatedParticles,
    portals: updatedPortals,
    score: newScore,
    streak: newStreak,
    comboMultiplier: newCombo,
    particlesCollected: newCollected,
    particlesMissed: newMissed,
  };
}

/**
 * Spawn new particles based on spawn rate.
 */
export function spawnParticles(state: GameState, deltaTime: number): GameState {
  if (state.status !== 'playing') return state;
  
  const config = DIFFICULTY_CONFIGS[state.difficulty];
  const spawnChance = config.spawnRate * deltaTime;
  
  if (Math.random() < spawnChance && state.particlesSpawned < state.maxParticles) {
    const newParticle = spawnParticle(state.difficulty, state.particlesSpawned);
    return {
      ...state,
      particles: [...state.particles, newParticle],
      particlesSpawned: state.particlesSpawned + 1,
    };
  }
  
  return state;
}

/**
 * Update game timer.
 */
export function updateTimer(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  
  const newTimeLeft = state.timeLeft - 1;
  
  if (newTimeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      status: 'gameover',
    };
  }
  
  return {
    ...state,
    timeLeft: newTimeLeft,
  };
}

/**
 * Check if game is complete (all portals filled).
 */
export function checkGameComplete(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  
  const allPortalsFull = state.portals.every(
    (portal) => portal.particlesCollected >= portal.targetParticles
  );
  
  if (allPortalsFull) {
    return {
      ...state,
      status: 'complete',
    };
  }
  
  // Check if too many missed
  if (state.particlesMissed >= state.maxMissed) {
    return {
      ...state,
      status: 'gameover',
    };
  }
  
  return state;
}

/**
 * Calculate final score.
 */
export function calculateFinalScore(state: GameState): {
  baseScore: number;
  portalBonus: number;
  timeBonus: number;
  total: number;
} {
  const baseScore = state.score;
  const portalBonus = state.portals.reduce(
    (sum, portal) => sum + portal.particlesCollected * 20,
    0
  );
  const timeBonus = state.timeLeft * 5;
  
  return {
    baseScore,
    portalBonus,
    timeBonus,
    total: baseScore + portalBonus + timeBonus,
  };
}

/**
 * Get combo display text.
 */
export function getComboText(streak: number): string {
  if (streak >= 20) return 'LEGENDARY!';
  if (streak >= 15) return 'UNSTOPPABLE!';
  if (streak >= 10) return 'AMAZING!';
  if (streak >= 7) return 'GREAT!';
  if (streak >= 5) return 'GOOD!';
  if (streak >= 3) return 'NICE!';
  return '';
}

/**
 * Get difficulty display name.
 */
export function getDifficultyName(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy';
    case 'medium':
      return 'Medium';
    case 'hard':
      return 'Hard';
    default:
      return 'Easy';
  }
}
