import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { RigidBody, Physics } from '@react-three/rapier';
import * as THREE from 'three';
import Webcam from 'react-webcam';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';

function Player({
  startPosition,
  onLand,
  isMuted,
  cursor,
  pinch,
}: {
  startPosition: [number, number, number];
  onLand: () => void;
  isMuted: boolean;
  cursor: { x: number; y: number } | null;
  pinch: { isPinching: boolean } | undefined;
}) {
  const rigidBodyRef = useRef<any>(null);
  const isGrounded = useRef(false);
  const wasGrounded = useRef(false);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const speed = 5;

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

    wasGrounded.current = isGrounded.current;
    if (Math.abs(currentVel.y) < 0.1) {
      isGrounded.current = true;
      if (!wasGrounded.current && !isMuted) {
        onLand();
      }
    } else {
      isGrounded.current = false;
    }
  });

  // Pinch-to-jump via external pinch state
  useEffect(() => {
    if (pinch?.isPinching && isGrounded.current) {
      const jumpForce = 8;
      rigidBodyRef.current?.setLinvel({ x: 0, y: jumpForce, z: 0 }, true);
      isGrounded.current = false;
    }
  }, [pinch?.isPinching]);

  const { scene } = useGLTF('/assets/kenney/3d/characters/character-a.glb');

  const characterScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
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
      <primitive object={characterScene} scale={0.4} position={[0, -0.3, 0]} />
    </RigidBody>
  );
}

function Platform({
  position,
  type = 'grass',
}: {
  position: [number, number, number];
  type?: string;
}) {
  const modelPath = `/assets/kenney/3d/platformer/block-${type}-large.glb`;
  const { scene } = useGLTF(modelPath);

  const platformScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return (
    <RigidBody type='fixed' position={position} colliders='cuboid'>
      <primitive object={platformScene} scale={0.5} />
    </RigidBody>
  );
}

function Spike({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/kenney/3d/platformer/spike-block.glb');

  return (
    <RigidBody type='fixed' position={position} colliders='cuboid' sensor>
      <primitive object={scene} scale={0.4} />
    </RigidBody>
  );
}

function Coin({
  position,
  onCollect,
  playCollectSound,
}: {
  position: [number, number, number];
  onCollect: () => void;
  playCollectSound: () => void;
}) {
  const { scene } = useGLTF('/assets/kenney/3d/platformer/coin.glb');
  const [collected, setCollected] = useState(false);
  const coinRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (coinRef.current && !collected) {
      coinRef.current.rotation.y = clock.getElapsedTime() * 3;
      coinRef.current.position.y =
        position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <group
      ref={coinRef}
      position={position}
      onClick={() => {
        setCollected(true);
        onCollect();
        playCollectSound();
      }}
    >
      <primitive object={scene} scale={0.3} />
    </group>
  );
}

function FinishFlag({
  position,
  onReach,
}: {
  position: [number, number, number];
  onReach: () => void;
}) {
  const { scene } = useGLTF('/assets/kenney/3d/platformer/flag.glb');

  return (
    <primitive
      object={scene}
      position={position}
      scale={0.5}
      onClick={onReach}
    />
  );
}

function Level({
  onCoinCollect,
  playCollectSound,
  onFinish,
}: {
  onCoinCollect: () => void;
  playCollectSound: () => void;
  onFinish: () => void;
}) {
  const platforms = useMemo(
    () => [
      { pos: [0, 0, 0], type: 'grass' },
      { pos: [1, 0, 0], type: 'grass' },
      { pos: [2, 0, 0], type: 'grass' },
      { pos: [3, 0.5, 0], type: 'stone' },
      { pos: [4, 1, 0], type: 'stone' },
      { pos: [5, 1, 0], type: 'stone' },
      { pos: [6, 1, 0], type: 'grass' },
      { pos: [7, 1, 0], type: 'grass' },
      { pos: [8, 1, 0], type: 'grass' },
      { pos: [9, 1.5, 0], type: 'stone' },
      { pos: [10, 2, 0], type: 'stone' },
      { pos: [11, 2, 0], type: 'grass' },
      { pos: [11, 2, 1], type: 'grass' },
      { pos: [11, 2, 2], type: 'grass' },
      { pos: [12, 2, 0], type: 'grass' },
      { pos: [13, 2, 0], type: 'grass' },
      { pos: [14, 2, 0], type: 'grass' },
      { pos: [15, 2, 0], type: 'grass' },
    ],
    [],
  );

  const spikes = useMemo(() => [{ pos: [8, 1.5, 0] }], []);

  const coins = useMemo(
    () => [
      { pos: [4, 2, 0] },
      { pos: [7, 2, 0] },
      { pos: [11, 3, 1] },
      { pos: [11, 3, 2] },
      { pos: [13, 3, 0] },
    ],
    [],
  );

  return (
    <>
      {platforms.map((p, i) => (
        <Platform
          key={i}
          position={p.pos as [number, number, number]}
          type={p.type}
        />
      ))}

      {spikes.map((s, i) => (
        <Spike key={i} position={s.pos as [number, number, number]} />
      ))}

      {coins.map((c, i) => (
        <Coin
          key={i}
          position={c.pos as [number, number, number]}
          onCollect={onCoinCollect}
          playCollectSound={playCollectSound}
        />
      ))}

      <FinishFlag position={[15, 3, 0]} onReach={onFinish} />
    </>
  );
}

function GameUI({ score }: { score: number }) {
  return (
    <Html position={[-3, 3, 0]}>
      <div className='bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg'>
        <div className='text-sm text-slate-400'>Coins</div>
        <div className='text-2xl font-bold flex items-center gap-2'>
          🪙 {score}
        </div>
      </div>
    </Html>
  );
}

useGLTF.preload('/assets/kenney/3d/characters/character-a.glb');
useGLTF.preload('/assets/kenney/3d/platformer/block-grass-large.glb');
useGLTF.preload('/assets/kenney/3d/platformer/block-stone-large.glb');
useGLTF.preload('/assets/kenney/3d/platformer/spike-block.glb');
useGLTF.preload('/assets/kenney/3d/platformer/coin.glb');
useGLTF.preload('/assets/kenney/3d/platformer/flag.glb');

export default function ObstacleCourse3D() {
  const navigate = useNavigate();
  const { playSFX, preload, setMuted } = use3DGameAudio();

  usePerformanceMonitor('ObstacleCourse3D', {
    warnThreshold: 30,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const { resetAutoCompletion } = useAutoGameCompletion('obstacle-course-3d', {
    when: gameWon,
    score,
    level: 1,
    metadata: {
      coinsCollected: score / 10,
    },
  });
  const webcamRef = useRef<Webcam>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFrame = useCallback((frame: any) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor({ x: tip.x, y: tip.y });
  }, []);

  const handleNoVideoFrame = useCallback(() => {
    setCursor(null);
  }, []);

  const { isReady: _isHandTrackingReady, startTracking, pinch } = useGameHandTracking({
    gameName: 'ObstacleCourse3D',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });

  useEffect(() => {
    preload(['jump', 'land', 'coin', 'win']);
  }, [preload]);

  const handleCoinCollect = useCallback(() => {
    setScore((s) => s + 10);
  }, []);

  const playCollectSound = useCallback(() => {
    playSFX('coin', 0.6);
  }, [playSFX]);

  const handleLand = useCallback(() => {
    playSFX('land', 0.3);
  }, [playSFX]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  const resetGame = () => {
    resetAutoCompletion();
    setScore(0);
    setGameWon(false);
  };

  return (
    <GameShell gameId='obstacle-course-3d' gameName='Obstacle Course 3D'>
      <GameContainer
        title='3D Obstacle Course'
        onHome={() => navigate('/games')}
        webcamRef={webcamRef}
        isHandDetected={!!cursor}
        isPlaying={isPlaying}
      >
        <div className='h-[600px] w-full rounded-xl overflow-hidden bg-[#FFF8F0] relative'>
          <button
            onClick={toggleMute}
            className='absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors'
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className='w-5 h-5 text-white' />
            ) : (
              <Volume2 className='w-5 h-5 text-white' />
            )}
          </button>

          {!isPlaying ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80">
              <button
                onClick={() => { setIsPlaying(true); startTracking(); }}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg transition-all hover:scale-105"
              >
                🏃 Start Course
              </button>
            </div>
          ) : null}

          <ThreeDGameCanvas
            cameraPosition={[5, 5, 8]}
            cameraTarget={[5, 1, 0]}
            enableOrbit={false}
            showStats={import.meta.env.DEV}
            showFPS={import.meta.env.DEV}
            backgroundColor='#0f172a'
            environment='sunset'
          >
            <Physics gravity={[0, -20, 0]}>
                <Player
                  startPosition={[0, 2, 0]}
                  onLand={handleLand}
                  isMuted={isMuted}
                  cursor={cursor}
                  pinch={pinch}
                />
              <Level
                onCoinCollect={handleCoinCollect}
                playCollectSound={playCollectSound}
                onFinish={() => setGameWon(true)}
              />
              <GameUI score={score} />

              {isPlaying && cursor && <CursorEmbodiment position={cursor} />}

              {gameWon && (
                <Html center>
                  <div className='bg-[#FFF8F0] text-gray-800 p-8 rounded-2xl shadow-2xl text-center'>
                    <Trophy className='w-16 h-16 mx-auto mb-4 text-yellow-400' />
                    <h2 className='text-3xl font-bold mb-2'>
                      Level Complete!
                    </h2>
                    <p className='text-slate-400 mb-4'>Score: {score}</p>
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
            <span>🪙</span>
            <span>Collect coins</span>
          </div>
        </div>
      </GameContainer>
    </GameShell>
  );
}
