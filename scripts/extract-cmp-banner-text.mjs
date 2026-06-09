/**
 * Extracts CMP banner text for all locales and writes data/feds-cmp-locales.js.
 * Run: node scripts/extract-cmp-banner-text.mjs
 *
 * Uses the first reachable banner URL per locale. Skips locales where the
 * banner does not appear within 15s.
 */

import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Locales to extract — all 26 from the spec
const languages = [
  { key: 'de_de', locale: 'de-DE', header: 'de-DE,de;q=0.9', location: 'de' },
  { key: 'fr_fr', locale: 'fr-FR', header: 'fr-FR,fr;q=0.9', location: 'fr' },
  { key: 'ro_ro', locale: 'ro-RO', header: 'ro-RO,ro;q=0.9', location: 'ro' },
  { key: 'pt_pt', locale: 'pt-PT', header: 'pt-PT,pt;q=0.9', location: 'pt' },
  { key: 'bg_bg', locale: 'bg-BG', header: 'bg-BG,bg;q=0.9', location: 'bg' },
  { key: 'zh_cn', locale: 'zh-CN', header: 'zh-CN,zh;q=0.9', location: 'cn' },
  { key: 'zh_tw', locale: 'zh-TW', header: 'zh-TW,zh;q=0.9', location: 'tw' },
  { key: 'cs_cz', locale: 'cs-CZ', header: 'cs-CZ,cs;q=0.9', location: 'cz' },
  { key: 'da_dk', locale: 'da-DK', header: 'da-DK,da;q=0.9', location: 'dk' },
  { key: 'nl_nl', locale: 'nl-NL', header: 'nl-NL,nl;q=0.9', location: 'nl' },
  { key: 'et_ee', locale: 'et-EE', header: 'et-EE,et;q=0.9', location: 'ee' },
  { key: 'fi_fi', locale: 'fi-FI', header: 'fi-FI,fi;q=0.9', location: 'fi' },
  { key: 'he_il', locale: 'he-IL', header: 'he-IL,he;q=0.9', location: 'il' },
  { key: 'hu_hu', locale: 'hu-HU', header: 'hu-HU,hu;q=0.9', location: 'hu' },
  { key: 'ko_kr', locale: 'ko-KR', header: 'ko-KR,ko;q=0.9', location: 'kr' },
  { key: 'it_it', locale: 'it-IT', header: 'it-IT,it;q=0.9', location: 'it' },
  { key: 'nb_no', locale: 'nb-NO', header: 'nb-NO,nb;q=0.9', location: 'no' },
  { key: 'pl_pl', locale: 'pl-PL', header: 'pl-PL,pl;q=0.9', location: 'pl' },
  { key: 'ru_ru', locale: 'ru-RU', header: 'ru-RU,ru;q=0.9', location: 'ru' },
  { key: 'sk_sk', locale: 'sk-SK', header: 'sk-SK,sk;q=0.9', location: 'sk' },
  { key: 'sl_si', locale: 'sl-SI', header: 'sl-SI,sl;q=0.9', location: 'si' },
  { key: 'es_es', locale: 'es-ES', header: 'es-ES,es;q=0.9', location: 'es' },
  { key: 'sv_se', locale: 'sv-SE', header: 'sv-SE,sv;q=0.9', location: 'se' },
  { key: 'tr_tr', locale: 'tr-TR', header: 'tr-TR,tr;q=0.9', location: 'tr' },
  { key: 'uk_ua', locale: 'uk-UA', header: 'uk-UA,uk;q=0.9', location: 'ua' },
  { key: 'ja_jp', locale: 'ja-JP', header: 'ja-JP,ja;q=0.9', location: 'jp' },
];

// URLs to try in order — first reachable one wins for each locale
const extractionUrls = [
  'https://stage.photoshop.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
  'https://net.s2stagehance.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700-test&customPrivacyLocation=',
  'https://stage.projectx.corp.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
  'https://express-stage.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
  'https://stage.acrobat.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
];

async function extractLocale(page, baseUrl, language) {
  const fullUrl = `${baseUrl}${language.location}`;
  try {
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.locator('#onetrust-banner-sdk').first().waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    return null;
  }

  const getText = async (selector) => {
    try {
      return (await page.locator(selector).first().textContent())?.trim() || '';
    } catch {
      return '';
    }
  };

  return {
    bannerTitle: await getText('#onetrust-policy-title'),
    bannerDescription: await getText('.mau-content'),
    modalTitle: await getText('#pc-title'),
    generalInfo: await getText('.ot-general h3'),
    buttons: {
      cookieSettingCTA: await getText('#onetrust-pc-btn-handler'),
      dontEnableCTA: await getText('#onetrust-reject-all-handler'),
      enableAllCTA: await getText('#onetrust-accept-btn-handler'),
    },
  };
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const extracted = {};
  const skipped = [];

  for (const language of languages) {
    console.log(`\nExtracting: ${language.key} (${language.locale})`);
    let result = null;

    for (const baseUrl of extractionUrls) {
      const context = await browser.newContext({
        locale: language.locale,
        extraHTTPHeaders: { 'Accept-Language': language.header },
      });
      const page = await context.newPage();
      result = await extractLocale(page, baseUrl, language);
      await context.close();

      if (result && result.bannerTitle) {
        console.log(`  ✓ Got text from ${baseUrl}`);
        console.log(`    Title: ${result.bannerTitle}`);
        break;
      }
      console.log(`  ✗ No banner at ${baseUrl}`);
    }

    if (result && result.bannerTitle) {
      extracted[language.key] = result;
    } else {
      console.log(`  SKIP: no banner found for ${language.key}`);
      skipped.push(language.key);
    }
  }

  await browser.close();

  // Build JS file content
  const entries = Object.entries(extracted).map(([key, data]) => {
    return `  ${key}: {
    bannerTitle: ${JSON.stringify(data.bannerTitle)},
    bannerDescription: ${JSON.stringify(data.bannerDescription)},
    modalTitle: ${JSON.stringify(data.modalTitle)},
    generalInfo: ${JSON.stringify(data.generalInfo)},
    buttons: {
      cookieSettingCTA: ${JSON.stringify(data.buttons.cookieSettingCTA)},
      dontEnableCTA: ${JSON.stringify(data.buttons.dontEnableCTA)},
      enableAllCTA: ${JSON.stringify(data.buttons.enableAllCTA)},
    },
  }`;
  }).join(',\n');

  const output = `export const fedsCmpLocales = {\n${entries},\n};\n`;

  const outPath = resolve(__dirname, '../data/feds-cmp-locales.js');
  writeFileSync(outPath, output, 'utf-8');

  console.log(`\n✓ Written to ${outPath}`);
  if (skipped.length) {
    console.log(`  Skipped (no banner): ${skipped.join(', ')}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
