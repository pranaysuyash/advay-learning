import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, getStoriesForLevel, type Story } from '../games/voiceStoriesLogic';

export function VoiceStories() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'reading' | 'complete'>('start');

  const { playClick, playSuccess } = useAudio();
  const { onGameComplete } = useGameDrops('voice-stories');

  useGameSessionProgress({ gameName: 'Voice Stories', score, level: currentLevel, isPlaying: true, metaData: { currentLine } });

  const startGame = () => {
    const stories = getStoriesForLevel(currentLevel);
    setCurrentStory(stories[0]);
    setCurrentLine(0);
    setScore(0);
    setGameState('reading');
  };

  const handleNext = () => {
    playClick();
    if (!currentStory) return;
    if (currentLine < currentStory.lines.length - 1) {
      setCurrentLine(l => l + 1);
    } else {
      playSuccess();
      setScore(s => s + 50);
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

        {gameState === 'reading' && currentStory && currentLineData && (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">{currentStory.title}</p>
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
