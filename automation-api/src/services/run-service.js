const {
  saveRun,
  listRuns,
  getRunById,
  getRunTests,
  getRunFailures,
  getRunArtifacts,
  getRunLogs,
} = require("../storage/run-store");

function buildRun(payload = {}) {
  const { suite, environment, browser, device, locale } = payload;

  if (!suite || !environment || !browser || !device) {
    const err = new Error("suite, environment, browser, and device are required");
    err.statusCode = 400;
    throw err;
  }

  return {
    runId: `run-${Date.now()}`,
    status: "queued",
    suite,
    environment,
    browser,
    device,
    locale: locale || null,
    triggeredBy: "local",
    timestamp: new Date().toISOString(),
    duration: null,
    qualityScore: null,
  };
}

async function createRun(payload) {
  const run = buildRun(payload);
  await saveRun(run);
  return run;
}

async function getRuns() {
  return listRuns();
}
async function getRun(runId) {
    const run = await getRunById(runId);

    if (!run) {
        const error = new Error("Run not found");
        error.statusCode = 404;
        throw error;
    }

    return run;
}

async function getTests(runId) {
  return getRunTests(runId);
}

async function getFailures(runId) {
  return getRunFailures(runId);
}

async function getArtifacts(runId) {
  return getRunArtifacts(runId);
}

async function getLogs(runId) {
  return getRunLogs(runId);
}

module.exports = {
  createRun,
  getRuns,
  getRun,
  getTests,
  getFailures,
  getArtifacts,
  getLogs,
};