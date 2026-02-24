/**
 * Kenney Character Component
 * 
 * Uses sprites from Kenney's Platformer Pack
 * https://kenney.nl/assets/platformer-pack
 * 
 * Characters: beige, green, pink, purple
 * Animations: idle, walk, jump, hit, duck, climb, front
 */

import { useState, useEffect } from 'react';

export type KenneyCharacterType = 'beige' | 'green' | 'pink' | 'purple';
export type KenneyAnimation = 'idle' | 'walk' | 'jump' | 'hit' | 'duck' | 'climb' | 'front';

interface KenneyCharacterProps {
  type?: KenneyCharacterType;
  animation?: KenneyAnimation;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  flipX?: boolean;
}

const CHARACTER_NAMES: Record<KenneyCharacterType, string> = {
  beige: 'Munchy',
  green: 'Crunchy',
  pink: 'Nibbles',
  purple: 'Zippy',
};

export function KenneyCharacter({
  type = 'beige',
  animation = 'idle',
  size = 'md',
  className = '',
  flipX = false,
}: KenneyCharacterProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Animation frames
  const frames: Record<KenneyAnimation, string[]> = {
    idle: [`/assets/kenney/platformer/characters/character_${type}_idle.png`],
    walk: [
      `/assets/kenney/platformer/characters/character_${type}_walk_a.png`,
      `/assets/kenney/platformer/characters/character_${type}_walk_b.png`,
    ],
    jump: [`/assets/kenney/platformer/characters/character_${type}_jump.png`],
    hit: [`/assets/kenney/platformer/characters/character_${type}_hit.png`],
    duck: [`/assets/kenney/platformer/characters/character_${type}_duck.png`],
    climb: [
      `/assets/kenney/platformer/characters/character_${type}_climb_a.png`,
      `/assets/kenney/platformer/characters/character_${type}_climb_b.png`,
    ],
    front: [`/assets/kenney/platformer/characters/character_${type}_front.png`],
  };

  // Animate walk and climb
  useEffect(() => {
    if (animation === 'walk' || animation === 'climb') {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % 2);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setCurrentFrame(0);
    }
  }, [animation]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const currentSrc = frames[animation][currentFrame];
  const characterName = CHARACTER_NAMES[type];

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src={currentSrc}
        alt={characterName}
        className={`w-full h-full object-contain ${flipX ? 'scale-x-[-1]' : ''}`}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

/**
 * Kenney Enemy Component
 */
export type KenneyEnemyType = 
  | 'barnacle' 
  | 'bee' 
  | 'block' 
  | 'fish_blue' 
  | 'fish_purple' 
  | 'fish_yellow'
  | 'fly'
  | 'frog'
  | 'ladybug'
  | 'mouse';

interface KenneyEnemyProps {
  type?: KenneyEnemyType;
  animation?: 'idle' | 'attack' | 'walk' | 'fly' | 'swim';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  flipX?: boolean;
}

export function KenneyEnemy({
  type = 'bee',
  animation = 'idle',
  size = 'md',
  className = '',
  flipX = false,
}: KenneyEnemyProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // Map enemy type to file prefix
  const enemyFileMap: Record<KenneyEnemyType, string> = {
    barnacle: 'barnacle',
    bee: 'bee',
    block: 'block',
    fish_blue: 'fish_blue',
    fish_purple: 'fish_purple',
    fish_yellow: 'fish_yellow',
    fly: 'fly',
    frog: 'frog',
    ladybug: 'ladybug',
    mouse: 'mouse',
  };

  const prefix = enemyFileMap[type];
  
  // Animation frames for enemies
  const frames: Record<string, string[]> = {
    [`${prefix}_idle`]: [`/assets/kenney/platformer/enemies/${prefix}_rest.png`],
    [`${prefix}_attack`]: [
      `/assets/kenney/platformer/enemies/${prefix}_attack_a.png`,
      `/assets/kenney/platformer/enemies/${prefix}_attack_b.png`,
    ],
    [`${prefix}_walk`]: [
      `/assets/kenney/platformer/enemies/${prefix}_walk_a.png`,
      `/assets/kenney/platformer/enemies/${prefix}_walk_b.png`,
    ],
    [`${prefix}_fly`]: [
      `/assets/kenney/platformer/enemies/${prefix}_a.png`,
      `/assets/kenney/platformer/enemies/${prefix}_b.png`,
    ],
    [`${prefix}_swim`]: [
      `/assets/kenney/platformer/enemies/${prefix}_swim_a.png`,
      `/assets/kenney/platformer/enemies/${prefix}_swim_b.png`,
    ],
  };

  const animationKey = `${prefix}_${animation}`;
  const animationFrames = frames[animationKey] || frames[`${prefix}_idle`];

  // Animate
  useEffect(() => {
    if (animationFrames.length > 1) {
      const interval = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % animationFrames.length);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setCurrentFrame(0);
    }
  }, [animation, animationFrames.length]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src={animationFrames[currentFrame]}
        alt={type}
        className={`w-full h-full object-contain ${flipX ? 'scale-x-[-1]' : ''}`}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

export default KenneyCharacter;
