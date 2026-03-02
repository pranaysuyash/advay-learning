import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  createMaze,
  canMove,
  checkWin,
  type MazeCell,
  type Position,
} from '../games/mazeRunnerLogic';

const CELL_SIZE = 40;

export function MazeRunner() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState<Position>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('maze-runner');

  useGameSessionProgress({
    gameName: 'Maze Runner',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { moves },
  });

  const startGame = () => {
    const { maze: newMaze, start, end } = createMaze(currentLevel);
    setMaze(newMaze);
    setPlayerPos(start);
    setEndPos(end);
    setScore(0);
    setMoves(0);
    setGameState('playing');
    playClick();
  };

  const handleMove = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;
    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };
    if (canMove(maze, newPos)) {
      playClick();
      setPlayerPos(newPos);
      setMoves((m) => m + 1);
      if (checkWin(newPos, endPos)) {
        const timeBonus = Math.max(100 - moves, 20);
        const finalScore = 100 + timeBonus;
        setScore(finalScore);
        setGameState('won');
        playSuccess();
      }
    } else {
      playError();
    }
  }, [gameState, playerPos, maze, endPos, moves, playClick, playError, playSuccess]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove(1, 0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, gameState]);

  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(Math.round(score / 50));
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  const cols = maze[0]?.length ?? 7;

  return (
    <GameContainer
      title='Maze Runner'
      score={score}
      level={currentLevel}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-2xl mx-auto space-y-4'>

          {/* Level selector */}
          <div className='flex gap-2 justify-center'>
            {LEVELS.map((l: { level: number }) => (
              <button
                key={l.level}
                type='button'
                onClick={() => { playClick(); setCurrentLevel(l.level); setGameState('start'); }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#3730A3] ${currentLevel === l.level
                    ? 'bg-[#6366F1] text-white border-2 border-indigo-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-indigo-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🧩</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Maze Runner!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  Navigate through the maze to reach the flag — fewer moves = more bonus!
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-3 justify-center text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-indigo-50 rounded-full border border-indigo-200'>Arrow Keys / WASD</span>
                <span className='px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200'>or D-Pad buttons</span>
                <span className='px-3 py-1 bg-green-50 rounded-full border border-green-200'>3 Levels</span>
              </div>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-5 bg-[#6366F1] hover:bg-indigo-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#3730A3] hover:scale-105 active:scale-95 transition-all'
              >
                Enter the Maze! 🧩
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && maze.length > 0 && (
            <>
              {/* Stats bar */}
              <div className='flex items-center justify-between bg-white rounded-2xl border-2 border-[#F2CC8F] px-5 py-3 shadow-[0_3px_0_#E5B86E]'>
                <div className='flex items-center gap-2 text-sm font-black text-slate-500'>
                  <span>Moves:</span>
                  <span className='text-indigo-600 text-lg'>{moves}</span>
                </div>
                <div className='flex items-center gap-2 text-sm font-black text-slate-500'>
                  <span>Bonus target:</span>
                  <span className='text-emerald-600'>&lt; {100 - 20} moves</span>
                </div>
                <button
                  type='button'
                  onClick={startGame}
                  className='px-3 py-1 text-xs font-black text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50'
                >
                  Restart
                </button>
              </div>

              {/* Maze grid */}
              <div className='flex justify-center'>
                <div
                  className='grid gap-0.5 bg-slate-900 p-2 rounded-2xl shadow-2xl border-4 border-slate-700'
                  style={{ gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)` }}
                >
                  {maze.map((row, y) =>
                    row.map((cell, x) => {
                      const isPlayer = playerPos.x === x && playerPos.y === y;
                      const isEnd = endPos.x === x && endPos.y === y;
                      return (
                        <div
                          key={`cell-${x}-${y}`}
                          className={[
                            'flex items-center justify-center rounded-sm transition-colors',
                            `w-[${CELL_SIZE}px] h-[${CELL_SIZE}px]`,
                            cell.isWall
                              ? 'bg-slate-700'
                              : cell.isStart
                                ? 'bg-emerald-700'
                                : cell.isEnd
                                  ? 'bg-red-700'
                                  : cell.isPath
                                    ? 'bg-indigo-900/40'
                                    : 'bg-slate-800',
                          ].join(' ')}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        >
                          {isPlayer && (
                            <span className='text-xl leading-none select-none'>😊</span>
                          )}
                          {isEnd && !isPlayer && (
                            <span className='text-xl leading-none select-none'>🏁</span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* D-pad controls for touch */}
              <div className='flex flex-col items-center gap-1'>
                <button
                  type='button'
                  onClick={() => handleMove(0, -1)}
                  className='w-14 h-14 flex items-center justify-center rounded-2xl bg-white border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-2xl font-black text-slate-700 hover:bg-indigo-50 active:scale-95 transition-all'
                  aria-label='Move up'
                >
                  ↑
                </button>
                <div className='flex gap-1'>
                  <button
                    type='button'
                    onClick={() => handleMove(-1, 0)}
                    className='w-14 h-14 flex items-center justify-center rounded-2xl bg-white border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-2xl font-black text-slate-700 hover:bg-indigo-50 active:scale-95 transition-all'
                    aria-label='Move left'
                  >
                    ←
                  </button>
                  <div className='w-14 h-14 flex items-center justify-center opacity-0' />
                  <button
                    type='button'
                    onClick={() => handleMove(1, 0)}
                    className='w-14 h-14 flex items-center justify-center rounded-2xl bg-white border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-2xl font-black text-slate-700 hover:bg-indigo-50 active:scale-95 transition-all'
                    aria-label='Move right'
                  >
                    →
                  </button>
                </div>
                <button
                  type='button'
                  onClick={() => handleMove(0, 1)}
                  className='w-14 h-14 flex items-center justify-center rounded-2xl bg-white border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-2xl font-black text-slate-700 hover:bg-indigo-50 active:scale-95 transition-all'
                  aria-label='Move down'
                >
                  ↓
                </button>
              </div>
            </>
          )}

          {/* Won */}
          {gameState === 'won' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🏆</div>
              <h2 className='text-4xl font-black text-slate-900'>You Made It!</h2>
              <div className='grid grid-cols-2 gap-4 w-full max-w-sm'>
                <div className='bg-indigo-50 border-2 border-indigo-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-indigo-600'>Moves</p>
                  <p className='text-3xl font-black text-indigo-700'>{moves}</p>
                </div>
                <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-emerald-600'>Score</p>
                  <p className='text-3xl font-black text-emerald-700'>{score}</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={startGame}
                  className='px-8 py-4 bg-[#6366F1] text-white rounded-xl font-black shadow-[0_4px_0_#3730A3] hover:scale-105 active:scale-95 transition-all'
                >
                  Play Again
                </button>
                <button
                  type='button'
                  onClick={handleFinish}
                  className='px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-black border-2 border-slate-200 hover:bg-slate-200 transition-all'
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
}
