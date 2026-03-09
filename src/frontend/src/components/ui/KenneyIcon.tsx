/**
 * KenneyIcon Component
 * 
 * Provides consistent icon rendering using Kenney assets.
 * Replaces emoji usage with professional game UI icons.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

import { useState } from 'react';

export type KenneyIconType = 
  // Collectibles
  | 'coin' 
  | 'gem' 
  | 'star'
  // Hearts/Lives
  | 'heart'
  | 'heart_half'
  | 'heart_empty'
  // UI Actions
  | 'check'
  | 'cross'
  | 'circle'
  // Keys
  | 'key_blue'
  | 'key_green'
  | 'key_red'
  | 'key_yellow'
  // Locks
  | 'lock_blue'
  | 'lock_green'
  | 'lock_red'
  | 'lock_yellow';

interface KenneyIconProps {
  type: KenneyIconType;
  size?: number;
  className?: string;
  fallback?: string; // Emoji fallback if asset fails
}

/**
 * Maps icon types to their asset paths
 */
const ICON_PATHS: Record<KenneyIconType, string> = {
  // Collectibles from platformer pack
  coin: '/assets/kenney/platformer/collectibles/coin_gold.png',
  gem: '/assets/kenney/platformer/collectibles/gem_blue.png',
  star: '/assets/kenney/platformer/collectibles/star.png',
  
  // Hearts from platformer HUD
  heart: '/assets/kenney/platformer/hud/hud_heart.png',
  heart_half: '/assets/kenney/platformer/hud/hud_heart_half.png',
  heart_empty: '/assets/kenney/platformer/hud/hud_heart_empty.png',
  
  // UI icons from platformer tiles
  check: '/assets/kenney/platformer/tiles/switch_green.png',
  cross: '/assets/kenney/platformer/tiles/switch_red.png',
  circle: '/assets/kenney/platformer/tiles/coin_gold.png',
  
  // Keys from platformer HUD
  key_blue: '/assets/kenney/platformer/hud/hud_key_blue.png',
  key_green: '/assets/kenney/platformer/hud/hud_key_green.png',
  key_red: '/assets/kenney/platformer/hud/hud_key_red.png',
  key_yellow: '/assets/kenney/platformer/hud/hud_key_yellow.png',
  
  // Locks from platformer tiles
  lock_blue: '/assets/kenney/platformer/tiles/lock_blue.png',
  lock_green: '/assets/kenney/platformer/tiles/lock_green.png',
  lock_red: '/assets/kenney/platformer/tiles/lock_red.png',
  lock_yellow: '/assets/kenney/platformer/tiles/lock_yellow.png',
};

/**
 * Default emoji fallbacks for each icon type
 */
const ICON_FALLBACKS: Record<KenneyIconType, string> = {
  coin: '🪙',
  gem: '💎',
  star: '⭐',
  heart: '❤️',
  heart_half: '💔',
  heart_empty: '🤍',
  check: '✓',
  cross: '✕',
  circle: '●',
  key_blue: '🔵',
  key_green: '🟢',
  key_red: '🔴',
  key_yellow: '🟡',
  lock_blue: '🔒',
  lock_green: '🔒',
  lock_red: '🔒',
  lock_yellow: '🔒',
};

/**
 * KenneyIcon - Renders Kenney game assets as icons
 * 
 * Usage:
 * ```tsx
 * <KenneyIcon type="heart" size={32} />
 * <KenneyIcon type="coin" size={24} className="inline-block" />
 * ```
 */
export function KenneyIcon({ 
  type, 
  size = 32, 
  className = '',
  fallback
}: KenneyIconProps) {
  const [failed, setFailed] = useState(false);
  const iconPath = ICON_PATHS[type];
  const fallbackEmoji = fallback || ICON_FALLBACKS[type];

  if (!failed) {
    return (
      <img
        src={iconPath}
        alt={type}
        width={size}
        height={size}
        className={`object-contain inline-block ${className}`.trim()}
        onError={() => setFailed(true)}
        loading="lazy"
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  // Fallback to emoji if image fails
  return (
    <span
      className={`inline-block ${className}`.trim()}
      style={{ 
        fontSize: Math.max(16, Math.floor(size * 0.75)), 
        lineHeight: 1,
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label={type}
      role="img"
    >
      {fallbackEmoji}
    </span>
  );
}

/**
 * KenneyIconSet - Renders multiple icons in a row
 * 
 * Usage:
 * ```tsx
 * <KenneyIconSet type="heart" count={3} size={24} />
 * ```
 */
interface KenneyIconSetProps {
  type: KenneyIconType;
  count: number;
  size?: number;
  className?: string;
  gap?: number;
}

export function KenneyIconSet({ 
  type, 
  count, 
  size = 24, 
  className = '',
  gap = 4
}: KenneyIconSetProps) {
  return (
    <div 
      className={`flex items-center ${className}`.trim()}
      style={{ gap: `${gap}px` }}
    >
      {Array.from({ length: count }, (_, i) => (
        <KenneyIcon key={i} type={type} size={size} />
      ))}
    </div>
  );
}

/**
 * LivesDisplay - Specialized component for showing lives/hearts
 * 
 * Usage:
 * ```tsx
 * <LivesDisplay current={2} max={3} size={32} />
 * ```
 */
interface LivesDisplayProps {
  current: number;
  max: number;
  size?: number;
  className?: string;
}

export function LivesDisplay({ 
  current, 
  max, 
  size = 32, 
  className = '' 
}: LivesDisplayProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      {Array.from({ length: max }, (_, i) => {
        const heartType = i < current ? 'heart' : 'heart_empty';
        return (
          <KenneyIcon 
            key={i} 
            type={heartType} 
            size={size}
            fallback={i < current ? '❤️' : '🤍'}
          />
        );
      })}
    </div>
  );
}

/**
 * ScoreDisplay - Shows score with coin/star icon
 * 
 * Usage:
 * ```tsx
 * <ScoreDisplay score={150} icon="star" size={24} />
 * ```
 */
interface ScoreDisplayProps {
  score: number;
  icon?: 'coin' | 'gem' | 'star';
  size?: number;
  className?: string;
}

export function ScoreDisplay({ 
  score, 
  icon = 'coin', 
  size = 24, 
  className = '' 
}: ScoreDisplayProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <KenneyIcon type={icon} size={size} />
      <span className="font-bold text-lg">{score}</span>
    </div>
  );
}

export default KenneyIcon;
