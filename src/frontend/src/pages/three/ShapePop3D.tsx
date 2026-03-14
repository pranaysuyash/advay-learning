import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { Volume2, VolumeX, Trophy, RotateCcw, Clock } from 'lucide-react';

// Shape types
const SHAPES = [
  { type: 'box', name: 'Cube', color: '#ef4444', geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5) },
  { type: 'sphere', name: 'Sphere', color: '#3b82f6', geometry: new THREE.SphereGeometry(0.3, 32, 32) },
  { type: 'cone', name: 'Cone', color: '#22c55e', geometry: new THREE.ConeGeometry(0.3, 0.6, 32) },
  { type: 'cylinder', name: 'Cylinder', color: '#eab308', geometry: new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32) },
  { type: 'torus', name: 'Donut', color: '#ec4899', geometry: new THREE.TorusGeometry(0.3, 0.1, 16, 32) },
];

// Particle effect when shape pops
function PopParticles({ position, color }: { position: [number, number, number]; color: string }) {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      speed: Math.random() * 0.08 + 0.03,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress((p) => {
      if (p >= 1) return 1;
      return p + 0.03;
    });
    
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const angle = particles[i].angle;
        const speed = particles[i].speed;
        child.position.x += Math.cos(angle) * speed * (1 - progress);
        child.position.y += Math.sin(angle) * speed * (1 - progress);
        child.scale.setScalar(1 - progress);
      });
    }
  });

  if (progress >= 1) return null;

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p) => (
        <mesh key={p.id}>
          <sphereGeometry args={[0.04]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// Floating shape
interface ShapeProps {
  shape: typeof SHAPES[0];
  initialPosition: [number, number, number];
  onPop: () => void;
}

function FloatingShape({ shape, initialPosition, onPop }: ShapeProps) {
  const [popped, setPopped] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [hovered, setHovered] = useState(false);
  const rotationRef = useRef(0);

  useFrame(({ clock }) => {
    if (popped) return;
    
    // Float up and down
    const floatY = Math.sin(clock.elapsedTime * 2 + initialPosition[0]) * 0.2;
    setPosition((prev) => [prev[0], initialPosition[1] + floatY, prev[2]]);
    
    rotationRef.current += 0.01;
  });

  const handleClick = () => {
    if (!popped) {
      setPopped(true);
      onPop();
    }
  };

  if (popped) {
    return <PopParticles position={position} color={shape.color} />;
  }

  return (
    <mesh
      position={position}
      geometry={shape.geometry}
      onClick={handleClick}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      rotation={[rotationRef.current, rotationRef.current * 0.7, 0]}
      scale={hovered ? 1.2 : 1}
    >
      <meshStandardMaterial 
        color={shape.color} 
        emissive={hovered ? shape.color : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  );
}

// Main game component
export default function ShapePop3D() {
  const navigate = useNavigate();
  const { playSFX, setMuted, preload } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [shapes, setShapes] = useState<{ id: number; shape: typeof SHAPES[0]; position: [number, number, number] }[]>([]);
  const shapeIdRef = useRef(0);

  // Preload audio
  useEffect(() => {
    preload(['pop', 'click', 'win']);
  }, [preload]);

  // Timer
  useEffect(() => {
    if (gameOver || timeLeft <= 0) {
      if (timeLeft <= 0) setGameOver(true);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, timeLeft]);

  // Spawn shapes periodically
  useEffect(() => {
    if (gameOver) return;
    
    const interval = setInterval(() => {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const position: [number, number, number] = [
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 2,
      ];
      
      setShapes((prev) => {
        if (prev.length >= 10) return prev; // Max 10 shapes
        return [...prev, { id: shapeIdRef.current++, shape: randomShape, position }];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [gameOver]);

  const handlePop = useCallback((id: number) => {
    setScore((s) => s + 10);
    playSFX('pop', 0.4);
    
    // Remove shape after a delay
    setTimeout(() => {
      setShapes((prev) => prev.filter((s) => s.id !== id));
    }, 500);
  }, [playSFX]);

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setShapes([]);
    shapeIdRef.current = 0;
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  return (
    <GameContainer title="Shape Pop 3D" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900 to-slate-900 relative">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>

        <ThreeDGameCanvas
          cameraPosition={[0, 0, 8]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={false}
          backgroundColor="transparent"
          environment={null}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          
          {/* Shapes */}
          {shapes.map(({ id, shape, position }) => (
            <FloatingShape
              key={id}
              shape={shape}
              initialPosition={position}
              onPop={() => handlePop(id)}
            />
          ))}

          {/* UI */}
          <Html position={[-3, 4, 0]}>
            <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="text-sm text-slate-400">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </div>
          </Html>

          <Html position={[3, 4, 0]}>
            <div className="bg-slate-800/90 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <div className="text-2xl font-bold">{timeLeft}s</div>
            </div>
          </Html>

          {/* Game Over */}
          {gameOver && (
            <Html center>
              <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }} className="text-white p-8 rounded-2xl shadow-2xl text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold mb-2">Time's Up!</h2>
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
        Click on the floating shapes to pop them before time runs out!
      </p>
    </GameContainer>
  );
}
