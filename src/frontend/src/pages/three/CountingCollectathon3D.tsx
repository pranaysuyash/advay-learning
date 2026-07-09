import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { RigidBody, Physics } from '@react-three/rapier';
import * as THREE from 'three';
import Webcam from 'react-webcam';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import {
  Volume2,
  VolumeX,
  Trophy,
  RotateCcw,
} from 'lucide-react';

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function Player({
  startPosition,
  cursor,
  pinch,
}: {
  startPosition: [number, number, number];
  cursor: { x: number; y: number } | null;
  pinch: { isPinching: boolean } | undefined;
}) {
  const rigidBodyRef = useRef<any>(null);
  const isGrounded = useRef(false);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const speed = 6;

    let vx = 0;
    let vz = 0;

    if (cursor) {
      const centerX = 0.5;
      const centerY = 0.5;
      const dx = cursor.x - centerX;
      const dy = cursor.y - centerY;

      if (Math.abs(dx) > 0.1) {
        vx = dx > 0 ? speed : -speed;
      }
      if (Math.abs(dy) > 0.1) {
        vz = dy > 0 ? speed : -speed;
      }
    }

    const currentVel = rigidBodyRef.current.linvel();
    rigidBodyRef.current.setLinvel({ x: vx, y: currentVel.y, z: vz }, true);
  });

  // Pinch-to-jump
  useEffect(() => {
    if (pinch?.isPinching && isGrounded.current) {
      const jumpForce = 10;
      rigidBodyRef.current?.setLinvel({ x: 0, y: jumpForce, z: 0 }, true);
      isGrounded.current = false;
    }
  }, [pinch?.isPinching]);

  const handleCollisionEnter = useCallback(() => {
    isGrounded.current = true;
  }, []);

  const handleCollisionExit = useCallback(() => {
    isGrounded.current = false;
  }, []);

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
      onCollisionEnter={handleCollisionEnter}
      onCollisionExit={handleCollisionExit}
    >
      <primitive object={characterScene} scale={0.5} position={[0, -0.4, 0]} />
    </RigidBody>
  );
}

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
  const wasCollected = useRef(false);

  const handleCollision = useCallback(() => {
    if (isNext && !wasCollected.current) {
      wasCollected.current = true;
      setCollected(true);
      onCollect();
    }
  }, [isNext, onCollect]);

  useFrame(({ clock }) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 2;
      meshRef.current.position.y =
        Math.sin(clock.elapsedTime * 3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <RigidBody type='fixed' position={position} colliders='cuboid' sensor onIntersectionEnter={handleCollision}>
      <group ref={meshRef}>
        <mesh>
          <boxGeometry args={[0.6, 0.6, 0.1]} />
          <meshStandardMaterial
            color={isNext ? '#22c55e' : '#64748b'}
            emissive={isNext ? '#22c55e' : '#000000'}
            emissiveIntensity={isNext ? 0.3 : 0}
          />
        </mesh>

        <Html center distanceFactor={8}>
          <div
            className={`text-2xl font-bold ${isNext ? 'text-white' : 'text-slate-400'}`}
          >
            {number}
          </div>
        </Html>
      </group>
    </RigidBody>
  );
}

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

useGLTF.preload('/assets/kenney/3d/characters/character-a.glb');

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
  const webcamRef = useRef<Webcam>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  usePerformanceMonitor('CountingCollectathon3D', { warnThreshold: 30 });
  const { resetAutoCompletion } = useAutoGameCompletion('counting-collectathon-3d', {
    when: gameWon,
    score,
    level: 1,
    metadata: { nextNumber },
  });

  const handleFrame = useCallback((frame: any) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor({ x: tip.x, y: tip.y });
  }, []);

  const handleNoVideoFrame = useCallback(() => {
    setCursor(null);
  }, []);

  const { isReady: _isHandTrackingReady, startTracking, pinch } = useGameHandTracking({
    gameName: 'CountingCollectathon3D',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
    webcamRef: webcamRef,
  });
  const [viewportCursor, setViewportCursor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const update = () => {
      if (cursor) {
        setViewportCursor({ x: cursor.x * window.innerWidth, y: cursor.y * window.innerHeight });
      } else {
        setViewportCursor(null);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [cursor]);

  useEffect(() => {
    preload(['coin', 'win', 'jump']);
  }, [preload]);

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

  const resetGame = () => {
    resetAutoCompletion();
    setScore(0);
    setNextNumber(1);
    setGameWon(false);
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
      webcamRef={webcamRef}
      isHandDetected={!!cursor}
      isPlaying={isPlaying}
    >
      <div
        className='h-[600px] w-full rounded-xl overflow-hidden relative'
        style={{ backgroundColor: 'rgb(15, 23, 42)' }}
      >
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

        {!isPlaying ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
            <button
              onClick={() => { setIsPlaying(true); startTracking(); }}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              🔢 Start Counting
            </button>
          </div>
        ) : null}

        <ThreeDGameCanvas
          cameraPosition={[8, 8, 8]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={false}
          backgroundColor='#0f172a'
          environment='sunset'
        >
          <Physics gravity={[0, -15, 0]}>
            <Player startPosition={[0, 2, 0]} cursor={cursor} pinch={pinch} />
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

            {isPlaying && viewportCursor && <CursorEmbodiment position={viewportCursor} />}

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

      <div className='mt-4 flex justify-center gap-6 text-sm text-slate-500'>
        <div className='flex items-center gap-2'>
          <span>✋</span>
          <span>Move hand to walk</span>
        </div>
        <div className='flex items-center gap-2'>
          <span>🤏</span>
          <span>Pinch to jump</span>
        </div>
        <div className='flex items-center gap-2'>
          <span>🎯</span>
          <span>Collect numbers in order (1-10)</span>
        </div>
      </div>
    </GameContainer>
  );
}
