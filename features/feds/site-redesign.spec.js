// Locale list is shared with feds-lnav and feds-unav — edit data/feds-lnav-locales.js only.
// Tag format: @site-redesign-{code}  e.g. @site-redesign-de, @site-redesign-jp
//
// ── Environment / URL controls ────────────────────────────────────────────────
//
//   BASE_URL      — domain/environment (default: https://www.adobe.com)
//                   https://www.stage.adobe.com
//                   https://main--federal--adobecom.aem.live
//
//   TEST_PAGE     — path appended after locale prefix (default: /?georouting=off&mep=off)
//                   /creativecloud.html?georouting=off
//                   /homepage/drafts/redesign-demo?georouting=off&mep=off
//
//   TEST_URL      — full URL override: auto-splits into BASE_URL + TEST_PAGE
//                   https://www.stage.adobe.com/creativecloud.html?georouting=off
//
//   URL_EXTRA_PARAMS — extra query params appended to every locale URL
//                   milolibs=local
//                   milolibs=local&fedsbranch=unav
//
// ── Examples ──────────────────────────────────────────────────────────────────
//   Prod, all locales, homepage:
//     BASE_URL=https://www.adobe.com
//
//   Stage, all locales, specific page:
//     BASE_URL=https://www.stage.adobe.com  TEST_PAGE=/creativecloud.html?georouting=off
//
//   AEM Live with milolibs:
//     BASE_URL=https://main--federal--adobecom.aem.live  URL_EXTRA_PARAMS=milolibs=local
//
//   Stage with milolibs + fedsbranch:
//     BASE_URL=https://www.stage.adobe.com  URL_EXTRA_PARAMS=milolibs=local&fedsbranch=unav
//
//   Any single full URL:
//     TEST_URL=https://main--federal--adobecom.aem.live/de/?georouting=off&milolibs=local

import { fedsLnavLocales } from '../../data/feds-lnav-locales.js';

const DEFAULT_PATH = '/?georouting=off&mep=off';

// TEST_URL — single override: auto-splits into BASE_URL + TEST_PAGE
if (process.env.TEST_URL) {
  const _u = new URL(process.env.TEST_URL);
  process.env.BASE_URL  = process.env.BASE_URL  || _u.origin;
  process.env.TEST_PAGE = process.env.TEST_PAGE || (_u.pathname + _u.search);
}

const TEST_PATH = process.env.TEST_PAGE || DEFAULT_PATH;

// URL_EXTRA_PARAMS — appended to every locale URL (milolibs, fedsbranch, etc.)
const EXTRA = (process.env.URL_EXTRA_PARAMS || '').replace(/^[?&]/, '');

function buildPath(localePrefix, testPath) {
  const base = localePrefix === '/' ? '' : localePrefix.replace(/\/$/, '');
  const path = `${base}${testPath}`;
  if (!EXTRA) return path;
  return path + (path.includes('?') ? '&' : '?') + EXTRA;
}

export const features = fedsLnavLocales.map((locale, idx) => ({
  tcid:    String(idx),
  name:    `@site-redesign-${locale.code}`,
  path:    buildPath(locale.prefix, TEST_PATH),
  tags:    ['@SiteRedesign', `@site-redesign-${locale.code}`],
  country: locale.name,
  code:    locale.code,
  lang:    locale.lang,
  dir:     locale.dir,
}));
