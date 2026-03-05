/**
 * Math Monsters Game
 * 
 * Feed hungry monsters by showing the correct answer with your fingers!
 * 
 * Educational Focus:
 * - Number recognition (0-20)
 * - Addition and subtraction concepts
 * - Finger counting as calculation tool
 * - Math fact fluency
 * 
 * Controls:
 * - Show fingers to answer
 * - Hand tracking counts fingers automatically
 * - Visual feedback for correct/incorrect
 */

import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { CSSMonster } from '../components/characters/CSSMonster';
import { KenneyCharacter } from '../components/characters/KenneyCharacter';

import { useAudio } from '../utils/hooks/useAudio';
import { useKenneyAudio } from '../utils/hooks/useKenneyAudio';
import { triggerHaptic } from '../utils/haptics';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';
import '../styles/animations.css';
import { motion, AnimatePresence } from 'framer-motion';

import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { countExtendedFingersFromLandmarks } from '../games/fingerCounting';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import {
  type GameState,
  LEVELS,
  MONSTERS,
  initializeGame,
  getMonsterForLevel,
  getRandomPhrase,
  processAnswer,
  checkAnswer,
  getLevelProgress,
} from '../games/mathMonstersLogic';

// Debounce time for finger counting (ms)
const FINGER_COUNT_DEBOUNCE = 1000;
const MIN_FINGER_HOLD_TIME = 1500;

function MathMonstersGame() {
  // ===== AUDIO =====
  const { playSuccess, playError, playClick, playMunch, playFanfare } = useAudio();
  const { playCoin, playHurt, playSelect } = useKenneyAudio();
  const { onGameComplete } = useGameDrops('math-monsters');
  const { speak, isEnabled: ttsEnabled } = useTTS();

  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [monsterMessage, setMonsterMessage] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [monsterExpression, setMonsterExpression] = useState<'idle' | 'happy' | 'sad' | 'eating' | 'hungry'>('idle');

  // Finger counting state
  const [detectedFingers, setDetectedFingers] = useState<number>(0);
  const [fingerHoldStart, setFingerHoldStart] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      // Audio initialized via useAudio hook
    };
    document.addEventListener('click', handleInteraction, { once: true });
    return () => document.removeEventListener('click', handleInteraction);
  }, []);

  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const lastFingerCountRef = useRef<number>(0);
  const fingerCountHistoryRef = useRef<number[]>([]);
  const lastSubmitTimeRef = useRef<number>(0);

  // ===== HAND TRACKING =====
  const handleHandFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    if (!frame.primaryHand || isSubmitting || showMenu) return;

    // Count fingers
    const fingerCount = countExtendedFingersFromLandmarks(frame.primaryHand);

    // Add to history for smoothing
    fingerCountHistoryRef.current.push(fingerCount);
    if (fingerCountHistoryRef.current.length > 10) {
      fingerCountHistoryRef.current.shift();
    }

    // Get most common count in recent history
    const smoothedCount = getMostCommonCount(fingerCountHistoryRef.current);

    if (smoothedCount !== lastFingerCountRef.current) {
      lastFingerCountRef.current = smoothedCount;
      setDetectedFingers(smoothedCount);
      setFingerHoldStart(Date.now());
    }

    // Check if held long enough to submit
    if (fingerHoldStart && smoothedCount > 0) {
      const holdTime = Date.now() - fingerHoldStart;
      if (holdTime >= MIN_FINGER_HOLD_TIME) {
        const timeSinceLastSubmit = Date.now() - lastSubmitTimeRef.current;
        if (timeSinceLastSubmit >= FINGER_COUNT_DEBOUNCE) {
          handleSubmitAnswer(smoothedCount);
        }
      }
    }
  }, [fingerHoldStart, isSubmitting, showMenu]);

  useGameHandTracking({
    gameName: 'MathMonsters',
    isRunning: !showMenu && !showCelebration,
    webcamRef,
    onFrame: handleHandFrame,
  });

  // Helper to get most common count
  const getMostCommonCount = (counts: number[]): number => {
    const frequency: Record<number, number> = {};
    counts.forEach(c => {
      frequency[c] = (frequency[c] || 0) + 1;
    });

    let maxCount = 0;
    let mostCommon = 0;
    Object.entries(frequency).forEach(([count, freq]) => {
      if (freq > maxCount) {
        maxCount = freq;
        mostCommon = parseInt(count);
      }
    });

    return mostCommon;
  };

  // ===== GAME FLOW =====
  const startGame = () => {
    playClick();
    playSelect(); // Kenney UI sound
    const newGameState = initializeGame();
    setGameState(newGameState);
    setShowMenu(false);
    setMonsterExpression('hungry');
    setMonsterMessage(getRandomPhrase(getMonsterForLevel(LEVELS[0]), 'request'));
    setScorePopup(null);
    setShowStreakMilestone(false);
    if (ttsEnabled && newGameState.currentProblem) {
      void speak(`Feed the monster! Show ${newGameState.currentProblem.answer} fingers!`);
    }
    setDetectedFingers(0);
    setFingerHoldStart(null);
    fingerCountHistoryRef.current = [];
  };

  const handleSubmitAnswer = async (fingerCount: number) => {
    if (!gameState.currentProblem || isSubmitting) return;

    setIsSubmitting(true);
    lastSubmitTimeRef.current = Date.now();

    const isCorrect = checkAnswer(fingerCount, gameState.currentProblem.answer);

    // Update game state
    const newGameState = processAnswer(gameState, fingerCount, isCorrect);
    setGameState(newGameState);

    // Show feedback and play sound
    setShowFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      playSuccess();
      playCoin(); // Kenney coin sound
      setMonsterExpression('eating');
      triggerHaptic('success');
      
      // Calculate and show score popup
      const basePoints = 10;
      const streakBonus = Math.min(gameState.streak * 2, 20);
      const totalPoints = basePoints + streakBonus;
      setScorePopup({ points: totalPoints });
      setTimeout(() => setScorePopup(null), 700);
      
      // Streak milestone every 5
      const newStreak = gameState.streak + 1;
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
      }
      
      if (ttsEnabled) {
        void speak('Yum! Correct answer!');
      }
      setTimeout(() => playMunch(), 200);
    } else {
      playError();
      playHurt(); // Kenney hurt sound
      setMonsterExpression('sad');
      triggerHaptic('error');
      setShowStreakMilestone(false);
      if (ttsEnabled) {
        void speak(`That's ${fingerCount}. Try ${gameState.currentProblem?.answer} fingers!`);
      }
    }

    // Update monster message
    const currentLevel = LEVELS[newGameState.currentLevel - 1];
    const monster = getMonsterForLevel(currentLevel);
    setMonsterMessage(getRandomPhrase(monster, isCorrect ? 'correct' : 'incorrect'));

    // Wait before next problem
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (newGameState.completed) {
      playFanfare();
      triggerHaptic('celebration');
      onGameComplete();
      setShowCelebration(true);
    } else {
      setShowFeedback(null);
      setDetectedFingers(0);
      setFingerHoldStart(null);
      fingerCountHistoryRef.current = [];
      setMonsterExpression('hungry');

      // Update monster message for new problem
      if (newGameState.currentProblem) {
        setMonsterMessage(getRandomPhrase(monster, 'request'));
      }
    }

    setIsSubmitting(false);
  };

  const handlePlayAgain = () => {
    playClick();
    startGame();
    setShowCelebration(false);
    setScorePopup(null);
    setShowStreakMilestone(false);
  };

  const handleShowMenu = () => {
    playClick();
    setShowMenu(true);
    setShowCelebration(false);
  };

  // ===== RENDER HELPERS =====
  const currentLevel = LEVELS[gameState.currentLevel - 1];
  const monster = getMonsterForLevel(currentLevel);
  const levelProgress = getLevelProgress(gameState);

  // ===== RENDER =====
  return (
    <GameContainer webcamRef={webcamRef} title="Math Monsters" onHome={handleShowMenu}>
      {/* Hidden webcam for hand tracking */}
      <div className="absolute top-0 right-0 w-32 h-24 opacity-0 pointer-events-none overflow-hidden">
        
      </div>

      {showMenu ? (
        // ===== START MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="flex justify-center gap-4 mb-4">
            {MONSTERS.map((m, i) => (
              <CSSMonster
                key={m.id}
                type={m.id as 'munchy' | 'crunchy' | 'nibbles' | 'snoozy' | 'zippy'}
                expression="idle"
                size="sm"
                className={i % 2 === 0 ? 'animate-float' : ''}
              />
            ))}
          </div>
          <h2 className="text-3xl font-bold text-advay-slate mb-2">Math Monsters!</h2>

          {/* Voice Instructions */}
          {ttsEnabled && (
            <div className="mb-4">
              <VoiceInstructions
                instructions={[
                  'Look at the math problem.',
                  'Show the answer with your fingers.',
                  'Hold for 2 seconds to feed!',
                ]}
                autoSpeak={true}
                showReplayButton={true}
                replayButtonPosition='bottom-right'
              />
            </div>
          )}

          {/* Goal Statement with Semantic Attributes */}
          <div
            data-ux-goal="Show the correct number of fingers to solve math problems and feed hungry monsters!"
            data-ux-instruction="Hold up your fingers to show the answer - the game counts them automatically!"
            className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 mb-4 max-w-md border-2 border-orange-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">◎</span>
              <div>
                <p className="font-bold text-orange-800">GOAL:</p>
                <p className="text-orange-700">Show fingers to solve math and feed monsters!</p>
                <p className="text-orange-600 text-sm">✋ 2+3=5 → Show 5 fingers!</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 max-w-md mb-6">
            <h3 className="font-bold text-blue-800 mb-3">How to Play:</h3>
            <ol className="text-blue-700 text-sm space-y-2">
              <li>1. Look at the math problem</li>
              <li>2. <strong>Show the answer with your fingers</strong></li>
              <li>3. <strong>Hold your hand up for 2 seconds</strong></li>
              <li>4. Feed the monster!</li>
            </ol>
          </div>

          <div className="flex gap-4 mb-6">
            {MONSTERS.map(m => (
              <div key={m.id} className="text-center">
                <KenneyCharacter
                  type={(m.id === 'munchy' ? 'beige' :
                    m.id === 'crunchy' ? 'green' :
                      m.id === 'nibbles' ? 'pink' :
                        m.id === 'snoozy' ? 'purple' : 'beige') as 'beige' | 'green' | 'pink' | 'purple'}
                  animation="idle"
                  size="md"
                />
                <div className="text-xs text-text-secondary mt-1">{m.name}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl transition-colors shadow-lg hover-lift"
          >
            Start Feeding!
          </button>
        </div>
      ) : gameState.completed ? (
        // ===== GAME COMPLETE =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-5xl mb-4 text-amber-500 font-bold">★</div>
          <h2 className="text-3xl font-bold text-advay-slate mb-2">You Fed All The Monsters!</h2>

          <div className="flex gap-1 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-5xl ${i < gameState.stars ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_4px_0_#E5B86E] mb-6 text-center w-full max-w-md">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-text-secondary text-sm">Final Score</p>
                <p className="text-4xl font-bold text-green-600">{gameState.score}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Best Streak</p>
                <p className="text-3xl font-bold text-orange-500">{gameState.maxStreak} 🔥</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Problems Solved</p>
                <p className="text-2xl font-bold text-blue-600">{gameState.problemsSolved}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Level Reached</p>
                <p className="text-2xl font-bold text-purple-600">{gameState.currentLevel}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShowMenu}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-xl font-bold transition-colors"
            >
              Back to Menu
            </button>
            <button
              onClick={handlePlayAgain}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
            >
              Play Again 🔄
            </button>
          </div>
        </div>
      ) : (
        // ===== GAME PLAY =====
        <div className="flex flex-col h-full">
          {/* Goal Banner with Semantic Attributes */}
          <div
            data-ux-goal={`Show ${gameState.currentProblem?.answer} fingers to solve the math problem and feed the monster!`}
            data-ux-instruction="Hold up your hand and count with your fingers"
            data-ux-action="finger-counting"
            data-ux-progress={`${gameState.problemsSolved}/${gameState.problemsInLevel}`}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 text-center shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">◎</span>
              <div>
                <p className="font-black text-lg">GOAL: Show {gameState.currentProblem?.answer} fingers to feed the monster!</p>
                <p className="text-white/90 text-sm font-medium">Hold up your hand and count with your fingers 👆</p>
              </div>
            </div>
          </div>

          {/* Progress Bar with Kenney Heart HUD */}
          <div className="px-4 py-2 bg-white border-b border-[#F2CC8F]">
            <div className="flex justify-between text-sm text-text-secondary mb-1">
              <span>Level {gameState.currentLevel} of {LEVELS.length}</span>
              <span>Score: {gameState.score}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              {/* Kenney Heart HUD */}
              <div className="flex items-center gap-1">
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
              {gameState.streak > 1 && (
                <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  🔥 {gameState.streak} streak!
                </span>
              )}
            </div>
          </div>

          {/* Score Popup Animation */}
          <AnimatePresence>
            {scorePopup && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              >
                <div className="text-5xl font-black text-green-500 drop-shadow-lg">
                  +{scorePopup.points}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streak Milestone */}
          <AnimatePresence>
            {showStreakMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.2, rotate: 0 }}
                exit={{ scale: 0 }}
                className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
              >
                <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl">
                  🔥 {gameState.streak} Streak! 🔥
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper indicator */}
          <div className="absolute top-20 right-4 z-10">
            {showFeedback === 'correct' && (
              <div className="text-4xl animate-bounce">✨</div>
            )}
            {showFeedback === 'incorrect' && (
              <div className="text-4xl animate-shake">❓</div>
            )}
          </div>

          {/* Monster & Problem Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {/* Monster - Kenney Character */}
            <div className="mb-4">
              <KenneyCharacter
                type={(monster.id === 'munchy' ? 'beige' :
                  monster.id === 'crunchy' ? 'green' :
                    monster.id === 'nibbles' ? 'pink' :
                      monster.id === 'snoozy' ? 'purple' : 'beige') as 'beige' | 'green' | 'pink' | 'purple'}
                animation={monsterExpression === 'eating' ? 'jump' :
                  monsterExpression === 'happy' ? 'walk' :
                    monsterExpression === 'sad' ? 'hit' :
                      monsterExpression === 'hungry' ? 'climb' : 'idle'}
                size="lg"
              />
            </div>

            {/* Monster Message Bubble */}
            <div className="bg-white border-2 border-[#F2CC8F] rounded-2xl px-6 py-3 mb-6 shadow-[0_4px_0_#E5B86E] max-w-sm text-center">
              <p className="text-advay-slate font-medium">{monsterMessage}</p>
            </div>

            {/* Math Problem */}
            {gameState.currentProblem && (
              <div className="bg-slate-100 rounded-2xl p-6 mb-6 text-center">
                <div className="text-5xl font-black text-advay-slate mb-2">
                  {gameState.currentProblem.visual.equation}
                </div>

                {/* Visual representation - CSS shapes instead of emojis */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  {gameState.currentProblem!.operation !== 'recognition' && (
                    <>
                      <div className="flex gap-1">
                        {Array.from({ length: gameState.currentProblem!.num1 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-orange-400 animate-pop-in"
                            style={{ animationDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>
                      <span className="text-slate-400 text-2xl font-bold mx-2">
                        {gameState.currentProblem!.operation === 'addition' ? '+' : '-'}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: gameState.currentProblem!.num2 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-blue-400 animate-pop-in"
                            style={{ animationDelay: `${(gameState.currentProblem!.num1 + i) * 50}ms` }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Finger Detection Display - Prominent */}
            <div className="bg-gradient-to-b from-blue-100 to-blue-50 border-3 border-blue-400 rounded-3xl p-8 text-center min-w-[280px] shadow-lg">
              <p className="text-blue-800 font-bold text-lg mb-4">🖐️ Your Answer:</p>

              {/* Big number display */}
              <div className="text-8xl font-black text-blue-600 mb-4">
                {detectedFingers}
              </div>

              {/* Visual finger representation */}
              <div className="flex justify-center gap-2 text-4xl mb-4 min-h-[60px]">
                {detectedFingers === 0 ? (
                  <span className="text-slate-400 text-2xl">Show fingers! 👆</span>
                ) : (
                  Array.from({ length: detectedFingers }).map((_, i) => (
                    <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>☝️</span>
                  ))
                )}
              </div>

              {/* Hold progress bar */}
              {detectedFingers > 0 && (
                <div className="mt-4">
                  <p className="text-blue-600 text-sm font-bold mb-2">
                    {fingerHoldStart && !isSubmitting ? 'Keep holding...' : '✓ Submitted!'}
                  </p>
                  {fingerHoldStart && !isSubmitting && (
                    <div className="h-4 bg-blue-200 rounded-full overflow-hidden border-2 border-blue-300">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                        style={{
                          width: `${Math.min(100, ((Date.now() - fingerHoldStart) / MIN_FINGER_HOLD_TIME) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hint Button */}
            <button
              onClick={() => {
                playClick();
                setShowHint(!showHint);
              }}
              className="mt-4 text-slate-400 hover:text-advay-slate text-sm underline"
            >
              {showHint ? 'Hide Hint' : 'Need a Hint?'}
            </button>

            {showHint && gameState.currentProblem && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-yellow-700 text-sm max-w-sm text-center">
                💡 {gameState.currentProblem.hint}
              </div>
            )}
          </div>

          {/* Feedback Overlay */}
          {showFeedback && (
            <div className={`
              absolute inset-0 flex items-center justify-center pointer-events-none
              ${showFeedback === 'correct' ? 'bg-green-500/20' : 'bg-red-500/20'}
            `}>
              <div className={`
                text-8xl font-black animate-bounce
                ${showFeedback === 'correct' ? 'text-green-500' : 'text-red-500'}
              `}>
                {showFeedback === 'correct' ? '✓' : '✗'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter="✓"
        accuracy={Math.round((gameState.problemsSolved / gameState.problemsInLevel) * 100)}
        onComplete={() => setShowCelebration(false)}
        message="All Monsters Fed!"
      />
    </GameContainer>
  );
}

export const MathMonsters = memo(function MathMonstersComponent() {
  return (
    <GameShell
      gameId='math-monsters'
      gameName='Math Monsters'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <MathMonstersGame />
    </GameShell>
  );
});

export default MathMonsters;
