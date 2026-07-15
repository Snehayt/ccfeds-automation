import { expect, test } from '@playwright/test';

// ── GNAV design tokens — single source of truth for typography/spacing checks ──
const FONT = {
  NAV_BOLD:        { fontFamily: 'adobe clean', fontSize: '14px', fontWeight: '700' }, // top nav buttons, Sign In, tabs, CTAs, bold links
  BODY:            { fontFamily: 'adobe clean', fontSize: '14px', fontWeight: '400' }, // plain links, card/use-case subtitles
  CARD_TITLE:      { fontFamily: 'adobe clean', fontSize: '16px', fontWeight: '700' }, // product card titles
  DISPLAY_HEADING: { fontFamily: 'adobe clean', fontSize: '24px', fontWeight: '900' }, // dropdown/use-case/promo headings
  FOOTER_LINK:     { fontFamily: 'adobe clean', fontSize: '16px', fontWeight: '400' }, // footer section links
  FOOTER_HEADING:  { fontFamily: 'adobe clean', fontSize: '16px', fontWeight: '700', padding: '0px 0px 24px' },
  SMALL_BOLD:      { fontFamily: 'adobe clean', fontSize: '12px', fontWeight: '700' }, // region picker, legal links
};
const GAP_STANDARD = '8px';

// FR sub-locales are expected to redirect to /fr/ — shared by navigateTo() and validateLocaleRedirect().
const FR_SUB_LOCALES = new Set(['ca_fr', 'be_fr', 'lu_fr', 'ch_fr']);

export default class SiteRedesignPage {
  constructor(page) {
    this.page = page;

    // ── Infrastructure selectors (global nav — LNav not authored on this page) ─
    this.navWrapper      = page.locator('header.global-navigation');
    this.navList         = page.locator('ul.feds-gnav-items');
    this.allDropdownBtns = page.locator('button.mega-menu.feds-link');
    this.directNavLinks  = page.locator('ul.feds-gnav-items > li > a.feds-link');
    this.adobeLogoLink   = page.locator('.feds-brand-container a').first();
    this.adobeLogoImg    = page.locator('.feds-brand-container .feds-brand img').first();
    this.primaryCta      = page.locator('ul.feds-gnav-items a.feds-primary-cta').filter({ visible: true }).first();
    this.secondaryCta    = page.locator('ul.feds-gnav-items a.feds-secondary-cta').filter({ visible: true }).first();
    this.mobileMenuBtn   = page.locator('button.feds-nav-toggle');
    this.breadcrumbItems = page.locator('ul.feds-breadcrumbs a, .feds-breadcrumbs-wrapper a');
    this.signInBtn       = page.locator('[data-test-id="unav-profile--sign-in"]');
    this.appSwitcherModal        = page.locator('#unav-app-switcher-dialog-id');
    this.appSwitcherAdobeExpress = page.locator('#unav-app-switcher-dialog-id a[aria-label="Adobe Express"]');
    this.appSwitcherAdobeCom     = page.locator('[data-test-id="unav-app-switcher--adobe-dot-com-footer-item"]');
    this.appSwitcherAllApps      = page.locator('[data-test-id="unav-app-switcher--see-all-apps-footer-item"]');

    // ── Redirect tracking (populated by navigateTo) ───────────────────────────
    this.finalUrl         = '';
    this.originalLocale   = null;
    this.redirectedLocale = null;

    // Nav dropdown buttons + Plans link
    this.adobelogo      = page.locator('.feds-brand-container .feds-brand');
    this.products       = page.locator('li:nth-child(1) > button.mega-menu.feds-link');
    this.useCases       = page.locator('li:nth-child(2) > button.mega-menu.feds-link');
    this.solutions      = page.locator('li:nth-child(3) > button.mega-menu.feds-link');
    this.quickActions   = page.locator('li:nth-child(4) > button.mega-menu.feds-link');
    this.learnAndSupport = page.locator('li:nth-child(5) > button.mega-menu.feds-link');
    this.plans          = page.locator('li:last-child > a.feds-link[href*="plans.html"]');
    this.appSwitcher = page.locator('#unav-app-switcher');
    this.signInButton = page.locator('#unav-profile');

    // Products
    this.featuredPro = page.locator('li:nth-of-type(1) > button.tab');
    this.contentCreationPro = page.locator('li:nth-of-type(2) > button.tab');
    this.featuredacrobatAndPdfPro = page.locator('li:nth-of-type(3) > button.tab');
    this.photographyPro = page.locator('li:nth-of-type(4) > button.tab');
    this.videoPro = page.locator('li:nth-of-type(5) > button.tab');
    this.designPro = page.locator('li:nth-of-type(6) > button.tab');
    this.marketingAndCommercePro = page.locator('li:nth-of-type(7) > button.tab');
    this.allProductsPro = page.locator('li:nth-of-type(8) > a.feds-link');

    // Use Cases — index-based (daa-lh values may be localised; nth is locale-safe)
    this.useCasesCards         = page.locator('#use-cases article.featured-card');
    this.contentCreation       = this.useCasesCards.nth(0); // Content Creation
    this.pdfDocumentEssentials = this.useCasesCards.nth(1); // PDF & Document Essentials
    this.creativityDesign      = this.useCasesCards.nth(2); // Creativity & Design
    this.adobeForBusiness      = this.useCasesCards.nth(3); // Adobe for Business
    this.studentsTeachers      = this.useCasesCards.nth(4); // Students & Teachers

    // Solutions (2 list columns + promo card)
    this.solutionsCards  = page.locator('#solutions h2.links-card-title');
    this.organizations   = this.solutionsCards.nth(0);
    this.industries      = this.solutionsCards.nth(1);

    // Quick Actions (4 columns: PDF Tools, Photo Tools, Video Tools, Generative AI)
    this.quickActionsCards = page.locator('#quick-actions h2.links-card-title');
    this.pdfTools          = this.quickActionsCards.nth(0);
    this.photoTools        = this.quickActionsCards.nth(1);
    this.videoTools        = this.quickActionsCards.nth(2);
    this.generativeAi      = this.quickActionsCards.nth(3);

    // Learn & Support (4 columns: Help, Learn, Community, More Resources)
    this.learnAndSupportCards = page.locator('#learn-and-support h2.links-card-title');
    this.help          = this.learnAndSupportCards.nth(0);
    this.learn         = this.learnAndSupportCards.nth(1);
    this.community     = this.learnAndSupportCards.nth(2);
    this.moreResources = this.learnAndSupportCards.nth(3);


    // Footer
    this.footerTitles            = page.locator('.feds-menu-content [role="heading"]');
    this.footer                  = page.locator('footer.global-footer');
    this.footerLogo              = page.locator('.feds-footer-logo');
    this.footerChangeRegion      = page.locator('a.feds-regionPicker');
    // Social icons
    this.footerFacebookIcon      = page.locator('ul.feds-social a[aria-label*="Facebook" i]');
    this.footerInstagramIcon     = page.locator('ul.feds-social a[aria-label*="Instagram" i]');
    this.footerTwitterIcon       = page.locator('ul.feds-social a[aria-label*="Twitter" i], ul.feds-social a[aria-label*="X" i]');
    this.footerLinkedInIcon      = page.locator('ul.feds-social a[aria-label*="LinkedIn" i]');
    // Legal links
    this.footerCookiePreferences = page.locator('a[data-id="open-adchoices-modal"], a[href*="privacy"][href*="cookie"], .feds-footer-privacy-listitem a');
    this.footerPrivacyLink       = page.locator('a[href*="privacy.html"], .feds-footer-privacy-listitem a[href*="privacy"]');
    this.footerLegalCopyright    = page.locator('div.feds-footer-miscLinks-legal');
    this.footerMiscLinksLegal    = page.locator('div.feds-footer-miscLinks-legal');

    // IndividualsAndSmallBusiness
    this.forIndividualsAndSmallBusiness = this.footerTitles.nth(0);
    this.creativeAI = page.locator('.feds-menu-section').nth(0).locator('a').nth(0);
    this.photography = page.locator('.feds-menu-section').nth(0).locator('a').nth(1);
    this.designAndIllustration = page.locator('.feds-menu-section').nth(0).locator('a').nth(2);
    this.videoAndAnimation = page.locator('.feds-menu-section').nth(0).locator('a').nth(3);
    this.pdf = page.locator('.feds-menu-section').nth(0).locator('a').nth(4);
    this.threeD = page.locator('.feds-menu-section').nth(0).locator('a').nth(5);
    this.elementsFamily = page.locator('.feds-menu-section').nth(0).locator('a').nth(6);
    this.stockImagesAndVideo = page.locator('.feds-menu-section').nth(0).locator('a').nth(7);
    this.viewAllProducts = page.locator('.feds-menu-section').nth(0).locator('a').nth(8);



    // For MediumAndLargeBusiness
    this.forMediumAndLargeBusiness = this.footerTitles.nth(1);
    this.personalizationAtScale = page.locator('.feds-menu-section').nth(1).locator('a').nth(0);
    this.contentSupplyChain = page.locator('.feds-menu-section').nth(1).locator('a').nth(1);
    this.unifiedCustomerExperience = page.locator('.feds-menu-section').nth(1).locator('a').nth(2);
    this.creativityAndProduction = page.locator('.feds-menu-section').nth(1).locator('a').nth(3);
    this.b2bGtmOrchestration = page.locator('.feds-menu-section').nth(1).locator('a').nth(4);
    this.viewAllProductsMedium = page.locator('.feds-menu-section').nth(1).locator('a').nth(5);

    // For Organizations
    this.forOrganizations = this.footerTitles.nth(2);
    this.education = page.locator('.feds-menu-section').nth(2).locator('a').nth(0);
    this.nonprofits = page.locator('.feds-menu-section').nth(2).locator('a').nth(1);
    this.government = page.locator('.feds-menu-section').nth(2).locator('a').nth(2);

    //Footer Support
    this.footerSupport = this.footerTitles.nth(3);
    this.helpCenter = page.locator('.feds-menu-section').nth(3).locator('a').nth(0);
    this.downloadAndInstall = page.locator('.feds-menu-section').nth(3).locator('a').nth(1);
    this.adobeCommunity = page.locator('.feds-menu-section').nth(3).locator('a').nth(2);
    this.adobeLearn = page.locator('.feds-menu-section').nth(3).locator('a').nth(3);
    this.mediumAndLargeBusinessSupport = page.locator('.feds-menu-section').nth(3).locator('a').nth(4);

    // Footer Contact
    this.footerContact = this.footerTitles.nth(4);
    this.chatWithSales = page.locator('.feds-menu-section').nth(4).locator('a').nth(0);
    this.requestInformation = page.locator('.feds-menu-section').nth(4).locator('a').nth(1);

    // Footer Adobe
    this.footerAdobe = this.footerTitles.nth(5);
    this.logIntoYourAccount = page.locator('.feds-menu-section').nth(5).locator('a').nth(0);
    this.about = page.locator('.feds-menu-section').nth(5).locator('a').nth(1);
    this.careers = page.locator('.feds-menu-section').nth(5).locator('a').nth(2);
    this.events = page.locator('.feds-menu-section').nth(5).locator('a').nth(3);
    this.newsroom = page.locator('.feds-menu-section').nth(5).locator('a').nth(4);
    this.corporateResponsibility = page.locator('.feds-menu-section').nth(5).locator('a').nth(5);
    this.investorRelations = page.locator('.feds-menu-section').nth(5).locator('a').nth(6);
    this.supplyChain = page.locator('.feds-menu-section').nth(5).locator('a').nth(7);
    this.trustCenter = page.locator('.feds-menu-section').nth(5).locator('a').nth(8);
    this.integrity = page.locator('.feds-menu-section').nth(5).locator('a').nth(9);
    this.adobeForAll = page.locator('.feds-menu-section').nth(5).locator('a').nth(10);
    this.adobeBlog = page.locator('.feds-menu-section').nth(5).locator('a').nth(11);
    this.privacy = page.locator('.feds-menu-section').nth(5).locator('a').nth(12);
    this.termsOfUse = page.locator('.feds-menu-section').nth(5).locator('a').nth(13);
    this.cookiePreferences = page.locator('.feds-menu-section').nth(5).locator('a').nth(14);
  }

  // ── Step helpers ──────────────────────────────────────────────────────────
  #ok(label) {
    console.info(label);
  }

  #warn(label) {
    console.warn(`WARN — ${label}`);
    test.info().annotations.push({ type: 'warning', description: label });
  }

  // Compares computed style (fontFamily/fontSize/fontWeight/padding) against `expected`
  // (typically one of the FONT presets, optionally spread with { padding } or { nonZeroPadding: true }).
  // Mismatches go to `this.#warn` when expected.warn is true, otherwise pushed onto `failures`.
  #checkStyle(failures, label, style, expected) {
    const report = (msg) => (expected.warn ? this.#warn(msg) : failures.push(msg));
    if (expected.fontFamily && !style.fontFamily?.toLowerCase().includes(expected.fontFamily))
      report(`${label} font-family: ${style.fontFamily.split(',')[0]} (expected ${expected.fontFamily})`);
    if (expected.fontSize && style.fontSize !== expected.fontSize)
      report(`${label} font-size: ${style.fontSize} (expected ${expected.fontSize})`);
    if (expected.fontWeight && style.fontWeight !== expected.fontWeight)
      report(`${label} font-weight: ${style.fontWeight} (expected ${expected.fontWeight})`);
    if (expected.padding && style.padding !== expected.padding)
      report(`${label} padding: ${style.padding} (expected ${expected.padding})`);
    if (expected.margin && style.margin !== expected.margin)
      report(`${label} margin: ${style.margin} (expected ${expected.margin})`);
    if (expected.gap) {
      const gap = style.columnGap ?? style.gap;
      if (gap !== expected.gap) report(`${label} gap: ${gap} (expected ${expected.gap})`);
    }
    if (expected.nonZeroPadding) {
      const p = [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
      if (p.some((v) => v === '0px')) report(`${label} has zero padding: ${p.join(' ')}`);
    }
  }

  // True for solid black/near-black backgrounds (e.g. "rgb(0, 0, 0)") — used for CTA/card/selected-tab hover checks.
  // Not for tab hover, which goes to a lighter gray, not black — that's checked separately as "not transparent".
  #isDark(bg) {
    const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return !!m && parseInt(m[1]) < 80 && parseInt(m[2]) < 80 && parseInt(m[3]) < 80;
  }

  #isTransparent(bg) {
    return bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
  }

  // One-line style check for a single element: reads its computed style, then runs #checkStyle against `expected`.
  // Replaces the "evaluate style, then check it" two-step pattern used for one-off elements
  // (Sign In, App Switcher, a dropdown tab, etc.) — loops over multiple elements should keep using evaluateAll + #checkStyle.
  async #assertFont(locator, label, expected, failures) {
    const style = await locator.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
        padding: s.padding, margin: s.margin, gap: s.gap, columnGap: s.columnGap, borderRadius: s.borderRadius,
        paddingTop: s.paddingTop, paddingRight: s.paddingRight, paddingBottom: s.paddingBottom, paddingLeft: s.paddingLeft,
      };
    });
    this.#checkStyle(failures, label, style, expected);
    return style;
  }

  // Returns the active locale code from the current page URL (e.g. "de", "fr", "ca_fr").
  // Uses redirectedLocale if the page redirected, otherwise the URL path segment.
  #getActiveLocale() {
    const localeRe = /^[a-z]{2}(_[a-z]{2,4})?$/i;
    const segs     = new URL(this.page.url()).pathname.split('/').filter(Boolean);
    const fromUrl  = segs[0] && localeRe.test(segs[0]) ? segs[0] : null;
    return this.redirectedLocale || fromUrl;
  }

  // Resolves a raw href (possibly relative) to absolute and asserts it contains
  // the active locale prefix. Warns instead of failing for external/social links.
  #assertLinkLocale(rawHref, label) {
    if (!rawHref || rawHref === '#') return;
    const resolved    = new URL(rawHref, this.page.url()).href;
    const locale      = this.#getActiveLocale();
    if (!locale) return;
    // Skip external non-adobe links (social, third-party)
    if (!resolved.includes('adobe.com')) return;
    if (!resolved.includes(`/${locale}/`)) {
      this.#warn(`"${label}" href="${resolved}" missing locale "/${locale}/" — expected locale-aware link`);
    }
  }

  // ==================================================== C2-SITE-RE-DESIGN ==================================================== //
  async promiseResolver(elementsToCheck) {
    await Promise.all(elementsToCheck.map(async ({ element, conditions }) => {
      const shouldBeVisible = conditions.defaultVisibility ?? true;
      if (shouldBeVisible) {
        await expect(element).toBeVisible({ timeout: 25000 });
        const text = (
          (await element.innerText().catch(() => ''))
          || (await element.getAttribute('aria-label').catch(() => ''))
          || (await element.locator('img').first().getAttribute('alt').catch(() => ''))
          || ''
        ).trim().slice(0, 50);
        console.info(`[Visibility] Visible: "${text || 'element'}" ✓`);
      } else {
        await expect(element).not.toBeVisible({ timeout: 5000 });
        const text = ((await element.textContent().catch(() => '')) || '').trim().slice(0, 50);
        console.info(`[Visibility] Hidden as expected: "${text}" ✓`);
      }
    }));
  }

  async validateGnavElements() {
    await this.promiseResolver([
      { element: this.adobelogo,       conditions: { defaultVisibility: true } },
      { element: this.appSwitcher,     conditions: { defaultVisibility: true } },
      { element: this.signInBtn,       conditions: { defaultVisibility: true } },
      { element: this.products,        conditions: { defaultVisibility: true } },
      { element: this.useCases,        conditions: { defaultVisibility: true } },
      { element: this.solutions,       conditions: { defaultVisibility: true } },
      { element: this.quickActions,    conditions: { defaultVisibility: true } },
      { element: this.learnAndSupport, conditions: { defaultVisibility: true } },
      { element: this.plans,           conditions: { defaultVisibility: true } },
    ]);
    console.info('[GNAV] Visibility — logo, App Switcher, Sign In, 5 nav buttons, Plans link all visible ✓');
  }

  async validateProducts() {
    const productBtn = this.products;
    const panelId     = await productBtn.getAttribute('aria-controls') || 'products';
    await productBtn.click();

    const panel = this.page.locator(`#${panelId}`).first();
    await panel.waitFor({ state: 'visible', timeout: 15000 });

    // Shared with validateDropdown() — Blur/Visibility/Clickability/Typography for headings,
    // links, CTAs. Run here (dropdown already open) instead of via the generic loop, so
    // Products doesn't get opened/closed a second time just for these checks.
    const name = (await productBtn.textContent()).trim();
    await this.#checkDropdownStyles(panel, name);

    // ── Tabs + product cards — Visibility ─────────────────────────────────────
    const elementsToCheck = [
      { element: this.featuredPro, conditions: { defaultVisibility: true } },
      { element: this.contentCreationPro, conditions: { defaultVisibility: true } },
      { element: this.featuredacrobatAndPdfPro, conditions: { defaultVisibility: true } },
      { element: this.photographyPro, conditions: { defaultVisibility: true } },
      { element: this.videoPro, conditions: { defaultVisibility: true } },
      { element: this.designPro, conditions: { defaultVisibility: true } },
      { element: this.marketingAndCommercePro, conditions: { defaultVisibility: true } },
      { element: this.allProductsPro, conditions: { defaultVisibility: true } },
    ];
    await this.promiseResolver(elementsToCheck);

    // ── "All Products" link — Clickability: must point to /products/catalog.html ─────
    const allProductsRawHref = await this.allProductsPro.getAttribute('href');
    const allProductsText    = (await this.allProductsPro.textContent()).trim();
    const allProductsResolved = new URL(allProductsRawHref, this.page.url()).href;
    expect(allProductsRawHref, `"${allProductsText}" must be a link`).toBeTruthy();
    expect(allProductsResolved, `"${allProductsText}" must point to /products/catalog.html`).toContain('/products/catalog.html');
    this.#assertLinkLocale(allProductsRawHref, allProductsText);

    // ── Product cards — Visibility + Clickability (href) ──────────────────────
    const productCards = panel.locator('a[href]').filter({ visible: true });
    const cardData = await productCards.evaluateAll((els) =>
      els.map((el) => ({ href: el.getAttribute('href'), text: (el.textContent || '').trim().slice(0, 40) }))
    );
    expect(cardData.length, 'No product cards found in Featured tab').toBeGreaterThan(0);
    for (const { href, text } of cardData) {
      expect(href, `Product card "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, text);
    }
    console.info(`[${name}] Visibility — 7 tab(s), ${cardData.length} card(s), "All Products" link visible ✓`);
    console.info(`[${name}] Clickability — ${cardData.length} card(s) + "All Products" link have valid href ✓`);

    // ── Card typography (title/subtitle) + 24px padding + 8px grid gap ────────
    const cardStyles = await panel.locator('a.feds-product-card').filter({ visible: true }).evaluateAll((els) => {
      const fontOf = (el) => { const s = getComputedStyle(el); return { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight }; };
      return els.map((el) => {
        const grid = getComputedStyle(el.closest('ul'));
        return {
          text: (el.querySelector('.feds-product-card__title')?.textContent || '').trim().slice(0, 30),
          padding: getComputedStyle(el).padding,
          title: fontOf(el.querySelector('.feds-product-card__title')),
          subtitle: fontOf(el.querySelector('.feds-product-card__subtitle')),
          gap: { row: grid.rowGap, col: grid.columnGap },
        };
      });
    });
    const styleFailures = [];
    for (const { text, padding, title, subtitle, gap } of cardStyles) {
      this.#checkStyle(styleFailures, `Card "${text}"`, { padding }, { padding: '24px' });
      this.#checkStyle(styleFailures, `Card "${text}" title`, title, FONT.CARD_TITLE);
      this.#checkStyle(styleFailures, `Card "${text}" subtitle`, subtitle, FONT.BODY);
      if (gap.row !== GAP_STANDARD || gap.col !== GAP_STANDARD) styleFailures.push(`Card "${text}" grid gap: ${gap.row}/${gap.col} (expected ${GAP_STANDARD})`);
    }

    // ── Tab pill style — pill-shaped (75px radius) ────────────────────────────
    const tabStyle = await this.#assertFont(panel.locator('button.tab').first(), `${name} tab`, { ...FONT.NAV_BOLD, padding: '16px 24px' }, styleFailures);
    if (tabStyle.borderRadius !== '75px') styleFailures.push(`Tab border-radius: ${tabStyle.borderRadius} (expected 75px)`);
    expect(styleFailures, `Product style violations:\n${styleFailures.join('\n')}`).toHaveLength(0);
    console.info(`[${name}] Typography — ${cardStyles.length} card(s) title 16px/700 + subtitle 14px/400 + 24px padding, tabs ${tabStyle.fontSize}/${tabStyle.fontWeight} pill ✓`);

    // ── Tab interaction: click each tab, verify cards update + selected state turns black ──
    const tabs = panel.locator('button.tab');
    const tabCount = await tabs.count();

    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const label = (await tab.textContent()).trim();
      await tab.click();
      await this.page.waitForFunction(
        (panelId) => (document.querySelector(`#${panelId} a[href]`) !== null),
        panelId, { timeout: 5000 }
      ).catch(() => {});

      const bg = await tab.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(this.#isDark(bg), `Tab "${label}" should have dark background when selected, got "${bg}"`).toBe(true);

      const cards = panel.locator('a[href]').filter({ visible: true });
      const cardCount = await cards.count();
      expect(cardCount, `Tab "${label}" — no product cards visible`).toBeGreaterThan(0);
    }
    console.info(`[${name}] Visibility — ${tabCount} tab(s) cycled, each shows visible cards + turns black when selected ✓`);

    // ── Hover checks — desktop only (mobile has no :hover state) ────────────
    const isMobile = await this.page.evaluate(() => /Mobile|iPhone|Android/i.test(navigator.userAgent));
    if (!isMobile) {
      await tabs.first().click(); // re-select Featured
      const secondTab = tabs.nth(1);
      const secondLabel = (await secondTab.textContent()).trim();
      const tabBox = await secondTab.boundingBox();
      if (tabBox) {
        await this.page.mouse.move(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2);
        await this.page.waitForTimeout(75);
        const hoverBg = await secondTab.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        // Tab hover goes to a light gray, NOT black — only the selected tab and cards turn solid black.
        expect(!this.#isTransparent(hoverBg), `Tab "${secondLabel}" should change bg on hover, got "${hoverBg}"`).toBe(true);
      }

      const firstCard = panel.locator('a[href]').filter({ visible: true }).first();
      const cardBox = await firstCard.boundingBox();
      if (cardBox) {
        await this.page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
        await this.page.waitForTimeout(75);
        const cardHoverBg = await firstCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);
        // Cards turn fully black on hover (confirmed on live page) — unlike tabs, which only go light gray.
        expect(this.#isDark(cardHoverBg), `Product card should have dark bg on hover, got "${cardHoverBg}"`).toBe(true);
      }
      console.info(`[${name}] Typography — tab hover → light gray, card hover → solid black ✓`);
    } else {
      console.info(`[${name}] Typography — hover checks SKIP (mobile has no :hover state)`);
    }

    // Reset to Featured tab, then close
    await tabs.first().click();
    await this.products.click();
    await panel.waitFor({ state: 'hidden', timeout: 15000 });
    console.info(`[${name}] PASS — ${cardData.length} card(s), ${tabCount} tab(s) validated`);
  }

  async validateUseCases() {
    const useCasesBtn = this.useCases;
    const panelId     = await useCasesBtn.getAttribute('aria-controls') || 'use-cases';
    await useCasesBtn.click();
    const panel = this.page.locator(`#${panelId}`).first();
    await panel.waitFor({ state: 'visible', timeout: 15000 });

    // Shared with validateDropdown() — backdrop blur, spacing, headings, links, CTAs.
    // Run here (dropdown already open) instead of via the generic loop, so Use Cases
    // doesn't get opened/closed a second time just for these checks.
    const useCasesName = (await useCasesBtn.textContent()).trim();
    await this.#checkDropdownStyles(panel, useCasesName);

    // Validate each card: visibility + eyebrow, heading, description, body link, Explore CTA
    const cards = panel.locator('article.featured-card');
    const cardCount = await cards.count();
    expect(cardCount, 'Use Cases: expected 5 cards').toBe(5);

    // Assert every card and its key child elements are visible (parallel)
    const cardVisibilityChecks = [];
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      cardVisibilityChecks.push(
        { element: card,                                        conditions: { defaultVisibility: true } },
        { element: card.locator('h2').first(),                  conditions: { defaultVisibility: true } },
        { element: card.locator('.featured-subtitle').first(),  conditions: { defaultVisibility: true } },
        { element: card.locator('.footer-container a').first(), conditions: { defaultVisibility: true } },
      );
    }
    await this.promiseResolver(cardVisibilityChecks);

    // Verify data integrity (href, text content) via evaluateAll
    const cardData = await cards.evaluateAll((articles) => articles.map((article) => {
      const eyebrow  = (article.querySelector('.featured-eyebrow')?.getAttribute('aria-label') || '').trim();
      const heading  = (article.querySelector('h2')?.textContent || '').trim();
      const desc     = (article.querySelector('.featured-subtitle')?.textContent || '').trim();
      const bodyLink = article.querySelector('div:not(.footer-container) a[href]');
      const cta      = article.querySelector('.footer-container a[href]');
      return {
        eyebrow,
        heading,
        desc,
        bodyLinkText: (bodyLink?.textContent || '').trim(),
        bodyLinkHref: bodyLink?.getAttribute('href') || '',
        ctaText:      (cta?.textContent || '').trim(),
        ctaHref:      cta?.getAttribute('href') || '',
      };
    }));

    for (const { eyebrow, heading, desc, bodyLinkHref, ctaHref } of cardData) {
      expect(eyebrow,      `Use Cases card missing eyebrow label`).toBeTruthy();
      expect(heading,      `"${eyebrow}" card missing h2 heading`).toBeTruthy();
      expect(desc,         `"${eyebrow}" card missing description`).toBeTruthy();
      expect(bodyLinkHref, `"${eyebrow}" card body link missing href`).toBeTruthy();
      expect(ctaHref,      `"${eyebrow}" Explore CTA missing href`).toBeTruthy();
      this.#assertLinkLocale(bodyLinkHref, `UC "${eyebrow}" body link`);
      this.#assertLinkLocale(ctaHref,      `UC "${eyebrow}" CTA`);
    }
    console.info(`[${useCasesName}] Visibility — ${cardCount} card(s) with eyebrow, heading, description, CTA visible ✓`);
    console.info(`[${useCasesName}] Clickability — ${cardCount} card(s) body link + CTA have valid href ✓`);

    await this.useCases.click();
    await panel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    console.info(`[${useCasesName}] PASS — ${cardCount} card(s) validated`);
  }

  async validateFooterStructure() {
    // ── Landmark ───────────────────────────────────────────────────────────────
    const footerEl = this.page.locator('footer, [role="contentinfo"]').first();
    const footerCount = await footerEl.count();
    expect(footerCount, 'Footer must be a <footer> or role="contentinfo" landmark').toBeGreaterThan(0);

    // ── Section headings — Visibility + Typography (daa-ll not expected: static text) ──
    const headingLocators = this.page.locator('.feds-menu-content [role="heading"]').filter({ visible: true });
    const headingCount    = await headingLocators.count();
    expect(headingCount, 'No footer section headings found').toBeGreaterThan(0);
    const headingVisibilityChecks = Array.from({ length: headingCount }, (_, i) => ({
      element: headingLocators.nth(i), conditions: { defaultVisibility: true },
    }));
    await this.promiseResolver(headingVisibilityChecks);

    const headingData = await headingLocators.evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return { text: (el.textContent || '').trim(), fontSize: s.fontSize, fontWeight: s.fontWeight, fontFamily: s.fontFamily, padding: s.padding };
    }));
    for (const heading of headingData) {
      expect(heading.text, 'Footer heading has empty text').toBeTruthy();
      this.#checkStyle(null, `Footer heading "${heading.text}"`, heading, { ...FONT.FOOTER_HEADING, warn: true });
    }

    // ── Footer links — Visibility + Clickability (href) + Typography (font/margin/daa-ll) ──
    // Excludes the Featured Products icon links (a:has(.feds-navLink-image)) — bold (700), checked separately below.
    const linkEls = this.page.locator('.feds-menu-section a:not(:has(.feds-navLink-image))').filter({ visible: true });
    const linkData = await linkEls.evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return {
        text: (el.textContent || '').trim(),
        href: el.getAttribute('href'),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: s.fontFamily,
        margin: s.margin,
        daaLl: el.getAttribute('daa-ll'),
      };
    }));
    expect(linkData.length, 'No footer links found').toBeGreaterThan(0);

    const fontFailures = [];
    let missingDaaLl = 0;
    for (const link of linkData) {
      expect(link.text, 'Footer link has empty text').toBeTruthy();
      expect(link.href, `Footer link "${link.text}" is missing href`).toBeTruthy();
      this.#checkStyle(fontFailures, `"${link.text}"`, link, { ...FONT.FOOTER_LINK, margin: '0px 8px 8px 0px' });
      if (!link.daaLl) { this.#warn(`Footer link "${link.text}" — missing daa-ll`); missingDaaLl++; }
      this.#assertLinkLocale(link.href, `Footer: ${link.text}`);
    }
    expect(fontFailures, `Footer font violations:\n${fontFailures.join('\n')}`).toHaveLength(0);

    // ── Featured Products icon links — bold (700), unlike regular 400-weight footer links ──
    const iconLink = this.page.locator('.feds-menu-section a:has(.feds-navLink-image)').first();
    await this.#assertFont(iconLink, 'Footer Featured Products icon link', { ...FONT.FOOTER_LINK, fontWeight: '700' }, fontFailures);

    // ── Region picker + legal links — 12px/700. Gaps vary by locale (link count/wrap
    // affects flex gap — e.g. 32px on DE vs 12px on JP), so gap is warn-only, not hard-fail ──
    await this.#assertFont(this.footerChangeRegion, 'Footer region picker', FONT.SMALL_BOLD, fontFailures);
    const legalStyle = await this.#assertFont(this.footerLegalCopyright, 'Footer legal links', FONT.SMALL_BOLD, fontFailures);
    const socialStyle = await this.#assertFont(this.page.locator('ul.feds-social'), 'Footer social icons', { gap: '24px', warn: true }, null);
    expect(fontFailures, `Footer style violations:\n${fontFailures.join('\n')}`).toHaveLength(0);

    // ── First link per section — Clickability sanity check + non-empty section ─
    const sectionLinks = await this.page.locator('.feds-menu-section').evaluateAll((sections) =>
      sections.map((section, i) => {
        const a = section.querySelector('a');
        return {
          index: i + 1,
          text: (a?.textContent || '').trim(),
          href: a?.getAttribute('href') || '',
          linkCount: section.querySelectorAll('a').length,
        };
      })
    );
    for (const { index, text, href, linkCount } of sectionLinks) {
      expect(href, `Footer section ${index} first link "${text}" missing href`).toBeTruthy();
      expect(linkCount, `Footer section ${index} has no links`).toBeGreaterThan(0);
    }

    // ── Bottom bar elements — Visibility ───────────────────────────────────────
    const footerBottomElements = [
      { element: this.footerLogo,           conditions: { defaultVisibility: true } },
      { element: this.footerChangeRegion,   conditions: { defaultVisibility: true } },
      { element: this.footerFacebookIcon,   conditions: { defaultVisibility: true } },
      { element: this.footerInstagramIcon,  conditions: { defaultVisibility: true } },
      { element: this.footerTwitterIcon,    conditions: { defaultVisibility: true } },
      { element: this.footerLinkedInIcon,   conditions: { defaultVisibility: true } },
      { element: this.footerLegalCopyright, conditions: { defaultVisibility: true } },
    ];
    await this.promiseResolver(footerBottomElements);

    // ── One readable summary line per category ─────────────────────────────────
    console.info(`[Footer] Visibility — landmark, ${headingCount} heading(s), ${linkData.length} link(s), logo, region, social all visible ✓`);
    console.info(`[Footer] Clickability — ${linkData.length} link(s) + ${sectionLinks.length} section(s) have valid href, locale-correct (${missingDaaLl} missing daa-ll) ✓`);
    console.info(`[Footer] Typography — headings 16px/700, links 16px/400, icon links 700, region/legal 12px/700, legal gap ${legalStyle.columnGap}, social gap ${socialStyle.columnGap} ✓`);
  }

  // ── Alignment — row-aligned headings, column-aligned links, no overlap ────
  // Locale text length varies a lot (long German/Japanese text) and can break alignment
  // or bleed into the next column even though the DOM/CSS is identical everywhere.
  async validateFooterAlignment() {
    const failures = await this.page.locator('.feds-menu-section').evaluateAll((sections) => {
      const left = (el) => el.getBoundingClientRect().left;
      const top  = (el) => el.getBoundingClientRect().top;
      const issues = [];

      // Checks elements in the same row start at the same top position. The footer wraps
      // into multiple rows (e.g. Featured Products starts a new row far below the first) —
      // a big top gap means a new row, not misalignment.
      const checkRowAligned = (els, label) => {
        let rowTop = top(els[0]);
        els.forEach((el, i) => {
          const t = top(el);
          if (Math.abs(t - rowTop) > 50) rowTop = t;
          else if (Math.abs(t - rowTop) > 1) issues.push(`${label} ${i + 1} not row-aligned`);
        });
      };

      const headings   = sections.map((s) => s.querySelector('[role="heading"]'));
      const firstLinks = sections.map((s) => s.querySelector('a')).filter(Boolean);
      checkRowAligned(headings, 'Column heading');
      // Headings can wrap to different line counts (e.g. long German/Japanese text), so the
      // heading top aligning isn't enough — the first link below it must also start level,
      // confirming the heading's reserved height is consistent across columns.
      checkRowAligned(firstLinks, 'Column first link');

      sections.forEach((section, i) => {
        // Column alignment — heading + links share the same left edge. Skips the Featured
        // Products icon row (icons sit in a horizontal row, not a column, so differing x is expected).
        const isIconRow = !!section.querySelector('a .feds-navLink-image');
        const items = isIconRow ? [] : [headings[i], ...section.querySelectorAll('a')].filter(Boolean);
        const colLeft = items.length ? left(items[0]) : null;
        items.forEach((el, j) => {
          if (Math.abs(left(el) - colLeft) > 1) issues.push(`Column ${i + 1} item ${j + 1} not column-aligned`);
        });

        // Overlap — this column must not visually collide with the next one.
        const next = sections[i + 1];
        if (!next) return;
        const a = section.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        if (Math.abs(a.top - b.top) <= 5 && a.right > b.left) issues.push(`Column ${i + 1} overlaps column ${i + 2}`);
      });

      return issues;
    });

    expect(failures, `Footer alignment violations:\n${failures.join('\n')}`).toHaveLength(0);
    const sectionCount = await this.page.locator('.feds-menu-section').count();
    console.info(`[Footer] Alignment — ${sectionCount} column(s) row-aligned (heading + first link), column-aligned (left edge), no overlap between adjacent columns ✓`);
  }

  // Clicking the footer's region-picker link (a.feds-regionPicker — label is translated per
  // locale, e.g. DE: "Region ändern") opens the #langnav country-selector modal (confirmed on
  // live page: a.feds-regionPicker → #langnav.dialog-modal + .modal-curtain overlay).
  async validateFooterRegionModal() {
    const modal = this.page.locator('#langnav');
    await this.footerChangeRegion.click();
    await expect(modal, 'Region-picker modal did not open').toBeVisible({ timeout: 15000 });

    const closeBtn = modal.locator('button.dialog-close');
    await expect(closeBtn, 'Region-picker modal close button not found').toBeVisible({ timeout: 5000 });
    const linkCount = await modal.locator('a[href]').count();
    expect(linkCount, 'Region-picker modal has no region links').toBeGreaterThan(0);
    console.info(`[Footer] Visibility — region-picker modal opened with ${linkCount} region link(s) ✓`);

    await closeBtn.click();
    await expect(modal, 'Region-picker modal did not close').toBeHidden({ timeout: 15000 });
    console.info('[Footer] Clickability — region-picker modal close button closes it ✓');
  }

  // ── Structural validation methods ─────────────────────────────────────────

  async navigateTo(baseURL, localePath, testPagePath) {
    const url = `${baseURL}${localePath}${testPagePath}`.replace('//', '/').replace(':/', '://');
    console.info(`[Navigate] Navigating to: ${url}`);
    const response    = await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const status      = response?.status() ?? 0;
    this.finalUrl     = this.page.url();
    console.info(`[Navigate] ${url} → HTTP ${status}`);

    // ── Domain redirect check ─────────────────────────────────────────────────
    const originalHost = new URL(url).hostname;
    const finalHost    = new URL(this.finalUrl).hostname;
    if (finalHost !== originalHost) {
      throw new Error(`Page redirected to different domain: ${this.finalUrl}`);
    }

    // ── Locale redirect detection ─────────────────────────────────────────────
    const localeRe  = /^[a-z]{2}(_[a-z]{2,4})?$/i;
    const origSeg   = new URL(url).pathname.split('/').filter(Boolean);
    const finalSeg  = new URL(this.finalUrl).pathname.split('/').filter(Boolean);
    this.originalLocale   = origSeg[0]  && localeRe.test(origSeg[0])  ? origSeg[0]  : null;
    this.redirectedLocale = finalSeg[0] && localeRe.test(finalSeg[0]) && finalSeg[0] !== this.originalLocale
      ? finalSeg[0] : null;

    if (this.redirectedLocale && !FR_SUB_LOCALES.has(this.originalLocale)) {
      this.#warn(`Unexpected locale redirect: /${this.originalLocale}/ → /${this.redirectedLocale}/`);
    }

    // Wait for FEDs nav block to finish initialising
    await this.page.locator('header.global-navigation:not([aria-disabled])').waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
    return { url, status };
  }

  // ── Locale redirect validation (FR sub-locales must redirect to /fr/) ────────
  async validateLocaleRedirect() {
    if (!this.originalLocale || !FR_SUB_LOCALES.has(this.originalLocale)) return;
    if (this.redirectedLocale) {
      console.info(`[Locale Redirect] Locale redirect: /${this.originalLocale}/ → /${this.redirectedLocale}/ ✓`);
    } else {
      throw new Error(`/${this.originalLocale}/ did not redirect to /fr/ — expected FR sub-locale redirect`);
    }
  }

  async validateNavStructure() {
    await expect(this.adobelogo).toBeVisible({ timeout: 30000 });
    // On tablet/mobile viewports the nav list is hidden behind the hamburger — only check on desktop
    const isHamburgerVisible = await this.page.locator('button.feds-nav-toggle').evaluate(
      (el) => { const s = window.getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetWidth > 0; }
    ).catch(() => false);
    if (!isHamburgerVisible) {
      await expect(this.navList).toBeVisible({ timeout: 15000 });
      console.info('[GNAV] Visibility — logo + nav list visible ✓');
    } else {
      console.info('[GNAV] Visibility — logo visible ✓ (nav list SKIP — mobile/tablet hamburger layout)');
    }
  }

  async validateNavScrollBehavior() {
    console.info('[Nav Scroll] Checking nav transparent-at-top → solid-on-scroll behavior');
    const header = this.page.locator('header.global-navigation');

    // ── At top: feds-header-scrolled class must NOT be present ───────────────
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForFunction(
      () => !document.querySelector('header.global-navigation')?.classList.contains('feds-header-scrolled'),
      { timeout: 5000 }
    ).catch(() => {});

    const classAtTop = await header.evaluate((el) => el.className);
    expect(classAtTop, 'Nav at top should not have feds-header-scrolled class').not.toContain('feds-header-scrolled');
    console.info(`[Nav Scroll] Nav at top: no feds-header-scrolled class ✓`);

    // ── After scroll past hero: feds-header-scrolled class must be added ──────
    await this.page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: 'instant' }));
    await this.page.waitForFunction(
      () => document.querySelector('header.global-navigation')?.classList.contains('feds-header-scrolled'),
      { timeout: 5000 }
    ).catch(() => {});

    const classAfterScroll = await header.evaluate((el) => el.className);
    expect(classAfterScroll, 'Nav after scroll should have feds-header-scrolled class (solid pill bg)').toContain('feds-header-scrolled');
    console.info(`[Nav Scroll] Nav after scroll: feds-header-scrolled class present ✓`);

    // ── Sticky: nav must still be pinned to top of viewport ───────────────────
    const navBox = await header.boundingBox();
    expect(navBox, 'Nav must be visible in viewport after scroll (sticky)').toBeTruthy();
    expect(navBox.y, 'Sticky nav top edge must be at or near 0').toBeLessThanOrEqual(10);
    console.info(`[Nav Scroll] Nav sticky: top=${navBox.y}px ✓`);

    // ── Scroll back to top ────────────────────────────────────────────────────
    await this.page.evaluate(() => window.scrollTo(0, 0));
    console.info('[Nav Scroll] PASS — nav transparent at top, solid + sticky after scroll');
  }

  async validateAllNavLinks() {
    const sections = [
      { label: 'Brand',   locator: this.page.locator('.feds-brand-container a') },
      { label: 'Top nav', locator: this.page.locator('ul.feds-gnav-items > li > a') },
    ];
    let total = 0;
    for (const { label, locator } of sections) {
      const linkData = await locator.filter({ visible: true }).evaluateAll((els) =>
        els.map((el) => ({ href: el.getAttribute('href'), text: (el.innerText || '').trim() || '(no text)' }))
      );
      if (linkData.length === 0) continue;
      for (const { href, text } of linkData) {
        if (href !== '#') {
          expect(href, `[${label}] "${text}" is missing href`).toBeTruthy();
          this.#assertLinkLocale(href, `[${label}] ${text}`);
        }
        total++;
      }
    }
    expect(total, 'No nav links found').toBeGreaterThan(0);
    console.info(`[GNAV] Clickability — ${total} nav link(s) (brand + top nav) have valid href, locale-correct ✓`);
  }

  async validateAdobeLogo() {
    await expect(this.adobeLogoLink).toBeVisible({ timeout: 15000 });
    const rawHref  = await this.adobeLogoLink.getAttribute('href');
    const resolved = new URL(rawHref, this.page.url()).href;
    expect(resolved, 'Adobe logo must point to adobe.com').toContain('adobe.com');
    this.#assertLinkLocale(rawHref, 'Adobe logo');
    console.info(`[GNAV] Clickability — logo visible + href="${resolved}" ✓`);
  }

  async validateAppSwitcher() {
    console.info('[App Switcher] Checking app switcher');
    await expect(this.appSwitcher, 'App switcher button not found').toBeVisible({ timeout: 30000 });
    await this.appSwitcher.click();
    await expect(this.appSwitcherModal, 'App switcher dialog not found').toBeVisible({ timeout: 15000 });
    await this.appSwitcherAdobeExpress.waitFor({ state: 'visible', timeout: 25000 });
    await expect(this.appSwitcherAdobeCom).toBeVisible({ timeout: 15000 });
    await expect(this.appSwitcherAllApps).toBeVisible({ timeout: 15000 });
    await this.appSwitcher.click();
    await expect(this.appSwitcherModal).toBeHidden({ timeout: 15000 });
    console.info('[App Switcher] PASS — app switcher opened and closed');
  }

  async validateSignIn() {
    console.info('[Sign In] Checking Sign In button');
    await expect(this.signInBtn, 'Sign In button not found').toBeVisible({ timeout: 15000 });
    console.info('[Sign In] PASS — Sign In button visible');
  }

  async validateRtlDirection(dir) {
    if (dir !== 'rtl') { console.info('[RTL] RTL: SKIP — not an RTL locale'); return; }

    // html[dir]="rtl" is sufficient — all GNAV, footer and page elements inherit RTL from it
    const htmlDir = await this.page.locator('html').getAttribute('dir');
    expect(htmlDir, 'RTL locale must have html[dir]="rtl" — all elements inherit RTL from this').toBe('rtl');
    console.info(`[RTL] RTL: PASS — html[dir]="${htmlDir}" (GNAV + footer inherit RTL automatically)`);
  }

  // Blur/Visibility/Clickability/Typography checks shared by validateDropdown() and the
  // dedicated validateProducts()/validateUseCases() methods — called once per dropdown while
  // its panel is already open, so those two don't need a second open/close cycle.
  // Logs use the dropdown's own on-page name as the tag (e.g. "[Anwendungsszenarien]"), and
  // group every line under one of: Blur, Visibility, Clickability, Typography — consistently
  // for every dropdown, so the same 4 categories are checked for GNAV and Footer too.
  async #checkDropdownStyles(panel, name) {
    // Blur — page content behind the dropdown blurs (blur(32px)) while it's open.
    // .feds-backdrop always exists in the DOM; only its backdrop-filter value changes.
    // The blur animates in via CSS transition — a completed transition settles at exactly
    // the target value (no floating-point drift), so a flaky mismatch means the poll timed
    // out before the transition finished (e.g. under CPU load from parallel workers/locales),
    // not that the value itself is imprecise. Fix: give it more time, keep the exact match.
    const backdropLocator = this.page.locator('.feds-backdrop');
    await expect.poll(
      () => backdropLocator.evaluate((el) => window.getComputedStyle(el).backdropFilter),
      { message: `"${name}" — page backdrop should blur when dropdown is open`, timeout: 8000 }
    ).toBe('blur(32px)');
    console.info(`[${name}] Blur — backdrop blur(32px) ✓`);

    // Typography — spacing: 8px card/column gap, 8px vertical padding on link-list items.
    const spacingMsgs = [];
    const cardsContainer = panel.locator('div.feds-gnav-cards').first();
    if (await cardsContainer.count() > 0) {
      const gapStyle = await this.#assertFont(cardsContainer, `${name} cards`, { gap: GAP_STANDARD, warn: true }, null);
      spacingMsgs.push(`cards gap="${gapStyle.columnGap}"`);
    }
    const firstListItem = panel.locator('.links-card-links li').first();
    if (await firstListItem.count() > 0) {
      const liStyle = await this.#assertFont(firstListItem, `${name} link list item`, { padding: '8px 0px', warn: true }, null);
      spacingMsgs.push(`link list padding="${liStyle.padding}"`);
    }

    // Headings — Visibility (non-empty text) + Typography (24px/900 display style).
    // Products uses tabs+cards (no h2 headings); Solutions/Learn&Support do have headings.
    const headingData = await panel.locator('h2, h3, [role="heading"]').filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { text: (el.textContent || '').trim(), fontSize: s.fontSize, fontWeight: s.fontWeight, fontFamily: s.fontFamily };
      }));
    const headingFailures = [];
    for (const style of headingData) {
      expect(style.text, `"${name}" heading has empty text`).toBeTruthy();
      this.#checkStyle(headingFailures, `${name} heading "${style.text}"`, style, FONT.DISPLAY_HEADING);
    }
    expect(headingFailures, `Heading style violations in "${name}":\n${headingFailures.join('\n')}`).toHaveLength(0);

    // Links — Visibility (rendered) + Clickability (href, locale-correct) + Typography (Adobe Clean).
    const links = panel.locator('a').filter({ visible: true });
    const linkData = await links.evaluateAll((els) =>
      els.map((el, i) => ({
        href: el.getAttribute('href'),
        text: (el.textContent || '').trim() || `link ${i + 1}`,
        fontFamily: window.getComputedStyle(el).fontFamily,
      }))
    );
    expect(linkData.length, `"${name}" panel has no visible links`).toBeGreaterThan(0);
    for (const { href, text, fontFamily } of linkData) {
      expect(href, `"${name}" link "${text}" missing href`).toBeTruthy();
      this.#assertLinkLocale(href, `${name}: ${text}`);
      this.#checkStyle(null, `${name} link "${text}"`, { fontFamily }, { fontFamily: 'adobe clean', warn: true });
    }

    // CTA buttons — Visibility + Clickability (href) + Typography (font/padding) + hover.
    const ctaSelectors = 'a.feds-button, a.feds-primary-cta, a.feds-secondary-cta, a[class*="-cta"]';
    const ctaLinks = panel.locator(ctaSelectors).filter({ visible: true });
    const ctaData = await ctaLinks.evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return {
        text: (el.textContent || '').trim(),
        href: el.getAttribute('href'),
        fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
        paddingTop: s.paddingTop, paddingBottom: s.paddingBottom,
        paddingLeft: s.paddingLeft, paddingRight: s.paddingRight,
      };
    }));
    const ctaFailures = [];
    let hoverMsg = '';
    if (ctaData.length > 0) {
      for (const cta of ctaData) {
        expect(cta.href, `"${name}" CTA "${cta.text}" must have href`).toBeTruthy();
        this.#checkStyle(ctaFailures, `CTA "${cta.text}"`, cta, { ...FONT.NAV_BOLD, nonZeroPadding: true });
      }
      expect(ctaFailures, `CTA violations in "${name}":\n${ctaFailures.join('\n')}`).toHaveLength(0);

      // Hover — CTA background goes from transparent to solid black (confirmed on live page).
      const firstCta = ctaLinks.first();
      const hoverBefore = await firstCta.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      await firstCta.hover();
      await this.page.waitForTimeout(75);
      const hoverAfter = await firstCta.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(this.#isTransparent(hoverBefore), `"${name}" CTA should be transparent before hover, got "${hoverBefore}"`).toBe(true);
      expect(this.#isDark(hoverAfter), `"${name}" CTA should turn solid black on hover, got "${hoverAfter}"`).toBe(true);
      hoverMsg = `, hover ${hoverBefore} → ${hoverAfter} ✓`;
    }

    // ── One readable summary line per category (detail lives in failure messages, not success spam) ──
    console.info(`[${name}] Visibility — ${headingData.length} heading(s), ${linkData.length} link(s), ${ctaData.length} CTA(s) visible ✓`);
    console.info(`[${name}] Clickability — ${linkData.length} link(s) + ${ctaData.length} CTA(s) have valid href, locale-correct ✓`);
    console.info(`[${name}] Typography — headings 24px/900, links Adobe Clean${ctaData.length ? `, CTAs 14px/700 + padding${hoverMsg}` : ''} ✓`);
    if (spacingMsgs.length) console.info(`[${name}] Spacing — ${spacingMsgs.join(', ')} ✓`);

    return { headingCount: headingData.length, linkCount: linkData.length, ctaCount: ctaData.length };
  }

  // Full lifecycle for a generic dropdown: open → #checkDropdownStyles → promo card → close.
  // Products/Use Cases call #checkDropdownStyles directly instead (see those methods) since
  // they already open/close the panel for their own business-logic checks — this avoids
  // opening the same dropdown twice.
  async validateDropdown(ariaControls, name, onPromoCheck = null) {
    const btn   = this.page.locator(`button.mega-menu.feds-link[aria-controls="${ariaControls}"]`);
    const panel = this.page.locator(`#${ariaControls}`).first();

    await btn.waitFor({ state: 'visible', timeout: 15000 });
    await btn.click();
    await expect(panel, `"${name}" panel did not open`).toBeVisible({ timeout: 15000 });

    const { headingCount, linkCount, ctaCount } = await this.#checkDropdownStyles(panel, name);

    // Promo card (optional — Solutions has Acrobat for Business) — same Visibility/Clickability taxonomy.
    const promo = panel.locator('article.promo-card-small');
    const hasPromo = (await promo.count()) > 0;
    if (onPromoCheck) onPromoCheck(hasPromo);
    if (hasPromo) {
      await expect(promo, `"${name}" promo card not visible`).toBeVisible({ timeout: 15000 });
      await expect(promo.locator('picture.promo-card__bg'), `"${name}" promo image not visible`).toBeVisible({ timeout: 15000 });
      await expect(promo.locator('div.promo-card-small__text'), `"${name}" promo text not visible`).toBeVisible({ timeout: 15000 });
      console.info(`[${name}] Visibility — promo card, image, text visible ✓`);
      const promoCta = promo.locator('a').filter({ visible: true }).first();
      if ((await promoCta.count()) > 0) {
        const promoHref = await promoCta.getAttribute('href');
        expect(promoHref, `"${name}" promo CTA must have href`).toBeTruthy();
        console.info(`[${name}] Clickability — promo CTA has valid href ✓`);
      }
    }

    await btn.click();
    await expect(panel, `"${name}" panel did not close`).toBeHidden({ timeout: 15000 });
    await expect.poll(
      () => this.page.locator('.feds-backdrop').evaluate((el) => window.getComputedStyle(el).backdropFilter),
      { message: `"${name}" — page backdrop should stop blurring after close`, timeout: 8000 }
    ).toBe('blur(0px)');
    console.info(`[${name}] Blur — reverted to blur(0px) after close ✓`);

    console.info(`[${name}] PASS — headings: ${headingCount}, links: ${linkCount}, CTAs: ${ctaCount}, promo: ${hasPromo}`);
  }

  async validateNavHeight() {
    console.info('[Nav Height] Checking nav height');
    await expect(this.navList).toBeVisible({ timeout: 15000 });
    const box = await this.navList.boundingBox();
    expect(box, 'nav has no bounding box').not.toBeNull();
    expect(box.height, `nav height is ${box.height}px — expected > 0`).toBeGreaterThan(0);
    console.info(`[Nav Height] PASS — nav height is ${box.height}px`);
    return box.height;
  }

  async validateSkipLink() {
    console.info('[Skip Link] Checking skip link exists in DOM');
    const skipLink = this.page.locator('a[href="#main-content"], a[href="#main"], a[href="#root"]').first();
    await expect(skipLink, 'Skip to main content link must exist in DOM').toBeAttached();
    console.info('[Skip Link] PASS — skip link found');
  }

  async validateLogoAltText() {
    console.info('[Logo Alt Text] Checking Adobe logo alt text');
    await expect(this.adobeLogoImg).toBeAttached();
    const alt = await this.adobeLogoImg.getAttribute('alt');
    expect(alt, 'Adobe logo <img> must have a non-empty alt attribute').toBeTruthy();
    console.info(`[Logo Alt Text] PASS — alt="${alt}"`);
  }

  async validateLangAttribute(localeLang) {
    console.info(`[Lang Attribute] Checking html[lang] matches "${localeLang}"`);
    const lang = await this.page.locator('html').getAttribute('lang');
    expect(lang, 'html must have a lang attribute').toBeTruthy();
    expect(lang.toLowerCase(), `html lang="${lang}" does not match "${localeLang}"`).toContain(localeLang.toLowerCase());
    console.info(`[Lang Attribute] PASS — html lang="${lang}"`);
  }

  async validateNavLandmark() {
    console.info('[Nav Landmark] Checking nav is a landmark region');
    const tagName = await this.navWrapper.evaluate((el) => el.tagName.toLowerCase());
    const role    = await this.navWrapper.getAttribute('role');
    expect(tagName === 'header' || tagName === 'nav' || role === 'navigation', 'Nav must be a landmark element').toBe(true);
    console.info(`[Nav Landmark] PASS — tag="${tagName}", role="${role}"`);
  }

  async validateNavFontStyles() {
    const failures = [];
    const linkData = await this.navWrapper.locator('a.feds-link, button.feds-link')
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => {
        const s = window.getComputedStyle(el);
        return { fontFamily: s.fontFamily, fontSize: s.fontSize, text: (el.innerText || '').trim().slice(0, 40) };
      }));
    expect(linkData.length, 'No visible nav links found for font check').toBeGreaterThan(0);
    for (const style of linkData) {
      this.#checkStyle(failures, `"${style.text}"`, style, { fontFamily: FONT.NAV_BOLD.fontFamily, fontSize: FONT.NAV_BOLD.fontSize });
    }
    expect(failures, `Nav font violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info(`[GNAV] Typography — ${linkData.length} nav link(s) 14px Adobe Clean ✓`);
  }

  // Typography + spacing — top-level nav buttons, Sign In, App Switcher.
  // (excludes the locale/region modal — covered separately)
  async validateGnavElementStyles() {
    const failures = [];

    const navBtnData = await this.allDropdownBtns.filter({ visible: true }).evaluateAll((els) => els.map((el) => {
      const s = window.getComputedStyle(el);
      return { text: (el.textContent || '').trim(), fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight };
    }));
    expect(navBtnData.length, 'No visible top-level nav buttons found').toBeGreaterThan(0);
    for (const btn of navBtnData) {
      this.#checkStyle(failures, `Nav button "${btn.text}"`, btn, FONT.NAV_BOLD);
    }

    await expect(this.signInBtn, 'Sign In button not found').toBeVisible({ timeout: 15000 });
    const signIn = await this.#assertFont(this.signInBtn, 'Sign In', { ...FONT.NAV_BOLD, nonZeroPadding: true }, failures);

    await expect(this.appSwitcher, 'App switcher button not found').toBeVisible({ timeout: 15000 });
    const appSwitcher = await this.#assertFont(this.appSwitcher, 'App Switcher', { nonZeroPadding: true }, failures);

    expect(failures, `GNAV element style violations:\n${failures.join('\n')}`).toHaveLength(0);
    console.info(`[GNAV] Typography — ${navBtnData.length} nav button(s) 14px/700, Sign In padding:${signIn.paddingTop} ${signIn.paddingRight} ${signIn.paddingBottom} ${signIn.paddingLeft}, App Switcher padding:${appSwitcher.paddingTop} ${appSwitcher.paddingRight} ${appSwitcher.paddingBottom} ${appSwitcher.paddingLeft} ✓`);
  }

  async validateFocusVisible() {
    console.info('[Focus Visible] Checking focused nav elements have visible focus ring');
    await this.adobelogo.evaluate((el) => el.focus());
    let passed = 0;
    for (let i = 0; i < 5; i++) {
      await this.page.keyboard.press('Tab');
      const el = await this.page.evaluate(() => {
        const node = document.activeElement;
        if (!node || node === document.body) return null;
        const s = window.getComputedStyle(node);
        return {
          tag: node.tagName,
          label: (node.textContent || node.getAttribute('aria-label') || '').trim().slice(0, 50),
          focusVisible: node.matches(':focus-visible'),
          outline: s.outlineStyle, outlineW: s.outlineWidth, shadow: s.boxShadow,
        };
      });
      if (!el) break;
      const hasRing = el.focusVisible && ((el.outline !== 'none' && el.outlineW !== '0px') || el.shadow !== 'none');
      console.info(`[Focus Visible] Focus: Tab ${i + 1} <${el.tag}> "${el.label}" — :focus-visible=${el.focusVisible}`);
      expect(hasRing, `Tab ${i + 1}: <${el.tag}> "${el.label}" has no visible focus ring`).toBe(true);
      passed++;
    }
    console.info(`[Focus Visible] PASS — ${passed} nav elements verified with visible focus ring`);
  }

  async validateKeyboardNavigation() {
    console.info('[Keyboard Nav] Checking keyboard navigation');
    // aria-disabled on header blocks Playwright focus/click — use evaluate to bypass
    const btn     = this.allDropdownBtns.nth(0);
    const btnText = (await btn.textContent()).trim() || 'dropdown 1';
    const panelId = await btn.getAttribute('aria-controls');
    const panel   = this.page.locator(`#${panelId}`).first();

    await btn.evaluate((el) => { el.focus(); el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); el.click(); });
    await expect(btn, `[${btnText}] Enter must set aria-expanded="true"`).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible({ timeout: 15000 });
    console.info(`[Keyboard Nav] Keyboard: [${btnText}] opened ✓`);

    await btn.evaluate((el) => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    await expect(panel).toBeHidden({ timeout: 15000 });
    console.info(`[Keyboard Nav] Keyboard: [${btnText}] Escape closed ✓`);

    await btn.evaluate((el) => { el.focus(); el.click(); });
    await expect(btn, `[${btnText}] Space/click must set aria-expanded="true"`).toHaveAttribute('aria-expanded', 'true');
    await btn.evaluate((el) => el.click());
    await expect(panel).toBeHidden({ timeout: 15000 });
    console.info('[Keyboard Nav] PASS — Enter/Escape/Toggle verified');
  }

  // ── Analytics — daa-ll attributes + AEP Web SDK collect calls ────────────
  // Follows the same approach as unav.page.js#validateAnalytics: capture collect calls via
  // request interception, click via evaluate() (bypasses aria-disabled), verify open/close via
  // aria-expanded, wait for collect calls to stabilize, then validate each name's format precisely
  // (starts with daa-ll, correct |Close suffix, contains "|gnav|") instead of a loose includes() match.
  async validateAnalyticsDaaLl() {
    console.info('[Header Analytics] Checking daa-ll attributes and collect calls');

    const collectCalls = [];
    const onRequest = (req) => {
      if (!/\/collect(\?|$)/.test(req.url()) || !req.url().includes('configId=')) return;
      try {
        const xdm = JSON.parse(req.postData() || '{}').events?.[0]?.xdm ?? {};
        collectCalls.push(xdm.web?.webInteraction?.name ?? '');
      } catch { collectCalls.push(''); }
    };
    this.page.on('request', onRequest);

    const blockNavigations = async (route) => {
      if (route.request().isNavigationRequest()) await route.fulfill({ status: 204, body: '' });
      else await route.continue();
    };
    await this.page.route('**/*', blockNavigations);
    const onNewPage = (newPage) => { newPage.close().catch(() => {}); };
    this.page.context().on('page', onNewPage);

    const [dropdownInfo, logoDaaLl, directNavInfo, appSwitcherDaaLl] = await Promise.all([
      this.allDropdownBtns.evaluateAll((els) => els.map((el) => ({ daaLl: el.getAttribute('daa-ll'), text: (el.textContent || '').trim() }))),
      this.adobeLogoLink.getAttribute('daa-ll'),
      this.directNavLinks.filter({ visible: true }).evaluateAll((els) => els.map((el) => ({ daaLl: el.getAttribute('daa-ll'), text: (el.textContent || '').trim() }))),
      this.appSwitcher.getAttribute('daa-ll').catch(() => null),
    ]);

    const clicked = [];
    const panelResults = [];
    const clickEl = async (locator, label, daaLl, isClose = false) => {
      await locator.evaluate((el) => el.click()).catch(() => {});
      clicked.push({ label, daaLl, isClose });
    };

    try {
      for (let i = 0; i < dropdownInfo.length; i++) {
        const btn   = this.allDropdownBtns.nth(i);
        const label = dropdownInfo[i].text || `dropdown ${i + 1}`;

        await clickEl(btn, `${label} — open`, dropdownInfo[i].daaLl, false);
        const opened = await expect(btn).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
          .then(() => true).catch(() => false);
        panelResults.push({ label, opened, closed: null });

        if (opened) {
          await clickEl(btn, `${label} — close`, dropdownInfo[i].daaLl, true);
          const closed = await expect(btn).toHaveAttribute('aria-expanded', 'false', { timeout: 1000 })
            .then(() => true).catch(() => false);
          panelResults[panelResults.length - 1].closed = closed;
        }
      }
      await clickEl(this.adobeLogoLink, 'Adobe Logo', logoDaaLl);
      for (let i = 0; i < directNavInfo.length; i++) {
        await clickEl(this.directNavLinks.filter({ visible: true }).nth(i), directNavInfo[i].text || `nav-link-${i}`, directNavInfo[i].daaLl);
      }
      await clickEl(this.appSwitcher, 'App switcher', appSwitcherDaaLl);

      await expect(this.signInBtn, 'Sign In button must be visible').toBeVisible({ timeout: 15000 });
      const signInDaaLl = await this.signInBtn.getAttribute('daa-ll').catch(() => null);
      if (signInDaaLl) console.info(`[Header Analytics] "Sign In" daa-ll="${signInDaaLl}" ✓ (click skipped — navigates to IMS)`);
      else this.#warn('Analytics: "Sign In" missing daa-ll');

      await this.page.keyboard.press('Escape').catch(() => {});

      // Wait for collect calls to stabilize (no new calls for 400ms) instead of a fixed delay.
      let lastCount = collectCalls.length;
      let stableMs  = 0;
      const deadline = Date.now() + 1500;
      while (Date.now() < deadline) {
        await this.page.waitForTimeout(100);
        const current = collectCalls.length;
        if (current === lastCount) {
          stableMs += 100;
          if (stableMs >= 400) break;
        } else {
          stableMs = 0;
          lastCount = current;
        }
      }
    } finally {
      await this.page.unroute('**/*', blockNavigations);
      this.page.off('request', onRequest);
      this.page.context().off('page', onNewPage);
    }

    for (const { label, opened, closed } of panelResults) {
      if (!opened) this.#warn(`Header Analytics: "${label}" ✗ did not open`);
      else if (closed === false) this.#warn(`Header Analytics: "${label}" ✓ opened  ✗ did not close`);
      else console.info(`[Header Analytics] "${label}" ✓ opened  ✓ closed`);
    }

    // ── Match + validate each daa-ll against the captured collect-call names ──
    // Site-redesign's dropdown buttons share the SAME daa-ll (e.g. "header|Open") — only daa-lh
    // distinguishes them — so matches are consumed (usedIndices) to stop every dropdown from
    // matching the first collect call. Calls are expected to arrive in the same order as clicks.
    const usedIndices = new Set();
    const findCallIndex = (names, daaLl, isClose) => {
      const available = (i) => !usedIndices.has(i);
      if (!isClose) return names.findIndex((n, i) => available(i) && n.startsWith(daaLl) && !n.endsWith('|Close'));
      const standardIdx = names.findIndex((n, i) => available(i) && n.startsWith(daaLl) && n.endsWith('|Close'));
      if (standardIdx !== -1) return standardIdx;
      const closePrefix = daaLl.replace(/\bOpen\b/, 'Close');
      return closePrefix !== daaLl
        ? names.findIndex((n, i) => available(i) && n.startsWith(closePrefix) && n.includes('|gnav|'))
        : -1;
    };
    const validateName = (name, daaLl, isClose) => {
      const issues = [];
      if (!name.includes('|gnav|')) issues.push('name missing "|gnav|" segment');
      if (isClose) {
        const isStdClose      = name.startsWith(daaLl) && name.endsWith('|Close');
        const isHomepageClose = name.startsWith(daaLl.replace(/\bOpen\b/, 'Close'));
        if (!isStdClose && !isHomepageClose) issues.push(`close event name format unrecognised — got "${name}"`);
      } else {
        if (!name.startsWith(daaLl)) issues.push(`name does not start with daa-ll "${daaLl}"`);
        if (name.endsWith('|Close')) issues.push('open/click event should not end with "|Close"');
      }
      return issues;
    };

    let missingDaaLl = 0, noCall = 0, nameIssueCount = 0;
    for (const { label, daaLl, isClose } of clicked) {
      if (!daaLl) { this.#warn(`Header Analytics: "${label}" missing daa-ll`); missingDaaLl++; continue; }
      const idx = findCallIndex(collectCalls, daaLl, isClose);
      if (idx === -1) { this.#warn(`Header Analytics: "${label}" daa-ll="${daaLl}" — no matching collect call found`); noCall++; continue; }
      usedIndices.add(idx);
      const call = collectCalls[idx];
      const issues = validateName(call, daaLl, isClose);
      if (issues.length > 0) {
        for (const issue of issues) this.#warn(`Header Analytics: "${label}" — ${issue}`);
        nameIssueCount++;
      } else {
        console.info(`[Header Analytics] "${label}" ✓ name="${call}"`);
      }
    }

    const total  = clicked.length;
    const passed = total - missingDaaLl - noCall - nameIssueCount;
    console.info(`[Header Analytics] summary: ${passed}/${total} passed ✓ (${missingDaaLl} missing daa-ll, ${noCall} no call, ${nameIssueCount} name issues)`);
  }

  // Sampled footer analytics — first link of each footer section + region picker, instead of
  // all ~39 footer links, to keep runtime and flakiness risk down while still verifying real
  // click → collect-call wiring (not just daa-ll presence, which validateFooterStructure already checks).
  // Footer daa-ll values are simple labels (e.g. "Kreative KI-1"), not the header's
  // "header|Open|gnav|..." format, so matching here is a plain substring check, not validateName().
  async validateFooterAnalytics() {
    console.info('[Footer Analytics] Checking sampled footer link daa-ll + collect calls');

    const collectCalls = [];
    const onRequest = (req) => {
      if (!/\/collect(\?|$)/.test(req.url()) || !req.url().includes('configId=')) return;
      try {
        const xdm = JSON.parse(req.postData() || '{}').events?.[0]?.xdm ?? {};
        collectCalls.push(xdm.web?.webInteraction?.name ?? '');
      } catch { collectCalls.push(''); }
    };
    this.page.on('request', onRequest);

    const blockNavigations = async (route) => {
      if (route.request().isNavigationRequest()) await route.fulfill({ status: 204, body: '' });
      else await route.continue();
    };
    await this.page.route('**/*', blockNavigations);
    const onNewPage = (newPage) => { newPage.close().catch(() => {}); };
    this.page.context().on('page', onNewPage);

    const sections = this.page.locator('.feds-menu-section');
    const sectionCount = await sections.count();
    const sectionLinkInfo = await sections.evaluateAll((els) => els.map((el) => {
      const a = el.querySelector('a');
      return { daaLl: a?.getAttribute('daa-ll') || null, text: (a?.textContent || '').trim() };
    }));
    const regionDaaLl = await this.footerChangeRegion.getAttribute('daa-ll').catch(() => null);

    const clicked = [];
    try {
      for (let i = 0; i < sectionCount; i++) {
        const link = sections.nth(i).locator('a').first();
        await link.evaluate((el) => el.click()).catch(() => {});
        clicked.push({ label: sectionLinkInfo[i].text || `section ${i + 1} link`, daaLl: sectionLinkInfo[i].daaLl });
      }
      await this.footerChangeRegion.evaluate((el) => el.click()).catch(() => {});
      clicked.push({ label: 'Footer region picker', daaLl: regionDaaLl });

      // Wait for collect calls to stabilize (no new calls for 400ms) instead of a fixed delay.
      let lastCount = collectCalls.length;
      let stableMs  = 0;
      const deadline = Date.now() + 1500;
      while (Date.now() < deadline) {
        await this.page.waitForTimeout(100);
        const current = collectCalls.length;
        if (current === lastCount) {
          stableMs += 100;
          if (stableMs >= 400) break;
        } else {
          stableMs = 0;
          lastCount = current;
        }
      }
    } finally {
      await this.page.unroute('**/*', blockNavigations);
      this.page.off('request', onRequest);
      this.page.context().off('page', onNewPage);
    }

    let missingDaaLl = 0, noCall = 0;
    for (const { label, daaLl } of clicked) {
      if (!daaLl) { this.#warn(`Footer Analytics: "${label}" missing daa-ll`); missingDaaLl++; continue; }
      const match = collectCalls.find((n) => n.includes(daaLl));
      if (!match) { this.#warn(`Footer Analytics: "${label}" daa-ll="${daaLl}" — no matching collect call found`); noCall++; continue; }
      console.info(`[Footer Analytics] "${label}" ✓ name="${match}"`);
    }

    const total  = clicked.length;
    const passed = total - missingDaaLl - noCall;
    console.info(`[Footer Analytics] summary: ${passed}/${total} passed ✓ (${missingDaaLl} missing daa-ll, ${noCall} no call)`);
  }
}