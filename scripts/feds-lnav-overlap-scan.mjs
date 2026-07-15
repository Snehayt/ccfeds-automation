// FEDs LNav header overlap scanner.
// Detects per-locale:
//   1. text-clipped — element.scrollWidth > clientWidth (text cut off by container)
//   2. siblings-overlap — adjacent top-level nav items physically overlap
//   3. nav-overflows-header — last nav item extends past the header right edge
// Outputs a console table + writes full per-element detail to overlap-scan-results.json.
//
// Run: node scripts/feds-lnav-overlap-scan.mjs

import { chromium } from '@playwright/test';
import fs from 'node:fs';

// Locale list inlined to avoid ESM-in-CJS import issue (data/feds-lnav-locales.js uses
// `export` syntax but the project's package.json has no "type":"module", so plain Node
// can't import it. Playwright's test runner handles that via Babel, but a standalone
// script can't.  Keep this in sync with data/feds-lnav-locales.js when locales change.
const fedsLnavLocales = [
  { code: 'us',      prefix: '/',         name: 'United States' },
  { code: 'il_en',   prefix: '/il_en/',   name: 'Israel English' },
  { code: 'ae_en',   prefix: '/ae_en/',   name: 'UAE English' },
  { code: 'sa_en',   prefix: '/sa_en/',   name: 'Saudi Arabia English' },
  { code: 'vn_en',   prefix: '/vn_en/',   name: 'Vietnam English' },
  { code: 'cis_en',  prefix: '/cis_en/',  name: 'CIS English' },
  { code: 'ca',      prefix: '/ca/',      name: 'Canada English' },
  { code: 'mena_en', prefix: '/mena_en/', name: 'MENA English' },
  { code: 'th_en',   prefix: '/th_en/',   name: 'Thailand English' },
  { code: 'ph_en',   prefix: '/ph_en/',   name: 'Philippines English' },
  { code: 'id_en',   prefix: '/id_en/',   name: 'Indonesia English' },
  { code: 'uk',      prefix: '/uk/',      name: 'United Kingdom' },
  { code: 'au',      prefix: '/au/',      name: 'Australia' },
  { code: 'africa',  prefix: '/africa/',  name: 'Africa' },
  { code: 'be_en',   prefix: '/be_en/',   name: 'Belgium English' },
  { code: 'gr_en',   prefix: '/gr_en/',   name: 'Greece English' },
  { code: 'hk_en',   prefix: '/hk_en/',   name: 'Hong Kong English' },
  { code: 'ie',      prefix: '/ie/',      name: 'Ireland' },
  { code: 'in',      prefix: '/in/',      name: 'India English' },
  { code: 'lu_en',   prefix: '/lu_en/',   name: 'Luxembourg English' },
  { code: 'nz',      prefix: '/nz/',      name: 'New Zealand' },
  { code: 'sg',      prefix: '/sg/',      name: 'Singapore' },
  { code: 'my_en',   prefix: '/my_en/',   name: 'Malaysia English' },
  { code: 'ng',      prefix: '/ng/',      name: 'Nigeria' },
  { code: 'qa_en',   prefix: '/qa_en/',   name: 'Qatar English' },
  { code: 'eg_en',   prefix: '/eg_en/',   name: 'Egypt English' },
  { code: 'za',      prefix: '/za/',      name: 'South Africa' },
  { code: 'kw_en',   prefix: '/kw_en/',   name: 'Kuwait English' },
  { code: 'de',      prefix: '/de/',      name: 'Germany' },
  { code: 'lu_de',   prefix: '/lu_de/',   name: 'Luxembourg German' },
  { code: 'ch_de',   prefix: '/ch_de/',   name: 'Switzerland German' },
  { code: 'at',      prefix: '/at/',      name: 'Austria' },
  { code: 'fr',      prefix: '/fr/',      name: 'France' },
  { code: 'be_fr',   prefix: '/be_fr/',   name: 'Belgium French' },
  { code: 'ch_fr',   prefix: '/ch_fr/',   name: 'Switzerland French' },
  { code: 'lu_fr',   prefix: '/lu_fr/',   name: 'Luxembourg French' },
  { code: 'ca_fr',   prefix: '/ca_fr/',   name: 'Canada French' },
  { code: 'jp',      prefix: '/jp/',      name: 'Japan' },
  { code: 'mena_ar', prefix: '/mena_ar/', name: 'MENA Arabic' },
  { code: 'sa_ar',   prefix: '/sa_ar/',   name: 'Saudi Arabia Arabic' },
  { code: 'ae_ar',   prefix: '/ae_ar/',   name: 'UAE Arabic' },
  { code: 'qa_ar',   prefix: '/qa_ar/',   name: 'Qatar Arabic' },
  { code: 'kw_ar',   prefix: '/kw_ar/',   name: 'Kuwait Arabic' },
  { code: 'eg_ar',   prefix: '/eg_ar/',   name: 'Egypt Arabic' },
  { code: 'il_he',   prefix: '/il_he/',   name: 'Israel Hebrew' },
  { code: 'bg',      prefix: '/bg/',      name: 'Bulgaria' },
  { code: 'cz',      prefix: '/cz/',      name: 'Czech Republic' },
  { code: 'dk',      prefix: '/dk/',      name: 'Denmark' },
  { code: 'es',      prefix: '/es/',      name: 'Spain' },
  { code: 'ee',      prefix: '/ee/',      name: 'Estonia' },
  { code: 'fi',      prefix: '/fi/',      name: 'Finland' },
  { code: 'gr_el',   prefix: '/gr_el/',   name: 'Greece Greek' },
  { code: 'hu',      prefix: '/hu/',      name: 'Hungary' },
  { code: 'it',      prefix: '/it/',      name: 'Italy' },
  { code: 'ch_it',   prefix: '/ch_it/',   name: 'Switzerland Italian' },
  { code: 'kr',      prefix: '/kr/',      name: 'Korea' },
  { code: 'lt',      prefix: '/lt/',      name: 'Lithuania' },
  { code: 'lv',      prefix: '/lv/',      name: 'Latvia' },
  { code: 'nl',      prefix: '/nl/',      name: 'Netherlands' },
  { code: 'be_nl',   prefix: '/be_nl/',   name: 'Belgium Dutch' },
  { code: 'no',      prefix: '/no/',      name: 'Norway' },
  { code: 'pl',      prefix: '/pl/',      name: 'Poland' },
  { code: 'pt',      prefix: '/pt/',      name: 'Portugal' },
  { code: 'br',      prefix: '/br/',      name: 'Brazil' },
  { code: 'ro',      prefix: '/ro/',      name: 'Romania' },
  { code: 'ru',      prefix: '/ru/',      name: 'Russia' },
  { code: 'cis_ru',  prefix: '/cis_ru/',  name: 'CIS Russian' },
  { code: 'sk',      prefix: '/sk/',      name: 'Slovakia' },
  { code: 'si',      prefix: '/si/',      name: 'Slovenia' },
  { code: 'se',      prefix: '/se/',      name: 'Sweden' },
  { code: 'tr',      prefix: '/tr/',      name: 'Turkey' },
  { code: 'ua',      prefix: '/ua/',      name: 'Ukraine' },
  { code: 'ar',      prefix: '/ar/',      name: 'Argentina' },
  { code: 'la',      prefix: '/la/',      name: 'Latin America' },
  { code: 'mx',      prefix: '/mx/',      name: 'Mexico' },
  { code: 'pe',      prefix: '/pe/',      name: 'Peru' },
  { code: 'cl',      prefix: '/cl/',      name: 'Chile' },
  { code: 'co',      prefix: '/co/',      name: 'Colombia' },
  { code: 'cr',      prefix: '/cr/',      name: 'Costa Rica' },
  { code: 'ec',      prefix: '/ec/',      name: 'Ecuador' },
  { code: 'gt',      prefix: '/gt/',      name: 'Guatemala' },
  { code: 'pr',      prefix: '/pr/',      name: 'Puerto Rico' },
  { code: 'cn',      prefix: '/cn/',      name: 'China' },
  { code: 'tw',      prefix: '/tw/',      name: 'Taiwan' },
  { code: 'hk_zh',   prefix: '/hk_zh/',   name: 'Hong Kong Chinese' },
  { code: 'th_th',   prefix: '/th_th/',   name: 'Thailand Thai' },
  { code: 'ph_fil',  prefix: '/ph_fil/',  name: 'Philippines Filipino' },
  { code: 'id_id',   prefix: '/id_id/',   name: 'Indonesia Indonesian' },
  { code: 'my_ms',   prefix: '/my_ms/',   name: 'Malaysia Malay' },
  { code: 'vn_vi',   prefix: '/vn_vi/',   name: 'Vietnam Vietnamese' },
  { code: 'in_hi',   prefix: '/in_hi/',   name: 'India Hindi' },
];

const BASE_URL    = 'https://main--upp--adobecom.aem.live';
const TEST_PAGE   = '/homepage/drafts/blaishram/redesign-demo-copy?fedsbranch=localnav-new&georouting=off&mep=off';
const CONCURRENCY = 8;
const NAV_TIMEOUT = 25000;
const RENDER_WAIT =  8000;

// Sweep breakpoints used by the FEDs LNav config (configs/feds-lnav.config.js).
// Pick subset via CLI arg, e.g.  node scripts/feds-lnav-overlap-scan.mjs mobile-portrait
// Default = all breakpoints listed below.
const ALL_VIEWPORTS = [
  { name: 'mobile-portrait',   width:  393, height:  852, isMobile: true  },
  { name: 'mobile-landscape',  width:  852, height:  393, isMobile: true  },
  { name: 'tablet-portrait',   width: 1024, height: 1366, isMobile: true  },
  { name: 'tablet-landscape',  width: 1366, height: 1024, isMobile: true  },
  { name: 'desktop-narrow',    width: 1100, height:  800, isMobile: false },
  { name: 'desktop',           width: 1280, height:  800, isMobile: false },
];

const cliArg = process.argv[2];
const VIEWPORTS = cliArg
  ? ALL_VIEWPORTS.filter((v) => v.name === cliArg || (cliArg === 'mobile' && v.isMobile))
  : ALL_VIEWPORTS;
if (VIEWPORTS.length === 0) {
  console.error(`No viewport matches "${cliArg}". Choices: ${ALL_VIEWPORTS.map((v) => v.name).join(', ')}, mobile`);
  process.exit(1);
}

// OneTrust consent cookies so the banner doesn't block the page.
async function setConsentCookies(page, domain) {
  const consentValue = [
    'isGpcEnabled=0',
    'datestamp=Mon+Jan+01+2024',
    'version=202209.1.0',
    'isIABGlobal=false',
    'hosts=',
    'consentId=automation',
    'interactionCount=2',
    'landingPath=NotLandingPage',
    'groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1',
    'AwaitingReconsent=false',
  ].join('&');
  await page.context().addCookies([
    { name: 'OptanonConsent',        value: consentValue,             domain: `.${domain}`, path: '/', secure: true },
    { name: 'OptanonAlertBoxClosed', value: new Date().toISOString(), domain: `.${domain}`, path: '/', secure: true },
  ]);
}

// Detection runs inside the browser context for accurate layout measurements.
function detectInPage() {
  const results = [];
  const nav = document.querySelector('header.global-navigation');
  if (!nav) return [{ type: 'no-nav', detail: 'header.global-navigation not found' }];

  // An element is "visually off-screen" (skip-link, sr-only, etc.) if its bounding rect
  // is wholly outside the viewport or it's effectively invisible. These are intentional
  // a11y patterns ("Skip to main content") — flagging them as overlap is a false positive.
  const viewW = window.innerWidth;
  const viewH = window.innerHeight;
  const isUserVisible = (el) => {
    if (!el.offsetParent) return false;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.opacity === '0') return false;
    if (s.clip && s.clip !== 'auto' && s.clip !== 'unset') return false;
    if (s.clipPath && s.clipPath !== 'none') return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    if (r.right < 0 || r.bottom < 0 || r.left > viewW || r.top > viewH) return false;
    return true;
  };

  // 1. Text-clipped: visible text-bearing elements whose content overflows their box.
  const textEls = nav.querySelectorAll('a, button, span, li, p, div');
  for (const el of textEls) {
    if (!isUserVisible(el)) continue;
    if (!el.textContent || !el.textContent.trim()) continue;
    // Skip wrapper elements that have no direct text child (only nested elements)
    const hasDirectText = Array.from(el.childNodes).some(
      (n) => n.nodeType === 3 && n.textContent.trim(),
    );
    if (el.children.length > 0 && !hasDirectText) continue;
    // Only flag elements that explicitly suppress overflow (i.e. visibly truncated).
    // A plain overflow:visible element won't actually clip the text on screen.
    const s = getComputedStyle(el);
    const clips = s.overflow === 'hidden' || s.overflowX === 'hidden'
                  || s.textOverflow === 'ellipsis';
    if (!clips) continue;
    const overflowPx = el.scrollWidth - el.clientWidth;
    if (overflowPx > 1) {
      results.push({
        type: 'text-clipped',
        text: el.textContent.trim().slice(0, 80),
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 80),
        overflowPx,
      });
    }
  }

  // 2. Siblings overlap: adjacent top-level nav items physically intersect.
  // Direction-agnostic — uses rectangle intersection (works for LTR and RTL layouts).
  const candidates = [
    'header.global-navigation ul.feds-gnav-items > li',
    'header.global-navigation .feds-nav > li',
    'header.global-navigation .feds-topnav > *',
  ];
  for (const selector of candidates) {
    const items = Array.from(document.querySelectorAll(selector)).filter(isUserVisible);
    for (let i = 0; i < items.length - 1; i++) {
      const a = items[i].getBoundingClientRect();
      const b = items[i + 1].getBoundingClientRect();
      if (Math.abs(a.top - b.top) > 5) continue;                     // not on the same row
      const horizontallyOverlap = !(a.right <= b.left || a.left >= b.right);
      if (!horizontallyOverlap) continue;
      const overlapPx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      if (overlapPx > 1) {
        results.push({
          type: 'siblings-overlap',
          selector,
          a: (items[i].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          b: (items[i + 1].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
          overlapPx: Math.round(overlapPx),
        });
      }
    }
  }

  // 3. Nav overflow: last nav item extends past the header's content edge.
  const headerRect = nav.getBoundingClientRect();
  const lastNavItem = nav.querySelector('ul.feds-gnav-items > li:last-child');
  if (lastNavItem && isUserVisible(lastNavItem)) {
    const itemRect = lastNavItem.getBoundingClientRect();
    if (itemRect.right > headerRect.right + 1) {
      results.push({
        type: 'nav-overflows-header',
        overflowPx: Math.round(itemRect.right - headerRect.right),
        lastItem: (lastNavItem.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
      });
    }
  }

  return results;
}

async function scanLocale(browser, locale, viewport) {
  // Mirror features/feds/feds-lnav/feds-lnav.spec.js: strip trailing slash from prefix
  // so prefix + TEST_PAGE doesn't produce `//homepage/...` (which AEM rejects as HTTP 400).
  const path = `${locale.prefix.replace(/\/$/, '')}${TEST_PAGE}`;
  const url  = `${BASE_URL}${path}`;
  const ctx  = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  const page = await ctx.newPage();

  try {
    const domain = new URL(BASE_URL).hostname.replace(/^www\./, '');
    await setConsentCookies(page, domain);

    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    const status = resp?.status() ?? 0;
    if (status === 404 || status === 410) {
      return { locale: locale.code, name: locale.name, viewport: viewport.name, status, skipped: true, reason: `HTTP ${status}` };
    }
    if (status >= 400) {
      return { locale: locale.code, name: locale.name, viewport: viewport.name, status, error: `HTTP ${status}` };
    }

    await page.waitForSelector('header.global-navigation', { timeout: RENDER_WAIT });
    // Settle just enough for the nav to lay out — full networkidle is too slow on mobile.
    await page.waitForTimeout(400);
    const issues = await page.evaluate(detectInPage);

    return { locale: locale.code, name: locale.name, viewport: viewport.name, status, issues };
  } catch (err) {
    return { locale: locale.code, name: locale.name, viewport: viewport.name, error: err.message.split('\n')[0] };
  } finally {
    await ctx.close();
  }
}

async function runInBatches(browser, jobs, size, label) {
  const out = [];
  for (let i = 0; i < jobs.length; i += size) {
    const batch = jobs.slice(i, i + size);
    const batchOut = await Promise.all(batch.map((j) => scanLocale(browser, j.locale, j.viewport)));
    out.push(...batchOut);
    const done = Math.min(i + size, jobs.length);
    const issuesSoFar = out.filter((r) => r.issues?.length > 0).length;
    console.info(`[overlap-scan] ${label}: ${done}/${jobs.length} scanned (${issuesSoFar} with overlap so far)`);
  }
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const start = Date.now();
  const allResults = [];

  for (const viewport of VIEWPORTS) {
    console.info(`\n========= ${viewport.name} (${viewport.width}x${viewport.height}, isMobile=${viewport.isMobile}) =========`);
    const jobs = fedsLnavLocales.map((locale) => ({ locale, viewport }));
    const results = await runInBatches(browser, jobs, CONCURRENCY, viewport.name);
    allResults.push(...results);

    // Per-viewport summary + progressive save, so an interrupt still leaves usable data.
    const vWithIssues = results.filter((r) => r.issues?.length > 0);
    console.info(`\n──── ${viewport.name} immediate summary ────`);
    console.info(`   ${vWithIssues.length} with overlap | ${results.filter((r) => r.skipped).length} skipped (404) | ${results.filter((r) => r.error).length} errored`);
    if (vWithIssues.length > 0) {
      console.table(vWithIssues.map((r) => ({
        locale:  r.locale,
        name:    r.name,
        clipped: r.issues.filter((x) => x.type === 'text-clipped').length,
        siblings: r.issues.filter((x) => x.type === 'siblings-overlap').length,
        navOverflow: r.issues.filter((x) => x.type === 'nav-overflows-header').length,
      })));
    }
    fs.writeFileSync('overlap-scan-results.json', JSON.stringify({
      viewports: VIEWPORTS,
      baseUrl:   BASE_URL,
      testPage:  TEST_PAGE,
      timestamp: new Date().toISOString(),
      partial:   true,
      scans:     allResults,
    }, null, 2));
  }

  await browser.close();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  // ── Per-viewport summary ──────────────────────────────────────────────────
  console.info(`\n[overlap-scan] Done in ${elapsed}s across ${VIEWPORTS.length} viewports × ${fedsLnavLocales.length} locales = ${allResults.length} scans`);

  for (const viewport of VIEWPORTS) {
    const vResults    = allResults.filter((r) => r.viewport === viewport.name);
    const vWithIssues = vResults.filter((r) => r.issues?.length > 0);
    const vSkipped    = vResults.filter((r) => r.skipped);
    const vErrored    = vResults.filter((r) => r.error);

    console.info(`\n──── ${viewport.name} (${viewport.width}x${viewport.height}) ────`);
    console.info(`   ${vWithIssues.length} with overlap | ${vSkipped.length} skipped (404) | ${vErrored.length} errored`);

    if (vWithIssues.length > 0) {
      console.table(vWithIssues.map((r) => ({
        locale:  r.locale,
        name:    r.name,
        clipped: r.issues.filter((x) => x.type === 'text-clipped').length,
        siblings: r.issues.filter((x) => x.type === 'siblings-overlap').length,
        navOverflow: r.issues.filter((x) => x.type === 'nav-overflows-header').length,
      })));
    }
  }

  // ── Locales-affected-anywhere roll-up ─────────────────────────────────────
  const affectedSet = new Map();
  for (const r of allResults) {
    if (!r.issues?.length) continue;
    if (!affectedSet.has(r.locale)) affectedSet.set(r.locale, { name: r.name, viewports: [] });
    affectedSet.get(r.locale).viewports.push(viewportShort(r.viewport, r.issues));
  }
  if (affectedSet.size > 0) {
    console.info(`\n──── ROLLUP — locales affected at ≥1 viewport ────`);
    console.table([...affectedSet.entries()].map(([locale, info]) => ({
      locale,
      name:      info.name,
      viewports: info.viewports.join(', '),
    })));
  } else {
    console.info('\n✓ No locales have header overlap at any tested viewport.');
  }

  fs.writeFileSync('overlap-scan-results.json', JSON.stringify({
    viewports:  VIEWPORTS,
    baseUrl:    BASE_URL,
    testPage:   TEST_PAGE,
    timestamp:  new Date().toISOString(),
    partial:    false,
    summary: {
      totalScans:      allResults.length,
      affectedLocales: affectedSet.size,
      elapsedSec:      Number(elapsed),
    },
    scans: allResults,
  }, null, 2));
  console.info(`\n[overlap-scan] Full per-element detail → overlap-scan-results.json`);
})();

function viewportShort(name, issues) {
  const counts = {
    c: issues.filter((x) => x.type === 'text-clipped').length,
    s: issues.filter((x) => x.type === 'siblings-overlap').length,
    o: issues.filter((x) => x.type === 'nav-overflows-header').length,
  };
  const parts = [];
  if (counts.c) parts.push(`${counts.c}c`);
  if (counts.s) parts.push(`${counts.s}s`);
  if (counts.o) parts.push(`${counts.o}o`);
  return `${name}(${parts.join('+')})`;
}
