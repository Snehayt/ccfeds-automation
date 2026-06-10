const fs = require('fs/promises');
const BaseReporter = require('./base-reporter.js');

const JSON_PATH = './nala-results.json';

class JSONReporter extends BaseReporter {
  constructor() {
    super({ persist: { type: 'json-reporter', path: JSON_PATH } });
  }

  async onEnd() {
    await this.persistData();
    await super.onEnd();
  }

  async persistData() {
    const persistedObject = this.getPersistedDataObject();

    // Enrich with CI metadata available from environment variables
    if (process.env.BASE_URL) persistedObject.baseURL = process.env.BASE_URL;
    if (process.env.GITHUB_ACTOR) persistedObject.triggeredBy = process.env.GITHUB_ACTOR;
    if (process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID) {
      persistedObject.runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    }

    await fs.writeFile(JSON_PATH, JSON.stringify(persistedObject));
  }
}

module.exports = JSONReporter;
