/**
 * Color Sort Game - REFACTORED with GameShell
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateItems, type ColorItem } from '../games/colorSortGameLogic';

const ColorSortGameGame = memo(function ColorSortGameGameComponent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [items, setItems] = useState<ColorItem[]>([]);
  const [targets, setTargets] = useState<ColorItem[]>([]);
  const [buckets, setBuckets] = useState<Record<string, ColorItem[]>>({});
  const [selectedItem, setSelectedItem] = useState<ColorItem | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('color-sort');

  useGameSessionProgress({ gameName: 'Color Sort', score, level: currentLevel, isPlaying: true, metaData: { correct } });

  const startGame = () => {
    const { items: newItems, targets: newTargets } = generateItems(currentLevel);
    setItems(newItems);
    setTargets(newTargets);
    setBuckets(newTargets.reduce((acc, t) => ({ ...acc, [t.name]: [] }), {}));
    setSelectedItem(null);
    setScore(0);
    setCorrect(0);
    setGameState('playing');
  };

  const handleItemClick = (item: ColorItem) => {
    if (gameState !== 'playing') return;
    playClick();
    setSelectedItem(item);
  };

  const handleBucketClick = (target: ColorItem) => {
    if (!selectedItem || gameState !== 'playing') return;
    playClick();
    if (selectedItem.name === target.name) {
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 20);
      const newBuckets = { ...buckets };
      newBuckets[target.name] = [...newBuckets[target.name], selectedItem];
      setBuckets(newBuckets);
      setItems(items.filter(i => i !== selectedItem));
      if (items.length <= 1) {
        setGameState('complete');
      }
    } else {
      playError();
      setScore(s => Math.max(s - 5, 0));
    }
    setSelectedItem(null);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Color Sort" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-cyan-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎨</p>
            <h2 className="text-2xl font-bold mb-2">Color Sort!</h2>
            <p className="mb-4">Sort colors into matching buckets!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-cyan-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-lg font-bold">Drag colors to matching buckets!</p>
            <div className="flex flex-wrap justify-center gap-3">
              {items.map((item, idx) => (
                <button key={idx} type="button" onClick={() => handleItemClick(item)}
                  className={`w-12 h-12 rounded-full shadow-md transition-transform ${selectedItem === item ? 'scale-125 ring-4 ring-black' : 'hover:scale-110'}`}
                  style={{ backgroundColor: item.hex }} />
              ))}
            </div>
            <div className="flex gap-4">
              {targets.map((target) => (
                <div key={target.name} className="flex flex-col items-center gap-2">
                  <div className="w-20 h-24 border-4 border-dashed rounded-xl flex flex-col items-center justify-end pb-2 overflow-hidden"
                    style={{ borderColor: target.hex }}
                    onClick={() => handleBucketClick(target)}>
                    {buckets[target.name]?.map((item, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full" style={{ backgroundColor: item.hex }} />
                    ))}
                  </div>
                  <span className="font-bold text-sm" style={{ color: target.hex }}>{target.name}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-cyan-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Score</p><p className="text-2xl font-bold">{score}</p></div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-xl mb-4">You sorted all colors!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}

// Main export wrapped with GameShell
export const ColorSortGame = memo(function ColorSortGameComponent() {
  return (
    <GameShell
      gameId="color-sort"
      gameName="Color Sort"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <ColorSortGameGame />
    </GameShell>
  );
});
