import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import Webcam from 'react-webcam';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { Volume2, VolumeX, Trophy, RotateCcw } from 'lucide-react';

const FRUITS = [
  { id: 'apple', name: 'Apple', color: '#ef4444', points: 10 },
  { id: 'banana', name: 'Banana', color: '#eab308', points: 15 },
  { id: 'orange', name: 'Orange', color: '#f97316', points: 20 },
  { id: 'watermelon', name: 'Watermelon', color: '#22c55e', points: 25 },
];

function SliceParticles({ position, color }: { position: [number, number, number]; color: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * Math.PI * 2,
      speed: Math.random() * 0.1 + 0.05,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress((p) => Math.min(p + 0.05, 1));
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const angle = particles[i].angle;
        const speed = particles[i].speed;
        child.position.x += Math.cos(angle) * speed;
        child.position.y += Math.sin(angle) * speed - 0.01;
        child.position.z += Math.random() * 0.02;
      });
    }
  });

  if (progress >= 1) return null;

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p) => (
        <mesh key={p.id} position={[0, 0, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

interface FruitProps {
  fruit: typeof FRUITS[0];
  onSlice: (points: number) => void;
  onMiss: () => void;
  cursor: { x: number; y: number } | null;
}

function FlyingFruit({ fruit, onSlice, onMiss, cursor }: FruitProps) {
  const [sliced, setSliced] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, -3, 0]);
  const [rotation, setRotation] = useState(0);
  const velocityRef = useRef({ x: (Math.random() - 0.5) * 0.05, y: 0.1 + Math.random() * 0.05 });
  const { scene } = useGLTF(`/assets/kenney/3d/food/${fruit.id}.glb`);
  
  const fruitScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame(() => {
    if (sliced) return;
    
    setPosition((prev) => {
      const newY = prev[1] + velocityRef.current.y;
      const newX = prev[0] + velocityRef.current.x;
      velocityRef.current.y -= 0.003;
      
      if (newY < -5) {
        onMiss();
        return [0, -3, 0];
      }
      
      return [newX, newY, prev[2]];
    });
    
    setRotation((r) => r + 0.02);

    if (cursor) {
      const dx = cursor.x - (position[0] * 0.1 + 0.5);
      const dy = cursor.y - (position[1] * 0.1 + 0.5);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 0.12) {
        handleClick();
      }
    }
  });

  const handleClick = () => {
    if (!sliced) {
      setSliced(true);
      onSlice(fruit.points);
    }
  };

  if (sliced) {
    return <SliceParticles position={position} color={fruit.color} />;
  }

  return (
    <group 
      position={position} 
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'crosshair'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <primitive object={fruitScene} scale={0.5} rotation={[0, rotation, 0]} />
    </group>
  );
}

FRUITS.forEach((fruit) => {
  useGLTF.preload(`/assets/kenney/3d/food/${fruit.id}.glb`);
});

export default function CuttingPractice3D() {
  const navigate = useNavigate();
  const { playSFX, setMuted, preload } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [fruits, setFruits] = useState<{ id: number; fruit: typeof FRUITS[0] }[]>([]);
  const fruitIdRef = useRef(0);
  const webcamRef = useRef<Webcam>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  usePerformanceMonitor('CuttingPractice3D', { warnThreshold: 30 });
  const { resetAutoCompletion: _resetAutoCompletion } = useAutoGameCompletion('cutting-practice-3d', {
    when: gameOver,
    score,
    level: 1,
    metadata: { lives },
  });

  const handleFrame = useCallback((frame: any) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor({ x: tip.x, y: tip.y });
  }, []);

  const handleNoVideoFrame = useCallback(() => {
    setCursor(null);
  }, []);

  const { isReady: _isHandTrackingReady, startTracking } = useGameHandTracking({
    gameName: 'CuttingPractice3D',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
    webcamRef: webcamRef,
  });
  const [viewportCursor, setViewportCursor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (cursor) {
      setViewportCursor({ x: cursor.x * window.innerWidth, y: cursor.y * window.innerHeight });
    } else {
      setViewportCursor(null);
    }
  }, [cursor]);

  useEffect(() => {
    preload(['click', 'crunch', 'win']);
  }, [preload]);

  useEffect(() => {
    if (gameOver || lives <= 0 || !isPlaying) return;
    
    const interval = setInterval(() => {
      const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      setFruits((prev) => [...prev, { id: fruitIdRef.current++, fruit: randomFruit }]);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameOver, lives]);

  const handleSlice = useCallback((points: number) => {
    setScore((s) => s + points);
    playSFX('crunch', 0.5);
  }, [playSFX]);

  const handleMiss = useCallback(() => {
    setLives((l) => {
      const newLives = l - 1;
      if (newLives <= 0) {
        setGameOver(true);
        playSFX('win', 0.7);
      }
      return newLives;
    });
    setFruits((prev) => prev.slice(1));
  }, [playSFX]);

  const handleRemoveFruit = useCallback((id: number) => {
    setFruits((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setFruits([]);
    fruitIdRef.current = 0;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  return (
    <GameContainer title="Fruit Ninja 3D" onHome={() => navigate('/games')} webcamRef={webcamRef} isHandDetected={!!cursor} isPlaying={isPlaying}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        {!isPlaying ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
            <button
              onClick={() => { setIsPlaying(true); startTracking(); }}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              🍉 Start Slicing
            </button>
          </div>
        ) : null}

        <ThreeDGameCanvas
          cameraPosition={[0, 0, 8]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={false}
          backgroundColor="transparent"
          environment={null}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
          
          {isPlaying && viewportCursor && <CursorEmbodiment position={viewportCursor} />}

          {fruits.map(({ id, fruit }) => (
            <FlyingFruit
              key={id}
              fruit={fruit}
              onSlice={(points) => {
                handleSlice(points);
                handleRemoveFruit(id);
              }}
              onMiss={() => {
                handleMiss();
                handleRemoveFruit(id);
              }}
              cursor={cursor}
            />
          ))}

          <Html position={[-3, 4, 0]}>
            <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="text-sm text-slate-400">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
          </Html>

          <Html position={[3, 4, 0]}>
            <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="text-sm text-slate-400">Lives</div>
              <div className="text-2xl font-bold">{'❤️'.repeat(lives)}</div>
            </div>
          </Html>

          {gameOver && (
            <Html center>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }} className="text-white p-8 rounded-2xl shadow-2xl text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-slate-400 mb-4">Final Score: {score}</p>
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
        </ThreeDGameCanvas>
      </div>

      <p className="mt-4 text-center text-sm text-slate-500">
        Point at flying fruits to slice them! Don't let them fall.
      </p>
    </GameContainer>
  );
}
