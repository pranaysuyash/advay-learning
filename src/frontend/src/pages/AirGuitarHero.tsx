import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GamePage } from '../components/GamePage';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  generateNoteSequence,
  type GuitarNote,
} from '../games/airGuitarHeroLogic';

// Note color map for visual variety
const NOTE_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  E: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  A: { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D' },
  D: { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' },
  G: { bg: '#DCFCE7', border: '#22C55E', text: '#14532D' },
  B: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A' },
  e: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
};

interface AirGuitarHeroCtx {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  handleFinish: () => Promise<void>;
}

function AirGuitarHeroInner({
  score,
  setScore,
  currentLevel,
  setCurrentLevel,
  handleFinish,
}: AirGuitarHeroCtx) {
  const navigate = useNavigate();
  const [noteSequence, setNoteSequence] = useState<GuitarNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [strumAnimating, setStrumAnimating] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [correctCount, setCorrectCount] = useState(0);

  const { playClick, playPop, playCelebration } = useAudio();
  useGameDrops('air-guitar-hero');
  const levelConfig = useMemo(() => LEVELS[currentLevel - 1], [currentLevel]);

  // progress handled by GamePage itself
  useGameSessionProgress({
    gameName: 'Air Guitar Hero',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { total: levelConfig.notesToPlay },
  });

  const handleStart = () => {
    playClick();
    const notes = generateNoteSequence(levelConfig.notesToPlay);
    setNoteSequence(notes);
    setCurrentIndex(0);
    setFeedback('');
    setScore(0);
    setGameState('playing');
  };

  const handleStrum = () => {
    if (gameState !== 'playing' || currentIndex >= noteSequence.length) return;
    const currentNote = noteSequence[currentIndex];
    playPop();

    // Animate strum
    setStrumAnimating(true);
    setTimeout(() => setStrumAnimating(false), 150);

    setScore((prev) => prev + 25);
    setCorrectCount((prev) => prev + 1);
    setFeedback(`🎵 ${currentNote.name} string!`);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= levelConfig.notesToPlay) {
      setGameState('complete');
      playCelebration();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  
  const currentNote = noteSequence[currentIndex];
  const noteColors = currentNote
    ? (NOTE_COLORS[currentNote.name] ?? NOTE_COLORS.G)
    : NOTE_COLORS.G;

  // inner component renders the UI
  return (
    <GameContainer
      title='Air Guitar Hero'
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
            {LEVELS.map((level) => (
              <button
                key={level.level}
                type='button'
                onClick={() => {
                  playClick();
                  setCurrentLevel(level.level);
                  setGameState('start');
                }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#6D28D9] ${
                  currentLevel === level.level
                    ? 'bg-purple-600 text-white border-2 border-purple-700'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-purple-300'
                }`}
              >
                Level {level.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🎸</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>
                  Air Guitar Hero!
                </h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  STRUM each string in order to play a rockstar melody!
                </p>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {['E', 'A', 'D', 'G', 'B', 'e'].map((note) => (
                  <span
                    key={note}
                    className='px-3 py-1 rounded-full font-black text-sm border-2'
                    style={{
                      backgroundColor: NOTE_COLORS[note]?.bg,
                      borderColor: NOTE_COLORS[note]?.border,
                      color: NOTE_COLORS[note]?.text,
                    }}
                  >
                    {note} string
                  </span>
                ))}
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all'
              >
                Start Rockin'! 🎵
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && currentNote && (
            <>
              {/* Current note spotlight */}
              <div
                className='rounded-3xl border-3 p-8 text-center transition-all shadow-[0_6px_0_#E5B86E]'
                style={{
                  backgroundColor: noteColors.bg,
                  borderColor: noteColors.border,
                }}
              >
                <p
                  className='text-sm font-black uppercase tracking-widest mb-2'
                  style={{ color: noteColors.text }}
                >
                  Note {currentIndex + 1} of {noteSequence.length}
                </p>
                <p
                  className='text-6xl font-black mb-3'
                  style={{ color: noteColors.text }}
                >
                  {currentNote.name}
                </p>
                <p className='font-bold' style={{ color: noteColors.border }}>
                  {feedback || 'Hit STRUM to play this string!'}
                </p>
              </div>

              {/* Guitar neck visual */}
              <div className='bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4 relative overflow-hidden border-3 border-slate-700 shadow-2xl'>
                {/* Strings */}
                {['E', 'A', 'D', 'G', 'B', 'e'].map((string, _idx) => {
                  const colors = NOTE_COLORS[string];
                  const isCurrent = string === currentNote.name;
                  return (
                    <div
                      key={string}
                      className={`flex items-center gap-3 py-1 transition-all ${isCurrent ? 'scale-103' : 'opacity-40'}`}
                    >
                      <span
                        className='text-xs font-black w-4'
                        style={{ color: colors.border }}
                      >
                        {string}
                      </span>
                      <div
                        className={`flex-1 rounded-full transition-all ${isCurrent ? 'h-1.5' : 'h-0.5'}`}
                        style={{
                          backgroundColor: isCurrent
                            ? colors.border
                            : '#475569',
                        }}
                      />
                    </div>
                  );
                })}

                {/* Fret lines */}
                <div className='absolute inset-y-0 flex gap-16 pointer-events-none ml-8'>
                  {[1, 2, 3, 4].map((f) => (
                    <div
                      key={f}
                      className='w-0.5 h-full bg-slate-600 opacity-50'
                    />
                  ))}
                </div>
              </div>

              {/* Strum button */}
              <button
                type='button'
                onClick={handleStrum}
                className={[
                  'w-full py-8 rounded-3xl font-black text-3xl border-3 transition-all',
                  strumAnimating
                    ? 'scale-95'
                    : 'hover:scale-105 active:scale-95',
                  'bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-500 shadow-[0_6px_0_#D97706] text-slate-900',
                ].join(' ')}
              >
                🎸 STRUM!
              </button>

              {/* Note progress dots */}
              <div className='flex gap-1.5 flex-wrap justify-center'>
                {noteSequence.map((note, idx) => {
                  const colors = NOTE_COLORS[note.name] ?? NOTE_COLORS.G;
                  return (
                    <div
                      key={`${note.id}-${idx}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2 transition-all ${
                        idx < currentIndex
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                          : idx === currentIndex
                            ? 'scale-125 border-2 animate-pulse'
                            : 'opacity-30 border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                      style={
                        idx === currentIndex
                          ? {
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                              color: colors.text,
                            }
                          : {}
                      }
                    >
                      {note.name}
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className='flex items-center justify-between'>
                <div className='flex gap-3'>
                  <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-emerald-600'>
                      Played
                    </p>
                    <p className='text-2xl font-black text-emerald-700'>
                      {correctCount}
                    </p>
                  </div>
                  <div className='bg-purple-50 border-2 border-purple-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-purple-600'>
                      Score
                    </p>
                    <p className='text-2xl font-black text-purple-700'>
                      {score}
                    </p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={handleFinish}
                  className='px-5 py-3 rounded-xl bg-purple-600 text-white font-black shadow-[0_3px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all'
                >
                  Finish
                </button>
              </div>
            </>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-6xl'>🎸🌟🎸</div>
              <h2 className='text-4xl font-black text-slate-900'>Rockstar!</h2>
              <p className='text-lg text-slate-600 font-bold'>
                You shredded {correctCount} notes!
              </p>
              <div className='flex gap-4'>
                <div className='bg-purple-50 border-2 border-purple-200 px-6 py-3 rounded-xl text-center'>
                  <p className='text-xs font-black uppercase text-purple-600'>
                    Score
                  </p>
                  <p className='text-3xl font-black text-purple-700'>{score}</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={handleStart}
                  className='px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-black shadow-[0_4px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all'
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

export function AirGuitarHero() {
  return (
    <GamePage title='Air Guitar Hero' gameId='air-guitar-hero'>
      {(ctx) => <AirGuitarHeroInner {...ctx} />}
    </GamePage>
  );
}
