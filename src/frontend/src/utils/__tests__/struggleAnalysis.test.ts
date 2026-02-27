import { describe, it, expect } from 'vitest';
import { analyzeStruggles, formatAttempts } from '../progressCalculations';
import { ProgressItem } from '../../types/progress';

describe('analyzeStruggles', () => {
  const createMockItem = (
    id: string,
    score: number,
    attempts?: number,
  ): ProgressItem => ({
    id,
    activity_type: 'letter_tracing',
    content_id: 'A',
    score,
    completed_at: new Date().toISOString(),
    attempt_count: attempts,
  });

  it('returns empty summary when no progress', () => {
    const result = analyzeStruggles([]);

    expect(result.strugglingItems).toHaveLength(0);
    expect(result.needsAttentionCount).toBe(0);
    expect(result.totalTracked).toBe(0);
    expect(result.recommendations).toContain(
      'Great progress! No items need special attention right now.',
    );
  });

  it('identifies high attention items (>5 attempts)', () => {
    const progress = [createMockItem('1', 80, 7)];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(1);
    expect(result.strugglingItems[0].attentionLevel).toBe('high');
    expect(result.strugglingItems[0].reason).toContain('7 attempts');
  });

  it('identifies high attention items (<50% accuracy)', () => {
    const progress = [createMockItem('1', 40, 1)];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(1);
    expect(result.strugglingItems[0].attentionLevel).toBe('high');
    expect(result.strugglingItems[0].reason).toContain('40%');
  });

  it('identifies medium attention items (3-5 attempts)', () => {
    const progress = [createMockItem('1', 85, 4)];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(1);
    expect(result.strugglingItems[0].attentionLevel).toBe('medium');
    expect(result.strugglingItems[0].reason).toContain('4 attempts');
  });

  it('identifies medium attention items (50-70% accuracy)', () => {
    const progress = [createMockItem('1', 60, 1)];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(1);
    expect(result.strugglingItems[0].attentionLevel).toBe('medium');
  });

  it('marks single attempt with good accuracy as none', () => {
    const progress = [createMockItem('1', 90, 1)];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(0);
    expect(result.needsAttentionCount).toBe(0);
  });

  it('marks 2 attempts as low attention', () => {
    const progress = [createMockItem('1', 90, 2)];
    const result = analyzeStruggles(progress);

    // Low attention doesn't count as "struggling"
    expect(result.strugglingItems).toHaveLength(0);
  });

  it('defaults to 1 attempt when attempt_count undefined', () => {
    const progress: ProgressItem[] = [
      {
        id: '1',
        activity_type: 'letter_tracing',
        content_id: 'A',
        score: 85,
        completed_at: new Date().toISOString(),
        // attempt_count undefined
      },
    ];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(0);
    expect(result.strugglingItems).toHaveLength(0);
  });

  it('falls back to meta_data.attempt_count when top-level attempt_count is missing', () => {
    const progress: ProgressItem[] = [
      {
        id: 'meta-attempt-1',
        activity_type: 'letter_tracing',
        content_id: 'letter-en-61',
        score: 65,
        completed_at: new Date().toISOString(),
        meta_data: {
          attempt_count: 4,
        },
      },
    ];

    const result = analyzeStruggles(progress);
    expect(result.strugglingItems).toHaveLength(1);
    expect(result.strugglingItems[0].attentionLevel).toBe('medium');
    expect(result.strugglingItems[0].effectiveAttempts).toBe(4);
  });

  it('sorts struggling items by attempts (most first)', () => {
    const progress = [
      createMockItem('1', 80, 3),
      createMockItem('2', 80, 8),
      createMockItem('3', 80, 5),
    ];
    const result = analyzeStruggles(progress);

    expect(result.strugglingItems).toHaveLength(3);
    expect(result.strugglingItems[0].effectiveAttempts).toBe(8);
    expect(result.strugglingItems[1].effectiveAttempts).toBe(5);
    expect(result.strugglingItems[2].effectiveAttempts).toBe(3);
  });

  it('generates recommendations for high attention items', () => {
    const progress = [createMockItem('1', 40, 7)];
    const result = analyzeStruggles(progress);

    expect(
      result.recommendations.some((r) => r.includes('focused practice')),
    ).toBe(true);
  });

  it('generates recommendations for medium attention items', () => {
    const progress = [createMockItem('1', 60, 4)];
    const result = analyzeStruggles(progress);

    expect(
      result.recommendations.some((r) => r.includes('additional practice')),
    ).toBe(true);
  });

  it('correctly counts high and medium items', () => {
    const progress = [
      createMockItem('1', 80, 7), // high
      createMockItem('2', 40, 1), // high
      createMockItem('3', 80, 4), // medium
      createMockItem('4', 60, 1), // medium
      createMockItem('5', 90, 1), // none
    ];
    const result = analyzeStruggles(progress);

    expect(result.needsAttentionCount).toBe(4);
    expect(
      result.strugglingItems.filter((i) => i.attentionLevel === 'high'),
    ).toHaveLength(2);
    expect(
      result.strugglingItems.filter((i) => i.attentionLevel === 'medium'),
    ).toHaveLength(2);
  });
});

describe('formatAttempts', () => {
  it('formats 1st try correctly', () => {
    expect(formatAttempts(1)).toBe('1st try');
  });

  it('formats 2nd try correctly', () => {
    expect(formatAttempts(2)).toBe('2nd try');
  });

  it('formats 3rd try correctly', () => {
    expect(formatAttempts(3)).toBe('3rd try');
  });

  it('formats 4th try correctly', () => {
    expect(formatAttempts(4)).toBe('4th try');
  });

  it('formats 10th try correctly', () => {
    expect(formatAttempts(10)).toBe('10th try');
  });

  it('defaults to 1 when undefined', () => {
    expect(formatAttempts(undefined)).toBe('1st try');
  });
});
