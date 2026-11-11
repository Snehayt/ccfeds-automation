'use strict';
const cfg = require('../config');
const { request } = require('./http');

// Returns { sent, preview }. Without a webhook the message is only previewed in the app.
async function send(text) {
  if (!cfg.slack.url) return { sent: false, preview: text };
  await request(cfg.slack.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
  return { sent: true, preview: text };
}
module.exports = { send };
