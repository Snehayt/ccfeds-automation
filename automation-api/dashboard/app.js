const app = document.getElementById("app");

const state = {
  runs: [],
  suites: [],
  selectedSuiteId: "",
  selectedFailureRunId: "",
  filters: {
    q: "",
    suite: "all",
    environment: "all",
    browser: "all",
    status: "all",
  },
  compare: {
    left: "",
    right: "",
  },
};

function getRoute() {
  const raw = window.location.hash.replace(/^#/, "") || "dashboard";
  const normalized = raw.replace(/^\/+/, "");

  if (normalized.startsWith("runs/")) {
    return {
      page: "run-details",
      runId: decodeURIComponent(normalized.slice("runs/".length)),
    };
  }

  if (normalized.startsWith("failures/")) {
    return {
      page: "failures",
      runId: decodeURIComponent(normalized.slice("failures/".length)),
    };
  }

  return {
    page: normalized || "dashboard",
    runId: null,
  };
}

function activeNavPage(page) {
  if (page === "run-details") return "runs";
  if (page === "failures") return "failures";
  return page;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function durationToSeconds(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 1000 ? value / 1000 : value;
  }

  const text = String(value).toLowerCase().trim();
  if (!text) return 0;

  let seconds = 0;
  const hours = text.match(/(\d+(?:\.\d+)?)\s*h/);
  const minutes = text.match(/(\d+(?:\.\d+)?)\s*m/);
  const secs = text.match(/(\d+(?:\.\d+)?)\s*s/);

  if (hours) seconds += Number(hours[1]) * 3600;
  if (minutes) seconds += Number(minutes[1]) * 60;
  if (secs) seconds += Number(secs[1]);

  if (!hours && !minutes && !secs) {
    const asNumber = Number(text);
    if (!Number.isNaN(asNumber)) {
      return asNumber > 1000 ? asNumber / 1000 : asNumber;
    }
  }

  return seconds;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  if (!total) return "—";

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

function getSuiteOptions() {
  if (state.suites.length) {
    return state.suites.map((suite) => ({
      value: suite.id,
      label:
        suite.name && suite.name !== suite.id
          ? `${suite.id} — ${suite.name}`
          : suite.id,
    }));
  }

  const seen = new Set();
  const options = [];

  for (const run of state.runs) {
    if (!run.suite || seen.has(run.suite)) continue;
    seen.add(run.suite);
    options.push({
      value: run.suite,
      label: run.suite,
    });
  }

  return options;
}

function getSelectedSuiteId(options = getSuiteOptions()) {
  if (
    state.selectedSuiteId &&
    options.some((option) => option.value === state.selectedSuiteId)
  ) {
    return state.selectedSuiteId;
  }

  return options[0]?.value || "";
}

function getDefaultExecutionContext(suiteId) {
  const suiteRuns = state.runs.filter((run) => run.suite === suiteId);
  const reference = suiteRuns[0] || state.runs[0] || {};

  return {
    environment: reference.environment || "",
    browser: reference.browser || "",
    device: reference.device || "",
    locale: reference.locale || "",
  };
}

function summaryStats(runs) {
  const total = runs.length;
  const passed = runs.filter((run) => String(run.status).toLowerCase() === "passed").length;
  const failed = runs.filter((run) => String(run.status).toLowerCase() === "failed").length;
  const queued = runs.filter((run) => String(run.status).toLowerCase() === "queued").length;
  const passRate = total ? Math.round((passed / total) * 100) : 0;

  return { total, passed, failed, queued, passRate };
}

function deriveSuitesFromRuns() {
  const seen = new Set();
  const suites = [];

  for (const run of state.runs) {
    if (!run.suite || seen.has(run.suite)) continue;
    seen.add(run.suite);
    suites.push({ id: run.suite, name: run.suite });
  }

  return suites;
}

function renderSidebar(page) {
  const active = activeNavPage(page);

  const nav = [
    ["dashboard", "Dashboard"],
    ["runs", "Runs"],
    ["tests", "Tests"],
    ["failures", "Failures"],
    ["analytics", "Analytics"],
    ["compare", "Compare Runs"],
    ["schedules", "Schedules"],
    ["artifacts", "Artifacts"],
    ["logs", "Logs"],
    ["bookmarks", "Bookmarks"],
    ["settings", "Settings"],
  ];

  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">◉</div>
        <div class="brand-text">
          <div class="brand-title">Automation Intelligence</div>
          <div class="brand-subtitle">Platform</div>
        </div>
      </div>

      <div class="project-switcher">
        <div class="switcher-label">Project</div>
        <div class="switcher-value">
          <span>CC FEDS Automation</span>
          <span>⌄</span>
        </div>
      </div>

      <nav class="nav">
        ${nav
          .map(
            ([key, label]) => `
              <a class="nav-item ${key === active ? "active" : ""}" href="#${key}">
                ${label}
              </a>
            `,
          )
          .join("")}
      </nav>

      <div class="sidebar-spacer"></div>

      <div class="theme-card">
        <div class="theme-row">
          <span>☼</span>
          <strong>Light</strong>
          <span>⌄</span>
        </div>
      </div>

      <div class="user-card">
        <div class="avatar">S</div>
        <div>
          <div class="user-name">Snehayt</div>
          <div class="user-role">QA Engineer</div>
        </div>
        <div class="user-chevron">⌄</div>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const options = getSuiteOptions();
  const selected = getSelectedSuiteId(options);

  const optionMarkup = options.length
    ? options
        .map(
          (option) => `
            <option value="${escapeHtml(option.value)}" ${
              option.value === selected ? "selected" : ""
            }>${escapeHtml(option.label)}</option>
          `,
        )
        .join("")
    : `<option value="">No suites available</option>`;

  return `
    <header class="topbar">
      <div>
        <h1>Automation Intelligence Platform</h1>
        <p>Centralized visibility and execution history for automation.</p>
      </div>

      <div class="top-controls">
        <div class="select-wrap">
          <label for="suiteSelect">Suite</label>
          <select id="suiteSelect">
            ${optionMarkup}
          </select>
        </div>
        <button class="icon-btn" aria-label="Filter">⎇</button>
        <button id="runBtn" class="primary-btn">▶ Run Suites</button>
      </div>
    </header>
  `;
}

function renderCompactRuns(runs) {
  if (!runs.length) {
    return `<div class="placeholder-box">No runs yet.</div>`;
  }

  return runs
    .map(
      (run) => `
        <div class="table-row">
          <span class="dot ${String(run.status).toLowerCase() === "failed" ? "red" : "green"}"></span>
          <div>
            <strong>#${escapeHtml(run.runId || "—")}</strong>
            <small>${escapeHtml(run.suite || "—")} · ${escapeHtml(run.environment || "—")} · ${escapeHtml(run.browser || "—")} · ${escapeHtml(run.device || "—")}</small>
          </div>
          <span class="${String(run.status).toLowerCase() === "failed" ? "red" : "green"}">${escapeHtml(run.status || "queued")}</span>
        </div>
      `,
    )
    .join("");
}

function renderDashboard() {
  const runs = state.runs;
  const stats = summaryStats(runs);
  const latest = runs[0] || null;
  const activeRun =
    runs.find((run) => String(run.status).toLowerCase() === "queued") || null;
  const failedRuns = runs
    .filter((run) => String(run.status).toLowerCase() === "failed")
    .slice(0, 5);
  const activityRuns = runs.slice(0, 5);

  return `
    <section class="quick-links">
      <article class="quick-card">
        <div class="quick-icon purple">📅</div>
        <div>
          <h3>Schedules</h3>
          <p>Manage cron schedules and automated runs</p>
          <a href="#schedules">View schedules →</a>
        </div>
      </article>

      <article class="quick-card">
        <div class="quick-icon blue">📈</div>
        <div>
          <h3>Analytics</h3>
          <p>Explore trends, quality signals & insights</p>
          <a href="#analytics">Open analytics →</a>
        </div>
      </article>

      <article class="quick-card">
        <div class="quick-icon green">🗂</div>
        <div>
          <h3>Compare Runs</h3>
          <p>Compare results between two executions</p>
          <a href="#compare">Launch compare →</a>
        </div>
      </article>

      <article class="quick-card">
        <div class="quick-icon orange">🧪</div>
        <div>
          <h3>Artifacts</h3>
          <p>Browse reports, logs, screenshots & traces</p>
          <a href="#artifacts">Browse artifacts →</a>
        </div>
      </article>

      <article class="quick-card">
        <div class="quick-icon sky">🔖</div>
        <div>
          <h3>Bookmarks</h3>
          <p>Quick access to important runs & failures</p>
          <a href="#bookmarks">View bookmarks →</a>
        </div>
      </article>
    </section>

    <section class="metrics-grid">
      <article class="panel health-panel">
        <div class="panel-head">
          <h2>Automation Health</h2>
          <span class="info-dot">i</span>
        </div>
        <div class="health-body">
          <div class="ring-wrap">
            <div class="ring">
              <div class="ring-inner">
                <div class="ring-value">${stats.passRate}</div>
                <div class="ring-sub">/100</div>
              </div>
            </div>
          </div>
          <div class="health-meta">
            <div class="quality-label">Quality Score</div>
            <div class="quality-pill ${stats.passRate >= 80 ? "good" : ""}">
              ${stats.passRate >= 80 ? "Good" : "Needs attention"}
            </div>
            <div class="trend green">Pass rate from recorded runs</div>
            <div class="sparkline" aria-hidden="true">
              ${Array.from({ length: 24 }).map(() => "<span></span>").join("")}
            </div>
          </div>
        </div>
      </article>

      <article class="panel operations-panel">
        <div class="panel-head">
          <h2>Current Operations</h2>
          <span class="info-dot">i</span>
        </div>

        ${
          activeRun
            ? `
              <div class="empty-ops" style="min-height: 220px;">
                <div class="empty-ops-emoji">📣</div>
                <div class="empty-ops-title">Queued run in progress</div>
                <div class="empty-ops-sub">
                  ${escapeHtml(activeRun.suite || "—")} · ${escapeHtml(activeRun.environment || "—")} · ${escapeHtml(activeRun.browser || "—")}
                </div>
                <button class="secondary-btn" data-nav="runs">View Actions</button>
              </div>
            `
            : `
              <div class="empty-ops" style="min-height: 220px;">
                <div class="empty-ops-emoji">📣</div>
                <div class="empty-ops-title">No active execution</div>
                <div class="empty-ops-sub">
                  Check the <a href="#runs">Runs</a> list for anything currently in flight.
                </div>
                <button class="secondary-btn" data-nav="runs">View Actions</button>
              </div>
            `
        }
      </article>

      <article class="panel readiness-panel">
        <div class="panel-head">
          <h2>Release Readiness</h2>
          <span class="info-dot">i</span>
        </div>

        ${
          stats.failed > 0
            ? `
              <div class="blocked-box">
                <span class="blocked-icon">⚠</span>
                <strong>BLOCKED</strong>
              </div>
              <p class="muted">${stats.failed} failed run${stats.failed === 1 ? "" : "s"} in the latest history.</p>
              <button class="danger-btn" data-nav="failures">View blockers →</button>
            `
            : `
              <div class="blocked-box" style="background: rgba(22,163,74,0.08); color: #16a34a;">
                <span class="blocked-icon">✓</span>
                <strong>READY</strong>
              </div>
              <p class="muted">No failed runs in the latest history.</p>
              <button class="danger-btn" data-nav="failures" style="background: rgba(22,163,74,0.08); color: #16a34a;">View readiness →</button>
            `
        }
      </article>

      <article class="panel latest-panel">
        <div class="panel-head">
          <h2>Last Completed Run</h2>
          <span class="status-chip ${String(latest?.status).toLowerCase() === "failed" ? "fail" : ""}">
            ${escapeHtml(latest?.status || "—")}
          </span>
        </div>

        ${
          latest
            ? `
              <div class="latest-details">
                <div><span>Run ID</span><strong>#${escapeHtml(latest.runId || "—")}</strong></div>
                <div><span>Suite</span><strong>${escapeHtml(latest.suite || "—")}</strong></div>
                <div><span>Environment</span><strong>${escapeHtml(latest.environment || "—")}</strong></div>
                <div><span>Browser</span><strong>${escapeHtml(latest.browser || "—")}</strong></div>
                <div><span>Triggered by</span><strong>${escapeHtml(latest.triggeredBy || "—")}</strong></div>
                <div><span>Duration</span><strong>${escapeHtml(latest.duration || "—")}</strong></div>
                <div><span>Completed at</span><strong>${escapeHtml(formatDateTime(latest.timestamp))}</strong></div>
              </div>
              <a class="text-link" href="#runs">View run details →</a>
            `
            : `
              <div class="placeholder-box">No run history yet.</div>
            `
        }
      </article>
    </section>

    <section class="triple-grid">
      <article class="panel">
        <div class="panel-head">
          <h2>Recent Runs</h2>
          <a class="text-link" href="#runs">View all runs →</a>
        </div>
        <div class="table-list">
          ${renderCompactRuns(runs.slice(0, 5))}
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Recent Failures</h2>
          <a class="text-link" href="#failures">View all failures →</a>
        </div>
        <div class="table-list">
          ${
            failedRuns.length
              ? failedRuns
                  .map(
                    (run) => `
                      <div class="table-row failure">
                        <span class="dot red"></span>
                        <div>
                          <strong>${escapeHtml(run.suite || "—")}</strong>
                          <small>${escapeHtml(run.runId || "—")} · ${escapeHtml(run.triggeredBy || "—")}</small>
                        </div>
                        <span>${escapeHtml(run.duration || "—")}</span>
                      </div>
                    `,
                  )
                  .join("")
              : `<div class="placeholder-box">No failed runs yet.</div>`
          }
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <h2>Slowest Tests (Last Run)</h2>
          <a class="text-link" href="#tests">View all tests →</a>
        </div>
        <div class="placeholder-box">
          Test timing data will appear here when per-test results are stored.
        </div>
      </article>
    </section>

    <section class="activity panel">
      <div class="panel-head">
        <h2>Activity Feed</h2>
        <a class="text-link" href="#activity">View all activity →</a>
      </div>

      <div class="activity-row">
        ${
          activityRuns.length
            ? activityRuns
                .map(
                  (run) => `
                    <div class="activity-item">
                      <div class="activity-icon user">${escapeHtml((run.triggeredBy || "S").slice(0, 1).toUpperCase())}</div>
                      <div>
                        <strong>${escapeHtml(run.suite || "Run")}</strong>
                        <small>${escapeHtml(run.status || "queued")} · ${escapeHtml(formatDateTime(run.timestamp))}</small>
                      </div>
                    </div>
                  `,
                )
                .join("")
            : `<div class="placeholder-box">No activity yet.</div>`
        }
      </div>
    </section>
  `;
}

function buildRunsTable(runs) {
  if (!runs.length) {
    return `<div class="placeholder-box">No runs found for the selected filters.</div>`;
  }

  return `
    <div class="table">
      <div class="table-head">
        <div>Run ID</div>
        <div>Status</div>
        <div>Suite</div>
        <div>Environment</div>
        <div>Browser</div>
        <div>Device</div>
        <div>Triggered By</div>
        <div>Started</div>
        <div>Duration</div>
        <div>Actions</div>
      </div>
      ${runs
        .map((run) => {
          const status = String(run.status || "queued").toLowerCase();
          const statusClass =
            status === "failed" ? "fail" : status === "passed" ? "pass" : "";

          return `
            <div class="table-row">
              <div><strong>#${escapeHtml(run.runId || "—")}</strong></div>
              <div><span class="run-pill ${statusClass}">${escapeHtml(run.status || "queued")}</span></div>
              <div>${escapeHtml(run.suite || "—")}</div>
              <div>${escapeHtml(run.environment || "—")}</div>
              <div>${escapeHtml(run.browser || "—")}</div>
              <div>${escapeHtml(run.device || "—")}</div>
              <div>${escapeHtml(run.triggeredBy || "—")}</div>
              <div>${escapeHtml(formatDateTime(run.timestamp || run.startedAt))}</div>
              <div>${escapeHtml(run.duration || "—")}</div>
              <div class="run-actions">
                <button data-action="view" data-run-id="${escapeHtml(run.runId || "")}">View</button>
                <button data-action="logs" data-run-id="${escapeHtml(run.runId || "")}">Logs</button>
                <button data-action="artifacts" data-run-id="${escapeHtml(run.runId || "")}">Artifacts</button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function filteredRuns() {
  const query = state.filters.q.trim().toLowerCase();

  return state.runs.filter((run) => {
    const suite = String(run.suite || "").toLowerCase();
    const env = String(run.environment || "").toLowerCase();
    const browser = String(run.browser || "").toLowerCase();
    const status = String(run.status || "").toLowerCase();
    const triggeredBy = String(run.triggeredBy || "").toLowerCase();
    const runId = String(run.runId || "").toLowerCase();
    const device = String(run.device || "").toLowerCase();
    const locale = String(run.locale || "").toLowerCase();

    const matchesQuery =
      !query ||
      suite.includes(query) ||
      env.includes(query) ||
      browser.includes(query) ||
      status.includes(query) ||
      triggeredBy.includes(query) ||
      runId.includes(query) ||
      device.includes(query) ||
      locale.includes(query);

    const matchesSuite =
      state.filters.suite === "all" ||
      suite === String(state.filters.suite).toLowerCase();
    const matchesEnvironment =
      state.filters.environment === "all" ||
      env === String(state.filters.environment).toLowerCase();
    const matchesBrowser =
      state.filters.browser === "all" ||
      browser === String(state.filters.browser).toLowerCase();
    const matchesStatus =
      state.filters.status === "all" ||
      status === String(state.filters.status).toLowerCase();

    return (
      matchesQuery &&
      matchesSuite &&
      matchesEnvironment &&
      matchesBrowser &&
      matchesStatus
    );
  });
}

function renderRunsPage() {
  const filtered = filteredRuns();
  const stats = summaryStats(filtered);
  const suiteOptions = ["all", ...new Set(state.runs.map((r) => r.suite).filter(Boolean))];
  const environmentOptions = [
    "all",
    ...new Set(state.runs.map((r) => r.environment).filter(Boolean)),
  ];
  const browserOptions = ["all", ...new Set(state.runs.map((r) => r.browser).filter(Boolean))];
  const statusOptions = ["all", "passed", "failed", "queued"];

  return `
    <section class="page-section">
      <div class="page-header">
        <h2>Runs</h2>
        <p>Full execution history across every triggered suite.</p>
      </div>

      <div class="runs-toolbar">
        <input
          id="runSearch"
          type="search"
          placeholder="Search runs, suite, triggered by..."
          value="${escapeHtml(state.filters.q)}"
        />

        <select id="filterSuite">
          ${suiteOptions
            .map(
              (value) => `
                <option value="${escapeHtml(value)}" ${state.filters.suite === value ? "selected" : ""}>
                  ${value === "all" ? "All suites" : escapeHtml(value)}
                </option>
              `,
            )
            .join("")}
        </select>

        <select id="filterEnvironment">
          ${environmentOptions
            .map(
              (value) => `
                <option value="${escapeHtml(value)}" ${state.filters.environment === value ? "selected" : ""}>
                  ${value === "all" ? "All environments" : escapeHtml(value)}
                </option>
              `,
            )
            .join("")}
        </select>

        <select id="filterBrowser">
          ${browserOptions
            .map(
              (value) => `
                <option value="${escapeHtml(value)}" ${state.filters.browser === value ? "selected" : ""}>
                  ${value === "all" ? "All browsers" : escapeHtml(value)}
                </option>
              `,
            )
            .join("")}
        </select>

        <select id="filterStatus">
          ${statusOptions
            .map(
              (value) => `
                <option value="${escapeHtml(value)}" ${state.filters.status === value ? "selected" : ""}>
                  ${value === "all" ? "All statuses" : escapeHtml(value)}
                </option>
              `,
            )
            .join("")}
        </select>
      </div>

      <div class="runs-stats">
        <article class="mini-stat"><span>Total runs</span><strong>${stats.total}</strong></article>
        <article class="mini-stat"><span>Passed</span><strong class="green">${stats.passed}</strong></article>
        <article class="mini-stat"><span>Failed</span><strong class="red">${stats.failed}</strong></article>
        <article class="mini-stat"><span>Queued</span><strong>${stats.queued}</strong></article>
      </div>

      ${buildRunsTable(filtered)}
    </section>
  `;
}

function renderRunDetailsSkeleton(runId) {
  return `
    <section class="page-section">
      <div class="page-header">
        <a class="text-link" href="#runs">← Back to Runs</a>
        <h2>Run Details</h2>
        <p>${escapeHtml(runId)}</p>
      </div>

      <div class="placeholder-box">Loading run details...</div>
    </section>
  `;
}

async function loadRunDetails(runId) {
  const pageRoot = document.getElementById("pageRoot");
  if (!pageRoot) return;

  const hashAtStart = window.location.hash;

  pageRoot.innerHTML = `
    <section class="page-section">
      <div class="page-header">
        <a class="text-link" href="#runs">← Back to Runs</a>
        <h2>Run Details</h2>
        <p>Loading run ${escapeHtml(runId)}...</p>
      </div>
      <div class="placeholder-box">Loading run details...</div>
    </section>
  `;

  try {
    const [runRes, testsRes, failuresRes, artifactsRes, logsRes] = await Promise.all([
      fetch(`/runs/${encodeURIComponent(runId)}`),
      fetch(`/runs/${encodeURIComponent(runId)}/tests`),
      fetch(`/runs/${encodeURIComponent(runId)}/failures`),
      fetch(`/runs/${encodeURIComponent(runId)}/artifacts`),
      fetch(`/runs/${encodeURIComponent(runId)}/logs`),
    ]);

    const [run, tests, failures, artifacts, logsPayload] = await Promise.all([
      runRes.json(),
      testsRes.json(),
      failuresRes.json(),
      artifactsRes.json(),
      logsRes.json(),
    ]);

    if (!runRes.ok) {
      throw new Error(run?.error || "Run not found");
    }

    if (window.location.hash !== hashAtStart) return;

    const logs = logsPayload?.logs || "";

    pageRoot.innerHTML = `
      <section class="page-section">
        <div class="page-header">
          <a class="text-link" href="#runs">← Back to Runs</a>
          <h2>Run Details</h2>
          <p>${escapeHtml(run.runId || runId)}</p>
        </div>

        <div class="metrics-grid">
          <article class="panel"><div class="panel-head"><h2>Status</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.status || "—")}</div></article>
          <article class="panel"><div class="panel-head"><h2>Suite</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.suite || "—")}</div></article>
          <article class="panel"><div class="panel-head"><h2>Environment</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.environment || "—")}</div></article>
          <article class="panel"><div class="panel-head"><h2>Browser</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.browser || "—")}</div></article>
        </div>

        <div class="panel" style="margin-bottom: 16px;">
          <div class="latest-details">
            <div><span>Run ID</span><strong>${escapeHtml(run.runId || "—")}</strong></div>
            <div><span>Device</span><strong>${escapeHtml(run.device || "—")}</strong></div>
            <div><span>Locale</span><strong>${escapeHtml(run.locale || "—")}</strong></div>
            <div><span>Triggered By</span><strong>${escapeHtml(run.triggeredBy || "—")}</strong></div>
            <div><span>Started</span><strong>${escapeHtml(formatDateTime(run.timestamp))}</strong></div>
            <div><span>Duration</span><strong>${escapeHtml(run.duration || "—")}</strong></div>
            <div><span>Quality Score</span><strong>${run.qualityScore ?? "—"}</strong></div>
          </div>
        </div>

        <div class="panel" style="margin-bottom: 16px;">
          <div class="panel-head">
            <h2>Tests</h2>
            <span class="info-dot">i</span>
          </div>
          ${
            Array.isArray(tests) && tests.length
              ? `
                <div class="table">
                  <div class="table-head">
                    <div>Test</div>
                    <div>Status</div>
                    <div>Duration</div>
                    <div>Retry</div>
                  </div>
                  ${tests
                    .map(
                      (test) => `
                        <div class="table-row">
                          <div><strong>${escapeHtml(test.name || "—")}</strong></div>
                          <div>${escapeHtml(test.status || "—")}</div>
                          <div>${escapeHtml(String(test.duration ?? "—"))}</div>
                          <div>${escapeHtml(String(test.retry ?? 0))}</div>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : `<div class="placeholder-box">No tests available yet.</div>`
          }
        </div>

        <div class="panel" style="margin-bottom: 16px;">
          <div class="panel-head">
            <h2>Failures</h2>
            <span class="info-dot">i</span>
          </div>
          ${
            Array.isArray(failures) && failures.length
              ? `
                <div class="table">
                  <div class="table-head">
                    <div>Test</div>
                    <div>Module</div>
                    <div>Error</div>
                    <div>Duration</div>
                  </div>
                  ${failures
                    .map(
                      (failure) => `
                        <div class="table-row">
                          <div><strong>${escapeHtml(failure.test || "—")}</strong></div>
                          <div>${escapeHtml(failure.module || "—")}</div>
                          <div>${escapeHtml(failure.error || "—")}</div>
                          <div>${escapeHtml(String(failure.duration ?? "—"))}</div>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : `<div class="placeholder-box">No failures available yet.</div>`
          }
        </div>

        <div class="panel" style="margin-bottom: 16px;">
          <div class="panel-head">
            <h2>Artifacts</h2>
            <span class="info-dot">i</span>
          </div>
          ${
            Array.isArray(artifacts) && artifacts.length
              ? `
                <div class="table">
                  <div class="table-head">
                    <div>Type</div>
                    <div>Name</div>
                    <div>Path</div>
                  </div>
                  ${artifacts
                    .map(
                      (artifact) => `
                        <div class="table-row">
                          <div><strong>${escapeHtml(artifact.type || "—")}</strong></div>
                          <div>${escapeHtml(artifact.name || "—")}</div>
                          <div>${escapeHtml(artifact.path || "—")}</div>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : `<div class="placeholder-box">No artifacts available yet.</div>`
          }
        </div>

        <div class="panel">
          <div class="panel-head">
            <h2>Logs</h2>
            <span class="info-dot">i</span>
          </div>
          <pre style="margin: 0; white-space: pre-wrap; background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 14px; overflow-x: auto;">${escapeHtml(logs || "No logs available yet.")}</pre>
        </div>
      </section>
    `;
  } catch (error) {
    if (window.location.hash !== hashAtStart) return;

    pageRoot.innerHTML = `
      <section class="page-section">
        <div class="page-header">
          <a class="text-link" href="#runs">← Back to Runs</a>
          <h2>Run Details</h2>
          <p>${escapeHtml(runId)}</p>
        </div>
        <div class="placeholder-box">${escapeHtml(error.message || "Run not found")}</div>
      </section>
    `;
  }
}

function getFailureRunId() {
  if (
    state.selectedFailureRunId &&
    state.runs.some((run) => run.runId === state.selectedFailureRunId)
  ) {
    return state.selectedFailureRunId;
  }

  const fallback = state.runs[0]?.runId || "";
  state.selectedFailureRunId = fallback;
  return fallback;
}

function renderFailuresSkeleton(runId) {
  const runs = state.runs;

  return `
    <section class="page-section">
      <div class="page-header">
        <h2>Failures</h2>
        <p>Failures grouped by run.</p>
      </div>

      <div class="runs-toolbar">
        <select id="failureRunSelect">
          ${
            runs.length
              ? runs
                  .map(
                    (run) => `
                      <option value="${escapeHtml(run.runId)}" ${
                        run.runId === runId ? "selected" : ""
                      }>
                        ${escapeHtml(run.runId)} — ${escapeHtml(run.suite || "—")} (${escapeHtml(run.status || "—")})
                      </option>
                    `,
                  )
                  .join("")
              : `<option value="">No runs available</option>`
          }
        </select>
      </div>

      <div class="panel">
        <div class="panel-head">
          <h2>Failure Summary</h2>
          <span class="info-dot">i</span>
        </div>
        <div id="failureRoot" class="placeholder-box">Loading failures...</div>
      </div>
    </section>
  `;
}

async function loadFailureDetails(runId) {
  const failureRoot = document.getElementById("failureRoot");
  if (!failureRoot) return;

  const hashAtStart = window.location.hash;

  try {
    const [runRes, failuresRes] = await Promise.all([
      fetch(`/runs/${encodeURIComponent(runId)}`),
      fetch(`/runs/${encodeURIComponent(runId)}/failures`),
    ]);

    const [run, failures] = await Promise.all([
      runRes.json(),
      failuresRes.json(),
    ]);

    if (!runRes.ok) {
      throw new Error(run?.error || "Run not found");
    }

    if (window.location.hash !== hashAtStart) return;

    const list = Array.isArray(failures) ? failures : [];

    failureRoot.innerHTML = `
      <div class="metrics-grid" style="margin-bottom: 16px;">
        <article class="panel"><div class="panel-head"><h2>Run</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.runId || "—")}</div></article>
        <article class="panel"><div class="panel-head"><h2>Status</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.status || "—")}</div></article>
        <article class="panel"><div class="panel-head"><h2>Suite</h2><span class="info-dot">i</span></div><div class="quality-label">${escapeHtml(run.suite || "—")}</div></article>
        <article class="panel"><div class="panel-head"><h2>Failures</h2><span class="info-dot">i</span></div><div class="quality-label">${list.length}</div></article>
      </div>

      ${
        list.length
          ? `
            <div class="table">
              <div class="table-head">
                <div>Test</div>
                <div>Module</div>
                <div>Error</div>
                <div>Duration</div>
                <div>Retry</div>
              </div>
              ${list
                .map(
                  (failure) => `
                    <div class="table-row">
                      <div><strong>${escapeHtml(failure.test || "—")}</strong></div>
                      <div>${escapeHtml(failure.module || "—")}</div>
                      <div>${escapeHtml(failure.error || "—")}</div>
                      <div>${escapeHtml(String(failure.duration ?? "—"))}</div>
                      <div>${escapeHtml(String(failure.retry ?? 0))}</div>
                    </div>
                  `,
                )
                .join("")}
            </div>
          `
          : `<div class="placeholder-box">No failures available for this run.</div>`
      }
    `;
  } catch (error) {
    if (window.location.hash !== hashAtStart) return;
    failureRoot.innerHTML = `<div class="placeholder-box">${escapeHtml(error.message || "Run not found")}</div>`;
  }
}

function renderAnalyticsPage() {
  const runs = state.runs;
  const stats = summaryStats(runs);
  const durations = runs
    .map((run) => durationToSeconds(run.duration))
    .filter((seconds) => seconds > 0);
  const avgSeconds = durations.length
    ? Math.round(durations.reduce((sum, seconds) => sum + seconds, 0) / durations.length)
    : 0;

  const recent = [...runs]
    .sort((a, b) => durationToSeconds(b.duration) - durationToSeconds(a.duration))
    .slice(0, 5);

  const trendSource = runs.slice(0, 10);

  return `
    <section class="page-section">
      <div class="page-header">
        <h2>Analytics</h2>
        <p>Trends, quality signals, and duration breakdown from recorded runs.</p>
      </div>

      <div class="metrics-grid">
        <article class="mini-stat"><span>Total runs</span><strong>${stats.total}</strong></article>
        <article class="mini-stat"><span>Pass rate</span><strong class="green">${stats.passRate}%</strong></article>
        <article class="mini-stat"><span>Failed</span><strong class="red">${stats.failed}</strong></article>
        <article class="mini-stat"><span>Avg duration</span><strong>${formatDuration(avgSeconds)}</strong></article>
      </div>

      <section class="triple-grid">
        <article class="panel">
          <div class="panel-head">
            <h2>Pass / Fail Trend</h2>
            <span class="info-dot">i</span>
          </div>
          ${
            trendSource.length
              ? `
                <div style="display:flex; align-items:end; gap:8px; height:140px; padding-top:10px;">
                  ${trendSource
                    .slice()
                    .reverse()
                    .map((run) => {
                      const isPass = String(run.status).toLowerCase() === "passed";
                      const height = isPass ? 110 : 70;
                      const color = isPass ? "#16a34a" : "#dc2626";
                      return `
                        <div style="display:flex; flex-direction:column; align-items:center; gap:6px; width:22px;">
                          <div title="${escapeHtml(run.runId || "—")}" style="width:14px; height:${height}px; border-radius:999px; background:${color}; opacity:0.9;"></div>
                          <span style="font-size:10px; color: var(--muted); writing-mode: vertical-rl; transform: rotate(180deg);">${escapeHtml(
                            (run.suite || "run").slice(0, 8),
                          )}</span>
                        </div>
                      `;
                    })
                    .join("")}
                </div>
              `
              : `<div class="placeholder-box">No analytics data yet.</div>`
          }
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Slowest Runs</h2>
            <span class="info-dot">i</span>
          </div>
          ${
            recent.length
              ? `
                <div class="table-list">
                  ${recent
                    .map(
                      (run) => `
                        <div class="table-row">
                          <div><strong>#${escapeHtml(run.runId || "—")}</strong></div>
                          <div>${escapeHtml(run.suite || "—")}</div>
                          <div>${escapeHtml(run.duration || "—")}</div>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
              : `<div class="placeholder-box">No duration data yet.</div>`
          }
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Release Health</h2>
            <span class="info-dot">i</span>
          </div>
          <div class="latest-details">
            <div><span>Passed</span><strong class="green">${stats.passed}</strong></div>
            <div><span>Failed</span><strong class="red">${stats.failed}</strong></div>
            <div><span>Queued</span><strong>${stats.queued}</strong></div>
            <div><span>Success path</span><strong>${stats.total ? `${Math.round((stats.passed / stats.total) * 100)}%` : "—"}</strong></div>
          </div>
        </article>
      </section>
    </section>
  `;
}

function getCompareSelection() {
  const runs = state.runs;
  const first = runs[0]?.runId || "";
  const second = runs[1]?.runId || first;

  if (!state.compare.left || !runs.some((run) => run.runId === state.compare.left)) {
    state.compare.left = first;
  }

  if (!state.compare.right || !runs.some((run) => run.runId === state.compare.right)) {
    state.compare.right = second;
  }

  return {
    left: runs.find((run) => run.runId === state.compare.left) || runs[0] || null,
    right: runs.find((run) => run.runId === state.compare.right) || runs[1] || runs[0] || null,
  };
}

function renderComparePage() {
  const runs = state.runs;
  const { left, right } = getCompareSelection();

  if (!runs.length) {
    return `
      <section class="page-section">
        <div class="page-header">
          <h2>Compare Runs</h2>
          <p>Compare summary metrics between two recorded runs.</p>
        </div>
        <div class="placeholder-box">No runs available to compare yet.</div>
      </section>
    `;
  }

  const optionsMarkup = runs
    .map(
      (run) => `
        <option value="${escapeHtml(run.runId)}">${escapeHtml(run.runId)} — ${escapeHtml(
        run.suite || "—",
      )}</option>
      `,
    )
    .join("");

  const leftSeconds = durationToSeconds(left?.duration);
  const rightSeconds = durationToSeconds(right?.duration);
  const durationDelta = leftSeconds - rightSeconds;
  const faster = durationDelta === 0 ? "Even" : durationDelta < 0 ? "Run A faster" : "Run B faster";

  const leftPass = String(left?.status).toLowerCase() === "passed";
  const rightPass = String(right?.status).toLowerCase() === "passed";

  return `
    <section class="page-section">
      <div class="page-header">
        <h2>Compare Runs</h2>
        <p>Compare summary metrics between two recorded runs.</p>
      </div>

      <div class="runs-toolbar">
        <select id="compareLeft">
          ${optionsMarkup}
        </select>

        <select id="compareRight">
          ${optionsMarkup}
        </select>
      </div>

      <div class="metrics-grid">
        <article class="mini-stat"><span>Run A duration</span><strong>${escapeHtml(
          left?.duration || "—",
        )}</strong></article>
        <article class="mini-stat"><span>Run B duration</span><strong>${escapeHtml(
          right?.duration || "—",
        )}</strong></article>
        <article class="mini-stat"><span>Difference</span><strong>${escapeHtml(
          formatDuration(Math.abs(durationDelta)),
        )}</strong></article>
        <article class="mini-stat"><span>Faster</span><strong>${escapeHtml(faster)}</strong></article>
      </div>

      <section class="triple-grid">
        <article class="panel">
          <div class="panel-head">
            <h2>Run A</h2>
            <span class="status-chip ${leftPass ? "" : "fail"}">
              ${escapeHtml(left?.status || "—")}
            </span>
          </div>
          <div class="latest-details">
            <div><span>Run ID</span><strong>${escapeHtml(left?.runId || "—")}</strong></div>
            <div><span>Suite</span><strong>${escapeHtml(left?.suite || "—")}</strong></div>
            <div><span>Environment</span><strong>${escapeHtml(left?.environment || "—")}</strong></div>
            <div><span>Browser</span><strong>${escapeHtml(left?.browser || "—")}</strong></div>
            <div><span>Device</span><strong>${escapeHtml(left?.device || "—")}</strong></div>
            <div><span>Triggered By</span><strong>${escapeHtml(left?.triggeredBy || "—")}</strong></div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Run B</h2>
            <span class="status-chip ${rightPass ? "" : "fail"}">
              ${escapeHtml(right?.status || "—")}
            </span>
          </div>
          <div class="latest-details">
            <div><span>Run ID</span><strong>${escapeHtml(right?.runId || "—")}</strong></div>
            <div><span>Suite</span><strong>${escapeHtml(right?.suite || "—")}</strong></div>
            <div><span>Environment</span><strong>${escapeHtml(right?.environment || "—")}</strong></div>
            <div><span>Browser</span><strong>${escapeHtml(right?.browser || "—")}</strong></div>
            <div><span>Device</span><strong>${escapeHtml(right?.device || "—")}</strong></div>
            <div><span>Triggered By</span><strong>${escapeHtml(right?.triggeredBy || "—")}</strong></div>
          </div>
        </article>

        <article class="panel">
          <div class="panel-head">
            <h2>Delta</h2>
            <span class="info-dot">i</span>
          </div>
          <div class="latest-details">
            <div><span>Status</span><strong>${escapeHtml(
              left?.status === right?.status ? "Same" : "Different",
            )}</strong></div>
            <div><span>Duration</span><strong>${escapeHtml(formatDuration(Math.abs(durationDelta)))}</strong></div>
            <div><span>Pass state</span><strong>${escapeHtml(
              leftPass === rightPass ? "Same" : "Different",
            )}</strong></div>
            <div><span>Suite</span><strong>${escapeHtml(
              left?.suite === right?.suite ? "Same" : "Different",
            )}</strong></div>
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderPlaceholder(title, description) {
  return `
    <section class="page-section">
      <div class="page-header">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      <div class="panel">
        <div class="placeholder-box">
          This page is wired later, but the app shell and navigation are already working.
        </div>
      </div>
    </section>
  `;
}

function renderContent(route) {
  if (route.page === "dashboard") return renderDashboard();
  if (route.page === "runs") return renderRunsPage();
  if (route.page === "run-details") return renderRunDetailsSkeleton(route.runId);
  if (route.page === "failures") return renderFailuresSkeleton(route.runId || getFailureRunId());
  if (route.page === "analytics") return renderAnalyticsPage();
  if (route.page === "compare") return renderComparePage();
  if (route.page === "tests")
    return renderPlaceholder("Tests", "Every test seen across the latest run and recorded history.");
  if (route.page === "schedules")
    return renderPlaceholder("Schedules", "Automated executions configured in the workflow.");
  if (route.page === "artifacts")
    return renderPlaceholder("Artifacts", "Reports, logs, screenshots, and traces.");
  if (route.page === "logs")
    return renderPlaceholder("Logs", "Console output and workflow logs for recent runs.");
  if (route.page === "bookmarks")
    return renderPlaceholder("Bookmarks", "Saved runs and failures for quick access.");
  if (route.page === "settings")
    return renderPlaceholder("Settings", "Project configuration and preferences.");
  return renderDashboard();
}

function wireEvents() {
  const suiteSelect = document.getElementById("suiteSelect");
  const runBtn = document.getElementById("runBtn");

  if (suiteSelect) {
    suiteSelect.addEventListener("change", () => {
      state.selectedSuiteId = suiteSelect.value;
    });
  }

  if (runBtn) {
    runBtn.addEventListener("click", async () => {
      const suiteId = getSelectedSuiteId();
      const defaults = getDefaultExecutionContext(suiteId);

      if (!suiteId) {
        alert("No suite available yet.");
        return;
      }

      if (!defaults.environment || !defaults.browser || !defaults.device) {
        alert("No execution context available for the selected suite yet.");
        return;
      }

      const response = await fetch("/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suite: suiteId,
          environment: defaults.environment,
          browser: defaults.browser,
          device: defaults.device,
          locale: defaults.locale || "",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(result?.error || "Failed to create run");
        return;
      }

      await loadRuns();
      await loadSuites();
      render();
      window.location.hash = "#runs";
    });
  }

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.hash = `#${button.dataset.nav}`;
    });
  });

  const search = document.getElementById("runSearch");
  const suiteFilter = document.getElementById("filterSuite");
  const environmentFilter = document.getElementById("filterEnvironment");
  const browserFilter = document.getElementById("filterBrowser");
  const statusFilter = document.getElementById("filterStatus");

  if (search) {
    search.addEventListener("input", (event) => {
      state.filters.q = event.target.value;
      render();
    });
  }

  if (suiteFilter) {
    suiteFilter.addEventListener("change", (event) => {
      state.filters.suite = event.target.value;
      render();
    });
  }

  if (environmentFilter) {
    environmentFilter.addEventListener("change", (event) => {
      state.filters.environment = event.target.value;
      render();
    });
  }

  if (browserFilter) {
    browserFilter.addEventListener("change", (event) => {
      state.filters.browser = event.target.value;
      render();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", (event) => {
      state.filters.status = event.target.value;
      render();
    });
  }

  const failureRunSelect = document.getElementById("failureRunSelect");
  if (failureRunSelect) {
    failureRunSelect.addEventListener("change", (event) => {
      const runId = event.target.value;
      state.selectedFailureRunId = runId;
      window.location.hash = `#/failures/${runId}`;
    });
  }

  const compareLeft = document.getElementById("compareLeft");
  const compareRight = document.getElementById("compareRight");

  if (compareLeft) {
    compareLeft.value = state.compare.left || compareLeft.value;
    compareLeft.addEventListener("change", (event) => {
      state.compare.left = event.target.value;
      render();
    });
  }

  if (compareRight) {
    compareRight.value = state.compare.right || compareRight.value;
    compareRight.addEventListener("change", (event) => {
      state.compare.right = event.target.value;
      render();
    });
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const runId = button.dataset.runId;

      if (!runId) return;

      if (action === "view") {
        window.location.hash = `#/runs/${runId}`;
      } else if (action === "logs") {
        window.location.hash = "#logs";
      } else if (action === "artifacts") {
        window.location.hash = "#artifacts";
      } else if (action === "open-failure") {
        window.location.hash = `#/failures/${runId}`;
      }
    });
  });
}

function render() {
  const route = getRoute();
  const page = activeNavPage(route.page);

  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar(page)}
      <main class="main">
        ${renderTopbar()}
        <div id="pageRoot">
          ${renderContent(route)}
        </div>
      </main>
    </div>
  `;

  wireEvents();

  if (route.page === "run-details" && route.runId) {
    loadRunDetails(route.runId);
  }

  if (route.page === "failures") {
    loadFailureDetails(route.runId || getFailureRunId());
  }
}

async function loadRuns() {
  try {
    const res = await fetch("/runs");
    const data = await res.json();
    state.runs = Array.isArray(data) ? data : [];
  } catch {
    state.runs = [];
  }
}

async function loadSuites() {
  try {
    const res = await fetch("/suites");
    const data = await res.json();
    state.suites = Array.isArray(data) ? data : [];
  } catch {
    state.suites = [];
  }

  if (!state.suites.length) {
    state.suites = deriveSuitesFromRuns();
  }

  const options = getSuiteOptions();
  if (
    !state.selectedSuiteId ||
    !options.some((option) => option.value === state.selectedSuiteId)
  ) {
    state.selectedSuiteId = options[0]?.value || "";
  }
}

async function init() {
  await loadRuns();
  await loadSuites();
  render();
}

window.addEventListener("hashchange", render);
init();