'use strict';
const store = require('./store');
const g = require('./guardrails');
const impact = require('./impact');

function view(plan) {
  if (!plan) return null;
  return { ...plan, validation: g.validate(plan), inputs: g.toWorkflowInputs(plan), fingerprint: g.fingerprint(plan), estimate: impact.estimate(plan) };
}
const current = () => { const s = store.get(); return s.currentPlanId ? s.plans[s.currentPlanId] : null; };

function find(id) {
  const plan = store.get().plans[id];
  if (!plan) throw new g.GuardrailError('Plan not found.', 404);
  return plan;
}

const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

function patch(id, body, actor) {
  const plan = find(id);
  if (['running', 'completed', 'signed_off'].includes(plan.status)) {
    throw new g.GuardrailError('This plan has already been executed. Ask the assistant for a new plan.', 409);
  }
  const before = g.fingerprint(plan);
  if (Array.isArray(body.items)) {
    for (const it of body.items) {
      const x = plan.items.find((i) => i.id === it.id);
      if (x && typeof it.included === 'boolean') x.included = it.included;
    }
  }
  if (body.settings && typeof body.settings === 'object') {
    const s = body.settings;
    for (const k of ['environment', 'browser', 'device', 'locale', 'suite']) if (k in s) plan.settings[k] = clip(s[k], 40);
    if ('grep' in s) plan.settings.grep = clip(s.grep, 200);
    if ('retries' in s) plan.settings.retries = Number.parseInt(s.retries, 10);
    if ('workers' in s) plan.settings.workers = Number.parseInt(s.workers, 10);
  }
  if (typeof body.notes === 'string') plan.notes = body.notes.slice(0, 2000);
  plan.version += 1;
  if (plan.approval && g.fingerprint(plan) !== before) {
    plan.approval = null; plan.status = 'draft';
    store.audit(actor, 'approval_revoked', `Plan ${plan.id} changed after approval`);
  }
  store.audit(actor, 'plan_edited', `${plan.id} v${plan.version}`);
  store.save();
  return view(plan);
}

function approve(id, { by, confirmProd, scenario }) {
  const plan = find(id);
  const name = clip(by, 80);
  if (!name) throw new g.GuardrailError('Enter your name as the approving QE.', 400);
  if (plan.status !== 'draft' && plan.status !== 'approved') throw new g.GuardrailError('This plan has already been executed.', 409);
  const errs = g.validate(plan);
  if (errs.length) throw new g.GuardrailError('Cannot approve: ' + errs.join(' '), 422);
  plan.approval = { by: name, at: new Date().toISOString(), fingerprint: g.fingerprint(plan), version: plan.version, confirmedEnv: !!confirmProd };
  plan.status = 'approved';
  plan.scenario = ['mixed', 'allpass', 'outage'].includes(scenario) ? scenario : 'mixed';
  store.audit(name, 'plan_approved', `${plan.id} v${plan.version}: ${plan.settings.environment}, ${g.includedPages(plan).length} page(s)`);
  store.save();
  return view(plan);
}

module.exports = { view, current, find, patch, approve };
