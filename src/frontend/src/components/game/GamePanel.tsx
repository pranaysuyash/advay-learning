import { memo } from 'react';

export interface GamePanelProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'p-4 sm:p-6',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-10',
} as const;

export const GamePanel = memo(function GamePanel({
  children,
  className = '',
  size = 'md',
}: GamePanelProps) {
  return (
    <div
      className={`bg-white rounded-2xl border-3 border-[#F2CC8F] shadow-soft ${sizeStyles[size]} ${className}`}
    >
      {children}
    </div>
  );
});
