/**
 * ISS Docking Game Logic
 *
 * Orbital mechanics mini-game for ages 8-12
 * @ticket ISS-DOCKING
 */

export interface ShipState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  fuel: number;
}

export interface ISS {
  x: number;
  y: number;
  orbitRadius: number;
  orbitAngle: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  ship: ShipState;
  iss: ISS;
  score: number;
  timeElapsed: number;
  attempts: number;
}

export const GAME_CONFIG = {
  width: 800,
  height: 600,
  centerX: 400,
  centerY: 300,
  earthRadius: 50,
  maxFuel: 100,
  thrustPower: 0.3,
  rotationSpeed: 5,
  dockingDistance: 30,
  maxDockingSpeed: 2,
};

export function createInitialState(): GameState {
  return {
    status: 'menu',
    ship: {
      x: 200,
      y: 300,
      velocityX: 0,
      velocityY: 0,
      rotation: 0,
      fuel: GAME_CONFIG.maxFuel,
    },
    iss: {
      x: 600,
      y: 300,
      orbitRadius: 200,
      orbitAngle: 0,
    },
    score: 0,
    timeElapsed: 0,
    attempts: 0,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    status: 'playing',
    ship: {
      x: 200,
      y: 300,
      velocityX: 0,
      velocityY: 0,
      rotation: 0,
      fuel: GAME_CONFIG.maxFuel,
    },
    iss: {
      x: 600,
      y: 300,
      orbitRadius: 200,
      orbitAngle: 0,
    },
    timeElapsed: 0,
    attempts: state.attempts + 1,
  };
}

export function applyThrust(state: GameState): GameState {
  if (state.ship.fuel <= 0) return state;

  const rad = (state.ship.rotation * Math.PI) / 180;
  return {
    ...state,
    ship: {
      ...state.ship,
      velocityX: state.ship.velocityX + Math.cos(rad) * GAME_CONFIG.thrustPower,
      velocityY: state.ship.velocityY + Math.sin(rad) * GAME_CONFIG.thrustPower,
      fuel: state.ship.fuel - 1,
    },
  };
}

export function rotateShip(state: GameState, direction: 'left' | 'right'): GameState {
  return {
    ...state,
    ship: {
      ...state.ship,
      rotation: state.ship.rotation + (direction === 'left' ? -GAME_CONFIG.rotationSpeed : GAME_CONFIG.rotationSpeed),
    },
  };
}

export function updatePhysics(state: GameState): GameState {
  // Update ship position
  let newX = state.ship.x + state.ship.velocityX;
  let newY = state.ship.y + state.ship.velocityY;

  // Boundary check
  newX = Math.max(20, Math.min(GAME_CONFIG.width - 20, newX));
  newY = Math.max(20, Math.min(GAME_CONFIG.height - 20, newY));

  // Update ISS orbit
  const newOrbitAngle = state.iss.orbitAngle + 0.005;
  const issX = GAME_CONFIG.centerX + Math.cos(newOrbitAngle) * state.iss.orbitRadius;
  const issY = GAME_CONFIG.centerY + Math.sin(newOrbitAngle) * state.iss.orbitRadius;

  return {
    ...state,
    ship: {
      ...state.ship,
      x: newX,
      y: newY,
    },
    iss: {
      ...state.iss,
      x: issX,
      y: issY,
      orbitAngle: newOrbitAngle,
    },
  };
}

export function checkDocking(state: GameState): { success: boolean; reason?: string } {
  const dx = state.ship.x - state.iss.x;
  const dy = state.ship.y - state.iss.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = Math.sqrt(state.ship.velocityX ** 2 + state.ship.velocityY ** 2);

  if (distance > GAME_CONFIG.dockingDistance) {
    return { success: false, reason: 'Too far from ISS' };
  }

  if (speed > GAME_CONFIG.maxDockingSpeed) {
    return { success: false, reason: 'Approaching too fast' };
  }

  return { success: true };
}

export function updateGame(state: GameState): GameState {
  // Check fuel
  if (state.ship.fuel <= 0) {
    return { ...state, status: 'failure' };
  }

  // Check docking
  const docking = checkDocking(state);
  if (docking.success) {
    const fuelBonus = state.ship.fuel;
    const timeBonus = Math.max(0, 100 - state.timeElapsed);
    return {
      ...state,
      status: 'success',
      score: state.score + 100 + fuelBonus + timeBonus,
    };
  }

  return updatePhysics(state);
}

export function calculateDistanceToISS(state: GameState): number {
  const dx = state.ship.x - state.iss.x;
  const dy = state.ship.y - state.iss.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculateSpeed(state: GameState): number {
  return Math.sqrt(state.ship.velocityX ** 2 + state.ship.velocityY ** 2);
}
