import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8001';
const API_VERSION = (import.meta as any).env?.VITE_API_VERSION || 'v1';

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
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      // Token expired, try to refresh using cookie
      try {
        // The refresh endpoint reads refresh_token from cookie and sets new cookies
        await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });
        
        // Retry original request (cookies automatically included)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),
  
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', 
      new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
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
      params: { token, new_password: newPassword } 
    }),
  
  getMe: () =>
    apiClient.get('/auth/me'),
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
  createProfile: (data: { name: string; age?: number; preferred_language?: string }) =>
    apiClient.post('/users/me/profiles', data),
};

// Progress API
export const progressApi = {
  getProgress: (profileId: string) =>
    apiClient.get('/progress/', { params: { profile_id: profileId } }),
  saveProgress: (profileId: string, data: {
    activity_type: string;
    content_id: string;
    score: number;
    duration_seconds?: number;
    meta_data?: Record<string, any>;
  }) => apiClient.post('/progress/', data, { params: { profile_id: profileId } }),
  getStats: (profileId: string) =>
    apiClient.get('/progress/stats', { params: { profile_id: profileId } }),
};

export default apiClient;
