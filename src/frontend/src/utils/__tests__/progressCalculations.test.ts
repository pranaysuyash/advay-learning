import { describe, it, expect } from 'vitest';
import { calculateDailyTimeBreakdown } from '../progressCalculations';
import { ProgressItem } from '../../types/progress';

describe('calculateDailyTimeBreakdown', () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const createMockProgress = (daysAgo: number, count: number): ProgressItem[] => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString();

    return Array.from({ length: count }, (_, i) => ({
      id: `test-${daysAgo}-${i}`,
      activity_type: 'letter_tracing',
      content_id: 'A',
      score: 80,
      completed_at: dateStr,
    }));
  };

  it('returns empty breakdown when no progress', () => {
    const result = calculateDailyTimeBreakdown([], 20);

    expect(result.dailyBreakdown).toHaveLength(7);
    expect(result.totalMinutesWeek).toBe(0);
    expect(result.averageMinutesPerDay).toBe(0);
    expect(result.daysExceededLimit).toBe(0);
    expect(result.limitMinutes).toBe(20);
  });

  it('calculates minutes based on activity count (3 min per activity)', () => {
    // 5 activities today = 15 minutes
    const progress = createMockProgress(0, 5);
    const result = calculateDailyTimeBreakdown(progress, 20);

    const todayEntry = result.dailyBreakdown.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.minutes).toBe(15);
    expect(todayEntry?.activityCount).toBe(5);
  });

  it('detects when daily limit is exceeded', () => {
    // 10 activities = 30 minutes, limit is 20
    const progress = createMockProgress(0, 10);
    const result = calculateDailyTimeBreakdown(progress, 20);

    const todayEntry = result.dailyBreakdown.find((d) => d.isToday);
    expect(todayEntry?.exceedsLimit).toBe(true);
    expect(result.daysExceededLimit).toBe(1);
  });

  it('calculates weekly totals correctly', () => {
    // Today: 5 activities (15 min), Yesterday: 3 activities (9 min)
    const progress = [...createMockProgress(0, 5), ...createMockProgress(1, 3)];
    const result = calculateDailyTimeBreakdown(progress, 20);

    expect(result.totalMinutesWeek).toBe(24); // 15 + 9
    expect(result.averageMinutesPerDay).toBe(3); // 24 / 7 rounded
  });

  it('marks correct day as today', () => {
    const result = calculateDailyTimeBreakdown([], 20);

    const todayEntry = result.dailyBreakdown.find((d) => d.isToday);
    expect(todayEntry).toBeDefined();
    expect(todayEntry?.date).toBe(todayStr);
  });

  it('returns 7 days of breakdown', () => {
    const result = calculateDailyTimeBreakdown([], 20);

    expect(result.dailyBreakdown).toHaveLength(7);

    // Check that days are in order (oldest to newest)
    const dates = result.dailyBreakdown.map((d) => new Date(d.date));
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i].getTime()).toBeGreaterThan(dates[i - 1].getTime());
    }
  });

  it('uses custom limit when provided', () => {
    // 8 activities = 24 minutes, limit is 30
    const progress = createMockProgress(0, 8);
    const result = calculateDailyTimeBreakdown(progress, 30);

    expect(result.limitMinutes).toBe(30);
    expect(result.daysExceededLimit).toBe(0); // 24 < 30
  });

  it('shows correct day names', () => {
    const result = calculateDailyTimeBreakdown([], 20);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    result.dailyBreakdown.forEach((day) => {
      expect(dayNames).toContain(day.dayName);
    });
  });

  it('handles activities spread across multiple days', () => {
    const progress = [
      ...createMockProgress(0, 4), // Today: 12 min
      ...createMockProgress(1, 2), // Yesterday: 6 min
      ...createMockProgress(2, 6), // 2 days ago: 18 min
      ...createMockProgress(3, 0), // 3 days ago: 0 min
    ].flat();

    const result = calculateDailyTimeBreakdown(progress, 20);

    expect(result.totalMinutesWeek).toBe(36); // 12 + 6 + 18
    expect(result.dailyBreakdown[6].minutes).toBe(12); // Today (index 6) is last
  });
});
