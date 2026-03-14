import { JengaGameState } from '../domain/GameState';
import { GAME_MODES } from '../config/constants';
import { buildHudViewModel } from './hudViewModel';

interface HUDProps {
  gameState: JengaGameState | null;
  onRestart: () => void;
  onRollDice?: () => void;
  onCancelGrab?: () => void;
  onPlaceOnTop?: () => void;
  onPauseToggle?: () => void;
  isPaused?: boolean;
  largeText?: boolean;
}

export function HUD({
  gameState,
  onRestart,
  onRollDice,
  onCancelGrab,
  onPlaceOnTop,
  onPauseToggle,
  isPaused = false,
  largeText = true,
}: HUDProps) {
  if (!gameState) {
    return (
      <div className='absolute left-4 top-20 z-40 rounded-[1.5rem] border-2 border-[#f2cc8f] bg-[#fff8f0]/96 px-5 py-4 text-sm font-black text-slate-900 shadow-xl'>
        Getting the tower ready…
      </div>
    );
  }

  const stats = gameState.getStats();
  const modeConfig = GAME_MODES[gameState.gameMode];
  const viewModel = buildHudViewModel(
    gameState,
    largeText,
    onRollDice,
    onCancelGrab,
    onPlaceOnTop,
  );

  return (
    <>
      <div className='absolute left-4 top-20 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border-2 border-[#f2cc8f] bg-[#fff8f0]/95 text-slate-900 shadow-2xl backdrop-blur-xl'>
        <HudHeader
          modeName={modeConfig.name}
          modeDescription={modeConfig.description}
          modeColor={viewModel.modeColor}
          headingSize={viewModel.headingSize}
          copySize={viewModel.copySize}
        />

        {gameState.shouldShowTargetNumbers && (
          <HudTargets
            gameState={gameState}
            validTargets={gameState.targetNumbers}
            canRoll={viewModel.canRoll}
            onRollDice={onRollDice}
            copySize={viewModel.copySize}
            buttonSize={viewModel.buttonSize}
          />
        )}

        <HudStats gameState={gameState} stats={stats} largeText={largeText} />
        <HudBalance
          copySize={viewModel.copySize}
          stabilityColor={viewModel.stabilityColor}
          stabilityEmoji={viewModel.stabilityEmoji}
          stabilityPercent={viewModel.stabilityPercent}
        />
        <HudActions
          gameState={gameState}
          onRestart={onRestart}
          onPauseToggle={onPauseToggle}
          onCancelGrab={onCancelGrab}
          onPlaceOnTop={onPlaceOnTop}
          isPaused={isPaused}
          canCancel={viewModel.canCancel}
          canPlace={viewModel.canPlace}
          copySize={viewModel.copySize}
          buttonSize={viewModel.buttonSize}
        />
      </div>

      {gameState.isGameOver && (
        <HudGameOver gameState={gameState} stats={stats} onRestart={onRestart} />
      )}
    </>
  );
}

function HudHeader({
  modeName,
  modeDescription,
  modeColor,
  headingSize,
  copySize,
}: {
  modeName: string;
  modeDescription: string;
  modeColor: string;
  headingSize: string;
  copySize: string;
}) {
  return (
    <div className='border-b border-[#f2cc8f]/70 px-5 py-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs font-black uppercase tracking-[0.25em] text-slate-500'>
            Digital Jenga
          </p>
          <h2 className={`mt-1 font-black text-slate-900 ${headingSize}`}>
            Build. Balance. Have fun.
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black text-white ${modeColor}`}>
          {modeName}
        </span>
      </div>
      <p className={`mt-3 text-slate-700 ${copySize}`}>{modeDescription}</p>
    </div>
  );
}

function HudTargets({
  gameState,
  validTargets,
  canRoll,
  onRollDice,
  copySize,
  buttonSize,
}: {
  gameState: JengaGameState;
  validTargets: number[];
  canRoll: boolean;
  onRollDice?: () => void;
  copySize: string;
  buttonSize: string;
}) {
  return (
    <div className='border-b border-[#f2cc8f]/70 px-5 py-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-2'>
          <p className='text-xs font-black uppercase tracking-[0.25em] text-slate-500'>
            Target roll
          </p>
          <div className='flex items-center gap-2'>
            {gameState.diceFaces.length > 0 ? (
              gameState.diceFaces.map((face, index) => (
                <div
                  key={`${face}-${index}`}
                  className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-900 shadow-inner'
                >
                  {face}
                </div>
              ))
            ) : (
              <div className={`rounded-2xl border border-dashed border-[#f2cc8f] px-4 py-3 font-bold text-slate-600 ${copySize}`}>
                Roll to pick your block numbers
              </div>
            )}
          </div>
        </div>
        <button
          className={`rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonSize}`}
          onClick={onRollDice}
          disabled={!canRoll}
        >
          {gameState.hasActiveTarget ? 'Roll Again' : 'Roll Dice'}
        </button>
      </div>

      {gameState.isMathMode && gameState.mathProblem && (
        <p className={`mt-3 rounded-2xl bg-sky-100 px-3 py-2 font-semibold text-sky-900 ${copySize}`}>
          Try {gameState.mathProblem.question} with +, -, ×, exact ÷, or by joining the digits.
        </p>
      )}

      <div className='mt-3 rounded-2xl bg-emerald-50 px-3 py-3'>
        <p className='text-xs font-black uppercase tracking-[0.25em] text-emerald-700'>
          Find these block numbers
        </p>
        {validTargets.length > 0 ? (
          <div className='mt-2 flex flex-wrap gap-2'>
            {validTargets.map((target) => (
              <span
                key={target}
                className={`rounded-full bg-emerald-500/15 px-3 py-1 font-black text-emerald-800 ${copySize}`}
              >
                {target}
              </span>
            ))}
          </div>
        ) : (
          <p className={`mt-2 text-slate-700 ${copySize}`}>
            Roll first, then look for the glowing number blocks.
          </p>
        )}
      </div>
    </div>
  );
}

function HudStats({
  gameState,
  stats,
  largeText,
}: {
  gameState: JengaGameState;
  stats: ReturnType<JengaGameState['getStats']>;
  largeText: boolean;
}) {
  return (
    <div className='grid grid-cols-2 gap-3 border-b border-[#f2cc8f]/70 px-5 py-4'>
      <StatCard label='Turn' value={String(gameState.turn)} largeText={largeText} />
      <StatCard label='Phase' value={formatPhase(gameState.phase)} largeText={largeText} />
      <StatCard label='Blocks Left' value={String(stats.blocksInTower ?? gameState.tower.blocks.length)} largeText={largeText} />
      <StatCard label='Placed On Top' value={String(stats.blocksPlaced ?? 0)} largeText={largeText} />
      <StatCard label='Score' value={String(stats.score ?? 0)} largeText={largeText} />
      <StatCard label='Streak' value={`x${stats.streak ?? 0}`} largeText={largeText} />
    </div>
  );
}

function HudBalance({
  copySize,
  stabilityColor,
  stabilityEmoji,
  stabilityPercent,
}: {
  copySize: string;
  stabilityColor: string;
  stabilityEmoji: string;
  stabilityPercent: number;
}) {
  return (
    <div className='border-b border-[#f2cc8f]/70 px-5 py-4'>
      <div className={`mb-2 flex items-center justify-between font-bold ${copySize}`}>
        <span className='text-slate-700'>Tower balance</span>
        <span className='text-slate-900'>
          {stabilityEmoji} {stabilityPercent}%
        </span>
      </div>
      <div className='h-3 overflow-hidden rounded-full bg-slate-200'>
        <div className={`h-full rounded-full ${stabilityColor} transition-all duration-300`} style={{ width: `${stabilityPercent}%` }} />
      </div>
    </div>
  );
}

function HudActions({
  gameState,
  onRestart,
  onPauseToggle,
  onCancelGrab,
  onPlaceOnTop,
  isPaused,
  canCancel,
  canPlace,
  copySize,
  buttonSize,
}: {
  gameState: JengaGameState;
  onRestart: () => void;
  onPauseToggle?: () => void;
  onCancelGrab?: () => void;
  onPlaceOnTop?: () => void;
  isPaused: boolean;
  canCancel: boolean;
  canPlace: boolean;
  copySize: string;
  buttonSize: string;
}) {
  const achievements = gameState.getStats().achievements ?? [];
  return (
    <div className='px-5 py-4'>
      <p className='text-xs font-black uppercase tracking-[0.25em] text-slate-500'>How to play</p>
      <p className={`mt-2 leading-6 text-slate-800 ${copySize}`}>{getPhaseInstruction(gameState)}</p>

      <button
        className={`mt-4 w-full rounded-full bg-[#ffb74d] px-4 font-black text-slate-900 shadow-lg transition hover:bg-[#f4a63a] ${buttonSize}`}
        onClick={onRestart}
      >
        Restart Tower
      </button>
      {onPauseToggle && (
        <button
          className={`mt-3 w-full rounded-full bg-sky-500 px-4 font-black text-white shadow-lg transition hover:bg-sky-600 ${buttonSize}`}
          onClick={onPauseToggle}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      )}
      {canCancel && (
        <button
          className={`mt-3 w-full rounded-full bg-slate-200 px-4 font-black text-slate-900 shadow-sm transition hover:bg-slate-300 ${buttonSize}`}
          onClick={onCancelGrab}
        >
          Oops, let go
        </button>
      )}
      {canPlace && (
        <button
          className={`mt-3 w-full rounded-full bg-emerald-500 px-4 font-black text-white shadow-lg transition hover:bg-emerald-600 ${buttonSize}`}
          onClick={onPlaceOnTop}
        >
          Place On Top
        </button>
      )}
      {achievements.length > 0 && (
        <div className={`mt-3 rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-800 ${copySize}`}>
          Badges: {achievements.join(', ')}
        </div>
      )}
    </div>
  );
}

function HudGameOver({
  gameState,
  stats,
  onRestart,
}: {
  gameState: JengaGameState;
  stats: ReturnType<JengaGameState['getStats']>;
  onRestart: () => void;
}) {
  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/75 px-4'>
      <div className='w-full max-w-sm rounded-[2rem] border-4 border-[#F2CC8F] bg-[#fff8f0] p-8 text-center shadow-2xl'>
        <h2 className={`text-3xl font-black ${gameState.winner !== null ? 'text-emerald-600' : 'text-rose-600'}`}>
          {gameState.winner !== null ? 'Tower complete!' : 'Oops! Let’s try again!'}
        </h2>
        <p className='mt-3 text-base font-semibold text-slate-700'>{gameState.collapseReason}</p>
        <div className='mt-5 rounded-[1.5rem] bg-slate-100 px-4 py-4 text-left text-sm text-slate-700'>
          <p><span className='font-black'>Turns:</span> {gameState.turn}</p>
          <p><span className='font-black'>Blocks placed:</span> {stats.blocksPlaced ?? 0}</p>
          <p><span className='font-black'>Top height:</span> {stats.towerHeight ?? 0} layers</p>
          <p><span className='font-black'>Score:</span> {stats.score ?? 0}</p>
        </div>
        <button
          className='mt-6 w-full rounded-full bg-emerald-500 px-4 py-3 text-base font-black text-white shadow-lg transition hover:bg-emerald-600'
          onClick={onRestart}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  largeText = true,
}: {
  label: string;
  value: string;
  largeText?: boolean;
}) {
  return (
    <div className='rounded-[1.25rem] bg-white/72 px-3 py-3 shadow-sm'>
      <p className='text-[11px] font-black uppercase tracking-[0.18em] text-slate-500'>{label}</p>
      <p className={`mt-1 font-black text-slate-900 ${largeText ? 'text-base' : 'text-sm'}`}>{value}</p>
    </div>
  );
}

function formatPhase(phase: string): string {
  const phaseNames: Record<string, string> = {
    select: 'Choose a block',
    grab: 'Hold steady',
    extract: 'Pull it out',
    place: 'Stack it up',
    settle: 'Wait for wobble',
    check: 'Checking tower',
  };
  return phaseNames[phase] ?? phase;
}

function getPhaseInstruction(gameState: JengaGameState): string {
  switch (gameState.phase) {
    case 'select':
      return gameState.isClassicMode
        ? 'Aim at a safe middle block, then pull it out nice and slowly.'
        : gameState.shouldShowTargetNumbers && !gameState.hasActiveTarget
          ? 'Roll the dice first, then find a glowing block with the right number.'
          : 'Pick a glowing block, then pull it out slowly and carefully.';
    case 'grab':
      return 'Keep the block straight and move slowly. Gentle hands help the tower stay steady.';
    case 'extract':
      return 'Almost there. Keep pulling until the block is fully free.';
    case 'place':
      return 'Great pull. Tap "Place On Top" when you are ready.';
    case 'settle':
      return 'Hands off for a moment while the tower wiggles and settles.';
    case 'check':
      return 'Checking if the tower is still balanced.';
    default:
      return 'Pull blocks carefully and keep the tower standing.';
  }
}
