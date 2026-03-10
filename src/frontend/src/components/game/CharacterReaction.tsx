/**
 * Character Reaction Component
 * 
 * Displays Kenney character animations for feedback.
 * Shows happy/sad/jump reactions based on game events.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

import { useState, useEffect } from 'react';
import type { CharacterColor, CharacterAnimation } from '../../utils/kenneyAssetRegistry';
import { getCharacterAsset } from '../../utils/kenneyAssetRegistry';

export type ReactionType = 'success' | 'failure' | 'celebrate' | 'idle';

interface CharacterReactionProps {
  character?: CharacterColor;
  reaction: ReactionType;
  size?: number;
  className?: string;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Map reactions to character animations
 */
const REACTION_ANIMATIONS: Record<ReactionType, CharacterAnimation[]> = {
  success: ['jump', 'idle'],
  failure: ['hit', 'idle'],
  celebrate: ['jump', 'walk', 'jump', 'idle'],
  idle: ['idle'],
};

/**
 * CharacterReaction - Animated character feedback
 * 
 * Usage:
 * ```tsx
 * <CharacterReaction 
 *   character="blue" 
 *   reaction="success"
 *   size={128}
 *   onComplete={() => setReaction(null)}
 * />
 * ```
 */
export function CharacterReaction({
  character = 'beige',
  reaction,
  size = 128,
  className = '',
  onComplete,
  duration = 2000,
}: CharacterReactionProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const animations = REACTION_ANIMATIONS[reaction];
  const currentAnimation = animations[currentFrame % animations.length];

  useEffect(() => {
    if (!isAnimating) return;

    const frameInterval = duration / animations.length;
    
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const next = prev + 1;
        if (next >= animations.length) {
          setIsAnimating(false);
          onComplete?.();
          return prev;
        }
        return next;
      });
    }, frameInterval);

    return () => clearInterval(interval);
  }, [animations.length, duration, isAnimating, onComplete]);

  // Reset when reaction changes
  useEffect(() => {
    setCurrentFrame(0);
    setIsAnimating(true);
  }, [reaction]);

  const getAnimationStyles = () => {
    switch (currentAnimation) {
      case 'jump':
        return {
          transform: 'translateY(-20px) scale(1.1)',
          transition: 'transform 0.3s ease-out',
        };
      case 'hit':
        return {
          transform: 'translateX(-5px) rotate(-5deg)',
          filter: 'brightness(0.7)',
          transition: 'all 0.2s ease',
        };
      case 'walk':
        return {
          transform: currentFrame % 2 === 0 ? 'translateX(5px)' : 'translateX(-5px)',
          transition: 'transform 0.15s ease',
        };
      default:
        return {
          transform: 'translateY(0) scale(1)',
          transition: 'transform 0.3s ease',
        };
    }
  };

  const imagePath = getCharacterAsset(character, currentAnimation);

  return (
    <div
      className={`inline-block ${className}`.trim()}
      style={{
        width: size,
        height: size,
        ...getAnimationStyles(),
      }}
    >
      <img
        src={imagePath}
        alt={`${character} character ${currentAnimation}`}
        width={size}
        height={size}
        className="object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

/**
 * CharacterMascot - Static character display with occasional idle animation
 */
interface CharacterMascotProps {
  character?: CharacterColor;
  size?: number;
  animate?: boolean;
  className?: string;
}

export function CharacterMascot({
  character = 'beige',
  size = 96,
  animate = true,
  className = '',
}: CharacterMascotProps) {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (!animate) return;

    // Occasional bounce animation
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [animate]);

  const imagePath = getCharacterAsset(character, 'idle');

  return (
    <div
      className={`inline-block ${className}`.trim()}
      style={{
        width: size,
        height: size,
        transform: isBouncing ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      <img
        src={imagePath}
        alt={`${character} mascot`}
        width={size}
        height={size}
        className="object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

/**
 * CharacterSelector - Grid of characters to choose from
 */
interface CharacterSelectorProps {
  selected?: CharacterColor;
  onSelect: (character: CharacterColor) => void;
  size?: number;
  className?: string;
}

const ALL_CHARACTERS: CharacterColor[] = ['beige', 'green', 'pink', 'purple', 'yellow'];

export function CharacterSelector({
  selected,
  onSelect,
  size = 64,
  className = '',
}: CharacterSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {ALL_CHARACTERS.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`
            p-2 rounded-lg border-2 transition-all
            ${selected === color 
              ? 'border-blue-500 bg-blue-100 scale-110' 
              : 'border-transparent hover:border-gray-300'
            }
          `.trim()}
        >
          <img
            src={getCharacterAsset(color, 'idle')}
            alt={color}
            width={size}
            height={size}
            className="object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * ReactionOverlay - Full-screen character reaction
 */
interface ReactionOverlayProps {
  show: boolean;
  reaction: ReactionType;
  character?: CharacterColor;
  message?: string;
  onComplete?: () => void;
}

export function ReactionOverlay({
  show,
  reaction,
  character = 'beige',
  message,
  onComplete,
}: ReactionOverlayProps) {
  if (!show) return null;

  const getMessage = () => {
    if (message) return message;
    switch (reaction) {
      case 'success':
        return 'Great job!';
      case 'failure':
        return 'Try again!';
      case 'celebrate':
        return 'Amazing!';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl">
        <CharacterReaction
          character={character}
          reaction={reaction}
          size={160}
          onComplete={onComplete}
        />
        <p className="text-2xl font-bold text-gray-800">{getMessage()}</p>
      </div>
    </div>
  );
}

export default CharacterReaction;
