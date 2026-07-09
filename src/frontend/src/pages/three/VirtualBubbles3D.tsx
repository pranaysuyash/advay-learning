import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Webcam from 'react-webcam';
import { ThreeDGameCanvas } from '../../components/game/three/ThreeDGameCanvas';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { CursorEmbodiment } from '../../components/game/CursorEmbodiment';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { Sparkles, RotateCcw, Volume2, VolumeX, Music } from 'lucide-react';

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

function PopEffect({ position, onComplete }: { position: [number, number, number]; onComplete: () => void }) {
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
      if (p >= 1) {
        return 1;
      }
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
          <meshBasicMaterial color="#60a5fa" transparent opacity={1 - progress} />
        </mesh>
      ))}
    </group>
  );
}

interface BubbleProps {
  initialPosition: [number, number, number];
  size: number;
  speed: number;
  onPop: (points: number) => void;
  playPopSound: () => void;
  cursor: { x: number; y: number } | null;
}

function Bubble({ initialPosition, size, speed, onPop, playPopSound, cursor }: BubbleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [popped, setPopped] = useState(false);
  const [showPopEffect, setShowPopEffect] = useState(false);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWobble: { value: 0.02 },
      uColor1: { value: new THREE.Color('#ff6b6b') },
      uColor2: { value: new THREE.Color('#4ecdc4') },
      uColor3: { value: new THREE.Color('#45b7d1') },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (meshRef.current && !popped) {
      meshRef.current.position.y += speed * 0.01;

      meshRef.current.position.x =
        initialPosition[0] + Math.sin(clock.elapsedTime + initialPosition[0]) * 0.3;
      meshRef.current.position.z =
        initialPosition[2] + Math.cos(clock.elapsedTime * 0.7 + initialPosition[2]) * 0.3;

      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.005;

      uniforms.uTime.value = clock.elapsedTime;

      if (meshRef.current.position.y > 6) {
        meshRef.current.position.y = -4;
      }

      if (cursor) {
        const dx = cursor.x - (meshRef.current.position.x * 0.1 + 0.5);
        const dy = cursor.y - (meshRef.current.position.y * 0.1 + 0.5);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 0.12) {
          handleClick();
        }
      }
    }
  });

  const handleClick = useCallback(() => {
    if (!popped) {
      setPopped(true);
      setShowPopEffect(true);
      playPopSound();
      onPop(Math.floor(size * 10));
    }
  }, [popped, onPop, size, playPopSound]);

  const handlePopComplete = useCallback(() => {
    setShowPopEffect(false);
  }, []);

  if (popped && !showPopEffect) {
    return null;
  }

  return (
    <>
      {!popped && (
        <mesh
          ref={meshRef}
          position={initialPosition}
          onClick={handleClick}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          <sphereGeometry args={[size, 32, 32]} />
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
          position={[
            meshRef.current?.position.x || initialPosition[0],
            meshRef.current?.position.y || initialPosition[1],
            meshRef.current?.position.z || initialPosition[2],
          ]}
          onComplete={handlePopComplete}
        />
      )}
    </>
  );
}

function BubbleField({ onPop, playPopSound, cursor }: { onPop: (points: number) => void; playPopSound: () => void; cursor: { x: number; y: number } | null }) {
  const [bubbles, setBubbles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      position: [(Math.random() - 0.5) * 8, Math.random() * 8 - 4, (Math.random() - 0.5) * 4] as [number, number, number],
      size: Math.random() * 0.3 + 0.2,
      speed: Math.random() * 0.5 + 0.5,
    }))
  );

  useFrame(() => {
    setBubbles((prev) =>
      prev.map((b) => {
        if (Math.random() < 0.001) {
          return {
            ...b,
            position: [(Math.random() - 0.5) * 8, -4, (Math.random() - 0.5) * 4],
          };
        }
        return b;
      })
    );
  });

  return (
    <>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          initialPosition={bubble.position}
          size={bubble.size}
          speed={bubble.speed}
          onPop={onPop}
          playPopSound={playPopSound}
          cursor={cursor}
        />
      ))}
    </>
  );
}

function ScoreDisplay({ score, combo }: { score: number; combo: number }) {
  return (
    <Html position={[-3, 3, 0]}>
      <div className="bg-slate-800/90 text-white px-6 py-4 rounded-xl shadow-lg">
        <div className="text-sm text-slate-400">Score</div>
        <div className="text-4xl font-bold">{score.toLocaleString()}</div>
        {combo > 1 && (
          <div className="mt-2 text-center">
            <span className="text-2xl font-bold text-yellow-400 animate-pulse">
              {combo}x Combo!
            </span>
          </div>
        )}
      </div>
    </Html>
  );
}

export default function VirtualBubbles3D() {
  const navigate = useNavigate();
  const { playSFX, stopBGM, preload, setMuted } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastPopTime, setLastPopTime] = useState(0);
  const { savePartialProgress, canSave } = useGameCompletion('virtual-bubbles-3d');
  const webcamRef = useRef<Webcam>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  usePerformanceMonitor('VirtualBubbles3D', { warnThreshold: 30 });
  const { resetAutoCompletion: _resetAutoCompletion } = useAutoGameCompletion('virtual-bubbles-3d', {
    when: score >= 500,
    score,
    level: 1,
    metadata: { combo, bgMusicEnabled },
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
    gameName: 'VirtualBubbles3D',
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
    preload(['pop', 'click', 'win']);
  }, [preload]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    if (!newMuted) playSFX('click', 0.3);
    if (newMuted && bgMusicEnabled) {
      stopBGM();
    }
  };

  const toggleBgMusic = () => {
    const newState = !bgMusicEnabled;
    setBgMusicEnabled(newState);
    if (newState && !isMuted) {
      playSFX('click', 0.15);
    } else {
      stopBGM();
    }
    if (!newState) playSFX('click', 0.3);
  };

  const playPopSound = useCallback(() => {
    playSFX('pop', 0.5);
  }, [playSFX]);

  const handlePop = useCallback(
    (points: number) => {
      const now = Date.now();

      if (now - lastPopTime < 1000) {
        setCombo((c) => c + 1);
        if (combo >= 2) {
          playSFX('win', 0.4);
        }
      } else {
        setCombo(1);
      }

      setLastPopTime(now);

      const comboBonus = combo * 0.5;
      setScore((s) => s + Math.floor(points * (1 + comboBonus)));
    },
    [combo, lastPopTime, playSFX]
  );

  const resetGame = () => {
    setScore(0);
    setCombo(0);
    setLastPopTime(0);
    playSFX('click', 0.3);
  };

  useEffect(() => {
    if (score <= 0 || !canSave) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void savePartialProgress({
        score: Math.min(score, 1000),
        level: 1,
        metadata: {
          combo,
          bgMusicEnabled,
        },
      });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [bgMusicEnabled, combo, savePartialProgress, score, canSave]);

  return (
    <GameShell gameId='virtual-bubbles-3d' gameName='Virtual Bubbles 3D'>
    <GameContainer title="Virtual Bubbles 3D" onHome={() => navigate('/games')} webcamRef={webcamRef} isHandDetected={!!cursor} isPlaying={isPlaying}>
      <div className="h-[600px] w-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 relative">
        <button
          type="button"
          onClick={toggleMute}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </button>
        <button
          type="button"
          onClick={toggleBgMusic}
          className={`absolute top-4 right-14 z-10 p-2 rounded-lg transition-colors ${
            bgMusicEnabled ? 'bg-blue-600/80 hover:bg-blue-500/80' : 'bg-slate-800/80 hover:bg-slate-700/80'
          }`}
          aria-label={bgMusicEnabled ? 'Disable background music' : 'Enable background music'}
        >
          <Music className={`w-5 h-5 ${bgMusicEnabled ? 'text-white' : 'text-slate-400'}`} />
        </button>

        {!isPlaying ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60">
            <button
              onClick={() => { setIsPlaying(true); startTracking(); }}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              🫧 Start Playing
            </button>
          </div>
        ) : null}

        <ThreeDGameCanvas
          cameraPosition={[0, 0, 8]}
          cameraTarget={[0, 0, 0]}
          enableOrbit={false}
          showStats={import.meta.env.DEV}
          showFPS={import.meta.env.DEV}
          backgroundColor="transparent"
          environment={null}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ecdc4" />

          {isPlaying && viewportCursor && <CursorEmbodiment position={viewportCursor} />}

          <BubbleField onPop={handlePop} playPopSound={playPopSound} cursor={cursor} />
          <ScoreDisplay score={score} combo={combo} />

          <Html position={[0, -3.5, 0]} center>
            <div className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-center">
              <p className="font-bold text-lg">🫧 Point at bubbles to pop!</p>
              <p className="text-sm text-slate-300">Pop quickly for combos!</p>
            </div>
          </Html>
        </ThreeDGameCanvas>
      </div>

      <div className="mt-4 flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-5 h-5" />
            <span>Custom shaders for iridescent bubbles</span>
          </div>
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-100 p-3 rounded-xl">
          <div className="text-2xl font-bold text-blue-500">{score.toLocaleString()}</div>
          <div className="text-xs text-slate-500">Total Score</div>
        </div>
        <div className="bg-slate-100 p-3 rounded-xl">
          <div className="text-2xl font-bold text-yellow-500">{combo}x</div>
          <div className="text-xs text-slate-500">Current Combo</div>
        </div>
        <div className="bg-slate-100 p-3 rounded-xl">
          <div className="text-2xl font-bold text-green-500">∞</div>
          <div className="text-xs text-slate-500">Bubbles</div>
        </div>
      </div>
    </GameContainer>
    </GameShell>
  );
}
