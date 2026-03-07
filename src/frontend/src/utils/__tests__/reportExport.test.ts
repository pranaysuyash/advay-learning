import { describe, it, expect } from 'vitest';
import {
  generateTextReport,
  generateWhatsAppShareUrl,
  generateReportData,
} from '../reportExport';
import { ProgressItem } from '../../types/progress';

describe('reportExport', () => {
  const mockProgress: ProgressItem[] = [
    {
      id: '1',
      activity_type: 'letter_tracing',
      content_id: 'A',
      score: 85,
      completed_at: new Date().toISOString(),
      attempt_count: 2,
    },
    {
      id: '2',
      activity_type: 'letter_tracing',
      content_id: 'B',
      score: 60,
      completed_at: new Date().toISOString(),
      attempt_count: 5,
    },
  ];

  describe('generateTextReport', () => {
    it('generates report with child name', () => {
      const data = generateReportData('Isha', mockProgress);
      const report = generateTextReport(data);

      expect(report).toContain("Isha's Learning Report");
      expect(report).toContain('📊');
    });

    it('includes time summary', () => {
      const data = generateReportData('Isha', mockProgress);
      const report = generateTextReport(data);

      expect(report).toContain('⏱️ TIME SUMMARY');
      expect(report).toContain('Total this week:');
      expect(report).toContain('Daily average:');
    });

    it('includes progress summary', () => {
      const data = generateReportData('Isha', mockProgress);
      const report = generateTextReport(data);

      expect(report).toContain('📈 PROGRESS SUMMARY');
      expect(report).toContain('Activities completed:');
      expect(report).toContain('Average accuracy:');
    });

    it('includes struggling items when present', () => {
      const data = generateReportData('Isha', mockProgress);
      const report = generateTextReport(data);

      expect(report).toContain('⚠️ NEEDS PRACTICE');
      expect(report).toContain('B:'); // Letter B should appear
    });

    it('includes recommendations', () => {
      const data = generateReportData('Isha', mockProgress);
      const report = generateTextReport(data);

      expect(report).toContain('💡 RECOMMENDATIONS');
    });

    it('includes a share invite with attributed home link', () => {
      const data = generateReportData('Isha', mockProgress);
      const report = generateTextReport(data, 'https://example.com');

      expect(report).toContain('🌟 TRY ADVAY');
      expect(report).toContain(
        'https://example.com/?ref=progress_share&entry=report',
      );
    });
  });

  describe('generateWhatsAppShareUrl', () => {
    it('generates valid WhatsApp URL', () => {
      const data = generateReportData('Isha', mockProgress);
      const url = generateWhatsAppShareUrl(data, 'https://example.com');

      expect(url).toContain('https://wa.me/?text=');
      expect(url).toContain(encodeURIComponent("Isha's Learning Report"));
      expect(url).toContain(
        encodeURIComponent(
          'https://example.com/?ref=progress_share&entry=report',
        ),
      );
    });
  });

  describe('generateReportData', () => {
    it('calculates total activities correctly', () => {
      const data = generateReportData('Isha', mockProgress);

      expect(data.childName).toBe('Isha');
      expect(data.totalActivities).toBe(2);
    });

    it('calculates average accuracy correctly', () => {
      const data = generateReportData('Isha', mockProgress);
      // (85 + 60) / 2 = 72.5
      expect(data.averageAccuracy).toBe(72.5);
    });

    it('includes report date', () => {
      const data = generateReportData('Isha', mockProgress);

      expect(data.reportDate).toBeDefined();
      expect(typeof data.reportDate).toBe('string');
    });

    it('handles empty progress', () => {
      const data = generateReportData('Isha', []);

      expect(data.totalActivities).toBe(0);
      expect(data.averageAccuracy).toBe(0);
    });

    it('includes time breakdown', () => {
      const data = generateReportData('Isha', mockProgress);

      expect(data.timeBreakdown).toBeDefined();
      expect(data.timeBreakdown.dailyBreakdown).toHaveLength(7);
    });

    it('includes struggle summary', () => {
      const data = generateReportData('Isha', mockProgress);

      expect(data.struggleSummary).toBeDefined();
      expect(data.struggleSummary.totalTracked).toBe(2);
    });
  });
});
