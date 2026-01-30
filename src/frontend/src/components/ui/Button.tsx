import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { UIIcon, IconName } from './Icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading,
      fullWidth,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1a1a2e] disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-[#E85D04] to-[#F26C22] text-white border-b-4 border-[#D4561C] hover:shadow-lg hover:shadow-orange-500/30 active:border-b-0 active:translate-y-1 focus:ring-orange-500',
      secondary: 'bg-white/10 text-white border border-border hover:bg-white/20 focus:ring-white/30',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-b-4 border-red-700 hover:shadow-lg hover:shadow-red-500/30 active:border-b-0 active:translate-y-1 focus:ring-red-500',
      success: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-b-4 border-green-700 hover:shadow-lg hover:shadow-green-500/30 active:border-b-0 active:translate-y-1 focus:ring-green-500',
      ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/30',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-3 text-sm gap-2',
      lg: 'px-6 py-4 text-base gap-2',
    };

    const iconSizes = {
      sm: 16,
      md: 18,
      lg: 20,
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <UIIcon name="hourglass" size={iconSizes[size]} className="animate-pulse" />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <UIIcon name={icon} size={iconSizes[size]} />
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <UIIcon name={icon} size={iconSizes[size]} />
            )}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Convenience exports for common button patterns
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />;
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}
