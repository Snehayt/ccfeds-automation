import { test, expect } from '@playwright/test';
import { features } from '../../features/feds/site-redesign.spec.js';
import SiteRedesignPage, { FR_SUB_LOCALES } from '../../selectors/feds/site-redesign.page.js';
import { AnalyticsInterceptor } from '../../utils/analytics/analytics.interceptor.js';
import { runAxeScan, getViolationSummary } from '../../utils/accessibility/axe-runner.js';

// ─────────────────────────────────────────────────────────────────────────────
// runChecks — runs all checks on a single locale, grouped into 7 numbered sections
// so the console log reads top-to-bottom in a fixed, predictable order:
//   1. GNAV Renders      — Visibility, Clickability, Typography
//   2. Products Dropdown — Visibility, Clickability, Typography, Blur
//   3. All Dropdowns     — Visibility, Clickability, Typography, Blur
//   4. Blur Effect       — recap (already verified inline in sections 2–3)
//   5. Footer            — Visibility, Clickability, Typography
//   6. Analytics         — Header + Footer
//   7. Accessibility     — a11y attributes/landmarks + axe-core scans
// Hard fail : page load (404/410/5xx) — stops the test immediately.
// Soft fail : every other check — caught individually so all steps run.
// At the end, if any soft checks failed the test fails with a summary.
// ─────────────────────────────────────────────────────────────────────────────
async function runChecks(page, baseURL, props) {
  const nav       = new SiteRedesignPage(page);
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

  function section(n, title) {
    console.info(`\n========== ${n}. ${title} ==========`);
  }

  try {
    // ── Setup — page load, locale redirect, layout, nav structure (hard fail) ──
    await test.step('Page load — check HTTP status', async () => {
      const { url, status } = await nav.navigateTo(baseURL, '', props.path);
      if (status === 404 || status === 410) {
        test.info().annotations.push({ type: 'Skip-reason', description: `Page not found (HTTP ${status}): ${url}` });
        test.skip(true, `Page not found (HTTP ${status}) for ${props.country}`);
        return;
      }
      if (status >= 400) {
        test.info().annotations.push({ type: 'Error', description: `HTTP ${status}: ${url}` });
        expect(status, `Expected 2xx for ${url}`).toBeLessThan(400);
      }
    });

    // Only reported for actual FR sub-locales — validateLocaleRedirect() no-ops for every
    // other locale, so including it unconditionally just added a confusing always-0ms step
    // to every other locale's report.
    if (FR_SUB_LOCALES.has(props.code)) {
      await test.step('Locale — FR sub-locale redirects to /fr/', async () => {
        await nav.validateLocaleRedirect();
      });
    }

    await test.step('Nav structure — global nav container, Adobe logo, nav list visible', async () => {
      await nav.validateNavStructure();
    });

    await test.step('Nav scroll behavior — transparent at top, solid background + sticky after scroll',
      () => nav.validateNavScrollBehavior());

    // ═══════════════════════════════════════════════════════════════════════
    section(1, 'GNAV Renders — Visibility, Clickability, Typography');
    // ═══════════════════════════════════════════════════════════════════════
    await Promise.all([
      check('GNAV — all nav items visible',                              () => nav.validateGnavElements()),
      check('GNAV — nav height non-zero', async () => {
        const height = await nav.validateNavHeight();
        test.info().annotations.push({ type: 'Nav-height-px', description: `${height}px` });
      }),
      check('GNAV — nav links have valid href',                          () => nav.validateAllNavLinks()),
      check('GNAV — Adobe logo visible, points to adobe.com, clickable', () => nav.validateAdobeLogo()),
      check('GNAV — nav link typography (14px Adobe Clean)',             () => nav.validateNavFontStyles()),
      check('GNAV — nav button/Sign In/App Switcher typography + padding', () => nav.validateGnavElementStyles()),
      ...(props.dir === 'rtl'
        ? [check(`GNAV — RTL direction for Arabic locales (${props.code})`, () => nav.validateRtlDirection(props.dir))]
        : []),
    ]);
    await Promise.all([
      check('GNAV — App Switcher opens modal with app links, closes', () => nav.validateAppSwitcher()),
      check('GNAV — Sign In button visible and clickable',            () => nav.validateSignIn()),
    ]);

    // ═══════════════════════════════════════════════════════════════════════
    section(2, 'Products Dropdown — Visibility, Clickability, Typography, Blur');
    // ═══════════════════════════════════════════════════════════════════════
    await check('Products — tabs, cards, hover states', () => nav.validateProducts());

    // ═══════════════════════════════════════════════════════════════════════
    section(3, 'All Dropdowns — Visibility, Clickability, Typography, Blur');
    // ═══════════════════════════════════════════════════════════════════════
    await check('Use Cases — cards, headings, descriptions, CTAs', () => nav.validateUseCases());

    // Solutions/Quick Actions/Learn & Support — Products/Use Cases already ran
    // #checkDropdownStyles inline above (their panel was already open), so they're
    // skipped here by their actual (locale-specific) aria-controls value, not a
    // hardcoded English string — full coverage either way, nothing skipped without
    // an equivalent check already having run.
    const promoFoundIn = [];
    const dropdownCount = await nav.allDropdownBtns.count();
    const dropdownNames = [];
    if (dropdownCount > 0) {
      const [productsAriaControls, useCasesAriaControls] = await Promise.all([
        nav.products.getAttribute('aria-controls'),
        nav.useCases.getAttribute('aria-controls'),
      ]);
      for (let i = 0; i < dropdownCount; i++) {
        const btn          = nav.allDropdownBtns.nth(i);
        const ariaControls = await btn.getAttribute('aria-controls');
        const name         = ((await btn.textContent()) || '').trim() || `Dropdown ${i + 1}`;
        dropdownNames.push(name);
        if (ariaControls === productsAriaControls || ariaControls === useCasesAriaControls) continue;

        const opened = await check(`Dropdown — ${name} opens, links have href`, () => nav.openDropdown(ariaControls, name));
        if (!opened) continue; // open failed — nothing to validate/close

        if (opened.hasPromo) {
          promoFoundIn.push(name);
          await check(`Dropdown — ${name} promo card image/title/CTA valid`, () => nav.validatePromoContent(opened.promo, name));
        }

        await check(`Dropdown — ${name} closes`, () => nav.closeDropdown(opened.btn, opened.panel, name));
      }
    }
    test.info().annotations.push({ type: 'Dropdown-count', description: `${dropdownCount}: ${dropdownNames.join(', ')}` });
    test.info().annotations.push({
      type: 'Promo',
      description: promoFoundIn.length
        ? `${promoFoundIn.length} present in: ${promoFoundIn.join(', ')}`
        : 'not present',
    });

    // ═══════════════════════════════════════════════════════════════════════
    section(4, 'Blur Effect — backdrop blurs behind every open dropdown');
    // ═══════════════════════════════════════════════════════════════════════
    // Blur is verified inline as each dropdown opens/closes (sections 2–3 above,
    // see the "[<Name>] Blur" lines) rather than re-opened here — re-opening every
    // dropdown a second time just for this would double runtime for no extra coverage.
    console.info(`[Blur] Verified for all ${dropdownCount} dropdown(s): ${dropdownNames.join(', ')} — see "[<Name>] Blur" lines above ✓`);

    // Scroll to footer to trigger lazy loading
    await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('footer, [role="contentinfo"]').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    // ═══════════════════════════════════════════════════════════════════════
    section(5, 'Footer — Visibility, Clickability, Typography');
    // ═══════════════════════════════════════════════════════════════════════
    await Promise.all([
      check('Footer — landmark, headings, hrefs, font, daa-ll, clickability', () => nav.validateFooterStructure()),
      check('Footer — row/column alignment, no overlap',                      () => nav.validateFooterAlignment()),
    ]);
    // Runs after the parallel group — clicks/opens real UI (modal, navigation intercept)
    // which would interfere with the other footer checks reading DOM state concurrently.
    await check('Footer — region picker opens country-selector modal, closes on click', () => nav.validateFooterRegionModal());

    // ═══════════════════════════════════════════════════════════════════════
    section(6, 'Analytics — Header + Footer');
    // ═══════════════════════════════════════════════════════════════════════
    await check('Header Analytics — daa-ll on all nav elements + collect call fires on click', () => nav.validateAnalyticsDaaLl());
    await check('Footer Analytics — sampled footer link daa-ll + collect call fires on click',  () => nav.validateFooterAnalytics());

    // ═══════════════════════════════════════════════════════════════════════
    section(7, 'Accessibility');
    // ═══════════════════════════════════════════════════════════════════════
    await page.evaluate(() => window.scrollTo(0, 0)); // back to top for header-based checks below
    await Promise.all([
      check('Accessibility — skip link exists in DOM for screen readers',         () => nav.validateSkipLink()),
      check('Accessibility — Adobe logo image has non-empty alt text',            () => nav.validateLogoAltText()),
      check(`Accessibility — html[lang] matches locale "${props.lang}"`,          () => nav.validateLangAttribute(props.lang)),
      check('Accessibility — nav header is a landmark region for screen readers', () => nav.validateNavLandmark()),
    ]);
    await check('Accessibility — focused nav elements have visible focus ring', () => nav.validateFocusVisible());
    await check('Accessibility — Tab, Enter, Space, Escape all work on nav dropdowns', () => nav.validateKeyboardNavigation());
    await check('Accessibility — axe-core WCAG 2.1 AA scan on global-navigation', async () => {
      const results        = await runAxeScan(page, { selector: 'header.global-navigation' });
      const violations     = getViolationSummary(results);
      const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      if (violations.length > 0)
        test.info().annotations.push({ type: 'A11y-violations', description: JSON.stringify(violations, null, 2) });
      if (criticalSerious.length > 0)
        test.info().annotations.push({ type: 'Accessibility', description: `FAIL — ${criticalSerious.map((v) => v.id).join(', ')}` });
      expect(criticalSerious, `Critical/serious a11y violations:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
    });
    await check('Accessibility — axe-core WCAG 2.1 AA scan on footer landmark', async () => {
      const results        = await runAxeScan(page, { selector: 'footer, [role="contentinfo"]' });
      const violations     = getViolationSummary(results);
      const criticalSerious = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
      if (violations.length > 0)
        test.info().annotations.push({ type: 'Footer-a11y-violations', description: JSON.stringify(violations, null, 2) });
      if (criticalSerious.length > 0)
        test.info().annotations.push({ type: 'Footer-accessibility', description: `FAIL — ${criticalSerious.map((v) => v.id).join(', ')}` });
      expect(criticalSerious, `Footer a11y violations:\n${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
    });

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
test.describe('Site Redesign GNAV', () => {
  // Matches the devices suite's budget — the same ~20-check serial chain (dropdowns, footer,
  // analytics, 2x axe scans) occasionally exceeds the default 90s on slower locales.
  test.describe.configure({ timeout: 150000 });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  features.forEach((props) => {
    test(`${props.name} | ${props.country}`, { tag: props.tags }, async ({ page, baseURL }, testInfo) => {
      testInfo.annotations.push({ type: 'Locale',    description: props.code });
      testInfo.annotations.push({ type: 'Language',  description: props.lang });
      testInfo.annotations.push({ type: 'Direction', description: props.dir });

      console.info(`[SiteRedesign] Testing: ${baseURL}${props.path}`);
      await runChecks(page, baseURL, props);
    });
  });
});
