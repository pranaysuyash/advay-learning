export const GROWTH_EVENTS_STORAGE_ID = 'advay-growth-events';
export const GROWTH_ATTRIBUTION_SESSION_ID = 'advay-growth-attribution';
const DEFAULT_APP_ORIGIN = 'https://advay.app';
const MAX_GROWTH_EVENTS = 50;

export type GrowthEventName =
  | 'progress_share_clicked'
  | 'progress_share_copied'
  | 'progress_share_whatsapp_opened'
  | 'shared_visit_landed'
  | 'shared_visit_cta_started';

export interface GrowthAttribution {
  ref: string;
  entry?: string;
  landingPath?: string;
  firstSeenAt: string;
}

export interface GrowthEvent {
  name: GrowthEventName;
  timestamp: string;
  payload: Record<string, string>;
}

export function getAppOrigin(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_APP_ORIGIN;
  }

  const origin = window.location.origin;
  if (!origin || origin === 'null') {
    return DEFAULT_APP_ORIGIN;
  }

  return origin;
}

export function buildProgressShareUrl(origin = getAppOrigin()): string {
  const url = new URL('/', origin);
  url.searchParams.set('ref', 'progress_share');
  url.searchParams.set('entry', 'report');
  return url.toString();
}

export function parseGrowthAttribution(
  search: string,
  landingPath = '/',
): GrowthAttribution | null {
  const params = new URLSearchParams(search);
  const ref = params.get('ref');

  if (!ref) {
    return null;
  }

  const entry = params.get('entry') ?? undefined;

  return {
    ref,
    entry,
    landingPath,
    firstSeenAt: new Date().toISOString(),
  };
}

export function persistGrowthAttribution(attribution: GrowthAttribution): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    GROWTH_ATTRIBUTION_SESSION_ID,
    JSON.stringify(attribution),
  );
}

export function getPersistedGrowthAttribution(): GrowthAttribution | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(GROWTH_ATTRIBUTION_SESSION_ID);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GrowthAttribution;
  } catch {
    return null;
  }
}

export function recordGrowthEvent(
  name: GrowthEventName,
  payload: Record<string, string> = {},
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const nextEvent: GrowthEvent = {
    name,
    timestamp: new Date().toISOString(),
    payload,
  };

  const events = getGrowthEvents();
  events.push(nextEvent);
  window.localStorage.setItem(
    GROWTH_EVENTS_STORAGE_ID,
    JSON.stringify(events.slice(-MAX_GROWTH_EVENTS)),
  );
}

export function getGrowthEvents(): GrowthEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(GROWTH_EVENTS_STORAGE_ID);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as GrowthEvent[];
  } catch {
    return [];
  }
}

export function clearGrowthTrackingState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GROWTH_EVENTS_STORAGE_ID);
  window.sessionStorage.removeItem(GROWTH_ATTRIBUTION_SESSION_ID);
}
