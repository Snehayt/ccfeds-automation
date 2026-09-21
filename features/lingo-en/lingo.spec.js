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

  // ─── Banner — rows that were Modal before root's supportedRegions expanded from 22 to 82
  // (root now covers these GeoIPs directly, flipping the outcome from Modal to Banner) ───────
  { tcid: 'B19', name: '@lingoEN-geo-es-cookie-es', description: 'US path | GeoIP ES | cookie=es (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'es', cookieValue: 'es', uiExpectation: 'banner', recommendedRowPrefix: 'es', tags: '@lingo-en @us-path' },
  { tcid: 'B20', name: '@lingoEN-geo-fr-cookie-fr', description: 'US path | GeoIP FR | cookie=fr (Français, lang=fr) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'fr', cookieValue: 'fr', uiExpectation: 'banner', recommendedRowPrefix: 'fr', tags: '@lingo-en @us-path' },
  { tcid: 'B21', name: '@lingoEN-geo-de-cookie-de', description: 'US path | GeoIP DE | cookie=de (Deutsch, lang=de) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'de', cookieValue: 'de', uiExpectation: 'banner', recommendedRowPrefix: 'de', tags: '@lingo-en @us-path' },
  { tcid: 'B22', name: '@lingoEN-geo-tr-cookie-tr', description: 'US path | GeoIP TR | cookie=tr (Turkish, lang=tr) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'tr', cookieValue: 'tr', uiExpectation: 'banner', recommendedRowPrefix: 'tr', tags: '@lingo-en @us-path' },
  { tcid: 'B23', name: '@lingoEN-geo-nl-cookie-nl', description: 'US path | GeoIP NL | cookie=nl (Dutch, lang=nl) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'nl', cookieValue: 'nl', uiExpectation: 'banner', recommendedRowPrefix: 'nl', tags: '@lingo-en @us-path' },
  { tcid: 'B24', name: '@lingoEN-geo-it-cookie-it', description: 'US path | GeoIP IT | cookie=it (Italian, lang=it) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'it', cookieValue: 'it', uiExpectation: 'banner', recommendedRowPrefix: 'it', tags: '@lingo-en @us-path' },
  { tcid: 'B25', name: '@lingoEN-geo-pt-cookie-pt', description: 'US path | GeoIP PT | cookie=pt (Português, lang=pt) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'pt', cookieValue: 'pt', uiExpectation: 'banner', recommendedRowPrefix: 'pt', tags: '@lingo-en @us-path' },
  { tcid: 'B26', name: '@lingoEN-geo-ro-cookie-ro', description: 'US path | GeoIP RO | cookie=ro (Româna, lang=ro) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ro', cookieValue: 'ro', uiExpectation: 'banner', recommendedRowPrefix: 'ro', tags: '@lingo-en @us-path' },
  { tcid: 'B27', name: '@lingoEN-geo-bg-cookie-bg', description: 'US path | GeoIP BG | cookie=bg (Български, lang=bg) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'bg', cookieValue: 'bg', uiExpectation: 'banner', recommendedRowPrefix: 'bg', tags: '@lingo-en @us-path' },
  { tcid: 'B28', name: '@lingoEN-geo-cz-cookie-cz', description: 'US path | GeoIP CZ | cookie=cz (Čeština, lang=cs) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'cz', cookieValue: 'cz', uiExpectation: 'banner', recommendedRowPrefix: 'cz', tags: '@lingo-en @us-path' },
  { tcid: 'B29', name: '@lingoEN-geo-dk-cookie-dk', description: 'US path | GeoIP DK | cookie=dk (Dansk, lang=da) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'dk', cookieValue: 'dk', uiExpectation: 'banner', recommendedRowPrefix: 'dk', tags: '@lingo-en @us-path' },
  { tcid: 'B30', name: '@lingoEN-geo-ee-cookie-ee', description: 'US path | GeoIP EE | cookie=ee (Eesti, lang=et) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ee', cookieValue: 'ee', uiExpectation: 'banner', recommendedRowPrefix: 'ee', tags: '@lingo-en @us-path' },
  { tcid: 'B31', name: '@lingoEN-geo-fi-cookie-fi', description: 'US path | GeoIP FI | cookie=fi (Suomi, lang=fi) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'fi', cookieValue: 'fi', uiExpectation: 'banner', recommendedRowPrefix: 'fi', tags: '@lingo-en @us-path' },
  { tcid: 'B32', name: '@lingoEN-geo-in-cookie-in_hi', description: 'US path | GeoIP IN | cookie=in_hi (हिंदी, lang=hi) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'in', cookieValue: 'in_hi', uiExpectation: 'banner', recommendedRowPrefix: 'in_hi', tags: '@lingo-en @us-path' },
  { tcid: 'B33', name: '@lingoEN-geo-hu-cookie-hu', description: 'US path | GeoIP HU | cookie=hu (magyar, lang=hu) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'hu', cookieValue: 'hu', uiExpectation: 'banner', recommendedRowPrefix: 'hu', tags: '@lingo-en @us-path' },
  { tcid: 'B34', name: '@lingoEN-geo-jp-cookie-jp', description: 'US path | GeoIP JP | cookie=jp (日本語, lang=ja) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'jp', cookieValue: 'jp', uiExpectation: 'banner', recommendedRowPrefix: 'jp', tags: '@lingo-en @us-path' },
  { tcid: 'B35', name: '@lingoEN-geo-kr-cookie-kr', description: 'US path | GeoIP KR | cookie=kr (한국어, lang=ko) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'kr', cookieValue: 'kr', uiExpectation: 'banner', recommendedRowPrefix: 'kr', tags: '@lingo-en @us-path' },
  { tcid: 'B36', name: '@lingoEN-geo-lv-cookie-lv', description: 'US path | GeoIP LV | cookie=lv (Latviešu, lang=lv) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'lv', cookieValue: 'lv', uiExpectation: 'banner', recommendedRowPrefix: 'lv', tags: '@lingo-en @us-path' },
  { tcid: 'B37', name: '@lingoEN-geo-lt-cookie-lt', description: 'US path | GeoIP LT | cookie=lt (Lietuvių, lang=lt) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'lt', cookieValue: 'lt', uiExpectation: 'banner', recommendedRowPrefix: 'lt', tags: '@lingo-en @us-path' },
  { tcid: 'B38', name: '@lingoEN-geo-no-cookie-no', description: 'US path | GeoIP NO | cookie=no (Norsk, lang=no) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'no', cookieValue: 'no', uiExpectation: 'banner', recommendedRowPrefix: 'no', tags: '@lingo-en @us-path' },
  { tcid: 'B39', name: '@lingoEN-geo-pl-cookie-pl', description: 'US path | GeoIP PL | cookie=pl (Polska, lang=pl) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'pl', cookieValue: 'pl', uiExpectation: 'banner', recommendedRowPrefix: 'pl', tags: '@lingo-en @us-path' },
  { tcid: 'B40', name: '@lingoEN-geo-br-cookie-br', description: 'US path | GeoIP BR | cookie=br (Português BR, lang=pt) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'br', cookieValue: 'br', uiExpectation: 'banner', recommendedRowPrefix: 'br', tags: '@lingo-en @us-path' },
  { tcid: 'B41', name: '@lingoEN-geo-sk-cookie-sk', description: 'US path | GeoIP SK | cookie=sk (Slovenčina, lang=sk) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'sk', cookieValue: 'sk', uiExpectation: 'banner', recommendedRowPrefix: 'sk', tags: '@lingo-en @us-path' },
  { tcid: 'B42', name: '@lingoEN-geo-si-cookie-si', description: 'US path | GeoIP SI | cookie=si (Slovenščina, lang=sl) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'si', cookieValue: 'si', uiExpectation: 'banner', recommendedRowPrefix: 'si', tags: '@lingo-en @us-path' },
  { tcid: 'B43', name: '@lingoEN-geo-se-cookie-se', description: 'US path | GeoIP SE | cookie=se (Svenska, lang=sv) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'se', cookieValue: 'se', uiExpectation: 'banner', recommendedRowPrefix: 'se', tags: '@lingo-en @us-path' },
  { tcid: 'B44', name: '@lingoEN-geo-ua-cookie-ua', description: 'US path | GeoIP UA | cookie=ua (Українські, lang=uk) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ua', cookieValue: 'ua', uiExpectation: 'banner', recommendedRowPrefix: 'ua', tags: '@lingo-en @us-path' },
  { tcid: 'B45', name: '@lingoEN-geo-dz-cookie-mena_ar', description: 'US path | GeoIP DZ | cookie=mena_ar (العربية, lang=ar) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'dz', cookieValue: 'mena_ar', uiExpectation: 'banner', recommendedRowPrefix: 'mena_ar', tags: '@lingo-en @us-path' },
  { tcid: 'B46', name: '@lingoEN-geo-ar-cookie-ar', description: 'US path | GeoIP AR | cookie=ar (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ar', cookieValue: 'ar', uiExpectation: 'banner', recommendedRowPrefix: 'ar', tags: '@lingo-en @us-path' },
  { tcid: 'B47', name: '@lingoEN-geo-cl-cookie-cl', description: 'US path | GeoIP CL | cookie=cl (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'cl', cookieValue: 'cl', uiExpectation: 'banner', recommendedRowPrefix: 'cl', tags: '@lingo-en @us-path' },
  { tcid: 'B48', name: '@lingoEN-geo-co-cookie-co', description: 'US path | GeoIP CO | cookie=co (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'co', cookieValue: 'co', uiExpectation: 'banner', recommendedRowPrefix: 'co', tags: '@lingo-en @us-path' },
  { tcid: 'B49', name: '@lingoEN-geo-cr-cookie-cr', description: 'US path | GeoIP CR | cookie=cr (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'cr', cookieValue: 'cr', uiExpectation: 'banner', recommendedRowPrefix: 'cr', tags: '@lingo-en @us-path' },
  { tcid: 'B50', name: '@lingoEN-geo-ec-cookie-ec', description: 'US path | GeoIP EC | cookie=ec (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ec', cookieValue: 'ec', uiExpectation: 'banner', recommendedRowPrefix: 'ec', tags: '@lingo-en @us-path' },
  { tcid: 'B51', name: '@lingoEN-geo-gt-cookie-gt', description: 'US path | GeoIP GT | cookie=gt (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'gt', cookieValue: 'gt', uiExpectation: 'banner', recommendedRowPrefix: 'gt', tags: '@lingo-en @us-path' },
  { tcid: 'B52', name: '@lingoEN-geo-mx-cookie-mx', description: 'US path | GeoIP MX | cookie=mx (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'mx', cookieValue: 'mx', uiExpectation: 'banner', recommendedRowPrefix: 'mx', tags: '@lingo-en @us-path' },
  { tcid: 'B53', name: '@lingoEN-geo-pr-cookie-pr', description: 'US path | GeoIP PR | cookie=pr (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'pr', cookieValue: 'pr', uiExpectation: 'banner', recommendedRowPrefix: 'pr', tags: '@lingo-en @us-path' },
  { tcid: 'B54', name: '@lingoEN-geo-pe-cookie-pe', description: 'US path | GeoIP PE | cookie=pe (Español, lang=es) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'pe', cookieValue: 'pe', uiExpectation: 'banner', recommendedRowPrefix: 'pe', tags: '@lingo-en @us-path' },
  { tcid: 'B55', name: '@lingoEN-geo-at-cookie-at', description: 'US path | GeoIP AT | cookie=at (Deutsch, lang=de) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'at', cookieValue: 'at', uiExpectation: 'banner', recommendedRowPrefix: 'at', tags: '@lingo-en @us-path' },
  { tcid: 'B56', name: '@lingoEN-geo-ch-cookie-ch_de', description: 'US path | GeoIP CH | cookie=ch_de (Deutsch, lang=de) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ch', cookieValue: 'ch_de', uiExpectation: 'banner', recommendedRowPrefix: 'ch_de', tags: '@lingo-en @us-path' },
  { tcid: 'B57', name: '@lingoEN-geo-ch-cookie-ch_it', description: 'US path | GeoIP CH | cookie=ch_it (Italian, lang=it) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'ch', cookieValue: 'ch_it', uiExpectation: 'banner', recommendedRowPrefix: 'ch_it', tags: '@lingo-en @us-path' },
  { tcid: 'B58', name: '@lingoEN-geo-tw-cookie-tw', description: 'US path | GeoIP TW | cookie=tw (繁體中文, lang=zh) -> GeoIP directly supported by root now -> Banner', path: '/', geoIp: 'tw', cookieValue: 'tw', uiExpectation: 'banner', recommendedRowPrefix: 'tw', tags: '@lingo-en @us-path' },

  // ─── Modal (Scenario 4/5) — page+geo combo NOT supported, geo covered elsewhere ────────────
  // Root's supportedRegions expanded from 22 to 82 entries (live JSON update) — every GeoIP that
  // used to trigger Modal is now directly covered by root (flipped to Banner, see B19-B58 above,
  // or to None, see N15-N22 below) EXCEPT `ru` and `cn`, the only 2 GeoIPs left anywhere in the
  // dataset that root still doesn't cover. No tie-break (Scenario 5) rows remain — every GeoIP
  // that used to have 2+ competing candidates is now root-covered too, collapsing the tie-break
  // before it can trigger (confirmed via computeExpectedUi against the live JSON).

  { tcid: 'RM1', name: '@lingoEN-geo-ru-cookie-ru', description: 'US path | GeoIP RU | cookie=ru (Russian, lang=ru) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'ru', cookieValue: 'ru', uiExpectation: 'modal', recommendedRowPrefix: 'ru', tags: '@lingo-en @us-path @modal' },
  { tcid: 'RM2', name: '@lingoEN-geo-cn-cookie-cn', description: 'US path | GeoIP CN | cookie=cn (简体中文, lang=zh) -> GeoIP not in root supportedRegions -> Modal', path: '/', geoIp: 'cn', cookieValue: 'cn', uiExpectation: 'modal', recommendedRowPrefix: 'cn', tags: '@lingo-en @us-path @modal' },

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

  // ─── No Action — rows that were Modal before root's supportedRegions expanded (root now
  // covers these GeoIPs directly, but the cookie's language no longer matches any row covering
  // that GeoIP, so the outcome is None rather than Banner) ──────────────────────────────────
  { tcid: 'N15', name: '@lingoEN-geo-de-cookie-tr', description: 'US path | GeoIP DE | cookie=tr -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'de', cookieValue: 'tr', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N16', name: '@lingoEN-geo-au-cookie-au', description: 'US path | GeoIP AU | cookie=au -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'au', cookieValue: 'au', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N17', name: '@lingoEN-geo-in-cookie-in', description: 'US path | GeoIP IN | cookie=in -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'in', cookieValue: 'in', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N18', name: '@lingoEN-geo-gb-cookie-uk', description: 'US path | GeoIP GB | cookie=uk -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'gb', cookieValue: 'uk', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N19', name: '@lingoEN-geo-ch-cookie-cn', description: 'US path | GeoIP CH | cookie=cn -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'ch', cookieValue: 'cn', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N20', name: '@lingoEN-geo-de-cookie-fi', description: 'US path | GeoIP DE | cookie=fi -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'de', cookieValue: 'fi', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N21', name: '@lingoEN-geo-dz-cookie-fi', description: 'US path | GeoIP DZ | cookie=fi -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'dz', cookieValue: 'fi', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },
  { tcid: 'N22', name: '@lingoEN-geo-in-cookie-fi', description: 'US path | GeoIP IN | cookie=fi -> GeoIP directly supported by root now, cookie language no longer matches any row covering this GeoIP -> No Action', path: '/', geoIp: 'in', cookieValue: 'fi', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-language-mismatch' },

  // ─── africa / cis_en / mena_en sub-locale GeoIPs — these countries are covered by root's own
  // supportedRegions directly (no dedicated per-country row), so cookie=us (matches PAGE-LANG en)
  // -> No Action; the point of these rows is the PRICING check, confirmed live per-country (NOT
  // uniformly US$ across mena_en — om/ma/jo/bh show their own real local currency, see
  // ROOT_SUPPORTED_GEO_PRICE_SYMBOL).
  { tcid: 'N23', name: '@lingoEN-geo-mu-cookie-us', description: 'US path | GeoIP MU (africa) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'mu', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N24', name: '@lingoEN-geo-ke-cookie-us', description: 'US path | GeoIP KE (africa) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'ke', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N25', name: '@lingoEN-geo-gh-cookie-us', description: 'US path | GeoIP GH (africa) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'gh', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N26', name: '@lingoEN-geo-tz-cookie-us', description: 'US path | GeoIP TZ (africa) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'tz', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N27', name: '@lingoEN-geo-am-cookie-us', description: 'US path | GeoIP AM (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'am', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N28', name: '@lingoEN-geo-az-cookie-us', description: 'US path | GeoIP AZ (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'az', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N29', name: '@lingoEN-geo-ge-cookie-us', description: 'US path | GeoIP GE (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'ge', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N30', name: '@lingoEN-geo-md-cookie-us', description: 'US path | GeoIP MD (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'md', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N31', name: '@lingoEN-geo-kz-cookie-us', description: 'US path | GeoIP KZ (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'kz', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N32', name: '@lingoEN-geo-kg-cookie-us', description: 'US path | GeoIP KG (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'kg', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N33', name: '@lingoEN-geo-tj-cookie-us', description: 'US path | GeoIP TJ (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'tj', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N34', name: '@lingoEN-geo-tm-cookie-us', description: 'US path | GeoIP TM (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'tm', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N35', name: '@lingoEN-geo-uz-cookie-us', description: 'US path | GeoIP UZ (cis_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'uz', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N36', name: '@lingoEN-geo-om-cookie-us', description: 'US path | GeoIP OM (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked, real local currency (Omani Rial, RO) not US$', path: '/', geoIp: 'om', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N37', name: '@lingoEN-geo-ma-cookie-us', description: 'US path | GeoIP MA (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked, real local currency (Moroccan Dirham, DH) not US$', path: '/', geoIp: 'ma', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N38', name: '@lingoEN-geo-lb-cookie-us', description: 'US path | GeoIP LB (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'lb', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N39', name: '@lingoEN-geo-jo-cookie-us', description: 'US path | GeoIP JO (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked, real local currency (Jordanian Dinar, JD) not US$', path: '/', geoIp: 'jo', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N40', name: '@lingoEN-geo-iq-cookie-us', description: 'US path | GeoIP IQ (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'iq', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N41', name: '@lingoEN-geo-dz-cookie-us', description: 'US path | GeoIP DZ (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked', path: '/', geoIp: 'dz', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },
  { tcid: 'N42', name: '@lingoEN-geo-bh-cookie-us', description: 'US path | GeoIP BH (mena_en) | cookie=us (English, explicit) -> matches PAGE-LANG (en) -> No Action; pricing checked, real local currency (Bahraini Dinar, BD) not US$', path: '/', geoIp: 'bh', cookieValue: 'us', uiExpectation: 'none', tags: '@lingo-en @us-path @no-action-reason-explicit-en-cookie' },

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

  // ─── Umbrella-site redirects — these prefixes no longer have their own row in
  // supported-markets.json (removed from the live JSON), but the path itself still needs to
  // redirect back to the base page (e.g. /africa/creativecloud.html -> /creativecloud.html).
  { tcid: 'R22', name: '@lingoEN-redirect-africa-to-root', path: '/africa/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R23', name: '@lingoEN-redirect-cis_en-to-root', path: '/cis_en/', tags: '@lingo-en @root-redirect' },
  { tcid: 'R24', name: '@lingoEN-redirect-mena_en-to-root', path: '/mena_en/', tags: '@lingo-en @root-redirect' },
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

/**
 * Footer "Choose your region" (#langnav) picker — africa/cis_en/mena_en umbrella-market
 * sub-locales. These countries have no dedicated page, so selecting one from the modal redirects
 * back to the base US page rather than a country-specific path. Confirmed live on stage:
 *   - international cookie is set to 'us' (not the country's own prefix — there is none)
 *   - country cookie is set to the country's own GeoIP code
 *   - pricing shown is NOT uniformly US$ — mena_en's Oman/Morocco/Jordan/Bahrain show their own
 *     real local currency (see ROOT_SUPPORTED_GEO_PRICE_SYMBOL in selectors/lingo-en/lingo.page.js)
 */
export const lingoEnRegionPickerFeatures = [
  { tcid: 'RP1', name: '@lingoEN-regionpicker-mu', label: 'Mauritius', geoCode: 'mu', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP2', name: '@lingoEN-regionpicker-ke', label: 'Kenya', geoCode: 'ke', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP3', name: '@lingoEN-regionpicker-gh', label: 'Ghana', geoCode: 'gh', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP4', name: '@lingoEN-regionpicker-tz', label: 'Tanzania', geoCode: 'tz', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP5', name: '@lingoEN-regionpicker-am', label: 'Armenia', geoCode: 'am', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP6', name: '@lingoEN-regionpicker-az', label: 'Azerbaijan', geoCode: 'az', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP7', name: '@lingoEN-regionpicker-ge', label: 'Georgia', geoCode: 'ge', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP8', name: '@lingoEN-regionpicker-md', label: 'Moldova', geoCode: 'md', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP9', name: '@lingoEN-regionpicker-kz', label: 'Kazakhstan', geoCode: 'kz', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP10', name: '@lingoEN-regionpicker-kg', label: 'Kyrgyzstan', geoCode: 'kg', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP11', name: '@lingoEN-regionpicker-tj', label: 'Tajikistan', geoCode: 'tj', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP12', name: '@lingoEN-regionpicker-tm', label: 'Turkmenistan', geoCode: 'tm', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP13', name: '@lingoEN-regionpicker-uz', label: 'Uzbekistan', geoCode: 'uz', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP14', name: '@lingoEN-regionpicker-om', label: 'Oman', geoCode: 'om', expectedSymbol: 'RO', tags: '@lingo-en @region-picker' },
  { tcid: 'RP15', name: '@lingoEN-regionpicker-ma', label: 'Morocco', geoCode: 'ma', expectedSymbol: 'DH', tags: '@lingo-en @region-picker' },
  { tcid: 'RP16', name: '@lingoEN-regionpicker-lb', label: 'Lebanon', geoCode: 'lb', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP17', name: '@lingoEN-regionpicker-jo', label: 'Jordan', geoCode: 'jo', expectedSymbol: 'JD', tags: '@lingo-en @region-picker' },
  { tcid: 'RP18', name: '@lingoEN-regionpicker-iq', label: 'Iraq', geoCode: 'iq', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP19', name: '@lingoEN-regionpicker-dz', label: 'Algeria', geoCode: 'dz', expectedSymbol: 'US$', tags: '@lingo-en @region-picker' },
  { tcid: 'RP20', name: '@lingoEN-regionpicker-bh', label: 'Bahrain', geoCode: 'bh', expectedSymbol: 'BD', tags: '@lingo-en @region-picker' },
];
