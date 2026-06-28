import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Local dev: auto-start server + client
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'cd ../server && node index.js',
          port: 4000,
          reuseExistingServer: true,
          env: { E2E_MODE: '1' },
        },
        {
          command: 'npm run dev',
          port: 5173,
          reuseExistingServer: true,
        },
      ],
});
