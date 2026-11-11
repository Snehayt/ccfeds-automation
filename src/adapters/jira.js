'use strict';
// Read-only Jira. Mock mode reads data/mock-jira.json; real mode uses the REST API (v2, plain-text descriptions).
const cfg = require('../config');
const { readData } = require('../data');
const { request } = require('./http');

function authHeaders() {
  const { email, token, auth } = cfg.jira;
  return { Accept: 'application/json', Authorization: auth === 'bearer' ? `Bearer ${token}` : 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64') };
}

async function getIssue(key) {
  if (cfg.jira.mode !== 'real') {
    const issue = readData('mock-jira.json')[key];
    if (!issue) throw new Error(`Ticket ${key} not found in the sample data. Try FEDS-1423, FEDS-1311 or FEDS-1500.`);
    return { ...issue, source: 'mock' };
  }
  const { baseUrl, email, token, auth } = cfg.jira;
  if (!baseUrl || !token) throw new Error('Jira is set to real mode but JIRA_BASE_URL / JIRA_TOKEN are missing.');
  const headers = { Accept: 'application/json' };
  headers.Authorization = auth === 'bearer' ? `Bearer ${token}` : 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
  const base = baseUrl.replace(/\/$/, '');
  const issue = (await request(`${base}/rest/api/2/issue/${encodeURIComponent(key)}?fields=summary,description,issuetype,status,components,labels`, { headers })).json;
  const description = String(issue.fields.description || '');
  const prs = new Set([...description.matchAll(/\/pull\/(\d+)/g)].map((m) => Number(m[1])));
  try {
    const links = (await request(`${base}/rest/api/2/issue/${encodeURIComponent(key)}/remotelink`, { headers })).json || [];
    for (const l of links) { const m = String(l.object && l.object.url).match(/\/pull\/(\d+)/); if (m) prs.add(Number(m[1])); }
  } catch (_) { /* remote links are optional */ }
  return {
    key: issue.key, summary: issue.fields.summary, type: issue.fields.issuetype && issue.fields.issuetype.name,
    status: issue.fields.status && issue.fields.status.name,
    components: (issue.fields.components || []).map((c) => c.name), labels: issue.fields.labels || [],
    description, linkedPrs: [...prs], source: 'jira',
  };
}
// Keys of tickets currently in a status. Jira Cloud removed /rest/api/{2,3}/search (it answers 410 Gone) in favour of
// /rest/api/3/search/jql. Data Center (JIRA_AUTH=bearer) still serves /rest/api/2/search.
async function searchInStatus(status, projects) {
  if (cfg.jira.mode !== 'real') return [];
  const { baseUrl, token, auth } = cfg.jira;
  if (!baseUrl || !token) throw new Error('Jira is set to real mode but JIRA_BASE_URL / JIRA_TOKEN are missing.');
  const clean = String(status).replace(/["\\]/g, '');
  const proj = (projects || []).map((p) => p.replace(/[^A-Z0-9_]/g, '')).filter(Boolean);
  const jql = `status = "${clean}"${proj.length ? ` AND project in (${proj.join(',')})` : ''} ORDER BY updated DESC`;
  const base = baseUrl.replace(/\/$/, '');
  const path = auth === 'bearer' ? '/rest/api/2/search' : '/rest/api/3/search/jql';
  const res = (await request(`${base}${path}?jql=${encodeURIComponent(jql)}&fields=summary&maxResults=50`, { headers: authHeaders() })).json;
  return ((res && res.issues) || []).map((i) => i.key);
}

// When did the ticket most recently ENTER this status? Lets us tell a new "In Test" episode from one we already handled.
async function statusEnteredAt(key, status) {
  if (cfg.jira.mode !== 'real') return null;
  const base = cfg.jira.baseUrl.replace(/\/$/, '');
  const issue = (await request(`${base}/rest/api/2/issue/${encodeURIComponent(key)}?expand=changelog&fields=status`, { headers: authHeaders() })).json;
  let best = null;
  for (const h of (issue && issue.changelog && issue.changelog.histories) || []) {
    for (const it of h.items || []) {
      if (String(it.field).toLowerCase() === 'status' && typeof it.toString === 'string' && it.toString.toLowerCase() === String(status).toLowerCase()) {
        if (!best || new Date(h.created) > new Date(best)) best = h.created;
      }
    }
  }
  return best ? new Date(best).toISOString() : null;
}

module.exports = { getIssue, searchInStatus, statusEnteredAt };
