'use strict';
// Tiny JSON-file store. Good enough for a prototype and a small team;
// swap for SQLite/Postgres when you need concurrent writers or history at scale.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');

let state;

const WELCOME =
  "Hi, I'm the QE assistant (prototype). I can read a Jira ticket and its pull request, map the changed files to the pages " +
  'that need testing, and draft an editable test plan. I never run anything on my own: a QE has to approve the plan first.\n\n' +
  'Try: **Plan testing for FEDS-1423**';

function fresh() {
  return { seq: {}, chat: [{ id: 'm-0', role: 'assistant', text: WELCOME, at: new Date().toISOString() }],
           currentPlanId: null, currentRunId: null, plans: {}, runs: {}, audit: [] };
}

function load() {
  try {
    state = JSON.parse(fs.readFileSync(cfg.stateFile, 'utf8'));
  } catch (e) {
    state = fresh();
  }
  // A simulated run cannot survive a restart: fail it and force re-approval.
  for (const run of Object.values(state.runs)) {
    if (['queued', 'running'].includes(run.status) && run.mode === 'sim') {
      run.status = 'failed';
      run.log.push('Interrupted by a server restart.');
      const plan = state.plans[run.planId];
      if (plan) { plan.status = 'draft'; plan.approval = null; }
    }
  }
}

function save() {
  fs.mkdirSync(path.dirname(cfg.stateFile), { recursive: true });
  const tmp = cfg.stateFile + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, cfg.stateFile);
}

const get = () => state;
function reset() { state = fresh(); save(); }
function nextId(prefix) {
  if (typeof state.seq !== 'object' || state.seq === null) state.seq = {};
  state.seq[prefix] = (state.seq[prefix] || 0) + 1;
  return `${prefix}-${String(state.seq[prefix]).padStart(4, '0')}`;
}
function audit(actor, action, detail) {
  state.audit.push({ at: new Date().toISOString(), actor: actor || 'system', action, detail: String(detail || '').slice(0, 400) });
  if (state.audit.length > 500) state.audit.shift();
}
function addChat(role, text, kind) {
  state.chat.push({ id: nextId('m'), role, text, kind: kind || null, at: new Date().toISOString() });
  if (state.chat.length > 200) state.chat.shift();
}

load();
module.exports = { get, save, reset, nextId, audit, addChat };
