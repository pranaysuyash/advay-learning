import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  clearAlphabetGameSession,
  loadAlphabetGameSession,
  saveAlphabetGameSession,
  warnAlphabetGame,
  type AlphabetGameSessionState,
} from '../sessionPersistence';
import { ALPHABET_GAME_SESSION_KEY, SESSION_TTL_MS } from '../constants';

describe('alphabet game session persistence', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  const sessionState: AlphabetGameSessionState = {
    currentLetterIndex: 2,
    score: 42,
    streak: 3,
    selectedLanguage: 'en',
    useMouseMode: false,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.clear();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('saves and loads a valid session', () => {
    saveAlphabetGameSession(sessionState);

    const loaded = loadAlphabetGameSession();

    expect(loaded).toEqual(sessionState);
  });

  it('returns null for expired session', () => {
    const expired = {
      ...sessionState,
      timestamp: Date.now() - SESSION_TTL_MS - 1,
    };
    localStorage.setItem(ALPHABET_GAME_SESSION_KEY, JSON.stringify(expired));

    const loaded = loadAlphabetGameSession();

    expect(loaded).toBeNull();
  });

  it('returns null and warns for malformed payload', () => {
    localStorage.setItem(ALPHABET_GAME_SESSION_KEY, '{bad json}');

    const loaded = loadAlphabetGameSession();

    expect(loaded).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('clears session safely', () => {
    saveAlphabetGameSession(sessionState);
    clearAlphabetGameSession();

    expect(localStorage.getItem(ALPHABET_GAME_SESSION_KEY)).toBeNull();
  });

  it('warn helper includes context', () => {
    warnAlphabetGame('testing warning path');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[AlphabetGame] testing warning path',
    );
  });
});
