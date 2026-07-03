#!/usr/bin/env node
'use strict';

const http         = require('http');
const { spawn }    = require('child_process');
const fs           = require('fs');
const path         = require('path');

const PORT    = 3001;
const ROOT    = path.resolve(__dirname, '..');

// ── Suite map ─────────────────────────────────────────────────────────────────
const SUITE_MAP = {
  'feds-lnav':             { config: 'configs/feds.config.js', testPath: 'tests/feds/feds-lnav' },
  'feds-photoshop-sanity': { config: 'configs/feds.config.js', testPath: 'tests/feds/photoshop.sanity.test.js' },
  'feds-sanity':           { config: 'configs/feds.config.js', testPath: 'tests/feds/homePageSanity.test.js tests/feds/bacomsanity.test.js' },
  'feds-header':           { config: 'configs/feds.config.js', testPath: 'tests/feds/header.test.js' },
  'feds-footer':           { config: 'configs/feds.config.js', testPath: 'tests/feds/footer.test.js' },
  'feds-search':           { config: 'configs/feds.config.js', testPath: 'tests/feds/search.test.js' },
  'feds-a11y':             { config: 'configs/feds.config.js', testPath: 'tests/feds/a11y.test.js' },
  'feds-jarvis':           { config: 'configs/feds.config.js', testPath: 'tests/feds/jarvis.desktop.test.js' },
  'feds-cmp-banner':       { config: 'configs/feds.config.js', testPath: 'tests/feds/cmp-banner.test.js' },
  'feds':                  { config: 'configs/feds.config.js', testPath: 'tests/feds' },
  'unav':                  { config: 'configs/feds.config.js', testPath: 'tests/feds/unav.test.js' },
  'site-redesign':         { config: 'configs/feds.config.js', testPath: 'tests/feds/site-redesign.test.js' },
  'cc-firefly':            { config: 'configs/cc.config.js',   testPath: 'tests/cc/firefly.test.js' },
  'cc-merch':              { config: 'configs/cc.config.js',   testPath: 'tests/cc/merchcard.test.js tests/cc/merchtable.test.js' },
  'cc-lingo':              { config: 'configs/cc.config.js',   testPath: 'tests/cc/lingo.test.js' },
  'cc-doodlebug':          { config: 'configs/cc.config.js',   testPath: 'tests/cc/doodlebug_prompt_based_imagegen_verbs.test.js' },
  'cc-sanity':             { config: 'configs/cc.config.js',   testPath: 'tests/cc/productionsanity.test.js' },
  'cc':                    { config: 'configs/cc.config.js',   testPath: 'tests/cc' },
  'express':               { config: 'configs/express-lingo.config.js', testPath: 'tests/express/lingo.test.js' },
  'all':                   { config: 'configs/feds.config.js', testPath: 'tests/feds' },
};

const FEDS_PROJECTS = {
  'chrome-desktop':  ['feds-chrome'],
  'firefox-desktop': ['feds-firefox'],
  'safari-desktop':  ['feds-webkit'],
  'chrome-mobile':   ['feds-iphone', 'feds-android'],
  'firefox-mobile':  ['feds-iphone'],
  'safari-mobile':   ['feds-iphone'],
  'chrome-tablet':   ['feds-ipad-air-portrait', 'feds-ipad-air-landscape'],
  'safari-tablet':   ['feds-ipad-air-portrait'],
  'all-desktop':     ['feds-chrome', 'feds-firefox', 'feds-webkit'],
  'all-mobile':      ['feds-iphone', 'feds-android'],
  'all-all':         [],
};

const CC_PROJECTS = {
  'chrome-desktop':  ['cc-live-chrome'],
  'firefox-desktop': ['cc-live-firefox'],
  'safari-desktop':  ['cc-live-webkit'],
  'chrome-mobile':   ['cc-live-Android-mobile'],
  'safari-mobile':   ['cc-live-IOS-mobile'],
  'all-desktop':     ['cc-live-chrome', 'cc-live-firefox', 'cc-live-webkit'],
  'all-all':         [],
};

const ENV_URLS = {
  'prod':     'https://www.adobe.com',
  'stage':    'https://www.stage.adobe.com',
  'aem-live': 'https://main--upp--adobecom.aem.live',
};

function getProjects(browser, device, config) {
  const key  = `${browser}-${device}`;
  const map  = config === 'configs/cc.config.js' ? CC_PROJECTS : FEDS_PROJECTS;
  const list = map[key] || map[`${browser}-desktop`] || ['feds-chrome'];
  return list.map(p => `--project=${p}`);
}

// ── Server state ──────────────────────────────────────────────────────────────
let activeProc   = null;
let activeStatus = { running: false };

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}

// ── HTTP server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  corsHeaders(res);

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ── GET /status ──────────────────────────────────────────────────────────────
  if (req.method === 'GET' && url.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activeStatus));
    return;
  }

  // ── POST /stop ───────────────────────────────────────────────────────────────
  if (req.method === 'POST' && url.pathname === '/stop') {
    if (activeProc) { activeProc.kill('SIGTERM'); activeProc = null; }
    activeStatus = { running: false };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // ── POST /run-raw — executes an exact playwright command ─────────────────────
  if (req.method === 'POST' && url.pathname === '/run-raw') {
    if (activeStatus.running) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'A run is already in progress. Stop it first.' }));
      return;
    }
    let params;
    try { params = await readBody(req); } catch { res.writeHead(400); res.end('Bad JSON'); return; }

    const cmdArgs  = params.args  || [];   // array of args after 'npx playwright test'
    const envVars  = { ...process.env, ...(params.env || {}) };
    const label    = params.label || 'custom command';

    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    const send = (type, payload) => res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);

    activeStatus = { running: true, suite: label, startedAt: new Date().toISOString() };
    send('start', { label, command: 'npx playwright test ' + cmdArgs.join(' ') });

    const proc = spawn('npx', ['playwright', 'test', ...cmdArgs, '--reporter=list'], { cwd: ROOT, env: envVars, shell: true });
    activeProc = proc;

    proc.stdout.on('data', d => send('output', d.toString()));
    proc.stderr.on('data', d => send('output', d.toString()));
    proc.on('close', code => {
      activeProc = null; activeStatus = { running: false };
      let results = null;
      try { results = JSON.parse(fs.readFileSync(path.join(ROOT, 'nala-results.json'), 'utf8')); } catch {}
      if (results) try { fs.writeFileSync(path.join(ROOT, 'dashboard', 'nala-results.json'), JSON.stringify(results)); } catch {}
      send('done', { code, results }); res.end();
    });
    proc.on('error', err => { activeProc = null; activeStatus = { running: false }; send('error', err.message); res.end(); });
    req.on('close', () => { if (activeProc) { activeProc.kill('SIGTERM'); activeProc = null; activeStatus = { running: false }; } });
    return;
  }

  // ── POST /run ────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && url.pathname === '/run') {
    if (activeStatus.running) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'A run is already in progress. Stop it first.' }));
      return;
    }

    let params;
    try { params = await readBody(req); }
    catch { res.writeHead(400); res.end('Bad JSON'); return; }

    const suite    = params.suite       || 'feds-lnav';
    const browser  = params.browser     || 'chrome';
    const device   = params.device      || 'desktop';
    const env      = params.environment || 'prod';
    const locale   = params.locale      || 'us';
    const testPage = params.test_page   || '';
    const grep     = params.grep        || '';
    const retries  = params.retries     != null ? String(params.retries) : '1';
    const workers  = params.workers     || '';

    const conf    = SUITE_MAP[suite] || SUITE_MAP['feds-lnav'];
    const baseUrl = params.urls || ENV_URLS[env] || ENV_URLS['prod'];
    const projects = getProjects(browser, device, conf.config);

    const args = [
      'playwright', 'test',
      ...conf.testPath.split(' ').filter(Boolean),
      `--config=${conf.config}`,
      ...projects,
      `--retries=${retries}`,
      '--reporter=list',
    ];
    if (grep)    args.push(`--grep=${grep}`);
    if (workers) args.push(`--workers=${workers}`);

    // SSE response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':   'keep-alive',
    });

    const send = (type, payload) =>
      res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);

    activeStatus = { running: true, suite, browser, device, env, startedAt: new Date().toISOString() };
    send('start', { suite, browser, device, env, baseUrl, command: `npx ${args.join(' ')}` });

    const envVars = {
      ...process.env,
      BASE_URL:  baseUrl,
      TEST_PAGE: testPage,
      LOCALE:    locale,
      CI:        'false',
    };

    const proc = spawn('npx', args, { cwd: ROOT, env: envVars, shell: true });
    activeProc = proc;

    proc.stdout.on('data', d => send('output', d.toString()));
    proc.stderr.on('data', d => send('output', d.toString()));

    proc.on('close', code => {
      activeProc   = null;
      activeStatus = { running: false };

      let results = null;
      try { results = JSON.parse(fs.readFileSync(path.join(ROOT, 'nala-results.json'), 'utf8')); } catch {}

      // Copy results to dashboard
      if (results) {
        try {
          fs.mkdirSync(path.join(ROOT, 'dashboard'), { recursive: true });
          fs.writeFileSync(path.join(ROOT, 'dashboard', 'nala-results.json'), JSON.stringify(results));
        } catch {}
      }

      send('done', { code, results });
      res.end();
    });

    proc.on('error', err => {
      activeProc   = null;
      activeStatus = { running: false };
      send('error', err.message);
      res.end();
    });

    req.on('close', () => {
      if (activeProc) { activeProc.kill('SIGTERM'); activeProc = null; activeStatus = { running: false }; }
    });

    return;
  }

  // Serve static dashboard files
  const MIME = { '.html':'text/html', '.js':'application/javascript', '.json':'application/json', '.css':'text/css', '.png':'image/png', '.ico':'image/x-icon' };
  let filePath = url.pathname === '/' ? '/agent.html' : url.pathname;
  const abs = path.join(ROOT, 'dashboard', filePath);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
    const ext = path.extname(abs);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    fs.createReadStream(abs).pipe(res);
    return;
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  FEDS Agent Server');
  console.log(`  Listening on http://localhost:${PORT}`);
  console.log('');
  console.log('  Open dashboard/agent.html in your browser');
  console.log('  Press Ctrl+C to stop');
  console.log('');
});

process.on('SIGINT', () => {
  if (activeProc) activeProc.kill('SIGTERM');
  process.exit(0);
});
