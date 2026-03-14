// Digital Jenga 3D - Full implementation with physics
// Main component is at pages/three/DigitalJenga3D.tsx

// Domain models
export { JengaBlock, type BlockConfig } from './domain/Block';
export { JengaTower, type TowerConfig, type PlacementSpot } from './domain/Tower';
export { JengaGameState, type GameStats, type MoveRecord } from './domain/GameState';

// Physics
export { RapierPhysics, initRapier, type PhysicsWorldConfig } from './physics/RapierPhysics';

// Components
export { TowerView } from './components/TowerView';
export { BlockView } from './components/BlockView';
export { PointerDot } from './components/PointerDot';
export { HUD } from './components/HUD';
export { HandVisualization } from './components/HandVisualization';

// Hooks
export { useGrabController } from './hooks/useGrabController';
export { useGameLoop } from './hooks/useGameLoop';

// Utils
export { generateTowerBlocks, createTower, type GenerateTowerOptions } from './utils/generateTower';

// Config & Constants
export {
  JENGA_CONSTANTS,
  GAME_MODES,
  CAMERA_CONFIG,
  getBlockNumber,
  type GameMode,
  type GameModeConfig,
  type TurnPhase,
  type BlockState,
  type InputMode,
} from './config/constants';
