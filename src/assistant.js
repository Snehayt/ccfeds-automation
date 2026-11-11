'use strict';
// The conversational layer. It can READ (Jira, PRs, results) and PROPOSE (plans).
// It cannot approve and cannot bypass the gate: starting a run goes through runs.requestRun(), which re-checks approval.
const store = require('./store');
const g = require('./guardrails');
const plans = require('./plans');
const runs = require('./runs');
const llm = require('./adapters/llm');

const tasks = require('./tasks');
const planner = require('./planner');
const { planContext, withTimeout } = planner;

async function planFrom(jiraKey, prNum) {
  const plan = await planner.draftPlan({ jiraKey, prNum, origin: { type: 'chat', event: 'asked in chat' } });
  const v = plans.view(plan);
  const pr = plan.context.pr, issue = plan.context.jira;
  const files = pr ? pr.files.length : 0;
  const mapped = files - plan.ignored.length - plan.unmapped.length;
  const high = plan.items.filter((i) => i.risk === 'high').length;
  const lines = [`Drafted plan **${plan.id}** from ${[issue && issue.key, pr && 'PR #' + pr.number].filter(Boolean).join(' and ')}.`, ''];
  if (pr) lines.push(`- ${files} changed files: ${mapped} map to pages, ${plan.ignored.length} ignored (docs or unit tests), ${plan.unmapped.length} not mapped.`);
  lines.push(`- ${plan.items.length} pages in scope (${high} high risk). Estimate: ${v.estimate.tests} tests, about ${v.estimate.minutes} min with ${plan.settings.workers} workers.`);
  if (plan.items.some((i) => i.wide)) lines.push('- Some files affect every page, so the plan is wide. Consider whether you want the full set.');
  for (const w of plan.warnings.filter((x) => /No pull request/.test(x))) lines.push(`- ${w}`);
  if (plan.unmapped.length) lines.push(`- **Not mapped:** ${plan.unmapped.join(', ')}. I don't know which pages this affects. Add a rule to the impact map or choose pages yourself.`);
  if (plan.aiRationale) lines.push('', 'AI rationale (check it, I can be wrong):', plan.aiRationale);
  lines.push('', '**Nothing has run.** Review and edit the plan in the Plan tab. A QE must approve it before anything can start.');
  return { text: lines.join('\n') };
}

function inbox() {
  const open = tasks.list().filter((t) => t.status !== 'signed_off');
  if (!open.length) return { text: 'Your inbox is empty. When a Jira ticket moves to "In Test" it shows up there already analysed. You can also ask me to plan a ticket.' };
  const lines = [`**${open.length} task${open.length > 1 ? 's' : ''} waiting:**`,
    ...open.slice(0, 8).map((t) => `- ${t.key || 'PR #' + t.pr}: ${t.label}, ${t.pages} pages (${t.risk} risk)${t.seen ? '' : ' (new)'}`),
    '', 'Open one from the Inbox tab to review it. Nothing runs until a QE approves.'];
  return { text: lines.join('\n') };
}

async function tryRun() {
  const plan = plans.current();
  if (!plan) return { text: 'There is no plan yet. Ask me to plan testing for a ticket first, for example "Plan testing for FEDS-1423".' };
  try {
    const run = runs.requestRun(plan.id, { actor: 'assistant' });
    return { text: `${plan.id} is approved (by ${plan.approval.by}), so I started **${run.id}**. I'll explain the results when it finishes.` };
  } catch (e) {
    if (e instanceof g.GuardrailError) {
      return { kind: 'refusal', text: `I can't start that. ${e.message}\n\nA QE has to approve the plan in the Approval tab. I can't approve it for you, and I can't run anything without that approval.` };
    }
    throw e;
  }
}

function latestCompleted() {
  return Object.values(store.get().runs).filter((r) => r.status === 'completed' && r.analysis)
    .sort((a, b) => String(b.finishedAt).localeCompare(String(a.finishedAt)))[0];
}

async function explainRun() {
  const run = latestCompleted();
  if (!run) { const cur = runs.current(); return { text: cur && ['queued', 'running'].includes(cur.status) ? `${cur.id} is still running (${cur.done}/${cur.total} tests). Ask again when it finishes.` : 'There is no completed run to explain yet.' }; }
  const a = run.analysis;
  const lines = [`**${run.id}**: ${a.narrative}`, ''];
  for (const grp of a.groups) lines.push(`- ${grp.label} (${grp.count}): ${grp.hypothesis.action}`);
  const vp = a.vsPrevious;
  lines.push('', `Compared with the previous run: pass rate ${vp.delta >= 0 ? '+' : ''}${vp.delta} points, ${vp.newFailures.length} new failure(s), ${vp.stillFailing.length} still failing.`);
  lines.push('', `**Recommendation: ${a.recommendation.decision.replace(/_/g, ' ')}.** ${a.recommendation.text}`, 'I can recommend but not decide. Sign-off is recorded by a QE in the Sign-off tab.');
  if (a.aiExplanation) lines.push('', 'AI explanation (check it, I can be wrong):', a.aiExplanation);
  return { text: lines.join('\n') };
}

function signoffAdvice() {
  const run = latestCompleted();
  if (!run) return { text: 'There is nothing to sign off yet: no completed run. Once a run finishes I can recommend, and a QE records the decision.' };
  const r = run.analysis.recommendation;
  return { text: `For ${run.id} I would say: **${r.decision.replace(/_/g, ' ')}.** ${r.text}\n\nThe decision is yours. Record it in the Sign-off tab.` };
}

function runStatus() {
  const run = runs.current();
  if (!run) return { text: 'No run has been started.' };
  if (['queued', 'running'].includes(run.status)) return { text: `${run.id} is ${run.status}: ${run.done}/${run.total} tests done.` };
  return { text: `${run.id} ${run.status}. ${run.analysis ? run.analysis.narrative : ''}` };
}

function explainPlan() {
  const plan = plans.current();
  if (!plan) return { text: 'There is no plan yet.' };
  const lines = ['Why each page is in the plan:', ...plan.items.filter((i) => i.included).map((i) => `- **${i.page}** (${i.risk}): ${i.reason}`)];
  if (plan.unmapped.length) lines.push('', `Files I could not map: ${plan.unmapped.join(', ')}`);
  return { text: lines.join('\n') };
}

const HELP = 'Here is what I can do:\n- **Plan testing for <Jira key>** (or **PR 482**): read the ticket and PR, map changed files to pages, draft a plan.\n' +
  '- **Why these pages?**: explain the plan.\n- **What is waiting for me?**: list the tasks in your inbox (tickets that moved to In Test).\n- **Run it**: only works after a QE approves the plan.\n- **Why did it fail?** / **Am I ready to sign off?**: explain the results and recommend.\n\n' +
  'I can read and propose. I cannot approve, and I cannot run anything on my own.';

async function fallback(text) {
  if (llm.enabled()) {
    const plan = plans.current(), run = latestCompleted();
    const ctx = [plan ? planContext(plan) : 'No plan.', run ? runs.runContext(run) : 'No completed run.'].join('\n');
    try { return { text: (await withTimeout(llm.answer(text, ctx), 40000)) + '\n\n(AI answer, check it.)' }; }
    catch (e) { return { text: HELP + `\n\n(The model is unavailable: ${e.message})` }; }
  }
  return { text: HELP };
}

async function route(text) {
  const key = (text.match(/\b([A-Z][A-Z0-9]{1,9}-\d+)\b/) || [])[1];
  const pr = (text.match(/(?:\bPR\b|pull request|#)\s*#?(\d{1,6})\b/i) || [])[1];
  const l = text.toLowerCase();
  if (/\b(inbox|waiting for me|my tasks|pending tasks)\b|what('?s| is) (new|waiting|pending)/.test(l)) return inbox();
  if (/sign[\s-]?off|ready to (ship|release|go)|go\s*\/?\s*no[\s-]?go|can we (ship|release)/.test(l)) return signoffAdvice();
  if (!key && !pr && /\b(approve|go ahead|looks good)\b/.test(l)) return { kind: 'refusal', text: "I can't approve plans. Approval has to come from a QE, in the Approval tab. That's deliberate: it keeps a person accountable for what runs." };
  if (!key && !pr && /why (these|those) pages|explain (the )?plan|rationale/.test(l)) return explainPlan();
  if (!key && !pr && /\b(run|execute|start|kick off|trigger)\b/.test(l)) return tryRun();
  if (!key && !pr && /why|fail|explain|what went wrong|analy[sz]e|results?/.test(l)) return explainRun();
  if (!key && !pr && /status|progress|how is|done yet/.test(l)) return runStatus();
  if (key || pr) return planFrom(key, pr);
  return fallback(text);
}

async function handle(message) {
  const text = String(message || '').trim().slice(0, 2000);
  if (!text) return null;
  store.addChat('user', text);
  let reply;
  try { reply = await route(text); }
  catch (e) { reply = { kind: 'error', text: e instanceof g.GuardrailError ? e.message : `Sorry, that didn't work: ${e.message}` }; }
  store.addChat('assistant', reply.text, reply.kind);
  store.save();
  return reply;
}

function chips() {
  const plan = plans.current();
  const run = runs.current();
  if (!plan) return ['What is waiting for me?', 'Plan testing for FEDS-1423', 'Plan testing for FEDS-1500', 'What can you do?'];
  if (plan.status === 'draft') return ['Why these pages?', 'Run it now', 'Plan testing for FEDS-1311'];
  if (plan.status === 'approved') return ['Run it now'];
  if (plan.status === 'running') return ['How is the run going?'];
  if (plan.status === 'completed') return ['Why did it fail?', 'Am I ready to sign off?'];
  if (plan.status === 'signed_off') return ['Plan testing for FEDS-1311'];
  return run ? ['How is the run going?'] : [];
}

module.exports = { handle, chips };
