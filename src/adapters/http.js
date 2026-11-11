'use strict';
// fetch with a timeout and readable errors. Used by every real integration.
async function request(url, { method = 'GET', headers = {}, body, timeoutMs = 20000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method, headers, body, signal: ctrl.signal });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) { /* not JSON */ }
    if (!res.ok) {
      const msg = (json && (json.message || json.errorMessages)) || text.slice(0, 200);
      throw new Error(`${method} ${new URL(url).host}${new URL(url).pathname} -> ${res.status} ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    }
    return { status: res.status, json, text };
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`Request to ${new URL(url).host} timed out after ${timeoutMs} ms`);
    throw e;
  } finally { clearTimeout(timer); }
}
module.exports = { request };
