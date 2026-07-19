import { expect, test } from '@playwright/test';
import { features } from '../../features/feds/site-redesign.spec.js';
import SiteRedesignDevicePage, { FR_SUB_LOCALES } from '../../selectors/feds/site-redesign-devices.page.js';
import { AnalyticsInterceptor } from '../../utils/analytics/analytics.interceptor.js';
import { runAxeScan, getViolationSummary } from '../../utils/accessibility/axe-runner.js';

// ─────────────────────────────────────────────────────────────────────────────
// runChecks — runs all device checks on a single locale, in 3 sections mirroring
// desktop's structure: GNAV bar, Hamburger + dropdowns, Footer. Each section opens
// whatever it needs to open exactly once and runs content + accessibility + analytics
// checks together against that single open/close, instead of re-opening the same
// panel a second time per kind of check.
// Hard fail : page load, layout detection — stops the test immediately.
// Soft fail : every other check — caught individually so all steps run.
// At the end, if any soft checks failed the test fails with a summary.
// ─────────────────────────────────────────────────────────────────────────────
async function runAxeCheck(page, selector, label) {
  const results         = await runAxeScan(page, { selector });
  const violations      = getViolationSummary(results);
  const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (violations.length > 0)
    test.info().annotations.push({ type: `${label}-a11y-violations`, description: JSON.stringify(violations, null, 2) });
  if (criticalSerious.length > 0)
    test.info().annotations.push({ type: `${label}-accessibility`, description: `FAIL — ${criticalSerious.map((v) => v.id).join(', ')}` });
  expect(criticalSerious, `${label} critical/serious a11y:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
}

async function runChecks(page, baseURL, props) {
  const nav       = new SiteRedesignDevicePage(page);
  const analytics = new AnalyticsInterceptor(page);
  // Awaited — start() registers the sendBeacon/fetch patch via addInitScript, which must be
  // in place before the page navigates. Relying on unawaited dispatch-ordering (verified once
  // in isolation) proved fragile under real test-runner conditions: confirmed live that
  // analytics capture could silently come back empty for an entire run without this await.
  await analytics.start();

  const failures = [];

  async function check(name, fn) {
    try {
      return await test.step(name, fn);
    } catch (e) {
      const detail = e.message.split('\n').slice(0, 4).join(' | ').replace(/\s+/g, ' ').trim();
      failures.push({ name, detail });
    }
  }

  try {
    // ── Page load (hard fail) ──────────────────────────────────────────────
    await test.step('Page load — check HTTP status', async () => {
      const { url, status } = await nav.navigateTo(baseURL, '', props.path);
      if (status === 404 || status === 410) {
        test.info().annotations.push({ type: 'Skip-reason', description: `HTTP ${status}: ${url}` });
        test.skip(true, `Page not found (HTTP ${status}) for ${props.country}`);
        return;
      }
      expect(status, `Expected 2xx for ${url}`).toBeLessThan(400);
    });

    // ── Layout check (hard fail — must be mobile/tablet) ───────────────
    // No skip here: every locale is expected to render the mobile/tablet hamburger layout
    // on this viewport. If it doesn't, that's a real finding (either the locale's responsive
    // layout is genuinely broken, or something failed to render) — it must fail loudly, not
    // be silently skipped, so it isn't mistaken for "not applicable" in the results.
    await test.step('Layout — confirm mobile/tablet layout (hamburger visible)', async () => {
      const isDesktop = await nav.isDesktopLayout();
      expect(isDesktop, 'Expected mobile/tablet hamburger layout, got desktop layout').toBe(false);
      test.info().annotations.push({ type: 'Layout', description: 'mobile/tablet hamburger layout' });
      console.info('[SiteRedesign-Device] Mobile/tablet layout confirmed ✓');
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 1 — GNAV bar: content, scroll, elements, accessibility, analytics
    // ═══════════════════════════════════════════════════════════════════════
    // Only reported for actual FR sub-locales — validateLocaleRedirect() no-ops for every
    // other locale, so including it unconditionally just added a confusing always-0ms step
    // to every other locale's report.
    if (FR_SUB_LOCALES.has(props.code)) {
      await check('Locale — FR sub-locale redirects to /fr/', () => nav.validateLocaleRedirect());
    }
    await test.step('Nav scroll behavior — transparent at top, solid background + sticky after scroll',
      () => nav.validateNavScrollBehavior());
    // All read-only checks (no clicks/taps) — independent of each other, run in parallel.
    await Promise.all([
      check('Nav landmark — header is a landmark region for screen readers', () => nav.validateNavLandmark()),
      check('Always-visible — Adobe logo, app switcher, Sign In', () => nav.validateAlwaysVisibleElements()),
      check('Always-visible element styles — font + padding on hamburger, Sign In, App Switcher',
        () => nav.validateAlwaysVisibleElementStyles()),
      check('Accessibility — skip link exists in DOM',                    () => nav.validateSkipLink()),
      check(`Accessibility — html[lang] matches "${props.lang}"`,         () => nav.validateLangAttribute(props.lang)),
      ...(props.dir === 'rtl'
        ? [check(`RTL direction — html[dir] is rtl for RTL locales`, () => nav.validateRtlDirection(props.dir))]
        : []),
    ]);
    await check('App Switcher — opens modal with app links, closes + bar analytics (logo, App Switcher)',
      () => nav.validateBarAnalytics());

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 2 — Hamburger + dropdowns: content, accessibility, analytics
    // Everything below is wrapped in ONE analytics-capture window — the taps already
    // made for content validation are reused for the analytics check afterward,
    // instead of re-opening/closing every dropdown a second time just for that.
    // ═══════════════════════════════════════════════════════════════════════
    const promoFoundIn = [];
    const trackPromo = (result) => { if (result?.hasPromo) promoFoundIn.push(result.name); };

    const hamburgerCollectCalls = await nav.captureAnalytics(async () => {
      await test.step('Hamburger — click opens mobile nav overlay', async () => {
        await nav.openHamburger();
      });

      await check('Mobile nav list — all dropdown buttons + Plans link visible, Plans href valid',
        () => nav.validateMobileNavList());
      await check('Nav font styles — Adobe Clean on all nav overlay items',
        () => nav.validateNavFontStyles());

      trackPromo(await check('Products submenu — tabs scrollable, All Products link, cards with hrefs',
        () => nav.validateProductsSubmenu()));
      trackPromo(await check('Use Cases submenu — vertical list, links have hrefs',
        () => nav.validateUseCasesSubmenu()));
      trackPromo(await check('Solutions submenu — accordion sections, links have hrefs',
        () => nav.validateSolutionsSubmenu()));
      trackPromo(await check('Quick Actions submenu — accordion sections, links have hrefs',
        () => nav.validateQuickActionsSubmenu()));
      trackPromo(await check('Learn & Support submenu — accordion sections, links have hrefs',
        () => nav.validateLearnSupportSubmenu()));

      await check('Accessibility — Enter/Escape keyboard navigation on nav dropdown',
        () => nav.validateKeyboardNavigation());
      await check('Accessibility — focused nav elements have visible focus ring',
        () => nav.validateFocusVisible());
    });

    test.info().annotations.push({
      type: 'Promo',
      description: promoFoundIn.length ? `${promoFoundIn.length} present in: ${promoFoundIn.join(', ')}` : 'not present',
    });

    // Closing runs in its OWN short capture window, not the main hamburger+dropdowns one —
    // closeHamburger() specifically hung unpredictably when called from inside that longer
    // window (route-blocking still active), even with an explicit per-tap timeout. A short,
    // dedicated window avoids that interaction while still capturing its close analytics.
    let closeHamburgerCollectCalls = [];
    let hamburgerCloseDaaLl = null;
    await check('Hamburger — click closes mobile nav overlay', async () => {
      // Read right before the close tap — confirmed live the hamburger's own daa-ll
      // attribute value flips with state, so this must be read now, not derived later.
      hamburgerCloseDaaLl = await nav.getHamburgerCloseDaaLl();
      closeHamburgerCollectCalls = await nav.captureAnalytics(() => nav.closeHamburger());
    });

    await check('Analytics — daa-ll + collect calls on hamburger open/close and nav dropdowns',
      () => nav.verifyHamburgerAnalytics(hamburgerCollectCalls, closeHamburgerCollectCalls, hamburgerCloseDaaLl));

    await check('Accessibility — axe-core WCAG 2.1 AA scan on header.global-navigation',
      () => runAxeCheck(page, 'header.global-navigation', 'Header'));

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 3 — Footer: content, accessibility, analytics
    // ═══════════════════════════════════════════════════════════════════════
    // validateFooterAlignment only reads bounding rects — independent of validateFooter's own
    // accordion expansion, safe to run in parallel.
    await Promise.all([
      check('Footer — links visible, all have valid hrefs, locale-aware, typography Adobe Clean',
        () => nav.validateFooter()),
      check('Footer — column alignment, sequential stacking, no overlap',
        () => nav.validateFooterAlignment()),
    ]);
    await check('Footer — region picker opens country-selector modal, closes + footer analytics',
      () => nav.validateFooterRegionModalAndAnalytics());
    await check('Accessibility — axe-core WCAG 2.1 AA scan on footer landmark',
      () => runAxeCheck(page, 'footer, [role="contentinfo"]', 'Footer'));

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
      testInfo.annotations.push({ type: 'Country',   description: props.country });
      testInfo.annotations.push({ type: 'Locale',    description: props.code });
      testInfo.annotations.push({ type: 'Language',  description: props.lang });
      testInfo.annotations.push({ type: 'Direction', description: props.dir });

      console.info(`[SiteRedesign-Device] Testing: ${baseURL}${props.path}`);
      await runChecks(page, baseURL, props);
    });
  });
});
