import { useState } from 'react';
import type { CollectibleItem } from '../../data/collectibles';
import { KenneyIcon, type KenneyIconType } from './KenneyIcon';
import { getKenneyIconForEmoji } from '../../utils/emojiToKenney';

interface ItemIconProps {
  item: Pick<CollectibleItem, 'id' | 'name' | 'emoji' | 'icon'>;
  size?: number;
  className?: string;
}

/**
 * ItemIcon - Displays collectible items with Kenney assets
 * 
 * Priority:
 * 1. Custom icon path if provided
 * 2. Kenney asset based on emoji mapping
 * 3. Emoji fallback
 */
export function ItemIcon({ item, size = 48, className = '' }: ItemIconProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const iconPath = item.icon;
  
  // Try to map emoji to Kenney icon
  const kenneyType: KenneyIconType | undefined = item.emoji 
    ? getKenneyIconForEmoji(item.emoji) 
    : undefined;

  // Priority 1: Custom icon path
  if (iconPath && !imageFailed) {
    return (
      <img
        src={iconPath}
        alt={item.name}
        width={size}
        height={size}
        className={`object-contain ${className}`.trim()}
        onError={() => setImageFailed(true)}
        loading="lazy"
      />
    );
  }

  // Priority 2: Kenney asset from emoji mapping
  if (kenneyType && !imageFailed) {
    return (
      <KenneyIcon
        type={kenneyType}
        size={size}
        className={className}
        fallback={item.emoji}
      />
    );
  }

  // Priority 3: Emoji fallback
  return (
    <span
      className={className}
      style={{ fontSize: Math.max(18, Math.floor(size * 0.7)), lineHeight: 1 }}
      aria-label={item.name}
      role="img"
    >
      {item.emoji}
    </span>
  );
}

export default ItemIcon;
