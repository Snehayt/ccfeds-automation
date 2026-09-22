import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/mobile-branch-banner.spec.js';
import Mobilebanner from '../../selectors/cc/mobile-branch-banner.page.js';

let mobilebanner;
test.describe('verify mobile branch banner presence CC pages', () => {
  test.beforeEach(async ({ page }) => {
    mobilebanner = new Mobilebanner(page);
  });
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('branch banner shows in page', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('mobile branch banner shows in page', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(6000);
      await expect(mobilebanner.branchBanner).toBeVisible();
      await expect(mobilebanner.branchBannerAnimation).toBeVisible();
      await expect(mobilebanner.branchBannerIcon).toBeVisible();
      await expect(mobilebanner.branchBannerDescription).toBeVisible();
      await expect(mobilebanner.branchBannerProductRatings).toBeVisible();
      await expect(mobilebanner.branchBannerReviews).toBeVisible();
      await expect(mobilebanner.branchProductCTA).toBeVisible();
    });
  });
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('branch banner CTA click and navigation', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('branch banner CTA click and navigation', async () => {
      await page.waitForLoadState();
      // below wait is required to load the banner in mobile
      await page.waitForTimeout(10000);
      await mobilebanner.branchProductCTA.click();
      expect(await mobilebanner.url).toBeTruthy();
    });
  });
});
