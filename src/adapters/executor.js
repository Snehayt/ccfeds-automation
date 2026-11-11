'use strict';
// Execution adapters. Both are only ever called from runs.js AFTER guardrails.assertCanRun().
//   sim    - simulated runner with realistic results (default; needs nothing)
//   github - dispatches your existing GitHub Actions workflow and polls it (UNTESTED against real GitHub here)
const crypto = require('crypto');
const cfg = require('../config');
const { request } = require('./http');

const TEST_NAMES = ['loads and shows brand', 'menu links open', 'sign-in and search'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ERR = {
  timeout: (sel) => `Test timeout of 60000ms exceeded.\nError: page.waitForSelector: Timeout 30000ms exceeded.\nCall log:\n  - waiting for locator('${sel}') to be visible`,
  locator: (sel) => `Error: expect(locator).toBeVisible() failed\n\nLocator: ${sel}\nExpected: visible\nReceived: <element(s) not found>\nTimeout: 10000ms`,
  assertion: (exp, got) => `Error: expect(received).toContain(expected)\n\nExpected substring: "${exp}"\nReceived string:    "${got}"`,
  network: (page) => `Error: page.goto: net::ERR_CONNECTION_TIMED_OUT at https://stage.example.com/${page}`,
};

function hashInt(s, mod) { return parseInt(crypto.createHash('md5').update(s).digest('hex').slice(0, 6), 16) % mod; }

// Decide what each simulated test does, based on the plan and the chosen scenario.
function buildDefs(plan, scenario) {
  const { suite, locale, browser } = plan.settings;
  const items = plan.items.filter((i) => i.included);
  const pages = items.map((i) => i.page);
  const navItem = items.find((i) => i.risk === 'high' && !i.wide) || items[0];
  const navPage = navItem && navItem.page;
  const knownPage = pages.includes('cc-business') && navPage !== 'cc-business' ? 'cc-business' : null;
  const rest = pages.filter((p) => p !== navPage && p !== knownPage);
  const timeoutPages = rest.slice(0, 2);
  const flakyPage = rest.find((p) => !timeoutPages.includes(p));

  const defs = [];
  for (const page of pages) {
    for (const name of TEST_NAMES) {
      const id = `${suite}::${locale}::${page}::${name}`;
      const d = { id, page, name, title: `${suite}-${locale}-${page} | ${name}`, browser, durationMs: 1500 + hashInt(id, 7500), status: 'passed', flaky: false, attempts: 1, error: null };
      if (scenario === 'mixed') {
        if (page === navPage && name === 'menu links open') { d.status = 'failed'; d.attempts = plan.settings.retries + 1; d.error = ERR.locator("header .feds-nav a[daa-ll='Creative Cloud']"); }
        else if (page === knownPage && name === 'sign-in and search') { d.status = 'failed'; d.attempts = plan.settings.retries + 1; d.error = ERR.assertion('Sign in', 'Sign In'); }
        else if (timeoutPages.includes(page) && name === 'sign-in and search') { d.status = 'failed'; d.attempts = plan.settings.retries + 1; d.error = ERR.timeout('.feds-search-input'); }
        else if (page === flakyPage && name === 'menu links open') { d.flaky = true; d.attempts = 2; d.firstError = ERR.timeout('.feds-nav'); }
      } else if (scenario === 'outage') {
        if (hashInt(id, 10) < 7) { d.status = 'failed'; d.attempts = plan.settings.retries + 1; d.error = hashInt(id + 'x', 2) ? ERR.network(page) : ERR.timeout('.feds-brand'); }
      }
      defs.push(d);
    }
  }
  return defs;
}

function startSim(run, plan, hooks) {
  const defs = buildDefs(plan, run.scenario || 'mixed');
  run.total = defs.length;
  const totalMs = Math.max(500, cfg.exec.simSeconds * 1000);
  const queueMs = Math.min(1500, totalMs * 0.1);
  const step = Math.max(20, (totalMs - queueMs) / (defs.length + 1));
  run.log.push('Queued on the simulated runner.');
  hooks.update(run);
  const later = (fn, ms) => setTimeout(fn, ms).unref();

  later(() => {
    run.status = 'running'; run.startedAt = new Date().toISOString();
    run.log.push(`Runner picked up the job: ${defs.length} tests, ${plan.settings.workers} worker(s), browser ${plan.settings.browser}.`);
    hooks.update(run);
    const tick = (i) => {
      if (i >= defs.length) {
        run.status = 'completed'; run.finishedAt = new Date().toISOString();
        run.log.push('Run completed.');
        return hooks.done(run);
      }
      later(() => {
        const { firstError, ...t } = defs[i];
        run.tests.push(t); run.done = i + 1;
        if (t.status === 'failed') run.log.push(`FAILED  ${t.title}`);
        else if (t.flaky) run.log.push(`FLAKY   ${t.title} (passed on retry)`);
        hooks.update(run);
        tick(i + 1);
      }, step);
    };
    tick(0);
  }, queueMs);
}

// ---------- real GitHub Actions ----------
function normalizeResults(json, plan) {
  const tests = [];
  const mapStatus = (s) => (s === 'skipped' ? 'skipped' : ['failed', 'unexpected', 'timedOut'].includes(s) ? 'failed' : 'passed');
  const add = (t) => tests.push({
    id: t.id || `${plan.settings.suite}::${plan.settings.locale}::${t.page}::${t.name}`, title: t.title || t.name, page: t.page || 'unknown', name: t.name || t.title,
    browser: plan.settings.browser, status: mapStatus(t.status), flaky: !!t.flaky, attempts: t.attempts || 1, durationMs: t.durationMs || 0, error: t.error || null,
  });
  if (json && Array.isArray(json.tests)) {
    json.tests.forEach((t) => add({ ...t, durationMs: t.durationMs || t.duration }));
  } else if (json && Array.isArray(json.suites)) {            // Playwright JSON reporter
    const walk = (suites) => {
      for (const s of suites) {
        for (const spec of s.specs || []) for (const t of spec.tests || []) {
          const results = t.results || []; const last = results[results.length - 1] || {};
          const parts = String(spec.title).split('|').map((x) => x.trim());
          const page = parts.length >= 3 ? parts[parts.length - 1].replace(/,$/, '') : String(spec.file || '').replace(/^.*[\\/]/, '').replace(/\.\w+$/, '');
          add({ title: spec.title, name: spec.title, page, status: t.status === 'flaky' ? 'passed' : t.status, flaky: t.status === 'flaky',
                attempts: results.length || 1, durationMs: results.reduce((a, r) => a + (r.duration || 0), 0),
                error: last.error ? (last.error.message || last.error.stack) : null });
        }
        walk(s.suites || []);
      }
    };
    walk(json.suites);
  }
  return tests;
}

async function startGithub(run, plan, hooks) {
  const { api, token, repo, workflow, ref, resultsUrl } = cfg.exec;
  if (!token || !repo) throw new Error('EXEC_MODE=github needs AUTOMATION_REPO and DISPATCH_TOKEN.');
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'traverse-assistant', 'Content-Type': 'application/json' };
  const t0 = new Date(Date.now() - 10000).toISOString();
  run.log.push(`Dispatching ${workflow} on ${repo}@${ref}`);
  hooks.update(run);
  await request(`${api}/repos/${repo}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`, { method: 'POST', headers, body: JSON.stringify({ ref, inputs: run.inputs }) });

  let gh = null;
  for (let i = 0; i < 24 && !gh; i++) {
    await sleep(cfg.exec.pollFindMs);
    const r = (await request(`${api}/repos/${repo}/actions/runs?event=workflow_dispatch&per_page=10&created=${encodeURIComponent('>=' + t0)}`, { headers })).json;
    gh = ((r && r.workflow_runs) || []).filter((x) => String(x.path || '').endsWith(workflow)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  }
  if (!gh) throw new Error('The workflow was dispatched, but its run was not found within two minutes.');
  run.githubRunId = gh.id; run.url = gh.html_url; run.status = 'running'; run.startedAt = new Date().toISOString();
  run.log.push(`GitHub run ${gh.id}: ${gh.html_url}`);
  hooks.update(run);

  for (let i = 0; i < 480; i++) {                                // up to 2 hours, every 15 s
    await sleep(cfg.exec.pollRunMs);
    const cur = (await request(`${api}/repos/${repo}/actions/runs/${gh.id}`, { headers })).json;
    if (cur.status === 'completed') { run.conclusion = cur.conclusion; break; }
  }
  if (!run.conclusion) throw new Error('Timed out waiting for the GitHub run to finish.');
  if (resultsUrl) {
    const url = resultsUrl.replace('{runId}', String(gh.id));
    try { run.tests = normalizeResults((await request(url)).json, plan); }
    catch (e) { run.log.push(`Could not read results from ${url}: ${e.message}`); }
  } else { run.log.push('RESULTS_URL_TEMPLATE is not set, so test-level results are not available.'); }
  run.total = run.done = run.tests.length;
  run.status = run.tests.length ? 'completed' : 'failed';
  run.finishedAt = new Date().toISOString();
  hooks.done(run);
}

function start(run, plan, hooks) {
  if (cfg.exec.mode === 'github') {
    startGithub(run, plan, hooks).catch((e) => { run.status = 'failed'; run.finishedAt = new Date().toISOString(); run.log.push('ERROR: ' + e.message); hooks.done(run); });
  } else {
    startSim(run, plan, hooks);
  }
}

module.exports = { start, normalizeResults, buildDefs };
