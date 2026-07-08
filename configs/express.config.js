// @ts-check
const { devices } = require('@playwright/test');

const envs = require('../envs/envs.js');

// AEM branch testing — uncomment one line below, update milolibs= as needed, recomment when done:
//process.env.BASE_URL = 'https://main--da-express-milo--adobecom.aem.live/express/?milolibs=logs';  // prod-like
// process.env.BASE_URL = 'https://stage--da-express-milo--adobecom.aem.live/express/?milolibs=logs'; // stage-like

if (process.env.BASE_URL) {
  try {
    const u = new URL(process.env.BASE_URL);
    if (!u.hostname.endsWith('adobe.com')) {
      process.env.ACOM_ORIGIN = u.origin;
      process.env.URL_EXTRA_PARAMS = u.search.slice(1); // e.g. "milolibs=logs"
    }
  } catch {}
}

// BACOM AEM branch testing — uncomment one line below, recomment when done:
 //process.env.BACOM_BASE_URL = 'https://main--da-bacom--adobecom.aem.live/?milolibs=logs';  // prod-like
// process.env.BACOM_BASE_URL = 'https://stage--da-bacom--adobecom.aem.live/?milolibs=logs'; // stage-like

if (process.env.BACOM_BASE_URL) {
  try {
    const u = new URL(process.env.BACOM_BASE_URL);
    if (!u.hostname.endsWith('adobe.com')) {
      process.env.BACOM_ORIGIN = u.origin;
    }
  } catch {}
}

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: '../tests/express',
  outputDir: '../test-results',
  globalSetup: '../global.setup.js',
  /* Maximum time one test can run for. */
  timeout: 90 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 6,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['github'], ['../utils/reporters/json-reporter.js'], ['../utils/reporters/json-reporter.js']]
    : [['html', { outputFolder: 'test-html-results' ,open:'always'}], ['list'], ['../utils/reporters/base-reporter.js']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 60000,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    baseURL: process.env.BASE_URL || envs['@express_stage'] || 'https://www.stage.adobe.com/express',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'express-live-chrome',
      use: { ...devices['Desktop Chrome'] },
      retries: 0,
    },

    {
      name: 'express-live-firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'express-live-webkit',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'express-live-IOS-mobile',
      use: {
        ...devices['iPhone 15'],
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) '
          + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 '
          + 'Mobile/15E148 Safari/604.1',
        viewport: {
          width: 393,
          height: 659,
        },
      },
    },

    {
      name: 'express-live-Android-mobile',
      use: {
        ...devices['Galaxy S24'],
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 '
          + '(KHTML, like Gecko) Chrome/139.0.7258.31 Mobile Safari/537.36',
        viewport: {
          width: 480,
          height: 1040,
        },
      },
    },
  ],
};
export default config;
