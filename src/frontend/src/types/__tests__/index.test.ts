import { describe, it, expect } from 'vitest';
import * as types from '../index';

// smoke tests to ensure index.ts re-exports expected types

describe('types/index exports', () => {
  it('should export GardenTarget type', () => {
    // @ts-expect-error: compile-time check only
    const sample: types.GardenTarget = { id: 1, name: 'Test', color: '#000', emoji: '🧪', assetId: 'test', position: { x: 0, y: 0 } };
    expect(sample).toBeDefined();
  });

  it('should export Teacher type', () => {
    // compile-time type check
    const t: types.Teacher = { id: 't1', name: 'Ms. Smith', subject: 'Math' };
    expect(t).toBeDefined();
  });

  it('should export IssueReportResponse type', () => {
    const r: types.IssueReportResponse = { report_id: 'r1', status: 'created', created_at: new Date().toISOString() };
    expect(r.status).toBe('created');
  });
});