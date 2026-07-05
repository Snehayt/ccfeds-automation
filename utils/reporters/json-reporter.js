const fs = require('fs/promises');
const BaseReporter = require('./base-reporter.js');

const JSON_PATH    = './nala-results.json';
const HISTORY_PATH = './run-history.json';

class JSONReporter extends BaseReporter {
  constructor() {
    super({ persist: { type: 'json-reporter', path: JSON_PATH } });
  }

  async onEnd() {
    this.printResultSummary();
    await this.persistData();
    await this.appendToHistory();
  }

  async persistData() {
    const run = this.getPersistedDataObject();
    await fs.writeFile(JSON_PATH, JSON.stringify(run));
    return run;
  }

  async appendToHistory() {
    let history = [];
    try {
      const existing = await fs.readFile(HISTORY_PATH, 'utf8');
      if (existing.trim()) history = JSON.parse(existing);
    } catch (_) {}

    const run = this.getPersistedDataObject();
    history.unshift({
      runId:        run.runId        || `local-${Date.now()}`,
      suite:        run.suite,
      environment:  run.environment,
      browser:      run.browser,
      device:       run.device,
      locale:       run.locale,
      triggeredBy:  run.triggeredBy,
      runUrl:       run.runUrl,
      timestamp:    run.timestamp,
      passed:       run.passed,
      failed:       run.failed,
      skipped:      run.skipped,
      total:        run.total,
      qualityScore: run.qualityScore,
    });

    await fs.writeFile(HISTORY_PATH, JSON.stringify(history.slice(0, 100)));
  }
}

module.exports = JSONReporter;
