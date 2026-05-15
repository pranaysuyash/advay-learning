/**
 * Antonym Hunt Game
 *
 * Hunt for opposite words in a grid.
 * Educational focus: antonyms, word recognition, scanning skills.
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import {
  ANTONYM_PAIRS,
  type AntonymPair,
} from '../games/antonymHuntLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const AntonymHuntGame = memo(function AntonymHuntGameComponent() {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentPair, setCurrentPair] = useState<AntonymPair | null>(null);
  const [wordGrid, setWordGrid] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('antonym-hunt');

  const [cursor, setCursor] = useState<Point | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const isPlaying = gameState === 'playing';

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);

  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } = useGameHandTracking({
    gameName: 'AntonymHunt',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isPlaying, isHandTrackingReady, isModelLoading, startTracking]);

  useGameSessionProgress({
    gameName: 'Antonym Hunt',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, word: currentPair?.word },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setFoundWords(new Set());
    setFeedback('');
    resetStreak();
    nextRound();
    setGameState('playing');
  };

  const nextRound = () => {
    if (round >= 8) {
      setGameState('complete');
      return;
    }
    const pair = ANTONYM_PAIRS[Math.floor(Math.random() * ANTONYM_PAIRS.length)];
    setCurrentPair(pair);
    // Generate a simple word grid with the antonym and some distractors
    const grid = [pair.antonym];
    const distractors = ANTONYM_PAIRS
      .filter(p => p.word !== pair.word)
      .map(p => p.antonym);
    while (grid.length < 8 && distractors.length > 0) {
      const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
      if (!grid.includes(randomDistractor)) {
        grid.push(randomDistractor);
      }
    }
    setWordGrid(grid.sort(() => Math.random() - 0.5));
    setFoundWords(new Set());
    setRound((r) => r + 1);
    speak(`Find the word that means opposite of ${pair.word}`);
  };

  const handleWordClick = (word: string) => {
    if (!currentPair || foundWords.has(word)) return;
    playClick();

    const isCorrect = word.toLowerCase() === currentPair.antonym.toLowerCase();

    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 20;
      const streakBonus = Math.min(newStreak * 2, 20);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${currentPair.word} ↔ ${currentPair.antonym}! ${currentPair.wordEmoji}`);
      speak(`Found it! ${currentPair.word} and ${currentPair.antonym} are opposites`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 1800);
    } else {
      // Wrong word - just ignore for now
      setFoundWords((prev) => new Set([...prev, word]));
    }
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score });
    navigate('/games');
  }, [score, completeGame, navigate, playClick]);

  return (
    <GameContainer
      title="Antonym Hunt"
      score={score}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div ref={gameAreaRef} className="relative flex flex-col items-center gap-6 p-6">
        {gameState === 'start' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-6xl">🎯</div>
            <h1 className="text-4xl font-bold text-center">Antonym Hunt</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Find the opposite word! Listen to the clue and tap the matching word.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentPair && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Hunt for the opposite of:</p>
              <div className="text-4xl font-bold text-primary mt-2">
                {currentPair.word}
              </div>
              <div className="text-4xl mt-2">{currentPair.wordEmoji}</div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {wordGrid.map((word, i) => (
                <button
                  key={`${word}-${i}`}
                  onClick={() => handleWordClick(word)}
                  disabled={foundWords.has(word)}
                  className={`w-20 h-12 rounded-lg font-medium transition-all active:scale-95 ${
                    foundWords.has(word)
                      ? 'bg-muted text-muted-foreground opacity-50'
                      : 'bg-card hover:bg-accent border border-border'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Hunt {round} / 8
              </p>
            </div>

            {feedback && (
              <div className="text-center text-lg font-medium text-primary">
                {feedback}
              </div>
            )}

            {showMilestone && (
              <div className="absolute top-20 bg-amber-100 border-2 border-amber-300 px-4 py-2 rounded-xl text-amber-800 font-bold">
                🔥 {streak} Streak! 🔥
              </div>
            )}

            {scorePopup && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-3xl font-black text-green-500 animate-bounce">
                  +{scorePopup.points}
                </div>
              </div>
            )}
          </>
        )}

        {gameState === 'complete' && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-6xl">🏆</div>
            <h2 className="text-3xl font-bold">Hunt Complete!</h2>
            <p className="text-xl">Final Score: {score}</p>
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Back to Games
            </button>
          </div>
        )}

        {cursor && isPlaying && (
          <GameCursor position={cursor} isHandDetected={true} />
        )}
      </div>
    </GameContainer>
  );
});

export { AntonymHuntGame };
export default AntonymHuntGame;
