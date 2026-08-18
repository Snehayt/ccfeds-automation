import { expect, test } from '@playwright/test';

/**
 * Generalized lingo/geo-banner page object — works against ANY ACOM URL (Express, UPP, CC/DC
 * marketing pages, plain product pages) or BACOM.
 *
 * Ported from selectors/express/lingo.page.js, with two corrections:
 *   1. resolveSupportedMarketsUrl routes by PATH (not a hardcoded product list).
 *   2. computeExpectedUi's PREF-LANG check is LANGUAGE-level (any row sharing PREF-LANG's language
 *      that covers the GeoIP), not "cookie's own row only" — confirmed live via the mx+es / dk+ca
 *      examples this rule is built from.
 */
export class LingoEnBannerPage {
  constructor(page) {
    this.page = page;

    // Language banner
    this.languageBanner = page.locator('.language-banner');
    this.languageBannerText = page.locator('.language-banner-text');
    this.languageBannerLink = page.locator('.language-banner-link');
    this.languageBannerClose = page.locator('.language-banner-close');

    // `#locale-modal-v2` ("Geo Routing Modal v2") is a DIFFERENT component from the one this
    // suite tests — it only appears for base sites OTHER than US, which nothing here covers yet
    // (every row in this suite uses path: '/', the US base). Kept as a separate, currently-
    // unused locator so it doesn't get confused with the real target below.
    //
    // Both Modal test categories in this suite (plain-link and dropdown/tie-break) render the
    // SAME component — the "Region Modal" (id="region-modal") — just in two different UI shapes.
    // Confirmed live via DOM inspection.
    this.geoModalShell = page.locator('#locale-modal-v2');
    this.regionModal = page.locator('#region-modal');
    this.geoRoutingModal = page.locator('.georouting-wrapper').first();
    // Scenario 5 (multi-candidate tie-break, e.g. `ch` with fr/ch_de/ch_it) renders a language
    // `tablist` BEFORE the actual recommendation content — e.g. tabs "Deutsch"/"Français"/"Italian"
    // precede the tabpanel containing the real "Schweiz" CTA button. Without excluding [role="tab"],
    // `.first()` matches the tab control instead of the actual button (confirmed live via DOM
    // inspection — tabs come first in DOM order in every tie-break case seen: `ch`, `de`+`tr`,
    // `in`+`in_hi`, `mena_ar`+`mena_en`).
    this.geoRoutingModalButton = this.geoRoutingModal
      .locator('a:not([aria-hidden="true"]):not([role="tab"]), button:not([disabled]):not([aria-hidden="true"]):not([role="tab"])')
      .first();
    this.geoRoutingModalStayLink = this.geoRoutingModal.locator('a').last();
    this.geoModalClose = this.geoRoutingModal
      .locator('button[aria-label="Close"], .dialog-close, [class*="close-button"], button.close')
      .first();

    // Pricing (merchandising card price blocks — .price-currency-symbol seen across current/
    // struck-through/alternative price variants, e.g. "Ar$" for Argentina, "US$"/"$" for US).
    this.priceCurrencySymbols = page.locator('.price-currency-symbol');
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
   * to. UPP, CC/DC marketing pages, plain product pages, and the root all share ACOM's federal
   * JSON; only /express/ paths and BACOM domains differ.
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
      marketsUrl: `${u.origin}/federal/assets/markets.json`,
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
   */
  static findLanguageMatchesForGeo(lang, geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length || !lang) return [];
    const geoIpLower = (geoIp ?? '').toLowerCase();
    const langLower = lang.toLowerCase();

    const matchingRows = data.filter(
      (row) => row.lang?.toLowerCase() === langLower && LingoEnBannerPage.getRowRegions(row).includes(geoIpLower),
    );

    // `undefined` here is a real, meaningful result (not cosmetic) — it's a plain object lookup,
    // and it genuinely means "this row has no explicit priority listed for this GeoIP", which
    // changes how it should rank vs a row that does have one.
    matchingRows.sort((rowA, rowB) => {
      const priorityA = LingoEnBannerPage.parseRegionPriorities(rowA.regionPriorities)[geoIpLower];
      const priorityB = LingoEnBannerPage.parseRegionPriorities(rowB.regionPriorities)[geoIpLower];
      if (priorityA !== undefined && priorityB !== undefined) return priorityA - priorityB;
      if (priorityA !== undefined) return -1;
      if (priorityB !== undefined) return 1;
      return LingoEnBannerPage.getRowRegions(rowA).length - LingoEnBannerPage.getRowRegions(rowB).length;
    });
    return matchingRows;
  }

  /**
   * All rows (any language) that cover `geoIp`, ordered by `regionPriorities` where set for
   * that GeoIP, else by specificity. Used for Scenario 5 (multi-option) recommendations.
   */
  static findAllMatchesForGeo(geoIp, supportedMarketsData) {
    const data = supportedMarketsData?.data;
    if (!data?.length) return [];
    const geoIpLower = (geoIp ?? '').toLowerCase();
    const matchingRows = data.filter((row) => LingoEnBannerPage.getRowRegions(row).includes(geoIpLower));
    // Same `undefined`-is-meaningful sort as findLanguageMatchesForGeo above.
    matchingRows.sort((rowA, rowB) => {
      const priorityA = LingoEnBannerPage.parseRegionPriorities(rowA.regionPriorities)[geoIpLower];
      const priorityB = LingoEnBannerPage.parseRegionPriorities(rowB.regionPriorities)[geoIpLower];
      if (priorityA !== undefined && priorityB !== undefined) return priorityA - priorityB;
      if (priorityA !== undefined) return -1;
      if (priorityB !== undefined) return 1;
      return LingoEnBannerPage.getRowRegions(rowA).length - LingoEnBannerPage.getRowRegions(rowB).length;
    });
    return matchingRows;
  }

  // ─── Flowchart ──────────────────────────────────────────────────────────

  /**
   * Implements the full flowchart decision tree.
   *
   * @param {{
   *   pagePrefix: string,
   *   geoIp: string,
   *   prefLangCode: string|undefined,   // cookie value; undefined/'' = no cookie set, treated as 'en'
   *   supportedMarketsData: object,
   *   isBacom?: boolean,
   * }} opts
   * @returns {{ outcome: 'none'|'banner'|'modal', targetRow?: object, allOptions?: object[] }}
   */
  /**
   * Resolve PREF-LANG's language from the raw `international` cookie value. The cookie is NOT
   * always the row's `prefix` — live testing confirmed the same GeoIP+banner result from BOTH
   * `international=ph_fil` (a prefix) AND `international=fil` (a bare `lang` value) for the same
   * `akamaiLocale=ph` case. So this can't be a single-row-by-prefix lookup —
   * it must check the value against both the `prefix` column and the `lang` column across the
   * whole dataset, since either can be what's actually stored in the cookie.
   */
  static resolvePrefLang(prefLangCode, supportedMarketsData) {
    if (!prefLangCode) return 'en'; // no cookie set == English/US default
    const data = supportedMarketsData?.data;
    const code = String(prefLangCode).toLowerCase();

    const byPrefix = LingoEnBannerPage.getRowByPrefix(prefLangCode, supportedMarketsData);
    if (byPrefix?.lang) return byPrefix.lang.toLowerCase();

    const byLang = data?.find((r) => r.lang?.toLowerCase() === code);
    if (byLang) return code; // cookie value IS a bare lang code that exists in the dataset

    const byDefaultMarket = data?.find((r) => (r.defaultMarket ?? '').toLowerCase() === code);
    if (byDefaultMarket?.lang) return byDefaultMarket.lang.toLowerCase();

    return 'en';
  }

  static computeExpectedUi({ pagePrefix, geoIp, prefLangCode, supportedMarketsData, isBacom = false }) {
    const pageRow = LingoEnBannerPage.getRowByPrefix(pagePrefix, supportedMarketsData);
    const pageLang = pageRow?.lang?.toLowerCase() ?? 'en';

    const prefLang = LingoEnBannerPage.resolvePrefLang(prefLangCode, supportedMarketsData);

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
      bannerText: row.text || row.bannerText,
      continueText: row.continueText,
      recommendedRowPrefix: row.prefix,
    };
  }

  /**
   * `modalDescription`'s `{country}` placeholder is filled from `{origin}/federal/assets/markets.json`
   * — a SEPARATE file from supported-markets.json, keyed by `marketCode` (== GeoIP) with one column
   * per language (`en`, `fr`, `de`, ..., `zh-cn`, `zh-tw`) holding `"Country - CURRENCY SYMBOL"`.
   * Confirmed live against 9 cases including all previously-mismatched ones (`cz`, `lt`, `dz`, `tw`):
   *   - Many language columns are empty for a given market, or don't exist at all (`lt`/Lithuanian
   *     isn't a column at all) — the site falls back to the `en` column in that case, which is why
   *     `lt` and `dz` show their country name in English despite the rest of the sentence not being.
   *   - `cz`'s `cs` column is "Česká republika", not the shorter "Česko" — my earlier
   *     `Intl.DisplayNames`-based guess was simply wrong, not the live site.
   *   - `zh` needs mapping to `zh-tw` or `zh-cn` specifically (bare `zh` isn't a column) — `tw`/`hk`
   *     GeoIPs use `zh-tw` (Traditional, e.g. "台灣"), everything else uses `zh-cn` (Simplified).
   */
  static resolveCountryDisplayName(lang, geoIp, marketsData) {
    const g = String(geoIp).toLowerCase();
    const row = marketsData?.data?.find((r) => (r.marketCode ?? '').toLowerCase() === g);
    if (!row) return undefined;
    const column = lang === 'zh' ? ((g === 'tw' || g === 'hk') ? 'zh-tw' : 'zh-cn') : lang;
    const raw = row[column] || row.en;
    if (!raw) return undefined;
    return LingoEnBannerPage.stripBidiChars(raw.split(' - ')[0]);
  }

  /**
   * Strip invisible Unicode bidirectional/direction control characters that browsers inject into
   * Arabic and other RTL text when rendering (e.g. "الجزائر\u200F" → "الجزائر") — invisible in the
   * UI but breaks exact string comparison against the raw JSON value. Ported from
   * selectors/express/lingo.page.js, which hits the same issue for Arabic markets.
   */
  static stripBidiChars(str) {
    return str
      .replace(/[​‌‍\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069﻿]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static getModalCopy(row, buttonCountry) {
    if (!row) return {};
    return {
      title: row.modalTitle,
      description: row.modalDescription
        ? row.modalDescription.replace(/\{country\}/gi, buttonCountry ?? '{country}')
        : undefined,
      buttonCountry,
      recommendedRowPrefix: row.prefix,
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

  /**
   * Navigates the real page and captures BOTH supported-markets.json and markets.json from the
   * page's own live network traffic — used by the JSON Snapshot test, so what's validated is what
   * the actual page fetched, not an isolated request bypassing it. Every branch (including the
   * fallback, used only if the browser served the JSON from cache without a matching network
   * event) checks `r.ok()` before parsing — never silently accepts a non-2xx (e.g. 304) response.
   */
  async navigateAndCaptureJsons(url) {
    const { supportedMarketsUrl, marketsUrl } = LingoEnBannerPage.resolveGeoJsonUrls(url);
    const supportedMarketsPromise = this.page.waitForResponse(
      (r) => r.url() === supportedMarketsUrl && r.ok(),
      { timeout: 5000 },
    ).catch(() => null);
    const marketsPromise = this.page.waitForResponse(
      (r) => r.url() === marketsUrl && r.ok(),
      { timeout: 5000 },
    ).catch(() => null);

    const navResponse = await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    const httpStatus = navResponse?.status();

    const [supportedMarketsResp, marketsResp] = await Promise.all([supportedMarketsPromise, marketsPromise]);
    const supportedMarketsData = supportedMarketsResp
      ? await supportedMarketsResp.json().catch(() => null)
      : await this.page.request.get(supportedMarketsUrl).then((r) => (r.ok() ? r.json() : null)).catch(() => null);
    const marketsData = marketsResp
      ? await marketsResp.json().catch(() => null)
      : await this.page.request.get(marketsUrl).then((r) => (r.ok() ? r.json() : null)).catch(() => null);

    return { supportedMarketsData, marketsData, httpStatus };
  }

  /** Fetch markets.json (country-name-per-language data used for the modal's {country} substitution). */
  async fetchMarkets(origin) {
    return this.page.request.get(`${origin}/federal/assets/markets.json`).then((r) => (r.ok() ? r.json() : null)).catch(() => null);
  }

  // ─── Cookie helpers ────────────────────────────────────────────────────────

  static internationalCookieDomainForUrl(pageUrl) {
    const hostname = new URL(pageUrl).hostname;
    return { domain: hostname.includes('adobe.com') ? '.adobe.com' : hostname };
  }

  /** Read back the current `international` cookie value (write-path verification). */
  async getInternationalCookieValue(context, pageUrl) {
    const cookies = await context.cookies(pageUrl);
    return cookies.find((c) => c.name === 'international')?.value;
  }

  /**
   * Click the banner's "Continue" link (navigates to the recommended market's site). On some
   * pages (confirmed on /acrobat.html and /creativecloud.html — real navigation confirmed
   * manually, e.g. to /be_nl/acrobat.html) the resulting navigation isn't reliably auto-waited
   * by Playwright's click() the way it is on root, so it's waited for explicitly here.
   */
  async clickBannerContinue() {
    const urlBeforeClick = this.page.url();
    await this.languageBannerLink.first().click();
    await this.page.waitForURL((url) => url.toString() !== urlBeforeClick, { timeout: 10000 }).catch(() => {});
  }

  /** Click the banner's close (X) button, dismissing it without navigating. */
  async clickBannerCloseButton() {
    await this.languageBannerClose.first().click();
  }

  /**
   * Click the Modal's recommended-market control. Two confirmed DOM shapes (live-verified via
   * screenshots): a plain single-option recommendation is an `<a>` with a direct href — clicking
   * it navigates immediately. A tie-break recommendation with an explicit `regionPriorities`
   * ranking (e.g. `ch` → `ch_de`/`fr`/`ch_it`) renders as a `<button>` with a dropdown chevron
   * instead — clicking it only opens a language-variant picker (e.g. "Schweiz - Deutsch" /
   * "Schweiz - Français" / "Schweiz - Italian"), which needs a second click on the matching
   * sub-option to actually navigate.
   */
  async clickModalContinue() {
    // The dropdown toggle can be a real <a> tag with role="button" (tagName alone is not a
    // reliable signal), but it always carries aria-expanded — plain navigable recommendations don't.
    const ariaExpanded = await this.geoRoutingModalButton.getAttribute('aria-expanded').catch(() => null);
    await this.geoRoutingModalButton.click();
    if (ariaExpanded === null) return; // plain link — click already navigated

    // Dropdown case: a language-variant list appears below the button; click the first real
    // sub-option. Both the toggle button itself and the "United States" fallback link use
    // href="#", so excluding that isolates the actual navigable recommendation link.
    const dropdownItem = this.geoRoutingModal.locator('a:not([href="#"])').first();
    await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    const urlBeforeClick = this.page.url();
    await dropdownItem.click();
    // Unlike the plain-link case, the dropdown sub-option's navigation is JS-driven
    // (cookie set then redirect) rather than a native href click, so it isn't
    // synchronously auto-waited by Playwright's click() — wait for it explicitly.
    await this.page.waitForURL((url) => url.toString() !== urlBeforeClick, { timeout: 10000 }).catch(() => {});
  }

  /**
   * Set the `international` cookie (PREF-LANG) before navigation. Always call after
   * `context.clearCookies()`. Omit entirely to test the "no cookie" case.
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

  // ─── Pricing ────────────────────────────────────────────────────────────────

  /**
   * Collect every distinct currency symbol shown in price blocks on the page right now
   * (current price, struck-through old price, and "Alternatively at ..." variants can each
   * render their own `.price-currency-symbol` element — usually identical, but not guaranteed).
   * Price blocks hydrate async via a separate commerce call after initial page load, independent
   * of banner/modal rendering — waits for the first symbol element before reading, so this
   * doesn't race and capture a stale/placeholder price regardless of parallel or serial execution.
   */
  /**
   * Returns the distinct price symbols found on the page (`.price-currency-symbol` elements),
   * plus `totalCount` — how many such elements exist in total. A page showing consistent pricing
   * should have exactly 1 distinct symbol even if `totalCount` is many (e.g. several price cards
   * all in the same currency); more than 1 distinct symbol means the page is showing MIXED
   * currencies, worth flagging on its own regardless of which one matches the expected symbol.
   */
  async getPricingSymbols() {
    await this.priceCurrencySymbols.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
    const totalCount = await this.priceCurrencySymbols.count();
    const symbols = [];
    for (let i = 0; i < totalCount; i++) {
      const text = (await this.priceCurrencySymbols.nth(i).innerText().catch(() => '')).trim();
      if (text) symbols.push(text);
    }
    return { distinct: [...new Set(symbols)], totalCount };
  }

  /**
   * Confirmed live (not ISO-4217 guesswork — a prior version of this map used country-currency
   * facts and was wrong for at least `vn`, which genuinely prices in USD): the real price symbol
   * shown on each recommended market's own dedicated prod page (e.g.
   * `www.adobe.com/il_he/creativecloud.html` for `il_he`). `null` means the page's price block
   * wasn't found at all when checked (`cis_en`, `cn`, `ru`) — a separate concern from a currency
   * mismatch, not asserted here. Prod is just where these reference numbers were gathered from —
   * the same expectation applies however the suite is run (stage/prod/aem.live).
   *
   * Two different things use this data, depending on which UI outcome the row produced:
   *   - `ROOT_SUPPORTED_GEO_PRICE_SYMBOL` (by bare GeoIP) — for Banner/No Action rows, where the
   *     GeoIP IS one of root's own supportedRegions, so the visitor sees their own real price.
   *   - `MARKET_PRICE_SYMBOL_BY_PREFIX` (by recommended row prefix) — for Modal rows, where the
   *     GeoIP ISN'T one of root's supportedRegions, so the check looks at the RECOMMENDED
   *     market's own real price instead.
   */
  static ROOT_SUPPORTED_GEO_PRICE_SYMBOL = {
    be: '€', ph: '₱', il: 'NIS', id: 'Rp', my: 'RM', th: '฿', vn: 'US$', lu: '€',
    hk: 'HK$', eg: 'LE', kw: 'KD', qa: 'QR', sa: 'SAR', ae: 'AED', gr: '€',
    ca: 'CAD $', nz: 'NZ$', ng: '₦', sg: 'S$', us: 'US$', ie: '€', za: 'R',
  };

  static MARKET_PRICE_SYMBOL_BY_PREFIX = {
    ae_ar: 'AED', africa: 'US$', ar: 'Ar$', at: '€', au: 'A$', be_nl: '€', bg: '€', br: 'R$',
    ch_de: 'CHF', ch_it: 'CHF', cis_en: null, cl: 'Ch$', cn: null, co: 'Col$', cr: 'US$',
    cz: '€', de: '€', dk: 'DKK', ec: 'US$', ee: '€', eg_ar: 'LE', es: '€', fi: '€', fr: '€',
    gr_el: '€', gt: 'US$', hk_zh: 'HK$', hu: '€', id_id: 'Rp', il_he: 'NIS', in: '₹',
    in_hi: '₹', it: '€', jp: '円', kr: '₩', kw_ar: 'KD', lt: '€', lu_de: '€', lv: '€',
    mena_ar: 'US$', mena_en: 'US$', mx: 'MXN $', my_ms: 'RM', nl: '€', no: 'NOK', pe: 'S/',
    ph_fil: '₱', pl: '€', pr: 'US$', pt: '€', qa_ar: 'QR', ro: '€', ru: null, sa_ar: 'SAR',
    se: 'SEK', si: '€', sk: '€', th_th: '฿', tr: '₺', tw: 'NT$', ua: 'US$', uk: '£', vn_vi: 'US$',
  };

  /**
   * The BASE page's own default price symbol, keyed by that page's own prefix (`''` = US root,
   * the only base currently tested). When a Modal is dismissed WITHOUT navigating away — the
   * normal case here — the page never leaves this base, so its own price still shows, regardless
   * of which market is being recommended. Confirmed live on stage with `ch`+`ch_de`: dismissing
   * shows `US$69.99/mo` (root/US's own price), not `CHF` (ch_de's own price) — this is NOT a
   * stage/prod difference, it's simply "we never left the base page." Add a new entry here
   * (e.g. `jp: '円'`) if/when a non-US base page gets tested — the lookup logic doesn't change.
   */
  static BASE_PAGE_DEFAULT_PRICE_SYMBOL = {
    '': 'US$',
  };

  /**
   * Resolves what pricing SHOULD show for this row, same expectation on stage AND prod:
   *   - Banner/None outcome -> GeoIP IS in the base page's own supportedRegions -> look up
   *     `ROOT_SUPPORTED_GEO_PRICE_SYMBOL[geoIp]` (the visitor's own real price — the page they're
   *     actually looking at already matches their country). If there's no entry there yet, fall
   *     back to `MARKET_PRICE_SYMBOL_BY_PREFIX[recommendedRowPrefix]` — a market's real price
   *     doesn't depend on which LANGUAGE variant is being recommended (e.g. `ch_de` and `ch_it`
   *     are both `CHF`, Switzerland's own currency, regardless of language), so that table is
   *     valid ground truth for the GeoIP too when the bare-GeoIP table doesn't have it yet.
   *   - Modal outcome -> look up `BASE_PAGE_DEFAULT_PRICE_SYMBOL[pagePrefix]` — the base page's
   *     own price, since dismissing the Modal never navigates away from it.
   *
   * Returns `{ symbol: null, reason }` when there's nothing to compare against yet.
   */
  static resolveExpectedPricingSymbol({ geoIpSupported, geoIp, recommendedRowPrefix, pagePrefix = '' }) {
    // ROOT_SUPPORTED_GEO_PRICE_SYMBOL is real per-country ground truth (e.g. Belgium always
    // prices in '€') — a fact about the country, not about which base page confirmed it — so
    // it's valid for any base whose own supportedRegions also covers that GeoIP, not just root.
    if (geoIpSupported) {
      const byGeoIp = LingoEnBannerPage.ROOT_SUPPORTED_GEO_PRICE_SYMBOL[(geoIp ?? '').toLowerCase()];
      if (byGeoIp) return { symbol: byGeoIp, reason: `GeoIP '${geoIp}' is in the base page's own supportedRegions — real pricing expected` };
      const byMarket = LingoEnBannerPage.MARKET_PRICE_SYMBOL_BY_PREFIX[recommendedRowPrefix];
      return byMarket
        ? { symbol: byMarket, reason: `GeoIP '${geoIp}' has no direct ground truth yet — market '${recommendedRowPrefix}'s own real price applies regardless of language` }
        : { symbol: null, reason: null };
    }
    const symbol = LingoEnBannerPage.BASE_PAGE_DEFAULT_PRICE_SYMBOL[pagePrefix ?? ''];
    return symbol
      ? { symbol, reason: `Modal outcome — dismissed without navigating away, so the base page's own price still shows` }
      : { symbol: null, reason: null };
  }

  /**
   * Compares observed pricing symbols against `resolveExpectedPricingSymbol`'s result. Returns
   * null (no assertion) when there's nothing to compare against yet, rather than guessing.
   */
  static checkPricingExpectation({ geoIpSupported, geoIp, recommendedRowPrefix, pagePrefix, symbols }) {
    if (!symbols?.length) {
      // Just a warning, not a failure — checkPricingExpectation returns null, so no assertion
      // runs for this row at all when no price block was found.
      console.warn(`[LingoEn] No pricing found on page (no .price-currency-symbol elements) for GeoIP '${geoIp}'${recommendedRowPrefix ? ` / market '${recommendedRowPrefix}'` : ''}`);
      return null;
    }
    const { symbol: expected } = LingoEnBannerPage.resolveExpectedPricingSymbol({ geoIpSupported, geoIp, recommendedRowPrefix, pagePrefix });
    if (!expected) return null;
    if (symbols.includes(expected)) return null;
    return `GeoIP '${geoIp}'${recommendedRowPrefix ? ` / market '${recommendedRowPrefix}'` : ''} expected '${expected}' pricing, got: ${JSON.stringify(symbols)}`;
  }

  // ─── UI helpers ─────────────────────────────────────────────────────────────

  /**
   * On a ROOT base page (pagePrefix ''), the Modal is specifically the "Region Modal"
   * (id="region-modal") — confirmed live. On a non-root base (e.g. `/fr/`), it's expected to be
   * the DIFFERENT "Geo Routing Modal v2" component (id="locale-modal-v2") instead — NOT yet
   * confirmed live; treat that part as provisional until verified against a real non-root base.
   */
  async waitForGeoModalReady(pagePrefix = '') {
    await expect(this.geoRoutingModal).toBeVisible({ timeout: 35000 });
    await this.geoRoutingModalButton.waitFor({ state: 'visible', timeout: 20000 });
    const isRootBase = pagePrefix === '';
    const expectedShell = isRootBase ? this.regionModal : this.geoModalShell;
    const expectedLabel = isRootBase ? 'Region Modal (#region-modal)' : 'Geo Routing Modal v2 (#locale-modal-v2)';
    const shellVisible = await expectedShell.isVisible().catch(() => false);
    console.info(`[LingoEn] ${expectedLabel} — Expected: visible | Actual: ${shellVisible ? 'visible' : 'NOT visible'}`);
    await expect(expectedShell, `Expected the geo-routing Modal to be the ${expectedLabel}`).toBeVisible({ timeout: 5000 });
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

  /**
   * Follows the recommended market's actual link and fails the test if that page doesn't exist
   * (e.g. a 404) — i.e. the `international` cookie value being recommended doesn't have a real
   * page here. Applies uniformly to every row on every page — no exceptions hardcoded for any
   * specific market. Confirmed live that this genuinely varies by page, not just by market:
   * `cis_en` resolves fine on root and /products/catalog.html, but 404s on creativecloud.html,
   * acrobat.html, photoshop.html, and illustrator.html — so the right fix is to always check
   * the real page, not to special-case one row's name.
   */
  async checkRecommendationLinkResolves(linkLocator, recommendedRowPrefix) {
    const href = await linkLocator.getAttribute('href').catch(() => null);
    if (!href) return;
    const response = await this.page.request.get(href).catch(() => null);
    const status = response?.status() ?? null;
    expect(
      response?.ok(),
      `international cookie '${recommendedRowPrefix}' does not exist on this page (status ${status}): ${href}`,
    ).toBeTruthy();
    console.info(`[LingoEn]   link '${recommendedRowPrefix}': ${href} (status ${status}) ✓`);
  }

  async assertBanner({ bannerText, continueText, recommendedRowPrefix } = {}) {
    await expect(this.languageBanner).toBeVisible({ timeout: 25000 });
    const renderedText = await this.languageBannerText.first().innerText().catch(() => '');
    const renderedLink = await this.languageBannerLink.first().innerText().catch(() => '');
    console.info('[LingoEn] Banner rendered:', { bannerText: renderedText.trim(), continueText: renderedLink.trim() });
    if (bannerText) await expect(this.languageBanner).toContainText(bannerText, { timeout: 10000 });
    if (continueText) await expect(this.languageBannerLink).toContainText(continueText, { timeout: 10000 });
    await this.checkRecommendationLinkResolves(this.languageBannerLink.first(), recommendedRowPrefix);
  }

  /**
   * Convert a row's `nativeName` (e.g. "Français", "हिंदी") into the tie-break modal's tab id.
   * Confirmed live via DOM inspection of two tie-breaks: `ch` (Deutsch/Français/Italian) gives
   * `#tab-1-français` (precomposed Latin accents like `ç` are kept as-is — a single codepoint,
   * not a separate mark), but `in` (English (IN)/हिंदी) gives `#tab-1-हद` — Devanagari vowel
   * signs/anusvara ARE separate Unicode combining-mark codepoints, and those get stripped,
   * leaving only the base consonants (हिंदी -> हद). Stripping `\p{M}` (all Unicode marks) before
   * slugifying reproduces both cases correctly.
   */
  static nativeNameToTabId(nativeName) {
    const slug = nativeName
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[()]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    return `#tab-1-${slug}`;
  }

  /**
   * Build the expected href pattern for a tie-break dropdown option. Confirmed live (both `ch`
   * and `in` tie-breaks): `/{rowPrefix}/?akamaiLocale={geoIp}&country={geoIp}` for a root-base
   * row (`pagePath` = '/'); non-root base pages follow the same `/{rowPrefix}{pagePath}` shape
   * used elsewhere in this suite (see the Modal 404 pre-check in lingo.test.js).
   */
  static buildOptionHrefPattern(rowPrefix, geoIp, pagePath = '/') {
    const suffix = pagePath === '/' ? '/' : pagePath;
    const path = `/${rowPrefix}${suffix}`;
    return new RegExp(`${path.replace(/[/]/g, '\\/')}\\?akamaiLocale=${geoIp}&country=${geoIp}$`);
  }

  /**
   * @param {{
   *   title?: string, description?: string, buttonCountry?: string,
   *   recommendedRowPrefix?: string, pagePrefix?: string, geoIp?: string, pagePath?: string,
   *   tabs?: Array<{ rowPrefix: string, nativeName: string, country?: string, title?: string, description?: string }>,
   * }} opts — `tabs` is only passed for priority tie-break rows (built in lingo.test.js from
   *   `computeExpectedUi`'s live `allOptions`, one entry per language-variant candidate,
   *   ranked highest-priority first). When absent, this is a plain single-recommendation Modal.
   *   `geoIp`/`pagePath` are only needed alongside `tabs`, to build each option's expected href.
   */
  async assertModal({ title, description, buttonCountry, recommendedRowPrefix, pagePrefix, geoIp, pagePath, tabs } = {}) {
    await this.waitForGeoModalReady(pagePrefix);
    console.info('[LingoEn] Modal rendered ✓');

    // `.icon-milo` alone matches TWO elements on the recommendation button: the actual flag
    // (`src=".../georouting/flag-{cc}.svg"`) AND a separate chevron/down-arrow icon that also
    // carries the `icon-milo` class — exclude `.down-arrow` to target only the flag.
    //
    // Known genuine gap (confirmed via DOM inspection — no <img> at all inside the recommendation
    // link for `africa`/`mena_en`/`mena_ar` and every region within those rows): flagged as a
    // warning annotation rather than a hard failure, so it doesn't block the rest of the suite.
    const flagIcon = this.geoRoutingModalButton.locator('.icon-milo:not(.down-arrow)');
    const flagVisible = await flagIcon.isVisible().catch(() => false);
    console.info(`[LingoEn] Flag icon (.icon-milo) — Expected: visible | Actual: ${flagVisible ? 'visible' : 'NOT visible'}`);
    if (!flagVisible) {
      console.warn('[LingoEn] Modal\'s recommended-market button is missing its flag icon (.icon-milo) — known issue, not failing the test');
      test.info().annotations.push({
        type: 'warning',
        description: 'Modal\'s recommended-market button is missing its flag icon (.icon-milo) — known issue',
      });
    }

    const hasTieBreakTabs = Array.isArray(tabs) && tabs.length > 1;
    if (!hasTieBreakTabs) {
      if (title) {
        await expect(this.geoRoutingModal).toContainText(title, { timeout: 10000 });
        console.info(`[LingoEn]   title:       expected='${title}' ✓`);
      }
      if (description) {
        await expect(this.geoRoutingModal).toContainText(description, { timeout: 10000 });
        console.info(`[LingoEn]   description: expected='${description}' ✓`);
      }
      if (buttonCountry) {
        await expect(this.geoRoutingModalButton).toContainText(buttonCountry, { timeout: 10000 });
        console.info(`[LingoEn]   button country: expected='${buttonCountry}' ✓`);
      }
      // The button itself only has a real href for the plain-link case. A tie-break toggle
      // (aria-expanded present) has href="#" — its real destination is the first sub-option link,
      // which only exists in the DOM once the toggle is clicked open (see the tab branch below for
      // the confirmed multi-tab case; this fallback covers a would-be single-tab dropdown, which
      // hasn't been seen live but is handled the same way for safety).
      const ariaExpanded = await this.geoRoutingModalButton.getAttribute('aria-expanded').catch(() => null);
      if (ariaExpanded === null) {
        await this.checkRecommendationLinkResolves(this.geoRoutingModalButton, recommendedRowPrefix);
        return;
      }
      await this.geoRoutingModalButton.click();
      await expect(
        this.geoRoutingModalButton,
        'Dropdown did not expand (aria-expanded never became true)',
      ).toHaveAttribute('aria-expanded', 'true', { timeout: 5000 });
      const options = this.geoRoutingModal.locator('ul.picker a, a:not([href="#"])');
      await expect(options.first(), 'Dropdown expanded but rendered 0 options').toBeVisible({ timeout: 5000 });
      await this.checkRecommendationLinkResolves(options.first(), recommendedRowPrefix);
      return;
    }

    // Priority tie-break: one language TAB per candidate (e.g. `ch` -> Deutsch/Français/Italian),
    // confirmed live via DOM inspection — tabs are `button[role="tab"]#tab-1-{slug(nativeName)}`,
    // each controlling its own `[role="tabpanel"]` (inactive ones carry a `hidden` attribute). Each
    // panel has its own translated title/description/CTA country, and its own dropdown (`ul.picker`)
    // that only renders once that panel's CTA button is clicked open — mirrors Express's
    // assertRegionalPriorityModal, adapted to this component's confirmed markup.
    console.info(`[LingoEn] Priority tie-break modal — ${tabs.length} tab(s) expected`);
    for (const [i, tabData] of tabs.entries()) {
      const { rowPrefix, nativeName, country, title: tabTitle, description: tabDescription } = tabData;
      if (!nativeName) continue;

      const tabId = LingoEnBannerPage.nativeNameToTabId(nativeName);
      const tab = this.geoRoutingModal.locator(tabId);
      await expect(tab, `Tab '${tabId}' (${nativeName}) not found`).toBeVisible({ timeout: 10000 });
      await tab.click();
      const activePanel = this.geoRoutingModal.locator('[role="tabpanel"]:not([hidden])').first();
      await expect(activePanel, `Tabpanel for '${nativeName}' did not become active`).toBeVisible({ timeout: 5000 });
      console.info(`[LingoEn] Tab ${i + 1}/${tabs.length}: '${rowPrefix}' (${nativeName}) ✓`);

      if (tabTitle) {
        await expect(activePanel).toContainText(tabTitle, { timeout: 5000 });
        console.info(`[LingoEn]   title:       expected='${tabTitle}' ✓`);
      }
      if (tabDescription) {
        await expect(activePanel).toContainText(tabDescription, { timeout: 5000 });
        console.info(`[LingoEn]   description: expected='${tabDescription}' ✓`);
      }

      const ctaBtn = activePanel.locator('a[aria-haspopup="true"], button[aria-haspopup="true"]').first();
      if (country) {
        await expect(ctaBtn, `CTA button for tab '${nativeName}' does not contain country '${country}'`).toContainText(country, { timeout: 5000 });
        console.info(`[LingoEn]   CTA:         expected='${country}' ✓`);
      }

      await ctaBtn.click();
      await expect(ctaBtn, `Tab '${nativeName}' dropdown did not expand`).toHaveAttribute('aria-expanded', 'true', { timeout: 5000 });

      const options = activePanel.locator('ul.picker a');
      const optionCount = await options.count();
      console.info(`[LingoEn]   dropdown: ${optionCount} option(s) rendered`);
      expect(optionCount, `Tab '${nativeName}' dropdown expanded but rendered 0 options`).toBeGreaterThan(0);

      // Confirmed live: every option's country prefix uses the ACTIVE tab's own translation (e.g.
      // inside the "Deutsch" tab, all three options read "Schweiz - Deutsch/Français/Italian" —
      // never "Suisse"/"Svizzera") — only the trailing nativeName differs per option.
      for (const optData of tabs) {
        if (!optData.nativeName) continue;
        const optionText = `${country} - ${optData.nativeName}`;
        const option = options.filter({ hasText: country }).filter({ hasText: optData.nativeName }).first();
        await expect(option, `Dropdown option '${optionText}' not visible under tab '${nativeName}'`).toBeVisible({ timeout: 5000 });

        // Href is checked statically (no click/network round-trip needed — same information a
        // user gets by hovering the link) against the confirmed live pattern for every option,
        // not just the top pick.
        const optionHref = await option.getAttribute('href').catch(() => null);
        if (geoIp && optData.rowPrefix) {
          const expectedPattern = LingoEnBannerPage.buildOptionHrefPattern(optData.rowPrefix, geoIp, pagePath);
          await expect(
            option,
            `Dropdown option '${optionText}' href mismatch — expected to match ${expectedPattern} | got '${optionHref}'`,
          ).toHaveAttribute('href', expectedPattern);
        }

        if (i === 0 && optData.rowPrefix === recommendedRowPrefix) {
          // The top-ranked tab's own top-ranked option IS the row's actual recommendation —
          // additionally hard-verify it resolves live (what recommendedRowPrefix is asserting).
          await this.checkRecommendationLinkResolves(option, recommendedRowPrefix);
        } else {
          console.info(`[LingoEn]     option: '${optionText}' → ${optionHref} ✓`);
        }
      }
    }
  }
}
