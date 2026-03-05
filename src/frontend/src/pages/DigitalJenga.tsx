/**
 * Digital Jenga Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import {
  LEVELS,
  generateInitialBlocks,
  type Block,
} from '../games/digitalJengaLogic';

const DigitalJengaGame = memo(function DigitalJengaGameComponent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [towerHeight, setTowerHeight] = useState(0);
  const [gameState, setGameState] = useState<
    'start' | 'playing' | 'fall' | 'complete'
  >('start');

  // Streak tracking
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    meshes: unknown[];
    remove: (id: number) => void;
  } | null>(null);

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('digital-jenga');

  useGameSessionProgress({
    gameName: 'Digital Jenga',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { towerHeight },
  });

  const initScene = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sceneRef.current = { meshes: [], remove: () => {} };
    renderScene(ctx, []);
  };

  const renderScene = (ctx: CanvasRenderingContext2D, blockList: Block[]) => {
    ctx.clearRect(0, 0, 400, 300);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 400, 300);

    const centerX = 200;
    const groundY = 280;

    ctx.fillStyle = '#64748b';
    ctx.fillRect(50, groundY, 300, 10);

    blockList.forEach((block) => {
      const x = centerX + block.position[0] * 40;
      const y = groundY - block.position[1] * 30;
      const width = block.rotation[2] === 0 ? 30 : 80;
      const height = 20;

      ctx.fillStyle = block.color;
      ctx.fillRect(x - width / 2, y - height, width, height);

      ctx.strokeStyle = '#00000033';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - width / 2, y - height, width, height);

      if (selectedBlock === block.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(
          x - width / 2 - 2,
          y - height - 2,
          width + 4,
          height + 4,
        );
      }
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Height: ${towerHeight}`, 10, 40);
  };

  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        renderScene(ctx, blocks);
      }
    }
  }, [blocks, gameState, selectedBlock, score, towerHeight]);

  const startGame = () => {
    const initialBlocks = generateInitialBlocks(currentLevel);
    setBlocks(initialBlocks);
    setTowerHeight(currentLevel);
    setScore(0);
    resetStreak();
    setSelectedBlock(null);
    setGameState('playing');
    initScene();
  };

  const selectTopBlock = () => {
    if (gameState !== 'playing' || blocks.length === 0) return;

    const topY = Math.max(...blocks.map((b) => b.position[1]));
    const topBlocks = blocks.filter(
      (b) => Math.abs(b.position[1] - topY) < 0.2,
    );
    const randomBlock = topBlocks[Math.floor(Math.random() * topBlocks.length)];

    setSelectedBlock(randomBlock.id);
    playClick();
  };

  const removeSelectedBlock = () => {
    if (selectedBlock === null) return;

    playClick();
    const newBlocks = blocks.filter((b) => b.id !== selectedBlock);
    setBlocks(newBlocks);

    // Streak and scoring
    const newStreak = incrementStreak();
    const basePoints = 10;
    const streakBonus = Math.min(newStreak * 2, 15);
    const totalPoints = basePoints + streakBonus;
    setScore((s) => s + totalPoints);

    // Show popup
    setScorePopup({ points: totalPoints, x: 50, y: 40 });

    // Haptics
    triggerHaptic('success');

    const newHeight = Math.max(...newBlocks.map((b) => b.position[1])) / 0.3;
    setTowerHeight(Math.floor(newHeight));

    if (newBlocks.length === 0) {
      playSuccess();
      triggerHaptic('celebration');
      setScore((s) => s + 100);
      setGameState('complete');
    } else {
      const maxX = Math.max(...newBlocks.map((b) => Math.abs(b.position[0])));
      const maxZ = Math.max(...newBlocks.map((b) => Math.abs(b.position[2])));

      if (maxX > 1.5 || maxZ > 1.5) {
        setTimeout(() => {
          playError();
          triggerHaptic('error');
          resetStreak();
          setGameState('fall');
        }, 500);
      }
    }

    setSelectedBlock(null);
  };

  const handleCanvasClick = () => {
    if (selectedBlock === null) {
      selectTopBlock();
    } else {
      removeSelectedBlock();
    }
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(towerHeight);
    navigate('/games');
  }, [towerHeight, onGameComplete, navigate, playClick]);

  return (
    <GameContainer
      title='Digital Jenga'
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='flex flex-col items-center gap-4 p-4'>
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
                resetStreak();
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🧱</p>
            <h2 className='text-2xl font-bold mb-2'>Digital Jenga!</h2>
            <p className='mb-4'>Tap to select a block, tap again to remove!</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-amber-600 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className='text-center'>
            <p className='text-lg font-bold mb-2'>
              {selectedBlock === null
                ? 'Tap to select a block'
                : 'Tap to remove!'}
            </p>
            <div className='relative inline-block'>
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                onClick={handleCanvasClick}
                className='rounded-xl cursor-pointer shadow-lg'
              />
              
              {/* Score Popup */}
              {scorePopup && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -50, scale: 1.2 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${scorePopup.x}%`,
                    top: `${scorePopup.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="text-2xl font-bold text-green-500 drop-shadow-lg">
                    +{scorePopup.points}
                  </div>
                </motion.div>
              )}

              {/* Streak Milestone */}
              {showMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                    🔥 {streak} Streak! 🔥
                  </div>
                </motion.div>
              )}
            </div>
            <div className='flex gap-4 justify-center mt-2'>
              {streak > 0 && (
                <div className='bg-orange-100 px-4 py-2 rounded-xl text-center'>
                  <p className='text-sm text-orange-600'>Streak</p>
                  <p className='text-xl font-bold'>🔥 {streak}</p>
                </div>
              )}
              <div className='bg-yellow-100 px-4 py-2 rounded-xl text-center'>
                <p className='text-sm text-yellow-600'>Score</p>
                <p className='text-xl font-bold'>{score}</p>
              </div>
            </div>
            <p className='text-sm text-gray-500 mt-2'>
              Select a block from the top layer, then tap again to remove it!
            </p>
          </div>
        )}

        {gameState === 'fall' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>💥</p>
            <h2 className='text-2xl font-bold mb-2'>Tower Fell!</h2>
            <p className='text-xl mb-4'>Score: {score}</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-amber-600 text-white rounded-xl font-bold mr-4'
            >
              Try Again
            </button>
            <button
              type='button'
              onClick={handleFinish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold'
            >
              Finish
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🏆</p>
            <h2 className='text-2xl font-bold mb-2'>Tower Cleared!</h2>
            <p className='text-xl mb-4'>Amazing balance!</p>
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-amber-600 text-white rounded-xl font-bold mr-4'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={handleFinish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold'
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const DigitalJenga = memo(function DigitalJengaComponent() {
  return (
    <GameShell
      gameId="digital-jenga"
      gameName="Digital Jenga"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <DigitalJengaGame />
    </GameShell>
  );
});
