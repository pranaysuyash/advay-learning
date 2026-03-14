// Jenga Game Constants
// Based on standard Jenga proportions and physics tuning

export const JENGA_CONSTANTS = {
  // Block dimensions (world units)
  // Standard Jenga ratio: 3:1:0.6 (length:width:height)
  BLOCK: {
    WIDTH: 0.75,    // Short dimension (x when oriented along z)
    HEIGHT: 0.25,   // Thickness (y)
    LENGTH: 2.25,   // Long dimension (z when oriented along x)
  },
  
  // Tower configuration
  TOWER: {
    LAYERS: 18,           // 18 complete layers = 54 blocks (standard Jenga)
    BLOCKS_PER_LAYER: 3,
    GAP: 0.01,            // Gap between blocks to prevent physics lock
    JITTER: 0.005,        // Random imperfection for realism
  },
  
  // Physics tuning (wood-like properties)
  PHYSICS: {
    MASS: 1.5,
    FRICTION: 0.8,
    RESTITUTION: 0.0,     // No bounce
    LINEAR_DAMPING: 0.1,
    ANGULAR_DAMPING: 0.1,
    GRAVITY: -9.81,
    TIMESTEP: 1 / 60,
    SUBSTEPS: 2,
    CCD_ENABLED: true,    // Continuous collision detection
  },
  
  // Drag/Grab behavior
  DRAG: {
    MAX_SPEED: 3.6,       // m/s - responsive enough for kids while still controlled
    ACCELERATION: 40,
    LATERAL_WIGGLE: 0.28, // Adds natural "wiggle in the slot" feel while pulling
    GRAB_ANGULAR_DAMPING: 2.5,
    GRAB_LINEAR_DAMPING: 0.03,
    RELEASE_ANGULAR_DAMPING: 0.1,
    RELEASE_LINEAR_DAMPING: 0.1,
    EXTRACT_DISTANCE: 1.1, // Lower threshold so extraction does not feel "stuck"
  },
  
  // Stability thresholds
  STABILITY: {
    COLLAPSE_THRESHOLD: 0.35,
    WARNING_THRESHOLD: 0.5,
    SETTLE_TIME: 650,     // faster pacing for kid gameplay
  },
  
  // Visual styling
  COLORS: {
    WOOD: 0xd4a373,
    WOOD_DARK: 0xbc8a5f,
    WOOD_LIGHT: 0xe6b88f,
    HOVER: 0xffeb3b,
    REMOVABLE: 0x4caf50,
    GRABBED: 0xff5722,
    POINTER: 0x00ff00,
    POINTER_GRAB: 0xff0000,
    VALID_TARGET: 0x00ff00,
    INVALID_TARGET: 0xff0000,
    HIGHLIGHT_BG: 0x2d3436,
    NUMBER: 0x3d2817,     // Dark brown for numbers
  },
  
  // Audio
  AUDIO: {
    GRAB_VOLUME: 0.5,
    SLIDE_VOLUME: 0.3,
    RELEASE_VOLUME: 0.4,
    COLLAPSE_VOLUME: 0.8,
    PLACE_VOLUME: 0.4,
  },
};

// Game modes - Four distinct modes as per design
export type GameMode = 'classic' | 'diceSingle' | 'diceDouble' | 'math';

export interface GameModeConfig {
  name: string;
  description: string;
  showTargetNumbers: boolean;
  diceCount: number;
  diceSides: number;
  mathMaxNumber: number;
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  classic: {
    name: 'Classic Jenga',
    description: 'Remove any legal block and place it on top',
    showTargetNumbers: false,
    diceCount: 0,
    diceSides: 0,
    mathMaxNumber: 0,
  },
  diceSingle: {
    name: 'Single Dice',
    description: 'Roll one die and remove a legal block matching that number',
    showTargetNumbers: true,
    diceCount: 1,
    diceSides: 6,
    mathMaxNumber: 0,
  },
  diceDouble: {
    name: 'Double Dice',
    description: 'Roll two dice and remove a block matching the sum (2-12)',
    showTargetNumbers: true,
    diceCount: 2,
    diceSides: 6,
    mathMaxNumber: 0,
  },
  math: {
    name: 'Math Jenga',
    description: 'Use two dice and math operations to find valid target blocks',
    showTargetNumbers: true,
    diceCount: 2,
    diceSides: 6,
    mathMaxNumber: 54,
  },
};

// Block numbering for dice/math modes
export function getBlockNumber(layer: number, slot: number, _totalLayers: number): number {
  // Number from bottom to top, left to right
  return layer * 3 + slot + 1;
}

// Camera configuration
export const CAMERA_CONFIG = {
  initial: {
    position: [0, 10, 20] as [number, number, number],
    target: [0, 4, 0] as [number, number, number],
  },
  minDistance: 12,
  maxDistance: 35,
  minHeight: 2,
  maxHeight: 25,
  orbitSpeed: 0.5,
};

// Input modes
export type InputMode = 'mouse' | 'hand' | 'touch';

// Turn phases
export type TurnPhase = 
  | 'select'      // Hovering, finding blocks
  | 'grab'        // Holding a block  
  | 'extract'     // Pulling from tower
  | 'place'       // Moving to top
  | 'settle'      // Waiting for physics
  | 'check';      // Check win/loss

// Block states
export type BlockState = 
  | 'inTower'     // Part of tower
  | 'grabbed'     // Currently held
  | 'extracted'   // Removed from tower
  | 'onTop'       // Placed on top layer
  | 'fallen';     // Fell off (game over)
