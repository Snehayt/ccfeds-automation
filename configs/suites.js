'use strict';

/**
 * Single source of truth for all test suite definitions.
 * Used by: GitHub Actions workflow, scripts/get-locale-grep.js, dashboard.
 *
 * ── HOW TO ADD A NEW SUITE ────────────────────────────────────────────────
 * 1. Add an entry below  (config, testPath, family, description)
 * 2. Add the suite name to the options list in .github/workflows/run-tests.yml
 * That's it — project selection, history, and the dashboard update automatically.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * family: 'feds' | 'cc' | 'express'
 *   Determines which Playwright project list to apply (browser × device combos).
 *
 * localeMap (optional): { localeCode → --grep pattern }
 *   Suites without localeMap do not support locale filtering — the locale input
 *   is ignored and all locales run. Determined by scanning actual spec files.
 */

const F = 'configs/feds.config.js';
const C = 'configs/cc.config.js';
const E = 'configs/express-lingo.config.js';

// ── Shared locale maps ───────────────────────────────────────────────────────

// Standard 23-country set — used by most FEDS prod-sanity suites.
// Country names appear literally at the end of each test title.
const STD = {
  us: 'United States', de: 'Germany',   fr: 'France',   it: 'Italy',
  gb: 'United Kingdom', uk: 'United Kingdom',
  jp: 'Japan',          in: 'India',    es: 'Spain',    kr: 'Korea',
  ca_en: 'Canada English',              ca_fr: 'Canada French',
  pl: 'Poland',         mx: 'Mexico',   au: 'Australia',
  id: 'Indonesia',      tr: 'Turkey',   th: 'Thailand',
  sg: 'Singapore',      ph: 'Philippines',
  mena: 'Middle East And North Africa',
};

// Photoshop spec uses 'US' (not 'United States') for the US locale.
const PS = { ...STD, us: 'US' };

// Document Cloud sanity uses short/informal country names in spec data.
const DC = {
  us: 'United States',  gb: 'United kingdom', fr: 'France',   de: 'German',
  jp: 'Japanese',       sg: 'Singapore',       au: 'Australia', ie: 'Ireland',
  es: 'Espana',         dk: 'Denmark',         be: 'Belgium',  af: 'Africa',
  mx: 'Mexico',         la: 'Latinamerica',    ca: 'Canada',   hu: 'Hungary',
  nl: 'Netherlands',    fi: 'Finland',         se: 'Sweden',   in: 'India',
  nz: 'Newzeland',      kr: 'Korea',
};

// UNAV locale codes (100+). Tests use @unav-{code} in the test name.
const UNAV_CODES = [
  'us','cn','tw','cz','dk','nl','fi','hu','it','jp','kr','no','pl','br','es',
  'mx','se','tr','ua','fr','de','si','la','pe','co','cr','ec','uk','nz','au',
  'ca','hk_en','in','ie','at','bg','hk_zh','be_nl','ph_en','ar','cl','pr',
  'gt','th_th','vn_vi','id_en','vn_en','th_en','cis_en','il_en','mena_en',
  'ae_en','sa_en','my_en','sg','gr_en','za','ng','be_en','lu_en','eg_en',
  'kw_en','qa_en','ro','cis_ru','sk','ee','ph_fil','lu_fr','ch_fr','be_fr',
  'lu_de','ch_de','gr_el','il_he','in_hi','id_id','ch_it','lv','lt','my_ms',
  'pt','mena_ar','eg_ar','kw_ar','qa_ar','ae_ar','sa_ar','ca_fr',
];
// @unav-{code} appears in the test name; specific enough to avoid false matches
const UNAV = Object.fromEntries(UNAV_CODES.map(c => [c, `@unav-${c}`]));

// LNav uses @feds-lnav-{code} in test names and tags (same locale set as UNAV)
const LNAV = Object.fromEntries(UNAV_CODES.map(c => [c, `@feds-lnav-${c}`]));

// Express lingo: locale code → language-group grep tag
const EXPRESS = {
  de: '@express-geo-language-de',
  fr: '@express-geo-language-fr',
  ja: '@express-geo-language-ja',  jp: '@express-geo-language-ja',
  es: '@express-geo-language-es',
  kr: '@express-geo-language-kr',  ko: '@express-geo-language-kr',
  it: '@express-geo-language-it',
  pt: '@express-geo-language-pt',  br: '@express-geo-language-pt',
  nl: '@express-geo-language-nl',
  da: '@express-geo-language-da',  dk: '@express-geo-language-da',
  fi: '@express-geo-language-fi',
  no: '@express-geo-language-no',
  sv: '@express-geo-language-sv',  se: '@express-geo-language-sv',
  id: '@express-geo-language-id',  id_id: '@express-geo-language-id',
  zh_hk: '@express-geo-language-zh-hk', hk: '@express-geo-language-zh-hk',
  zh_cn: '@express-geo-language-zh-cn', cn: '@express-geo-language-zh-cn',
};

const SUITES = {
  // ── FEDS — run all ──────────────────────────────────────────────────────────
  'feds': { config: F, testPath: 'tests/feds', family: 'feds', description: 'All FEDS tests' },

  // ── FEDS — Nav ──────────────────────────────────────────────────────────────
  // UNAV: locale × page matrix. pages[] drives the "page" GitHub Actions filter.
  // Grep pattern for locale+page: @unav-{locale}-{page}  (e.g. @unav-de-photoshop)
  'feds-unav': {
    config: F, testPath: 'tests/feds/unav.test.js', family: 'feds',
    description: 'Universal Nav',
    localeMap: UNAV,
    pages: ['home','cc','cc-all-apps','cc-business','cc-business-teams','cc-plans',
            'cc-students','photoshop','illustrator','catalog','acrobat','acrobat-online',
            'sign','express','education','community','learn','genuine','helpx'],
  },
  'unav': {
    config: F, testPath: 'tests/feds/unav.test.js', family: 'feds',
    description: 'Universal Nav (alias)',
    localeMap: UNAV,
    pages: ['home','cc','cc-all-apps','cc-business','cc-business-teams','cc-plans',
            'cc-students','photoshop','illustrator','catalog','acrobat','acrobat-online',
            'sign','express','education','community','learn','genuine','helpx'],
  },
  // LNav: page is set via TEST_PAGE env var (locale prefix is prepended per locale).
  // Leave TEST_PAGE empty to test the locale root. Example: /creativecloud.html
  'feds-lnav':         { config: F, testPath: 'tests/feds/feds-lnav',                                                                family: 'feds', description: 'Local Nav',                        localeMap: LNAV },
  'feds-lnav-devices': { config: F, testPath: 'tests/feds/feds-lnav/feds-lnav-devices.test.js',                                      family: 'feds', description: 'Local Nav — device variants',      localeMap: LNAV },

  // ── FEDS — Core components (no locale filtering — single-URL tests) ──────────
  'feds-header':       { config: F, testPath: 'tests/feds/header.test.js',                                                           family: 'feds', description: 'Global header' },
  'feds-footer':       { config: F, testPath: 'tests/feds/footer.test.js',                                                           family: 'feds', description: 'Footer variants' },
  'feds-search':       { config: F, testPath: 'tests/feds/search.test.js',                                                           family: 'feds', description: 'Search' },
  'feds-a11y':         { config: F, testPath: 'tests/feds/a11y.test.js',                                                             family: 'feds', description: 'Accessibility' },
  'feds-jarvis':       { config: F, testPath: 'tests/feds/jarvis.desktop.test.js tests/feds/jarvis.mobile.test.js',                  family: 'feds', description: 'Jarvis chat widget' },
  'feds-consent':      { config: F, testPath: 'tests/feds/consent.test.js',                                                          family: 'feds', description: 'Consent / privacy banner' },
  'feds-placeholders': { config: F, testPath: 'tests/feds/placeholders.test.js',                                                     family: 'feds', description: 'Placeholders' },
  'feds-promobar':     { config: F, testPath: 'tests/feds/promobar.test.js',                                                         family: 'feds', description: 'Promo bar' },
  'feds-breadcrumbs':  { config: F, testPath: 'tests/feds/breadcrumbs.test.js',                                                      family: 'feds', description: 'Breadcrumbs' },
  'feds-userprofile':  { config: F, testPath: 'tests/feds/userprofile.test.js',                                                      family: 'feds', description: 'User profile' },

  // ── FEDS — Page sanity (desktop) ─────────────────────────────────────────────
  'feds-sanity':             { config: F, testPath: 'tests/feds/homePageSanity.test.js tests/feds/bacomsanity.test.js',              family: 'feds', description: 'Homepage + bacom sanity',           localeMap: STD },
  'feds-photoshop-sanity':   { config: F, testPath: 'tests/feds/photoshop.sanity.test.js',                                          family: 'feds', description: 'Photoshop page sanity',             localeMap: PS  },
  'feds-illustrator-sanity': { config: F, testPath: 'tests/feds/illustratorSanity.test.js',                                         family: 'feds', description: 'Illustrator page sanity',           localeMap: STD },
  'feds-cc-sanity':          { config: F, testPath: 'tests/feds/creativeCloudUnavSanity.test.js',                                   family: 'feds', description: 'Creative Cloud UNav sanity',        localeMap: STD },
  'feds-dc-sanity':          { config: F, testPath: 'tests/feds/documentcloudsanity.test.js',                                       family: 'feds', description: 'Document Cloud sanity',             localeMap: DC  },
  'feds-cce-sanity':         { config: F, testPath: 'tests/feds/ccepagesanity.test.js',                                             family: 'feds', description: 'CCE page sanity',                   localeMap: STD },
  'feds-cct-sanity':         { config: F, testPath: 'tests/feds/cctpagesanity.test.js',                                             family: 'feds', description: 'CCT page sanity',                   localeMap: STD },
  'feds-blog':               { config: F, testPath: 'tests/feds/blog.test.js',                                                      family: 'feds', description: 'Blog pages',                        localeMap: { us: 'United States', jp: 'Japan' } },
  'feds-category':           { config: F, testPath: 'tests/feds/category.test.js',                                                  family: 'feds', description: 'Category pages',                    localeMap: STD },

  // ── FEDS — Mobile sanity ──────────────────────────────────────────────────────
  'feds-mobile-sanity': { config: F, testPath: 'tests/feds/mobileHomePageSanity.test.js tests/feds/mobilePhotoshopPageSanity.test.js tests/feds/mobileIllustratorPageSanity.test.js tests/feds/mobileCCEPageSanity.test.js tests/feds/mobileCCTPageSanity.test.js tests/feds/mobileCreativeCloudUnavSanity.test.js', family: 'feds', description: 'Mobile page sanity — all products', localeMap: STD },

  // ── FEDS — Tablet sanity ──────────────────────────────────────────────────────
  'feds-tablet-sanity': { config: F, testPath: 'tests/feds/tabCreativeCloudUnavSanity.test.js tests/feds/tabiPadCCEPageSanity.test.js tests/feds/tabipadIllustratorPageSanity.test.js', family: 'feds', description: 'Tablet page sanity — all products', localeMap: STD },

  // ── CC — run all ────────────────────────────────────────────────────────────
  'cc': { config: C, testPath: 'tests/cc', family: 'cc', description: 'All CC tests' },

  // ── CC — features (no locale filtering — functional/component tests) ──────────
  'cc-firefly':         { config: C, testPath: 'tests/cc/firefly.test.js',                                                                                    family: 'cc', description: 'Firefly' },
  'cc-merch':           { config: C, testPath: 'tests/cc/merchcard.test.js tests/cc/merchtable.test.js',                                                       family: 'cc', description: 'Merch cards + table' },
  'cc-lingo':           { config: C, testPath: 'tests/cc/lingo.test.js',                                                                                       family: 'cc', description: 'Lingo geo-routing' },
  'cc-doodlebug':       { config: C, testPath: 'tests/cc/doodlebug_prompt_based_imagegen_verbs.test.js tests/cc/doodlebugaudiogeneration.test.js tests/cc/doodlebugimageupload.test.js tests/cc/doodlebugvideoupload.test.js', family: 'cc', description: 'Doodlebug — all variants' },
  'cc-sanity':          { config: C, testPath: 'tests/cc/productionsanity.test.js tests/cc/INTLstagesanity.test.js',                                           family: 'cc', description: 'CC sanity' },
  'cc-accordion':       { config: C, testPath: 'tests/cc/accordion.test.js',                                                                                   family: 'cc', description: 'Accordion' },
  'cc-breadcrumb':      { config: C, testPath: 'tests/cc/breadcrumb.test.js',                                                                                  family: 'cc', description: 'Breadcrumb' },
  'cc-carousel':        { config: C, testPath: 'tests/cc/carousel.test.js',                                                                                    family: 'cc', description: 'Carousel' },
  'cc-hometabs':        { config: C, testPath: 'tests/cc/cchometabs.test.js',                                                                                  family: 'cc', description: 'CC home tabs' },
  'cc-ffgallery':       { config: C, testPath: 'tests/cc/FFGallery.test.js',                                                                                   family: 'cc', description: 'Firefly Gallery' },
  'cc-fragmentref':     { config: C, testPath: 'tests/cc/fragmentreference.test.js',                                                                           family: 'cc', description: 'Fragment reference' },
  'cc-inlinevideo':     { config: C, testPath: 'tests/cc/inlinevideo.test.js',                                                                                 family: 'cc', description: 'Inline video' },
  'cc-jarvis':          { config: C, testPath: 'tests/cc/jarvis.test.js',                                                                                      family: 'cc', description: 'Jarvis' },
  'cc-mobile-banner':   { config: C, testPath: 'tests/cc/mobile-branch-banner.test.js',                                                                        family: 'cc', description: 'Mobile branch banner' },
  'cc-ostprices':       { config: C, testPath: 'tests/cc/ostprices.test.js',                                                                                   family: 'cc', description: 'OST prices' },
  'cc-photoshop-unity': { config: C, testPath: 'tests/cc/photoshop-unity.test.js',                                                                             family: 'cc', description: 'Photoshop Unity' },
  'cc-pricingmodel':    { config: C, testPath: 'tests/cc/pricingmodel.test.js',                                                                                family: 'cc', description: 'Pricing model' },
  'cc-promo':           { config: C, testPath: 'tests/cc/promoactionclose.test.js',                                                                            family: 'cc', description: 'Promo action close' },
  'cc-roundedcorners':  { config: C, testPath: 'tests/cc/roundedcorners-mediablock.test.js',                                                                   family: 'cc', description: 'Rounded corners media block' },
  'cc-seo':             { config: C, testPath: 'tests/cc/seocanonical.test.js',                                                                                family: 'cc', description: 'SEO canonical' },
  'cc-stickypromo':     { config: C, testPath: 'tests/cc/stickypromo.test.js',                                                                                 family: 'cc', description: 'Sticky promo' },
  'cc-youtube':         { config: C, testPath: 'tests/cc/youtubeGallery.test.js',                                                                              family: 'cc', description: 'YouTube gallery' },

  // ── Express ──────────────────────────────────────────────────────────────────
  'express': { config: E, testPath: 'tests/express/lingo.test.js', family: 'express', description: 'Express Lingo geo-routing', localeMap: EXPRESS },
};

module.exports = SUITES;
