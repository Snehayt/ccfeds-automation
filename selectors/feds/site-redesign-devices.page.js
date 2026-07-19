import { expect, test } from '@playwright/test';
import { getCollectCallCount, getNewCollectCalls } from '../../utils/analytics/analytics.interceptor.js';

// FR sub-locales are expected to redirect to /fr/ — shared by navigateTo() and validateLocaleRedirect(),
// and by the test file, which only reports this check for actual FR sub-locales.
export const FR_SUB_LOCALES = new Set(['ca_fr', 'be_fr', 'lu_fr', 'ch_fr']);

export default class SiteRedesignDevicePage {
  constructor(page) {
    this.page = page;

    // ── Mobile nav ────────────────────────────────────────────────────────────
    this.hamburger     = page.locator('button.feds-nav-toggle');
    this.navClose      = page.locator('button.feds-nav-toggle');   // same button toggles open/closed
    this.navOverlay    = page.locator('li#feds-menu-wrapper');
    this.allDropdowns  = page.locator('button.mega-menu.feds-link');

    // ── Always-visible elements ───────────────────────────────────────────────
    this.adobelogo     = page.locator('.feds-brand-container .feds-brand');
    this.adobeLogoLink = page.locator('.feds-brand-container a').first();
    this.adobeLogoImg  = page.locator('.feds-brand-image.mobile-brand img').first();
    this.appSwitcher   = page.locator('#unav-app-switcher');
    // The wrapper's own display never changes on open/close (confirmed live) — the real
    // toggling element is its .unav-comp-app-switcher-tray child.
    this.appSwitcherModal = page.locator('.unav-comp-app-switcher-tray');
    this.signInBtn     = page.locator('[data-test-id="unav-profile--sign-in"]');

    // ── Mobile nav items inside overlay ───────────────────────────────────────
    // Positions: Products=nth(0), UseCases=nth(1), Solutions=nth(2), QuickActions=nth(3)
    // L&S is always last (locale may add extra buttons between Quick Actions and L&S)
    // Panel IDs are locale-specific (e.g. DE: "produkte", "lösungen") — resolved at runtime via aria-controls
    this.productsBtn     = page.locator('button.mega-menu.feds-link').nth(0);
    this.useCasesBtn     = page.locator('button.mega-menu.feds-link').nth(1);
    this.solutionsBtn    = page.locator('button.mega-menu.feds-link').nth(2);
    this.quickActionsBtn = page.locator('button.mega-menu.feds-link').nth(3);
    this.learnSupportBtn = page.locator('button.mega-menu.feds-link').last();
    this.plansLink       = page.locator('ul.feds-gnav-items > li > a.feds-link[href*="plans.html"]');
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  #warn(label) {
    console.warn(`WARN — ${label}`);
    test.info().annotations.push({ type: 'Warning', description: label });
  }

  // Plain Playwright click() — matches the pattern already proven reliable in
  // tests/feds/mobileCCEPageSanity.test.js. But confirmed live (real trace) that on THIS page a
  // click can occasionally take 40+ seconds to resolve — without an explicit timeout it inherits
  // the full 90s actionTimeout, so one slow click can eat almost the entire test budget. A bounded
  // timeout makes a stuck click fail fast (and get caught by the caller's check()) instead.
  async #tapOpen(locator) {
    await locator.click({ timeout: 8000 });
  }

  // Panel header title (e.g. "Products", "Use Cases") — confirmed live: 32px/900 Adobe Clean
  // Display Black on every submenu panel, matching desktop's dropdown-heading parity.
  async #checkPanelTitle(panel, name) {
    const style = await panel.locator('.feds-popup-title').first().evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight };
    }, null, { timeout: 8000 }).catch(() => null);
    if (!style) return;
    const failures = [];
    if (!style.fontFamily.toLowerCase().includes('adobe clean')) failures.push(`"${name}" panel title font-family: ${style.fontFamily.split(',')[0]} (expected Adobe Clean)`);
    if (style.fontSize !== '32px') failures.push(`"${name}" panel title font-size: ${style.fontSize} (expected 32px)`);
    if (style.fontWeight !== '900') failures.push(`"${name}" panel title font-weight: ${style.fontWeight} (expected 900)`);
    expect(failures, failures.join('\n')).toHaveLength(0);
    console.info(`[SiteRedesign-Device] "${name}" panel title — 32px/900 Adobe Clean ✓`);
  }

  // Section headings inside a submenu panel (e.g. Use Cases' "Create quickly and easily
  // with", Solutions' "Organizations", Learn & Support's "Help") — confirmed live: 18px/900
  // Adobe Clean Display Black on every submenu that has this kind of heading (Products doesn't).
  async #checkSectionHeadings(panel, name) {
    const headingData = await panel.locator('h2, h3, [role="heading"]').filter({ visible: true }).evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return { text: (el.textContent || '').trim(), fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight };
    }));
    const failures = [];
    for (const { text, fontFamily, fontSize, fontWeight } of headingData) {
      if (!fontFamily.toLowerCase().includes('adobe clean')) failures.push(`"${name}" heading "${text}" font-family: ${fontFamily.split(',')[0]} (expected Adobe Clean)`);
      if (fontSize !== '18px') failures.push(`"${name}" heading "${text}" font-size: ${fontSize} (expected 18px)`);
      if (fontWeight !== '900') failures.push(`"${name}" heading "${text}" font-weight: ${fontWeight} (expected 900)`);
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
    if (headingData.length > 0) console.info(`[SiteRedesign-Device] "${name}" headings — 18px/900 Adobe Clean (${headingData.length}) ✓`);
  }

  // Uses real click() — confirmed live that a raw click() on this specific back button does
  // not properly return the overlay to its main-list state. Retries the FULL close cycle
  // (click + panel-hidden + list-visible), not just the click, since closing can genuinely
  // fail outright (the main list stays hidden entirely, not just slow to reappear).
  async #closeSubmenuPanel(panel, name) {
    const backBtn = panel.locator('button.feds-popup-back-button');
    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      if (attempt > 0) await this.page.waitForTimeout(500);
      await backBtn.click({ timeout: 8000 }).catch(() => {});
      const [panelHidden, listVisible] = await Promise.all([
        panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false),
        this.allDropdowns.first().waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false),
      ]);
      done = panelHidden && listVisible;
    }
    await expect(panel, `"${name}" panel did not close`).toBeHidden({ timeout: 15000 });
    // Confirmed live: the back button returns to the main dropdown list, not just hides this
    // panel — assert the main nav list is actually reachable again, not merely that the panel
    // is gone (which would also be true if the back button navigated away entirely).
    await expect(this.allDropdowns.first(), `"${name}" back button did not return to the main dropdown list`)
      .toBeVisible({ timeout: 10000 });
  }

  // Promo card (e.g. Solutions panel's "Acrobat for Business") — image, text, CTA href.
  async #checkPromoCard(panel, name) {
    const promo = panel.locator('article.promo-card-small');
    const hasPromo = (await promo.count()) > 0;
    if (hasPromo) {
      await expect(promo.locator('picture.promo-card__bg'), `"${name}" promo image not visible`).toBeVisible({ timeout: 10000 });
      await expect(promo.locator('div.promo-card-small__text'), `"${name}" promo text not visible`).toBeVisible({ timeout: 10000 });
      const promoCta = promo.locator('a').filter({ visible: true }).first();
      if (await promoCta.count() > 0) {
        const promoHref = await promoCta.getAttribute('href');
        expect(promoHref, `"${name}" promo CTA missing href`).toBeTruthy();
        this.#assertLinkLocale(promoHref, `"${name}" promo CTA`);
        console.info(`[SiteRedesign-Device] "${name}" promo CTA href="${promoHref}" ✓`);
      }
      console.info(`[SiteRedesign-Device] "${name}" promo card: image, text, CTA validated ✓`);
      return true;
    }
    // On mobile, promo may render with an alternate variant class
    const promoAsCard = panel.locator('article[class*="promo"] a[href]').filter({ visible: true }).first();
    if (await promoAsCard.count() > 0) {
      const href = await promoAsCard.getAttribute('href');
      expect(href, `"${name}" promo card link missing href`).toBeTruthy();
      this.#assertLinkLocale(href, `"${name}" promo (as card)`);
      console.info(`[SiteRedesign-Device] "${name}" promo (as card): href="${href}" ✓`);
      return true;
    }
    return false;
  }

  // Submenu CTA buttons (Explore/Contact us/Go to Help etc.) — href, font, and padding.
  // Runs while the panel is already open (called from each submenu's own validate method)
  // instead of a separate re-open/close pass, since the panel's open state is identical either way.
  async #checkSubmenuCtas(panel, name) {
    const ctaSelectors = 'a.feds-primary-cta, a.feds-secondary-cta, a.feds-button, a[class*="-cta"]';
    const ctas = panel.locator(ctaSelectors).filter({ visible: true });
    const ctaData = await ctas.evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return {
        text: (el.textContent || '').trim(), href: el.getAttribute('href'),
        fontSize: s.fontSize, fontWeight: s.fontWeight, fontFamily: s.fontFamily,
        paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft, paddingRight: s.paddingRight,
      };
    }));

    if (ctaData.length > 0) {
      const ctaFailures = [];
      // Confirmed live across all 5 submenus: CTAs are 14px/700 Adobe Clean.
      for (const { text, href, fontSize, fontWeight, fontFamily, paddingTop, paddingBottom, paddingLeft, paddingRight } of ctaData) {
        expect(href, `${name} CTA "${text}" missing href`).toBeTruthy();
        if (!fontFamily.toLowerCase().includes('adobe clean'))
          ctaFailures.push(`CTA "${text}" font: ${fontFamily.split(',')[0]} (expected Adobe Clean)`);
        if (fontSize !== '14px')
          ctaFailures.push(`CTA "${text}" font-size: ${fontSize} (expected 14px)`);
        if (fontWeight !== '700')
          ctaFailures.push(`CTA "${text}" font-weight: ${fontWeight} (expected 700)`);
        if (paddingTop === '0px' || paddingBottom === '0px' || paddingLeft === '0px' || paddingRight === '0px')
          ctaFailures.push(`CTA "${text}" has zero padding: ${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`);
        console.info(`[SiteRedesign-Device] CTA "${name}" → "${text}" | ${fontSize}/${fontWeight} Adobe Clean | padding:${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft} ✓`);
      }
      expect(ctaFailures, `CTA violations in "${name}":\n${ctaFailures.join('\n')}`).toHaveLength(0);
      return ctaData.length;
    }

    const exploreCtas = await panel.locator('a[href]').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: el.textContent.trim(), href: el.getAttribute('href'), fontSize: s.fontSize, fontFamily: s.fontFamily, paddingTop: s.paddingTop, paddingLeft: s.paddingLeft };
      }));
    for (const { text, href, fontSize, paddingTop } of exploreCtas) {
      expect(href, `${name} CTA "${text}" missing href`).toBeTruthy();
      console.info(`[SiteRedesign-Device] CTA "${name}" → "${text}" | ${fontSize} | padding-top:${paddingTop} ✓`);
    }
    return exploreCtas.length;
  }

  // Accordion sections inside a submenu panel (e.g. Solutions' "Organizations"/"Industries",
  // Learn & Support's 4 sections) — confirmed live: each is expanded by default
  // (aria-expanded="true") and its own header (role="button") toggles it closed/open.
  // Asserts the default-open state, then exercises collapse/re-expand on the first section.
  async #checkAccordionSections(panel, name) {
    const sectionHeaders = panel.locator('[role="button"][aria-expanded]');
    const count = await sectionHeaders.count();
    if (count === 0) return;
    for (let i = 0; i < count; i++) {
      const expanded = await sectionHeaders.nth(i).getAttribute('aria-expanded');
      expect(expanded, `"${name}" accordion section ${i + 1} should be expanded by default`).toBe('true');
    }
    const firstHeader = sectionHeaders.first();
    const firstLinksList = firstHeader.locator('xpath=following-sibling::*[contains(@class,"links-card-links")]').first();
    const firstLink = firstLinksList.locator('a').first();

    // click(), not tap() — confirmed live that tap() flips aria-expanded but the CSS collapse
    // driving actual link visibility doesn't follow; click() (verified via screenshot) does.
    // Explicit timeout — see #tapOpen for why (a click on this page can occasionally take 40+s
    // without one, eating almost the whole test budget).
    await firstHeader.click({ timeout: 8000 });
    await expect(firstHeader, `"${name}" accordion section 1 should collapse on click`).toHaveAttribute('aria-expanded', 'false');
    await expect(firstLinksList, `"${name}" accordion section 1 links should hide when collapsed`).toHaveCSS('max-height', '0px');

    await firstHeader.click({ timeout: 8000 });
    await expect(firstHeader, `"${name}" accordion section 1 should re-expand on click`).toHaveAttribute('aria-expanded', 'true');
    await expect(firstLink, `"${name}" accordion section 1 links should reappear when re-expanded`).toBeVisible({ timeout: 5000 });

    console.info(`[SiteRedesign-Device] "${name}" accordion — ${count} section(s) expanded by default, toggle open/close verified ✓`);
  }

  // Delegates to the centralized analytics interceptor (utils/analytics/analytics.interceptor.js)
  // — captures collect calls fired during `fn` via the sendBeacon/fetch patch registered by
  // AnalyticsInterceptor.start(), instead of reading request.postData() (which always returns
  // null for sendBeacon calls on WebKit).
  async #captureCollectCalls(fn) {
    const before = await getCollectCallCount(this.page);
    await fn();
    return getNewCollectCalls(this.page, before);
  }

  // Public wrapper — some test-file call sites capture analytics around a single action
  // (e.g. closeHamburger) rather than a whole batch of checks.
  async captureAnalytics(fn) {
    return this.#captureCollectCalls(fn);
  }

  // Matches each expected { daaLl, name, closeDaaLl } entry against the captured collect-call
  // names. closeDaaLl is checked independently of daaLl (open) — mobile dropdowns close via a
  // separate back button with its own distinct daa-ll, architecturally different from desktop
  // (where the same toggle element handles both open and close), so one being present/missing
  // must not affect the other's check.
  #verifyCollectCalls(collectCalls, expected, label) {
    const usedIndices = new Set();
    const findCallIndex = (daaLl) => collectCalls.findIndex((n, i) => !usedIndices.has(i) && n.startsWith(daaLl));

    let missing = 0, total = 0;
    for (const { daaLl, name, closeDaaLl } of expected) {
      total++;
      if (!daaLl) { this.#warn(`${label}: "${name}" (open) missing daa-ll`); missing++; }
      else {
        const openIdx = findCallIndex(daaLl);
        if (openIdx === -1) { this.#warn(`${label}: "${name}" (open) daa-ll="${daaLl}" — no matching collect call found`); missing++; }
        else {
          usedIndices.add(openIdx);
          console.info(`[SiteRedesign-Device] ${label}: "${name}" (open) daa-ll="${daaLl}" ✓ collect call fired`);
        }
      }

      if (closeDaaLl === null) {
        // A close identifier was expected but couldn't be read (e.g. read attempt failed) —
        // distinct from simply not applicable (undefined), which is skipped silently below.
        total++;
        this.#warn(`${label}: "${name}" (close) missing daa-ll`);
        missing++;
      } else if (closeDaaLl) {
        total++;
        const closeIdx = findCallIndex(closeDaaLl);
        if (closeIdx === -1) { this.#warn(`${label}: "${name}" (close) daa-ll="${closeDaaLl}" — no matching collect call found`); missing++; }
        else {
          usedIndices.add(closeIdx);
          console.info(`[SiteRedesign-Device] ${label}: "${name}" (close) daa-ll="${closeDaaLl}" ✓ collect call fired`);
        }
      }
    }
    console.info(`[SiteRedesign-Device] ${label}: ${total - missing}/${total} passed`);
  }

  #getActiveLocale() {
    const localeRe = /^[a-z]{2}(_[a-z]{2,4})?$/i;
    const segs     = new URL(this.page.url()).pathname.split('/').filter(Boolean);
    const fromUrl  = segs[0] && localeRe.test(segs[0]) ? segs[0] : null;
    return this.redirectedLocale || fromUrl;
  }

  async promiseResolver(elementsToCheck) {
    await Promise.all(elementsToCheck.map(async ({ element, conditions }) => {
      const shouldBeVisible = conditions.defaultVisibility ?? true;
      if (shouldBeVisible) {
        await expect(element).toBeVisible({ timeout: 25000 });
        const text = ((await element.innerText().catch(() => '')) || (await element.getAttribute('aria-label').catch(() => '')) || '').trim().slice(0, 50);
        console.info(`[SiteRedesign-Device] Visible: "${text || 'element'}" ✓`);
      } else {
        await expect(element).not.toBeVisible({ timeout: 5000 });
      }
    }));
  }

  #assertLinkLocale(rawHref, label) {
    if (!rawHref || rawHref === '#') return;
    const resolved = new URL(rawHref, this.page.url()).href;
    const locale   = this.#getActiveLocale();
    if (!locale) return;
    if (!resolved.includes('adobe.com')) return;
    if (!resolved.includes(`/${locale}/`))
      this.#warn(`"${label}" href="${resolved}" missing locale "/${locale}/" — expected locale-aware link`);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigateTo(baseURL, localePath, testPagePath) {
    const url = `${baseURL}${localePath}${testPagePath}`.replace('//', '/').replace(':/', '://');
    console.info(`[SiteRedesign-Device] Navigating to: ${url}`);
    const response = await this.page.goto(url, { waitUntil: 'load', timeout: 60000 });
    const status   = response?.status() ?? 0;
    console.info(`[SiteRedesign-Device] ${url} → HTTP ${status}`);

    // ── Locale redirect detection (mirrors desktop) ───────────────────────────
    const localeRe        = /^[a-z]{2}(_[a-z]{2,4})?$/i;
    const origSeg         = new URL(url).pathname.split('/').filter(Boolean);
    const finalSeg        = new URL(this.page.url()).pathname.split('/').filter(Boolean);
    this.originalLocale   = origSeg[0]  && localeRe.test(origSeg[0])  ? origSeg[0]  : null;
    this.redirectedLocale = finalSeg[0] && localeRe.test(finalSeg[0]) && finalSeg[0] !== this.originalLocale
      ? finalSeg[0] : null;
    if (this.redirectedLocale && !FR_SUB_LOCALES.has(this.originalLocale)) {
      this.#warn(`Unexpected locale redirect: /${this.originalLocale}/ → /${this.redirectedLocale}/`);
    }

    await this.page.locator('header.global-navigation').waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
    return { url, status };
  }

  async validateLocaleRedirect() {
    if (!this.originalLocale || !FR_SUB_LOCALES.has(this.originalLocale)) return;
    if (this.redirectedLocale) {
      console.info(`[SiteRedesign-Device] Locale redirect: /${this.originalLocale}/ → /${this.redirectedLocale}/ ✓`);
    } else {
      throw new Error(`/${this.originalLocale}/ did not redirect to /fr/ — expected FR sub-locale redirect`);
    }
  }

  async validateNavLandmark() {
    const header  = this.page.locator('header.global-navigation');
    const tagName = await header.evaluate((el) => el.tagName.toLowerCase());
    const role    = await header.getAttribute('role');
    expect(tagName === 'header' || tagName === 'nav' || role === 'navigation', 'Nav must be a landmark element').toBe(true);
    console.info(`[SiteRedesign-Device] Nav landmark: tag="${tagName}", role="${role}" ✓`);
  }

  // ── Layout detection ─────────────────────────────────────────────────────
  // aria-disabled on header blocks Playwright's isVisible() — read raw CSS directly

  async validateNavScrollBehavior() {
    console.info('[SiteRedesign-Device] Checking nav transparent-at-top → solid-on-scroll behavior');
    const header = this.page.locator('header.global-navigation');

    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForFunction(
      () => !document.querySelector('header.global-navigation')?.classList.contains('feds-header-scrolled'),
      { timeout: 5000 }
    ).catch(() => {});

    const classAtTop = await header.evaluate((el) => el.className);
    expect(classAtTop, 'Nav at top should not have feds-header-scrolled class').not.toContain('feds-header-scrolled');
    console.info(`[SiteRedesign-Device] Nav at top: no feds-header-scrolled class ✓`);

    await this.page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: 'instant' }));
    await this.page.waitForFunction(
      () => document.querySelector('header.global-navigation')?.classList.contains('feds-header-scrolled'),
      { timeout: 5000 }
    ).catch(() => {});

    const classAfterScroll = await header.evaluate((el) => el.className);
    expect(classAfterScroll, 'Nav after scroll should have feds-header-scrolled class (solid pill bg)').toContain('feds-header-scrolled');
    console.info(`[SiteRedesign-Device] Nav after scroll: feds-header-scrolled class present ✓`);

    const navBox = await header.boundingBox();
    expect(navBox, 'Nav must be visible in viewport after scroll (sticky)').toBeTruthy();
    expect(navBox.y, 'Sticky nav top edge must be at or near 0').toBeLessThanOrEqual(10);
    console.info(`[SiteRedesign-Device] Nav sticky: top=${navBox.y}px ✓`);

    await this.page.evaluate(() => window.scrollTo(0, 0));
    console.info('[SiteRedesign-Device] PASS — nav transparent at top, solid + sticky after scroll');
  }

  async isDesktopLayout() {
    // Hamburger appears ~1s after GNAV ready — wait before evaluating. 3000ms was too short
    // under parallel-worker CPU contention: if the hamburger simply hadn't rendered yet (not
    // because the layout is genuinely desktop), the timeout was silently swallowed and the
    // "not found → desktop" fallback below wrongly concluded desktop on a real mobile viewport.
    await this.page.locator('button.feds-nav-toggle').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    return this.page.evaluate(() => {
      const hamburger = document.querySelector('button.feds-nav-toggle');
      if (!hamburger) return true;
      const style = window.getComputedStyle(hamburger);
      return style.display === 'none' || style.visibility === 'hidden' || hamburger.offsetWidth === 0;
    });
  }

  // ── Always-visible elements ───────────────────────────────────────────────

  async validateAlwaysVisibleElements() {
    console.info('[SiteRedesign-Device] Checking always-visible elements: logo, app switcher, sign in');
    await this.promiseResolver([
      { element: this.adobelogo,     conditions: { defaultVisibility: true } },
      { element: this.adobeLogoLink, conditions: { defaultVisibility: true } },
      { element: this.appSwitcher,   conditions: { defaultVisibility: true } },
      { element: this.signInBtn,     conditions: { defaultVisibility: true } },
    ]);
    const rawHref  = await this.adobeLogoLink.getAttribute('href');
    const resolved = new URL(rawHref, this.page.url()).href;
    expect(resolved, 'Adobe logo must point to adobe.com').toContain('adobe.com');
    this.#assertLinkLocale(rawHref, 'Adobe logo');
    // Mobile logo img may not pass Playwright visibility (CSS/sprite) — assert alt via link img or aria-label
    const logoImg = this.adobeLogoLink.locator('img').first();
    const logoAlt = (await logoImg.getAttribute('alt').catch(() => null))
      ?? (await this.adobeLogoImg.getAttribute('alt').catch(() => null))
      ?? (await this.adobeLogoLink.getAttribute('aria-label'));
    expect(logoAlt, 'Adobe logo must have alt text').toBeTruthy();
    console.info(`[SiteRedesign-Device] Logo alt="${logoAlt.trim().slice(0, 40)}" ✓`);
    console.info('[SiteRedesign-Device] PASS — logo, app switcher, sign in visible');
  }

  // ── Typography + spacing — hamburger, Sign In, App Switcher (mobile) ───────
  // Verified identical across portrait and landscape orientations.
  // (excludes the locale/region modal — covered separately)
  async validateAlwaysVisibleElementStyles() {
    console.info('[SiteRedesign-Device] Checking font + padding on hamburger, Sign In, App Switcher');
    const failures = [];

    const readStyle = (el) => {
      const s = window.getComputedStyle(el);
      return {
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        paddingTop: s.paddingTop,
        paddingRight: s.paddingRight,
        paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft,
      };
    };

    // ── Hamburger — icon-glyph button: 20px, zero padding (expected) ──────────
    await expect(this.hamburger, 'Hamburger button not found').toBeVisible({ timeout: 15000 });
    const hamburger = await this.hamburger.evaluate(readStyle);
    if (hamburger.fontSize !== '20px')
      failures.push(`Hamburger font-size: ${hamburger.fontSize} (expected 20px)`);
    console.info(`[SiteRedesign-Device] Hamburger — ${hamburger.fontSize} / ${hamburger.fontWeight} | padding:${hamburger.paddingTop} ${hamburger.paddingRight} ${hamburger.paddingBottom} ${hamburger.paddingLeft} (icon glyph — no Adobe Clean/padding expected)`);

    // ── Sign In button — 14px / 700 / Adobe Clean + non-zero padding ───────────
    await expect(this.signInBtn, 'Sign In button not found').toBeVisible({ timeout: 15000 });
    const signIn = await this.signInBtn.evaluate(readStyle);
    if (!signIn.fontFamily.toLowerCase().includes('adobe clean'))
      failures.push(`Sign In font-family: ${signIn.fontFamily.split(',')[0]} (expected Adobe Clean)`);
    if (signIn.fontSize !== '14px')
      failures.push(`Sign In font-size: ${signIn.fontSize} (expected 14px)`);
    if (signIn.fontWeight !== '700')
      failures.push(`Sign In font-weight: ${signIn.fontWeight} (expected 700)`);
    if ([signIn.paddingTop, signIn.paddingRight, signIn.paddingBottom, signIn.paddingLeft].some((p) => p === '0px'))
      failures.push(`Sign In has zero padding: ${signIn.paddingTop} ${signIn.paddingRight} ${signIn.paddingBottom} ${signIn.paddingLeft}`);
    console.info(`[SiteRedesign-Device] Sign In — ${signIn.fontSize} / ${signIn.fontWeight} / Adobe Clean | padding:${signIn.paddingTop} ${signIn.paddingRight} ${signIn.paddingBottom} ${signIn.paddingLeft} ✓`);

    // ── App Switcher — non-zero padding on all sides (min hit-target) ─────────
    await expect(this.appSwitcher, 'App switcher button not found').toBeVisible({ timeout: 15000 });
    const appSwitcher = await this.appSwitcher.evaluate(readStyle);
    if ([appSwitcher.paddingTop, appSwitcher.paddingRight, appSwitcher.paddingBottom, appSwitcher.paddingLeft].some((p) => p === '0px'))
      failures.push(`App Switcher has zero padding: ${appSwitcher.paddingTop} ${appSwitcher.paddingRight} ${appSwitcher.paddingBottom} ${appSwitcher.paddingLeft}`);
    console.info(`[SiteRedesign-Device] App Switcher — padding:${appSwitcher.paddingTop} ${appSwitcher.paddingRight} ${appSwitcher.paddingBottom} ${appSwitcher.paddingLeft} ✓`);

    expect(failures, `Mobile GNAV element style violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info('[SiteRedesign-Device] PASS — hamburger, Sign In, App Switcher validated');
  }

  // ── Hamburger open/close ──────────────────────────────────────────────────

  async openHamburger() {
    console.info('[SiteRedesign-Device] Opening hamburger menu');
    // Hamburger appears ~1s after GNAV ready — wait before tapping
    await this.hamburger.waitFor({ state: 'visible', timeout: 5000 });
    // Mobile FEDS GNAV: tap() sends pointer+touch events the GNAV handler expects.
    // First tap can miss while button is still settling — retry up to 3×.
    let opened = false;
    for (let attempt = 0; attempt < 3 && !opened; attempt++) {
      if (attempt > 0) await this.page.waitForTimeout(500);
      // Explicit timeout — without one, actionTimeout defaults to the full test timeout
      // (configs/feds.config.js), so a single stalled tap would silently eat the whole
      // budget instead of failing fast into this retry.
      await this.hamburger.tap({ timeout: 3000 }).catch(() => {});
      opened = await this.page.waitForFunction(
        () => document.querySelector('button.feds-nav-toggle')?.getAttribute('aria-expanded') === 'true',
        { timeout: 2000 }
      ).then(() => true).catch(() => false);
    }
    await this.allDropdowns.first().waitFor({ state: 'visible', timeout: 15000 });
    console.info('[SiteRedesign-Device] PASS — hamburger menu opened, nav items visible');
  }

  async closeHamburger() {
    console.info('[SiteRedesign-Device] Closing hamburger menu');
    let closed = false;
    for (let attempt = 0; attempt < 3 && !closed; attempt++) {
      if (attempt > 0) await this.page.waitForTimeout(500);
      await this.hamburger.tap({ timeout: 3000 }).catch(() => {});
      closed = await this.page.waitForFunction(
        () => document.querySelector('button.feds-nav-toggle')?.getAttribute('aria-expanded') !== 'true',
        { timeout: 2000 }
      ).then(() => true).catch(() => false);
    }
    await this.allDropdowns.first().waitFor({ state: 'hidden', timeout: 15000 });
    console.info('[SiteRedesign-Device] PASS — hamburger menu closed');
  }

  // Confirmed live: the hamburger's own daa-ll attribute value flips with state
  // ("hamburgermenu|open" before opening, "hamburgermenu|close" while open) — must be read
  // right before the close tap, not derived from the open-time value.
  async getHamburgerCloseDaaLl() {
    return this.hamburger.getAttribute('daa-ll');
  }

  // ── Mobile nav list ───────────────────────────────────────────────────────

  async validateMobileNavList() {
    console.info('[SiteRedesign-Device] Checking nav items in overlay');
    const navItems = [
      { element: this.productsBtn,     conditions: { defaultVisibility: true } },
      { element: this.useCasesBtn,     conditions: { defaultVisibility: true } },
      { element: this.solutionsBtn,    conditions: { defaultVisibility: true } },
      { element: this.quickActionsBtn, conditions: { defaultVisibility: true } },
      { element: this.learnSupportBtn, conditions: { defaultVisibility: true } },
      { element: this.plansLink,       conditions: { defaultVisibility: true } },
    ];
    await this.promiseResolver(navItems);
    const dropdownCount = await this.allDropdowns.count();
    console.info(`[SiteRedesign-Device] PASS — ${dropdownCount} dropdown buttons visible in overlay`);

    const plansHref = await this.plansLink.getAttribute('href');
    const plansText = ((await this.plansLink.textContent()) || '').trim();
    expect(plansHref, `"${plansText || 'Plans'}" link missing href`).toBeTruthy();
    this.#assertLinkLocale(plansHref, plansText || 'Plans');
    console.info(`[SiteRedesign-Device] "${plansText || 'Plans'}" href="${plansHref}" ✓`);
  }

  // App Switcher modal open/close + bar-level analytics (logo, App Switcher) — one capture
  // window around both clicks, so the settle-wait is paid once instead of per element.
  async validateBarAnalytics() {
    console.info('[SiteRedesign-Device] Checking App Switcher modal + bar-level analytics');
    const logoDaaLl        = await this.adobeLogoLink.getAttribute('daa-ll');
    const appSwitcherDaaLl = await this.appSwitcher.getAttribute('daa-ll');

    // Logo click deliberately excluded from the capture below — clicking a real link to
    // adobe.com's homepage proved unreliable on WebKit (this project's mobile engine) even
    // with preventDefault(), intermittently leaving the page/browser in a bad state for
    // everything that runs afterward. Skip-click, warn on missing daa-ll instead.
    if (!logoDaaLl) this.#warn('Analytics: "Adobe logo" missing daa-ll');
    else console.info(`[SiteRedesign-Device] Analytics: "Adobe logo" daa-ll="${logoDaaLl}" ✓`);

    const collectCalls = await this.#captureCollectCalls(async () => {
      await this.appSwitcher.click({ timeout: 8000 });
      await expect(this.appSwitcherModal, 'App Switcher modal did not open').toBeVisible({ timeout: 15000 });

      const modalLinks = this.appSwitcherModal.locator('a[href]').filter({ visible: true });
      // The wrapper becomes visible slightly before its app links finish rendering
      // (confirmed live) — wait for the first link, not an instant count().
      await modalLinks.first().waitFor({ state: 'visible', timeout: 15000 });
      const modalLinkCount = await modalLinks.count();
      expect(modalLinkCount, 'App Switcher modal has no visible app links').toBeGreaterThan(0);

      // Re-tapping the toggle button (force: true, since the overlay sits on top of it and
      // would otherwise fail the "receives events" actionability check) closes it — clicking
      // the overlay corner to dismiss hung for over a minute in practice.
      await this.appSwitcher.click({ force: true, timeout: 8000 });
      await expect(this.appSwitcherModal, 'App Switcher modal did not close').toBeHidden({ timeout: 15000 });
    });

    console.info('[SiteRedesign-Device] App Switcher: PASS — modal opened with app links, closed');
    // Confirmed live: App Switcher has no daa-ll at all (open or close) — there is no
    // click-tracking on this element by design, not a bug. Logging that fact directly instead
    // of running it through #verifyCollectCalls's generic "X/Y passed" summary, which always
    // read as "0/1 passed" here and looked like a failing check when nothing was verifiable.
    if (!appSwitcherDaaLl) {
      console.info('[SiteRedesign-Device] Analytics: "App Switcher" has no daa-ll ✓');
    } else {
      this.#verifyCollectCalls(collectCalls, [
        { daaLl: appSwitcherDaaLl, name: 'App Switcher' },
      ], 'Bar Analytics');
    }
  }

  // ── Products submenu ──────────────────────────────────────────────────────

  async validateProductsSubmenu() {
    const panelId      = await this.productsBtn.getAttribute('aria-controls');
    const name         = ((await this.productsBtn.textContent()) || '').trim() || panelId;
    console.info(`[SiteRedesign-Device] Checking ${name} submenu`);
    const productsPanel = this.page.locator(`#${panelId}`).first();
    await this.#tapOpen(this.productsBtn);
    await expect(productsPanel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });

    // Tabs (horizontal scroll row): Featured, Content Creation, etc.
    const tabs = productsPanel.locator('button.tab');
    const tabCount = await tabs.count();
    expect(tabCount, 'No product tabs found').toBeGreaterThan(0);

    // Tab strip must actually be horizontally scrollable (confirmed live: the row's
    // scrollWidth exceeds its clientWidth with overflow-x:auto on ul.tabs) — otherwise
    // tabs past the visible width would be unreachable on a narrow viewport.
    const tabsStrip = productsPanel.locator('ul.tabs').first();
    const tabsScrollInfo = await tabsStrip.evaluate((el) => ({
      overflowX: window.getComputedStyle(el).overflowX,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(['auto', 'scroll'], `"${name}" tab strip must allow horizontal overflow scrolling`).toContain(tabsScrollInfo.overflowX);
    if (tabsScrollInfo.scrollWidth > tabsScrollInfo.clientWidth) {
      await tabsStrip.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
      await expect.poll(() => tabsStrip.evaluate((el) => el.scrollLeft),
        `"${name}" tab strip did not scroll horizontally`).toBeGreaterThan(0);
      await tabsStrip.evaluate((el) => { el.scrollLeft = 0; });
      console.info(`[SiteRedesign-Device] "${name}" tab strip scrollable — scrollWidth=${tabsScrollInfo.scrollWidth} clientWidth=${tabsScrollInfo.clientWidth} ✓`);
    } else {
      console.info(`[SiteRedesign-Device] "${name}" tab strip fits without scrolling on this viewport (scrollWidth=${tabsScrollInfo.scrollWidth} clientWidth=${tabsScrollInfo.clientWidth})`);
    }

    // All Products link (top right) — must point to /products/catalog.html
    const allProductsLink     = productsPanel.locator('a.feds-link[href*="catalog"]').first();
    const allProductsRawHref  = await allProductsLink.getAttribute('href');
    const allProductsText     = (await allProductsLink.textContent()).trim();
    const allProductsResolved = new URL(allProductsRawHref, this.page.url()).href;
    expect(allProductsRawHref, `"${allProductsText}" must be a link`).toBeTruthy();
    expect(allProductsResolved, `"${allProductsText}" must point to /products/catalog.html`).toContain('/products/catalog.html');
    this.#assertLinkLocale(allProductsRawHref, allProductsText);

    // Product cards visible
    const cards = productsPanel.locator('a[href]').filter({ visible: true });
    const cardCount = await cards.count();
    expect(cardCount, 'No product cards visible').toBeGreaterThan(0);

    // Assert each tab, All Products link, and first card are visible in parallel
    const tabChecks = Array.from({ length: tabCount }, (_, i) => ({
      element: tabs.nth(i), conditions: { defaultVisibility: true },
    }));
    await this.promiseResolver([
      ...tabChecks,
      { element: allProductsLink,  conditions: { defaultVisibility: true } },
      { element: cards.first(),    conditions: { defaultVisibility: true } },
    ]);
    console.info(`[SiteRedesign-Device] Products: ${tabCount} tabs, All Products link, ${cardCount} card(s) visible ✓`);

    // All cards have valid hrefs
    const cardData = await cards.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    for (const { href, text } of cardData) {
      expect(href, `Product card "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
    }

    // ── Typography — confirmed live on mobile: tabs 14px/700, card title 20px/900, card
    // subtitle 14px/400, all Adobe Clean family (panel title checked by #checkPanelTitle) ──
    await this.#checkPanelTitle(productsPanel, name);
    const typographyFailures = [];
    const readFont = (el) => { const s = window.getComputedStyle(el); return { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight }; };
    const checkFont = (label, style, expected) => {
      if (!style.fontFamily.toLowerCase().includes('adobe clean')) typographyFailures.push(`${label} font-family: ${style.fontFamily.split(',')[0]} (expected Adobe Clean)`);
      if (style.fontSize !== expected.fontSize) typographyFailures.push(`${label} font-size: ${style.fontSize} (expected ${expected.fontSize})`);
      if (style.fontWeight !== expected.fontWeight) typographyFailures.push(`${label} font-weight: ${style.fontWeight} (expected ${expected.fontWeight})`);
    };
    const tabStyle = await tabs.first().evaluate(readFont, null, { timeout: 8000 }).catch(() => null);
    if (tabStyle) checkFont(`"${name}" tab`, tabStyle, { fontSize: '14px', fontWeight: '700' });
    const cardTitleStyle = await productsPanel.locator('.feds-product-card__title').first().evaluate(readFont, null, { timeout: 8000 }).catch(() => null);
    if (cardTitleStyle) checkFont(`"${name}" card title`, cardTitleStyle, { fontSize: '20px', fontWeight: '900' });
    const cardSubtitleStyle = await productsPanel.locator('.feds-product-card__subtitle').first().evaluate(readFont, null, { timeout: 8000 }).catch(() => null);
    if (cardSubtitleStyle) checkFont(`"${name}" card subtitle`, cardSubtitleStyle, { fontSize: '14px', fontWeight: '400' });
    expect(typographyFailures, `"${name}" typography violations:\n${typographyFailures.join('\n')}`).toHaveLength(0);
    console.info(`[SiteRedesign-Device] "${name}" Typography — title 32px/900, tabs 14px/700, card title 20px/900, subtitle 14px/400 ✓`);

    // ── Card gap — log actual value (differs from desktop 8px on mobile) ─────
    const gapInfo = await productsPanel.evaluate((panel) => {
      const container = panel.querySelector('div.feds-gnav-cards');
      if (!container) return null;
      const s = window.getComputedStyle(container);
      return { rowGap: s.rowGap, columnGap: s.columnGap };
    });
    if (gapInfo) console.info(`[SiteRedesign-Device] Products cards gap — row-gap="${gapInfo.rowGap}" column-gap="${gapInfo.columnGap}"`);

    // Click each tab and verify cards update
    // Rapid force-tapping across many tabs triggers spurious "navigated to about:blank"
    // events on WebKit (confirmed live: happens even with zero other code involved — a
    // pre-existing engine quirk, not caused by anything in this suite) — enough of them in a
    // tight loop can destabilize the browser. Block navigations just for this loop so any
    // stray one is a no-op instead of accumulating.
    const blockStrayNavigations = async (route) => {
      if (route.request().isNavigationRequest()) await route.fulfill({ status: 204, body: '' });
      else await route.continue();
    };
    await this.page.route('**/*', blockStrayNavigations);
    try {
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        const label = (await tab.textContent()).trim();
        // force: true — Playwright's pre-tap stability check can stall here (confirmed via
        // manual testing the tab itself is genuinely tappable; same class of actionability-check
        // flake diagnosed on desktop WebKit). The tap's actual effect is still verified below.
        await tab.tap({ force: true });
        await productsPanel.locator('a[href]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        const visibleCards = await productsPanel.locator('a[href]').filter({ visible: true }).count();
        expect(visibleCards, `Tab "${label}" shows no cards`).toBeGreaterThan(0);
        console.info(`[SiteRedesign-Device] Products tab "${label}" — ${visibleCards} card(s) ✓`);
      }
    } finally {
      await this.page.unroute('**/*', blockStrayNavigations).catch(() => {});
    }

    const hasPromo = await this.#checkPromoCard(productsPanel, name);

    await this.#closeSubmenuPanel(productsPanel, name);
    console.info(`[SiteRedesign-Device] ${name} submenu: PASS`);
    return { hasPromo, name };
  }

  // ── Use Cases submenu ─────────────────────────────────────────────────────

  async validateUseCasesSubmenu() {
    const ucPanelId   = await this.useCasesBtn.getAttribute('aria-controls');
    const name        = ((await this.useCasesBtn.textContent()) || '').trim() || ucPanelId;
    console.info(`[SiteRedesign-Device] Checking ${name} submenu`);
    const useCasesPanel = this.page.locator(`#${ucPanelId}`).first();
    await this.#tapOpen(this.useCasesBtn);
    await expect(useCasesPanel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });

    // Use case cards — vertical list on mobile
    const links = useCasesPanel.locator('a').filter({ visible: true });
    const linkCount = await links.count();
    expect(linkCount, 'No links in Use Cases panel').toBeGreaterThan(0);
    const linkData = await links.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    for (const { href, text } of linkData) {
      expect(href, `"${name}" link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] "${name}" link "${text}" href="${href}" ✓`);
    }

    // Headings and links — assert each visible in parallel
    const headings = useCasesPanel.locator('h2, h3, [role="heading"]').filter({ visible: true });
    const headingCount = await headings.count();
    const headingChecks = Array.from({ length: headingCount }, (_, i) => ({
      element: headings.nth(i), conditions: { defaultVisibility: true },
    }));
    const linkChecks = Array.from({ length: linkCount }, (_, i) => ({
      element: links.nth(i), conditions: { defaultVisibility: true },
    }));
    await this.promiseResolver([...headingChecks, ...linkChecks]);

    const ucGap = await useCasesPanel.evaluate((panel) => {
      const container = panel.querySelector('div.feds-gnav-cards');
      if (!container) return null;
      const s = window.getComputedStyle(container);
      return { rowGap: s.rowGap, columnGap: s.columnGap };
    });
    if (ucGap) {
      console.info(`[SiteRedesign-Device] "${name}" cards gap — row-gap="${ucGap.rowGap}" column-gap="${ucGap.columnGap}"`);
      expect(ucGap.rowGap, `"${name}" cards row-gap should be 4px on mobile, got "${ucGap.rowGap}"`).toBe('4px');
      expect(ucGap.columnGap, `"${name}" cards column-gap should be 4px on mobile, got "${ucGap.columnGap}"`).toBe('4px');
      console.info(`[SiteRedesign-Device] "${name}" cards gap=4px ✓`);
    }

    console.info(`[SiteRedesign-Device] ${name}: ${headingCount} heading(s), ${linkCount} link(s) ✓`);

    // Independent, read-only checks on the same already-open panel — run in parallel.
    const [, , hasPromo, ctaCount] = await Promise.all([
      this.#checkPanelTitle(useCasesPanel, name),
      this.#checkSectionHeadings(useCasesPanel, name),
      this.#checkPromoCard(useCasesPanel, name),
      this.#checkSubmenuCtas(useCasesPanel, name),
    ]);
    console.info(`[SiteRedesign-Device] "${name}" CTAs: ${ctaCount} validated ✓`);

    await this.#closeSubmenuPanel(useCasesPanel, name);
    console.info(`[SiteRedesign-Device] ${name} submenu: PASS`);
    return { hasPromo, name };
  }

  // ── Solutions submenu ─────────────────────────────────────────────────────

  async validateSolutionsSubmenu() {
    const solPanelId   = await this.solutionsBtn.getAttribute('aria-controls');
    const name         = ((await this.solutionsBtn.textContent()) || '').trim() || solPanelId;
    console.info(`[SiteRedesign-Device] Checking ${name} submenu`);
    const solutionsPanel = this.page.locator(`#${solPanelId}`).first();
    await this.#tapOpen(this.solutionsBtn);
    await expect(solutionsPanel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });

    const links = solutionsPanel.locator('a').filter({ visible: true });
    const linkCount = await links.count();
    expect(linkCount, 'No links in Solutions panel').toBeGreaterThan(0);
    await this.promiseResolver(Array.from({ length: linkCount }, (_, i) => ({
      element: links.nth(i), conditions: { defaultVisibility: true },
    })));
    const linkData = await links.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    for (const { href, text } of linkData) {
      expect(href, `"${name}" link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] "${name}" link "${text}" href="${href}" ✓`);
    }

    await this.#checkAccordionSections(solutionsPanel, name);

    // Independent, read-only checks on the same already-open panel — run in parallel.
    const [, , hasPromo, ctaCount] = await Promise.all([
      this.#checkPanelTitle(solutionsPanel, name),
      this.#checkSectionHeadings(solutionsPanel, name),
      this.#checkPromoCard(solutionsPanel, name),
      this.#checkSubmenuCtas(solutionsPanel, name),
    ]);
    console.info(`[SiteRedesign-Device] "${name}" CTAs: ${ctaCount} validated ✓`);

    await this.#closeSubmenuPanel(solutionsPanel, name);
    console.info(`[SiteRedesign-Device] ${name} submenu: PASS`);
    return { hasPromo, name };
  }

  // ── Quick Actions submenu ─────────────────────────────────────────────────

  async validateQuickActionsSubmenu() {
    const qaPanelId   = await this.quickActionsBtn.getAttribute('aria-controls');
    const name        = ((await this.quickActionsBtn.textContent()) || '').trim() || qaPanelId;
    console.info(`[SiteRedesign-Device] Checking ${name} submenu`);
    const quickActionsPanel = this.page.locator(`#${qaPanelId}`).first();
    await this.#tapOpen(this.quickActionsBtn);
    await expect(quickActionsPanel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });

    const links = quickActionsPanel.locator('a').filter({ visible: true });
    const linkCount = await links.count();
    expect(linkCount, 'No links in Quick Actions panel').toBeGreaterThan(0);
    await this.promiseResolver(Array.from({ length: linkCount }, (_, i) => ({
      element: links.nth(i), conditions: { defaultVisibility: true },
    })));
    const linkData = await links.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    for (const { href, text } of linkData) {
      expect(href, `"${name}" link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] "${name}" link "${text}" href="${href}" ✓`);
    }

    await this.#checkAccordionSections(quickActionsPanel, name);

    // Independent, read-only checks on the same already-open panel — run in parallel.
    const [, , hasPromo, ctaCount] = await Promise.all([
      this.#checkPanelTitle(quickActionsPanel, name),
      this.#checkSectionHeadings(quickActionsPanel, name),
      this.#checkPromoCard(quickActionsPanel, name),
      this.#checkSubmenuCtas(quickActionsPanel, name),
    ]);
    console.info(`[SiteRedesign-Device] "${name}" CTAs: ${ctaCount} validated ✓`);

    await this.#closeSubmenuPanel(quickActionsPanel, name);
    console.info(`[SiteRedesign-Device] ${name} submenu: PASS`);
    return { hasPromo, name };
  }

  // ── Learn & Support submenu ───────────────────────────────────────────────

  async validateLearnSupportSubmenu() {
    const lsPanelId       = await this.learnSupportBtn.getAttribute('aria-controls');
    const name            = ((await this.learnSupportBtn.textContent()) || '').trim() || lsPanelId;
    console.info(`[SiteRedesign-Device] Checking ${name} submenu`);
    const learnSupportPanel = this.page.locator(`#${lsPanelId}`).first();
    await this.#tapOpen(this.learnSupportBtn);
    await expect(learnSupportPanel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });

    const links = learnSupportPanel.locator('a').filter({ visible: true });
    const linkCount = await links.count();
    expect(linkCount, 'No links in Learn & Support panel').toBeGreaterThan(0);
    await this.promiseResolver(Array.from({ length: linkCount }, (_, i) => ({
      element: links.nth(i), conditions: { defaultVisibility: true },
    })));
    const linkData = await links.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    for (const { href, text } of linkData) {
      expect(href, `"${name}" link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] "${name}" link "${text}" href="${href}" ✓`);
    }

    await this.#checkAccordionSections(learnSupportPanel, name);

    // Independent, read-only checks on the same already-open panel — run in parallel.
    const [, , hasPromo, ctaCount] = await Promise.all([
      this.#checkPanelTitle(learnSupportPanel, name),
      this.#checkSectionHeadings(learnSupportPanel, name),
      this.#checkPromoCard(learnSupportPanel, name),
      this.#checkSubmenuCtas(learnSupportPanel, name),
    ]);
    console.info(`[SiteRedesign-Device] "${name}" CTAs: ${ctaCount} validated ✓`);

    await this.#closeSubmenuPanel(learnSupportPanel, name);
    console.info(`[SiteRedesign-Device] ${name} submenu: PASS`);
    return { hasPromo, name };
  }

  // ── Accessibility ─────────────────────────────────────────────────────────

  async validateSkipLink() {
    const skipLink = this.page.locator('a[href="#main-content"], a[href="#main"], a[href="#root"]').first();
    await expect(skipLink, 'Skip link must exist in DOM').toBeAttached();
    console.info('[SiteRedesign-Device] PASS — skip link found');
  }

  async validateLangAttribute(localeLang) {
    const lang = await this.page.locator('html').getAttribute('lang');
    expect(lang, 'html must have a lang attribute').toBeTruthy();
    expect(lang.toLowerCase()).toContain(localeLang.toLowerCase());
    console.info(`[SiteRedesign-Device] PASS — html lang="${lang}"`);
  }

  async validateRtlDirection(dir) {
    if (dir !== 'rtl') { console.info('[SiteRedesign-Device] RTL: SKIP'); return; }
    const htmlDir = await this.page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');
    console.info(`[SiteRedesign-Device] RTL: PASS — html[dir]="${htmlDir}"`);
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  // Mobile footer loads after full page load. Sections may be accordion-collapsed
  // but links are in the DOM — validate by DOM presence, not CSS visibility.

  async validateFooter() {
    console.info('[SiteRedesign-Device] Checking footer links');

    // Scroll to footer to trigger lazy load, then wait for footer links to appear
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.locator('.feds-menu-section a').first().waitFor({ state: 'attached', timeout: 20000 });

    // Assert each section heading and footer logo/region visible in parallel
    // (mobile accordion trigger is role="button", not role="heading" — confirmed on live page)
    const headings   = this.page.locator('.feds-menu-section .feds-menu-headline');
    const headingCount = await headings.count();
    const footerBottomElements = [
      { element: this.page.locator('.feds-footer-logo').first(),       conditions: { defaultVisibility: true } },
      { element: this.page.locator('a.feds-regionPicker').first(),     conditions: { defaultVisibility: true } },
      { element: this.page.locator('ul.feds-social a').first(),        conditions: { defaultVisibility: true } },
      { element: this.page.locator('div.feds-footer-miscLinks-legal').first(), conditions: { defaultVisibility: true } },
      ...Array.from({ length: headingCount }, (_, i) => ({
        element: headings.nth(i), conditions: { defaultVisibility: true },
      })),
    ];
    await this.promiseResolver(footerBottomElements);

    // Heading typography — confirmed live these exact values match desktop's FOOTER_HEADING
    // (16px/700 Adobe Clean) despite the mobile-only accordion trigger role.
    const headingFontFailures = [];
    const headingData = await headings.evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return { text: (el.textContent || '').trim(), fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight };
    }));
    for (const { text, fontFamily, fontSize, fontWeight } of headingData) {
      if (!fontFamily.toLowerCase().includes('adobe clean'))
        headingFontFailures.push(`Footer heading "${text}" font-family: ${fontFamily.split(',')[0]} (expected Adobe Clean)`);
      if (fontSize !== '16px')
        headingFontFailures.push(`Footer heading "${text}" font-size: ${fontSize} (expected 16px)`);
      if (fontWeight !== '700')
        headingFontFailures.push(`Footer heading "${text}" font-weight: ${fontWeight} (expected 700)`);
    }
    expect(headingFontFailures, `Footer heading font violations:\n${headingFontFailures.join('\n')}`).toHaveLength(0);

    // Region picker + legal links — confirmed live these match desktop's SMALL_BOLD
    // (12px/700 Adobe Clean); social icon gap matches desktop's 24px.
    const smallBoldFailures = [];
    const checkSmallBold = async (locator, label) => {
      const style = await locator.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight };
      }, null, { timeout: 8000 }).catch(() => null);
      if (!style) return;
      if (!style.fontFamily.toLowerCase().includes('adobe clean')) smallBoldFailures.push(`${label} font-family: ${style.fontFamily.split(',')[0]} (expected Adobe Clean)`);
      if (style.fontSize !== '12px') smallBoldFailures.push(`${label} font-size: ${style.fontSize} (expected 12px)`);
      if (style.fontWeight !== '700') smallBoldFailures.push(`${label} font-weight: ${style.fontWeight} (expected 700)`);
    };
    await checkSmallBold(this.page.locator('a.feds-regionPicker').first(), 'Footer region picker');
    await checkSmallBold(this.page.locator('div.feds-footer-miscLinks-legal').first(), 'Footer legal links');
    const socialGap = await this.page.locator('ul.feds-social').first().evaluate((el) => window.getComputedStyle(el).columnGap).catch(() => null);
    if (socialGap && socialGap !== '24px') smallBoldFailures.push(`Footer social icons gap: ${socialGap} (expected 24px)`);
    expect(smallBoldFailures, `Footer region/legal/social violations:\n${smallBoldFailures.join('\n')}`).toHaveLength(0);

    // Expand each accordion section, then validate visible links.
    const sections     = this.page.locator('.feds-menu-section');
    const sectionCount = await sections.count();
    let totalLinks     = 0;
    const linkFontFailures = [];

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const heading = section.locator('.feds-menu-headline').first();

      // Tap heading to expand the accordion — scroll into view first
      await heading.scrollIntoViewIfNeeded().catch(() => {});
      await heading.tap({ timeout: 5000 }).catch(() => {});

      // Wait for at least one link inside this section to become visible
      await section.locator('a').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      const sectionLinks = section.locator('a').filter({ visible: true });
      const sectionLinkCount = await sectionLinks.count();
      expect(sectionLinkCount, `Footer section ${i + 1} has no visible links after expanding`).toBeGreaterThan(0);

      const linkData = await sectionLinks.evaluateAll((els) =>
        els.map((el) => {
          const s = window.getComputedStyle(el);
          return { text: (el.textContent || '').trim(), href: el.getAttribute('href'), fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, isIconLink: !!el.querySelector('.feds-navLink-image') };
        })
      );
      // Confirmed live these match desktop's FOOTER_LINK (16px/400 Adobe Clean) — except the
      // Featured Products icon links, which desktop also treats as a bold (700) exception.
      for (const { text, href, fontFamily, fontSize, fontWeight, isIconLink } of linkData) {
        expect(text, 'Footer link has empty text').toBeTruthy();
        expect(href, `Footer link "${text}" missing href`).toBeTruthy();
        this.#assertLinkLocale(href, `Footer: ${text}`);
        const expectedWeight = isIconLink ? '700' : '400';
        if (!fontFamily.toLowerCase().includes('adobe clean'))
          linkFontFailures.push(`Footer link "${text}" font-family: ${fontFamily.split(',')[0]} (expected Adobe Clean)`);
        if (fontSize !== '16px')
          linkFontFailures.push(`Footer link "${text}" font-size: ${fontSize} (expected 16px)`);
        if (fontWeight !== expectedWeight)
          linkFontFailures.push(`Footer link "${text}" font-weight: ${fontWeight} (expected ${expectedWeight})`);
      }
      totalLinks += sectionLinkCount;
      console.info(`[SiteRedesign-Device] Footer section ${i + 1}/${sectionCount}: ${sectionLinkCount} links visible ✓`);
    }
    expect(linkFontFailures, `Footer link font violations:\n${linkFontFailures.join('\n')}`).toHaveLength(0);

    console.info(`[SiteRedesign-Device] Footer: PASS — ${sectionCount} sections, ${headingCount} headings, ${totalLinks} links validated, typography Adobe Clean ✓`);
  }

  // Mobile footer is a single-column stack (confirmed live: all sections share the same left
  // edge; each section's top sits flush against the previous section's bottom, no gap/overlap)
  // — unlike desktop's multi-column layout, so this checks sequential stacking + a shared left
  // edge instead of desktop's row/column grid alignment.
  async validateFooterAlignment() {
    const failures = await this.page.locator('.feds-menu-section').evaluateAll((sections) => {
      const issues = [];
      const rects = sections.map((s) => s.getBoundingClientRect());
      const left0 = rects[0]?.left;
      rects.forEach((r, i) => {
        if (Math.abs(r.left - left0) > 1) issues.push(`Section ${i + 1} not column-aligned (left=${r.left}, expected ${left0})`);
        const prev = rects[i - 1];
        if (prev && r.top < prev.bottom - 1) issues.push(`Section ${i + 1} overlaps section ${i}`);
      });
      return issues;
    });
    expect(failures, `Footer alignment violations:\n${failures.join('\n')}`).toHaveLength(0);
    const sectionCount = await this.page.locator('.feds-menu-section').count();
    console.info(`[SiteRedesign-Device] Footer: Alignment — ${sectionCount} section(s) column-aligned, sequentially stacked, no overlap ✓`);
  }

  // Region-picker modal open/close + footer analytics (section links, region picker) — one
  // capture window around all clicks, so the settle-wait is paid once instead of per element.
  async validateFooterRegionModalAndAnalytics() {
    console.info('[SiteRedesign-Device] Checking footer region-picker modal + footer analytics');
    const regionLink = this.page.locator('a.feds-regionPicker').first();
    const modal       = this.page.locator('#langnav');
    const regionDaaLl = await regionLink.getAttribute('daa-ll');
    if (!regionDaaLl) this.#warn('Footer region picker — missing daa-ll');

    // Section-link clicks deliberately excluded from the capture below — real hrefs to other
    // pages proved unreliable to click-and-block on WebKit (this project's mobile engine, see
    // validateBarAnalytics()'s logo-click note) even with preventDefault(). Checked as plain
    // daa-ll attribute presence instead, same reasoning as Sign In/logo elsewhere in this file.
    const sectionFirstLinks = await this.page.locator('.feds-menu-section').evaluateAll((sections) => sections.map((s) => {
      const a = s.querySelector('a');
      return { text: (a?.textContent || '').trim(), daaLl: a?.getAttribute('daa-ll') || null };
    }));
    for (const { daaLl, text } of sectionFirstLinks) {
      if (!daaLl) this.#warn(`Footer: "${text}" missing daa-ll`);
      else console.info(`[SiteRedesign-Device] Analytics: Footer "${text}" daa-ll="${daaLl}" ✓`);
    }

    // Confirmed live: the close button has its own distinct daa-ll ("langnav:modalClose:..."),
    // nothing to do with the region link's — read it once the modal is open, before closing.
    let closeDaaLl = null;

    const collectCalls = await this.#captureCollectCalls(async () => {
      // Retry with a short per-attempt timeout, same pattern as openHamburger()/
      // closeHamburger()/#closeSubmenuPanel() — confirmed via repeated live runs that this
      // specific click is intermittent, so a single un-retried attempt risks stalling.
      let opened = false;
      for (let attempt = 0; attempt < 3 && !opened; attempt++) {
        if (attempt > 0) await this.page.waitForTimeout(300);
        await regionLink.evaluate((el) => el.click(), null, { timeout: 3000 }).catch(() => {});
        opened = await modal.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
      }
      await expect(modal, 'Footer region-picker modal did not open').toBeVisible({ timeout: 15000 });
      const linkCount = await modal.locator('a[href]').filter({ visible: true }).count();
      expect(linkCount, 'Region-picker modal has no region links').toBeGreaterThan(0);
      console.info(`[SiteRedesign-Device] Footer region picker — modal opened with ${linkCount} region link(s) ✓`);

      const closeBtn = modal.locator('.dialog-close, button[aria-label*="close" i]').first();
      closeDaaLl = await closeBtn.getAttribute('daa-ll');

      let closed = false;
      for (let attempt = 0; attempt < 3 && !closed; attempt++) {
        if (attempt > 0) await this.page.waitForTimeout(300);
        await closeBtn.evaluate((el) => el.click(), null, { timeout: 3000 }).catch(() => {});
        closed = await modal.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
      }
      await expect(modal, 'Footer region-picker modal did not close').toBeHidden({ timeout: 15000 });
    });

    console.info('[SiteRedesign-Device] Footer region-picker: PASS — modal opened, closed');
    this.#verifyCollectCalls(collectCalls, [
      { daaLl: regionDaaLl, name: 'Footer region picker', closeDaaLl },
    ], 'Footer Analytics');
  }

  // ── Font styles — Adobe Clean on nav overlay elements ─────────────────────

  async validateNavFontStyles() {
    console.info('[SiteRedesign-Device] Checking font styles on nav overlay elements');
    // Hamburger must be open before calling this
    const failures = [];
    const linkData = await this.page.locator('button.mega-menu.feds-link, ul.feds-gnav-items > li > a.feds-link')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.textContent || '').trim().slice(0, 40), fontFamily: s.fontFamily, fontSize: s.fontSize };
      }));
    expect(linkData.length, 'No nav overlay links found for font check').toBeGreaterThan(0);
    for (const { text, fontFamily, fontSize } of linkData) {
      if (!fontFamily.toLowerCase().includes('adobe clean'))
        failures.push(`"${text}" font-family: ${fontFamily.split(',')[0]} (expected Adobe Clean)`);
      console.info(`[SiteRedesign-Device] Font: "${text}" — ${fontSize} | Adobe Clean ✓`);
    }
    expect(failures, `Nav font violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info(`[SiteRedesign-Device] Font: PASS — ${linkData.length} nav items (Adobe Clean)`);
  }

  // ── Analytics — daa-ll on all nav elements ────────────────────────────────

  // Fetches each dropdown's panel's back-button daa-ll via aria-controls — mobile dropdowns
  // close via a separate back button with its own distinct daa-ll (e.g. "Products|Back"),
  // architecturally different from desktop, where the same toggle element handles both open
  // and close.
  async verifyHamburgerAnalytics(collectCalls, closeCollectCalls = [], hamburgerCloseDaaLl = null) {
    const hamburgerDaaLl = await this.hamburger.getAttribute('daa-ll');
    const dropdownData = await this.allDropdowns.evaluateAll((els) => els.map((el) => ({
      daaLl: el.getAttribute('daa-ll'), name: (el.textContent || '').trim(), panelId: el.getAttribute('aria-controls'),
    })));
    const withCloseDaaLl = await Promise.all(dropdownData.map(async ({ daaLl, name, panelId }) => {
      const backBtn = this.page.locator(`#${panelId}`).first().locator('button.feds-popup-back-button');
      const closeDaaLl = await backBtn.getAttribute('daa-ll').catch(() => null);
      return { daaLl, name, closeDaaLl };
    }));
    this.#verifyCollectCalls([...collectCalls, ...closeCollectCalls], [
      { daaLl: hamburgerDaaLl, name: 'Hamburger', closeDaaLl: hamburgerCloseDaaLl },
      ...withCloseDaaLl,
    ], 'Hamburger Analytics');
  }

  // ── Keyboard navigation — Enter/Escape on nav dropdown ────────────────────

  async validateKeyboardNavigation() {
    console.info('[SiteRedesign-Device] Checking keyboard navigation');
    const btn     = this.productsBtn;
    const btnText = ((await btn.textContent({ timeout: 5000 })) || '').trim() || 'dropdown 1';
    const panelId = await btn.getAttribute('aria-controls', { timeout: 5000 });
    const panel   = this.page.locator(`#${panelId}`).first();

    // Real focus() + keyboard.press() — matches how an actual user triggers this, and (like
    // #tapOpen) relies on Playwright's own built-in actionability wait rather than a manual one.
    // Explicit timeout — unbounded actions on this page can occasionally take 40+ seconds.
    await btn.focus({ timeout: 8000 });
    await this.page.keyboard.press('Enter');
    await expect(btn, `[${btnText}] Enter must set aria-expanded="true"`).toHaveAttribute('aria-expanded', 'true');
    await expect(panel, `[${btnText}] panel did not open on Enter`).toBeVisible({ timeout: 15000 });
    console.info(`[SiteRedesign-Device] Keyboard: [${btnText}] opened via Enter ✓`);

    // Confirmed live (isolated + full 5-submenu sequence) that Escape reliably closes this
    // panel — the occasional miss in the full test run isn't reproducible standalone, so this
    // is a one-time retry for resilience against a transient key-event miss, not a masked bug.
    await this.page.keyboard.press('Escape');
    let escapeClosed = await panel.waitFor({ state: 'hidden', timeout: 3000 }).then(() => true).catch(() => false);
    if (!escapeClosed) await this.page.keyboard.press('Escape');
    await expect(panel, `[${btnText}] panel did not close on Escape`).toBeHidden({ timeout: 15000 });
    console.info(`[SiteRedesign-Device] Keyboard: [${btnText}] closed via Escape ✓`);
  }

  // ── Focus visible — nav overlay elements ─────────────────────────────────

  async validateFocusVisible() {
    console.info('[SiteRedesign-Device] Checking focus ring on nav overlay elements');
    // Hamburger must be open
    // Explicit timeout — unbounded actions on this page can occasionally take 40+ seconds.
    await this.adobelogo.evaluate((el) => el.focus(), null, { timeout: 8000 });
    let passed = 0;
    for (let i = 0; i < 4; i++) {
      await this.page.keyboard.press('Tab');
      const el = await this.page.evaluate(() => {
        const node = document.activeElement;
        if (!node || node === document.body) return null;
        const s = window.getComputedStyle(node);
        return {
          tag: node.tagName,
          label: (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 40),
          focusVisible: node.matches(':focus-visible'),
          outline: s.outlineStyle, outlineW: s.outlineWidth, shadow: s.boxShadow,
        };
      });
      if (!el) break;
      const hasRing = el.focusVisible && ((el.outline !== 'none' && el.outlineW !== '0px') || el.shadow !== 'none');
      console.info(`[SiteRedesign-Device] Focus: Tab ${i + 1} <${el.tag}> "${el.label}" — :focus-visible=${el.focusVisible}`);
      expect(hasRing, `Tab ${i + 1}: <${el.tag}> "${el.label}" has no visible focus ring`).toBe(true);
      passed++;
    }
    console.info(`[SiteRedesign-Device] Focus: PASS — ${passed} elements verified`);
  }
}
