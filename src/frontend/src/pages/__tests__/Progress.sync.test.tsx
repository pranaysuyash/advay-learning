import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { useProfileStore } from '../../store';
import { progressQueue } from '../../services/progressQueue';
import apiClient from '../../services/api';
import { Progress } from '../Progress';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  HandLandmarker: { createFromOptions: async () => ({ detectForVideo: () => [], close: () => {} }) },
  PoseLandmarker: { createFromOptions: async () => ({ detectForVideo: () => ({}), close: () => {} }) },
  FaceLandmarker: { createFromOptions: async () => ({ detectForVideo: () => ({}), close: () => {} }) },
}));

describe('Progress sync', () => {
  const profileId = '33333333-3333-4333-8333-333333333333';
  const queueItemId = '44444444-4444-4444-8444-444444444444';

  beforeEach(() => {
    localStorage.removeItem('advay:progressQueue:v1');
    useProfileStore.setState({
      profiles: [
        {
          id: profileId,
          name: 'Kid',
          preferred_language: 'english',
          created_at: new Date().toISOString(),
        },
      ],
    });
  });

  it('sync now button triggers queue sync and clears pending', async () => {
    const pendingItem = {
      idempotency_key: queueItemId,
      profile_id: profileId,
      activity_type: 'letter_tracing',
      content_id: 'B',
      score: 75,
      timestamp: new Date().toISOString(),
    };
    progressQueue.enqueue(pendingItem);

    // Mock apiClient.post to respond with success
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] } as any);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { results: [{ idempotency_key: queueItemId, status: 'ok' }] },
    });

    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>,
    );

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

    getSpy.mockRestore();
    postSpy.mockRestore();
  });
});
