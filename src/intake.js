'use strict';
// Intake: a Jira ticket entering the configured status (default "In Test") becomes a TASK in the inbox.
// The analysis runs automatically. Execution never does: a QE opens the task, approves it, and runs it.
const cfg = require('./config');
const store = require('./store');
const planner = require('./planner');
const jira = require('./adapters/jira');
const { readData } = require('./data');

const inflight = new Set();
const KEY = /^[A-Z][A-Z0-9]{1,9}-\d+$/;
const str = (v) => (typeof v === 'string' ? v : null);   // Jira's changelog item has a field literally called "toString"

// Understands three payload shapes: Jira's own issue_updated webhook, and a plain Jira Automation body.
function screen(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, reason: 'Empty or unreadable event.' };
  const key = (payload.issue && payload.issue.key) || payload.issueKey || payload.key;
  if (!KEY.test(String(key || ''))) return { ok: false, reason: 'No Jira issue key in the event.' };
  const items = payload.changelog && Array.isArray(payload.changelog.items) ? payload.changelog.items : [];
  const change = items.find((i) => String(i.field).toLowerCase() === 'status');
  let to = change ? str(change.toString) : null;
  const from = change ? str(change.fromString) : null;
  if (!to) to = str(payload.status) || str(payload.issue && payload.issue.fields && payload.issue.fields.status && payload.issue.fields.status.name);
  if (!to) return { ok: false, reason: `${key}: the event does not say which status the ticket moved to.` };
  if (to.toLowerCase() !== cfg.intake.status.toLowerCase()) return { ok: false, reason: `${key} moved to "${to}", not "${cfg.intake.status}". Ignored.` };
  const project = key.split('-')[0];
  if (cfg.intake.projects.length && !cfg.intake.projects.includes(project)) return { ok: false, reason: `Project ${project} is not in scope for intake.` };
  const at = typeof payload.timestamp === 'number' ? new Date(payload.timestamp).toISOString() : new Date().toISOString();
  return { ok: true, key, event: `${from ? from + ' → ' : ''}${to}`, at };
}

async function createTask(key, origin) {
  if (inflight.has(key)) return { accepted: false, duplicate: true, reason: `${key} is already being analysed.` };
  const existing = Object.values(store.get().plans).filter((p) => p.source.jira === key);
  const open = existing.find((p) => p.status !== 'signed_off');
  if (open) {
    store.audit('intake', 'duplicate_ignored', `${key}: task ${open.id} is still open`);
    store.save();
    return { accepted: false, duplicate: true, planId: open.id, reason: `${key} already has an open task (${open.id}).` };
  }
  if (origin.unknownEpisode && existing.length) return { accepted: false, duplicate: true, reason: `${key} already had a task; cannot tell if this is a new "${cfg.intake.status}" episode.` };
  if (!origin.unknownEpisode && existing.some((p) => p.origin && p.origin.at >= origin.at)) return { accepted: false, duplicate: true, reason: `${key}: this transition was already handled.` };
  inflight.add(key);
  try {
    const plan = await planner.draftPlan({ jiraKey: key, origin });
    return { accepted: true, planId: plan.id };
  } catch (e) {
    store.audit('intake', 'task_failed', `${key}: ${e.message}`);
    store.save();
    return { accepted: false, reason: `Could not analyse ${key}: ${e.message}` };
  } finally { inflight.delete(key); }
}

// Real webhook: answer quickly (Jira does not wait long); analyse in the background.
function receiveWebhook(payload) {
  const s = screen(payload);
  if (!s.ok) return { accepted: false, reason: s.reason };
  createTask(s.key, { type: 'webhook', event: s.event, at: s.at }).catch((e) => console.error('intake failed', e));
  return { accepted: true, queued: true, key: s.key };
}

// Demo (mock Jira only): sends the same payload shape Jira would send, through the same code path.
async function simulate(key) {
  if (cfg.jira.mode === 'real') throw Object.assign(new Error('Simulation is only available with sample Jira data.'), { code: 404 });
  if (!readData('mock-jira.json')[key]) throw Object.assign(new Error(`Ticket ${key} is not in the sample data.`), { code: 404 });
  const payload = { webhookEvent: 'jira:issue_updated', timestamp: Date.now(), issue: { key, fields: { status: { name: cfg.intake.status } } },
    changelog: { items: [{ field: 'status', fromString: 'In QA', toString: cfg.intake.status }] } };
  const s = screen(payload);
  return createTask(s.key, { type: 'simulated', event: s.event, at: s.at });
}

// Real Jira without inbound connectivity: ask Jira which tickets are in the status, and create tasks for new arrivals.
async function poll() {
  if (cfg.jira.mode !== 'real') return { checked: 0, created: [], note: 'Polling needs real Jira. In demo mode use "Send Jira event".' };
  const keys = await jira.searchInStatus(cfg.intake.status, cfg.intake.projects);
  const created = [];
  for (const key of keys) {
    const mine = Object.values(store.get().plans).filter((p) => p.source.jira === key);
    if (mine.some((p) => p.status !== 'signed_off')) continue;          // already has an open task: no extra calls
    let enteredAt = null;
    try { enteredAt = await jira.statusEnteredAt(key, cfg.intake.status); } catch (_) { /* fall back to "never re-create" */ }
    const r = await createTask(key, { type: 'poll', event: `now in ${cfg.intake.status}`, at: enteredAt || new Date().toISOString(), unknownEpisode: !enteredAt });
    if (r.accepted) created.push(r.planId);
  }
  return { checked: keys.length, created };
}

function startPolling() {
  if (cfg.jira.mode !== 'real' || cfg.intake.pollSeconds <= 0) return;
  const tick = () => poll().catch((e) => { store.audit('intake', 'poll_failed', e.message); store.save(); });
  setTimeout(tick, 3000).unref();
  setInterval(tick, cfg.intake.pollSeconds * 1000).unref();
}

module.exports = { screen, receiveWebhook, simulate, poll, startPolling, createTask };
