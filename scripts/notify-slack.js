// Posts test run results to your private Slack channel only.
// Triggered by .github/workflows/run-tests.yml after every run.
// Only posts to the SLACK_WH webhook — scoped to your private channel, no one else sees it.

const https = require('https');
const url = require('url');

const {
  SLACK_WH,
  PASSED = '0',
  FAILED = '0',
  TOTAL = '0',
  SUITE = 'unknown',
  BROWSER = 'all',
  DEVICE = 'desktop',
  ENV_NAME = 'aem-live',
  RUN_URL = '',
  DASHBOARD_URL = '',
  TEST_URL = '',
  TRIGGERED_BY = 'GitHub Actions',
} = process.env;

if (!SLACK_WH) {
  console.log('No SLACK_WH secret set — skipping Slack notification');
  process.exit(0);
}

const passed = parseInt(PASSED, 10);
const failed = parseInt(FAILED, 10);
const total = parseInt(TOTAL, 10);
const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

const statusEmoji = total === 0 ? '⚠️' : failed === 0 ? '✅' : '❌';
const statusText = total === 0 ? 'No tests ran — check suite config' : failed === 0 ? 'All tests passed' : `${failed} test(s) failed`;

const browserLabel = {
  chrome: '🟠 Chrome',
  firefox: '🦊 Firefox',
  safari: '🧭 Safari',
  all: '🟠 Chrome · 🦊 Firefox · 🧭 Safari',
}[BROWSER] || BROWSER;

const deviceLabel = {
  desktop: '🖥 Desktop',
  mobile: '📱 Mobile',
  tablet: '💻 Tablet',
  all: '🖥 Desktop · 📱 Mobile · 💻 Tablet',
}[DEVICE] || DEVICE;

const envLabel = {
  'aem-live': 'AEM Live',
  prod: 'Adobe.com Prod',
  stage: 'Stage',
}[ENV_NAME] || ENV_NAME;

// Slack Workflow Trigger format — 11 variables with embedded labels for readability
const payload = {
  status_emoji: `${statusEmoji} ${statusText}`,
  suite: TEST_URL ? `Suite: ${SUITE} | URL: ${TEST_URL}` : `Suite: ${SUITE}`,
  browser: `Browser: ${browserLabel}`,
  device: `Device: ${deviceLabel}`,
  environment: `Environment: ${envLabel}`,
  passed: `Passed: ${passed}`,
  failed: `Failed: ${failed}`,
  pass_rate: `Pass Rate: ${passRate}%`,
  dashboard_url: `Dashboard: ${DASHBOARD_URL || 'https://snehayt.github.io/ccfeds-automation/'}`,
  run_url: `Run: ${RUN_URL}`,
  triggered_by: `Triggered By: ${TRIGGERED_BY}`,
};

const parsedUrl = new url.URL(SLACK_WH);
const options = {
  hostname: parsedUrl.hostname,
  path: parsedUrl.pathname,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};

const req = https.request(options, (res) => {
  console.log(`Slack notification sent — HTTP ${res.statusCode}`);
});

req.on('error', (err) => {
  console.error('Failed to send Slack notification:', err.message);
  process.exit(1);
});

req.write(JSON.stringify(payload));
req.end();
