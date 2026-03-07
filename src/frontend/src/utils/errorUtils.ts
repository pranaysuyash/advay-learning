/**
 * Error handling utilities for API responses
 * 
 * Supports both new structured error format:
 * { success: false, error: { code: '...', message: '...' } }
 * 
 * And legacy FastAPI format:
 * { detail: '...' }
 */

/**
 * Extract a human-readable error message from an API error response
 */
export function getErrorMessage(error: any, fallback = 'An error occurred'): string {
  if (!error) return fallback;

  // If error is just a string, return it
  if (typeof error === 'string') return error;

  // If error has a message property
  if (error.message && typeof error.message === 'string') return error.message;

  // Check for response data
  const data = error.response?.data;
  if (!data) {
    // Network or other errors without response
    return error.message || fallback;
  }

  // NEW: Structured error format from custom exceptions
  // { success: false, error: { code: '...', message: '...', details: {} } }
  if (data.error?.message) {
    return data.error.message;
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
