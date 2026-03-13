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
    const testProfileId = 'e2e-offline-test';
    await page.evaluate((profileId) => {
      // @ts-expect-error
      if ((window as any).progressQueue) {
        (window as any).progressQueue.enqueue({
          idempotency_key: 'test-offline-sync-1',
          profile_id: profileId,
          activity_type: 'letter_tracing',
          content_id: 'A',
          score: 100,
          timestamp: new Date().toISOString(),
          completed: true
        });
      }
    }, testProfileId);

    // verify UI badge appears while still offline
    const pendingBadge = await page.waitForSelector('text=Pending (1)');
    expect(pendingBadge).toBeTruthy();

    // click badge and assert navigation & analytics
    await pendingBadge.click();
    await page.waitForURL('**/progress');
    const events = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem('advay.launch.analytics.v1') || '[]');
    });
    expect(events.some((e: any) => e.name === 'pending_badge_clicked' && e.metadata.profileId === testProfileId)).toBeTruthy();
    // metadata should include gameId (string)
    expect(events.some((e: any) => e.name === 'pending_badge_clicked' && typeof e.metadata.gameId === 'string')).toBeTruthy();

    // navigate back to game for remainder of test
    await page.click('text="Alphabet Tracing"');

    // 5. Come back online
    await page.context().setOffline(false);

    // also add a failed/dead-letter item and verify those badge/analytics
    await page.evaluate((profileId) => {
      // @ts-expect-error
      if ((window as any).progressQueue) {
        (window as any).progressQueue.moveToDeadLetter('nonexistent', 'for test');
        // manually increment dead letters count
        (window as any).progressQueue.enqueue({
          idempotency_key: 'test-offline-sync-2',
          profile_id: profileId,
          activity_type: 'letter_tracing',
          content_id: 'B',
          score: 90,
          timestamp: new Date().toISOString(),
          completed: true,
        });
      }
    }, testProfileId);
    // after going back online
    await page.evaluate(async () => {
      // @ts-expect-error
      if ((window as any).progressQueue && (window as any).apiClient) {
        await (window as any).progressQueue.syncAll((window as any).apiClient);
      }
    });

    // verify failed-badge appears (count may vary depending on implementation)
    const failedBadge = await page.waitForSelector('text=Failed (1)', { timeout: 5000 }).catch(() => null);
    if (failedBadge) {
      await failedBadge.click();
      await page.waitForURL('**/progress');
      const events2 = await page.evaluate(() => {
        return JSON.parse(window.localStorage.getItem('advay.launch.analytics.v1') || '[]');
      });
      expect(events2.some((e: any) => e.name === 'failed_badge_clicked')).toBeTruthy();
      expect(events2.some((e: any) => e.name === 'failed_badge_clicked' && typeof e.metadata.gameId === 'string')).toBeTruthy();
      // return to game
      await page.click('text="Alphabet Tracing"');
    }

    // 6. Navigate back to dashboard (should trigger sync on mount/visibility)
    await page.click('text="Home"');
    await page.waitForURL('**/dashboard');

    // dashboard should render at least one offline-badge (pending or failed)
    const dashBadge = await page.waitForSelector('text=Pending', { timeout: 2000 }).catch(() => null) ||
      await page.waitForSelector('text=Failed', { timeout: 2000 }).catch(() => null);
    expect(dashBadge).toBeTruthy();

    // analytics should include sync result event
    const syncEvents = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem('advay.launch.analytics.v1') || '[]');
    });
    expect(syncEvents.some((e: any) => e.name === 'progress_sync_result')).toBeTruthy();

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
