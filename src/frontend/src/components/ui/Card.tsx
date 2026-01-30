import { ReactNode, forwardRef } from 'react';
import { motion } from 'framer-motion';

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

    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        whileHover={hover ? { y: -2, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`
          bg-white/10 border border-border rounded-2xl backdrop-blur-sm shadow-sm
          ${paddings[padding]}
          ${hover ? 'cursor-pointer' : ''}
          ${className}
        `}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for consistent layouts
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
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
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
    <div className={`mt-6 pt-4 border-t border-border ${className}`}>
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
    <Card hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80">
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
    <Card hover={!!onClick} onClick={onClick} className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </Card>
  );
}
