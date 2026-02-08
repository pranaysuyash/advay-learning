import { useState } from 'react';
import { Icon as AssetIcon } from '../Icon';

export type IconName =
  | 'letters'
  | 'target'
  | 'timer'
  | 'flame'
  | 'hand'
  | 'pencil'
  | 'home'
  | 'check'
  | 'lock'
  | 'unlock'
  | 'warning'
  | 'download'
  | 'hourglass'
  | 'circle'
  | 'sparkles'
  | 'heart'
  | 'star'
  | 'camera'
  | 'trophy'
  | 'coffee'
  | 'drop'
  | 'body'
  | 'eye'
  | 'eye-off'
  | 'back'
  | 'x'
  | 'play'
  | 'search'
  | 'rotate-ccw'
  | 'mouse-pointer'
  | 'chevron-down'
  | 'volume'
  | 'volume-off'
  | 'shield'
  | 'video'
  | 'arrow-right';

type UIIconNamedProps = {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
};

type UIIconSrcProps = {
  src: string | string[];
  alt?: string;
  size?: number;
  className?: string;
  fallback?: string;
};

type UIIconProps = UIIconNamedProps | UIIconSrcProps;

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
  coffee: '/assets/icons/ui/coffee.svg',
  drop: '/assets/icons/ui/drop.svg',
  body: '/assets/icons/ui/body.svg',
  eye: '/assets/icons/ui/eye.svg',
  'eye-off': '/assets/icons/ui/eye-off.svg',
  back: '/assets/icons/ui/back.svg',
  x: '/assets/icons/ui/x.svg',
  play: '/assets/icons/ui/play.svg',
  search: '/assets/icons/ui/search.svg',
  'rotate-ccw': '/assets/icons/ui/rotate-ccw.svg',
  'mouse-pointer': '/assets/icons/ui/mouse-pointer.svg',
  'chevron-down': '/assets/icons/ui/chevron-down.svg',
  'volume': '/assets/icons/ui/volume.svg',
  'volume-off': '/assets/icons/ui/volume-off.svg',
  'shield': '/assets/icons/ui/shield.svg',
  'video': '/assets/icons/ui/video.svg',
  'arrow-right': '/assets/icons/ui/arrow-right.svg',
};

export function UIIcon(props: UIIconProps) {
  if ('src' in props) {
    const { src, alt = '', size = 24, className = '', fallback } = props;
    return (
      <AssetIcon
        src={src}
        alt={alt}
        size={size}
        className={className}
        fallback={fallback}
      />
    );
  }

  const { name, size = 24, className = '', color = 'currentColor' } = props;
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
