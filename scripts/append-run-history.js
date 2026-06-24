#!/usr/bin/env node
'use strict';

/**
 * Called by GitHub Actions after merge-results.js.
 * Reads the merged nala-results.json, appends a summary entry to
 * dashboard/run-history.json, and copies the full run to dashboard/runs/.
 *
 * Env vars (passed from workflow outputs):
 *   SUITE, BROWSER, DEVICE, LOCALE, BASE_URL, TEST_PAGE,
 *   ENVIRONMENT, TRIGGERED_BY, RUN_URL
 */

const fs   = require('fs');
const path = require('path');

const resultsFile  = 'nala-results.json';
const historyFile  = path.join('dashboard', 'run-history.json');
const runsDir      = path.join('dashboard', 'runs');

if (!fs.existsSync(resultsFile)) {
  console.log('No nala-results.json found — skipping history update');
  process.exit(0);
}

// ── Read results ──────────────────────────────────────────────────────────────
let runData;
try {
  runData = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
} catch (e) {
  console.error('Failed to parse nala-results.json:', e.message);
  process.exit(1);
}

const results = runData.results || [];
const total   = results.length;
const passed  = results.filter(r => r.status === 'passed').length;
const failed  = results.filter(r => r.status === 'failed').length;

// ── Augment nala-results.json with run metadata ───────────────────────────────
runData.suite       = process.env.SUITE       || runData.suite       || 'unknown';
runData.browser     = process.env.BROWSER     || runData.browser     || 'chrome';
runData.device      = process.env.DEVICE      || runData.device      || 'desktop';
runData.locale      = process.env.LOCALE      || runData.locale      || 'us';
runData.baseURL     = process.env.BASE_URL    || runData.baseURL     || '';
runData.testPage    = process.env.TEST_PAGE   || runData.testPage    || '';
runData.environment = process.env.ENVIRONMENT || runData.environment || '';
runData.triggeredBy = process.env.TRIGGERED_BY || 'GitHub Actions';
runData.runUrl      = process.env.RUN_URL     || '';

fs.writeFileSync(resultsFile, JSON.stringify(runData));

// ── Read existing history ─────────────────────────────────────────────────────
let history = [];
if (fs.existsSync(historyFile)) {
  try { history = JSON.parse(fs.readFileSync(historyFile, 'utf8')); } catch {}
}

// ── Build run ID + entry ──────────────────────────────────────────────────────
const now   = new Date();
const runId = `run-${now.toISOString().replace(/:/g, '-').replace(/\./g, '-').slice(0, 22)}`;

const entry = {
  id:          runId,
  timestamp:   now.toISOString(),
  suite:       runData.suite,
  browser:     runData.browser,
  device:      runData.device,
  locale:      runData.locale,
  url:         runData.baseURL,
  page:        runData.testPage,
  passed,
  failed,
  total,
  passRate:    total > 0 ? ((passed / total) * 100).toFixed(1) : '0',
  triggeredBy: runData.triggeredBy,
  runUrl:      runData.runUrl,
};

// ── Prepend + trim to 50 entries ──────────────────────────────────────────────
history.unshift(entry);
if (history.length > 50) history = history.slice(0, 50);

if (!fs.existsSync(path.join('dashboard'))) fs.mkdirSync('dashboard', { recursive: true });
if (!fs.existsSync(runsDir)) fs.mkdirSync(runsDir, { recursive: true });

fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

// ── Save full run to runs/ ────────────────────────────────────────────────────
runData.runId = runId;
fs.writeFileSync(path.join(runsDir, `${runId}.json`), JSON.stringify(runData));

console.log(`Run history updated: ${history.length} total runs`);
console.log(`Run saved as: ${runId}`);
console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${total}  Rate: ${entry.passRate}%`);
