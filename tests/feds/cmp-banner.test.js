import { test, expect } from '@playwright/test';
import BannerPage from '../../selectors/cmp/cmp-banner.page.js';
import { fedsCmpLocales as bannerContent } from '../../data/feds-cmp-locales.js';
import { cmpBannerUrls as bannerUrls, cmpLanguages as languages } from '../../data/feds-cmp-banner.js';

languages.forEach((language) => {
  test.describe(`${language.locale}`, () => {
    bannerUrls.forEach((banner) => {
      test(`${banner.name} ${banner.tags} [TC-${banner.tcid}]`, async ({ browser }) => {
        const context = await browser.newContext({
          locale: language.locale,
          extraHTTPHeaders: { 'Accept-Language': language.header },
        });

        const page = await context.newPage();
        const fullUrl = `${banner.url}${language.location}`;

        console.log(`Testing: ${fullUrl}`);

        await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveURL(fullUrl);

        const bannerPage = new BannerPage(page);

        await context.clearCookies();

        // 1. Validate banner is visible
        await bannerPage.validateBannerVisible();

        // 2. Validate banner text for this locale
        const expectedText = bannerContent[language.key];
        await bannerPage.validateBannerContents(expectedText);

        // 3. Validate cookie settings modal text
        await bannerPage.cookieSettingsModalLocalised(expectedText);

        // 4. Validate full modal structure
        await bannerPage.clickCookieSettingsModal();

        await context.clearCookies();
        await context.close();
      });
    });
  });
});
