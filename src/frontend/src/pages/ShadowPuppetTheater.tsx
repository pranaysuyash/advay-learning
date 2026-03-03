/**
 * Shadow Puppet Theater Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameProgress } from '../hooks/useGameProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  getLevelConfig,
  getRandomShape,
  speakShape,
  type PuppetShape,
} from '../games/shadowPuppetLogic';

// Inner game component
interface ShadowPuppetTheaterGameProps {
  saveProgress: (data: { score: number; completed: boolean; level?: number; metadata?: Record<string, unknown> }) => Promise<void>;
}

const ShadowPuppetTheaterGame = memo(function ShadowPuppetTheaterGameComponent({ saveProgress: _saveProgress }: ShadowPuppetTheaterGameProps) {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentShape, setCurrentShape] = useState<PuppetShape | null>(null);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [usedShapes, setUsedShapes] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Make the shape with your hands!');

  const { playClick, playSuccess, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('shadow-puppet-theater');

  const levelConfig = useMemo(() => getLevelConfig(currentLevel), [currentLevel]);

  useGameSessionProgress({
    gameName: 'Shadow Puppet Theater',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: {
      correct: correctCount,
      shape: shapeIndex,
    },
  });

  useEffect(() => {
    if (gameState === 'playing' && !currentShape) {
      const shape = getRandomShape(currentLevel, usedShapes);
      setCurrentShape(shape);
      setUsedShapes((prev) => [...prev, shape.id]);

      // Auto-play voice hint
      setTimeout(() => {
        speakShape(shape);
      }, 500);
    }
  }, [gameState, currentLevel, currentShape, usedShapes]);

  const handleGotIt = () => {
    playSuccess();
    setCorrectCount((prev) => prev + 1);
    setScore((prev) => prev + 25);
    setFeedback('Great job! Next shape...');

    setTimeout(() => {
      const nextIndex = shapeIndex + 1;
      if (nextIndex >= levelConfig.shapesPerRound) {
        setGameState('complete');
        playCelebration();
      } else {
        setShapeIndex(nextIndex);
        const newShape = getRandomShape(currentLevel, usedShapes);
        setCurrentShape(newShape);
        setUsedShapes((prev) => [...prev, newShape.id]);
        setFeedback('Make the shape with your hands!');
        setTimeout(() => speakShape(newShape), 500);
      }
    }, 1500);
  };

  const handleHint = () => {
    playClick();
    if (currentShape) {
      speakShape(currentShape);
    }
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
    setShapeIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedShapes([]);
    setCurrentShape(null);
    setGameState('playing');
    setFeedback('Make the shape with your hands!');
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / levelConfig.shapesPerRound);
    await onGameComplete(finalScore);
    navigate('/games');
  }, [score, levelConfig, onGameComplete, navigate, playClick]);

  const handleRestart = () => {
    playClick();
    setShapeIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedShapes([]);
    setCurrentShape(null);
    setGameState('playing');
    setFeedback('Make the shape with your hands!');
  };

  return (
    <GameContainer
      title="Shadow Puppet Theater"
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button
              type="button"
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${currentLevel === level.level
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>

        {gameState === 'playing' && currentShape && (
          <>
            <div className="text-center">
              <p className="text-2xl mb-2">{currentShape.emoji}</p>
              <p className="text-xl font-bold text-gray-800">{currentShape.name}</p>
              <p className="text-lg text-gray-600 mt-2">{currentShape.description}</p>
            </div>

            {/* Shadow theater display */}
            <div className="w-full h-64 bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-8xl opacity-50">
                {currentShape.emoji}
              </div>
              <div className="absolute bottom-4 text-white/70 text-sm">
                Hold your hand up to the camera! ✋
              </div>
            </div>

            <p className="text-lg text-purple-600 font-medium">{feedback}</p>

            <button
              type="button"
              onClick={handleGotIt}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all transform hover:scale-105"
            >
              I Made It! ✓
            </button>

            <button
              type="button"
              onClick={handleHint}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-medium hover:bg-yellow-200 transition-colors"
            >
              🔊 Hear Hint
            </button>

            <div className="flex gap-4 text-center">
              <div className="bg-green-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Done</p>
                <p className="text-2xl font-bold text-green-700">{correctCount}</p>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Score</p>
                <p className="text-2xl font-bold text-blue-700">{score}</p>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">Progress</p>
                <p className="text-2xl font-bold text-purple-700">{shapeIndex + 1}/{levelConfig.shapesPerRound}</p>
              </div>
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-4xl mb-4">🎭</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Amazing Performer!</h2>
            <p className="text-xl text-gray-600 mb-4">
              You made {correctCount} shadow shapes!
            </p>
            <p className="text-2xl font-bold text-purple-600 mb-6">Score: {score}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Finish
          </button>
        </div>
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const ShadowPuppetTheater = memo(function ShadowPuppetTheaterComponent() {
  const { saveProgress } = useGameProgress('shadow-puppet-theater');

  return (
    <GameShell
      gameId="shadow-puppet-theater"
      gameName="Shadow Puppet Theater"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <ShadowPuppetTheaterGame saveProgress={saveProgress} />
    </GameShell>
  );
});
