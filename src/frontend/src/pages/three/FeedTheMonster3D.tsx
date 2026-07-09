import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html, useAnimations } from '@react-three/drei';
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
import { Smile, Frown, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type FoodItem = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

const foodItems: FoodItem[] = [
  { id: 'apple', name: 'Apple', icon: '🍎', color: '#ef4444' },
  { id: 'banana', name: 'Banana', icon: '🍌', color: '#eab308' },
  { id: 'burger', name: 'Burger', icon: '🍔', color: '#f97316' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', color: '#fbbf24' },
  { id: 'carrot', name: 'Carrot', icon: '🥕', color: '#f97316' },
  { id: 'donut', name: 'Donut', icon: '🍩', color: '#ec4899' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const monsterStates = ['idle', 'happy', 'eating', 'sad'] as const;

function FoodItem({
  food,
  position,
  onFeed,
  cursor,
  pinch,
}: {
  food: (typeof foodItems)[0];
  position: [number, number, number];
  onFeed: () => void;
  cursor: { x: number; y: number } | null;
  pinch: {
    isPinching: boolean;
    distance: number;
    transition: 'start' | 'continue' | 'release' | 'none';
  };
}) {
  const rigidBodyRef = useRef<any>(null);
  const { scene } = useGLTF(`/assets/kenney/3d/food/${food.id}.glb`);
  const [hovered, setHovered] = useState(false);
  const fedRef = useRef(new Set<string>()); // track fed food ids for this instance

  const foodScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [scene]);

  useFrame(() => {
    if (cursor && rigidBodyRef.current) {
      const pos = rigidBodyRef.current.translation();
      const dx = cursor.x - (pos.x * 0.1 + 0.5);
      const dy = cursor.y - (pos.y * 0.1 + 0.5);
      const distance = Math.sqrt(dx * dx + dy * dy);
      setHovered(distance < 0.15);
      
      // Feed on pinch start when close
      if (pinch.transition === 'start' && distance < 0.15 && !fedRef.current.has(food.id)) {
        fedRef.current.add(food.id);
        onFeed();
      }
    } else {
      setHovered(false);
    }
  });

  const handleFoodClick = () => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setLinvel(
        {
          x: (Math.random() - 0.5) * 2,
          y: 8,
          z: 5 + Math.random() * 2,
        },
        true,
      );
      onFeed();
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      mass={1}
      colliders='ball'
      friction={0.5}
      restitution={0.3}
    >
      <group onClick={handleFoodClick}>
        <primitive object={foodScene} scale={hovered ? 0.5 : 0.4} />
      </group>
    </RigidBody>
  );
}

function Monster({ state }: { state: (typeof monsterStates)[number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(
    '/assets/kenney/3d/characters/character-b.glb',
  );
  useAnimations(animations, groupRef);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (state === 'happy') {
        groupRef.current.position.y =
          -1 + Math.abs(Math.sin(clock.elapsedTime * 10)) * 0.3;
      } else if (state === 'eating') {
        groupRef.current.scale.y = 1 + Math.sin(clock.elapsedTime * 15) * 0.1;
      } else if (state === 'sad') {
        groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.05;
      } else {
        groupRef.current.position.y =
          -1 + Math.sin(clock.elapsedTime * 2) * 0.05;
      }
    }
  });

  const monsterScene = useMemo(() => {
    const clone = scene.clone();
    const hue =
      state === 'happy'
        ? 0.3
        : state === 'sad'
          ? 0.6
          : state === 'eating'
            ? 0.15
            : 0.35;

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          const color = new THREE.Color();
          color.setHSL(hue, 0.7, 0.5);
          mat.color = color;
          mesh.material = mat;
        }
      }
    });

    return clone;
  }, [scene, state]);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <primitive object={monsterScene} scale={1.5} />

      <Html position={[0, 2, 0]} center>
        <div className='text-4xl animate-bounce'>
          {state === 'happy' && '😋'}
          {state === 'eating' && '😮'}
          {state === 'sad' && '😢'}
          {state === 'idle' && '😐'}
        </div>
      </Html>
    </group>
  );
}

function Ground() {
  return (
    <RigidBody type='fixed' position={[0, -2, 0]} colliders='cuboid'>
      <mesh receiveShadow>
        <boxGeometry args={[15, 1, 10]} />
        <meshStandardMaterial color='#3d5a80' />
      </mesh>
    </RigidBody>
  );
}

function FoodSelector({
  foods,
  onSelect,
  selectedFood,
}: {
  foods: FoodItem[];
  onSelect: (food: FoodItem) => void;
  selectedFood: FoodItem | null;
}) {
  return (
    <Html position={[0, 3, 0]} center>
      <div className='bg-white/95 p-4 rounded-xl shadow-lg backdrop-blur-sm'>
        <h3 className='font-bold mb-3 text-gray-800 text-center'>
          Choose Food
        </h3>
        <div className='flex gap-2'>
          {foods.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelect(food)}
              className={`w-14 h-14 rounded-xl border-2 transition-all ${
                selectedFood?.id === food.id
                  ? 'border-blue-500 scale-110 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              style={{ backgroundColor: food.color + '20' }}
            >
              <span className='text-2xl'>{food.icon}</span>
            </button>
          ))}
        </div>
        <p className='text-xs text-gray-500 mt-2 text-center'>
          Point at food, then point at it again to feed!
        </p>
      </div>
    </Html>
  );
}

function ScoreUI({ score, happiness }: { score: number; happiness: number }) {
  return (
    <Html position={[-4, 3, 0]}>
      <div className='bg-slate-800/90 text-white px-4 py-3 rounded-xl shadow-lg'>
        <div className='text-sm text-slate-400 mb-1'>Score</div>
        <div className='text-3xl font-bold'>{score}</div>
        <div className='mt-2 text-sm'>
          <span className='text-slate-400'>Happiness: </span>
          <span
            className={
              happiness > 70
                ? 'text-green-400'
                : happiness > 40
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }
          >
            {happiness}%
          </span>
        </div>
        <div className='w-24 h-2 bg-slate-700 rounded-full mt-1 overflow-hidden'>
          <div
            className={`h-full transition-all duration-300 ${
              happiness > 70
                ? 'bg-green-500'
                : happiness > 40
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${happiness}%` }}
          />
        </div>
      </div>
    </Html>
  );
}

foodItems.forEach((food) => {
  useGLTF.preload(`/assets/kenney/3d/food/${food.id}.glb`);
});
useGLTF.preload('/assets/kenney/3d/characters/character-b.glb');

export default function FeedTheMonster3D() {
  const navigate = useNavigate();
  const { playSFX, preload, setMuted } = use3DGameAudio();

  usePerformanceMonitor('FeedTheMonster3D', {
    warnThreshold: 30,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [happiness, setHappiness] = useState(50);
  const [monsterState, setMonsterState] =
    useState<(typeof monsterStates)[number]>('idle');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [fedFoods, setFedFoods] = useState<string[]>([]);
  const { resetAutoCompletion } = useAutoGameCompletion('feed-the-monster-3d', {
    when: happiness >= 80,
    score,
    level: 1,
    metadata: {
      happiness,
      varietyCount: new Set(fedFoods).size,
    },
  });
  const webcamRef = useRef<Webcam>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewportCursor, setViewportCursor] = useState<{ x: number; y: number } | null>(null);

  const handleFrame = useCallback((frame: any) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor({ x: tip.x, y: tip.y });
  }, []);

  const handleNoVideoFrame = useCallback(() => {
    setCursor(null);
  }, []);

  const { isReady: _isHandTrackingReady, startTracking, pinch } = useGameHandTracking({
    gameName: 'FeedTheMonster3D',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
    webcamRef: webcamRef,
  });

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
    preload(['click', 'eat', 'crunch', 'win']);
  }, [preload]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  const handleSelectFood = useCallback(
    (food: FoodItem) => {
      setSelectedFood(food);
      playSFX('click', 0.4);
    },
    [playSFX],
  );

  const handleFeed = useCallback(() => {
    if (!selectedFood) return;

    playSFX('eat', 0.6);
    setTimeout(() => playSFX('crunch', 0.5), 300);

    setMonsterState('eating');

    setTimeout(() => {
      const newFedFoods = [...fedFoods, selectedFood.id];
      setFedFoods(newFedFoods);

      const uniqueFoods = new Set(newFedFoods).size;
      const varietyBonus = uniqueFoods * 10;
      const baseScore = 10;

      setScore((s) => s + baseScore + varietyBonus);

      const newHappiness = Math.min(100, happiness + 5 + uniqueFoods * 2);
      setHappiness(newHappiness);

      if (newHappiness > 80) {
        setMonsterState('happy');
        playSFX('win', 0.7);
      } else {
        setMonsterState('sad');
        setTimeout(() => setMonsterState('idle'), 1000);
      }
    }, 500);

    setTimeout(() => {
      setMonsterState('idle');
    }, 2000);

    // Reset selection after feeding so player must choose again
    setSelectedFood(null);
  }, [selectedFood, fedFoods, happiness, playSFX]);

  const resetGame = () => {
    resetAutoCompletion();
    setScore(0);
    setHappiness(50);
    setMonsterState('idle');
    setSelectedFood(null);
    setFedFoods([]);
    playSFX('click', 0.3);
  };

  return (
    <GameShell gameId='feed-the-monster-3d' gameName='Feed the Monster 3D'>
      <GameContainer
        title='Feed the Monster 3D'
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
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
              <button
                onClick={() => { setIsPlaying(true); startTracking(); }}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg transition-all hover:scale-105"
              >
                👾 Start Feeding
              </button>
            </div>
          ) : null}

          <ThreeDGameCanvas
            cameraPosition={[0, 2, 6]}
            cameraTarget={[0, 0, 0]}
            enableOrbit={true}
            showStats={import.meta.env.DEV}
            showFPS={import.meta.env.DEV}
            backgroundColor='#1e293b'
            environment='warehouse'
          >
            <Physics gravity={[0, -9.82, 0]}>
              <Ground />
              <Monster state={monsterState} />

              {isPlaying && viewportCursor && <CursorEmbodiment position={viewportCursor} />}

              {selectedFood && (
                <FoodItem
                  food={selectedFood}
                  position={[(Math.random() - 0.5) * 4, 4, -3]}
                  onFeed={handleFeed}
                  cursor={cursor}
                  pinch={pinch}
                />
              )}

              <FoodSelector
                foods={foodItems}
                onSelect={handleSelectFood}
                selectedFood={selectedFood}
              />

              <ScoreUI score={score} happiness={happiness} />
            </Physics>
          </ThreeDGameCanvas>
        </div>

        <div className='mt-4 flex justify-between items-center px-8'>
          <div className='text-sm text-slate-500'>
            <p>🎯 Point and pinch to feed the monster!</p>
            <p>💡 Variety = more points!</p>
          </div>

          <button
            onClick={resetGame}
            className='flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors'
          >
            <RotateCcw className='w-4 h-4' />
            Reset
          </button>
        </div>

        <div className='mt-4 flex justify-center gap-4'>
          {happiness > 80 ? (
            <div className='flex items-center gap-2 text-green-500 font-bold'>
              <Smile className='w-6 h-6' />
              Monster is happy!
            </div>
          ) : happiness < 40 ? (
            <div className='flex items-center gap-2 text-red-500 font-bold'>
              <Frown className='w-6 h-6' />
              Monster is hungry!
            </div>
          ) : (
            <div className='flex items-center gap-2 text-yellow-500 font-bold'>
              <span className='text-2xl'>😐</span>
              Monster is okay
            </div>
          )}
        </div>
      </GameContainer>
    </GameShell>
  );
}
