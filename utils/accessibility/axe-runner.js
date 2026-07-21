// Reusable axe-core accessibility scanner.
// Used by any test suite - not just feds-lnav.
// axe-core (@axe-core/playwright) is already in package.json.

import AxeBuilder from '@axe-core/playwright';

// Runs a WCAG 2.1 AA scan on the full page or a specific CSS selector.
// Returns the axe results object - violations, passes, incomplete.
export async function runAxeScan(page, { selector = null, wcag = ['wcag21aa'] } = {}) {
  // Legacy mode skips axe's partial-scan/finishRun flow, which opens an extra blank
  // page via context.newPage() to merge cross-origin-iframe results. That extra page
  // creation hangs under heavy parallelism (many locales x many workers), timing out
  // the whole test. Safe here since iframes are already disabled and scans are
  // scoped to a single same-origin element.
  let builder = new AxeBuilder({ page }).withTags(wcag).options({ iframes: false }).setLegacyMode(true);
  if (selector) builder = builder.include(selector);
  return builder.analyze();
}

// Returns a short summary of violations for logging / Allure annotations.
export function getViolationSummary(results) {
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    affectedNodes: v.nodes.length,
    helpUrl: v.helpUrl,
  }));
}
