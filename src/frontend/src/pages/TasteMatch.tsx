/**
 * Taste Match Game
 *
 * Match foods to their taste: sweet, salty, or sour!
 *
 * @ticket TCK-20260310-015
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';
import {
  TASTE_ZONES,
  type FoodTaste,
  type TasteCategory,
  getFoodsForLevel,
  calculateScore,
  calculateStars,
} from '../games/tasteMatchLogic';

const MATCHES_NEEDED = 10;

function TasteMatchGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentLevel] = useState(1);
  const [availableFoods, setAvailableFoods] = useState<FoodTaste[]>([]);
  const [currentFood, setCurrentFood] = useState<FoodTaste | null>(null);
  const [matched, setMatched] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; taste: string } | null>(null);
  
  const { playSuccess, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('taste-match');

  useGameSessionProgress({
    gameName: 'Taste Match',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { matched },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const startGame = () => {
    const foods = getFoodsForLevel(currentLevel);
    setAvailableFoods(foods);
    setCurrentFood(foods[0]);
    setMatched(0);
    setScore(0);
    setShowFeedback(null);
    setGameState('playing');
    playClick();
  };

  useEffect(() => {
    if (gameState === 'playing' && currentFood) {
      speakText(`Find something ${currentFood.category}!`);
    }
  }, [gameState, currentFood, speakText]);

  const handleTasteSelect = useCallback((taste: TasteCategory) => {
    if (gameState !== 'playing' || !currentFood) return;
    
    const isCorrect = currentFood.category === taste;
    
    if (isCorrect) {
      playSuccess();
      triggerHaptic('success');
      
      const newMatched = matched + 1;
      setMatched(newMatched);
      setScore(calculateScore(newMatched));
      setShowFeedback({ correct: true, taste: taste });
      
      if (newMatched >= MATCHES_NEEDED) {
        setGameState('complete');
        playCelebration();
        (async () => {
          await completeGame({ score: calculateScore(newMatched), level: 1 });
        })();
        speakText('Great job! You matched all the tastes!');
      } else {
        const nextFoods = availableFoods.filter(f => f.id !== currentFood.id);
        if (nextFoods.length > 0) {
          setAvailableFoods(nextFoods);
          setCurrentFood(nextFoods[0]);
        }
      }
    } else {
      playClick();
      triggerHaptic('error');
      setShowFeedback({ correct: false, taste: taste });
      speakText(`Try again! That's not ${taste}.`);
    }
    
    setTimeout(() => setShowFeedback(null), 800);
  }, [gameState, currentFood, matched, availableFoods, playSuccess, playClick, playCelebration, completeGame, speakText]);

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
      aria-label="Taste Match Game"
      style={{
        background: 'linear-gradient(180deg, #FFF8E1 0%, #FFECB3 100%)',
      }}
    >
      {/* Feedback popup */}
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
                {showFeedback.correct ? 'Correct!' : `That's ${showFeedback.taste}!`}
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
            <div className="text-8xl mb-4">👅</div>
            <h1 className="text-4xl font-black text-amber-700 mb-4">
              Taste Match!
            </h1>
            <p className="text-xl text-amber-600 mb-8 max-w-md">
              Match foods to their taste! Is it sweet, salty, or sour?
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {(['sweet', 'salty', 'sour'] as TasteCategory[]).map((taste) => (
              <motion.div
                key={taste}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
              >
                <span className="text-2xl">{TASTE_ZONES[taste].emoji}</span>
                <span className="font-bold text-amber-700">{TASTE_ZONES[taste].name}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Matching! 🍬
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentFood && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white rounded-xl font-bold text-amber-600 shadow"
            >
              ← Exit
            </button>
            <div className="text-lg font-bold text-amber-700">
              {matched} / {MATCHES_NEEDED} matched
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-200 h-2 mb-4">
            <motion.div
              className="h-full bg-amber-500"
              animate={{ width: `${(matched / MATCHES_NEEDED) * 100}%` }}
            />
          </div>

          {/* Current Food */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              key={currentFood.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center mb-8"
            >
              <div className="text-9xl mb-4">{currentFood.emoji}</div>
              <h2 className="text-3xl font-black text-amber-700">{currentFood.name}</h2>
            </motion.div>

            <p className="text-xl text-amber-600 mb-8">
              Is it <span className="font-bold text-amber-700">sweet</span>, <span className="font-bold text-amber-700">salty</span>, or <span className="font-bold text-amber-700">sour</span>?
            </p>

            {/* Taste Buttons */}
            <div className="flex gap-4">
              {(['sweet', 'salty', 'sour'] as TasteCategory[]).map((taste) => (
                <motion.button
                  key={taste}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTasteSelect(taste)}
                  className="px-8 py-6 rounded-3xl font-bold text-xl shadow-lg transition-all"
                  style={{ 
                    backgroundColor: TASTE_ZONES[taste].color + '60',
                    borderColor: TASTE_ZONES[taste].color,
                    borderWidth: '3px',
                  }}
                >
                  <span className="text-4xl block mb-1">{TASTE_ZONES[taste].emoji}</span>
                  <span className="text-gray-700">{TASTE_ZONES[taste].name}</span>
                </motion.button>
              ))}
            </div>
          </div>
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
              🎉👅🎉
            </motion.div>
            <h2 className="text-4xl font-black text-amber-600 mb-2">
              Taste Expert!
            </h2>
            <p className="text-xl text-amber-600 mb-6">
              You matched {matched} foods correctly!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6 text-5xl">
              <motion.span
                key="star-t-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                {stars >= 1 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-t-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                {stars >= 2 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-t-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                {stars >= 3 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-t-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                {stars >= 4 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-t-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                {stars >= 5 ? '⭐' : '☆'}
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-amber-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                Play More!
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

export const TasteMatch = memo(function TasteMatchComponent() {
  return (
    <GameShell
      gameId="taste-match"
      gameName="Taste Match"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <TasteMatchGame />
    </GameShell>
  );
});

export default TasteMatch;
