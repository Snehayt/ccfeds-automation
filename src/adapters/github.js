'use strict';
// Read-only access to the PRODUCT repo's pull requests (title + changed files).
const cfg = require('../config');
const { readData } = require('../data');
const { request } = require('./http');

async function getPullRequest(number) {
  if (cfg.pr.mode !== 'real') {
    const pr = readData('mock-prs.json')[String(number)];
    if (!pr) throw new Error(`PR #${number} not found in the sample data. Try 482 or 470.`);
    return { ...pr, source: 'mock' };
  }
  const { api, token, repo } = cfg.pr;
  if (!repo || !token) throw new Error('PR access is set to real mode but PRODUCT_REPO / PR_TOKEN are missing.');
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'traverse-assistant' };
  const pr = (await request(`${api}/repos/${repo}/pulls/${number}`, { headers })).json;
  const files = [];
  for (let page = 1; page <= 3; page++) {            // up to 300 files is plenty for impact analysis
    const batch = (await request(`${api}/repos/${repo}/pulls/${number}/files?per_page=100&page=${page}`, { headers })).json || [];
    files.push(...batch.map((f) => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions })));
    if (batch.length < 100) break;
  }
  return { number: pr.number, title: pr.title, author: pr.user && pr.user.login, state: pr.state, url: pr.html_url, files, source: 'github' };
}
module.exports = { getPullRequest };
