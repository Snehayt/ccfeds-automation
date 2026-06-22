// @ts-check
const { devices } = require('@playwright/test');

const envs = require('../envs/envs.js');

/**
 * Target environment :
 *   Stage (default):  (no env var)
 *   Stage:            BASE_URL=https://www.stage.adobe.com/express/
 *   Prod:             BASE_URL=https://www.adobe.com/express/
 *   AEM branch:       BASE_URL=https://main--da-express-milo--adobecom.aem.live/express/
 *
 *   With extra params (milolibs, fedsbranch, etc.) — works with any BASE_URL:
 *     BASE_URL=https://www.stage.adobe.com/express/?milolibs=unav
 *     BASE_URL=https://www.adobe.com/express/?milolibs=unav&fedsbranch=unav
 *     BASE_URL=https://main--da-express-milo--adobecom.aem.live/express/?milolibs=logs
 *   Or pass separately: URL_EXTRA_PARAMS=milolibs=unav  (takes precedence)
 *
 *   BACOM auto-follows BASE_URL tier (stage → business.stage.adobe.com, prod → business.adobe.com).
 *   BACOM AEM branch override: BACOM_BASE_URL=https://main--da-bacom--adobecom.aem.live/
 */

if (process.env.BASE_URL) {
  try {
    const parsedUrl = new URL(process.env.BASE_URL);
    const isAemBranch = !parsedUrl.hostname.endsWith('adobe.com');
    const extraParams = parsedUrl.searchParams.toString();

    if (isAemBranch) process.env.ACOM_ORIGIN = parsedUrl.origin;
    if (extraParams && !process.env.URL_EXTRA_PARAMS) process.env.URL_EXTRA_PARAMS = extraParams;
  } catch {}
}

// Only needed when testing BACOM against a separate AEM branch
if (process.env.BACOM_BASE_URL) {
  try {
    const parsedUrl = new URL(process.env.BACOM_BASE_URL);
    if (!parsedUrl.hostname.endsWith('adobe.com')) {
      process.env.BACOM_ORIGIN = parsedUrl.origin;
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
    : [['html', { outputFolder: 'test-html-results' }], ['list'], ['../utils/reporters/base-reporter.js']],
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
