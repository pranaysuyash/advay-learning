// RF-008: Re-export the base asset Icon so consumers can use a single import surface.
// New code should prefer: import { Icon, UIIcon } from '../components/ui/Icon'
// The base implementation lives in ../Icon.tsx (do not delete it).
export { Icon } from '../Icon';
import React from 'react';
import { Icon as AssetIcon } from '../Icon';
import {
  Type, Target, Timer, Flame, Hand, Pencil, Home, Check, Lock, Unlock,
  AlertTriangle, Download, Hourglass, Circle, Sparkles, Heart, Star,
  Camera, Trophy, Coffee, Droplets, Eye, EyeOff, ArrowLeft, X,
  Play, Search, RotateCcw, MousePointer2, ChevronDown, Volume2, VolumeX,
  Shield, Video, ArrowRight, Mail, AlertCircle, CheckCircle, Loader2,
  Settings, HelpCircle, UserRound, Box, Shirt, Gamepad2, Utensils
} from 'lucide-react';

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
  | 'arrow-right'
  | 'mail'
  | 'alert-circle'
  | 'check-circle'
  | 'loader'
  | 'settings'
  | 'box'
  | 'shirt'
  | 'gamepad'
  | 'utensils'
  | 'flask';

// Flask icon component (not in lucide-react)
const FlaskIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 2v8L6 20h12l-4-10V2" />
    <path d="M8 12h8" />
  </svg>
);

type UIIconNamedProps = {
  name: IconName | string; // loosen to string due to 'as any' coercions
  size?: number;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
};

type UIIconSrcProps = {
  src: string | string[];
  alt?: string;
  size?: number;
  className?: string;
  fallback?: string;
};

type UIIconProps = UIIconNamedProps | UIIconSrcProps;

const LucideMap: Record<string, React.ElementType> = {
  letters: Type,
  target: Target,
  timer: Timer,
  flame: Flame,
  hand: Hand,
  pencil: Pencil,
  home: Home,
  check: Check,
  lock: Lock,
  unlock: Unlock,
  warning: AlertTriangle,
  download: Download,
  hourglass: Hourglass,
  circle: Circle,
  sparkles: Sparkles,
  heart: Heart,
  star: Star,
  camera: Camera,
  trophy: Trophy,
  coffee: Coffee,
  drop: Droplets,
  body: UserRound,
  eye: Eye,
  'eye-off': EyeOff,
  back: ArrowLeft,
  x: X,
  play: Play,
  search: Search,
  'rotate-ccw': RotateCcw,
  'mouse-pointer': MousePointer2,
  'chevron-down': ChevronDown,
  volume: Volume2,
  'volume-off': VolumeX,
  shield: Shield,
  video: Video,
  'arrow-right': ArrowRight,
  mail: Mail,
  'alert-circle': AlertCircle,
  'check-circle': CheckCircle,
  loader: Loader2,
  settings: Settings,
  box: Box,
  shirt: Shirt,
  gamepad: Gamepad2,
  utensils: Utensils,
  flask: FlaskIcon,
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

  const {
    name,
    size = 24,
    className = '',
    color = 'currentColor',
    style,
  } = props;

  const IconComponent = (LucideMap[name as string] || HelpCircle) as React.ComponentType<{
    size?: number;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
  }>;

  // Use React.createElement to avoid TypeScript issues with dynamic components
  return React.createElement(IconComponent, {
    size,
    className: `inline-block ${className}`,
    color: color !== 'currentColor' ? color : undefined,
    style,
  });
}
