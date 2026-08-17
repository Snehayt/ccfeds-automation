/**
 * Regenerated after a live JSON update (65 rows, was 62 — added africa/cis_en/mena_en, and
 * Every row is machine-verified against the live JSON via computeExpectedUi, not hand-authored.
 * `cookieValue` is written directly to the `international` cookie, taken from the row's own
 * `prefix` column. `name` follows `@lingoEN-geo-{GEO}-cookie-{COOKIE}` to match
 * this repo's reporter convention (utils/reporters/base-reporter.js).
 */

// Same convention as features/express/lingo.spec.js's `jsonSnapshotFeature` — a plain data row
// for the JSON Snapshot check, not a UI-outcome test (no geoIp/cookieValue/uiExpectation needed).
export const jsonSnapshotFeature = {
  tcid: 'JS1',
  name: '@lingoEN-json-snapshot-acom',
  path: '/',
  tags: '@lingo-en @json-snapshot',
};

export const lingoEnFeatures = [

  // ─── Banner (Scenario 2) — page+geo combo supported, cookie language differs ─────────────

  { tcid: 'B1', name: '@lingoEN-geo-be-cookie-fr', description: 'US path | GeoIP BE | cookie=fr (Français, lang=fr)', path: '/', geoIp: 'be', cookieValue: 'fr', uiExpectation: 'banner', recommendedRowPrefix: 'fr', tags: '@lingo-en @us-path' },
  { tcid: 'B2', name: '@lingoEN-geo-ph-cookie-ph_fil', description: 'US path | GeoIP PH | cookie=ph_fil (Filipino, lang=fil)', path: '/', geoIp: 'ph', cookieValue: 'ph_fil', uiExpectation: 'banner', recommendedRowPrefix: 'ph_fil', tags: '@lingo-en @us-path' },
  { tcid: 'B3', name: '@lingoEN-geo-il-cookie-il_he', description: 'US path | GeoIP IL | cookie=il_he (עברית, lang=he)', path: '/', geoIp: 'il', cookieValue: 'il_he', uiExpectation: 'banner', recommendedRowPrefix: 'il_he', tags: '@lingo-en @us-path' },
  { tcid: 'B4', name: '@lingoEN-geo-id-cookie-id_id', description: 'US path | GeoIP ID | cookie=id_id (Bahasa Indonesia, lang=id)', path: '/', geoIp: 'id', cookieValue: 'id_id', uiExpectation: 'banner', recommendedRowPrefix: 'id_id', tags: '@lingo-en @us-path' },
  { tcid: 'B5', name: '@lingoEN-geo-my-cookie-my_ms', description: 'US path | GeoIP MY | cookie=my_ms (Bahasa Melayu, lang=ms)', path: '/', geoIp: 'my', cookieValue: 'my_ms', uiExpectation: 'banner', recommendedRowPrefix: 'my_ms', tags: '@lingo-en @us-path' },
  { tcid: 'B6', name: '@lingoEN-geo-th-cookie-th_th', description: 'US path | GeoIP TH | cookie=th_th (ภาษาไทย, lang=th)', path: '/', geoIp: 'th', cookieValue: 'th_th', uiExpectation: 'banner', recommendedRowPrefix: 'th_th', tags: '@lingo-en @us-path' },
  { tcid: 'B7', name: '@lingoEN-geo-vn-cookie-vn_vi', description: 'US path | GeoIP VN | cookie=vn_vi (Tiếng Việt, lang=vi)', path: '/', geoIp: 'vn', cookieValue: 'vn_vi', uiExpectation: 'banner', recommendedRowPrefix: 'vn_vi', tags: '@lingo-en @us-path' },
  { tcid: 'B8', name: '@lingoEN-geo-lu-cookie-lu_de', description: 'US path | GeoIP LU | cookie=lu_de (Deutsch, lang=de)', path: '/', geoIp: 'lu', cookieValue: 'lu_de', uiExpectation: 'banner', recommendedRowPrefix: 'lu_de', tags: '@lingo-en @us-path' },
  { tcid: 'B9', name: '@lingoEN-geo-be-cookie-be_nl', description: 'US path | GeoIP BE | cookie=be_nl (Dutch, lang=nl)', path: '/', geoIp: 'be', cookieValue: 'be_nl', uiExpectation: 'banner', recommendedRowPrefix: 'be_nl', tags: '@lingo-en @us-path' },
  { tcid: 'B10', name: '@lingoEN-geo-hk-cookie-hk_zh', description: 'US path | GeoIP HK | cookie=hk_zh (繁體中文, lang=zh)', path: '/', geoIp: 'hk', cookieValue: 'hk_zh', uiExpectation: 'banner', recommendedRowPrefix: 'hk_zh', tags: '@lingo-en @us-path' },
  { tcid: 'B11', name: '@lingoEN-geo-eg-cookie-eg_ar', description: 'US path | GeoIP EG | cookie=eg_ar (العربية, lang=ar)', path: '/', geoIp: 'eg', cookieValue: 'eg_ar', uiExpectation: 'banner', recommendedRowPrefix: 'eg_ar', tags: '@lingo-en @us-path' },
  { tcid: 'B12', name: '@lingoEN-geo-kw-cookie-kw_ar', description: 'US path | GeoIP KW | cookie=kw_ar (العربية, lang=ar)', path: '/', geoIp: 'kw', cookieValue: 'kw_ar', uiExpectation: 'banner', recommendedRowPrefix: 'kw_ar', tags: '@lingo-en @us-path' },
  { tcid: 'B13', name: '@lingoEN-geo-qa-cookie-qa_ar', description: 'US path | GeoIP QA | cookie=qa_ar (العربية, lang=ar)', path: '/', geoIp: 'qa', cookieValue: 'qa_ar', uiExpectation: 'banner', recommendedRowPrefix: 'qa_ar', tags: '@lingo-en @us-path' },
  { tcid: 'B14', name: '@lingoEN-geo-sa-cookie-sa_ar', description: 'US path | GeoIP SA | cookie=sa_ar (العربية, lang=ar)', path: '/', geoIp: 'sa', cookieValue: 'sa_ar', uiExpectation: 'banner', recommendedRowPrefix: 'sa_ar', tags: '@lingo-en @us-path' },
  { tcid: 'B15', name: '@lingoEN-geo-ae-cookie-ae_ar', description: 'US path | GeoIP AE | cookie=ae_ar (العربية, lang=ar)', path: '/', geoIp: 'ae', cookieValue: 'ae_ar', uiExpectation: 'banner', recommendedRowPrefix: 'ae_ar', tags: '@lingo-en @us-path' },
  { tcid: 'B16', name: '@lingoEN-geo-gr-cookie-gr_el', description: 'US path | GeoIP GR | cookie=gr_el (Ελληνικά, lang=el)', path: '/', geoIp: 'gr', cookieValue: 'gr_el', uiExpectation: 'banner', recommendedRowPrefix: 'gr_el', tags: '@lingo-en @us-path' },

  // ─── Full coverage of root's own 22 GeoIP regions — the 2 remaining Banner-capable pairings
  // not yet tested (both confirmed live via computeExpectedUi): `ca` overlaps with the `fr` row
  // (same as `be` does); `lu` overlaps with BOTH `fr` and `lu_de` but only the `lu_de` pairing
  // was tested (B8) — this adds the `fr` pairing too.
  { tcid: 'B17', name: '@lingoEN-geo-ca-cookie-fr', description: 'US path | GeoIP CA | cookie=fr (Français, lang=fr) — completes root-region coverage for CA', path: '/', geoIp: 'ca', cookieValue: 'fr', uiExpectation: 'banner', recommendedRowPrefix: 'fr', tags: '@lingo-en @us-path' },
  { tcid: 'B18', name: '@lingoEN-geo-lu-cookie-fr', description: 'US path | GeoIP LU | cookie=fr (Français, lang=fr) — second Banner-capable pairing for LU (lu_de already tested in B8)', path: '/', geoIp: 'lu', cookieValue: 'fr', uiExpectation: 'banner', recommendedRowPrefix: 'fr', tags: '@lingo-en @us-path' },

  // ─── Modal (Scenario 4/5) — page+geo combo NOT supported, geo covered elsewhere ────────────

  { tcid: 'RM1', name: '@lingoEN-geo-es-cookie-es', description: 'US path | GeoIP ES | cookie=es (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'es', cookieValue: 'es', uiExpectation: 'modal', recommendedRowPrefix: 'es', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM2', name: '@lingoEN-geo-fr-cookie-fr', description: "US path | GeoIP FR | cookie=fr (Français, lang=fr) -> GeoIP not in root supportedRegions -> Modal -- completes supportedRegions coverage for the fr row (be/ca/lu already tested via root-region Banner pairings, ch via its own row)", path: '/', geoIp: 'fr', cookieValue: 'fr', uiExpectation: 'modal', recommendedRowPrefix: 'fr', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM3', name: '@lingoEN-geo-de-cookie-de', description: 'US path | GeoIP DE | cookie=de (Deutsch, lang=de) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'de', cookieValue: 'de', uiExpectation: 'modal', recommendedRowPrefix: 'de', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM4', name: '@lingoEN-geo-de-cookie-tr', description: 'US path | GeoIP DE | cookie=tr (Turkish, lang=tr) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'de', cookieValue: 'tr', uiExpectation: 'modal', recommendedRowPrefix: 'tr', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM5', name: '@lingoEN-geo-tr-cookie-tr', description: "US path | GeoIP TR | cookie=tr (Türkçe, lang=tr) -> GeoIP not in root supportedRegions -> Modal -- completes supportedRegions coverage for the tr row (de already tested above via a DIFFERENT geoIp/cookie pairing)", path: '/', geoIp: 'tr', cookieValue: 'tr', uiExpectation: 'modal', recommendedRowPrefix: 'tr', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM6', name: '@lingoEN-geo-nl-cookie-nl', description: 'US path | GeoIP NL | cookie=nl (Dutch, lang=nl) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'nl', cookieValue: 'nl', uiExpectation: 'modal', recommendedRowPrefix: 'nl', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM7', name: '@lingoEN-geo-it-cookie-it', description: 'US path | GeoIP IT | cookie=it (Italian, lang=it) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'it', cookieValue: 'it', uiExpectation: 'modal', recommendedRowPrefix: 'it', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM8', name: '@lingoEN-geo-ru-cookie-ru', description: 'US path | GeoIP RU | cookie=ru (Russian, lang=ru) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ru', cookieValue: 'ru', uiExpectation: 'modal', recommendedRowPrefix: 'ru', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM9', name: '@lingoEN-geo-pt-cookie-pt', description: 'US path | GeoIP PT | cookie=pt (Português, lang=pt) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'pt', cookieValue: 'pt', uiExpectation: 'modal', recommendedRowPrefix: 'pt', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM10', name: '@lingoEN-geo-ro-cookie-ro', description: 'US path | GeoIP RO | cookie=ro (Româna, lang=ro) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ro', cookieValue: 'ro', uiExpectation: 'modal', recommendedRowPrefix: 'ro', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM11', name: '@lingoEN-geo-bg-cookie-bg', description: 'US path | GeoIP BG | cookie=bg (Български, lang=bg) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'bg', cookieValue: 'bg', uiExpectation: 'modal', recommendedRowPrefix: 'bg', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM12', name: '@lingoEN-geo-cn-cookie-cn', description: 'US path | GeoIP CN | cookie=cn (简体中文, lang=zh) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'cn', cookieValue: 'cn', uiExpectation: 'modal', recommendedRowPrefix: 'cn', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM13', name: '@lingoEN-geo-cz-cookie-cz', description: 'US path | GeoIP CZ | cookie=cz (Čeština, lang=cs) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'cz', cookieValue: 'cz', uiExpectation: 'modal', recommendedRowPrefix: 'cz', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM14', name: '@lingoEN-geo-dk-cookie-dk', description: 'US path | GeoIP DK | cookie=dk (Dansk, lang=da) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'dk', cookieValue: 'dk', uiExpectation: 'modal', recommendedRowPrefix: 'dk', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM15', name: '@lingoEN-geo-au-cookie-au', description: 'US path | GeoIP AU | cookie=au (English (AU), lang=en) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'au', cookieValue: 'au', uiExpectation: 'modal', recommendedRowPrefix: 'au', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM16', name: '@lingoEN-geo-in-cookie-in', description: 'US path | GeoIP IN | cookie=in (English (IN), lang=en) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'in', cookieValue: 'in', uiExpectation: 'modal', recommendedRowPrefix: 'in', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM17', name: '@lingoEN-geo-gb-cookie-uk', description: 'US path | GeoIP GB | cookie=uk (English (UK), lang=en) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'gb', cookieValue: 'uk', uiExpectation: 'modal', recommendedRowPrefix: 'uk', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM18', name: '@lingoEN-geo-ee-cookie-ee', description: 'US path | GeoIP EE | cookie=ee (Eesti, lang=et) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ee', cookieValue: 'ee', uiExpectation: 'modal', recommendedRowPrefix: 'ee', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM19', name: '@lingoEN-geo-fi-cookie-fi', description: 'US path | GeoIP FI | cookie=fi (Suomi, lang=fi) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'fi', cookieValue: 'fi', uiExpectation: 'modal', recommendedRowPrefix: 'fi', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM20', name: '@lingoEN-geo-in-cookie-in_hi', description: 'US path | GeoIP IN | cookie=in_hi (हिंदी, lang=hi) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'in', cookieValue: 'in_hi', uiExpectation: 'modal', recommendedRowPrefix: 'in_hi', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM21', name: '@lingoEN-geo-hu-cookie-hu', description: 'US path | GeoIP HU | cookie=hu (magyar, lang=hu) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'hu', cookieValue: 'hu', uiExpectation: 'modal', recommendedRowPrefix: 'hu', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM22', name: '@lingoEN-geo-jp-cookie-jp', description: 'US path | GeoIP JP | cookie=jp (日本語, lang=ja) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'jp', cookieValue: 'jp', uiExpectation: 'modal', recommendedRowPrefix: 'jp', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM23', name: '@lingoEN-geo-kr-cookie-kr', description: 'US path | GeoIP KR | cookie=kr (한국어, lang=ko) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'kr', cookieValue: 'kr', uiExpectation: 'modal', recommendedRowPrefix: 'kr', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM24', name: '@lingoEN-geo-lv-cookie-lv', description: 'US path | GeoIP LV | cookie=lv (Latviešu, lang=lv) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'lv', cookieValue: 'lv', uiExpectation: 'modal', recommendedRowPrefix: 'lv', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM25', name: '@lingoEN-geo-lt-cookie-lt', description: 'US path | GeoIP LT | cookie=lt (Lietuvių, lang=lt) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'lt', cookieValue: 'lt', uiExpectation: 'modal', recommendedRowPrefix: 'lt', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM26', name: '@lingoEN-geo-no-cookie-no', description: 'US path | GeoIP NO | cookie=no (Norsk, lang=no) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'no', cookieValue: 'no', uiExpectation: 'modal', recommendedRowPrefix: 'no', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM27', name: '@lingoEN-geo-pl-cookie-pl', description: 'US path | GeoIP PL | cookie=pl (Polska, lang=pl) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'pl', cookieValue: 'pl', uiExpectation: 'modal', recommendedRowPrefix: 'pl', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM28', name: '@lingoEN-geo-br-cookie-br', description: 'US path | GeoIP BR | cookie=br (Português (BR), lang=pt) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'br', cookieValue: 'br', uiExpectation: 'modal', recommendedRowPrefix: 'br', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM29', name: '@lingoEN-geo-sk-cookie-sk', description: 'US path | GeoIP SK | cookie=sk (Slovenčina, lang=sk) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'sk', cookieValue: 'sk', uiExpectation: 'modal', recommendedRowPrefix: 'sk', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM30', name: '@lingoEN-geo-si-cookie-si', description: 'US path | GeoIP SI | cookie=si (Slovenščina, lang=sl) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'si', cookieValue: 'si', uiExpectation: 'modal', recommendedRowPrefix: 'si', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM31', name: '@lingoEN-geo-se-cookie-se', description: 'US path | GeoIP SE | cookie=se (Svenska, lang=sv) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'se', cookieValue: 'se', uiExpectation: 'modal', recommendedRowPrefix: 'se', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM32', name: '@lingoEN-geo-ua-cookie-ua', description: 'US path | GeoIP UA | cookie=ua (Українські, lang=uk) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ua', cookieValue: 'ua', uiExpectation: 'modal', recommendedRowPrefix: 'ua', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM33', name: '@lingoEN-geo-dz-cookie-mena_ar', description: 'US path | GeoIP DZ | cookie=mena_ar (العربية, lang=ar) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'dz', cookieValue: 'mena_ar', uiExpectation: 'modal', recommendedRowPrefix: 'mena_ar', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM34', name: '@lingoEN-geo-ar-cookie-ar', description: 'US path | GeoIP AR | cookie=ar (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ar', cookieValue: 'ar', uiExpectation: 'modal', recommendedRowPrefix: 'ar', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM35', name: '@lingoEN-geo-cl-cookie-cl', description: 'US path | GeoIP CL | cookie=cl (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'cl', cookieValue: 'cl', uiExpectation: 'modal', recommendedRowPrefix: 'cl', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM36', name: '@lingoEN-geo-co-cookie-co', description: 'US path | GeoIP CO | cookie=co (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'co', cookieValue: 'co', uiExpectation: 'modal', recommendedRowPrefix: 'co', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM37', name: '@lingoEN-geo-cr-cookie-cr', description: 'US path | GeoIP CR | cookie=cr (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'cr', cookieValue: 'cr', uiExpectation: 'modal', recommendedRowPrefix: 'cr', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM38', name: '@lingoEN-geo-ec-cookie-ec', description: 'US path | GeoIP EC | cookie=ec (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ec', cookieValue: 'ec', uiExpectation: 'modal', recommendedRowPrefix: 'ec', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM39', name: '@lingoEN-geo-gt-cookie-gt', description: 'US path | GeoIP GT | cookie=gt (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'gt', cookieValue: 'gt', uiExpectation: 'modal', recommendedRowPrefix: 'gt', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM40', name: '@lingoEN-geo-mx-cookie-mx', description: 'US path | GeoIP MX | cookie=mx (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'mx', cookieValue: 'mx', uiExpectation: 'modal', recommendedRowPrefix: 'mx', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM41', name: '@lingoEN-geo-pr-cookie-pr', description: 'US path | GeoIP PR | cookie=pr (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'pr', cookieValue: 'pr', uiExpectation: 'modal', recommendedRowPrefix: 'pr', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM42', name: '@lingoEN-geo-pe-cookie-pe', description: 'US path | GeoIP PE | cookie=pe (Español, lang=es) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'pe', cookieValue: 'pe', uiExpectation: 'modal', recommendedRowPrefix: 'pe', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM43', name: '@lingoEN-geo-at-cookie-at', description: 'US path | GeoIP AT | cookie=at (Deutsch, lang=de) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'at', cookieValue: 'at', uiExpectation: 'modal', recommendedRowPrefix: 'at', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM44', name: '@lingoEN-geo-ch-cookie-ch_de', description: 'US path | GeoIP CH | cookie=ch_de (Deutsch, lang=de) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ch', cookieValue: 'ch_de', uiExpectation: 'modal', recommendedRowPrefix: 'ch_de', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM45', name: '@lingoEN-geo-ch-cookie-ch_it', description: 'US path | GeoIP CH | cookie=ch_it (Italian, lang=it) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ch', cookieValue: 'ch_it', uiExpectation: 'modal', recommendedRowPrefix: 'ch_it', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM46', name: '@lingoEN-geo-tw-cookie-tw', description: 'US path | GeoIP TW | cookie=tw (繁體中文, lang=zh) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'tw', cookieValue: 'tw', uiExpectation: 'modal', recommendedRowPrefix: 'tw', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM47', name: '@lingoEN-geo-mu-cookie-africa', description: 'US path | GeoIP MU | cookie=africa (English, lang=en) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'mu', cookieValue: 'africa', uiExpectation: 'modal', recommendedRowPrefix: 'africa', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM48', name: '@lingoEN-geo-ke-cookie-africa', description: "US path | GeoIP KE | cookie=africa (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the africa row (mu already tested in RM47)", path: '/', geoIp: 'ke', cookieValue: 'africa', uiExpectation: 'modal', recommendedRowPrefix: 'africa', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM49', name: '@lingoEN-geo-gh-cookie-africa', description: "US path | GeoIP GH | cookie=africa (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the africa row", path: '/', geoIp: 'gh', cookieValue: 'africa', uiExpectation: 'modal', recommendedRowPrefix: 'africa', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM50', name: '@lingoEN-geo-tz-cookie-africa', description: "US path | GeoIP TZ | cookie=africa (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the africa row", path: '/', geoIp: 'tz', cookieValue: 'africa', uiExpectation: 'modal', recommendedRowPrefix: 'africa', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM51', name: '@lingoEN-geo-am-cookie-cis_en', description: 'US path | GeoIP AM | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'am', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM52', name: '@lingoEN-geo-az-cookie-cis_en', description: "US path | GeoIP AZ | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row (am already tested in RM51)", path: '/', geoIp: 'az', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM53', name: '@lingoEN-geo-ge-cookie-cis_en', description: "US path | GeoIP GE | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'ge', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM54', name: '@lingoEN-geo-md-cookie-cis_en', description: "US path | GeoIP MD | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'md', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM55', name: '@lingoEN-geo-kz-cookie-cis_en', description: "US path | GeoIP KZ | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'kz', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM56', name: '@lingoEN-geo-kg-cookie-cis_en', description: "US path | GeoIP KG | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'kg', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM57', name: '@lingoEN-geo-tj-cookie-cis_en', description: "US path | GeoIP TJ | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'tj', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM58', name: '@lingoEN-geo-tm-cookie-cis_en', description: "US path | GeoIP TM | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'tm', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM59', name: '@lingoEN-geo-uz-cookie-cis_en', description: "US path | GeoIP UZ | cookie=cis_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the cis_en row", path: '/', geoIp: 'uz', cookieValue: 'cis_en', uiExpectation: 'modal', recommendedRowPrefix: 'cis_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM60', name: '@lingoEN-geo-om-cookie-mena_en', description: 'US path | GeoIP OM | cookie=mena_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'om', cookieValue: 'mena_en', uiExpectation: 'modal', recommendedRowPrefix: 'mena_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM61', name: '@lingoEN-geo-ma-cookie-mena_en', description: "US path | GeoIP MA | cookie=mena_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the mena_en row (om already tested in RM60)", path: '/', geoIp: 'ma', cookieValue: 'mena_en', uiExpectation: 'modal', recommendedRowPrefix: 'mena_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM62', name: '@lingoEN-geo-lb-cookie-mena_en', description: "US path | GeoIP LB | cookie=mena_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the mena_en row", path: '/', geoIp: 'lb', cookieValue: 'mena_en', uiExpectation: 'modal', recommendedRowPrefix: 'mena_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM63', name: '@lingoEN-geo-jo-cookie-mena_en', description: "US path | GeoIP JO | cookie=mena_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the mena_en row", path: '/', geoIp: 'jo', cookieValue: 'mena_en', uiExpectation: 'modal', recommendedRowPrefix: 'mena_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM64', name: '@lingoEN-geo-iq-cookie-mena_en', description: "US path | GeoIP IQ | cookie=mena_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the mena_en row", path: '/', geoIp: 'iq', cookieValue: 'mena_en', uiExpectation: 'modal', recommendedRowPrefix: 'mena_en', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM65', name: '@lingoEN-geo-bh-cookie-mena_en', description: "US path | GeoIP BH | cookie=mena_en (English, lang=en) -> GeoIP not in root supportedRegions -> Modal -- additional supportedRegions coverage for the mena_en row (dz already tested separately via the priority-tiebreak scenario, PM3)", path: '/', geoIp: 'bh', cookieValue: 'mena_en', uiExpectation: 'modal', recommendedRowPrefix: 'mena_en', tags: '@lingo-en @us-path @modal' },

  // ─── Modal — Scenario 5  (no PREF-LANG match at all, multiple candidates compete) ──
  // All Modal rows above this section are Scenario 4 (self-referential: cookie's language always
  // finds a direct match), so none of them actually exercise the tie-break ranking even when the
  // GeoIP has multiple competing rows. There are exactly 4 GeoIPs, dataset-wide, where root does
  // NOT cover the GeoIP (so combo is unsupported) AND 2+ rows compete for it — every one is
  // covered below, using an unrelated-language cookie (`fi`/Finnish, which matches none of the
  // candidates) to force Scenario 5:

  { tcid: 'PM1', name: '@lingoEN-geo-ch-cookie-cn', description: 'US path | GeoIP CH | cookie=cn (no lang match for CH) -> regionPriorities ranks ch_de(1) > fr(2) > ch_it(3) -> Modal recommends ch_de', path: '/', geoIp: 'ch', cookieValue: 'cn', uiExpectation: 'modal', recommendedRowPrefix: 'ch_de', tags: '@lingo-en @us-path @modal @priority-tiebreak' },
  { tcid: 'PM2', name: '@lingoEN-geo-de-cookie-fi', description: 'US path | GeoIP DE | cookie=fi (no lang match for DE) -> no explicit priority, specificity tie-break ranks de(1 region) > tr(2 regions) -> Modal recommends de', path: '/', geoIp: 'de', cookieValue: 'fi', uiExpectation: 'modal', recommendedRowPrefix: 'de', tags: '@lingo-en @us-path @modal @priority-tiebreak' },
  { tcid: 'PM3', name: '@lingoEN-geo-dz-cookie-fi', description: 'US path | GeoIP DZ | cookie=fi (no lang match for DZ) -> no explicit priority, specificity tie-break ranks mena_ar(1 region) > mena_en(7 regions) -> Modal recommends mena_ar', path: '/', geoIp: 'dz', cookieValue: 'fi', uiExpectation: 'modal', recommendedRowPrefix: 'mena_ar', tags: '@lingo-en @us-path @modal @priority-tiebreak' },
  { tcid: 'PM4', name: '@lingoEN-geo-in-cookie-fi', description: 'US path | GeoIP IN | cookie=fi (no lang match for IN) -> in vs in_hi both cover 1 region -> Modal recommends in (confirmed live)', path: '/', geoIp: 'in', cookieValue: 'fi', uiExpectation: 'modal', recommendedRowPrefix: 'in', tags: '@lingo-en @us-path @modal @priority-tiebreak' },

  // ─── No Action — one row per distinct reason (not exhaustive) ─────────────────────────────

  { tcid: 'N1', name: '@lingoEN-geo-vn-cookie-none', description: 'US path | GeoIP VN | no cookie set (treated as US/EN default) -> matches PAGE-LANG (en)', path: '/', geoIp: 'vn', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-cookie @smoke' },
  { tcid: 'N2', name: '@lingoEN-geo-be-cookie-us', description: 'US path | GeoIP BE | cookie=us (English, explicit) -> matches PAGE-LANG (en), explicit-cookie code path not default-fallback', path: '/', geoIp: 'be', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N3', name: '@lingoEN-geo-eg-cookie-jp', description: 'US path | GeoIP EG | Japanese cookie, Egypt geo - Japanese has no market for Egypt', path: '/', geoIp: 'eg', cookieValue: 'jp', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N4', name: '@lingoEN-geo-hk-cookie-mena_ar', description: 'US path | GeoIP HK | Arabic cookie, Hong Kong geo - Arabic has no market for Hong Kong', path: '/', geoIp: 'hk', cookieValue: 'mena_ar', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N5', name: '@lingoEN-geo-il-cookie-cn', description: 'US path | GeoIP IL | Chinese cookie, Israel geo - Chinese has no market for Israel', path: '/', geoIp: 'il', cookieValue: 'cn', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N6', name: '@lingoEN-geo-qa-cookie-in_hi', description: 'US path | GeoIP QA | Hindi cookie, Qatar geo - Hindi has no market for Qatar', path: '/', geoIp: 'qa', cookieValue: 'in_hi', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N7', name: '@lingoEN-geo-my-cookie-ch_de', description: 'US path | GeoIP MY | Swiss-German cookie, Malaysia geo - tests a compound/sub-locale prefix as cookie source', path: '/', geoIp: 'my', cookieValue: 'ch_de', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N8', name: '@lingoEN-geo-th-cookie-es', description: 'US path | GeoIP TH | Spanish cookie, Thailand geo - Spanish has no market for Thailand', path: '/', geoIp: 'th', cookieValue: 'es', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },

  // ─── Full coverage of root's own 22 GeoIP regions — these 6 have NO alternate-language row
  // No Action, regardless of cookie — own-cookie (own region/language) tested here as the
  // simplest case, matching the reason-based convention already used above.
  { tcid: 'N9', name: '@lingoEN-geo-ie-cookie-ie', description: 'US path | GeoIP IE | cookie=ie (English, lang=en) -> IE has no alternate-language row -> No Action only possible outcome', path: '/', geoIp: 'ie', cookieValue: 'ie', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-alternate-row' },
  { tcid: 'N10', name: '@lingoEN-geo-nz-cookie-nz', description: 'US path | GeoIP NZ | cookie=nz (English, lang=en) -> NZ has no alternate-language row -> No Action only possible outcome', path: '/', geoIp: 'nz', cookieValue: 'nz', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-alternate-row' },
  { tcid: 'N11', name: '@lingoEN-geo-ng-cookie-ng', description: 'US path | GeoIP NG | cookie=ng (English, lang=en) -> NG has no alternate-language row -> No Action only possible outcome', path: '/', geoIp: 'ng', cookieValue: 'ng', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-alternate-row' },
  { tcid: 'N12', name: '@lingoEN-geo-sg-cookie-sg', description: 'US path | GeoIP SG | cookie=sg (English, lang=en) -> SG has no alternate-language row -> No Action only possible outcome', path: '/', geoIp: 'sg', cookieValue: 'sg', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-alternate-row' },
  { tcid: 'N13', name: '@lingoEN-geo-za-cookie-za', description: 'US path | GeoIP ZA | cookie=za (English, lang=en) -> ZA has no alternate-language row -> No Action only possible outcome', path: '/', geoIp: 'za', cookieValue: 'za', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-alternate-row' },
  { tcid: 'N14', name: '@lingoEN-geo-us-cookie-us', description: 'US path | GeoIP US | cookie=us (English, lang=en) -> the base site itself -> No Action only possible outcome', path: '/', geoIp: 'us', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-no-alternate-row' },

];

/**
 * Root-redirect checks — the 21 locale path prefixes below correspond exactly to
 * root's shrunk `supportedRegions` list (22 entries minus `us` itself). Confirmed live via curl:
 * each 301-redirects to `/` (e.g. `/be_en/` -> `https://www.stage.adobe.com/`), not a client-side
 * "same URL, default content" behavior. Sourced from data/feds-lnav-locales.js so this list stays
 * in sync with the repo's other locale-path tooling rather than being a second hand-typed list.
 */
export const lingoEnRootRedirectFeatures = [
  { tcid: 'R1', name: '@lingoEN-redirect-il_en-to-root', path: '/il_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R2', name: '@lingoEN-redirect-ae_en-to-root', path: '/ae_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R3', name: '@lingoEN-redirect-sa_en-to-root', path: '/sa_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R4', name: '@lingoEN-redirect-vn_en-to-root', path: '/vn_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R5', name: '@lingoEN-redirect-ca-to-root', path: '/ca/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R6', name: '@lingoEN-redirect-th_en-to-root', path: '/th_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R7', name: '@lingoEN-redirect-ph_en-to-root', path: '/ph_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R8', name: '@lingoEN-redirect-id_en-to-root', path: '/id_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R9', name: '@lingoEN-redirect-be_en-to-root', path: '/be_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R10', name: '@lingoEN-redirect-gr_en-to-root', path: '/gr_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R11', name: '@lingoEN-redirect-hk_en-to-root', path: '/hk_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R12', name: '@lingoEN-redirect-ie-to-root', path: '/ie/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R13', name: '@lingoEN-redirect-lu_en-to-root', path: '/lu_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R14', name: '@lingoEN-redirect-nz-to-root', path: '/nz/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R15', name: '@lingoEN-redirect-sg-to-root', path: '/sg/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R16', name: '@lingoEN-redirect-my_en-to-root', path: '/my_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R17', name: '@lingoEN-redirect-ng-to-root', path: '/ng/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R18', name: '@lingoEN-redirect-qa_en-to-root', path: '/qa_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R19', name: '@lingoEN-redirect-eg_en-to-root', path: '/eg_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R20', name: '@lingoEN-redirect-za-to-root', path: '/za/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R21', name: '@lingoEN-redirect-kw_en-to-root', path: '/kw_en/', tags: '@lingo-en @root-redirect' },
];

/**
 * All 4 rows target `ph` (Philippines, confirmed ₱ pricing) rather than `mx` — an earlier version
 * of this spec used `mx`, which is NOT in root's supportedRegions, so it always
 * showed US$ base-fallback regardless of the `country` param — that was testing the unsupported-
 * market fallback rule, not the priority mechanism itself. `ph` IS root-supported, so it correctly
 * exercises the actual priority chain.
 */
export const lingoEnPricingPriorityFeatures = [
  {
    tcid: 'P1',
    name: '@lingoEN-priority-country-param-only',
    description: 'country=ph param only, no akamaiLocale -> country param determines region -> PHP pricing',
    path: '/',
    countryParam: 'ph',
    expectedMarketPrefix: 'ph_fil',
    tags: '@lingo-en @pricing-priority',
  },
  {
    tcid: 'P2',
    name: '@lingoEN-priority-country-param-over-akamai',
    description: 'akamaiLocale=jp + country=ph -> country param wins over akamaiLocale -> PHP not JPY',
    path: '/',
    geoIp: 'jp',
    countryParam: 'ph',
    expectedMarketPrefix: 'ph_fil',
    tags: '@lingo-en @pricing-priority',
  },
  {
    tcid: 'P3',
    name: '@lingoEN-priority-country-param-over-cookie',
    description: 'country cookie=il + akamaiLocale=il + country param=ph -> country param wins over country cookie -> PHP not NIS',
    path: '/',
    geoIp: 'il',
    countryCookie: 'il',
    countryParam: 'ph',
    expectedMarketPrefix: 'ph_fil',
    tags: '@lingo-en @pricing-priority',
  },
  {
    tcid: 'P4',
    name: '@lingoEN-priority-country-param-over-everything',
    description: 'international cookie=sg + country cookie=ng + akamaiLocale=kw + country param=ph -> country param wins over ALL other signals -> PHP not SGD/NGN/KWD',
    path: '/',
    geoIp: 'kw',
    internationalCookie: 'sg',
    countryCookie: 'ng',
    countryParam: 'ph',
    expectedMarketPrefix: 'ph_fil',
    tags: '@lingo-en @pricing-priority',
  },
];
