import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  getErrorCode,
  getErrorDetails,
  isAuthError,
  isAuthorizationError,
  isValidationError,
  isNotFoundError,
  isRateLimitError,
  formatDuration,
  ERROR_CODES,
} from '../errorUtils';

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('returns fallback for null error', () => {
      expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
    });

    it('returns fallback for undefined error', () => {
      expect(getErrorMessage(undefined)).toBe('An error occurred');
    });

    it('returns string error directly', () => {
      expect(getErrorMessage('Simple error')).toBe('Simple error');
    });

    it('extracts message from error object', () => {
      expect(getErrorMessage({ message: 'Error message' })).toBe('Error message');
    });

    it('handles error with response data (new format)', () => {
      const error = {
        response: {
          data: {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
            },
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Validation failed');
    });

    it('handles legacy FastAPI format with detail string', () => {
      const error = {
        response: {
          data: {
            detail: 'Not found',
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Not found');
    });

    it('handles legacy FastAPI format with detail array', () => {
      const error = {
        response: {
          data: {
            detail: [
              { msg: 'Field required' },
              { msg: 'Invalid format' },
            ],
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Field required, Invalid format');
    });

    it('handles detail array with message property', () => {
      const error = {
        response: {
          data: {
            detail: [
              { message: 'Error 1' },
              { message: 'Error 2' },
            ],
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Error 1, Error 2');
    });

    it('handles data with msg property', () => {
      const error = {
        response: {
          data: {
            msg: 'Simple message',
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Simple message');
    });

    it('handles data with message property', () => {
      const error = {
        response: {
          data: {
            message: 'Data message',
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Data message');
    });

    it('returns fallback when no recognizable format', () => {
      const error = {
        response: {
          data: {
            unknown: 'format',
          },
        },
      };
      expect(getErrorMessage(error)).toBe('An error occurred');
    });

    it('handles network error without response', () => {
      const error = {
        message: 'Some other error',
      };
      expect(getErrorMessage(error)).toBe('Some other error');
    });

    it('handles empty error object', () => {
      expect(getErrorMessage({})).toBe('An error occurred');
    });

    it('handles error with non-string message', () => {
      const error = {
        message: 12345,
      };
      // Non-string messages fall through to fallback
      expect(getErrorMessage(error)).toBe('An error occurred');
    });

    it('prioritizes error.error.message over data.message', () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'Structured error',
            },
            message: 'Flat message',
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Structured error');
    });
  });

  describe('getErrorCode', () => {
    it('returns null for null error', () => {
      expect(getErrorCode(null)).toBeNull();
    });

    it('returns null for error without response', () => {
      expect(getErrorCode({})).toBeNull();
    });

    it('extracts code from new format', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'AUTHENTICATION_ERROR',
            },
          },
        },
      };
      expect(getErrorCode(error)).toBe('AUTHENTICATION_ERROR');
    });

    it('returns null for legacy format without code', () => {
      const error = {
        response: {
          data: {
            detail: 'Not found',
          },
        },
      };
      expect(getErrorCode(error)).toBeNull();
    });

    it('returns null when data is empty', () => {
      const error = {
        response: {
          data: {},
        },
      };
      expect(getErrorCode(error)).toBeNull();
    });
  });

  describe('getErrorDetails', () => {
    it('returns null for null error', () => {
      expect(getErrorDetails(null)).toBeNull();
    });

    it('extracts details from new format', () => {
      const details = { field: 'email', reason: 'invalid' };
      const error = {
        response: {
          data: {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details,
            },
          },
        },
      };
      expect(getErrorDetails(error)).toEqual(details);
    });

    it('returns null when no details', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'ERROR',
            },
          },
        },
      };
      expect(getErrorDetails(error)).toBeNull();
    });
  });

  describe('isAuthError', () => {
    it('returns true for AUTHENTICATION_ERROR code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'AUTHENTICATION_ERROR' },
          },
        },
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('returns true for TOKEN_EXPIRED code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'TOKEN_EXPIRED' },
          },
        },
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('returns true for TOKEN_INVALID code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'TOKEN_INVALID' },
          },
        },
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('returns true for 401 status', () => {
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = {
        response: {
          data: {
            error: { code: 'VALIDATION_ERROR' },
          },
        },
      };
      expect(isAuthError(error)).toBe(false);
    });

    it('returns false for null error', () => {
      expect(isAuthError(null)).toBe(false);
    });
  });

  describe('isAuthorizationError', () => {
    it('returns true for AUTHORIZATION_ERROR code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'AUTHORIZATION_ERROR' },
          },
        },
      };
      expect(isAuthorizationError(error)).toBe(true);
    });

    it('returns true for 403 status', () => {
      const error = {
        response: {
          status: 403,
          data: {},
        },
      };
      expect(isAuthorizationError(error)).toBe(true);
    });

    it('returns false for 401 status', () => {
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };
      expect(isAuthorizationError(error)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('returns true for VALIDATION_ERROR code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'VALIDATION_ERROR' },
          },
        },
      };
      expect(isValidationError(error)).toBe(true);
    });

    it('returns true for PASSWORD_STRENGTH_ERROR code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'PASSWORD_STRENGTH_ERROR' },
          },
        },
      };
      expect(isValidationError(error)).toBe(true);
    });

    it('returns true for 422 status', () => {
      const error = {
        response: {
          status: 422,
          data: {},
        },
      };
      expect(isValidationError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('returns true for RESOURCE_NOT_FOUND code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'RESOURCE_NOT_FOUND' },
          },
        },
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    it('returns true for 404 status', () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      expect(isNotFoundError(error)).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('returns true for RATE_LIMIT_EXCEEDED code', () => {
      const error = {
        response: {
          data: {
            error: { code: 'RATE_LIMIT_EXCEEDED' },
          },
        },
      };
      expect(isRateLimitError(error)).toBe(true);
    });

    it('returns true for 429 status', () => {
      const error = {
        response: {
          status: 429,
          data: {},
        },
      };
      expect(isRateLimitError(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      expect(isRateLimitError(error)).toBe(false);
    });
  });

  // =============================================================================
  // NEW CONSOLIDATED ERROR HANDLING TESTS
  // See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-004
  // =============================================================================

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1m 30s');
      expect(formatDuration(150)).toBe('2m 30s');
    });

    it('handles zero seconds', () => {
      expect(formatDuration(0)).toBe('1s'); // Minimum 1 second
    });

    it('rounds down seconds', () => {
      expect(formatDuration(90.9)).toBe('1m 30s');
    });

    it('handles large durations', () => {
      expect(formatDuration(3600)).toBe('60m 0s');
    });
  });

  describe('getErrorMessage - ACCOUNT_LOCKED handling', () => {
    it('formats ACCOUNT_LOCKED with duration', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'ACCOUNT_LOCKED',
              message: 'Account is locked',
              details: {
                retry_after_seconds: 300,
              },
            },
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Account is temporarily locked. Try again in 5m 0s.');
    });

    it('formats ACCOUNT_LOCKED with short duration', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'ACCOUNT_LOCKED',
              details: {
                retry_after_seconds: 45,
              },
            },
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Account is temporarily locked. Try again in 45s.');
    });
  });

  describe('getErrorMessage - TOKEN_INVALID handling', () => {
    it('returns session expired message for no refresh token', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'TOKEN_INVALID',
              message: 'No refresh token provided',
            },
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Your session expired. Please sign in again.');
    });

    it('returns original message for other TOKEN_INVALID', () => {
      const error = {
        response: {
          data: {
            error: {
              code: 'TOKEN_INVALID',
              message: 'Token signature invalid',
            },
          },
        },
      };
      expect(getErrorMessage(error)).toBe('Token signature invalid');
    });
  });

  describe('getErrorMessage - Network Error handling', () => {
    it('returns friendly message for Network Error', () => {
      const error = {
        message: 'Network Error',
      };
      expect(getErrorMessage(error)).toBe('Network connection failed. Please check your internet connection.');
    });
  });

  describe('ERROR_CODES constants', () => {
    it('contains all expected error codes', () => {
      expect(ERROR_CODES.ACCOUNT_LOCKED).toBe('ACCOUNT_LOCKED');
      expect(ERROR_CODES.TOKEN_INVALID).toBe('TOKEN_INVALID');
      expect(ERROR_CODES.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
      expect(ERROR_CODES.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR');
      expect(ERROR_CODES.AUTHORIZATION_ERROR).toBe('AUTHORIZATION_ERROR');
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.PASSWORD_STRENGTH_ERROR).toBe('PASSWORD_STRENGTH_ERROR');
      expect(ERROR_CODES.RESOURCE_NOT_FOUND).toBe('RESOURCE_NOT_FOUND');
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
