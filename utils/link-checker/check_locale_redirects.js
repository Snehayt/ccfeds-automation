#!/usr/bin/env node
/**
 * check_locale_redirects.js
 *
 * For each given Adobe.com page, builds the same 21 locale-path variants used in
 * lingoEnRootRedirectFeatures (features/lingo-en/lingo.spec.js), requests each,
 * and reports whether it redirects to the US base page (https://www.adobe.com/<page>).
 *
 * Usage:
 *   node utils/link-checker/check_locale_redirects.js <page> [page2 page3 ...]
 *   node utils/link-checker/check_locale_redirects.js --urls pages.txt
 *   node utils/link-checker/check_locale_redirects.js --urls pages.txt --stage
 *
 * Pages can be given as full URLs (any host — it's stripped and replaced with
 * the target host) or bare paths, e.g.:
 *   https://www.adobe.com/products/catalog.html
 *   /products/catalog.html
 *
 * By default requests hit prod (www.adobe.com). Pass --stage to hit
 * www.stage.adobe.com instead, or --host <host> for a custom host.
 */

const { writeFileSync, mkdirSync, readFileSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const MAX_REDIRECTS = 10;
const TIMEOUT_MS    = 15_000;

// Same 21 locale path prefixes as lingoEnRootRedirectFeatures in features/lingo-en/lingo.spec.js
const LOCALES = [
  'il_en', 'ae_en', 'sa_en', 'vn_en', 'ca', 'th_en', 'ph_en', 'id_en', 'be_en', 'gr_en',
  'hk_en', 'ie', 'lu_en', 'nz', 'sg', 'my_en', 'ng', 'qa_en', 'eg_en', 'za', 'kw_en',
];

// CLI
const argv = process.argv.slice(2);
function flagVal(name) {
  const i = argv.indexOf(name);
  return i !== -1 && i + 1 < argv.length ? argv[i + 1] : null;
}
const listFile  = flagVal('--urls');
const customHost = flagVal('--host');
const HOST = customHost ? customHost.replace(/\/+$/, '')
  : argv.includes('--stage') ? 'https://www.stage.adobe.com'
  : 'https://www.adobe.com';
const argPages  = argv.filter(a => !a.startsWith('--') && a !== listFile && a !== customHost);
const filePages = listFile
  ? readFileSync(listFile, 'utf8').split('\n').map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && !l.startsWith('//'))
  : [];
const pages = [...new Set([...argPages, ...filePages])];

if (pages.length === 0) {
  console.error([
    '',
    'Usage: node utils/link-checker/check_locale_redirects.js <page> [page2 ...]',
    '       node utils/link-checker/check_locale_redirects.js --urls pages.txt',
    '',
    'Examples:',
    '  node utils/link-checker/check_locale_redirects.js /products/catalog.html',
    '  node utils/link-checker/check_locale_redirects.js https://www.adobe.com/downloads.html',
  ].join('\n'));
  process.exit(1);
}

function normalizePath(page) {
  try {
    if (/^https?:\/\//.test(page)) return new URL(page).pathname.replace(/^\/+/, '');
    return page.replace(/^\/+/, '');
  } catch {
    return page.replace(/^\/+/, '');
  }
}

async function followRedirects(url) {
  let current = url;
  const chain = [];
  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    try {
      const res = await fetch(current, {
        method: 'HEAD', redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
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
    finalUrl:    last?.url    ?? url,
    finalStatus: last?.status ?? 0,
    error:       last?.error  ?? null,
    hops:        chain.length - 1,
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function generateHtml(pagesData, runAt, host) {
  const totalUrls = pagesData.reduce((n, p) => n + p.rows.length, 0);
  const totalBad  = pagesData.reduce((n, p) => n + p.notRedirected.length, 0);

  const rowsHtml = pagesData.map(({ page, rows, notRedirected }) => {
    const ok = notRedirected.length === 0;
    const badRowsHtml = notRedirected.map(r => `<tr>
        <td class="locale-cell">${esc(r.locale)}</td>
        <td class="status-cell">${esc(r.finalStatus || r.error || '')}</td>
        <td class="url-cell"><a href="${esc(r.url)}" target="_blank">${esc(r.url)}</a></td>
        <td class="url-cell final">${esc(r.finalUrl)}</td>
      </tr>`).join('');

    return `<details ${ok ? '' : 'open'} class="${ok ? 'page-ok' : 'page-bad'}">
      <summary>
        <span class="badge ${ok ? 'badge-ok' : 'badge-bad'}">${ok ? '✔' : '✘'}</span>
        <span class="page-path">/${esc(page)}</span>
        <span class="page-summary">${ok ? `all ${rows.length} locales redirect to US base` : `${notRedirected.length}/${rows.length} locales did NOT redirect`}</span>
      </summary>
      ${ok ? '' : `<table class="detail-table">
        <thead><tr><th>Locale</th><th>Status</th><th>Requested URL</th><th>Final URL</th></tr></thead>
        <tbody>${badRowsHtml}</tbody>
      </table>`}
    </details>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Locale Redirect Check Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px 32px; background: #f5f5f5; color: #222; font-size: 13px; }
  h1 { font-size: 1.25rem; margin: 0 0 3px; }
  .meta { color: #888; font-size: 0.8rem; margin-bottom: 20px; }
  .summary { display: flex; gap: 14px; margin-bottom: 22px; }
  .stat { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 10px 18px; }
  .stat .n { font-size: 1.4rem; font-weight: 700; }
  .stat .l { font-size: 0.75rem; color: #888; }
  .stat.bad .n { color: #d7373f; }
  .stat.ok .n { color: #2d9d78; }
  details { margin: 6px 0; background: #fff; border: 1px solid #ddd; border-left: 4px solid #ccc; border-radius: 3px; }
  details.page-bad { border-left-color: #d7373f; }
  details.page-ok { border-left-color: #2d9d78; }
  summary { cursor: pointer; padding: 9px 12px; font-size: 0.88rem; list-style: none; display: flex; align-items: center; gap: 8px; user-select: none; }
  summary::-webkit-details-marker { display: none; }
  .badge { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; font-size: 0.75rem; font-weight: 700; color: #fff; }
  .badge-ok { background: #2d9d78; }
  .badge-bad { background: #d7373f; }
  .page-path { font-weight: 600; color: #1473e6; }
  .page-summary { color: #888; font-size: 0.8rem; }
  .detail-table { width: 100%; border-collapse: collapse; }
  .detail-table th { background: #444; color: #fff; padding: 6px 10px; font-size: 0.75rem; text-align: left; }
  .detail-table td { padding: 6px 10px; border-bottom: 1px solid #e4e4e4; font-size: 0.78rem; }
  .locale-cell { font-weight: 600; white-space: nowrap; width: 70px; }
  .status-cell { white-space: nowrap; width: 90px; color: #d7373f; font-weight: 600; }
  .url-cell { word-break: break-all; }
  .url-cell a { color: #1473e6; text-decoration: none; }
  .url-cell.final { color: #888; }
</style>
</head>
<body>
<h1>Locale Redirect Check Report</h1>
<p class="meta">Host: ${esc(host)} &nbsp;|&nbsp; Run at: ${esc(runAt)}</p>
<div class="summary">
  <div class="stat"><div class="n">${pagesData.length}</div><div class="l">pages checked</div></div>
  <div class="stat"><div class="n">${totalUrls}</div><div class="l">locale URLs checked</div></div>
  <div class="stat bad"><div class="n">${totalBad}</div><div class="l">not redirected</div></div>
  <div class="stat ok"><div class="n">${totalUrls - totalBad}</div><div class="l">redirected OK</div></div>
</div>
${rowsHtml}
</body>
</html>`;
}

function saveHtml(html) {
  const dir = join(__dirname, 'results');
  mkdirSync(dir, { recursive: true });
  const filepath = join(dir, `${timestamp()}-locale-redirect-report.html`);
  writeFileSync(filepath, html);
  return filepath;
}

async function main() {
  const runAt = new Date().toISOString();
  const rows  = [];

  console.log(`\nChecking ${pages.length} page(s) x ${LOCALES.length} locales against ${HOST} ...\n`);

  let pageNum = 0;
  for (const page of pages) {
    pageNum++;
    const path  = normalizePath(page);
    const usUrl = `${HOST}/${path}`;
    console.log(`[${pageNum}/${pages.length}] /${path}`);

    let localeNum = 0;
    for (const locale of LOCALES) {
      localeNum++;
      const url = `${HOST}/${locale}/${path}`;
      process.stdout.write(`    (${localeNum}/${LOCALES.length}) ${locale} ...\r`);
      const { finalUrl, finalStatus, error, hops } = await followRedirects(url);
      const redirectedToUS = finalUrl.replace(/\/$/, '') === usUrl.replace(/\/$/, '');
      rows.push({ page: path, locale, url, finalStatus, finalUrl, hops, error, redirectedToUS });
      const mark = redirectedToUS ? '✔' : '✘';
      console.log(`    ${mark} ${locale.padEnd(8)} [${finalStatus || error}]      `);
    }
  }

  console.log(`\nChecked ${rows.length} locale URLs across ${pages.length} page(s).\n`);

  const pagesData = [...new Set(rows.map(r => r.page))].map(page => {
    const pageRows      = rows.filter(r => r.page === page);
    const notRedirected = pageRows.filter(r => !r.redirectedToUS);
    return { page, rows: pageRows, notRedirected };
  });

  for (const { page, rows: pageRows, notRedirected } of pagesData) {
    if (notRedirected.length === 0) {
      console.log(`✔ /${page} — all ${pageRows.length} locales redirect to US base`);
      continue;
    }
    console.log(`✘ /${page} — ${notRedirected.length}/${pageRows.length} locales did NOT redirect to US base:`);
    for (const r of notRedirected) {
      console.log(`    ${r.locale.padEnd(8)} [${r.finalStatus || r.error}]  ${r.url}`);
    }
  }

  const totalBad = pagesData.reduce((n, p) => n + p.notRedirected.length, 0);

  const dir     = join(__dirname, 'results');
  mkdirSync(dir, { recursive: true });
  const csvPath = join(dir, `${timestamp()}-locale-redirect-check.csv`);
  const csv = [
    'page,locale,url,final_status,final_url,redirected_to_us,error',
    ...rows.map(r => `${r.page},${r.locale},${r.url},${r.finalStatus},${r.finalUrl},${r.redirectedToUS},${r.error ?? ''}`),
  ].join('\n');
  writeFileSync(csvPath, csv);

  const html     = generateHtml(pagesData, runAt, HOST);
  const htmlPath = saveHtml(html);

  const [bin, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', htmlPath]]
                    : process.platform === 'darwin' ? ['open', [htmlPath]]
                    : ['xdg-open', [htmlPath]];
  spawn(bin, args, { detached: true, stdio: 'ignore' }).unref();

  console.log(`\nCSV:  ${csvPath}`);
  console.log(`HTML: ${htmlPath}`);

  process.exit(totalBad > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
