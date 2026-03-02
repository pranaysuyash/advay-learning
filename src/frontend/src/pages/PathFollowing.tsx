import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, createPath, isOnPath, type PathPoint } from '../games/pathFollowingLogic';

export function PathFollowing() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [path, setPath] = useState<PathPoint[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [offPath, setOffPath] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('path-following');

  useGameSessionProgress({
    gameName: 'Path Following',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { progress },
  });

  const startGame = () => {
    const { path: newPath } = createPath(currentLevel);
    setPath(newPath);
    setScore(0);
    setProgress(0);
    setOffPath(false);
    setCursorPos({ x: 0, y: 0 });
    setGameState('playing');
    playClick();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });

    if (isOnPath(x, y, path, 50)) {
      setOffPath(false);
      setProgress((p) => {
        const newProgress = Math.min(p + 1, 100);
        if (newProgress >= 100) {
          playSuccess();
          setScore((s) => s + 100);
          setGameState('complete');
          playCelebration();
        }
        return newProgress;
      });
    } else {
      setOffPath(true);
      setScore((s) => Math.max(s - 5, 0));
    }
  };

  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(Math.round(score / 20));
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  const pathWidth = path.length > 0 ? 50 : 0;

  return (
    <GameContainer
      title='Path Following'
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
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#0F766E] ${currentLevel === l.level
                    ? 'bg-[#14B8A6] text-white border-2 border-teal-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-teal-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🛤️</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Path Following!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  Move your mouse carefully along the glowing path — don't wander off!
                </p>
              </div>
              <div className='flex items-center gap-3 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-teal-50 rounded-full border border-teal-200'>Stay on the path</span>
                <span className='px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200'>Score drops if you stray</span>
              </div>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-5 bg-[#14B8A6] hover:bg-teal-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#0F766E] hover:scale-105 active:scale-95 transition-all'
              >
                Follow the Path! 🛤️
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && path.length > 0 && (
            <>
              {/* Progress */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] px-5 py-3 shadow-[0_3px_0_#E5B86E]'>
                <div className='flex items-center justify-between mb-2'>
                  <span className={`text-sm font-black ${offPath ? 'text-red-500' : 'text-teal-500'}`}>
                    {offPath ? '⚠️ Off path!' : '✅ On path!'}
                  </span>
                  <span className='text-sm font-black text-slate-500'>Score: {score}</span>
                </div>
                <div className='w-full h-3 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-100'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className='flex justify-between text-xs font-bold text-slate-400 mt-1'>
                  <span>Start</span>
                  <span>{Math.round(progress)}% complete</span>
                  <span>🏁 Goal</span>
                </div>
              </div>

              {/* Path canvas */}
              <div className='flex justify-center'>
                <div
                  className={`relative w-96 h-64 rounded-2xl overflow-hidden border-3 cursor-crosshair transition-all ${offPath
                      ? 'border-red-400 bg-red-50'
                      : 'border-teal-400 bg-gradient-to-br from-teal-50 via-emerald-50 to-white'
                    }`}
                  onMouseMove={handleMouseMove}
                  role='presentation'
                >
                  <svg className='absolute inset-0 w-full h-full'>
                    {/* Outer path glow */}
                    <polyline
                      points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill='none'
                      stroke='#5EEAD4'
                      strokeWidth={pathWidth + 10}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      opacity={0.3}
                    />
                    {/* Main path */}
                    <polyline
                      points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill='none'
                      stroke='#14B8A6'
                      strokeWidth={pathWidth}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    {/* Path highlight */}
                    <polyline
                      points={path.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill='none'
                      stroke='#A7F3D0'
                      strokeWidth={pathWidth - 12}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    {/* Start marker */}
                    {path[0] && (
                      <circle cx={path[0].x} cy={path[0].y} r='16' fill='#22C55E' opacity={0.8} />
                    )}
                    {/* End marker */}
                    {path[path.length - 1] && (
                      <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r='16' fill='#EF4444' opacity={0.8} />
                    )}
                  </svg>
                  {/* Cursor dot */}
                  <div
                    className={`absolute w-5 h-5 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors shadow-lg ${offPath ? 'bg-red-500' : 'bg-yellow-400'
                      }`}
                    style={{ left: cursorPos.x, top: cursorPos.y }}
                  />
                  {/* Labels */}
                  {path[0] && (
                    <span className='absolute text-xs font-black text-emerald-700' style={{ left: path[0].x - 8, top: path[0].y + 20 }}>START</span>
                  )}
                </div>
              </div>

              <button
                type='button'
                onClick={handleFinish}
                className='w-full py-3 rounded-xl bg-teal-500 text-white font-black shadow-[0_3px_0_#0F766E] hover:scale-105 active:scale-95 transition-all'
              >
                Finish Game
              </button>
            </>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🏁</div>
              <h2 className='text-4xl font-black text-slate-900'>Path Complete!</h2>
              <div className='flex gap-4'>
                <div className='bg-teal-50 border-2 border-teal-200 px-6 py-3 rounded-xl text-center'>
                  <p className='text-xs font-black uppercase text-teal-600'>Score</p>
                  <p className='text-3xl font-black text-teal-700'>{score}</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={startGame}
                  className='px-8 py-4 bg-[#14B8A6] text-white rounded-xl font-black shadow-[0_4px_0_#0F766E] hover:scale-105 active:scale-95 transition-all'
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
