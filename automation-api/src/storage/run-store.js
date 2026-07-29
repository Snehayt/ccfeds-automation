const fs = require("fs/promises");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../data");
const RUNS_DIR = path.join(DATA_DIR, "runs");
const HISTORY_FILE = path.join(DATA_DIR, "run-history.json");

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
    duration: run.duration || null,
    qualityScore: run.qualityScore || null,
  });

  await fs.writeFile(HISTORY_FILE, JSON.stringify(history.slice(0, 100), null, 2), "utf8");
  return run;
}

async function listRuns() {
  await ensureStorage();

  try {
    const existing = await fs.readFile(HISTORY_FILE, "utf8");
    return existing.trim() ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}
async function getRunById(runId) {
  await ensureStorage();

  const runFile = path.join(RUNS_DIR, `${runId}.json`);

  try {
    const data = await fs.readFile(runFile, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}
function runFolder(runId) {
  return path.join(RUNS_DIR, runId);
}

async function readJsonIfExists(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return text.trim() ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

async function readTextIfExists(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return text.trim() ? text : fallback;
  } catch {
    return fallback;
  }
}

function buildDemoTests(run) {
  const base = [
    `${run.suite || "suite"} - home`,
    `${run.suite || "suite"} - navigation`,
    `${run.suite || "suite"} - search`,
    `${run.suite || "suite"} - forms`,
    `${run.suite || "suite"} - links`,
  ];

  const failed = String(run.status).toLowerCase() === "failed";

  return base.map((name, index) => ({
    name,
    status: failed && index >= 3 ? "failed" : "passed",
    duration: 2200 + index * 600,
    retry: 0,
  }));
}

function buildDemoFailures(run, tests) {
  const failedTests = tests.filter((test) => test.status === "failed");
  if (!failedTests.length) {
    return [];
  }

  return failedTests.map((test, index) => ({
    test: test.name,
    module: run.suite || "suite",
    error: "Selector timed out while waiting for element",
    duration: test.duration,
    retry: index,
  }));
}

function buildDemoArtifacts(run) {
  const runId = run.runId || "run";
  return [
    { type: "html-report", name: "HTML Report", path: `runs/${runId}/report/index.html` },
    { type: "trace", name: "Trace", path: `runs/${runId}/trace.zip` },
    { type: "screenshots", name: "Screenshots", path: `runs/${runId}/screenshots/` },
    { type: "logs", name: "Logs", path: `runs/${runId}/logs.txt` },
  ];
}

function buildDemoLogs(run) {
  const lines = [
    `[${new Date().toISOString()}] Run ${run.runId} started`,
    `[${new Date().toISOString()}] Suite: ${run.suite}`,
    `[${new Date().toISOString()}] Environment: ${run.environment}`,
    `[${new Date().toISOString()}] Browser: ${run.browser}`,
    `[${new Date().toISOString()}] Device: ${run.device}`,
    `[${new Date().toISOString()}] Status: ${run.status}`,
  ];

  if (String(run.status).toLowerCase() === "failed") {
    lines.push(`[${new Date().toISOString()}] Error: Timeout waiting for selector`);
  } else {
    lines.push(`[${new Date().toISOString()}] Completed successfully`);
  }

  return lines.join("\n");
}

async function getRunTests(runId) {
  const run = await getRunById(runId);
  if (!run) return null;

  const filePath = path.join(runFolder(runId), "tests.json");
  const fallback = buildDemoTests(run);
  return readJsonIfExists(filePath, fallback);
}

async function getRunFailures(runId) {
  const run = await getRunById(runId);
  if (!run) return null;

  const tests = await getRunTests(runId);
  const filePath = path.join(runFolder(runId), "failures.json");
  const fallback = buildDemoFailures(run, tests || []);
  return readJsonIfExists(filePath, fallback);
}

async function getRunArtifacts(runId) {
  const run = await getRunById(runId);
  if (!run) return null;

  const filePath = path.join(runFolder(runId), "artifacts.json");
  const fallback = buildDemoArtifacts(run);
  return readJsonIfExists(filePath, fallback);
}

async function getRunLogs(runId) {
  const run = await getRunById(runId);
  if (!run) return null;

  const filePath = path.join(runFolder(runId), "logs.txt");
  const fallback = buildDemoLogs(run);
  return readTextIfExists(filePath, fallback);
}

module.exports = {
  saveRun,
  listRuns,
  getRunById,
  getRunTests,
  getRunFailures,
  getRunArtifacts,
  getRunLogs,
};