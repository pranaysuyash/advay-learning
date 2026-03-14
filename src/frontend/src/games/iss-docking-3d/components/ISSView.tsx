import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Quaternion } from 'three';

interface ISSViewProps {
  position: Vector3;
  rotation: Quaternion;
  modelPath?: string;
}

export const ISSView: React.FC<ISSViewProps> = ({ position, rotation, modelPath }) => {
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
      <boxGeometry args={[10, 5, 2]} />
      <meshStandardMaterial color="#ecf0f1" />
      {/* Solar panels */}
      <mesh position={[0, 0, 5]}>
        <boxGeometry args={[20, 0.1, 4]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
    </mesh>
  );
};
