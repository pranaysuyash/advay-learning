export { ThreeDGameCanvas } from './ThreeDGameCanvas';
export { PhysicsProvider, gravityPresets } from './PhysicsProvider';
export { FPSCounter } from './FPSCounter';
export {
  useKenneyMarble,
  useKenneyPlatformer,
  useKenneyCharacter,
  useKenneyFood,
  preloadKenneyAssets,
  applyMaterialToMesh,
  highlightMesh,
} from './useKenneyAsset';

// Re-export from drei for convenience
export { useGLTF, useTexture, useAnimations, Html } from '@react-three/drei';
export { useFrame, useThree } from '@react-three/fiber';
// Note: Rapier uses RigidBody components instead of hooks
// Import RigidBody, Collider, etc. directly from @react-three/rapier in game files
