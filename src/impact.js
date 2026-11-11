'use strict';
// Rule-based test impact analysis: changed files + Jira components -> pages to test.
// Deterministic first; an LLM may add an explanation but never decides what is in scope.
const { readData } = require('./data');
const RANK = { low: 0, medium: 1, high: 2 };

function globToRegex(glob) {
  let re = '';
  for (let i = 0; i < glob.length; ) {
    if (glob.startsWith('**/', i)) { re += '(?:.*/)?'; i += 3; }
    else if (glob.startsWith('**', i)) { re += '.*'; i += 2; }
    else if (glob[i] === '*') { re += '[^/]*'; i += 1; }
    else if (glob[i] === '?') { re += '[^/]'; i += 1; }
    else { re += glob[i].replace(/[.+^${}()|[\]\\]/g, '\\$&'); i += 1; }
  }
  return new RegExp('^' + re + '$');
}

function build({ jira, pr }) {
  const map = readData('impact-map.json');
  const hits = new Map();
  const unmapped = [];
  const ignored = [];

  const hit = (page, area, file, risk, wide) => {
    const h = hits.get(page) || { page, risk: 'low', areas: new Set(), files: new Set(), wide: true };
    if (RANK[risk] > RANK[h.risk]) h.risk = risk;
    h.areas.add(area);
    if (file) h.files.add(file);
    if (!wide) h.wide = false;
    hits.set(page, h);
  };

  for (const f of (pr ? pr.files : [])) {
    let matched = false, ignore = false;
    for (const rule of map.rules) {
      if (!globToRegex(rule.match).test(f.filename)) continue;
      if (rule.ignore) { ignore = true; continue; }
      matched = true;
      const wide = rule.pages === '*';
      for (const p of (wide ? map.widePages : rule.pages)) hit(p, rule.area, f.filename, rule.risk, wide);
    }
    if (!matched) (ignore ? ignored : unmapped).push(f.filename);
  }

  if (jira) {
    for (const comp of jira.components || []) {
      const area = map.jiraComponents[comp];
      if (!area) continue;
      for (const rule of map.rules.filter((r) => r.area === area && Array.isArray(r.pages))) {
        for (const p of rule.pages) hit(p, area, null, rule.risk, false);
      }
    }
  }
  for (const p of map.alwaysPages) if (!hits.has(p)) hit(p, 'Smoke baseline', null, 'low', false);

  const items = [...hits.values()]
    .sort((a, b) => RANK[b.risk] - RANK[a.risk] || a.page.localeCompare(b.page))
    .map((h) => ({
      id: 'it-' + h.page, page: h.page, risk: h.risk, wide: h.wide, included: true,
      areas: [...h.areas], files: [...h.files],
      reason: h.risk === 'low' && !h.files.size
        ? 'Smoke baseline: always checked.'
        : `${[...h.areas].join(', ')}${h.files.size ? ` (${h.files.size} changed file${h.files.size > 1 ? 's' : ''})` : ' (from the Jira component)'}${h.wide ? ' - wide-impact change' : ''}`,
    }));
  return { items, unmapped, ignored, suite: map.suite };
}

function estimate(plan) {
  const map = readData('impact-map.json');
  const pages = plan.items.filter((i) => i.included).length;
  const tests = pages * map.testsPerPage;
  const minutes = Math.max(1, Math.ceil((tests * map.minutesPerTest) / Math.max(1, plan.settings.workers)));
  return { pages, tests, minutes };
}

module.exports = { build, estimate, globToRegex };
