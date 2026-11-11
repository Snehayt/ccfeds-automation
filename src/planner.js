'use strict';
// One analysis path for everything: chat, Jira webhook, polling. Reads Jira + PR, maps files to pages, stores a DRAFT plan.
// It never approves and never runs anything.
const store = require('./store');
const impact = require('./impact');
const jira = require('./adapters/jira');
const github = require('./adapters/github');
const llm = require('./adapters/llm');

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('The model took too long.')), ms))]);

function planContext(plan) {
  const j = plan.context.jira, pr = plan.context.pr;
  return [j ? `Jira ${j.key}: ${j.summary}. Components: ${(j.components || []).join(', ')}. Description: ${String(j.description || '').slice(0, 600)}` : '',
    pr ? `PR #${pr.number}: ${pr.title}. Files: ${pr.files.map((f) => f.filename).join(', ')}` : '',
    'Plan items:\n' + plan.items.filter((i) => i.included).map((i) => `- ${i.page} [${i.risk}]: ${i.reason}`).join('\n'),
    plan.unmapped.length ? 'Unmapped files: ' + plan.unmapped.join(', ') : ''].filter(Boolean).join('\n');
}

// origin: { type: 'chat' | 'webhook' | 'poll' | 'simulated', event?: string, at?: ISO }
async function draftPlan({ jiraKey, prNum, origin }) {
  const interactive = origin.type === 'chat';          // a person is waiting: fail loudly. Automatic intake: keep the task and warn.
  const warnings = [];
  const issue = jiraKey ? await jira.getIssue(jiraKey) : null;
  const num = prNum ? Number(prNum) : issue && issue.linkedPrs && issue.linkedPrs[0];
  let pr = null;
  if (num) {
    try { pr = await github.getPullRequest(num); }
    catch (e) { if (interactive) throw e; warnings.push(`Could not read PR #${num}: ${e.message}`); }
  } else if (issue) {
    warnings.push('No pull request is linked to this ticket, so the scope comes from the Jira component only.');
  }
  if (!issue && !pr) throw new Error('Give me a Jira key (for example FEDS-1423) or a PR number.');

  const built = impact.build({ jira: issue, pr });
  if (built.unmapped.length) warnings.push(`${built.unmapped.length} changed file(s) could not be mapped to a page.`);
  if (!built.items.some((i) => i.risk !== 'low')) warnings.push('Nothing maps to a page beyond the smoke baseline. Scope this by hand.');

  const now = new Date().toISOString();
  const plan = {
    id: store.nextId('PLAN'), status: 'draft', version: 1, createdAt: now,
    origin: { type: origin.type, event: origin.event || '', at: origin.at || now },
    seen: interactive,                                  // tasks created by a person are already "seen"
    source: { jira: issue && issue.key, pr: pr && pr.number }, context: { jira: issue, pr },
    items: built.items, unmapped: built.unmapped, ignored: built.ignored, warnings,
    settings: { suite: built.suite, environment: 'stage', browser: 'chrome', device: 'desktop', locale: 'us', retries: 1, workers: 2, grep: '' },
    notes: '', approval: null, runId: null, signoff: null, aiRationale: null, scenario: 'mixed',
  };
  const st = store.get();
  st.plans[plan.id] = plan;
  if (interactive) st.currentPlanId = plan.id;           // automatic intake never hijacks what the QE has open
  store.audit(interactive ? 'assistant' : 'intake', interactive ? 'plan_drafted' : 'task_created',
    `${plan.id} from ${plan.source.jira || '-'} / PR ${plan.source.pr || '-'}${interactive ? '' : ` (${origin.type}: ${origin.event || 'event'})`}`);

  if (llm.enabled()) {
    try { plan.aiRationale = await withTimeout(llm.explainPlan(planContext(plan)), 30000); }
    catch (e) { plan.aiError = e.message; }
  }
  store.save();
  return plan;
}

module.exports = { draftPlan, planContext, withTimeout };
