import { defineConfig, devices } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    // Test the production static build: dev mode injects the Astro dev toolbar
    // and React Scan, which are not part of the shipped page. Call astro
    // directly because `pnpm run <script> -- …` forwards a literal `--`;
    // `--ignore-lock` keeps preview in the foreground when astro detects an AI agent.
    command:
      'pnpm exec astro build && pnpm exec astro preview --host 127.0.0.1 --port 3000 --ignore-lock',
    url: baseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
