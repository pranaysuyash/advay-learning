/**
 * React hook for tracking window dimensions.
 * Provides reactive window size updates with proper cleanup.
 *
 * @example
 * ```tsx
 * import { useWindowSize } from '../hooks/useWindowSize';
 *
 * function MyComponent() {
 *   const { width, height } = useWindowSize();
 *
 *   return (
 *     <div>
 *       Window: {width} × {height}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Window dimensions interface.
 */
export interface WindowSize {
  /** Window width in pixels */
  width: number;
  /** Window height in pixels */
  height: number;
}

/**
 * Get the initial window size (server-safe).
 */
function getInitialWindowSize(): WindowSize {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 }; // Default for SSR
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Hook for tracking window size changes.
 *
 * @returns Current window dimensions
 *
 * @example
 * ```tsx
 * function ResponsiveGame() {
 *   const { width, height } = useWindowSize();
 *
 *   const isMobile = width < 768;
 *   const isTablet = width >= 768 && width < 1024;
 *   const isDesktop = width >= 1024;
 *
 *   return (
 *     <div className={isMobile ? 'mobile' : 'desktop'}>
 *       Game content
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(getInitialWindowSize);

  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') {
      return;
    }

    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}

/**
 * Breakpoint thresholds for common device sizes.
 */
export const Breakpoints = {
  /** Mobile devices (portrait phones, smaller tablets) */
  mobile: 768,

  /** Tablet devices (portrait tablets, landscape phones) */
  tablet: 1024,

  /** Desktop devices (laptops, desktops) */
  desktop: 1280,
} as const;

/**
 * Helper hook for breakpoint detection.
 *
 * @returns Object with boolean flags for each breakpoint
 *
 * @example
 * ```tsx
 * function GameLayout() {
 *   const { isMobile, isTablet, isDesktop } = useBreakpoints();
 *
 *   if (isMobile) return <MobileLayout />;
 *   if (isTablet) return <TabletLayout />;
 *   return <DesktopLayout />;
 * }
 * ```
 */
export function useBreakpoints() {
  const { width } = useWindowSize();

  return {
    isMobile: width < Breakpoints.mobile,
    isTablet: width >= Breakpoints.mobile && width < Breakpoints.tablet,
    isDesktop: width >= Breakpoints.tablet,
  };
}
