# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is **ccfeds-automation**, a Playwright-based E2E test automation repo for Adobe CC (Creative Cloud) web pages, built on the [Nala](https://github.com/adobecom/nala) framework. Tests run against AEM Live/Stage environments for the CC site (`cc--adobecom`).

## Commands

```bash
# Install dependencies
npm install

# Run all CC tests (headless, all browsers)
npx playwright test --config=configs/cc.config.js

# Run a specific test file
npx playwright test tests/cc/fireflyGallery.test.js --config=configs/cc.config.js

# Run tests by tag
npx playwright test -g @cc-fireflygallery --config=configs/cc.config.js
npx playwright test -g "@smoke|@regression" --config=configs/cc.config.js

# Run headed (with browser UI)
npx playwright test --config=configs/cc.config.js --headed

# Run on a specific browser project
npx playwright test --config=configs/cc.config.js --project=cc-live-chrome

# Run against a specific base URL
BASE_URL=https://main--cc--adobecom.aem.live npx playwright test --config=configs/cc.config.js

# View HTML test report (after a local run)
npx playwright show-report configs/test-html-results
```

## Architecture

Every test feature is split across three files — add all three when creating new automation:

### 1. `features/cc/<name>.spec.js` — Test data / spec definitions
Exports a `features` array where each entry is a test case with `tcid`, `name` (used as test title with `@tag`), `path` (URL path appended to `baseURL`), `tags`, and optional inline `data`/`elements`.

```js
module.exports = {
  name: 'my feature',
  features: [
    {
      tcid: '0',
      name: '@my-feature-ui',
      path: '/my-page?georouting=off',
      tags: '@cc @cc-myfeature @cc-myfeature-ui',
    },
  ],
};
```

### 2. `selectors/cc/<name>.page.js` — Page Object Model
ES module class with Playwright locators and reusable action helpers.

```js
export default class MyFeature {
  constructor(page) {
    this.page = page;
    this.myElement = page.locator('.my-selector');
  }
}
```

### 3. `tests/cc/<name>.test.js` — Test implementations
Imports `features` from the spec file and the page class. Uses `test.describe` + `test.step` structure.

```js
import { expect, test } from '@playwright/test';
import { features } from '../../features/cc/myfeature.spec.js';
import MyFeature from '../../selectors/cc/myfeature.page.js';

test.describe('my feature', () => {
  test.beforeEach(async ({ page }) => { obj = new MyFeature(page); });

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('Navigate', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
    });
  });
});
```

## Configuration

- **`configs/cc.config.js`** — Playwright config for CC tests. Sets `testDir: '../tests/cc'`, `baseURL` defaults to `@cc_stage`, defines browser projects (`cc-live-chrome`, `cc-live-firefox`, `cc-live-webkit`, `cc-live-IOS-mobile`, `cc-live-Android-mobile`). Uses `globalSetup` in `global.setup.js`.
- **`envs/envs.js`** — Maps environment aliases (e.g., `@cc_stage`, `@cc_live`, `@adobe_prod`) to base URLs.
- **`global.setup.js`** — Detects environment (GitHub Actions, CircleCI, local) and sets `PR_BRANCH_LIVE_URL` or `LOCAL_TEST_LIVE_URL` accordingly.

## Environment Variables

| Variable | Purpose |
|---|---|
| `BASE_URL` | Override the `baseURL` in playwright config |
| `FEATURE_BRANCH_LIVE_URL` | Override test URL when running locally against a feature branch |
| `IMS_EMAIL` / `IMS_PASS` | IMS login credentials for tests requiring authentication |
| `CI` | Set by CI; enables retries (2), limits workers (2), uses GitHub reporter |

## Tagging Convention

Tags in `features[n].tags` double as Playwright grep filters. The pattern is:
- `@cc` — all CC tests
- `@cc-<feature>` — feature-level grouping (e.g., `@cc-fireflygallery`)
- `@cc-<feature>-<scenario>` — scenario-level (e.g., `@cc-fireflygallery-cardhover`)
- `@smoke`, `@regression` — suite-level tags for CI workflows

Add `georouting=off` to paths to prevent geo-redirect interference during testing.
