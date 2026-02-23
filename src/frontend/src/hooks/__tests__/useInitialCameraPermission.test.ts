import { test, describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInitialCameraPermission } from '../useInitialCameraPermission';

describe('useInitialCameraPermission', () => {
  let setCameraPermissionMock: ReturnType<typeof vi.fn>;
  let setShowPermissionWarningMock: ReturnType<typeof vi.fn>;
  let warnFnMock: ReturnType<typeof vi.fn>;
  let originalNavigator: typeof navigator;

  beforeEach(() => {
    setCameraPermissionMock = vi.fn();
    setShowPermissionWarningMock = vi.fn();
    warnFnMock = vi.fn();

    // Save original navigator
    originalNavigator = window.navigator;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  test('queries camera permission using Permissions API', async () => {
    const mockQueryResult = {
      state: 'granted' as const,
      addEventListener: vi.fn(),
    };

    // Mock navigator.permissions.query
    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockResolvedValue(mockQueryResult),
      },
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'Test context',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockNavigator.permissions.query).toHaveBeenCalledWith({ name: 'camera' });
    expect(setCameraPermissionMock).toHaveBeenCalledWith('granted');
    expect(setShowPermissionWarningMock).toHaveBeenCalledWith(false);
  });

  test('sets warning when permission is denied', async () => {
    const mockQueryResult = {
      state: 'denied' as const,
      addEventListener: vi.fn(),
    };

    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockResolvedValue(mockQueryResult),
      },
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'Test context',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(setCameraPermissionMock).toHaveBeenCalledWith('denied');
    expect(setShowPermissionWarningMock).toHaveBeenCalledWith(true);
  });

  test('falls back to getUserMedia when Permissions API unavailable', async () => {
    const mockStream = {
      getTracks: vi.fn(() => [
        {
          stop: vi.fn(),
        },
      ]),
    };

    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockRejectedValue(new Error('Not supported')),
      },
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'Test context',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(warnFnMock).toHaveBeenCalled();
    expect(mockNavigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(setCameraPermissionMock).toHaveBeenCalledWith('granted');
    expect(setShowPermissionWarningMock).toHaveBeenCalledWith(false);
  });

  test('handles getUserMedia failure by setting denied state', async () => {
    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockRejectedValue(new Error('Not supported')),
      },
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied')),
      },
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'Test context',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(setCameraPermissionMock).toHaveBeenCalledWith('denied');
    expect(setShowPermissionWarningMock).toHaveBeenCalledWith(true);
  });

  test('handles missing mediaDevices gracefully', async () => {
    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockRejectedValue(new Error('Not supported')),
      },
      mediaDevices: undefined,
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'Test context',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(setCameraPermissionMock).toHaveBeenCalledWith('denied');
    expect(setShowPermissionWarningMock).toHaveBeenCalledWith(true);
  });

  test('attaches change listener to permission result', async () => {
    const mockAddEventListener = vi.fn();
    const mockQueryResult = {
      state: 'prompt' as const,
      addEventListener: mockAddEventListener,
    };

    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockResolvedValue(mockQueryResult),
      },
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'Test context',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  test('uses custom warning context in error messages', async () => {
    const mockNavigator = {
      ...navigator,
      permissions: {
        query: vi.fn().mockRejectedValue(new Error('API not available')),
      },
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException('Permission denied')),
      },
    };

    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      configurable: true,
    });

    renderHook(() =>
      useInitialCameraPermission(
        setCameraPermissionMock,
        setShowPermissionWarningMock,
        'CustomAlphabetGame',
        warnFnMock,
      ),
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(warnFnMock).toHaveBeenCalledWith(
      expect.stringContaining('CustomAlphabetGame'),
      expect.any(Error),
    );
  });
});
