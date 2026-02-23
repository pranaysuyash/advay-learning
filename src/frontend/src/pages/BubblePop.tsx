/**
 * Bubble Pop Game
 * 
 * Blow into the microphone to pop bubbles!
 * First game to use voice/blow input.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useAudio } from '../utils/hooks/useAudio';
import '../styles/animations.css';
import { useMicrophoneInput } from '../hooks/useMicrophoneInput';
import {
  initializeGame,
  startGame,
  updateBubbles,
  checkBlowHits,
  getStats,
  endGame,
  type GameState,
  type Bubble,
} from '../games/bubblePopLogic';

// Animation frame delta time calculation
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

export default function BubblePop() {
  // Audio
  const { playClick, playLevelUp } = useAudio();

  // Game state
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animation refs
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Microphone input for blow detection
  const { isActive, volume, isBlowing, error, start, stop } = useMicrophoneInput({
    blowThreshold: 0.25,
    minBlowDuration: 100,
    cooldown: 200,
    onBlow: () => {
      // Blow detected - check hits
      setGameState(prev => {
        const newState = checkBlowHits(prev, 0.5);  // High volume for strong blow
        return newState;
      });
    },
  });

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastFrameTimeRef.current;

    if (deltaTime >= FRAME_TIME) {
      setGameState(prev => {
        let newState = updateBubbles(prev, deltaTime);

        // Check for blow hits based on volume
        if (isActive && volume > 0.2) {
          newState = checkBlowHits(newState, volume);
        }

        // Level up every 10 pops
        if (newState.poppedCount > 0 && newState.poppedCount % 10 === 0 &&
          newState.poppedCount !== prev.poppedCount) {
          newState = { ...newState, level: Math.min(10, newState.level + 1) };
          playLevelUp();
        }

        return newState;
      });

      lastFrameTimeRef.current = timestamp;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isActive, volume, playLevelUp]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.isPlaying && !showMenu) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, showMenu, gameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stop]);

  const handleStart = async () => {
    playClick();
    // Start microphone
    await start();

    setGameState(startGame(initializeGame()));
    setShowMenu(false);
    setShowCelebration(false);
  };

  const handleStop = () => {
    playClick();
    stop();
    setGameState(endGame(gameState));
    setShowMenu(true);
  };

  const stats = getStats(gameState);

  return (
    <GameContainer title="Bubble Pop" onHome={handleStop}>
      {/* Microphone permission/error display */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm z-50">
          {error}
        </div>
      )}

      {showMenu ? (
        // Menu Screen
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-8xl mb-4 animate-bounce">🫧</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Bubble Pop!</h2>

          {/* Goal Statement with Semantic Attributes */}
          <div
            data-ux-goal="Blow into the microphone to pop bubbles and score points!"
            data-ux-instruction="Get close to the microphone and blow as hard as you can"
            data-ux-action="blow"
            className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 mb-4 max-w-md border-2 border-blue-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <p className="font-bold text-blue-800">GOAL:</p>
                <p className="text-blue-700">Blow bubbles to pop them and score!</p>
                <p className="text-blue-600 text-sm">🎤 Blow hard → 💨 Pop! → ⭐ Score!</p>
              </div>
            </div>
          </div>

          {/* Microphone Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 max-w-md mb-6 flex items-start gap-3">
            <span className="text-3xl">🎤</span>
            <div>
              <h3 className="font-bold text-yellow-800 mb-1">You need a microphone!</h3>
              <p className="text-yellow-700 text-sm">
                This game uses your microphone to detect when you blow.
                Make sure to <strong>allow microphone access</strong> when prompted.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 max-w-md mb-6">
            <h3 className="font-bold text-blue-800 mb-3">How to Play:</h3>
            <ol className="text-blue-700 text-sm space-y-3">
              <li className="flex items-center gap-2">
                <span className="bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span>Click "Start" and allow microphone access</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span>Bubbles float up from the bottom</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span><strong>Blow into your microphone</strong> to pop them! 💨</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                <span>Don&apos;t let them float away!</span>
              </li>
            </ol>
          </div>

          <button
            onClick={handleStart}
            className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-black text-xl transition-all shadow-lg transform hover:scale-105 flex items-center gap-3"
          >
            <span>🎤</span>
            Start Blowing!
            <span>💨</span>
          </button>

          <p className="text-xs text-slate-400 mt-4">
            First game with microphone input! 🔬
          </p>
        </div>
      ) : (
        // Game Screen
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-200 to-sky-400">
          {/* Stats Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm z-10">
            <div className="flex gap-4">
              <div className="text-sm">
                <span className="text-slate-500">Score:</span>
                <span className="font-bold text-blue-600 ml-1">{gameState.score}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Level:</span>
                <span className="font-bold text-purple-600 ml-1">{gameState.level}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500">Popped:</span>
                <span className="font-bold text-green-600 ml-1">{gameState.poppedCount}</span>
              </div>
            </div>

            {/* Volume indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Blow:</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${isBlowing ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
              {isBlowing && (
                <span className="text-red-500 animate-pulse">💨</span>
              )}
            </div>
          </div>

          {/* Bubbles */}
          {gameState.bubbles.map((bubble) => (
            <BubbleView key={bubble.id} bubble={bubble} />
          ))}

          {/* Blow effect overlay */}
          {isBlowing && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${volume * 0.5}) 0%, transparent 50%)`,
              }}
            />
          )}

          {/* Instructions Header with Semantic Attributes */}
          <div
            data-ux-goal="Blow into the microphone to pop bubbles and score points!"
            data-ux-instruction="Get close to the microphone and blow as hard as you can"
            data-ux-action="blow"
            data-ux-progress={`${gameState.poppedCount} bubbles popped`}
            className="absolute top-16 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-center z-10 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🎯</span>
              <p className="font-black">GOAL: Blow into your microphone to pop bubbles! 💨</p>
            </div>
          </div>

          {/* Instructions overlay at bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border-4 border-blue-400 flex items-center gap-4">
              <div className="text-4xl animate-bounce">🎤</div>
              <div className="text-left">
                <p className="font-bold text-blue-800 text-lg">Blow into your microphone!</p>
                <p className="text-blue-600">The harder you blow, the more bubbles pop! 💨</p>
                <p className="text-slate-500 text-sm mt-1">{isBlowing ? '💨 Great! Keep blowing!' : '👄 Get close to the mic and blow!'}</p>
              </div>
            </div>

            {/* Visual blow meter */}
            <div className="bg-white/90 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600">Blow Power:</span>
              <div className="w-32 h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300">
                <div
                  className={`h-full transition-all duration-100 ${volume > 0.5 ? 'bg-red-500' : volume > 0.25 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                  style={{ width: `${Math.min(100, volume * 100)}%` }}
                />
              </div>
              <span className="text-lg">{isBlowing ? '💨💨💨' : '💤'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Celebration */}
      <CelebrationOverlay
        show={showCelebration}
        letter="🫧"
        accuracy={stats.accuracy}
        onComplete={() => setShowCelebration(false)}
        message={`Level ${gameState.level} Complete!`}
      />
    </GameContainer>
  );
}

// Bubble component
function BubbleView({ bubble }: { bubble: Bubble }) {
  if (bubble.isPopped) return null;

  const wobbleX = Math.sin(bubble.wobble) * 20;

  return (
    <div
      className="absolute rounded-full transition-transform"
      style={{
        left: `${(bubble.x * 100)}%`,
        top: `${(bubble.y * 100)}%`,
        width: bubble.size,
        height: bubble.size,
        background: `radial-gradient(circle at 30% 30%, ${bubble.color}, ${bubble.color}dd)`,
        boxShadow: `inset -5px -5px 10px rgba(0,0,0,0.1), inset 5px 5px 10px rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.2)`,
        transform: `translate(-50%, -50%) translateX(${wobbleX}px)`,
      }}
    >
      {/* Highlight */}
      <div
        className="absolute rounded-full"
        style={{
          width: '30%',
          height: '30%',
          top: '15%',
          left: '20%',
          background: 'rgba(255,255,255,0.6)',
        }}
      />
    </div>
  );
}
