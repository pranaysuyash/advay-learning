/**
 * Cutting Practice Game
 *
 * Fine motor skills game where children trace along dotted lines
 * with hand tracking to "cut" through various materials.
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameCursor } from '../components/game/GameCursor';
import { GameShell } from '../components/GameShell';
import { AssetPreloader } from '../components/AssetPreloader';
import { GameBackground } from '../components/game/GameBackground';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { triggerHaptic } from '../utils/haptics';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import {
  LEVELS,
  generateCutLines,
  isNearCutLine,
  calculateCutProgress,
  calculateCutQuality,
  getCutQualityPoints,
  areAllLinesCompleted,
  getMaterialEmoji,
  getMaterialColor,
  type CutLine,
  type Point,
} from '../games/cuttingPracticeLogic';
import { CameraThumbnail } from '../components/game/CameraThumbnail';

// Canvas dimensions
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface CuttingSession {
  lineId: number;
  points: { point: Point; distance: number }[];
  isActive: boolean;
}

const CRITICAL_ASSETS: import('../components/AssetPreloader').AssetToPreload[] = [
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart.png', priority: 'critical' },
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart_empty.png', priority: 'critical' },
];

const CuttingPracticeGame = memo(function CuttingPracticeGameComponent() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [lines, setLines] = useState<CutLine[]>([]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [score, setScore] = useState(0);
  const [session, setSession] = useState<CuttingSession | null>(null);
  const [cutLines, setCutLines] = useState<Set<number>>(new Set());
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Streak tracking
  const {
    streak,
    maxStreak,
    showMilestone,
    incrementStreak,
    resetStreak,
  } = useStreakTracking();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('cutting-practice');

  // Hand tracking
  const {
    isReady,
    cursor: handCursor,
    isPinching: handPinching,
    startTracking,
    stopTracking,
    webcamRef,
  } = useGameHandTracking({
    gameName: 'CuttingPractice',
  });

  // Progress tracking
  useGameSessionProgress({
    gameName: 'Cutting Practice',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { completedLines: cutLines.size, totalLines: lines.length },
  });

  const levelConfig = LEVELS[currentLevel - 1];

  // Start game
  const startGame = useCallback(() => {
    const newLines = generateCutLines(currentLevel, CANVAS_WIDTH, CANVAS_HEIGHT);
    setLines(newLines);
    setCutLines(new Set());
    setScore(0);
    setSession(null);
    resetStreak();
    setGameState('playing');
    setShowHelp(true);
    
    // Hide help after 3 seconds
    setTimeout(() => setShowHelp(false), 3000);
    
    // Start hand tracking
    void startTracking();
  }, [currentLevel, resetStreak, startTracking]);

  // Handle mouse/touch input (fallback)
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    setIsPinching(true);
    setCursorPos({ x, y });
    
    // Check if near any uncut line
    for (const line of lines) {
      if (line.completed) continue;
      
      const { isNear } = isNearCutLine(x, y, line, levelConfig.tolerance);
      if (isNear) {
        setSession({
          lineId: line.id,
          points: [{ point: { x, y }, distance: 0 }],
          isActive: true,
        });
        break;
      }
    }
  }, [gameState, lines, levelConfig.tolerance]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    setCursorPos({ x, y });
    
    if (!isPinching || !session?.isActive) return;
    
    const line = lines.find(l => l.id === session.lineId);
    if (!line) return;
    
    const { isNear, minDistance } = isNearCutLine(x, y, line, levelConfig.tolerance);
    
    if (isNear) {
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, { point: { x, y }, distance: minDistance }],
        };
      });
      
      // Check if line is complete (reached end)
      const progress = calculateCutProgress({ x, y }, line, session.points[0].point);
      if (progress >= 95) {
        completeLine(session.lineId, session.points);
      }
    } else {
      // Went off line - reset
      setSession(null);
      resetStreak();
      playError();
      triggerHaptic('error');
    }
  }, [gameState, isPinching, session, lines, levelConfig.tolerance, resetStreak, playError]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPinching(false);
    if (session?.isActive) {
      // Check if we made enough progress to count
      const line = lines.find(l => l.id === session.lineId);
      if (line && session.points.length > 5) {
        const progress = calculateCutProgress(
          session.points[session.points.length - 1].point,
          line,
          session.points[0].point
        );
        if (progress >= 80) {
          completeLine(session.lineId, session.points);
        }
      }
      setSession(null);
    }
  }, [session, lines]);

  // Complete a line cut
  const completeLine = useCallback((lineId: number, points: { point: Point; distance: number }[]) => {
    const avgDistance = points.reduce((sum, p) => sum + p.distance, 0) / points.length;
    const quality = calculateCutQuality(avgDistance, levelConfig.tolerance);
    const pointsEarned = getCutQualityPoints(quality);
    
    setLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          completed: true,
          progress: 100,
          cutQuality: avgDistance,
        };
      }
      return line;
    }));
    
    setCutLines(prev => new Set([...prev, lineId]));
    
    if (quality === 'perfect') {
      incrementStreak();
      triggerHaptic('celebration');
    } else {
      resetStreak();
    }
    
    setScore(prev => prev + pointsEarned + Math.min(streak * 5, 25));
    playSuccess();
    triggerHaptic('success');
  }, [levelConfig.tolerance, incrementStreak, resetStreak, streak, playSuccess]);

  // Handle hand tracking input
  useEffect(() => {
    if (gameState !== 'playing' || !handCursor) return;
    
    const x = handCursor.x * CANVAS_WIDTH;
    const y = handCursor.y * CANVAS_HEIGHT;
    
    setCursorPos({ x, y });
    setIsPinching(handPinching);
    
    if (handPinching && !session?.isActive) {
      // Try to start a new cut
      for (const line of lines) {
        if (line.completed) continue;
        
        const { isNear } = isNearCutLine(x, y, line, levelConfig.tolerance);
        if (isNear) {
          setSession({
            lineId: line.id,
            points: [{ point: { x, y }, distance: 0 }],
            isActive: true,
          });
          break;
        }
      }
    } else if (handPinching && session?.isActive) {
      // Continue cutting
      const line = lines.find(l => l.id === session.lineId);
      if (!line) return;
      
      const { isNear, minDistance } = isNearCutLine(x, y, line, levelConfig.tolerance);
      
      if (isNear) {
        setSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            points: [...prev.points, { point: { x, y }, distance: minDistance }],
          };
        });
        
        const progress = calculateCutProgress({ x, y }, line, session.points[0].point);
        if (progress >= 95) {
          completeLine(session.lineId, session.points);
        }
      } else {
        setSession(null);
        resetStreak();
        playError();
        triggerHaptic('error');
      }
    } else if (!handPinching && session?.isActive) {
      // Released pinch - check if line is complete enough
      const line = lines.find(l => l.id === session.lineId);
      if (line && session.points.length > 5) {
        const progress = calculateCutProgress(
          session.points[session.points.length - 1].point,
          line,
          session.points[0].point
        );
        if (progress >= 80) {
          completeLine(session.lineId, session.points);
        }
      }
      setSession(null);
    }
  }, [gameState, handCursor, handPinching, session, lines, levelConfig.tolerance, completeLine, resetStreak, playError]);

  // Check for game completion
  useEffect(() => {
    if (gameState === 'playing' && lines.length > 0 && areAllLinesCompleted(lines)) {
      setGameState('complete');
      playCelebration();
      triggerHaptic('celebration');
      stopTracking();
    }
  }, [gameState, lines, playCelebration, stopTracking]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = getMaterialColor(levelConfig.material);
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw lines
    lines.forEach(line => {
      if (line.points.length < 2) return;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (line.completed) {
        // Draw completed cut as solid line with gap
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y);
        }
        ctx.stroke();
        
        // Draw "cut" gap in middle
        ctx.strokeStyle = getMaterialColor(levelConfig.material);
        ctx.lineWidth = 6;
        const midIndex = Math.floor(line.points.length / 2);
        if (midIndex > 0 && midIndex < line.points.length) {
          ctx.beginPath();
          ctx.moveTo(line.points[midIndex - 1].x, line.points[midIndex - 1].y);
          ctx.lineTo(line.points[midIndex].x, line.points[midIndex].y);
          ctx.stroke();
        }
      } else {
        // Draw dotted line to cut
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y);
        }
        ctx.stroke();
        
        // Draw start indicator
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(line.points[0].x, line.points[0].y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw end indicator
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(line.points[line.points.length - 1].x, line.points[line.points.length - 1].y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw current cut progress
    if (session?.isActive && session.points.length > 1) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      ctx.moveTo(session.points[0].point.x, session.points[0].point.y);
      for (let i = 1; i < session.points.length; i++) {
        ctx.lineTo(session.points[i].point.x, session.points[i].point.y);
      }
      ctx.stroke();
    }
    
    // Draw cursor/scissors
    if (cursorPos && gameState === 'playing') {
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPinching ? '✂️' : '🖐️', cursorPos.x, cursorPos.y);
      
      // Draw tolerance circle when near line
      const nearLine = lines.some(line => {
        if (line.completed) return false;
        const { isNear } = isNearCutLine(cursorPos.x, cursorPos.y, line, levelConfig.tolerance);
        return isNear;
      });
      
      if (nearLine) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(cursorPos.x, cursorPos.y, levelConfig.tolerance, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [lines, session, cursorPos, isPinching, gameState, levelConfig]);

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    playClick();
    startGame();
  }, [playClick, startGame]);

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score, completed: true, level: currentLevel });
    navigate('/games');
  }, [playClick, completeGame, score, navigate, currentLevel]);

  const handlePlayAgain = useCallback(() => {
    playClick();
    setGameState('start');
  }, [playClick]);

  if (!assetsLoaded) {
    return (
      <AssetPreloader
        assets={CRITICAL_ASSETS}
        onComplete={() => setAssetsLoaded(true)}
        minDisplayTime={800}
      />
    );
  }

  return (
    <GameContainer
      title="Cutting Practice"
      score={score}
      level={currentLevel}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isReady}
    >
      <div ref={gameAreaRef} className="relative flex flex-col items-center gap-4 p-4 h-full overflow-auto">
        <GameBackground type="solid_grass" className="absolute inset-0 -z-10" />
        {/* Level Selection */}
        {gameState === 'start' && (
          <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">✂️</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Cutting Practice!
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Trace along the dotted lines to cut through the material!
              </p>
            </div>

            {/* Material/Level selection */}
            <div className="flex gap-3 flex-wrap justify-center">
              {LEVELS.map((level) => (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => {
                    playClick();
                    setCurrentLevel(level.level);
                  }}
                  className={`px-6 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_4px_0_#E5B86E] ${
                    currentLevel === level.level
                      ? 'bg-teal-500 text-white border-2 border-teal-600'
                      : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-teal-300'
                  }`}
                >
                  <span className="text-2xl mr-2">{getMaterialEmoji(level.material)}</span>
                  {level.name}
                </button>
              ))}
            </div>

            {/* Level details */}
            <div className="bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 text-center shadow-[0_4px_0_#E5B86E]">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                {levelConfig.name} Mode
              </p>
              <p className="text-slate-600 text-sm mb-3">
                {currentLevel === 1 && "Straight lines on paper - great for beginners!"}
                {currentLevel === 2 && "Gentle curves on fabric - takes more care!"}
                {currentLevel === 3 && "Complex shapes on food - master level!"}
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-2xl font-black text-teal-600">
                    {currentLevel + 3}
                  </span>
                  <span className="text-slate-500">Cuts to make</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-teal-600">
                    {levelConfig.tolerance}px
                  </span>
                  <span className="text-slate-500">Tolerance</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-teal-600">
                    20
                  </span>
                  <span className="text-slate-500">Max points</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-4 text-sm text-teal-800">
              <p className="font-bold mb-1">How to play:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Pinch your fingers (or click and hold) to grab scissors</li>
                <li>Trace along the red dotted lines from green to red dot</li>
                <li>Stay close to the line for perfect cuts!</li>
                <li>Complete all cuts to finish the level</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="px-12 py-5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-2xl shadow-[0_6px_0_#0F766E] active:translate-y-1 active:shadow-none transition-all"
            >
              Start Cutting! ✂️
            </button>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
            {/* HUD */}
            <div className="flex items-center gap-4 w-full justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMaterialEmoji(levelConfig.material)}</span>
                <span className="font-bold text-slate-700">{levelConfig.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Cuts:</span>
                <span className="font-black text-teal-600 text-xl">
                  {cutLines.size} / {lines.length}
                </span>
              </div>

              {streak > 0 && (
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <KenneyIcon type='heart' size={20} />
                  <span>{streak}</span>
                </div>
              )}
            </div>

            {/* Help overlay */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-teal-100 border-2 border-teal-300 rounded-xl px-4 py-2 text-teal-800 font-bold text-sm"
                >
                  {isReady ? 'Pinch to grab scissors! ✂️' : 'Click and drag to cut!'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Streak Milestone */}
            <AnimatePresence>
              {showMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-black text-3xl shadow-2xl border-4 border-white">
                    <div className='flex items-center justify-center gap-2'><KenneyIcon type='heart' size={20} /> {streak} Perfect Cuts!</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="border-4 border-[#F2CC8F] rounded-2xl shadow-[0_8px_0_#E5B86E] cursor-none touch-none"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {/* Camera thumbnail */}
              <div className="absolute bottom-4 right-4">
                <CameraThumbnail
                  webcamRef={webcamRef}
                  isHandDetected={isReady}
                  visible={true}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Dotted line = Cut here</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-600">Green dot = Start</span>
              </div>
            </div>
          </div>
        )}

        {/* Complete State */}
        {gameState === 'complete' && (
          <div className="flex flex-col items-center gap-6 max-w-md w-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4"><KenneyIcon type='star' size={64} /></div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                All Cuts Complete!
              </h2>
              <p className="text-lg text-slate-600">
                You&apos;re a cutting master!
              </p>
            </motion.div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-teal-50 border-2 border-teal-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-teal-600 uppercase tracking-wide">
                  Final Score
                </p>
                <p className="text-4xl font-black text-teal-700">{score}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-orange-600 uppercase tracking-wide">
                  Best Streak
                </p>
                <p className="text-4xl font-black text-orange-700">
                  {maxStreak}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 w-full text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
                Perfect Cuts
              </p>
              <p className="text-2xl font-black text-slate-700">
                {lines.filter(l => l.completed && calculateCutQuality(l.cutQuality, levelConfig.tolerance) === 'perfect').length}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#0F766E] active:translate-y-1 active:shadow-none transition-all"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black text-xl transition-all"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
      {handCursor && (
        <GameCursor
          position={handCursor}
          coordinateSpace="normalized"
          containerRef={gameAreaRef}
          isPinching={isPinching}
          isHandDetected={isReady}
          size={64}
          color="#22c55e"
        />
      )}
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const CuttingPractice = memo(function CuttingPracticeComponent() {
  return (
    <GameShell
      gameId="cutting-practice"
      gameName="Cutting Practice"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <CuttingPracticeGame />
    </GameShell>
  );
});

export default CuttingPractice;
