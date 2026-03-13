import { useState, useMemo, Suspense, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGLTF, Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { Check, Sun, CloudRain, Snowflake, Wind, Volume2, VolumeX } from 'lucide-react';

// Clothing options
const clothingOptions = {
  shirts: [
    { id: 'tshirt-red', name: 'Red T-Shirt', color: '#ef4444', warmth: 1 },
    { id: 'tshirt-blue', name: 'Blue T-Shirt', color: '#3b82f6', warmth: 1 },
    { id: 'sweater', name: 'Warm Sweater', color: '#8b5cf6', warmth: 3 },
    { id: 'jacket', name: 'Winter Jacket', color: '#1e293b', warmth: 5 },
    { id: 'raincoat', name: 'Rain Coat', color: '#fbbf24', warmth: 2 },
  ],
  pants: [
    { id: 'shorts', name: 'Shorts', color: '#22c55e', warmth: 1 },
    { id: 'pants', name: 'Long Pants', color: '#3b82f6', warmth: 2 },
    { id: 'warm-pants', name: 'Warm Pants', color: '#1e293b', warmth: 3 },
  ],
};

const weatherTypes = [
  { id: 'sunny', name: 'Sunny', icon: Sun, warmth: 2, color: '#fbbf24' },
  { id: 'rainy', name: 'Rainy', icon: CloudRain, warmth: 1, color: '#60a5fa' },
  { id: 'snowy', name: 'Snowy', icon: Snowflake, warmth: -2, color: '#e2e8f0' },
  { id: 'windy', name: 'Windy', icon: Wind, warmth: 0, color: '#94a3b8' },
];

// Character component
interface CharacterProps {
  shirt: typeof clothingOptions.shirts[0] | null;
  pants: typeof clothingOptions.pants[0] | null;
  weather: typeof weatherTypes[0];
}

function Character({ shirt, pants, weather }: CharacterProps) {
  // Load Kenney blocky character
  const { scene } = useGLTF('/assets/kenney/3d/characters/character-b.glb');

  // Weather animation
  const { rotation, position } = useSpring({
    rotation: weather.id === 'windy' ? [0, 0, 0.05] : [0, 0, 0],
    position: weather.id === 'snowy' ? [0, -0.05, 0] : [0, 0, 0],
    config: { duration: 2000 },
  });

  // Clone and apply clothing
  const characterScene = useMemo(() => {
    const clone = scene.clone();

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Apply shirt color to torso
        if (mesh.name.toLowerCase().includes('torso') && shirt) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.color = new THREE.Color(shirt.color);
          mesh.material = mat;
        }

        // Apply pants color to legs
        if (mesh.name.toLowerCase().includes('leg') && pants) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.color = new THREE.Color(pants.color);
          mesh.material = mat;
        }
      }
    });

    return clone;
  }, [scene, shirt, pants]);

  return (
    <animated.group
      rotation={rotation as unknown as [number, number, number]}
      position={position as unknown as [number, number, number]}
    >
      <primitive
        object={characterScene}
        scale={1.5}
        position={[0, -1.5, 0]}
      />

      {/* Weather particles */}
      {weather.id === 'rainy' && <RainEffect />}
      {weather.id === 'snowy' && <SnowEffect />}
      {weather.id === 'sunny' && <SunGlow />}
    </animated.group>
  );
}

// Weather effects
function RainEffect() {
  const drops = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 6,
      y: Math.random() * 5 + 2,
      z: (Math.random() - 0.5) * 6,
      speed: Math.random() * 0.1 + 0.05,
    }));
  }, []);

  return (
    <group>
      {drops.map((drop) => (
        <mesh key={drop.id} position={[drop.x, drop.y, drop.z]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function SnowEffect() {
  const flakes = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 6,
      y: Math.random() * 5 + 2,
      z: (Math.random() - 0.5) * 6,
    }));
  }, []);

  return (
    <group>
      {flakes.map((flake) => (
        <mesh key={flake.id} position={[flake.x, flake.y, flake.z]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="white" />
        </mesh>
      ))}
    </group>
  );
}

function SunGlow() {
  return (
    <mesh position={[3, 3, -3]}>
      <sphereGeometry args={[0.5]} />
      <meshBasicMaterial color="#fbbf24" />
      <pointLight color="#fbbf24" intensity={0.5} distance={10} />
    </mesh>
  );
}

// Clothing selector UI
interface ClothingSelectorProps {
  onSelectShirt: (shirt: typeof clothingOptions.shirts[0]) => void;
  onSelectPants: (pants: typeof clothingOptions.pants[0]) => void;
  selectedShirt: typeof clothingOptions.shirts[0] | null;
  selectedPants: typeof clothingOptions.pants[0] | null;
}

function ClothingSelector({
  onSelectShirt,
  onSelectPants,
  selectedShirt,
  selectedPants,
}: ClothingSelectorProps) {
  return (
    <Html position={[2, 0.5, 0]} transform>
      <div className="bg-white/95 p-4 rounded-xl shadow-lg w-56 backdrop-blur-sm">
        <h3 className="font-bold mb-3 text-gray-800 text-lg">Wardrobe</h3>

        {/* Shirts */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 font-medium">Shirts</p>
          <div className="grid grid-cols-3 gap-2">
            {clothingOptions.shirts.map((shirt) => (
              <button
                key={shirt.id}
                onClick={() => onSelectShirt(shirt)}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  selectedShirt?.id === shirt.id
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                style={{ backgroundColor: shirt.color }}
                title={shirt.name}
              >
                {selectedShirt?.id === shirt.id && (
                  <Check className="w-5 h-5 text-white mx-auto drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pants */}
        <div>
          <p className="text-sm text-gray-600 mb-2 font-medium">Pants</p>
          <div className="grid grid-cols-3 gap-2">
            {clothingOptions.pants.map((pants) => (
              <button
                key={pants.id}
                onClick={() => onSelectPants(pants)}
                className={`w-12 h-12 rounded-lg border-2 transition-all ${
                  selectedPants?.id === pants.id
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                style={{ backgroundColor: pants.color }}
                title={pants.name}
              >
                {selectedPants?.id === pants.id && (
                  <Check className="w-5 h-5 text-white mx-auto drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Html>
  );
}

// Feedback UI
function FeedbackUI({
  isCorrect,
  message,
}: {
  isCorrect: boolean;
  message: string;
}) {
  return (
    <Html position={[0, 2.5, 0]} center>
      <div
        className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg animate-bounce ${
          isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}
      >
        {message}
      </div>
    </Html>
  );
}

// Preload assets
useGLTF.preload('/assets/kenney/3d/characters/character-b.glb');

// Main game component
export default function DressForWeather3D() {
  const navigate = useNavigate();
  const { playSFX, playBGM, stopBGM, preload, setMuted } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [shirt, setShirt] = useState<typeof clothingOptions.shirts[0] | null>(
    null
  );
  const [pants, setPants] = useState<typeof clothingOptions.pants[0] | null>(
    null
  );
  const [weather, setWeather] = useState(weatherTypes[0]);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    isCorrect: boolean;
    message: string;
  }>({ show: false, isCorrect: false, message: '' });
  const { resetAutoCompletion } = useAutoGameCompletion('dress-for-weather-3d', {
    when: feedback.show && feedback.isCorrect,
    score: 100,
    level: 1,
    metadata: {
      weather: weather.id,
      shirt: shirt?.id ?? null,
      pants: pants?.id ?? null,
    },
  });

  // Preload audio on mount
  useEffect(() => {
    preload(['click', 'success', 'rain', 'wind']);
  }, [preload]);

  // Play ambient weather sounds based on weather type
  useEffect(() => {
    stopBGM();
    if (!isMuted) {
      if (weather.id === 'rainy') {
        playBGM('rain', 0.3);
      } else if (weather.id === 'windy') {
        playBGM('wind', 0.3);
      }
    }
  }, [weather, playBGM, stopBGM, isMuted]);

  // Cleanup BGM on unmount
  useEffect(() => {
    return () => stopBGM();
  }, [stopBGM]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
  };

  const handleSelectShirt = useCallback((selectedShirt: typeof clothingOptions.shirts[0]) => {
    resetAutoCompletion();
    setShirt(selectedShirt);
    playSFX('click', 0.5);
  }, [playSFX, resetAutoCompletion]);

  const handleSelectPants = useCallback((selectedPants: typeof clothingOptions.pants[0]) => {
    resetAutoCompletion();
    setPants(selectedPants);
    playSFX('click', 0.5);
  }, [playSFX, resetAutoCompletion]);

  const handleWeatherChange = useCallback((newWeather: typeof weatherTypes[0]) => {
    resetAutoCompletion();
    setWeather(newWeather);
    playSFX('click', 0.3);
  }, [playSFX, resetAutoCompletion]);

  // Calculate if outfit is appropriate
  const checkOutfit = () => {
    if (!shirt || !pants) return;

    const totalWarmth = shirt.warmth + pants.warmth;
    // const weatherNeeds = weather.warmth;

    let isCorrect = false;
    let message = '';

    if (weather.id === 'sunny' && totalWarmth <= 3) {
      isCorrect = true;
      message = 'Perfect for sunny weather! ☀️';
    } else if (weather.id === 'rainy' && shirt.id === 'raincoat') {
      isCorrect = true;
      message = 'Great rain protection! 🌧️';
    } else if (weather.id === 'snowy' && totalWarmth >= 6) {
      isCorrect = true;
      message = 'Nice and warm! ❄️';
    } else if (weather.id === 'windy' && shirt.id !== 'tshirt-red' && shirt.id !== 'tshirt-blue') {
      isCorrect = true;
      message = 'Good for windy weather! 💨';
    } else {
      isCorrect = false;
      message = 'Maybe try something else?';
    }

    setFeedback({ show: true, isCorrect, message });
    if (isCorrect) {
      playSFX('success', 0.7);
    }
    setTimeout(() => setFeedback((f) => ({ ...f, show: false })), 2000);
  };

  return (
    <GameShell gameId='dress-for-weather-3d' gameName='Dress for Weather 3D'>
    <GameContainer title="Dress for Weather 3D" onHome={() => navigate('/games')}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-[#FFF8F0] relative">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
        <ThreeDGameCanvas
          cameraPosition={[0, 0.5, 4]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={true}
          showStats={import.meta.env.DEV}
          showFPS={import.meta.env.DEV}
          backgroundColor={weather.color}
          environment="studio"
        >
          <Suspense fallback={null}>
            <Character shirt={shirt} pants={pants} weather={weather} />
            <ClothingSelector
              onSelectShirt={handleSelectShirt}
              onSelectPants={handleSelectPants}
              selectedShirt={shirt}
              selectedPants={pants}
            />
            {feedback.show && (
              <FeedbackUI isCorrect={feedback.isCorrect} message={feedback.message} />
            )}
          </Suspense>
        </ThreeDGameCanvas>
      </div>

      {/* Weather selector */}
      <div className="mt-4 flex justify-center gap-3">
        {weatherTypes.map((w) => {
          const Icon = w.icon;
          return (
            <button
              key={w.id}
              onClick={() => handleWeatherChange(w)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                weather.id === w.id
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {w.name}
            </button>
          );
        })}
      </div>

      {/* Check outfit button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={checkOutfit}
          disabled={!shirt || !pants}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          Check Outfit! 👍
        </button>
      </div>

      {/* Instructions */}
      <p className="mt-4 text-center text-sm text-slate-500">
        Select clothes for the character, then click "Check Outfit!"
      </p>
    </GameContainer>
    </GameShell>
  );
}
