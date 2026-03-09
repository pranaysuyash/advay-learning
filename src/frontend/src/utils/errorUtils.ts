/**
 * Error handling utilities for API responses
 *
 * Supports both new structured error format:
 * { success: false, error: { code: '...', message: '...' } }
 *
 * And legacy FastAPI format:
 * { detail: '...' }
 *
 * REFACTOR-2026-03-07: Consolidated from authStore.ts
 * See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-004
 */

/**
 * Format a duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "5m 30s" or "45s")
 */
export function formatDuration(seconds: number): string {
  const safe = Math.max(1, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = safe % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

/**
 * Known error codes that require special handling
 */
export const ERROR_CODES = {
  // Authentication
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',

  // Authorization
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PASSWORD_STRENGTH_ERROR: 'PASSWORD_STRENGTH_ERROR',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/**
 * Extract a human-readable error message from an API error response
 *
 * This function handles multiple error formats:
 * 1. New structured format: { error: { code: '...', message: '...', details: {} } }
 * 2. Legacy FastAPI format: { detail: '...' } or { detail: [...] }
 * 3. Simple message objects: { message: '...' } or { msg: '...' }
 * 4. String errors
 *
 * @param error - The error object from an API response or catch block
 * @param fallback - Fallback message if no error details found
 * @returns Human-readable error message
 *
 * @example
 * ```ts
 * try {
 *   await api.login(credentials);
 * } catch (error) {
 *   toast.error(getErrorMessage(error, 'Login failed'));
 * }
 * ```
 */
export function getErrorMessage(error: any, fallback = 'An error occurred'): string {
  if (!error) return fallback;

  // If error is just a string, return it
  if (typeof error === 'string') return error;

  // If error has a message property (standard Error object)
  if (error.message && typeof error.message === 'string') {
    // Check for network errors
    if (error.message === 'Network Error') {
      return 'Network connection failed. Please check your internet connection.';
    }
    return error.message;
  }

  // Check for response data (Axios-style error)
  const data = error.response?.data;
  if (!data) {
    // Network or other errors without response
    return fallback;
  }

  // NEW: Structured error format from custom exceptions
  // { success: false, error: { code: '...', message: '...', details: {} } }
  if (data.error) {
    // Handle ACCOUNT_LOCKED with duration
    if (
      data.error.code === ERROR_CODES.ACCOUNT_LOCKED &&
      typeof data.error.details?.retry_after_seconds === 'number'
    ) {
      return `Account is temporarily locked. Try again in ${formatDuration(data.error.details.retry_after_seconds)}.`;
    }

    // Handle TOKEN_INVALID with specific message
    if (
      data.error.code === ERROR_CODES.TOKEN_INVALID &&
      typeof data.error.message === 'string' &&
      data.error.message.toLowerCase().includes('no refresh token provided')
    ) {
      return 'Your session expired. Please sign in again.';
    }

    // Return the error message if available
    if (data.error.message) {
      return data.error.message;
    }
  }

  // Legacy FastAPI format: { detail: '...' }
  if (typeof data.detail === 'string') {
    return data.detail;
  }

  // Array of validation errors (legacy FastAPI format)
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => err.msg || err.message || 'Invalid input')
      .join(', ');
  }

  // Object with msg or message
  if (data.msg) return data.msg;
  if (data.message) return data.message;

  return fallback;
}

/**
 * Extract error code from API response
 */
export function getErrorCode(error: any): string | null {
  const data = error?.response?.data;
  if (!data) return null;

  // New format
  if (data.error?.code) {
    return data.error.code;
  }

  return null;
}

/**
 * Extract error details from API response
 */
export function getErrorDetails(error: any): Record<string, any> | null {
  const data = error?.response?.data;
  if (!data) return null;

  // New format
  if (data.error?.details) {
    return data.error.details;
  }

  return null;
}

/**
 * Type guard to check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  const code = getErrorCode(error);
  return code === 'AUTHENTICATION_ERROR' ||
         code === 'TOKEN_EXPIRED' ||
         code === 'TOKEN_INVALID' ||
         error?.response?.status === 401;
}

/**
 * Type guard to check if error is an authorization error
 */
export function isAuthorizationError(error: any): boolean {
  const code = getErrorCode(error);
  return code === 'AUTHORIZATION_ERROR' ||
         error?.response?.status === 403;
}

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  const code = getErrorCode(error);
  return code === 'VALIDATION_ERROR' ||
         code === 'PASSWORD_STRENGTH_ERROR' ||
         error?.response?.status === 422;
}

/**
 * Type guard to check if error is a not found error
 */
export function isNotFoundError(error: any): boolean {
  const code = getErrorCode(error);
  return code === 'RESOURCE_NOT_FOUND' ||
         error?.response?.status === 404;
}

/**
 * Type guard to check if error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  const code = getErrorCode(error);
  return code === 'RATE_LIMIT_EXCEEDED' ||
         error?.response?.status === 429;
}
