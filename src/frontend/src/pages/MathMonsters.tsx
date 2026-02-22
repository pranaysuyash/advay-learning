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

import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';

import { useGameHandTracking } from '../hooks/useGameHandTracking';
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

export default function MathMonsters() {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [monsterMessage, setMonsterMessage] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  
  // Finger counting state
  const [detectedFingers, setDetectedFingers] = useState<number>(0);
  const [fingerHoldStart, setFingerHoldStart] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
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
    const newGameState = initializeGame();
    setGameState(newGameState);
    setShowMenu(false);
    setMonsterMessage(getRandomPhrase(getMonsterForLevel(LEVELS[0]), 'request'));
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
    
    // Show feedback
    setShowFeedback(isCorrect ? 'correct' : 'incorrect');
    
    // Update monster message
    const currentLevel = LEVELS[newGameState.currentLevel - 1];
    const monster = getMonsterForLevel(currentLevel);
    setMonsterMessage(getRandomPhrase(monster, isCorrect ? 'correct' : 'incorrect'));
    
    // Wait before next problem
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (newGameState.completed) {
      setShowCelebration(true);
    } else {
      setShowFeedback(null);
      setDetectedFingers(0);
      setFingerHoldStart(null);
      fingerCountHistoryRef.current = [];
      
      // Update monster message for new problem
      if (newGameState.currentProblem) {
        setMonsterMessage(getRandomPhrase(monster, 'request'));
      }
    }
    
    setIsSubmitting(false);
  };
  
  const handlePlayAgain = () => {
    startGame();
    setShowCelebration(false);
  };
  
  const handleShowMenu = () => {
    setShowMenu(true);
    setShowCelebration(false);
  };
  
  // ===== RENDER HELPERS =====
  const currentLevel = LEVELS[gameState.currentLevel - 1];
  const monster = getMonsterForLevel(currentLevel);
  const levelProgress = getLevelProgress(gameState);
  
  // ===== RENDER =====
  return (
    <GameContainer title="Math Monsters" onHome={handleShowMenu}>
      {/* Hidden webcam for hand tracking */}
      <div className="absolute top-0 right-0 w-32 h-24 opacity-0 pointer-events-none overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className="w-full h-full object-cover"
        />
      </div>
      
      {showMenu ? (
        // ===== START MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-8xl mb-4">🦖</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Math Monsters!</h2>
          <p className="text-slate-600 mb-6 text-center max-w-md">
            The monsters are hungry! Show them numbers with your fingers to feed them!
          </p>
          
          <div className="bg-blue-50 rounded-xl p-6 max-w-md mb-6">
            <h3 className="font-bold text-blue-800 mb-3">How to Play:</h3>
            <ol className="text-blue-700 text-sm space-y-2">
              <li>1. Look at the math problem</li>
              <li>2. Show the answer with your fingers</li>
              <li>3. Hold your fingers up for 2 seconds</li>
              <li>4. Feed the monster!</li>
            </ol>
          </div>
          
          <div className="flex gap-4 mb-6">
            {MONSTERS.map(m => (
              <div key={m.id} className="text-center">
                <div className="text-4xl mb-1">{m.emoji}</div>
                <div className="text-xs text-slate-500">{m.name}</div>
              </div>
            ))}
          </div>
          
          <button
            onClick={startGame}
            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl transition-colors shadow-lg"
          >
            Start Feeding! 🍕
          </button>
        </div>
      ) : gameState.completed ? (
        // ===== GAME COMPLETE =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">You Fed All The Monsters!</h2>
          
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
          
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-center w-full max-w-md">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-500 text-sm">Final Score</p>
                <p className="text-4xl font-bold text-green-600">{gameState.score}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Best Streak</p>
                <p className="text-3xl font-bold text-orange-500">{gameState.maxStreak} 🔥</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Problems Solved</p>
                <p className="text-2xl font-bold text-blue-600">{gameState.problemsSolved}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Level Reached</p>
                <p className="text-2xl font-bold text-purple-600">{gameState.currentLevel}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleShowMenu}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
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
          {/* Progress Bar */}
          <div className="px-4 py-2 bg-white border-b border-slate-200">
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>Level {gameState.currentLevel} of {LEVELS.length}</span>
              <span>Score: {gameState.score}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            {gameState.streak > 1 && (
              <div className="text-center mt-1">
                <span className="inline-block bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  🔥 {gameState.streak} streak!
                </span>
              </div>
            )}
          </div>
          
          {/* Monster & Problem Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {/* Monster */}
            <div 
              className="text-9xl mb-4 transition-transform"
              style={{
                transform: showFeedback === 'correct' ? 'scale(1.1)' : showFeedback === 'incorrect' ? 'shake' : 'scale(1)',
                animation: showFeedback === 'incorrect' ? 'shake 0.5s' : undefined,
              }}
            >
              {monster.emoji}
            </div>
            
            {/* Monster Message Bubble */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 mb-6 shadow-sm max-w-sm text-center">
              <p className="text-slate-700 font-medium">{monsterMessage}</p>
            </div>
            
            {/* Math Problem */}
            {gameState.currentProblem && (
              <div className="bg-slate-100 rounded-2xl p-6 mb-6 text-center">
                <div className="text-5xl font-black text-slate-800 mb-2">
                  {gameState.currentProblem.visual.equation}
                </div>
                
                {/* Visual representation */}
                <div className="flex items-center justify-center gap-2 text-2xl mt-2">
                  {gameState.currentProblem.operation !== 'recognition' && (
                    <>
                      <span>{Array(gameState.currentProblem.num1).fill(gameState.currentProblem.visual.emoji1).join('')}</span>
                      <span className="text-slate-400">
                        {gameState.currentProblem.operation === 'addition' ? '+' : '-'}
                      </span>
                      <span>{Array(gameState.currentProblem.num2).fill(gameState.currentProblem.visual.emoji2).join('')}</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Finger Detection Display */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center min-w-[200px]">
              <p className="text-slate-500 text-sm mb-2">Showing:</p>
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {detectedFingers}
              </div>
              <div className="flex justify-center gap-1 text-2xl">
                {Array.from({ length: detectedFingers }).map((_, i) => (
                  <span key={i}>✋</span>
                ))}
              </div>
              
              {/* Hold progress */}
              {detectedFingers > 0 && fingerHoldStart && !isSubmitting && (
                <div className="mt-3">
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.min(100, ((Date.now() - fingerHoldStart) / MIN_FINGER_HOLD_TIME) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-blue-500 mt-1">Hold to submit...</p>
                </div>
              )}
            </div>
            
            {/* Hint Button */}
            <button
              onClick={() => setShowHint(!showHint)}
              className="mt-4 text-slate-400 hover:text-slate-600 text-sm underline"
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
