/**
 * Bubble Pop 3D
 *
 * 3D version of Bubble Pop with iridescent bubbles, depth perception,
 * and hand tracking interaction.
 *
 * @ticket Phase-7-P0 - 3D Conversion
 */

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import {
  initializeGame,
  startGame,
  updateBubbles,
  endGame,
  advanceLevel,
  type GameState,
  type Bubble as BubbleData,
} from '../../games/bubblePopLogic';
import { Sparkles, Play, Hand } from 'lucide-react';

// Bubble vertex shader
const bubbleVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vElevation;

  uniform float uTime;
  uniform float uWobble;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;
    float elevation = sin(pos.x * 5.0 + uTime) * sin(pos.y * 5.0 + uTime) * sin(pos.z * 5.0 + uTime);
    pos += normal * elevation * uWobble;
    vElevation = elevation;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Bubble fragment shader
const bubbleFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vElevation;

  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);

    float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
    float hue = fresnel * 0.5 + sin(uTime * 0.5) * 0.1 + vElevation * 0.2;

    vec3 color = mix(
      mix(uColor1, uColor2, sin(hue * 3.14159 * 2.0) * 0.5 + 0.5),
      uColor3,
      fresnel
    );

    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 64.0);

    color += vec3(specular) * 0.5;
    float alpha = 0.3 + fresnel * 0.4;

    gl_FragColor = vec4(color, alpha);
  }
`;

// Pop particle effect
function PopEffect({
  position,
  onComplete,
}: {
  position: [number, number, number];
  onComplete: () => void;
}) {
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      speed: Math.random() * 0.1 + 0.05,
    }));
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (progress >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [progress, onComplete]);

  useFrame(() => {
    setProgress((p) => {
      if (p >= 1) return 1;
      return p + 0.05;
    });

    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 - progress);
      groupRef.current.rotation.z += 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((p) => (
        <mesh
          key={p.id}
          position={[
            Math.cos(p.angle) * progress * 0.5,
            Math.sin(p.angle) * progress * 0.5,
            0,
          ]}
        >
          <circleGeometry args={[0.05, 8]} />
          <meshBasicMaterial
            color='#60a5fa'
            transparent
            opacity={1 - progress}
          />
        </mesh>
      ))}
    </group>
  );
}

// 3D Bubble component
interface Bubble3DProps {
  bubble: BubbleData;
  onPop: (id: string) => void;
  cursor: { x: number; y: number } | null;
  playPopSound: () => void;
}

function Bubble3D({ bubble, onPop, cursor, playPopSound }: Bubble3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [popped, setPopped] = useState(false);
  const [showPopEffect, setShowPopEffect] = useState(false);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWobble: { value: 0.1 },
      uColor1: { value: new THREE.Color('#60a5fa') },
      uColor2: { value: new THREE.Color('#a78bfa') },
      uColor3: { value: new THREE.Color('#34d399') },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || popped) return;

    uniforms.uTime.value = clock.getElapsedTime();
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x += 0.003;

    if (cursor && !popped) {
      const dx = cursor.x - bubble.x;
      const dy = cursor.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const hitRadiusNormalized = Math.max(0.03, bubble.size / 800);
      if (distance < hitRadiusNormalized) {
        setPopped(true);
        setShowPopEffect(true);
        playPopSound();
        onPop(bubble.id);
      }
    }
  });

  if (popped && !showPopEffect) return null;

  return (
    <>
      {!popped && (
        <mesh
          ref={meshRef}
          position={[bubble.x / 50, bubble.y / 50, 0]}
          scale={[bubble.size / 50, bubble.size / 50, bubble.size / 50]}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <shaderMaterial
            vertexShader={bubbleVertexShader}
            fragmentShader={bubbleFragmentShader}
            uniforms={uniforms}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {showPopEffect && (
        <PopEffect
          position={[bubble.x / 50, bubble.y / 50, 0]}
          onComplete={() => setShowPopEffect(false)}
        />
      )}
    </>
  );
}

// Main game component
export default function BubblePop3D() {
  const webcamRef = useRef<Webcam>(null);
  const { playSFX } = use3DGameAudio();
  const { completeGame } = useGameCompletion('bubble-pop-3d');

  const { cursor, isReady, startTracking, stopTracking } = useGameHandTracking({
    gameName: 'BubblePop3D',
    targetFps: 30,
    webcamRef,
  });

  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const playPopSound = useCallback(() => {
    playSFX('pop');
  }, [playSFX]);

  const handleStart = useCallback(() => {
    setGameState(startGame(gameState));
    setShowStartScreen(false);
    playSFX('start');
    startTracking();
  }, [playSFX, startTracking, gameState]);

  const handlePop = useCallback(
    (bubbleId: string) => {
      setGameState((prev) => {
        const newBubbles = prev.bubbles.filter((b) => b.id !== bubbleId);
        const newScore = prev.score + 10;

        if (newBubbles.length === 0) {
          const newState = advanceLevel(prev);
          if (newState.level > 3) {
            setShowCelebration(true);
            completeGame({
              score: newScore,
              completed: true,
              level: prev.level,
            });
            return { ...newState, score: newScore };
          }
          return newState;
        }

        return { ...prev, bubbles: newBubbles, score: newScore };
      });
    },
    [completeGame],
  );

  useFrame(() => {
    if (showStartScreen) return;

    setGameState((prev) => {
      const updated = updateBubbles(prev, 16);
      if (updated.timeLeft <= 0 && !updated.gameOver) {
        const finalState = endGame(updated);
        completeGame({
          score: finalState.score,
          completed: true,
          level: finalState.level,
        });
        return finalState;
      }
      return updated;
    });
  });

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return (
    <GameShell gameId='bubble-pop-3d' gameName='Bubble Pop 3D'>
      <GameContainer webcamRef={webcamRef} isHandDetected={!!cursor} isPlaying={!showStartScreen}>
        <ThreeDGameCanvas
          environment='studio'
          showFPS={import.meta.env.DEV}
          enableAdaptiveQuality={true}
        >
          <color attach='background' args={['#1e3a8a']} />

          {!showStartScreen &&
            gameState.bubbles.map((bubble) => (
              <Bubble3D
                key={bubble.id}
                bubble={bubble}
                onPop={handlePop}
                cursor={cursor}
                playPopSound={playPopSound}
              />
            ))}
        </ThreeDGameCanvas>

        {isReady && cursor && (
          <CursorEmbodiment
            position={cursor}
            coordinateSpace='normalized'
            isHandDetected={true}
          />
        )}

        {showStartScreen && (
          <div className='absolute inset-0 flex items-center justify-center bg-blue-900/80 backdrop-blur-sm z-10'>
            <div className='text-center p-8 bg-white/10 rounded-2xl max-w-md'>
              <Sparkles className='w-16 h-16 text-yellow-400 mx-auto mb-4' />
              <h1 className='text-4xl font-bold text-white mb-4'>
                Bubble Pop 3D
              </h1>
              <p className='text-white/80 mb-6'>
                Pop the iridescent bubbles with your hand!
              </p>
              <button
                onClick={handleStart}
                className='px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xl flex items-center gap-3 mx-auto transition-colors'
              >
                <Play className='w-6 h-6' />
                Start Game
              </button>
              <div className='mt-6 flex items-center justify-center gap-2 text-white/60'>
                <Hand className='w-5 h-5' />
                <span>Use hand tracking to pop bubbles</span>
              </div>
            </div>
          </div>
        )}

        {showCelebration && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'>
            <div className='text-center p-8 bg-white rounded-2xl max-w-md animate-bounce'>
              <Sparkles className='w-24 h-24 text-yellow-400 mx-auto mb-4' />
              <h2 className='text-3xl font-bold text-gray-800 mb-4'>
                Amazing!
              </h2>
              <p className='text-gray-600 mb-6'>You popped all the bubbles!</p>
              <p className='text-2xl font-bold text-blue-600 mb-6'>
                Score: {gameState.score}
              </p>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  setGameState(initializeGame());
                  setShowStartScreen(true);
                }}
                className='px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xl transition-colors'
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </GameContainer>
    </GameShell>
  );
}
