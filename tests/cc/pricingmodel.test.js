import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/pricingmodel.spec.js';
import Pricemodel from '../../selectors/cc/pricingmodel.page.js';

let pricemodel;
test.describe('verify merch card UI and its features', () => {
  test.beforeEach(async ({ page }) => {
    pricemodel = new Pricemodel(page);
  });
  // Test pricing Model
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('merch card UI elements check', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('Verify pricing model loads , UI tabs and close funtionw works', async () => {
      await page.waitForLoadState();
      await expect(pricemodel.startFreeTrialCTA).toBeVisible();
      await pricemodel.startFreeTrialCTA.click();
      await page.waitForTimeout(4000);
      await expect(pricemodel.ModelWindow).toBeVisible();
      await expect(pricemodel.modelHeading).toBeVisible();
      await expect(pricemodel.tablist).toBeVisible();
      await expect(pricemodel.individualTab).toBeVisible();
      await expect(pricemodel.businessTab).toBeVisible();
      await expect(pricemodel.educationTab).toBeVisible();
      await expect(pricemodel.sslTransactionIndicator).toBeVisible();
      await expect(pricemodel.modelClose).toBeVisible();
      await pricemodel.modelClose.click();
      await page.waitForTimeout(2000);
      expect(await pricemodel.ModelWindow.isVisible()).toBeFalsy();
    });
  });

  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('merch card UI elements check', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('Verify pricing model loads in CTA click', async () => {
      await page.waitForLoadState();
      await expect(pricemodel.startFreeTrialCTA).toBeVisible();
      await pricemodel.startFreeTrialCTA.click();
      await page.waitForTimeout(5000);
      await expect(pricemodel.ModelWindow).toBeVisible();
      await expect(pricemodel.modelHeading).toBeVisible();
      await expect(pricemodel.tablist).toBeVisible();
      await expect(pricemodel.individualTab).toBeVisible();
      await expect(pricemodel.businessTab).toBeVisible();
      await expect(pricemodel.educationTab).toBeVisible();
    });
  });
});
