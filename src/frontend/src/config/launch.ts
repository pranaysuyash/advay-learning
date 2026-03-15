const env = (import.meta as any).env ?? {};

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  }
  return fallback;
}

export const SUPPORT_EMAIL = env.VITE_SUPPORT_EMAIL || 'support@advay.app';
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}`;
export const BETA_FREE_ACCESS = toBool(env.VITE_BETA_FREE_ACCESS, true);
export const BETA_LABEL = env.VITE_BETA_LABEL || 'Public beta';
export const BETA_END_DATE = env.VITE_BETA_END_DATE || 'March 31, 2026';
export const BETA_LOCAL_AI_ENABLED = toBool(env.VITE_BETA_LOCAL_AI_ENABLED, false);
export const BETA_3D_GAMES_ENABLED = toBool(env.VITE_BETA_3D_GAMES_ENABLED, false);

export const SUPPORTED_DEVICES = [
  'Android Chrome (current and previous major)',
  'iPhone/iPad Safari (current and previous major)',
  'Desktop Chrome, Edge, and Safari (current and previous major)',
  'Firefox (best effort during beta)',
] as const;
