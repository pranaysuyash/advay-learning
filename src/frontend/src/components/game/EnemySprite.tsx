/* eslint-disable react-refresh/only-export-components */
/**
 * Enemy Sprite Component
 * 
 * Displays enemy sprites from Kenney platformer pack.
 * Supports animated enemies with multiple frames.
 * 
 * @example
 * <EnemySprite type="bee" animation="fly" size={64} />
 * <EnemySprite type="snail" animation="crawl" size={48} />
 */

import { useEffect, useState, memo } from 'react';

export type EnemyType = 
  | 'barnacle'
  | 'bee'
  | 'block'
  | 'fish_blue'
  | 'fish_purple'
  | 'fish_yellow'
  | 'fly'
  | 'frog'
  | 'ladybug'
  | 'mouse'
  | 'saw'
  | 'slime_block'
  | 'slime_fire'
  | 'slime_normal'
  | 'slime_spike'
  | 'snail'
  | 'worm_normal'
  | 'worm_ring';

interface EnemySpriteProps {
  /** Enemy type */
  type: EnemyType;
  /** Animation variant */
  animation?: 'idle' | 'move' | 'attack';
  /** Size in pixels */
  size?: number;
  /** Animation speed in ms */
  frameSpeed?: number;
  /** Whether to flip horizontally */
  flipX?: boolean;
  /** CSS class */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
}

const BASE_PATH = '/assets/kenney/platformer/enemies';

// Enemy frame configurations
const ENEMY_FRAMES: Record<EnemyType, { frames: string[]; hasAnimation: boolean }> = {
  barnacle: { frames: ['attack_a', 'attack_b', 'attack_rest'], hasAnimation: true },
  bee: { frames: ['a', 'b', 'rest'], hasAnimation: true },
  block: { frames: ['fall', 'idle', 'rest'], hasAnimation: true },
  fish_blue: { frames: ['rest', 'swim_a', 'swim_b'], hasAnimation: true },
  fish_purple: { frames: ['rest', 'down', 'up'], hasAnimation: true },
  fish_yellow: { frames: ['rest', 'swim_a', 'swim_b'], hasAnimation: true },
  fly: { frames: ['a', 'b'], hasAnimation: true },
  frog: { frames: ['idle'], hasAnimation: false },
  ladybug: { frames: ['fly', 'walk'], hasAnimation: true },
  mouse: { frames: ['a', 'b', 'c'], hasAnimation: true },
  saw: { frames: ['a', 'b', 'c', 'd'], hasAnimation: true },
  slime_block: { frames: ['idle', 'walk'], hasAnimation: true },
  slime_fire: { frames: ['idle', 'walk'], hasAnimation: true },
  slime_normal: { frames: ['idle', 'walk'], hasAnimation: true },
  slime_spike: { frames: ['idle', 'walk'], hasAnimation: true },
  snail: { frames: ['a', 'b', 'shell', 'walk'], hasAnimation: true },
  worm_normal: { frames: ['a', 'b'], hasAnimation: true },
  worm_ring: { frames: ['a', 'b'], hasAnimation: true },
};

export const EnemySprite = memo(function EnemySprite({
  type,
  animation: _animation = 'idle',
  size = 64,
  frameSpeed = 150,
  flipX = false,
  className = '',
  alt = `Enemy ${type}`,
}: EnemySpriteProps) {
  const enemyConfig = ENEMY_FRAMES[type];
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    setCurrentFrame(0);
  }, [type]);

  // Animate through frames
  useEffect(() => {
    if (!enemyConfig.hasAnimation || enemyConfig.frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % enemyConfig.frames.length);
    }, frameSpeed);

    return () => clearInterval(interval);
  }, [enemyConfig, frameSpeed]);

  const frameName = enemyConfig.frames[currentFrame];
  const imagePath = `${BASE_PATH}/${type}_${frameName}.png`;

  return (
    <img
      src={imagePath}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{
        transform: flipX ? 'scaleX(-1)' : undefined,
        imageRendering: 'pixelated',
      }}
    />
  );
});

/**
 * Enemy gallery for selection/display
 */
export const EnemyGallery = memo(function EnemyGallery({
  enemies,
  size = 64,
  onSelect,
  selected,
}: {
  enemies: EnemyType[];
  size?: number;
  onSelect?: (enemy: EnemyType) => void;
  selected?: EnemyType;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {enemies.map((enemy) => (
        <div
          key={enemy}
          onClick={() => onSelect?.(enemy)}
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            selected === enemy
              ? 'ring-2 ring-red-500 bg-red-50'
              : 'hover:bg-gray-100'
          }`}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
        >
          <EnemySprite type={enemy} size={size} />
          <p className="text-xs text-center mt-1 capitalize">{enemy.replace('_', ' ')}</p>
        </div>
      ))}
    </div>
  );
});

/**
 * Get all available enemy types
 */
export const getAllEnemyTypes = (): EnemyType[] => {
  return Object.keys(ENEMY_FRAMES) as EnemyType[];
};

/**
 * Get enemies by category
 */
export const getEnemiesByCategory = (category: 'ground' | 'flying' | 'water' | 'slime'): EnemyType[] => {
  const categories: Record<string, EnemyType[]> = {
    ground: ['snail', 'worm_normal', 'worm_ring', 'ladybug', 'mouse', 'frog'],
    flying: ['bee', 'fly', 'ladybug'],
    water: ['fish_blue', 'fish_purple', 'fish_yellow', 'barnacle'],
    slime: ['slime_block', 'slime_fire', 'slime_normal', 'slime_spike'],
  };
  return categories[category] || [];
};

export default EnemySprite;
