// Documentation module exports

export { DocumentationGenerator } from './documentationGenerator';
export { ChangeLog, createChangeLog, type ChangeLogEntry, type ChangeLogConfig, DEFAULT_CHANGE_LOG_CONFIG } from './changeLog';
export { ImplementationReport, createImplementationReport, type BeforeAfterComparison, type KeyDecision, type LessonLearned, type NextStep, type ImplementationReportConfig, DEFAULT_IMPLEMENTATION_REPORT_CONFIG } from './implementationReport';
export { MetricsReport, createMetricsReport, type MetricChange, type MetricsReportConfig, DEFAULT_METRICS_REPORT_CONFIG } from './metricsReport';
export { ReportStorage, createReportStorage, type StoredReport, type ReportStorageConfig, DEFAULT_REPORT_STORAGE_CONFIG } from './reportStorage';
export { WeeklySummary, createWeeklySummary, type GameImproved, type GameImplemented, type WeeklySummaryData, type WeeklySummaryConfig, DEFAULT_WEEKLY_SUMMARY_CONFIG } from './weeklySummary';
