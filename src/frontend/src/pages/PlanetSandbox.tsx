/**
 * Planet Sandbox Game
 *
 * Build and explore planetary systems
 * @ticket PLANET-SANDBOX
 */

import { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import {
  createInitialState, startChallenge, addPlanet, removePlanet, clearPlanets,
  checkChallenge, submitChallenge, getPlanetEmoji, PLANET_TEMPLATES, CHALLENGES, type GameState,
} from '../games/planetSandboxLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';

export const PlanetSandboxContent = memo(function PlanetSandboxComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('planet-sandbox');
  const { playClick, playSuccess, playError } = useAudio();
  const { speak } = useTTS();

  const [state, setState] = useState<GameState>(createInitialState());
  const [feedback, setFeedback] = useState<string | null>(null);
  const { resetAutoCompletion } = useAutoGameCompletion('planet-sandbox', {
    when: state.status === 'success',
    score: state.score,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      planetsPlaced: state.planets.length,
    },
  });

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleStartChallenge = useCallback((challengeId: string) => {
    playClick();
    resetAutoCompletion();
    setState(startChallenge(createInitialState(), challengeId));
    setFeedback(null);
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (challenge) void speak(challenge.description);
  }, [playClick, speak, resetAutoCompletion]);

  const handleAddPlanet = useCallback((templateIndex: number) => {
    const distance = 0.5 + state.planets.length * 1.2;
    setState((prev) => addPlanet(prev, templateIndex, distance));
    playClick();
  }, [state.planets.length, playClick]);

  const handleCheck = useCallback(() => {
    const result = checkChallenge(state);
    setFeedback(result.feedback);
    if (result.success) {
      playSuccess();
    } else {
      playError();
    }
  }, [state, playSuccess, playError]);

  const handleSubmit = useCallback(() => {
    setState((prev) => {
      const newState = submitChallenge(prev);
      if (newState.status === 'success') {
        void speak('Solar system complete! Amazing!');
      }
      return newState;
    });
  }, [speak]);

  if (subLoading) return <div className='flex items-center justify-center min-h-screen'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div></div>;
  if (!hasAccess) return <AccessDenied gameName='Planet Sandbox' gameId='planet-sandbox' />;

  if (state.status === 'menu') {
    return (
      <GameContainer title='Planet Sandbox' onHome={() => navigate('/games')}>
        <div className='max-w-4xl mx-auto p-6'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-purple-700 mb-4'>🪐 Planet Sandbox</h2>
            <p className='text-gray-600 text-lg'>Build your own solar system! Place planets and learn about space.</p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {CHALLENGES.map((c) => (
              <motion.button key={c.id} onClick={() => handleStartChallenge(c.id)} className='p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-purple-100 hover:border-purple-300 text-left' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <h3 className='text-xl font-bold text-purple-700 mb-2'>{c.name}</h3>
                <p className='text-gray-600 text-sm'>{c.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </GameContainer>
    );
  }

  if (state.status === 'success') {
    return (
      <GameContainer title='Planet Sandbox' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='text-6xl mb-4'>🌌</motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-4'>System Complete!</h2>
          <p className='text-xl text-gray-700 mb-2'>Score: {state.score}</p>
          <button onClick={() => { resetAutoCompletion(); setState(createInitialState()); }} className='px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors'>Back to Menu</button>
        </div>
      </GameContainer>
    );
  }

  const currentChallenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);

  return (
    <GameContainer title={`Planet Sandbox: ${currentChallenge?.name || ''}`} onHome={() => navigate('/games')} score={state.score}>
      <div className='flex flex-col lg:flex-row gap-4 p-4'>
        <div className='lg:w-72 bg-white rounded-xl shadow-md p-4'>
          <h3 className='font-bold text-purple-700 mb-4'>Planet Templates</h3>
          <div className='space-y-2 max-h-[400px] overflow-y-auto'>
            {PLANET_TEMPLATES.map((template, idx) => (
              <button key={template.name} onClick={() => handleAddPlanet(idx)} className='w-full p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 text-left flex items-center gap-3 transition-all'>
                <span className='text-2xl'>{getPlanetEmoji(template.type)}</span>
                <div>
                  <p className='font-medium text-sm'>{template.name}</p>
                  <p className='text-xs text-gray-500'>{template.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className='mt-4 space-y-2'>
            <button onClick={() => { resetAutoCompletion(); setState(clearPlanets(state)); playClick(); }} className='w-full px-3 py-2 bg-gray-200 rounded-lg text-sm'>Clear All</button>
            <button onClick={handleCheck} className='w-full px-3 py-2 bg-purple-500 text-white rounded-lg text-sm'>Check System</button>
            <button onClick={handleSubmit} className='w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm'>Submit</button>
          </div>
        </div>

        <div className='flex-1'>
          <div className='relative bg-black rounded-xl overflow-hidden min-h-[500px]'>
            {/* Sun */}
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-400 rounded-full shadow-[0_0_40px_rgba(255,200,0,0.8)] z-10'></div>
            
            {/* Orbit rings */}
            {state.planets.map((_, idx) => (
              <div key={`orbit-${idx}`} className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-gray-700 rounded-full opacity-30' style={{ width: `${(idx + 1) * 80}px`, height: `${(idx + 1) * 80}px` }}></div>
            ))}

            {/* Planets */}
            {state.planets.map((planet, idx) => (
              <motion.div key={planet.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className='absolute top-1/2 left-1/2' style={{ transform: `translate(-50%, -50%) rotate(${(idx * 45) % 360}deg) translateX(${(idx + 1) * 40}px)` }}>
                <div className='relative group'>
                  <div className='rounded-full shadow-lg' style={{ width: `${planet.size * 6}px`, height: `${planet.size * 6}px`, backgroundColor: planet.color }}></div>
                  <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
                    {planet.name}
                  </div>
                  <button onClick={() => { setState((prev) => removePlanet(prev, planet.id)); playClick(); }} className='absolute -top-2 -right-2 text-red-400 opacity-0 group-hover:opacity-100'>×</button>
                </div>
              </motion.div>
            ))}

            {state.planets.length === 0 && (
              <div className='absolute inset-0 flex items-center justify-center text-white/50'>Select a planet template to start building!</div>
            )}
          </div>

          {feedback && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-xl text-center ${feedback.includes('Complete') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {feedback}
            </motion.div>
          )}

          {state.planets.length > 0 && (
            <div className='mt-4 p-4 bg-white rounded-xl shadow-md'>
              <h4 className='font-bold text-gray-700 mb-2'>Your Solar System ({state.planets.length} planets)</h4>
              <div className='flex flex-wrap gap-2'>
                {state.planets.map((p) => (
                  <span key={p.id} className='px-3 py-1 rounded-full text-xs bg-gray-100'>
                    {getPlanetEmoji(p.type)} {p.name} @ {p.distance.toFixed(1)} AU
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
});

export const PlanetSandbox = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='planet-sandbox' gameName='Planet Sandbox'>
      <PlanetSandboxContent />
    </GameShell>
  </GlobalErrorBoundary>
);
export default PlanetSandbox;
