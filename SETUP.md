# CCFEDs Automation — Setup Guide

This guide sets up the full automation system:
- Run any test suite from a **single Slack channel**
- Results and failures posted back to the same channel automatically
- **Allure dashboard** published to GitHub Pages after every run — clickable, with screenshots, traces, and failure details

---

## What you get after setup

```
Slack channel #ccfeds-automation
  │
  ├─ /run-tests  →  form pops up (suite, env, tags, browser)
  │                 →  GitHub Actions runs the tests
  │                 →  results posted back to this channel
  │
  └─ Allure dashboard (permanent URL, always up to date)
     https://<your-org>.github.io/ccfeds-automation/allure-report
```

---

## Step 1 — GitHub repository secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these two secrets:

| Secret name | Value |
|---|---|
| `SLACK_WEBHOOK_URL` | Incoming webhook URL for your Slack channel (see Step 3) |
| `DEV_BASE_URL` | Your dev/branch environment URL (optional) |

---

## Step 2 — GitHub Personal Access Token (PAT)

This token lets Slack trigger your GitHub Actions workflow.

1. Go to **GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens**
2. Click **Generate new token**
3. Set:
   - Repository: `ccfeds-automation`
   - Permissions: `Actions → Read and Write`
4. Copy the token — you will paste it into Slack Workflow Builder in Step 4

> Keep this token private. Do not commit it to the repo.

---

## Step 3 — Slack incoming webhook (for result notifications)

1. Go to your Adobe Slack → **Apps → Incoming Webhooks → Add to Slack**
2. Choose the channel (e.g. `#ccfeds-automation`)
3. Click **Add Incoming Webhooks integration**
4. Copy the **Webhook URL** (starts with `https://hooks.slack.com/...`)
5. Paste this URL as the `SLACK_WEBHOOK_URL` secret in Step 1

---

## Step 4 — Slack Workflow Builder (the trigger form)

This creates the interactive `/run-tests` form in your channel.

### 4a. Open Workflow Builder
1. In Slack, click your workspace name → **Tools → Workflow Builder**
2. Click **New Workflow → Build Workflow**
3. Name it: `Run Automation Tests`

### 4b. Set the trigger
1. Choose **Slash command**
2. Command name: `/run-tests`
3. Description: `Trigger automation tests — pick suite, env, tags and browser`
4. Choose the channel: `#ccfeds-automation`
5. Click **Next**

### 4c. Add the input form step
1. Click **Add Step → Open a Form**
2. Form title: `🚀 Run Automation Tests`
3. Add these fields:

**Field 1 — Suite**
- Type: `Select from a list`
- Field name: `suite`
- Label: `Test Suite`
- Options: `feds-lnav`, `feds`, `express`, `cc`, `all`
- Default: `feds-lnav`

**Field 2 — Environment**
- Type: `Select from a list`
- Field name: `env`
- Label: `Environment`
- Options: `prod`, `stage`, `dev`
- Default: `prod`

**Field 3 — Tags (optional)**
- Type: `Short text`
- Field name: `tags`
- Label: `Tags (optional)`
- Placeholder: `e.g. @smoke  or  @feds-lnav-de`
- Required: No

**Field 4 — Browser**
- Type: `Select from a list`
- Field name: `browser`
- Label: `Browser`
- Options: `all`, `chromium`, `firefox`, `webkit`
- Default: `all`

4. Click **Save**

### 4d. Add the GitHub trigger step
1. Click **Add Step → Send a web request**
2. Fill in:

```
URL:
  https://api.github.com/repos/YOUR-ORG/ccfeds-automation/actions/workflows/run-tests.yml/dispatches

Method: POST

Headers:
  Authorization   →  token YOUR_GITHUB_PAT_FROM_STEP_2
  Accept          →  application/vnd.github.v3+json
  Content-Type    →  application/json

Request body:
  {
    "ref": "main",
    "inputs": {
      "suite":   "{{suite}}",
      "env":     "{{env}}",
      "browser": "{{browser}}"
    }
  }
```

> Replace `YOUR-ORG` with your GitHub org and `YOUR_GITHUB_PAT_FROM_STEP_2` with the PAT from Step 2.
> The `{{suite}}`, `{{env}}`, `{{browser}}` placeholders are Slack variables — Workflow Builder fills them from the form.

3. Click **Save**

### 4e. Add the confirmation message step
1. Click **Add Step → Send a message**
2. Channel: `#ccfeds-automation`
3. Message:
```
🚀 *{{suite}}* tests triggered on *{{env}}*
Browser: {{browser}}
Tags: {{tags}}

I'll post results here when done.
📊 Dashboard → https://YOUR-ORG.github.io/ccfeds-automation/allure-report
```
4. Click **Save**

### 4f. Publish
1. Click **Publish**
2. The `/run-tests` command is now live in `#ccfeds-automation`

---

## Step 5 — Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / folder: `/ (root)`
4. Click **Save**

After the first workflow run, the Allure report will be live at:
```
https://<your-org>.github.io/ccfeds-automation/allure-report
```

---

## How to use

### From Slack
```
/run-tests
```
A form pops up. Fill in suite, env, tags, browser → click **Run Tests**.

Results post back to `#ccfeds-automation` when done:
```
✅ feds-lnav | prod | 142 passed · 3 skipped · 0 failed
📊 View Report  ⚙️ Run logs
```

### From GitHub Actions UI
1. Go to repo → **Actions → Run Tests + Publish Dashboard**
2. Click **Run workflow**
3. Fill in the inputs → **Run workflow**

### Automated daily run
The workflow runs automatically every day at **6 AM UTC** on `feds-lnav` prod.
No action needed.

---

## Adding a new test suite

1. Create your files following the pattern:
   ```
   features/feds/<suite-name>/<suite-name>.spec.js
   selectors/feds/<suite-name>.page.js
   tests/feds/<suite-name>/<suite-name>.test.js
   configs/<suite-name>.config.js
   ```
2. Add the new suite name to `.github/workflows/run-tests.yml` under the `suite` input options
3. Add it to the Slack Workflow Builder form (Step 4c → Field 1 options)
4. Done — it will automatically appear in the Allure dashboard

---

## Who can use this

Anyone who joins `#ccfeds-automation` can:
- Trigger test runs via `/run-tests`
- See all past results in the channel
- Open the Allure dashboard from any result link

No individual setup needed after the one-time admin setup above.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `/run-tests` command not found | Check Workflow Builder is published and linked to the channel |
| GitHub workflow not triggering | Verify the PAT has `Actions: Write` permission and hasn't expired |
| Allure report not updating | Check GitHub Pages is enabled on `gh-pages` branch |
| Slack result notification not posting | Verify `SLACK_WEBHOOK_URL` secret is set correctly in repo settings |
| Tests all failing with 404 | Update `TEST_PAGE` in `features/feds/feds-lnav/feds-lnav.spec.js` to a valid page path |
