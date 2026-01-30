import { useState, useMemo } from 'react';

interface IconProps {
  /** Single icon path or array of paths (first available will be shown) */
  src: string | string[];
  /** Alt text for accessibility */
  alt?: string;
  /** Size in pixels (width and height) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Fallback emoji if icon fails to load */
  fallback?: string;
}

/**
 * Icon component that renders SVG icons from the assets folder.
 * 
 * Usage:
 * <Icon src="/assets/icons/apple.svg" alt="Apple" size={32} />
 * <Icon src={['/assets/icons/apple.svg', '/assets/icons/ball.svg']} size={24} />
 */
export function Icon({ src, alt = '', size = 32, className = '', fallback = '✨' }: IconProps) {
  const [hasError, setHasError] = useState(false);
  const [index, setIndex] = useState(0);

  // Get the current icon path (supports string or array of candidates)
  const iconSrc = useMemo(() => {
    if (Array.isArray(src)) {
      return src[index] || '';
    }
    return src;
  }, [src, index]);

  // Don't render if no icon source
  if (!iconSrc) {
    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.7 }}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  // Show fallback if all icon candidates failed to load
  if (hasError) {
    return (
      <span 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size * 0.7 }}
        role="img"
        aria-label={alt}
      >
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={iconSrc}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      onError={() => {
        // If multiple candidates are provided, try the next one before showing fallback
        if (Array.isArray(src) && index < src.length - 1) {
          setIndex(i => i + 1);
        } else {
          setHasError(true);
        }
      }}
      loading="lazy"
    />
  );
}
