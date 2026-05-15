/**
 * Word Families Game
 *
 * Drag-and-drop word building game where children match words to word families.
 * Educational focus: phonological awareness, word patterns, reading fluency.
 */

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import {
  WORD_FAMILIES,
  type WordFamily,
  type FamilyWord,
} from '../games/wordFamiliesLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const WordFamiliesGame = memo(function WordFamiliesGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [targetFamily, setTargetFamily] = useState<WordFamily | null>(null);
  const [options, setOptions] = useState<FamilyWord[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('word-families');

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
    gameName: 'WordFamilies',
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
    gameName: 'Word Families',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, matched: matched.size },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setMatched(new Set());
    setFeedback('');
    resetStreak();
    nextRound();
    setGameState('playing');
  };

  const nextRound = () => {
    if (round >= 5) {
      setGameState('complete');
      return;
    }
    const family = WORD_FAMILIES[Math.floor(Math.random() * WORD_FAMILIES.length)];
    setTargetFamily(family);
    setOptions(family.words);
    setRound((r) => r + 1);
  };

  const checkMatch = (word: string, family: string): boolean => {
    return word.toLowerCase().endsWith(family.replace('-', ''));
  };

  const handleWordClick = (word: FamilyWord) => {
    if (!targetFamily) return;
    playClick();

    const isMatch = checkMatch(word.word, targetFamily.family);

    if (isMatch) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ "${word.word}" belongs to "${targetFamily.family}"!`);
      setMatched((m) => new Set([...m, word.word]));
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 1500);
    } else {
      playError();
      resetStreak();
      setFeedback(`❌ "${word.word}" doesn't belong to "${targetFamily.family}"`);
      triggerHaptic('error');
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
      title="Word Families"
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
            <div className="text-6xl">👨‍👩‍👧‍👦</div>
            <h1 className="text-4xl font-bold text-center">Word Families</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Find words that belong to the same family! Look for words that rhyme.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && targetFamily && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">Find words that end with:</p>
              <div className="text-4xl font-bold text-primary">
                {targetFamily.family} {targetFamily.emoji}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {options.map((word) => (
                <button
                  key={word.word}
                  onClick={() => handleWordClick(word)}
                  className="w-24 h-24 bg-card hover:bg-accent border-2 border-border rounded-xl flex flex-col items-center justify-center transition-all active:scale-95"
                >
                  <span className="text-3xl">{word.emoji}</span>
                  <span className="text-sm font-medium mt-1">{word.word}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Round {round} / 5
              </p>
            </div>

            {feedback && (
              <div className="text-center text-lg font-medium">
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
            <h2 className="text-3xl font-bold">Word Family Master!</h2>
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

export { WordFamiliesGame };
export default WordFamiliesGame;
