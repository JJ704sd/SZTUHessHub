import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/playwright',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide' },
  },
  reporter: [['list'], ['html', { outputFolder: 'test-results/playwright-report', open: 'never' }]],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'desktop-light', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 }, colorScheme: 'light' } },
    { name: 'desktop-dark', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 }, colorScheme: 'dark' } },
    { name: 'tablet-light', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, colorScheme: 'light' } },
    { name: 'tablet-dark', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, colorScheme: 'dark' } },
    { name: 'mobile-light', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, colorScheme: 'light' } },
    { name: 'mobile-dark', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, colorScheme: 'dark' } },
    { name: 'narrow-light', use: { browserName: 'chromium', viewport: { width: 320, height: 800 }, colorScheme: 'light' } },
  ],
  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
