/**
 * GameErrorBoundary Component
 * 
 * Error boundary specifically for games.
 * Catches errors and displays child-friendly error UI.
 * 
 * @see docs/audit/GAME_QUALITY_REMEDIATION_PLAN.md
 * @ticket GQ-004
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  gameName: string;
  onError?: (error: Error) => void;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for game components
 * 
 * @example
 * ```tsx
 * <GameErrorBoundary gameName="My Game">
 *   <MyGameComponent />
 * </GameErrorBoundary>
 * ```
 */
export class GameErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[GameErrorBoundary] ${this.props.gameName}:`, error, errorInfo);
    this.props.onError?.(error);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] p-4">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 border-3 border-red-200 shadow-[0_4px_0_#FECACA] text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-3xl font-black text-advay-slate mb-4">
              Game Paused
            </h1>
            <p className="text-lg text-text-secondary mb-6">
              {this.props.gameName} needs a quick breather. Let's restart!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-4 bg-[#10B981] hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#059669] transition-all"
            >
              Restart Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GameErrorBoundary;
