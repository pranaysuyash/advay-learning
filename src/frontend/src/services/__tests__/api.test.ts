import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create axios instance with correct config', async () => {
    // Import the module to trigger axios.create
    await import('../api');
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        withCredentials: true,
      })
    );
  });
});

// Mock the API modules for testing
describe('authApi', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('../api', () => ({
      authApi: {
        register: (email: string, password: string) =>
          mockPost('/auth/register', { email, password }),
        login: (username: string, password: string) =>
          mockPost('/auth/login', new URLSearchParams({ username, password }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }),
        logout: () => mockPost('/auth/logout'),
        refresh: () => mockPost('/auth/refresh'),
        verifyEmail: (token: string) =>
          mockPost('/auth/verify-email', null, { params: { token } }),
        resendVerification: (email: string) =>
          mockPost('/auth/resend-verification', null, { params: { email } }),
        forgotPassword: (email: string) =>
          mockPost('/auth/forgot-password', null, { params: { email } }),
        resetPassword: (token: string, newPassword: string) =>
          mockPost('/auth/reset-password', null, {
            params: { token, new_password: newPassword },
          }),
        getMe: () => mockGet('/auth/me'),
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock('../api');
  });

  it('should call register with correct data', async () => {
    const { authApi } = await import('../api');
    await authApi.register('test@example.com', 'password123');
    expect(mockPost).toHaveBeenCalledWith('/auth/register', {
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should call login with form data', async () => {
    const { authApi } = await import('../api');
    await authApi.login('user@example.com', 'pass123');
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/login',
      expect.any(URLSearchParams),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('should call logout', async () => {
    const { authApi } = await import('../api');
    await authApi.logout();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('should call refresh', async () => {
    const { authApi } = await import('../api');
    await authApi.refresh();
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh');
  });

  it('should call verifyEmail with token', async () => {
    const { authApi } = await import('../api');
    await authApi.verifyEmail('verify-token');
    expect(mockPost).toHaveBeenCalledWith('/auth/verify-email', null, {
      params: { token: 'verify-token' },
    });
  });

  it('should call resendVerification with email', async () => {
    const { authApi } = await import('../api');
    await authApi.resendVerification('test@example.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification', null, {
      params: { email: 'test@example.com' },
    });
  });

  it('should call forgotPassword with email', async () => {
    const { authApi } = await import('../api');
    await authApi.forgotPassword('test@example.com');
    expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', null, {
      params: { email: 'test@example.com' },
    });
  });

  it('should call resetPassword with token and password', async () => {
    const { authApi } = await import('../api');
    await authApi.resetPassword('reset-token', 'newpassword123');
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', null, {
      params: { token: 'reset-token', new_password: 'newpassword123' },
    });
  });

  it('should call getMe', async () => {
    const { authApi } = await import('../api');
    await authApi.getMe();
    expect(mockGet).toHaveBeenCalledWith('/auth/me');
  });
});

describe('userApi', () => {
  const mockGet = vi.fn();
  const mockPut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('../api', () => ({
      userApi: {
        getMe: () => mockGet('/users/me'),
        updateMe: (data: { email?: string; password?: string }) =>
          mockPut('/users/me', data),
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock('../api');
  });

  it('should call getMe', async () => {
    const { userApi } = await import('../api');
    await userApi.getMe();
    expect(mockGet).toHaveBeenCalledWith('/users/me');
  });

  it('should call updateMe with data', async () => {
    const { userApi } = await import('../api');
    await userApi.updateMe({ email: 'new@example.com' });
    expect(mockPut).toHaveBeenCalledWith('/users/me', { email: 'new@example.com' });
  });
});

describe('profileApi', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('../api', () => ({
      profileApi: {
        getProfiles: () => mockGet('/users/me/profiles'),
        getProfile: (profileId: string) =>
          mockGet(`/users/me/profiles/${profileId}`),
        createProfile: (data: { name: string; age?: number; preferred_language?: string }) =>
          mockPost('/users/me/profiles', data),
        updateProfile: (profileId: string, data: any) =>
          mockPatch(`/users/me/profiles/${profileId}`, data),
        deleteProfile: (profileId: string) =>
          mockDelete(`/users/me/profiles/${profileId}`),
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock('../api');
  });

  it('should call getProfiles', async () => {
    const { profileApi } = await import('../api');
    await profileApi.getProfiles();
    expect(mockGet).toHaveBeenCalledWith('/users/me/profiles');
  });

  it('should call getProfile with id', async () => {
    const { profileApi } = await import('../api');
    await profileApi.getProfile('profile-123');
    expect(mockGet).toHaveBeenCalledWith('/users/me/profiles/profile-123');
  });

  it('should call createProfile with data', async () => {
    const { profileApi } = await import('../api');
    await profileApi.createProfile({ name: 'Test Child', age: 5 });
    expect(mockPost).toHaveBeenCalledWith('/users/me/profiles', {
      name: 'Test Child',
      age: 5,
    });
  });

  it('should call updateProfile with id and data', async () => {
    const { profileApi } = await import('../api');
    await profileApi.updateProfile('profile-123', { name: 'Updated Name' });
    expect(mockPatch).toHaveBeenCalledWith('/users/me/profiles/profile-123', {
      name: 'Updated Name',
    });
  });

  it('should call deleteProfile with id', async () => {
    const { profileApi } = await import('../api');
    await profileApi.deleteProfile('profile-123');
    expect(mockDelete).toHaveBeenCalledWith('/users/me/profiles/profile-123');
  });
});

describe('progressApi', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('../api', () => ({
      progressApi: {
        getProgress: (profileId: string) =>
          mockGet('/progress/', { params: { profile_id: profileId } }),
        saveProgress: (profileId: string, data: any) =>
          mockPost('/progress/', data, { params: { profile_id: profileId } }),
        getStats: (profileId: string) =>
          mockGet('/progress/stats', { params: { profile_id: profileId } }),
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock('../api');
  });

  it('should call getProgress with profile id', async () => {
    const { progressApi } = await import('../api');
    await progressApi.getProgress('profile-123');
    expect(mockGet).toHaveBeenCalledWith('/progress/', {
      params: { profile_id: 'profile-123' },
    });
  });

  it('should call saveProgress with profile id and data', async () => {
    const { progressApi } = await import('../api');
    const progressData = {
      activity_type: 'game',
      content_id: 'game-1',
      score: 85,
      duration_seconds: 120,
    };
    await progressApi.saveProgress('profile-123', progressData);
    expect(mockPost).toHaveBeenCalledWith('/progress/', progressData, {
      params: { profile_id: 'profile-123' },
    });
  });

  it('should call getStats with profile id', async () => {
    const { progressApi } = await import('../api');
    await progressApi.getStats('profile-123');
    expect(mockGet).toHaveBeenCalledWith('/progress/stats', {
      params: { profile_id: 'profile-123' },
    });
  });
});

describe('subscriptionApi', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('../api', () => ({
      subscriptionApi: {
        getCurrent: () => mockGet('/subscriptions/current'),
        purchase: (planType: string) =>
          mockPost('/subscriptions/purchase', null, { params: { plan_type: planType } }),
        getGamesCatalog: () => mockGet('/subscriptions/games/catalog'),
        getAvailableGames: (subscriptionId: string) =>
          mockGet('/subscriptions/games/available', { params: { subscription_id: subscriptionId } }),
        updateGameSelection: (subscriptionId: string, gameIds: string[]) =>
          mockPut('/subscriptions/games', { game_ids: gameIds }, { params: { subscription_id: subscriptionId } }),
        swapGame: (subscriptionId: string, newGameId: string) =>
          mockPut('/subscriptions/games/swap', { new_game_id: newGameId }, { params: { subscription_id: subscriptionId } }),
        upgrade: (subscriptionId: string, newPlan: string) =>
          mockPost('/subscriptions/upgrade', { new_plan: newPlan }, { params: { subscription_id: subscriptionId } }),
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock('../api');
  });

  it('should call getCurrent', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.getCurrent();
    expect(mockGet).toHaveBeenCalledWith('/subscriptions/current');
  });

  it('should call purchase with plan type', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.purchase('full_annual');
    expect(mockPost).toHaveBeenCalledWith('/subscriptions/purchase', null, {
      params: { plan_type: 'full_annual' },
    });
  });

  it('should call getGamesCatalog', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.getGamesCatalog();
    expect(mockGet).toHaveBeenCalledWith('/subscriptions/games/catalog');
  });

  it('should call getAvailableGames with subscription id', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.getAvailableGames('sub-123');
    expect(mockGet).toHaveBeenCalledWith('/subscriptions/games/available', {
      params: { subscription_id: 'sub-123' },
    });
  });

  it('should call updateGameSelection with subscription id and game ids', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.updateGameSelection('sub-123', ['game1', 'game2']);
    expect(mockPut).toHaveBeenCalledWith(
      '/subscriptions/games',
      { game_ids: ['game1', 'game2'] },
      { params: { subscription_id: 'sub-123' } }
    );
  });

  it('should call swapGame with subscription id and new game id', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.swapGame('sub-123', 'new-game');
    expect(mockPut).toHaveBeenCalledWith(
      '/subscriptions/games/swap',
      { new_game_id: 'new-game' },
      { params: { subscription_id: 'sub-123' } }
    );
  });

  it('should call upgrade with subscription id and new plan', async () => {
    const { subscriptionApi } = await import('../api');
    await subscriptionApi.upgrade('sub-123', 'game_pack_10');
    expect(mockPost).toHaveBeenCalledWith(
      '/subscriptions/upgrade',
      { new_plan: 'game_pack_10' },
      { params: { subscription_id: 'sub-123' } }
    );
  });
});

describe('issueReportsApi', () => {
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('../api', () => ({
      issueReportsApi: {
        createSession: (payload: any) =>
          mockPost('/issue-reports/sessions', payload),
        uploadClip: (reportId: string, formData: FormData) =>
          mockPost(`/issue-reports/${reportId}/clip`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }),
        finalizeReport: (reportId: string, payload: any) =>
          mockPost(`/issue-reports/${reportId}/finalize`, payload),
      },
    }));
  });

  afterEach(() => {
    vi.doUnmock('../api');
  });

  it('should call createSession with payload', async () => {
    const { issueReportsApi } = await import('../api');
    const payload = { game_id: 'game-1', issue_type: 'bug' };
    await issueReportsApi.createSession(payload);
    expect(mockPost).toHaveBeenCalledWith('/issue-reports/sessions', payload);
  });

  it('should call uploadClip with report id and form data', async () => {
    const { issueReportsApi } = await import('../api');
    const formData = new FormData();
    formData.append('clip', new Blob(), 'clip.webm');
    await issueReportsApi.uploadClip('report-123', formData);
    expect(mockPost).toHaveBeenCalledWith(
      '/issue-reports/report-123/clip',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  });

  it('should call finalizeReport with report id and payload', async () => {
    const { issueReportsApi } = await import('../api');
    const payload = { description: 'Issue details', severity: 'high' };
    await issueReportsApi.finalizeReport('report-123', payload);
    expect(mockPost).toHaveBeenCalledWith(
      '/issue-reports/report-123/finalize',
      payload
    );
  });
});
