import { describe, it, expect } from 'vitest';
import { API_URL, authApi, profileApi, progressApi } from './api';

describe('API Service', () => {
  describe('API_URL', () => {
    it('should be defined', () => {
      expect(API_URL).toBeDefined();
      expect(typeof API_URL).toBe('string');
    });

    it('should contain /api/v1', () => {
      expect(API_URL).toContain('/api/v1');
    });
  });

  describe('authApi', () => {
    it('should have all required methods', () => {
      expect(authApi.login).toBeDefined();
      expect(authApi.register).toBeDefined();
      expect(authApi.logout).toBeDefined();
      expect(authApi.refresh).toBeDefined();
      expect(authApi.getMe).toBeDefined();
      expect(authApi.verifyEmail).toBeDefined();
      expect(authApi.resendVerification).toBeDefined();
      expect(authApi.forgotPassword).toBeDefined();
      expect(authApi.resetPassword).toBeDefined();
    });

    it('should export functions', () => {
      expect(typeof authApi.login).toBe('function');
      expect(typeof authApi.register).toBe('function');
      expect(typeof authApi.logout).toBe('function');
    });
  });

  describe('profileApi', () => {
    it('should have all required methods', () => {
      expect(profileApi.getProfiles).toBeDefined();
      expect(profileApi.createProfile).toBeDefined();
    });

    it('should export functions', () => {
      expect(typeof profileApi.getProfiles).toBe('function');
      expect(typeof profileApi.createProfile).toBe('function');
    });
  });

  describe('progressApi', () => {
    it('should have all required methods', () => {
      expect(progressApi.getProgress).toBeDefined();
      expect(progressApi.saveProgress).toBeDefined();
      expect(progressApi.getStats).toBeDefined();
    });

    it('should export functions', () => {
      expect(typeof progressApi.getProgress).toBe('function');
      expect(typeof progressApi.saveProgress).toBe('function');
      expect(typeof progressApi.getStats).toBe('function');
    });
  });
});
