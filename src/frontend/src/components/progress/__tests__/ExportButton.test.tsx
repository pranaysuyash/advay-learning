import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ExportButton } from '../ExportButton';
import {
  clearGrowthTrackingState,
  getGrowthEvents,
} from '../../../services/growthAttribution';
import type { ReportData } from '../../../utils/reportExport';

const reportData: ReportData = {
  childName: 'Isha',
  reportDate: 'Friday, March 7, 2026',
  timeBreakdown: {
    totalMinutesWeek: 25,
    averageMinutesPerDay: 4,
    daysExceededLimit: 0,
    dailyBreakdown: [],
  },
  struggleSummary: {
    totalTracked: 1,
    needsAttentionCount: 0,
    strugglingItems: [],
    recommendations: ['Keep going!'],
  },
  totalActivities: 4,
  averageAccuracy: 87,
};

describe('ExportButton', () => {
  beforeEach(() => {
    clearGrowthTrackingState();
    vi.restoreAllMocks();
  });

  it('records clipboard share events', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });

    render(<ExportButton data={reportData} />);

    fireEvent.click(screen.getByRole('button', { name: /Export Report/i }));
    fireEvent.click(screen.getByRole('button', { name: /Copy Text/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1);
    });

    const events = getGrowthEvents();
    expect(events.some((event) => event.name === 'progress_share_clicked')).toBe(
      true,
    );
    expect(events.some((event) => event.name === 'progress_share_copied')).toBe(
      true,
    );
  });

  it('records WhatsApp share events', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<ExportButton data={reportData} />);

    fireEvent.click(screen.getByRole('button', { name: /Export Report/i }));
    fireEvent.click(screen.getByRole('button', { name: /Share to WhatsApp/i }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const events = getGrowthEvents();
    expect(
      events.some((event) => event.name === 'progress_share_whatsapp_opened'),
    ).toBe(true);
  });
});
