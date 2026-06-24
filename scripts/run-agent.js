#!/usr/bin/env node
'use strict';

/**
 * FEDS Test Runner Agent
 * Local CLI — runs playwright tests with full param control,
 * saves results to dashboard/runs/, updates run-history.json, posts to Slack.
 *
 * Usage:
 *   node scripts/run-agent.js --suite feds-lnav --env stage
 *   node scripts/run-agent.js --suite feds-lnav --url https://www.stage.adobe.com --page /products/photoshop?georouting=off
 *   node scripts/run-agent.js --help
 */

const { spawn } = require('child_process');
const fs         = require('fs');
const path       = require('path');
const https      = require('https');

// ── Suite → config + test path ────────────────────────────────────────────────
const SUITE_MAP = {
  'all':             { config: 'configs/feds.config.js',          testPath: 'tests/feds' },
  'feds':            { config: 'configs/feds.config.js',          testPath: 'tests/feds' },
  'feds-lnav':       { config: 'configs/feds.config.js',          testPath: 'tests/feds/feds-lnav' },
  'feds-cmp-banner': { config: 'configs/feds.config.js',          testPath: 'tests/feds/cmp-banner.test.js' },
  'feds-header':     { config: 'configs/feds.config.js',          testPath: 'tests/feds/header.test.js' },
  'feds-footer':     { config: 'configs/feds.config.js',          testPath: 'tests/feds/footer.test.js' },
  'feds-search':     { config: 'configs/feds.config.js',          testPath: 'tests/feds/search.test.js' },
  'feds-a11y':       { config: 'configs/feds.config.js',          testPath: 'tests/feds/a11y.test.js' },
  'feds-sanity':     { config: 'configs/feds.config.js',          testPath: 'tests/feds/homePageSanity.test.js' },
  'feds-jarvis':     { config: 'configs/feds.config.js',          testPath: 'tests/feds/jarvis.desktop.test.js tests/feds/jarvis.mobile.test.js' },
  'unav':            { config: 'configs/feds.config.js',          testPath: 'tests/feds/unav.test.js' },
  'site-redesign':   { config: 'configs/feds.config.js',          testPath: 'tests/feds/site-redesign.test.js' },
  'cc':              { config: 'configs/cc.config.js',            testPath: 'tests/cc' },
  'cc-firefly':      { config: 'configs/cc.config.js',            testPath: 'tests/cc/firefly.test.js' },
  'cc-doodlebug':    { config: 'configs/cc.config.js',            testPath: 'tests/cc/doodlebug_prompt_based_imagegen_verbs.test.js' },
  'cc-merch':        { config: 'configs/cc.config.js',            testPath: 'tests/cc/merchcard.test.js tests/cc/merchtable.test.js' },
  'cc-lingo':        { config: 'configs/cc.config.js',            testPath: 'tests/cc/lingo.test.js' },
  'cc-sanity':       { config: 'configs/cc.config.js',            testPath: 'tests/cc/productionsanity.test.js' },
  'express':         { config: 'configs/express-lingo.config.js', testPath: 'tests/express/lingo.test.js' },
  'cmp':             { config: 'configs/feds.config.js',          testPath: 'tests/cmp/cmp-banner.test.js' },
};

// ── Browser + device → --project flags ───────────────────────────────────────
function resolveProjects(browser, device, config) {
  if (config.includes('feds.config')) {
    const map = {
      'chrome-desktop':  ['--project=feds-chrome'],
      'firefox-desktop': ['--project=feds-firefox'],
      'safari-desktop':  ['--project=feds-webkit'],
      'chrome-mobile':   ['--project=feds-iphone', '--project=feds-android'],
      'safari-mobile':   ['--project=feds-iphone'],
      'firefox-mobile':  ['--project=feds-iphone'],
      'chrome-tablet':   ['--project=feds-ipad-air-portrait', '--project=feds-ipad-air-landscape'],
      'safari-tablet':   ['--project=feds-ipad-air-portrait', '--project=feds-ipad-air-landscape'],
      'all-desktop':     ['--project=feds-chrome', '--project=feds-firefox', '--project=feds-webkit'],
      'all-mobile':      ['--project=feds-iphone', '--project=feds-android'],
      'all-tablet':      ['--project=feds-ipad-air-portrait', '--project=feds-ipad-air-landscape'],
      'all-all':         [],
      'chrome-all':      ['--project=feds-chrome', '--project=feds-iphone', '--project=feds-android', '--project=feds-ipad-air-portrait'],
      'firefox-all':     ['--project=feds-firefox', '--project=feds-iphone'],
      'safari-all':      ['--project=feds-webkit', '--project=feds-iphone', '--project=feds-ipad-air-portrait'],
    };
    return map[`${browser}-${device}`] || map[`${browser}-desktop`] || ['--project=feds-chrome'];
  }
  if (config.includes('cc.config')) {
    const map = {
      'chrome-desktop':  ['--project=cc-live-chrome'],
      'firefox-desktop': ['--project=cc-live-firefox'],
      'safari-desktop':  ['--project=cc-live-webkit'],
      'chrome-mobile':   ['--project=cc-live-Android-mobile'],
      'safari-mobile':   ['--project=cc-live-IOS-mobile'],
      'all-desktop':     ['--project=cc-live-chrome', '--project=cc-live-firefox', '--project=cc-live-webkit'],
      'all-all':         [],
    };
    return map[`${browser}-${device}`] || ['--project=cc-live-chrome'];
  }
  return [];
}

// ── ENV name → base URL ───────────────────────────────────────────────────────
const ENV_URLS = {
  'aem-live': 'https://main--upp--adobecom.aem.live',
  'prod':     'https://www.adobe.com',
  'stage':    'https://www.stage.adobe.com',
};

// ── Parse CLI args ────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    suite:   'feds-lnav',
    url:     '',
    env:     'stage',
    page:    '',
    browser: 'chrome',
    device:  'desktop',
    locale:  'us',
    grep:    '',
    retries: 1,
    workers: '',
    headed:  false,
    help:    false,
  };
  for (let i = 0; i < args.length; i++) {
    const next = args[i + 1];
    switch (args[i]) {
      case '--suite':   opts.suite   = next; i++; break;
      case '--url':     opts.url     = next; i++; break;
      case '--env':     opts.env     = next; i++; break;
      case '--page':    opts.page    = next; i++; break;
      case '--browser': opts.browser = next; i++; break;
      case '--device':  opts.device  = next; i++; break;
      case '--locale':  opts.locale  = next; i++; break;
      case '--grep':    opts.grep    = next; i++; break;
      case '--retries': opts.retries = parseInt(next, 10); i++; break;
      case '--workers': opts.workers = next; i++; break;
      case '--headed':  opts.headed  = true; break;
      case '--help':    opts.help    = true; break;
    }
  }
  return opts;
}

// ── Write run history ─────────────────────────────────────────────────────────
function writeHistory(runId, opts, baseUrl, results) {
  const historyPath = path.join('dashboard', 'run-history.json');
  const runsDir     = path.join('dashboard', 'runs');

  if (!fs.existsSync('dashboard')) fs.mkdirSync('dashboard', { recursive: true });
  if (!fs.existsSync(runsDir))     fs.mkdirSync(runsDir, { recursive: true });

  let history = [];
  if (fs.existsSync(historyPath)) {
    try { history = JSON.parse(fs.readFileSync(historyPath, 'utf8')); } catch {}
  }

  const total  = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  const entry = {
    id:          runId,
    timestamp:   new Date().toISOString(),
    suite:       opts.suite,
    browser:     opts.browser,
    device:      opts.device,
    locale:      opts.locale,
    url:         baseUrl,
    page:        opts.page || '',
    passed,
    failed,
    total,
    passRate:    total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
    triggeredBy: process.env.USER || process.env.USERNAME || 'local',
    runUrl:      'local',
  };

  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

  // Copy full nala-results.json to runs/ with metadata
  if (fs.existsSync('nala-results.json')) {
    try {
      const runData = JSON.parse(fs.readFileSync('nala-results.json', 'utf8'));
      runData.runId       = runId;
      runData.suite       = opts.suite;
      runData.browser     = opts.browser;
      runData.device      = opts.device;
      runData.locale      = opts.locale;
      runData.baseURL     = baseUrl;
      runData.testPage    = opts.page;
      runData.environment = opts.env;
      runData.triggeredBy = entry.triggeredBy;
      fs.writeFileSync(path.join(runsDir, `${runId}.json`), JSON.stringify(runData));
    } catch (e) {
      console.error('Warning: could not save run file:', e.message);
    }
  }

  return entry;
}

// ── Slack notification ────────────────────────────────────────────────────────
function notifySlack(entry) {
  const wh = process.env.SLACK_WH;
  if (!wh) { console.log('  No SLACK_WH set — skipping Slack notification'); return; }

  const statusEmoji = entry.total === 0 ? '⚠️' : entry.failed === 0 ? '✅' : '❌';
  const statusText  = entry.total === 0
    ? 'No tests ran — check suite config'
    : entry.failed === 0
      ? 'All tests passed'
      : `${entry.failed} test(s) failed`;

  const payload = {
    status_emoji:  `${statusEmoji} ${statusText}`,
    suite:         `Suite: ${entry.suite} | URL: ${entry.url}${entry.page}`,
    browser:       `Browser: ${entry.browser}`,
    device:        `Device: ${entry.device}`,
    passed:        `Passed: ${entry.passed}`,
    failed:        `Failed: ${entry.failed}`,
    pass_rate:     `Pass Rate: ${entry.passRate}%`,
    dashboard_url: `Dashboard: https://snehayt.github.io/ccfeds-automation/`,
    run_url:       `Run: local — triggered by ${entry.triggeredBy}`,
  };

  try {
    const parsed = new URL(wh);
    const req = https.request({
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json' },
    }, res => console.log(`  Slack notification sent — HTTP ${res.statusCode}`));
    req.on('error', err => console.error('  Slack notify failed:', err.message));
    req.write(JSON.stringify(payload));
    req.end();
  } catch (e) {
    console.error('  Slack notify error:', e.message);
  }
}

// ── Help text ─────────────────────────────────────────────────────────────────
function printHelp() {
  console.log(`
FEDS Test Runner Agent
Run any test suite against any URL, environment, browser, device, or locale.

Usage:
  node scripts/run-agent.js [options]

Options:
  --suite    <name>   Test suite (default: feds-lnav)
             Choices: all, feds, feds-lnav, feds-cmp-banner, feds-header,
                      feds-footer, feds-search, feds-a11y, feds-sanity,
                      unav, site-redesign, cc, cc-firefly, cc-doodlebug,
                      cc-merch, cc-lingo, cc-sanity, express, cmp

  --url      <url>    Base domain to run against (overrides --env)
                      Example: https://www.stage.adobe.com

  --env      <env>    Target environment (default: stage)
             Choices: stage, prod, aem-live

  --page     <path>   Page path — locale prefix added automatically
                      Can include query params
                      Example: /products/photoshop?georouting=off
                      Example: /acrobat?georouting=off&milolibs=local

  --browser  <b>      Browser (default: chrome)
             Choices: chrome, firefox, safari, all

  --device   <d>      Device type (default: desktop)
             Choices: desktop, mobile, tablet, all

  --locale   <l>      Locale (default: us)
                      Examples: us, de, fr, jp, all

  --grep     <filter> Filter by tag or test name
                      Examples: @feds-lnav-us   "Sign In"   @cmp-banner-fr

  --retries  <n>      Retry failed tests N times (default: 1)

  --workers  <n>      Parallel workers (default: config default)

  --headed            Run in headed mode (shows browser UI)

Examples:
  # Run feds-lnav on stage
  node scripts/run-agent.js --suite feds-lnav --env stage

  # Run on photoshop page on stage, Chrome, Desktop
  node scripts/run-agent.js --suite feds-lnav --url https://www.stage.adobe.com --page /products/photoshop?georouting=off

  # Run only US locale, no retries
  node scripts/run-agent.js --suite feds-lnav --grep @feds-lnav-us --retries 0

  # Run unav suite on prod
  node scripts/run-agent.js --suite unav --env prod --browser chrome --device desktop

  # Run feds-lnav on multiple locale with Safari
  node scripts/run-agent.js --suite feds-lnav --browser safari --device desktop --locale all

  # Run headed for debugging
  node scripts/run-agent.js --suite feds-lnav --grep @feds-lnav-us --headed --retries 0
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const opts = parseArgs();
if (opts.help) { printHelp(); process.exit(0); }

const suite = SUITE_MAP[opts.suite] || SUITE_MAP['feds-lnav'];
const baseUrl = opts.url || ENV_URLS[opts.env] || ENV_URLS['stage'];
const projects = resolveProjects(opts.browser, opts.device, suite.config);
const runId = `run-${new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-').slice(0, 22)}`;

// Build playwright command args
const playwrightArgs = ['playwright', 'test'];
suite.testPath.split(' ').forEach(p => playwrightArgs.push(p));
playwrightArgs.push(`--config=${suite.config}`);
playwrightArgs.push(...projects);
if (opts.grep) { playwrightArgs.push('--grep'); playwrightArgs.push(opts.grep); }
playwrightArgs.push(`--retries=${opts.retries}`);
if (opts.workers) playwrightArgs.push(`--workers=${opts.workers}`);
if (opts.headed) playwrightArgs.push('--headed');
playwrightArgs.push('--output=test-results');

const env = {
  ...process.env,
  BASE_URL: baseUrl,
  SUITE:    opts.suite,
  DEVICE:   opts.device,
  LOCALE:   opts.locale,
};
if (opts.page) env.TEST_PAGE = opts.page;

console.log('\n' + '━'.repeat(60));
console.log('  FEDS Test Agent');
console.log('━'.repeat(60));
console.log(`  Run ID : ${runId}`);
console.log(`  Suite  : ${opts.suite}`);
console.log(`  URL    : ${baseUrl}${opts.page || ''}`);
console.log(`  Browser: ${opts.browser}   Device: ${opts.device}   Locale: ${opts.locale}`);
console.log(`  Config : ${suite.config}`);
if (opts.grep) console.log(`  Grep   : ${opts.grep}`);
console.log(`  Command: npx ${playwrightArgs.join(' ')}`);
console.log('━'.repeat(60) + '\n');

const child = spawn('npx', playwrightArgs, { env, stdio: 'inherit', shell: true });

child.on('close', exitCode => {
  console.log('\n' + '━'.repeat(60));
  console.log(`  Run complete — exit code ${exitCode}`);

  let results = [];
  if (fs.existsSync('nala-results.json')) {
    try {
      const data = JSON.parse(fs.readFileSync('nala-results.json', 'utf8'));
      results = data.results || [];
    } catch {}
  }

  const entry = writeHistory(runId, opts, baseUrl, results);

  console.log(`  Passed : ${entry.passed}  Failed : ${entry.failed}  Total : ${entry.total}`);
  console.log(`  Rate   : ${entry.passRate}%`);
  console.log(`  Saved  : dashboard/runs/${runId}.json`);
  console.log(`  History: dashboard/run-history.json`);
  console.log('━'.repeat(60) + '\n');

  notifySlack(entry);
  process.exit(exitCode);
});

child.on('error', err => {
  console.error('Failed to start playwright:', err.message);
  process.exit(1);
});
