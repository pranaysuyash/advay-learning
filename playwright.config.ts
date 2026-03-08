import {
  defineConfig,
  devices,
} from './src/frontend/node_modules/@playwright/test';

const fakeCameraArgs = [
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
];

export default defineConfig({
  testDir: './src/frontend/src/**/*.e2e.test.ts',
  fullyParallel: false,
  forbidOnly: false,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [['html', { outputFolder: '.tmp/playwright-report' }]],
  outputDir: '.tmp/test-results',
  use: {
    baseURL: 'http://localhost:6173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:6173',
    reuseExistingServer: !process.env.CI,
    cwd: './src/frontend',
  },
});
