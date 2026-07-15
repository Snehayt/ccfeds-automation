import { expect } from '@playwright/test';

/**
 * Generalized lingo/geo-banner page object — works against ANY ACOM URL (Express, UPP, CC/DC
 * marketing pages, plain product pages) or BACOM. See ../../lingo-en-skills.md for the full
 * domain model, the flowchart, and why the PREF-LANG check works the way it does below.
 *
 * Ported from selectors/express/lingo.page.js, with two corrections documented in the skill guide:
 *   1. resolveSupportedMarketsUrl routes by PATH (not a hardcoded product list) — see skills §1.4/§5.2.
 *   2. computeExpectedUi's PREF-LANG check is LANGUAGE-level (any row sharing PREF-LANG's language
 *      that covers the GeoIP), not "cookie's own row only" — see skills §3.2 for the live-confirmed
 *      mx+es / dk+ca examples that this rule is built from.
 */
export class LingoEnBannerPage {
  constructor(page) {
    this.page = page;

    // Language banner
    this.languageBanner = page.locator('.language-banner');
    this.languageBannerText = page.locator('.language-banner-text');
    this.languageBannerLink = page.locator('.language-banner-link');
    this.languageBannerClose = page.locator('.language-banner-close');

    // Geo-routing modal shell (#locale-modal-v2 outer container; optional on some locales)
    this.geoModalShell = page.locator('#locale-modal-v2');
    this.geoRoutingModal = page.locator('.georouting-wrapper').first();
    this.geoRoutingModalButton = this.geoRoutingModal
      .locator('a:not([aria-hidden="true"]), button:not([disabled]):not([aria-hidden="true"])')
      .first();
    this.geoRoutingModalStayLink = this.geoRoutingModal.locator('a').last();
    this.geoModalClose = this.geoRoutingModal
      .locator('button[aria-label="Close"], .dialog-close, [class*="close-button"], button.close')
      .first();
  }

  // ─── URL / path parsing ────────────────────────────────────────────────────

  /**
   * Extract `{ prefix, region, isBacom, path }` from any ACOM or BACOM URL.
   * ACOM prefix comes from the first path segment IF it looks like a locale code
   * (2-6 lowercase/underscore chars); otherwise prefix is '' (root/US, e.g. plain
   * product pages like /products/photoshop.html, /creativecloud.html, /acrobat.html).
   */
  static parseUrlLocale(url) {
    const u = new URL(url);
    const region = u.searchParams.get('akamaiLocale') ?? '';
    const isBacom = /^business(?:\.stage)?\.adobe\.com$/.test(u.hostname);

    const segments = u.pathname.split('/').filter(Boolean);
    const first = segments[0];
    const looksLikeLocale = first && /^[a-z_]{2,6}$/.test(first) && !LingoEnBannerPage.NON_LOCALE_SEGMENTS.has(first);

    const prefix = looksLikeLocale ? first : '';
    return { prefix, region, isBacom, path: u.pathname };
  }

  /** First-path-segment strings that are never locale prefixes on ACOM/BACOM. */
  static NON_LOCALE_SEGMENTS = new Set([
    'products', 'solutions', 'creativecloud', 'acrobat', 'express', 'plans', 'pricing',
    'store', 'download', 'help', 'support', 'learn', 'business',
  ]);

  static isGeoIpDriven(url) {
    try {
      return !new URL(url).searchParams.get('akamaiLocale');
    } catch {
      return false;
    }
  }

  // ─── supported-markets.json resolution — routes by PATH, not by product ──

  /**
   * Which supported-markets.json a page reads depends on its PATH, not the product it belongs
   * to (see skills.md §1.4/§5.2). UPP, CC/DC marketing pages, plain product pages, and the root
   * all share ACOM's federal JSON; only /express/ paths and BACOM domains differ.
   */
  static resolveSupportedMarketsUrl(origin, path, isBacom) {
    if (isBacom) return `${origin}/assets/supported-markets/supported-markets-bacom.json`;
    if (path.startsWith('/express/') || /\/express\//.test(path)) {
      return `${origin}/express/assets/supported-markets/supported-markets-express.json`;
    }
    return `${origin}/federal/assets/supported-markets/supported-markets.json`;
  }

  static resolveGeoJsonUrls(pageUrl) {
    const u = new URL(pageUrl);
    const { path, isBacom } = LingoEnBannerPage.parseUrlLocale(pageUrl);
    return {
      supportedMarketsUrl: LingoEnBannerPage.resolveSupportedMarketsUrl(u.origin, path, isBacom),
    };
  }

  // ─── supported-markets.json field helpers (site-agnostic, pure JSON logic) ─

  static getSupportedRegionsCsvFromRow(row) {
    return row?.supportedRegions ?? row?.supportedMarkets;
  }

  static getRowRegions(row) {
    const csv = LingoEnBannerPage.getSupportedRegionsCsvFromRow(row);
    if (!csv) return [];
    return csv.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  }

  /** Resolve a row by its `prefix` field (`''`/`'us'` = root/US row). */
  static getRowByPrefix(specPrefix, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length) return undefined;
    const s = specPrefix === '' || specPrefix == null ? '' : String(specPrefix).toLowerCase();
    if (s === '' || s === 'us') {
      return data.find((r) => (r.prefix ?? '') === '' && r.lang?.toLowerCase() === 'en');
    }
    return data.find((r) => (r.prefix ?? '').toLowerCase() === s);
  }

  static isSupportedCombo(specPrefix, geoIp, supportedMarketsData) {
    const row = LingoEnBannerPage.getRowByPrefix(specPrefix, supportedMarketsData);
    if (!row) return false;
    return LingoEnBannerPage.getRowRegions(row).includes((geoIp ?? '').toLowerCase());
  }

  static isGeoIpSupported(geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length) return false;
    const g = (geoIp ?? '').toLowerCase();
    return data.some((row) => LingoEnBannerPage.getRowRegions(row).includes(g));
  }

  static parseRegionPriorities(str) {
    if (!str) return {};
    const result = {};
    for (const part of str.split(',')) {
      const idx = part.indexOf(':');
      if (idx === -1) continue;
      const region = part.slice(0, idx).trim().toLowerCase();
      const priority = parseInt(part.slice(idx + 1).trim(), 10);
      if (region && !Number.isNaN(priority)) result[region] = priority;
    }
    return result;
  }

  /**
   * All rows whose `lang` matches `lang` AND whose `supportedRegions` covers `geoIp`,
   * ordered by `regionPriorities` where set, else by specificity (fewest regions first).
   * This is skills.md §3.2/§3.3's corrected language-level match + tie-break rule.
   */
  static findLanguageMatchesForGeo(lang, geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length || !lang) return [];
    const g = (geoIp ?? '').toLowerCase();
    const l = lang.toLowerCase();

    const candidates = data.filter(
      (row) => row.lang?.toLowerCase() === l && LingoEnBannerPage.getRowRegions(row).includes(g),
    );

    candidates.sort((a, b) => {
      const pa = LingoEnBannerPage.parseRegionPriorities(a.regionPriorities)[g];
      const pb = LingoEnBannerPage.parseRegionPriorities(b.regionPriorities)[g];
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      return LingoEnBannerPage.getRowRegions(a).length - LingoEnBannerPage.getRowRegions(b).length;
    });
    return candidates;
  }

  /**
   * All rows (any language) that cover `geoIp`, ordered by `regionPriorities` where set for
   * that GeoIP, else by specificity. Used for Scenario 5 (multi-option) recommendations.
   */
  static findAllMatchesForGeo(geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length) return [];
    const g = (geoIp ?? '').toLowerCase();
    const candidates = data.filter((row) => LingoEnBannerPage.getRowRegions(row).includes(g));
    candidates.sort((a, b) => {
      const pa = LingoEnBannerPage.parseRegionPriorities(a.regionPriorities)[g];
      const pb = LingoEnBannerPage.parseRegionPriorities(b.regionPriorities)[g];
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      return LingoEnBannerPage.getRowRegions(a).length - LingoEnBannerPage.getRowRegions(b).length;
    });
    return candidates;
  }

  // ─── Flowchart (skills.md §1.3, corrected PREF-LANG check per §3.2) ───────

  /**
   * Implements the full flowchart decision tree (skills.md §1.3).
   *
   * @param {{
   *   pagePrefix: string,
   *   geoIp: string,
   *   prefLangCode: string|undefined,   // cookie value; undefined/'' = no cookie set (§3.5: treated as 'en')
   *   supportedMarketsData: object,
   *   isBacom?: boolean,
   * }} opts
   * @returns {{ outcome: 'none'|'banner'|'modal', targetRow?: object, allOptions?: object[] }}
   */
  static computeExpectedUi({ pagePrefix, geoIp, prefLangCode, supportedMarketsData, isBacom = false }) {
    const pageRow = LingoEnBannerPage.getRowByPrefix(pagePrefix, supportedMarketsData);
    const pageLang = pageRow?.lang?.toLowerCase() ?? 'en';

    // §3.5: no cookie set == treated as English/US default — resolved explicitly, not implicitly.
    const cookieRow = prefLangCode
      ? (LingoEnBannerPage.getRowByPrefix(prefLangCode, supportedMarketsData)
        ?? supportedMarketsData?.data?.find((r) => (r.defaultMarket ?? '').toLowerCase() === String(prefLangCode).toLowerCase()))
      : undefined;
    const prefLang = cookieRow?.lang?.toLowerCase() ?? 'en';

    const pagePrefixGeoSupported = LingoEnBannerPage.isSupportedCombo(pagePrefix, geoIp, supportedMarketsData);

    if (pagePrefixGeoSupported) {
      if (prefLang === pageLang) return { outcome: 'none' }; // Scenario 1, 3
      const matches = LingoEnBannerPage.findLanguageMatchesForGeo(prefLang, geoIp, supportedMarketsData);
      if (matches.length) return { outcome: 'banner', targetRow: matches[0] }; // Scenario 2
      return { outcome: 'none' }; // Scenario 1a, 3
    }

    const geoIpSupported = LingoEnBannerPage.isGeoIpSupported(geoIp, supportedMarketsData);
    if (!geoIpSupported) return { outcome: 'none' }; // Scenario 6

    const langMatches = LingoEnBannerPage.findLanguageMatchesForGeo(prefLang, geoIp, supportedMarketsData);
    if (langMatches.length) {
      // Scenario 4 — single recommendation
      return { outcome: isBacom ? 'banner' : 'modal', targetRow: langMatches[0] };
    }
    // Scenario 5 — all valid markets for this GeoIP, ranked
    const allOptions = LingoEnBannerPage.findAllMatchesForGeo(geoIp, supportedMarketsData);
    return { outcome: isBacom ? 'banner' : 'modal', targetRow: allOptions[0], allOptions };
  }

  static getBannerCopy(row) {
    if (!row) return {};
    return {
      bannerText: row.text || row.bannerText || undefined,
      continueText: row.continueText || undefined,
    };
  }

  static getModalCopy(row, buttonCountry) {
    if (!row) return {};
    return {
      title: row.modalTitle || undefined,
      description: row.modalDescription
        ? row.modalDescription.replace(/\{country\}/gi, buttonCountry ?? '{country}')
        : undefined,
    };
  }

  // ─── Navigation + JSON capture ─────────────────────────────────────────────

  async navigateAndCaptureSupportedMarkets(url) {
    const { supportedMarketsUrl } = LingoEnBannerPage.resolveGeoJsonUrls(url);
    const supportedMarketsPromise = this.page.waitForResponse(
      (r) => r.url() === supportedMarketsUrl && r.ok(),
      { timeout: 5000 },
    ).catch(() => null);

    const navResponse = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    const httpStatus = navResponse?.status();

    const resp = await supportedMarketsPromise;
    const supportedMarketsData = resp
      ? await resp.json().catch(() => null)
      : await this.page.request.get(supportedMarketsUrl).then((r) => (r.ok() ? r.json() : null)).catch(() => null);

    return { supportedMarketsData, httpStatus };
  }

  /** Fetch supported-markets.json directly (no navigation) — used by the JSON snapshot test. */
  async fetchSupportedMarkets(origin, path, isBacom) {
    const url = LingoEnBannerPage.resolveSupportedMarketsUrl(origin, path, isBacom);
    return this.page.request.get(url).then((r) => (r.ok() ? r.json() : null)).catch(() => null);
  }

  // ─── Cookie helpers ────────────────────────────────────────────────────────

  static internationalCookieDomainForUrl(pageUrl) {
    const hostname = new URL(pageUrl).hostname;
    return { domain: hostname.includes('adobe.com') ? '.adobe.com' : hostname };
  }

  /**
   * Set the `international` cookie (PREF-LANG) before navigation. Always call after
   * `context.clearCookies()`. Omit entirely to test the "no cookie" case (§3.5).
   */
  async setInternationalCookieValue(context, cookieValue, pageUrl) {
    const { domain } = LingoEnBannerPage.internationalCookieDomainForUrl(pageUrl);
    await context.addCookies([{
      name: 'international',
      value: String(cookieValue ?? ''),
      domain,
      path: '/',
      secure: true,
      sameSite: 'Lax',
    }]);
  }

  // ─── UI helpers ─────────────────────────────────────────────────────────────

  async waitForGeoModalReady() {
    await expect(this.geoRoutingModal).toBeVisible({ timeout: 35000 });
    await this.geoRoutingModalButton.waitFor({ state: 'visible', timeout: 20000 });
  }

  async dismissGeoRoutingModal() {
    const wrapperVisible = await this.geoRoutingModal.isVisible().catch(() => false);
    if (!wrapperVisible) return;
    if (await this.geoModalClose.isVisible().catch(() => false)) {
      await this.geoModalClose.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
  }

  async dismissLanguageBanner() {
    if (!await this.languageBanner.isVisible().catch(() => false)) return;
    if (await this.languageBannerClose.count() > 0) {
      await this.languageBannerClose.click();
      await expect(this.languageBanner).toBeHidden({ timeout: 15000 });
    }
  }

  // ─── UI assertions ──────────────────────────────────────────────────────────

  async assertNone() {
    await this.page.waitForLoadState('load', { timeout: 8000 }).catch(() => {});
    await expect(this.languageBanner).toHaveCount(0);
    await expect(this.page.locator('.georouting-wrapper')).toHaveCount(0);
  }

  async assertBanner({ bannerText, continueText } = {}) {
    await expect(this.languageBanner).toBeVisible({ timeout: 25000 });
    const renderedText = await this.languageBannerText.first().innerText().catch(() => '');
    const renderedLink = await this.languageBannerLink.first().innerText().catch(() => '');
    console.info('[LingoEn] Banner rendered:', { bannerText: renderedText.trim(), continueText: renderedLink.trim() });
    if (bannerText) await expect(this.languageBanner).toContainText(bannerText, { timeout: 10000 });
    if (continueText) await expect(this.languageBannerLink).toContainText(continueText, { timeout: 10000 });
  }

  async assertModal({ title, description } = {}) {
    await this.waitForGeoModalReady();
    const renderedTitle = await this.geoRoutingModal.locator('h1, h2, h3, h4').first().innerText().catch(() => '');
    console.info('[LingoEn] Modal rendered title:', renderedTitle.trim());
    if (title) await expect(this.geoRoutingModal).toContainText(title, { timeout: 10000 });
    if (description) await expect(this.geoRoutingModal).toContainText(description, { timeout: 10000 });
  }
}
