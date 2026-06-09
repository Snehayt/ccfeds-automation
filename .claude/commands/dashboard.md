# /dashboard — Build FEDS QA Observability Dashboard

Generate a complete, self-contained Test Automation Observability Dashboard for this repo.
No npm, no framework, no build step. Open `dashboard/index.html` in any browser.

> **Browser & device selection happens in Slack**, not here.
> The Slack trigger bot asks the user which browser(s) and device(s) to run before firing the tests.
> This dashboard displays results from whatever was run, with interactive filters to drill down.

---

## Generate the dashboard

Create `dashboard/index.html` — single HTML file, no dependencies.

## Technology (CDN only — zero installs)
- Apache ECharts 5 via jsDelivr CDN
- Vanilla JS (ES6)
- CSS custom properties
- Google Fonts (Inter) via CDN

## Data source
On load, `fetch('../nala-results.json')` (written by `utils/reporters/json-reporter.js`).
If not found, silently fall back to built-in mock data.

JSON shape:
```json
{
  "gitBranch": "feds-lnav",
  "gitRepo": "ccfeds-automation",
  "results": [
    {
      "name": "feds-lnav-us",
      "browser": "chrome",
      "status": "passed",
      "duration": 12400,
      "errorMessage": null
    }
  ],
  "timestamp": "2026-06-09T10:00:00Z"
}
```

---

## Global filter bar (sticky, always visible)

Render a sticky filter bar below the header. Changing any filter re-renders all charts instantly.

| Filter | Options |
|--------|---------|
| **Browser** | Chrome 🟠 · Firefox 🦊 · Safari 🧭 · All |
| **Device** | Desktop 🖥 · iPhone 📱 · Android 🤖 · iPad 💻 · All |
| **Suite** | feds-lnav · cmp-banner · express-lingo · site-redesign · All |
| **Locale** | US · GB · DE · FR · JP · All |
| **Time range** | 7d · 14d · 30d |

Active filter pills highlighted with accent color. Default: All for every filter.

---

## Slack Trigger Panel (section inside dashboard)

Include a dedicated "Slack Trigger" card in the dashboard that shows:

**Last triggered run info:**
- Who triggered it (user name/avatar)
- When it was triggered
- Which browser(s) were selected
- Which device(s) were selected
- Which suite and locale were selected
- Run status (completed / running / failed)
- Link to GitHub Actions run

**Recent trigger history** (last 5 Slack-triggered runs):
- Table: user · browser(s) · device(s) · suite · locale · status · pass/fail count · time ago

This panel reflects what was chosen in Slack and confirms the test run scope.

---

## Design system
- Background: `#0a0a0f`
- Card surface: `#12121a`
- Card border: `rgba(255,255,255,0.08)`
- Accent gradient: `#7c3aed` → `#2563eb`
- Pass: `#10b981` · Fail: `#ef4444` · Flaky: `#f59e0b` · Skip: `#475569`
- Text primary: `#f1f5f9` · Text muted: `#64748b`
- Font: Inter
- Cards: `backdrop-filter: blur(20px)`, `border-radius: 12px`, hover glow

---

## Dashboard sections (all 12)

### 1. Header
- "FEDS QA" gradient text + "Observability Platform" subtitle
- Pulsing green dot + "Live" + last run timestamp
- Branch badge (purple), Env badge (blue)
- "Run Tests" button (gradient) + "Trigger via Slack" button (outline)

### 2. Quality Health Score
- ECharts gauge 0–100
- Score = (passRate × 0.5) + ((1 − flakyRate) × 0.3) + (coverage × 0.2)
- Green >85, yellow 70–85, red <70
- Sub-stats: Pass Rate, Flaky Rate, Avg Duration

### 3. KPI Cards (5 cards)
- Total Tests · Pass Rate · Avg Duration · Flaky Tests · Critical Failures
- Large number + delta vs last run + ECharts sparkline

### 4. Environment Health
- AEM Live · Adobe.com Prod · Stage
- ECharts small donut per env, pass %, status badge, last run time

### 5. Live Execution Monitor
- Filter tabs: All | Running | Passed | Failed | Flaky
- Each row: suite dot · test name · browser icon · device icon · locale badge · status pill · duration
- CSS spinner on running rows

### 6. Pass/Fail Trend (30 days)
- ECharts line + area chart: Passed (green), Failed (red), Flaky (amber)
- Toggle: 7d | 14d | 30d
- "By browser" toggle: separate line per browser

### 7. Failure Intelligence
- Top 5 failures: name, count, browser icons, device badges, expandable error inline
- ECharts horizontal bar: failures by test step

### 8. Test Heatmap
- ECharts calendar heatmap (90 days), color = pass rate
- Locale × last-7-runs grid: green/red/gray squares

### 9. Flaky Test Leaderboard
- Rank · name · suite · flaky % bar · browsers · device · trend
- Sortable column headers

### 10. Slack Activity Feed
- Who triggered · what (browser + device + suite) · when · status · pass/fail count
- Shows browser and device icons per entry so it's clear what each run covered

### 11. Run Timeline (Gantt)
- ECharts horizontal bars per test
- Color by status, browser + device in tooltip

### 12. Release Readiness
- Score circle + checklist (pass ✅ / warn ⚠️ / fail ❌)
- Checklist: critical paths, P0s, flaky rate, a11y, analytics, stage env, CMP locales, cross-browser, cross-device
- Bottom banner: "READY TO RELEASE" or "NOT READY"

---

## Mock data

Suites: feds-lnav (120), cmp-banner (89), express-lingo (38), site-redesign (0)
Browsers: chrome, firefox, safari
Devices: desktop, iphone, android, ipad
Locales: us, gb, de, fr, jp, au, ca, mx, br, in, es, it, kr, nl, se
Stats: 247 total · 226 passed · 14 failed · 7 flaky · 91.5% pass rate
Branch: feds-lnav · Env: AEM Live · Score: 87/100

Real feds-lnav step names:
- Page load — check HTTP status
- Nav structure — nav wrapper, Adobe logo, nav list visible
- Nav links — every link inside nav has a valid href
- CTAs — primary and secondary visible, have href
- App switcher — click opens modal with app links
- Sign In — button visible and clickable
- Dropdown — PDF & Productivity opens, links have href
- Breadcrumbs — links visible and have valid href
- Nav height — nav.localnav renders with non-zero height
- Accessibility — axe-core WCAG 2.1 AA scan on nav
- Analytics — daa-ll on all nav elements

Real failures:
- "Sign In button not visible (IMS timeout)" — Chrome+Firefox — Desktop — 12×
- "Dropdown panel hidden after click" — Firefox+Safari — Desktop — 8×
- "CMP banner not rendered on DE locale" — Chrome — Desktop — 6×
- "nav.localnav bounding box returned null" — Safari — iPad — 4×
- "ERR_ABORTED navigation" — all browsers — Desktop — 3×

Flaky tests:
- Sign In (45% flaky) — Chrome+Firefox — Desktop
- App switcher (32% flaky) — Safari — Desktop+iPad
- Dropdown opens (15% flaky) — Firefox+Safari — Desktop

Slack activity (mock — shows browser + device per trigger):
- Sneha Y · Chrome · Desktop · feds-lnav · US · 9m ago · completed · 120 tests · 113✅ 7❌
- Rahul K · Chrome+Firefox · Desktop · cmp-banner · All · 1h ago · completed · 89 tests · 78✅ 11❌
- Sneha Y · Safari · iPad · feds-lnav · US · 3h ago · completed · 38 tests · 29✅ 9❌
- Arun M · All browsers · Desktop · feds-lnav · All locales · 5h ago · failed · 120 tests · 87✅ 33❌
- Sneha Y · Chrome · Desktop · site-redesign · US · 1d ago · completed · 45 tests · 44✅ 1❌

Environments:
- AEM Live — 94% pass — healthy — 1.2s — 9m ago
- Adobe.com Prod — 88% pass — healthy — 0.9s — 1h ago
- Stage — 76% pass — degraded — 2.1s — 3h ago

---

## Implementation rules
1. Single file: `dashboard/index.html` only
2. CDN only — zero npm, zero local dependencies
3. `fetch('../nala-results.json')` on load, silent mock fallback
4. Filter bar re-renders all charts and lists on change
5. Browser filter and device filter both update all panels
6. All 12 sections render correctly with mock data
7. Failure rows expand inline on click
8. Flaky leaderboard sortable by column header click
9. Desktop-first layout (1280px+)
10. All JS inline in the HTML file
11. Do NOT modify any existing repo files
12. Production quality — not a prototype

---

## After creating the file, tell the user

"Dashboard ready at `dashboard/index.html` — open it in any browser, no install needed.

All filters default to **All**. Use the filter bar to drill down by browser, device, suite, or locale.

Browser and device selection for running tests happens in **Slack** — see the Slack Activity Feed panel to see what each triggered run covered."
