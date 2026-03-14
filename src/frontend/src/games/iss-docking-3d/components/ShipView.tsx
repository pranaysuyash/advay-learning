import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Quaternion } from 'three';

interface ShipViewProps {
  position: Vector3;
  rotation: Quaternion;
  modelPath?: string;
}

export const ShipView: React.FC<ShipViewProps> = ({ position, rotation, modelPath }) => {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useGLTF(modelPath || '') as any;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(position);
      meshRef.current.quaternion.copy(rotation);
    }
  });

  if (scene) {
    return <primitive object={scene} ref={meshRef} />;
  }

  // Fallback placeholder
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 2]} />
      <meshStandardMaterial color="#3498db" />
    </mesh>
  );
};
