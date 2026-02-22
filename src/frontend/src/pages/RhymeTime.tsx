/**
 * Rhyme Time Game
 * 
 * Children match rhyming words to build phonological awareness.
 * 
 * Educational Focus:
 * - Phonological awareness (critical for reading success)
 * - Rhyme recognition and discrimination
 * - Vocabulary building
 * 
 * Controls:
 * - Pinch to select the word that rhymes
 * - TTS reads words aloud
 * - Visual + audio support for pre-readers
 */

import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { Mascot } from '../components/Mascot';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import {
  type RhymeRound,
  type GameState,
  type Difficulty,
  generateRound,
  initializeGame,
  checkAnswer,
  processAnswer,
  getPerformanceFeedback,
  getDifficultyDisplay,
  speakWord,
  getExampleSentence,
  calculateAccuracy,
  getStarRating,
} from '../games/rhymeTimeLogic';

export default function RhymeTime() {
  // ===== GAME STATE =====
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRound, setCurrentRound] = useState<RhymeRound | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Interaction state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const isPinchingRef = useRef(false);
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  // ===== HAND TRACKING =====
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip || isProcessing) return;
    
    const { x, y } = frame.indexTip;
    const isPinching = frame.pinch?.state.isPinching || false;
    
    // Find hovered option
    let hoveredId: string | null = null;
    optionRefs.current.forEach((el, id) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elX = (x * window.innerWidth - rect.left) / rect.width;
      const elY = (y * window.innerHeight - rect.top) / rect.height;
      
      if (elX >= -0.2 && elX <= 1.2 && elY >= -0.2 && elY <= 1.2) {
        hoveredId = id;
      }
    });
    
    setHoveredOption(hoveredId);
    
    // Handle pinch selection
    if (isPinching && !isPinchingRef.current && hoveredId) {
      isPinchingRef.current = true;
      handleSelectOption(hoveredId);
    } else if (!isPinching && isPinchingRef.current) {
      isPinchingRef.current = false;
    }
  }, [isProcessing, currentRound]);
  
  useGameHandTracking({
    gameName: 'RhymeTime',
    isRunning: !showMenu && !showCelebration && !gameState?.completed,
    webcamRef,
    onFrame: handleHandFrame,
  });
  
  // ===== GAME FLOW =====
  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    const newGameState = initializeGame(selectedDifficulty, 10);
    setGameState(newGameState);
    
    const round = generateRound(selectedDifficulty, new Set());
    setCurrentRound(round);
    
    setShowMenu(false);
    setShowFeedback(null);
    setSelectedOption(null);
    
    // Speak target word
    setTimeout(() => speakWord(round.targetWord.word), 500);
  };
  
  const handleSelectOption = async (optionWord: string) => {
    if (!currentRound || !gameState || isProcessing) return;
    
    setIsProcessing(true);
    setSelectedOption(optionWord);
    
    const isCorrect = checkAnswer(optionWord, currentRound.correctAnswer);
    setShowFeedback(isCorrect ? 'correct' : 'incorrect');
    
    // Speak the selected word
    speakWord(optionWord);
    
    // Update game state
    const newGameState = processAnswer(gameState, isCorrect, currentRound.targetFamily);
    setGameState(newGameState);
    
    // Wait before next round
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (newGameState.completed) {
      setShowCelebration(true);
    } else {
      // Generate next round
      const nextRound = generateRound(difficulty, newGameState.usedFamilies);
      setCurrentRound(nextRound);
      setShowFeedback(null);
      setSelectedOption(null);
      
      // Speak new target word
      setTimeout(() => speakWord(nextRound.targetWord.word), 300);
    }
    
    setIsProcessing(false);
  };
  
  const handlePlayAgain = () => {
    if (difficulty) {
      startGame(difficulty);
    }
  };
  
  const handleShowMenu = () => {
    setShowMenu(true);
    setGameState(null);
    setCurrentRound(null);
    setShowCelebration(false);
  };
  
  const handleSpeakTarget = () => {
    if (currentRound) {
      speakWord(currentRound.targetWord.word);
    }
  };
  
  // ===== RENDER HELPERS =====
  const accuracy = gameState ? calculateAccuracy(gameState) : 0;
  const progress = gameState
    ? { current: gameState.currentRound + 1, total: gameState.totalRounds }
    : { current: 0, total: 10 };
  
  // ===== RENDER =====
  return (
    <GameContainer title="Rhyme Time" onHome={handleShowMenu}>
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
        // ===== DIFFICULTY SELECTION MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Mascot state="happy" responsiveSize="lg" className="mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Rhyme Time!</h2>
          <p className="text-slate-600 mb-2 text-center max-w-md">
            Which word rhymes? Listen and choose!
          </p>
          <p className="text-slate-500 mb-6 text-sm text-center max-w-md">
            Rhyming helps you learn to read! 🔤
          </p>
          
          <div className="grid grid-cols-3 gap-4 max-w-2xl w-full">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
              const display = getDifficultyDisplay(diff);
              return (
                <button
                  key={diff}
                  onClick={() => startGame(diff)}
                  className="bg-white border-2 border-slate-200 hover:border-blue-400 rounded-xl p-6 transition-all transform hover:scale-105 text-center group shadow-sm"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {diff === 'easy' ? '🌱' : diff === 'medium' ? '🌿' : '🌳'}
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${display.color}`}>
                    {display.label}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    {diff === 'easy' && '3 simple rhymes'}
                    {diff === 'medium' && '6 rhyme families'}
                    {diff === 'hard' && '10 rhyme families'}
                  </p>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 bg-blue-50 rounded-xl p-4 max-w-md">
            <h3 className="font-bold text-blue-800 mb-2">Example:</h3>
            <p className="text-blue-700 text-sm mb-2">
              Which word rhymes with <span className="font-bold">CAT</span>?
            </p>
            <div className="flex gap-2 justify-center">
              <span className="bg-white px-3 py-1 rounded-lg text-sm">🐕 DOG</span>
              <span className="bg-green-100 px-3 py-1 rounded-lg text-sm font-bold">🦇 BAT ✓</span>
              <span className="bg-white px-3 py-1 rounded-lg text-sm">🚗 CAR</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-slate-500 text-sm">
            <span className="text-2xl">✋</span>
            <span>Point and pinch to select, or use your mouse!</span>
          </div>
        </div>
      ) : gameState?.completed ? (
        // ===== GAME COMPLETE SCREEN =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="text-6xl mb-4">
            {getStarRating(accuracy) >= 3 ? '🏆' : getStarRating(accuracy) >= 2 ? '⭐' : '👏'}
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {getPerformanceFeedback(accuracy).message}
          </h2>
          
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-4xl ${i < getStarRating(accuracy) ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ⭐
              </span>
            ))}
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-center">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-slate-500 text-sm">Final Score</p>
                <p className="text-3xl font-bold text-blue-600">{gameState.score}</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Accuracy</p>
                <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Best Streak</p>
                <p className="text-2xl font-bold text-orange-500">{gameState.maxStreak} 🔥</p>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Correct</p>
                <p className="text-2xl font-bold text-purple-600">
                  {gameState.correctAnswers}/{gameState.totalRounds}
                </p>
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
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
            >
              Play Again 🔄
            </button>
          </div>
        </div>
      ) : (
        // ===== GAME PLAY =====
        <div className="flex flex-col h-full p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-slate-500 mb-1">
              <span>Round {progress.current} of {progress.total}</span>
              <span>Score: {gameState?.score || 0}</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Streak indicator */}
          {gameState && gameState.streak > 1 && (
            <div className="text-center mb-2">
              <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                🔥 {gameState.streak} streak!
              </span>
            </div>
          )}
          
          {/* Question */}
          <div className="text-center mb-6">
            <p className="text-slate-600 mb-4">Which word rhymes with...</p>
            
            <button
              onClick={handleSpeakTarget}
              className="inline-flex items-center gap-3 bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl px-8 py-4 transition-all transform hover:scale-105 shadow-sm"
            >
              <span className="text-6xl">{currentRound?.targetWord.emoji}</span>
              <div className="text-left">
                <span className="text-4xl font-black text-slate-800 uppercase tracking-wider">
                  {currentRound?.targetWord.word}
                </span>
                <div className="text-blue-400 text-sm flex items-center gap-1">
                  <span>🔊 Click to hear</span>
                </div>
              </div>
            </button>
          </div>
          
          {/* Options */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
              {currentRound?.options.map((option) => {
                const isSelected = selectedOption === option.word.word;
                const isHovered = hoveredOption === option.word.word;
                const showCorrect = showFeedback === 'correct' && option.isCorrect;
                const showIncorrect = showFeedback === 'incorrect' && isSelected && !option.isCorrect;
                
                return (
                  <button
                    key={option.word.word}
                    ref={el => {
                      if (el) optionRefs.current.set(option.word.word, el);
                    }}
                    onClick={() => handleSelectOption(option.word.word)}
                    disabled={isProcessing}
                    className={`
                      relative p-6 rounded-2xl border-4 transition-all transform
                      ${showCorrect
                        ? 'bg-green-100 border-green-400 scale-105'
                        : showIncorrect
                        ? 'bg-red-100 border-red-400'
                        : isSelected
                        ? 'bg-blue-100 border-blue-400'
                        : isHovered
                        ? 'bg-blue-50 border-blue-300 scale-105 shadow-lg'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                      }
                      ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="text-5xl mb-2">{option.word.emoji}</div>
                    <div className="text-xl font-bold text-slate-800 uppercase">
                      {option.word.word}
                    </div>
                    
                    {/* Feedback indicators */}
                    {showCorrect && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold animate-bounce">
                        ✓
                      </div>
                    )}
                    {showIncorrect && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold">
                        ✗
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Feedback message */}
          {showFeedback && (
            <div className={`
              text-center py-3 px-6 rounded-xl font-bold text-lg animate-pulse
              ${showFeedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}>
              {showFeedback === 'correct' ? (
                <span>🎉 Correct! They rhyme!</span>
              ) : (
                <span>
                  ❌ Not quite! The answer was <span className="uppercase">{currentRound?.correctAnswer}</span>
                </span>
              )}
            </div>
          )}
          
          {/* Example sentence */}
          {currentRound && (
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm italic">
                💡 {getExampleSentence(currentRound.targetFamily)}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter="✓"
        accuracy={accuracy}
        onComplete={() => setShowCelebration(false)}
        message={`Game Complete! ${getStarRating(accuracy)} stars!`}
      />
    </GameContainer>
  );
}
