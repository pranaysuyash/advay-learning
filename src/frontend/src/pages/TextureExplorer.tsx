/**
 * Texture Explorer Game
 *
 * Match objects to their texture: rough, smooth, soft, or bumpy!
 *
 * @ticket TCK-20260310-017
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { triggerHaptic } from '../utils/haptics';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  TEXTURE_ZONES,
  type TextureItem,
  type TextureType,
  getTextureItems,
  calculateScore,
  calculateStars,
} from '../games/textureExplorerLogic';

const MATCHES_NEEDED = 10;

function TextureExplorerGame() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [availableItems, setAvailableItems] = useState<TextureItem[]>([]);
  const [currentItem, setCurrentItem] = useState<TextureItem | null>(null);
  const [matched, setMatched] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; texture: string } | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);

  const { playSuccess, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('texture-explorer');

  useGameSessionProgress({
    gameName: 'Texture Explorer',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { matched },
  });

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef: _webcamRef } = useGameHandTracking({
    gameName: 'TextureExplorer',
    targetFps: 30,
    isRunning: gameState === 'playing',
    onFrame: handleFrame,
    onNoVideoFrame: () => setCursor(null),
  });

  useEffect(() => {
    if (gameState === 'playing' && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameState, isHandTrackingReady, isModelLoading, startTracking]);

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const startGame = () => {
    const items = getTextureItems();
    setAvailableItems(items);
    setCurrentItem(items[0]);
    setMatched(0);
    setMistakes(0);
    setScore(0);
    setShowFeedback(null);
    setGameState('playing');
    playClick();
  };

  useEffect(() => {
    if (gameState === 'playing' && currentItem) {
      speakText(`Is this ${currentItem.name} rough, smooth, soft, or bumpy?`);
    }
  }, [gameState, currentItem, speakText]);

  const handleTextureSelect = useCallback((texture: TextureType) => {
    if (gameState !== 'playing' || !currentItem) return;

    const isCorrect = currentItem.category === texture;

    if (isCorrect) {
      playSuccess();
      triggerHaptic('success');

      const newMatched = matched + 1;
      setMatched(newMatched);
      setScore(calculateScore(newMatched, mistakes));
      setShowFeedback({ correct: true, texture });

      if (newMatched >= MATCHES_NEEDED) {
        setGameState('complete');
        playCelebration();
        (async () => {
          await completeGame({ score: calculateScore(newMatched, mistakes), level: 1 });
        })();
        speakText('Great job! You matched all the textures!');
      } else {
        const nextItems = availableItems.filter(i => i.id !== currentItem.id);
        if (nextItems.length > 0) {
          setAvailableItems(nextItems);
          setCurrentItem(nextItems[0]);
        }
      }
    } else {
      playClick();
      triggerHaptic('error');
      setMistakes(m => m + 1);
      setScore(calculateScore(matched, mistakes + 1));
      setShowFeedback({ correct: false, texture });
      speakText(`That's ${texture}. Try again!`);
    }

    setTimeout(() => setShowFeedback(null), 1000);
  }, [gameState, currentItem, matched, mistakes, availableItems, playSuccess, playClick, playCelebration, completeGame, speakText]);

  const handlePlayAgain = () => {
    startGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const stars = calculateStars(matched);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      role="application"
      aria-label="Texture Explorer Game"
      style={{
        background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
      }}
    >
      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${
              showFeedback.correct ? 'bg-green-500/30' : 'bg-red-500/30'
            }`}
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
              <span className="text-6xl mb-4 block">
                {showFeedback.correct ? '✅' : '❌'}
              </span>
              <p className={`text-2xl font-black ${
                showFeedback.correct ? 'text-green-600' : 'text-red-600'
              }`}>
                {showFeedback.correct ? 'Correct!' : `That's ${showFeedback.texture}!`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">✋</div>
            <h1 className="text-4xl font-black text-blue-700 mb-4">
              Texture Explorer!
            </h1>
            <p className="text-xl text-blue-600 mb-8 max-w-md">
              Match objects to their texture! Is it rough, smooth, soft, or bumpy?
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {(['rough', 'smooth', 'soft', 'bumpy'] as TextureType[]).map((texture) => (
              <motion.div
                key={texture}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
              >
                <span className="text-2xl">{TEXTURE_ZONES[texture].emoji}</span>
                <span className="font-bold text-blue-700">{TEXTURE_ZONES[texture].name}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Exploring! 🔍
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentItem && (
        <div ref={gameAreaRef} className="flex flex-col h-full relative">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white rounded-xl font-bold text-blue-600 shadow"
            >
              ← Exit
            </button>
            <div className="text-lg font-bold text-blue-700">
              {matched} / {MATCHES_NEEDED} matched
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 h-2 mb-4">
            <motion.div
              className="h-full bg-blue-500"
              animate={{ width: `${(matched / MATCHES_NEEDED) * 100}%` }}
            />
          </div>

          {/* Current Item */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              key={currentItem.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center mb-8"
            >
              <div className="text-9xl mb-4">{currentItem.emoji}</div>
              <h2 className="text-3xl font-black text-blue-700">{currentItem.name}</h2>
            </motion.div>

            <p className="text-xl text-blue-600 mb-8">
              Is it <span className="font-bold">rough</span>, <span className="font-bold">smooth</span>, <span className="font-bold">soft</span>, or <span className="font-bold">bumpy</span>?
            </p>

            {/* Texture Buttons */}
            <div className="flex gap-4 flex-wrap justify-center">
              {(['rough', 'smooth', 'soft', 'bumpy'] as TextureType[]).map((texture) => (
                <motion.button
                  key={texture}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTextureSelect(texture)}
                  className="px-6 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all"
                  style={{
                    backgroundColor: TEXTURE_ZONES[texture].color + '60',
                    borderColor: TEXTURE_ZONES[texture].color,
                    borderWidth: '3px',
                  }}
                >
                  <span className="text-3xl block mb-1">{TEXTURE_ZONES[texture].emoji}</span>
                  <span className="text-gray-700">{TEXTURE_ZONES[texture].name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* GameCursor for hand tracking */}
          {cursor && (
            <GameCursor
              position={cursor}
              coordinateSpace="normalized"
              containerRef={gameAreaRef}
              isPinching={false}
              isHandDetected={true}
              size={64}
              color="#3B82F6"
            />
          )}
        </div>
      )}

      {/* Complete Screen */}
      {gameState === 'complete' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-8xl mb-4"
            >
              ✨🪨☁️✨
            </motion.div>
            <h2 className="text-4xl font-black text-blue-600 mb-2">
              Texture Expert!
            </h2>
            <p className="text-xl text-blue-600 mb-6">
              You matched {matched} textures correctly!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6 text-5xl">
              <motion.span
                key="star-tx-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                {stars >= 1 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-tx-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                {stars >= 2 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-tx-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                {stars >= 3 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-tx-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                {stars >= 4 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-tx-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                {stars >= 5 ? '⭐' : '☆'}
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-blue-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold text-xl transition-all"
              >
                Finish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export const TextureExplorer = memo(function TextureExplorerComponent() {
  return (
    <GameShell
      gameId="texture-explorer"
      gameName="Texture Explorer"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <TextureExplorerGame />
    </GameShell>
  );
});

export default TextureExplorer;
