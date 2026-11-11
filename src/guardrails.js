'use strict';
// The approval gate. This is deliberately plain, deterministic code with no AI in it.
// The assistant can PROPOSE a plan; only a QE can approve it; only this module decides whether it may run.
const crypto = require('crypto');
const { readData } = require('./data');

class GuardrailError extends Error {
  constructor(message, code = 403) { super(message); this.name = 'GuardrailError'; this.code = code; }
}

const includedItems = (plan) => plan.items.filter((i) => i.included);
const includedPages = (plan) => includedItems(plan).map((i) => i.page);

function validate(plan) {
  const allow = readData('allowlist.json');
  const s = plan.settings;
  const errs = [];
  const pages = includedPages(plan);
  if (!allow.suites.includes(s.suite)) errs.push(`Suite "${s.suite}" is not allowed.`);
  if (!allow.environments.includes(s.environment)) errs.push(`Environment "${s.environment}" is not allowed.`);
  if (!allow.browsers.includes(s.browser)) errs.push(`Browser "${s.browser}" is not allowed.`);
  if (!allow.devices.includes(s.device)) errs.push(`Device "${s.device}" is not allowed.`);
  if (!allow.locales.includes(s.locale)) errs.push(`Locale "${s.locale}" is not allowed.`);
  if (!Number.isInteger(s.retries) || s.retries < 0 || s.retries > allow.maxRetries) errs.push(`Retries must be 0 to ${allow.maxRetries}.`);
  if (!Number.isInteger(s.workers) || s.workers < 1 || s.workers > allow.maxWorkers) errs.push(`Workers must be 1 to ${allow.maxWorkers}.`);
  if (!new RegExp(allow.grepPattern).test(s.grep || '')) errs.push('Tag/grep filter contains characters that are not allowed.');
  if (pages.length === 0) errs.push('Select at least one page.');
  if (pages.length > allow.maxPages) errs.push(`Too many pages (${pages.length}); the limit is ${allow.maxPages}. Deselect some or split the run.`);
  for (const p of pages) if (!allow.pages.includes(p)) errs.push(`Page "${p}" is not in the allow-list.`);
  return errs;
}

// What a run is approved for. If any of this changes, the approval no longer applies.
function fingerprint(plan) {
  const material = JSON.stringify({ s: plan.settings, pages: includedPages(plan).slice().sort() });
  return crypto.createHash('sha256').update(material).digest('hex').slice(0, 16);
}

function toWorkflowInputs(plan) {
  const map = readData('workflow-inputs.json');
  const s = plan.settings;
  const values = {
    suite: s.suite, environment: s.environment, browser: s.browser, device: s.device, locale: s.locale,
    page: includedPages(plan).join(','), grep: s.grep || '', retries: String(s.retries), workers: String(s.workers),
  };
  const out = {};
  for (const [k, v] of Object.entries(values)) if (map[k]) out[map[k]] = v;
  return out;
}

function assertCanRun(plan) {
  const allow = readData('allowlist.json');
  if (!plan) throw new GuardrailError('There is no plan to run yet.', 404);
  if (plan.status !== 'approved' || !plan.approval) {
    throw new GuardrailError('Execution blocked: this plan has not been approved by a QE.', 403);
  }
  if (plan.approval.fingerprint !== fingerprint(plan)) {
    throw new GuardrailError('Execution blocked: the plan changed after it was approved. Approve it again.', 409);
  }
  const errs = validate(plan);
  if (errs.length) throw new GuardrailError('Execution blocked: ' + errs.join(' '), 422);
  if (allow.confirmEnvironments.includes(plan.settings.environment) && !plan.approval.confirmedEnv) {
    throw new GuardrailError(`Execution blocked: running on "${plan.settings.environment}" needs an explicit confirmation when approving.`, 403);
  }
}

module.exports = { GuardrailError, validate, fingerprint, toWorkflowInputs, assertCanRun, includedItems, includedPages };
