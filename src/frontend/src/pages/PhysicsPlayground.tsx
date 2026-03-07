import { memo, useEffect, useRef, useState } from 'react';
import { GameShell } from '../components/GameShell';
import { AudioSystem } from '../features/physics-playground/audio/AudioSystem';
import { Particle } from '../features/physics-playground/particles/Particle';
import { ParticleSystem } from '../features/physics-playground/particles/ParticleSystem';
import { CanvasRenderer } from '../features/physics-playground/renderer/CanvasRenderer';
import { StateManager } from '../features/physics-playground/state/StateManager';
import { HandInteraction } from '../features/physics-playground/hand-tracking/HandInteraction';
import { HandTracker } from '../features/physics-playground/hand-tracking/HandTracker';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import {
  AccessibilityMode,
  ParticleType,
  Settings,
  Vector2,
} from '../features/physics-playground/types';

const DEFAULT_CANVAS_WIDTH = 960;
const DEFAULT_CANVAS_HEIGHT = 540;
const KEYBOARD_STEP = 24;

const PARTICLE_OPTIONS: Array<{
  type: ParticleType;
  label: string;
  swatch: string;
  accent: string;
  description: string;
}> = [
    { type: ParticleType.SAND, label: 'Sand', swatch: '#e6c229', accent: '#7a5c00', description: 'Heavy and settles quickly' },
    { type: ParticleType.WATER, label: 'Water', swatch: '#4da6ff', accent: '#0f5ca8', description: 'Fluid and flows freely' },
    { type: ParticleType.FIRE, label: 'Fire', swatch: '#ff6b35', accent: '#9f2d00', description: 'Rises and burns leaves' },
    { type: ParticleType.BUBBLE, label: 'Bubbles', swatch: '#ffffff', accent: '#475569', description: 'Floats upward gently' },
    { type: ParticleType.STAR, label: 'Stars', swatch: '#ffd700', accent: '#7c5f00', description: 'Sparkly and bouncy' },
    { type: ParticleType.LEAF, label: 'Leaves', swatch: '#90ee90', accent: '#1f6b35', description: 'Light and fluttery' },
    { type: ParticleType.SEED, label: 'Seeds', swatch: '#8B4513', accent: '#5c2d0c', description: 'Grows plants when watered' },
    { type: ParticleType.GAS, label: 'Gas', swatch: '#c2b280', accent: '#8B7355', description: 'Rises quickly, created by fire' },
    { type: ParticleType.STEAM, label: 'Steam', swatch: '#d0d0d0', accent: '#808080', description: 'Floats up, fire + water' },
    { type: ParticleType.PLANT, label: 'Plants', swatch: '#228B22', accent: '#006400', description: 'Grows from seeds + water' },
  ];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function translatePointer(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): Vector2 {
  const bounds = canvas.getBoundingClientRect();
  const x = ((clientX - bounds.left) / bounds.width) * canvas.width;
  const y = ((clientY - bounds.top) / bounds.height) * canvas.height;

  return {
    x: clamp(x, 0, canvas.width),
    y: clamp(y, 0, canvas.height),
  };
}

function applyBounds(particle: Particle, width: number, height: number): void {
  const { radius, properties } = particle;

  if (particle.x - radius < 0) {
    particle.x = radius;
    particle.vx = Math.abs(particle.vx) * properties.restitution;
  }
  if (particle.x + radius > width) {
    particle.x = width - radius;
    particle.vx = -Math.abs(particle.vx) * properties.restitution;
  }
  if (particle.y - radius < 0) {
    particle.y = radius;
    particle.vy = Math.abs(particle.vy) * properties.restitution;
  }
  if (particle.y + radius > height) {
    particle.y = height - radius;
    particle.vy = -Math.abs(particle.vy) * properties.restitution;
    particle.vx *= properties.friction;
  }
}

export const PhysicsPlayground = memo(function PhysicsPlaygroundComponent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const audioSystemRef = useRef<AudioSystem | null>(null);
  const handTrackerRef = useRef<HandTracker | null>(null);
  const handInteractionRef = useRef<HandInteraction | null>(null);
  const pointerActiveRef = useRef(false);
  const stateManagerRef = useRef(new StateManager());
  const settingsRef = useRef<Settings>({
    particleCountLimit: 500,
    audioEnabled: true,
    handTrackingEnabled: false,
    accessibilityMode: AccessibilityMode.KEYBOARD,
    interactionMode: 'pour',
  });
  const emitterRef = useRef<Vector2>({
    x: DEFAULT_CANVAS_WIDTH / 2,
    y: DEFAULT_CANVAS_HEIGHT / 2,
  });

  const [selectedType, setSelectedType] = useState<ParticleType>(ParticleType.SAND);
  const selectedTypeRef = useRef<ParticleType>(selectedType);
  const [interactionMode, setInteractionMode] = useState<'pour' | 'draw'>('pour');
  const drawnPointsRef = useRef<{ x: number, y: number }[]>([]);
  const [particleCount, setParticleCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [helperText, setHelperText] = useState(
    'Tap/drag OR pinch in the air to pour particles. Use 1-9 and 0 to switch materials.',
  );

  const { cursor, startTracking, stopTracking, isPinching, isReady } = useGameHandTracking({
    gameName: 'PhysicsPlayground',
  });

  const cursorRef = useRef(cursor);
  const isPinchingRef = useRef(isPinching);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  useEffect(() => {
    cursorRef.current = cursor;
    isPinchingRef.current = isPinching;
    selectedTypeRef.current = selectedType;

    // Update hand interaction with current particle type
    if (handInteractionRef.current) {
      handInteractionRef.current.setParticleType(selectedType);
    }
  }, [cursor, isPinching, selectedType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    canvas.width = DEFAULT_CANVAS_WIDTH;
    canvas.height = DEFAULT_CANVAS_HEIGHT;

    const renderer = new CanvasRenderer(canvas);
    const particleSystem = new ParticleSystem(settingsRef.current);
    const audioSystem = new AudioSystem();

    // Create hand tracker and interaction manager
    const handTracker = new HandTracker();
    const handInteraction = new HandInteraction(handTracker, particleSystem);

    // Wire up audio system to particle system
    particleSystem.setAudioSystem(audioSystem);

    rendererRef.current = renderer;
    particleSystemRef.current = particleSystem;
    audioSystemRef.current = audioSystem;
    handTrackerRef.current = handTracker;
    handInteractionRef.current = handInteraction;

    const savedState = stateManagerRef.current.load();
    if (savedState?.particles?.length) {
      particleSystem.restoreParticles(savedState.particles);
      setParticleCount(particleSystem.getParticleCount());
    }

    renderer.startAnimationLoop(() => {
      const activeParticles = particleSystem.getParticles() as Particle[];
      particleSystem.update();
      for (const particle of activeParticles) {
        applyBounds(particle, canvas.width, canvas.height);
      }

      // Handle hand-tracking gestures via HandInteraction
      if (handTrackerRef.current && handInteractionRef.current && cursorRef.current) {
        const cameraX = cursorRef.current.x * canvas.width;
        const cameraY = cursorRef.current.y * canvas.height;

        // Feed gesture data to HandTracker
        const gestures = [];
        if (isPinchingRef.current) {
          gestures.push({
            type: 'pinch',
            position: { x: cameraX, y: cameraY },
          } as const);
        }
        handTrackerRef.current.setFrameData({ x: cameraX, y: cameraY }, gestures);

        // Process gestures through HandInteraction
        handInteractionRef.current.processGestures();

        // Update emitter position for cursor display
        emitterRef.current = { x: cameraX, y: cameraY };
      }

      renderer.clear();
      renderer.renderBackground();

      const context = renderer.getContext();

      // Ensure static bodies (Chalk lines) are drawn
      context.save();
      const staticBodies = particleSystem.getStaticBodies();
      for (const body of staticBodies) {
        if (body.render && body.render.visible !== false) {
          context.fillStyle = (body.render.fillStyle as string) || '#FFFFFF';

          // Matter.js creates compound bodies for our chalk.
          // To draw them properly, we must iterate their parts.
          const parts = body.parts.length > 1 ? body.parts.slice(1) : [body];

          for (const part of parts) {
            context.beginPath();
            context.moveTo(part.vertices[0].x, part.vertices[0].y);
            for (let j = 1; j < part.vertices.length; j++) {
              context.lineTo(part.vertices[j].x, part.vertices[j].y);
            }
            context.closePath();
            context.fill();
          }
        }
      }
      context.restore();

      // Render actual active falling particles
      renderer.renderParticles(activeParticles);
      renderer.renderUI(activeParticles);

      // Draw the active stroke if drawing
      if (drawnPointsRef.current.length > 1) {
        context.save();
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 12;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(drawnPointsRef.current[0].x, drawnPointsRef.current[0].y);
        for (let i = 1; i < drawnPointsRef.current.length; i++) {
          context.lineTo(drawnPointsRef.current[i].x, drawnPointsRef.current[i].y);
        }
        context.stroke();
        context.restore();
      }

      // Rest of cursor rendering code...
      const { x, y } = emitterRef.current;
      context.save();
      context.strokeStyle = 'rgba(15, 23, 42, 0.7)';
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x, y, 12, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.moveTo(x - 18, y);
      context.lineTo(x + 18, y);
      context.moveTo(x, y - 18);
      context.lineTo(x, y + 18);
      context.stroke();

      // Draw hand cursor if active
      if (cursorRef.current) {
        const hX = cursorRef.current.x * canvas.width;
        const hY = cursorRef.current.y * canvas.height;
        context.beginPath();
        context.arc(hX, hY, 16, 0, Math.PI * 2);
        context.fillStyle = isPinchingRef.current ? 'rgba(74, 222, 128, 0.6)' : 'rgba(56, 189, 248, 0.6)';
        context.fill();
        context.strokeStyle = 'white';
        context.stroke();
      }

      context.restore();
    });

    const counterInterval = window.setInterval(() => {
      setParticleCount(particleSystem.getParticleCount());
    }, 150);

    // Focus loss handling - reduce simulation complexity when app loses focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Reduce simulation complexity when app loses focus
        setIsPaused(true);
      } else {
        // Resume simulation when app regains focus
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stateManagerRef.current.save(
        particleSystem.getSerializableParticles(),
        settingsRef.current,
      );
      window.clearInterval(counterInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer.stopAnimationLoop();
      rendererRef.current = null;
      particleSystemRef.current = null;
      audioSystemRef.current?.dispose();
      audioSystemRef.current = null;
      handTrackerRef.current?.stopCamera();
      handInteractionRef.current?.dispose();
      handTrackerRef.current = null;
      handInteractionRef.current = null;
    };
  }, []);

  const spawnAt = (position: Vector2, count: number) => {
    emitterRef.current = position;
    const particleSystem = particleSystemRef.current;
    if (!particleSystem) {
      return;
    }

    particleSystem.addMultipleParticles(selectedType, position.x, position.y, count);
    audioSystemRef.current?.resume();
    audioSystemRef.current?.playParticleAdd();
    setParticleCount(particleSystem.getParticleCount());
  };

  const sprayAcrossPlayground = () => {
    const particleSystem = particleSystemRef.current;
    if (!particleSystem) {
      return;
    }

    for (let index = 0; index < 28; index += 1) {
      const x = Math.random() * DEFAULT_CANVAS_WIDTH;
      const y = Math.random() * DEFAULT_CANVAS_HEIGHT * 0.75;
      particleSystem.addParticleAt(selectedType, x, y);
    }

    audioSystemRef.current?.resume();
    audioSystemRef.current?.playParticleAdd();
    setHelperText('Burst launched. Try the wind gust to see different materials react.');
    setParticleCount(particleSystem.getParticleCount());
  };

  const applyWindGust = () => {
    const particleSystem = particleSystemRef.current;
    if (!particleSystem) {
      return;
    }

    particleSystem.applyForceToAll({ x: 1.75, y: -0.85 });
    setHelperText('Wind gust pushed every particle. Try mixing heavy sand with light bubbles.');
  };

  const clearPlayground = () => {
    particleSystemRef.current?.clear();
    stateManagerRef.current.save([], settingsRef.current);
    setParticleCount(0);
    setHelperText('Playground cleared. Pick a material and start pouring again.');
  };

  const togglePause = () => {
    const renderer = rendererRef.current;
    if (!renderer) {
      return;
    }

    if (renderer.isPausedAnimation()) {
      renderer.resume();
      setIsPaused(false);
      setHelperText('Play resumed.');
      return;
    }

    renderer.pause();
    setIsPaused(true);
    setHelperText('Play paused. You can still switch materials before resuming.');
  };

  const toggleMute = () => {
    const audioSystem = audioSystemRef.current;
    if (!audioSystem) {
      return;
    }

    const nextMuted = !isMuted;
    audioSystem.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const saveSnapshot = () => {
    rendererRef.current?.saveAsImage('physics-playground.png');
    setHelperText('Snapshot saved as physics-playground.png.');
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    pointerActiveRef.current = true;
    canvas.focus();

    if (interactionMode === 'draw') {
      drawnPointsRef.current = [translatePointer(canvas, event.clientX, event.clientY)];
    } else {
      spawnAt(translatePointer(canvas, event.clientX, event.clientY), 10);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !pointerActiveRef.current) {
      return;
    }

    if (interactionMode === 'draw') {
      const point = translatePointer(canvas, event.clientX, event.clientY);
      drawnPointsRef.current.push(point);
    } else {
      spawnAt(translatePointer(canvas, event.clientX, event.clientY), 3);
    }
  };

  const handlePointerUp = () => {
    pointerActiveRef.current = false;
    if (interactionMode === 'draw' && drawnPointsRef.current.length > 1) {
      particleSystemRef.current?.addChalkOutline(drawnPointsRef.current, '#FFFFFF');
    }
    drawnPointsRef.current = [];
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const current = emitterRef.current;

    const keyIndex = event.key === '0' ? 10 : Number(event.key);
    if (
      Number.isInteger(keyIndex) &&
      keyIndex >= 1 &&
      keyIndex <= PARTICLE_OPTIONS.length
    ) {
      const option = PARTICLE_OPTIONS[keyIndex - 1];
      if (option) {
        setSelectedType(option.type);
        setHelperText(`Selected ${option.label}: ${option.description}. Press space to spawn at the crosshair.`);
      }
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      spawnAt(current, 8);
      return;
    }

    if (event.key === 'c' || event.key === 'C') {
      clearPlayground();
      return;
    }

    if (event.key === 'w' || event.key === 'W') {
      applyWindGust();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      emitterRef.current = { ...current, x: clamp(current.x - KEYBOARD_STEP, 0, DEFAULT_CANVAS_WIDTH) };
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      emitterRef.current = { ...current, x: clamp(current.x + KEYBOARD_STEP, 0, DEFAULT_CANVAS_WIDTH) };
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      emitterRef.current = { ...current, y: clamp(current.y - KEYBOARD_STEP, 0, DEFAULT_CANVAS_HEIGHT) };
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      emitterRef.current = { ...current, y: clamp(current.y + KEYBOARD_STEP, 0, DEFAULT_CANVAS_HEIGHT) };
    }
  };

  const activeOption =
    PARTICLE_OPTIONS.find((option) => option.type === selectedType) ?? PARTICLE_OPTIONS[0];

  return (
    <GameShell gameId='physics-playground' gameName='Physics Playground'>
      <div className='min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7,_#fffbeb_35%,_#dbeafe_100%)] px-4 py-6 text-slate-900'>
        <div className='mx-auto flex max-w-7xl flex-col gap-6'>
          <section className='rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,41,59,0.12)]'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
              <div className='max-w-3xl'>
                <p className='text-sm font-black uppercase tracking-[0.24em] text-sky-700'>
                  Discovery Lab
                </p>
                <h1 className='mt-2 text-4xl font-black text-slate-900 md:text-5xl'>
                  Physics Playground
                </h1>
                <p className='mt-3 text-lg text-slate-700'>
                  Pour sand, splash water, float bubbles, and mix playful materials in an open-ended
                  sandbox built for touch, mouse, and keyboard exploration.
                </p>
              </div>
              <div className='grid gap-3 sm:grid-cols-2 lg:min-w-[320px]'>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-bold uppercase tracking-[0.18em] text-slate-500'>
                    Active Material
                  </p>
                  <p className='mt-2 text-2xl font-black' style={{ color: activeOption.accent }}>
                    {activeOption.label}
                  </p>
                </div>
                <div className='rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3'>
                  <p className='text-xs font-bold uppercase tracking-[0.18em] text-slate-500'>
                    Live Particles
                  </p>
                  <p className='mt-2 text-2xl font-black text-slate-900'>{particleCount}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Game Canvas */}
          <section className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]'>
            <div className='border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(30,41,59,0.12)] relative rounded-[2rem] border p-4'>
              {/* Embedded Camera feed for context */}
              <div className='pointer-events-none absolute bottom-6 right-6 z-20 h-36 w-48 overflow-hidden rounded-2xl border-4 border-white shadow-lg opacity-80'>
                {!isReady && <div className="flex h-full w-full items-center justify-center bg-slate-800 p-2 text-center text-xs text-white">Starting Camera...</div>}
                {isReady && (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-800">
                    <span className="text-xl">👋</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white">{isPinching ? 'POURING' : 'READY'}</span>
                  </div>
                )}
              </div>

              <canvas
                ref={canvasRef}
                className='w-full cursor-crosshair rounded-[1.5rem] border border-sky-100 bg-sky-50 shadow-inner outline-none touch-none'
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                aria-label='Physics playground canvas. Click or drag to pour particles. Use arrow keys to move the crosshair and space to spawn.'
              />
              <p className='mt-3 rounded-2xl border-2 border-[#F2CC8F] bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-[0_4px_0_#E5B86E]'>
                {helperText}
              </p>
            </div>

            <aside className='flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(30,41,59,0.12)]'>
              <div className='flex gap-2 rounded-xl bg-slate-100 p-1'>
                <button
                  type='button'
                  onClick={() => { setInteractionMode('pour'); setHelperText('Pouring elements. Tap or drag on the canvas.'); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${interactionMode === 'pour' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  💧 Pour Elements
                </button>
                <button
                  type='button'
                  onClick={() => { setInteractionMode('draw'); setHelperText('Chalk mode. Draw ramps, walls, and cups on the canvas.'); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${interactionMode === 'draw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  🖍️ Draw Chalk
                </button>
              </div>

              <div className={`transition-opacity duration-300 ${interactionMode === 'draw' ? 'opacity-40 pointer-events-none' : ''}`}>
                <h2 className='text-lg font-black text-slate-900'>Materials</h2>
                <p className='mt-1 text-sm text-slate-600 mb-3'>
                  Each material behaves differently. Heavy sand settles, bubbles drift, and fire rises.
                </p>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-1'>
                {PARTICLE_OPTIONS.map((option, index) => {
                  const isActive = option.type === selectedType;
                  return (
                    <button
                      key={option.type}
                      type='button'
                      onClick={() => {
                        setSelectedType(option.type);
                        setHelperText(`Selected ${option.label}: ${option.description}`);
                      }}
                      className={`flex items-center justify-between rounded-3xl border-2 px-4 py-3 text-left transition ${isActive
                        ? 'border-[#6366F1] bg-[#6366F1] text-white shadow-[0_4px_0_#3730A3] translate-y-[-2px]'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 shadow-sm'
                        }`}
                    >
                      <span className='flex items-center gap-3'>
                        <span
                          className='h-4 w-4 rounded-full border border-black/10'
                          style={{ backgroundColor: option.swatch }}
                        />
                        <span className='font-bold'>{option.label}</span>
                      </span>
                      <span className='text-xs font-black uppercase tracking-[0.2em] opacity-70'>
                        {index === 9 ? '0' : index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className='grid gap-3'>
                <button
                  type='button'
                  onClick={sprayAcrossPlayground}
                  className='rounded-3xl bg-sky-600 px-4 py-3 text-left font-black text-white shadow-[0_8px_20px_rgba(2,132,199,0.28)] transition hover:bg-sky-700'
                >
                  Launch Burst
                </button>
                <button
                  type='button'
                  onClick={applyWindGust}
                  className='rounded-3xl bg-emerald-500 px-4 py-3 text-left font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600'
                >
                  Send Wind Gust
                </button>
                <button
                  type='button'
                  onClick={togglePause}
                  className='rounded-3xl bg-amber-400 px-4 py-3 text-left font-black text-slate-900 shadow-[0_8px_20px_rgba(251,191,36,0.25)] transition hover:bg-amber-300'
                >
                  {isPaused ? 'Resume Motion' : 'Pause Motion'}
                </button>
                <button
                  type='button'
                  onClick={toggleMute}
                  className='rounded-3xl bg-[#6366F1] px-4 py-3 text-left font-black text-white shadow-[0_6px_0_#3730A3] transition hover:bg-indigo-500 hover:translate-y-[2px] active:shadow-none'
                >
                  {isMuted ? 'Turn Sound On' : 'Mute Sound'}
                </button>
                <button
                  type='button'
                  onClick={saveSnapshot}
                  className='rounded-3xl border border-slate-300 bg-white px-4 py-3 text-left font-black text-slate-900 transition hover:border-slate-400 hover:bg-slate-50'
                >
                  Save Snapshot
                </button>
                <button
                  type='button'
                  onClick={clearPlayground}
                  className='rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-left font-black text-rose-700 transition hover:bg-rose-100'
                >
                  Clear Playground
                </button>
              </div>

              <div className='rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700'>
                <p className='font-black text-slate-900'>Keyboard</p>
                <p className='mt-2'>`1-9,0` pick materials, arrow keys move crosshair, `Space` spawns, `W` wind, `C` clears.</p>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </GameShell>
  );
});

export default PhysicsPlayground;
