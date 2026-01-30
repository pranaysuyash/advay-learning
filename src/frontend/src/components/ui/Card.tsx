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
        whileHover={hover ? { y: -2, boxShadow: '0 10px 30px rgba(61, 64, 91, 0.12)' } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`
          bg-white border border-border rounded-2xl shadow-soft
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
          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-text-secondary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
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
          <p className="text-sm text-text-secondary mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-green-700' : 'text-red-700'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-text-secondary">
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
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-tertiary flex items-center justify-center text-text-secondary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </Card>
  );
}
