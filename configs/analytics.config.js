// @ts-check
const { devices } = require('@playwright/test');

/**
 * Analytics validation suite — Language Banner / Regional Modal / Geo Routing Modal
 * (tests/analytics/analytics.test.js), built around milo PR #6459
 * (https://github.com/adobecom/milo/pull/6459). See selectors/analytics/analytics.page.js for
 * the full beacon/daa-ll pattern context.
 *
 *   $env:PAGES = "all"   # or a comma list of features/analytics/analytics.spec.js's
 *                        # ANALYTICS_PAGE_PATHS keys (e.g. "root,creativecloud"); default 'root'
 *   npx playwright test --config=configs/analytics.config.js --project=analytics-chrome
 *
 * Chrome-only — this suite validates network beacons and DOM attributes, not cross-browser
 * rendering, so the device/browser matrix other suites run (see lingo-en.config.js) isn't
 * relevant here.
 */
const config = {
  testDir: '../tests/analytics',
  outputDir: '../test-results',
  globalSetup: '../global.setup.js',
  timeout: 90 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 6,
  reporter: process.env.CI
    ? [['github'], ['../utils/reporters/json-reporter.js']]
    : [['html', { outputFolder: 'test-html-results', open: 'always' }], ['list'], ['../utils/reporters/json-reporter.js']],
  use: {
    actionTimeout: 60000,
    trace: 'on-first-retry',
    baseURL: process.env.BASE_URL || 'https://www.stage.adobe.com',
  },
  projects: [
    {
      name: 'analytics-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};
export default config;
