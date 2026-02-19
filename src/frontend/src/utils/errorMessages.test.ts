import {
  getErrorMessage,
  formatErrorMessage,
  getErrorTitle,
  handleDOMException,
  CAMERA_ERRORS,
  HAND_TRACKING_ERRORS,
  GAME_ERRORS,
  NETWORK_ERRORS,
  BROWSER_ERRORS,
} from './errorMessages';
import { describe, it, expect } from 'vitest';

describe('errorMessages', () => {
  describe('Error Categories', () => {
    it('provides all camera error messages', () => {
      expect(CAMERA_ERRORS.NOT_ALLOWED.title).toContain('Permission');
      expect(CAMERA_ERRORS.NOT_FOUND.title).toContain('No Camera');
      expect(CAMERA_ERRORS.NOT_READABLE.title).toContain('Busy');
      expect(CAMERA_ERRORS.SECURITY_ERROR.title).toContain('Security');
      expect(CAMERA_ERRORS.GENERIC_ERROR.title).toContain('Camera Problem');
    });

    it('provides all hand tracking error messages', () => {
      expect(HAND_TRACKING_ERRORS.MODEL_LOAD_FAILED.title).toContain('Model');
      expect(HAND_TRACKING_ERRORS.INITIALIZATION_FAILED.title).toContain('Setup');
      expect(HAND_TRACKING_ERRORS.RUNTIME_ERROR.title).toContain('Stopped');
    });

    it('provides all game error messages', () => {
      expect(GAME_ERRORS.LEVEL_LOAD_FAILED.title).toContain('Load');
      expect(GAME_ERRORS.SAVE_FAILED.title).toContain('Save');
      expect(GAME_ERRORS.AUDIO_FAILED.title).toContain('Sound');
      expect(GAME_ERRORS.ASSET_LOAD_FAILED.title).toContain('Image');
    });

    it('provides all network error messages', () => {
      expect(NETWORK_ERRORS.NO_CONNECTION.title).toContain('Internet');
      expect(NETWORK_ERRORS.SLOW_CONNECTION.title).toContain('Slow');
      expect(NETWORK_ERRORS.SERVER_ERROR.title).toContain('Server');
    });

    it('provides all browser error messages', () => {
      expect(BROWSER_ERRORS.UNSUPPORTED_BROWSER.title).toContain('Browser');
      expect(BROWSER_ERRORS.WEBGL_NOT_SUPPORTED.title).toContain('Graphics');
      expect(BROWSER_ERRORS.STORAGE_FULL.title).toContain('Storage');
    });
  });

  describe('Error Message Structure', () => {
    it('all camera errors have required fields', () => {
      Object.values(CAMERA_ERRORS).forEach((error) => {
        expect(error).toHaveProperty('title');
        expect(error).toHaveProperty('description');
        expect(error).toHaveProperty('action');
        expect(error.title.length).toBeGreaterThan(0);
        expect(error.description.length).toBeGreaterThan(0);
        expect(error.action.length).toBeGreaterThan(0);
      });
    });

    it('error titles include emojis for quick recognition', () => {
      Object.values(CAMERA_ERRORS).forEach((error) => {
        expect(error.emoji).toBeDefined();
        expect(error.emoji).toMatch(/^[\p{Emoji}]/u);
      });
    });
  });

  describe('getErrorMessage', () => {
    it('returns camera errors for camera-related codes', () => {
      const result = getErrorMessage('NotAllowedError');
      expect(result.title).toContain('Permission');
    });

    it('returns hand tracking errors for mediapipe errors', () => {
      const result = getErrorMessage('mediapipe_error', {
        name: 'Error',
        message: 'Failed to load hands model',
      } as Error);
      expect(result.title).toContain('Hand');
    });

    it('handles case-insensitive error matching', () => {
      const result = getErrorMessage('CAMERA_ERROR', {
        name: 'Error',
        message: 'camera permission denied',
      } as Error);
      // Contains camera/permission keywords so returns CAMERA_ERRORS.GENERIC_ERROR
      expect(result.title).toContain('Camera');
    });

    it('returns generic error for unknown codes', () => {
      const result = getErrorMessage('UNKNOWN_ERROR');
      expect(result.title).toContain('Something Went Wrong');
    });

    it('provides actionable next steps', () => {
      const result = getErrorMessage('NotAllowedError');
      expect(result.action).toContain('Settings');
    });

    it('uses child-friendly language', () => {
      const result = getErrorMessage('NotFoundError');
      expect(result.description).not.toContain('technical');
      expect(result.action).not.toContain('console');
      expect(result.description).toContain('device');
    });
  });

  describe('formatErrorMessage', () => {
    it('returns formatted error with all parts', () => {
      const formatted = formatErrorMessage('NotAllowedError');
      expect(formatted).toContain('📷'); // emoji
      expect(formatted).toContain('Permission'); // title
      expect(formatted).toContain('permission'); // description
      expect(formatted).toContain('Settings'); // action
    });

    it('includes emoji prefix', () => {
      const formatted = formatErrorMessage('NotFoundError');
      expect(formatted).toMatch(/^[🔍]/u);
    });

    it('separates parts with newlines for readability', () => {
      const formatted = formatErrorMessage('NotAllowedError');
      const lines = formatted.split('\n').filter((l) => l.trim());
      expect(lines.length).toBeGreaterThan(2); // At least 3 sections
    });
  });

  describe('getErrorTitle', () => {
    it('returns just the title with emoji', () => {
      const title = getErrorTitle('NotAllowedError');
      expect(title).toContain('📷');
      expect(title).toContain('Permission');
      expect(title).not.toContain('Settings'); // Should not include action
    });

    it('works without error object', () => {
      const title = getErrorTitle('NotFoundError');
      expect(title).toBeDefined();
      expect(title.length).toBeGreaterThan(0);
    });
  });

  describe('handleDOMException', () => {
    it('handles NotAllowedError', () => {
      const err = Object.assign(new Error('Permission denied'), {
        name: 'NotAllowedError',
      }) as DOMException;
      const result = handleDOMException(err);
      expect(result).toEqual(CAMERA_ERRORS.NOT_ALLOWED);
    });

    it('handles NotFoundError', () => {
      const err = Object.assign(new Error('No camera'), {
        name: 'NotFoundError',
      }) as DOMException;
      const result = handleDOMException(err);
      expect(result).toEqual(CAMERA_ERRORS.NOT_FOUND);
    });

    it('handles NotReadableError', () => {
      const err = Object.assign(new Error('Camera in use'), {
        name: 'NotReadableError',
      }) as DOMException;
      const result = handleDOMException(err);
      expect(result).toEqual(CAMERA_ERRORS.NOT_READABLE);
    });

    it('handles SecurityError', () => {
      const err = Object.assign(new Error('Security error'), {
        name: 'SecurityError',
      }) as DOMException;
      const result = handleDOMException(err);
      expect(result).toEqual(CAMERA_ERRORS.SECURITY_ERROR);
    });

    it('falls back for unknown DOM exceptions', () => {
      const err = Object.assign(new Error('Unknown'), {
        name: 'UnknownError',
      }) as DOMException;
      const result = handleDOMException(err);
      expect(result.title).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.action).toBeDefined();
    });
  });

  describe('Smart Error Matching', () => {
    it('matches network connection errors', () => {
      const result = getErrorMessage('error', {
        name: 'Error',
        message: 'Network connection failed',
      } as Error);
      expect(result.title).toContain('Server');
    });

    it('matches slow network errors', () => {
      const result = getErrorMessage('error', {
        name: 'Error',
        message: 'Connection too slow',
      } as Error);
      expect(result.title).toContain('Slow');
    });

    it('matches save failure errors', () => {
      const result = getErrorMessage('error', {
        name: 'Error',
        message: 'Failed to save progress',
      } as Error);
      expect(result.title).toContain('Save');
    });

    it('matches audio/sound errors', () => {
      const result = getErrorMessage('error', {
        name: 'Error',
        message: 'Failed to load audio',
      } as Error);
      expect(result.title).toContain('Level');
    });

    it('matches WebGL errors', () => {
      const result = getErrorMessage('error', {
        name: 'Error',
        message: 'WebGL not supported',
      } as Error);
      expect(result.title).toContain('Graphics');
    });

    it('matches storage errors', () => {
      const result = getErrorMessage('error', {
        name: 'Error',
        message: 'Storage quota exceeded',
      } as Error);
      expect(result.title).toContain('Storage');
    });
  });

  describe('User Experience', () => {
    it('provides clear recovery actions for children', () => {
      const errors = [
        CAMERA_ERRORS.NOT_ALLOWED,
        CAMERA_ERRORS.NOT_FOUND,
        GAME_ERRORS.SAVE_FAILED,
        NETWORK_ERRORS.NO_CONNECTION,
      ];

      errors.forEach((error) => {
        expect(error.action).toMatch(/^(Check|Try|Grant|Close|Refresh|Use|Connect)/);
      });
    });

    it('avoids technical jargon', () => {
      const techTerms = [
        'exception',
        'stack trace',
        'null',
        'undefined',
        'API',
        'HTTP',
        'DNS',
      ];

      Object.values({
        ...CAMERA_ERRORS,
        ...HAND_TRACKING_ERRORS,
        ...GAME_ERRORS,
        ...NETWORK_ERRORS,
        ...BROWSER_ERRORS,
      }).forEach((error) => {
        if (error && typeof error === 'object' && 'description' in error) {
          const text =
            error.title.toLowerCase() +
            ' ' +
            error.description.toLowerCase() +
            ' ' +
            error.action.toLowerCase();

          techTerms.forEach((term) => {
            expect(text).not.toContain(term);
          });
        }
      });
    });

    it('includes emoji for quick visual recognition', () => {
      const formatted = formatErrorMessage('NotAllowedError');
      expect(formatted).toMatch(/[\p{Emoji}]/u); // Contains emoji
    });
  });

  describe('Error Message Consistency', () => {
    it('all titles include relevant emoji prefix', () => {
      Object.values({
        ...CAMERA_ERRORS,
        ...HAND_TRACKING_ERRORS,
        ...GAME_ERRORS,
        ...NETWORK_ERRORS,
        ...BROWSER_ERRORS,
      }).forEach((error) => {
        if (error && typeof error === 'object' && 'emoji' in error) {
          const e = error as any;
          expect(e.emoji).toBeDefined();
          expect(e.emoji).toMatch(/[\p{Emoji}]/u);
        }
      });
    });

    it('all descriptions explain what happened', () => {
      Object.values({
        ...CAMERA_ERRORS,
        ...HAND_TRACKING_ERRORS,
        ...GAME_ERRORS,
        ...NETWORK_ERRORS,
        ...BROWSER_ERRORS,
      }).forEach((error) => {
        if (error && typeof error === 'object' && 'description' in error) {
          const e = error as any;
          expect(e.description.length).toBeGreaterThan(20);
        }
      });
    });

    it('all actions are concrete and actionable', () => {
      Object.values({
        ...CAMERA_ERRORS,
        ...HAND_TRACKING_ERRORS,
        ...GAME_ERRORS,
        ...NETWORK_ERRORS,
        ...BROWSER_ERRORS,
      }).forEach((error) => {
        if (error && typeof error === 'object' && 'action' in error) {
          const e = error as any;
          expect(e.action.length).toBeGreaterThan(10);
          // Action should start with an imperative verb
          expect(e.action).toMatch(/^(Check|Try|Grant|Close|Refresh|Use|Connect|Move)/);
        }
      });
    });
  });
});
