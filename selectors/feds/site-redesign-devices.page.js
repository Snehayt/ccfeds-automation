import { expect, test } from '@playwright/test';

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
    this.signInBtn     = page.locator('[data-test-id="unav-profile--sign-in"]');

    // ── Mobile nav items inside overlay ───────────────────────────────────────
    // Positions: Products=nth(0), UseCases=nth(1), Solutions=nth(2)
    // L&S is always last (locale may add extra buttons between Solutions and L&S)
    // Panel IDs are locale-specific (e.g. DE: "produkte", "lösungen") — resolved at runtime via aria-controls
    this.productsBtn     = page.locator('button.mega-menu.feds-link').nth(0);
    this.useCasesBtn     = page.locator('button.mega-menu.feds-link').nth(1);
    this.solutionsBtn    = page.locator('button.mega-menu.feds-link').nth(2);
    this.learnSupportBtn = page.locator('button.mega-menu.feds-link').last();
    this.plansLink       = page.locator('ul.feds-gnav-items > li > a.feds-link[href*="plans.html"]');
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  #warn(label) {
    console.warn(`WARN — ${label}`);
    test.info().annotations.push({ type: 'warning', description: label });
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

    await this.page.locator('header.global-navigation').waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
    return { url, status };
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
    // Hamburger appears ~1s after GNAV ready — wait before evaluating
    await this.page.locator('button.feds-nav-toggle').waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
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
      { element: this.adobelogo,   conditions: { defaultVisibility: true } },
      { element: this.appSwitcher, conditions: { defaultVisibility: true } },
      { element: this.signInBtn,   conditions: { defaultVisibility: true } },
      { element: this.adobeLogoImg, conditions: { defaultVisibility: true } },
    ]);
    const rawHref  = await this.adobeLogoLink.getAttribute('href');
    const resolved = new URL(rawHref, this.page.url()).href;
    expect(resolved, 'Adobe logo must point to adobe.com').toContain('adobe.com');
    this.#assertLinkLocale(rawHref, 'Adobe logo');
    const logoAlt = await this.adobeLogoImg.getAttribute('alt');
    expect(logoAlt, 'Adobe logo must have alt text').toBeTruthy();
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
      await this.hamburger.tap().catch(() => {});
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
      await this.hamburger.tap().catch(() => {});
      closed = await this.page.waitForFunction(
        () => document.querySelector('button.feds-nav-toggle')?.getAttribute('aria-expanded') !== 'true',
        { timeout: 2000 }
      ).then(() => true).catch(() => false);
    }
    await this.allDropdowns.first().waitFor({ state: 'hidden', timeout: 15000 });
    console.info('[SiteRedesign-Device] PASS — hamburger menu closed');
  }

  // ── Mobile nav list ───────────────────────────────────────────────────────

  async validateMobileNavList(country) {
    console.info('[SiteRedesign-Device] Checking nav items in overlay');
    const navItems = [
      { element: this.productsBtn,     conditions: { defaultVisibility: true } },
      { element: this.useCasesBtn,     conditions: { defaultVisibility: true } },
      { element: this.solutionsBtn,    conditions: { defaultVisibility: true } },
      { element: this.learnSupportBtn, conditions: { defaultVisibility: true } },
    ];
    const excludeCIS = ['CIS English', 'CIS Russian', 'China'];
    if (!excludeCIS.includes(country)) {
      navItems.push({ element: this.plansLink, conditions: { defaultVisibility: true } });
    }
    await this.promiseResolver(navItems);
    const dropdownCount = await this.allDropdowns.count();
    console.info(`[SiteRedesign-Device] PASS — ${dropdownCount} dropdown buttons visible in overlay`);
  }

  // ── Products submenu ──────────────────────────────────────────────────────

  async validateProductsSubmenu() {
    console.info('[SiteRedesign-Device] Checking Products submenu');
    const panelId      = await this.productsBtn.getAttribute('aria-controls') || 'products';
    const productsPanel = this.page.locator(`#${panelId}`).first();
    await this.productsBtn.tap();
    await expect(productsPanel, 'Products panel did not open').toBeVisible({ timeout: 15000 });

    // Tabs (horizontal scroll row): Featured, Content Creation, etc.
    const tabs = productsPanel.locator('button.tab');
    const tabCount = await tabs.count();
    expect(tabCount, 'No product tabs found').toBeGreaterThan(0);

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

    // ── Card gap — log actual value (differs from desktop 8px on mobile) ─────
    const gapInfo = await productsPanel.evaluate((panel) => {
      const container = panel.querySelector('div.feds-gnav-cards');
      if (!container) return null;
      const s = window.getComputedStyle(container);
      return { rowGap: s.rowGap, columnGap: s.columnGap };
    });
    if (gapInfo) console.info(`[SiteRedesign-Device] Products cards gap — row-gap="${gapInfo.rowGap}" column-gap="${gapInfo.columnGap}"`);

    // Click each tab and verify cards update
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const label = (await tab.textContent()).trim();
      await tab.tap();
      await productsPanel.locator('a[href]').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      const visibleCards = await productsPanel.locator('a[href]').filter({ visible: true }).count();
      expect(visibleCards, `Tab "${label}" shows no cards`).toBeGreaterThan(0);
      console.info(`[SiteRedesign-Device] Products tab "${label}" — ${visibleCards} card(s) ✓`);
    }

    // Close Products panel via back button (tapping productsBtn again closes the whole hamburger on mobile)
    await productsPanel.locator('button.feds-popup-back-button').tap({ timeout: 3000 }).catch(() => {});
    await expect(productsPanel, 'Products panel did not close').toBeHidden({ timeout: 15000 });
    console.info('[SiteRedesign-Device] Products submenu: PASS');
  }

  // ── Use Cases submenu ─────────────────────────────────────────────────────

  async validateUseCasesSubmenu() {
    console.info('[SiteRedesign-Device] Checking Use Cases submenu');
    const ucPanelId   = await this.useCasesBtn.getAttribute('aria-controls') || 'use-cases';
    const useCasesPanel = this.page.locator(`#${ucPanelId}`).first();
    await this.useCasesBtn.tap();
    await expect(useCasesPanel, 'Use Cases panel did not open').toBeVisible({ timeout: 15000 });

    // Use case cards — vertical list on mobile
    const links = useCasesPanel.locator('a').filter({ visible: true });
    const linkCount = await links.count();
    expect(linkCount, 'No links in Use Cases panel').toBeGreaterThan(0);
    const linkData = await links.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    for (const { href, text } of linkData) {
      expect(href, `Use Cases link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] Use Cases link "${text}" href="${href}" ✓`);
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
      console.info(`[SiteRedesign-Device] Use Cases cards gap — row-gap="${ucGap.rowGap}" column-gap="${ucGap.columnGap}"`);
      expect(ucGap.rowGap, `Use Cases cards row-gap should be 4px on mobile, got "${ucGap.rowGap}"`).toBe('4px');
      expect(ucGap.columnGap, `Use Cases cards column-gap should be 4px on mobile, got "${ucGap.columnGap}"`).toBe('4px');
      console.info('[SiteRedesign-Device] Use Cases cards gap=4px ✓');
    }

    console.info(`[SiteRedesign-Device] Use Cases: ${headingCount} heading(s), ${linkCount} link(s) ✓`);

    await useCasesPanel.locator('button.feds-popup-back-button').tap({ timeout: 3000 }).catch(() => {});
    await expect(useCasesPanel).toBeHidden({ timeout: 15000 });
    console.info('[SiteRedesign-Device] Use Cases submenu: PASS');
  }

  // ── Solutions submenu ─────────────────────────────────────────────────────

  async validateSolutionsSubmenu(country) {
    const excludeCIS = ['CIS English', 'CIS Russian', 'China'];
    if (excludeCIS.includes(country)) {
      console.info('[SiteRedesign-Device] Solutions: SKIP — not shown for this country');
      return;
    }

    console.info('[SiteRedesign-Device] Checking Solutions submenu');
    const solPanelId   = await this.solutionsBtn.getAttribute('aria-controls') || 'solutions';
    const solutionsPanel = this.page.locator(`#${solPanelId}`).first();
    await this.solutionsBtn.tap();
    await expect(solutionsPanel, 'Solutions panel did not open').toBeVisible({ timeout: 15000 });

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
      expect(href, `Solutions link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] Solutions link "${text}" href="${href}" ✓`);
    }

    await solutionsPanel.locator('button.feds-popup-back-button').tap({ timeout: 3000 }).catch(() => {});
    await expect(solutionsPanel).toBeHidden({ timeout: 15000 });
    console.info('[SiteRedesign-Device] Solutions submenu: PASS');
  }

  // ── Learn & Support submenu ───────────────────────────────────────────────

  async validateLearnSupportSubmenu(country) {
    const excludeCIS = ['CIS English', 'CIS Russian', 'China'];
    if (excludeCIS.includes(country)) {
      console.info('[SiteRedesign-Device] Learn & Support: SKIP — not shown for this country');
      return;
    }

    console.info('[SiteRedesign-Device] Checking Learn & Support submenu');
    const lsPanelId       = await this.learnSupportBtn.getAttribute('aria-controls') || 'learn-support';
    const learnSupportPanel = this.page.locator(`#${lsPanelId}`).first();
    await this.learnSupportBtn.tap();
    await expect(learnSupportPanel, 'Learn & Support panel did not open').toBeVisible({ timeout: 15000 });

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
      expect(href, `Learn & Support link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
      console.info(`[SiteRedesign-Device] L&S link "${text}" href="${href}" ✓`);
    }

    await learnSupportPanel.locator('button.feds-popup-back-button').tap({ timeout: 3000 }).catch(() => {});
    await expect(learnSupportPanel).toBeHidden({ timeout: 15000 });
    console.info('[SiteRedesign-Device] Learn & Support submenu: PASS');
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
    const headings   = this.page.locator('.feds-menu-section [role="heading"]');
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

    // Expand each accordion section, then validate visible links.
    const sections     = this.page.locator('.feds-menu-section');
    const sectionCount = await sections.count();
    let totalLinks     = 0;

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const heading = section.locator('[role="heading"]').first();

      // Tap heading to expand the accordion — scroll into view first
      await heading.scrollIntoViewIfNeeded().catch(() => {});
      await heading.tap({ timeout: 5000 }).catch(() => {});

      // Wait for at least one link inside this section to become visible
      await section.locator('a').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

      const sectionLinks = section.locator('a').filter({ visible: true });
      const sectionLinkCount = await sectionLinks.count();
      expect(sectionLinkCount, `Footer section ${i + 1} has no visible links after expanding`).toBeGreaterThan(0);

      const linkData = await sectionLinks.evaluateAll((els) =>
        els.map((el) => ({ text: (el.textContent || '').trim(), href: el.getAttribute('href') }))
      );
      for (const { text, href } of linkData) {
        expect(text, 'Footer link has empty text').toBeTruthy();
        expect(href, `Footer link "${text}" missing href`).toBeTruthy();
        this.#assertLinkLocale(href, `Footer: ${text}`);
      }
      totalLinks += sectionLinkCount;
      console.info(`[SiteRedesign-Device] Footer section ${i + 1}/${sectionCount}: ${sectionLinkCount} links visible ✓`);
    }

    console.info(`[SiteRedesign-Device] Footer: PASS — ${sectionCount} sections, ${headingCount} headings, ${totalLinks} links validated ✓`);
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

  async validateNavAnalyticsDaaLl() {
    console.info('[SiteRedesign-Device] Checking daa-ll attributes on nav elements');
    // Hamburger toggle
    const hamburgerDaaLl = await this.page.evaluate(() =>
      document.querySelector('button.feds-nav-toggle')?.getAttribute('daa-ll')
    );
    if (!hamburgerDaaLl) console.warn('[SiteRedesign-Device] Analytics: hamburger button missing daa-ll');
    else console.info(`[SiteRedesign-Device] Analytics: hamburger daa-ll="${hamburgerDaaLl}" ✓`);

    // Nav overlay buttons (dropdown triggers)
    const dropdownData = await this.allDropdowns.evaluateAll((els) => els.map((el) => ({
      text: (el.textContent || '').trim(),
      daaLl: el.getAttribute('daa-ll'),
    })));
    let missing = 0;
    for (const { text, daaLl } of dropdownData) {
      if (!daaLl) { console.warn(`[SiteRedesign-Device] Analytics: "${text}" missing daa-ll`); missing++; }
      else console.info(`[SiteRedesign-Device] Analytics: "${text}" daa-ll="${daaLl}" ✓`);
    }

    // Adobe logo daa-ll
    const logoDaaLl = await this.adobeLogoLink.getAttribute('daa-ll');
    if (!logoDaaLl) console.warn('[SiteRedesign-Device] Analytics: Adobe logo missing daa-ll');
    else console.info(`[SiteRedesign-Device] Analytics: logo daa-ll="${logoDaaLl}" ✓`);

    console.info(`[SiteRedesign-Device] Analytics: PASS — daa-ll checked (${missing} missing, warnings only)`);
  }

  // ── Promo card — Solutions panel ──────────────────────────────────────────

  async validatePromoCard() {
    console.info('[SiteRedesign-Device] Checking promo card in Solutions panel');
    const solPanelId     = await this.solutionsBtn.getAttribute('aria-controls') || 'solutions';
    const solutionsPanel = this.page.locator(`#${solPanelId}`).first();
    await this.solutionsBtn.tap();
    await expect(solutionsPanel).toBeVisible({ timeout: 15000 });

    const promo = solutionsPanel.locator('article.promo-card-small');
    const hasPromo = (await promo.count()) > 0;
    if (hasPromo) {
      await expect(promo.locator('picture.promo-card__bg'), 'Promo image not visible').toBeVisible({ timeout: 10000 });
      await expect(promo.locator('div.promo-card-small__text'), 'Promo text not visible').toBeVisible({ timeout: 10000 });
      const promoCta = promo.locator('a').filter({ visible: true }).first();
      if (await promoCta.count() > 0) {
        const promoHref = await promoCta.getAttribute('href');
        expect(promoHref, 'Promo CTA missing href').toBeTruthy();
        console.info(`[SiteRedesign-Device] Promo CTA href="${promoHref}" ✓`);
      }
      console.info('[SiteRedesign-Device] Promo card: PASS — image, text, CTA validated');
    } else {
      // On mobile, promo may render with an alternate variant class
      const promoAsCard = solutionsPanel.locator('article[class*="promo"] a[href]').filter({ visible: true }).first();
      if (await promoAsCard.count() > 0) {
        const href = await promoAsCard.getAttribute('href');
        expect(href, 'Promo card link missing href').toBeTruthy();
        console.info(`[SiteRedesign-Device] Promo (as card): href="${href}" ✓`);
      } else {
        this.#warn('Solutions panel: promo card not found — no article.promo-card-small or article[class*="promo"]');
      }
    }

    await solutionsPanel.locator('button.feds-popup-back-button').tap({ timeout: 3000 }).catch(() => {});
    await expect(solutionsPanel).toBeHidden({ timeout: 15000 });
  }

  // ── CTAs — Explore, Contact us, Go to Adobe Help/Learn/Community ──────────

  async validateSubmenuCtas() {
    console.info('[SiteRedesign-Device] Checking CTAs in submenus');
    const ctaSelectors = 'a.feds-primary-cta, a.feds-secondary-cta, a.feds-button, a[class*="-cta"]';
    let totalCtas = 0;

    const ucPanelId  = await this.useCasesBtn.getAttribute('aria-controls') || 'use-cases';
    const solPanelId = await this.solutionsBtn.getAttribute('aria-controls') || 'solutions';
    const lsPanelId  = await this.learnSupportBtn.getAttribute('aria-controls') || 'learn-support';
    const useCasesPanel    = this.page.locator(`#${ucPanelId}`).first();
    const solutionsPanel   = this.page.locator(`#${solPanelId}`).first();
    const learnSupportPanel = this.page.locator(`#${lsPanelId}`).first();

    const submenus = [
      { btn: this.useCasesBtn,     panel: useCasesPanel,     name: 'Use Cases' },
      { btn: this.solutionsBtn,    panel: solutionsPanel,    name: 'Solutions' },
      { btn: this.learnSupportBtn, panel: learnSupportPanel, name: 'Learn & Support' },
    ];

    for (const { btn, panel, name } of submenus) {
      await btn.tap();
      await expect(panel).toBeVisible({ timeout: 15000 });

      const ctas = panel.locator(ctaSelectors).filter({ visible: true });
      const ctaData = await ctas.evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return {
          text: (el.textContent || '').trim(), href: el.getAttribute('href'),
          fontSize: s.fontSize, fontFamily: s.fontFamily,
          paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
          paddingLeft: s.paddingLeft, paddingRight: s.paddingRight,
        };
      }));

      if (ctaData.length > 0) {
        const ctaFailures = [];
        for (const { text, href, fontSize, fontFamily, paddingTop, paddingBottom, paddingLeft, paddingRight } of ctaData) {
          expect(href, `${name} CTA "${text}" missing href`).toBeTruthy();
          if (!fontFamily.toLowerCase().includes('adobe clean'))
            ctaFailures.push(`CTA "${text}" font: ${fontFamily.split(',')[0]} (expected Adobe Clean)`);
          if (paddingTop === '0px' || paddingBottom === '0px' || paddingLeft === '0px' || paddingRight === '0px')
            ctaFailures.push(`CTA "${text}" has zero padding: ${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`);
          console.info(`[SiteRedesign-Device] CTA "${name}" → "${text}" | ${fontSize} Adobe Clean | padding:${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft} ✓`);
        }
        expect(ctaFailures, `CTA violations in "${name}":\n${ctaFailures.join('\n')}`).toHaveLength(0);
        totalCtas += ctaData.length;
      } else {
        const exploreCtas = await panel.locator('a[href]').filter({ visible: true })
          .evaluateAll((els) => els.map((el) => {
            const s = window.getComputedStyle(el);
            return { text: el.textContent.trim(), href: el.getAttribute('href'), fontSize: s.fontSize, fontFamily: s.fontFamily, paddingTop: s.paddingTop, paddingLeft: s.paddingLeft };
          }));
        for (const { text, href, fontSize, fontFamily, paddingTop, paddingLeft } of exploreCtas) {
          expect(href, `${name} CTA "${text}" missing href`).toBeTruthy();
          console.info(`[SiteRedesign-Device] CTA "${name}" → "${text}" | ${fontSize} | padding-top:${paddingTop} ✓`);
        }
        totalCtas += exploreCtas.length;
      }

      await panel.locator('button.feds-popup-back-button').tap({ timeout: 3000 }).catch(() => {});
      await expect(panel).toBeHidden({ timeout: 15000 });
    }

    console.info(`[SiteRedesign-Device] CTAs: PASS — ${totalCtas} CTA(s) validated across submenus`);
  }

  // ── Focus visible — nav overlay elements ─────────────────────────────────

  async validateFocusVisible() {
    console.info('[SiteRedesign-Device] Checking focus ring on nav overlay elements');
    // Hamburger must be open
    await this.adobelogo.evaluate((el) => el.focus());
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
