/**
 * Diagnostic test — observe actual GNAV + Footer behaviour on mobile DE.
 * NO assertions — pure observation/logging + screenshots.
 * Run: npx playwright test tests/feds/debug-devices.test.js --config configs/feds.config.js --project feds-chrome --reporter=line
 */
import { test, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'debug-devices-output');
fs.mkdirSync(OUT, { recursive: true });

const shot  = (page, label) => page.screenshot({ path: path.join(OUT, `${label}.png`), fullPage: false });
const elLog = async (page, sel, label) => {
  const info = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return { found: false };
    const cs = window.getComputedStyle(el);
    const r  = el.getBoundingClientRect();
    return {
      found: true,
      display: cs.display, visibility: cs.visibility,
      offsetW: el.offsetWidth, offsetH: el.offsetHeight,
      top: Math.round(r.top), left: Math.round(r.left),
      text: (el.textContent || '').trim().slice(0, 60),
      href: el.getAttribute('href') || '',
    };
  }, sel);
  console.log(`  [${label}]`, JSON.stringify(info));
  return info;
};

test.describe('Device Diagnostics — DE GNAV + Footer', () => {
  // Run with: --project feds-iphone --project feds-iphone-landscape
  // The viewport label is derived from the active project viewport size.
  test('Observe GNAV + Footer', async ({ page, baseURL }) => {
      const vpSize = page.viewportSize() ?? { width: 0, height: 0 };
      const tag    = `${vpSize.width}x${vpSize.height}`;
      const url    = `${baseURL}/de/?georouting=off&mep=off`;

      console.log(`\n${'='.repeat(60)}\nVIEWPORT — ${tag}\n${'='.repeat(60)}`);

      // ── 1. Navigate ────────────────────────────────────────────────────────
      const t0 = Date.now();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      console.log(`  domcontentloaded: +${Date.now() - t0}ms`);
      await page.locator('header.global-navigation:not([aria-disabled])').waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
      console.log(`  GNAV ready: +${Date.now() - t0}ms`);
      await shot(page, `${tag}-01-loaded`);

      // ── 2. Hamburger — sample every 200ms for 3s ───────────────────────────
      console.log('\n[Hamburger timing]');
      for (let i = 0; i <= 15; i++) {
        if (i > 0) await page.waitForTimeout(200);
        const b = await page.evaluate(() => {
          const btn = document.querySelector('button.feds-nav-toggle');
          if (!btn) return { found: false };
          const s = window.getComputedStyle(btn);
          const r = btn.getBoundingClientRect();
          return { found: true, display: s.display, visibility: s.visibility, offsetW: btn.offsetWidth, top: Math.round(r.top) };
        });
        console.log(`  +${i * 200}ms:`, JSON.stringify(b));
        if (b.found && b.display !== 'none' && b.offsetW > 0) {
          console.log(`  >>> visible at +${i * 200}ms ✓`); break;
        }
        if (i === 15) console.log('  >>> NOT visible after 3000ms ✗');
      }

      // ── 3. Always-visible elements ─────────────────────────────────────────
      console.log('\n[Always-visible elements]');
      await elLog(page, 'header.global-navigation',                'Header');
      await elLog(page, 'button.feds-nav-toggle',                  'Hamburger');
      await elLog(page, '.feds-brand-container .feds-brand img',   'Logo img');
      await elLog(page, '#unav-app-switcher',                      'App switcher');
      await elLog(page, '[data-test-id="unav-profile--sign-in"]',  'Sign in');

      // ── 4. Open hamburger ──────────────────────────────────────────────────
      console.log('\n[Open hamburger]');
      await page.locator('button.feds-nav-toggle').waitFor({ state: 'visible', timeout: 5000 }).catch((e) => console.log('  FAIL wait visible:', e.message));

      // Capture full button state before click
      const beforeClick = await page.evaluate(() => {
        const btn = document.querySelector('button.feds-nav-toggle');
        if (!btn) return null;
        return { className: btn.className, attrs: Array.from(btn.attributes).map((a) => `${a.name}="${a.value}"`) };
      });
      console.log('  Before click:', JSON.stringify(beforeClick));

      // Retry tap up to 3 times — locator.tap() sends pointer+touch events which GNAV requires
      let opened = false;
      for (let attempt = 0; attempt < 3 && !opened; attempt++) {
        if (attempt > 0) await page.waitForTimeout(500);
        await page.locator('button.feds-nav-toggle').tap({ timeout: 5000 }).catch((e) => console.log(`  tap attempt ${attempt + 1} err:`, e.message));
        opened = await page.waitForFunction(
          () => document.querySelector('button.feds-nav-toggle')?.getAttribute('aria-expanded') === 'true',
          { timeout: 2000 }
        ).then(() => true).catch(() => false);
        console.log(`  tap attempt ${attempt + 1}: aria-expanded=true → ${opened}`);
      }
      await page.waitForTimeout(500);

      // Capture state 2s after click
      const afterClick = await page.evaluate(() => {
        const btn = document.querySelector('button.feds-nav-toggle');
        const nav = document.querySelector('nav[data-feds-nav]') || document.querySelector('.feds-navWrapper') || document.querySelector('.feds-nav');
        const firstBtn = document.querySelector('button.mega-menu.feds-link');
        return {
          btn: btn ? { class: btn.className, attrs: Array.from(btn.attributes).map((a) => `${a.name}="${a.value}"`) } : null,
          nav: nav ? { class: nav.className, vis: window.getComputedStyle(nav).visibility } : null,
          firstNavBtn: firstBtn ? { vis: window.getComputedStyle(firstBtn).visibility, op: window.getComputedStyle(firstBtn).opacity, display: window.getComputedStyle(firstBtn).display } : null,
        };
      });
      console.log('  After click (2s):', JSON.stringify(afterClick));

      await page.locator('button.mega-menu.feds-link').first().waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL wait nav items:', e.message));
      await shot(page, `${tag}-04-hamburger-open`);

      // ── 5. Nav overlay buttons ─────────────────────────────────────────────
      console.log('\n[Nav overlay buttons (aria-controls + placement)]');
      (await page.locator('button.mega-menu.feds-link').evaluateAll((els) =>
        els.map((el) => { const r = el.getBoundingClientRect(); return { text: (el.textContent||'').trim(), ac: el.getAttribute('aria-controls'), visible: r.width > 0, top: Math.round(r.top) }; })
      )).forEach((b, i) => console.log(`  btn[${i}]:`, JSON.stringify(b)));

      // ── 6. Products ────────────────────────────────────────────────────────
      console.log('\n[Products submenu]');
      const pBtn     = page.locator('button.mega-menu.feds-link').nth(0);
      const pPanelId = await pBtn.getAttribute('aria-controls') || 'products';
      const pPanel   = page.locator(`#${pPanelId}`).first();
      await pBtn.tap().catch((e) => console.log('  FAIL open:', e.message));
      await pPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL visible:', e.message));
      await shot(page, `${tag}-06-products`);

      const tabs = pPanel.locator('button.tab');
      console.log(`  Tabs: ${await tabs.count()}`);
      (await tabs.evaluateAll((els) => els.map((el) => { const r = el.getBoundingClientRect(); return { text: (el.textContent||'').trim(), top: Math.round(r.top), w: Math.round(r.width) }; })))
        .forEach((t, i) => console.log(`  tab[${i}]:`, JSON.stringify(t)));

      console.log('  — All a.feds-link in panel —');
      (await pPanel.locator('a.feds-link').evaluateAll((els) =>
        els.map((el) => ({ text: (el.textContent||'').trim(), href: el.getAttribute('href'), offsetW: el.offsetWidth }))
      )).forEach((l, i) => console.log(`  feds-link[${i}]:`, JSON.stringify(l)));
      console.log(`  a.feds-link[href*="catalog"] count: ${await pPanel.locator('a.feds-link[href*="catalog"]').count()}`);
      console.log(`  Visible a[href] cards: ${await pPanel.locator('a[href]').filter({ visible: true }).count()}`);

      // Find close/back button inside the panel
      const panelBtns = await pPanel.locator('button').evaluateAll((els) =>
        els.map((el) => ({ text: (el.textContent||'').trim(), class: el.className, ariaLabel: el.getAttribute('aria-label'), vis: window.getComputedStyle(el).visibility }))
      );
      console.log(`  Panel buttons (for close): ${JSON.stringify(panelBtns)}`);
      // Try closing via back button inside panel, then fall back to hamburger close
      const backBtn = pPanel.locator('button[class*="back"], button[aria-label*="back" i], button[aria-label*="zurück" i], .feds-popup-close').first();
      const hasBack = await backBtn.count() > 0;
      console.log(`  Has back/close btn: ${hasBack}`);
      if (hasBack) {
        await backBtn.tap({ timeout: 5000 }).catch((e) => console.log('  FAIL back:', e.message));
      } else {
        await pBtn.tap({ timeout: 5000 }).catch((e) => console.log('  FAIL close via pBtn:', e.message));
      }
      await pPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

      // ── 7. Use Cases ───────────────────────────────────────────────────────
      console.log('\n[Use Cases submenu]');
      const ucBtn     = page.locator('button.mega-menu.feds-link').nth(1);
      const ucPanelId = await ucBtn.getAttribute('aria-controls') || 'use-cases';
      const ucPanel   = page.locator(`#${ucPanelId}`).first();
      await ucBtn.tap({ timeout: 8000 }).catch((e) => console.log('  FAIL:', e.message));
      await ucPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL:', e.message));
      await shot(page, `${tag}-07-usecases`);
      (await ucPanel.locator('a').filter({ visible: true }).evaluateAll((els) =>
        els.map((el) => ({ text: (el.textContent||'').trim().slice(0, 40), href: el.getAttribute('href') }))
      )).forEach((l, i) => console.log(`  link[${i}]:`, JSON.stringify(l)));
      await ucPanel.locator('button.feds-popup-back-button').tap({ timeout: 5000 }).catch(() => {}); await ucPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

      // ── 8. Solutions ───────────────────────────────────────────────────────
      console.log('\n[Solutions submenu]');
      const solBtn    = page.locator('button.mega-menu.feds-link').nth(2);
      const solAcId   = await solBtn.getAttribute('aria-controls') || 'solutions';
      const solPanel  = page.locator(`#${solAcId}`).first();
      await solBtn.tap({ timeout: 8000 }).catch((e) => console.log('  FAIL:', e.message));
      await solPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL:', e.message));
      await shot(page, `${tag}-08-solutions`);
      (await solPanel.locator('a').filter({ visible: true }).evaluateAll((els) =>
        els.map((el) => ({ text: (el.textContent||'').trim().slice(0, 40), href: el.getAttribute('href') }))
      )).forEach((l, i) => console.log(`  link[${i}]:`, JSON.stringify(l)));
      await solPanel.locator('button.feds-popup-back-button').tap({ timeout: 5000 }).catch(() => {}); await solPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

      // ── 9. Learn & Support ─────────────────────────────────────────────────
      console.log('\n[Learn & Support submenu]');
      const lsBtn   = page.locator('button.mega-menu.feds-link').last();
      const lsAcId  = await lsBtn.getAttribute('aria-controls') || 'learn-support';
      const lsPanel = page.locator(`#${lsAcId}`).first();
      await lsBtn.tap({ timeout: 8000 }).catch((e) => console.log('  FAIL:', e.message));
      await lsPanel.waitFor({ state: 'visible', timeout: 10000 }).catch((e) => console.log('  FAIL:', e.message));
      await shot(page, `${tag}-09-learnsupport`);
      (await lsPanel.locator('a').filter({ visible: true }).evaluateAll((els) =>
        els.map((el) => ({ text: (el.textContent||'').trim().slice(0, 40), href: el.getAttribute('href') }))
      )).forEach((l, i) => console.log(`  link[${i}]:`, JSON.stringify(l)));
      await lsPanel.locator('button.feds-popup-back-button').tap({ timeout: 5000 }).catch(() => {}); await lsPanel.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});

      // ── 10. Close hamburger ────────────────────────────────────────────────
      await page.locator('button.feds-nav-toggle').tap({ timeout: 5000 }).catch(() => {});

      // ── 11. Footer ─────────────────────────────────────────────────────────
      console.log('\n[Footer]');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('.feds-menu-section a').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => {});
      await shot(page, `${tag}-11-footer`);

      console.log('  — Sections —');
      (await page.locator('.feds-menu-section').evaluateAll((els) =>
        els.map((sec) => {
          const h = sec.querySelector('[role="heading"]');
          const links = Array.from(sec.querySelectorAll('a'));
          return { heading: (h?.textContent||'').trim(), count: links.length, first: links[0] ? { text: (links[0].textContent||'').trim(), href: links[0].getAttribute('href') } : null };
        })
      )).forEach((s, i) => console.log(`  section[${i}] "${s.heading}" — ${s.count} links | first:`, JSON.stringify(s.first)));

      console.log('  — Footer bottom —');
      await elLog(page, '.feds-footer-logo',               'Footer logo');
      await elLog(page, 'a.feds-regionPicker',             'Region picker');
      await elLog(page, 'ul.feds-social a',                'Social first');
      await elLog(page, 'div.feds-footer-miscLinks-legal', 'C2 legal (miscLinks-legal)');
      await elLog(page, '.feds-footer-legalWrapper',       'C1 legal (legalWrapper)');
      console.log(`  C2 exists: ${await page.locator('div.feds-footer-miscLinks-legal').count() > 0} | C1 exists: ${await page.locator('.feds-footer-legalWrapper').count() > 0}`);

      console.log(`\n=== ${tag} DONE — screenshots: ${OUT} ===`);
  });
});
