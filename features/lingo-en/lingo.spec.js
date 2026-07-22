/**
 * Generalized lingo/geo-banner test data — MINIMAL, non-redundant set. US path (/) tested
 * against the federal supported-markets.json (aem.page — the confirmed-correct source; see
 * ../../lingo-en-skills.md).
 *
 * Contains:
 *   - 55 Banner rows — exactly ONE row per distinct banner target that can ever render (every
 *     row in the JSON that CAN be recommended, tested via its own self-referential cookie+geo
 *     pair, e.g. cookie=mx + geo=mx -> recommends mx). No duplicate banners: testing multiple
 *     same-language cookies against the same GeoIP always produces the identical banner, so only
 *     one is kept per distinct target.
 *   - 8 No Action rows — one per DISTINCT reason the flowchart resolves to No Action (not
 *     exhaustive, since the vast majority of geo/cookie combinations are None): no cookie set,
 *     explicit English cookie, and 6 language-mismatch examples spanning different language
 *     families (including one compound/sub-locale prefix cookie, ch_de).
 *
 * `cookieValue` is the literal value written to the `international` cookie, taken directly from
 * each row's `prefix` column — see skills.md §3.2 for why this (not `defaultMarket` or `lang`) is
 * the correct field, and why the banner target depends only on language, not the exact cookie.
 *
 * `tcid` is a sequential numeric ID. `name` follows `@lingoEN-geo-{GEO}-cookie-{COOKIE}` to match
 * this repo's reporter convention (utils/reporters/base-reporter.js).
 */

export const lingoEnFeatures = 
[
  {
    "tcid": 1,
    "name": "@lingoEN-geo-ae-cookie-ae_ar",
    "description": "US path | GeoIP AE | cookie=ae_ar (العربية, lang=ar)",
    "path": "/",
    "geoIp": "ae",
    "cookieValue": "ae_ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ae_ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 2,
    "name": "@lingoEN-geo-ar-cookie-ar",
    "description": "US path | GeoIP AR | cookie=ar (Español, lang=es)",
    "path": "/",
    "geoIp": "ar",
    "cookieValue": "ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 3,
    "name": "@lingoEN-geo-at-cookie-at",
    "description": "US path | GeoIP AT | cookie=at (Deutsch, lang=de)",
    "path": "/",
    "geoIp": "at",
    "cookieValue": "at",
    "uiExpectation": "banner",
    "bannerRowPrefix": "at",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 4,
    "name": "@lingoEN-geo-be-cookie-fr",
    "description": "US path | GeoIP BE | cookie=fr (Français, lang=fr)",
    "path": "/",
    "geoIp": "be",
    "cookieValue": "fr",
    "uiExpectation": "banner",
    "bannerRowPrefix": "fr",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 5,
    "name": "@lingoEN-geo-be-cookie-be_nl",
    "description": "US path | GeoIP BE | cookie=be_nl (Dutch, lang=nl)",
    "path": "/",
    "geoIp": "be",
    "cookieValue": "be_nl",
    "uiExpectation": "banner",
    "bannerRowPrefix": "be_nl",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 6,
    "name": "@lingoEN-geo-bg-cookie-bg",
    "description": "US path | GeoIP BG | cookie=bg (Български, lang=bg)",
    "path": "/",
    "geoIp": "bg",
    "cookieValue": "bg",
    "uiExpectation": "banner",
    "bannerRowPrefix": "bg",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 7,
    "name": "@lingoEN-geo-br-cookie-br",
    "description": "US path | GeoIP BR | cookie=br (Português (BR), lang=pt)",
    "path": "/",
    "geoIp": "br",
    "cookieValue": "br",
    "uiExpectation": "banner",
    "bannerRowPrefix": "br",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 8,
    "name": "@lingoEN-geo-ch-cookie-ch_de",
    "description": "US path | GeoIP CH | cookie=ch_de (Deutsch, lang=de)",
    "path": "/",
    "geoIp": "ch",
    "cookieValue": "ch_de",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ch_de",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 9,
    "name": "@lingoEN-geo-ch-cookie-ch_it",
    "description": "US path | GeoIP CH | cookie=ch_it (Italian, lang=it)",
    "path": "/",
    "geoIp": "ch",
    "cookieValue": "ch_it",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ch_it",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 10,
    "name": "@lingoEN-geo-cl-cookie-cl",
    "description": "US path | GeoIP CL | cookie=cl (Español, lang=es)",
    "path": "/",
    "geoIp": "cl",
    "cookieValue": "cl",
    "uiExpectation": "banner",
    "bannerRowPrefix": "cl",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 11,
    "name": "@lingoEN-geo-co-cookie-co",
    "description": "US path | GeoIP CO | cookie=co (Español, lang=es)",
    "path": "/",
    "geoIp": "co",
    "cookieValue": "co",
    "uiExpectation": "banner",
    "bannerRowPrefix": "co",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 12,
    "name": "@lingoEN-geo-cr-cookie-cr",
    "description": "US path | GeoIP CR | cookie=cr (Español, lang=es)",
    "path": "/",
    "geoIp": "cr",
    "cookieValue": "cr",
    "uiExpectation": "banner",
    "bannerRowPrefix": "cr",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 13,
    "name": "@lingoEN-geo-cz-cookie-cz",
    "description": "US path | GeoIP CZ | cookie=cz (Čeština, lang=cs)",
    "path": "/",
    "geoIp": "cz",
    "cookieValue": "cz",
    "uiExpectation": "banner",
    "bannerRowPrefix": "cz",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 14,
    "name": "@lingoEN-geo-de-cookie-de",
    "description": "US path | GeoIP DE | cookie=de (Deutsch, lang=de)",
    "path": "/",
    "geoIp": "de",
    "cookieValue": "de",
    "uiExpectation": "banner",
    "bannerRowPrefix": "de",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 15,
    "name": "@lingoEN-geo-de-cookie-tr",
    "description": "US path | GeoIP DE | cookie=tr (Turkish, lang=tr)",
    "path": "/",
    "geoIp": "de",
    "cookieValue": "tr",
    "uiExpectation": "banner",
    "bannerRowPrefix": "tr",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 16,
    "name": "@lingoEN-geo-dk-cookie-dk",
    "description": "US path | GeoIP DK | cookie=dk (Dansk, lang=da)",
    "path": "/",
    "geoIp": "dk",
    "cookieValue": "dk",
    "uiExpectation": "banner",
    "bannerRowPrefix": "dk",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 17,
    "name": "@lingoEN-geo-dz-cookie-mena_ar",
    "description": "US path | GeoIP DZ | cookie=mena_ar (العربية, lang=ar)",
    "path": "/",
    "geoIp": "dz",
    "cookieValue": "mena_ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "mena_ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 18,
    "name": "@lingoEN-geo-ec-cookie-ec",
    "description": "US path | GeoIP EC | cookie=ec (Español, lang=es)",
    "path": "/",
    "geoIp": "ec",
    "cookieValue": "ec",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ec",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 19,
    "name": "@lingoEN-geo-ee-cookie-ee",
    "description": "US path | GeoIP EE | cookie=ee (Eesti, lang=et)",
    "path": "/",
    "geoIp": "ee",
    "cookieValue": "ee",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ee",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 20,
    "name": "@lingoEN-geo-eg-cookie-eg_ar",
    "description": "US path | GeoIP EG | cookie=eg_ar (العربية, lang=ar)",
    "path": "/",
    "geoIp": "eg",
    "cookieValue": "eg_ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "eg_ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 21,
    "name": "@lingoEN-geo-es-cookie-es",
    "description": "US path | GeoIP ES | cookie=es (Español, lang=es)",
    "path": "/",
    "geoIp": "es",
    "cookieValue": "es",
    "uiExpectation": "banner",
    "bannerRowPrefix": "es",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 22,
    "name": "@lingoEN-geo-fi-cookie-fi",
    "description": "US path | GeoIP FI | cookie=fi (Suomi, lang=fi)",
    "path": "/",
    "geoIp": "fi",
    "cookieValue": "fi",
    "uiExpectation": "banner",
    "bannerRowPrefix": "fi",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 23,
    "name": "@lingoEN-geo-gr-cookie-gr_el",
    "description": "US path | GeoIP GR | cookie=gr_el (Ελληνικά, lang=el)",
    "path": "/",
    "geoIp": "gr",
    "cookieValue": "gr_el",
    "uiExpectation": "banner",
    "bannerRowPrefix": "gr_el",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 24,
    "name": "@lingoEN-geo-gt-cookie-gt",
    "description": "US path | GeoIP GT | cookie=gt (Español, lang=es)",
    "path": "/",
    "geoIp": "gt",
    "cookieValue": "gt",
    "uiExpectation": "banner",
    "bannerRowPrefix": "gt",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 25,
    "name": "@lingoEN-geo-hk-cookie-hk_zh",
    "description": "US path | GeoIP HK | cookie=hk_zh (繁體中文, lang=zh)",
    "path": "/",
    "geoIp": "hk",
    "cookieValue": "hk_zh",
    "uiExpectation": "banner",
    "bannerRowPrefix": "hk_zh",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 26,
    "name": "@lingoEN-geo-hu-cookie-hu",
    "description": "US path | GeoIP HU | cookie=hu (magyar, lang=hu)",
    "path": "/",
    "geoIp": "hu",
    "cookieValue": "hu",
    "uiExpectation": "banner",
    "bannerRowPrefix": "hu",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 27,
    "name": "@lingoEN-geo-id-cookie-id_id",
    "description": "US path | GeoIP ID | cookie=id_id (Bahasa Indonesia, lang=id)",
    "path": "/",
    "geoIp": "id",
    "cookieValue": "id_id",
    "uiExpectation": "banner",
    "bannerRowPrefix": "id_id",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 28,
    "name": "@lingoEN-geo-il-cookie-il_he",
    "description": "US path | GeoIP IL | cookie=il_he (עברית, lang=he)",
    "path": "/",
    "geoIp": "il",
    "cookieValue": "il_he",
    "uiExpectation": "banner",
    "bannerRowPrefix": "il_he",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 29,
    "name": "@lingoEN-geo-in-cookie-in_hi",
    "description": "US path | GeoIP IN | cookie=in_hi (हिंदी, lang=hi)",
    "path": "/",
    "geoIp": "in",
    "cookieValue": "in_hi",
    "uiExpectation": "banner",
    "bannerRowPrefix": "in_hi",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 30,
    "name": "@lingoEN-geo-it-cookie-it",
    "description": "US path | GeoIP IT | cookie=it (Italian, lang=it)",
    "path": "/",
    "geoIp": "it",
    "cookieValue": "it",
    "uiExpectation": "banner",
    "bannerRowPrefix": "it",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 31,
    "name": "@lingoEN-geo-jp-cookie-jp",
    "description": "US path | GeoIP JP | cookie=jp (日本語, lang=ja)",
    "path": "/",
    "geoIp": "jp",
    "cookieValue": "jp",
    "uiExpectation": "banner",
    "bannerRowPrefix": "jp",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 32,
    "name": "@lingoEN-geo-kr-cookie-kr",
    "description": "US path | GeoIP KR | cookie=kr (한국어, lang=ko)",
    "path": "/",
    "geoIp": "kr",
    "cookieValue": "kr",
    "uiExpectation": "banner",
    "bannerRowPrefix": "kr",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 33,
    "name": "@lingoEN-geo-kw-cookie-kw_ar",
    "description": "US path | GeoIP KW | cookie=kw_ar (العربية, lang=ar)",
    "path": "/",
    "geoIp": "kw",
    "cookieValue": "kw_ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "kw_ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 34,
    "name": "@lingoEN-geo-lt-cookie-lt",
    "description": "US path | GeoIP LT | cookie=lt (Lietuvių, lang=lt)",
    "path": "/",
    "geoIp": "lt",
    "cookieValue": "lt",
    "uiExpectation": "banner",
    "bannerRowPrefix": "lt",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 35,
    "name": "@lingoEN-geo-lu-cookie-lu_de",
    "description": "US path | GeoIP LU | cookie=lu_de (Deutsch, lang=de)",
    "path": "/",
    "geoIp": "lu",
    "cookieValue": "lu_de",
    "uiExpectation": "banner",
    "bannerRowPrefix": "lu_de",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 36,
    "name": "@lingoEN-geo-lv-cookie-lv",
    "description": "US path | GeoIP LV | cookie=lv (Latviešu, lang=lv)",
    "path": "/",
    "geoIp": "lv",
    "cookieValue": "lv",
    "uiExpectation": "banner",
    "bannerRowPrefix": "lv",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 37,
    "name": "@lingoEN-geo-mx-cookie-mx",
    "description": "US path | GeoIP MX | cookie=mx (Español, lang=es)",
    "path": "/",
    "geoIp": "mx",
    "cookieValue": "mx",
    "uiExpectation": "banner",
    "bannerRowPrefix": "mx",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 38,
    "name": "@lingoEN-geo-my-cookie-my_ms",
    "description": "US path | GeoIP MY | cookie=my_ms (Bahasa Melayu, lang=ms)",
    "path": "/",
    "geoIp": "my",
    "cookieValue": "my_ms",
    "uiExpectation": "banner",
    "bannerRowPrefix": "my_ms",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 39,
    "name": "@lingoEN-geo-nl-cookie-nl",
    "description": "US path | GeoIP NL | cookie=nl (Dutch, lang=nl)",
    "path": "/",
    "geoIp": "nl",
    "cookieValue": "nl",
    "uiExpectation": "banner",
    "bannerRowPrefix": "nl",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 40,
    "name": "@lingoEN-geo-no-cookie-no",
    "description": "US path | GeoIP NO | cookie=no (Norsk, lang=no)",
    "path": "/",
    "geoIp": "no",
    "cookieValue": "no",
    "uiExpectation": "banner",
    "bannerRowPrefix": "no",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 41,
    "name": "@lingoEN-geo-pe-cookie-pe",
    "description": "US path | GeoIP PE | cookie=pe (Español, lang=es)",
    "path": "/",
    "geoIp": "pe",
    "cookieValue": "pe",
    "uiExpectation": "banner",
    "bannerRowPrefix": "pe",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 42,
    "name": "@lingoEN-geo-ph-cookie-ph_fil",
    "description": "US path | GeoIP PH | cookie=ph_fil (Filipino, lang=fil)",
    "path": "/",
    "geoIp": "ph",
    "cookieValue": "ph_fil",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ph_fil",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 43,
    "name": "@lingoEN-geo-pl-cookie-pl",
    "description": "US path | GeoIP PL | cookie=pl (Polska, lang=pl)",
    "path": "/",
    "geoIp": "pl",
    "cookieValue": "pl",
    "uiExpectation": "banner",
    "bannerRowPrefix": "pl",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 44,
    "name": "@lingoEN-geo-pr-cookie-pr",
    "description": "US path | GeoIP PR | cookie=pr (Español, lang=es)",
    "path": "/",
    "geoIp": "pr",
    "cookieValue": "pr",
    "uiExpectation": "banner",
    "bannerRowPrefix": "pr",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 45,
    "name": "@lingoEN-geo-pt-cookie-pt",
    "description": "US path | GeoIP PT | cookie=pt (Português, lang=pt)",
    "path": "/",
    "geoIp": "pt",
    "cookieValue": "pt",
    "uiExpectation": "banner",
    "bannerRowPrefix": "pt",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 46,
    "name": "@lingoEN-geo-qa-cookie-qa_ar",
    "description": "US path | GeoIP QA | cookie=qa_ar (العربية, lang=ar)",
    "path": "/",
    "geoIp": "qa",
    "cookieValue": "qa_ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "qa_ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 47,
    "name": "@lingoEN-geo-ro-cookie-ro",
    "description": "US path | GeoIP RO | cookie=ro (Româna, lang=ro)",
    "path": "/",
    "geoIp": "ro",
    "cookieValue": "ro",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ro",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 48,
    "name": "@lingoEN-geo-sa-cookie-sa_ar",
    "description": "US path | GeoIP SA | cookie=sa_ar (العربية, lang=ar)",
    "path": "/",
    "geoIp": "sa",
    "cookieValue": "sa_ar",
    "uiExpectation": "banner",
    "bannerRowPrefix": "sa_ar",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 49,
    "name": "@lingoEN-geo-se-cookie-se",
    "description": "US path | GeoIP SE | cookie=se (Svenska, lang=sv)",
    "path": "/",
    "geoIp": "se",
    "cookieValue": "se",
    "uiExpectation": "banner",
    "bannerRowPrefix": "se",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 50,
    "name": "@lingoEN-geo-si-cookie-si",
    "description": "US path | GeoIP SI | cookie=si (Slovenščina, lang=sl)",
    "path": "/",
    "geoIp": "si",
    "cookieValue": "si",
    "uiExpectation": "banner",
    "bannerRowPrefix": "si",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 51,
    "name": "@lingoEN-geo-sk-cookie-sk",
    "description": "US path | GeoIP SK | cookie=sk (Slovenčina, lang=sk)",
    "path": "/",
    "geoIp": "sk",
    "cookieValue": "sk",
    "uiExpectation": "banner",
    "bannerRowPrefix": "sk",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 52,
    "name": "@lingoEN-geo-th-cookie-th_th",
    "description": "US path | GeoIP TH | cookie=th_th (ภาษาไทย, lang=th)",
    "path": "/",
    "geoIp": "th",
    "cookieValue": "th_th",
    "uiExpectation": "banner",
    "bannerRowPrefix": "th_th",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 53,
    "name": "@lingoEN-geo-tw-cookie-tw",
    "description": "US path | GeoIP TW | cookie=tw (繁體中文, lang=zh)",
    "path": "/",
    "geoIp": "tw",
    "cookieValue": "tw",
    "uiExpectation": "banner",
    "bannerRowPrefix": "tw",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 54,
    "name": "@lingoEN-geo-ua-cookie-ua",
    "description": "US path | GeoIP UA | cookie=ua (Українські, lang=uk)",
    "path": "/",
    "geoIp": "ua",
    "cookieValue": "ua",
    "uiExpectation": "banner",
    "bannerRowPrefix": "ua",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 55,
    "name": "@lingoEN-geo-vn-cookie-vn_vi",
    "description": "US path | GeoIP VN | cookie=vn_vi (Tiếng Việt, lang=vi)",
    "path": "/",
    "geoIp": "vn",
    "cookieValue": "vn_vi",
    "uiExpectation": "banner",
    "bannerRowPrefix": "vn_vi",
    "tags": "@lingo-en @us-path"
  },
  {
    "tcid": 56,
    "name": "@lingoEN-geo-fr-cookie-none",
    "description": "US path | GeoIP FR | no cookie set (treated as US/EN default) -> matches PAGE-LANG (en)",
    "path": "/",
    "geoIp": "fr",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @smoke @no-action-reason-no-cookie"
  },
  {
    "tcid": 57,
    "name": "@lingoEN-geo-de-cookie-us",
    "description": "US path | GeoIP DE | cookie=us (English, explicit) -> matches PAGE-LANG (en), explicit-cookie code path not default-fallback",
    "path": "/",
    "geoIp": "de",
    "cookieValue": "us",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-explicit-en-cookie"
  },
  {
    "tcid": 58,
    "name": "@lingoEN-geo-jp-cookie-es",
    "description": "US path | GeoIP JP | cookie=es -> Spanish cookie, Japan geo — Spanish has no market for Japan",
    "path": "/",
    "geoIp": "jp",
    "cookieValue": "es",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-language-mismatch"
  },
  {
    "tcid": 59,
    "name": "@lingoEN-geo-de-cookie-mena_ar",
    "description": "US path | GeoIP DE | cookie=mena_ar -> Arabic cookie, Germany geo — Arabic has no market for Germany",
    "path": "/",
    "geoIp": "de",
    "cookieValue": "mena_ar",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-language-mismatch"
  },
  {
    "tcid": 60,
    "name": "@lingoEN-geo-fr-cookie-cn",
    "description": "US path | GeoIP FR | cookie=cn -> Chinese cookie, France geo — Chinese has no market for France",
    "path": "/",
    "geoIp": "fr",
    "cookieValue": "cn",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-language-mismatch"
  },
  {
    "tcid": 61,
    "name": "@lingoEN-geo-jp-cookie-in_hi",
    "description": "US path | GeoIP JP | cookie=in_hi -> Hindi cookie, Japan geo — Hindi has no market for Japan",
    "path": "/",
    "geoIp": "jp",
    "cookieValue": "in_hi",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-language-mismatch"
  },
  {
    "tcid": 62,
    "name": "@lingoEN-geo-jp-cookie-ch_de",
    "description": "US path | GeoIP JP | cookie=ch_de -> Swiss-German cookie, Japan geo — tests a compound/sub-locale prefix as cookie source",
    "path": "/",
    "geoIp": "jp",
    "cookieValue": "ch_de",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-language-mismatch"
  },
  {
    "tcid": 63,
    "name": "@lingoEN-geo-es-cookie-jp",
    "description": "US path | GeoIP ES | cookie=jp -> Japanese cookie, Spain geo — Japanese has no market for Spain",
    "path": "/",
    "geoIp": "es",
    "cookieValue": "jp",
    "uiExpectation": "none",
    "tags": "@lingo-en @us-path @no-action-reason-language-mismatch"
  },
  {
    "tcid": 64,
    "name": "@lingoEN-geo-cn-cookie-cn",
    "description": "US path | GeoIP CN | cookie=cn (简体中文, lang=zh) -> GeoIP not in root's supportedRegions -> Modal, not Banner",
    "path": "/",
    "geoIp": "cn",
    "cookieValue": "cn",
    "uiExpectation": "modal",
    "bannerRowPrefix": "cn",
    "tags": "@lingo-en @us-path @modal"
  },
  {
    "tcid": 65,
    "name": "@lingoEN-geo-cn-cookie-none",
    "description": "US path | GeoIP CN | no cookie set (PREF-LANG defaults to en) -> no English row covers cn -> Modal, single option (cn)",
    "path": "/",
    "geoIp": "cn",
    "uiExpectation": "modal",
    "bannerRowPrefix": "cn",
    "tags": "@lingo-en @us-path @modal"
  }
];
