/**
 * Language Puppet Game
 *
 * Control a puppet with your hand! Make it talk, wave, and dance.
 * @ticket LANGUAGE-PUPPET
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import {
  CHALLENGES,
  EXPRESSIONS,
  GESTURES,
  createInitialState,
  startChallenge,
  updateHandState,
  tick,
  calculateStars,
  getExpressionFromHand,
  type PuppetGesture,
  type GameState,
} from '../games/languagePuppetLogic';

const TIMER_INTERVAL = 1000;

function LanguagePuppetContent() {
  const navigate = useNavigate();
  const { playClick } = useAudio();
  const { speak } = useTTS();
  const [state, setState] = useState<GameState>(createInitialState());
  const [handPosition, setHandPosition] = useState({ x: 0.5, y: 0.5 });
  const [isHandDetected, setIsHandDetected] = useState(false);
  const { resetAutoCompletion } = useAutoGameCompletion('language-puppet', {
    when: state.status === 'success',
    score: state.score,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      streak: state.streak,
    },
  });

  const currentChallenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  const currentExpressionData = EXPRESSIONS.find(e => e.id === state.currentExpression);
  const currentGestureData = GESTURES.find(g => g.id === state.currentGesture);

  useEffect(() => {
    if (state.status !== 'playing') return;

    const interval = setInterval(() => {
      setState((prev) => tick(prev));
    }, TIMER_INTERVAL);

    return () => clearInterval(interval);
  }, [state.status]);

  // Simulate hand tracking with mouse/touch for demo
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (state.status !== 'playing') return;
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setHandPosition({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
      setIsHandDetected(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (state.status !== 'playing') return;
      const touch = e.touches[0];
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;
      setHandPosition({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
      setIsHandDetected(true);
    };

    const gameArea = document.getElementById('puppet-game-area');
    if (gameArea) {
      gameArea.addEventListener('mousemove', handleMouseMove);
      gameArea.addEventListener('touchmove', handleTouchMove);
    }

    return () => {
      if (gameArea) {
        gameArea.removeEventListener('mousemove', handleMouseMove);
        gameArea.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [state.status]);

  // Update game state based on hand position
  useEffect(() => {
    if (state.status !== 'playing' || !isHandDetected) return;

    const expression = getExpressionFromHand(handPosition.x, handPosition.y);
    // Simulate gesture based on time (in real app, this would come from MediaPipe)
    const gesture: PuppetGesture = 'open';
    
    setState((prev) => updateHandState(prev, expression, gesture));
  }, [handPosition, isHandDetected, state.status]);

  const handleStartChallenge = useCallback((challengeId: string) => {
    playClick();
    resetAutoCompletion();
    setState(startChallenge(createInitialState(), challengeId));
    setIsHandDetected(false);
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (challenge) void speak(challenge.description);
  }, [playClick, speak, resetAutoCompletion]);

  const handleBackToMenu = useCallback(() => {
    playClick();
    resetAutoCompletion();
    setState(createInitialState());
  }, [playClick, resetAutoCompletion]);

  const getPuppetEmoji = () => {
    if (state.status === 'success') return '🎉';
    if (state.status === 'failure') return '😴';
    return currentExpressionData?.emoji || '😐';
  };

  return (
    <GameShell gameId='language-puppet' gameName='Language Puppet'>
      <GameContainer onHome={() => navigate('/games')}>
        <AnimatePresence mode='wait'>
          {state.status === 'menu' && (
            <motion.div
              key='menu'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='flex flex-col items-center justify-center min-h-[60vh] gap-8'
            >
              <div className='text-center'>
                <h1 className='text-4xl font-bold text-white mb-4'>Language Puppet</h1>
                <p className='text-xl text-pink-200 mb-8'>Control the puppet with your hand!</p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {CHALLENGES.map((challenge) => (
                  <motion.button
                    key={challenge.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartChallenge(challenge.id)}
                    className='bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white p-6 rounded-2xl shadow-lg border-2 border-white/20 min-w-[200px]'
                  >
                    <div className='text-2xl font-bold mb-2'>{challenge.name}</div>
                    <div className='text-sm opacity-80 mb-2'>{challenge.description}</div>
                    <div className='text-xs opacity-60'>⏱️ {challenge.timeLimit}s</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {state.status === 'playing' && currentChallenge && (
            <motion.div
              key='playing'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex flex-col items-center gap-4 w-full'
            >
              <div className='flex justify-between items-center w-full max-w-2xl bg-white/10 rounded-xl p-4'>
                <div className='text-white'>
                  <span className='font-bold'>Score:</span> {state.score}
                </div>
                <div className={`text-2xl font-bold ${state.timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {Math.floor(state.timeLeft / 60)}:{(state.timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className='text-white'>
                  <span className='font-bold'>Streak:</span> {state.streak} 🔥
                </div>
              </div>

              <div className='w-full max-w-2xl bg-white/5 rounded-xl p-4 text-center'>
                <p className='text-white/80 mb-2'>{currentChallenge.hint}</p>
              </div>

              <div 
                id='puppet-game-area'
                className='relative w-full max-w-lg aspect-square bg-gradient-to-b from-sky-300 to-sky-100 rounded-3xl overflow-hidden cursor-crosshair'
              >
                {/* Hand indicator */}
                <motion.div
                  className='absolute w-16 h-16 bg-pink-500/50 rounded-full border-4 border-pink-600 flex items-center justify-center'
                  animate={{
                    left: `${handPosition.x * 100}%`,
                    top: `${handPosition.y * 100}%`,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <span className='text-2xl'>✋</span>
                </motion.div>

                {/* Puppet */}
                <motion.div
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl'
                  animate={{
                    scale: isHandDetected ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {getPuppetEmoji()}
                </motion.div>

                {/* Instructions */}
                <div className='absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm'>
                  Move your mouse/finger to control the puppet!
                </div>
              </div>

              {/* Current status */}
              <div className='flex gap-8 text-center'>
                <div className='bg-white/10 rounded-xl p-4 min-w-[120px]'>
                  <div className='text-3xl mb-1'>{currentExpressionData?.emoji}</div>
                  <div className='text-white text-sm'>Expression</div>
                </div>
                <div className='bg-white/10 rounded-xl p-4 min-w-[120px]'>
                  <div className='text-3xl mb-1'>{currentGestureData?.emoji}</div>
                  <div className='text-white text-sm'>Gesture</div>
                </div>
              </div>

              {/* Targets */}
              <div className='w-full max-w-lg'>
                <h3 className='text-white font-bold mb-2 text-center'>Targets:</h3>
                <div className='flex justify-center gap-2 flex-wrap'>
                  {currentChallenge.targetExpressions.map(exp => (
                    <span 
                      key={exp}
                      className={`px-3 py-1 rounded-full text-sm ${
                        state.completedExpressions.includes(exp) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {EXPRESSIONS.find(e => e.id === exp)?.emoji} {exp}
                    </span>
                  ))}
                  {currentChallenge.targetGestures.map(gest => (
                    <span 
                      key={gest}
                      className={`px-3 py-1 rounded-full text-sm ${
                        state.completedGestures.includes(gest) 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {GESTURES.find(g => g.id === gest)?.emoji} {gest}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(state.status === 'success' || state.status === 'failure') && (
            <motion.div
              key='result'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className='flex flex-col items-center gap-6 text-center'
            >
              <div className='text-8xl'>
                {state.status === 'success' ? '🎭' : '😴'}
              </div>
              <h2 className='text-4xl font-bold text-white'>
                {state.status === 'success' ? 'Puppet Master!' : 'Time Up!'}
              </h2>
              
              <div className='bg-white/10 rounded-2xl p-6 max-w-md'>
                <div className='text-6xl mb-4'>
                  {'⭐'.repeat(calculateStars(state.score))}
                </div>
                <div className='text-2xl text-white mb-2'>Score: {state.score}</div>
              </div>

              <div className='flex gap-4'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToMenu}
                  className='bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-bold'
                >
                  Back to Menu
                </motion.button>
                {currentChallenge && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartChallenge(currentChallenge.id)}
                    className='bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 rounded-xl font-bold'
                  >
                    Play Again
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GameContainer>
    </GameShell>
  );
}

export const LanguagePuppet = memo(function LanguagePuppet() {
  return (
    <LanguagePuppetContent />
  );
});
