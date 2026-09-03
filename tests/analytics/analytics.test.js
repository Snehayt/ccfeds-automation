import { test, expect } from '@playwright/test';
import AnalyticsPage from '../../selectors/analytics/analytics.page.js';
import {
  ANALYTICS_PAGE_PATHS,
  analyticsBannerFeatures,
  analyticsModalFeatures,
  analyticsBaseSiteModalFeatures,
  analyticsBacomBannerFeatures,
} from '../../features/analytics/analytics.spec.js';

/**
 * Analytics validation for the Language Banner, Regional Modal, and Geo Routing Modal — built
 * around milo PR #6459 (https://github.com/adobecom/milo/pull/6459), which restored the modal's
 * `Load:...|Geo_Routing_Modal` beacon after a regression silently corrupted it. See
 * selectors/analytics/analytics.page.js for the full context and beacon/daa-ll pattern details.
 *
 * Only depends on AnalyticsPage (self-contained: owns its own navigation/cookie/modal-wait
 * helpers) + the feature matrices — no dependency on any per-experience page object
 * (selectors/{cc,express,lingo-en}/lingo.page.js).
 *
 * Case sources (see features/analytics/analytics.spec.js for how each is built/verified):
 *   - `analyticsBannerFeatures`/`analyticsModalFeatures` — the all-geo matrix already covering
 *     UI correctness in tests/lingo-en/lingo.test.js, all on the US/root ACOM base ('/'). `PAGES`
 *     (comma list of ANALYTICS_PAGE_PATHS keys, or 'all') layers in other US-based pages to run
 *     that matrix against; defaults to 'root' only.
 *   - `analyticsBaseSiteModalFeatures` — non-root ACOM BASE sites (jp/kr/it/fr/de/in). Modal-only
 *     — Banner is NOT producible on non-root ACOM bases (live-confirmed; see spec file).
 *   - `analyticsBacomBannerFeatures` — BACOM (business[.stage].adobe.com), sourced directly from
 *     features/express/lingo.spec.js's own machine-verified `bacomFeatures`. Banner only — BACOM
 *     never renders a Modal for this scenario.
 *
 * Express itself is NOT covered here — confirmed directly by the site owner that Express has
 * neither Banner nor Modal enabled at all.
 */

function resolvePagesFromEnv() {
  const requested = (process.env.PAGES || 'root').split(',').map((p) => p.trim()).filter(Boolean);
  const keys = requested.includes('all') ? Object.keys(ANALYTICS_PAGE_PATHS) : requested;
  return keys.map((key) => ANALYTICS_PAGE_PATHS[key]).filter(Boolean);
}

const PAGE_PATHS = resolvePagesFromEnv();

function pageSlug(pagePath) {
  return pagePath === '/' ? 'root' : pagePath.replace(/^\/+|\/+$/g, '').replace(/[/.]/g, '-');
}

// ─── Shared per-row checks — take an already-resolved `pageUrl` so both the ACOM PAGES/geoIp
// axis and the Express/BACOM rows (whose own `path` already carries query params, possibly on a
// different origin) can share the same assertion logic. ───────────────────────────────────────

async function runModalLoadEventCheck(page, context, f, pageUrl) {
  const analytics = new AnalyticsPage(page);
  const pagePrefix = AnalyticsPage.parseUrlLocale(pageUrl).prefix;
  const geoIp = f.geoIp ?? new URL(pageUrl).searchParams.get('akamaiLocale');

  await context.clearCookies();
  await analytics.start();
  if (f.cookieValue !== undefined) await analytics.setInternationalCookieValue(context, f.cookieValue, pageUrl);

  await analytics.navigate(pageUrl);
  await analytics.waitForGeoModalReady(pagePrefix);

  const pattern = AnalyticsPage.buildLoadEventPattern({ pagePrefix, geoIp, intl: f.cookieValue });
  await analytics.assertModalLoadEvent(pattern, { label: `[${f.name}] Load event` });
}

async function runModalDaaLlCheck(page, context, f, pageUrl) {
  const analytics = new AnalyticsPage(page);
  const pagePrefix = AnalyticsPage.parseUrlLocale(pageUrl).prefix;

  await context.clearCookies();
  if (f.cookieValue !== undefined) await analytics.setInternationalCookieValue(context, f.cookieValue, pageUrl);

  await analytics.navigate(pageUrl);
  await analytics.waitForGeoModalReady(pagePrefix);

  const pattern = AnalyticsPage.buildDaaLlPattern();
  const cta = await analytics.resolveGeoRoutingCta();
  await analytics.assertDaaLl(cta, pattern, `[${f.name}] Geo Routing Modal CTA`);
}

async function runBannerDaaLlPresenceCheck(page, context, f, pageUrl) {
  const analytics = new AnalyticsPage(page);

  await context.clearCookies();
  if (f.cookieValue !== undefined) await analytics.setInternationalCookieValue(context, f.cookieValue, pageUrl);

  await analytics.navigate(pageUrl);
  await expect(analytics.languageBanner).toBeVisible({ timeout: 25000 });

  const daaLl = await analytics.checkBannerDaaLlPresent();
  expect.soft(daaLl, `[${f.name}] Banner Continue link is missing a daa-ll click-tracking attribute`).not.toBeNull();
}

// ─── US/root-base ACOM matrix, across PAGES ═══════════════════════════════════════════════════

for (const pagePath of PAGE_PATHS) {
  const slug = pageSlug(pagePath);

  test.describe(`Analytics | Regional Modal & Geo Routing Modal | Load event (milo#6459) | ${pagePath}`, () => {
    for (const f of analyticsModalFeatures) {
      test(`${f.name}-load-event-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), '@analytics'] }, async ({ page, context }) => {
        await runModalLoadEventCheck(page, context, f, AnalyticsPage.resolveTestUrl(pagePath, f.geoIp));
      });
    }
  });

  test.describe(`Analytics | Regional Modal & Geo Routing Modal | CTA daa-ll attribute | ${pagePath}`, () => {
    for (const f of analyticsModalFeatures) {
      test(`${f.name}-daa-ll-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), '@analytics'] }, async ({ page, context }) => {
        await runModalDaaLlCheck(page, context, f, AnalyticsPage.resolveTestUrl(pagePath, f.geoIp));
      });
    }
  });

  test.describe(`Analytics | Banner | daa-ll presence | ${pagePath}`, () => {
    for (const f of analyticsBannerFeatures) {
      test(`${f.name}-daa-ll-page-${slug}`, { tag: [...f.tags.split(' ').filter(Boolean), '@analytics'] }, async ({ page, context }) => {
        await runBannerDaaLlPresenceCheck(page, context, f, AnalyticsPage.resolveTestUrl(pagePath, f.geoIp));
      });
    }
  });
}

// ─── Non-root ACOM BASE sites (jp/kr/it/fr/de/in) — Modal only; exercises the Geo Routing Modal
// v2 shell (#locale-modal-v2). Banner is not producible on non-root ACOM bases (see spec file). ─

test.describe('Analytics | ACOM base sites | Regional/Geo Routing Modal | Load event (milo#6459)', () => {
  for (const f of analyticsBaseSiteModalFeatures) {
    test(`${f.name}-load-event`, { tag: [...f.tags.split(' ').filter(Boolean), '@analytics'] }, async ({ page, context }) => {
      await runModalLoadEventCheck(page, context, f, AnalyticsPage.resolveTestUrl(f.path, f.geoIp));
    });
  }
});

test.describe('Analytics | ACOM base sites | Regional/Geo Routing Modal | CTA daa-ll attribute', () => {
  for (const f of analyticsBaseSiteModalFeatures) {
    test(`${f.name}-daa-ll`, { tag: [...f.tags.split(' ').filter(Boolean), '@analytics'] }, async ({ page, context }) => {
      await runModalDaaLlCheck(page, context, f, AnalyticsPage.resolveTestUrl(f.path, f.geoIp));
    });
  }
});

// ─── BACOM base sites — Banner only; isBacom routes scenario 4/5 to Banner, never Modal ───────
// (Express itself has neither Banner nor Modal enabled — confirmed directly by the site owner —
// so there is no Express describe block here.)

test.describe('Analytics | BACOM base sites | Banner | daa-ll presence', () => {
  for (const f of analyticsBacomBannerFeatures) {
    test(`${f.name}-daa-ll`, { tag: [...f.tags.split(' ').filter(Boolean), '@analytics'] }, async ({ page, context }) => {
      await runBannerDaaLlPresenceCheck(page, context, f, AnalyticsPage.resolveOriginUrl(f.path, f.isBacom));
    });
  }
});
