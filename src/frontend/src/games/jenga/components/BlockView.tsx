import { useRef, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { BoxGeometry } from 'three';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { JengaBlock } from '../domain/Block';
import { JENGA_CONSTANTS, GameMode } from '../config/constants';

interface BlockViewProps {
  block: JengaBlock;
  isHovered: boolean;
  isTarget: boolean;
  gameMode: GameMode;
  showNumbers: boolean;
  onHover: (hovered: boolean) => void;
}

export function BlockView({
  block,
  isHovered,
  isTarget,
  showNumbers,
  onHover,
}: BlockViewProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Sync mesh position/rotation with physics body
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(block.position);
      meshRef.current.quaternion.copy(block.rotation);
    }
  });

  // Calculate render color
  const color = useMemo(() => {
    if (block.isGrabbed) {
      return JENGA_CONSTANTS.COLORS.GRABBED;
    }
    if (isTarget && block.isInTower) {
      return JENGA_CONSTANTS.COLORS.REMOVABLE;
    }
    if (isHovered && block.isInTower) {
      return JENGA_CONSTANTS.COLORS.HOVER;
    }
    return block.woodColor;
  }, [block, isHovered, isTarget]);

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(true);
  };

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(false);
  };

  const sideOffset =
    block.orientation === 'z'
      ? [0, 0, JENGA_CONSTANTS.BLOCK.LENGTH + 0.02]
      : [JENGA_CONSTANTS.BLOCK.LENGTH + 0.02, 0, 0];

  const oppositeSideOffset =
    block.orientation === 'z'
      ? [0, 0, -JENGA_CONSTANTS.BLOCK.LENGTH - 0.02]
      : [-JENGA_CONSTANTS.BLOCK.LENGTH - 0.02, 0, 0];

  // Don't render fallen blocks
  if (block.hasFallen) return null;

  return (
    <group ref={meshRef}>
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
        geometry={blockGeometry}
        userData={{ isBlock: true, blockId: block.id }}
      >
        <meshStandardMaterial
          color={color}
          emissive={
            block.isGrabbed
              ? '#b45309'
              : isTarget
                ? '#15803d'
                : isHovered
                  ? '#b45309'
                  : '#000000'
          }
          emissiveIntensity={
            block.isGrabbed ? 0.8 : isTarget ? 0.6 : isHovered ? 0.4 : 0
          }
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {showNumbers && (
        <>
          <group
            position={[0, JENGA_CONSTANTS.BLOCK.HEIGHT + 0.03, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <NumberSticker number={block.number} isTarget={isTarget} />
          </group>

          <group position={sideOffset as [number, number, number]}>
            <NumberSticker
              number={block.number}
              isTarget={isTarget}
              size={0.28}
            />
          </group>

          <group position={oppositeSideOffset as [number, number, number]}>
            <NumberSticker
              number={block.number}
              isTarget={isTarget}
              size={0.28}
            />
          </group>
        </>
      )}
    </group>
  );
}

function NumberSticker({
  number,
  isTarget,
  size = 0.4,
}: {
  number: number;
  isTarget: boolean;
  size?: number;
}) {
  const bgSize = Math.max(0.72, size * 2.35);

  return (
    <Billboard>
      <mesh>
        <planeGeometry args={[bgSize, bgSize * 0.72]} />
        <meshBasicMaterial
          color={isTarget ? '#86efac' : '#fff8e6'}
          transparent
          opacity={0.98}
        />
      </mesh>
      <Text
        fontSize={size}
        color={isTarget ? '#14532d' : '#5b3716'}
        anchorX='center'
        anchorY='middle'
        fontWeight='bold'
        maxWidth={2}
        outlineWidth={0.015}
        outlineColor={isTarget ? '#dcfce7' : '#f6e7cc'}
        position={[0, 0, 0.01]}
      >
        {number}
      </Text>
    </Billboard>
  );
}

// Reuse geometry for performance
const blockGeometry = new BoxGeometry(
  JENGA_CONSTANTS.BLOCK.WIDTH * 2,
  JENGA_CONSTANTS.BLOCK.HEIGHT * 2,
  JENGA_CONSTANTS.BLOCK.LENGTH * 2,
);
