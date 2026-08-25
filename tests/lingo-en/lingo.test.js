import { test, expect } from '@playwright/test';
import { LingoEnBannerPage } from '../../selectors/lingo-en/lingo.page.js';
import {
  jsonSnapshotFeature,
  lingoEnFeatures,
  lingoEnRootRedirectFeatures,
  lingoEnPricingPriorityFeatures,
} from '../../features/lingo-en/lingo.spec.js';
import fs from 'fs';
import path from 'path';

/**
 * Generalized lingo/geo-banner test runner.
 *
 * Structure:
 *   1. JSON Snapshot group — runs first, fails loudly on any supported-markets.json/markets.json field change.
 *   2. No Action / Banner / Modal groups — driven by features/lingo-en/lingo.spec.js's generated matrix.
 *   3. Root Redirects / Pricing Priority Chain groups — page-independent, always root-anchored.
 */

const SNAPSHOT_DIR = path.resolve(process.cwd(), 'tests/lingo-en/snapshots');

// Identifies a row by its actual data (marketCode for markets.json, prefix+lang for
// supported-markets.json) rather than array position, so a reordered row is reported as one
// clean entry instead of cascading "changed" rows for every entry after it.
function rowKey(row, index) {
  if (row?.marketCode !== undefined) return `marketCode:${row.marketCode}`;
  if (row?.prefix !== undefined || row?.lang !== undefined) return `prefix:${row.prefix ?? ''}|lang:${row.lang ?? ''}`;
  return `index:${index}`;
}

function findJsonChanges(liveArr = [], snapArr = []) {
  const changes = [];
  const snapByKey = new Map(snapArr.map((row, i) => [rowKey(row, i), row]));
  const liveByKey = new Map(liveArr.map((row, i) => [rowKey(row, i), row]));

  for (const [key, liveRow] of liveByKey) {
    if (!snapByKey.has(key)) changes.push(`  ADDED row [${key}]: ${JSON.stringify(liveRow)}`);
  }
  for (const [key, snapRow] of snapByKey) {
    if (!liveByKey.has(key)) changes.push(`  REMOVED row [${key}]: ${JSON.stringify(snapRow)}`);
  }
  for (const [key, snapRow] of snapByKey) {
    const liveRow = liveByKey.get(key);
    if (!liveRow) continue;
    const allKeys = new Set([...Object.keys(snapRow), ...Object.keys(liveRow)]);
    for (const col of allKeys) {
      if (JSON.stringify(snapRow[col]) !== JSON.stringify(liveRow[col])) {
        changes.push(`  CHANGED row [${key}] column '${col}': "${snapRow[col]}" → "${liveRow[col]}"`);
      }
    }
  }
  return changes;
}

// No extra params by default — test the real production behavior, not a forced/override state.
// Set via the URL_EXTRA_PARAMS env var if a specific run needs them
// (e.g. URL_EXTRA_PARAMS="languageBanner=on&mas-geo-detection=on&langfirst=on").
const DEFAULT_EXTRA_PARAMS = '';

/**
 * Resolve the full test URL, honoring BASE_URL/URL_EXTRA_PARAMS from the config (stage/prod/
 * aem.live + optional milolibs), and the row's geoIp as akamaiLocale. `pagePath` may be a plain
 * path (joined onto BASE_URL) OR a full absolute URL (its own origin is used as-is, BASE_URL is
 * ignored for that entry) — this is what lets PAGE_PATHS mix pages from different aem.live
 * origins (da-cc, da-dc, upp, ...) in the same run alongside stage/prod paths.
 */
function resolveTestUrl(pagePath, geoIp, countryParam) {
  const base = process.env.BASE_URL || 'https://www.stage.adobe.com';
  const extra = process.env.URL_EXTRA_PARAMS ?? DEFAULT_EXTRA_PARAMS;
  const url = new URL(pagePath, base);
  if (geoIp) url.searchParams.set('akamaiLocale', geoIp);
  if (countryParam) url.searchParams.set('country', countryParam);
  if (extra) {
    for (const pair of extra.split('&')) {
      const [k, v] = pair.split('=');
      if (k) url.searchParams.set(k, v ?? '');
    }
  }
  const resolved = url.toString();
  console.info(`[LingoEn] URL: ${resolved}`);
  return resolved;
}

/**
 * Named page -> per-environment URL table. 'live' entries point at whichever aem.live origin
 * that page actually lives on (they differ per page — da-cc, da-dc, upp — unlike stage/prod
 * where every page hangs off the one www.[stage.]adobe.com origin). Add a page here once and
 * it's available under every TEST_ENV/PAGES combination below; `null` means "not available in
 * that environment yet" and is skipped automatically rather than producing a broken URL.
 */
const PAGE_URLS = {
  home: {
    stage: '/',
    prod: '/',
    live: 'https://main--upp--adobecom.aem.live/homepage/index-loggedout',
  },
  creativecloud: {
    stage: '/creativecloud.html',
    prod: '/creativecloud.html',
    live: 'https://main--da-cc--adobecom.aem.live/creativecloud',
  },
  plans: {
    stage: '/creativecloud/plans.html',
    prod: '/creativecloud/plans.html',
    live: 'https://main--da-cc--adobecom.aem.live/creativecloud/plans',
  },
  acrobat: {
    stage: '/acrobat.html',
    prod: '/acrobat.html',
    live: 'https://main--da-dc--adobecom.aem.live/acrobat',
  },
  catalog: {
    stage: '/products/catalog.html',
    prod: '/products/catalog.html',
    live: 'https://main--da-cc--adobecom.aem.live/products/catalog',
  },
  photoshop: {
    stage: '/products/photoshop.html',
    prod: '/products/photoshop.html',
    live: 'https://main--da-cc--adobecom.aem.live/products/photoshop',
  },
  illustrator: {
    stage: '/products/illustrator.html',
    prod: '/products/illustrator.html',
    live: 'https://main--da-cc--adobecom.aem.live/products/illustrator',
  },
};

/**
 * Three stackable knobs pick which URLs run in one command, without hand-building BASE_URL/
 * PAGE_PATHS combinations yourself:
 *   TEST_ENV  — 'stage' (default) | 'prod' | 'live'. Selects which column of PAGE_URLS resolves.
 *   PAGES     — comma list of PAGE_URLS keys (e.g. "home,acrobat"), or 'all' to run every known
 *               page in one go. Defaults to 'home' only, so existing single-page runs/CI don't
 *               silently start covering every page.
 *   MILOLIBS  — optional branch name (e.g. MILOLIBS=acom-c2lingo). Appends `milolibs=<branch>`
 *               to every resolved URL. Omit entirely to test without milolibs.
 *
 * PAGE_PATHS/PAGE_PATH (comma-separated paths or full URLs) remain the low-level escape hatch
 * for one-off/custom URLs not in the PAGE_URLS table — set either explicitly and it takes
 * priority over TEST_ENV/PAGES entirely.
 */
const TEST_ENV = (process.env.TEST_ENV || 'stage').toLowerCase();
if (TEST_ENV === 'prod' && !process.env.BASE_URL) process.env.BASE_URL = 'https://www.adobe.com';
if (process.env.MILOLIBS && !process.env.URL_EXTRA_PARAMS) {
  process.env.URL_EXTRA_PARAMS = `milolibs=${process.env.MILOLIBS}`;
}

function resolvePagesFromEnv() {
  const requested = (process.env.PAGES || 'home').split(',').map((p) => p.trim()).filter(Boolean);
  const keys = requested.includes('all') ? Object.keys(PAGE_URLS) : requested;
  return keys
    .map((key) => PAGE_URLS[key]?.[TEST_ENV])
    .filter((url) => url !== undefined && url !== null);
}

const PAGE_PATHS = (process.env.PAGE_PATHS || process.env.PAGE_PATH || resolvePagesFromEnv().join(','))
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

function pageSlug(pagePath) {
  if (pagePath === '/' || pagePath === '') return 'root';
  try {
    const u = new URL(pagePath); // succeeds only for a full absolute URL
    const hostSlug = u.hostname.replace(/\./g, '-');
    const pathSlug = u.pathname.replace(/^\/+|\/+$/g, '').replace(/[/.]/g, '-') || 'root';
    return `${hostSlug}-${pathSlug}`;
  } catch {
    return pagePath.replace(/^\/+|\/+$/g, '').replace(/[/.]/g, '-');
  }
}

// ─── JSON Snapshot — run first ──────────────────────────────

test.describe('LingoEn | JSON Snapshot', () => {
  const f = jsonSnapshotFeature;
  test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page }) => {
    const geo = new LingoEnBannerPage(page);
    const base = process.env.BASE_URL || 'https://www.stage.adobe.com';
    const pageUrl = new URL(f.path, base).toString();
    const { supportedMarketsData, marketsData } = await geo.navigateAndCaptureJsons(pageUrl);

    if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    const snapshots = [
      { label: 'supported-markets.json', live: supportedMarketsData, file: path.join(SNAPSHOT_DIR, 'acom-supported-markets.snapshot.json') },
      { label: 'markets.json', live: marketsData, file: path.join(SNAPSHOT_DIR, 'acom-markets.snapshot.json') },
    ];
    let failed = false;
    let allChanges = [];
    for (const { label, live, file } of snapshots) {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(live, null, 2));
        console.info(`[LingoEn] Snapshot created for ${label} ✓`);
        continue;
      }
      const snapshot = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
      if (JSON.stringify(live, null, 2) !== snapshot) {
        if (!live) {
          console.error(`[LingoEn] ${label} — live fetch returned null (stage unreachable or JSON missing)`);
          allChanges.push(`${label}: live fetch returned null`);
          failed = true;
          continue;
        }
        const snapParsed = JSON.parse(snapshot);
        const changes = findJsonChanges(live?.data ?? [], snapParsed?.data ?? []);
        const topKeys = new Set([...Object.keys(live ?? {}), ...Object.keys(snapParsed ?? {})]);
        for (const key of topKeys) {
          if (key === 'data') continue;
          if (JSON.stringify(live?.[key]) !== JSON.stringify(snapParsed?.[key])) {
            changes.push(`  CHANGED top-level '${key}': ${JSON.stringify(snapParsed?.[key])} → ${JSON.stringify(live?.[key])}`);
          }
        }
        console.error(`[LingoEn] ${label} has changed:`);
        for (const line of changes) console.error(line);
        allChanges.push(`${label}:\n${changes.join('\n')}`);
        failed = true;
      } else {
        console.info(`[LingoEn] ${label}: no changes ✓`);
      }
    }
    expect(failed, `JSON snapshot mismatch:\n${allChanges.join('\n\n')}`).toBe(false);
  });
});

// ─── Shared test runner ─────────────────────────────────────────────────────

// markets.json (country names for the modal's {country} substitution) doesn't vary per row —
// fetched once per origin and cached, rather than re-fetched for all ~51 Modal rows.
const marketsCache = new Map();
async function getMarketsData(geo, origin) {
  if (!marketsCache.has(origin)) {
    marketsCache.set(origin, await geo.fetchMarkets(origin));
  }
  return marketsCache.get(origin);
}

async function runLingoEnRow(page, context, feature, pagePath = feature.path) {
  const geo = new LingoEnBannerPage(page);
  const pageUrl = resolveTestUrl(pagePath, feature.geoIp);
  // Derived from the actual page being tested (not hardcoded to root) so this stays correct for
  // any non-root base page (e.g. a `/fr/` base) — today most rows use path '/' so this resolves
  // to '', but the logic doesn't assume that.
  const pagePrefix = LingoEnBannerPage.parseUrlLocale(pageUrl).prefix;

  await context.clearCookies();
  if (feature.cookieValue !== undefined) {
    await geo.setInternationalCookieValue(context, feature.cookieValue, pageUrl);
  }
  // feature.cookieValue === undefined means "no cookie set" — treated as US/EN default

  const { supportedMarketsData } = await geo.navigateAndCaptureSupportedMarkets(pageUrl);

  let computed;
  if (feature.uiExpectation) {
    computed = LingoEnBannerPage.computeExpectedUi({
      pagePrefix,
      geoIp: feature.geoIp,
      prefLangCode: feature.cookieValue,
      supportedMarketsData,
      isBacom: false,
    });
    console.info(`[LingoEn] Flowchart — Expected: '${feature.uiExpectation}' | Actual: '${computed.outcome}'`);
    expect(
      computed.outcome,
      `Flowchart (against live JSON) → '${computed.outcome}' but spec → '${feature.uiExpectation}' for [${feature.name}]`,
    ).toBe(feature.uiExpectation);
  }

  if (feature.uiExpectation === 'none') {
    await geo.assertNone();
  } else if (feature.uiExpectation === 'banner') {
    const copy = LingoEnBannerPage.getBannerCopy(
      supportedMarketsData?.data?.find((r) => (r.prefix ?? '') === (feature.recommendedRowPrefix ?? '')),
    );
    await geo.assertBanner(copy);
  } else if (feature.uiExpectation === 'modal') {
    // Some markets don't have every page built out (confirmed: cis_en's own root/catalog work,
    // but creativecloud/acrobat/photoshop/illustrator 404 for it). When that's the case here, the
    // site's own geo-detection appears to skip rendering the Modal entirely rather than recommend
    // a broken link — waiting 35s for a Modal that will never appear and failing isn't useful.
    // Check the actual recommended page first; if it 404s, log it plainly and skip ONLY the Modal
    // assertion — pricing is still checked below (the page never navigated away either way, so
    // its own base price is still observable and worth verifying).
    const recommendedPageUrl = new URL(
      `/${feature.recommendedRowPrefix}${pagePath === '/' ? '/' : pagePath}`,
      new URL(pageUrl).origin,
    ).toString();
    const recommendedPageCheck = await geo.page.request.get(recommendedPageUrl).catch(() => null);
    if (!recommendedPageCheck?.ok()) {
      console.warn(`[LingoEn] Page '${recommendedPageUrl}' is not present (status ${recommendedPageCheck?.status() ?? null}) — international cookie '${feature.recommendedRowPrefix}' cannot be set on this page, hence skipping Modal checks for this row (pricing still checked)`);
    } else {
      const row = supportedMarketsData?.data?.find((r) => (r.prefix ?? '') === (feature.recommendedRowPrefix ?? ''));
      const marketsData = await getMarketsData(geo, new URL(pageUrl).origin);
      const buttonCountry = row ? LingoEnBannerPage.resolveCountryDisplayName(row.lang, feature.geoIp, marketsData) : undefined;
      // Priority tie-break rows (Scenario 5) carry `allOptions` — every ranked candidate row for
      // this GeoIP. Build one tab entry per candidate from the SAME live JSON already fetched, so
      // each tab's expected title/description/country is real ground truth, not hand-typed.
      const tabs = computed?.allOptions?.length > 1
        ? computed.allOptions.map((r) => {
          const tabCountry = LingoEnBannerPage.resolveCountryDisplayName(r.lang, feature.geoIp, marketsData);
          const { recommendedRowPrefix: rowPrefix, ...copy } = LingoEnBannerPage.getModalCopy(r, tabCountry);
          return { rowPrefix, nativeName: r.nativeName, country: tabCountry, ...copy };
        })
        : undefined;
      await geo.assertModal({ ...LingoEnBannerPage.getModalCopy(row, buttonCountry), pagePrefix, geoIp: feature.geoIp, pagePath, tabs });
    }
    // The Modal blocks the page content underneath, so it must be dismissed before the price
    // block can even be read (a no-op if it was never rendered in the first place). The Banner is
    // NOT dismissed here — it doesn't block content, and its own close (X) button writes
    // cookie='us' (confirmed in the write-path tests), which would corrupt the very state this
    // pricing check is trying to observe.
    await geo.dismissGeoRoutingModal();
  }

  // Pricing: log what's actually shown per GeoIP/cookie/recommended-market combo, and soft-fail
  // against confirmed-real expected pricing (same expectation on stage/prod/aem.live alike).
  // isGeoIpSupported checks if the GeoIP appears in ANY row (almost always true, since every
  // Modal row's own GeoIP trivially matches its own row) — isSupportedCombo(pagePrefix, geoIp, ...)
  // is the correct check here: is this GeoIP specifically supported by THIS base page?
  const geoIpSupported = LingoEnBannerPage.isSupportedCombo(pagePrefix, feature.geoIp, supportedMarketsData);
  const { distinct: pricingSymbols, totalCount: pricingSymbolCount } = await geo.getPricingSymbols();
  const { symbol: expectedSymbol, reason: expectedReason } = LingoEnBannerPage.resolveExpectedPricingSymbol({
    geoIpSupported,
    geoIp: feature.geoIp,
    recommendedRowPrefix: feature.recommendedRowPrefix,
    pagePrefix,
  });
  console.info(`[LingoEn] Price currency symbols — Expected: '${expectedSymbol}'${expectedReason ? ` (${expectedReason})` : ''} | Rendered: ${JSON.stringify(pricingSymbols)} (${pricingSymbolCount} currency symbol(s))`);
  if (pricingSymbols.length > 1) {
    console.warn(`[LingoEn] MIXED currencies rendered: ${JSON.stringify(pricingSymbols)} (${pricingSymbolCount} currency symbol(s)), expected exactly one consistent symbol`);
  }
  const currencyIssue = LingoEnBannerPage.checkPricingExpectation({
    geoIpSupported,
    geoIp: feature.geoIp,
    recommendedRowPrefix: feature.recommendedRowPrefix,
    pagePrefix,
    symbols: pricingSymbols,
  });
  expect.soft(currencyIssue, `[${feature.name}] ${currencyIssue}`).toBeNull();
}

// ─── Test groups, driven by the generated matrix, one pass per PAGE_PATHS entry ────────────

for (const pagePath of PAGE_PATHS) {
  const slug = pageSlug(pagePath);

  test.describe(`LingoEn | No Action | ${pagePath}`, () => {
    for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'none')) {
      test(`${f.name}-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), '@no-action', `@page-${slug}`] }, async ({ page, context }) => {
        await runLingoEnRow(page, context, f, pagePath);
      });
    }
  });

  test.describe(`LingoEn | Banner | ${pagePath}`, () => {
    for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'banner')) {
      test(`${f.name}-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), '@banner', `@page-${slug}`] }, async ({ page, context }) => {
        await runLingoEnRow(page, context, f, pagePath);
      });
    }
  });

  test.describe(`LingoEn | Modal | ${pagePath}`, () => {
    for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'modal')) {
      test(`${f.name}-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), `@page-${slug}`] }, async ({ page, context }) => {
        await runLingoEnRow(page, context, f, pagePath);
      });
    }
  });
}

// ─── Banner write-path — what clicking Continue/Close actually writes to the cookie ────────
const WRITE_PATH_SAMPLE = lingoEnFeatures.filter((f) =>
  ['@lingoEN-geo-ph-cookie-ph_fil', '@lingoEN-geo-be-cookie-be_nl', '@lingoEN-geo-il-cookie-il_he'].includes(f.name));

for (const pagePath of PAGE_PATHS) {
  const slug = pageSlug(pagePath);

  test.describe(`LingoEn | Banner Write-Path | ${pagePath}`, () => {
    for (const f of WRITE_PATH_SAMPLE) {
      test(`${f.name}-continue-writes-cookie-page-${slug}`, { tag: ['@lingo-en', '@write-path', `@page-${slug}`] }, async ({ page, context }) => {
        const geo = new LingoEnBannerPage(page);
        const pageUrl = resolveTestUrl(pagePath, f.geoIp);
        await context.clearCookies();
        if (f.cookieValue !== undefined) await geo.setInternationalCookieValue(context, f.cookieValue, pageUrl);

        await geo.navigateAndCaptureSupportedMarkets(pageUrl);
        await geo.assertBanner({ recommendedRowPrefix: f.recommendedRowPrefix });
        // The Banner's Continue link has no `country` param — confirmed live, unlike the Modal.
        const expectedHref = geo.buildExpectedOptionHref(f.recommendedRowPrefix, pagePath, false);
        const hrefBeforeClick = await geo.languageBannerLink.first().getAttribute('href');
        console.info(`[LingoEn] Write-Path Continue — Expected href before click: '${expectedHref}' | Actual: '${hrefBeforeClick}'`);
        expect(
          hrefBeforeClick,
          `[${f.name}] banner Continue link href should be '${expectedHref}' before clicking, actual '${hrefBeforeClick}'`,
        ).toBe(expectedHref);

        await geo.clickBannerContinue();

        const writtenValue = await geo.getInternationalCookieValue(context, pageUrl);
        const finalUrl = page.url();
        console.info(`[LingoEn] Write-Path Continue — Expected cookie: '${f.recommendedRowPrefix}' | Actual: '${writtenValue}' | Expected URL: '${expectedHref}' | Actual URL: '${finalUrl}'`);
        expect(
          writtenValue,
          `Clicking Continue on the [${f.name}] banner should write cookie='${f.recommendedRowPrefix}', got '${writtenValue}'`,
        ).toBe(f.recommendedRowPrefix);
        expect(
          finalUrl,
          `Clicking Continue on the [${f.name}] banner should redirect to '${expectedHref}', actual '${finalUrl}'`,
        ).toBe(expectedHref);
      });

      test(`${f.name}-close-writes-us-cookie-page-${slug}`, { tag: ['@lingo-en', '@write-path', `@page-${slug}`] }, async ({ page, context }) => {
        const geo = new LingoEnBannerPage(page);
        const pageUrl = resolveTestUrl(pagePath, f.geoIp);
        await context.clearCookies();
        if (f.cookieValue !== undefined) await geo.setInternationalCookieValue(context, f.cookieValue, pageUrl);

        await geo.navigateAndCaptureSupportedMarkets(pageUrl);
        await geo.assertBanner({ recommendedRowPrefix: f.recommendedRowPrefix });
        await geo.clickBannerCloseButton();

        const writtenValue = await geo.getInternationalCookieValue(context, pageUrl);
        console.info(`[LingoEn] Write-Path Close — Expected cookie: 'us' | Actual: '${writtenValue}'`);
        expect(
          writtenValue,
          `Closing (X) the [${f.name}] banner should write cookie='us', got '${writtenValue}'`,
        ).toBe('us');
      });
    }
  });
}

// ─── Modal write-path — clicking the recommendation redirects correctly + sets the cookie ──
// One plain sample and one dropdown/tie-break sample (e.g. `ch` -> `ch_de` needs a second click
// on a sub-option — see LingoEnBannerPage.clickModalContinue).
const MODAL_WRITE_PATH_SAMPLE = lingoEnFeatures.filter((f) =>
  ['@lingoEN-geo-de-cookie-de', '@lingoEN-geo-dz-cookie-fi'].includes(f.name));

for (const pagePath of PAGE_PATHS) {
  const slug = pageSlug(pagePath);

  test.describe(`LingoEn | Modal Write-Path | ${pagePath}`, () => {
    for (const f of MODAL_WRITE_PATH_SAMPLE) {
      test(`${f.name}-continue-writes-cookie-page-${slug}`, { tag: ['@lingo-en', '@write-path', `@page-${slug}`] }, async ({ page, context }) => {
        const geo = new LingoEnBannerPage(page);
        const pageUrl = resolveTestUrl(pagePath, f.geoIp);
        await context.clearCookies();
        if (f.cookieValue !== undefined) await geo.setInternationalCookieValue(context, f.cookieValue, pageUrl);

        await geo.navigateAndCaptureSupportedMarkets(pageUrl);
        await geo.waitForGeoModalReady();

        // Mirrors clickModalContinue's branching, so href can be checked before the final click.
        const ariaExpanded = await geo.geoRoutingModalButton.getAttribute('aria-expanded').catch(() => null);
        let targetLink = geo.geoRoutingModalButton;
        if (ariaExpanded !== null) {
          await geo.geoRoutingModalButton.click();
          targetLink = geo.geoRoutingModal.locator('a:not([href="#"])').first();
          await targetLink.waitFor({ state: 'visible', timeout: 5000 });
        }

        const expectedHref = geo.buildExpectedOptionHref(f.recommendedRowPrefix, pagePath);
        const hrefBeforeClick = await targetLink.getAttribute('href');
        console.info(`[LingoEn] Modal Write-Path — Expected href before click: '${expectedHref}' | Actual: '${hrefBeforeClick}'`);
        expect(
          hrefBeforeClick,
          `[${f.name}] Modal recommendation href should be '${expectedHref}' before clicking, actual '${hrefBeforeClick}'`,
        ).toBe(expectedHref);

        const urlBeforeClick = page.url();
        await targetLink.click();
        await page.waitForURL((url) => url.toString() !== urlBeforeClick, { timeout: 10000 }).catch(() => {});

        const writtenValue = await geo.getInternationalCookieValue(context, pageUrl);
        const finalUrl = page.url();
        console.info(`[LingoEn] Modal Write-Path — Expected cookie: '${f.recommendedRowPrefix}' | Actual: '${writtenValue}' | Expected URL: '${expectedHref}' | Actual URL: '${finalUrl}'`);
        expect(
          writtenValue,
          `Clicking the [${f.name}] Modal recommendation should write cookie='${f.recommendedRowPrefix}', got '${writtenValue}'`,
        ).toBe(f.recommendedRowPrefix);
        expect(
          finalUrl,
          `Clicking the [${f.name}] Modal recommendation should redirect to '${expectedHref}', actual '${finalUrl}'`,
        ).toBe(expectedHref);
      });
    }
  });
}

// ─── Root redirects ──

for (const pagePath of PAGE_PATHS) {
test.describe(`LingoEn | Root Redirects | ${pagePath}`, () => {
  for (const f of lingoEnRootRedirectFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page }) => {
      const base = process.env.BASE_URL || 'https://www.stage.adobe.com';
      const target = new URL(pagePath, base);
      const url = new URL(f.path.replace(/\/$/, '') + target.pathname, target.origin).toString();
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      const finalUrl = page.url();
      const rootUrl = target.toString();
      console.info(`[LingoEn] Redirect — From: ${url} | Expected: '${rootUrl}' | Actual: '${finalUrl}' (status ${response?.status()})`);
      expect(
        finalUrl,
        `[${f.name}] expected ${url} to redirect to root (${rootUrl}), landed on ${finalUrl} instead (status ${response?.status()})`,
      ).toBe(rootUrl);
    });
  }
});
}

// ─── Pricing priority chain (port of Express's N9/N10/N11) ─────────────────────────────────
// The same `country`-param mechanism Express uses for currency priority also applies outside
// `/express/`. If the `country` param has no effect on ACOM's root page, all three rows will
// show the same currency instead of the expected per-country symbols.

test.describe('LingoEn | Pricing Priority Chain', () => {
  for (const f of lingoEnPricingPriorityFeatures) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      const geo = new LingoEnBannerPage(page);
      const pageUrl = resolveTestUrl(f.path, f.geoIp, f.countryParam);

      await context.clearCookies();
      const { domain } = LingoEnBannerPage.internationalCookieDomainForUrl(pageUrl);
      const cookiesToSet = [];
      if (f.internationalCookie) {
        cookiesToSet.push({ name: 'international', value: f.internationalCookie, domain, path: '/', secure: true, sameSite: 'Lax' });
      }
      if (f.countryCookie) {
        cookiesToSet.push({ name: 'country', value: f.countryCookie, domain, path: '/', secure: true, sameSite: 'Lax' });
      }
      if (cookiesToSet.length) await context.addCookies(cookiesToSet);

      await geo.navigateAndCaptureSupportedMarkets(pageUrl);
      const { distinct: pricingSymbols, totalCount: pricingSymbolCount } = await geo.getPricingSymbols();
      const expectedSymbol = LingoEnBannerPage.MARKET_PRICE_SYMBOL_BY_PREFIX[f.expectedMarketPrefix];
      console.info(`[LingoEn] Price currency symbols — Expected: '${expectedSymbol}' (market='${f.expectedMarketPrefix}') | Rendered: ${JSON.stringify(pricingSymbols)} (${pricingSymbolCount} currency symbol(s))`);
      if (pricingSymbols.length > 1) {
        console.warn(`[LingoEn] MIXED currencies rendered: ${JSON.stringify(pricingSymbols)} (${pricingSymbolCount} currency symbol(s)), expected exactly one consistent symbol`);
      }

      expect(
        pricingSymbols.includes(expectedSymbol),
        `[${f.name}] expected '${expectedSymbol}' pricing (country param should win, market='${f.expectedMarketPrefix}'), got: ${JSON.stringify(pricingSymbols)}`,
      ).toBe(true);
    });
  }
});


