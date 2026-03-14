import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HandVisualizationProps {
  position: { x: number; y: number }; // Normalized 0-1 from MediaPipe
  isPinching: boolean;
  camera: THREE.Camera;
}

export function HandVisualization({
  position,
  isPinching,
  camera,
}: HandVisualizationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const palmRef = useRef<THREE.Mesh>(null);
  const fingerRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Update hand position based on MediaPipe input
  useFrame(() => {
    if (!groupRef.current || !camera) return;

    // Convert normalized MediaPipe coordinates to 3D world space
    const ndcX = (1 - position.x) * 2 - 1; // Mirror X and convert to NDC
    const ndcY = -(position.y * 2 - 1);    // Flip Y and convert to NDC
    
    // Project to a plane in front of camera
    const distance = 8;
    const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Smooth interpolation
    groupRef.current.position.lerp(pos, 0.25);
    
    // Make hand face camera
    groupRef.current.lookAt(camera.position);

    // Update fingers (floating around palm)
    fingerRefs.current.forEach((finger, i) => {
      if (finger) {
        const angle = (i / 5) * Math.PI * 2;
        const spread = isPinching ? 0.2 : 0.6;
        const targetX = Math.cos(angle) * spread;
        const targetY = Math.sin(angle) * spread;
        const targetZ = 0.2;
        
        finger.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.2);
        
        // Color transition
        const material = finger.material as THREE.MeshStandardMaterial;
        material.color.lerp(
          new THREE.Color(isPinching ? '#ef4444' : '#ffffff'),
          0.1
        );
        material.emissive.lerp(
          new THREE.Color(isPinching ? '#440000' : '#444444'),
          0.1
        );
      }
    });
    
    if (palmRef.current) {
      const material = palmRef.current.material as THREE.MeshStandardMaterial;
      material.color.lerp(
        new THREE.Color(isPinching ? '#ef4444' : '#ffffff'),
        0.1
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Palm sphere */}
      <mesh ref={palmRef} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#444444"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
      
      {/* Finger spheres */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          ref={(el) => (fingerRefs.current[i] = el)}
          castShadow
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#444444"
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}
