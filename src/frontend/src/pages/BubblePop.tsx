/**
 * Bubble Pop Game
 * 
 * Blow into the microphone to pop bubbles!
 * First game to use voice/blow input.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
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
        }
        
        return newState;
      });
      
      lastFrameTimeRef.current = timestamp;
    }
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isActive, volume]);
  
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
    // Start microphone
    await start();
    
    setGameState(startGame(initializeGame()));
    setShowMenu(false);
    setShowCelebration(false);
  };
  
  const handleStop = () => {
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
          <div className="text-8xl mb-4">🫧</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Bubble Pop!</h2>
          <p className="text-slate-600 mb-6 text-center max-w-md">
            Blow into the microphone to pop the bubbles! 
            The stronger you blow, the more bubbles you pop.
          </p>
          
          <div className="bg-blue-50 rounded-xl p-6 max-w-md mb-6">
            <h3 className="font-bold text-blue-800 mb-3">How to Play:</h3>
            <ol className="text-blue-700 text-sm space-y-2">
              <li>1. Allow microphone access</li>
              <li>2. Bubbles float up from the bottom</li>
              <li>3. Blow into your microphone to pop them!</li>
              <li>4. Don&apos;t let them float away!</li>
            </ol>
          </div>
          
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-xl transition-colors shadow-lg"
          >
            Start Blowing! 🎤
          </button>
          
          <p className="text-xs text-slate-400 mt-4">
            First game with microphone input!
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
                  className={`h-full transition-all duration-75 ${
                    isBlowing ? 'bg-red-500' : 'bg-blue-500'
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
          
          {/* Instructions overlay (fades out) */}
          {gameState.poppedCount < 3 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center text-white/80 text-lg font-bold animate-pulse">
              Blow into your microphone! 🎤
            </div>
          )}
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
