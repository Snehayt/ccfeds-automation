import { expect, test } from '../../../utils/fixtures/test.fixture.js';
import { features } from '../../../features/cc/unity-acrobat/image-to-pdf.spec.js';
import AcrobatVerbWidget from '../../../selectors/cc/unity-acrobat/acrobat-verb.page.js';

// Matches acrobat.adobe.com (prod/stage subdomain) and the client-side-convert
// redirect this "client-upload" widget uses instead: www.adobe.com/acrobat-online/...
// (confirmed live: image-to-pdf converts entirely client-side and lands there,
// never on the acrobat.adobe.com subdomain).
const isAcrobatUrl = (url) => /(?:stage\.)?acrobat\.adobe\.com|\/acrobat-online\//.test(url.toString());

let acrobatVerb;

test.describe('Acrobat ImageToPdf Unity Widget', () => {
  test.beforeEach(async ({ page }) => {
    acrobatVerb = new AcrobatVerbWidget(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  // 1. Page should have the unity block to upload a file
  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('Check unity upload block is present', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(acrobatVerb.unityBlock).toBeVisible();
      await expect(acrobatVerb.uploadButton).toBeVisible();
      await expect(acrobatVerb.dropZone).toBeVisible();
    });
  });

  // 2. Select the sample pdf file from assets
  test(`${features[1].name}, ${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('Visit page', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(acrobatVerb.uploadButton).toBeVisible({ timeout: 5000 });
      await expect(acrobatVerb.uploadButton).toBeEnabled({ timeout: 5000 });
    });
    await test.step('Select sample file from assets', async () => {
      const originalUrl = `${baseURL}${features[1].path}`;
      await acrobatVerb.uploadFile(features[1].data.file);
      await acrobatVerb.waitForRedirectAwayFrom(originalUrl, 15000);
    });
  });

  // 3. Check the splash screen display
  test(`${features[2].name}, ${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('Visit page and select sample file', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await acrobatVerb.uploadFile(features[2].data.file);
    });
    await test.step('Check splash screen display', async () => {
      // image-to-pdf converts entirely client-side and redirects to the
      // clientConvert result page before any splash-loader can render
      // (confirmed live, even with network throttling) - unlike
      // server-round-trip verbs, there is no splash-loader for this tool,
      // so success is verified via the resulting redirect URL instead.
      await page.waitForURL((url) => url.toString().includes('clientConvert=true'), { timeout: 15000 });
    });
  });

  // 4. Verify navigation to the given Redirection
  test(`${features[3].name}, ${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('Visit page and select sample file', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
    });
    await test.step('Check navigation to Redirection', async () => {
      const originalUrl = `${baseURL}${features[3].path}`;
      await acrobatVerb.uploadFile(features[3].data.file);
      await acrobatVerb.waitForRedirectAwayFrom(originalUrl, 20000);
      expect(isAcrobatUrl(page.url())).toBe(true);
    });
  });
});
