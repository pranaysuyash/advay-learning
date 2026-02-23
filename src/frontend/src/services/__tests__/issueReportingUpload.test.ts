import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  buildIssueReportClipFormData,
  buildIssueReportMetadata,
} from '../issueReportingUpload';

describe('issueReportingUpload helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds clip form-data with mp4 extension when mime indicates mp4', () => {
    const clipBlob = new Blob(['test-clip'], { type: 'video/mp4' });

    const formData = buildIssueReportClipFormData(clipBlob, {
      reportId: 'rep_123',
      mimeType: 'video/mp4',
    });

    const clip = formData.get('clip');
    const mimeType = formData.get('mime_type');

    expect(clip).toBeInstanceOf(File);
    expect((clip as File).name).toBe('issue_rep_123.mp4');
    expect(mimeType).toBe('video/mp4');
  });

  it('falls back to webm extension when mime is not mp4', () => {
    const clipBlob = new Blob(['test-clip'], { type: 'video/webm' });

    const formData = buildIssueReportClipFormData(clipBlob, {
      reportId: 'rep_456',
    });

    const clip = formData.get('clip');
    const mimeType = formData.get('mime_type');

    expect((clip as File).name).toBe('issue_rep_456.webm');
    expect(mimeType).toBe('video/webm');
  });

  it('builds metadata with normalized keys and timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-24T10:00:00.000Z'));

    const metadata = buildIssueReportMetadata({
      gameId: 'virtual-chemistry-lab',
      activityId: 'mixing-round',
      issueTags: ['camera-mask', 'lag'],
      appVersion: '1.2.3',
      sessionId: 'sess_789',
    });

    expect(metadata.game_id).toBe('virtual-chemistry-lab');
    expect(metadata.activity_id).toBe('mixing-round');
    expect(metadata.issue_tags).toEqual(['camera-mask', 'lag']);
    expect(metadata.app_version).toBe('1.2.3');
    expect(metadata.session_id).toBe('sess_789');
    expect(metadata.utc_timestamp).toBe('2026-02-24T10:00:00.000Z');
    expect(typeof metadata.user_agent).toBe('string');
  });
});
