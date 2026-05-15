/**
 * Circuit Builder Game
 *
 * Virtual electronic circuit building for ages 6-12
 * @ticket S-002
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import {
  createInitialState,
  startChallenge,
  addComponent,
  connectComponents,
  removeComponent,
  toggleSwitch,
  checkCircuit,
  submitCircuit,
  resetChallenge,
  getComponentInfo,
  calculateFinalScore,
  CHALLENGES,
  type ComponentType,
  type GameState,
} from '../games/circuitBuilderLogic';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
// Celebration overlay removed - using inline celebration


const GRID_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

export const CircuitBuilderContent = memo(function CircuitBuilderComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('circuit-builder');
  const { playClick, playSuccess, playError } = useAudio();
  const { speak } = useTTS();

  const [state, setState] = useState<GameState>(createInitialState());
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
    gameName: 'CircuitBuilder',
    webcamRef,
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });
  const [selectedTool, setSelectedTool] = useState<ComponentType | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { resetAutoCompletion } = useAutoGameCompletion('circuit-builder', {
    when: state.status === 'success',
    score: calculateFinalScore(state).totalScore,
    level: CHALLENGES.findIndex((c) => c.id === state.currentChallengeId) + 1,
    metadata: {
      challengeId: state.currentChallengeId,
      attempts: state.attempts,
      timeElapsed: state.timeElapsed,
    },
  });

  // Timer
  useEffect(() => {
    if (state.status !== 'playing') return;
    const timer = setInterval(() => {
      setState((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.status]);

  // Clear feedback after delay
  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleStartChallenge = useCallback(
    (challengeId: string) => {
      playClick();
      resetAutoCompletion();
      setState(startChallenge(state, challengeId));
      setSelectedTool(null);
      setSelectedComponent(null);
      setIsConnecting(false);
      const challenge = CHALLENGES.find((c) => c.id === challengeId);
      if (challenge) {
        void speak(challenge.description);
      }
    },
    [state, playClick, speak, resetAutoCompletion],
  );

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (state.status !== 'playing' || !selectedTool || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
      const y = Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

      // Check if clicking on existing component
      const clickedComponent = state.components.find(
        (c) => Math.abs(c.x - x) < GRID_SIZE && Math.abs(c.y - y) < GRID_SIZE,
      );

      if (clickedComponent) {
        if (isConnecting && selectedComponent && selectedComponent !== clickedComponent.id) {
          // Complete connection
          setState((prev) => connectComponents(prev, selectedComponent, clickedComponent.id));
          setIsConnecting(false);
          setSelectedComponent(null);
          playClick();
        } else if (clickedComponent.type === 'switch') {
          // Toggle switch
          setState((prev) => toggleSwitch(prev, clickedComponent.id));
          playClick();
        } else {
          // Select for connection
          setSelectedComponent(clickedComponent.id);
          setIsConnecting(true);
        }
        return;
      }

      // Add new component
      if (!isConnecting) {
        setState((prev) => addComponent(prev, selectedTool, x, y));
        playClick();
      }
    },
    [state, selectedTool, isConnecting, selectedComponent, playClick],
  );

  const handleCheckCircuit = useCallback(() => {
    const result = checkCircuit(state);
    setFeedback(result.feedback);
    if (result.success) {
      playSuccess();
      void speak('Circuit complete! Great job!');
    } else {
      playError();
    }
  }, [state, playSuccess, playError, speak]);

  const handleSubmitCircuit = useCallback(() => {
    setState((prev) => {
      const newState = submitCircuit(prev);
      if (newState.status === 'success') {
        void speak('Challenge completed!');
      } else {
        setFeedback('Check your connections and try again!');
        playError();
      }
      return newState;
    });
  }, [playError, speak]);

  const handleReset = useCallback(() => {
    playClick();
    resetAutoCompletion();
    setState((prev) => resetChallenge(prev));
    setSelectedComponent(null);
    setIsConnecting(false);
    setFeedback(null);
  }, [playClick, resetAutoCompletion]);

  const handleRemoveComponent = useCallback(
    (componentId: string) => {
      setState((prev) => removeComponent(prev, componentId));
      if (selectedComponent === componentId) {
        setSelectedComponent(null);
        setIsConnecting(false);
      }
      playClick();
    },
    [selectedComponent, playClick],
  );

  // Loading state
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500'></div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return <AccessDenied gameName='Circuit Builder' gameId='circuit-builder' />;
  }

  // Menu state
  if (state.status === 'menu') {
    return (
      <GameContainer title='Circuit Builder' onHome={() => navigate('/games')}>
        <div className='max-w-4xl mx-auto p-6'>
          <div className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-amber-700 mb-4'>
              ⚡ Build Electronic Circuits! ⚡
            </h2>
            <p className='text-gray-600 text-lg'>
              Learn how electricity flows by building circuits with batteries, bulbs, switches, and more!
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {CHALLENGES.map((challenge) => (
              <motion.button
                key={challenge.id}
                onClick={() => handleStartChallenge(challenge.id)}
                className='p-6 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-amber-100 hover:border-amber-300 text-left transition-all'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className='text-xl font-bold text-amber-700 mb-2'>{challenge.name}</h3>
                <p className='text-gray-600 text-sm mb-3'>{challenge.description}</p>
                <div className='flex flex-wrap gap-2'>
                  {challenge.requiredComponents.map((type, idx) => {
                    const info = getComponentInfo(type);
                    return (
                      <span
                        key={`${type}-${idx}`}
                        className='px-2 py-1 bg-amber-100 rounded-full text-xs'
                        title={info.name}
                      >
                        {info.icon}
                      </span>
                    );
                  })}
                </div>
              </motion.button>
            ))}
          </div>

          <div className='mt-8 p-4 bg-blue-50 rounded-xl'>
            <h3 className='font-bold text-blue-700 mb-2'>💡 How to Play:</h3>
            <ul className='text-blue-600 text-sm space-y-1'>
              <li>1. Select a challenge from above</li>
              <li>2. Click on components in the toolbox to select them</li>
              <li>3. Click on the grid to place components</li>
              <li>4. Click on two components to connect them with wires</li>
              <li>5. Press &quot;Test Circuit&quot; to see if it works!</li>
            </ul>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Success state
  if (state.status === 'success') {
    const finalScore = calculateFinalScore(state);
    return (
      <GameContainer title='Circuit Builder' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='text-6xl mb-4'
          >
            ⚡
          </motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-4'>Challenge Complete!</h2>
          <p className='text-xl text-gray-700 mb-2'>Score: {finalScore.totalScore}</p>
          <p className='text-gray-600 mb-6'>
            Challenges completed: {finalScore.challengesCompleted}
          </p>
          <div className='flex gap-4'>
            <button
              onClick={() => { resetAutoCompletion(); setState(createInitialState()); }}
              className='px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors'
            >
              Back to Menu
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const currentChallenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);



  return (
    <GameContainer
      title={`Circuit Builder: ${currentChallenge?.name || ''}`}
      onHome={() => navigate('/games')}
      score={state.score}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div ref={gameAreaRef} className='flex flex-col lg:flex-row gap-4 p-4 relative'>
        {/* Toolbox */}
        <div className='lg:w-48 bg-white rounded-xl shadow-md p-4'>
          <h3 className='font-bold text-gray-700 mb-3'>Toolbox</h3>
          <div className='grid grid-cols-2 lg:grid-cols-1 gap-2'>
            {(['battery', 'bulb', 'switch', 'resistor', 'motor', 'buzzer', 'wire'] as ComponentType[]).map(
              (type) => {
                const info = getComponentInfo(type);
                const isSelected = selectedTool === type;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedTool(type);
                      setIsConnecting(false);
                      setSelectedComponent(null);
                      playClick();
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                    title={info.description}
                  >
                    <span className='text-2xl mr-2'>{info.icon}</span>
                    <span className='text-sm font-medium'>{info.name}</span>
                  </button>
                );
              },
            )}
          </div>

          {selectedTool && (
            <div className='mt-4 p-3 bg-amber-50 rounded-lg'>
              <p className='text-sm text-amber-800'>
                {getComponentInfo(selectedTool).description}
              </p>
            </div>
          )}

          {isConnecting && selectedComponent && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
              <p className='text-sm text-blue-800'>
                Click another component to connect, or click the same one to cancel.
              </p>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className='flex-1'>
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className='relative bg-gray-900 rounded-xl overflow-hidden cursor-crosshair'
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: '100%' }}
          >
            {/* Grid */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none'>
              <defs>
                <pattern id='grid' width={GRID_SIZE} height={GRID_SIZE} patternUnits='userSpaceOnUse'>
                  <path
                    d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                    fill='none'
                    stroke='#374151'
                    strokeWidth='1'
                  />
                </pattern>
              </defs>
              <rect width='100%' height='100%' fill='url(#grid)' />
            </svg>

            {/* Connections */}
            <svg className='absolute inset-0 w-full h-full pointer-events-none'>
              {state.components.map((comp) =>
                comp.connections.map((connId) => {
                  const target = state.components.find((c) => c.id === connId);
                  if (!target || comp.id > connId) return null; // Draw once
                  return (
                    <line
                      key={`${comp.id}-${connId}`}
                      x1={comp.x + 20}
                      y1={comp.y + 20}
                      x2={target.x + 20}
                      y2={target.y + 20}
                      stroke='#F59E0B'
                      strokeWidth='3'
                    />
                  );
                }),
              )}
            </svg>

            {/* Components */}
            {state.components.map((comp) => {
              const info = getComponentInfo(comp.type);
              const isSelected = selectedComponent === comp.id;
              return (
                <motion.div
                  key={comp.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute w-10 h-10 flex items-center justify-center rounded-lg shadow-lg cursor-pointer ${
                    isSelected ? 'ring-4 ring-blue-400' : ''
                  }`}
                  style={{
                    left: comp.x,
                    top: comp.y,
                    backgroundColor: info.color,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConnecting && selectedComponent && selectedComponent !== comp.id) {
                      setState((prev) => connectComponents(prev, selectedComponent, comp.id));
                      setIsConnecting(false);
                      setSelectedComponent(null);
                      playClick();
                    } else if (comp.type === 'switch') {
                      setState((prev) => toggleSwitch(prev, comp.id));
                      playClick();
                    } else {
                      setSelectedComponent(comp.id);
                      setIsConnecting(true);
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleRemoveComponent(comp.id);
                  }}
                  title={`${info.name}${comp.type === 'switch' ? ` (${comp.state})` : ''}`}
                >
                  <span className='text-xl'>{info.icon}</span>
                  {comp.type === 'switch' && (
                    <span
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        comp.state === 'closed' ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Hint text */}
            {state.components.length === 0 && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <p className='text-gray-500 text-lg'>
                  Select a component from the toolbox and click here to place it
                </p>
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl text-center font-bold ${
                feedback.includes('complete')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {feedback}
            </motion.div>
          )}

          {/* Control buttons */}
          <div className='mt-4 flex gap-2'>
            <button
              onClick={handleReset}
              className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
            >
              Reset
            </button>
            <button
              onClick={handleCheckCircuit}
              className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors'
            >
              Test Circuit
            </button>
            <button
              onClick={handleSubmitCircuit}
              className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors'
            >
              Submit
            </button>
          </div>

          {/* Challenge info */}
          {currentChallenge && (
            <div className='mt-4 p-4 bg-white rounded-xl shadow-md'>
              <h4 className='font-bold text-gray-700'>{currentChallenge.name}</h4>
              <p className='text-gray-600 text-sm'>{currentChallenge.description}</p>
              <p className='text-amber-600 text-sm mt-2'>💡 {currentChallenge.hint}</p>
              <div className='mt-2 text-sm text-gray-500'>
                Attempts: {state.attempts} | Time: {Math.floor(state.timeElapsed / 60)}:
                {(state.timeElapsed % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
        {cursor && (
          <GameCursor position={cursor} coordinateSpace="normalized" containerRef={gameAreaRef} isPinching={false} isHandDetected={isHandTrackingReady} size={64} color="#ef4444" />
        )}
      </div>
    </GameContainer>
  );
});

export const CircuitBuilder = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='circuit-builder' gameName='Circuit Builder'>
      <CircuitBuilderContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default CircuitBuilder;
