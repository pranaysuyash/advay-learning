import {
  useState,
  useMemo,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrackedHandFrame } from '../../types/tracking';

import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { CelebrationOverlay } from '../../components/CelebrationOverlay';
import { TrackingLossOverlay } from '../../components/game/TrackingLossOverlay';
import { use3DGameAudio } from '../../hooks/use3DGameAudio';
import { useAutoGameCompletion } from '../../hooks/useAutoGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { triggerHaptic } from '../../utils/haptics';
import {
  Volume2,
  VolumeX,
  Volume1,
  MousePointer2,
  Hand,
  Camera,
  CameraOff,
  Dices,
  Sparkles,
} from 'lucide-react';

import {
  JengaGameState,
  RapierPhysics,
  initRapier,
  createTower,
  JENGA_CONSTANTS,
  type GameMode,
} from '../../games/jenga';
import { HUD } from '../../games/jenga/components/HUD';
import {
  JengaScene,
  ModeSelector,
  settleTower,
  toHandMidpoint,
} from '../../games/jenga/components/JengaScene';
import { useGameLoop } from '../../games/jenga/hooks/useGameLoop';

const CAMERA_CONFIG = {
  initial: {
    position: [0, 10, 20] as [number, number, number],
    target: [0, 4, 0] as [number, number, number],
  },
  minDistance: 12,
  maxDistance: 35,
};

const CANVAS_CAMERA_PROPS = {
  position: CAMERA_CONFIG.initial.position,
  fov: 50,
} as const;

const CANVAS_GL_PROPS = {
  antialias: true,
  alpha: true,
} as const;

const HAND_PINCH_CONFIG = {
  startThreshold: 0.045,
  releaseThreshold: 0.075,
} as const;
const HAND_SMOOTHING_CONFIG = {
  minCutoff: 1.2,
  beta: 0.01,
} as const;


export default function DigitalJenga3D() {
  const navigate = useNavigate();
  const { setMuted, playSFX, preload } = use3DGameAudio();
  const [isMuted, setIsMuted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [useHandInput, setUseHandInput] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [largeTextEnabled, setLargeTextEnabled] = useState(true);
  const [hudPinnedOpen, setHudPinnedOpen] = useState(false);
  const [cheerMessage, setCheerMessage] = useState<string | null>(null);
  const [handPosition, setHandPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [pointerClient, setPointerClient] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const physicsRef = useRef<RapierPhysics | null>(null);
  const [gameState, setGameState] = useState<JengaGameState | null>(null);
  const [, forceRerender] = useReducer((count: number) => count + 1, 0);
  const triggerRender = useCallback(() => void forceRerender(), []);
  const previousPhaseRef = useRef<string | null>(null);
  const cheerTimeoutRef = useRef<number | null>(null);

  const {
    isReady: isHandTrackingReady,
    isLoading: isHandTrackingLoading,
    error: handTrackingError,
    lifecycleState: handTrackingLifecycle,
    activeDelegate: handTrackingDelegate,
    webcamRef,
    isPinching,
    handVisible,
    trackingLoss,
    startTracking,
    stopTracking,
    resetTracking,
  } = useGameHandTracking({
    gameName: 'DigitalJenga3D',
    runtimeMode: 'main-thread',
    targetFps: 30,
    pinch: HAND_PINCH_CONFIG,
    smoothing: HAND_SMOOTHING_CONFIG,
    onFrame: useCallback((frame: TrackedHandFrame) => {
      setHandPosition((prev) => {
        const midpoint = toHandMidpoint(frame);
        if (!midpoint && !prev) return null;
        if (midpoint && prev && midpoint.x === prev.x && midpoint.y === prev.y)
          return prev;
        return midpoint;
      });
    }, []),
    onNoVideoFrame: useCallback(() => {
      setHandPosition(null);
    }, []),
  });

  const startTrackingRef = useRef(startTracking);
  const stopTrackingRef = useRef(stopTracking);
  const resetTrackingRef = useRef(resetTracking);

  useEffect(() => {
    startTrackingRef.current = startTracking;
    stopTrackingRef.current = stopTracking;
    resetTrackingRef.current = resetTracking;
  }, [resetTracking, startTracking, stopTracking]);

  useEffect(() => {
    let isMounted = true;

    async function initGame() {
      try {
        const RAPIER = await initRapier();
        if (!isMounted) return;

        const physics = new RapierPhysics(RAPIER, {
          gravity: { x: 0, y: JENGA_CONSTANTS.PHYSICS.GRAVITY, z: 0 },
          timestep: JENGA_CONSTANTS.PHYSICS.TIMESTEP,
          substeps: JENGA_CONSTANTS.PHYSICS.SUBSTEPS,
        });

        physics.createGround();

        const tower = createTower({
          layers: JENGA_CONSTANTS.TOWER.LAYERS,
          blocksPerLayer: JENGA_CONSTANTS.TOWER.BLOCKS_PER_LAYER,
        });
        tower.attachPhysics(physics);

        for (const block of tower.blocks) {
          const body = physics.createBlock(
            block.id,
            {
              x: block.initialPosition.x,
              y: block.initialPosition.y,
              z: block.initialPosition.z,
            },
            {
              x: block.initialRotation.x,
              y: block.initialRotation.y,
              z: block.initialRotation.z,
              w: block.initialRotation.w,
            },
          );
          block.bindPhysics(body);
        }

        settleTower(physics, 45);

        const state = new JengaGameState(tower, gameMode, 1);
        state.onPhaseChange = triggerRender;
        state.onPlayerChange = triggerRender;
        state.onBlockGrabbed = triggerRender;
        state.onBlockRemoved = triggerRender;
        state.onBlockPlaced = triggerRender;
        state.onDiceRoll = triggerRender;
        state.onMathProblem = triggerRender;
        state.onGameOver = triggerRender;

        physicsRef.current = physics;
        setGameState(state);
        setIsLoading(false);
        preload(['grab', 'slide', 'place', 'collapse', 'win', 'click']);
      } catch (error) {
        console.error('Failed to initialize Digital Jenga 3D:', error);
      }
    }

    setIsLoading(true);
    setShowCelebration(false);
    setPointerClient(null);
    setHandPosition(null);
    initGame();

    return () => {
      isMounted = false;
    };
  }, [gameMode, preload, triggerRender]);

  useEffect(() => {
    if (useHandInput) {
      void startTrackingRef.current();
      return;
    }

    setHandPosition(null);
    void resetTrackingRef.current();
    stopTrackingRef.current();
  }, [useHandInput]);

  useGameLoop(gameState, !!gameState && !gameState.isGameOver);

  useAutoGameCompletion('digital-jenga-3d', {
    when: gameState?.isGameOver ?? false,
    score: gameState?.getStats().blocksPlaced ?? 0,
    level: gameState?.turn ?? 1,
    metadata: {
      gameMode,
      turns: gameState?.turn ?? 0,
      blocksPlaced: gameState?.getStats().blocksPlaced ?? 0,
    },
  });

  useEffect(() => {
    if (gameState?.isGameOver && gameState.winner !== null) {
      setShowCelebration(true);
      triggerHaptic('celebration');
    }
  }, [gameState?.isGameOver, gameState?.winner]);

  useEffect(() => {
    if (!gameState) return;

    const speak = (text: string) => {
      if (!voiceEnabled || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    const phase = gameState.phase;
    const previous = previousPhaseRef.current;
    if (previous === phase) return;

    if (phase === 'select') speak('Pick a safe middle block.');
    if (phase === 'grab') speak('Great. Pull slowly and keep it straight.');
    if (phase === 'extract') speak('Almost there. Keep pulling.');
    if (phase === 'place') {
      speak('Nice pull. Tap place on top.');
      setCheerMessage('Nice pull! Now place it on top.');
      playSFX('success', 0.35);
      triggerHaptic('light');
    }
    if (previous === 'place' && phase === 'settle') {
      setCheerMessage('Awesome stacking!');
      playSFX('win', 0.35);
      triggerHaptic('success');
    }

    if (cheerTimeoutRef.current !== null) {
      window.clearTimeout(cheerTimeoutRef.current);
    }
    if (phase === 'place' || (previous === 'place' && phase === 'settle')) {
      cheerTimeoutRef.current = window.setTimeout(() => {
        setCheerMessage(null);
      }, 1500);
    } else {
      setCheerMessage(null);
    }

    previousPhaseRef.current = phase;
  }, [gameState, gameState?.phase, playSFX, voiceEnabled]);

  useEffect(() => {
    return () => {
      if (cheerTimeoutRef.current !== null) {
        window.clearTimeout(cheerTimeoutRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      if (newMode === gameMode) return;
      physicsRef.current?.reset();
      physicsRef.current = null;
      setGameState(null);
      setGameMode(newMode);
      setPointerClient(null);
      setHandPosition(null);
      playSFX('click', 0.3);
    },
    [gameMode, playSFX],
  );

  const handleRestart = useCallback(() => {
    if (!gameState) return;

    gameState.reset();
    for (const block of gameState.tower.blocks) {
      block.reset();
    }
    settleTower(physicsRef.current, 20);
    setShowCelebration(false);
    setPointerClient(null);
    triggerRender();
    playSFX('click', 0.3);
  }, [gameState, playSFX, triggerRender]);

  const handleRollDice = useCallback(() => {
    if (!gameState || !gameState.shouldShowTargetNumbers) return;
    gameState.generateNewTarget();
    triggerRender();
    playSFX('click', 0.3);
  }, [gameState, playSFX, triggerRender]);

  const toggleMute = useCallback(() => {
    const muted = !isMuted;
    setIsMuted(muted);
    setMuted(muted);
    if (!muted) {
      playSFX('click', 0.3);
    }
  }, [isMuted, playSFX, setMuted]);

  const toggleHandInput = useCallback(() => {
    setUseHandInput((current) => !current);
    playSFX('click', 0.3);
  }, [playSFX]);

  const handleCancelGrab = useCallback(() => {
    if (!gameState) return;
    gameState.cancelGrab();
    triggerRender();
    playSFX('click', 0.22);
  }, [gameState, playSFX, triggerRender]);

  const handlePlaceOnTop = useCallback(() => {
    if (!gameState || gameState.phase !== 'place') return;
    if (gameState.placeOnTop()) {
      triggerRender();
      playSFX('place', JENGA_CONSTANTS.AUDIO.PLACE_VOLUME);
      triggerHaptic('success');
    }
  }, [gameState, playSFX, triggerRender]);

  const handleRetryCamera = useCallback(() => {
    void resetTracking();
    void startTracking();
    setHandPosition(null);
  }, [resetTracking, startTracking]);

  const cameraStatusLabel = useMemo(() => {
    if (!useHandInput) return 'Mouse fallback';
    if (handTrackingLifecycle === 'error' || handTrackingError)
      return 'Camera needs attention';
    if (handTrackingLifecycle === 'lost' || trackingLoss.isLost)
      return 'Hand lost';
    if (handTrackingLifecycle === 'starting' || isHandTrackingLoading) {
      return 'Starting camera';
    }
    if (handVisible) {
      return handTrackingDelegate
        ? `Hand tracking live (${handTrackingDelegate})`
        : 'Hand tracking live';
    }
    return 'Show your hand';
  }, [
    handTrackingDelegate,
    handTrackingError,
    handTrackingLifecycle,
    handVisible,
    isHandTrackingLoading,
    isHandTrackingReady,
    trackingLoss.isLost,
    useHandInput,
  ]);

  const autoHideHud =
    !!gameState &&
    !gameState.isGameOver &&
    (gameState.phase === 'grab' || gameState.phase === 'extract');
  const shouldShowHud = !autoHideHud || hudPinnedOpen;

  return (
    <GameShell gameId='digital-jenga-3d' gameName='Digital Jenga 3D'>
      <GameContainer
        title='Digital Jenga'
        onHome={() => navigate('/games')}
        isHandDetected={useHandInput ? handVisible : undefined}
        isPlaying={!isLoading}
        webcamRef={webcamRef}
      >
        <div className='relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,#fff8df_0%,#e8f8ff_36%,#d7f0ff_70%,#c9eaff_100%)]'>
          <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_24%,rgba(255,244,214,0.18)_100%)]' />
          <div className='pointer-events-none absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#ffd89a]/35 blur-3xl' />
          <div className='pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#bde4ff]/45 blur-3xl' />
          {isLoading && (
            <div className='absolute inset-0 z-50 flex items-center justify-center bg-[#fff7e8]/90 backdrop-blur-md'>
              <div className='rounded-[2rem] border-4 border-[#F2CC8F] bg-[#fff8f0]/95 px-10 py-8 text-center shadow-2xl'>
                <div className='mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-sky-400 border-t-transparent' />
                <p className='text-xl font-black text-slate-900'>
                  Setting up your Jenga tower...
                </p>
                <p className='mt-2 text-sm text-slate-600'>
                  Getting the blocks ready to play
                </p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {useHandInput &&
              !handTrackingError &&
              (handTrackingLifecycle === 'starting' || isHandTrackingLoading) &&
              !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='absolute inset-0 z-30 flex items-center justify-center bg-[#8ecae6]/25 backdrop-blur-sm'
                >
                  <div className='rounded-[2rem] border-4 border-[#F2CC8F] bg-[#fff8f0]/95 px-8 py-6 text-center'>
                    <Camera className='mx-auto mb-3 h-12 w-12 animate-pulse text-slate-900' />
                    <p className='text-lg font-black text-slate-900'>
                      Starting the camera…
                    </p>
                    <p className='mt-2 text-sm text-slate-600'>
                      Allow access so your hand can play too.
                    </p>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          <div className='absolute left-4 top-4 z-40 flex flex-wrap items-center gap-3'>
            <button
              onClick={toggleMute}
              className='rounded-2xl bg-[#fff8f0]/92 p-3 text-slate-900 shadow-lg transition-colors hover:bg-white/95'
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            >
              {isMuted ? (
                <VolumeX className='h-5 w-5' />
              ) : (
                <Volume2 className='h-5 w-5' />
              )}
            </button>
            <button
              onClick={toggleHandInput}
              className={`rounded-2xl px-3 py-2 text-sm font-black shadow-lg transition-colors ${
                useHandInput
                  ? 'bg-emerald-500/90 hover:bg-emerald-600/90'
                  : 'bg-[#fff8f0]/92 text-slate-900 hover:bg-white/95'
              }`}
              aria-label={
                useHandInput
                  ? 'Switch to mouse controls'
                  : 'Switch to hand controls'
              }
            >
              <span className='inline-flex items-center gap-2'>
                {useHandInput ? (
                  <Camera className='h-4 w-4' />
                ) : (
                  <CameraOff className='h-4 w-4' />
                )}
                {useHandInput ? 'Use Mouse' : 'Use Hands'}
              </span>
            </button>
            <button
              onClick={() => {
                setVoiceEnabled((current) => !current);
                playSFX('click', 0.2);
              }}
              className={`rounded-2xl p-3 shadow-lg transition-colors ${
                voiceEnabled
                  ? 'bg-emerald-500/90 text-white hover:bg-emerald-600/90'
                  : 'bg-[#fff8f0]/92 text-slate-900 hover:bg-white/95'
              }`}
              aria-label={voiceEnabled ? 'Read aloud on' : 'Read aloud off'}
              title={voiceEnabled ? 'Read aloud on' : 'Read aloud off'}
            >
              <Volume1 className='h-5 w-5' />
            </button>
            <button
              onClick={() => {
                setLargeTextEnabled((current) => !current);
                playSFX('click', 0.2);
              }}
              className='rounded-2xl bg-[#fff8f0]/92 px-3 py-3 text-sm font-black text-slate-900 shadow-lg transition-colors hover:bg-white/95'
              aria-label={largeTextEnabled ? 'Big text on' : 'Big text off'}
            >
              {largeTextEnabled ? 'Big Text' : 'Small Text'}
            </button>
            <div className='rounded-2xl bg-[#fff8f0]/96 px-4 py-2 text-xs font-black text-slate-900 shadow-lg'>
              <span className='flex items-center gap-2'>
                {useHandInput ? (
                  <Hand className='h-4 w-4' />
                ) : (
                  <MousePointer2 className='h-4 w-4' />
                )}
                {cameraStatusLabel}
              </span>
            </div>
          </div>

          <ModeSelector
            currentMode={gameMode}
            onSelectMode={handleModeChange}
          />

          {autoHideHud && !hudPinnedOpen && (
            <div className='absolute left-4 top-20 z-50 rounded-2xl border-2 border-[#f2cc8f] bg-[#fff8f0]/95 px-3 py-2 text-sm font-black text-slate-800 shadow-lg'>
              Panel auto-hidden while pulling
            </div>
          )}
          <button
            onClick={() => setHudPinnedOpen((current) => !current)}
            className='absolute left-4 top-32 z-50 rounded-2xl bg-[#fff8f0]/95 px-3 py-2 text-sm font-black text-slate-900 shadow-lg hover:bg-white'
          >
            {shouldShowHud ? 'Hide Panel' : 'Show Panel'}
          </button>

          {shouldShowHud && (
            <HUD
              gameState={gameState}
              onRestart={handleRestart}
              onRollDice={handleRollDice}
              onCancelGrab={handleCancelGrab}
              onPlaceOnTop={handlePlaceOnTop}
              largeText={largeTextEnabled}
            />
          )}

          {handTrackingError && useHandInput && (
            <div className='absolute bottom-4 left-1/2 z-40 w-[min(92vw,34rem)] -translate-x-1/2 rounded-[1.5rem] border-4 border-[#F2CC8F] bg-[#fff8f0]/97 px-5 py-4 text-sm shadow-2xl'>
              <div className='flex items-start gap-3'>
                <CameraOff className='mt-1 h-5 w-5 shrink-0 text-rose-600' />
                <div>
                  <p className='font-black text-slate-900'>
                    The camera needs a little help.
                  </p>
                  <p className='mt-1 text-slate-700'>
                    You can keep playing with the mouse, or turn camera mode
                    back on after permission is allowed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Canvas
            shadows='basic'
            camera={CANVAS_CAMERA_PROPS}
            gl={CANVAS_GL_PROPS}
            onPointerMove={(event: ReactPointerEvent<HTMLDivElement>) => {
              setPointerClient({ x: event.clientX, y: event.clientY });
            }}
            onPointerLeave={() => {
              setPointerClient(null);
            }}
          >
            <JengaScene
              gameState={gameState}
              physics={physicsRef.current}
              gameMode={gameMode}
              handPosition={handPosition}
              handVisible={handVisible}
              isPinching={isPinching}
              useHandInput={useHandInput}
              pointerClient={pointerClient}
              orbitMinDistance={CAMERA_CONFIG.minDistance}
              orbitMaxDistance={CAMERA_CONFIG.maxDistance}
            />
          </Canvas>

          <TrackingLossOverlay
            isVisible={useHandInput && trackingLoss.isLost}
            lossDurationMs={trackingLoss.durationMs}
            fallbackAvailable
            onRetryCamera={handleRetryCamera}
            onSwitchToTapMode={() => setUseHandInput(false)}
            onExitToGames={() => navigate('/games')}
          />

          {showCelebration && (
            <CelebrationOverlay
              show={showCelebration}
              letter='🏆'
              accuracy={100}
              onComplete={() => setShowCelebration(false)}
              message={
                gameState?.winner !== null
                  ? 'Tower complete!'
                  : 'Tower collapsed!'
              }
            />
          )}

          {cheerMessage && (
            <div className='pointer-events-none absolute inset-x-0 top-44 z-40 flex justify-center'>
              <div className='inline-flex items-center gap-2 rounded-full bg-emerald-500/95 px-4 py-2 text-sm font-black text-white shadow-xl'>
                <Sparkles className='h-4 w-4' />
                {cheerMessage}
              </div>
            </div>
          )}

          <div className={`pointer-events-none absolute bottom-4 left-1/2 z-20 flex w-[min(96vw,64rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-[1.75rem] border border-[#f2cc8f] bg-[#fff8f0]/88 px-5 py-3 font-semibold text-slate-800 shadow-2xl backdrop-blur-md ${largeTextEnabled ? 'text-base' : 'text-sm'}`}>
            <span className='flex items-center gap-2'>
              {useHandInput ? (
                <Hand className='h-4 w-4' />
              ) : (
                <MousePointer2 className='h-4 w-4' />
              )}
              {useHandInput
                ? 'Pinch a block, then pull it out slowly.'
                : 'Press a block, then drag it out slowly.'}
            </span>
            <span className='flex items-center gap-2'>
              <Dices className='h-4 w-4' />
              In dice games, roll first and then find the matching number.
            </span>
            <span className='flex items-center gap-2'>
              <span>🖱️</span>
              Drag empty space to look around. Scroll to zoom.
            </span>
            <span className='flex items-center gap-2'>
              <span>🔊</span>
              Read-aloud cues are {voiceEnabled ? 'on' : 'off'}.
            </span>
          </div>
        </div>
      </GameContainer>
    </GameShell>
  );
}
