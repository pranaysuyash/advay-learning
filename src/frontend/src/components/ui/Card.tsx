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
        whileHover={hover ? { y: -4, boxShadow: '0 12px 0 0 rgba(0, 0, 0, 0.05)' } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`
          bg-white border-4 border-slate-200 rounded-[2rem] shadow-sm overflow-hidden transition-all
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
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm font-semibold text-slate-500">{subtitle}</p>}
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
    <div className={`mt-6 pt-4 border-t-4 border-slate-100 ${className}`}>
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
    <Card hover className="border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-800">{value}</p>
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
      <h3 className="text-2xl font-black mb-3 text-slate-800">{title}</h3>
      <p className="text-base font-semibold text-slate-500">{description}</p>
    </Card>
  );
}
