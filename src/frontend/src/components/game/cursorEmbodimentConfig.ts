type CursorVariant = 'dot' | 'hand';
type EnvLike = Record<string, unknown>;

function parseEnabled(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback;
  return String(value).toLowerCase() !== 'false';
}

function parseAllowlist(value: unknown): Set<string> {
  const text = String(value ?? '').trim();
  if (!text) return new Set();
  return new Set(
    text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function resolveCursorVariant(params: {
  variant?: CursorVariant;
  gameName?: string;
  env?: EnvLike;
}): CursorVariant {
  if (params.variant) return params.variant;

  const env = params.env ?? (((import.meta as any).env ?? {}) as EnvLike);
  const enabled = parseEnabled(env.VITE_HAND_AVATAR_ENABLED, Boolean(env.DEV));
  if (!enabled) return 'dot';

  const allowlist = parseAllowlist(env.VITE_HAND_AVATAR_GAMES ?? 'EmojiMatch');
  if (allowlist.size === 0) return 'hand';
  if (!params.gameName) return 'dot';
  return allowlist.has(params.gameName) ? 'hand' : 'dot';
}

export type { CursorVariant };
