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

const statusEmoji = failed === 0 ? '✅' : '❌';
const statusText = failed === 0 ? 'All tests passed' : `${failed} test(s) failed`;

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

const payload = {
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${statusEmoji} FEDS QA — ${statusText}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Suite*\n\`${SUITE}\`` },
        { type: 'mrkdwn', text: `*Environment*\n${envLabel}` },
        { type: 'mrkdwn', text: `*Browser*\n${browserLabel}` },
        { type: 'mrkdwn', text: `*Device*\n${deviceLabel}` },
        {
          type: 'mrkdwn',
          text: `*Results*\n✅ ${passed} passed  ❌ ${failed} failed  📊 ${passRate}% pass rate`,
        },
        { type: 'mrkdwn', text: `*Triggered by*\n${TRIGGERED_BY}` },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '📊 Open Dashboard', emoji: true },
          url: DASHBOARD_URL,
          style: 'primary',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '🔍 View CI Run', emoji: true },
          url: RUN_URL,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Run #${process.env.GITHUB_RUN_NUMBER || '—'} · ${new Date().toUTCString()}`,
        },
      ],
    },
  ],
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
