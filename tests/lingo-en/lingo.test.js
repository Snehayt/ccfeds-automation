import { test, expect } from '@playwright/test';
import { LingoEnBannerPage } from '../../selectors/lingo-en/lingo.page.js';
import { lingoEnFeatures } from '../../features/lingo-en/lingo.spec.js';
import fs from 'fs';
import path from 'path';

/**
 * Generalized lingo/geo-banner test runner. See ../../lingo-en-skills.md for the full domain
 * model, flowchart, and the corrected PREF-LANG rule this runner asserts against.
 *
 * Structure (skills.md §2/§4):
 *   1. JSON Snapshot group — runs first, fails loudly on any supported-markets.json field change.
 *   2. No Action / Banner / Modal groups — driven by features/lingo-en/lingo.spec.js's generated matrix.
 *   3. Needs-verification group — the one known ambiguity (in_hi), skipped with a clear reason,
 *      never silently asserted.
 */

const SNAPSHOT_DIR = path.resolve(process.cwd(), 'test-cases/snapshots');

function findJsonChanges(liveArr = [], snapArr = []) {
  const changes = [];
  const maxLen = Math.max(liveArr.length, snapArr.length);
  for (let i = 0; i < maxLen; i++) {
    const snapRow = snapArr[i];
    const liveRow = liveArr[i];
    if (!snapRow) {
      changes.push(`  ADDED row [${i}]: ${JSON.stringify(liveRow)}`);
    } else if (!liveRow) {
      changes.push(`  REMOVED row [${i}]: ${JSON.stringify(snapRow)}`);
    } else {
      const allKeys = new Set([...Object.keys(snapRow), ...Object.keys(liveRow)]);
      for (const col of allKeys) {
        if (JSON.stringify(snapRow[col]) !== JSON.stringify(liveRow[col])) {
          changes.push(`  CHANGED row [${i}] column '${col}': "${snapRow[col]}" → "${liveRow[col]}"`);
        }
      }
    }
  }
  return changes;
}

// Default params required for the banner/modal to actually render (confirmed live — without
// these the page renders no banner even when the flowchart says it should). Override via the
// standard URL_EXTRA_PARAMS env var (e.g. URL_EXTRA_PARAMS="languageBanner=on") if the live
// requirement changes in the future — don't assume this default stays correct forever.
const DEFAULT_EXTRA_PARAMS = 'languageBanner=on&mas-geo-detection=on&langfirst=on';

/**
 * Resolve the full test URL, honoring BASE_URL/URL_EXTRA_PARAMS from the config (stage/prod/
 * aem.live + optional milolibs), and the row's geoIp as akamaiLocale.
 */
function resolveTestUrl(pagePath, geoIp) {
  const base = process.env.BASE_URL || 'https://www.stage.adobe.com';
  const extra = process.env.URL_EXTRA_PARAMS ?? DEFAULT_EXTRA_PARAMS;
  const url = new URL(pagePath, base);
  if (geoIp) url.searchParams.set('akamaiLocale', geoIp);
  if (extra) {
    for (const pair of extra.split('&')) {
      const [k, v] = pair.split('=');
      if (k) url.searchParams.set(k, v ?? '');
    }
  }
  return url.toString();
}

/**
 * `PAGE_PATHS` (comma-separated, e.g. "/,/creativecloud.html,/acrobat.html") is how you pick
 * which URL(s) get the full spec matrix in a given run — one Playwright execution, one report,
 * covering however many pages you list. Defaults to just the US root ('/') when unset. Combine
 * with Playwright's own `-g`/`--grep` (matched against the test title, which includes the row's
 * `@lingoEN-geo-...-cookie-...` name plus its tags) to also narrow down to specific cases — e.g.
 * `-g "geo-mx|geo-fr"` for just those two GeoIPs, across whichever pages PAGE_PATHS lists.
 *
 * Every page gets its own `@page-{slug}` tag and a `-page-{slug}` suffix on the test name, so:
 *   - the dashboard/HTML report can filter by page via that tag,
 *   - running multiple pages in one execution never produces duplicate test titles (Playwright
 *     requires unique titles; two pages testing the same GeoIP+cookie row would otherwise collide).
 * The `@name`-prefix convention this repo's reporter (utils/reporters/base-reporter.js) parses
 * is preserved — the suffix is appended inside the same `@...` token, not as a separate one.
 */
const PAGE_PATHS = (process.env.PAGE_PATHS || process.env.PAGE_PATH || '/')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);

function pageSlug(pagePath) {
  if (pagePath === '/' || pagePath === '') return 'root';
  return pagePath.replace(/^\/+|\/+$/g, '').replace(/[/.]/g, '-');
}

// ─── JSON Snapshot — run first (skills.md §2) ──────────────────────────────

test.describe('LingoEn | JSON Snapshot', () => {
  test('@lingo-en-json-snapshot-acom', { tag: ['@lingo-en', '@json-snapshot'] }, async ({ page }) => {
    const geo = new LingoEnBannerPage(page);
    const base = process.env.BASE_URL || 'https://www.stage.adobe.com';
    const origin = new URL(base).origin;
    const live = await geo.fetchSupportedMarkets(origin, '/', false);

    if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    const snapshotFile = path.join(SNAPSHOT_DIR, 'acom-supported-markets.snapshot.json');

    if (!fs.existsSync(snapshotFile)) {
      fs.writeFileSync(snapshotFile, JSON.stringify(live, null, 2));
      console.info('[LingoEn] Snapshot created for acom-supported-markets.json ✓');
      return;
    }

    const snapshot = fs.readFileSync(snapshotFile, 'utf8').replace(/\r\n/g, '\n');
    if (JSON.stringify(live, null, 2) === snapshot) {
      console.info('[LingoEn] acom-supported-markets.json: no changes ✓');
      return;
    }

    if (!live) {
      throw new Error('[LingoEn] Live fetch of supported-markets.json returned null — endpoint unreachable or JSON missing');
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
    console.error('[LingoEn] supported-markets.json has changed:');
    for (const line of changes) console.error(line);
    throw new Error(`[LingoEn] supported-markets.json changed since last snapshot:\n${changes.join('\n')}\n\nIf this is an intentional data change, update the snapshot at ${snapshotFile} and re-verify skills.md §3's rules still hold.`);
  });
});

// ─── Shared test runner ─────────────────────────────────────────────────────

async function runLingoEnRow(page, context, feature, pagePath = feature.path) {
  const geo = new LingoEnBannerPage(page);
  const pageUrl = resolveTestUrl(pagePath, feature.geoIp);

  await context.clearCookies();
  if (feature.cookieValue !== undefined) {
    await geo.setInternationalCookieValue(context, feature.cookieValue, pageUrl);
  }
  // feature.cookieValue === undefined means "no cookie set" — treated as US/EN default (skills.md §3.5)

  const { supportedMarketsData } = await geo.navigateAndCaptureSupportedMarkets(pageUrl);

  if (feature.uiExpectation) {
    const computed = LingoEnBannerPage.computeExpectedUi({
      pagePrefix: '',
      geoIp: feature.geoIp,
      prefLangCode: feature.cookieValue,
      supportedMarketsData,
      isBacom: false,
    });
    expect(
      computed.outcome,
      `Flowchart (against live JSON) → '${computed.outcome}' but spec → '${feature.uiExpectation}' for [${feature.name}]`,
    ).toBe(feature.uiExpectation);
  }

  if (feature.uiExpectation === 'none') {
    await geo.assertNone();
  } else if (feature.uiExpectation === 'banner') {
    const copy = LingoEnBannerPage.getBannerCopy(
      supportedMarketsData?.data?.find((r) => (r.prefix ?? '') === (feature.bannerRowPrefix ?? '')),
    );
    await geo.assertBanner(copy);
  } else if (feature.uiExpectation === 'modal') {
    const row = supportedMarketsData?.data?.find((r) => (r.prefix ?? '') === (feature.bannerRowPrefix ?? ''));
    const buttonCountry = row ? LingoEnBannerPage.resolveCountryDisplayName(row.lang, feature.geoIp) : undefined;
    await geo.assertModal(LingoEnBannerPage.getModalCopy(row, buttonCountry));
  }

  // Pricing: log what's actually shown per GeoIP/cookie/recommended-market combo, and soft-fail
  // the confirmed "showing US$ where a distinct local currency is standard" pattern (skills.md
  // gap — no currency-per-market source of truth exists in supported-markets.json, so this only
  // checks the well-known-currency cases in EXPECTED_CURRENCY_BY_GEO, not every market).
  const pricingSymbols = await geo.getPricingSymbols();
  console.info('[LingoEn][Pricing]', JSON.stringify({
    name: feature.name,
    pagePath,
    geoIp: feature.geoIp,
    cookieValue: feature.cookieValue,
    bannerRowPrefix: feature.bannerRowPrefix,
    pricingSymbols,
  }));
  const currencyIssue = LingoEnBannerPage.checkPricingCurrency(feature.geoIp, pricingSymbols);
  expect.soft(currencyIssue, `[${feature.name}] ${currencyIssue}`).toBeNull();
}

// ─── Test groups, driven by the generated matrix, one pass per PAGE_PATHS entry ────────────

for (const pagePath of PAGE_PATHS) {
  const slug = pageSlug(pagePath);

  test.describe(`LingoEn | No Action | ${pagePath}`, () => {
    for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'none')) {
      test(`${f.name}-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), `@page-${slug}`] }, async ({ page, context }) => {
        await runLingoEnRow(page, context, f, pagePath);
      });
    }
  });

  test.describe(`LingoEn | Banner | ${pagePath}`, () => {
    for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'banner')) {
      test(`${f.name}-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), `@page-${slug}`] }, async ({ page, context }) => {
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
//
// Read-path tests above only ever SET the cookie and check the resulting UI. These verify the
// other direction: given a rendered banner, does interacting with it write the `international`
// cookie correctly? Continue -> the recommended row's own value (bannerRowPrefix). Close (X) ->
// resets/defaults to 'us'. Tested against a representative sample of banner rows, not all 55 —
// the write behavior is generic UI wiring, not per-language logic, so one sample per distinct
// code path (Continue vs Close) across a couple of languages is enough to catch a regression.
const WRITE_PATH_SAMPLE = lingoEnFeatures.filter((f) =>
  ['@lingoEN-geo-mx-cookie-mx', '@lingoEN-geo-fr-cookie-be_nl', '@lingoEN-geo-ph-cookie-ph_fil'].includes(f.name));

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
        await geo.assertBanner();
        await geo.clickBannerContinue();

        const writtenValue = await geo.getInternationalCookieValue(context, pageUrl);
        expect(
          writtenValue,
          `Clicking Continue on the [${f.name}] banner should write cookie='${f.bannerRowPrefix}', got '${writtenValue}'`,
        ).toBe(f.bannerRowPrefix);
      });

      test(`${f.name}-close-writes-us-cookie-page-${slug}`, { tag: ['@lingo-en', '@write-path', `@page-${slug}`] }, async ({ page, context }) => {
        const geo = new LingoEnBannerPage(page);
        const pageUrl = resolveTestUrl(pagePath, f.geoIp);
        await context.clearCookies();
        if (f.cookieValue !== undefined) await geo.setInternationalCookieValue(context, f.cookieValue, pageUrl);

        await geo.navigateAndCaptureSupportedMarkets(pageUrl);
        await geo.assertBanner();
        await geo.clickBannerCloseButton();

        const writtenValue = await geo.getInternationalCookieValue(context, pageUrl);
        expect(
          writtenValue,
          `Closing (X) the [${f.name}] banner should write cookie='us', got '${writtenValue}'`,
        ).toBe('us');
      });
    }
  });
}

