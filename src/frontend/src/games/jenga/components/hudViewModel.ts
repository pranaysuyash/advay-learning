import type { GameMode } from '../config/constants';
import type { JengaGameState } from '../domain/GameState';

export interface HudViewModel {
  modeColor: string;
  copySize: string;
  headingSize: string;
  buttonSize: string;
  canRoll: boolean;
  canCancel: boolean;
  canPlace: boolean;
  stabilityPercent: number;
  stabilityColor: string;
  stabilityEmoji: string;
}

function getModeColor(mode: GameMode): string {
  const modeColors: Record<GameMode, string> = {
    classic: 'bg-emerald-500',
    diceSingle: 'bg-amber-400',
    diceDouble: 'bg-orange-500',
    math: 'bg-sky-500',
  };
  return modeColors[mode];
}

function getStabilityPercent(gameState: JengaGameState): number {
  return Math.max(0, Math.min(100, Math.round((gameState.getStats().stability ?? 0) * 100)));
}

function getStabilityColor(stabilityPercent: number): string {
  if (stabilityPercent > 70) {
    return 'bg-emerald-400';
  }
  if (stabilityPercent > 40) {
    return 'bg-amber-400';
  }
  return 'bg-rose-500';
}

function getStabilityEmoji(stabilityPercent: number): string {
  if (stabilityPercent > 70) {
    return '😊';
  }
  if (stabilityPercent > 40) {
    return '😬';
  }
  return '😱';
}

export function buildHudViewModel(
  gameState: JengaGameState,
  largeText: boolean,
  onRollDice?: () => void,
  onCancelGrab?: () => void,
  onPlaceOnTop?: () => void,
): HudViewModel {
  const stabilityPercent = getStabilityPercent(gameState);
  return {
    modeColor: getModeColor(gameState.gameMode),
    copySize: largeText ? 'text-base' : 'text-sm',
    headingSize: largeText ? 'text-[1.65rem]' : 'text-2xl',
    buttonSize: largeText ? 'text-base py-3.5' : 'text-sm py-3',
    canRoll:
      Boolean(onRollDice) &&
      gameState.shouldShowTargetNumbers &&
      gameState.phase === 'select' &&
      !gameState.isGameOver,
    canCancel: Boolean(onCancelGrab) && (gameState.phase === 'grab' || gameState.phase === 'extract'),
    canPlace: Boolean(onPlaceOnTop) && gameState.phase === 'place' && !gameState.isGameOver,
    stabilityPercent,
    stabilityColor: getStabilityColor(stabilityPercent),
    stabilityEmoji: getStabilityEmoji(stabilityPercent),
  };
}
