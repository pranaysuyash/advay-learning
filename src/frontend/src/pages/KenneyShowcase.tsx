/**
 * Kenney Showcase Page
 * 
 * Comprehensive demonstration of all Kenney asset components.
 * Displays icons, characters, enemies, backgrounds, and animations.
 * 
 * @route /dev/kenney-showcase
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { KenneyIcon, type KenneyIconType } from '../components/ui/KenneyIcon';
import {
  KenneyCharacterAnimated,
  CharacterColorSelector,
  type CharacterColor,
  type CharacterAnimation,
} from '../components/game/KenneyCharacterAnimated';
import {
  EnemySprite,
  getEnemiesByCategory,
  type EnemyType,
} from '../components/game/EnemySprite';
import {
  GameBackground,
  BackgroundSelector,
  getRandomBackground,
  type BackgroundType,
  type BackgroundVariant,
} from '../components/game/GameBackground';
import { AssetPreloader } from '../components/AssetPreloader';

const ICON_TYPES: KenneyIconType[] = [
  'heart', 'coin', 'gem', 'star', 'key_blue', 'key_green', 'key_red', 'key_yellow',
  'lock_blue', 'lock_green', 'lock_red', 'lock_yellow', 'check', 'cross', 'circle',
];


const CHARACTER_ANIMATIONS: CharacterAnimation[] = ['idle', 'walk', 'jump', 'climb', 'duck', 'hit', 'front'];

export default function KenneyShowcase() {
  const navigate = useNavigate();
  const [selectedIcon, setSelectedIcon] = useState<KenneyIconType>('star');
  const [characterColor, setCharacterColor] = useState<CharacterColor>('green');
  const [characterAnimation, setCharacterAnimation] = useState<CharacterAnimation>('idle');
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyType>('bee');
  const [background, setBackground] = useState<{ type: BackgroundType; variant?: BackgroundVariant }>(
    getRandomBackground()
  );
  const [showPreloader, setShowPreloader] = useState(false);

  return (
    <GameContainer title="Kenney Assets Showcase" onHome={() => navigate('/games')}>
      <div className="min-h-screen p-4 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              🎨 Kenney Assets Showcase
            </h1>
            <p className="text-slate-600">
              Explore all the game assets available in the Advay Vision Learning platform
            </p>
          </div>

          {/* Icons Section */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Icons (15 types)</h2>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 mb-6">
              {ICON_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedIcon(type)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedIcon === type
                      ? 'bg-blue-100 ring-2 ring-blue-500'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <KenneyIcon type={type} size={32} />
                  <span className="text-xs text-slate-500 block mt-1 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-600">Selected:</span>
              <KenneyIcon type={selectedIcon} size={48} />
              <code className="text-sm bg-slate-200 px-2 py-1 rounded">
                {`<KenneyIcon type="${selectedIcon}" size={48} />`}
              </code>
            </div>
          </section>

          {/* Characters Section */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Characters (5 colors, 7 animations)</h2>
            
            {/* Color Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Select Color</h3>
              <CharacterColorSelector
                selected={characterColor}
                onSelect={setCharacterColor}
                size={48}
              />
            </div>

            {/* Animation Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Select Animation</h3>
              <div className="flex flex-wrap gap-2">
                {CHARACTER_ANIMATIONS.map((anim) => (
                  <button
                    key={anim}
                    onClick={() => setCharacterAnimation(anim)}
                    className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${
                      characterAnimation === anim
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {anim}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated Character Display */}
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-xl">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <KenneyCharacterAnimated
                  color={characterColor}
                  animation={characterAnimation}
                  size={96}
                  frameSpeed={150}
                />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Animated</p>
                <code className="text-sm bg-slate-200 px-2 py-1 rounded block">
                  {`<KenneyCharacterAnimated color="${characterColor}" animation="${characterAnimation}" size={96} />`}
                </code>
              </div>
            </div>
          </section>

          {/* Enemies Section */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Enemies (18 types)</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
              {getEnemiesByCategory('flying').map((enemy) => (
                <button
                  key={enemy}
                  onClick={() => setSelectedEnemy(enemy)}
                  className={`p-3 rounded-xl transition-all ${
                    selectedEnemy === enemy
                      ? 'bg-red-100 ring-2 ring-red-500'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <EnemySprite type={enemy} size={48} />
                  <span className="text-xs text-slate-500 block mt-1 capitalize">
                    {enemy.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-xl">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <EnemySprite type={selectedEnemy} size={96} frameSpeed={100} />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Selected Enemy</p>
                <code className="text-sm bg-slate-200 px-2 py-1 rounded block">
                  {`<EnemySprite type="${selectedEnemy}" size={96} />`}
                </code>
              </div>
            </div>
          </section>

          {/* Backgrounds Section */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Backgrounds (10 types)</h2>
            
            <BackgroundSelector
              selected={background}
              onSelect={(type, variant) => setBackground({ type, variant })}
              category="all"
              showVariants
            />

            <div className="mt-6 h-48 rounded-xl overflow-hidden border-2 border-slate-200">
              <GameBackground
                type={background.type}
                variant={background.variant}
                className="w-full h-full"
              />
            </div>

            <code className="text-sm bg-slate-200 px-2 py-1 rounded block mt-4">
              {`<GameBackground type="${background.type}"${background.variant ? ` variant="${background.variant}"` : ''} />`}
            </code>
          </section>

          {/* AssetPreloader Demo */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">AssetPreloader</h2>
            <p className="text-slate-600 mb-4">
              Demonstrates loading screen with progress indication.
            </p>
            <button
              onClick={() => setShowPreloader(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              Show Preloader Demo
            </button>

            {showPreloader && (
              <AssetPreloader
                assets={[
                  { type: 'image', src: '/assets/kenney/platformer/collectibles/star.png', priority: 'critical' },
                  { type: 'image', src: '/assets/kenney/platformer/collectibles/coin_gold.png', priority: 'critical' },
                  { type: 'image', src: '/assets/kenney/platformer/collectibles/gem_blue.png', priority: 'critical' },
                ]}
                onComplete={() => setShowPreloader(false)}
                minDisplayTime={1500}
              />
            )}
          </section>

          {/* Stats Summary */}
          <section className="bg-slate-800 text-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Integration Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">30+</div>
                <div className="text-sm text-slate-400">Games Updated</div>
              </div>
              <div className="bg-slate-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">23</div>
                <div className="text-sm text-slate-400">With AssetPreloader</div>
              </div>
              <div className="bg-slate-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">5</div>
                <div className="text-sm text-slate-400">Sprite Atlases</div>
              </div>
              <div className="bg-slate-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-orange-400">550+</div>
                <div className="text-sm text-slate-400">Total Assets</div>
              </div>
            </div>
          </section>

          {/* Usage Examples */}
          <section className="bg-slate-100 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Usage Examples</h2>
            <pre className="bg-slate-800 text-white p-4 rounded-xl overflow-x-auto text-sm">
{`// Icons
<KenneyIcon type="star" size={48} />

// Animated Characters
<KenneyCharacterAnimated color="green" animation="walk" size={64} />

// Static Characters
<KenneyCharacter color="pink" pose="jump" size={48} flipX />

// Enemies
<EnemySprite type="bee" animation="fly" size={64} />

// Backgrounds
<GameBackground type="hills" variant="color" />

// Preloader
<AssetPreloader assets={CRITICAL_ASSETS} onComplete={() => setReady(true)} />`}
            </pre>
          </section>
        </div>
      </div>
    </GameContainer>
  );
}
