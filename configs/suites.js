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
const SUITES = {
  // ── FEDS ──────────────────────────────────────────────────────────────────
  'feds':                 { config: 'configs/feds.config.js',            testPath: 'tests/feds',                                                          family: 'feds',    description: 'All FEDS tests' },
  'feds-lnav':            { config: 'configs/feds.config.js',            testPath: 'tests/feds/feds-lnav',                                                family: 'feds',    description: 'Local Nav — all locales' },
  'feds-header':          { config: 'configs/feds.config.js',            testPath: 'tests/feds/header.test.js',                                           family: 'feds',    description: 'Global header' },
  'feds-footer':          { config: 'configs/feds.config.js',            testPath: 'tests/feds/footer.test.js',                                           family: 'feds',    description: 'Footer variants' },
  'feds-search':          { config: 'configs/feds.config.js',            testPath: 'tests/feds/search.test.js',                                           family: 'feds',    description: 'Search' },
  'feds-a11y':            { config: 'configs/feds.config.js',            testPath: 'tests/feds/a11y.test.js',                                             family: 'feds',    description: 'Accessibility' },
  'feds-sanity':          { config: 'configs/feds.config.js',            testPath: 'tests/feds/homePageSanity.test.js tests/feds/bacomsanity.test.js',    family: 'feds',    description: 'FEDS sanity' },
  'feds-jarvis':          { config: 'configs/feds.config.js',            testPath: 'tests/feds/jarvis.desktop.test.js tests/feds/jarvis.mobile.test.js',  family: 'feds',    description: 'Jarvis chat widget' },
  'feds-photoshop-sanity':{ config: 'configs/feds.config.js',            testPath: 'tests/feds/photoshop.sanity.test.js',                                 family: 'feds',    description: 'Photoshop sanity' },
  'unav':                 { config: 'configs/feds.config.js',            testPath: 'tests/feds/unav.test.js',                                             family: 'feds',    description: 'Universal Nav — all locales × pages' },
  'site-redesign':        { config: 'configs/feds.config.js',            testPath: 'tests/feds/site-redesign.test.js',                                    family: 'feds',    description: 'Site redesign' },

  // ── CC ────────────────────────────────────────────────────────────────────
  'cc':                   { config: 'configs/cc.config.js',              testPath: 'tests/cc',                                                            family: 'cc',      description: 'All CC tests' },
  'cc-firefly':           { config: 'configs/cc.config.js',              testPath: 'tests/cc/firefly.test.js',                                            family: 'cc',      description: 'Firefly' },
  'cc-merch':             { config: 'configs/cc.config.js',              testPath: 'tests/cc/merchcard.test.js tests/cc/merchtable.test.js',              family: 'cc',      description: 'Merch cards + table' },
  'cc-lingo':             { config: 'configs/cc.config.js',              testPath: 'tests/cc/lingo.test.js',                                              family: 'cc',      description: 'CC Lingo geo-routing' },
  'cc-doodlebug':         { config: 'configs/cc.config.js',              testPath: 'tests/cc/doodlebug_prompt_based_imagegen_verbs.test.js',              family: 'cc',      description: 'Doodlebug image gen' },
  'cc-sanity':            { config: 'configs/cc.config.js',              testPath: 'tests/cc/productionsanity.test.js tests/cc/INTLstagesanity.test.js', family: 'cc',      description: 'CC sanity' },

  // ── Express ───────────────────────────────────────────────────────────────
  'express':              { config: 'configs/express-lingo.config.js',   testPath: 'tests/express/lingo.test.js',                                         family: 'express', description: 'Express Lingo geo-routing' },
};

module.exports = SUITES;
