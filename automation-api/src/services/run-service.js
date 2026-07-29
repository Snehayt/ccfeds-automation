const { saveRun } = require("../storage/run-store");

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
  };
}

async function createRun(payload) {
  const run = buildRun(payload);
  await saveRun(run);
  return run;
}

module.exports = {
  createRun,
};