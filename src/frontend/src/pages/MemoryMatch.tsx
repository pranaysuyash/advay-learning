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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { GameContainer } from '../components/GameContainer';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { useAudio } from '../utils/hooks/useAudio';
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

// ── Constants ────────────────────────────────────────────────────────────────

const FLIP_PAUSE_MS = 600; // pause before hiding non-matching pair

// ── Helpers ──────────────────────────────────────────────────────────────────

function difficultyLabel(d: MemoryDifficulty) {
  if (d === 'easy') return { label: 'Easy', emoji: '🌱', desc: '6 pairs, 3×4 grid' };
  if (d === 'medium') return { label: 'Medium', emoji: '🌟', desc: '8 pairs, 4×4 grid' };
  return { label: 'Hard', emoji: '🔥', desc: '10 pairs, 4×5 grid' };
}

function gridCols(pairCount: number) {
  if (pairCount <= 6) return 3;
  if (pairCount <= 8) return 4;
  return 4;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MemoryMatch() {
  const { onGameComplete } = useGameDrops('memory-match');
  const { playFlip, playSuccess, playError, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  // ── Difficulty / Menu ──────────────────────────────────────────────────────
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('easy');
  const [showMenu, setShowMenu] = useState(true);

  // ── Game state ─────────────────────────────────────────────────────────────
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);  // IDs of face-up cards
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);

  // ── Feedback ───────────────────────────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // ── Hand tracking state ────────────────────────────────────────────────────
  const webcamRef = useRef<Webcam>(null);
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);

  // ── Card refs for hit-testing ──────────────────────────────────────────────
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isPinchingRef = useRef(false);
  const processingRef = useRef(false);  // prevents double-flip on held pinch

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
  const startGame = useCallback((diff: MemoryDifficulty) => {
    playClick();
    const pairs = getPairsForDifficulty(diff);
    setDeck(createShuffledDeck(pairs));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setSecondsLeft(diff === 'easy' ? 120 : diff === 'medium' ? 180 : 240);
    setDifficulty(diff);
    setShowMenu(false);
    setGameStarted(true);
    setShowCelebration(false);
    processingRef.current = false;

    if (ttsEnabled) {
      void speak('Find the matching pairs by flipping cards!');
    }
  }, [playClick, speak, ttsEnabled]);

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted, completed, showMenu]);

  // ── Stop timer when done ───────────────────────────────────────────────────
  useEffect(() => {
    if (completed && timerRef.current) {
      clearInterval(timerRef.current);
      playCelebration();
      setShowCelebration(true);
      onGameComplete(score);
    }
  }, [completed]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Flip a card ────────────────────────────────────────────────────────────
  const flipCard = useCallback((cardId: string) => {
    setDeck((prev) => {
      const card = prev.find((c) => c.id === cardId);
      if (!card || card.isMatched || card.isFlipped) return prev;

      const newFlipped = [...flipped, cardId];
      const nextDeck = prev.map((c) => c.id === cardId ? { ...c, isFlipped: true } : c);
      playFlip();

      if (newFlipped.length === 2) {
        const [aId, bId] = newFlipped;
        setMoves((m) => m + 1);

        if (areCardsMatch(nextDeck, aId, bId)) {
          const matchedDeck = markCardsMatched(nextDeck, aId, bId);
          setMatches((m) => m + 1);
          playSuccess();
          setShowSuccess(true);
          setFlipped([]);
          if (ttsEnabled) void speak('Great match!');
          return matchedDeck;
        } else {
          playError();
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
  }, [flipped, playFlip, playSuccess, playError, speak, ttsEnabled]);

  // ── Hand tracking ──────────────────────────────────────────────────────────
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
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
          if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            flipCard(id);
            break;
          }
        }
      }
    } else if (!pinching && isPinchingRef.current) {
      isPinchingRef.current = false;
    }
  }, [completed, showMenu, flipCard]);

  const { isReady: isHandTrackingReady, isLoading: isModelLoading, startTracking } =
    useGameHandTracking({
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
      title='Memory Match'
      score={score}
      level={difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3}
      showScore
      onHome={() => { setShowMenu(true); setGameStarted(false); }}
      isHandDetected={isHandDetected}
      isPlaying={gameStarted && !showMenu}
    >
      {/* Hidden webcam */}
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        style={{ display: 'none' }}
      />

      <CameraThumbnail isHandDetected={isHandDetected} visible={gameStarted && !showMenu} />
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
              {(['easy', 'medium', 'hard'] as MemoryDifficulty[]).map((diff) => {
                const info = difficultyLabel(diff);
                return (
                  <button
                    key={diff}
                    type='button'
                    onClick={() => startGame(diff)}
                    className='flex flex-col items-center gap-2 p-5 rounded-2xl border-3 border-[#F2CC8F] bg-white hover:border-blue-400 hover:scale-105 transition-all shadow-[0_4px_0_#E5B86E] active:scale-95'
                  >
                    <span className='text-4xl'>{info.emoji}</span>
                    <span className='font-black text-advay-slate text-lg'>{info.label}</span>
                    <span className='text-xs font-bold text-text-secondary'>{info.desc}</span>
                  </button>
                );
              })}
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
            <div className='bg-white rounded-2xl px-5 py-2 border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] font-black text-advay-slate text-lg'>
              Pairs: <span className='text-[#10B981]'>{matches}</span> / {getPairsForDifficulty(difficulty)}
            </div>
            <div className={`rounded-2xl px-5 py-2 border-2 shadow-[0_4px_0_#E5B86E] font-black text-lg ${secondsLeft <= 30 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-[#F2CC8F] text-advay-slate'}`}>
              ⏱ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Card grid */}
          <div
            className='grid gap-3'
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 110}px` }}
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
                  onClick={() => { if (!processingRef.current) flipCard(card.id); }}
                  disabled={card.isMatched}
                  aria-label={isRevealed ? `${card.symbol} card` : 'Hidden card'}
                  className={[
                    'relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-3 text-3xl md:text-4xl font-black',
                    'transition-all duration-200 select-none',
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600 scale-95 cursor-default'
                      : isHovered
                        ? 'bg-amber-50 border-amber-300 shadow-[0_0_16px_#FCD3434A] scale-105'
                        : isRevealed
                          ? 'bg-blue-50 border-blue-300 shadow-[0_4px_0_#93C5FD]'
                          : 'bg-white border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] hover:border-blue-300 hover:scale-105 cursor-pointer active:scale-95',
                  ].join(' ')}
                >
                  {isRevealed ? card.symbol : (
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

          {/* Time's up banner */}
          {secondsLeft === 0 && !completed && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30'>
              <div className='bg-white rounded-3xl p-10 text-center border-3 border-[#F2CC8F] shadow-2xl'>
                <div className='text-5xl mb-4'>⏰</div>
                <h2 className='text-3xl font-black text-advay-slate mb-4'>Time's Up!</h2>
                <p className='text-text-secondary font-bold mb-6'>You matched {matches} of {getPairsForDifficulty(difficulty)} pairs.</p>
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
                    onClick={() => { setShowMenu(true); setGameStarted(false); }}
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
                <h2 className='text-3xl font-black text-advay-slate mb-2'>All Pairs Found!</h2>
                <div className='grid grid-cols-3 gap-4 my-6 text-center'>
                  <div>
                    <p className='text-xs font-bold text-text-secondary uppercase'>Score</p>
                    <p className='text-3xl font-black text-[#10B981]'>{score}</p>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-text-secondary uppercase'>Moves</p>
                    <p className='text-3xl font-black text-advay-slate'>{moves}</p>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-text-secondary uppercase'>Time Left</p>
                    <p className='text-3xl font-black text-advay-slate'>
                      {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
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
                    onClick={() => { setShowMenu(true); setGameStarted(false); }}
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
}

export default MemoryMatch;
