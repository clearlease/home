import { defineConfig, devices } from '@playwright/test';

// Runs against the built site (npm run build first). BASE_URL=https://www.clearlea.se checks production.
const BASE_URL = process.env.BASE_URL || 'http://localhost:4322';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: process.env.BASE_URL ? undefined : { command: 'npx astro preview --port 4322 --ignore-lock', url: BASE_URL, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-webkit', use: { ...devices['iPad (gen 7)'] }, testMatch: /(pages|visual)\.spec/ },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] }, testMatch: /(pages|interactions|visual)\.spec/ },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] }, testMatch: /(pages|visual)\.spec/ },
  ],
});
