import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

// Asset paths for different Kenney kits
export const kenneyPaths = {
  marble: (file: string) => `/assets/kenney/3d/marble/${file}`,
  platformer: (file: string) => `/assets/kenney/3d/platformer/${file}`,
  characters: (file: string) => `/assets/kenney/3d/characters/${file}`,
  food: (file: string) => `/assets/kenney/3d/food/${file}`,
  nature: (file: string) => `/assets/kenney/3d/nature/${file}`,
};

// Preload functions for critical assets
export const preloadKenneyAssets = {
  marble: (files: string[]) => {
    files.forEach(file => useGLTF.preload(kenneyPaths.marble(file)));
  },
  platformer: (files: string[]) => {
    files.forEach(file => useGLTF.preload(kenneyPaths.platformer(file)));
  },
  characters: (files: string[]) => {
    files.forEach(file => useGLTF.preload(kenneyPaths.characters(file)));
  },
  food: (files: string[]) => {
    files.forEach(file => useGLTF.preload(kenneyPaths.food(file)));
  },
};

// Hook for loading Kenney marble kit assets
export function useKenneyMarble(file: string) {
  const path = kenneyPaths.marble(file);
  const { scene, nodes, materials } = useGLTF(path);
  
  // Clone scene for independent instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Enable shadows on all meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);
  
  return { scene: clonedScene, nodes, materials };
}

// Hook for loading Kenney platformer kit assets
export function useKenneyPlatformer(file: string) {
  const path = kenneyPaths.platformer(file);
  const { scene, nodes, materials } = useGLTF(path);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);
  
  return { scene: clonedScene, nodes, materials };
}

// Hook for loading Kenney character assets
export function useKenneyCharacter(file: string) {
  const path = kenneyPaths.characters(file);
  const { scene, nodes, materials, animations } = useGLTF(path);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);
  
  return { scene: clonedScene, nodes, materials, animations };
}

// Hook for loading Kenney food assets
export function useKenneyFood(file: string) {
  const path = kenneyPaths.food(file);
  const { scene, nodes, materials } = useGLTF(path);
  
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene]);
  
  return { scene: clonedScene, nodes, materials };
}

// Helper to apply materials to specific mesh names
export function applyMaterialToMesh(
  scene: THREE.Group,
  meshName: string,
  material: THREE.Material
) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && child.name === meshName) {
      (child as THREE.Mesh).material = material;
    }
  });
}

// Helper to highlight a mesh
export function highlightMesh(
  scene: THREE.Group,
  meshName: string,
  color: string = '#FFD700',
  intensity: number = 0.3
) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && child.name === meshName) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.emissive = new THREE.Color(color);
        mat.emissiveIntensity = intensity;
        mesh.material = mat;
      }
    }
  });
}

export default {
  useKenneyMarble,
  useKenneyPlatformer,
  useKenneyCharacter,
  useKenneyFood,
  preloadKenneyAssets,
};
