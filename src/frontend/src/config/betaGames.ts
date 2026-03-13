export const BETA_DISABLED_GAME_IDS = {} as const;

export type BetaDisabledGameId = keyof typeof BETA_DISABLED_GAME_IDS;

export function isBetaGameEnabled(gameId: string): boolean {
  return !(gameId in BETA_DISABLED_GAME_IDS);
}

export function getBetaDisabledReason(gameId: string): string | null {
  return BETA_DISABLED_GAME_IDS[gameId as BetaDisabledGameId] ?? null;
}
