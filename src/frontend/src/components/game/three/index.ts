export { ThreeDGameCanvas } from './ThreeDGameCanvas';
export { PhysicsProvider, physicsPresets } from './PhysicsProvider';
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
export { useBox, useSphere, usePlane, useCylinder } from '@react-three/cannon';
