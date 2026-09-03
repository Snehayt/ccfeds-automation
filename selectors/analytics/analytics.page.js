import { expect, test } from '@playwright/test';
import { AnalyticsInterceptor, getCollectCallCount, getNewCollectCalls } from '../../utils/analytics/analytics.interceptor.js';

/**
 * Analytics validation for the Language Banner, Regional Modal, and Geo Routing Modal —
 * built around milo PR #6459 (https://github.com/adobecom/milo/pull/6459).
 *
 * Context: PR #6168 redirected georoutingv2.js's `sendAnalytics` call to `martech/helpers.js`'s
 * `sendAnalytics`, which expects a plain string, while georoutingv2.js still called it with an
 * `Event` object. That contract mismatch silently corrupted the modal's `Load:...|Geo_Routing_Modal`
 * beacon and suppressed the Mismatch Rate KPI (broken 2026-06-17 onward). #6459 restores a
 * self-contained sender in georoutingv2.js:
 *   window._satellite.track('event', { xdm: {}, data: { web: { webInteraction: { name: event.type } } } })
 *
 * Confirmed live (source, libs/features/georoutingv2/georoutingv2.js):
 *   Load beacon (fired when the modal renders):
 *     `Load:{fromGeo}-{toGeo}|Geo_Routing_Modal|locale:{pagePrefix}|country:{country}|intl:{intl}`
 *   Click beacon (set as the CTA link's `daa-ll` attribute, fires on click):
 *     `{Switch|Continue}:{toGeo}-{fromGeo}|Geo_Routing_Modal|locale:{pagePrefix}|country:{country}|intl:{intl}`
 *
 * The same georoutingv2.js component renders under two different shells depending on the base
 * page — `#region-modal` ("Regional Modal") on a US/root base, `#locale-modal-v2` ("Geo Routing
 * Modal v2") on non-root bases — both driven by the same analytics code, so the same beacon/
 * daa-ll checks below apply to either.
 *
 * Independent of selectors/{cc,express,lingo-en}/lingo.page.js on purpose — those are per-
 * experience UI page objects; this one is reusable analytics-only tooling any of their test
 * files can import alongside their own page object.
 */
export default class AnalyticsPage {
  constructor(page) {
    this.page = page;
    this.interceptor = new AnalyticsInterceptor(page);

    // Language Banner (language-banner.js)
    this.languageBanner = page.locator('.language-banner');
    this.languageBannerLink = page.locator('.language-banner-link');
    this.languageBannerClose = page.locator('.language-banner-close');

    // Regional Modal (root base) / Geo Routing Modal v2 (non-root base) — georoutingv2.js
    this.regionModal = page.locator('#region-modal');
    this.geoModalShellV2 = page.locator('#locale-modal-v2');
    this.geoRoutingModal = page.locator('.georouting-wrapper').first();
    this.geoRoutingModalButton = this.geoRoutingModal
      .locator('a:not([aria-hidden="true"]):not([role="tab"]), button:not([disabled]):not([aria-hidden="true"]):not([role="tab"])')
      .first();
  }

  #warn(label) {
    console.warn(`WARN — ${label}`);
    test.info().annotations.push({ type: 'Warning', description: label });
  }

  /** Installs the network-beacon interceptor. Must be awaited BEFORE page.goto(). */
  async start() {
    await this.interceptor.start();
  }

  stop() {
    this.interceptor.stop();
  }

  // ─── Navigation / cookie / URL helpers — self-contained so this POM has no dependency on
  // any per-experience page object (selectors/{cc,express,lingo-en}/lingo.page.js), and can be
  // driven by any of their test files, or standalone. ─────────────────────────────────────────

  /** Extract `{ prefix }` (ACOM locale prefix) from a page URL — '' means root/US. */
  static parseUrlLocale(url) {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const first = segments[0];
    const looksLikeLocale = first && /^[a-z_]{2,6}$/.test(first) && !AnalyticsPage.NON_LOCALE_SEGMENTS.has(first);
    return { prefix: looksLikeLocale ? first : '' };
  }

  static NON_LOCALE_SEGMENTS = new Set([
    'products', 'solutions', 'creativecloud', 'acrobat', 'express', 'plans', 'pricing',
    'store', 'download', 'help', 'support', 'learn', 'business',
  ]);

  static resolveTestUrl(pagePath, geoIp) {
    const base = process.env.BASE_URL || 'https://www.stage.adobe.com';
    const url = new URL(pagePath, base);
    if (geoIp) url.searchParams.set('akamaiLocale', geoIp);
    return url.toString();
  }

  /**
   * For Express/BACOM rows sourced straight from features/express/lingo.spec.js — their `path`
   * already carries its own `akamaiLocale`/query params, so this only needs to pick the right
   * ORIGIN (BACOM is a different host, business[.stage].adobe.com, not www[.stage].adobe.com).
   */
  static resolveOriginUrl(pagePath, isBacom = false) {
    const acom = process.env.BASE_URL || 'https://www.stage.adobe.com';
    const bacom = process.env.BACOM_BASE_URL || 'https://business.stage.adobe.com';
    return new URL(pagePath, isBacom ? bacom : acom).toString();
  }

  /** Set the `international` cookie (PREF-LANG) before navigation. Call after `context.clearCookies()`. */
  async setInternationalCookieValue(context, cookieValue, pageUrl) {
    console.info(`[Analytics] Setting 'international' cookie: '${cookieValue}'`);
    const hostname = new URL(pageUrl).hostname;
    const domain = hostname.includes('adobe.com') ? '.adobe.com' : hostname;
    await context.addCookies([{
      name: 'international',
      value: String(cookieValue ?? ''),
      domain,
      path: '/',
      secure: true,
      sameSite: 'Lax',
    }]);
  }

  async navigate(url) {
    console.info(`[Analytics] URL: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Resolves the actual `daa-ll`-bearing CTA for the Geo Routing Modal — NOT always
   * `geoRoutingModalButton` itself. `aria-expanded` is NOT the right signal for "needs a click to
   * reveal the real link" — confirmed live it's present (`"false"`) on BOTH shapes: a plain
   * base-site recommendation (`geoRoutingModalButton` already has a real `daa-ll` AND a real
   * `href` directly, e.g. fr/de base: `daa-ll="Switch:de-fr|Geo_Routing_Modal|..."`) and a
   * priority-tiebreak toggle (root ch/cn case: `daa-ll` is null, `href="#"`, and the real
   * navigable link only renders once the dropdown is opened: `Schweiz - Deutsch`,
   * `daa-ll="Switch:ch_de-us|region-modal"`). Whether `daa-ll` is ALREADY present is the real
   * discriminator. Mirrors selectors/lingo-en/lingo.page.js's `clickModalContinue` for the
   * open-dropdown branch — the toggle AND the "Stay" (e.g. "United States") fallback link both
   * use `href="#"`, so filtering those out isolates the real recommendation link.
   */
  async resolveGeoRoutingCta() {
    const daaLl = await this.geoRoutingModalButton.getAttribute('daa-ll').catch(() => null);
    if (daaLl !== null) return this.geoRoutingModalButton;
    await this.geoRoutingModalButton.click();
    const dropdownItem = this.geoRoutingModal.locator('a:not([href="#"])').first();
    await dropdownItem.waitFor({ state: 'visible', timeout: 5000 });
    return dropdownItem;
  }

  /**
   * `#region-modal` (root base) / `#locale-modal-v2` (non-root base) — both wrap the same
   * `.georouting-wrapper` content georoutingv2.js renders. See selectors/lingo-en/lingo.page.js
   * for the confirmed-live shell/base mapping this mirrors.
   */
  async waitForGeoModalReady(pagePrefix = '') {
    await expect(this.geoRoutingModal).toBeVisible({ timeout: 35000 });
    await this.geoRoutingModalButton.waitFor({ state: 'visible', timeout: 20000 });
    const isRootBase = pagePrefix === '';
    const expectedShell = isRootBase ? this.regionModal : this.geoModalShellV2;
    const expectedLabel = isRootBase ? 'Regional Modal (#region-modal)' : 'Geo Routing Modal v2 (#locale-modal-v2)';
    const shellVisible = await expectedShell.isVisible().catch(() => false);
    console.info(`[Analytics] ${expectedLabel} — Expected: visible | Actual: ${shellVisible ? 'visible' : 'NOT visible'}`);
    await expect(expectedShell, `Expected the geo-routing Modal to be the ${expectedLabel}`).toBeVisible({ timeout: 5000 });
  }

  // ─── Pattern builders ──────────────────────────────────────────────────────────────────────
  //
  // Confirmed LIVE (stage, `akamaiLocale=de` + `international=de` cookie on root '/') this
  // differs from the main-branch source read for this POM in two ways: the component tag is the
  // literal `region-modal` (not `Geo_Routing_Modal` as in georoutingv2.js's string literal), and
  // there's a trailing `|pref-lang:{lang}` field not present in the PR #6459 diff — e.g.:
  //   Load:de-us|region-modal|locale:us|country:de|intl:de|pref-lang:de
  // Rather than hard-locking onto that one observed shape (which may itself vary by shell —
  // `#locale-modal-v2` on non-root bases is untested here — or drift again), the tag segment and
  // trailing fields are matched loosely; only the fields that actually matter for catching the
  // #6459 regression (locale/country/intl correctness, and SOME modal-beacon firing at all) are
  // asserted strictly.

  static buildLoadEventPattern({ pagePrefix, geoIp, intl }) {
    const locale = (pagePrefix ?? '').replace('/', '') || 'us';
    const country = geoIp || 'us';
    const intlPart = intl ?? 'none';
    return new RegExp(`^Load:[a-z_]+-[a-z_]+\\|[\\w-]*[Mm]odal\\|locale:${locale}\\|country:${country}\\|intl:${intlPart}(\\|.*)?$`);
  }

  // Confirmed LIVE the CTA's `daa-ll` (set at render time, before click) is a shorter shape than
  // the Load beacon — just `{Switch|Continue}:{fromGeo}-{toGeo}|{tag}`, with NO locale/country/
  // intl suffix (e.g. `Continue:de-us|region-modal`) — unlike georoutingv2.js's
  // decorateForOnLinkClick, which appends `|locale:...|country:...|intl:...` to the string
  // passed into the `click` handler's OWN later analytics call, not to the `daa-ll` attribute
  // itself. `pagePrefix`/`geoIp`/`intl` are accepted for signature symmetry with
  // buildLoadEventPattern but unused — nothing to check them against on this attribute.
  static buildDaaLlPattern() {
    return /^(Switch|Continue):[a-z_]+-[a-z_]+\|[\w-]*[Mm]odal(\|.*)?$/;
  }

  // ─── Assertions ────────────────────────────────────────────────────────────────────────────

  /**
   * Polls captured collect calls (network beacons, real `/collect?...configId=` traffic — see
   * utils/analytics/analytics.interceptor.js) for one matching `pattern`. Longer default timeout
   * than getNewCollectCalls' own 250ms poll — Alloy's own library load + the modal's own render
   * can push the beacon well past that on a cold page load.
   */
  async assertModalLoadEvent(pattern, { timeout = 20000, label = 'Geo Routing Modal Load event' } = {}) {
    const deadline = Date.now() + timeout;
    let calls = [];
    let match;
    do {
      calls = await getNewCollectCalls(this.page, 0);
      match = calls.find((n) => pattern.test(n));
      if (match) break;
      await this.page.waitForTimeout(500);
    } while (Date.now() < deadline);

    // Printed the same plain way the PR's own unit test reports its EXPECTED_LOAD_EVENT —
    // just the matched beacon name itself, not the full captured-calls array.
    if (match) console.info(`[Analytics] ${label}: ${match}`);
    else console.info(`[Analytics] ${label} — NOT FOUND (expected pattern: ${pattern})`);
    expect(
      !!match,
      `Expected a beacon matching ${pattern}, captured: ${JSON.stringify(calls)} (milo#6459 — window._satellite.track received an Event object where martech/helpers.js's sendAnalytics expected a string, corrupting this event name)`,
    ).toBe(true);
  }

  async assertDaaLl(locator, pattern, label) {
    const daaLl = await locator.getAttribute('daa-ll').catch(() => null);
    console.info(`[Analytics] ${label} daa-ll: ${daaLl}`);
    expect(daaLl, `${label} is missing its 'daa-ll' click-tracking attribute`).not.toBeNull();
    expect(pattern.test(daaLl ?? ''), `${label} daa-ll='${daaLl}' does not match expected pattern ${pattern}`).toBe(true);
  }

  /**
   * language-banner.js's own analytics source wasn't confirmed against source the way
   * georoutingv2.js's was above, so this only checks PRESENCE of a daa-ll tracking attribute on
   * the Continue link (soft — logs and warns, doesn't hard-fail), rather than asserting an exact
   * expected string. Tighten to a hard pattern match (like assertDaaLl above) once the banner's
   * real beacon format is confirmed against source.
   */
  async checkBannerDaaLlPresent() {
    const daaLl = await this.languageBannerLink.first().getAttribute('daa-ll').catch(() => null);
    console.info(`[Analytics] Banner Continue link daa-ll — Actual: '${daaLl}'`);
    if (!daaLl) this.#warn('Banner Continue link is missing a daa-ll click-tracking attribute');
    return daaLl;
  }
}
