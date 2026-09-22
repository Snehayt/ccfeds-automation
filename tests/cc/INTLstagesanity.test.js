import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/INTLstagesanity.spec.js';
import Stageintlpages from '../../selectors/cc/INTLstagesanity.page.js';

let stageintlpages;
test.describe('INTL CC, CCT page checks', () => {
  test.beforeEach(async ({ page }) => {
    stageintlpages = new Stageintlpages(page);
  });
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('free trail, buy now, phone number CTA, marquee CTAs, Price pods checks', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('STAGE CC business US page checks', async () => {
      await page.waitForLoadState();
      await expect(stageintlpages.gnavFreeTrial).toBeVisible();
      await expect(stageintlpages.gnavBuyNow).toBeVisible();
      await expect(stageintlpages.gnavContactSalesPhoneNumner).toBeVisible();
      await expect(stageintlpages.freeTrial).toBeVisible();
      await expect(stageintlpages.jarvisFeature).toBeVisible();
      await expect(stageintlpages.merchCard).toBeVisible();
      await expect(stageintlpages.cardPrice).toBeVisible();
    });
  });
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('CC india locale sanity', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('CC IN locale Gnav, Marquee, tabs, price, javis checks', async () => {
      await page.waitForLoadState();
      await expect(stageintlpages.gnavFeatures).toBeVisible();
      await expect(stageintlpages.gnavComparePlans).toBeVisible();
      await expect(stageintlpages.marqueeFreeTrial).toBeVisible();
      await expect(stageintlpages.tabsFeature).toBeVisible();
      await expect(stageintlpages.stickyPromoBar).toBeVisible();
      await expect(stageintlpages.jarvisFeature).toBeVisible();
    });
  });
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('KR Locale Student page sanidy', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('KR locale CC Stu page for megamenu,bread crumbs, masonry blk, marquee , prices, student phno, footer ', async () => {
      await page.waitForLoadState();
      await expect(stageintlpages.megaMenuItem).toBeVisible();
      await expect(stageintlpages.breadCrumb).toBeVisible();
      await expect(stageintlpages.marqueeBuyCTA).toBeVisible();
      await expect(stageintlpages.masonryLayout).toBeVisible();
      await expect(stageintlpages.marqueePrice).toBeVisible();
      await expect(stageintlpages.priceCard).toBeVisible();
      await expect(stageintlpages.studentSupportPhoneNumber).toBeVisible();
      await expect(stageintlpages.globelFooter).toBeVisible();
    });
  });
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('JP Photoshop checks', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('JP PS product integreation,mobile/tablet/desktop promo presence check', async () => {
      await page.waitForLoadState();
      await expect(stageintlpages.psNavigationToProduct).toBeVisible();
      await expect(stageintlpages.mobilePromoText).toBeVisible();
      await expect(stageintlpages.tabletPromoText).toBeVisible();
      await expect(stageintlpages.desktopPromoText).toBeVisible();
    });
  });
  test(`${features[4].name},${features[4].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[4].path}`);
    await test.step('FR locale premiere product page checks', async () => {
      await page.goto(`${baseURL}${features[4].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[4].path}`);
    });
    await test.step('FR Premier page for princing , merch card checks', async () => {
      await page.waitForLoadState();
      await expect(stageintlpages.pricingModelReferece).toBeVisible();
      await expect(stageintlpages.merchCard1).toBeVisible();
      await expect(stageintlpages.merchCard2).toBeVisible();
      await expect(stageintlpages.jarvisFeature).toBeVisible();
    });
  });
  test(`${features[5].name},${features[5].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[5].path}`);
    await test.step('FR CC Business page checks', async () => {
      await page.goto(`${baseURL}${features[5].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[5].path}`);
    });
    await test.step('FR business admin console, sale contact, bu tabs, product feature table test', async () => {
      await page.waitForLoadState();
      await expect(stageintlpages.adminConsoleGnavLink).toBeVisible();
      await expect(stageintlpages.salesContactGnavLink).toBeVisible();
      await expect(stageintlpages.businessTabListContainer).toBeVisible();
      await expect(stageintlpages.productFeatureTable).toBeVisible();
      await expect(stageintlpages.firstRow).toBeVisible();
      await expect(stageintlpages.secondRow).toBeVisible();
    });
  });
});
