import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:3210',
    trace: 'on-first-retry',
  },
  webServer: {
    command:
      'NEXT_PUBLIC_APP_URL=http://127.0.0.1:3210 next dev --turbopack -p 3210',
    url: 'http://127.0.0.1:3210',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
