'use strict';
const path = require('path');
const root = path.join(__dirname, '..');
const env = process.env;
const flag = (key, def) => String(env[key] || def).toLowerCase();

module.exports = {
  root,
  port: parseInt(env.PORT || '3000', 10),
  host: env.HOST || '127.0.0.1',
  dataDir: env.DATA_DIR || path.join(root, 'data'),
  stateFile: env.STATE_FILE || path.join(root, 'runtime', 'state.json'),
  publicDir: path.join(root, 'public'),
  // Read-only Jira
  jira: { mode: flag('JIRA_MODE', 'mock'), baseUrl: env.JIRA_BASE_URL, email: env.JIRA_EMAIL, token: env.JIRA_TOKEN, auth: flag('JIRA_AUTH', 'basic') },
  // Read-only access to the PRODUCT repo's pull requests
  pr: { mode: flag('PR_MODE', 'mock'), api: env.GITHUB_API || 'https://api.github.com', token: env.PR_TOKEN, repo: env.PRODUCT_REPO },
  // Execution: simulated by default; "github" dispatches your existing workflow
  exec: {
    mode: flag('EXEC_MODE', 'sim'),
    api: env.GITHUB_API || 'https://api.github.com',
    token: env.DISPATCH_TOKEN,
    repo: env.AUTOMATION_REPO,
    workflow: env.WORKFLOW_FILE || 'run-tests.yml',
    ref: env.WORKFLOW_REF || 'main',
    resultsUrl: env.RESULTS_URL_TEMPLATE,
    simSeconds: parseFloat(env.SIM_SECONDS || '20'),
    pollFindMs: parseInt(env.GH_POLL_FIND_MS || '5000', 10),
    pollRunMs: parseInt(env.GH_POLL_RUN_MS || '15000', 10),
  },
  llm: { mode: flag('LLM_MODE', 'off'), baseUrl: env.LLM_BASE_URL, key: env.LLM_API_KEY, model: env.LLM_MODEL },
  slack: { url: env.SLACK_WEBHOOK_URL },
  // Intake: tickets that move to this Jira status become tasks in the inbox (analysed automatically, executed by hand).
  intake: {
    status: env.INTAKE_STATUS || 'In Test',
    projects: (env.INTAKE_PROJECTS || '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
    secret: env.JIRA_WEBHOOK_SECRET || '',
    pollSeconds: parseInt(env.INTAKE_POLL_SECONDS || '60', 10),
  },
};
