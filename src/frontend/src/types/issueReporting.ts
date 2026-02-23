export type IssueReportStatus = 'created' | 'clip_uploaded' | 'submitted' | 'rejected';

export interface IssueReportSessionCreatePayload {
  game_id: string;
  activity_id?: string;
  issue_tags?: string[];
  session_id?: string;
  app_version?: string;
  device_info?: Record<string, unknown>;
}

export interface IssueReportSessionResponse {
  report_id: string;
  status: IssueReportStatus;
  created_at: string;
}

export interface IssueReportUploadResponse {
  report_id: string;
  status: IssueReportStatus;
  mime_type: string;
  file_size_bytes: number;
}

export interface IssueReportFinalizePayload {
  duration_seconds?: number;
  mime_type?: string;
  file_size_bytes?: number;
  redaction_applied?: boolean;
  metadata?: Record<string, unknown>;
}

export interface IssueReportResponse {
  report_id: string;
  status: IssueReportStatus;
  created_at: string;
  submitted_at?: string | null;
}
