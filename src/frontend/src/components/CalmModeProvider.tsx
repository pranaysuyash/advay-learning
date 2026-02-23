/**
 * CalmModeProvider
 * 
 * Applies Calm Mode styles globally to the application.
 * When Calm Mode is enabled:
 * - Muted color palette (pastels instead of bright primaries)
 * - Slower animations
 * - Reduced visual stimulation
 * 
 * Based on Dr. Meera Sharma's recommendations for sensory-sensitive children.
 */

import { useEffect } from 'react';
import { useSettingsStore } from '../store';

interface CalmModeProviderProps {
  children: React.ReactNode;
}

export function CalmModeProvider({ children }: CalmModeProviderProps) {
  const calmMode = useSettingsStore((state) => state.calmMode);

  // Apply calm mode classes to document body
  useEffect(() => {
    if (calmMode) {
      document.body.classList.add('calm-mode-active');
      document.documentElement.style.setProperty('--app-background', '#F5F5F0');
      document.documentElement.style.setProperty('--animation-speed', '2');
    } else {
      document.body.classList.remove('calm-mode-active');
      document.documentElement.style.removeProperty('--app-background');
      document.documentElement.style.removeProperty('--animation-speed');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('calm-mode-active');
      document.documentElement.style.removeProperty('--app-background');
      document.documentElement.style.removeProperty('--animation-speed');
    };
  }, [calmMode]);

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 ${
        calmMode ? 'bg-[#F5F5F0]' : ''
      }`}
      data-calm-mode={calmMode ? 'true' : 'false'}
    >
      {children}
    </div>
  );
}

/**
 * Hook to get calm mode status and derived properties
 */
export function useCalmModeContext() {
  const calmMode = useSettingsStore((state) => state.calmMode);
  
  return {
    isCalmMode: calmMode,
    animationMultiplier: calmMode ? 2 : 1,
    colors: calmMode ? {
      background: '#F5F5F0',
      primary: '#7C9CB5',
      accent: '#B8A89A',
      success: '#8FB996',
      border: '#E8E4E0',
      text: '#5A5A5A',
    } : {
      background: '#FFF8F0',
      primary: '#3B82F6',
      accent: '#E85D04',
      success: '#10B981',
      border: '#F2CC8F',
      text: '#1E293B',
    },
  };
}
