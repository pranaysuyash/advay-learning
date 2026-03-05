import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, getStoriesForLevel, type Story } from '../games/voiceStoriesLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

export function VoiceStories() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'reading' | 'complete'>('start');
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { playClick, playSuccess } = useAudio();
  const { onGameComplete } = useGameDrops('voice-stories');

  useGameSessionProgress({ gameName: 'Voice Stories', score, level: currentLevel, isPlaying: true, metaData: { currentLine } });

  const startGame = () => {
    const stories = getStoriesForLevel(currentLevel);
    setCurrentStory(stories[0]);
    setCurrentLine(0);
    setScore(0);
    setStreak(0);
    setShowStreakMilestone(false);
    setGameState('reading');
  };

  const handleNext = () => {
    playClick();
    if (!currentStory) return;
    if (currentLine < currentStory.lines.length - 1) {
      // Streak for each page turned
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCurrentLine(l => l + 1);
      triggerHaptic('success');

      // Milestone every 5 pages
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }
    } else {
      playSuccess();
      triggerHaptic('celebration');
      setScore(s => s + 50 + streak * 5);
      setGameState('complete');
    }
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(Math.round(score / 20)); navigate('/games'); }, [score, onGameComplete, navigate, playClick]);

  const currentLineData = currentStory?.lines[currentLine];

  return (
    <GameContainer title="Voice Stories" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-violet-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">📖</p>
            <h2 className="text-2xl font-bold mb-2">Voice Stories!</h2>
            <p className="mb-4">Listen and follow along!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-violet-500 text-white rounded-2xl font-bold text-xl">Start Story!</button>
          </div>
        )}

        {/* Streak Milestone Overlay */}
        {showStreakMilestone && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'
          >
            <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg'>
              🔥 {streak} Pages! 🔥
            </div>
          </motion.div>
        )}

        {gameState === 'reading' && currentStory && currentLineData && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <p className="text-sm text-gray-500">{currentStory.title}</p>
              {streak > 0 && (
                <span className="text-orange-500 font-bold">🔥 {streak}</span>
              )}
            </div>
            <p className="text-8xl mb-4">{currentLineData.emoji}</p>
            <p className="text-2xl font-bold text-violet-700 mb-4 px-8">{currentLineData.text}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              {currentStory.lines.map((_, idx) => (
                <div key={idx} className={`w-3 h-3 rounded-full ${idx === currentLine ? 'bg-violet-500' : idx < currentLine ? 'bg-green-400' : 'bg-gray-200'}`} />
              ))}
            </div>
            <button type="button" onClick={handleNext} className="px-8 py-4 bg-violet-500 text-white rounded-xl font-bold text-xl">
              {currentLine < currentStory.lines.length - 1 ? 'Next Page' : 'Finish Story!'}
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Story Complete!</h2>
            <p className="text-xl mb-4">Great listening!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-violet-500 text-white rounded-xl font-bold mr-4">Read Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
