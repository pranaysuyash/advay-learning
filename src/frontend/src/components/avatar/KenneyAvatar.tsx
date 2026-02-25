import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { AvatarConfig, AvatarAnimation } from './types';
import { getAvatarImageUrl } from './types';

interface KenneyAvatarProps {
  config?: AvatarConfig | null;
  fallbackName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
  animationInterval?: number;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-lg' },
  xl: { container: 'w-24 h-24', text: 'text-2xl' },
};

/**
 * Animated Kenney Avatar Component
 * 
 * Displays a child's avatar using Kenney Platformer assets.
 * Supports animated cycling for idle/walk animations.
 * Falls back to initial letter if no avatar configured.
 */
export function KenneyAvatar({
  config,
  fallbackName = '?',
  size = 'md',
  showAnimation = true,
  animationInterval = 600,
  className = '',
  onClick,
}: KenneyAvatarProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const sizeClasses = SIZE_MAP[size];

  // Determine animation frames based on config
  const getAnimationFrames = useCallback((): AvatarAnimation[] => {
    if (!config) return ['idle'];
    
    if (config.type === 'platformer') {
      return ['idle', 'walk', 'idle', 'walk'];
    }
    if (config.type === 'animal') {
      if (config.character === 'bee' || config.character === 'ladybug' || config.character === 'mouse') {
        return ['idle', 'walk', 'idle', 'walk'];
      }
      if (config.character === 'frog') {
        return ['idle', 'jump', 'idle'];
      }
    }
    if (config.type === 'creature') {
      return ['idle', 'walk', 'idle', 'walk'];
    }
    return ['idle'];
  }, [config]);

  // Auto-cycle through animation frames
  useEffect(() => {
    if (!showAnimation || !config) return;

    const frames = getAnimationFrames();
    if (frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, animationInterval);

    return () => clearInterval(interval);
  }, [showAnimation, config, animationInterval, getAnimationFrames]);

  // Get current image URL
  const frames = getAnimationFrames();
  const currentAnimation = frames[currentFrame];
  const imageUrl = getAvatarImageUrl(config, currentAnimation);
  
  // Get fallback initial
  const initial = fallbackName.charAt(0).toUpperCase();

  // Background color based on avatar type
  const getBgColor = () => {
    if (!config) return 'bg-gradient-to-br from-orange-400 to-pink-500';
    
    switch (config.type) {
      case 'platformer':
        return 'bg-gradient-to-br from-amber-100 to-orange-100';
      case 'animal':
        return 'bg-gradient-to-br from-green-100 to-emerald-100';
      case 'creature':
        return 'bg-gradient-to-br from-purple-100 to-pink-100';
      case 'photo':
        return 'bg-gray-100';
      default:
        return 'bg-gradient-to-br from-orange-400 to-pink-500';
    }
  };

  return (
    <motion.div
      className={`
        relative inline-flex items-center justify-center 
        rounded-full overflow-hidden
        ${sizeClasses.container}
        ${getBgColor()}
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={showAnimation ? { scale: 1.05 } : undefined}
      whileTap={showAnimation ? { scale: 0.95 } : undefined}
    >
      {config ? (
        <>
          {/* Avatar Image */}
          <motion.img
            key={imageUrl}
            src={imageUrl}
            alt="Avatar"
            className={`${sizeClasses.container} object-contain p-0.5`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(false)}
          />
          
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className={`absolute inset-0 flex items-center justify-center ${sizeClasses.text} font-bold text-gray-400`}>
              {initial}
            </div>
          )}
        </>
      ) : (
        /* Fallback Initial */
        <span className={`${sizeClasses.text} font-bold text-white`}>
          {initial}
        </span>
      )}

      {/* Subtle glow effect for creatures */}
      {config?.type === 'creature' && (
        <div className="absolute inset-0 rounded-full bg-purple-400/10 animate-pulse" />
      )}
    </motion.div>
  );
}

/**
 * Avatar with Age Badge
 */
interface AvatarWithBadgeProps extends KenneyAvatarProps {
  age?: number;
  showBadge?: boolean;
}

import { getAgeBadgeColor } from './types';

export function AvatarWithBadge({
  age,
  showBadge = true,
  ...avatarProps
}: AvatarWithBadgeProps) {
  const shouldShowBadge = showBadge && age !== undefined && age > 0;

  return (
    <div className="relative inline-block">
      <KenneyAvatar {...avatarProps} />
      
      {shouldShowBadge && (
        <motion.div
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: getAgeBadgeColor(age) }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          {Math.floor(age)}
        </motion.div>
      )}
    </div>
  );
}

export default KenneyAvatar;
