/**
 * Spelling Bee Game
 *
 * Spell words letter by letter to help the bee collect honey.
 * Educational focus: spelling, letter recognition, phonics.
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
  SPELLING_WORDS,
  type SpellingWord,
} from '../games/spellingBeeLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const SpellingBeeGame = memo(function SpellingBeeGameComponent() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [level, _setLevel] = useState(1);
  const [words, setWords] = useState<SpellingWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('spelling-bee');

  const [cursor, setCursor] = useState<Point | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const isPlaying = gameState === 'playing';
  const currentWord = words[currentIndex];

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);

  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } = useGameHandTracking({
    gameName: 'SpellingBee',
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
    gameName: 'Spelling Bee',
    score,
    level,
    isPlaying: gameState === 'playing',
    metaData: { currentWord: currentIndex, spelled: spelledLetters.length },
  });

  const startGame = () => {
    // Get words for current level
    const levelWords = SPELLING_WORDS.filter(w => w.difficulty === level).slice(0, 5);
    if (levelWords.length === 0) {
      // Fallback to any words if level-specific not found
      setWords(SPELLING_WORDS.slice(0, 5));
    } else {
      setWords(levelWords);
    }
    setCurrentIndex(0);
    setScore(0);
    setSpelledLetters([]);
    setFeedback('');
    resetStreak();
    setGameState('playing');
  };

  const handleLetterClick = (letter: string) => {
    if (!currentWord) return;
    playClick();

    const targetWord = currentWord.word.toUpperCase();
    const currentSpelled = [...spelledLetters, letter.toUpperCase()];

    if (currentSpelled.join('') === targetWord) {
      // Word complete!
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ "${currentWord.word}" — Perfect!`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex((i) => i + 1);
          setSpelledLetters([]);
          setFeedback('');
        } else {
          setGameState('complete');
        }
      }, 1500);
    } else if (targetWord.startsWith(currentSpelled.join(''))) {
      // Correct letter so far
      setSpelledLetters(currentSpelled);
      setFeedback('Keep going! 🐝');
    } else {
      // Wrong letter
      playError();
      resetStreak();
      setFeedback('❌ Try again!');
      triggerHaptic('error');
    }
  };

  const handleStart = () => { playClick(); startGame(); };

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score, level });
    navigate('/games');
  }, [score, level, completeGame, navigate, playClick]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <GameContainer
      title="Spelling Bee"
      score={score}
      level={level}
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
            <div className="text-6xl">🐝</div>
            <h1 className="text-4xl font-bold text-center">Spelling Bee</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Spell words letter by letter! Tap the letters to spell the word shown.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentWord && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-2">Spell this word:</p>
              <div className="text-6xl mb-2">{currentWord.emoji}</div>
              <p className="text-sm text-muted-foreground">Hint: {currentWord.hint}</p>
            </div>

            {/* Word display slots */}
            <div className="flex gap-2 justify-center">
              {currentWord.word.split('').map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold ${
                    i < spelledLetters.length
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {spelledLetters[i] || '_'}
                </div>
              ))}
            </div>

            {/* Letter grid */}
            <div className="grid grid-cols-9 gap-2 mt-4">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className="w-10 h-10 bg-card hover:bg-accent border border-border rounded-lg flex items-center justify-center font-bold transition-all active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="mt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Word {currentIndex + 1} / {words.length}
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
            <h2 className="text-3xl font-bold">Spelling Master!</h2>
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

export { SpellingBeeGame };
export default SpellingBeeGame;
