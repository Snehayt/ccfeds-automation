'use strict';
const store = require('./store');
const { GuardrailError } = require('./guardrails');
const slack = require('./adapters/slack');

const DECISIONS = ['approve', 'approve_with_known_issues', 'reject'];

async function record(runId, { by, decision, note }) {
  const st = store.get();
  const run = st.runs[runId];
  if (!run) throw new GuardrailError('Run not found.', 404);
  const plan = st.plans[run.planId];
  const name = String(by || '').trim().slice(0, 80);
  if (!name) throw new GuardrailError('Enter your name as the signing QE.', 400);
  if (run.status !== 'completed' || !run.analysis) throw new GuardrailError('Sign-off is only possible after the run has completed and been analysed.', 409);
  if (plan.signoff) throw new GuardrailError('This run has already been signed off.', 409);
  if (!DECISIONS.includes(decision)) throw new GuardrailError('Choose approve, approve with known issues, or reject.', 400);

  const rec = run.analysis.recommendation.decision;
  const overridden = decision !== 'reject' && rec === 'hold';
  const cleanNote = String(note || '').trim().slice(0, 1000);
  if ((overridden || decision === 'reject') && cleanNote.length < 10) {
    throw new GuardrailError('A note of at least 10 characters is required when rejecting or overriding a "hold" recommendation.', 422);
  }
  plan.signoff = { by: name, at: new Date().toISOString(), decision, note: cleanNote, recommendation: rec, overridden };
  plan.status = 'signed_off';
  store.audit(name, 'signed_off', `${run.id}: ${decision}${overridden ? ' (overrode hold recommendation)' : ''}`);

  const s = run.analysis.summary;
  const label = { approve: 'APPROVED', approve_with_known_issues: 'APPROVED WITH KNOWN ISSUES', reject: 'REJECTED' }[decision];
  const text = `QE sign-off ${label} by ${name}\n` +
    `${plan.source.jira || ''} ${plan.source.pr ? 'PR #' + plan.source.pr : ''}\n`.trim() + '\n' +
    `${run.id}: ${s.passed}/${s.total} passed (${s.passRate}%), ${s.failed} failed, ${s.flaky} flaky\n` +
    (cleanNote ? `Note: ${cleanNote}` : '');
  let slackResult;
  try { slackResult = await slack.send(text); } catch (e) { slackResult = { sent: false, preview: text, error: e.message }; }
  plan.signoff.slack = slackResult;
  store.save();
  return plan.signoff;
}

module.exports = { record };
