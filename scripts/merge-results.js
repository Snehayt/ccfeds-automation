'use strict';
const fs   = require('fs');
const path = require('path');

// download-artifact@v4 puts each artifact in its own dir: results-0/, results-1/, ...
const dirs = fs.readdirSync('.').filter(d => /^results-\d+$/.test(d)).sort();

let base = null;
const allResults = [];

for (const dir of dirs) {
  const file = path.join(dir, 'nala-results.json');
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!base) base = { ...data, results: [] };
  allResults.push(...(data.results || []));
}

if (!base) {
  fs.writeFileSync('nala-results.json', JSON.stringify({ results: [], timestamp: new Date().toISOString() }));
  process.exit(0);
}

base.results = allResults;
base.urlCount = dirs.length;
fs.writeFileSync('nala-results.json', JSON.stringify(base));
console.log(`Merged ${allResults.length} results from ${dirs.length} URL run(s).`);
