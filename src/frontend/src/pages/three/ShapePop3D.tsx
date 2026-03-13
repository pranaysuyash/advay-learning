import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { Trophy, RotateCcw, Volume2, VolumeX, Clock, Target } from 'lucide-react';

// Shape types
const SHAPE_TYPES = ['cube', 'sphere', 'cylinder'] as const;
type ShapeType = typeof SHAPE_TYPES[number];

const SHAPE_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6', '#f97316'];

interface ShapeData {
  id: string;
  type: ShapeType;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  rotVelocity: [number, number, number];
  scale: number;
  popped: boolean;
  spawnTime: number;
}

// Pop particle effect
function PopEffect({ position, color, onComplete }: { 
  position: [number, number, number]; 
  color: string;
  onComplete: () => void;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      speed: Math.random() * 0.2 + 0.1,
      size: Math.random() * 0.08 + 0.04,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame((_, delta) => {
    setProgress((p) => {
      const newP = p + delta * 2;
      if (newP >= 1) {
        setTimeout(onComplete, 0);
        return 1;
      }
      return newP;
    });

    if (groupRef.current) {
      particles.forEach((p, i) => {
        const mesh = groupRef.current?.children[i] as THREE.Mesh;
        if (mesh) {
          mesh.position.x = Math.cos(p.angle) * progress * p.speed * 3;
          mesh.position.y = Math.sin(p.angle) * progress * p.speed * 3;
          mesh.position.z = Math.sin(progress * Math.PI) * 0.5;
          mesh.scale.setScalar(1 - progress);
        }
      });
      groupRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p) => (
        <mesh key={p.id}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={1 - progress} />
        </mesh>
      ))}
    </group>
  );
}

// Shape component
function Shape({
  shape,
  onPop,
}: {
  shape: ShapeData;
  onPop: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current && !shape.popped) {
      // Float and rotate
      meshRef.current.rotation.x += shape.rotVelocity[0] * delta;
      meshRef.current.rotation.y += shape.rotVelocity[1] * delta;
      meshRef.current.rotation.z += shape.rotVelocity[2] * delta;

      // Gentle bobbing
      meshRef.current.position.y = shape.position[1] + Math.sin(state.clock.elapsedTime * 2 + shape.position[0]) * 0.2;

      // Scale hover effect
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
    }
  });

  const handleClick = useCallback(() => {
    if (!shape.popped) {
      onPop(shape.id);
    }
  }, [shape.id, shape.popped, onPop]);

  if (shape.popped) {
    return null;
  }

  const geometry = useMemo(() => {
    switch (shape.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [shape.type]);

  return (
    <mesh
      ref={meshRef}
      position={shape.position}
      rotation={shape.rotation}
      onClick={handleClick}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial 
        color={shape.color} 
        roughness={0.3} 
        metalness={0.1}
        emissive={hovered ? shape.color : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}

// Background stars
function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 10,
      ] as [number, number, number],
      size: Math.random() * 0.05 + 0.02,
    }));
  }, []);

  return (
    <>
      {stars.map((star) => (
        <mesh key={star.id} position={star.position}>
          <sphereGeometry args={[star.size, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </>
  );
}

// Main game component
export default function ShapePop3D() {
  const navigate = useNavigate();
  const { playSFX, preload, setMuted } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  
  // Performance monitoring
  usePerformanceMonitor('ShapePop3D', {
    reportToAnalytics: true,
    fpsThreshold: 30,
  });
  const [score, setScore] = useState(0);
  const [shapes, setShapes] = useState<ShapeData[]>([]);
  const [effects, setEffects] = useState<
    { id: string; position: [number, number, number]; color: string }[]
  >([]);
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const shapeIdCounter = useRef(0);
  const spawnTimer = useRef(0);

  // Preload audio
  useEffect(() => {
    preload(['pop', 'win', 'click']);
  }, [preload]);

  // Game timer
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameActive(false);
            setGameOver(true);
            playSFX('win', 0.5);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameActive, timeLeft, playSFX]);

  // Spawn shape
  const spawnShape = useCallback(() => {
    const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 6;
    const z = (Math.random() - 0.5) * 5;

    const newShape: ShapeData = {
      id: `shape-${shapeIdCounter.current++}`,
      type,
      color,
      position: [x, y, z],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      rotVelocity: [(Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5],
      scale: 1,
      popped: false,
      spawnTime: Date.now(),
    };
    setShapes((prev) => [...prev, newShape]);
  }, []);

  // Pop shape
  const handlePop = useCallback(
    (id: string) => {
      playSFX('pop', 0.5);
      
      setShapes((prev) => {
        const shape = prev.find((s) => s.id === id);
        if (shape) {
          // Add score with combo for fast pops
          setScore((s) => s + 10);
          
          // Add effect
          setEffects((eff) => [
            ...eff,
            { id: `effect-${Date.now()}`, position: [...shape.position], color: shape.color },
          ]);
          
          // Remove effect after animation
          setTimeout(() => {
            setEffects((eff) => eff.filter((e) => e.id !== `effect-${Date.now()}`));
          }, 600);
        }
        return prev.filter((s) => s.id !== id);
      });
    },
    [playSFX]
  );

  // Game loop
  useFrame((_, delta) => {
    if (!gameActive) return;

    spawnTimer.current += delta;
    // Spawn shapes faster as time decreases
    const spawnRate = Math.max(0.5, 1.5 - (60 - timeLeft) / 60);
    if (spawnTimer.current > spawnRate) {
      // Maintain max shapes count
      if (shapes.length < 15) {
        spawnShape();
      }
      spawnTimer.current = 0;
    }
  });

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  const startGame = () => {
    setScore(0);
    setShapes([]);
    setEffects([]);
    setTimeLeft(60);
    setGameActive(true);
    setGameOver(false);
    spawnTimer.current = 0;
    playSFX('click', 0.3);
  };

  const resetGame = () => {
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setShapes([]);
    setEffects([]);
    setTimeLeft(60);
  };

  return (
    <GameContainer title="Shape Pop 3D" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 relative">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        <ThreeDGameCanvas
          cameraPosition={[0, 0, 12]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={import.meta.env.DEV}
          showFPS={import.meta.env.DEV}
          backgroundColor="transparent"
          environment={null}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-5, 5, 5]} intensity={0.5} color="#a855f7" />
          <pointLight position={[5, -5, 5]} intensity={0.5} color="#3b82f6" />

          <StarField />

          {shapes.map((shape) => (
            <Shape key={shape.id} shape={shape} onPop={handlePop} />
          ))}

          {effects.map((effect) => (
            <PopEffect
              key={effect.id}
              position={effect.position}
              color={effect.color}
              onComplete={() => setEffects((prev) => prev.filter((e) => e.id !== effect.id))}
            />
          ))}

          {/* Score display */}
          <Html position={[-4, 3.5, 0]}>
            <div className="bg-slate-800/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-sm text-slate-400">Score</div>
              <div className="text-3xl font-bold">{score}</div>
            </div>
          </Html>

          {/* Timer display */}
          <Html position={[4, 3.5, 0]}>
            <div className="bg-slate-800/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="text-sm text-slate-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Time
              </div>
              <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeLeft}s
              </div>
            </div>
          </Html>

          {/* Start screen */}
          {!gameActive && !gameOver && (
            <Html center>
              <div className="bg-[#FFF8F0] text-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm">
                <Target className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <h2 className="text-2xl font-bold mb-2">Shape Pop 3D</h2>
                <p className="text-slate-400 mb-6">
                  Pop as many shapes as you can in 60 seconds!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  Start Game
                </button>
              </div>
            </Html>
          )}

          {/* Game over screen */}
          {gameOver && (
            <Html center>
              <div className="bg-[#FFF8F0] text-gray-800 p-8 rounded-2xl shadow-2xl text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold mb-2">Time's Up!</h2>
                <p className="text-slate-400 mb-2">Final Score</p>
                <p className="text-5xl font-bold text-purple-400 mb-6">{score}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-bold transition-all"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Menu
                  </button>
                </div>
              </div>
            </Html>
          )}
        </ThreeDGameCanvas>
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-between items-center px-8">
        <div className="text-sm text-slate-500">
          <p>🎯 Click shapes to pop them!</p>
          <p>⏱️ You have 60 seconds!</p>
        </div>

        {gameActive && (
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Stop
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{score}</div>
          <div className="text-xs text-slate-500">Points</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{shapes.length}</div>
          <div className="text-xs text-slate-500">Shapes on Screen</div>
        </div>
        <div className="bg-green-50 p-3 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-600">{Math.max(0, timeLeft)}s</div>
          <div className="text-xs text-slate-500">Time Left</div>
        </div>
      </div>
    </GameContainer>
  );
}
