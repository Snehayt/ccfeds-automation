import { test as base, expect } from '@playwright/test';

// Adds a fixed delay after every test across the suite, so sequential runs
// (single worker locally, 2 workers on CI) don't hammer shared environments
// with rapid back-to-back requests.
const TEST_SPACING_MS = 5000;

const test = base.extend({});

test.afterEach(async () => {
  await new Promise((resolve) => { setTimeout(resolve, TEST_SPACING_MS); });
});

export { test, expect };
