# Lingo / Geo-Banner Test Suite — Skill Guide

How to write geo/locale-banner test scripts, following the same POM/spec/test-runner pattern as
`selectors/express/lingo.page.js` + `features/express/lingo.spec.js` + `tests/express/lingo.test.js`, but
generalized to run against **any ACOM URL** — Express, UPP (pricing), CC marketing pages, DC marketing
pages, plain product pages (Photoshop, Acrobat, Creative Cloud, etc.) — and BACOM, across **stage, prod, or
an aem.live branch**, **with or without `milolibs`**, for **any `akamaiLocale` (GeoIP)**, **with or without
a PREF-LANG cookie**.

### What's different from the Express-only model this generalizes from

Express's existing suite is built around **one fixed URL path** (`/express/...`) tested against **many
`akamaiLocale` values**. This guide's suite makes the **path itself a parameter** too, so one spec file's
data can mix rows for the US root (`/`), a plain product page (`/products/photoshop.html`), a CC marketing
page (`/creativecloud.html`), a DC marketing page (`/acrobat.html`), a UPP pricing page, and `/express/...`
— each of those, in turn, tested against many `akamaiLocale` values and many cookie values. It's a
multi-URL × multi-GeoIP × multi-cookie matrix, not a single-URL × multi-GeoIP one.

The other correction from earlier drafts: supporting UPP/CC/DC does **not** require discovering new
`supported-markets.json` endpoints per product — see §1.4. It only requires routing by **path**
(`/express/...` vs everything else vs BACOM), which a single resolver function handles for all of them.

**Before any of that**: §2 is the first thing any new suite should implement — validating the JSON itself
hasn't silently changed. Every rule in §3 is only as good as the data it was checked against.

Read §3 before writing any banner/modal test logic — the flowchart looks simple, but the PREF-LANG check
has been built wrong twice already this project and only the version in §3.2 has held up against live
testing.

---

## 1. Domain model

### 1.1 The three possible outcomes

- **No Action** — page renders normally, no banner or modal.
- **Banner** — a dismissible banner recommending a different market ("View this page in Français").
- **Geo-Routing Modal** — a blocking modal ("This Adobe site does not match your location"), with one or
  more market options.

Modal vs Banner is a **product-type** difference, not a geo-logic difference:
- **ACOM** (Express, UPP, CC/DC marketing pages, and any plain `www.[stage.]adobe.com` product page) →
  **Modal** when the page's own site+GeoIP combo isn't supported.
- **BACOM** (`business.[stage.]adobe.com`) → **Banner** in that same situation, never a Modal.

Both product types show a plain **Banner** in the "combo already supported, just wrong language" case
(Scenario 2 below) — that part is identical for ACOM and BACOM.

### 1.2 Three fields

- **PAGE-LANG** — the language of the page you're on, from the site path prefix (`/fr` → `fr`, `/uk` → `en`,
  `/` → `en`).
- **GeoIP** — the visitor's detected location. Tests simulate this via the `akamaiLocale` query param
  instead of relying on real client IP.
- **PREF-LANG** — the language deduced from the `international` cookie. **If no cookie is set, PREF-LANG
  defaults to English (`en`) — i.e. treated the same as a US visitor.**

### 1.3 The flowchart

```
Is (Site path + GeoIP) a supported combo?
├─ YES
│   └─ Is PREF-LANG's language == PAGE-LANG?
│       ├─ YES → No Action                                            (Scenario 1, 3)
│       └─ NO  → Is (PREF-LANG's language + GeoIP) a supported combo?
│                 ├─ YES → Banner, recommending that matching market   (Scenario 2)
│                 └─ NO  → No Action                                   (Scenario 1a, 3)
└─ NO
    └─ Is GeoIP supported by ANY row at all?
        ├─ NO  → No Action                                             (Scenario 6)
        └─ YES → Is (PREF-LANG's language + GeoIP) a supported combo?
                  ├─ YES → single recommendation for that GeoIP         (Scenario 4)
                  │         ACOM: Modal (1 option)   BACOM: Banner
                  └─ NO  → all valid markets for this GeoIP,
                            ranked by `regionPriorities`                (Scenario 5)
                            ACOM: Modal (multi-option)   BACOM: Banner
```

### 1.4 `supported-markets.json` schema

| Field | Meaning |
|---|---|
| `prefix` | Site path prefix, e.g. `fr`, `mx`, `ch_de`, `""` (root/US) |
| `lang` | Language code for this row, e.g. `fr`, `es`, `de` |
| `supportedRegions` | CSV of GeoIP/region codes this row is a valid destination for |
| `regionPriorities` | CSV of `region:rank` — tie-break order when multiple rows compete for one GeoIP |
| `defaultMarket` | The row's canonical market/region code |
| `text`, `continueText`, `modalTitle`, `modalDescription`, `nativeName` | Rendered copy fields |

**Which JSON a page uses depends on its *path*, not the product it belongs to:**
- Any ACOM page whose path is **not** under `/express/` — this includes UPP pricing pages, CC and DC
  marketing pages, plain product pages like `/products/photoshop.html`, `/acrobat.html`,
  `/creativecloud.html`, and the bare root `/` — reads:
  `{origin}/federal/assets/supported-markets/supported-markets.json`
  (the `federal` path segment is legacy milo-repo naming for the shared nav/footer library; **it is ACOM's
  data**, not a separate product's).
- Any page under `/express/` reads its own file:
  `{origin}/express/assets/supported-markets/supported-markets-express.json`
- Any BACOM page (`business.[stage.]adobe.com`) reads:
  `{origin}/assets/supported-markets/supported-markets-bacom.json`

So "does this test suite support UPP/CC/DC" is really just "does it correctly route by path" — no new JSON
endpoints need discovering, unlike what earlier drafts of this doc assumed.

---

## 2. JSON snapshot validation — run this first, before any UI test

Before running any banner/modal assertions, validate that `supported-markets.json` (and any sibling JSON
like `markets.json`) hasn't silently changed shape or values since the last known-good snapshot. This is
exactly what `tests/express/lingo.test.js`'s `Lingo-Geo | JSON Snapshot` test group already does for
Express (`jsonSnapshotFeature`, `findJsonChanges`, `SNAPSHOT_DIR`) — generalize the same pattern per site
rather than reinventing it.

### Why this is step one, not an afterthought

Every rule in §3 (the flowchart-derived expectations) is only as good as the JSON data it was verified
against. If a row's `supportedRegions`, `lang`, `regionPriorities`, or copy fields change upstream without
anyone noticing, the rest of the suite silently starts asserting against stale expectations instead of
failing loudly at the actual source of the problem. One clear "this row changed" failure here is more
useful than a wave of unrelated-looking banner-assertion failures downstream with no obvious common cause.

### Pattern (port directly from `tests/express/lingo.test.js`)

1. Fetch the live JSON for the site under test, using §4.2's path-based resolver.
2. If no snapshot file exists yet for this site, write one and pass — this is the bootstrapping case, same
   as Express's existing test.
3. If a snapshot already exists, diff it against the live payload:
   - Row-by-row, key-by-key — reuse `findJsonChanges` from `tests/express/lingo.test.js` as-is, it's
     already generic (added row / removed row / changed column, by index).
   - Also diff any top-level keys outside the `data` array.
4. If **any** difference is found, fail the test and print every changed field explicitly (row index,
   column name, old value → new value) — never just report "JSON changed," report exactly what changed and
   where.
5. This test must run **first**, ahead of every other `test.describe` group in the file, and should carry
   its own tag (e.g. `@json-snapshot`) so it can be run alone as a fast pre-check — for example in CI,
   before spending time on the full banner/modal matrix.

### One snapshot file per site, not one shared file

ACOM, BACOM, and Express each read a different JSON endpoint (§1.4) and must be validated independently:
- `test-cases/snapshots/acom-supported-markets.snapshot.json`
- `test-cases/snapshots/bacom-supported-markets.snapshot.json`
- `test-cases/snapshots/express-supported-markets.snapshot.json`

### When this test fails, stop and investigate before updating the snapshot

A flagged change could mean:
- A market was intentionally added, removed, or re-prioritized — update the snapshot, **and** re-check
  whether §3's rules still hold against the new data (a new row could introduce a fresh tie-break case
  like §3.3's `ch`/`in` situations).
- Only copy text changed — safe to update the snapshot, no rule changes needed.
- A field was renamed or restructured — this can silently break the POM helpers in §5.3 (e.g. if
  `supportedRegions` were renamed) — investigate the actual diff before touching the snapshot at all.

---

## 3. Confirmed rules

### 3.1 Site-combo check

`isSupportedCombo(pagePrefix, geoIp)` = does the row for `pagePrefix` list `geoIp` in its
`supportedRegions`. Matches `lingo.page.js`'s existing `isSupportedCombo` — no change needed.

### 3.2 PREF-LANG check is a language-level match — worked example (live-confirmed)

**Rule**: does **any row sharing PREF-LANG's language** have this GeoIP in its `supportedRegions`? If yes,
recommend *that row* — even if it isn't literally the cookie's own row.

**Important correction on *how* to find "supported market" — match on the `Lang` + `SupportedRegions`
columns, not by looking up one fixed row and trusting its own fields in isolation.** Earlier drafts of this
logic treated "is this GeoIP supported for this cookie" as one lookup: resolve the cookie's row by `prefix`,
then check that single row's own `supportedRegions`. That happens to work when the cookie value and the
target row are the same row, but the *general* algorithm is a **two-column search across the whole
dataset**:

1. Take PREF-LANG's language value (from the cookie, however it was derived).
2. Scan every row in `supported-markets.json` and keep the ones where **`Lang` == that language AND
   `SupportedRegions` contains the GeoIP**.
3. Whichever row(s) survive that filter are the "supported market(s)" — use *that* row's copy, not a
   row looked up by prefix alone.

(This is exactly what `findLanguageMatchesForGeo(lang, geoIp, ...)` in `lingo.page.js` already implements —
call out explicitly when documenting/porting this logic that the filter is on `lang` + `supportedRegions`
together, never a single-row prefix lookup standing in for the whole check.)

**Worked example 2 (live-confirmed, root site):**
`https://www.adobe.com/?languageBanner=on&akamaiLocale=ph`, cookie `international=ph_fil`.

- GeoIP = `ph`. Cookie = `ph_fil` → this row's `Lang` = `fil`, `SupportedRegions` = `ph`.
- Filter the dataset for `Lang == "fil" AND SupportedRegions includes "ph"` → the `ph_fil` row itself
  satisfies both columns → it's the supported market for this GeoIP+cookie pair.
- Result: **Banner** — "Tingnan ang pahinang ito sa Filipino." / "Magpatuloy" — confirmed live.

**Worked example 3 (live-confirmed, same URL, bare-lang cookie) — this is a code-level correction, not
just a doc one:** same URL as example 2, but cookie `international=fil` (the bare `lang` value, not the
`ph_fil` prefix) → **identical result**, same Filipino banner.

This proves the cookie is not reliably the row's `prefix` — it can be the bare `lang` code instead. A
resolver that only does `getRowByPrefix(cookieValue)` (as `lingo.page.js` originally did) silently fails
on this case: there is no row whose `prefix === "fil"`, so the lookup returns nothing and PREF-LANG
wrongly falls back to English. Fixed in `LingoEnBannerPage.resolvePrefLang(prefLangCode,
supportedMarketsData)`: it now checks the cookie value against **both** the `prefix` column and the `lang`
column (falling back to `defaultMarket` last) before deciding PREF-LANG's language — never a single-column,
single-row lookup standing in for the whole check. `computeExpectedUi` calls this instead of resolving a
`cookieRow` by prefix directly.

**Worked trace** (confirmed live, `https://www.stage.adobe.com/?akamaiLocale=mx&languageBanner=on`, cookie
`international=es`):

1. **Is (Site + GeoIP) a supported combo?** Site = `/` (root/US, `lang: en`). GeoIP = `mx`. The root row's
   `supportedRegions` is a huge CSV that includes `mx` → **YES**, combo is supported.
2. **Is PREF-LANG's language == PAGE-LANG?** Cookie = `es` → language `es`. Page = `/` → language `en`.
   `es != en` → **NO**.
3. **Is (PREF-LANG's language + GeoIP) a supported combo?** Look for a row where `lang == "es"` AND
   `supportedRegions` includes `mx`. The `mx` row itself qualifies — it has `"lang": "es"` **and**
   `"supportedRegions": "mx"` (confirmed directly from the live JSON payload) → **YES**.
4. **Result**: Banner shows, using the **`mx` row's own copy** — `"Ver esta página en Español (México)."` —
   not the literal `es` (Spain) row's copy, even though the cookie value was literally `es`.

This is the general shape of every Scenario-2/4/5 recommendation: find the row matching PREF-LANG's
*language*, not the cookie's literal value, then use that row's own copy/target.

Two more data points that fit the same rule:
- `cookie=dk` (Danish) + `GeoIP=ca` (Canada) → **No Action** — no Danish-language row covers `ca`.
- `/uk` + `akamaiLocale=in` + no cookie (PREF-LANG defaults to `en`) → Modal recommends **India**
  specifically, not generic English/US — `in` is the most-specific English-language row covering `in`.

### 3.3 Tie-break when multiple same-language rows cover one GeoIP

Prefer the most specific (fewest `supportedRegions` entries) row, unless `regionPriorities` explicitly
ranks the candidates — priority wins over specificity when both exist (e.g. GeoIP `ch`: `de:1`/`ch_de`,
`fr:2`, `it:3`/`ch_it`).

### 3.4 Open ambiguity: `in` vs `in_hi`

Both rows share `defaultMarket: "in"`; nothing in the JSON distinguishes "prefers English India" from
"prefers Hindi India" from the cookie value alone. Resolved for the *read path* (cookie `in` is lang `en` →
No Action if page is English; cookie `in_hi` is lang `hi` → Banner/Modal recommends Hindi) but the
*region-picker write path* (what a user's UI click actually sets) is unverified.

### 3.5 No cookie == US/English default — but test BOTH explicitly, don't treat them as one case

If no `international` cookie is present, PREF-LANG is treated as English/US (`defaultMarket: "us"` on the
root row) for every check above. **Even though "no cookie" and "cookie explicitly set to `us`/`en`" resolve
to the same expected outcome, generate both as separate test rows, not one collapsed case** — they exercise
different code paths (default-fallback logic vs explicit-cookie-read logic) and either could regress
independently. See §6's matrix — the EN dimension always includes an explicit no-cookie row alongside the
five explicit EN-cookie rows.

### 3.6 EN-only combos structurally cannot produce a Banner

All 5 English-language rows (`''`/US, `uk`→`gb`, `au`→`au`, `in`→`in`, `ca`→`ca`) share `lang: "en"`. If
both page and cookie resolve to English, step 2 of the flowchart always short-circuits to No Action,
regardless of GeoIP. A Banner with an English cookie requires the **page itself** to be non-English.

### 3.7 `milolibs` deployment scope varies

Don't assume every `milolibs` branch is live on every path — confirm before asserting results (e.g.
`acom-c2lingo` was only confirmed live on `/uk/products/photoshop.html` mid-session, not universally).

---

## 4. Existing implementations to follow

| File | Role |
|---|---|
| `selectors/express/lingo.page.js` | POM: locators + `isSupportedCombo`, `isGeoIpSupported`, `computeExpectedUi`, `getBannerCopy`, `getModalCopy`, `parseUrlLocale`, `resolveGeoJsonUrls` — **this is the pattern to replicate**, generalizing only the pieces in §5 |
| `features/express/lingo.spec.js` | Test data: rows of `{ path, prefLangCookie, region, uiExpectation, tags }` |
| `tests/express/lingo.test.js` | Test runner: `runLingoGeoTest`, `resolveLingoGeoPath`, `test.describe` groups, **and the `Lingo-Geo \| JSON Snapshot` group from §2** |
| `features/cc/lingo.spec.js`, `tests/cc/lingo.test.js` | Same pattern already applied to a BACOM domain (`business.stage.adobe.com`) — despite the "cc" folder name |
| `configs/express-lingo.config.js` | Best existing `BASE_URL` parsing (detects AEM branch vs stage/prod, derives `ACOM_ORIGIN`/`BACOM_ORIGIN`) — reuse this pattern |
| `test-cases/us-path-all-geos-all-languages.csv` / `.html` | The generated ground-truth matrix this doc's §6 recipe produces — use as the reference output shape |

No shared base `Page` class exists in the repo; author the generalized POM net-new (§5.3), not via
subclassing.

---

## 5. Generalized architecture

### 5.1 URL builder — any ACOM/BACOM path, any environment, milolibs optional

```js
function buildTestUrl({ isBacom, path, env = 'stage', aemBranch, akamaiLocale, milolibs, extraParams = {} }) {
  let origin;
  if (aemBranch) {
    // e.g. aemBranch = 'main--milo--adobecom' -> https://main--milo--adobecom.aem.live
    origin = `https://${aemBranch}.aem.live`;
  } else if (isBacom) {
    origin = env === 'prod' ? 'https://business.adobe.com' : 'https://business.stage.adobe.com';
  } else {
    origin = env === 'prod' ? 'https://www.adobe.com' : 'https://www.stage.adobe.com';
  }
  const url = new URL(path, origin); // path can be '/', '/products/photoshop.html', '/acrobat.html',
                                      // '/creativecloud.html', a UPP pricing path, an /express/ path, etc.
  if (milolibs) url.searchParams.set('milolibs', milolibs);           // omit to test without it
  if (akamaiLocale) url.searchParams.set('akamaiLocale', akamaiLocale); // omit to test real client-IP GeoIP
  for (const [k, v] of Object.entries(extraParams)) url.searchParams.set(k, v);
  return url.toString();
}
```

This one function covers UPP, CC, DC, plain product pages, and Express — the only thing that changes
between them is the `path` and whether it falls under `/express/` (see §1.4 for the JSON-routing
consequence of that).

### 5.2 supported-markets.json resolver — routes by path, not by a hardcoded product list

```js
function resolveSupportedMarketsUrl(origin, path, isBacom) {
  if (isBacom) return `${origin}/assets/supported-markets/supported-markets-bacom.json`;
  if (path.startsWith('/express/')) return `${origin}/express/assets/supported-markets/supported-markets-express.json`;
  return `${origin}/federal/assets/supported-markets/supported-markets.json`; // UPP, CC, DC, plain pages, root
}
```

### 5.3 POM blueprint — port from `selectors/express/lingo.page.js`, generalizing only these two spots

- `parseUrlLocale(url)` — generalize the regex so it extracts `{ prefix, region }` from **any** ACOM path
  shape (`/fr/...`, `/products/photoshop.html`, a bare `/`, a UPP path, etc.), not just `/express/...`.
- `resolveGeoJsonUrls` — replace with §5.2's path-based resolver.
- Everything else (`isSupportedCombo`, `isGeoIpSupported`, `getBannerCopy`, `getModalCopy`,
  `getSupportedRegionsCsvFromRow`) is already pure JSON-field logic and needs no site-specific change.
- `computeExpectedUi` — make sure its PREF-LANG check matches §3.2's language-level rule (find any row
  sharing PREF-LANG's language that covers the GeoIP), not a narrower "cookie's own row only" check.

### 5.4 Cookie handling

```js
// Sets PREF-LANG directly via context — the standard way to drive the matrix below
await geo.setInternationalCookieValue(context, cookieRegionCode, pageUrl);
// Skipping this call entirely == "no cookie" == treated as US/English (§3.5) — generate this as its
// own explicit test row, not as an implicit stand-in for the cookie=us row.
```

---

## 6. Generation recipe: US site (`/`), all EN GeoIPs, every language as cookie — WITH and WITHOUT a cookie

This is the concrete matrix requested for the US root path — the same recipe generalizes to any other
site/path in §4–5's multi-URL model by swapping which row's `supportedRegions` you iterate and which
`path` you pass to `buildTestUrl`.

**Inputs:**
- Site: `/` (root/US row, `lang: "en"`)
- GeoIP (`akamaiLocale`) dimension: the 5 English-language-backed GeoIPs — `us`, `gb` (`/uk`), `au`, `ca`,
  `in` — i.e. every row where `lang === "en"`.
- Cookie dimension: **one representative row per distinct `lang` value** in the JSON (36 distinct
  languages as of this session), **plus explicitly both**:
  - **no cookie set at all** (§3.5 — treated as English/US default), and
  - **cookie explicitly set to `us`/`en`** (the root row's own value)
  as two separate rows, not one collapsed case, even though both currently resolve to the same expected
  outcome.

**Algorithm** (mirrors `test-cases/us-path-all-geos-all-languages.csv`'s generation script):

```js
const cookieDimension = [
  { noCookieSet: true },                    // explicit "no cookie" row — §3.5
  ...oneRowPerDistinctLanguage(json),       // includes the explicit en/us row too
];

for (const geoLang of ['us', 'gb', 'au', 'ca', 'in']) {          // akamaiLocale values
  for (const cookieCase of cookieDimension) {
    const pageLang = 'en';                                        // site is '/', always English
    const prefLang = cookieCase.noCookieSet ? 'en' : cookieCase.lang; // §3.5 fallback, made explicit

    if (prefLang === pageLang) {
      expected = 'No Action';                                     // step 2 of the flowchart
    } else {
      // step 3: does any row with lang === prefLang cover this GeoIP?
      const match = json.data.find(r => r.lang === prefLang
        && r.supportedRegions.split(',').map(s => s.trim()).includes(geoLang));
      expected = match ? { banner: match } : 'No Action';
    }
  }
}
```

**Confirmed results from running this recipe this session:**
- No cookie, and cookie explicitly `en`/`us` (or any of the other 4 EN rows) × any of the 5 EN GeoIPs →
  always **No Action** (§3.6 — same-language short-circuit; verified as two distinct rows, not merged).
- Non-English cookie × GeoIP `ca` → **Banner** only for cookie language `fr` (the `fr` row's
  `supportedRegions` includes `ca`) → recommends **Français**.
- Non-English cookie × GeoIP `in` → **Banner** only for cookie language `hi` (`in_hi` row) → recommends
  **हिंदी**.
- Non-English cookie × GeoIP `us`, `gb`, `au` → **No Action** for every non-English language tested — no
  other-language row covers these three GeoIPs at all.
- Full 84-GeoIP × 62-language cross (not just the 5 EN GeoIPs) → **205 of 5,208** combinations produce a
  Banner; the rest are No Action. See `test-cases/us-path-all-geos-all-languages.csv` for the full,
  generated (not hand-authored) matrix.

**Before trusting a generated matrix for a *new* site/path**, re-verify at least one non-obvious row live
(the `mx`+`es` and `dk`+`ca` cases in §3.2 are what caught the two earlier wrong versions of this rule) —
don't ship a large generated matrix off pure inference again.

---

## 7. Known gaps

1. **Region-picker write-path cookie value is unverified** (§3.4) — confirm what the UI actually writes to
   the cookie before trusting any write-path test case.
2. **`in` vs `in_hi`** disambiguation is unresolved for the write path.
3. **BACOM's Scenario-5 (multi-option) banner target** — which single option BACOM surfaces when multiple
   markets tie with no `regionPriorities` winner hasn't been live-verified; only ACOM's Modal case has.
4. **`milolibs` deployment scope** (§3.7) — a "No Action" result on a page where the branch isn't even live
   is a false negative, not a passing test; confirm deployment before trusting a result.
