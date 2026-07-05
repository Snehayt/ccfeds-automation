'use strict';

/**
 * Single source of truth for all test suite definitions.
 * Used by: GitHub Actions workflow, scripts/agent-server.js, dashboard.
 *
 * ── HOW TO ADD A NEW SUITE ────────────────────────────────────────────────
 * 1. Add an entry below  (config, testPath, family, description)
 * 2. Add the suite name to the options list in .github/workflows/run-tests.yml
 * That's it — project selection, history, and the dashboard update automatically.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * family: 'feds' | 'cc' | 'express'
 *   Determines which Playwright project list to apply (browser × device combos).
 */
const F = 'configs/feds.config.js';
const C = 'configs/cc.config.js';
const E = 'configs/express-lingo.config.js';

const SUITES = {
  // ── FEDS — run all ────────────────────────────────────────────────────────
  'feds': { config: F, testPath: 'tests/feds', family: 'feds', description: 'All FEDS tests' },

  // ── FEDS — Nav ────────────────────────────────────────────────────────────
  'feds-unav':         { config: F, testPath: 'tests/feds/unav.test.js',                                                              family: 'feds', description: 'Universal Nav' },
  'unav':              { config: F, testPath: 'tests/feds/unav.test.js',                                                              family: 'feds', description: 'Universal Nav (alias)' },
  'feds-lnav':         { config: F, testPath: 'tests/feds/feds-lnav',                                                                family: 'feds', description: 'Local Nav' },
  'feds-lnav-devices': { config: F, testPath: 'tests/feds/feds-lnav/feds-lnav-devices.test.js',                                      family: 'feds', description: 'Local Nav — device variants' },

  // ── FEDS — Core components ─────────────────────────────────────────────────
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

  // ── FEDS — Page sanity (desktop) ──────────────────────────────────────────
  'feds-sanity':            { config: F, testPath: 'tests/feds/homePageSanity.test.js tests/feds/bacomsanity.test.js',               family: 'feds', description: 'Homepage + bacom sanity' },
  'feds-photoshop-sanity':  { config: F, testPath: 'tests/feds/photoshop.sanity.test.js',                                            family: 'feds', description: 'Photoshop page sanity' },
  'feds-illustrator-sanity':{ config: F, testPath: 'tests/feds/illustratorSanity.test.js',                                           family: 'feds', description: 'Illustrator page sanity' },
  'feds-cc-sanity':         { config: F, testPath: 'tests/feds/creativeCloudUnavSanity.test.js',                                     family: 'feds', description: 'Creative Cloud UNav sanity' },
  'feds-dc-sanity':         { config: F, testPath: 'tests/feds/documentcloudsanity.test.js',                                         family: 'feds', description: 'Document Cloud sanity' },
  'feds-cce-sanity':        { config: F, testPath: 'tests/feds/ccepagesanity.test.js',                                               family: 'feds', description: 'CCE page sanity' },
  'feds-cct-sanity':        { config: F, testPath: 'tests/feds/cctpagesanity.test.js',                                               family: 'feds', description: 'CCT page sanity' },
  'feds-blog':              { config: F, testPath: 'tests/feds/blog.test.js',                                                        family: 'feds', description: 'Blog pages' },
  'feds-category':          { config: F, testPath: 'tests/feds/category.test.js',                                                    family: 'feds', description: 'Category pages' },

  // ── FEDS — Mobile sanity ──────────────────────────────────────────────────
  'feds-mobile-sanity': { config: F, testPath: 'tests/feds/mobileHomePageSanity.test.js tests/feds/mobilePhotoshopPageSanity.test.js tests/feds/mobileIllustratorPageSanity.test.js tests/feds/mobileCCEPageSanity.test.js tests/feds/mobileCCTPageSanity.test.js tests/feds/mobileCreativeCloudUnavSanity.test.js', family: 'feds', description: 'Mobile page sanity — all products' },

  // ── FEDS — Tablet sanity ──────────────────────────────────────────────────
  'feds-tablet-sanity': { config: F, testPath: 'tests/feds/tabCreativeCloudUnavSanity.test.js tests/feds/tabiPadCCEPageSanity.test.js tests/feds/tabipadIllustratorPageSanity.test.js', family: 'feds', description: 'Tablet page sanity — all products' },

  // ── CC — run all ──────────────────────────────────────────────────────────
  'cc': { config: C, testPath: 'tests/cc', family: 'cc', description: 'All CC tests' },

  // ── CC — features ─────────────────────────────────────────────────────────
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

  // ── Express ───────────────────────────────────────────────────────────────
  'express': { config: E, testPath: 'tests/express/lingo.test.js', family: 'express', description: 'Express Lingo geo-routing' },
};

module.exports = SUITES;
