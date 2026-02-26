/**
 * useCalmMode Hook
 * Provides access to calm mode state and derived properties
 * 
 * This file exists separately from CalmModeProvider.tsx to avoid ESLint
 * react-refresh warnings about mixing components and hooks in one file.
 */
import { useSettingsStore } from '../store';

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
