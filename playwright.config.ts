import { defineConfig, devices } from '@playwright/test';

const usesExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  webServer: usesExternalServer
    ? undefined
    : {
        command: 'node ./node_modules/astro/bin/astro.mjs preview --host 127.0.0.1',
        url: 'http://127.0.0.1:4321/',
        reuseExistingServer: false,
        env: {
          ASTRO_TELEMETRY_DISABLED: '1',
        },
      },
});
