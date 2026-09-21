import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/merchcard.spec.js';
import Merchcard from '../../selectors/cc/merchcard.page.js';

let merchcard;
test.describe('verify merch card UI and its features', () => {
  test.beforeEach(async ({ page }) => {
    merchcard = new Merchcard(page);
  });

  // Test merch card UI
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('merch card UI elements check', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('verify merch card UI and its section elements', async () => {
      await page.waitForLoadState();
      await expect(merchcard.merchCard).toBeVisible();
      await expect(merchcard.merchProductTitle).toBeVisible();
      await expect(merchcard.meachBodyAppText).toBeVisible();
      await expect(merchcard.merchActionArea).toBeVisible();
      await expect(merchcard.merchFooterDiscription).toBeVisible();
      await expect(merchcard.merchFooerIcon).toBeVisible();
      await expect(merchcard.BestValueBadge).toBeVisible();
    });
  });

  // price, CTA buttons and its navigation to correct commerce pages
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('free, buy CTAs with valid navigation', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('free, buynow price cta should work as expected navigation', async () => {
      await page.waitForLoadState();
      await expect(merchcard.merchBodyPrice).toBeVisible();
      await expect(merchcard.mercHeadPrice).toBeVisible();
      await merchcard.merchBuyNowCTA.click();
      await expect(page).toHaveURL(/.*commerce.adobe.com/);
    });
  });

  test.fixme(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('merch card should display when refenced from fragment', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('all prices are showing in merch cards', async () => {
      await page.waitForLoadState();
      // Fragment references are resolved/injected asynchronously after load.
      await page.waitForTimeout(8000);
      await expect(merchcard.fragmentsection).toBeVisible();
      await expect(merchcard.ccAllappsPrice).toBeVisible();
      await expect(merchcard.ccOtherAppsPrice).toBeVisible();
      await expect(merchcard.ccPhotographyPrice).toBeVisible();
      await expect(merchcard.ccSingleApp).toBeVisible();
      await expect(merchcard.ccOfferPrice).toBeVisible();
      await expect(merchcard.ccBusinessSingleApp).toBeVisible();
      await expect(merchcard.ccBusinessAllApps).toBeVisible();
    });
  });
});
