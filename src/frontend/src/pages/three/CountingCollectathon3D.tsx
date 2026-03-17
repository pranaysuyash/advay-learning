import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, useKeyboardControls } from '@react-three/drei';
import { RigidBody, Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import {
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { KeyboardControls } from '@react-three/drei';

// Collectible numbers
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Player character
function Player({
  startPosition,
  onJump,
}: {
  startPosition: [number, number, number];
  onJump?: () => void;
}) {
  const rigidBodyRef = useRef<any>(null);
  const [, getKeys] = useKeyboardControls();
  const velocity = useRef([0, 0, 0]);
  const isGrounded = useRef(false);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const { forward, backward, left, right, jump } = getKeys();
    const speed = 6;
    const jumpForce = 10;

    let vx = 0;
    let vz = 0;

    if (forward) vz = -speed;
    if (backward) vz = speed;
    if (left) vx = -speed;
    if (right) vx = speed;

    // Get current velocity
    const currentVel = rigidBodyRef.current.linvel();
    velocity.current = [currentVel.x, currentVel.y, currentVel.z];

    // Set new velocity
    rigidBodyRef.current.setLinvel({ x: vx, y: currentVel.y, z: vz }, true);

    if (jump && isGrounded.current) {
      rigidBodyRef.current.setLinvel({ x: vx, y: jumpForce, z: vz }, true);
      isGrounded.current = false;
      onJump?.();
    }

    if (Math.abs(currentVel.y) < 0.01) {
      isGrounded.current = true;
    }
  });

  const { scene } = useGLTF('/assets/kenney/3d/characters/character-a.glb');

  const characterScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={startPosition}
      mass={1}
      colliders='ball'
      restitution={0}
      friction={0.3}
      lockRotations
    >
      <primitive object={characterScene} scale={0.5} position={[0, -0.4, 0]} />
    </RigidBody>
  );
}

// Collectible number
function CollectibleNumber({
  number,
  position,
  onCollect,
  isNext,
}: {
  number: number;
  position: [number, number, number];
  onCollect: () => void;
  isNext: boolean;
}) {
  const [collected, setCollected] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 2;
      meshRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={() => {
        if (isNext) {
          setCollected(true);
          onCollect();
        }
      }}
    >
      {/* Number display */}
      <mesh>
        <boxGeometry args={[0.6, 0.6, 0.1]} />
        <meshStandardMaterial
          color={isNext ? '#22c55e' : '#64748b'}
          emissive={isNext ? '#22c55e' : '#000000'}
          emissiveIntensity={isNext ? 0.3 : 0}
        />
      </mesh>

      {/* Text label */}
      <Html center distanceFactor={8}>
        <div
          className={`text-2xl font-bold ${isNext ? 'text-white' : 'text-slate-400'}`}
        >
          {number}
        </div>
      </Html>
    </group>
  );
}

// Ground platform
function Ground() {
  return (
    <RigidBody type='fixed' position={[0, -1, 0]} colliders='cuboid'>
      <mesh receiveShadow>
        <boxGeometry args={[20, 1, 20]} />
        <meshStandardMaterial color='#3d5a80' />
      </mesh>
    </RigidBody>
  );
}

// Preload assets
useGLTF.preload('/assets/kenney/3d/characters/character-a.glb');

// Main game component
export default function CountingCollectathon3D() {
  const navigate = useNavigate();
  const { playSFX, setMuted, preload } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [nextNumber, setNextNumber] = useState(1);
  const [gameWon, setGameWon] = useState(false);
  const [numbers, setNumbers] = useState<
    { id: number; number: number; position: [number, number, number] }[]
  >([]);

  // Preload audio
  useEffect(() => {
    preload(['coin', 'win', 'jump']);
  }, [preload]);

  // Generate numbers on mount
  useEffect(() => {
    const nums = NUMBERS.map((num, i) => ({
      id: i,
      number: num,
      position: [
        (Math.random() - 0.5) * 12,
        0.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 12,
      ] as [number, number, number],
    }));
    setNumbers(nums);
  }, []);

  const handleCollect = useCallback(
    (number: number) => {
      if (number === nextNumber) {
        setScore((s) => s + 10);
        playSFX('coin', 0.5);

        if (number === 10) {
          setGameWon(true);
          playSFX('win', 0.7);
        } else {
          setNextNumber((n) => n + 1);
        }
      }
    },
    [nextNumber, playSFX],
  );

  const handleJump = useCallback(() => {
    playSFX('jump', 0.3);
  }, [playSFX]);

  const resetGame = () => {
    setScore(0);
    setNextNumber(1);
    setGameWon(false);
    // Regenerate positions
    const nums = NUMBERS.map((num, i) => ({
      id: i,
      number: num,
      position: [
        (Math.random() - 0.5) * 12,
        0.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 12,
      ] as [number, number, number],
    }));
    setNumbers(nums);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('coin', 0.3);
  };

  return (
    <GameContainer
      title='Counting Adventure 3D'
      onHome={() => navigate('/games')}
    >
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <div
          className='h-[600px] w-full rounded-xl overflow-hidden relative'
          style={{ backgroundColor: 'rgb(15, 23, 42)' }}
        >
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className='absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors'
          >
            {isMuted ? (
              <VolumeX className='w-5 h-5 text-white' />
            ) : (
              <Volume2 className='w-5 h-5 text-white' />
            )}
          </button>

          <ThreeDGameCanvas
            cameraPosition={[8, 8, 8]}
            cameraTarget={[0, 0, 0]}
            enableOrbit={false}
            showStats={false}
            backgroundColor='#0f172a'
            environment='sunset'
          >
            <Physics gravity={[0, -15, 0]}>
              <Player startPosition={[0, 2, 0]} onJump={handleJump} />
              <Ground />

              {numbers.map(({ id, number, position }) => (
                <CollectibleNumber
                  key={id}
                  number={number}
                  position={position}
                  onCollect={() => handleCollect(number)}
                  isNext={number === nextNumber}
                />
              ))}

              {/* UI */}
              <Html position={[-4, 3, 0]}>
                <div className='bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg'>
                  <div className='text-sm text-slate-400'>Score</div>
                  <div className='text-2xl font-bold'>{score}</div>
                </div>
              </Html>

              <Html position={[4, 3, 0]}>
                <div className='bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg'>
                  <div className='text-sm text-slate-400'>Find Number</div>
                  <div className='text-3xl font-bold text-green-400'>
                    {nextNumber}
                  </div>
                </div>
              </Html>

              {/* Win screen */}
              {gameWon && (
                <Html center>
                  <div
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
                    className='text-white p-8 rounded-2xl shadow-2xl text-center'
                  >
                    <Trophy className='w-16 h-16 mx-auto mb-4 text-yellow-400' />
                    <h2 className='text-3xl font-bold mb-2'>You Win!</h2>
                    <p className='text-slate-400 mb-4'>
                      You collected all numbers!
                    </p>
                    <p className='text-xl font-bold mb-4'>Score: {score}</p>
                    <button
                      onClick={resetGame}
                      className='flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-colors'
                    >
                      <RotateCcw className='w-5 h-5' />
                      Play Again
                    </button>
                  </div>
                </Html>
              )}
            </Physics>
          </ThreeDGameCanvas>
        </div>
      </KeyboardControls>

      {/* Controls */}
      <div className='mt-4 flex justify-center gap-6 text-sm text-slate-500'>
        <div className='flex items-center gap-2'>
          <div className='flex gap-1'>
            <ArrowUp className='w-4 h-4' />
            <ArrowDown className='w-4 h-4' />
            <ArrowLeft className='w-4 h-4' />
            <ArrowRight className='w-4 h-4' />
          </div>
          <span>Move</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='px-2 py-1 bg-slate-200 rounded text-xs font-mono'>
            SPACE
          </span>
          <span>Jump</span>
        </div>
        <div className='flex items-center gap-2'>
          <span>🎯</span>
          <span>Collect numbers in order (1-10)</span>
        </div>
      </div>
    </GameContainer>
  );
}
