/**
 * Analytics Mock Pattern Test
 *
 * Proof of concept for testing module-level analytics functions.
 * Goal: Verify vi.mock works for @/analytics module before implementing
 * recordCVError in countingCollectathon.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as analytics from '../index';
import { recordCVError } from '../extensions/countingCollectathon';

// Mock the analytics module
// DECISION-2026-03-08: Using vi.mock for module-level functions
// RATIONALE: logEvent is module-level with hidden state, DI not feasible
// Pattern: Mock module → use vi.mocked() for typed access
vi.mock('../index', () => ({
  logEvent: vi.fn(),
  startSession: vi.fn(),
  endSession: vi.fn(),
  getActiveSession: vi.fn(),
}));

describe('Analytics Mock Pattern', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mock logEvent successfully', () => {
    // Arrange: Set up mock return value (void function)
    vi.mocked(analytics.logEvent).mockReturnValue(undefined);

    // Act: Call the mocked function
    analytics.logEvent('test_event', { foo: 'bar' });

    // Assert: Verify it was called with correct arguments
    expect(analytics.logEvent).toHaveBeenCalledTimes(1);
    expect(analytics.logEvent).toHaveBeenCalledWith('test_event', { foo: 'bar' });
  });

  it('should track multiple logEvent calls', () => {
    // Act: Call multiple times
    analytics.logEvent('event_1', { count: 1 });
    analytics.logEvent('event_2', { count: 2 });
    analytics.logEvent('event_3', { count: 3 });

    // Assert: Verify call count and order
    expect(analytics.logEvent).toHaveBeenCalledTimes(3);
    expect(vi.mocked(analytics.logEvent).mock.calls).toEqual([
      ['event_1', { count: 1 }],
      ['event_2', { count: 2 }],
      ['event_3', { count: 3 }],
    ]);
  });

  it('should handle no payload argument', () => {
    analytics.logEvent('simple_event');

    // Note: Mock doesn't implement default payload behavior
    // Real implementation adds {} as default, mock just records call
    expect(analytics.logEvent).toHaveBeenCalledWith('simple_event');
  });

  it('should isolate mocks between tests', () => {
    // This test starts with fresh mocks (beforeEach clears)
    expect(analytics.logEvent).not.toHaveBeenCalled();

    analytics.logEvent('isolated_event');

    expect(analytics.logEvent).toHaveBeenCalledTimes(1);
    // Only this test's call, not previous tests
  });
});

describe('Analytics Mock Pattern - Game Integration', () => {
  it('should simulate CV error logging pattern', () => {
    // Simulate what recordCVError would do
    const mockCVError = {
      type: 'cv_input_error',
      payload: {
        game: 'counting-collectathon',
        field: 'handX',
        value: 'NaN',
        valueType: 'number',
      },
    };

    // Act: Simulate the log call
    analytics.logEvent(mockCVError.type, mockCVError.payload);

    // Assert: Verify correct event structure
    expect(analytics.logEvent).toHaveBeenCalledWith(
      'cv_input_error',
      expect.objectContaining({
        game: 'counting-collectathon',
        field: 'handX',
      })
    );
  });

  it('should verify recordCVError payload shape via mocked logEvent', () => {
    recordCVError('handX', Number.NaN);

    expect(analytics.logEvent).toHaveBeenCalledWith(
      'cv_input_error',
      expect.objectContaining({
        game: 'counting-collectathon',
        field: 'handX',
        valueType: 'number',
      })
    );
  });
});
