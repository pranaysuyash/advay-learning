import {
  ALPHABET_GAME_SESSION_KEY,
  SESSION_TTL_MS,
} from './constants';

export interface AlphabetGameSessionState {
  currentLetterIndex: number;
  score: number;
  streak: number;
  selectedLanguage: string;
  useMouseMode: boolean;
  timestamp: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSessionState = (value: unknown): value is AlphabetGameSessionState => {
  if (!isRecord(value)) return false;

  return (
    typeof value.currentLetterIndex === 'number' &&
    typeof value.score === 'number' &&
    typeof value.streak === 'number' &&
    typeof value.selectedLanguage === 'string' &&
    typeof value.useMouseMode === 'boolean' &&
    typeof value.timestamp === 'number'
  );
};

export const warnAlphabetGame = (context: string, error?: unknown): void => {
  if (error instanceof Error) {
    console.warn(`[AlphabetGame] ${context}: ${error.message}`);
    return;
  }

  if (error !== undefined) {
    console.warn(`[AlphabetGame] ${context}:`, error);
    return;
  }

  console.warn(`[AlphabetGame] ${context}`);
};

export const loadAlphabetGameSession = (): AlphabetGameSessionState | null => {
  try {
    const saved = localStorage.getItem(ALPHABET_GAME_SESSION_KEY);
    if (!saved) return null;

    const parsed: unknown = JSON.parse(saved);
    if (!isSessionState(parsed)) {
      warnAlphabetGame('Invalid session payload in localStorage');
      return null;
    }

    if (Date.now() - parsed.timestamp > SESSION_TTL_MS) {
      return null;
    }

    return parsed;
  } catch (error) {
    warnAlphabetGame('Failed loading session', error);
    return null;
  }
};

export const saveAlphabetGameSession = (
  state: AlphabetGameSessionState,
): void => {
  try {
    localStorage.setItem(ALPHABET_GAME_SESSION_KEY, JSON.stringify(state));
  } catch (error) {
    warnAlphabetGame('Failed saving session', error);
  }
};

export const clearAlphabetGameSession = (): void => {
  try {
    localStorage.removeItem(ALPHABET_GAME_SESSION_KEY);
  } catch (error) {
    warnAlphabetGame('Failed clearing session', error);
  }
};
