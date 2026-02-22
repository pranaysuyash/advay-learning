import React from 'react';
import { Icon as AssetIcon } from '../Icon';
import {
  Type, Target, Timer, Flame, Hand, Pencil, Home, Check, Lock, Unlock,
  AlertTriangle, Download, Hourglass, Circle, Sparkles, Heart, Star,
  Camera, Trophy, Coffee, Droplets, User, Eye, EyeOff, ArrowLeft, X,
  Play, Search, RotateCcw, MousePointer2, ChevronDown, Volume2, VolumeX,
  Shield, Video, ArrowRight, Mail, AlertCircle, CheckCircle, Loader2,
  Settings, HelpCircle, UserRound
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
  | 'settings';

type UIIconNamedProps = {
  name: IconName | string; // loosen to string due to 'as any' coercions
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

  const IconComponent = LucideMap[name as string] || HelpCircle;

  return (
    <IconComponent
      size={size}
      className={`inline-block ${className}`}
      color={color !== 'currentColor' ? color : undefined}
    />
  );
}
