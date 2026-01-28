import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = (import.meta as any).env?.VITE_API_VERSION || 'v1';

export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && originalRequest) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
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
  
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
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
    metadata?: Record<string, any>;
  }) => apiClient.post('/progress/', data, { params: { profile_id: profileId } }),
  getStats: (profileId: string) =>
    apiClient.get('/progress/stats', { params: { profile_id: profileId } }),
};

export default apiClient;
