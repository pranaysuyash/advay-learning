import { defineConfig, devices } from '@playwright/test';

const fakeCameraArgs = [
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
];

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:6173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-fake-camera',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['camera'],
        launchOptions: {
          args: fakeCameraArgs,
        },
      },
    },
    {
      name: 'chromium-manual-camera',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
      },
    },
  ],
  // Auto-start dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:6173',
    reuseExistingServer: true, // Use existing server if already running
    timeout: 120_000, // 2 minutes for server to start
  },
});
