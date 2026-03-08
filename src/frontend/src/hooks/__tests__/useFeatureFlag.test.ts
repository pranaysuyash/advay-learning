/**
 * useFeatureFlag Tests
 * 
 * @ticket ISSUE-006
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { getFeatureFlag, DEFAULT_FEATURES } from '../../config/features';

// Mock the settings store
const mockUpdateSettings = vi.fn();
let mockFeatures: Record<string, boolean> = {};

vi.mock('../../store/settingsStore', () => ({
  useSettingsStore: () => ({
    features: mockFeatures,
    updateSettings: mockUpdateSettings,
  }),
}));

import { useFeatureFlag, useFeatureFlags } from '../useFeatureFlag';

describe('getFeatureFlag', () => {
  it('returns default value when no overrides', () => {
    expect(getFeatureFlag('controls.fallbackV1', {})).toBe(false);
    expect(getFeatureFlag('safety.pauseOnTrackingLoss', {})).toBe(true);
    expect(getFeatureFlag('ai.cloudFallbackV1', {})).toBe(false);
  });

  it('returns user override when provided', () => {
    expect(getFeatureFlag('controls.fallbackV1', { 'controls.fallbackV1': true })).toBe(true);
  });

  it('returns default for unknown flags safely', () => {
    // @ts-expect-error Testing invalid flag
    expect(getFeatureFlag('invalid.flag', {})).toBeUndefined();
  });
});

describe('useFeatureFlag', () => {
  beforeEach(() => {
    mockFeatures = {};
    mockUpdateSettings.mockClear();
  });

  it('returns default flag value', () => {
    const { result } = renderHook(() => useFeatureFlag('controls.fallbackV1'));
    expect(result.current).toBe(false);
  });

  it('returns true when user override is set', () => {
    mockFeatures = { 'controls.fallbackV1': true };
    const { result } = renderHook(() => useFeatureFlag('controls.fallbackV1'));
    expect(result.current).toBe(true);
  });
});

describe('useFeatureFlags', () => {
  beforeEach(() => {
    mockFeatures = {};
    mockUpdateSettings.mockClear();
  });

  it('returns all flags with defaults', () => {
    const { result } = renderHook(() => useFeatureFlags());
    expect(result.current.flags).toMatchObject(DEFAULT_FEATURES);
  });

  it('isEnabled returns correct value', () => {
    mockFeatures = { 'controls.fallbackV1': true };
    const { result } = renderHook(() => useFeatureFlags());
    expect(result.current.isEnabled('controls.fallbackV1')).toBe(true);
    expect(result.current.isEnabled('safety.pauseOnTrackingLoss')).toBe(true);
  });

  it('updateFlag updates editable flags', () => {
    const { result } = renderHook(() => useFeatureFlags());
    result.current.updateFlag('controls.fallbackV1', true);
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      features: { 'controls.fallbackV1': true },
    });

    result.current.updateFlag('ai.cloudFallbackV1', true);
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      features: { 'ai.cloudFallbackV1': true },
    });
  });

  it('updateFlag warns for non-editable flags', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useFeatureFlags());
    result.current.updateFlag('rewards.deterministicV1', true);
    expect(consoleSpy).toHaveBeenCalledWith('Feature flag rewards.deterministicV1 is not user-editable');
    expect(mockUpdateSettings).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
