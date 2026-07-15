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
 * Resolve the full test URL for the US root path, honoring BASE_URL/URL_EXTRA_PARAMS from the
 * config (stage/prod/aem.live + optional milolibs), and the row's geoIp as akamaiLocale.
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

async function runLingoEnRow(page, context, feature) {
  const geo = new LingoEnBannerPage(page);
  const pageUrl = resolveTestUrl(feature.path, feature.geoIp);

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
    await geo.assertModal(LingoEnBannerPage.getModalCopy(row));
  }
}

// ─── Test groups, driven by the generated matrix ───────────────────────────

test.describe('LingoEn | No Action', () => {
  for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'none')) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoEnRow(page, context, f);
    });
  }
});

test.describe('LingoEn | Banner', () => {
  for (const f of lingoEnFeatures.filter((f) => f.uiExpectation === 'banner')) {
    test(f.name, { tag: f.tags.split(' ').filter(Boolean) }, async ({ page, context }) => {
      await runLingoEnRow(page, context, f);
    });
  }
});

