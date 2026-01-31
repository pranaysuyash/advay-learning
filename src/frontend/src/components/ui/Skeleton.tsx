import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

const WIDTH_CLASS_MAP: Record<string, string> = {
  '60%': 'skeleton-w-60p',
  '40%': 'skeleton-w-40p',
  '80%': 'skeleton-w-80p',
  '100%': 'skeleton-w-100p',
  '48': 'skeleton-w-48',
  '80': 'skeleton-w-80',
  '60': 'skeleton-w-60',
  '40': 'skeleton-w-40',
  '32': 'skeleton-w-32',
  '20': 'skeleton-w-20',
  '16': 'skeleton-w-16',
  '12': 'skeleton-w-12',
  '8': 'skeleton-w-8',
};

const HEIGHT_CLASS_MAP: Record<string, string> = {
  '48': 'skeleton-h-48',
  '40': 'skeleton-h-40',
  '32': 'skeleton-h-32',
  '20': 'skeleton-h-20',
  '16': 'skeleton-h-16',
  '12': 'skeleton-h-12',
  '8': 'skeleton-h-8',
};

const getSizeClass = (
  size: string | number | undefined,
  map: Record<string, string>,
) => {
  if (size === undefined) return '';
  return map[String(size)] ?? '';
};

export function Skeleton({
  className = '',
  width,
  height,
  circle,
}: SkeletonProps) {
  const widthClass = getSizeClass(width, WIDTH_CLASS_MAP);
  const heightClass = getSizeClass(height, HEIGHT_CLASS_MAP);

  return (
    <div
      className={`
        bg-white/10 animate-pulse
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${widthClass}
        ${heightClass}
        ${className}
      `}
    />
  );
}

// Pre-built skeleton layouts
export function SkeletonCard() {
  return (
    <div className="bg-white/10 border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton width={48} height={48} circle />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton width="100%" height={12} />
        <Skeleton width="80%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white/10 border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={32} />
        </div>
        <Skeleton width={40} height={40} circle />
      </div>
      <div className="mt-4">
        <Skeleton width="100%" height={8} />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 48 }: { size?: number }) {
  return <Skeleton width={size} height={size} circle />;
}

export function SkeletonText({
  lines = 1,
  width = '100%',
}: {
  lines?: number;
  width?: string | string[];
}) {
  const widths = Array.isArray(width) ? width : Array(lines).fill(width);
  
  return (
    <div className="space-y-2">
      {widths.map((w, i) => (
        <Skeleton key={i} width={w} height={16} />
      ))}
    </div>
  );
}

// Loading state wrapper
interface LoadingProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}

export function Loading({ isLoading, skeleton, children }: LoadingProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }
  return <>{children}</>;
}
