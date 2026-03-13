import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, useKeyboardControls } from '@react-three/drei';
import { useBox, useSphere, Physics } from '@react-three/cannon';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { KeyboardControls } from '@react-three/drei';
import { Trophy, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX } from 'lucide-react';

// Player character with physics
function Player({ startPosition, onJump, onLand, isMuted }: { startPosition: [number, number, number]; onJump: () => void; onLand: () => void; isMuted: boolean }) {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: startPosition,
    args: [0.3],
    material: { friction: 0.3, restitution: 0 },
    fixedRotation: true,
  }));

  const [, getKeys] = useKeyboardControls();
  const velocity = useRef([0, 0, 0]);
  const isGrounded = useRef(false);
  const wasGrounded = useRef(false);

  useEffect(() => {
    api.velocity.subscribe((v) => (velocity.current = v));
  }, [api]);

  useFrame(() => {
    const { forward, backward, left, right, jump } = getKeys();
    const speed = 5;
    const jumpForce = 8;

    // Movement
    let vx = 0;
    let vz = 0;

    if (forward) vz = -speed;
    if (backward) vz = speed;
    if (left) vx = -speed;
    if (right) vx = speed;

    // Apply horizontal movement
    api.velocity.set(vx, velocity.current[1], vz);

    // Jump
    if (jump && isGrounded.current) {
      api.velocity.set(vx, jumpForce, vz);
      isGrounded.current = false;
      onJump();
    }

    // Check if grounded (simple check)
    wasGrounded.current = isGrounded.current;
    if (Math.abs(velocity.current[1]) < 0.1) {
      isGrounded.current = true;
      // Play landing sound when just landed
      if (!wasGrounded.current && !isMuted) {
        onLand();
      }
    } else {
      isGrounded.current = false;
    }
  });

  // Load Kenney character
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
    <group ref={ref}>
      <primitive object={characterScene} scale={0.4} position={[0, -0.3, 0]} />
    </group>
  );
}

// Platform component
function Platform({ position, type = 'grass' }: { position: [number, number, number]; type?: string }) {
  const modelPath = `/assets/kenney/3d/platformer/block-${type}-large.glb`;
  const { scene } = useGLTF(modelPath);

  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [1, 1, 1],
  }));

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

  return <primitive ref={ref} object={platformScene} scale={0.5} />;
}

// Spike hazard
function Spike({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/assets/kenney/3d/platformer/spike-block.glb');

  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [0.8, 0.8, 0.8],
    isTrigger: true,
  }));

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={0.4}
    />
  );
}

// Collectible coin
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
      coinRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.1;
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

// Finish flag
function FinishFlag({ position, onReach }: { position: [number, number, number]; onReach: () => void }) {
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

// Level generator
function Level({
  onCoinCollect,
  playCollectSound,
  onFinish,
}: {
  onCoinCollect: () => void;
  playCollectSound: () => void;
  onFinish: () => void;
}) {
  // Define level layout
  const platforms = useMemo(
    () => [
      // Starting platform
      { pos: [0, 0, 0], type: 'grass' },
      { pos: [1, 0, 0], type: 'grass' },
      { pos: [2, 0, 0], type: 'grass' },

      // Gap with jump
      { pos: [3, 0.5, 0], type: 'stone' },
      { pos: [4, 1, 0], type: 'stone' },
      { pos: [5, 1, 0], type: 'stone' },

      // Higher platform
      { pos: [6, 1, 0], type: 'grass' },
      { pos: [7, 1, 0], type: 'grass' },

      // Platform with spike
      { pos: [8, 1, 0], type: 'grass' },

      // Moving up
      { pos: [9, 1.5, 0], type: 'stone' },
      { pos: [10, 2, 0], type: 'stone' },
      { pos: [11, 2, 0], type: 'grass' },

      // Side path with coins
      { pos: [11, 2, 1], type: 'grass' },
      { pos: [11, 2, 2], type: 'grass' },

      // Final stretch
      { pos: [12, 2, 0], type: 'grass' },
      { pos: [13, 2, 0], type: 'grass' },
      { pos: [14, 2, 0], type: 'grass' },
      { pos: [15, 2, 0], type: 'grass' },
    ],
    []
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
    []
  );

  return (
    <>
      {platforms.map((p, i) => (
        <Platform key={i} position={p.pos as [number, number, number]} type={p.type} />
      ))}

      {spikes.map((s, i) => (
        <Spike key={i} position={s.pos as [number, number, number]} />
      ))}

      {coins.map((c, i) => (
        <Coin key={i} position={c.pos as [number, number, number]} onCollect={onCoinCollect} playCollectSound={playCollectSound} />
      ))}

      <FinishFlag position={[15, 3, 0]} onReach={onFinish} />
    </>
  );
}

// Game UI
function GameUI({
  score,
}: {
  score: number;
}) {
  return (
    <Html position={[-3, 3, 0]}>
      <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg">
        <div className="text-sm text-slate-400">Coins</div>
        <div className="text-2xl font-bold flex items-center gap-2">
          🪙 {score}
        </div>
      </div>
    </Html>
  );
}

// Preload assets
useGLTF.preload('/assets/kenney/3d/characters/character-a.glb');
useGLTF.preload('/assets/kenney/3d/platformer/block-grass-large.glb');
useGLTF.preload('/assets/kenney/3d/platformer/block-stone-large.glb');
useGLTF.preload('/assets/kenney/3d/platformer/spike-block.glb');
useGLTF.preload('/assets/kenney/3d/platformer/coin.glb');
useGLTF.preload('/assets/kenney/3d/platformer/flag.glb');

// Main game component
export default function ObstacleCourse3D() {
  const navigate = useNavigate();
  const { playSFX, preload, setMuted } = use3DGameAudio();
  
  // Performance monitoring
  usePerformanceMonitor('ObstacleCourse3D', {
    reportToAnalytics: true,
    fpsThreshold: 30,
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

  // Preload audio on mount
  useEffect(() => {
    preload(['jump', 'land', 'coin', 'win']);
  }, [preload]);

  const handleCoinCollect = useCallback(() => {
    setScore((s) => s + 10);
  }, []);

  const playCollectSound = useCallback(() => {
    playSFX('coin', 0.6);
  }, [playSFX]);

  const handleJump = useCallback(() => {
    playSFX('jump', 0.5);
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
    <GameContainer title="3D Obstacle Course" onHome={() => navigate('/games')}>
      <KeyboardControls
        map={[
          { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
          { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
          { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
          { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
          { name: 'jump', keys: ['Space'] },
        ]}
      >
        <div className="h-[600px] w-full rounded-xl overflow-hidden bg-slate-900 relative">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
          <ThreeDGameCanvas
            cameraPosition={[5, 5, 8]}
            cameraTarget={[5, 1, 0]}
            enableOrbit={false}
            showStats={import.meta.env.DEV}
            showFPS={import.meta.env.DEV}
            backgroundColor="#0f172a"
            environment="sunset"
          >
            <Physics gravity={[0, -20, 0]}>
              <Player startPosition={[0, 2, 0]} onJump={handleJump} onLand={handleLand} isMuted={isMuted} />
              <Level onCoinCollect={handleCoinCollect} playCollectSound={playCollectSound} onFinish={() => setGameWon(true)} />
              <GameUI score={score} />

              {gameWon && (
                <Html center>
                  <div className="bg-slate-900/95 text-white p-8 rounded-2xl shadow-2xl text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h2 className="text-3xl font-bold mb-2">Level Complete!</h2>
                    <p className="text-slate-400 mb-4">Score: {score}</p>
                    <button
                      onClick={resetGame}
                      className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
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
      <div className="mt-4 flex justify-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <ArrowUp className="w-4 h-4" />
            <ArrowDown className="w-4 h-4" />
            <ArrowLeft className="w-4 h-4" />
            <ArrowRight className="w-4 h-4" />
          </div>
          <span>Move</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">SPACE</span>
          <span>Jump</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🪙</span>
          <span>Collect coins</span>
        </div>
      </div>
    </GameContainer>
    </GameShell>
  );
}
