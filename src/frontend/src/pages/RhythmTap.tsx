import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, createPattern, checkPattern } from '../games/rhythmTapLogic';

export function RhythmTap() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'listening' | 'result' | 'complete'>('start');
  const [feedback, setFeedback] = useState('');
  const [tapping, setTapping] = useState(false);

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('rhythm-tap');

  useGameSessionProgress({
    gameName: 'Rhythm Tap',
    score,
    level: currentLevel,
    isPlaying: gameState !== 'start' && gameState !== 'complete',
    metaData: { correct, round },
  });

  const playPattern = async (notes: number[], bpm: number) => {
    const interval = 60000 / bpm;
    for (let i = 0; i < notes.length; i++) {
      await new Promise((r) => setTimeout(r, interval));
      if (notes[i]) playClick();
    }
    setTimeout(() => {
      setGameState('listening');
      setFeedback('Your turn! Repeat the rhythm!');
    }, interval);
  };

  const startRound = () => {
    const newPattern = createPattern(currentLevel);
    setPattern(newPattern.notes);
    setUserInput([]);
    setFeedback('');
    setGameState('showing');
    playPattern(newPattern.notes, newPattern.bpm);
  };

  const startGame = () => {
    setRound(0);
    setScore(0);
    setCorrect(0);
    startRound();
  };

  const handleTap = () => {
    if (gameState !== 'listening') return;
    playClick();
    setTapping(true);
    setTimeout(() => setTapping(false), 120);
    const newInput = [...userInput, 1];
    setUserInput(newInput);

    if (newInput.length === pattern.length) {
      const isCorrect = checkPattern(newInput, pattern);
      setGameState('result');
      if (isCorrect) {
        playSuccess();
        setCorrect((c) => c + 1);
        setScore((s) => s + 30);
        setFeedback('🎵 Perfect rhythm!');
      } else {
        playError();
        setFeedback('❌ Not quite — try again!');
      }
      setTimeout(() => {
        if (round < 4) {
          setRound((r) => r + 1);
          startRound();
        } else {
          setGameState('complete');
          playCelebration();
        }
      }, 2000);
    }
  };

  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(correct);
    navigate('/games');
  }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer
      title='Rhythm Tap'
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
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#9D174D] ${currentLevel === l.level
                    ? 'bg-[#EC4899] text-white border-2 border-pink-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-pink-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🥁</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Rhythm Tap!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  Listen to the rhythm pattern — then tap it back perfectly!
                </p>
              </div>
              <div className='flex items-center gap-3 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-pink-50 rounded-full border border-pink-200'>Score +30 per round</span>
                <span className='px-3 py-1 bg-purple-50 rounded-full border border-purple-200'>5 rounds</span>
              </div>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-5 bg-[#EC4899] hover:bg-pink-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#9D174D] hover:scale-105 active:scale-95 transition-all'
              >
                Start Drumming! 🥁
              </button>
            </div>
          )}

          {/* Showing pattern */}
          {gameState === 'showing' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <p className='text-sm font-black uppercase tracking-widest text-pink-400'>Round {round + 1} of 5</p>
              <div className='text-5xl'>👂</div>
              <p className='text-2xl font-black text-slate-700'>Listen to the pattern...</p>
              <div className='flex gap-2 flex-wrap justify-center'>
                {pattern.map((val, i) => (
                  <div
                    key={`p-${i}`}
                    className='w-5 h-5 rounded-full bg-pink-200 border-2 border-pink-400 animate-pulse'
                  />
                ))}
              </div>
            </div>
          )}

          {/* Listening / result */}
          {(gameState === 'listening' || gameState === 'result') && (
            <div className='flex flex-col items-center gap-6'>
              {/* Status */}
              {feedback && (
                <div className={`w-full rounded-2xl px-5 py-4 border-2 font-bold text-lg text-center ${feedback.startsWith('🎵')
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : feedback.startsWith('❌')
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-pink-50 border-pink-300 text-pink-700'
                  }`}>
                  {feedback}
                </div>
              )}

              {/* Pattern dots */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 shadow-[0_3px_0_#E5B86E] w-full'>
                <p className='text-xs font-black uppercase text-slate-400 mb-3 text-center'>Pattern to match</p>
                <div className='flex gap-2 flex-wrap justify-center'>
                {pattern.map((_val, i) => (
                    <div
                      key={`p-${i}`}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${i < userInput.length
                          ? 'bg-pink-400 border-pink-500 scale-110'
                          : 'bg-pink-100 border-pink-300'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Big tap button */}
              <button
                type='button'
                onClick={handleTap}
                disabled={gameState === 'result'}
                className={[
                  'w-48 h-48 rounded-full font-black text-5xl border-4 transition-all',
                  gameState === 'result'
                    ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                    : tapping
                      ? 'bg-pink-600 border-pink-700 scale-90 shadow-inner'
                      : 'bg-[#EC4899] border-pink-600 shadow-[0_8px_0_#9D174D] hover:scale-105 active:scale-95 cursor-pointer',
                ].join(' ')}
              >
                👆
              </button>

              <p className='text-sm font-bold text-slate-400'>
                Tap {pattern.length - userInput.length} more time{pattern.length - userInput.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🎉</div>
              <h2 className='text-4xl font-black text-slate-900'>Rhythm Master!</h2>
              <div className='grid grid-cols-2 gap-4 w-full max-w-sm'>
                <div className='bg-pink-50 border-2 border-pink-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-pink-600'>Correct</p>
                  <p className='text-3xl font-black text-pink-700'>{correct}/5</p>
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
                  className='px-8 py-4 bg-[#EC4899] text-white rounded-xl font-black shadow-[0_4px_0_#9D174D] hover:scale-105 active:scale-95 transition-all'
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
