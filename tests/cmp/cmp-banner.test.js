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

/*
 * Content extraction script — run once to generate feds-cmp-locales.js entries.
 * Uncomment and run directly with: node tests/cmp/cmp-banner.test.js
 *
(async () => {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: false });
  const extractedContent = {};

  for (const language of languages) {
    extractedContent[language.key] = {};
    for (const banner of bannerUrls) {
      const context = await browser.newContext({
        locale: language.locale,
        extraHTTPHeaders: { 'Accept-Language': language.header },
      });
      const page = await context.newPage();
      const fullUrl = `${banner.url}${language.location}`;
      console.log(`Navigating: ${fullUrl}`);
      await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });

      const bannerPage = new BannerPage(page);
      await bannerPage.bannerContainer.waitFor({ state: 'visible', timeout: 15000 });

      extractedContent[language.key][banner.name] = {
        bannerTitle: (await bannerPage.bannerTitle.textContent())?.trim(),
        bannerDescription: (await bannerPage.bannerDescription.textContent())?.trim(),
        buttons: {
          cookieSettingCTA: (await bannerPage.cookieSettingCTA.textContent())?.trim(),
          dontEnableCTA: (await bannerPage.dontEnableCTA.textContent())?.trim(),
          enableAllCTA: (await bannerPage.enableAllCTA.textContent())?.trim(),
        },
      };
      console.log(`Extracted: ${language.key} - ${banner.name}`);
      await context.close();
    }
  }

  console.log('----- COPY BELOW JSON -----');
  console.log(JSON.stringify(extractedContent, null, 2));
  console.log('----- END JSON -----');
  await browser.close();
})();
*/
