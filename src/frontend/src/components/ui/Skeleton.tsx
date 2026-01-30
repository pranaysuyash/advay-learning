import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({
  className = '',
  width,
  height,
  circle,
}: SkeletonProps) {
  return (
    <div
      className={`
        bg-white/10 animate-pulse
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

// Pre-built skeleton layouts
export function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
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
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
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
