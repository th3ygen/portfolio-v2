import { defineConfig, devices } from '@playwright/test';

// Deliberately not 3000: that is where `npm run dev` lives, and Playwright
// manages its server's whole lifecycle — pointing it at 3000 means an e2e run
// either hijacks the dev server or kills it.
const E2E_PORT = Number(process.env.E2E_PORT ?? 3100);
const E2E_URL = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: E2E_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${E2E_PORT}`,
    url: E2E_URL,
    // Never true: a reused server is a server nobody rebuilt, so a run can
    // silently test stale code. Rebuilding costs seconds and is always honest.
    reuseExistingServer: false,
    // Covers `npm run build && npm run start` from cold. 180s was enough on an
    // idle machine and timed out repeatedly on a busy one — this is a
    // production build of a page with seven sections and a hundred images, and
    // a failure here reads as "the whole suite is broken" rather than "the
    // server was still compiling".
    timeout: 420_000,
  },
});
