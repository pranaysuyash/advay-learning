import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();
const responseUseMock = vi.fn();

vi.mock('axios', () => {
  const instance = {
    post: postMock,
    interceptors: {
      response: {
        use: responseUseMock,
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => instance),
      post: vi.fn(),
    },
    create: vi.fn(() => instance),
  };
});

describe('issue reporting upload MIME contract (frontend -> API service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends codec-qualified webm mime and accepts normalized backend mime response', async () => {
    const { buildIssueReportClipFormData } = await import('../issueReportingUpload');
    const { issueReportsApi } = await import('../api');

    const reportId = 'rep_codec';
    const clipBlob = new Blob(['test-clip'], { type: 'video/webm' });
    const uploadForm = buildIssueReportClipFormData(clipBlob, {
      reportId,
      mimeType: 'video/webm;codecs=vp9,opus',
    });

    postMock.mockResolvedValueOnce({
      data: {
        report_id: reportId,
        status: 'clip_uploaded',
        mime_type: 'video/webm',
        file_size_bytes: clipBlob.size,
      },
    });

    const response = await issueReportsApi.uploadClip(reportId, uploadForm);

    expect(postMock).toHaveBeenCalledWith(
      `/issue-reports/${reportId}/clip`,
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const sentFormData = postMock.mock.calls[0][1] as FormData;
    expect(sentFormData.get('mime_type')).toBe('video/webm;codecs=vp9,opus');
    expect((sentFormData.get('clip') as File).name).toBe(`issue_${reportId}.webm`);

    expect(response.data.mime_type).toBe('video/webm');
  });
});
