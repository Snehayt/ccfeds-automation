import { fedsCmpLocales } from '../../../data/feds-cmp-locales.js';

// ── CMP Banner URLs ────────────────────────────────────────────────────────
// Set BASE_URL env var to override any individual URL at test time.
// Each URL includes customOtDomainId + customPrivacyLocation params for CMP.
export const cmpBannerUrls = [
  {
    tcid: '0',
    name: '@NetS2StagehanceBannerCheck',
    url: 'https://net.s2stagehance.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700-test&customPrivacyLocation=',
    tags: '@banner @net-s2stagehance',
  },
  {
    tcid: '1',
    name: '@ProjectXBannerCheck',
    url: 'https://stage.projectx.corp.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @projectx',
  },
  {
    tcid: '2',
    name: '@FireflyStageBannerCheck',
    url: 'https://firefly-stage.corp.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @firefly-stage',
  },
  {
    tcid: '3',
    name: '@AdoberlStageBannerCheck',
    url: 'https://stage.adoberl.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700-test&customPrivacyLocation=',
    tags: '@banner @adoberl-stage',
  },
  {
    tcid: '4',
    name: '@PhotoshopStageBannerCheck',
    url: 'https://stage.photoshop.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @photoshop-stage',
  },
  {
    tcid: '5',
    name: '@FontsRelstageBannerCheck',
    url: 'https://fonts-relstage.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @fonts-relstage',
  },
  {
    tcid: '6',
    name: '@IllustratorStageBannerCheck',
    url: 'https://stage.illustrator.adobe.com/home/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @illustrator-stage',
  },
  {
    tcid: '7',
    name: '@PodcastStageBannerCheck',
    url: 'https://podcast.stage.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @podcast-stage',
  },
  {
    tcid: '8',
    name: '@PortfolioBannerCheck',
    url: 'https://portfolio.ccpsx.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700-test&customPrivacyLocation=',
    tags: '@banner @portfolio',
  },
  {
    tcid: '9',
    name: '@StockStageBannerCheck',
    url: 'https://primary.stock.stage.adobe.com/3d-assets#f_1678130149?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @stock-stage',
  },
  {
    tcid: '10',
    name: '@ExpressStageBannerCheck',
    url: 'https://express-stage.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner-de @express-stage',
  },
  {
    tcid: '11',
    name: '@LightroomFostageBannerCheck',
    url: 'https://fostage.lightroom.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @lightroom-fostage',
  },
  {
    tcid: '12',
    name: '@AcrobatStageBannerCheck',
    url: 'https://stage.acrobat.adobe.com/?customOtDomainId=b02782c1-a5e1-4d3b-99bb-537f2bf36700&customPrivacyLocation=',
    tags: '@banner @acrobat-stage',
  },
];

// ── CMP Languages ─────────────────────────────────────────────────────────
// isEU: true → EU/EEA GDPR country — Reject All button is shown, runs Reject All test
export const cmpLanguages = [
  { key: 'de_de', locale: 'de-DE', header: 'de-DE,de;q=0.9', location: 'de', country: 'Germany',        isEU: true  },
  { key: 'fr_fr', locale: 'fr-FR', header: 'fr-FR,fr;q=0.9', location: 'fr', country: 'France',         isEU: true  },
  { key: 'ro_ro', locale: 'ro-RO', header: 'ro-RO,ro;q=0.9', location: 'ro', country: 'Romania',        isEU: true  },
  { key: 'pt_pt', locale: 'pt-PT', header: 'pt-PT,pt;q=0.9', location: 'pt', country: 'Portugal',       isEU: true  },
  { key: 'bg_bg', locale: 'bg-BG', header: 'bg-BG,bg;q=0.9', location: 'bg', country: 'Bulgaria',       isEU: true  },
  { key: 'cs_cz', locale: 'cs-CZ', header: 'cs-CZ,cs;q=0.9', location: 'cz', country: 'Czech Republic', isEU: true  },
  { key: 'da_dk', locale: 'da-DK', header: 'da-DK,da;q=0.9', location: 'dk', country: 'Denmark',        isEU: true  },
  { key: 'nl_nl', locale: 'nl-NL', header: 'nl-NL,nl;q=0.9', location: 'nl', country: 'Netherlands',    isEU: true  },
  { key: 'et_ee', locale: 'et-EE', header: 'et-EE,et;q=0.9', location: 'ee', country: 'Estonia',        isEU: true  },
  { key: 'fi_fi', locale: 'fi-FI', header: 'fi-FI,fi;q=0.9', location: 'fi', country: 'Finland',        isEU: true  },
  { key: 'hu_hu', locale: 'hu-HU', header: 'hu-HU,hu;q=0.9', location: 'hu', country: 'Hungary',        isEU: true  },
  { key: 'it_it', locale: 'it-IT', header: 'it-IT,it;q=0.9', location: 'it', country: 'Italy',          isEU: true  },
  { key: 'nb_no', locale: 'nb-NO', header: 'nb-NO,nb;q=0.9', location: 'no', country: 'Norway',         isEU: true  },
  { key: 'pl_pl', locale: 'pl-PL', header: 'pl-PL,pl;q=0.9', location: 'pl', country: 'Poland',         isEU: true  },
  { key: 'sk_sk', locale: 'sk-SK', header: 'sk-SK,sk;q=0.9', location: 'sk', country: 'Slovakia',       isEU: true  },
  { key: 'sl_si', locale: 'sl-SI', header: 'sl-SI,sl;q=0.9', location: 'si', country: 'Slovenia',       isEU: true  },
  { key: 'es_es', locale: 'es-ES', header: 'es-ES,es;q=0.9', location: 'es', country: 'Spain',          isEU: true  },
  { key: 'sv_se', locale: 'sv-SE', header: 'sv-SE,sv;q=0.9', location: 'se', country: 'Sweden',         isEU: true  },
  { key: 'he_il', locale: 'he-IL', header: 'he-IL,he;q=0.9', location: 'il', country: 'Israel',         isEU: false },
  { key: 'ko_kr', locale: 'ko-KR', header: 'ko-KR,ko;q=0.9', location: 'kr', country: 'South Korea',    isEU: false },
  { key: 'ru_ru', locale: 'ru-RU', header: 'ru-RU,ru;q=0.9', location: 'ru', country: 'Russia',         isEU: false },
  { key: 'tr_tr', locale: 'tr-TR', header: 'tr-TR,tr;q=0.9', location: 'tr', country: 'Turkey',         isEU: false },
  { key: 'uk_ua', locale: 'uk-UA', header: 'uk-UA,uk;q=0.9', location: 'ua', country: 'Ukraine',        isEU: false },
  { key: 'zh_cn', locale: 'zh-CN', header: 'zh-CN,zh;q=0.9', location: 'cn', country: 'China',          isEU: false },
  { key: 'zh_tw', locale: 'zh-TW', header: 'zh-TW,zh;q=0.9', location: 'tw', country: 'Taiwan',         isEU: false },
  { key: 'ja_jp', locale: 'ja-JP', header: 'ja-JP,ja;q=0.9', location: 'jp', country: 'Japan',          isEU: false },
];

// ── Re-export locale banner text ───────────────────────────────────────────
export { fedsCmpLocales };
