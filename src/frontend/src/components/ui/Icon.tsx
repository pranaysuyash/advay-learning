import { useState } from 'react';

export type IconName = 
  | 'letters' | 'target' | 'timer' | 'flame' | 'hand' | 'pencil' | 'home'
  | 'check' | 'lock' | 'unlock' | 'warning' | 'download' | 'hourglass'
  | 'circle' | 'sparkles' | 'heart' | 'star' | 'camera' | 'trophy';

interface UIIconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
}

const iconPaths: Record<IconName, string> = {
  letters: '/assets/icons/ui/letters.svg',
  target: '/assets/icons/ui/target.svg',
  timer: '/assets/icons/ui/timer.svg',
  flame: '/assets/icons/ui/flame.svg',
  hand: '/assets/icons/ui/hand.svg',
  pencil: '/assets/icons/ui/pencil.svg',
  home: '/assets/icons/ui/home.svg',
  check: '/assets/icons/ui/check.svg',
  lock: '/assets/icons/ui/lock.svg',
  unlock: '/assets/icons/ui/unlock.svg',
  warning: '/assets/icons/ui/warning.svg',
  download: '/assets/icons/ui/download.svg',
  hourglass: '/assets/icons/ui/hourglass.svg',
  circle: '/assets/icons/ui/circle.svg',
  sparkles: '/assets/icons/ui/sparkles.svg',
  heart: '/assets/icons/ui/heart.svg',
  star: '/assets/icons/ui/star.svg',
  camera: '/assets/icons/ui/camera.svg',
  trophy: '/assets/icons/ui/trophy.svg',
};

export function UIIcon({ name, size = 24, className = '', color = 'currentColor' }: UIIconProps) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.7 }}
      >
        ✦
      </span>
    );
  }
  
  return (
    <img
      src={iconPaths[name]}
      alt={name}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ color }}
      onError={() => setHasError(true)}
    />
  );
}
