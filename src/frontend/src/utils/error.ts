/**
 * Error Handling Module
 * 
 * Centralized error handling utilities for the application.
 * 
 * REFACTOR-2026-03-07: Consolidated error handling
 * See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-004
 * 
 * @example
 * ```ts
 * // API error handling
 * import { getErrorMessage, isAuthError, ERROR_CODES } from '../utils/error';
 * 
 * try {
 *   await api.login(credentials);
 * } catch (error) {
 *   if (isAuthError(error)) {
 *     // Handle auth error
 *   }
 *   toast.error(getErrorMessage(error));
 * }
 * ```
 * 
 * @example
 * ```ts
 * // User-friendly error messages
 * import { CAMERA_ERRORS, getErrorMessage } from '../utils/error';
 * 
 * const errorInfo = getErrorMessage('NotAllowedError');
 * // Returns: { title: 'Camera Permission Needed 📷', ... }
 * ```
 */

// Core error utilities
export {
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
} from './errorUtils';

// User-friendly error messages
export {
  CAMERA_ERRORS,
  HAND_TRACKING_ERRORS,
  GAME_ERRORS,
  NETWORK_ERRORS,
  BROWSER_ERRORS,
  getErrorMessage as getUserFriendlyErrorMessage,
  formatErrorMessage,
  getErrorTitle,
  handleDOMException,
} from './errorMessages';

// Types
export type { ErrorMessageInfo } from './errorMessages';
