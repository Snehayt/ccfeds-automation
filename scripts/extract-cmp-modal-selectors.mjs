/**
 * Extracts the actual DOM structure of the OneTrust cookie settings modal.
 * Run: node scripts/extract-cmp-modal-selectors.mjs
 *
 * Opens Photoshop stage in headed mode, clicks "Cookie Settings",
 * then dumps every selector we care about so the POM can be updated.
 */

import { chromium } from 'playwright';

const TEST_URL = 'https://stage.photoshop.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=de';

async function probe(page, selector, label) {
  const els = await page.locator(selector).all();
  if (els.length === 0) {
    console.log(`  ✗ ${label.padEnd(40)} [${selector}]  → NOT FOUND`);
    return;
  }
  for (let i = 0; i < els.length; i++) {
    const text = (await els[i].textContent())?.trim().substring(0, 60) || '';
    const hidden = await els[i].evaluate((el) => {
      const s = window.getComputedStyle(el);
      return s.display === 'none' || s.visibility === 'hidden' || el.getAttribute('aria-hidden') === 'true';
    });
    console.log(`  ${hidden ? '○' : '●'} ${(label + ` [${i}]`).padEnd(40)} [${selector}]  → "${text}"${hidden ? '  (hidden)' : ''}`);
  }
}

async function dumpHTML(page, selector, label) {
  const el = page.locator(selector).first();
  try {
    const html = await el.evaluate((node) => node.outerHTML.substring(0, 300));
    console.log(`\n  HTML of ${label}:\n  ${html}\n`);
  } catch {
    console.log(`  HTML of ${label}: NOT FOUND`);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({
    locale: 'de-DE',
    extraHTTPHeaders: { 'Accept-Language': 'de-DE,de;q=0.9' },
  });
  const page = await context.newPage();

  console.log('Navigating to:', TEST_URL);
  await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });

  console.log('\n=== BANNER ===');
  await page.locator('#onetrust-banner-sdk').first().waitFor({ state: 'visible', timeout: 15000 });
  await probe(page, '#onetrust-policy-title', 'bannerTitle');
  await probe(page, '.mau-content', 'bannerDescription');
  await probe(page, '#onetrust-pc-btn-handler', 'cookieSettingCTA');
  await probe(page, '#onetrust-reject-all-handler', 'dontEnableCTA');
  await probe(page, '#onetrust-accept-btn-handler', 'enableAllCTA');

  console.log('\nOpening cookie settings modal...');
  await page.locator('#onetrust-pc-btn-handler').first().click();
  await page.waitForTimeout(2000);

  console.log('\n=== MODAL — top-level ===');
  await probe(page, '#pc-title', 'modalTitle');
  await probe(page, '.save-preference-btn-handler', 'modalSaveBtn (alt)');
  await probe(page, '.ot-pc-refuse-all-handler', 'modalDontEnable (alt1)');
  await probe(page, '.disable-all-btn', 'modalDontEnable (disable-all)');
  await probe(page, '.ot-btn-container button', 'all modal buttons');
  await probe(page, '.enable-all-btn', 'modalEnableAll');
  await probe(page, '.ot-pc-close-icon', 'modalClose (alt1)');
  await probe(page, '#close-pc-btn-handler', 'modalClose (alt2)');
  await probe(page, '.main pc-close-button ot-close-icon', 'modalClose (original)');

  console.log('\n=== MODAL — general info section ===');
  await probe(page, '.ot-general h3', 'generalInfo h3');
  await probe(page, '#ot-pc-desc', 'generalInfo desc');
  await probe(page, '.ot-pc-scrollbar h3', 'all h3 in modal');

  console.log('\n=== MODAL — category headers ===');
  await probe(page, '.category-header', 'category-header (ALL)');
  await probe(page, '.ot-cat-header', 'ot-cat-header (ALL)');
  await probe(page, '[class*="category"] h4', 'category h4');

  console.log('\n=== MODAL — dropdowns / accordion ===');
  // Dump first accordion item HTML to understand structure
  await dumpHTML(page, '.ot-accordion-layout', 'first accordion item');
  await probe(page, '[aria-expanded]', 'elements with aria-expanded');
  await probe(page, '.ot-acc-hdr', 'accordion headers');
  await probe(page, '.ot-tgl-cntr', 'toggle containers');
  await probe(page, '.ot-vlst-cntr', 'vendor list containers');
  await probe(page, '#ot-content-1', '#ot-content-1');
  await probe(page, '#ot-content-2', '#ot-content-2');
  await probe(page, '#ot-content-3', '#ot-content-3');
  await probe(page, '#ot-content-1-list', '#ot-content-1-list (ALL)');

  console.log('\n=== MODAL — always active / checkboxes ===');
  await probe(page, '[class*="always-active"]', 'always-active (any class)');
  await probe(page, '.ot-status-id-C0001', '.ot-status-id-C0001 (old)');
  await probe(page, '.ot-always-active', '.ot-always-active');
  await probe(page, '.ot-switch input[type="checkbox"]', 'checkboxes');
  await probe(page, '.ot-tgl', 'toggles');

  console.log('\n=== MODAL — descriptions ===');
  await probe(page, '.ot-cookie-description', 'ot-cookie-description (ALL)');
  await probe(page, '.ot-cat-item p', 'category description p');

  console.log('\n=== MODAL — vendor links ===');
  await probe(page, '.ot-link-btn.category-host-list-btn', 'vendor list links (ALL)');
  await probe(page, '[class*="host-list"]', 'host-list elements');

  console.log('\n=== FULL MODAL BUTTON HTML ===');
  const buttons = await page.locator('#onetrust-pc-sdk button').all();
  console.log(`  Total buttons in modal: ${buttons.length}`);
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const id = await buttons[i].getAttribute('id') || '';
    const cls = await buttons[i].getAttribute('class') || '';
    const txt = (await buttons[i].textContent())?.trim().substring(0, 40) || '';
    console.log(`    [${i}] id="${id}" class="${cls.substring(0, 60)}" text="${txt}"`);
  }

  console.log('\n\nBrowser staying open for 30s — inspect the modal manually if needed.');
  await page.waitForTimeout(30000);
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
