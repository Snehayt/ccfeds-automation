// @ts-check
const { devices } = require('@playwright/test');

/**
 * Generalized lingo/geo-banner suite config — runs against ANY ACOM URL (Express, UPP, CC/DC
 * marketing pages, plain product pages) or BACOM, across stage / prod / an aem.live branch,
 * with or without `milolibs`. See ../lingo-en-skills.md for the full domain model this suite
 * implements.
 *
 * Target environment:
 *   Stage (default): BASE_URL=https://www.stage.adobe.com
 *   Prod:             BASE_URL=https://www.adobe.com
 *   aem.live branch:  BASE_URL=https://main--milo--adobecom.aem.live
 *   BACOM auto-follows BASE_URL tier (stage -> business.stage.adobe.com, prod -> business.adobe.com).
 *   BACOM aem.live override: BACOM_BASE_URL=https://main--da-bacom--adobecom.aem.live
 *
 *   Extra params (milolibs, fedsbranch, etc.) work with any BASE_URL:
 *     BASE_URL=https://www.stage.adobe.com/?milolibs=acom-c2lingo
 *   Or pass separately: URL_EXTRA_PARAMS=milolibs=acom-c2lingo (takes precedence)
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
  testDir: '../tests/lingo-en',
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
    : process.env.HTML_REPORT
      ? [['html', { outputFolder: 'test-html-results', open: 'on-failure' }], ['list'], ['../utils/reporters/json-reporter.js']]
      : [['list'], ['../utils/reporters/json-reporter.js']],
  use: {
    actionTimeout: 60000,
    trace: 'on-first-retry',
    baseURL: process.env.BASE_URL || 'https://www.stage.adobe.com',
  },
  projects: [
    {
      name: 'lingo-en-live-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'lingo-en-live-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'lingo-en-live-webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'lingo-en-live-iphone',
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
      name: 'lingo-en-live-iphone-landscape',
      use: {
        ...devices['iPhone 15'],
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) '
          + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 '
          + 'Mobile/15E148 Safari/604.1',
        viewport: {
          width: 659,
          height: 393,
        },
      },
    },
    {
      name: 'lingo-en-live-android',
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
    {
      name: 'lingo-en-live-android-landscape',
      use: {
        ...devices['Galaxy S24'],
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 '
          + '(KHTML, like Gecko) Chrome/139.0.7258.31 Mobile Safari/537.36',
        viewport: {
          width: 1040,
          height: 480,
        },
      },
    },
    {
      name: 'lingo-en-live-ipad',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
    {
      name: 'lingo-en-live-ipad-landscape',
      use: {
        ...devices['iPad (gen 7) landscape'],
      },
    },
  ],
};
export default config;
