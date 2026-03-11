/**
 * Enemy Gallery Demo Page
 * 
 * Showcase all Kenney enemy sprites with animations.
 * Used for testing and demonstration of EnemySprite component.
 * 
 * @route /dev/enemy-gallery
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import {
  EnemySprite,
  EnemyGallery,
  getAllEnemyTypes,
  getEnemiesByCategory,
  type EnemyType,
} from '../components/game/EnemySprite';
import { GameBackground } from '../components/game/GameBackground';

const CATEGORIES = [
  { key: 'all', label: 'All Enemies' },
  { key: 'ground', label: 'Ground' },
  { key: 'flying', label: 'Flying' },
  { key: 'water', label: 'Water' },
  { key: 'slime', label: 'Slimes' },
] as const;

export default function EnemyGalleryDemo() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyType | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(150);

  const getEnemies = useCallback((): EnemyType[] => {
    if (selectedCategory === 'all') return getAllEnemyTypes();
    return getEnemiesByCategory(selectedCategory as 'ground' | 'flying' | 'water' | 'slime');
  }, [selectedCategory]);

  const enemies = getEnemies();

  return (
    <GameContainer title="Enemy Gallery Demo" onHome={() => navigate('/games')}>
      <div className="relative min-h-screen p-4">
        {/* Background */}
        <GameBackground type="hills" variant="color" className="absolute inset-0" />
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              🐛 Kenney Enemy Sprites
            </h1>
            <p className="text-slate-600">
              Browse all {getAllEnemyTypes().length} enemy types from the Kenney Platformer Pack.
              Click an enemy to see it animated!
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg flex flex-wrap gap-4 items-center">
            {/* Category filter */}
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Animation speed */}
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm font-bold text-slate-600">Speed:</span>
              <input
                type="range"
                min={50}
                max={500}
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-slate-500 w-16">{animationSpeed}ms</span>
            </div>
          </div>

          {/* Enemy Grid */}
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {CATEGORIES.find(c => c.key === selectedCategory)?.label}
              </h2>
              <span className="text-sm text-slate-500">
                {enemies.length} enemies
              </span>
            </div>

            <EnemyGallery
              enemies={enemies}
              size={80}
              onSelect={setSelectedEnemy}
              selected={selectedEnemy || undefined}
            />
          </div>

          {/* Selected Enemy Detail */}
          {selectedEnemy && (
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-6">
                <div className="bg-slate-100 rounded-2xl p-6">
                  <EnemySprite
                    type={selectedEnemy}
                    size={120}
                    frameSpeed={animationSpeed}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 capitalize mb-2">
                    {selectedEnemy.replace('_', ' ')}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Frame speed: {animationSpeed}ms
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      Animated
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      Kenney Asset
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usage Example */}
          <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4">Usage Example</h3>
            <pre className="text-sm overflow-x-auto">
{`import { EnemySprite, EnemyGallery } from './components/game/EnemySprite';

// Single enemy
<EnemySprite type="bee" size={64} animation="fly" />

// Gallery with selection
<EnemyGallery
  enemies={['snail', 'bee', 'frog']}
  size={48}
  onSelect={handleSelect}
  selected={selectedEnemy}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
