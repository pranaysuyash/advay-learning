import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
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
    'inline-flex items-center justify-center font-black rounded-2xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border-4 active:translate-y-[6px] active:shadow-none';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[#E85D04] text-white border-[#000000] shadow-[0_6px_0_0_#000000] hover:bg-[#ff6c14]',
    secondary:
      'bg-white text-slate-800 border-[#000000] shadow-[0_6px_0_0_#000000] hover:bg-slate-50',
    danger:
      'bg-red-500 text-white border-[#000000] shadow-[0_6px_0_0_#000000] hover:bg-red-600',
    success:
      'bg-green-500 text-white border-[#000000] shadow-[0_6px_0_0_#000000] hover:bg-green-600',
    ghost:
      'bg-transparent text-slate-600 border-transparent active:translate-y-0 active:shadow-none hover:bg-slate-100 hover:text-slate-900',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-3 text-sm gap-2',
    md: 'px-6 py-4 text-lg gap-2',
    lg: 'px-8 py-5 text-xl gap-3',
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
      sm: 18,
      md: 22,
      lg: 26,
    };

    // Exclude custom props that shouldn't hit DOM
    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !key.startsWith('full'))
    );

    return (
      <button
        ref={ref}
        className={getButtonClassName({ variant, size, fullWidth, className })}
        disabled={disabled || isLoading}
        {...domProps}
      >
        {isLoading ? (
          <>
            <span className="opacity-0">{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <UIIcon name={icon} size={iconSizes[size]} />}
            {children}
            {icon && iconPosition === 'right' && <UIIcon name={icon} size={iconSizes[size]} />}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

// Convenience exports
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

export interface ButtonLinkProps extends Omit<LinkProps, 'className' | 'to'> {
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
    sm: 18,
    md: 22,
    lg: 26,
  };

  return (
    <Link
      to={to}
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {icon && iconPosition === 'left' && <UIIcon name={icon} size={iconSizes[size]} />}
      {children}
      {icon && iconPosition === 'right' && <UIIcon name={icon} size={iconSizes[size]} />}
    </Link>
  );
}
