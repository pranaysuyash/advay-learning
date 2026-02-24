import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '../../utils/hooks/useAudio';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hover = false, onClick, padding = 'md' }, ref) => {
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const { playHover, playClick } = useAudio();

    const handleClick = () => {
      if (onClick) {
        playClick();
        onClick();
      }
    };

    return (
      <motion.div
        ref={ref}
        onClick={onClick ? handleClick : undefined}
        onMouseEnter={hover ? playHover : undefined}
        whileHover={hover ? { y: -4, boxShadow: '0 12px 0 0 rgba(0, 0, 0, 0.05)' } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`
          bg-white border-3 border-[#F2CC8F] rounded-[2rem] shadow-[0_4px_0_#E5B86E] overflow-hidden transition-all
          ${paddings[padding]}
          ${hover ? 'cursor-pointer hover:border-[#3B82F6]' : ''}
          ${className}
        `}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-text-secondary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-black text-advay-slate tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm font-semibold text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t-4 border-[#F2CC8F] ${className}`}>
      {children}
    </div>
  );
}

// Specialized card variants
export function StatCard({
  label,
  value,
  icon,
  trend,
  trendUp,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card hover className="border-[#F2CC8F]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-black text-advay-slate">{value}</p>
          {trend && (
            <p className={`text-sm font-bold mt-2 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card hover={!!onClick} onClick={onClick} className="text-center group">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 group-hover:bg-[#3B82F6]/10 flex items-center justify-center text-slate-400 group-hover:text-[#3B82F6] transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-3 text-advay-slate">{title}</h3>
      <p className="text-base font-semibold text-text-secondary">{description}</p>
    </Card>
  );
}
