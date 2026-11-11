const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

const targetUrls = (process.env.TARGET_URLS || '').split(',').map(u => u.trim()).filter(Boolean);
const changedComponent = process.env.CHANGED_COMPONENT || 'global-navigation';

for (const url of targetUrls) {
  test.describe(`Real Live Audit: ${url}`, () => {

    test('1. Network Status 200 & Component Load', async ({ page }) => {
      let assetLoaded = false;
      const consoleErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      page.on('response', resp => {
        if (resp.url().includes(changedComponent)) {
          assetLoaded = true;
          expect(resp.status(), `Asset failed with ${resp.status()}`).toBeLessThan(400);
        }
      });

      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 35000 });
      expect(response.status(), `Page returned ${response.status()}`).toBe(200);
      expect(consoleErrors, `Console errors: ${consoleErrors.join(' | ')}`).toHaveLength(0);
      expect(assetLoaded, `Expected component '${changedComponent}' to load on ${url}`).toBeTruthy();
    });

    test('2. Gnav Brand Logo CLS & Dimensions', async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const header = page.locator('header, .global-navigation, .feds-header');
      await expect(header).toBeVisible();

      const logoImg = header.locator('img').first();
      if (await logoImg.count() > 0) {
        await expect(logoImg).toBeVisible();
        const width = await logoImg.getAttribute('width');
        const height = await logoImg.getAttribute('height');
        expect(width, 'Brand logo missing width attribute (causes CLS)').toBeTruthy();
        expect(height, 'Brand logo missing height attribute (causes CLS)').toBeTruthy();
      }
    });

    test('3. Accessibility Audit (@axe-core)', async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const results = await new AxeBuilder({ page })
        .include('header, footer')
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const critical = results.violations.filter(v => v.impact === 'critical');
      expect(critical, `A11y critical violations found: ${JSON.stringify(critical)}`).toEqual([]);
    });

  });
}