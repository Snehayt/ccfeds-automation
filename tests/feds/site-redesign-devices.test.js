import { expect, test } from '@playwright/test';
import { features } from '../../features/feds/site-redesign.spec.js';
import SiteRedesignDevicePage from '../../selectors/feds/site-redesign-devices.page.js';
import { AnalyticsInterceptor } from '../../utils/analytics/analytics.interceptor.js';
import { runAxeScan, getViolationSummary } from '../../utils/accessibility/axe-runner.js';

// ─────────────────────────────────────────────────────────────────────────────
// runChecks — runs all device checks on a single locale.
// Hard fail : page load, layout detection — stops the test immediately.
// Soft fail : every other check — caught individually so all steps run.
// At the end, if any soft checks failed the test fails with a summary.
// ─────────────────────────────────────────────────────────────────────────────
async function runChecks(page, baseURL, props) {
  const nav       = new SiteRedesignDevicePage(page);
  const analytics = new AnalyticsInterceptor(page);
  analytics.start();

  const failures = [];

  async function check(name, fn) {
    try {
      await test.step(name, fn);
    } catch (e) {
      const detail = e.message.split('\n').slice(0, 4).join(' | ').replace(/\s+/g, ' ').trim();
      failures.push({ name, detail });
    }
  }

  try {
    // ── 1. Page load (hard fail) ───────────────────────────────────────────
    await test.step('Page load — check HTTP status', async () => {
      const { url, status } = await nav.navigateTo(baseURL, '', props.path);
      if (status === 404 || status === 410) {
        test.info().annotations.push({ type: 'skip-reason', description: `HTTP ${status}: ${url}` });
        test.skip(true, `Page not found (HTTP ${status}) for ${props.country}`);
        return;
      }
      expect(status, `Expected 2xx for ${url}`).toBeLessThan(400);
    });

    // ── 2. Layout check (hard fail — must be mobile/tablet) ───────────────
    await test.step('Layout — confirm mobile/tablet layout (hamburger visible)', async () => {
      const isDesktop = await nav.isDesktopLayout();
      if (isDesktop) {
        test.info().annotations.push({ type: 'layout', description: 'desktop — skipping device test' });
        test.skip(true, 'Desktop layout detected — use site-redesign.test.js for desktop');
        return;
      }
      test.info().annotations.push({ type: 'layout', description: 'mobile/tablet hamburger layout' });
      console.info('[SiteRedesign-Device] Mobile/tablet layout confirmed ✓');
    });

    // ── 3. Always-visible elements ─────────────────────────────────────────
    await check('Always-visible — Adobe logo, app switcher, Sign In', () => nav.validateAlwaysVisibleElements());
    await check('Always-visible element styles — font + padding on hamburger, Sign In, App Switcher',
      () => nav.validateAlwaysVisibleElementStyles());

    // ── 3b. Scroll behavior (hard fail) ───────────────────────────────────
    await test.step('Nav scroll behavior — transparent at top, solid background + sticky after scroll',
      () => nav.validateNavScrollBehavior());

    // ── 4. Static a11y checks — parallel ──────────────────────────────────
    await Promise.all([
      check('Accessibility — skip link exists in DOM',                    () => nav.validateSkipLink()),
      check(`Accessibility — html[lang] matches "${props.lang}"`,         () => nav.validateLangAttribute(props.lang)),
      check(`RTL direction — html[dir] is rtl for RTL locales`,           () => nav.validateRtlDirection(props.dir)),
    ]);

    // ── 5. Open hamburger (hard fail — all nav steps depend on this) ──────
    await test.step('Hamburger — click opens mobile nav overlay', async () => {
      await nav.openHamburger();
    });

    // ── 6. Nav overlay checks ──────────────────────────────────────────────
    await check('Mobile nav list — Products, Use Cases, Solutions, Learn & Support, Plans visible',
      () => nav.validateMobileNavList(props.country));
    await check('Nav font styles — Adobe Clean on all nav overlay items',
      () => nav.validateNavFontStyles());
    await check('Analytics — daa-ll on hamburger, nav overlay buttons, Adobe logo',
      () => nav.validateNavAnalyticsDaaLl());

    // ── 7–10. Submenus — sequential (each opens/closes panel) ─────────────
    await check('Products submenu — tabs scrollable, All Products link, cards with hrefs',
      () => nav.validateProductsSubmenu());
    await check('Use Cases submenu — vertical list, links have hrefs',
      () => nav.validateUseCasesSubmenu());
    await check('Solutions submenu — Organizations, Industries links have hrefs',
      () => nav.validateSolutionsSubmenu(props.country));
    await check('Learn & Support submenu — Help, Learn, Community, More resources links',
      () => nav.validateLearnSupportSubmenu(props.country));

    // ── 10b–10d. Promo card, CTAs, focus ──────────────────────────────────
    await check('Promo card — Solutions panel promo (Acrobat for Business) validated',
      () => nav.validatePromoCard());
    await check('CTAs — Explore, Contact us, Go to Help/Learn/Community have valid hrefs',
      () => nav.validateSubmenuCtas());
    await check('Accessibility — focused nav elements have visible focus ring',
      () => nav.validateFocusVisible());

    // ── 11. Close hamburger ────────────────────────────────────────────────
    await check('Hamburger — click closes mobile nav overlay', () => nav.closeHamburger());

    // ── 12. Axe-core scan ──────────────────────────────────────────────────
    await check('Accessibility — axe-core WCAG 2.1 AA scan on header.global-navigation', async () => {
      const results         = await runAxeScan(page, { selector: 'header.global-navigation' });
      const violations      = getViolationSummary(results);
      const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      if (violations.length > 0)
        test.info().annotations.push({ type: 'a11y-violations', description: JSON.stringify(violations, null, 2) });
      test.info().annotations.push({
        type: 'accessibility',
        description: criticalSerious.length === 0 ? 'pass' : `FAIL — ${criticalSerious.map((v) => v.id).join(', ')}`,
      });
      expect(criticalSerious, `Critical/serious a11y:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
    });

    // ── 13. Footer ─────────────────────────────────────────────────────────
    await check('Footer — links visible, all have valid hrefs, locale-aware', () => nav.validateFooter());

  } finally {
    analytics.stop();
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (failures.length > 0) {
    throw new Error(
      `${failures.length} check(s) failed on ${baseURL}${props.path}\n` +
      failures.map(({ name, detail }, i) => `  ${i + 1}. ${name}\n     ↳ ${detail}`).join('\n')
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Site Redesign GNAV — Devices', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  features.forEach((props) => {
    test(`${props.name} | ${props.country}`, { tag: props.tags }, async ({ page, baseURL }, testInfo) => {
      testInfo.annotations.push({ type: 'country',   description: props.country });
      testInfo.annotations.push({ type: 'locale',    description: props.code });
      testInfo.annotations.push({ type: 'language',  description: props.lang });
      testInfo.annotations.push({ type: 'direction', description: props.dir });

      console.info(`[SiteRedesign-Device] Testing: ${baseURL}${props.path}`);
      await runChecks(page, baseURL, props);
    });
  });
});
