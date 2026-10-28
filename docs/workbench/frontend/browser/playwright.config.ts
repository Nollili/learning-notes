// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', timeout: 10_000, retries: 0, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 320, height: 640 }, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ],
  webServer: { command: 'node server.mjs', url: 'http://127.0.0.1:4173', timeout: 10_000, reuseExistingServer: false }
});
