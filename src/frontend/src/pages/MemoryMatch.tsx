/**
 * Memory Match Game
 *
 * Children flip cards to find matching pairs using hand gestures.
 *
 * Educational Focus:
 * - Working memory and concentration
 * - Visual pattern recognition
 * - Turn-by-turn planning
 *
 * Controls:
 * - Move hand to hover over cards (yellow highlight)
 * - Pinch to flip the hovered card
 * - Mouse click also works as fallback
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import type { TrackedHandFrame } from '../types/tracking';
import type { ScreenCoordinate } from '../utils/coordinateTransform';
import {
  areCardsMatch,
  calculateMemoryScore,
  createShuffledDeck,
  getPairsForDifficulty,
  hideCards,
  isBoardComplete,
  markCardsMatched,
  type MemoryCard,
  type MemoryDifficulty,
} from '../games/memoryMatchLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

// ── Constants ────────────────────────────────────────────────────────────────

// Game configuration - Timer and delays scaled by difficulty
const GAME_CONFIG = {
  easy: { pairs: 6, timeSeconds: 90, flipDelayMs: 800 },
  medium: { pairs: 8, timeSeconds: 120, flipDelayMs: 700 },
  hard: { pairs: 10, timeSeconds: 150, flipDelayMs: 600 },
} as const;

const FLIP_PAUSE_MS = 600; // pause before hiding non-matching pair (legacy, use GAME_CONFIG)

// ── Helpers ──────────────────────────────────────────────────────────────────

function difficultyLabel(d: MemoryDifficulty) {
  if (d === 'easy')
    return { label: 'Easy', emoji: '🌱', desc: '6 pairs, 3×4 grid' };
  if (d === 'medium')
    return { label: 'Medium', emoji: '🌟', desc: '8 pairs, 4×4 grid' };
  return { label: 'Hard', emoji: '🔥', desc: '10 pairs, 4×5 grid' };
}

function gridCols(pairCount: number) {
  if (pairCount <= 6) return 3;
  if (pairCount <= 8) return 4;
  return 4;
}

// ── Component ─────────────────────────────────────────────────────────────────

const MemoryMatchGame = memo(function MemoryMatchGameComponent() {
  const { onGameComplete } = useGameDrops('memory-match');
  const { playFlip, playSuccess, playError, playCelebration, playClick } =
    useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  // ── Difficulty / Menu ──────────────────────────────────────────────────────
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('easy');
  const [showMenu, setShowMenu] = useState(true);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]); // IDs of face-up cards
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(
    GAME_CONFIG.easy.timeSeconds,
  );
  const [gameStarted, setGameStarted] = useState(false);

  // ── Hint system ────────────────────────────────────────────────────────────
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hintCardId, setHintCardId] = useState<string | null>(null);
  // Note: hintCardId is used in card className for highlight effect

  // ── Feedback ───────────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // ── Streak / Score ───────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  // ── Particle effects ─────────────────────────────────────────────────────────
  const [matchParticles, setMatchParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  // ── Hand tracking state ────────────────────────────────────────────────────
  const webcamRef = useRef<Webcam>(null);
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({
    x: 0,
    y: 0,
  });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);

  // ── Card refs for hit-testing ──────────────────────────────────────────────
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isPinchingRef = useRef(false);
  const processingRef = useRef(false); // prevents double-flip on held pinch

  // ── Timer ──────────────────────────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const completed = useMemo(() => isBoardComplete(deck), [deck]);
  const score = useMemo(
    () => (completed ? calculateMemoryScore(matches, moves, secondsLeft) : 0),
    [completed, matches, moves, secondsLeft],
  );

  useGameSessionProgress({
    gameName: 'Memory Match',
    score,
    level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    isPlaying: gameStarted && !completed,
    metaData: { moves, matches, difficulty },
  });

  // ── Start / Reset ──────────────────────────────────────────────────────────
  const startGame = useCallback(
    (diff: MemoryDifficulty) => {
      playClick();
      const pairs = getPairsForDifficulty(diff);
      setDeck(createShuffledDeck(pairs));
      setFlipped([]);
      setMoves(0);
      setMatches(0);
      setStreak(0);
      setScorePopup(null);
      setShowStreakMilestone(false);
      // Scale timer by difficulty: Easy 90s, Medium 120s, Hard 150s
      setSecondsLeft(GAME_CONFIG[diff].timeSeconds);
      setDifficulty(diff);
      setShowMenu(false);
      setGameStarted(true);
      setShowCelebration(false);
      processingRef.current = false;

      if (ttsEnabled) {
        void speak(
          `Find the matching pairs! You have ${GAME_CONFIG[diff].timeSeconds} seconds.`,
        );
      }
    },
    [playClick, speak, ttsEnabled],
  );

  // ── Timer countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || completed || showMenu) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, completed, showMenu]);

  // ── Stop timer when done ───────────────────────────────────────────────────
  useEffect(() => {
    if (completed && timerRef.current) {
      clearInterval(timerRef.current);
      playCelebration();
      triggerHaptic('celebration');
      setShowCelebration(true);
      onGameComplete(score);
    }
  }, [completed]);

  // ── Hint function ──────────────────────────────────────────────────────────
  const useHint = useCallback(() => {
    if (hintsRemaining <= 0 || !gameStarted || completed) return;

    // Find first unmatched, unflipped card
    const hiddenCard = deck.find((c) => !c.isMatched && !c.isFlipped);
    if (!hiddenCard) return;

    // Find its matching pair
    const matchingCard = deck.find(
      (c) =>
        c.id !== hiddenCard.id &&
        c.symbol === hiddenCard.symbol &&
        !c.isMatched &&
        !c.isFlipped,
    );

    if (matchingCard) {
      setHintsRemaining((h) => h - 1);
      setHintCardId(matchingCard.id);
      triggerHaptic('success');
      if (ttsEnabled) void speak('Here is a hint!');

      // Clear hint highlight after 2 seconds
      window.setTimeout(() => setHintCardId(null), 2000);
    }
  }, [hintsRemaining, gameStarted, completed, deck, ttsEnabled]);

  // ── Flip a card ────────────────────────────────────────────────────────────
  const flipCard = useCallback(
    (cardId: string) => {
      setDeck((prev) => {
        const card = prev.find((c) => c.id === cardId);
        if (!card || card.isMatched || card.isFlipped) return prev;

        const newFlipped = [...flipped, cardId];
        const nextDeck = prev.map((c) =>
          c.id === cardId ? { ...c, isFlipped: true } : c,
        );
        playFlip();

        if (newFlipped.length === 2) {
          const [aId, bId] = newFlipped;
          setMoves((m) => m + 1);

          if (areCardsMatch(nextDeck, aId, bId)) {
            const matchedDeck = markCardsMatched(nextDeck, aId, bId);
            setMatches((m) => m + 1);

            // Build streak
            const newStreak = streak + 1;
            setStreak(newStreak);

            // Calculate score with streak bonus
            const basePoints = 15;
            const streakBonus = Math.min(newStreak * 3, 15);
            const totalPoints = basePoints + streakBonus;

            // Show score popup
            setScorePopup({ points: totalPoints });
            setTimeout(() => setScorePopup(null), 700);

            playSuccess();
            triggerHaptic('success'); // Tactile feedback on match
            setShowSuccess(true);

            // Milestone every 5 matches
            if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
              setShowStreakMilestone(true);
              triggerHaptic('celebration');
              setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
            }

            setFlipped([]);
            if (ttsEnabled) void speak('Great match!');

            // Trigger particle effect at card position
            const cardEl = cardRefs.current.get(aId);
            if (cardEl) {
              const rect = cardEl.getBoundingClientRect();
              const particles = [...Array(6)].map((_, i) => ({
                id: Date.now() + i,
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              }));
              setMatchParticles((prev) => [...prev, ...particles]);
              setTimeout(() => setMatchParticles([]), 600);
            }

            return matchedDeck;
          } else {
            // Wrong - break streak
            setStreak(0);
            setShowStreakMilestone(false);
            playError();
            triggerHaptic('error'); // Tactile feedback on mismatch
            processingRef.current = true;
            window.setTimeout(() => {
              setDeck((d) => hideCards(d, aId, bId));
              setFlipped([]);
              processingRef.current = false;
            }, FLIP_PAUSE_MS);
          }

          setFlipped(newFlipped);
          return nextDeck;
        }

        setFlipped(newFlipped);
        return nextDeck;
      });
    },
    [flipped, playFlip, playSuccess, playError, speak, ttsEnabled],
  );

  // ── Hand tracking ──────────────────────────────────────────────────────────
  const handleHandFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (!frame.indexTip) {
        setIsHandDetected(false);
        return;
      }

      setIsHandDetected(true);
      const x = frame.indexTip.x * window.innerWidth;
      const y = frame.indexTip.y * window.innerHeight;
      setCursorPosition({ x, y });

      const pinching = frame.pinch.state.isPinching;
      setIsPinching(pinching);

      // Detect pinch start (edge) — ignore held pinch to prevent repeated flips
      if (pinching && !isPinchingRef.current) {
        isPinchingRef.current = true;

        if (!processingRef.current && !completed && !showMenu) {
          // Hit-test: find which card the cursor is over
          for (const [id, el] of cardRefs.current.entries()) {
            const rect = el.getBoundingClientRect();
            if (
              x >= rect.left &&
              x <= rect.right &&
              y >= rect.top &&
              y <= rect.bottom
            ) {
              flipCard(id);
              break;
            }
          }
        }
      } else if (!pinching && isPinchingRef.current) {
        isPinchingRef.current = false;
      }
    },
    [completed, showMenu, flipCard],
  );

  const {
    isReady: isHandTrackingReady,
    isLoading: isModelLoading,
    startTracking,
  } = useGameHandTracking({
    gameName: 'MemoryMatch',
    isRunning: gameStarted && !completed,
    webcamRef,
    onFrame: handleHandFrame,
  });

  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameStarted, isHandTrackingReady, isModelLoading, startTracking]);

  // ── Cursor hover highlight ─────────────────────────────────────────────────
  const hoveredCardId = useMemo(() => {
    if (!isHandDetected) return null;
    for (const [id, el] of cardRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (
        cursorPosition.x >= rect.left &&
        cursorPosition.x <= rect.right &&
        cursorPosition.y >= rect.top &&
        cursorPosition.y <= rect.bottom
      ) {
        return id;
      }
    }
    return null;
  }, [cursorPosition, isHandDetected]);

  const cols = gridCols(getPairsForDifficulty(difficulty));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <GameContainer
      webcamRef={webcamRef}
      title='Memory Match'
      score={score}
      level={difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3}
      showScore
      reportSession={false}
      onHome={() => {
        setShowMenu(true);
        setGameStarted(false);
      }}
      isHandDetected={isHandDetected}
      isPlaying={gameStarted && !showMenu}
    >
      {/* Hidden webcam */}

      <HandTrackingStatus
        isHandDetected={gameStarted ? isHandDetected : true}
        pauseOnHandLost={false}
        voicePrompt
        compact
      />

      {/* ── Menu ── */}
      {showMenu && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/40 backdrop-blur-sm z-20'>
          <div className='flex flex-col items-center bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_0_#E5B86E] text-center max-w-2xl w-[90%]'>
            <div className='text-7xl mb-4'>🧠</div>
            <h1 className='text-4xl md:text-5xl font-black text-advay-slate tracking-tight mb-4 drop-shadow-[0_4px_0_#E5B86E]'>
              Memory Match
            </h1>
            <p className='text-text-secondary font-bold mb-8 max-w-sm mx-auto text-lg leading-relaxed'>
              Flip cards to find matching pairs! Use your hand or click.
            </p>

            <div className='grid grid-cols-3 gap-4 w-full max-w-xl mb-6'>
              {(['easy', 'medium', 'hard'] as MemoryDifficulty[]).map(
                (diff) => {
                  const info = difficultyLabel(diff);
                  return (
                    <button
                      key={diff}
                      type='button'
                      onClick={() => startGame(diff)}
                      className='flex flex-col items-center gap-2 p-5 rounded-2xl border-3 border-[#F2CC8F] bg-white hover:border-blue-400 hover:scale-105 transition-all shadow-[0_4px_0_#E5B86E] active:scale-95'
                    >
                      <span className='text-4xl'>{info.emoji}</span>
                      <span className='font-black text-advay-slate text-lg'>
                        {info.label}
                      </span>
                      <span className='text-xs font-bold text-text-secondary'>
                        {info.desc}
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            {ttsEnabled && (
              <VoiceInstructions
                instructions={[
                  'Show your hand to the camera.',
                  'Move over a card and pinch to flip it.',
                  'Find matching pairs to win!',
                ]}
                autoSpeak
                showReplayButton
                replayButtonPosition='bottom-right'
              />
            )}
          </div>
        </div>
      )}

      {/* ── Game board ── */}
      {gameStarted && !showMenu && (
        <div className='absolute inset-0 flex flex-col items-center justify-center p-4 gap-4'>
          {/* Header bar */}
          <div className='flex items-center justify-between w-full max-w-3xl'>
            <div className='bg-white rounded-2xl px-5 py-2 border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] font-black text-advay-slate text-lg'>
              Moves: {moves}
            </div>

            {/* Kenney Heart HUD */}
            <div className='bg-white rounded-2xl px-4 py-2 border-2 border-pink-200 shadow-[0_4px_0_#F9A8D4] flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <img
                  key={i}
                  src={
                    streak >= (i + 1) * 2
                      ? '/assets/kenney/platformer/hud/hud_heart.png'
                      : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                  }
                  alt=''
                  className='w-6 h-6'
                />
              ))}
              <span className='ml-2 text-sm font-bold text-pink-500'>
                x{streak}
              </span>
            </div>

            <div className='bg-white rounded-2xl px-5 py-2 border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] font-black text-advay-slate text-lg'>
              Pairs: <span className='text-[#10B981]'>{matches}</span> /{' '}
              {getPairsForDifficulty(difficulty)}
            </div>
            <div
              className={`rounded-2xl px-5 py-2 border-2 shadow-[0_4px_0_#E5B86E] font-black text-lg ${secondsLeft <= 30 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-[#F2CC8F] text-advay-slate'}`}
            >
              ⏱ {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Score Popup Animation */}
          {scorePopup && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50'
            >
              <div className='text-5xl font-black text-green-500 drop-shadow-lg'>
                +{scorePopup.points}
              </div>
            </motion.div>
          )}

          {/* Streak Milestone */}
          {showStreakMilestone && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1.2, rotate: 0 }}
              exit={{ scale: 0 }}
              className='fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50'
            >
              <div className='bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl'>
                🔥 {streak} Streak! 🔥
              </div>
            </motion.div>
          )}

          {/* Hint button */}
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={useHint}
              disabled={hintsRemaining <= 0}
              className={[
                'px-4 py-2 rounded-xl font-black text-sm transition-all',
                'border-2 shadow-[0_3px_0_#E5B86E]',
                hintsRemaining > 0
                  ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 active:scale-95'
                  : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed',
              ].join(' ')}
            >
              💡 Hint ({hintsRemaining})
            </button>
            <span className='text-sm text-text-secondary font-bold'>
              {hintsRemaining === 0
                ? 'No hints left!'
                : 'Need help? Use a hint!'}
            </span>
          </div>

          {/* Card grid */}
          <div
            className='grid gap-3 relative'
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              maxWidth: `${cols * 110}px`,
            }}
          >
            {deck.map((card) => {
              const isHovered = hoveredCardId === card.id && !card.isMatched;
              const isRevealed = card.isFlipped || card.isMatched;
              return (
                <button
                  key={card.id}
                  type='button'
                  ref={(el) => {
                    if (el) cardRefs.current.set(card.id, el);
                    else cardRefs.current.delete(card.id);
                  }}
                  onClick={() => {
                    if (!processingRef.current) flipCard(card.id);
                  }}
                  disabled={card.isMatched}
                  aria-label={
                    isRevealed ? `${card.symbol} card` : 'Hidden card'
                  }
                  className={[
                    'relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-3 text-3xl md:text-4xl font-black',
                    'transition-all duration-200 select-none',
                    card.id === hintCardId
                      ? 'bg-purple-100 border-purple-400 shadow-[0_0_20px_#A855F780] scale-110'
                      : card.isMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600 scale-95 cursor-default'
                        : isHovered
                          ? 'bg-amber-50 border-amber-300 shadow-[0_0_16px_#FCD3434A] scale-105'
                          : isRevealed
                            ? 'bg-blue-50 border-blue-300 shadow-[0_4px_0_#93C5FD]'
                            : 'bg-white border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] hover:border-blue-300 hover:scale-105 cursor-pointer active:scale-95',
                  ].join(' ')}
                >
                  {isRevealed ? (
                    card.symbol
                  ) : (
                    <span className='text-[#B45309] opacity-60'>?</span>
                  )}
                  {card.isMatched && (
                    <span className='absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black'>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Match particle effects */}
          {matchParticles.map((particle, i) => (
            <div
              key={particle.id}
              className='fixed pointer-events-none z-50'
              style={{
                left: particle.x,
                top: particle.y,
                transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
              }}
            >
              <div
                className='w-3 h-3 rounded-full animate-ping'
                style={{
                  backgroundColor: [
                    '#FFD700',
                    '#FF6B6B',
                    '#4ECDC4',
                    '#45B7D1',
                    '#96CEB4',
                    '#FFEAA7',
                  ][i % 6],
                  animationDuration: '0.6s',
                }}
              />
            </div>
          ))}

          {/* Time's up banner */}
          {secondsLeft === 0 && !completed && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30'>
              <div className='bg-white rounded-3xl p-10 text-center border-3 border-[#F2CC8F] shadow-2xl'>
                <div className='text-5xl mb-4'>⏰</div>
                <h2 className='text-3xl font-black text-advay-slate mb-4'>
                  Time's Up!
                </h2>
                <p className='text-text-secondary font-bold mb-6'>
                  You matched {matches} of {getPairsForDifficulty(difficulty)}{' '}
                  pairs.
                </p>
                <div className='flex gap-3 justify-center'>
                  <button
                    type='button'
                    onClick={() => startGame(difficulty)}
                    className='px-6 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl font-black transition-all'
                  >
                    Try Again
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowMenu(true);
                      setGameStarted(false);
                    }}
                    className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-xl font-black transition-all'
                  >
                    Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completed overlay */}
          {completed && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30'>
              <div className='bg-white rounded-3xl p-10 text-center border-3 border-[#F2CC8F] shadow-2xl max-w-md w-[90%]'>
                <div className='text-5xl mb-4'>🏆</div>
                <h2 className='text-3xl font-black text-advay-slate mb-2'>
                  All Pairs Found!
                </h2>
                <div className='grid grid-cols-3 gap-4 my-6 text-center'>
                  <div>
                    <p className='text-xs font-bold text-text-secondary uppercase'>
                      Score
                    </p>
                    <p className='text-3xl font-black text-[#10B981]'>
                      {score}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-text-secondary uppercase'>
                      Moves
                    </p>
                    <p className='text-3xl font-black text-advay-slate'>
                      {moves}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-text-secondary uppercase'>
                      Time Left
                    </p>
                    <p className='text-3xl font-black text-advay-slate'>
                      {Math.floor(secondsLeft / 60)}:
                      {String(secondsLeft % 60).padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <div className='flex gap-3 justify-center'>
                  <button
                    type='button'
                    onClick={() => startGame(difficulty)}
                    className='px-6 py-3 bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl font-black transition-all'
                  >
                    Play Again
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowMenu(true);
                      setGameStarted(false);
                    }}
                    className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-xl font-black transition-all'
                  >
                    Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hand cursor */}
      {gameStarted && !showMenu && isHandDetected && (
        <GameCursor
          position={cursorPosition}
          size={80}
          isPinching={isPinching}
          isHandDetected={isHandDetected}
          showTrail={false}
          pulseAnimation
          highContrast
          icon='pointer'
        />
      )}

      <SuccessAnimation
        show={showSuccess}
        type='stars'
        message='Match! ⭐'
        duration={800}
        onComplete={() => setShowSuccess(false)}
      />

      <CelebrationOverlay
        show={showCelebration}
        letter='★'
        accuracy={100}
        message='All Pairs Matched!'
        onComplete={() => setShowCelebration(false)}
      />
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const MemoryMatch = memo(function MemoryMatchComponent() {
  return (
    <GameShell
      gameId='memory-match'
      gameName='Memory Match'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <MemoryMatchGame />
    </GameShell>
  );
});

export default MemoryMatch;
