// Single locale, full-page screenshot — sanity check for the overlap scan.
// Run: node scripts/feds-lnav-shot-one.mjs [locale=de] [viewport=desktop-narrow]
import { chromium } from '@playwright/test';

const BASE_URL  = 'https://main--upp--adobecom.aem.live';
const TEST_PAGE = '/homepage/drafts/blaishram/redesign-demo-copy?fedsbranch=localnav-new&georouting=off&mep=off';

const LOCALES = {
  us: '/', de: '/de/', hu: '/hu/', fr: '/fr/', jp: '/jp/', sa_ar: '/sa_ar/', il_he: '/il_he/',
};
const VPS = {
  desktop:        { width: 1280, height:  900 },
  'desktop-narrow':{ width: 1100, height:  900 },
  'tablet-portrait':{ width: 1024, height: 1366 },
  'mobile-portrait':{ width: 393, height: 852 },
};

const localeCode = process.argv[2] || 'de';
const vpName     = process.argv[3] || 'desktop-narrow';
const prefix     = LOCALES[localeCode];
const vp         = VPS[vpName];

const url = `${BASE_URL}${prefix.replace(/\/$/, '')}${TEST_PAGE}`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp });
const page = await ctx.newPage();

const domain = new URL(BASE_URL).hostname.replace(/^www\./, '');
const consent = 'isGpcEnabled=0&datestamp=Mon+Jan+01+2024&version=202209.1.0&isIABGlobal=false&hosts=&consentId=automation&interactionCount=2&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&AwaitingReconsent=false';
await ctx.addCookies([
  { name: 'OptanonConsent', value: consent, domain: `.${domain}`, path: '/', secure: true },
  { name: 'OptanonAlertBoxClosed', value: new Date().toISOString(), domain: `.${domain}`, path: '/', secure: true },
]);

console.info(`Loading ${url}`);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('header.global-navigation', { timeout: 10000 });
await page.waitForTimeout(2000);

const file = `overlap-screenshots/${localeCode}_${vpName}_full.png`;
await page.screenshot({ path: file, clip: { x: 0, y: 0, width: vp.width, height: 220 } });
console.info(`→ ${file}`);

// Also dump nav metrics so we can debug
const metrics = await page.evaluate(() => {
  const nav = document.querySelector('header.global-navigation');
  if (!nav) return { error: 'no nav' };
  const r = nav.getBoundingClientRect();
  const items = Array.from(nav.querySelectorAll('ul.feds-gnav-items > li')).map((li) => ({
    text: li.textContent.replace(/\s+/g, ' ').trim().slice(0, 40),
    rect: li.getBoundingClientRect().toJSON(),
  }));
  return {
    header: { w: r.width, h: r.height, top: r.top, left: r.left, right: r.right },
    itemCount: items.length,
    items,
  };
});
console.info(JSON.stringify(metrics, null, 2));

await browser.close();
