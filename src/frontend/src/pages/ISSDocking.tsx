/**
 * ISS Docking Game
 * Orbital mechanics mini-game
 *
 * CV Controls:
 * - Raise hand to thrust
 * - Move hand left/right to rotate
 */
import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import {
  createInitialState,
  startGame,
  applyThrust,
  rotateShip,
  updateGame,
  checkDocking,
  calculateDistanceToISS,
  calculateSpeed,
  GAME_CONFIG,
} from '../games/issDockingLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import Webcam from 'react-webcam';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CelebrationEffects } from '../components/game/CelebrationEffects';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { GameHUD } from '../components/game/GameHUD';
import { GameCursor } from '../components/game/GameCursor';

export const ISSDockingContent = memo(function ISSDockingComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('iss-docking');
  const { playClick } = useAudio();
  const [state, setState] = useState(createInitialState());
  const [keys, setKeys] = useState({
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
  });
  const [triggerCelebration, setTriggerCelebration] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  // Hand tracking refs
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastHandStateRef = useRef(false);
  const canThrustRef = useRef(true);

  // Hand tracking frame handler - raise hand to thrust, move left/right to rotate
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (state.status !== 'playing') return;
    const tip = frame.indexTip;

    if (tip) {
      if (!lastHandStateRef.current) {
        setIsHandDetected(true);
        lastHandStateRef.current = true;
      }

      setCursor({ x: tip.x, y: tip.y });

      const handRaised = tip.y < 0.4; // Top 40% of screen
      const handLowered = tip.y > 0.6; // Bottom 40% of screen

      // Thrust when hand is raised
      if (handRaised && canThrustRef.current) {
        setKeys((prev) => ({ ...prev, ArrowUp: true }));
        canThrustRef.current = false;
      } else if (handLowered) {
        setKeys((prev) => ({ ...prev, ArrowUp: false }));
        canThrustRef.current = true;
      } else if (!handRaised) {
        setKeys((prev) => ({ ...prev, ArrowUp: false }));
      }

      // Rotate based on horizontal hand position
      const centerLeft = 0.4;
      const centerRight = 0.6;
      if (tip.x < centerLeft) {
        setKeys((prev) => ({ ...prev, ArrowLeft: true, ArrowRight: false }));
      } else if (tip.x > centerRight) {
        setKeys((prev) => ({ ...prev, ArrowRight: true, ArrowLeft: false }));
      } else {
        setKeys((prev) => ({ ...prev, ArrowLeft: false, ArrowRight: false }));
      }
    } else {
      if (lastHandStateRef.current) {
        setIsHandDetected(false);
        setCursor(null);
        lastHandStateRef.current = false;
        canThrustRef.current = true;
        setKeys({ ArrowUp: false, ArrowLeft: false, ArrowRight: false });
      }
    }
  }, [state.status]);

  const { isReady, isLoading, startTracking } = useGameHandTracking({
    gameName: 'ISSDocking',
    webcamRef,
    onFrame: handleHandFrame,
    isRunning: state.status === 'playing',
  });

  useEffect(() => {
    if (state.status === 'playing' && !isReady && !isLoading) {
      void startTracking();
    }
  }, [state.status, isReady, isLoading, startTracking]);

  // Trigger celebration on success
  useEffect(() => {
    if (state.status === 'success') {
      setTriggerCelebration(true);
      setTimeout(() => setTriggerCelebration(false), 1000);
    }
  }, [state.status]);

  const { resetAutoCompletion } = useAutoGameCompletion('iss-docking', {
    when: state.status === 'success',
    score: state.score,
    level: 1,
    metadata: {
      attempts: state.attempts,
      fuelRemaining: Math.round(state.ship.fuel),
    },
  });

  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = setInterval(
      () => setState((prev) => updateGame(prev)),
      50,
    );
    return () => clearInterval(interval);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const interval = setInterval(() => {
      if (keys.ArrowUp) setState((prev) => applyThrust(prev));
      if (keys.ArrowLeft) setState((prev) => rotateShip(prev, 'left'));
      if (keys.ArrowRight) setState((prev) => rotateShip(prev, 'right'));
    }, 100);
    return () => clearInterval(interval);
  }, [state.status, keys]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleStart = useCallback(() => {
    playClick();
    resetAutoCompletion();
    setState((prev) => startGame(prev));
  }, [playClick, resetAutoCompletion]);

  if (subLoading)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  if (!hasAccess)
    return <AccessDenied gameName='ISS Docking' gameId='iss-docking' />;

  if (state.status === 'menu') {
    return (
      <GameContainer title='ISS Docking' onHome={() => navigate('/games')} reportSession={false} webcamRef={webcamRef} isHandDetected={isHandDetected} isPlaying={false}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <h2 className='text-3xl font-bold text-blue-700 mb-4'>
            🚀 ISS Docking
          </h2>
          <p className='text-gray-600 mb-6'>
            Dock your spacecraft with the ISS using hand controls!
          </p>
          <div className='bg-blue-50 p-4 rounded-xl mb-6'>
            <p className='text-sm text-blue-700'>🙋 Raise hand to thrust</p>
            <p className='text-sm text-blue-700'>👈 Move hand left/right to rotate</p>
            <p className='text-sm text-blue-700'>⌨️ Or use arrow keys</p>
          </div>
          <button
            onClick={handleStart}
            className='px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600'
          >
            Start Mission
          </button>
        </div>
      </GameContainer>
    );
  }

  if (state.status === 'success') {
    return (
      <GameContainer title='ISS Docking' onHome={() => navigate('/games')} reportSession={false}>
        <SuccessAnimation
          show={true}
          type="confetti"
          message="Docked Successfully!"
          characterEmoji="🛰️"
          particleCount={50}
          duration={2500}
        />
        <div className='flex flex-col items-center justify-center min-h-[60vh]'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='text-6xl mb-4'
          >
            🎉
          </motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-2'>
            Docked Successfully!
          </h2>
          <p className='text-xl text-gray-700'>Score: {state.score}</p>
          <button
            onClick={() => {
              resetAutoCompletion();
              setState(createInitialState());
            }}
            className='mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl'
          >
            Back to Menu
          </button>
        </div>
      </GameContainer>
    );
  }

  if (state.status === 'failure') {
    const result = checkDocking(state);
    return (
      <GameContainer title='ISS Docking' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh]'>
          <h2 className='text-3xl font-bold text-red-600 mb-2'>
            Mission Failed
          </h2>
          <p className='text-gray-600'>
            {result.reason || 'Too many attempts!'}
          </p>
          <button
            onClick={handleStart}
            className='mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl'
          >
            Try Again
          </button>
        </div>
      </GameContainer>
    );
  }

  const distance = calculateDistanceToISS(state);
  const speed = calculateSpeed(state);

  return (
    <GameContainer
      title='ISS Docking'
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isHandDetected}
      isPlaying={state.status === 'playing'}
    >
      {/* Celebration effects */}
      <CelebrationEffects
        trigger={triggerCelebration}
        type="stars"
        particleCount={15}
        duration={1000}
      />

      <div className='p-4'>
        <GameHUD
          score={state.score}
          levelInfo="Docking Mission"
          rightHeaderContent={
            <div className="flex gap-4 text-sm font-bold">
              <span className="text-orange-600">⛽ {Math.round(state.ship.fuel)}%</span>
              <span className="text-blue-600">📏 {Math.round(distance)}m</span>
              <span className="text-green-600">💨 {speed.toFixed(1)} m/s</span>
            </div>
          }
        />

        {/* Hand tracking status */}
        {state.status === 'playing' && (
          <>
            <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={true} />
            <HandTrackingStatus
              isHandDetected={isHandDetected}
              pauseOnHandLost={false}
              voicePrompt={true}
              showMascot={true}
            />
          </>
        )}

        <div className='flex justify-between mb-2 text-sm'>
          <span>Fuel: {Math.round(state.ship.fuel)}%</span>
          <span>Distance: {Math.round(distance)}m</span>
          <span>Speed: {speed.toFixed(1)} m/s</span>
        </div>
        <div
          ref={gameAreaRef}
          className='relative bg-black rounded-xl overflow-hidden mx-auto'
          style={{ width: GAME_CONFIG.width, height: GAME_CONFIG.height }}
        >
          {/* Stars */}
          <div className='absolute inset-0 opacity-50'>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className='absolute w-1 h-1 bg-white rounded-full'
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              ></div>
            ))}
          </div>
          {/* ISS */}
          <motion.div
            className='absolute text-3xl'
            style={{ left: state.iss.x - 16, top: state.iss.y - 16 }}
          >
            🛰️
          </motion.div>
          {/* Ship */}
          <motion.div
            className='absolute w-4 h-4 bg-white rounded-full'
            style={{
              left: state.ship.x - 8,
              top: state.ship.y - 8,
              transform: `rotate(${state.ship.rotation}deg)`,
            }}
          >
            <div
              className='absolute -top-2 left-1/2 w-0.5 h-3 bg-orange-500 -translate-x-1/2'
              style={{ opacity: keys.ArrowUp ? 1 : 0 }}
            ></div>
          </motion.div>
        </div>
        <div className='flex justify-center gap-4 mt-4'>
          <button
            onMouseDown={() => setKeys((p) => ({ ...p, ArrowLeft: true }))}
            onMouseUp={() => setKeys((p) => ({ ...p, ArrowLeft: false }))}
            className='px-4 py-2 bg-gray-200 rounded-lg'
          >
            ⬅️
          </button>
          <button
            onMouseDown={() => setKeys((p) => ({ ...p, ArrowUp: true }))}
            onMouseUp={() => setKeys((p) => ({ ...p, ArrowUp: false }))}
            className='px-4 py-2 bg-orange-500 text-white rounded-lg'
          >
            🚀
          </button>
          <button
            onMouseDown={() => setKeys((p) => ({ ...p, ArrowRight: true }))}
            onMouseUp={() => setKeys((p) => ({ ...p, ArrowRight: false }))}
            className='px-4 py-2 bg-gray-200 rounded-lg'
          >
            ➡️
          </button>
        </div>
      </div>
      {cursor && (
        <GameCursor
          position={cursor}
          coordinateSpace="normalized"
          containerRef={gameAreaRef}
          isPinching={false}
          isHandDetected={true}
          size={64}
          color="#22c55e"
        />
      )}
    </GameContainer>
  );
});

export const ISSDocking = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='iss-docking' gameName='ISS Docking'>
      <ISSDockingContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default ISSDocking;
