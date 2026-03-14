import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { JENGA_CONSTANTS } from '../config/constants';

interface PointerDotProps {
  position: Vector3 | null;
  isGrabbing: boolean;
  visible: boolean;
}

export function PointerDot({ position, isGrabbing, visible }: PointerDotProps) {
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current && position) {
      groupRef.current.position.copy(position);
    }
  });
  
  if (!visible || !position) return null;
  
  const color = isGrabbing 
    ? JENGA_CONSTANTS.COLORS.POINTER_GRAB 
    : JENGA_CONSTANTS.COLORS.POINTER;
  
  return (
    <group ref={groupRef} renderOrder={999}>
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          depthTest={false}
          transparent
          opacity={0.95}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.16, 0.016, 8, 32]} />
        <meshBasicMaterial
          color={color}
          depthTest={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.22, 0.245, 32]} />
        <meshBasicMaterial
          color={isGrabbing ? '#fb923c' : '#38bdf8'}
          depthTest={false}
          transparent
          opacity={0.42}
        />
      </mesh>
    </group>
  );
}
