import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { UIIcon, IconName } from './Icon';
import { Link, type LinkProps } from 'react-router-dom';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

type ButtonVariant = NonNullable<ButtonProps['variant']>;
type ButtonSize = NonNullable<ButtonProps['size']>;

function getButtonClassName({
  variant,
  size,
  fullWidth,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-pip-orange text-white shadow-soft hover:bg-pip-rust hover:shadow-soft-lg active:bg-pip-rust focus:ring-pip-orange',
    secondary:
      'bg-white text-advay-slate border border-border shadow-soft hover:bg-bg-tertiary hover:shadow-soft-lg active:bg-bg-tertiary focus:ring-vision-blue',
    danger:
      'bg-error text-white shadow-soft hover:bg-red-700 hover:shadow-soft-lg active:bg-red-700 focus:ring-red-500',
    success:
      'bg-success text-white shadow-soft hover:bg-success-hover hover:shadow-soft-lg active:bg-success-hover focus:ring-success',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary focus:ring-vision-blue',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-3 text-sm gap-1.5 min-h-[44px]', // WCAG: 44x44px minimum touch target (adult)
    md: 'px-5 py-4 text-sm gap-2 min-h-[52px]', // Larger for kids (52px)
    lg: 'px-6 py-4 text-base gap-2 min-h-[60px]', // Kid-friendly large (60px)
  };

  return `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className ?? ''}
  `;
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
    ref,
  ) => {
    const iconSizes = {
      sm: 16,
      md: 18,
      lg: 20,
    };

    // Exclude any remaining custom props from DOM
    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !key.startsWith('full'))
    );

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={getButtonClassName({ variant, size, fullWidth, className })}
        disabled={disabled || isLoading}
        {...domProps}
      >
        {isLoading ? (
          <>
            <UIIcon
              name='hourglass'
              size={iconSizes[size]}
              className='animate-pulse'
            />
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
  },
);

Button.displayName = 'Button';

// Convenience exports for common button patterns
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant='primary' {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant='secondary' {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant='danger' {...props} />;
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant='success' {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant='ghost' {...props} />;
}

export interface ButtonLinkProps
  extends Omit<LinkProps, 'className' | 'to'> {
  to: LinkProps['to'];
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  icon?: IconName;
  iconPosition?: ButtonProps['iconPosition'];
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth,
  children,
  className,
  ...props
}: ButtonLinkProps) {
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  return (
    <Link
      to={to}
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <UIIcon name={icon} size={iconSizes[size]} />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <UIIcon name={icon} size={iconSizes[size]} />
      )}
    </Link>
  );
}
