/**
 * Color Sort Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { AssetPreloader } from '../components/AssetPreloader';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { LEVELS, generateItems, calculateScore, type ColorItem } from '../games/colorSortGameLogic';
import { triggerHaptic } from '../utils/haptics';
import { GameHUD } from '../components/game/GameHUD';

const CRITICAL_ASSETS: import('../components/AssetPreloader').AssetToPreload[] = [
  { type: 'image', src: '/assets/kenney/platformer/collectibles/star.png', priority: 'critical' },
];

const ColorSortGameGame = memo(function ColorSortGameGameComponent() {
  const navigate = useNavigate();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [items, setItems] = useState<ColorItem[]>([]);
  const [targets, setTargets] = useState<ColorItem[]>([]);
  const [buckets, setBuckets] = useState<Record<string, ColorItem[]>>({});
  const [selectedItem, setSelectedItem] = useState<ColorItem | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { completeGame } = useGameCompletion('color-sort');

  useGameSessionProgress({ gameName: 'Color Sort', score, level: currentLevel, isPlaying: true, metaData: { correct } });

  const startGame = () => {
    const { items: newItems, targets: newTargets } = generateItems(currentLevel);
    setItems(newItems);
    setTargets(newTargets);
    setBuckets(newTargets.reduce((acc, t) => ({ ...acc, [t.name]: [] }), {}));
    setSelectedItem(null);
    setScore(0);
    setCorrect(0);
    resetStreak();
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
      // Correct sort - build streak
      incrementStreak();

      // Calculate score with streak and level multiplier
      const points = calculateScore(streak + 1, currentLevel);
      setScore(s => s + points);

      // Show score popup
      setScorePopup({ points, x: 50, y: 30 });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');

      playSuccess();
      setCorrect(c => c + 1);
      const newBuckets = { ...buckets };
      newBuckets[target.name] = [...newBuckets[target.name], selectedItem];
      setBuckets(newBuckets);
      setItems(items.filter(i => i !== selectedItem));
      if (items.length <= 1) {
        setGameState('complete');
        triggerHaptic('celebration');
      }
    } else {
      // Wrong sort - break streak
      resetStreak();
      setScore(s => Math.max(s - 5, 0));
      triggerHaptic('error');
      playError();
    }
    setSelectedItem(null);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await completeGame({ score: correct, completed: true, level: currentLevel }); navigate('/games'); }, [correct, navigate, playClick, completeGame, currentLevel]);

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
            <p className="mb-2">Sort colors into matching buckets!</p>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 mb-4 inline-block">
              <p className="font-bold mb-1">🎯 Scoring:</p>
              <p>Base 10 pts + streak bonus</p>
              <p>× Level multiplier: L1 1× | L2 1.5× | L3 2×</p>
            </div>
            <br />
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-cyan-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform">Start!</button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="flex flex-col items-center gap-6">
            <div className="fixed top-20 left-4 right-4 z-10 max-w-4xl mx-auto">
              <GameHUD
                score={score}
                streak={streak}
                levelInfo={
                  <div className="bg-cyan-100 text-cyan-700 px-4 py-1.5 rounded-xl font-black border-2 border-cyan-200 shadow-sm">
                    Level {currentLevel}
                  </div>
                }
                rightHeaderContent={
                  <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-xl font-black border-2 border-green-200 shadow-sm flex items-center gap-2">
                    <span>✓</span> {correct} Correct
                  </div>
                }
              />
            </div>

            {/* Streak milestone popup */}
            {showMilestone && (
              <div className="animate-bounce bg-orange-100 border-2 border-orange-300 rounded-xl px-6 py-3">
                <p className="text-xl font-black text-orange-600">
                  🔥 {streak} Sort Streak! 🔥
                </p>
              </div>
            )}

            <p className="text-lg font-bold">Drag colors to matching buckets!</p>
            <div className="flex flex-wrap justify-center gap-3 relative">
              {items.map((item, idx) => (
                <button key={idx} type="button" onClick={() => handleItemClick(item)}
                  className={`w-12 h-12 rounded-full shadow-md transition-transform ${selectedItem === item ? 'scale-125 ring-4 ring-black' : 'hover:scale-110'}`}
                  style={{ backgroundColor: item.hex }} />
              ))}
            </div>
            <div className="flex gap-4">
              {targets.map((target) => (
                <div key={target.name} className="flex flex-col items-center gap-2">
                  <div
                    className="w-20 h-24 border-4 border-dashed rounded-xl flex flex-col items-center justify-end pb-2 overflow-hidden bg-slate-50 transition-all hover:bg-slate-100 cursor-pointer"
                    style={{ borderColor: target.hex }}
                    onClick={() => handleBucketClick(target)}
                  >
                    {buckets[target.name]?.map((item, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: item.hex }} />
                    ))}
                  </div>
                  <span className="font-bold text-sm" style={{ color: target.hex }}>{target.name}</span>
                </div>
              ))}
            </div>
            {/* Score popup */}
            {scorePopup && (
              <div
                className="fixed font-black text-3xl text-green-500 animate-bounce pointer-events-none z-50"
                style={{
                  left: '50%',
                  top: '40%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                +{scorePopup.points}
              </div>
            )}

            {/* Bottom stats removed as they are now integrated into GameHUD */}
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-xl mb-4">You sorted all colors!</p>
            {/* Streak badge */}
            {maxStreak >= 5 && (
              <div className="flex items-center justify-center gap-2 bg-orange-100 border-2 border-orange-300 px-4 py-2 rounded-full mb-4">
                <img
                  src="/assets/kenney/platformer/collectibles/star.png"
                  alt="star"
                  className="w-6 h-6"
                />
                <span className="font-black text-orange-700">
                  Best Streak: {maxStreak}!
                </span>
              </div>
            )}
            <div className="flex justify-center gap-4 mb-4">
              <div className="bg-cyan-50 border-2 border-cyan-200 px-6 py-3 rounded-xl text-center">
                <p className="text-xs font-black uppercase text-cyan-600">Score</p>
                <p className="text-3xl font-black text-cyan-700">{score}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 px-6 py-3 rounded-xl text-center">
                <p className="text-xs font-black uppercase text-orange-600">Max Streak</p>
                <p className="text-3xl font-black text-orange-700">{maxStreak}</p>
              </div>
            </div>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold mr-4 hover:scale-105 transition-transform">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
});

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
