/**
 * Synonym Match Game
 *
 * Match words with similar meanings.
 * Educational focus: synonyms, vocabulary expansion.
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
  SYNONYM_GROUPS,
  type SynonymGroup,
} from '../games/synonymMatchLogic';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const SynonymMatchGame = memo(function SynonymMatchGameComponent() {
  const navigate = useNavigate();
  const { speak } = useTTS();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentGroup, setCurrentGroup] = useState<SynonymGroup | null>(null);
  const [targetWord, setTargetWord] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('synonym-match');

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
    gameName: 'SynonymMatch',
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
    gameName: 'Synonym Match',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { round, word: targetWord },
  });

  const startGame = () => {
    setScore(0);
    setRound(0);
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
    const group = SYNONYM_GROUPS[Math.floor(Math.random() * SYNONYM_GROUPS.length)];
    setCurrentGroup(group);
    
    // Pick a random target word from the group
    const target = group.words[Math.floor(Math.random() * group.words.length)];
    setTargetWord(target);
    
    // Create options - include one correct synonym (different from target) and distractors
    const otherWordsInGroup = group.words.filter(w => w !== target);
    const correctAnswer = otherWordsInGroup[Math.floor(Math.random() * otherWordsInGroup.length)];
    
    const allOptions = [correctAnswer];
    
    // Add distractors from other groups
    while (allOptions.length < 4) {
      const randomGroup = SYNONYM_GROUPS[Math.floor(Math.random() * SYNONYM_GROUPS.length)];
      if (randomGroup.words[0] !== group.words[0]) {
        const distractor = randomGroup.words[Math.floor(Math.random() * randomGroup.words.length)];
        if (!allOptions.includes(distractor)) {
          allOptions.push(distractor);
        }
      }
    }
    
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setRound((r) => r + 1);
    
    speak(`Find a word that means the same as ${target}`);
  };

  const handleOptionClick = (word: string) => {
    if (!currentGroup || !targetWord) return;
    playClick();

    // Check if selected word is in the same group as target (meaning they're synonyms)
    const isCorrect = currentGroup.words.includes(word) && word !== targetWord;

    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ ${targetWord} = ${word}! ${currentGroup.emoji}`);
      speak(`${targetWord} and ${word} mean the same thing`);
      triggerHaptic('success');

      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }

      setTimeout(() => {
        nextRound();
      }, 1800);
    } else {
      playError();
      resetStreak();
      setFeedback(`❌ "${word}" doesn't mean the same as "${targetWord}"`);
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
      title="Synonym Match"
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
            <div className="text-6xl">🤝</div>
            <h1 className="text-4xl font-bold text-center">Synonym Match</h1>
            <p className="text-lg text-muted-foreground text-center max-w-md">
              Match words with similar meanings! Find the word that means the same thing.
            </p>
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && currentGroup && (
          <>
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Find a word that means the same as:</p>
              <div className="text-5xl font-bold text-primary mt-4">
                {targetWord}
              </div>
              <div className="text-5xl mt-2">{currentGroup.emoji}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((word) => (
                <button
                  key={word}
                  onClick={() => handleOptionClick(word)}
                  className="w-32 h-16 bg-card hover:bg-accent border-2 border-border rounded-xl flex items-center justify-center font-bold text-lg transition-all active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Round {round} / 8
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
            <h2 className="text-3xl font-bold">Complete!</h2>
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

export { SynonymMatchGame };
export default SynonymMatchGame;
