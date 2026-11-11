'use strict';
// The ONLY place a run can be created. It always re-checks the approval gate.
const store = require('./store');
const g = require('./guardrails');
const analysis = require('./analysis');
const executor = require('./adapters/executor');
const llm = require('./adapters/llm');
const cfg = require('./config');

function runContext(run) {
  const a = run.analysis;
  return a ? `${a.narrative}\nRecommendation: ${a.recommendation.decision}. ${a.recommendation.text}` : 'No analysis yet.';
}

function requestRun(planId, { actor, scenario } = {}) {
  const st = store.get();
  const plan = st.plans[planId];
  try {
    g.assertCanRun(plan);
    const active = Object.values(st.runs).find((r) => ['queued', 'running'].includes(r.status));
    if (active) throw new g.GuardrailError(`Run ${active.id} is still in progress. Only one run at a time in this prototype.`, 409);
  } catch (e) {
    store.audit(actor, 'run_blocked', e.message);
    store.save();
    throw e;
  }
  const allowedScenarios = ['mixed', 'allpass', 'outage'];
  const run = {
    id: store.nextId('RUN'), planId, mode: cfg.exec.mode === 'github' ? 'github' : 'sim',
    scenario: allowedScenarios.includes(scenario || plan.scenario) ? (scenario || plan.scenario) : 'mixed',
    status: 'queued', createdAt: new Date().toISOString(), startedAt: null, finishedAt: null,
    requestedBy: actor, approvedBy: plan.approval.by, inputs: g.toWorkflowInputs(plan),
    total: 0, done: 0, tests: [], log: [], analysis: null,
  };
  st.runs[run.id] = run; st.currentRunId = run.id;
  plan.status = 'running'; plan.runId = run.id;
  store.audit(actor, 'run_started', `${run.id} (${run.mode}) for plan ${plan.id}, approved by ${plan.approval.by}`);
  store.save();

  const hooks = { update: () => store.save(), done: (r) => finish(r, plan) };
  executor.start(run, plan, hooks);
  return run;
}

function finish(run, plan) {
  if (run.status === 'completed') {
    try { run.analysis = analysis.analyze(run, plan); } catch (e) { run.log.push('Analysis failed: ' + e.message); }
    plan.status = 'completed';
    store.audit('system', 'run_completed', `${run.id}: ${run.analysis ? run.analysis.summary.passed + '/' + run.analysis.summary.total + ' passed' : 'no analysis'}`);
  } else {
    plan.status = 'draft'; plan.approval = null;       // a failed run never keeps its approval
    store.audit('system', 'run_failed', `${run.id}: ${run.log[run.log.length - 1] || 'unknown error'}`);
  }
  store.save();
  if (run.analysis && llm.enabled()) {
    llm.explainRun(runContext(run))
      .then((text) => { run.analysis.aiExplanation = text; store.audit('assistant', 'ai_explanation_added', run.id); store.save(); })
      .catch((e) => { run.analysis.aiExplanation = null; run.analysis.aiError = e.message; store.save(); });
  }
}

const current = () => { const s = store.get(); return s.currentRunId ? s.runs[s.currentRunId] : null; };
const view = (run) => (run ? { ...run, tests: run.tests.slice(-300), log: run.log.slice(-40) } : null);

module.exports = { requestRun, current, view, runContext };
