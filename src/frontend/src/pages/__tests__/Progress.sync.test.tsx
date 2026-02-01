import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useProfileStore } from '../../store';
import { progressQueue } from '../../services/progressQueue';
import apiClient from '../../services/api';
import { Progress } from '../Progress';

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  HandLandmarker: { createFromOptions: async () => ({}) },
}));

describe('Progress sync', () => {
  beforeEach(() => {
    localStorage.removeItem('advay:progressQueue:v1');
    useProfileStore.setState({
      profiles: [
        {
          id: 'p1',
          name: 'Kid',
          preferred_language: 'english',
          created_at: new Date().toISOString(),
        },
      ],
    });
  });

  it('sync now button triggers queue sync and clears pending', async () => {
    const pendingItem = {
      idempotency_key: 'k-sync-1',
      profile_id: 'p1',
      activity_type: 'letter_tracing',
      content_id: 'B',
      score: 75,
      timestamp: new Date().toISOString(),
    };
    progressQueue.enqueue(pendingItem);

    // Mock apiClient.post to respond with success
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { results: [{ idempotency_key: 'k-sync-1', status: 'ok' }] },
    });

    render(<Progress />);

    // Pending shown
    expect(await screen.findByText(/Pending \(1\)/i)).toBeTruthy();

    // Click sync now
    fireEvent.click(screen.getByText(/Sync now/i));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalled();
    });

    // Pending should disappear
    await waitFor(() => {
      expect(screen.queryByText(/Pending \(1\)/i)).toBeNull();
    });
  });
});
