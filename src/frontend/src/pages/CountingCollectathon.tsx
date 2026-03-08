/**
 * Counting Collect-a-thon Game
 *
 * Children collect a target number of specific items before time runs out.
 *
 * Educational Focus:
 * - Counting 1-10
 * - Color recognition
 * - Hand-eye coordination
 *
 * Controls:
 * - Move hand left/right to steer character
 * - Mouse/touch fallback supported
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';

import { GameContainer } from '../components/GameContainer';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../types/tracking';
import {
  DEFAULT_CONFIG,
  type GameState,
  type ItemType,
  type GameConfig,
  createInitialState,
  startGame,
  updatePlayerPosition,
  spawnItem,
  updateItems,
  checkCollisions,
  updateTimer,
  advanceRound,
  calculateFinalScore,
  getItemEmoji,
  getCollectFeedback,
} from '../games/countingCollectathonLogic';

const GAME_CONFIG: GameConfig = { ...DEFAULT_CONFIG, ageBand: 'B' as const };

const ASSET_BASE = '/assets/kenney/platformer';
const ASSETS = {
  player: {
    idle: `${ASSET_BASE}/characters/character_green_idle.png`,
  },
  collectibles: {
    star: `${ASSET_BASE}/collectibles/star.png`,
    coin: `${ASSET_BASE}/collectibles/coin_gold.png`,
    gem: `${ASSET_BASE}/collectibles/gem_blue.png`,
  },
  sounds: {
    collect: `${ASSET_BASE}/sounds/sfx_coin.ogg`,
    wrong: `${ASSET_BASE}/sounds/sfx_bump.ogg`,
    complete: `${ASSET_BASE}/sounds/sfx_coin.ogg`,
  },
};

export const CountingCollectathon = memo(function CountingCollectathonGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});

  const [gameState, setGameState] = useState<GameState>(() => createInitialState(GAME_CONFIG));
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRoundComplete, setShowRoundComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; emoji: string; x: number; y: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { onGameComplete } = useGameDrops('counting-collectathon');
  const { playSuccess, playError, playCelebration, play } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  const gameStateRef = useRef(gameState);
  const handXRef = useRef<number | null>(null);
  gameStateRef.current = gameState;

  const loadAssets = useCallback(async () => {
    try {
      const imageUrls = [
        ASSETS.player.idle,
        ASSETS.collectibles.star,
        ASSETS.collectibles.coin,
        ASSETS.collectibles.gem,
      ];

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const loadedImages = await Promise.all(imageUrls.map(loadImage));
      imagesRef.current = {
        player: loadedImages[0],
        star: loadedImages[1],
        coin: loadedImages[2],
        gem: loadedImages[3],
      };

      const audioUrls = [ASSETS.sounds.collect, ASSETS.sounds.wrong, ASSETS.sounds.complete];
      audioRef.current = {
        collect: new Audio(audioUrls[0]),
        wrong: new Audio(audioUrls[1]),
        complete: new Audio(audioUrls[2]),
      };

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip || gameStateRef.current.status !== 'PLAYING') return;

    const x = frame.indexTip.x * GAME_CONFIG.canvasWidth;
    handXRef.current = x;

    setGameState((prev) => {
      if (prev.status !== 'PLAYING') return prev;
      return updatePlayerPosition(prev, x, GAME_CONFIG);
    });
  }, []);

  const { handVisible } = useGameHandTracking({
    gameName: 'CountingCollectathon',
    webcamRef,
    onFrame: handleHandFrame,
  });

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current.status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * GAME_CONFIG.canvasWidth;

    handXRef.current = x;
    setGameState((prev) => {
      if (prev.status !== 'PLAYING') return prev;
      return updatePlayerPosition(prev, x, GAME_CONFIG);
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current.status !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * GAME_CONFIG.canvasWidth;

    handXRef.current = x;
    setGameState((prev) => {
      if (prev.status !== 'PLAYING') return prev;
      return updatePlayerPosition(prev, x, GAME_CONFIG);
    });
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const state = gameStateRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, GAME_CONFIG.groundY, canvas.width, canvas.height - GAME_CONFIG.groundY);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, GAME_CONFIG.groundY, canvas.width, 10);

    if (imagesRef.current.player && state.status === 'PLAYING') {
      ctx.drawImage(
        imagesRef.current.player,
        state.playerX,
        state.playerY,
        GAME_CONFIG.playerWidth,
        GAME_CONFIG.playerHeight
      );
    }

    const itemImages: Record<ItemType, HTMLImageElement | undefined> = {
      star: imagesRef.current.star,
      coin: imagesRef.current.coin,
      gem: imagesRef.current.gem,
    };

    state.items.forEach((item) => {
      if (!item.active) return;
      const img = itemImages[item.type];
      if (img) {
        ctx.drawImage(img, item.x, item.y, item.width, item.height);
      } else {
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(getItemEmoji(item.type), item.x + item.width / 2, item.y + item.height / 2 + 10);
      }
    });
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    const state = gameStateRef.current;

    if (state.status === 'PLAYING') {
      const deltaTime = 1 / 60;

      setGameState((prev) => {
        let newState = prev;

        newState = updateTimer(newState, deltaTime);

        if (timestamp - lastSpawnRef.current > GAME_CONFIG.spawnInterval) {
          newState = spawnItem(newState, GAME_CONFIG);
          lastSpawnRef.current = timestamp;
        }

        newState = updateItems(newState, GAME_CONFIG, deltaTime);

        const collisionResult = checkCollisions(newState, GAME_CONFIG);
        newState = collisionResult.state;

        if (collisionResult.collected) {
          const feedbackData = getCollectFeedback(
            collisionResult.correct,
            newState.streak
          );
          setFeedback({
            ...feedbackData,
            x: GAME_CONFIG.canvasWidth / 2,
            y: GAME_CONFIG.canvasHeight / 2,
          });
          setTimeout(() => setFeedback(null), 800);

          if (collisionResult.correct) {
            triggerHaptic('success');
            play('pop');
          } else {
            triggerHaptic('error');
            playError();
          }
        }

        if (newState.status === 'ROUND_COMPLETE') {
          setShowRoundComplete(true);
          playSuccess();
          setTimeout(() => {
            setShowRoundComplete(false);
            setGameState((s) => advanceRound(s, GAME_CONFIG));
          }, 2000);
        }

        if (newState.status === 'GAME_COMPLETE') {
          const finalScore = calculateFinalScore(newState);
          onGameComplete(finalScore);
          setShowCelebration(true);
          playCelebration();
        }

        return newState;
      });
    }

    render();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [render, play, playError, playSuccess, playCelebration, onGameComplete]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  const handleStart = useCallback(() => {
    setGameState((prev) => startGame(prev, GAME_CONFIG));
    if (ttsEnabled) {
      speak("Let's collect the treasures! Move your hand to help!");
    }
  }, [speak, ttsEnabled]);

  const handleHome = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  const handlePlayAgain = useCallback(() => {
    setShowCelebration(false);
    setGameState(createInitialState(GAME_CONFIG));
  }, []);

  if (isLoading) {
    return (
      <GameContainer title="Counting Collect-a-thon" onHome={handleHome}>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer title="Counting Collect-a-thon" onHome={handleHome}>
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg">
            <div className="text-sm text-slate-600">Score</div>
            <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
          </div>

          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg text-center">
            <div className="text-sm text-slate-600">Time</div>
            <div className={`text-2xl font-bold ${gameState.timeRemaining < 10 ? 'text-red-500' : 'text-green-600'}`}>
              {Math.ceil(gameState.timeRemaining)}s
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg">
            <div className="text-sm text-slate-600">Collect</div>
            <div className="text-2xl font-bold text-purple-600">
              {gameState.collected} / {gameState.targetCount} {getItemEmoji(gameState.targetType)}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-4">
            <span className="text-lg text-slate-600">Round {gameState.currentRound}/{gameState.totalRounds}</span>
            {gameState.streak > 0 && (
              <span className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-600 font-bold">🔥 {gameState.streak}</span>
              </span>
            )}
          </div>
        </div>

        {gameState.status === 'READY' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md"
            >
              <div className="text-6xl mb-4">⭐ 🪙 💎</div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Counting Collect-a-thon!</h2>
              <p className="text-slate-600 mb-6">
                Help collect the treasures! Move your hand to steer the character and catch the right items!
              </p>
              <button
              onClick={handleStart}
              type="button"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl transition-colors"
            >
              Start Playing!
              </button>
            </motion.div>
          </div>
        )}

        {!handVisible && gameState.status === 'PLAYING' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-xl font-bold">Show your hand to play!</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center z-30"
            >
              <div className="text-4xl font-bold text-white drop-shadow-lg">
                {feedback.emoji} {feedback.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRoundComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center z-40"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-3xl font-bold text-white">Round Complete!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-bold text-white mb-4">You Did It!</h2>
              <p className="text-xl text-white/90 mb-2">Final Score: {calculateFinalScore(gameState)}</p>
              <p className="text-lg text-white/70 mb-8">You collected all the treasures!</p>
              <button
                onClick={handlePlayAgain}
                type="button"
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-xl"
              >
                Play Again!
              </button>
            </div>
          </motion.div>
        )}

        <canvas
          ref={canvasRef}
          width={GAME_CONFIG.canvasWidth}
          height={GAME_CONFIG.canvasHeight}
          onTouchMove={handleTouchMove}
          onMouseMove={handleMouseMove}
          className="w-full h-auto rounded-xl shadow-2xl cursor-pointer touch-none"
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <Webcam
            ref={webcamRef}
            mirrored
            className="w-32 h-24 rounded-lg opacity-50"
            audio={false}
          />
        </div>
      </div>
    </GameContainer>
  );
});

export default CountingCollectathon;
