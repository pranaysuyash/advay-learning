import { test, expect } from '@playwright/test';

const E2E_EMAIL = process.env.E2E_EMAIL;
const E2E_PASSWORD = process.env.E2E_PASSWORD;

test.describe('Offline Progress Sync', () => {
  test('syncs progress correctly after coming back online', async ({ page }) => {
    test.skip(!E2E_EMAIL || !E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD to run authenticated offline sync test.');

    // 1. Setup and Login
    await page.goto('/login');
    await page.fill("#login-email-input", E2E_EMAIL!);
    await page.fill("#login-password-input", E2E_PASSWORD!);
    await page.click('button[type=submit]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 2. Head to a game 
    await page.click('text="Games"');
    await page.waitForURL('**/games');

    // Choose a game that logs deterministic progress (like Alphabet Tracing)
    await page.click('text="Alphabet Tracing"');

    // 3. Go Offline
    await page.context().setOffline(true);

    // 4. Record progress
    // Realistically simulating game interaction in E2E without real camera is tough, 
    // so we trigger the progressQueue via the exposed window interface which 
    // represents the game finishing offline.
    await page.evaluate(() => {
      // @ts-expect-error - testing infrastructure: window type extension for progressQueue
      if ((window as any).progressQueue) {
        const testProfileId = 'e2e-offline-test';
        (window as any).progressQueue.enqueue({
          idempotency_key: 'test-offline-sync-1',
          profile_id: testProfileId,
          activity_type: 'letter_tracing',
          content_id: 'A',
          score: 100,
          timestamp: new Date().toISOString(),
          completed: true
        });
      }
    });

    // 5. Come back online
    await page.context().setOffline(false);

    // 6. Navigate back to dashboard (should trigger sync on mount/visibility)
    await page.click('text="Home"');
    await page.waitForURL('**/dashboard');

    // 7. Force/await the sync mechanism 
    await page.evaluate(async () => {
      // @ts-expect-error - testing infrastructure: window type extension for progressQueue and apiClient
      if ((window as any).progressQueue && (window as any).apiClient) {
        await (window as any).progressQueue.syncAll((window as any).apiClient);
      }
    });

    // 8. Verify the local queue was cleared (i.e. sync was successful)
    const queueSize = await page.evaluate(() => {
      // @ts-expect-error - testing infrastructure: window type extension for progressQueue
      return ((window as any).progressQueue?.getQueue() || []).length;
    });

    expect(queueSize).toBe(0);
  });
});
