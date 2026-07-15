/**
 * Diagnostic script — records GNAV + Footer behaviour on mobile viewports (portrait + landscape)
 * Checks element placement, timing, reactivity, and link hrefs.
 * Run: node --experimental-vm-modules debug-devices.js
 */
import { chromium, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const URL = 'https://www.adobe.com/de/?georouting=off&mep=off';
const OUT = './debug-devices-output';

const VIEWPORTS = [
  { name: 'iphone-portrait',  viewport: { width: 375, height: 667 }, userAgent: devices['iPhone SE'].userAgent, deviceScaleFactor: 2 },
  { name: 'iphone-landscape', viewport: { width: 667, height: 375 }, userAgent: devices['iPhone SE'].userAgent, deviceScaleFactor: 2 },
];

fs.mkdirSync(OUT, { recursive: true });

const shot = (page, label, vp) =>
  page.screenshot({ path: path.join(OUT, `${vp}-${label}.png`), fullPage: false });

const elInfo = (page, sel, label) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { found: false };
    const cs = window.getComputedStyle(el);
    const r  = el.getBoundingClientRect();
    return {
      found: true, display: cs.display, visibility: cs.visibility,
      offsetW: el.offsetWidth, offsetH: el.offsetHeight,
      top: Math.round(r.top), left: Math.round(r.left),
      w: Math.round(r.width), h: Math.round(r.height),
      text: (el.textContent || '').trim().slice(0, 60),
      href: el.getAttribute('href') || '',
    };
  }, sel).then((i) => { console.log(`  [${label}]`, JSON.stringify(i)); return i; });

async function run(vp) {
  console.log(`\n${'='.repeat(60)}\nVIEWPORT: ${vp.name} — ${vp.viewport.width}x${vp.viewport.height}\n${'='.repeat(60)}`);

  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext(vp);
  const page    = await ctx.newPage();

  // ── 1. Navigation timing ────────────────────────────────────────────────
  console.log('\n[1] Navigation timing');
  const t0 = Date.now();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  console.log(`  domcontentloaded: +${Date.now() - t0}ms`);
  await page.locator('header.global-navigation:not([aria-disabled])').waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
  console.log(`  GNAV ready (no aria-disabled): +${Date.now() - t0}ms`);
  await shot(page, '01-loaded', vp.name);

  // ── 2. Hamburger detection — sampled every 200ms ─────────────────────
  console.log('\n[2] Hamburger button state (every 200ms)');
  for (let i = 0; i <= 15; i++) {
    if (i > 0) await page.waitForTimeout(200);
    const info = await page.evaluate(() => {
      const btn = document.querySelector('button.feds-nav-toggle');
      if (!btn) return { found: false };
      const s = window.getComputedStyle(btn);
      const r = btn.getBoundingClientRect();
      return { found: true, display: s.display, visibility: s.visibility, offsetW: btn.offsetWidth, top: Math.round(r.top), left: Math.round(r.left) };
    });
    console.log(`  +${i * 200}ms:`, JSON.stringify(info));
    if (info.found && info.display !== 'none' && info.offsetW > 0) {
      console.log(`  >>> Hamburger VISIBLE at +${i * 200}ms ✓`);
      break;
    }
    if (i === 15) console.log('  >>> Hamburger NOT visible after 3000ms');
  }

  // ── 3. Always-visible elements ──────────────────────────────────────────
  console.log('\n[3] Always-visible elements');
  await elInfo(page, 'header.global-navigation',                 'Header');
  await elInfo(page, '.feds-brand-container .feds-brand',        'Logo container');
  await elInfo(page, '.feds-brand-container .feds-brand img',    'Logo img');
  await elInfo(page, '#unav-app-switcher',                       'App switcher');
  await elInfo(page, '[data-test-id="unav-profile--sign-in"]',   'Sign in btn');
  await elInfo(page, 'button.feds-nav-toggle',                   'Hamburger');

  // ── 4. Open hamburger ──────────────────────────────────────────────────
  console.log('\n[4] Open hamburger');
  await page.locator('button.feds-nav-toggle').click({ timeout: 8000 }).catch((e) => console.log('  FAIL click:', e.message));
  await page.locator('button.mega-menu.feds-link').first().waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL wait nav items:', e.message));
  await shot(page, '04-hamburger-open', vp.name);

  // ── 5. Nav overlay items ────────────────────────────────────────────────
  console.log('\n[5] Nav overlay buttons (aria-controls + placement)');
  const navBtns = await page.locator('button.mega-menu.feds-link').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { text: (el.textContent || '').trim(), ariaControls: el.getAttribute('aria-controls'), visible: r.width > 0 && r.height > 0, top: Math.round(r.top) };
    })
  );
  navBtns.forEach((b, i) => console.log(`  btn[${i}]:`, JSON.stringify(b)));

  // ── 6. Products submenu ────────────────────────────────────────────────
  console.log('\n[6] Products submenu');
  const productsBtn = page.locator('button.mega-menu.feds-link').nth(0);
  const panelId     = await productsBtn.getAttribute('aria-controls') || 'products';
  const prodPanel   = page.locator(`#${panelId}`).first();
  await productsBtn.click().catch((e) => console.log('  FAIL open products:', e.message));
  await prodPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL panel visible:', e.message));
  await shot(page, '06-products', vp.name);

  const tabs = prodPanel.locator('button.tab');
  console.log(`  Tab count: ${await tabs.count()}`);
  const tabData = await tabs.evaluateAll((els) =>
    els.map((el) => { const r = el.getBoundingClientRect(); return { text: (el.textContent||'').trim(), top: Math.round(r.top), w: Math.round(r.width) }; })
  );
  tabData.forEach((t, i) => console.log(`  tab[${i}]:`, JSON.stringify(t)));

  // All Products link — check both selectors
  const apByHref = await prodPanel.locator('a.feds-link[href*="catalog"]').count();
  const apByFirst = await prodPanel.locator('a.feds-link').filter({ visible: true }).count();
  console.log(`  a.feds-link[href*="catalog"]: ${apByHref} found`);
  console.log(`  a.feds-link (visible): ${apByFirst} found`);
  const allFedsLinks = await prodPanel.locator('a.feds-link').evaluateAll((els) =>
    els.map((el) => ({ text: (el.textContent||'').trim(), href: el.getAttribute('href'), visible: el.offsetWidth > 0 }))
  );
  allFedsLinks.forEach((l, i) => console.log(`  feds-link[${i}]:`, JSON.stringify(l)));

  const cardCount = await prodPanel.locator('a[href]').filter({ visible: true }).count();
  console.log(`  Visible cards (a[href]): ${cardCount}`);

  await productsBtn.click().catch(() => {});
  await prodPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

  // ── 7. Use Cases submenu ───────────────────────────────────────────────
  console.log('\n[7] Use Cases submenu');
  const ucBtn     = page.locator('button.mega-menu.feds-link').nth(1);
  const ucPanelId = await ucBtn.getAttribute('aria-controls') || 'use-cases';
  const ucPanel   = page.locator(`#${ucPanelId}`).first();
  await ucBtn.click().catch((e) => console.log('  FAIL open UC:', e.message));
  await ucPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL UC visible:', e.message));
  await shot(page, '07-usecases', vp.name);

  const ucLinks = await ucPanel.locator('a').filter({ visible: true }).evaluateAll((els) =>
    els.map((el) => ({ text: (el.textContent||'').trim().slice(0, 40), href: el.getAttribute('href') }))
  );
  console.log(`  Links: ${ucLinks.length}`);
  ucLinks.forEach((l, i) => console.log(`  link[${i}]:`, JSON.stringify(l)));
  await ucBtn.click().catch(() => {});
  await ucPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

  // ── 8. Solutions submenu ────────────────────────────────────────────────
  console.log('\n[8] Solutions submenu');
  const solBtn   = page.locator('button.mega-menu.feds-link[aria-controls="solutions"]');
  const solPanel = page.locator('#solutions').first();
  await solBtn.click().catch((e) => console.log('  FAIL open Solutions:', e.message));
  await solPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL Solutions visible:', e.message));
  await shot(page, '08-solutions', vp.name);
  const solLinks = await solPanel.locator('a').filter({ visible: true }).evaluateAll((els) =>
    els.map((el) => ({ text: (el.textContent||'').trim().slice(0, 40), href: el.getAttribute('href') }))
  );
  console.log(`  Links: ${solLinks.length}`);
  solLinks.forEach((l, i) => console.log(`  link[${i}]:`, JSON.stringify(l)));
  await solBtn.click().catch(() => {});
  await solPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

  // ── 9. Learn & Support submenu ─────────────────────────────────────────
  console.log('\n[9] Learn & Support submenu');
  const lsBtn   = page.locator('button.mega-menu.feds-link[aria-controls="learn-support"]');
  const lsPanel = page.locator('#learn-support').first();
  await lsBtn.click().catch((e) => console.log('  FAIL open L&S:', e.message));
  await lsPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL L&S visible:', e.message));
  await shot(page, '09-learnsupport', vp.name);
  const lsLinks = await lsPanel.locator('a').filter({ visible: true }).evaluateAll((els) =>
    els.map((el) => ({ text: (el.textContent||'').trim().slice(0, 40), href: el.getAttribute('href') }))
  );
  console.log(`  Links: ${lsLinks.length}`);
  lsLinks.forEach((l, i) => console.log(`  link[${i}]:`, JSON.stringify(l)));
  await lsBtn.click().catch(() => {});
  await lsPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

  // ── 10. Close hamburger ────────────────────────────────────────────────
  await page.locator('button.feds-nav-toggle').click().catch(() => {});

  // ── 11. Footer ─────────────────────────────────────────────────────────
  console.log('\n[11] Footer');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('.feds-menu-section a').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => {});
  await shot(page, '11-footer', vp.name);

  // Footer structure
  const sections = await page.locator('.feds-menu-section').evaluateAll((els) =>
    els.map((sec) => {
      const heading = sec.querySelector('[role="heading"]');
      const links   = Array.from(sec.querySelectorAll('a'));
      return {
        heading:   (heading?.textContent || '').trim(),
        linkCount: links.length,
        links:     links.map((a) => ({ text: (a.textContent||'').trim().slice(0, 40), href: a.getAttribute('href') })),
      };
    })
  );
  console.log(`  Sections: ${sections.length}`);
  sections.forEach((s, i) => console.log(`  section[${i}] "${s.heading}" — ${s.linkCount} links | first: ${JSON.stringify(s.links[0] || {})}`));

  // Footer bottom elements
  console.log('\n[11b] Footer bottom elements');
  await elInfo(page, '.feds-footer-logo',               'Footer logo');
  await elInfo(page, 'a.feds-regionPicker',             'Region picker');
  await elInfo(page, 'ul.feds-social a',                'Social (first)');
  await elInfo(page, 'div.feds-footer-miscLinks-legal', 'Legal (C2)');
  await elInfo(page, '.feds-footer-legalWrapper',       'Legal wrapper (C1)');

  const miscLegalCount  = await page.locator('div.feds-footer-miscLinks-legal').count();
  const legalWrapCount  = await page.locator('.feds-footer-legalWrapper').count();
  console.log(`  C2 miscLinks-legal exists: ${miscLegalCount > 0} | C1 legalWrapper exists: ${legalWrapCount > 0}`);

  await browser.close();
  console.log(`\n✓ ${vp.name} done — screenshots in ${OUT}/`);
}

for (const vp of VIEWPORTS) {
  await run(vp);
}
