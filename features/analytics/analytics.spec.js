import { lingoEnFeatures } from '../lingo-en/lingo.spec.js';
import expressSpec from '../express/lingo.spec.js';

/**
 * Case/URL matrix for analytics validation of the Language Banner, Regional Modal, and Geo
 * Routing Modal (selectors/analytics/analytics.page.js), built around milo PR #6459
 * (https://github.com/adobecom/milo/pull/6459 — restored the modal's Load-event beacon after a
 * regression silently corrupted it).
 *
 * Geo/cookie coverage is NOT re-authored here — `lingoEnFeatures` (features/lingo-en/lingo.spec.js)
 * already has one row per GeoIP/cookie combo, machine-verified against live JSON, for every
 * Banner and Modal case. Re-declaring that matrix here would drift out of sync with it. This
 * file adds the other axis analytics needs: which PAGES/URLs to run that same geo matrix against.
 */

// Named page -> path, same convention/coverage as PAGE_URLS in tests/lingo-en/lingo.test.js.
// 'root' is the only page most rows are machine-verified for; the others are opt-in via PAGES.
export const ANALYTICS_PAGE_PATHS = {
  root: '/',
  creativecloud: '/creativecloud.html',
  acrobat: '/acrobat.html',
  catalog: '/products/catalog.html',
  photoshop: '/products/photoshop.html',
  illustrator: '/products/illustrator.html',
};

export const analyticsBannerFeatures = lingoEnFeatures.filter((f) => f.uiExpectation === 'banner');
export const analyticsModalFeatures = lingoEnFeatures.filter((f) => f.uiExpectation === 'modal');

/**
 * Non-root ACOM BASE sites — everything above (`lingoEnFeatures`) only exercises the US/root
 * base ('/'), which only ever renders the "Regional Modal" shell (#region-modal). These rows put
 * the BASE page itself on a non-US ACOM locale, so the Geo Routing Modal v2 shell
 * (#locale-modal-v2) gets exercised for the first time by this suite too.
 *
 * Each row's `path`+`geoIp`+`cookieValue`+`uiExpectation`+`recommendedRowPrefix` is machine-
 * verified against the live supported-markets.json via `LingoEnBannerPage.computeExpectedUi`
 * (same function/ground truth `lingoEnFeatures` itself is verified against) — confirmed
 * 2026-08-18 against stage's supported-markets.json.
 *
 * Modal-only, on purpose: live-verified (2026-08-18, DE and FR bases) that `computeExpectedUi`'s
 * "Scenario 2 → Banner" prediction does NOT generalize to non-root ACOM bases — georoutingv2.js
 * only ever calls `showModal(...)`, never renders a Banner. `.language-banner` is a SEPARATE,
 * independently-authored block (language-banner.js) that happens to be placed on the US root
 * page; nothing here re-derives when it is/isn't authored on other ACOM locale roots.
 */
export const analyticsBaseSiteModalFeatures = [
  { tcid: 'BS1', name: '@analytics-base-jp-geo-us', description: 'JP base | GeoIP US (no cookie) -> GeoIP not in jp\'s own supportedRegions -> Modal', path: '/jp/', geoIp: 'us', cookieValue: undefined, uiExpectation: 'modal', recommendedRowPrefix: '', tags: '@analytics @base-site @modal' },
  { tcid: 'BS2', name: '@analytics-base-kr-geo-us', description: 'KR base | GeoIP US (no cookie) -> GeoIP not in kr\'s own supportedRegions -> Modal', path: '/kr/', geoIp: 'us', cookieValue: undefined, uiExpectation: 'modal', recommendedRowPrefix: '', tags: '@analytics @base-site @modal' },
  { tcid: 'BS3', name: '@analytics-base-it-geo-us', description: 'IT base | GeoIP US (no cookie) -> GeoIP not in it\'s own supportedRegions -> Modal', path: '/it/', geoIp: 'us', cookieValue: undefined, uiExpectation: 'modal', recommendedRowPrefix: '', tags: '@analytics @base-site @modal' },
  { tcid: 'BS5', name: '@analytics-base-fr-geo-de-cookie-de', description: 'FR base | GeoIP DE | cookie=de -> GeoIP not in fr\'s own supportedRegions -> Modal', path: '/fr/', geoIp: 'de', cookieValue: 'de', uiExpectation: 'modal', recommendedRowPrefix: 'de', tags: '@analytics @base-site @modal' },
  { tcid: 'BS7', name: '@analytics-base-de-geo-fr-cookie-fr', description: 'DE base | GeoIP FR | cookie=fr -> GeoIP not in de\'s own supportedRegions -> Modal', path: '/de/', geoIp: 'fr', cookieValue: 'fr', uiExpectation: 'modal', recommendedRowPrefix: 'fr', tags: '@analytics @base-site @modal' },
  { tcid: 'BS9', name: '@analytics-base-in-geo-jp-cookie-jp', description: 'IN base | GeoIP JP | cookie=jp -> GeoIP not in in\'s own supportedRegions -> Modal', path: '/in/', geoIp: 'jp', cookieValue: 'jp', uiExpectation: 'modal', recommendedRowPrefix: 'jp', tags: '@analytics @base-site @modal' },
];

/**
 * BACOM base sites. Sourced directly from features/express/lingo.spec.js's own
 * machine-verified `bacomFeatures` (module.exports/default-imported as `expressSpec`), not
 * re-authored — `path` already carries its own `akamaiLocale`/query params. `isBacom` picks the
 * right ORIGIN (business[.stage].adobe.com, not www[.stage].adobe.com) — see
 * AnalyticsPage.resolveOriginUrl. BACOM has no Modal counterpart to pair with: per
 * selectors/express/lingo.page.js's computeExpectedUi, `isBacom: true` always renders scenario
 * 4/5 as a Banner, never a Modal.
 *
 * Express itself has NEITHER Banner nor Modal enabled at all (confirmed directly by the site
 * owner) — there is no equivalent `analyticsExpress*Features` export here; don't re-add one
 * without re-confirming that's changed.
 */
function fromExpressRow(f, { isBacom = false } = {}) {
  return { ...f, cookieValue: f.prefLangCookie, isBacom };
}

export const analyticsBacomBannerFeatures = [
  fromExpressRow(expressSpec.bacomFeatures.find((f) => f.name === '@bacom-geo-jp-kr-banner'), { isBacom: true }), // KR base, GeoIP JP, PREF=LU
];
