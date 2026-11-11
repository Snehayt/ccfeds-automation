'use strict';
// Reads JSON files from /data and re-reads them when the file changes,
// so you can edit impact-map.json or allowlist.json live during a demo.
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const cache = new Map();

function readData(name) {
  const file = path.join(cfg.dataDir, name);
  const mtime = fs.statSync(file).mtimeMs;
  const hit = cache.get(file);
  if (hit && hit.mtime === mtime) return hit.value;
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  cache.set(file, { mtime, value });
  return value;
}
module.exports = { readData };
