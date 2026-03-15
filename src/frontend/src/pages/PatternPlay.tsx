import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameHUD } from '../components/game/GameHUD';
import { CursorEmbodiment } from '../components/game/CursorEmbodiment';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { Point } from '../types/tracking';
import { TrackedHandFrame } from '../utils/handTrackingFrame';
import { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { LEVELS, generatePattern, generateOptions, type PatternItem } from '../games/patternPlayLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500',
};

export function PatternPlayContent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandTrackingActive, setIsHandTrackingActive] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pattern, setPattern] = useState<{ shown: PatternItem[]; answer: PatternItem } | null>(null);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { playClick, playSuccess, playError } = useAudio();
  const { completeGame } = useGameCompletion('pattern-play');

  useGameSessionProgress({ gameName: 'Pattern Play', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const newPattern = generatePattern(currentLevel);
    setPattern(newPattern);
    setOptions(generateOptions(newPattern.answer));
    setScore(0);
    setCorrect(0);
    setRound(0);
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (answer: PatternItem) => {
    if (!pattern || gameState !== 'playing') return;
    playClick();
    if (answer.shape === pattern.answer.shape && answer.color === pattern.answer.color) {
      // Build streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate score with streak bonus
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 3, 15);
      const totalPoints = basePoints + streakBonus;
      setScore(s => s + totalPoints);
      setCorrect(c => c + 1);
      
      // Show score popup
      setScorePopup({ points: totalPoints });
      setTimeout(() => setScorePopup(null), 700);
      
      // Haptics
      triggerHaptic('success');

      // Milestone every 5
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }
      
      setFeedback('Pattern complete!');
      playSuccess();
    } else {
      // Wrong - break streak
      setStreak(0);
      setShowStreakMilestone(false);
      triggerHaptic('error');
      setFeedback('Try the next one!');
      playError();
    }
    setTimeout(() => {
      if (round >= 4) {
        setGameState('complete');
        triggerHaptic('celebration');
      } else {
        setRound(r => r + 1);
        const newPattern = generatePattern(currentLevel);
        setPattern(newPattern);
        setOptions(generateOptions(newPattern.answer));
        setFeedback('');
      }
    }, 1000);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await completeGame({ score: correct, level: currentLevel }); navigate('/games'); }, [correct, completeGame, navigate, playClick, currentLevel]);

  const handleHandTrackingFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    if (!frame.indexTip) { setCursor(null); setIsHandTrackingActive(false); return; }
    setCursor({ x: frame.indexTip.x, y: frame.indexTip.y });
    setIsHandTrackingActive(true);
  }, []);

  const { webcamRef: _webcamRef } = useGameHandTracking({ gameName: 'PatternPlay', targetFps: 24, onFrame: handleHandTrackingFrame });

  return (
    <GameContainer title="Pattern Play" onHome={() => navigate('/games')} reportSession={false} webcamRef={_webcamRef} isHandDetected={isHandTrackingActive} isPlaying={gameState === 'playing'}>
      <div ref={gameAreaRef} className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🔮</p>
            <h2 className="text-2xl font-bold mb-2">Pattern Play!</h2>
            <p className="mb-4">Complete the pattern!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-pink-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && pattern && (
          <div className="text-center">
            <GameHUD
              score={score}
              streak={streak}
              level={currentLevel}
              progressPercentage={(round / 5) * 100}
              leftHeaderContent={
                <div className='flex flex-col'>
                  <span className='text-xs font-black uppercase tracking-wider text-slate-400'>Correct</span>
                  <span className='text-xl font-black text-slate-700'>{correct}</span>
                </div>
              }
            />

            <div className='absolute top-24 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-pink-200 shadow-[0_4px_0_#F9A8D4] text-advay-slate font-bold text-lg text-center min-w-[320px] mb-8'>
              {feedback || 'What comes next?'}
            </div>

            {/* Score Popup Animation */}
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

            {/* Streak Milestone */}
            {showStreakMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.2, rotate: 0 }}
                exit={{ scale: 0 }}
                className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
              >
                <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl">
                  🔥 {streak} Streak! 🔥
                </div>
              </motion.div>
            )}

            <p className="text-xl font-bold mb-4">What comes next?</p>
            <div className="flex gap-2 mb-6">
              {pattern.shown.map((item, idx) => (
                <div key={idx} className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${COLOR_MAP[item.color] || 'bg-gray-300'}`}>
                  {item.shape}
                </div>
              ))}
              <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center text-2xl">?</div>
            </div>
            <div className="flex gap-3 mb-4">
              {options.map((opt, idx) => (
                <button key={idx} type="button" onClick={() => handleAnswer(opt)}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${COLOR_MAP[opt.color] || 'bg-gray-300'}`}>
                  {opt.shape}
                </button>
              ))}
            </div>
            <p className="text-lg font-medium text-purple-600 mt-4">{feedback}</p>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Pattern Master!</h2>
            <p className="text-xl mb-4">You got {correct} right!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
      <CursorEmbodiment position={cursor ?? { x: 0.5, y: 0.5 }} isHandDetected={isHandTrackingActive} />
    </GameContainer>
  );
}

export const PatternPlay = () => (
  <GameShell gameId="pattern-play" gameName="Pattern Play">
    <PatternPlayContent />
  </GameShell>
);

export default PatternPlay;
