# Automation Summary — Express Lingo Geo, Site Redesign & LNav

**Express Lingo Geo**
- Language banner, geo-routing popup, and currency validated using live JSON captured from network calls
- ACOM and BACOM flowchart differences captured — geo mismatch triggers a modal on ACOM and a banner on BACOM
- Selector contents, cookie/URL param priority chain, sub-region redirects, and snapshot drift check covered

**Site Redesign**
- Global nav validated across 25+ locales (US, EMEA, APAC, LATAM) for correct render per locale

**LNav (Desktop & Devices)**
- Nav links, dropdowns, CTAs, hamburger, sub-panels, and app switcher verified across desktop and devices
- Keyboard accessibility and WCAG 2.1 AA scan covered; analytics tracking matched against collect call payloads

**How AI Helped (Claude & Cursor)**
- Robust POMs designed with clean selector, helper, and assertion layers; device POM extends desktop overriding only mobile-specific methods
- Geo flowchart engine and priority chain logic encoded directly in the test layer with Claude
- Analytics interceptor, axe-core wrapper, and snapshot diff utility built as reusable helpers
- Cursor used to scaffold spec arrays, fill locale/tag patterns, and refactor selectors across files
