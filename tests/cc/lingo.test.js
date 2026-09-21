import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/lingo.spec.js';
import Lingo from '../../selectors/cc/lingo.page.js';

let lingo;
test.describe('Validate lingo functionality', () => {
  test.beforeEach(async ({ page }) => {
    lingo = new Lingo(page);
  });

  // Common utility method reused by all test cases.
  async function gotoAndVerify(page, baseURL, path) {
    console.info(`[Test Page]: ${baseURL}${path}`);
    await page.goto(`${baseURL}${path}`);
    await expect(page).toHaveURL(`${baseURL}${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10_000);
  }

  test(`${features[0].name},${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('lingo banner shows in page from country you visiting (IN)', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[0].path}`);
    });
    await test.step('lingo banner (IN) shows in page', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      await expect(lingo.langBanner).toBeVisible();
      expect(await lingo.bannerText_IN).toBeVisible();
      expect(await lingo.langBannerContinueLink).toBeVisible();
      expect(await lingo.bannerCloseBtn).toBeVisible();
    });
  });
  test(`${features[1].name},${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('check if lingo banner closed then its not appear again', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[1].path}`);
    });
    await test.step('lingo banner cancle and not show again', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      await expect(lingo.langBanner).toBeVisible();
      expect(await lingo.bannerText_IN).toBeVisible();
      expect(await lingo.langBannerContinueLink).toBeVisible();
      expect(await lingo.bannerCloseBtn).toBeVisible();
      await lingo.bannerCloseBtn.click();
      await page.waitForTimeout(3000);
      await expect(lingo.bannerText_IN).not.toBeVisible();
      await lingo.navPriceLink.click();
      await page.waitForLoadState();
      await page.waitForTimeout(3000);
      await expect(lingo.bannerText_IN).not.toBeVisible();
      await expect(lingo.langBanner).not.toBeVisible();
    });
  });
  test(`${features[2].name},${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('Accept lingo banner proposel and change to respective country lang', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[2].path}`);
    });
    await test.step('accept lingo locale banner', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      await expect(lingo.langBanner).toBeVisible();
      expect(await lingo.bannerText_IN).toBeVisible();
      expect(await lingo.langBannerContinueLink).toBeVisible();
      expect(await lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerContinueLink.click();
      await page.waitForTimeout(2000);
      const expectedUrl = features[2].url;
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  test(`${features[3].name},${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('direct lang urls, Ex, UK or NZ then user should be in same language, WPS rule', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[3].path}`);
    });
    await test.step('direct supported lang urls, Ex UK then user should be in same language', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      const expectedUrl = features[3].url;
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  test(`${features[4].name},${features[4].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[4].path}`);
    await test.step('Non direct lang url, ex sg and user should be go to US page, WPS rule', async () => {
      await page.goto(`${baseURL}${features[4].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[4].path}`);
    });
    await test.step('Non direct lang url, ex sg and user go to US', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      const expectedUrl = features[4].url;
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  test(`${features[5].name},${features[5].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[5].path}`);
    await test.step('GEO routing model should not show in lingo site', async () => {
      await page.goto(`${baseURL}${features[5].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[5].path}`);
    });
    await test.step('GEO routing model should not show in lingo site', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
    });
  });
  test(`${features[6].name},${features[6].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[6].path}`);
    await test.step('language picker should have 11 languages', async () => {
      await page.goto(`${baseURL}${features[6].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[6].path}`);
    });
    await test.step('language picker 11 language list checking', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      await expect(lingo.langSelector).toBeVisible();
      await lingo.langSelector.click();
      const expected_Languages = [
        'Deutsch', 'English (Australia)', 'English (India)',
        'English (UK)', 'English (US)', 'Español',
        'Français', 'Italiano', 'Português', '日本語', '한국인'];
      const languageItems = await lingo.languageList.allTextContents();
      console.log('Extracted Language Items:', languageItems);
      expect(languageItems).toEqual(expected_Languages);
    });
  });
  test(`${features[7].name},${features[7].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[7].path}`);
    await test.step('site should change as per selected language', async () => {
      await page.goto(`${baseURL}${features[7].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(`${baseURL}${features[7].path}`);
    });
    await test.step('selected language site should load', async () => {
      await page.waitForLoadState();
      await page.waitForTimeout(10000);
      await expect(lingo.langSelector).toBeVisible();
      await lingo.langSelector.click();
      await lingo.langJapan.click();
      await page.waitForTimeout(2000);
      const expectedUrl = features[7].url;
      await expect(page).toHaveURL(expectedUrl);
    });
  });
  test(`${features[8].name},${features[8].tags}`, async ({ page, baseURL }) => {
    await test.step('When I visit a page that matches my region and language', async () => {
      await gotoAndVerify(page, baseURL, features[8].path);
      const expectedUrl = features[8].url;
      await expect(page).toHaveURL(expectedUrl);
      await page.waitForTimeout(10_000);
      await expect(lingo.georouting).toHaveCount(0);
      await expect(lingo.langBanner).toHaveCount(0);
    });
  });
  test(`${features[9].name},${features[9].tags}`, async ({ page, baseURL }) => {
    await test.step('When I visit a page from a region different from my language choice', async () => {
      await gotoAndVerify(page, baseURL, features[9].path);
      const expectedUrl = features[9].url;
      await expect(page).toHaveURL(expectedUrl);
      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('Diese seite anzeigen in Deutsch.');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[9].bannerLink);
      await expect(lingo.langBannerLink).toHaveText('Weitermachen');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();
      await page.waitForFunction(() => document.cookie.includes('international='));
      const cookies = await page.context().cookies();
      const internationalCookie = cookies.find(
        (cookie) => cookie.name === 'international',
      );
      expect(internationalCookie).toBeDefined();
      expect(internationalCookie?.value).toBe('de');
      await expect(page).toHaveURL(features[9].bannerLink);
    });
  });
  test(`${features[10].name},${features[10].tags}`, async ({ page, baseURL }) => {
    await test.step('When I visit a page, cookies should not be set and the banner should not be displayed', async () => {
      await gotoAndVerify(page, baseURL, features[10].path);
      const expectedUrl = features[10].url;
      await expect(page).toHaveURL(expectedUrl);
      await expect(lingo.georouting).toHaveCount(0);
      await expect(lingo.langBanner).toHaveCount(0);
      const cookies = await page.context().cookies();
      const internationalCookie = cookies.find(
        (cookie) => cookie.name === 'international',
      );
      expect(internationalCookie).toBeUndefined();
    });
  });
  test(`${features[11].name},${features[11].tags}`, async ({ page, baseURL }) => {
    await test.step('When I visit a page, the US banner should be displayed', async () => {
      await gotoAndVerify(page, baseURL, features[11].path);
      const expectedUrl = features[11].url;
      await expect(page).toHaveURL(expectedUrl);
      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('View this page in English (US).');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[11].bannerLink);
      await expect(lingo.langBannerLink).toHaveText('Continue');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();
      await page.waitForFunction(() => document.cookie.includes('international='));
      const cookies = await page.context().cookies();
      const internationalCookie = cookies.find(
        (cookie) => cookie.name === 'international',
      );
      expect(internationalCookie).toBeDefined();
      expect(internationalCookie?.value).toBe('us');
      await expect(page).toHaveURL(features[11].bannerLink);
    });
  });
  test(`${features[12].name},${features[12].tags}`, async ({ page, baseURL }) => {
    await test.step('Visiting the JP and CH locales shows the DE banner, and accepting it redirects to the DE page', async () => {
      await gotoAndVerify(page, baseURL, features[12].path);
      const expectedUrl = features[12].url;
      await expect(page).toHaveURL(expectedUrl);
      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('Diese seite anzeigen in Deutsch.');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[12].bannerLink);
      await expect(lingo.langBannerLink).toHaveText('Weitermachen');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();
      await page.waitForFunction(() => document.cookie.includes('international='));
      const cookies = await page.context().cookies();
      const internationalCookie = cookies.find(
        (cookie) => cookie.name === 'international',
      );
      expect(internationalCookie).toBeDefined();
      expect(internationalCookie?.value).toBe('de');
      await expect(page).toHaveURL(features[12].bannerLink);
    });
  });
  test(`${features[13].name},${features[13].tags}`, async ({ page, baseURL }) => {
    await test.step('When I visit a page, the banner should not be displayed', async () => {
      await gotoAndVerify(page, baseURL, features[13].path);
      const expectedUrl = features[13].url;
      await expect(page).toHaveURL(expectedUrl);
      await expect(lingo.georouting).toHaveCount(0);
      await expect(lingo.langBanner).toHaveCount(0);
      const cookies = await page.context().cookies();
      const internationalCookie = cookies.find(
        (cookie) => cookie.name === 'international',
      );
      expect(internationalCookie).toBeUndefined();
    });
  });
  test(`${features[14].name},${features[14].tags}`, async ({ page, baseURL }) => {
    const getInternationalCookie = async () => {
      const cookies = await page.context().cookies();
      return cookies.find((cookie) => cookie.name === 'international');
    };

    await test.step('US and CH locales show the DE banner; selecting FR redirects to the IT page and displays the FR banner', async () => {
      await gotoAndVerify(page, baseURL, features[14].path);
      const expectedUrl = features[14].url;
      await expect(page).toHaveURL(expectedUrl);

      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('Diese seite anzeigen in Deutsch.');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[14].bannerLink);
      await expect(lingo.langBannerLink).toHaveText('Weitermachen');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();

      await expect(async () => {
        const cookie = await getInternationalCookie();
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('de');
      }).toPass();

      await expect(page).toHaveURL(features[14].bannerLink);
      await page.waitForLoadState('domcontentloaded');

      await lingo.regionPicker.click();
      await lingo.frenchLang.click();
      await expect(page).toHaveURL(features[14].changeRegionURL);
      await page.waitForLoadState('domcontentloaded');

      await expect(async () => {
        const cookie = await getInternationalCookie();
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('fr');
      }).toPass();

      await page.goto(features[14].redirectURL);
      await expect(page).toHaveURL(features[14].redirectURL);
      await page.waitForLoadState('networkidle');

      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('Voir cette page en Français.');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[14].expectedURl);
      await expect(lingo.langBannerLink).toHaveText('Continuer');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();

      await expect(async () => {
        const cookie = await getInternationalCookie();
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('fr');
      }).toPass();
    });
  });

  test(`${features[15].name},${features[15].tags}`, async ({ page, baseURL }) => {
    const getInternationalCookie = async () => {
      const cookies = await page.context().cookies();
      return cookies.find((cookie) => cookie.name === 'international');
    };

    await test.step('US and CH locales show the DE banner; selecting IT redirects to the DE page and displays the IT banner', async () => {
      await gotoAndVerify(page, baseURL, features[15].path);
      const expectedUrl = features[15].url;
      await expect(page).toHaveURL(expectedUrl);

      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('Diese seite anzeigen in Deutsch.');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[15].bannerLink);
      await expect(lingo.langBannerLink).toHaveText('Weitermachen');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();

      await expect(async () => {
        const cookie = await getInternationalCookie();
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('de');
      }).toPass();

      await expect(page).toHaveURL(features[15].bannerLink);
      await page.waitForLoadState('domcontentloaded');

      await lingo.regionPicker.click();
      await lingo.italyLang.click();
      await expect(page).toHaveURL(features[15].changeRegionURL);
      await page.waitForLoadState('domcontentloaded');

      await expect(async () => {
        const cookie = await getInternationalCookie();
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('it');
      }).toPass();

      await page.goto(features[15].redirectURL);
      await expect(page).toHaveURL(features[15].redirectURL);
      await page.waitForLoadState('networkidle');

      await expect(lingo.langBanner).toBeVisible();
      await expect(lingo.langBannerTxt).toHaveText('Visualizza questa pagina in Italiano.');
      await expect(lingo.langBannerLink).toHaveAttribute('href', features[15].expectedURl);
      await expect(lingo.langBannerLink).toHaveText('Continuare');
      await expect(lingo.bannerCloseBtn).toBeVisible();
      await lingo.langBannerLink.click();

      await expect(async () => {
        const cookie = await getInternationalCookie();
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('it');
      }).toPass();
    });
  });
});
