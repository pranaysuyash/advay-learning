import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

import type { TrackedHandFrame } from '../../../types/tracking';
import { use3DGameAudio } from '../../../hooks/use3DGameAudio';
import { triggerHaptic } from '../../../utils/haptics';
import {
  JENGA_CONSTANTS,
  GAME_MODES,
  type GameMode,
  type JengaGameState,
  type RapierPhysics,
} from '..';
import { TowerView } from './TowerView';
import { HandVisualization } from './HandVisualization';
import { PointerDot } from './PointerDot';
import { useGrabController } from '../hooks/useGrabController';

const ORBIT_TARGET = new THREE.Vector3(0, 4, 0);

function PhysicsSync({
  physics,
  isActive,
}: {
  physics: RapierPhysics | null;
  isActive: boolean;
}) {
  useFrame(() => {
    if (physics && isActive) {
      physics.step();
    }
  });

  return null;
}

export function settleTower(physics: RapierPhysics | null, steps: number = 30) {
  if (!physics) return;
  for (let index = 0; index < steps; index += 1) {
    physics.step();
  }
}

export function toHandMidpoint(
  frame: TrackedHandFrame,
): { x: number; y: number } | null {
  const hand = frame.primaryHand;
  if (!hand || hand.length < 9) return null;

  const thumb = hand[4];
  const index = hand[8];

  if (!thumb || !index) return null;

  return {
    x: Math.min(1, Math.max(0, 1 - (thumb.x + index.x) / 2)),
    y: Math.min(1, Math.max(0, (thumb.y + index.y) / 2)),
  };
}

interface JengaSceneProps {
  gameState: JengaGameState | null;
  physics: RapierPhysics | null;
  gameMode: GameMode;
  handPosition: { x: number; y: number } | null;
  handVisible: boolean;
  isPinching: boolean;
  useHandInput: boolean;
  pointerClient: { x: number; y: number } | null;
  orbitMinDistance: number;
  orbitMaxDistance: number;
}

export function JengaScene({
  gameState,
  physics,
  gameMode,
  handPosition,
  handVisible,
  isPinching,
  useHandInput,
  pointerClient,
  orbitMinDistance,
  orbitMaxDistance,
}: JengaSceneProps) {
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [surfacePoint, setSurfacePoint] = useState<THREE.Vector3 | null>(null);
  const { camera, gl, scene } = useThree();
  const { playSFX } = use3DGameAudio();
  const raycaster = useRef(new THREE.Raycaster());
  const wasPinchingRef = useRef(false);
  const activeGrabInputRef = useRef<'mouse' | 'hand' | null>(null);

  const handleGrabStart = useCallback(() => {
    playSFX('grab', JENGA_CONSTANTS.AUDIO.GRAB_VOLUME);
    triggerHaptic('light');
  }, [playSFX]);

  const handleGrabEnd = useCallback(
    (_: unknown, success: boolean) => {
      if (success) {
        playSFX('place', JENGA_CONSTANTS.AUDIO.PLACE_VOLUME);
        triggerHaptic('success');
        return;
      }

      playSFX('slide', JENGA_CONSTANTS.AUDIO.SLIDE_VOLUME);
    },
    [playSFX],
  );

  const targetBlockIds = useMemo(() => {
    if (!gameState) return [];
    if (gameMode === 'classic') return [];
    return gameState.getValidTargets().map((block) => block.id);
  }, [gameMode, gameState, gameState?.phase, gameState?.turn]);

  const getClientFromNormalized = useCallback(
    (point: { x: number; y: number }) => {
      const rect = gl.domElement.getBoundingClientRect();
      return {
        x: rect.left + point.x * rect.width,
        y: rect.top + point.y * rect.height,
      };
    },
    [gl.domElement],
  );

  const raycastFromClient = useCallback(
    (screenX: number, screenY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((screenX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((screenY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

      const blockMeshes: THREE.Object3D[] = [];
      scene.traverse((object: THREE.Object3D) => {
        if (object.userData?.isBlock) blockMeshes.push(object);
      });

      const intersections = blockMeshes.length
        ? raycaster.current.intersectObjects(blockMeshes, false)
        : [];
      if (!intersections.length) return null;

      const [hit] = intersections;
      return {
        blockId: hit.object.userData.blockId as string,
        point: hit.point.clone(),
      };
    },
    [camera, gl.domElement, scene],
  );

  const { grabBlock, updateDrag, release, isGrabbing } = useGrabController(
    gameState,
    {
      onGrabStart: handleGrabStart,
      onGrabEnd: handleGrabEnd,
    },
  );

  useEffect(() => {
    const activeClient =
      useHandInput && handVisible && handPosition
        ? getClientFromNormalized(handPosition)
        : pointerClient;

    if (!gameState || !activeClient) {
      setHoveredBlockId(null);
      if (!isGrabbing()) setSurfacePoint(null);
      return;
    }

    const hit = raycastFromClient(activeClient.x, activeClient.y);
    if (hit) {
      setHoveredBlockId(hit.blockId);
      setSurfacePoint(hit.point);
      return;
    }

    setHoveredBlockId(null);
    if (!isGrabbing()) setSurfacePoint(null);
  }, [
    gameState,
    handPosition,
    pointerClient,
    useHandInput,
    handVisible,
    getClientFromNormalized,
    raycastFromClient,
    isGrabbing,
  ]);

  useEffect(() => {
    if (!useHandInput || !handVisible || !handPosition || !gameState || gameState.isGameOver) {
      wasPinchingRef.current = isPinching;
      return;
    }

    const handClient = getClientFromNormalized(handPosition);
    const pinchStarted = isPinching && !wasPinchingRef.current;
    const pinchReleased = !isPinching && wasPinchingRef.current;

    if (pinchStarted && handClient && gameState.phase === 'select') {
      const hit = raycastFromClient(handClient.x, handClient.y);
      if (hit) {
        const block = gameState.tower.blocks.find((candidate) => candidate.id === hit.blockId);
        if (block && grabBlock(block, hit.point, handClient)) {
          activeGrabInputRef.current = 'hand';
        }
      }
    }

    if (isPinching && isGrabbing() && activeGrabInputRef.current === 'hand') {
      updateDrag(handClient.x, handClient.y);
    }
    if (pinchReleased && isGrabbing() && activeGrabInputRef.current === 'hand') {
      release();
      activeGrabInputRef.current = null;
    }

    wasPinchingRef.current = isPinching;
  }, [
    gameState,
    handPosition,
    handVisible,
    isPinching,
    useHandInput,
    getClientFromNormalized,
    raycastFromClient,
    grabBlock,
    updateDrag,
    release,
    isGrabbing,
  ]);

  useEffect(() => {
    if (useHandInput && activeGrabInputRef.current === 'hand' && (!handVisible || !handPosition) && isGrabbing()) {
      release();
      activeGrabInputRef.current = null;
    }
  }, [handPosition, handVisible, isGrabbing, release, useHandInput]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (isGrabbing() && activeGrabInputRef.current === 'mouse') {
        updateDrag(event.clientX, event.clientY);
      }
    };
    const handlePointerRelease = () => {
      if (isGrabbing() && activeGrabInputRef.current === 'mouse') {
        release();
        activeGrabInputRef.current = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerRelease);
    window.addEventListener('pointercancel', handlePointerRelease);
    window.addEventListener('pointerleave', handlePointerRelease);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerRelease);
      window.removeEventListener('pointercancel', handlePointerRelease);
      window.removeEventListener('pointerleave', handlePointerRelease);
    };
  }, [isGrabbing, release, updateDrag]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!gameState || gameState.isGameOver || gameState.phase !== 'select') return;
      const hit = raycastFromClient(event.clientX, event.clientY);
      if (!hit) return;
      const block = gameState.tower.blocks.find((candidate) => candidate.id === hit.blockId);
      if (!block) return;
      if (grabBlock(block, hit.point, { x: event.clientX, y: event.clientY })) {
        activeGrabInputRef.current = 'mouse';
      }
    };

    gl.domElement.addEventListener('pointerdown', handlePointerDown);
    return () => {
      gl.domElement.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [gameState, gl.domElement, raycastFromClient, grabBlock]);

  return (
    <>
      <PhysicsSync physics={physics} isActive={!gameState?.isGameOver} />

      <ambientLight intensity={0.8} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color='#ffd9a8' />
      <pointLight position={[10, 5, -10]} intensity={0.35} color='#a8dcff' />

      <Stars radius={100} depth={50} count={2500} factor={3} fade speed={0.6} />
      <fog attach='fog' args={['#dff4ff', 30, 75]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color='#d8eef7' roughness={0.92} metalness={0.02} />
      </mesh>

      {gameState && (
        <TowerView
          tower={gameState.tower}
          hoveredBlockId={hoveredBlockId}
          targetBlockIds={targetBlockIds}
          gameMode={gameMode}
          showNumbers={GAME_MODES[gameMode].showTargetNumbers}
          onBlockHover={(blockId) => setHoveredBlockId(blockId)}
        />
      )}

      {useHandInput && handPosition && handVisible && (
        <HandVisualization position={handPosition} isPinching={isPinching} camera={camera} />
      )}

      <PointerDot
        position={surfacePoint}
        isGrabbing={isPinching || isGrabbing()}
        visible={!!surfacePoint}
      />

      <OrbitControls
        enabled={!isGrabbing()}
        enablePan={false}
        enableZoom
        minDistance={orbitMinDistance}
        maxDistance={orbitMaxDistance}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={ORBIT_TARGET}
      />
    </>
  );
}

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
}

export function ModeSelector({ currentMode, onSelectMode }: ModeSelectorProps) {
  const activeClasses: Record<GameMode, string> = {
    classic: 'bg-emerald-500 text-white',
    diceSingle: 'bg-amber-400 text-white',
    diceDouble: 'bg-orange-500 text-white',
    math: 'bg-sky-500 text-white',
  };

  return (
    <div className='absolute top-4 right-4 z-40 flex flex-col gap-2'>
      {(Object.keys(GAME_MODES) as GameMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onSelectMode(mode)}
          className={`rounded-2xl px-4 py-2 text-left text-sm font-black shadow-lg transition-all ${
            currentMode === mode
              ? activeClasses[mode]
              : 'bg-[#fff8f0]/92 text-slate-900 hover:bg-white/95'
          }`}
        >
          {GAME_MODES[mode].name}
        </button>
      ))}
    </div>
  );
}
