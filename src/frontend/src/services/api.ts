import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  IssueReportFinalizePayload,
  IssueReportResponse,
  IssueReportSessionCreatePayload,
  IssueReportSessionResponse,
  IssueReportUploadResponse,
} from '../types/issueReporting';

const env = (import.meta as any).env ?? {};
const API_VERSION = env.VITE_API_VERSION || 'v1';
const API_BASE_URL =
  env.VITE_API_BASE_URL ??
  // In dev, prefer same-origin + Vite proxy (`/api` -> backend) to avoid CORS.
  (env.DEV ? '' : 'http://localhost:8001');

export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // IMPORTANT: Send cookies with cross-origin requests
});

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const requestUrl = String(originalRequest?.url || '');
    const isAuthEndpoint =
      /\/auth\/(login|register|refresh|verify-email|resend-verification|forgot-password|reset-password)$/.test(
        requestUrl,
      );

    // Only attempt refresh once per request to prevent infinite loops
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        // The refresh endpoint reads refresh_token from cookie and sets new cookies
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        // Retry original request (cookies automatically included)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, return error so caller can clear auth state
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),

  login: (username: string, password: string) =>
    apiClient.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),

  logout: () => apiClient.post('/auth/logout'),

  refresh: () =>
    // Refresh token is automatically sent via cookie
    apiClient.post('/auth/refresh'),

  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', null, { params: { token } }),

  resendVerification: (email: string) =>
    apiClient.post('/auth/resend-verification', null, { params: { email } }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', null, { params: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', null, {
      params: { token, new_password: newPassword },
    }),

  getMe: () => apiClient.get('/auth/me'),
};

// User API
export const userApi = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data: { email?: string; password?: string }) =>
    apiClient.put('/users/me', data),
};

// Profile API
export const profileApi = {
  getProfiles: () => apiClient.get('/users/me/profiles'),
  getProfile: (profileId: string) =>
    apiClient.get(`/users/me/profiles/${profileId}`),
  createProfile: (data: {
    name: string;
    age?: number;
    preferred_language?: string;
  }) => apiClient.post('/users/me/profiles', data),
  updateProfile: (
    profileId: string,
    data: Partial<{
      name: string;
      age?: number;
      preferred_language?: string;
      settings?: Record<string, unknown>;
    }>,
  ) => apiClient.patch(`/users/me/profiles/${profileId}`, data),
  deleteProfile: (profileId: string) =>
    apiClient.delete(`/users/me/profiles/${profileId}`),
};

// Progress API
export const progressApi = {
  getProgress: (profileId: string) =>
    apiClient.get('/progress/', { params: { profile_id: profileId } }),
  saveProgress: (
    profileId: string,
    data: {
      activity_type: string;
      content_id: string;
      score: number;
      duration_seconds?: number;
      completed?: boolean;
      meta_data?: Record<string, any>;
      idempotency_key?: string;
      timestamp?: string;
    },
  ) =>
    apiClient.post('/progress/', data, { params: { profile_id: profileId } }),
  getStats: (profileId: string) =>
    apiClient.get('/progress/stats', { params: { profile_id: profileId } }),
};

// Issue Reporting API
export const issueReportsApi = {
  createSession: (payload: IssueReportSessionCreatePayload) =>
    apiClient.post<IssueReportSessionResponse>(
      '/issue-reports/sessions',
      payload,
    ),

  uploadClip: (reportId: string, formData: FormData) =>
    apiClient.post<IssueReportUploadResponse>(
      `/issue-reports/${reportId}/clip`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    ),

  finalizeReport: (reportId: string, payload: IssueReportFinalizePayload) =>
    apiClient.post<IssueReportResponse>(
      `/issue-reports/${reportId}/finalize`,
      payload,
    ),
};

// Subscription API
export type SubscriptionPlanType =
  | 'game_pack_5'
  | 'game_pack_10'
  | 'full_annual';

export interface SubscriptionStatus {
  has_active: boolean;
  subscription: {
    id: string;
    plan_type: string;
    status: string;
    start_date: string;
    end_date: string;
    game_selections: { game_id: string }[];
  } | null;
  days_remaining: number | null;
  available_games: {
    game_limit: number;
    selected_count: number;
    remaining_slots: number;
    swap_available: boolean;
    refresh_available?: boolean;
    next_refresh_at?: string | null;
    refresh_window_label?: string | null;
    renewal_prompt?: string | null;
  } | null;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
  plan_type: string;
}

export const subscriptionApi = {
  getCurrent: () => apiClient.get<SubscriptionStatus>('/subscriptions/current'),
  purchase: (planType: SubscriptionPlanType) =>
    apiClient.post<CheckoutResponse>('/subscriptions/purchase', null, {
      params: { plan_type: planType },
    }),
  getGamesCatalog: () =>
    apiClient.get<{ games: any[]; total: number }>(
      '/subscriptions/games/catalog',
    ),
  getAvailableGames: (subscriptionId: string) =>
    apiClient.get('/subscriptions/games/available', {
      params: { subscription_id: subscriptionId },
    }),
  updateGameSelection: (subscriptionId: string, gameIds: string[]) =>
    apiClient.put(
      `/subscriptions/games`,
      { game_ids: gameIds },
      { params: { subscription_id: subscriptionId } },
    ),
  swapGame: (subscriptionId: string, newGameId: string) =>
    apiClient.put(
      '/subscriptions/games/swap',
      { new_game_id: newGameId },
      { params: { subscription_id: subscriptionId } },
    ),
  upgrade: (subscriptionId: string, newPlan: SubscriptionPlanType) =>
    apiClient.post(
      '/subscriptions/upgrade',
      { new_plan: newPlan },
      { params: { subscription_id: subscriptionId } },
    ),
};

export default apiClient;
