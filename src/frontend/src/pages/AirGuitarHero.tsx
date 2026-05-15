/**
 * Air Guitar Hero Game - CV-Enhanced Version
 *
 * Rock out with hand tracking! Strum by moving your hand down across the strings.
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007, TCK-20260314-005
 */

import {
  memo,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { GamePage } from '../components/GamePage';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';
import Webcam from 'react-webcam';
import type { Point, TrackedHandFrame } from '../types/tracking';
import {
  LEVELS,
  generateNoteSequence,
  calculateScore,
  type GuitarNote,
} from '../games/airGuitarHeroLogic';
import { triggerHaptic } from '../utils/haptics';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import { KenneyCharacter } from '../components/game/KenneyCharacterAnimated';
import { AssetPreloader, type AssetToPreload } from '../components/AssetPreloader';
import { GameBackground } from '../components/game/GameBackground';

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

// Strum detection constants
const STRUM_THRESHOLD = 0.15; // Minimum Y movement for strum
const STRUM_COOLDOWN_MS = 400; // Cooldown between strums
const STRUM_ZONE_Y = 0.7; // Y position where strumming happens

interface AirGuitarHeroCtx {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  handleFinish: () => Promise<void>;
}

const CRITICAL_ASSETS: AssetToPreload[] = [
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart.png', priority: 'normal' },
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart_empty.png', priority: 'normal' },
  { type: 'image', src: '/assets/kenney/platformer/collectibles/star.png', priority: 'normal' },
];

function AirGuitarHeroInner({
  score,
  setScore,
  currentLevel,
  setCurrentLevel,
  handleFinish,
}: AirGuitarHeroCtx) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [noteSequence, setNoteSequence] = useState<GuitarNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [strumAnimating, setStrumAnimating] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [correctCount, setCorrectCount] = useState(0);

  // CV Hand tracking state
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursorPx, setCursorPx] = useState<Point | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [strumZoneActive, setStrumZoneActive] = useState(false);
  const lastYRef = useRef<number | null>(null);
  const lastStrumTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();

  const { playClick, playPop, playCelebration } = useAudio();
  const levelConfig = useMemo(() => LEVELS[currentLevel - 1], [currentLevel]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Handle strum action
  const performStrum = useCallback(() => {
    if (gameState !== 'playing' || currentIndex >= noteSequence.length) return;
    const currentNote = noteSequence[currentIndex];
    if (!currentNote) return;

    playPop();

    // Animate strum
    setStrumAnimating(true);
    setTimeout(() => setStrumAnimating(false), 150);

    // Update streak and calculate score
    incrementStreak();

    const points = calculateScore(streak + 1, levelConfig.difficulty);
    setScore((prev) => prev + points);

    // Show score popup
    setScorePopup({ points, x: 50, y: 40 });
    setTimeout(() => setScorePopup(null), 700);

    // Haptic feedback
    triggerHaptic('success');

    setCorrectCount((prev) => prev + 1);
    setFeedback(`🎵 ${currentNote.name} string!`);

    const nextIndex = currentIndex + 1;
    if (nextIndex >= levelConfig.notesToPlay) {
      setGameState('complete');
      triggerHaptic('celebration');
      playCelebration();
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [
    gameState,
    currentIndex,
    noteSequence,
    levelConfig.difficulty,
    levelConfig.notesToPlay,
    streak,
    incrementStreak,
    setScorePopup,
    playPop,
    playCelebration,
  ]);

  // Handle hand tracking frame for strumming
  const handleFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (frame.indexTip) {
        const tip = frame.indexTip;
        setHandDetected(true);
        setCursorPx({
          x: tip.x * window.innerWidth,
          y: tip.y * window.innerHeight,
        });

        // Strum detection based on Y velocity
        const currentY = tip.y;
        const now = performance.now();

        // Check if in strum zone (lower part of screen)
        const inStrumZone = currentY > STRUM_ZONE_Y;
        setStrumZoneActive(inStrumZone);

        if (lastYRef.current !== null) {
          const deltaY = currentY - lastYRef.current;
          velocityRef.current = deltaY;

          // Detect downward strum motion
          if (
            deltaY > STRUM_THRESHOLD &&
            inStrumZone &&
            now - lastStrumTimeRef.current > STRUM_COOLDOWN_MS
          ) {
            performStrum();
            lastStrumTimeRef.current = now;
          }
        }

        lastYRef.current = currentY;
      } else {
        setHandDetected(false);
        setCursorPx(null);
        setStrumZoneActive(false);
        lastYRef.current = null;
      }
    },
    [performStrum],
  );

  // Setup hand tracking
  useGameHandTracking({
    gameName: 'Air Guitar Hero',
    webcamRef,
    isRunning: gameState === 'playing',
    onFrame: handleFrame,
    smoothing: {
      minCutoff: 1.0,
      beta: 0.3,
    },
  });

  // Must be above the early return to satisfy React Rules of Hooks
  useGameSessionProgress({
    gameName: 'Air Guitar Hero',
    score,
    level: currentLevel,
    isPlaying: !isLoading && gameState === 'playing',
    metaData: { total: levelConfig.notesToPlay },
  });

  if (isLoading) {
    return (
      <AssetPreloader
        assets={CRITICAL_ASSETS}
        onComplete={handleLoadingComplete}
        minDisplayTime={800}
      />
    );
  }

  const handleStart = () => {
    playClick();
    const notes = generateNoteSequence(levelConfig.notesToPlay);
    setNoteSequence(notes);
    setCurrentIndex(0);
    setFeedback('');
    setScore(0);
    resetStreak();
    setGameState('playing');
  };

  const handleStrum = () => {
    performStrum();
  };

  const currentNote = noteSequence[currentIndex];
  const noteColors = currentNote
    ? (NOTE_COLORS[currentNote.name] ?? NOTE_COLORS.G)
    : NOTE_COLORS.G;

  // inner component renders the UI
  return (
    <GameContainer
      title="Air Guitar Hero"
      score={score}
      level={currentLevel}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={handDetected}
    >
      {/* Hidden webcam for hand tracking */}
      <Webcam
        ref={webcamRef}
        className="hidden"
        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        audio={false}
      />

      {/* Hand cursor overlay */}
      {cursorPx && (
        <KenneyHandCursor
          position={cursorPx}
          coordinateSpace="viewport"
          state={strumZoneActive ? 'grab' : 'point'}
          isPinching={strumZoneActive}
          isHandDetected={handDetected}
          size={48}
          color="yellow"
        />
      )}

      <GameBackground type="mushrooms" variant="color" className="absolute inset-0" />
      <div ref={gameAreaRef} className="h-full overflow-auto p-4 md:p-6 relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Level selector */}
          <div className="flex gap-2 justify-center">
            {LEVELS.map((level) => (
              <button
                key={level.level}
                type="button"
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
            <div className="flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center">
              <div className="text-7xl">🎸</div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                  Air Guitar Hero!
                </h2>
                <p className="text-lg font-bold text-slate-600 mt-2">
                  STRUM each string to build combos and become a rockstar!
                </p>
                {handDetected && (
                  <p className="text-purple-600 font-bold mt-2 animate-pulse">
                    🤘 Hand detected! Move down to strum!
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['E', 'A', 'D', 'G', 'B', 'e'].map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1 rounded-full font-black text-sm border-2"
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
              {/* CV instructions */}
              <div className="bg-purple-50 rounded-xl p-4 text-sm text-slate-600 w-full">
                <p className="font-bold mb-2">🎮 How to Play:</p>
                <p>👋 Show your hand to the camera</p>
                <p>🤘 Move your hand DOWN across the strings to strum</p>
                <p>🖱️ Or click the STRUM button</p>
              </div>
              {/* Scoring info */}
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                <p className="font-bold mb-1">🎯 Scoring:</p>
                <p>Base 10 pts + streak bonus (max 20)</p>
                <p>× Difficulty: Easy 1× | Medium 1.5× | Hard 2×</p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all"
              >
                Start Rockin&apos;! 🎵
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && currentNote && (
            <>
              {/* Streak HUD */}
              <div className="flex items-center justify-center gap-3 bg-white rounded-2xl border-2 border-[#F2CC8F] p-3 shadow-[0_3px_0_#E5B86E]">
                <KenneyCharacter color="pink" pose="walk_a" size={48} />
                <span className="font-black text-lg">🔥 Streak</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={
                        streak >= i * 2
                          ? '/assets/kenney/platformer/hud/hud_heart.png'
                          : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                      }
                      alt={streak >= i * 2 ? 'filled heart' : 'empty heart'}
                      className="w-6 h-6"
                    />
                  ))}
                </div>
                <span className="font-black text-2xl text-orange-500 min-w-[3ch] text-center">
                  {streak}
                </span>
              </div>

              {/* Hand tracking indicator */}
              <div className="flex justify-center">
                {handDetected ? (
                  <span className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-bold text-sm">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    {strumZoneActive
                      ? '🤘 STRUM ZONE! Move down!'
                      : 'Hand detected! Move to strum zone'}
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm">
                    Show your hand or use the strum button 🎸
                  </span>
                )}
              </div>

              {/* Current note spotlight */}
              <div
                className="rounded-3xl border-3 p-8 text-center transition-all shadow-[0_6px_0_#E5B86E] relative"
                style={{
                  backgroundColor: noteColors.bg,
                  borderColor: noteColors.border,
                }}
              >
                {/* Streak milestone popup */}
                {showMilestone && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-3xl animate-pulse">
                    <div className="bg-white rounded-2xl px-6 py-4 shadow-2xl animate-bounce">
                      <p className="text-3xl font-black text-orange-500">
                        🔥 {streak} Note Streak! 🔥
                      </p>
                    </div>
                  </div>
                )}
                {/* Score popup */}
                {scorePopup && (
                  <div
                    className="absolute font-black text-3xl text-yellow-500 animate-bounce pointer-events-none"
                    style={{
                      left: `${scorePopup.x}%`,
                      top: `${scorePopup.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    +{scorePopup.points}
                  </div>
                )}
                <p
                  className="text-sm font-black uppercase tracking-widest mb-2"
                  style={{ color: noteColors.text }}
                >
                  Note {currentIndex + 1} of {noteSequence.length}
                </p>
                <p
                  className="text-6xl font-black mb-3"
                  style={{ color: noteColors.text }}
                >
                  {currentNote.name}
                </p>
                <p className="font-bold" style={{ color: noteColors.border }}>
                  {feedback || 'Hit STRUM to play this string!'}
                </p>
              </div>

              {/* Guitar neck visual */}
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-4 relative overflow-hidden border-3 border-slate-700 shadow-2xl">
                {/* Strum zone indicator */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1/4 transition-all pointer-events-none ${
                    strumZoneActive ? 'bg-yellow-500/20' : 'bg-transparent'
                  }`}
                />
                {strumZoneActive && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-yellow-400 font-black text-sm animate-pulse">
                    🤘 STRUM NOW! 🤘
                  </div>
                )}

                {/* Strings */}
                {['E', 'A', 'D', 'G', 'B', 'e'].map((string) => {
                  const colors = NOTE_COLORS[string];
                  const isCurrent = string === currentNote.name;
                  return (
                    <div
                      key={string}
                      className={`flex items-center gap-3 py-1 transition-all ${
                        isCurrent ? 'scale-103' : 'opacity-40'
                      }`}
                    >
                      <span
                        className="text-xs font-black w-4"
                        style={{ color: colors.border }}
                      >
                        {string}
                      </span>
                      <div
                        className={`flex-1 rounded-full transition-all ${
                          isCurrent ? 'h-1.5' : 'h-0.5'
                        }`}
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
                <div className="absolute inset-y-0 flex gap-16 pointer-events-none ml-8">
                  {[1, 2, 3, 4].map((f) => (
                    <div
                      key={f}
                      className="w-0.5 h-full bg-slate-600 opacity-50"
                    />
                  ))}
                </div>
              </div>

              {/* Strum button */}
              <button
                type="button"
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
              <div className="flex gap-1.5 flex-wrap justify-center">
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
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs font-black uppercase text-emerald-600">
                      Played
                    </p>
                    <p className="text-2xl font-black text-emerald-700">
                      {correctCount}
                    </p>
                  </div>
                  <div className="bg-purple-50 border-2 border-purple-200 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs font-black uppercase text-purple-600">
                      Score
                    </p>
                    <p className="text-2xl font-black text-purple-700">
                      {score}
                    </p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs font-black uppercase text-orange-600">
                      Best Streak
                    </p>
                    <p className="text-2xl font-black text-orange-700">
                      {maxStreak}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-5 py-3 rounded-xl bg-purple-600 text-white font-black shadow-[0_3px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all"
                >
                  Finish
                </button>
              </div>
            </>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className="flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl">🎸</span>
                <KenneyIcon type="star" size={48} />
                <span className="text-5xl">🎸</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900">Rockstar!</h2>
              <p className="text-lg text-slate-600 font-bold">
                You shredded {correctCount} notes!
              </p>
              {/* Max streak badge */}
              {maxStreak >= 5 && (
                <div className="flex items-center gap-2 bg-orange-100 border-2 border-orange-300 px-4 py-2 rounded-full">
                  <img
                    src="/assets/kenney/platformer/collectibles/star.png"
                    alt="star"
                    className="w-6 h-6"
                  />
                  <span className="font-black text-orange-700">
                    Best Streak: {maxStreak}!
                  </span>
                </div>
              )}
              <div className="flex gap-4">
                <div className="bg-purple-50 border-2 border-purple-200 px-6 py-3 rounded-xl text-center">
                  <p className="text-xs font-black uppercase text-purple-600">
                    Score
                  </p>
                  <p className="text-3xl font-black text-purple-700">{score}</p>
                </div>
                <div className="bg-orange-50 border-2 border-orange-200 px-6 py-3 rounded-xl text-center">
                  <p className="text-xs font-black uppercase text-orange-600">
                    Max Streak
                  </p>
                  <p className="text-3xl font-black text-orange-700">
                    {maxStreak}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-black shadow-[0_4px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-black border-2 border-slate-200 hover:bg-slate-200 transition-all"
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

const AirGuitarHeroGame = memo(function AirGuitarHeroGameComponent() {
  return (
    <GamePage title="Air Guitar Hero" gameId="air-guitar-hero">
      {(ctx) => <AirGuitarHeroInner {...ctx} />}
    </GamePage>
  );
});

// Main export wrapped with GameShell
export const AirGuitarHero = memo(function AirGuitarHeroComponent() {
  return (
    <GameShell
      gameId="air-guitar-hero"
      gameName="Air Guitar Hero"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <AirGuitarHeroGame />
    </GameShell>
  );
});

export default AirGuitarHero;
