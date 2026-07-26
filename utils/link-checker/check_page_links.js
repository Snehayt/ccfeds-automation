#!/usr/bin/env node
/**
 * check_page_links.js
 *
 * Loads one or more pages in Playwright, extracts all links from nav components
 * (breadcrumbs, header/gnav dropdowns, footer), follows redirect chains,
 * checks HTTP status, validates locale consistency, and saves results.
 *
 * Usage:
 *   node utils/link-checker/check_page_links.js <url> [url2 url3 ...]
 *   node utils/link-checker/check_page_links.js --urls pages.csv
 *   node utils/link-checker/check_page_links.js <url> --workers 15 --headed
 */

const { chromium }                        = require('playwright');
const { writeFileSync, mkdirSync, readFileSync } = require('fs');
const { join }                            = require('path');
const { spawn }                           = require('child_process');
const os                                  = require('os');

// Known Adobe locale segments
const ADOBE_LOCALES = new Set([
  'ae','at','au','be_en','be_fr','be_nl','br','ca','ch_de','ch_fr','cn',
  'cz','de','dk','ee','es','fi','fr','gr','hk_en','hr','hu','id_en','ie',
  'il_en','in','it','jp','kr','lt','lu_de','lu_en','lu_fr','lv','mena_ar',
  'mena_en','mt','mx','nl','no','nz','pl','pt','ro','ru','se','sea','sg',
  'si','sk','th_en','tr','tw','ua','uk','vn_en','za',
]);

const MAX_REDIRECTS = 10;
const TIMEOUT_MS    = 15_000;
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*',
};

// CLI
const argv = process.argv.slice(2);

function flagVal(name) {
  const i = argv.indexOf(name);
  return i !== -1 && i + 1 < argv.length ? argv[i + 1] : null;
}

const csvFile = flagVal('--urls');
// Auto-size based on machine: each browser context needs ~300MB RAM, leave 2GB headroom
const cpus          = os.cpus().length;
const freeGb        = os.freemem() / 1024 ** 3;
const autoPageW     = Math.max(2, Math.min(cpus, Math.floor((freeGb - 2) / 0.3)));
const autoWorkers   = Math.max(10, cpus * 3);

const workers     = Math.max(1, Number(flagVal('--workers')      ?? autoWorkers));   // parallel HTTP checks
const pageWorkers = Math.max(1, Number(flagVal('--page-workers') ?? autoPageW));     // concurrent browsers
const headed      = argv.includes('--headed');

// Collect URLs: positional args + CSV file
const argUrls = argv.filter(a => !a.startsWith('--') && /^https?:\/\//.test(a));
const csvUrls = csvFile ? readCsv(csvFile) : [];
const pageUrls = [...new Set([...argUrls, ...csvUrls])];

if (pageUrls.length === 0) {
  console.error([
    '',
    'Usage: node utils/link-checker/check_page_links.js <url> [options]',
    '       node utils/link-checker/check_page_links.js --urls pages.csv [options]',
    '',
    'Options:',
    '  --urls <file.csv>     CSV file with one URL per row (first column)',
    '  --workers <n>         Parallel HTTP fetch workers (default: auto)',
    '  --page-workers <n>    Concurrent browser pages (default: auto, based on RAM)',
    '  --headed              Show browser window',
    '',
    'Examples:',
    '  node utils/link-checker/check_page_links.js https://www.adobe.com/jp/products/photoshop.html',
    '  node utils/link-checker/check_page_links.js --urls pages.csv',
  ].join('\n'));
  process.exit(1);
}


// Helpers
function readCsv(filePath) {
  try {
    return readFileSync(filePath, 'utf8')
      .split('\n')
      .map(line => line.split(',')[0].trim().replace(/^["']|["']$/g, ''))
      .filter(cell => /^https?:\/\//.test(cell));
  } catch (e) {
    console.error(`Cannot read CSV "${filePath}": ${e.message}`);
    process.exit(1);
  }
}

function detectLocale(url) {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean)[0]?.toLowerCase();
    return seg && ADOBE_LOCALES.has(seg) ? seg : null;
  } catch { return null; }
}

function isAdobeUrl(url) {
  try { return /adobe\.com/.test(new URL(url).hostname); } catch { return false; }
}

function detectPageEnv(url) {
  try {
    const h = new URL(url).hostname;
    if (h === 'www.stage.adobe.com') return 'stage';
    if (h === 'www.adobe.com')       return 'prod';
    return null;
  } catch { return null; }
}


function slugify(url) {
  try {
    const u = new URL(url);
    return (u.hostname + u.pathname).replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').slice(0, 60);
  } catch { return 'result'; }
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

const DEFAULT_SELECTORS = {
  headerSel:      'feds-header, header',
  footerSel:      'feds-footer, footer',
  breadcrumbsSel: 'feds-breadcrumbs, nav[aria-label="Breadcrumb"]',
};

async function getPageSelectors(page) {
  const meta = await page.evaluate(() => ({
    header: document.querySelector('meta[name="header"]')?.content ?? null,
    footer: document.querySelector('meta[name="footer"]')?.content ?? null,
  })).catch(() => null);
  if (!meta) return DEFAULT_SELECTORS;
  return {
    headerSel:      meta.header ? `header.${meta.header}` : 'feds-header, header',
    footerSel:      'feds-footer, footer',
    breadcrumbsSel: 'feds-breadcrumbs, nav[aria-label="Breadcrumb"]',
  };
}

async function extractLinks(page, { headerSel, footerSel, breadcrumbsSel }) {
  const map = new Map();

  function add(links) {
    for (const { href, text, source, isCta, isLogo, isSocial } of links) {
      try {
        const u = new URL(href);
        u.hash = '';
        const key = u.toString();
        if (!key.startsWith('http')) continue;
        if (!map.has(key)) map.set(key, {
          text: (text || '').trim().slice(0, 80), source,
          isCta: !!isCta, isLogo: !!isLogo, isSocial: !!isSocial,
        });
      } catch { /* malformed */ }
    }
  }

  const skipped = []; // sections whose selector found nothing on this page

  // Adobe logo — extracted first so breadcrumbs doesn't claim the homepage URL
  const logoLink = await page.evaluate((hSel) => {
    const el = document.querySelector(
      `${hSel} a.feds-brand[href], ${hSel} a[class*="brand"][href], ${hSel} a[class*="logo"][href]`
    );
    if (!el || !/^https?:/.test(el.href)) return null;
    return {
      href: el.href,
      isLogo: true,
      text: el.getAttribute('aria-label') || el.querySelector('img')?.getAttribute('alt') || 'Adobe logo',
    };
  }, headerSel);
  if (logoLink) add([{ ...logoLink, source: 'header' }]);

  // Gnav promo links — extracted before dropdown so duplicates keep 'gnav-promo' label
  const promoSelectors = [
    `${headerSel} .feds-popup-promo a[href]`,
    `${headerSel} .feds-promo a[href]`,
    `${headerSel} [class*="promo"] a[href]`,
  ];
  const promoLinks = await page.evaluate((selectors) => {
    const ctaRe = /con-button|button--|btn-cta|cta-button|\bcta\b/i;
    for (const sel of selectors) {
      const els = [...document.querySelectorAll(sel)].filter(a => /^https?:/.test(a.href));
      if (els.length) {
        return els.map(a => ({
          href: a.href,
          isCta: ctaRe.test(a.className),
          text: (a.innerText||a.textContent||'').trim()||a.getAttribute('aria-label')||a.getAttribute('title')||a.querySelector('img')?.getAttribute('alt')||'',
        }));
      }
    }
    return [];
  }, promoSelectors);
  add(promoLinks.map(l => ({ ...l, source: 'gnav-promo' })));

  // Gnav dropdown links
  const dropSelectors = [
    `${headerSel} .feds-popup a[href]`,
    `${headerSel} [class*="popup"] a[href]`,
    `${headerSel} [class*="dropdown"] a[href]`,
    `${headerSel} [class*="nav-dropdown"] a[href]`,
  ];
  const dropLinks = await page.evaluate((selectors) => {
    const ctaRe = /con-button|button--|btn-cta|cta-button|\bcta\b/i;
    for (const sel of selectors) {
      const els = [...document.querySelectorAll(sel)].filter(a => /^https?:/.test(a.href));
      if (els.length) {
        return els.map(a => ({
          href: a.href,
          isCta: ctaRe.test(a.className),
          text: (a.innerText||a.textContent||'').trim()||a.getAttribute('aria-label')||a.getAttribute('title')||a.querySelector('img')?.getAttribute('alt')||'',
        }));
      }
    }
    return [];
  }, dropSelectors);
  add(dropLinks.map(l => ({ ...l, source: 'gnav-dropdown' })));

  // Static scans: breadcrumbs, header, footer
  const components = [
    { name: 'breadcrumbs', sel: breadcrumbsSel },
    { name: 'header',      sel: headerSel },
    { name: 'footer',      sel: footerSel },
  ];

  for (const { name, sel } of components) {
    if (!await page.locator(sel).count()) {
      skipped.push(name);
      continue;
    }
    const links = await page.locator(`${sel} a[href]`).evaluateAll(
      (els, src) => {
        const ctaRe    = /con-button|button--|btn-cta|cta-button|\bcta\b/i;
        const socialRe = /\b(facebook|twitter|instagram|linkedin|youtube|pinterest|tiktok|snapchat|reddit|x\.com)\b/i;
        const logoRe   = /feds-brand|feds-logo|global-logo|header-logo/i;
        return els
          .filter(a => /^https?:/.test(a.href))
          .map(a => ({
            href: a.href, source: src,
            isCta:    ctaRe.test(a.className),
            isLogo:   logoRe.test(a.className) || logoRe.test(a.parentElement?.className || '') || !!a.closest('[class*="brand"],[class*="logo"]'),
            isSocial: socialRe.test(new URL(a.href).hostname),
            text: (a.innerText||a.textContent||'').trim()||a.getAttribute('aria-label')||a.getAttribute('title')||a.querySelector('img')?.getAttribute('alt')||'',
          }));
      },
      name
    );
    add(links);
  }

  return { map, skipped };
}

async function followRedirects(url) {
  const chain   = [];
  let   current = url;

  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    try {
      let res = await fetch(current, {
        method: 'HEAD', headers: FETCH_HEADERS, redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 405 || res.status === 403) {
        const get = await fetch(current, {
          method: 'GET', headers: FETCH_HEADERS, redirect: 'manual',
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        await get.body?.cancel();
        res = get;
      }
      chain.push({ url: current, status: res.status });
      if (res.status >= 300 && res.status < 400) {
        let loc = res.headers.get('location');
        if (!loc) break;
        if (!loc.startsWith('http')) loc = new URL(loc, current).toString();
        current = loc;
      } else break;
    } catch (e) {
      chain.push({ url: current, status: 0, error: e.name === 'TimeoutError' ? 'TIMEOUT' : e.constructor.name });
      break;
    }
  }

  const last = chain.at(-1);
  return {
    chain,
    finalUrl:      last?.url    ?? url,
    finalStatus:   last?.status ?? 0,
    error:         last?.error  ?? null,
    wasRedirected: chain.length > 1,
  };
}


async function loadPage(ctx, url) {
  const page     = await ctx.newPage();
  const response = await page.goto(url, { waitUntil: 'load', timeout: 60_000 }).catch(() => null);

  // AT Target can fire a client-side navigation after 'load' — wait for it to settle
  await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => {});

  const pageStatus   = response?.status() ?? null;
  const pageFinalUrl = page.url();
  const pageRedirected = /^https?:\/\//.test(pageFinalUrl)
    && pageFinalUrl !== url
    && new URL(pageFinalUrl).href !== new URL(url).href;

  const { headerSel, footerSel, breadcrumbsSel } = await getPageSelectors(page);

  // Scroll to trigger lazy-loaded footer; wrapped in try-catch because
  // pages with AT preview tokens can redirect mid-load, destroying the JS context.
  try {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForFunction(
      () => {
        const footer = document.querySelector('feds-footer') || document.querySelector('footer');
        return footer && footer.querySelectorAll('a[href]').length > 0;
      },
      { timeout: 8_000, polling: 200 }
    ).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0));
  } catch { /* page navigated mid-scroll — continue with captured content */ }

  const { map: linkMap, skipped } = await extractLinks(page, { headerSel, footerSel, breadcrumbsSel })
    .catch(() => ({ map: new Map(), skipped: [] }));
  await page.close();
  return { linkMap, skipped, pageStatus, pageFinalUrl, pageRedirected };
}

function generateHtml(allPageData, runAt) {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const DASH_SECTIONS   = ['header', 'breadcrumbs', 'footer'];
  const DETAIL_SECTIONS = ['header', 'gnav-dropdown', 'gnav-promo', 'breadcrumbs', 'footer'];

  // Colored circle badge: green=0, orange=1-5, red=6+
  function badge(n) {
    const cls = n === 0 ? 'bg-green' : n <= 5 ? 'bg-orange' : 'bg-red';
    return `<span class="circle ${cls}">${n}</span>`;
  }

  const dashRows = allPageData.map(({ pageUrl, results, pageStatus, pageFinalUrl, pageRedirected }, idx) => {
    const cells = DASH_SECTIONS.map(src => {
      const rows       = results.filter(r => r.source === src);
      const http4xx    = rows.filter(r => r.finalStatus >= 400).length;
      const localeDrop = rows.filter(r => r.issues.some(i => i.includes('locale'))).length;
      const envMiss    = rows.filter(r => r.issues.some(i => i.includes('env-mismatch'))).length;
      return `<td class="dc">${badge(http4xx)}</td><td class="dc">${badge(localeDrop)}</td><td class="dc">${badge(envMiss)}</td>`;
    }).join('');

    const statusCls = !pageStatus ? '' : pageStatus >= 400 ? 'ps-error' : pageStatus >= 300 ? 'ps-warn' : 'ps-ok';
    const statusBadge = pageStatus ? `<span class="page-status ${statusCls}">${pageStatus}</span>` : '';
    const redirectBadge = pageRedirected ? `<span class="page-status ps-warn">redirected</span>` : '';
    const redirectLine = pageRedirected
      ? `<div class="page-redir">&#8618; <a href="${esc(pageFinalUrl)}" target="_blank">${esc(pageFinalUrl)}</a></div>`
      : '';

    return `<tr>
      <td class="num-cell">${idx + 1}</td>
      <td class="page-cell">
        <a class="jump-link" href="${esc(pageUrl)}" target="_blank" onclick="event.preventDefault();jumpTo('${esc(slugify(pageUrl))}')">${esc(pageUrl)}</a>${statusBadge}${redirectBadge}
        ${redirectLine}
      </td>
      ${cells}
    </tr>`;
  }).join('');

  function rowCls(r) {
    if (r.issues.some(i => i.startsWith('HTTP') || i === 'TIMEOUT')) return 'row-error';
    if (r.issues.some(i => i.includes('locale'))) return 'row-locale';
    if (r.issues.some(i => i.includes('env-mismatch'))) return 'row-locale';
    return 'row-ok';
  }

  function linkRow(r) {
    const redirected  = r.finalUrl !== r.originalUrl;
    const localeIssue = r.issues.find(i => i.includes('locale'));
    const otherIssues = r.issues.filter(i => !i.includes('locale'));
    const allIssues   = [
      ...otherIssues,
      localeIssue ? localeIssue.replace('locale-drop: expected ','exp ').replace(', got ',', got ') : null,
    ].filter(Boolean);

    return `<tr class="${rowCls(r)}">
      <td class="url-cell"><a href="${esc(r.originalUrl)}" target="_blank">${esc(r.originalUrl)}</a></td>
      <td class="st-cell">${esc(r.error ?? r.finalStatus ?? '')}</td>
      <td class="src-cell">
        <span class="src-${r.source.replace(/-/g,'')}">${esc(r.source)}</span>
        ${r.isLogo   ? '<span class="dot-tag" style="background:#f59e0b" title="Adobe Logo">L</span>'    : ''}
        ${r.isSocial ? '<span class="dot-tag" style="background:#7e22ce" title="Social link">S</span>'   : ''}
        ${r.isCta && r.source !== 'cta' ? '<span class="dot-tag" style="background:#b45309" title="CTA button">C</span>' : ''}
      </td>
      <td class="is-cell">${allIssues.map(i => `<span class="issue-tag">${esc(i)}</span>`).join('<br>')}</td>
      <td class="rd-cell">${redirected ? `<a href="${esc(r.finalUrl)}" target="_blank" class="final-url" title="${esc(r.finalUrl)}">${esc(r.finalUrl.length > 80 ? r.finalUrl.slice(0, 80) + '...' : r.finalUrl)}</a>` : '<span class="dim">&mdash;</span>'}</td>
      <td class="tx-cell">${esc(r.text)}</td>
    </tr>`;
  }

  const DETAIL_HEAD = `<tr>
    <th class="url-cell">URL</th>
    <th class="st-cell">Status</th>
    <th class="src-cell">Section / Tags</th>
    <th class="is-cell">Issues</th>
    <th class="rd-cell">Redirects To</th>
    <th class="tx-cell">Link Text</th>
  </tr>`;

  const pageSections = allPageData.map(({ pageUrl, results, skipped = [], pageStatus, pageFinalUrl, pageRedirected }) => {
    // Sort by section order, then broken first within each section
    const sectionOrder = src => { const i = DETAIL_SECTIONS.indexOf(src); return i === -1 ? 99 : i; };
    const sorted = [...results].sort((a, b) =>
      sectionOrder(a.source) - sectionOrder(b.source) || (b.isError ? 1 : 0) - (a.isError ? 1 : 0)
    );
    const broken = results.filter(r => r.isError);

    // Page-level banner: redirect or error status
    let pageBanner = '';
    if (pageStatus >= 400) {
      pageBanner = `<div class="page-banner page-banner-error">Page returned HTTP ${pageStatus} &mdash; header/footer links still scanned</div>`;
    } else if (pageRedirected) {
      pageBanner = `<div class="page-banner page-banner-warn">Page redirected &#8594; <a href="${esc(pageFinalUrl)}" target="_blank">${esc(pageFinalUrl)}</a></div>`;
    }

    const pill = broken.length
      ? `<span class="pill-bad">${broken.length} issue${broken.length > 1 ? 's' : ''}</span>`
      : `<span class="pill-ok">&#10004; All OK</span>`;

    const skippedBadges = skipped.map(s =>
      `<span class="pill-skip">${esc(s)}: not found</span>`
    ).join('');

    return `<details id="${esc(slugify(pageUrl))}" data-url="${esc(pageUrl)}" >
    <summary><a class="page-url" href="${esc(pageUrl)}" target="_blank" onclick="event.stopPropagation()">${esc(pageUrl)}</a> <span class="sec-count">${results.length} links</span>${pill}${skippedBadges}</summary>
    ${pageBanner}
    <table class="detail-table"><thead>${DETAIL_HEAD}</thead><tbody>${sorted.map(linkRow).join('')}</tbody></table>
  </details>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Link Check Report</title>
<style>
  * { box-sizing: border-box; }
  body        { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px 32px; background: #f5f5f5; color: #222; font-size: 13px; }
  h1          { font-size: 1.25rem; margin: 0 0 3px; }
  .meta       { color: #888; font-size: 0.78rem; margin-bottom: 22px; }

  /* Dashboard */
  .dash       { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #ddd; margin-bottom: 36px; }
  .dash th, .dash td { padding: 8px 14px; border: 1px solid #e4e4e4; text-align: center; }
  .num-head  { width: 36px; text-align: center; }
  .num-cell  { text-align: center; color: #aaa; font-size: 0.75rem; white-space: nowrap; }
  .dash .page-cell    { text-align: left; font-size: 0.82rem; min-width: 300px; }
  .dash .page-cell a  { color: #1473e6; text-decoration: none; word-break: break-all; }
  .dash .page-cell a:hover { text-decoration: underline; }
  .page-status { display:inline-block; margin-left:7px; padding:1px 7px; border-radius:10px; font-size:0.72rem; font-weight:700; vertical-align:middle; }
  .ps-ok       { background:#e8f5f0; color:#2d9d78; }
  .ps-warn     { background:#fff8e1; color:#7a5000; }
  .ps-error    { background:#fde8e8; color:#c00; }
  .page-redir  { font-size:0.75rem; color:#888; margin-top:3px; word-break:break-all; }
  .page-redir a { color:#888; }
  .sec-head   { background: #2c2c2c; color: #fff; font-size: 0.75rem; letter-spacing: .05em; text-transform: uppercase; }
  .sub-head   { background: #444; color: #ccc; font-size: 0.7rem; font-weight: 400; }
  .dc         { text-align: center; padding: 6px; }

  /* Colored circles */
  .circle     { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; color: #fff; font-weight: 700; font-size: 0.82rem; }
  .bg-green   { background: #2d9d78; }
  .bg-orange  { background: #e68619; }
  .bg-red     { background: #d7373f; }

  /* Detail sections */
  details       { margin: 6px 0; background: #fff; border: 1px solid #ddd; border-left: 4px solid #ccc; }
  details[open] { border-left-color: #d7373f; }
  details summary { cursor: pointer; padding: 9px 12px; font-size: 0.88rem; list-style: none; display: flex; align-items: center; gap: 8px; user-select: none; background: #fafafa; }
  details summary::-webkit-details-marker { display: none; }
  details summary::before { content: '\\25B6'; font-size: 0.6rem; color: #aaa; flex-shrink: 0; }
  details[open] summary::before { content: '\\25BC'; }
  .page-url   { color: #1473e6; font-weight: 600; word-break: break-all; }
  h3          { font-size: 0.82rem; font-weight: 600; margin: 14px 0 5px; color: #444; }
  .sec-count  { font-weight: 400; color: #999; margin: 0 4px; }
  .pill-ok    { background: #e8f5f0; color: #2d9d78; padding: 1px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 600; }
  .pill-bad   { background: #fde8e9; color: #d7373f; padding: 1px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 600; }
  .pill-skip  { background: #f3f3f3; color: #888; padding: 1px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 400; border: 1px dashed #ccc; }
  .page-banner      { padding: 8px 14px; font-size: 0.82rem; border-bottom: 1px solid transparent; }
  .page-banner a    { color: inherit; font-weight: 600; }
  .page-banner-error { background: #fde8e8; color: #c00; border-color: #f5b8b8; }
  .page-banner-warn  { background: #fff8e1; color: #7a5000; border-color: #ffe08a; }

  .detail-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #ddd; }
  .detail-table thead th { background: #444; color: #fff; padding: 6px 10px; font-size: 0.75rem; text-align: left; white-space: nowrap; border-right: 1px solid #666; }
  .detail-table thead th:last-child { border-right: none; }
  .detail-table td       { padding: 6px 10px; border-bottom: 1px solid #d8d8d8; vertical-align: top; font-size: 0.78rem; }
  .detail-table tr:last-child td { border-bottom: none; }
  .detail-table tr.row-error  { background: #fde8e8; }
  .detail-table tr.row-locale { background: #fef9c3; }

  /* Status and Section/Tags shrink to content; URL and Redirect get proportional hints */
  .url-cell        { width: 28%; }
  .url-cell a      { color: #1473e6; text-decoration: none; word-break: break-all; display: block; }
  .url-cell a:hover{ text-decoration: underline; }
  .st-cell         { width: 65px; white-space: nowrap; text-align: center; font-weight: 600; }
  .src-cell        { width: 1%; white-space: nowrap; }
  .is-cell         { width: 1%; white-space: nowrap; }
  .rd-cell         { width: 20%; word-break: break-all; }
  .rd-cell .final-url { color: #888; font-size: 0.75rem; }
  .tx-cell         { width: 25%; word-break: break-word; color: #666; }

  .issue-tag  { display: inline-block; background: #fde8e9; color: #d7373f; padding: 1px 6px; border-radius: 3px; font-size: 0.75rem; }
  .dim        { color: #aaa; font-style: italic; }
  /* Section source badges */
  span[class^="src-"] { display:inline-block; padding:1px 7px; border-radius:3px; font-size:0.72rem; font-weight:600; white-space:nowrap; }
  .src-header       { background:#e8f0fe; color:#1a73e8; }
  .src-gnavdropdown { background:#e3f3ff; color:#0265d4; }
  .src-gnavpromo    { background:#fce4ff; color:#8b00c9; }
  .src-breadcrumbs  { background:#f3e8ff; color:#7c3aed; }
  .src-footer       { background:#e8f5e9; color:#2d6a2d; }
.dot-tag   { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; color:#fff; font-size:0.6rem; font-weight:700; margin-left:3px; vertical-align:middle; cursor:default; }
  /* Toolbar */
  .toolbar    { position:sticky; top:0; z-index:100; display:flex; align-items:center; gap:10px; padding:8px 12px; background:#fff; border:1px solid #ddd; border-radius:6px; margin-bottom:16px; box-shadow:0 2px 6px rgba(0,0,0,.08); flex-wrap:wrap; }
  .btn-toggle { padding:4px 12px; border:1px solid #bbb; border-radius:4px; background:#fff; cursor:pointer; font-size:0.8rem; color:#333; white-space:nowrap; }
  .btn-toggle:hover { background:#eee; }
  .btn-toggle.active { background:#1473e6; color:#fff; border-color:#1473e6; }
  .filter-box { flex:1; min-width:180px; padding:4px 10px; border:1px solid #bbb; border-radius:4px; font-size:0.8rem; outline:none; }
  .filter-box:focus { border-color:#1473e6; }
  .filter-count { font-size:0.75rem; color:#888; white-space:nowrap; }
  .issues-only .row-ok { display:none; }
  details.hidden { display:none; }
  /* Back to top */
  #back-top { position:fixed; bottom:24px; right:28px; padding:7px 13px; background:#1473e6; color:#fff; border:none; border-radius:20px; font-size:0.78rem; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.2); opacity:0; transition:opacity .2s; pointer-events:none; z-index:200; }
  #back-top.visible { opacity:1; pointer-events:auto; }
  /* dash link to section */
  .dash .page-cell .jump-link { color:#1473e6; text-decoration:none; word-break:break-all; }
  .dash .page-cell .jump-link:hover { text-decoration:underline; }
</style>
<script>
function toggleIssues(btn) {
  document.body.classList.toggle('issues-only');
  btn.classList.toggle('active');
  btn.textContent = btn.classList.contains('active') ? 'Show all links' : 'Issues only';
}
function expandAll() {
  document.querySelectorAll('details:not(.hidden)').forEach(d => d.open = true);
}
function collapseAll() {
  document.querySelectorAll('details:not(.hidden)').forEach(d => d.open = false);
}
function filterPages(val) {
  const q = val.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('details[data-url]').forEach(d => {
    const match = !q || d.dataset.url.toLowerCase().includes(q);
    d.classList.toggle('hidden', !match);
    if (match) shown++;
  });
  const total = document.querySelectorAll('details[data-url]').length;
  document.getElementById('filter-count').textContent = q ? shown + ' of ' + total + ' pages' : total + ' pages';
}
function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.open = true;
  el.classList.remove('hidden');
  setTimeout(() => el.scrollIntoView({ behavior:'smooth', block:'start' }), 50);
}
window.addEventListener('scroll', function() {
  document.getElementById('back-top').classList.toggle('visible', window.scrollY > 300);
});
</script>
</head>
<body>
<button id="back-top" onclick="window.scrollTo({top:0,behavior:'smooth'})">&#8593; Top</button>
<h1>Link Check Report</h1>
<p class="meta">
  Run at: ${esc(runAt)}
  &nbsp;|&nbsp; ${allPageData.length} page${allPageData.length > 1 ? 's' : ''}
</p>
<div class="toolbar">
  <button class="btn-toggle" onclick="toggleIssues(this)">Issues only</button>
  <button class="btn-toggle" onclick="expandAll()">Expand all</button>
  <button class="btn-toggle" onclick="collapseAll()">Collapse all</button>
  <input class="filter-box" type="text" placeholder="Filter pages by URL..." oninput="filterPages(this.value)" />
  <span class="filter-count" id="filter-count">${allPageData.length} pages</span>
</div>

<table class="dash">
  <thead>
    <tr>
      <th class="sec-head num-head" rowspan="2">#</th>
      <th class="sec-head" rowspan="2">URL</th>
      ${DASH_SECTIONS.map(s => `<th colspan="3" class="sec-head">${s.toUpperCase()}</th>`).join('')}
    </tr>
    <tr>${DASH_SECTIONS.map(() => `<th class="sub-head">4xx/5xx</th><th class="sub-head">Locale Drop</th><th class="sub-head">Env Mismatch</th>`).join('')}</tr>
  </thead>
  <tbody>${dashRows}</tbody>
</table>

${pageSections}
</body>
</html>`;
}


// ── Concurrency pool — runs fn(item, index) with at most N contexts in-flight ─
async function runWithPool(items, concurrency, fn) {
  const results = new Array(items.length);
  const queue   = items.map((item, i) => ({ item, i }));
  async function worker() {
    while (queue.length) {
      const { item, i } = queue.shift();
      results[i] = await fn(item, i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function saveHtml(html, label) {
  const dir      = join(__dirname, 'results');
  mkdirSync(dir, { recursive: true });
  const filepath = join(dir, `${timestamp()}-${label}-report.html`);
  writeFileSync(filepath, html);
  return filepath;
}

async function main() {
  const runAt      = new Date().toISOString();
  const totalStart = Date.now();

  const browser = await chromium.launch({ headless: !headed, args: ['--disable-http2'] });

  const ctxOptions = {
    userAgent: FETCH_HEADERS['User-Agent'],
    ignoreHTTPSErrors: true,
    viewport: { width: 1167, height: 900 },
  };

  // Phase 1 — extract links from all pages (pool of browsers, no HTTP checks yet)
  console.log(`\nStep 1: Loading ${pageUrls.length} page(s) and extracting links...\n`);
  const pageExtracts = await runWithPool(pageUrls, pageWorkers, async (url, i) => {
    const ctx = await browser.newContext(ctxOptions);
    console.log(`  [${i + 1}/${pageUrls.length}] ${url}`);
    const data = await loadPage(ctx, url);
    await ctx.close();
    return { url, ...data };
  });
  await browser.close();

  // Phase 2 — deduplicate all URLs across all pages, check each unique URL once
  const uniqueCheckMap = new Map(); // checkUrl -> result (filled after checks)
  for (const { linkMap } of pageExtracts) {
    for (const [url] of linkMap) {
      if (!uniqueCheckMap.has(url)) uniqueCheckMap.set(url, null);
    }
  }
  const uniqueUrls = [...uniqueCheckMap.keys()];
  console.log(`\nStep 2: Checking ${uniqueUrls.length} links for 404s...\n`);

  // Check all unique URLs in one parallel pass
  const queue = [...uniqueUrls];
  let done = 0;
  async function httpWorker() {
    while (queue.length) {
      const url    = queue.shift();
      const result = await followRedirects(url);
      uniqueCheckMap.set(url, result);
      done++;
      if (done % 50 === 0) process.stdout.write(`  ${done}/${uniqueUrls.length} done...\r`);
    }
  }
  await Promise.all(Array.from({ length: workers }, httpWorker));
  console.log(`  Done. ${uniqueUrls.length} URLs checked.          `);

  // Phase 3 — map results back to each page and build report data
  const allPageData = pageExtracts.map(({ url: pageUrl, linkMap, skipped, pageStatus, pageFinalUrl, pageRedirected }) => {
    const expectedLocale = detectLocale(pageUrl);
    const pageEnv        = detectPageEnv(pageUrl);

    const results = [...linkMap.entries()].map(([originalUrl, meta]) => {
      const { chain, finalUrl, finalStatus, error, wasRedirected } = uniqueCheckMap.get(originalUrl) ?? {};
      const issues = [];
      if (error) {
        issues.push(error);
      } else if (!finalStatus || finalStatus >= 400) {
        issues.push(`HTTP ${finalStatus ?? 0}`);
      }
      if (!error && finalStatus > 0 && finalStatus < 400) {
        if (expectedLocale && isAdobeUrl(finalUrl)) {
          const fl = detectLocale(finalUrl);
          if (fl !== expectedLocale) issues.push(`locale-drop: expected /${expectedLocale}/, got /${fl ?? 'none'}/`);
        }
        if (pageEnv) {
          try {
            const fh = new URL(finalUrl).hostname;
            if (/^www(\.stage)?\.adobe\.com$/.test(fh)) {
              const fe = fh === 'www.stage.adobe.com' ? 'stage' : 'prod';
              if (fe !== pageEnv) issues.push(`env-mismatch: page is ${pageEnv}, link resolved to ${fe}`);
            }
          } catch {}
        }
      }
      return {
        originalUrl, finalUrl, finalStatus, chain, wasRedirected, error,
        issues, isError: issues.length > 0,
        text: meta.text, source: meta.source,
        isCta: meta.isCta, isLogo: meta.isLogo, isSocial: meta.isSocial, location: meta.location,
      };
    });

    const broken = results.filter(r => r.isError);
    const summary = {
      total:       results.length,
      broken:      broken.length,
      http4xx:     results.filter(r => r.finalStatus >= 400).length,
      localeDrop:  results.filter(r => r.issues.some(i => i.includes('locale'))).length,
      envMismatch: results.filter(r => r.issues.some(i => i.includes('env-mismatch'))).length,
    };
    return { pageUrl, results, summary, skipped, pageStatus, pageFinalUrl, pageRedirected };
  });

  const label    = pageUrls.length === 1 ? slugify(pageUrls[0]) : `${pageUrls.length}-pages`;
  const html     = generateHtml(allPageData, runAt);
  const htmlPath = saveHtml(html, label);

  const [bin, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', htmlPath]]
                    : process.platform === 'darwin' ? ['open', [htmlPath]]
                    : ['xdg-open', [htmlPath]];
  spawn(bin, args, { detached: true, stdio: 'ignore' }).unref();

  console.log(`\nReport: ${htmlPath}`);

  const totalBroken = allPageData.reduce((n, d) => n + d.summary.broken, 0);
  process.exit(totalBroken > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
