import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/productionsanity.spec.js';
import Prodsanity from '../../selectors/cc/productionsanity.page.js';

let prodsanity;
test.describe('verify Key product pages and features on Production pages', () => {
  test.beforeEach(async ({ page }) => {
    prodsanity = new Prodsanity(page);
  });
  // Test creative cloud page sanity
  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('CC page sanity checks', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('creativecloud page gnav, marquee cta, price pod checks', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.fedsNav).toBeVisible();
      await expect(prodsanity.signIn).toBeVisible();
      await expect(prodsanity.jarvisFeature).toBeVisible();
      await expect(prodsanity.plansPriceingCTA).toBeVisible();
      await prodsanity.plansPriceingCTA.click();
      await expect(prodsanity.pricePods).toBeVisible();
      await expect(prodsanity.ccAllAppsPrice).toBeVisible();
      await expect(prodsanity.ccPhotographyPrice).toBeVisible();
      await expect(prodsanity.buyNowCTA).toBeVisible();
      await prodsanity.buyNowCTA.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/^https:\/\/commerce.adobe.com\/store\/commitment/);
    });
  });
  // Test creative after effects products page sanity
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    const expectedUrl = features[1].url;
    await test.step('after effects products page sanity check', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('After Effects product page sanity', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.localNav).toBeVisible();
      await expect(prodsanity.magaMenuItems).toBeVisible();
      await expect(prodsanity.localNavActiveItem).toBeVisible();
      await expect(prodsanity.afterEffectProductPriceInMarquee).toBeVisible();
      await expect(prodsanity.buyNowAECTA).toBeVisible();
      await prodsanity.buyNowAECTA.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  // creative cloud pricing page elements checks
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('creative cloud pricing page elements checks', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('creative cloud pricing page elements checks sanity', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.universalNav).toBeVisible();
      await expect(prodsanity.startFreeTrialCTA).toBeVisible();
      await expect(prodsanity.tabSection).toBeVisible();
    });
  });
  // Illustrator page sanity checks
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    const expectedUrl = features[3].url;
    await test.step('Illustrator page elements checks', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('Illustrator page sanity checks', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.appSwitcher).toBeVisible();
      await expect(prodsanity.breadCrumb).toBeVisible();
      await expect(prodsanity.freeTrialCTA).toBeVisible();
      await prodsanity.freeTrialCTA.click();
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  // CCT milo pages sanity checks
  test(`${features[4].name},${features[4].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[4].path}`);
    const expectedUrl = features[4].url;
    await test.step('CCT milo pages elements checks', async () => {
      await page.goto(`${baseURL}${features[4].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[4].path}`);
    });
    await test.step('CCT milo pages sanity checks', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.CCBusinessGnavLink).toBeVisible();
      await expect(prodsanity.CCTBuynowCTA).toBeVisible();
      await expect(prodsanity.supportContact).toBeVisible();
      await expect(prodsanity.CCTeamsSingleAppPrice).toBeVisible();
      await expect(prodsanity.jarvisFeature).toBeVisible();
      await prodsanity.CCTBuynowCTA.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  // CC Model with price segments
  test(`${features[5].name},${features[5].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[5].path}`);
    await test.step('CC Model with price segments', async () => {
      await page.goto(`${baseURL}${features[5].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[5].path}`);
    });
    await test.step('CC Model with price segments sanity check', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.modelNavList).toBeVisible();
      await expect(prodsanity.individualPlanTab).toBeVisible();
      await expect(prodsanity.businessPlanTab).toBeVisible();
      await expect(prodsanity.studentAndTeacherTab).toBeVisible();
      await expect(prodsanity.IndividualPlanProduct1).toBeVisible();
      await expect(prodsanity.IndividualPlanProduct2).toBeVisible();
      await expect(prodsanity.IndividualPlanProduct1Price).toBeVisible();
      await expect(prodsanity.IndividualPlanProduct2Price).toBeVisible();
      await expect(prodsanity.subscriptionModelPanel).toBeVisible();
      await expect(prodsanity.panelSubScriptionPick1).toBeVisible();
      await expect(prodsanity.panelSubScriptionPick2).toBeVisible();
      await expect(prodsanity.purchaseCTA).toBeVisible();
    });
  });
  // CC UK animation discorvery page sanity
  test(`${features[6].name},${features[6].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[6].path}`);
    const expectedUrl = features[6].url;
    await test.step('CC UK animation discorvery page sanity ', async () => {
      await page.goto(`${baseURL}${features[6].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[6].path}`);
    });
    await test.step('CC UK animation discorvery page sanity check', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.UKGnavPriceCTA).toBeVisible();
      await expect(prodsanity.breadCrumbUKAnimationLink).toBeVisible();
      await expect(prodsanity.jarvisFeature).toBeVisible();
      await expect(prodsanity.LearnMoreLink).toBeVisible();
      await prodsanity.LearnMoreLink.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  // CC DE tools page sanity
  test(`${features[7].name},${features[7].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[7].path}`);
    const expectedUrl = features[7].url;
    await test.step('CC DE tools page sanity ', async () => {
      await page.goto(`${baseURL}${features[7].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[7].path}`);
    });
    await test.step('CC DE tools page sanity check', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.DEGnavPriceCTA).toBeVisible();
      await expect(prodsanity.ExpandableGnavMenuItems).toBeVisible();
      await expect(prodsanity.jarvisFeature).toBeVisible();
      await expect(prodsanity.NavLocalizaedItems1).toBeVisible();
      await expect(prodsanity.consonantCards).toBeVisible();
      await prodsanity.DEGnavPriceCTA.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  // CC JP file types page sanity
  test(`${features[8].name},${features[8].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[8].path}`);
    const expectedUrl = features[8].url;
    await test.step('CC JP file types page sanity', async () => {
      await page.goto(`${baseURL}${features[8].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[8].path}`);
    });
    await test.step('CC JP file types page sanity check', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.JPGnavPriceCTA).toBeVisible();
      await expect(prodsanity.JPExpandableMegaMenu).toBeVisible();
      await expect(prodsanity.jarvisFeature).toBeVisible();
      await expect(prodsanity.LocalizedNavLinks).toBeVisible();
      await expect(prodsanity.CCJPAllAppsPrice).toBeVisible();
      await expect(prodsanity.checkOutLink).toBeVisible();
      await prodsanity.JPGnavPriceCTA.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  // CC FR animation discover page sanity
  test(`${features[9].name},${features[9].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[9].path}`);
    const expectedUrl = features[9].marqueelink;
    await test.step('CC FR animation discover page sanity', async () => {
      await page.goto(`${baseURL}${features[9].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[9].path}`);
    });
    await test.step('CC FR animation discover page sanity check', async () => {
      await page.waitForLoadState();
      await expect(prodsanity.Gnav).toBeVisible();
      await expect(prodsanity.FRLocalizedNavLinks).toBeVisible();
      await expect(prodsanity.jarvisFeature).toBeVisible();
      await expect(prodsanity.marqueeCTAFR).toBeVisible();
      await prodsanity.marqueeCTAFR.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(expectedUrl);
    });
  });
});
