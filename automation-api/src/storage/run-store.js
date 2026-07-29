const fs = require("fs/promises");
const path = require("path");

const STORAGE_DIR = path.join(__dirname, "../../data");
const RUNS_DIR = path.join(STORAGE_DIR, "runs");
const HISTORY_FILE = path.join(STORAGE_DIR, "run-history.json");

async function ensureStorage() {
  await fs.mkdir(RUNS_DIR, { recursive: true });
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, "[]", "utf8");
  }
}

async function saveRun(run) {
  await ensureStorage();

  const runFile = path.join(RUNS_DIR, `${run.runId}.json`);
  await fs.writeFile(runFile, JSON.stringify(run, null, 2), "utf8");

  let history = [];
  try {
    const existing = await fs.readFile(HISTORY_FILE, "utf8");
    history = existing.trim() ? JSON.parse(existing) : [];
  } catch {
    history = [];
  }

  history.unshift({
    runId: run.runId,
    suite: run.suite,
    environment: run.environment,
    browser: run.browser,
    device: run.device,
    locale: run.locale || null,
    triggeredBy: run.triggeredBy || "local",
    status: run.status,
    timestamp: run.timestamp,
  });

  await fs.writeFile(HISTORY_FILE, JSON.stringify(history.slice(0, 100), null, 2), "utf8");
  return run;
}

module.exports = {
  saveRun,
};