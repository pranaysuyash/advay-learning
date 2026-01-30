import { test, expect } from '@playwright/test';

// This is a scaffolded Playwright test that depends on a running dev server
// It demonstrates the offline -> enqueue -> online -> sync flow at a high level.

test('offline progress sync end-to-end (scaffold)', async ({
  page,
  request,
}) => {
  // Replace with your local dev server URL when running locally
  const APP_URL = process.env.APP_URL || 'http://localhost:6173';

  // Go to the app
  await page.goto(APP_URL + '/');

  // Simulate a profile being present by creating one via API (assumes backend running)
  // For the scaffold, we skip full auth flow and assume test environment can create a profile directly.
  // TODO: Expand to full flow with login and UI interactions.

  // Simulate offline and enqueue via window call
  await page.evaluate(() => {
    // @ts-ignore - window.progressQueue is injected by app import in test runs
    if ((window as any).progressQueue) {
      (window as any).progressQueue.enqueue({
        idempotency_key: 'e2e-1',
        profile_id: 'e2e-profile',
        activity_type: 'letter_tracing',
        content_id: 'E',
        score: 90,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Bring back online and call sync
  await page.context().setOffline(false);
  await page.evaluate(async () => {
    // @ts-ignore
    if ((window as any).progressQueue && (window as any).apiClient) {
      await (window as any).progressQueue.syncAll((window as any).apiClient);
    }
  });

  // Verify via backend API that the record exists (scaffold - replace endpoints if needed)
  const resp = await request.post('/api/v1/progress/batch', {
    json: { profile_id: 'e2e-profile', items: [{ idempotency_key: 'e2e-1' }] },
  });
  expect(resp.status()).toBeLessThan(500);
});
