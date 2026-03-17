/**
 * Bridge Builder Game
 * Build bridges to help characters cross
 */
import { memo, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameCursor } from '../components/game/GameCursor';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { createInitialState, startChallenge, addSegment, checkBridge, clearBridge, CHALLENGES, SEGMENT_TYPES } from '../games/bridgeBuilderLogic';
import { useAudio } from '../utils/hooks/useAudio';

export const BridgeBuilderContent = memo(function BridgeBuilderComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('bridge-builder');
  const { playClick, playSuccess, playError } = useAudio();
  const [state, setState] = useState(createInitialState());
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);

  const isPlaying = state.status === 'playing';
  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);
  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);
  const { isReady: isHandTrackingReady } = useGameHandTracking({
    gameName: 'BridgeBuilder',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });
  const [selectedType, setSelectedType] = useState<'plank' | 'rope' | 'support' | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ valid: boolean; feedback: string } | null>(null);
  const currentChallenge = CHALLENGES.find(c => c.id === state.currentChallengeId) || CHALLENGES[0];
  const { resetAutoCompletion } = useAutoGameCompletion('bridge-builder', {
    when: state.status === 'success',
    score: state.score,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      segmentsUsed: state.segments.length,
    },
  });

  const handleTypeSelect = useCallback((type: 'plank' | 'rope' | 'support') => {
    playClick();
    setSelectedType(type);
  }, [playClick]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedType || state.status !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / 40);
    const y = Math.round((e.clientY - rect.top) / 40);
    setState((prev) => addSegment(prev, x, y, selectedType));
  }, [selectedType, state.status]);

  const handleTest = useCallback(() => {
    const result = checkBridge(state);
    setSimulationResult(result);
    if (result.valid) {
      playSuccess();
      setState((prev) => ({ ...prev, status: 'success' }));
    } else {
      playError();
    }
  }, [state, playSuccess, playError]);

  const handleNextChallenge = useCallback(() => {
    playSuccess();
    resetAutoCompletion();
    const nextIndex = CHALLENGES.findIndex(c => c.id === state.currentChallengeId) + 1;
    if (nextIndex < CHALLENGES.length) {
      setState(startChallenge(createInitialState(), CHALLENGES[nextIndex].id));
    } else {
      setState(createInitialState());
    }
    setSimulationResult(null);
  }, [state.currentChallengeId, playSuccess, resetAutoCompletion]);

  if (subLoading) return <div className='flex items-center justify-center min-h-screen'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500'></div></div>;
  if (!hasAccess) return <AccessDenied gameName='Bridge Builder' gameId='bridge-builder' />;

  if (state.status === 'menu') {
    return (
      <GameContainer title='Bridge Builder' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <h2 className='text-3xl font-bold text-amber-700 mb-4'>🌉 Bridge Builder</h2>
          <p className='text-gray-600 mb-6'>Build bridges to help characters cross safely!</p>
          <button onClick={() => { resetAutoCompletion(); setState(startChallenge(createInitialState(), CHALLENGES[0].id)); }} className='px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600'>Start Building</button>
        </div>
      </GameContainer>
    );
  }

  if (state.status === 'success') {
    return (
      <GameContainer title='Bridge Builder' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh]'>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='text-6xl mb-4'>🎉</motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-2'>Bridge Complete!</h2>
          <p className='text-xl'>Score: {state.score}</p>
          <div className='flex gap-4 mt-4'>
            {CHALLENGES.findIndex(c => c.id === state.currentChallengeId) < CHALLENGES.length - 1 && (
              <button onClick={handleNextChallenge} className='px-6 py-3 bg-green-500 text-white rounded-xl'>Next Challenge</button>
            )}
            <button onClick={() => { resetAutoCompletion(); setState(createInitialState()); }} className='px-6 py-3 bg-amber-500 text-white rounded-xl'>Menu</button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const challengeIndex = CHALLENGES.findIndex(c => c.id === state.currentChallengeId);

  return (
    <GameContainer title='Bridge Builder' onHome={() => navigate('/games')} score={state.score} webcamRef={webcamRef} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
      <div ref={gameAreaRef} className='p-4 relative'>
        <div className='flex justify-between items-center mb-4'>
          <div className='text-sm'>Challenge {challengeIndex + 1}: {currentChallenge.name}</div>
          <div className='text-sm'>Segments: {state.segments.length}/{currentChallenge.maxSegments}</div>
        </div>
        
        {/* Canvas */}
        <div className='relative bg-sky-100 rounded-xl overflow-hidden mb-4 mx-auto' style={{ width: 600, height: 300 }} onClick={handleCanvasClick}>
          {/* Left bank */}
          <div className='absolute bg-green-600' style={{ left: 0, bottom: 50, width: 100, height: 100 }}></div>
          {/* Right bank */}
          <div className='absolute bg-green-600' style={{ right: 0, bottom: 50, width: 100, height: 100 }}></div>
          {/* Water */}
          <div className='absolute bg-blue-400' style={{ left: 100, bottom: 0, width: 400, height: 150 }}></div>
          
          {/* Segments */}
          {state.segments.map((seg) => (
            <div key={seg.id} className='absolute text-xl flex items-center justify-center' style={{
              left: seg.x * 40 - 20,
              top: seg.y * 40 - 20,
              width: 40, height: 40
            }}>
              {SEGMENT_TYPES[seg.type].emoji}
            </div>
          ))}
        </div>
        
        {/* Tools */}
        <div className='flex gap-2 justify-center mb-4'>
          {(['plank', 'rope', 'support'] as const).map((type) => (
            <button key={type} onClick={() => handleTypeSelect(type)} className={`px-4 py-2 rounded-lg capitalize ${selectedType === type ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}>
              {SEGMENT_TYPES[type].emoji} {type}
            </button>
          ))}
          <button onClick={() => setState((prev) => clearBridge(prev))} className='px-4 py-2 bg-red-400 text-white rounded-lg'>Clear</button>
        </div>
        
        {/* Actions */}
        <div className='flex justify-center gap-4'>
          <button onClick={handleTest} className='px-6 py-3 bg-green-500 text-white rounded-xl font-bold'>Test Bridge</button>
        </div>
        
        {simulationResult && (
          <div className={`mt-4 p-3 rounded-lg text-center ${simulationResult.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {simulationResult.feedback}
          </div>
        )}
        {cursor && (
          <GameCursor position={cursor} coordinateSpace="normalized" containerRef={gameAreaRef} isPinching={false} isHandDetected={isHandTrackingReady} size={64} color="#ef4444" />
        )}
      </div>
    </GameContainer>
  );
});

export const BridgeBuilder = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='bridge-builder' gameName='Bridge Builder'>
      <BridgeBuilderContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default BridgeBuilder;
