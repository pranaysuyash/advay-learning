import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameProgress } from '../hooks/useGameProgress';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  COLOR_BY_NUMBER_TEMPLATES,
  COLOR_PALETTE,
  createInitialState,
  getCompletionPercent,
  getLevelSummary,
  getRemainingCountByNumber,
  getSuggestedNumber,
  paintRegion,
  selectColorNumber,
} from '../games/colorByNumberLogic';

const resultMessage: Record<string, string> = {
  correct: 'Nice! Region filled.',
  'wrong-number': 'Try matching the region number.',
  'no-color-selected': 'Pick a color number first.',
  'already-painted': 'That part is already done.',
  'missing-region': 'Could not find that region.',
};

// Inner game component
interface ColorByNumberGameProps {
  saveProgress: (data: { score: number; completed: boolean; level?: number; metadata?: Record<string, unknown> }) => Promise<void>;
}

const ColorByNumberGame = memo(function ColorByNumberGameComponent({ saveProgress: _saveProgress }: ColorByNumberGameProps) {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('color-by-number');
  const [view, setView] = useState<'menu' | 'play'>('menu');

  const [templateIndex, setTemplateIndex] = useState(0);
  const activeTemplate = useMemo(
    () => COLOR_BY_NUMBER_TEMPLATES[templateIndex],
    [templateIndex],
  );
  const [gameState, setGameState] = useState(() => createInitialState(activeTemplate));
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [completedLevelStars, setCompletedLevelStars] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState('Pick a color number and tap matching regions.');

  useGameSessionProgress({
    gameName: 'Color by Number',
    score: gameState.score,
    level: templateIndex + 1,
    isPlaying: view === 'play' && !gameState.completed,
    metaData: {
      template_id: activeTemplate.id,
      mistakes: gameState.mistakes,
      moves: gameState.moves,
      streak: gameState.maxStreak,
      completion_percent: getCompletionPercent(gameState),
    },
  });

  const startLevel = (nextIndex: number) => {
    const template = COLOR_BY_NUMBER_TEMPLATES[nextIndex];
    setTemplateIndex(nextIndex);
    setGameState(createInitialState(template));
    setView('play');
    setFeedback('Pick a color number and tap matching regions.');
    playClick();
  };

  const handleSelectColor = (number: number) => {
    setGameState((prev) => selectColorNumber(prev, number));
    const palette = COLOR_PALETTE.find((entry) => entry.number === number);
    setFeedback(`Color ${number} selected${palette ? `: ${palette.label}` : ''}.`);
    playClick();
  };

  const handlePaintRegion = (regionId: string) => {
    setGameState((prev) => {
      const outcome = paintRegion(prev, regionId);
      setFeedback(resultMessage[outcome.result]);

      if (outcome.result === 'correct') {
        if (outcome.state.completed) {
          const summary = getLevelSummary(outcome.state);
          setCompletedLevelStars((prev) => ({ ...prev, [templateIndex]: summary.stars }));
          setUnlockedLevel((prev) =>
            Math.min(COLOR_BY_NUMBER_TEMPLATES.length - 1, Math.max(prev, templateIndex + 1)),
          );
          setFeedback(
            `Picture complete! You earned ${summary.stars} star${summary.stars === 1 ? '' : 's'
            }.`,
          );
          playCelebration();
          triggerHaptic('celebration');
          onGameComplete(outcome.state.score);
        } else {
          playSuccess();
          triggerHaptic('success');
        }
      } else if (outcome.result !== 'already-painted') {
        playError();
        triggerHaptic('error');
      }

      return outcome.state;
    });
  };

  const completion = getCompletionPercent(gameState);
  const suggestedNumber = getSuggestedNumber(gameState);

  if (view === 'menu') {
    return (
      <GameContainer
        title='Color by Number'
        score={Object.values(completedLevelStars).reduce((acc, stars) => acc + stars, 0)}
        level={unlockedLevel + 1}
        showScore
        onHome={() => navigate('/games')}
        reportSession={false}
      >
        <div className='h-full overflow-auto p-4 md:p-6'>
          <div className='max-w-5xl mx-auto space-y-5'>
            <section className='rounded-3xl border-2 border-[#F2CC8F] p-6 bg-gradient-to-br from-[#FEF3C7] via-white to-[#DBEAFE] shadow-[0_6px_0_#E5B86E]'>
              <p className='text-sm font-black uppercase tracking-widest text-[#B45309]'>New Game</p>
              <h2 className='text-4xl font-black text-slate-900 mt-2'>Color by Number Adventure</h2>
              <p className='text-lg font-bold text-slate-700 mt-3'>
                Choose a picture, match numbers to colors, and unlock the next level with stars.
              </p>
              <div className='mt-4 flex flex-wrap gap-2 text-sm font-bold text-slate-700'>
                <span className='px-3 py-1 bg-white rounded-full border border-[#F2CC8F]'>Match numbers</span>
                <span className='px-3 py-1 bg-white rounded-full border border-[#F2CC8F]'>Build streak bonus</span>
                <span className='px-3 py-1 bg-white rounded-full border border-[#F2CC8F]'>Earn up to 3 stars</span>
              </div>
            </section>

            <section className='bg-white rounded-3xl border-2 border-[#F2CC8F] p-5 shadow-[0_4px_0_#E5B86E]'>
              <h3 className='text-2xl font-black text-slate-900 mb-4'>Levels</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {COLOR_BY_NUMBER_TEMPLATES.map((template, idx) => {
                  const locked = idx > unlockedLevel;
                  const stars = completedLevelStars[idx] ?? 0;
                  return (
                    <button
                      key={template.id}
                      type='button'
                      disabled={locked}
                      onClick={() => startLevel(idx)}
                      className={`text-left rounded-2xl border-2 p-4 transition-transform ${locked
                          ? 'border-slate-200 bg-slate-100 text-slate-400'
                          : 'border-[#F2CC8F] bg-white hover:-translate-y-0.5'
                        }`}
                    >
                      <p className='text-sm font-black uppercase tracking-wide'>
                        Level {idx + 1}
                      </p>
                      <p className='text-xl font-black mt-1'>{template.name}</p>
                      <p className='text-sm font-bold mt-2'>
                        {locked ? 'Locked' : `${template.regions.length} regions`}
                      </p>
                      <p className='text-lg mt-3'>
                        {'★'.repeat(stars)}
                        {'☆'.repeat(3 - stars)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer
      title='Color by Number'
      score={gameState.score}
      level={templateIndex + 1}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-6xl mx-auto space-y-4 md:space-y-6'>
          <section className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 shadow-[0_4px_0_#E5B86E]'>
            <div className='flex flex-wrap gap-2 items-center justify-between'>
              <div>
                <p className='text-sm font-bold uppercase tracking-wide text-slate-500'>
                  Picture
                </p>
                <h2 className='text-2xl font-black text-slate-800'>{activeTemplate.name}</h2>
                <p className='text-sm font-bold text-slate-600 mt-1'>
                  Level {templateIndex + 1} of {COLOR_BY_NUMBER_TEMPLATES.length}
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                {COLOR_BY_NUMBER_TEMPLATES.map((template, idx) => {
                  const locked = idx > unlockedLevel;
                  return (
                    <button
                      key={template.id}
                      type='button'
                      disabled={locked}
                      onClick={() => startLevel(idx)}
                      className={`px-3 py-2 rounded-xl border-2 font-bold text-sm ${idx === templateIndex
                          ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                          : locked
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : 'bg-white text-slate-700 border-[#F2CC8F]'
                        }`}
                    >
                      {template.name} {locked ? '🔒' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className='mt-4'>
              <div className='w-full h-3 rounded-full bg-slate-200 overflow-hidden'>
                <div
                  className='h-full bg-[#10B981] transition-all'
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className='mt-2 text-sm font-bold text-slate-600'>
                Progress: {completion}% • Mistakes: {gameState.mistakes} • Moves: {gameState.moves}{' '}
                • Best streak: {gameState.maxStreak}
              </p>
              {suggestedNumber !== null && (
                <p className='mt-1 text-sm font-bold text-[#1D4ED8]'>
                  Hint: number {suggestedNumber} has the most unpainted regions.
                </p>
              )}
            </div>

            {/* Kenney Heart HUD */}
            <div className="flex items-center justify-center gap-1 mt-3 bg-white rounded-2xl px-4 py-2 border-2 border-pink-200 shadow-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <img
                  key={i}
                  src={gameState.streak >= (i + 1) * 2
                    ? '/assets/kenney/platformer/hud/hud_heart.png'
                    : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
                  alt=""
                  className="w-6 h-6"
                />
              ))}
              <span className="ml-2 text-sm font-bold text-pink-500">x{gameState.streak}</span>
            </div>
          </section>

          <section className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 shadow-[0_4px_0_#E5B86E]'>
            <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-3'>
              Palette
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {COLOR_PALETTE.map((entry) => {
                const selected = gameState.selectedNumber === entry.number;
                return (
                  <button
                    key={entry.number}
                    type='button'
                    onClick={() => handleSelectColor(entry.number)}
                    className={`rounded-xl border-2 p-3 text-left ${selected ? 'border-slate-800 shadow-lg' : 'border-[#F2CC8F]'
                      }`}
                    style={{ backgroundColor: `${entry.color}33` }}
                    aria-label={`Select color ${entry.number} ${entry.label}`}
                  >
                    <p className='text-xl font-black text-slate-900'>{entry.number}</p>
                    <p className='text-sm font-bold text-slate-700'>{entry.label}</p>
                    <p className='text-xs font-bold text-slate-600 mt-1'>
                      Remaining: {getRemainingCountByNumber(gameState, entry.number)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 shadow-[0_4px_0_#E5B86E]'>
            <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-3'>
              Regions
            </p>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
              {gameState.regions.map((region) => {
                const palette = COLOR_PALETTE.find((entry) => entry.number === region.number);
                return (
                  <button
                    key={region.id}
                    type='button'
                    onClick={() => handlePaintRegion(region.id)}
                    disabled={region.painted || gameState.completed}
                    className={`rounded-2xl border-2 p-4 min-h-24 text-left transition-transform ${region.painted
                        ? 'border-emerald-300'
                        : 'border-[#F2CC8F] hover:-translate-y-0.5'
                      }`}
                    style={{
                      backgroundColor:
                        region.painted && palette ? `${palette.color}88` : '#FFFFFF',
                    }}
                    aria-label={`Paint ${region.label} number ${region.number}`}
                  >
                    <p className='text-3xl font-black text-slate-800'>{region.number}</p>
                    <p className='text-sm font-bold text-slate-600'>{region.label}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className='bg-white text-slate-800 rounded-2xl p-5 border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
            <p className='text-sm font-bold uppercase tracking-wide text-slate-400'>Coach</p>
            <p className='text-xl font-black mt-1 text-slate-900'>{feedback}</p>
            <div className='mt-4 flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={() => startLevel(templateIndex)}
                className='px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold shadow-sm hover:bg-slate-50'
              >
                Restart Level
              </button>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setView('menu');
                }}
                className='px-4 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold shadow-sm hover:bg-slate-50'
              >
                Level Select
              </button>
            </div>
          </section>

          {gameState.completed && (
            <section className='bg-[#10B981]/10 rounded-2xl border-2 border-[#10B981] p-5'>
              <h3 className='text-2xl font-black text-[#047857]'>Picture complete!</h3>
              <p className='font-bold text-slate-700 mt-2'>
                Final score: {gameState.score} • Mistakes: {gameState.mistakes} • Moves:{' '}
                {gameState.moves}
              </p>
              <p className='text-2xl font-black mt-2 text-[#065F46]'>
                Stars: {'★'.repeat(getLevelSummary(gameState).stars)}
                {'☆'.repeat(3 - getLevelSummary(gameState).stars)}
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <button
                  type='button'
                  onClick={() => startLevel(templateIndex)}
                  className='px-4 py-2 rounded-xl font-bold border-2 border-[#10B981] text-[#047857] bg-white'
                >
                  Play Again
                </button>
                <button
                  type='button'
                  disabled={templateIndex >= COLOR_BY_NUMBER_TEMPLATES.length - 1}
                  onClick={() => startLevel(Math.min(templateIndex + 1, unlockedLevel))}
                  className='px-4 py-2 rounded-xl font-bold border-2 border-[#3B82F6] text-[#1D4ED8] bg-white'
                >
                  Next Picture
                </button>
                <button
                  type='button'
                  onClick={() => {
                    playClick();
                    setView('menu');
                  }}
                  className='px-4 py-2 rounded-xl font-bold border-2 border-slate-300 text-slate-700 bg-white'
                >
                  Level Select
                </button>
                <button
                  type='button'
                  onClick={() => navigate('/games')}
                  className='px-4 py-2 rounded-xl font-bold border-2 border-slate-300 text-slate-700 bg-white'
                >
                  Back to Games
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const ColorByNumber = memo(function ColorByNumberComponent() {
  const { saveProgress } = useGameProgress('color-by-number');

  return (
    <GameShell
      gameId="color-by-number"
      gameName="Color By Number"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <ColorByNumberGame saveProgress={saveProgress} />
    </GameShell>
  );
});

export default ColorByNumber;
