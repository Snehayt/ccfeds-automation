import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/promocloseaction.spec.js';
import Promocloseaction from '../../selectors/cc/promocloseaction.page.js';

let promoaction;
test.describe('verify promo action bar with CTAs, close, stickiness features in page', () => {
  test.beforeEach(async ({ page }) => {
    promoaction = new Promocloseaction(page);
  });

  // Test sticky promo bar shows up in page bottom when page loads
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('promo bar with close action shows up in page bottom when it loads', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('promo action with close at page botton with stickiness', async () => {
      await page.waitForLoadState();
      await expect(promoaction.promoBar).toBeVisible();
      await expect(promoaction.promoBarMobile).toBeVisible();
      await expect(promoaction.promoBarTablet).toBeVisible();
      await expect(promoaction.promoBarDesktop).toBeVisible();
      await expect(promoaction.PromoText).toBeVisible();
      await expect(promoaction.promoBackGroundImage).toBeVisible();
    });
  });

  // Test promo bar closed when hit cross icon on it and promo disappear
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('Test promo bar closed when hit cross icon on it', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('Test promo bar closed when hit cross icon on it and disappear in page', async () => {
      await page.waitForLoadState();
      await promoaction.promoClose.click();
      await expect(promoaction.promoNotSticky).toBeVisible();
    });
  });

  // Test promo bar CTAs navigates valid urls
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    const expectedUrl = features[2].url;
    await test.step('sticky promo bar CTAs are working', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('promo bar CTAs naviagate to valid destination', async () => {
      await page.waitForLoadState();
      await promoaction.promoCTA.click();
      await expect(page).toHaveURL(expectedUrl);
    });
  });
});
