export const LAUNCH_ANALYTICS_STORAGE_KEY = 'advay.launch.analytics.v1';
export const LAUNCH_ANALYTICS_SESSION_KEY = 'advay.launch.session.v1';
const MAX_EVENTS = 1000;

export type LaunchEventName =
  | 'page_view'
  | 'cta_clicked'
  | 'nav_link_clicked'
  | 'support_contact_clicked'
  | 'register_started'
  | 'register_completed'
  | 'register_failed'
  | 'login_started'
  | 'login_completed'
  | 'login_failed'
  | 'email_verification_sent'
  | 'email_verification_completed'
  | 'email_verification_failed'
  | 'consent_started'
  | 'consent_email_sent'
  | 'consent_code_submitted'
  | 'consent_completed'
  | 'consent_failed'
  | 'consent_abandoned'
  | 'camera_permission_prompted'
  | 'camera_permission_granted'
  | 'camera_permission_denied'
  | 'child_profile_created'
  | 'child_profile_selected'
  | 'child_profile_deleted'
  | 'local_avatar_selected'
  | 'game_card_clicked'
  | 'game_launched'
  | 'game_session_started'
  | 'game_session_ended'
  | 'progress_queued'
  | 'progress_queue_failed'
  | 'pricing_interest_clicked'
  | 'beta_pricing_viewed'
  | 'subscription_blocked_for_beta'
  | 'export_summary_viewed'
  | 'export_requested'
  | 'export_downloaded'
  | 'account_delete_initiated'
  | 'account_delete_completed'
  | 'account_delete_cancelled'
  | 'profile_delete_initiated'
  | 'profile_delete_completed'
  | 'profile_delete_cancelled'
  | 'recoverable_client_error'
  | 'fatal_client_error'
  | 'api_failure'
  | 'pending_badge_clicked'
  | 'failed_badge_clicked'
  | 'progress_sync_result';

export interface LaunchAnalyticsEvent {
  id: string;
  name: LaunchEventName;
  timestamp: string;
  sessionId: string;
  route: string;
  context: {
    viewport: string;
    browser: string;
    os: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
  };
  metadata: Record<string, string | number | boolean | null>;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = window.sessionStorage.getItem(LAUNCH_ANALYTICS_SESSION_KEY);
  if (existing) return existing;
  const next = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  window.sessionStorage.setItem(LAUNCH_ANALYTICS_SESSION_KEY, next);
  return next;
}

function getRoute(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}

function getContext(): LaunchAnalyticsEvent['context'] {
  if (typeof window === 'undefined') {
    return { viewport: 'unknown', browser: 'unknown', os: 'unknown', deviceType: 'desktop' };
  }

  const width = window.innerWidth;
  const userAgent = window.navigator.userAgent;
  const browser = /Edg\//.test(userAgent)
    ? 'edge'
    : /Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)
      ? 'chrome'
      : /Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)
        ? 'safari'
        : /Firefox\//.test(userAgent)
          ? 'firefox'
          : 'other';
  const os = /iPhone|iPad|iPod/.test(userAgent)
    ? 'ios'
    : /Android/.test(userAgent)
      ? 'android'
      : /Mac OS X/.test(userAgent)
        ? 'macos'
        : /Windows/.test(userAgent)
          ? 'windows'
          : 'other';
  const deviceType = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

  return {
    viewport: `${width}x${window.innerHeight}`,
    browser,
    os,
    deviceType,
  };
}

function sanitizeMetadata(
  metadata: Record<string, unknown>,
): Record<string, string | number | boolean | null> {
  const blockedPattern = /(email|password|token|photo|image|video|frame|cameraData|name)$/i;
  return Object.entries(metadata).reduce<Record<string, string | number | boolean | null>>((acc, [key, value]) => {
    if (blockedPattern.test(key)) return acc;
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value === null
    ) {
      acc[key] = value;
      return acc;
    }
    if (Array.isArray(value)) {
      acc[key] = value.join(',');
      return acc;
    }
    if (value && typeof value === 'object') {
      acc[key] = JSON.stringify(value);
      return acc;
    }
    return acc;
  }, {});
}

export function trackLaunchEvent(
  name: LaunchEventName,
  metadata: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;

  const event: LaunchAnalyticsEvent = {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    route: getRoute(),
    context: getContext(),
    metadata: sanitizeMetadata(metadata),
  };

  const existing = getLaunchEvents();
  window.localStorage.setItem(
    LAUNCH_ANALYTICS_STORAGE_KEY,
    JSON.stringify([...existing, event].slice(-MAX_EVENTS)),
  );
}

export function trackPageView(page: string, metadata: Record<string, unknown> = {}): void {
  trackLaunchEvent('page_view', { page, ...metadata });
}

export function getLaunchEvents(): LaunchAnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(LAUNCH_ANALYTICS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LaunchAnalyticsEvent[];
  } catch {
    return [];
  }
}

export function clearLaunchAnalytics(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LAUNCH_ANALYTICS_STORAGE_KEY);
}

export function getLaunchAnalyticsSummary() {
  const events = getLaunchEvents();
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.name] = (acc[event.name] || 0) + 1;
    return acc;
  }, {});

  const topGames = events
    .filter((event) => event.metadata.gameId)
    .reduce<Record<string, number>>((acc, event) => {
      const gameId = String(event.metadata.gameId);
      acc[gameId] = (acc[gameId] || 0) + 1;
      return acc;
    }, {});

  return {
    totalEvents: events.length,
    counts,
    topGames: Object.entries(topGames)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    recentEvents: events.slice(-10).reverse(),
  };
}
