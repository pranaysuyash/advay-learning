export interface IssueReportUploadMeta {
  reportId: string;
  mimeType?: string;
}

export function buildIssueReportClipFormData(
  clipBlob: Blob,
  meta: IssueReportUploadMeta,
): FormData {
  const extension =
    meta.mimeType?.includes('mp4') || clipBlob.type.includes('mp4')
      ? 'mp4'
      : 'webm';

  const filename = `issue_${meta.reportId}.${extension}`;
  const formData = new FormData();
  formData.append('clip', clipBlob, filename);

  if (meta.mimeType) {
    formData.append('mime_type', meta.mimeType);
  } else if (clipBlob.type) {
    formData.append('mime_type', clipBlob.type);
  }

  return formData;
}

export function buildIssueReportMetadata(params: {
  gameId: string;
  activityId?: string;
  issueTags?: string[];
  appVersion?: string;
  sessionId?: string;
}): Record<string, unknown> {
  return {
    game_id: params.gameId,
    activity_id: params.activityId,
    issue_tags: params.issueTags || [],
    app_version: params.appVersion,
    session_id: params.sessionId,
    utc_timestamp: new Date().toISOString(),
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    language: typeof navigator !== 'undefined' ? navigator.language : null,
  };
}
