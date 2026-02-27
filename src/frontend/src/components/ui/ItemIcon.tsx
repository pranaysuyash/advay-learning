import { useState } from 'react';
import type { CollectibleItem } from '../../data/collectibles';

interface ItemIconProps {
  item: Pick<CollectibleItem, 'id' | 'name' | 'emoji' | 'icon'>;
  size?: number;
  className?: string;
}

export function ItemIcon({ item, size = 48, className = '' }: ItemIconProps) {
  const [failed, setFailed] = useState(false);
  const iconPath = item.icon;

  if (iconPath && !failed) {
    return (
      <img
        src={iconPath}
        alt={item.name}
        width={size}
        height={size}
        className={`object-contain ${className}`.trim()}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

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
