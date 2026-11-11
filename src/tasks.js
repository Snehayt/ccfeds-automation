'use strict';
// The inbox: every plan is a task. Intake creates them (analysed, not executed); a QE opens one to review, approve and run it.
const store = require('./store');
const plans = require('./plans');
const { GuardrailError } = require('./guardrails');

const RANK = { low: 0, medium: 1, high: 2 };
const LABEL = { draft: 'Needs review', approved: 'Approved, ready to run', running: 'Running', completed: 'Awaiting sign-off', signed_off: 'Done' };

function summary(p) {
  const st = store.get();
  const included = p.items.filter((i) => i.included);
  const risk = included.reduce((m, i) => (RANK[i.risk] > RANK[m] ? i.risk : m), 'low');
  const run = p.runId ? st.runs[p.runId] : null;
  return {
    id: p.id, key: p.source.jira, summary: p.context.jira ? p.context.jira.summary : (p.context.pr ? p.context.pr.title : ''),
    pr: p.source.pr, origin: p.origin || { type: 'chat', at: p.createdAt }, createdAt: p.createdAt,
    pages: included.length, risk, unmapped: p.unmapped.length, warnings: p.warnings || [],
    status: p.status, label: LABEL[p.status] || p.status, runId: p.runId, runStatus: run ? run.status : null,
    signoff: p.signoff ? p.signoff.decision : null, approvedBy: p.approval ? p.approval.by : null,
    seen: p.seen !== false, current: st.currentPlanId === p.id,
  };
}

const list = () => Object.values(store.get().plans).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).map(summary);

function open(id, actor) {
  const st = store.get();
  const plan = st.plans[id];
  if (!plan) throw new GuardrailError('Task not found.', 404);
  st.currentPlanId = id;
  st.currentRunId = plan.runId || null;
  plan.seen = true;
  store.audit(actor || 'qe', 'task_opened', `${id} ${plan.source.jira || ''}`);
  store.save();
  return plans.view(plan);
}

module.exports = { list, open, summary };
