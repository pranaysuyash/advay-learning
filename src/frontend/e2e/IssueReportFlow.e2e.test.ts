import { expect, test } from '@playwright/test';

test.describe('Issue reporting flow', () => {
  test('Air Canvas submits an issue report with parent confirmation', async ({
    page,
  }) => {
    let createPayload: unknown = null;
    let finalizePayload: unknown = null;

    await page.addInitScript(() => {
      localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            isAuthenticated: true,
            isGuest: true,
            user: {
              id: 'guest-e2e',
              email: 'guest@demo.local',
              role: 'guest',
              is_active: true,
            },
            guestSession: {
              id: 'guest-e2e',
              childProfile: {
                id: 'child-e2e',
                name: 'Guest Player',
                age: 5,
                preferredLanguage: 'english',
              },
              progress: {
                lettersLearned: 0,
                totalLetters: 26,
                averageAccuracy: 0,
                totalTime: 0,
              },
              createdAt: Date.now(),
            },
          },
          version: 0,
        }),
      );

      class FakeMediaRecorder {
        static isTypeSupported() {
          return true;
        }

        stream: MediaStream;
        options?: MediaRecorderOptions;
        state: 'inactive' | 'recording' | 'paused' = 'inactive';
        ondataavailable: ((event: { data: Blob }) => void) | null = null;
        onerror: (() => void) | null = null;
        onstop: (() => void) | null = null;

        constructor(stream: MediaStream, options?: MediaRecorderOptions) {
          this.stream = stream;
          this.options = options;
        }

        start() {
          this.state = 'recording';
        }

        stop() {
          this.state = 'inactive';
          const mimeType = this.options?.mimeType || 'video/webm';
          const clip = new Blob(['e2e-clip'], { type: mimeType });
          this.ondataavailable?.({ data: clip });
          this.onstop?.();
        }
      }

      Object.defineProperty(window, 'MediaRecorder', {
        configurable: true,
        writable: true,
        value: FakeMediaRecorder,
      });

      if (!HTMLCanvasElement.prototype.captureStream) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'captureStream', {
          configurable: true,
          writable: true,
          value: function captureStream() {
            const track = {
              kind: 'video',
              enabled: true,
              stop: () => undefined,
            };

            return {
              id: 'mock-stream',
              active: true,
              getTracks: () => [track],
              getVideoTracks: () => [track],
              getAudioTracks: () => [],
            } as unknown as MediaStream;
          },
        });
      }

      if (!URL.createObjectURL) {
        Object.defineProperty(URL, 'createObjectURL', {
          configurable: true,
          writable: true,
          value: () => 'blob:e2e-preview',
        });
      }

      if (!URL.revokeObjectURL) {
        Object.defineProperty(URL, 'revokeObjectURL', {
          configurable: true,
          writable: true,
          value: () => undefined,
        });
      }
    });

    await page.route('**/api/v1/issue-reports/sessions', async (route) => {
      const request = route.request();
      createPayload = request.postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report_id: 'report-e2e-123',
          status: 'created',
          created_at: '2026-02-24T10:00:00Z',
        }),
      });
    });

    await page.route('**/api/v1/issue-reports/report-e2e-123/clip', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          report_id: 'report-e2e-123',
          status: 'clip_uploaded',
          mime_type: 'video/webm',
          file_size_bytes: 8,
        }),
      });
    });

    await page.route(
      '**/api/v1/issue-reports/report-e2e-123/finalize',
      async (route) => {
        const request = route.request();
        finalizePayload = request.postDataJSON();

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            report_id: 'report-e2e-123',
            status: 'submitted',
            created_at: '2026-02-24T10:00:00Z',
            submitted_at: '2026-02-24T10:00:12Z',
          }),
        });
      },
    );

    await page.goto('/games/air-canvas', { waitUntil: 'domcontentloaded' });

    const reportButton = page.getByRole('button', { name: /Report Issue/i });
    await expect(reportButton).toBeVisible({ timeout: 45_000 });
    await reportButton.click();

    await expect(
      page.getByRole('heading', { name: /Report an Issue/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /Start Recording/i }).click();
    await expect(
      page.getByRole('button', { name: /Stop Recording/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /Stop Recording/i }).click();

    await expect(page.getByText(/Select issue tags:/i)).toBeVisible();
    await page.getByRole('button', { name: 'Game froze' }).click();
    await page.getByRole('button', { name: /Send Report/i }).click();

    const holdButton = page.getByRole('button', {
      name: /Hold for 3 seconds to access settings/i,
    });
    await expect(holdButton).toBeVisible();
    await holdButton.dispatchEvent('mousedown');
    await page.waitForTimeout(3200);
    await holdButton.dispatchEvent('mouseup');

    await expect(page.getByText(/Submitting your report/i)).toBeVisible();
    await expect(
      page.getByText(/Report sent successfully/i),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/report-e2e-123/i)).toBeVisible();

    expect(createPayload).toMatchObject({
      game_id: 'air-canvas',
      activity_id: 'drawing-session',
      issue_tags: ['Game froze'],
    });

    expect(finalizePayload).toMatchObject({
      redaction_applied: true,
      mime_type: 'video/webm',
    });
  });
});
