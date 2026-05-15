/**
 * Sentence Builder Game
 *
 * Arrange words into sentences.
 * Educational focus: sentence structure, grammar, reading comprehension.
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
  SENTENCE_TEMPLATES,
  type SentenceTemplate,
} from '../games/sentenceBuilderLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const SentenceBuilderGame = memo(function SentenceBuilderGameComponent() {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentTemplate, setCurrentTemplate] = useState<SentenceTemplate | null>(null);
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('sentence-builder');

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
    gameName: 'SentenceBuilder',
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
    gameName: 'Sentence Builder',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, sentence: currentTemplate?.template },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
    setPlacedWords([]);
    setFeedback('');
    resetStreak();
    nextSentence();
    setGameState('playing');
  };

  const nextSentence = () => {
    if (round >= 6) {
      setGameState('complete');
      return;
    }
    const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
    setCurrentTemplate(template);
    
    // Get words needed and add distractors
    const correctWords = template.words.map(w => w.word);
    const allWords = [...correctWords];
    
    // Add some distractor words
    const distractors = ['jumping', 'blue', 'big', 'small', 'running', 'happy', 'sleepy'];
    while (allWords.length < correctWords.length + 3) {
      const distractor = distractors[Math.floor(Math.random() * distractors.length)];
      if (!allWords.includes(distractor)) {
        allWords.push(distractor);
      }
    }
    
    setWordOptions(allWords.sort(() => Math.random() - 0.5));
    setPlacedWords([]);
    setRound((r) => r + 1);
  };

  const handleWordClick = (word: string) => {
    if (!currentTemplate) return;
    playClick();

    const newPlaced = [...placedWords, word];
    setPlacedWords(newPlaced);

    // Remove from options
    setWordOptions(prev => prev.filter(w => w !== word));

    // Check if sentence is complete
    const correctWords = currentTemplate.words.map(w => w.word);
    if (newPlaced.length === correctWords.length) {
      const isCorrect = newPlaced.join(' ') === correctWords.join(' ');

      if (isCorrect) {
        playSuccess();
        const newStreak = incrementStreak();
        const basePoints = 20;
        const streakBonus = Math.min(newStreak * 2, 20);
        const totalPoints = basePoints + streakBonus;
        setScore((s) => s + totalPoints);
        setScorePopup({ points: totalPoints, x: 50, y: 30 });
        setFeedback(`✅ "${correctWords.join(' ')}"!`);
        speak(correctWords.join(' '));
        triggerHaptic('success');

        if (newStreak > 0 && newStreak % 5 === 0) {
          playCelebration();
          triggerHaptic('celebration');
        }

        setTimeout(() => {
          nextSentence();
        }, 2000);
      } else {
        playError();
        resetStreak();
        setFeedback(`❌ Not quite! Try again.`);
        triggerHaptic('error');
        
        // Reset
        setTimeout(() => {
          setWordOptions([...correctWords, ...newPlaced.filter(w => !correctWords.includes(w))].sort(() => Math.random() - 0.5));
          setPlacedWords([]);
        }, 1500);
      }
    }
  };

  const handleReset = () => {
    playClick();
    if (currentTemplate) {
      const correctWords = currentTemplate.words.map(w => w.word);
      setWordOptions([...correctWords, 'jumping', 'blue', 'big'].sort(() => Math.random() - 0.5));
      setPlacedWords([]);
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
      title="Sentence Builder"
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
            <div className="text-6xl">📝</div>
            <h1 className="text-4xl font-bold text-center">Sentence Builder</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Arrange words to make sentences! Tap the words in the right order.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentTemplate && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Build the sentence:</p>
              <div className="text-4xl mb-2">{currentTemplate.emoji}</div>
              <p className="text-sm text-muted-foreground">Hint: {currentTemplate.hint}</p>
            </div>

            {/* Answer slots */}
            <div className="flex flex-wrap justify-center gap-2 min-h-[3rem] p-4 bg-muted/50 rounded-xl">
              {placedWords.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  {word}
                </span>
              ))}
              {placedWords.length === 0 && (
                <span className="text-muted-foreground italic">Tap words to build sentence...</span>
              )}
            </div>

            {/* Word options */}
            <div className="flex flex-wrap justify-center gap-2">
              {wordOptions.map((word) => (
                <button
                  key={word}
                  onClick={() => handleWordClick(word)}
                  className="px-4 py-2 bg-card hover:bg-accent border border-border rounded-lg font-medium transition-all active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              ↺ Reset
            </button>

            <div className="mt-2 text-center">
              <p className="text-sm text-muted-foreground">
                Sentence {round} / 6
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
            <h2 className="text-3xl font-bold">Sentence Master!</h2>
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

export { SentenceBuilderGame };
export default SentenceBuilderGame;
