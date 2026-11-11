'use strict';
// Rule-based result analysis. Explains failures, links them to the PR, and RECOMMENDS a sign-off outcome.
// A QE decides. An LLM (optional) only adds a plain-language explanation on top of these findings.
const { readData } = require('./data');
const store = require('./store');

function categorize(err) {
  const msg = String(err || '');
  const first = msg.split('\n')[0];
  if (/net::ERR_|ECONNREFUSED|ENOTFOUND|ECONNRESET/.test(msg)) return 'network';
  if (/Test timeout|Timeout \d+ms exceeded|timed out/i.test(first)) return 'timeout';
  if (/expect\(locator\)|resolved to 0|not found|strict mode/i.test(msg)) return 'locator';
  if (/expect\(received\)|toContain|toBe|toEqual|toHaveText|Expected/.test(msg)) return 'assertion';
  if (/timeout|timed out/i.test(msg)) return 'timeout';
  return 'other';
}

function signature(err) {
  return String(err || '').split('\n')[0]
    .replace(/https?:\/\/\S+/g, '<url>').replace(/\d+(ms|s)?/g, 'N').replace(/(["'`]).*?\1/g, '"..."').slice(0, 140);
}

const LABEL = { timeout: 'Timeouts', locator: 'Element not found', assertion: 'Assertion mismatch', network: 'Network errors', other: 'Other errors' };

function hypothesize(g, ctx) {
  if (g.knownIssue) {
    return { text: `Matches known issue ${g.knownIssue.ticket}: ${g.knownIssue.note}.`, confidence: 'high', action: 'No action for this release unless the severity has changed.' };
  }
  switch (g.category) {
    case 'timeout':
      return ctx.envShare >= 0.5 && g.pages.length >= 2
        ? { text: `Timeouts on ${g.pages.length} different pages point to a slow or unresponsive environment rather than separate bugs.`, confidence: g.pages.length >= 3 ? 'high' : 'medium', action: 'Check environment health, then re-run only these tests.' }
        : { text: 'An isolated timeout: either a slow page or a wait that is too short.', confidence: 'low', action: 'Re-run once. If it repeats, open the trace.' };
    case 'locator':
      return g.related
        ? { text: 'An element is missing on a page whose code changed in this PR. A selector or UI structure change is likely.', confidence: 'high', action: 'Decide: intended change (update the test) or regression (raise a bug).' }
        : { text: 'An element was not found on a page this PR did not directly change. Could be locator drift or a rendering delay.', confidence: 'low', action: 'Re-run once and compare with the previous run.' };
    case 'assertion':
      return g.related
        ? { text: 'The page content or behaviour differs from what the test expects, on an area this PR changed. Possible product regression.', confidence: 'medium', action: 'Compare with the Jira acceptance criteria before deciding.' }
        : { text: 'Content differs from what the test expects. Could be copy or test data rather than a code change.', confidence: 'low', action: 'Check the expected text with the page owner.' };
    case 'network':
      return { text: 'Network errors reaching the environment. Results are unreliable until it is healthy.', confidence: 'high', action: 'Check the environment, then re-run.' };
    default:
      return { text: 'Could not classify this failure automatically.', confidence: 'low', action: 'Open the trace and logs.' };
  }
}

function analyze(run, plan) {
  const hist = readData('mock-history.json');
  const known = new Map(hist.knownIssues.map((k) => [k.testId, k]));
  const itemByPage = Object.fromEntries(plan.items.map((i) => [i.page, i]));
  const pageRelated = (page) => !!itemByPage[page] && ['high', 'medium'].includes(itemByPage[page].risk) && !itemByPage[page].wide;
  const tests = run.tests;
  const total = tests.length;
  const failed = tests.filter((t) => t.status === 'failed');
  const passed = tests.filter((t) => t.status === 'passed');
  const skipped = tests.filter((t) => t.status === 'skipped');
  const flaky = tests.filter((t) => t.status === 'passed' && (t.flaky || t.attempts > 1));
  const passRate = total ? Math.round((passed.length / total) * 1000) / 10 : 0;
  const durationSec = run.startedAt && run.finishedAt ? Math.round((new Date(run.finishedAt) - new Date(run.startedAt)) / 1000) : null;

  // Group failures by cause pattern
  const map = new Map();
  for (const t of failed) {
    const category = categorize(t.error);
    const key = category + '|' + signature(t.error);
    const g = map.get(key) || { id: 'g' + (map.size + 1), category, label: LABEL[category], signature: signature(t.error), sampleError: t.error, tests: [], pages: [] };
    g.tests.push({ id: t.id, title: t.title, page: t.page, knownIssue: known.get(t.id) || null });
    if (!g.pages.includes(t.page)) g.pages.push(t.page);
    map.set(key, g);
  }
  const groups = [...map.values()].sort((a, b) => b.tests.length - a.tests.length);
  const envFailures = groups.filter((g) => ['timeout', 'network'].includes(g.category)).reduce((n, g) => n + g.tests.length, 0);
  const envShare = failed.length ? envFailures / failed.length : 0;
  for (const g of groups) {
    g.count = g.tests.length;
    g.knownIssue = g.tests.every((t) => t.knownIssue) ? g.tests[0].knownIssue : null;
    // Every page in the plan is PR-impacted, so relatedness is only a useful signal for element/assertion failures.
    g.related = !g.knownIssue && ['locator', 'assertion'].includes(g.category) && g.pages.some((p) => pageRelated(p));
    g.relatedFiles = g.related ? [...new Set(g.pages.flatMap((p) => (itemByPage[p] ? itemByPage[p].files : [])))].slice(0, 4) : [];
    Object.assign(g, { hypothesis: hypothesize(g, { envShare }) });
  }

  const blockers = failed.filter((t) => !known.get(t.id));
  const relatedBlockers = blockers.filter((t) => ['locator', 'assertion'].includes(categorize(t.error)) && pageRelated(t.page));
  const envBlockers = blockers.filter((t) => ['timeout', 'network'].includes(categorize(t.error)));
  const otherBlockers = blockers.length - relatedBlockers.length - envBlockers.length;

  // Compare with the previous completed run of this suite (or the sample history)
  const prev = Object.values(store.get().runs).filter((r) => r.id !== run.id && r.status === 'completed' && r.analysis && r.analysis.summary)
    .sort((a, b) => String(b.finishedAt).localeCompare(String(a.finishedAt)))[0];
  const prevFailed = prev ? prev.tests.filter((t) => t.status === 'failed').map((t) => t.id) : hist.previousRun.failed;
  const prevRate = prev ? prev.analysis.summary.passRate : hist.previousRun.passRate;
  const failedIds = failed.map((t) => t.id);
  const vsPrevious = { previousPassRate: prevRate, delta: Math.round((passRate - prevRate) * 10) / 10,
    newFailures: failedIds.filter((id) => !prevFailed.includes(id)), stillFailing: failedIds.filter((id) => prevFailed.includes(id)) };

  // Recommendation (never a decision)
  const envOutage = total > 0 && failed.length / total >= 0.4 && envShare >= 0.7;
  let decision, text;
  if (!total) { decision = 'hold'; text = 'No test results were captured, so there is nothing to sign off.'; }
  else if (envOutage) { decision = 'hold'; text = 'Most failures look like an environment problem (timeouts or network errors), so these results are not reliable. Re-run after checking the environment.'; }
  else if (blockers.length === 0 && failed.length === 0) { decision = 'approve'; text = flaky.length ? `All tests passed. ${flaky.length} test(s) needed a retry; worth a look but not blocking.` : 'All tests passed.'; }
  else if (blockers.length === 0) { decision = 'approve_with_known_issues'; text = `No new failures. ${failed.length} failure(s) match known issues (${[...new Set(failed.map((t) => known.get(t.id).ticket))].join(', ')}).`; }
  else {
    decision = 'hold';
    const parts = [];
    if (relatedBlockers.length) parts.push(`${relatedBlockers.length} ${relatedBlockers.length === 1 ? 'looks' : 'look'} related to what this PR changed`);
    if (envBlockers.length) parts.push(`${envBlockers.length} ${envBlockers.length === 1 ? 'looks' : 'look'} environmental (re-run ${envBlockers.length === 1 ? 'it' : 'them'})`);
    if (otherBlockers > 0) parts.push(`${otherBlockers} need a closer look`);
    text = `${blockers.length} failure(s) are not explained by a known issue: ${parts.join(', ')}. Triage before signing off.`;
  }

  const sentences = [`${passed.length} of ${total} tests passed (${passRate}%).`];
  if (failed.length) sentences.push(`${failed.length} failed, in ${groups.length} distinct pattern${groups.length > 1 ? 's' : ''}.`);
  for (const g of groups) sentences.push(`${g.label} (${g.count} test${g.count > 1 ? 's' : ''}, ${g.pages.join(', ')}): ${g.hypothesis.text}`);
  if (flaky.length) sentences.push(`${flaky.length} test(s) passed only on retry: ${flaky.map((t) => t.title).join('; ')}.`);

  return {
    summary: { total, passed: passed.length, failed: failed.length, skipped: skipped.length, flaky: flaky.length, passRate, durationSec },
    groups, vsPrevious, blockers: blockers.length, relatedBlockers: relatedBlockers.length, envBlockers: envBlockers.length,
    flakyTests: flaky.map((t) => ({ id: t.id, title: t.title })),
    recommendation: { decision, text, note: 'Recommendation only. A QE records the final decision.' },
    headline: sentences.slice(0, failed.length ? 2 : 1).join(' '),
    narrative: sentences.join(' '),
  };
}

module.exports = { analyze, categorize, signature };
