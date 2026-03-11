/**
 * Kenney Character Animated Component
 * 
 * Displays animated character sprites from Kenney platformer pack.
 * Supports idle, walk, jump, climb, duck, hit animations.
 * 
 * @example
 * <KenneyCharacterAnimated color="green" animation="walk" size={64} />
 */

import { useEffect, useState, memo } from 'react';

export type CharacterColor = 'beige' | 'green' | 'pink' | 'purple' | 'yellow';
export type CharacterAnimation = 'idle' | 'walk' | 'jump' | 'climb' | 'duck' | 'hit' | 'front';

interface KenneyCharacterAnimatedProps {
  /** Character color variant */
  color?: CharacterColor;
  /** Animation state */
  animation?: CharacterAnimation;
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

const BASE_PATH = '/assets/kenney/platformer/characters';

// Animation frame sequences
const ANIMATION_FRAMES: Record<CharacterAnimation, string[]> = {
  idle: ['idle'],
  walk: ['walk_a', 'walk_b'],
  jump: ['jump'],
  climb: ['climb_a', 'climb_b'],
  duck: ['duck'],
  hit: ['hit'],
  front: ['front'],
};

export const KenneyCharacterAnimated = memo(function KenneyCharacterAnimated({
  color = 'green',
  animation = 'idle',
  size = 64,
  frameSpeed = 200,
  flipX = false,
  className = '',
  alt = `Character ${color} ${animation}`,
}: KenneyCharacterAnimatedProps) {
  const frames = ANIMATION_FRAMES[animation];
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    setCurrentFrame(0);
  }, [animation]);

  // Animate through frames
  useEffect(() => {
    if (frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, frameSpeed);

    return () => clearInterval(interval);
  }, [frames, frameSpeed]);

  const frameCount = frames.length;
  const frameName = frames[frameCount > 0 ? currentFrame % frameCount : 0];
  const imagePath = `${BASE_PATH}/character_${color}_${frameName}.png`;

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
 * Static character display (single frame)
 */
export const KenneyCharacter = memo(function KenneyCharacter({
  color = 'green',
  pose = 'idle',
  size = 64,
  flipX = false,
  className = '',
  alt = `Character ${color}`,
}: {
  color?: CharacterColor;
  pose?: 'idle' | 'walk_a' | 'walk_b' | 'jump' | 'climb_a' | 'climb_b' | 'duck' | 'hit' | 'front';
  size?: number;
  flipX?: boolean;
  className?: string;
  alt?: string;
}) {
  const imagePath = `${BASE_PATH}/character_${color}_${pose}.png`;

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
 * Character selector for choosing colors
 */
export const CharacterColorSelector = memo(function CharacterColorSelector({
  selected,
  onSelect,
  size = 48,
}: {
  selected: CharacterColor;
  onSelect: (color: CharacterColor) => void;
  size?: number;
}) {
  const colors: CharacterColor[] = ['beige', 'green', 'pink', 'purple', 'yellow'];

  return (
    <div className="flex gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`p-1 rounded-lg transition-all ${
            selected === color
              ? 'ring-2 ring-blue-500 bg-blue-50'
              : 'hover:bg-gray-100'
          }`}
          aria-label={`Select ${color} character`}
        >
          <KenneyCharacter color={color} pose="idle" size={size} />
        </button>
      ))}
    </div>
  );
});

export default KenneyCharacterAnimated;
