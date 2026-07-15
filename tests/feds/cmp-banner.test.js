import { test, expect } from '@playwright/test';
import { default as AxeBuilder } from '@axe-core/playwright';
import CmpBannerPage from '../../selectors/feds/cmp-banner.page.js';
import { cmpBannerUrls, cmpLanguages, fedsCmpLocales } from '../../features/feds/cmp-banner/cmp-banner.spec.js';

test.describe('CMP Banner — OneTrust consent across products and locales', () => {
  cmpLanguages.forEach((language) => {
    cmpBannerUrls.forEach((banner) => {
      const fullUrl = `${banner.url}${language.location}`;
      const expectedText = fedsCmpLocales[language.key];

      // ── Accept All — runs for every locale ──────────────────────────────
      test(`${banner.name} | ${language.country} | Accept All ${banner.tags}`, async ({ browser }) => {
        const context = await browser.newContext({
          locale: language.locale,
          extraHTTPHeaders: { 'Accept-Language': language.header },
        });
        const page = await context.newPage();
        const bannerPage = new CmpBannerPage(page);
        console.info(`[CMP] Accept All — ${fullUrl}`);

        await test.step('Navigate and clear cookies', async () => {
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
          await expect(page).toHaveURL(fullUrl);
          await context.clearCookies();
        });

        await test.step('Banner visible', async () => {
          await bannerPage.validateBannerVisible();
        });

        await test.step('Accessibility scan on banner', async () => {
          const a11y = await new AxeBuilder({ page })
            .include('#onetrust-banner-sdk')
            .analyze();
          expect.soft(a11y.violations.length, 'Banner a11y violations').toBeLessThan(5);
        });

        await test.step('Banner text matches locale', async () => {
          await bannerPage.validateBannerContents(expectedText);
        });

        await test.step('Consent persistence — banner reappears before accepting', async () => {
          await bannerPage.validateBannerPersistencePreConsent();
        });

        await test.step('Cookie Settings modal structure', async () => {
          await bannerPage.cookieSettingsModalLocalised(expectedText);
          await bannerPage.clickCookieSettingsModal();
        });

        await test.step('Cookie groups pre-consent — only C0001 active', async () => {
          await bannerPage.assertCookieGroupsPreConsent();
        });

        await test.step('Accept All — banner dismissed', async () => {
          await bannerPage.validateEnableAll();
        });

        await test.step('Consent persistence — banner gone after accepting', async () => {
          await bannerPage.validateBannerPersistencePostConsent();
        });

        await test.step('Cookie groups post-consent — C0001–C0004 all active', async () => {
          await bannerPage.assertCookieGroupsPostConsent();
        });

        await context.clearCookies();
        await context.close();
      });

      // ── Reject All — EU/GDPR countries only ─────────────────────────────
      if (language.isEU) {
        test(`${banner.name} | ${language.country} | Reject All ${banner.tags}`, async ({ browser }) => {
          const context = await browser.newContext({
            locale: language.locale,
            extraHTTPHeaders: { 'Accept-Language': language.header },
          });
          const page = await context.newPage();
          const bannerPage = new CmpBannerPage(page);
          console.info(`[CMP] Reject All — ${fullUrl}`);

          await test.step('Navigate and clear cookies', async () => {
            await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
            await expect(page).toHaveURL(fullUrl);
            await context.clearCookies();
          });

          await test.step('Banner visible', async () => {
            await bannerPage.validateBannerVisible();
          });

          await test.step('Banner text matches locale', async () => {
            await bannerPage.validateBannerContents(expectedText);
          });

          await test.step('Cookie groups pre-consent — only C0001 active', async () => {
            await bannerPage.assertCookieGroupsPreConsent();
          });

          await test.step('Reject All — banner dismissed', async () => {
            await bannerPage.validateDontEnable();
          });

          await test.step('Cookie groups after reject — only C0001 active, C0002–C0004 blocked', async () => {
            await bannerPage.assertCookieGroupsAfterReject();
          });

          await test.step('Consent persistence — banner gone after rejecting', async () => {
            await bannerPage.validateBannerPersistencePostConsent();
          });

          await context.clearCookies();
          await context.close();
        });
      }
    });
  });
});
