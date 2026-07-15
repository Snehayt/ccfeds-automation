// Quick screenshot helper — visualises the header nav for spot-checking the scan.
// Run: node scripts/feds-lnav-screenshot.mjs

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL  = 'https://main--upp--adobecom.aem.live';
const TEST_PAGE = '/homepage/drafts/blaishram/redesign-demo-copy?fedsbranch=localnav-new&georouting=off&mep=off';

// Locales most likely to surface header overlap (long words / RTL / CJK).
const TARGETS = [
  { code: 'us',    prefix: '/'        },
  { code: 'de',    prefix: '/de/'     },
  { code: 'hu',    prefix: '/hu/'     },
  { code: 'fr',    prefix: '/fr/'     },
  { code: 'jp',    prefix: '/jp/'     },
  { code: 'sa_ar', prefix: '/sa_ar/'  },
  { code: 'il_he', prefix: '/il_he/'  },
];

const VIEWPORTS = [
  { name: 'desktop',        width: 1280, height: 800, isMobile: false },
  { name: 'desktop-narrow', width: 1100, height: 800, isMobile: false },
  { name: 'tablet-portrait', width: 1024, height: 1366, isMobile: true },
];

async function setConsentCookies(page, domain) {
  const consentValue = [
    'isGpcEnabled=0', 'datestamp=Mon+Jan+01+2024', 'version=202209.1.0',
    'isIABGlobal=false', 'hosts=', 'consentId=automation', 'interactionCount=2',
    'landingPath=NotLandingPage', 'groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1',
    'AwaitingReconsent=false',
  ].join('&');
  await page.context().addCookies([
    { name: 'OptanonConsent',        value: consentValue,             domain: `.${domain}`, path: '/', secure: true },
    { name: 'OptanonAlertBoxClosed', value: new Date().toISOString(), domain: `.${domain}`, path: '/', secure: true },
  ]);
}

const outDir = 'overlap-screenshots';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  for (const t of TARGETS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await ctx.newPage();
    try {
      const domain = new URL(BASE_URL).hostname.replace(/^www\./, '');
      await setConsentCookies(page, domain);
      const url = `${BASE_URL}${t.prefix.replace(/\/$/, '')}${TEST_PAGE}`;
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      if ((resp?.status() ?? 0) >= 400) {
        console.info(`[shot] ${t.code} @ ${vp.name} — HTTP ${resp.status()}, skip`);
        continue;
      }
      await page.waitForSelector('header.global-navigation', { timeout: 8000 });
      await page.waitForTimeout(800);
      const file = path.join(outDir, `${t.code}_${vp.name}.png`);
      await page.locator('header.global-navigation').screenshot({ path: file });
      console.info(`[shot] ${t.code} @ ${vp.name} → ${file}`);
    } catch (e) {
      console.info(`[shot] ${t.code} @ ${vp.name} — ERROR ${e.message.split('\n')[0]}`);
    } finally {
      await ctx.close();
    }
  }
}
await browser.close();
console.info(`\nScreenshots in ./${outDir}/`);
