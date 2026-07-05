'use strict';

/**
 * Translates a locale code (and optional page name) to the --grep pattern
 * for a given suite, based on localeMap and pages[] in configs/suites.js.
 *
 * Usage:
 *   node scripts/get-locale-grep.js <suite-key> <locale-code> [page-name]
 *
 * Output: grep pattern string on stdout (empty = no grep, run all)
 *
 * Examples:
 *   feds-unav de            →  @unav-de          (all pages, German locale)
 *   feds-unav de photoshop  →  @unav-de-photoshop (German photoshop page only)
 *   feds-unav "" photoshop  →  photoshop          (all locales, photoshop page)
 *   feds-lnav de            →  @feds-lnav-de
 *   feds-illustrator-sanity de  →  Germany
 *   cc-accordion de         →  (empty — no localeMap for functional suites)
 *
 * Exit codes: always 0 (empty stdout = no grep, non-empty = use as --grep value)
 */

const SUITES = require('../configs/suites.js');

const [,, suite, locale, page] = process.argv;

const suiteData = SUITES[suite];
const localeCode  = (locale || '').toLowerCase().trim();
const pageName    = (page   || '').toLowerCase().trim();
const noLocale    = !localeCode || localeCode === 'all';
const noPage      = !pageName  || pageName   === 'all';

// Nothing to filter
if (noLocale && noPage) {
  process.stdout.write('');
  process.exit(0);
}

const map   = suiteData?.localeMap;
const pages = suiteData?.pages;

// Resolve locale → base grep pattern
let pattern = '';
if (!noLocale && map) {
  pattern = map[localeCode] || '';
  if (!pattern) {
    process.stderr.write(
      `[get-locale-grep] Warning: locale "${localeCode}" not in localeMap for suite "${suite}". ` +
      `Valid keys: ${Object.keys(map).slice(0, 20).join(', ')}${Object.keys(map).length > 20 ? '…' : ''}\n`
    );
  }
}

// Combine with page for suites that have a pages[] matrix (e.g. UNAV)
if (!noPage && pages) {
  if (!pages.includes(pageName)) {
    process.stderr.write(
      `[get-locale-grep] Warning: page "${pageName}" not found for suite "${suite}". ` +
      `Valid pages: ${pages.join(', ')}\n`
    );
    process.stdout.write(pattern);
    process.exit(0);
  }

  if (pattern) {
    // locale + page: @unav-de + -photoshop → @unav-de-photoshop
    process.stdout.write(`${pattern}-${pageName}`);
  } else {
    // page only, no locale filter — grep on the page name directly
    // Safe because test runs are scoped to the suite's test file
    process.stdout.write(pageName);
  }
  process.exit(0);
}

// Page provided but suite has no pages[] (e.g. LNav — handled via TEST_PAGE env var)
if (!noPage && !pages && pageName) {
  process.stderr.write(
    `[get-locale-grep] Info: suite "${suite}" does not support page filtering via grep. ` +
    `For LNav, set TEST_PAGE env var instead.\n`
  );
}

process.stdout.write(pattern);
